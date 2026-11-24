import json
import os

DB_PATH = 'e:/projects/PRINTIZER PROJECT/data/printizer.json'

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Gallery image options per category
CATEGORY_GALLERIES = {
    'business-stationery': [
        '/images/categories/business-stationery.webp',
        '/images/slides/cards.webp',
        '/images/products/visiting-card.webp'
    ],
    'marketing-advertising': [
        '/images/categories/marketing-advertising.webp',
        '/images/products/brochure.webp',
        '/images/products/flyer.webp'
    ],
    'books-publications': [
        '/images/categories/books-publications.webp',
        '/images/products/notebook.webp',
        '/images/products/office-diary.webp'
    ],
    'wedding-invitation': [
        '/images/categories/wedding-invitation.webp',
        '/images/products/wedding-invitation-card.webp',
        '/images/products/engagement-card.webp'
    ],
    'packaging-printing': [
        '/images/categories/packaging-printing.webp',
        '/images/slides/packaging.webp',
        '/images/products/paper-bag.webp'
    ],
    'labels-stickers': [
        '/images/categories/labels-stickers.webp',
        '/images/products/round-sticker.webp',
        '/images/products/waterproof-sticker.webp'
    ],
    'photo-digital-printing': [
        '/images/categories/photo-digital-printing.webp',
        '/images/products/photo-printing.webp',
        '/images/products/photo-album.webp'
    ],
    'school-educational-printing': [
        '/images/categories/school-educational-printing.webp',
        '/images/products/school-id-card.webp',
        '/images/products/certificate.webp'
    ],
    'restaurant-hotel-printing': [
        '/images/categories/restaurant-hotel-printing.webp',
        '/images/products/restaurant-menu-card.webp',
        '/images/products/table-tent-card.webp'
    ]
}

for prod in db['products']:
    cat = prod.get('categoryId')
    main_img = prod.get('image')
    cat_gallery = CATEGORY_GALLERIES.get(cat, [])
    # Unique list starting with main_img
    gallery = [main_img]
    for g in cat_gallery:
        if g not in gallery and os.path.exists(os.path.join('client/public', g.lstrip('/'))):
            gallery.append(g)
    prod['secondaryImages'] = gallery[:3]

with open(DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print("Updated all products with multi-view secondary image galleries.")
