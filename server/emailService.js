import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EMAILS_DIR = path.join(__dirname, '..', 'data', 'sent_emails');

if (!fs.existsSync(EMAILS_DIR)) {
  fs.mkdirSync(EMAILS_DIR, { recursive: true });
}

// Check if live SMTP is configured
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
}

/**
 * Send notification to PRINTIZER Admin when a new quotation enquiry is submitted
 */
export async function sendAdminEnquiryNotification(enquiry) {
  const transporter = getTransporter();
  const subject = `NEW QUOTATION ENQUIRY — ${enquiry.productName.toUpperCase()}`;
  const adminEmail = process.env.ADMIN_EMAIL || 'Printizerdesign@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0b1a30; }
        .card { max-width: 620px; background: #ffffff; margin: 0 auto; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #0b1a30; padding: 24px 30px; text-align: left; border-bottom: 4px solid #e11438; }
        .header h1 { color: #ffffff; margin: 0 0 6px 0; font-size: 20px; letter-spacing: 0.5px; }
        .header p { color: #94a3b8; margin: 0; font-size: 13px; }
        .content { padding: 30px; }
        .ref-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
        .section-title { font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        td { padding: 8px 10px; font-size: 14px; vertical-align: top; }
        td.label { color: #64748b; width: 38%; font-weight: 500; }
        td.val { color: #0b1a30; font-weight: 600; }
        .cta-box { margin-top: 25px; padding: 16px; background: #f8fafc; border-radius: 6px; text-align: center; }
        .btn { display: inline-block; background: #e11438; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { background: #f8fafc; padding: 16px 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>PRINTIZER</h1>
          <p>Everything Your Business Needs to Print.</p>
        </div>
        <div class="content">
          <span class="ref-badge">Enquiry Ref: ${enquiry.referenceNo}</span>
          <p style="margin-top: 0; font-size: 15px; color: #334155;">
            A new quotation enquiry has been submitted through <strong>Printizer.in</strong>.
          </p>

          <div class="section-title">Client Information</div>
          <table>
            <tr><td class="label">Customer Name:</td><td class="val">${enquiry.customerName}</td></tr>
            <tr><td class="label">Business / Company:</td><td class="val">${enquiry.businessName || 'Not Provided'}</td></tr>
            <tr><td class="label">WhatsApp / Phone:</td><td class="val">${enquiry.whatsappNumber}</td></tr>
            <tr><td class="label">Email Address:</td><td class="val"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
            <tr><td class="label">Submission Date:</td><td class="val">${new Date(enquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          </table>

          <div class="section-title">Print Specifications</div>
          <table>
            <tr><td class="label">Requested Product:</td><td class="val" style="color: #e11438;">${enquiry.productName}</td></tr>
            <tr><td class="label">Required Quantity:</td><td class="val">${enquiry.quantity}</td></tr>
            <tr><td class="label">Size / Dimensions:</td><td class="val">${enquiry.dimensions || 'Standard / Per Spec'}</td></tr>
            <tr><td class="label">Material Preference:</td><td class="val">${enquiry.material || 'To be recommended by PRINTIZER'}</td></tr>
            <tr><td class="label">Finishing Preference:</td><td class="val">${enquiry.finishing || 'Standard / None'}</td></tr>
            <tr><td class="label">Artwork / Reference:</td><td class="val">${enquiry.artworkOriginalName ? `Attached: ${enquiry.artworkOriginalName}` : 'No file uploaded'}</td></tr>
          </table>

          ${enquiry.additionalRequirements ? `
            <div class="section-title">Additional Client Requirements</div>
            <p style="background: #f8fafc; padding: 12px; border-left: 3px solid #0b1a30; font-size: 13.5px; color: #334155; margin: 5px 0 20px 0;">
              ${enquiry.additionalRequirements}
            </p>
          ` : ''}

          <div class="cta-box">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">Open the Admin Portal to prepare and send the formal PDF quotation:</p>
            <a href="https://Printizer.in/admin" class="btn">Prepare Quotation in Dashboard</a>
          </div>
        </div>
        <div class="footer">
          PRINTIZER &bull; https://Printizer.in &bull; +91 98983 51920
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"PRINTIZER Enquiries" <${process.env.SMTP_USER || adminEmail}>`,
        to: adminEmail,
        replyTo: enquiry.email,
        subject,
        html: htmlContent
      });
      console.log(`[Email] Admin notification sent for ${enquiry.referenceNo}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error(`[Email Error] Failed sending admin email:`, err);
    }
  }

  // Fallback: save to disk for preview / logging
  const filename = `${enquiry.referenceNo}_admin_notification.html`;
  fs.writeFileSync(path.join(EMAILS_DIR, filename), htmlContent, 'utf-8');
  console.log(`[Email Mock/Preview] Saved admin enquiry email to data/sent_emails/${filename}`);
  return { success: true, mode: 'preview', previewFile: filename };
}

/**
 * Send acknowledgment email to customer
 */
export async function sendCustomerAcknowledgment(enquiry) {
  const transporter = getTransporter();
  const subject = `Quotation Request Received — ${enquiry.productName} [Ref: ${enquiry.referenceNo}]`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0b1a30; }
        .card { max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0b1a30; padding: 25px 30px; text-align: left; border-bottom: 4px solid #e11438; }
        .header h1 { color: #ffffff; margin: 0 0 5px 0; font-size: 20px; }
        .header p { color: #94a3b8; margin: 0; font-size: 13px; }
        .content { padding: 30px; }
        .ref-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px; margin: 18px 0; text-align: center; }
        .ref-id { font-size: 18px; font-weight: bold; color: #1e40af; }
        .steps { margin: 20px 0; padding: 0; list-style: none; }
        .steps li { margin-bottom: 12px; font-size: 14px; line-height: 1.5; color: #334155; }
        .wa-btn { display: inline-block; background: #25d366; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
        .footer { background: #f8fafc; padding: 16px 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>PRINTIZER</h1>
          <p>Everything Your Business Needs to Print.</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${enquiry.customerName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Thank you for choosing <strong>PRINTIZER</strong>. We have successfully received your quotation request for <strong>${enquiry.productName}</strong> (Quantity: ${enquiry.quantity}).
          </p>

          <div class="ref-box">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Your Enquiry Reference Number</div>
            <div class="ref-id">${enquiry.referenceNo}</div>
          </div>

          <h3 style="font-size: 14px; color: #0b1a30; margin-top: 24px; margin-bottom: 8px;">What Happens Next?</h3>
          <ul class="steps">
            <li><strong>1. Requirement Review:</strong> Our printing specialists are carefully evaluating your dimensions, material selection, and finishing requirements.</li>
            <li><strong>2. Best Pricing Calculation:</strong> We will draft your tailored quotation with optimal pricing and clear turnaround timelines.</li>
            <li><strong>3. Direct Delivery:</strong> You will receive the official PDF quotation via email and WhatsApp.</li>
          </ul>

          <div style="text-align: center; margin-top: 25px; padding: 15px; background: #f8fafc; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #475569;">Need an urgent price or immediate discussion?</p>
            <a href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20submitted%20enquiry%20${enquiry.referenceNo}%20for%20${encodeURIComponent(enquiry.productName)}" class="wa-btn">
              Chat With Us on WhatsApp
            </a>
          </div>
        </div>
        <div class="footer">
          PRINTIZER Solutions &bull; https://Printizer.in &bull; +91 98983 51920 &bull; Printizerdesign@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"PRINTIZER Solutions" <${process.env.SMTP_USER || 'Printizerdesign@gmail.com'}>`,
        to: enquiry.email,
        subject,
        html: htmlContent
      });
      console.log(`[Email] Customer acknowledgment sent to ${enquiry.email}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error(`[Email Error] Failed customer acknowledgment:`, err);
    }
  }

  const filename = `${enquiry.referenceNo}_customer_acknowledgment.html`;
  fs.writeFileSync(path.join(EMAILS_DIR, filename), htmlContent, 'utf-8');
  console.log(`[Email Mock/Preview] Saved customer acknowledgment email to data/sent_emails/${filename}`);
  return { success: true, mode: 'preview', previewFile: filename };
}

/**
 * Send formal quotation to customer with PDF link/attachment
 */
export async function sendCustomerQuotationEmail(enquiry, quotation) {
  const transporter = getTransporter();
  const subject = `Official PRINTIZER Quotation [${quotation.quotationNumber}] — ${enquiry.productName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0b1a30; }
        .card { max-width: 620px; background: #ffffff; margin: 0 auto; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0b1a30; padding: 24px 30px; text-align: left; border-bottom: 4px solid #e11438; }
        .header h1 { color: #ffffff; margin: 0 0 4px 0; font-size: 20px; }
        .header p { color: #94a3b8; margin: 0; font-size: 13px; }
        .content { padding: 30px; }
        .quote-total { background: #0b1a30; color: #ffffff; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .total-amount { font-size: 26px; font-weight: bold; color: #ffffff; margin-top: 6px; }
        .btn { display: inline-block; background: #e11438; color: #ffffff !important; padding: 12px 26px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
        .footer { background: #f8fafc; padding: 16px 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>PRINTIZER</h1>
          <p>Everything Your Business Needs to Print.</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${enquiry.customerName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            We are pleased to present the formal quotation for your printing requirement: <strong>${enquiry.productName}</strong>.
          </p>

          <div class="quote-total">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Final Quotation Amount (All Taxes & Logistics Included)</div>
            <div class="total-amount">₹ ${Number(quotation.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">Quotation No: ${quotation.quotationNumber} | Valid for ${quotation.validityDays || 15} days</div>
          </div>

          <div style="margin: 20px 0; font-size: 13.5px; line-height: 1.6; color: #334155;">
            <p><strong>Timeline:</strong> ${quotation.deliveryEstimate}</p>
            <p><strong>Payment Terms:</strong> ${quotation.paymentTerms}</p>
            ${quotation.customNotes ? `<p><strong>Special Notes:</strong> ${quotation.customNotes}</p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://wa.me/919898351920?text=Hello%20PRINTIZER%2C%20I%20would%20like%20to%20confirm%20Quotation%20${quotation.quotationNumber}%20for%20${encodeURIComponent(enquiry.productName)}" class="btn">
              Approve & Confirm on WhatsApp
            </a>
          </div>
        </div>
        <div class="footer">
          PRINTIZER &bull; https://Printizer.in &bull; +91 98983 51920 &bull; Printizerdesign@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"PRINTIZER Quotations" <${process.env.SMTP_USER || 'Printizerdesign@gmail.com'}>`,
        to: enquiry.email,
        subject,
        html: htmlContent
      });
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error(`[Email Error] Failed customer quotation email:`, err);
    }
  }

  const filename = `${quotation.quotationNumber}_formal_quote.html`;
  fs.writeFileSync(path.join(EMAILS_DIR, filename), htmlContent, 'utf-8');
  console.log(`[Email Mock/Preview] Saved quotation email to data/sent_emails/${filename}`);
  return { success: true, mode: 'preview', previewFile: filename };
}
