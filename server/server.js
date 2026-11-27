import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { generateQuotationPdf } from './pdfGenerator.js';
import { sendAdminEnquiryNotification, sendCustomerAcknowledgment, sendCustomerQuotationEmail } from './emailService.js';

dotenv.config();

const AUTH_SECRET = process.env.ADMIN_JWT_SECRET || crypto.createHash('sha256').update(process.env.ADMIN_PASS || 'printizer@2026-secret-key').digest('hex');

function signAdminToken(payload) {
  const data = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24h session
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function requireAdminAuth(allowedRoles = ['Super Admin', 'Manager', 'Staff']) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : (req.query.token || '');
    const user = verifyAdminToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Valid admin session required.' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient role permissions.' });
    }
    req.adminUser = user;
    next();
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
const productUploadDir = path.join(uploadDir, 'products');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(productUploadDir)) {
    fs.mkdirSync(productUploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Upload dir init warning:', e.message);
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));
app.use('/images', express.static(path.join(__dirname, '..', 'client', 'public', 'images')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// Dedicated Multer Storage for Product Images (isolated per product ID / unique timestamp)
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const pid = (req.body.productId || 'new')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname) || '.webp';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
    cb(null, `${pid}-${uniqueSuffix}-${base}${ext}`);
  }
});

const productImageUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files (WebP, PNG, JPG, GIF) are allowed.'));
    }
    cb(null, true);
  }
});

// ======================== API ROUTES ========================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'PRINTIZER',
    tagline: 'Everything Your Business Needs to Print.',
    timestamp: new Date().toISOString()
  });
});

// 2. Categories (Public: enabled only; Admin: all)
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories(false);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/categories', requireAdminAuth(), (req, res) => {
  try {
    const categories = db.getCategories(true);
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const created = db.addCategory(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/reorder', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const updated = db.reorderCategories(req.body.orderedIds || []);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:id', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdminAuth(['Super Admin']), (req, res) => {
  try {
    const ok = db.deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Products (Public: enabled only & no supplier pricing; Admin: all)
app.get('/api/products', (req, res) => {
  try {
    const { category, search } = req.query;
    const products = db.getProducts(category, search, false);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/products', requireAdminAuth(), (req, res) => {
  try {
    const { category, search } = req.query;
    const products = db.getProducts(category, search, true);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. Rates (+30% Retail Markup Official Price List)
app.get('/api/rates', (req, res) => {
  try {
    const { group, search } = req.query;
    const rates = db.getRates(group, search);
    res.json({ success: true, count: rates.length, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:slug', (req, res) => {
  try {
    const product = db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products/upload-image', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  productImageUpload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files uploaded.' });
    }
    const results = files.map(f => {
      let url = `/uploads/products/${f.filename}`;
      if (process.env.VERCEL) {
        try {
          const buf = fs.readFileSync(f.path);
          url = `data:${f.mimetype || 'image/webp'};base64,${buf.toString('base64')}`;
        } catch (e) {
          // keep file path fallback
        }
      }
      return {
        url,
        filename: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      };
    });
    res.status(201).json({ success: true, files: results });
  });
});

app.put('/api/products/:id/images', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const { image, secondaryImages } = req.body;
    const updated = db.updateProduct(req.params.id, { image, secondaryImages });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', requireAdminAuth(['Super Admin']), (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Enquiries (Quotation Requests)
app.post('/api/enquiries', upload.single('artwork'), async (req, res) => {
  try {
    const {
      customerName,
      businessName,
      whatsappNumber,
      email,
      productSlug,
      productName,
      quantity,
      dimensions,
      material,
      finishing,
      additionalRequirements,
      jobName,
      estimatedPrice,
      selectedOptions
    } = req.body;

    if (!customerName || !whatsappNumber || !email) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, WhatsApp number, and email are required.'
      });
    }

    const artworkPath = req.file ? `/uploads/${req.file.filename}` : null;
    const artworkOriginalName = req.file ? req.file.originalname : null;

    const enquiry = db.createEnquiry({
      customerName,
      businessName,
      whatsappNumber,
      email,
      productSlug,
      productName: productName || 'Custom Printing',
      quantity,
      dimensions,
      material,
      finishing,
      additionalRequirements,
      jobName,
      estimatedPrice,
      selectedOptions,
      artworkPath,
      artworkOriginalName
    });

    // Prepare WhatsApp continue link
    const waText = `Hello PRINTIZER,
I would like to request an official quotation:
Product: ${enquiry.productName}
Quantity: ${enquiry.quantity}
Size/Specs: ${enquiry.dimensions || 'Standard'}
Material: ${enquiry.material || 'Standard'}
Finishing: ${enquiry.finishing || 'Standard'}
${enquiry.estimatedPrice ? `Estimated Price: ₹ ${enquiry.estimatedPrice}\n` : ''}Job Name: ${enquiry.jobName || 'Commercial Order'}
Customer: ${enquiry.customerName}
Enquiry Ref: ${enquiry.referenceNo}

Please share the official quotation and artwork review.
Thank you.`;

    const whatsappUrl = `https://wa.me/917574927200?text=${encodeURIComponent(waText)}`;

    // Dispatch background email notifications
    sendAdminEnquiryNotification(enquiry).catch(e => console.error('Admin email error:', e));
    sendCustomerAcknowledgment(enquiry).catch(e => console.error('Customer ack email error:', e));

    res.status(201).json({
      success: true,
      message: 'Your quotation enquiry has been submitted successfully.',
      referenceNo: enquiry.referenceNo,
      enquiryId: enquiry.id,
      whatsappUrl,
      data: enquiry
    });
  } catch (err) {
    console.error('Create Enquiry Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiries', requireAdminAuth(), (req, res) => {
  try {
    const { status, search } = req.query;
    const list = db.getEnquiries(status, search);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiries/:id', requireAdminAuth(), (req, res) => {
  try {
    const item = db.getEnquiryById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/enquiries/:id/status', requireAdminAuth(), (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'New',
      'Contacted',
      'Quoted',
      'Converted',
      'Closed',
      'New Enquiry',
      'Under Review',
      'Quotation Prepared',
      'Quotation Sent',
      'Awaiting Customer Approval',
      'Confirmed',
      'Completed',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = db.updateEnquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Quotation Generation & Management
app.post('/api/enquiries/:id/quote', requireAdminAuth(), (req, res) => {
  try {
    const enquiry = db.getEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    const updated = db.saveQuotation(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Download Quotation PDF
app.get('/api/enquiries/:id/pdf', (req, res) => {
  try {
    const enquiry = db.getEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    const quotation = enquiry.quotation || {
      quotationNumber: `PRZ-QT-${enquiry.referenceNo}`,
      items: [
        {
          description: `${enquiry.productName} - Custom Printing`,
          quantity: enquiry.quantity,
          unitPrice: 0,
          amount: 0
        }
      ],
      subtotal: 0,
      gstPercent: 18,
      gstAmount: 0,
      shippingCharges: 0,
      discount: 0,
      grandTotal: 0,
      validityDays: 15,
      deliveryEstimate: '3-5 business days after artwork approval',
      paymentTerms: '50% advance to start printing, balance prior to dispatch',
      customNotes: enquiry.additionalRequirements || ''
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Quotation-${quotation.quotationNumber || enquiry.referenceNo}.pdf"`
    );

    generateQuotationPdf(enquiry, quotation, res);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Send Quotation via Email to Customer
app.post('/api/enquiries/:id/send-email', requireAdminAuth(), async (req, res) => {
  try {
    const enquiry = db.getEnquiryById(req.params.id);
    if (!enquiry || !enquiry.quotation) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send email: Quotation has not been prepared yet.'
      });
    }

    const result = await sendCustomerQuotationEmail(enquiry, enquiry.quotation);
    
    // Update status to Quotation Sent
    db.updateEnquiryStatus(enquiry.id, 'Quotation Sent');

    res.json({
      success: true,
      message: 'Quotation email dispatched to customer successfully.',
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin Authentication & Session Verification
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'printizer@2026';

  const users = [
    { username: adminUser, password: adminPass, role: 'Super Admin', name: 'PRINTIZER Admin' },
    { username: process.env.MANAGER_USER || 'manager', password: process.env.MANAGER_PASS || 'manager@2026', role: 'Manager', name: 'Print Manager' },
    { username: process.env.STAFF_USER || 'staff', password: process.env.STAFF_PASS || 'staff@2026', role: 'Staff', name: 'Operations Staff' }
  ];

  const matched = users.find(u => u.username === username && u.password === password);
  if (matched) {
    const userPayload = { username: matched.username, role: matched.role, name: matched.name, brand: 'PRINTIZER' };
    const token = signAdminToken(userPayload);
    res.json({
      success: true,
      token,
      user: userPayload
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }
});

app.get('/api/auth/verify', requireAdminAuth(), (req, res) => {
  res.json({ success: true, user: req.adminUser });
});

// 9. Stats & Analytics (Protected)
app.get('/api/stats', requireAdminAuth(), (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/analytics', requireAdminAuth(), (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = db.getAnalytics({ startDate, endDate });
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9b. Orders Management (POST public for checkout; GET/PUT/DELETE protected)
app.post('/api/orders', (req, res) => {
  try {
    const created = db.createOrder(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders', requireAdminAuth(), (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const orders = db.getOrders({ status, search, startDate, endDate });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id', requireAdminAuth(), (req, res) => {
  try {
    const updated = db.updateOrder(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/orders/:id', requireAdminAuth(['Super Admin']), (req, res) => {
  try {
    const ok = db.deleteOrder(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9c. Customers Database (Protected)
app.get('/api/customers', requireAdminAuth(), (req, res) => {
  try {
    const customers = db.getCustomers(req.query.search || '');
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9d. Promotions & Banners (Public active; Admin full)
app.get('/api/promotions', (req, res) => {
  try {
    res.json({ success: true, data: db.getPromotions(false) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/promotions', requireAdminAuth(), (req, res) => {
  try {
    res.json({ success: true, data: db.getPromotions(true) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/promotions', requireAdminAuth(['Super Admin', 'Manager']), (req, res) => {
  try {
    const updated = db.updatePromotions(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Settings (Public read; Admin update)
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: db.getSettings() });
});

app.put('/api/settings', requireAdminAuth(['Super Admin']), (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// If built frontend exists, serve it
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server only when run directly from CLI
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server')
);

if (isDirectRun && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` PRINTIZER Solutions Backend Server`);
    console.log(` Website: https://Printizer.in`);
    console.log(` Tagline: Everything Your Business Needs to Print.`);
    console.log(` Port: ${PORT}`);
    console.log(` API Ready at: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
