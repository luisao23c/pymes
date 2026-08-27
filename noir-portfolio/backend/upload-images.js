const http = require('http');
const fs = require('fs');
const path = require('path');

const IMG_DIR = 'C:/Users/CETIC-LuisGH2/Documents/Default Project/noir-portfolio/temp-images';
const UPLOADS = 'C:/Users/CETIC-LuisGH2/Documents/Default Project/noir-portfolio/backend/uploads';

function httpReq(method, urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: '127.0.0.1', port: 5000, path: urlPath, method, headers: headers || {} };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function multipartPost(urlPath, filePath, fieldName, extraFields, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----Noir' + Date.now();
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    let parts = [];
    for (const [k, v] of Object.entries(extraFields)) {
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`);
    }
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`);
    const preamble = Buffer.from(parts.join(''), 'utf-8');
    const ending = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([preamble, fileData, ending]);

    const req = http.request({
      hostname: '127.0.0.1', port: 5000, path: urlPath, method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Authorization': `Bearer ${token}`,
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function multipartPut(urlPath, filePath, fieldName, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----Noir' + Date.now();
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const parts = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const preamble = Buffer.from(parts, 'utf-8');
    const ending = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([preamble, fileData, ending]);

    const req = http.request({
      hostname: '127.0.0.1', port: 5000, path: urlPath, method: 'PUT',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Authorization': `Bearer ${token}`,
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const login = await httpReq('POST', '/api/auth/login', { 'Content-Type': 'application/json' },
    JSON.stringify({ email: 'admin@noir.com', password: 'admin123' }));
  const token = login.token;
  console.log('Logged in');

  const evData = await httpReq('GET', '/api/events?limit=10', { 'Authorization': `Bearer ${token}` });
  const events = evData.events;
  console.log(`Found ${events.length} events\n`);

  const covers = {
    'boda-marina-carlos': 'cover_boda.jpg',
    'retratos-urbanos': 'cover_retrato.jpg',
    'atardecer-montana': 'cover_paisaje.jpg',
    'festival-musica': 'cover_festival.jpg',
  };

  const photosMap = {
    'boda-marina-carlos': ['boda_01.jpg','boda_02.jpg','boda_03.jpg','boda_04.jpg'],
    'retratos-urbanos': ['retrato_01.jpg','retrato_02.jpg','retrato_03.jpg'],
    'atardecer-montana': ['paisaje_01.jpg','paisaje_02.jpg','paisaje_03.jpg'],
    'festival-musica': ['festival_01.jpg','festival_02.jpg','festival_03.jpg'],
  };

  for (const event of events) {
    console.log(`=== ${event.title} ===`);

    const coverFile = covers[event.slug];
    if (coverFile) {
      const p = path.join(IMG_DIR, coverFile);
      if (fs.existsSync(p)) {
        const r = await multipartPut(`/api/events/${event.id}`, p, 'coverImage', token);
        console.log(`  Cover: ${r.coverThumbnail ? 'OK' : r.error || 'done'}`);
      }
    }

    const photos = photosMap[event.slug] || [];
    for (const photo of photos) {
      const p = path.join(IMG_DIR, photo);
      if (fs.existsSync(p)) {
        const r = await multipartPost('/api/upload/photos', p, 'photos', { eventId: String(event.id) }, token);
        console.log(`  ${photo}: ${r.count ? 'OK' : r.error || 'done'}`);
      }
    }
  }

  // Verify
  const ev2 = await httpReq('GET', '/api/events?limit=10', { 'Authorization': `Bearer ${token}` });
  console.log('\n=== Verification ===');
  for (const e of ev2.events) {
    console.log(`${e.title}: photos=${e.photosCount}, cover=${e.coverImage ? 'YES' : 'NO'}`);
  }

  const origCount = fs.readdirSync(path.join(UPLOADS, 'originals')).filter(f => f !== '.gitkeep').length;
  const compCount = fs.readdirSync(path.join(UPLOADS, 'compressed')).filter(f => f !== '.gitkeep').length;
  const thumbCount = fs.readdirSync(path.join(UPLOADS, 'thumbnails')).filter(f => f !== '.gitkeep').length;
  console.log(`\nFiles: ${origCount} originals, ${compCount} compressed, ${thumbCount} thumbnails`);
  console.log('\nDONE');
}

main().catch(e => { console.error(e); process.exit(1); });
