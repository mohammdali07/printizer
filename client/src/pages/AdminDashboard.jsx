import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, LogOut, FileText, CheckCircle2, Clock, AlertCircle, 
  Send, Download, MessageCircle, RefreshCw, Plus, Trash2, 
  Edit, Eye, EyeOff, Search, Filter, ChevronRight, X, ExternalLink, ShieldCheck, DollarSign,
  UploadCloud, Image as ImageIcon, Star, Copy, Layers, ArrowLeft,
  LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Megaphone, BarChart3, Settings, Menu, ArrowUp, ArrowDown
} from 'lucide-react';
import ProductImage from '../components/ProductImage';
import initialCatalog from '../data/initialCatalog.json';
import { PRODUCT_GROUP_DEFS, getProductGroupDef } from '../utils/productGroups';
import {
  exportProductsAsCsv,
  exportProductsAsExcel,
  downloadBulkTemplateExcel,
  parseBulkCatalogFile
} from '../utils/catalogSpreadsheet';
import {
  ORDERS_STORAGE_KEY,
  PROMOS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  adminFetch,
  readLocalJson,
  writeLocalJson
} from '../utils/adminApi';
import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminPromotions from '../components/admin/AdminPromotions';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminSettings from '../components/admin/AdminSettings';

const LOCAL_CATALOG_KEY = 'prz_custom_catalog';

const readLocalCatalog = () => {
  try {
    const raw = localStorage.getItem(LOCAL_CATALOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
        return parsed;
      }
    }
  } catch {}
  return {
    categories: initialCatalog.categories || [],
    products: initialCatalog.products || []
  };
};

const writeLocalCatalog = (categories, products) => {
  try {
    localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify({ categories, products }));
  } catch {}
};

const parseCsvList = (val) =>
  typeof val === 'string'
    ? val.split(',').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(val) ? val : [];

const createDefaultOrderFormState = (p = null, fallbackCat = null) => {
  const pc = p?.pricingConfig || {};
  const of = pc.orderFields || {};
  const initialGallery = p
    ? Array.from(new Set([...(p.image ? [p.image] : []), ...(Array.isArray(p.secondaryImages) ? p.secondaryImages : [])].filter(Boolean)))
    : [];

  return {
    name: p?.name || '',
    slug: p?.slug || '',
    categoryId: p?.categoryId || fallbackCat?.id || 'business-stationery',
    categoryName: p?.categoryName || fallbackCat?.name || 'Business Stationery',
    tagline: p?.tagline || '',
    description: p?.description || '',
    enabled: p?.enabled !== false,
    supplierCost: p?.supplierCost ?? pc.supplierCost ?? '',
    supplierName: p?.supplierName || '',
    minQuantity: p?.minQuantity ?? pc.minQuantity ?? 100,
    packSize: p?.packSize ?? pc.packSize ?? p?.minQuantity ?? 100,
    unitName: pc.unitName || 'Units',
    baseRate: p?.baseRate ?? pc.baseRate ?? '',
    startingPrice: p?.startingPrice ?? pc.startingPrice ?? '',
    retailSingleRate: pc.priceSheets?.retail?.single ?? '',
    retailBothRate: pc.priceSheets?.retail?.both ?? '',
    priceUnavailable: Boolean(pc.priceUnavailable),
    supportsFoil: Boolean(pc.supportsFoil),
    supportsSpotUv: Boolean(pc.supportsSpotUv),
    dimensions: Boolean(pc.dimensions),
    quantityTiers: Array.isArray(p?.quantityTiers) ? p.quantityTiers.join(', ') : '',
    image: p?.image || '',
    secondaryImages: initialGallery,
    standardSizes: Array.isArray(p?.standardSizes) ? p.standardSizes.join(', ') : (p?.standardSizes || 'Standard Size'),
    materials: Array.isArray(p?.materials) ? p.materials.join(', ') : (p?.materials || '250g Art Card, 350g Art Card'),
    finishes: Array.isArray(p?.finishes) ? p.finishes.join(', ') : (p?.finishes || 'Gloss Lamination, Matte Lamination, Spot UV'),
    orderFields: {
      showMaterial: of.showMaterial !== false,
      showSize: of.showSize !== false,
      showFinishing: of.showFinishing !== false,
      showPrinting: of.showPrinting !== undefined ? of.showPrinting : true,
      showColour: of.showColour !== undefined ? of.showColour : true,
      showDelivery: of.showDelivery !== false,
      showNcr: Boolean(of.showNcr),
      showCopyType: Boolean(of.showCopyType),
      showBinding: Boolean(of.showBinding),
      showSetsPerBook: Boolean(of.showSetsPerBook),
      printingOptions: Array.isArray(of.printingOptions) ? of.printingOptions.join(', ') : 'Single Side, Both Sides',
      colourOptions: Array.isArray(of.colourOptions) ? of.colourOptions.join(', ') : 'Full Color (CMYK)',
      ncrOptions: Array.isArray(of.ncrOptions) ? of.ncrOptions.join(', ') : '',
      copyOptions: Array.isArray(of.copyOptions) ? of.copyOptions.join(', ') : '',
      bindingOptions: Array.isArray(of.bindingOptions) ? of.bindingOptions.join(', ') : '',
      setsOptions: Array.isArray(of.setsOptions) ? of.setsOptions.join(', ') : ''
    }
  };
};

export default function AdminDashboard({ onNavigate, onCatalogUpdated }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('prz_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => readLocalJson('prz_admin_user', { username: 'admin', name: 'Super Admin', role: 'Super Admin' }));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('printizer@2026');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState(() => readLocalJson(ORDERS_STORAGE_KEY, []));
  const [customers, setCustomers] = useState([]);
  const [promotions, setPromotions] = useState(() => readLocalJson(PROMOS_STORAGE_KEY, {
    announcementBar: { enabled: false, text: '', bgColor: '#be123c' },
    banners: [],
    featuredProductIds: []
  }));
  const [settings, setSettings] = useState(() => readLocalJson(SETTINGS_STORAGE_KEY, {}));
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Drawer States
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    items: [],
    subtotal: 0,
    gstPercent: 18,
    gstAmount: 0,
    shippingCharges: 0,
    discount: 0,
    grandTotal: 0,
    validityDays: 15,
    validUntil: '',
    deliveryEstimate: '3-5 business days after digital proof sign-off',
    paymentTerms: '50% advance to start printing, balance prior to dispatch',
    customNotes: ''
  });

  // Product Add / Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [activeAdminGroupKey, setActiveAdminGroupKey] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [productFormData, setProductFormData] = useState(() => createDefaultOrderFormState());

  // Category Add / Edit Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: ''
  });
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'product' | 'category', id, name }

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Auto-clear notification
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess('');
        setActionError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // Handle Login (Express API with static-hosting fallback)
  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    const u = username.trim() || 'admin';
    const p = password.trim() || 'printizer@2026';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('prz_admin_token', data.token);
          if (data.user) {
            localStorage.setItem('prz_admin_user', JSON.stringify(data.user));
            setAdminUser(data.user);
          }
          setAuthToken(data.token);
          return;
        }
        throw new Error(data.error || 'Invalid credentials');
      }
      throw new Error('API_UNAVAILABLE');
    } catch (err) {
      if (u === 'admin' && p === 'printizer@2026') {
        const localToken = 'local-admin-session';
        const fallbackUser = { username: 'admin', name: 'Super Admin', role: 'Super Admin' };
        localStorage.setItem('prz_admin_token', localToken);
        localStorage.setItem('prz_admin_user', JSON.stringify(fallbackUser));
        setAdminUser(fallbackUser);
        setAuthToken(localToken);
        return;
      }
      setLoginError(err.message === 'API_UNAVAILABLE' ? 'Invalid credentials' : (err.message || 'Login failed.'));
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('printizer@2026');
    handleLogin();
  };

  const handleLogout = () => {
    localStorage.removeItem('prz_admin_token');
    localStorage.removeItem('prz_admin_user');
    setAuthToken('');
  };

  // Derive customers & stats locally when API is unavailable
  const computeCustomersFromOrders = (orderList = [], enquiryList = []) => {
    const map = new Map();
    orderList.forEach((o) => {
      const key = (o.phone || o.email || o.customerName || o.id).toString().trim().toLowerCase();
      if (!key) return;
      const existing = map.get(key) || {
        id: key,
        name: o.customerName || 'Customer',
        phone: o.phone || '',
        email: o.email || '',
        totalOrders: 0,
        totalSpending: 0,
        lastOrderDate: null,
        orders: []
      };
      existing.totalOrders += 1;
      if (o.orderStatus !== 'Cancelled') {
        existing.totalSpending += Number(o.totalAmount) || 0;
      }
      if (!existing.lastOrderDate || new Date(o.orderDate) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.orderDate;
      }
      existing.orders.push(o);
      map.set(key, existing);
    });
    enquiryList.forEach((e) => {
      const key = (e.whatsappNumber || e.email || e.customerName || '').toString().trim().toLowerCase();
      if (!key || map.has(key)) return;
      map.set(key, {
        id: key,
        name: e.customerName || 'Lead',
        phone: e.whatsappNumber || '',
        email: e.email || '',
        totalOrders: 0,
        totalSpending: 0,
        lastOrderDate: e.createdAt || null,
        orders: []
      });
    });
    return Array.from(map.values());
  };

  // Fetch Dashboard Data (Express API with static localStorage/initialCatalog fallback)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, enqRes, prodRes, catRes, ordRes, custRes, promoRes, setRes, anaRes] = await Promise.all([
        adminFetch('/api/stats', {}, authToken).catch(() => null),
        adminFetch(`/api/enquiries?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`, {}, authToken).catch(() => null),
        adminFetch('/api/admin/products', {}, authToken).catch(() => null),
        adminFetch('/api/admin/categories', {}, authToken).catch(() => null),
        adminFetch('/api/orders', {}, authToken).catch(() => null),
        adminFetch('/api/customers', {}, authToken).catch(() => null),
        fetch('/api/promotions').catch(() => null),
        fetch('/api/settings').catch(() => null),
        adminFetch('/api/analytics?period=monthly', {}, authToken).catch(() => null)
      ]);

      if ([statsRes, enqRes, prodRes, catRes, ordRes].some((r) => r && r.status === 401)) {
        handleLogout();
        setLoginError('Session expired. Please sign in again.');
        return;
      }

      let currentProducts = products;
      let gotApiCatalog = false;
      if (prodRes?.ok && catRes?.ok) {
        const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
        if (prodData.success && catData.success) {
          setProducts(prodData.data);
          setCategories(catData.data);
          currentProducts = prodData.data;
          gotApiCatalog = true;
        }
      }

      if (!gotApiCatalog) {
        const local = readLocalCatalog();
        setProducts(local.products);
        setCategories(local.categories);
        currentProducts = local.products;
      }

      let currentOrders = readLocalJson(ORDERS_STORAGE_KEY, []);
      if (ordRes?.ok) {
        const ordData = await ordRes.json();
        if (ordData.success) {
          currentOrders = ordData.data || [];
          setOrders(currentOrders);
          writeLocalJson(ORDERS_STORAGE_KEY, currentOrders);
        }
      } else {
        setOrders(currentOrders);
      }

      let currentEnquiries = enquiries;
      if (enqRes?.ok) {
        const enqData = await enqRes.json();
        if (enqData.success) {
          currentEnquiries = enqData.data || [];
          setEnquiries(currentEnquiries);
        }
      }

      if (custRes?.ok) {
        const custData = await custRes.json();
        if (custData.success) setCustomers(custData.data || []);
      } else {
        setCustomers(computeCustomersFromOrders(currentOrders, currentEnquiries));
      }

      if (promoRes?.ok) {
        const promoData = await promoRes.json();
        if (promoData.success && promoData.data) {
          setPromotions(promoData.data);
          writeLocalJson(PROMOS_STORAGE_KEY, promoData.data);
        }
      }

      if (setRes?.ok) {
        const setData = await setRes.json();
        if (setData.success && setData.data) {
          setSettings(setData.data);
          writeLocalJson(SETTINGS_STORAGE_KEY, setData.data);
        }
      }

      if (anaRes?.ok) {
        const anaData = await anaRes.json();
        if (anaData.success) setAnalytics(anaData.data);
      }

      if (statsRes?.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);
      } else {
        const nonCancelled = currentOrders.filter((o) => o.orderStatus !== 'Cancelled');
        const totalRevenue = nonCancelled.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
        const totalSupplierCost = nonCancelled.reduce((s, o) => s + (Number(o.supplierCost) || 0), 0);
        setStats({
          totalEnquiries: currentEnquiries.length,
          newEnquiries: currentEnquiries.filter((e) => ['New', 'New Enquiry'].includes(e.status)).length,
          quotationPrepared: currentEnquiries.filter((e) => ['Quoted', 'Quotation Prepared'].includes(e.status)).length,
          quotationSent: currentEnquiries.filter((e) => e.status === 'Quotation Sent').length,
          confirmed: currentEnquiries.filter((e) => ['Converted', 'Confirmed'].includes(e.status)).length,
          totalProducts: currentProducts.length,
          totalOrders: currentOrders.length,
          pendingOrders: currentOrders.filter((o) => o.orderStatus === 'Pending').length,
          confirmedOrders: currentOrders.filter((o) => ['Confirmed', 'Processing', 'Ready', 'Dispatched'].includes(o.orderStatus)).length,
          completedOrders: currentOrders.filter((o) => o.orderStatus === 'Completed').length,
          totalCustomers: computeCustomersFromOrders(currentOrders, currentEnquiries).length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalSupplierCost: Math.round(totalSupplierCost * 100) / 100,
          estimatedProfit: Math.round((totalRevenue - totalSupplierCost) * 100) / 100
        });
      }
    } catch (err) {
      const local = readLocalCatalog();
      setProducts(local.products);
      setCategories(local.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken, statusFilter, searchQuery]);

  // Open Quotation Builder
  const handleOpenQuoteBuilder = (enquiry) => {
    setSelectedEnquiry(enquiry);
    if (enquiry.quotation) {
      setQuoteFormData(enquiry.quotation);
    } else {
      const initialItem = {
        description: `${enquiry.productName} - Custom Printing`,
        quantity: enquiry.quantity || 1000,
        unitPrice: 0.32,
        amount: Math.round((enquiry.quantity || 1000) * 0.32)
      };
      setQuoteFormData({
        quotationNumber: `PRZ-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [initialItem],
        subtotal: initialItem.amount,
        gstPercent: 18,
        gstAmount: Math.round(initialItem.amount * 0.18 * 100) / 100,
        shippingCharges: 100,
        discount: 0,
        grandTotal: Math.round((initialItem.amount + (initialItem.amount * 0.18) + 100) * 100) / 100,
        validityDays: 15,
        validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        deliveryEstimate: '3-4 business days after digital soft proof approval',
        paymentTerms: '50% advance to initiate printing, balance prior to dispatch',
        customNotes: enquiry.additionalRequirements || ''
      });
    }
    setShowQuoteBuilder(true);
  };

  // Recalculate quotation numbers
  const updateQuoteField = (field, val) => {
    setQuoteFormData(prev => {
      const updated = { ...prev, [field]: val };
      let itemsSubtotal = 0;
      if (updated.items && updated.items.length > 0) {
        itemsSubtotal = updated.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      }
      updated.subtotal = itemsSubtotal;

      const gstRate = Number(updated.gstPercent) || 0;
      const gstAmt = (itemsSubtotal * gstRate) / 100;
      updated.gstAmount = Math.round(gstAmt * 100) / 100;

      const shipping = Number(updated.shippingCharges) || 0;
      const discount = Number(updated.discount) || 0;

      updated.grandTotal = Math.max(0, Math.round((itemsSubtotal + gstAmt + shipping - discount) * 100) / 100);
      return updated;
    });
  };

  const updateItemRow = (idx, field, value) => {
    const updatedItems = [...quoteFormData.items];
    updatedItems[idx][field] = value;

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updatedItems[idx].quantity) || 0;
      const p = Number(updatedItems[idx].unitPrice) || 0;
      updatedItems[idx].amount = Math.round(q * p * 100) / 100;
    }

    setQuoteFormData(prev => {
      const sub = updatedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      const gst = (sub * (Number(prev.gstPercent) || 0)) / 100;
      const ship = Number(prev.shippingCharges) || 0;
      const disc = Number(prev.discount) || 0;
      const total = Math.max(0, Math.round((sub + gst + ship - disc) * 100) / 100);

      return {
        ...prev,
        items: updatedItems,
        subtotal: sub,
        gstAmount: Math.round(gst * 100) / 100,
        grandTotal: total
      };
    });
  };

  const addItemRow = () => {
    setQuoteFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: 'Finishing / Special Substrate Embellishment', quantity: 1, unitPrice: 0, amount: 0 }
      ]
    }));
  };

  const removeItemRow = (idx) => {
    const updatedItems = quoteFormData.items.filter((_, i) => i !== idx);
    setQuoteFormData(prev => {
      const sub = updatedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      const gst = (sub * (Number(prev.gstPercent) || 0)) / 100;
      const ship = Number(prev.shippingCharges) || 0;
      const disc = Number(prev.discount) || 0;
      const total = Math.max(0, Math.round((sub + gst + ship - disc) * 100) / 100);
      return {
        ...prev,
        items: updatedItems,
        subtotal: sub,
        gstAmount: Math.round(gst * 100) / 100,
        grandTotal: total
      };
    });
  };

  // Save Quotation to Backend
  const handleSaveQuotation = async () => {
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteFormData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save quotation');
      setActionSuccess('Quotation saved successfully! Status updated.');
      setShowQuoteBuilder(false);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Send Quotation to Customer Email
  const handleSendEmail = async (enquiryId) => {
    try {
      const res = await adminFetch(`/api/enquiries/${enquiryId}/send-email`, { method: 'POST' }, authToken);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send email');
      setActionSuccess('Quotation email dispatched to customer successfully!');
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Update Status
  const handleUpdateStatus = async (enquiryId, newStatus) => {
    try {
      const res = await adminFetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      }, authToken);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');
      setActionSuccess(`Status updated to: ${newStatus}`);
      fetchData();
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(data.data);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Share Quotation via WhatsApp
  const handleShareWhatsApp = (enquiry) => {
    const q = enquiry.quotation;
    if (!q) {
      alert('Please prepare and save a quotation first.');
      return;
    }
    const cleanPhone = enquiry.whatsappNumber.replace(/[^0-9]/g, '');
    const waText = `Hello ${enquiry.customerName},
Greetings from PRINTIZER!
Here is the official quotation for your printing requirement:

Product: ${enquiry.productName}
Quantity: ${enquiry.quantity}
Final Amount: ₹ ${Number(q.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Includes GST & Logistics)
Quotation No: ${q.quotationNumber}
Timeline: ${q.deliveryEstimate}
Validity: ${q.validityDays} Days

Thank you for choosing PRINTIZER — Everything Your Business Needs to Print.`;

    const url = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  };

  // Optimize image to WebP (<=1200px wide) cleanly on client before upload
  const optimizeImageFile = (file) => new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const base = file.name.replace(/\.[^.]+$/, '');
              resolve(new File([blob], `${base}.webp`, { type: 'image/webp' }));
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.86
        );
      };
      img.onerror = () => resolve(file);
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });

  // Upload one or more files for the active product (isolated per product ID)
  const uploadFilesToServer = async (fileList) => {
    const rawFiles = Array.from(fileList || []).filter(f => f && f.type.startsWith('image/'));
    if (rawFiles.length === 0) return [];
    setImageUploadError('');
    setUploadingImages(true);
    try {
      const optimized = await Promise.all(rawFiles.map(optimizeImageFile));
      const fd = new FormData();
      fd.append('productId', editingProduct?.id || productFormData.slug || 'new-product');
      optimized.forEach(f => fd.append('images', f));

      try {
        const res = await fetch('/api/products/upload-image', {
          method: 'POST',
          body: fd
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return (data.files || []).map(f => f.url);
          }
        }
      } catch {}

      // Fallback for static hosting: convert optimized images to Data URLs
      const dataUrls = await Promise.all(
        optimized.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            })
        )
      );
      return dataUrls.filter(Boolean);
    } catch (err) {
      setImageUploadError(err.message || 'Could not process image.');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUploadPrimaryImage = async (e) => {
    const urls = await uploadFilesToServer(e.target.files);
    e.target.value = '';
    if (urls.length === 0) return;
    const primaryUrl = urls[0];
    setProductFormData(prev => {
      const existingOthers = (prev.secondaryImages || []).filter(u => u && u !== primaryUrl);
      const mergedGallery = [primaryUrl, ...urls.slice(1), ...existingOthers];
      return {
        ...prev,
        image: primaryUrl,
        secondaryImages: Array.from(new Set(mergedGallery))
      };
    });
  };

  const handleUploadGalleryImages = async (e) => {
    const urls = await uploadFilesToServer(e.target.files);
    e.target.value = '';
    if (urls.length === 0) return;
    setProductFormData(prev => {
      const nextPrimary = prev.image || urls[0];
      const merged = Array.from(new Set([
        nextPrimary,
        ...(prev.secondaryImages || []),
        ...urls
      ].filter(Boolean)));
      return {
        ...prev,
        image: nextPrimary,
        secondaryImages: merged
      };
    });
  };

  const handleReplaceGallerySlot = async (slotIndex, e) => {
    const urls = await uploadFilesToServer(e.target.files);
    e.target.value = '';
    if (urls.length === 0) return;
    const newUrl = urls[0];
    setProductFormData(prev => {
      const currentGallery = Array.from(new Set([
        ...(prev.image ? [prev.image] : []),
        ...(prev.secondaryImages || [])
      ].filter(Boolean)));
      const oldUrl = currentGallery[slotIndex];
      currentGallery[slotIndex] = newUrl;
      const nextPrimary = prev.image === oldUrl ? newUrl : prev.image;
      return {
        ...prev,
        image: nextPrimary,
        secondaryImages: Array.from(new Set(currentGallery.filter(Boolean)))
      };
    });
  };

  const handleSetPrimaryGalleryImage = (url) => {
    setProductFormData(prev => {
      const merged = Array.from(new Set([
        url,
        ...(prev.secondaryImages || []).filter(u => u !== url),
        ...(prev.image && prev.image !== url ? [prev.image] : [])
      ].filter(Boolean)));
      return {
        ...prev,
        image: url,
        secondaryImages: merged
      };
    });
  };

  const handleRemoveGalleryImage = (url) => {
    setProductFormData(prev => {
      const remaining = (prev.secondaryImages || []).filter(u => u && u !== url);
      const nextPrimary = prev.image === url ? (remaining[0] || '') : prev.image;
      return {
        ...prev,
        image: nextPrimary,
        secondaryImages: remaining
      };
    });
  };

  // Product Add / Edit Handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const primaryImg = (productFormData.image || '').trim();
      const rawGallery = Array.isArray(productFormData.secondaryImages)
        ? productFormData.secondaryImages.map(u => (u || '').trim()).filter(Boolean)
        : [];
      const normalizedGallery = primaryImg
        ? Array.from(new Set([primaryImg, ...rawGallery]))
        : Array.from(new Set(rawGallery));

      const minQtyNum = Number(productFormData.minQuantity) || 100;
      const packSizeNum = Number(productFormData.packSize) || minQtyNum;
      const baseRateNum = productFormData.baseRate !== '' && productFormData.baseRate !== null
        ? Number(productFormData.baseRate)
        : undefined;
      const startingPriceNum = productFormData.startingPrice !== '' && productFormData.startingPrice !== null
        ? Number(productFormData.startingPrice)
        : undefined;
      const parsedTiers = parseCsvList(productFormData.quantityTiers)
        .map((n) => parseInt(n, 10))
        .filter((n) => Number.isFinite(n) && n > 0);

      const existingPc = editingProduct?.pricingConfig || {};
      const existingOrderFields = existingPc.orderFields || {};
      const ofForm = productFormData.orderFields || {};
      const updatedOrderFields = {
        ...existingOrderFields,
        enabled: true,
        showMaterial: Boolean(ofForm.showMaterial),
        showSize: Boolean(ofForm.showSize),
        showFinishing: Boolean(ofForm.showFinishing),
        showPrinting: Boolean(ofForm.showPrinting),
        showColour: Boolean(ofForm.showColour),
        showDelivery: false,
        showNcr: Boolean(ofForm.showNcr),
        showCopyType: Boolean(ofForm.showCopyType),
        showBinding: Boolean(ofForm.showBinding),
        showSetsPerBook: Boolean(ofForm.showSetsPerBook),
        printingOptions: parseCsvList(ofForm.printingOptions),
        colourOptions: parseCsvList(ofForm.colourOptions),
        ncrOptions: parseCsvList(ofForm.ncrOptions),
        copyOptions: parseCsvList(ofForm.copyOptions),
        bindingOptions: parseCsvList(ofForm.bindingOptions),
        setsOptions: parseCsvList(ofForm.setsOptions)
      };

      const retailSingleNum = productFormData.retailSingleRate !== '' && productFormData.retailSingleRate !== null
        ? Number(productFormData.retailSingleRate)
        : null;
      const retailBothNum = productFormData.retailBothRate !== '' && productFormData.retailBothRate !== null
        ? Number(productFormData.retailBothRate)
        : null;

      let nextPriceSheets = existingPc.priceSheets ? { ...existingPc.priceSheets } : undefined;
      if (Number.isFinite(retailSingleNum) && retailSingleNum > 0) {
        nextPriceSheets = {
          ...(nextPriceSheets || {}),
          retail: {
            ...(nextPriceSheets?.retail || {}),
            single: retailSingleNum,
            ...(Number.isFinite(retailBothNum) && retailBothNum > 0 ? { both: retailBothNum } : {})
          }
        };
      }

      const supplierCostNum = productFormData.supplierCost !== '' && productFormData.supplierCost !== null
        ? Number(productFormData.supplierCost)
        : undefined;

      const nextPricingConfig = {
        ...existingPc,
        minQuantity: minQtyNum,
        packSize: packSizeNum,
        unitName: (productFormData.unitName || 'Units').trim(),
        ...(Number.isFinite(baseRateNum) ? { baseRate: baseRateNum } : {}),
        ...(Number.isFinite(startingPriceNum) ? { startingPrice: startingPriceNum } : {}),
        ...(Number.isFinite(supplierCostNum) ? { supplierCost: supplierCostNum } : {}),
        priceUnavailable: Boolean(productFormData.priceUnavailable),
        supportsFoil: Boolean(productFormData.supportsFoil),
        supportsSpotUv: Boolean(productFormData.supportsSpotUv),
        dimensions: Boolean(productFormData.dimensions),
        ...(productFormData.dimensions ? { pricingKind: 'area' } : {}),
        supportsBothSides: updatedOrderFields.printingOptions.some((opt) => /both|double/i.test(opt)) || Boolean(existingPc.supportsBothSides),
        ...(nextPriceSheets ? { priceSheets: nextPriceSheets } : {}),
        orderFields: updatedOrderFields
      };

      const payload = {
        name: productFormData.name,
        slug: productFormData.slug || productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        categoryId: productFormData.categoryId,
        categoryName: categories.find(c => c.id === productFormData.categoryId)?.name || 'Custom',
        tagline: productFormData.tagline,
        description: productFormData.description,
        enabled: productFormData.enabled !== false,
        ...(Number.isFinite(supplierCostNum) ? { supplierCost: supplierCostNum } : {}),
        ...(productFormData.supplierName?.trim() ? { supplierName: productFormData.supplierName.trim() } : {}),
        minQuantity: minQtyNum,
        packSize: packSizeNum,
        ...(Number.isFinite(baseRateNum) ? { baseRate: baseRateNum } : {}),
        ...(Number.isFinite(startingPriceNum) ? { startingPrice: startingPriceNum } : {}),
        ...(parsedTiers.length > 0 ? { quantityTiers: parsedTiers } : {}),
        pricingConfig: nextPricingConfig,
        image: primaryImg,
        secondaryImages: normalizedGallery,
        standardSizes: parseCsvList(productFormData.standardSizes),
        materials: parseCsvList(productFormData.materials),
        finishes: parseCsvList(productFormData.finishes)
      };

      let savedToApi = false;
      try {
        const res = editingProduct
          ? await adminFetch(`/api/products/${editingProduct.id}`, {
              method: 'PUT',
              body: JSON.stringify(payload)
            }, authToken)
          : await adminFetch('/api/products', {
              method: 'POST',
              body: JSON.stringify(payload)
            }, authToken);

        if (res.ok) {
          const data = await res.json();
          if (!data.success) throw new Error(data.error || 'Failed to save product');
          savedToApi = true;
        }
      } catch (apiErr) {
        if (apiErr.message && !/fetch|network|json/i.test(apiErr.message)) {
          throw apiErr;
        }
      }

      if (!savedToApi) {
        const nextProducts = editingProduct
          ? products.map((item) => (item.id === editingProduct.id ? { ...item, ...payload } : item))
          : [{ id: `prd-${payload.slug}-${Date.now()}`, ...payload }, ...products];
        setProducts(nextProducts);
        writeLocalCatalog(categories, nextProducts);
      }

      setActionSuccess(editingProduct ? 'Product updated successfully!' : 'New product created!');
      setShowProductModal(false);
      setEditingProduct(null);
      if (savedToApi) fetchData();
      onCatalogUpdated?.();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDuplicateProduct = (p) => {
    setEditingProduct(null);
    setImageUploadError('');
    const baseState = createDefaultOrderFormState(p, categories[0]);
    setProductFormData({
      ...baseState,
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy`
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (p) => {
    setDeleteTarget({ type: 'product', id: p.id, name: p.name });
  };

  const handleDeleteCategory = (cat) => {
    setDeleteTarget({ type: 'category', id: cat.id, name: cat.name });
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);
    if (type === 'category') {
      try {
        await adminFetch(`/api/categories/${id}`, { method: 'DELETE' }, authToken).catch(() => null);
      } catch {}
      const nextCategories = categories.filter((c) => c.id !== id);
      setCategories(nextCategories);
      writeLocalCatalog(nextCategories, products);
      setActionSuccess('Category removed');
      onCatalogUpdated?.();
      return;
    }
    try {
      let deletedOnApi = false;
      try {
        const res = await adminFetch(`/api/products/${id}`, { method: 'DELETE' }, authToken);
        if (res.ok) {
          const data = await res.json();
          if (data.success) deletedOnApi = true;
        }
      } catch {}

      if (!deletedOnApi) {
        const nextProducts = products.filter((p) => p.id !== id);
        setProducts(nextProducts);
        writeLocalCatalog(categories, nextProducts);
      }

      setActionSuccess('Product deleted successfully');
      if (deletedOnApi) fetchData();
      onCatalogUpdated?.();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggleProductEnabled = async (p) => {
    const nextEnabled = p.enabled === false;
    try {
      const res = await adminFetch(`/api/products/${p.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: nextEnabled })
      }, authToken).catch(() => null);
      if (res?.ok) {
        fetchData();
      } else {
        const nextProducts = products.map((item) => (item.id === p.id ? { ...item, enabled: nextEnabled } : item));
        setProducts(nextProducts);
        writeLocalCatalog(categories, nextProducts);
      }
      setActionSuccess(`Product "${p.name}" ${nextEnabled ? 'enabled' : 'hidden'} on storefront`);
      onCatalogUpdated?.();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const cleanName = (categoryFormData.name || '').trim();
    if (!cleanName) return;
    const cleanId = (categoryFormData.id || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).trim();
    const newCat = {
      id: editingCategory ? editingCategory.id : cleanId,
      name: cleanName,
      description: (categoryFormData.description || '').trim(),
      image: (categoryFormData.image || '/images/categories/business-stationery.webp').trim(),
      enabled: editingCategory ? editingCategory.enabled !== false : true,
      sortOrder: editingCategory?.sortOrder ?? categories.length,
      badge: `${products.filter((p) => p.categoryId === cleanId).length} Products`
    };
    try {
      const res = editingCategory
        ? await adminFetch(`/api/categories/${editingCategory.id}`, {
            method: 'PUT',
            body: JSON.stringify(newCat)
          }, authToken).catch(() => null)
        : await adminFetch('/api/categories', {
            method: 'POST',
            body: JSON.stringify(newCat)
          }, authToken).catch(() => null);
      if (res?.ok) {
        await fetchData();
      } else {
        const nextCategories = editingCategory
          ? categories.map((c) => (c.id === editingCategory.id ? { ...c, ...newCat } : c))
          : [...categories, newCat];
        const nextProducts = editingCategory
          ? products.map((p) => (p.categoryId === editingCategory.id ? { ...p, categoryName: cleanName } : p))
          : products;
        setCategories(nextCategories);
        setProducts(nextProducts);
        writeLocalCatalog(nextCategories, nextProducts);
      }
    } catch {}
    setShowCategoryModal(false);
    setEditingCategory(null);
    setActionSuccess(editingCategory ? 'Category updated!' : 'New category added!');
    onCatalogUpdated?.();
  };

  const handleToggleCategoryEnabled = async (cat) => {
    const nextEnabled = cat.enabled === false;
    try {
      const res = await adminFetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: nextEnabled })
      }, authToken).catch(() => null);
      if (res?.ok) {
        fetchData();
      } else {
        const nextCategories = categories.map((c) => (c.id === cat.id ? { ...c, enabled: nextEnabled } : c));
        setCategories(nextCategories);
        writeLocalCatalog(nextCategories, products);
      }
      setActionSuccess(`Category "${cat.name}" ${nextEnabled ? 'enabled' : 'hidden'}`);
      onCatalogUpdated?.();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleMoveCategory = async (catId, direction) => {
    const idx = categories.findIndex((c) => c.id === catId);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= categories.length) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    const withOrder = reordered.map((c, i) => ({ ...c, sortOrder: i }));
    setCategories(withOrder);
    writeLocalCatalog(withOrder, products);
    try {
      await adminFetch('/api/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds: withOrder.map((c) => c.id) })
      }, authToken).catch(() => null);
    } catch {}
    onCatalogUpdated?.();
  };

  // Order Management Handlers
  const handleCreateOrder = async (orderPayload) => {
    const res = await adminFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    }, authToken).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Order ${data.data.orderNumber} created`);
        await fetchData();
        return;
      }
    }
    const localOrder = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      orderNumber: `PRZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString()
    };
    const nextOrders = [localOrder, ...orders];
    setOrders(nextOrders);
    writeLocalJson(ORDERS_STORAGE_KEY, nextOrders);
    setCustomers(computeCustomersFromOrders(nextOrders, enquiries));
    setActionSuccess(`Order ${localOrder.orderNumber} created`);
  };

  const handleUpdateOrder = async (id, patch) => {
    const res = await adminFetch(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    }, authToken).catch(() => null);
    if (res?.ok) {
      await fetchData();
      setActionSuccess('Order updated');
      return;
    }
    const nextOrders = orders.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o));
    setOrders(nextOrders);
    writeLocalJson(ORDERS_STORAGE_KEY, nextOrders);
    setCustomers(computeCustomersFromOrders(nextOrders, enquiries));
    setActionSuccess('Order updated');
  };

  const handleDeleteOrder = async (id) => {
    const res = await adminFetch(`/api/orders/${id}`, { method: 'DELETE' }, authToken).catch(() => null);
    if (res?.ok) {
      await fetchData();
      setActionSuccess('Order deleted');
      return;
    }
    const nextOrders = orders.filter((o) => o.id !== id);
    setOrders(nextOrders);
    writeLocalJson(ORDERS_STORAGE_KEY, nextOrders);
    setCustomers(computeCustomersFromOrders(nextOrders, enquiries));
    setActionSuccess('Order deleted');
  };

  const handleSavePromotions = async (nextPromos) => {
    setPromotions(nextPromos);
    writeLocalJson(PROMOS_STORAGE_KEY, nextPromos);
    await adminFetch('/api/promotions', {
      method: 'PUT',
      body: JSON.stringify(nextPromos)
    }, authToken).catch(() => null);
    setActionSuccess('Promotions & Banners saved!');
    onCatalogUpdated?.();
  };

  const handleSaveSettings = async (nextSettings) => {
    setSettings(nextSettings);
    writeLocalJson(SETTINGS_STORAGE_KEY, nextSettings);
    await adminFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(nextSettings)
    }, authToken).catch(() => null);
    setActionSuccess('Website settings saved!');
    onCatalogUpdated?.();
  };

  const handleExportCatalogJson = () => {
    const payload = {
      ...initialCatalog,
      categories,
      products
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initialCatalog.json';
    a.click();
    URL.revokeObjectURL(url);
    setActionSuccess('Downloaded updated initialCatalog.json!');
  };

  const handleBulkImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { nextProducts, nextCategories, addedCount, updatedCount, skippedCount } =
        await parseBulkCatalogFile(file, categories, products);
      setProducts(nextProducts);
      setCategories(nextCategories);
      writeLocalCatalog(nextCategories, nextProducts);
      setActionSuccess(
        `Bulk import complete: ${addedCount} added, ${updatedCount} updated${skippedCount ? `, ${skippedCount} skipped` : ''}!`
      );
      onCatalogUpdated?.();
    } catch (err) {
      setActionError(err.message || 'Failed to import CSV/Excel file.');
    }
  };

  // ======================== RENDER LOGIN GATE ========================
  if (!authToken) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 text-center space-y-5">
          <div>
            <img 
              src="/images/printizer-logo-horizontal.png" 
              alt="PRINTIZER" 
              className="h-12 sm:h-14 mx-auto object-contain mb-2"
              onError={(e) => {
                e.target.src = "/images/printizer-logo-horizontal.jpeg";
              }}
            />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-wide">
              PRINTIZER Admin Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quotation Management & Orders Portal
            </p>
          </div>

          {loginError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {loginError}
            </div>
          )}

          {/* Quick 1-Click Login Button */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-left">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Instant Access
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Click below to login immediately with configured administrator credentials:
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>One-Click Admin Login (admin)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="bg-white px-3 text-[11px] text-slate-400">or sign in manually</span>
            <div className="absolute inset-0 flex items-center -z-10">
              <div className="w-full border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-crimson hover:bg-brand-red text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-brand-crimson/25"
            >
              Sign In to Admin Portal &rarr;
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-2"
          >
            &larr; Return to Website
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'enquiries', label: 'Enquiries', icon: FileText, badge: enquiries.length },
    { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
    { id: 'promotions', label: 'Promotions & Banners', icon: Megaphone },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Website Settings', icon: Settings }
  ];

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  // ======================== RENDER MAIN ADMIN DASHBOARD ========================
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
        />
      )}

      {/* Left SaaS Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src="/images/printizer-logo-horizontal.png"
              alt="PRINTIZER"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.src = '/images/printizer-logo-horizontal.jpeg';
              }}
            />
            <div>
              <h1 className="text-xs font-extrabold tracking-wider text-slate-900">
                PRINTIZER <span className="text-brand-crimson">ADMIN</span>
              </h1>
              <p className="text-[10px] text-slate-400">Business Suite</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-crimson' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/70">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{adminUser?.name || 'Admin'}</p>
              <p className="text-[10px] font-semibold text-emerald-700">{adminUser?.role || 'Super Admin'}</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">{activeNavLabel}</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">Centralized printing business management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {actionSuccess && (
              <div className="hidden md:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="hidden md:flex items-center space-x-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{actionError}</span>
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="text-slate-700 hover:text-slate-900 flex items-center space-x-1 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats || {}}
              orders={orders || []}
              enquiries={enquiries || []}
              analytics={analytics || {}}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              products={products}
              onCreateOrder={handleCreateOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers customers={customers} />
          )}

          {activeTab === 'promotions' && (
            <AdminPromotions
              promotions={promotions}
              products={products}
              onSavePromotions={handleSavePromotions}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalytics orders={orders} />
          )}

          {activeTab === 'settings' && (
            <AdminSettings settings={settings} onSaveSettings={handleSaveSettings} />
          )}

        {/* ==================== TAB 1: ENQUIRIES ==================== */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
                {[
                  'all',
                  'New',
                  'Contacted',
                  'Quoted',
                  'Converted',
                  'Closed',
                  'New Enquiry',
                  'Quotation Prepared',
                  'Quotation Sent',
                  'Confirmed',
                  'Completed'
                ].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                      statusFilter === st 
                        ? 'bg-brand-navy text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search customer, ref, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Enquiries List (Mobile-Responsive Cards & Desktop Table) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 sm:px-4">Ref & Date</th>
                      <th className="py-3 px-3 sm:px-4">Client</th>
                      <th className="py-3 px-3 sm:px-4">Product & Specs</th>
                      <th className="py-3 px-3 sm:px-4">Qty</th>
                      <th className="py-3 px-3 sm:px-4">Artwork</th>
                      <th className="py-3 px-3 sm:px-4">Status</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enquiries.length > 0 ? (
                      enquiries.map((enq) => {
                        return (
                          <tr key={enq.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <span className="font-extrabold text-brand-navy block">{enq.referenceNo}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            <td className="py-3 px-3 sm:px-4">
                              <span className="font-bold text-slate-900 block">{enq.customerName}</span>
                              {enq.businessName && (
                                <span className="text-[11px] text-slate-500 block">{enq.businessName}</span>
                              )}
                              <span className="text-[11px] text-slate-400 block">{enq.whatsappNumber}</span>
                            </td>

                            <td className="py-3 px-3 sm:px-4 max-w-xs">
                              <span className="font-bold text-slate-800 block">{enq.productName}</span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {enq.dimensions && <span>{enq.dimensions} &bull; </span>}
                                {enq.material && <span>{enq.material} &bull; </span>}
                                {enq.finishing && <span>{enq.finishing}</span>}
                              </div>
                              {enq.jobName && (
                                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Job: {enq.jobName}</span>
                              )}
                            </td>

                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{enq.quantity}</span>
                              {enq.estimatedPrice && (
                                <span className="text-[11px] font-extrabold text-emerald-600 block">
                                  ₹{Number(enq.estimatedPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              {enq.artworkPath ? (
                                <a
                                  href={enq.artworkPath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-blue-600 hover:underline text-[11px] font-semibold"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">None</span>
                              )}
                            </td>

                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <select
                                value={enq.status}
                                onChange={(e) => handleUpdateStatus(enq.id, e.target.value)}
                                className="text-[11px] font-bold rounded-lg px-2 py-1 border bg-white focus:outline-none"
                              >
                                {[
                                  'New',
                                  'Contacted',
                                  'Quoted',
                                  'Converted',
                                  'Closed',
                                  'New Enquiry',
                                  'Under Review',
                                  'Quotation Prepared',
                                  'Quotation Sent',
                                  'Awaiting Customer Approval',
                                  'Confirmed',
                                  'Completed',
                                  'Cancelled'
                                ].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-right">
                              <div className="inline-flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleOpenQuoteBuilder(enq)}
                                  className="bg-brand-navy hover:bg-slate-800 text-white px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1"
                                >
                                  <FileText className="w-3.5 h-3.5 text-brand-crimson" />
                                  <span>{enq.quotation ? 'Edit Quote' : 'Quote'}</span>
                                </button>

                                {enq.quotation && (
                                  <a
                                    href={`/api/enquiries/${enq.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-lg text-[11px]"
                                    title="Download PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {enq.quotation && (
                                  <button
                                    onClick={() => handleSendEmail(enq.id)}
                                    className="bg-slate-100 hover:bg-purple-50 text-purple-700 p-1.5 rounded-lg text-[11px]"
                                    title="Send Email"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {enq.quotation && (
                                  <button
                                    onClick={() => handleShareWhatsApp(enq)}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg text-[11px]"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-slate-500">
                          No enquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PRODUCTS ==================== */}
        {activeTab === 'products' && (() => {
          const activeGroupDef = activeAdminGroupKey
            ? PRODUCT_GROUP_DEFS.find((g) => g.key === activeAdminGroupKey) || null
            : null;

          const filteredAdminProducts = products.filter(p => {
            if (activeGroupDef) {
              if (!activeGroupDef.match(p)) return false;
              if (activeGroupDef.genericSlug && p.slug === activeGroupDef.genericSlug) {
                const hasVariants = products.some((o) => o.slug !== activeGroupDef.genericSlug && activeGroupDef.match(o));
                if (hasVariants) return false;
              }
            } else {
              const matchesCat = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
              if (!matchesCat) return false;
            }
            const q = productSearch.trim().toLowerCase();
            const matchesSearch = !q ||
              (p.name || '').toLowerCase().includes(q) ||
              (p.slug || '').toLowerCase().includes(q) ||
              (p.categoryName || '').toLowerCase().includes(q);
            return matchesSearch;
          });

          // Collapse multi-variant groups into 1 clean card unless inside a group or searching
          const displayedCards = (() => {
            if (activeGroupDef || productSearch.trim()) {
              return filteredAdminProducts.map((p) => ({ product: p, groupDef: null, variantCount: 0 }));
            }
            const list = [];
            const seenGroups = new Set();
            for (const p of filteredAdminProducts) {
              const g = getProductGroupDef(p);
              if (!g) {
                list.push({ product: p, groupDef: null, variantCount: 0 });
                continue;
              }
              if (seenGroups.has(g.key)) continue;
              seenGroups.add(g.key);
              const variants = filteredAdminProducts.filter((item) => {
                if (!g.match(item)) return false;
                if (g.genericSlug && item.slug === g.genericSlug) {
                  return !filteredAdminProducts.some((o) => o.slug !== g.genericSlug && g.match(o));
                }
                return true;
              });
              const rep = (g.genericSlug && filteredAdminProducts.find((item) => item.slug === g.genericSlug)) || p;
              list.push({
                product: { ...rep, name: g.groupName },
                groupDef: g,
                variantCount: variants.length
              });
            }
            return list;
          })();

          return (
          <div className="space-y-4">
            {activeGroupDef && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminGroupKey(null);
                      setProductSearch('');
                    }}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Products</span>
                  </button>
                  <div>
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                      Product Options Group
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      {activeGroupDef.groupName} ({filteredAdminProducts.length} Options)
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = filteredAdminProducts[0] || products.find(activeGroupDef.match) || null;
                    setEditingProduct(null);
                    setImageUploadError('');
                    const base = createDefaultOrderFormState(sample, categories[0]);
                    setProductFormData({
                      ...base,
                      name: '',
                      slug: ''
                    });
                    setShowProductModal(true);
                  }}
                  className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {activeGroupDef.groupName} Option</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder={activeGroupDef ? `Search ${activeGroupDef.groupName} options...` : 'Search products by name or slug...'}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {!activeGroupDef && (
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl py-1.5 px-3 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                <span className="text-[11px] text-slate-500 font-semibold">
                  Showing <strong className="text-slate-900">{displayedCards.length}</strong> {activeGroupDef ? 'options' : 'items'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Bulk Import CSV/Excel</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkImportFile}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={downloadBulkTemplateExcel}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition"
                  title="Download sample Excel template for bulk upload"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportProductsAsCsv(filteredAdminProducts)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition"
                  title="Export filtered products as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportProductsAsExcel(filteredAdminProducts)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition shadow-xs"
                  title="Export filtered products as Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCatalogJson}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition"
                  title="Download updated initialCatalog.json"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setImageUploadError('');
                    setProductFormData(createDefaultOrderFormState(null, categories[0]));
                    setShowProductModal(true);
                  }}
                  className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayedCards.map(({ product: p, groupDef, variantCount }) => {
                const galleryCount = Array.from(new Set([
                  ...(p.image ? [p.image] : []),
                  ...(Array.isArray(p.secondaryImages) ? p.secondaryImages : [])
                ].filter(Boolean))).length;

                return (
                <div
                  key={groupDef ? `grp-${groupDef.key}` : p.id}
                  onClick={groupDef ? () => {
                    setProductSearch('');
                    setActiveAdminGroupKey(groupDef.key);
                  } : undefined}
                  className={`bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex space-x-3 items-start justify-between ${groupDef ? 'cursor-pointer hover:border-brand-crimson/50 hover:shadow-md transition' : ''}`}
                >
                  <div className="flex space-x-3 min-w-0">
                    <div className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        placeholderLabel={p.name}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {p.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.tagline}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {groupDef ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-brand-crimson border border-rose-200">
                            <span>{variantCount} Options</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] text-slate-600 font-medium">Min: {p.minQuantity}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${galleryCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {galleryCount} {galleryCount === 1 ? 'photo' : 'photos'}
                            </span>
                            {p.enabled === false && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">Hidden</span>
                            )}
                            {Number(p.supplierCost || p.pricingConfig?.supplierCost) > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                Cost: ₹{p.supplierCost || p.pricingConfig?.supplierCost}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {groupDef ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductSearch('');
                        setActiveAdminGroupKey(groupDef.key);
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-brand-crimson text-white text-[11px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Open
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleToggleProductEnabled(p)}
                        className={`p-1.5 rounded-lg ${p.enabled === false ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={p.enabled === false ? 'Hidden on Storefront (Click to Enable)' : 'Visible on Storefront (Click to Hide)'}
                      >
                        {p.enabled === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDuplicateProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setImageUploadError('');
                          setProductFormData(createDefaultOrderFormState(p, categories[0]));
                          setShowProductModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="Edit Product & Images"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
          );
        })()}

        {/* ==================== TAB 3: CATEGORIES ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-700">
                Manage Printing Categories ({categories.length})
              </span>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({ id: '', name: '', description: '', image: '' });
                  setShowCategoryModal(true);
                }}
                className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {categories.map((cat, idx) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const isHidden = cat.enabled === false;
                return (
                  <div key={cat.id} className={`bg-white p-3.5 rounded-2xl border shadow-2xs flex space-x-3 items-start justify-between ${isHidden ? 'border-amber-200 opacity-75' : 'border-slate-200'}`}>
                    <div className="flex space-x-3 min-w-0">
                      <div className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                        <ProductImage src={cat.image} alt={cat.name} placeholderLabel={cat.name} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{cat.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cat.description}</p>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {count} Products
                          </span>
                          {isHidden && (
                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5 shrink-0">
                      <button
                        onClick={() => handleMoveCategory(cat.id, -1)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(cat.id, 1)}
                        disabled={idx === categories.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleCategoryEnabled(cat)}
                        className={`p-1.5 rounded-lg ${isHidden ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={isHidden ? 'Enable Category' : 'Hide Category'}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormData({
                            id: cat.id,
                            name: cat.name,
                            description: cat.description || '',
                            image: cat.image || ''
                          });
                          setShowCategoryModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </main>
      </div>

      {/* ==================== MODAL: DELETE CONFIRMATION ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Delete {deleteTarget.type === 'category' ? 'Category' : 'Product'}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">&ldquo;{deleteTarget.name}&rdquo;</strong>?
                {deleteTarget.type === 'category'
                  ? ' Products inside this category will remain in the catalog.'
                  : ' This action cannot be undone.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTarget}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT CATEGORY ==================== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. Hospital & Medical Printing"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              {!editingCategory && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Slug / ID</label>
                  <input
                    type="text"
                    value={categoryFormData.id}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Short description of products in this category..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  placeholder="/images/categories/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-crimson hover:bg-brand-red text-white font-bold shadow-sm"
                >
                  {editingCategory ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: QUOTATION BUILDER & GENERATOR ==================== */}
      {showQuoteBuilder && selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-brand-navy p-4 sm:p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-widest block">
                  Official Quotation Generator
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Prepare Quotation for {selectedEnquiry.customerName} ({selectedEnquiry.referenceNo})
                </h3>
              </div>
              <button
                onClick={() => setShowQuoteBuilder(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Product:</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quantity:</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dimensions:</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.dimensions || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Finishing:</span>
                  <span className="font-bold text-slate-800">{selectedEnquiry.finishing || 'Standard'}</span>
                </div>
                {selectedEnquiry.estimatedPrice && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Client Configured Estimate:</span>
                    <span className="font-extrabold text-emerald-600">₹ {Number(selectedEnquiry.estimatedPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedEnquiry.jobName && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Job Name:</span>
                    <span className="font-bold text-slate-800">{selectedEnquiry.jobName}</span>
                  </div>
                )}
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quotation Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-bold text-brand-crimson hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold">
                      <tr>
                        <th className="p-2">Item Description & Specifications</th>
                        <th className="p-2 w-20 text-center">Qty</th>
                        <th className="p-2 w-28 text-right">Unit Rate (₹)</th>
                        <th className="p-2 w-28 text-right">Amount (₹)</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quoteFormData.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={it.description}
                              onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center text-slate-900 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) => updateItemRow(idx, 'unitPrice', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-right text-slate-900 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-800">
                            ₹ {Number(it.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center">
                            {quoteFormData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Terms & Timeline
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Delivery Estimate:
                    </label>
                    <input
                      type="text"
                      value={quoteFormData.deliveryEstimate}
                      onChange={(e) => updateQuoteField('deliveryEstimate', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Payment Terms:
                    </label>
                    <input
                      type="text"
                      value={quoteFormData.paymentTerms}
                      onChange={(e) => updateQuoteField('paymentTerms', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Taxes & Total
                  </h4>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-bold text-slate-800">
                      ₹ {Number(quoteFormData.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">GST:</span>
                      <select
                        value={quoteFormData.gstPercent}
                        onChange={(e) => updateQuoteField('gstPercent', Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                      >
                        <option value="18">18%</option>
                        <option value="12">12%</option>
                        <option value="5">5%</option>
                        <option value="0">0%</option>
                      </select>
                    </div>
                    <span className="font-semibold text-slate-800">
                      ₹ {Number(quoteFormData.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Shipping (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.shippingCharges}
                      onChange={(e) => updateQuoteField('shippingCharges', Number(e.target.value))}
                      className="w-20 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-semibold text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.discount}
                      onChange={(e) => updateQuoteField('discount', Number(e.target.value))}
                      className="w-20 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-semibold text-xs text-rose-600"
                    />
                  </div>

                  <div className="bg-brand-navy text-white p-3 rounded-xl flex items-center justify-between mt-2">
                    <span className="font-bold uppercase tracking-wider text-xs">Final Total:</span>
                    <span className="text-base font-extrabold text-white">
                      ₹ {Number(quoteFormData.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs text-slate-500">
                Quotation No: <strong className="text-slate-800">{quoteFormData.quotationNumber}</strong>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteBuilder(false)}
                  className="bg-white border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveQuotation}
                  className="bg-brand-navy hover:bg-slate-800 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs transition"
                >
                  Save Quotation Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PRODUCT ADD / EDIT WITH IMAGE GALLERY MANAGER ==================== */}
      {showProductModal && (() => {
        const currentGallery = Array.from(new Set([
          ...(productFormData.image ? [productFormData.image] : []),
          ...(Array.isArray(productFormData.secondaryImages) ? productFormData.secondaryImages : [])
        ].filter(Boolean)));

        return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-brand-navy p-4 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-crimson block">
                  {editingProduct ? `Product ID: ${editingProduct.id}` : 'Independent Product & Image Entry'}
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Printing Product'}
                </h3>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug (auto if blank)</label>
                  <input
                    type="text"
                    placeholder="e.g. executive-bill-book"
                    value={productFormData.slug}
                    onChange={(e) => setProductFormData({ ...productFormData, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Qty *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productFormData.minQuantity}
                    onChange={(e) => setProductFormData({ ...productFormData, minQuantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* ==================== PRODUCT IMAGE & GALLERY MANAGER ==================== */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-brand-crimson" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Product Image & Gallery Manager
                    </h4>
                  </div>
                  {uploadingImages && (
                    <span className="text-[11px] font-bold text-brand-crimson animate-pulse">
                      Optimizing & uploading...
                    </span>
                  )}
                </div>

                {imageUploadError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-[11px] font-semibold">
                    {imageUploadError}
                  </div>
                )}

                {/* Primary Photo Preview + Upload Control */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <ProductImage
                      src={productFormData.image}
                      alt={productFormData.name || 'Primary Preview'}
                      placeholderLabel={productFormData.name || 'No Primary Image Selected'}
                    />
                  </div>
                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                        Primary / Featured Photograph
                      </span>
                      {productFormData.image && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(productFormData.image)}
                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer bg-brand-navy hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center space-x-1.5 transition">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{productFormData.image ? 'Replace Main Photo' : 'Upload Main Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImages}
                          onChange={handleUploadPrimaryImage}
                          className="hidden"
                        />
                      </label>

                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center space-x-1.5 transition">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Gallery Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingImages}
                          onChange={handleUploadGalleryImages}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Or enter direct image path / URL
                      </label>
                      <input
                        type="text"
                        placeholder="/uploads/products/..."
                        value={productFormData.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductFormData(prev => ({
                            ...prev,
                            image: val,
                            secondaryImages: val
                              ? Array.from(new Set([val, ...(prev.secondaryImages || [])]))
                              : prev.secondaryImages
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-800 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Thumbnails Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">
                      Product Gallery ({currentGallery.length} {currentGallery.length === 1 ? 'image' : 'images'})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Preview, set primary, replace, or delete independently
                    </span>
                  </div>

                  {currentGallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentGallery.map((imgUrl, idx) => {
                        const isPrimary = productFormData.image === imgUrl;
                        return (
                          <div
                            key={`${idx}-${imgUrl.slice(0, 24)}`}
                            className={`bg-white rounded-xl border p-1.5 space-y-1.5 ${isPrimary ? 'border-brand-crimson ring-1 ring-brand-crimson/30' : 'border-slate-200'}`}
                          >
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                              <ProductImage src={imgUrl} alt={`Gallery ${idx + 1}`} />
                              {isPrimary && (
                                <span className="absolute top-1 left-1 bg-brand-crimson text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  Primary
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              {!isPrimary ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryGalleryImage(imgUrl)}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1 rounded flex items-center justify-center space-x-0.5"
                                  title="Set as Primary Image"
                                >
                                  <Star className="w-2.5 h-2.5" />
                                  <span>Primary</span>
                                </button>
                              ) : (
                                <span className="flex-1 text-center font-bold text-brand-crimson py-1">Featured</span>
                              )}

                              <label
                                className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-1 rounded"
                                title="Replace Image"
                              >
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingImages}
                                  onChange={(e) => handleReplaceGallerySlot(idx, e)}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(imgUrl)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1 rounded"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 text-center text-[11px] text-slate-500">
                      No photographs uploaded yet for this product. Upload a unique main photo and optional gallery shots above.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Short Summary</label>
                <input
                  type="text"
                  value={productFormData.tagline}
                  onChange={(e) => setProductFormData({ ...productFormData, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={productFormData.standardSizes}
                    onChange={(e) => setProductFormData({ ...productFormData, standardSizes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paper / Materials</label>
                  <input
                    type="text"
                    value={productFormData.materials}
                    onChange={(e) => setProductFormData({ ...productFormData, materials: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Finishes</label>
                  <input
                    type="text"
                    value={productFormData.finishes}
                    onChange={(e) => setProductFormData({ ...productFormData, finishes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Configurator & Pricing Setup */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Order Configurator & Pricing Rules</h4>
                    <p className="text-[11px] text-slate-500">Controls active fields, options, and pricing calculation on the Configure & Order page.</p>
                  </div>
                  <label className="flex items-center space-x-2 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productFormData.priceUnavailable)}
                      onChange={(e) => setProductFormData({ ...productFormData, priceUnavailable: e.target.checked })}
                      className="rounded text-brand-crimson"
                    />
                    <span>Quote Only (Hide Auto Price)</span>
                  </label>
                </div>

                {/* Admin-Only Visibility & Confidential Supplier Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
                  <label className="flex items-center space-x-2 text-[11px] font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productFormData.enabled !== false}
                      onChange={(e) => setProductFormData({ ...productFormData, enabled: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Visible on Storefront</span>
                  </label>
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[10px] uppercase tracking-wide">
                      Supplier Cost (₹) — Confidential
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productFormData.supplierCost}
                      onChange={(e) => setProductFormData({ ...productFormData, supplierCost: e.target.value })}
                      placeholder="Internal cost per unit/pack"
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[10px] uppercase tracking-wide">
                      Supplier Name — Confidential
                    </label>
                    <input
                      type="text"
                      value={productFormData.supplierName}
                      onChange={(e) => setProductFormData({ ...productFormData, supplierName: e.target.value })}
                      placeholder="e.g. PrintHub Press"
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Starting Price (₹)</label>
                    <input
                      type="number"
                      value={productFormData.startingPrice}
                      onChange={(e) => setProductFormData({ ...productFormData, startingPrice: e.target.value })}
                      placeholder="e.g. 540"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit Base Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productFormData.baseRate}
                      onChange={(e) => setProductFormData({ ...productFormData, baseRate: e.target.value })}
                      placeholder="e.g. 2.50"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pack / Step Size</label>
                    <input
                      type="number"
                      min="1"
                      value={productFormData.packSize}
                      onChange={(e) => setProductFormData({ ...productFormData, packSize: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit Name</label>
                    <input
                      type="text"
                      value={productFormData.unitName}
                      onChange={(e) => setProductFormData({ ...productFormData, unitName: e.target.value })}
                      placeholder="Books / Cards / Sheets"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity Tiers (comma-separated)</label>
                    <input
                      type="text"
                      value={productFormData.quantityTiers}
                      onChange={(e) => setProductFormData({ ...productFormData, quantityTiers: e.target.value })}
                      placeholder="100, 200, 500, 1000"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sheet Pack Single Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productFormData.retailSingleRate}
                      onChange={(e) => setProductFormData({ ...productFormData, retailSingleRate: e.target.value })}
                      placeholder="Optional per-pack rate"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sheet Pack Both-Side Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productFormData.retailBothRate}
                      onChange={(e) => setProductFormData({ ...productFormData, retailBothRate: e.target.value })}
                      placeholder="Optional both-side rate"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-700 mb-1.5">Active Form Fields for This Product</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      ['showMaterial', 'Material / Paper'],
                      ['showSize', 'Size'],
                      ['showFinishing', 'Finishing'],
                      ['showPrinting', 'Printing'],
                      ['showColour', 'Colour Options'],
                      ['showNcr', 'NCR / Non-NCR'],
                      ['showCopyType', 'Copy Type'],
                      ['showBinding', 'Binding'],
                      ['showSetsPerBook', 'Sets per Book']
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productFormData.orderFields?.[key])}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            orderFields: { ...prev.orderFields, [key]: e.target.checked }
                          }))}
                          className="rounded text-brand-crimson"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                    {[
                      ['supportsFoil', 'Foil Stamping'],
                      ['supportsSpotUv', 'Spot UV Gloss'],
                      ['dimensions', 'Per Sq.In Size']
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-1.5 bg-amber-50/70 border border-amber-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-amber-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productFormData[key])}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded text-brand-crimson"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Printing Options</label>
                    <input
                      type="text"
                      value={productFormData.orderFields?.printingOptions || ''}
                      onChange={(e) => setProductFormData((prev) => ({
                        ...prev,
                        orderFields: { ...prev.orderFields, printingOptions: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Colour Options</label>
                    <input
                      type="text"
                      value={productFormData.orderFields?.colourOptions || ''}
                      onChange={(e) => setProductFormData((prev) => ({
                        ...prev,
                        orderFields: { ...prev.orderFields, colourOptions: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {(productFormData.orderFields?.showNcr ||
                  productFormData.orderFields?.showCopyType ||
                  productFormData.orderFields?.showBinding ||
                  productFormData.orderFields?.showSetsPerBook) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-200">
                    {productFormData.orderFields?.showNcr && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">NCR Options (comma-separated)</label>
                        <input
                          type="text"
                          value={productFormData.orderFields?.ncrOptions || ''}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            orderFields: { ...prev.orderFields, ncrOptions: e.target.value }
                          }))}
                          placeholder="NCR (Carbonless), Non-NCR (Maplitho)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                        />
                      </div>
                    )}
                    {productFormData.orderFields?.showCopyType && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Copy Options (comma-separated)</label>
                        <input
                          type="text"
                          value={productFormData.orderFields?.copyOptions || ''}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            orderFields: { ...prev.orderFields, copyOptions: e.target.value }
                          }))}
                          placeholder="Duplicate (1+1), Triplicate (1+2)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                        />
                      </div>
                    )}
                    {productFormData.orderFields?.showBinding && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Binding Options (comma-separated)</label>
                        <input
                          type="text"
                          value={productFormData.orderFields?.bindingOptions || ''}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            orderFields: { ...prev.orderFields, bindingOptions: e.target.value }
                          }))}
                          placeholder="Side Pinning + Perforation, Pad Binding"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                        />
                      </div>
                    )}
                    {productFormData.orderFields?.showSetsPerBook && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sets per Book (comma-separated)</label>
                        <input
                          type="text"
                          value={productFormData.orderFields?.setsOptions || ''}
                          onChange={(e) => setProductFormData((prev) => ({
                            ...prev,
                            orderFields: { ...prev.orderFields, setsOptions: e.target.value }
                          }))}
                          placeholder="50 Sets, 100 Sets"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 text-[11px] text-slate-900 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="bg-brand-crimson hover:bg-brand-red disabled:opacity-50 text-white px-4 py-1.5 rounded-xl font-bold"
                >
                  {uploadingImages ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
