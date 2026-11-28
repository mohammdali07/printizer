import json

with open('client/src/data/initialCatalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

en = [p for p in cat['products'] if p.get('enabled') is not False]
print('Total enabled:', len(en))
for p in en:
    pc = p.get('pricingConfig') or {}
    ret = (pc.get('priceSheets') or {}).get('retail') or {}
    fin = ret.get('finishing') or {}
    fin_keys = [k for k, v in fin.items() if v]
    print(f"{p['categoryId']:22} | {p['slug']:32} | sp={pc.get('startingPrice')} | single={ret.get('single')} | both={ret.get('both')} | foil={pc.get('supportsFoil')} | uv={pc.get('supportsSpotUv')} | fin={fin_keys}")
