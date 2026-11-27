const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function verify() {
  // Start vite preview server
  const previewProc = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--strictPort'], {
    cwd: 'E:\\projects\\PRINTIZER PROJECT\\client',
    stdio: 'pipe'
  });

  // Wait for preview server
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server timeout')), 15000);
    const check = () => {
      http.get('http://localhost:4173/', res => {
        clearTimeout(timer);
        resolve();
      }).on('error', () => setTimeout(check, 300));
    };
    check();
  });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9235;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_verify_fixes';

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

  const artDir = 'C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75';

  // 1. Test 390x844 Home initial + Drawer open
  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  });
  await send(pWs, 'Page.navigate', { url: 'http://localhost:4173/#home' });
  await new Promise(r => setTimeout(r, 1500));

  const homeMetrics390 = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('section h1');
      const container = document.querySelector('section > div');
      const waFloat = document.querySelector('a[title="Chat with PRINTIZER on WhatsApp"]');
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1Left: h1 ? h1.getBoundingClientRect().left : -1,
        containerPaddingLeft: container ? window.getComputedStyle(container).paddingLeft : '',
        waFloatVisible: waFloat ? window.getComputedStyle(waFloat.closest('.fixed')).display : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Home 390px:', JSON.stringify(homeMetrics390.result.value));

  let ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artDir}/verify_390_home.png`, Buffer.from(ss.data, 'base64'));

  // Open Mobile Drawer
  await send(pWs, 'Runtime.evaluate', {
    expression: `document.querySelector('button[aria-label="Open Navigation Menu"]').click()`
  });
  await new Promise(r => setTimeout(r, 500));

  const drawerMetrics = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('button[aria-label="Close Navigation"]');
      const drawerOverlay = closeBtn ? closeBtn.closest('.fixed.inset-0') : null;
      const rect = drawerOverlay ? drawerOverlay.getBoundingClientRect() : null;
      return {
        windowHeight: window.innerHeight,
        drawerOverlayRect: rect ? { top: rect.top, height: rect.height, width: rect.width } : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Drawer 390px:', JSON.stringify(drawerMetrics.result.value));

  ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artDir}/verify_390_drawer.png`, Buffer.from(ss.data, 'base64'));

  // Close drawer, then test 320px home and product page
  await send(pWs, 'Runtime.evaluate', {
    expression: `document.querySelector('button[aria-label="Close Navigation"]')?.click()`
  });
  await new Promise(r => setTimeout(r, 300));

  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 320, height: 650, deviceScaleFactor: 2, mobile: true
  });
  await new Promise(r => setTimeout(r, 600));
  const homeMetrics320 = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('section h1');
      const container = document.querySelector('section > div');
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1Left: h1 ? h1.getBoundingClientRect().left : -1,
        containerPaddingLeft: container ? window.getComputedStyle(container).paddingLeft : ''
      };
    })()`,
    returnByValue: true
  });
  console.log('Home 320px:', JSON.stringify(homeMetrics320.result.value));
  ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artDir}/verify_320_home.png`, Buffer.from(ss.data, 'base64'));

  // Test Product Page 390px (verify bottom bar has no WhatsApp overlap)
  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  });
  await send(pWs, 'Page.navigate', { url: 'http://localhost:4173/#product/visiting-card' });
  await new Promise(r => setTimeout(r, 1200));
  ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${artDir}/verify_390_product.png`, Buffer.from(ss.data, 'base64'));

  ws.close();
  pWs.close();
  chromeProc.kill();
  previewProc.kill();
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
