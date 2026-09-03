'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

test('copia datos, IDs y caracteres UTF-8 de SQLite a MariaDB', { skip: process.env.MARIADB_TEST !== '1' }, async () => {
  const Database = require('better-sqlite3');
  const mariadb = require('mariadb');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nessik-migration-'));
  const source = path.join(tempDir, 'source.db');
  const sqlite = new Database(source);
  sqlite.exec("CREATE TABLE businesses (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))");
  sqlite.prepare('INSERT INTO businesses (id, slug, name) VALUES (?, ?, ?)').run(7, 'ferreteria-demo', 'Ferretería El Toro');
  sqlite.close();

  const env = {
    ...process.env,
    SQLITE_SOURCE: source,
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_NAME: process.env.DB_NAME || 'nessik_catalogo_test',
    DB_USER: process.env.DB_USER || 'nessik_test',
    DB_PASSWORD: process.env.DB_PASSWORD || 'nessik_test_password'
  };
  const migration = spawnSync(process.execPath, ['scripts/migrate-sqlite-to-mariadb.js', '--force'], {
    cwd: path.resolve(__dirname, '..'), env, encoding: 'utf8'
  });

  try {
    assert.equal(migration.status, 0, migration.stderr);
    const connection = await mariadb.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD });
    const rows = await connection.query('SELECT id, slug, name FROM businesses');
    await connection.end();
    assert.deepEqual({ id: Number(rows[0].id), slug: rows[0].slug, name: rows[0].name }, { id: 7, slug: 'ferreteria-demo', name: 'Ferretería El Toro' });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
