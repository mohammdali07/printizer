import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloating({ defaultProduct = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const getUrl = () => {
    let msg = "Hello PRINTIZER,\nI am interested in getting a quotation for commercial printing solutions.\nPlease share available options.\nThank you.";
    if (defaultProduct) {
      msg = `Hello PRINTIZER,\nI am interested in getting a quotation for ${defaultProduct}.\nPlease share your best quotation.\nThank you.`;
    }
    return `https://wa.me/919898351920?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Prompt Card */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
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
              className="text-slate-400 hover:text-slate-600 p-1"
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

      {/* Main Floating Button */}
      <div className="relative group">
        <a
          href={getUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
          title="Chat with PRINTIZER on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </a>
      </div>
    </div>
  );
}
