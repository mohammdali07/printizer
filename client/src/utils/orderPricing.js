/**
 * Deterministic Product-Wise Order Pricing Engine.
 * Never uses random or hardcoded frontend prices.
 * Reads actual product pricingConfig (priceSheets, baseRate, startingPrice, orderFields modifiers).
 * Returns { hasPrice: false, quoteOnly: true } whenever pricing is unavailable.
 */

export function toQuarterInches(inches) {
  const n = parseFloat(inches);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n * 4 - 1e-9);
}

export function getEffectiveOrderFields(product) {
  const pc = product?.pricingConfig || {};
  const fields = pc.orderFields || {};
  const hasDimensions = Boolean(pc.dimensions ?? product?.dimensions);
  const pricingKind = pc.pricingKind || product?.pricingKind || 'pack';
  const supportsBoth = Boolean(pc.supportsBothSides || product?.bothSideOption);

  const materials = Array.isArray(product?.materials) && product.materials.length > 0 ? product.materials : [];
  const sizes = Array.isArray(product?.standardSizes) && product.standardSizes.length > 0 ? product.standardSizes : [];
  const finishes = Array.isArray(product?.finishes) && product.finishes.length > 0 ? product.finishes : [];

  const printingOptions = Array.isArray(fields.printingOptions) && fields.printingOptions.length > 0
    ? fields.printingOptions
    : (supportsBoth ? ['Single Side (Front Only)', 'Both Sides (Front & Back)'] : ['Single Side']);

  const colourOptions = Array.isArray(fields.colourOptions) && fields.colourOptions.length > 0
    ? fields.colourOptions
    : ['Full Color (CMYK)'];

  return {
    enabled: fields.enabled !== false,
    pricingKind,
    hasDimensions,
    supportsBoth,
    supportsFoil: Boolean(pc.supportsFoil),
    supportsSpotUv: Boolean(pc.supportsSpotUv),
    showMaterial: fields.showMaterial !== false && materials.length > 0,
    showSize: (fields.showSize !== false && sizes.length > 0) || (pricingKind === 'area' && hasDimensions),
    showFinishing: fields.showFinishing !== false && finishes.length > 0,
    showPrinting: fields.showPrinting !== undefined ? fields.showPrinting : (supportsBoth || printingOptions.length > 1),
    showColour: fields.showColour !== undefined ? fields.showColour : colourOptions.length > 0,
    showDelivery: fields.showDelivery !== false,
    showBilling: fields.showBilling !== false,
    showNcr: Boolean(fields.showNcr && Array.isArray(fields.ncrOptions) && fields.ncrOptions.length > 0),
    showCopyType: Boolean(fields.showCopyType && Array.isArray(fields.copyOptions) && fields.copyOptions.length > 0),
    showBinding: Boolean(fields.showBinding && Array.isArray(fields.bindingOptions) && fields.bindingOptions.length > 0),
    showSetsPerBook: Boolean(fields.showSetsPerBook && Array.isArray(fields.setsOptions) && fields.setsOptions.length > 0),
    materials,
    sizes,
    finishes,
    printingOptions,
    colourOptions,
    ncrOptions: fields.ncrOptions || [],
    copyOptions: fields.copyOptions || [],
    bindingOptions: fields.bindingOptions || [],
    setsOptions: fields.setsOptions || [],
    modifiers: fields.optionRateModifiers || {},
    quantityTiers: Array.isArray(product?.quantityTiers) && product.quantityTiers.length > 0
      ? product.quantityTiers
      : (() => {
          const minQ = Number(pc.packSize || product?.packSize || product?.minQuantity || 100);
          return [minQ, minQ * 2, minQ * 3, minQ * 5, minQ * 10];
        })(),
    minQuantity: Number(pc.minQuantity || product?.minQuantity || pc.packSize || 100),
    packSize: Number(pc.packSize || product?.packSize || product?.minQuantity || 100),
    unitName: pc.unitName || 'Units',
    priceSheets: pc.priceSheets || null,
    gstPercent: Number(pc.gstPercent || 18),
    hsnCode: pc.hsnCode || product?.hsnCode || '',
    quoteOnly: Boolean(pc.priceUnavailable)
  };
}

export function calculateConfiguredOrderPrice(product, selection) {
  if (!product) return { hasPrice: false, quoteOnly: true };
  const cfg = getEffectiveOrderFields(product);
  if (cfg.quoteOnly || cfg.pricingKind === 'special_job') {
    return { hasPrice: false, quoteOnly: true, unitName: cfg.unitName };
  }

  const customerClass = selection.customerClass === 'gst' ? 'gst' : 'retail';
  const activeSheet = cfg.priceSheets?.[customerClass] || cfg.priceSheets?.retail || null;
  const qty = Math.max(cfg.minQuantity, Number(selection.quantity) || cfg.minQuantity);

  const isBothSides = Boolean(
    selection.printing &&
    /both|double|front & back|front \+ terms/i.test(selection.printing)
  );

  // Modifier helpers configured per-product in Admin / DB
  const mods = cfg.modifiers || {};
  const matMult = Number(mods.materialMultipliers?.[selection.material] ?? 1);
  const colMult = Number(mods.colourMultipliers?.[selection.colour] ?? 1);
  const ncrMult = Number(mods.ncrMultipliers?.[selection.ncrOption] ?? 1);
  const copyMult = Number(mods.copyMultipliers?.[selection.copyType] ?? 1);
  const setsMult = Number(mods.setsMultipliers?.[selection.setsPerBook] ?? 1);
  const printMultCustom = Number(mods.printingMultipliers?.[selection.printing] ?? 0);
  const finishFlat = Number(mods.finishingFlatAddons?.[selection.finishing] ?? 0);

  let baseAmount = 0;
  let foilExtra = 0;
  let spotUvExtra = 0;
  let finishingExtra = finishFlat;
  let deliveryCharge = 0;
  let areaSqIn = null;
  let packs = 1;
  let effectiveQty = qty;

  if (activeSheet && Number(activeSheet.single) > 0) {
    packs = Math.max(1, Math.ceil(qty / cfg.packSize));
    effectiveQty = packs * cfg.packSize;

    let ratePerPack = (isBothSides && activeSheet.both != null)
      ? Number(activeSheet.both)
      : Number(activeSheet.single);

    if (printMultCustom > 0 && !(isBothSides && activeSheet.both != null)) {
      ratePerPack *= printMultCustom;
    }

    baseAmount = ratePerPack * packs * matMult * colMult * ncrMult * copyMult * setsMult;

    if (cfg.pricingKind === 'area' && cfg.hasDimensions) {
      const wq = toQuarterInches(selection.dimWidth);
      const hq = toQuarterInches(selection.dimHeight);
      if (wq <= 0 || hq <= 0) {
        return { hasPrice: false, quoteOnly: true, invalidDimensions: true, unitName: cfg.unitName };
      }
      areaSqIn = ((wq * hq) / 16).toFixed(2);
      baseAmount = (baseAmount * wq * hq) / 16;
    }

    if (activeSheet.minimum && baseAmount < Number(activeSheet.minimum)) {
      baseAmount = Number(activeSheet.minimum);
    }

    if (cfg.supportsFoil && selection.foil && selection.foil !== 'none') {
      const foilRate = selection.foil === 'silver' ? activeSheet.foilSilver : activeSheet.foilGold;
      if (foilRate) foilExtra += Number(foilRate) * packs;
    }
    if (cfg.supportsSpotUv && selection.spotUv && selection.spotUv !== 'none') {
      const uvRate = (isBothSides && activeSheet.spotUvBoth) ? activeSheet.spotUvBoth : activeSheet.spotUvSingle;
      if (uvRate) spotUvExtra += Number(uvRate) * packs;
    }

    if (activeSheet.finishing && selection.selectedAddons) {
      for (const [fk, enabled] of Object.entries(selection.selectedAddons)) {
        if (enabled && activeSheet.finishing[fk]) {
          finishingExtra += Number(activeSheet.finishing[fk]);
        }
      }
    }

    if (cfg.showDelivery) {
      if (selection.deliveryMode === 'courier') {
        deliveryCharge = Number(activeSheet.courierPerPack || 60) * packs;
      } else if (selection.deliveryMode === 'transport') {
        deliveryCharge = Number(activeSheet.transportPerParcel || 300);
      }
    }
  } else {
    const rawRate = Number(product?.pricingConfig?.baseRate ?? product?.baseRate ?? 0);
    if (!rawRate || rawRate <= 0) {
      return { hasPrice: false, quoteOnly: true, unitName: cfg.unitName };
    }
    const sideMultiplier = printMultCustom > 0
      ? printMultCustom
      : (isBothSides && cfg.supportsBoth ? Number(product?.pricingConfig?.bothSidesMultiplier || 1.4) : 1.0);

    baseAmount = qty * rawRate * sideMultiplier * matMult * colMult * ncrMult * copyMult * setsMult;

    if (cfg.supportsFoil && selection.foil && selection.foil !== 'none') {
      foilExtra = Math.round(Math.max(325, baseAmount * 0.15));
    }
    if (cfg.supportsSpotUv && selection.spotUv && selection.spotUv !== 'none') {
      spotUvExtra = Math.round(Math.max(195, baseAmount * 0.15));
    }
    if (cfg.showDelivery) {
      if (selection.deliveryMode === 'courier') deliveryCharge = 60;
      else if (selection.deliveryMode === 'transport') deliveryCharge = 300;
    }
  }

  baseAmount = Math.round(baseAmount);
  const netSubtotal = Math.round(baseAmount + foilExtra + spotUvExtra + finishingExtra + deliveryCharge);
  const gstAmount = customerClass === 'gst' ? Math.round(netSubtotal * (cfg.gstPercent / 100)) : 0;
  const totalAmount = Math.round(netSubtotal + gstAmount);
  const unitPrice = effectiveQty > 0 ? Number((totalAmount / effectiveQty).toFixed(2)) : 0;

  return {
    hasPrice: true,
    quoteOnly: false,
    qty: effectiveQty,
    packs,
    areaSqIn,
    baseAmount,
    foilExtra: Math.round(foilExtra),
    spotUvExtra: Math.round(spotUvExtra),
    finishingExtra: Math.round(finishingExtra),
    deliveryCharge: Math.round(deliveryCharge),
    netSubtotal,
    gstAmount,
    totalAmount,
    unitPrice,
    unitName: cfg.unitName,
    customerClass
  };
}
