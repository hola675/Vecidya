import assert from "node:assert/strict";
import test from "node:test";
import { shouldClarifyBuyerRecipient, QUESTION_BANK_ID, ANSWER_SCHEMA_ID, SESSION_KEY, SESSION_SCHEMA } from "../../../app/features/diagnostic/qa03b/contract";
import { CANDIDATE_RESULT_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-pipeline";
import { CANDIDATE_SESSION_STORAGE_KEY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-session";

for (const buyer of ["b2c", "b2b", "mixed", "no_direct_purchase", "unknown", undefined]) {
  test(`QA-03B.0: D2 ${buyer ?? "sin respuesta"} exige compra antes de contexto`, () => {
    for (const nonprofit of [false, true]) for (const sector of [undefined, "retail", "education_coaching", "health_wellness"]) {
      const confirmed = ["b2c", "b2b", "mixed"].includes(buyer ?? "");
      const differs = buyer === "b2b" || buyer === "mixed" || nonprofit || ["education_coaching", "health_wellness"].includes(sector ?? "");
      assert.equal(shouldClarifyBuyerRecipient({ buyer, nonprofit, sector }), confirmed && differs);
    }
  });
}
test("QA-03B.0: una institución financiadora no confirma comprador B2B", () => {
  const donor = { buyer: "no_direct_purchase", nonprofit: true, sector: "education", institutionalFunder: true };
  assert.equal(shouldClarifyBuyerRecipient(donor), false);
  assert.equal(shouldClarifyBuyerRecipient({ ...donor, buyer: "unknown" }), false);
  assert.equal(shouldClarifyBuyerRecipient({ ...donor, buyer: "b2b" }), true);
});
test("QA-03B.0: banco, respuestas y sesión tienen identidad distinta", () => {
  assert.notEqual(QUESTION_BANK_ID, CANDIDATE_RESULT_IDENTITY_V3.questionBank);
  assert.notEqual(ANSWER_SCHEMA_ID, CANDIDATE_RESULT_IDENTITY_V3.answerSchema);
  assert.notEqual(SESSION_KEY, CANDIDATE_SESSION_STORAGE_KEY_V3);
  assert.equal(SESSION_SCHEMA, 3);
});
