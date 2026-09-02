'use strict';

const VALID_FREQUENCIES = new Set(['diario', 'semanal', 'quincenal', 'mensual']);

function buildPaymentPlan(body = {}) {
  const total = Number.parseFloat(body.payment_amount);
  const freq = String(body.payment_freq || '').trim();
  const num = Number.parseInt(body.payment_num, 10);
  if (!Number.isFinite(total) || total <= 0 || !VALID_FREQUENCIES.has(freq) || !Number.isInteger(num) || num <= 0) return '';
  const amount = Math.round((total / num) * 100) / 100;
  return JSON.stringify({ total, amount, freq, num });
}

module.exports = { buildPaymentPlan };
