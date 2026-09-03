'use strict';

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'nessik_catalogo',
  user: process.env.DB_USER || 'nessik_app',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4',
  bigIntAsNumber: true,
  insertIdAsNumber: true,
  decimalAsNumber: true,
  dateStrings: true
});

function normalizeSql(sql) {
  return String(sql)
    .replace(/(?<!`)\bkey\b(?!`)/gi, '`key`')
    .replace(/\bINSERT\s+OR\s+IGNORE\b/gi, 'INSERT IGNORE')
    .replace(/\bINSERT\s+OR\s+REPLACE\b/gi, 'REPLACE')
    .replace(/\bRANDOM\(\)/gi, 'RAND()')
    .replace(/\s+COLLATE\s+NOCASE\b/gi, ' COLLATE utf8mb4_unicode_ci')
    .replace(/datetime\(\s*'now'\s*,\s*'-([0-9]+) days?'\s*\)/gi, 'DATE_SUB(NOW(), INTERVAL $1 DAY)')
    .replace(/datetime\(\s*'now'\s*\)/gi, 'NOW()')
    .replace(/date\(\s*'now'\s*\)/gi, 'CURDATE()');
}

function paramsOf(args) {
  const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return params.map((value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
      return value.slice(0, 19).replace('T', ' ');
    }
    return value;
  });
}

function prepare(sql) {
  const statement = normalizeSql(sql);
  return {
    async get(...args) {
      const rows = await pool.query(statement, paramsOf(args));
      return rows[0];
    },
    async all(...args) {
      return pool.query(statement, paramsOf(args));
    },
    async run(...args) {
      const result = await pool.query(statement, paramsOf(args));
      return {
        changes: Number(result.affectedRows || 0),
        lastInsertRowid: Number(result.insertId || 0)
      };
    }
  };
}

async function query(sql, params = []) {
  return pool.query(normalizeSql(sql), params);
}

async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const tx = {
      prepare(sql) {
        const statement = normalizeSql(sql);
        return {
          get: async (...args) => (await connection.query(statement, paramsOf(args)))[0],
          all: async (...args) => connection.query(statement, paramsOf(args)),
          run: async (...args) => {
            const result = await connection.query(statement, paramsOf(args));
            return { changes: Number(result.affectedRows || 0), lastInsertRowid: Number(result.insertId || 0) };
          }
        };
      }
    };
    const result = await work(tx);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function healthcheck() {
  await pool.query('SELECT 1');
  return true;
}

module.exports = { prepare, query, transaction, healthcheck, close: () => pool.end(), normalizeSql };
