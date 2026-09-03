'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

test('sirve landing, catálogo y producto usando MariaDB', { skip: process.env.MARIADB_TEST !== '1', timeout: 60000 }, async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nessik-app-'));
  const env = {
    ...process.env,
    DATA_DIR: tempDir,
    SQLITE_SOURCE: path.join(tempDir, 'data.db'),
    SEED_DEMO: 'false',
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_NAME: process.env.DB_NAME || 'nessik_catalogo_test',
    DB_USER: process.env.DB_USER || 'nessik_test',
    DB_PASSWORD: process.env.DB_PASSWORD || 'nessik_test_password'
  };
  Object.assign(process.env, env);

  const sqlite = require('../db');
  const business = sqlite.prepare("INSERT INTO businesses (slug, name, whatsapp, description, plan) VALUES (?, ?, ?, ?, ?)")
    .run('ferreteria-prueba', 'Ferretería Prueba', '528710000000', 'Catálogo de prueba', 'pro');
  const category = sqlite.prepare('INSERT INTO categories (business_id, name, sort) VALUES (?, ?, ?)')
    .run(business.lastInsertRowid, 'Herramientas', 1);
  const product = sqlite.prepare('INSERT INTO products (business_id, category_id, name, price, description, active) VALUES (?, ?, ?, ?, ?, 1)')
    .run(business.lastInsertRowid, category.lastInsertRowid, 'Martillo profesional', 199, 'Mango reforzado');
  sqlite.close();

  const migration = spawnSync(process.execPath, ['scripts/migrate-sqlite-to-mariadb.js', '--force'], {
    cwd: path.resolve(__dirname, '..'), env, encoding: 'utf8'
  });
  assert.equal(migration.status, 0, migration.stderr);

  const { app } = require('../server');
  const db = require('../database/mariadb');
  await db.prepare('INSERT INTO sessions (token, biz_id, kind, expires_at) VALUES (?, ?, ?, ?)')
    .run('test-session', business.lastInsertRowid, 'owner', new Date(Date.now() + 3600000).toISOString());
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    for (const route of ['/health', '/', '/ferreteria-prueba', `/ferreteria-prueba/p/${product.lastInsertRowid}`]) {
      const response = await fetch(base + route, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, `${route}: ${await response.text()}`);
    }
    const catalog = await (await fetch(base + '/ferreteria-prueba', { signal: AbortSignal.timeout(10000) })).text();
    assert.match(catalog, /Martillo profesional/);

    for (const route of ['/ferreteria-prueba/admin/panel', '/ferreteria-prueba/admin/productos']) {
      const response = await fetch(base + route, { headers: { cookie: 'sid=test-session' }, signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, `${route}: ${await response.text()}`);
    }

    const orderResponse = await fetch(base + '/api/pedir', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        nombre: 'Cliente Prueba', telefono: '8710000000',
        items: [{ store: 'ferreteria-prueba', id: product.lastInsertRowid, qty: 2 }]
      })
    });
    const orderText = await orderResponse.text();
    assert.equal(orderResponse.status, 200, orderText);
    const payload = JSON.parse(orderText);
    assert.equal(payload.orders.length, 1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM orders WHERE business_id = ?').get(business.lastInsertRowid)).total, 1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM customers WHERE business_id = ?').get(business.lastInsertRowid)).total, 1);
  } finally {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
