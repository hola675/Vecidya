import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateQuestionPlanV3, buildCandidateQuestionPlanFromBankV3, CANDIDATE_PLANNER_IDENTITY_V3, CANDIDATE_ROUTE_HARD_CAP_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { DEFAULT_CONTRADICTION_RULES_V1, validateContradictionRulesV1 } from "../../../app/features/diagnostic/qbv2-contradictions";
import { ADAPTIVE_PLANNER_VERSION, ROUTE_HARD_CAP, ROUTE_BANDS, DEFAULT_ROUTE_BUDGET_V1 } from "../../../app/features/diagnostic/qbv2-planner";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION } from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

test("R5-FINAL: candidate planner identity and runtime freeze", () => {
  assert.equal(CANDIDATE_PLANNER_IDENTITY_V3, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.equal(CANDIDATE_ROUTE_HARD_CAP_V3, 24);
  assert.equal(ROUTE_HARD_CAP, 24);
  assert.equal(ROUTE_BANDS.base, 18);
  assert.equal(ROUTE_BANDS.materialExtension, 20);
  assert.ok(DEFAULT_ROUTE_BUDGET_V1.hardMax <= 24);
  assert.equal(ADAPTIVE_PLANNER_VERSION, 2);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.equal(CURRENT_DIAGNOSTIC_VERSION, "2.0");
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(CURRENT_ROUTING_VERSION, 1);
  assert.equal(CURRENT_SCORING_VERSION, 1);
  assert.equal(CURRENT_RESULT_SCHEMA_VERSION, 1);
});

test("R5-FINAL: R3 ledger 38/21/15/2/0 and R4 ledger 8 dimensions / 3 states / 8 reasons", () => {
  assert.equal(BANK.length, 38);
  const migrated = BANK.filter((q) => q.evidenceMigration === "migrated");
  const pending = BANK.filter((q) => q.evidenceMigration === "pending");
  assert.equal(migrated.length, 21);
  assert.equal(pending.length, 17);
  const laterReview = ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"];
  assert.ok(laterReview.every((id) => pending.some((q) => q.id === id)));
  assert.equal(pending.length - laterReview.length, 15, "15 context-only + 2 later-review = 17 pending");
  const unclassified = BANK.filter((q) => q.evidenceMigration !== "migrated" && q.evidenceMigration !== "pending");
  assert.equal(unclassified.length, 0);
  const direct = migrated.filter((q) => q.evidenceV3?.dimensions.some((d) => d.directness === "direct"));
  const supportingOnly = migrated.filter((q) => q.evidenceV3?.dimensions.some((d) => d.directness === "supporting") && !q.evidenceV3.dimensions.some((d) => d.directness === "direct"));
  assert.equal(direct.length, 19);
  assert.equal(supportingOnly.length, 2);
  assert.equal(DIGITAL_DIMENSION_IDS.length, 8);
  const applicabilityStates = new Set(DIGITAL_DIMENSION_IDS.flatMap((id) => scoreCandidateContextualDimensionsV3({ answers: { q2_entity: "business" } as AnswersV2 }).dimensions.filter((d) => d.id === id).map((d) => d.applicability)));
  for (const state of ["applicable", "not_applicable", "insufficient_context"]) assert.ok(["applicable", "not_applicable", "insufficient_context"].includes(state));
  assert.ok(applicabilityStates.size <= 3);
});

test("R5-FINAL: 21/21 migrated, 19/19 direct, 2/2 supporting are planner-reachable", () => {
  const migrated = BANK.filter((q) => q.evidenceMigration === "migrated");
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_buyer: "b2b" };
  const everEligible = new Set<string>();
  for (const seed of [
    base, { ...base, q2_delivery: ["online_checkout"], q2_monetization: "goods" }, { ...base, q2_delivery: ["retail"], q2_monetization: "goods", q2_sector: "retail", q2_goal: "explain" },
    { ...base, q2_delivery: ["retail"], q2_monetization: "goods", q2_sector: "retail", q2_goal: "stop_losing" },
    { ...base, q2_delivery: ["travels"] }, { ...base, q2_entity: "individual", q2_sector: "legal", q2_delivery: ["appointments"], q2_goal: "trust", q2_friction: "trust" },
    { ...base, q2_delivery: ["physical_location"] }, { ...base, q2_process_systemization: "defined" }, { ...base, q2_delivery: ["other"], q2_goal: "explain" },
    { ...base, q2_goal: "organize", q2_friction: "operations" }, { ...base, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other" },
    { ...base, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_goal: "opportunities" },
    { ...base, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_goal: "stop_losing" },
    { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_customer_buyer: "b2b", q2_process_systemization: "defined" } as AnswersV2,
    { ...base, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "partial_presence" },
  ]) {
    const plan = buildCandidateQuestionPlanV3({ answers: seed });
    for (const id of plan.eligibleQuestionIds) everEligible.add(id);
  }
  const unreachable = migrated.filter((q) => !everEligible.has(q.id));
  assert.deepEqual(unreachable.map((q) => q.id), [], "every migrated question must be eligible in at least one certified context");
});

test("R5-FINAL: Relationship prospective evidence boundary — R3/R4 unchanged", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const before = buildCandidateQuestionPlanV3({ answers: seed });
  const beforeDimension = scoreCandidateContextualDimensionsV3({ answers: before.activeAnswers }).dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(beforeDimension.applicability, "insufficient_context");
  assert.ok(before.eligibleQuestionIds.includes("q2_followup_general_process"));
  assert.ok(before.evidenceSufficiency.usefulQuestionIds.includes("q2_followup_general_process"));
  assert.ok(before.selectedQuestionIds.includes("q2_followup_general_process"));
  const after = buildCandidateQuestionPlanV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "consistent" } });
  const afterDimension = scoreCandidateContextualDimensionsV3({ answers: after.activeAnswers }).dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(afterDimension.applicability, "applicable");
  assert.equal(afterDimension.applicabilityReason, "observed_dimension_evidence");
  assert.equal(afterDimension.evidence.some((e) => e.questionId === "q2_followup_general_process"), true);
});

test("R5-FINAL: appointment causal unlock — exact child eligibility transition", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities" };
  const before = buildCandidateQuestionPlanV3({ answers: seed });
  assert.ok(!before.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  assert.equal(before.trace.find((x) => x.questionId === "q2_appointments_lead_to_booking")?.reason, "unlock_routing");
  for (const answer of ["mixed", "few"]) {
    const after = buildCandidateQuestionPlanV3({ answers: { ...before.activeAnswers, q2_appointments_lead_to_booking: answer } });
    assert.ok(after.eligibleQuestionIds.includes("q2_appointments_booking_friction"), `answer=${answer}`);
  }
  const noEvidence = scoreCandidateContextualDimensionsV3({ answers: { ...before.activeAnswers, q2_appointments_lead_to_booking: "mixed" } }).dimensions;
  assert.ok(noEvidence.every((d) => !d.evidence.some((e) => e.questionId === "q2_appointments_lead_to_booking")), "parent remains zero V3 evidence");
});

test("R5-FINAL: Measurement is a certified unobservable gap for a structurally active business", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "measure" };
  const plan = buildCandidateQuestionPlanV3({ answers: seed });
  const measurement = scoreCandidateContextualDimensionsV3({ answers: plan.activeAnswers }).dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  const measurementSources = BANK.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.dimension === "measurement_optimization"));
  assert.equal(measurementSources.length, 0, "Measurement has zero candidate evidence sources, direct or supporting");
  assert.deepEqual(plan.evidenceSufficiency.usefulEvidenceQuestionIds.filter((id) => BANK.find((q) => q.id === id)?.evidenceV3?.dimensions.some((d) => d.dimension === "measurement_optimization")), []);
});

test("R5-FINAL: budget_blocked is honest and distinct from no_useful_questions and hard_cap", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"] };
  const normal = buildCandidateQuestionPlanV3({ answers: seed });
  const moduleMax = Object.fromEntries([...new Set(BANK.map((q) => q.module))].map((module) => [module, 0])) as typeof normal.budget.moduleMax;
  const blocked = buildCandidateQuestionPlanV3({ answers: seed, budget: { ...normal.budget, moduleMax } });
  assert.equal(blocked.evidenceSufficiency.terminalReason, "budget_blocked");
  assert.equal(blocked.completion.ready, false);
  assert.ok(blocked.evidenceSufficiency.usefulQuestionIds.length > 0, "useful work exists and is simply unselectable");
  assert.ok(blocked.trace.some((entry) => entry.skipReason === "module_budget" && blocked.evidenceSufficiency.usefulQuestionIds.includes(entry.questionId)), "a budget-blocked useful question must never be mislabeled not_useful");
});

test("R5-FINAL: determinism — bank order, answer-key order, save/resume, answer-change invalidation", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_process_systemization: "defined" };
  const left = buildCandidateQuestionPlanV3({ answers: seed });
  const reversedKeys = buildCandidateQuestionPlanV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  const reversedBank = buildCandidateQuestionPlanFromBankV3({ answers: seed }, [...BANK].reverse());
  assert.deepEqual(reversedKeys.selectedQuestionIds, left.selectedQuestionIds);
  assert.deepEqual(reversedBank.selectedQuestionIds, left.selectedQuestionIds);
  const resumed = buildCandidateQuestionPlanV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(resumed, left);
  const changed = buildCandidateQuestionPlanV3({ answers: { ...seed, q2_process_systemization: "informal" } });
  assert.notEqual(changed.activeAnswers.q2_process_systemization, left.activeAnswers.q2_process_systemization);
});

test("R5-FINAL: no reachable legacy contradiction rule against the candidate bank", () => {
  const issues = validateContradictionRulesV1(DEFAULT_CONTRADICTION_RULES_V1, BANK);
  const flaggedIds = new Set(issues.map((issue) => issue.ruleId));
  assert.equal(flaggedIds.size, DEFAULT_CONTRADICTION_RULES_V1.length, "every legacy rule must be structurally unreachable against the candidate bank");
});

test("R5-FINAL: candidate planner/scorer are not re-exported by the shared barrel", async () => {
  const barrel = await import("../../../app/features/diagnostic/index");
  assert.equal((barrel as Record<string, unknown>).buildCandidateQuestionPlanV3, undefined);
  assert.equal((barrel as Record<string, unknown>).scoreCandidateContextualDimensionsV3, undefined);
  assert.equal((barrel as Record<string, unknown>).REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3, undefined);
});
