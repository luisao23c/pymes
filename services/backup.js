'use strict';

const fs = require('fs');
const path = require('path');

function createBackup(db, backupDir) {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const destination = path.join(backupDir, `data-${date}.db`);
    fs.copyFileSync(db.databasePath, destination);
    console.log(`Backup creado: ${destination}`);
  } catch (error) {
    console.error('Error al crear backup:', error.message);
  }
}

function scheduleBackups(db, backupDir) {
  const first = setTimeout(() => createBackup(db, backupDir), 5 * 60 * 1000);
  const daily = setInterval(() => createBackup(db, backupDir), 24 * 60 * 60 * 1000);
  first.unref();
  daily.unref();
  return { first, daily };
}

module.exports = { createBackup, scheduleBackups };
