export const PUBLIC_ACTION_LABELS = {
  diagnostic: "Hacer diagnóstico",
  diagnosticDiscovery: "Encontrar qué necesito",
  contact: "Contactar",
  services: "Ver servicios",
  addons: "Ver addons",
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
