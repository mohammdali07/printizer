const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function verifyLive() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9236;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_no_price';

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const versionData = await new Promise((res, rej) => {
    http.get(`http://127.0.0.1:${debuggingPort}/json/version`, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res(JSON.parse(b)));
    }).on('error', rej);
  });

  const ws = new WebSocket(versionData.webSocketDebuggerUrl);
  let id = 1;
  const map = new Map();
  const send = (s, m, p = {}) => new Promise((res, rej) => {
    const cur = id++;
    map.set(cur, { res, rej });
    s.send(JSON.stringify({ id: cur, method: m, params: p }));
  });
  const setup = s => s.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && map.has(m.id)) {
      const { res, rej } = map.get(m.id);
      map.delete(m.id);
      m.error ? rej(m.error) : res(m.result);
    }
  };
  setup(ws);
  await new Promise(r => ws.onopen = r);

  const t = await send(ws, 'Target.createTarget', { url: 'about:blank' });
  const pWs = new WebSocket(`ws://127.0.0.1:${debuggingPort}/devtools/page/${t.targetId}`);
  setup(pWs);
  await new Promise(r => pWs.onopen = r);

  await send(pWs, 'Page.enable');
  await send(pWs, 'Runtime.enable');

  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  });
  await send(pWs, 'Page.navigate', { url: 'https://printizer-topaz.vercel.app/#home' });
  await new Promise(r => setTimeout(r, 2500));

  const homeCheck = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const featuredH2 = headings.find(h => h.innerText.includes('Popular Commercial Products'));
      if (featuredH2) featuredH2.closest('section').scrollIntoView({ behavior: 'instant' });
      return {
        hasRupeeOnHome: document.body.innerText.includes('₹'),
        hasStartingFromOnHome: document.body.innerText.includes('Starting from')
      };
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('Live Home Check:', JSON.stringify(homeCheck.result.value));

  const ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/live_home_no_pricing.png', Buffer.from(ss.data, 'base64'));

  // Tap first featured product card and check pricing on ProductDetailPage
  await send(pWs, 'Runtime.evaluate', {
    expression: `(() => {
      const h4 = Array.from(document.querySelectorAll('h4')).find(el => el.innerText.includes('Executive Visiting Cards'));
      if (h4) h4.closest('[class*="cursor-pointer"]').click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const productCheck = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => ({
      hash: window.location.hash,
      hasRupeeOnProduct: document.body.innerText.includes('₹')
    }))()`,
    returnByValue: true
  });
  console.log('Product Tap Check:', JSON.stringify(productCheck.result.value));

  ws.close();
  pWs.close();
  chromeProc.kill();
}

verifyLive().catch(console.error);
