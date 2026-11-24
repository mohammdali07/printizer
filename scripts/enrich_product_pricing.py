import json
import re

# 1. Parse PrintConfigurator.jsx for exact base rates and min quantities
with open('client/src/components/PrintConfigurator.jsx', 'r', encoding='utf-8') as f:
    config_code = f.read()

slug_info = {}
for m in re.finditer(r'slug:\s*\'([^\']+)\'[^}]*?baseRate:\s*([0-9.]+)[^}]*?minQty:\s*([0-9]+)', config_code):
    slug_info[m.group(1)] = {
        'baseRate': float(m.group(2)),
        'minQty': int(m.group(3))
    }

# 2. Load data/printizer.json
with open('data/printizer.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Categories that naturally support both-side printing
both_side_cats = {'business-stationery', 'marketing-advertising', 'wedding-invitation'}
both_side_slugs = {
    'visiting-card', 'letterhead', 'id-card', 'employee-id-card', 'school-id-card',
    'brochure', 'flyer', 'pamphlet', 'leaflet', 'catalogue', 'promotional-cards',
    'wedding-invitation-card', 'engagement-card', 'birthday-invitation', 'anniversary-invitation',
    'invitation-envelope', 'save-the-date-card', 'thank-you-card', 'greeting-card',
    'restaurant-menu-card', 'food-menu', 'takeaway-menu', 'table-tent-card', 'room-service-card',
    'hotel-key-card', 'marksheet', 'certificate', 'admission-form', 'question-paper'
}

for p in catalog['products']:
    slug = p['slug']
    info = slug_info.get(slug, {'baseRate': 1.0, 'minQty': p.get('minQuantity', 100)})
    base_rate = info['baseRate']
    min_qty = info['minQty']
    
    p['baseRate'] = base_rate
    p['minQuantity'] = min_qty
    
    # Calculate quantity tiers
    if min_qty >= 1000:
        tiers = [min_qty, min_qty * 2, min_qty * 3, min_qty * 5, min_qty * 10]
    elif min_qty >= 500:
        tiers = [min_qty, min_qty * 2, min_qty * 4, min_qty * 10]
    elif min_qty >= 100:
        tiers = [min_qty, min_qty * 2, min_qty * 5, min_qty * 10]
    elif min_qty >= 10:
        tiers = [min_qty, min_qty * 2, min_qty * 5, min_qty * 10, min_qty * 20]
    else:
        tiers = [min_qty, min_qty * 2, min_qty * 5, min_qty * 10]
    
    # Clean unique tiers
    p['quantityTiers'] = sorted(list(set(tiers)))
    
    # Pricing configuration
    finishes_text = ' '.join(p.get('finishes', [])).lower()
    cat_id = p.get('categoryId', '')
    
    supports_both_sides = slug in both_side_slugs or ('both' in finishes_text)
    supports_foil = 'foil' in finishes_text or cat_id == 'wedding-invitation' or 'metallic' in finishes_text
    supports_spot_uv = 'uv' in finishes_text or 'spot' in finishes_text or 'gloss' in finishes_text
    
    # Unit name
    if 'card' in slug:
        unit_name = 'Cards'
    elif 'book' in slug or 'diary' in slug or 'notebook' in slug:
        unit_name = 'Books'
    elif 'bag' in slug:
        unit_name = 'Bags'
    elif 'box' in slug:
        unit_name = 'Boxes'
    elif 'sticker' in slug or 'label' in slug:
        unit_name = 'Labels'
    elif 'menu' in slug:
        unit_name = 'Menus'
    elif 'standee' in slug:
        unit_name = 'Standees'
    elif 'poster' in slug or 'flyer' in slug or 'brochure' in slug or 'leaflet' in slug:
        unit_name = 'Copies'
    elif 'mug' in slug:
        unit_name = 'Mugs'
    else:
        unit_name = 'Units'
        
    starting_price = round(base_rate * min_qty)
    
    p['pricingConfig'] = {
        'baseRate': base_rate,
        'minQuantity': min_qty,
        'startingPrice': starting_price,
        'unitName': unit_name,
        'supportsBothSides': supports_both_sides,
        'supportsFoil': supports_foil,
        'supportsSpotUv': supports_spot_uv,
        'foilExtraPercent': 15,
        'spotUvExtraPercent': 15,
        'bothSidesMultiplier': 1.4 if supports_both_sides else 1.0,
        'gstPercent': 18
    }

# Save data/printizer.json
with open('data/printizer.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2)

# Save client/src/data/initialCatalog.json
with open('client/src/data/initialCatalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2)

print('Successfully updated data/printizer.json and client/src/data/initialCatalog.json')
