/** Experimental R5 planner. Deliberately not exported by the diagnostic barrel. */
import type { ResolvedDomainContext } from "./context-resolver";
import { resolveEligibleQuestionsV2 } from "./qbv2-engine";
import { DEFAULT_CONTRADICTION_RULES_V1, detectContradictionsV2, getTriggeredConfirmations, validateContradictionRulesV1 } from "./qbv2-contradictions";
import type { QuestionDefinitionV2, ModuleId } from "./qbv2-contract";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import { scoreCandidateContextualDimensionsV3 } from "./qbv2-candidate-scoring";
import { CONTEXT_FIELD_REFS, type AnswersV2, type ContextFieldRef, type RuleV2 } from "./qbv2-rules";
import { signalProductionContextFields } from "./qbv2-signals";
import type { DigitalDimensionId } from "./qbv2-dimensions";
import { FRICTION_RELEVANCE, GOAL_RELEVANCE } from "./qbv2-priorities";
import { DEFAULT_ROUTE_BUDGET_V1, ROUTE_BANDS, ROUTE_HARD_CAP, type RouteBudgetV1, type QuestionSelectionReason } from "./qbv2-planner";

export const CANDIDATE_PLANNER_IDENTITY_V3 = "reviewed-evidence-v3+r3+r4+candidate-planner-v1" as const;
export const CANDIDATE_ROUTE_HARD_CAP_V3 = ROUTE_HARD_CAP;
export type CandidateEvidenceSufficiencyV3 = {
  readonly applicableDimensions: readonly DigitalDimensionId[];
  readonly notApplicableDimensions: readonly DigitalDimensionId[];
  readonly insufficientContextDimensions: readonly DigitalDimensionId[];
  readonly unresolvedApplicableDimensions: readonly DigitalDimensionId[];
  readonly lowDirectEvidenceDimensions: readonly DigitalDimensionId[];
  readonly contradictions: readonly ReturnType<typeof detectContradictionsV2>[number][];
  readonly usefulContextQuestionIds: readonly string[];
  readonly usefulEvidenceQuestionIds: readonly string[];
  readonly usefulQuestionIds: readonly string[];
  readonly usefulQuestionsRemaining: boolean;
  readonly sufficient: boolean;
  readonly terminalReason: "no_useful_questions" | "useful_questions_remaining";
};
export type CandidatePlannerTraceV3 = { readonly questionId: string; readonly reason: QuestionSelectionReason; readonly selected: boolean; readonly evidenceDimensions: readonly DigitalDimensionId[]; readonly supportingDimensions: readonly DigitalDimensionId[]; readonly skipReason?: "ineligible" | "pending_evidence" | "not_useful" | "hard_cap" };
export type CandidateQuestionPlanV3 = {
  readonly plannerIdentity: typeof CANDIDATE_PLANNER_IDENTITY_V3;
  readonly activeAnswers: AnswersV2;
  readonly context: ResolvedDomainContext;
  readonly contextResolution: Readonly<Record<ContextFieldRef, "resolved" | "unresolved">>;
  readonly eligibleQuestionIds: readonly string[];
  readonly selectedQuestionIds: readonly string[];
  readonly nextQuestionId?: string;
  readonly routeLength: number;
  readonly budget: RouteBudgetV1;
  readonly completion: { readonly ready: boolean; readonly hardCapReached: boolean; readonly terminalReason: CandidateEvidenceSufficiencyV3["terminalReason"] };
  readonly evidenceSufficiency: CandidateEvidenceSufficiencyV3;
  readonly trace: readonly CandidatePlannerTraceV3[];
  readonly routingIterations: number;
};
export type CandidateQuestionPlannerInputV3 = { readonly answers: AnswersV2; readonly budget?: RouteBudgetV1 };

const DEFAULT_BUDGET: RouteBudgetV1 = DEFAULT_ROUTE_BUDGET_V1;
const CONTEXT_CORE = new Set<ContextFieldRef>(["entity", "businessModel", "archetype", "activity", "primaryGoal", "primaryFriction", "customerReach", "customerBuyer"]);
const R4_CONTEXT_FIELDS: Partial<Record<DigitalDimensionId, ReadonlySet<ContextFieldRef>>> = {
  discovery: new Set(["activity", "businessModel", "archetype", "customerBuyer"]),
  conversion_access: new Set(["businessModel", "archetype", "customerBuyer"]),
  relationship_recurrence: new Set(["activity", "businessModel", "archetype", "customerBuyer"]),
};
const resolved = (context: ResolvedDomainContext, field: ContextFieldRef): boolean => (field === "customerReach" ? context.customerModel.reach : field === "customerBuyer" ? context.customerModel.buyer : context[field]).status === "resolved";
function producedFields(question: QuestionDefinitionV2): ContextFieldRef[] {
  return [...new Set(question.options.flatMap((option) => option.produces ?? []).flatMap((production) => [...signalProductionContextFields(production), ...(production.kind === "hasRealCustomers" ? ["activity"] : [])]).filter((field): field is ContextFieldRef => CONTEXT_FIELD_REFS.includes(field as ContextFieldRef)))];
}
function refs(rule: RuleV2 | undefined, out = new Set<string>()): Set<string> {
  if (!rule) return out;
  if ("ref" in rule && "question" in rule.ref) out.add(rule.ref.question);
  if ("rules" in rule) rule.rules.forEach((item) => refs(item, out));
  if ("rule" in rule) refs(rule.rule, out);
  return out;
}
function rankReason(question: QuestionDefinitionV2, unresolved: ReadonlySet<ContextFieldRef>, prereqs: ReadonlySet<string>): QuestionSelectionReason {
  if (question.purpose.includes("confirmation")) return "confirmation";
  if (question.routingRole === "deepening") return "refinement";
  if (prereqs.has(question.id)) return "unlock_routing";
  if (question.routingRole === "core") return "required_context";
  if (producedFields(question).some((field) => unresolved.has(field))) return "required_context";
  if (question.purpose.includes("goal") || question.purpose.includes("friction")) return "goal_or_friction";
  if (question.priority === "refinement") return "refinement";
  return "specialized_evidence";
}
function semanticSources(question: QuestionDefinitionV2): { direct: DigitalDimensionId[]; supporting: DigitalDimensionId[] } {
  if (question.evidenceMigration !== "migrated" || !question.evidenceV3) return { direct: [], supporting: [] };
  return { direct: question.evidenceV3.dimensions.filter((d) => d.directness === "direct").map((d) => d.dimension), supporting: question.evidenceV3.dimensions.filter((d) => d.directness === "supporting").map((d) => d.dimension) };
}

/** Candidate-only planner. Every invocation reconstructs the plan from raw answers. */
/** @internal Test seam for equivalent bank-order determinism; production entry always supplies the frozen bank. */
export function buildCandidateQuestionPlanFromBankV3({ answers, budget = DEFAULT_BUDGET }: CandidateQuestionPlannerInputV3, bank: readonly QuestionDefinitionV2[]): CandidateQuestionPlanV3 {
  const hardMax = Math.min(CANDIDATE_ROUTE_HARD_CAP_V3, Math.max(1, budget.hardMax, Object.keys(answers).length));
  const normalizedBudget: RouteBudgetV1 = { ...budget, hardMax, targetMax: Math.min(hardMax, budget.targetMax), targetMin: Math.min(hardMax, budget.targetMin), materialEvidenceReserve: Math.min(hardMax - 1, Math.max(0, budget.materialEvidenceReserve ?? 0)) };
  const resolution = resolveEligibleQuestionsV2(answers, bank);
  const activeAnswers = resolution.activeAnswers;
  const scoring = scoreCandidateContextualDimensionsV3({ answers: activeAnswers });
  const dimensions = scoring.dimensions;
  const open = new Set(dimensions.filter((d) => d.applicability === "applicable" && d.score === null).map((d) => d.id));
  const applicable = new Set(dimensions.filter((d) => d.applicability === "applicable").map((d) => d.id));
  const observedDirect = new Set(scoring.dimensions.flatMap((d) => d.confidence.direct > 0 ? [d.id] : []));
  const unresolvedFields = new Set(CONTEXT_FIELD_REFS.filter((field) => !resolved(resolution.context, field)));
  const questionById = new Map(bank.map((q) => [q.id, q]));
  const prereqs = new Set<string>();
  for (const q of bank) { refs(q.appliesWhen, prereqs); refs(q.materialAppliesWhen, prereqs); }
  const structurallyValidRules = new Set(validateContradictionRulesV1(DEFAULT_CONTRADICTION_RULES_V1, bank).filter((issue) => issue.code !== "INVALID_RULE_ID").map((issue) => issue.ruleId));
  const validRules = DEFAULT_CONTRADICTION_RULES_V1.filter((rule) => !structurallyValidRules.has(rule.id) && (() => {
    const dependencies = [...refs(rule.when), ...rule.evidence.map((e) => e.questionId), ...(rule.confirmationQuestionId ? [rule.confirmationQuestionId] : [])];
    return dependencies.every((id) => questionById.has(id));
  })());
  const contradictions = detectContradictionsV2({ result: resolution, bank, rules: validRules });
  const triggered = new Set(getTriggeredConfirmations(contradictions).filter((id) => resolution.eligibleQuestionIds.includes(id)));
  const contextUseful: string[] = [];
  const evidenceUseful: string[] = [];
  const trace: CandidatePlannerTraceV3[] = [];
  const eligible = new Set(resolution.eligibleQuestionIds);
  for (const q of bank) {
    if (activeAnswers[q.id] !== undefined) continue;
    const sources = semanticSources(q);
    const fields = producedFields(q);
    const neededContext = new Set<ContextFieldRef>([...CONTEXT_CORE].filter((f) => unresolvedFields.has(f)));
    for (const dimension of dimensions.filter((d) => d.applicability === "insufficient_context")) {
      for (const field of R4_CONTEXT_FIELDS[dimension.id] ?? []) if (unresolvedFields.has(field)) neededContext.add(field);
    }
    const unlocksCandidateBranch = bank.some((child) => activeAnswers[child.id] === undefined && (refs(child.appliesWhen).has(q.id) || refs(child.materialAppliesWhen).has(q.id)));
    const contextUtility = q.routingRole !== "deepening" && eligible.has(q.id) && (q.routingRole === "core" || fields.some((f) => neededContext.has(f)) || unlocksCandidateBranch || triggered.has(q.id));
    const directUtility = eligible.has(q.id) && sources.direct.some((d) => open.has(d));
    // Supporting observations may refine an already scored direct dimension, never close a null score.
    const supportingUtility = eligible.has(q.id) && sources.supporting.some((d) => observedDirect.has(d) && dimensions.find((item) => item.id === d)?.score !== null);
    if (contextUtility) contextUseful.push(q.id);
    if (directUtility || supportingUtility) evidenceUseful.push(q.id);
    const useful = contextUtility || directUtility || supportingUtility || triggered.has(q.id);
    const reason = rankReason(q, unresolvedFields, prereqs);
    trace.push({ questionId: q.id, reason, selected: useful, evidenceDimensions: sources.direct, supportingDimensions: sources.supporting, ...(!eligible.has(q.id) ? { skipReason: "ineligible" as const } : !useful && q.evidenceMigration === "pending" ? { skipReason: "pending_evidence" as const } : !useful ? { skipReason: "not_useful" as const } : {}) });
  }
  const usefulIds = [...new Set([...contextUseful, ...evidenceUseful, ...triggered])].sort((a, b) => {
    const qa = questionById.get(a)!; const qb = questionById.get(b)!;
    const ra = rankReason(qa, unresolvedFields, prereqs); const rb = rankReason(qb, unresolvedFields, prereqs);
    const rr: Record<QuestionSelectionReason, number> = { confirmation: 6, required_context: 5, unlock_routing: 4, goal_or_friction: 3, cross_cutting_evidence: 2, specialized_evidence: 1, refinement: 0 };
    const goal = resolution.context.primaryGoal.status === "resolved" ? resolution.context.primaryGoal.value : undefined;
    const friction = resolution.context.primaryFriction.status === "resolved" ? resolution.context.primaryFriction.value : undefined;
    const priorities = [...(goal ? GOAL_RELEVANCE[goal] : []), ...(friction ? FRICTION_RELEVANCE[friction] : [])];
    const utility = (id: string) => {
      const source = semanticSources(questionById.get(id)!);
      return Math.max(0, ...[...source.direct, ...source.supporting].map((dimension) => priorities.includes(dimension) ? priorities.length - priorities.indexOf(dimension) : 0));
    };
    return rr[rb] - rr[ra] || utility(b) - utility(a) || (qb.priority === "critical" ? 1 : 0) - (qa.priority === "critical" ? 1 : 0) || a.localeCompare(b);
  });
  const alreadyAsked = Object.keys(activeAnswers).length;
  const remaining = Math.max(0, normalizedBudget.hardMax - alreadyAsked);
  const baseCeiling = Math.min(normalizedBudget.targetMax, normalizedBudget.hardMax - (normalizedBudget.materialEvidenceReserve ?? 0), ROUTE_BANDS.base);
  const baseSlots = Math.max(0, baseCeiling - alreadyAsked);
  const activeModuleCounts: Partial<Record<ModuleId, number>> = {};
  for (const id of Object.keys(activeAnswers)) {
    const module = questionById.get(id)?.module;
    if (module) activeModuleCounts[module] = (activeModuleCounts[module] ?? 0) + 1;
  }
  const selected: string[] = [];
  const selectedModuleCounts: Partial<Record<ModuleId, number>> = { ...activeModuleCounts };
  const moduleHasRoom = (id: string) => {
    const question = questionById.get(id)!;
    const limit = normalizedBudget.moduleMax[question.module] ?? DEFAULT_ROUTE_BUDGET_V1.moduleMax[question.module] ?? 3;
    return (selectedModuleCounts[question.module] ?? 0) < limit;
  };
  const add = (id: string) => { if (selected.includes(id) || selected.length >= remaining || !moduleHasRoom(id)) return; selected.push(id); const module = questionById.get(id)!.module; selectedModuleCounts[module] = (selectedModuleCounts[module] ?? 0) + 1; };
  for (const id of usefulIds.filter((id) => questionById.get(id)!.routingRole !== "deepening")) {
    if (selected.length >= baseSlots) break;
    add(id);
  }
  // The existing material reserve is used only by certified direct/supporting sources for an applicable dimension.
  for (const id of usefulIds) {
    if (selected.length >= remaining) break;
    if (selected.includes(id)) continue;
    const question = questionById.get(id)!;
    const source = semanticSources(question);
    const evidenceTail = source.direct.some((dimension) => open.has(dimension)) || source.supporting.some((dimension) => observedDirect.has(dimension));
    if (evidenceTail) add(id);
  }
  const unresolvedApplicableDimensions = [...open].sort();
  const lowDirectEvidenceDimensions = dimensions.filter((d) => d.applicability === "applicable" && d.confidence.direct <= 1).map((d) => d.id);
  const insufficientContextDimensions = dimensions.filter((d) => d.applicability === "insufficient_context").map((d) => d.id);
  const sufficient = unresolvedApplicableDimensions.length === 0 && insufficientContextDimensions.length === 0 && contradictions.every((c) => c.status !== "pending" || !c.confirmationQuestionId || !eligible.has(c.confirmationQuestionId));
  const sufficiency: CandidateEvidenceSufficiencyV3 = {
    applicableDimensions: [...applicable].sort(), notApplicableDimensions: dimensions.filter((d) => d.applicability === "not_applicable").map((d) => d.id), insufficientContextDimensions, unresolvedApplicableDimensions, lowDirectEvidenceDimensions,
    contradictions, usefulContextQuestionIds: [...new Set(contextUseful)].sort(), usefulEvidenceQuestionIds: [...new Set(evidenceUseful)].sort(), usefulQuestionIds: usefulIds, usefulQuestionsRemaining: selected.length > 0, sufficient,
    terminalReason: selected.length ? "useful_questions_remaining" : "no_useful_questions",
  };
  const hardCapReached = Object.keys(activeAnswers).length >= normalizedBudget.hardMax;
  return {
    plannerIdentity: CANDIDATE_PLANNER_IDENTITY_V3, activeAnswers, context: resolution.context,
    contextResolution: Object.fromEntries(CONTEXT_FIELD_REFS.map((f) => [f, resolved(resolution.context, f) ? "resolved" : "unresolved"])) as Record<ContextFieldRef, "resolved" | "unresolved">,
    eligibleQuestionIds: resolution.eligibleQuestionIds, selectedQuestionIds: selected, nextQuestionId: selected[0], routeLength: Object.keys(activeAnswers).length + selected.length,
    budget: normalizedBudget, completion: { ready: hardCapReached || selected.length === 0, hardCapReached, terminalReason: sufficiency.terminalReason }, evidenceSufficiency: sufficiency,
    trace: trace.map((entry) => ({ ...entry, selected: selected.includes(entry.questionId), ...(eligible.has(entry.questionId) && !selected.includes(entry.questionId) ? { skipReason: hardCapReached ? "hard_cap" as const : entry.skipReason ?? "not_useful" as const } : {}) })), routingIterations: resolution.iterations,
  };
}

/** Production candidate entry point: the reviewed R3 evidence bank is fixed and cannot be caller-selected. */
export function buildCandidateQuestionPlanV3(input: CandidateQuestionPlannerInputV3): CandidateQuestionPlanV3 {
  return buildCandidateQuestionPlanFromBankV3(input, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
}
