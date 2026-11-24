import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ChevronRight, CheckCircle2, 
  UploadCloud, ShieldCheck, Sparkles, Layers, FileText, 
  Truck, Clock, AlertCircle, HelpCircle, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintConfigurator from '../components/PrintConfigurator.jsx';

export default function ProductDetailPage({ 
  product, 
  onNavigate, 
  onRequestQuote,
  allProducts = []
}) {
  const [activeImage, setActiveImage] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || '');
      setFormState(prev => ({
        ...prev,
        quantity: String(product.minQuantity || 1000),
        dimensions: product.standardSizes?.[0] || 'Standard 3.5" x 2.0"',
        material: product.materials?.[0] || '250g Art Card (Gloss)',
        finishing: product.finishes?.[0] || 'Gloss Lamination'
      }));
    }
  }, [product]);

  const [formState, setFormState] = useState({
    customerName: '',
    businessName: '',
    whatsappNumber: '',
    email: '',
    quantity: String(product?.minQuantity || 1000),
    dimensions: product?.standardSizes?.[0] || 'Standard 3.5" x 2.0"',
    material: product?.materials?.[0] || '250g Art Card (Gloss)',
    finishing: product?.finishes?.[0] || 'Gloss Lamination',
    additionalRequirements: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <button 
          onClick={() => onNavigate('home')}
          className="mt-4 text-xs font-bold text-brand-crimson underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Pre-filled dynamic WhatsApp link for the product
  const getWhatsAppEnquiryUrl = () => {
    const text = `Hello PRINTIZER,
I am interested in getting a quotation for the following product.
Product: ${product.name}
Quantity: ${formState.quantity}
Size: ${formState.dimensions || 'Standard / Per Spec'}
Material: ${formState.material || 'Please suggest'}
Name: ${formState.customerName || 'Customer'}
Please share your best quotation.
Thank you.`;

    return `https://wa.me/919898351920?text=${encodeURIComponent(text)}`;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formState.customerName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formState.whatsappNumber.trim()) {
      setError('Please enter your WhatsApp or contact number.');
      return;
    }
    if (!formState.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('customerName', formState.customerName);
      data.append('businessName', formState.businessName);
      data.append('whatsappNumber', formState.whatsappNumber);
      data.append('email', formState.email);
      data.append('productSlug', product.slug);
      data.append('productName', product.name);
      data.append('quantity', formState.quantity);
      data.append('dimensions', formState.dimensions);
      data.append('material', formState.material);
      data.append('finishing', formState.finishing);
      data.append('additionalRequirements', formState.additionalRequirements);

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
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setSuccessData(json);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = product.secondaryImages && product.secondaryImages.length > 0 
    ? product.secondaryImages 
    : [product.image];

  const currentMainImage = activeImage || product.image;

  const related = allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="pb-16 sm:pb-24 space-y-8 sm:space-y-12">
      {/* Breadcrumb strip */}
      <div className="bg-slate-100 border-b border-slate-200 py-3 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <button onClick={() => onNavigate('home')} className="hover:text-slate-800 transition">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            onClick={() => onNavigate('category', product.categoryId)} 
            className="hover:text-slate-800 transition"
          >
            {product.categoryName}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-brand-crimson font-semibold truncate">{product.name}</span>
        </div>
      </div>

      {/* Interactive Configurator */}
      {(product.slug === 'visiting-card' || product.categoryId === 'business-stationery') && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <PrintConfigurator
            initialCategory={product.categoryId || 'business-stationery'}
            onOpenQuoteModal={onRequestQuote}
            onRequestCustomQuote={() => onRequestQuote({ productName: product.name })}
          />
        </div>
      )}

      {/* Main Product Showcase & Quotation Form */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Product Visuals & Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Main Product Image Container */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                  {product.categoryName}
                </span>
                <span className="absolute bottom-3 right-3 bg-white/95 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md border border-slate-200">
                  Minimum Order: {product.minQuantity} units
                </span>
              </div>

              {/* Thumbnails Gallery */}
              {galleryImages.length > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-3 overflow-x-auto">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-20 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                        currentMainImage === img ? 'border-brand-crimson shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-brand-crimson font-semibold">
                {product.tagline}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Specifications Card (Modeled after Madhuram Print reference Image 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-crimson" />
                  <span>Technical Specifications & Standards</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson"></span>
                  <span><strong>Product Class:</strong> {product.productClass || 'Regular / Commercial'}</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson"></span>
                  <span><strong>Paper Quality:</strong> {product.paperQuality || '250 - 350 GSM Art Card'}</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson"></span>
                  <span><strong>Turnaround:</strong> {product.productionTime || '3-4 business days'}</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-crimson"></span>
                  <span><strong>Finishes:</strong> {product.laminationType || 'Gloss / Matte / Velvet'}</span>
                </div>
              </div>

              {/* Points to be Noted */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong className="block text-[11px] uppercase tracking-wider font-extrabold">
                  Points to be Noted for this Job:
                </strong>
                <p>&bull; Size must include standard 3mm bleed margin for edge cutting.</p>
                <p>&bull; CorelDRAW (CDR x7), AI, or PDF vector curves required for sharp typographic reproduction.</p>
                <p>&bull; Files must be formatted in CMYK color mode (RGB colors may show hue shifts).</p>
                <p>&bull; Keep critical text and logos at least 4mm inside the safe trim line.</p>
              </div>
            </div>

            {/* WhatsApp Quick Banner */}
            <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Need Immediate Advice on {product.name}?</h4>
                  <p className="text-[11px] text-slate-600">Chat directly with a print specialist for instant quotation and sample verification.</p>
                </div>
              </div>

              <a
                href={getWhatsAppEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>
          </div>

          {/* Right Column: DEDICATED PRODUCT QUOTATION FORM (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-brand-navy p-4 sm:p-5 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-crimson block">
                  Official Quotation Request
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Get a Quotation for {product.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tailored pricing from PRINTIZER &bull; Zero Obligation
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {successData ? (
                  /* SUCCESS STATE */
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-1">
                        Ref: {successData.referenceNo}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        Quotation Request Received!
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Thank you, {formState.customerName}. Your requirement for <strong>{product.name}</strong> ({formState.quantity} units) is being reviewed by our specialists.
                      </p>
                    </div>

                    {/* WhatsApp Continue Button */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
                      <p className="text-xs font-bold text-slate-800">
                        Continue this enquiry on WhatsApp:
                      </p>
                      <a
                        href={successData.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Continue on WhatsApp (+91 98983 51920)</span>
                      </a>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      An acknowledgment has been dispatched to <strong>{formState.email}</strong>.
                    </p>

                    <button
                      onClick={() => setSuccessData(null)}
                      className="text-xs text-brand-crimson font-bold underline"
                    >
                      Submit Another Requirement
                    </button>
                  </div>
                ) : (
                  /* DEDICATED FORM */
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {error && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Customer Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formState.customerName}
                        onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>

                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business / Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Corporation"
                        value={formState.businessName}
                        onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>

                    {/* WhatsApp & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98983 51920"
                          value={formState.whatsappNumber}
                          onChange={(e) => setFormState({ ...formState, whatsappNumber: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
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
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Product Name (Populated) & Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={product.name}
                          className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-700 font-semibold cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Required Qty *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formState.quantity}
                          onChange={(e) => setFormState({ ...formState, quantity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Material & Finishing Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Material Preference
                        </label>
                        {product.materials && product.materials.length > 0 ? (
                          <select
                            value={formState.material}
                            onChange={(e) => setFormState({ ...formState, material: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-2 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                          >
                            {product.materials.map((m, idx) => (
                              <option key={idx} value={m}>{m}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. 250g Art Card"
                            value={formState.material}
                            onChange={(e) => setFormState({ ...formState, material: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Finishing Preference
                        </label>
                        {product.finishes && product.finishes.length > 0 ? (
                          <select
                            value={formState.finishing}
                            onChange={(e) => setFormState({ ...formState, finishing: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-2 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                          >
                            {product.finishes.map((f, idx) => (
                              <option key={idx} value={f}>{f}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Gloss Lamination"
                            value={formState.finishing}
                            onChange={(e) => setFormState({ ...formState, finishing: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                          />
                        )}
                      </div>
                    </div>

                    {/* Additional Requirements */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Additional Requirements
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Any special notes, deadline dates, or shipping address..."
                        value={formState.additionalRequirements}
                        onChange={(e) => setFormState({ ...formState, additionalRequirements: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      ></textarea>
                    </div>

                    {/* Upload Reference Artwork */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Upload Artwork / Design File (Optional)
                        </label>
                      </div>
                      <div className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-3 text-center bg-slate-50 transition relative">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".cdr,.pdf,.ai,.eps,.psd,.jpg,.jpeg,.png,.zip"
                        />
                        <div className="flex items-center justify-center space-x-2 pointer-events-none">
                          <UploadCloud className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-600 truncate max-w-[200px]">
                            {selectedFile ? selectedFile.name : 'Select CDR, PDF, AI, ZIP'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-crimson hover:bg-brand-red active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-brand-crimson/25 transition flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Submitting...</span>
                        </span>
                      ) : (
                        <>
                          <span>GET MY QUOTATION</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
