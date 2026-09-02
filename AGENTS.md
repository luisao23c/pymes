# AGENTS.md — Non-obvious project learnings

## Architecture & rendering

- The public catalog renders `views/catalog.ejs` → which includes `views/templates/constructor.ejs` and `views/partials/cart-js.ejs`. The constructor.ejs is the main template for both the public catalog AND the design editor (`/admin/diseno`).
- `views/partials/cart-js.ejs` contains ALL cart logic (addToCart, renderChat, toggleChat, cart persistence via localStorage key `nessik_cart`, variant picker, lightbox, pagination, filter system). It's loaded on every catalog page.
- The cart panel is a floating chat-style panel (id `chat-panel`), not a traditional cart drawer. The FAB button (id `chat-fab`) toggles it via `toggleChat()`. This is intentional — the cart IS the order dialog with name/phone inputs.
- Products have a `variants` field stored as JSON string. `normVariantModel()` in cart-js.ejs normalizes it into `{ attrs, images, stock, prices }`. Products with variants show a picker modal before adding to cart.

## Server & environment

- `server.js` uses `process.env.PORT || 3000`. The start-server.js forces PORT=3000. `npm run dev` may start on port 0 if PORT env is missing or corrupted — always use `node start-server.js` to restart.
- Database is SQLite via `db.js`. Business data includes `horario` (JSON array of `{d, o, c}` for day/open/close), `wa_message` (template with `{tienda}`, `{productos}`, `{total}` placeholders), and `variants` (JSON on products).
- `safeJson()` in server.js is used by EJS templates to safely output JSON: `<%- safeJson(data) %>`. Use `<%- %>` (unescaped) not `<%= %>` for JSON blocks.

## Template escaping gotchas

- EJS with nested JS strings requires extreme escaping. Adding onclick handlers with `addToCart()` in EJS templates needs 4+ levels of quote escaping: `\\'` for EJS→HTML→JS string boundaries. Using a Node script to patch templates (like `fix-share.js`) is safer than inline str_replace for complex EJS blocks.
- The `_whatsapp` variable in templates comes from `biz.whatsapp` and is the raw phone number (e.g., `528719920338`). The `waNumber()` function in cart-js.ejs handles the 52 prefix.

## Data & state

- Cart localStorage key is `nessik_cart`. Cart objects are keyed by `storeSlug:productId` (or `storeSlug:productId|variant`). Each item has `{ store, id, name, price, image, variant, qty }`.
- `PROMAP` is the client-side product lookup map built server-side from the filtered products array. It excludes ads (`p.isAd`). Products with `stock === null || stock === undefined` are considered infinite stock; `stock <= 0` means agotado.
- The `ferreteria-demo` store has 89 products across 11 categories. `_realProds` filters out sponsored ads from the render loop.
- `_cats` is built from distinct `category_id` values of `_realProds`, not from a categories table.

## CSS & design tokens

- The catalog uses CSS custom properties: `--bg`, `--card`, `--text`, `--muted`, `--accent`, `--border`, `--radius`. The premium palette is crema (#f8f6f2) + azul marino (#1a3c5e). These are defined in `constructor.ejs` `<style>` block, NOT in external CSS files.
- Admin panel CSS is in `views/admin/head.ejs` (variables + component styles) and `views/admin/sidebar.ejs`. The sidebar toggle uses `localStorage` key `sidebar-hidden` to persist state.
- `public/css/material.css` is a base layer loaded on catalog pages. `public/css/premium-catalog.css` overrides it. They should NOT be merged — the project uses a 3-layer CSS architecture.
- Tailwind is loaded via CDN on admin pages but NOT on the public catalog. The catalog uses hand-written CSS with custom properties.

## Filtering system

- `filterCat()` in cart-js.ejs is the GLOBAL filter function (called from category chips). `catalogFilterCat()` was added as a separate name to avoid conflict with `filterCat` redefined in constructor.ejs for block-level filtering.
- Products use `data-search` (lowercase name), `data-cat` (category_id), `data-price` attributes on card divs for client-side filtering. No server-side filter API.
- Pagination uses `data-pag="paginas"` on the grid and `data-per` for items per page. `applyPagination()` handles page state per block key.

## WhatsApp integration

- Share via WhatsApp: `https://wa.me/PHONE?text=MESSAGE`. The `shareWhatsApp()` function builds a message with product name, price, and link. `navigator.share()` is used on mobile for native sharing.
- Order via WhatsApp: `sendStoreOrder(slug)` in cart-js.ejs builds an itemized order message and opens WhatsApp. The `wa_message` template on the business can customize the message format.
