import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateQuotationPdf(enquiry, quotation, stream) {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    info: {
      Title: `Quotation ${quotation.quotationNumber || enquiry.referenceNo} - PRINTIZER`,
      Author: 'PRINTIZER Solutions',
      Subject: 'Commercial Printing Quotation',
      Keywords: 'Quotation, Printing, PRINTIZER'
    }
  });

  doc.pipe(stream);

  const navy = '#0B1A30';
  const crimson = '#E11438';
  const slateDark = '#1E293B';
  const slateLight = '#64748B';
  const bgLight = '#F8FAFC';
  const borderLight = '#E2E8F0';

  const logoPath = path.join(__dirname, 'printizer-logo-horizontal.jpeg');
  const logoAltPath = path.join(__dirname, 'printizer-logo.jpeg');

  // --- HEADER SECTION ---
  let headerTop = 40;

  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 40, headerTop, { width: 170 });
    } catch (e) {
      if (fs.existsSync(logoAltPath)) {
        try { doc.image(logoAltPath, 40, headerTop, { width: 110 }); } catch (err) {}
      }
    }
  }

  // Company Contact block on right
  doc.fontSize(16).fillColor(crimson).font('Helvetica-Bold')
     .text('FORMAL QUOTATION', 350, headerTop, { align: 'right' });
  doc.fontSize(9).fillColor(navy).font('Helvetica-Bold')
     .text('PRINTIZER SOLUTIONS', 350, headerTop + 20, { align: 'right' });
  doc.fontSize(8).fillColor(slateLight).font('Helvetica')
     .text('Everything Your Business Needs to Print.', 350, headerTop + 32, { align: 'right' })
     .text('Website: www.Printizer.in', 350, headerTop + 44, { align: 'right' })
     .text('Email: Printizerdesign@gmail.com', 350, headerTop + 56, { align: 'right' })
     .text('WhatsApp: +91 75749 27200', 350, headerTop + 68, { align: 'right' });

  // Decorative Accent bar
  doc.rect(40, headerTop + 85, 515, 3).fill(navy);
  doc.rect(40, headerTop + 85, 120, 3).fill(crimson);

  // --- QUOTATION & CLIENT METADATA ---
  const metaY = headerTop + 98;
  
  // Left Box: Customer Info
  doc.rect(40, metaY, 250, 85).fillAndStroke(bgLight, borderLight);
  doc.fontSize(9).fillColor(crimson).font('Helvetica-Bold').text('PREPARED FOR (CLIENT):', 50, metaY + 8);
  doc.fontSize(10).fillColor(navy).font('Helvetica-Bold').text(enquiry.customerName || 'Valued Client', 50, metaY + 22);
  if (enquiry.businessName) {
    doc.fontSize(9).fillColor(slateDark).font('Helvetica-Bold').text(enquiry.businessName, 50, metaY + 36);
  }
  doc.fontSize(8.5).fillColor(slateLight).font('Helvetica')
     .text(`Contact: ${enquiry.whatsappNumber || 'N/A'}`, 50, metaY + (enquiry.businessName ? 50 : 38))
     .text(`Email: ${enquiry.email || 'N/A'}`, 50, metaY + (enquiry.businessName ? 62 : 50));

  // Right Box: Quotation Details
  doc.rect(305, metaY, 250, 85).fillAndStroke(bgLight, borderLight);
  doc.fontSize(9).fillColor(navy).font('Helvetica-Bold').text('QUOTATION DETAILS:', 315, metaY + 8);
  
  const rightLabels = [
    { label: 'Quotation No:', val: quotation.quotationNumber || enquiry.referenceNo },
    { label: 'Enquiry Ref:', val: enquiry.referenceNo },
    { label: 'Date Issued:', val: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) },
    { label: 'Valid Until:', val: quotation.validUntil || `${quotation.validityDays || 15} Days from issue` }
  ];

  rightLabels.forEach((item, idx) => {
    const curY = metaY + 24 + (idx * 14);
    doc.fontSize(8).fillColor(slateLight).font('Helvetica').text(item.label, 315, curY);
    doc.fontSize(8.5).fillColor(navy).font('Helvetica-Bold').text(item.val, 400, curY);
  });

  // --- LINE ITEMS TABLE ---
  const tableY = metaY + 98;

  // Table Header
  doc.rect(40, tableY, 515, 24).fill(navy);
  doc.fontSize(8.5).fillColor('#FFFFFF').font('Helvetica-Bold');
  doc.text('#', 48, tableY + 7);
  doc.text('DESCRIPTION & SPECIFICATIONS', 70, tableY + 7);
  doc.text('QTY', 360, tableY + 7, { width: 45, align: 'center' });
  doc.text('RATE (₹)', 415, tableY + 7, { width: 55, align: 'right' });
  doc.text('AMOUNT (₹)', 480, tableY + 7, { width: 65, align: 'right' });

  // Items
  let curItemY = tableY + 24;
  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
    {
      description: `${enquiry.productName} - Custom Printing & Finishing`,
      quantity: enquiry.quantity || 1,
      unitPrice: quotation.subtotal / (enquiry.quantity || 1),
      amount: quotation.subtotal
    }
  ];

  items.forEach((item, i) => {
    const itemHeight = 36;
    doc.rect(40, curItemY, 515, itemHeight).fillAndStroke(i % 2 === 0 ? '#FFFFFF' : '#FAFAFA', borderLight);

    doc.fontSize(8.5).fillColor(navy).font('Helvetica-Bold').text(`${i + 1}`, 48, curItemY + 8);
    
    // Main item description
    doc.fontSize(9).fillColor(navy).font('Helvetica-Bold')
       .text(item.description || enquiry.productName, 70, curItemY + 6, { width: 280 });

    // Item sub-specs
    const specsParts = [];
    if (enquiry.dimensions) specsParts.push(`Size: ${enquiry.dimensions}`);
    if (enquiry.material) specsParts.push(`Material: ${enquiry.material}`);
    if (enquiry.finishing) specsParts.push(`Finish: ${enquiry.finishing}`);
    
    if (specsParts.length > 0) {
      doc.fontSize(7.5).fillColor(slateLight).font('Helvetica')
         .text(specsParts.join(' | '), 70, curItemY + 20, { width: 280 });
    }

    doc.fontSize(8.5).fillColor(navy).font('Helvetica')
       .text(String(item.quantity || enquiry.quantity), 360, curItemY + 10, { width: 45, align: 'center' });
    
    doc.fontSize(8.5).fillColor(navy).font('Helvetica')
       .text(Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 415, curItemY + 10, { width: 55, align: 'right' });

    doc.fontSize(8.5).fillColor(navy).font('Helvetica-Bold')
       .text(Number(item.amount || (item.quantity * item.unitPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 480, curItemY + 10, { width: 65, align: 'right' });

    curItemY += itemHeight;
  });

  // --- SUMMARY / TOTALS SECTION ---
  const summaryY = curItemY + 10;
  
  // Left: Delivery & Notes block
  doc.rect(40, summaryY, 290, 115).fillAndStroke(bgLight, borderLight);
  doc.fontSize(8.5).fillColor(navy).font('Helvetica-Bold').text('FULFILMENT & NOTES:', 50, summaryY + 8);

  doc.fontSize(8).fillColor(slateLight).font('Helvetica')
     .text('Delivery Timeline:', 50, summaryY + 24)
     .font('Helvetica-Bold').fillColor(navy)
     .text(quotation.deliveryEstimate || '3-5 business days after artwork approval', 130, summaryY + 24, { width: 190 });

  doc.fontSize(8).fillColor(slateLight).font('Helvetica')
     .text('Payment Terms:', 50, summaryY + 44)
     .font('Helvetica-Bold').fillColor(navy)
     .text(quotation.paymentTerms || '50% advance to start printing, 50% prior to dispatch', 130, summaryY + 44, { width: 190 });

  if (quotation.customNotes || enquiry.additionalRequirements) {
    doc.fontSize(8).fillColor(slateLight).font('Helvetica')
       .text('Custom Note:', 50, summaryY + 68)
       .font('Helvetica-Oblique').fillColor(slateDark)
       .text(quotation.customNotes || enquiry.additionalRequirements, 130, summaryY + 68, { width: 190 });
  }

  // Right: Price Breakdown
  const totalBoxX = 340;
  const totalBoxW = 215;
  doc.rect(totalBoxX, summaryY, totalBoxW, 115).fillAndStroke('#FFFFFF', borderLight);

  const calcRows = [
    { label: 'Subtotal:', val: `Rs. ${Number(quotation.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: `GST (${quotation.gstPercent || 18}%):`, val: `Rs. ${Number(quotation.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }
  ];

  if (Number(quotation.shippingCharges) > 0) {
    calcRows.push({ label: 'Shipping & Logistics:', val: `Rs. ${Number(quotation.shippingCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` });
  }
  if (Number(quotation.discount) > 0) {
    calcRows.push({ label: 'Special Discount:', val: `- Rs. ${Number(quotation.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` });
  }

  calcRows.forEach((row, idx) => {
    const rY = summaryY + 10 + (idx * 16);
    doc.fontSize(8).fillColor(slateLight).font('Helvetica').text(row.label, totalBoxX + 12, rY);
    doc.fontSize(8.5).fillColor(navy).font('Helvetica-Bold').text(row.val, totalBoxX + 100, rY, { width: 100, align: 'right' });
  });

  // Grand Total Highlight
  doc.rect(totalBoxX, summaryY + 80, totalBoxW, 35).fill(navy);
  doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text('FINAL TOTAL:', totalBoxX + 12, summaryY + 92);
  doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold')
     .text(`Rs. ${Number(quotation.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalBoxX + 80, summaryY + 90, { width: 120, align: 'right' });

  // --- TERMS & CONDITIONS ---
  const termsY = summaryY + 125;
  doc.rect(40, termsY, 515, 62).fillAndStroke('#F1F5F9', borderLight);
  doc.fontSize(8).fillColor(navy).font('Helvetica-Bold').text('TERMS & CONDITIONS:', 50, termsY + 6);

  const terms = [
    `1. Validity: This quotation is valid for ${quotation.validityDays || 15} days from the date of issue.`,
    '2. Proof Approval: Production begins upon client sign-off on the digital soft proof. Colors match calibrated digital files.',
    '3. Dispatch: Goods are carefully packaged and dispatched via insured expedited courier across India.',
    '4. Support & Approvals: For adjustments or questions, contact your dedicated print manager via WhatsApp: +91 75749 27200.'
  ];

  terms.forEach((t, i) => {
    doc.fontSize(7).fillColor(slateLight).font('Helvetica').text(t, 50, termsY + 18 + (i * 10));
  });

  // --- FOOTER SECTION ---
  doc.fontSize(8).fillColor(navy).font('Helvetica-Bold')
     .text('PRINTIZER', 40, 785, { width: 515, align: 'center' });
  doc.fontSize(7).fillColor(slateLight).font('Helvetica')
     .text('Everything Your Business Needs to Print.  |  https://Printizer.in  |  Printizerdesign@gmail.com  |  +91 75749 27200', 40, 796, { width: 515, align: 'center' });

  doc.end();
}
