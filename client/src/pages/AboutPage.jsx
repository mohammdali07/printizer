import React from 'react';
import {
  ShieldCheck, Award, Sparkles, CheckCircle2, ArrowRight,
  MessageCircle, Printer, Layers, Truck, Clock, ArrowLeft
} from 'lucide-react';
import ProductImage from '../components/ProductImage';

export default function AboutPage({ onNavigate, onRequestQuote }) {
  const showcaseGallery = [
    {
      title: '350 GSM Matte Visiting Cards',
      tag: 'Executive Satin Finish',
      image: '/images/products/350-gsm-matt-card.webp',
      slug: 'visiting-card'
    },
    {
      title: '500 GSM Velvet + Raised Spot UV',
      tag: 'Tactile Luxury Card',
      image: '/images/products/500-gsm-matt-card-uv.webp',
      slug: 'visiting-card'
    },
    {
      title: 'Metallic Gold Foil Stamping',
      tag: 'Hot Foil Embossing',
      image: '/images/products/gold-foil.webp',
      slug: 'visiting-card'
    },
    {
      title: 'Non-Tearable Waterproof NT Card',
      tag: 'Synthetic Tear-Proof',
      image: '/images/products/nt-card-waterproof.jpg',
      slug: 'visiting-card'
    },
    {
      title: 'Corporate Letterheads & Stationery',
      tag: '100 GSM Executive Bond',
      image: '/images/products/letterhead.webp',
      slug: 'letterhead'
    },
    {
      title: '320 GSM Ultima Packaging Boxes',
      tag: 'Custom Structural Die-Cut',
      image: '/images/products/product-box.webp',
      slug: 'product-box'
    }
  ];

  return (
    <div className="pb-20 space-y-16 bg-[#fafbfc]">
      {/* 1. HERO HEADER WITH REAL PRINT COLLAGE */}
      <div className="bg-slate-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-left">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            <div className="lg:col-span-6 space-y-5">
              <span className="inline-block bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                About PRINTIZER
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                Everything Your Business Needs to Print.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                PRINTIZER is a premier commercial printing solutions company delivering tactile visiting cards, corporate stationery, marketing collaterals, and custom retail packaging engineered for lasting brand credibility.
              </p>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-lg sm:text-xl font-black text-white block">500+</span>
                  <span className="text-[11px] text-slate-300">Business Clients</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-lg sm:text-xl font-black text-white block">10+</span>
                  <span className="text-[11px] text-slate-300">Print Divisions</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-lg sm:text-xl font-black text-white block">300 DPI</span>
                  <span className="text-[11px] text-slate-300">CMYK Calibrated</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-lg sm:text-xl font-black text-white block">PAN India</span>
                  <span className="text-[11px] text-slate-300">Secure Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Studio Collage of Original Visiting Cards & Packaging */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-800">
                  <ProductImage
                    src="/images/reviews/ahle-interior-studio.jpg"
                    alt="Original Velvet and Gold Foil Visiting Cards"
                    eager={true}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-800">
                  <ProductImage
                    src="/images/products/nt-card-waterproof.jpg"
                    alt="Original Non-Tearable Waterproof Card"
                    eager={true}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-800">
                  <ProductImage
                    src="/images/products/500-gsm-matt-card-uv.webp"
                    alt="500 GSM Velvet Raised Spot UV Card"
                    eager={true}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-800">
                  <ProductImage
                    src="/images/reviews/manzil-travels.jpg"
                    alt="Original Tri-Fold Travel Brochures"
                    eager={true}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ORIGINAL PRINT FINISH SHOWCASE GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Craftsmanship &amp; Finishes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Original Print Samples &amp; Finishes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore real studio finishes across our visiting cards, waterproof synthetic stock, corporate stationery, and custom packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {showcaseGallery.map((item) => (
            <div
              key={item.title}
              onClick={() => onNavigate('configure', item.slug)}
              className="group bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left"
            >
              <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 mb-3.5">
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  placeholderLabel={item.title}
                  imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {item.tag}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-crimson transition-colors truncate">
                  {item.title}
                </h3>
                <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-brand-crimson group-hover:text-white flex items-center justify-center transition-colors text-slate-500 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MAIN NARRATIVE & PRINTIZER STANDARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-left">
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
              Our Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transforming Corporate Identity into Tactile Excellence
            </h2>
            <p>
              At <strong>PRINTIZER</strong>, we believe every piece of printed collateral represents your company&rsquo;s credibility, attention to detail, and prestige. From the weight of an executive visiting card to the structural precision of custom retail packaging, our solutions are engineered to leave an indelible impression.
            </p>
            <p>
              We eliminate the friction of conventional print ordering by offering dedicated consultation, transparent custom quotations, calibrated color proofs, and dependable doorstep delivery across India.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-brand-crimson flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Offset &amp; Digital</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Short runs &amp; high-volume presses</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">24 Hours Service</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fast turnaround &amp; support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              The PRINTIZER Standards
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Rigorous Color Fidelity:</strong> Design strictly in CMYK with fonts converted to curves (CorelDRAW X7 or older / press PDF); digital proofs verified prior to print.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Substrate Integrity:</strong> Verified paper grammages (80–800 GSM cards, Sunshine, Alabaster, SSP, Excel Bond, HM &amp; PVC stickers, 320 GSM Ultima boards).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Specialized Embellishments:</strong> Gold &amp; Silver hot foil stamping, raised spot UV, half blade, creasing, perforation, folding, punching &amp; die cutting.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Gujarat Dispatch &amp; PAN India Delivery:</strong> Courier (₹60/pack), Transport (₹300/parcel), or Office Pickup with Retail &amp; GST (State Code 24) tax invoicing.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. CORE CAPABILITIES */}
        <div className="border-t border-slate-200 pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Printing Solutions Spectrum
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              End-to-end commercial printing tailored for modern enterprises, retail brands, and institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Corporate &amp; Business Stationery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visiting cards, premium letterheads, branded envelopes, presentation folders, bill books, and unified corporate identity collaterals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Retail Packaging &amp; Labels</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Custom folding cartons, 320 GSM Ultima product boxes, luxury paper bags, packaging sleeves, and waterproof PVC/metallic stickers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-left space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Marketing &amp; Institutional Print</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vibrant brochures, multi-page product catalogues, flyers, school diaries &amp; ID cards, restaurant menus, and hospital medical stationery.
              </p>
            </div>
          </div>
        </div>

        {/* 5. CTA BANNER */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 border border-slate-800 shadow-xl">
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Experience the PRINTIZER Advantage?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Browse our full category catalog or connect directly with our print team for an immediate itemized quotation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('categories')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Categories</span>
            </button>
            <button
              type="button"
              onClick={() => onRequestQuote()}
              className="bg-brand-crimson hover:bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-brand-crimson/25 cursor-pointer"
            >
              Request a Quotation
            </button>
            <a
              href="https://wa.me/917574927200"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp +91 75749 27200</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
