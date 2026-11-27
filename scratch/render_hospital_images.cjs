const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, 'hospital_renders');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const baseStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  body {
    width: 800px;
    height: 600px;
    overflow: hidden;
    background: radial-gradient(circle at 30% 25%, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .desk-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.0) 55%, rgba(15,23,42,0.06) 100%);
    pointer-events: none;
  }
  .shadow-xl { box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 8px 20px -6px rgba(15, 23, 42, 0.14); }
  .shadow-md { box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.16); }
`;

const templates = {
  'hospital-medical-printing': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <!-- Flat-lay Hospital Stationery Collection -->
    <div style="position:relative; width:720px; height:500px;">
      <!-- IPD File Folder in back -->
      <div class="shadow-xl" style="position:absolute; left:30px; top:30px; width:280px; height:360px; background:linear-gradient(145deg, #0f766e, #0d9488); border-radius:10px 18px 18px 10px; transform:rotate(-6deg); padding:22px; color:#fff; border-left:10px solid #115e59;">
        <div style="font-size:10px; letter-spacing:2px; opacity:0.8; font-weight:700;">INPATIENT RECORD</div>
        <div style="font-size:22px; font-weight:800; margin-top:4px;">IPD CASE FILE</div>
        <div style="margin-top:24px; background:rgba(255,255,255,0.14); border-radius:8px; padding:12px; font-size:11px; line-height:1.8;">
          <div>Patient Name: ________________</div>
          <div>UHID / IPD No: ______________</div>
          <div>Ward / Bed: _________________</div>
          <div>Consultant: __________________</div>
        </div>
      </div>

      <!-- Prescription Pad center -->
      <div class="shadow-xl" style="position:absolute; left:220px; top:60px; width:260px; height:360px; background:#fff; border-radius:8px; transform:rotate(2deg); overflow:hidden; border:1px solid #e2e8f0;">
        <div style="height:16px; background:#0284c7;"></div>
        <div style="padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284c7; padding-bottom:8px;">
            <div>
              <div style="font-size:13px; font-weight:800; color:#0f172a;">CITY CARE HOSPITAL</div>
              <div style="font-size:9px; color:#64748b;">Multi-Speciality Medical Centre</div>
            </div>
            <div style="width:24px; height:24px; border-radius:50%; background:#e0f2fe; color:#0284c7; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px;">+</div>
          </div>
          <div style="font-size:26px; font-weight:900; color:#0284c7; margin-top:12px; font-family:Georgia, serif;">Rx</div>
          <div style="margin-top:10px; border-bottom:1px dashed #cbd5e1; height:20px;"></div>
          <div style="border-bottom:1px dashed #cbd5e1; height:24px;"></div>
          <div style="border-bottom:1px dashed #cbd5e1; height:24px;"></div>
          <div style="border-bottom:1px dashed #cbd5e1; height:24px;"></div>
        </div>
      </div>

      <!-- Lab Report right -->
      <div class="shadow-xl" style="position:absolute; right:25px; top:45px; width:245px; height:330px; background:#fff; border-radius:8px; transform:rotate(7deg); padding:18px; border:1px solid #e2e8f0;">
        <div style="background:#f1f5f9; padding:8px 10px; border-radius:6px; border-left:4px solid #e11d48;">
          <div style="font-size:11px; font-weight:800; color:#0f172a;">DIAGNOSTIC LAB REPORT</div>
          <div style="font-size:8px; color:#64748b;">NABL Certified Pathology</div>
        </div>
        <div style="margin-top:14px; font-size:9px; color:#334155;">
          <div style="display:flex; justify-content:space-between; font-weight:700; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">
            <span>TEST PARAMETER</span><span>RESULT</span><span>REF</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9;"><span>Hemoglobin</span><b>14.2</b><span>13-17</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9;"><span>WBC Count</span><b>6,800</b><span>4-11k</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9;"><span>Platelets</span><b>2.4 L</b><span>1.5-4.5</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0;"><span>Blood Glucose</span><b>94 mg</b><span>70-110</span></div>
        </div>
      </div>

      <!-- Hospital ID Card bottom right -->
      <div class="shadow-xl" style="position:absolute; right:55px; bottom:25px; width:210px; height:132px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:12px; transform:rotate(-4deg); padding:14px; color:#fff; display:flex; gap:12px; align-items:center; border:1px solid rgba(255,255,255,0.15);">
        <div style="width:52px; height:64px; background:#334155; border-radius:8px; border:2px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-size:22px;">🩺</div>
        <div>
          <div style="font-size:8px; color:#38bdf8; font-weight:800; letter-spacing:1px;">MEDICAL STAFF ID</div>
          <div style="font-size:13px; font-weight:800; margin-top:2px;">Dr. A. Mehta</div>
          <div style="font-size:9px; color:#cbd5e1;">Senior Consultant</div>
          <div style="margin-top:8px; height:12px; width:90px; background:repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 4px); opacity:0.85;"></div>
        </div>
      </div>
    </div>
  `,

  'prescription-pad': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Back pad stack -->
      <div class="shadow-md" style="position:absolute; width:350px; height:470px; background:#f1f5f9; border-radius:10px; transform:translate(14px, 14px) rotate(3deg); border:1px solid #cbd5e1;"></div>
      <!-- Main Prescription Pad -->
      <div class="shadow-xl" style="position:relative; width:350px; height:470px; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; transform:rotate(-2deg);">
        <!-- Gummed binding strip -->
        <div style="height:22px; background:linear-gradient(90deg, #0369a1, #0284c7, #0ea5e9); display:flex; align-items:center; justify-content:center;">
          <div style="width:60px; height:3px; background:rgba(255,255,255,0.4); border-radius:2px;"></div>
        </div>
        <div style="padding:24px 26px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0284c7; padding-bottom:12px;">
            <div>
              <div style="font-size:16px; font-weight:900; color:#0f172a; letter-spacing:-0.3px;">APEX HEALTH CLINIC</div>
              <div style="font-size:10px; color:#0284c7; font-weight:700; margin-top:2px;">Dr. Rajesh Sharma (MBBS, MD)</div>
              <div style="font-size:9px; color:#64748b; margin-top:2px;">Reg. No: MCI-48291 | Ph: +91 98983 51920</div>
            </div>
            <div style="width:32px; height:32px; border-radius:8px; background:#e0f2fe; color:#0284c7; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900;">+</div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; margin-top:14px; padding-bottom:10px; border-bottom:1px solid #e2e8f0;">
            <span>Patient: _____________________</span>
            <span>Age/Sex: ______  Date: ___/___</span>
          </div>

          <div style="font-size:34px; font-weight:900; color:#0284c7; font-family:Georgia, serif; margin-top:14px;">Rx</div>

          <div style="margin-top:14px; space-y:16px;">
            <div style="height:28px; border-bottom:1px dashed #cbd5e1;"></div>
            <div style="height:28px; border-bottom:1px dashed #cbd5e1;"></div>
            <div style="height:28px; border-bottom:1px dashed #cbd5e1;"></div>
            <div style="height:28px; border-bottom:1px dashed #cbd5e1;"></div>
            <div style="height:28px; border-bottom:1px dashed #cbd5e1;"></div>
          </div>

          <div style="margin-top:34px; display:flex; justify-content:space-between; align-items:flex-end; font-size:9px; color:#64748b;">
            <span>Next Visit: ___________</span>
            <span style="border-top:1px solid #94a3b8; padding-top:4px; font-weight:700; color:#334155;">Doctor's Signature</span>
          </div>
        </div>
      </div>
    </div>
  `,

  'opd-paper': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <div class="shadow-md" style="position:absolute; width:370px; height:480px; background:#f8fafc; border-radius:6px; transform:translate(-16px, 10px) rotate(-4deg); border:1px solid #cbd5e1;"></div>
      <div class="shadow-xl" style="position:relative; width:370px; height:480px; background:#fff; border-radius:6px; padding:26px; border:1px solid #e2e8f0; transform:rotate(1.5deg);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0f766e; padding-bottom:10px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#0f172a;">OUTPATIENT (OPD) RECORD</div>
            <div style="font-size:9.5px; color:#0f766e; font-weight:700;">MEDILIFE SUPER SPECIALITY HOSPITAL</div>
          </div>
          <div style="background:#ccfbf1; color:#0f766e; font-size:10px; font-weight:800; padding:4px 10px; border-radius:4px;">OPD SLIP</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0; font-size:9.5px; color:#334155;">
          <div><b>OPD No:</b> ____________</div>
          <div><b>Date:</b> ____/____/2026</div>
          <div><b>Name:</b> ______________</div>
          <div><b>Age / Gender:</b> ______</div>
          <div><b>Department:</b> ________</div>
          <div><b>Consultant:</b> _________</div>
        </div>

        <div style="margin-top:14px; display:grid; grid-template-columns:110px 1fr; gap:12px; height:250px;">
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; font-size:9px; color:#475569; background:#f8fafc;">
            <div style="font-weight:800; color:#0f766e; margin-bottom:8px;">VITALS</div>
            <div style="margin-bottom:10px;">BP: _________</div>
            <div style="margin-bottom:10px;">Pulse: _______</div>
            <div style="margin-bottom:10px;">Temp: _______</div>
            <div style="margin-bottom:10px;">SpO2: _______</div>
            <div>Weight: _____</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:12px;">
            <div style="font-size:10px; font-weight:800; color:#0f172a;">CLINICAL NOTES &amp; PRESCRIPTION</div>
            <div style="font-size:22px; font-weight:900; color:#0f766e; font-family:Georgia, serif; margin-top:4px;">Rx</div>
            <div style="border-bottom:1px dashed #cbd5e1; height:28px;"></div>
            <div style="border-bottom:1px dashed #cbd5e1; height:28px;"></div>
            <div style="border-bottom:1px dashed #cbd5e1; height:28px;"></div>
            <div style="border-bottom:1px dashed #cbd5e1; height:28px;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  'ipd-file': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; width:440px; height:490px; display:flex; align-items:center; justify-content:center;">
      <!-- Inside white sheet peeking out -->
      <div class="shadow-md" style="position:absolute; right:18px; top:22px; width:340px; height:440px; background:#fff; border-radius:6px; transform:rotate(4deg); border:1px solid #cbd5e1; padding:20px;">
        <div style="font-size:10px; font-weight:800; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">ADMISSION &amp; PROGRESS SHEET</div>
        <div style="margin-top:12px; height:10px; background:#f1f5f9; border-radius:4px;"></div>
        <div style="margin-top:10px; height:10px; background:#f1f5f9; border-radius:4px; width:80%;"></div>
      </div>
      <!-- Heavyweight 350 GSM IPD Folder -->
      <div class="shadow-xl" style="position:relative; width:360px; height:465px; background:linear-gradient(155deg, #1e3a8a 0%, #1d4ed8 100%); border-radius:8px 20px 20px 8px; padding:28px; color:#fff; border-left:14px solid #172554; transform:rotate(-2deg);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:10px; font-weight:800; letter-spacing:2px; color:#93c5fd;">350 GSM HEAVY BOARD</span>
          <span style="background:#ef4444; color:#fff; font-size:10px; font-weight:900; padding:3px 9px; border-radius:4px;">IPD</span>
        </div>
        <div style="font-size:26px; font-weight:900; margin-top:10px; letter-spacing:-0.5px;">INPATIENT<br/>MEDICAL FILE</div>
        <div style="font-size:11px; color:#bfdbfe; margin-top:4px;">St. Jude Multi-Speciality Hospital</div>

        <div style="margin-top:26px; background:#ffffff; color:#0f172a; border-radius:10px; padding:16px; font-size:10.5px; line-height:2.1; box-shadow:inset 0 2px 6px rgba(0,0,0,0.08);">
          <div style="font-weight:800; color:#1d4ed8; font-size:10px; letter-spacing:1px; border-bottom:1px solid #e2e8f0; margin-bottom:6px;">PATIENT ADMISSION DETAILS</div>
          <div><b>IPD No:</b> _______________________</div>
          <div><b>Patient Name:</b> _________________</div>
          <div><b>Ward / Bed No:</b> ________________</div>
          <div><b>Admitting Dr.:</b> _________________</div>
          <div><b>Date of Adm.:</b> _____/_____/2026</div>
        </div>
      </div>
    </div>
  `,

  'patient-case-paper': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <div class="shadow-xl" style="width:580px; height:420px; background:#fff; border-radius:8px; border:1px solid #cbd5e1; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; transform:rotate(-1deg);">
        <!-- Left folded page -->
        <div style="padding:22px; border-right:2px solid #e2e8f0; background:linear-gradient(90deg, #ffffff 94%, #f1f5f9 100%);">
          <div style="font-size:12px; font-weight:900; color:#0f172a; border-bottom:2px solid #e11d48; padding-bottom:6px;">PATIENT CASE HISTORY</div>
          <div style="margin-top:12px; font-size:9px; color:#475569; line-height:1.9;">
            <div><b>Case Paper No:</b> ___________________</div>
            <div><b>Name:</b> ____________________________</div>
            <div><b>Address:</b> _________________________</div>
            <div style="margin-top:10px; font-weight:800; color:#0f172a;">CHIEF COMPLAINTS:</div>
            <div style="border-bottom:1px dashed #cbd5e1; height:22px;"></div>
            <div style="border-bottom:1px dashed #cbd5e1; height:22px;"></div>
            <div style="margin-top:12px; font-weight:800; color:#0f172a;">PAST MEDICAL HISTORY:</div>
            <div style="display:flex; gap:10px; margin-top:6px;">
              <span>☐ Diabetes</span><span>☐ Hypertension</span><span>☐ Allergy</span>
            </div>
            <div style="border-bottom:1px dashed #cbd5e1; height:22px; margin-top:4px;"></div>
          </div>
        </div>
        <!-- Right folded page -->
        <div style="padding:22px; background:#fff;">
          <div style="font-size:12px; font-weight:900; color:#0f172a; border-bottom:2px solid #0284c7; padding-bottom:6px;">CLINICAL EXAMINATION &amp; ORDERS</div>
          <div style="margin-top:12px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; font-size:8.5px;">
            <div style="display:grid; grid-template-columns:60px 1fr 70px; background:#f1f5f9; font-weight:800; padding:6px 8px; border-bottom:1px solid #cbd5e1;">
              <span>DATE</span><span>CLINICAL NOTES / TREATMENT</span><span>SIGN</span>
            </div>
            <div style="height:42px; border-bottom:1px solid #e2e8f0;"></div>
            <div style="height:42px; border-bottom:1px solid #e2e8f0;"></div>
            <div style="height:42px; border-bottom:1px solid #e2e8f0;"></div>
            <div style="height:42px; border-bottom:1px solid #e2e8f0;"></div>
            <div style="height:42px;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  'lab-report': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Matching Envelope Folder behind -->
      <div class="shadow-md" style="position:absolute; left:-55px; top:-15px; width:340px; height:450px; background:linear-gradient(145deg, #0f172a, #1e293b); border-radius:10px; transform:rotate(-6deg); padding:22px; color:#fff;">
        <div style="font-size:10px; color:#38bdf8; font-weight:800; letter-spacing:1.5px;">DIAGNOSTIC REPORT FOLDER</div>
        <div style="font-size:18px; font-weight:900; margin-top:4px;">PATHOLOGY LAB</div>
      </div>
      <!-- Lab Report Sheet -->
      <div class="shadow-xl" style="position:relative; left:30px; width:360px; height:465px; background:#fff; border-radius:8px; padding:24px; border:1px solid #cbd5e1; transform:rotate(2deg);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0ea5e9; padding-bottom:10px;">
          <div>
            <div style="font-size:15px; font-weight:900; color:#0f172a;">BIO-CARE DIAGNOSTICS</div>
            <div style="font-size:9px; color:#64748b;">ISO 15189 Accredited Clinical Laboratory</div>
          </div>
          <div style="width:28px; height:28px; border-radius:6px; background:#e0f2fe; color:#0284c7; display:flex; align-items:center; justify-content:center; font-weight:900;">🧪</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:#f8fafc; padding:10px; border-radius:6px; margin-top:12px; font-size:9px; color:#334155;">
          <div><b>Patient:</b> R. Patel</div><div><b>Lab ID:</b> BIO-94821</div>
          <div><b>Ref. By:</b> Dr. Mehta</div><div><b>Sample:</b> Whole Blood</div>
        </div>

        <div style="margin-top:14px; font-size:9.5px;">
          <div style="text-align:center; font-weight:800; background:#0ea5e9; color:#fff; padding:5px; border-radius:4px; margin-bottom:8px;">COMPLETE BLOOD COUNT (CBC)</div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; font-weight:800; color:#475569; border-bottom:1px solid #cbd5e1; padding:5px 0;">
            <span>INVESTIGATION</span><span>RESULT</span><span>REF. RANGE</span>
          </div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; padding:7px 0; border-bottom:1px solid #f1f5f9;"><span>Hemoglobin (Hb)</span><b>14.4 g/dL</b><span>13.0 - 17.0</span></div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; padding:7px 0; border-bottom:1px solid #f1f5f9;"><span>Total WBC Count</span><b>7,200 /cmm</b><span>4,000 - 11,000</span></div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; padding:7px 0; border-bottom:1px solid #f1f5f9;"><span>Platelet Count</span><b>2.35 Lakhs</b><span>1.50 - 4.50</span></div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; padding:7px 0; border-bottom:1px solid #f1f5f9;"><span>RBC Count</span><b>4.95 mill</b><span>4.5 - 5.5</span></div>
          <div style="display:grid; grid-template-columns:1.5fr 0.8fr 0.9fr; padding:7px 0;"><span>PCV / Hematocrit</span><b>43.2 %</b><span>40 - 50</span></div>
        </div>
      </div>
    </div>
  `,

  'hospital-bill-book': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Pink Duplicate NCR Copy peeking -->
      <div class="shadow-md" style="position:absolute; width:380px; height:470px; background:#fce7f3; border-radius:8px; transform:translate(18px, 14px) rotate(4deg); border:1px solid #f9a8d4;"></div>
      <!-- Main Bill Book -->
      <div class="shadow-xl" style="position:relative; width:380px; height:470px; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; transform:rotate(-1.5deg);">
        <div style="height:26px; background:#be123c; display:flex; align-items:center; justify-content:space-between; padding:0 16px; color:#fff; font-size:9px; font-weight:800; letter-spacing:1px;">
          <span>DUPLICATE NCR BOOK</span>
          <span>NO. 00142</span>
        </div>
        <div style="padding:20px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #be123c; padding-bottom:10px;">
            <div>
              <div style="font-size:15px; font-weight:900; color:#0f172a;">HOSPITAL BILL / RECEIPT</div>
              <div style="font-size:9px; color:#64748b;">CareWell Hospital &amp; Pharmacy</div>
            </div>
            <div style="font-size:12px; font-weight:900; color:#be123c;">No. 0142</div>
          </div>

          <div style="margin-top:12px; font-size:9.5px; color:#334155; line-height:1.8;">
            <div><b>Patient Name:</b> ______________________  <b>Date:</b> __/__/26</div>
            <div><b>IPD / OPD No:</b> ______________________  <b>Ward:</b> _______</div>
          </div>

          <div style="margin-top:12px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; font-size:9px;">
            <div style="display:grid; grid-template-columns:30px 1fr 75px; background:#fff1f2; font-weight:800; color:#be123c; padding:6px 8px; border-bottom:1px solid #fecdd3;">
              <span>SR</span><span>PARTICULARS / SERVICES</span><span style="text-align:right;">AMOUNT</span>
            </div>
            <div style="display:grid; grid-template-columns:30px 1fr 75px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>1</span><span>Consultation &amp; Registration</span><span style="text-align:right;">₹ 800</span></div>
            <div style="display:grid; grid-template-columns:30px 1fr 75px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>2</span><span>Pathology &amp; Lab Tests</span><span style="text-align:right;">₹ 1,450</span></div>
            <div style="display:grid; grid-template-columns:30px 1fr 75px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>3</span><span>Pharmacy &amp; Consumables</span><span style="text-align:right;">₹ 620</span></div>
            <div style="display:grid; grid-template-columns:30px 1fr 75px; padding:7px 8px; border-bottom:1px solid #cbd5e1;"><span>4</span><span>Room / Nursing Charges</span><span style="text-align:right;">₹ 1,500</span></div>
            <div style="display:grid; grid-template-columns:1fr 75px; padding:8px; background:#f8fafc; font-weight:900; color:#0f172a;">
              <span>TOTAL BILL AMOUNT</span><span style="text-align:right; color:#be123c;">₹ 4,370</span>
            </div>
          </div>

          <div style="margin-top:26px; display:flex; justify-content:space-between; font-size:9px; color:#64748b;">
            <span>Receiver's Sign</span>
            <span>Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  `,

  'hospital-id-card': `
    <style>${baseStyles}</style>
    <div class="desk-glow"></div>
    <div style="position:relative; width:500px; height:480px; display:flex; align-items:center; justify-content:center;">
      <!-- Sublimation Lanyard Ribbon -->
      <div style="position:absolute; top:-20px; left:155px; width:26px; height:160px; background:linear-gradient(180deg, #0f766e, #14b8a6); transform:rotate(-14deg); border-radius:4px; box-shadow:0 8px 16px rgba(0,0,0,0.15); display:flex; align-items:center; justify-content:center; color:#fff; font-size:8px; font-weight:800; writing-mode:vertical-rl; letter-spacing:2px;">CITY HOSPITAL</div>
      <div style="position:absolute; top:-20px; right:155px; width:26px; height:160px; background:linear-gradient(180deg, #0d9488, #0f766e); transform:rotate(14deg); border-radius:4px; box-shadow:0 8px 16px rgba(0,0,0,0.15);"></div>
      <!-- Metal Hook Clip -->
      <div style="position:absolute; top:118px; width:30px; height:24px; background:#94a3b8; border-radius:6px; border:2px solid #cbd5e1; z-index:10;"></div>

      <!-- CR80 Rigid PVC Hospital ID Card -->
      <div class="shadow-xl" style="position:relative; top:48px; width:270px; height:400px; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #cbd5e1; display:flex; flex-direction:column; justify-content:space-between;">
        <!-- Top Header -->
        <div style="background:linear-gradient(135deg, #0f172a 0%, #0f766e 100%); padding:22px 20px 28px; text-align:center; color:#fff;">
          <div style="width:18px; height:6px; background:#cbd5e1; border-radius:4px; margin:0 auto 12px;"></div>
          <div style="font-size:14px; font-weight:900; letter-spacing:0.5px;">LIFE CARE HOSPITAL</div>
          <div style="font-size:9px; color:#99f6e4; font-weight:700; letter-spacing:1.5px; margin-top:2px;">MULTI-SPECIALITY CENTRE</div>
        </div>

        <!-- Photo & Details -->
        <div style="padding:0 22px; text-align:center; margin-top:-20px;">
          <div style="width:94px; height:108px; margin:0 auto; background:linear-gradient(180deg, #e2e8f0, #cbd5e1); border-radius:14px; border:4px solid #fff; box-shadow:0 6px 16px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; font-size:44px;">👨‍⚕️</div>
          <div style="font-size:17px; font-weight:900; color:#0f172a; margin-top:12px;">Dr. Aarav Verma</div>
          <div style="display:inline-block; background:#ccfbf1; color:#0f766e; font-size:10px; font-weight:800; padding:3px 12px; border-radius:99px; margin-top:4px;">SENIOR CARDIOLOGIST</div>

          <div style="margin-top:14px; font-size:10px; color:#475569; line-height:1.7; text-align:left; background:#f8fafc; padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0;">
            <div><b>Staff ID:</b> LCH-DOC-204</div>
            <div><b>Blood Group:</b> O+ Positive</div>
            <div><b>Emergency:</b> +91 98983 51920</div>
          </div>
        </div>

        <!-- Barcode Footer -->
        <div style="padding:12px 22px 16px; text-align:center; border-top:1px solid #f1f5f9;">
          <div style="height:22px; width:160px; margin:0 auto; background:repeating-linear-gradient(90deg, #0f172a 0 2px, transparent 2px 5px, #0f172a 5px 8px, transparent 8px 10px);"></div>
        </div>
      </div>
    </div>
  `
};

async function renderAll() {
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const debuggingPort = 9235;
  const userDataDir = 'C:\\\\Users\\\\Mo ali khanusiya\\\\.gemini\\\\antigravity\\\\brain\\\\ae115228-6bcf-4779-b4f1-129a80696055\\\\scratch\\\\chrome_profile_hospital';

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const versionData = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${debuggingPort}/json/version`, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });

    const browserWs = new WebSocket(versionData.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    function send(ws, method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = idCounter++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    function setup(ws) {
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    }

    setup(browserWs);
    await new Promise(r => browserWs.onopen = r);

    const target = await send(browserWs, 'Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:${debuggingPort}/devtools/page/${target.targetId}`);
    setup(pageWs);
    await new Promise(r => pageWs.onopen = r);

    await send(pageWs, 'Page.enable');
    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 800,
      height: 600,
      deviceScaleFactor: 2,
      mobile: false
    });

    for (const [name, html] of Object.entries(templates)) {
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
      await send(pageWs, 'Page.setDocumentContent', {
        frameId: target.targetId,
        html: fullHtml
      });
      await new Promise(r => setTimeout(r, 250));
      const shot = await send(pageWs, 'Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(OUT_DIR, `${name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log('Rendered:', outPath);
    }

    pageWs.close();
    browserWs.close();
  } finally {
    chromeProc.kill();
  }
}

renderAll().catch(err => {
  console.error(err);
  process.exit(1);
});
