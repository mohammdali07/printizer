import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Phone, Mail, ChevronDown, Menu, X, ArrowRight, 
  MessageCircle, ShieldCheck, Lock, ExternalLink, ArrowUpRight,
  Sparkles, Layers, FileText
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [categoriesAccordionOpen, setCategoriesAccordionOpen] = useState(true);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const productsMenuRef = useRef(null);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    setMobileSearchOpen(false);
    onNavigate('product', slug);
  };

  const handleSelectCategory = (catId) => {
    setProductsDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('category', catId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs border-b border-slate-200/80">
      {/* 1. TOP ANNOUNCEMENT BAR (Compact & Responsive) */}
      <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand & Assurance */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-300 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0 animate-pulse"></span>
            <span className="font-bold text-white tracking-wider shrink-0 text-[10px] sm:text-xs">PRINTIZER</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="truncate text-slate-300 hidden sm:inline">
              PAN India Delivery &bull; Free Digital Soft Proofs
            </span>
            <span className="truncate text-slate-300 sm:hidden text-[9.5px]">
              PAN India Delivery Hub
            </span>
          </div>

          {/* Right: Direct WhatsApp Helpline & Admin Console */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <a 
              href="https://wa.me/919898351920" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-bold transition text-[10px] sm:text-xs"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">+91 98983 51920</span>
              <span className="sm:hidden text-[9.5px]">WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border border-slate-700 transition"
              title="Admin Portal"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-6">
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center shrink-0 text-left focus:outline-none group py-0.5"
          title="PRINTIZER Commercial Printing"
        >
          <img 
            src="/images/printizer-logo-horizontal.png" 
            alt="PRINTIZER - Everything Your Business Needs to Print" 
            className="h-7 sm:h-10 md:h-12 w-auto max-w-[125px] sm:max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02]"
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

          {/* Products Dropdown (Desktop) */}
          <div ref={productsMenuRef} className="relative">
            <button
              onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
              className="hover:text-brand-crimson transition uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Products</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
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
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:outline-none rounded-full py-2 pl-9 pr-8 text-xs text-slate-800 transition-all placeholder:text-slate-400 shadow-2xs"
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto text-left">
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

        {/* Action Controls: Mobile Search Trigger, Compact Quote CTA, Mobile Drawer Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile Search Icon Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Primary Action Button - Compact on Mobile */}
          <button
            onClick={() => onRequestQuote()}
            className="bg-brand-crimson hover:bg-brand-red text-white font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xs hover:shadow-md transition flex items-center space-x-1 active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
            title="Request Official Quotation"
          >
            <span className="hidden sm:inline">Request </span>
            <span>Quote</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE SEARCH DROPDOWN STRIP */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200 px-3 py-2.5 animate-in fade-in slide-in-from-top-1 text-left">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search products, visiting cards, boxes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-brand-crimson focus:outline-none rounded-xl py-2 pl-9 pr-8 text-xs text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {searchQuery.trim().length > 1 && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="p-3 text-xs text-slate-500 text-center">No products found</p>
              ) : (
                searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.slug)}
                    className="p-2.5 border-b border-slate-100 flex items-center space-x-2.5 hover:bg-slate-50"
                  >
                    <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <span className="text-[10px] text-brand-crimson">{item.categoryName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. LUXURY MOBILE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Pane */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 text-left">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <img 
                src="/images/printizer-logo-horizontal.png" 
                alt="PRINTIZER" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.src = "/images/printizer-logo-horizontal.jpeg";
                }}
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Quick Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search catalogue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:bg-white focus:border-brand-crimson focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activePage === 'home' ? 'bg-rose-50 text-brand-crimson font-extrabold' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>Home</span>
                  {activePage === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson"></span>}
                </button>

                {/* Categories Accordion */}
                <div>
                  <button
                    onClick={() => setCategoriesAccordionOpen(!categoriesAccordionOpen)}
                    className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Product Categories</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">9</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${categoriesAccordionOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {categoriesAccordionOpen && (
                    <div className="grid grid-cols-1 gap-1 pl-3 pr-1 pt-1 pb-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className="w-full text-left py-2 px-3 rounded-lg text-xs text-slate-700 hover:text-brand-crimson hover:bg-slate-50 transition flex items-center justify-between"
                        >
                          <span className="truncate">{cat.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('about'); }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activePage === 'about' ? 'bg-rose-50 text-brand-crimson font-extrabold' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>About PRINTIZER</span>
                  {activePage === 'about' && <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson"></span>}
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activePage === 'contact' ? 'bg-rose-50 text-brand-crimson font-extrabold' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>Contact Us</span>
                  {activePage === 'contact' && <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson"></span>}
                </button>
              </div>

              {/* Direct Help & WhatsApp Channel */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Commercial Support Channel
                </span>
                <a
                  href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20need%20assistance%20with%20custom%20printing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (+91 98983 51920)</span>
                </a>
              </div>

              {/* Admin Console Entry */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
                className="w-full text-left py-2.5 px-3.5 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold flex items-center justify-between transition hover:bg-slate-800"
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Console</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestQuote();
                }}
                className="w-full bg-brand-crimson hover:bg-brand-red text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-brand-crimson/20"
              >
                <span>Request Official Quotation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
