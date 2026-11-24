import os
import json
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Base directories
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'client', 'public')
PRODUCTS_IMG_DIR = os.path.join(PUBLIC_DIR, 'images', 'products')
CATEGORIES_IMG_DIR = os.path.join(PUBLIC_DIR, 'images', 'categories')
UPLOADS_DIR = os.path.join(BASE_DIR, 'server', 'uploads')
DB_FILE = os.path.join(BASE_DIR, 'data', 'printizer.json')

os.makedirs(PRODUCTS_IMG_DIR, exist_ok=True)
os.makedirs(CATEGORIES_IMG_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Load Logo
LOGO_PATH = os.path.join(PUBLIC_DIR, 'images', 'printizer-logo-horizontal.png')
brand_logo = None
if os.path.exists(LOGO_PATH):
    try:
        brand_logo = Image.open(LOGO_PATH).convert('RGBA')
    except Exception as e:
        print('Error loading logo:', e)

# Helper to load font
def get_font(size, bold=False):
    font_name = 'segoeuib.ttf' if bold else 'segoeui.ttf'
    font_path = os.path.join('C:/Windows/Fonts', font_name)
    if os.path.exists(font_path):
        return ImageFont.truetype(font_path, size)
    alt_name = 'arialbd.ttf' if bold else 'arial.ttf'
    alt_path = os.path.join('C:/Windows/Fonts', alt_name)
    if os.path.exists(alt_path):
        return ImageFont.truetype(alt_path, size)
    return ImageFont.load_default()

# 9 Exact Categories from User
CATEGORIES = [
    {
        "id": "business-stationery",
        "name": "Business Stationery",
        "gujarati": "બિઝનેસ સ્ટેશનરી",
        "badge": "Corporate Standard",
        "description": "Professional corporate stationery solutions: visiting cards, executive letterheads, multi-part carbonless bill books, vouchers, envelopes, and secure corporate employee ID cards.",
        "themeColor": (15, 23, 42),       # Dark slate
        "accentColor": (225, 29, 72),      # Crimson
        "cardBg": (255, 255, 255)
    },
    {
        "id": "marketing-advertising",
        "name": "Marketing & Advertising",
        "gujarati": "જાહેરાત",
        "badge": "High Impact",
        "description": "High-impact promotional collaterals: flyers, brochures, posters, catalogues, danglers, roll-up standees, flex banners, and rigid sunboard displays.",
        "themeColor": (79, 70, 229),      # Indigo
        "accentColor": (245, 158, 11),     # Amber
        "cardBg": (250, 250, 255)
    },
    {
        "id": "books-publications",
        "name": "Books & Publications",
        "gujarati": "બુક પ્રિન્ટિંગ",
        "badge": "Commercial Binding",
        "description": "Complete publication printing: custom spiral & hardbound notebooks, executive office diaries, academic exercise books, annual reports, calendars, and thesis binding.",
        "themeColor": (13, 148, 136),     # Teal
        "accentColor": (249, 115, 22),     # Orange
        "cardBg": (255, 253, 245)
    },
    {
        "id": "wedding-invitation",
        "name": "Wedding & Invitation",
        "gujarati": "લગ્ન અને આમંત્રણ",
        "badge": "Luxury Foiled Suites",
        "description": "Royal wedding cards, gold hot-foil suites, engagement invitations, birthday & anniversary cards, religious ceremony invites, and coordinating envelopes.",
        "themeColor": (136, 19, 55),      # Wine maroon
        "accentColor": (217, 119, 6),      # Warm gold
        "cardBg": (255, 250, 240)
    },
    {
        "id": "packaging-printing",
        "name": "Packaging Printing",
        "gujarati": "પેકેજિંગ",
        "badge": "Custom Structural Die-Lines",
        "description": "Bespoke retail packaging: luxury paper bags, custom product boxes, bakery cake boxes, sweet boxes, food containers, hang tags, and packaging sleeves.",
        "themeColor": (120, 53, 15),      # Kraft/Amber
        "accentColor": (225, 29, 72),      # Crimson
        "cardBg": (250, 248, 245)
    },
    {
        "id": "labels-stickers",
        "name": "Labels & Stickers",
        "gujarati": "લેબલ્સ અને સ્ટીકર્સ",
        "badge": "Waterproof & UV Protected",
        "description": "Precision die-cut stickers: waterproof vinyl stickers, round & square labels, ultra-clear transparent labels, logo branding stickers, and warning labels.",
        "themeColor": (16, 185, 129),     # Emerald
        "accentColor": (99, 102, 241),     # Indigo
        "cardBg": (255, 255, 255)
    },
    {
        "id": "photo-digital-printing",
        "name": "Photo & Digital Printing",
        "gujarati": "ફોટો અને ડિજિટલ પ્રિન્ટિંગ",
        "badge": "Ultra HD Photographic",
        "description": "High-definition photographic prints, passport photos, luxury photo albums, framed canvas prints, customized photo mugs, personalized corporate gifts, and PVC cards.",
        "themeColor": (30, 41, 59),       # Slate
        "accentColor": (6, 182, 212),      # Cyan
        "cardBg": (248, 250, 252)
    },
    {
        "id": "school-educational-printing",
        "name": "School & Educational Printing",
        "gujarati": "શાળા અને શિક્ષણ પ્રિન્ટિંગ",
        "badge": "Institutional Standards",
        "description": "Complete educational stationery: student ID cards, school diaries, marksheet printing, certificates, examination question papers, admission forms, and exam pads.",
        "themeColor": (37, 99, 235),      # Blue
        "accentColor": (234, 179, 8),      # Gold
        "cardBg": (255, 255, 255)
    },
    {
        "id": "restaurant-hotel-printing",
        "name": "Restaurant & Hotel Printing",
        "gujarati": "રેસ્ટોરન્ટ અને હોટેલ પ્રિન્ટિંગ",
        "badge": "Hospitality Grade",
        "description": "Hospitality & dining print solutions: laminated restaurant menu cards, food menus, table tent display cards, restaurant bill books, parcel stickers, and hotel key cards.",
        "themeColor": (180, 83, 9),       # Amber-Bronze
        "accentColor": (225, 29, 72),      # Crimson
        "cardBg": (254, 252, 248)
    }
]

# 95 Products defined exactly per User Request
RAW_PRODUCTS_DATA = [
    # 1. Business Stationery (15)
    {"cat": "business-stationery", "name": "Visiting Card", "slug": "visiting-card", "qty": 1000, "sizes": ["Standard 3.5\" x 2.0\"", "Square 2.5\" x 2.5\""], "materials": ["250g Art Card", "300g Art Card", "350g Velvet Board", "400g Ultra Thick"], "finishes": ["Gloss Lamination", "Thermal Matte", "Raised Spot UV", "Gold Foil"], "type": "card"},
    {"cat": "business-stationery", "name": "Letterhead", "slug": "letterhead", "qty": 500, "sizes": ["A4 (210 x 297 mm)", "Executive Bond"], "materials": ["100 GSM Alabaster", "120 GSM Sunshine Bond", "85 GSM Executive Superwhite"], "finishes": ["Clean Cut", "Full CMYK Calibration"], "type": "sheet"},
    {"cat": "business-stationery", "name": "Bill Book", "slug": "bill-book", "qty": 10, "sizes": ["1/8 Demy (5.5\" x 8.5\")", "1/4 Demy (8.5\" x 11\")"], "materials": ["NCR Carbonless (1+1 Duplicate)", "NCR Carbonless (1+2 Triplicate)", "White Ledger Paper"], "finishes": ["Numbered", "Perforated Top", "Hardboard Binding"], "type": "book"},
    {"cat": "business-stationery", "name": "Cash Memo Book", "slug": "cash-memo-book", "qty": 10, "sizes": ["1/8 Demy (5.5\" x 8.5\")", "Pocket Size (4\" x 7\")"], "materials": ["Duplicate Carbonless NCR", "55 GSM Ledger Stock"], "finishes": ["Sequential Numbering", "Bound with Counterfoil"], "type": "book"},
    {"cat": "business-stationery", "name": "Receipt Book", "slug": "receipt-book", "qty": 10, "sizes": ["1/8 Demy", "1/6 Demy"], "materials": ["1+1 Carbonless Duplicate", "Bond Watermark Stock"], "finishes": ["Spiral or Tape Bound", "Perforated Slip"], "type": "book"},
    {"cat": "business-stationery", "name": "Quotation Book", "slug": "quotation-book", "qty": 10, "sizes": ["A4 (8.27\" x 11.69\")", "1/4 Demy"], "materials": ["1+1 NCR Carbonless", "70 GSM Ledger Paper"], "finishes": ["Cloth Spine Tape", "Numbered Slips"], "type": "book"},
    {"cat": "business-stationery", "name": "Invoice Book", "slug": "invoice-book", "qty": 10, "sizes": ["A4 Standard (8.27\" x 11.69\")", "Legal Size"], "materials": ["Triplicate (1+2) Multi-Color NCR", "Duplicate (1+1)"], "finishes": ["GST Compliant Columns", "Serial Numbering", "Hard Strawboard Base"], "type": "book"},
    {"cat": "business-stationery", "name": "Delivery Challan Book", "slug": "delivery-challan-book", "qty": 10, "sizes": ["1/4 Demy (8.5\" x 11\")", "1/8 Demy"], "materials": ["NCR Carbonless (1+2 Triplicate)", "Duplicate 60 GSM"], "finishes": ["Numbered", "Perforated", "Cloth Spine Binding"], "type": "book"},
    {"cat": "business-stationery", "name": "Purchase Order Book", "slug": "purchase-order-book", "qty": 10, "sizes": ["A4 Standard", "1/4 Demy"], "materials": ["1+2 Triplicate NCR Carbonless", "1+1 Duplicate"], "finishes": ["Sequential Machine Numbering", "Cardboard Back"], "type": "book"},
    {"cat": "business-stationery", "name": "Payment Voucher", "slug": "payment-voucher", "qty": 20, "sizes": ["Pocket Size (7.5\" x 4.5\")", "1/8 Demy"], "materials": ["70 GSM Bond Paper", "Single / Duplicate Copy"], "finishes": ["Padding Top", "Tear-off Perforation"], "type": "pad"},
    {"cat": "business-stationery", "name": "Envelope", "slug": "envelope", "qty": 500, "sizes": ["DL Size (9.5\" x 4.25\")", "C4 File Size (9\" x 12\")", "10\" x 4.5\""], "materials": ["100 GSM Maplitho Paper", "120 GSM Royal Executive Bond"], "finishes": ["Peel & Seal Strip", "Full Face Printing"], "type": "envelope"},
    {"cat": "business-stationery", "name": "Office File", "slug": "office-file", "qty": 100, "sizes": ["Standard A4 / Foolscap", "Legal Expander"], "materials": ["350 GSM Cyber SBS Board", "Heavy Calico Board"], "finishes": ["Gloss Lamination", "Steel Clip Attached", "Pocket Slit"], "type": "folder"},
    {"cat": "business-stationery", "name": "Folder", "slug": "folder", "qty": 250, "sizes": ["A4 Presentation Folder (9\" x 12\")"], "materials": ["300 GSM Art Card", "350 GSM SBS Board"], "finishes": ["Thermal Matte", "Raised Spot UV", "Single/Double Inside Pockets"], "type": "folder"},
    {"cat": "business-stationery", "name": "ID Card", "slug": "id-card", "qty": 50, "sizes": ["Standard CR80 (86 x 54 mm)"], "materials": ["Rigid PVC Plastic (760 Micron)"], "finishes": ["High Gloss Thermal Lamination", "Oval Lanyard Punch", "Magnetic Stripe"], "type": "idcard"},
    {"cat": "business-stationery", "name": "Employee ID Card", "slug": "employee-id-card", "qty": 50, "sizes": ["Standard CR80 (86 x 54 mm)"], "materials": ["RFID / Smart Chip Card", "Heavyweight 800 Micron PVC"], "finishes": ["Dual Sided Photographic Print", "QR Code / Barcode Integration", "Holographic Overlay"], "type": "idcard"},

    # 2. Marketing & Advertising (12)
    {"cat": "marketing-advertising", "name": "Pamphlet", "slug": "pamphlet", "qty": 1000, "sizes": ["A5 (148 x 210 mm)", "1/8 Demy"], "materials": ["130 GSM Gloss Art Paper", "170 GSM Premium Matte"], "finishes": ["Vibrant High Speed Color", "Single / Both Side"], "type": "flyer"},
    {"cat": "marketing-advertising", "name": "Flyer", "slug": "flyer", "qty": 1000, "sizes": ["A4 (210 x 297 mm)", "A5 (148 x 210 mm)"], "materials": ["170 GSM Gloss Art Paper", "130 GSM Art Paper"], "finishes": ["Gloss / Matte Finish", "Creased"], "type": "flyer"},
    {"cat": "marketing-advertising", "name": "Brochure", "slug": "brochure", "qty": 500, "sizes": ["Tri-Fold (A4 Open)", "Bi-Fold (4 Page A4)"], "materials": ["170 GSM Art Paper", "250 GSM Cardstock"], "finishes": ["Precision Folds & Creases", "Thermal Matte Lamination"], "type": "brochure"},
    {"cat": "marketing-advertising", "name": "Poster", "slug": "poster", "qty": 100, "sizes": ["A3 (11.7\" x 16.5\")", "A2 (16.5\" x 23.4\")", "18\" x 24\""], "materials": ["250 GSM High-Gloss Art Card", "Photographic Synthetic Stock"], "finishes": ["UV Coating", "Moisture Resistant"], "type": "poster"},
    {"cat": "marketing-advertising", "name": "Catalogue", "slug": "catalogue", "qty": 200, "sizes": ["A4 Multi-Page", "8\" x 8\" Square"], "materials": ["Cover 300 GSM Card + Inner 130 GSM Art Paper"], "finishes": ["Center Staple Pin", "Thermal Matte Lamination Cover"], "type": "booklet"},
    {"cat": "marketing-advertising", "name": "Leaflet", "slug": "leaflet", "qty": 1000, "sizes": ["A5", "DL Size (8.5\" x 3.75\")"], "materials": ["100 GSM Maplitho", "130 GSM Gloss Art Paper"], "finishes": ["Both Side CMYK", "Straight Trim"], "type": "flyer"},
    {"cat": "marketing-advertising", "name": "Danglers", "slug": "danglers", "qty": 200, "sizes": ["8\" x 8\" Round / Die-Cut Shape", "Square 7\" x 7\""], "materials": ["350 GSM Heavy Board", "Sunpack Sheet"], "finishes": ["Custom Die-Cut Contour", "Eyelet Hole Punch with String"], "type": "dangler"},
    {"cat": "marketing-advertising", "name": "Standee", "slug": "standee", "qty": 2, "sizes": ["Roll-Up Standee 3ft x 6ft", "2.5ft x 6ft"], "materials": ["280 GSM Non-Tear Matte Polyroll Media"], "finishes": ["Aluminum Cassette Base", "Twin Swivel Feet", "Padded Carry Bag"], "type": "standee"},
    {"cat": "marketing-advertising", "name": "Banner", "slug": "banner", "qty": 1, "sizes": ["Custom Width x Height (e.g. 8ft x 4ft)"], "materials": ["Heavyweight 340 GSM Flex", "Frontlit Star Flex"], "finishes": ["Border Hemming", "Brass Corner Eyelets / Grommets"], "type": "banner"},
    {"cat": "marketing-advertising", "name": "Flex Printing", "slug": "flex-printing", "qty": 1, "sizes": ["Seamless up to 10ft Width"], "materials": ["Star Frontlit Flex (440 GSM)", "Normal Commercial Flex"], "finishes": ["High Solvent Weatherproof Inks", "Reinforced Edge Welds"], "type": "banner"},
    {"cat": "marketing-advertising", "name": "Sunboard Printing", "slug": "sunboard-printing", "qty": 5, "sizes": ["12\" x 18\"", "2ft x 3ft", "4ft x 8ft Sheet"], "materials": ["3mm High Density Sunboard", "5mm Rigid PVC Foam Board"], "finishes": ["Direct UV Flatbed Print", "Matte / Gloss Overlaminate"], "type": "board"},
    {"cat": "marketing-advertising", "name": "Promotional Cards", "slug": "promotional-cards", "qty": 500, "sizes": ["4\" x 6\" Postcard", "5\" x 7\""], "materials": ["300 GSM Art Card", "350 GSM Velvet Board"], "finishes": ["Raised Spot UV", "Tear-off Coupon Perforation"], "type": "card"},

    # 3. Books & Publications (12)
    {"cat": "books-publications", "name": "Notebook", "slug": "notebook", "qty": 200, "sizes": ["A5 (148 x 210 mm)", "B5 (176 x 250 mm)"], "materials": ["Cover 350 GSM Board + 80 GSM Cream Lined Paper"], "finishes": ["Spiral Wire-O Bound", "Soft Touch Matte Cover"], "type": "booklet"},
    {"cat": "books-publications", "name": "School Diary", "slug": "pub-school-diary", "qty": 300, "sizes": ["Custom A5", "6.5\" x 9.5\""], "materials": ["Hardbound Cardboard Cover + 70 GSM Sunshine Paper"], "finishes": ["Gold Foil Logo Stamped", "Section Sewn Binding"], "type": "hardbound"},
    {"cat": "books-publications", "name": "Office Diary", "slug": "office-diary", "qty": 100, "sizes": ["Executive A5 / B5 Daily Planner"], "materials": ["PU Leatherette Hardcover + 80 GSM Ivory Paper"], "finishes": ["Debossed Company Logo", "Satin Ribbon Bookmark", "Monthly Index"], "type": "hardbound"},
    {"cat": "books-publications", "name": "Exercise Book", "slug": "exercise-book", "qty": 500, "sizes": ["Four Line / Single Line / Square (Crown Size)"], "materials": ["Cover 170 GSM + 58 GSM Superprint Inner"], "finishes": ["Center Pinned Saddle Stitch", "Square Folded Spine"], "type": "booklet"},
    {"cat": "books-publications", "name": "Book Printing", "slug": "book-printing", "qty": 100, "sizes": ["Standard 5.5\" x 8.5\"", "A5", "6\" x 9\""], "materials": ["Cover 300 GSM SBS + Inner 80 GSM Natural Shade Book Paper"], "finishes": ["Perfect Glue Binding", "Matte Laminated Cover"], "type": "hardbound"},
    {"cat": "books-publications", "name": "Magazine", "slug": "magazine", "qty": 200, "sizes": ["A4 (8.27\" x 11.69\")"], "materials": ["Cover 250 GSM Gloss + Inner 100 GSM Gloss Art Paper"], "finishes": ["High Gloss Varnish", "Center Saddle Stitch"], "type": "booklet"},
    {"cat": "books-publications", "name": "Journal", "slug": "journal", "qty": 100, "sizes": ["A5 Executive", "6\" x 8\""], "materials": ["Hardbound Greyboard + 90 GSM Woodfree Cream Paper"], "finishes": ["Gold Gilded Edges", "Elastic Closure Band"], "type": "hardbound"},
    {"cat": "books-publications", "name": "Annual Report", "slug": "annual-report", "qty": 100, "sizes": ["A4 Corporate"], "materials": ["Cover 350 GSM Velvet + Inner 130 GSM Matt Art"], "finishes": ["Perfect Binding", "Spot UV on Corporate Title"], "type": "booklet"},
    {"cat": "books-publications", "name": "Calendar", "slug": "calendar", "qty": 200, "sizes": ["Desk Tent Calendar (8.5\" x 6\")", "Wall Calendar (12\" x 18\")"], "materials": ["300 GSM Art Card Sheets + Hard Triangular Strawboard Base"], "finishes": ["Spiral Wire-O Ring", "12 Months Full Color Spread"], "type": "calendar"},
    {"cat": "books-publications", "name": "E-Book Printing", "slug": "e-book-printing", "qty": 50, "sizes": ["A5", "6\" x 9\""], "materials": ["Color Cover 300 GSM + Inner 75 GSM High-Speed Digital"], "finishes": ["Thermal Softcover Binding", "Quick Turnaround"], "type": "booklet"},
    {"cat": "books-publications", "name": "Project Report", "slug": "project-report", "qty": 20, "sizes": ["A4 Standard"], "materials": ["Hardbound Rexine / Golden Embossed + 100 GSM Executive Paper"], "finishes": ["Golden Foil Spine Stamping", "Clear Acetate Guard"], "type": "hardbound"},
    {"cat": "books-publications", "name": "Thesis Printing", "slug": "thesis-printing", "qty": 10, "sizes": ["A4 Academic"], "materials": ["Heavy Deluxe Hardbound Cover + 100 GSM Bond Paper"], "finishes": ["Golden Lettering Embossing", "University Guidelines Compliant"], "type": "hardbound"},

    # 4. Wedding & Invitation (9)
    {"cat": "wedding-invitation", "name": "Wedding Invitation Card", "slug": "wedding-invitation-card", "qty": 250, "sizes": ["Traditional Royal 7\" x 9\"", "8\" x 10\" Multi-Insert"], "materials": ["350 GSM Imported Metallic Board", "Textured Velvet Sheet"], "finishes": ["Deep Gold Hot Foil Stamping", "Laser Cut Lattice", "Coordinated Boxed Envelope"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Engagement Card", "slug": "engagement-card", "qty": 200, "sizes": ["6\" x 8\"", "Square 7\" x 7\""], "materials": ["Pastel Pearlescent Board (300 GSM)"], "finishes": ["Rose Gold Hot Foil", "Embossed Monogram"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Birthday Invitation", "slug": "birthday-invitation", "qty": 100, "sizes": ["5\" x 7\"", "Die-Cut Theme Shape"], "materials": ["300 GSM Art Card", "Gloss Pearl Stock"], "finishes": ["High Gloss UV Glaze", "Vibrant Theme Artwork"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Anniversary Invitation", "slug": "anniversary-invitation", "qty": 100, "sizes": ["5.5\" x 8.5\" Folded"], "materials": ["Silver Shimmer Card (320 GSM)"], "finishes": ["Silver Foil Stamping", "Ribbon Accent"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Invitation Envelope", "slug": "invitation-envelope", "qty": 300, "sizes": ["Custom Coordinated Sizes"], "materials": ["140 GSM Metallic Paper", "Handmade Cotton Rag"], "finishes": ["Die-Cut Flap", "Gold Foil Border"], "type": "envelope"},
    {"cat": "wedding-invitation", "name": "Save The Date Card", "slug": "save-the-date-card", "qty": 150, "sizes": ["4\" x 6\"", "5\" x 7\""], "materials": ["350 GSM Cotton Cardstock"], "finishes": ["Letterpress Impression", "Gold Foil Edge Gilding"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Thank You Card", "slug": "thank-you-card", "qty": 200, "sizes": ["Folded 4\" x 5.5\"", "Flat 4\" x 6\""], "materials": ["300 GSM Uncoated Natural Board"], "finishes": ["Debossed Logo", "Matching Envelope Included"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Greeting Card", "slug": "greeting-card", "qty": 100, "sizes": ["A5 Folded to A6", "5\" x 7\" Folded"], "materials": ["300 GSM Art Board"], "finishes": ["Gloss Thermal Finish", "Score Fold"], "type": "luxury-card"},
    {"cat": "wedding-invitation", "name": "Religious Invitation Card", "slug": "religious-invitation-card", "qty": 250, "sizes": ["Traditional Accordion Fold", "Scroll Format"], "materials": ["Vibrant Saffron / Crimson Shimmer Board"], "finishes": ["Gold Hot Foil Deity Emblem", "Scented Card Finish"], "type": "luxury-card"},

    # 5. Packaging Printing (11)
    {"cat": "packaging-printing", "name": "Paper Bag", "slug": "paper-bag", "qty": 500, "sizes": ["Medium (10\" x 12\" x 4\")", "Small (8\" x 10\" x 3\")"], "materials": ["210 GSM White Art Card", "140 GSM Natural Brown Kraft"], "finishes": ["Twisted Rope Handle", "Reinforced Turnover Top & Base"], "type": "bag"},
    {"cat": "packaging-printing", "name": "Shopping Bag", "slug": "shopping-bag", "qty": 500, "sizes": ["Large (14\" x 16\" x 5\")", "Boutique (12\" x 14\" x 4\")"], "materials": ["250 GSM Luxury Art Board"], "finishes": ["Matte Thermal Lamination", "Grossgrain Ribbon Handle", "Foil Stamped Logo"], "type": "bag"},
    {"cat": "packaging-printing", "name": "Product Box", "slug": "product-box", "qty": 500, "sizes": ["Custom Structural Die-Line per Product"], "materials": ["350 GSM Cyber SBS Board", "Food-Grade White Back Board"], "finishes": ["Auto Crash-Lock Bottom", "Gloss / Matte Coating", "Window Cutout"], "type": "box"},
    {"cat": "packaging-printing", "name": "Cake Box", "slug": "cake-box", "qty": 500, "sizes": ["0.5 Kg (8\" x 8\" x 5\")", "1.0 Kg (10\" x 10\" x 5\")"], "materials": ["350 GSM Food-Grade ITC Board"], "finishes": ["Clear Transparent Window Patch", "Oil/Moisture Barrier"], "type": "box"},
    {"cat": "packaging-printing", "name": "Sweet Box", "slug": "sweet-box", "qty": 500, "sizes": ["250g, 500g, 1kg Traditional Mithai Sizes"], "materials": ["350 GSM SBS Board + Gold Foil Paper Inner Tray"], "finishes": ["Embossed Heritage Motif", "Gold Foil Logo Accent"], "type": "box"},
    {"cat": "packaging-printing", "name": "Food Packaging", "slug": "food-packaging", "qty": 1000, "sizes": ["Meal Trays", "Burger/Sandwich Clamshells"], "materials": ["Certified Food-Grade Poly-Coated Board"], "finishes": ["Leakproof Interlocking Tabs", "Grease Resistant"], "type": "box"},
    {"cat": "packaging-printing", "name": "Product Label", "slug": "pkg-product-label", "qty": 1000, "sizes": ["Custom Bottle / Jar / Pouch Wraparound"], "materials": ["Waterproof Gloss Vinyl", "Metallic Mirror Paper"], "finishes": ["Supplied on Rolls or Sheets", "Permanent Cold-Tack Adhesive"], "type": "sticker"},
    {"cat": "packaging-printing", "name": "Sticker Label", "slug": "sticker-label", "qty": 1000, "sizes": ["Custom Shape Die-Cut"], "materials": ["80 Micron Self-Adhesive Chroma"], "finishes": ["Gloss UV Protected", "Precision Half-Cut"], "type": "sticker"},
    {"cat": "packaging-printing", "name": "Barcode Label", "slug": "barcode-label", "qty": 2000, "sizes": ["50 x 25 mm", "38 x 25 mm (2 Up)"], "materials": ["Thermal Transfer Paper", "Polyester Synthetic"], "finishes": ["Grade-A Scannability", "High Speed Barcode / SKU Print"], "type": "sticker"},
    {"cat": "packaging-printing", "name": "Hang Tag", "slug": "hang-tag", "qty": 1000, "sizes": ["2\" x 3.5\"", "Folded Tag (4\" x 3.5\")"], "materials": ["350 GSM Art Card", "Kraft Board"], "finishes": ["Punched 4mm Hole", "Matte Velvet Touch", "Cotton / Elastic Cord"], "type": "dangler"},
    {"cat": "packaging-printing", "name": "Product Sleeve", "slug": "product-sleeve", "qty": 1000, "sizes": ["Wraparound Belly Band per Container"], "materials": ["250 GSM Art Card"], "finishes": ["Glue Interlock / Double Tape", "Thermal Matte Finish"], "type": "sleeve"},

    # 6. Labels & Stickers (9)
    {"cat": "labels-stickers", "name": "Round Sticker", "slug": "round-sticker", "qty": 1000, "sizes": ["2\" Diameter", "2.5\" Diameter", "3\" Diameter"], "materials": ["Gloss Vinyl", "Chroma Paper"], "finishes": ["Circular Laser Die-Cut", "Easy Peel Backing"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Square Sticker", "slug": "square-sticker", "qty": 1000, "sizes": ["2\" x 2\"", "3\" x 3\"", "4\" x 4\""], "materials": ["Waterproof White Vinyl", "Uncoated Kraft Paper"], "finishes": ["Rounded / Sharp Corners", "UV Barrier"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Transparent Sticker", "slug": "transparent-sticker", "qty": 1000, "sizes": ["Custom Contour", "2.5\" Round"], "materials": ["Ultra-Clear Clear PP Film"], "finishes": ["White Ink Under-Print (No Show-Through)", "100% Water Resistant"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Waterproof Sticker", "slug": "waterproof-sticker", "qty": 1000, "sizes": ["Custom Bottle / Freezer Dimensions"], "materials": ["BOPP Synthetic Polypropylene"], "finishes": ["Freezer & Oil Proof", "Permanent Adhesive"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Vinyl Sticker", "slug": "vinyl-sticker", "qty": 500, "sizes": ["Custom Contour / Kiss-Cut"], "materials": ["100 Micron Premium Flexible Vinyl"], "finishes": ["Outdoor 3-Year Sun UV Resistance", "Scratchproof Lamination"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Logo Sticker", "slug": "logo-sticker", "qty": 1000, "sizes": ["Brand Shape Custom Die-Cut"], "materials": ["Mirror Silver / Gold Vinyl", "Gloss White"], "finishes": ["Metallic Sheen", "Precision Kiss-Cut Sheet"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "QR Code Sticker", "slug": "qr-code-sticker", "qty": 500, "sizes": ["1.5\" x 1.5\"", "2\" x 2\""], "materials": ["High Contrast Matte White Synthetic"], "finishes": ["Instant Scannability (ISO Grade A)", "Direct Payment / URL Code"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Product Label", "slug": "lbl-product-label", "qty": 1000, "sizes": ["Custom Box / Bottle Wrap"], "materials": ["Gloss Cast Coated Self-Adhesive"], "finishes": ["Full CMYK Spectrum", "Roll or Sheet Delivery"], "type": "sticker"},
    {"cat": "labels-stickers", "name": "Warning Label", "slug": "warning-label", "qty": 500, "sizes": ["3\" x 4\"", "Custom Industrial Size"], "materials": ["Fluorescent Yellow / Orange Vinyl", "Tamper Evident Destructible"], "finishes": ["OSHA/ISO Compliant Symbols", "Heavy Industrial Adhesive"], "type": "sticker"},

    # 7. Photo & Digital Printing (8)
    {"cat": "photo-digital-printing", "name": "Photo Printing", "slug": "photo-printing", "qty": 20, "sizes": ["4\" x 6\"", "5\" x 7\"", "8\" x 10\"", "12\" x 18\""], "materials": ["260 GSM Ultra-Gloss Photographic RC Paper"], "finishes": ["High Color Gamut 12-Color Archival Print", "Fingerprint Resistant"], "type": "photo"},
    {"cat": "photo-digital-printing", "name": "Passport Size Photo", "slug": "passport-size-photo", "qty": 32, "sizes": ["35 x 45 mm (Sheet of 8, 16, 32)"], "materials": ["Glossy Photographic Luster Paper"], "finishes": ["White / Light Grey Background", "Official Visa / Passport Specs"], "type": "photo"},
    {"cat": "photo-digital-printing", "name": "Photo Album", "slug": "photo-album", "qty": 1, "sizes": ["12\" x 15\" Karizma", "12\" x 18\" Landscape"], "materials": ["Heavy Non-Tear Lay-Flat Laminated Sheets"], "finishes": ["Leatherette Embossed Cover", "Padded Briefcase Box"], "type": "hardbound"},
    {"cat": "photo-digital-printing", "name": "Photo Frame", "slug": "photo-frame", "qty": 1, "sizes": ["8\" x 10\"", "12\" x 18\"", "16\" x 24\""], "materials": ["High Definition Print + Solid Synthetic Timber Moulding"], "finishes": ["Unbreakable Acrylic Glass", "Rear Hanging Hardware Included"], "type": "frame"},
    {"cat": "photo-digital-printing", "name": "Canvas Printing", "slug": "canvas-printing", "qty": 1, "sizes": ["12\" x 18\"", "18\" x 24\"", "24\" x 36\""], "materials": ["380 GSM Pure Cotton Artist Textured Canvas"], "finishes": ["Stretched on 1-Inch Seasoned Wooden Stretcher Frame", "Museum Gallery Wrap"], "type": "canvas"},
    {"cat": "photo-digital-printing", "name": "Customized Photo Mug", "slug": "customized-photo-mug", "qty": 1, "sizes": ["Standard 11 Oz (325 ml) Ceramic"], "materials": ["Grade-A Ceramic White Coffee Mug"], "finishes": ["Sublimation Photographic Print", "Microwave & Dishwasher Safe"], "type": "mug"},
    {"cat": "photo-digital-printing", "name": "Personalized Gifts", "slug": "personalized-gifts", "qty": 10, "sizes": ["Custom Desk Acrylic Blocks / Pens / Keychains"], "materials": ["Crystal Clear Acrylic / Steel / Wood"], "finishes": ["UV Direct Printing / Laser Engraving", "Gift Presentation Box"], "type": "gift"},
    {"cat": "photo-digital-printing", "name": "PVC Card Printing", "slug": "pvc-card-printing", "qty": 25, "sizes": ["Standard CR80 (86 x 54 mm)"], "materials": ["Heavy Solid PVC Plastic (760 Micron)"], "finishes": ["Dual Sided Photographic Quality", "Waterproof Solid Edge"], "type": "idcard"},

    # 8. School & Educational Printing (10)
    {"cat": "school-educational-printing", "name": "School ID Card", "slug": "school-id-card", "qty": 100, "sizes": ["Standard CR80 (86 x 54 mm)"], "materials": ["Premium Durable Rigid PVC"], "finishes": ["Lanyard with School Name Sublimation", "Transparent Soft Holder"], "type": "idcard"},
    {"cat": "school-educational-printing", "name": "School Diary", "slug": "edu-school-diary", "qty": 300, "sizes": ["Custom School A5 (6\" x 9\")"], "materials": ["Hardbound Strawboard + 70 GSM Superprint"], "finishes": ["School Crest Gold Foil Embossed", "Student Details & Rules Pages"], "type": "hardbound"},
    {"cat": "school-educational-printing", "name": "Marksheet", "slug": "marksheet", "qty": 500, "sizes": ["A4 Standard (210 x 297 mm)"], "materials": ["120 GSM Security Watermark Paper", "100 GSM Maplitho"], "finishes": ["Anti-Copy Guilloche Security Border", "Micro-Text Line", "Tamper Evident"], "type": "certificate"},
    {"cat": "school-educational-printing", "name": "Certificate", "slug": "certificate", "qty": 100, "sizes": ["A4 Landscape (11.7\" x 8.3\")"], "materials": ["250 GSM Royal Executive Board", "300 GSM Alabaster Card"], "finishes": ["Metallic Gold Foil Seal", "Official Ornate Security Border"], "type": "certificate"},
    {"cat": "school-educational-printing", "name": "Question Paper", "slug": "question-paper", "qty": 500, "sizes": ["A4", "Foolscap (8.5\" x 13.5\")"], "materials": ["60 GSM Creamy Maplitho", "70 GSM Sunshine Paper"], "finishes": ["Strict Confidentiality Printing", "Center Folded / Stapled Sets"], "type": "sheet"},
    {"cat": "school-educational-printing", "name": "Admission Form", "slug": "admission-form", "qty": 500, "sizes": ["A4 4-Page Folded", "A4 2-Sided"], "materials": ["100 GSM Bond Paper"], "finishes": ["Clean Form Layout with Photo Box & Counterfoil Tear-off"], "type": "sheet"},
    {"cat": "school-educational-printing", "name": "School Prospectus", "slug": "school-prospectus", "qty": 300, "sizes": ["A4 Multi-Page Brochure (8 - 16 Pages)"], "materials": ["Cover 300 GSM Art Card + Inner 130 GSM Gloss Art"], "finishes": ["Thermal Matte Cover", "Center Saddle Stitch"], "type": "booklet"},
    {"cat": "school-educational-printing", "name": "Exam Pad", "slug": "exam-pad", "qty": 200, "sizes": ["8.5\" x 14\" Standard Examination Clipboard"], "materials": ["3mm Hard Composite Rigid Board"], "finishes": ["High Tensile Chrome Clip", "Full Face School Crest Print"], "type": "board"},
    {"cat": "school-educational-printing", "name": "Student Notebook", "slug": "student-notebook", "qty": 500, "sizes": ["Standard Long Book (A4)", "Small Crown Notebook"], "materials": ["Cover 250 GSM SBS + Inner 64 GSM Bright Paper"], "finishes": ["Single Line / Square / Four Line Grids", "Strong Center Pinning"], "type": "booklet"},
    {"cat": "school-educational-printing", "name": "School Calendar", "slug": "school-calendar", "qty": 300, "sizes": ["Wall Calendar (12\" x 18\")", "Desk Calendar"], "materials": ["220 GSM Art Card Sheets"], "finishes": ["Tin Rim at Top or Spiral Wire-O", "Holiday & Exam Date Highlights"], "type": "calendar"},

    # 9. Restaurant & Hotel Printing (9)
    {"cat": "restaurant-hotel-printing", "name": "Restaurant Menu Card", "slug": "restaurant-menu-card", "qty": 25, "sizes": ["A4 Bi-Fold (4 Page)", "Tall Narrow (5.5\" x 11.5\")", "Tri-Fold"], "materials": ["350 GSM Heavy Board + 125 Micron Thermal Encapsulation"], "finishes": ["100% Waterproof Wipe-Clean Lamination", "Spill-Proof Rigid Finish"], "type": "menu"},
    {"cat": "restaurant-hotel-printing", "name": "Food Menu", "slug": "food-menu", "qty": 50, "sizes": ["A3 Folded to A4", "A4 Single Board"], "materials": ["Synthetic Tear-Proof Polyart Stock (300 Micron)"], "finishes": ["Washable Surface", "Rounded Safety Corners"], "type": "menu"},
    {"cat": "restaurant-hotel-printing", "name": "Table Tent Card", "slug": "table-tent-card", "qty": 50, "sizes": ["4\" x 6\" Freestanding Triangle", "5\" x 7\""], "materials": ["350 GSM SBS Board"], "finishes": ["Die-Cut Interlocking Base Tabs", "Gloss Thermal UV"], "type": "tent"},
    {"cat": "restaurant-hotel-printing", "name": "Bill Book", "slug": "rest-bill-book", "qty": 20, "sizes": ["1/8 Demy (5.5\" x 8.5\")", "Pocket Bill 4\" x 6\""], "materials": ["1+1 Carbonless Duplicate (White + Pink)"], "finishes": ["Sequential Numbering", "Perforated Customer Bill Slip", "Strawboard Base"], "type": "book"},
    {"cat": "restaurant-hotel-printing", "name": "Parcel Sticker", "slug": "parcel-sticker", "qty": 1000, "sizes": ["2\" x 3\" Seal Tape", "2\" Round Sticker"], "materials": ["Gloss Adhesive Paper"], "finishes": ["Tamper-Evident Safety Seal", "Brand Logo & Phone"], "type": "sticker"},
    {"cat": "restaurant-hotel-printing", "name": "Food Label", "slug": "rest-food-label", "qty": 1000, "sizes": ["Custom Box / Container Lid Label"], "materials": ["Moisture Resistant Food-Grade Sticker Paper"], "finishes": ["Veg / Non-Veg Indicator Dot", "Packed Date & Expiry Blank"], "type": "sticker"},
    {"cat": "restaurant-hotel-printing", "name": "Takeaway Menu", "slug": "takeaway-menu", "qty": 1000, "sizes": ["A4 Tri-Fold Pamphlet", "A5 Double Sided Flyer"], "materials": ["130 GSM Gloss Art Paper"], "finishes": ["Vibrant High Speed Press", "Machine Tri-Fold"], "type": "brochure"},
    {"cat": "restaurant-hotel-printing", "name": "Hotel Key Card", "slug": "hotel-key-card", "qty": 100, "sizes": ["Standard CR80 (86 x 54 mm)"], "materials": ["RFID MIFARE / Magnetic HiCo PVC Card"], "finishes": ["High Gloss Card Surface", "Double Sided Hotel Branding"], "type": "idcard"},
    {"cat": "restaurant-hotel-printing", "name": "Room Service Card", "slug": "room-service-card", "qty": 100, "sizes": ["Door Knob Hanger (4\" x 9\")", "Desk Card"], "materials": ["350 GSM Art Board"], "finishes": ["Die-Cut Doorknob Hole & Slit", "Double Sided Breakfast / Do Not Disturb"], "type": "dangler"}
]

cat_map = {c["id"]: c for c in CATEGORIES}

def create_product_mockup(product):
    cat = cat_map[product["cat"]]
    width, height = 800, 600
    
    # 1. Base Studio Background
    img = Image.new('RGB', (width, height), color=(246, 248, 252))
    draw = ImageDraw.Draw(img)
    
    # Soft background gradient & lighting vignette
    for y in range(height):
        ratio = y / height
        r = int(246 - ratio * 14)
        g = int(248 - ratio * 12)
        b = int(252 - ratio * 10)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
        
    # Tabletop / Surface line
    surface_y = 480
    draw.rectangle([0, surface_y, width, height], fill=(235, 239, 245))
    draw.line([0, surface_y, width, surface_y], fill=(215, 222, 232), width=2)
    
    # 2. Header Category Badge Banner
    cat_banner_h = 42
    draw.rectangle([0, 0, width, cat_banner_h], fill=cat["themeColor"])
    font_cat = get_font(13, bold=True)
    draw.text((24, 12), f"PRINTIZER • {cat['name'].upper()} • {cat['gujarati']}", fill=(255, 255, 255), font=font_cat)
    
    # Category badge tag on right
    badge_w = 170
    draw.rounded_rectangle([width - badge_w - 20, 8, width - 20, 34], radius=6, fill=cat["accentColor"])
    font_badge = get_font(11, bold=True)
    draw.text((width - badge_w - 10, 13), cat["badge"], fill=(255, 255, 255), font=font_badge)

    # 3. Product Specific Mockup Shapes
    ptype = product["type"]
    pname = product["name"].upper()
    
    if ptype in ["card", "idcard"]:
        # Card Mockup (Visiting card / ID card)
        cx, cy = 400, 260
        cw, ch = 480, 280
        x1, y1 = cx - cw // 2, cy - ch // 2
        x2, y2 = cx + cw // 2, cy + ch // 2
        
        # Soft drop shadow
        draw.rounded_rectangle([x1 + 8, y1 + 14, x2 + 8, y2 + 14], radius=18, fill=(200, 208, 220))
        # Stacked secondary card underneath
        draw.rounded_rectangle([x1 - 12, y1 - 10, x2 - 12, y2 - 10], radius=16, fill=(240, 242, 248), outline=(210, 218, 230), width=2)
        # Main Card Face
        draw.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(255, 255, 255), outline=(220, 228, 238), width=2)
        
        # Decorative colored accent header strip on card
        draw.rounded_rectangle([x1, y1, x2, y1 + 54], radius=16, fill=cat["themeColor"])
        draw.rectangle([x1, y1 + 38, x2, y1 + 54], fill=cat["themeColor"]) # square bottom corners
        draw.line([x1, y1 + 54, x2, y1 + 54], fill=cat["accentColor"], width=4)
        
        # Card title
        font_card_head = get_font(12, bold=True)
        draw.text((x1 + 24, y1 + 18), "PRINTIZER COMMERCIAL PRINTING SOLUTIONS", fill=(255, 255, 255), font=font_card_head)
        
        # Product Name displayed big on card face
        font_pname = get_font(26, bold=True)
        draw.text((x1 + 30, y1 + 85), pname, fill=(15, 23, 42), font=font_pname)
        
        # Details & Spec text
        font_sub = get_font(13, bold=False)
        draw.text((x1 + 30, y1 + 128), f"Class: {product['materials'][0]} • {product['finishes'][0]}", fill=(100, 116, 139), font=font_sub)
        draw.text((x1 + 30, y1 + 155), f"Sizes: {', '.join(product['sizes'][:2])} | Min Qty: {product['qty']} Units", fill=(100, 116, 139), font=font_sub)
        
        # If ID card, add photo silhouette box and barcode lines
        if ptype == "idcard":
            draw.rounded_rectangle([x2 - 110, y1 + 80, x2 - 25, y1 + 185], radius=8, fill=(241, 245, 249), outline=(203, 213, 225), width=2)
            draw.text((x2 - 95, y1 + 125), "PHOTO", fill=(148, 163, 184), font=get_font(11, bold=True))
            draw.ellipse([cx - 20, y1 + 8, cx + 20, y1 + 24], fill=(226, 232, 240), outline=(148, 163, 184), width=1)
        else:
            draw.rounded_rectangle([x2 - 130, y1 + 80, x2 - 30, y1 + 175], radius=8, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
            font_qr = get_font(10, bold=True)
            draw.text((x2 - 120, y1 + 120), "100% CMYK", fill=(225, 29, 72), font=font_qr)
            draw.text((x2 - 120, y1 + 138), "VERIFIED", fill=(15, 23, 42), font=font_qr)
            
        draw.line([x1 + 30, y2 - 45, x2 - 30, y2 - 45], fill=(226, 232, 240), width=1)
        font_auth = get_font(11, bold=True)
        draw.text((x1 + 30, y2 - 35), "PRINTIZER COMMERCIAL PRINT SPECIFICATION • HIGH FIDELITY PROOF", fill=(148, 163, 184), font=font_auth)

    elif ptype == "book":
        bx, by = 400, 265
        bw, bh = 460, 310
        x1, y1 = bx - bw // 2, by - bh // 2
        x2, y2 = bx + bw // 2, by + bh // 2
        
        # Shadow
        draw.rectangle([x1 + 10, y1 + 12, x2 + 10, y2 + 12], fill=(205, 212, 222))
        # Pink duplicate sheet peek underneath
        draw.rectangle([x1 + 16, y1 + 6, x2 + 16, y2 + 6], fill=(255, 228, 230), outline=(254, 205, 211), width=1)
        # Yellow triplicate sheet peek underneath
        draw.rectangle([x1 + 8, y1 + 3, x2 + 8, y2 + 3], fill=(254, 249, 195), outline=(253, 230, 138), width=1)
        # Main White Ledger Book Page
        draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        
        # Left Binding Spine Tape
        spine_w = 46
        draw.rectangle([x1, y1, x1 + spine_w, y2], fill=(159, 18, 57))
        draw.line([x1 + spine_w, y1, x1 + spine_w, y2], fill=(136, 19, 55), width=2)
        for sy in [y1 + 40, y1 + 150, y2 - 40]:
            draw.rectangle([x1 + 14, sy, x1 + 32, sy + 6], fill=(203, 213, 225), outline=(100, 116, 139), width=1)
            
        perf_x = x1 + spine_w + 14
        for py in range(y1 + 10, y2 - 10, 8):
            draw.line([perf_x, py, perf_x, py + 4], fill=(148, 163, 184), width=1)
            
        fx = perf_x + 20
        font_bh = get_font(18, bold=True)
        draw.text((fx, y1 + 20), pname, fill=(15, 23, 42), font=font_bh)
        
        font_sub = get_font(11, bold=True)
        draw.text((fx, y1 + 48), "PRINTIZER COMMERCIAL PRINTING & GRAPHIC SOLUTIONS", fill=(100, 116, 139), font=font_sub)
        
        font_no = get_font(13, bold=True)
        draw.text((x2 - 110, y1 + 20), "No. 04821", fill=(225, 29, 72), font=font_no)
        draw.text((x2 - 110, y1 + 42), "Date: ___/___/2026", fill=(100, 116, 139), font=get_font(11, bold=False))
        
        draw.text((fx, y1 + 75), "M/s. ____________________________________________________", fill=(148, 163, 184), font=get_font(12, bold=False))
        
        ty1 = y1 + 105
        ty2 = y2 - 50
        draw.rectangle([fx, ty1, x2 - 20, ty2], fill=(248, 250, 252), outline=(148, 163, 184), width=1)
        draw.rectangle([fx, ty1, x2 - 20, ty1 + 26], fill=(226, 232, 240), outline=(148, 163, 184), width=1)
        font_th = get_font(10, bold=True)
        draw.text((fx + 8, ty1 + 6), "SR", fill=(15, 23, 42), font=font_th)
        draw.text((fx + 45, ty1 + 6), "PARTICULARS / ITEM DESCRIPTION", fill=(15, 23, 42), font=font_th)
        draw.text((x2 - 150, ty1 + 6), "QTY", fill=(15, 23, 42), font=font_th)
        draw.text((x2 - 105, ty1 + 6), "RATE", fill=(15, 23, 42), font=font_th)
        draw.text((x2 - 60, ty1 + 6), "AMOUNT", fill=(15, 23, 42), font=font_th)
        
        draw.line([fx + 35, ty1, fx + 35, ty2], fill=(203, 213, 225), width=1)
        draw.line([x2 - 160, ty1, x2 - 160, ty2], fill=(203, 213, 225), width=1)
        draw.line([x2 - 115, ty1, x2 - 115, ty2], fill=(203, 213, 225), width=1)
        draw.line([x2 - 70, ty1, x2 - 70, ty2], fill=(203, 213, 225), width=1)
        
        for hy in range(ty1 + 52, ty2, 26):
            draw.line([fx, hy, x2 - 20, hy], fill=(226, 232, 240), width=1)
            
        draw.text((fx + 10, y2 - 32), "Customer Sign: _____________", fill=(100, 116, 139), font=get_font(10, bold=True))
        draw.text((x2 - 160, y2 - 32), "For PRINTIZER: _____________", fill=(100, 116, 139), font=get_font(10, bold=True))

    elif ptype in ["box", "cake-box"]:
        bx, by = 400, 270
        bw, bh, bd = 280, 240, 90
        
        draw.polygon([(bx - bw//2 + 20, by + bh//2 + 10), (bx + bw//2 + bd + 10, by + bh//2 + 10), (bx + bw//2 + bd - 30, by + bh//2 + 30), (bx - bw//2 - 20, by + bh//2 + 30)], fill=(205, 214, 225))
        
        x1, y1 = bx - bw//2, by - bh//2 + 40
        x2, y2 = bx + bw//2, by + bh//2 + 40
        draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        draw.polygon([(x2, y1), (x2 + bd, y1 - 45), (x2 + bd, y2 - 45), (x2, y2)], fill=(235, 240, 248), outline=(203, 213, 225))
        draw.polygon([(x1, y1), (x1 + bd, y1 - 45), (x2 + bd, y1 - 45), (x2, y1)], fill=(245, 248, 253), outline=(203, 213, 225))
        
        draw.rectangle([x1 + 20, y1 + 20, x2 - 20, y1 + 65], fill=cat["themeColor"])
        draw.text((x1 + 35, y1 + 32), "PRINTIZER CUSTOM PACKAGING", fill=(255, 255, 255), font=get_font(11, bold=True))
        
        font_pname = get_font(20, bold=True)
        draw.text((x1 + 25, y1 + 90), pname, fill=(15, 23, 42), font=font_pname)
        
        font_spec = get_font(11, bold=False)
        draw.text((x1 + 25, y1 + 130), f"Stock: {product['materials'][0]}", fill=(100, 116, 139), font=font_spec)
        draw.text((x1 + 25, y1 + 155), f"Finish: {product['finishes'][0]}", fill=(100, 116, 139), font=font_spec)
        
        if "cake" in product["slug"] or "sweet" in product["slug"]:
            draw.rounded_rectangle([x1 + 45, y1 + 190, x2 - 45, y2 - 25], radius=12, fill=(241, 245, 249), outline=cat["accentColor"], width=2)
            draw.text((x1 + 65, y1 + 205), "TRANSPARENT WINDOW PATCH", fill=cat["accentColor"], font=get_font(9, bold=True))

    elif ptype == "bag":
        bx, by = 400, 280
        bw, bh, bd = 290, 290, 80
        x1, y1 = bx - bw//2, by - bh//2 + 30
        x2, y2 = bx + bw//2, by + bh//2 + 30
        
        draw.polygon([(x1 + 10, y2 + 10), (x2 + bd + 10, y2 + 10), (x2 + bd - 20, y2 + 25), (x1 - 10, y2 + 25)], fill=(205, 212, 222))
        draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        draw.polygon([(x2, y1), (x2 + bd, y1 - 40), (x2 + bd, y2 - 40), (x2, y2)], fill=(238, 242, 248), outline=(203, 213, 225))
        draw.rectangle([x1, y1, x2, y1 + 35], fill=cat["themeColor"])
        
        hx1, hx2 = bx - 55, bx + 55
        handle_top = y1 - 70
        draw.arc([hx1 - 40, handle_top, hx1 + 40, y1 + 20], start=180, end=360, fill=(180, 83, 9), width=5)
        draw.arc([hx2 - 40, handle_top, hx2 + 40, y1 + 20], start=180, end=360, fill=(180, 83, 9), width=5)
        draw.ellipse([hx1 - 6, y1 + 15, hx1 + 6, y1 + 27], fill=(217, 119, 6))
        draw.ellipse([hx2 - 6, y1 + 15, hx2 + 6, y1 + 27], fill=(217, 119, 6))
        
        font_pname = get_font(22, bold=True)
        draw.text((bx - 120, y1 + 80), pname, fill=(15, 23, 42), font=font_pname)
        
        font_tag = get_font(12, bold=True)
        draw.text((bx - 120, y1 + 120), "PRINTIZER LUXURY PACKAGING", fill=cat["accentColor"], font=font_tag)
        draw.text((bx - 120, y1 + 150), f"• {product['materials'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((bx - 120, y1 + 175), f"• {product['finishes'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((bx - 120, y1 + 200), "• Reinforced Turn-top & Base", fill=(100, 116, 139), font=get_font(11, bold=False))

    elif ptype == "sticker":
        draw.rounded_rectangle([220, 100, 580, 420], radius=16, fill=(245, 248, 252), outline=(203, 213, 225), width=2)
        for gx in range(250, 560, 40):
            draw.line([gx, 100, gx, 420], fill=(235, 240, 248), width=1)
        for gy in range(130, 400, 40):
            draw.line([220, gy, 580, gy], fill=(235, 240, 248), width=1)
            
        if "round" in product["slug"] or "circle" in product["name"].lower():
            cx, cy, r = 400, 260, 120
            draw.ellipse([cx - r + 8, cy - r + 8, cx + r + 8, cy + r + 8], fill=(210, 218, 228))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255), outline=cat["accentColor"], width=3)
            font_st = get_font(16, bold=True)
            draw.text((cx - 85, cy - 40), "PRINTIZER", fill=cat["themeColor"], font=get_font(20, bold=True))
            draw.text((cx - 95, cy + 5), pname, fill=(15, 23, 42), font=font_st)
            draw.text((cx - 75, cy + 40), "100% WATERPROOF", fill=cat["accentColor"], font=get_font(10, bold=True))
        elif "warning" in product["slug"]:
            x1, y1, x2, y2 = 260, 130, 540, 390
            draw.rectangle([x1 + 6, y1 + 6, x2 + 6, y2 + 6], fill=(210, 218, 228))
            draw.rectangle([x1, y1, x2, y2], fill=(254, 240, 138), outline=(234, 179, 8), width=4)
            draw.rectangle([x1 + 10, y1 + 10, x2 - 10, y1 + 55], fill=(220, 38, 38))
            draw.text((x1 + 80, y1 + 20), "WARNING / CAUTION", fill=(255, 255, 255), font=get_font(16, bold=True))
            draw.text((x1 + 25, y1 + 80), pname, fill=(15, 23, 42), font=get_font(20, bold=True))
            draw.text((x1 + 25, y1 + 120), "INDUSTRIAL TAMPER-EVIDENT SPECIFICATION", fill=(100, 116, 139), font=get_font(11, bold=True))
            draw.text((x1 + 25, y1 + 150), "PRINTIZER COMMERCIAL PRINT LABELS", fill=(15, 23, 42), font=get_font(11, bold=True))
        else:
            x1, y1, x2, y2 = 270, 130, 530, 390
            draw.rounded_rectangle([x1 + 8, y1 + 8, x2 + 8, y2 + 8], radius=16, fill=(210, 218, 228))
            draw.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(255, 255, 255), outline=cat["accentColor"], width=3)
            draw.polygon([(x2 - 35, y1), (x2, y1 + 35), (x2 - 35, y1 + 35)], fill=(226, 232, 240), outline=(203, 213, 225))
            
            draw.text((x1 + 25, y1 + 45), "PRINTIZER LABELS", fill=cat["themeColor"], font=get_font(14, bold=True))
            draw.text((x1 + 25, y1 + 80), pname, fill=(15, 23, 42), font=get_font(20, bold=True))
            draw.text((x1 + 25, y1 + 130), f"• {product['materials'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
            draw.text((x1 + 25, y1 + 160), f"• {product['finishes'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
            draw.text((x1 + 25, y1 + 190), "• Easy-Peel Adhesive Backing", fill=cat["accentColor"], font=get_font(11, bold=True))

    elif ptype == "standee":
        bx = 400
        draw.rounded_rectangle([bx - 120, 440, bx + 120, 470], radius=8, fill=(203, 213, 225), outline=(148, 163, 184), width=2)
        draw.rectangle([bx - 110, 465, bx - 80, 480], fill=(148, 163, 184))
        draw.rectangle([bx + 80, 465, bx + 110, 480], fill=(148, 163, 184))
        
        x1, y1 = bx - 100, 90
        x2, y2 = bx + 100, 440
        draw.rectangle([x1 + 6, y1 + 6, x2 + 6, y2], fill=(210, 218, 228))
        draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255), outline=(148, 163, 184), width=2)
        
        draw.rectangle([x1, y1, x2, y1 + 80], fill=cat["themeColor"])
        draw.text((x1 + 15, y1 + 25), "PRINTIZER", fill=(255, 255, 255), font=get_font(18, bold=True))
        draw.text((x1 + 15, y1 + 52), "COMMERCIAL DISPLAYS", fill=cat["accentColor"], font=get_font(10, bold=True))
        
        draw.text((x1 + 15, y1 + 120), pname, fill=(15, 23, 42), font=get_font(16, bold=True))
        draw.text((x1 + 15, y1 + 160), "High-Impact Visuals", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((x1 + 15, y1 + 185), "1200 DPI Photo Print", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((x1 + 15, y1 + 210), "Non-Tear Polyroll", fill=cat["accentColor"], font=get_font(11, bold=True))
        
        draw.rectangle([x1, y2 - 40, x2, y2], fill=cat["accentColor"])
        draw.text((x1 + 20, y2 - 28), "CALL +91 98983 51920", fill=(255, 255, 255), font=get_font(10, bold=True))

    elif ptype == "hardbound":
        bx, by = 400, 260
        bw, bh = 340, 320
        x1, y1 = bx - bw // 2, by - bh // 2
        x2, y2 = bx + bw // 2, by + bh // 2
        
        draw.rectangle([x1 + 12, y1 + 12, x2 + 12, y2 + 12], fill=(205, 212, 222))
        draw.rounded_rectangle([x1, y1, x2, y2], radius=10, fill=cat["themeColor"], outline=(15, 23, 42), width=2)
        draw.line([x1 + 35, y1, x1 + 35, y2], fill=(255, 255, 255, 60), width=3)
        draw.rounded_rectangle([x1 + 50, y1 + 25, x2 - 25, y2 - 25], radius=6, outline=(217, 119, 6), width=2)
        
        draw.text((bx - 50, y1 + 60), "PRINTIZER", fill=(245, 158, 11), font=get_font(18, bold=True))
        draw.text((bx - 70, y1 + 95), "2026 EDITION", fill=(254, 240, 138), font=get_font(12, bold=True))
        
        font_pname = get_font(18, bold=True)
        draw.text((x1 + 65, y1 + 150), pname, fill=(255, 255, 255), font=font_pname)
        draw.text((x1 + 65, y1 + 195), f"Binding: {product['materials'][0]}", fill=(203, 213, 225), font=get_font(11, bold=False))
        draw.text((x1 + 65, y1 + 220), f"Finish: {product['finishes'][0]}", fill=(203, 213, 225), font=get_font(11, bold=False))
        draw.polygon([(bx + 40, y1), (bx + 60, y1), (bx + 15, y2 + 25), (bx - 5, y2 + 25)], fill=(225, 29, 72))

    elif ptype == "luxury-card":
        bx, by = 400, 260
        bw, bh = 460, 290
        x1, y1 = bx - bw // 2, by - bh // 2
        x2, y2 = bx + bw // 2, by + bh // 2
        
        draw.rounded_rectangle([x1 + 8, y1 + 12, x2 + 8, y2 + 12], radius=16, fill=(210, 218, 228))
        draw.rounded_rectangle([x1, y1, x2, y2], radius=14, fill=(255, 252, 245), outline=(217, 119, 6), width=2)
        draw.rounded_rectangle([x1 + 14, y1 + 14, x2 - 14, y2 - 14], radius=10, outline=(217, 119, 6), width=2)
        draw.rounded_rectangle([x1 + 20, y1 + 20, x2 - 20, y2 - 20], radius=8, outline=(245, 158, 11), width=1)
        
        draw.text((bx - 45, y1 + 35), "✦ ❖ ✦", fill=(217, 119, 6), font=get_font(18, bold=True))
        draw.text((bx - 120, y1 + 70), "PRINTIZER LUXURY INVITATIONS", fill=(136, 19, 55), font=get_font(13, bold=True))
        
        font_pname = get_font(22, bold=True)
        draw.text((bx - 140, y1 + 115), pname, fill=(159, 18, 57), font=font_pname)
        draw.text((bx - 150, y1 + 165), f"Material: {product['materials'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((bx - 150, y1 + 190), f"Embellishment: {product['finishes'][0]}", fill=(100, 116, 139), font=get_font(11, bold=False))
        draw.text((bx - 150, y1 + 215), "Coordinated Luxury Envelopes Included", fill=(217, 119, 6), font=get_font(11, bold=True))

    else:
        bx, by = 400, 260
        bw, bh = 460, 290
        x1, y1 = bx - bw // 2, by - bh // 2
        x2, y2 = bx + bw // 2, by + bh // 2
        
        draw.rounded_rectangle([x1 + 8, y1 + 12, x2 + 8, y2 + 12], radius=14, fill=(210, 218, 228))
        draw.rounded_rectangle([x1, y1, x2, y2], radius=14, fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        
        draw.rounded_rectangle([x1, y1, x2, y1 + 50], radius=14, fill=cat["themeColor"])
        draw.rectangle([x1, y1 + 35, x2, y1 + 50], fill=cat["themeColor"])
        draw.text((x1 + 25, y1 + 16), f"PRINTIZER COMMERCIAL SPECIFICATION", fill=(255, 255, 255), font=get_font(12, bold=True))
        
        draw.text((x1 + 30, y1 + 80), pname, fill=(15, 23, 42), font=get_font(24, bold=True))
        draw.text((x1 + 30, y1 + 125), f"Category: {cat['name']} ({cat['gujarati']})", fill=cat["accentColor"], font=get_font(13, bold=True))
        draw.text((x1 + 30, y1 + 160), f"Standard Materials: {product['materials'][0]}", fill=(100, 116, 139), font=get_font(12, bold=False))
        draw.text((x1 + 30, y1 + 188), f"Finishes: {product['finishes'][0]}", fill=(100, 116, 139), font=get_font(12, bold=False))
        draw.text((x1 + 30, y1 + 216), f"Available Sizes: {', '.join(product['sizes'][:2])}", fill=(100, 116, 139), font=get_font(12, bold=False))
        
        draw.line([x1 + 30, y2 - 40, x2 - 30, y2 - 40], fill=(226, 232, 240), width=1)
        draw.text((x1 + 30, y2 - 30), "PRINTIZER COMMERCIAL PRINT QUALITY • 100% CMYK CALIBRATED", fill=(148, 163, 184), font=get_font(10, bold=True))

    # 4. Paste PRINTIZER Logo on top-right of the mockup
    if brand_logo:
        lw, lh = 140, int(140 * brand_logo.height / brand_logo.width)
        scaled_logo = brand_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        img.paste(scaled_logo, (width - lw - 30, 55), scaled_logo)

    # 5. Bottom Verification Ribbon
    bottom_h = 32
    draw.rectangle([0, height - bottom_h, width, height], fill=(15, 23, 42))
    font_foot = get_font(11, bold=True)
    draw.text((24, height - bottom_h + 9), "PRINTIZER™ OFFICIAL SAMPLE • 100% CMYK ACCURACY • BESPOKE B2B QUOTATION MODEL", fill=(203, 213, 225), font=font_foot)
    draw.text((width - 180, height - bottom_h + 9), "WhatsApp: +91 98983 51920", fill=(52, 211, 153), font=font_foot)

    return img

# Execute Generation
print("Starting generation of 95 product images...")

generated_products = []
for idx, p in enumerate(RAW_PRODUCTS_DATA):
    img = create_product_mockup(p)
    filename = f"{p['slug']}.webp"
    save_path = os.path.join(PRODUCTS_IMG_DIR, filename)
    upload_path = os.path.join(UPLOADS_DIR, filename)
    
    img.save(save_path, "WEBP", quality=90)
    img.save(upload_path, "WEBP", quality=90)
    
    cat = cat_map[p["cat"]]
    full_product = {
        "id": f"prd-{p['slug']}",
        "name": p["name"],
        "slug": p["slug"],
        "categoryId": p["cat"],
        "categoryName": cat["name"],
        "tagline": f"Premium custom printed {p['name'].lower()} with high-grade finishes.",
        "description": f"Custom {p['name']} printed with precision CMYK color calibration, professional {p['finishes'][0].lower()}, and robust material quality. Designed for commercial, corporate, and retail excellence.",
        "minQuantity": p["qty"],
        "image": f"/images/products/{filename}",
        "secondaryImages": [f"/images/products/{filename}"],
        "standardSizes": p["sizes"],
        "materials": p["materials"],
        "finishes": p["finishes"],
        "featured": idx < 8
    }
    generated_products.append(full_product)
    if (idx + 1) % 15 == 0 or idx == len(RAW_PRODUCTS_DATA) - 1:
        print(f"Generated {idx + 1} / {len(RAW_PRODUCTS_DATA)} product images...")

# Generate Category Banner Images
print("Generating 9 category banner images...")
generated_categories = []
for c in CATEGORIES:
    cat_filename = f"{c['id']}.webp"
    cat_save_path = os.path.join(CATEGORIES_IMG_DIR, cat_filename)
    cat_upload_path = os.path.join(UPLOADS_DIR, cat_filename)
    
    cw, ch = 1000, 750
    cimg = Image.new('RGB', (cw, ch), color=c["themeColor"])
    cdraw = ImageDraw.Draw(cimg)
    
    for y in range(ch):
        ratio = y / ch
        r = int(c["themeColor"][0] * (1 - ratio * 0.4))
        g = int(c["themeColor"][1] * (1 - ratio * 0.4))
        b = int(c["themeColor"][2] * (1 - ratio * 0.4))
        cdraw.line([(0, y), (cw, y)], fill=(r, g, b))
        
    cdraw.rounded_rectangle([60, 60, cw - 60, ch - 60], radius=24, outline=c["accentColor"], width=3)
    
    cdraw.text((100, 120), "PRINTIZER COMMERCIAL SOLUTIONS", fill=c["accentColor"], font=get_font(18, bold=True))
    cdraw.text((100, 160), c["name"], fill=(255, 255, 255), font=get_font(42, bold=True))
    cdraw.text((100, 225), c["gujarati"], fill=(254, 240, 138), font=get_font(28, bold=True))
    
    words = c["description"].split()
    line1 = " ".join(words[:10])
    line2 = " ".join(words[10:])
    cdraw.text((100, 290), line1, fill=(226, 232, 240), font=get_font(18, bold=False))
    cdraw.text((100, 320), line2, fill=(226, 232, 240), font=get_font(18, bold=False))
    
    cat_prods = [p for p in generated_products if p["categoryId"] == c["id"]]
    cdraw.rounded_rectangle([100, 390, 380, 445], radius=12, fill=c["accentColor"])
    cdraw.text((120, 405), f"CATALOGUE: {len(cat_prods)} PRODUCTS", fill=(255, 255, 255), font=get_font(16, bold=True))
    
    if brand_logo:
        lw, lh = 220, int(220 * brand_logo.height / brand_logo.width)
        scaled_logo = brand_logo.resize((lw, lh), Image.Resampling.LANCZOS)
        cimg.paste(scaled_logo, (cw - lw - 100, 120), scaled_logo)
        
    cimg.save(cat_save_path, "WEBP", quality=90)
    cimg.save(cat_upload_path, "WEBP", quality=90)
    
    generated_categories.append({
        "id": c["id"],
        "name": c["name"],
        "gujarati": c["gujarati"],
        "description": c["description"],
        "badge": c["badge"],
        "image": f"/images/categories/{cat_filename}",
        "productCount": len(cat_prods)
    })

# Save to data/printizer.json
print(f"Saving updated database to {DB_FILE}...")
final_db = {
    "categories": generated_categories,
    "products": generated_products,
    "enquiries": [],
    "admin": {
        "username": "admin",
        "email": "Printizerdesign@gmail.com",
        "brand": "PRINTIZER",
        "tagline": "Everything Your Business Needs to Print.",
        "phone": "+91 98983 51920",
        "website": "https://Printizer.in"
    }
}

# Preserve existing enquiries if any
if os.path.exists(DB_FILE):
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
            if "enquiries" in old_data and len(old_data["enquiries"]) > 0:
                final_db["enquiries"] = old_data["enquiries"]
    except Exception as e:
        print("Note reading old enquiries:", e)

with open(DB_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_db, f, indent=2, ensure_ascii=False)

print(f"SUCCESS! Created {len(generated_categories)} categories and {len(generated_products)} products with branded sample photos!")
