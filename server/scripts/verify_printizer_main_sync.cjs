const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function verifySync() {
  const previewProc = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4174', '--strictPort'], {
    cwd: 'E:\\projects\\PRINTIZER PROJECT\\client',
    stdio: 'pipe'
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server timeout')), 15000);
    const check = () => {
      http.get('http://localhost:4174/', () => {
        clearTimeout(timer);
        resolve();
      }).on('error', () => setTimeout(check, 300));
    };
    check();
  });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9237;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_sync';

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

  // 1. Check HomePage
  await send(pWs, 'Page.navigate', { url: 'http://localhost:4174/#home' });
  await new Promise(r => setTimeout(r, 1200));
  const homeInfo = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => ({
      hasRupee: document.body.innerText.includes('₹'),
      hasCategoriesCount47: document.body.innerText.includes('47 Products')
    }))()`,
    returnByValue: true
  });
  console.log('Home Check:', JSON.stringify(homeInfo.result.value));

  // 2. Check Visiting Card (Retail Single = 455, Both Sides = 637 with +30% markup)
  await send(pWs, 'Page.navigate', { url: 'http://localhost:4174/#product/visiting-card' });
  await new Promise(r => setTimeout(r, 1000));
  const vcInfo = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => ({
      textHas637: document.body.innerText.includes('637'),
      textHas455: document.body.innerText.includes('455'),
      textHasHSN4911: document.body.innerText.includes('4911'),
      textHasCorelDraw: document.body.innerText.includes('CorelDRAW')
    }))()`,
    returnByValue: true
  });
  console.log('Visiting Card Check:', JSON.stringify(vcInfo.result.value));

  let ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/verify_sync_vc.png', Buffer.from(ss.data, 'base64'));

  // 3. Check HM Sticker (Per Sq.Inch + Width x Height)
  await send(pWs, 'Page.navigate', { url: 'http://localhost:4174/#product/hm-sticker' });
  await new Promise(r => setTimeout(r, 1000));
  const stickerInfo = await send(pWs, 'Runtime.evaluate', {
    expression: `(() => ({
      title: document.querySelector('h1')?.innerText,
      hasWidthInput: Boolean(document.querySelector('input[step="0.25"]')),
      hasMin1000: document.body.innerText.includes('1,000'),
      hasHSN4821: document.body.innerText.includes('4821'),
      hasTotal: document.body.innerText.includes('₹ 3,185') || document.body.innerText.includes('3,185')
    }))()`,
    returnByValue: true
  });
  console.log('HM Sticker Check:', JSON.stringify(stickerInfo.result.value));

  // Scroll to configurator on HM Sticker and screenshot
  await send(pWs, 'Runtime.evaluate', {
    expression: `document.querySelector('input[step="0.25"]')?.closest('.sticky')?.scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 500));
  ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/verify_sync_sticker_config.png', Buffer.from(ss.data, 'base64'));

  ws.close();
  pWs.close();
  chromeProc.kill();
  previewProc.kill();
}

verifySync().catch(err => {
  console.error(err);
  process.exit(1);
});
