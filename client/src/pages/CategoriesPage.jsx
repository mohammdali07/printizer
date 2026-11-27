import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Layers } from 'lucide-react';
import ProductImage from '../components/ProductImage';

export default function CategoriesPage({
  categories = [],
  products = [],
  onNavigate,
  onRequestQuote
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-20 space-y-10 bg-[#fafbfc]">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-left">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-brand-crimson/20 border border-brand-crimson/40 text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full">
                <Layers className="w-3.5 h-3.5" />
                <span>Commercial Printing Categories ({categories.length})</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Explore All Printing Divisions
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Select any commercial printing category below to browse products, material options, sizes, and instant bulk pricing.
              </p>
            </div>

            {/* Search Categories */}
            <div className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-brand-crimson focus:outline-none rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-sm text-slate-500">No categories match &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-brand-crimson underline cursor-pointer"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {filteredCategories.map((cat) => {
              const prodCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate('category', cat.id)}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 cursor-pointer flex flex-col justify-between text-left"
                >
                  <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm mb-4">
                    <ProductImage
                      src={cat.image}
                      alt={cat.name}
                      placeholderLabel={cat.name}
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {prodCount} {prodCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-brand-crimson transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-brand-crimson transition-colors">
                      <span>View Products</span>
                      <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-brand-crimson group-hover:text-white flex items-center justify-center transition-all duration-200 text-slate-500">
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Printing Banner */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <h3 className="text-lg sm:text-xl font-extrabold">Need a Custom Printing Solution?</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Have a custom size, special substrate, or bulk corporate order? Request an itemized quotation directly from our team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestQuote && onRequestQuote()}
            className="shrink-0 bg-brand-crimson hover:bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-brand-crimson/30 cursor-pointer"
          >
            Request Official Quote
          </button>
        </div>
      </div>
    </div>
  );
}
