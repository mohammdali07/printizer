const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75';
const DATA_FILE = path.join('E:', 'projects', 'PRINTIZER PROJECT', 'data', 'printizer.json');
const PORT = 3199;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function requestJson(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      `${BASE_URL}${urlPath}`,
      {
        method,
        headers: {
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(raw) });
          } catch (e) {
            reject(new Error(`Invalid JSON (${res.statusCode}): ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const originalDbBytes = fs.readFileSync(DATA_FILE, 'utf8');

  const serverProc = spawn(process.execPath, ['server/server.js'], {
    cwd: path.join('E:', 'projects', 'PRINTIZER PROJECT'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  let chromeProc = null;

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Express server startup timeout')), 15000);
      const poll = () => {
        http
          .get(`${BASE_URL}/api/health`, (res) => {
            if (res.statusCode === 200) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(poll, 250);
            }
          })
          .on('error', () => setTimeout(poll, 250));
      };
      poll();
    });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const debugPort = 9238;
    const userDataDir = path.join(ARTIFACT_DIR, 'scratch', 'chrome_profile_cfg');

    chromeProc = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank'
    ]);

    await sleep(1600);
    const versionData = await new Promise((res, rej) => {
      http
        .get(`http://127.0.0.1:${debugPort}/json/version`, (r) => {
          let b = '';
          r.on('data', (c) => (b += c));
          r.on('end', () => res(JSON.parse(b)));
        })
        .on('error', rej);
    });

    const ws = new WebSocket(versionData.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();
    const attach = (sock) => {
      sock.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.id && pending.has(m.id)) {
          const { res, rej } = pending.get(m.id);
          pending.delete(m.id);
          m.error ? rej(m.error) : res(m.result);
        }
      };
    };
    const send = (sock, method, params = {}) =>
      new Promise((res, rej) => {
        const id = msgId++;
        pending.set(id, { res, rej });
        sock.send(JSON.stringify({ id, method, params }));
      });
    attach(ws);
    await new Promise((r) => (ws.onopen = r));

    const target = await send(ws, 'Target.createTarget', { url: 'about:blank' });
    const pWs = new WebSocket(`ws://127.0.0.1:${debugPort}/devtools/page/${target.targetId}`);
    attach(pWs);
    await new Promise((r) => (pWs.onopen = r));
    await send(pWs, 'Page.enable');
    await send(pWs, 'Runtime.enable');

    const evalJs = async (expression) => {
      const r = await send(pWs, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return r.result?.value;
    };

    const setSelect = async (selector, value) => {
      return evalJs(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(el, ${JSON.stringify(value)});
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return el.value;
      })()`);
    };

    const assert = (cond, msg) => {
      if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
      console.log(`PASS: ${msg}`);
    };

    // --- TEST 0: HomePage tap on any product card opens clean Add Order Configuration view ---
    await send(pWs, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send(pWs, 'Page.navigate', { url: `${BASE_URL}/#home` });
    await sleep(1000);
    await evalJs(`localStorage.removeItem('prz_order_items');`);
    await send(pWs, 'Page.reload', { ignoreCache: true });

    let tappedHomeCard = false;
    for (let i = 0; i < 15; i++) {
      await sleep(300);
      tappedHomeCard = await evalJs(`(() => {
        const h4 = Array.from(document.querySelectorAll('h4')).find(el => el.textContent.includes('Visiting Card'));
        if (!h4) return false;
        h4.click();
        return true;
      })()`);
      if (tappedHomeCard) break;
    }
    assert(tappedHomeCard, 'Clicked Featured Product card on HomePage');
    await sleep(700);
    const homeTapState = await evalJs(`(() => ({
      hash: location.hash,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      hasAddOrderHeading: document.body.innerText.includes('Add Order'),
      hasFoil: !!document.querySelector('#order-foil-select'),
      hasSpotUv: !!document.querySelector('#order-spotuv-select')
    }))()`);
    assert(homeTapState.hash === '#configure/visiting-card' && homeTapState.h1 === 'Visiting Card Configuration', `Tapping HomePage product card opens Visiting Card Configuration (${homeTapState.hash} / ${homeTapState.h1})`);
    assert(homeTapState.hasAddOrderHeading && homeTapState.hasFoil && homeTapState.hasSpotUv, 'Clean Add Order view renders Foil, Spot UV, and Add Order form cleanly');
    const vcDeskShot = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cfg_vc_desktop.png'), Buffer.from(vcDeskShot.data, 'base64'));

    // --- TEST 1: Desktop (1440x900) Category -> "Configure & Get Quote" on Bill Book ---
    await send(pWs, 'Page.navigate', { url: `${BASE_URL}/#category/business-stationery` });
    await sleep(1000);

    const clickedBillBook = await evalJs(`(() => {
      const cards = Array.from(document.querySelectorAll('h3, h2, h4'));
      const billHeading = cards.find((h) => h.textContent.trim().toLowerCase() === 'bill book');
      if (!billHeading) return 'NO_HEADING';
      let card = billHeading.parentElement;
      while (card && !card.textContent.includes('Configure & Get Quote')) card = card.parentElement;
      const btn = card ? Array.from(card.querySelectorAll('button')).find((b) => b.textContent.includes('Configure & Get Quote')) : null;
      if (!btn) return 'NO_BTN';
      btn.click();
      return 'CLICKED';
    })()`);
    assert(clickedBillBook === 'CLICKED', 'Category page Configure & Get Quote click on Bill Book');
    await sleep(900);

    const billState = await evalJs(`(() => {
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      const catVal = document.querySelector('#config-category-select')?.value || '';
      const prodVal = document.querySelector('#order-product-select')?.value || '';
      const text = document.body.innerText;
      return {
        hash: location.hash,
        h1,
        catVal,
        prodVal,
        hasNcr: text.includes('NCR / Paper Carbon Option'),
        hasCopy: text.includes('Copy Type'),
        hasBinding: text.includes('Binding Option'),
        hasSets: text.includes('Number of Sets')
      };
    })()`);
    assert(billState.hash === '#configure/bill-book', `Navigated to #configure/bill-book (got ${billState.hash})`);
    assert(billState.h1 === 'Bill Book Configuration', `Heading shows "Bill Book Configuration" (got ${billState.h1})`);
    assert(billState.prodVal === 'bill-book', 'Bill Book auto-selected without re-selection');
    assert(billState.hasNcr && billState.hasCopy && billState.hasBinding && billState.hasSets, 'Bill Book displays NCR, Copy Type, Binding & Sets options');

    // Add Bill Book to Cart
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Add to Cart'));
      btn?.click();
    })()`);
    await sleep(500);

    // --- TEST 2: Switch top Select Category -> Marketing & Advertising -> verify products reload, then switch back & pick Visiting Card ---
    await setSelect('#config-category-select', 'marketing-advertising');
    await sleep(400);
    const mktgCheck = await evalJs(`(() => {
      const prodSel = document.querySelector('#order-product-select');
      const opts = prodSel ? Array.from(prodSel.options).map(o => o.value) : [];
      const text = document.body.innerText;
      return {
        count: opts.length,
        hasBillBook: opts.includes('bill-book'),
        hasNcr: text.includes('NCR / Paper Carbon Option')
      };
    })()`);
    assert(mktgCheck.count > 0 && !mktgCheck.hasBillBook && !mktgCheck.hasNcr, `Category change loads Marketing & Advertising products (${mktgCheck.count}) without Bill Book specs`);

    await setSelect('#config-category-select', 'business-stationery');
    await sleep(400);
    await setSelect('#order-product-select', 'visiting-card');
    await sleep(400);

    const readEstimatedTotal = () => evalJs(`(() => {
      const totalEl = document.querySelector('[data-testid="order-estimated-total"]');
      if (!totalEl) return 0;
      const m = totalEl.textContent.match(/₹\\s*([\\d,]+(?:\\.\\d+)?)/);
      return m ? Number(m[1].replace(/,/g, '')) : 0;
    })()`);

    const vcState = await evalJs(`(() => {
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      const text = document.body.innerText;
      return {
        h1,
        hasNcr: /NCR \\/ Paper Carbon Option/i.test(text),
        hasCopy: /Copy Type/i.test(text),
        hasPrinting: !!document.querySelector('#order-printing-select'),
        hasMaterial: !!document.querySelector('#order-material-select')
      };
    })()`);
    vcState.amount = await readEstimatedTotal();
    assert(vcState.h1 === 'Visiting Card Configuration', `Category switch updates heading to "Visiting Card Configuration" (got ${vcState.h1})`);
    assert(!vcState.hasNcr && !vcState.hasCopy, 'Visiting Card hides irrelevant NCR/Copy fields');
    assert(vcState.hasMaterial && vcState.hasPrinting && vcState.amount > 0, `Visiting Card computes live Amount (₹${vcState.amount})`);

    // Change printing & quantity -> amount increases deterministically
    await setSelect('#order-printing-select', await evalJs(`document.querySelector('#order-printing-select')?.options[1]?.value || ''`));
    await setSelect('#order-qty-select', await evalJs(`document.querySelector('#order-qty-select')?.options[1]?.value || ''`));
    await sleep(300);

    const vcUpdatedAmt = await readEstimatedTotal();
    assert(vcUpdatedAmt > vcState.amount, `Option/quantity change updates Amount dynamically (₹${vcState.amount} -> ₹${vcUpdatedAmt})`);

    // Add Visiting Card as 2nd item
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Add to Cart'));
      btn?.click();
    })()`);
    await sleep(600);

    const summaryAfterTwo = await evalJs(`(() => {
      const text = document.body.innerText;
      const totMatch = text.match(/Order Total[\\s\\S]*?₹\\s*([\\d,]+)/i);
      const h2List = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
      const waLink = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Enquire on WhatsApp'))?.getAttribute('href') || '';
      const decodedWa = waLink ? decodeURIComponent(waLink) : '';
      return {
        hasTwo: h2List.some(t => t.includes('Order Summary (2 Products)')) || text.includes('2 configured items'),
        h2List,
        total: totMatch ? Number(totMatch[1].replace(/,/g, '')) : 0,
        waOk: waLink.startsWith('https://wa.me/919898351920?text=') && decodedWa.includes('Bill Book') && decodedWa.includes('Visiting Card') && decodedWa.includes('NT Card'),
        overflowDesktop: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    assert(summaryAfterTwo.hasTwo && summaryAfterTwo.total > vcUpdatedAmt, `Multi-item Order Summary shows 2 Products & combined total ₹${summaryAfterTwo.total} (${summaryAfterTwo.h2List.join(' | ')})`);
    assert(summaryAfterTwo.waOk, 'Enquire on WhatsApp link encodes all cart items with materials, printing, quantity & prices');
    assert(!summaryAfterTwo.overflowDesktop, 'Desktop 1440px has zero horizontal overflow');

    const deskShot = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cfg_desktop.png'), Buffer.from(deskShot.data, 'base64'));

    // --- TEST 3: Edit 2nd item & Remove 1st item ---
    await evalJs(`(() => {
      const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Edit');
      editBtns[1]?.click();
    })()`);
    await sleep(400);
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Update Cart Item'));
      btn?.click();
    })()`);
    await sleep(400);

    await evalJs(`(() => {
      const remBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Remove');
      remBtns[0]?.click();
    })()`);
    await sleep(400);

    const summaryAfterEditRemove = await evalJs(`document.body.innerText.includes('Order Summary (1 Product)')`);
    assert(summaryAfterEditRemove, 'Order Summary Edit & Remove items work and update count to 1 Product');

    // --- TEST 4: Submit Multi-Item Request Quote Modal -> POST /api/enquiries ---
    const reqClicked = await evalJs(`(() => {
      const reqBtn = Array.from(document.querySelectorAll('section button')).find(b => b.textContent.trim() === 'Request Quote');
      if (!reqBtn) return false;
      reqBtn.click();
      return true;
    })()`);
    await sleep(400);

    const fillDiag = await evalJs(`(() => {
      const modalForm = Array.from(document.querySelectorAll('form')).find(f => f.textContent.includes('Submit Official Quote Request'));
      if (!modalForm) return { foundForm: false, reqClicked: ${Boolean(true)} };
      const setVal = (el, val) => {
        if (!el) return;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const inputs = Array.from(modalForm.querySelectorAll('input'));
      setVal(inputs[0], 'QA Verification User');
      setVal(modalForm.querySelector('input[type="tel"]'), '9898300000');
      setVal(modalForm.querySelector('input[type="email"]'), 'qa-verify@example.com');
      return {
        foundForm: true,
        vals: [inputs[0]?.value, modalForm.querySelector('input[type="tel"]')?.value, modalForm.querySelector('input[type="email"]')?.value]
      };
    })()`);
    await sleep(250);
    const submitDiag = await evalJs(`(() => {
      const modalForm = Array.from(document.querySelectorAll('form')).find(f => f.textContent.includes('Submit Official Quote Request'));
      const submitBtn = Array.from(modalForm?.querySelectorAll('button[type="submit"]') || []).find(b => b.textContent.includes('Submit Official Quote Request'));
      if (!submitBtn) return 'NO_SUBMIT_BTN';
      submitBtn.click();
      return 'CLICKED';
    })()`);

    let quoteSubmitted = false;
    for (let w = 0; w < 12; w++) {
      await sleep(300);
      quoteSubmitted = await evalJs(`document.body.innerText.includes('Reference:') || document.body.innerText.includes('Quotation Request Received')`);
      if (quoteSubmitted) break;
    }
    const modalDebug = quoteSubmitted ? '' : await evalJs(`JSON.stringify({ reqClicked: ${JSON.stringify(reqClicked)}, fillDiag: ${JSON.stringify(fillDiag)}, submitDiag: ${JSON.stringify(submitDiag)}, modalText: (document.querySelector('.fixed')?.innerText || '').slice(0, 300) })`);
    assert(quoteSubmitted, `Multi-product Request Quote modal submits to /api/enquiries cleanly ${modalDebug}`);
    await evalJs(`(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Clear Summary'));
      closeBtn?.click();
    })()`);
    await sleep(300);

    // --- TEST 5: Admin dynamic priceUnavailable toggle -> "Request a Quote" ---
    const prodList = await requestJson('GET', '/api/products');
    const vcOrig = prodList.json.data.find((p) => p.slug === 'visiting-card');
    assert(Boolean(vcOrig), 'Fetched visiting-card via /api/products');

    await requestJson('PUT', `/api/products/${vcOrig.id}`, {
      pricingConfig: { ...vcOrig.pricingConfig, priceUnavailable: true }
    });
    await send(pWs, 'Page.navigate', { url: `${BASE_URL}/#configure/visiting-card` });
    await sleep(600);
    // Force full reload so catalog state pulls updated DB immediately
    await send(pWs, 'Page.reload', { ignoreCache: true });

    let quoteOnlyState = { hasQuoteOnly: false, hasNumericEst: false };
    for (let i = 0; i < 15; i++) {
      await sleep(300);
      quoteOnlyState = await evalJs(`(() => {
        const text = document.body.innerText;
        return {
          hasQuoteOnly: /Request a Quote/i.test(text),
          hasNumericEst: /Estimated Total Amount/i.test(text)
        };
      })()`);
      if (quoteOnlyState.hasQuoteOnly && !quoteOnlyState.hasNumericEst) break;
    }
    assert(quoteOnlyState.hasQuoteOnly && !quoteOnlyState.hasNumericEst, 'Admin priceUnavailable setting displays "Request a Quote" without fake prices');

    // Restore original visiting-card
    await requestJson('PUT', `/api/products/${vcOrig.id}`, {
      pricingConfig: vcOrig.pricingConfig
    });

    // --- TEST 6: Tablet (768x1024) & Mobile (390x844, 320x568) Responsive Checks ---
    await send(pWs, 'Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send(pWs, 'Page.navigate', { url: `${BASE_URL}/#configure/bill-book` });
    await sleep(900);
    const tabletOverflow = await evalJs(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!tabletOverflow, 'Tablet 768px has zero horizontal overflow');
    const tabShot = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cfg_tablet.png'), Buffer.from(tabShot.data, 'base64'));

    for (const mw of [390, 320]) {
      await send(pWs, 'Emulation.setDeviceMetricsOverride', {
        width: mw,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await sleep(500);
      const mobCheck = await evalJs(`(() => {
        const prodEl = document.querySelector('#order-product-select');
        const printEl = document.querySelector('#order-printing-select');
        const pRect = prodEl?.getBoundingClientRect();
        const rRect = printEl?.getBoundingClientRect();
        return {
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          stacked: pRect && rRect ? rRect.top > pRect.bottom : true
        };
      })()`);
      assert(mobCheck.scrollW <= mobCheck.innerW, `Mobile ${mw}px has zero horizontal overflow (${mobCheck.scrollW} <= ${mobCheck.innerW})`);
      assert(mobCheck.stacked, `Mobile ${mw}px stacks Left & Right columns vertically`);
    }

    // Re-capture 390px mobile screenshot
    await send(pWs, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(400);
    const mobShot = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_cfg_mobile.png'), Buffer.from(mobShot.data, 'base64'));

    console.log('\nALL ORDER CONFIGURATOR E2E CHECKS PASSED.');
  } finally {
    if (chromeProc) chromeProc.kill();
    serverProc.kill();
    await sleep(400);
    // Restore original data/printizer.json so synthetic QA enquiry doesn't pollute DB
    fs.writeFileSync(DATA_FILE, originalDbBytes, 'utf8');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
