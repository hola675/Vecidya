import assert from "node:assert/strict";
import test from "node:test";

import {
  QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77,
  QA03B_EXTENDED_CANDIDATE_BANK_V3 as bank82,
  QA03B_COMPLEMENTARY_QUESTIONS_V1 as supplements,
  QA03B_GENERAL_DIMENSION_PROBES_V1 as probes,
  QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4 as bank90,
  QA03B_GENERAL_PROBE_EVIDENCE_DRAFT_V1 as draft,
} from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-coverage";
import { validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-scoring";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-planner";
import { scoreDimensionWithApplicability, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { CANDIDATE_CALIBRATION_ACTIVE_V4, candidateDimensionCalibrationV3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const base: AnswersV2 = {
  q2_entity: "business",
  q2_has_customers: "yes",
  q2_operational_status: "operating",
  q2_monetization: "services",
  q2_sector: "professional_services",
  q2_delivery: ["remote_service"],
  q2_customer_buyer: "b2b",
  q2_goal: "explain",
  q2_friction: "conversion",
};
const probeIds = new Set(probes.map((q) => q.id));

test("V9 expansions remain additive and preserve distinct 77/82/90 banks", () => {
  assert.equal(bank77.length, 77);
  assert.equal(supplements.length, 5);
  assert.equal(bank82.length, 82);
  assert.equal(probes.length, 8);
  assert.equal(bank90.length, 90);
  for (const bank of [bank77, bank82, bank90]) {
    assert.equal(new Set(bank.map((q) => q.id)).size, bank.length);
  }
  assert.deepEqual(bank82.slice(0, 77), bank77);
  assert.deepEqual(bank90.slice(0, 82), bank82);
  assert.deepEqual(bank90.slice(82), probes);
  assert.deepEqual(validateEvidenceMigrationsV3(bank90), []);
  assert.deepEqual(validateQuestionCopyV2(bank90), []);
});

test("eight general probes cover eight different dimensions, with neutral fallback", () => {
  assert.deepEqual(new Set(draft.map((row) => row.dimension)), new Set(DIGITAL_DIMENSION_IDS));
  assert.deepEqual(draft.map((row) => row.questionId), probes.map((q) => q.id));
  assert.equal(draft.filter((row) => row.proposedRole === "conditional_direct").length, 7);
  assert.equal(draft.filter((row) => row.proposedRole === "supporting_only").length, 1);
  for (const q of probes) {
    assert.equal(q.version, 1, q.id);
    assert.equal(q.type, "single", q.id);
    assert.equal(q.routingRole, "deepening", q.id);
    assert.equal(q.priority, "refinement", q.id);
    assert.equal(q.evidenceMigration, "pending", q.id);
    assert.equal(q.evidenceV3, undefined, q.id);
    assert.equal(q.options.length, 5, q.id);
    assert.equal(q.options.filter((o) => o.kind === "unknown").length, 1, q.id);
    assert.equal(q.options.filter((o) => o.kind === "not_applicable").length, 1, q.id);
    assert.ok(q.hint && q.hint.length <= 140, q.id);
    const row = draft.find((entry) => entry.questionId === q.id);
    assert.ok(row, q.id);
    assert.deepEqual(Object.keys(row.provisionalAnswerStates), q.options.map((o) => o.value), q.id);
    for (const option of q.options) {
      const states: Readonly<Record<string, string | null>> = row.provisionalAnswerStates;
      const value = states[option.value];
      assert.equal(value === null, option.kind === "unknown" || option.kind === "not_applicable", `${q.id}/${option.value}`);
    }
  }
  const outcome = draft.find((x) => x.questionId === "q2_general_outcome_measure_definition");
  assert.equal(outcome?.proposedRole, "supporting_only");
  assert.ok(outcome?.potentialOverlap.includes("q2_measurement_practice"));
});

test("eligibility respects operation, history and preparation without forcing all eight", () => {
  const active = resolveEligibleQuestionsV2(base, bank90);
  assert.deepEqual(new Set(active.eligibleQuestionIds.filter((id) => probeIds.has(id))), probeIds);
  const preparing = resolveEligibleQuestionsV2({ ...base, q2_has_customers: "no", q2_operational_status: "preparing" }, bank90);
  assert.deepEqual(preparing.eligibleQuestionIds.filter((id) => probeIds.has(id)), ["q2_general_offer_comprehension"]);
  const noHistory = resolveEligibleQuestionsV2({ ...base, q2_has_customers: "no" }, bank90);
  assert.deepEqual(
    new Set(noHistory.eligibleQuestionIds.filter((id) => probeIds.has(id))),
    new Set([
      "q2_general_offer_comprehension",
      "q2_general_contact_information_consistency",
      "q2_general_first_action_path",
      "q2_general_digital_execution_reliability",
    ]),
  );
  const paused = resolveEligibleQuestionsV2({ ...base, q2_operational_status: "paused" }, bank90);
  assert.deepEqual(paused.eligibleQuestionIds.filter((id) => probeIds.has(id)), []);
});

test("new and neutral probe answers do not produce uncalibrated scoring", () => {
  const baseline = scoreCandidateContextualDimensionsV3({ answers: base }, bank82);
  const withoutAnswers = scoreCandidateContextualDimensionsV3({ answers: base }, bank90);
  assert.deepEqual(withoutAnswers.dimensions, baseline.dimensions);
  for (const optionKind of ["unknown", "not_applicable"] as const) {
    const answers: Record<string, string | readonly string[]> = { ...base };
    for (const q of probes) {
      const option = q.options.find((item) => item.kind === optionKind);
      assert.ok(option, q.id);
      answers[q.id] = option.value;
    }
    const score = scoreCandidateContextualDimensionsV3({ answers }, bank90);
    assert.deepEqual(score.dimensions, baseline.dimensions, optionKind);
    assert.ok(score.dimensions.every((dimension) => dimension.evidence.every((item) => !probeIds.has(item.questionId))));
  }
  const positive: AnswersV2 = { ...base, q2_general_digital_execution_reliability: "reliable", q2_general_outcome_measure_definition: "defined" };
  const score = scoreCandidateContextualDimensionsV3({ answers: positive }, bank90);
  assert.deepEqual(score.dimensions, baseline.dimensions);
});

test("the candidate planner cannot treat pending general probes as migrated V3 evidence", () => {
  const plan = buildCandidateQuestionPlanFromBankV3({ answers: base }, bank90, "utility_first");
  for (const id of probeIds) {
    assert.ok(!plan.evidenceSufficiency.usefulEvidenceQuestionIds.includes(id), id);
  }
  assert.ok(plan.selectedQuestionIds.length <= 24);
});

test("editing operation status invalidates a previously answered probe", () => {
  const active: AnswersV2 = { ...base, q2_general_pending_step_continuity: "reliable" };
  assert.equal(resolveEligibleQuestionsV2(active, bank90).activeAnswers.q2_general_pending_step_continuity, "reliable");
  const changed = resolveEligibleQuestionsV2({ ...active, q2_operational_status: "preparing" }, bank90);
  assert.equal(changed.activeAnswers.q2_general_pending_step_continuity, undefined);
  assert.ok(!changed.eligibleQuestionIds.includes("q2_general_pending_step_continuity"));
});


test("focal V4 percentage math separates direct evidence, supporting evidence, and neutral states", () => {
  const calibration = candidateDimensionCalibrationV3(CANDIDATE_CALIBRATION_ACTIVE_V4);
  const observation = (
    questionId: string,
    state: "established" | "partial" | "not_applicable",
    directness: "direct" | "supporting",
    observationId: string = questionId,
  ): ContextualEvidence => ({
    questionId, observationId, dimension: "measurement_optimization", directness, state,
    kind: state, contribution: CANDIDATE_CALIBRATION_ACTIVE_V4.capabilityContribution[state],
    answer: [state],
  });
  const score = (observations: readonly ContextualEvidence[]) =>
    scoreDimensionWithApplicability("measurement_optimization", observations, "applicable", calibration);
  const oneDirect = score([observation("record", "established", "direct")]);
  assert.equal(oneDirect.score, 75);
  assert.equal(oneDirect.confidence.level, "medium");
  assert.equal(oneDirect.explainability.gaps.includes("single_direct_observation"), true);

  const supportingOnly = score([
    observation("definition", "established", "supporting"),
    observation("anotherDefinition", "partial", "supporting"),
  ]);
  assert.equal(supportingOnly.score, null);
  assert.equal(supportingOnly.confidence.level, "low");

  const mixed = score([
    observation("record", "partial", "direct"),
    observation("definition", "established", "supporting"),
    observation("extraDefinition", "established", "supporting"),
  ]);
  assert.equal(mixed.score, 58, "supporting total weight cannot exceed half the direct weight");
  assert.equal(score([observation("absence", "not_applicable", "direct")]).score, null);
});

test("dimension score still counts distinct question IDs unless given the same observationId", () => {
  const calibration = candidateDimensionCalibrationV3(CANDIDATE_CALIBRATION_ACTIVE_V4);
  const observation = (questionId: string, observationId: string): ContextualEvidence => ({
    questionId, observationId, dimension: "relationship_recurrence",
    directness: "direct", state: "established", kind: "established",
    contribution: 0.75, answer: ["established"],
  });
  const sameEvent = scoreDimensionWithApplicability("relationship_recurrence", [
    observation("q2_followup_general_process", "event:request-1"),
    observation("q2_general_pending_step_continuity", "event:request-1"),
  ], "applicable", calibration);
  assert.equal(sameEvent.confidence.direct, 1, "equal observation IDs are deduplicated");

  const differentIds = scoreDimensionWithApplicability("relationship_recurrence", [
    observation("q2_followup_general_process", "q2_followup_general_process:relationship_recurrence"),
    observation("q2_general_pending_step_continuity", "q2_general_pending_step_continuity:relationship_recurrence"),
  ], "applicable", calibration);
  assert.equal(differentIds.confidence.direct, 2,
    "known P0: question-specific observation IDs cannot deduplicate the same real event across questions");
  assert.equal(differentIds.score, sameEvent.score);
  assert.notEqual(differentIds.confidence.level, sameEvent.confidence.level);
});
