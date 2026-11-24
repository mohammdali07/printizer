import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, MessageCircle, ArrowRight, 
  Sparkles, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function PrintConfigurator({ 
  onOpenQuoteModal, 
  onRequestCustomQuote,
  initialCategory = 'business-stationery'
}) {
  const [category, setCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState('visiting-card');
  const [printingSides, setPrintingSides] = useState('both-sides');
  const [foil, setFoil] = useState('none');
  const [spotUv, setSpotUv] = useState('none');
  const [quantity, setQuantity] = useState('1000');
  const [jobName, setJobName] = useState('');

  // Category & Product definitions matching user's exact 9 categories and products
  const categoryProductsMap = {
    'business-stationery': [
      { slug: 'visiting-card', name: 'Visiting Card', baseRate: 0.35, minQty: 1000, gsm: '350 GSM Velvet Board', lamination: 'Thermal Matte / Gloss' },
      { slug: 'letterhead', name: 'Letterhead', baseRate: 2.2, minQty: 500, gsm: '100 GSM Alabaster Bond', lamination: 'Clean Cut Precision' },
      { slug: 'bill-book', name: 'Bill Book', baseRate: 65, minQty: 10, gsm: '1+1 NCR Carbonless Duplicate', lamination: 'Perforated & Numbered Binding' },
      { slug: 'cash-memo-book', name: 'Cash Memo Book', baseRate: 55, minQty: 10, gsm: '1+1 Carbonless Duplicate', lamination: 'Bound with Counterfoil' },
      { slug: 'receipt-book', name: 'Receipt Book', baseRate: 50, minQty: 10, gsm: 'Carbonless Duplicate', lamination: 'Perforated Slips' },
      { slug: 'quotation-book', name: 'Quotation Book', baseRate: 75, minQty: 10, gsm: '1+1 NCR Carbonless', lamination: 'Cloth Spine Bound' },
      { slug: 'invoice-book', name: 'Invoice Book', baseRate: 85, minQty: 10, gsm: '1+2 Triplicate NCR', lamination: 'GST Sequential Numbering' },
      { slug: 'delivery-challan-book', name: 'Delivery Challan Book', baseRate: 70, minQty: 10, gsm: '1+2 Triplicate NCR', lamination: 'Perforated Sheets' },
      { slug: 'purchase-order-book', name: 'Purchase Order Book', baseRate: 80, minQty: 10, gsm: '1+2 Triplicate NCR', lamination: 'Hardboard Bound' },
      { slug: 'payment-voucher', name: 'Payment Voucher', baseRate: 40, minQty: 20, gsm: '70 GSM Bond Paper', lamination: 'Padded Tear-off' },
      { slug: 'envelope', name: 'Envelope', baseRate: 3.5, minQty: 500, gsm: '100 GSM Maplitho / 120 GSM Bond', lamination: 'Peel & Seal Strip' },
      { slug: 'office-file', name: 'Office File', baseRate: 28, minQty: 100, gsm: '350 GSM Cyber Board', lamination: 'Gloss Lamination + Clip' },
      { slug: 'folder', name: 'Folder', baseRate: 18, minQty: 250, gsm: '350 GSM SBS Board', lamination: 'Matte Lamination + Pocket' },
      { slug: 'id-card', name: 'ID Card', baseRate: 35, minQty: 50, gsm: '760 Micron Rigid PVC', lamination: 'Thermal Encapsulation' },
      { slug: 'employee-id-card', name: 'Employee ID Card', baseRate: 45, minQty: 50, gsm: 'Smart Chip / PVC Plastic', lamination: 'Double Sided Photo Quality' }
    ],
    'marketing-advertising': [
      { slug: 'brochure', name: 'Brochure', baseRate: 8.5, minQty: 500, gsm: '170 GSM Art Paper', lamination: 'Precision Bi-Fold / Tri-Fold' },
      { slug: 'flyer', name: 'Flyer', baseRate: 3.2, minQty: 1000, gsm: '130 GSM Gloss Art', lamination: 'Vibrant Full Color' },
      { slug: 'pamphlet', name: 'Pamphlet', baseRate: 2.8, minQty: 1000, gsm: '130 GSM Art Paper', lamination: 'Single / Both Sided' },
      { slug: 'poster', name: 'Poster', baseRate: 22, minQty: 100, gsm: '250 GSM High Gloss Card', lamination: 'UV Gloss Coating' },
      { slug: 'catalogue', name: 'Catalogue', baseRate: 45, minQty: 200, gsm: 'Cover 300 GSM + Inner 130 GSM', lamination: 'Matte Cover + Saddle Stitch' },
      { slug: 'leaflet', name: 'Leaflet', baseRate: 2.5, minQty: 1000, gsm: '100 GSM Maplitho', lamination: 'High Speed Press' },
      { slug: 'danglers', name: 'Danglers', baseRate: 14, minQty: 200, gsm: '350 GSM Heavy Board', lamination: 'Die-Cut + Eyelet String' },
      { slug: 'standee', name: 'Standee', baseRate: 1250, minQty: 2, gsm: '280 GSM Non-Tear Polyroll', lamination: 'Aluminum Roll-Up Stand' },
      { slug: 'banner', name: 'Banner', baseRate: 450, minQty: 1, gsm: '340 GSM Heavy Flex', lamination: 'Corner Brass Eyelets' },
      { slug: 'flex-printing', name: 'Flex Printing', baseRate: 380, minQty: 1, gsm: 'Star Frontlit Flex', lamination: 'Weatherproof Inks' },
      { slug: 'sunboard-printing', name: 'Sunboard Printing', baseRate: 220, minQty: 5, gsm: '3mm / 5mm PVC Foam Board', lamination: 'UV Flatbed Print' },
      { slug: 'promotional-cards', name: 'Promotional Cards', baseRate: 4.5, minQty: 500, gsm: '300 GSM Art Card', lamination: 'Spot UV Accent' }
    ],
    'books-publications': [
      { slug: 'notebook', name: 'Notebook', baseRate: 48, minQty: 200, gsm: '350 GSM Cover + 80 GSM Inner', lamination: 'Spiral Wire-O Bound' },
      { slug: 'pub-school-diary', name: 'School Diary', baseRate: 65, minQty: 300, gsm: 'Hardbound Strawboard', lamination: 'Gold Foil Crest' },
      { slug: 'office-diary', name: 'Office Diary', baseRate: 180, minQty: 100, gsm: 'PU Leatherette Hardcover', lamination: 'Debossed Logo + Ribbon' },
      { slug: 'exercise-book', name: 'Exercise Book', baseRate: 28, minQty: 500, gsm: '170 GSM Cover + 58 GSM Inner', lamination: 'Saddle Stitched Spine' },
      { slug: 'book-printing', name: 'Book Printing', baseRate: 95, minQty: 100, gsm: '80 GSM Book Paper', lamination: 'Perfect Glue Binding' },
      { slug: 'magazine', name: 'Magazine', baseRate: 42, minQty: 200, gsm: '100 GSM Gloss Art', lamination: 'Gloss Finish' },
      { slug: 'journal', name: 'Journal', baseRate: 140, minQty: 100, gsm: '90 GSM Woodfree Paper', lamination: 'Hardbound + Elastic Band' },
      { slug: 'annual-report', name: 'Annual Report', baseRate: 85, minQty: 100, gsm: '350 GSM Velvet Cover', lamination: 'Spot UV Corporate Title' },
      { slug: 'calendar', name: 'Calendar', baseRate: 95, minQty: 200, gsm: '300 GSM Art Card', lamination: 'Desk Tent Wire-O' },
      { slug: 'e-book-printing', name: 'E-Book Printing', baseRate: 75, minQty: 50, gsm: '75 GSM High-Speed Digital', lamination: 'Thermal Softcover' },
      { slug: 'project-report', name: 'Project Report', baseRate: 150, minQty: 20, gsm: '100 GSM Executive Paper', lamination: 'Golden Lettering Hardbound' },
      { slug: 'thesis-printing', name: 'Thesis Printing', baseRate: 250, minQty: 10, gsm: '100 GSM Bond Paper', lamination: 'Deluxe Hardbound Embossed' }
    ],
    'wedding-invitation': [
      { slug: 'wedding-invitation-card', name: 'Wedding Invitation Card', baseRate: 45, minQty: 250, gsm: '350 GSM Metallic Sheet', lamination: 'Deep Gold Hot Foil' },
      { slug: 'engagement-card', name: 'Engagement Card', baseRate: 35, minQty: 200, gsm: 'Pearlescent Board', lamination: 'Rose Gold Foil' },
      { slug: 'birthday-invitation', name: 'Birthday Invitation', baseRate: 15, minQty: 100, gsm: '300 GSM Art Card', lamination: 'High Gloss UV' },
      { slug: 'anniversary-invitation', name: 'Anniversary Invitation', baseRate: 30, minQty: 100, gsm: 'Silver Shimmer Card', lamination: 'Silver Foil Stamped' },
      { slug: 'invitation-envelope', name: 'Invitation Envelope', baseRate: 12, minQty: 300, gsm: '140 GSM Metallic Paper', lamination: 'Gold Foil Border' },
      { slug: 'save-the-date-card', name: 'Save The Date Card', baseRate: 18, minQty: 150, gsm: '350 GSM Cotton Card', lamination: 'Gold Gilded Edge' },
      { slug: 'thank-you-card', name: 'Thank You Card', baseRate: 10, minQty: 200, gsm: '300 GSM Uncoated Board', lamination: 'Debossed Monogram' },
      { slug: 'greeting-card', name: 'Greeting Card', baseRate: 14, minQty: 100, gsm: '300 GSM Art Board', lamination: 'Score Folded' },
      { slug: 'religious-invitation-card', name: 'Religious Invitation Card', baseRate: 38, minQty: 250, gsm: 'Saffron Shimmer Board', lamination: 'Gold Foil Deity Emblem' }
    ],
    'packaging-printing': [
      { slug: 'paper-bag', name: 'Paper Bag', baseRate: 18, minQty: 500, gsm: '210 GSM Art Card', lamination: 'Twisted Rope Handle' },
      { slug: 'shopping-bag', name: 'Shopping Bag', baseRate: 26, minQty: 500, gsm: '250 GSM Luxury Board', lamination: 'Ribbon Handle + Foil' },
      { slug: 'product-box', name: 'Product Box', baseRate: 24, minQty: 500, gsm: '350 GSM Cyber SBS', lamination: 'Auto Crash-Lock' },
      { slug: 'cake-box', name: 'Cake Box', baseRate: 28, minQty: 500, gsm: '350 GSM Food-Grade ITC', lamination: 'Clear Window Cutout' },
      { slug: 'sweet-box', name: 'Sweet Box', baseRate: 32, minQty: 500, gsm: '350 GSM SBS Board', lamination: 'Gold Foil Tray + Motif' },
      { slug: 'food-packaging', name: 'Food Packaging', baseRate: 16, minQty: 1000, gsm: 'Food-Grade Poly Board', lamination: 'Oil & Grease Barrier' },
      { slug: 'pkg-product-label', name: 'Product Label', baseRate: 1.8, minQty: 1000, gsm: 'Gloss Waterproof Vinyl', lamination: 'Permanent Adhesive' },
      { slug: 'sticker-label', name: 'Sticker Label', baseRate: 1.5, minQty: 1000, gsm: '80 Micron Chroma Paper', lamination: 'Precision Kiss-Cut' },
      { slug: 'barcode-label', name: 'Barcode Label', baseRate: 0.6, minQty: 2000, gsm: 'Thermal Transfer Synthetic', lamination: 'Grade-A Barcode Scan' },
      { slug: 'hang-tag', name: 'Hang Tag', baseRate: 3.5, minQty: 1000, gsm: '350 GSM Art Card', lamination: 'Hole Punched + Velvet Touch' },
      { slug: 'product-sleeve', name: 'Product Sleeve', baseRate: 4.2, minQty: 1000, gsm: '250 GSM Art Card', lamination: 'Wraparound Belly Band' }
    ],
    'labels-stickers': [
      { slug: 'round-sticker', name: 'Round Sticker', baseRate: 1.8, minQty: 1000, gsm: 'Gloss Vinyl', lamination: 'Circular Die-Cut' },
      { slug: 'square-sticker', name: 'Square Sticker', baseRate: 1.6, minQty: 1000, gsm: 'Waterproof Vinyl', lamination: 'Rounded / Sharp Corners' },
      { slug: 'transparent-sticker', name: 'Transparent Sticker', baseRate: 2.8, minQty: 1000, gsm: 'Ultra-Clear PP Film', lamination: 'White Ink Under-print' },
      { slug: 'waterproof-sticker', name: 'Waterproof Sticker', baseRate: 2.4, minQty: 1000, gsm: 'BOPP Synthetic Film', lamination: 'Freezer & Moisture Proof' },
      { slug: 'vinyl-sticker', name: 'Vinyl Sticker', baseRate: 3.2, minQty: 500, gsm: '100 Micron Premium Vinyl', lamination: '3-Year Outdoor UV Shield' },
      { slug: 'logo-sticker', name: 'Logo Sticker', baseRate: 2.5, minQty: 1000, gsm: 'Metallic Mirror Vinyl', lamination: 'Custom Brand Contour' },
      { slug: 'qr-code-sticker', name: 'QR Code Sticker', baseRate: 1.9, minQty: 500, gsm: 'High Contrast Synthetic', lamination: 'Instant Scannability' },
      { slug: 'lbl-product-label', name: 'Product Label', baseRate: 1.8, minQty: 1000, gsm: 'Cast Coated Self-Adhesive', lamination: 'Full Spectrum CMYK' },
      { slug: 'warning-label', name: 'Warning Label', baseRate: 2.2, minQty: 500, gsm: 'Fluorescent Safety Vinyl', lamination: 'OSHA / ISO Compliant' }
    ],
    'photo-digital-printing': [
      { slug: 'photo-printing', name: 'Photo Printing', baseRate: 12, minQty: 20, gsm: '260 GSM Ultra-Gloss RC Paper', lamination: '12-Color Archival Gamut' },
      { slug: 'passport-size-photo', name: 'Passport Size Photo', baseRate: 80, minQty: 32, gsm: 'Luster Photographic Stock', lamination: 'Official Visa Standards' },
      { slug: 'photo-album', name: 'Photo Album', baseRate: 1800, minQty: 1, gsm: 'Lay-Flat Laminated Sheets', lamination: 'Leatherette Briefcase Box' },
      { slug: 'photo-frame', name: 'Photo Frame', baseRate: 350, minQty: 1, gsm: 'HD Photographic Print', lamination: 'Solid Timber Moulding' },
      { slug: 'canvas-printing', name: 'Canvas Printing', baseRate: 650, minQty: 1, gsm: '380 GSM Cotton Artist Canvas', lamination: 'Stretched Gallery Wrap' },
      { slug: 'customized-photo-mug', name: 'Customized Photo Mug', baseRate: 180, minQty: 1, gsm: 'Grade-A Ceramic Mug (11 Oz)', lamination: 'Microwave Safe Sublimation' },
      { slug: 'personalized-gifts', name: 'Personalized Gifts', baseRate: 120, minQty: 10, gsm: 'Acrylic / Steel / Wood', lamination: 'UV Print / Laser Engraved' },
      { slug: 'pvc-card-printing', name: 'PVC Card Printing', baseRate: 35, minQty: 25, gsm: '760 Micron Solid PVC', lamination: 'Waterproof Solid Core' }
    ],
    'school-educational-printing': [
      { slug: 'school-id-card', name: 'School ID Card', baseRate: 30, minQty: 100, gsm: 'Rigid PVC Plastic', lamination: 'Sublimated School Lanyard' },
      { slug: 'edu-school-diary', name: 'School Diary', baseRate: 60, minQty: 300, gsm: 'Hardbound Strawboard', lamination: 'Gold Foil Crest' },
      { slug: 'marksheet', name: 'Marksheet', baseRate: 8.5, minQty: 500, gsm: '120 GSM Security Watermark Paper', lamination: 'Anti-Copy Guilloche Border' },
      { slug: 'certificate', name: 'Certificate', baseRate: 15, minQty: 100, gsm: '250 GSM Executive Board', lamination: 'Gold Foil Seal' },
      { slug: 'question-paper', name: 'Question Paper', baseRate: 1.2, minQty: 500, gsm: '60 GSM Maplitho Paper', lamination: 'Confidentiality Packaged' },
      { slug: 'admission-form', name: 'Admission Form', baseRate: 3.5, minQty: 500, gsm: '100 GSM Bond Paper', lamination: 'Perforated Counterfoil' },
      { slug: 'school-prospectus', name: 'School Prospectus', baseRate: 35, minQty: 300, gsm: 'Cover 300 GSM + Inner 130 GSM', lamination: 'Matte Lamination' },
      { slug: 'exam-pad', name: 'Exam Pad', baseRate: 55, minQty: 200, gsm: '3mm Composite Rigid Board', lamination: 'Chrome Clip + Crest Print' },
      { slug: 'student-notebook', name: 'Student Notebook', baseRate: 32, minQty: 500, gsm: 'Cover 250 GSM SBS', lamination: 'Center Stitched' },
      { slug: 'school-calendar', name: 'School Calendar', baseRate: 25, minQty: 300, gsm: '220 GSM Art Card', lamination: 'Tin Rimmed Top' }
    ],
    'restaurant-hotel-printing': [
      { slug: 'restaurant-menu-card', name: 'Restaurant Menu Card', baseRate: 85, minQty: 25, gsm: '350 GSM Heavy Board', lamination: '125 Micron Encapsulation' },
      { slug: 'food-menu', name: 'Food Menu', baseRate: 45, minQty: 50, gsm: 'Synthetic Tear-Proof Polyart', lamination: 'Washable & Wipe-Clean' },
      { slug: 'table-tent-card', name: 'Table Tent Card', baseRate: 16, minQty: 50, gsm: '350 GSM SBS Board', lamination: 'Freestanding Triangle Fold' },
      { slug: 'rest-bill-book', name: 'Bill Book', baseRate: 55, minQty: 20, gsm: '1+1 Carbonless Duplicate', lamination: 'Sequential Serial Numbering' },
      { slug: 'parcel-sticker', name: 'Parcel Sticker', baseRate: 1.4, minQty: 1000, gsm: 'Gloss Adhesive Paper', lamination: 'Tamper-Evident Safety Seal' },
      { slug: 'rest-food-label', name: 'Food Label', baseRate: 1.5, minQty: 1000, gsm: 'Food-Grade Sticker Stock', lamination: 'Veg / Non-Veg Indicator' },
      { slug: 'takeaway-menu', name: 'Takeaway Menu', baseRate: 3.2, minQty: 1000, gsm: '130 GSM Gloss Art', lamination: 'Tri-Fold Machine Folded' },
      { slug: 'hotel-key-card', name: 'Hotel Key Card', baseRate: 42, minQty: 100, gsm: 'RFID MIFARE / Magnetic PVC', lamination: 'Gloss Surface Branding' },
      { slug: 'room-service-card', name: 'Room Service Card', baseRate: 18, minQty: 100, gsm: '350 GSM Art Board', lamination: 'Doorknob Die-Cut Hanger' }
    ]
  };

  const categoriesList = [
    { id: 'business-stationery', name: 'Business Stationery' },
    { id: 'marketing-advertising', name: 'Marketing & Advertising' },
    { id: 'books-publications', name: 'Books & Publications' },
    { id: 'wedding-invitation', name: 'Wedding & Invitation' },
    { id: 'packaging-printing', name: 'Packaging Printing' },
    { id: 'labels-stickers', name: 'Labels & Stickers' },
    { id: 'photo-digital-printing', name: 'Photo & Digital Printing' },
    { id: 'school-educational-printing', name: 'School & Educational Printing' },
    { id: 'restaurant-hotel-printing', name: 'Restaurant & Hotel Printing' }
  ];

  // Sync category if prop changes
  useEffect(() => {
    if (initialCategory && categoryProductsMap[initialCategory]) {
      setCategory(initialCategory);
      const firstProd = categoryProductsMap[initialCategory][0];
      setSelectedProduct(firstProd.slug);
      setQuantity(String(firstProd.minQty));
    }
  }, [initialCategory]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const prods = categoryProductsMap[newCat] || [];
    if (prods.length > 0) {
      setSelectedProduct(prods[0].slug);
      setQuantity(String(prods[0].minQty));
    }
  };

  const currentProducts = categoryProductsMap[category] || [];
  const currentProdObj = currentProducts.find(p => p.slug === selectedProduct) || currentProducts[0] || {
    slug: 'visiting-card',
    name: 'Visiting Card',
    baseRate: 0.35,
    minQty: 1000,
    gsm: '350 GSM Velvet Board',
    lamination: 'Thermal Matte / Gloss'
  };

  // Price Calculation model
  const calculateAmount = () => {
    const qty = Number(quantity) || currentProdObj.minQty || 1000;
    const sideMultiplier = printingSides === 'both-sides' ? 1.4 : 1.0;
    let baseTotal = qty * (currentProdObj.baseRate || 1) * sideMultiplier;

    if (foil !== 'none') baseTotal += Math.max(350, baseTotal * 0.15);
    if (spotUv !== 'none') baseTotal += Math.max(400, baseTotal * 0.15);
    return Math.round(baseTotal).toFixed(2);
  };

  const productImage = `/images/products/${currentProdObj.slug}.webp`;

  const handleWhatsAppEnquiry = () => {
    const text = `Hello PRINTIZER,
I would like to get an official quotation for:
Product: ${currentProdObj.name}
Category: ${category}
Material: ${currentProdObj.gsm}
Finishing: ${currentProdObj.lamination}
Quantity: ${quantity} units
Sides: ${printingSides === 'both-sides' ? 'Both Sides (Front & Back)' : 'Single Side (Front Only)'}
Hot Foil: ${foil}
Spot UV: ${spotUv}
Job Name: ${jobName || 'Commercial Print Enquiry'}
Estimated Amount: ₹ ${calculateAmount()}

Please confirm quotation and ordering details.
Thank you!`;
    window.open(`https://wa.me/919898351920?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddOrder = () => {
    if (onOpenQuoteModal) {
      onOpenQuoteModal({
        name: currentProdObj.name,
        slug: currentProdObj.slug,
        minQuantity: Number(quantity),
        materials: [currentProdObj.gsm],
        finishes: [printingSides === 'both-sides' ? 'Both Sides Printing' : 'Single Side Printing', currentProdObj.lamination]
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-left">
      {/* Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="w-9 h-9 rounded-xl bg-brand-crimson/10 border border-brand-crimson/30 flex items-center justify-center text-brand-crimson font-black text-xs">
            PZ
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Commercial Order & Quotation Configurator
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Select category, product specifications, quantities, and embellishments for live quotation estimates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Professional Color Calibration</span>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Category Selection */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                SELECT CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-brand-navy focus:outline-none shadow-sm cursor-pointer"
              >
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Inner "Configure Specifications" Card */}
            <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-2xs">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-crimson"></span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  CONFIGURE SPECIFICATIONS
                </h4>
              </div>

              {/* Product and Printing Sides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Product *
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const p = currentProducts.find(item => item.slug === e.target.value);
                      if (p) setQuantity(String(p.minQty));
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-navy shadow-2xs"
                  >
                    {currentProducts.map(prod => (
                      <option key={prod.slug} value={prod.slug}>{prod.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Printing Sides *
                  </label>
                  <select
                    value={printingSides}
                    onChange={(e) => setPrintingSides(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-navy shadow-2xs"
                  >
                    <option value="both-sides">Both Sides (Front & Back)</option>
                    <option value="single-side">Single Side (Front Only)</option>
                  </select>
                </div>
              </div>

              {/* Foil and Spot UV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hot Foil Stamping
                  </label>
                  <select
                    value={foil}
                    onChange={(e) => setFoil(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-navy shadow-2xs"
                  >
                    <option value="none">None</option>
                    <option value="gold-foil">Gold Foil Stamping</option>
                    <option value="silver-foil">Silver Foil Stamping</option>
                    <option value="rose-gold">Rose Gold Foil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spot UV Finish
                  </label>
                  <select
                    value={spotUv}
                    onChange={(e) => setSpotUv(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-navy shadow-2xs"
                  >
                    <option value="none">None</option>
                    <option value="single-side">Single Side Raised Spot UV</option>
                    <option value="both-sides">Both Sides Raised Spot UV</option>
                  </select>
                </div>
              </div>

              {/* Quantity Selectors */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Quantity *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const min = currentProdObj.minQty || 100;
                    const mults = [1, 2, 3, 5, 10];
                    return mults.map(m => {
                      const q = String(min * m);
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuantity(q)}
                          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold border transition ${
                            quantity === q
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {q} units
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Job Name and Estimated Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Name *
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. My ${currentProdObj.name} Order`}
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-navy shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Amount (₹)
                  </label>
                  <div className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-black text-brand-navy flex items-center justify-between shadow-2xs">
                    <span className="text-sm font-black text-slate-900">₹ {calculateAmount()}</span>
                    <span className="text-[10px] text-slate-400 font-normal">+ Taxes / Logistics</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddOrder}
                  className="w-full sm:flex-1 bg-brand-crimson hover:bg-brand-red text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-md shadow-brand-crimson/25 transition active:scale-98 flex items-center justify-center space-x-2"
                >
                  <span>Request Official Quotation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Enquiry</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Product Showcase Column (5 Cols) with Branded Sample Photo */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-brand-crimson uppercase tracking-wider block mb-1">
              PRINTIZER OFFICIAL PRODUCT SHOWCASE
            </span>

            {/* Active Big Product Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
              <img
                src={productImage}
                alt={currentProdObj.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Title & Badge */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentProdObj.name}
              </h2>
              <span className="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md mt-1 border border-slate-200">
                Category: {category}
              </span>
            </div>

            {/* Detailed Spec List */}
            <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                PRODUCT SPECIFICATIONS:
              </h4>

              <p className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0"></span>
                <span><strong>Material Quality:</strong> {currentProdObj.gsm}</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0"></span>
                <span><strong>Finishing:</strong> {currentProdObj.lamination}</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0"></span>
                <span><strong>Standard Minimum:</strong> {currentProdObj.minQty} Units</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0"></span>
                <span><strong>Turnaround:</strong> 3-5 business days after digital soft proof</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson shrink-0"></span>
                <span><strong>Color Calibration:</strong> CMYK 300 DPI Photographic Fidelity</span>
              </p>
            </div>

            {/* Specifications Notes Box */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <strong className="text-slate-900 block font-bold">Production Standards:</strong>
              <p>• Size and artwork must include 3mm bleed margin.</p>
              <p>• Vector PDF, AI, or CorelDRAW CDR format with converted curves recommended.</p>
              <p>• Full CMYK color spectrum fidelity assured on every order.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
