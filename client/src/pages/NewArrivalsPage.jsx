import React, { useState } from 'react';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import ProductImage from '../components/ProductImage';

const NEW_ARRIVAL_PRODUCTS = [
  { id: 'na-1', title: '500 GSM Velvet UV Cards', badge: 'TRENDING', category: 'Business Stationery', image: '/images/products/500-gsm-matt-card-uv.webp', slug: '500-gsm-matt-card-uv' },
  { id: 'na-2', title: 'Carbonless Cash Memo Books', badge: 'NEW ARRIVAL', category: 'Business Stationery', image: '/images/products/cash-memo-book.webp', slug: 'cash-memo-book' },
  { id: 'na-3', title: '320 GSM Ultima UV Boxes', badge: 'NEW ARRIVAL', category: 'Packaging', image: '/images/products/320-gsm-ultima-uv-lamination.webp', slug: '320-gsm-ultima-uv-lamination' },
  { id: 'na-4', title: 'Waterproof Vinyl Stickers', badge: 'NEW ARRIVAL', category: 'Labels & Stickers', image: '/images/products/waterproof-sticker.webp', slug: 'waterproof-sticker' },
  { id: 'na-5', title: 'Non-Tearable NT Cards', badge: 'POPULAR', category: 'Business Stationery', image: '/images/products/nt-card-waterproof.jpg', slug: 'nt-card' },
  { id: 'na-6', title: '350 GSM Matte Visiting Cards', badge: 'TRENDING', category: 'Business Stationery', image: '/images/products/350-gsm-matt-card.webp', slug: '350-gsm-matt-card' },
  { id: 'na-7', title: 'Gold Foil Visiting Cards', badge: 'POPULAR', category: 'Business Stationery', image: '/images/products/gold-foil.webp', slug: 'visiting-card' },
  { id: 'na-8', title: '320 GSM Ultima Product Boxes', badge: 'NEW ARRIVAL', category: 'Packaging', image: '/images/products/product-box.webp', slug: 'product-box' },
  { id: 'na-9', title: '320 GSM Drip-Off UV Boxes', badge: 'NEW ARRIVAL', category: 'Packaging', image: '/images/products/320-gsm-ultima-drip-off-uv.webp', slug: '320-gsm-ultima-drip-off-uv' },
  { id: 'na-10', title: 'Round Die-Cut Stickers', badge: 'NEW ARRIVAL', category: 'Labels & Stickers', image: '/images/products/round-sticker.webp', slug: 'round-sticker' },
  { id: 'na-11', title: 'Corporate Letterheads', badge: 'POPULAR', category: 'Business Stationery', image: '/images/products/letterhead.webp', slug: 'letterhead' },
  { id: 'na-12', title: 'Tri-Fold Art Paper Brochures', badge: 'TRENDING', category: 'Marketing', image: '/images/products/brochure.webp', slug: 'brochure' },
  { id: 'na-13', title: 'Custom Business Flyers', badge: 'NEW ARRIVAL', category: 'Marketing', image: '/images/products/flyer.webp', slug: 'flyer' },
  { id: 'na-14', title: 'Multi-Page Product Catalogues', badge: 'NEW ARRIVAL', category: 'Marketing', image: '/images/products/catalogue.webp', slug: 'catalogue' },
  { id: 'na-15', title: 'Branded Envelopes', badge: 'NEW ARRIVAL', category: 'Business Stationery', image: '/images/products/envelope.webp', slug: 'envelope' },
  { id: 'na-16', title: 'Bill Books (NCR Carbonless)', badge: 'POPULAR', category: 'Business Stationery', image: '/images/products/bill-book.webp', slug: 'bill-book' },
  { id: 'na-17', title: 'Receipt Books', badge: 'NEW ARRIVAL', category: 'Business Stationery', image: '/images/products/receipt-book.webp', slug: 'receipt-book' },
  { id: 'na-18', title: 'Invoice Books', badge: 'NEW ARRIVAL', category: 'Business Stationery', image: '/images/products/invoice-book.webp', slug: 'invoice-book' },
  { id: 'na-19', title: 'Quotation Books', badge: 'NEW ARRIVAL', category: 'Business Stationery', image: '/images/products/quotation-book.webp', slug: 'quotation-book' },
  { id: 'na-20', title: 'Sweet & Cake Packaging Boxes', badge: 'NEW ARRIVAL', category: 'Packaging', image: '/images/products/sweet-box.webp', slug: 'sweet-box' }
];

export default function NewArrivalsPage({ onNavigate, onRequestQuote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterTabs = ['All', 'Business Stationery', 'Packaging', 'Labels & Stickers', 'Marketing'];

  const filteredItems = NEW_ARRIVAL_PRODUCTS.filter((item) => {
    const matchesTab = selectedFilter === 'All' || item.category === selectedFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="pb-20 space-y-8 bg-[#fafbfc]">
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
              <span className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[11px] font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Arrivals ({NEW_ARRIVAL_PRODUCTS.length} Products)</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                New Arrivals
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Explore our latest 20 commercial printing additions across business stationery, hospital stationery, packaging, and marketing collaterals.
              </p>
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Search new arrivals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-brand-crimson focus:outline-none rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills + 20-Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-sm text-slate-500">No new arrival products match &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('All');
              }}
              className="text-xs font-bold text-brand-crimson underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('configure', item.slug)}
                className="group cursor-pointer flex flex-col text-left"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs mb-2.5">
                  <span className="absolute top-2.5 left-2.5 z-10 bg-sky-200/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    placeholderLabel={item.title}
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="px-0.5 space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-crimson transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Printing Banner */}
        <div className="mt-8 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <h3 className="text-lg sm:text-xl font-extrabold">Need a Custom Print Job?</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Looking for a custom size, special GSM stock, or bulk corporate order? Request a quick quotation from our print desk.
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
