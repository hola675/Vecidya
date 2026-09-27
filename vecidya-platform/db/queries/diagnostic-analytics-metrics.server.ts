import { and, eq, gt, lt, lte, sql } from "drizzle-orm";

import { ANALYTICS_ABANDONMENT_THRESHOLD_MS } from "../../app/features/diagnostic/analytics";
import type { PersistedVersions } from "../../app/features/diagnostic/contracts";
import type { Database } from "../client.server";
import { diagnosticEvent, diagnosticSavedSnapshot, diagnosticSession } from "../schema";

/**
 * Capa de consultas analíticas (DIAG-V3-08 §41). Server-side únicamente: nada aquí se expone por HTTP
 * (spec §52). Toda consulta relevante acepta `versions` para segmentar (spec §38); un `undefined`
 * consulta sobre TODAS las versiones presentes — solo aceptable mientras exista una única versión real
 * en producción (hoy). `now`/`thresholdMs` son inyectables (spec §51/§58): nunca `Date.now()` interno,
 * para que las pruebas fijen el boundary exacto.
 */
export type VersionFilter = Partial<PersistedVersions>;

function versionWhere(versions: VersionFilter | undefined) {
  const clauses = [];
  if (versions?.diagnosticVersion) clauses.push(eq(diagnosticSession.diagnosticVersion, versions.diagnosticVersion));
  if (versions?.questionBankVersion) clauses.push(eq(diagnosticSession.questionBankVersion, versions.questionBankVersion));
  if (versions?.routingVersion) clauses.push(eq(diagnosticSession.routingVersion, versions.routingVersion));
  if (versions?.scoringVersion) clauses.push(eq(diagnosticSession.scoringVersion, versions.scoringVersion));
  if (versions?.resultSchemaVersion) clauses.push(eq(diagnosticSession.resultSchemaVersion, versions.resultSchemaVersion));
  return clauses;
}

export type LifecycleMetrics = {
  starts: number;
  completions: number;
  completionRate: number;
  activeIncomplete: number;
  analyticallyAbandoned: number;
  expiredSaved: number;
  averageTimeToCompleteMs: number | null;
};

async function lifecycle(database: Database, options: { versions?: VersionFilter; now?: Date; thresholdMs?: number } = {}): Promise<LifecycleMetrics> {
  const now = options.now ?? new Date();
  const thresholdMs = options.thresholdMs ?? ANALYTICS_ABANDONMENT_THRESHOLD_MS;
  const cutoff = new Date(now.getTime() - thresholdMs);
  const extra = versionWhere(options.versions);

  // Boundary must match the canonical pure predicate `isAnalyticallyAbandoned`
  // (`nowMs - lastActivityAt >= thresholdMs`, inclusive — see
  // app/features/diagnostic/analytics.ts and its unit test "boundary is inclusive"). Expressed
  // against `cutoff = now - thresholdMs`: abandoned is `lastActivityAt <= cutoff` (lte), active is
  // `lastActivityAt > cutoff` (gt, strict) — together they partition every STARTED/IN_PROGRESS
  // session with no gap and no overlap at `lastActivityAt === cutoff`.

  const [{ value: starts }] = await database.select({ value: sql<number>`count(*)` }).from(diagnosticSession).where(and(...extra));
  const [{ value: completions }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(eq(diagnosticSession.status, "COMPLETED"), ...extra));
  const [{ value: activeIncomplete }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.status} in ('STARTED','IN_PROGRESS')`, gt(diagnosticSession.lastActivityAt, cutoff), ...extra));
  const [{ value: analyticallyAbandoned }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.status} in ('STARTED','IN_PROGRESS')`, lte(diagnosticSession.lastActivityAt, cutoff), ...extra));
  const [{ value: expiredSaved }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .innerJoin(diagnosticSavedSnapshot, eq(diagnosticSavedSnapshot.sessionId, diagnosticSession.id))
    .where(and(eq(diagnosticSession.status, "SAVED"), lt(diagnosticSavedSnapshot.expiresAt, now), ...extra));
  const [{ value: averageTimeToCompleteMs }] = await database
    .select({ value: sql<number | null>`avg(${diagnosticSession.completedAt} - ${diagnosticSession.startedAt})` })
    .from(diagnosticSession)
    .where(and(eq(diagnosticSession.status, "COMPLETED"), ...extra));

  return {
    starts,
    completions,
    completionRate: starts > 0 ? completions / starts : 0,
    activeIncomplete,
    analyticallyAbandoned,
    expiredSaved,
    averageTimeToCompleteMs: averageTimeToCompleteMs ?? null,
  };
}

export type SaveResumeMetrics = {
  saved: number;
  resumed: number;
  saveRate: number;
  savedResumeRate: number;
};

async function saveResume(database: Database, options: { versions?: VersionFilter } = {}): Promise<SaveResumeMetrics> {
  const extra = versionWhere(options.versions);
  const [{ value: starts }] = await database.select({ value: sql<number>`count(*)` }).from(diagnosticSession).where(and(...extra));
  const [{ value: saved }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.saveCount} > 0`, ...extra));
  const [{ value: resumed }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.resumeCount} > 0`, ...extra));

  return {
    saved,
    resumed,
    saveRate: starts > 0 ? saved / starts : 0,
    // Spec §35: "SAVED SESSIONS THAT LATER RESUME / SAVED SESSIONS" — never "recovery endpoint success
    // rate", a different thing this service deliberately does not compute (invalid attempts aren't
    // stored here at all, spec §36).
    savedResumeRate: saved > 0 ? resumed / saved : 0,
  };
}

export type DropoffRow = { questionId: string; shownAndValid: number; droppedOff: number; dropoffRate: number };

/**
 * Denominador (spec §17): sesiones donde Q fue mostrada Y seguía siendo válida en la ruta (sin
 * `QUESTION_INVALIDATED` posterior al último `QUESTION_SHOWN`). Numerador: ese mismo conjunto, sin
 * `ANSWER_SUBMITTED` posterior, Y la sesión terminó "definitivamente" sin completar — abandonada por
 * inactividad (STARTED/IN_PROGRESS) o con snapshot guardado ya expirado (`expired_saved`). Una sesión
 * SAVED con snapshot vivo, o todavía activa dentro del umbral, NUNCA cuenta como dropoff de Q (spec
 * §17 punto 5, §20): solo cuenta cuando ya está clasificada analíticamente como terminada.
 */
async function dropoffByQuestion(database: Database, options: { now?: Date; thresholdMs?: number } = {}): Promise<DropoffRow[]> {
  const now = options.now ?? new Date();
  const thresholdMs = options.thresholdMs ?? ANALYTICS_ABANDONMENT_THRESHOLD_MS;

  const rows = await database.all<{ question_id: string; shown_and_valid: number; dropped_off: number }>(sql`
    WITH shown AS (
      SELECT session_id, question_id, MAX(received_at) AS last_shown_at
      FROM diagnostic_event WHERE event_type = 'QUESTION_SHOWN' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    invalidated AS (
      SELECT session_id, question_id, MAX(received_at) AS last_invalidated_at
      FROM diagnostic_event WHERE event_type = 'QUESTION_INVALIDATED' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    answered AS (
      SELECT DISTINCT session_id, question_id
      FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    ),
    valid AS (
      SELECT s.session_id, s.question_id
      FROM shown s
      LEFT JOIN invalidated i ON i.session_id = s.session_id AND i.question_id = s.question_id
      WHERE i.last_invalidated_at IS NULL OR i.last_invalidated_at < s.last_shown_at
    )
    SELECT
      v.question_id AS question_id,
      COUNT(*) AS shown_and_valid,
      SUM(CASE
        WHEN a.session_id IS NOT NULL THEN 0
        WHEN ds.status = 'COMPLETED' THEN 0
        WHEN ds.status IN ('STARTED','IN_PROGRESS') AND (${now.getTime()} - ds.last_activity_at) >= ${thresholdMs} THEN 1
        WHEN ds.status = 'SAVED' AND EXISTS (SELECT 1 FROM diagnostic_saved_snapshot sn WHERE sn.session_id = ds.id AND sn.expires_at < ${now.getTime()}) THEN 1
        ELSE 0
      END) AS dropped_off
    FROM valid v
    JOIN diagnostic_session ds ON ds.id = v.session_id
    LEFT JOIN answered a ON a.session_id = v.session_id AND a.question_id = v.question_id
    GROUP BY v.question_id
  `);

  return rows.map((row) => ({
    questionId: row.question_id,
    shownAndValid: row.shown_and_valid,
    droppedOff: row.dropped_off,
    dropoffRate: row.shown_and_valid > 0 ? row.dropped_off / row.shown_and_valid : 0,
  }));
}

export type ChangeRateRow = { questionId: string; sessionsAnswered: number; sessionsChanged: number; sessionChangeRate: number; totalChangeEvents: number };

async function answerChangeRateByQuestion(database: Database): Promise<ChangeRateRow[]> {
  const rows = await database.all<{ question_id: string; sessions_answered: number; sessions_changed: number; total_change_events: number }>(sql`
    WITH answered AS (
      SELECT DISTINCT session_id, question_id FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    ),
    changes AS (
      SELECT session_id, question_id, COUNT(*) AS change_count FROM diagnostic_event WHERE event_type = 'ANSWER_CHANGED' AND question_id IS NOT NULL GROUP BY session_id, question_id
    )
    SELECT
      a.question_id AS question_id,
      COUNT(DISTINCT a.session_id) AS sessions_answered,
      COUNT(DISTINCT c.session_id) AS sessions_changed,
      COALESCE(SUM(c.change_count), 0) AS total_change_events
    FROM answered a
    LEFT JOIN changes c ON c.session_id = a.session_id AND c.question_id = a.question_id
    GROUP BY a.question_id
  `);

  return rows.map((row) => ({
    questionId: row.question_id,
    sessionsAnswered: row.sessions_answered,
    sessionsChanged: row.sessions_changed,
    sessionChangeRate: row.sessions_answered > 0 ? row.sessions_changed / row.sessions_answered : 0,
    totalChangeEvents: row.total_change_events,
  }));
}

export type AnswerKindRateRow = { questionId: string; interactions: number; matching: number; rate: number };

async function rateByAnswerKind(database: Database, kind: "unknown" | "not_applicable"): Promise<AnswerKindRateRow[]> {
  const rows = await database.all<{ question_id: string; interactions: number; matching: number }>(sql`
    SELECT
      question_id,
      COUNT(*) AS interactions,
      SUM(CASE WHEN answer_kind = ${kind} THEN 1 ELSE 0 END) AS matching
    FROM diagnostic_event
    WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    GROUP BY question_id
  `);
  return rows.map((row) => ({ questionId: row.question_id, interactions: row.interactions, matching: row.matching, rate: row.interactions > 0 ? row.matching / row.interactions : 0 }));
}

const unknownRateByQuestion = (database: Database) => rateByAnswerKind(database, "unknown");
const naRateByQuestion = (database: Database) => rateByAnswerKind(database, "not_applicable");

export const diagnosticAnalytics = { lifecycle, saveResume, dropoffByQuestion, answerChangeRateByQuestion, unknownRateByQuestion, naRateByQuestion };
