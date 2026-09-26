import type { Context } from "./types";
import type { OptionIdOf, QuestionId } from "./questions";

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
 *
 * Este módulo no importa nada en tiempo de valor de `./questions` (solo tipos): así
 * `questions.ts` puede importar los builders de aquí y usarlos en su propio ámbito de
 * módulo sin depender de qué archivo cargue primero (evita un ciclo de importación por
 * valor entre ambos módulos).
 */

export type Ref = { question: QuestionId };

export type Rule =
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

/** Equivalente local de `selectedValues` (sin importar `./questions` en tiempo de valor; ver nota de módulo). */
function toList(value: string | readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? (value as string[]) : [value as string];
}

export type RuleTrace = { rule: Rule; result: boolean; observed?: string | readonly string[] | undefined; children?: RuleTrace[] };

/**
 * Único evaluador: recorre el árbol una vez y produce la traza completa. `evaluateRule` es un
 * envoltorio de esta misma función (§7: nunca una segunda semántica de evaluación, ni siquiera
 * para combinar `and`/`or`/`not` — antes de este fix, `evaluateRuleTrace` recalculaba esa
 * combinación por su cuenta en vez de reutilizarla).
 */
export function evaluateRuleTrace(rule: Rule, context: Context): { result: boolean; trace: RuleTrace } {
  const build = (node: Rule): RuleTrace => {
    switch (node.op) {
      case "and": {
        const children = node.rules.map(build);
        return { rule: node, result: children.every((child) => child.result), children };
      }
      case "or": {
        const children = node.rules.map(build);
        return { rule: node, result: children.some((child) => child.result), children };
      }
      case "not": {
        const child = build(node.rule);
        return { rule: node, result: !child.result, children: [child] };
      }
      case "answered": {
        const observed = resolve(context, node.ref.question);
        return { rule: node, result: Boolean(observed), observed };
      }
      case "eq": {
        const observed = resolve(context, node.ref.question);
        return { rule: node, result: observed === node.value, observed };
      }
      case "notEq": {
        const observed = resolve(context, node.ref.question);
        return { rule: node, result: observed !== node.value, observed };
      }
      case "in": {
        const observed = resolve(context, node.ref.question);
        return { rule: node, result: typeof observed === "string" && node.values.includes(observed), observed };
      }
      case "multiExcluding": {
        const observed = resolve(context, node.ref.question);
        const values = toList(observed);
        return { rule: node, result: values.length > 0 && !node.exclude.some((excluded) => values.includes(excluded)), observed };
      }
      case "multiIntersects": {
        const observed = resolve(context, node.ref.question);
        const values = toList(observed);
        return { rule: node, result: node.values.some((candidate) => values.includes(candidate)), observed };
      }
    }
  };
  const trace = build(rule);
  return { result: trace.result, trace };
}

/** Envoltorio de `evaluateRuleTrace`: el árbol se recorre una sola vez, con una sola semántica. */
export function evaluateRule(rule: Rule, context: Context): boolean {
  return evaluateRuleTrace(rule, context).result;
}

/** Deriva `dependsOn` directamente del árbol de la regla (§8): nunca una segunda fuente manual. */
export function collectDependencies(rule: Rule): QuestionId[] {
  const seen = new Set<QuestionId>();
  const visit = (node: Rule): void => {
    switch (node.op) {
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

export type ReasonCode = "rule_true" | "stage_mismatch" | "profile_mismatch" | "dependency_unanswered" | "rule_false";

/** El código de razón se deriva de la traza que ya produjo `evaluateRuleTrace`; nunca reevalúa. */
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

/**
 * Builders: producen datos `Rule` planos, tipados por pregunta (`OptionIdOf<Q>`, igual que
 * DIAG-V3-02) para que un literal que no es una opción real de esa pregunta no compile — la
 * regla almacenada guarda `value`/`values` como `string` porque `Rule` es una unión uniforme,
 * pero el literal ya pasó por esta comprobación al construirla.
 */
export const answered = (question: QuestionId): Rule => ({ op: "answered", ref: { question } });
export const eq = <Q extends QuestionId>(question: Q, value: OptionIdOf<Q>): Rule => ({ op: "eq", ref: { question }, value });
export const notEq = <Q extends QuestionId>(question: Q, value: OptionIdOf<Q>): Rule => ({ op: "notEq", ref: { question }, value });
export const isIn = <Q extends QuestionId>(question: Q, values: readonly OptionIdOf<Q>[]): Rule => ({ op: "in", ref: { question }, values });
export const multiExcluding = <Q extends QuestionId>(question: Q, exclude: readonly OptionIdOf<Q>[]): Rule => ({ op: "multiExcluding", ref: { question }, exclude });
export const multiIntersects = <Q extends QuestionId>(question: Q, values: readonly OptionIdOf<Q>[]): Rule => ({ op: "multiIntersects", ref: { question }, values });
export const and = (...rules: Rule[]): Rule => ({ op: "and", rules });
export const or = (...rules: Rule[]): Rule => ({ op: "or", rules });
export const not = (rule: Rule): Rule => ({ op: "not", rule });
