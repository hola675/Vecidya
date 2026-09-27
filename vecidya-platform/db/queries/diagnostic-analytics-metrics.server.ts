import { and, eq, gt, lt, lte, sql } from "drizzle-orm";

import { ANALYTICS_ABANDONMENT_THRESHOLD_MS } from "../../app/features/diagnostic/analytics";
import type { PersistedVersions } from "../../app/features/diagnostic/contracts";
import type { Database } from "../client.server";
import { diagnosticSavedSnapshot, diagnosticSession } from "../schema";

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

export const diagnosticAnalytics = { lifecycle, saveResume };
