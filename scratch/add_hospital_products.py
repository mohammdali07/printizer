import json
import os

HOSPITAL_CATEGORY = {
    "id": "hospital-medical-printing",
    "name": "Hospital & Medical Printing",
    "description": "Complete healthcare & clinical stationery: doctor prescription pads, OPD consultation papers, IPD patient files, case papers, diagnostic lab reports, hospital bill books, and staff PVC ID cards.",
    "badge": "7 Products",
    "image": "/images/categories/hospital-medical-printing.webp",
    "productCount": 7
}

def make_product(pid, name, slug, tagline, desc, min_qty, img, sizes, materials, finishes, base_rate, qty_tiers, unit_name, starting_price, supports_both=True, extra_fields=None):
    order_fields = {
        "enabled": True,
        "showMaterial": True,
        "showSize": True,
        "showFinishing": True,
        "showPrinting": supports_both,
        "showColour": True,
        "showDelivery": True,
        "showNcr": False,
        "showCopyType": False,
        "showBinding": False,
        "showSetsPerBook": False,
        "printingOptions": ["Single Side (Front Only)", "Both Sides (Front & Back)"] if supports_both else ["Single Side (Front Only)"],
        "colourOptions": ["Full Color (CMYK)", "Single Color (Blue / Teal / Black)"],
        "optionRateModifiers": {}
    }
    if extra_fields:
        order_fields.update(extra_fields)

    return {
        "id": pid,
        "name": name,
        "slug": slug,
        "categoryId": "hospital-medical-printing",
        "categoryName": "Hospital & Medical Printing",
        "tagline": tagline,
        "description": desc,
        "minQuantity": min_qty,
        "image": img,
        "secondaryImages": [img],
        "standardSizes": sizes,
        "materials": materials,
        "finishes": finishes,
        "featured": False,
        "baseRate": base_rate,
        "quantityTiers": qty_tiers,
        "pricingConfig": {
            "baseRate": base_rate,
            "minQuantity": min_qty,
            "startingPrice": starting_price,
            "unitName": unit_name,
            "supportsBothSides": supports_both,
            "supportsFoil": False,
            "supportsSpotUv": False,
            "foilExtraPercent": 15,
            "spotUvExtraPercent": 15,
            "bothSidesMultiplier": 1.4,
            "gstPercent": 18,
            "markupPercent": 30,
            "orderFields": order_fields
        }
    }

HOSPITAL_PRODUCTS = [
    make_product(
        pid="prd-prescription-pad",
        name="Prescription Pad",
        slug="prescription-pad",
        tagline="Custom doctor Rx prescription pads with clean medical header and tear-off binding.",
        desc="Custom printed Doctor Prescription Pads on smooth 80/100 GSM executive bond paper with crisp Rx branding, doctor registration details, patient vitals header, and sturdy top-gummed pad binding.",
        min_qty=10,
        img="/images/products/prescription-pad.webp",
        sizes=["A5 (148 x 210 mm)", "A4 (210 x 297 mm)", "Half-Letter (5.5\" x 8.5\")"],
        materials=["80 GSM Executive Bond", "100 GSM Sunshine Paper", "100 GSM Alabaster Paper"],
        finishes=["Top Gummed Pad (100 Sheets/Pad)", "Perforated Tear-Off Binding", "Hardboard Backing"],
        base_rate=85,
        qty_tiers=[10, 20, 50, 100],
        unit_name="Pads",
        starting_price=850,
        supports_both=False
    ),
    make_product(
        pid="prd-opd-paper",
        name="OPD Paper",
        slug="opd-paper",
        tagline="Outpatient consultation & registration sheets tailored for clinics and hospitals.",
        desc="High-clarity OPD (Outpatient Department) Papers designed with structured vitals, department, and clinical Rx sections. Printed on smooth pen-friendly bond and sunshine paper stocks.",
        min_qty=1000,
        img="/images/products/opd-paper.webp",
        sizes=["A4 (210 x 297 mm)", "A5 (148 x 210 mm)"],
        materials=["80 GSM Sunshine Paper", "100 GSM Executive Bond", "80 GSM Maplitho"],
        finishes=["Loose Sheet Stack", "Top Gummed Pad (100 Sheets)"],
        base_rate=1450,
        qty_tiers=[1000, 2000, 5000, 10000],
        unit_name="Sheets",
        starting_price=1450,
        supports_both=True
    ),
    make_product(
        pid="prd-ipd-file",
        name="IPD File",
        slug="ipd-file",
        tagline="Heavyweight 300-350 GSM Inpatient medical record folder with admission chart.",
        desc="Durable IPD (Inpatient Department) Medical Files crafted from rigid 300-350 GSM art card and SBS board. Features custom hospital branding, patient admission grid, inner pocket, and metal clip/punch.",
        min_qty=500,
        img="/images/products/ipd-file.webp",
        sizes=["Foolscap / Legal Folder (9.5\" x 14\")", "A4 Folder (9\" x 12.5\")"],
        materials=["300 GSM Art Card", "350 GSM SBS Board", "320 GSM Ultima Board"],
        finishes=["Matt Lamination + Metal Clip", "Gloss Lamination + Inner Pocket", "Creased & Die-Cut"],
        base_rate=18,
        qty_tiers=[500, 1000, 2000, 5000],
        unit_name="Files",
        starting_price=9000,
        supports_both=True
    ),
    make_product(
        pid="prd-patient-case-paper",
        name="Patient Case Paper",
        slug="patient-case-paper",
        tagline="Folded 4-page & A4 clinical patient history and progress record sheets.",
        desc="Comprehensive Patient Case Papers printed on crisp 80-120 GSM maplitho and bond paper. Ideal for recording chief complaints, past medical history, clinical observations, and daily treatment orders.",
        min_qty=1000,
        img="/images/products/patient-case-paper.webp",
        sizes=["A3 Folded to A4 (4-Page Record)", "A4 (210 x 297 mm)"],
        materials=["80 GSM Maplitho", "100 GSM Sunshine Paper", "120 GSM Executive Bond"],
        finishes=["Center Folded (4 Pages)", "2-Hole Punched for IPD File"],
        base_rate=2400,
        qty_tiers=[1000, 2000, 5000, 10000],
        unit_name="Sheets",
        starting_price=2400,
        supports_both=True
    ),
    make_product(
        pid="prd-lab-report",
        name="Lab Report",
        slug="lab-report",
        tagline="Diagnostic & pathology lab test report stationery with crisp clinical branding.",
        desc="Pre-printed Diagnostic & Pathology Lab Report letterheads and matching report folders engineered for laser/inkjet printer compatibility, clean tabular alignment, and NABL-ready presentation.",
        min_qty=1000,
        img="/images/products/lab-report.webp",
        sizes=["A4 (210 x 297 mm)", "A4 Report + Matching Envelope"],
        materials=["100 GSM Executive Bond", "100 GSM Alabaster Paper", "130 GSM Art Paper"],
        finishes=["Laser-Ready Smooth Finish", "Security Watermark Tint"],
        base_rate=1750,
        qty_tiers=[1000, 2000, 5000, 10000],
        unit_name="Sheets",
        starting_price=1750,
        supports_both=False
    ),
    make_product(
        pid="prd-hospital-bill-book",
        name="Hospital Bill Book",
        slug="hospital-bill-book",
        tagline="Numbered carbonless NCR duplicate & triplicate hospital and pharmacy bill books.",
        desc="Custom Hospital & Pharmacy Bill Books with sequential serial numbering, crisp perforation, and carbonless NCR duplicate/triplicate sheets for IPD billing, OPD receipts, and pharmacy counters.",
        min_qty=10,
        img="/images/products/hospital-bill-book.webp",
        sizes=["A4 (210 x 297 mm)", "A5 (148 x 210 mm)", "1/6 Foolscap"],
        materials=["Carbonless NCR Paper (White + Pink)", "60 GSM Maplitho + Carbon"],
        finishes=["Duplicate (100x2 Sets/Book)", "Triplicate (100x3 Sets/Book)", "Serial Numbered + Perforated"],
        base_rate=115,
        qty_tiers=[10, 20, 50, 100],
        unit_name="Books",
        starting_price=1150,
        supports_both=False,
        extra_fields={
            "showNcr": True,
            "showCopyType": True,
            "showBinding": True,
            "ncrOptions": ["With NCR (Carbonless)", "Non-NCR (With Carbon)"],
            "copyOptions": ["Duplicate (1+1)", "Triplicate (1+2)"],
            "bindingOptions": ["Hardbound + Perforated", "Gummed Pad Binding"]
        }
    ),
    make_product(
        pid="prd-hospital-id-card",
        name="Hospital ID Card",
        slug="hospital-id-card",
        tagline="Durable CR80 PVC doctor, nursing staff & patient ID cards with branded lanyard.",
        desc="Heavy-duty 800-micron rigid PVC Hospital ID Cards with high-resolution variable photo printing, blood group & staff ID fields, barcode/QR support, and hospital-branded sublimation lanyard.",
        min_qty=50,
        img="/images/products/hospital-id-card.webp",
        sizes=["Standard CR80 (86 x 54 mm)"],
        materials=["Premium Durable Rigid PVC (800 Micron)"],
        finishes=["Hospital-Branded Satin Lanyard", "QR / Barcode Variable Data", "Transparent Card Holder"],
        base_rate=45,
        qty_tiers=[50, 100, 200, 500],
        unit_name="Cards",
        starting_price=2250,
        supports_both=True
    )
]

def update_catalog(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Update or insert category
    cats = [c for c in data.get("categories", []) if c["id"] != HOSPITAL_CATEGORY["id"]]
    cats.append(HOSPITAL_CATEGORY)
    data["categories"] = cats

    # Update or insert products
    new_ids = {p["id"] for p in HOSPITAL_PRODUCTS}
    prods = [p for p in data.get("products", []) if p["id"] not in new_ids]
    prods.extend(HOSPITAL_PRODUCTS)
    data["products"] = prods

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {filepath}: {len(cats)} categories, {len(prods)} products")

if __name__ == "__main__":
    update_catalog(r"client\src\data\initialCatalog.json")
    update_catalog(r"data\printizer.json")
