import type { GrowthStage, PrimaryFriction, PrimaryGoal } from "./contracts";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-coverage";
import { CAPABILITY_CONTRIBUTION, type ContextualConfidenceLevel } from "./qbv2-contextual-scoring";
import type { DiagnosticDimensionView, DiagnosticScoringView } from "./qbv2-diagnostic-view";

/**
 * DIAG-V3-08D Constraints & Priorities. Scoring answers "how strong does this capability appear?";
 * this engine answers "what is materially limiting the business and what goes first?". It reads a
 * `DiagnosticScoringView` (satisfied by both the legacy and candidate scorers, no cast) and never
 * recomputes or mutates it. Goal/friction/stage act here — on relevance and sequencing — never on
 * capability percentages.
 */

// ── Dependency model ────────────────────────────────────────────────────────

/**
 * `enables`: the dependent pays off only when the prerequisite works (sequencing).
 * `sustains`: capacity to absorb what the dependent produces (growth gate; sequencing).
 * `feeds`: flow of people between stages; strong upstream + weak downstream = leak at downstream.
 * `informs`: makes optimization verifiable; explainability only, never sequencing.
 */
export const DEPENDENCY_RELATIONS = ["enables", "sustains", "feeds", "informs"] as const;
export type DependencyRelation = (typeof DEPENDENCY_RELATIONS)[number];
export type DimensionDependency = { readonly from: DigitalDimensionId; readonly to: DigitalDimensionId; readonly relation: DependencyRelation; readonly rationale: string };

export const DIMENSION_DEPENDENCIES: readonly DimensionDependency[] = [
  { from: "digital_foundation", to: "discovery", relation: "enables", rationale: "reach_needs_a_findable_base" },
  { from: "digital_foundation", to: "conversion_access", relation: "enables", rationale: "action_needs_a_working_base" },
  { from: "clarity_positioning", to: "discovery", relation: "enables", rationale: "reach_needs_a_clear_message" },
  { from: "clarity_positioning", to: "conversion_access", relation: "enables", rationale: "action_needs_a_clear_offer" },
  { from: "trust_reputation", to: "conversion_access", relation: "enables", rationale: "action_needs_trust" },
  { from: "digital_readiness", to: "discovery", relation: "sustains", rationale: "capacity_before_more_demand" },
  { from: "digital_readiness", to: "relationship_recurrence", relation: "sustains", rationale: "capacity_to_follow_up" },
  { from: "discovery", to: "conversion_access", relation: "feeds", rationale: "demand_flows_to_action" },
  { from: "conversion_access", to: "relationship_recurrence", relation: "feeds", rationale: "customers_flow_to_continuity" },
  { from: "measurement_optimization", to: "discovery", relation: "informs", rationale: "verifiable_acquisition_learning" },
  { from: "measurement_optimization", to: "conversion_access", relation: "informs", rationale: "verifiable_conversion_learning" },
];

/** Relations that impose order between two priorities. Must stay acyclic (validated by test). */
const SEQUENCING: ReadonlySet<DependencyRelation> = new Set(["enables", "sustains"]);

// ── Goal / friction relevance (first entry = primary, rest = related) ───────

export const GOAL_RELEVANCE: Readonly<Record<PrimaryGoal, readonly DigitalDimensionId[]>> = {
  be_found: ["discovery", "digital_foundation"],
  explain: ["clarity_positioning", "digital_foundation"],
  trust: ["trust_reputation", "clarity_positioning"],
  opportunities: ["conversion_access", "discovery"],
  stop_losing: ["relationship_recurrence", "conversion_access"],
  organize: ["digital_readiness", "relationship_recurrence"],
  automate: ["digital_readiness", "relationship_recurrence"],
  measure: ["measurement_optimization"],
};

export const FRICTION_RELEVANCE: Readonly<Record<PrimaryFriction, readonly DigitalDimensionId[]>> = {
  visibility: ["discovery", "digital_foundation"],
  trust: ["trust_reputation", "clarity_positioning"],
  conversion: ["conversion_access", "clarity_positioning"],
  follow_up: ["relationship_recurrence"],
  operations: ["digital_readiness"],
  scale: ["digital_readiness", "measurement_optimization"],
};

/** Stages where sustaining more volume is inherently part of the agenda. */
const GROWTH_STAGES: readonly GrowthStage[] = ["growing", "scaling"];

// ── Constraint taxonomy ─────────────────────────────────────────────────────

export const CONSTRAINT_KINDS = [
  "clarity_constraint", "foundation_constraint", "discovery_constraint", "trust_constraint", "conversion_constraint",
  "follow_up_constraint", "measurement_constraint", "capacity_constraint", "dependency_risk", "evidence_gap",
] as const;
export type ConstraintKind = (typeof CONSTRAINT_KINDS)[number];

/** One capability constraint per dimension; acquisition≈discovery and follow-up≈retention share a dimension. */
export const DIMENSION_CONSTRAINT: Readonly<Record<DigitalDimensionId, ConstraintKind>> = {
  clarity_positioning: "clarity_constraint", digital_foundation: "foundation_constraint", discovery: "discovery_constraint",
  trust_reputation: "trust_constraint", conversion_access: "conversion_constraint", relationship_recurrence: "follow_up_constraint",
  measurement_optimization: "measurement_constraint", digital_readiness: "capacity_constraint",
};

/** Bands reuse the scoring scale: below `partial` is material, below `established` is moderate. */
export const SEVERITY_BANDS = { materialBelow: 100 * CAPABILITY_CONTRIBUTION.partial!, moderateBelow: 100 * CAPABILITY_CONTRIBUTION.established! } as const;

export type ConstraintSeverity = "material" | "moderate" | "latent" | "unknown";
export type PriorityCertainty = "actionable" | "likely" | "verify_first";
export type RelevanceLevel = "primary" | "related" | "none";
export type RelevanceTier = 0 | 1 | 2;
export type PriorityReasonCode =
  | "below_partial_capability" | "below_established_capability" | "single_point_dependency" | "no_direct_evidence" | "supporting_signals_weakness" | "declared_friction_unconfirmed"
  | "goal_primary" | "goal_related" | "friction_primary" | "friction_related" | "growth_stage_capacity"
  | "prerequisite_of_relevant" | "capacity_gate" | "active_bottleneck" | "upstream_low_confidence" | "optimization_unverifiable"
  | "low_confidence" | "contradictory_evidence" | "sequenced_before_dependent";

export type ConstraintDependencyTrace = {
  /** Relevant dimensions this constraint blocks (`enables`) or must sustain (`sustains`). */
  readonly blocks: readonly DigitalDimensionId[];
  /** Sound upstream dimensions feeding into this leak (`feeds`). */
  readonly upstream: readonly DigitalDimensionId[];
  /** Constrained dimensions whose optimization this one cannot verify (`informs`). */
  readonly informs: readonly DigitalDimensionId[];
};

export type DiagnosticConstraint = {
  readonly id: string;
  readonly kind: ConstraintKind;
  readonly dimension: DigitalDimensionId;
  readonly severity: ConstraintSeverity;
  readonly score: number | null;
  readonly confidence: ContextualConfidenceLevel;
  readonly certainty: PriorityCertainty;
  /** Question IDs from the scoring explainability; never invented. */
  readonly evidence: readonly string[];
  /** `ownTier` comes from goal/friction/stage alone; `tier` may be lifted by dependencies (inherited relevance). */
  readonly relevance: { readonly goal: RelevanceLevel; readonly friction: RelevanceLevel; readonly tier: RelevanceTier; readonly ownTier: RelevanceTier };
  readonly dependency: ConstraintDependencyTrace;
  readonly reasonCodes: readonly PriorityReasonCode[];
};

export type PrioritySlot = "primary" | "secondary" | "supporting";
export type DiagnosticPriority = DiagnosticConstraint & { readonly slot: PrioritySlot; readonly rank: 1 | 2 | 3; readonly constraintId: string };

export type ConstraintPriorityResult = {
  readonly context: { readonly goal: PrimaryGoal | null; readonly friction: PrimaryFriction | null; readonly stage: GrowthStage | null };
  /** Every detected constraint, already in priority order. */
  readonly constraints: readonly DiagnosticConstraint[];
  /** At most three; never a ranking of all dimensions. */
  readonly priorities: readonly DiagnosticPriority[];
  readonly primaryConstraint: string | null;
};

// ── Engine ──────────────────────────────────────────────────────────────────

const SLOTS: readonly PrioritySlot[] = ["primary", "secondary", "supporting"];
const SEVERITY_ORDER: Readonly<Record<ConstraintSeverity, number>> = { material: 0, moderate: 1, unknown: 2, latent: 3 };
const CERTAINTY_ORDER: Readonly<Record<PriorityCertainty, number>> = { actionable: 0, likely: 1, verify_first: 2 };

function resolved<T extends string>(field: unknown): T | null {
  const value = field as { status?: string; value?: T } | undefined;
  return value?.status === "resolved" && typeof value.value === "string" ? value.value : null;
}
function level(list: readonly DigitalDimensionId[] | undefined, dimension: DigitalDimensionId): RelevanceLevel {
  const index = list?.indexOf(dimension) ?? -1;
  return index === 0 ? "primary" : index > 0 ? "related" : "none";
}
const edges = (relation: DependencyRelation) => DIMENSION_DEPENDENCIES.filter((edge) => edge.relation === relation);

export function deriveConstraintsAndPriorities(scoring: DiagnosticScoringView): ConstraintPriorityResult {
  const goal = resolved<PrimaryGoal>(scoring.context.primaryGoal);
  const friction = resolved<PrimaryFriction>(scoring.context.primaryFriction);
  const stage = resolved<GrowthStage>(scoring.context.growthStage);
  const byId = new Map(scoring.dimensions.map((dimension) => [dimension.id, dimension]));
  const applicable = (id: DigitalDimensionId) => byId.get(id)?.applicability === "applicable";
  const constrained = (id: DigitalDimensionId) => { const item = byId.get(id); return applicable(id) && item!.score !== null && item!.score < SEVERITY_BANDS.moderateBelow; };
  const sound = (id: DigitalDimensionId) => { const item = byId.get(id); return applicable(id) && item!.score !== null && item!.score >= SEVERITY_BANDS.moderateBelow; };

  const relevance = (id: DigitalDimensionId) => {
    const goalLevel = goal ? level(GOAL_RELEVANCE[goal], id) : "none";
    const frictionLevel = friction ? level(FRICTION_RELEVANCE[friction], id) : "none";
    const growth = id === "digital_readiness" && stage !== null && GROWTH_STAGES.includes(stage);
    const tier: RelevanceTier = goalLevel === "primary" || frictionLevel === "primary" ? 0 : goalLevel === "related" || frictionLevel === "related" || growth ? 1 : 2;
    const codes: PriorityReasonCode[] = [];
    if (goalLevel !== "none") codes.push(goalLevel === "primary" ? "goal_primary" : "goal_related");
    if (frictionLevel !== "none") codes.push(frictionLevel === "primary" ? "friction_primary" : "friction_related");
    if (growth) codes.push("growth_stage_capacity");
    return { goal: goalLevel, friction: frictionLevel, tier, codes };
  };

  /** A prerequisite matters only for a relevant dependent that is itself weak or unknown; capacity matters for any relevant dependent. */
  const blocked = (id: DigitalDimensionId) => DIMENSION_DEPENDENCIES
    .filter((edge) => edge.from === id && SEQUENCING.has(edge.relation) && applicable(edge.to) && relevance(edge.to).tier < 2)
    .filter((edge) => edge.relation === "sustains" || constrained(edge.to) || byId.get(edge.to)!.score === null);

  const build = (item: DiagnosticDimensionView, kind: ConstraintKind, severity: ConstraintSeverity, evidence: readonly string[], baseCodes: readonly PriorityReasonCode[]): DiagnosticConstraint => {
    const own = relevance(item.id);
    const blocks = blocked(item.id);
    const upstream = edges("feeds").filter((edge) => edge.to === item.id && severity !== "unknown" && severity !== "latent" && sound(edge.from)).map((edge) => edge.from);
    const informs = edges("informs").filter((edge) => edge.from === item.id && severity !== "unknown" && constrained(edge.to)).map((edge) => edge.to);
    const codes: PriorityReasonCode[] = [...baseCodes, ...own.codes];
    if (blocks.some((edge) => edge.relation === "enables")) codes.push("prerequisite_of_relevant");
    if (blocks.some((edge) => edge.relation === "sustains")) codes.push("capacity_gate");
    if (upstream.length > 0) codes.push("active_bottleneck");
    const weakUpstream = upstream.some((id) => byId.get(id)!.confidence.level === "low");
    if (weakUpstream) codes.push("upstream_low_confidence");
    if (informs.length > 0) codes.push("optimization_unverifiable");
    // Tier: a prerequisite is as relevant as what it unblocks; a leak below sound demand is always relevant.
    const tier = Math.min(own.tier, ...blocks.map((edge) => relevance(edge.to).tier), upstream.length > 0 ? 0 : 2) as RelevanceTier;
    let certainty: PriorityCertainty = severity === "unknown" ? "verify_first" : item.confidence.level === "low" ? "likely" : "actionable";
    if (item.confidence.level === "low" && severity !== "unknown") codes.push("low_confidence");
    if (item.explainability.contradictions.length > 0) { codes.push("contradictory_evidence"); if (certainty === "actionable") certainty = "likely"; }
    if (weakUpstream && certainty === "actionable") certainty = "likely";
    return {
      id: `${kind}:${item.id}`, kind, dimension: item.id, severity, score: item.score, confidence: item.confidence.level, certainty,
      evidence: [...new Set(evidence)], relevance: { goal: own.goal, friction: own.friction, tier, ownTier: own.tier },
      dependency: { blocks: blocks.map((edge) => edge.to), upstream, informs }, reasonCodes: codes,
    };
  };

  const detected: DiagnosticConstraint[] = [];
  for (const item of scoring.dimensions) {
    if (item.applicability !== "applicable") continue;
    const explain = item.explainability;
    if (item.score !== null) {
      const severity: ConstraintSeverity | null = item.score < SEVERITY_BANDS.materialBelow ? "material" : item.score < SEVERITY_BANDS.moderateBelow ? "moderate" : null;
      if (severity) detected.push(build(item, DIMENSION_CONSTRAINT[item.id], severity, [...explain.missing, ...explain.weaknesses, ...explain.dependencies], [severity === "material" ? "below_partial_capability" : "below_established_capability", ...(explain.dependencies.length > 0 ? ["single_point_dependency" as const] : [])]));
      else if (explain.dependencies.length > 0) detected.push(build(item, "dependency_risk", "latent", explain.dependencies, ["single_point_dependency"]));
      // A thin positive reading must not silence the pain the business declared: verify it, keep the real score.
      else if (relevance(item.id).friction === "primary" && item.confidence.level === "low") detected.push(build(item, "evidence_gap", "unknown", [...explain.direct, ...explain.supporting], ["declared_friction_unconfirmed"]));
    } else if (relevance(item.id).tier === 0 || blocked(item.id).some((edge) => constrained(edge.to))) {
      // Null is insufficient evidence, never weakness: only relevant gaps become verify-first items.
      // Weak supporting readings are surfaced as a hint to verify, not converted into a score.
      const weakSupport = explain.supporting.some((id) => explain.weaknesses.includes(id) || explain.missing.includes(id));
      detected.push(build(item, "evidence_gap", "unknown", [...explain.supporting, ...explain.uncertainty], ["no_direct_evidence", ...(weakSupport ? ["supporting_signals_weakness" as const] : [])]));
    }
  }

  // DIAG-V3-08D.1 policy: an evidenced constraint relevant in its own right (declared goal/friction or an
  // evidence-backed active bottleneck) is never displaced by a prerequisite whose relevance is only inherited —
  // not by severity, not by a lower score. The prerequisite moves ahead only where it blocks that very
  // dimension, which the topological pass below establishes from the dependency graph.
  const precedence = (item: DiagnosticConstraint) => (item.severity === "material" || item.severity === "moderate" ? (item.relevance.tier < item.relevance.ownTier && !item.reasonCodes.includes("active_bottleneck") ? 1 : 0) : 2);
  const order = (a: DiagnosticConstraint, b: DiagnosticConstraint) =>
    a.relevance.tier - b.relevance.tier || precedence(a) - precedence(b) || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || CERTAINTY_ORDER[a.certainty] - CERTAINTY_ORDER[b.certainty]
    || (a.score ?? 101) - (b.score ?? 101) || DIGITAL_DIMENSION_IDS.indexOf(a.dimension) - DIGITAL_DIMENSION_IDS.indexOf(b.dimension);
  const sorted = [...detected].sort(order);

  // Stable topological pass: an evidenced blocking prerequisite precedes the dependent it blocks.
  // An unverified prerequisite (evidence gap) keeps its trace but never jumps ahead of evidenced constraints.
  // DIAG-V3-08E.1: "materially blocking" also needs evidence at least as certain as the dependent's — a
  // single low-confidence reading never displaces an actionable constraint (e.g. a declared friction).
  const sequenced: DiagnosticConstraint[] = [];
  const remaining = [...sorted];
  while (remaining.length > 0) {
    // The sequencing graph is acyclic (tested); Math.max only guards against a future cyclic edit.
    const index = Math.max(0, remaining.findIndex((candidate) => !remaining.some((other) => other !== candidate && other.severity !== "unknown" && other.dependency.blocks.includes(candidate.dimension) && CERTAINTY_ORDER[other.certainty] <= CERTAINTY_ORDER[candidate.certainty])));
    const [next] = remaining.splice(index, 1);
    sequenced.push(index > 0 ? { ...next!, reasonCodes: [...next!.reasonCodes, "sequenced_before_dependent"] } : next!);
  }

  const priorities = sequenced.slice(0, SLOTS.length).map((constraint, index) => ({ ...constraint, constraintId: constraint.id, slot: SLOTS[index]!, rank: (index + 1) as 1 | 2 | 3 }));
  return { context: { goal, friction, stage }, constraints: sequenced, priorities, primaryConstraint: priorities[0]?.constraintId ?? null };
}
