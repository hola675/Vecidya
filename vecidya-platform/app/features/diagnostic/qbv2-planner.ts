import type { DimensionId } from "./types";
import { CURRENT_ROUTING_VERSION } from "./contracts";
import { type ModuleId, type QuestionDefinitionV2, type QuestionPriority, type QuestionPurpose } from "./qbv2-contract";
import { resolveEligibleQuestionsV2, type QuestionBankV2, type ResolveEligibleQuestionsResult } from "./qbv2-engine";
import { CONTRADICTION_RULES_VERSION, DEFAULT_CONTRADICTION_RULES_V1, detectContradictionsV2, getTriggeredConfirmations, type ContradictionRuleV1, type DetectedContradiction } from "./qbv2-contradictions";
import { CONTEXT_FIELD_REFS, evaluateRuleV2, type AnswersV2, type ContextFieldRef, type RuleV2 } from "./qbv2-rules";
import { signalProductionContextFields } from "./qbv2-signals";
import { deriveContextualEvidence, scoreContextualDimensions } from "./qbv2-contextual-scoring";
import { EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, type DigitalDimensionId } from "./qbv2-coverage";
import { FRICTION_RELEVANCE, GOAL_RELEVANCE, deriveConstraintsAndPriorities } from "./qbv2-priorities";
import { bandFor, computeDigitalPresenceIndex, type OverallState } from "./qbv2-overall";

/** DIAG-V3-08B.4: planner version is deliberately independent from QBV1/QBV2 activation. */
export const ADAPTIVE_PLANNER_VERSION = 2 as const;
export type AdaptivePlannerVersion = typeof ADAPTIVE_PLANNER_VERSION;

export type RouteBudgetV1 = {
  readonly targetMin: number;
  readonly targetMax: number;
  readonly hardMax: number;
  readonly confirmationReserve: number;
  /**
   * DIAG-V3-08D.1: the last N slots below `hardMax` are reserved for material evidence. Every other
   * selection stops at `hardMax - materialEvidenceReserve`, so routes without an open need are unchanged.
   */
  readonly materialEvidenceReserve?: number;
  readonly moduleMax: Readonly<Partial<Record<ModuleId, number>>>;
};

/** Absolute product limit for productive questions in one route (DIAG-V3-08E.2; 20 in 08D.1, 18 before). */
export const ROUTE_HARD_CAP = 24;

/**
 * DIAG-V3-08E.2 route bands: the adaptive base route (1–18), the material extension (19–20) and the
 * evidence-completion reserve (21–24). Slots past the base only serve open material evidence needs.
 */
export const ROUTE_BANDS = { base: 18, materialExtension: 20, hardCap: ROUTE_HARD_CAP } as const;

export const DEFAULT_ROUTE_BUDGET_V1: RouteBudgetV1 = {
  targetMin: 10,
  targetMax: 16,
  hardMax: ROUTE_HARD_CAP,
  confirmationReserve: 2,
  materialEvidenceReserve: ROUTE_HARD_CAP - ROUTE_BANDS.base,
  moduleMax: {
    core: 3, classification: 6, maturity: 6, goal_friction: 3,
    startup: 6, operations: 3, follow_up: 3, measurement: 3, confirmation: 2,
    local: 3, local_service: 3, appointments: 5, professional: 5, retail: 3,
    ecommerce: 5, hospitality: 4, b2b: 5, creator: 4, nonprofit: 4, reputation: 1, conversion: 1, discovery: 1,
  },
};

function normalizeRouteBudget(budget: RouteBudgetV1, activeAnswerCount: number): RouteBudgetV1 {
  const hardMax = Math.min(ROUTE_HARD_CAP, Math.max(1, budget.hardMax, activeAnswerCount));
  const targetMax = Math.min(hardMax, Math.max(0, budget.targetMax));
  return {
    ...budget,
    materialEvidenceReserve: Math.min(hardMax - 1, Math.max(0, budget.materialEvidenceReserve ?? 0)),
    targetMin: Math.min(targetMax, Math.max(0, budget.targetMin)),
    targetMax,
    hardMax,
    confirmationReserve: Math.min(hardMax, Math.max(0, budget.confirmationReserve)),
  };
}

export type PlannerSkipReason = "module_budget" | "redundant_evidence" | "lower_priority" | "hard_cap" | "primary_route_complete" | "context_already_resolved" | "component_covered" | "refinement_not_needed" | "material_not_needed";
export type QuestionSelectionReason = "required_context" | "unlock_routing" | "goal_or_friction" | "specialized_evidence" | "cross_cutting_evidence" | "prospective_evidence" | "refinement" | "confirmation";

// ── Material evidence need (DIAG-V3-08D.1) ──────────────────────────────────

/**
 * A dimension the user's own declaration makes material: the friction's primary dimension (a declared
 * problem; two direct observations so one thin reading does not settle it), the goal's primary dimension
 * (one) and an unknown prerequisite (one) — DIAG-V3-08E.2: only one that blocks a constrained primary or
 * secondary priority or the declared goal/friction dimension; a capacity gate (`sustains`) ranks last.
 * An active constraint already has direct evidence, so it never opens a need. Answers decide capability;
 * these only decide which eligible direct question is worth asking first. Not dimension completion.
 */
export type MaterialEvidenceSource = "friction" | "goal" | "prerequisite" | "capacity_gate";
export type MaterialEvidenceNeed = { readonly dimension: DigitalDimensionId; readonly source: MaterialEvidenceSource; readonly target: number; readonly observed: number; readonly remaining: number };
export const MATERIAL_EVIDENCE_TARGET: Readonly<Record<MaterialEvidenceSource, number>> = { friction: 2, goal: 1, prerequisite: 1, capacity_gate: 1 };
const MATERIAL_SOURCE_RANK: Readonly<Record<MaterialEvidenceSource, number>> = { friction: 4, goal: 3, prerequisite: 2, capacity_gate: 1 };

function directDimensions(questionId: string): readonly DigitalDimensionId[] {
  const mapping = EVIDENCE_MAPPING[questionId];
  return mapping ? mapping.dimensions.filter((dimension) => (EVIDENCE_DIRECTNESS[questionId]?.[dimension] ?? mapping.semanticRole) === "direct") : [];
}

function mappedDimensions(questionId: string): readonly DigitalDimensionId[] {
  return EVIDENCE_MAPPING[questionId]?.dimensions ?? [];
}

function materialEvidenceNeeds(result: ResolveEligibleQuestionsResult, bank: QuestionBankV2): readonly MaterialEvidenceNeed[] {
  const goal = result.context.primaryGoal.status === "resolved" ? result.context.primaryGoal.value : undefined;
  const friction = result.context.primaryFriction.status === "resolved" ? result.context.primaryFriction.value : undefined;
  const evidence = deriveContextualEvidence(result.activeAnswers, bank);
  const scoring = scoreContextualDimensions({ answers: result.activeAnswers, context: result.context, evidence, bank });
  const applicable = new Set(scoring.dimensions.filter((item) => item.applicability !== "not_applicable").map((item) => item.id));
  const wanted = new Map<DigitalDimensionId, MaterialEvidenceSource>();
  const want = (dimension: DigitalDimensionId | undefined, source: MaterialEvidenceSource) => {
    if (!dimension || !applicable.has(dimension)) return;
    const current = wanted.get(dimension);
    if (!current || MATERIAL_SOURCE_RANK[source] > MATERIAL_SOURCE_RANK[current]) wanted.set(dimension, source);
  };
  const frictionDimension = friction ? FRICTION_RELEVANCE[friction][0] : undefined;
  // DIAG-V3-08E.3: a goal targets its first applicable relevant dimension, so a goal whose primary dimension
  // does not apply yet (e.g. `stop_losing` while starting, where recurrence is not applicable) still has an
  // evidence path through its related dimension (conversion leakage) instead of becoming a bare label.
  const goalDimension = goal ? GOAL_RELEVANCE[goal].find((dimension) => applicable.has(dimension)) : undefined;
  want(frictionDimension, "friction");
  want(goalDimension, "goal");
  const { constraints, priorities } = deriveConstraintsAndPriorities(scoring);
  // A prerequisite is verified only where it can change the diagnosis: it occupies or blocks one of the
  // two leading priorities, or blocks the declared goal/friction dimension — and what it blocks is weak.
  const leading = priorities.slice(0, 2);
  const key = new Set([...leading.map((item) => item.dimension), frictionDimension, goalDimension]);
  const constrained = new Set(constraints.filter((item) => item.severity === "material" || item.severity === "moderate").map((item) => item.dimension));
  for (const gap of constraints.filter((item) => item.kind === "evidence_gap" && item.score === null)) {
    const material = gap.dependency.blocks.some((blocked) => constrained.has(blocked) && (key.has(blocked) || leading.some((item) => item.id === gap.id)));
    if (material) want(gap.dimension, gap.reasonCodes.includes("prerequisite_of_relevant") ? "prerequisite" : "capacity_gate");
  }
  return [...wanted.entries()].map(([dimension, source]) => {
    // Any answered direct question counts, including "unknown": the planner already made the effort.
    // DIAG-V3-08E.2: an answer that observes no capability (not applicable, or a business constraint such
    // as "no takeaway") is not an observation of the dimension.
    const observed = new Set(evidence.filter((item) => item.dimension === dimension && item.directness === "direct" && item.state !== "not_applicable" && item.state !== "constraint").map((item) => item.questionId)).size;
    const target = MATERIAL_EVIDENCE_TARGET[source];
    return { dimension, source, target, observed, remaining: Math.max(0, target - observed) };
  });
}

export type QuestionRankMetadata = {
  readonly questionId: string;
  readonly module: ModuleId;
  readonly reason: QuestionSelectionReason;
  readonly required: boolean;
  readonly priority: QuestionPriority;
  readonly dimensions: readonly DimensionId[];
  /** Serves an open material evidence need at ranking time (direct evidence for that dimension). */
  readonly materialEvidence: boolean;
  readonly rank: readonly number[];
};

export type PlannerTraceEntry = QuestionRankMetadata & {
  readonly selected: boolean;
  /** DIAG-V3-08E.2: selection phase — the adaptive base route, or the material tail (extension + reserve). */
  readonly selectedIn?: "base" | "material" | "deepening";
  readonly skipReason?: PlannerSkipReason;
  readonly budgetState: { readonly routeLength: number; readonly moduleCount: number; readonly hardMax: number };
};

export type DiagnosticPlannerState = {
  readonly answers: AnswersV2;
  readonly bank: QuestionBankV2;
  readonly budget?: RouteBudgetV1;
  readonly contradictionRules?: readonly ContradictionRuleV1[];
};

export type QuestionPlan = {
  readonly plannerVersion: AdaptivePlannerVersion;
  readonly context: ResolveEligibleQuestionsResult["context"];
  readonly contextResolution: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>;
  readonly eligibleQuestionIds: readonly string[];
  readonly selectedQuestionIds: readonly string[];
  readonly nextQuestionId?: string;
  readonly routeLength: number;
  readonly budget: RouteBudgetV1;
  readonly moduleCounts: Readonly<Partial<Record<ModuleId, number>>>;
  readonly completion: CompletionStatus;
  readonly evidenceSufficiency: EvidenceSufficiency;
  readonly trace: readonly PlannerTraceEntry[];
  readonly routingIterations: number;
  readonly contradictions: readonly DetectedContradiction[];
  readonly triggeredConfirmationIds: readonly string[];
  /** Material evidence needs as observed before this plan's selections. */
  readonly materialEvidence: readonly MaterialEvidenceNeed[];
};

export type CompletionStatus = {
  readonly ready: boolean;
  readonly hardCapReached: boolean;
  readonly terminalReason: "evidence_sufficient" | "no_useful_questions" | "absolute_hard_cap_reached" | "deepening_required" | null;
  readonly reason: readonly ("minimum_context_resolved" | "required_questions_answered" | "primary_route_complete" | "evidence_sufficient" | "no_useful_questions" | "absolute_hard_cap_reached" | "deepening_required" | "confirmation_required" | "confirmation_answered" | "confirmation_ambiguous" | "confirmation_invalidated")[];
};

export type TerminalReasonInput = {
  readonly routeTerminal: boolean;
  readonly confirmationRequired: boolean;
  readonly evidenceSufficient: boolean;
  readonly usefulQuestionsRemaining: boolean;
  readonly hardCapReached: boolean;
};

/** FIX-04A: resolves the single explanatory cause without collapsing independent completion facts. */
export function resolveTerminalReason(input: TerminalReasonInput): CompletionStatus["terminalReason"] {
  if (!input.routeTerminal || input.confirmationRequired) return null;
  if (input.evidenceSufficient) return "evidence_sufficient";
  if (input.hardCapReached && input.usefulQuestionsRemaining) return "absolute_hard_cap_reached";
  if (!input.usefulQuestionsRemaining) return "no_useful_questions";
  return "deepening_required";
}

export type BandInstability = {
  readonly minimumScore: number;
  readonly maximumScore: number;
  readonly minimumBand: OverallState;
  readonly maximumBand: OverallState;
};

export type EvidenceSufficiency = {
  readonly sufficient: boolean;
  readonly unresolvedDimensions: readonly DigitalDimensionId[];
  readonly lowEvidenceDimensions: readonly DigitalDimensionId[];
  readonly lowEvidenceBlockers: readonly DigitalDimensionId[];
  readonly unresolvedContradictions: readonly DigitalDimensionId[];
  readonly extremeScoresNeedingConfirmation: readonly DigitalDimensionId[];
  readonly bandInstability: BandInstability | null;
  readonly usefulQuestionIds: readonly string[];
  readonly usefulQuestionsRemaining: boolean;
  readonly currentScore: number | null;
  readonly reasons: readonly ("applicable_dimension_unresolved" | "low_evidence" | "contradiction" | "extreme_score" | "band_instability" | "useful_questions_remaining")[];
};

export type EvidenceSufficiencyInput = {
  readonly result: ResolveEligibleQuestionsResult;
  readonly bank: QuestionBankV2;
  readonly rawAnswers: AnswersV2;
};

const PRIORITY_RANK: Record<QuestionPriority, number> = { critical: 4, high: 3, normal: 2, refinement: 1 };
const PURPOSE_RANK: Record<QuestionPurpose, number> = { anchor: 4, classification: 4, maturity: 3, goal: 4, friction: 4, routing: 3, diagnostic: 2, confirmation: 5 };
const CORE_FIELDS: readonly ContextFieldRef[] = ["entity", "businessModel", "archetype", "activity", "primaryGoal", "primaryFriction", "customerReach", "customerBuyer"];
const CROSS_CUTTING = new Set<ModuleId>(["operations", "follow_up", "measurement", "conversion"]);
const FOUNDATION = new Set<ModuleId>(["core", "classification", "maturity", "goal_friction"]);

function fieldStatus(context: ResolveEligibleQuestionsResult["context"]): Readonly<Record<ContextFieldRef, "resolved" | "unresolved">> {
  const status = (field: ContextFieldRef): "resolved" | "unresolved" => {
    const value = field === "customerReach" ? context.customerModel.reach : field === "customerBuyer" ? context.customerModel.buyer : context[field];
    return value.status;
  };
  return Object.fromEntries(CONTEXT_FIELD_REFS.map((field) => [field, status(field)])) as Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>;
}

function isAnswered(question: QuestionDefinitionV2, answers: AnswersV2): boolean {
  return answers[question.id] !== undefined;
}

function producedContextFields(question: QuestionDefinitionV2): readonly ContextFieldRef[] {
  return [...new Set(question.options.flatMap((option) => option.produces ?? []).flatMap((production) => [...signalProductionContextFields(production), ...(production.kind === "hasRealCustomers" ? ["activity"] : [])]).filter((field): field is ContextFieldRef => CONTEXT_FIELD_REFS.includes(field as ContextFieldRef)))];
}

function collectAnswerRefs(rule: RuleV2 | undefined, output: Set<string>): void {
  if (!rule) return;
  if ("ref" in rule && "question" in rule.ref) output.add(rule.ref.question);
  if ("rules" in rule) rule.rules.forEach((child) => collectAnswerRefs(child, output));
  if ("rule" in rule) collectAnswerRefs(rule.rule, output);
}

function isRequired(question: QuestionDefinitionV2, contextStatus: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>): boolean {
  if (question.routingRole === "core") return true;
  if (question.routingRole === "adaptive" || question.routingRole === "deepening") return false;
  const producedFields = producedContextFields(question);
  if (question.purpose.some((purpose) => purpose === "anchor" || purpose === "classification")) return producedFields.some((field) => CORE_FIELDS.includes(field) && contextStatus[field] === "unresolved") || question.module === "nonprofit" && contextStatus.businessModel === "resolved";
  if (question.purpose.includes("goal")) return question.module === "goal_friction" && contextStatus.primaryGoal === "unresolved";
  if (question.purpose.includes("friction")) return question.module === "goal_friction" && contextStatus.primaryFriction === "unresolved";
  if (question.module === "maturity" && contextStatus.activity === "unresolved") return true;
  return false;
}

function selectionReason(question: QuestionDefinitionV2, status: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>, routingPrerequisites: ReadonlySet<string>): QuestionSelectionReason {
  if (question.purpose.includes("confirmation")) return "confirmation";
  if (question.routingRole === "deepening") return "refinement";
  if ((question.routingRole === "core" || question.routingRole === "adaptive") && routingPrerequisites.has(question.id)) return "unlock_routing";
  if (question.routingRole === "core") return "required_context";
  if (question.routingRole === "adaptive") return "specialized_evidence";
  if (isRequired(question, status)) return "required_context";
  if (routingPrerequisites.has(question.id)) return "unlock_routing";
  if (question.purpose.includes("goal") || question.purpose.includes("friction")) return "goal_or_friction";
  if (CROSS_CUTTING.has(question.module)) return "cross_cutting_evidence";
  if (FOUNDATION.has(question.module) && Object.values(status).some((value) => value === "unresolved")) return "unlock_routing";
  if (question.priority === "refinement") return "refinement";
  return "specialized_evidence";
}

function crossCuttingRelevant(module: ModuleId, context: ResolveEligibleQuestionsResult["context"], question?: QuestionDefinitionV2): boolean {
  const goal = context.primaryGoal.status === "resolved" ? context.primaryGoal.value : undefined;
  const friction = context.primaryFriction.status === "resolved" ? context.primaryFriction.value : undefined;
  // `conversion` is deliberately absent: its question only enters as tail material evidence, never displacing.
  return module === "measurement" && goal === "measure" || module === "follow_up" && friction === "follow_up" || module === "operations" && friction === "operations" || question?.routingRole === "adaptive" && module === "reputation" && (goal === "trust" || friction === "trust");
}

function moduleLimit(module: ModuleId, budget: RouteBudgetV1): number {
  return budget.moduleMax[module] ?? 3;
}

function diagnosticUtility(question: QuestionDefinitionV2): number {
  return (question.scoringReadiness?.candidateDimensions.length ?? 0) * 2 + (question.purpose.includes("diagnostic") ? 2 : 0) + Math.max(...question.purpose.map((purpose) => PURPOSE_RANK[purpose]));
}

function rankQuestion(question: QuestionDefinitionV2, status: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>, answers: AnswersV2, context: ResolveEligibleQuestionsResult["context"], routingPrerequisites: ReadonlySet<string>, needs: readonly MaterialEvidenceNeed[]): QuestionRankMetadata {
  const required = isRequired(question, status);
  const reason = selectionReason(question, status, routingPrerequisites);
  const dimensions = question.scoringReadiness?.candidateDimensions ?? [];
  const priority = PRIORITY_RANK[question.priority];
  const relevantCrossCutting = crossCuttingRelevant(question.module, context, question);
  const contextRank = reason === "required_context" ? 3 : reason === "unlock_routing" ? 2 : reason === "goal_or_friction" ? 1 : relevantCrossCutting ? 2 : 0;
  const goalOrFrictionRelevance = relevantCrossCutting ? 2 : 0;
  // Material relevance is metadata only: the base order is the pre-08D.1 order, so it never displaces evidence.
  const direct = directDimensions(question.id);
  const materialEvidence = needs.some((need) => need.remaining > 0 && direct.includes(need.dimension));
  const rank = [required ? 1 : 0, contextRank, goalOrFrictionRelevance, diagnosticUtility(question), priority, dimensions.length, isAnswered(question, answers) ? 0 : 1];
  return { questionId: question.id, module: question.module, reason, required, priority: question.priority, dimensions, materialEvidence, rank };
}

function compareRank(a: QuestionRankMetadata, b: QuestionRankMetadata): number {
  for (let index = 0; index < a.rank.length; index += 1) {
    if (a.rank[index] !== b.rank[index]) return b.rank[index] - a.rank[index];
  }
  return a.questionId.localeCompare(b.questionId);
}

/**
 * FIX-03A: determines whether the observed evidence is sufficient to close the diagnostic.
 * It deliberately reports uncertainty instead of selecting follow-up questions; FIX-03B owns that policy.
 */
export function evaluateDiagnosticEvidenceSufficiency(input: EvidenceSufficiencyInput): EvidenceSufficiency {
  const evidence = deriveContextualEvidence(input.result.activeAnswers, input.bank);
  const scoring = scoreContextualDimensions({ answers: input.result.activeAnswers, context: input.result.context, evidence, bank: input.bank });
  const index = computeDigitalPresenceIndex(scoring, { prelaunch: input.result.context.growthStage.status === "resolved" && input.result.context.growthStage.value === "idea" });
  const applicable = scoring.dimensions.filter((dimension) => dimension.applicability === "applicable");
  const unresolvedDimensions = scoring.dimensions.filter((dimension) => dimension.applicability !== "not_applicable" && dimension.score === null).map((dimension) => dimension.id);
  const eligibleIds = input.result.eligibleQuestionIds.filter((questionId) => input.rawAnswers[questionId] === undefined);
  const directCandidates = new Set(eligibleIds.flatMap((questionId) => directDimensions(questionId)));
  const lowEvidenceDimensions = applicable.filter((dimension) => dimension.confidence.level === "low" && dimension.confidence.direct <= 1).map((dimension) => dimension.id);
  const scored = applicable.filter((dimension) => typeof dimension.score === "number");
  const sum = scored.reduce((total, dimension) => total + dimension.score!, 0);
  const denominator = applicable.length;
  const minimumScore = denominator > 0 ? sum / denominator : 0;
  const maximumScore = denominator > 0 ? (sum + (denominator - scored.length) * 100) / denominator : 0;
  const bandInstability = denominator > 0 && scored.length < denominator && bandFor(minimumScore) !== bandFor(maximumScore) ? { minimumScore, maximumScore, minimumBand: bandFor(minimumScore), maximumBand: bandFor(maximumScore) } : null;
  const nearBandBoundary = index.rawScore !== null && [41, 71].some((boundary) => Math.abs(index.rawScore! - boundary) < 5);
  const lowEvidenceBlockers = nearBandBoundary ? lowEvidenceDimensions : [];
  const extremeDimensions = applicable.filter((dimension) => (dimension.score === 0 || dimension.score === 100) && dimension.confidence.direct <= 1 && dimension.confidence.uncertain > 0).map((dimension) => dimension.id);
  const contradictionDimensions = applicable.filter((dimension) => dimension.confidence.contradictory).map((dimension) => dimension.id);
  const targetDimensions = new Set([...unresolvedDimensions, ...contradictionDimensions, ...extremeDimensions, ...lowEvidenceBlockers]);
  const usefulQuestionIds = eligibleIds.filter((questionId) => {
    const direct = new Set(directDimensions(questionId));
    const mapped = new Set(mappedDimensions(questionId));
    return [...targetDimensions].some((dimension) => direct.has(dimension) || !directCandidates.has(dimension) && mapped.has(dimension));
  });
  const extremeScoresNeedingConfirmation = extremeDimensions.filter((dimension) => usefulQuestionIds.some((questionId) => directDimensions(questionId).includes(dimension)));
  const unresolvedContradictions = contradictionDimensions.filter((dimension) => usefulQuestionIds.some((questionId) => directDimensions(questionId).includes(dimension)));
  const reasons: EvidenceSufficiency["reasons"] = [
    ...(unresolvedDimensions.length > 0 ? ["applicable_dimension_unresolved" as const] : []),
    ...(lowEvidenceDimensions.length > 0 ? ["low_evidence" as const] : []),
    ...(unresolvedContradictions.length > 0 ? ["contradiction" as const] : []),
    ...(extremeScoresNeedingConfirmation.length > 0 ? ["extreme_score" as const] : []),
    ...(bandInstability ? ["band_instability" as const] : []),
    ...(usefulQuestionIds.length > 0 ? ["useful_questions_remaining" as const] : []),
  ];
  const materiallyUnresolved = unresolvedDimensions.some((dimension) => usefulQuestionIds.some((questionId) => directDimensions(questionId).includes(dimension)));
  const sufficient = unresolvedDimensions.length === 0 && !materiallyUnresolved && unresolvedContradictions.length === 0 && extremeScoresNeedingConfirmation.length === 0 && lowEvidenceBlockers.length === 0 && !bandInstability;
  return { sufficient, unresolvedDimensions, lowEvidenceDimensions, lowEvidenceBlockers, unresolvedContradictions, extremeScoresNeedingConfirmation, bandInstability, usefulQuestionIds, usefulQuestionsRemaining: usefulQuestionIds.length > 0, currentScore: index.rawScore, reasons };
}

function completionStatus(result: ResolveEligibleQuestionsResult, trace: readonly PlannerTraceEntry[], budget: RouteBudgetV1, bank: QuestionBankV2, rawAnswers: AnswersV2, triggeredConfirmationIds: readonly string[], contradictions: readonly DetectedContradiction[], primaryRouteComplete: boolean, absoluteHardCapReached: boolean): CompletionStatus & { readonly evidenceSufficiency: EvidenceSufficiency } {
  const status = fieldStatus(result.context);
  const classificationSettled = (field: "businessModel" | "archetype") => {
    const resolution = result.context[field];
    return resolution.status === "resolved" || resolution.reason === "declared_unknown" || resolution.reason === "insufficient_evidence";
  };
  const minimumContextResolved = CORE_FIELDS.every((field) => status[field] === "resolved" || (field === "businessModel" || field === "archetype") && classificationSettled(field));
  const requiredQuestionsAnswered = trace.every((entry) => !entry.required || result.activeAnswers[entry.questionId] !== undefined);
  const evidenceSufficiency = evaluateDiagnosticEvidenceSufficiency({ result, bank, rawAnswers });
  const confirmationQuestionIds = new Set(bank.filter((question) => question.contradictionRole?.type === "confirms").map((question) => question.id));
  const pendingConfirmations = triggeredConfirmationIds.filter((id) => result.activeAnswers[id] === undefined);
  const confirmationAnswered = contradictions.some((item) => item.status === "confirmed");
  const confirmationAmbiguous = contradictions.some((item) => item.status === "remains_ambiguous");
  const invalidatedConfirmation = [...confirmationQuestionIds].some((id) => rawAnswers[id] !== undefined && result.activeAnswers[id] === undefined && !triggeredConfirmationIds.includes(id));
  const confirmationRequired = pendingConfirmations.length > 0 && !absoluteHardCapReached;
  const noUsefulQuestions = !evidenceSufficiency.usefulQuestionsRemaining;
  const routeTerminal = primaryRouteComplete || !trace.some((entry) => entry.selected);
  const ready = !confirmationRequired && (absoluteHardCapReached || routeTerminal && (evidenceSufficiency.sufficient || noUsefulQuestions));
  const terminalReason = resolveTerminalReason({ routeTerminal, confirmationRequired, evidenceSufficient: evidenceSufficiency.sufficient, usefulQuestionsRemaining: evidenceSufficiency.usefulQuestionsRemaining, hardCapReached: absoluteHardCapReached });
  const reason: CompletionStatus["reason"] = [
    ...(minimumContextResolved ? ["minimum_context_resolved" as const] : []),
    ...(requiredQuestionsAnswered ? ["required_questions_answered" as const] : []),
    ...(primaryRouteComplete ? ["primary_route_complete" as const] : []),
    ...(routeTerminal && evidenceSufficiency.sufficient ? ["evidence_sufficient" as const] : []),
    ...(routeTerminal && noUsefulQuestions ? ["no_useful_questions" as const] : []),
    ...(absoluteHardCapReached ? ["absolute_hard_cap_reached" as const] : []),
    ...(routeTerminal && !evidenceSufficiency.sufficient && evidenceSufficiency.usefulQuestionsRemaining && !absoluteHardCapReached ? ["deepening_required" as const] : []),
    ...(confirmationRequired ? ["confirmation_required" as const] : []),
    ...(confirmationAnswered && !confirmationRequired ? ["confirmation_answered" as const] : []),
    ...(confirmationAmbiguous && !confirmationRequired ? ["confirmation_ambiguous" as const] : []),
    ...(invalidatedConfirmation && !confirmationRequired ? ["confirmation_invalidated" as const] : []),
  ];
  return { ready, hardCapReached: absoluteHardCapReached, terminalReason, reason, evidenceSufficiency };
}

function deepeningPriority(questionId: string, evidence: EvidenceSufficiency): number {
  const direct = new Set(directDimensions(questionId));
  const mapped = new Set(mappedDimensions(questionId));
  if (evidence.unresolvedDimensions.some((dimension) => direct.has(dimension))) return 6;
  if (evidence.unresolvedContradictions.some((dimension) => direct.has(dimension))) return 5;
  if (evidence.bandInstability && evidence.unresolvedDimensions.some((dimension) => direct.has(dimension) || mapped.has(dimension))) return 4;
  if (evidence.extremeScoresNeedingConfirmation.some((dimension) => direct.has(dimension))) return 3;
  if (evidence.lowEvidenceDimensions.some((dimension) => direct.has(dimension))) return 2;
  return 1;
}

/** Pure deterministic planner. It never registers or serves QBV2 and stores no next-question state. */
export function buildQuestionPlan({ answers, bank, budget = DEFAULT_ROUTE_BUDGET_V1, contradictionRules = DEFAULT_CONTRADICTION_RULES_V1 }: DiagnosticPlannerState): QuestionPlan {
  budget = normalizeRouteBudget(budget, Object.keys(answers).length);
  const result = resolveEligibleQuestionsV2(answers, bank);
  const contradictions = detectContradictionsV2({ result, bank, rules: contradictionRules });
  const triggeredConfirmationIds = getTriggeredConfirmations(contradictions).filter((id) => result.eligibleQuestionIds.includes(id)).slice(0, 2);
  const status = fieldStatus(result.context);
  const questions = new Map(bank.map((question) => [question.id, question]));
  const routingPrerequisites = new Set<string>();
  for (const question of bank) { collectAnswerRefs(question.appliesWhen, routingPrerequisites); collectAnswerRefs(question.materialAppliesWhen, routingPrerequisites); }
  const confirmationIds = new Set(bank.filter((question) => question.contradictionRole?.type === "confirms").map((question) => question.id));
  const plannerEligibleQuestionIds = result.eligibleQuestionIds.filter((id) => !confirmationIds.has(id) || triggeredConfirmationIds.includes(id));
  const needs = materialEvidenceNeeds(result, bank);
  const remainingNeed = new Map(needs.map((need) => [need.dimension, need.remaining]));
  const ranked = plannerEligibleQuestionIds.map((id) => rankQuestion(questions.get(id)!, status, result.activeAnswers, result.context, routingPrerequisites, needs)).sort(compareRank);
  const baseMax = budget.hardMax - (budget.materialEvidenceReserve ?? 0);
  const servesMaterial = (entry: QuestionRankMetadata) => directDimensions(entry.questionId).some((dimension) => (remainingNeed.get(dimension) ?? 0) > 0);
  // Eligible through `materialAppliesWhen` only: such a question may enter the tail, never the base route.
  const nativelyEligible = (entry: QuestionRankMetadata) => isNativelyEligible(entry.questionId);
  const consumeNeed = (entry: QuestionRankMetadata) => { for (const dimension of directDimensions(entry.questionId)) if ((remainingNeed.get(dimension) ?? 0) > 0) remainingNeed.set(dimension, remainingNeed.get(dimension)! - 1); };
  const selected: string[] = [];
  const alreadyAskedCount = Math.min(Object.keys(result.activeAnswers).length, budget.hardMax);
  // DIAG-V3-08E.1: answers given only through `materialAppliesWhen` are tail extras; they never consume the
  // base route's budget, so a later-unlocked base question is not displaced by earlier material evidence.
  const isNativelyEligible = (questionId: string) => { const question = questions.get(questionId); return !question || (question.appliesWhen ? evaluateRuleV2(question.appliesWhen, result.activeAnswers, result.context) : !question.materialAppliesWhen); };
  const baseAskedCount = alreadyAskedCount - Object.keys(result.activeAnswers).filter((questionId) => !isNativelyEligible(questionId)).length;
  let baseSelectedCount = 0;
  const moduleCounts: Partial<Record<ModuleId, number>> = {};
  const selectionBudgetState = new Map<string, { readonly routeLength: number; readonly moduleCount: number }>();
  const seenDimensions = new Set<DimensionId>();
  const selectedComponents = new Set<string>();
  const componentCounts: Partial<Record<string, number>> = {};
  const startupMinimum = result.context.entity.status === "resolved" && result.context.entity.value === "project" && result.context.growthStage.status === "resolved" && result.context.growthStage.value === "idea" ? 4 : 0;
  const componentFor = (module: ModuleId): string | undefined => module === "professional" || module === "appointments" || module === "local" || module === "local_service" || module === "retail" || module === "ecommerce" || module === "creator" || module === "b2b" || module === "hospitality" || module === "nonprofit" ? module : undefined;
  const materialComponents = result.context.archetypeComponents.filter((component) => component !== "hybrid");
  for (const answeredId of Object.keys(result.activeAnswers)) {
    const answeredModule = questions.get(answeredId)?.module as ModuleId | undefined;
    const component = answeredModule ? componentFor(answeredModule) : undefined;
    if (answeredModule) moduleCounts[answeredModule] = (moduleCounts[answeredModule] ?? 0) + 1;
    if (component) {
      selectedComponents.add(component);
      componentCounts[component] = (componentCounts[component] ?? 0) + 1;
    }
  }
  const confirmationAvailable = triggeredConfirmationIds.length > 0;
  const hasUnselectedConfirmation = () => triggeredConfirmationIds.some((id) => !selected.includes(id));
  /** Base phase: the pre-08D.1 rules, capped at `baseMax` (18). */
  const canSelect = (entry: QuestionRankMetadata): boolean => {
    if (questions.get(entry.questionId)?.routingRole === "deepening") return false;
    if (baseAskedCount + baseSelectedCount >= baseMax || alreadyAskedCount + selected.length >= budget.hardMax || !nativelyEligible(entry)) return false;
    if (confirmationAvailable && entry.reason !== "confirmation" && !entry.required && baseAskedCount + baseSelectedCount >= baseMax - Math.min(budget.confirmationReserve, triggeredConfirmationIds.length)) return false;
    if ((moduleCounts[entry.module] ?? 0) >= moduleLimit(entry.module, budget)) return false;
    const component = componentFor(entry.module);
    const contextRelevant = entry.module === "startup" && startupMinimum > 0 || entry.module === "nonprofit" && result.context.businessModel.status === "resolved" && result.context.businessModel.value === "nonprofit" || component !== undefined && result.context.archetypeComponents.includes(component as (typeof result.context.archetypeComponents)[number]) || crossCuttingRelevant(entry.module, result.context, questions.get(entry.questionId));
    const businessModelRelevant = entry.module === "nonprofit" && result.context.businessModel.status === "resolved" && result.context.businessModel.value === "nonprofit";
    const question = questions.get(entry.questionId)!;
    const resolvesOpenContext = producedContextFields(question).some((field) => status[field] === "unresolved");
    const adaptiveUseful = entry.reason === "unlock_routing" || contextRelevant || entry.materialEvidence || resolvesOpenContext;
    if (question.routingRole === "adaptive" && !entry.required && !adaptiveUseful) return false;
    if (materialComponents.length > 0) {
      const deficient = materialComponents.filter((candidate) => (componentCounts[candidate] ?? 0) < 2 && ranked.some((item) => !selected.includes(item.questionId) && componentFor(item.module) === candidate));
      if (deficient.length > 0 && !businessModelRelevant && (!component || !(deficient as readonly string[]).includes(component)) && (!FOUNDATION.has(entry.module) || !entry.required)) return false;
    } else if (component && selectedComponents.size > 0 && selected.length < budget.targetMin && selectedComponents.has(component) && ranked.some((candidate) => !selected.includes(candidate.questionId) && componentFor(candidate.module) && !selectedComponents.has(componentFor(candidate.module)!))) return false;
    if (entry.dimensions.length > 0 && entry.dimensions.every((dimension) => seenDimensions.has(dimension)) && !entry.required && entry.reason !== "confirmation" && !contextRelevant) return false;
    return true;
  };
  const record = (entry: QuestionRankMetadata) => {
    consumeNeed(entry);
    selected.push(entry.questionId);
    moduleCounts[entry.module] = (moduleCounts[entry.module] ?? 0) + 1;
    selectionBudgetState.set(entry.questionId, { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[entry.module] ?? 0 });
    entry.dimensions.forEach((dimension) => seenDimensions.add(dimension));
    const component = componentFor(entry.module);
    if (component) {
      selectedComponents.add(component);
      componentCounts[component] = (componentCounts[component] ?? 0) + 1;
    }
  };
  while (selected.length < ranked.length) {
    const entry = ranked.find((candidate) => !selected.includes(candidate.questionId) && canSelect(candidate));
    if (!entry) break;
    record(entry);
    baseSelectedCount += 1;
    const startupComplete = (moduleCounts.startup ?? 0) >= startupMinimum;
    if (baseAskedCount + baseSelectedCount >= budget.targetMax && startupComplete && ranked.filter((candidate) => candidate.required && !selected.includes(candidate.questionId)).length === 0 && !hasUnselectedConfirmation()) break;
  }
  // Tail phase (DIAG-V3-08D.1): the base route is final; append direct evidence only for still-open material
  // needs, strongest source first, up to `hardMax`. The declared problem outranks module/component balancing.
  // DIAG-V3-08E.2: the same loop fills the extension (19–20) and then the completion reserve (21–24); a route
  // with no open need never enters either band.
  const tailSelected = new Set<string>();
  const sourceRank = (entry: QuestionRankMetadata) => Math.max(0, ...needs.filter((need) => (remainingNeed.get(need.dimension) ?? 0) > 0 && directDimensions(entry.questionId).includes(need.dimension)).map((need) => MATERIAL_SOURCE_RANK[need.source]));
  while (alreadyAskedCount + selected.length < budget.hardMax) {
    const candidates = ranked.filter((candidate) => !selected.includes(candidate.questionId) && !candidate.required && candidate.reason !== "confirmation" && servesMaterial(candidate));
    if (candidates.length === 0) break;
    const best = Math.max(...candidates.map(sourceRank));
    const entry = candidates.find((candidate) => sourceRank(candidate) === best)!;
    record(entry);
    tailSelected.add(entry.questionId);
  }
  const selectedSet = new Set(selected);
  let trace = ranked.map((entry): PlannerTraceEntry => {
    if (selectedSet.has(entry.questionId)) {
      const state = selectionBudgetState.get(entry.questionId)!;
      return { ...entry, selected: true, selectedIn: tailSelected.has(entry.questionId) ? "material" : "base", budgetState: { ...state, hardMax: budget.hardMax } };
    }
    const question = questions.get(entry.questionId)!;
    const resolvedFields = (question.purpose.some((purpose) => purpose === "anchor" || purpose === "classification" || purpose === "maturity") || question.module === "goal_friction") && producedContextFields(question).length > 0 && producedContextFields(question).every((field) => status[field] === "resolved");
    const component = componentFor(entry.module);
    const componentCovered = component !== undefined && (componentCounts[component] ?? 0) >= 2;
    // Eligible only as material evidence and no open need for it: not a pending base candidate.
    const absoluteCapReached = alreadyAskedCount + selected.length >= budget.hardMax;
    const primaryRouteComplete = baseAskedCount + baseSelectedCount >= baseMax;
    const skipReason: PlannerSkipReason = !nativelyEligible(entry) && !servesMaterial(entry) ? "material_not_needed" : absoluteCapReached ? "hard_cap" : primaryRouteComplete ? "primary_route_complete" : (moduleCounts[entry.module] ?? 0) >= moduleLimit(entry.module, budget) ? "module_budget" : resolvedFields ? "context_already_resolved" : componentCovered ? "component_covered" : entry.reason === "refinement" ? "refinement_not_needed" : entry.dimensions.every((dimension) => seenDimensions.has(dimension)) ? "redundant_evidence" : "lower_priority";
    return { ...entry, selected: false, skipReason, budgetState: { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[entry.module] ?? 0, hardMax: budget.hardMax } };
  });
  const primaryRouteComplete = baseAskedCount + baseSelectedCount >= baseMax;
  const absoluteHardCapReached = alreadyAskedCount + selected.length >= budget.hardMax;
  const completion = completionStatus(result, trace, budget, bank, answers, triggeredConfirmationIds, contradictions, primaryRouteComplete, absoluteHardCapReached);
  if (completion.reason.includes("deepening_required")) {
    const candidate = ranked
      .filter((entry) => completion.evidenceSufficiency.usefulQuestionIds.includes(entry.questionId) && !selected.includes(entry.questionId))
      .sort((a, b) => deepeningPriority(b.questionId, completion.evidenceSufficiency) - deepeningPriority(a.questionId, completion.evidenceSufficiency) || compareRank(a, b))[0];
    if (candidate && alreadyAskedCount + selected.length < budget.hardMax) {
      selected.push(candidate.questionId);
      moduleCounts[candidate.module] = (moduleCounts[candidate.module] ?? 0) + 1;
      selectionBudgetState.set(candidate.questionId, { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[candidate.module]! });
      trace = trace.map((entry) => entry.questionId === candidate.questionId ? {
        ...entry,
        selected: true,
        selectedIn: "deepening" as const,
        skipReason: undefined,
        budgetState: { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[candidate.module]!, hardMax: budget.hardMax },
      } : entry);
    }
  }
  return {
    plannerVersion: ADAPTIVE_PLANNER_VERSION,
    context: result.context,
    contextResolution: status,
    eligibleQuestionIds: plannerEligibleQuestionIds,
    selectedQuestionIds: selected,
    nextQuestionId: selected[0],
    routeLength: alreadyAskedCount + selected.length,
    budget,
    moduleCounts,
    completion,
    evidenceSufficiency: completion.evidenceSufficiency,
    trace,
    routingIterations: result.iterations,
    contradictions,
    triggeredConfirmationIds,
    materialEvidence: needs,
  };
}

export function planNextQuestion(state: DiagnosticPlannerState): QuestionPlan {
  return buildQuestionPlan(state);
}

export function isDiagnosticReadyToComplete(state: DiagnosticPlannerState): CompletionStatus {
  return buildQuestionPlan(state).completion;
}

/** Future route-signature input; existing QBV1 analytics signature is intentionally untouched. */
export function plannerRouteSignatureParts(plan: QuestionPlan): readonly string[] {
  return [
    "questionBankVersion=2",
    `routingVersion=${CURRENT_ROUTING_VERSION}`,
    `plannerVersion=${plan.plannerVersion}`,
    `contradictionRulesVersion=${CONTRADICTION_RULES_VERSION}`,
    `selected=${plan.selectedQuestionIds.join(",")}`,
  ];
}
