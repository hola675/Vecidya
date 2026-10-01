import type { StorageLike } from "./browser-store";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import { scoreContextualDimensions } from "./qbv2-contextual-scoring";
import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { renderQuestionV2, type RenderedQuestionV2 } from "./qbv2-copy";
import { resolveEligibleQuestionsV2, type QuestionBankV2 } from "./qbv2-engine";
import { buildDiagnosticNarrative, type DiagnosticNarrative } from "./qbv2-narrative";
import { buildDiagnosticOutcome, type DiagnosticOutcome } from "./qbv2-offerings";
import { buildQuestionPlan, ROUTE_HARD_CAP, type QuestionSelectionReason } from "./qbv2-planner";
import { deriveConstraintsAndPriorities } from "./qbv2-priorities";
import type { AnswersV2 } from "./qbv2-rules";
import { deriveSemanticFacts } from "./qbv2-semantic-facts";
import { resolveTerminologyProfile } from "./qbv2-terminology";

/**
 * DIAG-V3-10B — sesión del diagnóstico adaptativo. Capa pura (sin React ni almacenamiento global) entre la UI
 * y el motor congelado: no contiene reglas de ruteo, scoring ni prioridades. Cada decisión sale del planner
 * (`buildQuestionPlan`), del resolver de elegibilidad (`resolveEligibleQuestionsV2`) y del render de copy.
 *
 * Contrato de avance: el planner devuelve un lote (`selectedQuestionIds`) que el contrato congelado considera
 * comprometido hasta responderse («`completion.ready` describe el plan INCLUIDAS sus selecciones pendientes»).
 * La UI muestra ese lote de una pregunta a la vez y, tras CADA respuesta, vuelve a evaluar la elegibilidad: una
 * pregunta pendiente que deja de aplicar se descarta. Cuando el lote se vacía, se vuelve a planificar; si el
 * planner ya no selecciona nada, la ruta terminó. Re-planificar el lote completo tras cada respuesta cambiaría
 * la ruta en el 44 % de las rutas calibradas; esta estrategia reproduce el pipeline congelado (golden y 4.860
 * rutas generadas con resultado idéntico).
 */

export const DIAGNOSTIC_SESSION_V3_SCHEMA = 1 as const;
/** Una sesión sin actividad durante este tiempo no se ofrece para continuar. */
export const DIAGNOSTIC_SESSION_V3_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const DIAGNOSTIC_SESSION_V3_STORAGE_KEY = "vecidya.diagnostic.v3.session.1";

export const SESSION_STATUSES_V3 = ["not_started", "in_progress", "completing", "completed", "error"] as const;
export type SessionStatusV3 = (typeof SESSION_STATUSES_V3)[number];

export type QueuedQuestionV3 = {
  readonly questionId: string;
  /** Fase del planner: ruta base o cola de evidencia material (preguntas 19–24). */
  readonly phase: "base" | "material";
  readonly reason: QuestionSelectionReason;
};

/** Traza interna de la ruta (pruebas y modo de desarrollo). Nunca se muestra a usuarios. */
export type RouteTraceEntryV3 =
  | { readonly type: "planned"; readonly questionIds: readonly string[]; readonly routeLength: number }
  | { readonly type: "answered"; readonly questionId: string; readonly phase: QueuedQuestionV3["phase"]; readonly reason: QuestionSelectionReason }
  | { readonly type: "edited"; readonly questionId: string }
  | { readonly type: "dropped"; readonly questionIds: readonly string[] }
  | { readonly type: "invalidated"; readonly questionIds: readonly string[] }
  | { readonly type: "completed"; readonly answered: number };

export type DiagnosticSessionV3 = {
  readonly schemaVersion: typeof DIAGNOSTIC_SESSION_V3_SCHEMA;
  readonly sessionId: string;
  readonly startedAt: number;
  readonly updatedAt: number;
  /** Fuente de verdad: solo respuestas activas, con valores canónicos, en el orden en que se respondieron. */
  readonly answers: AnswersV2;
  /** Preguntas respondidas en esta sesión, en orden (las semillas de contexto conocidas no se cuentan). */
  readonly answeredQuestionIds: readonly string[];
  /** Lote pendiente del planner. */
  readonly queue: readonly QueuedQuestionV3[];
  /** Índice en `answeredQuestionIds` cuando la persona volvió a una respuesta anterior; `null` en la pregunta actual. */
  readonly reviewIndex: number | null;
  readonly routeTrace: readonly RouteTraceEntryV3[];
  readonly status: SessionStatusV3;
};

type Options = { readonly bank?: QuestionBankV2 };
const bankOf = (options?: Options) => options?.bank ?? QUESTION_BANK_V2;
const questionOf = (bank: QuestionBankV2, questionId: string) => bank.find((question) => question.id === questionId);

// ── Validación de respuestas ────────────────────────────────────────────────

export type AnswerValueV3 = string | readonly string[];
export type AnswerValidationErrorV3 = "required" | "invalid_type" | "invalid_option" | "duplicate_option" | "exclusive_conflict";
export type AnswerValidationV3 = { readonly ok: true; readonly value: AnswerValueV3 } | { readonly ok: false; readonly error: AnswerValidationErrorV3 };

/** Valida un valor contra el contrato canónico de la pregunta (opciones, tipo y exclusividad). */
export function validateAnswerV3(question: QuestionDefinitionV2, value: unknown): AnswerValidationV3 {
  const values = new Set(question.options.map((option) => option.value));
  if (question.type === "single") {
    if (value === undefined || value === null || value === "") return { ok: false, error: "required" };
    if (typeof value !== "string") return { ok: false, error: "invalid_type" };
    return values.has(value) ? { ok: true, value } : { ok: false, error: "invalid_option" };
  }
  if (!Array.isArray(value)) return { ok: false, error: value === undefined || value === null ? "required" : "invalid_type" };
  if (value.length === 0) return { ok: false, error: "required" };
  if (!value.every((item) => typeof item === "string")) return { ok: false, error: "invalid_type" };
  if (!value.every((item) => values.has(item))) return { ok: false, error: "invalid_option" };
  if (new Set(value).size !== value.length) return { ok: false, error: "duplicate_option" };
  const exclusive = question.options.filter((option) => option.exclusive).map((option) => option.value);
  if (value.length > 1 && value.some((item) => exclusive.includes(item))) return { ok: false, error: "exclusive_conflict" };
  // Orden canónico: el valor guardado no depende del orden en que se marcaron las casillas.
  return { ok: true, value: question.options.map((option) => option.value).filter((option) => value.includes(option)) };
}

/**
 * Marca o desmarca una opción de una pregunta múltiple respetando la exclusividad del contrato: una opción
 * exclusiva («No sé», «Estable») deja solo esa; cualquier otra opción quita las exclusivas.
 */
export function toggleMultiValueV3(question: QuestionDefinitionV2, current: readonly string[], value: string): readonly string[] {
  const option = question.options.find((item) => item.value === value);
  if (!option) return current;
  if (current.includes(value)) return current.filter((item) => item !== value);
  if (option.exclusive) return [value];
  const exclusive = new Set(question.options.filter((item) => item.exclusive).map((item) => item.value));
  const next = [...current.filter((item) => !exclusive.has(item)), value];
  return question.options.map((item) => item.value).filter((item) => next.includes(item));
}

// ── Avance de la ruta ───────────────────────────────────────────────────────

const touch = (session: DiagnosticSessionV3, now: number, patch: Partial<DiagnosticSessionV3>): DiagnosticSessionV3 => ({ ...session, ...patch, updatedAt: now });

/** Respuestas activas en el orden actual; las inactivas se descartan (nunca se reactivan solas). */
function reconcile(answers: AnswersV2, bank: QuestionBankV2): { readonly answers: AnswersV2; readonly removed: readonly string[] } {
  const active = resolveEligibleQuestionsV2(answers, bank).activeAnswers;
  const removed = Object.keys(answers).filter((questionId) => active[questionId] === undefined);
  if (removed.length === 0) return { answers, removed };
  return { answers: Object.fromEntries(Object.entries(answers).filter(([questionId]) => active[questionId] !== undefined)), removed };
}

/** Vacía del lote las preguntas que dejaron de ser elegibles y, si el lote quedó vacío, pide al planner el siguiente. */
function advance(session: DiagnosticSessionV3, bank: QuestionBankV2): DiagnosticSessionV3 {
  const trace = [...session.routeTrace];
  let queue = session.queue;
  if (queue.length > 0) {
    const eligible = new Set(resolveEligibleQuestionsV2(session.answers, bank).eligibleQuestionIds);
    const dropped = queue.filter((item) => !eligible.has(item.questionId)).map((item) => item.questionId);
    if (dropped.length > 0) trace.push({ type: "dropped", questionIds: dropped });
    queue = queue.filter((item) => eligible.has(item.questionId));
  }
  if (queue.length === 0) {
    const plan = buildQuestionPlan({ answers: session.answers, bank });
    const byId = new Map(plan.trace.map((entry) => [entry.questionId, entry]));
    queue = plan.selectedQuestionIds.map((questionId) => ({ questionId, phase: byId.get(questionId)?.selectedIn ?? "base", reason: byId.get(questionId)!.reason }));
    if (queue.length > 0) trace.push({ type: "planned", questionIds: plan.selectedQuestionIds, routeLength: plan.routeLength });
  }
  const status: SessionStatusV3 = queue.length === 0 ? "completing" : "in_progress";
  return { ...session, queue, routeTrace: trace, status };
}

export function createSessionV3(input: { readonly sessionId: string; readonly now: number; readonly seedAnswers?: AnswersV2 }, options?: Options): DiagnosticSessionV3 {
  const bank = bankOf(options);
  const answers = reconcile(input.seedAnswers ?? {}, bank).answers;
  return advance({
    schemaVersion: DIAGNOSTIC_SESSION_V3_SCHEMA, sessionId: input.sessionId, startedAt: input.now, updatedAt: input.now,
    answers, answeredQuestionIds: [], queue: [], reviewIndex: null, routeTrace: [], status: "in_progress",
  }, bank);
}

/** La pregunta en pantalla: la que se está revisando o la siguiente del lote. */
export function currentQuestionIdV3(session: DiagnosticSessionV3): string | null {
  if (session.reviewIndex !== null) return session.answeredQuestionIds[session.reviewIndex] ?? null;
  return session.queue[0]?.questionId ?? null;
}

export type SubmitResultV3 = { readonly ok: true; readonly session: DiagnosticSessionV3 } | { readonly ok: false; readonly error: AnswerValidationErrorV3 | "not_current_question" };

const sameValue = (a: AnswerValueV3 | undefined, b: AnswerValueV3) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Confirma la respuesta de la pregunta en pantalla. Un valor inválido nunca entra en `AnswersV2`. Al cambiar una
 * respuesta anterior se reconcilia la ruta: se conservan las respuestas que siguen siendo válidas, se descartan
 * las que dejaron de aplicar y el planner decide desde ahí; nada se reactiva sin volver a preguntarse.
 */
export function submitAnswerV3(session: DiagnosticSessionV3, questionId: string, rawValue: unknown, now: number, options?: Options): SubmitResultV3 {
  const bank = bankOf(options);
  if (currentQuestionIdV3(session) !== questionId) return { ok: false, error: "not_current_question" };
  const question = questionOf(bank, questionId)!;
  const validation = validateAnswerV3(question, rawValue);
  if (!validation.ok) return validation;
  const value = validation.value;

  if (session.reviewIndex !== null) {
    if (sameValue(session.answers[questionId], value)) {
      const next = session.reviewIndex + 1;
      return { ok: true, session: touch(session, now, { reviewIndex: next < session.answeredQuestionIds.length ? next : null }) };
    }
    const changed = { ...session.answers, [questionId]: value };
    const { answers, removed } = reconcile(changed, bank);
    const trace: RouteTraceEntryV3[] = [...session.routeTrace, { type: "edited", questionId }, ...(removed.length > 0 ? [{ type: "invalidated" as const, questionIds: removed }] : [])];
    // El lote anterior se planificó con la respuesta vieja: se descarta y el planner decide de nuevo.
    return { ok: true, session: advance(touch(session, now, { answers, answeredQuestionIds: session.answeredQuestionIds.filter((id) => !removed.includes(id)), queue: [], reviewIndex: null, routeTrace: trace }), bank) };
  }

  const { answers, removed } = reconcile({ ...session.answers, [questionId]: value }, bank);
  const queued = session.queue[0]!;
  const trace: RouteTraceEntryV3[] = [...session.routeTrace, { type: "answered", questionId, phase: queued.phase, reason: queued.reason }, ...(removed.length > 0 ? [{ type: "invalidated" as const, questionIds: removed }] : [])];
  return {
    ok: true,
    session: advance(touch(session, now, {
      answers, answeredQuestionIds: [...session.answeredQuestionIds.filter((id) => !removed.includes(id)), questionId].filter((id) => answers[id] !== undefined),
      queue: session.queue.slice(1), routeTrace: trace,
    }), bank),
  };
}

/** Volver a la respuesta anterior (sin tocar el historial del navegador). */
export function goBackV3(session: DiagnosticSessionV3, now: number): DiagnosticSessionV3 {
  if (session.answeredQuestionIds.length === 0) return session;
  const reviewIndex = session.reviewIndex === null ? session.answeredQuestionIds.length - 1 : Math.max(0, session.reviewIndex - 1);
  return touch(session, now, { reviewIndex, status: session.status === "completing" ? "in_progress" : session.status });
}

export const canGoBackV3 = (session: DiagnosticSessionV3) => session.answeredQuestionIds.length > 0 && session.reviewIndex !== 0;

// ── Presentación de la pregunta ─────────────────────────────────────────────

export type PresentedQuestionV3 = {
  readonly question: RenderedQuestionV2;
  /** Respuesta ya guardada (al revisar una pregunta anterior). */
  readonly savedValue: AnswerValueV3 | undefined;
  /** Antes del lanzamiento, una pregunta diagnóstica habla de preparación y no de operación actual. */
  readonly aboutPreparation: boolean;
  /** Pregunta de contexto (tipo de negocio, etapa, meta, freno): define la ruta. */
  readonly foundational: boolean;
};

const FOUNDATION_PURPOSES = new Set(["anchor", "classification", "maturity", "goal", "friction"]);
/** Pregunta de contexto: propósito fundacional y no diagnóstico (las diagnósticas también llevan `friction`, `goal`…). */
const isFoundational = (question: QuestionDefinitionV2) => !question.purpose.includes("diagnostic") && question.purpose.some((purpose) => FOUNDATION_PURPOSES.has(purpose));

/** Copy de la pregunta en pantalla, siempre a través del render congelado (términos por perfil). */
export function presentQuestionV3(session: DiagnosticSessionV3, options?: Options): PresentedQuestionV3 | null {
  const bank = bankOf(options);
  const questionId = currentQuestionIdV3(session);
  const question = questionId ? questionOf(bank, questionId) : undefined;
  if (!question) return null;
  const { context } = resolveEligibleQuestionsV2(session.answers, bank);
  const rendered = renderQuestionV2(question, { context, answers: session.answers });
  const foundational = isFoundational(question);
  return { question: rendered, savedValue: session.answers[question.id], aboutPreparation: rendered.profile === "prelaunch" && !foundational, foundational };
}

// ── Progreso ───────────────────────────────────────────────────────────────

/** Etapas visibles; no hay denominador fijo porque la ruta es adaptativa. */
export const PROGRESS_STAGES_V3 = ["context", "deepening", "final_checks", "preparing"] as const;
export type ProgressStageV3 = (typeof PROGRESS_STAGES_V3)[number];
export type ProgressV3 = { readonly stage: ProgressStageV3; readonly stageIndex: number; readonly answered: number };

/** Etapa de una pregunta de la ruta: contexto, profundización o comprobación final (cola material o confirmación). */
function stageOf(question: QuestionDefinitionV2 | undefined, phase: QueuedQuestionV3["phase"], reason: QuestionSelectionReason): number {
  if (phase === "material" || reason === "confirmation") return 2;
  return question && isFoundational(question) ? 0 : 1;
}

/**
 * Progreso monótono: la etapa visible es la más avanzada entre las respuestas vigentes y la pregunta actual, así
 * que una pregunta de contexto que llega tarde (p. ej. la regularidad) no hace «retroceder» la barra.
 */
export function progressV3(session: DiagnosticSessionV3, options?: Options): ProgressV3 {
  const bank = bankOf(options);
  const answered = session.answeredQuestionIds.length;
  const at = (stageIndex: number): ProgressV3 => ({ stage: PROGRESS_STAGES_V3[stageIndex]!, stageIndex, answered });
  if (session.status === "completing" || session.status === "completed") return at(3);
  const current = new Set(session.answeredQuestionIds);
  const reached = session.routeTrace.flatMap((entry) => (entry.type === "answered" && current.has(entry.questionId) ? [stageOf(questionOf(bank, entry.questionId), entry.phase, entry.reason)] : []));
  const queued = session.reviewIndex === null ? session.queue[0] : undefined;
  const now = queued ? stageOf(questionOf(bank, queued.questionId), queued.phase, queued.reason) : 0;
  return at(Math.max(now, ...reached));
}

// ── Cierre: pipeline V3 congelado ───────────────────────────────────────────

export type DiagnosticResultV3 = { readonly narrative: DiagnosticNarrative; readonly outcome: DiagnosticOutcome };

/**
 * Pipeline canónico, en orden: respuestas → evidencia y scoring → restricciones y prioridades → Semantic Facts →
 * narrativa → estado general, recomendaciones, soluciones y ofertas. Solo compone funciones congeladas.
 */
export function runDiagnosticPipelineV3(answers: AnswersV2): DiagnosticResultV3 {
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  const narrative = buildDiagnosticNarrative({ answers, scoring, priorities, semanticFacts });
  return { narrative, outcome: buildDiagnosticOutcome({ scoring, priorities, semanticFacts, narrative }) };
}

export type CompletionV3 = { readonly ok: true; readonly session: DiagnosticSessionV3; readonly result: DiagnosticResultV3 } | { readonly ok: false; readonly session: DiagnosticSessionV3 };

/** Ejecuta el pipeline; si falla, conserva las respuestas y deja la sesión en `error` para reintentar. */
export function completeSessionV3(session: DiagnosticSessionV3, now: number, pipeline: (answers: AnswersV2) => DiagnosticResultV3 = runDiagnosticPipelineV3): CompletionV3 {
  if (session.queue.length > 0 || session.reviewIndex !== null) return { ok: false, session };
  try {
    const result = pipeline(session.answers);
    const done = session.status === "completed" ? session.routeTrace : [...session.routeTrace, { type: "completed" as const, answered: Object.keys(session.answers).length }];
    return { ok: true, session: touch(session, now, { status: "completed", routeTrace: done }), result };
  } catch {
    return { ok: false, session: touch(session, now, { status: "error" }) };
  }
}

/** Contexto de lenguaje de la sesión (para la cabecera de pre-lanzamiento y la depuración). */
export function sessionProfileV3(session: DiagnosticSessionV3, options?: Options) {
  const { context } = resolveEligibleQuestionsV2(session.answers, bankOf(options));
  return resolveTerminologyProfile(context, session.answers);
}

// ── Persistencia local temporal ─────────────────────────────────────────────

export function serializeSessionV3(session: DiagnosticSessionV3): string {
  return JSON.stringify(session);
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Restaura una sesión guardada. Devuelve `null` (y la UI empieza de cero) si el JSON está corrupto, si la forma o
 * el esquema no coinciden, si caducó o si alguna respuesta no cumple el contrato vigente de su pregunta. Al
 * restaurar se vuelve a reconciliar con el motor, así que una sesión nunca queda con preguntas que ya no aplican.
 */
export function parseSessionV3(raw: string | null, now: number, options?: Options): DiagnosticSessionV3 | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!isRecord(parsed) || parsed.schemaVersion !== DIAGNOSTIC_SESSION_V3_SCHEMA) return null;
  const { sessionId, startedAt, updatedAt, answers, answeredQuestionIds, queue, reviewIndex, routeTrace, status } = parsed;
  if (typeof sessionId !== "string" || typeof startedAt !== "number" || typeof updatedAt !== "number" || !isRecord(answers) || !Array.isArray(answeredQuestionIds) || !Array.isArray(queue) || !Array.isArray(routeTrace)) return null;
  if (!(reviewIndex === null || (typeof reviewIndex === "number" && Number.isInteger(reviewIndex) && reviewIndex >= 0 && reviewIndex < answeredQuestionIds.length))) return null;
  if (typeof status !== "string" || !(SESSION_STATUSES_V3 as readonly string[]).includes(status) || status === "not_started") return null;
  if (now - updatedAt > DIAGNOSTIC_SESSION_V3_TTL_MS || updatedAt > now + 60_000) return null;
  const bank = bankOf(options);
  if (Object.keys(answers).length > ROUTE_HARD_CAP + 8) return null;
  for (const [questionId, value] of Object.entries(answers)) {
    const question = questionOf(bank, questionId);
    if (!question || !validateAnswerV3(question, value).ok) return null;
  }
  if (!answeredQuestionIds.every((id) => typeof id === "string" && answers[id] !== undefined)) return null;
  if (!queue.every((item) => isRecord(item) && typeof item.questionId === "string" && questionOf(bank, item.questionId) !== undefined && answers[item.questionId] === undefined && (item.phase === "base" || item.phase === "material") && typeof item.reason === "string")) return null;
  const restored = { ...(parsed as unknown as DiagnosticSessionV3), status: status === "error" ? "completing" as const : status as SessionStatusV3 };
  const { answers: active, removed } = reconcile(restored.answers, bank);
  const reconciled = { ...restored, answers: active, answeredQuestionIds: restored.answeredQuestionIds.filter((id) => !removed.includes(id)) };
  if (reconciled.status === "completed" && removed.length === 0) return reconciled;
  return advance({ ...reconciled, reviewIndex: removed.length > 0 ? null : reconciled.reviewIndex }, bank);
}

/** Acceso al almacenamiento del navegador; ningún componente llama a `localStorage` directamente. */
export class DiagnosticSessionStoreV3 {
  readonly #storage: StorageLike | null;
  constructor(storage?: StorageLike | null) {
    this.#storage = storage === undefined ? (typeof window === "undefined" ? null : (() => { try { return window.localStorage; } catch { return null; } })()) : storage;
  }
  read(now: number, options?: Options): DiagnosticSessionV3 | null {
    if (!this.#storage) return null;
    try {
      const session = parseSessionV3(this.#storage.getItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY), now, options);
      if (!session) this.clear();
      return session;
    } catch {
      return null;
    }
  }
  write(session: DiagnosticSessionV3): void {
    try { this.#storage?.setItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY, serializeSessionV3(session)); } catch { /* almacenamiento lleno o bloqueado: la sesión sigue en memoria */ }
  }
  clear(): void {
    try { this.#storage?.removeItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY); } catch { /* sin almacenamiento */ }
  }
}
