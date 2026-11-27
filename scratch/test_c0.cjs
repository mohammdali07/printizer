const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function captureCard0() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9232;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\ae115228-6bcf-4779-b4f1-129a80696055\\scratch\\chrome_profile_c0';

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
    await send(pageWs, 'Runtime.enable');

    await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send(pageWs, 'Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to "Our Products" section and ensure it's at start
    await send(pageWs, 'Runtime.evaluate', {
      expression: `
        const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Products'));
        if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'center' });
        const carousels = document.querySelectorAll('[data-product-card]');
        if (carousels.length > 0) {
          carousels[0].parentElement.scrollTo({ left: 0, behavior: 'instant' });
        }
      `
    });
    await new Promise(r => setTimeout(r, 500));

    const shot = await send(pageWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\ae115228-6bcf-4779-b4f1-129a80696055\\mobile_nt_card_verified.png', Buffer.from(shot.data, 'base64'));

    console.log('NT Card screenshot saved!');
    pageWs.close();
    browserWs.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProc.kill();
  }
}

captureCard0();
