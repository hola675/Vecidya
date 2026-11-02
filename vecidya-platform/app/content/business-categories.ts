/** Catálogo estable de categorías de Vecindario. No altera ni migra datos existentes. */
export const BUSINESS_CATEGORIES = [
  "Alimentación y gastronomía", "Belleza y bienestar", "Comercio y tiendas",
  "Construcción y mantenimiento", "Educación y formación", "Hogar y decoración",
  "Salud y cuidado", "Servicios profesionales", "Tecnología y comunicaciones",
  "Transporte y automoción", "Turismo y alojamiento", "Arte y entretenimiento",
  "Otras actividades",
] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim().replace(/\s+/g, " ");
const aliases: Record<string, BusinessCategory> = {
  restaurante: "Alimentación y gastronomía", restaurantes: "Alimentación y gastronomía", gastronomia: "Alimentación y gastronomía", comida: "Alimentación y gastronomía", cafeteria: "Alimentación y gastronomía",
  belleza: "Belleza y bienestar", barberia: "Belleza y bienestar", peluqueria: "Belleza y bienestar", spa: "Belleza y bienestar",
  tienda: "Comercio y tiendas", comercio: "Comercio y tiendas", retail: "Comercio y tiendas",
  construccion: "Construcción y mantenimiento", reparaciones: "Construcción y mantenimiento",
  educacion: "Educación y formación", academia: "Educación y formación",
  hogar: "Hogar y decoración", decoracion: "Hogar y decoración",
  salud: "Salud y cuidado", bienestar: "Belleza y bienestar",
  servicios: "Servicios profesionales", profesional: "Servicios profesionales", consultoria: "Servicios profesionales",
  tecnologia: "Tecnología y comunicaciones", informatica: "Tecnología y comunicaciones",
  transporte: "Transporte y automoción", automocion: "Transporte y automoción", taller: "Transporte y automoción", autos: "Transporte y automoción",
  turismo: "Turismo y alojamiento", hotel: "Turismo y alojamiento",
  arte: "Arte y entretenimiento", entretenimiento: "Arte y entretenimiento",
};
const categoriesByKey = new Map<string, BusinessCategory>(BUSINESS_CATEGORIES.map((label) => [clean(label), label]));
/** Las etiquetas desconocidas permanecen en DB; la UI pública usa una categoría agregada. */
export function canonicalBusinessCategory(value: string | null | undefined): BusinessCategory | null {
  if (!value?.trim()) return null;
  const normalized = clean(value);
  return categoriesByKey.get(normalized) ?? aliases[normalized] ?? "Otras actividades";
}
export function isBusinessCategory(value: string): value is BusinessCategory {
  return categoriesByKey.has(clean(value));
}
