'use strict';

const crypto = require('crypto');

function cookieParser(req, res, next) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  req.cookies = out;
  next();
}

function createCsrfProtection(isProduction) {
  return function csrfProtection(req, res, next) {
    if (!req.cookies.csrf) {
      req.cookies.csrf = crypto.randomBytes(24).toString('hex');
      res.cookie('csrf', req.cookies.csrf, { httpOnly: false, sameSite: 'lax', secure: isProduction, path: '/' });
    }
    res.locals.csrf = req.cookies.csrf;

    if (req.method !== 'POST') return next();
    const requestPath = req.path;
    if (requestPath === '/registrar' || requestPath === '/maestro' || requestPath === '/maestro/cerrar') return next();
    if (requestPath.endsWith('/admin')) return next();
    if (!/^\/[^/]+\/admin(\/|$)/.test(requestPath) && !/^\/maestro\//.test(requestPath)) return next();
    if (req.is('multipart/form-data')) return next();
    return verifyBodyCsrf(req, res, next);
  };
}

function verifyBodyCsrf(req, res, next) {
  const token = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  if (!token || token !== req.cookies.csrf) {
    return res.status(403).send('Solicitud rechazada: token de seguridad inválido. Recarga la página e intenta de nuevo.');
  }
  next();
}

function createRateLimiter() {
  const requests = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests) {
      const recent = timestamps.filter((time) => now - time < 60000);
      if (recent.length) requests.set(key, recent);
      else requests.delete(key);
    }
  }, 300000);
  cleanup.unref();

  return function rateLimit(maxPerMin) {
    return function limitRequest(req, res, next) {
      const key = (req.ip || req.connection.remoteAddress || 'unknown') + ':' + req.path;
      const now = Date.now();
      const recent = (requests.get(key) || []).filter((time) => now - time < 60000);
      if (recent.length >= maxPerMin) {
        return res.status(429).json({ error: 'Demasiadas peticiones. Intenta en 1 minuto.' });
      }
      recent.push(now);
      requests.set(key, recent);
      next();
    };
  };
}

module.exports = { cookieParser, createCsrfProtection, createRateLimiter, verifyBodyCsrf };
