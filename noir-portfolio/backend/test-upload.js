const http = require('http');
const fs = require('fs');

const coverPath = 'C:/Users/CETIC-LuisGH2/Documents/Default Project/noir-portfolio/temp-images/cover_boda.jpg';
const fileData = fs.readFileSync(coverPath);
const boundary = '----NoirTest' + Date.now();

const body = [
  `--${boundary}\r\nContent-Disposition: form-data; name="coverImage"; filename="cover.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
].join('');

const ending = `\r\n--${boundary}--\r\n`;
const payload = Buffer.concat([Buffer.from(body, 'utf-8'), fileData, Buffer.from(ending, 'utf-8')]);

// Login
const loginBody = JSON.stringify({ email: 'admin@noir.com', password: 'admin123' });
const loginReq = http.request({
  hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const token = JSON.parse(d).token;
    console.log('Token:', token ? 'obtained' : 'FAILED');

    // Upload cover
    const req = http.request({
      hostname: '127.0.0.1', port: 5000, path: '/api/events/1', method: 'PUT',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => {
        console.log('Upload response:', d2);
        
        // Check originals
        const files = fs.readdirSync('C:/Users/CETIC-LuisGH2/Documents/Default Project/noir-portfolio/backend/uploads/originals');
        console.log('Originals:', files.filter(f => f !== '.gitkeep'));
        
        process.exit(0);
      });
    });
    req.write(payload);
    req.end();
  });
});
loginReq.write(loginBody);
loginReq.end();
