# Catálogo Digital por Nessik

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Dueño de negocio pequeño** (primario): persona no técnica que administra su catálogo, productos y pedidos de WhatsApp desde celular o escritorio. Trabaja en La Laguna, México.
- **Equipo maestro** (secundario): administradores del sistema que crean tiendas, gestionan planes, plantillas y publicidad cruzada.

## Product Purpose

Permitir a pymes tener un catálogo digital profesional con pedidos directos por WhatsApp, sin necesidad de carrito de pago ni conocimientos técnicos. El dueño crea su tienda en minutos y comparte el enlace con clientes.

**Producto:** Catálogo Digital.

**Empresa y marca creadora:** Nessik (`nessik.net`).

## Positioning

WhatsApp-first catálogo para La Laguna, México. El cliente browsea productos y pide directo por WhatsApp — sin fricción de registro, carrito ni pago en línea. El dueño gestiona todo desde un panel simple.

## Operating Context

- El dueño registra su negocio, elige un giro, sube productos y comparte su enlace público.
- El cliente navega el catálogo, filtra por categoría, busca productos y envía pedido por WhatsApp.
- El equipo maestro administra tiendas, planes, plantillas de diseño y publicidad cruzada.
- Stack: Node.js + Express + SQLite (better-sqlite3) + EJS + Tailwind CDN + vanilla JS.

## Capabilities and Constraints

- **Catálogo público** (`/:slug`): productos, categorías, filtros, búsqueda, slider de ofertas, carrito, pedido por WhatsApp.
- **Panel admin del dueño** (`/:slug/admin`): CRUD productos, pedidos, clientes, configuración de tienda, reportes, diseñador visual.
- **Panel maestro** (`/maestro`): crear/gestionar tiendas, planes, plantillas personalizadas, publicidad cruzada.
- **Constructor visual** (`/:slug/admin/diseno`): editor drag-and-drop de bloques (texto, imagen, galería, productos, contacto, etc.).
- **Sistema de plantillas** (`templates-data.js`): plantillas temáticas con tokens de color/tipo.
- **Sistema de páginas** (tipo WordPress): páginas múltiples por tienda.
- **Planeación por planes**: free (3 productos), demo, pro (sin límite + diseño).
- **Importación masiva** desde Excel.
- **Publicidad cruzada** entre tiendas.
- **No hay carrito de pago** — el pedido se envía por WhatsApp.

## Brand Commitments

- El nombre del producto es siempre **Catálogo Digital**.
- **Nessik** es la empresa creadora y firma el producto como “Catálogo Digital por Nessik”.
- Ningún nombre interno o de herramientas de desarrollo debe mostrarse al cliente.
- La experiencia visual debe sentirse profesional, cercana y simple para negocios locales.

## Evidence on Hand

- Código completo funcional: server.js, db.js, templates-data.js, views/*.ejs, public/css/
- Base de datos SQLite con datos de demo (ferreteria-demo con 89 productos).
- Paleta premium aplicada recientemente: crema `#f8f6f2` + azul marino `#1a3c5e` (catálogo público).
- CSS premium para admin: `views/admin/head.ejs` con tokens modernos.
- No hay DESIGN.md ni PRODUCT.md previos.

## Product Principles

1. **Simplicidad sobrefeatures**: el dueño no técnico debe poder crear y administrar su tienda sin ayuda.
2. **WhatsApp como canal de venta**: la experiencia de compra termina en WhatsApp, no en un checkout.
3. **Rapid time-to-live**: de registro a catálogo compartible en minutos.
4. **Escalable por planes**: funcionalidad crece con el plan contratado (productos, diseño, publicidad).
5. **Local-first**: enfocado en La Laguna, México; precios en MXN, giros locales.

## Accessibility & Inclusion

[Inferido] Sin requisitos específicos de accesibilidad establecidos. El catálogo público debe ser usable en dispositivos móviles (mayoría de tráfico esperado).
