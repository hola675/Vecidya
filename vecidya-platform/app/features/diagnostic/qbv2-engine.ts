import { resolveDiagnosticContext, type ContextResolutionTrace, type ResolvedDomainContext } from "./context-resolver";
import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { evaluateRuleV2, type AnswersV2 } from "./qbv2-rules";
import { foldSignalProductions, type SignalOrigin, type SignalProduction } from "./qbv2-signals";
import { lookupNicheArchetypeHints } from "./taxonomy";
import { toNicheId, type NicheId } from "./contracts";

/**
 * Motor de convergencia contexto/routing de DIAG-V3-08B.2 (§43-49).
 *
 * Mismo algoritmo, deliberadamente, que `deriveActiveAnswers` de QBV1 (`answers.ts`): empieza
 * OPTIMISTA con TODAS las respuestas crudas activas, y en cada iteración recalcula señales → contexto →
 * elegibilidad completa (regla de respuesta Y de contexto) contra el conjunto ACTUAL, quedándose solo
 * con las que siguen pasando. `next` se construye SIEMPRE iterando sobre las claves de `current`
 * (nunca añade una clave que no estuviera ya ahí), así que el conjunto activo no puede CRECER entre
 * iteraciones dentro de una misma llamada. Esa propiedad, por sí sola —sin depender de ningún otro
 * mecanismo—, ya garantiza que `bank.length + 1` iteraciones bastan siempre para estabilizar: nunca
 * puede oscilar, con o sin auto-referencia (verificado con un banco deliberadamente auto-referencial
 * en los tests, que converge igual). Precisión importante (corregida tras revisión de dominio
 * independiente, que la versión anterior de este comentario describía mal): el validador estático
 * `validateNoSelfReferentialContextGating` (`qbv2-validators.ts`) NO es lo que evita la oscilación —
 * eso ya lo evita esta propiedad de reducción monótona, incondicionalmente. Lo que ese validador evita
 * es otra cosa: una pregunta AUTO-REFERENCIAL queda estructuralmente MUERTA — como el fold de señales
 * de cada iteración incluye su propia respuesta ANTES de evaluar su elegibilidad, su propia
 * contribución resuelve el campo del que depende su gate en la misma pasada en que se evalúa, así que
 * se descarta en la primera iteración y —por la reducción monótona— nunca vuelve, perdiendo la
 * respuesta del usuario para siempre. El validador existe para detectar contenido inútil por diseño,
 * no para prevenir un ciclo que la estructura del algoritmo ya hace imposible.
 *
 * Limitación conocida, documentada (misma revisión): una cadena de dependencias de CONTEXTO de
 * profundidad k (pregunta A gatea en un campo que produce B, que gatea en un campo que produce C...)
 * puede tardar hasta k+1 iteraciones en estabilizar (cada iteración solo "ve" un salto más de la
 * cadena), no 1-2. El límite `bank.length + 1` sigue siendo válido y suficiente, pero deja de ser
 * decorativo a medida que 08B.3/08B.4 introduzcan módulos anidados más profundos — ver el test de
 * cadena de 2 saltos en `qbv2-golden-integration.test.ts`.
 */

export type QuestionBankV2 = readonly QuestionDefinitionV2[];

export class NonConvergentRoutingError extends Error {}

function selectedOptionValues(answer: string | readonly string[]): readonly string[] {
  return Array.isArray(answer) ? (answer as string[]) : [answer as string];
}

function deriveSignalsV2(activeAnswers: AnswersV2, bank: QuestionBankV2): ReturnType<typeof foldSignalProductions> {
  const byId = new Map(bank.map((question) => [question.id, question]));
  const entries: { origin: SignalOrigin; production: SignalProduction }[] = [];
  for (const [questionId, answer] of Object.entries(activeAnswers)) {
    const question = byId.get(questionId);
    if (!question) continue;
    // A confirmation is evidence for a contradiction rule, not an ordinary
    // context producer. The explicit role—not the purpose label alone—keeps
    // its semantic answer active without allowing it to rewrite its gate.
    if (question.contradictionRole?.type === "confirms") continue;
    const selected = new Set(selectedOptionValues(answer));
    for (const option of question.options) {
      if (!selected.has(option.value)) continue;
      for (const production of option.produces ?? []) entries.push({ origin: { questionId, optionId: option.value }, production });
    }
  }
  return foldSignalProductions(entries);
}

function resolveWithNicheHints(activeAnswers: AnswersV2, bank: QuestionBankV2): { context: ResolvedDomainContext; trace: ContextResolutionTrace } {
  const signals = deriveSignalsV2(activeAnswers, bank);
  const declaredNicheId: NicheId | undefined = signals.declaredNicheId ? toNicheId(signals.declaredNicheId.value) : undefined;
  const nicheHints = declaredNicheId ? lookupNicheArchetypeHints(declaredNicheId) : undefined;
  return resolveDiagnosticContext(signals, nicheHints);
}

function isEligible(question: QuestionDefinitionV2, answers: AnswersV2, context: ResolvedDomainContext): boolean {
  const native = question.appliesWhen ? evaluateRuleV2(question.appliesWhen, answers, context) : !question.materialAppliesWhen;
  return native || (question.materialAppliesWhen !== undefined && evaluateRuleV2(question.materialAppliesWhen, answers, context));
}

function sameKeys(a: AnswersV2, b: AnswersV2): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every((key) => key in b);
}

export type ResolveEligibleQuestionsResult = {
  readonly activeAnswers: AnswersV2;
  readonly context: ResolvedDomainContext;
  readonly trace: ContextResolutionTrace;
  readonly eligibleQuestionIds: readonly string[];
  readonly iterations: number;
};

/**
 * Punto de entrada único (§9 de 08B.1, extendido aquí). Puro: mismas `rawAnswers` + mismo `bank`,
 * mismo resultado (determinismo, §31 de 08B.1). NO decide el ORDEN de las elegibles — eso es el
 * Adaptive Planner de DIAG-V3-08B.4 (§24, §42).
 */
export function resolveEligibleQuestionsV2(rawAnswers: AnswersV2, bank: QuestionBankV2): ResolveEligibleQuestionsResult {
  const byId = new Map(bank.map((question) => [question.id, question]));
  let current: AnswersV2 = Object.fromEntries(Object.entries(rawAnswers).filter(([id]) => byId.has(id)));
  const maxIterations = bank.length + 1;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const { context, trace } = resolveWithNicheHints(current, bank);
    const next: Record<string, string | readonly string[]> = {};
    for (const [id, answer] of Object.entries(current)) {
      const question = byId.get(id);
      if (question && isEligible(question, current, context)) next[id] = answer;
    }
    if (sameKeys(current, next)) {
      const eligibleQuestionIds = bank.filter((question) => current[question.id] === undefined && isEligible(question, current, context)).map((question) => question.id);
      return { activeAnswers: current, context, trace, eligibleQuestionIds, iterations: iteration };
    }
    current = next;
  }

  throw new NonConvergentRoutingError(`resolveEligibleQuestionsV2: no convergió en ${maxIterations} iteraciones — revisar dependencias circulares no detectadas por el validador estático`);
}

// ── Bank loader (§34-35) ─────────────────────────────────────────────────────

export type QuestionBankVersionNumber = 1 | 2;

let bankV2: QuestionBankV2 | undefined;

/**
 * Registro interno; `registerQuestionBankV2` lo llama `qbv2-golden.ts` una sola vez al importarse —
 * alcanzable desde CUALQUIER importador del barrel `index.ts`, incluidas rutas ajenas al Diagnóstico
 * (hallazgo de revisión de código independiente, mismo patrón de blast radius que DIAG-V3-08B.0 §21).
 * Hoy es seguro (esta función y los builders de `qbv2-golden.ts` son construcción de datos pura, sin
 * validación ni `throw`) — pero NUNCA añadir aquí una validación que lance: eso reintroduciría en
 * tiempo de importación el mismo riesgo que 08B.0 corrigió migrando sus registros a `Record<T,...>`.
 * Cualquier validación de este banco vive en `qbv2-validators.ts`, invocada explícitamente por tests,
 * nunca al cargar el módulo.
 */
export function registerQuestionBankV2(bank: QuestionBankV2): void {
  bankV2 = bank;
}

/**
 * Loader explícito (§35). QBV1 (`version: 1`) sigue sirviéndose, sin cambios, por sus propios
 * exports (`questions`/`QUESTION_DEFINITIONS` de `questions.ts`) — su forma (`Question` de `types.ts`)
 * es estructuralmente distinta de `QuestionDefinitionV2`, así que unificarlas detrás de un tipo de
 * retorno genérico sería forzado, no una simplificación real. Este loader es el punto de entrada del
 * registro EXPERIMENTAL de QBV2 exclusivamente: `getQuestionBank(1)` devuelve `undefined` a propósito
 * (no es su responsabilidad), `getQuestionBank(2)` existe y es funcional pero ningún camino de ejecución
 * público lo llama todavía. `CURRENT_QUESTION_BANK_VERSION` (`contracts.ts`) sigue en `1`.
 */
export function getQuestionBank(version: QuestionBankVersionNumber): QuestionBankV2 | undefined {
  if (version === 2) return bankV2;
  return undefined;
}
