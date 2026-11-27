import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ChevronRight, CheckCircle2, 
  UploadCloud, ShieldCheck, Sparkles, Layers, FileText, 
  Truck, Clock, AlertCircle, HelpCircle, Eye, Check, X,
  FileCheck, Printer, ArrowLeft, Send, ShoppingCart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProductImage from '../components/ProductImage';
import ImportantInstructionsModal from '../components/ImportantInstructionsModal';
import { getEffectiveOrderFields } from '../utils/orderPricing';

export default function ProductDetailPage({ 
  product, 
  onNavigate, 
  onRequestQuote,
  onAddToCart,
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

  const cfg = getEffectiveOrderFields(product);
  const pricingConfig = product.pricingConfig || {};
  const priceSheets = pricingConfig.priceSheets || null;
  const pricingKind = cfg.pricingKind;
  const hasDimensions = cfg.hasDimensions;
  const packSize = cfg.packSize;
  const hsnCode = cfg.hsnCode;

  const supportsBothSides = cfg.supportsBoth;
  const supportsFoil = cfg.supportsFoil;
  const supportsSpotUv = cfg.supportsSpotUv;

  const quantityTiers = cfg.quantityTiers;

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

    return `https://wa.me/917574927200?text=${encodeURIComponent(text)}`;
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
      {/* 1. BACK NAVIGATION STRIP */}
      <div className="bg-white border-b border-slate-200/80 py-3 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('category', product.categoryId)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {product.categoryName}</span>
          </button>

          <span className="text-xs font-bold text-slate-400 truncate hidden sm:block">
            {product.name}
          </span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT PRESENTATION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-6 sm:space-y-8">
            
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

              {/* Flipkart / Amazon Style Add to Cart & Quote Actions */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!onAddToCart) return;
                    const qty = pricing.qty || activeQuantity;
                    const specs = [
                      { label: 'Material', value: selectedMaterial },
                      { label: 'Size', value: hasDimensions ? `${dimWidth}" × ${dimHeight}"` : selectedSize },
                      { label: 'Finish', value: selectedFinish },
                      ...(supportsBothSides ? [{ label: 'Printing', value: selectedSides === 'both-sides' ? 'Both Sides' : 'Single Side' }] : []),
                      ...(supportsFoil && selectedFoil !== 'none' ? [{ label: 'Foil', value: selectedFoil }] : []),
                      ...(supportsSpotUv && selectedSpotUv !== 'none' ? [{ label: 'Spot UV', value: selectedSpotUv }] : [])
                    ];
                    onAddToCart(product, {
                      lineId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                      productId: product.id,
                      productSlug: product.slug,
                      productName: product.name,
                      categoryName: product.categoryName || 'Printing',
                      image: currentMainImage,
                      quantity: qty,
                      packSize,
                      unitName: pricingConfig.unitName || 'Units',
                      hasPrice: Boolean(pricing.hasPrice),
                      unitPrice: pricing.hasPrice ? Math.round((pricing.finalTotal / qty) * 100) / 100 : 0,
                      totalAmount: pricing.hasPrice ? pricing.finalTotal : 0,
                      specs
                    });
                  }}
                  className="w-full bg-[#ff9f00] hover:bg-[#f09300] text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('configure', product.slug)}
                  className="w-full bg-[#fb641b] hover:bg-[#e8580e] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <span>Configure &amp; Buy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
          <button
            type="button"
            onClick={() => {
              if (!onAddToCart) return;
              const qty = pricing.qty || activeQuantity;
              const specs = [
                { label: 'Material', value: selectedMaterial },
                { label: 'Size', value: hasDimensions ? `${dimWidth}" × ${dimHeight}"` : selectedSize },
                { label: 'Finish', value: selectedFinish },
                ...(supportsBothSides ? [{ label: 'Printing', value: selectedSides === 'both-sides' ? 'Both Sides' : 'Single Side' }] : []),
                ...(supportsFoil && selectedFoil !== 'none' ? [{ label: 'Foil', value: selectedFoil }] : []),
                ...(supportsSpotUv && selectedSpotUv !== 'none' ? [{ label: 'Spot UV', value: selectedSpotUv }] : [])
              ];
              onAddToCart(product, {
                lineId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                categoryName: product.categoryName || 'Printing',
                image: currentMainImage,
                quantity: qty,
                packSize,
                unitName: pricingConfig.unitName || 'Units',
                hasPrice: Boolean(pricing.hasPrice),
                unitPrice: pricing.hasPrice ? Math.round((pricing.finalTotal / qty) * 100) / 100 : 0,
                totalAmount: pricing.hasPrice ? pricing.finalTotal : 0,
                specs
              });
            }}
            className="bg-[#ff9f00] hover:bg-[#f09300] text-slate-950 text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-1 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSuccessData(null);
              setSubmitError('');
              setIsModalOpen(true);
            }}
            className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md"
          >
            Quote
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
                      <span>Continue on WhatsApp (+91 75749 27200)</span>
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
                        placeholder="+91 75749 27200"
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

      <ImportantInstructionsModal />
    </div>
  );
}
