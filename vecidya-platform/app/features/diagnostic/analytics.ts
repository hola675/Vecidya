import { isOneOf, type DiagnosticSessionStatus } from "./contracts";
import type { SectionId } from "./types";

/**
 * Fundamento analítico anónimo del Diagnóstico (DIAG-V3-08). Observa, no controla (spec §2): nada de
 * lo que este módulo define participa en el motor. Cada evento cliente declara la versión con la que
 * fue generado (`ANALYTICS_SCHEMA_VERSION`), distinta de `DiagnosticVersion`/`QuestionBankVersion`/
 * `RoutingVersion`/`ScoringVersion`/`ResultSchemaVersion` (spec §7): describe la FORMA de un evento de
 * telemetría, no la lógica del diagnóstico.
 */

export type AnalyticsSchemaVersion = 1;
export const ANALYTICS_SCHEMA_VERSION: AnalyticsSchemaVersion = 1;

/**
 * Conjunto mínimo (spec §10/§11). `SESSION_STARTED`/`COMPLETED`/`SAVED`/`RECOVERED` NO son eventos
 * cliente (spec §11): esos estados ya existen server-side en `diagnostic_session`/
 * `diagnostic_saved_snapshot`; un evento cliente aquí es solo interacción fina.
 */
export const ANALYTICS_EVENT_TYPES = [
  "QUESTION_SHOWN",
  "ANSWER_SUBMITTED",
  "ANSWER_CHANGED",
  "QUESTION_INVALIDATED",
  "SECTION_ENTERED",
  "SAVE_OFFERED",
  "SAME_BROWSER_RESUMED",
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];
export const isAnalyticsEventType = (value: unknown): value is AnalyticsEventType => isOneOf(ANALYTICS_EVENT_TYPES, value);

/** Distingue respuesta real de "no lo sé"/"no aplica" sin duplicar el valor de la opción (spec §12). */
export const ANSWER_KINDS = ["answered", "unknown", "not_applicable"] as const;
export type AnswerKind = (typeof ANSWER_KINDS)[number];
export const isAnswerKind = (value: unknown): value is AnswerKind => isOneOf(ANSWER_KINDS, value);

/** Mismas 5 secciones que `types.ts#SectionId`; lista propia para no acoplar este módulo a la forma
 * interna de `questions.ts` (`sectionOrder` es un array de objetos de configuración, no de IDs). */
export const ANALYTICS_SECTION_IDS = ["contexto", "presencia", "alcance", "proceso", "medicion"] as const satisfies readonly SectionId[];
export const isAnalyticsSectionId = (value: unknown): value is SectionId => isOneOf(ANALYTICS_SECTION_IDS, value);

/** Spec §19: default de ingeniería, ajustable con datos reales, nunca escondido en SQL. */
export const ANALYTICS_ABANDONMENT_THRESHOLD_MS = 60 * 60 * 1000;

/** Spec §49: retención de eventos, distinta de `COMPLETED_RESULT_RETENTION_DAYS` (180 días también,
 * mismo valor por ahora, pero conceptos distintos que pueden divergir después). */
export const ANALYTICS_EVENT_RETENTION_DAYS = 180;

/** Spec §28/§29: límites pequeños y explícitos, nunca infinitos. */
export const MAX_ANALYTICS_EVENTS_PER_BATCH = 25;
export const MAX_ANALYTICS_EVENTS_PER_SESSION = 500;
export const MAX_ANALYTICS_STRING_LENGTH = 128;

export type AbandonmentCandidate = {
  status: DiagnosticSessionStatus;
  lastActivityAt: number;
  completedAt: number | null;
};

/**
 * Predicado puro de abandono analítico (spec §18/§19/§58): reloj inyectado, nunca `Date.now()`
 * interno, para que las pruebas comprueben el boundary exacto sin esperar 60 minutos reales.
 * Deliberadamente NO clasifica `SAVED`/`COMPLETED`/`EXPIRED` como abandonadas por inactividad: un
 * `SAVED` vivo tiene su propia regla (spec §20, requiere el `expires_at` del snapshot — se resuelve en
 * la capa de consultas, que sí tiene esa fila), y `COMPLETED` nunca lo está (spec §18).
 */
export function isAnalyticallyAbandoned(session: AbandonmentCandidate, nowMs: number, thresholdMs: number = ANALYTICS_ABANDONMENT_THRESHOLD_MS): boolean {
  if (session.status !== "STARTED" && session.status !== "IN_PROGRESS") return false;
  return nowMs - session.lastActivityAt >= thresholdMs;
}
