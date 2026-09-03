# Documentación del proyecto — Catálogo Digital por Nessik

Documento de entrega para el equipo externo (desarrolladores / diseñador de páginas).

---

## 1. Qué es

**Catálogo Digital** es un producto de **Nessik** para PYMES (ferreterías, tiendas, restaurantes…). Cada negocio tiene su catálogo público con filtros, variantes, promociones y pedido por WhatsApp. El dueño administra todo desde un panel y el equipo de Nessik gestiona las tiendas y planes desde el panel maestro.

No es un e-commerce con pasarela de pago: la "venta" se cierra por WhatsApp (el pedido abre un chat con el mensaje armado).

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | **JavaScript (Node.js)** — todo el proyecto |
| Backend | **Express** (servidor HTTP + API) |
| Vistas | **EJS** (plantillas server-side) + **Tailwind CSS** (vía CDN) |
| Base de datos | **SQLite** (un solo archivo `data.db`) con `better-sqlite3` |
| Subida de archivos | **multer** (imágenes a `public/uploads/`) |
| Excel | **exceljs** (importar/exportar catálogo) + `xlsx` |
| QR | **qrcode** |
| PWA | `public/sw.js` + `public/pwa.js` + manifest |

### Dependencias exactas (`package.json`)

```
better-sqlite3 ^11.10.0
ejs ^3.1.10
exceljs ^4.4.0
express ^4.21.2
multer ^2.2.0
qrcode ^1.5.4
xlsx ^0.18.5
```

### Cómo correrlo

```bash
npm install
npm start        # o: node server.js
# Abrir http://localhost:3000
```

- **Demo**: tienda `ferreteria-demo` (PIN dueño = `1234`). URL: `http://localhost:3000/ferreteria-demo`
- **Panel de la tienda**: `http://localhost:3000/ferreteria-demo/admin`
- **Panel maestro**: `http://localhost:3000/maestro` (código maestro en `.env`)
- **Reiniciar** (Windows PowerShell): `Get-Process node | Stop-Process -Force; node server.js`

### Secretos

- `.env` (NO versionar): contiene una `MASTER_KEY` privada de al menos 32 caracteres. Nunca debe escribirse en documentación ni subirse a GitHub.
- `data.db`, `data.db-shm`, `data.db-wal` (NO versionar): la base de datos.

---

## 3. Estructura de archivos

```
server.js              # Toda la lógica (Express + rutas + helpers). ~2700 líneas.
db.js                  # Esquema de SQLite + migraciones + seed.
seed-demo.js           # Datos de ejemplo (ferretería demo).
seed-extra-stores.js   # Tiendas/giros extra para la demo.
.env                   # MASTER_KEY (secreto).
views/
  login.ejs            # Login dueño/empleado (PIN).
  landing.ejs          # Landing pública.
  register.ejs         # Registro de nueva tienda.
  catalog.ejs          # Redirige a la plantilla de catálogo.
  producto.ejs         # Página de un producto (ficha).
  catalogo-print.ejs   # Vista imprimible (PDF).
  panel.ejs            # Dashboard (métricas, pedidos, gráficas).
  productos.ejs        # CRUD productos + variantes + categorías + atributos.
  clientes.ejs         # Mini-CRM (clientes + envío de promos).
  proveedores.ejs      # Proveedores + pedidos de compra.
  empleados.ejs        # Empleados + permisos granulares.
  config.ejs           # Config (datos, horario, PIN, diseño).
  diseno.ejs           # Constructor de diseño (plantillas/colores/secciones).
  planes.ejs           # Planes.
  importar.ejs         # Carga masiva (Excel).
  importar-mapear.ejs  # Mapeo de columnas al importar.
  maestro.ejs          # Panel maestro (tiendas, planes, suspensión).
  404.ejs, store-off.ejs
  admin/
    head.ejs           # <head> + setup Tailwind (admin).
    sidebar.ejs        # Menú lateral + menú inferior móvil + notificaciones.
    panel-ajax.ejs     # SPA-lite: envío de formularios por fetch.
    toast.ejs          # Toast (SweetAlert2).
  partials/
    cart-js.ejs        # LÓGICA DEL CATÁLOGO: carrito, filtros/faceting, variantes,
                       # compartir, chatbox, badge abierto/cerrado. (~900 líneas JS).
    catalog-sidebar.ejs# Sidebar de filtros (categorías, precio, atributos).
    product-ad.ejs     # Tarjeta de "Otro negocio" (publicidad cruzada).
    product-ad-row.ejs, design.ejs, upload-js.ejs
  templates/           # 10 plantillas de catálogo (clasica, ofertas, premium,
                       #   portada, revista, barrio, galeria, juvenil, minimal, restaurante)
public/
  css/material.css     # Sistema de diseño (CSS custom + variables).
  js/material.js
  sw.js, pwa.js, manifest.webmanifest
  icons/, img/sin-imagen.svg, uploads/   # imágenes subidas
tools/make-icons.js
```

---

## 4. Base de datos (SQLite, `data.db`)

Todas las tablas y columnas:

### `businesses` (tiendas)
`id, slug, name, whatsapp, description, logo, banner, pin, active, created_at, template, color, color_hex, show_network, giro, estilo, color_hex2, color_mode, grid_cols, plan, import_map, giros, plan_price, plan_ends_at, suspended, ads_enabled, bg, card, text, muted, border, radius, font, accent, accent2, header, header_text, wa_message, currency, sections, demo, pin_hash, horario, horario_msg`

- `plan`: `free | pro | demo`. `pin_hash`: PIN scrypt (el `pin` legacy se migra).
- `sections`: JSON de secciones visibles/orden (`hero_mode`, `categorias`, `catmode`, `density`, `shadow`, `hover`, `orden`).
- `horario`: JSON `[{d:1..7, o:"09:00", c:"18:00"}]` (1=Lun … 7=Dom). `horario_msg`: mensaje cuando está cerrado.
- `demo`: contenido de ejemplo para la vista previa.

### `products` (productos)
`id, business_id, category_id, name, price, description, image, active, sort, created_at, old_price, featured, stock, variants, promo_ends_at, galeria, promo_type, promo_value, promo_gift, sku, tags, video, specs, barcode`

- `stock`: `NULL` = agotado (vacío/0 = agotado). Solo `>0` permite pedir.
- `variants`: JSON del modelo de variantes (ver §6).
- `promo_type`: `'' | descuento | porcentaje | 2x1 | 3x2 | regalo`.
- `galeria`: JSON array de URLs de fotos extra. `specs`: características "Clave: Valor" por línea.

### `categories`
`id, business_id, name, sort`

### `attribute_templates` (atributos reutilizables)
`id, business_id, name, vals (JSON array), created_at`

### `orders` (pedidos)
`id, business_id, items (texto), total, customer_name, status, paid, created_at, customer_phone`
- `status`: `nuevo | pagado | entregado | cancelado`.

### `customers` (mini-CRM)
`id, business_id, name, phone, notes, created_at`

### `suppliers` / `purchase_orders`
- `suppliers`: `id, business_id, name, phone, notes, created_at`
- `purchase_orders`: `id, business_id, supplier_id, items (JSON), total, received, created_at`

### `employees`
`id, business_id, name, pin_hash, perms (JSON array), created_at`

### `sessions`
`token (PK), biz_id, kind ('owner'|'employee'|'maestro'), created_at, emp_id`

### `plans`
`id, key, name, price, days, max_products, ads, active, design`

### `tracking` (analytics)
`id, business_id, type ('visit'|'view'|'wa'|'wa_product'), detail, created_at`

### `price_history`
`id, business_id, product_id, name, price, old_price, promo_type, promo_gift, created_at`

---

## 5. Rutas principales (API)

### Públicas
- `GET /` — landing
- `POST /registrar` — registrar tienda
- `GET /:slug` — catálogo (tienda)
- `GET /:slug/p/:id` — ficha de producto
- `GET /:slug/pedir` — pedido por WhatsApp (legacy, query params)
- `POST /api/pedir` — pedido multi-tienda (JSON `{items, nombre, telefono}`)

### Autenticación
- `GET/POST /:slug/admin` — login (dueño o empleado, por PIN)
- `GET /:slug/admin/salir` — logout

### Admin (tienda) — la mayoría con CSRF en POST
- `GET /:slug/admin/panel` — dashboard
- `GET/POST /:slug/admin/productos`, `POST /producto`, `POST /producto/:id`, `/:id/eliminar`, `/:id/toggle`, `/:id/featured`, `/:id/mover`
- `POST /:slug/admin/categoria`, `/categoria/:id`, `/categoria/:id/eliminar`
- `POST /:slug/admin/atributo/guardar`, `/atributo/:id`, `/atributo/:id/eliminar`
- `GET/POST /:slug/admin/config`, `GET /diseno`, `GET /planes`, `POST /plan`
- `GET/POST /:slug/admin/empleados`, `POST /empleado`, `/empleado/:id`, `/empleado/:id/reset-pin`, `/empleado/:id/eliminar`
- `GET/POST /:slug/admin/proveedores`, `POST /proveedor`, `/proveedor/:id/eliminar`, `POST /compra`, `POST /compra/:id/recibido`, `/compra/:id/eliminar`
- `GET/POST /:slug/admin/clientes`, `POST /cliente`, `/cliente/:id/eliminar`
- `GET /:slug/admin/reporte` (CSV pedidos)
- `GET /:slug/admin/exportar.xlsx` (Excel catálogo)
- `GET /:slug/admin/catalogo-print` (vista imprimir)
- `GET /:slug/admin/importar`, `GET /plantilla` (Excel plantilla), `POST /importar/vista-previa`, `POST /importar/ejecutar`
- `GET /:slug/admin/api/new-orders`, `GET /api/low-stock`
- `POST /:slug/admin/order/:id/entregado`, `/cancelado`, `/pagado`, `/eliminar`
- `POST /:slug/admin/cambiar-pin`, `POST /resetear-pin` (requiere `master`)
- `POST /:slug/admin/upload` (imagen)
- `GET /:slug/admin/preview` (vista previa diseño)

### Maestro
- `GET/POST /maestro` — login maestro (código)
- `POST /maestro/cerrar`
- `GET /maestro/panel`, `GET /maestro/:id/diseno`, `POST /maestro/:id/config`, `POST /maestro/:id/suspender`, `/reactivar`, `/toggle`, `/ads`, `/plan`, `/vencimiento`
- `POST /maestro/plan`, `/maestro/plan/:id/eliminar`

---

## 6. Conceptos clave

### Modelo de variantes (canónico)
```json
{
  "attrs": [{ "name": "Talla", "values": ["S","M","L"] }, { "name": "Color", "values": ["Azul","Rojo"] }],
  "images": { "S|Azul": "url" },
  "stock":  { "S|Azul": 10 },
  "prices": { "S|Azul": 250 },
  "skus": {}, "barcodes": {}
}
```
- La clave de combinación es `valor1|valor2|...`.
- Formato legacy (array de strings) se normaliza a un atributo con `name:""`.

### Permisos de empleados (granulares)
`productos.ver/crear/editar/eliminar`, `pedidos.gestionar`, `clientes`, `reportes`, `diseno`, `config`, `empleados`. El dueño tiene todos.

### Sesiones y seguridad
- PIN con **scrypt + salt** (`pin_hash`).
- Sesiones con **token aleatorio** (tabla `sessions`), cookie httpOnly `sid`.
- **CSRF** doble-envío (cookie `csrf` + `x-csrf-token`).
- Serialización de JSON en `<script>` con helper `safeJson()` (escapa `<` para evitar XSS).
- Queries con **prepared statements** (sin inyección SQL).

### Promociones
`descuento` (usa `old_price`), `porcentaje` (usa `promo_value`), `2x1`, `3x2`, `regalo` (`promo_gift`).

### Moneda
`businesses.currency` (ISO 4217). Lista `CURRENCIES` y helper `moneyFor`.

### Seguimiento (tracking)
`visit` (visita), `view` (vista de producto), `wa` (pedido enviado), `wa_product` (producto pedido por WhatsApp).

---

## 7. Notas para el equipo externo

- **PWA**: `sw.js` registra un service worker básico; para offline real hay que cachear.
- **HTTPS**: requerido para PWA/cámara/portapapeles en producción.
- **`paintCatalog()`** en `server.js` inyecta CSS por string para aplicar la paleta a las plantillas. En una migración a React esto se sustituye por **CSS variables** (`--accent`, `--bg`, etc.).
- **Subida de imágenes**: solo `.jpg .jpeg .png .gif .webp` (no SVG, evita XSS).

---

## 8. Recomendación de "siguiente nivel"

Si se migra el frontend (hoy EJS + Tailwind CDN):

1. Mantener **Express + SQLite como API** (exponer las rutas de §5 como JSON).
2. Frontend en **React + Vite** (o **Next.js** si se quiere SEO por tienda).
3. Librería de diseño: **shadcn/ui** (Tailwind) para admin; **Mantine** o shadcn para el catálogo.
4. Interactividad inmediata sin migrar: **Alpine.js**, **ApexCharts/Chart.js**, **Lucide**, **Preline/Flowbite**.
5. CSS variables por tienda (en vez de `paintCatalog`).

---

*Generado automáticamente para entrega del proyecto.*
