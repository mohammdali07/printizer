import React from 'react';
import { 
  Mail, Phone, MapPin, ShieldCheck, Truck, Clock, Sparkles, 
  CheckCircle2, ArrowRight, Instagram, Facebook, Twitter, Lock, HelpCircle
} from 'lucide-react';

export default function Footer({ onNavigate, categories = [] }) {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 text-left">
      {/* 1. TOP TRUST BADGES STRIP */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-crimson shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">100% Quality Guarantee</h4>
                <p className="text-[11px] text-slate-500">Strict CMYK color & finish calibration</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">Free Digital Soft Proofs</h4>
                <p className="text-[11px] text-slate-500">Artwork reviewed prior to print</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">PAN India Shipping</h4>
                <p className="text-[11px] text-slate-500">Secure, moisture-proof transit</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">Rapid B2B Quotations</h4>
                <p className="text-[11px] text-slate-500">Itemized pricing within hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 5-COLUMN FOOTER LINKS (Matching Printec reference layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => onNavigate('home')} 
              className="block text-left focus:outline-none"
            >
              <img 
                src="/images/printizer-logo-horizontal.png" 
                alt="PRINTIZER" 
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.src = "/images/printizer-logo-horizontal.jpeg";
                }}
              />
            </button>

            <p className="text-xs text-slate-500 leading-relaxed">
              PRINTIZER delivers bespoke commercial printing solutions across India: luxury visiting cards, retail packaging boxes, marketing brochures, and large format exhibition displays.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-1 text-slate-400">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Get in Touch */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                <span>Pan India Doorstep Delivery Hub</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="https://wa.me/919898351920" target="_blank" rel="noopener noreferrer" className="hover:text-brand-crimson font-medium">
                  +91 98983 51920
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:Printizerdesign@gmail.com" className="hover:text-brand-crimson font-medium">
                  Printizerdesign@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Information
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-brand-crimson transition">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  PAN India Shipping Info
                </button>
              </li>
              <li>
                <a href="#configurator-section" className="hover:text-brand-crimson transition">
                  Quotation Calculator
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  File Upload Rules (CDR x7)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  Terms of Service & Privacy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Useful Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Commercial Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('category', 'business-printing')} className="hover:text-brand-crimson transition">
                  Visiting & Business Cards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'packaging-printing')} className="hover:text-brand-crimson transition">
                  Custom Packaging Boxes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'marketing-printing')} className="hover:text-brand-crimson transition">
                  Brochures & Flyers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'stickers-labels')} className="hover:text-brand-crimson transition">
                  Die-Cut Vinyl Stickers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'large-format-printing')} className="hover:text-brand-crimson transition">
                  Roll-Up Banners & Signage
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: About Us & Admin */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              About PRINTIZER
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  Our Quality Commitment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-brand-crimson transition">
                  Prepress Support Team
                </button>
              </li>
              <li>
                <a href="https://wa.me/919898351920" target="_blank" rel="noopener noreferrer" className="hover:text-brand-crimson transition text-emerald-600 font-bold">
                  WhatsApp Support Hub
                </a>
              </li>
              <li className="pt-2">
                <button 
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Admin Console</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT BAR */}
      <div className="border-t border-slate-100 py-6 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} <strong>PRINTIZER</strong> &bull; Everything Your Business Needs to Print. All rights reserved.
          </p>
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
            <span>CorelDRAW CDR x7 Compatible</span>
            <span>&bull;</span>
            <span>CMYK 300 DPI Prepress</span>
            <span>&bull;</span>
            <span>Doorstep Transit Insured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
