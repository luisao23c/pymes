'use strict';

const path = require('path');
const Database = require('better-sqlite3');
const mariadb = require('mariadb');
const { loadEnv } = require('../config/runtime');

loadEnv(path.resolve(__dirname, '..'));

const sourcePath = path.resolve(process.env.SQLITE_SOURCE || path.join(__dirname, '..', 'data.db'));
const force = process.argv.includes('--force');

function quoteId(value) {
  return '`' + String(value).replace(/`/g, '``') + '`';
}

function mariaType(column) {
  const type = String(column.type || '').toUpperCase();
  if (column.pk && type.includes('INT')) return 'BIGINT NOT NULL AUTO_INCREMENT';
  if (column.pk) return 'VARCHAR(191) NOT NULL';
  if (/^(created_at|published_at|expires_at)$/.test(column.name)) return 'DATETIME';
  // Estas fechas admiten cadena vacía en la aplicación existente.
  if (/_ends_at$/.test(column.name)) return 'VARCHAR(32)';
  if (type.includes('INT')) return 'BIGINT';
  if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB') || type.includes('NUM')) return 'DECIMAL(18,4)';
  if (type.includes('BLOB')) return 'LONGBLOB';
  return 'LONGTEXT';
}

function mariaDefault(column) {
  if (column.dflt_value == null) return '';
  const value = String(column.dflt_value).trim();
  if (/^datetime\(['"]now['"]\)$/i.test(value) || /^CURRENT_TIMESTAMP$/i.test(value)) return ' DEFAULT CURRENT_TIMESTAMP';
  if (/^NULL$/i.test(value)) return ' DEFAULT NULL';
  if (/^-?\d+(\.\d+)?$/.test(value)) return ' DEFAULT ' + value;
  if (/^'.*'$/.test(value)) return ' DEFAULT ' + value;
  return '';
}

function tableDefinition(sqlite, table) {
  const columns = sqlite.prepare(`PRAGMA table_info(${quoteId(table)})`).all();
  const definitions = columns.map((column) => {
    const primary = column.pk ? ' PRIMARY KEY' : '';
    const required = column.notnull && !column.pk ? ' NOT NULL' : '';
    return `${quoteId(column.name)} ${mariaType(column)}${required}${mariaDefault(column)}${primary}`;
  });
  return { columns, sql: `CREATE TABLE ${quoteId(table)} (\n  ${definitions.join(',\n  ')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` };
}

async function ensureEmptyTarget(connection, tables) {
  const rows = await connection.query(
    'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
    [process.env.DB_NAME]
  );
  if (!rows.length) return;
  if (!force) {
    throw new Error('La base MariaDB no está vacía. Usa otra base o ejecuta con --force si deseas reemplazarla completamente.');
  }
  await connection.query('SET FOREIGN_KEY_CHECKS=0');
  for (const row of rows) await connection.query(`DROP TABLE ${quoteId(row.name)}`);
  await connection.query('SET FOREIGN_KEY_CHECKS=1');
}

async function copyTable(sqlite, connection, table) {
  const { columns, sql } = tableDefinition(sqlite, table);
  await connection.query(sql);
  const rows = sqlite.prepare(`SELECT * FROM ${quoteId(table)}`).all();
  if (!rows.length) return 0;

  const names = columns.map((column) => column.name);
  const placeholders = names.map(() => '?').join(',');
  const insert = `INSERT INTO ${quoteId(table)} (${names.map(quoteId).join(',')}) VALUES (${placeholders})`;
  for (const row of rows) {
    await connection.query(insert, names.map((name) => row[name]));
  }
  return rows.length;
}

async function copyUniqueIndexes(sqlite, connection, table) {
  const indexes = sqlite.prepare(`PRAGMA index_list(${quoteId(table)})`).all().filter((index) => index.unique);
  const definitions = new Map(sqlite.prepare(`PRAGMA table_info(${quoteId(table)})`).all().map((column) => [column.name, column]));
  for (const index of indexes) {
    const columns = sqlite.prepare(`PRAGMA index_info(${quoteId(index.name)})`).all().map((item) => item.name).filter(Boolean);
    if (!columns.length) continue;
    const name = ('uq_' + table + '_' + columns.join('_')).slice(0, 60);
    const indexedColumns = columns.map((column) => {
      const definition = definitions.get(column);
      const type = String((definition && definition.type) || '').toUpperCase();
      return quoteId(column) + ((!definition.pk && (type.includes('TEXT') || type.includes('BLOB'))) ? '(191)' : '');
    });
    await connection.query(`CREATE UNIQUE INDEX ${quoteId(name)} ON ${quoteId(table)} (${indexedColumns.join(',')})`);
  }
}

async function main() {
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (!process.env[key]) throw new Error(`Falta ${key} en el archivo .env`);
  }

  const sqlite = new Database(sourcePath, { readonly: true });
  const connection = await mariadb.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: false
  });

  try {
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((row) => row.name);
    await ensureEmptyTarget(connection, tables);
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    let total = 0;
    for (const table of tables) {
      const copied = await copyTable(sqlite, connection, table);
      total += copied;
      console.log(`${table}: ${copied} registros`);
    }
    for (const table of tables) await copyUniqueIndexes(sqlite, connection, table);
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    await connection.commit();
    console.log(`Migración terminada: ${tables.length} tablas y ${total} registros copiados.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    sqlite.close();
    await connection.end();
  }
}

main().catch((error) => {
  console.error('No se pudo migrar:', error.message);
  process.exitCode = 1;
});
