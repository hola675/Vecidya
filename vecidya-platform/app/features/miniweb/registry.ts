export type MiniWebTemplateFamily = "services" | "catalog" | "gastronomy" | "professional";
export type MiniWebAvailability = "available" | "planned";

export const MINIWEB_MODULE_TYPES = [
  "hero",
  "about",
  "contact",
  "hours",
  "services",
  "gallery",
  "location",
  "products",
  "articles",
  "faq",
  "team",
  "certifications",
  "testimonials",
] as const;

export type MiniWebModuleType = (typeof MINIWEB_MODULE_TYPES)[number];

export type MiniWebTemplateDefinition = {
  key: string;
  version: number;
  name: string;
  description: string;
  family: MiniWebTemplateFamily;
  availability: MiniWebAvailability;
  supportedModules: readonly MiniWebModuleType[];
  defaultModuleOrder: readonly MiniWebModuleType[];
  layoutVariants: readonly string[];
  capabilities: readonly string[];
};

export type MiniWebModuleDefinition = {
  type: MiniWebModuleType;
  version: number;
  label: string;
  description: string;
  icon: string;
  source: string;
  supportedTemplates: readonly string[];
  configurable: boolean;
  reorderable: boolean;
  required: boolean;
  availability: MiniWebAvailability;
  layoutVariants: readonly string[];
};

export const DEFAULT_MINIWEB_TEMPLATE_KEY = "vecidya-default";

const allTypes = MINIWEB_MODULE_TYPES;
const defaultLayoutVariants = ["standard"] as const;
const commonTemplate = [DEFAULT_MINIWEB_TEMPLATE_KEY] as const;

export const MINIWEB_TEMPLATE_REGISTRY: Readonly<Record<string, MiniWebTemplateDefinition>> = {
  [DEFAULT_MINIWEB_TEMPLATE_KEY]: {
    key: DEFAULT_MINIWEB_TEMPLATE_KEY,
    version: 1,
    name: "Esencial",
    description: "Presentación compatible con el perfil público actual.",
    family: "professional",
    availability: "available",
    supportedModules: allTypes,
    defaultModuleOrder: ["hero", "about", "contact", "location", "hours", "services", "gallery", "products", "articles", "faq", "team", "certifications", "testimonials"],
    layoutVariants: defaultLayoutVariants,
    capabilities: ["responsive", "single-page", "structured-modules"],
  },
  "services-studio": {
    key: "services-studio",
    version: 1,
    name: "Servicios",
    description: "Familia para negocios orientados a servicios.",
    family: "services",
    availability: "planned",
    supportedModules: allTypes,
    defaultModuleOrder: ["hero", "about", "services", "contact", "location", "hours"],
    layoutVariants: defaultLayoutVariants,
    capabilities: ["responsive", "single-page", "structured-modules"],
  },
  "catalog-store": {
    key: "catalog-store",
    version: 1,
    name: "Catálogo",
    description: "Familia para negocios con catálogo de productos.",
    family: "catalog",
    availability: "planned",
    supportedModules: allTypes,
    defaultModuleOrder: ["hero", "about", "products", "contact", "location", "hours"],
    layoutVariants: defaultLayoutVariants,
    capabilities: ["responsive", "single-page", "structured-modules"],
  },
  "gastronomy-table": {
    key: "gastronomy-table",
    version: 1,
    name: "Gastronomía",
    description: "Familia para negocios gastronómicos.",
    family: "gastronomy",
    availability: "planned",
    supportedModules: allTypes,
    defaultModuleOrder: ["hero", "about", "products", "hours", "location", "contact"],
    layoutVariants: defaultLayoutVariants,
    capabilities: ["responsive", "single-page", "structured-modules"],
  },
  "professional-profile": {
    key: "professional-profile",
    version: 1,
    name: "Profesional",
    description: "Familia para perfiles profesionales.",
    family: "professional",
    availability: "planned",
    supportedModules: allTypes,
    defaultModuleOrder: ["hero", "about", "certifications", "testimonials", "contact", "location", "hours"],
    layoutVariants: defaultLayoutVariants,
    capabilities: ["responsive", "single-page", "structured-modules"],
  },
};

const definitions: Record<MiniWebModuleType, Omit<MiniWebModuleDefinition, "type">> = {
  hero: { version: 1, label: "Presentación", description: "Identidad y presentación principal del negocio.", icon: "building", source: "business_profile", supportedTemplates: commonTemplate, configurable: false, reorderable: false, required: true, availability: "available", layoutVariants: ["standard"] },
  about: { version: 1, label: "Acerca del negocio", description: "Descripción del negocio declarada en el perfil.", icon: "file-text", source: "business_profile", supportedTemplates: commonTemplate, configurable: false, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  contact: { version: 1, label: "Contacto", description: "Canales directos configurados por el negocio.", icon: "phone", source: "business_profile", supportedTemplates: commonTemplate, configurable: false, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  hours: { version: 1, label: "Horarios", description: "Horarios de atención existentes.", icon: "clock", source: "business_hours", supportedTemplates: commonTemplate, configurable: false, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  services: { version: 1, label: "Servicios ofrecidos", description: "Servicios que el negocio decide presentar en su MiniWeb.", icon: "spark", source: "business_offering", supportedTemplates: ["vecidya-default"], configurable: true, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  gallery: { version: 1, label: "Galería", description: "Medios gestionados con almacenamiento externo en APP-MINI-02C.", icon: "image", source: "r2_media", supportedTemplates: ["vecidya-default", "services-studio", "catalog-store", "gastronomy-table", "professional-profile"], configurable: true, reorderable: true, required: false, availability: "planned", layoutVariants: ["standard"] },
  location: { version: 1, label: "Ubicación y modalidad", description: "Ciudad, país, modalidad y área de atención existentes.", icon: "map-pin", source: "business_profile", supportedTemplates: commonTemplate, configurable: false, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  products: { version: 1, label: "Productos", description: "Productos que el negocio decide presentar en su MiniWeb.", icon: "package", source: "business_offering", supportedTemplates: commonTemplate, configurable: true, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  articles: { version: 1, label: "Artículos", description: "Contenido editorial estructurado futuro.", icon: "newspaper", source: "business_article", supportedTemplates: ["vecidya-default", "professional-profile"], configurable: true, reorderable: true, required: false, availability: "planned", layoutVariants: ["standard"] },
  faq: { version: 1, label: "Preguntas frecuentes", description: "Respuestas que ayudan a las personas a conocer el negocio.", icon: "circle-help", source: "business_faq", supportedTemplates: commonTemplate, configurable: true, reorderable: true, required: false, availability: "available", layoutVariants: ["standard"] },
  team: { version: 1, label: "Equipo", description: "Perfiles estructurados del equipo en un checkpoint posterior.", icon: "users", source: "business_team", supportedTemplates: ["services-studio", "gastronomy-table", "professional-profile"], configurable: true, reorderable: true, required: false, availability: "planned", layoutVariants: ["standard"] },
  certifications: { version: 1, label: "Certificaciones", description: "Credenciales estructuradas futuras.", icon: "badge-check", source: "business_certification", supportedTemplates: ["professional-profile"], configurable: true, reorderable: true, required: false, availability: "planned", layoutVariants: ["standard"] },
  testimonials: { version: 1, label: "Testimonios", description: "Testimonios estructurados futuros.", icon: "quote", source: "business_testimonial", supportedTemplates: ["services-studio", "professional-profile"], configurable: true, reorderable: true, required: false, availability: "planned", layoutVariants: ["standard"] },
};

export const MINIWEB_MODULE_REGISTRY: Readonly<Record<MiniWebModuleType, MiniWebModuleDefinition>> = Object.fromEntries(
  MINIWEB_MODULE_TYPES.map((type) => [type, { type, ...definitions[type] }]),
) as Record<MiniWebModuleType, MiniWebModuleDefinition>;

export const SUPPORTED_MINIWEB_MODULE_TYPES: readonly MiniWebModuleType[] = MINIWEB_MODULE_TYPES.filter(
  (type) => MINIWEB_MODULE_REGISTRY[type].availability === "available",
);
export const MAX_MINIWEB_CONFIGURATION_BYTES = 4096;

export type MiniWebModuleConfig = {
  type: MiniWebModuleType;
  moduleVersion: number;
  enabled: boolean;
  sortOrder: number;
  layoutVariant: string;
  settings: null;
};

export type MiniWebConfiguration = {
  version: 1;
  templateKey: string;
  templateVersion: number;
  layoutVariant: string;
  modules: MiniWebModuleConfig[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

export function validateMiniWebDraft(value: unknown): MiniWebConfiguration {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "templateKey", "templateVersion", "layoutVariant", "modules"])) {
    throw new TypeError("La configuración MiniWeb tiene una estructura inválida.");
  }
  if (value.version !== undefined && value.version !== 1) throw new TypeError("La versión de configuración MiniWeb no es válida.");

  const template = typeof value.templateKey === "string" ? MINIWEB_TEMPLATE_REGISTRY[value.templateKey] : undefined;
  if (!template || template.availability !== "available" || value.templateVersion !== template.version) {
    throw new TypeError("La plantilla MiniWeb no está disponible o su versión no es válida.");
  }
  if (typeof value.layoutVariant !== "string" || !template.layoutVariants.includes(value.layoutVariant)) {
    throw new TypeError("La variante de plantilla MiniWeb no es válida.");
  }
  if (!Array.isArray(value.modules) || value.modules.length > SUPPORTED_MINIWEB_MODULE_TYPES.length) {
    throw new TypeError("La lista de módulos MiniWeb no es válida.");
  }

  const modules: MiniWebModuleConfig[] = [];
  const seen = new Set<string>();
  for (const item of value.modules) {
    if (!isRecord(item) || !hasOnlyKeys(item, ["type", "moduleVersion", "enabled", "sortOrder", "layoutVariant", "settings"])) {
      throw new TypeError("La configuración de un módulo MiniWeb no es válida.");
    }
    const type = typeof item.type === "string" && MINIWEB_MODULE_TYPES.includes(item.type as MiniWebModuleType)
      ? item.type as MiniWebModuleType
      : null;
    const definition = type ? MINIWEB_MODULE_REGISTRY[type] : null;
    if (!definition || definition.availability !== "available" || !template.supportedModules.includes(definition.type)) {
      throw new TypeError("El módulo MiniWeb no está disponible para esta plantilla.");
    }
    if (seen.has(definition.type)) throw new TypeError("La configuración contiene módulos duplicados.");
    seen.add(definition.type);
    if (item.moduleVersion !== definition.version || typeof item.enabled !== "boolean") {
      throw new TypeError("La versión o el estado del módulo MiniWeb no son válidos.");
    }
    if (!Number.isSafeInteger(item.sortOrder) || (item.sortOrder as number) < 0 || (item.sortOrder as number) >= value.modules.length) {
      throw new TypeError("El orden del módulo MiniWeb no es válido.");
    }
    if (typeof item.layoutVariant !== "string" || !definition.layoutVariants.includes(item.layoutVariant)) {
      throw new TypeError("La variante del módulo MiniWeb no es válida.");
    }
    if (item.settings !== null) throw new TypeError("Este módulo no admite configuración adicional.");
    modules.push({
      type: definition.type,
      moduleVersion: definition.version,
      enabled: item.enabled,
      sortOrder: item.sortOrder as number,
      layoutVariant: item.layoutVariant,
      settings: null,
    });
  }

  if (new Set(modules.map((module) => module.sortOrder)).size !== modules.length) {
    throw new TypeError("El orden de módulos MiniWeb debe ser único y determinístico.");
  }
  if (!seen.has("hero")) throw new TypeError("El módulo hero es obligatorio y no se puede omitir.");
  if (modules.some((module) => module.type === "hero" && !module.enabled)) {
    throw new TypeError("El módulo hero es obligatorio y no se puede desactivar.");
  }
  if (modules.find((module) => module.type === "hero")?.sortOrder !== 0) {
    throw new TypeError("El módulo hero debe permanecer primero.");
  }

  return {
    version: 1,
    templateKey: template.key,
    templateVersion: template.version,
    layoutVariant: value.layoutVariant,
    modules: sortMiniWebModules(modules),
  };
}

export function serializeMiniWebConfiguration(value: unknown) {
  const serialized = JSON.stringify(validateMiniWebDraft(value));
  if (new TextEncoder().encode(serialized).byteLength > MAX_MINIWEB_CONFIGURATION_BYTES) {
    throw new TypeError("La configuración MiniWeb excede el tamaño máximo permitido.");
  }
  return serialized;
}

export function parseMiniWebConfigurationJson(value: unknown): MiniWebConfiguration | null {
  if (typeof value !== "string" || new TextEncoder().encode(value).byteLength > MAX_MINIWEB_CONFIGURATION_BYTES) return null;
  try {
    return ensureAvailableMiniWebModules(validateMiniWebDraft(JSON.parse(value)));
  } catch {
    return null;
  }
}

export function ensureAvailableMiniWebModules(configuration: MiniWebConfiguration): MiniWebConfiguration {
  const template = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey];
  if (!template) return configuration;
  const present = new Set(configuration.modules.map((module) => module.type));
  const nextOrder = configuration.modules.reduce((max, module) => Math.max(max, module.sortOrder), -1) + 1;
  const additions = template.supportedModules
    .filter((type) => MINIWEB_MODULE_REGISTRY[type].availability === "available" && !present.has(type))
    .map((type, index) => ({
      type,
      moduleVersion: MINIWEB_MODULE_REGISTRY[type].version,
      enabled: false,
      sortOrder: nextOrder + index,
      layoutVariant: MINIWEB_MODULE_REGISTRY[type].layoutVariants[0],
      settings: null,
    }));
  return additions.length ? validateMiniWebDraft({ ...configuration, modules: [...configuration.modules, ...additions] }) : configuration;
}

export type MiniWebProfileSource = {
  displayName: string;
  shortDescription: string | null;
  description: string | null;
  phone: string | null;
  publicEmail: string | null;
  websiteUrl: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  serviceMode: string | null;
  serviceArea: string | null;
};

export type MiniWebHoursSource = readonly { dayOfWeek: number; isClosed: boolean; opensAt: string | null; closesAt: string | null }[];

function hasUsefulValue(...values: (string | null)[]) {
  return values.some((value) => typeof value === "string" && value.trim().length > 0);
}

function hasUsefulContact(profile: MiniWebProfileSource) {
  const phone = profile.phone?.trim().replace(/[\s().-]/g, "") ?? "";
  const whatsapp = profile.whatsapp?.replace(/\D/g, "") ?? "";
  const email = profile.publicEmail?.trim() ?? "";
  const validWebUrl = (value: string | null) => {
    if (!value) return false;
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  };
  return /^\+?\d{7,15}$/.test(phone)
    || /^\d{8,15}$/.test(whatsapp)
    || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || validWebUrl(profile.websiteUrl)
    || [profile.instagramUrl, profile.facebookUrl, profile.linkedinUrl].some(validWebUrl);
}

export function buildVirtualMiniWebConfiguration(profile: MiniWebProfileSource, hours: MiniWebHoursSource): MiniWebConfiguration {
  const template = MINIWEB_TEMPLATE_REGISTRY[DEFAULT_MINIWEB_TEMPLATE_KEY];
  const hasContent: Record<MiniWebModuleType, boolean> = {
    hero: hasUsefulValue(profile.displayName),
    about: hasUsefulValue(profile.description),
    contact: hasUsefulContact(profile),
    hours: hours.length > 0,
    location: hasUsefulValue(profile.category, profile.city, profile.country, profile.serviceMode, profile.serviceArea),
    services: false,
    gallery: false,
    products: false,
    articles: false,
    faq: false,
    team: false,
    certifications: false,
    testimonials: false,
  };

  return validateMiniWebDraft({
    templateKey: template.key,
    templateVersion: template.version,
    layoutVariant: template.layoutVariants[0],
    modules: template.defaultModuleOrder
      .filter((type) => MINIWEB_MODULE_REGISTRY[type].availability === "available")
      .map((type, sortOrder) => ({
        type,
        moduleVersion: MINIWEB_MODULE_REGISTRY[type].version,
        enabled: MINIWEB_MODULE_REGISTRY[type].required || hasContent[type],
        sortOrder,
        layoutVariant: MINIWEB_MODULE_REGISTRY[type].layoutVariants[0],
        settings: null,
      })),
  });
}

export function buildSafeMiniWebConfiguration(): MiniWebConfiguration {
  const template = MINIWEB_TEMPLATE_REGISTRY[DEFAULT_MINIWEB_TEMPLATE_KEY];
  const hero = MINIWEB_MODULE_REGISTRY.hero;
  return validateMiniWebDraft({
    templateKey: template.key,
    templateVersion: template.version,
    layoutVariant: template.layoutVariants[0],
    modules: [{
      type: "hero",
      moduleVersion: hero.version,
      enabled: true,
      sortOrder: 0,
      layoutVariant: hero.layoutVariants[0],
      settings: null,
    }],
  });
}

export function sortMiniWebModules<T extends { type: string; sortOrder: number }>(modules: readonly T[]): T[] {
  return [...modules].sort((left, right) => left.sortOrder - right.sortOrder || left.type.localeCompare(right.type));
}
