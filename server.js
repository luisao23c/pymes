const express = require('express');
const db = require('./db');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const QRCode = require('qrcode');
const { TPL_THEMES, TPL_META, TPL_CASOS } = require('./templates-data');
const ShapeLib = require('./public/js/shape-lib.js');
const app = express();

// Carga variables de entorno desde .env (si existe), sin dependencias externas
try {
  const fsEnv = require('fs');
  const envPath = path.join(__dirname, '.env');
  if (fsEnv.existsSync(envPath)) {
    fsEnv.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
} catch (e) {}

const MASTER_KEY = process.env.MASTER_KEY || crypto.randomBytes(12).toString('hex');
const BASE_URL = process.env.BASE_URL || '';

// ================= PLANES (configurables desde el panel maestro) =================
function getPlan(biz) {
  const p = db.prepare('SELECT * FROM plans WHERE key = ?').get((biz && biz.plan) || 'free');
  return p || { key: 'free', name: 'Gratis', price: 0, days: 0, max_products: 3, ads: 1, design: 0 };
}
// Fondo avanzado de la página: hex simple o JSON {type,bg,bg2,bgAngle,bgImage,bgPattern,bgPatternC}
function pageBgCss(v) {
  if (!v) return '';
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return 'body{background:' + v + '!important}';
  let o = null;
  if (typeof v === 'string') { try { o = JSON.parse(v); } catch (e) {} }
  if (!o || typeof o !== 'object' || !o.type) return '';
  const h1 = /^#[0-9a-fA-F]{6}$/.test(o.bg || '') ? o.bg : '';
  const h2 = /^#[0-9a-fA-F]{6}$/.test(o.bg2 || '') ? o.bg2 : '';
  const ang = Number(o.bgAngle) || 135;
  let css = '';
  if (o.type === 'linear') css = (o.bg || o.bg2) ? 'linear-gradient(' + ang + 'deg,' + (h1 || '#ffffff') + ',' + (h2 || '#e2e8f0') + ')' : '';
  else if (o.type === 'radial') css = (o.bg || o.bg2) ? 'radial-gradient(circle at 50% 40%,' + (h1 || '#ffffff') + ',' + (h2 || '#e2e8f0') + ')' : '';
  else if (o.type === 'conic') css = (o.bg || o.bg2) ? 'conic-gradient(from 0deg at 50% 50%,' + (h1 || '#ffffff') + ',' + (h2 || '#e2e8f0') + ')' : '';
  else if (o.type === 'image') css = o.bgImage ? 'url(\'' + o.bgImage + '\') center/cover no-repeat' : (o.bg || '');
  else if (o.type === 'pattern') {
    const pat = o.bgPattern || 'rayas';
    const pc = /^#[0-9a-fA-F]{6}$/.test(o.bgPatternC || '') ? o.bgPatternC : (h2 || '#e2e8f0');
    if (pat === 'puntos') css = (o.bg || 'transparent') + ' radial-gradient(' + pc + ' 5px,transparent 6px) 0 0/26px 26px';
    else if (pat === 'cuadros') css = (o.bg || 'transparent') + ' repeating-conic-gradient(' + pc + ' 0% 25%,transparent 0% 50%) 0 0/32px 32px';
    else if (pat === 'horizontales') css = (o.bg || 'transparent') + ' repeating-linear-gradient(0deg,' + pc + ' 0 6px,transparent 6px 14px)';
    else css = (o.bg || 'transparent') + ' repeating-linear-gradient(45deg,' + pc + ' 0 8px,transparent 8px 18px)';
  } else css = o.bg || '';
  return css ? 'body{background:' + css + '!important}' : '';
}
function sanitizePageBg(v, hasOwn, prev) {
  if (!v) return hasOwn ? '' : prev;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  try { const o = JSON.parse(v); if (o && typeof o === 'object' && typeof o.type === 'string' && typeof o.bg === 'string') return v; } catch (e) {}
  return hasOwn ? '' : prev;
}
// Limpia la configuración de navegación (NAV_STYLE) preservando todos los campos que usa el renderizador
function cleanNav(n) {
  n = n || {};
  const hex = (v) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? v : '');
  const num = (v, min, max, dflt) => { const x = parseInt(v, 10); return isNaN(x) ? dflt : Math.max(min, Math.min(max, x)); };
  const str = (v, len) => String(v == null ? '' : v).slice(0, len || 30);
  const pick = (v, list, dflt) => (list.indexOf(v) > -1 ? v : dflt);
  const BG_TYPES = ['solid', 'linear', 'radial', 'conic', 'image', 'pattern'];
  const PATTERNS = ['rayas', 'horizontales', 'puntos', 'cuadros'];
  const SI_NO = ['si', 'no'];
  return {
    estilo: pick(n.estilo, ['pildoras', 'tabs', 'subrayado'], 'subrayado'),
    align: pick(n.align, ['left', 'center'], 'left'),
    direction: pick(n.direction, ['horizontal', 'vertical'], 'horizontal'),
    posicion: pick(n.posicion, ['arriba', 'abajo'], 'arriba'),
    bgType: pick(n.bgType, BG_TYPES, 'solid'),
    bg: hex(n.bg),
    bg2: hex(n.bg2),
    bgAngle: num(n.bgAngle, 0, 360, 135),
    bgImage: str(n.bgImage, 500),
    bgPattern: pick(n.bgPattern, PATTERNS, 'rayas'),
    bgPatternC: hex(n.bgPatternC),
    color: hex(n.color),
    text: hex(n.text),
    activeBg: hex(n.activeBg),
    activeText: hex(n.activeText),
    borderC: hex(n.borderC),
    actBorderC: hex(n.actBorderC),
    hovBg: hex(n.hovBg),
    hovText: hex(n.hovText),
    stickyBg: hex(n.stickyBg),
    radius: str(n.radius),
    shadow: str(n.shadow),
    stickyShadow: str(n.stickyShadow),
    hovUnder: str(n.hovUnder),
    hovScale: str(n.hovScale),
    uppercase: pick(n.uppercase, SI_NO, 'no'),
    stickyOn: pick(n.stickyOn, SI_NO, 'no'),
    stickyPos: pick(n.stickyPos, ['top', 'bottom'], 'top'),
    stickyOff: num(n.stickyOff, 0, 2000, 0),
    icons: pick(n.icons, SI_NO, 'si'),
    iconPos: pick(n.iconPos, ['left', 'top'], 'left'),
    mobile: pick(n.mobile, SI_NO, 'si'),
    breakpoint: num(n.breakpoint, 480, 1200, 768),
    actBorder: pick(n.actBorder, SI_NO, 'no'),
    actBorderW: num(n.actBorderW, 0, 10, 2),
    actBorderPos: pick(n.actBorderPos, ['bottom', 'top'], 'bottom'),
    gap: num(n.gap, 0, 40, 8),
    pad: num(n.pad, 0, 40, 10),
    size: num(n.size, 8, 40, 14),
    borderW: num(n.borderW, 0, 10, 0),
    opacity: num(n.opacity, 0, 100, 100)
  };
}
const PLAN_MAX = (biz) => {
  const p = getPlan(biz);
  return p.max_products === -1 ? Infinity : (p.max_products || 0);
};
// El plan decide si la tienda DEBE mostrar publicidad cruzada (los que la tienen en su plan, la ven)
function adsOn(biz) {
  return getPlan(biz).ads === 1;
}
// El plan decide si el dueño puede personalizar el diseño de su catálogo
function designAllowed(biz) {
  return getPlan(biz).design === 1;
}
// Tienda bloqueada por suspensión o plan vencido
function storeBlock(biz) {
  if (!biz) return { blocked: true, reason: 'suspended' };
  if (biz.suspended) return { blocked: true, reason: 'suspended' };
  const today = new Date().toISOString().slice(0, 10);
  if (biz.plan_ends_at && biz.plan_ends_at !== '' && biz.plan_ends_at < today) {
    return { blocked: true, reason: 'expired' };
  }
  return { blocked: false };
}

app.set('view engine', 'ejs');
app.locals.shapeLib = ShapeLib;
app.set('views', path.join(__dirname, 'views'));
// Serializa JSON de forma segura para incrustarlo en <script> (evita XSS con "</script>")
app.locals.safeJson = function (v) {
  return JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};
app.use(express.urlencoded({ extended: true, limit: '60mb' }));
app.use(express.json({ limit: '60mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const safeExt = allowed.includes(ext) ? ext : '.png';
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const okMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    cb(null, allowed.includes(ext) && okMime);
  }
});

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.xlsx', '.xls', '.csv'];
    cb(null, allowed.includes(ext));
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
    const safeExt = allowed.includes(ext) ? ext : '.mp4';
    cb(null, 'vid-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt);
  }
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
    const okMime = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg'].includes(file.mimetype);
    cb(null, allowed.includes(ext) && okMime);
  }
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.txt', '.csv', '.json'];
    const safeExt = allowed.includes(ext) ? ext : '.bin';
    cb(null, 'file-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt);
  }
});
const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.txt', '.csv', '.json'];
    cb(null, allowed.includes(ext));
  }
});

app.use((req, res, next) => {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  req.cookies = out;
  next();
});

// ================= CSRF (doble-envío de cookie + token oculto) =================
app.use((req, res, next) => {
  if (!req.cookies.csrf) {
    req.cookies.csrf = crypto.randomBytes(24).toString('hex');
    res.cookie('csrf', req.cookies.csrf, { httpOnly: false, sameSite: 'lax', path: '/' });
  }
  res.locals.csrf = req.cookies.csrf;
  next();
});
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const p = req.path;
  if (p === '/registrar' || p === '/maestro' || p === '/maestro/cerrar') return next();
  if (p.endsWith('/admin') || p.endsWith('/resetear-pin')) return next(); // logins / reseteo público
  if (!/^\/[^/]+\/admin(\/|$)/.test(p) && !/^\/maestro\//.test(p)) return next();
  // Multipart: el body aún no está parseado aquí; se valida en la ruta tras multer (ver verifyBodyCsrf)
  if (req.is('multipart/form-data')) return next();
  const t = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  if (!t || t !== req.cookies.csrf) {
    return res.status(403).send('Solicitud rechazada: token de seguridad inválido. Recarga la página e intenta de nuevo.');
  }
  next();
});

// Valida CSRF en peticiones multipart, una vez que multer ya parseó el body
function verifyBodyCsrf(req, res, next) {
  const t = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  if (!t || t !== req.cookies.csrf) {
    return res.status(403).send('Solicitud rechazada: token de seguridad inválido. Recarga la página e intenta de nuevo.');
  }
  next();
}

// ================= BACKUP AUTOMÁTICO DIARIO =================
const fs = require('fs');
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
function hacerBackup() {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const dest = path.join(backupsDir, `data-${date}.db`);
    fs.copyFileSync(path.join(__dirname, 'data.db'), dest);
    console.log(`Backup creado: ${dest}`);
  } catch (e) {
    console.error('Error al crear backup:', e.message);
  }
}
setTimeout(hacerBackup, 1000 * 60 * 5); // 5 min tras iniciar
setInterval(hacerBackup, 1000 * 60 * 60 * 24); // luego cada 24h

// ================= RATE LIMIT DE LOGIN (anti fuerza bruta) =================
const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?';
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { fails: 0, until: 0 };
  if (now < rec.until) {
    const mins = Math.ceil((rec.until - now) / 60000);
    return res.render('login', { biz: getBusiness(req.params.slug), error: `Demasiados intentos. Intenta en ${mins} min.` });
  }
  req._rl = { rec, ip, now };
  res.on('finish', () => {
    if (res.statusCode === 302) { loginAttempts.delete(req._rl.ip); return; } // login exitoso
    if (res.statusCode === 200) { // fallo (re-render del login)
      const r = loginAttempts.get(req._rl.ip) || { fails: 0, until: 0 };
      r.fails = (r.fails || 0) + 1;
      if (r.fails >= 8) { r.fails = 0; r.until = Date.now() + 15 * 60000; }
      loginAttempts.set(req._rl.ip, r);
    }
  });
  next();
}

app.post('/:slug/admin/upload', requireAuth, upload.single('foto'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// Subida de video desde el constructor (owner)
app.post('/:slug/admin/uploadvideo', requireAuth, uploadVideo.single('video'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Video no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// Subida de video desde el maestro
app.post('/maestro/:id/uploadvideo', maestroAuth, uploadVideo.single('video'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Video no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// Subida de logo/banner desde el editor de diseño del maestro
app.post('/maestro/:id/upload', maestroAuth, upload.single('foto'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// Subida de audio/archivos desde el constructor (owner)
app.post('/:slug/admin/uploadfile', requireAuth, uploadFile.single('archivo'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// Subida de audio/archivos desde el maestro
app.post('/maestro/:id/uploadfile', maestroAuth, uploadFile.single('archivo'), verifyBodyCsrf, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

const TEMPLATES = ['clasica', 'premium', 'juvenil', 'minimal', 'restaurante', 'portada', 'revista', 'barrio', 'galeria', 'ofertas', 'abarrotes', 'frutas', 'carniceria', 'panaderia', 'braza', 'cafeteria', 'fotografo', 'viaje', 'peluqueria', 'spa', 'dentista', 'veterinaria', 'eventos', 'limpieza', 'construccion', 'libre'];

function getTemplateTheme(tpl) {
  return TPL_THEMES[tpl] || null;
}

// Colores con degradado (c1 = inicio, c2 = fin)
const COLORS = [
  { id: 'azul', nombre: 'Azul', c1: '#2563eb', c2: '#0ea5e9' },
  { id: 'esmeralda', nombre: 'Esmeralda', c1: '#059669', c2: '#10b981' },
  { id: 'violeta', nombre: 'Violeta', c1: '#7c3aed', c2: '#a855f7' },
  { id: 'rosa', nombre: 'Rosa', c1: '#e11d48', c2: '#f43f5e' },
  { id: 'ambar', nombre: 'Ámbar', c1: '#d97706', c2: '#f59e0b' },
  { id: 'atardecer', nombre: 'Atardecer', c1: '#f59e0b', c2: '#ef4444' },
  { id: 'mar', nombre: 'Mar', c1: '#0ea5e9', c2: '#22d3ee' },
  { id: 'tropical', nombre: 'Tropical', c1: '#10b981', c2: '#14b8a6' },
  { id: 'neon', nombre: 'Neón', c1: '#22d3ee', c2: '#a855f7' },
  { id: 'dulce', nombre: 'Dulce', c1: '#ec4899', c2: '#8b5cf6' },
  { id: 'oro', nombre: 'Oro', c1: '#d4af37', c2: '#b45309' },
  { id: 'noche', nombre: 'Noche', c1: '#6366f1', c2: '#3b82f6' },
  { id: 'fuego', nombre: 'Fuego', c1: '#ef4444', c2: '#f97316' },
  { id: 'bosque', nombre: 'Bosque', c1: '#15803d', c2: '#65a30d' },
  { id: 'vino', nombre: 'Vino', c1: '#9f1239', c2: '#7c3aed' }
];

function getColor(id) {
  return COLORS.find(c => c.id === id) || COLORS[0];
}

const ESTILOS = [
  {
    id: 'moderno', nombre: 'Moderno', emoji: '🎯',
    font: "'Inter', sans-serif", fontLink: 'Inter:wght@400;500;600;700;800;900',
    bg: '#f1f5f9', text: '#0f172a', muted: '#64748b',
    card: '#ffffff', border: '#e2e8f0', radius: '16px',
    accent: '#2563eb', accent2: '#0ea5e9',
    header: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'elegancia', nombre: 'Elegancia', emoji: '💎',
    font: "'Playfair Display', 'Georgia', serif", fontLink: 'Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500',
    bg: '#0b0b0d', text: '#f5f0e8', muted: '#9b9386',
    card: '#15151a', border: '#26262e', radius: '14px',
    accent: '#d4af37', accent2: '#a16207',
    header: 'linear-gradient(160deg, #101014, #1c1c24)',
    headerText: '#f5f0e8', dark: true
  },
  {
    id: 'cafe', nombre: 'Café', emoji: '☕',
    font: "'Poppins', sans-serif", fontLink: 'Poppins:wght@400;500;600;700;800',
    bg: '#f7f1e5', text: '#3d2c1c', muted: '#8a7358',
    card: '#fffdf8', border: '#eadfc8', radius: '20px',
    accent: '#a16207', accent2: '#b45309',
    header: 'linear-gradient(135deg, #4a3222, #6b4a30)',
    headerText: '#fdf6e9', dark: false
  },
  {
    id: 'viaje', nombre: 'Aventura / Viajes', emoji: '✈️',
    font: "'Quicksand', sans-serif", fontLink: 'Quicksand:wght@400;500;600;700',
    bg: '#eef6f6', text: '#0e2b33', muted: '#5c7a80',
    card: '#ffffff', border: '#cfe5e5', radius: '18px',
    accent: '#0891b2', accent2: '#0d9488',
    header: 'linear-gradient(135deg, #065f73, #0d9488)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'fresco', nombre: 'Fresco', emoji: '🎨',
    font: "'Poppins', sans-serif", fontLink: 'Poppins:wght@400;500;600;700;800',
    bg: '#fdf2f8', text: '#4a044e', muted: '#a21caf',
    card: '#ffffff', border: '#f0abfc', radius: '22px',
    accent: '#c026d3', accent2: '#7c3aed',
    header: 'linear-gradient(120deg, #d946ef, #7c3aed)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'lujo', nombre: 'Lujo', emoji: '🖤',
    font: "'Cormorant Garamond', 'Georgia', serif", fontLink: 'Cormorant+Garamond:wght@500;600;700&family=Inter:wght@300;400',
    bg: '#050505', text: '#e8e6e1', muted: '#6f6d68',
    card: '#101010', border: '#1f1f1f', radius: '10px',
    accent: '#c9a24b', accent2: '#8a6d3b',
    header: 'radial-gradient(ellipse at top, #1a1a1a, #050505)',
    headerText: '#e8e6e1', dark: true
  },
  {
    id: 'boho', nombre: 'Boho / Natural', emoji: '🌿',
    font: "'Lora', 'Georgia', serif", fontLink: 'Lora:wght@400;500;600;700&family=Inter:wght@400;500',
    bg: '#f5f0e8', text: '#3f3a33', muted: '#8a8070',
    card: '#fbf7ef', border: '#e5dac4', radius: '12px',
    accent: '#7f5539', accent2: '#a47551',
    header: 'linear-gradient(160deg, #7f5539, #a47551)',
    headerText: '#fbf7ef', dark: false
  },
  {
    id: 'tech', nombre: 'Tech / Gaming', emoji: '⚡',
    font: "'Space Grotesk', sans-serif", fontLink: 'Space+Grotesk:wght@400;500;600;700',
    bg: '#0a0f1e', text: '#e2e8f0', muted: '#64748b',
    card: '#111a30', border: '#1e2a47', radius: '16px',
    accent: '#22d3ee', accent2: '#a855f7',
    header: 'linear-gradient(135deg, #0a0f1e, #1e2a47)',
    headerText: '#e2e8f0', dark: true
  },
  {
    id: 'playa', nombre: 'Playa / Verano', emoji: '🏖️',
    font: "'Poppins', sans-serif", fontLink: 'Poppins:wght@400;500;600;700',
    bg: '#f0f9ff', text: '#0c4a6e', muted: '#38bdf8',
    card: '#ffffff', border: '#bae6fd', radius: '20px',
    accent: '#0ea5e9', accent2: '#22d3ee',
    header: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'dulce', nombre: 'Dulce / Pastel', emoji: '🍬',
    font: "'Poppins', sans-serif", fontLink: 'Poppins:wght@400;500;600;700;800',
    bg: '#fdf4ff', text: '#701a75', muted: '#c026d3',
    card: '#ffffff', border: '#f5d0fe', radius: '24px',
    accent: '#d946ef', accent2: '#ec4899',
    header: 'linear-gradient(120deg, #d946ef, #ec4899)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'retro', nombre: 'Retro', emoji: '📻',
    font: "'Caveat', cursive", fontLink: 'Caveat:wght@500;600;700&family=Inter:wght@400;500',
    bg: '#fdf6e3', text: '#57493a', muted: '#a08c6e',
    card: '#fffdf5', border: '#eadfc0', radius: '14px',
    accent: '#e8590c', accent2: '#f59f00',
    header: 'linear-gradient(135deg, #e8590c, #f59f00)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'nocturno', nombre: 'Nocturno', emoji: '🌙',
    font: "'Montserrat', sans-serif", fontLink: 'Montserrat:wght@400;500;600;700;800',
    bg: '#0f172a', text: '#e2e8f0', muted: '#64748b',
    card: '#1e293b', border: '#334155', radius: '16px',
    accent: '#6366f1', accent2: '#818cf8',
    header: 'linear-gradient(135deg, #1e293b, #0f172a)',
    headerText: '#e2e8f0', dark: true
  },
  {
    id: 'tropical', nombre: 'Tropical', emoji: '🌴',
    font: "'Quicksand', sans-serif", fontLink: 'Quicksand:wght@400;500;600;700',
    bg: '#ecfdf5', text: '#064e3b', muted: '#34d399',
    card: '#ffffff', border: '#a7f3d0', radius: '20px',
    accent: '#10b981', accent2: '#14b8a6',
    header: 'linear-gradient(135deg, #059669, #14b8a6)',
    headerText: '#ffffff', dark: false
  },
  {
    id: 'vintage', nombre: 'Vintage / Joyería', emoji: '💍',
    font: "'Cinzel', 'Georgia', serif", fontLink: 'Cinzel:wght@500;600;700&family=Inter:wght@300;400',
    bg: '#faf6ee', text: '#29221a', muted: '#8a7a63',
    card: '#fffdf8', border: '#e8ddc8', radius: '10px',
    accent: '#b45309', accent2: '#d4af37',
    header: 'linear-gradient(135deg, #3d2c1c, #7c5c3a)',
    headerText: '#f5efe0', dark: false
  }
];

function getEstilo(id) {
  return ESTILOS.find(e => e.id === id) || ESTILOS[0];
}

// Fuentes disponibles para el selector "Fuente" del panel de diseño
const FONTS = [
  { id: 'inter', nombre: 'Inter', css: "'Inter', sans-serif", link: 'Inter:wght@400;500;600;700;800' },
  { id: 'poppins', nombre: 'Poppins', css: "'Poppins', sans-serif", link: 'Poppins:wght@400;500;600;700;800' },
  { id: 'quicksand', nombre: 'Quicksand', css: "'Quicksand', sans-serif", link: 'Quicksand:wght@400;500;600;700' },
  { id: 'montserrat', nombre: 'Montserrat', css: "'Montserrat', sans-serif", link: 'Montserrat:wght@400;500;600;700;800' },
  { id: 'playfair', nombre: 'Playfair Display', css: "'Playfair Display', 'Georgia', serif", link: 'Playfair+Display:wght@500;600;700&family=Inter:wght@400;500' },
  { id: 'lora', nombre: 'Lora', css: "'Lora', 'Georgia', serif", link: 'Lora:wght@400;500;600;700&family=Inter:wght@400;500' },
  { id: 'spacegrotesk', nombre: 'Space Grotesk', css: "'Space Grotesk', sans-serif", link: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'caveat', nombre: 'Caveat', css: "'Caveat', cursive", link: 'Caveat:wght@500;600;700&family=Inter:wght@400;500' },
  { id: 'cinzel', nombre: 'Cinzel', css: "'Cinzel', 'Georgia', serif", link: 'Cinzel:wght@500;600;700&family=Inter:wght@300;400' },
  { id: 'cormorant', nombre: 'Cormorant Garamond', css: "'Cormorant Garamond', 'Georgia', serif", link: 'Cormorant+Garamond:wght@500;600;700&family=Inter:wght@300;400' }
];

// Estilo visual efectivo = preset elegido + ajustes finos del negocio (si hay)
function getEffectiveEstilo(biz) {
  const base = getEstilo(biz.estilo);
  const pick = (v, d) => (v && v.trim() ? v : d);
  const font = pick(biz.font, base.font);
  return {
    ...base,
    bg: pick(biz.bg, base.bg),
    card: pick(biz.card, base.card),
    text: pick(biz.text, base.text),
    muted: pick(biz.muted, base.muted),
    border: pick(biz.border, base.border),
    radius: pick(biz.radius, base.radius),
    header: pick(biz.header, base.header),
    headerText: pick(biz.header_text, base.headerText),
    headerSet: !!(biz.header && biz.header.trim()),
    font,
    fontLink: (FONTS.find(f => f.css === font) || {}).link || base.fontLink
  };
}

// Paleta efectiva del catálogo según el modo de color configurado
function getPalette(biz, estilo) {
  const mode = biz.color_mode || 'degradado';
  const e = estilo || getEstilo(biz.estilo);
  let accent = e.accent, accent2 = e.accent2;
  // Override directo de "Color de botones" (ajuste fino): gana sobre todo lo demás
  if (biz.accent && biz.accent.trim()) { accent = biz.accent.trim(); accent2 = (biz.accent2 && biz.accent2.trim()) ? biz.accent2.trim() : accent; }
  else if (mode === 'solido') { accent = biz.color_hex || e.accent; accent2 = accent; }
  else if (mode === 'degradado') { accent = biz.color_hex || e.accent; accent2 = biz.color_hex2 || accent; }
  return { accent, accent2, mode };
}

// Colores de acento que usa cada plantilla (para reemplazarlos por la paleta del negocio)
const TPL_ACCENTS = {
  portada: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  clasica: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  juvenil: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  barrio: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  galeria: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  premium: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  revista: { a: '#4f46e5', b: '#4338ca', chip: '#1a1a1a' },
  minimal: { a: '#1a1a1a', b: '#1a1a1a', chip: null },
  ofertas: { a: '#ef4444', b: '#dc2626', chip: '#1a1a1a' },
  restaurante: { a: '#ea580c', b: '#c2410c', chip: '#1a1a1a' }
};

function paintCatalog(html, biz, pal, estilo) {
  const t = TPL_ACCENTS[biz.template] || TPL_ACCENTS.portada;
  const e = estilo || getEstilo('moderno');
  const rep = (from, to) => { if (from && to && from.toLowerCase() !== to.toLowerCase()) html = html.replace(new RegExp(from.replace('#', '\\#'), 'gi'), to); };
  rep(t.a, pal.accent);
  rep(t.b, pal.accent2);
  rep(t.chip, pal.accent);
  // Acentos utilitarios de Tailwind para que la paleta se refleje también en textos
  // + superficies del estilo visual (fondo, tarjetas, chips, buscador, texto)
  const hdr = String(e.header || '').replace(/var\(--accent2\)/g, pal.accent2).replace(/var\(--accent\)/g, pal.accent);
  const styleOverride =
    '<style>' +
    // Acentos de texto utilitarios para que la paleta se refleje en toda la tienda
    '.text-indigo-500,.text-indigo-600,.text-indigo-700,.text-indigo-400,.text-indigo-300{color:' + pal.accent + '!important}' +
    '.text-red-500,.text-red-600,.text-red-400{color:' + pal.accent + '!important}' +
    '.text-orange-600,.text-orange-400{color:' + pal.accent + '!important}' +
    '.chip-active{background:' + pal.accent + '!important;border-color:' + pal.accent + '!important;color:#fff!important}' +
    '.btn-primary,.btn-primary:hover,.btn-primary:active,.btn-order,.btn-order:hover,.btn-order:active,.btn-add,.btn-add:hover,.btn-add:active{background:' + pal.accent + '!important}' +
    '.badge-offer{background:' + pal.accent + '!important}' +
    '.search-input:focus{border-color:' + pal.accent + '!important;box-shadow:0 0 0 4px ' + pal.accent + '26!important}' +
    'body{font-family:' + (e.font || "'Inter', sans-serif") + ' !important;background:' + e.bg + '!important;color:' + e.text + '!important}' +
    pageBgCss(biz.page_bg) +
    '.product-card,.glass-card{background:' + e.card + '!important;border-color:' + e.border + '!important;border-radius:' + e.radius + '!important}' +
    '.chip-idle{background:' + e.card + '!important;border-color:' + e.border + '!important;color:' + e.text + '!important}' +
    '.search-input{background:' + e.card + '!important;border-color:' + e.border + '!important}' +
    '.footer-muted{color:' + e.muted + '!important}' +
    // Cabecera (arriba): fondo del estilo, título en el color de la cabecera
    '.header-gradient{background:' + hdr + '!important}' +
    '.cat-title{color:' + e.headerText + '!important}' +
    '.header-gradient .hero-content{color:' + e.headerText + '!important}' +
    '.header-gradient .btn-primary,.header-gradient .btn-wa,.header-gradient .btn-order,.header-gradient .btn-add{color:#fff!important}' +
    (e.headerSet ? '.header-gradient.hero-banner::after,.header-gradient.hero-restaurant::after{background:' + hdr + '!important}' : '') +
    // ===== Sistema de diseño moderno (consistente entre plantillas) =====
    '.product-card,.glass-card,.menu-item,.offer-card,.product-row,.product-hero{border-radius:16px!important;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)!important;transition:transform .2s ease,box-shadow .2s ease!important}' +
    '.product-card:hover,.glass-card:hover,.menu-item:hover,.offer-card:hover,.product-row:hover{transform:translateY(-4px)!important;box-shadow:0 14px 34px rgba(0,0,0,.12)!important}' +
    '.product-card,.glass-card,.offer-card,.product-hero{display:flex!important;flex-direction:column!important;height:100%!important}' +
    '.product-card h3,.glass-card h3,.offer-card h3,.product-hero h3{font-weight:700!important;line-height:1.3!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;min-height:2.6em}' +
    '.btn-primary,.btn-add,.btn-order,.btn-wa{border-radius:11px!important;font-weight:600!important}' +
    '.badge-offer{border-radius:999px!important;padding:.22rem .6rem!important;font-weight:800!important}' +
    '.line-through{color:#9ca3af!important;font-size:.75em!important;font-weight:500!important}' +
    '.header-gradient{box-shadow:0 1px 0 rgba(0,0,0,.04)!important}' +
    // ===== Reglas de UX: toque mínimo, foco accesible, jerarquía, micro-interacciones =====
    '.btn-primary,.btn-add,.btn-order,.btn-wa{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:40px!important}' +
    '@media(max-width:640px){.btn-primary,.btn-add,.btn-order,.btn-wa{min-height:44px!important}}' +
    'button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid ' + pal.accent + '!important;outline-offset:2px!important}' +
    '.product-card h3,.glass-card h3,.offer-card h3,.product-hero h3{font-size:15px!important}' +
    'a,button,img{transition:opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .15s ease,color .15s ease!important}' +
    'button:active{transform:scale(.97)!important}' +
    '.cat-chip,.search-input{border-radius:10px!important}' +
    // ===== Móvil: badges y botones que no se pisen ni se salgan =====
    '@media(max-width:640px){' +
      '.badge-offer{font-size:.55rem!important;padding:.12rem .45rem!important;line-height:1.25!important;max-width:calc(50% - 8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.product-card .absolute.top-2.left-2,.product-card .absolute.top-3.left-2,.offer-card .absolute.top-2.left-2,.product-ad-badge{font-size:.55rem!important;padding:.12rem .45rem!important;line-height:1.25!important;max-width:calc(50% - 8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.product-card .badge-offer{top:.4rem!important;right:.4rem!important}' +
    '}' +
    '.pv-mascara{position:relative;overflow:hidden;min-height:80px;}' +
    '.pv-mascara .mascara-inner{position:relative;width:100%;height:100%;padding:0;}' +
    '.pv-mascara .mascara-inner .blk{width:100%;height:100%;min-width:0;box-sizing:border-box;margin:0;padding:0;}' +
    '.pv-mascara .mascara-child{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;}' +
    '.pv-mascara .mascara-child *{box-sizing:border-box;}' +
    '.pv-mascara .mascara-child img{width:100%!important;height:100%!important;object-fit:cover!important;margin:0!important;padding:0!important;display:block;}' +
    '.pv-mascara .mascara-child a,.pv-mascara .mascara-child button{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;margin:0!important;border-radius:0!important;text-decoration:none;}' +
    '.pv-mascara .mascara-child p,.pv-mascara .mascara-child h2,.pv-mascara .mascara-child h3{margin:0!important;padding:0!important;width:100%;height:100%;text-align:center!important;display:flex!important;align-items:center!important;justify-content:center!important;}' +
    '.pv-mascara .mascara-child input,.pv-mascara .mascara-child textarea{width:100%!important;height:100%!important;margin:0!important;padding:0 8px!important;border:none!important;background:transparent!important;box-sizing:border-box;}' +
    '.pv-mascara .mascara-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:22px 10px;text-align:center;color:#b39c82;font-size:12px;}' +
    '</style>';
  // Metadatos PWA + viewport nativo (instalable como app)
  html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />');
  const bizName = String(biz.name || 'Catálogo').replace(/"/g, '&quot;');
  const pwaHead =
    '<meta name="theme-color" content="' + pal.accent + '">' +
    '<meta name="mobile-web-app-capable" content="yes">' +
    '<meta name="apple-mobile-web-app-capable" content="yes">' +
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
    '<meta name="apple-mobile-web-app-title" content="' + bizName + '">' +
    '<link rel="manifest" href="/' + biz.slug + '/manifest.webmanifest">' +
    '<link rel="icon" type="image/png" href="/icons/icon-192.png">' +
    '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">';
  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, pwaHead + '</head>');
  else html += pwaHead;

  // Carga la fuente del estilo si no está ya en el HTML
  if (e.fontLink) {
    const fontLink = '<link href="https://fonts.googleapis.com/css2?family=' + e.fontLink + '&display=swap" rel="stylesheet">';
    if (!html.includes(fontLink)) {
      if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, fontLink + '</head>');
      else html += fontLink;
    }
  }
  const pwaTail =
    '<script src="/pwa.js"></script>' +
    '<style>' +
    'html{-webkit-tap-highlight-color:transparent}' +
    'body{overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}' +
    'html.is-standalone{padding-top:env(safe-area-inset-top)}' +
    'html.is-standalone body{padding-bottom:env(safe-area-inset-bottom)}' +
    'a,button,img{-webkit-touch-callout:none}' +
    '</style>';
  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, styleOverride + pwaTail + '</body>');
  else html += styleOverride + pwaTail;

  // Secciones: ocultar las desactivadas, reordenar las de nivel superior, modo de categorías y densidad
  const sec = sectionsOf(biz);
  const secHide = (!sec.hero ? '[data-sec="hero"]{display:none!important}' : '') +
                  (sec.categorias === false ? '[data-sec="categorias"]{display:none!important}' : '');
  const densityCss = sec.density === 'compacta' ? '.prod-grid{gap:.5rem!important}'
    : sec.density === 'espaciosa' ? '.prod-grid{gap:2rem!important}'
    : '';
  const CARDS = '.product-card,.glass-card,.menu-item,.offer-card,.product-row';
  const shadowCss = sec.shadow === 'none' ? CARDS + '{box-shadow:none!important}'
    : sec.shadow === 'suave' ? CARDS + '{box-shadow:0 1px 3px rgba(0,0,0,.06)!important}'
    : sec.shadow === 'fuerte' ? CARDS + '{box-shadow:0 12px 32px rgba(0,0,0,.16)!important}'
    : '';
  const hoverCss = sec.hover === 'none' ? CARDS + ':hover{transform:none!important;box-shadow:inherit!important}' + CARDS + ' img{transition:none!important}'
    : sec.hover === 'scale' ? CARDS + ':hover{transform:scale(1.02)!important}'
    : sec.hover === 'zoom' ? CARDS + ' img{transition:transform .35s ease!important}' + CARDS + ':hover img{transform:scale(1.08)!important}'
    : sec.hover === 'glow' ? CARDS + '{transition:box-shadow .25s ease!important}' + CARDS + ':hover{box-shadow:0 0 0 3px ' + pal.accent + '40,0 12px 32px rgba(0,0,0,.12)!important}'
    : CARDS + '{transition:transform .2s ease,box-shadow .2s ease!important}' + CARDS + ':hover{transform:translateY(-4px)!important;box-shadow:0 12px 32px rgba(0,0,0,.12)!important}';
  const catTopCss = sec.catmode === 'top'
    ? '.catalog-sidebar{width:100%!important;margin-bottom:1rem!important}' +
      '.catalog-sidebar>div{position:static!important;max-height:none!important;overflow:visible!important}' +
      '.catalog-sidebar .catalog-cats{flex-direction:row!important;overflow-x:auto!important}' +
      '.catalog-sidebar [id="variant-filters"]{display:none!important}' +
      '.catalog-sidebar .relative.mb-4{max-width:32rem}'
    : '';
  const heroCompactCss = sec.hero_mode === 'compacto'
    ? '.hero-banner,.hero-restaurant{padding:1.25rem 1rem!important;min-height:0!important}' +
      '.hero-banner>img,.hero-restaurant>img{display:none!important}' +
      '.hero-content h1,.hero-banner h1,.hero-restaurant h1{font-size:1.5rem!important}' +
      '.hero-content p{display:none!important}' +
      '.hero-content .btn-wa{padding:.45rem 1rem!important;font-size:.78rem!important}'
    : '';
  const catTopJs = sec.catmode === 'top'
    ? ';try{var a=document.querySelector(".catalog-sidebar");var m=document.querySelector("main[data-sec=contenido]");if(a&&m&&a.parentNode!==m){m.insertBefore(a,m.firstChild);}}catch(e){}'
    : '';
  const secInj =
    ((secHide || densityCss || catTopCss || heroCompactCss || shadowCss || hoverCss) ? '<style>' + secHide + densityCss + catTopCss + heroCompactCss + shadowCss + hoverCss + '</style>' : '') +
    '<script>window.__SEC_ORDEN__=' + JSON.stringify(sec.orden) + ';' +
    '(function(){try{var o=window.__SEC_ORDEN__||[];var b=document.body;var map={};' +
    '[].slice.call(b.children).forEach(function(n){var s=n.getAttribute&&n.getAttribute("data-sec");if(s){map[s]=n;}});' +
    'o.forEach(function(id){if(map[id])b.appendChild(map[id]);});}catch(e){}})' +
    catTopJs + '</script>';
  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, secInj + '</body>');
  else html += secInj;
  return html;
}

// Acabado ligero para las plantillas del constructor: no re-pinta componentes (la plantilla
// ya trae su CSS). Solo añade viewport nativo, PWA y asegura la fuente del tema.
function paintTheme(html, biz, pal, theme) {
  html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />');
  const bizName = String(biz.name || 'Catálogo').replace(/"/g, '&quot;');
  const pwaHead =
    '<meta name="theme-color" content="' + (theme.accent || pal.accent) + '">' +
    '<meta name="mobile-web-app-capable" content="yes">' +
    '<meta name="apple-mobile-web-app-capable" content="yes">' +
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
    '<meta name="apple-mobile-web-app-title" content="' + bizName + '">' +
    '<link rel="manifest" href="/' + biz.slug + '/manifest.webmanifest">' +
    '<link rel="icon" type="image/png" href="/icons/icon-192.png">' +
    '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">' +
    '<style>' + pageBgCss(biz.page_bg) + '</style>';
  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, pwaHead + '</head>');
  else html += pwaHead;
  const pwaTail =
    '<script src="/pwa.js"></script>' +
    '<style>html{-webkit-tap-highlight-color:transparent}body{overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}html.is-standalone{padding-top:env(safe-area-inset-top)}html.is-standalone body{padding-bottom:env(safe-area-inset-bottom)}a,button,img{-webkit-touch-callout:none}</style>';
  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, pwaTail + '</body>');
  else html += pwaTail;
  return html;
}

// Acabado del catálogo: si la tienda usa una plantilla del constructor, respeta su tema;
// si no, aplica el pintado clásico por paleta.
function finishCatalog(html, biz, pal, estilo) {
  try {
    const theme = getTemplateTheme(biz.template);
    if (theme) return paintTheme(html, biz, pal, theme);
    return paintCatalog(html, biz, pal, estilo);
  } catch (e) {
    console.error('finishCatalog error:', e.stack || e);
    return '<html><body>Error: ' + e.message + '</body></html>';
  }
}

const GIROS = [
  'abarrotes', 'frutas y verduras', 'carniceria', 'papeleria', 'ferreteria',
  'electronica', 'ropa', 'calzado', 'farmacia', 'belleza', 'restaurante',
  'taqueria', 'cafeteria', 'panaderia', 'tortilleria', 'floreria', 'mascotas',
  'deportes', 'jugueteria', 'electrodomesticos', 'muebles', 'viajes', 'fotografia', 'otros'
];

// Presets por giro: al registrarse, la tienda recibe plantilla y estilo acordes a su negocio.
const GIRO_TEMPLATE = {
  cafeteria: 'restaurante', restaurante: 'restaurante', taqueria: 'restaurante', panaderia: 'restaurante', tortilleria: 'restaurante',
  ropa: 'galeria', calzado: 'galeria', belleza: 'galeria', floreria: 'galeria', mascotas: 'galeria',
  electronica: 'premium', electrodomesticos: 'premium', muebles: 'premium', deportes: 'premium', viajes: 'viaje', fotografia: 'fotografo',
  abarrotes: 'minimal', 'frutas y verduras': 'minimal', carniceria: 'minimal', farmacia: 'minimal',
  papeleria: 'clasica', ferreteria: 'clasica', jugueteria: 'juvenil'
};
const GIRO_STYLE = {
  cafeteria: 'cafe', restaurante: 'cafe', taqueria: 'cafe', panaderia: 'cafe', tortilleria: 'cafe',
  ropa: 'moderno', calzado: 'moderno', belleza: 'dulce', floreria: 'boho', mascotas: 'moderno',
  electronica: 'tech', electrodomesticos: 'tech', deportes: 'fresco', viajes: 'viaje', fotografia: 'lujo',
  muebles: 'elegancia', jugueteria: 'dulce', farmacia: 'moderno',
  abarrotes: 'moderno', 'frutas y verduras': 'boho', carniceria: 'moderno',
  papeleria: 'moderno', ferreteria: 'moderno'
};

// Contenido de ejemplo por giro (para que la tienda nueva no se vea vacía)
const GIRO_DEMO = {
  cafeteria: {
    cats: ['Bebidas calientes', 'Bebidas frías', 'Postres'],
    prods: [
      ['Café americano', 45, 1], ['Capuchino', 60, 1], ['Latte vainilla', 65, 1], ['Mocha', 68, 1],
      ['Frappé caramelo', 70, 2], ['Limonada de fresa', 55, 2],
      ['Brownie de chocolate', 55, 3], ['Cheesecake', 75, 3]
    ]
  },
  restaurante: {
    cats: ['Entradas', 'Platos fuertes', 'Bebidas'],
    prods: [
      ['Guacamole', 65, 1], ['Nachos', 85, 1],
      ['Enchiladas verdes', 120, 2], ['Tacos de pastor', 95, 2], ['Pozole', 110, 2],
      ['Agua de horchata', 30, 3], ['Limonada', 25, 3]
    ]
  },
  viajes: {
    cats: ['Tours', 'Experiencias', 'Paquetes'],
    prods: [
      ['Tour histórico', 450, 1], ['Tour de playa', 550, 1],
      ['Clase de cocina local', 700, 2], ['Aventura en tirolesa', 800, 2],
      ['Paquete fin de semana', 2500, 3], ['Paquete luna de miel', 6000, 3]
    ]
  },
  ropa: {
    cats: ['Hombre', 'Mujer', 'Accesorios'],
    prods: [
      ['Camisa casual', 350, 1], ['Jeans slim', 550, 1],
      ['Vestido floral', 450, 2], ['Blusa', 300, 2],
      ['Reloj', 800, 3], ['Bolso', 600, 3]
    ]
  },
  ferreteria: {
    cats: ['Herramientas', 'Pintura', 'Plomería'],
    prods: [
      ['Martillo 16oz', 189, 1], ['Desarmador set', 249, 1],
      ['Pintura vinílica 19L', 899, 2], ['Brocha 3"', 69, 2],
      ['Tubo PVC 6m', 149, 3], ['Llave de paso', 119, 3]
    ]
  }
};
const GIRO_DEMO_DEFAULT = {
  cats: ['Productos', 'Novedades', 'Destacados'],
  prods: [
    ['Producto ejemplo 1', 199, 1], ['Producto ejemplo 2', 149, 1],
    ['Producto ejemplo 3', 299, 2], ['Producto ejemplo 4', 99, 2],
    ['Producto ejemplo 5', 249, 3], ['Producto ejemplo 6', 349, 3]
  ]
};

// Catálogo de ejemplo para la vista previa (usa el contenido editado, o el del giro, o el genérico)
function demoCatalog(biz, demoOverride) {
  let d = null;
  try { d = JSON.parse(demoOverride || biz.demo || ''); } catch (e) {}
  if (d && Array.isArray(d.products) && d.products.length) {
    const catIdx = {};
    let c = 1;
    const products = d.products.map((p, i) => {
      const cat = (p.cat || 'General').toString();
      if (!catIdx[cat]) { catIdx[cat] = c++; }
      return { id: i + 1, category_id: catIdx[cat], name: p.name, price: parseFloat(p.price) || 0, old_price: null, category_name: cat, description: '', image: 'https://picsum.photos/seed/demo-' + biz.id + '-' + i + '/500', galeria: '[]', variants: '', featured: i === 0 ? 1 : 0, promo_badge: '', tags: '' };
    });
    const categories = Object.keys(catIdx).map((name) => ({ id: catIdx[name], name, sort: catIdx[name] }));
    return { categories, products, name: d.name || biz.name, description: d.description || biz.description };
  }
  const gd = GIRO_DEMO[biz.giro] || GIRO_DEMO_DEFAULT;
  const categories = gd.cats.map((name, i) => ({ id: i + 1, name, sort: i + 1 }));
  const products = gd.prods.map((p, i) => ({ id: i + 1, category_id: p[2], name: p[0], price: p[1], old_price: null, category_name: gd.cats[p[2] - 1], description: '', image: 'https://picsum.photos/seed/demo-' + biz.id + '-' + i + '/500', galeria: '[]', variants: '', featured: i === 0 ? 1 : 0, promo_badge: '', tags: '' }));
  return { categories, products, name: biz.name, description: biz.description };
}

// ================= PRESETS DE DISEÑO POR GIRO (Modo fácil) =================
const PAG_BASE = [
  { slug: 'sobre-nosotros', title: 'Sobre nosotros', type: 'sobre', icon: '🏠' },
  { slug: 'galeria', title: 'Galería', type: 'galeria', icon: '📷' },
  { slug: 'contacto', title: 'Contacto', type: 'contacto', icon: '📞' }
];
const PAG_MENU = [
  { slug: 'menu', title: 'Menú', type: 'menu', icon: '🍽️' },
  { slug: 'sobre-nosotros', title: 'Sobre nosotros', type: 'sobre', icon: '🏠' },
  { slug: 'contacto', title: 'Contacto', type: 'contacto', icon: '📞' }
];
const PAG_BLOG = [
  { slug: 'blog', title: 'Novedades', type: 'blog', icon: '📰' },
  { slug: 'galeria', title: 'Galería', type: 'galeria', icon: '📷' },
  { slug: 'contacto', title: 'Contacto', type: 'contacto', icon: '📞' }
];
const PAG_SERVICIOS = [
  { slug: 'servicios', title: 'Servicios', type: 'servicios', icon: '🧾' },
  { slug: 'galeria', title: 'Galería', type: 'galeria', icon: '📷' },
  { slug: 'contacto', title: 'Contacto', type: 'contacto', icon: '📞' }
];

const GIRO_PRESETS = [
  { id: 'ferreteria', nombre: 'Ferretería', emoji: '🔧', descripcion: 'Herramientas y material', template: 'clasica', estilo: 'moderno', color: 'azul', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'abarrotes', nombre: 'Abarrotes', emoji: '🛒', descripcion: 'Tiendita de la esquina', template: 'minimal', estilo: 'moderno', color: 'esmeralda', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'frutas', nombre: 'Frutas y verduras', emoji: '🍎', descripcion: 'Fresco y natural', template: 'ofertas', estilo: 'boho', color: 'bosque', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'carniceria', nombre: 'Carnicería', emoji: '🥩', descripcion: 'Cortes y carnes', template: 'clasica', estilo: 'moderno', color: 'fuego', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'papeleria', nombre: 'Papelería', emoji: '✏️', descripcion: 'Útiles y oficina', template: 'clasica', estilo: 'moderno', color: 'azul', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'electronica', nombre: 'Electrónica', emoji: '📱', descripcion: 'Gadgets y tecnología', template: 'premium', estilo: 'tech', color: 'neon', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'ropa', nombre: 'Ropa / Boutique', emoji: '👗', descripcion: 'Moda y tendencias', template: 'galeria', estilo: 'moderno', color: 'rosa', color_mode: 'degradado', grid_cols: 2, font: '', radius: '20px', paginas_sugeridas: PAG_BASE },
  { id: 'calzado', nombre: 'Calzado', emoji: '👟', descripcion: 'Zapatos y tenis', template: 'galeria', estilo: 'moderno', color: 'violeta', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'farmacia', nombre: 'Farmacia', emoji: '💊', descripcion: 'Salud y medicinas', template: 'minimal', estilo: 'moderno', color: 'mar', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'belleza', nombre: 'Belleza / Salón', emoji: '💅', descripcion: 'Estética y cuidado', template: 'galeria', estilo: 'dulce', color: 'dulce', color_mode: 'degradado', grid_cols: 3, font: '', radius: '20px', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'restaurante', nombre: 'Restaurante', emoji: '🍽️', descripcion: 'Comida y platillos', template: 'restaurante', estilo: 'cafe', color: 'ambar', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_MENU },
  { id: 'taqueria', nombre: 'Taquería', emoji: '🌮', descripcion: 'Tacos y antojitos', template: 'restaurante', estilo: 'cafe', color: 'fuego', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_MENU },
  { id: 'cafeteria', nombre: 'Cafetería', emoji: '☕', descripcion: 'Café y postres', template: 'restaurante', estilo: 'cafe', color: 'ambar', color_mode: 'degradado', grid_cols: 3, font: '', radius: '20px', paginas_sugeridas: PAG_MENU },
  { id: 'panaderia', nombre: 'Panadería', emoji: '🥐', descripcion: 'Pan y repostería', template: 'ofertas', estilo: 'cafe', color: 'oro', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'tortilleria', nombre: 'Tortillería', emoji: '🌽', descripcion: 'Tortillas y masa', template: 'minimal', estilo: 'moderno', color: 'ambar', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'floreria', nombre: 'Florería', emoji: '💐', descripcion: 'Flores y arreglos', template: 'galeria', estilo: 'boho', color: 'rosa', color_mode: 'degradado', grid_cols: 2, font: '', radius: '20px', paginas_sugeridas: PAG_BASE },
  { id: 'mascotas', nombre: 'Mascotas', emoji: '🐾', descripcion: 'Alimento y accesorios', template: 'clasica', estilo: 'fresco', color: 'esmeralda', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'deportes', nombre: 'Deportes', emoji: '⚽', descripcion: 'Equipamiento y ropa', template: 'premium', estilo: 'fresco', color: 'esmeralda', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'jugueteria', nombre: 'Juguetería', emoji: '🧸', descripcion: 'Juguetes y diversión', template: 'juvenil', estilo: 'dulce', color: 'dulce', color_mode: 'degradado', grid_cols: 3, font: '', radius: '24px', paginas_sugeridas: PAG_BASE },
  { id: 'electrodomesticos', nombre: 'Electrodomésticos', emoji: '🧊', descripcion: 'Línea blanca', template: 'premium', estilo: 'tech', color: 'noche', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'muebles', nombre: 'Muebles', emoji: '🛋️', descripcion: 'Hogar y decoración', template: 'premium', estilo: 'elegancia', color: 'oro', color_mode: 'degradado', grid_cols: 2, font: '', radius: '12px', paginas_sugeridas: PAG_BASE },
  { id: 'viajes', nombre: 'Viajes', emoji: '✈️', descripcion: 'Agencia y tours', template: 'viaje', estilo: 'viaje', color: 'mar', color_mode: 'degradado', grid_cols: 2, font: '', radius: '18px', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'fotografia', nombre: 'Fotografía', emoji: '📷', descripcion: 'Sesiones y portafolio', template: 'fotografo', estilo: 'lujo', color: 'noche', color_mode: 'solido', grid_cols: 2, font: '', radius: '8px', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'eventos', nombre: 'Eventos', emoji: '🎉', descripcion: 'Fiestas y banquetes', template: 'portada', estilo: 'lujo', color: 'vino', color_mode: 'degradado', grid_cols: 2, font: '', radius: '12px', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'taller', nombre: 'Taller / Mecánica', emoji: '🔩', descripcion: 'Reparaciones y refacciones', template: 'clasica', estilo: 'tech', color: 'noche', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'joyeria', nombre: 'Joyería', emoji: '💍', descripcion: 'Joyas y relojes', template: 'premium', estilo: 'vintage', color: 'oro', color_mode: 'degradado', grid_cols: 2, font: '', radius: '8px', paginas_sugeridas: PAG_BASE },
  { id: 'optica', nombre: 'Óptica', emoji: '👓', descripcion: 'Lentes y exámenes', template: 'minimal', estilo: 'moderno', color: 'azul', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'barberia', nombre: 'Barbería', emoji: '💈', descripcion: 'Cortes y afeitado', template: 'barrio', estilo: 'retro', color: 'noche', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'gimnasio', nombre: 'Gimnasio', emoji: '💪', descripcion: 'Fitness y membresías', template: 'premium', estilo: 'fresco', color: 'esmeralda', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_SERVICIOS },
  { id: 'hogar', nombre: 'Hogar y limpieza', emoji: '🧺', descripcion: 'Productos para casa', template: 'ofertas', estilo: 'moderno', color: 'mar', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE },
  { id: 'libreria', nombre: 'Librería', emoji: '📚', descripcion: 'Libros y lectura', template: 'revista', estilo: 'vintage', color: 'ambar', color_mode: 'solido', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BLOG },
  { id: 'vinos', nombre: 'Vinos / Licores', emoji: '🍷', descripcion: 'Bodega y catas', template: 'premium', estilo: 'elegancia', color: 'vino', color_mode: 'degradado', grid_cols: 2, font: '', radius: '8px', paginas_sugeridas: PAG_BASE },
  { id: 'grande', nombre: 'Grande y simple', emoji: '🔍', descripcion: 'Letra grande y fácil de usar', template: 'minimal', estilo: 'moderno', color: 'azul', color_mode: 'solido', grid_cols: 2, font: "'Inter', sans-serif", radius: '24px', paginas_sugeridas: PAG_BASE },
  { id: 'otros', nombre: 'Otro negocio', emoji: '🏪', descripcion: 'Sin giro específico', template: 'clasica', estilo: 'moderno', color: 'azul', color_mode: 'degradado', grid_cols: 3, font: '', radius: '', paginas_sugeridas: PAG_BASE }
];

// ================= DIVISAS (ISO 4217) =================
const CURRENCIES = [
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'USD', symbol: 'US$', name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'ARS', symbol: 'AR$', name: 'Peso argentino' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'CAD', symbol: 'CA$', name: 'Dólar canadiense' },
  { code: 'CLP', symbol: 'CLP$', name: 'Peso chileno' },
  { code: 'CNY', symbol: 'CN¥', name: 'Yuan chino' },
  { code: 'COP', symbol: 'COL$', name: 'Peso colombiano' },
  { code: 'CRC', symbol: '₡', name: 'Colón costarricense' },
  { code: 'CUP', symbol: '₱', name: 'Peso cubano' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso dominicano' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal guatemalteco' },
  { code: 'HNL', symbol: 'L', name: 'Lempira hondureño' },
  { code: 'INR', symbol: '₹', name: 'Rupia india' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonés' },
  { code: 'KRW', symbol: '₩', name: 'Won surcoreano' },
  { code: 'NIO', symbol: 'C$', name: 'Córdoba nicaragüense' },
  { code: 'PAB', symbol: 'B/.', name: 'Balboa panameño' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'PYG', symbol: '₲', name: 'Guaraní paraguayo' },
  { code: 'RUB', symbol: '₽', name: 'Rublo ruso' },
  { code: 'SVC', symbol: '₡', name: 'Colón salvadoreño' },
  { code: 'UYU', symbol: '$U', name: 'Peso uruguayo' },
  { code: 'VES', symbol: 'Bs.S', name: 'Bolívar venezolano' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco suizo' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar australiano' }
];
const CURRENCY_MAP = {};
CURRENCIES.forEach(c => { CURRENCY_MAP[c.code] = c; });

// Formatea un monto con el símbolo de la moneda de la tienda.
function moneyFor(biz) {
  const cur = CURRENCY_MAP[biz.currency] || CURRENCY_MAP.MXN;
  return (n) => cur.symbol + (Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}
function currencyInfo(code) {
  return CURRENCY_MAP[code] || CURRENCY_MAP.MXN;
}

// Secciones del catálogo: qué se muestra, en qué orden, modo de categorías, densidad, sombra y animación
const DEFAULT_SECTIONS = { hero_mode: 'destacado', catmode: 'left', density: 'normal', shadow: 'media', hover: 'lift', orden: ['hero', 'contenido'] };
function sectionsOf(biz) {
  const def = { hero_mode: 'destacado', hero: true, categorias: true, catmode: 'left', density: 'normal', shadow: 'media', hover: 'lift', orden: ['hero', 'contenido'] };
  try {
    const s = JSON.parse(biz.sections || '');
    const hero_mode = ['destacado', 'compacto', 'oculto'].includes(s.hero_mode) ? s.hero_mode : 'destacado';
    return {
      hero_mode,
      hero: hero_mode !== 'oculto' && s.hero !== false,
      categorias: s.categorias !== false,
      catmode: s.catmode === 'top' ? 'top' : 'left',
      density: ['compacta', 'normal', 'espaciosa'].includes(s.density) ? s.density : 'normal',
      shadow: ['none', 'suave', 'media', 'fuerte'].includes(s.shadow) ? s.shadow : 'media',
      hover: ['none', 'scale', 'lift', 'zoom', 'glow'].includes(s.hover) ? s.hover : 'lift',
      orden: Array.isArray(s.orden) ? s.orden : ['hero', 'contenido']
    };
  } catch (e) {
    return def;
  }
}

const GIROS_COMPLEMENTARIOS = {
  abarrotes: ['frutas y verduras', 'carniceria', 'panaderia', 'tortilleria'],
  'frutas y verduras': ['abarrotes', 'carniceria', 'restaurante'],
  carniceria: ['abarrotes', 'frutas y verduras', 'restaurante'],
  papeleria: ['abarrotes', 'electronica'],
  ferreteria: ['abarrotes', 'electronica', 'mascotas'],
  electronica: ['papeleria', 'ferreteria', 'abarrotes'],
  ropa: ['calzado', 'belleza'],
  calzado: ['ropa', 'belleza'],
  farmacia: ['abarrotes'],
  belleza: ['ropa', 'calzado'],
  restaurante: ['abarrotes', 'frutas y verduras', 'carniceria'],
  taqueria: ['abarrotes', 'frutas y verduras'],
  panaderia: ['abarrotes'],
  tortilleria: ['abarrotes', 'carniceria'],
  floreria: ['abarrotes'],
  mascotas: ['abarrotes', 'ferreteria'],
  deportes: ['jugueteria'],
  jugueteria: ['deportes'],
  electrodomesticos: ['electronica', 'ferreteria'],
  muebles: ['electronica', 'ropa']
};

function getGiroComplementario(giro) {
  return GIROS_COMPLEMENTARIOS[giro] || [];
}

function pickSponsored(biz, limit) {
  // Publicidad cruzada: solo entran tiendas que el administrador marcó como "anuncio"
  const complementarios = getGiroComplementario(biz.giro);
  const stores = db.prepare(
    `SELECT id, slug, name, giro, color_hex, logo, whatsapp, wa_message FROM businesses
     WHERE id != ? AND active = 1 AND ads_enabled = 1 AND giro != ''
       AND suspended = 0 AND (plan_ends_at = '' OR plan_ends_at >= date('now'))`
  ).all(biz.id);

  // Mezcla aleatoria pero con prioridad a giros complementarios
  const shuffled = stores
    .map(s => ({ s, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.s);

  const puntuados = shuffled.map(s => {
    let score = 0;
    if (complementarios.includes(s.giro)) score = 3;
    else if (s.giro === biz.giro) score = 1;
    else score = 2;
    return { s, score };
  }).sort((a, b) => b.score - a.score);

  const resultado = [];
  const usadas = new Set();
  for (const { s } of puntuados) {
    const prod = db.prepare(
      `SELECT id, name, price, old_price, image FROM products
       WHERE business_id = ? AND active = 1 ORDER BY RANDOM() LIMIT 1`
    ).get(s.id);
    if (prod && !usadas.has(s.id)) {
      usadas.add(s.id);
      resultado.push({ ...prod, store: s });
    }
    if (resultado.length >= limit) break;
  }
  return resultado;
}

function getBusiness(slug) {
  return db.prepare('SELECT * FROM businesses WHERE slug = ?').get(slug);
}

// Si la promo tiene fecha de vencimiento y ya pasó, la promo deja de mostrarse.
function withPromo(p) {
  if (p && p.old_price) {
    const today = new Date().toISOString().slice(0, 10);
    if (p.promo_ends_at && p.promo_ends_at !== '' && p.promo_ends_at < today) {
      p.old_price = null;
      p.promo_ends_at = '';
    } else if (p.promo_ends_at && p.promo_ends_at !== '') {
      p.promo_days = Math.max(0, Math.ceil((new Date(p.promo_ends_at + 'T23:59:59') - Date.now()) / 86400000));
    }
  }
  // Etiqueta de promoción para mostrar en la tienda
  const t = (p.promo_type || '').trim();
  if (t === 'porcentaje' && Number(p.promo_value) > 0) p.promo_badge = '-' + Math.round(Number(p.promo_value)) + '%';
  else if (t === '2x1') p.promo_badge = '2x1';
  else if (t === '3x2') p.promo_badge = '3x2';
  else if (t === 'regalo') p.promo_badge = '🎁 Regalo';
  else if (p.old_price) p.promo_badge = '🔥 Rebajado';
  else p.promo_badge = '';
  return p;
}

function getCatalog(businessId) {
  const categories = db.prepare(
    'SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC'
  ).all(businessId);
  const catCounts = {};
  db.prepare('SELECT category_id, COUNT(*) AS c FROM products WHERE business_id = ? AND active = 1 GROUP BY category_id').all(businessId).forEach(r => { catCounts[r.category_id] = r.c; });
  categories.forEach(c => { c.count = catCounts[c.id] || 0; });
  const products = db.prepare(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.business_id = ? AND p.active = 1
     ORDER BY p.featured DESC, p.sort ASC, p.created_at DESC`
  ).all(businessId).map(withPromo).map(p => { p.imgs = productImgs(p); p.shortDesc = (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 110); return p; });
  const pages = db.prepare(
    'SELECT id, slug, title, icon, sort FROM pages WHERE business_id = ? AND active = 1 ORDER BY sort ASC, id ASC'
  ).all(businessId);
  return { categories, products, pages };
}

// Pila de componentes que arma la página. Si la tienda no tiene bloques guardados,
// se genera una pila por defecto según la plantilla para no romper nada existente.
function parseComponents(biz) {
  try { const a = JSON.parse((biz && biz.blocks) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function defaultComponents(biz) {
  const t = (biz && biz.template) || 'clasica';
  const full = { id: 'c-' + t + '-productos', type: 'productos', title: '', count: 0, category_id: 0, layout: 'grid', cols: Number((biz && biz.grid_cols) || 3), mostrarFiltros: 'no' };
  if (t === 'galeria') full.layout = 'galeria';
  if (t === 'minimal' || t === 'restaurante') full.layout = 'lista';
  const blocks = [full];
  return [{ id: 'pg-inicio', title: 'Inicio', icon: '🏠', blocks }];
}
function getComponents(biz) {
  const c = parseComponents(biz);
  return c.length ? c : defaultComponents(biz);
}

function waLink(biz, text) {
  const num = biz.whatsapp.startsWith('52') ? biz.whatsapp : '52' + biz.whatsapp;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

// Arma el mensaje del pedido. Si la tienda configuró uno personalizado, usa sus
// comodines {tienda}, {productos} y {total}; si no, el mensaje por defecto.
function buildOrderMessage(storeName, lines, total, template, sym) {
  const lista = lines.join('\n');
  const cur = sym || '$';
  const totalStr = cur + total.toFixed(2);
  const custom = (template && String(template).trim()) ? String(template).trim() : '';
  if (custom) {
    return custom
      .replace(/\{tienda\}/g, storeName)
      .replace(/\{productos\}/g, lista)
      .replace(/\{total\}/g, totalStr);
  }
  return `Hola ${storeName}! 👋 Quiero pedir:\n\n${lista}\n\nTotal: ${totalStr}\n\n¿Me confirmas disponibilidad y envío?`;
}

function track(businessId, type, detail) {
  db.prepare('INSERT INTO tracking (business_id, type, detail) VALUES (?, ?, ?)').run(businessId, type, detail || '');
}

function getStats(businessId) {
  const today = db.prepare("SELECT COUNT(*) AS c FROM tracking WHERE business_id = ? AND type = 'visit' AND date(created_at) = date('now')").get(businessId).c;
  const week = db.prepare("SELECT COUNT(*) AS c FROM tracking WHERE business_id = ? AND type = 'visit' AND created_at >= datetime('now', '-7 days')").get(businessId).c;
  const prevWeek = db.prepare("SELECT COUNT(*) AS c FROM tracking WHERE business_id = ? AND type = 'visit' AND created_at >= datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')").get(businessId).c;
  const total = db.prepare("SELECT COUNT(*) AS c FROM tracking WHERE business_id = ? AND type = 'visit'").get(businessId).c;
  const waClicks = db.prepare("SELECT COUNT(*) AS c FROM tracking WHERE business_id = ? AND type = 'wa'").get(businessId).c;
  const orders = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE business_id = ?").get(businessId).c;
  const paid = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE business_id = ? AND paid = 1").get(businessId).c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE business_id = ?").get(businessId).s;
  const revenueWeek = db.prepare("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE business_id = ? AND created_at >= datetime('now', '-7 days')").get(businessId).s;
  const prevRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE business_id = ? AND created_at >= datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')").get(businessId).s;
  const topProducts = db.prepare(
    `SELECT detail AS name, COUNT(*) AS c FROM tracking
     WHERE business_id = ? AND type = 'view'
     GROUP BY detail ORDER BY c DESC LIMIT 5`
  ).all(businessId);
  const topWaProducts = db.prepare(
    `SELECT detail AS name, COUNT(*) AS c FROM tracking
     WHERE business_id = ? AND type = 'wa_product'
     GROUP BY detail ORDER BY c DESC LIMIT 5`
  ).all(businessId);
  const daily = db.prepare(
    `SELECT date(created_at) AS d, COUNT(*) AS c FROM tracking
     WHERE business_id = ? AND type = 'visit' AND created_at >= datetime('now', '-7 days')
     GROUP BY date(created_at) ORDER BY d`
  ).all(businessId);
  const ordersDaily = db.prepare(
    `SELECT date(created_at) AS d, COUNT(*) AS c, SUM(total) AS s FROM orders
     WHERE business_id = ? AND created_at >= datetime('now', '-7 days')
     GROUP BY date(created_at) ORDER BY d`
  ).all(businessId);
  const conv = total > 0 ? ((orders / total) * 100).toFixed(1) : 0;
  const clickRate = total > 0 ? ((waClicks / total) * 100).toFixed(1) : 0;
  const orderRate = waClicks > 0 ? ((orders / waClicks) * 100).toFixed(1) : 0;
  const pct = (cur, prev) => prev > 0 ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0);
  const avgOrder = orders > 0 ? (revenue / orders) : 0;
  // Productos más vendidos (contando apariciones en los pedidos)
  const topSellers = {};
  db.prepare('SELECT items FROM orders WHERE business_id = ?').all(businessId).forEach(o => {
    String(o.items || '').split(/[\n|]/).forEach(line => {
      const m = line.match(/x\s+(.+?)\s*=\s*[^]*?$/);
      if (m) { const nm = m[1].trim(); if (nm) topSellers[nm] = (topSellers[nm] || 0) + 1; }
    });
  });
  const topSellersArr = Object.keys(topSellers).map(n => ({ name: n, c: topSellers[n] })).sort((a, b) => b.c - a.c).slice(0, 6);
  return {
    today, week, prevWeek, total, waClicks, orders, paid, revenue, revenueWeek, prevRevenue, avgOrder,
    weekDelta: pct(week, prevWeek), revenueDelta: pct(revenueWeek, prevRevenue),
    topProducts, topWaProducts, topSellers: topSellersArr, daily, ordersDaily, conv, clickRate, orderRate
  };
}

// ================= LANDING =================
app.get('/', (req, res) => {
  const stores = db.prepare('SELECT * FROM businesses WHERE active = 1 ORDER BY created_at DESC LIMIT 12').all();
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('landing', { stores, TEMPLATES, COLORS });
});

// ================= REGISTRO DE TIENDA =================
app.get('/registrar', (req, res) => {
  res.render('register', { TEMPLATES, COLORS, GIROS, ESTILOS, error: null, ok: null });
});

app.post('/registrar', (req, res) => {
  const { name, slug, whatsapp, description, pin, template, color, giro, estilo } = req.body;
  const cleanSlug = (slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!name || !cleanSlug || !whatsapp) {
    return res.render('register', { TEMPLATES, COLORS, GIROS, ESTILOS, error: 'Nombre, enlace y WhatsApp son obligatorios.', ok: null });
  }
  if (getBusiness(cleanSlug)) {
    return res.render('register', { TEMPLATES, COLORS, GIROS, ESTILOS, error: 'Ese enlace ya existe. Elige otro.', ok: null });
  }
  const cleanPin = (pin || '').trim();
  if (!/^\d{6,12}$/.test(cleanPin)) {
    return res.render('register', { TEMPLATES, COLORS, GIROS, ESTILOS, error: 'El PIN debe tener de 6 a 12 dígitos.', ok: null });
  }
  const colorObj = getColor(color);
  const giroOk = GIROS.includes(giro) ? giro : '';
  const tpl = TEMPLATES.includes(template) ? template : (GIRO_TEMPLATE[giroOk] || 'clasica');
  const estSel = ESTILOS.some(e => e.id === estilo) ? estilo : (GIRO_STYLE[giroOk] || 'moderno');
  const r = db.prepare(
    `INSERT INTO businesses (slug, name, whatsapp, description, pin, pin_hash, template, color, color_hex, color_hex2, giro, estilo, color_mode)
     VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'estilo')`
  ).run(
    cleanSlug,
    name.trim(),
    whatsapp.trim().replace(/[^0-9]/g, ''),
    description || '',
    hashPin(cleanPin),
    tpl,
    colorObj.id,
    colorObj.c1,
    colorObj.c2,
    giroOk,
    estSel
  );
  res.render('register', { TEMPLATES, COLORS, GIROS, ESTILOS, error: null, ok: cleanSlug });
});

// ================= PANEL MAESTRO =================
app.get('/maestro', (req, res) => {
  const s = findSession(req.cookies && req.cookies.sid);
  if (s && s.kind === 'maestro') return res.redirect('/maestro/panel');
  res.render('maestro', { error: null, list: null });
});

app.post('/maestro', (req, res) => {
  if (req.body.master === MASTER_KEY) {
    const token = createSession(null, 'maestro');
    res.cookie('sid', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', path: '/' });
    return res.redirect('/maestro/panel');
  }
  res.render('maestro', { error: 'Código maestro incorrecto.', list: null });
});

function maestroAuth(req, res, next) {
  const s = findSession(req.cookies && req.cookies.sid);
  if (!(s && s.kind === 'maestro')) return res.redirect('/maestro');
  next();
}

app.get('/maestro/panel', maestroAuth, (req, res) => {
  const stores = db.prepare(
    `SELECT b.*,
       (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) AS products_count,
       (SELECT COUNT(*) FROM orders o WHERE o.business_id = b.id) AS orders_count,
       (SELECT COUNT(*) FROM tracking t WHERE t.business_id = b.id AND t.type = 'visit') AS visits_count,
       p2.name AS plan_name, p2.max_products AS plan_max, p2.price AS plan_price, p2.ads AS plan_ads
     FROM businesses b
     LEFT JOIN plans p2 ON p2.key = b.plan
     ORDER BY b.created_at DESC`
  ).all().map(s => {
    const today = new Date().toISOString().slice(0, 10);
    s.expired = s.plan_ends_at && s.plan_ends_at !== '' && s.plan_ends_at < today ? 1 : 0;
    s.plan_name = s.plan_name || s.plan || 'free';
    s.plan_price = s.plan_price === null || s.plan_price === undefined ? 0 : s.plan_price;
    return s;
  });
  const plans = db.prepare('SELECT * FROM plans ORDER BY active DESC, id ASC').all();
  const planUsage = {};
  stores.forEach(s => { planUsage[s.plan] = (planUsage[s.plan] || 0) + 1; });
  res.render('maestro', { error: null, list: stores, plans, planUsage, GIROS });
});

app.post('/maestro/:id/toggle', maestroAuth, (req, res) => {
  db.prepare('UPDATE businesses SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Tienda activada/desactivada'));
});

app.post('/maestro/:id/plan', maestroAuth, (req, res) => {
  const plan = db.prepare('SELECT key FROM plans WHERE key = ? AND active = 1').get(req.body.plan);
  if (plan) {
    db.prepare('UPDATE businesses SET plan = ? WHERE id = ?').run(plan.key, req.params.id);
    res.redirect('/maestro/panel?ok=' + encodeURIComponent('Plan actualizado'));
  } else {
    res.redirect('/maestro/panel');
  }
});

// Precio y fecha de vencimiento del plan de una tienda
app.post('/maestro/:id/vencimiento', maestroAuth, (req, res) => {
  const price = parseFloat(req.body.plan_price);
  const ends = /^\d{4}-\d{2}-\d{2}$/.test((req.body.plan_ends_at || '').trim()) ? req.body.plan_ends_at.trim() : '';
  db.prepare('UPDATE businesses SET plan_price = ?, plan_ends_at = ? WHERE id = ?').run(isNaN(price) ? 0 : price, ends, req.params.id);
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Precio y vencimiento guardados'));
});

app.post('/maestro/:id/suspender', maestroAuth, (req, res) => {
  db.prepare('UPDATE businesses SET suspended = 1 WHERE id = ?').run(req.params.id);
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Tienda suspendida'));
});

app.post('/maestro/:id/reactivar', maestroAuth, (req, res) => {
  db.prepare('UPDATE businesses SET suspended = 0 WHERE id = ?').run(req.params.id);
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Tienda reactivada'));
});

// Anuncio: esta tienda se muestra como publicidad en otros catálogos
app.post('/maestro/:id/ads', maestroAuth, (req, res) => {
  db.prepare('UPDATE businesses SET ads_enabled = CASE WHEN ads_enabled = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Publicidad actualizada'));
});

// ================= CREACIÓN DE PLANES (maestro) =================
app.post('/maestro/plan', maestroAuth, (req, res) => {
  const { name, price, days, max_products } = req.body;
  const cleanName = (name || '').trim();
  if (!cleanName) return res.redirect('/maestro/panel');
  const key = 'p' + Date.now();
  db.prepare(
    'INSERT INTO plans (key, name, price, days, max_products, ads, design, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
  ).run(
    key,
    cleanName,
    Math.max(0, parseFloat(price) || 0),
    Math.max(0, parseInt(days) || 0),
    parseInt(max_products) === -1 ? -1 : Math.max(0, parseInt(max_products) || 0),
    req.body.ads === 'on' ? 1 : 0,
    req.body.design === 'on' ? 1 : 0
  );
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Plan creado'));
});

app.post('/maestro/plan/:id/eliminar', maestroAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (p && p.key !== 'free' && p.key !== 'pro') {
    const used = db.prepare('SELECT COUNT(*) AS c FROM businesses WHERE plan = ?').get(p.key).c;
    if (used === 0) {
      db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);
    }
  }
  res.redirect('/maestro/panel?ok=' + encodeURIComponent('Plan eliminado'));
});

app.post('/maestro/cerrar', (req, res) => {
  deleteSession(req.cookies && req.cookies.sid);
  res.clearCookie('sid', { path: '/' });
  res.redirect('/maestro');
});

// ================= CATÁLOGO PÚBLICO =================
app.get('/:slug', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz || !biz.active) return res.status(404).render('404', { message: 'Tienda no encontrada o desactivada' });
  const block = storeBlock(biz);
  if (block.blocked) {
    return res.status(403).render('store-off', { biz, reason: block.reason });
  }
  const { categories, products, pages } = getCatalog(biz.id);
  track(biz.id, 'visit', '');

  let productsFinal = products;
  if (adsOn(biz) && products.length > 0) {
    const sponsored = pickSponsored(biz, 6);
    if (sponsored.length) {
      productsFinal = [];
      let idx = 0;
      let spIdx = 0;
      products.forEach((p) => {
        productsFinal.push(p);
        idx++;
        if (idx % 5 === 0 && spIdx < sponsored.length) {
          productsFinal.push({ isAd: true, ad: sponsored[spIdx] });
          spIdx++;
        }
      });
      while (spIdx < sponsored.length) {
        productsFinal.push({ isAd: true, ad: sponsored[spIdx] });
        spIdx++;
      }
    }
  }

  const estilo = getEffectiveEstilo(biz);
  const pal = getPalette(biz, estilo);
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.locals.money = moneyFor(biz);
  res.locals.currencySymbol = currencyInfo(biz.currency).symbol;
  res.locals.currencyCode = biz.currency;
  app.render('catalog', { biz, categories, products: productsFinal, estilo, theme: getTemplateTheme(biz.template), components: getComponents(biz), pages, seoUrl: BASE_URL ? BASE_URL + '/' + biz.slug : '', money: moneyFor(biz), currencySymbol: currencyInfo(biz.currency).symbol, currencyCode: biz.currency }, (err, html) => {
    if (err) return res.status(500).send('Error al generar el catálogo.');
    res.send(finishCatalog(html, biz, pal, estilo));
  });
});

// Página de un producto individual (para compartir y verlo solo)
app.get('/:slug/p/:id', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz || !biz.active) return res.status(404).render('404', { message: 'Tienda no encontrada o desactivada' });
  const block = storeBlock(biz);
  if (block.blocked) return res.status(403).render('store-off', { biz, reason: block.reason });
  const p = db.prepare(
    `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? AND p.business_id = ? AND p.active = 1`
  ).get(parseInt(req.params.id) || 0, biz.id);
  if (!p) {
    const page = db.prepare('SELECT * FROM pages WHERE business_id = ? AND slug = ? AND active = 1').get(biz.id, String(req.params.id));
    if (page) {
      const { categories, products, pages } = getCatalog(biz.id);
      const bizOv = { ...biz, blocks: page.blocks || '[]', name: biz.name + ' · ' + page.title };
      const estilo = getEffectiveEstilo(biz);
      const pal = getPalette(biz, estilo);
      track(biz.id, 'view', 'Página: ' + page.title);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      console.log('=== ROUTE HIT: Rendering catalog for:', bizOv.slug);
      console.log('bizOv.blocks:', bizOv.blocks ? 'present' : 'empty');
      app.render('catalog', { biz: bizOv, categories, products, estilo, theme: getTemplateTheme(biz.template), components: getComponents(bizOv), pages, seoUrl: BASE_URL ? BASE_URL + '/' + biz.slug : '', money: moneyFor(biz), currencySymbol: currencyInfo(biz.currency).symbol, currencyCode: biz.currency }, (err, html) => {
        if (err) { console.error('Template render error:', err.stack || err); return res.status(500).send('Error al generar la página: ' + err.message); }
        console.log('Template rendered, length:', html ? html.length : 0);
        console.log('Calling finishCatalog...');
        try {
          const result = finishCatalog(html, bizOv, pal, estilo);
          console.log('finishCatalog returned:', result ? 'OK len=' + result.length : 'empty');
          res.send(result);
        } catch (e) {
          console.error('finishCatalog error:', e.stack || e);
          return res.status(500).send('Error en finishCatalog: ' + e.message);
        }
      });
      return;
    }
    return res.redirect('/' + biz.slug);
  }
  p.imgs = productImgs(p);
  withPromo(p);
  track(biz.id, 'view', p.name);
  const estilo = getEffectiveEstilo(biz);
  const pal = getPalette(biz, estilo);
  const { products } = getCatalog(biz.id);
  const related = products.filter(x => x.id !== p.id).slice(0, 8);
  const ads = adsOn(biz) ? pickSponsored(biz, 4) : [];
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  app.render('producto', { biz, product: p, categories: [{ id: p.category_id || 0, name: p.category_name || 'General' }], related, ads, estilo, money: moneyFor(biz), currencySymbol: currencyInfo(biz.currency).symbol, currencyCode: biz.currency }, (err, html) => {
    if (err) return res.status(500).send('Error al generar el producto.');
    res.send(paintCatalog(html, biz, pal, estilo));
  });
});

// Manifest PWA por tienda (permite instalar el catálogo como app nativa)
app.get('/:slug/manifest.webmanifest', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz || !biz.active) return res.status(404).end();
  const pal = getPalette(biz, getEffectiveEstilo(biz));
  const name = biz.name || 'Catálogo';
  res.set('Content-Type', 'application/manifest+json');
  res.set('Cache-Control', 'no-store');
  res.json({
    name,
    short_name: name.slice(0, 12),
    description: biz.description || ('Catálogo de ' + name),
    id: '/' + biz.slug,
    start_url: '/' + biz.slug,
    scope: '/' + biz.slug,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: pal.accent || '#2563eb',
    lang: 'es',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  });
});

// ================= PREVIEW DE DISEÑO (panel admin) =================
// Renderiza el catálogo tal como quedaría con las opciones elegidas en el editor.
// Si la tienda aún no tiene productos, muestra productos de ejemplo para visualizar.
const PREVIEW_CATS = [
  { id: 1, name: 'Herramientas', sort: 1 },
  { id: 2, name: 'Pintura', sort: 2 },
  { id: 3, name: 'Plomería', sort: 3 }
];
const PREVIEW_PRODS = [
  { id: 1, category_id: 1, name: 'Martillo de uña 16oz', price: 189, old_price: 219, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400', galeria: '["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800","https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=400"]', description: 'Mango de fibra, cabeza forjada.', variants: '', featured: 1, category_name: 'Herramientas' },
  { id: 2, category_id: 1, name: 'Cinta métrica 5m', price: 129, old_price: null, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', galeria: '["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800"]', description: 'Con freno y clip de bolsillo.', variants: '', featured: 0, category_name: 'Herramientas' },
  { id: 3, category_id: 2, name: 'Pintura vinílica blanca 19L', price: 899, old_price: null, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', galeria: '[]', description: 'Cubriente, lavable, interior/exterior.', variants: '["Blanca","Marfil"]', featured: 1, category_name: 'Pintura' },
  { id: 4, category_id: 2, name: 'Brocha 3 pulgadas', price: 69, old_price: null, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', galeria: '[]', description: 'Cerda sintética, durabilidad alta.', variants: '', featured: 0, category_name: 'Pintura' },
  { id: 5, category_id: 3, name: 'Tubo PVC 1/2 pulgada 6m', price: 149, old_price: null, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400', galeria: '["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800"]', description: 'Cédula 40, uso hidráulico.', variants: '', featured: 0, category_name: 'Plomería' },
  { id: 6, category_id: 3, name: 'Llave de paso 1/2', price: 119, old_price: 149, image: 'https://images.unsplash.com/photo-1586864387734-d2ce3a8efa9e?w=400', galeria: '["https://images.unsplash.com/photo-1586864387734-d2ce3a8efa9e?w=800"]', description: 'Latón pulido, rosca estándar.', variants: '', featured: 0, category_name: 'Plomería' }
];

// Renderiza la vista previa del catálogo con las opciones elegidas (usada por el dueño y el maestro)
function previewCatalog(biz, q, res) {
  if (!biz) return res.status(404).send('Tienda no encontrada');
  const bizOv = {
    ...biz,
    template: TEMPLATES.includes(q.template) ? q.template : biz.template,
    color: COLORS.some(c => c.id === q.color) ? q.color : biz.color,
    color_hex: /^#[0-9a-fA-F]{6}$/.test(q.color_hex || '') ? q.color_hex : biz.color_hex,
    color_hex2: /^#[0-9a-fA-F]{6}$/.test(q.color_hex2 || '') ? q.color_hex2 : biz.color_hex2,
    color_mode: ['estilo', 'solido', 'degradado'].includes(q.color_mode) ? q.color_mode : biz.color_mode,
    grid_cols: [2, 3, 4].includes(Number(q.grid_cols)) ? Number(q.grid_cols) : biz.grid_cols,
    accent: /^#[0-9a-fA-F]{6}$/.test(q.accent || '') ? q.accent : biz.accent,
    accent2: /^#[0-9a-fA-F]{6}$/.test(q.accent2 || '') ? q.accent2 : biz.accent2,
    header: Object.prototype.hasOwnProperty.call(q, 'header') ? String(q.header || '').trim() : biz.header,
    header_text: Object.prototype.hasOwnProperty.call(q, 'header_text') ? String(q.header_text || '').trim() : biz.header_text,
    page_bg: /^#[0-9a-fA-F]{6}$/.test(q.page_bg || '') ? q.page_bg : biz.page_bg,
    logo: (q.logo || '').trim() || biz.logo,
    banner: (q.banner || '').trim() || biz.banner,
    sections: Object.prototype.hasOwnProperty.call(q, 'sections') ? String(q.sections) : biz.sections,
    blocks: Object.prototype.hasOwnProperty.call(q, 'blocks') ? String(q.blocks) : biz.blocks
  };
  const base = getEstilo(ESTILOS.some(e => e.id === q.estilo) ? q.estilo : biz.estilo);
  const eff = getEffectiveEstilo(biz);
  const font = (q.font && FONTS.some(f => f.css === q.font)) ? q.font : base.font;
  const pick = (v, d) => (v && String(v).trim()) ? v : d;
  const estilo = {
    ...base,
    bg: pick(q.bg, base.bg),
    card: pick(q.card, base.card),
    text: pick(q.text, base.text),
    muted: pick(q.muted, base.muted),
    border: pick(q.border, base.border),
    radius: pick(q.radius, base.radius),
    header: pick(q.header, base.header),
    headerText: pick(q.header_text, base.headerText),
    headerSet: !!(q.header && String(q.header).trim()) || eff.headerSet,
    font,
    fontLink: (FONTS.find(f => f.css === font) || {}).link || base.fontLink
  };
  const pal = getPalette(bizOv, estilo);
  const { categories, products, pages } = getCatalog(biz.id);
  const useDemo = q.demo === '1';
  let cats = categories, prods = products;
  if (useDemo) {
    const dc = demoCatalog(biz, q.demo_content);
    cats = dc.categories; prods = dc.products;
    if (dc.name && dc.name !== biz.name) bizOv.name = dc.name;
    if (dc.description && dc.description !== biz.description) bizOv.description = dc.description;
  } else if (categories.length === 0) {
    cats = PREVIEW_CATS;
    prods = PREVIEW_PRODS;
  }
  prods = prods.map(p => { p.imgs = productImgs(p); return p; });
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  app.render('catalog', { biz: bizOv, categories: cats, products: prods, estilo, theme: getTemplateTheme(bizOv.template), components: q.edit === '1' ? parseComponents(bizOv) : getComponents(bizOv), pages, editMode: q.edit === '1', seoUrl: '', money: moneyFor(biz), currencySymbol: currencyInfo(biz.currency).symbol, currencyCode: biz.currency }, (err, html) => {
    if (err) return res.status(500).send('Error al generar la vista previa.');
    res.send(finishCatalog(html, bizOv, pal, estilo));
  });
}

app.get('/:slug/admin/preview', requireAuth, (req, res) => {
  previewCatalog(getBusiness(req.params.slug), req.query, res);
});

// Vista previa de diseño desde el panel maestro
app.get('/maestro/:id/preview', maestroAuth, (req, res) => {
  previewCatalog(db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id), req.query, res);
});

// ================= PEDIDO POR WHATSAPP =================
app.get('/:slug/pedir', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz) return res.status(404).json({ error: 'Tienda no encontrada' });

  let items = [];
  try { items = JSON.parse(req.query.items || '[]'); } catch (e) { items = []; }
  const customerName = (req.query.nombre || '').toString().trim();
  const customerPhone = (req.query.telefono || '').toString().trim().replace(/[^0-9]/g, '');
  let total = 0;
  const lines = items.map((it) => {
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND business_id = ?').get(it.id, biz.id);
    if (!p) return null;
    const qty = Math.max(1, parseInt(it.qty) || 1);
    const sub = p.price * qty;
    total += sub;
    track(biz.id, 'view', p.name);
    track(biz.id, 'wa_product', p.name);
    const variant = it.variant ? ` (${it.variant})` : '';
    return `• ${qty} x ${p.name}${variant} = ${currencyInfo(biz.currency).symbol}${sub.toFixed(2)}`;
  }).filter(Boolean);

  if (lines.length === 0) return res.redirect('/' + req.params.slug);

  let message = buildOrderMessage(biz.name, lines, total, biz.wa_message, currencyInfo(biz.currency).symbol);
  if (customerName) message += `\n\nMi nombre: ${customerName}`;
  if (customerPhone) message += `\nMi teléfono: ${customerPhone}`;

  const customerData = customerName ? (customerName + (customerPhone ? ' (' + customerPhone + ')' : '')) : (customerPhone || '');
  db.prepare(
    `INSERT INTO orders (business_id, items, total, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, 'nuevo')`
  ).run(biz.id, lines.join(' | '), total, customerData, customerPhone);
  upsertCustomer(biz.id, customerName, customerPhone);
  track(biz.id, 'wa', 'pedido');

  res.redirect(waLink(biz, message));
});

// Pedido multi-tienda (chatbox): registra un pedido por tienda y devuelve sus wa.me
app.post('/api/pedir', (req, res) => {
  const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
  const nombre = String((req.body && req.body.nombre) || '').trim();
  const telefono = String((req.body && req.body.telefono) || '').replace(/[^0-9]/g, '');
  const byStore = {};
  for (const it of items) {
    const slug = String((it && it.store) || '').trim();
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(parseInt(it && it.id) || 0);
    if (!p || !slug) continue;
    const b = db.prepare('SELECT * FROM businesses WHERE slug = ? AND active = 1').get(slug);
    if (!b || b.id !== p.business_id) continue;
    const qty = Math.max(1, parseInt(it.qty) || 1);
    (byStore[slug] = byStore[slug] || []).push({ p, qty, variant: String(it.variant || '') });
  }
  const orders = Object.keys(byStore).map((slug) => {
    const list = byStore[slug];
    const b = getBusiness(slug);
    let total = 0;
    const lines = list.map((x) => {
      const sub = x.p.price * x.qty;
      total += sub;
      track(b.id, 'view', x.p.name);
      track(b.id, 'wa_product', x.p.name);
      return `• ${x.qty} x ${x.p.name}${x.variant ? ` (${x.variant})` : ''} = $${sub.toFixed(2)}`;
    });
    if (lines.length) {
      const customerData = nombre ? (nombre + (telefono ? ' (' + telefono + ')' : '')) : (telefono || '');
      db.prepare(
        `INSERT INTO orders (business_id, items, total, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, 'nuevo')`
      ).run(b.id, lines.join(' | '), total, customerData, telefono);
      upsertCustomer(b.id, nombre, telefono);
      track(b.id, 'wa', 'pedido');
    }
    const message = buildOrderMessage(b.name, lines, total, b.wa_message, currencyInfo(b.currency).symbol);
    return { slug, name: b.name, whatsapp: b.whatsapp, url: waLink(b, message) };
  });
  res.json({ orders });
});

// ================= AUTENTICACIÓN DEL DUEÑO =================
// Hash de PIN con scrypt (sal + hash hex)
function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pin), salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPin(pin, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  try {
    const test = crypto.scryptSync(String(pin), salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), test);
  } catch (e) { return false; }
}
// Sesión con token aleatorio (se guarda en la tabla sessions)
function createSession(bizId, kind, empId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, biz_id, kind, emp_id) VALUES (?, ?, ?, ?)').run(token, bizId || null, kind || 'owner', empId || null);
  return token;
}
function findSession(token) {
  if (!token) return null;
  return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
}
function deleteSession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Permisos disponibles para empleados (granulares por módulo y acción)
const EMPLOYEE_PERMS = [
  { key: 'productos.ver', module: 'Productos', label: 'Ver productos' },
  { key: 'productos.crear', module: 'Productos', label: 'Crear productos' },
  { key: 'productos.editar', module: 'Productos', label: 'Editar productos' },
  { key: 'productos.eliminar', module: 'Productos', label: 'Eliminar productos' },
  { key: 'pedidos.gestionar', module: 'Pedidos', label: 'Gestionar pedidos (entregar/cancelar)' },
  { key: 'clientes', module: 'Clientes', label: 'Ver y gestionar clientes' },
  { key: 'reportes', module: 'Panel', label: 'Ver panel y reportes' },
  { key: 'diseno', module: 'Diseño', label: 'Editar diseño' },
  { key: 'config', module: 'Configuración', label: 'Editar configuración' }
];
const ALL_PERMS = EMPLOYEE_PERMS.map(p => p.key).concat(['empleados']);
function permsOf(sess) {
  if (sess.kind === 'owner') return ALL_PERMS.slice();
  const emp = sess.emp_id ? db.prepare('SELECT * FROM employees WHERE id = ?').get(sess.emp_id) : null;
  if (!emp) return [];
  try { return JSON.parse(emp.perms || '[]'); } catch (e) { return []; }
}

function requireAuth(req, res, next) {
  const biz = getBusiness(req.params.slug);
  if (!biz) return res.status(404).render('404', { message: 'Tienda no encontrada' });
  const block = storeBlock(biz);
  if (block.blocked) {
    return res.status(403).render('store-off', { biz, reason: block.reason });
  }
  const sess = findSession(req.cookies && req.cookies.sid);
  if (sess && sess.biz_id === biz.id && (sess.kind === 'owner' || sess.kind === 'employee')) {
    req.biz = biz;
    req.role = sess.kind;
    req.perms = permsOf(sess);
    if (sess.kind === 'employee') {
      req.emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(sess.emp_id, biz.id);
      if (!req.emp) return res.redirect('/' + req.params.slug + '/admin');
    }
    res.locals.money = moneyFor(biz);
    res.locals.currencySymbol = currencyInfo(biz.currency).symbol;
    res.locals.currencyCode = biz.currency;
    res.locals.canDesign = designAllowed(biz);
    res.locals.isEmployee = req.role === 'employee';
    res.locals.empName = req.emp ? req.emp.name : '';
    res.locals.perms = req.perms;
    res.locals.lowStockCount = db.prepare("SELECT COUNT(*) AS c FROM products WHERE business_id = ? AND active = 1 AND (stock IS NULL OR stock <= 5)").get(biz.id).c;
    return next();
  }
  res.redirect('/' + req.params.slug + '/admin');
}

// Middleware: exige un permiso concreto (los dueños siempre pasan)
function can(perm) {
  return (req, res, next) => {
    if (!req.perms || req.perms.includes(perm)) return next();
    res.status(403).send('No tienes permiso para ver esto.');
  };
}

app.get('/:slug/admin', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz) return res.status(404).render('404', { message: 'Tienda no encontrada' });
  const pal = getPalette(biz, getEffectiveEstilo(biz));
  res.render('login', { biz, error: null, ok: req.query.salir ? 'Sesión cerrada correctamente.' : null, pal });
});

app.post('/:slug/admin', loginRateLimit, (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz) return res.status(404).render('404', { message: 'Tienda no encontrada' });
  const pal = getPalette(biz, getEffectiveEstilo(biz));
  const pin = String(req.body.pin || '');
  // 1) Dueño
  let ok = false;
  if (biz.pin_hash) {
    ok = verifyPin(pin, biz.pin_hash);
  } else if (pin === biz.pin) {
    db.prepare('UPDATE businesses SET pin_hash = ? WHERE id = ?').run(hashPin(pin), biz.id);
    ok = true;
  }
  if (ok) {
    const token = createSession(biz.id, 'owner');
    res.cookie('sid', token, { maxAge: 1000 * 60 * 60 * 12, httpOnly: true, sameSite: 'lax', path: '/' });
    return res.redirect('/' + req.params.slug + '/admin/panel');
  }
  // 2) Empleado
  const emps = db.prepare('SELECT * FROM employees WHERE business_id = ?').all(biz.id);
  const emp = emps.find(e => verifyPin(pin, e.pin_hash));
  if (emp) {
    const token = createSession(biz.id, 'employee', emp.id);
    res.cookie('sid', token, { maxAge: 1000 * 60 * 60 * 12, httpOnly: true, sameSite: 'lax', path: '/' });
    return res.redirect('/' + req.params.slug + '/admin/panel');
  }
  res.render('login', { biz, error: 'PIN incorrecto. Intenta de nuevo.', ok: null, pal });
});

app.get('/:slug/admin/salir', (req, res) => {
  deleteSession(req.cookies && req.cookies.sid);
  res.clearCookie('sid', { path: '/' });
  res.redirect('/' + req.params.slug + '/admin?salir=1');
});

// ================= PANEL =================
function panelData(biz) {
  const categories = db.prepare('SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC').all(biz.id);
  const allProducts = db.prepare(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.business_id = ? ORDER BY p.active DESC, p.sort ASC, p.id DESC`
  ).all(biz.id).map(p => {
    p.stock = p.stock === null || p.stock === undefined ? null : p.stock;
    p.variants = parseVariantList(p.variants);
    p.variantCount = variantCount(p.variants);
    return withPromo(p);
  });
  const orders = db.prepare(
    `SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC LIMIT 20`
  ).all(biz.id);
  const pending = orders.filter(o => !o.paid).length;
  const stats = getStats(biz.id);
  const planMax = PLAN_MAX(biz);
  const planInfo = getPlan(biz);
  const storeUrl = BASE_URL ? BASE_URL + '/' + biz.slug : '/' + biz.slug;
  const shareUrl = BASE_URL ? BASE_URL + '/' + biz.slug : '';
  const lowStock = allProducts.filter(p => p.stock === null || p.stock <= 5);
  const priceHistory = db.prepare('SELECT * FROM price_history WHERE business_id = ? ORDER BY id DESC LIMIT 30').all(biz.id);
  return { categories, allProducts, orders, pending, stats, planMax, planInfo, storeUrl, shareUrl, attributeTemplates: getAttributeTemplates(biz.id), lowStock, priceHistory, canDesign: designAllowed(biz) };
}

async function qrFor(biz) {
  const url = BASE_URL ? BASE_URL + '/' + biz.slug : '/' + biz.slug;
  try {
    return await QRCode.toDataURL(url, { width: 300, margin: 1 });
  } catch (e) {
    return '';
  }
}

app.get('/:slug/admin/panel', requireAuth, can('reportes'), async (req, res) => {
  const biz = req.biz;
  const data = panelData(biz);
  data.qrUrl = await qrFor(biz);
  res.render('panel', { biz, ...data, error: null });
});

app.get('/:slug/admin/productos', requireAuth, can('productos.ver'), (req, res) => {
  const biz = req.biz;
  const data = panelData(biz);
  res.render('productos', { biz, ...data, error: null });
});

// ================= CRUD PRODUCTOS =================
function parsePrices(body) {
  const price = parseFloat(body.price) || 0;
  let old_price = null;
  if (body.old_price && body.old_price !== '') {
    old_price = parseFloat(body.old_price) || null;
    if (old_price !== null && old_price <= price) old_price = null;
  }
  return { price, old_price };
}

// Normaliza la promoción: tipo + valor + regalo. Devuelve campos listos para guardar.
function parsePromo(body) {
  const types = ['descuento', 'porcentaje', '2x1', '3x2', 'regalo'];
  const promo_type = types.includes(body.promo_type) ? body.promo_type : '';
  const promo_value = promo_type === 'porcentaje' ? Math.min(99, Math.max(1, parseFloat(body.promo_value) || 0)) : 0;
  const promo_gift = promo_type === 'regalo' ? String(body.promo_gift || '').slice(0, 120) : '';
  // 'descuento' se apoya en old_price (no requiere valor extra)
  if (promo_type === 'descuento' && !body.old_price) return { promo_type: '', promo_value: 0, promo_gift: '' };
  return { promo_type, promo_value, promo_gift };
}

// Registra el historial de precios/promos solo si cambió algo relevante.
function logPriceHistory(bizId, p) {
  const last = db.prepare('SELECT * FROM price_history WHERE business_id = ? AND product_id = ? ORDER BY id DESC LIMIT 1').get(bizId, p.id);
  const same = last && last.price === (p.price || 0) && (last.old_price || null) === (p.old_price || null) && (last.promo_type || '') === (p.promo_type || '') && (last.promo_gift || '') === (p.promo_gift || '');
  if (same) return;
  db.prepare('INSERT INTO price_history (business_id, product_id, name, price, old_price, promo_type, promo_gift) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(bizId, p.id, p.name, p.price || 0, p.old_price || null, p.promo_type || '', p.promo_gift || '');
}

// Normaliza el modelo de variantes a { attrs: [{name, values[]}], images: {comboKey: url} }
// - Nuevo formato: { attrs: [{name, values}], images: { "Talla|Color": url } }
// - Legado: array de strings o de {name, image} → un solo atributo
function parseVariantModel(v) {
  const empty = { attrs: [], images: {}, stock: {}, prices: {}, skus: {}, barcodes: {} };
  if (!v) return empty;
  let raw = v;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return empty;
    if (s[0] === '[' || s[0] === '{') { try { raw = JSON.parse(s); } catch (e) { raw = s; } }
    else raw = s;
  }
  if (raw == null) return empty;

  // Formato nuevo { attrs, images, stock, prices }
  if (!Array.isArray(raw) && raw && Array.isArray(raw.attrs)) {
    const attrs = raw.attrs.map(a => ({
      name: String((a && a.name) || '').trim(),
      values: Array.isArray(a && a.values) ? a.values.map(x => String(x).trim()).filter(Boolean) : []
    })).filter(a => a.name && a.values.length);
    const images = (raw.images && typeof raw.images === 'object') ? raw.images : {};
    const stock = (raw.stock && typeof raw.stock === 'object') ? raw.stock : {};
    const prices = (raw.prices && typeof raw.prices === 'object') ? raw.prices : {};
    const skus = (raw.skus && typeof raw.skus === 'object') ? raw.skus : {};
    const barcodes = (raw.barcodes && typeof raw.barcodes === 'object') ? raw.barcodes : {};
    return { attrs, images, stock, prices, skus, barcodes };
  }

  // Legado: array de strings o de {name, image}
  if (Array.isArray(raw)) {
    const values = [];
    const images = {};
    raw.forEach(x => {
      if (typeof x === 'string') { const n = x.trim(); if (n && values.indexOf(n) === -1) values.push(n); }
      else if (x && typeof x === 'object') {
        const n = String(x.name || '').trim();
        if (!n) return;
        if (values.indexOf(n) === -1) values.push(n);
        if (x.image) images[n] = String(x.image).trim();
      }
    });
    if (!values.length) return empty;
    return { attrs: [{ name: '', values }], images, stock: {}, prices: {}, skus: {}, barcodes: {} };
  }

  // Legado: string separado por comas
  if (typeof raw === 'string') {
    const values = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (!values.length) return empty;
    return { attrs: [{ name: '', values }], images: {}, stock: {}, prices: {}, skus: {}, barcodes: {} };
  }

  return empty;
}

// Guardado: valida/normaliza y devuelve el JSON canónico
function parseVariants(v) {
  const model = parseVariantModel(v);
  return model.attrs.length ? JSON.stringify(model) : '';
}

// Lectura: modelo canónico { attrs, images }
function parseVariantList(v) {
  return parseVariantModel(v);
}

// Cuántas combinaciones tiene un modelo de variantes
function variantCount(model) {
  const m = model || { attrs: [] };
  if (!m.attrs || !m.attrs.length) return 0;
  return m.attrs.reduce((n, a) => n * ((a.values && a.values.length) || 1), 1);
}

function parseVariantsArray(v) {
  if (!v) return [];
  try {
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

// ============ Catálogo de atributos por tienda (plantillas reutilizables) ============
function parseAttrValues(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try { const a = JSON.parse(s); if (Array.isArray(a)) return a.map(x => String(x).trim()).filter(Boolean); } catch (e) {}
  }
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

function getAttributeTemplates(bizId) {
  return db.prepare('SELECT * FROM attribute_templates WHERE business_id = ? ORDER BY name COLLATE NOCASE ASC').all(bizId)
    .map(t => ({ id: t.id, name: t.name, values: parseAttrValues(t.vals) }));
}

function upsertAttributeTemplate(bizId, name, values) {
  const nm = String(name || '').trim();
  if (!nm) return { ok: false, error: 'El nombre del atributo es obligatorio.' };
  const vals = parseAttrValues(values);
  if (!vals.length) return { ok: false, error: 'Agrega al menos un valor (ej: Chica, Mediana, Grande).' };
  const existing = db.prepare('SELECT * FROM attribute_templates WHERE business_id = ? AND name = ? COLLATE NOCASE').get(bizId, nm);
  const json = JSON.stringify(vals);
  if (existing) {
    db.prepare('UPDATE attribute_templates SET vals = ? WHERE id = ?').run(json, existing.id);
    return { ok: true, id: existing.id, name: nm, values: vals, updated: true };
  }
  const r = db.prepare('INSERT INTO attribute_templates (business_id, name, vals) VALUES (?, ?, ?)').run(bizId, nm, json);
  return { ok: true, id: r.lastInsertRowid, name: nm, values: vals, updated: false };
}

function parseStock(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v);
  return isNaN(n) ? null : n;
}

function parsePromoEnd(v) {
  if (!v) return '';
  const s = String(v).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function parseGaleria(v) {
  if (!v || !String(v).trim()) return '';
  const raw = String(v).trim();
  let parts = [];
  if (raw.startsWith('[')) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) parts = arr.map(s => String(s).trim()).filter(Boolean);
    } catch (e) { parts = []; }
  }
  if (!parts.length) parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  return parts.length ? JSON.stringify(parts) : '';
}

// Lista de imágenes de un producto: la principal + las de la galería
function productImgs(p) {
  const list = [p.image || '', ...parseVariantsArray(p.galeria || '')].map(s => String(s || '').trim()).filter(Boolean);
  return list.length ? list : [p.image || '/img/sin-imagen.svg'];
}

function canAddProduct(biz) {
  const max = PLAN_MAX(biz);
  if (max === Infinity) return { ok: true };
  const count = db.prepare('SELECT COUNT(*) AS c FROM products WHERE business_id = ?').get(biz.id).c;
  return count < max ? { ok: true } : { ok: false, message: `Tu plan gratuito permite máximo ${max} productos. Usa 'Carga masiva' o actualiza a Pro.` };
}

app.post('/:slug/admin/producto', requireAuth, can('productos.crear'), (req, res) => {
  const biz = req.biz;
  const check = canAddProduct(biz);
  if (!check.ok) {
    return res.render('productos', { biz, ...panelData(biz), error: check.message });
  }
  const { name, category_id, description, image, stock, variants } = req.body;
  const renderError = (message) => res.status(400).render('productos', { biz, ...panelData(biz), error: message });
  if (!name || !String(name).trim()) {
    return renderError('El nombre del producto es obligatorio.');
  }
  const { price, old_price } = parsePrices(req.body);
  const promo = parsePromo(req.body);
  if (price < 0) {
    return renderError('El precio no puede ser negativo.');
  }
  if (req.body.price === '' || req.body.price === undefined || req.body.price === null || isNaN(parseFloat(req.body.price))) {
    return renderError('El precio es obligatorio (usa un número, ej: 25.50).');
  }
  try {
    db.prepare(
      `INSERT INTO products (business_id, category_id, name, price, old_price, description, image, galeria, stock, variants, promo_ends_at, featured, promo_type, promo_value, promo_gift, sku, tags, video, specs, barcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(biz.id, category_id || null, String(name).trim(), price, old_price, description || '', image || '', parseGaleria(req.body.galeria), parseStock(stock), parseVariants(variants), parsePromoEnd(req.body.promo_ends_at), req.body.featured ? 1 : 0, promo.promo_type, promo.promo_value, promo.promo_gift, (req.body.sku || '').toString().trim().slice(0, 60), (req.body.tags || '').toString().trim().slice(0, 300), (req.body.video || '').toString().trim().slice(0, 300), (req.body.specs || '').toString().slice(0, 2000), (req.body.barcode || '').toString().trim().slice(0, 60));
    const created = db.prepare('SELECT * FROM products WHERE business_id = ? ORDER BY id DESC LIMIT 1').get(biz.id);
    if (created) logPriceHistory(biz.id, created);
  } catch (err) {
    return renderError('No se pudo guardar el producto: ' + (err.message || 'error desconocido'));
  }
  res.redirect('/' + req.params.slug + '/admin/productos');
});

app.post('/:slug/admin/producto/:id/eliminar', requireAuth, can('productos.eliminar'), (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/productos');
});

app.post('/:slug/admin/producto/:id/toggle', requireAuth, can('productos.editar'), (req, res) => {
  db.prepare(
    'UPDATE products SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ? AND business_id = ?'
  ).run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/productos');
});

app.post('/:slug/admin/producto/:id/featured', requireAuth, can('productos.editar'), (req, res) => {
  db.prepare(
    'UPDATE products SET featured = CASE WHEN featured = 1 THEN 0 ELSE 1 END WHERE id = ? AND business_id = ?'
  ).run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/productos');
});

// Reordena manualmente: mueve un producto arriba o abajo intercambiando sort.
app.post('/:slug/admin/producto/:id/mover', requireAuth, can('productos.editar'), (req, res) => {
  const id = parseInt(req.params.id);
  const dir = req.body.dir === 'up' ? -1 : 1;
  const bizId = req.biz.id;
  const list = db.prepare('SELECT id, sort FROM products WHERE business_id = ? ORDER BY active DESC, sort ASC, id DESC').all(bizId);
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return res.redirect('/' + req.params.slug + '/admin/productos');
  const target = list[idx + dir];
  if (!target) return res.redirect('/' + req.params.slug + '/admin/productos');
  const a = list[idx], b = target;
  if (a.sort === b.sort) {
    db.prepare('UPDATE products SET sort = ? WHERE id = ?').run(a.sort + (dir === -1 ? -1 : 1), a.id);
    db.prepare('UPDATE products SET sort = ? WHERE id = ?').run(a.sort, b.id);
  } else {
    db.prepare('UPDATE products SET sort = ? WHERE id = ?').run(b.sort, a.id);
    db.prepare('UPDATE products SET sort = ? WHERE id = ?').run(a.sort, b.id);
  }
  res.redirect('/' + req.params.slug + '/admin/productos');
});

app.post('/:slug/admin/producto/:id', requireAuth, can('productos.editar'), (req, res) => {
  const { name, category_id, description, image, stock, variants } = req.body;
  const { price, old_price } = parsePrices(req.body);
  const promo = parsePromo(req.body);
  const renderError = (message) => res.status(400).render('productos', { biz: req.biz, ...panelData(req.biz), error: message });
  if (!name || !name.trim()) {
    return renderError('El nombre del producto es obligatorio.');
  }
  if (req.body.price === '' || req.body.price === undefined || req.body.price === null || isNaN(parseFloat(req.body.price))) {
    return renderError('El precio es obligatorio (usa un número, ej: 25.50).');
  }
  if (price < 0) {
    return renderError('El precio no puede ser negativo.');
  }
  try {
    db.prepare(
      `UPDATE products SET name = ?, price = ?, old_price = ?, category_id = ?, description = ?, image = ?, galeria = ?, stock = ?, variants = ?, promo_ends_at = ?, featured = ?, promo_type = ?, promo_value = ?, promo_gift = ?, sku = ?, tags = ?, video = ?, specs = ?, barcode = ?
       WHERE id = ? AND business_id = ?`
    ).run(name.trim(), price, old_price, category_id || null, description || '', image || '', parseGaleria(req.body.galeria), parseStock(stock), parseVariants(variants), parsePromoEnd(req.body.promo_ends_at), req.body.featured ? 1 : 0, promo.promo_type, promo.promo_value, promo.promo_gift, (req.body.sku || '').toString().trim().slice(0, 60), (req.body.tags || '').toString().trim().slice(0, 300), (req.body.video || '').toString().trim().slice(0, 300), (req.body.specs || '').toString().slice(0, 2000), (req.body.barcode || '').toString().trim().slice(0, 60), req.params.id, req.biz.id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (updated) logPriceHistory(req.biz.id, updated);
  } catch (err) {
    return renderError('No se pudo guardar el producto: ' + (err.message || 'error desconocido'));
  }
  res.redirect('/' + req.params.slug + '/admin/productos');
});

app.post('/:slug/admin/producto/:id/duplicar', requireAuth, can('productos.crear'), (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ? AND business_id = ?').get(req.params.id, req.biz.id);
  if (p) {
    db.prepare(
      `INSERT INTO products (business_id, category_id, name, price, old_price, description, image, galeria, stock, variants, promo_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      p.business_id, p.category_id, (p.name || '') + ' (copia)', p.price, p.old_price,
      p.description || '', p.image || '', p.galeria || '', p.stock, p.variants || '', p.promo_ends_at || ''
    );
  }
  res.redirect('/' + req.params.slug + '/admin/productos');
});

// ================= CRUD CATEGORÍAS (JSON, no recarga el formulario) =================
app.post('/:slug/admin/categoria', requireAuth, can('productos.editar'), (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.json({ ok: false, error: 'El nombre de la categoría es obligatorio.' });
  const dup = db.prepare('SELECT * FROM categories WHERE business_id = ? AND name = ? COLLATE NOCASE').get(req.biz.id, name);
  if (dup) return res.json({ ok: false, error: 'Esa categoría ya existe.' });
  const r = db.prepare('INSERT INTO categories (business_id, name) VALUES (?, ?)').run(req.biz.id, name);
  res.json({ ok: true, id: r.lastInsertRowid, name });
});

app.post('/:slug/admin/categoria/:id/eliminar', requireAuth, can('productos.editar'), (req, res) => {
  const id = parseInt(req.params.id);
  const cat = db.prepare('SELECT * FROM categories WHERE id = ? AND business_id = ?').get(id, req.biz.id);
  if (cat) {
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id);
    db.prepare('DELETE FROM categories WHERE id = ? AND business_id = ?').run(id, req.biz.id);
  }
  res.json({ ok: true });
});

app.post('/:slug/admin/categoria/:id', requireAuth, can('productos.editar'), (req, res) => {
  const id = parseInt(req.params.id);
  const name = (req.body.name || '').trim();
  if (!name) return res.json({ ok: false, error: 'El nombre de la categoría es obligatorio.' });
  const dup = db.prepare('SELECT * FROM categories WHERE business_id = ? AND name = ? COLLATE NOCASE AND id != ?').get(req.biz.id, name, id);
  if (dup) return res.json({ ok: false, error: 'Esa categoría ya existe.' });
  const r = db.prepare('UPDATE categories SET name = ? WHERE id = ? AND business_id = ?').run(name, id, req.biz.id);
  res.json({ ok: r.changes > 0, id, name });
});

// ================= CATÁLOGO DE ATRIBUTOS (JSON, no recarga el formulario) =================
app.post('/:slug/admin/atributo/guardar', requireAuth, can('productos.editar'), (req, res) => {
  res.json(upsertAttributeTemplate(req.biz.id, req.body.name, req.body.values));
});

app.post('/:slug/admin/atributo/:id/eliminar', requireAuth, can('productos.editar'), (req, res) => {
  db.prepare('DELETE FROM attribute_templates WHERE id = ? AND business_id = ?').run(parseInt(req.params.id), req.biz.id);
  res.json({ ok: true });
});

app.post('/:slug/admin/atributo/:id', requireAuth, can('productos.editar'), (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.prepare('SELECT * FROM attribute_templates WHERE id = ? AND business_id = ?').get(id, req.biz.id);
  if (!existing) return res.json({ ok: false, error: 'Atributo no encontrado.' });
  const nm = String(req.body.name || '').trim();
  const vals = parseAttrValues(req.body.values);
  if (!nm) return res.json({ ok: false, error: 'El nombre del atributo es obligatorio.' });
  if (!vals.length) return res.json({ ok: false, error: 'Agrega al menos un valor.' });
  const dup = db.prepare('SELECT * FROM attribute_templates WHERE business_id = ? AND name = ? COLLATE NOCASE AND id != ?').get(req.biz.id, nm, id);
  if (dup) return res.json({ ok: false, error: 'Ya existe un atributo con ese nombre.' });
  db.prepare('UPDATE attribute_templates SET name = ?, vals = ? WHERE id = ?').run(nm, JSON.stringify(vals), id);
  res.json({ ok: true, id, name: nm, values: vals });
});

// ================= PEDIDOS =================
app.post('/:slug/admin/order/:id/pagado', requireAuth, can('pedidos.gestionar'), (req, res) => {
  db.prepare('UPDATE orders SET paid = 1, status = ? WHERE id = ? AND business_id = ?').run('pagado', req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/panel');
});

app.post('/:slug/admin/order/:id/entregado', requireAuth, can('pedidos.gestionar'), (req, res) => {
  db.prepare('UPDATE orders SET paid = 1, status = ? WHERE id = ? AND business_id = ?').run('entregado', req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/panel');
});

app.post('/:slug/admin/order/:id/cancelado', requireAuth, can('pedidos.gestionar'), (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ? AND business_id = ?').run('cancelado', req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/panel');
});

app.post('/:slug/admin/order/:id/eliminar', requireAuth, can('pedidos.gestionar'), (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/panel');
});

app.get('/:slug/admin/reporte', requireAuth, (req, res) => {
  const orders = db.prepare(
    `SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC`
  ).all(req.biz.id);
  let csv = 'Fecha,Productos,Total,Estado,Pagado\n';
  for (const o of orders) {
    csv += `"${o.created_at}","${o.items.replace(/"/g, '""')}",${o.total},${o.status},${o.paid ? 'SI' : 'NO'}\n`;
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=pedidos-${req.biz.slug}.csv`);
  res.send('\uFEFF' + csv);
});

// ================= EXPORTAR CATÁLOGO =================
function variantsText(raw) {
  const vm = parseVariantList(raw);
  if (!vm.attrs.length) return '';
  return vm.attrs.map(a => (a.name || 'Opciones') + ': ' + a.values.join(', ')).join(' | ');
}

app.get('/:slug/admin/exportar.xlsx', requireAuth, (req, res) => {
  const biz = req.biz;
  const catName = {};
  db.prepare('SELECT id, name FROM categories WHERE business_id = ?').all(biz.id).forEach(c => { catName[c.id] = c.name; });
  const products = db.prepare('SELECT * FROM products WHERE business_id = ? AND active = 1 ORDER BY sort ASC, id ASC').all(biz.id);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Catálogo');
  ws.columns = [
    { header: 'Nombre', key: 'name', width: 32 },
    { header: 'Precio', key: 'price', width: 12 },
    { header: 'Precio anterior', key: 'old_price', width: 14 },
    { header: 'Categoría', key: 'cat', width: 20 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Atributos', key: 'variants', width: 30 },
    { header: 'Descripción', key: 'desc', width: 40 },
    { header: 'SKU', key: 'sku', width: 14 },
    { header: 'Código de barras', key: 'barcode', width: 16 },
    { header: 'Imagen', key: 'image', width: 45 }
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  products.forEach(p => {
    ws.addRow({
      name: p.name,
      price: p.price,
      old_price: p.old_price || '',
      cat: catName[p.category_id] || '',
      stock: p.stock === null || p.stock === undefined ? '' : p.stock,
      variants: variantsText(p.variants),
      desc: p.description || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      image: p.image || ''
    });
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=catalogo-${biz.slug}.xlsx`);
  wb.xlsx.write(res).then(() => res.end());
});

app.get('/:slug/admin/catalogo-print', requireAuth, (req, res) => {
  const { products } = getCatalog(req.biz.id);
  res.set('Cache-Control', 'no-store');
  res.render('catalogo-print', { biz: req.biz, products, money: moneyFor(req.biz) });
});

// ================= CLIENTES (mini-CRM) =================
function upsertCustomer(bizId, name, phone) {
  const nm = String(name || '').trim();
  const ph = String(phone || '').replace(/[^0-9]/g, '');
  if (!ph && !nm) return;
  let existing = null;
  if (ph) existing = db.prepare('SELECT * FROM customers WHERE business_id = ? AND phone = ?').get(bizId, ph);
  if (!existing && nm) existing = db.prepare('SELECT * FROM customers WHERE business_id = ? AND LOWER(name) = LOWER(?)').get(bizId, nm);
  if (existing) {
    if (ph && !existing.phone) db.prepare('UPDATE customers SET phone = ? WHERE id = ?').run(ph, existing.id);
    if (nm && (!existing.name || existing.name === String(existing.phone || ''))) db.prepare('UPDATE customers SET name = ? WHERE id = ?').run(nm, existing.id);
  } else {
    db.prepare('INSERT INTO customers (business_id, name, phone) VALUES (?, ?, ?)').run(bizId, nm || ph, ph);
  }
}

function clientRows(bizId) {
  const allOrders = db.prepare('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC').all(bizId);
  return db.prepare('SELECT * FROM customers WHERE business_id = ? ORDER BY id DESC').all(bizId).map(c => {
    const phone = (c.phone || '').trim();
    const name = (c.name || '').trim().toLowerCase();
    const ords = allOrders.filter(o => {
      if (phone) {
        const op = (o.customer_phone || '').replace(/[^0-9]/g, '');
        if (op && (op.indexOf(phone) !== -1 || phone.indexOf(op) !== -1)) return true;
      }
      const on = (o.customer_name || '').toLowerCase();
      return !!name && !!on && on.indexOf(name) !== -1;
    });
    c.orders = ords;
    c.orderCount = ords.length;
    c.totalSpent = ords.reduce((s, o) => s + (o.total || 0), 0);
    return c;
  });
}

app.get('/:slug/admin/clientes', requireAuth, can('clientes'), (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('clientes', { biz: req.biz, customers: clientRows(req.biz.id), error: null, ok: req.query.ok === '1', money: moneyFor(req.biz) });
});

app.post('/:slug/admin/cliente', requireAuth, can('clientes'), (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').replace(/[^0-9]/g, '');
  const notes = String(req.body.notes || '').trim();
  if (!name) return res.redirect('/' + req.params.slug + '/admin/clientes');
  db.prepare('INSERT INTO customers (business_id, name, phone, notes) VALUES (?, ?, ?, ?)').run(req.biz.id, name, phone, notes);
  res.redirect('/' + req.params.slug + '/admin/clientes?ok=1');
});

app.post('/:slug/admin/cliente/:id/eliminar', requireAuth, can('clientes'), (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/clientes');
});

// Conteo de pedidos nuevos (para la notificación del panel)
app.get('/:slug/admin/api/new-orders', requireAuth, (req, res) => {
  const row = db.prepare('SELECT COALESCE(MAX(id), 0) AS lastId FROM orders WHERE business_id = ?').get(req.biz.id);
  res.json({ lastId: row.lastId });
});

// Conteo de productos con stock bajo/agotado (para el aviso del menú)
app.get('/:slug/admin/api/low-stock', requireAuth, (req, res) => {
  const c = db.prepare('SELECT COUNT(*) AS c FROM products WHERE business_id = ? AND active = 1 AND (stock IS NULL OR stock <= 5)').get(req.biz.id).c;
  res.json({ count: c });
});

// ================= CARGA MASIVA (EXCEL) =================
const importSessions = {};

const FIELD_OPTIONS = [
  { value: 'nombre', label: 'Nombre del producto', required: true },
  { value: 'precio', label: 'Precio', required: true },
  { value: 'categoria', label: 'Categoría' },
  { value: 'precio_antes', label: 'Precio antes (promo)' },
  { value: 'stock', label: 'Stock disponible' },
  { value: 'variantes', label: 'Atributos (tallas, colores…)' },
  { value: 'descripcion', label: 'Descripción' },
  { value: 'imagen', label: 'Imagen (URL o ruta)' }
];

const COLUMN_ALIASES = {
  nombre: ['nombre', 'name', 'producto', 'articulo', 'item', 'descripcion del producto', 'descripcion de producto', 'sku', 'referencia', 'product'],
  precio: ['precio', 'price', 'costo', 'precio venta', 'precio de venta', 'costo de venta', 'venta', 'p.venta', 'pv', 'precio publico', 'precio publico iva', 'precio iva', 'precio con iva', 'precio unitario', 'precio lista', 'precio neto', 'precio contado', 'precio credito', 'importe'],
  categoria: ['categoria', 'category', 'linea', 'seccion', 'grupo', 'rubro', 'departamento', 'familia', 'tipo'],
  precio_antes: ['precio_antes', 'precio anterior', 'old price', 'precio regular', 'antes', 'precio tachado', 'precio lista', 'precio list', 'precio anterior iva', 'precio normal', 'precio mayor'],
  stock: ['stock', 'cantidad', 'existencia', 'existencias', 'disponible', 'disponibilidad', 'inventario', 'unidades', 'cant', 'existe', 'stock disponible', 'piezas', 'uds'],
  variantes: ['variantes', 'variante', 'atributos', 'atributo', 'talla', 'tallas', 'color', 'colores', 'color/talla', 'tamano', 'tamanos', 'tamaño', 'medida', 'medidas', 'presentacion', 'presentaciones', 'modelo', 'formato', 'opciones'],
  descripcion: ['descripcion', 'description', 'detalle', 'nota', 'observaciones', 'especificaciones', 'caracteristicas', 'detalles'],
  imagen: ['imagen', 'image', 'foto', 'url', 'link', 'fotografia', 'foto url', 'imagen url', 'foto principal']
};

function normalizeKey(s) {
  return (s || '').toString().trim().toLowerCase().replace(/[áéíóúüñ]/g, (m) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' }[m])).replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function parseMoney(v) {
  if (v === null || v === undefined || v === '') return NaN;
  let s = v.toString().trim().replace(/[$MX\s]/gi, '');
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(/,/g, '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

function autoMapColumns(headers) {
  const norm = headers.map(normalizeKey);
  const mapping = {};
  Object.keys(COLUMN_ALIASES).forEach((field) => {
    for (let i = 0; i < norm.length; i++) {
      const h = norm[i];
      const aliasHits = COLUMN_ALIASES[field].filter((a) => normalizeKey(a) === h);
      const contains = COLUMN_ALIASES[field].some((a) => {
        const k = normalizeKey(a);
        if (!k) return false;
        if (k.length >= 4 && h.indexOf(k) > -1) return true;   // "precio de venta" dentro de "precio de venta con iva"
        if (h.length >= 4 && k.indexOf(h) > -1) return true;   // "precio" dentro de "precio de venta"
        return false;
      });
      if (aliasHits.length > 0) { mapping[field] = i; break; }
    }
    if (mapping[field] === undefined) {
      for (let i = 0; i < norm.length; i++) {
        const h = norm[i];
        const k = COLUMN_ALIASES[field].map(normalizeKey).filter(Boolean).find((a) => a.length >= 4 && (h.indexOf(a) > -1 || a.indexOf(h) > -1));
        if (k) { mapping[field] = i; break; }
      }
    }
  });
  return mapping;
}

// Lee cualquier Excel/CSV y devuelve { headers, rows, totalRows } detectando la fila de encabezado
// y el separador de CSV (funciona con la lista de precios de cada quien, no solo con la plantilla).
function parseSheet(buffer, filename) {
  let workbook;
  try {
    const ext = (filename || '').toLowerCase();
    const isCsv = ext.endsWith('.csv');
    const opts = { type: 'buffer', raw: false, defval: '' };
    if (isCsv) {
      const firstLines = buffer.toString('utf8').split(/\r?\n/).slice(0, 5).join('\n');
      let sep = ',';
      const counts = {};
      [',', ';', '\t', '|'].forEach(s => { counts[s] = firstLines.split(s).length; });
      const best = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      if (counts[best] > 1 && counts[best] > counts[','] * 0.8) sep = best === '\t' ? '\t' : best;
      if (sep === ';') { opts.FS = ';'; }
      if (sep === '\t') { opts.FS = '\t'; }
    }
    workbook = XLSX.read(buffer, opts);
  } catch (e) {
    return { error: 'El archivo no se pudo leer. Verifica que sea un Excel o CSV válido.' };
  }

  const sheetName = workbook.SheetNames[0];
  const aoa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: '' });

  // Encontrar la fila de encabezado: la primera con 2+ celdas con contenido
  // (ignora títulos o logos de arriba tipo "LISTA DE PRECIOS - JULIO")
  let headerRow = -1;
  for (let i = 0; i < aoa.length; i++) {
    const cells = aoa[i].map(c => (c === null || c === undefined ? '' : String(c)).trim());
    const nonEmpty = cells.filter(Boolean).length;
    if (nonEmpty >= 2) { headerRow = i; break; }
  }
  if (headerRow === -1) return { error: 'El archivo está vacío o no tiene filas de datos.' };

  const headers = aoa[headerRow].map(c => String(c).trim());
  const colCount = headers.length;

  // Quitar duplicados de encabezado y columnas totalmente vacías
  const seen = {};
  const finalHeaders = [];
  const finalIdx = [];
  headers.forEach((h, j) => {
    if (!h) return;
    const key = h.toLowerCase();
    if (seen[key] !== undefined) {
      finalHeaders.push(h + '_2');
      finalIdx.push(j);
    } else {
      seen[key] = h;
      finalHeaders.push(h);
      finalIdx.push(j);
    }
  });
  // Conservar columnas vacías de en medio solo si alguna fila tiene datos ahí
  const rows = [];
  for (let r = headerRow + 1; r < aoa.length; r++) {
    const cells = aoa[r].map(c => (c === null || c === undefined ? '' : String(c)));
    if (cells.every(c => !String(c).trim())) continue;
    const obj = {};
    finalIdx.forEach((j, k) => { obj[finalHeaders[k]] = (cells[j] || '').toString().trim(); });
    if (Object.keys(obj).length) rows.push(obj);
  }

  return { headers: finalHeaders, rows, totalRows: rows.length };
}

function getImportSession(req, res) {
  const token = req.body.token;
  const session = importSessions[token];
  if (!session) {
    res.render('importar', { biz: req.biz, categories: [], resultado: { ok: 0, errores: ['La sesión de carga expiró. Vuelve a subir el archivo.'] } });
    return null;
  }
  return session;
}

app.get('/:slug/admin/importar', requireAuth, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC').all(req.biz.id);
  res.render('importar', { biz: req.biz, categories, resultado: null });
});

app.get('/:slug/admin/plantilla', requireAuth, async (req, res) => {
  const biz = req.biz;
  const categories = db.prepare('SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC').all(biz.id);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Productos');

  ws.columns = [
    { header: 'nombre', key: 'nombre', width: 30 },
    { header: 'precio', key: 'precio', width: 12 },
    { header: 'categoria', key: 'categoria', width: 20 },
    { header: 'precio_antes', key: 'precio_antes', width: 12 },
    { header: 'stock', key: 'stock', width: 12 },
    { header: 'atributos', key: 'variantes', width: 22 },
    { header: 'descripcion', key: 'descripcion', width: 40 },
    { header: 'imagen', key: 'imagen', width: 45 }
  ];

  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  const ejemplo = ws.addRow({
    nombre: 'Martillo de uña 16oz',
    precio: 189,
    categoria: categories[0] ? categories[0].name : '',
    precio_antes: 220,
    stock: 25,
    variantes: 'Chica, Mediana, Grande',
    descripcion: 'Mango de fibra, cabeza forjada.',
    imagen: 'https://ejemplo.com/martillo.jpg'
  });

  const categoryList = categories.map(c => c.name);
  const formula = '"' + categoryList.join(',') + '"';
  ws.getColumn('C').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: 'Categoría inválida',
        error: 'Elige una de las categorías de la lista.'
      };
    }
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=plantilla-${biz.slug}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

// Paso 1: subir su propio archivo y mostrar vista previa con mapeo
app.post('/:slug/admin/importar/vista-previa', requireAuth, uploadExcel.single('archivo'), verifyBodyCsrf, (req, res) => {
  const biz = req.biz;
  const categories = db.prepare('SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC').all(biz.id);

  if (!req.file) {
    return res.render('importar', { biz, categories, resultado: { ok: 0, errores: ['No se recibió ningún archivo. Sube un .xlsx, .xls o .csv.'] } });
  }

  const parsed = parseSheet(req.file.buffer, req.file.originalname);
  if (parsed.error) {
    return res.render('importar', { biz, categories, resultado: { ok: 0, errores: [parsed.error] } });
  }
  const headers = parsed.headers;
  const rows = parsed.rows;

  const token = crypto.randomBytes(8).toString('hex');
  importSessions[token] = { buffer: req.file.buffer, headers, totalRows: rows.length, filename: req.file.originalname };

  const auto = autoMapColumns(headers);
  let saved = {};
  try { saved = JSON.parse(biz.import_map || '{}') || {}; } catch (e) { saved = {}; }

  const mapped = [];
  for (let i = 0; i < headers.length; i++) {
    let field = null;
    const norm = normalizeKey(headers[i]);
    if (saved[norm] && FIELD_OPTIONS.some(f => f.value === saved[norm])) field = saved[norm];
    Object.keys(auto).forEach((k) => { if (auto[k] === i) field = k; });
    mapped.push(field);
  }

  res.render('importar-mapear', { biz, categories, token, headers, mapped, preview: rows.slice(0, 5), totalRows: rows.length, FIELD_OPTIONS, resultado: null });
});

// Paso 2: aplicar mapeo e importar
app.post('/:slug/admin/importar/ejecutar', requireAuth, (req, res) => {
  const biz = req.biz;
  const categories = db.prepare('SELECT * FROM categories WHERE business_id = ? ORDER BY sort ASC').all(biz.id);
  const catByName = {};
  categories.forEach(c => { catByName[c.name.toLowerCase().trim()] = c.id; });

  const session = getImportSession(req, res);
  if (!session) return;

  const { buffer, headers, totalRows } = session;
  const selected = req.body;

  const fieldToCol = {};
  FIELD_OPTIONS.forEach((f) => {
    const idx = parseInt(selected[f.value]);
    if (idx >= 0 && idx < headers.length) fieldToCol[f.value] = idx;
  });

  const errores = [];
  if (fieldToCol.nombre === undefined) errores.push('Selecciona la columna del nombre del producto.');
  if (fieldToCol.precio === undefined) errores.push('Selecciona la columna del precio.');

  const parsed = parseSheet(buffer, session.filename || '');
  if (parsed.error) errores.push(parsed.error);

  if (errores.length > 0) {
    return res.render('importar-mapear', { biz, categories, token: req.body.token, headers, mapped: [], preview: [], totalRows, FIELD_OPTIONS, resultado: { ok: 0, errores } });
  }

  const rows = parsed.rows;
  const insert = db.prepare(
    `INSERT INTO products (business_id, category_id, name, price, old_price, description, image, stock, variants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const planMax = PLAN_MAX(biz);
  let ok = 0;
  rows.forEach((row, i) => {
    const fila = i + 2;
    const get = (field) => fieldToCol[field] !== undefined ? row[headers[fieldToCol[field]]] : '';

    const nombre = (get('nombre') || '').toString().trim();
    const precio = parseMoney(get('precio'));
    const precioAntesRaw = get('precio_antes');
    const precioAntes = precioAntesRaw === '' || precioAntesRaw === undefined ? null : parseMoney(precioAntesRaw);
    const categoria = (get('categoria') || '').toString().trim();
    const descripcion = (get('descripcion') || '').toString().trim();
    const imagen = (get('imagen') || '').toString().trim();
    const stockRaw = (get('stock') || '').toString().trim();
    const stock = stockRaw === '' ? null : parseInt(stockRaw, 10);
    const variantesRaw = (get('variantes') || '').toString();

    if (!nombre) { errores.push(`Fila ${fila}: falta el nombre.`); return; }
    if (isNaN(precio) || precio <= 0) { errores.push(`Fila ${fila} ("${nombre}"): el precio debe ser un número mayor a 0.`); return; }
    if (categoria && !catByName[categoria.toLowerCase()]) { errores.push(`Fila ${fila} ("${nombre}"): la categoría "${categoria}" no existe. Crea la categoría primero o déjala vacía.`); return; }
    if (precioAntes !== null && (isNaN(precioAntes) || precioAntes <= precio)) { errores.push(`Fila ${fila} ("${nombre}"): el precio_antes debe ser mayor al precio.`); return; }
    if (imagen && !/^https?:\/\//.test(imagen) && !imagen.startsWith('/uploads/')) { errores.push(`Fila ${fila} ("${nombre}"): la imagen debe ser una URL (http…) o una ruta /uploads/…`); return; }
    if (stock !== null && (isNaN(stock) || stock < 0)) { errores.push(`Fila ${fila} ("${nombre}"): el stock debe ser un número entero mayor o igual a 0.`); return; }
    if (planMax !== Infinity && ok >= planMax) { errores.push(`Fila ${fila} ("${nombre}"): superaste el límite de ${planMax} productos de tu plan gratuito.`); return; }

    insert.run(
      biz.id,
      categoria ? catByName[categoria.toLowerCase()] : null,
      nombre,
      precio,
      precioAntes || null,
      descripcion,
      imagen,
      stock,
      parseVariants(variantesRaw)
    );
    ok++;
  });

  // Recordar el mapeo para la próxima vez que suba un archivo parecido
  if (ok > 0 || errores.length === 0) {
    const save = {};
    headers.forEach((h, i) => {
      const field = Object.keys(fieldToCol).find(f => fieldToCol[f] === i);
      if (field) save[normalizeKey(h)] = field;
    });
    db.prepare('UPDATE businesses SET import_map = ? WHERE id = ?').run(JSON.stringify(save), biz.id);
  }

  delete importSessions[req.body.token];
  res.render('importar', { biz, categories, resultado: { ok, errores } });
});

// ================= CONFIGURACIÓN =================
// Locals para la página de configuración (todos los formularios de esa página la usan)
function configLocals(biz, opts) {
  let girosList = [];
  try { girosList = JSON.parse(biz.giros || '[]'); } catch (e) { girosList = []; }
  if (!Array.isArray(girosList)) girosList = [];
  if (!girosList.length && biz.giro) girosList = [biz.giro];
  const horario = {};
  try {
    const h = JSON.parse(biz.horario || '[]');
    if (Array.isArray(h)) h.forEach(x => { if (x && x.d) horario[x.d] = { o: x.o || '', c: x.c || '' }; });
  } catch (e) {}
  let blocksList = [];
  try { const b = JSON.parse(biz.blocks || '[]'); if (Array.isArray(b)) blocksList = b; } catch (e) {}
  const cats = db.prepare('SELECT id, name FROM categories WHERE business_id = ? ORDER BY sort ASC, name ASC').all(biz.id);
  const previewProducts = db.prepare('SELECT p.id, p.name, p.price, p.old_price, p.image, p.featured, p.category_id, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.business_id = ? AND p.active = 1 ORDER BY p.featured DESC, p.sort ASC, p.created_at DESC LIMIT 60').all(biz.id);
  const baseEstilo = getEffectiveEstilo(biz);
  const theme = getTemplateTheme(biz.template);
  const diseno = theme
    ? { ...baseEstilo, font: theme.bodyFont, fontLink: theme.fontLink, bg: theme.bg, card: theme.card, text: theme.text, muted: theme.muted, border: theme.border, radius: theme.radius, accent: theme.accent, accent2: theme.accent2, header: '', headerText: theme.text, dark: !!theme.dark }
    : baseEstilo;
  const pal = theme
    ? { accent: theme.accent, accent2: theme.accent2, mode: 'solido' }
    : getPalette(biz, baseEstilo);
  return {
    biz,
    TEMPLATES, COLORS, GIROS, ESTILOS, FONTS, CURRENCIES, GIRO_PRESETS,
    diseno,
    TPL_META,
    TPL_CASOS,
    template: biz.template || '',
    theme: theme,
    girosList,
    horario,
    horarioMsg: biz.horario_msg || '',
    blocksList,
    defaultStack: getComponents(biz),
    cats,
    previewProducts,
    pal,
    esMaestro: !!(opts && opts.esMaestro),
    canDesign: !!(opts && opts.esMaestro) || designAllowed(biz),
    error: (opts && opts.error) || null,
    ok: (opts && opts.ok) || null
  };
}

// Aplica el guardado de la configuración (datos y/o diseño) a una tienda
function applyConfig(biz, body) {
  const { name, whatsapp, description, template, color, color_hex, color_hex2, color_mode, grid_cols, logo, banner, giro, estilo, bg, card, text, muted, border, radius, font, accent, accent2, header, header_text, page_bg } = body;
  const waMessage = Object.prototype.hasOwnProperty.call(body, 'wa_message') ? (body.wa_message || '').toString().slice(0, 1000) : biz.wa_message;
  const currency = CURRENCY_MAP[body.currency] ? body.currency : biz.currency;
  const sections = (() => {
    try {
      const s = JSON.parse(body.sections || '{}');
      return JSON.stringify({
        hero_mode: ['destacado', 'compacto', 'oculto'].includes(s.hero_mode) ? s.hero_mode : 'destacado',
        categorias: s.categorias !== false,
        catmode: s.catmode === 'top' ? 'top' : 'left',
        density: ['compacta', 'normal', 'espaciosa'].includes(s.density) ? s.density : 'normal',
        shadow: ['none', 'suave', 'media', 'fuerte'].includes(s.shadow) ? s.shadow : 'media',
        hover: ['none', 'scale', 'lift', 'zoom', 'glow'].includes(s.hover) ? s.hover : 'lift',
        orden: (Array.isArray(s.orden) ? s.orden : ['hero', 'contenido']).slice(0, 3),
        nav: cleanNav(s.nav)
      });
    } catch (e) { return biz.sections || ''; }
  })();
  const demo = (() => {
    if (!Object.prototype.hasOwnProperty.call(body, 'demo')) return biz.demo || '';
    try { const d = JSON.parse(body.demo || '{}'); return JSON.stringify({ name: String(d.name || '').slice(0, 60), description: String(d.description || '').slice(0, 200), products: (Array.isArray(d.products) ? d.products : []).slice(0, 8).map(p => ({ name: String(p.name || '').slice(0, 60), price: parseFloat(p.price) || 0, cat: String(p.cat || '').slice(0, 40) })) }); }
    catch (e) { return ''; }
  })();
  const horario = (() => {
    if (!Object.prototype.hasOwnProperty.call(body, 'horario_set')) return biz.horario || '';
    const arr = [];
    for (let d = 1; d <= 7; d++) {
      const o = String(body['h_open_' + d] || '').trim();
      const c = String(body['h_close_' + d] || '').trim();
      if (o && c && o < c) arr.push({ d, o, c });
    }
    return arr.length ? JSON.stringify(arr) : '';
  })();
  const horarioMsg = Object.prototype.hasOwnProperty.call(body, 'horario_msg')
    ? String(body.horario_msg || '').slice(0, 200)
    : (biz.horario_msg || '');
  const blocks = (() => {
    if (!Object.prototype.hasOwnProperty.call(body, 'blocks')) return biz.blocks || '[]';
    try {
      const arr = JSON.parse(body.blocks || '[]');
      if (!Array.isArray(arr)) return '[]';
      const ALLOWED = ['row', 'banner', 'texto', 'imagen', 'categorias', 'destacados', 'productos', 'ofertas', 'video', 'card', 'mascara', 'info', 'filtros', 'boton', 'titulo', 'separador', 'espacio', 'whatsapp', 'mapa', 'redes', 'galeria', 'carrusel', 'faq', 'testimonios', 'contacto', 'horario', 'stats', 'precios', 'html', 'cupon', 'equipo', 'marcas', 'pasos', 'caracteristicas', 'promo', 'comparativa', 'timeline', 'noticias', 'newsletter', 'countdown', 'llamar', 'audio', 'descarga', 'qr', 'sucursales', 'premios', 'antesdespues', 'reserva', 'valoracion', 'servicios', 'cta', 'ubicacion'];
      const cleanBlock = (b, idx) => {
        const type = ALLOWED.includes(b.type) ? b.type : 'texto';
        const base = { id: String(b.id || ('c' + idx)), type };
        base.title = String(b.title || '').slice(0, 120);
        base.text = String(b.text || '').slice(0, 2000);
        base.image = String(b.image || '').slice(0, 500);
        base.link = String(b.link || '').slice(0, 500);
        base.url = String(b.url || '').slice(0, 500);
        base.count = Math.max(0, parseInt(b.count) || 0);
        base.category_id = Math.max(0, parseInt(b.category_id) || 0);
        base.layout = ['grid', 'lista'].includes(b.layout) ? b.layout : 'grid';
        base.cols = [2, 3, 4].includes(Number(b.cols)) ? Number(b.cols) : 3;
        base.height = ['compacto', 'normal', 'grande', 'full', 'auto'].includes(b.height) ? b.height : '';
        base.size = ['pequeno', 'normal', 'grande'].includes(b.size) ? b.size : '';
        base.align = ['left', 'center'].includes(b.align) ? b.align : '';
        base.width = ['auto', 'full', 'grande', 'media', 'pequena'].includes(b.width) ? b.width : '';
        base.border = ['none', '1', '2', '4'].includes(String(b.border)) ? String(b.border) : '';
        base.radius = ['0', '8', '16', '24'].includes(String(b.radius)) ? String(b.radius) : '';
        base.color = /^#[0-9a-fA-F]{6}$/.test(b.color || '') ? b.color : '';
        base.animation = ['none', 'fade', 'up', 'zoom'].includes(b.animation) ? b.animation : 'none';
        base.grosor = ['1', '3', '6'].includes(String(b.grosor)) ? String(b.grosor) : '1';
        base.bg = /^#[0-9a-fA-F]{6}$/.test(b.bg || '') ? b.bg : '';
        base.bg2 = /^#[0-9a-fA-F]{6}$/.test(b.bg2 || '') ? b.bg2 : '';
        base.bgType = ['solid', 'linear', 'radial', 'conic', 'image', 'pattern'].includes(b.bgType) ? b.bgType : '';
        base.bgAngle = Math.max(0, Math.min(360, parseInt(b.bgAngle) || 135));
        base.bgImage = String(b.bgImage || '').slice(0, 500);
        base.bgPattern = ['rayas', 'horizontales', 'puntos', 'cuadros'].includes(b.bgPattern) ? b.bgPattern : '';
        base.bgPatternC = /^#[0-9a-fA-F]{6}$/.test(b.bgPatternC || '') ? b.bgPatternC : '';
        base.padding = ['none', 'suave', 'normal', 'amplio'].includes(b.padding) ? b.padding : '';
        base.margin = ['0', '5', '10', '15', '20', '30', '40', '50'].includes(String(b.margin)) ? String(b.margin) : '';
        base.shadow = ['none', 'suave', 'media', 'fuerte'].includes(b.shadow) ? b.shadow : '';
        base.hover = ['none', 'scale', 'lift', 'glow'].includes(b.hover) ? b.hover : '';
        base.uppercase = b.uppercase === 'si' ? 'si' : '';
        base.paginacion = ['no', 'vermas', 'paginas'].includes(b.paginacion) ? b.paginacion : '';
        base.filtroBusqueda = b.filtroBusqueda === 'no' ? 'no' : 'si';
        base.filtroCategorias = b.filtroCategorias === 'no' ? 'no' : 'si';
        base.filtroPrecio = b.filtroPrecio === 'no' ? 'no' : 'si';
        base.filtroAtributos = b.filtroAtributos === 'no' ? 'no' : 'si';
        base.filtroAttrs = String(b.filtroAttrs || '').slice(0, 300);
        base.mostrarFiltros = b.mostrarFiltros === 'si' ? 'si' : 'no';
        if (type === 'productos') base.padding = ['suave', 'normal', 'amplio'].includes(b.padding) ? b.padding : 'suave';
        base.alto = Math.max(0, Math.min(600, parseInt(b.alto) || 0));
        base.mensaje = String(b.mensaje || '').slice(0, 500);
        base.facebook = String(b.facebook || '').slice(0, 300);
        base.instagram = String(b.instagram || '').slice(0, 300);
        base.tiktok = String(b.tiktok || '').slice(0, 300);
        base.whatsapp = String(b.whatsapp || '').slice(0, 30);
        base.images = String(b.images || '').slice(0, 4000);
        base.object_position = ['left', 'center', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(b.object_position) ? b.object_position : '';
        base.image_position = ['left', 'center', 'right'].includes(b.image_position) ? b.image_position : '';
        base.overlay = ['none', 'soft', 'strong'].includes(b.overlay) ? b.overlay : '';
        base.captionPos = ['none', 'left', 'center', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(b.captionPos) ? b.captionPos : '';
        base.captionColor = /^#[0-9a-fA-F]{6}$/.test(b.captionColor || '') ? b.captionColor : '';
        base.captionSize = Math.max(8, Math.min(72, parseInt(b.captionSize) || 0));
        base.eyebrow = String(b.eyebrow || '').slice(0, 120);
        base.boton = String(b.boton || '').slice(0, 60);
        base.figura = ['cajas', 'blobs', 'panes', 'taza', 'cortes'].includes(b.figura) ? b.figura : '';
        base.figuraItems = String(b.figuraItems || '').slice(0, 600);
        base.modo = ['cards', 'menu'].includes(b.modo) ? b.modo : '';
        base.items = String(b.items || '').slice(0, 4000);
        base.html = String(b.html || '').slice(0, 20000);
        base.codigo = String(b.codigo || '').slice(0, 60);
        base.precio = String(b.precio || '').slice(0, 60);
        base.telefono = String(b.telefono || '').slice(0, 30);
        base.contenido = String(b.contenido || '').slice(0, 500);
        base.fecha = String(b.fecha || '').slice(0, 40);
        base.puntaje = ['1', '2', '3', '4', '5'].includes(String(b.puntaje)) ? String(b.puntaje) : '5';
        base.imgAntes = String(b.imgAntes || '').slice(0, 500);
        base.imgDespues = String(b.imgDespues || '').slice(0, 500);
        base.colA = String(b.colA || '').slice(0, 80);
        base.colB = String(b.colB || '').slice(0, 80);
        base.btn1 = String(b.btn1 || '').slice(0, 60);
        base.link1 = String(b.link1 || '').slice(0, 500);
        base.btn2 = String(b.btn2 || '').slice(0, 60);
        base.link2 = String(b.link2 || '').slice(0, 500);
        base.placeholder = String(b.placeholder || '').slice(0, 80);
        base.accent = String(b.accent || '').slice(0, 7);
        base.autor = String(b.autor || '').slice(0, 100);
        if (type === 'row') {
          const colsArr = Array.isArray(b.columns) ? b.columns.slice(0, 12) : [];
          base.gap = Math.max(0, Math.min(40, parseInt(b.gap) || 12));
          base.columns = colsArr.map((col, ci) => ({
            span: Math.max(1, Math.min(12, parseInt(col.span) || 1)),
            blocks: (Array.isArray(col.blocks) ? col.blocks : []).slice(0, 30).map((cb, cbi) => cleanBlock(cb, idx + ':' + ci + ':' + cbi))
          }));
        } else if (type === 'card') {
          base.body = (Array.isArray(b.body) ? b.body : (Array.isArray(b.blocks) ? b.blocks : [])).slice(0, 20).map((cb, cbi) => cleanBlock(cb, idx + ':b:' + cbi));
          base.footer = (Array.isArray(b.footer) ? b.footer : []).slice(0, 20).map((cb, cbi) => cleanBlock(cb, idx + ':f:' + cbi));
        } else if (type === 'mascara') {
          base.variant = ['circle','square','roundrect','pill','triangle','diamond','star4','star5','star6','custom'].includes(b.variant) ? b.variant : 'circle';
          base.size = ['xs','s','m','l','xl','2xl'].includes(b.size) ? b.size : 'm';
          base.points = String(b.points || '').slice(0, 2000);
          base.children = (Array.isArray(b.children) ? b.children : []).slice(0, 10).map((cb, cbi) => cleanBlock(cb, idx + ':c:' + cbi));
        }
        return base;
      };
      const isPages = arr.length === 0 || (arr[0] && typeof arr[0].type === 'undefined' && Array.isArray(arr[0].blocks));
      let pages;
      if (isPages) {
        pages = arr.slice(0, 20).map((pg, pi) => ({
          id: String(pg.id || ('pg' + pi)).slice(0, 40),
          title: String(pg.title || ('Página ' + (pi + 1))).slice(0, 80),
          icon: String(pg.icon || '').slice(0, 12),
          blocks: (Array.isArray(pg.blocks) ? pg.blocks : []).slice(0, 60).map((bb, bi) => cleanBlock(bb, pi + ':' + bi))
        }));
      } else {
        pages = [{ id: 'pg-legacy', title: 'Inicio', icon: '🏠', blocks: arr.slice(0, 60).map((bb, bi) => cleanBlock(bb, '0:' + bi)) }];
      }
      return JSON.stringify(pages);
    } catch (e) { return '[]'; }
  })();
  const girosRaw = Array.isArray(body.giros) ? body.giros : (body.giros ? [body.giros] : []);
  const girosList = girosRaw.filter(g => GIROS.includes(g));
  const primaryGiro = (girosList.length ? girosList[0] : giro) || biz.giro;
  const cleanWa = (whatsapp || '').replace(/[^0-9]/g, '');
  const cleanHex = /^#[0-9a-fA-F]{6}$/.test(color_hex || '') ? color_hex : biz.color_hex;
  const cleanHex2 = /^#[0-9a-fA-F]{6}$/.test(color_hex2 || '') ? color_hex2 : biz.color_hex2;
  const colorObj = COLORS.find(c => c.id === color);
  const mode = ['estilo', 'solido', 'degradado'].includes(color_mode) ? color_mode : biz.color_mode;
  const cols = [2, 3, 4].includes(Number(grid_cols)) ? Number(grid_cols) : biz.grid_cols;
  const estSel = ESTILOS.some(e => e.id === estilo) ? estilo : biz.estilo;
  const estBase = getEstilo(estSel);
  const pickOrReset = (posted, presetDefault) => {
    const v = (posted || '').toString().trim();
    return v && v.toLowerCase() !== (presetDefault || '').toString().toLowerCase() ? v : '';
  };
  const fontOk = FONTS.some(f => f.css === font);
  const designPosted = Object.prototype.hasOwnProperty.call(body, 'bg');
  const headerFinal = designPosted ? (body.header_user === '1' ? (header || '') : '') : biz.header;
  db.prepare(
    `UPDATE businesses SET name = ?, whatsapp = ?, description = ?, template = ?, color = ?, color_hex = ?, color_hex2 = ?, color_mode = ?, grid_cols = ?, logo = ?, banner = ?, giro = ?, giros = ?, estilo = ?, bg = ?, card = ?, text = ?, muted = ?, border = ?, radius = ?, font = ?, accent = ?, accent2 = ?, header = ?, header_text = ?, wa_message = ?, currency = ?, sections = ?, demo = ?, horario = ?, horario_msg = ?, blocks = ?, page_bg = ? WHERE id = ?`
  ).run(
    name || biz.name,
    cleanWa || biz.whatsapp,
    Object.prototype.hasOwnProperty.call(body, 'description') ? (description || '') : biz.description,
    TEMPLATES.includes(template) ? template : biz.template,
    colorObj ? colorObj.id : biz.color,
    colorObj ? colorObj.c1 : cleanHex,
    colorObj ? colorObj.c2 : cleanHex2,
    mode,
    cols,
    logo || biz.logo,
    banner || biz.banner,
    GIROS.includes(primaryGiro) ? primaryGiro : biz.giro,
    JSON.stringify(girosList.length ? girosList : (GIROS.includes(biz.giro) ? [biz.giro] : [])),
    estSel,
    designPosted ? pickOrReset(bg, estBase.bg) : biz.bg,
    designPosted ? pickOrReset(card, estBase.card) : biz.card,
    designPosted ? pickOrReset(text, estBase.text) : biz.text,
    designPosted ? pickOrReset(muted, estBase.muted) : biz.muted,
    designPosted ? pickOrReset(border, estBase.border) : biz.border,
    designPosted ? pickOrReset(radius, estBase.radius) : biz.radius,
    designPosted ? (fontOk ? pickOrReset(font, estBase.font) : '') : biz.font,
    designPosted ? pickOrReset(accent, estBase.accent) : biz.accent,
    designPosted ? pickOrReset(accent2, estBase.accent2) : biz.accent2,
    headerFinal,
    designPosted ? pickOrReset(header_text, estBase.headerText) : biz.header_text,
    waMessage,
    currency,
    sections,
    demo,
    horario,
    horarioMsg,
    blocks,
    sanitizePageBg(page_bg, Object.prototype.hasOwnProperty.call(body, 'page_bg'), biz.page_bg),
    biz.id
  );
  // Modo fácil: guarda el preset elegido y crea las páginas sugeridas
  if (Object.prototype.hasOwnProperty.call(body, 'giro_preset')) {
    db.prepare('UPDATE businesses SET giro_preset = ?, onboarding_done = 1 WHERE id = ?').run(String(body.giro_preset || '').slice(0, 60), biz.id);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'paginas_sugeridas')) {
    let pags = [];
    try { pags = JSON.parse(body.paginas_sugeridas || '[]'); } catch (e) { pags = []; }
    db.crearPaginasSugeridas(biz.id, pags);
  }
  return getBusiness(biz.slug);
}

app.get('/:slug/admin/config', requireAuth, can('config'), (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('config', configLocals(req.biz, {}));
});

app.post('/:slug/admin/config', requireAuth, (req, res) => {
  const biz = applyConfig(req.biz, req.body);
  res.render('config', configLocals(biz, { ok: 'Configuración guardada' }));
});

// ================= CONSTRUCTOR DE DISEÑO (apartado propio) =================
app.get('/:slug/admin/diseno', requireAuth, can('diseno'), (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('diseno', { ...configLocals(req.biz, {}), active: 'diseno', money: moneyFor(req.biz), currencySymbol: currencyInfo(req.biz.currency).symbol });
});

// ================= PLANES (el dueño ve y elige su plan) =================
app.get('/:slug/admin/planes', requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  const plans = db.prepare('SELECT * FROM plans WHERE active = 1 ORDER BY price ASC').all();
  const current = getPlan(req.biz);
  res.render('planes', { biz: req.biz, plans, current, ok: req.query.ok === '1' });
});

app.post('/:slug/admin/plan', requireAuth, (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE key = ? AND active = 1').get(req.body.plan);
  if (!plan) return res.redirect('/' + req.params.slug + '/admin/planes');
  const ends = plan.days > 0 ? new Date(Date.now() + plan.days * 86400000).toISOString().slice(0, 10) : '';
  db.prepare('UPDATE businesses SET plan = ?, plan_price = ?, plan_ends_at = ? WHERE id = ?').run(plan.key, plan.price, ends, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/planes?ok=1');
});

// ================= EMPLEADOS =================
function getEmployees(bizId) {
  return db.prepare('SELECT id, name, perms, created_at FROM employees WHERE business_id = ? ORDER BY id').all(bizId)
    .map(e => { try { e.perms = JSON.parse(e.perms || '[]'); } catch (err) { e.perms = []; } return e; });
}
// Devuelve true si ese PIN ya lo usa el dueño u otro empleado
function pinInUse(biz, pin, excludeEmpId) {
  if (!pin) return false;
  if (biz.pin_hash) { if (verifyPin(pin, biz.pin_hash)) return true; }
  else if (pin === biz.pin) return true;
  const emps = db.prepare('SELECT pin_hash FROM employees WHERE business_id = ? AND id != ?').all(biz.id, excludeEmpId || 0);
  return emps.some(e => verifyPin(pin, e.pin_hash));
}
function parsePerms(body) {
  let raw = body.perms;
  if (!raw) return [];
  if (!Array.isArray(raw)) raw = [raw];
  return raw.flatMap(x => String(x).split(',')).map(s => s.trim()).filter(p => EMPLOYEE_PERMS.some(x => x.key === p));
}

app.get('/:slug/admin/empleados', requireAuth, can('empleados'), (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('empleados', { biz: req.biz, employees: getEmployees(req.biz.id), EMPLOYEE_PERMS, error: null, ok: req.query.ok === '1', formName: '', formPerms: [], formId: '' });
});

app.post('/:slug/admin/empleado', requireAuth, can('empleados'), (req, res) => {
  const name = String(req.body.name || '').trim();
  const pin = String(req.body.pin || '');
  const perms = parsePerms(req.body);
  const renderErr = (msg) => res.render('empleados', { biz: req.biz, employees: getEmployees(req.biz.id), EMPLOYEE_PERMS, error: msg, ok: false, formName: name, formPerms: perms, formId: '' });
  if (!name || !/^\d{4,12}$/.test(pin)) return renderErr('Escribe el nombre y un PIN de 4 a 12 dígitos.');
  if (pinInUse(req.biz, pin)) return renderErr('Ese PIN ya lo usa el dueño u otro empleado. Elige otro.');
  db.prepare('INSERT INTO employees (business_id, name, pin_hash, perms) VALUES (?, ?, ?, ?)').run(req.biz.id, name, hashPin(pin), JSON.stringify(perms));
  res.redirect('/' + req.params.slug + '/admin/empleados?ok=1');
});

// Editar empleado (nombre y permisos; PIN opcional)
app.post('/:slug/admin/empleado/:id', requireAuth, can('empleados'), (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.biz.id);
  if (!emp) return res.redirect('/' + req.params.slug + '/admin/empleados');
  const name = String(req.body.name || '').trim();
  const perms = parsePerms(req.body);
  const renderErr = (msg) => res.render('empleados', { biz: req.biz, employees: getEmployees(req.biz.id), EMPLOYEE_PERMS, error: msg, ok: false, formName: name, formPerms: perms, formId: emp.id });
  if (!name) return renderErr('Escribe el nombre.');
  const pin = String(req.body.pin || '');
  if (pin) {
    if (!/^\d{4,12}$/.test(pin)) return renderErr('El PIN debe tener de 4 a 12 dígitos.');
    if (pinInUse(req.biz, pin, emp.id)) return renderErr('Ese PIN ya lo usa el dueño u otro empleado.');
    db.prepare('UPDATE employees SET name = ?, perms = ?, pin_hash = ? WHERE id = ?').run(name, JSON.stringify(perms), hashPin(pin), emp.id);
  } else {
    db.prepare('UPDATE employees SET name = ?, perms = ? WHERE id = ?').run(name, JSON.stringify(perms), emp.id);
  }
  res.redirect('/' + req.params.slug + '/admin/empleados?ok=1');
});

// Resetear el PIN de un empleado
app.post('/:slug/admin/empleado/:id/reset-pin', requireAuth, can('empleados'), (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.biz.id);
  if (!emp) return res.redirect('/' + req.params.slug + '/admin/empleados');
  const pin = String(req.body.pin || '');
  const renderErr = (msg) => res.render('empleados', { biz: req.biz, employees: getEmployees(req.biz.id), EMPLOYEE_PERMS, error: msg, ok: false, formName: '', formPerms: [], formId: emp.id });
  if (!/^\d{4,12}$/.test(pin)) return renderErr('El nuevo PIN debe tener de 4 a 12 dígitos.');
  if (pinInUse(req.biz, pin, emp.id)) return renderErr('Ese PIN ya lo usa el dueño u otro empleado.');
  db.prepare('UPDATE employees SET pin_hash = ? WHERE id = ?').run(hashPin(pin), emp.id);
  res.redirect('/' + req.params.slug + '/admin/empleados?ok=1');
});

app.post('/:slug/admin/empleado/:id/eliminar', requireAuth, can('empleados'), (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/empleados');
});

// ================= PROVEEDORES Y COMPRAS =================
function combosOf(raw) {
  const model = parseVariantList(raw);
  const lists = model.attrs.map(a => (a.values && a.values.length) ? a.values : ['']);
  if (!lists.length) return [];
  return lists.reduce((acc, arr) => {
    if (!acc.length) return arr.map(v => [v]);
    const out = [];
    acc.forEach(prefix => arr.forEach(v => out.push(prefix.concat([v]))));
    return out;
  }, []).map(vals => vals.join(' / '));
}

function parsePoItems(raw) {
  const norm = (x) => ({ product_id: parseInt(x.product_id) || null, name: String(x.name || '').trim(), variant: String(x.variant || '').trim(), qty: parseInt(x.qty) || 0, cost: parseFloat(x.cost) || 0 });
  if (Array.isArray(raw)) return raw.map(norm).filter(x => x.name && x.qty > 0);
  const s = String(raw || '').trim();
  if (s.startsWith('[')) {
    try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.map(norm).filter(x => x.name && x.qty > 0); } catch (e) {}
  }
  // Texto plano: una línea por producto "cantidad x nombre" o "nombre, cantidad, costo"
  return s.split(/\r?\n/).map(line => {
    const t = line.trim(); if (!t) return null;
    const m1 = t.match(/^(\d+)\s*[x*]\s*(.+)$/);
    if (m1) return { product_id: null, name: m1[2].trim(), variant: '', qty: parseInt(m1[1]), cost: 0 };
    const parts = t.split(/[,;\t]/).map(p => p.trim());
    return { product_id: null, name: parts[0], variant: '', qty: parseInt(parts[1]) || 0, cost: parseFloat(parts[2]) || 0 };
  }).filter(x => x && x.name && x.qty > 0);
}
function poMessage(supName, items, total) {
  const lista = items.map(it => '• ' + it.qty + ' x ' + it.name + (it.variant ? ' (' + it.variant + ')' : '') + (it.cost > 0 ? ' — ' + moneyRaw(it.cost) : '')).join('\n');
  return 'Hola ' + (supName || '') + ', me gustaría pedir:\n\n' + lista + '\n\nTotal estimado: ' + moneyRaw(total) + '\n\n¿Me confirmas disponibilidad y entrega?';
}
function moneyRaw(n) { return '$' + (Number(n || 0).toFixed(2)); }

app.get('/:slug/admin/proveedores', requireAuth, can('config'), (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE business_id = ? ORDER BY name').all(req.biz.id);
  const products = db.prepare('SELECT id, name, sku, stock, variants FROM products WHERE business_id = ? AND active = 1 ORDER BY name').all(req.biz.id)
    .map(p => { p.variantOpts = combosOf(p.variants); return p; });
  const pos = db.prepare('SELECT po.*, s.name AS supplier_name, s.phone AS supplier_phone FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id WHERE po.business_id = ? ORDER BY po.id DESC LIMIT 40').all(req.biz.id)
    .map(po => { po.items = parsePoItems(po.items); po.msg = encodeURIComponent(poMessage(po.supplier_name, po.items, po.total)); return po; });
  res.render('proveedores', { biz: req.biz, suppliers, products, pos, error: null, ok: req.query.ok === '1', money: moneyFor(req.biz) });
});

app.post('/:slug/admin/proveedor', requireAuth, can('config'), (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').trim();
  const notes = String(req.body.notes || '').trim();
  if (!name) return res.redirect('/' + req.params.slug + '/admin/proveedores');
  db.prepare('INSERT INTO suppliers (business_id, name, phone, notes) VALUES (?, ?, ?, ?)').run(req.biz.id, name, phone, notes);
  res.redirect('/' + req.params.slug + '/admin/proveedores?ok=1');
});

app.post('/:slug/admin/proveedor/:id/eliminar', requireAuth, can('config'), (req, res) => {
  db.prepare('DELETE FROM suppliers WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/proveedores');
});

app.post('/:slug/admin/compra', requireAuth, can('config'), (req, res) => {
  const supplier_id = parseInt(req.body.supplier_id) || null;
  const items = parsePoItems(req.body.items);
  if (!items.length) return res.redirect('/' + req.params.slug + '/admin/proveedores');
  const total = items.reduce((s, it) => s + (it.cost * it.qty), 0);
  db.prepare('INSERT INTO purchase_orders (business_id, supplier_id, items, total) VALUES (?, ?, ?, ?)').run(req.biz.id, supplier_id, JSON.stringify(items), total);
  res.redirect('/' + req.params.slug + '/admin/proveedores?ok=1');
});

// Marcar recibido: suma el stock a los productos referenciados (o a su combinación)
app.post('/:slug/admin/compra/:id/recibido', requireAuth, can('config'), (req, res) => {
  const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND business_id = ?').get(req.params.id, req.biz.id);
  if (po && !po.received) {
    const items = parsePoItems(po.items);
    items.forEach(it => {
      if (!it.product_id) return;
      if (it.variant) {
        const p = db.prepare('SELECT variants FROM products WHERE id = ? AND business_id = ?').get(it.product_id, req.biz.id);
        if (p) {
          const model = parseVariantList(p.variants);
          const key = it.variant.split(' / ').join('|');
          model.stock = model.stock || {};
          model.stock[key] = (model.stock[key] || 0) + it.qty;
          db.prepare('UPDATE products SET variants = ? WHERE id = ?').run(JSON.stringify(model), it.product_id);
        }
      } else {
        db.prepare('UPDATE products SET stock = COALESCE(stock, 0) + ? WHERE id = ? AND business_id = ?').run(it.qty, it.product_id, req.biz.id);
      }
    });
    db.prepare('UPDATE purchase_orders SET received = 1 WHERE id = ?').run(po.id);
  }
  res.redirect('/' + req.params.slug + '/admin/proveedores');
});

app.post('/:slug/admin/compra/:id/eliminar', requireAuth, can('config'), (req, res) => {
  db.prepare('DELETE FROM purchase_orders WHERE id = ? AND business_id = ?').run(req.params.id, req.biz.id);
  res.redirect('/' + req.params.slug + '/admin/proveedores');
});

// ================= CONFIGURACIÓN DE DISEÑO (panel maestro) =================
app.get('/maestro/:id/config', maestroAuth, (req, res) => {
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!biz) return res.redirect('/maestro/panel');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('config', configLocals(biz, { esMaestro: true }));
});

app.post('/maestro/:id/config', maestroAuth, (req, res) => {
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!biz) return res.redirect('/maestro/panel');
  const updated = applyConfig(biz, req.body);
  res.render('config', configLocals(updated, { esMaestro: true, ok: 'Configuración guardada' }));
});

app.get('/maestro/:id/diseno', maestroAuth, (req, res) => {
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!biz) return res.redirect('/maestro/panel');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.render('diseno', { ...configLocals(biz, { esMaestro: true }), money: moneyFor(biz), currencySymbol: currencyInfo(biz.currency).symbol });
});

// Cambiar PIN (con el actual)
app.post('/:slug/admin/cambiar-pin', requireAuth, (req, res) => {
  const { pin_actual, pin_nuevo, pin_repite } = req.body;
  const biz = req.biz;
  const actualOk = biz.pin_hash ? verifyPin(String(pin_actual || ''), biz.pin_hash) : (pin_actual === biz.pin);
  if (!actualOk) {
    return res.render('config', configLocals(biz, { error: 'El PIN actual no coincide.' }));
  }
  if (!pin_nuevo || !/^\d{6,12}$/.test(String(pin_nuevo)) || pin_nuevo !== pin_repite) {
    return res.render('config', configLocals(biz, { error: 'El PIN nuevo debe tener de 6 a 12 dígitos y coincidir.' }));
  }
  db.prepare('UPDATE businesses SET pin_hash = ?, pin = \'\' WHERE id = ?').run(hashPin(String(pin_nuevo)), biz.id);
  res.render('config', configLocals(getBusiness(biz.slug), { ok: 'PIN actualizado correctamente' }));
});

// Resetear PIN (solo con código maestro)
app.post('/:slug/admin/resetear-pin', (req, res) => {
  const biz = getBusiness(req.params.slug);
  if (!biz) return res.status(404).render('404', { message: 'Tienda no encontrada' });
  const { master } = req.body;
  if (master !== MASTER_KEY) {
    return res.render('config', configLocals(biz, { error: 'Código maestro incorrecto. No se puede resetear el PIN.' }));
  }
  db.prepare('UPDATE businesses SET pin_hash = ?, pin = \'\' WHERE id = ?').run(hashPin('123456'), biz.id);
  res.render('config', configLocals(getBusiness(biz.slug), { ok: 'PIN reseteado a 123456. Pídele al dueño cambiarlo.' }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nessik corriendo en http://localhost:${PORT}`);
  console.log(`Landing:      http://localhost:${PORT}/`);
  console.log(`Registrar:    http://localhost:${PORT}/registrar  (código maestro: ${MASTER_KEY})`);
  console.log(`Demo tienda:  http://localhost:${PORT}/ferreteria-demo`);
  console.log(`Panel demo:   http://localhost:${PORT}/ferreteria-demo/admin  (PIN: 1234)`);
});
