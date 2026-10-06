import type { ResolvedDomainContext } from "./context-resolver";
import type { OperationalArchetype } from "./contracts";

/**
 * Motor de reglas declarativo de QBV2 (DIAG-V3-08B.2 §20-23), compatible en espíritu con DIAG-V3-03
 * (`routing.ts`) pero deliberadamente SEPARADO: QBV2 tiene su propio espacio de `QuestionId`/`OptionId`
 * (§34, §38) y necesita una segunda capa de condición que QBV1 no tiene — `ContextRef`, que lee del
 * `ResolvedDomainContext` de 08B.1 (`Resolution<T>` por campo), no de una respuesta cruda.
 *
 * `AnswerRefV2` y `ContextRef` son dos tipos DISTINTOS a propósito (§22): nunca `field: string`
 * genérico. Un nodo de regla es uno u otro, nunca ambiguo sobre cuál capa consulta.
 */

export type AnswerRefV2 = { readonly question: string };

/** Campos que produce el Context Resolver de 08B.1, sin `answers`/`profile` (QBV1). */
export const CONTEXT_FIELD_REFS = ["entity", "businessModel", "audienceMonetization", "archetype", "niche", "nicheGroup", "growthStage", "operatingRegularity", "processConsistency", "capacitySituation", "appointmentAttendance", "b2bFollowupProcess", "discoveryReachReliability", "activity", "customerReach", "customerBuyer", "primaryGoal", "primaryFriction"] as const;
export type ContextFieldRef = (typeof CONTEXT_FIELD_REFS)[number];

function readContextField(context: ResolvedDomainContext, field: ContextFieldRef): { status: "resolved"; value: string } | { status: "unresolved" } {
  const resolution = field === "customerReach" ? context.customerModel.reach : field === "customerBuyer" ? context.customerModel.buyer : context[field];
  return resolution.status === "resolved" ? { status: "resolved", value: resolution.value } : { status: "unresolved" };
}

export type RuleV2 =
  | { readonly op: "answered"; readonly ref: AnswerRefV2 }
  | { readonly op: "eq"; readonly ref: AnswerRefV2; readonly value: string }
  | { readonly op: "notEq"; readonly ref: AnswerRefV2; readonly value: string }
  | { readonly op: "in"; readonly ref: AnswerRefV2; readonly values: readonly string[] }
  | { readonly op: "multiExcluding"; readonly ref: AnswerRefV2; readonly exclude: readonly string[] }
  | { readonly op: "multiIntersects"; readonly ref: AnswerRefV2; readonly values: readonly string[] }
  | { readonly op: "contextResolvedEquals"; readonly field: ContextFieldRef; readonly value: string }
  | { readonly op: "contextResolvedIn"; readonly field: ContextFieldRef; readonly values: readonly string[] }
  | { readonly op: "contextUnresolved"; readonly field: ContextFieldRef }
  /**
   * Pertenencia a `archetypeComponents` (DIAG-V3-08B.3 Lote B, C1), DISTINTA a propósito de
   * `contextResolvedEquals("archetype", ...)`: esa compara el valor EXACTO de `archetype` (nunca es
   * cierto que `archetype === "professional"` cuando el negocio es `hybrid`), mientras que esta pregunta
   * si `"professional"` es uno de los componentes reales, sea o no `archetype` un valor único o
   * `"hybrid"`. Un valor no-hybrid con un solo componente sigue siendo compatible con ambas — nunca
   * cambia silenciosamente el significado de `contextResolvedEquals`/`contextResolvedIn` existentes.
   */
  | { readonly op: "archetypeIncludes"; readonly value: OperationalArchetype }
  | { readonly op: "and"; readonly rules: readonly RuleV2[] }
  | { readonly op: "or"; readonly rules: readonly RuleV2[] }
  | { readonly op: "not"; readonly rule: RuleV2 };

export type AnswersV2 = Readonly<Record<string, string | readonly string[]>>;

function toList(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value as string];
}

export type RuleV2Trace = { readonly rule: RuleV2; readonly result: boolean; readonly observed?: string | readonly string[]; children?: readonly RuleV2Trace[] };

/** Único evaluador (mismo principio que `evaluateRuleTrace` de DIAG-V3-03, §7 de esa fase: nunca una segunda semántica). */
export function evaluateRuleV2Trace(rule: RuleV2, answers: AnswersV2, context: ResolvedDomainContext): { result: boolean; trace: RuleV2Trace } {
  const build = (node: RuleV2): RuleV2Trace => {
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
        const observed = answers[node.ref.question];
        return { rule: node, result: observed !== undefined, observed };
      }
      case "eq": {
        const observed = answers[node.ref.question];
        return { rule: node, result: observed === node.value, observed };
      }
      case "notEq": {
        const observed = answers[node.ref.question];
        return { rule: node, result: observed !== node.value, observed };
      }
      case "in": {
        const observed = answers[node.ref.question];
        return { rule: node, result: typeof observed === "string" && node.values.includes(observed), observed };
      }
      case "multiExcluding": {
        const observed = answers[node.ref.question];
        const values = toList(observed);
        return { rule: node, result: values.length > 0 && !node.exclude.some((excluded) => values.includes(excluded)), observed };
      }
      case "multiIntersects": {
        const observed = answers[node.ref.question];
        const values = toList(observed);
        return { rule: node, result: node.values.some((candidate) => values.includes(candidate)), observed };
      }
      case "contextResolvedEquals": {
        const field = readContextField(context, node.field);
        return { rule: node, result: field.status === "resolved" && field.value === node.value };
      }
      case "contextResolvedIn": {
        const field = readContextField(context, node.field);
        return { rule: node, result: field.status === "resolved" && node.values.includes(field.value) };
      }
      case "contextUnresolved": {
        const field = readContextField(context, node.field);
        return { rule: node, result: field.status === "unresolved" };
      }
      case "archetypeIncludes": {
        return { rule: node, result: context.archetypeComponents.includes(node.value) };
      }
    }
  };
  const trace = build(rule);
  return { result: trace.result, trace };
}

export function evaluateRuleV2(rule: RuleV2, answers: AnswersV2, context: ResolvedDomainContext): boolean {
  return evaluateRuleV2Trace(rule, answers, context).result;
}

/** Dependencias de respuesta (§20-21): usadas para el grafo AnswerRef-only, ajeno al contexto. */
export function collectAnswerDependencies(rule: RuleV2): string[] {
  const seen = new Set<string>();
  const visit = (node: RuleV2): void => {
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
        return;
      case "contextResolvedEquals":
      case "contextResolvedIn":
      case "contextUnresolved":
      case "archetypeIncludes":
        return;
    }
  };
  visit(rule);
  return [...seen];
}

/** Campos de contexto que lee una regla (§43-49): usado por el validador estático anti-oscilación. */
export function collectContextDependencies(rule: RuleV2): ContextFieldRef[] {
  const seen = new Set<ContextFieldRef>();
  const visit = (node: RuleV2): void => {
    switch (node.op) {
      case "contextResolvedEquals":
      case "contextResolvedIn":
      case "contextUnresolved":
        seen.add(node.field);
        return;
      // Lee `archetypeComponents`, derivado de la MISMA resolución que "archetype" (§43-49 sigue
      // aplicando: una pregunta no puede producir una señal que afecte "archetype" y gatear en su
      // pertenencia a la vez).
      case "archetypeIncludes":
        seen.add("archetype");
        return;
      case "and":
      case "or":
        node.rules.forEach(visit);
        return;
      case "not":
        visit(node.rule);
        return;
      case "answered":
      case "eq":
      case "notEq":
      case "in":
      case "multiExcluding":
      case "multiIntersects":
        return;
    }
  };
  visit(rule);
  return [...seen];
}

/** Referencias respuesta+valor(es) citados por una regla (§74 mutación J: uso cruzado de OptionId entre preguntas). */
export type AnswerRefValueCheck = { readonly question: string; readonly values: readonly string[] };

export function collectAnswerRefValueChecks(rule: RuleV2): AnswerRefValueCheck[] {
  const checks: AnswerRefValueCheck[] = [];
  const visit = (node: RuleV2): void => {
    switch (node.op) {
      case "eq":
      case "notEq":
        checks.push({ question: node.ref.question, values: [node.value] });
        return;
      case "in":
      case "multiIntersects":
        checks.push({ question: node.ref.question, values: node.values });
        return;
      case "multiExcluding":
        checks.push({ question: node.ref.question, values: node.exclude });
        return;
      case "and":
      case "or":
        node.rules.forEach(visit);
        return;
      case "not":
        visit(node.rule);
        return;
      case "answered":
      case "contextResolvedEquals":
      case "contextResolvedIn":
      case "contextUnresolved":
      case "archetypeIncludes":
        return;
    }
  };
  visit(rule);
  return checks;
}

// ── Builders (§20, mismo estilo que routing.ts) ─────────────────────────────

export const answeredV2 = (question: string): RuleV2 => ({ op: "answered", ref: { question } });
export const eqV2 = (question: string, value: string): RuleV2 => ({ op: "eq", ref: { question }, value });
export const notEqV2 = (question: string, value: string): RuleV2 => ({ op: "notEq", ref: { question }, value });
export const inV2 = (question: string, values: readonly string[]): RuleV2 => ({ op: "in", ref: { question }, values });
export const multiExcludingV2 = (question: string, exclude: readonly string[]): RuleV2 => ({ op: "multiExcluding", ref: { question }, exclude });
export const multiIntersectsV2 = (question: string, values: readonly string[]): RuleV2 => ({ op: "multiIntersects", ref: { question }, values });
export const contextEquals = (field: ContextFieldRef, value: string): RuleV2 => ({ op: "contextResolvedEquals", field, value });
export const contextIn = (field: ContextFieldRef, values: readonly string[]): RuleV2 => ({ op: "contextResolvedIn", field, values });
export const contextUnresolved = (field: ContextFieldRef): RuleV2 => ({ op: "contextUnresolved", field });
export const andV2 = (...rules: RuleV2[]): RuleV2 => ({ op: "and", rules });
export const orV2 = (...rules: RuleV2[]): RuleV2 => ({ op: "or", rules });
export const notV2 = (rule: RuleV2): RuleV2 => ({ op: "not", rule });
/** Pertenencia a `archetypeComponents` (§ arriba, DIAG-V3-08B.3 Lote B C1) — NUNCA usar `contextEquals("archetype", ...)` para "este negocio opera de esta manera": eso pierde composición híbrida. */
export const archetypeIncludes = (value: OperationalArchetype): RuleV2 => ({ op: "archetypeIncludes", value });
/** Azúcar sintáctico sobre `archetypeIncludes` + `orV2` para preguntas compartidas entre varios archetypes (p. ej. reputación). */
export const archetypeIncludesAny = (values: readonly OperationalArchetype[]): RuleV2 => orV2(...values.map(archetypeIncludes));
