import assert from "node:assert/strict";
import { test } from "node:test";
import { PROVIDER_BASELINE_USD_CENTS, PROVIDER_TARGET_MARGIN_PERCENT, formatProviderResaleUsd, providerResaleCents } from "../../app/content/provider-price-policy.ts";

test("precio mínimo sostiene margen bruto de 20 %, no recargo del 20 %", () => {
  assert.equal(PROVIDER_TARGET_MARGIN_PERCENT, 20);
  assert.equal(providerResaleCents(0), 0);
  assert.equal(providerResaleCents(1000), 1250);
  assert.equal(providerResaleCents(5000), 6250);
  assert.equal(providerResaleCents(9700), 12125);
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.whatsappBusinessMonthly), "12.50");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiGrowthSharedMonthly), "62.50");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiUnlimitedSharedMonthly), "121.25");
});
test("redondea al centavo y rechaza importes no verificables", () => {
  assert.equal(providerResaleCents(1), 2);
  for (const value of [-1, NaN, Infinity, 0.5]) assert.throws(() => providerResaleCents(value), RangeError);
});
