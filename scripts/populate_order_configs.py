import json
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_JSON = os.path.join(BASE_DIR, 'data', 'printizer.json')
INITIAL_CATALOG = os.path.join(BASE_DIR, 'client', 'src', 'data', 'initialCatalog.json')

# Product-specific configuration templates matching Section 4 & Admin Configurability
EXACT_SPECS = {
    'visiting-card': {
        'materials': ['250g Art Card', '250g Art Card + Lamination', '350 GSM Matte Card', '500 GSM Matte Card + UV', '350 GSM Velvet Touch'],
        'standardSizes': ['Standard (3.5" x 2.0" / 89 x 51 mm)', 'Compact (87 x 51 mm)', 'Square (2.5" x 2.5")'],
        'finishes': ['Matte Lamination', 'Gloss Lamination', 'Round Cut Corners', 'Velvet Soft-Touch', 'Special Drip-Off Texture'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
            'printingOptions': ['Single Side (Front Only)', 'Both Sides (Front & Back)'],
            'colourOptions': ['Full Color (CMYK)', 'Full Color + Metallic Accent'],
            'optionRateModifiers': {
                'materialMultipliers': {
                    '250g Art Card': 0.9,
                    '250g Art Card + Lamination': 1.0,
                    '350 GSM Matte Card': 1.15,
                    '500 GSM Matte Card + UV': 1.45,
                    '350 GSM Velvet Touch': 1.5
                },
                'colourMultipliers': {
                    'Full Color (CMYK)': 1.0,
                    'Full Color + Metallic Accent': 1.15
                },
                'finishingFlatAddons': {
                    'Round Cut Corners': 120,
                    'Special Drip-Off Texture': 260
                }
            }
        }
    },
    'letterhead': {
        'materials': ['100 GSM Paper (Alabaster)', '120 GSM Paper (Executive Bond)', '80 GSM Sunshine Paper', '100 GSM Sunshine Paper'],
        'standardSizes': ['A4 Size (210 x 297 mm)', 'Executive (210 x 285 mm)'],
        'finishes': ['Clean Guillotine Cut', 'Top Padded (100 Sheets/Pad)', 'Micro-Perforated Edge'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
            'printingOptions': ['Single-Sided Printing', 'Double-Sided Printing'],
            'colourOptions': ['Full Color (CMYK)', 'Single Color (Corporate Blue/Black)', 'Two Color'],
            'optionRateModifiers': {
                'materialMultipliers': {
                    '80 GSM Sunshine Paper': 0.9,
                    '100 GSM Sunshine Paper': 1.0,
                    '100 GSM Paper (Alabaster)': 1.05,
                    '120 GSM Paper (Executive Bond)': 1.2
                },
                'colourMultipliers': {
                    'Single Color (Corporate Blue/Black)': 0.85,
                    'Two Color': 0.95,
                    'Full Color (CMYK)': 1.0
                }
            }
        }
    },
    'bill-book': {
        'materials': ['55 GSM Carbonless NCR', '60 GSM Maplitho', '70 GSM Hi-Bright Bond'],
        'standardSizes': ['1/4 Demy (7.25" x 9.5")', '1/8 Demy (4.75" x 7.25")', 'A4 Size (8.27" x 11.69")', 'A5 Size (5.83" x 8.27")'],
        'finishes': ['Sequential Red Numbering + Perforation', 'Standard Tear-Off Finish'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side Printing', 'Front + Terms Back Printing'],
            'colourOptions': ['Single Color (Blue / Black)', 'Two Color (Blue + Red)', 'Full Color Header'],
            'ncrOptions': ['NCR Carbonless (Auto Copy)', 'Non-NCR (Carbon Paper Required)'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2)'],
            'bindingOptions': ['Cloth Spine + Perforation', 'Hardboard Bound Register', 'Top Gummed Pad'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Duplicate (1+1)': 1.0, 'Triplicate (1+2)': 1.38},
                'ncrMultipliers': {'Non-NCR (Carbon Paper Required)': 0.92, 'NCR Carbonless (Auto Copy)': 1.0},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
    'cash-memo-book': {
        'materials': ['60 GSM Maplitho Paper', '55 GSM Carbonless NCR', '70 GSM Bond Paper'],
        'standardSizes': ['1/8 Demy (Compact)', '1/6 Demy', 'A5 Size', '1/4 Demy'],
        'finishes': ['Machine Serial Numbering', 'Perforated Detachable Leaves'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side Printing', 'Both Sides (Rules on Back)'],
            'colourOptions': ['Single Color (Dark Blue / Black)', 'Two Color (Red + Blue)'],
            'ncrOptions': ['NCR Carbonless', 'Non-NCR (Standard)'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2)', 'Single Copy'],
            'bindingOptions': ['Side Cloth Stitched', 'Top Perforated Pad', 'Hardboard Bound'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Single Copy': 0.78, 'Duplicate (1+1)': 1.0, 'Triplicate (1+2)': 1.35},
                'ncrMultipliers': {'Non-NCR (Standard)': 0.92, 'NCR Carbonless': 1.0},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
    'receipt-book': {
        'materials': ['70 GSM Ledger Bond', '55 GSM NCR Carbonless', '80 GSM Alabaster'],
        'standardSizes': ['1/8 Demy (Oblong)', '1/10 Demy (Compact)', '1/6 Demy'],
        'finishes': ['Micro-Perforated Stub Tear Line', 'Sequential Red Numbering'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side Printing', 'Double Side (Terms on Back)'],
            'colourOptions': ['Single Color (Black / Maroon / Blue)', 'Two Color'],
            'ncrOptions': ['NCR Carbonless', 'Non-NCR (Counterfoil Stub)'],
            'copyOptions': ['Original + Counterfoil Stub', 'Duplicate (1+1)', 'Triplicate (1+2)'],
            'bindingOptions': ['Black Cloth Spine + Perforated Line', 'Left Side Wire-Stitched'],
            'setsOptions': ['50 Receipts / Book', '100 Receipts / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Original + Counterfoil Stub': 1.0, 'Duplicate (1+1)': 1.25, 'Triplicate (1+2)': 1.55},
                'setsMultipliers': {'50 Receipts / Book': 1.0, '100 Receipts / Book': 1.75}
            }
        }
    },
    'quotation-book': {
        'materials': ['70 GSM Ledger Paper', '80 GSM Sunshine', '55 GSM NCR Carbonless'],
        'standardSizes': ['A4 Size (8.27" x 11.69")', '1/4 Demy'],
        'finishes': ['Cloth Spine Tape', 'Numbered Slips + Micro-Perforation'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side Printing', 'Both Sides (Specifications on Back)'],
            'colourOptions': ['Single Color (Teal / Navy / Black)', 'Two Color', 'Full Color (CMYK)'],
            'ncrOptions': ['NCR Carbonless', 'Non-NCR'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2)', 'Single Copy Pad'],
            'bindingOptions': ['Top Cloth Spine + Perforation', 'Spiral Wire-O Bound'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Single Copy Pad': 0.8, 'Duplicate (1+1)': 1.0, 'Triplicate (1+2)': 1.35},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
    'invoice-book': {
        'materials': ['55 GSM NCR (White/Pink/Yellow)', '70 GSM Maplitho', '80 GSM Sunshine'],
        'standardSizes': ['A4 Size (GST Standard)', '1/4 Demy', 'A5 Size'],
        'finishes': ['GST Columns + Sequential Serial Numbering', 'Micro-Perforated Sheets'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side GST Format', 'Both Sides (GST Declaration on Back)'],
            'colourOptions': ['Single Color (Navy / Black)', 'Two Color', 'Full Color Header'],
            'ncrOptions': ['NCR Carbonless (Auto Copy)', 'Non-NCR'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2 GST Standard)'],
            'bindingOptions': ['Hard Cloth Spine + Numbering', 'Top Gummed & Perforated'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Duplicate (1+1)': 0.85, 'Triplicate (1+2 GST Standard)': 1.0},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
    'delivery-challan-book': {
        'materials': ['55 GSM Carbonless NCR', '60 GSM Maplitho', '70 GSM Bond'],
        'standardSizes': ['1/4 Demy', '1/5 Demy', 'A4 Size', 'A5 Size'],
        'finishes': ['Perforated Tear Edge + Serial Numbering', 'Receiver Signature Box'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side Dispatch Format', 'Double Side'],
            'colourOptions': ['Single Color (Brown / Blue / Black)', 'Two Color'],
            'ncrOptions': ['NCR Carbonless', 'Non-NCR'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2 Dispatch + Gate + Office)'],
            'bindingOptions': ['Kraft Board + Perforated Tear Sheets', 'Cloth Spine Bound'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Duplicate (1+1)': 1.0, 'Triplicate (1+2 Dispatch + Gate + Office)': 1.35},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
    'purchase-order-book': {
        'materials': ['70 GSM Bond Paper', '55 GSM NCR Carbonless', '60 GSM Maplitho'],
        'standardSizes': ['A4 Size', '1/4 Demy'],
        'finishes': ['Sequential PO Numbering + Perforation', 'Terms & Conditions Backing'],
        'orderFields': {
            'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
            'showPrinting': True, 'showColour': True, 'showDelivery': True,
            'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
            'printingOptions': ['Single Side PO Format', 'Both Sides (Vendor Terms on Back)'],
            'colourOptions': ['Single Color (Indigo / Black)', 'Two Color', 'Full Color (CMYK)'],
            'ncrOptions': ['NCR Carbonless', 'Non-NCR'],
            'copyOptions': ['Duplicate (1+1)', 'Triplicate (1+2)'],
            'bindingOptions': ['Hardboard Cloth Spine', 'Top Perforated Pad'],
            'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
            'optionRateModifiers': {
                'copyMultipliers': {'Duplicate (1+1)': 1.0, 'Triplicate (1+2)': 1.35},
                'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
            }
        }
    },
}

BOOK_SLUGS = {'payment-voucher', 'rest-bill-book', 'notebook', 'pub-school-diary', 'office-diary', 'exercise-book', 'book-printing', 'magazine', 'journal', 'annual-report', 'e-book-printing', 'project-report', 'thesis-printing', 'edu-school-diary', 'school-prospectus', 'student-notebook'}

def default_order_fields(prod):
    slug = prod['slug']
    cat = prod.get('categoryId', '')
    pc = prod.get('pricingConfig') or {}
    supports_both = bool(pc.get('supportsBothSides') or prod.get('bothSideOption'))

    if slug in EXACT_SPECS:
        return EXACT_SPECS[slug]

    # Books / Registers / Pads
    if slug == 'payment-voucher' or slug == 'rest-bill-book':
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': True, 'showColour': True, 'showDelivery': True,
                'showNcr': True, 'showCopyType': True, 'showBinding': True, 'showSetsPerBook': True,
                'printingOptions': ['Single Side', 'Both Sides'] if supports_both else ['Single Side'],
                'colourOptions': ['Single Color (Red/Blue/Black)', 'Two Color'],
                'ncrOptions': ['NCR Carbonless', 'Non-NCR'],
                'copyOptions': ['Single Copy Pad', 'Duplicate (1+1)', 'Triplicate (1+2)'],
                'bindingOptions': ['Cloth Spine Strip + Perforation', 'Top Gummed Pad'],
                'setsOptions': ['50 Sets / Book', '100 Sets / Book'],
                'optionRateModifiers': {
                    'copyMultipliers': {'Single Copy Pad': 0.85, 'Duplicate (1+1)': 1.0, 'Triplicate (1+2)': 1.35},
                    'setsMultipliers': {'50 Sets / Book': 1.0, '100 Sets / Book': 1.75}
                }
            }
        }

    # Visiting card variants
    if 'visiting-card' in (prod.get('sourceGroupSlug') or '') or 'card' in slug and cat == 'business-stationery':
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': True, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
                'printingOptions': ['Single Side (Front Only)', 'Both Sides (Front & Back)'] if supports_both else ['Single Side (Front Only)'],
                'colourOptions': ['Full Color (CMYK)', 'CMYK + Rich Black Back'],
                'optionRateModifiers': {}
            }
        }

    # Letter pad / letterhead variants
    if prod.get('sourceGroupSlug') == 'letter-pad':
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': True, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
                'printingOptions': ['Single Side (Front Only)', 'Both Sides (Front & Back)'] if supports_both else ['Single Side (Front Only)'],
                'colourOptions': ['Full Color (CMYK)', 'Single Color', 'Two Color'],
                'optionRateModifiers': {
                    'colourMultipliers': {'Single Color': 0.88, 'Two Color': 0.95, 'Full Color (CMYK)': 1.0}
                }
            }
        }

    # Envelopes / Covers
    if prod.get('sourceGroupSlug') == 'cover' or 'envelope' in slug:
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': True, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
                'printingOptions': ['Single Side (Front Address)', 'Flap + Front Printing'],
                'colourOptions': ['Full Color (CMYK)', 'Single Color', 'Two Color'],
                'optionRateModifiers': {}
            }
        }

    # Labels & Stickers
    if cat == 'labels-stickers' or prod.get('sourceGroupSlug') == 'sticker' or 'sticker' in slug or 'label' in slug:
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': False, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': False, 'showSetsPerBook': False,
                'printingOptions': ['Front Adhesive Die-Cut'],
                'colourOptions': ['Full Color (CMYK)', 'CMYK + White Ink Layer'] if 'transparent' in slug else ['Full Color (CMYK)', 'High Contrast Monochrome'],
                'optionRateModifiers': {}
            }
        }

    # Packaging & Boxes
    if cat == 'packaging-printing' or prod.get('sourceGroupSlug') == 'box':
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': False, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': True, 'showSetsPerBook': False,
                'printingOptions': ['Outer Full-Color Offset'],
                'colourOptions': ['Full Color (CMYK)', 'CMYK + Metallic Pantone'],
                'bindingOptions': ['Auto Crash-Lock Folding', 'Tuck-Top Lock Flap', 'Rope / Ribbon Handle'],
                'optionRateModifiers': {}
            }
        }

    # Bound Books & Diaries
    if cat == 'books-publications' or slug in BOOK_SLUGS:
        return {
            'orderFields': {
                'enabled': True, 'showMaterial': True, 'showSize': True, 'showFinishing': True,
                'showPrinting': True, 'showColour': True, 'showDelivery': True,
                'showNcr': False, 'showCopyType': False, 'showBinding': True, 'showSetsPerBook': False,
                'printingOptions': ['Cover Color + B&W Inside', 'Full Color Throughout'],
                'colourOptions': ['Full Color Cover + Monochrome Inner', 'Full Color (CMYK)'],
                'bindingOptions': ['Perfect Binding', 'Wire-O Spiral Binding', 'Hardbound Cloth Spine', 'Center Saddle Stitch'],
                'optionRateModifiers': {
                    'printingMultipliers': {'Cover Color + B&W Inside': 1.0, 'Full Color Throughout': 1.45}
                }
            }
        }

    # Generic sensible defaults for Marketing / Wedding / Photo / School / Hospitality
    return {
        'orderFields': {
            'enabled': True,
            'showMaterial': True,
            'showSize': True,
            'showFinishing': True,
            'showPrinting': supports_both,
            'showColour': True,
            'showDelivery': True,
            'showNcr': False,
            'showCopyType': False,
            'showBinding': False,
            'showSetsPerBook': False,
            'printingOptions': ['Single Side (Front Only)', 'Both Sides (Front & Back)'] if supports_both else ['Single Side'],
            'colourOptions': ['Full Color (CMYK)'],
            'optionRateModifiers': {}
        }
    }

def main():
    with open(DATA_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated = 0
    for prod in data['products']:
        spec_patch = default_order_fields(prod)
        if 'materials' in spec_patch:
            prod['materials'] = spec_patch['materials']
        if 'standardSizes' in spec_patch:
            prod['standardSizes'] = spec_patch['standardSizes']
        if 'finishes' in spec_patch:
            prod['finishes'] = spec_patch['finishes']

        pc = prod.setdefault('pricingConfig', {})
        pc['orderFields'] = spec_patch['orderFields']
        updated += 1

    for target in (DATA_JSON, INITIAL_CATALOG):
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'Populated product-specific orderFields across all {updated} products in data/printizer.json and initialCatalog.json')

if __name__ == '__main__':
    main()
