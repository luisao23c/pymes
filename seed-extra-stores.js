// Tiendas demo adicionales (con datos y publicidad cruzada habilitada).
// Cada tienda tiene giro, productos con galería de fotos y ads_enabled=1 para
// que aparezcan como "publicidad" en el catálogo de ferreteria-demo.
const db = require('./db');

const dateStr = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

const img = (tag, lock) => 'https://loremflickr.com/400/300/' + tag + '?lock=' + lock;
const galeria = (tag, baseLock) => JSON.stringify([
  img(tag, baseLock),
  img(tag, baseLock + 1),
  img(tag, baseLock + 2)
]);

const STORES = [
  {
    slug: 'mini-super-la-estrella', name: 'Mini Súper La Estrella', whatsapp: '528719920440',
    description: 'Abarrotes, frutas y lo básico del día, siempre fresco y cerca de ti.',
    template: 'barrio', color: 'ambar', color_hex: '#d97706', color_hex2: '#f59e0b',
    color_mode: 'degradado', estilo: 'retro', grid_cols: 3, giro: 'abarrotes',
    giros: ['abarrotes', 'frutas y verduras'],
    cats: [
      { name: 'Despensa', sort: 1 },
      { name: 'Frutas y verduras', sort: 2 }
    ],
    products: [
      ['Despensa', 'Frijol bayo 1kg', 32, null, 'Seleccionado, grano limpio.', 'frijol', 60, null, 1, 20],
      ['Despensa', 'Arroz 1kg', 28, null, 'Extra largo, rendidor.', 'arroz', 80, null, 0, null],
      ['Despensa', 'Azúcar estándar 1kg', 26, null, 'Blanca, para endulzar todo.', 'azucar', 75, '1kg, 2kg, 5kg', 0, null],
      ['Despensa', 'Aceite vegetal 1L', 58, 68, 'Para freír y cocinar.', 'aceite', 40, null, 1, 15],
      ['Despensa', 'Cereal de maíz 400g', 42, null, 'Crujiente, desayuno familiar.', 'cereal', 55, null, 0, null],
      ['Despensa', 'Atún en aceite 140g', 25, 30, 'Alto contenido de proteína.', 'atun', 90, null, 0, null],
      ['Frutas y verduras', 'Manzana roja (kg)', 55, null, 'Fresca, crujiente y dulce.', 'manzana', 100, null, 1, 10],
      ['Frutas y verduras', 'Plátano Tabasco (kg)', 24, null, 'Maduro y natural.', 'platano', 120, null, 0, null],
      ['Frutas y verduras', 'Tomate saladet (kg)', 38, 45, 'Firme y de temporada.', 'tomate', 110, null, 0, null],
      ['Frutas y verduras', 'Cebolla blanca (kg)', 33, null, 'Grande y de buen corte.', 'cebolla', 95, null, 0, null]
    ]
  },
  {
    slug: 'tecnomundo', name: 'Tecno Mundo', whatsapp: '528719920451',
    description: 'Electrónica, accesorios y gadgets al mejor precio.',
    template: 'galeria', color: 'neon', color_hex: '#22d3ee', color_hex2: '#a855f7',
    color_mode: 'degradado', estilo: 'tech', grid_cols: 4, giro: 'electronica',
    giros: ['electronica', 'papeleria'],
    cats: [
      { name: 'Audio', sort: 1 },
      { name: 'Accesorios', sort: 2 }
    ],
    products: [
      ['Audio', 'Audífonos Bluetooth inalámbricos', 449, 599, 'Cancelación de ruido y 20h de batería.', 'audifonos', 25, 'Negro, Blanco, Azul', 1, 25],
      ['Audio', 'Bocina portátil 20W', 599, null, 'Sonido potente, resistente al agua.', 'bocina', 18, null, 1, 30],
      ['Audio', 'Micrófono de escritorio USB', 399, null, 'Plug and play, ideal para llamadas.', 'microfono', 22, null, 0, null],
      ['Accesorios', 'Cargador rápido 65W GaN', 349, 419, 'Carga varios dispositivos a la vez.', 'cargador', 30, null, 0, null],
      ['Accesorios', 'Cable USB-C 2m trenzado', 99, null, 'Durable y de carga rápida.', 'cable usb', 60, '1m, 2m, 3m', 0, null],
      ['Accesorios', 'Power bank 20000mAh', 549, null, 'Carga 3 dispositivos, pantalla LED.', 'powerbank', 15, null, 1, 20],
      ['Accesorios', 'Soporte para celular con anillo', 89, null, 'Ajustable y con imán.', 'soporte celular', 45, null, 0, null],
      ['Accesorios', 'Funda antigolpes universal', 129, null, 'Protección reforzada.', 'funda', 38, 'M, L, XL', 0, null]
    ]
  },
  {
    slug: 'mundo-mascota', name: 'Mundo Mascota', whatsapp: '528719920462',
    description: 'Alimento, accesorios y juguetes para tu mejor amigo.',
    template: 'clasica', color: 'tropical', color_hex: '#10b981', color_hex2: '#14b8a6',
    color_mode: 'degradado', estilo: 'playa', grid_cols: 3, giro: 'mascotas',
    giros: ['mascotas'],
    cats: [
      { name: 'Alimento', sort: 1 },
      { name: 'Accesorios', sort: 2 }
    ],
    products: [
      ['Alimento', 'Croquetas para perro adulto 3kg', 249, 299, 'Balanceadas con proteína real.', 'croquetas', 30, 'Adulto, Cachorro, Senior', 1, 20],
      ['Alimento', 'Alimento húmedo para gato 85g', 22, null, 'Sabor a pollo, 12 sobres.', 'comida gato', 70, 'Pollo, Atún, Res', 0, null],
      ['Alimento', 'Galletas premium para perro 500g', 89, null, 'Complemento dental y premio.', 'galletas perro', 50, null, 0, null],
      ['Accesorios', 'Correa retráctil 5m', 149, null, 'Con freno y gancho giratorio.', 'correa', 28, 'M, L', 0, null],
      ['Accesorios', 'Cama para mascota mediana', 379, 449, 'Suave, lavable y antideslizante.', 'cama mascota', 12, null, 1, 15],
      ['Accesorios', 'Juguete mordedor resistente', 69, null, 'Ideales para dientes sanos.', 'juguete perro', 40, null, 0, null],
      ['Accesorios', 'Comedero con plato doble', 119, null, 'Incluye plato para agua.', 'comedero', 33, null, 0, null],
      ['Accesorios', 'Transportadora mediana', 449, null, 'Segura y con ventilación.', 'transportadora', 9, null, 0, null]
    ]
  },
  {
    slug: 'deportes-pro', name: 'Deportes Pro', whatsapp: '528719920473',
    description: 'Equipo y ropa deportiva para entrenar a tope.',
    template: 'juvenil', color: 'fuego', color_hex: '#ef4444', color_hex2: '#f97316',
    color_mode: 'degradado', estilo: 'moderno', grid_cols: 4, giro: 'deportes',
    giros: ['deportes', 'ropa'],
    cats: [
      { name: 'Entrenamiento', sort: 1 },
      { name: 'Ropa deportiva', sort: 2 }
    ],
    products: [
      ['Entrenamiento', 'Mancuernas neopreno 2 x 5kg', 499, 599, 'Antiderrapantes, ideales para casa.', 'mancuernas', 20, null, 1, 25],
      ['Entrenamiento', 'Banda elástica de resistencia', 129, null, '3 niveles, con manual de rutinas.', 'banda resistencia', 45, null, 0, null],
      ['Entrenamiento', 'Cuerda para saltar profesional', 149, null, 'Rodamientos de alta velocidad.', 'cuerda saltar', 35, null, 0, null],
      ['Entrenamiento', 'Tapete de yoga 6mm', 299, null, 'Antideslizante y fácil de lavar.', 'tapete yoga', 25, null, 0, null],
      ['Ropa deportiva', 'Playeras deportivas (pack 2)', 349, 419, 'Tela transpirable que no estorba.', 'playera deportiva', 30, 'Chica, Mediana, Grande', 1, 20],
      ['Ropa deportiva', 'Shorts de entrenamiento', 199, null, 'Cintura elástica con bolsillos.', 'shorts', 28, null, 0, null],
      ['Ropa deportiva', 'Gorra deportiva', 149, null, 'Transpirable y ajustable.', 'gorra', 40, null, 0, null],
      ['Ropa deportiva', 'Calcetas térmicas (3 pares)', 129, null, 'Antiampollas para correr.', 'calcetas', 50, null, 0, null]
    ]
  },
  {
    slug: 'taqueria-el-guero', name: 'Taquería El Güero', whatsapp: '528719920484',
    description: 'Tacos de pastor, bistec y más. Hechos al momento.',
    template: 'restaurante', color: 'atardecer', color_hex: '#f59e0b', color_hex2: '#ef4444',
    color_mode: 'degradado', estilo: 'cafe', grid_cols: 3, giro: 'taqueria',
    giros: ['taqueria', 'restaurante'],
    cats: [
      { name: 'Tacos', sort: 1 },
      { name: 'Para compartir', sort: 2 }
    ],
    products: [
      ['Tacos', 'Orden de pastor (3 tacos)', 75, 90, 'Con piña, cebolla y cilantro.', 'tacos pastor', 120, null, 1, 15],
      ['Tacos', 'Orden de bistec (3 tacos)', 85, null, 'Asado al carbón con tortilla de harina.', 'tacos bistec', 110, null, 1, 10],
      ['Tacos', 'Taco de suadero', 30, null, 'Jugoso y dorado al momento.', 'taco suadero', 150, null, 0, null],
      ['Tacos', 'Taco dorado de papa', 25, null, 'Crujiente con salsa verde.', 'taco dorado', 130, null, 0, null],
      ['Para compartir', 'Cazuela de 12 tacos surtidos', 280, 340, 'Pastor, bistec y suadero con guarniciones.', 'cazuela tacos', 20, null, 1, 20],
      ['Para compartir', 'Orden de frijoles charros', 45, null, 'Con tocino y chile.', 'frijoles charros', 60, null, 0, null],
      ['Para compartir', 'Agua de horchata 1L', 40, null, 'Fresca, hecha en casa.', 'horchata', 80, null, 0, null],
      ['Para compartir', 'Refresco de 600ml', 28, null, 'Varias opciones bien frías.', 'refresco', 90, null, 0, null]
    ]
  }
];

function seedStores() {
  let created = 0, productsAdded = 0;
  for (const s of STORES) {
    const existing = db.prepare('SELECT id FROM businesses WHERE slug = ?').get(s.slug);
    if (existing) continue;

    const bizRes = db.prepare(
      `INSERT INTO businesses (slug, name, whatsapp, description, pin, template, color, color_hex, color_hex2, color_mode, estilo, grid_cols, giro, giros, plan, ads_enabled, active)
       VALUES (?, ?, ?, ?, '1234', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pro', 1, 1)`
    ).run(
      s.slug, s.name, s.whatsapp, s.description,
      s.template, s.color, s.color_hex, s.color_hex2, s.color_mode, s.estilo,
      s.grid_cols, s.giro, JSON.stringify(s.giros)
    );
    const bizId = bizRes.lastInsertRowid;

    const catId = {};
    for (const c of s.cats) {
      catId[c.name] = db.prepare('INSERT INTO categories (business_id, name, sort) VALUES (?, ?, ?)').run(bizId, c.name, c.sort).lastInsertRowid;
    }

    const insert = db.prepare(
      `INSERT INTO products (business_id, category_id, name, price, old_price, description, image, galeria, stock, variants, featured, promo_ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    let i = 0;
    for (const p of s.products) {
      const [cat, name, price, old, desc, tag, stock, vars, feat, promoDays] = p;
      const lock = Math.abs(((name.length * 7 + price) % 900) + i * 13);
      insert.run(
        bizId, catId[cat], name, price, old || null, desc,
        img(tag, lock), galeria(tag, lock + 100),
        stock, vars ? JSON.stringify(vars.split(',').map(x => x.trim())) : '',
        feat ? 1 : 0, promoDays ? dateStr(promoDays) : ''
      );
      productsAdded++;
      i++;
    }
    created++;
    console.log(`Tienda creada: ${s.slug} (${s.name})`);
  }
  console.log(`Tiendas nuevas: ${created}. Productos agregados: ${productsAdded}`);
}

seedStores();