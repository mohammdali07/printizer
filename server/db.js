import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'printizer.json');

// Ensure directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed categories & products according to PRINTIZER specifications
const initialCategories = [
  {
    id: 'business-printing',
    name: 'Business Printing',
    slug: 'business-printing',
    description: 'Corporate visiting cards, executive letterheads, envelopes, company stationery, and presentation folders.',
    icon: 'Briefcase',
    badge: 'Corporate Standard',
    image: '/images/categories/business-printing.jpg'
  },
  {
    id: 'marketing-printing',
    name: 'Marketing Printing',
    slug: 'marketing-printing',
    description: 'Promotional brochures, multi-page catalogues, flyers, booklets, and corporate event invitation cards.',
    icon: 'Megaphone',
    badge: 'High Impact',
    image: '/images/categories/marketing-printing.jpg'
  },
  {
    id: 'packaging-printing',
    name: 'Packaging Printing',
    slug: 'packaging-printing',
    description: 'Custom product boxes, rigid folding cartons, branded retail paper bags, and packaging sleeves.',
    icon: 'Package',
    badge: 'Custom Sized',
    image: '/images/categories/packaging-printing.jpg'
  },
  {
    id: 'stickers-labels',
    name: 'Stickers & Labels',
    slug: 'stickers-labels',
    description: 'Precision die-cut stickers, waterproof bottle labels, barcode labels, and dispenser roll stickers.',
    icon: 'Tag',
    badge: 'Waterproof & UV',
    image: '/images/categories/stickers-labels.jpg'
  },
  {
    id: 'large-format-printing',
    name: 'Large Format Printing',
    slug: 'large-format-printing',
    description: 'Roll-up standees, outdoor flex banners, exhibition vinyl, storefront signage, and backlit prints.',
    icon: 'Maximize',
    badge: 'Weather Resistant',
    image: '/images/categories/large-format-printing.jpg'
  },
  {
    id: 'custom-printing',
    name: 'Custom Printing',
    slug: 'custom-printing',
    description: 'Tailored wedding invitations, desk calendars, greeting cards, certificates, and special print requirements.',
    icon: 'Sparkles',
    badge: 'Luxury Finishes',
    image: '/images/categories/custom-printing.jpg'
  }
];

const initialProducts = [
  // 1. BUSINESS PRINTING
  {
    id: 'prd-visiting-cards',
    slug: 'visiting-cards',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Visiting Cards',
    tagline: 'Standard 250g / 300g / 350g Art Card corporate visiting cards with gloss or matte finish.',
    description: 'High-grade corporate visiting cards engineered for crisp typographic reproduction and vibrant color fidelity. Available in regular 250 GSM gloss, 300 GSM matte, 350 GSM premium silk, and luxury velvet soft-touch boards.',
    popular: true,
    featured: true,
    image: '/images/visiting-card-red-gloss.jpg',
    secondaryImages: [
      '/images/visiting-card-red-gloss.jpg',
      '/images/visiting-cards-reference-strip.jpg',
      '/images/visiting-card-madhuram-showcase.jpg'
    ],
    productClass: 'Regular / Premium',
    paperQuality: '250 GSM / 300 GSM / 350 GSM Art Card',
    productionTime: '3-4 business days',
    laminationType: 'Gloss Lamination / Thermal Matte',
    bothSideOption: true,
    minQuantity: 1000,
    standardSizes: ['Standard 3.5" x 2.0" (89 x 51 mm)', 'Slim / European (3.3" x 2.1")', 'Folded Visiting Card (3.5" x 4.0")'],
    materials: ['250g Art Card (Gloss)', '300g Art Card (Thermal Matte)', '350g Premium Art Board', '400g Ultra-Thick Board', 'Specialty Metallic Ivory'],
    finishes: ['Gloss Lamination', 'Matte Lamination', 'Velvet Soft-Touch', 'Raised Spot UV', 'Gold Foil Stamping', 'Silver Foil Stamping']
  },
  {
    id: 'prd-business-cards',
    slug: 'business-cards',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Business Cards (Executive & Luxury)',
    tagline: 'Heavy card stocks with velvet touch, raised spot UV, and metallic hot foil stamping.',
    description: 'Engineered for founders, executives, and luxury networking. Choose from heavy 350 GSM to 400 GSM art card boards with multi-process embellishments including tactile raised spot UV, precision hot foil stamping, and rounded corners.',
    popular: true,
    featured: true,
    image: '/images/visiting-cards-reference-strip.jpg',
    secondaryImages: [
      '/images/visiting-cards-reference-strip.jpg',
      '/images/visiting-card-red-gloss.jpg'
    ],
    productClass: 'Executive Luxury',
    paperQuality: '350 GSM / 400 GSM Heavy Board',
    productionTime: '3-5 business days',
    laminationType: 'Velvet Soft-Touch / Thermal Matte',
    bothSideOption: true,
    minQuantity: 500,
    standardSizes: ['Standard (3.5" x 2.0")', 'Square (2.5" x 2.5")', 'Custom Dimensions'],
    materials: ['350 GSM Premium Art Card', '400 GSM Ultra-Thick Board', '300 GSM Textured Linen', 'Cotton Uncoated Board'],
    finishes: ['Velvet Soft-Touch Lamination', 'Raised Spot UV', 'Gold / Silver Hot Foil Stamping', 'Embossed Lettering', 'Rounded Corners (3mm/6mm)']
  },
  {
    id: 'prd-letterheads',
    slug: 'letterheads',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Letterheads',
    tagline: 'Official corporate correspondence on smooth 100 GSM Bond and 120 GSM Alabaster paper.',
    description: 'Smooth, laser and inkjet guaranteed writing stock. Guarantees sharp typographic reproduction, accurate corporate pantone tones, and an authoritative hand-feel.',
    popular: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    productClass: 'Executive Stationery',
    paperQuality: '100 GSM Bond / 120 GSM Alabaster Superfine',
    productionTime: '3-4 business days',
    minQuantity: 100,
    standardSizes: ['A4 (210 x 297 mm)', 'US Letter (8.5" x 11")', 'Executive Size'],
    materials: ['100 GSM Executive Bond Paper', '120 GSM Superfine Alabaster Paper', '100 GSM Royal Watermarked Paper', '100 GSM 100% Recycled Eco Stock'],
    finishes: ['Full Color Front Only', 'Full Color Both Sides', 'Metallic Gold / Silver Foil Accents']
  },
  {
    id: 'prd-envelopes',
    slug: 'envelopes',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Envelopes',
    tagline: 'Custom branded mailing envelopes engineered with secure peel-and-seal adhesive strips.',
    description: 'Give proposals, invoices, and legal correspondence a cohesive brand touchpoint. Available in standard commercial #10, DL, A4/C4, and custom pocket formats.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
    productClass: 'Corporate Mailing',
    paperQuality: '100 GSM Bond / 120 GSM Royal White',
    productionTime: '3-5 business days',
    minQuantity: 250,
    standardSizes: ['#10 Standard (4.125" x 9.5")', 'A4 / C4 Pocket (9" x 12")', 'DL Commercial (4.3" x 8.6")', 'Custom Dimensions'],
    materials: ['100 GSM Bond Paper', '120 GSM Royal Executive White', '120 GSM Natural Buff Kraft'],
    finishes: ['Self-Adhesive Peel & Seal Strip', 'Address Window Cutout', 'Full Bleed Edge-to-Edge Print']
  },
  {
    id: 'prd-company-stationery',
    slug: 'company-stationery',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Company Stationery',
    tagline: 'Coordinated corporate identity suites with consistent color calibration across all media.',
    description: 'Unified executive suites comprising letterheads, matching continuation sheets, compliment slips, branded envelopes, and employee folders.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['Complete Coordinated Suite', 'Custom Component Bundles'],
    materials: ['Matching 120 GSM Executive Bond & 350 GSM Heavy Board', 'Textured Linen Suite'],
    finishes: ['Foil Embellished Seals', 'Coordinated Color Palettes', 'Soft-Touch Finishes']
  },
  {
    id: 'prd-notepads',
    slug: 'notepads',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Notepads',
    tagline: 'Branded desk pads and conference memo pads that keep your brand in view daily.',
    description: 'Bound with heavy chipboard backing and precision padding compound. Perfect for executive meeting rooms, corporate training sessions, and daily team use.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['A4 (8.27" x 11.69")', 'A5 (5.83" x 8.27")', 'A6 Pocket (4.13" x 5.83")'],
    materials: ['80 GSM Ultra-Smooth Writing Paper', '90 GSM Fine Bond Paper', '100 GSM Executive Cream Stock'],
    finishes: ['Glue Padded Head with Strawboard Back', 'Wire-O Spiral Binding', 'Micro-Perforated Tear Sheets']
  },
  {
    id: 'prd-presentation-folders',
    slug: 'presentation-folders',
    categoryId: 'business-printing',
    categoryName: 'Business Printing',
    name: 'Presentation Folders',
    tagline: 'Heavyweight document presentation folders with die-cut business card slots.',
    description: 'Holds proposals, contracts, and marketing brochures with structural rigidity. Finished with silky matte or gloss lamination and interior card slits.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Standard 9" x 12" (Holds A4 & Letter)', 'Expandable Gusset Folder (Up to 50 sheets)'],
    materials: ['350 GSM Heavy Art Card', '400 GSM Rigid SBS Board', '300 GSM Kraft Board'],
    finishes: ['Velvet Matte Exterior', 'Gloss Lamination', 'Spot UV on Logo', 'Single or Double Pocket with Card Slits']
  },

  // 2. MARKETING PRINTING
  {
    id: 'prd-flyers',
    slug: 'flyers',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Flyers',
    tagline: 'High-visibility promotional hand-outs designed for maximum marketing reach.',
    description: 'Crisp, vibrant full-color printing engineered to generate foot traffic, promote events, launch new products, and drive local awareness with exceptional clarity.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    minQuantity: 250,
    standardSizes: ['A5 (148 x 210 mm)', 'A4 (210 x 297 mm)', 'DL (99 x 210 mm)', 'A6 (105 x 148 mm)'],
    materials: ['130 GSM Gloss Art Paper', '170 GSM Premium Gloss / Matt Art Paper', '250 GSM Sturdy Card Stock'],
    finishes: ['High Gloss Protective Finish', 'Silk Matte Coat', 'Single or Double Sided Full Color']
  },
  {
    id: 'prd-brochures',
    slug: 'brochures',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Brochures',
    tagline: 'Multi-panel storytelling collateral with razor-sharp machine folds and vivid color fidelity.',
    description: 'Communicate complex value propositions, product ranges, and company milestones with precision scoring and clean creasing that never cracks.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Tri-Fold (A4 folded to DL)', 'Bi-Fold / Half-Fold (A4 folded to A5)', 'Z-Fold 6-Panel', 'Gate Fold'],
    materials: ['170 GSM Art Paper', '250 GSM Premium Card Stock', '300 GSM Heavy Card with Creasing'],
    finishes: ['Velvet Soft-Touch Coat', 'Matte Lamination with Spot UV Highlights', 'Gloss Finish', 'Precision Machine Scoring']
  },
  {
    id: 'prd-posters',
    slug: 'posters',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Posters',
    tagline: 'Vibrant, high-resolution display posters for retail, events, and brand campaigns.',
    description: 'Captivate passerby traffic with deep color saturation and contrast. Available in versatile commercial sizes suitable for storefront windows, exhibits, and retail walls.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    minQuantity: 10,
    standardSizes: ['A3 (297 x 420 mm)', 'A2 (420 x 594 mm)', 'A1 (594 x 841 mm)', 'A0 (841 x 1189 mm)'],
    materials: ['170 GSM Coated Art Paper', '220 GSM Photo Satin Poster Stock', '300 GSM Heavy Poster Board'],
    finishes: ['Gloss Poster Coat', 'Anti-Glare Matte Lamination', 'UV-Resistant Protective Shield']
  },
  {
    id: 'prd-catalogues',
    slug: 'catalogues',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Catalogues',
    tagline: 'Comprehensive product showcase catalogues with enduring bindings and brilliant photo fidelity.',
    description: 'Showcase your comprehensive inventory, B2B wholesale lines, or annual collections with durable bindings and rich visual fidelity.',
    popular: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['A4 Portrait (210 x 297 mm)', 'A4 Landscape', 'A5 Portrait (148 x 210 mm)', 'Square (8" x 8")'],
    materials: ['Cover: 300-350 GSM Card / Inside: 130-170 GSM Art Paper', 'Luxury Coated Combination'],
    finishes: ['Perfect Thermal Binding', 'Saddle-Stitched Stapled Binding', 'Wire-O Binding', 'Soft-Touch Matte Cover with Spot UV']
  },
  {
    id: 'prd-booklets',
    slug: 'booklets',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Booklets',
    tagline: 'Compact multi-page manuals, corporate profiles, and event program guides.',
    description: 'Ideal for annual reports, policy guidelines, instruction manuals, and institutional programs. Clean square spines or staple binding with precise alignment.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['A5 (148 x 210 mm)', 'A4 (210 x 297 mm)', 'Custom Page Counts (8 to 64 pages)'],
    materials: ['130 GSM Silk Text Inside / 250 GSM Card Cover', '100% Recycled Uncoated Stock'],
    finishes: ['Saddle Stitch Binding', 'Square Spine Finishing', 'Matte or Gloss Protective Cover']
  },
  {
    id: 'prd-promotional-cards',
    slug: 'promotional-cards',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Promotional Cards',
    tagline: 'Postcard-style announcements, discount vouchers, and direct mail marketing cards.',
    description: 'Command immediate attention in mailboxes, retail counters, and subscription package inserts with sturdy, high-gloss or silky matte promotional postcards.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['4" x 6" Standard Postcard', '5" x 7" Executive Card', 'DL Postcard (3.9" x 8.2")'],
    materials: ['350 GSM Stiff Postcard Board', '400 GSM Ultra-Board', 'Kraft Uncoated Card'],
    finishes: ['Gloss Front / Uncoated Back', 'Dual Soft-Touch Matte', 'Foil Stamped Accent Text']
  },
  {
    id: 'prd-invitation-cards',
    slug: 'invitation-cards',
    categoryId: 'marketing-printing',
    categoryName: 'Marketing Printing',
    name: 'Invitation Cards',
    tagline: 'Prestigious corporate gala, product launch, and formal seminar invitations.',
    description: 'Set the tone for your milestone corporate functions, annual shareholder summits, awards galas, and launch events with tactile elegance.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['5" x 7" Classic Invitation', '6" x 8" Grand Formal', 'A5 Card with Matching Envelopes'],
    materials: ['350 GSM Pearlised Metallic Stock', '300 GSM Textured Cotton Board'],
    finishes: ['Gold / Rose Gold / Silver Hot Foil Stamping', 'Deep Letterpress Debossing', 'Matching Branded Envelopes']
  },

  // 3. PACKAGING PRINTING
  {
    id: 'prd-custom-packaging-boxes',
    slug: 'custom-packaging-boxes',
    categoryId: 'packaging-printing',
    categoryName: 'Packaging Printing',
    name: 'Custom Packaging Boxes',
    tagline: 'Tailor-made rigid and folding carton boxes engineered precisely for your products.',
    description: 'Create an unboxing experience that builds lasting customer loyalty. Designed to your exact millimetre dimensions with secure locking tabs and structural resilience.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    minQuantity: 250,
    standardSizes: ['Custom Sized to Exact Product Dimensions', 'Tuck-End Box', 'Auto-Lock Bottom Box', 'Drawer / Slide-Out Box'],
    materials: ['350 GSM Folding Box Board (FBB)', '400 GSM Kraft Board', 'Rigid Chipboard with Printed Art Paper', 'Corrugated E-Flute'],
    finishes: ['Velvet Soft-Touch Lamination', 'Spot UV on Brand Logo', 'Hot Foil Stamping', 'Custom Interior Printing', 'Custom Foam / Paper Insert Trays']
  },
  {
    id: 'prd-product-boxes',
    slug: 'product-boxes',
    categoryId: 'packaging-printing',
    categoryName: 'Packaging Printing',
    name: 'Product Boxes',
    tagline: 'Retail-ready cartons for cosmetics, pharmaceuticals, food jars, and electronics.',
    description: 'Engineered for retail shelf dominance. Features razor-sharp die-cutting, precise glue lines, and vivid color reproduction compliant with industry packaging standards.',
    popular: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    minQuantity: 250,
    standardSizes: ['Reverse Tuck End (RTE)', 'Straight Tuck End (STE)', 'Crash Lock Bottom', 'Custom Dimensions'],
    materials: ['300-400 GSM SBS Board', 'Recycled Kraft Stock', 'Silver MetPET Board'],
    finishes: ['Gloss / Matte Film Lamination', 'Embossed Brand Text', 'Transparent Window Die-Cut', 'Barcode Integration']
  },
  {
    id: 'prd-paper-bags',
    slug: 'paper-bags',
    categoryId: 'packaging-printing',
    categoryName: 'Packaging Printing',
    name: 'Paper Bags',
    tagline: 'Eco-conscious and luxury retail shopping bags with reinforced handles.',
    description: 'Turn every customer walking out of your store into a moving brand ambassador. Reinforced top turn-overs and bottom cardboards ensure heavy carrying strength.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    minQuantity: 250,
    standardSizes: ['Small (8" x 10" x 3.5")', 'Medium (10" x 13" x 4")', 'Large (13" x 17" x 5")', 'Wine Bottle Bag'],
    materials: ['150-250 GSM Coated Art Paper', '140-180 GSM Virgin Brown Kraft', 'White Bleached Kraft Paper'],
    finishes: ['Cotton Rope Handles', 'Satin Ribbon Handles', 'Twisted Paper Cord', 'Die-Cut Punched Handles', 'Matte Lamination with Foil Logo']
  },
  {
    id: 'prd-packaging-sleeves',
    slug: 'packaging-sleeves',
    categoryId: 'packaging-printing',
    categoryName: 'Packaging Printing',
    name: 'Packaging Sleeves',
    tagline: 'Cost-effective belly bands and slip-on packaging sleeves for boxes, jars, and trays.',
    description: 'Transform plain shipping boxes or meal prep trays into branded retail presentation without the cost of fully printed boxes. Supplied pre-glued or flat with double-tape.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Custom Fit to Box / Container Dimensions', 'Flat with Adhesive Strip', 'Pre-Glued Slide-On Band'],
    materials: ['250 GSM Coated Art Card', '300 GSM Kraft Paper', '300 GSM Uncoated Natural Board'],
    finishes: ['Matte or Gloss Lamination', 'Metallic Foil Elements', 'Precision Die-Cut Finger Grips']
  },
  {
    id: 'prd-printed-cartons',
    slug: 'printed-cartons',
    categoryId: 'packaging-printing',
    categoryName: 'Packaging Printing',
    name: 'Printed Cartons',
    tagline: 'Heavy-duty branded corrugated master shipping cartons and mailer boxes.',
    description: 'Protect your shipments while presenting a polished, branded delivery appearance. Engineered to withstand transit wear while showcasing your brand identity cleanly.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Corrugated Shipping Shipper', 'Self-Locking Subscription Mailer Box', 'Custom Dimensions'],
    materials: ['3-Ply E-Flute Corrugated Board', '5-Ply Heavy Industrial Board', 'White or Kraft Outer Liner'],
    finishes: ['Crisp Screen / Flexographic Printing', 'Full Color Litho-Laminated Top Liner', 'Water-Resistant Outer Varnish']
  },

  // 4. STICKERS AND LABELS
  {
    id: 'prd-custom-stickers',
    slug: 'custom-stickers',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Custom Stickers',
    tagline: 'Vibrant custom vinyl stickers for brand giveaways, swag bags, and retail merchandise.',
    description: 'Individually cut stickers with easy-peel backing. Weatherproof, fade-resistant, and scratch-resistant finishes that stay vibrant indoors and outdoors.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['2" x 2"', '3" x 3"', '4" x 4"', 'Custom Die-Cut Shapes'],
    materials: ['Premium White Vinyl', 'Clear Transparent Vinyl', 'Holographic Vinyl Stock', 'Brushed Metallic Foil'],
    finishes: ['Gloss UV Protective Shield', 'Velvety Matte Over-Laminate', 'Waterproof & Outdoor UV Protected']
  },
  {
    id: 'prd-product-labels',
    slug: 'product-labels',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Product Labels',
    tagline: 'High-definition bottle, jar, pouch, and cosmetic product labels.',
    description: 'Engineered with moisture-resistant and oil-resistant adhesive formulations. Ensures labels do not peel, curl, or smudge throughout cold storage or damp environments.',
    popular: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1608248597359-54859846bfa3?auto=format&fit=crop&w=800&q=80',
    minQuantity: 250,
    standardSizes: ['Custom Sized to Bottle / Jar Spec', 'Oval / Round / Rectangular Formats'],
    materials: ['Waterproof Polypropylene (BOPP)', 'Gloss Paper Adhesive', 'Estate Textured Wine Label Stock'],
    finishes: ['Matte or Gloss Lamination', 'Cold / Hot Foil Stamping', 'Raised Textured Varnish']
  },
  {
    id: 'prd-transparent-stickers',
    slug: 'transparent-stickers',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Transparent Stickers',
    tagline: 'Ultra-clear see-through labels that give products a direct-print look.',
    description: 'Engineered with high-clarity optical film and white ink underprinting so colors pop brilliantly without transparency distortion over dark bottles or clear glass containers.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    minQuantity: 200,
    standardSizes: ['Circle (1.5", 2", 3")', 'Rectangle Custom Sizes', 'Custom Contour Cut'],
    materials: ['Ultra-Clear Gloss Poly Film', 'Frosted Matte Translucent Film'],
    finishes: ['White Ink Backing (Opaque Colors)', 'Gloss Waterproof Finish', 'Permanent Crystal Clear Adhesive']
  },
  {
    id: 'prd-die-cut-stickers',
    slug: 'die-cut-stickers',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Die-Cut Stickers',
    tagline: 'Cut precisely to the exact contours of your logo or custom artwork.',
    description: 'Precision contour cutting ensures your stickers match the exact silhouette of your artwork, leaving zero unwanted border space and giving your brand an elite edge.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Custom Contour Silhouette (From 1.5" up to 12")', 'Any Custom Shape'],
    materials: ['Heavy-Duty Cast Vinyl', 'Tear-Proof Polyolefin', 'Chrome Metallic Base'],
    finishes: ['Anti-Scratch Matte', 'High-Gloss Glass Finish', 'Easy-Peel Split Backing']
  },
  {
    id: 'prd-roll-labels',
    slug: 'roll-labels',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Roll Labels',
    tagline: 'Machine-compatible and manual roll labels for seamless packaging lines.',
    description: 'Supplied on standard 1-inch or 3-inch cores compatible with automated labeling dispensers or manual hand application. Ideal for high-volume manufacturing lines.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    minQuantity: 500,
    standardSizes: ['Custom Roll Quantities (500 to 10,000+ per roll)', 'Any Label Dimensions'],
    materials: ['Semi-Gloss Paper', 'BOPP White / Clear / Silver', 'Direct Thermal / Thermal Transfer'],
    finishes: ['Machine Dispenser Calibrated', 'Permanent / Freezer-Grade Adhesive', 'UV Cured Inks']
  },
  {
    id: 'prd-barcode-labels',
    slug: 'barcode-labels',
    categoryId: 'stickers-labels',
    categoryName: 'Stickers & Labels',
    name: 'Barcode Labels',
    tagline: 'Scan-verified serialised barcode and QR code asset tracking labels.',
    description: 'High-contrast black-on-white or variable data printing tested against optical scanners for instant, error-free retail checkout and warehouse inventory management.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    minQuantity: 500,
    standardSizes: ['Standard 50mm x 25mm', '38mm x 25mm', '100mm x 50mm'],
    materials: ['Coated Chromo Paper', 'Polyester Destructible Void Stock', 'Thermal Transfer Label Stock'],
    finishes: ['High Optical Density Ink', 'Sequential Numbering / Serialisation', 'Permanent Industrial Adhesive']
  },

  // 5. LARGE FORMAT PRINTING
  {
    id: 'prd-flex-banners',
    slug: 'flex-banners',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Flex Banners',
    tagline: 'Heavy-duty outdoor flex banners with reinforced hemmed edges and brass eyelets.',
    description: 'Engineered for exterior hoardings, event backdrops, and construction fencing. Formulated with UV-stabilized inks that resist harsh monsoon rain and direct sunlight.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['6ft x 3ft', '8ft x 4ft', '10ft x 6ft', '12ft x 8ft', '20ft x 10ft'],
    materials: ['340 GSM Frontlit Flex', '440 GSM Heavy-Duty Blockout Star Flex', '510 GSM Premium Coated Banner'],
    finishes: ['Heat-Welded Reinforced Edges', 'Brass Grommets / Eyelets Every 2 Feet', 'Pole Pockets Top & Bottom']
  },
  {
    id: 'prd-vinyl-banners',
    slug: 'vinyl-banners',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Vinyl Banners',
    tagline: 'Photo-realistic smooth vinyl banners for premium indoor & outdoor exhibitions.',
    description: 'Offers ultra-smooth surface texture that eliminates graininess, making text, high-res photos, and corporate logos appear razor-sharp even at close reading distance.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['4ft x 2ft', '6ft x 3ft', '8ft x 4ft', 'Custom Wall Dimensions'],
    materials: ['440 GSM Smooth Cast Vinyl', 'Tear-Resistant Matte Vinyl', 'Perforated Mesh Vinyl'],
    finishes: ['Matte Non-Reflective Coating', 'High Gloss Vibrant Coating', 'Rope & Hemmed Perimeter']
  },
  {
    id: 'prd-roll-up-banners',
    slug: 'roll-up-banners',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Roll-Up Banners (Standees)',
    tagline: 'Retractable pull-up banner stands with heavy aluminum base and padded carry case.',
    description: 'The definitive trade show, corporate seminar, and showroom display unit. Assembles in 30 seconds and retracts smoothly into a durable padded carrying bag.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['Standard 2.5ft x 6ft (80 x 200 cm)', 'Wide 3ft x 6ft (85 x 200 cm)', 'Extra Wide 4ft x 6ft (120 x 200 cm)'],
    materials: ['Non-Curling Polypropylene Film', 'Satin Fabric Media', 'Grey-Back Blockout Film (Zero Shadow)'],
    finishes: ['Heavy-Duty Aluminium Anodised Base', 'Telescopic Aluminum Support Pole', 'Zippered Canvas Travel Bag']
  },
  {
    id: 'prd-standee-printing',
    slug: 'standee-printing',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Standee Printing',
    tagline: 'Custom promotional standees and rigid floor displays for retail and exhibitions.',
    description: 'Command customer attention in malls, corporate lobbies, and conference entrances with self-standing, rigid displays featuring vibrant full-color printing.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['2ft x 5ft', '2.5ft x 6ft', 'Life-Size Character / Product Cutouts'],
    materials: ['5mm High-Density Sunboard', 'Rigid Coroplast Flute Board', 'Mounted Vinyl Graphic'],
    finishes: ['Rear Fold-Out Easel Stand', 'Die-Cut Silhouette Form', 'Protective Matte Lamination']
  },
  {
    id: 'prd-signage',
    slug: 'signage',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Signage',
    tagline: 'Architectural, directional, and retail storefront corporate signage.',
    description: 'Engineered for commercial offices, hospitals, retail shops, and educational institutes. Clear legibility, structural longevity, and compliance with architectural branding.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['Custom Sized to Architectural Space', 'Directional Panels', 'Reception Lobby Signs'],
    materials: ['Acrylic Cast Sheet (3mm to 10mm)', 'Aluminium Composite Panel (ACP)', 'Sunboard with Protective Laminate'],
    finishes: ['Brushed Metal Finish', 'Standoff Metal Wall Mount Studs', 'Flame-Polished Edges']
  },
  {
    id: 'prd-backlit-prints',
    slug: 'backlit-prints',
    categoryId: 'large-format-printing',
    categoryName: 'Large Format Printing',
    name: 'Backlit Prints',
    tagline: 'Illuminated lightbox films and fabric prints with brilliant light diffusion.',
    description: 'Designed specifically for lightboxes in airports, retail showrooms, and cinema lobbies. Specially formulated ink densities ensure colors remain rich and intense when lit from behind.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['Custom Sized to Lightbox Housing', 'Standard 3ft x 2ft', '4ft x 3ft', '6ft x 4ft'],
    materials: ['Backlit Translucent Polyester Film (Duratrans)', 'Backlit Silicone-Edge Fabric (SEG)', 'Translucent Vinyl'],
    finishes: ['High-Density Double-Strike Print', 'Silicone Beading for SEG Frames', 'Even Light Diffusing Layer']
  },

  // 6. CUSTOM PRINTING (NO T-SHIRTS)
  {
    id: 'prd-wedding-cards',
    slug: 'wedding-cards',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Wedding Cards',
    tagline: 'Opulent wedding invitations crafted with intricate laser cutouts, foils, and luxury papers.',
    description: 'Celebrate sacred unions with bespoke invitation suites that honor tradition and modern luxury. Featuring multi-layer boards, scented papers, and regal metallic foils.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Royal Gatefold Suite', 'Boxed Wedding Invitation', 'Trifold Royal Suite'],
    materials: ['Handmade Textured Cotton Stock', '400 GSM Metallic Shimmer Board', 'Imported Italian Specialty Papers'],
    finishes: ['Gold & Copper Hot Foil Stamping', 'Intricate Precision Laser Cutting', '3D Sculpted Embossing', 'Wax Seal Accents']
  },
  {
    id: 'prd-greeting-cards',
    slug: 'greeting-cards',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Greeting Cards',
    tagline: 'Festive, corporate gratitude, and seasonal bespoke greeting cards with envelopes.',
    description: 'Foster deeper business partnerships and celebrate Diwali, New Year, anniversaries, and corporate milestones with heartfelt, beautifully finished greeting cards.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['5" x 7" Folded', 'A5 Folded (A4 folded to A5)', 'Square 6" x 6" Folded'],
    materials: ['300 GSM Art Card', '300 GSM Textured Linen Board', 'Pearlescent Shimmer Paper'],
    finishes: ['Spot UV Accents', 'Foil Stamped Greetings', 'Custom Matching Envelopes Included']
  },
  {
    id: 'prd-calendars',
    slug: 'calendars',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Calendars',
    tagline: 'Custom corporate desk calendars and wall calendars that keep your brand visible all 365 days.',
    description: 'Year-round brand positioning on your clients’ desks. Built with sturdy triangle tent stands, durable twin-loop wire-o binding, and heavy art paper pages.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80',
    minQuantity: 50,
    standardSizes: ['Desk Tent Calendar (8.5" x 6")', 'Executive Large Desk (10" x 7")', 'Wall Hanging Calendar (A3 / 12" x 18")'],
    materials: ['Leaves: 200-250 GSM Coated Art Card / Stand: 2mm Rigid Kappa Board', 'Textured Eco Stock'],
    finishes: ['Twin-Loop Wire-O Binding', 'Matte or Gloss Leaf Finish', 'Spot UV & Foil on Cover']
  },
  {
    id: 'prd-certificates',
    slug: 'certificates',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Certificates',
    tagline: 'Prestige graduation, achievement, and corporate award certificates.',
    description: 'Honor achievements with verifiable security features and pristine printing. Perfect for universities, corporate training institutes, and industry awards.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
    minQuantity: 25,
    standardSizes: ['A4 (210 x 297 mm)', 'US Letter (8.5" x 11")'],
    materials: ['250 GSM Executive Parchment Stock', '300 GSM Ivory Textured Board', 'Alabaster Smooth Heavyweight Board'],
    finishes: ['Gold / Silver Foil Stamped Border & Seal', 'Security Hologram Sticker Placement', 'Custom Embossed Official Seal']
  },
  {
    id: 'prd-customised-promotional-materials',
    slug: 'customised-promotional-materials',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Customised Promotional Paper Materials',
    tagline: 'Branded promotional coasters, bookmarks, tags, badges, and paper marketing merchandise.',
    description: 'Extend your brand universe into bespoke tactile paper goods: heavy beverage coasters, merchandise tags, luggage tags, event passes, and branded paper accessories.',
    popular: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    minQuantity: 100,
    standardSizes: ['Custom Sized to Specific Item', 'Coasters (3.5" or 4" Round/Square)', 'Hang Tags with Eyelets'],
    materials: ['Ultra-Absorbent Beermat Board', 'Heavy 400 GSM Uncoated Stock', 'Synthetic Tear-Proof Media'],
    finishes: ['Die-Cut Custom Shapes', 'Metal Eyelet Punching & Cord Stringing', 'Double-Sided Protective Coat']
  },
  {
    id: 'prd-special-printing-requirements',
    slug: 'special-printing-requirements',
    categoryId: 'custom-printing',
    categoryName: 'Custom Printing',
    name: 'Special Printing Requirements',
    tagline: 'Bespoke, complex, or unconventional printing specifications tailored exactly to your vision.',
    description: 'Have a unique blueprint, complex folding architecture, unconventional substrate, or multi-stage embellishment project? Our printing specialists engineer tailored solutions for any custom requirement.',
    popular: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    minQuantity: 1,
    standardSizes: ['Fully Custom Dimensions & Engineering'],
    materials: ['All Commercial & Specialty Substrates Available on Consultation'],
    finishes: ['Combined Multi-Process Embellishments', 'Custom Prototyping & Sampling']
  }
];

// Helper to read and write database
function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      categories: initialCategories,
      products: initialProducts,
      enquiries: [
        {
          id: 'PRZ-2026-1001',
          referenceNo: 'PRZ-2026-1001',
          customerName: 'Rajesh Sharma',
          businessName: 'Apex Capital Advisors',
          whatsappNumber: '+91 98765 43210',
          email: 'rajesh.sharma@apexcapital.in',
          productSlug: 'visiting-cards',
          productName: 'Visiting Cards (250g Art Card)',
          quantity: 1000,
          dimensions: 'Standard 3.5" x 2.0"',
          material: '250g Art Card (Gloss)',
          finishing: 'Gloss Lamination - Both Sides',
          additionalRequirements: 'Red engineering style business cards with gloss finish. Delivery to Mumbai.',
          artworkPath: null,
          artworkOriginalName: 'Apex_VisitingCard_CDR.cdr',
          status: 'Quotation Sent',
          createdAt: '2026-11-20T10:30:00.000Z',
          quotation: {
            quotationNumber: 'PRZ-QT-2026-0012',
            items: [
              {
                description: 'Visiting Cards - 250g Art Card, Gloss Lamination, Both Sides Color Printing',
                quantity: 1000,
                unitPrice: 0.32,
                amount: 320
              }
            ],
            subtotal: 320,
            gstPercent: 18,
            gstAmount: 57.6,
            shippingCharges: 100,
            discount: 0,
            grandTotal: 477.6,
            validityDays: 15,
            validUntil: '2026-12-05',
            deliveryEstimate: '3-4 business days after final digital proof approval',
            paymentTerms: '50% advance to start production, balance prior to dispatch',
            customNotes: 'Calibrated to CorelDRAW CMYK soft proof.',
            generatedAt: '2026-11-20T14:15:00.000Z'
          }
        }
      ],
      settings: {
        brandName: 'PRINTIZER',
        tagline: 'Everything Your Business Needs to Print.',
        website: 'https://Printizer.in',
        email: 'Printizerdesign@gmail.com',
        phone: '+91 98983 51920',
        whatsappLink: 'https://wa.me/919898351920',
        address: 'PRINTIZER Solutions, Corporate Printing Hub, India',
        gstNumber: '24AAACP1234F1Z8',
        currency: '₹',
        defaultGstPercent: 18,
        defaultValidityDays: 15
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Ensure visiting cards have the real user reference images
    if (parsed.products) {
      const vc = parsed.products.find(p => p.slug === 'visiting-cards');
      if (vc) {
        vc.image = '/images/visiting-card-red-gloss.jpg';
        vc.secondaryImages = [
          '/images/visiting-card-red-gloss.jpg',
          '/images/visiting-cards-reference-strip.jpg',
          '/images/visiting-card-madhuram-showcase.jpg'
        ];
        vc.paperQuality = '250 GSM / 300 GSM / 350 GSM Art Card';
        vc.laminationType = 'Gloss Lamination / Thermal Matte';
      }
      const bc = parsed.products.find(p => p.slug === 'business-cards');
      if (bc) {
        bc.image = '/images/visiting-cards-reference-strip.jpg';
        bc.secondaryImages = [
          '/images/visiting-cards-reference-strip.jpg',
          '/images/visiting-card-red-gloss.jpg'
        ];
      }
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
    return { categories: initialCategories, products: initialProducts, enquiries: [], settings: {} };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    try {
      fs.writeFileSync('/tmp/printizer.json', JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Database write fallback warning:', err.message);
    }
  }
}

export const db = {
  // Categories
  getCategories: () => {
    const data = loadData();
    return data.categories || [];
  },

  // Products
  getProducts: (categoryId = null, search = '') => {
    const data = loadData();
    let prods = data.products || [];
    if (categoryId) {
      prods = prods.filter(p => p.categoryId === categoryId);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return prods;
  },

  getProductBySlug: (slug) => {
    const data = loadData();
    return (data.products || []).find(p => p.slug === slug || p.id === slug);
  },

  addProduct: (productData) => {
    const data = loadData();
    const id = 'prd-' + (productData.slug || Date.now());
    const newProduct = {
      id,
      ...productData,
      createdAt: new Date().toISOString()
    };
    data.products.push(newProduct);
    saveData(data);
    return newProduct;
  },

  updateProduct: (id, updates) => {
    const data = loadData();
    const idx = data.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    data.products[idx] = { ...data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    saveData(data);
    return data.products[idx];
  },

  deleteProduct: (id) => {
    const data = loadData();
    const idx = data.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return false;
    data.products.splice(idx, 1);
    saveData(data);
    return true;
  },

  // Enquiries
  getEnquiries: (status = null, search = '') => {
    const data = loadData();
    let list = data.enquiries || [];
    if (status && status !== 'all') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(e =>
        e.customerName.toLowerCase().includes(q) ||
        (e.businessName && e.businessName.toLowerCase().includes(q)) ||
        e.email.toLowerCase().includes(q) ||
        e.whatsappNumber.includes(q) ||
        e.productName.toLowerCase().includes(q) ||
        e.referenceNo.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getEnquiryById: (id) => {
    const data = loadData();
    return (data.enquiries || []).find(e => e.id === id || e.referenceNo === id);
  },

  createEnquiry: (enquiryPayload) => {
    const data = loadData();
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNo = `PRZ-${year}-${randomSuffix}`;
    const newEnquiry = {
      id: refNo,
      referenceNo: refNo,
      customerName: enquiryPayload.customerName,
      businessName: enquiryPayload.businessName || '',
      whatsappNumber: enquiryPayload.whatsappNumber,
      email: enquiryPayload.email,
      productSlug: enquiryPayload.productSlug || '',
      productName: enquiryPayload.productName || 'Custom Print Enquiry',
      quantity: enquiryPayload.quantity ? parseInt(enquiryPayload.quantity, 10) : 100,
      dimensions: enquiryPayload.dimensions || '',
      material: enquiryPayload.material || '',
      finishing: enquiryPayload.finishing || '',
      additionalRequirements: enquiryPayload.additionalRequirements || '',
      jobName: enquiryPayload.jobName || '',
      estimatedPrice: enquiryPayload.estimatedPrice || null,
      selectedOptions: enquiryPayload.selectedOptions || null,
      artworkPath: enquiryPayload.artworkPath || null,
      artworkOriginalName: enquiryPayload.artworkOriginalName || null,
      status: 'New Enquiry',
      createdAt: new Date().toISOString(),
      quotation: null
    };

    data.enquiries.unshift(newEnquiry);
    saveData(data);
    return newEnquiry;
  },

  updateEnquiryStatus: (id, status) => {
    const data = loadData();
    const enquiry = (data.enquiries || []).find(e => e.id === id || e.referenceNo === id);
    if (!enquiry) return null;
    enquiry.status = status;
    enquiry.updatedAt = new Date().toISOString();
    saveData(data);
    return enquiry;
  },

  saveQuotation: (id, quoteData) => {
    const data = loadData();
    const enquiry = (data.enquiries || []).find(e => e.id === id || e.referenceNo === id);
    if (!enquiry) return null;

    const year = new Date().getFullYear();
    const quoteNum = quoteData.quotationNumber || `PRZ-QT-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    enquiry.quotation = {
      quotationNumber: quoteNum,
      items: quoteData.items || [],
      subtotal: Number(quoteData.subtotal || 0),
      gstPercent: Number(quoteData.gstPercent || 18),
      gstAmount: Number(quoteData.gstAmount || 0),
      shippingCharges: Number(quoteData.shippingCharges || 0),
      discount: Number(quoteData.discount || 0),
      grandTotal: Number(quoteData.grandTotal || 0),
      validityDays: Number(quoteData.validityDays || 15),
      validUntil: quoteData.validUntil || '',
      deliveryEstimate: quoteData.deliveryEstimate || '3-5 business days from proof sign-off',
      paymentTerms: quoteData.paymentTerms || '50% advance to initiate printing, balance prior to dispatch',
      customNotes: quoteData.customNotes || '',
      generatedAt: new Date().toISOString()
    };

    if (enquiry.status === 'New Enquiry' || enquiry.status === 'Under Review') {
      enquiry.status = 'Quotation Prepared';
    }

    saveData(data);
    return enquiry;
  },

  getStats: () => {
    const data = loadData();
    const enquiries = data.enquiries || [];
    return {
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter(e => e.status === 'New Enquiry').length,
      underReview: enquiries.filter(e => e.status === 'Under Review').length,
      quotationPrepared: enquiries.filter(e => e.status === 'Quotation Prepared').length,
      quotationSent: enquiries.filter(e => e.status === 'Quotation Sent').length,
      awaitingApproval: enquiries.filter(e => e.status === 'Awaiting Customer Approval').length,
      confirmed: enquiries.filter(e => e.status === 'Confirmed').length,
      completed: enquiries.filter(e => e.status === 'Completed').length,
      cancelled: enquiries.filter(e => e.status === 'Cancelled').length,
      totalProducts: (data.products || []).length,
      totalCategories: (data.categories || []).length
    };
  },

  getSettings: () => {
    const data = loadData();
    return data.settings || {};
  },

  updateSettings: (newSettings) => {
    const data = loadData();
    data.settings = { ...data.settings, ...newSettings };
    saveData(data);
    return data.settings;
  },

  getRates: (group, search) => {
    const data = loadData();
    let rates = data.rateList || [];
    if (group && group !== 'All') {
      rates = rates.filter(r => r.group && r.group.toLowerCase() === group.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      rates = rates.filter(r =>
        (r.product && r.product.toLowerCase().includes(q)) ||
        (r.group && r.group.toLowerCase().includes(q))
      );
    }
    return rates;
  }
};
