/**
 * APP-MINI-V2A: catálogo de variantes visuales, sin activar plantillas ni alterar V1.
 * Este módulo no decide licencias: la autorización se verificará en servidor en V2-C.
 */
export const MINIWEB_VISUAL_TIERS = ["cuadra", "barrio", "ciudad"] as const;
export type MiniWebVisualTier = (typeof MINIWEB_VISUAL_TIERS)[number];

export const MINIWEB_VISUAL_VARIANT_KEYS = ["base", "pro", "premium"] as const;
export type MiniWebVisualVariantKey = (typeof MINIWEB_VISUAL_VARIANT_KEYS)[number];

export type MiniWebVisualComposition = Readonly<{
  hero: "split" | "asymmetric" | "immersive";
  offerings: "uniform-grid" | "editorial-grid" | "narrative";
  gallery: "uniform-grid" | "mosaic" | "editorial-sequence";
  density: "comfortable" | "editorial" | "immersive";
  motion: "none" | "subtle";
}>;

export type MiniWebVisualVariantDefinition = Readonly<{
  key: MiniWebVisualVariantKey;
  label: string;
  minimumTier: MiniWebVisualTier;
  composition: MiniWebVisualComposition;
}>;

/** Propuesta tipada para el renderer V2. No registra variantes como disponibles en V1. */
export const MINIWEB_VISUAL_VARIANTS: Readonly<Record<MiniWebVisualVariantKey, MiniWebVisualVariantDefinition>> = {
  base: {
    key: "base",
    label: "Base",
    minimumTier: "cuadra",
    composition: {
      hero: "split",
      offerings: "uniform-grid",
      gallery: "uniform-grid",
      density: "comfortable",
      motion: "none",
    },
  },
  pro: {
    key: "pro",
    label: "Pro",
    minimumTier: "barrio",
    composition: {
      hero: "asymmetric",
      offerings: "editorial-grid",
      gallery: "mosaic",
      density: "editorial",
      motion: "subtle",
    },
  },
  premium: {
    key: "premium",
    label: "Premium",
    minimumTier: "ciudad",
    composition: {
      hero: "immersive",
      offerings: "narrative",
      gallery: "editorial-sequence",
      density: "immersive",
      motion: "subtle",
    },
  },
};

export function getMiniWebVisualVariant(key: string): MiniWebVisualVariantDefinition | null {
  return Object.prototype.hasOwnProperty.call(MINIWEB_VISUAL_VARIANTS, key)
    ? MINIWEB_VISUAL_VARIANTS[key as MiniWebVisualVariantKey]
    : null;
}

/** Solo comparador puro. No reemplaza las comprobaciones de licencia del backend. */
export function isMiniWebVisualTierSufficient(
  currentTier: MiniWebVisualTier,
  requiredTier: MiniWebVisualTier,
): boolean {
  return MINIWEB_VISUAL_TIERS.indexOf(currentTier) >= MINIWEB_VISUAL_TIERS.indexOf(requiredTier);
}
