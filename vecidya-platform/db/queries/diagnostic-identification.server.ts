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
  const database = createDatabase(binding);
  const [request] = await database.select({ id: identifiedDiagnosticRequest.id, status: identifiedDiagnosticRequest.status, expiresAt: identifiedDiagnosticRequest.expiresAt })
    .from(identifiedDiagnosticRequest).where(eq(identifiedDiagnosticRequest.id, requestId)).limit(1);
  if (!request || request.status !== "verification_pending" || request.expiresAt.getTime() <= challenge.issuedAt.getTime()) return false;
  await database.batch([
    database.update(verifiedEmailChallenge).set({ status: "superseded" })
      .where(and(eq(verifiedEmailChallenge.requestId, requestId), eq(verifiedEmailChallenge.status, "pending"))),
    database.insert(verifiedEmailChallenge).values(challenge),
  ]);
  return true;
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

export async function purgeExpiredIdentifiedReports(binding: D1Database, now: Date): Promise<number> {
  const database = createDatabase(binding);
  const result = await database.delete(identifiedDiagnosticRequest).where(lte(identifiedDiagnosticRequest.expiresAt, now)).returning({ id: identifiedDiagnosticRequest.id });
  return result.length;
}
