import json
import os
import re
import sqlite3

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MAIN_DB_PATH = r'E:\projects\printizer-main\printizer-main\data\printizer.db'
DATA_JSON_PATH = os.path.join(BASE_DIR, 'data', 'printizer.json')
INITIAL_CATALOG_PATH = os.path.join(BASE_DIR, 'client', 'src', 'data', 'initialCatalog.json')
RATE_LIST_PATH = os.path.join(BASE_DIR, 'client', 'src', 'data', 'rateList.json')

def slugify(text):
    s = text.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

PRICE_MARKUP = 1.30

def paise_to_inr(val, apply_markup=True):
    if val is None:
        return None
    inr = val / 100.0
    if apply_markup:
        inr *= PRICE_MARKUP
    return round(inr, 2)

conn = sqlite3.connect(MAIN_DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

groups_rows = cur.execute('SELECT * FROM product_group ORDER BY sort_order').fetchall()
groups = {g['id']: dict(g) for g in groups_rows}
products_rows = cur.execute('SELECT * FROM product ORDER BY sort_order').fetchall()
prices_rows = cur.execute('SELECT * FROM product_price').fetchall()

prices_by_prod = {}
for pr in prices_rows:
    prices_by_prod.setdefault(pr['product_id'], {})[pr['customer_class']] = dict(pr)

def build_price_sheet(pr_row):
    if not pr_row:
        return None
    return {
        'single': paise_to_inr(pr_row['single']),
        'both': paise_to_inr(pr_row['both']),
        'minimum': paise_to_inr(pr_row['minimum']),
        'foilGold': paise_to_inr(pr_row['foil_gold']),
        'foilSilver': paise_to_inr(pr_row['foil_silver']),
        'spotUvSingle': paise_to_inr(pr_row['spot_uv_single']),
        'spotUvBoth': paise_to_inr(pr_row['spot_uv_both']),
        'finishing': {
            'halfBlade': paise_to_inr(pr_row['half_blade']),
            'creasing': paise_to_inr(pr_row['creasing']),
            'perforation': paise_to_inr(pr_row['perforation']),
            'die': paise_to_inr(pr_row['die']),
            'punching': paise_to_inr(pr_row['punching']),
            'folding': paise_to_inr(pr_row['folding']),
        },
        'courierPerPack': paise_to_inr(pr_row['courier_per_pack'], apply_markup=False),
        'transportPerParcel': paise_to_inr(pr_row['transport_per_parcel'], apply_markup=False),
    }

# Image helper matching existing files in client/public/images/products/
def pick_image(group_slug, prod_name):
    n = prod_name.lower()
    if group_slug in ('visiting-card', 'premium-visiting-card'):
        if 'silver' in n: return '/images/products/silver-foil.webp'
        if 'gold' in n or 'foil' in n: return '/images/products/gold-foil.webp'
        if 'drip' in n and 'nt' in n: return '/images/products/drip-off-nt.webp'
        if 'round' in n or 'velvet + uv' in n: return '/images/products/round-cut-uv.webp'
        if 'matt' in n and 'uv' in n: return '/images/products/matt-card-uv.webp'
        if 'matt' in n: return '/images/products/matt-card.webp'
        if 'lamination' in n or 'coating' in n: return '/images/products/art-card-lamination.webp'
        if 'art' in n: return '/images/products/art-card.webp'
        if 'nt' in n: return '/images/products/nt-card.webp'
        return '/images/products/visiting-card.webp'
    if group_slug == 'letter-pad':
        return '/images/products/letterhead.webp'
    if group_slug == 'cover':
        return '/images/products/envelope.webp'
    if group_slug == 'art-mix-250-gsm':
        return '/images/products/art-card-lamination.webp' if 'lamination' in n else '/images/products/art-card.webp'
    if group_slug == 'sticker':
        if 'pvc' in n: return '/images/products/vinyl-sticker.webp'
        if 'silver' in n: return '/images/products/logo-sticker.webp'
        if 'uv' in n or 'lamination' in n: return '/images/products/waterproof-sticker.webp'
        return '/images/products/round-sticker.webp'
    if group_slug == 'art-paper':
        if '170' in n: return '/images/products/brochure.webp'
        if '130' in n: return '/images/products/flyer.webp'
        return '/images/products/pamphlet.webp'
    if group_slug == 'box':
        return '/images/products/cake-box.webp' if 'drip' in n else '/images/products/product-box.webp'
    return '/images/products/visiting-card.webp'

# Group -> PRINTIZER PROJECT category mapping
GROUP_TO_CATEGORY = {
    'visiting-card': ('business-stationery', 'Business Stationery'),
    'premium-visiting-card': ('business-stationery', 'Business Stationery'),
    'letter-pad': ('business-stationery', 'Business Stationery'),
    'cover': ('business-stationery', 'Business Stationery'),
    'art-mix-250-gsm': ('marketing-advertising', 'Marketing & Advertising'),
    'art-paper': ('marketing-advertising', 'Marketing & Advertising'),
    'special-job': ('marketing-advertising', 'Marketing & Advertising'),
    'sticker': ('labels-stickers', 'Labels & Stickers'),
    'box': ('packaging-printing', 'Packaging Printing'),
}

# Build rateList.json from printizer.db with +30% price increase
rate_list = []
main_products_normalized = []

sorted_prods = sorted(
    [dict(p) for p in products_rows],
    key=lambda p: (groups[p['group_id']]['sort_order'], p['sort_order'])
)

for idx, prod in enumerate(sorted_prods):
    g = groups[prod['group_id']]
    g_slug = g['slug']
    g_name = json.loads(g['name'])['en']
    p_name = json.loads(prod['name'])['en']
    pack_size = int(prod['pack_size'])
    max_packs = int(prod['max_packs'])
    dimensions = bool(prod['dimensions'])
    pricing_kind = g['pricing']
    hsn = g['hsn_code']
    gst_rate_pct = round(g['gst_rate'] / 100.0, 2)

    pr = prices_by_prod.get(prod['id'], {})
    retail_sheet = build_price_sheet(pr.get('retail'))
    gst_sheet = build_price_sheet(pr.get('gst'))

    img_path = pick_image(g_slug, p_name)

    unit_label = f"{pack_size:,} pcs" if pack_size > 1 else "Custom"
    if dimensions:
        unit_label = f"{pack_size:,} pcs / Sq.In"

    ret_single = retail_sheet['single'] if retail_sheet else None
    ret_both = retail_sheet['both'] if retail_sheet else None
    gst_single = gst_sheet['single'] if gst_sheet else None
    gst_both = gst_sheet['both'] if gst_sheet else None

    rate_list.append({
        'id': f'rate-{idx + 1}',
        'group': g_name,
        'groupSlug': g_slug,
        'product': p_name,
        'hsnCode': hsn,
        'pricingKind': pricing_kind,
        'packSize': pack_size,
        'maxPacks': max_packs,
        'dimensions': dimensions,
        'unit': unit_label,
        'gstSingle': gst_single,
        'gstBoth': gst_both,
        'retailSingle': ret_single,
        'retailBoth': ret_both,
        'minimum': retail_sheet['minimum'] if retail_sheet else None,
        'retailSingleStr': (f'₹{int(ret_single):,}' if float(ret_single).is_integer() else f'₹{ret_single:,.2f}') if ret_single else 'Quoted Individually',
        'retailBothStr': (f'₹{int(ret_both):,}' if float(ret_both).is_integer() else f'₹{ret_both:,.2f}') if ret_both else '-',
        'image': img_path
    })

    cat_id, cat_name = GROUP_TO_CATEGORY.get(g_slug, ('business-stationery', 'Business Stationery'))
    unit_name = 'Cards' if 'visiting-card' in g_slug else ('Labels' if g_slug == 'sticker' else ('Boxes' if g_slug == 'box' else 'Units'))

    if pack_size == 1:
        tiers = [100, 250, 500, 1000]
    else:
        tiers = [pack_size, pack_size * 2, pack_size * 3, pack_size * 5, pack_size * 10]

    # Per-piece base rate for display consistency
    per_piece_rate = round(ret_single / pack_size, 4) if (ret_single and pack_size > 0 and not dimensions) else (ret_single or 0)

    supports_both = ret_both is not None and ret_both > 0
    supports_foil = bool(retail_sheet and (retail_sheet['foilGold'] or retail_sheet['foilSilver']))
    supports_uv = bool(retail_sheet and (retail_sheet['spotUvSingle'] or retail_sheet['spotUvBoth']))

    # Determine sizes/materials/finishes from product spec
    size_match = re.search(r'\(([^)]*(?:mm|x)[^)]*)\)|(\d+(?:\.\d+)?x\d+(?:\.\d+)?(?:\s*Size)?)', p_name, re.I)
    default_size = size_match.group(1) or size_match.group(2) if size_match else (
        'Custom Dimensions (Width × Height in inches)' if dimensions else
        ('Standard 3.5" x 2.0" (87 x 51 mm)' if 'visiting-card' in g_slug else 'Standard Commercial Size')
    )

    p_lower = p_name.lower()
    finishes_list = []
    if 'velvet' in p_lower:
        finishes_list.append('Velvet Soft-Touch Lamination')
    if 'drip-off' in p_lower or 'drip off' in p_lower:
        finishes_list.append('Drip-Off UV Texture')
    if 'uv' in p_lower and 'drip' not in p_lower:
        finishes_list.append('UV Coating / Lamination')
    if 'matt' in p_lower:
        finishes_list.append('Thermal Matte Lamination')
    if 'lamination' in p_lower and 'matt' not in p_lower and 'uv' not in p_lower:
        finishes_list.append('Gloss Protective Lamination')
    if 'foil' in p_lower:
        finishes_list.append('Metallic Foil Stamping')
    if not finishes_list:
        finishes_list = ['Standard Commercial Finish']

    main_products_normalized.append({
        'id': f'pm-{slugify(g_slug)}-{slugify(p_name)}',
        'slug': f'{slugify(g_slug)}-{slugify(p_name)}' if g_slug == 'premium-visiting-card' else slugify(p_name),
        'categoryId': cat_id,
        'categoryName': cat_name,
        'sourceGroup': g_name,
        'sourceGroupSlug': g_slug,
        'name': p_name,
        'tagline': f'{g_name} • Min Qty: {pack_size:,} {unit_name}' + (' • Per Sq. Inch Pricing' if dimensions else ''),
        'description': f'Official PRINTIZER {g_name} specification: {p_name}. Minimum order pack size of {pack_size:,} {unit_name.lower()}, calibrated CMYK reproduction, and HSN {hsn} tax billing support.',
        'popular': idx < 10,
        'featured': idx < 5,
        'image': img_path,
        'secondaryImages': [img_path],
        'productClass': g_name,
        'paperQuality': p_name,
        'productionTime': '3-4 business days',
        'laminationType': p_name,
        'bothSideOption': supports_both,
        'minQuantity': pack_size,
        'packSize': pack_size,
        'maxPacks': max_packs,
        'hsnCode': hsn,
        'dimensions': dimensions,
        'pricingKind': pricing_kind,
        'baseRate': per_piece_rate,
        'quantityTiers': tiers,
        'standardSizes': [default_size],
        'materials': [p_name],
        'finishes': finishes_list,
        'pricingConfig': {
            'pricingKind': pricing_kind,
            'packSize': pack_size,
            'maxPacks': max_packs,
            'dimensions': dimensions,
            'hsnCode': hsn,
            'gstPercent': gst_rate_pct,
            'baseRate': per_piece_rate,
            'minQuantity': pack_size,
            'startingPrice': round(retail_sheet['minimum'], 2) if (dimensions and retail_sheet and retail_sheet['minimum']) else (round(ret_single, 2) if ret_single else 0),
            'markupPercent': 30,
            'unitName': unit_name,
            'supportsBothSides': supports_both,
            'supportsFoil': supports_foil,
            'supportsSpotUv': supports_uv,
            'bothSidesMultiplier': round(ret_both / ret_single, 4) if (supports_both and ret_single) else 1.0,
            'priceSheets': {
                'retail': retail_sheet,
                'gst': gst_sheet
            }
        }
    })

# Save exact rateList.json
with open(RATE_LIST_PATH, 'w', encoding='utf-8') as f:
    json.dump(rate_list, f, indent=2, ensure_ascii=False)
print(f'Saved {len(rate_list)} exact rates to {RATE_LIST_PATH}')

# Sync into data/printizer.json and client/src/data/initialCatalog.json
with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Price/MOQ presets mapped from printizer-main for existing PRINTIZER PROJECT products
retail_vc = build_price_sheet(prices_by_prod[sorted_prods[0]['id']]['retail'])
gst_vc = build_price_sheet(prices_by_prod[sorted_prods[0]['id']]['gst'])

# Find representative sheets by group
group_sheets = {}
for prod in sorted_prods:
    g_slug = groups[prod['group_id']]['slug']
    key = (g_slug, bool(prod['dimensions']))
    if key not in group_sheets:
        pr = prices_by_prod.get(prod['id'], {})
        group_sheets[key] = {
            'packSize': int(prod['pack_size']),
            'maxPacks': int(prod['max_packs']),
            'hsn': groups[prod['group_id']]['hsn_code'],
            'pricingKind': groups[prod['group_id']]['pricing'],
            'dimensions': bool(prod['dimensions']),
            'retail': build_price_sheet(pr.get('retail')),
            'gst': build_price_sheet(pr.get('gst')),
        }

SLUG_MAP = {
    'visiting-card': ('visiting-card', False),
    'promotional-cards': ('visiting-card', False),
    'letterhead': ('letter-pad', False),
    'envelope': ('cover', False),
    'invitation-envelope': ('cover', False),
    'pamphlet': ('art-paper', False),
    'flyer': ('art-paper', False),
    'brochure': ('art-paper', False),
    'leaflet': ('art-paper', False),
    'round-sticker': ('sticker', True),
    'square-sticker': ('sticker', True),
    'transparent-sticker': ('sticker', True),
    'waterproof-sticker': ('sticker', True),
    'vinyl-sticker': ('sticker', True),
    'logo-sticker': ('sticker', True),
    'qr-code-sticker': ('sticker', True),
    'lbl-product-label': ('sticker', True),
    'pkg-product-label': ('sticker', True),
    'sticker-label': ('sticker', True),
    'barcode-label': ('sticker', True),
    'warning-label': ('sticker', True),
    'parcel-sticker': ('sticker', True),
    'rest-food-label': ('sticker', True),
    'product-box': ('box', True),
    'cake-box': ('box', True),
    'sweet-box': ('box', True),
}

existing_slugs = set()
updated_count = 0
for p in catalog['products']:
    slug = p['slug']
    existing_slugs.add(slug)
    if slug in SLUG_MAP:
        g_slug, is_dim = SLUG_MAP[slug]
        spec = group_sheets[(g_slug, is_dim)]
        pack_size = spec['packSize']
        ret = spec['retail']
        ret_s = ret['single']
        ret_b = ret['both']
        per_unit = round(ret_s / pack_size, 4) if (ret_s and pack_size > 0 and not is_dim) else ret_s
        p['minQuantity'] = pack_size
        p['packSize'] = pack_size
        p['maxPacks'] = spec['maxPacks']
        p['hsnCode'] = spec['hsn']
        p['dimensions'] = is_dim
        p['pricingKind'] = spec['pricingKind']
        p['baseRate'] = per_unit
        p['quantityTiers'] = [pack_size, pack_size * 2, pack_size * 3, pack_size * 5, pack_size * 10]
        pc = p.setdefault('pricingConfig', {})
        pc['pricingKind'] = spec['pricingKind']
        pc['packSize'] = pack_size
        pc['maxPacks'] = spec['maxPacks']
        pc['dimensions'] = is_dim
        pc['hsnCode'] = spec['hsn']
        pc['gstPercent'] = 18
        pc['baseRate'] = per_unit
        pc['minQuantity'] = pack_size
        pc['startingPrice'] = round(ret['minimum'], 2) if (is_dim and ret['minimum']) else round(ret_s, 2)
        pc['markupPercent'] = 30
        pc['supportsBothSides'] = ret_b is not None and ret_b > 0
        pc['bothSidesMultiplier'] = round(ret_b / ret_s, 4) if (ret_b and ret_s) else 1.0
        pc['supportsFoil'] = bool(ret['foilGold'] or ret['foilSilver'])
        pc['supportsSpotUv'] = bool(ret['spotUvSingle'] or ret['spotUvBoth'])
        pc['priceSheets'] = {'retail': ret, 'gst': spec['gst']}
        updated_count += 1
    elif not p['id'].startswith('pm-'):
        pc = p.setdefault('pricingConfig', {})
        if pc.get('markupPercent') != 30:
            if p.get('baseRate') is not None:
                p['baseRate'] = round(float(p['baseRate']) * PRICE_MARKUP, 4)
            if pc.get('baseRate') is not None:
                pc['baseRate'] = round(float(pc['baseRate']) * PRICE_MARKUP, 4)
            if pc.get('startingPrice') is not None:
                pc['startingPrice'] = round(float(pc['startingPrice']) * PRICE_MARKUP, 2)
            pc['markupPercent'] = 30
            updated_count += 1

# Add or update all 49 exact products from printizer-main (idempotent)
existing_by_slug = {p['slug']: i for i, p in enumerate(catalog['products'])}
added_count = 0
for mp in main_products_normalized:
    if mp['slug'] not in existing_by_slug:
        catalog['products'].append(mp)
        existing_by_slug[mp['slug']] = len(catalog['products']) - 1
        added_count += 1
    else:
        idx_existing = existing_by_slug[mp['slug']]
        if catalog['products'][idx_existing]['id'].startswith('pm-'):
            catalog['products'][idx_existing] = mp

# Update category badges with accurate counts and business profile metadata
for c in catalog['categories']:
    cnt = sum(1 for p in catalog['products'] if p['categoryId'] == c['id'])
    c['badge'] = f'{cnt} Products'

catalog['rateList'] = rate_list
catalog['businessInfo'] = {
    'legalName': 'Printizer',
    'domain': 'printizer.in',
    'tagline': 'Printing & Design',
    'stateName': 'Gujarat',
    'stateCode': '24',
    'email': 'printizerdesign@gmail.com',
    'whatsapp': '+91 98983 51920',
    'deliveryModes': [
        {'id': 'courier', 'label': 'Courier', 'rate': 60, 'unit': 'per pack'},
        {'id': 'transport', 'label': 'Transport', 'rate': 300, 'unit': 'per parcel'},
        {'id': 'collect', 'label': 'Collect From Office', 'rate': 0, 'unit': 'free'}
    ],
    'fileInstructions': [
        'Send print files as CorelDRAW (.cdr) or press-ready PDF, neatly arranged and converted to curves.',
        'Save CorelDRAW files in version X7 or older.',
        'Write all processing details for the job inside the file itself.',
        'Design only in CMYK. We are not responsible for colour shifts in RGB, Pantone or other colour modes.',
        'Convert images, lenses, transparency, drop shadows and PowerClips to bitmaps.',
        'Check the job size and printing area before sending the file.',
        'For strict colour matching, send a physical colour sample.'
    ],
    'invoiceTerms': [
        'Goods once sold will not be taken back.',
        'Interest at 18% p.a. is charged on overdue bills.',
        'Payment is due within 30 days.',
        'Subject to local jurisdiction.'
    ]
}

for out_path in (DATA_JSON_PATH, INITIAL_CATALOG_PATH):
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

print(f'Updated {updated_count} overlapping products, added {added_count} exact printizer-main products.')
print(f'Total catalog: {len(catalog["categories"])} categories, {len(catalog["products"])} products.')
