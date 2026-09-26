// LICENSE-STRATEGY-001. Calculadora pura y determinística: no consulta la base de datos, no cobra
// nada. Recibe líneas de licencia ya resueltas (con su precio contratado y estado), la escalera de
// portafolio vigente y las promociones candidatas, y devuelve el desglose. Toda cantidad se maneja
// en centavos enteros; el único redondeo ocurre al aplicar basis points, con `Math.round`.

export type PlanCode = "cuadra" | "barrio" | "ciudad";
export type LicenseLineStatus = "pending" | "active" | "suspended" | "cancelled";

export type LicenseLine = {
  organizationId: string;
  planCode: PlanCode;
  /** Precio contratado en centavos (ya grandfathered: viene de `license_price` por `price_id`, no recalculado por `plan_code`). */
  amountCents: number;
  status: LicenseLineStatus;
};

export type PortfolioTier = {
  minOrganizations: number;
  /** `null` = sin tope superior ("5+"). */
  maxOrganizations: number | null;
  discountBps: number;
};

export type PromotionType = "percentage" | "fixed_amount" | "fixed_bundle" | "free_license";

export type PromotionInput = {
  id: string;
  type: PromotionType;
  /** Basis points para `percentage`; centavos para `fixed_amount`; total plano objetivo en centavos para `fixed_bundle`. Ignorado para `free_license` (ver nota abajo). */
  value: number;
  startsAt: Date;
  endsAt: Date | null;
  minOrganizations: number | null;
  maxOrganizations: number | null;
  stackable: boolean;
};

export type PricingBreakdownLine = { organizationId: string; planCode: PlanCode; amountCents: number };

export type PricingResult = {
  eligibleOrganizationCount: number;
  subtotalCents: number;
  portfolioDiscountBps: number;
  portfolioDiscountCents: number;
  promotionDiscountCents: number;
  /** IDs de las promociones realmente aplicadas (puede ser varias solo si todas son `stackable`). */
  appliedPromotionIds: string[];
  totalCents: number;
  breakdown: PricingBreakdownLine[];
};

function applyBps(amountCents: number, bps: number) {
  return Math.round((amountCents * bps) / 10000);
}

function isPromotionEligible(promotion: PromotionInput, organizationCount: number, now: Date) {
  if (promotion.type === "free_license") return false; // representable desde V1; cálculo no implementado todavía.
  if (promotion.startsAt > now) return false;
  if (promotion.endsAt !== null && promotion.endsAt <= now) return false;
  if (promotion.minOrganizations !== null && organizationCount < promotion.minOrganizations) return false;
  if (promotion.maxOrganizations !== null && organizationCount > promotion.maxOrganizations) return false;
  return true;
}

function promotionDiscount(promotion: PromotionInput, baseCents: number) {
  if (promotion.type === "percentage") return Math.min(baseCents, applyBps(baseCents, promotion.value));
  if (promotion.type === "fixed_amount") return Math.min(baseCents, promotion.value);
  if (promotion.type === "fixed_bundle") return Math.max(0, baseCents - promotion.value);
  return 0;
}

// Nunca se asume stacking (LICENSE-STRATEGY-001 §9): si hay al menos una promoción elegible no
// apilable, solo se aplica la de mayor descuento y se ignoran las demás, incluidas las apilables.
// Solo si TODAS las elegibles son apilables, sus descuentos se suman.
function resolveAppliedPromotions(eligible: PromotionInput[], baseCents: number) {
  if (eligible.length === 0) return { discountCents: 0, ids: [] as string[] };

  const nonStackable = eligible.filter((promotion) => !promotion.stackable);
  if (nonStackable.length > 0) {
    const best = nonStackable.reduce((max, current) =>
      promotionDiscount(current, baseCents) > promotionDiscount(max, baseCents) ? current : max);
    return { discountCents: promotionDiscount(best, baseCents), ids: [best.id] };
  }

  const discountCents = Math.min(baseCents, eligible.reduce((sum, promotion) => sum + promotionDiscount(promotion, baseCents), 0));
  return { discountCents, ids: eligible.map((promotion) => promotion.id) };
}

export function calculateLicensePricing(input: {
  lines: LicenseLine[];
  portfolioTiers: PortfolioTier[];
  promotions?: PromotionInput[];
  now?: Date;
}): PricingResult {
  const now = input.now ?? new Date();
  const eligibleLines = input.lines.filter((line) => line.status === "active");
  const eligibleOrganizationCount = eligibleLines.length;
  const subtotalCents = eligibleLines.reduce((sum, line) => sum + line.amountCents, 0);

  const tier = input.portfolioTiers.find((candidate) =>
    eligibleOrganizationCount >= candidate.minOrganizations
    && (candidate.maxOrganizations === null || eligibleOrganizationCount <= candidate.maxOrganizations));
  const portfolioDiscountBps = tier?.discountBps ?? 0;
  const portfolioDiscountCents = applyBps(subtotalCents, portfolioDiscountBps);
  const afterPortfolioCents = subtotalCents - portfolioDiscountCents;

  const eligiblePromotions = (input.promotions ?? []).filter((promotion) => isPromotionEligible(promotion, eligibleOrganizationCount, now));
  const { discountCents: promotionDiscountCents, ids: appliedPromotionIds } = resolveAppliedPromotions(eligiblePromotions, afterPortfolioCents);

  return {
    eligibleOrganizationCount,
    subtotalCents,
    portfolioDiscountBps,
    portfolioDiscountCents,
    promotionDiscountCents,
    appliedPromotionIds,
    totalCents: afterPortfolioCents - promotionDiscountCents,
    breakdown: eligibleLines.map((line) => ({ organizationId: line.organizationId, planCode: line.planCode, amountCents: line.amountCents })),
  };
}
