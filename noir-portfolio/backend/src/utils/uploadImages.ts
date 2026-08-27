const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE = 'http://localhost:5000';
const IMG_DIR = path.join(__dirname, '../../temp-images');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function multipartRequest(url, filePath, fieldName, extraFields = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Date.now();
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    let body = '';
    for (const [key, val] of Object.entries(extraFields)) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${val}\r\n`;
    }
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;

    const bodyStart = Buffer.from(body, 'utf-8');
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const fullBody = Buffer.concat([bodyStart, fileData, bodyEnd]);

    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        'Authorization': `Bearer ${globalToken}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

let globalToken = '';

async function main() {
  // Login
  const login = await request(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@noir.com', password: 'admin123' }),
  });
  globalToken = login.token;
  console.log('Logged in');

  // Get events
  const eventsData = await request(`${BASE}/api/events?limit=10`);
  const events = eventsData.events;
  console.log(`Found ${events.length} events`);

  // Cover images mapping
  const coverMap = {
    'boda-marina-carlos': 'cover_boda.jpg',
    'retratos-urbanos': 'cover_retrato.jpg',
    'atardecer-montana': 'cover_paisaje.jpg',
    'festival-musica': 'cover_festival.jpg',
  };

  // Photos mapping
  const photosMap = {
    'boda-marina-carlos': ['boda_01.jpg', 'boda_02.jpg', 'boda_03.jpg', 'boda_04.jpg'],
    'retratos-urbanos': ['retrato_01.jpg', 'retrato_02.jpg', 'retrato_03.jpg'],
    'atardecer-montana': ['paisaje_01.jpg', 'paisaje_02.jpg', 'paisaje_03.jpg'],
    'festival-musica': ['festival_01.jpg', 'festival_02.jpg', 'festival_03.jpg'],
  };

  for (const event of events) {
    console.log(`\nProcessing: ${event.title}`);

    // Upload cover
    const coverFile = coverMap[event.slug];
    if (coverFile) {
      const coverPath = path.join(IMG_DIR, coverFile);
      if (fs.existsSync(coverPath)) {
        console.log(`  Uploading cover: ${coverFile}`);
        const coverResult = await multipartRequest(
          `${BASE}/api/events/${event.id}`,
          coverPath,
          'coverImage'
        );
        console.log(`  Cover uploaded`);
      }
    }

    // Upload photos
    const photos = photosMap[event.slug] || [];
    if (photos.length > 0) {
      console.log(`  Uploading ${photos.length} photos...`);
      for (const photoName of photos) {
        const photoPath = path.join(IMG_DIR, photoName);
        if (fs.existsSync(photoPath)) {
          const result = await multipartRequest(
            `${BASE}/api/upload/photos`,
            photoPath,
            'photos',
            { eventId: event.id }
          );
          console.log(`    ${photoName} -> OK`);
        }
      }
    }
  }

  console.log('\nAll images uploaded!');
}

main().catch(console.error);
