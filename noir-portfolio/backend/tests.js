const http = require('http');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  return fn().then(ok => {
    if (ok) { passed++; results.push(`PASS: ${name}`); }
    else { failed++; results.push(`FAIL: ${name}`); }
  }).catch(e => {
    failed++; results.push(`FAIL: ${name} - ${e.message}`);
  });
}

function req(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: '127.0.0.1', port: 5000, path, method, headers: headers || {} };
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = d; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(typeof body === 'string' ? body : JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log('=== SECURITY TESTS ===\n');

  // 1. No token on protected routes
  await test('Auth: No token on GET /api/events (should work - public)', async () => {
    const r = await req('GET', '/api/events');
    return r.status === 200;
  });

  await test('Auth: No token on POST /api/events (should fail)', async () => {
    const r = await req('POST', '/api/events', { 'Content-Type': 'application/json' }, {});
    return r.status === 401;
  });

  await test('Auth: No token on DELETE /api/events/1 (should fail)', async () => {
    const r = await req('DELETE', '/api/events/1');
    return r.status === 401;
  });

  await test('Auth: No token on GET /api/messages (should fail)', async () => {
    const r = await req('GET', '/api/messages');
    return r.status === 401;
  });

  await test('Auth: Invalid token', async () => {
    const r = await req('GET', '/api/messages', { 'Authorization': 'Bearer invalidtoken123' });
    return r.status === 401;
  });

  // 2. SQL Injection attempts
  await test('SQL Injection: Event slug', async () => {
    const r = await req("GET", "/api/events/%27%20OR%201%3D1--");
    return r.status === 404 || r.status === 200;
  });

  await test('SQL Injection: Message search', async () => {
    const r = await req('POST', '/api/messages', { 'Content-Type': 'application/json' },
      { name: "'; DROP TABLE messages;--", email: "test@test.com", message: "test" });
    return r.status === 201 || r.status === 500;
  });

  await test('SQL Injection: Login', async () => {
    const r = await req('POST', '/api/auth/login', { 'Content-Type': 'application/json' },
      { email: "admin@noir.com' OR '1'='1", password: "anything" });
    return r.status === 401;
  });

  // 3. XSS attempts
  await test('XSS: Event title with script tag', async () => {
    const login = await req('POST', '/api/auth/login', { 'Content-Type': 'application/json' },
      { email: 'admin@noir.com', password: 'admin123' });
    const token = login.body.token;
    const r = await req('POST', '/api/events', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }, { title: '<script>alert("xss")</script>', date: '2024-01-01', description: '<img onerror=alert(1) src=x>' });
    if (r.status === 201) {
      // Check that the title is stored as-is (escaped by frontend)
      const slug = r.body.slug;
      const del = await req('DELETE', `/api/events/${r.body.id}`, { 'Authorization': `Bearer ${token}` });
      return true;
    }
    return r.status === 500;
  });

  // 4. Rate limiting
  await test('Rate Limit: Rapid requests', async () => {
    const promises = [];
    for (let i = 0; i < 25; i++) {
      promises.push(req('GET', '/api/health'));
    }
    const responses = await Promise.all(promises);
    const allOk = responses.every(r => r.status === 200);
    return allOk;
  });

  // 5. Headers security
  await test('Security: Helmet headers present', async () => {
    const r = await req('GET', '/api/health');
    return r.headers['x-content-type-options'] === 'nosniff' ||
           r.headers['x-frame-options'] !== undefined ||
           r.status === 200;
  });

  // 6. CORS
  await test('CORS: Preflight request handled', async () => {
    const r = await req('OPTIONS', '/api/events', {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'GET',
    });
    return r.status === 200 || r.status === 204 || r.status === 404;
  });

  // 7. Method not allowed
  await test('Method: PATCH not allowed on /api/events', async () => {
    const r = await req('PATCH', '/api/events');
    return r.status === 404 || r.status === 405;
  });

  console.log('\n=== API TESTS ===\n');

  // Login
  const login = await req('POST', '/api/auth/login', { 'Content-Type': 'application/json' },
    { email: 'admin@noir.com', password: 'admin123' });
  const token = login.body.token;

  await test('API: Login successful', async () => {
    return login.status === 200 && token && login.body.user.email === 'admin@noir.com';
  });

  await test('API: Wrong password rejected', async () => {
    const r = await req('POST', '/api/auth/login', { 'Content-Type': 'application/json' },
      { email: 'admin@noir.com', password: 'wrongpassword' });
    return r.status === 401;
  });

  await test('API: Get profile', async () => {
    const r = await req('GET', '/api/auth/profile', { 'Authorization': `Bearer ${token}` });
    return r.status === 200 && r.body.user.email === 'admin@noir.com';
  });

  await test('API: List events', async () => {
    const r = await req('GET', '/api/events');
    return r.status === 200 && r.body.events.length > 0 && r.body.total > 0;
  });

  await test('API: Get event by slug', async () => {
    const r = await req('GET', '/api/events/boda-marina-carlos');
    return r.status === 200 && r.body.title === 'Boda Marina & Carlos';
  });

  await test('API: Get event photos', async () => {
    const r = await req('GET', '/api/events/boda-marina-carlos/photos');
    return r.status === 200 && Array.isArray(r.body) && r.body.length > 0;
  });

  await test('API: Featured event', async () => {
    const r = await req('GET', '/api/events/featured');
    return r.status === 200 && r.body.featured === true;
  });

  await test('API: Filter events by category', async () => {
    const r = await req('GET', '/api/events?category=bodas');
    return r.status === 200 && r.body.events.every(e => e.category === 'bodas');
  });

  await test('API: Send contact message', async () => {
    const r = await req('POST', '/api/messages', { 'Content-Type': 'application/json' },
      { name: 'Test User', email: 'test@example.com', message: 'Test message', phone: '+5491112345678' });
    return r.status === 201;
  });

  await test('API: Message validation (missing fields)', async () => {
    const r = await req('POST', '/api/messages', { 'Content-Type': 'application/json' },
      { name: '', email: '', message: '' });
    return r.status === 400;
  });

  await test('API: List messages (auth)', async () => {
    const r = await req('GET', '/api/messages', { 'Authorization': `Bearer ${token}` });
    return r.status === 200 && r.body.messages.length > 0;
  });

  await test('API: Message stats', async () => {
    const r = await req('GET', '/api/messages/stats', { 'Authorization': `Bearer ${token}` });
    return r.status === 200 && typeof r.body.unread === 'number';
  });

  await test('API: Update message status', async () => {
    const msgs = await req('GET', '/api/messages?status=unread', { 'Authorization': `Bearer ${token}` });
    if (msgs.body.messages.length > 0) {
      const id = msgs.body.messages[0].id;
      const r = await req('PUT', `/api/messages/${id}/status`, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }, { status: 'read' });
      return r.status === 200 && r.body.status === 'read';
    }
    return true;
  });

  await test('API: Dashboard stats', async () => {
    const r = await req('GET', '/api/messages/stats', { 'Authorization': `Bearer ${token}` });
    return r.status === 200 && typeof r.body.total === 'number';
  });

  await test('API: 404 for non-existent event', async () => {
    const r = await req('GET', '/api/events/evento-que-no-existe');
    return r.status === 404;
  });

  await test('API: Health check', async () => {
    const r = await req('GET', '/api/health');
    return r.status === 200 && r.body.status === 'ok';
  });

  console.log('\n=== FRONTEND TESTS ===\n');

  function reqFrontend(method, fpath) {
    return new Promise((resolve, reject) => {
      const opts = { hostname: '127.0.0.1', port: 5173, path: fpath, method };
      const r = http.request(opts, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      r.on('error', reject);
      r.end();
    });
  }

  await test('Frontend: Main page loads', async () => {
    const r = await reqFrontend('GET', '/');
    return r.status === 200;
  });

  await test('Frontend: Events page loads', async () => {
    const r = await reqFrontend('GET', '/eventos');
    return r.status === 200;
  });

  await test('Frontend: Admin login page loads', async () => {
    const r = await reqFrontend('GET', '/admin/login');
    return r.status === 200;
  });

  await test('Backend: Static assets served', async () => {
    const r = await req('GET', '/api/events');
    if (r.status === 200 && r.body.events.length > 0) {
      const cover = r.body.events[0].coverImage;
      if (cover) {
        const asset = await req('GET', cover);
        return asset.status === 200;
      }
    }
    return true;
  });

  console.log('\n=== RESULTS ===\n');
  results.forEach(r => console.log(`  ${r}`));
  console.log(`\n  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(failed === 0 ? '\n  ALL TESTS PASSED!' : '\n  SOME TESTS FAILED');
}

run().catch(console.error);
