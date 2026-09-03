'use strict';

function cleanOrderText(value) {
  return String(value == null ? '' : value)
    .replace(/\uFFFD/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\uFE0E\uFE0F\u200D]/g, '')
    .replace(/ðŸ[^\s]*/g, '')
    .replace(/â€¢/g, '-')
    .replace(/â€”|â€“/g, '-')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildOrderMessage(storeName, lines, total, template, sym) {
  const lista = lines.map(cleanOrderText).join('\n');
  const totalStr = (sym || '$') + Number(total || 0).toFixed(2);
  const custom = (template && String(template).trim()) ? String(template).trim() : '';
  if (custom) {
    return cleanOrderText(custom
      .replace(/\{tienda\}/g, storeName)
      .replace(/\{productos\}/g, lista)
      .replace(/\{total\}/g, totalStr));
  }
  return `Hola ${cleanOrderText(storeName)}, quiero realizar el siguiente pedido:\n\n${lista}\n\nTotal: ${totalStr}\n\n¿Me confirma disponibilidad y entrega, por favor?`;
}

module.exports = { cleanOrderText, buildOrderMessage };
