'use strict';

const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

function diskUploader(uploadDir, options) {
  const allowedExtensions = options.extensions;
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = allowedExtensions.includes(ext) ? ext : options.fallbackExtension;
      cb(null, options.prefix + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt);
    }
  });

  return multer({
    storage,
    limits: { fileSize: options.maxBytes },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mimeOk = !options.mimeTypes || options.mimeTypes.includes(file.mimetype);
      cb(null, allowedExtensions.includes(ext) && mimeOk);
    }
  });
}

function createUploaders(uploadDir) {
  const upload = diskUploader(uploadDir, {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fallbackExtension: '.png', prefix: '', maxBytes: 5 * 1024 * 1024
  });
  const uploadVideo = diskUploader(uploadDir, {
    extensions: ['.mp4', '.webm', '.mov', '.m4v', '.ogg'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg'],
    fallbackExtension: '.mp4', prefix: 'vid-', maxBytes: 100 * 1024 * 1024
  });
  const uploadFile = diskUploader(uploadDir, {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.txt', '.csv', '.json'],
    fallbackExtension: '.bin', prefix: 'file-', maxBytes: 50 * 1024 * 1024
  });
  const uploadExcel = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, ['.xlsx', '.csv'].includes(path.extname(file.originalname).toLowerCase()))
  });

  return { upload, uploadExcel, uploadVideo, uploadFile };
}

module.exports = { createUploaders };
