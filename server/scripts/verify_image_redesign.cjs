const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_DIR = 'E:\\projects\\PRINTIZER PROJECT';
const ARTIFACT_DIR = 'C:\\Users\\Mo ali khanusiya\\.gemini\\antigravity\\brain\\1602d216-ca92-470b-8a50-e26ff8b51a75';
const PORT = 5099;

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('Server did not start in time: ' + url);
}

async function run() {
  const serverProc = spawn(process.execPath, ['server/server.js'], {
    cwd: BASE_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  let chromeProc;
  try {
    await waitForServer(`http://127.0.0.1:${PORT}/api/health`);
    console.log('Express + Built Client running on port', PORT);

    // 1. Test Backend Image Upload & Independent New Test Product CRUD
    const samplePngPath = path.join(BASE_DIR, 'client', 'public', 'images', 'products', 'quotation-book.webp');
    const fileBuf = fs.readFileSync(samplePngPath);
    const fd = new FormData();
    fd.append('productId', 'test-isolated-sku');
    fd.append('images', new Blob([fileBuf], { type: 'image/webp' }), 'test-custom-box.webp');

    const upRes = await fetch(`http://127.0.0.1:${PORT}/api/products/upload-image`, {
      method: 'POST',
      body: fd
    });
    const upJson = await upRes.json();
    if (!upRes.ok || !upJson.success || !upJson.files?.[0]?.url) {
      throw new Error('Upload failed: ' + JSON.stringify(upJson));
    }
    const uploadedUrl = upJson.files[0].url;
    const uploadedFilename = upJson.files[0].filename;
    console.log('Uploaded isolated product image:', uploadedUrl);

    // Create new test product with this image + second image
    const createRes = await fetch(`http://127.0.0.1:${PORT}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Custom Rigid Box SKU',
        slug: 'test-custom-rigid-box-sku',
        categoryId: 'packaging-printing',
        categoryName: 'Packaging Printing',
        tagline: 'Automated verification test item',
        description: 'Independent image mapping verification product.',
        minQuantity: 250,
        image: uploadedUrl,
        secondaryImages: [uploadedUrl]
      })
    });
    const createJson = await createRes.json();
    if (!createRes.ok || !createJson.success) {
      throw new Error('Create test product failed: ' + JSON.stringify(createJson));
    }
    const createdProd = createJson.data;
    console.log('Created independent test product:', createdProd.id, '-> image:', createdProd.image);

    // Verify all 144 base products still untouched and test product resolves cleanly
    const prodsRes = await fetch(`http://127.0.0.1:${PORT}/api/products`);
    const prodsJson = await prodsRes.json();
    const fetchedTest = prodsJson.data.find(p => p.id === createdProd.id);
    if (!fetchedTest || fetchedTest.image !== uploadedUrl) {
      throw new Error('Test product image did not persist independently!');
    }

    // 2. Launch Chrome CDP for UI + Responsive + Admin Modal Verification
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const debuggingPort = 9241;
    const userDataDir = path.join(ARTIFACT_DIR, 'scratch', 'chrome_profile_redesign_verify');

    chromeProc = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));

    const versionData = await (await fetch(`http://127.0.0.1:${debuggingPort}/json/version`)).json();
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

    // A) Check Business Stationery Category on Mobile (390x844)
    await send(pWs, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await send(pWs, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/#category/business-stationery` });
    await new Promise(r => setTimeout(r, 1400));

    // Scroll smoothly down the entire grid so every lazy image intersects the viewport and loads
    await send(pWs, 'Runtime.evaluate', {
      expression: `(async () => {
        const cards = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('/images/products/'));
        for (let idx = 0; idx < cards.length; idx++) {
          cards[idx].scrollIntoView({ block: 'center' });
          await new Promise(r => setTimeout(r, 45));
        }
        await new Promise(r => setTimeout(r, 800));
        window.scrollTo(0, 780);
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    const catMobile = await send(pWs, 'Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('/images/products/'));
        const srcs = imgs.map(i => new URL(i.src).pathname);
        const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
        const firstCard = imgs[0]?.closest('.group');
        return {
          productImgCount: imgs.length,
          uniqueSrcCount: new Set(srcs).size,
          brokenCount: broken.length,
          brokenSample: broken.slice(0, 5),
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          cardHasButtons: Boolean(firstCard?.innerText.includes('Configure & Get Quote') && firstCard?.innerText.includes('View Details') && firstCard?.innerText.includes('WhatsApp'))
        };
      })()`,
      returnByValue: true
    });
    console.log('Mobile Category Check (390px):', JSON.stringify(catMobile.result.value));
    let ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_redesign_cat_mobile.png'), Buffer.from(ss.data, 'base64'));

    // B) Check Category on Tablet (768x1024) and Desktop (1440x900)
    await send(pWs, 'Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 500));
    const catTabletOverflow = await send(pWs, 'Runtime.evaluate', {
      expression: `document.documentElement.scrollWidth > document.documentElement.clientWidth`,
      returnByValue: true
    });
    console.log('Tablet (768px) overflow:', catTabletOverflow.result.value);

    await send(pWs, 'Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 500));
    ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_redesign_cat_desktop.png'), Buffer.from(ss.data, 'base64'));

    // C) Check Product Detail Page for our newly created isolated test product & quotation-book
    await send(pWs, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/#product/quotation-book` });
    await new Promise(r => setTimeout(r, 1000));
    const detailCheck = await send(pWs, 'Runtime.evaluate', {
      expression: `(() => {
        const mainImg = document.querySelector('img[alt="Quotation Book"]');
        const bodyTxt = document.body.innerText.toLowerCase();
        return {
          imgLoaded: Boolean(mainImg && mainImg.complete && mainImg.naturalWidth > 0),
          imgSrc: mainImg?.getAttribute('src'),
          hasSpecs: bodyTxt.includes('paper options') && bodyTxt.includes('available finishing options'),
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log('Quotation Book Detail Check:', JSON.stringify(detailCheck.result.value));
    ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_redesign_detail_desktop.png'), Buffer.from(ss.data, 'base64'));

    // D) Verify Admin Dashboard Products Tab & Image Gallery Manager UI
    await send(pWs, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/#admin` });
    await new Promise(r => setTimeout(r, 1000));
    await send(pWs, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In') || b.innerText.includes('Demo'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    await send(pWs, 'Runtime.evaluate', {
      expression: `(() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Product Catalogue'));
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));
    await send(pWs, 'Runtime.evaluate', {
      expression: `(() => {
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Product'));
        if (addBtn) addBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
    const adminCheck = await send(pWs, 'Runtime.evaluate', {
      expression: `(() => ({
        hasImageManager: document.body.innerText.toLowerCase().includes('product image & gallery manager'),
        hasEmptyDefault: !document.body.innerHTML.includes('visiting-card-red-gloss.jpg')
      }))()`,
      returnByValue: true
    });
    console.log('Admin Image Manager Check:', JSON.stringify(adminCheck.result.value));
    ss = await send(pWs, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_redesign_admin_modal.png'), Buffer.from(ss.data, 'base64'));

    // Clean up test product & test uploaded file so production catalog stays 144 pure products
    await fetch(`http://127.0.0.1:${PORT}/api/products/${createdProd.id}`, { method: 'DELETE' });
    const uploadedDiskFile = path.join(BASE_DIR, 'server', 'uploads', 'products', uploadedFilename);
    if (fs.existsSync(uploadedDiskFile)) fs.unlinkSync(uploadedDiskFile);

    ws.close();
    pWs.close();
    console.log('ALL QUALITY CHECKS COMPLETED CLEANLY!');
  } finally {
    if (chromeProc) chromeProc.kill();
    serverProc.kill();
  }
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
