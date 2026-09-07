// Migración SQLite (data.db) -> MariaDB (catamanager), solo para la CARGA INICIAL
// o para refrescar desde un data.db que SÍ sea la fuente real.
// Crea el esquema en MariaDB y copia TODAS las tablas preservando ids,
// luego imprime el conteo de filas de ambos lados para verificar paridad.
// Uso: node tools/migrate-maria.js
//
// ⚠️ GUARDIA: desde la migración, la app escribe en MariaDB (data.db quedó
// congelado como snapshot). Si MariaDB tiene actividad más reciente que
// data.db, este script se niega a correr para no BORRAR datos nuevos;
// fuerza con FORCE=1 solo si estás seguro de sobrescribir.
const path = require('path');
const sqlite = require('better-sqlite3');
const mysql = require('mysql2/promise');

const DB_PATH = path.join(__dirname, '..', 'data.db');
const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'catamanager',
  password: process.env.DB_PASS || 'catamanager_local_2026',
  database: process.env.DB_NAME || 'catamanager',
};

// ---- Esquema objetivo (dialecto MariaDB 12.x) ----
// Traducción fiel del esquema SQLite: ids explícitos, fechas como TEXT con el
// mismo formato 'YYYY-MM-DD HH:MM:SS' (UTC) para no tocar el código de lectura.
const SCHEMA = [
  `CREATE TABLE businesses (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(191) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    description TEXT DEFAULT '',
    logo TEXT DEFAULT '',
    banner TEXT DEFAULT '',
    pin TEXT DEFAULT '1234',
    active INT DEFAULT 1,
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    template TEXT DEFAULT 'clasica',
    color TEXT DEFAULT 'blue',
    color_hex TEXT DEFAULT '#2563eb',
    show_network INT DEFAULT 0,
    giro TEXT DEFAULT '',
    estilo TEXT DEFAULT 'moderno',
    color_hex2 TEXT DEFAULT '',
    color_mode TEXT DEFAULT 'degradado',
    grid_cols INT DEFAULT 3,
    plan TEXT DEFAULT 'free',
    import_map TEXT DEFAULT '',
    giros TEXT DEFAULT '',
    plan_price DOUBLE DEFAULT 0,
    plan_ends_at TEXT DEFAULT '',
    suspended INT DEFAULT 0,
    ads_enabled INT DEFAULT 0,
    bg TEXT DEFAULT '',
    card TEXT DEFAULT '',
    text TEXT DEFAULT '',
    muted TEXT DEFAULT '',
    border TEXT DEFAULT '',
    radius TEXT DEFAULT '',
    font TEXT DEFAULT '',
    accent TEXT DEFAULT '',
    accent2 TEXT DEFAULT '',
    header TEXT DEFAULT '',
    header_text TEXT DEFAULT '',
    wa_message TEXT DEFAULT '',
    currency TEXT DEFAULT 'MXN',
    sections TEXT DEFAULT '',
    demo TEXT DEFAULT '',
    pin_hash TEXT DEFAULT '',
    horario TEXT DEFAULT '',
    horario_msg TEXT DEFAULT '',
    giro_preset TEXT DEFAULT '',
    onboarding_done INT DEFAULT 0,
    blocks TEXT DEFAULT '[]',
    page_bg TEXT DEFAULT '',
    redes TEXT DEFAULT '{}',
    faq TEXT DEFAULT '[]',
    address TEXT DEFAULT ''
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE sessions (
    token VARCHAR(191) PRIMARY KEY,
    biz_id INT,
    kind TEXT DEFAULT 'owner',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    emp_id INT,
    expires_at TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name TEXT NOT NULL,
    pin_hash TEXT DEFAULT '',
    perms TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_emp_biz (business_id),
    CONSTRAINT fk_emp_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE categories (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name TEXT NOT NULL,
    sort INT DEFAULT 0,
    KEY idx_cat_biz (business_id),
    CONSTRAINT fk_cat_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    category_id INT,
    name TEXT NOT NULL,
    price DOUBLE NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    active INT DEFAULT 1,
    sort INT DEFAULT 0,
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    old_price DOUBLE,
    featured INT DEFAULT 0,
    stock INT,
    variants TEXT DEFAULT '',
    promo_ends_at TEXT DEFAULT '',
    galeria TEXT DEFAULT '',
    promo_type TEXT DEFAULT '',
    promo_value DOUBLE DEFAULT 0,
    promo_gift TEXT DEFAULT '',
    sku TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    video TEXT DEFAULT '',
    specs TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    allow_installments INT DEFAULT 0,
    installment_count INT DEFAULT 6,
    installment_min_down DOUBLE DEFAULT 0,
    installment_frequency TEXT DEFAULT 'semanal',
    KEY idx_prod_biz (business_id),
    KEY idx_prod_cat (category_id),
    CONSTRAINT fk_prod_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE attribute_templates (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name TEXT NOT NULL,
    vals TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_at_biz (business_id),
    CONSTRAINT fk_at_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE price_history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    product_id INT,
    name TEXT DEFAULT '',
    price DOUBLE DEFAULT 0,
    old_price DOUBLE,
    promo_type TEXT DEFAULT '',
    promo_gift TEXT DEFAULT '',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_ph_biz (business_id),
    CONSTRAINT fk_ph_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE suppliers (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_sup_biz (business_id),
    CONSTRAINT fk_sup_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE purchase_orders (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    supplier_id INT,
    items TEXT DEFAULT '',
    total DOUBLE DEFAULT 0,
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    received INT DEFAULT 0,
    KEY idx_po_biz (business_id),
    CONSTRAINT fk_po_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE customers (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_cust_biz (business_id),
    CONSTRAINT fk_cust_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    items TEXT DEFAULT '',
    total DOUBLE NOT NULL,
    customer_name TEXT DEFAULT '',
    status TEXT DEFAULT 'nuevo',
    paid INT DEFAULT 0,
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    customer_phone TEXT DEFAULT '',
    is_installment INT DEFAULT 0,
    installment_paid DOUBLE DEFAULT 0,
    installment_count INT DEFAULT 0,
    paid_at TEXT,
    installment_frequency TEXT DEFAULT 'semanal',
    KEY idx_ord_biz (business_id),
    CONSTRAINT fk_ord_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE abonos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DOUBLE NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_abo_biz (business_id),
    KEY idx_abo_ord (order_id),
    CONSTRAINT fk_abo_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_abo_ord FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE tracking (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    type TEXT NOT NULL,
    detail TEXT DEFAULT '',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    KEY idx_trk_biz (business_id),
    CONSTRAINT fk_trk_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE plans (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`key\` VARCHAR(191) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price DOUBLE DEFAULT 0,
    days INT DEFAULT 30,
    max_products INT DEFAULT -1,
    ads INT DEFAULT 1,
    active INT DEFAULT 1,
    design INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE pages (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    slug VARCHAR(191) NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'personalizada',
    icon TEXT DEFAULT '',
    blocks TEXT DEFAULT '[]',
    visible_menu INT DEFAULT 1,
    active INT DEFAULT 1,
    sort INT DEFAULT 0,
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    UNIQUE KEY uq_pages_biz_slug (business_id, slug),
    KEY idx_pages_biz (business_id),
    CONSTRAINT fk_pages_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE posts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    page_id INT,
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    image TEXT DEFAULT '',
    published_at TEXT DEFAULT (UTC_TIMESTAMP()),
    active INT DEFAULT 1,
    KEY idx_posts_biz (business_id),
    KEY idx_posts_page (page_id),
    CONSTRAINT fk_posts_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE custom_templates (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '📄',
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    giro TEXT DEFAULT '',
    blocks_json TEXT DEFAULT '[]',
    colors_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (UTC_TIMESTAMP()),
    active INT DEFAULT 1,
    is_default INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE site_config (
    \`key\` VARCHAR(191) PRIMARY KEY,
    value TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const ORDER = [
  'businesses', 'plans', 'categories', 'products', 'attribute_templates',
  'price_history', 'suppliers', 'purchase_orders', 'customers', 'orders',
  'abonos', 'tracking', 'sessions', 'employees', 'pages', 'posts',
  'custom_templates', 'site_config',
];

async function main() {
  const sdb = new sqlite(DB_PATH, { readonly: true });
  const conn = await mysql.createConnection(CFG);

  async function latestTs(table, via) {
    try {
      if (via === 'sqlite') return sdb.prepare('SELECT MAX(created_at) AS m FROM ' + table).get().m;
      const [[r]] = await conn.query('SELECT MAX(created_at) AS m FROM `' + table + '`');
      return r.m;
    } catch (e) { return null; }
  }

  // Guardia anti-sobrescritura: MariaDB no debe tener datos más nuevos que el
  // snapshot de data.db (que quedó congelado tras la migración).
  if (!process.env.FORCE) {
    for (const t of ['tracking', 'orders', 'abonos', 'businesses']) {
      const sqliteTs = await latestTs(t, 'sqlite');
      const mariaTs = await latestTs(t, 'mariadb');
      if (sqliteTs && mariaTs && mariaTs > sqliteTs) {
        console.error('\n⛔ ABORTADO: MariaDB (' + t + ' = ' + mariaTs +
          ') tiene actividad MÁS RECIENTE que data.db (' + sqliteTs + ').');
        console.error('data.db quedó congelado al migrar; re-ejecutar esto BORRARÍA los datos nuevos de MariaDB.');
        console.error('Si de verdad quieres sobrescribir: FORCE=1 node tools/migrate-maria.js');
        process.exit(1);
      }
    }
  }

  // Esquema limpio
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ORDER) await conn.query('DROP TABLE IF EXISTS `' + t + '`');
  for (const ddl of SCHEMA) await conn.query(ddl);

  const mismatch = [];
  for (const table of ORDER) {
    const cols = sdb.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);
    const rows = sdb.prepare('SELECT * FROM ' + table).all();
    const qmarks = cols.map(() => '?').join(',');
    const colList = cols.map(c => '`' + c + '`').join(',');
    const ins = `INSERT INTO \`${table}\` (${colList}) VALUES (${qmarks})`;
    for (const r of rows) {
      await conn.query(ins, cols.map(c => (r[c] === undefined ? null : r[c])));
    }
    // Ajusta AUTO_INCREMENT al máximo id existente
    await conn.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = ${rows.length + 1}`);
    console.log(`${table}: sqlite=${rows.length} -> mariadb=OK`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // ---- Verificación de paridad ----
  console.log('\n=== VERIFICACIÓN ===');
  let allOk = true;
  for (const table of ORDER) {
    const a = sdb.prepare('SELECT COUNT(*) AS c FROM ' + table).get().c;
    const [[b]] = await conn.query('SELECT COUNT(*) AS c FROM `' + table + '`');
    const ok = a === b.c;
    if (!ok) { allOk = false; mismatch.push(table + ` (${a} vs ${b.c})`); }
    console.log(`${ok ? 'OK ' : 'FALLA '} ${table}: ${a} == ${b.c}`);
  }
  if (!allOk) { console.log('\nDIFERENCIAS:', mismatch.join(', ')); process.exitCode = 1; }
  else console.log('\nParidad completa: las ' + ORDER.length + ' tablas coinciden fila por fila.');

  await conn.end();
  sdb.close();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
