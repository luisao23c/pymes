# Catálogo Digital por Nessik

Plataforma multi-tienda para que negocios locales publiquen productos y reciban pedidos organizados directamente en WhatsApp.

## Desarrollo

Requiere Node.js 22.

```bash
npm ci
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:3000` y su estado puede consultarse en `/health`.

## Verificación

```bash
npm run check
```

Este comando revisa la sintaxis del servidor y ejecuta las pruebas automatizadas, incluida la creación de una base SQLite vacía.

## Producción

Configura `MASTER_KEY`, `BASE_URL`, `DATA_DIR`, `UPLOAD_DIR` y `BACKUP_DIR`. La base de datos, los archivos subidos y los respaldos deben estar en almacenamiento persistente. Consulta `.env.example` y `DOCUMENTACION.md` para más detalles.

---

**Catálogo Digital** es un producto de [Nessik](https://nessik.net/).
