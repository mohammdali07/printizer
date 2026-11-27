const http = require('http');
const { spawn } = require('child_process');

async function inspectMadhuram() {
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const debuggingPort = 9239;
  const userDataDir = 'C:\\\\Users\\\\Mo ali khanusiya\\\\.gemini\\\\antigravity\\\\brain\\\\ae115228-6bcf-4779-b4f1-129a80696055\\\\scratch\\\\chrome_profile_madhuram';

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

    await send(pageWs, 'Page.navigate', { url: 'https://madhuramprint.com/home' });
    await new Promise(r => setTimeout(r, 4000));

    const info = await send(pageWs, 'Runtime.evaluate', {
      expression: `(() => {
        const links = Array.from(document.querySelectorAll('a, button')).map(el => ({
          tag: el.tagName,
          text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
          href: el.getAttribute('href') || el.getAttribute('routerlink') || ''
        })).filter(x => x.text || x.href);
        return JSON.stringify(links.slice(0, 60));
      })()`
    });

    console.log('LINKS:', info.result.value);

    // Also try navigating to add-order if present
    await send(pageWs, 'Page.navigate', { url: 'https://madhuramprint.com/add-order' });
    await new Promise(r => setTimeout(r, 3500));
    const orderInfo = await send(pageWs, 'Runtime.evaluate', {
      expression: `(() => {
        const selects = Array.from(document.querySelectorAll('select')).map(s => ({
          id: s.id || s.name || s.getAttribute('formcontrolname') || '',
          options: Array.from(s.options).map(o => o.text.trim())
        }));
        const labels = Array.from(document.querySelectorAll('label')).map(l => l.innerText.trim());
        return JSON.stringify({ url: location.href, labels, selects });
      })()`
    });
    console.log('ADD-ORDER:', orderInfo.result.value);

    pageWs.close();
    browserWs.close();
  } finally {
    chromeProc.kill();
  }
}

inspectMadhuram().catch(err => {
  console.error(err);
  process.exit(1);
});
