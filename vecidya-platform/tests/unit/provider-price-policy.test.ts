import assert from "node:assert/strict";
import { test } from "node:test";

import { formatProviderResaleUsd, PROVIDER_BASELINE_USD_CENTS, PROVIDER_MARKUP_PERCENT, providerResaleCents } from "../../app/content/provider-price-policy.ts";

test("repercute el 20 % del coste real agregado, no el 20 % del precio final", () => {
  assert.equal(PROVIDER_MARKUP_PERCENT, 20);
  assert.equal(providerResaleCents(0), 0);
  assert.equal(providerResaleCents(1000), 1200);
  assert.equal(providerResaleCents(5000), 6000);
  assert.equal(providerResaleCents(9700), 11640);
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.whatsappBusinessMonthly), "12.00");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiGrowthSharedMonthly), "60.00");
  assert.equal(formatProviderResaleUsd(PROVIDER_BASELINE_USD_CENTS.aiUnlimitedSharedMonthly), "116.40");
  assert.equal(providerResaleCents(1), 2, "no se trunca un recargo por debajo de un centavo");
  assert.equal(providerResaleCents(3), 4, "se redondea sobre el cargo agregado");
});

test("rechaza costes negativos, no enteros o desbordados", () => {
  for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => providerResaleCents(invalid), RangeError);
  }
});
