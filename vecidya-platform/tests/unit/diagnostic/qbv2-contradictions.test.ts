import assert from "node:assert/strict";
import { test } from "node:test";

import {
  QUESTION_BANK_V2,
  GOLDEN_QUESTIONS_V2,
  DEFAULT_CONTRADICTION_RULES_V1,
  buildQuestionPlan,
  detectContradictionsV2,
  getTriggeredConfirmations,
  validateContradictionRulesV1,
  type ContradictionRuleV1,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";
import { andV2, archetypeIncludes, eqV2, notV2 } from "../../../app/features/diagnostic/qbv2-rules.ts";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine.ts";

const confirmation = (id: string): QuestionDefinitionV2 => ({
  id,
  version: 1,
  module: "confirmation",
  type: "single",
  prompt: "¿Qué interpretación describe mejor el problema principal?",
  purpose: ["confirmation"],
  priority: "critical",
  contradictionRole: { type: "confirms", targetField: "primaryFriction", note: "Confirma la interpretación de la fricción principal sin mutar la declaración original." },
  appliesWhen: andV2(
    eqV2("q2_friction", "visibility"),
    archetypeIncludes("local_service"),
    eqV2("q2_service_response_speed", "some_lost"),
    eqV2("q2_service_quote_practice", "yes"),
    eqV2("q2_service_quote_followup", "rarely"),
  ),
  options: [
    { value: "visibility", label: "Visibilidad" },
    { value: "follow_up", label: "Seguimiento" },
    { value: "unsure", label: "No estoy seguro" },
  ],
});

const materialRule: ContradictionRuleV1 = {
  id: "test.primary_friction.visibility_follow_up.material",
  priority: 100,
  when: andV2(
    eqV2("q2_friction", "visibility"),
    archetypeIncludes("local_service"),
    eqV2("q2_service_response_speed", "some_lost"),
    eqV2("q2_service_quote_practice", "yes"),
    eqV2("q2_service_quote_followup", "rarely"),
  ),
  materiality: "material",
  affectedConcept: "primaryFriction",
  reasonCode: "primary_friction_competing_strong_evidence",
  confirmationQuestionId: "test_confirmation",
  evidence: [
    { questionId: "q2_friction", optionId: "visibility" },
    { questionId: "q2_service_response_speed", optionId: "some_lost" },
    { questionId: "q2_service_quote_practice", optionId: "yes" },
    { questionId: "q2_service_quote_followup", optionId: "rarely" },
  ],
  confirmationOptions: { decisive: ["visibility", "follow_up"], ambiguous: ["unsure"] },
};

const softRule: ContradictionRuleV1 = {
  id: "test.primary_friction.visibility_follow_up.soft",
  priority: 10,
  when: andV2(eqV2("q2_friction", "visibility"), archetypeIncludes("local_service"), eqV2("q2_service_response_speed", "some_lost"), { op: "in", ref: { question: "q2_service_quote_followup" }, values: ["always", "sometimes"] }),
  materiality: "soft",
  affectedConcept: "primaryFriction",
  reasonCode: "primary_friction_tension_needs_more_evidence",
  evidence: [
    { questionId: "q2_friction", optionId: "visibility" },
    { questionId: "q2_service_response_speed", optionId: "some_lost" },
    { questionId: "q2_service_quote_followup", optionId: "always" },
    { questionId: "q2_service_quote_followup", optionId: "sometimes" },
  ],
};

const rules = [materialRule, softRule] as const;
const bank = [...QUESTION_BANK_V2, confirmation("test_confirmation")];
const contradictoryAnswers = {
  q2_friction: "visibility",
  q2_delivery: "travels",
  q2_has_customers: "yes",
  q2_regularity: "regular",
  q2_service_response_speed: "some_lost",
  q2_service_quote_practice: "yes",
  q2_service_quote_followup: "rarely",
};

test("contradiction registry validates stable IDs, references, materiality and confirmation options", () => {
  assert.deepEqual(validateContradictionRulesV1(rules, bank), []);
  assert.deepEqual(validateContradictionRulesV1(DEFAULT_CONTRADICTION_RULES_V1, [...QUESTION_BANK_V2, ...GOLDEN_QUESTIONS_V2]), []);
  assert.equal(validateContradictionRulesV1([{ ...materialRule, id: materialRule.id }, materialRule], bank).some((issue) => issue.code === "DUPLICATE_RULE_ID"), true);
  assert.equal(validateContradictionRulesV1([{ ...materialRule, when: eqV2("q2_friction", "not-a-real-option") }], bank).some((issue) => issue.code === "INVALID_WHEN_OPTION"), true);
  assert.equal(validateContradictionRulesV1([{ ...materialRule, confirmationOptions: { decisive: ["unsure"], ambiguous: ["unsure"] } }], bank).some((issue) => issue.code === "OVERLAPPING_CONFIRMATION_OPTIONS"), true);
});

test("active evidence detects one material contradiction in deterministic order and triggers one confirmation", () => {
  const result = resolveEligibleQuestionsV2(contradictoryAnswers, bank);
  const contradictions = detectContradictionsV2({ result, bank, rules });
  assert.deepEqual(contradictions.map((item) => item.ruleId), [materialRule.id]);
  assert.equal(contradictions[0]?.materiality, "material");
  assert.deepEqual(getTriggeredConfirmations(contradictions), ["test_confirmation"]);
  assert.deepEqual(contradictions[0]?.evidenceRefs, materialRule.evidence);
  assert.deepEqual(detectContradictionsV2({ result, bank, rules: [...rules].reverse() }), contradictions);
});

test("production bank preserves material contradiction trace while serving zero fixture-only confirmations", () => {
  const result = resolveEligibleQuestionsV2(contradictoryAnswers, QUESTION_BANK_V2);
  const contradictions = detectContradictionsV2({ result, bank: QUESTION_BANK_V2 });
  assert.deepEqual(contradictions.map((item) => item.ruleId), ["primary_friction.visibility_vs_follow_up.material"]);
  assert.deepEqual(getTriggeredConfirmations(contradictions), ["q2_confirm_primary_friction"]);
  const plan = buildQuestionPlan({ answers: contradictoryAnswers, bank: QUESTION_BANK_V2 });
  assert.deepEqual(plan.triggeredConfirmationIds, []);
  assert.equal(plan.completion.reason.includes("confirmation_required"), false);
});

test("soft tension is traceable but never triggers confirmation", () => {
  const result = resolveEligibleQuestionsV2({ ...contradictoryAnswers, q2_service_quote_followup: "always" }, bank);
  const contradictions = detectContradictionsV2({ result, bank, rules });
  assert.deepEqual(contradictions.map((item) => item.materiality), ["soft"]);
  assert.deepEqual(getTriggeredConfirmations(contradictions), []);
});

test("missing upstream evidence does not create a soft contradiction", () => {
  const result = resolveEligibleQuestionsV2({ ...contradictoryAnswers, q2_service_quote_practice: "no", q2_service_quote_followup: undefined }, bank);
  const contradictions = detectContradictionsV2({ result, bank, rules });
  assert.deepEqual(contradictions, []);
});

test("unknown follow-up evidence does not create a soft contradiction", () => {
  const result = resolveEligibleQuestionsV2({ ...contradictoryAnswers, q2_service_quote_followup: "unknown" }, bank);
  const contradictions = detectContradictionsV2({ result, bank, rules });
  assert.deepEqual(contradictions, []);
});

test("confirmation is trigger-only: an unreferenced confirmation in the bank is never selected", () => {
  const plan = buildQuestionPlan({ answers: {}, bank, contradictionRules: rules, budget: { targetMin: 0, targetMax: 2, hardMax: 2, confirmationReserve: 2, moduleMax: { confirmation: 2 } } });
  assert.equal(plan.selectedQuestionIds.includes("test_confirmation"), false);
  assert.deepEqual(plan.triggeredConfirmationIds, []);
});

test("confirmation answer is semantic evidence, preserves the original answer and stops retriggering", () => {
  const first = buildQuestionPlan({ answers: contradictoryAnswers, bank, contradictionRules: rules, budget: { targetMin: 0, targetMax: 18, hardMax: 18, confirmationReserve: 2, moduleMax: { confirmation: 2 } } });
  assert.equal(first.selectedQuestionIds.includes("test_confirmation"), true);
  const answered = { ...contradictoryAnswers, test_confirmation: "follow_up" };
  const second = buildQuestionPlan({ answers: answered, bank, contradictionRules: rules, budget: first.budget });
  assert.equal(second.triggeredConfirmationIds.includes("test_confirmation"), false);
  assert.equal(answered.test_confirmation, "follow_up");
  assert.equal(answered.q2_friction, "visibility");
});

test("upstream invalidation deactivates prior confirmation without deleting the raw answer", () => {
  const answered = { ...contradictoryAnswers, test_confirmation: "follow_up" };
  const plan = buildQuestionPlan({ answers: answered, bank, contradictionRules: rules, budget: { targetMin: 0, targetMax: 18, hardMax: 18, confirmationReserve: 2, moduleMax: { confirmation: 2 } } });
  const changed = buildQuestionPlan({ answers: { ...answered, q2_service_response_speed: "fast" }, bank, contradictionRules: rules, budget: plan.budget });
  assert.equal(changed.triggeredConfirmationIds.includes("test_confirmation"), false);
  assert.equal(changed.selectedQuestionIds.includes("test_confirmation"), false);
  assert.equal(resolveEligibleQuestionsV2({ ...answered, q2_service_response_speed: "fast" }, bank).activeAnswers.test_confirmation, undefined);
  assert.equal(answered.test_confirmation, "follow_up");
  assert.equal(changed.completion.reason.includes("confirmation_invalidated"), true);
});

test("three material contradictions select at most two confirmations in deterministic priority order", () => {
  const bank3 = [...QUESTION_BANK_V2, confirmation("test_confirmation_a"), confirmation("test_confirmation_b"), confirmation("test_confirmation_c")];
  const rules3 = ["a", "b", "c"].map((suffix, index) => ({ ...materialRule, id: `test.material.${suffix}`, priority: 100 - index, confirmationQuestionId: `test_confirmation_${suffix}`, confirmationOptions: materialRule.confirmationOptions })) as ContradictionRuleV1[];
  const plan = buildQuestionPlan({ answers: contradictoryAnswers, bank: bank3, contradictionRules: rules3, budget: { targetMin: 0, targetMax: 18, hardMax: 18, confirmationReserve: 2, moduleMax: { confirmation: 2 } } });
  assert.deepEqual(plan.triggeredConfirmationIds, ["test_confirmation_a", "test_confirmation_b"]);
  assert.equal(plan.selectedQuestionIds.filter((id) => id.startsWith("test_confirmation_")).length, 2);
  assert.ok(plan.routeLength <= 18);
});

test("an ambiguous confirmation resolves the active conflict without looping", () => {
  const first = buildQuestionPlan({ answers: contradictoryAnswers, bank, contradictionRules: rules });
  const answered = buildQuestionPlan({ answers: { ...contradictoryAnswers, test_confirmation: "unsure" }, bank, contradictionRules: rules, budget: first.budget });
  assert.equal(answered.triggeredConfirmationIds.length, 0);
  assert.equal(answered.contradictions[0]?.status, "remains_ambiguous");
  assert.equal(answered.completion.reason.includes("confirmation_required"), false);
  assert.equal(answered.completion.reason.includes("confirmation_ambiguous"), true);
  const invalid = buildQuestionPlan({ answers: { ...contradictoryAnswers, test_confirmation: "bogus" }, bank, contradictionRules: rules, budget: first.budget });
  assert.equal(invalid.contradictions[0]?.status, "remains_ambiguous");
});

test("a pending confirmation never leaves a hard-capped plan blocked without a next question", () => {
  const plan = buildQuestionPlan({ answers: contradictoryAnswers, bank, contradictionRules: rules, budget: { targetMin: 0, targetMax: 7, hardMax: 7, confirmationReserve: 2, moduleMax: { confirmation: 2 } } });
  assert.equal(plan.selectedQuestionIds.length, 0);
  assert.equal(plan.nextQuestionId, undefined);
  assert.equal(plan.completion.ready, true);
  assert.equal(plan.completion.reason.includes("confirmation_required"), false);
});

test("hybrid, mixed, unknown, N/A and partial evidence are near misses", () => {
  const cases = [
    { q2_friction: "visibility", q2_delivery: ["solo_practice", "scheduled"], q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "unknown" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_service_response_speed: "unknown" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_service_response_speed: "some_lost", q2_service_quote_practice: "yes", q2_service_quote_followup: "always" },
  ];
  for (const answers of cases) {
    const result = resolveEligibleQuestionsV2(answers, bank);
    const contradictions = detectContradictionsV2({ result, bank, rules });
    assert.deepEqual(getTriggeredConfirmations(contradictions), []);
  }
});

test("08B.4 normal personas remain confirmation-free and bounded", () => {
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
  assert.equal(plans.length, 20);
  assert.ok(plans.every((plan) => plan.triggeredConfirmationIds.length === 0 && plan.routeLength <= 18));
});

test("near-miss matrix has zero unexpected confirmations", () => {
  const nearMisses = [
    { q2_friction: "visibility", q2_delivery: ["solo_practice", "scheduled"], q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_customer_reach: "mixed" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_process_systemization: "partial" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "unknown" },
    { q2_friction: "visibility", q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_appointments_rebooking: "not_applicable" },
    { q2_friction: "visibility", q2_delivery: "audience_content", q2_monetization: "own_audience", q2_has_customers: "yes" },
    { q2_friction: "visibility", q2_delivery: ["audience_content", "online_checkout"], q2_has_customers: "yes", q2_regularity: "regular" },
    { q2_friction: "visibility", q2_delivery: "fixed_no_inventory", q2_monetization: "mission", q2_nonprofit_support_type: "membership" },
    { q2_friction: "visibility", q2_delivery: "b2b_pipeline", q2_customer_reach: "local", q2_has_customers: "yes" },
    { q2_friction: "visibility", q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_service_response_speed: "some_lost", q2_service_quote_practice: "no" },
  ];
  const plans = nearMisses.map((answers) => buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 }));
  assert.equal(plans.length, 10);
  assert.ok(plans.every((plan) => plan.triggeredConfirmationIds.length === 0));
});

test("material and soft persona report route lengths before/after confirmation", () => {
  const productionWithFixture = [...QUESTION_BANK_V2, GOLDEN_QUESTIONS_V2.find((question) => question.id === "q2_confirm_primary_friction")!];
  const material = buildQuestionPlan({ answers: contradictoryAnswers, bank: productionWithFixture });
  const answered = buildQuestionPlan({ answers: { ...contradictoryAnswers, q2_confirm_primary_friction: "follow_up" }, bank: productionWithFixture });
  const soft = buildQuestionPlan({ answers: { ...contradictoryAnswers, q2_service_quote_followup: "always" }, bank: productionWithFixture });
  assert.deepEqual(material.contradictions.map((item) => [item.ruleId, item.materiality]), [["primary_friction.visibility_vs_follow_up.material", "material"]]);
  assert.equal(material.triggeredConfirmationIds.length, 1);
  assert.equal(answered.triggeredConfirmationIds.length, 0);
  assert.equal(answered.contradictions[0]?.status, "confirmed");
  assert.ok(material.routeLength <= 18 && answered.routeLength <= 18 && soft.routeLength <= 18);
  assert.equal(soft.triggeredConfirmationIds.length, 0);
});
