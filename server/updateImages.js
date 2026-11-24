import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75';
const publicDir = path.join(__dirname, '..', 'client', 'public', 'images');
const prodImagesDir = path.join(publicDir, 'products');
const catImagesDir = path.join(publicDir, 'categories');
const uploadsDir = path.join(__dirname, 'uploads');
const dbFile = path.join(__dirname, '..', 'data', 'printizer.json');

// Ensure directories exist
[prodImagesDir, catImagesDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Find latest file in brain directory matching pattern
function findLatestBrainFile(prefix) {
  if (!fs.existsSync(brainDir)) return null;
  const files = fs.readdirSync(brainDir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.jpg'))
    .map(f => ({ name: f, time: fs.statSync(path.join(brainDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return files.length > 0 ? path.join(brainDir, files[0].name) : null;
}

// Copy file helper
function safeCopy(src, dst) {
  if (src && fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${path.basename(src)} -> ${dst}`);
    return true;
  }
  return false;
}

// 1. Copy category images
const catFiles = {
  'business-printing.jpg': findLatestBrainFile('business_printing'),
  'marketing-printing.jpg': findLatestBrainFile('marketing_printing'),
  'packaging-printing.jpg': findLatestBrainFile('packaging_printing'),
  'stickers-labels.jpg': findLatestBrainFile('stickers_labels'),
  'large-format-printing.jpg': findLatestBrainFile('large_format_printing'),
  'custom-printing.jpg': findLatestBrainFile('custom_printing')
};

for (const [targetName, srcPath] of Object.entries(catFiles)) {
  if (srcPath) {
    safeCopy(srcPath, path.join(catImagesDir, targetName));
    safeCopy(srcPath, path.join(uploadsDir, targetName));
  }
}

// 2. Copy product images
const prodFiles = {
  'letterheads-stationery.jpg': findLatestBrainFile('letterheads_stationery'),
  'promotional-flyers.jpg': findLatestBrainFile('promotional_flyers'),
  'packaging-boxes.jpg': findLatestBrainFile('packaging_boxes'),
  'paper-shopping-bags.jpg': findLatestBrainFile('paper_shopping_bags'),
  'die-cut-stickers.jpg': findLatestBrainFile('die_cut_stickers'),
  'standee-banners.jpg': findLatestBrainFile('standee_banners'),
  'calendar-certificates.jpg': findLatestBrainFile('calendar_certificates')
};

for (const [targetName, srcPath] of Object.entries(prodFiles)) {
  if (srcPath) {
    safeCopy(srcPath, path.join(prodImagesDir, targetName));
    safeCopy(srcPath, path.join(uploadsDir, targetName));
  }
}

// 3. Update data/printizer.json
if (fs.existsSync(dbFile)) {
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  // Update categories
  data.categories = data.categories.map(c => {
    return {
      ...c,
      image: `/images/categories/${c.id}.jpg`
    };
  });

  // Map each product to a real commercial printing image
  const productImages = {
    // 1. Business Printing
    'prd-visiting-cards': '/images/visiting-card-red-gloss.jpg',
    'prd-business-cards': '/images/categories/business-printing.jpg',
    'prd-letterheads': '/images/products/letterheads-stationery.jpg',
    'prd-envelopes': '/images/products/letterheads-stationery.jpg',
    'prd-company-stationery': '/images/products/letterheads-stationery.jpg',
    'prd-notepads': '/images/products/letterheads-stationery.jpg',
    'prd-presentation-folders': '/images/categories/business-printing.jpg',

    // 2. Marketing Printing
    'prd-flyers': '/images/products/promotional-flyers.jpg',
    'prd-brochures': '/images/categories/marketing-printing.jpg',
    'prd-posters': '/images/products/promotional-flyers.jpg',
    'prd-catalogues': '/images/categories/marketing-printing.jpg',
    'prd-booklets': '/images/categories/marketing-printing.jpg',
    'prd-promotional-cards': '/images/products/promotional-flyers.jpg',
    'prd-invitation-cards': '/images/categories/custom-printing.jpg',

    // 3. Packaging Printing
    'prd-custom-packaging-boxes': '/images/categories/packaging-printing.jpg',
    'prd-product-boxes': '/images/products/packaging-boxes.jpg',
    'prd-paper-bags': '/images/products/paper-shopping-bags.jpg',
    'prd-packaging-sleeves': '/images/products/packaging-boxes.jpg',
    'prd-printed-cartons': '/images/categories/packaging-printing.jpg',

    // 4. Stickers & Labels
    'prd-custom-stickers': '/images/categories/stickers-labels.jpg',
    'prd-product-labels': '/images/categories/stickers-labels.jpg',
    'prd-transparent-stickers': '/images/products/die-cut-stickers.jpg',
    'prd-die-cut-stickers': '/images/products/die-cut-stickers.jpg',
    'prd-roll-labels': '/images/categories/stickers-labels.jpg',
    'prd-barcode-labels': '/images/products/die-cut-stickers.jpg',

    // 5. Large Format Printing
    'prd-flex-banners': '/images/products/standee-banners.jpg',
    'prd-vinyl-banners': '/images/products/standee-banners.jpg',
    'prd-roll-up-banners': '/images/categories/large-format-printing.jpg',
    'prd-standee-printing': '/images/products/standee-banners.jpg',
    'prd-signage': '/images/categories/large-format-printing.jpg',
    'prd-backlit-prints': '/images/categories/large-format-printing.jpg',

    // 6. Custom Printing
    'prd-wedding-cards': '/images/categories/custom-printing.jpg',
    'prd-greeting-cards': '/images/categories/custom-printing.jpg',
    'prd-calendars': '/images/products/calendar-certificates.jpg',
    'prd-certificates': '/images/products/calendar-certificates.jpg',
    'prd-customised-promotional-materials': '/images/products/calendar-certificates.jpg',
    'prd-special-printing-requirements': '/images/categories/custom-printing.jpg'
  };

  data.products = data.products.map(p => {
    const assignedImage = productImages[p.id] || `/images/categories/${p.categoryId}.jpg`;
    return {
      ...p,
      image: assignedImage,
      secondaryImages: [
        assignedImage,
        `/images/categories/${p.categoryId}.jpg`
      ]
    };
  });

  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${data.categories.length} categories and ${data.products.length} products in ${dbFile}`);
}
