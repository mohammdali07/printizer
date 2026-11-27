import * as XLSX from 'xlsx';

const parseCsvList = (val) =>
  typeof val === 'string'
    ? val.split(',').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(val) ? val : [];

const parseBool = (val, fallback = false) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  const s = String(val ?? '').trim().toLowerCase();
  if (!s) return fallback;
  return s === 'true' || s === 'yes' || s === '1' || s === 'y';
};

const toNum = (val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function productsToSheetRows(products = []) {
  return products.map((p) => {
    const pc = p.pricingConfig || {};
    const of = pc.orderFields || {};
    const retail = pc.priceSheets?.retail || {};
    return {
      slug: p.slug || '',
      name: p.name || '',
      categoryId: p.categoryId || '',
      categoryName: p.categoryName || '',
      tagline: p.tagline || '',
      description: p.description || '',
      minQuantity: p.minQuantity ?? pc.minQuantity ?? 100,
      packSize: p.packSize ?? pc.packSize ?? p.minQuantity ?? 100,
      unitName: pc.unitName || 'Units',
      baseRate: p.baseRate ?? pc.baseRate ?? '',
      startingPrice: p.startingPrice ?? pc.startingPrice ?? '',
      retailSingleRate: retail.single ?? '',
      retailBothRate: retail.both ?? '',
      quantityTiers: Array.isArray(p.quantityTiers) ? p.quantityTiers.join(', ') : '',
      materials: Array.isArray(p.materials) ? p.materials.join(', ') : '',
      standardSizes: Array.isArray(p.standardSizes) ? p.standardSizes.join(', ') : '',
      finishes: Array.isArray(p.finishes) ? p.finishes.join(', ') : '',
      printingOptions: Array.isArray(of.printingOptions) ? of.printingOptions.join(', ') : '',
      colourOptions: Array.isArray(of.colourOptions) ? of.colourOptions.join(', ') : '',
      showMaterial: of.showMaterial !== false,
      showSize: of.showSize !== false,
      showFinishing: of.showFinishing !== false,
      showPrinting: of.showPrinting !== false,
      showColour: of.showColour !== false,
      supportsFoil: Boolean(pc.supportsFoil),
      supportsSpotUv: Boolean(pc.supportsSpotUv),
      dimensions: Boolean(pc.dimensions),
      image: p.image || ''
    };
  });
}

export function exportProductsAsExcel(products, filename = 'PRINTIZER_Products_Catalog.xlsx') {
  const rows = productsToSheetRows(products);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 28 }, { wch: 30 }, { wch: 24 }, { wch: 24 }, { wch: 36 }, { wch: 44 },
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 20 }, { wch: 28 }, { wch: 24 }, { wch: 28 }, { wch: 28 }, { wch: 24 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 36 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, filename);
}

export function exportProductsAsCsv(products, filename = 'PRINTIZER_Products_Catalog.csv') {
  const rows = productsToSheetRows(products);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBulkTemplateExcel() {
  const sample = [
    {
      slug: 'sample-clinic-rx-pad',
      name: 'Clinic Rx Prescription Pad',
      categoryId: 'hospital-medical-printing',
      categoryName: 'Hospital & Medical Printing',
      tagline: 'Custom doctor Rx pad on 100 GSM bond paper.',
      description: 'High-clarity clinic prescription pad with gummed top binding.',
      minQuantity: 10,
      packSize: 10,
      unitName: 'Pads',
      baseRate: 90,
      startingPrice: 900,
      retailSingleRate: '',
      retailBothRate: '',
      quantityTiers: '10, 20, 50, 100',
      materials: '80 GSM Bond, 100 GSM Bond',
      standardSizes: 'A5 (148 x 210 mm), A4 (210 x 297 mm)',
      finishes: 'Top Gummed Pad, Hardboard Backing',
      printingOptions: 'Single Side (Front Only)',
      colourOptions: 'Full Color (CMYK), Single Color',
      showMaterial: true,
      showSize: true,
      showFinishing: true,
      showPrinting: true,
      showColour: true,
      supportsFoil: false,
      supportsSpotUv: false,
      dimensions: false,
      image: '/images/products/prescription-pad.webp'
    }
  ];
  exportProductsAsExcel(sample, 'PRINTIZER_Bulk_Upload_Template.xlsx');
}

export async function parseBulkCatalogFile(file, existingCategories = [], existingProducts = []) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('The uploaded file has no sheets.');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('No product rows found in the uploaded file.');
  }

  const nextCategories = [...existingCategories];
  const catById = new Map(nextCategories.map((c) => [c.id, c]));
  const productMap = new Map(existingProducts.map((p) => [p.slug, p]));

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const raw of rows) {
    const name = String(raw.name || raw['Product Name'] || raw.Name || '').trim();
    if (!name) {
      skippedCount += 1;
      continue;
    }

    const slug = slugify(raw.slug || raw.Slug || name);
    if (!slug) {
      skippedCount += 1;
      continue;
    }

    const rawCatName = String(raw.categoryName || raw['Category Name'] || raw.Category || '').trim();
    const rawCatId = slugify(raw.categoryId || raw['Category ID'] || rawCatName || 'business-stationery');
    const categoryId = rawCatId || 'business-stationery';

    if (!catById.has(categoryId)) {
      const createdCat = {
        id: categoryId,
        name: rawCatName || categoryId.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
        description: `Commercial printing products for ${rawCatName || categoryId}.`,
        image: '/images/categories/business-stationery.webp'
      };
      nextCategories.push(createdCat);
      catById.set(categoryId, createdCat);
    }

    const categoryName = catById.get(categoryId)?.name || rawCatName || 'Custom';
    const existing = productMap.get(slug);
    const existingPc = existing?.pricingConfig || {};
    const existingOf = existingPc.orderFields || {};

    const minQty = toNum(raw.minQuantity ?? raw['Min Qty']) ?? existing?.minQuantity ?? 100;
    const packSize = toNum(raw.packSize ?? raw['Pack Size']) ?? minQty;
    const baseRate = toNum(raw.baseRate ?? raw['Base Rate']);
    const startingPrice = toNum(raw.startingPrice ?? raw['Starting Price']);
    const singleRate = toNum(raw.retailSingleRate ?? raw['Single Rate']);
    const bothRate = toNum(raw.retailBothRate ?? raw['Both Rate']);

    const tiers = parseCsvList(String(raw.quantityTiers ?? raw['Quantity Tiers'] ?? ''))
      .map((n) => parseInt(n, 10))
      .filter((n) => Number.isFinite(n) && n > 0);

    const printingOpts = parseCsvList(raw.printingOptions ?? raw['Printing Options']);
    const colourOpts = parseCsvList(raw.colourOptions ?? raw['Colour Options']);
    const isDims = parseBool(raw.dimensions, Boolean(existingPc.dimensions));

    let nextPriceSheets = existingPc.priceSheets ? { ...existingPc.priceSheets } : undefined;
    if (singleRate && singleRate > 0) {
      nextPriceSheets = {
        ...(nextPriceSheets || {}),
        retail: {
          ...(nextPriceSheets?.retail || {}),
          single: singleRate,
          ...(bothRate && bothRate > 0 ? { both: bothRate } : {})
        }
      };
    }

    const imgUrl = String(raw.image || raw.Image || existing?.image || '').trim();
    const mergedProduct = {
      ...(existing || {}),
      id: existing?.id || `prd-${slug}`,
      name,
      slug,
      categoryId,
      categoryName,
      tagline: String(raw.tagline || raw.Tagline || existing?.tagline || `Custom printed ${name}`).trim(),
      description: String(raw.description || raw.Description || existing?.description || `High-grade custom printed ${name} with calibrated CMYK reproduction.`).trim(),
      minQuantity: minQty,
      packSize,
      ...(baseRate !== undefined ? { baseRate } : {}),
      ...(startingPrice !== undefined ? { startingPrice } : {}),
      ...(tiers.length > 0 ? { quantityTiers: tiers } : existing?.quantityTiers ? { quantityTiers: existing.quantityTiers } : {}),
      image: imgUrl,
      secondaryImages: imgUrl ? Array.from(new Set([imgUrl, ...(existing?.secondaryImages || [])])) : (existing?.secondaryImages || []),
      materials: parseCsvList(raw.materials ?? raw.Materials).length > 0 ? parseCsvList(raw.materials ?? raw.Materials) : (existing?.materials || ['Standard Paper Stock']),
      standardSizes: parseCsvList(raw.standardSizes ?? raw.Sizes).length > 0 ? parseCsvList(raw.standardSizes ?? raw.Sizes) : (existing?.standardSizes || ['Standard Size']),
      finishes: parseCsvList(raw.finishes ?? raw.Finishes).length > 0 ? parseCsvList(raw.finishes ?? raw.Finishes) : (existing?.finishes || ['Standard Finish']),
      pricingConfig: {
        ...existingPc,
        minQuantity: minQty,
        packSize,
        unitName: String(raw.unitName || raw['Unit Name'] || existingPc.unitName || 'Units').trim(),
        ...(baseRate !== undefined ? { baseRate } : {}),
        ...(startingPrice !== undefined ? { startingPrice } : {}),
        supportsFoil: parseBool(raw.supportsFoil, Boolean(existingPc.supportsFoil)),
        supportsSpotUv: parseBool(raw.supportsSpotUv, Boolean(existingPc.supportsSpotUv)),
        dimensions: isDims,
        ...(isDims ? { pricingKind: 'area' } : {}),
        ...(nextPriceSheets ? { priceSheets: nextPriceSheets } : {}),
        orderFields: {
          ...existingOf,
          enabled: true,
          showMaterial: parseBool(raw.showMaterial, existingOf.showMaterial !== false),
          showSize: parseBool(raw.showSize, existingOf.showSize !== false),
          showFinishing: parseBool(raw.showFinishing, existingOf.showFinishing !== false),
          showPrinting: parseBool(raw.showPrinting, existingOf.showPrinting !== false),
          showColour: parseBool(raw.showColour, existingOf.showColour !== false),
          showDelivery: false,
          printingOptions: printingOpts.length > 0 ? printingOpts : (existingOf.printingOptions || ['Single Side (Front Only)', 'Both Sides (Front & Back)']),
          colourOptions: colourOpts.length > 0 ? colourOpts : (existingOf.colourOptions || ['Full Color (CMYK)'])
        }
      }
    };

    if (existing) updatedCount += 1;
    else addedCount += 1;
    productMap.set(slug, mergedProduct);
  }

  return {
    nextProducts: Array.from(productMap.values()),
    nextCategories,
    addedCount,
    updatedCount,
    skippedCount
  };
}
