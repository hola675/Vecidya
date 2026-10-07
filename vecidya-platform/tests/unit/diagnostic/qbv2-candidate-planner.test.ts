import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateQuestionPlanFromBankV3, buildCandidateQuestionPlanV3, CANDIDATE_ROUTE_HARD_CAP_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { DEFAULT_CONTRADICTION_RULES_V1, validateContradictionRulesV1 } from "../../../app/features/diagnostic/qbv2-contradictions";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const active: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities" };

test("R5-A candidate planner uses candidate bank, R3 utility, and R4 applicability", () => {
  const plan = buildCandidateQuestionPlanV3({ answers: active });
  assert.equal(plan.plannerIdentity, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.ok(plan.eligibleQuestionIds.every((id) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((q) => q.id === id)));
  assert.ok(plan.selectedQuestionIds.every((id) => plan.eligibleQuestionIds.includes(id)));
  assert.equal(new Set(plan.selectedQuestionIds).size, plan.selectedQuestionIds.length);
  assert.ok(plan.budget.hardMax <= CANDIDATE_ROUTE_HARD_CAP_V3);
  assert.equal(plan.nextQuestionId, plan.selectedQuestionIds[0]);
  assert.deepEqual(buildCandidateQuestionPlanV3({ answers: JSON.parse(JSON.stringify(active)) }).selectedQuestionIds, plan.selectedQuestionIds);
});

test("Measurement can remain applicable with no candidate evidence source and no legacy chase", () => {
  const plan = buildCandidateQuestionPlanV3({ answers: { ...active, q2_goal: "measure" } });
  const measurement = scoreCandidateContextualDimensionsV3({ answers: { ...active, q2_goal: "measure" } }).dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  assert.equal(measurement.confidence.direct, 0);
  assert.equal(measurement.confidence.supporting, 0);
  const measurementSources = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.dimension === "measurement_optimization")).map((q) => q.id);
  assert.deepEqual(measurementSources, []);
  assert.deepEqual(plan.evidenceSufficiency.usefulEvidenceQuestionIds.filter((id) => measurementSources.includes(id)), []);
  assert.ok(plan.selectedQuestionIds.every((id) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((q) => q.id === id)));
  assert.ok(!plan.selectedQuestionIds.some((id) => ["q2_measurement_tools", "q2_measurement_practice"].includes(id)));
});

test("context-only answers resolve routing facts without producing R3 evidence", () => {
  const before = buildCandidateQuestionPlanV3({ answers: { q2_entity: "business" } });
  const contextQuestion = "q2_has_customers";
  assert.ok(before.selectedQuestionIds.includes(contextQuestion), "expected the customer activity context question");
  assert.equal(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === contextQuestion)?.evidenceMigration, "pending");
  const answered = buildCandidateQuestionPlanV3({ answers: { q2_entity: "business", [contextQuestion]: "yes" } });
  assert.equal(before.context.activity.status, "unresolved");
  assert.equal(answered.context.activity.status, "resolved");
  assert.equal(answered.context.activity.value, "active");
  assert.notDeepEqual(scoreCandidateContextualDimensionsV3({ answers: { q2_entity: "business" } }).dimensions.map((d) => [d.id, d.applicability]), scoreCandidateContextualDimensionsV3({ answers: { q2_entity: "business", [contextQuestion]: "yes" } }).dimensions.map((d) => [d.id, d.applicability]));
  assert.ok(!scoreCandidateContextualDimensionsV3({ answers: { q2_entity: "business", [contextQuestion]: "yes" } }).dimensions.some((d) => d.confidence.direct > 0 || d.confidence.supporting > 0));
});

test("direct candidate evidence is useful only for an applicable open dimension", () => {
  const plan = buildCandidateQuestionPlanV3({ answers: active });
  assert.ok(plan.evidenceSufficiency.usefulEvidenceQuestionIds.some((id) => {
    const q = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((item) => item.id === id)!;
    return q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.directness === "direct" && plan.evidenceSufficiency.unresolvedApplicableDimensions.includes(d.dimension));
  }));
});

test("goal and friction affect ordering only; they do not alter R4 or create evidence", () => {
  const first = { ...active, q2_goal: "opportunities" };
  const second = { ...active, q2_goal: "explain", q2_friction: "operations" };
  const a = buildCandidateQuestionPlanV3({ answers: first });
  const b = buildCandidateQuestionPlanV3({ answers: second });
  const appA = scoreCandidateContextualDimensionsV3({ answers: first }).dimensions.map(({ id, applicability }) => [id, applicability]);
  const appB = scoreCandidateContextualDimensionsV3({ answers: second }).dimensions.map(({ id, applicability }) => [id, applicability]);
  assert.deepEqual(appA, appB);
  assert.ok([...a.evidenceSufficiency.usefulQuestionIds, ...b.evidenceSufficiency.usefulQuestionIds].every((id) => a.eligibleQuestionIds.includes(id) || b.eligibleQuestionIds.includes(id)));
  assert.ok(![...a.evidenceSufficiency.usefulEvidenceQuestionIds, ...b.evidenceSufficiency.usefulEvidenceQuestionIds].some((id) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === id)?.evidenceMigration !== "migrated"));
});

test("supporting-only readiness cannot close a gap, but can refine an existing direct observation", () => {
  const supportingOnly: AnswersV2 = { ...active, q2_customer_buyer: "b2b", q2_goal: "organize" };
  const onlyScore = scoreCandidateContextualDimensionsV3({ answers: supportingOnly }).dimensions.find((d) => d.id === "digital_readiness")!;
  const onlyPlan = buildCandidateQuestionPlanV3({ answers: supportingOnly });
  assert.equal(onlyScore.score, null);
  assert.ok(!onlyPlan.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_b2b_status_visibility"));
  const directAndSupporting: AnswersV2 = { ...supportingOnly, q2_process_systemization: "defined" };
  const refinedPlan = buildCandidateQuestionPlanV3({ answers: directAndSupporting });
  const readiness = scoreCandidateContextualDimensionsV3({ answers: directAndSupporting }).dimensions.find((d) => d.id === "digital_readiness")!;
  assert.notEqual(readiness.score, null);
  assert.ok(refinedPlan.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_b2b_status_visibility"));
});

test("hybrid components remain present and relevant component questions stay eligible", () => {
  const answers = { ...active, q2_delivery: ["retail", "online_checkout"], q2_goal: "explain" };
  const plan = buildCandidateQuestionPlanV3({ answers });
  assert.equal(plan.context.archetype.value, "hybrid");
  assert.deepEqual(plan.context.archetypeComponents, ["ecommerce", "retail"]);
  assert.ok(plan.eligibleQuestionIds.some((id) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === id)?.module === "retail"));
  assert.ok(plan.eligibleQuestionIds.some((id) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === id)?.module === "ecommerce"));
});

test("later-review questions never supply evidence utility and legacy planner inputs stay separate", () => {
  const plan = buildCandidateQuestionPlanV3({ answers: active });
  for (const id of ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"]) {
    assert.ok(!plan.evidenceSufficiency.usefulEvidenceQuestionIds.includes(id));
    assert.deepEqual(plan.trace.find((entry) => entry.questionId === id)?.evidenceDimensions, []);
    assert.deepEqual(plan.trace.find((entry) => entry.questionId === id)?.supportingDimensions, []);
  }
  assert.ok(plan.selectedQuestionIds.includes("q2_appointments_lead_to_booking"));
  assert.equal(plan.trace.find((entry) => entry.questionId === "q2_appointments_lead_to_booking")?.reason, "unlock_routing");
  const creator = buildCandidateQuestionPlanV3({ answers: { ...active, q2_monetization: "audience", q2_goal: "stop_losing" } });
  assert.ok(!creator.selectedQuestionIds.includes("q2_creator_audience_ownership"));
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("legacy contradiction rules are audited against the candidate without importing legacy-only confirmations", () => {
  const issues = validateContradictionRulesV1(DEFAULT_CONTRADICTION_RULES_V1, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  assert.ok(issues.some((issue) => issue.ruleId === "primary_friction.visibility_vs_follow_up.material"));
  assert.ok(issues.some((issue) => issue.ruleId === "primary_friction.visibility_vs_follow_up.soft"));
  const plan = buildCandidateQuestionPlanV3({ answers: { ...active, q2_goal: "other", q2_friction: "visibility", q2_service_response_speed: "weak", q2_service_quote_followup: "sometimes" } });
  assert.deepEqual(plan.evidenceSufficiency.contradictions, []);
});

test("answer insertion order and save/resume reconstruct identical state", () => {
  const reversed = Object.fromEntries(Object.entries(active).reverse()) as AnswersV2;
  const left = buildCandidateQuestionPlanV3({ answers: active });
  const right = buildCandidateQuestionPlanV3({ answers: JSON.parse(JSON.stringify(reversed)) });
  assert.deepEqual(right.selectedQuestionIds, left.selectedQuestionIds);
  assert.deepEqual(right.context, left.context);
  assert.deepEqual(right.completion, left.completion);
});

test("equivalent reversed candidate bank order preserves selected route and next question", () => {
  const normal = buildCandidateQuestionPlanV3({ answers: active });
  const reversed = buildCandidateQuestionPlanFromBankV3({ answers: active }, [...REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3].reverse());
  assert.deepEqual(reversed.selectedQuestionIds, normal.selectedQuestionIds);
  assert.equal(reversed.nextQuestionId, normal.nextQuestionId);
  assert.deepEqual(reversed.evidenceSufficiency.usefulQuestionIds, normal.evidenceSufficiency.usefulQuestionIds);
});

test("answer changes invalidate stale specialized answers and evidence", () => {
  const stale: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_appointments_noshow: "often" };
  const changed = { ...stale, q2_delivery: ["online_checkout"] };
  const plan = buildCandidateQuestionPlanV3({ answers: changed });
  assert.ok(!("q2_appointments_noshow" in scoreCandidateContextualDimensionsV3({ answers: changed }).activeAnswers));
  assert.ok(!plan.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_appointments_noshow"));
});

test("candidate hard cap is clamped and no-useful state is terminal", () => {
  const plan = buildCandidateQuestionPlanV3({ answers: active, budget: { targetMin: 10, targetMax: 40, hardMax: 100, confirmationReserve: 2, moduleMax: {} } });
  assert.equal(plan.budget.hardMax, 24);
  const fullyAnswered = Object.fromEntries(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((q) => [q.id, q.options.find((option) => option.kind !== "unknown" && option.kind !== "not_applicable")?.value ?? q.options[0].value])) as AnswersV2;
  const terminal = buildCandidateQuestionPlanV3({ answers: fullyAnswered });
  assert.equal(terminal.evidenceSufficiency.usefulQuestionsRemaining, terminal.selectedQuestionIds.length > 0);
  assert.ok(terminal.completion.ready || terminal.nextQuestionId);
});

test("explicit candidate route seeds cover the reviewed context families within the hard cap", () => {
  const fixtures: readonly [string, AnswersV2, readonly string[]][] = [
    ["prelaunch project", { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" }, ["startup", "presence"]],
    ["active professional", { q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "legal" }, ["professional", "trust"]],
    ["appointments", { ...active, q2_delivery: ["appointments"] }, ["appointments"]],
    ["retail", { ...active, q2_delivery: ["retail"], q2_goal: "explain" }, ["retail"]],
    ["ecommerce", { ...active, q2_delivery: ["online_checkout"] }, ["ecommerce"]],
    ["B2B", { ...active, q2_customer_buyer: "b2b", q2_goal: "organize" }, ["b2b"]],
    ["creator", { ...active, q2_monetization: "audience", q2_goal: "stop_losing" }, ["creator"]],
    ["nonprofit", { ...active, q2_entity: "organization", q2_monetization: "mission" }, ["classification", "core"]],
    ["operations-heavy", { ...active, q2_friction: "operations", q2_goal: "organize" }, ["operations"]],
    ["hybrid", { ...active, q2_delivery: ["physical_location", "online_checkout"] }, ["retail", "ecommerce"]],
    ["unresolved/unknown", { q2_entity: "business", q2_goal: "unsure" }, ["classification", "maturity"]],
  ];
  for (const [name, answers, expectedModules] of fixtures) {
    const plan = buildCandidateQuestionPlanV3({ answers });
    assert.equal(new Set(plan.selectedQuestionIds).size, plan.selectedQuestionIds.length, `${name}: no duplicate question`);
    assert.ok(plan.selectedQuestionIds.every((id) => plan.eligibleQuestionIds.includes(id)), `${name}: selected questions are eligible`);
    assert.ok(plan.routeLength <= 24, `${name}: hard cap`);
    assert.ok(plan.nextQuestionId || plan.completion.ready || !plan.evidenceSufficiency.usefulQuestionsRemaining, `${name}: no-progress invariant`);
    assert.ok(expectedModules.some((module) => REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((q) => q.module === module && plan.eligibleQuestionIds.includes(q.id))), `${name}: expected module remains reachable`);
    assert.deepEqual(buildCandidateQuestionPlanV3({ answers }).selectedQuestionIds, plan.selectedQuestionIds, `${name}: repeatable route`);
  }
});

test("mechanical route sweep terminates for 12 explicit seeds and reports bounded route lengths", () => {
  const seeds: readonly AnswersV2[] = [
    { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" },
    { q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "legal" },
    { ...active, q2_delivery: ["appointments"] },
    { ...active, q2_delivery: ["retail"], q2_goal: "explain" },
    { ...active, q2_delivery: ["online_checkout"] },
    { ...active, q2_customer_buyer: "b2b", q2_goal: "organize" },
    { ...active, q2_monetization: "audience", q2_goal: "stop_losing" },
    { ...active, q2_entity: "organization", q2_monetization: "mission" },
    { ...active, q2_friction: "operations", q2_goal: "organize" },
    { ...active, q2_goal: "measure" },
    { ...active, q2_delivery: ["physical_location", "online_checkout"] },
    { q2_entity: "business", q2_goal: "unsure" },
  ];
  const routeLengths: number[] = [];
  let hardCapHits = 0;
  let noUseful = 0;
  let deepening = 0;
  for (let fixtureIndex = 0; fixtureIndex < seeds.length; fixtureIndex += 1) {
    let answers: AnswersV2 = seeds[fixtureIndex];
    let terminal = false;
    for (let step = 0; step < 24; step += 1) {
      const plan = buildCandidateQuestionPlanV3({ answers });
      answers = plan.activeAnswers;
      assert.ok(plan.selectedQuestionIds.every((id) => plan.eligibleQuestionIds.includes(id)), `fixture ${fixtureIndex}: eligible only`);
      assert.equal(new Set(plan.selectedQuestionIds).size, plan.selectedQuestionIds.length, `fixture ${fixtureIndex}: deduplicated`);
      if (!plan.nextQuestionId || plan.completion.hardCapReached) {
        terminal = true;
        hardCapHits += Number(plan.completion.hardCapReached);
        noUseful += Number(plan.evidenceSufficiency.terminalReason === "no_useful_questions");
        deepening += Number(plan.evidenceSufficiency.terminalReason === "useful_questions_remaining" && !plan.completion.ready);
        break;
      }
      const question = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === plan.nextQuestionId)!;
      // Mechanical sweep only: a fixed first non-unknown/non-N/A value checks finite progress, not route quality.
      const option = question.options.find((item) => item.kind !== "unknown" && item.kind !== "not_applicable" && !item.exclusive) ?? question.options.find((item) => item.kind !== "unknown" && item.kind !== "not_applicable");
      assert.ok(option, `fixture ${fixtureIndex}: ${question.id} has an ordinary response`);
      answers = { ...answers, [question.id]: question.type === "multi" ? [option.value] : option.value };
    }
    assert.ok(terminal, `fixture ${fixtureIndex}: terminates within 24 steps`);
    const finalPlan = buildCandidateQuestionPlanV3({ answers });
    routeLengths.push(Object.keys(finalPlan.activeAnswers).length);
    assert.ok(routeLengths[routeLengths.length - 1] <= 24);
    if (seeds[fixtureIndex].q2_goal === "measure") {
      const measurement = scoreCandidateContextualDimensionsV3({ answers }).dimensions.find((d) => d.id === "measurement_optimization")!;
      assert.equal(measurement.applicability, "applicable");
      assert.equal(measurement.score, null);
      assert.equal(finalPlan.evidenceSufficiency.terminalReason, "no_useful_questions");
    }
  }
  const sorted = [...routeLengths].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  console.log(`R5-A mechanical route audit (not quality calibration): min=${sorted[0]}, median=${median}, max=${sorted.at(-1)}, hardCapHits=${hardCapHits}, noUseful=${noUseful}, deepening=${deepening}`);
  assert.ok(routeLengths.every((length) => length <= CANDIDATE_ROUTE_HARD_CAP_V3));
});
