import { isRequestId } from "../features/diagnostic/identified-report-contracts";
import { cloudflareContext } from "../../server/cloudflare-context";
import { consumeChallengeAndGrantAccess, deleteIdentifiedReport, findRequestWithPendingChallenge, getAuthorizedReport, replacePendingChallenge } from "../../db/queries/diagnostic-identification.server";
import { VERIFIED_EMAIL_CHALLENGE_TTL_HOURS } from "../features/diagnostic/identified-report-constants";
import { createOpaqueToken, digestOpaqueToken } from "../features/diagnostic/report-access-crypto.server";
import { deliverDiagnosticVerificationEmail, discardDiagnosticDevInboxMessage, readDiagnosticDevInbox } from "../../server/email/diagnostic-dev-inbox.server";
import { FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION, isLoopbackDevelopmentHost, utcAnalyticsDay } from "../features/diagnostic/funnel-analytics-contract";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
const allowedOperations = ["inspect", "inspect_funnel_aggregate", "lock_challenge", "tamper_snapshot", "expire_children", "expire_request", "expire_request_only", "expire_snapshot_only", "restore_snapshot_expiry", "expiry_matrix", "seed_lost_response_fixture", "seed_purge_batch", "seed_purge_active_control", "revoke_access", "restore_access", "install_purge_failpoint", "remove_purge_failpoint", "install_funnel_analytics_failpoint", "remove_funnel_analytics_failpoint", "cleanup"] as const;
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
  const accessExpiresAt = base + 30_000;

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
      id, request_id, token_digest, purpose, status, attempts, issued_at, expires_at, consumed_at, created_at
    ) VALUES (?, ?, ?, 'verification', 'pending', 0, ?, ?, NULL, ?)`)
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
      issuedAt: at(-20_001), expiresAt: new Date(accessExpiresAt), revokedAt: null,
    };
    const consume = (offset: number) => consumeChallengeAndGrantAccess(db, {
      requestId, challengeId, tokenDigest: challengeDigest, purpose: "verification",
      access: { ...access, issuedAt: at(offset) }, now: at(offset),
      recordFunnelAnalytics: false,
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

    const recoveryChallenge = (issuedAt: number, expiresAt: number) => ({
      id: crypto.randomUUID(), requestId,
      purpose: "access_recovery" as const,
      tokenDigest: `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`,
      status: "pending" as const, attempts: 0,
      issuedAt: new Date(issuedAt), expiresAt: new Date(expiresAt), consumedAt: null, createdAt: new Date(issuedAt),
    });
    const requestBoundary = base + 20_000;
    await db.batch([
      db.prepare("UPDATE identified_diagnostic_request SET expires_at = ? WHERE id = ?").bind(requestBoundary, requestId),
      db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = ? WHERE request_id = ?").bind(base + 30_000, requestId),
    ]);
    const recoveryRequestBefore = await replacePendingChallenge(db, requestId, recoveryChallenge(requestBoundary - 1, requestBoundary));
    const recoveryRequestAt = await replacePendingChallenge(db, requestId, recoveryChallenge(requestBoundary, requestBoundary + 1));
    const recoveryRequestAfter = await replacePendingChallenge(db, requestId, recoveryChallenge(requestBoundary + 1, requestBoundary + 2));

    const snapshotBoundary = base + 30_000;
    await db.batch([
      db.prepare("UPDATE identified_diagnostic_request SET expires_at = ? WHERE id = ?").bind(base + 40_000, requestId),
      db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = ? WHERE request_id = ?").bind(snapshotBoundary, requestId),
    ]);
    const recoverySnapshotBefore = await replacePendingChallenge(db, requestId, recoveryChallenge(snapshotBoundary - 1, snapshotBoundary));
    const recoverySnapshotAt = await replacePendingChallenge(db, requestId, recoveryChallenge(snapshotBoundary, snapshotBoundary + 1));
    const recoverySnapshotAfter = await replacePendingChallenge(db, requestId, recoveryChallenge(snapshotBoundary + 1, snapshotBoundary + 2));
    const pendingRecoveryCount = await db.prepare("SELECT COUNT(*) AS count FROM verified_email_challenge WHERE request_id = ? AND purpose = 'access_recovery' AND status = 'pending'").bind(requestId).first<{ count: number }>();

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
      recoveryRequestBoundary: [recoveryRequestBefore, recoveryRequestAt, recoveryRequestAfter],
      recoverySnapshotBoundary: [recoverySnapshotBefore, recoverySnapshotAt, recoverySnapshotAfter],
      pendingRecoveryAfterBoundaries: pendingRecoveryCount?.count ?? 0,
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
        id, request_id, token_digest, purpose, status, attempts, issued_at, expires_at, consumed_at, created_at
      ) VALUES (?, ?, ?, 'verification', 'pending', 0, ?, ?, NULL, ?)`)
        .bind(challengeId, requestId, await digestOpaqueToken(token), now.getTime(), expiresAt.getTime(), now.getTime()),
    ]);
    const inserted = await db.prepare("SELECT COUNT(*) AS count FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'").bind(requestId).first<{ count: number }>();
    if (inserted?.count !== 1) throw new Error("No se pudo crear la solicitud sintética de recuperación.");
    const recipient = await db.prepare("SELECT email FROM identified_diagnostic_request WHERE id = ?").bind(requestId).first<{ email: string }>();
    if (!recipient) throw new Error("No se pudo leer el destinatario sintético.");
    await deliverDiagnosticVerificationEmail({ requestId, challengeId, recipient: recipient.email, token, origin, now: now.getTime() });
    return { requestId };
  } catch {
    await deleteIdentifiedReport(db, requestId);
    discardDiagnosticDevInboxMessage(requestId);
    throw new Error("No se pudo crear el escenario local de respuesta perdida.");
  }
}

export function loader() { return failure(405, "Método no permitido."); }

const isLoopbackRequest = (request: Request) => isLoopbackDevelopmentHost(new URL(request.url).hostname);

export async function action({ context, params, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV || !isLoopbackRequest(request)) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const requestId = params.requestId;
  if (!requestId || !isRequestId(requestId)) return failure(404, "La solicitud no está disponible.");
  const { env } = context.get(cloudflareContext);
  const db = env.DB;
  let body: unknown;
  try { body = await request.json(); } catch { return failure(400, "Operación no válida."); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || !allowedOperations.includes((body as { op?: Operation }).op as Operation)) return failure(400, "Operación no válida.");
  const op = (body as { op: Operation }).op;
  const requestRow = await db.prepare("SELECT id FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'").bind(requestId).first<{ id: string }>();
  const triggerName = `diag_qa_purge_abort_${requestId.replaceAll("-", "")}`;
  const analyticsTriggerName = `diag_qa_funnel_abort_${requestId.replaceAll("-", "")}`;
  if (op === "cleanup") {
    discardDiagnosticDevInboxMessage(requestId);
    await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
    await db.prepare(`DROP TRIGGER IF EXISTS ${analyticsTriggerName}`).run();
    if (requestRow) await db.prepare("DELETE FROM identified_diagnostic_request WHERE id = ?").bind(requestId).run();
    return Response.json({ ok: true, existed: Boolean(requestRow) }, { headers });
  }
  if (op === "inspect_funnel_aggregate") {
    const [rows, columns] = await Promise.all([
      db.prepare(`SELECT event_day AS date, diagnostic_version AS version, contract_version AS contractVersion, event_type AS event, event_count AS count
        FROM diagnostic_funnel_aggregate WHERE event_day = ? AND diagnostic_version = ? AND contract_version = ?
        ORDER BY event_type`).bind(utcAnalyticsDay(new Date()), FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION).all(),
      db.prepare("PRAGMA table_info(diagnostic_funnel_aggregate)").all<{ name: string }>(),
    ]);
    return Response.json({ metrics: rows.results, columns: columns.results?.map((column) => column.name) ?? [] }, { headers });
  }
  if (!requestRow && op !== "seed_purge_batch" && op !== "seed_purge_active_control" && op !== "inspect") return failure(404, "Fixture local no disponible.");
  if (op === "install_funnel_analytics_failpoint") {
    await db.prepare(`CREATE TRIGGER IF NOT EXISTS ${analyticsTriggerName} BEFORE INSERT ON diagnostic_funnel_aggregate BEGIN SELECT RAISE(ABORT, 'qa local analytics failpoint'); END`).run();
    return Response.json({ ok: true }, { headers });
  }
  if (op === "remove_funnel_analytics_failpoint") {
    await db.prepare(`DROP TRIGGER IF EXISTS ${analyticsTriggerName}`).run();
    return Response.json({ ok: true }, { headers });
  }
  if (op === "seed_lost_response_fixture") {
    try { return Response.json(await seedLostResponseFixture(db, requestId, new URL(request.url).origin), { headers }); }
    catch { return failure(500, "No se pudo crear la fixture local."); }
  }
  if (op === "seed_purge_batch" || op === "seed_purge_active_control") {
    const now = Date.now();
    const expiresAt = now + (op === "seed_purge_active_control" ? 86_400_000 : -60_000);
    const challengeId = crypto.randomUUID();
    try {
      await db.batch([
        db.prepare(`INSERT INTO identified_diagnostic_request (
          id, idempotency_key_hash, request_fingerprint_hash, engine_identity, report_version, methodology_version, status,
          full_name, business_name, email, phone, service_notice_version, service_notice_acknowledged_at, created_at, updated_at, expires_at
        ) VALUES (?, lower(hex(randomblob(32))), lower(hex(randomblob(32))), '{}', 'purge-test-v1', 'purge-test-v1', 'verified',
          'Fixture local', NULL, 'qa-funnel@example.invalid', NULL, 'purge-test-v1', ?, ?, ?, ?)`)
          .bind(requestId, now - 1000, now, now, expiresAt),
        db.prepare(`INSERT INTO diagnostic_report_snapshot (
          request_id, engine_identity, report_version, methodology_version, report_json, report_sha256, computed_at, expires_at
        ) VALUES (?, '{}', 'purge-test-v1', 'purge-test-v1', '{}', 'test-hash', ?, ?)`)
          .bind(requestId, now, expiresAt),
        db.prepare(`INSERT INTO verified_email_challenge (
          id, request_id, purpose, token_digest, status, attempts, issued_at, expires_at, consumed_at, created_at
        ) VALUES (?, ?, 'verification', lower(hex(randomblob(32))), ?, 0, ?, ?, NULL, ?)`)
          .bind(challengeId, requestId, op === "seed_purge_active_control" ? "pending" : "expired", now, expiresAt, now),
      ]);
      if (op === "seed_purge_batch") {
        const challengeIds = [challengeId];
        for (let offset = 0; offset < 105; offset += 1) {
          const extraChallengeId = crypto.randomUUID();
          challengeIds.push(extraChallengeId);
          await db.prepare(`INSERT INTO verified_email_challenge (
            id, request_id, purpose, token_digest, status, attempts, issued_at, expires_at, consumed_at, created_at
          ) VALUES (?, ?, 'verification', lower(hex(randomblob(32))), 'expired', 0, ?, ?, NULL, ?)`)
            .bind(extraChallengeId, requestId, now - 120_000, now - 60_000, now - 120_000).run();
        }
        // Reverse grant row order to exercise the challenge FK cascade against the 100-row limit.
        for (const challengeId of challengeIds.reverse()) {
          await db.prepare(`INSERT INTO diagnostic_report_access (
            id, request_id, challenge_id, token_digest, issued_at, expires_at, revoked_at
          ) VALUES (?, ?, ?, lower(hex(randomblob(32))), ?, ?, NULL)`)
            .bind(crypto.randomUUID(), requestId, challengeId, now - 120_000, now - 60_000).run();
        }
      } else {
        await db.batch([
          db.prepare(`INSERT INTO diagnostic_report_access (id, request_id, challenge_id, token_digest, issued_at, expires_at, revoked_at)
            VALUES (?, ?, ?, lower(hex(randomblob(32))), ?, ?, NULL)`)
            .bind(crypto.randomUUID(), requestId, challengeId, now, expiresAt),
          db.prepare(`INSERT INTO commercial_contact_intent (id, request_id, notice_version, source, consented_at, revoked_at)
            VALUES (?, ?, 'purge-test-v1', 'test_fixture', ?, NULL)`).bind(crypto.randomUUID(), requestId, now),
          db.prepare(`INSERT INTO diagnostic_research_intent (id, request_id, notice_version, source, consented_at, revoked_at)
            VALUES (?, ?, 'purge-test-v1', 'test_fixture', ?, NULL)`).bind(crypto.randomUUID(), requestId, now),
        ]);
      }
      return Response.json({ requestId, challenges: op === "seed_purge_batch" ? 106 : 1, active: op === "seed_purge_active_control" }, { headers });
    } catch {
      await deleteIdentifiedReport(db, requestId);
      return failure(500, "No se pudo crear la fixture local de purga.");
    }
  }
  if (op === "lock_challenge") await db.prepare(`UPDATE verified_email_challenge SET status = 'locked', attempts = 5 WHERE id = (SELECT id FROM verified_email_challenge WHERE request_id = ? ORDER BY issued_at DESC LIMIT 1)`).bind(requestId).run();
  if (op === "inspect") {
    const row = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ?) AS requests,
      (SELECT COUNT(*) FROM diagnostic_report_snapshot WHERE request_id = ?) AS snapshots,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ?) AS challenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'pending') AS pendingChallenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND purpose = 'access_recovery' AND status = 'pending') AS pendingRecoveryChallenges,
      (SELECT COALESCE(MAX(attempts), 0) FROM verified_email_challenge WHERE request_id = ? AND purpose = 'access_recovery' AND status = 'pending') AS pendingRecoveryAttempts,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'consumed') AS consumedChallenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND purpose = 'access_recovery' AND status = 'consumed') AS consumedRecoveryChallenges,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ? AND status = 'superseded') AS supersededChallenges,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ?) AS access,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ? AND revoked_at IS NULL AND expires_at > CAST(strftime('%s','now') AS INTEGER) * 1000) AS activeAccess,
       (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ? AND revoked_at IS NOT NULL) AS revokedAccess,
       (SELECT MAX(expires_at) FROM diagnostic_report_access WHERE request_id = ?) AS latestAccessExpiresAt,
       (SELECT expires_at FROM identified_diagnostic_request WHERE id = ?) AS requestExpiresAt,
       (SELECT first_report_opened_at FROM identified_diagnostic_request WHERE id = ?) AS firstReportOpenedAt,
       (SELECT expires_at FROM diagnostic_report_snapshot WHERE request_id = ?) AS snapshotExpiresAt,
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ? AND status = 'verified') AS verifiedRequests,
      (SELECT COUNT(*) FROM commercial_contact_intent WHERE request_id = ?) AS commercialIntents,
       (SELECT COUNT(*) FROM diagnostic_research_intent WHERE request_id = ?) AS researchIntents`).bind(requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId, requestId).first<Record<string, number>>();
    const snapshot = await db.prepare(`SELECT engine_identity AS engineIdentity, report_version AS reportVersion,
      methodology_version AS methodologyVersion, report_sha256 AS reportSha256
      FROM diagnostic_report_snapshot WHERE request_id = ?`).bind(requestId).first<Record<string, string>>();
    const message = readDiagnosticDevInbox(requestId);
    return Response.json({ counts: row, snapshot, localMessage: message ? { createdAt: message.createdAt, purpose: message.purpose } : null }, { headers });
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
  if (op === "expire_request_only") await db.prepare("UPDATE identified_diagnostic_request SET expires_at = 0 WHERE id = ?").bind(requestId).run();
  if (op === "expire_snapshot_only") await db.prepare("UPDATE diagnostic_report_snapshot SET expires_at = 0 WHERE request_id = ?").bind(requestId).run();
  if (op === "restore_snapshot_expiry") await db.prepare(`UPDATE diagnostic_report_snapshot SET expires_at = (
    SELECT expires_at FROM identified_diagnostic_request WHERE id = ?
  ) WHERE request_id = ?`).bind(requestId, requestId).run();
  if (op === "revoke_access") await db.prepare("UPDATE diagnostic_report_access SET revoked_at = ? WHERE request_id = ? AND revoked_at IS NULL").bind(Date.now(), requestId).run();
  if (op === "restore_access") await db.prepare("UPDATE diagnostic_report_access SET revoked_at = NULL WHERE request_id = ?").bind(requestId).run();
  if (op === "install_purge_failpoint") await db.prepare(`CREATE TRIGGER IF NOT EXISTS ${triggerName} BEFORE DELETE ON identified_diagnostic_request WHEN OLD.id = '${requestId}' BEGIN SELECT RAISE(ABORT, 'qa local purge failpoint'); END`).run();
  if (op === "remove_purge_failpoint") await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
  return Response.json({ ok: true }, { headers });
}
