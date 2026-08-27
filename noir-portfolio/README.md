# NOIR - Portafolio Fotográfico con CMS

Aplicación web full-stack para portafolio fotográfico profesional con sistema de gestión de contenido (CMS).

## Stack Tecnológico

- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** MongoDB con Mongoose ODM
- **Frontend:** React + Vite + TypeScript
- **Diseño:** UI oscura y dramática con paleta Noir
- **Procesamiento de Imágenes:** Multer + Sharp (compresión WebP + thumbnails)

## Características

### Vista Pública
- Hero con efecto de máquina de escribir
- Galería de eventos en formato Masonry con hover glow
- Lightbox con navegación por teclado
- Botón flotante de WhatsApp con mensaje predefinido
- Formulario de contacto
- Animaciones scroll-triggered con Framer Motion
- Efecto de gránulo de cine sutil
- Diseño responsive (Mobile First)

### Panel de Administración (`/admin`)
- Login seguro con JWT + bcrypt
- Dashboard con estadísticas
- Gestión de eventos (CRUD)
- Subida masiva de fotos con Drag & Drop
- Bandeja de mensajes con estados (sin leer / leído / respondido)

## Requisitos Previos

- Node.js 18+ 
- MongoDB (local o Atlas)
- npm o yarn

## Instalación

```bash
# 1. Clonar o extraer el proyecto
cd noir-portfolio

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Instalar dependencias del frontend
cd ../frontend
npm install

# 4. Volver al directorio raíz
cd ..
npm install
```

## Configuración

### Backend

Copia el archivo `.env.example` a `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/noir-portfolio
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Base de Datos

Asegúrate de que MongoDB esté ejecutándose localmente, o usa una URI de MongoDB Atlas en `MONGODB_URI`.

## Ejecución

### Desarrollo (ambos servidores)

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto ejecutará:
- Backend en `http://localhost:5000`
- Frontend en `http://localhost:5173`

### Solo Backend

```bash
cd backend
npm run dev
```

### Solo Frontend

```bash
cd frontend
npm run dev
```

## Seed de Datos de Prueba

Para crear un usuario administrador y eventos de ejemplo:

```bash
cd backend
npm run seed
```

**Credenciales por defecto:**
- Email: `admin@noir.com`
- Contraseña: `admin123`

## Estructura del Proyecto

```
noir-portfolio/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración de BD
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── middleware/     # Auth, uploads
│   │   ├── models/        # Modelos Mongoose
│   │   ├── routes/        # Rutas API
│   │   ├── types/         # Tipos TypeScript
│   │   ├── utils/         # Procesamiento imágenes, seed
│   │   └── index.ts       # Entry point
│   ├── uploads/           # Almacenamiento de imágenes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Context (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas
│   │   ├── services/      # API service
│   │   ├── styles/        # CSS global
│   │   ├── types/         # Tipos TypeScript
│   │   └── App.tsx        # Router principal
│   └── package.json
└── package.json           # Scripts globales
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `POST /api/auth/logout` - Cerrar sesión

### Eventos
- `GET /api/events` - Listar eventos (público)
- `GET /api/events/featured` - Evento destacado (público)
- `GET /api/events/:slug` - Detalle de evento (público)
- `GET /api/events/:slug/photos` - Fotos de evento (público)
- `POST /api/events` - Crear evento (auth)
- `PUT /api/events/:id` - Actualizar evento (auth)
- `DELETE /api/events/:id` - Eliminar evento (auth)

### Fotos
- `GET /api/photos/event/:eventId` - Fotos por evento
- `PUT /api/photos/:id` - Actualizar foto (auth)
- `DELETE /api/photos/:id` - Eliminar foto (auth)
- `PUT /api/photos/reorder/all` - Reordenar fotos (auth)

### Upload
- `POST /api/upload/photos` - Subir fotos (auth)

### Mensajes
- `POST /api/messages` - Enviar mensaje (público)
- `GET /api/messages` - Listar mensajes (auth)
- `GET /api/messages/stats` - Estadísticas (auth)
- `PUT /api/messages/:id/status` - Actualizar estado (auth)
- `DELETE /api/messages/:id` - Eliminar mensaje (auth)

## Paleta de Colores

| Elemento | Color |
|----------|-------|
| Fondo principal | `#0B0B0B` |
| Textos | `#E0E0E0` |
| Acentos | `#C0A060` |
| Borde | `#2a2a2a` |

## Licencia

Proyecto privado. Todos los derechos reservados.
