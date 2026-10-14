import { isRequestId } from "../features/diagnostic/identified-report-contracts";
import { cloudflareContext } from "../../server/cloudflare-context";
import { consumeChallengeAndGrantAccess, deleteIdentifiedReport, findRequestWithPendingChallenge, getAuthorizedReport } from "../../db/queries/diagnostic-identification.server";
import { VERIFIED_EMAIL_CHALLENGE_TTL_HOURS } from "../features/diagnostic/identified-report-constants";
import { createOpaqueToken, digestOpaqueToken } from "../features/diagnostic/report-access-crypto.server";
import { deliverDiagnosticVerificationEmail, discardDiagnosticDevInboxMessage } from "../../server/email/diagnostic-dev-inbox.server";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
const allowedOperations = ["inspect", "lock_challenge", "tamper_snapshot", "expire_children", "expire_request", "expiry_matrix", "seed_lost_response_fixture", "revoke_access", "restore_access", "install_purge_failpoint", "remove_purge_failpoint", "cleanup"] as const;
type Operation = typeof allowedOperations[number];

async function runExpiryMatrix(db: D1Database, sourceRequestId: string) {
  const requestId = crypto.randomUUID();
  const challengeId = crypto.randomUUID();
  const challengeDigest = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
  const accessId = crypto.randomUUID();
  const accessDigest = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
  const base = Date.now() + 120_000;
  const challengeExpiresAt = base + 20_000;
  const requestExpiresAt = base + 40_000;
  const snapshotExpiresAt = base + 60_000;
  const accessExpiresAt = base + 80_000;

  try {
    const requestInsert = await db.prepare(`INSERT INTO identified_diagnostic_request (
      id, idempotency_key_hash, request_fingerprint_hash, engine_identity, report_version, methodology_version, status,
      full_name, business_name, email, phone, service_notice_version, service_notice_acknowledged_at, created_at, updated_at, expires_at
    ) SELECT ?, lower(hex(randomblob(32))), request_fingerprint_hash, engine_identity, report_version, methodology_version, 'verification_pending',
      full_name, business_name, email, phone, service_notice_version, service_notice_acknowledged_at, ?, ?, ?
      FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'`)
      .bind(requestId, base - 5_000, base - 5_000, requestExpiresAt, sourceRequestId).run();
    if ((requestInsert.meta?.changes ?? 0) !== 1) throw new Error("No se pudo crear la solicitud sintética de expiración.");

    const snapshotInsert = await db.prepare(`INSERT INTO diagnostic_report_snapshot (
      request_id, engine_identity, report_version, methodology_version, report_json, report_sha256, computed_at, expires_at
    ) SELECT ?, engine_identity, report_version, methodology_version, report_json, report_sha256, ?, ?
      FROM diagnostic_report_snapshot WHERE request_id = ?`)
      .bind(requestId, base - 5_000, snapshotExpiresAt, sourceRequestId).run();
    if ((snapshotInsert.meta?.changes ?? 0) !== 1) throw new Error("No se pudo crear el snapshot sintético de expiración.");

    const challengeInsert = await db.prepare(`INSERT INTO verified_email_challenge (
      id, request_id, token_digest, status, attempts, issued_at, expires_at, consumed_at, created_at
    ) VALUES (?, ?, ?, 'pending', 0, ?, ?, NULL, ?)`)
      .bind(challengeId, requestId, challengeDigest, base - 1_000, challengeExpiresAt, base - 1_000).run();
    if ((challengeInsert.meta?.changes ?? 0) !== 1) throw new Error("No se pudo crear el challenge sintético de expiración.");

    const at = (offset: number) => new Date(base + offset);
    const challengePending = await Promise.all([19_999, 20_000, 20_001].map(async (offset) =>
      Boolean(await findRequestWithPendingChallenge(db, requestId, at(offset)))
    ));

    await db.prepare("UPDATE identified_diagnostic_request SET expires_at = ? WHERE id = ?").bind(base + 10_000, requestId).run();
    await db.prepare("UPDATE verified_email_challenge SET expires_at = ? WHERE id = ?").bind(base + 30_000, challengeId).run();
    const requestPending = await Promise.all([9_999, 10_000, 10_001].map(async (offset) =>
      Boolean(await findRequestWithPendingChallenge(db, requestId, at(offset)))
    ));

    await db.prepare("UPDATE identified_diagnostic_request SET expires_at = ? WHERE id = ?").bind(requestExpiresAt, requestId).run();
    await db.prepare("UPDATE verified_email_challenge SET expires_at = ? WHERE id = ?").bind(challengeExpiresAt, challengeId).run();
    const access = {
      id: accessId, requestId, challengeId, tokenDigest: accessDigest,
      issuedAt: at(-20_001), expiresAt: at(80_000), revokedAt: null,
    };
    const consume = (offset: number) => consumeChallengeAndGrantAccess(db, {
      requestId, challengeId, tokenDigest: challengeDigest,
      access: { ...access, issuedAt: at(offset) }, now: at(offset),
    });
    const consumeAtExpiry = await consume(20_000);
    const consumeAfterExpiry = await consume(20_001);
    const consumeBeforeExpiry = await consume(19_999);
    const grantCount = await db.prepare("SELECT COUNT(*) AS count FROM diagnostic_report_access WHERE request_id = ?").bind(requestId).first<{ count: number }>();

    const probeAccess = async (requestExpiry: number, snapshotExpiry: number, grantExpiry: number) => {
      await db.batch([
        db.prepare("UPDATE identified_diagnostic_request SET expires_at = ? WHERE id = ?").bind(requestExpiry, requestId),
        db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = ? WHERE request_id = ?").bind(snapshotExpiry, requestId),
        db.prepare("UPDATE diagnostic_report_access SET expires_at = ?, revoked_at = NULL WHERE request_id = ?").bind(grantExpiry, requestId),
      ]);
      const expiry = Math.min(requestExpiry, snapshotExpiry, grantExpiry);
      return Promise.all([-1, 0, 1].map(async (delta) => Boolean(await getAuthorizedReport(db, accessDigest, requestId, new Date(expiry + delta)))));
    };
    const authorizedRequest = await probeAccess(base + 10_000, base + 30_000, base + 40_000);
    const authorizedSnapshot = await probeAccess(base + 40_000, base + 10_000, base + 50_000);
    const authorizedGrant = await probeAccess(base + 50_000, base + 40_000, base + 10_000);
    await db.prepare("UPDATE diagnostic_report_access SET expires_at = ?, revoked_at = ? WHERE request_id = ?").bind(base + 50_000, base, requestId).run();
    const revokedAccess = Boolean(await getAuthorizedReport(db, accessDigest, requestId, at(1)));

    await deleteIdentifiedReport(db, requestId);
    const cascadeCounts = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ?) AS requests,
      (SELECT COUNT(*) FROM diagnostic_report_snapshot WHERE request_id = ?) AS snapshots,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ?) AS challenges,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ?) AS access`)
      .bind(requestId, requestId, requestId, requestId).first<Record<string, number>>();

    return {
      challengePending,
      requestPending,
      challengeConsume: [consumeBeforeExpiry, consumeAtExpiry, consumeAfterExpiry],
      grantsAfterConsume: grantCount?.count ?? 0,
      authorizedRequest,
      authorizedSnapshot,
      authorizedGrant,
      revokedAccess,
      cascadeCounts,
    };
  } finally {
    await deleteIdentifiedReport(db, requestId);
  }
}

async function seedLostResponseFixture(db: D1Database, sourceRequestId: string, origin: string) {
  const requestId = crypto.randomUUID();
  const challengeId = crypto.randomUUID();
  const token = createOpaqueToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + VERIFIED_EMAIL_CHALLENGE_TTL_HOURS * 60 * 60 * 1000);
  try {
    await db.batch([
      db.prepare(`INSERT INTO identified_diagnostic_request (
        id, idempotency_key_hash, request_fingerprint_hash, engine_identity, report_version, methodology_version, status,
        full_name, business_name, email, phone, service_notice_version, service_notice_acknowledged_at, created_at, updated_at, expires_at
      ) SELECT ?, lower(hex(randomblob(32))), request_fingerprint_hash, engine_identity, report_version, methodology_version, 'verification_pending',
        full_name, business_name, email, phone, service_notice_version, service_notice_acknowledged_at, ?, ?, expires_at
        FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'`)
        .bind(requestId, now.getTime(), now.getTime(), sourceRequestId),
      db.prepare(`INSERT INTO diagnostic_report_snapshot (
        request_id, engine_identity, report_version, methodology_version, report_json, report_sha256, computed_at, expires_at
      ) SELECT ?, engine_identity, report_version, methodology_version, report_json, report_sha256, ?, expires_at
        FROM diagnostic_report_snapshot WHERE request_id = ?`)
        .bind(requestId, now.getTime(), sourceRequestId),
      db.prepare(`INSERT INTO verified_email_challenge (
        id, request_id, token_digest, status, attempts, issued_at, expires_at, consumed_at, created_at
      ) VALUES (?, ?, ?, 'pending', 0, ?, ?, NULL, ?)`)
        .bind(challengeId, requestId, await digestOpaqueToken(token), now.getTime(), expiresAt.getTime(), now.getTime()),
    ]);
    const inserted = await db.prepare("SELECT COUNT(*) AS count FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'").bind(requestId).first<{ count: number }>();
    if (inserted?.count !== 1) throw new Error("No se pudo crear la solicitud sintética de recuperación.");
    const recipient = await db.prepare("SELECT email FROM identified_diagnostic_request WHERE id = ?").bind(requestId).first<{ email: string }>();
    if (!recipient) throw new Error("No se pudo leer el destinatario sintético.");
    deliverDiagnosticVerificationEmail({ requestId, recipient: recipient.email, token, origin, now: now.getTime() });
    return { requestId };
  } catch {
    await deleteIdentifiedReport(db, requestId);
    discardDiagnosticDevInboxMessage(requestId);
    throw new Error("No se pudo crear el escenario local de respuesta perdida.");
  }
}

export function loader() { return failure(405, "Método no permitido."); }

export async function action({ context, params, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const requestId = params.requestId;
  if (!requestId || !isRequestId(requestId)) return failure(404, "La solicitud no está disponible.");
  const { env } = context.get(cloudflareContext);
  const db = env.DB;
  const requestRow = await db.prepare("SELECT id FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'").bind(requestId).first<{ id: string }>();
  let body: unknown;
  try { body = await request.json(); } catch { return failure(400, "Operación no válida."); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || !allowedOperations.includes((body as { op?: Operation }).op as Operation)) return failure(400, "Operación no válida.");
  const op = (body as { op: Operation }).op;
  const triggerName = `diag_qa_purge_abort_${requestId.replaceAll("-", "")}`;
  if (op === "cleanup") {
    discardDiagnosticDevInboxMessage(requestId);
    await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
    if (requestRow) await db.prepare("DELETE FROM identified_diagnostic_request WHERE id = ?").bind(requestId).run();
    return Response.json({ ok: true, existed: Boolean(requestRow) }, { headers });
  }
  if (!requestRow) return failure(404, "Fixture local no disponible.");
  if (op === "seed_lost_response_fixture") {
    try { return Response.json(await seedLostResponseFixture(db, requestId, new URL(request.url).origin), { headers }); }
    catch { return failure(500, "No se pudo crear la fixture local."); }
  }
  if (op === "lock_challenge") await db.prepare(`UPDATE verified_email_challenge SET status = 'locked', attempts = 5 WHERE id = (SELECT id FROM verified_email_challenge WHERE request_id = ? ORDER BY issued_at DESC LIMIT 1)`).bind(requestId).run();
  if (op === "inspect") {
    const row = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ?) AS requests,
      (SELECT COUNT(*) FROM diagnostic_report_snapshot WHERE request_id = ?) AS snapshots,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ?) AS challenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'pending') AS pendingChallenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'consumed') AS consumedChallenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'superseded') AS supersededChallenges,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ?) AS access,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ? AND revoked_at IS NULL AND expires_at > CAST(strftime('%s','now') AS INTEGER) * 1000) AS activeAccess,
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ? AND status = 'verified') AS verifiedRequests,
      (SELECT COUNT(*) FROM commercial_contact_intent WHERE request_id = ?) AS commercialIntents,
      (SELECT COUNT(*) FROM diagnostic_research_intent WHERE request_id = ?) AS researchIntents`).bind(requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId).first<Record<string, number>>();
    return Response.json({ counts: row }, { headers });
  }
  if (op === "expiry_matrix") return Response.json(await runExpiryMatrix(db, requestId), { headers });
  if (op === "tamper_snapshot") await db.prepare("UPDATE diagnostic_report_snapshot SET report_json = report_json || ' ' WHERE request_id = ?").bind(requestId).run();
  if (op === "expire_children") await db.batch([
    db.prepare("UPDATE diagnostic_report_access SET revoked_at = 0, expires_at = 0 WHERE request_id = ?").bind(requestId),
    db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = 0 WHERE request_id = ?").bind(requestId),
    db.prepare("UPDATE verified_email_challenge SET expires_at = 0 WHERE request_id = ?").bind(requestId),
  ]);
  if (op === "expire_request") await db.batch([
    db.prepare("UPDATE identified_diagnostic_request SET expires_at = 0 WHERE id = ?").bind(requestId),
    db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = 0 WHERE request_id = ?").bind(requestId),
  ]);
  if (op === "revoke_access") await db.prepare("UPDATE diagnostic_report_access SET revoked_at = ? WHERE request_id = ? AND revoked_at IS NULL").bind(Date.now(), requestId).run();
  if (op === "restore_access") await db.prepare("UPDATE diagnostic_report_access SET revoked_at = NULL WHERE request_id = ?").bind(requestId).run();
  if (op === "install_purge_failpoint") await db.prepare(`CREATE TRIGGER IF NOT EXISTS ${triggerName} BEFORE DELETE ON identified_diagnostic_request WHEN OLD.id = '${requestId}' BEGIN SELECT RAISE(ABORT, 'qa local purge failpoint'); END`).run();
  if (op === "remove_purge_failpoint") await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
  return Response.json({ ok: true }, { headers });
}
