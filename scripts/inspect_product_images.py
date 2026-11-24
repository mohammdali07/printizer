import json, os
from PIL import Image

with open('data/printizer.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

products = d['products']
print(f"Total products: {len(products)}")

sample_prods = [
    'visiting-card', 'letterhead', 'bill-book',
    'flyer', 'brochure', 'pamphlet', 'poster',
    'notebook', 'office-diary', 'pub-school-diary',
    'wedding-invitation-card', 'engagement-card',
    'paper-bag', 'shopping-bag', 'product-box',
    'round-sticker', 'square-sticker', 'waterproof-sticker',
    'photo-printing', 'photo-album', 'canvas-print',
    'school-id-card', 'certificate', 'marksheet',
    'restaurant-menu-card', 'food-menu', 'table-tent-card'
]

for p in products:
    if p['slug'] in sample_prods:
        img_rel = p.get('image', '').lstrip('/')
        full_p = os.path.join('client/public', img_rel)
        if os.path.exists(full_p):
            im = Image.open(full_p)
            print(f"[{p['categoryId']}] {p['name']} ({p['slug']}): {im.size}, mode={im.mode}")
        else:
            print(f"MISSING: {p['name']} -> {full_p}")
