import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloating from './components/WhatsAppFloating.jsx';
import QuoteModal from './components/QuoteModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';

import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NewArrivalsPage from './pages/NewArrivalsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OrderConfigurePage from './pages/OrderConfigurePage.jsx';

import initialCatalog from './data/initialCatalog.json';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParam, setCurrentParam] = useState(null);

  const CATALOG_VERSION = 'madhuram-35-v3';
  const [categories, setCategories] = useState(() => {
    const enabledProds = (initialCatalog.products || []).filter((p) => p.enabled !== false);
    return (initialCatalog.categories || []).filter(
      (c) => c.enabled !== false && enabledProds.some((p) => p.categoryId === c.id)
    );
  });
  const [products, setProducts] = useState(() =>
    (initialCatalog.products || []).filter((p) => p.enabled !== false)
  );
  const [promotions, setPromotions] = useState(() => {
    try {
      const saved = localStorage.getItem('prz_custom_promotions');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('prz_custom_settings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Persistent multi-product Order Configurator cart summary
  const [orderItems, setOrderItems] = useState(() => {
    try {
      const saved = localStorage.getItem('prz_order_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleOrderItemsChange = (nextItems) => {
    setOrderItems(nextItems);
    try {
      localStorage.setItem('prz_order_items', JSON.stringify(nextItems));
    } catch {}
  };

  // Global Quote Modal & Cart Drawer State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalProduct, setQuoteModalProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(null);

  const handleAddToCart = (product, customItem = null) => {
    if (!product && !customItem) return;
    let newItem = customItem;
    if (!newItem && product) {
      const pc = product.pricingConfig || {};
      const qty = Number(product.minQuantity || pc.minQuantity || pc.packSize || 100);
      const packSize = Number(pc.packSize || product.minQuantity || qty);
      const unitName = pc.unitName || 'Units';
      const startingTotal = pc.startingPrice
        ? Number(pc.startingPrice)
        : (product.baseRate ? Math.round(Number(product.baseRate) * qty) : 0);
      const hasPrice = startingTotal > 0;
      const unitPrice = hasPrice ? Math.round((startingTotal / qty) * 100) / 100 : 0;
      const specs = [];
      if (Array.isArray(product.materials) && product.materials[0]) {
        specs.push({ label: 'Material', value: product.materials[0] });
      }
      if (Array.isArray(product.standardSizes) && product.standardSizes[0]) {
        specs.push({ label: 'Size', value: product.standardSizes[0] });
      }
      if (Array.isArray(product.finishes) && product.finishes[0]) {
        specs.push({ label: 'Finish', value: product.finishes[0] });
      }
      newItem = {
        lineId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        categoryName: product.categoryName || 'Printing',
        image: product.image || '',
        quantity: qty,
        packSize,
        unitName,
        hasPrice,
        unitPrice,
        totalAmount: startingTotal,
        specs
      };
    }
    const next = [...orderItems, newItem];
    handleOrderItemsChange(next);
    setCartToast(newItem.productName);
    setTimeout(() => {
      setCartToast((prev) => (prev === newItem.productName ? null : prev));
    }, 3200);
  };

  const refreshCatalog = async () => {
    try {
      const [catRes, prodRes, promoRes, setRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/promotions').catch(() => null),
        fetch('/api/settings').catch(() => null)
      ]);
      if (promoRes?.ok) {
        const promoJson = await promoRes.json();
        if (promoJson.success && promoJson.data) setPromotions(promoJson.data);
      }
      if (setRes?.ok) {
        const setJson = await setRes.json();
        if (setJson.success && setJson.data) setSettings(setJson.data);
      }
      if (catRes.ok && prodRes.ok) {
        const [catJson, prodJson] = await Promise.all([
          catRes.json(),
          prodRes.json()
        ]);
        const liveProds = prodJson.success ? prodJson.data : products;
        if (prodJson.success) setProducts(liveProds);
        if (catJson.success) {
          setCategories(
            catJson.data.filter((c) => liveProds.some((p) => p.categoryId === c.id))
          );
        }
        return;
      }
      throw new Error('Static fallback');
    } catch {
      try {
        const saved = localStorage.getItem('prz_custom_catalog');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.version === CATALOG_VERSION) {
            const enabledProds = Array.isArray(parsed.products)
              ? parsed.products.filter((p) => p.enabled !== false)
              : [];
            if (Array.isArray(parsed.products)) {
              setProducts(enabledProds);
            }
            if (Array.isArray(parsed.categories)) {
              setCategories(
                parsed.categories
                  .filter((c) => c.enabled !== false && enabledProds.some((p) => p.categoryId === c.id))
                  .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
              );
            }
          } else {
            localStorage.removeItem('prz_custom_catalog');
          }
        }
        const savedPromos = localStorage.getItem('prz_custom_promotions');
        if (savedPromos) setPromotions(JSON.parse(savedPromos));
        const savedSettings = localStorage.getItem('prz_custom_settings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    refreshCatalog();
  }, []);

  // Universal Path & Hash Router listener (handles both /admin and /#admin)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const path = window.location.pathname.replace(/^\//, '');

      // Check admin first
      if (path === 'admin' || hash === 'admin' || hash.startsWith('admin')) {
        setCurrentPage('admin');
        setCurrentParam(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const active = hash || path;

      if (!active || active === 'home') {
        setCurrentPage('home');
        setCurrentParam(null);
      } else if (active === 'categories') {
        setCurrentPage('categories');
        setCurrentParam(null);
      } else if (active === 'new-arrivals') {
        setCurrentPage('new-arrivals');
        setCurrentParam(null);
      } else if (active.startsWith('category/') || active.startsWith('categories/')) {
        setCurrentPage('category');
        const catSlug = active.replace(/^(category|categories)\//, '').split('/')[0];
        setCurrentParam(catSlug);
      } else if (active.startsWith('product/') || active.startsWith('products/')) {
        setCurrentPage('product');
        const prodSlug = active.replace(/^(product|products)\//, '').split('/')[0];
        setCurrentParam(prodSlug);
      } else if (active === 'configure' || active.startsWith('configure/') || active === 'add-order' || active.startsWith('add-order/')) {
        setCurrentPage('configure');
        const slugParam = active.includes('/') ? active.split('/').slice(1).join('/').split('/')[0] : null;
        setCurrentParam(slugParam || null);
      } else if (active === 'products' || active === 'catalog') {
        setCurrentPage('home');
        setCurrentParam(null);
      } else if (active === 'about') {
        setCurrentPage('about');
        setCurrentParam(null);
      } else if (active === 'contact') {
        setCurrentPage('contact');
        setCurrentParam(null);
      } else {
        setCurrentPage('home');
        setCurrentParam(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Navigation Handler
  const navigate = (page, param = null) => {
    if (page === 'quote-modal') {
      setQuoteModalProduct(null);
      setIsQuoteModalOpen(true);
      return;
    }

    let targetHash = `#${page}`;
    if (param) targetHash += `/${param}`;

    window.location.hash = targetHash;
    setCurrentPage(page);
    setCurrentParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Quote Modal from anywhere
  const handleOpenQuoteModal = (specificProduct = null) => {
    setQuoteModalProduct(specificProduct);
    setIsQuoteModalOpen(true);
  };

  // Find active items
  const activeCategory = categories.find(c => c.id === currentParam || c.slug === currentParam);
  const activeProduct = products.find(p => p.slug === currentParam || p.id === currentParam);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-crimson selection:text-white">
      {/* Show header on all pages except full admin */}
      {currentPage !== 'admin' && (
        <Header
          onNavigate={navigate}
          categories={categories}
          products={products}
          onRequestQuote={handleOpenQuoteModal}
          onOpenRateList={() => {}}
          onOpenCart={() => setIsCartOpen(true)}
          orderCount={orderItems.length}
          activePage={currentParam ? `${currentPage}-${currentParam}` : currentPage}
        />
      )}

      {/* Main Page View */}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-brand-navy border-t-brand-crimson rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Loading PRINTIZER Catalogue...
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                categories={categories}
                products={products}
                promotions={promotions}
                settings={settings}
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
                onAddToCart={handleAddToCart}
                onOpenRateList={() => {}}
              />
            )}

            {currentPage === 'categories' && (
              <CategoriesPage
                categories={categories}
                products={products}
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'new-arrivals' && (
              <NewArrivalsPage
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'category' && (
              <CategoryPage
                category={activeCategory}
                products={products}
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentPage === 'product' && (
              <ProductDetailPage
                product={activeProduct}
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
                onAddToCart={handleAddToCart}
                allProducts={products}
              />
            )}

            {currentPage === 'configure' && (
              <OrderConfigurePage
                categories={categories}
                products={products}
                initialProductSlug={currentParam}
                orderItems={orderItems}
                onOrderItemsChange={handleOrderItemsChange}
                onNavigate={navigate}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'contact' && (
              <ContactPage
                onRequestQuote={handleOpenQuoteModal}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboard
                onNavigate={navigate}
                onCatalogUpdated={refreshCatalog}
              />
            )}
          </>
        )}
      </main>

      {/* Show footer on all pages except full admin */}
      {currentPage !== 'admin' && (
        <Footer
          onNavigate={navigate}
          categories={categories}
        />
      )}

      {/* Sticky Floating WhatsApp Launcher */}
      {currentPage !== 'admin' && (
        <WhatsAppFloating
          defaultProduct={activeProduct ? activeProduct.name : null}
          currentPage={currentPage}
        />
      )}

      {/* Interactive Quotation Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        product={quoteModalProduct}
        products={products}
      />

      {/* Flipkart / Amazon Style Slide-Out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        orderItems={orderItems}
        onOrderItemsChange={handleOrderItemsChange}
        onNavigate={navigate}
      />

      {/* Added-to-Cart Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">
            ✓ Added <strong>{cartToast}</strong> to Cart
          </span>
          <button
            type="button"
            onClick={() => {
              setCartToast(null);
              setIsCartOpen(true);
            }}
            className="bg-[#ff9f00] hover:bg-[#f09300] text-slate-950 font-extrabold px-3 py-1 rounded-lg text-[11px] shrink-0 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}
