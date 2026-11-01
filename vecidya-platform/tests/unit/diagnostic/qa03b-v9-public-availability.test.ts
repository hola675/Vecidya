import assert from "node:assert/strict";
import test from "node:test";
import { isV9PublicRuntimeAvailable } from "../../../app/features/diagnostic/qa03b/v9-public-availability.server";
import { V9_CURRENT_SCORING_VERSION } from "../../../app/features/diagnostic/v9/scoring-calibration-registry";

const certified = {
  DIAGNOSTIC_V9_PUBLIC_ENABLED: "true",
  DIAGNOSTIC_V9_BANK_VERSION: "bank-1",
  DIAGNOSTIC_V9_ENGINE_VERSION: "engine-1",
  DIAGNOSTIC_V9_SCORING_VERSION: V9_CURRENT_SCORING_VERSION,
  DIAGNOSTIC_V9_RECOMMENDATION_VERSION: "recommendations-1",
  DIAGNOSTIC_V9_CONSENT_VERSION: "consent-1",
};

test("V9 public runtime requires explicit enablement and all certified version labels", () => {
  assert.equal(isV9PublicRuntimeAvailable(certified), true);
  assert.equal(isV9PublicRuntimeAvailable({ ...certified, DIAGNOSTIC_V9_PUBLIC_ENABLED: "false" }), false);
  for (const key of [
    "DIAGNOSTIC_V9_BANK_VERSION",
    "DIAGNOSTIC_V9_ENGINE_VERSION",
    "DIAGNOSTIC_V9_SCORING_VERSION",
    "DIAGNOSTIC_V9_RECOMMENDATION_VERSION",
    "DIAGNOSTIC_V9_CONSENT_VERSION",
  ] as const) {
    assert.equal(isV9PublicRuntimeAvailable({ ...certified, [key]: "" }), false, key);
    assert.equal(isV9PublicRuntimeAvailable({ ...certified, [key]: "   " }), false, key + " whitespace");
    assert.equal(isV9PublicRuntimeAvailable({ ...certified, [key]: undefined }), false, key + " undefined");
  }
});


test("V9 public runtime rejects an unregistered or historical scoring version for new runs", () => {
  assert.equal(isV9PublicRuntimeAvailable({ ...certified, DIAGNOSTIC_V9_SCORING_VERSION: "unknown-scoring" }), false);
  assert.equal(isV9PublicRuntimeAvailable({ ...certified, DIAGNOSTIC_V9_SCORING_VERSION: "diag-v3-candidate-calibration-v2" }), false);
});
