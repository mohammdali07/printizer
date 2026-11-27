const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, 'book_renders');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const baseStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  body {
    width: 800px;
    height: 600px;
    overflow: hidden;
    background: radial-gradient(circle at 30% 25%, #f8fafc 0%, #e2e8f0 65%, #cbd5e1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .shadow-xl { box-shadow: 0 28px 55px -12px rgba(15, 23, 42, 0.30), 0 10px 22px -6px rgba(15, 23, 42, 0.16); }
  .shadow-md { box-shadow: 0 14px 28px -6px rgba(15, 23, 42, 0.18); }
`;

const templates = {
  'cash-memo-book': `
    <style>${baseStyles}</style>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Yellow NCR Duplicate Copy underneath -->
      <div class="shadow-md" style="position:absolute; width:360px; height:470px; background:#fef9c3; border-radius:8px; transform:translate(18px, 14px) rotate(4deg); border:1px solid #fde047;"></div>
      <!-- Main Cash Memo Book -->
      <div class="shadow-xl" style="position:relative; width:360px; height:470px; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; transform:rotate(-2deg);">
        <!-- Cloth Spine Top -->
        <div style="height:28px; background:linear-gradient(90deg, #0f172a, #1e293b); display:flex; align-items:center; justify-content:space-between; padding:0 16px; color:#fff; font-size:9px; font-weight:800; letter-spacing:1.2px;">
          <span>CARBONLESS NCR</span>
          <span style="color:#38bdf8;">50 / 100 SETS</span>
        </div>
        <div style="padding:20px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #0284c7; padding-bottom:10px;">
            <div>
              <div style="font-size:17px; font-weight:900; color:#0f172a; letter-spacing:0.5px;">CASH MEMO</div>
              <div style="font-size:9.5px; color:#0284c7; font-weight:700;">SHREE ENTERPRISES • RETAIL &amp; WHOLESALE</div>
            </div>
            <div style="font-size:13px; font-weight:900; color:#e11d48; background:#fff1f2; padding:3px 9px; border-radius:4px; border:1px solid #fecdd3;">0101</div>
          </div>

          <div style="margin-top:12px; font-size:9.5px; color:#334155; display:flex; justify-content:space-between;">
            <span><b>M/s:</b> ________________________</span>
            <span><b>Date:</b> ___/___/2026</span>
          </div>

          <div style="margin-top:12px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; font-size:9px;">
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 65px; background:#e0f2fe; font-weight:800; color:#0369a1; padding:6px 8px; border-bottom:1px solid #bae6fd;">
              <span>SR</span><span>PARTICULARS</span><span style="text-align:center;">QTY</span><span style="text-align:right;">RATE</span><span style="text-align:right;">AMOUNT</span>
            </div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 65px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>1</span><span>Packaging Cartons</span><span style="text-align:center;">50</span><span style="text-align:right;">₹ 45</span><span style="text-align:right;">₹ 2,250</span></div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 65px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>2</span><span>Printed Labels</span><span style="text-align:center;">1000</span><span style="text-align:right;">₹ 1.20</span><span style="text-align:right;">₹ 1,200</span></div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 65px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>3</span><span>Visiting Cards</span><span style="text-align:center;">1000</span><span style="text-align:right;">₹ 0.45</span><span style="text-align:right;">₹ 450</span></div>
            <div style="height:28px; border-bottom:1px solid #f1f5f9;"></div>
            <div style="height:28px; border-bottom:1px solid #cbd5e1;"></div>
            <div style="display:grid; grid-template-columns:1fr 75px; padding:8px; background:#f8fafc; font-weight:900; color:#0f172a;">
              <span>GRAND TOTAL</span><span style="text-align:right; color:#0284c7;">₹ 3,900</span>
            </div>
          </div>

          <div style="margin-top:26px; display:flex; justify-content:space-between; font-size:9px; color:#64748b;">
            <span>Goods once sold will not be taken back.</span>
            <span style="font-weight:700; color:#0f172a;">Signature</span>
          </div>
        </div>
      </div>
    </div>
  `,

  'receipt-book': `
    <style>${baseStyles}</style>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Pink NCR Duplicate Copy underneath -->
      <div class="shadow-md" style="position:absolute; width:560px; height:290px; background:#fce7f3; border-radius:8px; transform:translate(16px, 16px) rotate(3deg); border:1px solid #f9a8d4;"></div>
      <!-- Landscape Receipt Book -->
      <div class="shadow-xl" style="position:relative; width:560px; height:290px; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; display:grid; grid-template-columns:36px 135px 1fr; transform:rotate(-2deg);">
        <!-- Left Cloth Spine -->
        <div style="background:linear-gradient(180deg, #0f172a, #1e293b); display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:8px; font-weight:800; writing-mode:vertical-rl; letter-spacing:2px;">BOUND RECEIPT BOOK</div>

        <!-- Counterfoil Stub -->
        <div style="padding:16px 12px; border-right:2px dashed #94a3b8; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between; font-size:8.5px; color:#334155;">
          <div>
            <div style="font-weight:900; color:#0f172a; font-size:10px;">COUNTERFOIL</div>
            <div style="color:#e11d48; font-weight:900; margin-top:4px;">No. 00842</div>
            <div style="margin-top:10px;">Date: ___/___/26</div>
            <div style="margin-top:8px;">From: _________</div>
            <div style="margin-top:8px;">Amt: ₹ ________</div>
          </div>
          <div style="border-top:1px solid #cbd5e1; padding-top:6px; font-weight:700;">Sign</div>
        </div>

        <!-- Main Receipt Leaf -->
        <div style="padding:18px 22px; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f766e; padding-bottom:8px;">
            <div>
              <div style="font-size:16px; font-weight:900; color:#0f172a; letter-spacing:0.5px;">PAYMENT RECEIPT</div>
              <div style="font-size:9px; color:#0f766e; font-weight:700;">APEX COMMERCIAL SERVICES • GSTIN: 24AABCU9603R1ZM</div>
            </div>
            <div style="font-size:13px; font-weight:900; color:#e11d48;">No. 00842</div>
          </div>

          <div style="font-size:10.5px; color:#334155; line-height:2.2; margin-top:6px;">
            <div>Received with thanks from <b style="border-bottom:1px dashed #94a3b8; padding:0 16px;">M/s Horizon Traders</b></div>
            <div>the sum of Rupees <b style="border-bottom:1px dashed #94a3b8; padding:0 16px;">Twelve Thousand Five Hundred Only</b></div>
            <div>by Cash / UPI / Cheque No. <span style="border-bottom:1px dashed #94a3b8; padding:0 24px;"></span> Date: <span style="border-bottom:1px dashed #94a3b8; padding:0 14px;"></span></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
            <div style="background:#f0fdfa; border:2px solid #0f766e; border-radius:8px; padding:6px 14px; font-size:14px; font-weight:900; color:#0f766e;">
              ₹ 12,500 /-
            </div>
            <div style="text-align:right; font-size:9.5px; color:#334155;">
              <div style="border-top:1px solid #64748b; padding-top:4px; font-weight:800;">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  'bill-book': `
    <style>${baseStyles}</style>
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <!-- Blue Triplicate / Yellow Duplicate NCR Copies peeking -->
      <div class="shadow-md" style="position:absolute; width:380px; height:480px; background:#fef9c3; border-radius:8px; transform:translate(22px, 16px) rotate(5deg); border:1px solid #fde047;"></div>
      <div class="shadow-md" style="position:absolute; width:380px; height:480px; background:#fce7f3; border-radius:8px; transform:translate(11px, 8px) rotate(2deg); border:1px solid #f9a8d4;"></div>

      <!-- Main Tax Invoice / Bill Book -->
      <div class="shadow-xl" style="position:relative; width:380px; height:480px; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; transform:rotate(-1.5deg);">
        <!-- Cloth Bound Spine Top -->
        <div style="height:28px; background:linear-gradient(90deg, #9f1239, #e11d48); display:flex; align-items:center; justify-content:space-between; padding:0 16px; color:#fff; font-size:9px; font-weight:800; letter-spacing:1px;">
          <span>GST BILL BOOK • DUPLICATE / TRIPLICATE</span>
          <span>NO. 0142</span>
        </div>

        <div style="padding:18px 22px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #0f172a; padding-bottom:10px;">
            <div>
              <div style="font-size:16px; font-weight:900; color:#0f172a;">TAX INVOICE / BILL</div>
              <div style="font-size:9px; color:#64748b; font-weight:600;">PRINTIZER COMMERCIAL PRESS • GSTIN: 24AAACP1234F1Z5</div>
            </div>
            <div style="font-size:13px; font-weight:900; color:#e11d48;">#0142</div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:9.5px; color:#334155; margin-top:10px; background:#f8fafc; padding:8px 10px; border-radius:6px; border:1px solid #e2e8f0;">
            <div><b>Billed To:</b> A.R. Enterprises</div>
            <div><b>Date:</b> 27/11/2026</div>
          </div>

          <div style="margin-top:10px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; font-size:9px;">
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 68px; background:#0f172a; font-weight:800; color:#fff; padding:6px 8px;">
              <span>SR</span><span>DESCRIPTION OF GOODS</span><span style="text-align:center;">QTY</span><span style="text-align:right;">RATE</span><span style="text-align:right;">AMOUNT</span>
            </div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 68px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>1</span><span>350 GSM Matt Visiting Cards</span><span style="text-align:center;">2000</span><span style="text-align:right;">₹ 0.45</span><span style="text-align:right;">₹ 900</span></div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 68px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>2</span><span>100 GSM Bond Letterhead</span><span style="text-align:center;">1000</span><span style="text-align:right;">₹ 1.40</span><span style="text-align:right;">₹ 1,400</span></div>
            <div style="display:grid; grid-template-columns:28px 1fr 40px 55px 68px; padding:7px 8px; border-bottom:1px solid #f1f5f9;"><span>3</span><span>NCR Bill Books (100 Sets)</span><span style="text-align:center;">10</span><span style="text-align:right;">₹ 145</span><span style="text-align:right;">₹ 1,450</span></div>
            <div style="height:26px; border-bottom:1px solid #f1f5f9;"></div>
            <div style="display:grid; grid-template-columns:1fr 75px; padding:6px 8px; background:#f8fafc; font-weight:700; color:#475569; border-bottom:1px solid #e2e8f0;">
              <span>CGST + SGST (18%)</span><span style="text-align:right;">₹ 675</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 75px; padding:8px; background:#fff1f2; font-weight:900; color:#0f172a;">
              <span>TOTAL INVOICE AMOUNT</span><span style="text-align:right; color:#e11d48;">₹ 4,425</span>
            </div>
          </div>

          <div style="margin-top:24px; display:flex; justify-content:space-between; font-size:9px; color:#64748b;">
            <span>Receiver's Signature</span>
            <span style="font-weight:800; color:#0f172a;">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  `
};

async function renderAll() {
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const debuggingPort = 9238;
  const userDataDir = 'C:\\\\Users\\\\Mo ali khanusiya\\\\.gemini\\\\antigravity\\\\brain\\\\ae115228-6bcf-4779-b4f1-129a80696055\\\\scratch\\\\chrome_profile_books';

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
