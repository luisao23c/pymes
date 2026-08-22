const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function insideRounded(x, y, size, r) {
  const qx = Math.max(r, Math.min(x, size - r));
  const qy = Math.max(r, Math.min(y, size - r));
  const dx = x - qx, dy = y - qy;
  return dx * dx + dy * dy <= r * r;
}

function insideN(x, y, pad, nbox) {
  const nx = (x - pad) / nbox;
  const ny = (y - pad) / nbox;
  if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return false;
  if (nx >= 0.26 && nx <= 0.40 && ny >= 0.28 && ny <= 0.72) return true;
  if (nx >= 0.60 && nx <= 0.74 && ny >= 0.28 && ny <= 0.72) return true;
  if (nx >= 0.40 && nx <= 0.60) {
    const cy = 0.72 - ((nx - 0.40) / 0.20) * 0.44;
    if (Math.abs(ny - cy) < 0.07) return true;
  }
  return false;
}

function draw(size, { rounded, scale }) {
  const rgba = Buffer.alloc(size * size * 4);
  const radius = rounded ? size * 0.22 : 0;
  const nbox = size * scale;
  const pad = (size - nbox) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const inside = rounded ? insideRounded(x, y, size, radius) : true;
      if (!inside) { rgba[i + 3] = 0; continue; }
      const t = (x + y) / (2 * size);
      const r = Math.round(37 + (30 - 37) * t);
      const g = Math.round(99 + (64 - 99) * t);
      const b = Math.round(235 + (175 - 235) * t);
      if (insideN(x, y, pad, nbox)) {
        rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255; rgba[i + 3] = 255;
      } else {
        rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
      }
    }
  }
  return encodePNG(size, size, rgba);
}

const out = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(out, { recursive: true });

const icons = [
  { file: 'icon-192.png', size: 192, rounded: true, scale: 0.82 },
  { file: 'icon-512.png', size: 512, rounded: true, scale: 0.82 },
  { file: 'apple-touch-icon.png', size: 180, rounded: false, scale: 0.66 },
  { file: 'icon-maskable-512.png', size: 512, rounded: false, scale: 0.56 }
];

for (const ic of icons) {
  fs.writeFileSync(path.join(out, ic.file), draw(ic.size, ic));
  console.log('ok', ic.file);
}
