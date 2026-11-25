import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ChevronRight, CheckCircle2, 
  UploadCloud, ShieldCheck, Sparkles, Layers, FileText, 
  Truck, Clock, AlertCircle, HelpCircle, Eye, Check, X,
  FileCheck, Printer, ArrowLeft, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProductImage from '../components/ProductImage';

export default function ProductDetailPage({ 
  product, 
  onNavigate, 
  onRequestQuote,
  allProducts = []
}) {
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested printing collateral could not be located.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-crimson px-5 py-2.5 rounded-full shadow-md hover:bg-brand-red transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </button>
      </div>
    );
  }

  // Active gallery image
  const [activeImage, setActiveImage] = useState(product.image || '');

  // Available options from product configuration
  const sizes = product.standardSizes && product.standardSizes.length > 0
    ? product.standardSizes
    : ['Standard Commercial Size'];

  const materials = product.materials && product.materials.length > 0
    ? product.materials
    : ['Standard Executive Stock'];

  const finishes = product.finishes && product.finishes.length > 0
    ? product.finishes
    : ['Standard Commercial Finish'];

  const pricingConfig = product.pricingConfig || {};
  const priceSheets = pricingConfig.priceSheets || null;
  const pricingKind = pricingConfig.pricingKind || product.pricingKind || 'pack';
  const hasDimensions = Boolean(pricingConfig.dimensions ?? product.dimensions);
  const packSize = Number(pricingConfig.packSize || product.packSize || product.minQuantity || 100);
  const hsnCode = pricingConfig.hsnCode || product.hsnCode || '';

  const supportsBothSides = Boolean(pricingConfig.supportsBothSides);
  const supportsFoil = Boolean(pricingConfig.supportsFoil);
  const supportsSpotUv = Boolean(pricingConfig.supportsSpotUv);

  const quantityTiers = product.quantityTiers && product.quantityTiers.length > 0
    ? product.quantityTiers
    : [packSize, packSize * 2, packSize * 3, packSize * 5, packSize * 10];

  // Configurator state
  const [customerClass, setCustomerClass] = useState('retail'); // 'retail' | 'gst'
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedSides, setSelectedSides] = useState(supportsBothSides ? 'both-sides' : 'single-side');
  const [selectedFinish, setSelectedFinish] = useState(finishes[0]);
  const [selectedFoil, setSelectedFoil] = useState('none');
  const [selectedSpotUv, setSelectedSpotUv] = useState('none');
  const [selectedAddons, setSelectedAddons] = useState({});
  const [dimWidth, setDimWidth] = useState('3.5');
  const [dimHeight, setDimHeight] = useState('2.0');
  const [specialUnitPrice, setSpecialUnitPrice] = useState('10');
  const [deliveryMode, setDeliveryMode] = useState('collect'); // 'courier' | 'transport' | 'collect'
  const [quantity, setQuantity] = useState(product.minQuantity || quantityTiers[0]);
  const [customQtyInput, setCustomQtyInput] = useState('');
  const [isCustomQty, setIsCustomQty] = useState(false);
  const [jobName, setJobName] = useState('');

  // Modal / Quote Request form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Sync state when product changes
  useEffect(() => {
    setActiveImage(product.image || '');
    setSelectedSize(sizes[0]);
    setSelectedMaterial(materials[0]);
    setSelectedSides(supportsBothSides ? 'both-sides' : 'single-side');
    setSelectedFinish(finishes[0]);
    setSelectedFoil('none');
    setSelectedSpotUv('none');
    setSelectedAddons({});
    setDimWidth('3.5');
    setDimHeight('2.0');
    setSpecialUnitPrice('10');
    setDeliveryMode('collect');
    setQuantity(product.minQuantity || quantityTiers[0]);
    setIsCustomQty(false);
    setCustomQtyInput('');
    setJobName('');
    setSuccessData(null);
    setSubmitError('');
    setIsModalOpen(false);
  }, [product.slug]);

  // Gallery images array (always deduped, never substituting another product's photo)
  const galleryImages = Array.from(new Set([
    ...(product.image ? [product.image] : []),
    ...(Array.isArray(product.secondaryImages) ? product.secondaryImages : [])
  ].filter(Boolean)));

  const currentMainImage = activeImage || galleryImages[0] || '';

  // Active quantity numeric value
  const rawQty = isCustomQty
    ? (parseInt(customQtyInput, 10) || product.minQuantity || packSize)
    : quantity;
  const activeQuantity = pricingKind === 'special_job'
    ? Math.max(1, rawQty)
    : Math.max(packSize, rawQty);

  // Quarter-inch ceiling helper matching printizer-main (pricing.ts)
  const toQuarterInches = (inches) => {
    const n = parseFloat(inches);
    if (!Number.isFinite(n) || n <= 0) return 4;
    return Math.ceil(n * 4 - 1e-9);
  };

  // Real-time Product-Specific Price Calculation (aligned with printizer-main pricing.ts)
  const calculatePricing = () => {
    if (pricingKind === 'special_job') {
      const unitP = Math.max(0, parseFloat(specialUnitPrice) || 0);
      if (unitP <= 0) return { hasPrice: false };
      const baseAmount = activeQuantity * unitP;
      const sheet = priceSheets?.[customerClass] || priceSheets?.retail;
      const deliveryCharge = deliveryMode === 'courier'
        ? (sheet?.courierPerPack || 60)
        : (deliveryMode === 'transport' ? (sheet?.transportPerParcel || 300) : 0);
      const gstRate = pricingConfig.gstPercent || 18;
      const gstAmount = customerClass === 'gst' ? Math.round((baseAmount + deliveryCharge) * (gstRate / 100)) : 0;
      const finalTotal = Math.round(baseAmount + deliveryCharge + gstAmount);
      return {
        hasPrice: true,
        qty: activeQuantity,
        packs: 1,
        baseAmount: Math.round(baseAmount),
        foilExtra: 0,
        spotUvExtra: 0,
        finishingExtra: 0,
        deliveryCharge,
        netSubtotal: Math.round(baseAmount + deliveryCharge),
        gstAmount,
        finalTotal,
        effectiveUnitRate: (finalTotal / activeQuantity).toFixed(2),
        unitName: pricingConfig.unitName || 'Units',
        customerClass
      };
    }

    const activeSheet = priceSheets?.[customerClass] || priceSheets?.retail || null;

    if (activeSheet && activeSheet.single > 0) {
      const packs = Math.max(1, Math.ceil(activeQuantity / packSize));
      const effectiveQty = packs * packSize;
      const isBoth = supportsBothSides && selectedSides === 'both-sides' && activeSheet.both != null;
      let ratePerPack = isBoth ? activeSheet.both : activeSheet.single;

      let foilExtra = 0;
      if (supportsFoil && selectedFoil !== 'none') {
        const foilRate = selectedFoil === 'gold'
          ? activeSheet.foilGold
          : (selectedFoil === 'silver' ? activeSheet.foilSilver : activeSheet.foilGold);
        if (foilRate) foilExtra = foilRate * packs;
      }

      let spotUvExtra = 0;
      if (supportsSpotUv && selectedSpotUv !== 'none') {
        const uvRate = (selectedSides === 'both-sides' && activeSheet.spotUvBoth)
          ? activeSheet.spotUvBoth
          : activeSheet.spotUvSingle;
        if (uvRate) spotUvExtra = uvRate * packs;
      }

      let baseAmount = ratePerPack * packs;
      let areaSqIn = null;
      if (pricingKind === 'area' && hasDimensions) {
        const wq = toQuarterInches(dimWidth);
        const hq = toQuarterInches(dimHeight);
        areaSqIn = ((wq * hq) / 16).toFixed(2);
        baseAmount = (baseAmount * wq * hq) / 16;
      }
      if (activeSheet.minimum && baseAmount < activeSheet.minimum) {
        baseAmount = activeSheet.minimum;
      }
      baseAmount = Math.round(baseAmount);

      let finishingExtra = 0;
      if (activeSheet.finishing) {
        for (const [fk, enabled] of Object.entries(selectedAddons)) {
          if (enabled && activeSheet.finishing[fk]) {
            finishingExtra += activeSheet.finishing[fk];
          }
        }
      }

      const deliveryCharge = deliveryMode === 'courier'
        ? (activeSheet.courierPerPack || 0) * packs
        : (deliveryMode === 'transport' ? (activeSheet.transportPerParcel || 0) : 0);

      const netSubtotal = baseAmount + foilExtra + spotUvExtra + finishingExtra + deliveryCharge;
      const gstRate = pricingConfig.gstPercent || 18;
      // In printizer-main: retail customers are quoted without extra GST; GST billing adds 18% GST on lower GST base rates
      const gstAmount = customerClass === 'gst' ? Math.round(netSubtotal * (gstRate / 100)) : 0;
      const finalTotal = Math.round(netSubtotal + gstAmount);
      const effectiveUnitRate = (finalTotal / effectiveQty).toFixed(2);

      return {
        hasPrice: true,
        isExactSheet: true,
        qty: effectiveQty,
        packs,
        areaSqIn,
        minApplied: Boolean(activeSheet.minimum && baseAmount === activeSheet.minimum),
        baseAmount,
        foilExtra,
        spotUvExtra,
        finishingExtra,
        deliveryCharge,
        netSubtotal,
        gstAmount,
        finalTotal,
        effectiveUnitRate,
        unitName: pricingConfig.unitName || 'Units',
        customerClass
      };
    }

    // Fallback formula for legacy catalog products without priceSheets
    const baseRate = pricingConfig.baseRate || product.baseRate;
    if (!baseRate || baseRate <= 0) {
      return { hasPrice: false };
    }

    const qty = activeQuantity;
    const sideMultiplier = (supportsBothSides && selectedSides === 'both-sides')
      ? (pricingConfig.bothSidesMultiplier || 1.4)
      : 1.0;

    const baseAmount = qty * baseRate * sideMultiplier;

    let foilExtra = 0;
    if (supportsFoil && selectedFoil !== 'none') {
      foilExtra = Math.max(250, baseAmount * 0.15);
    }

    let spotUvExtra = 0;
    if (supportsSpotUv && selectedSpotUv !== 'none') {
      spotUvExtra = Math.max(150, baseAmount * 0.15);
    }

    const deliveryCharge = deliveryMode === 'courier' ? 60 : (deliveryMode === 'transport' ? 300 : 0);
    const netSubtotal = baseAmount + foilExtra + spotUvExtra + deliveryCharge;
    const gstRate = pricingConfig.gstPercent || 18;
    const gstAmount = customerClass === 'gst' ? netSubtotal * (gstRate / 100) : 0;
    const finalTotal = Math.round(netSubtotal + gstAmount);
    const effectiveUnitRate = (finalTotal / qty).toFixed(2);

    return {
      hasPrice: true,
      qty,
      packs: 1,
      baseAmount: Math.round(baseAmount),
      foilExtra: Math.round(foilExtra),
      spotUvExtra: Math.round(spotUvExtra),
      finishingExtra: 0,
      deliveryCharge,
      netSubtotal: Math.round(netSubtotal),
      gstAmount: Math.round(gstAmount),
      finalTotal,
      effectiveUnitRate,
      unitName: pricingConfig.unitName || 'Units',
      customerClass
    };
  };

  const pricing = calculatePricing();

  // WhatsApp Enquiry Link
  const getWhatsAppEnquiryUrl = () => {
    const activeAddonsList = Object.entries(selectedAddons).filter(([, v]) => v).map(([k]) => k).join(', ');
    const text = `Hello PRINTIZER,
I would like to request an official quotation for the following product:
Product: ${product.name}
Category: ${product.categoryName}${hsnCode ? `\nHSN Code: ${hsnCode}` : ''}
Billing Type: ${customerClass === 'gst' ? 'GST Tax Invoice (+18% GST)' : 'Retail'}
Quantity: ${pricing.qty || activeQuantity} ${pricingConfig.unitName || 'units'}
Size: ${hasDimensions ? `${dimWidth}" × ${dimHeight}" (${pricing.areaSqIn || ''} sq.in)` : selectedSize}
Paper Stock: ${selectedMaterial}
Printing Sides: ${supportsBothSides ? (selectedSides === 'both-sides' ? 'Both Sides (Front & Back)' : 'Single Side (Front Only)') : 'Single Side'}
Finishing: ${selectedFinish}${activeAddonsList ? ` + ${activeAddonsList}` : ''}
Delivery Mode: ${deliveryMode === 'courier' ? 'Courier' : deliveryMode === 'transport' ? 'Transport' : 'Collect From Office'}
${supportsFoil && selectedFoil !== 'none' ? `Hot Foil Stamping: ${selectedFoil}\n` : ''}${supportsSpotUv && selectedSpotUv !== 'none' ? `Raised Spot UV Gloss: Yes\n` : ''}Job Name: ${jobName || 'Commercial Order'}
${pricing.hasPrice ? `Estimated Amount: ₹ ${pricing.finalTotal.toLocaleString('en-IN')}${customerClass === 'gst' ? ' (incl. 18% GST)' : ' (Retail)'}` : 'Custom Quotation Requested'}

Please verify vector artwork and share official quotation.
Thank you!`;

    return `https://wa.me/919898351920?text=${encodeURIComponent(text)}`;
  };

  // Handle Form Submission
  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim()) {
      setSubmitError('Please provide your name.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setSubmitError('Please enter your WhatsApp or contact phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('customerName', customerName.trim());
      data.append('businessName', businessName.trim());
      data.append('whatsappNumber', whatsappNumber.trim());
      data.append('email', email.trim());
      data.append('productSlug', product.slug);
      data.append('productName', product.name);
      data.append('quantity', String(pricing.qty || activeQuantity));
      data.append('dimensions', hasDimensions ? `${dimWidth}" x ${dimHeight}" (${pricing.areaSqIn || ''} sq.in)` : selectedSize);
      data.append('material', selectedMaterial);
      const activeAddonsList = Object.entries(selectedAddons).filter(([, v]) => v).map(([k]) => k);
      data.append('finishing', [
        selectedFinish,
        supportsBothSides ? (selectedSides === 'both-sides' ? 'Both Sides' : 'Single Side') : '',
        supportsFoil && selectedFoil !== 'none' ? `Hot Foil: ${selectedFoil}` : '',
        supportsSpotUv && selectedSpotUv !== 'none' ? 'Raised Spot UV' : '',
        ...activeAddonsList,
        `Billing: ${customerClass === 'gst' ? 'GST' : 'Retail'}`,
        `Delivery: ${deliveryMode}`
      ].filter(Boolean).join(' + '));
      data.append('jobName', jobName.trim() || `${product.name} Order`);
      data.append('additionalRequirements', instructions.trim());
      if (pricing.hasPrice) {
        data.append('estimatedPrice', String(pricing.finalTotal));
      }

      if (selectedFile) {
        data.append('artwork', selectedFile);
      }

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit quotation request.');
      }

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setSuccessData(json);
    } catch (err) {
      setSubmitError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Related products from the same category
  const relatedProducts = allProducts
    .filter(p => p.categoryId === product.categoryId && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pb-24 bg-[#f8fafc] text-left">
      {/* 1. BREADCRUMB STRIP */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-slate-900 transition flex items-center space-x-1"
            >
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button 
              onClick={() => onNavigate('category', product.categoryId)} 
              className="hover:text-slate-900 transition font-medium"
            >
              {product.categoryName}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-brand-crimson font-bold truncate">{product.name}</span>
          </div>

          <button
            onClick={() => onNavigate('category', product.categoryId)}
            className="hidden sm:inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {product.categoryName}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN WORKFLOW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ==================== LEFT COLUMN: PRODUCT PRESENTATION (7 COLS) ==================== */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Primary Photo Showcase Frame */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <ProductImage
                  src={currentMainImage}
                  alt={product.name}
                  placeholderLabel={product.name}
                  eager={true}
                  imgClassName="w-full h-full object-cover transition-all duration-500"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse"></span>
                  <span>{product.categoryName}</span>
                </div>

                {/* Minimum Order Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold px-3 py-1 rounded-xl shadow-md border border-slate-200">
                  MOQ: {product.minQuantity || 100} {pricingConfig.unitName || 'units'}
                </div>
              </div>

              {/* Multi-View Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center space-x-3 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 px-1">
                    Gallery ({galleryImages.length}):
                  </span>
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 ${
                        currentMainImage === img 
                          ? 'border-brand-crimson ring-2 ring-brand-crimson/20 shadow-sm scale-102' 
                          : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
                      }`}
                      title={`View angle ${idx + 1}`}
                    >
                      <ProductImage src={img} alt={`${product.name} view ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Title, Tagline & Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-crimson uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-brand-crimson" />
                <span>Commercial Print Standard</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  {product.tagline}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {product.description}
              </p>

              {/* Available Paper, Size, Printing & Finishing Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Paper Options &amp; Substrates
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {materials.map((m, i) => (
                      <span key={i} className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Available Finishing Options
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {finishes.map((f, i) => (
                      <span key={i} className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                        {f}
                      </span>
                    ))}
                    {supportsFoil && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                        Gold / Silver Foil
                      </span>
                    )}
                    {supportsSpotUv && (
                      <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                        Raised Spot UV
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Sizes &amp; Dimensions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Printing Options &amp; MOQ
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                      {supportsBothSides ? 'Single Side & Both Sides CMYK' : 'Single Side Full-Color CMYK'}
                    </span>
                    <span className="text-[11px] font-bold text-brand-crimson bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                      Min Qty: {(product.minQuantity || 100).toLocaleString('en-IN')} {pricingConfig.unitName || 'units'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features Badges */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Turnaround</span>
                  <span className="font-bold text-slate-800">{product.productionTime || '3-4 Business Days'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Color Profile</span>
                  <span className="font-bold text-slate-800">300 DPI CMYK</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Proofing</span>
                  <span className="font-bold text-slate-800">Digital PDF Sign-off</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery</span>
                  <span className="font-bold text-slate-800">Doorstep Dispatch</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications & Prepress Guide (Synced from printizer.in) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-brand-crimson" />
                  <span>Important Print & File Upload Instructions</span>
                </h3>
                {hsnCode ? (
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    HSN: {hsnCode}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Prepress Verified</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson mt-1.5 shrink-0"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">CorelDRAW (X7 or older) & Press PDF:</strong>
                    <span className="text-slate-500">Send print files as CorelDRAW (.cdr, version X7 or older) or press-ready PDF, neatly arranged with fonts converted to curves.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson mt-1.5 shrink-0"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">CMYK Mode & Bitmaps:</strong>
                    <span className="text-slate-500">Design only in CMYK (not responsible for RGB/Pantone shifts). Convert images, lenses, transparency, drop shadows & PowerClips to bitmaps.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson mt-1.5 shrink-0"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Job Details & Area Check:</strong>
                    <span className="text-slate-500">Write all processing details inside the file itself, and verify exact job size and printing area with 3mm bleed before sending.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson mt-1.5 shrink-0"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Colour Matching & Order Terms:</strong>
                    <span className="text-slate-500">Send a physical colour sample for strict colour matching. Custom printed goods once produced and dispatched are non-returnable.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Specialist WhatsApp Contact Card */}
            <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Need Guidance on {product.name}?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Speak directly with a PRINTIZER prepress specialist on WhatsApp for custom specifications.
                  </p>
                </div>
              </div>

              <a
                href={getWhatsAppEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Specialist</span>
              </a>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: DEDICATED PRODUCT CONFIGURATOR (5 COLS) ==================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden">
              
              {/* Header Strip */}
              <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-crimson block">
                    Product Specification Panel
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    Configure {product.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live dynamic quotation based on configured commercial specifications
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              {/* Configurator Form Body */}
              <div className="p-5 sm:p-6 space-y-5">

                {/* Billing Class Toggle (Retail vs GST Tax Invoice from printizer.in) */}
                {priceSheets && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-extrabold text-slate-800">
                        Billing Class
                      </label>
                      {hsnCode && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          HSN {hsnCode}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomerClass('retail')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          customerClass === 'retail'
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block">Retail Rate</span>
                        <span className="text-[10px] text-slate-500 font-medium">Direct Net Price</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerClass('gst')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          customerClass === 'gst'
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block">GST Invoice</span>
                        <span className="text-[10px] text-brand-crimson font-semibold">GST Base + 18% GST</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Finished Size / Dimensions (Interactive Width x Height for Per Sq.Inch products) */}
                {pricingKind === 'area' && hasDimensions ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-extrabold text-slate-800">
                        1. Custom Dimensions (Inches)
                      </label>
                      <span className="text-[11px] text-brand-crimson font-bold">
                        Rounded up to ¼"
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Width (inch)</label>
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={dimWidth}
                          onChange={(e) => setDimWidth(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-brand-crimson focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Height (inch)</label>
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={dimHeight}
                          onChange={(e) => setDimHeight(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-brand-crimson focus:outline-none"
                        />
                      </div>
                    </div>
                    {pricing.areaSqIn && (
                      <p className="text-[11px] text-slate-500 font-medium">
                        Billable Area: <strong className="text-slate-800">{pricing.areaSqIn} sq. inch</strong>
                        {priceSheets?.[customerClass]?.minimum ? ` • Min Order Base ₹${priceSheets[customerClass].minimum}` : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-extrabold text-slate-800">
                        1. Finished Size / Dimensions
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">Standard Trim</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                            selectedSize === s
                              ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{s}</span>
                            {selectedSize === s && (
                              <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 ml-1" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Paper Stock / GSM */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-extrabold text-slate-800">
                      2. Paper Quality & Grammage (GSM)
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Substrate</span>
                  </div>

                  <div className="space-y-1.5">
                    {materials.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMaterial(m)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          selectedMaterial === m
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{m}</span>
                        {selectedMaterial === m && (
                          <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Printing Sides (Only if supported by product) */}
                {supportsBothSides && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-extrabold text-slate-800">
                        3. Printing Sides
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">Per Pack Rate</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSides('single-side')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                          selectedSides === 'single-side'
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block">Single Side (Front)</span>
                        {priceSheets?.[customerClass]?.single && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            ₹{priceSheets[customerClass].single}/{packSize}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSides('both-sides')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                          selectedSides === 'both-sides'
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block">Both Sides (Front & Back)</span>
                        <span className="text-[10px] text-brand-crimson font-bold">
                          {priceSheets?.[customerClass]?.both ? `₹${priceSheets[customerClass].both}/${packSize}` : '+40%'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Surface Finishing & Lamination + Optional Job Add-ons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-extrabold text-slate-800">
                      {supportsBothSides ? '4' : '3'}. Lamination & Finishing
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Protection</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {finishes.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFinish(f)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          selectedFinish === f
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{f}</span>
                          {selectedFinish === f && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-crimson shrink-0 ml-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Exact Optional Finishing Add-ons from printizer-main */}
                  {priceSheets?.[customerClass]?.finishing && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {[
                        { key: 'halfBlade', label: 'Half Blade' },
                        { key: 'creasing', label: 'Creasing' },
                        { key: 'perforation', label: 'Perforate' },
                        { key: 'die', label: 'Die Cutting' },
                        { key: 'punching', label: 'Punching' },
                        { key: 'folding', label: 'Folding' }
                      ].filter(a => priceSheets[customerClass].finishing[a.key] != null).map(addon => {
                        const fee = priceSheets[customerClass].finishing[addon.key];
                        const active = Boolean(selectedAddons[addon.key]);
                        return (
                          <button
                            key={addon.key}
                            type="button"
                            onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.key]: !prev[addon.key] }))}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center space-x-1 ${
                              active
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <span>{addon.label}</span>
                            <span className={active ? 'text-rose-300' : 'text-brand-crimson'}>+₹{fee}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Optional Embellishments: Foil & Spot UV (When supported) */}
                {(supportsFoil || supportsSpotUv) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Optional Luxury Embellishments</span>
                    </span>

                    {/* Foil Stamping */}
                    {supportsFoil && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Metallic Hot Foil Stamping
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                          {[
                            { id: 'none', label: 'None' },
                            { id: 'gold', label: priceSheets?.[customerClass]?.foilGold ? `Gold (+₹${priceSheets[customerClass].foilGold}/pk)` : 'Gold Foil' },
                            { id: 'silver', label: priceSheets?.[customerClass]?.foilSilver ? `Silver (+₹${priceSheets[customerClass].foilSilver}/pk)` : 'Silver Foil' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedFoil(opt.id)}
                              className={`py-1.5 px-2 rounded-lg border text-[10px] sm:text-[11px] font-bold transition text-center ${
                                selectedFoil === opt.id
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-amber-200 hover:border-amber-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spot UV */}
                    {supportsSpotUv && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Tactile Raised Spot UV Gloss
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                          {[
                            { id: 'none', label: 'No Spot UV' },
                            {
                              id: 'spot-uv',
                              label: priceSheets?.[customerClass]?.spotUvSingle
                                ? `Spot UV (+₹${(selectedSides === 'both-sides' && priceSheets[customerClass].spotUvBoth) ? priceSheets[customerClass].spotUvBoth : priceSheets[customerClass].spotUvSingle}/pk)`
                                : 'Raised Spot UV (+15%)'
                            }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedSpotUv(opt.id)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition text-center ${
                                selectedSpotUv === opt.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-amber-200 hover:border-amber-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Quantity Selection (Product-Specific Pack Tiers or Special Job Input) */}
                {pricingKind === 'special_job' ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={isCustomQty ? customQtyInput : quantity}
                        onChange={(e) => {
                          setIsCustomQty(true);
                          setCustomQtyInput(e.target.value);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-brand-crimson focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Price per Piece (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={specialUnitPrice}
                        onChange={(e) => setSpecialUnitPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-brand-crimson focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-extrabold text-slate-800">
                        {supportsBothSides ? '5' : '4'}. Select Quantity ({pricingConfig.unitName || 'Units'})
                      </label>
                      <span className="text-[11px] text-brand-crimson font-bold">
                        Min: {packSize.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Quantity Pills */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {quantityTiers.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setQuantity(q);
                            setIsCustomQty(false);
                          }}
                          className={`py-2 px-1 rounded-xl border text-xs font-extrabold transition-all text-center ${
                            !isCustomQty && quantity === q
                              ? 'border-brand-crimson bg-brand-crimson text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {q.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>

                    {/* Custom Quantity Option */}
                    <div className="pt-1">
                      {!isCustomQty ? (
                        <button
                          type="button"
                          onClick={() => setIsCustomQty(true)}
                          className="text-[11px] font-bold text-brand-crimson hover:underline"
                        >
                          + Need a different pack multiple? Enter custom quantity
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="number"
                            min={packSize}
                            step={packSize}
                            placeholder={`Multiples of ${packSize}`}
                            value={customQtyInput}
                            onChange={(e) => setCustomQtyInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 font-bold focus:bg-white focus:border-brand-crimson focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomQty(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Mode Selector (Exact printizer-main options) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    Delivery Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'collect', label: 'Office Pickup', sub: 'Free' },
                      { id: 'courier', label: 'Courier', sub: `₹${priceSheets?.[customerClass]?.courierPerPack || 60}/pack` },
                      { id: 'transport', label: 'Transport', sub: `₹${priceSheets?.[customerClass]?.transportPerParcel || 300}/parcel` }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDeliveryMode(d.id)}
                        className={`p-2 rounded-xl border text-center transition ${
                          deliveryMode === d.id
                            ? 'border-brand-crimson bg-rose-50/50 text-slate-900 ring-1 ring-brand-crimson'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-[11px] font-bold leading-tight">{d.label}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{d.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Job Name / Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job / Project Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 Executive Brand Refresh"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                  />
                </div>

                {/* 7. LIVE ITEMISED PRICE BREAKDOWN */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Price Calculation Summary
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      {customerClass === 'gst' ? 'GST Billing' : 'Retail Rate'}
                    </span>
                  </div>

                  {pricing.hasPrice ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>
                          Base Printing ({pricing.qty.toLocaleString('en-IN')} {pricing.unitName}
                          {pricing.areaSqIn ? ` • ${pricing.areaSqIn} sq.in` : ''}):
                        </span>
                        <span className="font-semibold text-slate-800">₹ {pricing.baseAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {pricing.foilExtra > 0 && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Hot Foil Stamping ({selectedFoil}):</span>
                          <span className="font-semibold text-slate-800">+₹ {pricing.foilExtra.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pricing.spotUvExtra > 0 && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Raised Spot UV Embellishment:</span>
                          <span className="font-semibold text-slate-800">+₹ {pricing.spotUvExtra.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pricing.finishingExtra > 0 && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Finishing Add-ons:</span>
                          <span className="font-semibold text-slate-800">+₹ {pricing.finishingExtra.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {pricing.deliveryCharge > 0 && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>{deliveryMode === 'courier' ? 'Courier Charges' : 'Transport Charges'}:</span>
                          <span className="font-semibold text-slate-800">+₹ {pricing.deliveryCharge.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {customerClass === 'gst' && (
                        <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
                          <span>Applicable GST (18%):</span>
                          <span className="font-semibold text-slate-700">+₹ {pricing.gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block">Total Estimated Amount:</span>
                          <span className="text-[10px] text-slate-500">
                            Effective: ₹{pricing.effectiveUnitRate} per {pricing.unitName.replace(/s$/, '').toLowerCase()}
                            {pricing.minApplied ? ' (Minimum order charge applied)' : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-black text-brand-crimson">
                            ₹ {pricing.finalTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic pt-1 leading-normal">
                        * Official rate from PRINTIZER price sheet ({customerClass === 'gst' ? 'GST Tax Invoice' : 'Retail'}). Custom goods once printed are non-returnable.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-slate-600 font-medium">
                        Custom specifications require specialist evaluation.
                      </p>
                      <span className="text-base font-extrabold text-slate-900 block mt-1">
                        Request a Tailored Quote
                      </span>
                    </div>
                  )}
                </div>

                {/* 8. PRIMARY ACTION BUTTONS */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessData(null);
                      setSubmitError('');
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-brand-crimson hover:bg-brand-red text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-brand-crimson/25 hover:shadow-xl cursor-pointer"
                  >
                    <span>Request Official Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getWhatsAppEnquiryUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Enquiry</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 3. RELATED PRODUCTS IN THIS CATEGORY */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
              <div>
                <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
                  More From {product.categoryName}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Related Commercial Products
                </h3>
              </div>
              <button
                onClick={() => onNavigate('category', product.categoryId)}
                className="text-xs font-bold text-slate-600 hover:text-brand-crimson flex items-center space-x-1"
              >
                <span>View Full {product.categoryName} Category &rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate('product', rel.slug)}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        MOQ: {rel.minQuantity || 100}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-crimson transition line-clamp-1">
                      {rel.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {rel.tagline || rel.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-brand-crimson transition-colors">
                    <span>
                      {rel.baseRate ? `From ₹${Math.round(rel.baseRate * (rel.minQuantity || 100)).toLocaleString('en-IN')}` : 'Request Quote'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. STICKY BOTTOM ACTION BAR FOR MOBILE */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-30 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">
            {pricing.qty || activeQuantity} {pricingConfig.unitName || 'units'} &bull; {hasDimensions ? `${dimWidth}" × ${dimHeight}"` : selectedSize}
          </span>
          <span className="text-base font-black text-brand-crimson">
            {pricing.hasPrice ? `₹ ${pricing.finalTotal.toLocaleString('en-IN')}` : 'Custom Quote'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={getWhatsAppEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <button
            type="button"
            onClick={() => {
              setSuccessData(null);
              setSubmitError('');
              setIsModalOpen(true);
            }}
            className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md"
          >
            Request Quotation
          </button>
        </div>
      </div>

      {/* 5. OFFICIAL QUOTATION REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-left">
            
            {/* Modal Header */}
            <div className="bg-brand-navy p-5 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-crimson block">
                  Official Quotation Request
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {product.name}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">
              {successData ? (
                /* Success View */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-1">
                      Ref: {successData.referenceNo}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      Quotation Request Received!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Thank you, {customerName}. Your quotation requirement for <strong>{product.name}</strong> ({activeQuantity} units) has been registered.
                    </p>
                  </div>

                  {/* Configured Details Preview */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left text-slate-700 space-y-1">
                    <div><strong>Size:</strong> {selectedSize}</div>
                    <div><strong>Material:</strong> {selectedMaterial}</div>
                    <div><strong>Finishing:</strong> {selectedFinish} {supportsBothSides ? `(${selectedSides === 'both-sides' ? 'Both Sides' : 'Single Side'})` : ''}</div>
                    {pricing.hasPrice && <div><strong>Estimated Price:</strong> ₹{pricing.finalTotal.toLocaleString('en-IN')} (incl. GST)</div>}
                  </div>

                  {/* Continue on WhatsApp */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      Immediate response on WhatsApp:
                    </p>
                    <a
                      href={successData.whatsappUrl || getWhatsAppEnquiryUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Continue on WhatsApp (+91 98983 51920)</span>
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSuccessData(null);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmitQuotation} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Configured Specs Summary Strip */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{product.name} ({activeQuantity} {pricingConfig.unitName || 'units'})</span>
                      {pricing.hasPrice && <span className="text-brand-crimson">₹{pricing.finalTotal.toLocaleString('en-IN')}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {selectedSize} &bull; {selectedMaterial} &bull; {selectedFinish} {supportsBothSides ? `(${selectedSides === 'both-sides' ? 'Both Sides' : 'Single Side'})` : ''}
                    </p>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                    />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company / Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Corporation"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                    />
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98983 51920"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Artwork Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Artwork File (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-white transition cursor-pointer relative">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.cdr,.ai,.psd,.zip,.jpg,.jpeg,.png"
                      />
                      <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-600 block">
                        {selectedFile ? selectedFile.name : 'Click to attach vector artwork (PDF, CDR, AI, ZIP)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Max size 25MB</span>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Additional Prepress Instructions (Optional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Any specific delivery instructions, Pantone codes, or packing preferences..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-crimson focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brand-crimson hover:bg-brand-red disabled:bg-slate-400 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-brand-crimson/25 flex items-center justify-center space-x-2"
                    >
                      {submitting ? (
                        <span>Submitting Quotation Request...</span>
                      ) : (
                        <>
                          <span>Submit Official Quotation Request</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
