import type { DimensionId } from "./types";
import { type ModuleId, type QuestionDefinitionV2, type QuestionPriority, type QuestionPurpose } from "./qbv2-contract";
import { resolveEligibleQuestionsV2, type QuestionBankV2, type ResolveEligibleQuestionsResult } from "./qbv2-engine";
import { CONTEXT_FIELD_REFS, type AnswersV2, type ContextFieldRef, type RuleV2 } from "./qbv2-rules";
import { SIGNAL_PRODUCTION_CONTEXT_FIELD } from "./qbv2-signals";

/** DIAG-V3-08B.4: planner version is deliberately independent from QBV1/QBV2 activation. */
export const ADAPTIVE_PLANNER_VERSION = 1 as const;
export type AdaptivePlannerVersion = typeof ADAPTIVE_PLANNER_VERSION;

export type RouteBudgetV1 = {
  readonly targetMin: number;
  readonly targetMax: number;
  readonly hardMax: number;
  readonly confirmationReserve: number;
  readonly moduleMax: Readonly<Partial<Record<ModuleId, number>>>;
};

export const DEFAULT_ROUTE_BUDGET_V1: RouteBudgetV1 = {
  targetMin: 10,
  targetMax: 16,
  hardMax: 18,
  confirmationReserve: 2,
  moduleMax: {
    core: 3, classification: 6, maturity: 6, goal_friction: 3,
    startup: 6, operations: 3, follow_up: 3, measurement: 3, confirmation: 2,
    local: 3, local_service: 3, appointments: 5, professional: 5, retail: 3,
    ecommerce: 5, hospitality: 4, b2b: 5, creator: 4, nonprofit: 4, reputation: 1,
  },
};

export type PlannerSkipReason = "module_budget" | "redundant_evidence" | "lower_priority" | "hard_cap" | "context_already_resolved" | "component_covered" | "refinement_not_needed";
export type QuestionSelectionReason = "required_context" | "unlock_routing" | "goal_or_friction" | "specialized_evidence" | "cross_cutting_evidence" | "refinement" | "confirmation";

export type QuestionRankMetadata = {
  readonly questionId: string;
  readonly module: ModuleId;
  readonly reason: QuestionSelectionReason;
  readonly required: boolean;
  readonly priority: QuestionPriority;
  readonly dimensions: readonly DimensionId[];
  readonly rank: readonly number[];
};

export type PlannerTraceEntry = QuestionRankMetadata & { readonly selected: boolean; readonly skipReason?: PlannerSkipReason; readonly budgetState: { readonly routeLength: number; readonly moduleCount: number; readonly hardMax: number } };

export type DiagnosticPlannerState = {
  readonly answers: AnswersV2;
  readonly bank: QuestionBankV2;
  readonly budget?: RouteBudgetV1;
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
  readonly trace: readonly PlannerTraceEntry[];
  readonly routingIterations: number;
};

export type CompletionStatus = {
  readonly ready: boolean;
  readonly reason: readonly ("minimum_context_resolved" | "required_questions_answered" | "evidence_sufficient" | "route_budget_reached" | "no_more_eligible_questions" | "no_actionable_questions")[];
};

const PRIORITY_RANK: Record<QuestionPriority, number> = { critical: 4, high: 3, normal: 2, refinement: 1 };
const PURPOSE_RANK: Record<QuestionPurpose, number> = { anchor: 4, classification: 4, maturity: 3, goal: 4, friction: 4, routing: 3, diagnostic: 2, confirmation: 5 };
const CORE_FIELDS: readonly ContextFieldRef[] = ["entity", "businessModel", "archetype", "growthStage", "primaryGoal", "primaryFriction", "customerReach", "customerBuyer"];
const CROSS_CUTTING = new Set<ModuleId>(["operations", "follow_up", "measurement"]);
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
  return [...new Set(question.options.flatMap((option) => option.produces ?? []).map((production) => SIGNAL_PRODUCTION_CONTEXT_FIELD[production.kind]).filter((field): field is ContextFieldRef => CONTEXT_FIELD_REFS.includes(field as ContextFieldRef)))];
}

function collectAnswerRefs(rule: RuleV2 | undefined, output: Set<string>): void {
  if (!rule) return;
  if ("ref" in rule && "question" in rule.ref) output.add(rule.ref.question);
  if ("rules" in rule) rule.rules.forEach((child) => collectAnswerRefs(child, output));
  if ("rule" in rule) collectAnswerRefs(rule.rule, output);
}

function isRequired(question: QuestionDefinitionV2, contextStatus: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>): boolean {
  const producedFields = producedContextFields(question);
  if (question.purpose.some((purpose) => purpose === "anchor" || purpose === "classification")) return producedFields.some((field) => CORE_FIELDS.includes(field) && contextStatus[field] === "unresolved") || question.module === "nonprofit" && contextStatus.businessModel === "resolved";
  if (question.purpose.includes("goal")) return question.module === "goal_friction" && contextStatus.primaryGoal === "unresolved";
  if (question.purpose.includes("friction")) return question.module === "goal_friction" && contextStatus.primaryFriction === "unresolved";
  if (question.module === "maturity" && contextStatus.growthStage === "unresolved") return true;
  return false;
}

function selectionReason(question: QuestionDefinitionV2, status: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>, routingPrerequisites: ReadonlySet<string>): QuestionSelectionReason {
  if (question.purpose.includes("confirmation")) return "confirmation";
  if (isRequired(question, status)) return "required_context";
  if (routingPrerequisites.has(question.id)) return "unlock_routing";
  if (question.purpose.includes("goal") || question.purpose.includes("friction")) return "goal_or_friction";
  if (CROSS_CUTTING.has(question.module)) return "cross_cutting_evidence";
  if (FOUNDATION.has(question.module) && Object.values(status).some((value) => value === "unresolved")) return "unlock_routing";
  if (question.priority === "refinement") return "refinement";
  return "specialized_evidence";
}

function moduleLimit(module: ModuleId, budget: RouteBudgetV1): number {
  return budget.moduleMax[module] ?? 3;
}

function diagnosticUtility(question: QuestionDefinitionV2): number {
  return (question.scoringReadiness?.candidateDimensions.length ?? 0) * 2 + (question.purpose.includes("diagnostic") ? 2 : 0) + Math.max(...question.purpose.map((purpose) => PURPOSE_RANK[purpose]));
}

function rankQuestion(question: QuestionDefinitionV2, status: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>, answers: AnswersV2, context: ResolveEligibleQuestionsResult["context"], routingPrerequisites: ReadonlySet<string>): QuestionRankMetadata {
  const required = isRequired(question, status);
  const reason = selectionReason(question, status, routingPrerequisites);
  const dimensions = question.scoringReadiness?.candidateDimensions ?? [];
  const priority = PRIORITY_RANK[question.priority];
  const relevantCrossCutting = question.module === "measurement" && context.primaryGoal.status === "resolved" && context.primaryGoal.value === "measure" || question.module === "follow_up" && context.primaryFriction.status === "resolved" && context.primaryFriction.value === "follow_up" || question.module === "operations" && context.primaryFriction.status === "resolved" && context.primaryFriction.value === "operations";
  const contextRank = reason === "required_context" ? 3 : reason === "unlock_routing" ? 2 : reason === "goal_or_friction" ? 1 : relevantCrossCutting ? 2 : 0;
  const goalOrFrictionRelevance = question.module === "measurement" && context.primaryGoal.status === "resolved" && context.primaryGoal.value === "measure" || question.module === "follow_up" && context.primaryFriction.status === "resolved" && context.primaryFriction.value === "follow_up" || question.module === "operations" && context.primaryFriction.status === "resolved" && context.primaryFriction.value === "operations" ? 2 : 0;
  const rank = [required ? 1 : 0, contextRank, goalOrFrictionRelevance, diagnosticUtility(question), priority, dimensions.length, isAnswered(question, answers) ? 0 : 1];
  return { questionId: question.id, module: question.module, reason, required, priority: question.priority, dimensions, rank };
}

function compareRank(a: QuestionRankMetadata, b: QuestionRankMetadata): number {
  for (let index = 0; index < a.rank.length; index += 1) {
    if (a.rank[index] !== b.rank[index]) return b.rank[index] - a.rank[index];
  }
  return a.questionId.localeCompare(b.questionId);
}

function completionStatus(result: ResolveEligibleQuestionsResult, trace: readonly PlannerTraceEntry[], budget: RouteBudgetV1, bank: QuestionBankV2): CompletionStatus {
  const status = fieldStatus(result.context);
  const minimumContextResolved = CORE_FIELDS.every((field) => status[field] === "resolved");
  const requiredQuestionsAnswered = trace.every((entry) => !entry.required || result.activeAnswers[entry.questionId] !== undefined);
  const evidenceQuestions = Object.entries(result.activeAnswers).filter(([id, answer]) => {
    const question = bank.find((candidate) => candidate.id === id);
    if (!question || !result.eligibleQuestionIds.includes(id) || (question.scoringReadiness?.candidateDimensions.length ?? 0) === 0) return false;
    const values = Array.isArray(answer) ? answer : [answer];
    return !values.some((value) => question.options.find((option) => option.value === value)?.kind === "unknown" || question.options.find((option) => option.value === value)?.kind === "not_applicable");
  });
  const diagnosticCount = evidenceQuestions.length;
  const coveredDimensions = new Set<DimensionId>();
  for (const [id] of evidenceQuestions) for (const dimension of bank.find((question) => question.id === id)?.scoringReadiness?.candidateDimensions ?? []) coveredDimensions.add(dimension);
  const relevantDimensions = new Set<DimensionId>();
  for (const id of result.eligibleQuestionIds) for (const dimension of bank.find((question) => question.id === id)?.scoringReadiness?.candidateDimensions ?? []) relevantDimensions.add(dimension);
  const evidenceSufficient = diagnosticCount >= 8 && coveredDimensions.size >= Math.min(3, relevantDimensions.size) || status.growthStage === "resolved" && status.primaryGoal === "resolved" && diagnosticCount >= 5 && coveredDimensions.size >= Math.min(2, relevantDimensions.size);
  const noMoreEligibleQuestions = result.eligibleQuestionIds.length === 0;
  const routeBudgetReached = Object.keys(result.activeAnswers).length + trace.filter((entry) => entry.selected).length >= budget.targetMax;
  const hardCapReached = Object.keys(result.activeAnswers).length + trace.filter((entry) => entry.selected).length >= budget.hardMax;
  const noActionableQuestions = minimumContextResolved && requiredQuestionsAnswered && trace.length > 0 && trace.every((entry) => entry.selected || ["module_budget", "component_covered", "context_already_resolved", "redundant_evidence", "hard_cap"].includes(entry.skipReason ?? ""));
  const ready = noMoreEligibleQuestions || noActionableQuestions || hardCapReached || minimumContextResolved && requiredQuestionsAnswered && evidenceSufficient;
  const reason: CompletionStatus["reason"] = [
    ...(minimumContextResolved ? ["minimum_context_resolved" as const] : []),
    ...(requiredQuestionsAnswered ? ["required_questions_answered" as const] : []),
    ...(evidenceSufficient ? ["evidence_sufficient" as const] : []),
    ...(routeBudgetReached ? ["route_budget_reached" as const] : []),
    ...(noMoreEligibleQuestions ? ["no_more_eligible_questions" as const] : []),
    ...(noActionableQuestions ? ["no_actionable_questions" as const] : []),
  ];
  return { ready, reason };
}

/** Pure deterministic planner. It never registers or serves QBV2 and stores no next-question state. */
export function buildQuestionPlan({ answers, bank, budget = DEFAULT_ROUTE_BUDGET_V1 }: DiagnosticPlannerState): QuestionPlan {
  const result = resolveEligibleQuestionsV2(answers, bank);
  const status = fieldStatus(result.context);
  const questions = new Map(bank.map((question) => [question.id, question]));
  const routingPrerequisites = new Set<string>();
  for (const question of bank) collectAnswerRefs(question.appliesWhen, routingPrerequisites);
  const ranked = result.eligibleQuestionIds.map((id) => rankQuestion(questions.get(id)!, status, result.activeAnswers, result.context, routingPrerequisites)).sort(compareRank);
  const selected: string[] = [];
  const alreadyAskedCount = Math.min(Object.keys(result.activeAnswers).length, budget.hardMax);
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
  const confirmationAvailable = ranked.some((entry) => entry.reason === "confirmation");
  const canSelect = (entry: QuestionRankMetadata): boolean => {
    if (alreadyAskedCount + selected.length >= budget.hardMax) return false;
    if (confirmationAvailable && entry.reason !== "confirmation" && alreadyAskedCount + selected.length >= budget.hardMax - budget.confirmationReserve) return false;
    if ((moduleCounts[entry.module] ?? 0) >= moduleLimit(entry.module, budget)) return false;
    const component = componentFor(entry.module);
    const contextRelevant = entry.module === "startup" && startupMinimum > 0 || entry.module === "nonprofit" && result.context.businessModel.status === "resolved" && result.context.businessModel.value === "nonprofit" || component !== undefined && result.context.archetypeComponents.includes(component as (typeof result.context.archetypeComponents)[number]) || entry.module === "measurement" && result.context.primaryGoal.status === "resolved" && result.context.primaryGoal.value === "measure" || entry.module === "follow_up" && result.context.primaryFriction.status === "resolved" && result.context.primaryFriction.value === "follow_up" || entry.module === "operations" && result.context.primaryFriction.status === "resolved" && result.context.primaryFriction.value === "operations";
    const businessModelRelevant = entry.module === "nonprofit" && result.context.businessModel.status === "resolved" && result.context.businessModel.value === "nonprofit";
    if (materialComponents.length > 0) {
      const deficient = materialComponents.filter((candidate) => (componentCounts[candidate] ?? 0) < 2 && ranked.some((item) => !selected.includes(item.questionId) && componentFor(item.module) === candidate));
      if (deficient.length > 0 && !businessModelRelevant && (!component || !(deficient as readonly string[]).includes(component)) && (!FOUNDATION.has(entry.module) || !entry.required)) return false;
    } else if (component && selectedComponents.size > 0 && selected.length < budget.targetMin && selectedComponents.has(component) && ranked.some((candidate) => !selected.includes(candidate.questionId) && componentFor(candidate.module) && !selectedComponents.has(componentFor(candidate.module)!))) return false;
    if (entry.dimensions.length > 0 && entry.dimensions.every((dimension) => seenDimensions.has(dimension)) && !entry.required && entry.reason !== "confirmation" && !contextRelevant) return false;
    return true;
  };
  while (selected.length < ranked.length) {
    const entry = ranked.find((candidate) => !selected.includes(candidate.questionId) && canSelect(candidate));
    if (!entry) break;
    selected.push(entry.questionId);
    moduleCounts[entry.module] = (moduleCounts[entry.module] ?? 0) + 1;
    selectionBudgetState.set(entry.questionId, { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[entry.module] ?? 0 });
    entry.dimensions.forEach((dimension) => seenDimensions.add(dimension));
    const component = componentFor(entry.module);
    if (component) {
      selectedComponents.add(component);
      componentCounts[component] = (componentCounts[component] ?? 0) + 1;
    }
    const startupComplete = (moduleCounts.startup ?? 0) >= startupMinimum;
    if (alreadyAskedCount + selected.length >= budget.targetMax && startupComplete && ranked.filter((candidate) => candidate.required && !selected.includes(candidate.questionId)).length === 0) break;
  }
  const selectedSet = new Set(selected);
  const trace = ranked.map((entry): PlannerTraceEntry => {
    if (selectedSet.has(entry.questionId)) {
      const state = selectionBudgetState.get(entry.questionId)!;
      return { ...entry, selected: true, budgetState: { ...state, hardMax: budget.hardMax } };
    }
    const question = questions.get(entry.questionId)!;
    const resolvedFields = (question.purpose.some((purpose) => purpose === "anchor" || purpose === "classification" || purpose === "maturity") || question.module === "goal_friction") && producedContextFields(question).length > 0 && producedContextFields(question).every((field) => status[field] === "resolved");
    const component = componentFor(entry.module);
    const componentCovered = component !== undefined && (componentCounts[component] ?? 0) >= 2;
    const skipReason: PlannerSkipReason = alreadyAskedCount + selected.length >= budget.hardMax ? "hard_cap" : (moduleCounts[entry.module] ?? 0) >= moduleLimit(entry.module, budget) ? "module_budget" : resolvedFields ? "context_already_resolved" : componentCovered ? "component_covered" : entry.reason === "refinement" ? "refinement_not_needed" : entry.dimensions.every((dimension) => seenDimensions.has(dimension)) ? "redundant_evidence" : "lower_priority";
    return { ...entry, selected: false, skipReason, budgetState: { routeLength: alreadyAskedCount + selected.length, moduleCount: moduleCounts[entry.module] ?? 0, hardMax: budget.hardMax } };
  });
  const completion = completionStatus(result, trace, budget, bank);
  return { plannerVersion: ADAPTIVE_PLANNER_VERSION, context: result.context, contextResolution: status, eligibleQuestionIds: result.eligibleQuestionIds, selectedQuestionIds: selected, nextQuestionId: selected[0], routeLength: alreadyAskedCount + selected.length, budget, moduleCounts, completion, trace, routingIterations: result.iterations };
}

export function planNextQuestion(state: DiagnosticPlannerState): QuestionPlan {
  return buildQuestionPlan(state);
}

export function isDiagnosticReadyToComplete(state: DiagnosticPlannerState): CompletionStatus {
  return buildQuestionPlan(state).completion;
}

/** Future route-signature input; existing QBV1 analytics signature is intentionally untouched. */
export function plannerRouteSignatureParts(plan: QuestionPlan): readonly string[] {
  return [`plannerVersion=${plan.plannerVersion}`, `selected=${plan.selectedQuestionIds.join(",")}`];
}
