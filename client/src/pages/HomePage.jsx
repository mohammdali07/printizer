import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, MessageCircle, ShieldCheck, CheckCircle2, Sparkles, 
  Layers, Package, Award, Clock, FileText, ChevronRight, ChevronLeft, ChevronDown, Phone, 
  ArrowUpRight, Check, Printer, Truck, Palette, Mail, Send, CheckCircle, 
  ExternalLink, Search, Star, ShoppingCart, Heart
} from 'lucide-react';
import ProductImage from '../components/ProductImage';
import InfiniteMobileSlider from '../components/InfiniteMobileSlider';
import ScrollReveal from '../components/ScrollReveal';

export default function HomePage({ 
  categories = [], 
  products = [], 
  promotions = null,
  settings = null,
  onNavigate, 
  onRequestQuote,
  onAddToCart
}) {

  // Hero Carousel Slides with 100% Transparent Isolated Mockups
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroDragX, setHeroDragX] = useState(0);
  const heroTouchStartXRef = useRef(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState({});

  const homeFaqs = [
    {
      q: 'What file formats do you accept for printing?',
      a: 'We accept print-ready PDF, CDR (CorelDRAW X7), AI, EPS, and high-resolution (300 DPI) PNG/JPG files in CMYK color mode with fonts converted to curves.'
    },
    {
      q: 'What is the minimum order quantity and how does bulk pricing work?',
      a: 'Minimum order quantities vary by product and custom specification—we offer flexible custom MOQs along with quantity-based price tiers, where higher volumes significantly lower the per-unit cost.'
    },
    {
      q: 'How long does production and PAN India delivery take?',
      a: 'Most standard orders are printed within 2 to 4 business days after file confirmation. Specialty finishes like raised spot UV, metallic foil, or custom die-cut boxes take 4 to 6 business days, followed by moisture-proof PAN India dispatch.'
    },
    {
      q: 'Can you help design or modify my artwork if I do not have a ready print file?',
      a: 'Yes! Share your logo, text, and rough idea on WhatsApp (+91 75749 27200) or through our quotation form. Our design team can prepare or format your print-ready layout before printing begins.'
    },
    {
      q: 'What paper stocks and luxury finishing options are available?',
      a: 'We offer 80–120 GSM executive bond, 130–250 GSM art paper, 350–500 GSM visiting card boards, non-tearable waterproof NT cards, and 320 GSM Ultima packaging boards—with matte/velvet lamination, raised spot UV, hot foil stamping, and custom die-cutting.'
    }
  ];

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
      image: '/images/slides/packaging-pro.webp',
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

  const getCategoryBadge = (catId, fallback) => {
    const count = products.filter(p => p.categoryId === catId).length;
    return count > 0 ? `${count} Products` : fallback;
  };

  // 10 Authentic Commercial Showcase Categories from user catalogue
  const showcaseCategories = [
    {
      id: 'business-stationery',
      title: 'Business Stationery',
      image: '/images/categories/business-stationery.webp',
      targetCategory: 'business-stationery'
    },
    {
      id: 'marketing-advertising',
      title: 'Marketing & Advertising',
      image: '/images/categories/marketing-advertising.webp',
      targetCategory: 'marketing-advertising'
    },
    {
      id: 'books-publications',
      title: 'Books & Publications',
      image: '/images/categories/books-publications.webp',
      targetCategory: 'books-publications'
    },
    {
      id: 'wedding-invitation',
      title: 'Wedding & Invitation',
      image: '/images/categories/wedding-invitation.webp',
      targetCategory: 'wedding-invitation'
    },
    {
      id: 'packaging-printing',
      title: 'Packaging Printing',
      image: '/images/categories/packaging-printing.webp',
      targetCategory: 'packaging-printing'
    },
    {
      id: 'labels-stickers',
      title: 'Labels & Stickers',
      image: '/images/categories/labels-stickers.webp',
      targetCategory: 'labels-stickers'
    },
    {
      id: 'photo-digital-printing',
      title: 'Photo & Digital Printing',
      image: '/images/categories/photo-digital-printing.webp',
      targetCategory: 'photo-digital-printing'
    },
    {
      id: 'school-educational-printing',
      title: 'School & Educational Printing',
      image: '/images/categories/school-educational-printing.webp',
      targetCategory: 'school-educational-printing'
    },
    {
      id: 'restaurant-hotel-printing',
      title: 'Restaurant & Hotel Printing',
      image: '/images/categories/restaurant-hotel-printing.webp',
      targetCategory: 'restaurant-hotel-printing'
    },
    {
      id: 'hospital-medical-printing',
      title: 'Hospital & Medical Printing',
      image: '/images/categories/hospital-medical-printing.webp',
      targetCategory: 'hospital-medical-printing'
    }
  ];

  const visibleShowcaseCategories = categories.length > 0
    ? showcaseCategories.filter((sc) => categories.some((c) => c.id === sc.id))
    : showcaseCategories;
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [isCategoryPaused, setIsCategoryPaused] = useState(false);
  const categoryCarouselRef = useRef(null);
  const mobileCategoryStripRef = useRef(null);
  const categoryScrollTimerRef = useRef(null);

  const [isProductsPaused, setIsProductsPaused] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const productsCarouselRef = useRef(null);
  const productsScrollTimerRef = useRef(null);

  // Curated "Our Products" Catalogue items
  const ourProductsList = [
    {
      id: 'nt-card',
      slug: 'visiting-card',
      title: 'NT CARD',
      subtitle: 'Non-Tearable Waterproof Card',
      image: '/images/products/nt-card-waterproof.jpg',
      category: 'Visiting Card'
    },
    {
      id: '350-gsm-matt',
      slug: 'visiting-card',
      title: '350 GSM MATT CARD',
      subtitle: 'Executive Satin Smooth Finish',
      image: '/images/products/350-gsm-matt-card.webp',
      category: 'Visiting Card'
    },
    {
      id: 'waterproof-stickers',
      slug: 'round-sticker',
      title: 'WATERPROOF STICKERS',
      subtitle: 'Die-Cut PVC & Metallic Labels',
      image: '/images/products/waterproof-sticker.webp',
      category: 'Labels & Stickers'
    },
    {
      id: 'corporate-letterhead',
      slug: 'letterhead',
      title: 'CORPORATE LETTERHEAD',
      subtitle: '100 GSM Bond & Alabaster Stock',
      image: '/images/products/letterhead.webp',
      category: 'Business Stationery'
    },
    {
      id: 'flyers-brochures',
      slug: 'brochure',
      title: 'FLYERS & BROCHURES',
      subtitle: '130/170 GSM Art Paper Multi-Fold',
      image: '/images/products/brochure.webp',
      category: 'Marketing'
    },
    {
      id: 'packaging-boxes',
      slug: 'product-box',
      title: 'PACKAGING BOXES',
      subtitle: '320 GSM Ultima Board & Drip-Off UV',
      image: '/images/products/product-box.webp',
      category: 'Packaging'
    },
    {
      id: 'gold-foil-cards',
      slug: 'visiting-card',
      title: 'GOLD FOIL CARDS',
      subtitle: 'Metallic Hot Foil Stamping',
      image: '/images/products/gold-foil.webp',
      category: 'Visiting Card'
    },
    {
      id: 'cash-memo-books',
      slug: 'cash-memo-book',
      title: 'CASH MEMO BOOKS',
      subtitle: 'Carbonless NCR Duplicate / Triplicate',
      image: '/images/products/cash-memo-book.webp',
      category: 'Business Stationery'
    },
    {
      id: 'bill-books-ncr',
      slug: 'bill-book',
      title: 'BILL BOOKS (NCR)',
      subtitle: 'Duplicate & Triplicate Invoice Books',
      image: '/images/products/bill-book.webp',
      category: 'Business Stationery'
    },
    {
      id: '500-gsm-velvet-uv',
      slug: '500-gsm-matt-card-uv',
      title: '500 GSM VELVET UV',
      subtitle: 'Ultra Heavyweight Raised Spot UV',
      image: '/images/products/500-gsm-matt-card-uv.webp',
      category: 'Visiting Card'
    },
    {
      id: 'custom-envelopes',
      slug: 'envelope',
      title: 'BRANDED ENVELOPES',
      subtitle: 'Custom Window & Peel-Seal Envelopes',
      image: '/images/products/envelope.webp',
      category: 'Business Stationery'
    },
    {
      id: 'product-catalogues',
      slug: 'catalogue',
      title: 'PRODUCT CATALOGUES',
      subtitle: 'Multi-Page Art Paper Catalogues',
      image: '/images/products/catalogue.webp',
      category: 'Marketing'
    }
  ];

  // Triple-cloned arrays for seamless infinite looping (no first/last stop)
  const loopedCategories = [...showcaseCategories, ...showcaseCategories, ...showcaseCategories];
  const loopedProducts = [...ourProductsList, ...ourProductsList, ...ourProductsList];

  const getCarouselStep = (container, selector) => {
    const card = container.querySelector(selector);
    const cardWidth = card ? card.offsetWidth : 280;
    const style = window.getComputedStyle(container);
    const gap = parseFloat(style.columnGap || style.gap) || 14;
    return cardWidth + gap;
  };

  const instantScrollLeft = (container, left) => {
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = left;
    container.style.scrollBehavior = '';
  };

  const stepInfiniteCarousel = (ref, selector, itemCount, direction) => {
    const container = ref.current;
    if (!container) return;
    const step = getCarouselStep(container, selector);
    const oneSetWidth = step * itemCount;

    if (direction === 'next' && container.scrollLeft >= oneSetWidth * 2 - container.clientWidth - step) {
      instantScrollLeft(container, container.scrollLeft - oneSetWidth);
    } else if (direction === 'prev' && container.scrollLeft <= oneSetWidth * 0.5 + step) {
      instantScrollLeft(container, container.scrollLeft + oneSetWidth);
    }

    container.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
  };

  const handleInfiniteScroll = (ref, selector, itemCount, setIndex, timerRef) => {
    const container = ref.current;
    if (!container) return;
    const step = getCarouselStep(container, selector);
    const oneSetWidth = step * itemCount;
    const idx = ((Math.round(container.scrollLeft / step) % itemCount) + itemCount) % itemCount;
    setIndex(idx);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!ref.current) return;
      if (container.scrollLeft < oneSetWidth * 0.45) {
        instantScrollLeft(container, container.scrollLeft + oneSetWidth);
      } else if (container.scrollLeft >= oneSetWidth * 1.95) {
        instantScrollLeft(container, container.scrollLeft - oneSetWidth);
      }
    }, 180);
  };

  const jumpInfiniteCarousel = (ref, selector, itemCount, idx, setIndex) => {
    const container = ref.current;
    if (!container) return;
    const step = getCarouselStep(container, selector);
    const oneSetWidth = step * itemCount;
    container.scrollTo({ left: oneSetWidth + idx * step, behavior: 'smooth' });
    setIndex(idx);
  };

  // Manual scroll only (no auto-scroll for categories or products)

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

  // Verified Client Reviews with Delivered Print Showcases
  const customerReviews = [
    {
      id: 'ahle-interior-studio',
      client: 'Ahlé Interior Studio',
      role: 'Architecture & Interior Design',
      product: '350 GSM Velvet + Gold Foil Visiting Cards',
      slug: 'visiting-card',
      image: '/images/reviews/ahle-interior-studio.jpg',
      quote: 'The velvet lamination and metallic gold foil stamping gave our studio cards an unmistakable luxury feel. Color accuracy and sharp cutting were spot on.'
    },
    {
      id: 'manzil-travels',
      client: 'Manzil Travels',
      role: 'Tours, Travels & Car Rentals',
      product: '170 GSM Art Paper Tri-Fold Brochures',
      slug: 'brochure',
      image: '/images/reviews/manzil-travels.jpg',
      quote: 'We print our tour package brochures, itineraries, and travel collaterals regularly with PRINTIZER. Consistent CMYK color calibration, crisp creasing, and reliable on-time delivery.'
    },
    {
      id: 'izel',
      client: 'Izel',
      role: 'Food & Purity Brand',
      product: '500 GSM Velvet + Raised Spot UV Cards',
      slug: 'visiting-card',
      image: '/images/reviews/izel.jpg',
      quote: 'Heavyweight 500 GSM cards with raised spot UV made our brand stand out immediately in client meetings. Great support from order to final dispatch.'
    }
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const activePromoBanners = Array.isArray(promotions?.banners)
    ? promotions.banners.filter((b) => {
        if (b.active === false) return false;
        if (b.startDate && todayStr < b.startDate) return false;
        if (b.endDate && todayStr > b.endDate) return false;
        return Boolean(b.title || b.imageUrl);
      })
    : [];

  return (
    <div className="space-y-10 sm:space-y-20 lg:space-y-24 pb-20 bg-[#fafbfc]">
      {/* Admin-Controlled Announcement Bar */}
      {promotions?.announcementBar?.enabled && promotions?.announcementBar?.text && (
        <div
          className="text-white text-center text-xs sm:text-sm font-semibold py-2 px-4"
          style={{ backgroundColor: promotions.announcementBar.bgColor || '#be123c' }}
        >
          {promotions.announcementBar.text}
        </div>
      )}

      {/* Admin-Controlled Active Promotional Banners */}
      {activePromoBanners.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-4 -mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activePromoBanners.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  {b.discountBadge && (
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-brand-crimson border border-rose-200 mb-1">
                      {b.discountBadge}
                    </span>
                  )}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{b.title}</h3>
                  {b.subtitle && <p className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</p>}
                </div>
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. HERO SECTION (Expanded Full-Width Mobile-First Showcase) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-[#fafbfc] pt-4 pb-8 xs:pt-6 xs:pb-10 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              {/* Small Professional Eyebrow Label */}
              <div className="inline-flex items-center space-x-2 bg-white border border-slate-200/90 rounded-full py-1 px-3.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson animate-pulse"></span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] text-slate-700 uppercase">
                  Professional Printing Solutions
                </span>
              </div>

              {/* Expanded Editorial Headline */}
              <h1 className="font-display text-[29px] min-[360px]:text-[33px] xs:text-[38px] sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold tracking-[-0.03em] text-slate-950 leading-[1.08]">
                Make Every Print <br />
                <span className="bg-gradient-to-r from-brand-crimson via-rose-600 to-brand-red bg-clip-text text-transparent">
                  Stand Out.
                </span>
              </h1>

              {/* Full-Width Supporting Description */}
              <p className="text-sm xs:text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                Premium business printing, marketing materials and custom packaging — made to represent your brand.
              </p>

              {/* Primary & Secondary Action Buttons (Stacked on Small Mobile, Horizontal on Wider Screens) */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 pt-1 w-full max-w-md sm:max-w-none">
                <button
                  onClick={() => onNavigate('categories')}
                  className="w-full xs:w-auto bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm shadow-lg shadow-slate-900/15 hover:shadow-xl transition flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer min-h-[46px]"
                >
                  <span>Explore Our Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://wa.me/917574927200?text=Hello%20PRINTIZER%2C%20I%20am%20interested%20in%20getting%20a%20quotation%20for%20business%20printing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full xs:w-auto px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center justify-center active:scale-[0.98] text-xs sm:text-sm font-bold min-h-[46px]"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="ml-1.5">WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Visual Column: Expanded Large Studio Product Photography Showcase */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center w-full pt-2 sm:pt-4 lg:pt-0">
              <div 
                className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center justify-center"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                {/* Ambient Studio Lighting Backdrop - Thumb Swipe Enabled */}
                <div
                  onTouchStart={(e) => {
                    setHeroPaused(true);
                    heroTouchStartXRef.current = e.touches[0].clientX;
                    setHeroDragX(0);
                  }}
                  onTouchMove={(e) => {
                    if (heroTouchStartXRef.current === null) return;
                    const delta = e.touches[0].clientX - heroTouchStartXRef.current;
                    setHeroDragX(Math.max(-90, Math.min(90, delta)));
                  }}
                  onTouchEnd={(e) => {
                    const startX = heroTouchStartXRef.current;
                    if (startX !== null) {
                      const diff = startX - e.changedTouches[0].clientX;
                      if (diff > 35) {
                        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
                      } else if (diff < -35) {
                        setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                      }
                    }
                    heroTouchStartXRef.current = null;
                    setHeroDragX(0);
                    setTimeout(() => setHeroPaused(false), 2500);
                  }}
                  className={`relative w-full aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] max-h-[300px] xs:max-h-[340px] sm:max-h-[400px] lg:max-h-[460px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-100/90 via-slate-50/60 to-white/90 border border-slate-200/70 ${activeHero.fullBleed ? 'p-0' : 'p-3 sm:p-6'} flex items-center justify-center shadow-sm overflow-hidden touch-pan-y select-none`}
                >
                  {/* Subtle ambient light pool */}
                  {!activeHero.fullBleed && (
                    <div 
                      className={`absolute w-4/5 h-4/5 rounded-full bg-gradient-to-tr ${activeHero.circleBg} blur-2xl opacity-70 pointer-events-none transition-all duration-700`}
                    />
                  )}

                  {/* Studio Product Showcase - Animated Crossfade + Thumb Swipe */}
                  {heroSlides.map((slide, idx) => {
                    const isActive = idx === currentHeroSlide;
                    return (
                      <div
                        key={slide.id}
                        style={isActive && heroDragX !== 0 ? { transform: `translateX(${heroDragX}px)` } : undefined}
                        className={`absolute inset-0 p-3 sm:p-6 flex items-center justify-center ${
                          heroDragX !== 0 ? 'transition-none' : 'transition-all duration-700 ease-out'
                        } ${
                          isActive
                            ? 'opacity-100 scale-100 translate-y-0 z-10'
                            : 'opacity-0 scale-95 translate-y-2 pointer-events-none z-0'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          draggable={false}
                          className={`w-full h-full transition-transform duration-500 hover:scale-[1.03] select-none ${
                            slide.fullBleed
                              ? 'object-cover'
                              : 'object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.12)]'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Slide Switcher Dots */}
                <div className="flex items-center justify-center space-x-1.5 pt-3">
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
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] xs:text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 leading-tight">
                    24 Hours Service
                  </h4>
                  <p className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                    Round-the-Clock Print Support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE ALL CATEGORIES (Horizontal Strip on Desktop + 3-Up Strip with Dots on Mobile) */}
      <ScrollReveal>
      <section id="categories-showcase" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 scroll-mt-20 text-left">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Explore all categories
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className="text-xs font-bold text-slate-600 hover:text-brand-crimson flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile: 3-Up Horizontal Swipe Strip + Small Scroll Buttons + Pagination Dots */}
        <div className="block sm:hidden relative">
          <button
            type="button"
            onClick={() => {
              const el = mobileCategoryStripRef.current;
              if (el) el.scrollBy({ left: -el.clientWidth * 0.85, behavior: 'smooth' });
            }}
            aria-label="Scroll Categories Left"
            className="absolute -left-1.5 top-[38%] -translate-y-1/2 z-20 w-7 h-7 rounded-full border border-slate-200 bg-white/95 backdrop-blur-xs text-slate-800 shadow-md flex items-center justify-center cursor-pointer active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = mobileCategoryStripRef.current;
              if (el) el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
            }}
            aria-label="Scroll Categories Right"
            className="absolute -right-1.5 top-[38%] -translate-y-1/2 z-20 w-7 h-7 rounded-full border border-slate-200 bg-white/95 backdrop-blur-xs text-slate-800 shadow-md flex items-center justify-center cursor-pointer active:scale-90"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div
            ref={mobileCategoryStripRef}
            onScroll={() => {
              const el = mobileCategoryStripRef.current;
              if (!el) return;
              const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
              const pageCount = Math.ceil(showcaseCategories.length / 2);
              const nextDot = Math.min(pageCount - 1, Math.round((el.scrollLeft / maxScroll) * (pageCount - 1)));
              setActiveCatIndex(nextDot);
            }}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {visibleShowcaseCategories.map((card) => (
              <div
                key={card.id}
                onClick={() => onNavigate('category', card.targetCategory)}
                className="w-[calc((100%-12px)/2)] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs active:scale-[0.98] transition cursor-pointer flex flex-col"
              >
                <div className="aspect-square w-full bg-[#f5f3ee] overflow-hidden">
                  <ProductImage
                    src={card.image}
                    alt={card.title}
                    placeholderLabel={card.title}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1 flex items-start">
                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-2 pt-3">
            {Array.from({ length: Math.ceil(visibleShowcaseCategories.length / 2) }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const el = mobileCategoryStripRef.current;
                  if (!el) return;
                  const pageCount = Math.ceil(visibleShowcaseCategories.length / 2);
                  const maxScroll = el.scrollWidth - el.clientWidth;
                  el.scrollTo({ left: (maxScroll / Math.max(1, pageCount - 1)) * idx, behavior: 'smooth' });
                  setActiveCatIndex(idx);
                }}
                aria-label={`Category page ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeCatIndex === idx
                    ? 'w-5 h-2 bg-slate-800'
                    : 'w-2 h-2 border border-slate-400 bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Clean Horizontal Scrollable Strip (5 Full Cards on Laptop) */}
        <div className="hidden sm:block relative">
          <button
            type="button"
            onClick={() => {
              const el = categoryCarouselRef.current;
              if (el) el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
            }}
            aria-label="Scroll Categories Left"
            className="absolute -left-3 top-[42%] -translate-y-1/2 z-20 w-9 h-9 rounded-lg border border-slate-200 bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = categoryCarouselRef.current;
              if (el) el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
            }}
            aria-label="Scroll Categories Right"
            className="absolute -right-3 top-[42%] -translate-y-1/2 z-20 w-9 h-9 rounded-lg border border-slate-200 bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={categoryCarouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth py-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {visibleShowcaseCategories.map((card) => (
              <div
                key={card.id}
                onClick={() => onNavigate('category', card.targetCategory)}
                className="group w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col"
                title={`View ${card.title}`}
              >
                <div className="aspect-square w-full bg-[#f5f3ee] overflow-hidden">
                  <ProductImage
                    src={card.image}
                    alt={card.title}
                    placeholderLabel={card.title}
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="p-3 flex-1 flex items-start">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-brand-crimson transition-colors leading-snug line-clamp-2">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* 3. OUR PRODUCTS (2-Column Mobile / 5-Column Desktop Grid — Top 10 Products) */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Our Products
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className="text-xs font-bold text-slate-600 hover:text-brand-crimson flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {ourProductsList.slice(0, 10).map((item) => {
            const isLiked = Boolean(likedProducts[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => onNavigate('configure', item.slug)}
                className="group cursor-pointer flex flex-col text-left"
              >
                {/* Rounded Square Product Photo + Wishlist Heart */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs mb-2.5">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    placeholderLabel={item.title}
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLikedProducts((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-sm border border-slate-200/70 flex items-center justify-center transition active:scale-90 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isLiked ? 'fill-brand-crimson text-brand-crimson' : 'text-slate-700'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Title */}
                <div className="px-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-crimson transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* 3B. NEW ARRIVALS (5-Column Desktop / 2-Column Mobile Grid with Top-Left Pill Badge) */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
            New arrivals
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('new-arrivals')}
            className="text-xs font-bold text-slate-600 hover:text-brand-crimson flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {[
            {
              id: 'new-velvet-uv',
              title: '500 GSM Velvet UV Cards',
              badge: 'TRENDING',
              image: '/images/products/500-gsm-matt-card-uv.webp',
              slug: '500-gsm-matt-card-uv'
            },
            {
              id: 'new-cash-memo',
              title: 'Carbonless Cash Memo Books',
              badge: 'NEW ARRIVAL',
              image: '/images/products/cash-memo-book.webp',
              slug: 'cash-memo-book'
            },
            {
              id: 'new-ultima-box',
              title: '320 GSM Ultima UV Boxes',
              badge: 'NEW ARRIVAL',
              image: '/images/products/320-gsm-ultima-uv-lamination.webp',
              slug: '320-gsm-ultima-uv-lamination'
            },
            {
              id: 'new-waterproof-sticker',
              title: 'Waterproof Vinyl Stickers',
              badge: 'NEW ARRIVAL',
              image: '/images/products/waterproof-sticker.webp',
              slug: 'waterproof-sticker'
            },
            {
              id: 'new-nt-card',
              title: 'Non-Tearable NT Cards',
              badge: 'POPULAR',
              image: '/images/products/nt-card-waterproof.jpg',
              slug: 'nt-card'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('configure', item.slug)}
              className="group cursor-pointer flex flex-col text-left"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-2xs mb-2.5">
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
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-crimson transition-colors leading-snug line-clamp-2 px-0.5">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {[
              {
                num: '01',
                title: 'Professional Printing',
                desc: 'Rigorous 300 DPI CMYK color reproduction calibrated against official corporate identity standards.',
                tone: 'bg-slate-100 text-slate-900'
              },
              {
                num: '02',
                title: 'Quality Presentation',
                desc: 'Verified substrate grammages (GSM), rigid SBS packaging boards, and precise structural die-cutting.',
                tone: 'bg-rose-50 text-brand-crimson'
              },
              {
                num: '03',
                title: 'Custom Printing Options',
                desc: 'Thermal matte, velvet touch lamination, raised spot UV gloss, and metallic gold hot foil stamping.',
                tone: 'bg-amber-50 text-amber-700'
              },
              {
                num: '04',
                title: 'Attention to Detail',
                desc: 'Checked for 3mm bleeds, font curves, and typography resolution prior to print.',
                tone: 'bg-blue-50 text-blue-600'
              },
              {
                num: '05',
                title: 'Customer Support',
                desc: 'Direct phone and WhatsApp consultation with seasoned print specialists from requirement to delivery.',
                tone: 'bg-emerald-50 text-emerald-600'
              }
            ].map((step, idx) => (
              <ScrollReveal key={step.num} delay={idx * 90} className="h-full">
                <div className="bg-white p-3.5 sm:p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-row md:flex-col items-start gap-3 md:gap-3 h-full">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${step.tone}`}>
                    {step.num}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS (Delivered Visiting Cards & Brochures Showcase) */}
      <ScrollReveal>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Client Reviews
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Creative &amp; Commercial Brands
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real feedback from studios, agencies, and businesses printing their visiting cards and brochures with PRINTIZER.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {customerReviews.map((review) => (
            <div
              key={review.id}
              onClick={() => onNavigate('configure', review.slug)}
              className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Delivered Product Photo */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 mb-4">
                  <ProductImage
                    src={review.image}
                    alt={`${review.client} - ${review.product}`}
                    placeholderLabel={review.client}
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] font-bold text-slate-400 ml-1.5">5.0 Verified Order</span>
                </div>

                {/* Review Quote */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Client Identity & Product Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-crimson transition-colors truncate">
                    {review.client}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 truncate">
                    {review.product}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-brand-crimson group-hover:text-white flex items-center justify-center transition-colors text-slate-500 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* 6. BESTSELLING COLLATERALS BANNER */}
      <ScrollReveal>
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
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden lg:block"></div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* 7. PRINTING CAPABILITIES & FINISHING STANDARDS */}
      <ScrollReveal>
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
      </ScrollReveal>

      {/* 8. FREQUENTLY ASKED QUESTIONS (5 Essential Printing FAQs) */}
      <ScrollReveal>
      <section className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest block">
            Quick Answers
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about artwork preparation, minimum quantities, finishes, and PAN India delivery.
          </p>
        </div>

        <div className="space-y-3">
          {homeFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-200 ${
                  isOpen ? 'border-slate-300 shadow-sm' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen ? 'bg-brand-crimson text-white rotate-180' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 sm:px-6 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-0 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* 9. BUSINESS CONTACT & CONSULTATION BANNER (Phase 5.6) */}
      <ScrollReveal>
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
                  <span>WhatsApp: +91 75749 27200</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Email: printizerdesign@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://wa.me/917574927200?text=Hello%20PRINTIZER%2C%20I%20have%20a%20custom%20commercial%20printing%20requirement.%20Please%20guide%20me."
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
      </ScrollReveal>
    </div>
  );
}
