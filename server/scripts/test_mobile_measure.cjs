const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testMobile() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9224;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_measure2';

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

  // Test iPhone 13 (390 x 844)
  await send(pageWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send(pageWs, 'Page.navigate', { url: 'http://localhost:5173/#home' });
  await new Promise(r => setTimeout(r, 2000));

  const metrics = await send(pageWs, 'Runtime.evaluate', {
    expression: `
      (() => {
        const header = document.querySelector('header');
        const hero = document.querySelector('section');
        const categories = document.querySelector('#categories-showcase');
        return {
          windowInnerHeight: window.innerHeight,
          headerHeight: header ? header.offsetHeight : 0,
          heroHeight: hero ? hero.offsetHeight : 0,
          heroRect: hero ? hero.getBoundingClientRect() : null,
          categoriesTop: categories ? categories.getBoundingClientRect().top : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Mobile Measurements on iPhone 13 (390x844):', JSON.stringify(metrics.result.value, null, 2));

  // Capture screenshot of the first screen (exact viewport 390x844)
  const screenshot = await send(pageWs, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
  });

  fs.writeFileSync('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/current_mobile_test_390x844.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved current_mobile_test_390x844.png');

  ws.close();
  pageWs.close();
  chromeProc.kill();
}

testMobile().catch(console.error);
