from PIL import Image
import os

artifacts_dir = 'C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75'
dest_dirs = [
    'client/public/images/categories',
    'images/categories'
]

mapping = {
    'business-stationery': 'business_stationery_photo_1795511512448.jpg',
    'marketing-advertising': 'promotional_flyers_1795326438117.jpg',
    'books-publications': 'books_publications_photo_1795511563817.jpg',
    'wedding-invitation': 'wedding_invitations_photo_1795511606025.jpg',
    'packaging-printing': 'packaging_printing_1795326020705.jpg',
    'labels-stickers': 'stickers_labels_1795326042221.jpg',
    'photo-digital-printing': 'photo_gifts_calendars_1795439043099.jpg',
    'school-educational-printing': 'school_educational_photo_1795511638096.jpg',
    'restaurant-hotel-printing': 'restaurant_hotel_photo_1795511669323.jpg'
}

TARGET_W, TARGET_H = 1200, 900 # Standard 4:3 high-res

for cat_id, filename in mapping.items():
    src_path = os.path.join(artifacts_dir, filename)
    if not os.path.exists(src_path):
        print(f"ERROR: Missing source {src_path}")
        continue
    
    im = Image.open(src_path)
    # Calculate crop to center 4:3
    src_w, src_h = im.size
    target_ratio = 4.0 / 3.0
    src_ratio = src_w / src_h
    
    if src_ratio > target_ratio:
        # Source is wider than 4:3
        new_w = int(src_h * target_ratio)
        offset = (src_w - new_w) // 2
        im_cropped = im.crop((offset, 0, offset + new_w, src_h))
    else:
        # Source is taller than 4:3
        new_h = int(src_w / target_ratio)
        offset = (src_h - new_h) // 2
        im_cropped = im.crop((0, offset, src_w, offset + new_h))
    
    im_resized = im_cropped.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    
    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)
        out_webp = os.path.join(d, f"{cat_id}.webp")
        im_resized.save(out_webp, 'WEBP', quality=92, method=6)
        sz = os.path.getsize(out_webp)
        print(f"Saved {out_webp} ({sz} bytes, 1200x900)")

print("\nAll 9 commercial category photographs deployed successfully.")
