// ============================================================================
// SISTEMA DE PLANTILLAS — v2
// ----------------------------------------------------------------------------
// Antes: cada plantilla repetía ~40 líneas de CSS casi idénticas (hero, grid
// de categorías, botón, pcard) con solo el color cambiado. 15 plantillas ×
// ~40 líneas de boilerplate duplicado = un cambio (ej. agregar :focus-visible
// a los botones) había que hacerlo 15 veces.
//
// Ahora: SHARED_CSS se escribe una sola vez y usa custom properties (--t-*).
// Cada plantilla solo define TOKENS (colores, tipografías, radios) y,
// donde de verdad aporta identidad de marca, un pequeño `extraCss` bespoke.
//
// Compatibilidad: TPL_META sigue teniendo exactamente los mismos campos que
// ya consumen diseno.ejs y components.ejs (id, nombre, emoji, dark, accent,
// accent2, bg, card, text, muted, border, radius, headFont, bodyFont,
// fontLink, css, dept, figuraTpl, nav, stack). No hay que tocar los .ejs.
// ============================================================================

// ---------------------------------------------------------------------------
// 1) CSS COMPARTIDO — se genera una vez, todas las plantillas lo heredan.
// ---------------------------------------------------------------------------
const { MASCARA_CSS: _MASCARA_CSS_FROM_MODULE } = require('./lib/mascara');
const SHARED_CSS = `
.ct-hero{display:grid;grid-template-columns:1.08fr .92fr;gap:44px;align-items:center;padding:52px 8px 36px;}
.ct-hero-single{grid-template-columns:1fr;text-align:center;max-width:780px;margin:0 auto;}
.ct-eyebrow{display:inline-block;padding:7px 16px;font-weight:800;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;border-radius:999px;background:var(--t-eyebrow-bg, color-mix(in srgb, var(--t-accent) 12%, transparent));color:var(--t-eyebrow-color, var(--t-accent));margin-bottom:16px;}
.ct-hero h2{font-family:var(--t-head);font-weight:700;font-size:clamp(2.3rem,5vw,3.8rem);line-height:1.04;margin:0 0 16px;letter-spacing:-.01em;color:var(--t-text);}
.ct-hero p{font-size:1.05rem;max-width:42ch;color:var(--t-muted);margin-bottom:24px;}
.ct-hero-single p{margin-left:auto;margin-right:auto;}

.ct-btn{display:inline-flex;align-items:center;gap:8px;background:var(--t-btn-bg, linear-gradient(135deg,var(--t-accent),var(--t-accent2)));color:var(--t-btn-text,#fff);padding:14px 28px;border-radius:var(--t-btn-radius,999px);font-weight:800;font-size:.92rem;text-decoration:none;border:var(--t-btn-border,none);box-shadow:0 14px 28px rgba(0,0,0,.14);transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;cursor:pointer;}
.ct-btn:hover{transform:translateY(-2px);filter:brightness(1.05);box-shadow:0 18px 32px rgba(0,0,0,.18);}
.ct-btn:active{transform:translateY(0);}
.ct-btn:focus-visible{outline:3px solid var(--t-accent);outline-offset:3px;}

.ct-fig{position:relative;height:330px;display:flex;align-items:center;justify-content:center;}

/* mixin genérico para plantillas de "3 formas flotando" (frutas, viajes,
   peluquería, spa, dentista, veterinaria, eventos, limpieza, construcción...) */
.ct-shapes{position:relative;width:100%;height:290px;}
.ct-shape{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;text-align:center;font-size:.82rem;padding:0 12px;border-radius:var(--t-shape-radius,28px);box-shadow:0 16px 30px rgba(0,0,0,.12);}
.ct-shape.s1{width:180px;height:180px;left:16px;top:22px;background:linear-gradient(135deg,var(--t-accent),color-mix(in srgb, var(--t-accent) 60%, black));}
.ct-shape.s2{width:132px;height:132px;right:10px;top:4px;background:linear-gradient(135deg,var(--t-accent2),color-mix(in srgb, var(--t-accent2) 60%, black));}
.ct-shape.s3{width:106px;height:106px;left:38%;bottom:4px;background:var(--t-shape3, var(--t-card));color:var(--t-shape3-text, var(--t-text));}

.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
.pcard{background:var(--t-card);border:1px solid var(--t-border);border-radius:var(--t-radius,18px);padding:24px 18px;text-align:center;box-shadow:0 10px 22px rgba(15,15,15,.05);transition:transform .18s ease,box-shadow .18s ease;}
.pcard:hover{transform:translateY(-4px);box-shadow:0 18px 30px rgba(15,15,15,.09);}
.pcard .circ{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,var(--t-accent),var(--t-accent2));margin:0 auto 14px;}
.pcard:nth-child(2) .circ{background:linear-gradient(135deg,var(--t-accent2),var(--t-accent));}
.pcard:nth-child(3) .circ{background:var(--t-accent);opacity:.78;}
.pcard:nth-child(4) .circ{background:var(--t-text);opacity:.7;}
.pcard h3{font-family:var(--t-head);font-size:1.12rem;margin:0 0 4px;color:var(--t-text);}
.pcard p{color:var(--t-muted);font-size:.9rem;margin:0;}

.product-card,.offer-card{border:1px solid var(--t-border)!important;box-shadow:0 10px 22px rgba(15,15,15,.05)!important;transition:transform .18s ease,box-shadow .18s ease;}
.product-card:hover,.offer-card:hover{transform:translateY(-4px);box-shadow:0 18px 30px rgba(15,15,15,.1)!important;}

a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--t-accent);outline-offset:2px;}

@media(max-width:860px){
  .ct-hero{grid-template-columns:1fr;}
  .ct-fig,.ct-shapes{height:220px;}
  .grid4{grid-template-columns:repeat(2,1fr);}
}
@media(prefers-reduced-motion:reduce){
  .ct-btn,.pcard,.product-card,.offer-card{transition:none;}
}
` + _MASCARA_CSS_FROM_MODULE;

// Figura compartida para el grupo de "3 formas flotando".
const SHAPES_FIG_TPL = '<div class="ct-shapes"><div class="ct-shape s1">{0}</div><div class="ct-shape s2">{1}</div><div class="ct-shape s3">{2}</div></div>';

function rootVars(t) {
  let v = `:root{--t-accent:${t.accent};--t-accent2:${t.accent2};--t-bg:${t.bg};--t-text:${t.text};--t-muted:${t.muted};--t-card:${t.card};--t-border:${t.border};--t-radius:${t.radius};--t-head:${t.headFont};--t-body:${t.bodyFont};`;
  if (t.shapeRadius) v += `--t-shape-radius:${t.shapeRadius};`;
  if (t.shape3) v += `--t-shape3:${t.shape3};`;
  if (t.shape3Text) v += `--t-shape3-text:${t.shape3Text};`;
  if (t.eyebrowBg) v += `--t-eyebrow-bg:${t.eyebrowBg};`;
  if (t.eyebrowColor) v += `--t-eyebrow-color:${t.eyebrowColor};`;
  if (t.btnBg) v += `--t-btn-bg:${t.btnBg};`;
  if (t.btnText) v += `--t-btn-text:${t.btnText};`;
  if (t.btnRadius) v += `--t-btn-radius:${t.btnRadius};`;
  if (t.btnBorder) v += `--t-btn-border:${t.btnBorder};`;
  v += `}`;
  return v;
}
function buildCss(t) { return rootVars(t) + SHARED_CSS + (t.extraCss || ''); }

// ---------------------------------------------------------------------------
// 2) TOKENS POR PLANTILLA
// ---------------------------------------------------------------------------
// Grupo A — usan el mixin de "3 formas flotando" compartido. Antes: ~40
// líneas de CSS cada una. Ahora: solo tokens.
// ---------------------------------------------------------------------------

const TOKENS = {

  fotografia: {
    id: 'fotografia', nombre: 'Fotografía', emoji: '📸', dark: false, caso: 'portafolio',
    fontLink: 'Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800',
    headFont: "'Poppins', sans-serif", bodyFont: "'Inter', sans-serif",
    bg: '#f6f5f0', text: '#1a1816', muted: '#6b7280', card: '#ffffff', border: 'rgba(0,0,0,0.06)',
    accent: '#f59e0b', accent2: '#818cf8', radius: '20px',
    dept: { title: 'Servicios', subtitle: 'Cada sesión cuenta una historia.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    stack: [
      { id: 'st-h', type: 'imagen', image: '', title: 'Luz & Cámara Fotografía de bodas, retratos y eventos', height: 'normal', width: 'full', shadow: 'media', captionPos: 'bottom-left', captionColor: '#ededed', captionSize: 32 },
      { id: 'st-t', type: 'texto', text: 'Capturo momentos únicos con una mirada artística y natural. Cada imagen cuenta una historia.', align: 'center', size: 'normal' },
      { id: 'st-g', type: 'galeria', cols: 4, animation: 'zoom' },
      { id: 'st-b', type: 'boton', text: 'Servicios', variant: 'ghost', icono: 'bi-camera', iconoTam: 24, iconoPos: 'left', align: 'center', descarga: 'si', radius: '8', color: '#000000' },
      { id: 'st-r', type: 'redes', align: 'center' },
      { id: 'st-info', type: 'info', title: 'Horario de atención' },
      { id: 'st-row', type: 'row', columns: [
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] },
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] },
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] }
      ]},
      { id: 'st-b2', type: 'boton', text: 'Lo que dicen', variant: 'ghost', align: 'center', radius: '8', color: '#000000' },
      { id: 'st-row2', type: 'row', columns: [
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] },
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] },
        { span: 4, blocks: [{ type: 'card', body: [
          { type: 'imagen', width: 'auto', height: 'auto', object_position: 'bottom' },
          { type: 'texto', text: 'Sesiones de retrato', align: 'center', size: 'normal', padding: 'none' },
          { type: 'texto', text: 'Individuales, familiares, parejas', align: 'center', size: 'normal', padding: 'none', color: '#9ba2bf' }
        ]}] }
      ]},
      { id: 'st-c', type: 'contacto', width: 'full' }
    ]
  }
};
// ---------------------------------------------------------------------------
// 3) Exportables — mismo shape que antes, TPL_THEMES.css ahora se construye.
// ---------------------------------------------------------------------------
const TPL_CASOS = [
  { id: 'portafolio', nombre: 'Portafolio', desc: 'Fotógrafo, creativo o freelancer.' }
];
const TPL_THEMES = {};
Object.keys(TOKENS).forEach(function (id) {
  const t = TOKENS[id];
  TPL_THEMES[id] = Object.assign({}, t, { css: buildCss(t) });
});

const TPL_META = Object.keys(TPL_THEMES).map(function (id) {
  const t = TPL_THEMES[id];
  return {
    id: t.id, nombre: t.nombre, emoji: t.emoji, dark: !!t.dark, caso: t.caso || 'tienda',
    accent: t.accent, accent2: t.accent2, bg: t.bg, card: t.card, text: t.text, muted: t.muted, border: t.border, radius: t.radius,
    headFont: t.headFont, bodyFont: t.bodyFont, fontLink: t.fontLink,
    css: t.css, dept: t.dept, figuraTpl: t.figuraTpl || '',
    nav: { estilo: 'pildoras', align: 'left', color: t.accent, bg: '#ffffff', text: '#0f172a', posicion: 'arriba', radius: 'pill', shadow: 'soft', gap: 8, sticky: 'no' },
    stack: t.stack
  };
});

module.exports = { TPL_THEMES, TPL_META, TPL_CASOS };