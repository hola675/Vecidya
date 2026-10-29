/**
 * Vecidya Business Sector Taxonomy V1 (2026-10).
 *
 * UNA clasificación funcional compartida para el tipo de actividad del perfil público
 * (Vecindario) y la futura clasificación del Diagnóstico V9.
 * No es ISIC, NAICS, NACE ni la lista de categorías de Google Business Profile:
 * los códigos NAICS de referencia sirven solo para comprobar cobertura.
 *
 * Un sector describe la actividad principal; NO indica canal de venta
 * (ecommerce/presencial), comprador (B2B/B2C), tamaño, madurez, capacidad digital,
 * forma jurídica ni derecho a una licencia o servicio.
 *
 * El perfil actual guarda category como texto. Hasta una migración versionada:
 * guardar la etiqueta pública exacta, NO el ID y NO inferir el sector para datos
 * legacy. Los IDs permanecen estables para el futuro contrato transversal.
 */
export const BUSINESS_SECTOR_TAXONOMY_VERSION = "vecidya-business-sectors-v1" as const;

export const NAICS_2022_SECTORS = [
  "11", "21", "22", "23", "31-33", "42", "44-45", "48-49", "51", "52",
  "53", "54", "55", "56", "61", "62", "71", "72", "81", "92",
] as const;
export type Naics2022SectorCode = (typeof NAICS_2022_SECTORS)[number];

export type BusinessSectorDefinition = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly examples: readonly string[];
  /** Alcance orientativo, no equivalencia 1:1 ni código oficial Vecidya. */
  readonly naicsCoverage: readonly Naics2022SectorCode[];
};

/**
 * 15 familias comprensibles + una salida Otra actividad.
 * Casos mixtos: el usuario selecciona la actividad principal; las secundarias
 * y las modalidades se preguntarán aparte solo cuando importen.
 */
export const BUSINESS_SECTORS = [
  {
    id: "agro_nature", label: "Agropecuario, pesca y forestal",
    description: "Cultivo, cría de animales, pesca, acuicultura y actividades forestales.",
    examples: ["finca", "ganadería", "pesca", "vivero", "servicio agrícola"], naicsCoverage: ["11"],
  },
  {
    id: "industry_energy", label: "Industria, producción y energía",
    description: "Elaboración y fabricación industrial, extracción, suministros de energía y servicios públicos técnicos.",
    examples: ["fábrica", "procesamiento industrial", "minería", "energía", "agua y saneamiento"], naicsCoverage: ["21", "22", "31-33"],
  },
  {
    id: "commerce", label: "Comercio y distribución",
    description: "Venta y reventa de bienes al por mayor o menor, tanto presencial como por internet.",
    examples: ["tienda", "mayorista", "ferretería", "venta de autos", "tienda en línea"], naicsCoverage: ["42", "44-45"],
  },
  {
    id: "food", label: "Gastronomía y alimentación",
    description: "Preparación de comidas, bebidas y atención gastronómica; la fabricación industrial pertenece a producción.",
    examples: ["restaurante", "cafetería", "catering", "panadería artesanal", "comida para llevar"], naicsCoverage: ["72"],
  },
  {
    id: "tourism", label: "Turismo y alojamiento",
    description: "Hospedaje, planificación y experiencias de viaje, recreación turística.",
    examples: ["hotel", "casa de huéspedes", "agencia de viajes", "guía turístico", "excursiones"], naicsCoverage: ["72", "71"],
  },
  {
    id: "construction_property", label: "Construcción e inmobiliaria",
    description: "Obras, reformas, arquitectura constructiva y gestión/comercialización de inmuebles.",
    examples: ["constructora", "obra y reformas", "inmobiliaria", "administración de propiedades"], naicsCoverage: ["23", "53"],
  },
  {
    id: "transport_logistics", label: "Transporte y logística",
    description: "Movilidad de personas o mercancías, mensajería, almacenes y distribución logística.",
    examples: ["taxi", "cargas", "mensajería", "almacén", "mudanzas"], naicsCoverage: ["48-49"],
  },
  {
    id: "tech_communications", label: "Tecnología y comunicaciones",
    description: "Software, soporte informático, infraestructura digital, telecomunicaciones y servicios tecnológicos.",
    examples: ["desarrollo de software", "soporte TI", "hosting", "telecomunicaciones"], naicsCoverage: ["51", "54"],
  },
  {
    id: "health_wellness", label: "Salud y bienestar",
    description: "Servicios de salud, atención clínica, asistencia sanitaria y bienestar.",
    examples: ["clínica", "odontología", "psicología", "fisioterapia", "centro de bienestar"], naicsCoverage: ["62"],
  },
  {
    id: "education", label: "Educación y formación",
    description: "Enseñanza, formación profesional, academias, capacitación y tutoría.",
    examples: ["escuela", "academia", "clases particulares", "capacitación", "cursos"], naicsCoverage: ["61"],
  },
  {
    id: "finance_insurance", label: "Finanzas, contabilidad y seguros",
    description: "Servicios financieros, contables, tributarios, de seguros y actividades afines.",
    examples: ["contabilidad", "impuestos", "correduría de seguros", "asesoría financiera"], naicsCoverage: ["52", "54"],
  },
  {
    id: "legal_professional", label: "Servicios profesionales y legales",
    description: "Abogacía, consultoría, servicios empresariales, científicos, administrativos y especializados.",
    examples: ["despacho jurídico", "consultoría", "agencia de marketing", "ingeniería", "asesoría a empresas"], naicsCoverage: ["54", "55", "56"],
  },
  {
    id: "personal_maintenance", label: "Servicios personales y mantenimiento",
    description: "Belleza, reparación, limpieza, servicios domésticos, automotrices y asistencia cotidiana.",
    examples: ["peluquería", "taller mecánico", "limpieza", "plomería", "reparaciones"], naicsCoverage: ["81", "56"],
  },
  {
    id: "culture_sport", label: "Arte, cultura, deporte y entretenimiento",
    description: "Creación cultural, artes, actividades deportivas, espectáculos y entretenimiento.",
    examples: ["fotografía artística", "música", "gimnasio", "eventos", "creación de contenido"], naicsCoverage: ["71", "51"],
  },
  {
    id: "community_public", label: "Actividades sociales, comunitarias y públicas",
    description: "Servicios sociales, proyectos comunitarios, administración pública y atención a la comunidad; una organización sin ánimo de lucro puede elegir otro sector si esa es su actividad principal.",
    examples: ["centro comunitario", "asociación de apoyo social", "institución pública", "proyecto vecinal"], naicsCoverage: ["92", "62", "56"],
  },
  {
    id: "other", label: "Otra actividad",
    description: "Actividad que la persona no encuentra representada en las categorías anteriores. No se interpreta automáticamente como un sector concreto.",
    examples: ["actividad no clasificada"], naicsCoverage: [],
  },
] as const satisfies readonly BusinessSectorDefinition[];

export type BusinessSectorId = (typeof BUSINESS_SECTORS)[number]["id"];

const BY_ID: ReadonlyMap<string, (typeof BUSINESS_SECTORS)[number]> =
  new Map(BUSINESS_SECTORS.map((sector) => [sector.id, sector]));
const BY_LABEL: ReadonlyMap<string, (typeof BUSINESS_SECTORS)[number]> =
  new Map(BUSINESS_SECTORS.map((sector) => [sector.label, sector]));

/** Lookup EXACTO: no adivinamos el sector desde palabras clave ni etiquetas legacy. */
export function getBusinessSectorById(value: string | null | undefined) {
  return value ? BY_ID.get(value) : undefined;
}
export function getBusinessSectorByLabel(value: string | null | undefined) {
  return value ? BY_LABEL.get(value) : undefined;
}

/**
 * La columna `business_profile.category` sigue siendo un texto editable.
 * Solo la elección expresa de una opción canónica registra su etiqueta en V1.
 * Una categoría histórica desconocida sigue intacta hasta revisión humana.
 */
export function businessCategoryOptions(currentCategory: string | null | undefined) {
  const current = currentCategory?.trim() ?? "";
  return {
    canonical: BUSINESS_SECTORS.map(({ id, label }) => ({ id, label })),
    legacy: current && !getBusinessSectorByLabel(current) ? current : null,
  };
}

/** Pistas de búsqueda; sugerir NO asigna una categoría automáticamente. */
export const BUSINESS_SECTOR_SEARCH_ALIASES: Readonly<Record<BusinessSectorId, readonly string[]>> = {
  agro_nature: ["finca", "granja", "campesino", "cultivo", "agricultura", "ganaderia", "pesca", "veterinaria agropecuaria"],
  industry_energy: ["industria", "fabrica", "manufactura", "produccion", "carpinteria industrial", "mineria", "electricidad", "energia"],
  commerce: ["tienda", "comercio", "venta", "tienda online", "tienda en linea", "venta online", "venta por internet", "ecommerce", "ferreteria", "supermercado"],
  food: ["restaurante", "cafeteria", "comida", "panaderia", "catering", "bar", "pasteleria", "cocinero"],
  tourism: ["hotel", "hostal", "hospedaje", "casa de huespedes", "viajes", "agencia de viajes", "turismo"],
  construction_property: ["construccion", "albanil", "constructor", "inmobiliaria", "alquiler de vivienda", "reforma"],
  transport_logistics: ["transportista", "taxi", "camion", "mensajeria", "reparto", "mudanza", "logistica"],
  tech_communications: ["software", "programador", "desarrollador", "informatica", "soporte tecnico", "telecomunicaciones", "aplicaciones"],
  health_wellness: ["medico", "dentista", "odontologia", "clinica", "psicologo", "fisioterapia", "salud"],
  education: ["profesor", "maestro", "academia", "clases particulares", "escuela", "formacion", "tutor"],
  finance_insurance: ["contador", "contabilidad", "impuestos", "taxes", "seguros", "asesor financiero"],
  legal_professional: ["abogado", "asesoria legal", "bufete", "juridico", "consultoria", "agencia de marketing", "marketing", "servicios profesionales"],
  personal_maintenance: ["peluqueria", "barberia", "estetica", "taller mecanico", "mecanico", "limpieza", "plomero", "electricista", "reparacion"],
  culture_sport: ["artista", "fotografo", "musica", "deporte", "gimnasio", "eventos", "entretenimiento", "creador de contenido"],
  community_public: ["ong", "asociacion", "organizacion comunitaria", "institucion publica", "social", "comunidad"],
  other: ["otra", "otro", "no encuentro"],
};

export function normalizeBusinessSectorSearch(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim().replace(/\s+/g, " ");
}

/** Devuelve sugerencias ordenadas, nunca un sector decidido por software. */
export function searchBusinessSectors(text: string, limit = 7) {
  const q = normalizeBusinessSectorSearch(text);
  if (!q) return [];
  return BUSINESS_SECTORS
    .map((sector) => {
      const id = sector.id as BusinessSectorId;
      const label = normalizeBusinessSectorSearch(sector.label);
      const aliases = BUSINESS_SECTOR_SEARCH_ALIASES[id].map(normalizeBusinessSectorSearch);
      const examples = sector.examples.map(normalizeBusinessSectorSearch);
      const score = label === q ? 4 : label.includes(q) ? 3
        : aliases.some((alias) => alias === q || alias.startsWith(q)) ? 2
          : [...aliases, ...examples].some((phrase) => phrase.includes(q)) ? 1 : 0;
      return { sector, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.sector.label.localeCompare(b.sector.label, "es"))
    .slice(0, Math.max(0, limit))
    .map(({ sector }) => sector);
}
