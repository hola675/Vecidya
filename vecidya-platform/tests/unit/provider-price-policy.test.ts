import assert from "node:assert/strict";
import { test } from "node:test";

import { PROVIDER_BASELINE_USD_CENTS, PROVIDER_MARKUP_PERCENT, formatProviderResaleUsd, providerResaleCents } from "../../app/content/provider-price-policy.ts";

test("el recargo aprobado es 20 por ciento sobre el coste, no margen bruto sobre venta", () => {
  assert.equal(PROVIDER_MARKUP_PERCENT, 20);
  assert.equal(providerResaleCents(0), 0);
  assert.equal(providerResaleCents(1_000), 1_200);
  assert.equal(providerResaleCents(5_000), 6_000);
  assert.equal(providerResaleCents(9_700), 11_640);
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.whatsappBusinessMonthly), "12.00");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiGrowthSharedMonthly), "60.00");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiUnlimitedSharedMonthly), "116.40");
  assert.equal(providerResaleCents(1), 2);
  assert.equal(providerResaleCents(3), 4);
});

test("el precio de reventa valida los cargos agregados en centavos", () => {
  for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => providerResaleCents(invalid), RangeError);
  }
});
