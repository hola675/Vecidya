import { and, desc, eq, gt, isNull, lte, lt, sql } from "drizzle-orm";

import { createDatabase } from "../client.server";
import { FUNNEL_ANALYTICS_CONTRACT_VERSION, FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, utcAnalyticsDay } from "../../app/features/diagnostic/funnel-analytics-contract";
import {
  commercialContactIntent,
  diagnosticReportAccess,
  diagnosticReportSnapshot,
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
  await database.batch(statements as [typeof statements[number], ...typeof statements[number][]]);
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
}): Promise<boolean> {
  const timestamp = input.now.getTime();
  const expectedRequestStatus = input.purpose === "verification" ? "verification_pending" : "verified";
  const accessExpiresAt = input.access.expiresAt.getTime();
  if (input.access.requestId !== input.requestId || input.access.challengeId !== input.challengeId || input.access.issuedAt.getTime() !== timestamp || accessExpiresAt <= timestamp) return false;

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
  const results = await binding.batch([challengeConsume, requestTransition, ...revokePreviousAccess, accessWrite]);
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
  await binding.batch([
    binding.prepare(`UPDATE diagnostic_report_access SET first_opened_at = ?
      WHERE id = ? AND first_opened_at IS NULL AND revoked_at IS NULL AND expires_at > ?
        AND EXISTS (SELECT 1 FROM identified_diagnostic_request r
          INNER JOIN diagnostic_report_snapshot s ON s.request_id = r.id
          WHERE r.id = ? AND r.status = 'verified' AND r.expires_at > ? AND s.expires_at > ?)`)
      .bind(timestamp, accessId, timestamp, requestId, timestamp, timestamp),
    binding.prepare(`INSERT INTO diagnostic_funnel_aggregate (event_day, diagnostic_version, contract_version, event_type, event_count)
      SELECT ?, ?, ?, 'detailed_report_first_opened', 1 WHERE changes() = 1
      ON CONFLICT(event_day, diagnostic_version, contract_version, event_type)
      DO UPDATE SET event_count = event_count + 1`)
      .bind(utcAnalyticsDay(now), FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION),
  ]);
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

/** Manual lifecycle operation; callers must choose an approved retention policy before scheduling it. */
export async function purgeExpiredIdentifiedReports(binding: D1Database, now: Date): Promise<PurgedIdentifiedReportRows> {
  const timestamp = now.getTime();
  const results = await binding.batch([
    binding.prepare(`DELETE FROM diagnostic_report_access
      WHERE revoked_at IS NOT NULL OR expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = diagnostic_report_access.request_id)
        OR NOT EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.id = diagnostic_report_access.challenge_id)`)
      .bind(timestamp),
    binding.prepare(`DELETE FROM diagnostic_report_snapshot
      WHERE expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = diagnostic_report_snapshot.request_id)`)
      .bind(timestamp),
    binding.prepare(`DELETE FROM verified_email_challenge
      WHERE (expires_at <= ?
        OR NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = verified_email_challenge.request_id))
        AND NOT EXISTS (
          SELECT 1 FROM diagnostic_report_access a
          WHERE a.challenge_id = verified_email_challenge.id AND a.revoked_at IS NULL AND a.expires_at > ?
        )`)
      .bind(timestamp, timestamp),
    binding.prepare(`DELETE FROM commercial_contact_intent
      WHERE NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = commercial_contact_intent.request_id)`),
    binding.prepare(`DELETE FROM diagnostic_research_intent
      WHERE NOT EXISTS (SELECT 1 FROM identified_diagnostic_request r WHERE r.id = diagnostic_research_intent.request_id)`),
    binding.prepare("DELETE FROM identified_diagnostic_request WHERE expires_at <= ?").bind(timestamp),
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
