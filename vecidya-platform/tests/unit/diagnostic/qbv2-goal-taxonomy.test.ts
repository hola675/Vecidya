import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GOAL_RELEVANCE, GOLDEN_PERSONAS, PRIMARY_GOALS, QUESTION_BANK_V2, ROUTE_HARD_CAP,
  buildQuestionPlan, deriveConstraintsAndPriorities, deriveSemanticFacts, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, scoreContextualDimensions, validateQuestionBankV2,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const goalQuestion = byId.get("q2_goal")!;
const GOALS = [...PRIMARY_GOALS];
const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
const pick = (question: QuestionDefinitionV2) => { const option = question.options.find((item) => item.kind !== "unknown" && item.kind !== "not_applicable" && !item.exclusive) ?? question.options[0]!; return question.type === "multi" ? [option.value] : option.value; };
const resolvedGoal = (answers: Record<string, unknown>) => { const goal = resolveEligibleQuestionsV2(answers as never, QUESTION_BANK_V2).context.primaryGoal; return goal.status === "resolved" ? goal.value : undefined; };
const OPERATING = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "fixed_with_inventory", q2_friction: "visibility" };

test("08E.3 q2_goal exposes exactly the eight engine goals plus unsure, each with option intent metadata", () => {
  assert.deepEqual(goalQuestion.options.map((option) => option.value), ["be_found", "opportunities", "explain", "trust", "stop_losing", "organize", "automate", "measure", "unsure"]);
  assert.deepEqual(new Set(goalQuestion.options.filter((option) => option.kind !== "unknown").map((option) => option.value)), new Set(GOALS));
  for (const option of goalQuestion.options) {
    const production = option.produces?.[0];
    assert.deepEqual(option.kind === "unknown" ? [production?.kind, production?.value] : [production?.kind, production?.value], option.kind === "unknown" ? ["goalUnknown", true] : ["goal", option.value], option.value);
    assert.ok(goalQuestion.helpIntent?.options?.[option.value], `${option.value} keeps its intent`);
  }
  assert.deepEqual(validateQuestionBankV2(QUESTION_BANK_V2), []);
  assert.equal(QUESTION_BANK_V2.filter((question) => !question.purpose.includes("confirmation")).length, 85, "expanding a goal adds no productive question");
});

test("08E.3 every goal resolves as context and opens an evidence need on a relevant dimension; unsure fabricates none", () => {
  // No friction declared, so a shared dimension is never claimed by the (stronger) friction need first.
  const { q2_friction: _friction, ...withoutFriction } = OPERATING;
  for (const goal of GOALS) {
    assert.equal(resolvedGoal({ ...OPERATING, q2_goal: goal }), goal);
    assert.ok(GOAL_RELEVANCE[goal].length > 0, `${goal} has relevance`);
    const need = buildQuestionPlan({ answers: { ...withoutFriction, q2_goal: goal } as never, bank: QUESTION_BANK_V2 }).materialEvidence.find((item) => item.source === "goal");
    assert.ok(need && GOAL_RELEVANCE[goal].includes(need.dimension), `${goal}: goal need on a relevant dimension`);
  }
  const unsure = { ...OPERATING, q2_goal: "unsure" };
  assert.equal(resolvedGoal(unsure), undefined);
  assert.equal(buildQuestionPlan({ answers: unsure as never, bank: QUESTION_BANK_V2 }).materialEvidence.some((item) => item.source === "goal"), false);
  const scoring = scoreContextualDimensions({ answers: { ...unsure, q2_retail_product_visibility: "no", q2_local_presence_consistency: "no" } as never, context: {}, evidence: [] });
  assert.ok(deriveConstraintsAndPriorities(scoring).constraints.every((item) => item.relevance.goal === "none"), "unsure adds no goal relevance");
});

test("08E.3 generated routes: every declared goal gathers direct evidence on one of its relevant dimensions within 24", () => {
  const stages = [{ q2_has_customers: "yes", q2_regularity: "irregular" }, { q2_has_customers: "yes", q2_regularity: "regular" }];
  const seeds = [...substantive("q2_delivery").map((delivery) => ({ q2_delivery: delivery })), { q2_delivery: "fixed_no_inventory", q2_monetization: "mission" }];
  let routes = 0;
  for (const stage of stages) for (const seed of seeds) for (const goal of GOALS) for (const friction of substantive("q2_friction")) {
    const answers: Record<string, unknown> = { ...stage, ...seed, q2_goal: goal, q2_friction: friction };
    for (let batch = 0; batch <= ROUTE_HARD_CAP; batch += 1) {
      const fresh = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 }).selectedQuestionIds;
      if (fresh.length === 0) break;
      for (const id of fresh) answers[id] = pick(byId.get(id)!);
    }
    routes += 1;
    const label = JSON.stringify({ ...stage, ...seed, goal, friction });
    assert.ok(Object.keys(answers).length <= ROUTE_HARD_CAP, `${label}: hard cap`);
    const dimensions = scoreContextualDimensions({ answers: answers as never, context: {}, evidence: [] }).dimensions;
    const observed = GOAL_RELEVANCE[goal].some((id) => { const item = dimensions.find((dimension) => dimension.id === id)!; return item.applicability === "applicable" && item.confidence.direct > 0; });
    assert.ok(observed, `${label}: goal ${goal} has no direct evidence on ${GOAL_RELEVANCE[goal]}`);
  }
  assert.equal(routes, 960);
});

test("08E.3 a goal is context only: changing it never creates score, evidence or capability facts", () => {
  const answers = { ...OPERATING, q2_retail_product_visibility: "partially", q2_local_presence_consistency: "consistent", q2_local_discovery: "referral", q2_retail_customer_capture: "no", q2_operations_automation_adoption: "some_automated" };
  const capability = (goal: string) => {
    const scoring = scoreContextualDimensions({ answers: { ...answers, q2_goal: goal } as never, context: {}, evidence: [] });
    const facts = deriveSemanticFacts({ answers: { ...answers, q2_goal: goal } as never, scoring, priorities: deriveConstraintsAndPriorities(scoring) });
    return {
      scores: scoring.dimensions.map((item) => [item.id, item.score, item.confidence.direct, item.confidence.supporting]),
      readings: facts.facts.filter((fact) => ["strength", "partial", "weakness"].includes(fact.type)).map((fact) => [fact.id, fact.semanticCode, fact.certainty]).sort(),
    };
  };
  const reference = capability("unsure");
  for (const goal of GOALS) assert.deepEqual(capability(goal), reference, goal);
});

test("08E.3 golden personas only use selectable answers; former unreachable goals travel through the real q2_goal answer", () => {
  for (const persona of GOLDEN_PERSONAS) {
    const execution = runGoldenPersonaPipeline(persona);
    for (const [id, value] of Object.entries(execution.answers)) {
      const question = byId.get(id);
      assert.ok(question, `${persona.id}: unknown question ${id}`);
      for (const item of Array.isArray(value) ? value : [value]) assert.ok(question.options.some((option) => option.value === item), `${persona.id}: ${id}=${item} is not a selectable option`);
    }
    const goal = execution.answers.q2_goal as string;
    assert.equal(resolvedGoal(execution.answers), goal === "unsure" ? undefined : goal, persona.id);
  }
  const goals = Object.fromEntries(["idea_early_stage", "independent_professional", "operations_heavy"].map((id) => [id, resolvedGoal(runGoldenPersonaPipeline(GOLDEN_PERSONAS.find((persona) => persona.id === id)!).answers)]));
  assert.deepEqual(goals, { idea_early_stage: "explain", independent_professional: "trust", operations_heavy: "organize" });
});
