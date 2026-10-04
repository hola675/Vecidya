import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  ANSWER_SEMANTICS, DEFAULT_ROUTE_BUDGET_V1, DIGITAL_DIMENSION_IDS, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, FRICTION_RELEVANCE, GOAL_RELEVANCE, GOLDEN_PERSONAS, QUESTION_BANK_V2, ROUTE_HARD_CAP,
  buildQuestionPlan, deriveContextualEvidence, deriveConstraintsAndPriorities, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, scoreContextualDimensions, validateAnswerSemantics, validateQuestionBankV2,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const isDirect = (id: string, dimension: string) => (EVIDENCE_MAPPING[id]?.dimensions as readonly string[] | undefined)?.includes(dimension) && (EVIDENCE_DIRECTNESS[id]?.[dimension as never] ?? EVIDENCE_MAPPING[id]!.semanticRole) === "direct";
const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
const answerFor = (question: QuestionDefinitionV2) => { const option = question.options.find((item) => item.kind !== "unknown" && item.kind !== "not_applicable" && !item.exclusive) ?? question.options[0]!; return question.type === "multi" ? [option.value] : option.value; };

function storedAnswers(directory: string, filename: string): Record<string, string> {
  const markdown = readFileSync(join(process.cwd(), "..", "artifacts", "diagnostic-v3-calibration", directory, filename), "utf8");
  return Object.fromEntries([...markdown.matchAll(/\|\s*\d+\s*\|\s*(q2_[a-z0-9_]+)<br>[\s\S]*?\|\s*[^|]*?\[([^\]]+)\]\s*\|/g)].map((match) => [match[1], match[2]]));
}

const storedBaselineAnswers = {
  axispro: storedAnswers("case-05-axispro", "case-05.md"),
  vitalCare: storedAnswers("case-03-vitalcare", "case-03.md"),
  mercadoVerde: storedAnswers("case-04-mercado-verde", "case-04.md"),
  mariaPena: storedAnswers("case-02-maria-pena-fotografia", "case-02.md"),
  nativaHome: storedAnswers("case-06-nativa-home", "case-06.md"),
};

function replayWithBudget(initial: Record<string, string>, hardMax = ROUTE_HARD_CAP) {
  let answers = { ...initial };
  for (let step = 0; step < 8; step += 1) {
    const plan = buildQuestionPlan({ answers, bank: QUESTION_BANK_V2, budget: { ...DEFAULT_ROUTE_BUDGET_V1, hardMax } });
    if (plan.completion.ready || !plan.nextQuestionId) return plan;
    const question = byId.get(plan.nextQuestionId)!;
    answers = { ...answers, [question.id]: answerFor(question) as string };
  }
  return buildQuestionPlan({ answers, bank: QUESTION_BANK_V2, budget: { ...DEFAULT_ROUTE_BUDGET_V1, hardMax } });
}

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

test("FIX-03A Nativa baseline requires deepening instead of final completion", () => {
  const plan = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  assert.equal(plan.routeLength, 19);
  assert.equal(plan.completion.ready, false);
  assert.ok(plan.completion.reason.includes("deepening_required"));
  assert.deepEqual(plan.evidenceSufficiency.unresolvedDimensions, ["clarity_positioning", "digital_foundation", "discovery", "trust_reputation", "relationship_recurrence"]);
  assert.equal(plan.evidenceSufficiency.usefulQuestionsRemaining, true);
});

test("FIX-03B Nativa selects one direct question for an unresolved dimension", () => {
  const plan = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  assert.equal(plan.selectedQuestionIds.length, 1);
  assert.ok(plan.evidenceSufficiency.unresolvedDimensions.some((dimension) => isDirect(plan.selectedQuestionIds[0]!, dimension)));
  assert.equal(plan.nextQuestionId, plan.selectedQuestionIds[0]);
});

test("FIX-03C Nativa follow-up is not silently N/A when operational behavior is established", () => {
  const answers = storedBaselineAnswers.nativaHome;
  const resolved = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  const scoring = scoreContextualDimensions({ answers, context: resolved.context, evidence: deriveContextualEvidence(answers, QUESTION_BANK_V2), bank: QUESTION_BANK_V2 });
  const followUp = scoring.dimensions.find((dimension) => dimension.id === "relationship_recurrence")!;
  assert.notEqual(followUp.applicability, "not_applicable");
  assert.equal(followUp.applicabilityReason, "operational_signal_overrides_starting_n_a");
});

test("FIX-03C completion exposes one terminal reason", () => {
  const plan = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  assert.equal(plan.completion.terminalReason, "deepening_required");
  const capped = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2, budget: { ...DEFAULT_ROUTE_BUDGET_V1, hardMax: Object.keys(storedBaselineAnswers.nativaHome).length } });
  assert.equal(capped.completion.terminalReason, "absolute_hard_cap_reached");
});

test("FIX-03B recomputes candidates after the deepening answer", () => {
  const first = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  const question = byId.get(first.nextQuestionId!)!;
  const answer = answerFor(question);
  const next = buildQuestionPlan({ answers: { ...storedBaselineAnswers.nativaHome, [question.id]: answer }, bank: QUESTION_BANK_V2 });
  assert.notEqual(next.nextQuestionId, first.nextQuestionId);
  assert.ok(next.routeLength > first.routeLength);
});

test("FIX-03A strong, boundary and control baselines use the evidence gate", () => {
  const axispro = buildQuestionPlan({ answers: storedBaselineAnswers.axispro, bank: QUESTION_BANK_V2 });
  const mercadoVerde = buildQuestionPlan({ answers: storedBaselineAnswers.mercadoVerde, bank: QUESTION_BANK_V2 });
  const mariaPena = buildQuestionPlan({ answers: storedBaselineAnswers.mariaPena, bank: QUESTION_BANK_V2 });
  assert.equal(axispro.completion.ready, false, "AxisPro 6/8 must deepen");
  assert.ok(axispro.evidenceSufficiency.usefulQuestionsRemaining);
  assert.equal(mercadoVerde.completion.ready, false, "Mercado Verde 69% must stabilize its missing area");
  assert.ok(mercadoVerde.evidenceSufficiency.bandInstability);
  assert.ok(mercadoVerde.evidenceSufficiency.lowEvidenceBlockers.length > 0, "near-band low evidence is exposed as a material blocker");
  assert.equal(mariaPena.completion.ready, true, "María Peña has no unresolved applicable dimension");
  assert.equal(mariaPena.selectedQuestionIds.length, 0, "María Peña does not deepen for unused eligible questions");
});

test("FIX-03B prioritizes direct unresolved evidence for AxisPro and Mercado Verde", () => {
  const axispro = buildQuestionPlan({ answers: storedBaselineAnswers.axispro, bank: QUESTION_BANK_V2 });
  const mercadoVerde = buildQuestionPlan({ answers: storedBaselineAnswers.mercadoVerde, bank: QUESTION_BANK_V2 });
  assert.equal(axispro.selectedQuestionIds.length, 1);
  assert.ok(axispro.evidenceSufficiency.unresolvedDimensions.some((dimension) => isDirect(axispro.selectedQuestionIds[0]!, dimension)));
  assert.equal(mercadoVerde.selectedQuestionIds.length, 1);
  assert.ok(mercadoVerde.evidenceSufficiency.unresolvedDimensions.some((dimension) => isDirect(mercadoVerde.selectedQuestionIds[0]!, dimension)));
});

test("FIX-03B hard cap completes explicitly without claiming evidence sufficiency", () => {
  const capped = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2, budget: { ...DEFAULT_ROUTE_BUDGET_V1, hardMax: Object.keys(storedBaselineAnswers.nativaHome).length } });
  assert.equal(capped.completion.ready, true);
  assert.ok(capped.completion.reason.includes("absolute_hard_cap_reached"));
});

test("FIX-03D VitalCare reaches no-useful-questions at the existing cap and higher requests clamp", () => {
  const at24 = replayWithBudget(storedBaselineAnswers.vitalCare, 24);
  const requested28 = replayWithBudget(storedBaselineAnswers.vitalCare, 28);
  assert.equal(at24.completion.terminalReason, "no_useful_questions");
  assert.equal(at24.completion.hardCapReached, true);
  assert.equal(requested28.routeLength, at24.routeLength);
  assert.equal(requested28.completion.terminalReason, at24.completion.terminalReason);
});

test("FIX-03B selection is deterministic for an identical deepening state", () => {
  const first = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  const second = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  assert.deepEqual(first.selectedQuestionIds, second.selectedQuestionIds);
});

test("FIX-03A exposes low-evidence and contradiction signals without changing scores", () => {
  const plan = buildQuestionPlan({ answers: storedBaselineAnswers.nativaHome, bank: QUESTION_BANK_V2 });
  const sufficiency = plan.evidenceSufficiency;
  assert.ok(sufficiency.lowEvidenceDimensions.length > 0);
  assert.equal(sufficiency.unresolvedContradictions.length, 0);
  assert.equal(Math.round(plan.evidenceSufficiency.currentScore!), 81);
});
