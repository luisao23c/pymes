// Catálogo demo completo para la tienda 'ferreteria-demo'.
// Expande la tienda demo a ~100 productos con varias categorías, promociones
// con fecha de vencimiento, stock, variantes y descripciones atractivas.
const db = require('./db');

function seedDemoCatalog() {
  const biz = db.prepare("SELECT id FROM businesses WHERE slug = 'ferreteria-demo'").get();
  if (!biz) return;

  const dateStr = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

  const cats = [
    { name: 'Herramientas', sort: 1 },
    { name: 'Pintura y acabados', sort: 2 },
    { name: 'Plomería', sort: 3 },
    { name: 'Electricidad', sort: 4 },
    { name: 'Fijaciones y tornillería', sort: 5 },
    { name: 'Jardín y exterior', sort: 6 },
    { name: 'Seguridad', sort: 7 },
    { name: 'Adhesivos y química', sort: 8 },
    { name: 'Equipo de protección', sort: 9 }
  ];
  const catId = {};
  cats.forEach(c => {
    let row = db.prepare('SELECT id FROM categories WHERE business_id = ? AND name = ?').get(biz.id, c.name);
    if (!row) {
      const r = db.prepare('INSERT INTO categories (business_id, name, sort) VALUES (?, ?, ?)').run(biz.id, c.name, c.sort);
      row = { id: r.lastInsertRowid };
    }
    catId[c.name] = row.id;
  });

  // [categoría, nombre, precio, precio_antes|null, descripción, tagImagen, stock|null, variantes|null, destacado, promo_dias]
  const P = (c, n, pr, old, d, tag, stock, vars, feat, pd) => ({
    cat: catId[c], name: n, price: pr, old_price: old, desc: d,
    image: 'https://loremflickr.com/400/300/' + tag + '?lock=' + Math.abs((n.length * 7 + pr) % 900),
    stock, variants: vars, featured: feat, promo_days: pd
  });

  const lista = [
    // ---- Herramientas ----
    P('Herramientas', 'Martillo de uña 16oz', 189, 240, 'Mango de fibra de vidrio y cabeza forjada. Ideal para obra y carpintería ligera.', 'martillo', 40, null, 1, 20),
    P('Herramientas', 'Juego de desarmadores 12 piezas', 249, null, 'Puntas imantadas con mango antiderrapante tipo bidireccional. Incluye estuche.', 'desarmador', 35, 'Plano, Philips, Torx', 0, null),
    P('Herramientas', 'Cinta métrica 5m con freno', 129, 155, 'Carcasa resistente a golpes, doble escala y clip de bolsillo. Uso profesional.', 'cinta metrica', 60, null, 0, null),
    P('Herramientas', 'Taladro percutor 1/2" 600W', 1299, 1599, 'Velocidad variable, mandril de metal y función percutor. Incluye maletín y 2 brocas.', 'taladro', 12, null, 1, 30),
    P('Herramientas', 'Sierra circular 7-1/4" 1200W', 1899, null, 'Corte profundo con guía láser y mango ergonómico. Ideal para tablaroca y madera.', 'sierra circular', 8, null, 0, null),
    P('Herramientas', 'Nivel láser de línea 3D', 549, 690, 'Proyecta líneas horizontales y verticales con auto-nivelación. Incluye trípode.', 'nivel laser', 10, null, 0, null),
    P('Herramientas', 'Llaves españolas juego 11 piezas', 329, null, 'Cromo vanadio con acabado pulido y numeración grabada. De 6 a 24 mm.', 'llave espanola', 25, null, 0, null),
    P('Herramientas', 'Pinzas de presión 10"', 119, 145, 'Apertura ajustable con seguro rápido. Mango recubierto antideslizante.', 'pinzas', 45, null, 0, null),
    P('Herramientas', 'Caja de herramientas 19" aluminio', 599, 749, 'Bisagras reforzadas, candado incluido y bandeja extraíble. Resistente a impactos.', 'caja herramientas', 15, null, 1, 15),
    P('Herramientas', 'Pulidora angular 4-1/2" 850W', 899, null, 'Guardas metálicas ajustables y eje 5/8". Para corte de metal y pulido.', 'pulidora', 9, null, 0, null),
    P('Herramientas', 'Torno de banco 4"', 399, 475, 'Mordazas templadas de doble cara, base giratoria de 360°. Uso en taller.', 'torno banco', 18, null, 0, null),
    P('Herramientas', 'Kit de brocas para metal 19 piezas', 189, null, 'Acero HSS de alta velocidad con empaque individual. De 1 a 10 mm.', 'brocas', 50, null, 0, null),
    // ---- Pintura y acabados ----
    P('Pintura y acabados', 'Pintura vinílica blanca 19L', 899, 1090, 'Lavable y cubriente. Ideal para interiores y exteriores. Rendimiento 10 m²/L.', 'pintura blanca', 30, 'Blanco, Marfil, Gris', 1, 25),
    P('Pintura y acabados', 'Pintura esmalte azul marino 1L', 199, null, 'Acabado brillante resistente al agua. Para herrería y madera.', 'pintura esmalte', 22, 'Azul, Rojo, Verde', 0, null),
    P('Pintura y acabados', 'Brocha plana 3" cerdas sintéticas', 69, 85, 'Cerda de poliéster que no deja rayas. Mango de madera con acabado lacado.', 'brocha', 80, '2", 3", 4"', 0, null),
    P('Pintura y acabados', 'Rodillo para pintar 9" con mango', 89, null, 'Cubierta de 10 mm para muros. Incluye marco y extensión. Ahorra tiempo y pintura.', 'rodillo', 55, '9", 4"', 0, null),
    P('Pintura y acabados', 'Lija para madera 120 (50 hojas)', 79, null, 'Grano 120 para lijado fino. Flexible y de larga duración.', 'lija', 100, null, 0, null),
    P('Pintura y acabados', 'Pintura spray negra mate 400ml', 95, 115, 'Acabado uniforme de secado rápido. Apto para metal, madera y plástico.', 'spray', 65, 'Negro, Blanco, Cromado', 0, null),
    P('Pintura y acabados', 'Resanador listo 1kg', 55, null, 'Base de yeso lista para aplicar con espátula. Se lija fácil.', 'resanador', 90, null, 0, null),
    P('Pintura y acabados', 'Tinte para concreto rojo óxido 250ml', 149, null, 'Colorante concentrado para pisos de concreto. Gran rendimiento.', 'tinte', 20, null, 0, null),
    P('Pintura y acabados', 'Impermeabilizante acrílico blanco 19L', 1390, 1650, 'Protege techos contra filtraciones hasta 10 años. Fácil aplicación con rodillo.', 'impermeabilizante', 14, null, 1, 40),
    P('Pintura y acabados', 'Pintura de piso gris 4L', 549, null, 'Esmalte de alto tráfico para pisos de concreto. Resistente a la abrasión.', 'pintura piso', 16, null, 0, null),
    // ---- Plomería ----
    P('Plomería', 'Tubo PVC 1/2" cédula 40 6m', 149, 179, 'Para conducción de agua a presión. Roscado en ambos extremos.', 'tubo pvc', 70, '1/2", 3/4", 1"', 1, 12),
    P('Plomería', 'Llave de paso 1/2" latón', 119, null, 'Cuerpo de latón pulido con empaques incluidos. Cierre hermético.', 'llave paso', 48, null, 0, null),
    P('Plomería', 'Sellador para tuberías 250ml', 85, null, 'Resistente a presión y temperatura. Aprobado para agua potable.', 'sellador tuberia', 75, null, 0, null),
    P('Plomería', 'Codo PVC 1/2" 90° (10 pzas)', 59, null, 'Para sistemas hidráulicos y sanitarios. Engargolado de precisión.', 'codo pvc', 120, '1/2", 3/4"', 0, null),
    P('Plomería', 'Llave inglesa 12"', 279, 335, 'Acero forjado con tuerca de ajuste de fácil giro. Boca de 34 mm.', 'llave inglesa', 32, null, 0, null),
    P('Plomería', 'Válvula check 3/4" PVC', 129, null, 'Evita el retorno de agua en instalaciones. Incluye empaques de neopreno.', 'valvula check', 26, null, 0, null),
    P('Plomería', 'Tinaco Rotoplas 1100L', 2790, 3290, 'Triple capa con filtro UV. Aprobado para agua potable, incluye tapa hermética.', 'tinaco', 6, '450L, 750L, 1100L', 1, 35),
    P('Plomería', 'Teflón sanitario 1/2" 12m', 25, null, 'Sella roscas de manera segura. Resistente a altas temperaturas.', 'teflon', 200, null, 0, null),
    P('Plomería', 'Desarmador de tubo 24"', 199, null, 'Para destapar drenajes con muelle helicoidal. Mango antiderrapante.', 'destapador', 28, null, 0, null),
    P('Plomería', 'Mezcladora para lavabo cromada', 899, 1099, 'Monocontrol de cartucho cerámico. Cuerpo de latón con acabado cromado.', 'mezcladora', 11, null, 1, 18),
    // ---- Electricidad ----
    P('Electricidad', 'Cable calibre 12 (rollo 100m)', 1450, null, 'Cobre 100% puro, forro PVC. Uso residencial e industrial.', 'cable', 9, 'Cal. 10, 12, 14', 0, null),
    P('Electricidad', 'Contacto doble polarizado blanco', 45, null, 'Fabricado en polipropileno de alto impacto. Tornillos de bronce.', 'contacto', 150, null, 0, null),
    P('Electricidad', 'Apagador sencillo 10A', 35, null, 'Mecanismo de acción rápida, placa incluida. Color blanco.', 'apagador', 180, 'Sencillo, Doble, Triple', 0, null),
    P('Electricidad', 'Multímetro digital True RMS', 549, 675, 'Mide voltaje CA/CD, corriente, resistencia y continuidad. Pantalla retroiluminada.', 'multimetro', 14, null, 0, null),
    P('Electricidad', 'Foco LED 15W luz cálida', 35, 45, 'Ahorro hasta 90% vs incandescente. 25,000 horas de vida.', 'foco led', 300, 'Cálida, Blanca, Fría', 0, null),
    P('Electricidad', 'Contacto con USB doble 2.1A', 249, null, 'Carga rápida de celulares sin adaptador. Instalación estándar.', 'contacto usb', 20, null, 0, null),
    P('Electricidad', 'Cinta de aislar eléctrica 19mm', 29, null, 'Alta adherencia y flexibilidad. Aprobada para instalaciones de hasta 600V.', 'cinta aislar', 250, null, 0, null),
    P('Electricidad', 'Breaker termomagnético 20A', 89, null, 'Protección contra sobrecarga y cortocircuito. Instalación en tablero.', 'breaker', 40, '15A, 20A, 30A', 0, null),
    P('Electricidad', 'Lámpara de emergencia LED', 189, 229, 'Iluminación automática al cortarse la luz. Recargable con batería de litio.', 'lampara emergencia', 25, null, 0, null),
    P('Electricidad', 'Extensión triple 10m', 249, null, 'Cable calibre 14 con clavija polarizada. Máximo 10A.', 'extension', 33, '5m, 10m, 15m', 0, null),
    // ---- Fijaciones y tornillería ----
    P('Fijaciones y tornillería', 'Tornillos para madera #8 x 2" (100 pzas)', 85, null, 'Acero galvanizado con punta de broca. Caja con 100 piezas.', 'tornillos', 200, '#6, #8, #10', 0, null),
    P('Fijaciones y tornillería', 'Tornillos para tablaroca #6 x 1" (500 pzas)', 145, null, 'Fosfatado negro con cabeza philips. Caja de 500 piezas.', 'tornillos tablaroca', 120, null, 0, null),
    P('Fijaciones y tornillería', 'Taquetes expansivos 8mm (50 pzas)', 49, null, 'Para muros de block y tabique. Incluye tornillos.', 'taquetes', 300, '6mm, 8mm, 10mm', 0, null),
    P('Fijaciones y tornillería', 'Pijas hexagonales 1/4" x 1-1/2" (50 pzas)', 95, null, 'Acero inoxidable para uso exterior. Con arandela integrada.', 'pijas', 150, null, 0, null),
    P('Fijaciones y tornillería', 'Ancla de expansión 3/8" x 3"', 19, null, 'Para fijaciones de alta resistencia en concreto.', 'ancla', 90, null, 0, null),
    P('Fijaciones y tornillería', 'Rivets pop 3/16" (100 pzas)', 65, null, 'Remaches de aluminio con mandril de acero. Caja surtida.', 'rivets', 80, null, 0, null),
    P('Fijaciones y tornillería', 'Cinta masking industrial 2" (50m)', 49, null, 'Protege superficies durante pintura y obra. Fácil de retirar sin residuos.', 'masking', 110, null, 0, null),
    P('Fijaciones y tornillería', 'Colgador para bici con ganchos', 129, 155, 'Fija bicicletas a la pared sin ocupar piso. Capacidad de 30 kg.', 'colgador bici', 22, null, 0, null),
    P('Fijaciones y tornillería', 'Soportes escuadra 20cm (4 pzas)', 59, null, 'Refuerza estantes y muebles. Acero pintado resistente.', 'escuadras', 140, '15cm, 20cm, 30cm', 0, null),
    // ---- Jardín y exterior ----
    P('Jardín y exterior', 'Manguera de jardín 5/8" 15m', 349, 425, 'Reforzada con tripa que resiste presión y dobleces. Conector metálico.', 'manguera', 26, '15m, 25m, 50m', 1, 10),
    P('Jardín y exterior', 'Pala de trasplante con mango', 189, null, 'Acero templado con mango ergonómico. Ideal para jardinería y obra.', 'pala', 35, null, 0, null),
    P('Jardín y exterior', 'Rastrillo de jardín 14 dientes', 119, null, 'Mango de fibra de vidrio, dientes reforzados.', 'rastrillo', 40, null, 0, null),
    P('Jardín y exterior', 'Tijeras de podar 8"', 149, 179, 'Hojas de acero con resorte y seguro de una mano. Corte limpio en ramas.', 'tijeras podar', 30, null, 0, null),
    P('Jardín y exterior', 'Carretilla 4.5 pies', 1190, null, 'Capacidad de 90 kg, llanta neumática y balde de acero galvanizado.', 'carretilla', 8, null, 0, null),
    P('Jardín y exterior', 'Regadera 9L', 99, null, 'Rociador de 12 orificios. Galvanizada, ideal para plantas.', 'regadera', 45, null, 0, null),
    P('Jardín y exterior', 'Pasto sintético 2x2m', 299, 359, 'Césped artificial de aspecto natural. Ideal para patios y balcones.', 'pasto sintetico', 18, null, 0, null),
    P('Jardín y exterior', 'Malla sombra 60% 4x5m', 279, null, 'Reduce hasta 60% la radiación solar. Con ojillos reforzados.', 'malla sombra', 24, '50%, 60%, 80%', 0, null),
    P('Jardín y exterior', 'Pistola de agua para jardín', 89, null, 'Múltiples patrones de riego y bloqueo de flujo. Conexión universal.', 'pistola riego', 38, null, 0, null),
    // ---- Seguridad ----
    P('Seguridad', 'Candado de acero 50mm', 149, null, 'Cuerpo de acero templado con barra endurecida. Incluye 2 llaves.', 'candado', 55, '40mm, 50mm, 60mm', 0, null),
    P('Seguridad', 'Cámara IP WiFi 2K', 649, 799, 'Visión nocturna a color, detección de movimiento y audio bidireccional.', 'camara ip', 15, null, 1, 22),
    P('Seguridad', 'Cerrojo de seguridad 3 golpes', 399, null, 'Fija con 3 puntos a la chapa. Llaves de alta seguridad.', 'cerrojo', 20, null, 0, null),
    P('Seguridad', 'Alarma de puerta/ventana', 149, null, 'Sensores inalámbricos con sirena de 95dB. Fácil instalación.', 'alarma', 33, null, 0, null),
    P('Seguridad', 'Cadenas con candado 1.2m', 199, null, 'Eslabón de 8mm con funda antirrayaduras. Ideal para motos y bicis.', 'cadena', 28, null, 0, null),
    P('Seguridad', 'Luz sensor de movimiento LED', 249, null, 'Se enciende al detectar presencia. Alcance de 8 metros.', 'luz sensor', 19, null, 0, null),
    P('Seguridad', 'Caja fuerte de escritorio 30x20cm', 749, null, 'Acero de alta seguridad con llave. Ideal para documentos y efectivo.', 'caja fuerte', 10, null, 0, null),
    P('Seguridad', 'Casco de obra clase B', 129, 155, 'Polietileno de alto impacto con suspensión ajustable. ANSI certificado.', 'casco obra', 60, null, 0, null),
    // ---- Adhesivos y química ----
    P('Adhesivos y química', 'Silicona transparente 280ml', 89, null, 'Sella y une vidrio, metal y plástico. Resistente a la intemperie.', 'silicona', 85, 'Transparente, Blanca, Negra', 0, null),
    P('Adhesivos y química', 'Pegamento universal 120g', 69, null, 'Adherencia inmediata en la mayoría de materiales. Envase con punta aplicadora.', 'pegamento', 95, null, 0, null),
    P('Adhesivos y química', 'Cinta doble cara 25mm (10m)', 79, null, 'Adhesivo acrílico de alta resistencia. Fija sin dejar marcas.', 'cinta doble cara', 70, null, 0, null),
    P('Adhesivos y química', 'Limpiador desengrasante 1L', 99, null, 'Elimina grasa y aceite de motores y superficies. No corroe metales.', 'desengrasante', 64, null, 0, null),
    P('Adhesivos y química', 'Anticorrosivo en aerosol 400ml', 115, null, 'Capa protectora contra óxido y corrosión. Repelente al agua.', 'anticorrosivo', 44, null, 0, null),
    P('Adhesivos y química', 'Masilla epóxica 57g', 129, null, 'Sella y repara metal, PVC y concreto. Resistente al agua. No se encoge.', 'masilla epoxica', 52, null, 0, null),
    P('Adhesivos y química', 'Espuma expansiva 750ml', 199, null, 'Rellena y aísla huecos. Se expande al aplicar. Cortable a las 12h.', 'espuma', 27, null, 0, null),
    P('Adhesivos y química', 'Cinta de canero 50m', 49, null, 'Sella uniones roscadas de tuberías. Alta resistencia térmica.', 'canero', 120, null, 0, null),
    // ---- Equipo de protección ----
    P('Equipo de protección', 'Guantes de carnaza reforzados', 69, null, 'Palma de carnaza resistente al corte. Elástico en el dorso.', 'guantes carnaza', 130, 'Chica, Mediana, Grande', 0, null),
    P('Equipo de protección', 'Lentes de seguridad transparentes', 49, null, 'Policarbonato anti impacto y antirrayas. Protección UV.', 'lentes seguridad', 90, null, 0, null),
    P('Equipo de protección', 'Tapones auditivos (10 pares)', 39, null, 'Reducen el ruido hasta 32dB. De espuma, de un solo uso.', 'tapones', 110, null, 0, null),
    P('Equipo de protección', 'Cubre bocas KN95 (10 pzas)', 59, null, 'Filtración superior al 95%. Cómodo para jornadas largas.', 'cubrebocas', 150, null, 0, null),
    P('Equipo de protección', 'Chaleco de seguridad reflectivo', 129, null, 'Tiras reflectivas de 360°. Talla ajustable. Naranja.', 'chaleco', 48, 'Naranja, Amarillo, Verde', 0, null),
    P('Equipo de protección', 'Botas de casquillo (uso ligero)', 649, 790, 'Casquillo de acero y suela antiderrapante. Ideal para taller y obra.', 'botas seguridad', 17, '25, 26, 27, 28', 0, null),
    P('Equipo de protección', 'Arnés de seguridad 2 puntos', 549, null, 'Cintas de poliéster de 45mm, argollas reforzadas. Incluye estuche.', 'arnes', 12, null, 0, null),
    P('Equipo de protección', 'Respirador media cara con filtros', 299, null, 'Para polvos y vapores. Cartuchos intercambiables.', 'respirador', 21, null, 0, null)
  ];

  const exists = db.prepare('SELECT id FROM products WHERE business_id = ? AND name = ?');
  const insert = db.prepare(
    `INSERT INTO products (business_id, category_id, name, price, old_price, description, image, stock, variants, featured, promo_ends_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let added = 0;
  lista.forEach(p => {
    if (exists.get(biz.id, p.name)) return;
    const promoEnd = p.promo_days ? dateStr(p.promo_days) : '';
    insert.run(
      biz.id, p.cat, p.name, p.price, p.old_price || null, p.desc, p.image,
      p.stock === null || p.stock === undefined ? null : p.stock,
      p.variants ? JSON.stringify(p.variants.split(',').map(s => s.trim())) : '',
      p.featured ? 1 : 0,
      promoEnd
    );
    added++;
  });
  if (added > 0) console.log(`Catálogo demo: ${added} productos agregados a ferreteria-demo`);
}

seedDemoCatalog();
