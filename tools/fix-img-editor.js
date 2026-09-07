const fs = require('fs');

function edit(path, fn) {
  const c = fs.readFileSync(path, 'utf8');
  const out = fn(c);
  if (out === c) { console.log('SIN CAMBIOS: ' + path); return; }
  fs.writeFileSync(path, out);
  console.log('OK: ' + path);
}

const INC = {
  biz: (z) => `  <%- include('partials/img-editor', { upUrl: '/' + biz.slug + '/admin/upload', z: ${z} }) %>`,
  maestro: (z) => `  <%- include('partials/img-editor', { upUrl: (esMaestro ? '/maestro/' + biz.id + '/upload' : '/' + biz.slug + '/admin/upload'), z: ${z} }) %>`
};
const NL = '\r\n';

/* ============ 1) productos.ejs ============ */
edit('views/productos.ejs', (c) => {
  // HTML del editor viejo -> include + hook (renderFotos refresca miniaturas/hidden tras aplicar sobre un contenedor)
  const hs = c.indexOf('  <!-- Editor de imagen -->');
  const he = c.indexOf("  <%- include('admin/panel-ajax')");
  if (hs < 0 || he < 0) { console.log('SKIP (ya editado o sin marcadores): productos'); return c; }
  if (he <= hs) throw new Error('productos: marcadores HTML fuera de orden');
  const htmlNew = INC.biz(130) + NL +
    '  <script>window.imgeContainerApplied = function () { if (typeof renderFotos === \'function\') renderFotos(\'f\'); };</script>' + NL + NL;
  c = c.slice(0, hs) + htmlNew + c.slice(he);

  // JS del editor viejo (todo el bloque hasta imgInitDrag();)
  const jsS = c.indexOf('    // ====== Editor de imagen (zoom / ajustar / expandir / recortar / rotar) ======');
  const jsE = c.indexOf('    imgInitDrag();');
  if (jsS < 0 || jsE < 0) throw new Error('productos: no se encontraron marcadores JS');
  c = c.slice(0, jsS) + c.slice(jsE + '    imgInitDrag();'.length);
  return c;
});

/* ============ 2) config.ejs ============ */
edit('views/config.ejs', (c) => {
  // CSS viejo
  const cssS = c.indexOf('.img-editor-overlay{position:fixed;');
  const cssRuleEnd = c.indexOf('margin:0 2px;}', cssS);
  if (cssS < 0 || cssRuleEnd < 0) throw new Error('config: no se encontró CSS');
  const cssE = c.indexOf('\n', cssRuleEnd) + 1; // incluye el salto de línea
  c = c.slice(0, cssS) + c.slice(cssE);

  // HTML overlay viejo -> include (upUrl depende de esMaestro en config)
  const hs = c.indexOf('  <!-- Editor de imagen (logo / banner) -->');
  const he = c.indexOf('<script>', hs);
  if (hs < 0 || he < 0) { console.log('SKIP (ya editado o sin marcadores): config'); return c; }
  if (he <= hs) throw new Error('config: marcadores HTML fuera de orden');
  const htmlNew = INC.maestro(9000) + NL;
  c = c.slice(0, hs) + htmlNew + c.slice(he);

  // JS del editor viejo: desde `var imgEditor` hasta justo antes de `function subirConEditor`
  const jsS = c.indexOf('    var imgEditor = {');
  const jsE = c.indexOf('    function subirConEditor');
  if (jsS < 0 || jsE < 0 || jsE <= jsS) throw new Error('config: no se encontraron marcadores JS');
  c = c.slice(0, jsS) + c.slice(jsE);

  // Quitar la invocación suelta `imgInitDrag();` que quedaba tras subirConEditor
  const dS = c.indexOf('    imgInitDrag();');
  if (dS >= 0) c = c.slice(0, dS) + c.slice(dS + '    imgInitDrag();'.length);
  return c;
});

/* ============ 3) diseno.ejs ============ */
edit('views/diseno.ejs', (c) => {
  // CSS viejo (líneas .img-editor-* hasta .img-editor-foot .btn-primary:hover)
  const cssS = c.indexOf('.img-editor-overlay{position:fixed;');
  const cssRuleEnd = c.indexOf('var(--wp-accent-dark);}', cssS);
  if (cssS < 0 || cssRuleEnd < 0) throw new Error('diseno: no se encontró CSS');
  const cssE = c.indexOf('\n', cssRuleEnd) + 1;
  c = c.slice(0, cssS) + c.slice(cssE);

  // HTML overlay viejo -> include + hook (diseno llama guardarImagenLocal tras subir la imagen editada)
  const hs = c.indexOf('  <!-- ===== EDITOR DE IMAGEN ===== -->');
  const he = c.indexOf('  <!-- ===== PLANTILLAS ===== -->');
  if (hs < 0 || he < 0) { console.log('SKIP (ya editado o sin marcadores): diseno'); return c; }
  if (he <= hs) throw new Error('diseno: marcadores HTML fuera de orden');
  const htmlNew = INC.maestro(430) + NL +
    '  <script>window.imgeUploaded = function (u) { if (typeof guardarImagenLocal === \'function\') { try { guardarImagenLocal(u); } catch (e) {} } };</script>' + NL + NL;
  c = c.slice(0, hs) + htmlNew + c.slice(he);

  // JS del editor viejo (desde el comentario del bloque hasta imgInitDrag();)
  const jsS = c.indexOf('  /* ===== EDITOR DE IMAGEN (zoom / ajustar / expandir / rotar / voltear) ===== */');
  const jsE = c.indexOf('  imgInitDrag();');
  if (jsS < 0 || jsE < 0) throw new Error('diseno: no se encontraron marcadores JS');
  c = c.slice(0, jsS) + c.slice(jsE + '  imgInitDrag();'.length);
  return c;
});

console.log('Listo.');
