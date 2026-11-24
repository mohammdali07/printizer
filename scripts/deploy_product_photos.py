import json
import os
from PIL import Image

BASE_DIR = 'e:/projects/PRINTIZER PROJECT'
ARTIFACTS_DIR = 'C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75'
PRODUCTS_DIR = os.path.join(BASE_DIR, 'client/public/images/products')
DB_PATH = os.path.join(BASE_DIR, 'data/printizer.json')

os.makedirs(PRODUCTS_DIR, exist_ok=True)

# High-resolution source photoshoot images
SOURCES = {
    'visiting_cards_stack': os.path.join(ARTIFACTS_DIR, 'business_printing_1795325965779.jpg'),
    'stationery_flatlay': os.path.join(ARTIFACTS_DIR, 'business_stationery_photo_1795511512448.jpg'),
    'letterhead_desk': os.path.join(ARTIFACTS_DIR, 'letterheads_stationery_1795326407480.jpg'),
    'gold_foil_cards': os.path.join(BASE_DIR, 'images/products/gold-foil.webp'),
    'silver_foil_cards': os.path.join(BASE_DIR, 'images/products/silver-foil.webp'),
    'matt_card_uv': os.path.join(BASE_DIR, 'images/products/matt-card-uv.webp'),
    'round_cut_uv': os.path.join(BASE_DIR, 'images/products/round-cut-uv.webp'),
    'drip_off_cards': os.path.join(BASE_DIR, 'images/products/drip-off-nt.webp'),
    'promotional_flyers': os.path.join(ARTIFACTS_DIR, 'promotional_flyers_1795326438117.jpg'),
    'brochures_open': os.path.join(ARTIFACTS_DIR, 'marketing_printing_1795325986002.jpg'),
    'books_editorial': os.path.join(ARTIFACTS_DIR, 'books_publications_photo_1795511563817.jpg'),
    'wedding_suite': os.path.join(ARTIFACTS_DIR, 'wedding_invitations_photo_1795511606025.jpg'),
    'packaging_boxes': os.path.join(ARTIFACTS_DIR, 'packaging_boxes_1795326463808.jpg'),
    'packaging_suite': os.path.join(ARTIFACTS_DIR, 'packaging_printing_1795326020705.jpg'),
    'shopping_bags': os.path.join(ARTIFACTS_DIR, 'paper_shopping_bags_1795326497163.jpg'),
    'stickers_roll_peel': os.path.join(ARTIFACTS_DIR, 'stickers_labels_1795326042221.jpg'),
    'stickers_die_cut': os.path.join(ARTIFACTS_DIR, 'die_cut_stickers_1795326526752.jpg'),
    'photo_calendars': os.path.join(ARTIFACTS_DIR, 'photo_gifts_calendars_1795439043099.jpg'),
    'school_educational': os.path.join(ARTIFACTS_DIR, 'school_educational_photo_1795511638096.jpg'),
    'restaurant_hospitality': os.path.join(ARTIFACTS_DIR, 'restaurant_hotel_photo_1795511669323.jpg')
}

# Verify all sources exist
for k, p in SOURCES.items():
    if not os.path.exists(p):
        print(f"WARNING: Source '{k}' missing at {p}")

def crop_and_save(src_key, dest_filename, crop_box=None):
    src_path = SOURCES[src_key]
    im = Image.open(src_path).convert('RGB')
    if crop_box:
        w, h = im.size
        # crop_box as percentages (left, top, right, bottom)
        l = int(crop_box[0] * w)
        t = int(crop_box[1] * h)
        r = int(crop_box[2] * w)
        b = int(crop_box[3] * h)
        im = im.crop((l, t, r, b))
    
    # Target 800x600 (4:3)
    target_w, target_h = 800, 600
    target_ratio = target_w / target_h
    src_w, src_h = im.size
    src_ratio = src_w / src_h
    
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        offset = (src_w - new_w) // 2
        im = im.crop((offset, 0, offset + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        offset = (src_h - new_h) // 2
        im = im.crop((0, offset, src_w, offset + new_h))
    
    im_final = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
    out_p = os.path.join(PRODUCTS_DIR, dest_filename)
    im_final.save(out_p, 'WEBP', quality=92)
    return f"/images/products/{dest_filename}"

# Load DB
with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

updated_count = 0
for prod in db['products']:
    slug = prod['slug']
    cat = prod['categoryId']
    name = prod['name'].lower()
    
    # Determine the best photographic source and crop for each product
    if cat == 'business-stationery':
        if 'visiting' in name or 'card' in name:
            if 'gold' in name:
                crop_and_save('gold_foil_cards', f"{slug}.webp")
            elif 'silver' in name:
                crop_and_save('silver_foil_cards', f"{slug}.webp")
            elif 'round' in name:
                crop_and_save('round_cut_uv', f"{slug}.webp")
            elif 'matt' in name or 'uv' in name:
                crop_and_save('matt_card_uv', f"{slug}.webp")
            elif 'drip' in name or 'nt' in name:
                crop_and_save('drip_off_cards', f"{slug}.webp")
            else:
                crop_and_save('visiting_cards_stack', f"{slug}.webp")
        elif 'letterhead' in name:
            crop_and_save('letterhead_desk', f"{slug}.webp", (0.0, 0.0, 0.75, 0.85))
        elif 'envelope' in name:
            crop_and_save('stationery_flatlay', f"{slug}.webp", (0.45, 0.55, 0.95, 0.95))
        elif 'folder' in name or 'file' in name:
            crop_and_save('stationery_flatlay', f"{slug}.webp", (0.55, 0.25, 0.98, 0.75))
        elif 'id' in name:
            crop_and_save('school_educational', f"{slug}.webp", (0.55, 0.1, 0.9, 0.45))
        elif 'book' in name or 'memo' in name or 'voucher' in name or 'receipt' in name or 'challan' in name:
            crop_and_save('stationery_flatlay', f"{slug}.webp", (0.3, 0.15, 0.72, 0.65))
        elif 'certificate' in name:
            crop_and_save('school_educational', f"{slug}.webp", (0.05, 0.05, 0.65, 0.65))
        else:
            crop_and_save('stationery_flatlay', f"{slug}.webp")
            
    elif cat == 'marketing-advertising':
        if 'brochure' in name:
            crop_and_save('brochures_open', f"{slug}.webp")
        elif 'flyer' in name or 'pamphlet' in name:
            crop_and_save('promotional_flyers', f"{slug}.webp", (0.3, 0.15, 0.98, 0.85))
        elif 'poster' in name:
            crop_and_save('promotional_flyers', f"{slug}.webp", (0.05, 0.15, 0.65, 0.85))
        elif 'standee' in name or 'banner' in name or 'flex' in name or 'sunboard' in name:
            crop_and_save('promotional_flyers', f"{slug}.webp")
        else:
            crop_and_save('promotional_flyers', f"{slug}.webp")

    elif cat == 'books-publications':
        if 'notebook' in name:
            crop_and_save('books_editorial', f"{slug}.webp", (0.05, 0.1, 0.4, 0.7))
        elif 'magazine' in name or 'catalogue' in name:
            crop_and_save('books_editorial', f"{slug}.webp", (0.35, 0.18, 0.75, 0.75))
        elif 'diary' in name:
            crop_and_save('books_editorial', f"{slug}.webp", (0.05, 0.1, 0.4, 0.7))
        else:
            crop_and_save('books_editorial', f"{slug}.webp")

    elif cat == 'wedding-invitation':
        if 'envelope' in name:
            crop_and_save('wedding_suite', f"{slug}.webp", (0.1, 0.45, 0.7, 0.95))
        elif 'rsvp' in name:
            crop_and_save('wedding_suite', f"{slug}.webp", (0.55, 0.12, 0.95, 0.55))
        else:
            crop_and_save('wedding_suite', f"{slug}.webp")

    elif cat == 'packaging-printing':
        if 'bag' in name:
            crop_and_save('shopping_bags', f"{slug}.webp")
        elif 'box' in name:
            crop_and_save('packaging_boxes', f"{slug}.webp")
        elif 'sleeve' in name:
            crop_and_save('packaging_suite', f"{slug}.webp", (0.55, 0.45, 0.8, 0.85))
        else:
            crop_and_save('packaging_suite', f"{slug}.webp")

    elif cat == 'labels-stickers':
        if 'roll' in name or 'barcode' in name:
            crop_and_save('stickers_roll_peel', f"{slug}.webp", (0.22, 0.15, 0.48, 0.45))
        elif 'round' in name:
            crop_and_save('stickers_roll_peel', f"{slug}.webp", (0.35, 0.4, 0.75, 0.75))
        elif 'waterproof' in name or 'transparent' in name or 'vinyl' in name:
            crop_and_save('stickers_die_cut', f"{slug}.webp")
        else:
            crop_and_save('stickers_roll_peel', f"{slug}.webp")

    elif cat == 'photo-digital-printing':
        if 'calendar' in name:
            crop_and_save('photo_calendars', f"{slug}.webp", (0.45, 0.2, 0.85, 0.65))
        elif 'album' in name:
            crop_and_save('photo_calendars', f"{slug}.webp", (0.58, 0.65, 0.88, 0.92))
        elif 'frame' in name or 'canvas' in name or 'photo' in name:
            crop_and_save('photo_calendars', f"{slug}.webp")
        else:
            crop_and_save('photo_calendars', f"{slug}.webp")

    elif cat == 'school-educational-printing':
        if 'id' in name:
            crop_and_save('school_educational', f"{slug}.webp", (0.58, 0.1, 0.88, 0.45))
        elif 'certificate' in name or 'marksheet' in name:
            crop_and_save('school_educational', f"{slug}.webp", (0.05, 0.05, 0.65, 0.65))
        elif 'diary' in name or 'handbook' in name or 'syllabus' in name or 'notebook' in name:
            crop_and_save('school_educational', f"{slug}.webp", (0.5, 0.4, 0.95, 0.95))
        else:
            crop_and_save('school_educational', f"{slug}.webp")

    elif cat == 'restaurant-hotel-printing':
        if 'menu' in name:
            crop_and_save('restaurant_hospitality', f"{slug}.webp", (0.1, 0.15, 0.6, 0.75))
        elif 'tent' in name:
            crop_and_save('restaurant_hospitality', f"{slug}.webp", (0.55, 0.2, 0.78, 0.6))
        elif 'coaster' in name:
            crop_and_save('restaurant_hospitality', f"{slug}.webp", (0.32, 0.7, 0.58, 0.9))
        elif 'bill' in name:
            crop_and_save('restaurant_hospitality', f"{slug}.webp", (0.55, 0.5, 0.95, 0.88))
        else:
            crop_and_save('restaurant_hospitality', f"{slug}.webp")

    prod['image'] = f"/images/products/{slug}.webp"
    updated_count += 1

# Save DB
with open(DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print(f"Successfully updated {updated_count} products with realistic commercial product photography!")
