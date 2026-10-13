import { isRequestId } from "../features/diagnostic/identified-report-contracts";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
const allowedOperations = ["inspect", "lock_challenge", "tamper_snapshot", "expire_children", "expire_request", "install_purge_failpoint", "remove_purge_failpoint", "cleanup"] as const;
type Operation = typeof allowedOperations[number];

export function loader() { return failure(405, "Método no permitido."); }

export async function action({ context, params, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const requestId = params.requestId;
  if (!requestId || !isRequestId(requestId)) return failure(404, "La solicitud no está disponible.");
  let body: unknown;
  try { body = await request.json(); } catch { return failure(400, "Operación no válida."); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || !allowedOperations.includes((body as { op?: Operation }).op as Operation)) return failure(400, "Operación no válida.");
  const { env } = context.get(cloudflareContext);
  const db = env.DB;
  const requestRow = await db.prepare("SELECT id FROM identified_diagnostic_request WHERE id = ? AND email = 'qa-funnel@example.invalid'").bind(requestId).first<{ id: string }>();
  if (!requestRow) return failure(404, "Fixture local no disponible.");
  const op = (body as { op: Operation }).op;
  const triggerName = `diag_qa_purge_abort_${requestId.replaceAll("-", "")}`;
  if (op === "lock_challenge") await db.prepare(`UPDATE verified_email_challenge SET status = 'locked', attempts = 5 WHERE id = (SELECT id FROM verified_email_challenge WHERE request_id = ? ORDER BY issued_at DESC LIMIT 1)`).bind(requestId).run();
  if (op === "inspect") {
    const row = await db.prepare(`SELECT
      (SELECT COUNT(*) FROM identified_diagnostic_request WHERE id = ?) AS requests,
      (SELECT COUNT(*) FROM diagnostic_report_snapshot WHERE request_id = ?) AS snapshots,
      (SELECT COUNT(*) FROM verified_email_challenge WHERE request_id = ?) AS challenges,
      (SELECT COUNT(*) FROM diagnostic_report_access WHERE request_id = ?) AS access,
      (SELECT COUNT(*) FROM commercial_contact_intent WHERE request_id = ?) AS commercialIntents,
      (SELECT COUNT(*) FROM diagnostic_research_intent WHERE request_id = ?) AS researchIntents`).bind(requestId, requestId, requestId, requestId, requestId, requestId).first<Record<string, number>>();
    return Response.json({ counts: row }, { headers });
  }
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
  if (op === "install_purge_failpoint") await db.prepare(`CREATE TRIGGER IF NOT EXISTS ${triggerName} BEFORE DELETE ON identified_diagnostic_request WHEN OLD.id = '${requestId}' BEGIN SELECT RAISE(ABORT, 'qa local purge failpoint'); END`).run();
  if (op === "remove_purge_failpoint") await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
  if (op === "cleanup") {
    await db.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
    await db.prepare("DELETE FROM identified_diagnostic_request WHERE id = ?").bind(requestId).run();
  }
  return Response.json({ ok: true }, { headers });
}
