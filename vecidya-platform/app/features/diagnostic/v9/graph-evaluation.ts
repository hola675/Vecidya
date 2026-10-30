import { selectV9Questions, type V9SelectionResult } from "./question-selection";

/**
 * Standalone V9 rule contract. This module deliberately imports no QBV2/V8
 * domain code. Legacy candidate rules can be read at the migration boundary
 * because their JSON operators are structurally compatible.
 */
export type V9AnswerRef = { readonly question: string };
export type V9Rule =
  | { readonly op: "answered"; readonly ref: V9AnswerRef }
  | { readonly op: "eq" | "notEq"; readonly ref: V9AnswerRef; readonly value: string }
  | { readonly op: "in" | "multiIntersects"; readonly ref: V9AnswerRef; readonly values: readonly string[] }
  | { readonly op: "multiExcluding"; readonly ref: V9AnswerRef; readonly exclude: readonly string[] }
  | { readonly op: "contextResolvedEquals"; readonly field: string; readonly value: string }
  | { readonly op: "contextResolvedIn"; readonly field: string; readonly values: readonly string[] }
  | { readonly op: "contextUnresolved"; readonly field: string }
  | { readonly op: "archetypeIncludes"; readonly value: string }
  | { readonly op: "and" | "or"; readonly rules: readonly V9Rule[] }
  | { readonly op: "not"; readonly rule: V9Rule };

export type V9RuleStatus = "eligible" | "ineligible" | "pending";
export type V9ResolvedField = { readonly status: "resolved"; readonly value: string } | { readonly status: "unresolved" };
export type V9GraphFacts = {
  readonly answers: Readonly<Record<string, string | readonly string[] | undefined>>;
  readonly context?: {
    readonly fields: Readonly<Record<string, V9ResolvedField | undefined>>;
    /** Explicitly resolved components; never inferred from the archetype name. */
    readonly archetypeComponents?: readonly string[];
  };
};
export type V9RuleTrace = {
  readonly status: V9RuleStatus;
  readonly op: V9Rule["op"];
  readonly dependency?: string;
  readonly children?: readonly V9RuleTrace[];
};

const andStatus = (statuses: readonly V9RuleStatus[]): V9RuleStatus =>
  statuses.includes("ineligible") ? "ineligible" : statuses.includes("pending") ? "pending" : "eligible";
const orStatus = (statuses: readonly V9RuleStatus[]): V9RuleStatus =>
  statuses.includes("eligible") ? "eligible" : statuses.includes("pending") ? "pending" : "ineligible";
const invert = (status: V9RuleStatus): V9RuleStatus =>
  status === "pending" ? "pending" : status === "eligible" ? "ineligible" : "eligible";

function evaluate(rule: V9Rule, facts: V9GraphFacts): V9RuleTrace {
  if (rule.op === "and" || rule.op === "or") {
    const children = rule.rules.map((child) => evaluate(child, facts));
    return {
      op: rule.op,
      status: rule.op === "and" ? andStatus(children.map((child) => child.status)) : orStatus(children.map((child) => child.status)),
      children,
    };
  }
  if (rule.op === "not") {
    const child = evaluate(rule.rule, facts);
    return { op: "not", status: invert(child.status), children: [child] };
  }
  if (rule.op === "archetypeIncludes") {
    const components = facts.context?.archetypeComponents;
    return { op: rule.op, status: components ? (components.includes(rule.value) ? "eligible" : "ineligible") : "pending", dependency: "context:archetype" };
  }
  if (rule.op === "contextResolvedEquals" || rule.op === "contextResolvedIn" || rule.op === "contextUnresolved") {
    const field = facts.context?.fields[rule.field];
    if (!field) return { op: rule.op, status: "pending", dependency: `context:${rule.field}` };
    if (rule.op === "contextUnresolved") {
      return { op: rule.op, status: field.status === "unresolved" ? "eligible" : "ineligible" };
    }
    if (field.status === "unresolved") return { op: rule.op, status: "ineligible" };
    const pass = rule.op === "contextResolvedEquals" ? field.value === rule.value : rule.values.includes(field.value);
    return { op: rule.op, status: pass ? "eligible" : "ineligible" };
  }
  const answer = facts.answers[rule.ref.question];
  if (answer === undefined) {
    return { op: rule.op, status: "pending", dependency: `answer:${rule.ref.question}` };
  }
  if (rule.op === "answered") return { op: rule.op, status: "eligible" };
  // A selected neutral option cannot turn a negative comparison into proof.
  if (answer === "unknown" || answer === "not_applicable") {
    return { op: rule.op, status: "ineligible" };
  }

  const values = typeof answer === "string" ? [answer] : answer;
  let pass: boolean;
  switch (rule.op) {
    case "eq": pass = typeof answer === "string" && answer === rule.value; break;
    case "notEq": pass = typeof answer === "string" && answer !== rule.value; break;
    case "in": pass = typeof answer === "string" && rule.values.includes(answer); break;
    case "multiExcluding": pass = values.length > 0 && !rule.exclude.some((item) => values.includes(item)); break;
    case "multiIntersects": pass = rule.values.some((item) => values.includes(item)); break;
  }
  return { op: rule.op, status: pass ? "eligible" : "ineligible" };
}

export function evaluateV9Rule(rule: V9Rule, facts: V9GraphFacts): V9RuleTrace {
  return evaluate(rule, facts);
}

export type V9GraphQuestion = {
  readonly id: string;
  readonly appliesWhen?: V9Rule;
  /** Material-only rules are evaluated exclusively when explicitly requested. */
  readonly materialAppliesWhen?: V9Rule;
};
export type V9GraphQuestionResult = {
  readonly id: string;
  readonly status: V9RuleStatus;
  readonly source: "base" | "material" | "unconditional" | "material_not_requested";
  readonly trace?: V9RuleTrace;
};

export function evaluateV9Question(
  question: V9GraphQuestion,
  facts: V9GraphFacts,
  materialEvidenceRequested = false,
): V9GraphQuestionResult {
  if (!question.appliesWhen && !question.materialAppliesWhen) {
    return { id: question.id, status: "eligible", source: "unconditional" };
  }
  if (!question.appliesWhen && !materialEvidenceRequested) {
    return { id: question.id, status: "ineligible", source: "material_not_requested" };
  }
  const base = question.appliesWhen && evaluate(question.appliesWhen, facts);
  const material = materialEvidenceRequested && question.materialAppliesWhen
    ? evaluate(question.materialAppliesWhen, facts)
    : undefined;
  const status = base && material ? orStatus([base.status, material.status]) : (base ?? material)!.status;
  return { id: question.id, status, source: base && base.status === "eligible" ? "base" : material ? "material" : "base", trace: base && material ? { op: "or", status, children: [base, material] } : (base ?? material)! };
}


export type V9GraphPlan = {
  readonly evaluations: readonly V9GraphQuestionResult[];
  readonly selection: V9SelectionResult;
};

/** Graph candidates must already be ordered by a reviewed dependency/priority plan. */
export function planV9GraphQuestions(
  questions: readonly V9GraphQuestion[],
  facts: V9GraphFacts,
  presentedQuestionIds: readonly string[],
  options: { readonly extendedInterviewConsented?: boolean; readonly materialEvidenceRequested?: boolean } = {},
): V9GraphPlan {
  const evaluations = questions.map((question) => evaluateV9Question(question, facts, options.materialEvidenceRequested === true));
  const selection = selectV9Questions(
    evaluations.map((item) => ({ id: item.id, eligible: item.status === "eligible", pending: item.status === "pending" })),
    presentedQuestionIds,
    options.extendedInterviewConsented === true,
  );
  return { evaluations, selection };
}
