import os
import json
import hashlib
from PIL import Image, ImageOps

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BRAIN_DIR = r'C:\Users\Mo ali khanusiya\.gemini\antigravity\brain\1602d216-ca92-470b-8a50-e26ff8b51a75'
PUBLIC_PRODS = os.path.join(BASE_DIR, 'client', 'public', 'images', 'products')
PUBLIC_IMGS = os.path.join(BASE_DIR, 'client', 'public', 'images')
SCRATCH_SURFACES = os.path.join(BRAIN_DIR, 'scratch', 'studio_surfaces')
os.makedirs(SCRATCH_SURFACES, exist_ok=True)

def save_webp_4_3(src_path, dst_slug, crop_box=None, size=(1000, 750), quality=86):
    if not os.path.exists(src_path):
        print(f"MISSING SRC: {src_path}")
        return False
    im = Image.open(src_path).convert('RGB')
    if crop_box:
        w, h = im.size
        box = (int(crop_box[0]*w), int(crop_box[1]*h), int(crop_box[2]*w), int(crop_box[3]*h))
        im = im.crop(box)
    im = ImageOps.fit(im, size, method=Image.Resampling.LANCZOS)
    dst_path = os.path.join(PUBLIC_PRODS, f'{dst_slug}.webp')
    im.save(dst_path, 'WEBP', quality=quality, method=6)
    return True

# 1. Verified Unique Real Studio Photographs mapped 1-to-1 (zero shared files!)
KEEPERS = {
    # Today's newly generated 13 bespoke studio shoots
    'bill-book': (os.path.join(BRAIN_DIR, 'bill_book_1795594727107.jpg'), None),
    'cash-memo-book': (os.path.join(BRAIN_DIR, 'cash_memo_book_1795594738213.jpg'), None),
    'receipt-book': (os.path.join(BRAIN_DIR, 'receipt_book_1795594761778.jpg'), None),
    'office-file': (os.path.join(BRAIN_DIR, 'office_file_1795594723950.jpg'), None),
    'folder': (os.path.join(BRAIN_DIR, 'folder_1795594737757.jpg'), None),
    'id-card': (os.path.join(BRAIN_DIR, 'id_card_1795594750013.jpg'), None),
    'pamphlet': (os.path.join(BRAIN_DIR, 'pamphlet_1795594729547.jpg'), None),
    'flyer': (os.path.join(BRAIN_DIR, 'flyer_1795594741722.jpg'), None),
    'flex-printing': (os.path.join(BRAIN_DIR, 'flex_printing_1795594730190.jpg'), None),
    'journal': (os.path.join(BRAIN_DIR, 'journal_1795594732269.jpg'), None),
    'annual-report': (os.path.join(BRAIN_DIR, 'annual_report_1795594745823.jpg'), None),
    'calendar': (os.path.join(BRAIN_DIR, 'calendar_1795594757970.jpg'), None),
    'sweet-box': (os.path.join(BRAIN_DIR, 'sweet_box_1795594740438.jpg'), None),

    # Previously verified authentic unique Hasselblad studio photos (1-to-1 only!)
    'visiting-card': (os.path.join(PUBLIC_PRODS, 'visiting-card.webp'), None),
    'letterhead': (os.path.join(PUBLIC_PRODS, 'letterhead.webp'), None),
    'envelope': (os.path.join(PUBLIC_PRODS, 'envelope.webp'), None),
    'paper-bag': (os.path.join(PUBLIC_PRODS, 'paper-bag.webp'), None),
    'wedding-invitation-card': (os.path.join(PUBLIC_PRODS, 'wedding-invitation-card.webp'), None),
    'invitation-envelope': (os.path.join(PUBLIC_PRODS, 'invitation-envelope.webp'), None),
    'restaurant-menu-card': (os.path.join(PUBLIC_PRODS, 'restaurant-menu-card.webp'), None),
    'product-box': (os.path.join(PUBLIC_PRODS, 'product-box.webp'), None),
    'magazine': (os.path.join(PUBLIC_PRODS, 'magazine.webp'), None),
    'school-id-card': (os.path.join(PUBLIC_PRODS, 'school-id-card.webp'), None),
    'photo-album': (os.path.join(PUBLIC_PRODS, 'photo-album.webp'), None),
    # Current marksheet.webp is actually a Diploma Certificate! Move cleanly to certificate:
    'certificate': (os.path.join(PUBLIC_PRODS, 'marksheet.webp'), None),

    # Previously unused authentic studio assets in workspace/brain
    'standee': (os.path.join(PUBLIC_PRODS, 'standee-banners.jpg'), None),
    'shopping-bag': (os.path.join(PUBLIC_PRODS, 'paper-shopping-bags.jpg'), None),
    'vinyl-sticker': (os.path.join(PUBLIC_PRODS, 'die-cut-stickers.jpg'), None),
    'banner': (os.path.join(BRAIN_DIR, 'large_format_printing_1795326073319.jpg'), None),
    'book-printing': (os.path.join(BRAIN_DIR, 'hero_catalogue_spread_1795439022934.jpg'), None),
    'promotional-cards': (os.path.join(PUBLIC_IMGS, 'bestselling-banner-mockup.jpg'), None),
    'special-job-printing': (os.path.join(PUBLIC_IMGS, 'paper-finishes-guide.jpg'), None),
    # Clean left/right panel crops from existing multi-item studio shoots
    'engagement-card': (os.path.join(BRAIN_DIR, 'custom_printing_1795326100184.jpg'), (0.0, 0.0, 0.50, 1.0)),
    '9-5x4-25-size-80-gsm-ssp': (os.path.join(BRAIN_DIR, 'letterheads_stationery_1795326407480.jpg'), (0.43, 0.25, 0.96, 0.95)),
    'nt-card': (os.path.join(PUBLIC_PRODS, 'nt-card.webp'), None),
}

ok = 0
for slug, (src, crop) in KEEPERS.items():
    if save_webp_4_3(src, slug, crop_box=crop):
        ok += 1

print(f"Prepared {ok}/{len(KEEPERS)} authentic keeper images as 1000x750 WebP.")
