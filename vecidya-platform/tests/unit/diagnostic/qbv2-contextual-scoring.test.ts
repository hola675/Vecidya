import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CAPABILITY_CONTRIBUTION, CONTEXT_ONLY_QUESTION_IDS, DIGITAL_DIMENSIONS, GOLDEN_PERSONAS, analyzeCoverage,
  QUESTION_BANK_V2, buildQuestionPlan, deriveContextualEvidence, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, resolveGoldenPersonaAnswers, scoreContextualDimensions, validateAnswerSemantics,
  type CapabilityState, type ContextualEvidence, type ContextualScoringContext,
} from "../../../app/features/diagnostic/index.ts";

type Role = ContextualEvidence["directness"];
const KIND: Record<CapabilityState, ContextualEvidence["kind"]> = { strong: "established", established: "established", partial: "partial", weak: "partial", missing: "missing", dependency: "dependency", constraint: "constraint", uncertainty: "uncertainty", not_applicable: "not_applicable" };
const observation = (state: CapabilityState, questionId: string, directness: Role = "direct", dimension: ContextualEvidence["dimension"] = "digital_foundation"): ContextualEvidence => ({
  questionId, observationId: questionId, dimension, directness, state, kind: KIND[state], contribution: CAPABILITY_CONTRIBUTION[state], answer: [state],
});
const obs = (spec: string): ContextualEvidence[] => spec.split(" ").filter(Boolean).map((token, index) => {
  const [role, state] = token.split(":") as ["d" | "s" | "c", CapabilityState];
  return observation(state, `q${index}`, role === "d" ? "direct" : role === "s" ? "supporting" : "contextual");
});
const context = (overrides: Partial<ContextualScoringContext> = {}): ContextualScoringContext => ({ answers: {}, context: {}, evidence: [], ...overrides });
const dimension = (input: ContextualScoringContext, id: ContextualEvidence["dimension"] = "digital_foundation") => scoreContextualDimensions(input).dimensions.find((item) => item.id === id)!;
const score = (spec: string) => dimension(context({ evidence: obs(spec) }));

test("08C registers exactly eight dimensions and no overall score", () => {
  const result = scoreContextualDimensions(context());
  assert.deepEqual(result.dimensions.map((item) => item.id), DIGITAL_DIMENSIONS.map((item) => item.id));
  assert.equal("overallScore" in result, false);
});

test("controlled evidence cases: score follows observed semantics, confidence follows evidence quality", () => {
  const cases: readonly { name: string; spec: string; score: number | null; level: "low" | "medium" | "high"; basis: string }[] = [
    { name: "strong consistent direct", spec: "d:strong d:strong d:established", score: 92, level: "high", basis: "direct" },
    { name: "one negative direct", spec: "d:missing", score: 0, level: "low", basis: "direct" },
    { name: "one positive direct, no fake ceiling", spec: "d:strong", score: 100, level: "low", basis: "direct" },
    { name: "two consistent direct", spec: "d:established d:partial", score: 63, level: "medium", basis: "direct" },
    { name: "mixed direct: intermediate, contradiction lowers confidence", spec: "d:strong d:missing", score: 50, level: "low", basis: "direct" },
    { name: "supporting-only never produces a percentage", spec: "s:strong s:strong s:strong", score: null, level: "low", basis: "supporting_only" },
    { name: "contextual evidence carries no capability", spec: "c:strong", score: null, level: "low", basis: "none" },
    { name: "constraint and uncertainty stay outside the score", spec: "d:established d:constraint d:uncertainty", score: 75, level: "low", basis: "direct" },
    { name: "no evidence", spec: "", score: null, level: "low", basis: "none" },
  ];
  for (const item of cases) {
    const result = score(item.spec);
    assert.equal(result.score, item.score, `${item.name}: score`);
    assert.equal(result.confidence.level, item.level, `${item.name}: confidence`);
    assert.equal(result.explainability.basis, item.basis, `${item.name}: basis`);
  }
  const mixed = score("d:strong d:missing");
  assert.deepEqual(mixed.explainability.contradictions, [{ positive: "q0", negative: "q1" }]);
  assert.deepEqual(mixed.confidence.penalties, ["direct_contradiction"]);
  assert.deepEqual(score("d:established d:constraint d:uncertainty").explainability.constraints, ["q1"]);
  assert.deepEqual(score("d:strong").explainability.gaps, ["single_direct_observation"]);
});

test("supporting evidence refines but never dominates direct evidence", () => {
  const oneDirectManySupporting = score("d:strong s:strong s:strong s:strong");
  const twoDirect = score("d:strong d:strong");
  assert.ok(oneDirectManySupporting.confidence.strength < twoDirect.confidence.strength + 0.0001 && oneDirectManySupporting.confidence.level === twoDirect.confidence.level);
  assert.ok(oneDirectManySupporting.score! <= twoDirect.score!);
  // Supporting total weight is capped at half of the direct weight: it can move a partial reading by at most a third.
  assert.equal(score("d:partial s:strong s:strong s:strong").score, 67);
  assert.equal(score("d:partial s:missing s:missing s:missing").score, 33);
});

test("one question is one observation: duplicates and multiselect arrays never add confidence", () => {
  const duplicate = dimension(context({ evidence: [observation("strong", "same"), observation("strong", "same")] }));
  assert.equal(duplicate.evidence.length, 1);
  assert.equal(duplicate.confidence.direct, 1);
  const narrow = deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["search"] });
  const wide = deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["search", "social", "ads", "referral", "search"] });
  for (const derived of [narrow, wide]) assert.equal(derived.filter((item) => item.dimension === "discovery").length, 1);
  assert.deepEqual(wide.find((item) => item.dimension === "discovery")?.answer, ["search", "social", "ads", "referral"]);
  const [narrowResult, wideResult] = [narrow, wide].map((evidence) => dimension(context({ evidence }), "discovery"));
  assert.deepEqual(narrowResult!.confidence, wideResult!.confidence);
  assert.equal(wideResult!.score, null, "traffic sources are supporting-only for discovery");
  assert.equal(wide.find((item) => item.dimension === "measurement_optimization")?.directness, "supporting");
  assert.equal(deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["unknown"] }).find((item) => item.dimension === "measurement_optimization")?.state, "missing", "not knowing the source is a measurement reading");
});

test("every dimension-mapped answer value has a declared semantic state; context-only questions produce no evidence", () => {
  assert.deepEqual(validateAnswerSemantics(), []);
  assert.equal(CONTEXT_ONLY_QUESTION_IDS.size, 22);
  const contextAnswers = { q2_entity: "organization", q2_goal: "explain", q2_friction: "visibility", q2_delivery: "online_checkout", q2_nonprofit_support_type: "donations" };
  assert.deepEqual(deriveContextualEvidence(contextAnswers), []);
  assert.ok(scoreContextualDimensions({ answers: contextAnswers, context: {}, evidence: [] }).dimensions.every((item) => item.score === null));
  const derived = deriveContextualEvidence({ q2_local_presence_consistency: "consistent", q2_creator_channel_concentration: "well_diversified", q2_b2b_sales_cycle: "almost_always" });
  // Canonical bank order (b2b precedes creator in the bank), not the key order of the input.
  assert.deepEqual(derived.map((item) => `${item.questionId}:${item.dimension}:${item.state}`), [
    "q2_local_presence_consistency:digital_foundation:strong", "q2_local_presence_consistency:discovery:strong",
    "q2_b2b_sales_cycle:relationship_recurrence:constraint", "q2_creator_channel_concentration:discovery:strong",
  ]);
});

test("context decides applicability only: goal/friction/stage never change capability math", () => {
  const evidence = obs("d:established d:missing");
  const neutral = dimension(context({ evidence }));
  const prioritized = dimension(context({ evidence, context: { primaryGoal: { status: "resolved", value: "organize", source: "answer" }, primaryFriction: { status: "resolved", value: "operations", source: "answer" }, growthStage: { status: "resolved", value: "growing", source: "signal" } } }));
  assert.equal(neutral.score, prioritized.score);
  assert.deepEqual(neutral.confidence, prioritized.confidence);
  const idea = { growthStage: { status: "resolved", value: "idea", source: "signal" } } as const;
  const measurement = dimension(context({ context: idea, evidence: [observation("missing", "cart", "direct", "measurement_optimization")] }), "measurement_optimization");
  assert.equal(measurement.applicability, "not_applicable");
  assert.equal(measurement.score, null);
  assert.equal(measurement.evidence.length, 1, "evidence stays explainable when the dimension does not apply");
  assert.equal(dimension(context({ context: idea })).applicability, "applicable");
  assert.equal(dimension(context()).applicability, "insufficient_context");
});

test("ecommerce storefront answer is legitimate prior input and scores foundation with limited confidence", () => {
  const persona = GOLDEN_PERSONAS.find((item) => item.id === "ecommerce")!;
  const startingAnswers = { ...persona.answers, ...persona.preexistingAnswers };
  assert.equal(buildQuestionPlan({ answers: startingAnswers, bank: QUESTION_BANK_V2 }).selectedQuestionIds.includes("q2_ecommerce_product_discovery"), false);
  const priorRoute = buildQuestionPlan({ answers: {
    q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: ["stable"],
    q2_sector: "retail", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_delivery: "online_checkout", q2_monetization: "goods",
    q2_goal: "explain", q2_friction: "visibility", q2_ecommerce_cart_visibility: "yes", q2_ecommerce_checkout_friction: "rarely",
    q2_process_systemization: "documented_process", q2_ecommerce_acquisition_dependency: "single_channel", q2_ecommerce_cart_followup: "always",
  }, bank: QUESTION_BANK_V2 });
  assert.ok(priorRoute.selectedQuestionIds.includes("q2_ecommerce_product_discovery"), "a valid prior operating-ecommerce route selects the question");
  const answers = resolveGoldenPersonaAnswers(persona);
  assert.equal(resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2).activeAnswers.q2_ecommerce_traffic_sources, undefined, "traffic sources are not fabricated");
  const foundation = scoreContextualDimensions({ answers, context: {}, evidence: [] }).dimensions.find((item) => item.id === "digital_foundation")!;
  assert.deepEqual(foundation.explainability.direct, ["q2_ecommerce_product_discovery"]);
  assert.equal(foundation.score, 100);
  assert.equal(foundation.confidence.level, "low");
});

test("golden personas run planner → deterministic answers → evidence → scoring with honest nulls", () => {
  const runs = GOLDEN_PERSONAS.map((persona) => {
    const execution = runGoldenPersonaPipeline(persona);
    return { persona, execution, result: scoreContextualDimensions({ answers: execution.answers, context: {}, evidence: [] }) };
  });
  assert.equal(runs.length, 12);
  for (const { persona, execution, result } of runs) {
    const initialAnswers = { ...persona.answers, ...persona.preexistingAnswers };
    const selected = new Set(execution.selectedQuestionIds);
    assert.equal(execution.selectedQuestionIds.length, selected.size, `${persona.id} must not select a route question twice`);
    assert.ok(execution.routeLengths.length > 0 && execution.routeLengths.every((length) => length <= 24), `${persona.id} must stay under the hard cap (24, DIAG-V3-08E.2)`);
    assert.deepEqual(execution.unansweredSelectedQuestionIds, [], `${persona.id} must answer all route-selected questions`);
    assert.ok(Object.keys(persona.answerProfile).every((questionId) => selected.has(questionId) && execution.answers[questionId] === persona.answerProfile[questionId]), `${persona.id} answers only route-selected questions`);
    assert.deepEqual(Object.keys(execution.answers).filter((questionId) => !initialAnswers[questionId] && !selected.has(questionId)), [], `${persona.id} must not invent answers`);
    assert.deepEqual(result, scoreContextualDimensions({ answers: execution.answers, context: {}, evidence: [] }), `${persona.id} scoring is deterministic`);
    for (const item of result.dimensions) {
      if (item.score !== null) assert.ok(item.applicability === "applicable" && item.confidence.direct >= 1 && item.score >= 0 && item.score <= 100, `${persona.id}.${item.id} numeric only from direct evidence`);
      if (item.confidence.direct === 0 || item.applicability !== "applicable") assert.equal(item.score, null, `${persona.id}.${item.id} null without direct evidence or applicability`);
      if (item.confidence.level === "high") assert.ok(item.confidence.direct >= 2, `${persona.id}.${item.id} high confidence needs several direct observations`);
    }
  }
  const applicable = runs.flatMap(({ result }) => result.dimensions.filter((item) => item.applicability === "applicable"));
  const numeric = applicable.filter((item) => item.score !== null);
  assert.ok(numeric.length * 3 > applicable.length, "the diagnostic must stay useful: more than a third of applicable cells are numeric");
  assert.ok(new Set(numeric.map((item) => item.score)).size >= 5, "scores differentiate personas");
});

test("idea context alone does not activate ecommerce; an explicit online-checkout archetype does", () => {
  const persona = GOLDEN_PERSONAS.find((item) => item.id === "idea_early_stage")!;
  const modules = (ids: readonly string[]) => new Set(ids.map((id) => QUESTION_BANK_V2.find((question) => question.id === id)?.module));
  assert.equal(modules(buildQuestionPlan({ answers: persona.answers, bank: QUESTION_BANK_V2 }).eligibleQuestionIds).has("ecommerce"), false);
  const resolvedPlan = buildQuestionPlan({ answers: resolveGoldenPersonaAnswers(persona), bank: QUESTION_BANK_V2 });
  assert.equal(resolvedPlan.context.growthStage.status === "resolved" && resolvedPlan.context.growthStage.value, "idea");
  assert.equal(resolvedPlan.context.archetype.status === "resolved" && resolvedPlan.context.archetype.value, "ecommerce");
  // The route actually asks ecommerce-module questions once the archetype resolves (answered ones leave the eligible list).
  assert.equal(modules(runGoldenPersonaPipeline(persona).selectedQuestionIds).has("ecommerce"), true);
});

test("08C keeps the 08B coverage matrix free of confirmed gaps", () => assert.deepEqual(analyzeCoverage().confirmedGaps, []));
