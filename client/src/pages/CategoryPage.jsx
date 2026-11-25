import React, { useState } from 'react';
import { ArrowRight, MessageCircle, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import ProductImage from '../components/ProductImage';

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
      {/* Category Header Banner with Authentic Studio Photograph */}
      <div className="bg-slate-900 text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3.5 text-left">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <button onClick={() => onNavigate('home')} className="hover:text-white transition">
                Home
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-crimson font-medium">{category.name}</span>
            </div>

            <span className="inline-block bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full">
              {category.badge || `${categoryProducts.length} Products`}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {category.description}
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative aspect-[4/3] w-full max-w-md rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl">
              <ProductImage
                src={category.image}
                alt={category.name}
                placeholderLabel={category.name}
                eager={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
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
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-7">
            {filteredProducts.map((p) => {
              const unitLabel = p.pricingConfig?.unitName || 'units';
              const waQuoteText = `Hello PRINTIZER,
I am interested in getting a quotation for ${p.name}.
Quantity: ${p.minQuantity || 500} ${unitLabel}
Please share your best quotation.
Thank you.`;
              const waUrl = `https://wa.me/919898351920?text=${encodeURIComponent(waQuoteText)}`;

              const startingPriceDisplay = p.pricingConfig?.startingPrice
                ? `₹ ${Number(p.pricingConfig.startingPrice).toLocaleString('en-IN')}`
                : (p.baseRate ? `₹ ${Math.round(p.baseRate * (p.minQuantity || 100)).toLocaleString('en-IN')}` : 'Custom Quote');

              const specChips = [
                ...(Array.isArray(p.materials) ? p.materials.slice(0, 2) : []),
                ...(Array.isArray(p.finishes) ? p.finishes.slice(0, 1) : [])
              ].filter(Boolean);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Unique Studio Product Photograph */}
                  <div 
                    onClick={() => onNavigate('product', p.slug)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer border-b border-slate-100 shrink-0"
                  >
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      placeholderLabel={p.name}
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[9.5px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-md shadow-xs">
                      MOQ: {(p.minQuantity || 100).toLocaleString('en-IN')} {unitLabel}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
                    <div className="space-y-1 sm:space-y-1.5">
                      <h3 
                        onClick={() => onNavigate('product', p.slug)}
                        className="text-[13px] sm:text-base font-bold text-slate-900 hover:text-brand-crimson transition cursor-pointer line-clamp-2 leading-snug"
                      >
                        {p.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.tagline || p.description}
                      </p>

                      {/* Available Paper Types & Specifications */}
                      {specChips.length > 0 && (
                        <div className="pt-0.5 flex flex-wrap gap-1">
                          {specChips.map((chip, idx) => (
                            <span
                              key={idx}
                              className="text-[9.5px] sm:text-[10px] bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded font-medium line-clamp-1 max-w-full"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Equal-Aligned Action Stack */}
                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2 mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Starting from:</span>
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {startingPriceDisplay}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate('configure', p.slug)}
                        className="w-full bg-brand-crimson hover:bg-brand-red text-white font-extrabold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[10.5px] sm:text-xs transition flex items-center justify-center space-x-1 shadow-md shadow-brand-crimson/20 min-h-[36px] sm:min-h-[38px]"
                      >
                        <span>Configure &amp; Get Quote</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      </button>

                      <div className="grid grid-cols-2 gap-1 sm:gap-2">
                        <button
                          onClick={() => onNavigate('product', p.slug)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs transition text-center min-h-[34px] whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs transition flex items-center justify-center space-x-1 min-h-[34px] whitespace-nowrap"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
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
