'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanOrderText, buildOrderMessage } = require('../lib/order-message');

test('elimina emojis y caracteres dañados', () => {
  const result = cleanOrderText('Hola Ferretería El Toro! 👋 � Quiero pedir');
  assert.equal(result, 'Hola Ferretería El Toro! Quiero pedir');
});

test('genera un pedido limpio con total', () => {
  const result = buildOrderMessage('Ferretería El Toro', ['- 1 x Tubo = $100.00'], 100, '', '$');
  assert.match(result, /Ferretería El Toro/);
  assert.match(result, /Total: \$100\.00/);
  assert.doesNotMatch(result, /[�👋🛒]/u);
});

test('limpia también una plantilla personalizada', () => {
  const result = buildOrderMessage('El Toro', ['- Producto'], 50, 'Hola {tienda} 👋 �\n{productos}\n{total}', '$');
  assert.equal(result, 'Hola El Toro\n- Producto\n$50.00');
});
