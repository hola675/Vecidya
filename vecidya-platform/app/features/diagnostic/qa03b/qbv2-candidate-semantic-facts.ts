// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import type { ResolvedDomainContext } from "./context";
import { QUESTION_BANK_V2 } from "../qbv2-bank";
import { NEGATIVE_CAPABILITY_STATES, POSITIVE_CAPABILITY_STATES } from "../qbv2-capability";
import type { CapabilityState, ContextualConfidenceLevel, ContextualEvidence } from "../qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, type DigitalDimensionId, type EvidenceDirectness } from "../qbv2-coverage";
import { resolveEligibleQuestionsV2, type QuestionBankV2 } from "./engine";
import {
  DIMENSION_DEPENDENCIES, FRICTION_RELEVANCE, GOAL_RELEVANCE, SEVERITY_BANDS, type SeverityBands,
  type ConstraintKind, type ConstraintPriorityResult, type ConstraintSeverity, type DiagnosticConstraint, type PriorityCertainty, type PriorityReasonCode, type RelevanceLevel,
} from "../qbv2-priorities";
import type { AnswersV2 } from "../qbv2-rules";
import type { DiagnosticDimensionView, DiagnosticScoringView } from "../qbv2-diagnostic-view";

/**
 * DIAG-V3-08E — Semantic Diagnostic Facts. A pure translation of the frozen engine outputs (context,
 * evidence, scores, confidence, constraints, priorities) into compact, machine-readable facts for the
 * future narrative/UI. It never recomputes scores or priorities and never writes prose: every fact keeps
 * its provenance (question IDs, constraint ID, priority rank) and its order follows the 08D priorities.
 */

/**
 * DIAG-V3-R6-A: the only seam through which `deriveSemanticFacts` learns which questions are direct/
 * supporting evidence for a dimension, and what to call a signal's facet. The legacy path's default
 * provider reads `EVIDENCE_MAPPING`/`EVIDENCE_DIRECTNESS`; the candidate path supplies its own provider
 * derived exclusively from `evidenceV3`, so candidate facts never consult legacy evidence maps.
 */
export type SemanticEvidenceCatalog = {
  readonly directness: (questionId: string, dimension: DigitalDimensionId) => EvidenceDirectness | undefined;
  readonly directQuestionIds: (dimension: DigitalDimensionId) => readonly string[];
  readonly facet: (questionId: string, dimension: DigitalDimensionId) => string;
};

/** Default provider: unchanged legacy behavior, reading the frozen legacy evidence maps. */
export const LEGACY_SEMANTIC_EVIDENCE_CATALOG: SemanticEvidenceCatalog = {
  directness: (questionId, dimension) => EVIDENCE_DIRECTNESS[questionId]?.[dimension] ?? EVIDENCE_MAPPING[questionId]?.semanticRole,
  directQuestionIds: (dimension) => QUESTION_BANK_V2.filter((question) => EVIDENCE_MAPPING[question.id]?.dimensions.includes(dimension) && (EVIDENCE_DIRECTNESS[question.id]?.[dimension] ?? EVIDENCE_MAPPING[question.id]!.semanticRole) === "direct").map((question) => question.id),
  facet: (questionId) => EVIDENCE_MAPPING[questionId]?.subcriteria[0] ?? questionId,
};

// ── Taxonomy ────────────────────────────────────────────────────────────────

export const SEMANTIC_FACT_TYPES = ["priority", "weakness", "dependency", "contradiction", "strength", "partial", "risk", "uncertainty", "evidence_gap"] as const;
export type SemanticFactType = (typeof SEMANTIC_FACT_TYPES)[number];

/** Capability readings only: `signal` is a positive or negative reading the evidence cannot yet confirm. */
export type FactCertainty = "confirmed" | "likely" | "signal";
/**
 * `insufficient_evidence`: a direct question was observable here but no reading resulted.
 * `unobservable_in_context`: the bank has no direct question for this specific context (a bank-scope limit, not a weakness).
 * `legitimate_uncertainty`: unobservable because the capability cannot exist yet (pre-launch idea).
 */
export type EvidenceGapKind = "insufficient_evidence" | "unobservable_in_context" | "legitimate_uncertainty" | "declared_friction_unconfirmed" | "not_applicable";

/**
 * Importance band (1 = most important) shared by the narrative contract: primary constraint/priority,
 * material weakness, dependencies and contradictions, relevant strengths, secondary opportunities and
 * risks, then evidence gaps. Within a band the 08D constraint order dominates; no new ranking is computed.
 */
export const FACT_IMPORTANCE: Readonly<Record<SemanticFactType, number>> = { priority: 1, weakness: 2, dependency: 3, contradiction: 3, strength: 4, partial: 5, risk: 5, uncertainty: 6, evidence_gap: 6 };

type ReadingCodes = { readonly strength: string; readonly partial: string; readonly weakness: string };
/** One semantic vocabulary per dimension and reading; the narrative maps these codes, never raw scores. */
export const DIMENSION_READING_CODES: Readonly<Record<DigitalDimensionId, ReadingCodes>> = {
  clarity_positioning: { strength: "clear_offer", partial: "partially_clear_offer", weakness: "unclear_offer" },
  digital_foundation: { strength: "solid_digital_base", partial: "incomplete_digital_base", weakness: "weak_digital_base" },
  discovery: { strength: "discoverable", partial: "limited_discovery", weakness: "hard_to_discover" },
  trust_reputation: { strength: "visible_trust", partial: "limited_visible_trust", weakness: "low_visible_trust" },
  conversion_access: { strength: "interest_converts", partial: "partial_conversion", weakness: "interest_not_converting" },
  relationship_recurrence: { strength: "relationships_retained", partial: "inconsistent_follow_up", weakness: "follow_up_leakage" },
  measurement_optimization: { strength: "outcomes_measured", partial: "partial_measurement", weakness: "outcomes_unmeasured" },
  digital_readiness: { strength: "digitally_ready", partial: "partial_digital_capacity", weakness: "limited_digital_capacity" },
};

export const PRIORITY_CODES: Readonly<Record<ConstraintKind, string>> = {
  clarity_constraint: "clarify_offer", foundation_constraint: "strengthen_digital_base", discovery_constraint: "improve_discovery",
  trust_constraint: "build_visible_trust", conversion_constraint: "improve_conversion", follow_up_constraint: "stabilize_follow_up",
  measurement_constraint: "establish_measurement", capacity_constraint: "build_digital_capacity", dependency_risk: "reduce_single_point_dependency",
  evidence_gap: "verify_before_action",
};

const DEPENDENCY_CODES = { enables: "blocking_prerequisite", sustains: "capacity_gate", feeds: "active_bottleneck", informs: "optimization_unverifiable" } as const;

// ── Contract ────────────────────────────────────────────────────────────────

export type FactSignal = { readonly questionId: string; readonly state: CapabilityState; readonly directness: ContextualEvidence["directness"]; readonly facet: string };

export type SemanticFact = {
  readonly id: string;
  readonly type: SemanticFactType;
  readonly semanticCode: string;
  readonly importance: number;
  /** 1-based position in the deterministic fact order. */
  readonly order: number;
  readonly dimension?: DigitalDimensionId;
  readonly certainty?: FactCertainty;
  readonly severity?: ConstraintSeverity;
  readonly score?: number | null;
  readonly confidence?: ContextualConfidenceLevel;
  readonly relevance: { readonly goal: RelevanceLevel; readonly friction: RelevanceLevel };
  readonly provenance: {
    readonly questionIds: readonly string[];
    readonly constraintId?: string;
    readonly priorityRank?: 1 | 2 | 3;
    readonly reasonCodes?: readonly PriorityReasonCode[];
  };
  /** Positive and negative readings inside one dimension, so nuance is never collapsed into one label. */
  readonly signals?: { readonly positive: readonly FactSignal[]; readonly negative: readonly FactSignal[] };
  readonly priority?: { readonly rank: 1 | 2 | 3; readonly actionability: PriorityCertainty; readonly constraintKind: ConstraintKind; readonly targetFactId: string };
  readonly dependency?: { readonly relation: keyof typeof DEPENDENCY_CODES; readonly from: readonly DigitalDimensionId[]; readonly to: readonly DigitalDimensionId[] };
  readonly contradiction?: { readonly pairs: readonly { readonly positive: string; readonly negative: string }[]; readonly affectsPriority: boolean };
  readonly gap?: { readonly kind: EvidenceGapKind; readonly blocks: readonly DigitalDimensionId[] };
};

/** Business context is kept apart from capability conclusions: it informs interpretation only. */
export type ContextFact = { readonly field: string; readonly value: string | readonly string[] };

export type SemanticDiagnosticFacts = { readonly context: readonly ContextFact[]; readonly facts: readonly SemanticFact[] };

export type SemanticFactsInput = {
  readonly answers: AnswersV2;
  readonly scoring: DiagnosticScoringView;
  readonly priorities: ConstraintPriorityResult;
  readonly bank?: QuestionBankV2;
  /** Evidence-semantics authority. Defaults to the legacy provider; the candidate path supplies its own. */
  readonly evidenceCatalog?: SemanticEvidenceCatalog;
  /** DIAG-V3-R8-A: the same severity bands the priorities used. Defaults to the legacy `SEVERITY_BANDS`. */
  readonly severity?: SeverityBands;
};

// ── Derivation ──────────────────────────────────────────────────────────────

type Draft = Omit<SemanticFact, "importance" | "order"> & { readonly sortKey: readonly number[] };

function resolvedValue(context: Partial<ResolvedDomainContext>, field: keyof ResolvedDomainContext): string | undefined {
  const value = context[field] as { status?: string; value?: unknown } | undefined;
  return value?.status === "resolved" && typeof value.value === "string" ? value.value : undefined;
}

function contextFacts(context: Partial<ResolvedDomainContext>): readonly ContextFact[] {
  const facts: ContextFact[] = [];
  for (const field of ["entity", "businessModel", "archetype", "growthStage", "primaryGoal", "primaryFriction", "operationalStatus", "buyerRecipient"] as const) {
    const value = resolvedValue(context, field);
    if (value) facts.push({ field, value });
  }
  const components = context.archetypeComponents?.filter((component) => component !== "hybrid") ?? [];
  if (components.length > 1) facts.push({ field: "archetypeComponents", value: components });
  for (const field of ["reach", "buyer"] as const) {
    const value = context.customerModel?.[field];
    if (value?.status === "resolved") facts.push({ field: `customer.${field}`, value: value.value });
  }
  if (context.hasEverHadRealPeople !== undefined && context.hasEverHadRealPeople !== null) facts.push({ field: "hasEverHadRealPeople", value: String(context.hasEverHadRealPeople) });
  if (context.buyerDisposition) facts.push({ field: "buyerDisposition", value: context.buyerDisposition });
  if (context.funding) facts.push({ field: "funding", value: context.funding });
  return facts;
}

function signalsOf(item: DiagnosticDimensionView, catalog: SemanticEvidenceCatalog): { readonly positive: readonly FactSignal[]; readonly negative: readonly FactSignal[] } {
  const signal = (evidence: ContextualEvidence): FactSignal => ({ questionId: evidence.questionId, state: evidence.state, directness: evidence.directness, facet: catalog.facet(evidence.questionId, item.id) });
  const capability = item.evidence.filter((evidence) => evidence.directness !== "contextual" && evidence.contribution !== null);
  // R8-A: signal polarity follows the semantic R3 state, never a calibrated contribution.
  return {
    positive: capability.filter((evidence) => POSITIVE_CAPABILITY_STATES.has(evidence.state)).map(signal),
    negative: capability.filter((evidence) => NEGATIVE_CAPABILITY_STATES.has(evidence.state)).map(signal),
  };
}

/** Strength vs weakness is never the score alone: the band comes from the 08D scale, certainty from confidence and contradictions. */
function reading(item: DiagnosticDimensionView, severity: SeverityBands): { readonly type: "strength" | "partial" | "weakness"; readonly certainty: FactCertainty } {
  const solid = item.confidence.level !== "low" && !item.confidence.contradictory;
  if (item.score! >= severity.moderateBelow) return { type: "strength", certainty: solid ? "confirmed" : "signal" };
  return { type: item.score! < severity.materialBelow ? "weakness" : "partial", certainty: solid ? "confirmed" : "likely" };
}

export function deriveSemanticFacts(input: SemanticFactsInput): SemanticDiagnosticFacts {
  const bank = input.bank ?? QUESTION_BANK_V2;
  const catalog = input.evidenceCatalog ?? LEGACY_SEMANTIC_EVIDENCE_CATALOG;
  const severity = input.severity ?? SEVERITY_BANDS;
  const { scoring, priorities } = input;
  const goal = resolvedValue(scoring.context, "primaryGoal") as keyof typeof GOAL_RELEVANCE | undefined;
  const friction = resolvedValue(scoring.context, "primaryFriction") as keyof typeof FRICTION_RELEVANCE | undefined;
  const levelIn = (list: readonly DigitalDimensionId[] | undefined, id: DigitalDimensionId): RelevanceLevel => { const index = list?.indexOf(id) ?? -1; return index === 0 ? "primary" : index > 0 ? "related" : "none"; };
  const relevanceOf = (id: DigitalDimensionId) => ({ goal: goal ? levelIn(GOAL_RELEVANCE[goal], id) : "none" as RelevanceLevel, friction: friction ? levelIn(FRICTION_RELEVANCE[friction], id) : "none" as RelevanceLevel });
  const relevanceRank = (id: DigitalDimensionId) => { const relevance = relevanceOf(id); return relevance.goal === "primary" || relevance.friction === "primary" ? 0 : relevance.goal === "related" || relevance.friction === "related" ? 1 : 2; };
  // 08D order is the dominant sequencing source inside every band.
  const constraintIndex = new Map(priorities.constraints.map((constraint, index) => [constraint.dimension, index]));
  const constraintRank = (id: DigitalDimensionId) => constraintIndex.get(id) ?? priorities.constraints.length;
  const dimensionRank = (id: DigitalDimensionId) => DIGITAL_DIMENSION_IDS.indexOf(id);
  const constraintOf = (id: DigitalDimensionId): DiagnosticConstraint | undefined => priorities.constraints.find((constraint) => constraint.dimension === id);
  const priorityDimensions = new Set(priorities.priorities.map((priority) => priority.dimension));

  const resolution = resolveEligibleQuestionsV2(input.answers, bank);
  /** Observable when some direct question for the dimension was eligible or answered in this context. */
  const observable = (id: DigitalDimensionId) => catalog.directQuestionIds(id).some((questionId) => resolution.eligibleQuestionIds.includes(questionId) || resolution.activeAnswers[questionId] !== undefined);

  const drafts: Draft[] = [];
  const readingIds = new Map<DigitalDimensionId, string>();
  const gapIds = new Map<DigitalDimensionId, string>();

  for (const item of scoring.dimensions) {
    const constraint = constraintOf(item.id);
    const relevance = relevanceOf(item.id);
    const questionIds = [...item.explainability.direct, ...item.explainability.supporting];
    if (item.applicability === "applicable" && item.score !== null) {
      const { type, certainty } = reading(item, severity);
      const id = `${type}:${item.id}`;
      readingIds.set(item.id, id);
      const evidenced = constraint && (constraint.severity === "material" || constraint.severity === "moderate") ? constraint : undefined;
      drafts.push({
        id, type, semanticCode: DIMENSION_READING_CODES[item.id][type], dimension: item.id, certainty, severity: evidenced?.severity, score: item.score, confidence: item.confidence.level, relevance,
        provenance: { questionIds, constraintId: evidenced?.id }, signals: signalsOf(item, catalog),
        sortKey: type === "strength" ? [relevanceRank(item.id), certainty === "confirmed" ? 0 : 1, -item.score!, dimensionRank(item.id)] : [constraintRank(item.id), dimensionRank(item.id)],
      });
      if (item.explainability.contradictions.length > 0) drafts.push({
        id: `contradiction:${item.id}`, type: "contradiction", semanticCode: "mixed_signals", dimension: item.id, score: item.score, confidence: item.confidence.level, relevance,
        provenance: { questionIds: [...new Set(item.explainability.contradictions.flatMap((pair) => [pair.positive, pair.negative]))], constraintId: constraint?.id },
        contradiction: { pairs: item.explainability.contradictions, affectsPriority: priorityDimensions.has(item.id) },
        sortKey: [constraintRank(item.id), dimensionRank(item.id)],
      });
    }
    if (item.applicability === "applicable" && item.explainability.dependencies.length > 0) drafts.push({
      id: `risk:${item.id}`, type: "risk", semanticCode: "single_point_dependency", dimension: item.id, confidence: item.confidence.level, relevance,
      provenance: { questionIds: item.explainability.dependencies, constraintId: constraint?.id }, sortKey: [constraintRank(item.id), dimensionRank(item.id)],
    });
    // A dimension that structurally does not apply but was still asked about: recorded, never scored.
    if (item.applicability === "not_applicable" && item.evidence.length > 0) drafts.push({
      id: `evidence_gap:${item.id}`, type: "evidence_gap", semanticCode: "not_applicable", dimension: item.id, relevance,
      provenance: { questionIds: item.evidence.map((evidence) => evidence.questionId) }, gap: { kind: "not_applicable", blocks: [] }, sortKey: [2, dimensionRank(item.id)],
    });
  }

  // One uncertainty fact per "unknown" answer (not per mapped dimension), anchored to its direct dimension.
  const uncertain = new Map<string, DigitalDimensionId[]>();
  for (const item of scoring.dimensions.filter((dimension) => dimension.applicability === "applicable")) for (const evidence of item.evidence) if (evidence.state === "uncertainty" && evidence.directness !== "contextual") uncertain.set(evidence.questionId, [...(uncertain.get(evidence.questionId) ?? []), item.id]);
  for (const [questionId, dimensions] of uncertain) {
    const anchor = dimensions.find((id) => catalog.directness(questionId, id) === "direct") ?? dimensions[0]!;
    drafts.push({ id: `uncertainty:${questionId}`, type: "uncertainty", semanticCode: "respondent_uncertain", dimension: anchor, relevance: relevanceOf(anchor), provenance: { questionIds: [questionId] }, sortKey: [relevanceRank(anchor), constraintRank(anchor), dimensionRank(anchor)] });
  }

  // Declared pain vs observed capability: the friction's own dimension reads as a confirmed strength.
  const frictionDimension = friction ? FRICTION_RELEVANCE[friction][0] : undefined;
  const frictionReading = frictionDimension ? scoring.dimensions.find((item) => item.id === frictionDimension) : undefined;
  if (frictionReading && frictionReading.applicability === "applicable" && frictionReading.score !== null && reading(frictionReading, severity).type === "strength" && reading(frictionReading, severity).certainty === "confirmed") drafts.push({
    id: `contradiction:declared_friction:${frictionReading.id}`, type: "contradiction", semanticCode: "declared_friction_not_observed", dimension: frictionReading.id, score: frictionReading.score, confidence: frictionReading.confidence.level,
    relevance: relevanceOf(frictionReading.id), provenance: { questionIds: frictionReading.explainability.direct },
    sortKey: [constraintRank(frictionReading.id), dimensionRank(frictionReading.id)],
  });

  for (const constraint of priorities.constraints.filter((item) => item.kind === "evidence_gap")) {
    const kind: EvidenceGapKind = constraint.score !== null ? "declared_friction_unconfirmed" : observable(constraint.dimension) ? "insufficient_evidence" : resolvedValue(scoring.context, "growthStage") === "idea" ? "legitimate_uncertainty" : "unobservable_in_context";
    const id = `evidence_gap:${constraint.dimension}`;
    gapIds.set(constraint.dimension, id);
    drafts.push({
      id, type: "evidence_gap", semanticCode: kind, dimension: constraint.dimension, score: constraint.score, confidence: constraint.confidence, relevance: relevanceOf(constraint.dimension),
      provenance: { questionIds: constraint.evidence, constraintId: constraint.id, reasonCodes: constraint.reasonCodes }, gap: { kind, blocks: constraint.dependency.blocks },
      sortKey: [kind === "insufficient_evidence" || kind === "declared_friction_unconfirmed" ? 0 : 1, constraintRank(constraint.dimension), dimensionRank(constraint.dimension)],
    });
  }

  // Dependencies only for evidenced constraints: an unverified prerequisite stays inside its gap fact.
  for (const constraint of priorities.constraints.filter((item) => item.severity === "material" || item.severity === "moderate")) {
    const edgeRelation = (to: DigitalDimensionId) => DIMENSION_DEPENDENCIES.find((edge) => edge.from === constraint.dimension && edge.to === to)!.relation;
    const groups: [keyof typeof DEPENDENCY_CODES, readonly DigitalDimensionId[], readonly DigitalDimensionId[]][] = [
      ["enables", [constraint.dimension], constraint.dependency.blocks.filter((to) => edgeRelation(to) === "enables")],
      ["sustains", [constraint.dimension], constraint.dependency.blocks.filter((to) => edgeRelation(to) === "sustains")],
      ["feeds", constraint.dependency.upstream, constraint.dependency.upstream.length > 0 ? [constraint.dimension] : []],
      ["informs", [constraint.dimension], constraint.dependency.informs],
    ];
    for (const [relation, from, to] of groups) if (from.length > 0 && to.length > 0) drafts.push({
      id: `dependency:${DEPENDENCY_CODES[relation]}:${constraint.dimension}`, type: "dependency", semanticCode: DEPENDENCY_CODES[relation], dimension: constraint.dimension, severity: constraint.severity, confidence: constraint.confidence,
      relevance: relevanceOf(constraint.dimension), provenance: { questionIds: constraint.evidence, constraintId: constraint.id, reasonCodes: constraint.reasonCodes },
      dependency: { relation, from, to }, sortKey: [constraintRank(constraint.dimension), dimensionRank(constraint.dimension)],
    });
  }

  for (const priority of priorities.priorities) drafts.push({
    id: `priority:${priority.rank}`, type: "priority", semanticCode: PRIORITY_CODES[priority.kind], dimension: priority.dimension, severity: priority.severity, score: priority.score, confidence: priority.confidence,
    relevance: { goal: priority.relevance.goal, friction: priority.relevance.friction },
    provenance: { questionIds: priority.evidence, constraintId: priority.constraintId, priorityRank: priority.rank, reasonCodes: priority.reasonCodes },
    priority: { rank: priority.rank, actionability: priority.certainty, constraintKind: priority.kind, targetFactId: (priority.kind === "evidence_gap" ? gapIds.get(priority.dimension) : readingIds.get(priority.dimension)) ?? `evidence_gap:${priority.dimension}` },
    sortKey: [priority.rank],
  });

  const typeRank = (type: SemanticFactType) => SEMANTIC_FACT_TYPES.indexOf(type);
  const compareKeys = (a: readonly number[], b: readonly number[]) => { for (let index = 0; index < Math.max(a.length, b.length); index += 1) if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) - (b[index] ?? 0); return 0; };
  const sorted = [...drafts].sort((a, b) => FACT_IMPORTANCE[a.type] - FACT_IMPORTANCE[b.type] || typeRank(a.type) - typeRank(b.type) || compareKeys(a.sortKey, b.sortKey) || a.id.localeCompare(b.id));
  const facts = sorted.map(({ sortKey: _sortKey, ...fact }, index): SemanticFact => ({ ...fact, importance: FACT_IMPORTANCE[fact.type], order: index + 1 }));
  return { context: contextFacts(scoring.context), facts };
}
