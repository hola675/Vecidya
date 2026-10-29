/**
 * Política pura de acceso visual MiniWeb V2.
 * Sin consultas a GHL, cobros, DB ni efectos secundarios.
 * El servidor debe obtener las licencias verificadas del propietario de facturación.
 */
export const VISUAL_TIERS = ["cuadra", "barrio", "ciudad"] as const;
export type VisualTier = (typeof VISUAL_TIERS)[number];
export type VisualVariant = "base" | "pro" | "premium";
export type VerifiedVisualLicense = Readonly<{
  billingOwnerId: string;
  tier: VisualTier;
  active: boolean;
}>;

const minimumTier: Readonly<Record<VisualVariant, VisualTier>> = {
  base: "cuadra",
  pro: "barrio",
  premium: "ciudad",
};

export type VisualAccessDecision = Readonly<{
  allowed: boolean;
  effectiveTier: VisualTier | null;
  reason: "allowed" | "no_active_license" | "insufficient_tier";
}>;

/**
 * Solo acepta licencias ya verificadas; filtra por el propietario exacto.
 * No convierte esta función en una fuente de verdad para facturación.
 */
export function evaluateMiniWebVisualAccess(
  billingOwnerId: string,
  requestedVariant: VisualVariant,
  licenses: readonly VerifiedVisualLicense[],
): VisualAccessDecision {
  if (typeof billingOwnerId !== "string" || !billingOwnerId.trim()\n    || !Object.prototype.hasOwnProperty.call(minimumTier, requestedVariant)) {
    return { allowed: false, effectiveTier: null, reason: "no_active_license" };
  }
  const tiers = licenses
    .filter((license) => license !== null && typeof license === "object"\n      && license.active === true && license.billingOwnerId === billingOwnerId
      && VISUAL_TIERS.includes(license.tier))
    .map((license) => license.tier);
  if (tiers.length === 0) return { allowed: false, effectiveTier: null, reason: "no_active_license" };
  const effectiveTier = tiers.reduce<VisualTier>((highest, tier) =>
    VISUAL_TIERS.indexOf(tier) > VISUAL_TIERS.indexOf(highest) ? tier : highest, "cuadra");
  const allowed = VISUAL_TIERS.indexOf(effectiveTier) >= VISUAL_TIERS.indexOf(minimumTier[requestedVariant]);
  return { allowed, effectiveTier, reason: allowed ? "allowed" : "insufficient_tier" };
}
