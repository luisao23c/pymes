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

/* mixin genérico para plantillas de "formas flotando" (frutas, viajes,
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
.pv-mascara{position:relative;overflow:hidden;min-height:80px;display:flex;align-items:stretch;justify-content:center;}
.pv-mascara .mascara-inner{position:relative;width:100%;height:100%;display:flex;gap:0;padding:0;align-items:stretch;min-height:0;}
.pv-mascara .mascara-inner .blk{width:100%;height:100%;min-width:0;box-sizing:border-box;margin:0;padding:0;}
.pv-mascara .mascara-child{flex:1 1 0;min-height:0;min-width:0;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}
.pv-mascara .mascara-child *{box-sizing:border-box;}
.pv-mascara .mascara-child [data-sec]{width:100%!important;height:100%!important;margin:0!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box;}
.pv-mascara .mascara-child [data-sec]>*{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0!important;}
.pv-mascara .mascara-child img{width:100%!important;height:100%!important;object-fit:cover!important;margin:0!important;padding:0!important;display:block;}
.pv-mascara .mascara-child a,.pv-mascara .mascara-child button,.pv-mascara .mascara-child span{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;margin:0!important;border-radius:0!important;text-decoration:none;}
.pv-mascara .mascara-child p,.pv-mascara .mascara-child h2,.pv-mascara .mascara-child h3{margin:0!important;padding:0!important;width:100%;height:100%;text-align:center!important;display:flex!important;align-items:center!important;justify-content:center!important;}
.pv-mascara .mascara-child input,.pv-mascara .mascara-child textarea{width:100%!important;height:100%!important;margin:0!important;padding:0 8px!important;border:none!important;background:transparent!important;box-sizing:border-box;}
.pv-mascara .mascara-empty{flex:1;display:flex;align-items:center;justify-content:center;padding:22px 10px;text-align:center;color:#b39c82;font-size:12px;width:100%;}
.pv-mascara .mascara-empty button{margin-top:8px;border:none;background:var(--pc-accent);color:#fff;border-radius:14px;padding:5px 12px;font-size:11px;cursor:pointer;font-weight:600;}
.pv-mascara .mascara-zone{min-height:40px;}
.pv-mascara .mascara-zone .zone-add{display:inline-block;margin:4px 0;border:1.5px dashed #e3d5c2;background:rgba(255,255,255,.7);color:#b39c82;border-radius:10px;padding:8px 14px;font-size:12px;cursor:pointer;font-weight:600;width:100%;text-align:center;}
.pv-mascara .mascara-zone .zone-add:hover{border-color:var(--pc-accent);color:var(--pc-accent);}

@media(prefers-reduced-motion:reduce){
  .ct-btn,.pcard,.product-card,.offer-card{transition:none;}
}
`;

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

  frutas: {
    id: 'frutas', nombre: 'Frutas y verduras', emoji: '🍎', dark: false, caso: 'local',
    fontLink: 'Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700',
    headFont: "'Fredoka', sans-serif", bodyFont: "'Nunito', sans-serif",
    bg: '#FBF6EA', text: '#233B1E', muted: '#6b7563', card: '#ffffff', border: '#e4ead7',
    accent: '#3C8031', accent2: '#E85D33', radius: '20px',
    shapeRadius: '50%', shape3: '#F2C14E', shape3Text: '#233B1E',
    dept: { title: 'Nuestras categorías', subtitle: 'Frescura garantizada todos los días.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: '🌱 Cosecha del día', title: 'Frutas y verduras frescas, directo del campo a tu mesa.', text: 'Seleccionamos lo mejor cada mañana. Pide en línea y recibe tu canasta el mismo día.', boton: 'Armar mi canasta', figura: 'blobs', figuraItems: 'Tomate $28/kg\nAguacate $45/kg\nLimón $18/kg', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Nuestras categorías', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Nuestros productos', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'De temporada', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Armar mi canasta', mensaje: 'Hola, quiero armar una canasta', align: 'center' }
    ]
  },

  viaje: {
    id: 'viaje', nombre: 'Viajes', emoji: '✈️', dark: false, caso: 'servicio',
    fontLink: 'Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700',
    headFont: "'Cormorant Garamond', serif", bodyFont: "'Manrope', sans-serif",
    bg: '#eef9f8', text: '#0f2d34', muted: '#55757d', card: '#ffffff', border: '#dfeef0',
    accent: '#0f766e', accent2: '#0284c7', radius: '28px',
    shapeRadius: '30px',
    dept: { title: 'Experiencias', subtitle: 'Escapadas pensadas para vivir más.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Rutas inolvidables', title: 'Viví cada destino como si fuera tu historia favorita.', text: 'Tours boutique, experiencias locales y asesoría de principio a fin para viajar con calma y estilo.', boton: 'Reservar mi aventura', figura: 'viajes', figuraItems: 'Patagonia\nSantorini\nKyoto', height: 'auto' },
      { id: 'st-a', type: 'texto', title: 'Viajes con intención y experiencia.', text: 'Diseñamos escapadas memorables para parejas, familias, grupos y viajeros que buscan algo más que un itinerario. Cada destino combina comodidad, autenticidad y momentos que merecen ser recordados.', align: 'left', size: 'normal' },
      { id: 'st-g', type: 'imagen', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Destinos de lujo natural y experiencias reales.', height: 'grande', width: 'full' },
      { id: 'st-t', type: 'testimonios', title: 'Experiencias reales', items: 'Camila | "Todo estuvo perfecto, desde el transfer hasta la guía local. Fue muy fluido y súper especial."\nMateo | "Pudimos vivir un viaje muy auténtico, con estilo y sin estrés."\nSofía | "Lo mejor fue que cada detalle estaba pensado para nosotros."' },
      { id: 'st-f', type: 'faq', title: 'Preguntas frecuentes', items: '¿Puedo personalizar mi viaje? | Sí, cada itinerario se adapta a tus tiempos, ritmo y presupuesto.\n¿Incluye traslados y hoteles? | Depende del paquete, pero normalmente todo se arma con opciones premium y guiadas.\n¿Hay viajes para parejas o grupos? | Sí, diseñamos experiencias para bodas, escapadas románticas, grupos y familias.' },
      { id: 'st-w', type: 'whatsapp', text: 'Hablar con un asesor', mensaje: 'Hola, quiero asesoría para un viaje', align: 'center' }
    ]
  },

  peluqueria: {
    id: 'peluqueria', nombre: 'Peluquería', emoji: '✂️', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700',
    headFont: "'Cormorant Garamond', serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f8f1ee', text: '#231816', muted: '#7d635d', card: '#ffffff', border: '#eaded7',
    accent: '#b45309', accent2: '#ec4899', radius: '20px',
    shapeRadius: '50%',
    dept: { title: 'Servicios', subtitle: 'Belleza y estilo para cada día.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Estilo & cuidado', title: 'Looks que realzan tu confianza.', text: 'Cortes, color, peinados y cuidado con una atención personalizada para cada rostro y estilo.', boton: 'Agendar cita', figura: 'estilo', figuraItems: 'Corte moderno\nColoración\nPeinado', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Servicios', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Paquetes de belleza', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Promos de temporada', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Agendar', mensaje: 'Hola, quiero agendar una cita', align: 'center' }
    ]
  },

  spa: {
    id: 'spa', nombre: 'Spa & Wellness', emoji: '💆', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Libre+Baskerville:wght@400;700',
    headFont: "'Libre Baskerville', serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f3f9f7', text: '#1b2c2a', muted: '#5f7c78', card: '#ffffff', border: '#d3e5df',
    accent: '#2f8f7c', accent2: '#5b7cfa', radius: '18px',
    shapeRadius: '50%', shape3: '#c7f0ea', shape3Text: '#2f8f7c',
    dept: { title: 'Experiencias', subtitle: 'Relájate en tu tiempo.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Wellness', title: 'Tu descanso y renovación, en buenas manos.', text: 'Masajes, faciales y rituales terapéuticos diseñados para recargar energía y calma.', boton: 'Reservar spa', figura: 'spa', figuraItems: 'Masajes\nFaciales\nRelajación', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Experiencias', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Tratamientos', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Paquetes mensuales', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Reservar', mensaje: 'Hola, quiero reservar un tratamiento', align: 'center' }
    ]
  },

  dentista: {
    id: 'dentista', nombre: 'Dentista', emoji: '🦷', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Manrope:wght@500;700;800',
    headFont: "'Manrope', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f3fbff', text: '#172033', muted: '#5c7088', card: '#ffffff', border: '#dbeaf8',
    accent: '#0ea5e9', accent2: '#2563eb', radius: '18px',
    shapeRadius: '28px',
    dept: { title: 'Servicios', subtitle: 'Sonrisa sana y segura.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Sonrisa saludable', title: 'Cuidado dental moderno y cercano.', text: 'Limpiezas, ortodoncia y procedimientos estéticos con tecnología actual y atención humana.', boton: 'Pedir cita', figura: 'dental', figuraItems: 'Blanqueamiento\nLimpieza\nOrtodoncia', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Servicios', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Tratamientos', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Promociones', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Agendar', mensaje: 'Hola, quisiera agendar una cita', align: 'center' }
    ]
  },

  veterinaria: {
    id: 'veterinaria', nombre: 'Veterinaria', emoji: '🐾', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Fredoka:wght@500;600;700',
    headFont: "'Fredoka', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f8fdf9', text: '#1f2937', muted: '#65758a', card: '#ffffff', border: '#dfeadf',
    accent: '#10b981', accent2: '#f59e0b', radius: '22px',
    shapeRadius: '26px',
    dept: { title: 'Cuidado para tu mascota', subtitle: 'Salud, cariño y bienestar.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Cuidado experto', title: 'La salud y felicidad de tu mascota importan.', text: 'Consultas, vacunación, esterilización y atención con calidez para cada compañero.', boton: 'Pedir cita', figura: 'mascota', figuraItems: 'Consulta\nVacunas\nBaño', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Cuidado para tu mascota', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Servicios', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Promociones', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Agendar', mensaje: 'Hola, necesito una cita para mi mascota', align: 'center' }
    ]
  },

  eventos: {
    id: 'eventos', nombre: 'Eventos', emoji: '🎉', dark: true, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800',
    headFont: "'Montserrat', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#120d1b', text: '#fdf7ff', muted: '#b5a6c3', card: '#1b1324', border: '#2a1d34',
    accent: '#f472b6', accent2: '#8b5cf6', radius: '18px',
    shapeRadius: '50%',
    dept: { title: 'Experiencias', subtitle: 'Memorias que se quedan.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Eventos & celebración', title: 'Momentos memorables, con estilo y energía.', text: 'Bodas, fiestas, branding y eventos corporativos que convierten cada detalle en una experiencia.', boton: 'Cotizar evento', figura: 'evento', figuraItems: 'Bodas\nCorp\nFiestas', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Experiencias', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Paquetes', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Ofertas de temporada', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Cotizar', mensaje: 'Hola, quiero cotizar un evento', align: 'center' }
    ]
  },

  limpieza: {
    id: 'limpieza', nombre: 'Limpieza', emoji: '🧼', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Nunito:wght@600;700;800',
    headFont: "'Nunito', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f4faf6', text: '#1f2d24', muted: '#5d7265', card: '#ffffff', border: '#dfeee5',
    accent: '#16a34a', accent2: '#14b8a6', radius: '18px',
    shapeRadius: '26px',
    dept: { title: 'Servicios', subtitle: 'Hogar impecable, sin estrés.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Limpieza a domicilio', title: 'Tu hogar impecable, sin complicaciones.', text: 'Servicios de limpieza residential y comercial con atención puntual y productos de calidad.', boton: 'Solicitar limpieza', figura: 'limpieza', figuraItems: 'Hogar\nOficina\nProfunda', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Servicios', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Paquetes', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Ofertas del mes', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Solicitar', mensaje: 'Hola, quiero cotizar un servicio de limpieza', align: 'center' }
    ]
  },

  construccion: {
    id: 'construccion', nombre: 'Construcción', emoji: '🧱', dark: false, caso: 'servicio',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Oswald:wght@500;600;700',
    headFont: "'Oswald', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#f6f3ef', text: '#1f2937', muted: '#667085', card: '#ffffff', border: '#e6dfd8',
    accent: '#ea580c', accent2: '#a16207', radius: '18px',
    shapeRadius: '22px',
    dept: { title: 'Especialidades', subtitle: 'Soluciones para construir con confianza.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Obra & remodelación', title: 'Construimos espacios funcionales y duraderos.', text: 'Remodelaciones, acabados y obra nueva con calidad, puntualidad y seguridad.', boton: 'Cotizar obra', figura: 'obra', figuraItems: 'Remodelación\nObra nueva\nAcabados', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Especialidades', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Servicios', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Paquetes de obra', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Cotizar', mensaje: 'Hola, quiero cotizar un proyecto', align: 'center' }
    ]
  },

  tienda: {
    id: 'tienda', nombre: 'Tienda básica', emoji: '🛒', dark: false, caso: 'tienda',
    fontLink: 'Poppins:wght@400;500;600;700;800&family=Nunito:wght@600;700;800',
    headFont: "'Poppins', sans-serif", bodyFont: "'Nunito', sans-serif",
    bg: '#f8fafc', text: '#0f172a', muted: '#64748b', card: '#ffffff', border: '#e2e8f0',
    accent: '#2563eb', accent2: '#0891b2', radius: '18px',
    shapeRadius: '28px', shape3: '#facc15', shape3Text: '#0f172a',
    dept: { title: 'Explora por categoría', subtitle: 'Todo lo que buscas, en un solo lugar.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: SHAPES_FIG_TPL,
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Nuevos productos', title: 'Todo para tu día a día, con buenos precios.', text: 'Ropa, tecnología, hogar y regalos. Envíos a toda la zona y entrega rápida.', boton: 'Ver catálogo', figura: 'blobs', figuraItems: 'Novedades\nOfertas\nEnvíos', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Explora por categoría', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Lo más vendido', count: 0, category_id: 0, layout: 'grid', cols: 3, paginacion: 'si', mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Ofertas de la semana', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Pedir por WhatsApp', mensaje: 'Hola, quiero hacer un pedido', align: 'center' }
    ]
  },

  // -------------------------------------------------------------------------
  // Grupo B — bespoke: se ganaron su propia identidad visual (brutalista,
  // carnicería con diagrama de cortes, cámara del fotógrafo, etc.). Siguen
  // heredando SHARED_CSS (botones con hover/focus, responsive, reduced-motion)
  // pero agregan `extraCss` propio en vez de usar el mixin genérico.
  // -------------------------------------------------------------------------

  abarrotes: {
    id: 'abarrotes', nombre: 'Abarrotes', emoji: '🥫', dark: false, caso: 'local',
    fontLink: 'Fraunces:opsz,wght@9..144,600;9..144,700&family=Karla:wght@400;500;700',
    headFont: "'Fraunces', serif", bodyFont: "'Karla', sans-serif",
    bg: '#FBF3E3', text: '#2A2318', muted: '#6b6050', card: '#ffffff', border: '#2A2318',
    accent: '#C0392B', accent2: '#2F5233', radius: '4px',
    eyebrowBg: '#E8A33D', eyebrowColor: '#2A2318',
    btnRadius: '2px', btnBorder: '2px solid #2A2318',
    dept: { title: 'Departamentos', subtitle: 'Elige y arma tu pedido en minutos.', grid: 'grid', card: 'card', icon: 'ic' },
    figuraTpl: '<div class="cratewrap"><div class="crate c1">{0}</div><div class="crate c2">{1}</div><div class="crate c3">{2}</div></div>',
    extraCss:
      '.ct-eyebrow{transform:rotate(-2deg);border-radius:0;}' +
      '.cratewrap{position:relative;height:360px;}' +
      '.crate{position:absolute;width:150px;height:150px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--t-head);font-weight:700;font-size:.85rem;text-align:center;box-shadow:4px 4px 0 #2A2318;border:2px solid #2A2318;}' +
      '.c1{background:#2F5233;color:#FBF3E3;top:10px;left:40px;transform:rotate(-6deg);}' +
      '.c2{background:#E8A33D;color:#2A2318;top:120px;right:20px;transform:rotate(5deg);}' +
      '.c3{background:#C0392B;color:#FBF3E3;bottom:0;left:100px;transform:rotate(3deg);}' +
      '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}' +
      '.card{background:#fff;border:2px solid #2A2318;border-radius:4px;padding:22px;box-shadow:5px 5px 0 #2A2318;transition:transform .18s ease;}' +
      '.card:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 #2A2318;}' +
      '.card .ic{width:50px;height:50px;border-radius:50%;background:#2F5233;margin-bottom:16px;}' +
      '.card:nth-child(2) .ic{background:#C0392B;}.card:nth-child(3) .ic{background:#E8A33D;}.card:nth-child(4) .ic{background:#2A2318;}' +
      '.card h3{font-size:1.15rem;font-family:var(--t-head);}.card p{color:#6b6050;font-size:.92rem;}' +
      '.product-card,.offer-card{box-shadow:5px 5px 0 rgba(42,35,24,.9)!important;border:2px solid #2A2318!important;border-radius:0!important;}' +
      '.product-card:hover,.offer-card:hover{transform:translate(-2px,-2px)!important;box-shadow:7px 7px 0 rgba(42,35,24,.9)!important;}' +
      '@media(max-width:860px){.cratewrap{height:220px}.grid{grid-template-columns:repeat(2,1fr)}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Abarrotes de barrio desde 1998', title: 'Todo lo que necesitas, a la vuelta de tu casa.', text: 'Despensa fresca, precios justos y atención de toda la vida. Hacemos tu mandado y te lo llevamos el mismo día.', boton: 'Hacer pedido', figura: 'cajas', figuraItems: 'Frutas frescas\nAbarrotes básicos\nLácteos y más', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Departamentos', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Catálogo', count: 0, category_id: 0, layout: 'grid', cols: 3, paginacion: 'si', mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Ofertas de la semana', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Pedir por WhatsApp', mensaje: 'Hola, quiero hacer un pedido', align: 'center' }
    ]
  },

  carniceria: {
    id: 'carniceria', nombre: 'Carnicería', emoji: '🥩', dark: false, caso: 'local',
    fontLink: 'Bebas+Neue&family=Archivo:wght@400;600;700',
    headFont: "'Bebas Neue', sans-serif", bodyFont: "'Archivo', sans-serif",
    bg: '#F5EDE3', text: '#221E1B', muted: '#6b5e4c', card: '#ffffff', border: '#dccdb0',
    accent: '#6B1E23', accent2: '#D8C7A1', radius: '0px',
    dept: { title: 'Nuestros Cortes', subtitle: 'Calidad seleccionada — corte del día', grid: 'grid4', card: 'ccard', icon: '' },
    figuraTpl: '<div class="diagram"><span>Elige tu<br>corte</span><div class="cut cut1">{0}</div><div class="cut cut2">{1}</div><div class="cut cut3">{2}</div><div class="cut cut4">{3}</div></div>',
    extraCss:
      '.ct-hero{background:#221E1B;color:#D8C7A1;border-bottom:6px solid #6B1E23;border-radius:0;padding-left:24px;padding-right:24px;}' +
      '.ct-hero h2{color:#fff;font-size:clamp(2.4rem,6vw,3.8rem);}' +
      '.ct-eyebrow{border:3px solid #6B1E23;color:#6B1E23;background:transparent;transform:rotate(-4deg);border-radius:0;}' +
      '.diagram{border:2px dashed #D8C7A1;border-radius:50%;width:320px;height:320px;margin:0 auto;position:relative;display:flex;align-items:center;justify-content:center;text-align:center;}' +
      '.diagram span{font-family:var(--t-head);font-size:1.3rem;color:#6B1E23;}' +
      '.cut{position:absolute;width:64px;height:64px;border-radius:50%;background:#6B1E23;color:#fff;font-size:.68rem;font-weight:700;display:flex;align-items:center;justify-content:center;text-align:center;border:2px solid #D8C7A1;}' +
      '.cut1{top:0;left:110px}.cut2{top:100px;right:-10px}.cut3{bottom:10px;left:20px}.cut4{bottom:60px;right:60px}' +
      '.grid4{gap:18px;}' +
      '.ccard{background:#fff;border:1px solid #dccdb0;padding:26px 20px;position:relative;}' +
      '.ccard::before{content:"";position:absolute;top:0;left:0;width:100%;height:5px;background:#6B1E23;}' +
      '.ccard h3{font-family:var(--t-head);font-size:1.5rem;margin-bottom:8px;}' +
      '.product-card,.offer-card{box-shadow:none!important;border:1px solid #dccdb0!important;border-radius:0!important;}' +
      '@media(max-width:860px){.diagram{width:240px;height:240px}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Res · Cerdo · Pollo', title: 'Carne fresca, cortada al momento.', text: 'Seleccionamos la mejor carne de la región. Tú eliges el corte y el grosor.', boton: 'Pedir por WhatsApp', figura: 'cortes', figuraItems: 'Arrachera\nCostilla\nMolida\nMilanesa', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Nuestros Cortes', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Todos los cortes', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Promociones', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Pedir corte', mensaje: 'Hola, quiero pedir un corte', align: 'center' }
    ]
  },

  panaderia: {
    id: 'panaderia', nombre: 'Panadería', emoji: '🥖', dark: false, caso: 'local',
    fontLink: 'Playfair+Display:ital,wght@0,600;0,700;1,500&family=Jost:wght@400;500;600',
    headFont: "'Playfair Display', serif", bodyFont: "'Jost', sans-serif",
    bg: '#FBF1E4', text: '#3B2A1E', muted: '#8a7458', card: '#ffffff', border: '#ead9c4',
    accent: '#8B5A2B', accent2: '#D4A24C', radius: '18px',
    dept: { title: 'Nuestra selección', subtitle: 'Recién salido del horno', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: '<div class="loafwrap"><div class="loaf l1">{0}</div><div class="loaf l2">{1}</div><div class="loaf l3">{2}</div></div>',
    extraCss:
      '.ct-eyebrow{font-style:italic;font-family:var(--t-head);background:transparent;color:#8B5A2B;font-size:1.05rem;padding-left:0;}' +
      '.loafwrap{position:relative;height:340px;display:flex;align-items:center;justify-content:center;}' +
      '.loaf{position:absolute;border-radius:50% 50% 40% 40%/60% 60% 40% 40%;display:flex;align-items:center;justify-content:center;text-align:center;font-family:var(--t-head);font-weight:700;color:#fff;box-shadow:0 12px 26px rgba(80,50,20,.18);}' +
      '.l1{width:200px;height:200px;background:#8B5A2B;top:10px;left:20px;}' +
      '.l2{width:140px;height:140px;background:#E8B4B8;color:#3B2A1E;bottom:10px;right:10px;}' +
      '.l3{width:100px;height:100px;background:#D4A24C;color:#3B2A1E;top:110px;right:70px;font-size:.85rem;}' +
      '@media(max-width:860px){.loafwrap{height:220px}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Horneado fresco cada mañana', title: 'Pan artesanal, hecho con tiempo y cariño.', text: 'Desde las 5 a.m. amasamos, horneamos y perfumamos el barrio. Recoge en tienda o pide a domicilio.', boton: 'Pedir por WhatsApp', figura: 'panes', figuraItems: 'Bolillo\nConcha\nBaguette', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Nuestra selección', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Todo el menú', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Especial del día', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Pedir ahora', mensaje: 'Hola, quiero un pedido', align: 'center' }
    ]
  },

  cafeteria: {
    id: 'cafeteria', nombre: 'Cafetería', emoji: '☕', dark: false, caso: 'restaurante',
    fontLink: 'Caveat:wght@600;700&family=Poppins:wght@400;500;600;700',
    headFont: "'Poppins', sans-serif", bodyFont: "'Poppins', sans-serif",
    bg: '#F0E4D3', text: '#3B2A20', muted: '#8a7666', card: '#ffffff', border: '#e3d6c4',
    accent: '#B67F4F', accent2: '#7C8B6D', radius: '20px',
    dept: { title: 'Nuestra carta', subtitle: '', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: '<div class="cup"><span class="steam">〰️〰️</span><div class="ring"><div class="ring-inner">{0}</div></div></div>',
    extraCss:
      '.ct-eyebrow{font-family:"Caveat",cursive;font-size:1.5rem;background:transparent;color:#B67F4F;transform:rotate(-3deg);padding-left:0;}' +
      '.cup{position:relative;height:340px;display:flex;align-items:center;justify-content:center;}' +
      '.ring{width:280px;height:280px;border-radius:50%;border:18px solid #3B2A20;display:flex;align-items:center;justify-content:center;}' +
      '.ring-inner{width:190px;height:190px;border-radius:50%;background:#B67F4F;display:flex;align-items:center;justify-content:center;color:#fff;font-family:"Caveat",cursive;font-size:1.6rem;text-align:center;}' +
      '.steam{position:absolute;top:-10px;font-size:2rem;opacity:.6;}' +
      '@media(max-width:860px){.cup{height:220px}.ring{width:200px;height:200px;border-width:12px}.ring-inner{width:130px;height:130px;font-size:1.2rem}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'buenos días ☺', title: 'Tu pausa perfecta, taza tras taza.', text: 'Café de origen, tostado en pequeños lotes y preparado con calma. Ven a quedarte o pide para llevar.', boton: 'Pedir por WhatsApp', figura: 'taza', figuraItems: 'Latte del día', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Nuestra carta', modo: 'cards' },
      { id: 'st-p', type: 'productos', title: 'Menú', count: 0, category_id: 0, layout: 'grid', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Combo del día', count: 3 },
      { id: 'st-w', type: 'whatsapp', text: 'Ordenar', mensaje: 'Hola, quiero ordenar', align: 'center' }
    ]
  },

  fotografo: {
    id: 'fotografo', nombre: 'Fotógrafo', emoji: '📷', dark: false, caso: 'portafolio',
    fontLink: 'Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700',
    headFont: "'Cormorant Garamond', serif", bodyFont: "'Manrope', sans-serif",
    bg: '#f8f1eb', text: '#1f1a18', muted: '#655d5a', card: '#ffffff', border: '#ead9ce',
    accent: '#b45309', accent2: '#6d28d9', radius: '26px',
    dept: { title: 'Especialidades', subtitle: 'Momentos que merecen ser recordados con estilo.', grid: 'grid4', card: 'pcard', icon: 'circ' },
    figuraTpl: '<div class="photo-scene"><div class="camera">{0}</div><div class="snap snap1">{1}</div><div class="snap snap2">{2}</div></div>',
    btnBg: 'linear-gradient(135deg,#b45309,#6d28d9)',
    extraCss:
      '.ct-eyebrow{background:rgba(255,255,255,.8);border:1px solid rgba(109,40,217,.12);backdrop-filter:blur(8px);}' +
      '.photo-scene{position:relative;width:100%;height:310px;}' +
      '.camera{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:210px;height:180px;border-radius:30px;background:linear-gradient(135deg,#18181b,#2b1b1b);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;box-shadow:0 26px 50px rgba(24,24,27,.18);letter-spacing:.1em;text-transform:uppercase;font-size:.84rem;}' +
      '.camera::before{content:"";position:absolute;inset:18px 20px 38px;border-radius:22px;border:1px solid rgba(255,255,255,.18)}' +
      '.camera::after{content:"";position:absolute;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fbbf24,#d97706 58%,#7c2d12 100%);right:30px;bottom:22px;box-shadow:0 0 0 10px rgba(255,255,255,.05)}' +
      '.snap{position:absolute;width:120px;height:120px;border-radius:26px;background:linear-gradient(135deg,#fff,#f5ebe4);border:1px solid #ead9ce;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 30px rgba(32,21,18,.08);font-weight:800;color:#6d28d9;font-size:.76rem;letter-spacing:.04em;}' +
      '.snap1{top:12px;left:26px;transform:rotate(-8deg);}.snap2{right:30px;bottom:12px;transform:rotate(8deg);}' +
      '.pcard .circ{background:linear-gradient(135deg,#d97706,#7c3aed);}' +
      '@media(max-width:860px){.photo-scene{height:220px}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Sesiones premium', title: 'Capturamos la esencia de cada momento.', text: 'Retratos, bodas y contenido visual para marcas que quieren contar historias con estilo y personalidad.', boton: 'Solicitar cita', figura: 'fotos', figuraItems: 'Bodas\nBranding\nRetratos', height: 'auto' },
      { id: 'st-a', type: 'texto', title: 'Un estudio hecho para recordar la vida.', text: 'Te acompañamos con una mirada editorial, cercana y cinematográfica para bodas, retratos, branding y proyectos personales. Cada sesión está pensada para quedar en la memoria, no solo en una galería.', align: 'left', size: 'normal' },
      { id: 'st-g', type: 'imagen', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', title: 'Sesiones con dirección artística y naturalidad.', height: 'grande', width: 'full' },
      { id: 'st-t', type: 'testimonios', title: 'Lo que dicen nuestros clientes', items: 'María | "Las fotos se sienten reales, elegantes y llenas de emoción. Fue como revivir la boda otra vez."\nLuis | "La calidad del trabajo es impecable. Todo se sintió muy cuidado, muy personal."\nAndrea | "Nos dieron un resultado que parece editorial, pero con naturalidad."' },
      { id: 'st-f', type: 'faq', title: 'Preguntas frecuentes', items: '¿Cuánto tarda la entrega? | En 10 a 15 días hábiles entregamos el previsualizado y la galería final.\n¿Se puede reservar fuera de temporada? | Sí, también atendemos sesiones en fechas especiales y proyectos de contenido para marcas.\n¿Incluye retrato familiar o productos? | Sí, se puede adaptar según el tipo de sesión y el número de personas.' },
      { id: 'st-w', type: 'whatsapp', text: 'Reservar sesión', mensaje: 'Hola, me gustaría reservar una sesión fotográfica', align: 'center' }
    ]
  },

  braza: {
    id: 'braza', nombre: 'Restaurante', emoji: '🍽️', dark: true, caso: 'restaurante',
    fontLink: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Barlow+Condensed:wght@400;500;600;700',
    headFont: "'Cormorant Garamond', serif", bodyFont: "'Barlow Condensed', sans-serif",
    bg: '#1A1613', text: '#EFE7DC', muted: '#a89a83', card: '#221c17', border: '#33291f',
    accent: '#7A2E2E', accent2: '#C9A24B', radius: '4px',
    btnRadius: '2px',
    dept: { title: 'Recomendaciones del chef', subtitle: '', grid: 'menulist', card: 'mitem', icon: '' },
    extraCss:
      '.ct-hero-single{padding:80px 6px;position:relative;}' +
      '.ct-hero-single::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(122,46,46,.25),transparent 60%);}' +
      '.ct-eyebrow{background:transparent;text-transform:uppercase;letter-spacing:.3em;color:#C9A24B;padding-left:0;}' +
      '.ct-hero h2{font-style:italic;font-size:clamp(2.6rem,6vw,4.4rem);}' +
      '.menulist{display:flex;flex-direction:column;gap:26px;max-width:760px;margin:0 auto;}' +
      '.mitem{display:flex;justify-content:space-between;align-items:baseline;gap:16px;border-bottom:1px dotted #4a3f31;padding-bottom:14px;}' +
      '.mitem .name{font-family:var(--t-head);font-size:1.4rem;}' +
      '.mitem .price{font-family:var(--t-head);font-size:1.3rem;color:#C9A24B;white-space:nowrap;}' +
      '.product-card,.offer-card{border:1px solid #33291f!important;}' +
      '@media(max-width:860px){.mitem{flex-direction:column}}',
    stack: [
      { id: 'st-h', type: 'banner', eyebrow: 'Cocina de fuego lento', title: 'El sabor de la brasa, en cada plato.', text: 'Cortes selectos, guarniciones de temporada y una carta pensada para compartir. Abrimos todos los días desde las 13:00.', boton: 'Reservar mesa', figura: '', figuraItems: '', height: 'auto' },
      { id: 'st-c', type: 'categorias', title: 'Recomendaciones del chef', modo: 'menu' },
      { id: 'st-p', type: 'productos', title: 'Nuestra carta', count: 0, category_id: 0, layout: 'lista', cols: 3, mostrarFiltros: 'no' },
      { id: 'st-o', type: 'ofertas', title: 'Especiales', count: 4 },
      { id: 'st-w', type: 'whatsapp', text: 'Reservar mesa', mensaje: 'Hola, quiero reservar', align: 'center' }
    ]
  }
};

// ---------------------------------------------------------------------------
// 3) Exportables — mismo shape que antes, TPL_THEMES.css ahora se construye.
// ---------------------------------------------------------------------------
const TPL_CASOS = [
  { id: 'local', nombre: 'Negocio local', desc: 'Tienda de barrio, frutería, carnicería, panadería…' },
  { id: 'tienda', nombre: 'Tienda básica', desc: 'Vende productos variados en línea con catálogo.' },
  { id: 'servicio', nombre: 'Servicio profesional', desc: 'Peluquería, spa, clínica, taller, agencia…' },
  { id: 'restaurante', nombre: 'Restaurante', desc: 'Café, restaurante, cocina y menú.' },
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