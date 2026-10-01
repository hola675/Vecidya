import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CONSTRAINT_KINDS, DIGITAL_DIMENSION_IDS, DIMENSION_CONSTRAINT, DIMENSION_DEPENDENCIES, FRICTION_RELEVANCE, GOAL_RELEVANCE, GOLDEN_PERSONAS,
  deriveConstraintsAndPriorities, runGoldenPersonaPipeline, scoreContextualDimensions,
  type ContextualDimensionResult, type ContextualScoringResult, type DigitalDimensionId,
} from "../../../app/features/diagnostic/index.ts";
import { PRIMARY_FRICTIONS, PRIMARY_GOALS } from "../../../app/features/diagnostic/contracts.ts";

type Spec = { score: number | null; level?: "low" | "medium" | "high"; contradictory?: boolean; dependencies?: readonly string[]; supportingWeak?: boolean; applicability?: ContextualDimensionResult["applicability"] };
const dim = (id: DigitalDimensionId, spec: Spec = { score: null }): ContextualDimensionResult => {
  const q = `${id}_q`; const scored = spec.score !== null;
  return {
    id, label: id, applicability: spec.applicability ?? "applicable", score: spec.score, evidence: [],
    confidence: { level: spec.level ?? (scored ? "medium" : "low"), direct: scored ? 1 : 0, supporting: spec.supportingWeak ? 1 : 0, contextual: 0, uncertain: 0, independent: scored ? 1 : 0, strength: scored ? 1 : 0, contradictory: spec.contradictory ?? false, penalties: [] },
    explainability: {
      basis: scored ? "direct" : spec.supportingWeak ? "supporting_only" : "none", direct: scored ? [q] : [], supporting: spec.supportingWeak ? [`${id}_s`] : [],
      strengths: scored && spec.score! >= 75 ? [q] : [], weaknesses: [...(scored && spec.score! < 75 ? [q] : []), ...(spec.supportingWeak ? [`${id}_s`] : [])], missing: [],
      dependencies: spec.dependencies ?? [], constraints: [], uncertainty: [], contradictions: spec.contradictory ? [{ positive: q, negative: `${id}_neg` }] : [], gaps: [],
    },
  };
};
const resolvedField = (value: string | undefined) => (value ? { status: "resolved", value, source: "answer" } : { status: "unresolved" });
const scoring = (specs: Partial<Record<DigitalDimensionId, Spec>>, ctx: { goal?: string; friction?: string; stage?: string } = {}): ContextualScoringResult => ({
  context: { primaryGoal: resolvedField(ctx.goal), primaryFriction: resolvedField(ctx.friction), growthStage: resolvedField(ctx.stage) } as unknown as ContextualScoringResult["context"],
  dimensions: DIGITAL_DIMENSION_IDS.map((id) => dim(id, specs[id])),
});
const run = (specs: Partial<Record<DigitalDimensionId, Spec>>, ctx: { goal?: string; friction?: string; stage?: string } = {}) => deriveConstraintsAndPriorities(scoring(specs, ctx));
const find = (result: ReturnType<typeof run>, dimension: DigitalDimensionId) => result.constraints.find((item) => item.dimension === dimension);

test("08D model: compact taxonomy, valid relevance tables and an acyclic dependency graph", () => {
  assert.equal(CONSTRAINT_KINDS.length, 10);
  assert.deepEqual(Object.keys(DIMENSION_CONSTRAINT).sort(), [...DIGITAL_DIMENSION_IDS].sort());
  for (const goal of PRIMARY_GOALS) assert.ok(GOAL_RELEVANCE[goal].length > 0 && GOAL_RELEVANCE[goal].every((id) => DIGITAL_DIMENSION_IDS.includes(id)), goal);
  for (const friction of PRIMARY_FRICTIONS) assert.ok(FRICTION_RELEVANCE[friction].length > 0 && FRICTION_RELEVANCE[friction].every((id) => DIGITAL_DIMENSION_IDS.includes(id)), friction);
  const visit = (node: DigitalDimensionId, path: readonly DigitalDimensionId[]): void => {
    assert.ok(!path.includes(node), `cycle: ${[...path, node].join(" → ")}`);
    for (const edge of DIMENSION_DEPENDENCIES.filter((item) => item.from === node)) visit(edge.to, [...path, node]);
  };
  for (const id of DIGITAL_DIMENSION_IDS) visit(id, []);
  assert.ok(DIMENSION_DEPENDENCIES.every((edge) => edge.from !== edge.to));
});

test("priority is not the lowest score: prerequisites and active bottlenecks come first", () => {
  const cases = [
    { name: "foundation 55 is the prerequisite of discovery 35", specs: { discovery: { score: 35 }, digital_foundation: { score: 55 } }, ctx: { goal: "be_found", friction: "visibility" }, primary: "digital_foundation", reason: "sequenced_before_dependent", secondary: "discovery" },
    { name: "conversion 55 leaks sound discovery; measurement 35 is irrelevant", specs: { discovery: { score: 90 }, conversion_access: { score: 55 }, measurement_optimization: { score: 35, level: "high" } }, ctx: { goal: "be_found", friction: "visibility" }, primary: "conversion_access", reason: "active_bottleneck", secondary: undefined },
    { name: "readiness 10 is irrelevant to a measurement goal", specs: { measurement_optimization: { score: 60 }, digital_readiness: { score: 10, level: "high" } }, ctx: { goal: "measure" }, primary: "measurement_optimization", reason: "goal_primary", secondary: undefined },
    { name: "weak readiness gates a demand goal", specs: { discovery: { score: 60 }, digital_readiness: { score: 45 } }, ctx: { goal: "be_found", friction: "visibility" }, primary: "digital_readiness", reason: "capacity_gate", secondary: "discovery" },
  ] as const;
  for (const item of cases) {
    const result = run(item.specs, item.ctx);
    assert.equal(result.priorities[0]?.dimension, item.primary, item.name);
    assert.ok(result.priorities[0]!.reasonCodes.includes(item.reason), `${item.name}: ${result.priorities[0]!.reasonCodes}`);
    if (item.secondary) assert.equal(result.priorities[1]?.dimension, item.secondary, item.name);
    assert.ok(result.priorities.length <= 3);
  }
  const irrelevant = find(run(cases[1].specs, cases[1].ctx), "measurement_optimization")!;
  assert.equal(irrelevant.relevance.tier, 2);
  assert.deepEqual(irrelevant.dependency.informs, ["conversion_access"]);
});

test("null is insufficient evidence, never weakness", () => {
  const result = run({ discovery: { score: null, supportingWeak: true }, trust_reputation: { score: 40 } }, { goal: "be_found", friction: "visibility" });
  const gap = find(result, "discovery")!;
  assert.equal(gap.kind, "evidence_gap");
  assert.equal(gap.severity, "unknown");
  assert.equal(gap.certainty, "verify_first");
  assert.equal(gap.score, null);
  assert.ok(gap.reasonCodes.includes("supporting_signals_weakness"));
  assert.equal(result.constraints.some((item) => item.kind === "discovery_constraint"), false);
  assert.equal(run({}, {}).constraints.length, 0, "irrelevant nulls produce nothing");
});

test("goal and friction change priority order, never capability", () => {
  const input = scoring({ relationship_recurrence: { score: 40 }, conversion_access: { score: 45 } }, { friction: "follow_up" });
  const snapshot = structuredClone(input);
  const followUp = deriveConstraintsAndPriorities(input);
  const conversion = deriveConstraintsAndPriorities({ ...input, context: { ...input.context, primaryFriction: resolvedField("conversion") } as ContextualScoringResult["context"] });
  assert.deepEqual(input, snapshot, "scoring result is not mutated");
  assert.equal(followUp.priorities[0]?.dimension, "relationship_recurrence");
  assert.equal(conversion.priorities[0]?.dimension, "conversion_access");
  for (const id of ["relationship_recurrence", "conversion_access"] as const) assert.equal(find(followUp, id)?.score, find(conversion, id)?.score);
});

test("confidence-aware certainty: actionable, likely or verify first", () => {
  const cases: readonly { spec: Spec; certainty: string | null; kind?: string }[] = [
    { spec: { score: 40, level: "high" }, certainty: "actionable" },
    { spec: { score: 40, level: "medium" }, certainty: "actionable" },
    { spec: { score: 40, level: "low" }, certainty: "likely" },
    { spec: { score: 40, level: "medium", contradictory: true }, certainty: "likely" },
    { spec: { score: 100, level: "low" }, certainty: "verify_first", kind: "evidence_gap" },
    { spec: { score: 100, level: "medium" }, certainty: null },
  ];
  for (const item of cases) {
    const constraint = find(run({ conversion_access: item.spec }, { friction: "conversion" }), "conversion_access");
    assert.equal(constraint?.certainty ?? null, item.certainty, JSON.stringify(item.spec));
    if (item.kind) { assert.equal(constraint!.kind, item.kind); assert.equal(constraint!.score, 100, "the real score is kept, not fabricated"); }
  }
});

test("a low-confidence strong upstream never suppresses a constraint, it only lowers certainty", () => {
  const withThinUpstream = find(run({ discovery: { score: 100, level: "low" }, conversion_access: { score: 40 } }, { goal: "opportunities" }), "conversion_access")!;
  const withoutUpstream = find(run({ conversion_access: { score: 40 } }, { goal: "opportunities" }), "conversion_access")!;
  assert.equal(withThinUpstream.kind, "conversion_constraint");
  assert.equal(withoutUpstream.kind, "conversion_constraint");
  assert.ok(withThinUpstream.reasonCodes.includes("upstream_low_confidence"));
  assert.equal(withThinUpstream.certainty, "likely");
  assert.equal(withoutUpstream.certainty, "actionable");
});

test("a sound dimension can still expose a single-point dependency", () => {
  const risk = find(run({ discovery: { score: 80, dependencies: ["q2_ecommerce_acquisition_dependency"] } }, { goal: "be_found" }), "discovery")!;
  assert.equal(risk.kind, "dependency_risk");
  assert.equal(risk.severity, "latent");
  assert.deepEqual(risk.evidence, ["q2_ecommerce_acquisition_dependency"]);
});

test("08D.1 policy: a declared friction is never displaced by an inherited prerequisite; a prerequisite that blocks it moves first", () => {
  const order = (result: ReturnType<typeof run>) => result.priorities.map((item) => item.dimension);
  const cases = [
    // Trust blocks conversion (the goal), not follow-up (the declared friction): lower score or higher severity alone never displaces.
    { name: "lower score", specs: { relationship_recurrence: { score: 33 }, trust_reputation: { score: 25 }, conversion_access: { score: 50 } }, ctx: { goal: "opportunities", friction: "follow_up" }, expected: ["relationship_recurrence", "trust_reputation", "conversion_access"] },
    { name: "higher severity", specs: { relationship_recurrence: { score: 60 }, trust_reputation: { score: 20 }, conversion_access: { score: 50 } }, ctx: { goal: "opportunities", friction: "follow_up" }, expected: ["relationship_recurrence", "trust_reputation", "conversion_access"] },
    // Inverse: trust blocks the declared friction's own dimension, so the prerequisite leads.
    { name: "explicit blocking", specs: { conversion_access: { score: 50 }, trust_reputation: { score: 25 } }, ctx: { friction: "conversion" }, expected: ["trust_reputation", "conversion_access"] },
  ] as const;
  for (const item of cases) {
    const result = run(item.specs, item.ctx);
    assert.deepEqual(order(result).slice(0, item.expected.length), item.expected, item.name);
  }
  const inverse = run(cases[2].specs, cases[2].ctx).priorities[0]!;
  assert.ok(inverse.reasonCodes.includes("sequenced_before_dependent") && inverse.dependency.blocks.includes("conversion_access"));
  // Real golden regression: professional_appointments (Trust 25, Relationship 33, friction follow_up).
  const persona = GOLDEN_PERSONAS.find((entry) => entry.id === "professional_appointments")!;
  const real = deriveConstraintsAndPriorities(scoreContextualDimensions({ answers: runGoldenPersonaPipeline(persona).answers, context: {}, evidence: [] }));
  assert.deepEqual(real.priorities.map((entry) => [entry.dimension, entry.score]), [["relationship_recurrence", 33], ["trust_reputation", 25], ["conversion_access", 50]]);
});

test("golden personas run planner → scoring → constraints → priorities with valid, sequenced structures", () => {
  const primaries = new Set<string>();
  for (const persona of GOLDEN_PERSONAS) {
    const result = scoreContextualDimensions({ answers: runGoldenPersonaPipeline(persona).answers, context: {}, evidence: [] });
    const snapshot = structuredClone(result);
    const output = deriveConstraintsAndPriorities(result);
    assert.deepEqual(result, snapshot, `${persona.id}: scoring is read-only`);
    assert.deepEqual(output, deriveConstraintsAndPriorities(result), `${persona.id}: deterministic`);
    assert.ok(output.priorities.length <= 3);
    assert.deepEqual(output.priorities.map((item) => item.constraintId), output.constraints.slice(0, 3).map((item) => item.id));
    assert.deepEqual(output.priorities.map((item) => item.slot), ["primary", "secondary", "supporting"].slice(0, output.priorities.length));
    assert.equal(output.primaryConstraint, output.priorities[0]?.constraintId ?? null);
    const byId = new Map(result.dimensions.map((item) => [item.id, item]));
    const questionIds = new Set(result.dimensions.flatMap((item) => item.evidence.map((evidence) => evidence.questionId)));
    for (const [index, constraint] of output.constraints.entries()) {
      assert.equal(byId.get(constraint.dimension)!.applicability, "applicable", `${persona.id}: no constraint on a non-applicable dimension`);
      assert.equal(constraint.score, byId.get(constraint.dimension)!.score, `${persona.id}: score copied, never recomputed`);
      assert.ok(constraint.evidence.every((id) => questionIds.has(id)), `${persona.id}: evidence IDs come from scoring`);
      if (constraint.score === null) assert.equal(constraint.kind, "evidence_gap", `${persona.id}: null only as a gap`);
      const blockers = output.constraints.filter((other) => other.severity !== "unknown" && other.dependency.blocks.includes(constraint.dimension));
      assert.ok(blockers.every((blocker) => output.constraints.indexOf(blocker) < index), `${persona.id}: prerequisite precedes ${constraint.dimension}`);
    }
    primaries.add(output.priorities[0]?.dimension ?? "none");
  }
  assert.ok(primaries.size >= 5, `primary targets vary across personas: ${[...primaries]}`);
});
