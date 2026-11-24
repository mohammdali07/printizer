import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloating from './components/WhatsAppFloating.jsx';
import QuoteModal from './components/QuoteModal.jsx';

import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import initialCatalog from './data/initialCatalog.json';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParam, setCurrentParam] = useState(null);

  const [categories, setCategories] = useState(initialCatalog.categories || []);
  const [products, setProducts] = useState(initialCatalog.products || []);
  const [loading, setLoading] = useState(false);

  // Global Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalProduct, setQuoteModalProduct] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        const [catJson, prodJson] = await Promise.all([
          catRes.json(),
          prodRes.json()
        ]);

        if (catJson.success) setCategories(catJson.data);
        if (prodJson.success) setProducts(prodJson.data);
      } catch (err) {
        console.error('Failed to load initial catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
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
      } else if (active.startsWith('category/') || active.startsWith('categories/')) {
        setCurrentPage('category');
        const catSlug = active.replace(/^(category|categories)\//, '').split('/')[0];
        setCurrentParam(catSlug);
      } else if (active.startsWith('product/') || active.startsWith('products/')) {
        setCurrentPage('product');
        const prodSlug = active.replace(/^(product|products)\//, '').split('/')[0];
        setCurrentParam(prodSlug);
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
              />
            )}

            {currentPage === 'product' && (
              <ProductDetailPage
                product={activeProduct}
                onNavigate={navigate}
                onRequestQuote={handleOpenQuoteModal}
                allProducts={products}
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
        />
      )}

      {/* Interactive Quotation Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        product={quoteModalProduct}
        products={products}
      />
    </div>
  );
}
