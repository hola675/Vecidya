import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENT_DIAGNOSTIC_VERSION,
  CURRENT_QUESTION_BANK_VERSION,
  CURRENT_RESULT_SCHEMA_VERSION,
  CURRENT_ROUTING_VERSION,
  CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import {
  evaluateDimensionApplicabilityV3,
  type DimensionApplicabilityReasonV3,
  type DimensionApplicabilityV3,
} from "../../../app/features/diagnostic/qbv2-applicability";
import {
  deriveContextualEvidence,
  SCORING_MODEL,
  scoreContextualDimensions,
  type ContextualEvidence,
} from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import {
  scoreCandidateContextualDimensionsV3,
  validateActiveCandidateEvidenceV3,
} from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { CANDIDATE_CALIBRATION_BASELINE_V1 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const REASONS = [
  "universal_dimension",
  "active_operation",
  "prelaunch_no_operation",
  "audience_or_demand_context",
  "concrete_action_context",
  "ongoing_interaction_context",
  "observed_dimension_evidence",
  "context_unresolved",
] as const satisfies readonly DimensionApplicabilityReasonV3[];
const STATES = ["applicable", "not_applicable", "insufficient_context"] as const satisfies readonly DimensionApplicabilityV3[];
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const reasonSetIsClosed: Equal<DimensionApplicabilityReasonV3, (typeof REASONS)[number]> = true;
const stateSetIsClosed: Equal<DimensionApplicabilityV3, (typeof STATES)[number]> = true;

const activeAnswers: AnswersV2 = {
  q2_entity: "individual",
  q2_has_customers: "yes",
  q2_delivery: ["appointments"],
  q2_goal: "explain",
  q2_presence_digital_base: "reliable_presence",
  q2_presence_offer_clarity: "clear",
};

function sampleEvidence(): { answers: AnswersV2; evidence: ContextualEvidence[] } {
  const resolution = resolveEligibleQuestionsV2(activeAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  const evidence = deriveContextualEvidence(resolution.activeAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3)
    .filter((item) => item.questionId === "q2_presence_offer_clarity");
  assert.equal(evidence.length, 1, "fixture must produce one active migrated observation");
  return { answers: resolution.activeAnswers, evidence: [...evidence] };
}

test("R4-FINAL freezes the three applicability states and closed reason-code union", () => {
  assert.deepEqual(STATES, ["applicable", "not_applicable", "insufficient_context"]);
  assert.deepEqual(REASONS, [
    "universal_dimension", "active_operation", "prelaunch_no_operation", "audience_or_demand_context",
    "concrete_action_context", "ongoing_interaction_context", "observed_dimension_evidence", "context_unresolved",
  ]);
  assert.equal(reasonSetIsClosed, true);
  assert.equal(stateSetIsClosed, true);
  assert.equal(DIGITAL_DIMENSION_IDS.length, 8);
});

test("candidate API reproduces the R4-A evaluator for every integrated dimension", () => {
  const result = scoreCandidateContextualDimensionsV3({ answers: activeAnswers });
  assert.equal(result.dimensions.length, 8);
  for (const item of result.dimensions) {
    const evidence = item.evidence.map(({ questionId, questionVersion, migrationIdentity, dimension, state }) => ({
      questionId, questionVersion: questionVersion!, migrationIdentity: migrationIdentity!, dimension, state,
    }));
    const expected = evaluateDimensionApplicabilityV3({ dimension: item.id, context: result.context, evidence });
    assert.equal(item.applicability, expected.applicability, item.id);
    assert.equal(item.applicabilityReason, expected.reason, item.id);
    assert.deepEqual(item.applicabilityContext, expected.supportingContext, item.id);
  }
  assert.ok(result.dimensions.every((item) => item.applicabilityReason && Array.isArray(item.applicabilityContext)));
});

test("fail-closed evidence boundary rejects every impossible identity, activity, migration, and R3 mismatch", () => {
  const { answers, evidence } = sampleEvidence();
  const original = evidence[0]!;
  const rejects = (candidate: readonly ContextualEvidence[], active = answers, bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3) =>
    assert.throws(() => validateActiveCandidateEvidenceV3(candidate, active, bank));

  rejects([{ ...original, questionId: "unknown_candidate_question" }]);
  rejects([{ ...original, questionVersion: 1 }]);
  rejects([{ ...original, migrationIdentity: "wrong@v99" }]);
  rejects(evidence, {});

  const pendingBank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => {
    if (question.id !== original.questionId) return question;
    const { evidenceV3: _mapping, ...withoutMapping } = question;
    return { ...withoutMapping, evidenceMigration: "pending" as const };
  });
  rejects(evidence, answers, pendingBank);
  rejects([{ ...original, dimension: "trust_reputation" }]);
});

test("candidate end-to-end prelaunch matrix and Measurement null-score contract stay frozen", () => {
  const result = scoreCandidateContextualDimensionsV3({ answers: { q2_entity: "project", q2_has_customers: "no" } });
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
  const active = scoreCandidateContextualDimensionsV3({ answers: activeAnswers });
  const measurement = active.dimensions.find((item) => item.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  assert.equal(measurement.explainability.basis, "none");
  assert.deepEqual(measurement.explainability.gaps, ["no_evidence"]);
  assert.equal(measurement.confidence.level, "low");
});

test("legacy applicability diverges intentionally while candidate unknown and N/A stay neutral", () => {
  const prelaunchAnswers: AnswersV2 = { q2_entity: "project", q2_has_customers: "no" };
  const legacy = scoreContextualDimensions({
    answers: {},
    context: { growthStage: { status: "resolved", value: "idea", source: "signal" } },
    evidence: [],
  });
  const candidate = scoreCandidateContextualDimensionsV3({ answers: prelaunchAnswers });
  assert.equal(legacy.dimensions.find((item) => item.id === "digital_foundation")?.applicability, "applicable");
  assert.equal(candidate.dimensions.find((item) => item.id === "digital_foundation")?.applicability, "not_applicable");

  for (const [answer, state] of [["unknown", "uncertainty"], ["not_applicable", "not_applicable"]] as const) {
    const result = scoreCandidateContextualDimensionsV3({ answers: { ...activeAnswers, q2_presence_offer_clarity: answer } });
    const clarity = result.dimensions.find((item) => item.id === "clarity_positioning")!;
    assert.equal(clarity.applicability, "applicable");
    assert.equal(clarity.score, null);
    assert.equal(clarity.evidence.find((item) => item.questionId === "q2_presence_offer_clarity")?.state, state);
    assert.equal(clarity.evidence.find((item) => item.questionId === "q2_presence_offer_clarity")?.contribution, null);
  }
});

test("candidate resolution removes stale raw answers before evidence and R4", () => {
  const answers: AnswersV2 = { q2_entity: "project", q2_has_customers: "no", q2_reputation_flow: "steady" };
  const result = scoreCandidateContextualDimensionsV3({ answers });
  assert.equal(answers.q2_reputation_flow, "steady");
  assert.equal("q2_reputation_flow" in result.activeAnswers, false);
  assert.equal(result.dimensions.flatMap((item) => item.evidence).some((item) => item.questionId === "q2_reputation_flow"), false);
  assert.equal(result.dimensions.find((item) => item.id === "trust_reputation")?.applicability, "not_applicable");
});

test("every pending candidate definition produces zero evidence even when supplied an answer", () => {
  const pending = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.filter((question) => question.evidenceMigration === "pending");
  assert.equal(pending.length, 17);
  const answers = Object.fromEntries(pending.map((question) => [question.id, question.options[0]!.value])) as AnswersV2;
  const evidence = deriveContextualEvidence(answers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  assert.deepEqual(evidence.filter((item) => pending.some((question) => question.id === item.questionId)), []);
});

test("hybrid context, goal/friction independence, and shared score weights remain explicit", () => {
  const base: AnswersV2 = {
    q2_entity: "business", q2_has_customers: "yes", q2_monetization: "goods",
    q2_delivery: ["physical_location", "appointments", "online_checkout"],
  };
  const first = scoreCandidateContextualDimensionsV3({ answers: { ...base, q2_goal: "explain", q2_friction: "operations" } });
  const second = scoreCandidateContextualDimensionsV3({ answers: { ...base, q2_goal: "measure", q2_friction: "trust" } });
  assert.equal(first.context.archetype.value, "hybrid");
  assert.deepEqual(first.context.archetypeComponents, ["appointments", "ecommerce", "local"]);
  assert.deepEqual(first.context.archetypeComponents, second.context.archetypeComponents);
  assert.deepEqual(first.dimensions.map(({ id, applicability }) => [id, applicability]), second.dimensions.map(({ id, applicability }) => [id, applicability]));
  assert.deepEqual(SCORING_MODEL, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
});

test("candidate and legacy results use the same score, confidence, and explainability core", () => {
  // R8-B: the core is shared; the numbers are not. Under the historical v1 calibration (= the shared model)
  // the results are identical; under the current candidate calibration only the confidence level may move.
  const candidateV1 = scoreCandidateContextualDimensionsV3({ answers: activeAnswers, calibration: CANDIDATE_CALIBRATION_BASELINE_V1 });
  const current = scoreCandidateContextualDimensionsV3({ answers: activeAnswers });
  const evidence = deriveContextualEvidence(candidateV1.activeAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  const legacy = scoreContextualDimensions({
    answers: candidateV1.activeAnswers,
    context: candidateV1.context,
    evidence,
    bank: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
  });
  const candidateDimension = candidateV1.dimensions.find((item) => item.id === "clarity_positioning")!;
  const legacyDimension = legacy.dimensions.find((item) => item.id === "clarity_positioning")!;
  assert.equal(candidateDimension.score, legacyDimension.score);
  assert.deepEqual(candidateDimension.confidence, legacyDimension.confidence);
  assert.deepEqual(candidateDimension.explainability, legacyDimension.explainability);
  const currentDimension = current.dimensions.find((item) => item.id === "clarity_positioning")!;
  const { level: _current, ...currentCore } = currentDimension.confidence;
  const { level: _legacy, ...legacyCore } = legacyDimension.confidence;
  assert.deepEqual(currentCore, legacyCore);
  assert.deepEqual(currentDimension.explainability, legacyDimension.explainability);
});

test("candidate remains isolated from persisted runtime versions and the active 85-question bank", async () => {
  const { QUESTION_BANK_V2 } = await import("../../../app/features/diagnostic/qbv2-bank");
  assert.equal(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.length, 38);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([
    CURRENT_DIAGNOSTIC_VERSION,
    CURRENT_QUESTION_BANK_VERSION,
    CURRENT_ROUTING_VERSION,
    CURRENT_SCORING_VERSION,
    CURRENT_RESULT_SCHEMA_VERSION,
  ], ["2.0", 1, 1, 1, 1]);
});
