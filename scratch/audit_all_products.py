import json

with open(r'client\src\data\initialCatalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

print(f"Total categories: {len(cat['categories'])}, Total products: {len(cat['products'])}")

# Check every category & product
issues = []
for p in cat['products']:
    pc = p.get('pricingConfig', {})
    of = pc.get('orderFields', {})
    mats = p.get('materials', [])
    sizes = p.get('standardSizes', [])
    finishes = p.get('finishes', [])
    tiers = p.get('quantityTiers', [])
    print_opts = of.get('printingOptions', [])
    col_opts = of.get('colourOptions', [])

    probs = []
    if len(mats) < 1: probs.append('NO_MATERIALS')
    if len(sizes) < 1: probs.append('NO_SIZES')
    if len(finishes) < 1: probs.append('NO_FINISHES')
    if len(tiers) < 1: probs.append('NO_TIERS')
    if len(print_opts) < 1: probs.append('NO_PRINT_OPTS')
    if len(col_opts) < 1: probs.append('NO_COLOUR_OPTS')
    if pc.get('priceUnavailable'): probs.append('PRICE_UNAVAILABLE')

    # Check if bill/book product has NCR/Copy/Binding/Sets
    is_book_bill = any(k in p['slug'] for k in ['bill-book', 'cash-memo', 'receipt-book', 'quotation-book', 'invoice-book', 'delivery-challan', 'purchase-order', 'payment-voucher'])
    if is_book_bill:
        if not of.get('showNcr'): probs.append('MISSING_NCR')
        if not of.get('showCopyType'): probs.append('MISSING_COPY_TYPE')
        if not of.get('showBinding'): probs.append('MISSING_BINDING')
        if not of.get('showSetsPerBook'): probs.append('MISSING_SETS_PER_BOOK')

    # Check if sq.inch / area product has dimensions
    if pc.get('pricingKind') == 'area' and not pc.get('dimensions'):
        probs.append('AREA_MISSING_DIMENSIONS')

    # Check if priceSheets exist
    if not pc.get('priceSheets') and pc.get('pricingKind') != 'special_job':
        probs.append('NO_PRICE_SHEETS')

    if probs:
        issues.append((p['categoryId'], p['slug'], p['name'], probs))

print(f"Products with flags: {len(issues)}")
for cid, slug, name, probs in issues:
    print(f"  [{cid}] {slug} ({name}): {probs}")
