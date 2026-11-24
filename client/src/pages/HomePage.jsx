import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageCircle, ShieldCheck, CheckCircle2, Sparkles, 
  Layers, Package, Award, Clock, FileText, ChevronRight, Phone, Star, 
  ArrowUpRight, Check, Printer, Truck, Palette, Sparkle,
  Mail, Send, CheckCircle, ExternalLink, Bookmark, Search
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

  // Hero Carousel Slides (Printec Style with Isolated Transparent Mockups)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const heroSlides = [
    {
      id: 0,
      title: 'Commercial Catalogues & Booklets',
      tagline: 'Precision Bi-Fold & Multi-Page Binding',
      image: '/images/hero-catalogue-transparent.png',
      circleColor: 'bg-[#f5b318]',
      circleShadow: 'shadow-[#f5b318]/30',
      badge: 'Bespoke Catalogues',
      pill1: '✨ 300 DPI CMYK Gamut',
      pill2: '⚡ Fast 3-Day Turnaround',
      rotate: '-rotate-2 hover:rotate-0'
    },
    {
      id: 1,
      title: 'Executive Visiting Cards',
      tagline: '350 GSM Velvet Touch + Gold Foil Stamping',
      image: '/images/slides/cards.webp',
      circleColor: 'bg-[#e11d48]',
      circleShadow: 'shadow-[#e11d48]/30',
      badge: 'Corporate Standard',
      pill1: '💎 350 GSM Velvet Stock',
      pill2: '🌟 Raised Spot UV & Foil',
      rotate: 'rotate-2 hover:rotate-0'
    },
    {
      id: 2,
      title: 'Custom Product Packaging Boxes',
      tagline: 'Rigid SBS Board & Clean Auto-Lock Folding',
      image: '/images/slides/packaging.webp',
      circleColor: 'bg-[#059669]',
      circleShadow: 'shadow-[#059669]/30',
      badge: 'Luxury Packaging',
      pill1: '📦 Custom Die-Cut Sizing',
      pill2: '🌿 Food-Grade ITC Board',
      rotate: '-rotate-2 hover:rotate-0'
    },
    {
      id: 3,
      title: 'Corporate Business Stationery',
      tagline: 'Letterheads, Envelopes, Files & ID Systems',
      image: '/images/slides/stationery.webp',
      circleColor: 'bg-[#2563eb]',
      circleShadow: 'shadow-[#2563eb]/30',
      badge: 'Office Stationery',
      pill1: '📋 Executive Letterheads',
      pill2: '✉️ Custom Window Envelopes',
      rotate: 'rotate-2 hover:rotate-0'
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

  // 9 Commercial Showcase Categories matching user's exact categories list
  const showcaseCategories = [
    {
      id: 'business-stationery',
      title: 'BUSINESS STATIONERY',
      subtitle: 'Visiting Cards, Letterheads, Bill Books, Vouchers & ID Cards',
      image: '/images/categories/business-stationery.webp',
      configuratorCat: 'business-stationery',
      targetCategory: 'business-stationery',
      targetProduct: 'visiting-card',
      badge: '15 Products'
    },
    {
      id: 'marketing-advertising',
      title: 'MARKETING & ADVERTISING',
      subtitle: 'Pamphlets, Flyers, Brochures, Posters, Standees & Banners',
      image: '/images/categories/marketing-advertising.webp',
      configuratorCat: 'marketing-advertising',
      targetCategory: 'marketing-advertising',
      targetProduct: 'brochure',
      badge: '12 Products'
    },
    {
      id: 'books-publications',
      title: 'BOOKS & PUBLICATIONS',
      subtitle: 'Notebooks, Diaries, Book Printing, Magazines & Thesis',
      image: '/images/categories/books-publications.webp',
      configuratorCat: 'books-publications',
      targetCategory: 'books-publications',
      targetProduct: 'notebook',
      badge: '12 Products'
    },
    {
      id: 'wedding-invitation',
      title: 'WEDDING & INVITATION',
      subtitle: 'Royal Wedding Cards, Metallic Foil Invitations & Envelopes',
      image: '/images/categories/wedding-invitation.webp',
      configuratorCat: 'wedding-invitation',
      targetCategory: 'wedding-invitation',
      targetProduct: 'wedding-invitation-card',
      badge: '9 Products'
    },
    {
      id: 'packaging-printing',
      title: 'PACKAGING PRINTING',
      subtitle: 'Paper Bags, Shopping Bags, Product Boxes & Cake Boxes',
      image: '/images/categories/packaging-printing.webp',
      configuratorCat: 'packaging-printing',
      targetCategory: 'packaging-printing',
      targetProduct: 'paper-bag',
      badge: '11 Products'
    },
    {
      id: 'labels-stickers',
      title: 'LABELS & STICKERS',
      subtitle: 'Round, Square, Transparent & Waterproof Vinyl Stickers',
      image: '/images/categories/labels-stickers.webp',
      configuratorCat: 'labels-stickers',
      targetCategory: 'labels-stickers',
      targetProduct: 'round-sticker',
      badge: '9 Products'
    },
    {
      id: 'photo-digital-printing',
      title: 'PHOTO & DIGITAL PRINTING',
      subtitle: 'Photo Albums, Canvas Prints, Photo Frames & Custom Mugs',
      image: '/images/categories/photo-digital-printing.webp',
      configuratorCat: 'photo-digital-printing',
      targetCategory: 'photo-digital-printing',
      targetProduct: 'photo-printing',
      badge: '8 Products'
    },
    {
      id: 'school-educational-printing',
      title: 'SCHOOL & EDUCATIONAL PRINTING',
      subtitle: 'Student ID Cards, School Diaries, Marksheets & Certificates',
      image: '/images/categories/school-educational-printing.webp',
      configuratorCat: 'school-educational-printing',
      targetCategory: 'school-educational-printing',
      targetProduct: 'school-id-card',
      badge: '10 Products'
    },
    {
      id: 'restaurant-hotel-printing',
      title: 'RESTAURANT & HOTEL PRINTING',
      subtitle: 'Restaurant Menu Cards, Food Menus, Table Tents & Key Cards',
      image: '/images/categories/restaurant-hotel-printing.webp',
      configuratorCat: 'restaurant-hotel-printing',
      targetCategory: 'restaurant-hotel-printing',
      targetProduct: 'restaurant-menu-card',
      badge: '9 Products'
    }
  ];

  // 5 Top Selling Items from the newly created products
  const topSellingItems = [
    {
      id: 'top-visiting-cards',
      name: 'Visiting Cards (250g / 350g)',
      category: 'Business Stationery',
      price: '₹320.00 – ₹1,200.00',
      image: '/images/products/visiting-card.webp',
      sale: true,
      productSlug: 'visiting-card',
      minQty: 1000
    },
    {
      id: 'top-bill-book',
      name: 'Carbonless Bill Book / Invoice',
      category: 'Business Stationery',
      price: '₹55.00 – ₹85.00 / bk',
      image: '/images/products/bill-book.webp',
      sale: false,
      productSlug: 'bill-book',
      minQty: 10
    },
    {
      id: 'top-brochures',
      name: 'Tri-Fold Marketing Brochure',
      category: 'Marketing & Advertising',
      price: '₹8.50 – ₹14.00 / pc',
      image: '/images/products/brochure.webp',
      sale: true,
      productSlug: 'brochure',
      minQty: 500
    },
    {
      id: 'top-paper-bags',
      name: 'Luxury Branded Paper Bags',
      category: 'Packaging Printing',
      price: '₹18.00 – ₹35.00 / pc',
      image: '/images/products/paper-bag.webp',
      sale: false,
      productSlug: 'paper-bag',
      minQty: 500
    },
    {
      id: 'top-wedding-card',
      name: 'Royal Foil Wedding Invitation Card',
      category: 'Wedding & Invitation',
      price: '₹35.00 – ₹120.00 / pc',
      image: '/images/products/wedding-invitation-card.webp',
      sale: true,
      productSlug: 'wedding-invitation-card',
      minQty: 250
    }
  ];

  // 3 Blog / Prepress Knowledge Posts
  const blogPosts = [
    {
      id: 1,
      date: '06 Nov',
      category: 'Paper & Finishes',
      title: 'The Complete Guide to GSM & Paper Finishes: Gloss vs Thermal Matte vs Velvet',
      image: '/images/paper-finishes-guide.jpg',
      snippet: 'Discover the tactile difference between 250 GSM standard art cards and 400 GSM luxury boards with raised spot UV highlights.'
    },
    {
      id: 2,
      date: '06 Nov',
      category: 'Prepress Rules',
      title: 'CorelDRAW CDR x7 Setup: CMYK 300 DPI, Convert to Curves & 3mm Bleed',
      image: '/images/artwork-guidelines-box.jpg',
      snippet: 'Avoid costly re-prints by following our prepress artwork guidelines for razor-sharp typography and exact color fidelity.'
    },
    {
      id: 3,
      date: '06 Nov',
      category: 'Corporate Identity',
      title: 'Why Premium Visiting Cards Make or Break Your First Corporate Impression',
      image: '/images/categories/premium-visiting-card.webp',
      snippet: 'How founders, consultants, and enterprises leverage hot foil stamping and heavy card stocks to project authoritative credibility.'
    }
  ];

  const handleCardClick = (card) => {
    if (card.configuratorCat) {
      setConfiguratorCategory(card.configuratorCat);
      const el = document.getElementById('configurator-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setConfiguratorHighlighted(true);
        setTimeout(() => setConfiguratorHighlighted(false), 2200);
        return;
      }
    }
    onNavigate('product', card.targetProduct || card.id);
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
    <div className="space-y-12 sm:space-y-20 pb-16 bg-[#fafbfc]">
      {/* 1. HERO SECTION (Modeled directly after the Printec Reference Image) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f6f8] to-[#fafbfc] pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
              <div className="inline-block">
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-slate-500 uppercase">
                  PRINTING SERVICES & BESPOKE QUOTATIONS
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                The leader in <br />
                <span className="text-slate-900">quality custom </span>
                <span className="text-brand-crimson inline-block relative">
                  printing.
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-brand-crimson/15 -z-10 rounded"></span>
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Turn your ideas into premium commercial products that leave a lasting impression. From luxury visiting cards to retail packaging and large format exhibition displays — engineered with precision color reproduction and fast quotation turnaround.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('configurator-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 group active:scale-95"
                >
                  <span>Explore Products</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

                <a
                  href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20am%20interested%20in%20getting%20a%20quotation%20for%20business%20printing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 rounded-full text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-md shadow-emerald-700/20 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (+91 98983 51920)</span>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 sm:pt-6 border-t border-slate-200/80 text-[11px] sm:text-xs text-slate-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Quality Guarantee</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>PAN India Delivery</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Free Soft Proofs</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column: Floating Isolated Product Mockup Over Backdrop Circle (Printec Style) */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
              <div 
                className="relative w-full max-w-lg lg:max-w-xl mx-auto flex items-center justify-center min-h-[380px] sm:min-h-[440px]"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                {/* Large Warm Backdrop Circle with Smooth Color Transition */}
                <div 
                  className={`absolute w-72 h-72 sm:w-88 sm:h-88 md:w-[26rem] md:h-[26rem] lg:w-[28rem] lg:h-[28rem] rounded-full ${activeHero.circleColor} opacity-95 transition-all duration-700 shadow-2xl ${activeHero.circleShadow} -top-2 sm:-top-6 right-4 sm:right-8 pointer-events-none transform -rotate-3`}
                >
                  {/* Decorative vertical dots inside the circle (Printec reference detail) */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden sm:flex flex-col space-y-2.5 opacity-60">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="w-2 h-2 rounded-full bg-white/70"></span>
                    <span className="w-2 h-2 rounded-full bg-white/50"></span>
                    <span className="w-2 h-2 rounded-full bg-white/30"></span>
                    <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  </div>
                </div>

                {/* Floating Transparent Product Mockup (NO rectangular box or grey table!) */}
                <div className="relative z-10 w-full flex items-center justify-center px-4 py-2">
                  <img
                    key={activeHero.id}
                    src={activeHero.image}
                    alt={activeHero.title}
                    className={`w-full max-h-[340px] sm:max-h-[400px] object-contain transition-all duration-500 transform ${activeHero.rotate} hover:scale-[1.03] drop-shadow-[0_25px_30px_rgba(0,0,0,0.20)] select-none`}
                  />
                </div>

                {/* Floating Feature Badge 1: Top Right */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-2 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl py-2 px-3.5 shadow-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 pointer-events-none animate-in fade-in slide-in-from-top-2">
                  <span>{activeHero.pill1}</span>
                </div>

                {/* Floating Feature Badge 2: Bottom Left */}
                <div className="absolute bottom-4 left-2 sm:bottom-6 sm:left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl py-2 px-3.5 shadow-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                  <span>{activeHero.pill2}</span>
                </div>

                {/* Interactive Carousel Pagination Dots */}
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

      {/* 2. 9-CARD COMMERCIAL PRODUCT CATEGORY SHOWCASE (3x3 Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {showcaseCategories.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group bg-white rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-2 hover:border-brand-crimson/40 transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col justify-between"
              title={`Click to configure ${card.title}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-wider group-hover:text-brand-crimson transition">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {card.subtitle}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full group-hover:bg-brand-crimson group-hover:text-white transition shrink-0">
                  {card.badge}
                </span>
              </div>

              <div className="my-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 group-hover:bg-slate-100/60 transition">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-brand-crimson transition pt-1 border-t border-slate-50">
                <span className="text-[11px]">Explore & Quote</span>
                <ArrowRight className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 'LET'S GET PRINTING' - 4-STEP HORIZONTAL PROCESS BAR (Matching Reference Section 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-black text-brand-crimson uppercase tracking-widest block mb-1">
            LET'S GET PRINTING
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Reasons to get{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-brand-crimson bg-clip-text text-transparent">
              printing
            </span>{' '}
            started with us
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The dedicated commercial service for your printing needs. Everything you need, designed for your business.
          </p>
        </div>

        {/* 4 Connected Process Steps with Dotted Lines */}
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-0.5 border-t-2 border-dashed border-slate-200 -translate-y-8 z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">1. Select your items</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose from visiting cards, boxes, brochures, banners, stickers, or custom formats.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-brand-crimson flex items-center justify-center mb-4 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">2. Submit specs & files</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send your CorelDRAW CDR x7, PDF, or vector design with 3mm bleed margin.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">3. Approve digital proof</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our prepress experts check CMYK 300 DPI calibration and share a free digital soft proof.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">4. Doorstep Delivery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatched with secure moisture-proof packaging across all cities and business hubs in India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL DARK BANNER ("Discover our bestselling products" - Matching Reference Section 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Text */}
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 space-y-4 text-left">
              <span className="text-[10px] font-black tracking-widest text-brand-crimson uppercase bg-brand-crimson/10 border border-brand-crimson/30 px-3 py-1 rounded-full inline-block">
                TRUSTED PRINT PARTNER
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Discover our bestselling products
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Engineered for executive branding: heavy card stocks, tactile velvet lamination, raised spot UV, and crisp hot foil stamping that command attention.
              </p>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    const el = document.getElementById('configurator-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-transparent hover:bg-white hover:text-slate-900 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-white/60 transition flex items-center space-x-2"
                >
                  <span>Order yours now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Mockup Showcase Image */}
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

      {/* 5. TOP SELLING ITEMS ROW (Matching Reference Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-brand-crimson bg-clip-text text-transparent">
              Top Selling
            </span>{' '}
            Items
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Explore the most popular custom print solutions ordered by commercial businesses across India.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {topSellingItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('product', item.productSlug)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              {/* Product Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
                {item.sale && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    SALE
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-1 text-center">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-brand-crimson transition leading-tight">
                  {item.name}
                </h4>
                <p className="text-xs font-black text-slate-800 pt-0.5">
                  {item.price}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestQuote({ productName: item.name, productSlug: item.productSlug, quantity: item.minQty });
                }}
                className="mt-3 w-full bg-slate-900 group-hover:bg-brand-crimson text-white text-[11px] font-bold py-1.5 rounded-lg transition"
              >
                Request Quote
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE COMMERCIAL ORDER & QUOTATION CONFIGURATOR (Madhuram Reference) */}
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

      {/* 7. TESTIMONIAL & CLIENT TRUSTED LOGOS (Matching Reference Section 6) */}
      <section className="bg-slate-50/70 border-y border-slate-200/80 py-14 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Testimonial Quote */}
          <blockquote className="text-sm sm:text-lg lg:text-xl font-medium text-slate-700 leading-relaxed italic">
            &ldquo;With zero hassle, accurate CMYK color calibration, and rapid B2B quotation turnaround, PRINTIZER has helped thousands of businesses elevate their corporate brand with stunning print quality.&rdquo;
          </blockquote>

          {/* Trusted Brand Partner Logos Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="text-base sm:text-lg font-black tracking-widest text-slate-800">CREATIVE</span>
            <span className="text-base sm:text-lg font-black tracking-widest text-slate-800">TRIANGLE</span>
            <span className="text-base sm:text-lg font-black tracking-widest text-slate-800">NEXTOR</span>
            <span className="text-base sm:text-lg font-black tracking-widest text-slate-800">ALLTHEME</span>
            <span className="text-base sm:text-lg font-black tracking-widest text-slate-800">ALPHACORP</span>
          </div>
        </div>
      </section>

      {/* 8. LATEST BLOG POSTS & KNOWLEDGE HUB (Matching Reference Section 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-black text-brand-crimson uppercase tracking-widest block mb-1">
            PREPRESS & PRINT KNOWLEDGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Read our{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-brand-crimson bg-clip-text text-transparent">
              latest blog posts
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col group text-left"
            >
              {/* Blog Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                  {post.date}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-black text-brand-crimson uppercase tracking-wider block">
                    {post.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-crimson transition leading-snug mt-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {post.snippet}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-brand-crimson transition">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('configurator-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="hover:underline flex items-center space-x-1"
                  >
                    <span>Explore Products &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. NEWSLETTER & SPECIAL OFFERS BANNER (Matching Reference Section 8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-rose-400 via-purple-500 to-cyan-400 p-8 sm:p-12 lg:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-2 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Sign up for exclusive offers from us
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white/90 max-w-lg font-medium pl-1">
                Get seasonal commercial print discounts, volume tier announcements, and prepress CDR updates directly to your inbox.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-5">
              {newsletterSubscribed ? (
                <div className="bg-white/20 backdrop-blur-md rounded-full py-3.5 px-6 flex items-center justify-center space-x-2 text-white font-bold text-xs sm:text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Thank you! You are now subscribed to PRINTIZER updates.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="relative flex items-center">
                  <input
                    type="email"
                    required
                    placeholder="Enter your business email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-white text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm rounded-full py-3.5 pl-5 pr-28 focus:outline-none shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 rounded-full transition shadow-md active:scale-95"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
