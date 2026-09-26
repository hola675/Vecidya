import type { Context } from "./types";
import type { QuestionId } from "./questions";
import { selectedValues } from "./questions";

/**
 * DIAG-V3-03: motor de reglas declarativo.
 *
 * `Rule` es un dato serializable (sin funciones, clases, Symbols ni Date): puede
 * inspeccionarse, validarse, recorrerse y evaluarse con un único evaluador puro
 * (`evaluateRule`). Sustituye a las 23 closures `applies: (ctx) => boolean` que tenía
 * `APPLICABILITY` en `questions.ts` antes de esta fase, sin cambiar su comportamiento.
 *
 * Resolución de referencias (`Ref.question`): las cuatro preguntas de contexto
 * (`profile`, `goal`, `stage`, `team`) se leen desde el `Context` ya validado
 * (`context.profile`, etc., los mismos valores que produce `deriveContext` con
 * `isProfileId`/`isStageId`/`isTeamId`/`isGoalId`); cualquier otra pregunta se lee de
 * `context.answers[question]` en crudo. Es exactamente lo que leían las closures
 * originales (`context.stage` frente a `context.answers.assets`), así que un solo tipo
 * `Ref = { question: QuestionId }` basta: en este registro, `profile`/`goal`/`stage`/`team`
 * son a la vez preguntas reales y proyecciones validadas de esas mismas respuestas, por lo
 * que no se necesita un `ContextRef` separado de `AnswerRef<QuestionId>`.
 */

export type Ref = { question: QuestionId };

export type Rule =
  | { op: "always" }
  | { op: "answered"; ref: Ref }
  | { op: "eq"; ref: Ref; value: string }
  | { op: "notEq"; ref: Ref; value: string }
  | { op: "in"; ref: Ref; values: readonly string[] }
  | { op: "multiExcluding"; ref: Ref; exclude: readonly string[] }
  | { op: "multiIntersects"; ref: Ref; values: readonly string[] }
  | { op: "and"; rules: readonly Rule[] }
  | { op: "or"; rules: readonly Rule[] }
  | { op: "not"; rule: Rule };

const CONTEXT_FIELDS = new Set<string>(["profile", "goal", "stage", "team"]);

function resolve(context: Context, question: QuestionId): string | readonly string[] | undefined {
  if (CONTEXT_FIELDS.has(question)) return (context as unknown as Record<string, string | undefined>)[question];
  return context.answers[question] as string | readonly string[] | undefined;
}

export function evaluateRule(rule: Rule, context: Context): boolean {
  switch (rule.op) {
    case "always":
      return true;
    case "answered":
      return Boolean(resolve(context, rule.ref.question));
    case "eq":
      return resolve(context, rule.ref.question) === rule.value;
    case "notEq":
      return resolve(context, rule.ref.question) !== rule.value;
    case "in": {
      const value = resolve(context, rule.ref.question);
      return typeof value === "string" && rule.values.includes(value);
    }
    case "multiExcluding": {
      const values = selectedValues<string>(resolve(context, rule.ref.question));
      return values.length > 0 && !rule.exclude.some((excluded) => values.includes(excluded));
    }
    case "multiIntersects": {
      const values = selectedValues<string>(resolve(context, rule.ref.question));
      return rule.values.some((candidate) => values.includes(candidate));
    }
    case "and":
      return rule.rules.every((child) => evaluateRule(child, context));
    case "or":
      return rule.rules.some((child) => evaluateRule(child, context));
    case "not":
      return !evaluateRule(rule.rule, context);
  }
}

/** Deriva `dependsOn` directamente del árbol de la regla (§8): nunca una segunda fuente manual. */
export function collectDependencies(rule: Rule): QuestionId[] {
  const seen = new Set<QuestionId>();
  const visit = (node: Rule): void => {
    switch (node.op) {
      case "always":
        return;
      case "answered":
      case "eq":
      case "notEq":
      case "in":
      case "multiExcluding":
      case "multiIntersects":
        seen.add(node.ref.question);
        return;
      case "and":
      case "or":
        node.rules.forEach(visit);
        return;
      case "not":
        visit(node.rule);
    }
  };
  visit(rule);
  return [...seen];
}

export type RuleTrace = { rule: Rule; result: boolean; observed?: string | readonly string[] | undefined; children?: RuleTrace[] };

/** Traza de una sola pasada: `explainApplicability` deriva su código de razón de ESTA traza, nunca de un segundo evaluador. */
export function evaluateRuleTrace(rule: Rule, context: Context): { result: boolean; trace: RuleTrace } {
  const build = (node: Rule): RuleTrace => {
    if (node.op === "and" || node.op === "or") {
      const children = node.rules.map(build);
      const result = node.op === "and" ? children.every((child) => child.result) : children.some((child) => child.result);
      return { rule: node, result, children };
    }
    if (node.op === "not") {
      const child = build(node.rule);
      return { rule: node, result: !child.result, children: [child] };
    }
    if (node.op === "always") return { rule: node, result: true };
    return { rule: node, result: evaluateRule(node, context), observed: resolve(context, node.ref.question) };
  };
  const trace = build(rule);
  return { result: trace.result, trace };
}

export type ReasonCode = "rule_true" | "stage_mismatch" | "profile_mismatch" | "dependency_unanswered" | "rule_false";

export function explainApplicability(rule: Rule, context: Context): { applicable: boolean; reasonCode: ReasonCode; trace: RuleTrace } {
  const { result, trace } = evaluateRuleTrace(rule, context);
  if (result) return { applicable: true, reasonCode: "rule_true", trace };
  let node = trace;
  while (node.children?.length) node = node.children.find((child) => !child.result) ?? node.children[0];
  const ref = "ref" in node.rule ? node.rule.ref : undefined;
  const reasonCode: ReasonCode =
    node.rule.op === "answered" ? "dependency_unanswered" : ref?.question === "stage" ? "stage_mismatch" : ref?.question === "profile" ? "profile_mismatch" : "rule_false";
  return { applicable: false, reasonCode, trace };
}

export const answered = (question: QuestionId): Rule => ({ op: "answered", ref: { question } });
export const eq = (question: QuestionId, value: string): Rule => ({ op: "eq", ref: { question }, value });
export const notEq = (question: QuestionId, value: string): Rule => ({ op: "notEq", ref: { question }, value });
export const isIn = (question: QuestionId, values: readonly string[]): Rule => ({ op: "in", ref: { question }, values });
export const multiExcluding = (question: QuestionId, exclude: readonly string[]): Rule => ({ op: "multiExcluding", ref: { question }, exclude });
export const multiIntersects = (question: QuestionId, values: readonly string[]): Rule => ({ op: "multiIntersects", ref: { question }, values });
export const and = (...rules: Rule[]): Rule => ({ op: "and", rules });
export const or = (...rules: Rule[]): Rule => ({ op: "or", rules });
export const not = (rule: Rule): Rule => ({ op: "not", rule });
