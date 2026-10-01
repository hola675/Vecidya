import type { QuestionBankV2 } from "./qbv2-engine";
import type { ResolvedDomainContext } from "./context-resolver";
import { resolveEligibleQuestionsV2 } from "./qbv2-engine";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import type { EvidenceKind, DigitalDimensionId, EvidenceDirectness } from "./qbv2-coverage";
import { DIGITAL_DIMENSIONS, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING } from "./qbv2-coverage";
import type { AnswersV2 } from "./qbv2-rules";
import type { QuestionDefinitionV2 } from "./qbv2-contract";

/**
 * DIAG-V3-08C scoring model. The adaptive planner is the canonical input: scoring works with whatever
 * evidence the route legitimately collected. There is no minimum observation count to produce a number;
 * score = capability suggested by observed evidence, confidence = how complete/direct/consistent it is.
 */

// ── Semantic states and their contribution ──────────────────────────────────

export const CAPABILITY_STATES = ["strong", "established", "partial", "weak", "missing", "dependency", "constraint", "uncertainty", "not_applicable"] as const;
export type CapabilityState = (typeof CAPABILITY_STATES)[number];

/**
 * Single source of numeric contribution. `null` states never enter numerator or denominator:
 * constraints describe the context of a capability, uncertainty and N/A carry no capability reading.
 * `dependency` means the capability exists but rests on a single channel/person; it reads as weak.
 */
export const CAPABILITY_CONTRIBUTION: Readonly<Record<CapabilityState, number | null>> = {
  strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0,
  constraint: null, uncertainty: null, not_applicable: null,
};

/** Coarse 08B evidence taxonomy kept for explainability and mapping compatibility. */
const STATE_KIND: Readonly<Record<CapabilityState, EvidenceKind>> = {
  strong: "established", established: "established", partial: "partial", weak: "partial", missing: "missing",
  dependency: "dependency", constraint: "constraint", uncertainty: "uncertainty", not_applicable: "not_applicable",
};

/**
 * Aggregation: weighted mean of contributions. Supporting observations weigh half a direct one and,
 * together, never more than half of the total direct weight, so they refine but cannot outvote direct evidence.
 */
export const SCORING_MODEL = { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 } as const;

/**
 * Confidence: strength = direct + supportingWeight × min(supporting, direct). Supporting evidence can at most
 * double-count the direct base, so 1 direct + 3 supporting never beats 2 direct. Each penalty (direct
 * contradiction, uncertain answers) lowers one level. No score → confidence stays low.
 */
export const CONFIDENCE_MODEL = { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 } as const;

// ── Declarative answer semantics (one entry per dimension-mapped question) ──

type StateTable = Readonly<Record<string, CapabilityState>>;
export type AnswerSemantics = {
  /** State of each selectable value; `unknown`/`not_applicable` option kinds resolve automatically. */
  readonly values: StateTable;
  /** Dimension-specific reading of the same answer (overrides `values` and option kinds). */
  readonly byDimension?: Partial<Record<DigitalDimensionId, StateTable>>;
  /** Multiselect reading by number of distinct selected values: one question stays one observation. */
  readonly selectionCount?: { readonly dimension: DigitalDimensionId; readonly states: readonly CapabilityState[] };
};

const SOURCE_KNOWN = { measurement_optimization: { social: "partial", search: "partial", ads: "partial", referral: "partial", unknown: "missing" } } as const;

export const ANSWER_SEMANTICS: Readonly<Record<string, AnswerSemantics>> = {
  // Discovery
  q2_ecommerce_traffic_sources: { values: { social: "partial", search: "partial", ads: "partial", referral: "partial" }, byDimension: SOURCE_KNOWN, selectionCount: { dimension: "discovery", states: ["dependency", "partial", "partial", "established"] } },
  q2_local_foot_traffic: { values: { high: "dependency", low: "constraint" } },
  q2_local_discovery: { values: { maps_search: "established", social: "established", referral: "partial", paid_ads: "partial", walk_by: "weak" }, byDimension: { measurement_optimization: { maps_search: "partial", social: "partial", referral: "partial", paid_ads: "partial", walk_by: "partial", unknown: "weak" } } },
  q2_retail_promotions: { values: { yes_regular: "established", rarely: "weak", no: "missing" } },
  q2_professional_referral_dependency: { values: { mostly_referrals: "dependency", mixed: "strong", mostly_other: "established" } },
  q2_ecommerce_acquisition_dependency: { values: { single_channel: "dependency", few_channels: "partial", diverse: "strong" } },
  q2_b2b_lead_source: { values: { inbound: "established", referrals: "partial", outbound: "partial", partnerships: "partial", paid: "partial" }, byDimension: { measurement_optimization: { inbound: "partial", referrals: "partial", outbound: "partial", partnerships: "partial", paid: "partial", unknown: "missing" } } },
  q2_creator_channel_concentration: { values: { highly_concentrated: "dependency", somewhat_spread: "partial", well_diversified: "strong" } },
  q2_creator_content_consistency: { values: { consistent_schedule: "established", irregular: "partial", rarely: "weak" } },
  q2_startup_first_channel: { values: { specific_channel: "established", several_candidates: "partial", no_channel: "missing" } },
  // Digital foundation
  q2_local_presence_consistency: { values: { consistent: "strong", partial: "partial", no: "missing" } },
  q2_ecommerce_product_discovery: { values: { yes_easy: "strong", somewhat_confusing: "partial", hard_to_navigate: "weak" } },
  // Trust & reputation
  q2_reputation_flow: { values: { steady: "established", rare: "weak" } },
  q2_professional_authority_signals: { values: { clearly_visible: "strong", partial: "partial", not_really: "missing" } },
  // Clarity & conversion
  q2_retail_product_visibility: { values: { yes_clear: "strong", partially: "partial", no: "missing" } },
  q2_b2b_qualification: { values: { yes_clear: "strong", somewhat: "partial", no: "missing" } },
  q2_professional_intake_flow: { values: { defined_consult: "strong", ad_hoc: "partial", direct_no_step: "established" }, byDimension: { clarity_positioning: { defined_consult: "established", ad_hoc: "partial", direct_no_step: "constraint" } } },
  q2_nonprofit_donation_clarity: { values: { yes_easy: "strong", somewhat_confusing: "partial", no: "missing" } },
  q2_startup_problem_clarity: { values: { clear_audience_problem: "strong", problem_clear_audience_unclear: "partial", audience_clear_problem_unclear: "partial", both_unclear: "missing" } },
  q2_startup_validation_evidence: { values: { repeated_problem: "strong", problem_test: "established", conversations: "partial", none: "missing" } },
  q2_startup_offer_readiness: { values: { ready_to_test: "strong", mostly_ready: "established", shaping: "weak", not_defined: "missing" } },
  q2_startup_demand_signal: { values: { commitment: "strong", paid_trial: "established", request: "partial", interest: "weak", none: "missing" } },
  q2_service_response_speed: { values: { fast: "strong", delayed: "partial", some_lost: "weak" } },
  q2_service_quote_followup: { values: { always: "strong", sometimes: "partial", rarely: "missing" } },
  q2_appointments_booking_method: { values: { self_book_online: "strong", staff_manual: "partial", call_message: "weak", informal: "missing" } },
  q2_appointments_booking_friction: { values: { rarely: "strong", sometimes: "partial", often: "weak" } },
  q2_appointments_lead_to_booking: { values: { most: "strong", about_half: "partial", few: "weak" } },
  q2_ecommerce_checkout_friction: { values: { rarely: "strong", sometimes: "partial", often: "weak" } },
  q2_hospitality_delivery_takeaway: { values: { both: "strong", takeaway_only: "partial", delivery_only: "partial", no: "constraint" } },
  q2_b2b_decision_makers: { values: { single: "constraint", multiple: "constraint", varies: "constraint" } },
  q2_creator_conversion: { values: { regularly: "established", occasionally: "partial", rarely: "weak" } },
  // Relationship & recurrence
  q2_local_repeat_customers: { values: { yes_regular: "established", rarely: "weak", no: "missing" } },
  q2_service_repeat_referral: { values: { both: "strong", repeat_only: "established", referrals_only: "partial", rarely: "missing" } },
  q2_appointments_confirmation_reminders: { values: { automatic: "strong", manual: "established", none: "missing" } },
  q2_appointments_rebooking: { values: { yes_proactive: "strong", reactive: "partial", no_followup: "missing" } },
  q2_professional_followup_after_consult: { values: { always: "strong", sometimes: "partial", rarely_never: "missing" } },
  q2_retail_customer_capture: { values: { systematic: "strong", sometimes: "partial", no: "missing" } },
  q2_ecommerce_cart_followup: { values: { always: "strong", sometimes: "partial", rarely: "missing" } },
  q2_ecommerce_repeat_purchase: { values: { frequently: "established", occasionally: "partial", rarely: "weak" } },
  q2_b2b_sales_cycle: { values: { rarely: "constraint", sometimes: "constraint", almost_always: "constraint" } },
  q2_creator_audience_ownership: { values: { systematic: "strong", partial: "partial", no: "missing" } },
  q2_followup_general_process: { values: { defined_process: "strong", manual_consistent: "established", memory_dependent: "weak", sometimes_lost: "missing" } },
  q2_followup_ownership: { values: { yes_clear: "strong", unclear: "weak" } },
  q2_followup_status_visibility: { values: { regularly: "established", only_when_remember: "weak", rarely: "missing" } },
  // Measurement & optimization
  q2_ecommerce_cart_visibility: { values: { yes: "established", no: "missing" } },
  q2_measurement_source_confidence: { values: { yes_confident: "strong", sometimes: "partial", rarely_no_idea: "missing" } },
  q2_measurement_outcome_tracking: { values: { yes_approx: "established", rough_idea: "weak", no_idea: "missing" } },
  q2_measurement_decision_review: { values: { regularly: "established", occasionally: "partial", rarely_never: "missing" } },
  // Digital readiness
  q2_b2b_pipeline: { values: { yes: "strong", no: "missing" } },
  q2_b2b_status_visibility: { values: { yes_clear: "strong", somewhat: "partial", lose_track: "missing" } },
  q2_hospitality_peak_capacity: { values: { rarely: "established", sometimes: "partial", often: "weak" } },
  q2_creator_monetization_model: { values: { sponsorship: "constraint", services: "constraint", digital_products: "constraint", memberships: "constraint", commerce: "constraint" } },
  q2_nonprofit_membership_lifecycle: { values: { yes_clear: "strong", somewhat: "partial", no: "missing" } },
  q2_operations_process_ownership: { values: { yes_clear: "strong", somewhat: "partial", improvised: "missing" } },
  q2_operations_handoffs: { values: { transfers_cleanly: "strong", sometimes_lost: "weak" } },
  q2_operations_bottleneck: { values: { no_clear_bottleneck: "established", manual_tasks: "weak", scattered_info: "weak", one_person: "dependency", approvals: "constraint" } },
  q2_operations_manual_impact: { values: { not_really: "established", somewhat: "partial", significant: "weak" } },
  q2_operations_dependency: { values: { yes_would_continue: "strong", partially: "partial", no_would_stop: "dependency" } },
};

/** Questions that only resolve context/applicability: no dimension mapping, no capability points. */
export const CONTEXT_ONLY_QUESTION_IDS: ReadonlySet<string> = new Set(Object.values(EVIDENCE_MAPPING).filter((mapping) => mapping.dimensions.length === 0).map((mapping) => mapping.questionId));

/** Every selectable value of every dimension-mapped question must resolve to a declared state; no fallback. */
export function validateAnswerSemantics(bank: QuestionBankV2 = QUESTION_BANK_V2): readonly string[] {
  const issues: string[] = [];
  for (const question of bank) {
    const mapping = EVIDENCE_MAPPING[question.id];
    if (!mapping || mapping.dimensions.length === 0) { if (ANSWER_SEMANTICS[question.id]) issues.push(`semantics declared for context-only question: ${question.id}`); continue; }
    if (!ANSWER_SEMANTICS[question.id]) { issues.push(`missing answer semantics: ${question.id}`); continue; }
    for (const dimension of mapping.dimensions) for (const option of question.options) if (stateForValue(question, dimension, option.value) === undefined) issues.push(`undeclared state: ${question.id}.${option.value} (${dimension})`);
  }
  for (const id of Object.keys(ANSWER_SEMANTICS)) if (!bank.some((question) => question.id === id)) issues.push(`semantics reference unknown question: ${id}`);
  return issues;
}

// ── Evidence derivation ─────────────────────────────────────────────────────

export type ContextualEvidence = {
  readonly questionId: string;
  readonly dimension: DigitalDimensionId;
  /** One question/dimension pair is one observation, even when the answer is multi-select. */
  readonly observationId: string;
  readonly directness: EvidenceDirectness;
  readonly state: CapabilityState;
  readonly kind: EvidenceKind;
  /** From `CAPABILITY_CONTRIBUTION`; `null` never participates in the score. */
  readonly contribution: number | null;
  readonly answer: readonly string[];
};

function selectedValues(answer: string | readonly string[] | undefined): readonly string[] { return answer === undefined ? [] : Array.isArray(answer) ? [...new Set(answer as readonly string[])] : [answer as string]; }

function stateForValue(question: QuestionDefinitionV2, dimension: DigitalDimensionId, value: string): CapabilityState | undefined {
  const semantics = ANSWER_SEMANTICS[question.id];
  const override = semantics?.byDimension?.[dimension]?.[value];
  if (override) return override;
  const optionKind = question.options.find((option) => option.value === value)?.kind;
  if (optionKind === "unknown") return "uncertainty";
  if (optionKind === "not_applicable") return "not_applicable";
  return semantics?.values[value];
}

function contributionOf(state: CapabilityState): number { return CAPABILITY_CONTRIBUTION[state] ?? Number.POSITIVE_INFINITY; }

/** Resolves one answer into one state for one dimension. Unknown values stay uncertainty — never an invented level. */
function stateForAnswer(question: QuestionDefinitionV2, dimension: DigitalDimensionId, values: readonly string[]): CapabilityState {
  const states = values.map((value) => stateForValue(question, dimension, value) ?? "uncertainty");
  const rule = ANSWER_SEMANTICS[question.id]?.selectionCount;
  const capability = states.filter((state) => CAPABILITY_CONTRIBUTION[state] !== null);
  if (rule?.dimension === dimension && capability.length > 0) return rule.states[Math.min(capability.length, rule.states.length) - 1]!;
  if (capability.length > 0) return capability.reduce((weakest, state) => (contributionOf(state) < contributionOf(weakest) ? state : weakest));
  return states.includes("not_applicable") ? "not_applicable" : states.includes("constraint") ? "constraint" : "uncertainty";
}

export function deriveContextualEvidence(answers: AnswersV2, bank: QuestionBankV2 = QUESTION_BANK_V2): readonly ContextualEvidence[] {
  const byId = new Map(bank.map((question) => [question.id, question]));
  const entries: ContextualEvidence[] = [];
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = byId.get(questionId); const mapping = EVIDENCE_MAPPING[questionId];
    if (!question || !mapping || CONTEXT_ONLY_QUESTION_IDS.has(questionId)) continue;
    const values = selectedValues(answer); if (values.length === 0) continue;
    for (const dimension of mapping.dimensions) {
      const directness = EVIDENCE_DIRECTNESS[questionId]?.[dimension] ?? mapping.semanticRole;
      const state = stateForAnswer(question, dimension, values);
      entries.push({ questionId, dimension, observationId: questionId, directness, state, kind: STATE_KIND[state], contribution: CAPABILITY_CONTRIBUTION[state], answer: values });
    }
  }
  return entries;
}

// ── Dimension results ───────────────────────────────────────────────────────

export type ContextualScoringContext = {
  readonly answers: AnswersV2;
  readonly context: Partial<ResolvedDomainContext>;
  readonly evidence: readonly ContextualEvidence[];
  readonly bank?: QuestionBankV2;
};

export type DimensionApplicability = "applicable" | "not_applicable" | "insufficient_context";
export type ContextualConfidenceLevel = "high" | "medium" | "low";
export type ScoreBasis = "direct" | "direct_and_supporting" | "supporting_only" | "none";
export type ConfidencePenalty = "direct_contradiction" | "uncertain_answers";
export type EvidenceGap = "no_evidence" | "no_direct_evidence" | "single_direct_observation";

export type DimensionConfidence = {
  readonly level: ContextualConfidenceLevel;
  /** Independent observations by role; multiselect arrays never add observations. */
  readonly direct: number;
  readonly supporting: number;
  readonly contextual: number;
  readonly uncertain: number;
  readonly independent: number;
  readonly strength: number;
  readonly contradictory: boolean;
  readonly penalties: readonly ConfidencePenalty[];
};

export type DimensionContradiction = { readonly positive: string; readonly negative: string };

export type DimensionExplainability = {
  readonly basis: ScoreBasis;
  readonly direct: readonly string[];
  readonly supporting: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly missing: readonly string[];
  readonly dependencies: readonly string[];
  readonly constraints: readonly string[];
  readonly uncertainty: readonly string[];
  readonly contradictions: readonly DimensionContradiction[];
  readonly gaps: readonly EvidenceGap[];
};

export type ContextualDimensionResult = {
  readonly id: DigitalDimensionId;
  readonly label: string;
  readonly applicability: DimensionApplicability;
  readonly score: number | null;
  readonly confidence: DimensionConfidence;
  readonly evidence: readonly ContextualEvidence[];
  readonly explainability: DimensionExplainability;
};

export type ContextualScoringResult = { readonly dimensions: readonly ContextualDimensionResult[]; readonly context: Partial<ResolvedDomainContext> };

const LEVELS: readonly ContextualConfidenceLevel[] = ["low", "medium", "high"];
const POSITIVE_AT = CAPABILITY_CONTRIBUTION.established!;
const NEGATIVE_AT = CAPABILITY_CONTRIBUTION.weak!;

function resolvedValue(context: Partial<ResolvedDomainContext>, field: "primaryGoal" | "growthStage"): string | undefined { const value = context[field]; return value?.status === "resolved" ? value.value : undefined; }

/** Context decides applicability only; it never adds capability points. */
function applicability(dimension: DigitalDimensionId, context: Partial<ResolvedDomainContext>, evidence: readonly ContextualEvidence[]): DimensionApplicability {
  const stage = resolvedValue(context, "growthStage"); const goal = resolvedValue(context, "primaryGoal");
  // Structural: an idea has no operation to build reputation on, retain or measure, whatever a module asked.
  // The evidence stays in the result for explainability but never becomes a percentage.
  if (stage === "idea" && ["trust_reputation", "relationship_recurrence", "measurement_optimization"].includes(dimension)) return "not_applicable";
  if (evidence.some((item) => item.state !== "not_applicable")) return "applicable";
  if (!stage && !goal) return "insufficient_context";
  if (dimension === "measurement_optimization" && goal !== "measure" && stage !== "growing" && stage !== "scaling") return "not_applicable";
  if (dimension === "relationship_recurrence" && ["idea", "starting"].includes(stage ?? "")) return "not_applicable";
  return "applicable";
}

function directContradictions(direct: readonly ContextualEvidence[]): readonly DimensionContradiction[] {
  const positives = direct.filter((item) => item.contribution! >= POSITIVE_AT);
  const negatives = direct.filter((item) => item.contribution! <= NEGATIVE_AT);
  return positives.flatMap((positive) => negatives.map((negative) => ({ positive: positive.questionId, negative: negative.questionId })));
}

function weightedScore(direct: readonly ContextualEvidence[], supporting: readonly ContextualEvidence[]): number | null {
  if (direct.length === 0) return null;
  const directWeight = direct.length * SCORING_MODEL.directWeight;
  const supportingWeight = Math.min(supporting.length * SCORING_MODEL.supportingWeight, directWeight * SCORING_MODEL.supportingCapRatio);
  const perSupporting = supporting.length > 0 ? supportingWeight / supporting.length : 0;
  const numerator = direct.reduce((sum, item) => sum + item.contribution! * SCORING_MODEL.directWeight, 0) + supporting.reduce((sum, item) => sum + item.contribution! * perSupporting, 0);
  return Math.round((100 * numerator) / (directWeight + supportingWeight));
}

function confidenceFor(direct: readonly ContextualEvidence[], supporting: readonly ContextualEvidence[], observations: readonly ContextualEvidence[], contradictions: readonly DimensionContradiction[]): DimensionConfidence {
  const uncertain = observations.filter((item) => item.state === "uncertainty" && item.directness !== "contextual").length;
  const strength = direct.length + CONFIDENCE_MODEL.supportingWeight * Math.min(supporting.length, direct.length);
  const penalties: ConfidencePenalty[] = [];
  if (contradictions.length > 0) penalties.push("direct_contradiction");
  if (uncertain > 0) penalties.push("uncertain_answers");
  const base = direct.length === 0 ? 0 : strength >= CONFIDENCE_MODEL.highAt ? 2 : strength >= CONFIDENCE_MODEL.mediumAt ? 1 : 0;
  return {
    level: LEVELS[Math.max(0, base - penalties.length)]!,
    direct: direct.length, supporting: supporting.length,
    contextual: observations.filter((item) => item.directness === "contextual").length,
    uncertain, independent: new Set(observations.map((item) => item.observationId)).size, strength,
    contradictory: contradictions.length > 0, penalties,
  };
}

function scoreDimension(dimension: DigitalDimensionId, context: Partial<ResolvedDomainContext>, evidence: readonly ContextualEvidence[]): ContextualDimensionResult {
  const unique = new Map<string, ContextualEvidence>();
  for (const item of evidence) if (item.dimension === dimension && !unique.has(item.observationId)) unique.set(item.observationId, item);
  const observations = [...unique.values()];
  const capability = observations.filter((item) => item.directness !== "contextual" && item.contribution !== null);
  const direct = capability.filter((item) => item.directness === "direct");
  const supporting = capability.filter((item) => item.directness === "supporting");
  const applicable = applicability(dimension, context, observations);
  const contradictions = directContradictions(direct);
  const ids = (states: readonly CapabilityState[]) => observations.filter((item) => states.includes(item.state)).map((item) => item.questionId);
  const basis: ScoreBasis = direct.length > 0 ? (supporting.length > 0 ? "direct_and_supporting" : "direct") : supporting.length > 0 ? "supporting_only" : "none";
  const gaps: EvidenceGap[] = capability.length === 0 ? ["no_evidence"] : direct.length === 0 ? ["no_direct_evidence"] : direct.length === 1 ? ["single_direct_observation"] : [];
  return {
    id: dimension,
    label: DIGITAL_DIMENSIONS.find((item) => item.id === dimension)!.label,
    applicability: applicable,
    score: applicable === "applicable" ? weightedScore(direct, supporting) : null,
    confidence: confidenceFor(direct, supporting, observations, contradictions),
    evidence: observations,
    explainability: {
      basis,
      direct: direct.map((item) => item.questionId), supporting: supporting.map((item) => item.questionId),
      strengths: ids(["strong", "established"]), weaknesses: ids(["partial", "weak"]), missing: ids(["missing"]),
      dependencies: ids(["dependency"]), constraints: ids(["constraint"]), uncertainty: ids(["uncertainty"]),
      contradictions, gaps,
    },
  };
}

export function scoreContextualDimensions(input: ContextualScoringContext): ContextualScoringResult {
  const bank = input.bank ?? QUESTION_BANK_V2;
  const resolution = resolveEligibleQuestionsV2(input.answers, bank);
  const context = Object.keys(input.context).length > 0 ? input.context : resolution.context;
  // Only answers still active under the resolved context count as evidence.
  const evidence = input.evidence.length > 0 ? input.evidence : deriveContextualEvidence(resolution.activeAnswers, bank);
  return { context, dimensions: DIGITAL_DIMENSIONS.map((dimension) => scoreDimension(dimension.id, context, evidence)) };
}
