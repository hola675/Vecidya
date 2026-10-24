import assert from "node:assert/strict";
import test from "node:test";
import { shouldClarifyBuyerRecipient, QUESTION_BANK_ID, ANSWER_SCHEMA_ID, CONTEXT_ID, PIPELINE_ID, APPLICABILITY_ID, SCORING_ID, PLANNER_ID, SESSION_KEY, SESSION_SCHEMA } from "../../../app/features/diagnostic/qa03b/contract";
import { CANDIDATE_RESULT_IDENTITY_V3, isCandidateResultIdentityV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { CANDIDATE_RESULT_IDENTITY_V3 as ACT_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-pipeline";
import { CANDIDATE_SESSION_STORAGE_KEY_V3 as ACT_SESSION_KEY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-session";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { CANDIDATE_SESSION_SCHEMA_V3, CANDIDATE_SESSION_STORAGE_KEY_V3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";

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
  assert.equal(QUESTION_BANK_ID, CANDIDATE_RESULT_IDENTITY_V3.questionBank);
  assert.equal(ANSWER_SCHEMA_ID, CANDIDATE_RESULT_IDENTITY_V3.answerSchema);
  assert.equal(CONTEXT_ID, CANDIDATE_RESULT_IDENTITY_V3.context);
  assert.equal(PIPELINE_ID, CANDIDATE_RESULT_IDENTITY_V3.engine);
  assert.equal(APPLICABILITY_ID, CANDIDATE_RESULT_IDENTITY_V3.applicability);
  assert.equal(SCORING_ID, CANDIDATE_RESULT_IDENTITY_V3.scoring);
  assert.equal(PLANNER_ID, CANDIDATE_PLANNER_IDENTITY_V3);
  assert.equal(PLANNER_ID, CANDIDATE_RESULT_IDENTITY_V3.planner);
  assert.equal(SESSION_KEY, CANDIDATE_SESSION_STORAGE_KEY_V3);
  assert.equal(SESSION_SCHEMA, CANDIDATE_SESSION_SCHEMA_V3);
  assert.equal(SESSION_SCHEMA, 7);
  assert.notEqual(QUESTION_BANK_ID, ACT_IDENTITY_V3.questionBank);
  assert.notEqual(ANSWER_SCHEMA_ID, ACT_IDENTITY_V3.answerSchema);
  assert.notEqual(SESSION_KEY, ACT_SESSION_KEY_V3);
  assert.ok(isCandidateResultIdentityV3(CANDIDATE_RESULT_IDENTITY_V3));
  assert.ok(!isCandidateResultIdentityV3({ ...CANDIDATE_RESULT_IDENTITY_V3, engine: ACT_IDENTITY_V3.engine }));
  assert.ok(!isCandidateResultIdentityV3({ ...CANDIDATE_RESULT_IDENTITY_V3, unexpected: true }));
});
