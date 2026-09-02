const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(process.env.DATA_DIR || __dirname);
const databasePath = path.resolve(process.env.DATABASE_PATH || path.join(dataDir, 'data.db'));
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  banner TEXT DEFAULT '',
  pin TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumnIfMissing('businesses', 'template', "TEXT DEFAULT 'clasica'");
addColumnIfMissing('businesses', 'color', "TEXT DEFAULT 'blue'");
addColumnIfMissing('businesses', 'color_hex', "TEXT DEFAULT '#2563eb'");
addColumnIfMissing('businesses', 'show_network', 'INTEGER DEFAULT 0');
addColumnIfMissing('businesses', 'giro', "TEXT DEFAULT ''");
addColumnIfMissing('businesses', 'estilo', "TEXT DEFAULT 'moderno'");
addColumnIfMissing('businesses', 'color_hex2', "TEXT DEFAULT ''");
addColumnIfMissing('businesses', 'color_mode', "TEXT DEFAULT 'degradado'");
addColumnIfMissing('businesses', 'grid_cols', 'INTEGER DEFAULT 3');
addColumnIfMissing('businesses', 'plan', "TEXT DEFAULT 'free'");
addColumnIfMissing('businesses', 'import_map', "TEXT DEFAULT ''"); // memoria del último mapeo de carga masiva
addColumnIfMissing('businesses', 'wa_message', "TEXT DEFAULT ''"); // mensaje personalizado de WhatsApp (vacio = por defecto)
addColumnIfMissing('businesses', 'currency', "TEXT DEFAULT 'MXN'"); // código ISO 4217 de la moneda de la tienda
addColumnIfMissing('businesses', 'giros', "TEXT DEFAULT ''"); // giros múltiples (JSON array), el primero es el principal
addColumnIfMissing('businesses', 'plan_price', 'REAL DEFAULT 0'); // precio del plan contratado
addColumnIfMissing('businesses', 'plan_ends_at', "TEXT DEFAULT ''"); // fecha de vencimiento del plan (YYYY-MM-DD)
addColumnIfMissing('businesses', 'suspended', 'INTEGER DEFAULT 0'); // tienda suspendida por el administrador
addColumnIfMissing('businesses', 'ads_enabled', 'INTEGER DEFAULT 0'); // esta tienda se muestra como anuncio en otros catálogos
// Ajustes finos de diseño ('' = seguir el estilo visual elegido)
addColumnIfMissing('businesses', 'bg', "TEXT DEFAULT ''");      // fondo de la tienda
addColumnIfMissing('businesses', 'card', "TEXT DEFAULT ''");    // color de tarjetas de producto
addColumnIfMissing('businesses', 'text', "TEXT DEFAULT ''");    // color de texto
addColumnIfMissing('businesses', 'muted', "TEXT DEFAULT ''");   // texto secundario
addColumnIfMissing('businesses', 'border', "TEXT DEFAULT ''");  // borde de tarjetas
addColumnIfMissing('businesses', 'radius', "TEXT DEFAULT ''");  // esquinas de tarjetas
addColumnIfMissing('businesses', 'font', "TEXT DEFAULT ''");    // fuente personalizada
addColumnIfMissing('businesses', 'accent', "TEXT DEFAULT ''");      // color de botones/acento ('' = seguir el estilo o modo de color)
addColumnIfMissing('businesses', 'accent2', "TEXT DEFAULT ''");     // segundo color del degradado de botones
addColumnIfMissing('businesses', 'header', "TEXT DEFAULT ''");      // fondo de la cabecera (arriba, donde va el título)
addColumnIfMissing('businesses', 'header_text', "TEXT DEFAULT ''"); // color del texto de la cabecera
addColumnIfMissing('businesses', 'sections', "TEXT DEFAULT ''"); // secciones visibles y su orden (JSON)
addColumnIfMissing('businesses', 'demo', "TEXT DEFAULT ''"); // contenido de ejemplo para la vista previa (JSON)
addColumnIfMissing('businesses', 'pin_hash', "TEXT DEFAULT ''"); // hash del PIN (scrypt), vacío = legado sin migrar
addColumnIfMissing('businesses', 'horario', "TEXT DEFAULT ''"); // horario de atención (JSON [{d:1..7,o:'HH:MM',c:'HH:MM'}])
addColumnIfMissing('businesses', 'horario_msg', "TEXT DEFAULT ''"); // mensaje cuando la tienda está cerrada

// Sesiones con token aleatorio (el dueño y el maestro). Ya no se usa cookie estática.
db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  biz_id INTEGER,
  kind TEXT DEFAULT 'owner',
  created_at TEXT DEFAULT (datetime('now'))
);
`);
addColumnIfMissing('sessions', 'emp_id', 'INTEGER');
addColumnIfMissing('sessions', 'expires_at', 'TEXT');

// Empleados por tienda (cada uno con su PIN y permisos)
db.exec(`
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  pin_hash TEXT DEFAULT '',
  perms TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
`);

// Migración única: las tiendas preexistentes conservan plan pro
if (db.pragma('user_version', { simple: true }) < 2) {
  db.prepare(`UPDATE businesses SET plan = 'pro' WHERE plan = 'free'`).run();
  db.pragma('user_version = 2');
}

// Migración de ids de color antiguos → nuevos (con degradado)
const COLOR_MAP = { blue: 'azul', emerald: 'esmeralda', violet: 'violeta', rose: 'rosa', amber: 'ambar' };
const rows = db.prepare('SELECT id, color, color_hex FROM businesses').all();
rows.forEach(r => {
  if (COLOR_MAP[r.color]) {
    db.prepare('UPDATE businesses SET color = ? WHERE id = ?').run(COLOR_MAP[r.color], r.id);
  }
  if (!r.color_hex) {
    db.prepare('UPDATE businesses SET color_hex = ? WHERE id = ?').run('#2563eb', r.id);
  }
});

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  category_id INTEGER,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  sort INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Catálogo de atributos reutilizables por tienda (talla, color, presentación…)
CREATE TABLE IF NOT EXISTS attribute_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  vals TEXT NOT NULL DEFAULT '[]',  -- JSON array de valores
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Historial de precios y promociones (para reportes)
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  product_id INTEGER,
  name TEXT DEFAULT '',
  price REAL DEFAULT 0,
  old_price REAL,
  promo_type TEXT DEFAULT '',
  promo_gift TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
`);

addColumnIfMissing('products', 'old_price', 'REAL');
addColumnIfMissing('products', 'featured', 'INTEGER DEFAULT 0');
addColumnIfMissing('products', 'stock', 'INTEGER');  // NULL = sin control de stock
addColumnIfMissing('products', 'variants', "TEXT DEFAULT ''");  // JSON array, ej: ["Chica","Mediana","Grande"]
addColumnIfMissing('products', 'promo_ends_at', "TEXT DEFAULT ''"); // vencimiento de la promoción (YYYY-MM-DD)
addColumnIfMissing('products', 'galeria', "TEXT DEFAULT ''"); // fotos extra (JSON array de URLs)
addColumnIfMissing('products', 'promo_type', "TEXT DEFAULT ''"); // '' | descuento | porcentaje | 2x1 | 3x2 | regalo
addColumnIfMissing('products', 'promo_value', 'REAL DEFAULT 0'); // % de descuento (para porcentaje)
addColumnIfMissing('products', 'promo_gift', "TEXT DEFAULT ''"); // producto/texto de regalo (para regalo)
addColumnIfMissing('products', 'sku', "TEXT DEFAULT ''"); // código interno
addColumnIfMissing('products', 'tags', "TEXT DEFAULT ''"); // etiquetas separadas por coma (búsqueda)
addColumnIfMissing('products', 'video', "TEXT DEFAULT ''"); // URL de video (limitado, 1 por producto)
addColumnIfMissing('products', 'specs', "TEXT DEFAULT ''"); // características (una por línea: Clave: Valor)
addColumnIfMissing('products', 'barcode', "TEXT DEFAULT ''"); // código de barras (opcional)
addColumnIfMissing('products', 'payment_plan', "TEXT DEFAULT ''"); // sugerencia de pago visible al cliente, ej: 'Abonos de $200 semanales'

// Proveedores y pedidos de compra
db.exec(`
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  supplier_id INTEGER,
  items TEXT DEFAULT '',
  total REAL DEFAULT 0,
  received INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
`);
addColumnIfMissing('purchase_orders', 'received', 'INTEGER DEFAULT 0');
addColumnIfMissing('orders', 'customer_phone', "TEXT DEFAULT ''");
addColumnIfMissing('orders', 'payment_method', "TEXT DEFAULT 'contado'"); // contado | parcial | credito
addColumnIfMissing('orders', 'amount_paid', 'REAL DEFAULT 0'); // total abonado hasta ahora
addColumnIfMissing('orders', 'amount_remaining', 'REAL DEFAULT 0'); // saldo pendiente

// Clientes (mini-CRM): contactos frecuentes con su historial de pedidos
db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  items TEXT DEFAULT '',
  total REAL NOT NULL,
  customer_name TEXT DEFAULT '',
  status TEXT DEFAULT 'nuevo',
  paid INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  business_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  method TEXT DEFAULT 'abono',  -- abono | contado | credito
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  detail TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
`);

// ================= PLANES (creados por el administrador maestro) =================
db.exec(`
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  days INTEGER DEFAULT 30,
  max_products INTEGER DEFAULT -1,
  ads INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1
);
`);

// El plan decide si la tienda puede personalizar el diseño de su catálogo
addColumnIfMissing('plans', 'design', 'INTEGER DEFAULT 0');

const planCount = db.prepare('SELECT COUNT(*) AS c FROM plans').get().c;
if (planCount === 0) {
  db.prepare('INSERT INTO plans (key, name, price, days, max_products, ads) VALUES (?, ?, ?, ?, ?, ?)')
    .run('free', 'Gratis', 0, 0, 3, 1);
  db.prepare('INSERT INTO plans (key, name, price, days, max_products, ads) VALUES (?, ?, ?, ?, ?, ?)')
    .run('pro', 'Pro', 199, 30, -1, 0);
}

function seed() {
  const demoWhatsApp = String(process.env.DEMO_WHATSAPP || '').replace(/[^0-9]/g, '');
  const demoPin = String(process.env.DEMO_PIN || '');
  if (process.env.SEED_DEMO !== 'true' || !demoWhatsApp || !/^\d{6,12}$/.test(demoPin)) return;
  const existing = db.prepare('SELECT COUNT(*) AS c FROM businesses').get().c;
  if (existing > 0) return;

  const insertBiz = db.prepare(`
    INSERT INTO businesses (slug, name, whatsapp, description, pin)
    VALUES (?, ?, ?, ?, ?)
  `);
  const biz = insertBiz.run(
    'ferreteria-demo',
    'Ferretería El Toro',
    demoWhatsApp,
    'Todo para tu obra y hogar en Torreón. Envíos a toda La Laguna.',
    demoPin
  );
  const businessId = biz.lastInsertRowid;

  const insertCat = db.prepare(`
    INSERT INTO categories (business_id, name, sort) VALUES (?, ?, ?)
  `);
  const catHerramientas = insertCat.run(businessId, 'Herramientas', 1).lastInsertRowid;
  const catPintura = insertCat.run(businessId, 'Pintura', 2).lastInsertRowid;
  const catPlomeria = insertCat.run(businessId, 'Plomería', 3).lastInsertRowid;

  const insertProd = db.prepare(`
    INSERT INTO products (business_id, category_id, name, price, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const products = [
    [catHerramientas, 'Martillo de uña 16oz', 189, 'Mango de fibra, cabeza forjada.', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
    [catHerramientas, 'Desarmador plano set 6 piezas', 249, 'Set profesional con mango antiderrapante.', 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400'],
    [catHerramientas, 'Cinta métrica 5m', 129, 'Con freno y clip de bolsillo.', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
    [catPintura, 'Pintura vinílica blanca 19L', 899, 'Cubriente, lavable, interior/exterior.', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400'],
    [catPintura, 'Brocha 3 pulgadas', 69, 'Cerda sintética, durabilidad alta.', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'],
    [catPlomeria, 'Tubo PVC 1/2 pulgada 6m', 149, 'Cédula 40, uso hidráulico.', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400'],
    [catPlomeria, 'Llave de paso 1/2', 119, 'Latón pulido, rosca estándar.', 'https://images.unsplash.com/photo-1586864387734-d2ce3a8efa9e?w=400'],
    [catPlomeria, 'Sellador de tuberías 250ml', 85, 'Resistente a presión y temperatura.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400']
  ];

  for (const [cat, name, price, desc, img] of products) {
    insertProd.run(businessId, cat, name, price, desc, img);
  }
}

seed();

// Plan 'demo': muestra publicidad cruzada (como gratis) pero sin límite de productos,
// para que las tiendas de demostración se vean completas. ferreteria-demo lo usa.
db.prepare("INSERT OR IGNORE INTO plans (key, name, price, days, max_products, ads) VALUES ('demo', 'Demo', 0, 0, -1, 1)").run();
db.prepare("UPDATE businesses SET plan = 'demo' WHERE slug = 'ferreteria-demo'").run();

// Los planes de pago (pro) y la demo incluyen personalización de diseño; el gratis no.
db.prepare("UPDATE plans SET design = 1 WHERE key IN ('pro', 'demo')").run();

// ================= PÁGINAS Y PUBLICACIONES (tipo WordPress) =================
db.exec(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'personalizada',
  icon TEXT DEFAULT '',
  blocks TEXT DEFAULT '[]',
  visible_menu INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  sort INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  UNIQUE(business_id, slug)
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  page_id INTEGER,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  image TEXT DEFAULT '',
  published_at TEXT DEFAULT (datetime('now')),
  active INTEGER DEFAULT 1,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);
`);

// El negocio guarda qué preset eligió en el Modo fácil (para re-sugerir después)
addColumnIfMissing('businesses', 'giro_preset', "TEXT DEFAULT ''");
// Si el dueño ya pasó por el asistente del Modo fácil al menos una vez
addColumnIfMissing('businesses', 'onboarding_done', 'INTEGER DEFAULT 0');
// Bloques de contenido del catálogo (banner, texto, destacados…) ordenables con drag&drop
addColumnIfMissing('businesses', 'blocks', "TEXT DEFAULT '[]'");
addColumnIfMissing('businesses', 'page_bg', "TEXT DEFAULT ''");
addColumnIfMissing('businesses', 'redes', "TEXT DEFAULT '{}'");

// ============ Plantillas personalizadas del equipo ============
db.exec(`
CREATE TABLE IF NOT EXISTS custom_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📄',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  giro TEXT DEFAULT '',
  blocks_json TEXT DEFAULT '[]',
  colors_json TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  active INTEGER DEFAULT 1
);
`);
addColumnIfMissing('custom_templates', 'is_default', 'INTEGER DEFAULT 0');
db.exec("CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT)");
db.exec("INSERT OR IGNORE INTO site_config (key, value) VALUES ('default_template_id', '')");

function crearPaginasSugeridas(businessId, paginasSugeridas) {
  if (!Array.isArray(paginasSugeridas) || !paginasSugeridas.length) return;
  const insertPage = db.prepare('INSERT OR IGNORE INTO pages (business_id, slug, title, type, icon, sort) VALUES (?, ?, ?, ?, ?, ?)');
  paginasSugeridas.forEach((p, i) => {
    if (!p || !p.slug || !p.title) return;
    insertPage.run(businessId, String(p.slug), String(p.title), String(p.type || 'personalizada'), String(p.icon || ''), i);
  });
}

module.exports = db;
module.exports.databasePath = databasePath;
module.exports.crearPaginasSugeridas = crearPaginasSugeridas;
if (process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO === 'true') require('./seed-demo');
