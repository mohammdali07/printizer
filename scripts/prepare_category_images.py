from PIL import Image
import os

artifacts_dir = 'C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75'
target_dir = 'client/public/images/categories'

verified_mapping = {
    'marketing-advertising': 'promotional_flyers_1795326438117.jpg',
    'packaging-printing': 'packaging_printing_1795326020705.jpg',
    'labels-stickers': 'stickers_labels_1795326042221.jpg',
    'photo-digital-printing': 'photo_gifts_calendars_1795439043099.jpg'
}

for cat_id, filename in verified_mapping.items():
    src = os.path.join(artifacts_dir, filename)
    if os.path.exists(src):
        im = Image.open(src)
        print(f"Verified {cat_id}: {im.size}, mode={im.mode}")
    else:
        print(f"Missing {src}")
