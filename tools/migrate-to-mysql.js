'use strict';
// Migración catamanager: MariaDB (origen, 3306) -> MySQL 8 (destino, 3307).
//
// La fuente de verdad del esquema es la BASE REAL de MariaDB (SHOW CREATE TABLE),
// no el DDL de arranque de db.js (que es dialecto SQLite y solo crea tablas
// nuevas). Pasos:
//   1) Lee el CREATE TABLE de cada tabla en MariaDB y lo adapta a MySQL 8
//      (defaults de columnas largas entre paréntesis, sin ancho de enteros).
//   2) Crea las tablas en MySQL (con FK checks desactivados) y copia las filas
//      preservando ids (multi-INSERT por lotes con columnas explícitas).
//   3) Compara conteos fila a fila y lo reporta.
//
// Uso: node tools/migrate-to-mysql.js
// Origen (MariaDB) : DB_SRC_HOST/DB_SRC_PORT/DB_SRC_USER/DB_SRC_PASS/DB_SRC_NAME
//                     (por defecto 127.0.0.1:3306 root sin pass / catamanager)
// Destino (MySQL)  : DB_DST_HOST/DB_DST_PORT/DB_DST_USER/DB_DST_PASS/DB_DST_NAME
//                     (por defecto 127.0.0.1:3307 catamanager/catamanager_local_2026/catamanager)
const mysql = require('mysql2/promise');

const SRC = {
  host: process.env.DB_SRC_HOST || '127.0.0.1',
  port: Number(process.env.DB_SRC_PORT || 3306),
  user: process.env.DB_SRC_USER || 'root',
  password: process.env.DB_SRC_PASS || '',
  database: process.env.DB_SRC_NAME || 'catamanager',
  charset: 'utf8mb4',
  dateStrings: true,
};
const DST = {
  host: process.env.DB_DST_HOST || '127.0.0.1',
  port: Number(process.env.DB_DST_PORT || 3307),
  user: process.env.DB_DST_USER || 'catamanager',
  password: process.env.DB_DST_PASS || 'catamanager_local_2026',
  database: process.env.DB_DST_NAME || 'catamanager',
  charset: 'utf8mb4',
  dateStrings: true,
};

// Adapta el CREATE TABLE de MariaDB 12 a MySQL 8.
function adaptDDL(ddl) {
  let s = ddl;
  // 1) Anchos de enteros (int(11) -> int): deprecado en MySQL 8.
  s = s.replace(/\b(bigint|int|mediumint|smallint|tinyint)\(\d+\)/gi, '$1');
  // 2) DEFAULT utc_timestamp() en columnas largas -> DEFAULT (UTC_TIMESTAMP())
  s = s.replace(/\bDEFAULT\s+utc_timestamp\(\)/gi, 'DEFAULT (UTC_TIMESTAMP())');
  // 3) Defaults literales en columnas BLOB/TEXT/JSON: MySQL 8 solo los acepta
  //    como expresión entre paréntesis. Se envuelven TODOS los literales para
  //    que sea uniforme y válido en ambos motores.
  s = s.replace(/DEFAULT\s+('(?:[^'\\]|\\.|'')*')/g, 'DEFAULT ($1)');
  // 4) Quitar cláusulas específicas de MariaDB que MySQL no conoce.
  s = s.replace(/\s*PAGE_COMPRESSED=\d+/gi, '');
  s = s.replace(/\s*COMMENT\s*=\s*'[^']*'/gi, '');
  s = s.replace(/\/\*![^*]*\*\//g, '');
  return s.trim();
}

async function tables(conn, dbName) {
  const [r] = await conn.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = ? ORDER BY table_name`, [dbName]);
  return r.map(x => x.table_name);
}

// Columnas reales de una tabla (SHOW COLUMNS funciona también en tablas vacías).
async function columns(conn, table) {
  const [r] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
  return r.map(x => x.Field);
}

async function countRows(conn, table) {
  const [r] = await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``);
  return r[0].c;
}

(async () => {
  const src = await mysql.createConnection(SRC);
  const dst = await mysql.createConnection(DST);
  // Modo permisivo (igual que la app): sin ONLY_FULL_GROUP_BY ni estricto.
  await src.query("SET SESSION sql_mode = ''");
  await dst.query("SET SESSION sql_mode = ''");
  console.log('Origen :', SRC.host + ':' + SRC.port + '/' + SRC.database, '(MariaDB)');
  console.log('Destino:', DST.host + ':' + DST.port + '/' + DST.database, '(MySQL)');

  const srcTables = await tables(src, SRC.database);

  // ---- 1) Limpiar el destino (por si quedó algo de un intento previo) -----
  await dst.query('SET FOREIGN_KEY_CHECKS = 0');
  const [dstList] = await dst.query('SHOW TABLES');
  const dstTables = dstList.map(r => Object.values(r)[0]);
  for (const t of dstTables) await dst.query(`DROP TABLE IF EXISTS \`${t}\``);
  const [check] = await dst.query('SHOW TABLES');
  console.log('\nDestino limpio. (quedan ' + check.length + ' tablas)');

  // ---- 2) Recrear esquema desde el SHOW CREATE real de MariaDB ------------
  for (const t of srcTables) {
    const [r] = await src.query(`SHOW CREATE TABLE \`${t}\``);
    let ddl = adaptDDL(r[0]['Create Table']);
    try {
      await dst.query(ddl);
      console.log(`  creada  ${t}`);
    } catch (e) {
      console.log(`  ❌ FALLO creando ${t}: ${e.message}`);
      console.log('     DDL:', ddl.slice(0, 400));
      process.exit(1);
    }
  }

  // ---- 3) Copiar filas preservando ids ------------------------------------
  let total = 0;
  for (const t of srcTables) {
    const n = await countRows(src, t);
    if (n === 0) { console.log(`\n${t.padEnd(22)} -> 0 filas (vacía)`); continue; }
    const srcCols = await columns(src, t);
    const dstCols = await columns(dst, t);
    const shared = srcCols.length ? srcCols.filter(c => dstCols.includes(c)) : dstCols;
    const colList = shared.map(c => '`' + c + '`').join(', ');
    const B = 500;
    let offset = 0, copied = 0;
    while (offset < n) {
      const [rows] = await src.query(`SELECT * FROM \`${t}\` LIMIT ${B} OFFSET ${offset}`);
      if (!rows.length) break;
      const values = [];
      for (const row of rows) values.push(shared.map(c => row[c] === undefined ? null : row[c]));
      await dst.query(`INSERT INTO \`${t}\` (${colList}) VALUES ?`, [values]);
      copied += rows.length;
      offset += B;
    }
    total += copied;
    const dstN = await countRows(dst, t);
    const ok = dstN === n && copied === n ? '✅' : '❌';
    console.log(`\n${t.padEnd(22)} -> ${copied}/${n} filas | destino ${dstN} ${ok}`);
    if (dstN !== n) console.log(`   ⚠️  DISCREPANCIA en ${t}: origen ${n}, destino ${dstN}`);
  }

  // Reactivar FK (los ids insertados ya avanzan el AUTO_INCREMENT en MySQL).
  await dst.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log(`\nTotal filas copiadas: ${total}`);
  await src.end();
  await dst.end();
  process.exit(0);
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
