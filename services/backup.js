'use strict';

const fs = require('fs');
const path = require('path');

async function createBackup(db, backupDir) {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const destination = path.join(backupDir, `mariadb-${date}.json`);
    const tables = await db.query('SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME');
    const snapshot = { created_at: new Date().toISOString(), tables: {} };
    for (const table of tables) {
      const safeName = String(table.name).replace(/`/g, '``');
      snapshot.tables[table.name] = await db.query(`SELECT * FROM \`${safeName}\``);
    }
    fs.writeFileSync(destination, JSON.stringify(snapshot));
    console.log(`Backup creado: ${destination}`);
  } catch (error) {
    console.error('Error al crear backup:', error.message);
  }
}

function scheduleBackups(db, backupDir) {
  const first = setTimeout(() => { createBackup(db, backupDir); }, 5 * 60 * 1000);
  const daily = setInterval(() => { createBackup(db, backupDir); }, 24 * 60 * 60 * 1000);
  first.unref();
  daily.unref();
  return { first, daily };
}

module.exports = { createBackup, scheduleBackups };
