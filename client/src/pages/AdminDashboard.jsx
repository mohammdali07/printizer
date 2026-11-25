import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, FileText, CheckCircle2, Clock, AlertCircle, 
  Send, Download, MessageCircle, RefreshCw, Plus, Trash2, 
  Edit, Eye, Search, Filter, ChevronRight, X, ExternalLink, ShieldCheck, DollarSign,
  UploadCloud, Image as ImageIcon, Star
} from 'lucide-react';
import ProductImage from '../components/ProductImage';

export default function AdminDashboard({ onNavigate }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('prz_admin_token') || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('printizer@2026');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'products'
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [productFormData, setProductFormData] = useState({
    name: '',
    slug: '',
    categoryId: 'business-stationery',
    categoryName: 'Business Stationery',
    tagline: '',
    description: '',
    minQuantity: 100,
    image: '',
    secondaryImages: [],
    standardSizes: 'Standard Size',
    materials: '250g Art Card, 300g Art Card, 350g Art Card',
    finishes: 'Gloss Lamination, Matte Lamination, Raised Spot UV'
  });

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

  // Handle Login
  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim() || 'admin', 
          password: password.trim() || 'printizer@2026' 
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }
      localStorage.setItem('prz_admin_token', data.token);
      setAuthToken(data.token);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('printizer@2026');
    handleLogin();
  };

  const handleLogout = () => {
    localStorage.removeItem('prz_admin_token');
    setAuthToken('');
  };

  // Fetch Dashboard Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, enqRes, prodRes, catRes] = await Promise.all([
        fetch('/api/stats'),
        fetch(`/api/enquiries?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`),
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      const [statsData, enqData, prodData, catData] = await Promise.all([
        statsRes.json(),
        enqRes.json(),
        prodRes.json(),
        catRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (enqData.success) setEnquiries(enqData.data);
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Fetch error:', err);
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
      const res = await fetch(`/api/enquiries/${enquiryId}/send-email`, { method: 'POST' });
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
      const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
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

      const res = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Image upload failed');
      }
      return (data.files || []).map(f => f.url);
    } catch (err) {
      setImageUploadError(err.message || 'Could not upload image.');
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

      const payload = {
        name: productFormData.name,
        slug: productFormData.slug || productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        categoryId: productFormData.categoryId,
        categoryName: categories.find(c => c.id === productFormData.categoryId)?.name || 'Custom',
        tagline: productFormData.tagline,
        description: productFormData.description,
        minQuantity: Number(productFormData.minQuantity) || 100,
        image: primaryImg,
        secondaryImages: normalizedGallery,
        standardSizes: typeof productFormData.standardSizes === 'string' 
          ? productFormData.standardSizes.split(',').map(s => s.trim()).filter(Boolean)
          : productFormData.standardSizes,
        materials: typeof productFormData.materials === 'string'
          ? productFormData.materials.split(',').map(s => s.trim()).filter(Boolean)
          : productFormData.materials,
        finishes: typeof productFormData.finishes === 'string'
          ? productFormData.finishes.split(',').map(s => s.trim()).filter(Boolean)
          : productFormData.finishes
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save product');

      setActionSuccess(editingProduct ? 'Product updated successfully!' : 'New product created!');
      setShowProductModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      setActionSuccess('Product deleted successfully');
      fetchData();
    } catch (err) {
      setActionError(err.message);
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

  // ======================== RENDER MAIN ADMIN DASHBOARD ========================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-brand-navy text-white px-3 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <img 
            src="/images/printizer-logo-horizontal.png" 
            alt="PRINTIZER" 
            className="h-8 sm:h-9 w-auto object-contain bg-white rounded-md p-1"
            onError={(e) => {
              e.target.src = "/images/printizer-logo-horizontal.jpeg";
            }}
          />
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wider text-white">
              PRINTIZER <span className="text-brand-crimson">ADMIN</span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">Everything Your Business Needs to Print.</p>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="hidden md:flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-300 hover:text-white flex items-center space-x-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-[11px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-rose-300 hover:text-white flex items-center space-x-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 px-2.5 py-1.5 rounded-lg text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-5">
        {/* Metric Cards Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalEnquiries}</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-rose-100 bg-rose-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">New</span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block">{stats.newEnquiries}</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-blue-100 bg-blue-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Quoted</span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700 mt-1 block">{stats.quotationPrepared}</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-purple-100 bg-purple-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Sent</span>
              <span className="text-xl sm:text-2xl font-extrabold text-purple-700 mt-1 block">{stats.quotationSent}</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Confirmed</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.confirmed}</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Products</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-700 mt-1 block">{stats.totalProducts}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'enquiries' ? 'border-brand-crimson text-brand-crimson' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Quotation Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'products' ? 'border-brand-crimson text-brand-crimson' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Catalogue ({products.length})
          </button>
        </div>

        {/* ==================== TAB 1: ENQUIRIES ==================== */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
                {[
                  'all',
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
          const filteredAdminProducts = products.filter(p => {
            const matchesCat = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
            const q = productSearch.trim().toLowerCase();
            const matchesSearch = !q ||
              (p.name || '').toLowerCase().includes(q) ||
              (p.slug || '').toLowerCase().includes(q) ||
              (p.categoryName || '').toLowerCase().includes(q);
            return matchesCat && matchesSearch;
          });

          return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Search products by name or slug..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

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

                <span className="text-[11px] text-slate-500 font-semibold">
                  Showing <strong className="text-slate-900">{filteredAdminProducts.length}</strong> products
                </span>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setImageUploadError('');
                  setProductFormData({
                    name: '',
                    slug: '',
                    categoryId: categories[0]?.id || 'business-stationery',
                    categoryName: categories[0]?.name || 'Business Stationery',
                    tagline: '',
                    description: '',
                    minQuantity: 100,
                    image: '',
                    secondaryImages: [],
                    standardSizes: 'Standard Size',
                    materials: '250g Art Card, 350g Art Card',
                    finishes: 'Gloss Lamination, Matte Lamination, Spot UV'
                  });
                  setShowProductModal(true);
                }}
                className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredAdminProducts.map((p) => {
                const galleryCount = Array.from(new Set([
                  ...(p.image ? [p.image] : []),
                  ...(Array.isArray(p.secondaryImages) ? p.secondaryImages : [])
                ].filter(Boolean))).length;

                return (
                <div key={p.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex space-x-3 items-start justify-between">
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
                        <span className="text-[10px] text-slate-600 font-medium">Min: {p.minQuantity}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${galleryCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {galleryCount} {galleryCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setImageUploadError('');
                        const initialGallery = Array.from(new Set([
                          ...(p.image ? [p.image] : []),
                          ...(Array.isArray(p.secondaryImages) ? p.secondaryImages : [])
                        ].filter(Boolean)));
                        setProductFormData({
                          name: p.name,
                          slug: p.slug,
                          categoryId: p.categoryId,
                          categoryName: p.categoryName,
                          tagline: p.tagline || '',
                          description: p.description || '',
                          minQuantity: p.minQuantity || 100,
                          image: p.image || '',
                          secondaryImages: initialGallery,
                          standardSizes: Array.isArray(p.standardSizes) ? p.standardSizes.join(', ') : (p.standardSizes || ''),
                          materials: Array.isArray(p.materials) ? p.materials.join(', ') : (p.materials || ''),
                          finishes: Array.isArray(p.finishes) ? p.finishes.join(', ') : (p.finishes || '')
                        });
                        setShowProductModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                      title="Edit Product & Images"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
          );
        })()}
      </main>

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
