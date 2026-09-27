import { getOption, getQuestion } from "./questions";
import { isDiagnosticSessionId, isQuestionId, type DiagnosticSessionId, type PersistedVersions, type QuestionId } from "./contracts";
import type { AnswerValue, Answers } from "./types";
import { sha256Hex } from "./hashing";

/**
 * Contratos de persistencia (DIAG-V3-06): validación de un payload no confiable contra el registro
 * cerrado de preguntas, y el contrato serializable de snapshot que comparten Browser Store, KV y la
 * capa de sesión de D1. Módulo puro: sin `window`, sin D1, sin KV. El motor no confía nunca en un
 * objeto de respuestas enviado por el cliente (spec §14): esta es la única puerta de entrada.
 */

// ── Validación de respuestas no confiables ──────────────────────────────────

/** Nunca hay más de 26 preguntas reales en el banco; el margen no abre la puerta a payloads arbitrarios. */
export const MAX_ANSWERS_PER_PAYLOAD = 64;
/** Límite razonable del cuerpo HTTP completo (respuestas + metadata de navegación). DIAG-V3-06 §34. */
export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

export type AnswersValidationResult = { ok: true; answers: Answers } | { ok: false; error: string };

/**
 * Valida un objeto de respuestas contra `QUESTION_DEFINITIONS`. Deniega por defecto (spec §6/§14):
 * una clave que no es un `QuestionId` real, un valor que no es una opción real de ESA pregunta, o una
 * forma single/multi equivocada, rechaza el payload completo. No reaplica routing: eso lo hace el
 * motor (`deriveActiveAnswers`/`explainResult`) sobre el resultado ya validado aquí.
 */
export function validateAnswersPayload(candidate: unknown): AnswersValidationResult {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    return { ok: false, error: "answers must be a plain object" };
  }

  const entries = Object.entries(candidate as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS_PER_PAYLOAD) {
    return { ok: false, error: "answers has too many keys" };
  }

  const result: Record<string, AnswerValue> = {};
  for (const [key, value] of entries) {
    if (!isQuestionId(key)) return { ok: false, error: `unknown question id: ${key}` };
    const question = getQuestion(key);
    if (!question) return { ok: false, error: `unknown question id: ${key}` };

    if (question.type === "single") {
      if (typeof value !== "string") return { ok: false, error: `question ${key} expects a single string value` };
      if (!getOption(question, value)) return { ok: false, error: `unknown option for question ${key}: ${value}` };
      result[key] = value;
      continue;
    }

    if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string")) {
      return { ok: false, error: `question ${key} expects a non-empty array of string values` };
    }
    for (const item of value) {
      if (!getOption(question, item)) return { ok: false, error: `unknown option for question ${key}: ${item}` };
    }
    const deduped = [...new Set(value as string[])];
    // Una opción `exclusive` (p. ej. "nada de esto") desmarca a las demás en la UI (`applyAnswer`);
    // el servidor debe rechazar la misma combinación imposible, no persistirla (hallazgo m3 de la
    // revisión independiente).
    if (deduped.length > 1 && deduped.some((item) => getOption(question, item)?.exclusive)) {
      return { ok: false, error: `question ${key} combines an exclusive option with others` };
    }
    result[key] = deduped;
  }

  return { ok: true, answers: result as Answers };
}

// ── Contrato de snapshot compartido (Browser Store / KV / D1) ──────────────

/**
 * Snapshot mínimo y serializable (spec §13). No incluye labels/copy (se reconstruyen desde
 * versiones/IDs) ni resultados (el resultado no se guarda en cada autosave, solo al completar).
 */
export type DiagnosticSessionSnapshot = {
  /** `null` mientras no exista sesión de servidor confirmada (D1 no disponible: modo solo-navegador, spec §38). El sessionId lo emite el servidor; el cliente nunca inventa uno. */
  sessionId: DiagnosticSessionId | null;
  versions: PersistedVersions;
  status: "STARTED" | "IN_PROGRESS";
  startedAt: number;
  lastActivityAt: number;
  revision: number;
  currentQuestionId: QuestionId | null;
  answers: Answers;
  questionsSeen: number;
  questionsAnswered: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Comprobación estructural laxa (no re-valida `answers`; eso lo hace `validateAnswersPayload`). */
export function hasSnapshotShape(value: unknown): value is Omit<DiagnosticSessionSnapshot, "answers"> & { answers: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.sessionId === null || isDiagnosticSessionId(candidate.sessionId)) &&
    typeof candidate.versions === "object" &&
    candidate.versions !== null &&
    (candidate.status === "STARTED" || candidate.status === "IN_PROGRESS") &&
    isFiniteNumber(candidate.startedAt) &&
    isFiniteNumber(candidate.lastActivityAt) &&
    isFiniteNumber(candidate.revision) &&
    (candidate.currentQuestionId === null || isQuestionId(candidate.currentQuestionId)) &&
    isFiniteNumber(candidate.questionsSeen) &&
    isFiniteNumber(candidate.questionsAnswered) &&
    typeof candidate.answers === "object" &&
    candidate.answers !== null
  );
}

// ── Hash de finalización (idempotencia, spec §28) ───────────────────────────

function canonicalAnswersString(answers: Answers): string {
  const record = answers as Record<string, AnswerValue>;
  return Object.keys(record)
    .sort()
    .map((key) => {
      const value = record[key];
      const values = Array.isArray(value) ? [...value].sort() : [value];
      return `${key}=${values.join(",")}`;
    })
    .join("&");
}

/**
 * Payload canónico de finalización: sesión + versiones + respuestas activas, en un orden
 * determinista. Dos finalizaciones con el mismo contenido (mismo conjunto de respuestas activas,
 * el orden de un multi-select no importa) producen el mismo hash aunque lleguen en solicitudes HTTP
 * distintas (retry, refresh) — ese es el mecanismo de idempotencia de `completeDiagnosticSession`.
 */
export function buildCanonicalCompletionPayload(sessionId: string, versions: PersistedVersions, activeAnswers: Answers): string {
  return [
    `session=${sessionId}`,
    `diagnosticVersion=${versions.diagnosticVersion}`,
    `questionBankVersion=${versions.questionBankVersion}`,
    `routingVersion=${versions.routingVersion}`,
    `scoringVersion=${versions.scoringVersion}`,
    `resultSchemaVersion=${versions.resultSchemaVersion}`,
    canonicalAnswersString(activeAnswers),
  ].join("|");
}

export async function computeCompletionHash(canonicalPayload: string): Promise<string> {
  return sha256Hex(canonicalPayload);
}

// ── Hash de "Guardar para después" (idempotencia, DIAG-V3-07 §11) ──────────

/**
 * Payload canónico de un SAVE: a diferencia de la finalización, incluye progreso de navegación
 * (`currentQuestionId`/contadores) porque un retry legítimo de SAVE (mismo contenido exacto) debe
 * distinguirse de un "guardar de nuevo" deliberado tras seguir avanzando — ese es justo el caso en el
 * que SÍ conviene mostrar un recovery code nuevo (spec §36). El prefijo `save|` separa este dominio
 * del de `buildCanonicalCompletionPayload` aunque el contenido coincidiera.
 */
export function buildCanonicalSavePayload(
  sessionId: string,
  versions: PersistedVersions,
  activeAnswers: Answers,
  progress: { currentQuestionId: string | null; questionsSeen: number; questionsAnswered: number },
): string {
  return [
    "save",
    `session=${sessionId}`,
    `diagnosticVersion=${versions.diagnosticVersion}`,
    `questionBankVersion=${versions.questionBankVersion}`,
    `routingVersion=${versions.routingVersion}`,
    `scoringVersion=${versions.scoringVersion}`,
    `resultSchemaVersion=${versions.resultSchemaVersion}`,
    `currentQuestionId=${progress.currentQuestionId ?? ""}`,
    `questionsSeen=${progress.questionsSeen}`,
    `questionsAnswered=${progress.questionsAnswered}`,
    canonicalAnswersString(activeAnswers),
  ].join("|");
}

export async function computeSaveHash(canonicalPayload: string): Promise<string> {
  return sha256Hex(canonicalPayload);
}
