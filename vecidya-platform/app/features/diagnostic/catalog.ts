/**
 * Referencias reales del catálogo Vecidya usadas por el motor de recomendación.
 *
 * Los ids de servicio son los anchors de `/servicios`; los nombres de addon son
 * los publicados en `/addons`; los slugs de Aprende existen en `app/content/learn.ts`.
 * La prueba `tests/unit/diagnostic/catalog.test.ts` verifica que sigan existiendo.
 */

export const licenseCatalog = {
  cuadra: { name: "Cuadra", objective: "Organiza." },
  barrio: { name: "Barrio", objective: "Capta y da seguimiento." },
  ciudad: { name: "Ciudad", objective: "Automatiza y controla." },
} as const;

export const serviceCatalog = {
  estructuracion: { title: "Presencia & Marca" },
  formalizacion: { title: "Web & Conversión" },
  "presencia-digital": { title: "Visibilidad & Marketing" },
  automatizacion: { title: "Automatización & Integraciones" },
  "inteligencia-artificial": { title: "IA Aplicada" },
  visibilidad: { title: "Sistema Comercial" },
  "desarrollo-empresarial": { title: "Desarrollo Empresarial" },
} as const;

export type ServiceId = keyof typeof serviceCatalog;

export const addonCatalog = {
  whatsapp: { name: "WhatsApp Business" },
  automatizaciones: { name: "Reputación & Reseñas" },
  "ai-conversacional": { name: "IA Conversacional" },
  sms: { name: "Telefonía & SMS" },
  campaigns: { name: "Campañas & Difusión" },
  voice: { name: "IA de Voz" },
  integrations: { name: "Conexiones & Integraciones" },
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
