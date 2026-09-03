'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

test('inicializa una base vacía con la estructura completa de pedidos', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nessik-db-'));
  const dbModule = path.resolve(__dirname, '..', 'db.js');
  const script = `
    const db = require(${JSON.stringify(dbModule)});
    const columns = db.prepare('PRAGMA table_info(orders)').all().map((column) => column.name);
    process.stdout.write(JSON.stringify(columns));
    db.close();
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    env: { ...process.env, DATA_DIR: dataDir, SEED_DEMO: 'false' },
    encoding: 'utf8'
  });

  try {
    assert.equal(result.status, 0, result.stderr);
    const columns = JSON.parse(result.stdout);
    assert.deepEqual(
      ['customer_phone', 'payment_method', 'amount_paid', 'amount_remaining'].filter((name) => !columns.includes(name)),
      []
    );
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
