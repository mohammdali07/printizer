import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, CheckCircle2, AlertCircle, Trash2, Edit,
  ShoppingBag, FileText, ArrowRight, MessageCircle, UploadCloud,
  Sparkles, Package, Layers, Send, ExternalLink, Info, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProductImage from '../components/ProductImage';
import { getEffectiveOrderFields, calculateConfiguredOrderPrice } from '../utils/orderPricing';

export default function OrderConfigurePage({
  categories = [],
  products = [],
  initialProductSlug = null,
  orderItems = [],
  onOrderItemsChange,
  onNavigate
}) {
  const formRef = useRef(null);
  const summaryRef = useRef(null);

  // Resolve initial product & category cleanly without forcing customer to re-select
  const resolveTargetProduct = (slug) => {
    if (slug) {
      if (slug === 'visiting-card') {
        const nt = products.find(p => p.slug === 'nt-card');
        if (nt) return nt;
      }
      const found = products.find(p => p.slug === slug || p.id === slug);
      if (found) return found;
    }
    return products[0] || null;
  };

  const initialProd = resolveTargetProduct(initialProductSlug);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialProd?.categoryId || categories[0]?.id || 'business-stationery'
  );
  const [selectedProductSlug, setSelectedProductSlug] = useState(initialProd?.slug || '');

  // Form selection state (product-specific)
  const [customerClass, setCustomerClass] = useState('retail');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [dimWidth, setDimWidth] = useState('3.5');
  const [dimHeight, setDimHeight] = useState('2.0');
  const [finishing, setFinishing] = useState('');
  const [foil, setFoil] = useState('none');
  const [spotUv, setSpotUv] = useState('none');
  const [selectedAddons, setSelectedAddons] = useState({});
  const [printing, setPrinting] = useState('');
  const [colour, setColour] = useState('');
  const [ncrOption, setNcrOption] = useState('');
  const [copyType, setCopyType] = useState('');
  const [bindingOption, setBindingOption] = useState('');
  const [setsPerBook, setSetsPerBook] = useState('');
  const [quantityMode, setQuantityMode] = useState('tier'); // 'tier' | 'custom'
  const [quantity, setQuantity] = useState(100);
  const [customQty, setCustomQty] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('collect');
  const [jobName, setJobName] = useState('');

  const [editingItemId, setEditingItemId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Final Quote Request modal / drawer state
  const [showQuoteSubmitModal, setShowQuoteSubmitModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [artworkFile, setArtworkFile] = useState(null);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedResult, setSubmittedResult] = useState(null);

  const categoryProductsRaw = products.filter(p => p.categoryId === selectedCategoryId);
  const hasNtCardInCat = categoryProductsRaw.some(p => p.slug === 'nt-card');
  const categoryProducts = hasNtCardInCat
    ? categoryProductsRaw.filter(p => p.slug !== 'visiting-card')
    : categoryProductsRaw;
  const activeProduct =
    categoryProducts.find(p => p.slug === selectedProductSlug) ||
    categoryProducts[0] ||
    products[0] ||
    null;

  const activeCategoryObj = categories.find(c => c.id === (activeProduct?.categoryId || selectedCategoryId));
  const cfg = activeProduct ? getEffectiveOrderFields(activeProduct) : null;
  const productImages = activeProduct
    ? Array.from(new Set([
        ...(activeProduct.image ? [activeProduct.image] : []),
        ...(Array.isArray(activeProduct.secondaryImages) ? activeProduct.secondaryImages : [])
      ].filter(Boolean)))
    : [];
  const safeMediaIdx = productImages.length > 0 ? (activeMediaIdx % productImages.length) : 0;

  // Reset carousel index when selected product changes
  useEffect(() => {
    setActiveMediaIdx(0);
  }, [activeProduct?.slug]);

  // Apply defaults for a given product whenever product changes cleanly
  const resetFieldsForProduct = (prod, preset = null) => {
    if (!prod) return;
    const c = getEffectiveOrderFields(prod);
    setCustomerClass(preset?.customerClass || 'retail');
    setMaterial(preset?.material ?? (c.materials[0] || ''));
    setSize(preset?.size ?? (c.sizes[0] || ''));
    setDimWidth(preset?.dimWidth || '3.5');
    setDimHeight(preset?.dimHeight || '2.0');
    setFinishing(preset?.finishing ?? (c.finishes[0] || ''));
    setFoil(preset?.foil || 'none');
    setSpotUv(preset?.spotUv || 'none');
    setSelectedAddons(preset?.selectedAddons || {});
    setPrinting(preset?.printing ?? (c.printingOptions[0] || 'Single Side'));
    setColour(preset?.colour ?? (c.colourOptions[0] || 'Full Color (CMYK)'));
    setNcrOption(preset?.ncrOption ?? (c.ncrOptions[0] || ''));
    setCopyType(preset?.copyType ?? (c.copyOptions[0] || ''));
    setBindingOption(preset?.bindingOption ?? (c.bindingOptions[0] || ''));
    setSetsPerBook(preset?.setsPerBook ?? (c.setsOptions[0] || ''));

    const initQty = preset?.quantity || c.minQuantity || c.quantityTiers[0] || 100;
    const inTiers = c.quantityTiers.includes(Number(initQty));
    setQuantityMode(inTiers ? 'tier' : 'custom');
    setQuantity(Number(initQty));
    setCustomQty(inTiers ? '' : String(initQty));

    setDeliveryMode(preset?.deliveryMode || 'collect');
    setJobName(preset?.jobName || '');
    setFormError('');
  };

  // Respond to route parameter change (`#configure/<slug>`)
  useEffect(() => {
    if (!initialProductSlug || products.length === 0) return;
    const match = resolveTargetProduct(initialProductSlug);
    if (match) {
      setSelectedCategoryId(match.categoryId);
      setSelectedProductSlug(match.slug);
      setEditingItemId(null);
      resetFieldsForProduct(match);
    }
  }, [initialProductSlug, products.length]);

  // Ensure initial state populated if products loaded async
  useEffect(() => {
    if (activeProduct && !material && !printing && !quantity) {
      resetFieldsForProduct(activeProduct);
    } else if (activeProduct && !selectedProductSlug) {
      setSelectedCategoryId(activeProduct.categoryId);
      setSelectedProductSlug(activeProduct.slug);
      resetFieldsForProduct(activeProduct);
    }
  }, [activeProduct?.slug]);

  const handleCategoryChange = (newCatId) => {
    setSelectedCategoryId(newCatId);
    setEditingItemId(null);
    setFormNotice('');
    const nextList = products.filter(p => p.categoryId === newCatId);
    const firstProd = nextList[0] || null;
    if (firstProd) {
      setSelectedProductSlug(firstProd.slug);
      resetFieldsForProduct(firstProd);
    } else {
      setSelectedProductSlug('');
    }
  };

  const handleProductChange = (newSlug) => {
    setSelectedProductSlug(newSlug);
    setEditingItemId(null);
    setFormNotice('');
    const prod = categoryProducts.find(p => p.slug === newSlug) || products.find(p => p.slug === newSlug);
    if (prod) {
      resetFieldsForProduct(prod);
    }
  };

  const activeNumericQty = quantityMode === 'custom'
    ? (parseInt(customQty, 10) || 0)
    : Number(quantity);

  const pricing = activeProduct && cfg
    ? calculateConfiguredOrderPrice(activeProduct, {
        customerClass,
        material,
        size,
        dimWidth,
        dimHeight,
        finishing,
        foil,
        spotUv,
        selectedAddons,
        printing,
        colour,
        ncrOption,
        copyType,
        bindingOption,
        setsPerBook,
        quantity: activeNumericQty,
        deliveryMode
      })
    : { hasPrice: false, quoteOnly: true };

  // Dynamic page heading: e.g. "Visiting Card Configuration", "Cash Memo Configuration"
  const getConfigHeading = (prodName) => {
    if (!prodName) return 'Order Configuration';
    const clean = prodName.replace(/ Book$/i, (m, offset, str) => {
      if (/Cash Memo Book|Delivery Challan Book/i.test(str)) return '';
      return m;
    });
    return `${clean} Configuration`;
  };

  // Validate and add/update item in order summary
  const handleAddOrUpdateOrder = (e) => {
    e.preventDefault();
    setFormError('');
    setFormNotice('');

    if (!activeProduct || !cfg) {
      setFormError('Please select a valid product to configure.');
      return;
    }
    if (cfg.showMaterial && !material) {
      setFormError('Please select a product material / paper stock.');
      return;
    }
    if (cfg.showSize && !cfg.hasDimensions && !size) {
      setFormError('Please select a product size.');
      return;
    }
    if (cfg.pricingKind === 'area' && cfg.hasDimensions) {
      const w = parseFloat(dimWidth);
      const h = parseFloat(dimHeight);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
        setFormError('Please enter valid positive Width and Height dimensions in inches.');
        return;
      }
    }
    if (cfg.showPrinting && !printing) {
      setFormError('Please select a printing option.');
      return;
    }
    if (cfg.showColour && !colour) {
      setFormError('Please select a colour option.');
      return;
    }
    if (!Number.isFinite(activeNumericQty) || activeNumericQty < cfg.minQuantity) {
      setFormError(`Minimum order quantity for ${activeProduct.name} is ${cfg.minQuantity.toLocaleString('en-IN')} ${cfg.unitName}.`);
      return;
    }

    const activeAddonsList = Object.entries(selectedAddons)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const specSummary = [];
    if (cfg.showMaterial && material) specSummary.push({ label: 'Material', value: material });
    if (cfg.pricingKind === 'area' && cfg.hasDimensions) {
      specSummary.push({ label: 'Size', value: `${dimWidth}" × ${dimHeight}" (${pricing.areaSqIn || ''} sq.in)` });
    } else if (cfg.showSize && size) {
      specSummary.push({ label: 'Size', value: size });
    }
    if (cfg.showPrinting && printing) specSummary.push({ label: 'Printing', value: printing });
    if (cfg.showColour && colour) specSummary.push({ label: 'Colour', value: colour });
    if (cfg.showNcr && ncrOption) specSummary.push({ label: 'NCR', value: ncrOption });
    if (cfg.showCopyType && copyType) specSummary.push({ label: 'Copies', value: copyType });
    if (cfg.showBinding && bindingOption) specSummary.push({ label: 'Binding', value: bindingOption });
    if (cfg.showSetsPerBook && setsPerBook) specSummary.push({ label: 'Sets', value: setsPerBook });
    if (cfg.showFinishing && finishing) {
      specSummary.push({ label: 'Finishing', value: [finishing, ...activeAddonsList].filter(Boolean).join(' + ') });
    } else if (activeAddonsList.length > 0) {
      specSummary.push({ label: 'Finishing', value: activeAddonsList.join(' + ') });
    }
    if (cfg.supportsFoil && foil !== 'none') {
      specSummary.push({ label: 'Foil', value: foil === 'gold' ? 'Gold Foil' : 'Silver Foil' });
    }
    if (cfg.supportsSpotUv && spotUv !== 'none') {
      specSummary.push({ label: 'Spot UV', value: 'Raised Spot UV' });
    }
    if (cfg.showDelivery) {
      specSummary.push({
        label: 'Delivery',
        value: deliveryMode === 'courier' ? 'Courier' : (deliveryMode === 'transport' ? 'Transport' : 'Office Pickup')
      });
    }
    if (jobName.trim()) specSummary.push({ label: 'Job Ref', value: jobName.trim() });

    const newItem = {
      lineId: editingItemId || `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: activeProduct.id,
      productSlug: activeProduct.slug,
      productName: activeProduct.name,
      categoryId: activeProduct.categoryId,
      categoryName: activeProduct.categoryName,
      image: activeProduct.image,
      quantity: pricing.hasPrice ? pricing.qty : activeNumericQty,
      unitName: cfg.unitName,
      hasPrice: Boolean(pricing.hasPrice),
      unitPrice: pricing.hasPrice ? pricing.unitPrice : null,
      totalAmount: pricing.hasPrice ? pricing.totalAmount : null,
      customerClass,
      specs: specSummary,
      rawSelection: {
        customerClass,
        material,
        size,
        dimWidth,
        dimHeight,
        finishing,
        foil,
        spotUv,
        selectedAddons,
        printing,
        colour,
        ncrOption,
        copyType,
        bindingOption,
        setsPerBook,
        quantity: pricing.hasPrice ? pricing.qty : activeNumericQty,
        deliveryMode,
        jobName
      }
    };

    const nextList = editingItemId
      ? orderItems.map(it => (it.lineId === editingItemId ? newItem : it))
      : [...orderItems, newItem];

    onOrderItemsChange(nextList);
    setFormNotice(
      editingItemId
        ? `Updated "${activeProduct.name}" in your order summary.`
        : `Added "${activeProduct.name}" (${newItem.quantity.toLocaleString('en-IN')} ${newItem.unitName}) to Order Summary.`
    );
    setEditingItemId(null);

    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleEditOrderItem = (item) => {
    const prod = products.find(p => p.slug === item.productSlug || p.id === item.productId);
    if (!prod) return;
    setSelectedCategoryId(prod.categoryId);
    setSelectedProductSlug(prod.slug);
    setEditingItemId(item.lineId);
    resetFieldsForProduct(prod, item.rawSelection || {});
    setFormNotice(`Editing configured item: ${item.productName}`);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRemoveOrderItem = (lineId) => {
    const filtered = orderItems.filter(it => it.lineId !== lineId);
    onOrderItemsChange(filtered);
    if (editingItemId === lineId) {
      setEditingItemId(null);
    }
  };

  const orderTotals = orderItems.reduce(
    (acc, it) => {
      if (it.hasPrice && Number.isFinite(it.totalAmount)) {
        acc.pricedTotal += it.totalAmount;
        acc.pricedCount += 1;
      } else {
        acc.quoteOnlyCount += 1;
      }
      return acc;
    },
    { pricedTotal: 0, pricedCount: 0, quoteOnlyCount: 0 }
  );

  // Build readable multi-item WhatsApp quote summary (includes material, printing, finishing, quantity, job name & price)
  const buildOrderWhatsAppUrl = (refNo = null) => {
    const linesText = orderItems.map((it, idx) => {
      const specsStr = it.specs.map(s => `${s.label}: ${s.value}`).join(' | ');
      const priceStr = it.hasPrice ? `₹ ${it.totalAmount.toLocaleString('en-IN')} (₹${it.unitPrice}/unit)` : 'Request a Quote';
      return `${idx + 1}. ${it.productName} — Qty: ${it.quantity.toLocaleString('en-IN')} ${it.unitName} — Amount: ${priceStr}\n   ${specsStr}`;
    }).join('\n');

    const text = `Hello PRINTIZER,
I would like to request an official quotation for the following configured order:
${refNo ? `Enquiry Ref: ${refNo}\n` : ''}
${linesText}

Total Estimated Amount: ${orderTotals.pricedCount > 0 ? `₹ ${orderTotals.pricedTotal.toLocaleString('en-IN')}` : 'Custom Quote'}${orderTotals.quoteOnlyCount > 0 ? ` (+ ${orderTotals.quoteOnlyCount} custom quoted item)` : ''}
${customerName ? `Customer: ${customerName}` : ''}
${businessName ? `Business: ${businessName}` : ''}

Please share the final quotation and artwork instructions. Thank you!`;

    return `https://wa.me/919898351920?text=${encodeURIComponent(text)}`;
  };

  const handleSubmitFinalQuote = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!customerName.trim()) {
      setSubmitError('Please enter your name.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setSubmitError('Please provide your WhatsApp / contact number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please provide a valid email address.');
      return;
    }

    try {
      setSubmittingQuote(true);
      const summaryProductName = orderItems.length === 1
        ? orderItems[0].productName
        : `${orderItems.length} Configured Products (${orderItems.map(i => i.productName).slice(0, 3).join(', ')})`;

      const itemizedRequirements = orderItems.map((it, idx) => {
        const specsStr = it.specs.map(s => `${s.label}: ${s.value}`).join(', ');
        return `[#${idx + 1}] ${it.productName} — Qty: ${it.quantity} ${it.unitName} — Price: ${it.hasPrice ? `₹${it.totalAmount}` : 'Custom Quote'} (${specsStr})`;
      }).join('\n');

      const fd = new FormData();
      fd.append('customerName', customerName.trim());
      fd.append('businessName', businessName.trim());
      fd.append('whatsappNumber', whatsappNumber.trim());
      fd.append('email', email.trim());
      fd.append('productSlug', orderItems[0]?.productSlug || activeProduct?.slug || 'custom-order');
      fd.append('productName', summaryProductName);
      fd.append('quantity', String(orderItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0)));
      fd.append('dimensions', orderItems.map(i => i.specs.find(s => s.label === 'Size')?.value).filter(Boolean).join('; ') || 'Multiple');
      fd.append('material', orderItems.map(i => i.specs.find(s => s.label === 'Material')?.value).filter(Boolean).join('; ') || 'Multiple');
      fd.append('finishing', orderItems.map(i => i.specs.find(s => s.label === 'Finishing')?.value).filter(Boolean).join('; ') || 'Configured');
      fd.append('additionalRequirements', `${itemizedRequirements}${additionalNotes.trim() ? `\n\nCustomer Notes: ${additionalNotes.trim()}` : ''}`);
      fd.append('estimatedPrice', orderTotals.pricedTotal > 0 ? String(orderTotals.pricedTotal) : '');
      fd.append('selectedOptions', JSON.stringify({ orderItems }));
      if (artworkFile) fd.append('artwork', artworkFile);

      const res = await fetch('/api/enquiries', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not submit quotation enquiry.');
      }

      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setSubmittedResult(json);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen pb-24">
      {/* Top Breadcrumb & Page Title Strip */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <button onClick={() => onNavigate('home')} className="hover:text-slate-900 font-medium">
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                {activeCategoryObj && (
                  <>
                    <button
                      onClick={() => onNavigate('category', activeCategoryObj.id)}
                      className="hover:text-slate-900 font-medium"
                    >
                      {activeCategoryObj.name}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
                <span className="text-brand-crimson font-bold truncate">
                  {getConfigHeading(activeProduct?.name)}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {getConfigHeading(activeProduct?.name)}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {activeProduct && (
                <button
                  type="button"
                  onClick={() => onNavigate('product', activeProduct.slug)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Details &amp; Gallery</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-brand-crimson" />
                <span>Order Summary ({orderItems.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container (printizer-main split workspace: Left Form | Right ProductMedia) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6" ref={formRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT COLUMN (Category + Add Order Form) */}
          <div className="lg:col-span-6 space-y-4 min-w-0">

            {/* CARD 1: SELECT CATEGORY */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-2xs">
              <label
                htmlFor="config-category-select"
                className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2"
              >
                Select Category
              </label>
              <select
                id="config-category-select"
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition cursor-pointer"
              >
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({count} Products)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* CARD 2: ADD ORDER FORM */}
            <form
              onSubmit={handleAddOrUpdateOrder}
              className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5"
            >
              {/* Header Row (matching printizer-main Add Order + View file upload instructions) */}
              <div className="space-y-2 pb-2 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="/images/printizer-icon.png"
                      alt="PRINTIZER"
                      className="w-6 h-6 object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      {editingItemId ? 'Edit Cart Item' : 'Add Order'}
                    </h2>
                  </div>

                  {editingItemId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemId(null);
                        resetFieldsForProduct(activeProduct);
                        setFormNotice('');
                      }}
                      className="text-xs font-bold text-brand-crimson hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(true)}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#1d4ed8] hover:text-[#1e3a8a] underline underline-offset-2 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>View file upload instructions</span>
                </button>
              </div>

          {formNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formNotice}</span>
            </div>
          )}

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* TWO-COLUMN RESPONSIVE FORM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 items-start">

            {/* ==================== LEFT COLUMN ==================== */}
            <div className="space-y-4">
              {/* 1. Select Product */}
              <div>
                <label htmlFor="order-product-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Select Product <span className="text-brand-crimson">*</span>
                </label>
                <select
                  id="order-product-select"
                  value={activeProduct?.slug || ''}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                >
                  {categoryProducts.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Foil & Spot UV side-by-side (matching screenshot) */}
              {(cfg?.supportsFoil || cfg?.supportsSpotUv) && (
                <div className="grid grid-cols-2 gap-3.5">
                  {cfg.supportsFoil && (
                    <div>
                      <label htmlFor="order-foil-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Foil
                      </label>
                      <select
                        id="order-foil-select"
                        value={foil}
                        onChange={(e) => setFoil(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800 transition"
                      >
                        <option value="none">No Foil</option>
                        <option value="gold">
                          Gold Foil {cfg.priceSheets?.[customerClass]?.foilGold ? `(+₹${cfg.priceSheets[customerClass].foilGold})` : ''}
                        </option>
                        <option value="silver">
                          Silver Foil {cfg.priceSheets?.[customerClass]?.foilSilver ? `(+₹${cfg.priceSheets[customerClass].foilSilver})` : ''}
                        </option>
                      </select>
                    </div>
                  )}

                  {cfg.supportsSpotUv && (
                    <div>
                      <label htmlFor="order-spotuv-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Spot UV
                      </label>
                      <select
                        id="order-spotuv-select"
                        value={spotUv}
                        onChange={(e) => setSpotUv(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800 transition"
                      >
                        <option value="none">No Spot UV</option>
                        <option value="spot-uv">
                          Spot UV {cfg.priceSheets?.[customerClass]?.spotUvSingle ? `(+₹${cfg.priceSheets[customerClass].spotUvSingle})` : ''}
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Material & Size (paired cleanly when standard; dimensions if area-priced) */}
              {cfg?.pricingKind === 'area' && cfg?.hasDimensions ? (
                <div className="space-y-3">
                  {cfg?.showMaterial && (
                    <div>
                      <label htmlFor="order-material-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Select Material / Paper Type <span className="text-brand-crimson">*</span>
                      </label>
                      <select
                        id="order-material-select"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                      >
                        {cfg.materials.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs sm:text-[13px] font-bold text-slate-800">
                        Dimensions (Inches) <span className="text-brand-crimson">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-brand-crimson">Rounded to ¼&quot;</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        placeholder="Width (in)"
                        value={dimWidth}
                        onChange={(e) => setDimWidth(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      />
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        placeholder="Height (in)"
                        value={dimHeight}
                        onChange={(e) => setDimHeight(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      />
                    </div>
                    {pricing.areaSqIn && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Billable Area: <strong className="text-slate-800">{pricing.areaSqIn} sq. inch</strong>
                      </p>
                    )}
                  </div>
                </div>
              ) : (cfg?.showMaterial || cfg?.showSize) && (
                <div className="space-y-4">
                  {cfg.showMaterial && (
                    <div>
                      <label htmlFor="order-material-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        {activeProduct?.slug === 'visiting-card' ? 'Select Card / Material Option' : 'Paper / Material'} <span className="text-brand-crimson">*</span>
                      </label>
                      <select
                        id="order-material-select"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                      >
                        {cfg.materials.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cfg.showSize && (
                    <div>
                      <label htmlFor="order-size-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Size <span className="text-brand-crimson">*</span>
                      </label>
                      <select
                        id="order-size-select"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                      >
                        {cfg.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Finishing Options + sheet finishing toggles */}
              {cfg?.showFinishing && (
                <div className="space-y-2.5">
                  <div>
                    <label htmlFor="order-finishing-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Finishing Options
                    </label>
                    <select
                      id="order-finishing-select"
                      value={finishing}
                      onChange={(e) => setFinishing(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                    >
                      {cfg.finishes.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {cfg.priceSheets?.[customerClass]?.finishing && (
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'halfBlade', label: 'Half Blade' },
                        { key: 'creasing', label: 'Creasing' },
                        { key: 'perforation', label: 'Perforate' },
                        { key: 'die', label: 'Die Cutting' },
                        { key: 'punching', label: 'Punching' },
                        { key: 'folding', label: 'Folding' }
                      ]
                        .filter(a => cfg.priceSheets[customerClass].finishing[a.key] != null)
                        .map(addon => {
                          const fee = cfg.priceSheets[customerClass].finishing[addon.key];
                          const active = Boolean(selectedAddons[addon.key]);
                          return (
                            <button
                              key={addon.key}
                              type="button"
                              onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.key]: !prev[addon.key] }))}
                              className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition ${
                                active
                                  ? 'bg-brand-navy text-white border-brand-navy'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {addon.label} (+₹{fee})
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Conditional Product-Specific Book Fields (NCR / Copy Type / Binding / Sets) */}
              {(cfg?.showNcr || cfg?.showCopyType || cfg?.showBinding || cfg?.showSetsPerBook) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {cfg.showNcr && (
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        NCR / Paper Carbon Option
                      </label>
                      <select
                        value={ncrOption}
                        onChange={(e) => setNcrOption(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        {cfg.ncrOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cfg.showCopyType && (
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Copy Type (Duplicate / Triplicate)
                      </label>
                      <select
                        value={copyType}
                        onChange={(e) => setCopyType(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        {cfg.copyOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cfg.showBinding && (
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Binding Option
                      </label>
                      <select
                        value={bindingOption}
                        onChange={(e) => setBindingOption(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        {cfg.bindingOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cfg.showSetsPerBook && (
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Number of Sets
                      </label>
                      <select
                        value={setsPerBook}
                        onChange={(e) => setSetsPerBook(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        {cfg.setsOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Job Name (clean input matching screenshot bottom-left) */}
              <div>
                <label htmlFor="order-job-name" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Job Name
                </label>
                <input
                  id="order-job-name"
                  type="text"
                  placeholder="Please enter job name"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            {/* ==================== RIGHT COLUMN ==================== */}
            <div className="space-y-4">
              {/* 1. Select Printing */}
              {cfg?.showPrinting && (
                <div>
                  <label htmlFor="order-printing-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Select Printing <span className="text-brand-crimson">*</span>
                  </label>
                  <select
                    id="order-printing-select"
                    value={printing}
                    onChange={(e) => setPrinting(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                  >
                    {cfg.printingOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. Select Colour Options */}
              {cfg?.showColour && (
                <div>
                  <label htmlFor="order-colour-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Select Colour Options <span className="text-brand-crimson">*</span>
                  </label>
                  <select
                    id="order-colour-select"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                  >
                    {cfg.colourOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 3. Select Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="order-qty-select" className="text-xs sm:text-[13px] font-bold text-slate-800">
                    Select Quantity <span className="text-brand-crimson">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Min: {cfg?.minQuantity?.toLocaleString('en-IN')} {cfg?.unitName}
                  </span>
                </div>

                <select
                  id="order-qty-select"
                  value={quantityMode === 'custom' ? '__custom__' : String(quantity)}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setQuantityMode('custom');
                      setCustomQty(String(quantity || cfg?.minQuantity || 100));
                    } else {
                      setQuantityMode('tier');
                      setQuantity(Number(e.target.value));
                    }
                  }}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-medium text-slate-800 transition"
                >
                  {(cfg?.quantityTiers || []).map((q) => (
                    <option key={q} value={String(q)}>
                      {q.toLocaleString('en-IN')} {cfg?.unitName}
                    </option>
                  ))}
                  <option value="__custom__">Custom Quantity (Enter Exact Count)</option>
                </select>

                {quantityMode === 'custom' && (
                  <input
                    type="number"
                    min={cfg?.minQuantity || 1}
                    step={cfg?.packSize || 1}
                    placeholder={`Minimum ${cfg?.minQuantity || 1}`}
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="mt-2 w-full bg-white border border-blue-400 focus:outline-none rounded-lg py-2.5 px-3.5 text-sm font-semibold text-slate-900"
                  />
                )}
              </div>

              {/* 4. Delivery & Billing Class */}
              {((cfg?.showDelivery) || (cfg?.showBilling && cfg?.priceSheets)) && (
                <div className={`grid gap-3.5 ${cfg?.showDelivery && cfg?.showBilling && cfg?.priceSheets ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {cfg?.showDelivery && (
                    <div>
                      <label htmlFor="order-delivery-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Delivery Option
                      </label>
                      <select
                        id="order-delivery-select"
                        value={deliveryMode}
                        onChange={(e) => setDeliveryMode(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        <option value="collect">Office Pickup (Free)</option>
                        <option value="courier">
                          Courier (+₹{cfg.priceSheets?.[customerClass]?.courierPerPack || 60}/pack)
                        </option>
                        <option value="transport">
                          Transport (+₹{cfg.priceSheets?.[customerClass]?.transportPerParcel || 300}/parcel)
                        </option>
                      </select>
                    </div>
                  )}

                  {cfg?.showBilling && cfg?.priceSheets && (
                    <div>
                      <label htmlFor="order-billing-select" className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Billing Class
                      </label>
                      <select
                        id="order-billing-select"
                        value={customerClass}
                        onChange={(e) => setCustomerClass(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg py-2.5 px-3 text-sm font-medium text-slate-800"
                      >
                        <option value="retail">Retail Rate (Net)</option>
                        <option value="gst">GST Invoice (+18%)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 5. AMOUNT (CLEAN GREY READ-ONLY BOX MATCHING SCREENSHOT) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-[13px] font-bold text-slate-800">
                    Amount
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    {pricing.hasPrice
                      ? `Estimated Total Amount • ₹${pricing.unitPrice.toLocaleString('en-IN')}/${cfg?.unitName?.replace(/s$/i, '').toLowerCase() || 'unit'}`
                      : 'Custom Specification'}
                  </span>
                </div>

                {pricing.hasPrice ? (
                  <div className="space-y-1.5">
                    <div
                      data-testid="order-estimated-total"
                      className="w-full bg-[#e5e9f0] border border-slate-200 rounded-lg py-2.5 px-3.5 flex items-center justify-between text-slate-900"
                    >
                      <span className="text-base font-extrabold tracking-tight">
                        ₹ {pricing.totalAmount.toLocaleString('en-IN')}.00
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {pricing.qty.toLocaleString('en-IN')} {pricing.unitName}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 px-0.5">
                      ₹{pricing.baseAmount.toLocaleString('en-IN')}.00 per {pricing.qty.toLocaleString('en-IN')} {cfg?.unitName?.toLowerCase() || 'pieces'}
                    </p>

                    {(pricing.foilExtra > 0 || pricing.spotUvExtra > 0 || pricing.finishingExtra > 0 || pricing.deliveryCharge > 0 || pricing.gstAmount > 0) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 px-0.5">
                        <span>Base: ₹{pricing.baseAmount.toLocaleString('en-IN')}</span>
                        {pricing.foilExtra > 0 && <span>Foil: +₹{pricing.foilExtra.toLocaleString('en-IN')}</span>}
                        {pricing.spotUvExtra > 0 && <span>Spot UV: +₹{pricing.spotUvExtra.toLocaleString('en-IN')}</span>}
                        {pricing.finishingExtra > 0 && <span>Finishing: +₹{pricing.finishingExtra.toLocaleString('en-IN')}</span>}
                        {pricing.deliveryCharge > 0 && <span>Delivery: +₹{pricing.deliveryCharge.toLocaleString('en-IN')}</span>}
                        {pricing.gstAmount > 0 && <span className="text-brand-crimson font-semibold">GST: +₹{pricing.gstAmount.toLocaleString('en-IN')}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-lg py-2.5 px-3.5 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">Request a Quote</span>
                    <span className="text-[11px] font-semibold text-amber-700">Custom quoted by prepress team</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM-RIGHT ACTION BUTTON: ADD TO CART */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto min-w-[175px] bg-gradient-to-r from-[#e83e8c] via-brand-crimson to-[#5a67f2] hover:opacity-95 text-white font-bold text-sm py-3 px-8 rounded-tl-2xl rounded-tr-sm rounded-b-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{editingItemId ? 'Update Cart Item' : 'Add to Cart'}</span>
            </button>
          </div>
        </form>
          </div>

          {/* RIGHT COLUMN: PRODUCT MEDIA & DESCRIPTION SHOWCASE (MATCHING printizer-main ProductMedia) */}
          <div className="lg:col-span-6 min-w-0">
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs h-full flex flex-col justify-between space-y-4">
              {activeProduct ? (
                <>
                  <div className="space-y-4">
                    {/* Studio Photo Carousel */}
                    <div className="relative aspect-[5/3] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200/70">
                      <ProductImage
                        src={productImages[safeMediaIdx] || activeProduct.image}
                        alt={activeProduct.name}
                        placeholderLabel={activeProduct.name}
                        eager={true}
                        imgClassName="w-full h-full object-cover"
                      />

                      {productImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveMediaIdx((safeMediaIdx - 1 + productImages.length) % productImages.length)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
                            aria-label="Previous product photo"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMediaIdx((safeMediaIdx + 1) % productImages.length)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
                            aria-label="Next product photo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {safeMediaIdx + 1} / {productImages.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip when product has >1 photo */}
                    {productImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {productImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveMediaIdx(idx)}
                            className={`w-16 h-12 rounded-md overflow-hidden border-2 shrink-0 transition ${
                              idx === safeMediaIdx
                                ? 'border-brand-crimson ring-1 ring-brand-crimson/30'
                                : 'border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <ProductImage src={imgUrl} alt={`${activeProduct.name} ${idx + 1}`} imgClassName="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Product Name & Badges */}
                    <div className="space-y-1.5">
                      <h2 className="text-2xl sm:text-[28px] font-bold text-brand-crimson leading-tight">
                        {activeProduct.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                          {activeProduct.categoryName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                          MOQ: {cfg?.minQuantity?.toLocaleString('en-IN')} {cfg?.unitName}
                        </span>
                        {cfg?.hsnCode && (
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                            HSN: {cfg.hsnCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Underlined Description + Specifications (matching ProductMedia.svelte) */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-brand-navy underline underline-offset-4">
                        Description
                      </h3>
                      <div className="max-h-[260px] overflow-y-auto pr-1 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2.5">
                        {activeProduct.tagline && (
                          <p className="font-semibold text-slate-800">{activeProduct.tagline}</p>
                        )}
                        {(activeProduct.description || '')
                          .split(/\n{2,}/)
                          .filter(Boolean)
                          .map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}

                        {cfg?.materials?.length > 0 && (
                          <p>
                            <strong className="text-slate-800">Available Paper / Materials:</strong>{' '}
                            {cfg.materials.join(', ')}
                          </p>
                        )}
                        {cfg?.sizes?.length > 0 && (
                          <p>
                            <strong className="text-slate-800">Standard Sizes:</strong>{' '}
                            {cfg.sizes.join(', ')}
                          </p>
                        )}
                        {cfg?.finishes?.length > 0 && (
                          <p>
                            <strong className="text-slate-800">Finishing Options:</strong>{' '}
                            {cfg.finishes.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Spec Sheet Footer Link */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium">
                      Free soft proof before bulk print
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('product', activeProduct.slug)}
                      className="text-brand-crimson hover:underline font-bold inline-flex items-center space-x-1"
                    >
                      <span>View Full Technical Spec Sheet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">
                  Select a product to view its studio photography, specifications, and description.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: ORDER SUMMARY (MULTI-PRODUCT QUOTE LIST) */}
        <section ref={summaryRef} className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden scroll-mt-24">
          <div className="bg-brand-navy p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-brand-crimson" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Order Summary ({orderItems.length} {orderItems.length === 1 ? 'Product' : 'Products'})
                </h2>
                <p className="text-xs text-slate-300">
                  Review, edit, or remove configured products before submitting your quotation request.
                </p>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 block">Order Total</span>
                <span className="text-xl font-black text-white">
                  {orderTotals.pricedCount > 0 ? `₹ ${orderTotals.pricedTotal.toLocaleString('en-IN')}` : 'Request a Quote'}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {orderItems.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Your Order Summary is Empty</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Configure specifications for {activeProduct?.name || 'any printing product'} above and click <strong>Add Order</strong> to add it here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, idx) => (
                  <div
                    key={item.lineId}
                    className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                        <ProductImage src={item.image} alt={item.productName} placeholderLabel={item.productName} />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black bg-brand-navy text-white px-2 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-crimson">
                            {item.categoryName}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {item.specs.map((sp, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-medium"
                            >
                              <strong className="text-slate-900">{sp.label}:</strong> {sp.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-xs font-bold text-slate-600">
                          Qty: <span className="text-slate-900">{item.quantity.toLocaleString('en-IN')} {item.unitName}</span>
                        </div>
                        {item.hasPrice ? (
                          <>
                            <div className="text-[11px] text-slate-400">
                              Unit: ₹ {item.unitPrice?.toLocaleString('en-IN')}
                            </div>
                            <div className="text-base sm:text-lg font-black text-slate-900">
                              ₹ {item.totalAmount?.toLocaleString('en-IN')}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg mt-1">
                            Request a Quote
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditOrderItem(item)}
                          className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderItem(item.lineId)}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Footer Bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold">
                      Combined Estimate ({orderItems.length} configured {orderItems.length === 1 ? 'item' : 'items'})
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {orderTotals.pricedCount > 0 ? `₹ ${orderTotals.pricedTotal.toLocaleString('en-IN')}` : 'Request a Quote'}
                      {orderTotals.quoteOnlyCount > 0 && (
                        <span className="text-xs font-bold text-amber-700 ml-2">
                          (+ {orderTotals.quoteOnlyCount} custom quoted)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs px-4 py-3 rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Product</span>
                    </button>

                    <a
                      href={buildOrderWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enquire on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedResult(null);
                        setSubmitError('');
                        setShowQuoteSubmitModal(true);
                      }}
                      className="bg-brand-crimson hover:bg-brand-red text-white font-bold text-xs px-4 py-3 rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Request Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* FILE UPLOAD & ARTWORK INSTRUCTIONS MODAL */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-brand-navy px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-brand-crimson" />
                <h3 className="text-sm font-extrabold">File Upload &amp; Prepress Instructions</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-300 hover:text-white p-1"
                aria-label="Close instructions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 leading-relaxed">
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Accepted Formats:</strong> CorelDRAW (.CDR), Adobe Illustrator (.AI), Print-Ready PDF, or high-resolution PNG/JPEG.</li>
                <li><strong>Color Mode &amp; Resolution:</strong> Prepare artwork in <strong>CMYK</strong> at <strong>300 DPI</strong> for sharp offset/digital output.</li>
                <li><strong>Bleed &amp; Safe Margin:</strong> Keep <strong>3 mm bleed</strong> outside the trim size and keep critical text 4 mm inside the cut edge.</li>
                <li><strong>Fonts:</strong> Convert all text to <strong>Curves / Outlines</strong> before exporting.</li>
                <li><strong>Spot UV / Foil Mask:</strong> Provide a separate 100% K vector layer for Foil or Raised Spot UV areas.</li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(false)}
                  className="bg-brand-navy text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINAL MULTI-ITEM REQUEST QUOTE MODAL */}
      {showQuoteSubmitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-crimson block">
                  Official PRINTIZER Quotation Request
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {submittedResult ? 'Quotation Request Received' : `Submit Order (${orderItems.length} Products)`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteSubmitModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2"
              >
                Close
              </button>
            </div>

            <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
              {submittedResult ? (
                <div className="text-center space-y-5 py-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                      Reference: {submittedResult.referenceNo}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      Thank You, {customerName}!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Your configured {orderItems.length}-item printing quote has been saved for our team.
                    </p>
                  </div>

                  <a
                    href={buildOrderWhatsAppUrl(submittedResult.referenceNo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Continue on WhatsApp (+91 98983 51920)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQuoteSubmitModal(false);
                      onOrderItemsChange([]);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear Summary &amp; Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFinalQuote} className="space-y-4 text-xs">
                  {submitError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl font-semibold flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98983 51920"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Upload Print Artwork (CDR / PDF / AI / PNG — Optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Additional Instructions</label>
                    <textarea
                      rows="2"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any custom die-line, packaging, or dispatch instructions..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full bg-brand-crimson hover:bg-brand-red disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingQuote ? 'Submitting Quotation...' : 'Submit Official Quote Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
