import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANSWER_SEMANTICS, DIGITAL_DIMENSION_IDS, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, FRICTION_RELEVANCE, GOAL_RELEVANCE, GOLDEN_PERSONAS, QUESTION_BANK_V2, ROUTE_HARD_CAP,
  buildQuestionPlan, deriveConstraintsAndPriorities, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, scoreContextualDimensions, validateAnswerSemantics, validateQuestionBankV2,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const isDirect = (id: string, dimension: string) => (EVIDENCE_MAPPING[id]?.dimensions as readonly string[] | undefined)?.includes(dimension) && (EVIDENCE_DIRECTNESS[id]?.[dimension as never] ?? EVIDENCE_MAPPING[id]!.semanticRole) === "direct";
const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
const answerFor = (question: QuestionDefinitionV2) => { const option = question.options.find((item) => item.kind !== "unknown" && item.kind !== "not_applicable" && !item.exclusive) ?? question.options[0]!; return question.type === "multi" ? [option.value] : option.value; };

test("08E.1 bank completion: two direct, material-only questions close Clarity and Foundation gaps", () => {
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(validateQuestionBankV2(QUESTION_BANK_V2), []);
  assert.deepEqual(validateAnswerSemantics(), []);
  for (const [id, dimension] of [["q2_presence_offer_clarity", "clarity_positioning"], ["q2_presence_digital_base", "digital_foundation"]] as const) {
    const question = byId.get(id)!;
    assert.equal(question.module, "presence");
    assert.equal(question.appliesWhen, undefined, `${id} never enters a base route`);
    assert.ok(question.materialAppliesWhen && question.helpIntent && ANSWER_SEMANTICS[id] && isDirect(id, dimension), id);
  }
  assert.equal(ANSWER_SEMANTICS.q2_presence_digital_base?.values.third_party_only, "dependency", "rented profiles are a dependency, not an own base");
});

test("08E.1 production-reachable audit: every material applicable dimension can be observed directly (outside pre-launch)", () => {
  const seeds = [...substantive("q2_delivery").map((delivery) => ({ q2_delivery: delivery })), { q2_delivery: "fixed_no_inventory", q2_monetization: "mission" }];
  const stages = [{ q2_has_customers: "yes", q2_regularity: "irregular" }, { q2_has_customers: "yes", q2_regularity: "regular" }];
  let routes = 0;
  for (const stage of stages) for (const seed of seeds) for (const goal of byId.get("q2_goal")!.options.map((option) => option.value)) for (const friction of substantive("q2_friction")) {
    const answers: Record<string, unknown> = { ...stage, ...seed, q2_goal: goal, q2_friction: friction };
    for (let batch = 0; batch < ROUTE_HARD_CAP; batch += 1) {
      const fresh = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 }).selectedQuestionIds.filter((id) => answers[id] === undefined);
      if (fresh.length === 0) break;
      for (const id of fresh) answers[id] = answerFor(byId.get(id)!);
    }
    routes += 1;
    const label = JSON.stringify({ ...seed, goal, friction, regularity: stage.q2_regularity });
    assert.ok(Object.keys(answers).length <= ROUTE_HARD_CAP, `${label}: hard cap`);
    const resolved = resolveEligibleQuestionsV2(answers as never, QUESTION_BANK_V2);
    const scoring = scoreContextualDimensions({ answers: answers as never, context: {}, evidence: [] });
    const prerequisites = new Set(deriveConstraintsAndPriorities(scoring).constraints.filter((item) => item.kind === "evidence_gap" && item.dependency.blocks.length > 0).map((item) => item.dimension));
    const g = resolved.context.primaryGoal.status === "resolved" ? resolved.context.primaryGoal.value : undefined;
    const f = resolved.context.primaryFriction.status === "resolved" ? resolved.context.primaryFriction.value : undefined;
    for (const dimension of DIGITAL_DIMENSION_IDS) {
      if (scoring.dimensions.find((item) => item.id === dimension)!.applicability !== "applicable") continue;
      const material = (g && GOAL_RELEVANCE[g][0] === dimension) || (f && FRICTION_RELEVANCE[f][0] === dimension) || prerequisites.has(dimension);
      if (!material) continue;
      const observable = QUESTION_BANK_V2.some((question) => isDirect(question.id, dimension) && (resolved.eligibleQuestionIds.includes(question.id) || resolved.activeAnswers[question.id] !== undefined));
      assert.ok(observable, `${label}: material ${dimension} has no observable direct question`);
    }
  }
  assert.equal(routes, 1080, "08E.3: nine selectable goal answers");
});

test("08E.1 routing: material extras never displace base questions; unused material scopes do not block completion", () => {
  const retail = runGoldenPersonaPipeline(GOLDEN_PERSONAS.find((persona) => persona.id === "physical_retail")!);
  assert.ok(retail.selectedQuestionIds.includes("q2_local_presence_consistency"), "a base question unlocked after tail evidence is still asked");
  assert.ok(retail.selectedQuestionIds.includes("q2_operations_automation_adoption"), "readiness prerequisite reached through its material scope");
  const plan = buildQuestionPlan({ answers: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "travels" }, bank: QUESTION_BANK_V2 });
  const unused = plan.trace.filter((entry) => !entry.selected && entry.skipReason === "material_not_needed").map((entry) => entry.questionId);
  assert.ok(unused.includes("q2_presence_offer_clarity") && unused.includes("q2_presence_digital_base"), "eligible as material evidence only, with no open need");
  assert.ok(plan.completion.ready || plan.nextQuestionId !== undefined);
});
