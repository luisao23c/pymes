/**
 * Fuente única de verdad para el componente MÁSCARA.
 * Importar en server.js y pasar a vistas; en diseno.ejs se inyecta como window.MASCARA_CONFIG.
 */

const MASCARA_SIZES = { xs: 120, s: 180, m: 260, l: 340, xl: 420, '2xl': 520 };

const SHAPE_DEFS = {
  circle:   { label: 'Círculo',       clip: () => 'circle(50% at 50% 50%)',                       pts: () => [], svg: 'M20,2 A18,18 0 1,1 19.9,2 Z' },
  square:   { label: 'Cuadrado',      clip: () => 'inset(0)',                                       pts: () => [], svg: 'M2,2 L38,2 L38,38 L2,38 Z' },
  roundrect:{ label: 'Rect. redondeado', clip: () => 'inset(0 round 12px)',                         pts: () => [], svg: 'M8,2 L32,2 Q38,2 38,8 L38,32 Q38,38 32,38 L8,38 Q2,38 2,32 L2,8 Q2,2 8,2 Z' },
  pill:     { label: 'Óvalo',         clip: () => 'ellipse(50% 38% at 50% 50%)',                   pts: () => [], svg: 'M20,4 A16,14 0 1,1 19.9,4 Z' },
  triangle: { label: 'Triángulo',     clip: () => 'polygon(50% 0%, 100% 100%, 0% 100%)',            pts: () => [], svg: 'M20,2 L38,38 L2,38 Z' },
  diamond:  { label: 'Rombo',         clip: () => 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',    pts: () => [], svg: 'M20,2 L38,20 L20,38 L2,20 Z' },
  star4:    { label: 'Estrella 4',    clip: () => 'polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)', pts: () => [], svg: 'M20,2 L25,15 L38,20 L25,25 L20,38 L15,25 L2,20 L15,15 Z' },
  star5:    { label: 'Estrella 5',    clip: function(){ var o=[]; for(var i=0;i<10;i++){var a=Math.PI/2+i*Math.PI/5;var r=i%2===0?48:20;o.push(Math.round(50+r*Math.cos(a)*100/96)+'% '+Math.round(50-r*Math.sin(a)*100/96)+'%');} return 'polygon('+o.join(',')+')'; }, pts: function(){ var o=[]; for(var i=0;i<10;i++){var a=Math.PI/2+i*Math.PI/5;var r=i%2===0?48:20;o.push([Math.round(50+r*Math.cos(a)*100/96),Math.round(50-r*Math.sin(a)*100/96)]);} return o; }, svg: 'M20,2 L24,14 L37,14 L27,22 L30,35 L20,27 L10,35 L13,22 L3,14 L16,14 Z' },
  star6:    { label: 'Estrella 6',    clip: function(){ var o=[]; for(var i=0;i<12;i++){var a=Math.PI/2+i*Math.PI/6;var r=i%2===0?48:22;o.push(Math.round(50+r*Math.cos(a)*100/96)+'% '+Math.round(50-r*Math.sin(a)*100/96)+'%');} return 'polygon('+o.join(',')+')'; }, pts: function(){ var o=[]; for(var i=0;i<12;i++){var a=Math.PI/2+i*Math.PI/6;var r=i%2===0?48:22;o.push([Math.round(50+r*Math.cos(a)*100/96),Math.round(50-r*Math.sin(a)*100/96)]);} return o; }, svg: 'M20,2 L24,12 L33,8 L28,18 L37,22 L27,24 L30,34 L20,28 L10,34 L13,24 L3,22 L12,18 L7,8 L16,12 Z' }
};

function getShapeClip(variant) {
  var def = SHAPE_DEFS[variant] || SHAPE_DEFS.circle;
  return def.clip(def.pts());
}

const MASCARA_CSS = `
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
.pv-mascara .mascara-preview{position:absolute;inset:0;clip-path:inherit;-webkit-clip-path:inherit;border:2px dashed transparent;pointer-events:none;z-index:2;transition:border-color .15s;}
.pv-mascara:hover .mascara-preview{border-color:rgba(234,88,12,.35);}
.pv-mascara .mascara-child .resize-handle{position:absolute;background:#ea580c;border:2px solid #fff;border-radius:50%;width:14px;height:14px;cursor:se-resize;opacity:0;transition:opacity .15s;z-index:5;}
.pv-mascara .mascara-child:hover .resize-handle{opacity:1;}
.pv-mascara .mascara-child .resize-handle.br{right:-7px;bottom:-7px;}
.pv-mascara .mascara-child .resize-handle.tr{right:-7px;top:-7px;cursor:ne-resize;}
.pv-mascara .mascara-child .resize-handle.bl{left:-7px;bottom:-7px;cursor:ne-resize;}
.pv-mascara .mascara-child .resize-handle.tl{left:-7px;top:-7px;cursor:nw-resize;}
.pv-mascara .mascara-empty{flex:1;display:flex;align-items:center;justify-content:center;padding:22px 10px;text-align:center;color:#cbd5e1;font-size:12px;width:100%;}
.pv-mascara .mascara-zone{min-height:40px;}
.pv-mascara .mascara-zone .zone-add{display:inline-block;margin:4px 0;border:1.5px dashed transparent;background:transparent;color:#cbd5e1;border-radius:10px;padding:8px 14px;font-size:12px;cursor:pointer;font-weight:600;width:100%;text-align:center;transition:all .15s;}
.pv-mascara:hover .mascara-zone .zone-add{border-color:#e2e8f0;color:#94a3b8;background:rgba(255,255,255,.7);}
.pv-mascara .mascara-zone .zone-add:hover{border-color:var(--accent);color:var(--accent);}
`;

const EDITOR_ONLY_CSS = `
.pv-mascara .mascara-preview{position:absolute;inset:0;clip-path:inherit;-webkit-clip-path:inherit;border:2px dashed transparent;pointer-events:none;z-index:2;transition:border-color .15s;}
.pv-mascara:hover .mascara-preview{border-color:rgba(234,88,12,.35);}
.pv-mascara .mascara-child .resize-handle{position:absolute;background:#ea580c;border:2px solid #fff;border-radius:50%;width:14px;height:14px;cursor:se-resize;opacity:0;transition:opacity .15s;z-index:5;}
.pv-mascara .mascara-child:hover .resize-handle{opacity:1;}
.pv-mascara .mascara-child .resize-handle.br{right:-7px;bottom:-7px;}
.pv-mascara .mascara-child .resize-handle.tr{right:-7px;top:-7px;cursor:ne-resize;}
.pv-mascara .mascara-child .resize-handle.bl{left:-7px;bottom:-7px;cursor:ne-resize;}
.pv-mascara .mascara-child .resize-handle.tl{left:-7px;top:-7px;cursor:nw-resize;}
.pv-mascara .mascara-zone{min-height:40px;}
.pv-mascara .mascara-zone .zone-add{display:inline-block;margin:4px 0;border:1.5px dashed transparent;background:transparent;color:#cbd5e1;border-radius:10px;padding:8px 14px;font-size:12px;cursor:pointer;font-weight:600;width:100%;text-align:center;transition:all .15s;}
.pv-mascara:hover .mascara-zone .zone-add{border-color:#e2e8f0;color:#94a3b8;background:rgba(255,255,255,.7);}
.pv-mascara .mascara-zone .zone-add:hover{border-color:var(--accent);color:var(--accent);}
`;

module.exports = {
  MASCARA_SIZES,
  SHAPE_DEFS,
  getShapeClip,
  MASCARA_CSS,
  EDITOR_ONLY_CSS,
  // helpers para templates
  shapeOptions: Object.keys(SHAPE_DEFS).map(k => ({ value: k, label: SHAPE_DEFS[k].label })),
  sizeOptions: Object.entries(MASCARA_SIZES).map(([k,v]) => ({ value: k, label: `${k.toUpperCase()} (${v}px)` }))
};