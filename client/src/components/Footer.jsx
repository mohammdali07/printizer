import React from 'react';
import { 
  Mail, Phone, MapPin, ShieldCheck, Truck, Clock, Sparkles, 
  CheckCircle2, ArrowRight, Instagram, Facebook, Twitter, Lock, HelpCircle
} from 'lucide-react';

export default function Footer({ onNavigate, categories = [] }) {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 text-left">
      {/* MAIN 5-COLUMN FOOTER LINKS (Matching Printec reference layout) */}
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
            <div className="flex items-center space-x-2.5 pt-1 text-slate-500">
              <a
                href="https://www.facebook.com/printizer_"
                target="_blank"
                rel="noopener noreferrer"
                title="PRINTIZER on Facebook (@printizer_)"
                aria-label="Facebook @printizer_"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/printizer_"
                target="_blank"
                rel="noopener noreferrer"
                title="PRINTIZER on Instagram (@printizer_)"
                aria-label="Instagram @printizer_"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-crimson hover:text-white flex items-center justify-center transition"
              >
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
                <span>Gujarat (Code 24) &bull; PAN India Dispatch</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="https://wa.me/917574927200" target="_blank" rel="noopener noreferrer" className="hover:text-brand-crimson font-medium">
                  +91 75749 27200
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:printizerdesign@gmail.com" className="hover:text-brand-crimson font-medium">
                  printizerdesign@gmail.com
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
                <button onClick={() => onNavigate('product', 'visiting-card')} className="hover:text-brand-crimson transition">
                  Product Configurator & Quote
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  Printing Quality Assurance
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-brand-crimson transition">
                  Terms of Service & Privacy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Commercial Categories */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Printing Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('category', 'business-stationery')} className="hover:text-brand-crimson transition">
                  Business Stationery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'packaging-printing')} className="hover:text-brand-crimson transition">
                  Packaging Printing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'marketing-advertising')} className="hover:text-brand-crimson transition">
                  Marketing & Advertising
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'labels-stickers')} className="hover:text-brand-crimson transition">
                  Labels & Stickers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category', 'books-publications')} className="hover:text-brand-crimson transition">
                  Books & Publications
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
                <a href="https://wa.me/917574927200" target="_blank" rel="noopener noreferrer" className="hover:text-brand-crimson transition text-emerald-600 font-bold">
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
      <div className="border-t border-slate-100 py-6 pb-20 lg:pb-6 px-5 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong>PRINTIZER</strong> &bull; Everything Your Business Needs to Print. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
            <span>PAN India Delivery</span>
            <span>&bull;</span>
            <span>CMYK True Color Calibration</span>
            <span>&bull;</span>
            <span>Insured Doorstep Transit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
