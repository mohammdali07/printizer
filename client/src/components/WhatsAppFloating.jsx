import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloating({ defaultProduct = null, currentPage = 'home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 260);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const getUrl = () => {
    let msg = "Hello PRINTIZER,\nI am interested in getting a quotation for commercial printing solutions.\nPlease share available options.\nThank you.";
    if (defaultProduct) {
      msg = `Hello PRINTIZER,\nI am interested in getting a quotation for ${defaultProduct}.\nPlease share your best quotation.\nThank you.`;
    }
    return `https://wa.me/919898351920?text=${encodeURIComponent(msg)}`;
  };

  // On mobile:
  // - Product page already has a fixed bottom bar with WhatsApp CTA, so hide floating icon below lg.
  // - Home page top fold already has WhatsApp CTA and 3 trust cards, so reveal floating icon after scrolling past hero.
  let visibilityClasses = 'flex';
  if (currentPage === 'product') {
    visibilityClasses = 'hidden lg:flex';
  } else if (currentPage === 'home') {
    visibilityClasses = scrolledPastHero ? 'flex' : 'hidden lg:flex';
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bottom-safe z-40 flex-col items-end ${visibilityClasses}`}>
      {/* Floating Prompt Card */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                PZ
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">PRINTIZER Desk</h4>
                <p className="text-xs text-emerald-600 font-medium">● Online • Instant Quotes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Need an instant quotation or material recommendation? Chat directly with our printing specialists.
          </p>
          <a
            href={getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 98983 51920)</span>
          </a>
        </div>
      )}

      {/* Main Floating Button - Clean & Professional */}
      <div className="relative group">
        <a
          href={getUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
          title="Chat with PRINTIZER on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
