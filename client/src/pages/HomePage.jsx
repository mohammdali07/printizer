import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ShieldCheck, CheckCircle2, Sparkles, 
  Layers, Package, Award, Clock, FileText, ChevronRight, Phone, 
  ArrowUpRight, Check, Printer, Truck, Palette, Mail, Send, CheckCircle, 
  ExternalLink, Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintConfigurator from '../components/PrintConfigurator.jsx';

export default function HomePage({ 
  categories = [], 
  products = [], 
  onNavigate, 
  onRequestQuote
}) {
  const [configuratorCategory, setConfiguratorCategory] = useState('visiting-card');
  const [configuratorHighlighted, setConfiguratorHighlighted] = useState(false);
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
      configuratorCat: 'business-stationery',
      targetCategory: 'business-stationery',
      badge: '15 Products'
    },
    {
      id: 'marketing-advertising',
      title: 'MARKETING & ADVERTISING',
      subtitle: 'Pamphlets, Flyers, Brochures, Posters, Standees & Banners',
      image: '/images/categories/marketing-advertising.webp',
      configuratorCat: 'marketing-advertising',
      targetCategory: 'marketing-advertising',
      badge: '12 Products'
    },
    {
      id: 'books-publications',
      title: 'BOOKS & PUBLICATIONS',
      subtitle: 'Notebooks, Diaries, Book Printing, Magazines & Thesis Binding',
      image: '/images/categories/books-publications.webp',
      configuratorCat: 'books-publications',
      targetCategory: 'books-publications',
      badge: '12 Products'
    },
    {
      id: 'wedding-invitation',
      title: 'WEDDING & INVITATION',
      subtitle: 'Royal Wedding Cards, Metallic Foil Invitations & Envelopes',
      image: '/images/categories/wedding-invitation.webp',
      configuratorCat: 'wedding-invitation',
      targetCategory: 'wedding-invitation',
      badge: '9 Products'
    },
    {
      id: 'packaging-printing',
      title: 'PACKAGING PRINTING',
      subtitle: 'Paper Bags, Shopping Bags, Product Boxes & Folding Cartons',
      image: '/images/categories/packaging-printing.webp',
      configuratorCat: 'packaging-printing',
      targetCategory: 'packaging-printing',
      badge: '11 Products'
    },
    {
      id: 'labels-stickers',
      title: 'LABELS & STICKERS',
      subtitle: 'Round, Square, Transparent & Waterproof Vinyl Stickers',
      image: '/images/categories/labels-stickers.webp',
      configuratorCat: 'labels-stickers',
      targetCategory: 'labels-stickers',
      badge: '9 Products'
    },
    {
      id: 'photo-digital-printing',
      title: 'PHOTO & DIGITAL PRINTING',
      subtitle: 'Ultra HD Photo Prints, Canvases, PVC Cards & Photo Frames',
      image: '/images/categories/photo-digital-printing.webp',
      configuratorCat: 'photo-digital-printing',
      targetCategory: 'photo-digital-printing',
      badge: '8 Products'
    },
    {
      id: 'school-educational-printing',
      title: 'SCHOOL & EDUCATIONAL',
      subtitle: 'School ID Cards, Marksheets, Certificates, Diaries & Prospectus',
      image: '/images/categories/school-educational-printing.webp',
      configuratorCat: 'school-educational-printing',
      targetCategory: 'school-educational-printing',
      badge: '10 Products'
    },
    {
      id: 'restaurant-hotel-printing',
      title: 'RESTAURANT & HOTEL',
      subtitle: 'Menu Cards, Food Packaging, Table Tents & Key Card Sleeves',
      image: '/images/categories/restaurant-hotel-printing.webp',
      configuratorCat: 'restaurant-hotel-printing',
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
      minQty: 1000
    },
    {
      id: 'product-box',
      slug: 'product-box',
      name: 'Custom Product Packaging Boxes',
      category: 'Packaging Printing',
      image: '/images/products/product-box.webp',
      specs: 'Rigid SBS Board / Structural Die-Line / Auto-Lock Base',
      minQty: 500
    },
    {
      id: 'letterhead',
      slug: 'letterhead',
      name: 'Corporate Letterheads',
      category: 'Business Stationery',
      image: '/images/products/letterhead.webp',
      specs: '100 GSM Executive Bond / Alabaster Superfine Stock',
      minQty: 500
    },
    {
      id: 'round-sticker',
      slug: 'round-sticker',
      name: 'Waterproof Die-Cut Stickers',
      category: 'Labels & Stickers',
      image: '/images/products/round-sticker.webp',
      specs: '100% Waterproof BOPP Vinyl / Precision Contour Kiss-Cut',
      minQty: 1000
    },
    {
      id: 'brochure',
      slug: 'brochure',
      name: 'Tri-Fold Marketing Brochures',
      category: 'Marketing & Advertising',
      image: '/images/products/brochure.webp',
      specs: '170 GSM Gloss Art / Precision Creasing & Multi-Panel Fold',
      minQty: 500
    }
  ];

  // Genuine Knowledge Articles on Prepress and Commercial Printing
  const printingGuides = [
    {
      id: 1,
      title: 'CorelDRAW CDR x7 & Vector Prepress Standards',
      category: 'Prepress Guidelines',
      snippet: 'Ensure all fonts are converted to curves (Ctrl+Q), RGB color palettes are calibrated to CMYK, and minimum 3mm bleed margins are preserved.',
      date: 'Commercial Standard'
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

  const handleCardClick = (card) => {
    setConfiguratorCategory(card.configuratorCat);
    setConfiguratorHighlighted(true);
    const configuratorEl = document.getElementById('configurator-section');
    if (configuratorEl) {
      configuratorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => setConfiguratorHighlighted(false), 2000);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#fafbfc]">
      {/* 1. HERO SECTION (Phase 5.2 - Premium International Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-[#fafbfc] pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-full py-1 px-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse"></span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  Commercial Printing & Bespoke Quotations
                </span>
              </div>

              {/* Exact Suggested Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Print Your Ideas. <br />
                <span className="text-slate-900">Make Your Brand </span>
                <span className="text-brand-crimson relative inline-block">
                  Stand Out.
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-brand-crimson/15 -z-10 rounded"></span>
                </span>
              </h1>

              {/* Exact Suggested Supporting Text */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Professional printing solutions with quality presentation and attention to detail. From luxury executive visiting cards to structural retail packaging and corporate marketing suites.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('categories-showcase');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:shadow-xl transition flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Explore Our Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Contact Us</span>
                </button>

                <a
                  href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20am%20interested%20in%20getting%20a%20quotation%20for%20business%20printing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 rounded-full text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xs active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Core Quality Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-[11px] sm:text-xs text-slate-600 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rigorous Color Calibration</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>PAN India Shipping</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Free Digital Soft Proofs</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column: Studio Product Photography with Ambient Lighting Disc */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
              <div 
                className="relative w-full max-w-lg lg:max-w-xl mx-auto flex items-center justify-center min-h-[380px] sm:min-h-[440px]"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                {/* Ambient Halo Pedestal */}
                <div 
                  className={`absolute w-72 h-72 sm:w-88 sm:h-88 md:w-[26rem] md:h-[26rem] lg:w-[28rem] lg:h-[28rem] rounded-full bg-gradient-to-tr ${activeHero.circleBg} border border-slate-200/60 shadow-2xl shadow-slate-300/40 transition-all duration-700 pointer-events-none transform -rotate-3`}
                />

                {/* Ground Contact Soft Shadow */}
                <div className="absolute bottom-8 w-64 sm:w-80 h-7 bg-slate-900/10 blur-xl rounded-full pointer-events-none" />

                {/* 100% Transparent Studio Mockup */}
                <div className="relative z-10 w-full flex items-center justify-center px-4 py-2">
                  <img
                    key={activeHero.id}
                    src={activeHero.image}
                    alt={activeHero.title}
                    className={`w-full max-h-[340px] sm:max-h-[400px] object-contain transition-all duration-500 transform ${activeHero.rotate} hover:scale-[1.02] drop-shadow-[0_20px_25px_rgba(0,0,0,0.14)] select-none`}
                  />
                </div>

                {/* Floating Feature Badge 1: Top Right */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-2 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl py-2 px-3.5 shadow-lg text-xs font-bold text-slate-800 flex items-center space-x-1.5 pointer-events-none animate-in fade-in slide-in-from-top-2">
                  <span>{activeHero.pill1}</span>
                </div>

                {/* Floating Feature Badge 2: Bottom Left */}
                <div className="absolute bottom-4 left-2 sm:bottom-6 sm:left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl py-2 px-3.5 shadow-lg text-xs font-bold text-slate-800 flex items-center space-x-1.5 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                  <span>{activeHero.pill2}</span>
                </div>

                {/* Carousel Pagination Dots */}
                <div className="absolute -bottom-6 sm:-bottom-8 flex items-center space-x-2 z-20">
                  {heroSlides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentHeroSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        currentHeroSlide === idx
                          ? 'w-8 h-2.5 bg-slate-900 shadow-sm'
                          : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-500'
                      }`}
                      aria-label={`Jump to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 9-CARD COMMERCIAL PRODUCT CATEGORY SHOWCASE (Phase 5.3) */}
      <section id="categories-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Commercial Printing Catalogue
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Commercial Printing Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Nine specialized printing divisions engineered with high-grade substrates, exact color fidelity, and tailored finishing options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {showcaseCategories.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group bg-white rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/90 cursor-pointer flex flex-col justify-between"
              title={`Click to configure ${card.title}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wider group-hover:text-brand-crimson transition">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {card.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full group-hover:bg-brand-crimson group-hover:text-white transition shrink-0">
                  {card.badge}
                </span>
              </div>

              <div className="my-5 relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 group-hover:bg-slate-100/70 transition">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-103 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-brand-crimson transition pt-3 border-t border-slate-100">
                <span className="text-[11px]">Explore & Configure</span>
                <ArrowRight className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COMMERCIAL PRODUCTS (Phase 5.3 - Real Products Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {featuredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('product', item.slug)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group text-left"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center p-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-103 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/85 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    MOQ: {item.minQty} units
                  </span>
                </div>

                <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-wider block">
                  {item.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-crimson transition mt-0.5">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.specs}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-brand-crimson">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE PRINTIZER (Phase 5.4 - Genuine Business Standards) */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 sm:py-20 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 space-y-4 text-left">
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
                  onClick={() => {
                    const el = document.getElementById('configurator-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition flex items-center space-x-2"
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

      {/* 7. INTERACTIVE COMMERCIAL ORDER & QUOTATION CONFIGURATOR */}
      <section id="configurator-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className={`transition-all duration-500 rounded-3xl ${
          configuratorHighlighted 
            ? 'ring-4 ring-brand-crimson ring-offset-4 shadow-2xl scale-[1.005]' 
            : ''
        }`}>
          <PrintConfigurator
            key={configuratorCategory}
            initialCategory={configuratorCategory}
            onOpenQuoteModal={onRequestQuote}
            onRequestCustomQuote={() => onRequestQuote({ productName: 'Visiting Cards' })}
          />
        </div>
      </section>

      {/* 8. PREPRESS KNOWLEDGE & PRINT SPECIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Prepress Knowledge
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Commercial Printing Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Technical prepress guidance to ensure your digital vector artwork prints with razor-sharp fidelity.
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
                  onClick={() => {
                    const el = document.getElementById('configurator-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="font-bold text-brand-crimson hover:underline flex items-center space-x-1"
                >
                  <span>Configure Now &rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. BUSINESS CONTACT & CONSULTATION BANNER (Phase 5.6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
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
