import assert from "node:assert/strict";
import test from "node:test";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const resultFor = (answers: AnswersV2) => scoreCandidateContextualDimensionsV3({ answers });
const dimension = (answers: AnswersV2, id: (typeof DIGITAL_DIMENSION_IDS)[number]) => resultFor(answers).dimensions.find((item) => item.id === id)!;

test("candidate-only prelaunch scoring follows R4 while legacy scoring retains its applicability", () => {
  const answers: AnswersV2 = { q2_entity: "project", q2_has_customers: "no" };
  const legacy = scoreContextualDimensions({
    answers: {},
    context: { growthStage: { status: "resolved", value: "idea", source: "signal" } },
    evidence: [],
  });
  const candidate = resultFor(answers);
  assert.equal(legacy.dimensions.find((item) => item.id === "digital_foundation")?.applicability, "applicable");
  assert.equal(candidate.context.activity.value, "prelaunch");
  assert.equal(candidate.dimensions.find((item) => item.id === "digital_foundation")?.applicability, "not_applicable");
  assert.equal(candidate.dimensions.find((item) => item.id === "digital_foundation")?.applicabilityReason, "prelaunch_no_operation");
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("the candidate resolver filters an ineligible raw answer before evidence and applicability", () => {
  const answers: AnswersV2 = {
    q2_entity: "project",
    q2_has_customers: "no",
    q2_reputation_flow: "strong",
  };
  const resolved = resolveEligibleQuestionsV2(answers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  const result = resultFor(answers);
  assert.equal(answers.q2_reputation_flow, "strong", "raw stale response was supplied");
  assert.equal("q2_reputation_flow" in resolved.activeAnswers, false);
  assert.equal("q2_reputation_flow" in result.activeAnswers, false);
  assert.equal(result.dimensions.flatMap((item) => item.evidence).some((item) => item.questionId === "q2_reputation_flow"), false);
  const trust = result.dimensions.find((item) => item.id === "trust_reputation")!;
  assert.equal(trust.applicability, "not_applicable");
  assert.equal(trust.applicabilityReason, "prelaunch_no_operation");
});

test("candidate prelaunch project produces the certified eight-dimension R4 matrix", () => {
  const result = resultFor({ q2_entity: "project", q2_has_customers: "no" });
  assert.deepEqual(result.dimensions.map(({ id, applicability }) => [id, applicability]), [
    ["clarity_positioning", "applicable"],
    ["digital_foundation", "not_applicable"],
    ["discovery", "insufficient_context"],
    ["trust_reputation", "not_applicable"],
    ["conversion_access", "insufficient_context"],
    ["relationship_recurrence", "not_applicable"],
    ["measurement_optimization", "not_applicable"],
    ["digital_readiness", "applicable"],
  ]);
  assert.ok(result.dimensions.every((item) => item.score === null));
});

test("active professional context receives all eight structural decisions end to end", () => {
  const result = resultFor({ q2_entity: "individual", q2_sector: "professional_services", q2_has_customers: "yes", q2_delivery: ["appointments"] });
  assert.equal(result.context.activity.value, "active");
  assert.equal(result.context.nicheGroup.value, "professional_services");
  assert.deepEqual(result.dimensions.map((item) => item.applicability), Array(8).fill("applicable"));
  assert.ok(result.dimensions.every((item) => item.applicabilityReason !== undefined));
});

test("candidate hybrid context preserves every resolved component for R4", () => {
  const result = resultFor({
    q2_entity: "business",
    q2_has_customers: "yes",
    q2_monetization: "goods",
    q2_delivery: ["physical_location", "appointments", "online_checkout"],
  });
  assert.equal(result.context.archetype.value, "hybrid");
  assert.deepEqual(result.context.archetypeComponents, ["appointments", "ecommerce", "local"]);
  const relationship = result.dimensions.find((item) => item.id === "relationship_recurrence")!;
  assert.equal(relationship.applicability, "applicable");
  assert.ok(relationship.applicabilityContext.includes("archetypeComponent=local"));
  assert.ok(relationship.applicabilityContext.includes("archetypeComponent=appointments"));
  assert.ok(relationship.applicabilityContext.includes("archetypeComponent=ecommerce"));
});

test("goal and friction changes do not become R4 applicability shortcuts", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_delivery: ["appointments"] };
  const operations = resultFor({ ...base, q2_goal: "other", q2_friction: "operations" });
  const trust = resultFor({ ...base, q2_goal: "other", q2_friction: "trust" });
  assert.deepEqual(operations.dimensions.map((item) => [item.id, item.applicability]), trust.dimensions.map((item) => [item.id, item.applicability]));
});

test("later-review questions remain evidence-free even when their real gates are active", () => {
  const appointments = resultFor({ q2_entity: "individual", q2_has_customers: "yes", q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "most" });
  assert.equal(appointments.activeAnswers.q2_appointments_lead_to_booking, "most");
  assert.equal(appointments.dimensions.flatMap((item) => item.evidence).some((item) => item.questionId === "q2_appointments_lead_to_booking"), false);

  const creator = resultFor({ q2_entity: "individual", q2_has_customers: "yes", q2_sector: "creative_media", q2_monetization: "audience", q2_goal: "other", q2_friction: "follow_up", q2_creator_audience_ownership: "direct_consistent" });
  assert.equal(creator.activeAnswers.q2_creator_audience_ownership, "direct_consistent");
  assert.equal(creator.dimensions.flatMap((item) => item.evidence).some((item) => item.questionId === "q2_creator_audience_ownership"), false);
});

test("active Measurement is applicable with no synthesized score or evidence", () => {
  const result = resultFor({ q2_entity: "individual", q2_has_customers: "yes", q2_delivery: ["appointments"] });
  const measurement = result.dimensions.find((item) => item.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.applicabilityReason, "active_operation");
  assert.equal(measurement.score, null);
  assert.equal(measurement.explainability.basis, "none");
  assert.ok(measurement.explainability.gaps.includes("no_evidence"));
  assert.deepEqual(measurement.evidence, []);
});

test("N/A and unknown remain neutral observations under structural applicability", () => {
  const notApplicable = dimension({ q2_entity: "individual", q2_has_customers: "yes", q2_delivery: ["appointments"], q2_goal: "explain", q2_presence_digital_base: "reliable_presence", q2_presence_offer_clarity: "not_applicable" }, "clarity_positioning");
  assert.equal(notApplicable.applicability, "applicable");
  assert.equal(notApplicable.score, null);
  assert.equal(notApplicable.evidence[0]?.state, "not_applicable");
  assert.equal(notApplicable.evidence[0]?.contribution, null);

  const unknown = dimension({ q2_entity: "individual", q2_has_customers: "yes", q2_delivery: ["appointments"], q2_goal: "explain", q2_presence_digital_base: "reliable_presence", q2_presence_offer_clarity: "unknown" }, "clarity_positioning");
  assert.equal(unknown.applicability, "applicable");
  assert.equal(unknown.evidence[0]?.state, "uncertainty");
  assert.equal(unknown.evidence[0]?.contribution, null);
  assert.equal(unknown.confidence.uncertain, 1);
  assert.equal(unknown.score, null);
});

test("candidate reuses frozen score, confidence, and direct-plus-supporting math", () => {
  const answers: AnswersV2 = {
    q2_entity: "individual",
    q2_other_staff: "yes",
    q2_has_customers: "yes",
    q2_goal: "other",
    q2_friction: "operations",
    q2_process_systemization: "defined",
    q2_operations_handoffs: "complete",
  };
  const candidate = resultFor(answers);
  const sourceEvidence = deriveContextualEvidence(candidate.activeAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  for (const item of candidate.dimensions.flatMap((dimension) => dimension.evidence)) {
    const definition = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((question) => question.id === item.questionId)!;
    assert.equal(definition.evidenceMigration, "migrated", item.questionId);
    assert.equal(item.questionVersion, definition.version, item.questionId);
    assert.equal(item.migrationIdentity, `${item.questionId}@v${definition.version}`, item.questionId);
  }
  const legacyCore = scoreContextualDimensions({ answers, context: candidate.context, evidence: sourceEvidence, bank: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 });
  for (const id of ["digital_readiness"] as const) {
    const current = candidate.dimensions.find((item) => item.id === id)!;
    const reference = legacyCore.dimensions.find((item) => item.id === id)!;
    assert.equal(current.score, reference.score, `${id} score`);
    assert.deepEqual(current.confidence, reference.confidence, `${id} confidence`);
    assert.deepEqual(current.explainability, reference.explainability, `${id} R3 explainability`);
  }
  const readiness = candidate.dimensions.find((item) => item.id === "digital_readiness")!;
  assert.equal(readiness.explainability.direct.length, 1);
  assert.equal(readiness.explainability.supporting.length, 1);
  assert.equal(readiness.explainability.basis, "direct_and_supporting");
  const expected = Math.round(100 * (CAPABILITY_CONTRIBUTION.established! + CAPABILITY_CONTRIBUTION.established! * 0.5) / 1.5);
  assert.equal(readiness.score, expected);

  const supportingOnly = resultFor({
    q2_entity: "individual", q2_other_staff: "yes", q2_has_customers: "yes",
    q2_goal: "other", q2_friction: "operations", q2_operations_handoffs: "complete",
  }).dimensions.find((item) => item.id === "digital_readiness")!;
  assert.equal(supportingOnly.applicability, "applicable");
  assert.equal(supportingOnly.score, null);
  assert.equal(supportingOnly.explainability.basis, "supporting_only");

  const multipleDirectAnswers: AnswersV2 = {
    q2_entity: "individual", q2_sector: "professional_services", q2_has_customers: "yes",
    q2_delivery: ["appointments"], q2_goal: "explain", q2_presence_digital_base: "reliable_presence",
    q2_presence_offer_clarity: "clear", q2_professional_intake_flow: "partial",
  };
  const clarity = dimension(multipleDirectAnswers, "clarity_positioning");
  assert.equal(clarity.explainability.direct.length, 2);
  assert.equal(clarity.score, Math.round(100 * (CAPABILITY_CONTRIBUTION.established! + CAPABILITY_CONTRIBUTION.partial!) / 2));
});

test("R4 applicability context does not change evidence confidence strength", () => {
  const result = dimension({ q2_entity: "individual", q2_has_customers: "yes", q2_delivery: ["appointments"], q2_goal: "explain", q2_presence_digital_base: "reliable_presence", q2_presence_offer_clarity: "clear" }, "clarity_positioning");
  assert.equal(result.confidence.direct, 1);
  assert.equal(result.confidence.strength, 1);
  assert.equal(result.confidence.independent, 1);
  assert.equal(result.confidence.uncertain, 0);
});
