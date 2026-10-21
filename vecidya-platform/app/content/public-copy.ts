export const PUBLIC_ACTION_LABELS = {
  diagnostic: "Hacer diagnóstico",
  diagnosticDiscovery: "Encontrar qué necesito",
  contact: "Contactar",
  services: "Ver servicios",
  addons: "Ver complementos",
  licenses: "Ver licencias",
} as const;

export const COMMERCIAL_BOUNDARY_COPY = {
  license: {
    eyebrow: "BASE CONTINUA",
    title: "Necesitas una plataforma para tu operación.",
    label: "Licencia",
  },
  addon: {
    eyebrow: "CAPACIDAD ADICIONAL",
    title: "Necesitas ampliar una capacidad específica.",
    label: "Addon",
  },
  service: {
    eyebrow: "TRABAJO PERSONALIZADO",
    title: "Necesitas que construyamos algo para tu contexto.",
    label: "Servicio",
  },
} as const;

export const COMMERCIAL_EXTERNAL_COSTS = "Los consumos externos de canales, proveedores o publicidad se informan aparte.";

export const DIAGNOSTIC_CTA_COPY = "El diagnóstico te ayuda a ubicar tu punto de partida antes de elegir una licencia, addon o servicio.";

export type CommercialBoundaryKind = keyof typeof COMMERCIAL_BOUNDARY_COPY;

// Allowlist de intereses comerciales; ningún parámetro aporta texto libre al canal.
export const COMMERCIAL_CONTACT_INTERESTS = {
  cuadra: "la licencia Cuadra",
  barrio: "la licencia Barrio",
  ciudad: "la licencia Ciudad",
  "servicio-estructuracion": "el servicio Presencia & Marca",
  "servicio-formalizacion": "el servicio Web & Conversión",
  "servicio-presencia-digital": "el servicio Visibilidad & Marketing",
  "servicio-automatizacion": "el servicio Sistema Comercial",
  "servicio-inteligencia-artificial": "el servicio Automatización & Integraciones",
  "servicio-visibilidad": "el servicio IA Aplicada",
  "servicio-desarrollo-empresarial": "el servicio Desarrollo Empresarial",
  "complemento-whatsapp-business": "el complemento WhatsApp Business",
  "complemento-telephony-sms": "el complemento Telefonía y SMS",
  "complemento-reputation-reviews": "el complemento Reputación y Reseñas",
  "complemento-campaigns-diffusion": "el complemento Campañas y Difusión",
  "complemento-conversational-ai": "el complemento IA Conversacional",
  "complemento-voice-ai": "el complemento IA de Voz",
  "complemento-connections-integrations": "el complemento Conexiones e Integraciones",
} as const;

export function resolveCommercialContactInterest(value: string | null) {
  if (!value || !Object.prototype.hasOwnProperty.call(COMMERCIAL_CONTACT_INTERESTS, value)) return null;
  const code = value as keyof typeof COMMERCIAL_CONTACT_INTERESTS;
  return { code, label: COMMERCIAL_CONTACT_INTERESTS[code] };
}

// Los enlaces preparan borradores editables, sin envío ni persistencia automáticos.
export function buildCommercialContactLinks(value: string | null, whatsappBaseUrl: string) {
  const interest = resolveCommercialContactInterest(value);
  if (!interest) return { interest: null, emailHref: "mailto:hola@vecidya.com", whatsappHref: whatsappBaseUrl };
  const message = `Hola, me interesa ${interest.label}. Quisiera conocer cómo empezar y qué incluye.`;
  return {
    interest,
    emailHref: `mailto:hola@vecidya.com?subject=${encodeURIComponent(`Consulta Vecidya: ${interest.label}`)}&body=${encodeURIComponent(message)}`,
    whatsappHref: `${whatsappBaseUrl}?text=${encodeURIComponent(message)}`,
  };
}


/**
 * Regreso a la oferta concreta que abrió Contacto.
 * Solo se utilizan identificadores previamente aceptados en la allowlist.
 * No se aceptan URLs, slugs arbitrarios ni parámetros de redirección externos.
 */
export function resolveCommercialContactReturn(value: string | null) {
  const interest = resolveCommercialContactInterest(value);
  if (!interest) return null;
  const { code, label } = interest;
  let to: string;
  if (code === "cuadra" || code === "barrio" || code === "ciudad") {
    to = `/licencias#${code}`;
  } else if (code.startsWith("servicio-")) {
    to = `/servicios#${code.slice("servicio-".length)}`;
  } else if (code.startsWith("complemento-")) {
    to = `/addons#${code.slice("complemento-".length)}`;
  } else {
    return null;
  }
  return { to, label: `Volver a ${label}` };
}
