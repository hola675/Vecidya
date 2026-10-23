export type BusinessOffering = {
  kind: "service" | "product";
  title: string;
  description: string;
  priceLabel: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type BusinessFaqItem = {
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

export const MAX_BUSINESS_OFFERINGS = 12;
export const MAX_BUSINESS_FAQ_ITEMS = 12;
export const MAX_BUSINESS_CONTENT_BYTES = 32_768;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number, label: string, required = true): string | null {
  if (typeof value !== "string") throw new TypeError(`${label} no es válido.`);
  const normalized = value.trim();
  if ((required && normalized.length === 0) || normalized.length > maxLength) {
    throw new TypeError(`${label} debe tener entre ${required ? 1 : 0} y ${maxLength} caracteres.`);
  }
  return normalized || null;
}

function order(value: unknown, length: number) {
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) >= length) {
    throw new TypeError("El orden del contenido debe ser único y consecutivo.");
  }
  return Number(value);
}

export function validateBusinessOfferings(value: unknown): BusinessOffering[] {
  if (!Array.isArray(value) || value.length > MAX_BUSINESS_OFFERINGS) {
    throw new TypeError(`Puedes guardar hasta ${MAX_BUSINESS_OFFERINGS} ofertas.`);
  }
  const orders = new Set<number>();
  return value.map((item) => {
    if (!isRecord(item) || Object.keys(item).some((key) => !["kind", "title", "description", "priceLabel", "sortOrder", "isActive"].includes(key))) {
      throw new TypeError("Una oferta tiene campos no permitidos.");
    }
    if (item.kind !== "service" && item.kind !== "product") throw new TypeError("El tipo de oferta no es válido.");
    const kind: BusinessOffering["kind"] = item.kind;
    const sortOrder = order(item.sortOrder, value.length);
    if (orders.has(sortOrder)) throw new TypeError("El orden de las ofertas debe ser único.");
    orders.add(sortOrder);
    if (typeof item.isActive !== "boolean") throw new TypeError("El estado de publicación de la oferta no es válido.");
    return {
      kind,
      title: text(item.title, 120, "El título")!,
      description: text(item.description, 600, "La descripción")!,
      priceLabel: text(item.priceLabel ?? "", 80, "El texto de precio", false),
      sortOrder,
      isActive: item.isActive,
    };
  }).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function validateBusinessFaqItems(value: unknown): BusinessFaqItem[] {
  if (!Array.isArray(value) || value.length > MAX_BUSINESS_FAQ_ITEMS) {
    throw new TypeError(`Puedes guardar hasta ${MAX_BUSINESS_FAQ_ITEMS} preguntas frecuentes.`);
  }
  const orders = new Set<number>();
  return value.map((item) => {
    if (!isRecord(item) || Object.keys(item).some((key) => !["question", "answer", "sortOrder", "isActive"].includes(key))) {
      throw new TypeError("Una pregunta frecuente tiene campos no permitidos.");
    }
    const sortOrder = order(item.sortOrder, value.length);
    if (orders.has(sortOrder)) throw new TypeError("El orden de las preguntas debe ser único.");
    orders.add(sortOrder);
    if (typeof item.isActive !== "boolean") throw new TypeError("El estado de publicación de la pregunta no es válido.");
    return {
      question: text(item.question, 240, "La pregunta")!,
      answer: text(item.answer, 1200, "La respuesta")!,
      sortOrder,
      isActive: item.isActive,
    };
  }).sort((left, right) => left.sortOrder - right.sortOrder);
}
