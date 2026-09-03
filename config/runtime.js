'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv(rootDir) {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

function createRuntimeConfig(rootDir) {
  loadEnv(rootDir);

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && (!process.env.MASTER_KEY || process.env.MASTER_KEY.length < 32)) {
    throw new Error('MASTER_KEY es obligatoria en producción y debe tener al menos 32 caracteres.');
  }

  const dataDir = path.resolve(process.env.DATA_DIR || rootDir);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(dataDir, 'uploads'));
  const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(dataDir, 'backups'));
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(backupDir, { recursive: true });

  return {
    isProduction,
    masterKey: process.env.MASTER_KEY || crypto.randomBytes(24).toString('hex'),
    baseUrl: process.env.BASE_URL || '',
    dataDir,
    uploadDir,
    backupDir,
    sessionCookie(maxAge) {
      return { maxAge, httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' };
    }
  };
}

module.exports = { createRuntimeConfig, loadEnv };
