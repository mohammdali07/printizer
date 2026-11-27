import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function WhatsAppIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.58-1.68a12.76 12.76 0 0 0 6.224 1.61h.005c7.058 0 12.796-5.74 12.796-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.004 3.2Zm0 23.36h-.004a10.56 10.56 0 0 1-5.38-1.47l-.386-.23-3.904.996 1.042-3.806-.252-.4a10.55 10.55 0 0 1-1.62-5.65c0-5.83 4.744-10.57 10.578-10.57 2.825 0 5.48 1.1 7.476 3.1a10.5 10.5 0 0 1 3.098 7.47c0 5.83-4.744 10.56-10.648 10.56Zm5.8-7.91c-.318-.16-1.88-.93-2.172-1.035-.29-.106-.502-.16-.714.16-.212.318-.82 1.035-1.005 1.247-.185.212-.37.238-.688.08-.318-.16-1.342-.495-2.556-1.577-.945-.843-1.583-1.884-1.768-2.202-.185-.318-.02-.49.14-.648.143-.142.318-.37.477-.556.16-.185.212-.318.318-.53.106-.212.053-.397-.026-.556-.08-.16-.714-1.72-.979-2.356-.258-.62-.52-.536-.714-.546-.185-.01-.397-.01-.609-.01-.212 0-.556.08-.847.397-.29.318-1.11 1.085-1.11 2.646s1.136 3.07 1.295 3.282c.16.212 2.236 3.414 5.417 4.787.756.326 1.346.521 1.806.667.759.241 1.45.207 1.996.125.609-.091 1.88-.769 2.145-1.511.265-.742.265-1.378.185-1.511-.08-.133-.29-.212-.609-.371Z" />
    </svg>
  );
}

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
    return `https://wa.me/917574927200?text=${encodeURIComponent(msg)}`;
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
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 75749 27200)</span>
          </a>
        </div>
      )}

      {/* Main Floating Button - Authentic WhatsApp Logo */}
      <div className="relative group">
        <a
          href={getUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/45 hover:scale-105 transition-all duration-300"
          title="Chat with PRINTIZER on WhatsApp"
          aria-label="Chat with PRINTIZER on WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </a>
      </div>
    </div>
  );
}
