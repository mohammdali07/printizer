import React, { useState } from 'react';
import { ArrowRight, MessageCircle, ChevronRight, Search, ShieldCheck } from 'lucide-react';

export default function CategoryPage({ 
  category, 
  products = [], 
  onNavigate, 
  onRequestQuote
}) {
  const [filterQuery, setFilterQuery] = useState('');
  
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Category Not Found</h2>
        <button 
          onClick={() => onNavigate('home')}
          className="mt-4 text-xs font-bold text-brand-crimson underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const categoryProducts = products.filter(p => p.categoryId === category.id);
  const filteredProducts = categoryProducts.filter(p => 
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="pb-20 space-y-10">
      {/* Category Header Banner */}
      <div className="bg-brand-navy text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition">
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-crimson font-medium">{category.name}</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-block bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              {category.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> products in {category.name}
          </p>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={`Filter in ${category.name}...`}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Product Cards */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((p) => {
              const waQuoteText = `Hello PRINTIZER,
I am interested in getting a quotation for ${p.name}.
Quantity: ${p.minQuantity || 500}
Please share your best quotation.
Thank you.`;
              const waUrl = `https://wa.me/919898351920?text=${encodeURIComponent(waQuoteText)}`;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group"
                >
                  {/* Mockup Image */}
                  <div 
                    onClick={() => onNavigate('product', p.slug)}
                    className="relative h-52 overflow-hidden bg-slate-50 cursor-pointer"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      Min Qty: {p.minQuantity} units
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => onNavigate('product', p.slug)}
                        className="text-base font-bold text-slate-900 hover:text-brand-crimson transition cursor-pointer"
                      >
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.tagline || p.description}
                      </p>

                      {/* Specs badges preview */}
                      {p.materials && p.materials.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {p.materials.slice(0, 2).map((m, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => onRequestQuote({ productName: p.name, productSlug: p.slug, quantity: p.minQuantity })}
                        className="w-full bg-brand-crimson hover:bg-brand-red text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-brand-crimson/20"
                      >
                        <span>Request a Quote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigate('product', p.slug)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-xl text-xs transition text-center"
                        >
                          View Specs
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold py-1.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No products match "{filterQuery}".</p>
            <button
              onClick={() => setFilterQuery('')}
              className="mt-3 text-xs font-bold text-brand-crimson underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Custom Printing CTA Box */}
        <div className="bg-gradient-to-r from-brand-navy to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Need a Custom Size or Unique Material?</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              We specialize in custom dielines, unconventional paper stocks, and special binding techniques tailored to your company's blueprint.
            </p>
          </div>
          <button
            onClick={() => onRequestQuote({ productName: `${category.name} - Custom Spec` })}
            className="shrink-0 bg-brand-crimson hover:bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-brand-crimson/30"
          >
            Submit Custom Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
