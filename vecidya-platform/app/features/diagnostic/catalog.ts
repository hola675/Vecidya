/**
 * Referencias reales del catálogo Vecidya usadas por el motor de recomendación.
 *
 * Los ids de servicio son los anchors de `/servicios`; los nombres de addon son
 * los publicados en `/addons`; los slugs de Aprende existen en `app/content/learn.ts`.
 * La prueba `tests/unit/diagnostic/catalog.test.ts` verifica que sigan existiendo.
 */

export const licenseCatalog = {
  cuadra: { name: "Cuadra", objective: "Ordenar el negocio." },
  barrio: { name: "Barrio", objective: "Captar oportunidades y hacer seguimiento." },
  ciudad: { name: "Ciudad", objective: "Automatizar y escalar." },
} as const;

export const serviceCatalog = {
  estructuracion: { title: "Organización del negocio" },
  formalizacion: { title: "Formalización de base" },
  "presencia-digital": { title: "Presencia digital" },
  automatizacion: { title: "Automatización" },
  "inteligencia-artificial": { title: "Inteligencia artificial" },
  visibilidad: { title: "Marketing y crecimiento" },
} as const;

export type ServiceId = keyof typeof serviceCatalog;

export const addonCatalog = {
  whatsapp: { name: "WhatsApp" },
  automatizaciones: { name: "Automatizaciones" },
  "ai-conversacional": { name: "IA conversacional" },
} as const;

export type AddonId = keyof typeof addonCatalog;

export const learnCatalog = {
  crm: {
    slug: "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
    title: "¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo?",
  },
  ai: {
    slug: "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    title: "¿Qué puede hacer una inteligencia artificial por un negocio?",
  },
  presence: {
    slug: "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
    title: "Antes de hacer publicidad, organiza tu presencia digital",
  },
  automation: {
    slug: "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
    title: "Automatizaciones: ahorrar tiempo sin complicar tu negocio",
  },
} as const;

export type LearnId = keyof typeof learnCatalog;

export const servicePath = (id: ServiceId) => `/servicios#${id}`;
export const learnPath = (id: LearnId) => `/aprende/${learnCatalog[id].slug}`;
