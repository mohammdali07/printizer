import json
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DB_FILE = os.path.join(BASE_DIR, 'data', 'printizer.json')
CLIENT_DATA_DIR = os.path.join(BASE_DIR, 'client', 'src', 'data')
os.makedirs(CLIENT_DATA_DIR, exist_ok=True)
RATE_LIST_FILE = os.path.join(CLIENT_DATA_DIR, 'rateList.json')

raw_rates = [
  # Visiting Card (1,000 pcs)
  ("Visiting Card", "NT Card", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "250 gsm Art Card", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "250 gsm Art Card + Lamination", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "350 gsm Matt Card", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "500 gsm Matt Card + UV", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "400 gsm Round Cut + Drip-off UV", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "Drip-off NT", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Visiting Card", "Gold Foil S/S 350 gsm Matt", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),

  # Premium Visiting Card
  ("Premium Visiting Card", "PRE - NT + Coating (87x51mm)", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "PRE - 250 gsm Art", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "PRE - 250 gsm Art + UV Coating", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "PRE - 350 gsm Matt", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "PRE - 350 gsm Matt + UV", "1,000 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "Velvet + UV 500 gsm", "500 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "Velvet + S/S Foil 500 gsm", "500 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "Matt 500 gsm + S/S Foil", "500 pcs", 315, 441, 350, 490, "visiting-card"),
  ("Premium Visiting Card", "Matt 800 gsm UV", "500 pcs", 315, 441, 350, 490, "visiting-card"),

  # Letter Pad (1,000 pcs)
  ("Letter Pad", "80 gsm Sunshine (210x285mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),
  ("Letter Pad", "80 gsm Sunshine (210x297mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),
  ("Letter Pad", "100 gsm Alabaster (210x297mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),
  ("Letter Pad", "100 gsm Sunshine (210x297mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),
  ("Letter Pad", "80 gsm Bond (210x297mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),
  ("Letter Pad", "100 gsm Bond (210x297mm)", "1,000 pcs", 405, 567, 450, 630, "letterhead"),

  # Cover / Envelopes (1,000 pcs)
  ("Cover", "7x4 Size 100 gsm Alabaster", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "7x4 Size 100 gsm SSP", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "9.5x4.25 Size 80 gsm SSP", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "9.5x4.25 Size 100 gsm Alabaster", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "9.5x4.25 Size 100 gsm SSP", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "9.5x4.25 Size 100 gsm Excel Bond", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "11x5 Size 100 gsm SSP", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "11x5 Size 100 gsm Alabaster", "1,000 pcs", 405, 567, 450, 630, "envelope"),
  ("Cover", "Window Cover 9.5x4.25 Size 100 gsm Alabaster", "1,000 pcs", 405, 567, 450, 630, "envelope"),

  # 250 gsm Art / Mix
  ("250 gsm Art / Mix", "250 gsm Art (210x285mm)", "100 pcs", 810, 1134, 900, 1260, "art-paper"),
  ("250 gsm Art / Mix", "250 gsm Art + Lamination (210x285mm)", "100 pcs", 810, 1134, 900, 1260, "art-paper"),
  ("250 gsm Art / Mix", "250 gsm Art (Per Sq. Inch)", "Per sq. inch", 315, None, 350, None, "art-paper"),
  ("250 gsm Art / Mix", "250 gsm Art + Lamination (Per Sq. Inch)", "Per sq. inch", 315, None, 350, None, "art-paper"),
  ("250 gsm Art / Mix", "350 gsm Matt Lamination (Per Sq. Inch)", "Per sq. inch", 315, None, 350, None, "art-paper"),

  # Sticker
  ("Sticker", "HM Sticker", "Per sq. inch", 315, None, 350, None, "round-sticker"),
  ("Sticker", "HM Sticker + UV Lamination", "Per sq. inch", 315, None, 350, None, "round-sticker"),
  ("Sticker", "Silver Metallic + Drip-off UV", "Per sq. inch", 315, None, 350, None, "logo-sticker"),
  ("Sticker", "Every Sticker", "Per sq. inch", 315, None, 350, None, "vinyl-sticker"),
  ("Sticker", "Every Sticker + Lamination", "Per sq. inch", 315, None, 350, None, "waterproof-sticker"),
  ("Sticker", "PVC Sticker + Lamination", "Per sq. inch", 315, None, 350, None, "vinyl-sticker"),

  # Art Paper
  ("Art Paper", "100 gsm Art Paper (210x285mm)", "1,000 pcs", 405, 567, 450, 630, "pamphlet"),
  ("Art Paper", "130 gsm Art Paper (210x285mm)", "1,000 pcs", 405, 567, 450, 630, "flyer"),
  ("Art Paper", "170 gsm Art Paper (210x285mm)", "1,000 pcs", 405, 567, 450, 630, "brochure"),

  # Special Job
  ("Special Job", "Special Job Printing", "Custom", None, None, None, None, "special-job"),

  # Box
  ("Box", "320 gsm Ultima + UV Lamination", "Per sq. inch", 315, None, 350, None, "product-box"),
  ("Box", "320 gsm Ultima + Drip-off UV", "Per sq. inch", 315, None, 350, None, "cake-box")
]

rate_list = []
for idx, item in enumerate(raw_rates):
    grp, prod, unit, gst_s, gst_b, ret_s, ret_b, img_slug = item
    
    # Calculate +30% on retail prices
    final_ret_s = round(ret_s * 1.30, 2) if ret_s is not None else None
    final_ret_b = round(ret_b * 1.30, 2) if ret_b is not None else None
    
    rate_list.append({
        "id": f"rate-{idx+1}",
        "group": grp,
        "product": prod,
        "unit": unit,
        "gstSingle": gst_s,
        "gstBoth": gst_b,
        "baseRetailSingle": ret_s,
        "baseRetailBoth": ret_b,
        "retailSingle": final_ret_s,
        "retailBoth": final_ret_b,
        "retailSingleStr": f"₹{final_ret_s:,.0f}" if final_ret_s is not None else "Quoted Individually",
        "retailBothStr": f"₹{final_ret_b:,.0f}" if final_ret_b is not None else "-",
        "image": f"/images/products/{img_slug}.webp" if os.path.exists(os.path.join(BASE_DIR, 'client', 'public', 'images', 'products', f"{img_slug}.webp")) else "/images/categories/business-stationery.webp"
    })

# Save to client/src/data/rateList.json
with open(RATE_LIST_FILE, 'w', encoding='utf-8') as f:
    json.dump(rate_list, f, indent=2, ensure_ascii=False)
print(f"Saved {len(rate_list)} rate items to {RATE_LIST_FILE}")

# Update data/printizer.json
if os.path.exists(DB_FILE):
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data["rateList"] = rate_list
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {DB_FILE} with rateList ({len(rate_list)} items).")
