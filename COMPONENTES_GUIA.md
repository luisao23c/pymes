# 📋 Guía Completa de Componentes HTML para Plantillas

Este documento contiene TODO lo que necesitas para diseñar plantillas personalizadas.
Cada componente genera HTML específico que puedes estilizar con CSS variables y clases propias.

---

## 1. ESTRUCTURA BASE DE UNA PLANTILLA

Toda plantilla .ejs sigue esta estructura:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= biz.name %> · NombrePlantilla</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=TU_FUENTE&display=swap" rel="stylesheet" />
  <style>
    /* ═══ 1. CSS VARIABLES OBLIGATORIAS ═══ */
    :root {
      --accent: #tuColorAccent;        /* Color principal botones, links, acentos */
      --accent2: #tuColorAccent2;      /* Color secundario, gradientes */
      --bg: #tuFondoBody;              /* Fondo del body */
      --text: #tuColorTexto;           /* Color de texto principal */
      --muted: #tuColorMuted;          /* Texto secundario, captions */
      --card: #tuColorCards;           /* Fondo de tarjetas */
      --border: #tuColorBordes;        /* Color de bordes */
      --radius: 16px;                  /* Border-radius general */
      --head-font: 'TuFuente', sans-serif;   /* Fuente para títulos */
      --body-font: 'TuFuente', sans-serif;   /* Fuente para cuerpo */
    }

    /* ═══ 2. RESET ═══ */
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: var(--body-font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    h1,h2,h3,h4,h5,h6 { font-family: var(--head-font); }

    /* ═══ 3. OVERRIDE DE COMPONENTES COMPARTIDOS ═══ */
    /* Estas clases controlan cómo se ven los componentes de components.ejs */

    /* Tarjeta de producto */
    .product-card {
      background: var(--card) !important;
      border: 1px solid var(--border) !important;
      border-radius: var(--radius) !important;
      transition: all .25s ease !important;
      overflow: hidden;
    }
    .product-card:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,.08) !important;
    }

    /* Tarjeta de oferta */
    .offer-card {
      background: var(--card) !important;
      border: 1px solid var(--border) !important;
      border-radius: var(--radius) !important;
    }

    /* Badge de descuento */
    .badge-offer {
      background: var(--accent) !important;
      color: #fff !important;
      font-size: .6rem;
      font-weight: 800;
      padding: .15rem .6rem;
      border-radius: 60px;
    }

    /* Chips de categoría (activos) */
    .chip-active {
      background: var(--accent) !important;
      color: #fff !important;
      border-color: var(--accent) !important;
      border-radius: 999px !important;
    }

    /* Chips de categoría (inactivos) */
    .chip-idle {
      background: var(--card) !important;
      color: var(--text) !important;
      border: 1px solid var(--border) !important;
      border-radius: 999px !important;
    }
    .chip-idle:hover {
      background: var(--accent) !important;
      color: #fff !important;
      border-color: var(--accent) !important;
    }

    /* Barra de búsqueda */
    .search-input {
      background: var(--card) !important;
      color: var(--text) !important;
      border: 1px solid var(--border) !important;
      border-radius: 12px !important;
    }
    .search-input:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px rgba(79,70,229,.12) !important;
    }

    /* Chips de categoría (container) */
    .cat-chip { border-radius: 999px !important; }

    /* Botón principal */
    .btn-primary {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .6rem 1.6rem; border-radius: 60px;
      font-weight: 700; font-size: .8rem;
      background: var(--accent); color: #fff; border: none;
      transition: all .2s ease; cursor: pointer;
    }
    .btn-primary:hover { transform: scale(1.03); }

    /* Botón WhatsApp */
    .btn-wa { background: #22c55e !important; }
    .btn-wa:hover { background: #16a34a !important; }

    /* Barra del carrito */
    .cart-bar {
      backdrop-filter: blur(20px);
      background: rgba(26,24,22,.85) !important;
      border: 1px solid rgba(255,255,245,.1);
    }

    /* Título de sección de producto */
    .pv-section-title {
      font-size: 20px; font-weight: 800; margin: 0 0 14px;
    }

    /* Grid de productos */
    .prod-grid { /* ya tiene grid de Tailwind */ }

    /* Footer */
    .footer-muted { color: var(--muted); border-top: 1px solid var(--border); }

    /* Badge de verificado */
    .verify-badge {
      position: absolute; bottom: -2px; right: -2px;
      width: 18px; height: 18px;
      background: #22c55e; border-radius: 50%;
      border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; color: #fff; font-weight: 900;
    }

    /* Scrollbar oculto */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body>
  <!-- HEADER: Personaliza tu header aquí -->
  <header data-sec="hero" style="tu-estilo-de-header">
    <!-- Logo, nombre, descripción, WhatsApp -->
  </header>

  <!-- MAIN: Aquí se renderizan TODOS los componentes -->
  <main data-sec="contenido" style="max-width:1100px;margin:0 auto;padding:24px 16px 112px;">
    <%- include('../partials/components', { biz, products, money, categories, components, pages, editMode, mascaraCss: mascaraCss, mascaraConfig: mascaraConfig }) %>
  </main>

  <!-- CARRITO: JavaScript del carrito -->
  <%- include('../partials/cart-js', { biz, products }) %>
</body>
</html>
```

---

## 2. VARIABLES DISPONIBLES EN EJS

Estas variables están disponibles automáticamente en cada plantilla:

| Variable | Tipo | Descripción |
|---|---|---|
| `biz.name` | String | Nombre del negocio |
| `biz.description` | String | Descripción del negocio |
| `biz.logo` | String (URL) | Logo del negocio |
| `biz.cover` | String (URL) | Imagen de portada |
| `biz.whatsapp` | String | Número de WhatsApp |
| `biz.address` | String | Dirección |
| `biz.slug` | String | Slug del negocio |
| `biz.sections` | String (JSON) | Configuración de secciones/navegación |
| `products` | Array | Lista de productos |
| `categories` | Array | Lista de categorías |
| `components` | Array | Lista de componentes/bloques |
| `pages` | Array | Páginas/secciones |
| `editMode` | Boolean | Si está en modo editor |
| `mascaraCss` | String | CSS de la máscara |
| `mascaraConfig` | Object | Configuración de máscara |
| `money(n)` | Function | Formatea número como moneda |

---

## 3. HTML EXACTO DE CADA COMPONENTE

### 3.1 BANNER (con imagen)

```html
<div data-sec="banner" style="margin:0 0 18px;width:100%;max-width:100%;padding:24px 26px;border-radius:0px;border:none;">
  <a href="https://link-externo" target="_blank" rel="noopener" style="display:block;text-decoration:none;">
    <div style="position:relative;border-radius:var(--radius,16px);overflow:hidden;">
      <img src="URL_IMAGEN" alt="Título" loading="lazy"
           style="width:100%;max-height:340px;object-fit:cover;object-position:center;display:block;" />
      <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,.65), transparent 60%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px;">
        <span style="color:#fff;font-size:22px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.4);">Título del Banner</span>
        <span style="color:rgba(255,255,255,.92);font-size:14px;margin-top:4px;">Subtítulo del banner</span>
      </div>
    </div>
  </a>
</div>
```

### 3.2 BANNER (sin imagen, gradiente)

```html
<div data-sec="banner" style="margin:0 0 18px;width:100%;padding:24px 26px;border-radius:0px;">
  <div style="background:linear-gradient(135deg, var(--accent,#2563eb), var(--accent2,#0ea5e9));color:#fff;padding:24px 26px;border-radius:var(--radius,16px);">
    <span style="display:block;font-size:22px;font-weight:800;">Título del Banner</span>
    <p style="display:block;font-size:14px;margin-top:6px;opacity:.95;">Texto descriptivo del banner</p>
  </div>
</div>
```

### 3.3 BANNER HERO (con tema/figura)

```html
<div data-sec="banner" class="ct-hero ct-hero-single">
  <div>
    <span class="ct-eyebrow">Eyebrow text</span>
    <h2>Título del Hero</h2>
    <p>Descripción del hero</p>
    <a class="ct-btn" href="https://wa.me/52XXXXXXXXXX" target="_blank" rel="noopener">Botón CTA</a>
  </div>
  <!-- Figura decorativa del tema (ej: panes, cortes, taza) -->
  <div class="loafwrap">
    <div class="loaf l1">Item 1</div>
    <div class="loaf l2">Item 2</div>
    <div class="loaf l3">Item 3</div>
  </div>
</div>
```

**Clases CSS del hero (definidas por el tema):**
- `.ct-hero` → Contenedor del hero
- `.ct-hero-single` → Hero sin figura
- `.ct-eyebrow` → Eyebrow/subtítulo
- `.ct-btn` → Botón CTA
- `.ct-hero h2` → Título principal

### 3.4 TEXTO

```html
<div data-sec="texto" style="max-width:100%;overflow-wrap:break-word;word-break:break-word;margin:0px 0;padding:20px;border-radius:0px;border:none;text-align:left;">
  <p style="max-width:100%;margin:0;white-space:pre-line;overflow-wrap:break-word;word-break:break-word;font-size:17px;">
    Contenido del texto aquí. Soporta saltos de línea.
  </p>
</div>
```

**Atributos disponibles:**
- `fontSize` / `size`: tiny(12), pequeno(15), normal(17), grande(21), huge(28)
- `bold`: 'si' → font-weight:700
- `italic`: 'si' → font-style:italic
- `uppercase`: 'si' → text-transform:uppercase
- `align`: left, center, right
- `color`: #hexcolor
- `bg`: color de fondo
- `padding`: none, suave(8px), normal(20px), amplio(32px)
- `border`: número de px
- `shadow`: suave, media, fuerte
- `radius`: px

### 3.5 IMAGEN

```html
<div data-sec="imagen" style="margin:0 0 18px;width:100%;max-width:100%;text-align:center;">
  <div style="position:relative;">
    <img src="URL_IMAGEN" alt="Leyenda" loading="lazy"
         style="width:100%;max-height:440px;object-fit:cover;object-position:center;border-radius:var(--radius,16px);display:block;" />
  </div>
  <p style="font-size:14px;color:var(--muted,#64748b);margin-top:6px;text-align:center;">Leyenda de la imagen</p>
</div>
```

**Atributos:**
- `height`: normal(440), grande(560), full(720)
- `width`: full(100%), grande(75%), media(50%), pequena(25%)
- `object_position`: center, top, bottom
- `captionPos`: none, top, bottom, top-left, bottom-right, etc.

### 3.6 TEXTO FLOTANTE (overlay)

```html
<div data-sec="overlay" style="position:relative;margin:0 0 18px;">
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(0deg);z-index:10;opacity:1;background:rgba(0,0,0,.55);border-radius:6px;padding:10px 16px;min-width:60px;text-align:center;">
    <span style="font-size:17px;color:#fff;">Texto flotante</span>
  </div>
</div>
```

**Atributos:**
- `text`: Texto a mostrar
- `fontSize`: 12, 14, 16, 17, 19, 22, 26, 32, 38, 46
- `font`: Inter, Montserrat, Playfair Display, etc.
- `color`: Color del texto (#hex)
- `bg`: Color de fondo (#hex o rgba)
- `bg2`: Segundo color degradado
- `opacity`: 0-100
- `posX`, `posY`: Posición X/Y como porcentaje (0-100)
- `rotation`: Rotación en grados
- `textShadow`: si/no
- `uppercase`: si/no
- `padding`: none, suave, normal, amplio
- `radius`: Esquinas redondeadas
- `border`: Borde
- `shadow`: Sombra
- `zIndex`: Capa (10 por defecto)

### 3.7 SEPARADOR

```html
<div data-sec="separador" style="margin:0 0 18px;">
  <div style="height:1px;background:#e2e8f0;border-radius:2px;opacity:.7;"></div>
</div>
```

**Atributos:** `grosor` (px), `color` (#hex)

### 3.7 ESPACIO

```html
<div data-sec="espacio" style="height:40px;"></div>
```

**Atributo:** `alto` (px)

### 3.8 BOTÓN

```html
<div data-sec="boton" style="margin:0 0 18px;text-align:center;">
  <a href="https://link" target="_blank" rel="noopener"
     style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;">
    <i class="bi bi-icono"></i>
    Texto del Botón
  </a>
</div>
```

**Atributos:**
- `link`: URL
- `bg`: color de fondo
- `fg`: color de texto
- `radius`: px
- `size`: px del font-size
- `icono`: nombre de bootstrap icon
- `align`: left, center, right
- `hover`: scale, lift, glow
- `border`: número de px
- `uppercase`: 'si'

### 3.9 TÍTULO (h2)

```html
<div data-sec="titulo" style="margin:0 0 12px;text-align:left;padding:0;">
  <h2 style="font-size:24px;font-weight:800;margin:0;">Título de Sección</h2>
</div>
```

**Atributos:** `tsz` (font-size), `align`, `uppercase`, `color`, `bg`, `pad`

### 3.10 WHATSAPP

```html
<div data-sec="whatsapp" style="margin:0 0 18px;text-align:center;">
  <a href="https://wa.me/52XXXXXXXXXX?text=Hola" target="_blank" rel="noopener"
     style="display:inline-block;background:#22c55e;color:#fff;padding:11px 22px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;">
    🟢 Texto del botón
  </a>
</div>
```

**Atributos:** `text`, `whatsapp` (número), `mensaje`, `color`, `align`, `radius`

### 3.11 LLAMAR

```html
<div data-sec="llamar" style="margin:0 0 18px;text-align:center;">
  <a href="tel:+52XXXXXXXXXX"
     style="display:inline-flex;align-items:center;gap:8px;background:#2563eb;color:#fff;padding:14px 28px;border-radius:999px;font-weight:800;text-decoration:none;font-size:15px;">
    📞 Texto <span style="opacity:.85;">+52XXXXXXXXXX</span>
  </a>
</div>
```

### 3.12 REDES SOCIALES

```html
<div data-sec="redes" style="margin:0 0 18px;display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
  <a href="URL_FACEBOOK" target="_blank" rel="noopener" title="Facebook" style="text-decoration:none;display:inline-flex;filter:drop-shadow(0 1px 2px rgba(0,0,0,.15));">
    <!-- SVG icon 24x24 -->
  </a>
  <a href="URL_INSTAGRAM" target="_blank" rel="noopener" title="Instagram">
    <!-- SVG icon 24x24 -->
  </a>
  <a href="URL_TIKTOK" target="_blank" rel="noopener" title="TikTok">
    <!-- SVG icon 24x24 -->
  </a>
  <a href="https://wa.me/52XXXXXXXXXX" target="_blank" rel="noopener" title="WhatsApp">
    <!-- SVG icon 24x24 -->
  </a>
</div>
```

### 3.13 CATEGORÍAS (modo chips)

```html
<div data-sec="categorias" style="margin:0 0 18px;" class="flex flex-wrap gap-2">
  <button onclick="filterCat(0)" class="cat-chip chip-active flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap transition">
    ✨ Todos <span class="cat-chip-count text-[10px] font-bold bg-black/10 rounded-full px-1.5 py-0.5">42</span>
  </button>
  <button onclick="filterCat(1)" data-cat="1" class="cat-chip chip-idle flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap transition">
    Categoría A <span class="cat-chip-count text-[10px] font-bold bg-black/10 rounded-full px-1.5 py-0.5">12</span>
  </button>
  <button onclick="filterCat(2)" data-cat="2" class="cat-chip chip-idle flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap transition">
    Categoría B <span class="cat-chip-count text-[10px] font-bold bg-black/10 rounded-full px-1.5 py-0.5">8</span>
  </button>
</div>
```

### 3.14 CATEGORÍAS (modo cards)

```html
<div data-sec="categorias" style="margin:0 0 18px;">
  <h2 style="font-size:20px;font-weight:800;margin:0 0 14px;">Título</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
    <div style="padding:18px 12px;text-align:center;background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;font-weight:700;">
      <div style="width:42px;height:42px;margin:0 auto 9px;border-radius:50%;background:var(--accent,#2563eb);opacity:.85;"></div>
      Nombre Categoría
    </div>
    <!-- Repetir por cada categoría -->
  </div>
</div>
```

### 3.15 CATEGORÍAS (modo menú, con tema)

```html
<div data-sec="categorias" style="margin:0 0 18px;">
  <div class="menulist">
    <div class="mitem">
      <div><span class="name">Nombre del Plato</span></div>
      <span class="price">$120.00</span>
    </div>
    <div class="mitem">
      <div><span class="name">Otro Plato</span></div>
      <span class="price">$85.00</span>
    </div>
  </div>
</div>
```

**Clases del menú (definidas por el tema):**
- `.menulist` → flex column, max-width, gap
- `.mitem` → flex, justify-between, border-bottom dotted
- `.name` → font-family del tema
- `.price` → color accent del tema

### 3.16 PRODUCTOS (grid)

```html
<h2 data-sec="productos-t" style="font-size:18px;font-weight:800;margin:0 0 10px;">Título Productos</h2>
<div data-sec="productos" data-key="ID_BLOQUE" style="margin:0 0 18px;padding:10px 14px;">
  <div class="flex-1 min-w-0">
    <div class="prod-grid grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 items-start">

      <!-- CADA PRODUCTO: -->
      <div class="product-card" data-id="123" data-cat="1" data-search="nombre categoría tags"
           style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:var(--radius,16px);overflow:hidden;cursor:pointer;">
        <div class="relative">
          <img src="URL_IMAGEN" class="w-full aspect-square object-cover" />
          <!-- Badge destacado (solo si es destacado) -->
          <span class="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">⭐ Destacado</span>
          <!-- Badge descuento (solo si tiene old_price) -->
          <span class="absolute top-2 right-2 badge-offer">-25%</span>
        </div>
        <div class="p-3.5">
          <span class="text-[10px] font-bold uppercase tracking-wider" style="color:var(--muted,#64748b);">Categoría</span>
          <h3 class="font-bold text-sm mt-0.5">Nombre del Producto</h3>
          <div class="flex flex-col gap-2 mt-2">
            <div>
              <span class="block text-xs line-through" style="color:var(--muted,#64748b);">$199.00</span>
              <span class="font-extrabold text-base">$149.00</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
```

**Clases Tailwind en producto:**
- `.product-card` → La tarjeta (overridear con tu CSS)
- `.relative` → Contenedor de imagen
- `.w-full` → Imagen ancho completo
- `.aspect-square` → Relación 1:1
- `.object-cover` → Object-fit cover
- `.absolute`, `.top-2`, `.left-2`, `.right-2` → Posición de badges
- `.badge-offer` → Badge de descuento
- `.p-3.5` → Padding del contenido
- `.text-[10px]` → Tamaño de categoría
- `.font-bold`, `.text-sm`, `.font-extrabold`, `.text-base` → Pesos de fuente
- `.flex`, `.flex-col`, `.gap-2` → Layout de precios

### 3.17 PRODUCTOS (lista)

```html
<div class="product-row flex items-center gap-4" data-id="123" data-cat="1" data-search="..."
     style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:var(--radius,16px);padding:10px;cursor:pointer;">
  <img src="URL_IMAGEN" class="w-20 h-20 rounded-2xl object-cover shrink-0" />
  <div class="flex-1 min-w-0">
    <div class="flex items-baseline justify-between gap-3">
      <h3 class="font-bold text-sm">Nombre</h3>
      <div class="text-right shrink-0">
        <span class="block text-xs line-through" style="color:var(--muted,#64748b);">$199</span>
        <span class="font-black text-base">$149</span>
      </div>
    </div>
    <p class="text-xs mt-0.5" style="color:var(--muted,#64748b);">Descripción corta</p>
    <div class="mt-2 flex items-center gap-2 flex-wrap">
      <span class="text-[10px] font-bold uppercase tracking-wider" style="color:var(--muted,#64748b);">Categoría</span>
      <span class="badge-offer">-25%</span>
    </div>
  </div>
</div>
```

### 3.18 DESTACADOS

```html
<div data-sec="destacados" style="margin:0 0 18px;">
  <div class="pv-section-title">⭐ Destacados</div>
  <div class="prod-grid grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 items-start">
    <!-- Mismo HTML que PRODUCTOS grid, pero solo productos destacados -->
  </div>
</div>
```

### 3.19 OFERTAS

```html
<div data-sec="ofertas" style="margin:0 0 18px;">
  <div class="pv-section-title">🔥 Ofertas</div>
  <div class="prod-grid grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 items-start">
    <!-- Mismo HTML que PRODUCTOS grid, pero solo productos con old_price -->
  </div>
</div>
```

### 3.20 FILTROS

```html
<div data-sec="filtros" style="margin:0 0 18px;">
  <div class="relative" style="position:relative;margin-bottom:12px;">
    <input id="search-input" oninput="applySearch()" placeholder="Buscar productos…"
           style="width:100%;padding:10px 14px 10px 40px;border:1px solid var(--border,#e2e8f0);border-radius:12px;font-size:14px;background:var(--card,#fff);color:inherit;outline:none;" />
    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted,#94a3b8);">🔍</span>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <button onclick="filterCat(0)" class="cat-chip chip-active" style="border:1px solid var(--border,#e2e8f0);background:var(--card,#fff);border-radius:999px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;">✨ Todos</button>
    <button onclick="filterCat(1)" data-cat="1" class="cat-chip chip-idle" style="...">Categoría</button>
  </div>
</div>
```

### 3.21 VIDEO (YouTube)

```html
<div data-sec="video" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Título Video</h2>
  <div style="position:relative;padding-top:56.25%;border-radius:var(--radius,16px);overflow:hidden;background:#000;">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Título" loading="lazy"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
  </div>
</div>
```

### 3.22 VIDEO (directo)

```html
<div data-sec="video" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Título</h2>
  <video src="URL_VIDEO" controls playsinline preload="metadata"
         style="width:100%;max-height:480px;border-radius:var(--radius,16px);background:#000;display:block;"></video>
</div>
```

### 3.23 GALERÍA (grid)

```html
<div data-sec="galeria" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Galería</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
    <img src="URL_1" alt="" loading="lazy"
         style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;border:1px solid rgba(15,23,42,.08);background:#eee;box-shadow:0 6px 16px rgba(15,23,42,.04);">
    <img src="URL_2" ...>
    <img src="URL_3" ...>
  </div>
</div>
```

### 3.24 GALERÍA (slider)

```html
<div data-sec="galeria" style="margin:0 0 18px;">
  <h2>Galería</h2>
  <div style="display:flex;overflow-x:auto;gap:12px;padding:8px 2px 14px;scroll-snap-type:x proximity;scrollbar-width:none;">
    <img src="URL" style="flex:0 0 calc((100% - 24px) / 1.35);min-width:180px;max-width:300px;scroll-snap-align:start;height:220px;object-fit:cover;border-radius:16px;">
    <!-- Más imágenes -->
  </div>
</div>
```

### 3.25 GALERÍA (masonry)

```html
<div data-sec="galeria" style="margin:0 0 18px;">
  <h2>Galería</h2>
  <div style="column-count:3;column-gap:12px;">
    <img src="URL" style="display:block;width:100%;margin:0 0 12px;border-radius:14px;object-fit:cover;break-inside:avoid;">
    <!-- Más imágenes -->
  </div>
</div>
```

### 3.26 CARRUSEL

```html
<div data-sec="carrusel" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Carrusel</h2>
  <div class="ct-sld" style="position:relative;overflow:hidden;">
    <div class="ct-sld-track" style="display:flex;gap:0;transition:transform .3s;">
      <div class="ct-sld-slide" style="flex:0 0 100%;min-width:0;">
        <img src="URL_1" style="width:100%;height:300px;object-fit:cover;border-radius:16px;">
      </div>
      <!-- Más slides -->
    </div>
    <button class="ct-sld-arrow ct-sld-prev" data-sld-nav="-1" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);">‹</button>
    <button class="ct-sld-arrow ct-sld-next" data-sld-nav="1" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);">›</button>
    <div class="ct-sld-dots" style="display:flex;gap:6px;justify-content:center;margin-top:10px;">
      <button class="ct-sld-dot active" data-sld-dot="0" style="width:8px;height:8px;border-radius:50%;"></button>
      <button class="ct-sld-dot" data-sld-dot="1" style="width:8px;height:8px;border-radius:50%;"></button>
    </div>
  </div>
</div>
```

**Clases del carrusel:**
- `.ct-sld` → Contenedor slider
- `.ct-sld-track` → Pista de slides (flex)
- `.ct-sld-slide` → Cada slide
- `.ct-sld-card` → Variante cards
- `.ct-sld-arrow` → Flechas
- `.ct-sld-prev` / `.ct-sld-next` → Dirección
- `.ct-sld-dots` → Contenedor dots
- `.ct-sld-dot` → Cada dot

### 3.27 MAPA

```html
<div data-sec="mapa" style="margin:0 0 18px;">
  <iframe src="https://www.google.com/maps/embed?pb=..." style="width:100%;height:300px;border:0;border-radius:12px;" loading="lazy"></iframe>
</div>
```

### 3.28 FAQ (Preguntas Frecuentes)

```html
<div data-sec="faq" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Preguntas Frecuentes</h2>
  <details style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;margin-bottom:8px;overflow:hidden;">
    <summary style="padding:12px 14px;font-weight:700;cursor:pointer;">¿Pregunta?</summary>
    <div style="padding:0 14px 12px;color:var(--muted,#64748b);font-size:13px;line-height:1.5;">Respuesta aquí</div>
  </details>
  <details style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;margin-bottom:8px;overflow:hidden;">
    <summary style="padding:12px 14px;font-weight:700;cursor:pointer;">¿Otra pregunta?</summary>
    <div style="padding:0 14px 12px;color:var(--muted,#64748b);font-size:13px;line-height:1.5;">Otra respuesta</div>
  </details>
</div>
```

### 3.29 TESTIMONIOS

```html
<div data-sec="testimonios" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Lo que dicen nuestros clientes</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">

    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:34px 26px;background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:22px;box-shadow:0 16px 38px rgba(15,15,15,.09);position:relative;overflow:hidden;">
      <!-- Comilla decorativa -->
      <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-size:120px;font-family:Georgia,'Times New Roman',serif;color:var(--accent,#ea580c);opacity:.12;line-height:1;pointer-events:none;">&ldquo;</div>
      <!-- Estrellas -->
      <div style="font-size:14px;color:#f59e0b;margin-bottom:12px;">★★★★★</div>
      <!-- Review -->
      <p style="font-size:15px;line-height:1.7;color:var(--text,#1f2937);font-style:italic;margin:0 0 20px;">El review del cliente aquí</p>
      <!-- Avatar + nombre -->
      <div style="display:flex;align-items:center;gap:11px;">
        <img src="URL_AVATAR" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid var(--accent,#ea580c);flex:none;" />
        <div>
          <div style="font-weight:800;font-size:15px;color:var(--text,#1f2937);">Nombre</div>
          <div style="font-size:12px;color:var(--muted,#64748b);">Cliente</div>
        </div>
      </div>
    </div>

  </div>
</div>
```

### 3.30 INFO (Contacto + Horarios)

```html
<div data-sec="info" style="margin:0 0 18px;padding:18px 22px;border:1px solid var(--border,#e2e8f0);border-radius:var(--radius,16px);">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Información</h2>
  <div style="font-size:13px;color:var(--muted,#64748b);">
    <div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0;">
      <span style="font-weight:700;">Lunes</span><span>09:00 – 18:00</span>
    </div>
    <div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0;">
      <span style="font-weight:700;">Martes</span><span>09:00 – 18:00</span>
    </div>
  </div>
  <a href="https://wa.me/52XXXXXXXXXX" class="btn-primary btn-wa" style="display:inline-flex;align-items:center;gap:8px;margin-top:12px;text-decoration:none;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
    Escríbenos por WhatsApp
  </a>
</div>
```

### 3.31 HORARIO

```html
<div data-sec="horario" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Horario</h2>
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;">
    <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06);">
      <span style="font-weight:700;">Lunes</span>
      <span style="color:var(--muted,#64748b);">09:00 – 18:00</span>
    </div>
    <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06);">
      <span style="font-weight:700;">Martes</span>
      <span style="color:var(--muted,#64748b);">09:00 – 18:00</span>
    </div>
  </div>
</div>
```

### 3.32 CONTACTO (Formulario)

```html
<div data-sec="contacto" style="margin:0 0 18px;text-align:left;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Contáctanos</h2>
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:20px;">
    <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">Envíanos un mensaje</p>
    <form class="ct-contact-form" data-wa="52XXXXXXXXXX" data-boton="Enviar"
          onsubmit="ctEnviarContacto(this); return false;"
          style="display:grid;gap:8px;margin:0;text-align:left;">
      <input name="nombre" type="text" required placeholder="Nombre"
             style="padding:11px 14px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:#fff;font-size:13px;" />
      <input name="telefono" type="tel" placeholder="Teléfono / WhatsApp"
             style="padding:11px 14px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:#fff;font-size:13px;" />
      <textarea name="mensaje" required rows="3" placeholder="Mensaje"
                style="padding:11px 14px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:#fff;font-size:13px;resize:none;"></textarea>
      <button type="submit"
              style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:var(--radius,12px);font-weight:800;font-size:14px;background:var(--accent,#2563eb);color:#fff;border:0;cursor:pointer;">
        💬 Enviar
      </button>
    </form>
  </div>
</div>
```

### 3.33 STATS

```html
<div data-sec="stats" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Nuestros Números</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
    <div style="text-align:center;padding:16px 8px;background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;">
      <div style="font-size:32px;font-weight:900;color:var(--accent,#2563eb);">500+</div>
      <div style="font-size:12px;color:var(--muted,#64748b);margin-top:6px;text-transform:uppercase;letter-spacing:.05em;">Clientes</div>
    </div>
    <div style="text-align:center;padding:16px 8px;background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;">
      <div style="font-size:32px;font-weight:900;color:var(--accent);">10</div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px;text-transform:uppercase;">Años</div>
    </div>
    <div style="text-align:center;padding:16px 8px;background:var(--card,#fff);border:1px solid var(--border);border-radius:12px;">
      <div style="font-size:32px;font-weight:900;color:var(--accent);">4.9</div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px;text-transform:uppercase;">Rating</div>
    </div>
  </div>
</div>
```

### 3.34 PRECIOS

```html
<div data-sec="precios" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Lista de Precios</h2>
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px solid rgba(0,0,0,.06);">
      <span style="font-weight:600;">Corte de cabello</span>
      <span style="font-weight:900;color:var(--accent,#2563eb);font-size:16px;">$150</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px solid rgba(0,0,0,.06);">
      <span style="font-weight:600;">Barba</span>
      <span style="font-weight:900;color:var(--accent);font-size:16px;">$80</span>
    </div>
  </div>
</div>
```

### 3.35 CARD (contenedor recursivo)

```html
<div data-sec="card" style="margin:0 0 18px;">
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="padding:14px 16px;border-bottom:1px solid var(--border,#e2e8f0);">
      <h2 style="font-size:17px;font-weight:800;margin:0;">Título de Card</h2>
    </div>
    <!-- Body: componentes anidados -->
    <div style="padding:14px 16px;">
      <!-- Aquí van otros componentes recursivamente -->
    </div>
    <!-- Footer: componentes anidados -->
    <div style="padding:12px 16px;border-top:1px solid var(--border,#e2e8f0);">
      <!-- Aquí van otros componentes recursivamente -->
    </div>
  </div>
</div>
```

### 3.36 FONDO (sección con fondo)

```html
<div data-sec="fondo" id="pag-ID" style="margin:0 0 18px;padding:20px;background:#f0f0f0;border-radius:var(--radius,16px);">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Título Sección</h2>
  <!-- Componentes anidados aquí -->
</div>
```

**Atributos de fondo:**
- `bg`: color sólido
- `bg2`: color secundario para gradiente
- `bgType`: solid, linear, radial, conic, image, pattern
- `bgAngle`: ángulo del gradiente
- `bgImage`: URL de imagen
- `bgPattern`: puntos, cuadros, horizontales, rayas
- `bgPatternC`: color del patrón

### 3.37 SECCIÓN (página/sección)

```html
<div data-sec="seccion" id="pag-ID" style="margin:0 0 26px;padding:20px;background:transparent;border-radius:0;">
  <h2 style="font-size:19px;font-weight:800;margin:0 0 10px;">Título Sección</h2>
  <!-- Componentes anidados aquí -->
</div>
```

### 3.38 CUPÓN

```html
<div data-sec="cupon" style="margin:0 0 18px;text-align:center;">
  <div style="border:2px dashed var(--accent,#2563eb);border-radius:14px;padding:20px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted,#64748b);margin-bottom:6px;">Cupón de Descuento</div>
    <p style="font-size:14px;margin:0;">Usa este código en tu próxima compra</p>
    <div style="font-size:28px;font-weight:900;letter-spacing:.15em;color:var(--accent);padding:8px 0;">VERANO25</div>
    <a href="https://wa.me/52XXXXXXXXXX?text=Quiero%20usar%20el%20cupón%20VERANO25" class="btn-primary"
       style="display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:12px 24px;border-radius:999px;font-weight:800;text-decoration:none;font-size:14px;background:var(--accent);color:#fff;">
      Canjear Cupón
    </a>
  </div>
</div>
```

### 3.39 PROMO (barra promocional)

```html
<div data-sec="promo" style="margin:0 0 18px;background:linear-gradient(135deg,#1a1a1a,#333);color:#fff;border-radius:16px;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
  <div>
    <div style="font-weight:800;font-size:18px;">Promoción Especial</div>
    <div style="font-size:13px;opacity:.9;margin-top:4px;">Solo por tiempo limitado</div>
  </div>
  <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
    <div style="font-size:28px;font-weight:900;">$99</div>
    <a href="https://wa.me/52XXXXXXXXXX" target="_blank" rel="noopener"
       style="background:var(--accent);color:#fff;padding:10px 20px;border-radius:999px;font-weight:800;text-decoration:none;font-size:13px;">Comprar</a>
  </div>
</div>
```

### 3.40 COMPARATIVA (tabla)

```html
<div data-sec="comparativa" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Comparativa</h2>
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;overflow:hidden;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:12px;background:rgba(37,99,235,.08);border-bottom:2px solid var(--accent);font-weight:800;">Feature</th>
          <th style="padding:12px;background:rgba(37,99,235,.08);border-bottom:2px solid var(--accent);font-weight:800;">Básico</th>
          <th style="padding:12px;background:rgba(37,99,235,.08);border-bottom:2px solid var(--accent);font-weight:800;">Premium</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#fff;">
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);">Almacenamiento</td>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-weight:700;">10GB</td>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-weight:700;">100GB</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);">Soporte</td>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-weight:700;">Email</td>
          <td style="padding:10px 12px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-weight:700;">24/7</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 3.41 TIMELINE

```html
<div data-sec="timeline" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Nuestra Historia</h2>
  <div style="padding-left:8px;">
    <div style="display:flex;gap:16px;padding:8px 0;position:relative;">
      <div style="flex:none;display:flex;flex-direction:column;align-items:center;width:20px;">
        <div style="width:14px;height:14px;border-radius:50%;background:var(--accent);border:3px solid var(--card,#fff);box-shadow:0 0 0 2px var(--accent);z-index:1;"></div>
        <div style="width:2px;flex:1;background:rgba(37,99,235,.25);margin-top:4px;"></div>
      </div>
      <div>
        <div style="font-weight:900;color:var(--accent);font-size:13px;">2020</div>
        <div style="font-size:14px;margin-top:2px;">Fundación del negocio</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;padding:8px 0;position:relative;">
      <div style="flex:none;display:flex;flex-direction:column;align-items:center;width:20px;">
        <div style="width:14px;height:14px;border-radius:50%;background:var(--accent);border:3px solid var(--card);box-shadow:0 0 0 2px var(--accent);z-index:1;"></div>
      </div>
      <div>
        <div style="font-weight:900;color:var(--accent);font-size:13px;">2023</div>
        <div style="font-size:14px;margin-top:2px;">Apertura de segunda sucursal</div>
      </div>
    </div>
  </div>
</div>
```

### 3.42 PASOS

```html
<div data-sec="pasos" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Cómo Funciona</h2>
  <div style="padding-left:16px;">
    <div style="display:flex;gap:14px;padding:10px 0;position:relative;">
      <div style="flex:none;width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;z-index:1;">1</div>
      <div style="padding-top:4px;">
        <div style="font-weight:700;font-size:14px;">Paso Uno</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;line-height:1.4;">Descripción del paso</div>
      </div>
    </div>
    <div style="display:flex;gap:14px;padding:10px 0;">
      <div style="flex:none;width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">2</div>
      <div style="padding-top:4px;">
        <div style="font-weight:700;font-size:14px;">Paso Dos</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;">Otra descripción</div>
      </div>
    </div>
  </div>
</div>
```

### 3.43 CARACTERÍSTICAS

```html
<div data-sec="caracteristicas" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Características</h2>
  <div style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);display:flex;gap:10px;">
    <span style="color:var(--accent);font-size:16px;flex:none;">✓</span>
    <div>
      <div style="font-weight:700;font-size:14px;">Feature 1</div>
      <div style="font-size:13px;color:var(--muted);margin-top:2px;">Descripción de la feature</div>
    </div>
  </div>
  <div style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);display:flex;gap:10px;">
    <span style="color:var(--accent);font-size:16px;flex:none;">✓</span>
    <div>
      <div style="font-weight:700;font-size:14px;">Feature 2</div>
      <div style="font-size:13px;color:var(--muted);margin-top:2px;">Otra descripción</div>
    </div>
  </div>
</div>
```

### 3.44 EQUIPO

```html
<div data-sec="equipo" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Nuestro Equipo</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
    <div style="text-align:center;padding:14px 8px;">
      <img src="URL_FOTO" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid var(--card,#fff);box-shadow:0 2px 8px rgba(0,0,0,.1);margin:0 auto 10px;display:block;" />
      <div style="font-weight:800;font-size:14px;">Nombre</div>
      <div style="font-size:12px;color:var(--muted);margin-top:2px;">Puesto</div>
    </div>
  </div>
</div>
```

### 3.45 MARCAS

```html
<div data-sec="marcas" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Marcas</h2>
  <div style="display:flex;flex-wrap:wrap;gap:4px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid var(--border);border-radius:999px;font-weight:700;font-size:13px;background:var(--card);margin:4px;">Marca A</div>
    <div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid var(--border);border-radius:999px;font-weight:700;font-size:13px;background:var(--card);margin:4px;">Marca B</div>
  </div>
</div>
```

### 3.46 SUCURSALES

```html
<div data-sec="sucursales" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Sucursales</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;">
    <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex:none;">📍</div>
    <div>
      <div style="font-weight:800;font-size:14px;">Sucursal Centro</div>
      <div style="font-size:13px;color:var(--muted);margin-top:2px;">Calle Principal #123</div>
      <div style="font-size:13px;color:var(--muted);">+52 55 1234 5678</div>
    </div>
  </div>
</div>
```

### 3.47 NOTICIAS

```html
<div data-sec="noticias" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Noticias</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;">
      <div style="font-weight:800;font-size:15px;">Título de la noticia</div>
      <div style="flex:none;font-size:11px;color:var(--muted);background:var(--border);padding:3px 8px;border-radius:999px;white-space:nowrap;">Hace 2 días</div>
    </div>
    <div style="font-size:13px;color:var(--muted);margin-top:6px;line-height:1.4;">Resumen de la noticia aquí...</div>
  </div>
</div>
```

### 3.48 NEWSLETTER

```html
<div data-sec="newsletter" style="margin:0 0 18px;background:var(--accent);color:#fff;border-radius:16px;padding:24px;text-align:center;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Suscríbete</h2>
  <div style="font-size:13px;opacity:.8;margin-bottom:12px;">Recibe ofertas exclusivas</div>
  <div style="display:flex;gap:8px;max-width:420px;margin:0 auto;">
    <input placeholder="Tu email" disabled
           style="flex:1;padding:12px 16px;border:1px solid rgba(255,255,255,.3);border-radius:10px;background:rgba(255,255,255,.15);color:#fff;font-size:14px;" />
    <a href="https://wa.me/52XXXXXXXXXX" class="btn-primary"
       style="background:#fff;color:var(--accent);padding:12px 20px;border-radius:10px;font-weight:800;text-decoration:none;font-size:14px;white-space:nowrap;">Suscribir</a>
  </div>
</div>
```

### 3.49 COUNTDOWN

```html
<div data-sec="countdown" style="margin:0 0 18px;text-align:center;background:var(--accent);padding:24px;border-radius:14px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;color:#fff;">Oferta termina en</h2>
  <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:.05em;">31 DIC 2025</div>
  <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:8px;">No te lo pierdas</div>
</div>
```

### 3.50 CTA (Call to Action)

```html
<div data-sec="cta" style="margin:0 0 18px;background:var(--accent);color:#fff;text-align:center;padding:24px;border-radius:14px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">¿Listo para empezar?</h2>
  <div style="font-size:13px;opacity:.8;margin-bottom:14px;">Contacta hoy mismo</div>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a href="https://wa.me/52XXXXXXXXXX" style="background:#fff;color:var(--accent);padding:12px 28px;border-radius:999px;font-weight:800;text-decoration:none;font-size:14px;">WhatsApp</a>
    <a href="tel:+52XXXXXXXXXX" style="border:2px solid #fff;color:#fff;padding:10px 28px;border-radius:999px;font-weight:800;text-decoration:none;font-size:14px;">Llamar</a>
  </div>
</div>
```

### 3.51 RESERVA

```html
<div data-sec="reserva" style="margin:0 0 18px;background:var(--accent);color:#fff;border-radius:14px;padding:24px;text-align:center;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Reserva tu Mesa</h2>
  <div style="font-size:13px;opacity:.8;margin-bottom:12px;">Disponible de 13:00 a 23:00</div>
  <a href="https://wa.me/52XXXXXXXXXX?text=Quiero%20reservar%20una%20mesa"
     style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--accent);padding:12px 24px;border-radius:12px;font-weight:800;text-decoration:none;font-size:14px;">📅 Reservar</a>
</div>
```

### 3.52 SERVICIOS

```html
<div data-sec="servicios" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Nuestros Servicios</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;">
    <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);">
      <div style="width:36px;height:36px;border-radius:8px;background:rgba(37,99,235,.1);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;flex:none;">🛠️</div>
      <div>
        <div style="font-weight:700;font-size:14px;">Reparación</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;">Arreglo de todo tipo de equipos</div>
      </div>
    </div>
  </div>
</div>
```

### 3.53 UBICACIÓN

```html
<div data-sec="ubicacion" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Ubicación</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
    <iframe src="https://www.google.com/maps/embed?pb=..." style="width:100%;height:200px;border:none;border-radius:10px;" loading="lazy"></iframe>
    <div style="padding:12px 14px;font-size:13px;color:var(--muted);line-height:1.5;">Calle Principal #123, Colonia, Ciudad</div>
  </div>
</div>
```

### 3.54 ANTES/DESPUÉS

```html
<div data-sec="antesdespues" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Resultados</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div>
      <img src="URL_ANTES" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;border:1px solid var(--border);">
      <div style="text-align:center;font-size:12px;color:var(--muted);margin-top:6px;font-weight:600;">Antes</div>
    </div>
    <div>
      <img src="URL_DESPUES" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;border:1px solid var(--border);">
      <div style="text-align:center;font-size:12px;color:var(--muted);margin-top:6px;font-weight:600;">Después</div>
    </div>
  </div>
</div>
```

### 3.55 PREMIOS

```html
<div data-sec="premios" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Premios</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;">
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.05);">
      <div style="width:36px;height:36px;border-radius:8px;background:rgba(37,99,235,.1);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:18px;">🏆</div>
      <div style="flex:1;"><div style="font-weight:700;font-size:14px;">Mejor Negocio 2024</div></div>
      <div style="font-size:12px;color:var(--muted);">Cámara de Comercio</div>
    </div>
  </div>
</div>
```

### 3.56 QR

```html
<div data-sec="qr" style="margin:0 0 18px;text-align:center;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Código QR</h2>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;display:inline-block;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CONTENIDO" alt="QR"
         style="width:160px;height:160px;border-radius:8px;" />
    <div style="font-size:13px;color:var(--muted);margin-top:10px;">Escanea para visitar</div>
  </div>
</div>
```

### 3.57 AUDIO

```html
<div data-sec="audio" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Audio</h2>
  <audio controls src="URL_AUDIO" style="width:100%;border-radius:12px;"></audio>
</div>
```

### 3.58 DESCARGA

```html
<div data-sec="descarga" style="margin:0 0 18px;text-align:center;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Descargar</h2>
  <a href="URL_ARCHIVO" target="_blank" rel="noopener"
     style="display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#fff;padding:12px 24px;border-radius:12px;font-weight:800;text-decoration:none;font-size:14px;">📥 Descargar PDF</a>
  <div style="font-size:11px;color:var(--muted);margin-top:6px;word-break:break-all;">URL del archivo</div>
</div>
```

### 3.59 HTML CRUDO

```html
<div data-sec="html" style="margin:0 0 18px;">
  <h2 style="font-size:18px;font-weight:800;margin:0 0 10px;">Contenido Personalizado</h2>
  <!-- Aquí va el HTML cruyo que el usuario escriba -->
  <div style="padding:20px;background:#f0f0f0;border-radius:12px;">
    <p>HTML personalizado aquí</p>
  </div>
</div>
```

### 3.60 MÁSCARA (contenedor con forma)

```html
<div data-sec="mascara" class="pv-mascara" style="width:200px;height:200px;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);-webkit-clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);overflow:hidden;position:relative;display:flex;align-items:stretch;">
  <div class="mascara-inner" style="display:grid;grid-template-columns:1fr;gap:0;width:100%;height:100%;">
    <div class="mascara-child" style="min-height:0;">
      <!-- Componente anidado aquí -->
    </div>
  </div>
</div>
```

**Formas de clip-path disponibles:**
- `circle(50% at 50% 50%)` → Círculo
- `inset(0 round 0px)` → Cuadrado
- `inset(0 round 16px)` → Rectángulo redondeado
- `inset(0 round 999px)` → Pill
- `polygon(50% 0%,100% 50%,50% 100%,0% 50%)` → Diamante
- `polygon(50% 0%,100% 100%,0% 100%)` → Triángulo
- `polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)` → Estrella 5 puntas

---

## 4. CLASES GLOBALES DE ANIMACIÓN

Cualquier componente puede animarse con estas clases:

| Clase | Efecto |
|---|---|
| `ct-anim-fade` | Aparece de transparente |
| `ct-anim-up` | Sube desde abajo |
| `ct-anim-down` | Baja desde arriba |
| `ct-anim-left` | Entra desde la izquierda |
| `ct-anim-right` | Entra desde la derecha |
| `ct-anim-zoom` | Crece desde pequeño |

**Duración:**

| Clase | Velocidad |
|---|---|
| `ct-dur-flash` | Muy rápido |
| `ct-dur-rapido` | Rápido |
| `ct-dur-normal` | Normal |
| `ct-dur-lento` | Lento |
| `ct-dur-muy-lento` | Muy lento |
| `ct-dur-relajada` | Relajado |
| `ct-dur-cinematica` | Cinematográfico |
| `ct-dur-epica` | Épico |

**Hover:**

| Clase | Efecto |
|---|---|
| `ct-hov-scale` | Crece al pasar mouse |
| `ct-hov-lift` | Sube al pasar mouse |
| `ct-hov-glow` | Brilla al pasar mouse |

---

## 5. EJEMPLO COMPLETO DE PLANTILLA

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= biz.name %> · Mi Plantilla</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    :root {
      --accent:#6366f1; --accent2:#8b5cf6;
      --bg:#f8fafc; --text:#0f172a; --muted:#64748b;
      --card:#ffffff; --border:#e2e8f0;
      --radius:16px;
      --head-font:'Inter',sans-serif;
      --body-font:'Inter',sans-serif;
    }
    body { font-family:var(--body-font); background:var(--bg); color:var(--text); min-height:100vh; }
    h1,h2,h3,h4,h5,h6 { font-family:var(--head-font); }
    .product-card { background:var(--card)!important; border:1px solid var(--border)!important; border-radius:var(--radius)!important; overflow:hidden; transition:all .25s!important; }
    .product-card:hover { transform:translateY(-4px)!important; box-shadow:0 12px 32px rgba(0,0,0,.08)!important; }
    .badge-offer { background:var(--accent)!important; color:#fff!important; font-size:.6rem; font-weight:800; padding:.15rem .6rem; border-radius:60px; }
    .chip-active { background:var(--accent)!important; color:#fff!important; border-radius:999px!important; }
    .chip-idle { background:var(--card)!important; color:var(--text)!important; border:1px solid var(--border)!important; border-radius:999px!important; }
    .chip-idle:hover { background:var(--accent)!important; color:#fff!important; }
    .search-input { background:var(--card)!important; color:var(--text)!important; border:1px solid var(--border)!important; border-radius:12px!important; }
    .search-input:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px rgba(99,102,241,.12)!important; }
    .cat-chip { border-radius:999px!important; }
    .btn-primary { display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.6rem;border-radius:60px;font-weight:700;font-size:.8rem;background:var(--accent);color:#fff;border:none;cursor:pointer;transition:all .2s; }
    .btn-primary:hover { transform:scale(1.03); }
    .btn-wa { background:#22c55e!important; }
    .cart-bar { backdrop-filter:blur(20px);background:rgba(15,23,42,.85)!important;border:1px solid rgba(255,255,255,.1); }
    .pv-section-title { font-size:20px;font-weight:800;margin:0 0 14px; }
    .footer-muted { color:var(--muted);border-top:1px solid var(--border); }
    .verify-badge { position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;background:#22c55e;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:900; }
  </style>
</head>
<body>
  <header data-sec="hero" style="background:linear-gradient(135deg,var(--accent),var(--accent2));padding:32px 16px;text-align:center;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="position:relative;display:inline-block;">
        <img src="<%= biz.logo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(biz.name) + '&background=fff&color=' + '6366f1' + '&size=80' %>"
             style="width:80px;height:80px;border-radius:20px;object-fit:cover;border:4px solid rgba(255,255,255,.3);box-shadow:0 8px 32px rgba(0,0,0,.2);"
             alt="<%= biz.name %>" />
        <span class="verify-badge">✓</span>
      </div>
      <h1 style="font-size:36px;font-weight:900;color:#fff;margin-top:16px;letter-spacing:-.03em;" data-editable="name"><%= biz.name %></h1>
      <p style="font-size:15px;color:rgba(255,255,255,.85);margin-top:8px;max-width:500px;margin-left:auto;margin-right:auto;"><%= biz.description %></p>
      <a href="<%= `https://wa.me/${biz.whatsapp.startsWith('52') ? biz.whatsapp : '52' + biz.whatsapp}` %>"
         class="btn-primary btn-wa" style="margin-top:20px;border-radius:999px;padding:12px 28px;font-size:14px;">
        💬 Contactar por WhatsApp
      </a>
    </div>
  </header>
  <main data-sec="contenido" style="max-width:1100px;margin:0 auto;padding:24px 16px 112px;">
    <%- include('../partials/components', { biz, products, money, categories, components, pages, editMode, mascaraCss: mascaraCss, mascaraConfig: mascaraConfig }) %>
  </main>
  <%- include('../partials/cart-js', { biz, products }) %>
</body>
</html>
```
