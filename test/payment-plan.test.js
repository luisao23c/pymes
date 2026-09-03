'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPaymentPlan } = require('../lib/payment-plan');

test('$300 en 3 pagos semanales produce cuotas de $100', () => {
  const plan = JSON.parse(buildPaymentPlan({ payment_amount: '300', payment_freq: 'semanal', payment_num: '3' }));
  assert.deepEqual(plan, { total: 300, amount: 100, freq: 'semanal', num: 3 });
});

test('rechaza planes incompletos o frecuencias desconocidas', () => {
  assert.equal(buildPaymentPlan({ payment_amount: '300', payment_freq: 'semanal' }), '');
  assert.equal(buildPaymentPlan({ payment_amount: '300', payment_freq: 'cada-rato', payment_num: '3' }), '');
});
