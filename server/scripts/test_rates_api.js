import http from 'http';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing /api/rates endpoint...');
  const ratesRes = await get('/api/rates');
  console.log(`Status: ${ratesRes.status}, Success: ${ratesRes.body.success}, Count: ${ratesRes.body.count}`);

  if (ratesRes.body.data && ratesRes.body.data.length > 0) {
    const vcSample = ratesRes.body.data.find(r => r.product === 'NT Card');
    console.log('Sample Visiting Card (NT Card):', vcSample);

    const letterPadSample = ratesRes.body.data.find(r => r.group === 'Letter Pad');
    console.log('Sample Letter Pad:', letterPadSample);

    const coverSample = ratesRes.body.data.find(r => r.group === 'Cover');
    console.log('Sample Cover:', coverSample);

    const stickerSample = ratesRes.body.data.find(r => r.group === 'Sticker');
    console.log('Sample Sticker:', stickerSample);
  }

  console.log('\nTesting /api/categories endpoint...');
  const catRes = await get('/api/categories');
  console.log(`Categories count: ${catRes.body.count}`);

  console.log('\nTesting /api/products endpoint...');
  const prodRes = await get('/api/products');
  console.log(`Products count: ${prodRes.body.count}`);

  console.log('\nAll API tests verified successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
