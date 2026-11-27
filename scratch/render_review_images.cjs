const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, 'review_renders');
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
  .shadow-xl { box-shadow: 0 28px 55px -12px rgba(15, 23, 42, 0.35), 0 10px 22px -6px rgba(15, 23, 42, 0.18); }
  .shadow-md { box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.2); }
`;

const templates = {
  'ahle-interior-studio': `
    <style>${baseStyles}</style>
    <div style="position:relative; width:640px; height:440px; display:flex; align-items:center; justify-content:center;">
      <!-- Back stacked cards -->
      <div class="shadow-md" style="position:absolute; left:65px; top:55px; width:360px; height:215px; background:#292524; border-radius:14px; transform:rotate(-10deg); border:1px solid #44403c; padding:26px; color:#f5f5f4; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="width:28px; height:28px; border:2px solid #d4af37; transform:rotate(45deg);"></div>
          <span style="font-size:9px; letter-spacing:2px; color:#d4af37; font-weight:700;">INTERIOR ARCHITECTURE</span>
        </div>
        <div>
          <div style="font-size:18px; font-weight:800; letter-spacing:2px; color:#d4af37;">AHLE</div>
          <div style="font-size:10px; letter-spacing:3px; color:#a8a29e;">INTERIOR STUDIO</div>
        </div>
      </div>

      <!-- Front Hero Visiting Card -->
      <div class="shadow-xl" style="position:relative; left:55px; top:45px; width:380px; height:225px; background:linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%); border-radius:14px; transform:rotate(4deg); border:1px solid #d6d3d1; padding:28px 30px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:20px; font-weight:900; color:#1c1917; letter-spacing:1.5px;">AHLE</div>
            <div style="font-size:10px; font-weight:700; color:#b45309; letter-spacing:2.5px; margin-top:1px;">INTERIOR STUDIO</div>
          </div>
          <div style="width:36px; height:36px; border-radius:8px; background:#1c1917; color:#d4af37; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px;">A</div>
        </div>

        <div style="border-top:1.5px solid #e7e5e4; padding-top:14px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#1c1917;">Bespoke Spaces &amp; Turnkey Design</div>
            <div style="font-size:9.5px; color:#57534e; margin-top:3px;">Residential • Commercial • Hospitality</div>
          </div>
          <div style="text-align:right; font-size:9px; color:#78716c; line-height:1.5;">
            <div>www.ahleinterior.com</div>
            <div>350 GSM Velvet + Gold Foil</div>
          </div>
        </div>
      </div>
    </div>
  `,

  'egraphixo-designs': `
    <style>${baseStyles}</style>
    <div style="position:relative; width:680px; height:460px; display:flex; align-items:center; justify-content:center;">
      <!-- Tri-Fold Agency Brochure -->
      <div class="shadow-xl" style="width:590px; height:390px; border-radius:10px; overflow:hidden; display:grid; grid-template-columns:1fr 1fr 1fr; transform:rotate(-2deg); border:1px solid #cbd5e1; background:#fff;">
        <!-- Panel 1 -->
        <div style="background:linear-gradient(160deg, #0f172a 0%, #1e293b 100%); color:#fff; padding:26px 20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:inline-block; background:#e11d48; color:#fff; font-size:8.5px; font-weight:800; padding:3px 9px; border-radius:99px; letter-spacing:1.2px;">CREATIVE AGENCY</div>
            <div style="font-size:21px; font-weight:900; margin-top:14px; line-height:1.15;">eGraphixo<br/><span style="color:#fb7185;">Designs</span></div>
          </div>
          <div style="font-size:9px; color:#94a3b8; line-height:1.6;">
            Brand Identity, UI/UX &amp; Commercial Packaging Solutions
          </div>
        </div>

        <!-- Panel 2 -->
        <div style="background:#ffffff; padding:26px 20px; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:10px; font-weight:800; color:#e11d48; letter-spacing:1.5px;">OUR SERVICES</div>
            <div style="font-size:14px; font-weight:900; color:#0f172a; margin-top:6px;">Design That Scales</div>
            <div style="margin-top:14px; font-size:9.5px; color:#475569; line-height:2;">
              <div>• Brand Guidelines</div>
              <div>• Print &amp; Packaging</div>
              <div>• Social Media Systems</div>
              <div>• Motion &amp; Web UI</div>
            </div>
          </div>
          <div style="height:54px; background:linear-gradient(135deg, #fff1f2, #ffe4e6); border-radius:8px; padding:10px; font-size:8.5px; color:#9f1239; font-weight:700;">
            170 GSM Art Paper<br/>Matte Folded Brochure
          </div>
        </div>

        <!-- Panel 3 -->
        <div style="background:#f8fafc; padding:26px 20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:10px; font-weight:800; color:#0f172a; letter-spacing:1px;">PORTFOLIO HIGHLIGHTS</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
              <div style="height:56px; background:#0f172a; border-radius:6px;"></div>
              <div style="height:56px; background:#e11d48; border-radius:6px;"></div>
              <div style="height:56px; background:#3b82f6; border-radius:6px;"></div>
              <div style="height:56px; background:#10b981; border-radius:6px;"></div>
            </div>
          </div>
          <div style="font-size:9px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:10px;">
            <b>eGraphixo Designs</b><br/>studio@egraphixo.in
          </div>
        </div>
      </div>
    </div>
  `,

  'izal-gud': `
    <style>${baseStyles}</style>
    <div style="position:relative; width:640px; height:440px; display:flex; align-items:center; justify-content:center;">
      <!-- Back Dark Card -->
      <div class="shadow-md" style="position:absolute; left:70px; top:55px; width:360px; height:215px; background:linear-gradient(135deg, #064e3b 0%, #065f46 100%); border-radius:14px; transform:rotate(-8deg); padding:26px; color:#ecfdf5; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="font-size:10px; letter-spacing:2px; color:#6ee7b7; font-weight:700;">EXECUTIVE EDITION</div>
        <div style="font-size:24px; font-weight:900; letter-spacing:1px;">IZAL GUD</div>
      </div>

      <!-- Front Spot UV Card -->
      <div class="shadow-xl" style="position:relative; left:55px; top:48px; width:380px; height:225px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:14px; transform:rotate(5deg); border:1px solid rgba(255,255,255,0.15); padding:28px 30px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:22px; font-weight:900; letter-spacing:1px; color:#fff;">IZAL GUD</div>
            <div style="font-size:9.5px; color:#34d399; font-weight:700; letter-spacing:2px; margin-top:2px;">QUALITY &amp; INNOVATION</div>
          </div>
          <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:15px;">IG</div>
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.12); padding-top:14px; display:flex; justify-content:space-between; align-items:flex-end; font-size:9.5px; color:#cbd5e1;">
          <div>
            <div style="font-weight:700; color:#fff;">Corporate &amp; Retail Branding</div>
            <div style="color:#94a3b8; margin-top:2px;">500 GSM Velvet + Raised Spot UV</div>
          </div>
          <div style="text-align:right; color:#6ee7b7; font-weight:700;">
            printizer.in
          </div>
        </div>
      </div>
    </div>
  `
};

async function renderAll() {
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const debuggingPort = 9236;
  const userDataDir = 'C:\\\\Users\\\\Mo ali khanusiya\\\\.gemini\\\\antigravity\\\\brain\\\\ae115228-6bcf-4779-b4f1-129a80696055\\\\scratch\\\\chrome_profile_reviews';

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
