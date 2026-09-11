---
name: Nessik
description: Catálogo WhatsApp-first con una vitrina pública cálida y un panel operativo preciso
colors:
  catalog-green: "#146356"
  catalog-green-deep: "#0D3A31"
  catalog-gold: "#C89B3C"
  catalog-warm-ground: "#FAF9F6"
  catalog-ink: "#1A2420"
  catalog-muted: "#5C6B64"
  catalog-border: "#E5E1D6"
  surface-white: "#FFFFFF"
  petrol-action: "#1A3C5E"
  petrol-operate: "#214B70"
  admin-pearl-ground: "#F3F6F8"
  admin-ink: "#17232D"
  admin-muted: "#52616C"
  cyan-light: "rgba(109,220,230,.16)"
  violet-light: "rgba(143,122,246,.10)"
  offer-terra: "#B5461C"
  whatsapp-green: "#25D366"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  editorial:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  operate-title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.025em"
rounded:
  focus: "4px"
  badge: "6px"
  sm: "8px"
  md: "12px"
  card: "14px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.petrol-action}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 18px"
  tab-default:
    backgroundColor: "rgba(255,255,255,.76)"
    textColor: "#46525B"
    rounded: "{rounded.md}"
    padding: "8px 15px"
    height: "36px"
  tab-active:
    backgroundColor: "{colors.petrol-action}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 15px"
    height: "36px"
  filter-chip-active:
    backgroundColor: "{colors.petrol-operate}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "0 11px"
    height: "30px"
  admin-product-card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.card}"
    padding: "0"
  whatsapp-cta:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.card}"
    padding: "13px 20px"
---

# Design System: Nessik

## Overview

**Creative North Star: "El Mercado Renovado, con Trastienda de Precisión"**

Nessik tiene dos temperaturas coordinadas. La vitrina pública conserva el mercado cuidado: fondos cálidos, verde profundo, dorado comedido, tipografía de exhibición y detalles que hacen tangible la compra. El panel administrativo es la trastienda precisa: Inter conduce la operación sobre un campo gris perla frío, la tinta y las acciones viran a azul petróleo y una luz cian/violeta distingue el espacio de trabajo sin convertirlo en una nueva marca.

La unidad no depende de hacer todas las pantallas iguales. Ambas familias comparten superficies blancas, esquinas amables, controles compactos, foco visible y movimiento breve con desaceleración suave. En Productos, la imagen abre cada tarjeta, el estado se lee en capas pequeñas y el inspector acompaña la edición sin sacar al dueño del catálogo.

**Key Characteristics:**
- Vitrina pública cálida y comercial; administración fría, clara y operativa
- Azul petróleo para acciones, selección, foco y navegación del panel
- Luz cian/violeta reservada al campo y al inspector de Productos
- Tarjetas redondeadas, fotográficas y con elevación teñida por la temperatura de cada superficie
- Inter lidera la operación; Space Grotesk y Playfair se reservan para exhibición pública
- Densidad compacta con adaptación móvil que conserva contexto y controles accesibles

## Colors

La paleta comparte tinta profunda y superficies blancas, pero cambia de temperatura según la tarea: mercado cálido al vender, perla fría y luz espectral al administrar.

### Primary
- **Verde Mercado:** acción principal, selección y precio en el catálogo público.
- **Petróleo Nessik:** acción, navegación, foco y selección en el panel administrativo; en Productos se profundiza para los filtros activos.

### Secondary
- **Dorado de Puesto:** precios especiales, estados premium y acentos comerciales medidos en la vitrina pública.
- **Verde WhatsApp:** se usa exclusivamente para acciones que abren o envían un pedido por WhatsApp.

### Tertiary
- **Luz Cian:** halo ambiental superior del fondo de Productos y extremo frío del inspector.
- **Luz Violeta:** segundo halo ambiental y cierre cromático del inspector de Productos.
- **Terracota de Oferta:** descuento y liquidación; evita el rojo genérico en la vitrina.

### Neutral
- **Suelo Mercado:** base cálida de catálogo y detalle de producto.
- **Suelo Perla:** base fría exclusiva del administrador de Productos.
- **Tinta Mercado:** texto principal con matiz verde en superficies públicas.
- **Tinta Admin:** texto principal azul-negro en Productos.
- **Gris Operativo:** metadata, placeholders y controles secundarios.
- **Borde Cálido:** división de tarjetas públicas sin gris industrial.
- **Blanco de Superficie:** tarjetas, campos y superficies elevadas en ambos mundos; no es el fondo de página.

### Named Rules
**The Two Temperatures Rule.** La vitrina pública usa una base cálida; el panel Productos usa perla fría con luz cian/violeta. Comparten marca, pero no intercambian sus fondos.

**The Petrol Does the Work Rule.** En administración, el petróleo señala la acción, la selección y el foco; los halos cian/violeta crean ambiente y nunca compiten como controles.

**The WhatsApp Green Rule.** El verde WhatsApp aparece solo en acciones que terminan en WhatsApp, nunca como éxito genérico, filtro o decoración.

## Typography

**Display Font:** Space Grotesk (con Inter y system-ui como fallback)
**Editorial Font:** Playfair Display (con Georgia como fallback)
**Body / Operate Font:** Inter (con system-ui como fallback)

**Character:** La vitrina combina exhibición geométrica con momentos editoriales en el detalle; el panel elimina esa ceremonia y usa una jerarquía Inter compacta, legible y directa. El contraste de familias describe el cambio de vender a operar.

### Hierarchy
- **Display** (600–700, escala responsiva, tracking negativo leve): nombres, precios y títulos de exhibición del catálogo público.
- **Editorial Headline** (700, alrededor de 2rem, 1.15): título y precio protagonistas en el detalle público del producto.
- **Operate Heading** (800–900, 18–20px, tracking apretado): encabezados de página administrativa.
- **Operate Title** (800, 13px, 1.25): nombre del producto dentro de la tarjeta administrativa.
- **Body** (400–600, 13–14px, 1.6): descripciones, ayuda y texto funcional.
- **Label** (700, 9–10px, tracking corto): etiquetas de campos, badges y metadata de alta densidad.

### Named Rules
**The Operate in Inter Rule.** Productos usa Inter en títulos, campos, estados y acciones; las familias de exhibición no entran en el flujo CRUD.

**The Public Display Restraint Rule.** Space Grotesk y Playfair enfatizan nombres, precios y títulos públicos; nunca sustituyen a Inter en labels, filtros o texto de ayuda.

## Layout

El catálogo público mantiene una cuadrícula mobile-first que crece hasta cuatro columnas y deja respirar el contenido comercial dentro de contenedores centrados. El detalle público utiliza dos columnas con galería sticky y colapsa a una columna bajo 900px.

Productos utiliza un workspace asimétrico. Hasta 1179px, catálogo e inspector fluyen verticalmente. Desde 1180px, el contenido se divide en catálogo flexible e inspector fijo de 350px, con 18px entre ambos; el inspector queda sticky a 16px del viewport, limita su altura a `calc(100vh - 32px)` y desplaza internamente su contenido. La rejilla administrativa comienza en dos columnas, pasa a tres desde 1360px y usa 12px de separación.

Por debajo de 768px, las tabs permanecen en una sola fila con scroll horizontal, la rejilla se vuelve una lista de una columna y cada producto adopta una tarjeta horizontal: imagen de 104px a la izquierda, información a la derecha y acciones en una franja inferior. El inspector vuelve al flujo, con 18px de separación, y el FAB reaparece como atajo a creación.

Los selects buscables respetan el ancho resuelto del control y de su contenedor: wrapper, disparador y panel usan `max-width: 100%`, `min-width: 0` y `box-sizing: border-box`; el panel se ancla a la anchura del disparador. Abrir opciones nunca ensancha la página ni crea overflow horizontal, incluso dentro de flex, grid o el inspector.

### Named Rules
**The Inspector Stays in Context Rule.** En escritorio ancho, crear o editar sucede junto al catálogo visible; el inspector no se convierte en una página separada ni desplaza la cuadrícula.

**The Horizontal Mobile Card Rule.** En móvil, la tarjeta administrativa cambia de composición en lugar de encoger la tarjeta vertical: imagen de 104px, texto flexible y acciones separadas.

**The Control Owns Its Dropdown Rule.** Un select buscable limita su panel al ancho del control y del contenedor; el contenido largo se ajusta dentro, nunca expande la página.

## Elevation & Depth

Nessik usa capas suaves, no superficies planas. La vitrina pública emplea sombras con matiz verde-tierra; el administrador utiliza sombras azul petróleo de baja opacidad. En Productos, el suelo perla y los halos radiales establecen profundidad ambiental, las tarjetas suben 3px al hover y el inspector recibe una elevación mayor para sostener su papel persistente.

La profundidad interactiva también es estructural: cuando una tarjeta de producto contiene foco o abre su menú contextual, la tarjeta completa sube a `z-index: 30`. El menú puede desbordar la silueta y seguir visible sobre las tarjetas posteriores de la cuadrícula.

### Shadow Vocabulary
- **Mercado bajo** (`0 1px 2px rgba(26,36,32,.05), 0 1px 3px rgba(26,36,32,.07)`): tarjetas públicas en reposo.
- **Mercado alto** (`0 14px 30px rgba(26,36,32,.08), 0 4px 12px rgba(26,36,32,.05)`): tarjeta pública en hover.
- **Producto reposo** (`0 7px 20px rgba(28,49,69,.09), 0 2px 5px rgba(28,49,69,.05)`): tarjeta administrativa de producto.
- **Producto hover** (`0 14px 28px rgba(28,49,69,.13), 0 3px 8px rgba(28,49,69,.06)`): elevación de tarjeta al explorar.
- **Inspector** (`0 16px 36px rgba(34,62,82,.14), 0 3px 8px rgba(34,62,82,.06)`): panel persistente de alta prioridad.
- **Menú contextual** (`0 16px 34px rgba(28,49,69,.18), 0 3px 8px rgba(28,49,69,.08)`): menú de acciones que flota sobre tarjetas vecinas.

### Named Rules
**The Temperature-Matched Shadow Rule.** Las sombras toman el matiz del mundo que elevan: verde-tierra en la vitrina y petróleo en Productos; el negro neutro no es el valor por defecto.

**The Open Menu Owns the Stack Rule.** El foco o menú abierto eleva la tarjeta propietaria completa a `z-index: 30`; un menú contextual nunca queda detrás de la siguiente tarjeta.

## Shapes

La forma es amable y compacta. La vitrina pública usa tarjetas de 18px; Productos reduce la tarjeta y la imagen a 14px para aumentar densidad. Controles principales y tabs usan 12px, botones de icono y acciones de menú 8px, badges operativos 6px y campos de filtro pueden ser pills. La foto respeta la silueta superior de la tarjeta y en móvil abre solo la esquina superior izquierda del módulo horizontal.

### Named Rules
**The Radius Follows Density Rule.** 18px pertenece a la exhibición pública; 14px a tarjetas administrativas; 12px a controles; 8px o 6px a acciones y estados compactos. Las pills se reservan para búsqueda y categorías.

## Components

### Buttons
- **Primary:** petróleo, texto blanco, radio de 12px y peso 700; sube 1px al hover, gana sombra y comprime a .97 en active.
- **Outlined:** fondo transparente, borde tenue y texto petróleo; el hover refuerza el borde sin llenar el control.
- **WhatsApp:** verde propio, radio de 14px y sombra verde; solo en el recorrido público hacia WhatsApp.
- **Focus:** contorno petróleo de 2px con offset de 2px, además del tratamiento propio del campo cuando corresponda.

### Chips
- **Tabs de sección:** pills rectangulares independientes de 36px, blancas translúcidas, borde casi imperceptible y sombra propia; no viven dentro de una barra contenedora. La activa usa gradiente petróleo y un contador blanco translúcido.
- **Filtros:** 30px de alto, fondo blanco translúcido y texto gris operativo; la selección usa petróleo sólido y texto blanco.
- **Badges:** 6px en la tarjeta de Productos para concentrar estado; 10px o pill en superficies menos densas.

### Cards / Containers
- **Tarjeta pública:** imagen y comercio dentro de 18px, sombra cálida baja y elevación de 4px al hover; los badges de oferta pueden usar el corte de etiqueta de mercado.
- **Tarjeta administrativa:** imagen first de 142px, radio de 14px, título Inter de 13px, estados compactos y fila de acciones al borde inferior. El hover escala la imagen a 1.025 y sube la tarjeta 3px.
- **Menú contextual:** se posiciona fuera del borde inferior derecho; al abrirlo, su tarjeta propietaria toma `z-index: 30` para superar a las tarjetas siguientes.
- **Inspector:** gradiente translúcido de cian a blanco violeta, radio de 15px, sin franja decorativa superior y con campos blancos translúcidos.

### Inputs / Fields
- **Search:** pill de al menos 36px, blanco translúcido, placeholder gris legible y sombra mínima.
- **Inspector fields:** borde petróleo al 16%, fondo blanco al 78% y radio de 8px; al foco cambian a petróleo medio y reciben un anillo de 3px al 10%.
- **Labels:** Inter 700, 10px, tracking corto; siempre estáticas encima del campo.

### Searchable Select
- **Geometry:** wrapper, botón y panel no exceden el ancho disponible; el panel mide el 100% del control y puede alinearse a la derecha o abrir hacia arriba sin causar overflow horizontal.
- **Internal search:** usa los tokens Material de superficie, contorno, radio pequeño, Inter y movimiento; al foco refuerza el borde primario sin sombra adicional.
- **States:** caret rota al abrir; opción hover/highlight usa un azul tenue; selección conserva peso 700; disabled reduce opacidad.
- **Dark mode:** panel, botón, búsqueda y opciones cambian mediante las variables y valores oscuros compartidos, conservando el mismo contraste y geometría.

### Navigation
- **Admin sidebar:** navegación compacta con radio de 12px; el estado activo es petróleo con texto blanco y los hovers se desplazan 2px.
- **Productos tabs:** actúan como navegación local independiente y se desplazan horizontalmente en móvil sin envolver.
- **Public header:** puede usar superficie cálida translúcida, blur y marca de exhibición; permanece separado de la gramática fría de Productos.

### Sticky Product Inspector

El inspector es la firma operativa de Productos. A partir de 1180px acompaña la exploración con scroll interno, pasos compactos y tipos de producto seleccionables; en pantallas menores vuelve al documento para conservar una sola dirección de lectura.

## Do's and Don'ts

### Do:
- **Do** mantener cálida la vitrina pública y fría la superficie administrativa de Productos.
- **Do** usar petróleo para acción, selección y foco en el panel; usar cian y violeta solo como luz ambiental.
- **Do** abrir cada tarjeta administrativa con la imagen y mantener estado y acciones como capas secundarias compactas.
- **Do** convertir las tarjetas a composición horizontal de 104px en móvil.
- **Do** mantener el inspector sticky de 350px desde 1180px y devolverlo al flujo en pantallas menores.
- **Do** conservar el verde WhatsApp exclusivamente para acciones que terminan en WhatsApp.
- **Do** respetar `prefers-reduced-motion` y sostener foco visible en toda acción.
- **Do** limitar cada dropdown buscable al ancho de su control y reutilizar tokens Material en su búsqueda interna y dark mode.
- **Do** elevar a `z-index: 30` la tarjeta con foco o menú contextual abierto.

### Don't:
- **Don't** aplicar el suelo perla ni los halos cian/violeta al catálogo público.
- **Don't** usar Space Grotesk o Playfair dentro del flujo operativo de Productos.
- **Don't** encerrar las tabs de Productos en una barra visual continua; deben leerse como controles independientes.
- **Don't** reducir la tarjeta vertical hasta volver ilegibles sus estados; cambia su composición en móvil.
- **Don't** usar el verde WhatsApp para éxito, filtros o estados generales.
- **Don't** convertir emojis o glifos de una fuente de iconos presentes en código legado en una regla del sistema; los nuevos patrones durables usan SVG accesible.
- **Don't** permitir que un panel de opciones o una etiqueta larga ensanche el viewport.
- **Don't** recortar ni apilar el menú contextual detrás de tarjetas posteriores de la cuadrícula.
