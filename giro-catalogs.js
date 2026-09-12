'use strict';

// Amplía los presets mínimos del onboarding sin duplicar ni reemplazar opciones existentes.
// Cada giro conserva sus categorías específicas y recibe profundidad coherente con su sector.

const PROFILE_FOR = {};
function group(profile, ids) { ids.forEach(id => { PROFILE_FOR[id] = profile; }); }

group('food_service', ['restaurante', 'taqueria', 'cocinaeconomica', 'foodtruck']);
group('specialty_food', ['pizzeria', 'hamburgueseria', 'rosticeria', 'mariscos', 'banquetes', 'salonfiestas', 'eventos']);
group('bakery_sweets', ['panaderia', 'pasteleria', 'heladeria', 'dulceria']);
group('beverages', ['cafeteria', 'juguera', 'cerveceria', 'vinos']);
group('fresh_food', ['pescaderia', 'carniceria', 'fruteria', 'tortilleria', 'abarrotes']);
group('home_retail', ['hogar', 'colchones', 'cortinas', 'electrodomesticos', 'muebles', 'mueblesoficina', 'jardineria', 'floreria']);
group('general_retail', ['piniateria', 'regalos', 'bazar', 'papeleria', 'libreria', 'grande', 'otros']);
group('fashion', ['ropa', 'calzado', 'ropabebe', 'ropausada', 'perfumeria', 'joyeria', 'optica']);
group('beauty', ['belleza', 'barberia', 'spa', 'unias', 'tatuajes', 'esteticacanina']);
group('health', ['farmacia', 'dental', 'medico', 'veterinaria', 'fisioterapia', 'nutricion', 'naturista']);
group('pets', ['mascotas']);
group('children', ['jugueteria', 'guarderia', 'articulosbebe']);
group('sports', ['deportes', 'gimnasio', 'bicicletas', 'instrumentos']);
group('construction', ['ferreteria', 'materialesconstruccion', 'pintura', 'vidrios', 'pisos']);
group('home_services', ['fumigacion', 'cerrajeria', 'electricista', 'plomeria', 'mudanzas', 'lavanderia']);
group('automotive', ['taller', 'refaccionaria', 'llantera', 'motos', 'autolavado', 'escuelamanejo']);
group('creative', ['imprenta', 'disenio', 'letreros', 'fotografia', 'video']);
group('professional', ['contable', 'seguros', 'inmobiliaria', 'abogados', 'clasesparticulares', 'academiaidiomas']);
group('technology', ['electronica', 'celularesreparacion', 'computo', 'serviciotecnico']);
group('travel', ['viajes']);

const CATEGORY_EXTRAS = {
  food_service: ['Combos', 'Especialidades de la casa', 'Menú infantil', 'Opciones vegetarianas', 'Extras', 'Temporada', 'Promociones'],
  specialty_food: ['Especialidades', 'Combos', 'Para compartir', 'Individuales', 'Extras', 'Temporada', 'Promociones'],
  bakery_sweets: ['Recién hechos', 'Individuales', 'Para compartir', 'Sin azúcar', 'Temporada', 'Personalizados', 'Promociones'],
  beverages: ['Clásicos', 'Especialidades', 'Sin alcohol', 'Botellas y paquetes', 'Temporada', 'Complementos', 'Promociones'],
  fresh_food: ['Por kilo', 'Por pieza', 'Paquetes', 'Preparados', 'Congelados', 'Temporada', 'Mayoreo', 'Ofertas'],
  home_retail: ['Novedades', 'Más vendidos', 'Accesorios', 'Repuestos', 'Por espacio', 'Temporada', 'Ofertas', 'Liquidación'],
  general_retail: ['Novedades', 'Más vendidos', 'Escolar y oficina', 'Hogar', 'Temporada', 'Personalizados', 'Ofertas', 'Liquidación'],
  fashion: ['Novedades', 'Básicos', 'Temporada', 'Edición especial', 'Complementos', 'Más vendidos', 'Ofertas', 'Liquidación'],
  beauty: ['Servicios individuales', 'Paquetes', 'Tratamientos', 'Mantenimiento', 'A domicilio', 'Temporada', 'Promociones'],
  health: ['Consulta inicial', 'Seguimiento', 'Prevención', 'Diagnóstico', 'Tratamientos', 'Paquetes', 'Urgencias', 'A domicilio'],
  pets: ['Perros', 'Gatos', 'Otras mascotas', 'Salud', 'Premios', 'Viaje', 'Ofertas'],
  children: ['Por edad', 'Educativos', 'Recreación', 'Seguridad', 'Temporada', 'Paquetes', 'Promociones'],
  sports: ['Entrenamiento', 'Competencia', 'Principiantes', 'Profesional', 'Accesorios', 'Mantenimiento', 'Ofertas'],
  construction: ['Obra gris', 'Instalación', 'Mantenimiento', 'Consumibles', 'Herramientas', 'Mayoreo', 'Ofertas', 'Liquidación'],
  home_services: ['Instalación', 'Reparación', 'Mantenimiento', 'Emergencias', 'Residencial', 'Comercial', 'A domicilio', 'Paquetes'],
  automotive: ['Mantenimiento', 'Reparación', 'Diagnóstico', 'Refacciones', 'Accesorios', 'Emergencias', 'Paquetes', 'Promociones'],
  creative: ['Diseño', 'Producción', 'Impresión', 'Edición', 'Paquetes', 'Entrega urgente', 'Empresas', 'Personalizados'],
  professional: ['Personas', 'Empresas', 'Consulta inicial', 'Servicios recurrentes', 'Trámites', 'Paquetes', 'Urgentes', 'En línea'],
  technology: ['Equipos', 'Componentes', 'Accesorios', 'Instalación', 'Reparación', 'Mantenimiento', 'Seminuevos', 'Ofertas'],
  travel: ['Nacionales', 'Internacionales', 'Todo incluido', 'Familiares', 'Parejas', 'Grupos', 'Temporada', 'Ofertas']
};

const ATTRIBUTE_PROFILES = {
  food_service: {
    'Porción': ['Individual', 'Regular', 'Grande', 'Para compartir'],
    'Preparación': ['Estándar', 'Bien cocido', 'Sin sal', 'Personalizada'],
    'Dieta': ['Regular', 'Vegetariana', 'Vegana', 'Sin gluten'],
    'Extras': ['Sin extras', 'Extra proteína', 'Extra queso', 'Salsa adicional']
  },
  specialty_food: {
    'Tamaño': ['Individual', 'Mediano', 'Grande', 'Familiar'],
    'Preparación': ['Clásica', 'Especial', 'Sin picante', 'Personalizada'],
    'Porción': ['Individual', 'Para dos', 'Familiar', 'Evento'],
    'Extras': ['Sin extras', 'Extra queso', 'Extra proteína', 'Complemento']
  },
  bakery_sweets: {
    'Presentación': ['Pieza', 'Media docena', 'Docena', 'Caja'],
    'Tamaño': ['Individual', 'Chico', 'Mediano', 'Grande'],
    'Sabor': ['Vainilla', 'Chocolate', 'Frutal', 'Especial'],
    'Personalización': ['Estándar', 'Mensaje', 'Imagen', 'Diseño especial']
  },
  beverages: {
    'Tamaño': ['Chico', 'Mediano', 'Grande', 'Litro'],
    'Temperatura': ['Caliente', 'Tibia', 'Fría', 'Con hielo'],
    'Endulzante': ['Sin azúcar', 'Azúcar', 'Sustituto', 'Miel'],
    'Presentación': ['Vaso', 'Botella', 'Paquete', 'Caja']
  },
  fresh_food: {
    'Presentación': ['Pieza', 'Medio kilo', 'Kilo', 'Paquete'],
    'Preparación': ['Entero', 'Cortado', 'Limpio', 'Preparado'],
    'Origen': ['Local', 'Nacional', 'Importado', 'Orgánico'],
    'Conservación': ['Fresco', 'Refrigerado', 'Congelado', 'Empacado']
  },
  home_retail: {
    'Medida': ['Compacto', 'Estándar', 'Grande', 'A la medida'],
    'Material': ['Madera', 'Metal', 'Plástico', 'Mixto'],
    'Color': ['Natural', 'Blanco', 'Negro', 'Personalizado'],
    'Entrega': ['En tienda', 'A domicilio', 'Instalación incluida', 'Sobre pedido']
  },
  general_retail: {
    'Marca': ['Genérica', 'Nacional', 'Importada', 'Premium'],
    'Presentación': ['Pieza', 'Paquete', 'Caja', 'Mayoreo'],
    'Color': ['Surtido', 'Claro', 'Oscuro', 'Personalizado'],
    'Condición': ['Nuevo', 'Seminuevo', 'Reacondicionado', 'Sobre pedido']
  },
  fashion: {
    'Talla': ['XS', 'CH', 'M', 'G', 'XG', 'XXG'],
    'Color': ['Negro', 'Blanco', 'Azul', 'Rojo', 'Beige', 'Otro'],
    'Material': ['Algodón', 'Sintético', 'Piel', 'Mixto'],
    'Temporada': ['Básico', 'Primavera-Verano', 'Otoño-Invierno', 'Edición especial']
  },
  beauty: {
    'Duración': ['30 min', '45 min', '1 hora', '1.5 horas'],
    'Nivel': ['Básico', 'Intermedio', 'Completo', 'Premium'],
    'Modalidad': ['En local', 'A domicilio', 'Individual', 'Pareja'],
    'Frecuencia': ['Única', 'Semanal', 'Quincenal', 'Mensual']
  },
  health: {
    'Modalidad': ['Presencial', 'En línea', 'A domicilio', 'Urgencia'],
    'Duración': ['30 min', '45 min', '1 hora', 'Variable'],
    'Paciente': ['Adulto', 'Infantil', 'Adulto mayor', 'Especial'],
    'Tipo de atención': ['Primera vez', 'Seguimiento', 'Preventiva', 'Tratamiento']
  },
  pets: {
    'Mascota': ['Perro', 'Gato', 'Ave', 'Otra'],
    'Tamaño': ['Mini', 'Chico', 'Mediano', 'Grande'],
    'Etapa': ['Cachorro', 'Adulto', 'Senior', 'Todas'],
    'Presentación': ['Pieza', 'Bolsa', 'Lata', 'Paquete']
  },
  children: {
    'Edad': ['0-2 años', '3-5 años', '6-8 años', '9-12 años', '13+ años'],
    'Nivel': ['Inicial', 'Básico', 'Intermedio', 'Avanzado'],
    'Duración': ['Por hora', 'Medio día', 'Día completo', 'Mensual'],
    'Modalidad': ['Individual', 'Grupo', 'Presencial', 'En línea']
  },
  sports: {
    'Nivel': ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'],
    'Talla': ['CH', 'M', 'G', 'XG'],
    'Disciplina': ['Entrenamiento', 'Competencia', 'Recreativo', 'Especialidad'],
    'Condición': ['Nuevo', 'Seminuevo', 'Reacondicionado', 'Renta']
  },
  construction: {
    'Presentación': ['Pieza', 'Caja', 'Metro', 'Mayoreo'],
    'Medida': ['Chica', 'Estándar', 'Grande', 'Especial'],
    'Material': ['Metal', 'Madera', 'Plástico', 'Mineral'],
    'Acabado': ['Natural', 'Mate', 'Satinado', 'Brillante']
  },
  home_services: {
    'Tipo de servicio': ['Instalación', 'Reparación', 'Mantenimiento', 'Emergencia'],
    'Cobertura': ['Residencial', 'Comercial', 'Industrial', 'A domicilio'],
    'Duración': ['1 hora', 'Medio día', 'Día completo', 'Por proyecto'],
    'Urgencia': ['Programado', 'Mismo día', 'Urgente', 'Fuera de horario']
  },
  automotive: {
    'Vehículo': ['Auto', 'Camioneta', 'Motocicleta', 'Utilitario'],
    'Servicio': ['Diagnóstico', 'Mantenimiento', 'Reparación', 'Instalación'],
    'Condición': ['Nuevo', 'Seminuevo', 'Reacondicionado', 'A cambio'],
    'Entrega': ['Mismo día', '24 horas', '2-3 días', 'Sobre pedido']
  },
  creative: {
    'Formato': ['Digital', 'Impreso', 'Editable', 'Paquete'],
    'Tamaño': ['Chico', 'Mediano', 'Grande', 'Personalizado'],
    'Entrega': ['Estándar', 'Prioritaria', 'Urgente', 'Programada'],
    'Revisiones': ['Sin cambios', '1 revisión', '2 revisiones', 'Ilimitadas']
  },
  professional: {
    'Modalidad': ['Presencial', 'En línea', 'A domicilio', 'Híbrida'],
    'Tipo de cliente': ['Persona', 'Emprendedor', 'Empresa', 'Institución'],
    'Duración': ['Sesión', 'Mensual', 'Trimestral', 'Por proyecto'],
    'Entrega': ['Estándar', 'Prioritaria', 'Urgente', 'Programada']
  },
  technology: {
    'Marca': ['Apple', 'Samsung', 'Lenovo', 'HP', 'Otra'],
    'Condición': ['Nuevo', 'Seminuevo', 'Reacondicionado', 'Para reparar'],
    'Capacidad': ['Básica', 'Media', 'Alta', 'Profesional'],
    'Servicio': ['Venta', 'Instalación', 'Reparación', 'Mantenimiento']
  },
  travel: {
    'Destino': ['Local', 'Nacional', 'Internacional', 'Personalizado'],
    'Duración': ['1 día', 'Fin de semana', '1 semana', 'Más de una semana'],
    'Modalidad': ['Individual', 'Pareja', 'Familiar', 'Grupo'],
    'Temporada': ['Baja', 'Regular', 'Alta', 'Especial']
  }
};

const SPECIFIC_CATEGORIES = {
  taqueria: ['Tacos al pastor', 'Tacos de bistec', 'Tacos especiales', 'Órdenes', 'Salsas y extras'],
  restaurante: ['Desayunos', 'Ensaladas', 'Sopas', 'Postres', 'Platillos del día'],
  cafeteria: ['Café de especialidad', 'Tés e infusiones', 'Frappés', 'Panadería', 'Métodos de extracción'],
  ropa: ['Dama', 'Caballero', 'Niños', 'Calzado', 'Bolsas y mochilas'],
  ferreteria: ['Electricidad', 'Tornillería', 'Seguridad', 'Jardinería', 'Adhesivos y selladores'],
  electronica: ['Cómputo', 'Telefonía', 'Videojuegos', 'Redes', 'Energía y carga'],
  farmacia: ['Primeros auxilios', 'Bebés', 'Dermocosmética', 'Salud sexual', 'Equipo médico'],
  mascotas: ['Alimento seco', 'Alimento húmedo', 'Juguetes', 'Camas y transportadoras', 'Medicamentos'],
  otros: ['Servicios', 'Paquetes', 'Accesorios', 'Temporada', 'Ofertas']
};

const SPECIFIC_ATTRIBUTES = {
  taqueria: {
    'Tortilla': ['Maíz', 'Harina', 'Doble', 'Sin tortilla'],
    'Proteína': ['Pastor', 'Bistec', 'Suadero', 'Mixta'],
    'Salsa': ['Sin salsa', 'Verde', 'Roja', 'Mixta']
  },
  cafeteria: {
    'Leche': ['Entera', 'Deslactosada', 'Almendra', 'Avena'],
    'Café': ['Regular', 'Descafeinado', 'Shot extra', 'Sin café']
  },
  pizzeria: {
    'Masa': ['Tradicional', 'Delgada', 'Orilla rellena', 'Sin gluten'],
    'Ingredientes': ['Receta original', 'Sin ingrediente', 'Ingrediente extra', 'Mitad y mitad']
  },
  carniceria: {
    'Corte': ['Entero', 'Bistec', 'Cubos', 'Molida'],
    'Grosor': ['Delgado', 'Medio', 'Grueso', 'Especial']
  },
  ropa: {
    'Corte': ['Regular', 'Slim', 'Relajado', 'Oversize'],
    'Género': ['Dama', 'Caballero', 'Unisex', 'Infantil']
  },
  calzado: {
    'Ancho': ['Estrecho', 'Regular', 'Amplio', 'Extra amplio'],
    'Uso': ['Casual', 'Deportivo', 'Trabajo', 'Formal']
  },
  pintura: {
    'Base': ['Agua', 'Aceite', 'Acrílica', 'Especial'],
    'Rendimiento': ['Bajo', 'Estándar', 'Alto', 'Profesional']
  },
  electronica: {
    'Almacenamiento': ['64 GB', '128 GB', '256 GB', '512 GB'],
    'Garantía': ['Sin garantía', '3 meses', '6 meses', '1 año']
  }
};

function unique(values) {
  const seen = new Set();
  return (values || []).map(v => String(v).trim()).filter(v => {
    const key = v.toLocaleLowerCase('es-MX');
    if (!v || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

function mergeAttrs() {
  const out = {};
  for (const source of arguments) {
    Object.entries(source || {}).forEach(([name, values]) => {
      out[name] = unique((out[name] || []).concat(values || []));
    });
  }
  Object.keys(out).forEach(name => {
    if (out[name].length < 4) {
      out[name] = unique(out[name].concat(['Estándar', 'Especial', 'Personalizado', 'Otro'])).slice(0, 8);
    }
  });
  return out;
}

function expandGiroCatalogs(baseCategories, baseAttrs, giroIds) {
  const categories = {};
  const attrs = {};
  const missingProfiles = [];

  giroIds.forEach(id => {
    const profile = PROFILE_FOR[id];
    if (!profile || !CATEGORY_EXTRAS[profile] || !ATTRIBUTE_PROFILES[profile]) {
      missingProfiles.push(id); return;
    }
    categories[id] = unique([].concat(baseCategories[id] || [], SPECIFIC_CATEGORIES[id] || [], CATEGORY_EXTRAS[profile]));
    attrs[id] = mergeAttrs(ATTRIBUTE_PROFILES[profile], baseAttrs[id], SPECIFIC_ATTRIBUTES[id]);
  });

  if (missingProfiles.length) throw new Error('Giros sin perfil global: ' + missingProfiles.join(', '));

  const invalid = giroIds.filter(id => {
    const attrNames = Object.keys(attrs[id] || {});
    return !categories[id] || categories[id].length < 7 || attrNames.length < 3 || attrNames.some(name => attrs[id][name].length < 4);
  });
  if (invalid.length) throw new Error('Catálogo global incompleto: ' + invalid.join(', '));

  return { categories, attrs };
}

module.exports = { expandGiroCatalogs, PROFILE_FOR, CATEGORY_EXTRAS, ATTRIBUTE_PROFILES };
