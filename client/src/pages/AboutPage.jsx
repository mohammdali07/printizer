import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

export default function AboutPage({ onNavigate, onRequestQuote }) {
  return (
    <div className="pb-20 space-y-16">
      {/* Hero Header */}
      <div className="bg-brand-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            About PRINTIZER
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything Your Business Needs to Print.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            PRINTIZER is a premier commercial printing solutions company providing comprehensive customised printing products, bespoke corporate packaging, and high-impact marketing collaterals.
          </p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900">
              Transforming Corporate Identity into Tactile Excellence
            </h2>
            <p>
              At <strong>PRINTIZER</strong>, we believe every piece of printed collateral represents your company’s credibility, attention to detail, and prestige. From the weight of an executive visiting card to the structural precision of custom retail packaging, our solutions are engineered to leave an indelible impression.
            </p>
            <p>
              We eliminate the friction of conventional print ordering by offering dedicated consultation, transparent custom quotations, calibrated color proofs, and dependable doorstep delivery across India.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              The PRINTIZER Standards
            </h3>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Rigorous Color Fidelity:</strong> Design strictly in CMYK with fonts converted to curves (CorelDRAW X7 or older / press PDF); digital proofs verified prior to print.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Substrate Integrity:</strong> Verified paper grammages (80–800 GSM cards, Sunshine, Alabaster, SSP, Excel Bond, HM & PVC stickers, 320 GSM Ultima boards).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Specialized Embellishments:</strong> Gold & Silver hot foil stamping, raised spot UV, half blade, creasing, perforation, folding, punching & die cutting.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span><strong>Gujarat Dispatch & PAN India Delivery:</strong> Courier (₹60/pack), Transport (₹300/parcel), or Office Pickup with Retail & GST (State Code 24) tax invoicing.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="border-t border-slate-200 pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Our Printing Solutions Spectrum
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              End-to-end commercial printing tailored for modern enterprises, retail brands, and institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Corporate & Business Stationery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visiting cards, premium letterheads, branded envelopes, presentation folders, and unified corporate identity collaterals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Retail Packaging & Labels</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Custom folding cartons, product boxes, luxury paper bags, packaging sleeves, waterproof product labels, and roll labels.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Marketing & Large Format</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vibrant brochures, multi-page product catalogues, pull-up roll banners, outdoor flex, rigid standees, and custom calendars.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="bg-brand-navy rounded-3xl p-8 sm:p-10 text-white text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold">
            Ready to Experience the PRINTIZER Advantage?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Discuss your upcoming project or request an immediate quotation with our printing team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onRequestQuote()}
              className="bg-brand-crimson hover:bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-brand-crimson/25"
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
