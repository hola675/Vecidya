import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateLicensePricing, type LicenseLine, type PortfolioTier, type PromotionInput } from "../../../db/pricing/calculator.ts";

const now = new Date("2026-09-25T12:00:00Z");
const CUADRA = 3900;
const BARRIO = 5900;
const CIUDAD = 8900;

// Escalera aprobada: 1→0%, 2→10%, 3-4→15%, 5+→20% (STATUS.md AUTH-ABUSE-001 / LICENSE-STRATEGY-001).
const tiers: PortfolioTier[] = [
  { minOrganizations: 1, maxOrganizations: 1, discountBps: 0 },
  { minOrganizations: 2, maxOrganizations: 2, discountBps: 1000 },
  { minOrganizations: 3, maxOrganizations: 4, discountBps: 1500 },
  { minOrganizations: 5, maxOrganizations: null, discountBps: 2000 },
];

const line = (organizationId: string, planCode: LicenseLine["planCode"], amountCents: number, status: LicenseLine["status"] = "active"): LicenseLine =>
  ({ organizationId, planCode, amountCents, status });

const cuadraLines = (count: number) => Array.from({ length: count }, (_, index) => line(`org-${index}`, "cuadra", CUADRA));

test("1 Cuadra = $39, sin descuento de portafolio", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 3900);
  assert.equal(result.portfolioDiscountBps, 0);
  assert.equal(result.totalCents, 3900);
});

test("2 Cuadra = $70.20 (10%)", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(2), portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 7800);
  assert.equal(result.portfolioDiscountBps, 1000);
  assert.equal(result.portfolioDiscountCents, 780);
  assert.equal(result.totalCents, 7020);
});

test("3 Cuadra = $99.45 (15%)", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(3), portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 11700);
  assert.equal(result.portfolioDiscountBps, 1500);
  assert.equal(result.totalCents, 9945);
});

test("5 Cuadra = $156.00 (20%)", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(5), portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 19500);
  assert.equal(result.portfolioDiscountBps, 2000);
  assert.equal(result.totalCents, 15600);
});

test("Cuadra + Barrio: subtotal $98, 10% → $88.20", () => {
  const lines = [line("a", "cuadra", CUADRA), line("b", "barrio", BARRIO)];
  const result = calculateLicensePricing({ lines, portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 9800);
  assert.equal(result.portfolioDiscountBps, 1000);
  assert.equal(result.totalCents, 8820);
});

test("Cuadra + Barrio + Ciudad: subtotal $187, 15% → $158.95", () => {
  const lines = [line("a", "cuadra", CUADRA), line("b", "barrio", BARRIO), line("c", "ciudad", CIUDAD)];
  const result = calculateLicensePricing({ lines, portfolioTiers: tiers, now });
  assert.equal(result.subtotalCents, 18700);
  assert.equal(result.portfolioDiscountBps, 1500);
  assert.equal(result.totalCents, 15895);
  assert.deepEqual(result.breakdown.map((entry) => entry.organizationId), ["a", "b", "c"]);
});

test("una organización invitada (sin línea) nunca llega al calculador: no hay nada que excluir aquí", () => {
  // La exclusión real ocurre en la consulta (organization_license.billing_account_id), no en el
  // cálculo puro: ver tests/unit/licensing/queries.server.test.ts. Aquí solo confirmamos que un
  // conjunto vacío de líneas da total cero, sin lanzar.
  const result = calculateLicensePricing({ lines: [], portfolioTiers: tiers, now });
  assert.equal(result.eligibleOrganizationCount, 0);
  assert.equal(result.subtotalCents, 0);
  assert.equal(result.totalCents, 0);
});

test("una licencia pendiente (borrador) no cuenta", () => {
  const lines = [line("a", "cuadra", CUADRA, "active"), line("b", "cuadra", CUADRA, "pending")];
  const result = calculateLicensePricing({ lines, portfolioTiers: tiers, now });
  assert.equal(result.eligibleOrganizationCount, 1);
  assert.equal(result.subtotalCents, 3900);
  assert.equal(result.portfolioDiscountBps, 0);
});

test("una licencia cancelada no cuenta", () => {
  const lines = [line("a", "cuadra", CUADRA, "active"), line("b", "cuadra", CUADRA, "cancelled"), line("c", "cuadra", CUADRA, "active")];
  const result = calculateLicensePricing({ lines, portfolioTiers: tiers, now });
  assert.equal(result.eligibleOrganizationCount, 2);
  assert.equal(result.subtotalCents, 7800);
  assert.equal(result.portfolioDiscountBps, 1000);
});

test("una licencia suspendida no cuenta", () => {
  const lines = [line("a", "cuadra", CUADRA, "active"), line("b", "cuadra", CUADRA, "suspended")];
  const result = calculateLicensePricing({ lines, portfolioTiers: tiers, now });
  assert.equal(result.eligibleOrganizationCount, 1);
});

test("sin tier que cubra la cantidad, el descuento de portafolio es cero", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: [], now });
  assert.equal(result.portfolioDiscountBps, 0);
  assert.equal(result.totalCents, 3900);
});

test("promoción porcentual vigente se aplica sobre el subtotal ya descontado por portafolio", () => {
  const promo: PromotionInput = {
    id: "promo-1", type: "percentage", value: 500, startsAt: new Date("2026-09-01"), endsAt: new Date("2026-10-01"),
    minOrganizations: null, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [promo], now });
  // $39 sin descuento de portafolio (1 org), 5% de promoción → $37.05
  assert.equal(result.promotionDiscountCents, 195);
  assert.equal(result.totalCents, 3705);
  assert.deepEqual(result.appliedPromotionIds, ["promo-1"]);
});

test("promoción de monto fijo nunca deja el total en negativo", () => {
  const promo: PromotionInput = {
    id: "promo-fixed", type: "fixed_amount", value: 10000, startsAt: new Date("2026-09-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.totalCents, 0);
  assert.equal(result.promotionDiscountCents, 3900);
});

test("bundle fijo: 3 Cuadra por $78 en vez de $99.45", () => {
  const promo: PromotionInput = {
    id: "bundle-3-cuadra", type: "fixed_bundle", value: 7800, startsAt: new Date("2026-09-01"), endsAt: null,
    minOrganizations: 3, maxOrganizations: 3, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(3), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.totalCents, 7800);
});

test("promoción expirada no se aplica", () => {
  const promo: PromotionInput = {
    id: "promo-expired", type: "percentage", value: 5000, startsAt: new Date("2026-01-01"), endsAt: new Date("2026-06-01"),
    minOrganizations: null, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.promotionDiscountCents, 0);
  assert.equal(result.totalCents, 3900);
  assert.deepEqual(result.appliedPromotionIds, []);
});

test("promoción que todavía no empieza no se aplica", () => {
  const promo: PromotionInput = {
    id: "promo-future", type: "percentage", value: 5000, startsAt: new Date("2026-12-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.promotionDiscountCents, 0);
});

test("promoción con mínimo de organizaciones no cumplido no se aplica", () => {
  const promo: PromotionInput = {
    id: "promo-min3", type: "percentage", value: 1000, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: 3, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(2), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.promotionDiscountCents, 0);
});

test("promoción no stackable nunca se combina con otra: solo aplica una", () => {
  const exclusive: PromotionInput = {
    id: "exclusive", type: "percentage", value: 1000, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: false,
  };
  const stackableOne: PromotionInput = {
    id: "stackable-a", type: "fixed_amount", value: 500, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: true,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [exclusive, stackableOne], now });
  // Solo la no-stackable aplica (10% de $39 = $3.90); nunca se suman ambas.
  assert.equal(result.promotionDiscountCents, 390);
  assert.deepEqual(result.appliedPromotionIds, ["exclusive"]);
});

test("dos promociones stackable sí se combinan", () => {
  const a: PromotionInput = {
    id: "stack-a", type: "fixed_amount", value: 300, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: true,
  };
  const b: PromotionInput = {
    id: "stack-b", type: "fixed_amount", value: 200, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: null, maxOrganizations: null, stackable: true,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(1), portfolioTiers: tiers, promotions: [a, b], now });
  assert.equal(result.promotionDiscountCents, 500);
  assert.deepEqual([...result.appliedPromotionIds].sort(), ["stack-a", "stack-b"]);
});

test("free_license está representado en el tipo pero el cálculo no está implementado: se ignora, no lanza", () => {
  const promo: PromotionInput = {
    id: "free-third", type: "free_license", value: 0, startsAt: new Date("2026-01-01"), endsAt: null,
    minOrganizations: 3, maxOrganizations: null, stackable: false,
  };
  const result = calculateLicensePricing({ lines: cuadraLines(3), portfolioTiers: tiers, promotions: [promo], now });
  assert.equal(result.promotionDiscountCents, 0);
  assert.deepEqual(result.appliedPromotionIds, []);
});

test("el resultado nunca usa números de punto flotante: todo en centavos enteros", () => {
  const result = calculateLicensePricing({ lines: cuadraLines(3), portfolioTiers: tiers, now });
  for (const value of [result.subtotalCents, result.portfolioDiscountCents, result.promotionDiscountCents, result.totalCents]) {
    assert.equal(Number.isInteger(value), true, `${value} no es entero`);
  }
});
