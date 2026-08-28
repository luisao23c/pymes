---
name: Nessik
description: Catálogo digital con pedidos por WhatsApp para negocios de La Laguna
colors:
  warm-white: "#f7f6f2"
  cream: "#faf9f6"
  ink: "#141210"
  ink-soft: "#1A2420"
  muted: "#5C6B64"
  muted-light: "#6b6560"
  border-warm: "#E5E1D6"
  border-soft: "#ecebe6"
  primary: "#4f46e5"
  primary-glow: "#c9a86c"
  accent-emerald: "#10b981"
  whatsapp-green: "#25d366"
  offer-red: "#B5461C"
  card-white: "#FFFFFF"
  surface-dim: "#f8f7f4"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 700
    letterSpacing: "0.04em"
    textTransform: "uppercase"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "8px 18px"
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Nessik

## Overview

**Creative North Star: "El Mercado Renovado"**

El sistema de diseño se siente como un mercado bien cuidado: cálido, accesible, lleno de vida pero organizado. No es pretencioso ni frío — es el tipo de espacio donde la gente entra con confianza porque sabe que va a encontrar lo que busca. La base es blanca cálida con tonos terrestres, los acentos son profundos y saturados, y cada interacción te recuerda que esto es algo real, algo tangible.

La personalidad es **táctil y confiada**: las tarjetas se elevan al hover, los botones responden con un pulse al clic, los badges rebotan al entrar. Nada es pasivo — todo responde — pero sin ser infantil ni exagerado. Es el tipo de movimiento que hace que navegar un catálogo se sienta como revisar productos en un mercado real, donde todo tiene peso y presencia.

**Key Characteristics:**
- Base cálida con sombras que tienen tinte terrestre (no negro puro)
- Acentos saturados que contrastan fuerte contra el fondo crema
- Tarjetas redondeadas con elevación sutil que crece en hover
- Movimiento con propósito: rebote en badges, slide-in en secciones, parallax ligero en hero
- Sistema adaptable por tienda: cada negocio puede cambiar colores, fuentes y estilo

## Colors

La paleta es **cálida y terrestre con contrastes fuertes**. El fondo nunca es blanco frío — siempre tiene un matiz crema o arena. Los acentos son profundos y saturados, con degradados que dan vida sin gritar.

### Primary
- **Indigo Profundo** (#4f46e5): Color principal del sistema. Se usa en botones activos, chips seleccionados, links, y focus rings. Es el color de acción y navegación.
- **Dorado de Acento** (#c9a86c): Reservado para precios destacados, badges premium, y toques de elegancia. Se usa con moderación — su rareza es su fuerza.

### Secondary
- **Verde WhatsApp** (#25d366): exclusivamente para el CTA de WhatsApp. No se usa en ningún otro contexto. Su identidad con WhatsApp es sagrada.
- **Rojo Oferta** (#B5461C): badges de descuento y precios de liquidación. Tinte terrestre, no rojo genérico.

### Neutral
- **Blanco Cálido** (#f7f6f2): fondo principal de la página. Nunca blanco puro.
- **Crema** (#faf9f6): fondo de cards y superficies elevadas.
- **Tinta** (#141210): texto principal. Negro con matiz verde, no negro absoluto.
- **Gris Verde** (#5C6B64): texto secundario, labels, y metadata.
- **Borde Cálido** (#E5E1D6): bordes de cards y separadores. Siempre con tinte cálido.

### Named Rules
**The WhatsApp Green Rule.** El verde de WhatsApp (#25d366) solo aparece en el botón de pedido por WhatsApp. Su identidad con la plataforma es inquebrantable. No se usa para success states, badges, ni ningún otro elemento.

**The Warm Base Rule.** El fondo nunca es blanco frío (#ffffff). Siempre tiene un matiz cálido (#f7f6f2 o #faf9f6). Esto mantiene la sensación de mercado acogedor en todas las tiendas.

## Typography

**Display Font:** Playfair Display (con Georgia como fallback)
**Body Font:** Inter (con system-ui como fallback)

**Character:** La pairing combina elegancia editorial (Playfair) con legibilidad técnica (Inter). Los títulos se sienten como un periódico bien diseñado — con personalidad pero legibles. El body es limpio y funcional, sin personalidad excesiva.

### Hierarchy
- **Display** (700, clamp(1.8rem, 5vw, 2.8rem), 1.1): Nombres de tienda, títulos hero, precios destacados. Solo en elementos de alto impacto visual.
- **Headline** (700, 22px, 1.3): Títulos de sección ("Ofertas", "Productos").力量 y presencia sin dominar.
- **Title** (600-700, 14-16px, 1.25): Nombres de productos, cards. Legible en mobile, con peso para escanear.
- **Body** (400, 0.9rem, 1.6): Descripciones, texto largo. Máximo 65ch para legibilidad óptima.
- **Label** (700, 0.65rem, uppercase, 0.04em): Categorías, badges, metadata. Siempre con tracking amplio para legibilidad en tamaño pequeño.

### Named Rules
**The Display Restraint Rule.** Playfair Display solo aparece en títulos de alto impacto (hero, nombre de tienda, precios). No se usa para labels, badges, ni texto de cuerpo. Su elegancia se diluye si se usa en todo.

## Layout

El layout es **mobile-first con grid responsivo**. La estructura base es un contenedor centrado con padding generoso.

- **Grid de productos:** 4 columnas en desktop, 3 en tablet, 2 en mobile. Gap de 14px.
- **Sidebar de filtros:** 260px fijo en desktop, drawer overlay en mobile (<900px).
- **Hero:** Full-width con imagen de fondo, overlay degradado, y contenido centrado.
- **Header sticky:** Blur backdrop, logo + título a la izquierda, carrito a la derecha.
- **Contenedor:** max-width 1200px centrado, padding 24px lados.

### Responsive Breakpoints
- **900px:** Sidebar de filtros se convierte en drawer
- **768px:** Grid a 3 columnas, hero más compacto
- **480px:** Grid a 2 columnas, padding reducido, tipografía escala

## Elevation & Depth

El sistema usa **sombras con tinte terrestre** en vez de negro puro. Las sombras tienen un matiz verde-marrón que las integra con la paleta cálida.

### Shadow Vocabulary
- **Elevación baja** (`0 1px 2px rgba(26,36,32,0.05), 0 1px 3px rgba(26,36,32,0.07)`): Cards en reposo, inputs.
- **Elevación media** (`0 4px 10px rgba(26,36,32,0.06), 0 2px 4px rgba(26,36,32,0.08)`): Cards en hover, dropdowns.
- **Elevación alta** (`0 14px 30px rgba(26,36,32,0.08), 0 4px 12px rgba(26,36,32,0.05)`): Modales, cards expandidas.
- **Elevación extrema** (`0 24px 55px rgba(26,36,32,0.10), 0 8px 22px rgba(26,36,32,0.06)`): Hero, lightbox.

### Named Rules
**The Flat-By-Default Rule.** Las superficies están planas en reposo. Las sombras aparecen solo como respuesta a estado (hover, elevation, focus). Nunca hay sombra permanente en elementos estáticos.

## Shapes

El lenguaje de formas es **amigable y redondeado**. Todo tiene esquinas suaves — no hay ángulos agudos en el sistema.

- **Cards:** 18px border-radius. Esquinas suaves que invitan a tocar.
- **Botones:** 12px border-radius (solidos), 999px (chips/pills).
- **Inputs:** 12px border-radius, matching cards.
- **Badges:** 6px border-radius (functional), 999px (category pills).
- **Imágenes:** 18px border-radius en cards, 12px en thumbnails.
- **Hero logo:** 20px border-radius (más cuadrado que las cards).

### Named Rules
**The Consistent Radius Rule.** El border-radius de 18px es el estándar del sistema. Solo se rompe para pills (999px) y badges funcionales (6px). No hay radios intermedios arbitrarios.

## Components

### Buttons
- **Shape:** 12px border-radius, min-height 40px (44px en mobile)
- **Primary:** Background indigo (#4f46e5), texto blanco, padding 8px 18px. Box-shadow sutil.
- **Hover:** Brightness 1.05 + translateY(-2px) + shadow más profundo.
- **Active:** Scale 0.97 — feedback táctil inmediato.
- **WhatsApp CTA:** Verde WhatsApp (#25d366), padding 8px 18px, shadow con tinte verde. Solo para pedidos.

### Chips / Category Pills
- **Style:** Background crema (#faf9f6), borde #E5E1D6, texto secundario.
- **Active:** Background indigo (#4f46e5), texto blanco, borde transparente. Shadow con tinte indigo.
- **Hover:** Borde cambia a indigo, texto se oscurece.
- **Shape:** 999px border-radius (pill shape).

### Cards (Product / Offer)
- **Corner Style:** 18px border-radius
- **Background:** Blanco cálido (#FFFFFF)
- **Shadow Strategy:** Elevación baja en reposo, elevación media en hover. Sombras con tinte terrestre.
- **Border:** 1px solid #E5E1D6 (borde cálido)
- **Internal Padding:** 10-12px
- **Hover:** translateY(-6px) + shadow alta + borde se ilumina con tinte indigo

### Inputs / Fields
- **Style:** Background #faf9f6, borde #E5E1D6, radius 12px. Padding 10-12px.
- **Focus:** Borde cambia a indigo (#4f46e5), box-shadow 0 0 0 3px rgba(79,70,229,0.06).
- **Placeholder:** Color #6b6560 con opacidad 0.5-0.6.

### Navigation (Header)
- **Style:** Sticky top, backdrop-filter blur 18px, fondo rgba(248,246,242,0.92).
- **Typography:** Playfair Display 700 para título, Inter para elementos funcionales.
- **Logo:** 32px cuadrado con 10px radius.
- **Cart button:** Bg crema, borde cálido, radius 12px. Hover: borde indigo + shadow.

### Hero Section
- **Background:** Imagen full-width con overlay degradado (crema transparente → crema opaco).
- **Logo:** 80px con 20px radius, border blanco, shadow alta.
- **Title:** Playfair Display clamp(1.8rem, 5vw, 2.8rem), color tinta.
- **Status badge:** Pill con fondo crema, borde sutil. Verde si abierto, gris si cerrado.

## Do's and Don'ts

### Do:
- **Do** usar la base cálida (#f7f6f2) en todas las páginas. Nunca blanco frío.
- **Do** mantener el WhatsApp green (#25d366) exclusivamente para el CTA de WhatsApp.
- **Do** usar sombras con tinte terrestre (rgba con matiz verde-marrón).
- **Do** animar badges con bounce al entrar y cards con stagger al scroll.
- **Do** escalar el grid a 2 columnas en mobile (<480px).
- **Do** usar Playfair Display solo para títulos de alto impacto.

### Don't:
- **Don't** usar #ffffff como fondo de página. Siempre usar la base cálida.
- **Don't** usar el verde de WhatsApp para success states o badges no-WA.
- **Don't** usar sombras con negro puro (#000000). Siempre con tinte terrestre.
- **Don't** usar Playfair Display para labels, badges o texto de cuerpo.
- **Don't** poner sombras permanentes en elementos estáticos.
- **Don't** romper el border-radius de 18px sin razón funcional.
