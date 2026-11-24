import React, { useState, useEffect } from 'react';
import { 
  X, UploadCloud, CheckCircle2, MessageCircle, FileText, 
  Sparkles, ArrowRight, AlertCircle, Building, User, Mail, Phone 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuoteModal({ 
  isOpen, 
  onClose, 
  product = null, 
  products = [] 
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    businessName: '',
    whatsappNumber: '',
    email: '',
    productSlug: '',
    productName: '',
    quantity: '500',
    dimensions: '',
    material: '',
    finishing: '',
    additionalRequirements: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Sync default product when opened
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        productSlug: product.slug || '',
        productName: product.name || '',
        quantity: String(product.minQuantity || '500'),
        dimensions: (product.standardSizes && product.standardSizes[0]) || '',
        material: (product.materials && product.materials[0]) || '',
        finishing: (product.finishes && product.finishes[0]) || ''
      }));
    } else if (products.length > 0) {
      const defaultProd = products[0];
      setFormData(prev => ({
        ...prev,
        productSlug: defaultProd.slug,
        productName: defaultProd.name,
        quantity: String(defaultProd.minQuantity || '500')
      }));
    }
    setError('');
    setSuccessData(null);
  }, [product, products, isOpen]);

  if (!isOpen) return null;

  const handleProductChange = (e) => {
    const slug = e.target.value;
    const selected = products.find(p => p.slug === slug);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        productSlug: selected.slug,
        productName: selected.name,
        quantity: String(selected.minQuantity || '500'),
        dimensions: (selected.standardSizes && selected.standardSizes[0]) || '',
        material: (selected.materials && selected.materials[0]) || '',
        finishing: (selected.finishes && selected.finishes[0]) || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, productSlug: slug, productName: slug }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      setError('Please provide your WhatsApp or phone number.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('customerName', formData.customerName);
      data.append('businessName', formData.businessName);
      data.append('whatsappNumber', formData.whatsappNumber);
      data.append('email', formData.email);
      data.append('productSlug', formData.productSlug);
      data.append('productName', formData.productName);
      data.append('quantity', formData.quantity);
      data.append('dimensions', formData.dimensions);
      data.append('material', formData.material);
      data.append('finishing', formData.finishing);
      data.append('additionalRequirements', formData.additionalRequirements);

      if (selectedFile) {
        data.append('artwork', selectedFile);
      }

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit quotation enquiry.');
      }

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setSuccessData(json);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your enquiry.');
    } finally {
      setLoading(false);
    }
  };

  const activeSelectedProduct = products.find(p => p.slug === formData.productSlug) || product;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative">
        {/* Header Ribbon */}
        <div className="bg-brand-navy p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-lg bg-brand-crimson/20 border border-brand-crimson/50 flex items-center justify-center text-brand-crimson">
                <FileText className="w-4 h-4 text-brand-crimson" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {successData ? 'Quotation Request Submitted' : 'Request a Custom Quotation'}
                </h3>
                <p className="text-xs text-slate-300">
                  PRINTIZER &bull; Everything Your Business Needs to Print.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-crimson to-brand-accent"></div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {successData ? (
            /* SUCCESS STATE */
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2">
                  Enquiry Reference: {successData.referenceNo}
                </span>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Thank You, {formData.customerName}!
                </h4>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Your quotation enquiry for <strong className="text-slate-900">{formData.productName}</strong> ({formData.quantity} units) has been assigned to our print specialists.
                </p>
              </div>

              {/* Action Box: Continue via WhatsApp */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Instant Follow-up via WhatsApp</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fast-track your quotation with our print desk on WhatsApp right now.
                    </p>
                  </div>
                </div>

                <a
                  href={successData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Continue on WhatsApp (+91 98983 51920)</span>
                </a>
              </div>

              <div className="text-xs text-slate-500">
                An acknowledgment has been dispatched to <strong>{formData.email}</strong>.<br />
                Our team will review your specifications and send a formal PDF quotation.
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Client Information */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1. Your Contact Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Company / Business Name (Optional)"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="WhatsApp / Phone Number *"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="Official Email Address *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Product Selection & Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  2. Product & Quantity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={formData.productSlug}
                      onChange={handleProductChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none font-medium"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} ({p.categoryName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Quantity *"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-sm text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preset Quantity chips */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[11px] text-slate-400">Popular Qty:</span>
                  {[100, 250, 500, 1000, 2500, 5000].map(q => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => setFormData({ ...formData, quantity: String(q) })}
                      className={`text-[11px] px-2 py-0.5 rounded border transition ${
                        formData.quantity === String(q) 
                          ? 'bg-brand-navy text-white border-brand-navy' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Specifications (Dimensions, Material, Finishing) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  3. Print Specifications
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dimensions */}
                  <div>
                    {activeSelectedProduct?.standardSizes && activeSelectedProduct.standardSizes.length > 0 ? (
                      <select
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      >
                        <option value="">Select Size / Dimensions</option>
                        {activeSelectedProduct.standardSizes.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Size or Dimensions (e.g. A4, 4x6 inch)"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Material */}
                  <div>
                    {activeSelectedProduct?.materials && activeSelectedProduct.materials.length > 0 ? (
                      <select
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      >
                        <option value="">Select Material Preference</option>
                        {activeSelectedProduct.materials.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Paper / Material (e.g. 350 GSM)"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Finishing */}
                  <div>
                    {activeSelectedProduct?.finishes && activeSelectedProduct.finishes.length > 0 ? (
                      <select
                        value={formData.finishing}
                        onChange={(e) => setFormData({ ...formData, finishing: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      >
                        <option value="">Select Finishing Preference</option>
                        {activeSelectedProduct.finishes.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Finishing (e.g. Matte, Spot UV)"
                        value={formData.finishing}
                        onChange={(e) => setFormData({ ...formData, finishing: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Additional Requirements & Artwork Upload */}
              <div className="space-y-3">
                <textarea
                  rows="2"
                  placeholder="Additional Requirements, special instructions, destination city..."
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-brand-blue focus:outline-none"
                ></textarea>

                {/* File Upload Box */}
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center bg-slate-50 transition relative">
                  <input
                    type="file"
                    id="artwork-upload"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.ai,.eps,.psd,.jpg,.jpeg,.png,.zip"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Upload Reference Artwork / Design File'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports PDF, AI, PSD, JPG, PNG or ZIP (Up to 50MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-crimson hover:bg-brand-red active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-brand-crimson/25 transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting Your Requirements...</span>
                    </span>
                  ) : (
                    <>
                      <span>GET MY QUOTATION</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  100% Free Custom Quotation &bull; No Obligation &bull; Fast Turnaround Guaranteed
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
