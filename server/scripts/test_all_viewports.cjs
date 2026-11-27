const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testAllViewports() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9231;
  const userDataDir = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75\\scratch\\chrome_profile_vp_all';

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

  const viewports = [
    { width: 320, height: 650, name: '320_small' },
    { width: 340, height: 680, name: '340_mobile' },
    { width: 360, height: 740, name: '360_galaxy' },
    { width: 375, height: 667, name: '375_iphoneSE' },
    { width: 390, height: 844, name: '390_iphone13' },
    { width: 414, height: 896, name: '414_iphonePlus' },
    { width: 430, height: 932, name: '430_iphoneProMax' },
    { width: 480, height: 800, name: '480_largePhone' },
    { width: 600, height: 900, name: '600_fold' },
    { width: 1440, height: 900, name: '1440_desktop' }
  ];

  for (const vp of viewports) {
    await send(pWs, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.width < 1024
    });

    await send(pWs, 'Page.navigate', { url: 'http://localhost:5173/#home' });
    await new Promise(r => setTimeout(r, 1200));

    const metrics = await send(pWs, 'Runtime.evaluate', {
      expression: `
        (() => {
          const body = document.body;
          const html = document.documentElement;
          const hero = document.querySelector('section');
          const img = hero ? hero.querySelector('img') : null;
          const h1 = hero ? hero.querySelector('h1') : null;
          const header = document.querySelector('header');
          return {
            windowWidth: window.innerWidth,
            scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
            hasHorizontalOverflow: Math.max(body.scrollWidth, html.scrollWidth) > window.innerWidth,
            headerHeight: header ? header.offsetHeight : 0,
            h1Text: h1 ? h1.innerText.replace(/\\n/g, ' ') : '',
            h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : '',
            imgWidth: img ? img.offsetWidth : 0,
            imgHeight: img ? img.offsetHeight : 0
          };
        })()
      `,
      returnByValue: true
    });

    const m = metrics.result.value;
    console.log(`[Viewport ${vp.width}px]: scrollWidth=${m.scrollWidth}, overflow=${m.hasHorizontalOverflow}, h1Size=${m.h1FontSize}, img=${m.imgWidth}x${m.imgHeight}`);

    const screenshot = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/1602d216-ca92-470b-8a50-e26ff8b51a75/test_vp_${vp.name}.png`, Buffer.from(screenshot.data, 'base64'));
  }

  ws.close();
  pWs.close();
  chromeProc.kill();
  console.log('All viewport tests completed!');
}

testAllViewports().catch(console.error);
