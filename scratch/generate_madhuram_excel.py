import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

with open('client/src/data/initialCatalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

avail_products = [p for p in catalog.get('products', []) if p.get('enabled') is not False]

def to_madhuram(val, is_unit=False):
    if val is None or not isinstance(val, (int, float)) or val <= 0:
        return None
    raw = val / 1.30
    return round(raw, 2) if is_unit else int(round(raw))

wb = openpyxl.Workbook()

# Styles
navy_fill = PatternFill('solid', fgColor='0F172A')
crimson_fill = PatternFill('solid', fgColor='BE123C')
green_fill = PatternFill('solid', fgColor='ECFDF5')
mad_fill = PatternFill('solid', fgColor='EFF6FF')
alt_fill = PatternFill('solid', fgColor='F8FAFC')
header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
title_font = Font(name='Calibri', size=14, bold=True, color='0F172A')
sub_font = Font(name='Calibri', size=10, italic=True, color='475569')
bold_font = Font(name='Calibri', size=10, bold=True, color='0F172A')
reg_font = Font(name='Calibri', size=10, color='1E293B')
green_bold = Font(name='Calibri', size=10, bold=True, color='065F46')
thin_side = Side(style='thin', color='CBD5E1')
cell_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

# ==========================================================
# SHEET 1: Full Madhuram Pricing + 35% Master
# ==========================================================
ws1 = wb.active
ws1.title = 'Madhuram +35% Pricing'
ws1.views.sheetView[0].showGridLines = True

ws1.merge_cells('A1:P1')
ws1['A1'] = 'PRINTIZER — MADHURAM COMPLETE PRICING & OPTIONS MASTER (+35% MARKUP)'
ws1['A1'].font = title_font
ws1['A2'] = f'Total Madhuram Available Products: {len(avail_products)} | Formula: Printizer Price = Madhuram Final Price + 35% (e.g. ₹100 + 35% = ₹135)'
ws1['A2'].font = sub_font

headers1 = [
    'S.No',
    'Category',
    'Product Name',
    'Slug',
    'MOQ / Pack',
    'Pricing Type',
    'Madhuram Single / Base (₹)',
    'Printizer +35% Single / Base (₹)',
    'Madhuram Both Sides (₹)',
    'Printizer +35% Both Sides (₹)',
    'Madhuram Gold Foil (₹)',
    'Printizer +35% Gold Foil (₹)',
    'Madhuram Spot UV Single (₹)',
    'Printizer +35% Spot UV Single (₹)',
    'Available Materials / Sizes / Finishes',
    'Available Options (Printing / Foil / UV / Finishing / NCR)'
]

hdr_row = 4
for col_idx, h in enumerate(headers1, start=1):
    cell = ws1.cell(row=hdr_row, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = crimson_fill if '+35%' in h else navy_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = cell_border
ws1.row_dimensions[hdr_row].height = 30

for idx, p in enumerate(avail_products, start=1):
    r = hdr_row + idx
    pc = p.get('pricingConfig') or {}
    of = pc.get('orderFields') or {}
    ps = pc.get('priceSheets') or {}
    ret = ps.get('retail') or {}
    fin = ret.get('finishing') or {}

    min_qty = pc.get('minQuantity') or p.get('minQuantity') or pc.get('packSize') or 100
    unit = pc.get('unitName') or 'Units'
    pk_kind = pc.get('pricingKind') or 'pack'

    mad_single = to_madhuram(ret.get('single') or pc.get('startingPrice'), is_unit=False)
    mad_both = to_madhuram(ret.get('both'), is_unit=False)
    mad_foil = to_madhuram(ret.get('foilGold'), is_unit=False) if pc.get('supportsFoil') else None
    mad_uv = to_madhuram(ret.get('spotUvSingle'), is_unit=False) if pc.get('supportsSpotUv') else None

    mats = ', '.join(p.get('materials') or [])
    sizes = ', '.join(p.get('standardSizes') or [])
    finishes = ', '.join(p.get('finishes') or [])
    specs_summary = f"Materials: {mats or '-'} | Sizes: {sizes or '-'} | Finishes: {finishes or '-'}"

    opts = []
    if of.get('printingOptions'):
        opts.append('Printing: ' + '/'.join(of['printingOptions']))
    if pc.get('supportsFoil'):
        opts.append(f"Foil (Gold ₹{mad_foil or '-'}, Silver ₹{to_madhuram(ret.get('foilSilver')) or '-'})")
    if pc.get('supportsSpotUv'):
        opts.append(f"Spot UV (Single ₹{mad_uv or '-'}, Both ₹{to_madhuram(ret.get('spotUvBoth')) or '-'})")
    fin_list = [f"{k}: ₹{to_madhuram(v)}" for k, v in fin.items() if v]
    if fin_list:
        opts.append('Finishing: ' + ', '.join(fin_list))
    if of.get('showNcr') and of.get('ncrOptions'):
        opts.append('NCR: ' + '/'.join(of['ncrOptions']))
    if of.get('showCopyType') and of.get('copyOptions'):
        opts.append('Copy: ' + '/'.join(of['copyOptions']))
    if of.get('showBinding') and of.get('bindingOptions'):
        opts.append('Binding: ' + '/'.join(of['bindingOptions']))
    if of.get('showSetsPerBook') and of.get('setsOptions'):
        opts.append('Sets: ' + '/'.join(of['setsOptions']))

    row_vals = [
        idx,
        p.get('categoryName', ''),
        p.get('name', ''),
        p.get('slug', ''),
        f"{min_qty} {unit}",
        pk_kind,
        mad_single,
        f"=IF(ISNUMBER(G{r}), ROUND(G{r}*1.35, 0), \"\")",
        mad_both,
        f"=IF(ISNUMBER(I{r}), ROUND(I{r}*1.35, 0), \"\")",
        mad_foil,
        f"=IF(ISNUMBER(K{r}), ROUND(K{r}*1.35, 0), \"\")",
        mad_uv,
        f"=IF(ISNUMBER(M{r}), ROUND(M{r}*1.35, 0), \"\")",
        specs_summary,
        ' | '.join(opts) if opts else 'Standard Commercial Print'
    ]

    for c_idx, val in enumerate(row_vals, start=1):
        cell = ws1.cell(row=r, column=c_idx, value=val)
        cell.border = cell_border
        cell.font = green_bold if c_idx in (8, 10, 12, 14) else (bold_font if c_idx == 3 else reg_font)
        if c_idx in (8, 10, 12, 14):
            cell.fill = green_fill
            cell.number_format = '₹#,##0'
            cell.alignment = Alignment(horizontal='right', vertical='center')
        elif c_idx in (7, 9, 11, 13):
            cell.fill = mad_fill
            cell.number_format = '₹#,##0'
            cell.alignment = Alignment(horizontal='right', vertical='center')
        else:
            if idx % 2 == 0:
                cell.fill = alt_fill
            cell.alignment = Alignment(horizontal='center' if c_idx in (1, 5, 6) else 'left', vertical='center', wrap_text=True)

ws1.freeze_panes = 'A5'
ws1.auto_filter.ref = f"A{hdr_row}:P{hdr_row + len(avail_products)}"

col_widths1 = [6, 22, 30, 28, 14, 14, 18, 20, 18, 20, 16, 18, 18, 20, 48, 52]
for i, w in enumerate(col_widths1, start=1):
    ws1.column_dimensions[get_column_letter(i)].width = w

# ==========================================================
# SHEET 2: Detailed Option-Level Pricing (NT Card, Foil, Spot UV, Finishing)
# ==========================================================
ws2 = wb.create_sheet('Option-Level Breakdown')
ws2.views.sheetView[0].showGridLines = True

ws2['A1'] = 'PRINTIZER — DETAILED OPTION & ADD-ON PRICING (MADHURAM vs +35%)'
ws2['A1'].font = title_font
ws2['A2'] = 'Every individual option (Single Side, Both Sides, Gold Foil, Silver Foil, Spot UV, Die-Cut, Punching, Creasing, Half Blade, Perforation, Folding)'
ws2['A2'].font = sub_font

headers2 = [
    'Category',
    'Product Name',
    'Slug',
    'Option / Add-On Name',
    'Madhuram Price (₹)',
    'Printizer +35% Price (₹)',
    'Profit (+35%) (₹)'
]

for col_idx, h in enumerate(headers2, start=1):
    cell = ws2.cell(row=4, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = crimson_fill if '+35%' in h else navy_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = cell_border
ws2.row_dimensions[4].height = 28

r2 = 5
for p in avail_products:
    pc = p.get('pricingConfig') or {}
    ps = pc.get('priceSheets') or {}
    ret = ps.get('retail') or {}
    fin = ret.get('finishing') or {}
    min_qty = pc.get('minQuantity') or p.get('minQuantity') or 100
    unit = pc.get('unitName') or 'Units'

    option_rows = []
    base_single = to_madhuram(ret.get('single') or pc.get('startingPrice'))
    if base_single:
        option_rows.append((f"Base Single Side ({min_qty} {unit})", base_single))
    base_both = to_madhuram(ret.get('both'))
    if base_both:
        option_rows.append((f"Both Sides ({min_qty} {unit})", base_both))
    if pc.get('supportsFoil'):
        if ret.get('foilGold'):
            option_rows.append(('Add-on: Gold Hot Foil Stamping', to_madhuram(ret.get('foilGold'))))
        if ret.get('foilSilver'):
            option_rows.append(('Add-on: Silver Hot Foil Stamping', to_madhuram(ret.get('foilSilver'))))
    if pc.get('supportsSpotUv'):
        if ret.get('spotUvSingle'):
            option_rows.append(('Add-on: Raised Spot UV (Single Side)', to_madhuram(ret.get('spotUvSingle'))))
        if ret.get('spotUvBoth'):
            option_rows.append(('Add-on: Raised Spot UV (Both Sides)', to_madhuram(ret.get('spotUvBoth'))))
    fin_labels = {
        'halfBlade': 'Finishing: Half Blade Cut',
        'creasing': 'Finishing: Creasing',
        'perforation': 'Finishing: Perforation',
        'die': 'Finishing: Custom Die Cutting',
        'punching': 'Finishing: Hole Punching',
        'folding': 'Finishing: Folding'
    }
    for fk, flabel in fin_labels.items():
        fv = to_madhuram(fin.get(fk))
        if fv:
            option_rows.append((flabel, fv))

    for opt_name, mad_p in option_rows:
        vals = [
            p.get('categoryName', ''),
            p.get('name', ''),
            p.get('slug', ''),
            opt_name,
            mad_p,
            f"=ROUND(E{r2}*1.35, 0)",
            f"=F{r2}-E{r2}"
        ]
        for c_idx, val in enumerate(vals, start=1):
            cell = ws2.cell(row=r2, column=c_idx, value=val)
            cell.border = cell_border
            if c_idx == 5:
                cell.fill = mad_fill
                cell.font = reg_font
                cell.number_format = '₹#,##0'
                cell.alignment = Alignment(horizontal='right', vertical='center')
            elif c_idx in (6, 7):
                cell.fill = green_fill
                cell.font = green_bold
                cell.number_format = '₹#,##0'
                cell.alignment = Alignment(horizontal='right', vertical='center')
            else:
                cell.font = bold_font if c_idx == 2 else reg_font
                cell.alignment = Alignment(horizontal='left', vertical='center')
        r2 += 1

ws2.freeze_panes = 'A5'
ws2.auto_filter.ref = f"A4:G{r2 - 1}"

for i, w in enumerate([22, 28, 28, 36, 20, 22, 18], start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w

out_path = 'PRINTIZER_Madhuram_Complete_Pricing_And_Options_Master_v2.xlsx'
wb.save(out_path)
print(f"Saved {out_path} with {len(avail_products)} products and {r2 - 5} option rows.")
