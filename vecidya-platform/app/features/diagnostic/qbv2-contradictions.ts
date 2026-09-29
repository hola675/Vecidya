import type { QuestionBankV2, ResolveEligibleQuestionsResult } from "./qbv2-engine";
import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { collectAnswerDependencies, collectAnswerRefValueChecks, evaluateRuleV2, type AnswersV2, type RuleV2 } from "./qbv2-rules";

export const CONTRADICTION_RULES_VERSION = 1 as const;
export type ContradictionRulesVersion = typeof CONTRADICTION_RULES_VERSION;
export type ContradictionMateriality = "material" | "soft";
export type ContradictionStatus = "pending" | "confirmed" | "remains_ambiguous";

export type ContradictionEvidenceRef = {
  readonly questionId: string;
  readonly optionId: string;
};

export type ContradictionRuleV1 = {
  readonly id: string;
  /** Higher values are considered first; ordering never depends on registry insertion. */
  readonly priority: number;
  readonly when: RuleV2;
  readonly materiality: ContradictionMateriality;
  readonly affectedConcept: string;
  readonly reasonCode: string;
  readonly evidence: readonly ContradictionEvidenceRef[];
  readonly confirmationQuestionId?: string;
  readonly confirmationOptions?: {
    readonly decisive: readonly string[];
    readonly ambiguous: readonly string[];
  };
};

export type DetectedContradiction = {
  readonly ruleId: string;
  readonly priority: number;
  readonly materiality: ContradictionMateriality;
  readonly affectedConcept: string;
  readonly evidenceRefs: readonly ContradictionEvidenceRef[];
  readonly confirmationQuestionId?: string;
  readonly status: ContradictionStatus;
  readonly reasonCode: string;
};

export type ContradictionRegistryIssue = {
  readonly code: "DUPLICATE_RULE_ID" | "INVALID_RULE_ID" | "INVALID_CONFIRMATION_QUESTION" | "INVALID_EVIDENCE_QUESTION" | "INVALID_EVIDENCE_OPTION" | "MISSING_CONFIRMATION_OPTIONS" | "OVERLAPPING_CONFIRMATION_OPTIONS" | "DUPLICATE_CONFIRMATION_OPTION" | "UNCLASSIFIED_CONFIRMATION_OPTION" | "INVALID_WHEN_QUESTION" | "INVALID_WHEN_OPTION";
  readonly ruleId: string;
  readonly detail: string;
};

function optionValues(question: QuestionDefinitionV2): ReadonlySet<string> {
  return new Set(question.options.map((option) => option.value));
}

function selectedValues(answer: string | readonly string[] | undefined): readonly string[] {
  if (answer === undefined) return [];
  return Array.isArray(answer) ? (answer as readonly string[]) : [answer as string];
}

function compareRules(a: ContradictionRuleV1, b: ContradictionRuleV1): number {
  if (a.materiality !== b.materiality) return a.materiality === "material" ? -1 : 1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  return a.id.localeCompare(b.id);
}

function compareDetected(a: DetectedContradiction, b: DetectedContradiction): number {
  if (a.materiality !== b.materiality) return a.materiality === "material" ? -1 : 1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  return a.ruleId.localeCompare(b.ruleId);
}

export function validateContradictionRulesV1(rules: readonly ContradictionRuleV1[], bank: QuestionBankV2): readonly ContradictionRegistryIssue[] {
  const issues: ContradictionRegistryIssue[] = [];
  const byId = new Map(bank.map((question) => [question.id, question]));
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!rule.id.trim()) issues.push({ code: "INVALID_RULE_ID", ruleId: rule.id, detail: "rule id must not be empty" });
    if (seen.has(rule.id)) issues.push({ code: "DUPLICATE_RULE_ID", ruleId: rule.id, detail: "rule id must be unique" });
    seen.add(rule.id);
    if (rule.confirmationQuestionId) {
      const confirmation = byId.get(rule.confirmationQuestionId);
      if (!confirmation || !confirmation.purpose.includes("confirmation") || confirmation.contradictionRole?.type !== "confirms") issues.push({ code: "INVALID_CONFIRMATION_QUESTION", ruleId: rule.id, detail: `confirmation question ${rule.confirmationQuestionId} is missing, not confirmation-purpose, or lacks contradictionRole=confirms` });
      if (!rule.confirmationOptions || (rule.confirmationOptions.decisive.length === 0 && rule.confirmationOptions.ambiguous.length === 0)) issues.push({ code: "MISSING_CONFIRMATION_OPTIONS", ruleId: rule.id, detail: "confirmation options must classify decisive and/or ambiguous answers" });
      if (confirmation && rule.confirmationOptions) {
        const values = optionValues(confirmation);
        for (const optionId of [...rule.confirmationOptions.decisive, ...rule.confirmationOptions.ambiguous]) if (!values.has(optionId)) issues.push({ code: "INVALID_EVIDENCE_OPTION", ruleId: rule.id, detail: `confirmation option ${optionId} does not exist on ${confirmation.id}` });
        if (rule.confirmationOptions.decisive.some((optionId) => rule.confirmationOptions!.ambiguous.includes(optionId))) issues.push({ code: "OVERLAPPING_CONFIRMATION_OPTIONS", ruleId: rule.id, detail: "an answer cannot be both decisive and ambiguous" });
        const classified = [...rule.confirmationOptions.decisive, ...rule.confirmationOptions.ambiguous];
        if (new Set(classified).size !== classified.length) issues.push({ code: "DUPLICATE_CONFIRMATION_OPTION", ruleId: rule.id, detail: "confirmation options cannot be classified more than once" });
        for (const optionId of values) if (!classified.includes(optionId)) issues.push({ code: "UNCLASSIFIED_CONFIRMATION_OPTION", ruleId: rule.id, detail: `confirmation option ${optionId} has no decisive/ambiguous classification` });
      }
    }
    for (const questionId of collectAnswerDependencies(rule.when)) if (!byId.has(questionId)) issues.push({ code: "INVALID_WHEN_QUESTION", ruleId: rule.id, detail: `when question ${questionId} is missing` });
    for (const check of collectAnswerRefValueChecks(rule.when)) {
      const question = byId.get(check.question);
      if (question && check.values.some((value) => !optionValues(question).has(value))) issues.push({ code: "INVALID_WHEN_OPTION", ruleId: rule.id, detail: `when option ${check.question}.${check.values.join(",")} is missing` });
    }
    for (const evidence of rule.evidence) {
      const question = byId.get(evidence.questionId);
      if (!question) issues.push({ code: "INVALID_EVIDENCE_QUESTION", ruleId: rule.id, detail: `evidence question ${evidence.questionId} is missing` });
      else if (!optionValues(question).has(evidence.optionId)) issues.push({ code: "INVALID_EVIDENCE_OPTION", ruleId: rule.id, detail: `evidence option ${evidence.questionId}.${evidence.optionId} is missing` });
    }
  }
  return issues;
}

function confirmationStatus(rule: ContradictionRuleV1, answers: AnswersV2): ContradictionStatus {
  if (!rule.confirmationQuestionId) return "pending";
  const answer = answers[rule.confirmationQuestionId];
  if (answer === undefined) return "pending";
  const values = selectedValues(answer);
  if (rule.confirmationOptions?.decisive.some((optionId) => values.includes(optionId))) return "confirmed";
  return "remains_ambiguous";
}

export type ContradictionDetectionState = {
  readonly result: ResolveEligibleQuestionsResult;
  readonly bank: QuestionBankV2;
  readonly rules?: readonly ContradictionRuleV1[];
};

/** Detects only from the resolver's active answers and context snapshot. */
export function detectContradictionsV2({ result, bank, rules = DEFAULT_CONTRADICTION_RULES_V1 }: ContradictionDetectionState): readonly DetectedContradiction[] {
  const activeAnswers = result.activeAnswers;
  const detected = [...rules].sort(compareRules).filter((rule) => evaluateRuleV2(rule.when, activeAnswers, result.context)).map((rule): DetectedContradiction => ({
    ruleId: rule.id,
    priority: rule.priority,
    materiality: rule.materiality,
    affectedConcept: rule.affectedConcept,
    evidenceRefs: rule.evidence.filter((evidence) => selectedValues(activeAnswers[evidence.questionId]).includes(evidence.optionId)),
    ...(rule.confirmationQuestionId ? { confirmationQuestionId: rule.confirmationQuestionId } : {}),
    status: confirmationStatus(rule, activeAnswers),
    reasonCode: rule.reasonCode,
  })).sort(compareDetected);
  // The contradiction remains traceable even when its confirmation is fixture-only or
  // absent from the supplied bank; the planner decides whether a valid trigger can be served.
  void bank;
  return detected;
}

export function getTriggeredConfirmations(contradictions: readonly DetectedContradiction[]): readonly string[] {
  return [...new Set(contradictions.filter((item) => item.materiality === "material" && item.status === "pending" && item.confirmationQuestionId).map((item) => item.confirmationQuestionId!))];
}

export const DEFAULT_CONTRADICTION_RULES_V1: readonly ContradictionRuleV1[] = [
  {
    id: "primary_friction.visibility_vs_follow_up.material",
    priority: 100,
    when: {
      op: "and",
      rules: [
        { op: "eq", ref: { question: "q2_friction" }, value: "visibility" },
        { op: "archetypeIncludes", value: "local_service" },
        { op: "eq", ref: { question: "q2_service_response_speed" }, value: "some_lost" },
        { op: "eq", ref: { question: "q2_service_quote_practice" }, value: "yes" },
        { op: "eq", ref: { question: "q2_service_quote_followup" }, value: "rarely" },
      ],
    },
    materiality: "material",
    affectedConcept: "primaryFriction",
    reasonCode: "primary_friction_competing_strong_evidence",
    evidence: [
      { questionId: "q2_friction", optionId: "visibility" },
      { questionId: "q2_service_response_speed", optionId: "some_lost" },
      { questionId: "q2_service_quote_practice", optionId: "yes" },
      { questionId: "q2_service_quote_followup", optionId: "rarely" },
    ],
    confirmationQuestionId: "q2_confirm_primary_friction",
    confirmationOptions: { decisive: ["visibility", "follow_up"], ambiguous: ["unsure"] },
  },
  {
    id: "primary_friction.visibility_vs_follow_up.soft",
    priority: 10,
    when: {
      op: "and",
      rules: [
        { op: "eq", ref: { question: "q2_friction" }, value: "visibility" },
        { op: "archetypeIncludes", value: "local_service" },
        { op: "eq", ref: { question: "q2_service_response_speed" }, value: "some_lost" },
        { op: "answered", ref: { question: "q2_service_quote_followup" } },
        { op: "in", ref: { question: "q2_service_quote_followup" }, values: ["always", "sometimes"] },
      ],
    },
    materiality: "soft",
    affectedConcept: "primaryFriction",
    reasonCode: "primary_friction_tension_needs_more_evidence",
    evidence: [
      { questionId: "q2_friction", optionId: "visibility" },
      { questionId: "q2_service_response_speed", optionId: "some_lost" },
      { questionId: "q2_service_quote_followup", optionId: "always" },
      { questionId: "q2_service_quote_followup", optionId: "sometimes" },
    ],
  },
];
