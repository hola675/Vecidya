import { and, desc, eq, gt, isNull, lte, lt, sql } from "drizzle-orm";

import { createDatabase } from "../client.server";
import {
  commercialContactIntent,
  diagnosticReportAccess,
  diagnosticReportSnapshot,
  diagnosticResearchIntent,
  identifiedDiagnosticRequest,
  verifiedEmailChallenge,
} from "../schema";

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

export async function findReportRequestByIdempotencyHash(binding: D1Database, keyHash: string) {
  const database = createDatabase(binding);
  const [request] = await database.select({ id: identifiedDiagnosticRequest.id, status: identifiedDiagnosticRequest.status, expiresAt: identifiedDiagnosticRequest.expiresAt, requestFingerprintHash: identifiedDiagnosticRequest.requestFingerprintHash })
    .from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.idempotencyKeyHash, keyHash)).limit(1);
  return request ?? null;
}

export async function findRequestWithPendingChallenge(binding: D1Database, requestId: string, now: Date) {
  const database = createDatabase(binding);
  const [request] = await database.select().from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.id, requestId)).limit(1);
  if (!request || request.status !== "verification_pending" || request.expiresAt.getTime() <= now.getTime()) return null;
  const [challenge] = await database.select().from(verifiedEmailChallenge)
    .where(and(eq(verifiedEmailChallenge.requestId, requestId), eq(verifiedEmailChallenge.status, "pending"), gt(verifiedEmailChallenge.expiresAt, now)))
    .orderBy(desc(verifiedEmailChallenge.issuedAt))
    .limit(1);
  return challenge ? { request, challenge } : null;
}

export async function replacePendingChallenge(binding: D1Database, requestId: string, challenge: typeof verifiedEmailChallenge.$inferInsert): Promise<boolean> {
  const issuedAt = challenge.issuedAt.getTime();
  const expiresAt = challenge.expiresAt.getTime();
  if (expiresAt <= issuedAt || challenge.requestId !== requestId || challenge.status !== "pending" || challenge.attempts !== 0 || challenge.consumedAt !== null) return false;
  const results = await binding.batch([
    binding.prepare(`UPDATE verified_email_challenge
      SET status = 'superseded'
      WHERE request_id = ? AND status = 'pending'
        AND EXISTS (
          SELECT 1 FROM identified_diagnostic_request r
          WHERE r.id = ? AND r.status = 'verification_pending' AND r.expires_at > ?
        )`).bind(requestId, requestId, issuedAt),
    binding.prepare(`INSERT INTO verified_email_challenge
      (id, request_id, token_digest, status, attempts, issued_at, expires_at, consumed_at, created_at)
      SELECT ?, r.id, ?, 'pending', 0, ?, ?, NULL, ?
      FROM identified_diagnostic_request r
      WHERE r.id = ? AND r.status = 'verification_pending' AND r.expires_at > ? AND ? > ?`)
      .bind(challenge.id, challenge.tokenDigest, issuedAt, expiresAt, challenge.createdAt.getTime(), requestId, issuedAt, expiresAt, issuedAt),
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
  readonly access: typeof diagnosticReportAccess.$inferInsert;
  readonly now: Date;
}): Promise<boolean> {
  const timestamp = input.now.getTime();
  const results = await binding.batch([
    binding.prepare("UPDATE verified_email_challenge SET status = 'consumed', consumed_at = ? WHERE id = ? AND request_id = ? AND token_digest = ? AND status = 'pending' AND expires_at > ? AND attempts < 5")
      .bind(timestamp, input.challengeId, input.requestId, input.tokenDigest, timestamp),
    binding.prepare("UPDATE identified_diagnostic_request SET status = 'verified', updated_at = ? WHERE id = ? AND status = 'verification_pending' AND expires_at > ? AND EXISTS (SELECT 1 FROM verified_email_challenge c WHERE c.id = ? AND c.request_id = ? AND c.status = 'consumed' AND c.consumed_at = ?)")
      .bind(timestamp, input.requestId, timestamp, input.challengeId, input.requestId, timestamp),
    binding.prepare("INSERT INTO diagnostic_report_access (id, request_id, challenge_id, token_digest, issued_at, expires_at, revoked_at) SELECT ?, ?, c.id, ?, ?, ?, NULL FROM verified_email_challenge c INNER JOIN identified_diagnostic_request r ON r.id = c.request_id WHERE c.id = ? AND c.request_id = ? AND c.status = 'consumed' AND c.consumed_at = ? AND r.status = 'verified' ON CONFLICT(challenge_id) DO NOTHING")
      .bind(input.access.id, input.access.requestId, input.access.tokenDigest, timestamp, input.access.expiresAt.getTime(), input.challengeId, input.requestId, timestamp),
  ]);
  const accessWrite = results[2] as { readonly meta?: { readonly changes?: number } } | undefined;
  return accessWrite?.meta?.changes === 1;
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
