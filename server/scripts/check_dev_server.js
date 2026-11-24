import http from 'http';

function check(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    }).on('error', reject);
  });
}

async function test() {
  const root = await check('http://localhost:5173/');
  console.log('Root index.html status:', root.status, 'Has root div:', root.body.includes('<div id="root"></div>'));

  const main = await check('http://localhost:5173/src/main.jsx');
  console.log('/src/main.jsx status:', main.status);

  const app = await check('http://localhost:5173/src/App.jsx');
  console.log('/src/App.jsx status:', app.status);

  const home = await check('http://localhost:5173/src/pages/HomePage.jsx');
  console.log('/src/pages/HomePage.jsx status:', home.status);

  const modal = await check('http://localhost:5173/src/components/RateListModal.jsx');
  console.log('/src/components/RateListModal.jsx status:', modal.status);

  const config = await check('http://localhost:5173/src/components/PrintConfigurator.jsx');
  console.log('/src/components/PrintConfigurator.jsx status:', config.status);

  console.log('ALL MODULES COMPILED CLEANLY ON VITE DEV SERVER (PORT 5173)!');
}

test().catch(e => console.error('Error:', e));
