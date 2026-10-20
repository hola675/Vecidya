import assert from "node:assert/strict";
import { test } from "node:test";
import { TARGET_GROSS_MARGIN_BPS, minimumPriceCents, grossMarginBps, passesTargetGrossMargin } from "../../app/lib/commercial-pricing.ts";

test("20% de margen bruto: precio mínimo = coste / 0,80, no coste * 1,20", () => {
  assert.equal(TARGET_GROSS_MARGIN_BPS, 2_000);
  assert.equal(minimumPriceCents(1_000), 1_250); // coste externo USD 10
  assert.equal(minimumPriceCents(5_000), 6_250); // plan de IA USD 50
  assert.equal(minimumPriceCents(9_700), 12_125); // plan de IA USD 97
  assert.equal(grossMarginBps(1_250, 1_000), 2_000);
  assert.equal(grossMarginBps(1_200, 1_000) < 2_000, true);
});

test("la propuesta WhatsApp a USD 19 exige coste directo total no superior a USD 15,20", () => {
  assert(passesTargetGrossMargin(1_900, 1_520));
  assert(!passesTargetGrossMargin(1_900, 1_521));
});

test("precios protegidos contra costes negativos, fracciones y márgenes imposibles", () => {
  for (const cost of [-1, 1.2, Number.POSITIVE_INFINITY, Number.NaN]) {
    assert.throws(() => minimumPriceCents(cost), RangeError);
  }
  assert.throws(() => minimumPriceCents(100, 10_000), RangeError);
  assert.throws(() => grossMarginBps(0, 50), RangeError);
});

test("redondea en centavos sin incumplir el margen objetivo", () => {
  for (const costCents of [1, 10, 101, 199, 1_005, 5_557, 19_999]) {
    const price = minimumPriceCents(costCents);
    assert(passesTargetGrossMargin(price, costCents));
    assert(price === 0 || !passesTargetGrossMargin(price - 1, costCents));
  }
});
