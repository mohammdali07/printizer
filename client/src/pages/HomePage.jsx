import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ShieldCheck, CheckCircle2, Sparkles, 
  Layers, Package, Award, Clock, FileText, ChevronRight, Phone, 
  ArrowUpRight, Check, Printer, Truck, Palette, Mail, Send, CheckCircle, 
  ExternalLink, Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomePage({ 
  categories = [], 
  products = [], 
  onNavigate, 
  onRequestQuote
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Hero Carousel Slides with 100% Transparent Isolated Mockups
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const heroSlides = [
    {
      id: 0,
      title: 'Executive Visiting Cards',
      tagline: '350 GSM Velvet Touch + Gold Foil Stamping',
      image: '/images/slides/cards.webp',
      badge: 'Corporate Standard',
      circleBg: 'from-rose-500/15 via-rose-500/5 to-transparent',
      pill1: '💎 350 GSM Velvet Stock',
      pill2: '🌟 Raised Spot UV & Foil',
      rotate: 'rotate-1 hover:rotate-0'
    },
    {
      id: 1,
      title: 'Custom Product Packaging Boxes',
      tagline: 'Rigid SBS Board & Clean Auto-Lock Folding',
      image: '/images/slides/packaging.webp',
      badge: 'Luxury Packaging',
      circleBg: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      pill1: '📦 Custom Structural Dielines',
      pill2: '🌿 Certified Food-Grade Board',
      rotate: '-rotate-1 hover:rotate-0'
    },
    {
      id: 2,
      title: 'Corporate Business Stationery',
      tagline: 'Letterheads, Envelopes, Files & ID Systems',
      image: '/images/slides/stationery.webp',
      badge: 'Office Stationery',
      circleBg: 'from-blue-500/15 via-blue-500/5 to-transparent',
      pill1: '📋 100 GSM Executive Bond',
      pill2: '✉️ Peel-and-Seal Envelopes',
      rotate: 'rotate-1 hover:rotate-0'
    }
  ];

  // Auto-advance hero slides every 5s unless hovered
  useEffect(() => {
    if (heroPaused) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPaused, heroSlides.length]);

  const activeHero = heroSlides[currentHeroSlide] || heroSlides[0];

  // 9 Authentic Commercial Showcase Categories from user catalogue
  const showcaseCategories = [
    {
      id: 'business-stationery',
      title: 'BUSINESS STATIONERY',
      subtitle: 'Visiting Cards, Letterheads, Bill Books, Vouchers & ID Systems',
      image: '/images/categories/business-stationery.webp',
      targetCategory: 'business-stationery',
      badge: '15 Products'
    },
    {
      id: 'marketing-advertising',
      title: 'MARKETING & ADVERTISING',
      subtitle: 'Pamphlets, Flyers, Brochures, Posters, Standees & Banners',
      image: '/images/categories/marketing-advertising.webp',
      targetCategory: 'marketing-advertising',
      badge: '12 Products'
    },
    {
      id: 'books-publications',
      title: 'BOOKS & PUBLICATIONS',
      subtitle: 'Notebooks, Diaries, Book Printing, Magazines & Thesis Binding',
      image: '/images/categories/books-publications.webp',
      targetCategory: 'books-publications',
      badge: '12 Products'
    },
    {
      id: 'wedding-invitation',
      title: 'WEDDING & INVITATION',
      subtitle: 'Royal Wedding Cards, Metallic Foil Invitations & Envelopes',
      image: '/images/categories/wedding-invitation.webp',
      targetCategory: 'wedding-invitation',
      badge: '9 Products'
    },
    {
      id: 'packaging-printing',
      title: 'PACKAGING PRINTING',
      subtitle: 'Paper Bags, Shopping Bags, Product Boxes & Folding Cartons',
      image: '/images/categories/packaging-printing.webp',
      targetCategory: 'packaging-printing',
      badge: '11 Products'
    },
    {
      id: 'labels-stickers',
      title: 'LABELS & STICKERS',
      subtitle: 'Round, Square, Transparent & Waterproof Vinyl Stickers',
      image: '/images/categories/labels-stickers.webp',
      targetCategory: 'labels-stickers',
      badge: '9 Products'
    },
    {
      id: 'photo-digital-printing',
      title: 'PHOTO & DIGITAL PRINTING',
      subtitle: 'Ultra HD Photo Prints, Canvases, PVC Cards & Photo Frames',
      image: '/images/categories/photo-digital-printing.webp',
      targetCategory: 'photo-digital-printing',
      badge: '8 Products'
    },
    {
      id: 'school-educational-printing',
      title: 'SCHOOL & EDUCATIONAL',
      subtitle: 'School ID Cards, Marksheets, Certificates, Diaries & Prospectus',
      image: '/images/categories/school-educational-printing.webp',
      targetCategory: 'school-educational-printing',
      badge: '10 Products'
    },
    {
      id: 'restaurant-hotel-printing',
      title: 'RESTAURANT & HOTEL',
      subtitle: 'Menu Cards, Food Packaging, Table Tents & Key Card Sleeves',
      image: '/images/categories/restaurant-hotel-printing.webp',
      targetCategory: 'restaurant-hotel-printing',
      badge: '9 Products'
    }
  ];

  // Curated Featured Commercial Products (Real Products from Catalogue)
  const featuredProducts = [
    {
      id: 'visiting-card',
      slug: 'visiting-card',
      name: 'Executive Visiting Cards',
      category: 'Business Stationery',
      image: '/images/products/visiting-card.webp',
      specs: '350 GSM Velvet Soft-Touch / Raised Spot UV / Gold Foil',
      minQty: 1000,
      startingPrice: 350,
      unitPrice: '₹0.35/card'
    },
    {
      id: 'product-box',
      slug: 'product-box',
      name: 'Custom Product Packaging Boxes',
      category: 'Packaging Printing',
      image: '/images/products/product-box.webp',
      specs: 'Rigid SBS Board / Structural Die-Line / Auto-Lock Base',
      minQty: 500,
      startingPrice: 12000,
      unitPrice: '₹24/box'
    },
    {
      id: 'letterhead',
      slug: 'letterhead',
      name: 'Corporate Letterheads',
      category: 'Business Stationery',
      image: '/images/products/letterhead.webp',
      specs: '100 GSM Executive Bond / Alabaster Superfine Stock',
      minQty: 500,
      startingPrice: 1100,
      unitPrice: '₹2.20/sheet'
    },
    {
      id: 'round-sticker',
      slug: 'round-sticker',
      name: 'Waterproof Die-Cut Stickers',
      category: 'Labels & Stickers',
      image: '/images/products/round-sticker.webp',
      specs: '100% Waterproof BOPP Vinyl / Precision Contour Kiss-Cut',
      minQty: 1000,
      startingPrice: 1800,
      unitPrice: '₹1.80/sticker'
    },
    {
      id: 'brochure',
      slug: 'brochure',
      name: 'Tri-Fold Marketing Brochures',
      category: 'Marketing & Advertising',
      image: '/images/products/brochure.webp',
      specs: '170 GSM Gloss Art / Precision Creasing & Multi-Panel Fold',
      minQty: 500,
      startingPrice: 4250,
      unitPrice: '₹8.50/copy'
    }
  ];

  // Commercial Capabilities & Production Quality
  const printingGuides = [
    {
      id: 1,
      title: 'Advanced Offset & High-Definition Digital Presses',
      category: 'Printing Capabilities',
      snippet: 'High-speed multi-color offset presses for high-volume cost efficiency, alongside ultra-high-definition digital presses for short runs and rapid turnaround.',
      date: 'Production Technology'
    },
    {
      id: 2,
      title: 'Selecting the Right Paper GSM for Corporate Collaterals',
      category: 'Paper Stocks',
      snippet: 'A comprehensive comparative breakdown of 80 GSM bond writing sheets, 170 GSM brochure stocks, and 350+ GSM velvet laminated cardboards.',
      date: 'Paper Engineering'
    },
    {
      id: 3,
      title: 'Raised Spot UV vs. Hot Foil Stamping Comparison',
      category: 'Finishing Techniques',
      snippet: 'How specialized tactile embellishments transform ordinary business cards and retail folding cartons into luxury brand statements.',
      date: 'Finishing Guide'
    }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
  };

  return (
    <div className="space-y-10 sm:space-y-20 lg:space-y-24 pb-20 bg-[#fafbfc]">
      {/* 1. HERO SECTION (Expanded Full-Width Mobile-First Showcase) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-[#fafbfc] pt-4 pb-8 xs:pt-6 xs:pb-10 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-3.5 sm:space-y-5 text-left">
              {/* Small Professional Eyebrow Label */}
              <div className="inline-flex items-center space-x-1.5 bg-white border border-slate-200/90 rounded-full py-1 px-3 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson animate-pulse"></span>
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-widest text-slate-700 uppercase">
                  Professional Printing Solutions
                </span>
              </div>

              {/* Expanded Powerful Headline */}
              <h1 className="text-[26px] min-[350px]:text-3xl xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Make Every Print <br />
                <span className="text-brand-crimson relative inline-block">
                  Stand Out.
                  <span className="absolute bottom-1 left-0 right-0 h-1.5 sm:h-2 bg-brand-crimson/15 -z-10 rounded"></span>
                </span>
              </h1>

              {/* Full-Width Supporting Description */}
              <p className="text-sm xs:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                Premium business printing, marketing materials and custom packaging — made to represent your brand.
              </p>

              {/* Primary & Secondary Action Buttons (Stacked on Small Mobile, Horizontal on Wider Screens) */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 pt-1 w-full max-w-md sm:max-w-none">
                <button
                  onClick={() => {
                    const el = document.getElementById('categories-showcase');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full xs:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm shadow-md hover:shadow-xl transition flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer min-h-[46px]"
                >
                  <span>Explore Our Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 w-full xs:w-auto">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="flex-1 xs:flex-none bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm border border-slate-300 shadow-sm hover:border-slate-400 transition flex items-center justify-center active:scale-[0.98] cursor-pointer min-h-[46px]"
                  >
                    <span>Contact Us</span>
                  </button>

                  <a
                    href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20am%20interested%20in%20getting%20a%20quotation%20for%20business%20printing."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-none px-3.5 py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center justify-center active:scale-[0.98] text-xs font-bold min-h-[46px]"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline ml-1.5">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Visual Column: Expanded Large Studio Product Photography Showcase */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center w-full pt-2 sm:pt-4 lg:pt-0">
              <div 
                className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center justify-center"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                {/* Ambient Studio Lighting Backdrop */}
                <div className="relative w-full aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] max-h-[300px] xs:max-h-[340px] sm:max-h-[400px] lg:max-h-[460px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-100/90 via-slate-50/60 to-white/90 border border-slate-200/70 p-3 sm:p-6 flex items-center justify-center shadow-sm overflow-hidden">
                  {/* Subtle ambient light pool */}
                  <div 
                    className={`absolute w-4/5 h-4/5 rounded-full bg-gradient-to-tr ${activeHero.circleBg} blur-2xl opacity-70 pointer-events-none transition-all duration-700`}
                  />

                  {/* 100% Transparent Isolated Studio Mockup - Large, crisp, prominent */}
                  <img
                    key={activeHero.id}
                    src={activeHero.image}
                    alt={activeHero.title}
                    className="relative z-10 w-full h-full object-contain transition-transform duration-500 hover:scale-[1.03] drop-shadow-[0_16px_28px_rgba(0,0,0,0.12)] select-none"
                  />

                  {/* Subtle Corner Badge: Product Classification */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-lg py-1 px-2.5 shadow-sm text-[10px] sm:text-xs font-bold text-slate-700 flex items-center space-x-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson"></span>
                    <span>{activeHero.badge}</span>
                  </div>
                </div>

                {/* Clean Caption & Slide Switcher Below Image */}
                <div className="w-full flex items-center justify-between px-1 pt-2.5 sm:pt-3 text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {activeHero.title}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-slate-500 text-[11px] sm:text-xs truncate hidden sm:inline font-medium">
                      {activeHero.tagline}
                    </span>
                  </div>

                  {/* Slide Dots */}
                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    {heroSlides.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCurrentHeroSlide(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          currentHeroSlide === idx
                            ? 'w-6 sm:w-7 h-2 bg-slate-900 shadow-sm'
                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-500'
                        }`}
                        aria-label={`Jump to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators: 3 Balanced Compact Cards (Full Width & Clean on All Viewports) */}
          <div className="w-full mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-200/80">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 text-center sm:text-left">
              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 transition hover:shadow-md">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 leading-tight">
                    Color Calibration
                  </h4>
                  <p className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                    Strict CMYK True-Color Standards
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 transition hover:shadow-md">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 leading-tight">
                    PAN India Shipping
                  </h4>
                  <p className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                    Moisture-Proof Secure Delivery
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 transition hover:shadow-md">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 leading-tight">
                    Free Soft Proofs
                  </h4>
                  <p className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                    Pre-Press Digital Verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE OUR PRINTING SOLUTIONS (Category Showcase Grid) */}
      <section id="categories-showcase" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-1.5 sm:space-y-2">
          <span className="text-[10px] sm:text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Commercial Printing Catalogue
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Our Printing Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Nine specialized printing divisions engineered with high-grade substrates, exact color fidelity, and tailored finishing options.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[350px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
          {showcaseCategories.map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate('category', card.targetCategory)}
              className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/80 cursor-pointer flex flex-col justify-between"
              title={`View ${card.title} Catalogue`}
            >
              {/* Large Studio Product Photograph */}
              <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm mb-2.5 sm:mb-4">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <span className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 bg-white/95 backdrop-blur-md text-slate-900 text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200/80 shadow-sm">
                  {card.badge}
                </span>
              </div>

              {/* Category Information */}
              <div className="space-y-1 sm:space-y-1.5 px-0.5 sm:px-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight group-hover:text-brand-crimson transition-colors duration-200 line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 mt-0.5 sm:mt-1 hidden xs:block">
                    {card.subtitle}
                  </p>
                </div>

                {/* Explore & Configure Action Row */}
                <div className="pt-2 sm:pt-4 mt-2 sm:mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-crimson transition-colors">
                  <span className="tracking-wide text-[10px] sm:text-xs">View Products</span>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-50 group-hover:bg-brand-crimson group-hover:text-white flex items-center justify-center transition-all duration-200 text-slate-500">
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COMMERCIAL PRODUCTS (Phase 5.3 - Real Products Grid) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Featured Collaterals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Commercial Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Selected high-volume business essentials engineered for executive presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[350px]:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {featuredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('product', item.slug)}
              className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group text-left"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-2.5 sm:mb-3.5 border border-slate-200/60 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 bg-slate-900/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-md shadow-sm">
                    MOQ: {item.minQty}
                  </span>
                </div>

                <span className="text-[9px] sm:text-[10px] font-bold text-brand-crimson uppercase tracking-wider block truncate">
                  {item.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-crimson transition mt-0.5 sm:mt-1">
                  {item.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed hidden xs:block">
                  {item.specs}
                </p>
              </div>

              <div className="pt-2 sm:pt-3.5 mt-2.5 sm:mt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-bold text-slate-800 group-hover:text-brand-crimson transition-colors">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block">Starting from</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-brand-crimson">
                    ₹{item.startingPrice ? item.startingPrice.toLocaleString('en-IN') : 'Quote'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-brand-crimson text-[10px] sm:text-xs font-bold self-end xs:self-auto">
                  <span>Configure</span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 group-hover:bg-brand-crimson group-hover:text-white flex items-center justify-center transition-all duration-200 text-slate-500">
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE PRINTIZER (Phase 5.4 - Genuine Business Standards) */}
      <section className="bg-slate-50 border-y border-slate-200 py-14 sm:py-20 text-left">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
              Our Commitment
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Choose PRINTIZER
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We engineer dependable commercial printing solutions with exacting standards, authentic paper grammages, and direct specialist support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* 01: Professional Printing */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">Professional Printing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rigorous 300 DPI CMYK color reproduction calibrated against official corporate identity standards.
              </p>
            </div>

            {/* 02: Quality Presentation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-brand-crimson flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quality Presentation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified substrate grammages (GSM), rigid SBS packaging boards, and precise structural die-cutting.
              </p>
            </div>

            {/* 03: Custom Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">Custom Printing Options</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thermal matte, velvet touch lamination, raised spot UV gloss, and metallic gold hot foil stamping.
              </p>
            </div>

            {/* 04: Attention to Detail */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">Attention to Detail</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complimentary digital soft proofs checked for 3mm bleeds, font curves, and typography resolution prior to print.
              </p>
            </div>

            {/* 05: Customer Support */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                05
              </div>
              <h3 className="text-sm font-bold text-slate-900">Customer Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct phone and WhatsApp consultation with seasoned print specialists from requirement to doorstep delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (Phase 5.5 - 4-Step Process) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Ordering Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A transparent four-step commercial workflow designed for businesses and institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-extrabold text-brand-crimson uppercase tracking-wider block">
              Step 01
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Choose Your Product</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse our nine commercial printing categories to locate the exact collateral your business needs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-extrabold text-brand-crimson uppercase tracking-wider block">
              Step 02
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Select Options or Share Artwork</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure paper grammages, dimensions, and finishes, or upload your CorelDRAW CDR / PDF vector artwork.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-extrabold text-brand-crimson uppercase tracking-wider block">
              Step 03
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Confirm Your Order</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review your itemized quotation and digital soft proof with our print specialists via WhatsApp or email.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-extrabold text-brand-crimson uppercase tracking-wider block">
              Step 04
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Receive Your Printed Product</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manufactured with strict quality inspection and safely delivered in protective packaging anywhere in India.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BESTSELLING COLLATERALS BANNER */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 p-6 sm:p-12 lg:p-14 space-y-4 text-left">
              <span className="text-[10px] font-bold tracking-widest text-rose-300 uppercase bg-white/10 px-3 py-1 rounded-full inline-block">
                Executive Stationery
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Discover Our Bestselling Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Engineered for corporate credibility: heavy board stocks, tactile velvet lamination, raised spot UV, and crisp hot foil stamping that make your brand memorable.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onRequestQuote({ productName: 'Bestselling Corporate Collaterals' })}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition flex items-center space-x-2 shadow-md"
                >
                  <span>Request Custom Quotation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 relative overflow-hidden">
              <img
                src="/images/bestselling-banner-mockup.jpg"
                alt="PRINTIZER Bestselling Corporate Collaterals"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden lg:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRINTING CAPABILITIES & FINISHING STANDARDS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Quality Assurance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Commercial Printing Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Specialized printing capabilities, premium paper engineering, and luxury tactile embellishments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {printingGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-wider block">
                  {guide.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {guide.snippet}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{guide.date}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('product', 'visiting-card')}
                  className="font-bold text-brand-crimson hover:underline flex items-center space-x-1"
                >
                  <span>Explore Specs &rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. BUSINESS CONTACT & CONSULTATION BANNER (Phase 5.6) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="rounded-3xl bg-slate-900 p-6 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-widest block">
                Direct Consultation
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Have a Custom Printing Requirement?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Connect directly with our print team. Send your quantities, custom dimensions, or vector artwork for an immediate itemized quotation.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: +91 98983 51920</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Email: Printizerdesign@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20have%20a%20custom%20commercial%20printing%20requirement.%20Please%20guide%20me."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full transition flex items-center justify-center space-x-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => onRequestQuote()}
                className="w-full sm:w-auto bg-brand-crimson hover:bg-brand-red text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full transition flex items-center justify-center space-x-2 shadow-md"
              >
                <span>Request Quotation</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
