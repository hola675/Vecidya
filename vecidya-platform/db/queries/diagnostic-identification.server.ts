import { and, desc, eq, gt, isNull, lte, lt, sql } from "drizzle-orm";

import { createDatabase } from "../client.server";
import { withBestEffortFunnelAnalytics } from "./diagnostic-funnel-transaction.server";
import { FUNNEL_ANALYTICS_CONTRACT_VERSION, FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, utcAnalyticsDay } from "../../app/features/diagnostic/funnel-analytics-contract";
import {
  commercialContactIntent,
  diagnosticReportAccess,
  diagnosticReportSnapshot,
  diagnosticFunnelAggregate,
  diagnosticResearchIntent,
  identifiedDiagnosticRequest,
  verifiedEmailChallenge,
} from "../schema";

type ChallengePurpose = NonNullable<typeof verifiedEmailChallenge.$inferInsert["purpose"]>;

export type ReportRequestBundle = {
  readonly request: typeof identifiedDiagnosticRequest.$inferInsert;
  readonly snapshot: typeof diagnosticReportSnapshot.$inferInsert;
  readonly challenge: typeof verifiedEmailChallenge.$inferInsert;
  readonly commercialIntent?: typeof commercialContactIntent.$inferInsert;
  readonly researchIntent?: typeof diagnosticResearchIntent.$inferInsert;
};

export async function createReportRequestBundle(binding: D1Database, bundle: ReportRequestBundle): Promise<void> {
  const database = createDatabase(binding);
  const statements = [
    database.insert(identifiedDiagnosticRequest).values(bundle.request),
    database.insert(diagnosticReportSnapshot).values(bundle.snapshot),
    database.insert(verifiedEmailChallenge).values(bundle.challenge),
    ...(bundle.commercialIntent ? [database.insert(commercialContactIntent).values(bundle.commercialIntent)] : []),
    ...(bundle.researchIntent ? [database.insert(diagnosticResearchIntent).values(bundle.researchIntent)] : []),
  ];
  const aggregateIncrement = database.insert(diagnosticFunnelAggregate).values({
    eventDay: utcAnalyticsDay(bundle.request.createdAt),
    diagnosticVersion: FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION,
    contractVersion: FUNNEL_ANALYTICS_CONTRACT_VERSION,
    eventType: "identified_request_created",
    eventCount: 1,
  }).onConflictDoUpdate({
    target: [diagnosticFunnelAggregate.eventDay, diagnosticFunnelAggregate.diagnosticVersion, diagnosticFunnelAggregate.contractVersion, diagnosticFunnelAggregate.eventType],
    set: { eventCount: sql`${diagnosticFunnelAggregate.eventCount} + 1` },
  });

  const statementsWithAnalytics = [...statements, aggregateIncrement];
  await withBestEffortFunnelAnalytics(
    async () => { await database.batch(statementsWithAnalytics as [typeof statementsWithAnalytics[number], ...typeof statementsWithAnalytics[number][]]); },
    async () => { await database.batch(statements as [typeof statements[number], ...typeof statements[number][]]); },
  );
}

export async function findReportRequestById(binding: D1Database, requestId: string) {
  const database = createDatabase(binding);
  const [request] = await database.select().from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.id, requestId)).limit(1);
  return request ?? null;
}

export async function findReportSnapshotExpiry(binding: D1Database, requestId: string) {
  const database = createDatabase(binding);
  const [snapshot] = await database.select({ expiresAt: diagnosticReportSnapshot.expiresAt })
    .from(diagnosticReportSnapshot).where(eq(diagnosticReportSnapshot.requestId, requestId)).limit(1);
  return snapshot?.expiresAt ?? null;
}

export async function findReportRequestByIdempotencyHash(binding: D1Database, keyHash: string) {
  const database = createDatabase(binding);
  const [request] = await database.select({ id: identifiedDiagnosticRequest.id, status: identifiedDiagnosticRequest.status, expiresAt: identifiedDiagnosticRequest.expiresAt, requestFingerprintHash: identifiedDiagnosticRequest.requestFingerprintHash })
    .from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.idempotencyKeyHash, keyHash)).limit(1);
  return request ?? null;
}

export async function findRequestWithPendingChallenge(binding: D1Database, requestId: string, now: Date) {
  const database = createDatabase(binding);
  const [request] = await database.select().from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.id, requestId)).limit(1);
  const purpose: ChallengePurpose | null = request?.status === "verification_pending"
    ? "verification"
    : request?.status === "verified" ? "access_recovery" : null;
  if (!request || !purpose || request.expiresAt.getTime() <= now.getTime()) return null;
  const [snapshot] = await database.select().from(diagnosticReportSnapshot).where(eq(diagnosticReportSnapshot.requestId, requestId)).limit(1);
  if (!snapshot || snapshot.expiresAt.getTime() <= now.getTime()) return null;
  const [challenge] = await database.select().from(verifiedEmailChallenge)
    .where(and(eq(verifiedEmailChallenge.requestId, requestId), eq(verifiedEmailChallenge.purpose, purpose), eq(verifiedEmailChallenge.status, "pending"), gt(verifiedEmailChallenge.expiresAt, now)))
    .orderBy(desc(verifiedEmailChallenge.issuedAt))
    .limit(1);
  return challenge ? { request, snapshot, challenge } : null;
}

export async function findChallengeByTokenDigest(binding: D1Database, requestId: string, tokenDigest: string) {
  const database = createDatabase(binding);
  const [challenge] = await database.select({ id: verifiedEmailChallenge.id, purpose: verifiedEmailChallenge.purpose, status: verifiedEmailChallenge.status })
    .from(verifiedEmailChallenge)
    .where(and(eq(verifiedEmailChallenge.requestId, requestId), eq(verifiedEmailChallenge.tokenDigest, tokenDigest)))
    .limit(1);
  return challenge ?? null;
}

export async function replacePendingChallenge(binding: D1Database, requestId: string, challenge: typeof verifiedEmailChallenge.$inferInsert): Promise<boolean> {
  const issuedAt = challenge.issuedAt.getTime();
  const expiresAt = challenge.expiresAt.getTime();
  const purpose: ChallengePurpose = challenge.purpose ?? "verification";
  const requestStatus = purpose === "verification" ? "verification_pending" : "verified";
  if (expiresAt <= issuedAt || challenge.requestId !== requestId || challenge.status !== "pending" || challenge.attempts !== 0 || challenge.consumedAt !== null) return false;
  const results = await binding.batch([
    binding.prepare(`UPDATE verified_email_challenge
      SET status = 'superseded'
      WHERE request_id = ? AND status = 'pending' AND (purpose = ? OR ? = 'access_recovery')
        AND EXISTS (
          SELECT 1 FROM identified_diagnostic_request r
          WHERE r.id = ? AND r.status = ? AND r.expires_at > ?
            AND EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = r.id AND s.expires_at > ?)
        )`).bind(requestId, purpose, purpose, requestId, requestStatus, issuedAt, issuedAt),
    binding.prepare(`INSERT INTO verified_email_challenge
      (id, request_id, token_digest, purpose, status, attempts, issued_at, expires_at, consumed_at, created_at)
      SELECT ?, r.id, ?, ?, 'pending', 0, ?, ?, NULL, ?
      FROM identified_diagnostic_request r
      WHERE r.id = ? AND r.status = ? AND r.expires_at > ? AND ? > ?
        AND EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = r.id AND s.expires_at > ?)`)
      .bind(challenge.id, challenge.tokenDigest, purpose, issuedAt, expiresAt, challenge.createdAt.getTime(), requestId, requestStatus, issuedAt, expiresAt, issuedAt, issuedAt),
  ]);
  return results[1]?.meta?.changes === 1;
}

export async function incrementChallengeAttempt(binding: D1Database, challengeId: string, now: Date): Promise<void> {
  const database = createDatabase(binding);
  await database.update(verifiedEmailChallenge).set({
    attempts: sql`${verifiedEmailChallenge.attempts} + 1`,
    status: sql`case when ${verifiedEmailChallenge.attempts} + 1 >= 5 then 'locked' else 'pending' end`,
  }).where(and(eq(verifiedEmailChallenge.id, challengeId), eq(verifiedEmailChallenge.status, "pending"), lt(verifiedEmailChallenge.attempts, 5), gt(verifiedEmailChallenge.expiresAt, now)));
}

export async function consumeChallengeAndGrantAccess(binding: D1Database, input: {
  readonly requestId: string;
  readonly challengeId: string;
  readonly tokenDigest: string;
  readonly purpose: ChallengePurpose;
  readonly access: typeof diagnosticReportAccess.$inferInsert;
  readonly now: Date;
  readonly recordFunnelAnalytics?: boolean;
}): Promise<boolean> {
  const timestamp = input.now.getTime();
  const expectedRequestStatus = input.purpose === "verification" ? "verification_pending" : "verified";
  const accessExpiresAt = input.access.expiresAt.getTime();
  if (input.access.requestId !== input.requestId || input.access.challengeId !== input.challengeId || input.access.issuedAt.getTime() !== timestamp || accessExpiresAt <= timestamp) return false;

  const buildStatements = (includeAnalytics: boolean): [D1PreparedStatement, ...D1PreparedStatement[]] => {
    const challengeConsume = binding.prepare(`UPDATE verified_email_challenge
      SET status = 'consumed', consumed_at = ?
      WHERE id = ? AND request_id = ? AND token_digest = ? AND purpose = ? AND status = 'pending' AND expires_at > ? AND attempts < 5
        AND EXISTS (
          SELECT 1 FROM identified_diagnostic_request r
          INNER JOIN diagnostic_report_snapshot s ON s.request_id = r.id
          WHERE r.id = ? AND r.status = ? AND r.expires_at > ? AND s.expires_at > ?
            AND r.expires_at >= ? AND s.expires_at >= ?
        )`)
      .bind(timestamp, input.challengeId, input.requestId, input.tokenDigest, input.purpose, timestamp, input.requestId, expectedRequestStatus, timestamp, timestamp, accessExpiresAt, accessExpiresAt);
    const requestTransition = input.purpose === "verification"
      ? binding.prepare(`UPDATE identified_diagnostic_request SET status = 'verified', updated_at = ?
          WHERE id = ? AND status = 'verification_pending' AND expires_at > ?
            AND EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.id = ? AND c.request_id = ? AND c.purpose = 'verification' AND c.status = 'consumed' AND c.consumed_at = ?)
            AND EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = identified_diagnostic_request.id AND s.expires_at > ?)`)
        .bind(timestamp, input.requestId, timestamp, input.challengeId, input.requestId, timestamp, timestamp)
      : binding.prepare(`UPDATE identified_diagnostic_request SET updated_at = ?
          WHERE id = ? AND status = 'verified' AND expires_at > ?
            AND EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.id = ? AND c.request_id = ? AND c.purpose = 'access_recovery' AND c.status = 'consumed' AND c.consumed_at = ?)
            AND EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = identified_diagnostic_request.id AND s.expires_at > ?)`)
        .bind(timestamp, input.requestId, timestamp, input.challengeId, input.requestId, timestamp, timestamp);
    const emailVerifiedIncrement = input.purpose === "verification" && includeAnalytics && input.recordFunnelAnalytics !== false
      ? [binding.prepare(`INSERT INTO diagnostic_funnel_aggregate (event_day, diagnostic_version, contract_version, event_type, event_count)
          SELECT ?, ?, ?, 'email_verified', 1 WHERE changes() = 1
          ON CONFLICT(event_day, diagnostic_version, contract_version, event_type)
          DO UPDATE SET event_count = event_count + 1`)
        .bind(utcAnalyticsDay(input.now), FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION)]
      : [];
    const revokePreviousAccess = input.purpose === "access_recovery"
      ? [binding.prepare(`UPDATE diagnostic_report_access SET revoked_at = ?
          WHERE request_id = ? AND challenge_id <> ? AND revoked_at IS NULL
            AND EXISTS (
              SELECT 1 FROM verified_email_challenge c
              INNER JOIN identified_diagnostic_request r ON r.id = c.request_id
              INNER JOIN diagnostic_report_snapshot s ON s.request_id = r.id
              WHERE c.id = ? AND c.request_id = ? AND c.purpose = 'access_recovery' AND c.status = 'consumed' AND c.consumed_at = ?
                AND r.status = 'verified' AND r.expires_at > ? AND s.expires_at > ?
            )`)
        .bind(timestamp, input.requestId, input.challengeId, input.challengeId, input.requestId, timestamp, timestamp, timestamp)]
      : [];
    const accessWrite = binding.prepare(`INSERT INTO diagnostic_report_access
      (id, request_id, challenge_id, token_digest, issued_at, expires_at, revoked_at)
      SELECT ?, ?, c.id, ?, ?, ?, NULL
      FROM verified_email_challenge c
      INNER JOIN identified_diagnostic_request r ON r.id = c.request_id
      INNER JOIN diagnostic_report_snapshot s ON s.request_id = r.id
      WHERE c.id = ? AND c.request_id = ? AND c.purpose = ? AND c.status = 'consumed' AND c.consumed_at = ?
        AND r.status = 'verified' AND r.expires_at > ? AND s.expires_at > ?
        AND r.expires_at >= ? AND s.expires_at >= ?
      ON CONFLICT(challenge_id) DO NOTHING`)
      .bind(input.access.id, input.access.requestId, input.access.tokenDigest, timestamp, accessExpiresAt, input.challengeId, input.requestId, input.purpose, timestamp, timestamp, timestamp, accessExpiresAt, accessExpiresAt);
    return [challengeConsume, requestTransition, ...emailVerifiedIncrement, ...revokePreviousAccess, accessWrite];
  };

  const results = input.purpose === "verification"
    ? await withBestEffortFunnelAnalytics(() => binding.batch(buildStatements(true)), () => binding.batch(buildStatements(false)))
    : await binding.batch(buildStatements(false));
  const accessResult = results[results.length - 1] as { readonly meta?: { readonly changes?: number } } | undefined;
  return accessResult?.meta?.changes === 1;
}

export async function getAuthorizedReport(binding: D1Database, tokenDigest: string, requestId: string, now: Date) {
  const database = createDatabase(binding);
  const [row] = await database.select({
    request: identifiedDiagnosticRequest,
    snapshot: diagnosticReportSnapshot,
    access: diagnosticReportAccess,
  }).from(diagnosticReportAccess)
    .innerJoin(identifiedDiagnosticRequest, eq(diagnosticReportAccess.requestId, identifiedDiagnosticRequest.id))
    .innerJoin(diagnosticReportSnapshot, eq(diagnosticReportSnapshot.requestId, identifiedDiagnosticRequest.id))
    .where(and(
      eq(diagnosticReportAccess.tokenDigest, tokenDigest),
      eq(diagnosticReportAccess.requestId, requestId),
      isNull(diagnosticReportAccess.revokedAt),
      gt(diagnosticReportAccess.expiresAt, now),
      eq(identifiedDiagnosticRequest.status, "verified"),
      gt(identifiedDiagnosticRequest.expiresAt, now),
      gt(diagnosticReportSnapshot.expiresAt, now),
    )).limit(1);
  return row ?? null;
}

export async function recordDetailedReportFirstOpen(binding: D1Database, accessId: string, requestId: string, now: Date): Promise<void> {
  const timestamp = now.getTime();
  const markRequestFirstOpen = () => binding.prepare(`UPDATE identified_diagnostic_request SET first_report_opened_at = ?
    WHERE id = ? AND status = 'verified' AND first_report_opened_at IS NULL AND expires_at > ?
      AND EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = identified_diagnostic_request.id AND s.expires_at > ?)
      AND EXISTS (SELECT 1 FROM diagnostic_report_access a
        WHERE a.id = ? AND a.request_id = identified_diagnostic_request.id AND a.revoked_at IS NULL AND a.expires_at > ?)`)
    .bind(timestamp, requestId, timestamp, timestamp, accessId, timestamp);
  try {
    await binding.batch([
      markRequestFirstOpen(),
      binding.prepare(`INSERT INTO diagnostic_funnel_aggregate (event_day, diagnostic_version, contract_version, event_type, event_count)
        SELECT ?, ?, ?, 'detailed_report_first_opened', 1 WHERE changes() = 1
        ON CONFLICT(event_day, diagnostic_version, contract_version, event_type)
        DO UPDATE SET event_count = event_count + 1`)
        .bind(utcAnalyticsDay(now), FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION),
    ]);
  } catch {
    try { await markRequestFirstOpen().run(); }
    catch { /* Neither an analytics outage nor a marker-write failure denies an already authorized report. */ }
  }
}

export async function deleteIdentifiedReport(binding: D1Database, requestId: string): Promise<void> {
  const database = createDatabase(binding);
  await database.delete(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.id, requestId));
}

export type PurgedIdentifiedReportRows = {
  readonly expiredAccess: number;
  readonly expiredSnapshots: number;
  readonly expiredChallenges: number;
  readonly orphanedCommercialIntents: number;
  readonly orphanedResearchIntents: number;
  readonly expiredRequests: number;
};

/** A scheduled pass is deliberately small; later invocations safely continue the sweep. */
export const IDENTIFIED_REPORT_PURGE_BATCH_SIZE = 100;

export async function purgeExpiredIdentifiedReports(binding: D1Database, now: Date): Promise<PurgedIdentifiedReportRows> {
  const timestamp = now.getTime();
  const limit = IDENTIFIED_REPORT_PURGE_BATCH_SIZE;
  const results = await binding.batch([
    binding.prepare(`DELETE FROM diagnostic_report_access WHERE rowid IN (
      SELECT a.rowid FROM diagnostic_report_access a
      WHERE a.revoked_at IS NOT NULL OR a.expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = a.request_id AND r.expires_at > ?)
        OR NOT EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.id = a.challenge_id)
      LIMIT ?)`)
      .bind(timestamp, timestamp, limit),
    binding.prepare(`DELETE FROM diagnostic_report_snapshot WHERE rowid IN (
      SELECT s.rowid FROM diagnostic_report_snapshot s
      WHERE s.expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = s.request_id AND r.expires_at > ?)
      LIMIT ?)`)
      .bind(timestamp, timestamp, limit),
    binding.prepare(`DELETE FROM verified_email_challenge WHERE rowid IN (
      SELECT c.rowid FROM verified_email_challenge c
      WHERE (c.expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = c.request_id AND r.expires_at > ?))
        AND NOT EXISTS (
          SELECT 1 FROM diagnostic_report_access a
          WHERE a.challenge_id = c.id AND a.revoked_at IS NULL AND a.expires_at > ?
            AND EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = a.request_id AND r.expires_at > ?)
        )
      LIMIT ?)`)
      .bind(timestamp, timestamp, timestamp, timestamp, limit),
    binding.prepare(`DELETE FROM commercial_contact_intent WHERE rowid IN (
      SELECT i.rowid FROM commercial_contact_intent i
      WHERE NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = i.request_id AND r.expires_at > ?)
      LIMIT ?)`)
      .bind(timestamp, limit),
    binding.prepare(`DELETE FROM diagnostic_research_intent WHERE rowid IN (
      SELECT i.rowid FROM diagnostic_research_intent i
      WHERE NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = i.request_id AND r.expires_at > ?)
      LIMIT ?)`)
      .bind(timestamp, limit),
    // Do not rely on a potentially large cascade: remove expired children in bounded passes first.
    binding.prepare(`DELETE FROM identified_diagnostic_request WHERE rowid IN (
      SELECT r.rowid FROM identified_diagnostic_request r
      WHERE r.expires_at <= ?
        AND NOT EXISTS (SELECT 1 FROM diagnostic_report_access a WHERE a.request_id = r.id)
        AND NOT EXISTS (SELECT 1 FROM diagnostic_report_snapshot s WHERE s.request_id = r.id)
        AND NOT EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.request_id = r.id)
        AND NOT EXISTS (SELECT 1 FROM commercial_contact_intent i WHERE i.request_id = r.id)
        AND NOT EXISTS (SELECT 1 FROM diagnostic_research_intent i WHERE i.request_id = r.id)
      LIMIT ?)`)
      .bind(timestamp, limit),
  ]);
  const changes = results.map((result) => result.meta?.changes ?? 0);
  return {
    expiredAccess: changes[0] ?? 0,
    expiredSnapshots: changes[1] ?? 0,
    expiredChallenges: changes[2] ?? 0,
    orphanedCommercialIntents: changes[3] ?? 0,
    orphanedResearchIntents: changes[4] ?? 0,
    expiredRequests: changes[5] ?? 0,
  };
}

/**
 * FUNNEL-01D.2: revocación idempotente de preferencias opt-in.
 * Solo se permite con un grant vigente, no revocado, vinculado a la solicitud.
 * No borra el informe ni altera los agregados anónimos.
 * Uso server-only; no expone una ruta pública por sí mismo.
 */
export async function revokeDiagnosticOptionalIntents(
  binding: D1Database,
  input: { requestId: string; accessTokenDigest: string; now: Date; revokeCommercial: boolean; revokeResearch: boolean },
): Promise<{ authorized: boolean; commercialRevoked: boolean; researchRevoked: boolean }> {
  const now = input.now.getTime();
  if (!input.requestId || !input.accessTokenDigest || !Number.isFinite(now) ||
    (!input.revokeCommercial && !input.revokeResearch)) {
    return { authorized: false, commercialRevoked: false, researchRevoked: false };
  }
  const authorized = await binding.prepare(`SELECT 1 AS authorized
    FROM diagnostic_report_access a
    JOIN identified_diagnostic_request r ON r.id = a.request_id
    JOIN diagnostic_report_snapshot s ON s.request_id = r.id
    WHERE a.request_id = ? AND a.token_digest = ? AND a.revoked_at IS NULL
      AND a.expires_at > ? AND r.expires_at > ? AND s.expires_at > ?
      AND r.status = 'verified' LIMIT 1`)
    .bind(input.requestId, input.accessTokenDigest, now, now, now)
    .first<{ authorized: number }>();
  if (!authorized) return { authorized: false, commercialRevoked: false, researchRevoked: false };

  // Revalida el grant dentro de cada UPDATE para impedir escrituras si fue revocado
  // entre la lectura inicial y el batch. D1 ejecuta el batch transaccionalmente.
  const guard = `EXISTS (
    SELECT 1 FROM diagnostic_report_access a
    JOIN identified_diagnostic_request r ON r.id = a.request_id
    JOIN diagnostic_report_snapshot s ON s.request_id = r.id
    WHERE a.request_id = ? AND a.token_digest = ? AND a.revoked_at IS NULL
      AND a.expires_at > ? AND r.expires_at > ? AND s.expires_at > ?
      AND r.status = 'verified')`;
  const statements = [];
  if (input.revokeCommercial) statements.push(
    binding.prepare(`UPDATE commercial_contact_intent SET revoked_at = ?
      WHERE request_id = ? AND revoked_at IS NULL AND ${guard}`)
      .bind(now, input.requestId, input.requestId, input.accessTokenDigest, now, now, now),
  );
  if (input.revokeResearch) statements.push(
    binding.prepare(`UPDATE diagnostic_research_intent SET revoked_at = ?
      WHERE request_id = ? AND revoked_at IS NULL AND ${guard}`)
      .bind(now, input.requestId, input.requestId, input.accessTokenDigest, now, now, now),
  );
  const updates = await binding.batch(statements);
  return {
    authorized: true,
    commercialRevoked: input.revokeCommercial && (updates[0]?.meta?.changes ?? 0) > 0,
    researchRevoked: input.revokeResearch && (updates[input.revokeCommercial ? 1 : 0]?.meta?.changes ?? 0) > 0,
  };
}

/**
 * FUNNEL-01D.2: borrado solicitado desde un informe verificado.
 * La autorización se revalida en el mismo DELETE (evita la ventana
 * entre la lectura del grant y el borrado). Los registros relacionados
 * se eliminan por FK ON DELETE CASCADE; los agregados anónimos no
 * están vinculados a la solicitud y se conservan.
 * No es un registro de solicitud de supresión ni un flujo público.
 */
export async function deleteAuthorizedIdentifiedReport(
  binding: D1Database,
  input: { requestId: string; accessTokenDigest: string; now: Date },
): Promise<boolean> {
  const now = input.now.getTime();
  if (!input.requestId || !input.accessTokenDigest || !Number.isFinite(now)) return false;
  const result = await binding.prepare(`DELETE FROM identified_diagnostic_request
    WHERE id = ? AND status = 'verified' AND expires_at > ?
      AND EXISTS (
        SELECT 1 FROM diagnostic_report_access a
        JOIN diagnostic_report_snapshot s ON s.request_id = identified_diagnostic_request.id
        WHERE a.request_id = identified_diagnostic_request.id
          AND a.token_digest = ? AND a.revoked_at IS NULL
          AND a.expires_at > ? AND s.expires_at > ?
      )`)
    .bind(input.requestId, now, input.accessTokenDigest, now, now).run();
  // D1 may include rows removed through foreign-key cascades in this count.
  // The request ID predicate can match at most one parent row, so any change means success.
  return (result.meta?.changes ?? 0) > 0;
}
