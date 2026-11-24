import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, '..', 'data', 'printizer.json');

if (fs.existsSync(dbFile)) {
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  // 1. Map Categories to user's authentic images in /images/categories/
  const categoryImageMap = {
    'business-printing': '/images/categories/visiting-card.webp',
    'marketing-printing': '/images/categories/art-paper.webp',
    'packaging-printing': '/images/categories/box.webp',
    'stickers-labels': '/images/categories/sticker.webp',
    'large-format-printing': '/images/categories/special-job.webp',
    'custom-printing': '/images/categories/art-mix.webp'
  };

  data.categories = data.categories.map(c => ({
    ...c,
    image: categoryImageMap[c.id] || `/images/categories/${c.id}.webp`
  }));

  // 2. Map Products to user's authentic images
  const productImageMap = {
    // Business Printing
    'prd-visiting-cards': {
      image: '/images/products/art-card-lamination.webp',
      secondaryImages: [
        '/images/products/art-card-lamination.webp',
        '/images/products/art-card.webp',
        '/images/products/matt-card.webp',
        '/images/products/matt-card-uv.webp'
      ]
    },
    'prd-business-cards': {
      image: '/images/categories/premium-visiting-card.webp',
      secondaryImages: [
        '/images/categories/premium-visiting-card.webp',
        '/images/products/gold-foil.webp',
        '/images/products/silver-foil.webp',
        '/images/products/round-cut-uv.webp',
        '/images/products/drip-off-nt.webp'
      ]
    },
    'prd-letterheads': {
      image: '/images/categories/letter-pad.webp',
      secondaryImages: ['/images/categories/letter-pad.webp', '/images/slides/stationery.webp']
    },
    'prd-envelopes': {
      image: '/images/categories/cover.webp',
      secondaryImages: ['/images/categories/cover.webp', '/images/slides/stationery.webp']
    },
    'prd-company-stationery': {
      image: '/images/slides/stationery.webp',
      secondaryImages: ['/images/slides/stationery.webp', '/images/categories/letter-pad.webp', '/images/categories/cover.webp']
    },
    'prd-notepads': {
      image: '/images/categories/letter-pad.webp',
      secondaryImages: ['/images/categories/letter-pad.webp']
    },
    'prd-presentation-folders': {
      image: '/images/categories/cover.webp',
      secondaryImages: ['/images/categories/cover.webp', '/images/slides/stationery.webp']
    },

    // Packaging Printing
    'prd-custom-packaging-boxes': {
      image: '/images/categories/box.webp',
      secondaryImages: ['/images/categories/box.webp', '/images/slides/packaging.webp']
    },
    'prd-product-boxes': {
      image: '/images/categories/box.webp',
      secondaryImages: ['/images/categories/box.webp', '/images/slides/packaging.webp']
    },
    'prd-paper-bags': {
      image: '/images/slides/packaging.webp',
      secondaryImages: ['/images/slides/packaging.webp', '/images/categories/box.webp']
    },
    'prd-packaging-sleeves': {
      image: '/images/categories/box.webp',
      secondaryImages: ['/images/categories/box.webp']
    },
    'prd-printed-cartons': {
      image: '/images/slides/packaging.webp',
      secondaryImages: ['/images/slides/packaging.webp']
    },

    // Stickers & Labels
    'prd-custom-stickers': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },
    'prd-product-labels': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },
    'prd-transparent-stickers': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },
    'prd-die-cut-stickers': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },
    'prd-roll-labels': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },
    'prd-barcode-labels': {
      image: '/images/categories/sticker.webp',
      secondaryImages: ['/images/categories/sticker.webp']
    },

    // Marketing Printing
    'prd-flyers': {
      image: '/images/categories/art-paper.webp',
      secondaryImages: ['/images/categories/art-paper.webp', '/images/categories/art-mix.webp']
    },
    'prd-brochures': {
      image: '/images/categories/art-paper.webp',
      secondaryImages: ['/images/categories/art-paper.webp', '/images/categories/art-mix.webp']
    },
    'prd-posters': {
      image: '/images/categories/art-paper.webp',
      secondaryImages: ['/images/categories/art-paper.webp']
    },
    'prd-catalogues': {
      image: '/images/categories/art-mix.webp',
      secondaryImages: ['/images/categories/art-mix.webp', '/images/categories/art-paper.webp']
    },
    'prd-booklets': {
      image: '/images/categories/art-mix.webp',
      secondaryImages: ['/images/categories/art-mix.webp']
    },
    'prd-promotional-cards': {
      image: '/images/categories/art-paper.webp',
      secondaryImages: ['/images/categories/art-paper.webp']
    },
    'prd-invitation-cards': {
      image: '/images/products/gold-foil.webp',
      secondaryImages: ['/images/products/gold-foil.webp', '/images/categories/premium-visiting-card.webp']
    },

    // Large Format Printing
    'prd-flex-banners': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-vinyl-banners': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-roll-up-banners': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-standee-printing': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-signage': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-backlit-prints': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },

    // Custom Printing
    'prd-wedding-cards': {
      image: '/images/products/gold-foil.webp',
      secondaryImages: ['/images/products/gold-foil.webp', '/images/products/silver-foil.webp', '/images/categories/premium-visiting-card.webp']
    },
    'prd-greeting-cards': {
      image: '/images/products/silver-foil.webp',
      secondaryImages: ['/images/products/silver-foil.webp', '/images/products/round-cut-uv.webp']
    },
    'prd-calendars': {
      image: '/images/slides/stationery.webp',
      secondaryImages: ['/images/slides/stationery.webp']
    },
    'prd-certificates': {
      image: '/images/products/gold-foil.webp',
      secondaryImages: ['/images/products/gold-foil.webp', '/images/categories/special-job.webp']
    },
    'prd-customised-promotional-materials': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    },
    'prd-special-printing-requirements': {
      image: '/images/categories/special-job.webp',
      secondaryImages: ['/images/categories/special-job.webp']
    }
  };

  data.products = data.products.map(p => {
    const custom = productImageMap[p.id];
    if (custom) {
      return {
        ...p,
        image: custom.image,
        secondaryImages: custom.secondaryImages
      };
    }
    return p;
  });

  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Synced ${data.categories.length} categories and ${data.products.length} products to user images!`);
}
