const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testLive() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9232;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_live_final';

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
  const send = (s, m, p={}) => new Promise((res, rej) => {
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

  // 1. Mobile Capture (iPhone 13 390x844)
  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send(pWs, 'Page.navigate', { url: 'https://printizer-topaz.vercel.app/#home' });
  await new Promise(r => setTimeout(r, 2500));

  const ssMobile = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/live_clean_header_mobile.png', Buffer.from(ssMobile.data, 'base64'));

  // 2. Desktop Capture (1440x900)
  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1.5,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1000));

  const ssDesktop = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/live_clean_header_desktop.png', Buffer.from(ssDesktop.data, 'base64'));

  console.log('Saved live_clean_header_mobile.png and live_clean_header_desktop.png');
  ws.close();
  pWs.close();
  chromeProc.kill();
}

testLive().catch(console.error);
