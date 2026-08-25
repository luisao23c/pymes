# Run doc — Nessik (catálogo de tiendas)

## Reproducir artefactos
- No hay build ni pasos de artefactos: el proyecto corre directo con Node.
- Dependencias: ya están instaladas en `node_modules` (si un checkout fresco no las tiene: `npm install`).
- `.env` solo contiene `MASTER_KEY` (no es necesario copiar nada más).

## Correr el servidor
- **IMPORTANTE:** el entorno de este equipo tiene `PORT=0` en las variables de sesión; `server.js` usa `process.env.PORT || 3000`, así que sin fijarlo el servidor arranca en un puerto aleatorio. **Siempre fijar `PORT=3000`.**
- Opción PowerShell (detached, logs separados):
  ```
  powershell -NoProfile -Command '$env:PORT="3000"; (Start-Process -FilePath "node.exe" -ArgumentList "server.js" -WorkingDirectory "C:\Users\CETIC-LuisGH2\Documents\Default Project" -RedirectStandardOutput "<log>" -RedirectStandardError "<log>.err" -WindowStyle Hidden -PassThru).Id'
  ```
- Verificar: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/taqueria-el-guero` → `200`.
- Tienda demo del usuario: http://localhost:3000/taqueria-el-guero (admin: `/taqueria-el-guero/admin`, PIN 1234; diseño: `/taqueria-el-guero/admin/diseno`).
- Los cambios en `.ejs` se sirven al refrescar (sin reiniciar); los cambios en `server.js` requieren reiniciar el proceso.
