// Orquestador aislado QA-03B; el original certificado permanece reproducible.
/** Experimental R5 planner. Deliberately not exported by the diagnostic barrel. */
import type { ResolvedDomainContext } from "./context";
import { resolveEligibleQuestionsV2 } from "./engine";
import { DEFAULT_CONTRADICTION_RULES_V1, detectContradictionsV2, getTriggeredConfirmations, validateContradictionRulesV1 } from "../qbv2-contradictions";
import type { QuestionDefinitionV2, ModuleId } from "../qbv2-contract";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./bank";
import { scoreCandidateContextualDimensionsV3 } from "./qbv2-candidate-scoring";
import { CONTEXT_FIELD_REFS, type AnswersV2, type ContextFieldRef, type RuleV2 } from "../qbv2-rules";
import { signalProductionContextFields } from "../qbv2-signals";
import type { DigitalDimensionId } from "../qbv2-dimensions";
import { FRICTION_RELEVANCE, GOAL_RELEVANCE } from "../qbv2-priorities";
import { DEFAULT_ROUTE_BUDGET_V1, ROUTE_BANDS, ROUTE_HARD_CAP, type RouteBudgetV1, type QuestionSelectionReason } from "../qbv2-planner";

export const CANDIDATE_PLANNER_IDENTITY_V3 = "reviewed-evidence-v8+r3+r4-operation-history+candidate-planner-v4" as const;
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
  readonly terminalReason: "no_useful_questions" | "useful_questions_remaining" | "budget_blocked";
};
export type CandidatePlannerTraceV3 = { readonly questionId: string; readonly reason: QuestionSelectionReason; readonly selected: boolean; readonly evidenceDimensions: readonly DigitalDimensionId[]; readonly supportingDimensions: readonly DigitalDimensionId[]; readonly skipReason?: "ineligible" | "pending_evidence" | "not_useful" | "hard_cap" | "module_budget" | "base_budget" | "replaced_by_specialty" };
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
/** Shadow-only experiment: never used by the public session or Worker. */
export type CandidateShadowSelectionPolicyV1 = "baseline" | "utility_first";

const DEFAULT_BUDGET: RouteBudgetV1 = DEFAULT_ROUTE_BUDGET_V1;
const CONTEXT_CORE = new Set<ContextFieldRef>(["entity", "businessModel", "archetype", "activity", "primaryGoal", "primaryFriction", "customerReach", "customerBuyer", "niche"]);
const R4_CONTEXT_FIELDS: Partial<Record<DigitalDimensionId, ReadonlySet<ContextFieldRef>>> = {
  discovery: new Set(["activity", "businessModel", "archetype", "customerBuyer"]),
  conversion_access: new Set(["businessModel", "archetype", "customerBuyer"]),
  relationship_recurrence: new Set(["activity", "businessModel", "archetype", "customerBuyer"]),
};
const resolved = (context: ResolvedDomainContext, field: ContextFieldRef): boolean => (field === "customerReach" ? context.customerModel.reach : field === "customerBuyer" ? context.customerModel.buyer : context[field]).status === "resolved";
function producedFields(question: QuestionDefinitionV2): ContextFieldRef[] {
  const fields: Partial<Record<string, ContextFieldRef[]>> = { q2_entity: ["entity"], q2_has_customers: ["growthStage"], q2_operational_status: ["activity"], q2_delivery: ["archetype"], q2_customer_buyer: ["customerBuyer"] };
  if (fields[question.id]) return fields[question.id]!;
  return [...new Set(question.options.flatMap((option) => option.produces ?? []).flatMap((production) => [...signalProductionContextFields(production), ...(production.kind === "hasRealCustomers" ? ["activity"] : [])]).filter((field): field is ContextFieldRef => CONTEXT_FIELD_REFS.includes(field as ContextFieldRef)))];
}
function refs(rule: RuleV2 | undefined, out = new Set<string>()): Set<string> {
  if (!rule) return out;
  if ("ref" in rule && "question" in rule.ref) out.add(rule.ref.question);
  if ("rules" in rule) rule.rules.forEach((item) => refs(item, out));
  if ("rule" in rule) refs(rule.rule, out);
  return out;
}
function rankReason(question: QuestionDefinitionV2, unresolved: ReadonlySet<ContextFieldRef>, unlocks: ReadonlySet<string>, usefulDirect: boolean, usefulSupporting: boolean, usefulProspective: boolean): QuestionSelectionReason {
  if (question.purpose.includes("confirmation")) return "confirmation";
  if (question.routingRole === "deepening") return "refinement";
  if (unlocks.has(question.id)) return "unlock_routing";
  if (question.routingRole === "core") return "required_context";
  if (producedFields(question).some((field) => unresolved.has(field))) return "required_context";
  if (question.purpose.includes("goal") || question.purpose.includes("friction")) return "goal_or_friction";
  if (usefulDirect && semanticSources(question).direct.length > 1) return "cross_cutting_evidence";
  if (usefulDirect) return "specialized_evidence";
  if (usefulProspective) return "prospective_evidence";
  if (usefulSupporting || question.priority === "refinement") return "refinement";
  return "specialized_evidence";
}
function semanticSources(question: QuestionDefinitionV2): { direct: DigitalDimensionId[]; supporting: DigitalDimensionId[] } {
  if (question.evidenceMigration !== "migrated" || !question.evidenceV3) return { direct: [], supporting: [] };
  return { direct: question.evidenceV3.dimensions.filter((d) => d.directness === "direct").map((d) => d.dimension), supporting: question.evidenceV3.dimensions.filter((d) => d.directness === "supporting").map((d) => d.dimension) };
}
/** A migrated direct source can resolve an `insufficient_context` dimension through the existing R4
 * `observed_dimension_evidence` contract. This proves that prospectively by simulation (never syntactically)
 * and only on substantive answers: `not_applicable` must stay neutral, and `unknown` must never justify asking. */
function canProspectivelyResolveApplicability(question: QuestionDefinitionV2, dimension: DigitalDimensionId, activeAnswers: AnswersV2, bank: readonly QuestionDefinitionV2[]): boolean {
  return question.options.some((option) => {
    if (option.kind !== undefined && option.kind !== "value") return false;
    const hypothetical = { ...activeAnswers, [question.id]: question.type === "multi" ? [option.value] : option.value };
    const resolvedAnswers = resolveEligibleQuestionsV2(hypothetical, bank).activeAnswers;
    return scoreCandidateContextualDimensionsV3({ answers: resolvedAnswers }, bank).dimensions.find((d) => d.id === dimension)?.applicability === "applicable";
  });
}

/** Candidate-only planner. Every invocation reconstructs the plan from raw answers. */
/** @internal Test seam for equivalent bank-order determinism; production entry always supplies the frozen bank. */
export function buildCandidateQuestionPlanFromBankV3({ answers, budget = DEFAULT_BUDGET }: CandidateQuestionPlannerInputV3, bank: readonly QuestionDefinitionV2[], policy: CandidateShadowSelectionPolicyV1 = "baseline"): CandidateQuestionPlanV3 {
  const hardMax = Math.min(CANDIDATE_ROUTE_HARD_CAP_V3, Math.max(1, budget.hardMax, Object.keys(answers).length));
  const normalizedBudget: RouteBudgetV1 = { ...budget, hardMax, targetMax: Math.min(hardMax, budget.targetMax), targetMin: Math.min(hardMax, budget.targetMin), materialEvidenceReserve: Math.min(hardMax - 1, Math.max(0, budget.materialEvidenceReserve ?? 0)) };
  const resolution = resolveEligibleQuestionsV2(answers, bank);
  const activeAnswers = resolution.activeAnswers;
  const scoring = scoreCandidateContextualDimensionsV3({ answers: activeAnswers }, bank);
  const dimensions = scoring.dimensions;
  const open = new Set(dimensions.filter((d) => d.applicability === "applicable" && d.score === null).map((d) => d.id));
  const applicable = new Set(dimensions.filter((d) => d.applicability === "applicable").map((d) => d.id));
  const insufficientContext = new Set(dimensions.filter((d) => d.applicability === "insufficient_context").map((d) => d.id));
  const observedDirect = new Set(scoring.dimensions.flatMap((d) => d.confidence.direct > 0 ? [d.id] : []));
  const unresolvedFields = new Set(CONTEXT_FIELD_REFS.filter((field) => !resolved(resolution.context, field)));
  const questionById = new Map(bank.map((q) => [q.id, q]));
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
  const prospectiveUtilityById = new Map<string, boolean>();
  const unlocks = new Set<string>();

  // In an active insurance agency with a real renewal branch, the specialty
  // question replaces the generic "review pending tasks" observation when it
  // can produce substantive renewal evidence. If the specialty answer is
  // unknown/not-applicable, the generic question remains available as fallback.
  // This substitution is shadow-only and must not change baseline/public routes.
  const renewalQuestion = questionById.get("q2_specialty_insurance_renewal");
  const renewalAnswer = activeAnswers["q2_specialty_insurance_renewal"];
  const renewalHasSubstantiveAnswer = typeof renewalAnswer === "string"
    && renewalAnswer !== "unknown" && renewalAnswer !== "not_applicable";
  const renewalCanResolveOpenDimension = renewalQuestion !== undefined
    && eligible.has("q2_specialty_insurance_renewal")
    && semanticSources(renewalQuestion).direct.some((dimension) => open.has(dimension));
  const specialtyReplacementIds = new Set<string>(
    policy === "utility_first"
      && activeAnswers["q2_niche_financial_tax_insurance"] === "insurance_agency"
      && (renewalHasSubstantiveAnswer || (renewalAnswer === undefined && renewalCanResolveOpenDimension))
      ? ["q2_followup_status_visibility"]
      : [],
  );

  // A prerequisite is useful only when one of its real answers activates an otherwise unavailable,
  // useful candidate child. A syntactic reference alone is not a routing benefit.
  for (const question of bank) {
    if (activeAnswers[question.id] !== undefined || !eligible.has(question.id)) continue;
    if (specialtyReplacementIds.has(question.id)) continue;
    const parentSources = semanticSources(question);
    const parentFields = producedFields(question);
    // Do not collect an out-of-scope direct observation merely to unlock a different question.
    // Context producers and pending routing prerequisites remain eligible for genuine branch work.
    if (parentSources.direct.length > 0 && !parentSources.direct.some((dimension) => applicable.has(dimension)) && parentFields.length === 0) continue;
    for (const option of question.options) {
      const hypothetical = { ...activeAnswers, [question.id]: question.type === "multi" ? [option.value] : option.value };
      const afterResolution = resolveEligibleQuestionsV2(hypothetical, bank);
      const after = new Set(afterResolution.eligibleQuestionIds);
      for (const child of bank) {
        if (activeAnswers[child.id] !== undefined || eligible.has(child.id) || !after.has(child.id)) continue;
        const childSources = semanticSources(child);
        const childFields = producedFields(child);
        const childCanResolveInsufficientContext = policy === "utility_first"
          && childSources.direct.some((dimension) =>
            insufficientContext.has(dimension)
            && canProspectivelyResolveApplicability(child, dimension, afterResolution.activeAnswers, bank));
        const unlocksUsefulChild = child.evidenceMigration === "migrated"
          ? childSources.direct.some((dimension) => open.has(dimension))
            || childSources.supporting.some((dimension) => observedDirect.has(dimension))
            || childCanResolveInsufficientContext
          : child.routingRole !== "deepening" && childFields.some((field) => unresolvedFields.has(field));
        if (unlocksUsefulChild) unlocks.add(question.id);
      }
    }
  }
  for (const q of bank) {
    if (activeAnswers[q.id] !== undefined) continue;
    const sources = semanticSources(q);
    const fields = producedFields(q);
    if (specialtyReplacementIds.has(q.id)) {
      trace.push({
        questionId: q.id,
        reason: rankReason(q, unresolvedFields, unlocks, false, false, false),
        selected: false,
        evidenceDimensions: sources.direct,
        supportingDimensions: sources.supporting,
        skipReason: "replaced_by_specialty",
      });
      continue;
    }
    const neededContext = new Set<ContextFieldRef>([...CONTEXT_CORE].filter((f) => unresolvedFields.has(f)));
    const goal = resolution.context.primaryGoal.status === "resolved" ? resolution.context.primaryGoal.value : undefined;
    const friction = resolution.context.primaryFriction.status === "resolved" ? resolution.context.primaryFriction.value : undefined;
    // Inventory alone is not diagnostic evidence. In shadow utility-first mode,
    // the tools question is useful only when it really unlocks context or a child.
    const digitalToolsRelevant = policy === "baseline" && q.id === "q2_digital_tools_in_use" && (["organize", "automate", "stop_losing", "measure"].includes(goal ?? "") || ["operations", "follow_up"].includes(friction ?? ""));
    for (const dimension of dimensions.filter((d) => d.applicability === "insufficient_context")) {
      for (const field of R4_CONTEXT_FIELDS[dimension.id] ?? []) if (unresolvedFields.has(field)) neededContext.add(field);
    }
    const unlocksCandidateBranch = unlocks.has(q.id);
    const contextUtility = (policy !== "utility_first" || !q.id.startsWith("q2_niche_") || unlocksCandidateBranch) && q.routingRole !== "deepening" && eligible.has(q.id) && (digitalToolsRelevant || fields.some((f) => neededContext.has(f)) || ["q2_has_customers", "q2_operational_status", "q2_buyer_recipient_relation"].includes(q.id) || unlocksCandidateBranch || triggered.has(q.id));
    const directUtility = eligible.has(q.id) && sources.direct.some((d) => open.has(d));
    // Supporting observations may refine an already scored direct dimension, never close a null score.
    const supportingUtility = eligible.has(q.id) && sources.supporting.some((d) => observedDirect.has(d) && dimensions.find((item) => item.id === d)?.score !== null);
    // A direct migrated source may prospectively resolve its own dimension out of insufficient_context
    // through the existing R4 observed_dimension_evidence contract; proven by simulation, not syntax.
    const prospectiveUtility = !directUtility && eligible.has(q.id) && sources.direct.some((d) => insufficientContext.has(d) && canProspectivelyResolveApplicability(q, d, activeAnswers, bank));
    prospectiveUtilityById.set(q.id, prospectiveUtility);
    if (contextUtility) contextUseful.push(q.id);
    if (directUtility || supportingUtility || prospectiveUtility) evidenceUseful.push(q.id);
    const useful = contextUtility || directUtility || supportingUtility || prospectiveUtility || triggered.has(q.id);
    const reason = rankReason(q, unresolvedFields, unlocks, directUtility, supportingUtility, prospectiveUtility);
    trace.push({ questionId: q.id, reason, selected: useful, evidenceDimensions: sources.direct, supportingDimensions: sources.supporting, ...(!eligible.has(q.id) ? { skipReason: "ineligible" as const } : !useful && q.evidenceMigration === "pending" ? { skipReason: "pending_evidence" as const } : !useful ? { skipReason: "not_useful" as const } : {}) });
  }
  const usefulIds = [...new Set([...contextUseful, ...evidenceUseful, ...triggered])].sort((a, b) => {
    const qa = questionById.get(a)!; const qb = questionById.get(b)!;
    const qaSources = semanticSources(qa); const qbSources = semanticSources(qb);
    const ra = rankReason(qa, unresolvedFields, unlocks, qaSources.direct.some((d) => open.has(d)), qaSources.supporting.some((d) => observedDirect.has(d)), prospectiveUtilityById.get(a) ?? false);
    const rb = rankReason(qb, unresolvedFields, unlocks, qbSources.direct.some((d) => open.has(d)), qbSources.supporting.some((d) => observedDirect.has(d)), prospectiveUtilityById.get(b) ?? false);
    const rr: Record<QuestionSelectionReason, number> = { confirmation: 7, required_context: 6, unlock_routing: 5, goal_or_friction: 4, cross_cutting_evidence: 3, specialized_evidence: 2, prospective_evidence: 1, refinement: 0 };
    const goal = resolution.context.primaryGoal.status === "resolved" ? resolution.context.primaryGoal.value : undefined;
    const friction = resolution.context.primaryFriction.status === "resolved" ? resolution.context.primaryFriction.value : undefined;
    const priorities = [...(goal ? GOAL_RELEVANCE[goal] : []), ...(friction ? FRICTION_RELEVANCE[friction] : [])];
    const utility = (id: string) => {
      const source = semanticSources(questionById.get(id)!);
      return Math.max(0, ...[...source.direct, ...source.supporting].map((dimension) => priorities.includes(dimension) ? priorities.length - priorities.indexOf(dimension) : 0));
    };
    if (policy === "utility_first") {
      // Immutable core anchors and contradiction checks precede optional content.
      // A sector-matched niche with real choices is consulted before generic
      // descriptive context; it is never evidence of a digital capability.
      const shadowRank = (q: QuestionDefinitionV2, id: string, reason: QuestionSelectionReason) => {
        if (triggered.has(id)) return 100;
        if (q.routingRole === "core") return 95;
        if (unlocks.has(id)) return 85;
        // Niche metadata is useful for personalization, but may not displace
        // direct evidence merely because it has many choices. The earlier
        // unlocks check is the only justification for promoting it above
        // a directly relevant unanswered diagnostic dimension.
        const source = semanticSources(q);
        const relevant = [...source.direct].some((dimension) => priorities.includes(dimension));
        if (relevant && source.direct.some((dimension) => open.has(dimension))) return 74;
        if (reason === "required_context") return 70;
        if (source.direct.some((dimension) => open.has(dimension))) return 60;
        if (reason === "prospective_evidence") return 50;
        if (source.supporting.some((dimension) => observedDirect.has(dimension))) return 30;
        return 10;
      };
      return shadowRank(qb, b, rb) - shadowRank(qa, a, ra) || utility(b) - utility(a)
        || (qb.priority === "critical" ? 1 : 0) - (qa.priority === "critical" ? 1 : 0) || a.localeCompare(b);
    }
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
  // Preserve reserved capacity for evidence, but allow an irreducible core context question to use it when
  // the answer is still needed to interpret applicability or unlock a relevant diagnostic branch.
  for (const id of usefulIds) {
    if (selected.length >= remaining) break;
    if (selected.includes(id)) continue;
    const question = questionById.get(id)!;
    const source = semanticSources(question);
    const evidenceTail = source.direct.some((dimension) => open.has(dimension)) || source.supporting.some((dimension) => observedDirect.has(dimension)) || prospectiveUtilityById.get(id);
    const requiredContextTail = contextUseful.includes(id) && (question.routingRole === "core" || unlocks.has(id));
    if (evidenceTail || requiredContextTail) add(id);
  }
  const unresolvedApplicableDimensions = [...open].sort();
  const lowDirectEvidenceDimensions = dimensions.filter((d) => d.applicability === "applicable" && d.confidence.direct <= 1).map((d) => d.id);
  const insufficientContextDimensions = dimensions.filter((d) => d.applicability === "insufficient_context").map((d) => d.id);
  const sufficient = unresolvedApplicableDimensions.length === 0 && insufficientContextDimensions.length === 0 && contradictions.every((c) => c.status !== "pending" || !c.confirmationQuestionId || !eligible.has(c.confirmationQuestionId));
  const hardCapReached = Object.keys(activeAnswers).length >= normalizedBudget.hardMax;
  const usefulUnselected = usefulIds.filter((id) => !selected.includes(id));
  const budgetBlocked = !hardCapReached && selected.length === 0 && usefulUnselected.length > 0;
  const terminalReason = selected.length > 0 || (hardCapReached && usefulIds.length > 0) ? "useful_questions_remaining" as const : budgetBlocked ? "budget_blocked" as const : "no_useful_questions" as const;
  const sufficiency: CandidateEvidenceSufficiencyV3 = {
    applicableDimensions: [...applicable].sort(), notApplicableDimensions: dimensions.filter((d) => d.applicability === "not_applicable").map((d) => d.id), insufficientContextDimensions, unresolvedApplicableDimensions, lowDirectEvidenceDimensions,
    contradictions, usefulContextQuestionIds: [...new Set(contextUseful)].sort(), usefulEvidenceQuestionIds: [...new Set(evidenceUseful)].sort(), usefulQuestionIds: usefulIds, usefulQuestionsRemaining: usefulIds.length > 0, sufficient,
    terminalReason,
  };
  const traceById = new Map(trace.map((entry) => [entry.questionId, entry]));
  for (const id of usefulUnselected) {
    const question = questionById.get(id)!;
    const entry = traceById.get(id)!;
    const skipReason = hardCapReached ? "hard_cap" as const : !moduleHasRoom(id) ? "module_budget" as const : selected.length >= baseSlots && !semanticSources(question).direct.some((dimension) => open.has(dimension)) && !semanticSources(question).supporting.some((dimension) => observedDirect.has(dimension)) && !prospectiveUtilityById.get(id) ? "base_budget" as const : entry.skipReason;
    if (skipReason) traceById.set(id, { ...entry, skipReason });
  }
  const selectedTrace = trace.map((entry) => traceById.get(entry.questionId)!);
  return {
    plannerIdentity: CANDIDATE_PLANNER_IDENTITY_V3, activeAnswers, context: resolution.context,
    contextResolution: Object.fromEntries(CONTEXT_FIELD_REFS.map((f) => [f, resolved(resolution.context, f) ? "resolved" : "unresolved"])) as Record<ContextFieldRef, "resolved" | "unresolved">,
    eligibleQuestionIds: resolution.eligibleQuestionIds, selectedQuestionIds: selected, nextQuestionId: selected[0], routeLength: Object.keys(activeAnswers).length + selected.length,
    budget: normalizedBudget, completion: { ready: hardCapReached || (selected.length === 0 && !budgetBlocked), hardCapReached, terminalReason: sufficiency.terminalReason }, evidenceSufficiency: sufficiency,
    trace: selectedTrace.map((entry) => ({ ...entry, selected: selected.includes(entry.questionId), ...(eligible.has(entry.questionId) && !selected.includes(entry.questionId) && !entry.skipReason ? { skipReason: hardCapReached ? "hard_cap" as const : "not_useful" as const } : {}) })), routingIterations: resolution.iterations,
  };
}

/** Production candidate entry point: the reviewed R3 evidence bank is fixed and cannot be caller-selected. */
export function buildCandidateQuestionPlanV3(input: CandidateQuestionPlannerInputV3): CandidateQuestionPlanV3 {
  return buildCandidateQuestionPlanFromBankV3(input, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
}
