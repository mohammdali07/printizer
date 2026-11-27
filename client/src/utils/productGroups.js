/**
 * Shared Madhuram-aligned Product Group definitions.
 * Keeps CategoryPage clean (1 representative card per group) while
 * OrderConfigurePage reveals all sub-variants inside that group.
 */

const LETTERHEAD_SLUGS = new Set([
  'letterhead',
  '80-gsm-sunshine-210x285mm',
  '80-gsm-sunshine-210x297mm',
  '100-gsm-alabaster-210x297mm',
  '100-gsm-sunshine-210x297mm',
  '80-gsm-bond-210x297mm',
  '100-gsm-bond-210x297mm'
]);

const ENVELOPE_SLUGS = new Set([
  'envelope',
  '7x4-size-100-gsm-alabaster',
  '7x4-size-100-gsm-ssp',
  '9-5x4-25-size-80-gsm-ssp',
  '9-5x4-25-size-100-gsm-alabaster',
  '9-5x4-25-size-100-gsm-ssp',
  '9-5x4-25-size-100-gsm-excel-bond',
  '11x5-size-100-gsm-ssp',
  '11x5-size-100-gsm-alabaster',
  'window-cover-9-5x4-25-size-100-gsm-alabaster'
]);

const ART_PAPER_SLUGS = new Set([
  '100-gsm-art-paper-210x285mm',
  '130-gsm-art-paper-210x285mm',
  '170-gsm-art-paper-210x285mm',
  '250-gsm-art-210x285mm',
  '250-gsm-art-lamination-210x285mm',
  '250-gsm-art-per-sq-in',
  '250-gsm-art-lamination-per-sq-in',
  '350-gsm-matt-lamination-per-sq-in'
]);

const STICKER_GRADE_SLUGS = new Set([
  'hm-sticker',
  'hm-sticker-uv-lamination',
  'silver-metallic-drip-off-uv',
  'every-sticker',
  'every-sticker-lamination',
  'pvc-sticker-lamination'
]);

const ULTIMA_BOX_SLUGS = new Set([
  '320-gsm-ultima-uv-lamination',
  '320-gsm-ultima-drip-off-uv'
]);

export const PRODUCT_GROUP_DEFS = [
  {
    key: 'visiting-card',
    groupName: 'Visiting Card',
    subLabel: 'Select Card Type',
    genericSlug: 'visiting-card',
    match: (p) =>
      Boolean(
        p &&
        (p.slug === 'visiting-card' ||
          (p.categoryId === 'business-stationery' &&
            p.pricingConfig?.unitName === 'Cards' &&
            !p.slug.includes('id-card')))
      )
  },
  {
    key: 'letterhead',
    groupName: 'Letterhead',
    subLabel: 'Select Product',
    genericSlug: 'letterhead',
    match: (p) => Boolean(p && LETTERHEAD_SLUGS.has(p.slug))
  },
  {
    key: 'envelope',
    groupName: 'Envelope / Cover',
    subLabel: 'Select Product',
    genericSlug: 'envelope',
    match: (p) => Boolean(p && ENVELOPE_SLUGS.has(p.slug))
  },
  {
    key: 'art-paper',
    groupName: 'Art Paper (100-350 gsm)',
    subLabel: 'Select Product',
    genericSlug: null,
    match: (p) => Boolean(p && ART_PAPER_SLUGS.has(p.slug))
  },
  {
    key: 'sticker-grades',
    groupName: 'Commercial Stickers (HM / PVC / Metallic)',
    subLabel: 'Select Product',
    genericSlug: null,
    match: (p) => Boolean(p && STICKER_GRADE_SLUGS.has(p.slug))
  },
  {
    key: 'ultima-box',
    groupName: '320 gsm Ultima Box',
    subLabel: 'Select Product',
    genericSlug: null,
    match: (p) => Boolean(p && ULTIMA_BOX_SLUGS.has(p.slug))
  }
];

export function getProductGroupDef(product) {
  return PRODUCT_GROUP_DEFS.find((g) => g.match(product)) || null;
}

/**
 * Collapses multi-variant product groups into 1 clean representative card
 * for CategoryPage grids (so sub-variants only appear inside OrderConfigurePage).
 */
export function collapseGroupedProductsForCategory(categoryProducts) {
  const result = [];
  const seenGroups = new Set();

  for (const p of categoryProducts) {
    const g = getProductGroupDef(p);
    if (!g) {
      result.push(p);
      continue;
    }
    if (seenGroups.has(g.key)) continue;

    // Prefer the generic product card (e.g. 'visiting-card', 'letterhead', 'envelope') if present
    const preferred =
      (g.genericSlug && categoryProducts.find((item) => item.slug === g.genericSlug)) || p;

    seenGroups.add(g.key);
    result.push({
      ...preferred,
      name: g.groupName
    });
  }

  return result;
}
