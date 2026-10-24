import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as bank } from "../../../app/features/diagnostic/qa03b/bank";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const operatingAnswers: AnswersV2 = {
  q2_entity: "business", q2_has_customers: "yes", q2_operational_status: "operating",
  q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"],
  q2_customer_buyer: "b2c", q2_goal: "measure",
};

test("QA-03B measurement probes are versioned, direct, and distinguish unknown from missing", () => {
  const sources = bank.filter((question) => question.evidenceMigration === "migrated"
    && question.evidenceV3?.dimensions.some((item) => item.dimension === "measurement_optimization" && item.directness === "direct"));
  assert.deepEqual(sources.map((question) => question.id).sort(), [
    "q2_measurement_rate_estimate", "q2_measurement_result_recording", "q2_measurement_review_cycle",
  ]);
  const estimate = sources.find((question) => question.id === "q2_measurement_rate_estimate")!;
  assert.equal(estimate.version, 1);
  assert.equal(estimate.evidenceV3?.dimensions[0].answers.unknown, "uncertainty");
  assert.equal(estimate.evidenceV3?.dimensions[0].answers.no_method, "missing");
});

test("an unknown rate offers a simpler tracking question without treating tracking as a rate", () => {
  const initial = buildCandidateQuestionPlanV3({ answers: operatingAnswers });
  assert.ok(initial.eligibleQuestionIds.includes("q2_measurement_rate_estimate"));
  assert.ok(initial.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_measurement_rate_estimate"));
  assert.ok(!initial.eligibleQuestionIds.includes("q2_measurement_result_recording"));

  const recovered = buildCandidateQuestionPlanV3({ answers: { ...operatingAnswers, q2_measurement_rate_estimate: "unknown" } });
  assert.ok(recovered.eligibleQuestionIds.includes("q2_measurement_result_recording"));
  assert.ok(recovered.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_measurement_result_recording"));
  assert.equal(scoreCandidateContextualDimensionsV3({ answers: { ...operatingAnswers, q2_measurement_rate_estimate: "unknown" } })
    .dimensions.find((dimension) => dimension.id === "measurement_optimization")?.evidence.some((item) => item.questionId === "q2_measurement_rate_estimate" && item.state === "uncertainty"), true);
});

test("presence evidence is available to physical businesses and offer clarity follows an existing listing", () => {
  const physical: AnswersV2 = { ...operatingAnswers, q2_goal: "opportunities", q2_delivery: ["physical_location"] };
  const base = buildCandidateQuestionPlanV3({ answers: physical });
  assert.ok(base.eligibleQuestionIds.includes("q2_presence_digital_base"));
  assert.ok(!base.eligibleQuestionIds.includes("q2_presence_offer_clarity"));
  const withPresence = buildCandidateQuestionPlanV3({ answers: { ...physical, q2_presence_digital_base: "reliable_presence" } });
  assert.ok(withPresence.eligibleQuestionIds.includes("q2_presence_offer_clarity"));
});

test("booking-friction follow-up is eligible only after appointments and demonstrated booking leakage", () => {
  const withoutLeakage: AnswersV2 = { ...operatingAnswers, q2_goal: "opportunities" };
  assert.ok(!buildCandidateQuestionPlanV3({ answers: withoutLeakage }).eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  const withLeakage: AnswersV2 = { ...withoutLeakage, q2_appointments_lead_to_booking: "few" };
  assert.ok(buildCandidateQuestionPlanV3({ answers: withLeakage }).eligibleQuestionIds.includes("q2_appointments_booking_friction"));
});
