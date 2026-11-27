const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testLiveVercel() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9228;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_live2';

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${debuggingPort}/json/version`, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  const ws = new WebSocket(versionData.webSocketDebuggerUrl);
  let idCounter = 1;
  const pending = new Map();

  function send(socket, method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  function setupMessageHandler(socket) {
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  setupMessageHandler(ws);
  await new Promise(r => ws.onopen = r);

  const target = await send(ws, 'Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(`ws://127.0.0.1:${debuggingPort}/devtools/page/${target.targetId}`);
  setupMessageHandler(pageWs);
  await new Promise(r => pageWs.onopen = r);

  await send(pageWs, 'Page.enable');
  await send(pageWs, 'Runtime.enable');

  await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send(pageWs, 'Page.navigate', { url: 'https://printizer-topaz.vercel.app/#home' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Initial screen screenshot
  const screenshot1 = await send(pageWs, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
  });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/live_vercel_hero_first_screen.png', Buffer.from(screenshot1.data, 'base64'));

  // 2. Scroll into categories
  await send(pageWs, 'Runtime.evaluate', {
    expression: 'document.querySelector("#categories-showcase").scrollIntoView({ behavior: "instant" })'
  });
  await new Promise(r => setTimeout(r, 1000));

  const screenshot2 = await send(pageWs, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
  });
  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/live_vercel_scrolled_categories.png', Buffer.from(screenshot2.data, 'base64'));
  console.log('Successfully captured initial hero and scrolled categories screenshots from live Vercel!');

  ws.close();
  pageWs.close();
  chromeProc.kill();
}

testLiveVercel().catch(console.error);
