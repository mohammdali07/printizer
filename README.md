# PRINTIZER — Commercial Printing Solutions & Quotation Platform

> **Tagline:** Everything Your Business Needs to Print.  
> **Official Website:** [https://Printizer.in](https://Printizer.in)  
> **Official Email:** [Printizerdesign@gmail.com](mailto:Printizerdesign@gmail.com)  
> **WhatsApp / Helpline:** [+91 98983 51920](https://wa.me/919898351920)

---

## 1. Business Positioning & Confidentiality

**PRINTIZER** is a premium, professional printing solutions brand offering an exhaustive catalog of customized printing products, corporate stationery, bespoke retail packaging, marketing collaterals, and architectural signage.

### Strict Business Confidentiality Compliance
- **Zero machine or equipment mentions:** No production equipment, machine ownership, machine sizes, or production capacity are displayed anywhere on the website.
- **Zero supplier/subcontracting mentions:** No vendor arrangements or third-party facilities are mentioned.
- **Complete Brand Integrity:** All customer communication, quotations, enquiries, and digital proofs are executed exclusively under the **PRINTIZER** brand.
- **Focus:** Products, premium substrates (GSM), luxury surface embellishments, responsive customer service, and dedicated B2B quotation consultation.

---

## 2. Product Catalog Architecture (6 Core Sectors & 37 Products)

1. **Business Printing**
   - Business Cards
   - Visiting Cards
   - Letterheads
   - Envelopes
   - Company Stationery Suites
   - Notepads & Desk Pads
   - Presentation Folders

2. **Marketing Printing**
   - Flyers & Leaflets
   - Folded Brochures (Tri-Fold, Bi-Fold, Z-Fold)
   - Posters
   - Catalogues
   - Booklets & Manuals
   - Promotional Cards & Direct Mailers
   - Corporate Invitation Cards

3. **Packaging Printing**
   - Custom Packaging Boxes (Tuck-end, auto-lock, rigid)
   - Product Boxes (Cosmetics, FMCG, electronics)
   - Luxury Branded Paper Bags
   - Packaging Sleeves & Belly Bands
   - Printed Corrugated Cartons

4. **Stickers & Labels**
   - Custom Vinyl Stickers
   - Waterproof Product Labels
   - Transparent / Clear Stickers (with white ink backing)
   - Precision Die-Cut Contour Stickers
   - Roll Labels (Dispenser-ready)
   - Serialized Barcode & QR Code Labels

5. **Large Format Printing**
   - Outdoor Flex Banners
   - Smooth Exhibition Vinyl Banners
   - Retractable Roll-Up Banner Stands (with aluminum base & carry bag)
   - Rigid Standees & Sunboard Displays
   - Architectural Signage (Acrylic, ACP)
   - Backlit Lightbox Prints

6. **Custom Printing**
   - Opulent Wedding Cards & Laser Suites
   - Greeting & Festive Corporate Cards
   - Executive Desk & Wall Calendars
   - Prestige Graduation & Award Certificates
   - Branded Promotional Materials (Coasters, Badges, Tags)
   - Special Blueprint & Custom Printing Requirements

---

## 3. Quotation Enquiry & Customer Journey

1. **Product Discovery:** Customer navigates through categories or uses live search autocomplete.
2. **Specification Entry:** Customer enters required quantity, chooses size/dimensions, selects substrate preferences (GSM), chooses surface finishes (Matte, Gloss, Velvet Soft-Touch, Spot UV, Foil Stamping), and uploads reference artwork (PDF, AI, PSD, ZIP up to 50MB).
3. **Submission & Reference Number:** On clicking **"GET MY QUOTATION"**, a unique reference number (e.g. `PRZ-2026-6896`) is generated.
4. **Immediate WhatsApp Continuity:** Customer receives an instant prompt with a pre-filled WhatsApp link to fast-track their quotation with our print desk (`+91 98983 51920`).
5. **Email Dispatches:**
   - Formal notification sent to `Printizerdesign@gmail.com` with customer requirements and artwork link.
   - Professional acknowledgment email sent to customer.
6. **Admin Review & Formal PDF Quotation:** Admin accesses `/admin`, enters unit rates, calculates GST and shipping, and generates an official branded PDF quotation with one click.
7. **Customer Approval & Doorstep Dispatch:** Quote is dispatched via email and WhatsApp. Once soft proof is confirmed, order is dispatched across India.

---

## 4. Admin Management Console (`/admin`)

- **Secure Login:** Credentials configured in environment variables (Default: `admin` / `printizer@2026`).
- **Real-Time Counters:** Total Enquiries, New Enquiries, Quotations Prepared, Quotations Sent, Confirmed Orders.
- **Enquiry Lifecycle Statuses:**
  - `New Enquiry`
  - `Under Review`
  - `Quotation Prepared`
  - `Quotation Sent`
  - `Awaiting Customer Approval`
  - `Confirmed`
  - `Completed`
  - `Cancelled`
- **Quotation Generator:**
  - Editable line items table with real-time subtotal.
  - Configurable GST rates (18%, 12%, 5%, 0%).
  - Shipping charges & discount inputs.
  - Automatic grand total calculation in INR (₹).
  - Fulfilment timelines, payment terms, and custom notes.
  - Instant PDF Generation streamed with the PRINTIZER official logo, navy blue & crimson branding.
  - Direct email dispatch & pre-formatted WhatsApp share link.
- **Product Management:** Add, edit, and delete products dynamically without touching website code.

---

## 5. Technology Stack & Running the Application

- **Backend:** Node.js, Express, Multer (file uploads), PDFKit (branded PDF quotation generation), Nodemailer (email services).
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database:** Persistent disk-backed JSON store with transactional write queue (`data/printizer.json`).

### Quick Start:

1. **Install Dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Build Client:**
   ```bash
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in any browser.

4. **Development Mode (Concurrent Frontend & Backend):**
   ```bash
   npm run dev
   ```

---

## 6. Official Contact

- **Brand:** PRINTIZER
- **Tagline:** Everything Your Business Needs to Print.
- **Website:** [https://Printizer.in](https://Printizer.in)
- **Email:** [Printizerdesign@gmail.com](mailto:Printizerdesign@gmail.com)
- **WhatsApp:** [+91 98983 51920](https://wa.me/919898351920)
