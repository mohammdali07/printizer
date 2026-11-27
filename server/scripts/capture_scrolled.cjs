const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testViewportScreenshot() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9230;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_vp2';

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
  await send(pWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send(pWs, 'Page.navigate', { url: 'https://printizer-topaz.vercel.app/#home' });
  await new Promise(r => setTimeout(r, 2500));

  // Initial Viewport screenshot (no clip -> captures active viewport)
  const ss1 = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/vp_viewport_initial.png', Buffer.from(ss1.data, 'base64'));

  // Scroll into categories
  await send(pWs, 'Runtime.evaluate', {
    expression: 'document.querySelector("#categories-showcase").scrollIntoView({ behavior: "instant" })'
  });
  await new Promise(r => setTimeout(r, 1200));

  const ss2 = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/vp_viewport_scrolled.png', Buffer.from(ss2.data, 'base64'));

  console.log('Saved vp_viewport_initial.png and vp_viewport_scrolled.png');
  ws.close();
  pWs.close();
  chromeProc.kill();
}

testViewportScreenshot().catch(console.error);
