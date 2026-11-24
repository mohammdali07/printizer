import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Phone, Mail, ChevronDown, Menu, X, ArrowRight, 
  MessageCircle, ShieldCheck, Lock, ExternalLink, ArrowUpRight
} from 'lucide-react';

export default function Header({ 
  onNavigate, 
  categories = [], 
  products = [], 
  onRequestQuote,
  activePage = 'home'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const productsMenuRef = useRef(null);

  // Filter search results
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase().trim();
      const matches = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.categoryName?.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
      ).slice(0, 8);
      setSearchResults(matches);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, products]);

  // Click outside search & dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (productsMenuRef.current && !productsMenuRef.current.contains(e.target)) {
        setProductsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (slug) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    onNavigate('product', slug);
  };

  const handleSelectCategory = (catId) => {
    setProductsDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('category', catId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left Info: Delivery & Quality Notice */}
          <div className="flex items-center space-x-2 text-slate-300 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-crimson shrink-0 animate-pulse"></span>
            <span className="font-semibold text-white tracking-wide shrink-0">PRINTIZER</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="truncate hidden sm:inline text-slate-300">
              PAN India Doorstep Delivery • Free Digital Soft Proofs
            </span>
          </div>

          {/* Right: WhatsApp direct & Admin portal */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
            <a 
              href="https://wa.me/919898351920" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold transition text-[10px] sm:text-xs"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>+91 98983 51920</span>
            </a>

            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border border-slate-700 transition"
              title="Admin Management Console"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center shrink-0 text-left focus:outline-none group py-0.5"
          title="PRINTIZER Home"
        >
          <img 
            src="/images/printizer-logo-horizontal.png" 
            alt="PRINTIZER - Everything Your Business Needs to Print" 
            className="h-10 sm:h-12 md:h-14 lg:h-[3.75rem] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            onError={(e) => {
              e.target.src = "/images/printizer-logo-horizontal.jpeg";
            }}
          />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs sm:text-sm font-semibold text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-brand-crimson transition uppercase tracking-wider ${
              activePage === 'home' ? 'text-brand-crimson font-extrabold' : ''
            }`}
          >
            Home
          </button>

          {/* Products Dropdown */}
          <div ref={productsMenuRef} className="relative">
            <button
              onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
              className="hover:text-brand-crimson transition uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Products</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {productsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 max-h-[85vh] overflow-y-auto">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Commercial Printing Categories (9)
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-crimson transition flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => handleSelectCategory('business-stationery')}
                    className="w-full text-left px-4 py-2 text-[11px] font-bold text-brand-navy hover:text-brand-crimson transition"
                  >
                    Visiting Cards & Business Stationery →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-brand-crimson transition uppercase tracking-wider ${
              activePage === 'about' ? 'text-brand-crimson font-extrabold' : ''
            }`}
          >
            About Us
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`hover:text-brand-crimson transition uppercase tracking-wider ${
              activePage === 'contact' ? 'text-brand-crimson font-extrabold' : ''
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setShowSearchDropdown(true)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:outline-none rounded-full py-2 pl-9 pr-8 text-xs text-slate-800 transition-all placeholder:text-slate-400 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No products found matching "{searchQuery}"
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.slug)}
                    className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center space-x-3 transition border-b border-slate-50 last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      <span className="text-[10px] text-brand-crimson font-medium">{item.categoryName}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action CTAs: Request a Quote & Mobile Hamburger */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => onRequestQuote()}
            className="bg-brand-crimson hover:bg-brand-red text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md shadow-brand-crimson/20 hover:shadow-lg transition flex items-center space-x-1.5 active:scale-95"
          >
            <span>Request a Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-DOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-xl">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-xs text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Navigation links */}
          <div className="space-y-1 pt-1 text-xs font-semibold text-slate-800">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
            >
              Home
            </button>
            
            <div className="py-2 px-3 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Product Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="text-left text-xs text-slate-700 py-1.5 hover:text-brand-crimson transition truncate"
                >
                  • {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('about'); }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
            >
              About PRINTIZER
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
            >
              Contact Us
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
              className="w-full text-left py-2 px-3 rounded-lg bg-slate-900 text-amber-300 text-xs font-bold flex items-center space-x-1.5 mt-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Management Console</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
