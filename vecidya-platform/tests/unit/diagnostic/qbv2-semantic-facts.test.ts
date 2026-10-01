import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CAPABILITY_CONTRIBUTION, FACT_IMPORTANCE, GOLDEN_PERSONAS, deriveConstraintsAndPriorities, deriveSemanticFacts, runGoldenPersonaPipeline, scoreContextualDimensions,
  type CapabilityState, type ContextualEvidence, type ContextualScoringContext, type SemanticDiagnosticFacts,
} from "../../../app/features/diagnostic/index.ts";

const KIND: Record<CapabilityState, ContextualEvidence["kind"]> = { strong: "established", established: "established", partial: "partial", weak: "partial", missing: "missing", dependency: "dependency", constraint: "constraint", uncertainty: "uncertainty", not_applicable: "not_applicable" };
const obs = (dimension: ContextualEvidence["dimension"], states: readonly CapabilityState[]): ContextualEvidence[] => states.map((state, index) => ({
  questionId: `${dimension}_q${index}`, observationId: `${dimension}_q${index}`, dimension, directness: "direct", state, kind: KIND[state], contribution: CAPABILITY_CONTRIBUTION[state], answer: [state],
}));
const resolved = (value: string) => ({ status: "resolved", value, source: "answer" }) as const;
const facts = (evidence: ContextualEvidence[], context: ContextualScoringContext["context"] = { growthStage: resolved("operating") as never }) => {
  const scoring = scoreContextualDimensions({ answers: {}, context, evidence });
  const priorities = deriveConstraintsAndPriorities(scoring);
  return { scoring, priorities, result: deriveSemanticFacts({ answers: {}, scoring, priorities }) };
};
const fact = (result: SemanticDiagnosticFacts, id: string) => result.facts.find((item) => item.id === id);
const golden = (id: string) => {
  const answers = runGoldenPersonaPipeline(GOLDEN_PERSONAS.find((persona) => persona.id === id)!).answers;
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  return { scoring, priorities, result: deriveSemanticFacts({ answers, scoring, priorities }) };
};

test("08E capability readings: certainty needs more than a score; null never becomes weakness", () => {
  const cases: readonly { states: readonly CapabilityState[]; id: string; code: string; certainty: string }[] = [
    { states: ["strong"], id: "strength:discovery", code: "discoverable", certainty: "signal" },
    { states: ["strong", "strong", "established"], id: "strength:discovery", code: "discoverable", certainty: "confirmed" },
    { states: ["missing"], id: "weakness:discovery", code: "hard_to_discover", certainty: "likely" },
    { states: ["missing", "weak"], id: "weakness:discovery", code: "hard_to_discover", certainty: "confirmed" },
    { states: ["partial", "partial"], id: "partial:discovery", code: "limited_discovery", certainty: "confirmed" },
    { states: ["strong", "missing"], id: "partial:discovery", code: "limited_discovery", certainty: "likely" },
  ];
  for (const item of cases) {
    const reading = fact(facts(obs("discovery", item.states)).result, item.id);
    assert.deepEqual(reading && [reading.semanticCode, reading.certainty], [item.code, item.certainty], item.states.join("+"));
    assert.ok(reading!.provenance.questionIds.length > 0, "readings keep provenance");
  }
  const empty = facts([]).result;
  assert.equal(empty.facts.some((item) => ["weakness", "partial", "strength"].includes(item.type)), false, "null dimensions produce no capability reading");
});

test("08E contradictions keep both sides, including declared friction vs observed strength", () => {
  const mixed = facts(obs("discovery", ["strong", "missing"])).result;
  assert.deepEqual(fact(mixed, "contradiction:discovery")?.contradiction?.pairs, [{ positive: "discovery_q0", negative: "discovery_q1" }]);
  const reading = fact(mixed, "partial:discovery")!;
  assert.deepEqual([reading.signals!.positive.map((s) => s.questionId), reading.signals!.negative.map((s) => s.questionId)], [["discovery_q0"], ["discovery_q1"]]);
  const nonprofit = golden("nonprofit_community").result;
  const conversion = fact(nonprofit, "partial:conversion_access")!;
  assert.deepEqual(conversion.signals!.positive.map((s) => s.questionId), ["q2_nonprofit_donation_clarity"], "easy donation process");
  assert.deepEqual(conversion.signals!.negative.map((s) => s.questionId), ["q2_conversion_interest_to_action"], "low donation completion");
  assert.ok(fact(nonprofit, "contradiction:conversion_access")?.contradiction?.affectsPriority);
  const professional = golden("independent_professional").result;
  assert.equal(fact(professional, "contradiction:declared_friction:conversion_access")?.semanticCode, "declared_friction_not_observed");
});

test("08E evidence gaps distinguish legitimate, unobservable, insufficient, unconfirmed and not applicable", () => {
  const cases = [
    { result: golden("idea_early_stage").result, id: "evidence_gap:discovery", kind: "legitimate_uncertainty" },
    // 08E.2: pre-launch routes no longer ask measurement questions; evidence for an N/A dimension still classifies.
    { result: facts(obs("measurement_optimization", ["strong"]), { growthStage: resolved("idea") } as never).result, id: "evidence_gap:measurement_optimization", kind: "not_applicable" },
    // 08E.1 removed every production-reachable unobservable case; a context with no observable question still classifies correctly.
    { result: facts([], { growthStage: resolved("operating"), primaryFriction: resolved("visibility") } as never).result, id: "evidence_gap:discovery", kind: "unobservable_in_context" },
    { result: facts(obs("conversion_access", ["strong"]), { growthStage: resolved("operating"), primaryFriction: resolved("conversion") } as never).result, id: "evidence_gap:conversion_access", kind: "declared_friction_unconfirmed" },
  ];
  for (const item of cases) assert.equal(fact(item.result, item.id)?.gap?.kind, item.kind, item.id);
  const answers = { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "be_found" };
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const retail = deriveSemanticFacts({ answers, scoring, priorities: deriveConstraintsAndPriorities(scoring) });
  assert.equal(fact(retail, "evidence_gap:discovery")?.gap?.kind, "insufficient_evidence", "a direct discovery question was eligible but unanswered");
  assert.equal(golden("idea_early_stage").result.facts.some((item) => item.type === "weakness" && item.dimension === "discovery"), false);
});

test("08E translates 08D priorities and dependencies without recomputing them", () => {
  for (const id of ["professional_appointments", "nonprofit_community", "retail_ecommerce_hybrid"]) {
    const { scoring, priorities, result } = golden(id);
    const snapshot = structuredClone({ scoring, priorities });
    const again = deriveSemanticFacts({ answers: runGoldenPersonaPipeline(GOLDEN_PERSONAS.find((persona) => persona.id === id)!).answers, scoring, priorities });
    assert.deepEqual(result, again, `${id}: deterministic`);
    assert.deepEqual({ scoring, priorities }, snapshot, `${id}: engine outputs untouched`);
    const priorityFacts = result.facts.filter((item) => item.type === "priority");
    assert.deepEqual(priorityFacts.map((item) => [item.priority!.rank, item.provenance.constraintId]), priorities.priorities.map((item) => [item.rank, item.constraintId]));
    assert.equal(result.facts[0]!.provenance.constraintId, priorities.primaryConstraint);
  }
  assert.deepEqual(fact(golden("professional_appointments").result, "dependency:blocking_prerequisite:trust_reputation")?.dependency, { relation: "enables", from: ["trust_reputation"], to: ["conversion_access"] });
  assert.deepEqual(fact(golden("nonprofit_community").result, "dependency:active_bottleneck:conversion_access")?.dependency, { relation: "feeds", from: ["discovery"], to: ["conversion_access"] });
});

test("08E context informs relevance and order, never capability readings", () => {
  const evidence = [...obs("discovery", ["strong", "strong"]), ...obs("conversion_access", ["missing", "weak"])];
  const readings = (context: ContextualScoringContext["context"]) => facts(evidence, context).result.facts.filter((item) => ["strength", "partial", "weakness"].includes(item.type)).map((item) => [item.id, item.semanticCode, item.certainty]).sort();
  assert.deepEqual(readings({ growthStage: resolved("operating"), primaryGoal: resolved("be_found") } as never), readings({ growthStage: resolved("operating"), primaryFriction: resolved("follow_up") } as never));
  assert.ok(golden("ecommerce").result.context.some((item) => item.field === "archetype" && item.value === "ecommerce"));
  assert.equal(golden("ecommerce").result.facts.some((item) => (item as { field?: string }).field !== undefined), false, "context stays out of diagnostic facts");
});

test("08E golden personas: valid, compact, ordered, provenance-backed and differentiated fact sets", () => {
  const signatures = new Map<string, string>();
  for (const persona of GOLDEN_PERSONAS) {
    const { priorities, result } = golden(persona.id);
    const ids = result.facts.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, `${persona.id}: unique ids`);
    assert.equal(new Set(result.facts.map((item) => `${item.type}|${item.semanticCode}|${item.dimension}`)).size, ids.length, `${persona.id}: no duplicated finding`);
    assert.deepEqual(result.facts.map((item) => item.order), ids.map((_, index) => index + 1));
    assert.ok(result.facts.every((item, index) => index === 0 || result.facts[index - 1]!.importance <= item.importance), `${persona.id}: importance bands ordered`);
    assert.ok(result.facts.every((item) => item.importance === FACT_IMPORTANCE[item.type]));
    assert.ok(result.facts.length <= 16, `${persona.id}: compact (${result.facts.length})`);
    assert.ok(result.facts.every((item) => item.provenance.questionIds.length > 0 || item.provenance.constraintId !== undefined), `${persona.id}: every assertion has provenance`);
    assert.ok(result.facts.filter((item) => item.priority).every((item) => ids.includes(item.priority!.targetFactId)), `${persona.id}: priorities point to existing facts`);
    assert.equal(result.facts.filter((item) => item.type === "priority").length, priorities.priorities.length);
    signatures.set(persona.id, result.facts.map((item) => `${item.type}:${item.semanticCode}:${item.dimension ?? ""}`).sort().join("|"));
  }
  assert.equal(new Set(signatures.values()).size, GOLDEN_PERSONAS.length, "no two personas share the same fact set");
});
