import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { generateQuotationPdf } from './pdfGenerator.js';
import { sendAdminEnquiryNotification, sendCustomerAcknowledgment, sendCustomerQuotationEmail } from './emailService.js';

dotenv.config();

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
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
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

// 2. Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Products
app.get('/api/products', (req, res) => {
  try {
    const { category, search } = req.query;
    const products = db.getProducts(category, search);
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

app.post('/api/products', (req, res) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
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

app.delete('/api/products/:id', (req, res) => {
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
      additionalRequirements
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
      artworkPath,
      artworkOriginalName
    });

    // Prepare WhatsApp continue link
    const waText = `Hello PRINTIZER,
I am interested in getting a quotation for the following product.
Product: ${enquiry.productName}
Quantity: ${enquiry.quantity}
Size: ${enquiry.dimensions || 'As required'}
Material: ${enquiry.material || 'Please suggest'}
Name: ${enquiry.customerName}
Enquiry Ref: ${enquiry.referenceNo}
Please share your best quotation.
Thank you.`;

    const whatsappUrl = `https://wa.me/919898351920?text=${encodeURIComponent(waText)}`;

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

app.get('/api/enquiries', (req, res) => {
  try {
    const { status, search } = req.query;
    const list = db.getEnquiries(status, search);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiries/:id', (req, res) => {
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

app.put('/api/enquiries/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
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
app.post('/api/enquiries/:id/quote', (req, res) => {
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
app.post('/api/enquiries/:id/send-email', async (req, res) => {
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

// 8. Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'printizer@2026';

  if (username === adminUser && password === adminPass) {
    res.json({
      success: true,
      token: 'printizer-admin-session-token-' + Date.now(),
      user: { username: 'admin', role: 'Super Admin', brand: 'PRINTIZER' }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }
});

// 9. Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: db.getSettings() });
});

app.put('/api/settings', (req, res) => {
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

// Start Server
if (!process.env.VERCEL) {
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
