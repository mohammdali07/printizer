import json, os

with open('data/printizer.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print(f"Total categories: {len(d['categories'])}")
for c in d['categories']:
    prods = [p for p in d['products'] if p.get('categoryId') == c['id']]
    p_img = os.path.join('client/public', c.get('image', '').lstrip('/'))
    exists = os.path.exists(p_img)
    sz = os.path.getsize(p_img) if exists else 0
    print(f"- {c['id']}: '{c['name']}' ({len(prods)} products) -> {c.get('image')} (exists: {exists}, {sz} bytes)")

print("\nSample Products per category:")
for c in d['categories']:
    prods = [p for p in d['products'] if p.get('categoryId') == c['id']]
    print(f"\n--- {c['name']} ({len(prods)}) ---")
    for p in prods[:4]:
        p_img = os.path.join('client/public', p.get('image', '').lstrip('/'))
        exists = os.path.exists(p_img)
        print(f"  * {p['name']} -> {p.get('image')} (exists: {exists})")
