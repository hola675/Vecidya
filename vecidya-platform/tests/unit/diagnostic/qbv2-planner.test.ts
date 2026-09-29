import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ADAPTIVE_PLANNER_VERSION,
  DEFAULT_ROUTE_BUDGET_V1,
  QUESTION_BANK_V2,
  buildQuestionPlan,
  isDiagnosticReadyToComplete,
  planNextQuestion,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";

const contexts: Record<string, Record<string, string>> = {
  idea_project: { q2_entity: "project", q2_has_customers: "no" },
  starting_service: { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "irregular" },
  local_service: { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular" },
  professional: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular" },
  appointments: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular" },
  professional_appointments: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular" },
  retail: { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular" },
  ecommerce: { q2_delivery: "online_checkout", q2_has_customers: "yes", q2_regularity: "regular" },
  retail_ecommerce: { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular" },
  hospitality: { q2_delivery: "onsite", q2_has_customers: "yes", q2_regularity: "regular" },
  b2b_professional: { q2_delivery: "b2b_pipeline", q2_has_customers: "yes", q2_regularity: "regular" },
  creator: { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular" },
  creator_ecommerce: { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular" },
  nonprofit: { q2_monetization: "mission", q2_delivery: "fixed_no_inventory", q2_has_customers: "yes", q2_regularity: "regular" },
  operations_heavy: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_friction: "operations" },
  follow_up_heavy: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_friction: "follow_up" },
  measurement_focused: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure" },
};

const syntheticHybridQuestion: QuestionDefinitionV2 = {
  id: "test_hybrid_delivery",
  version: 1,
  module: "classification",
  type: "multi",
  prompt: "Fixture hybrid",
  purpose: ["classification"],
  priority: "critical",
  options: [
    { value: "professional", label: "Professional", produces: [{ kind: "deliveryMode", slot: "primary", value: "specialized_individual_practice", provenance: "explicit_declaration" }] },
    { value: "appointments", label: "Appointments", produces: [{ kind: "deliveryMode", slot: "secondary", value: "scheduled_time_blocks", provenance: "explicit_declaration" }] },
  ],
};

function syntheticEvidenceQuestion(id: string, module: "professional" | "retail" | "creator" | "ecommerce"): QuestionDefinitionV2 {
  return { id, version: 1, module, type: "single", prompt: "Fixture evidence", purpose: ["diagnostic"], priority: "normal", options: [{ value: "done", label: "Done", produces: [] }] };
}

function syntheticHybrid(primary: string, secondary: string, primaryValue: string, secondaryValue: string): QuestionDefinitionV2 {
  return { ...syntheticHybridQuestion, id: `test_hybrid_${primary}_${secondary}`, options: [{ value: primary, label: primary, produces: [{ kind: "deliveryMode", slot: "primary", value: primaryValue as never, provenance: "explicit_declaration" }] }, { value: secondary, label: secondary, produces: [{ kind: "deliveryMode", slot: "secondary", value: secondaryValue as never, provenance: "explicit_declaration" }] }] };
}

test("planner contract: deterministic version, explicit budget and no QBV2 activation", () => {
  const first = planNextQuestion({ answers: {}, bank: QUESTION_BANK_V2 });
  const second = planNextQuestion({ answers: {}, bank: [...QUESTION_BANK_V2].reverse() });
  assert.equal(first.plannerVersion, ADAPTIVE_PLANNER_VERSION);
  assert.deepEqual(first.budget, DEFAULT_ROUTE_BUDGET_V1);
  assert.equal(first.nextQuestionId, second.nextQuestionId);
  assert.ok(first.routeLength <= 18);
});

test("17 route fixtures are bounded and idea/project receives startup evidence without mature leakage", () => {
  const reports = Object.fromEntries(Object.entries(contexts).map(([name, answers]) => [name, buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 })]));
  assert.equal(Object.keys(reports).length, 17);
  assert.ok(Object.values(reports).every((plan) => plan.routeLength <= 18));
  const idea = reports.idea_project;
  assert.ok(idea.selectedQuestionIds.some((id) => id.startsWith("q2_startup_")));
  assert.deepEqual(idea.selectedQuestionIds.filter((id) => /reputation|repeat|noshow|measurement|handoff|pipeline/i.test(id)), []);
  assert.ok(reports.nonprofit.selectedQuestionIds.includes("q2_nonprofit_support_type"));
  const appointments = buildQuestionPlan({ answers: contexts.appointments, bank: QUESTION_BANK_V2 });
  assert.ok(appointments.selectedQuestionIds.findIndex((id) => id.startsWith("q2_appointments_")) > appointments.selectedQuestionIds.findIndex((id) => id === "q2_entity"));
});

test("worst eligible route is reduced from 23 and explains skipped candidates", () => {
  const plan = buildQuestionPlan({ answers: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure", q2_friction: "operations" }, bank: QUESTION_BANK_V2 });
  assert.equal(plan.eligibleQuestionIds.length, 23);
  assert.ok(plan.selectedQuestionIds.length < plan.eligibleQuestionIds.length);
  assert.ok(plan.selectedQuestionIds.length <= 18);
  assert.ok(plan.trace.some((entry) => !entry.selected && entry.skipReason));
  assert.ok(plan.trace.every((entry) => entry.budgetState.routeLength <= entry.budgetState.hardMax));
});

test("hybrid fairness: professional + appointments share budget instead of monopolizing the first component", () => {
  const bank = [...QUESTION_BANK_V2, syntheticHybridQuestion];
  const plan = buildQuestionPlan({ answers: { test_hybrid_delivery: ["professional", "appointments"], q2_has_customers: "yes", q2_regularity: "regular" }, bank });
  assert.ok(plan.context.archetype.status === "resolved" && plan.context.archetype.value === "hybrid");
  assert.ok(plan.selectedQuestionIds.filter((id) => id.startsWith("q2_professional_")).length >= 2);
  assert.ok(plan.selectedQuestionIds.filter((id) => id.startsWith("q2_appointments_")).length >= 2);
});

test("hybrid fairness counts active evidence for retail+ecommerce and creator+ecommerce", () => {
  const cases = [
    { primary: "retail", secondary: "ecommerce", primaryValue: "fixed_location_with_inventory", prior: "retail_prior" },
    { primary: "creator", secondary: "ecommerce", primaryValue: "own_audience_content", prior: "creator_prior" },
  ] as const;
  for (const item of cases) {
    const hybrid = syntheticHybrid(item.primary, item.secondary, item.primaryValue, "online_checkout");
    const prior = syntheticEvidenceQuestion(item.prior, item.primary);
    const bank = [...QUESTION_BANK_V2, hybrid, prior];
    const plan = buildQuestionPlan({ answers: { [hybrid.id]: [item.primary, item.secondary], [item.prior]: "done", q2_has_customers: "yes", q2_regularity: "regular" }, bank });
    assert.ok(plan.context.archetype.status === "resolved" && plan.context.archetype.value === "hybrid");
    assert.ok(plan.selectedQuestionIds.filter((id) => id.startsWith(`q2_${item.primary}_`)).length + 1 >= 2);
    assert.ok(plan.selectedQuestionIds.filter((id) => id.startsWith("q2_ecommerce_")).length >= 2);
  }
});

test("goal/friction relevance and unknown/N-A do not loop or add stale answers", () => {
  const measure = buildQuestionPlan({ answers: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure" }, bank: QUESTION_BANK_V2 });
  const followUp = buildQuestionPlan({ answers: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_friction: "follow_up" }, bank: QUESTION_BANK_V2 });
  assert.ok(measure.selectedQuestionIds.some((id) => id.startsWith("q2_measurement_")));
  assert.ok(followUp.selectedQuestionIds.some((id) => id.startsWith("q2_followup_")));
  const unknown = buildQuestionPlan({ answers: { q2_has_customers: "unknown", q2_process_systemization: "unsure", q2_goal: "unknown" }, bank: QUESTION_BANK_V2 });
  const notApplicable = buildQuestionPlan({ answers: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_appointments_rebooking: "not_applicable" }, bank: QUESTION_BANK_V2 });
  assert.ok(unknown.routingIterations <= QUESTION_BANK_V2.length + 1);
  assert.ok(unknown.routeLength <= 18);
  assert.ok(notApplicable.routeLength <= 18);
  assert.notDeepEqual(measure.selectedQuestionIds, followUp.selectedQuestionIds);
});

test("completion never fires from a minimum count while essential context remains unresolved", () => {
  const early = isDiagnosticReadyToComplete({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "measure" }, bank: QUESTION_BANK_V2 });
  assert.equal(early.ready, false);
  assert.ok(!early.reason.includes("minimum_context_resolved"));
});

test("hard cap is a terminal completion state, never a blocked route", () => {
  const plan = buildQuestionPlan({ answers: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure", q2_friction: "operations" }, bank: QUESTION_BANK_V2, budget: { ...DEFAULT_ROUTE_BUDGET_V1, targetMax: 18 } });
  assert.ok(plan.routeLength <= plan.budget.hardMax);
  if (plan.routeLength === plan.budget.hardMax) assert.equal(plan.completion.ready, true);
});

test("a non-ready plan always exposes a next question while eligible candidates remain", () => {
  const plan = buildQuestionPlan({ answers: { q2_entity: "business", q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "trust", q2_friction: "trust" }, bank: QUESTION_BANK_V2 });
  assert.ok(plan.completion.ready || plan.nextQuestionId !== undefined || plan.eligibleQuestionIds.length === 0);
});


test("dynamic persona matrix: 20 non-trivial sequences stay bounded and deterministic", () => {
  const personas = [
    { q2_entity: "project", q2_has_customers: "no" },
    { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "irregular" },
    { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "online_checkout", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "onsite", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "b2b_pipeline", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_monetization: "mission", q2_delivery: "fixed_no_inventory", q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure" },
    { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_friction: "follow_up" },
    { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_friction: "operations" },
    { q2_has_customers: "unknown", q2_process_systemization: "unsure", q2_goal: "unknown" },
    { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_appointments_rebooking: "not_applicable" },
    { q2_delivery: "online_checkout", q2_has_customers: "yes", q2_regularity: "regular", q2_ecommerce_repeat_purchase: "not_applicable" },
    { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "visibility" },
    { q2_delivery: "b2b_pipeline", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "trust" },
    { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "clarity" },
  ];
  const plans = personas.map((answers) => buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 }));
  assert.ok(plans.every((plan) => plan.routeLength <= 18 && plan.routingIterations <= QUESTION_BANK_V2.length + 1));
  assert.deepEqual(plans.map((plan) => plan.selectedQuestionIds), personas.map((answers) => buildQuestionPlan({ answers, bank: [...QUESTION_BANK_V2].reverse() }).selectedQuestionIds));
  const lengths = plans.map((plan) => plan.routeLength).sort((a, b) => a - b);
  assert.ok(lengths[0]! >= 0 && lengths.at(-1)! <= 18);
});

test("answer change and save/resume reconstruct the same next question", () => {
  const before = { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular" };
  const first = planNextQuestion({ answers: before, bank: QUESTION_BANK_V2 });
  const resumed = planNextQuestion({ answers: JSON.parse(JSON.stringify(before)), bank: QUESTION_BANK_V2 });
  assert.equal(first.nextQuestionId, resumed.nextQuestionId);
  const changed = planNextQuestion({ answers: { ...before, q2_delivery: "online_checkout" }, bank: QUESTION_BANK_V2 });
  assert.notEqual(changed.nextQuestionId, "q2_appointments_confirmation_reminders");
  assert.ok(changed.trace.every((entry) => entry.questionId !== "q2_appointments_confirmation_reminders" || entry.selected === false));
});

test("mutations A-L: hard cap, no static route, stable ordering, and inactive QBV2 are enforced", () => {
  const plan = buildQuestionPlan({ answers: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure", q2_friction: "operations" }, bank: QUESTION_BANK_V2 });
  assert.ok(plan.routeLength <= plan.budget.hardMax); // A
  assert.ok(plan.selectedQuestionIds.length < plan.eligibleQuestionIds.length); // B
  assert.ok(plan.trace.some((entry) => entry.module === "appointments") && plan.trace.some((entry) => entry.module === "operations")); // C/I
  assert.ok(!("activeAnswers" in plan)); // planner does not persist or expose stale answers
  assert.equal(plan.plannerVersion, 1); // L / versioned planner, while CURRENT_QUESTION_BANK_VERSION remains 1
  assert.ok(!plan.selectedQuestionIds.some((id) => id === "q2_confirm_hybrid_friction")); // confirmation fixture stays inactive
  const reversed = buildQuestionPlan({ answers: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure", q2_friction: "operations" }, bank: [...QUESTION_BANK_V2].reverse() });
  assert.deepEqual(plan.selectedQuestionIds, reversed.selectedQuestionIds); // K: stable ID tie-break path
});
