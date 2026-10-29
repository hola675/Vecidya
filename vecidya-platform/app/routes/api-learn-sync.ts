import { and, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { learnFavorite, learnGuideProgress, learnOperationReceipt, learnSectionProgress, learnSyncDevice } from "../../db/schema";
import { getPublicLearnArticle, getPublicLearnArticles, getLearnEditorialIdentity } from "../content/learn-publication";
import { learnArticles } from "../content/learn";
import learnEditorialManifest from "../content/learn-editorial-manifest";
import { canReadLearnGuideBody } from "../../server/learn/entitlement.server";
import { getSession } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { Route } from "./+types/api-learn-sync";

const privateHeaders = { "Cache-Control": "private, no-store" };
const maxBodyBytes = 64 * 1024;
const maxOperations = 50;
const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
const operationTypes = ["check-section", "uncheck-section", "set-last-section", "reset-guide", "favorite", "unfavorite", "hide-recent", "restore-recent"] as const;
type OperationType = typeof operationTypes[number];
type Operation = { operationId: string; deviceId: string; clientSequence: number; guideId: string; type: OperationType; sectionId?: string; baseVersion: number; baseResetEpoch: number; createdAt: number };

function fail(status: number, message: string) { return Response.json({ error: message }, { status, headers: privateHeaders }); }
function validId(value: unknown) { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value); }
function validOperation(value: unknown): value is Operation {
  if (!value || typeof value !== "object") return false;
  const op = value as Partial<Operation>;
  return validId(op.operationId) && validId(op.deviceId) && Number.isSafeInteger(op.clientSequence) && (op.clientSequence ?? 0) > 0 && typeof op.guideId === "string" && op.guideId.length <= 128 && operationTypes.includes(op.type as OperationType) && Number.isSafeInteger(op.baseVersion) && (op.baseVersion ?? -1) >= 0 && Number.isSafeInteger(op.baseResetEpoch) && (op.baseResetEpoch ?? -1) >= 0 && Number.isSafeInteger(op.createdAt) && (op.createdAt ?? 0) > 0 && (op.sectionId === undefined || typeof op.sectionId === "string");
}

export async function loader() { return fail(405, "Método no permitido."); }

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "POST" } });
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail(403, "Origen no permitido.");
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return fail(415, "Se requiere application/json.");
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBodyBytes) return fail(413, "La solicitud supera el límite permitido.");
  const { env } = context.get(cloudflareContext);
  const session = await getSession(env, request);
  if (!session) return fail(401, "Se requiere una sesión vigente.");
  let body: unknown;
  try { body = await request.json(); } catch { return fail(400, "JSON inválido."); }
  if (!body || typeof body !== "object" || !Array.isArray((body as { operations?: unknown }).operations)) return fail(400, "Formato de sincronización inválido.");
  const operations = (body as { operations: unknown[] }).operations;
  if (operations.length > maxOperations || !operations.every(validOperation)) return fail(400, "La lista de operaciones no es válida.");
  if (new TextEncoder().encode(JSON.stringify(body)).byteLength > maxBodyBytes) return fail(413, "La solicitud supera el límite permitido.");

  const database = createDatabase(env.DB);
  const results: Array<{ operationId: string; status: "applied" | "duplicate" | "conflict" | "expired"; version?: number; resetEpoch?: number }> = [];
  for (const op of operations) {
    const now = Date.now();
    const duplicate = await database.query.learnOperationReceipt.findFirst({ where: and(eq(learnOperationReceipt.userId, session.user.id), eq(learnOperationReceipt.operationId, op.operationId)) });
    if (duplicate) { results.push({ operationId: op.operationId, status: "duplicate", version: duplicate.resultVersion, resetEpoch: duplicate.resultResetEpoch }); continue; }
    if (op.createdAt > now + 5 * 60_000 || now - op.createdAt > maxAgeMs) { results.push({ operationId: op.operationId, status: "expired" }); continue; }
    const article = getPublicLearnArticle(getPublicLearnArticles(learnArticles), Object.entries(learnEditorialManifest as Record<string, { guideId: string }>).find(([, value]) => value.guideId === op.guideId)?.[0]);
    if (!article) return fail(400, "Guía no válida.");
    const guide = getLearnEditorialIdentity(article);
    const type = op.type;
    if (["check-section", "uncheck-section", "set-last-section", "reset-guide", "hide-recent", "restore-recent"].includes(type) && !await canReadLearnGuideBody(database, session.user.id, guide.slug)) return fail(403, "No tienes acceso al progreso de esta guía.");
    if (["check-section", "uncheck-section", "set-last-section"].includes(type) && !guide.sections.some((section) => section.sectionId === op.sectionId)) return fail(400, "Sección inválida.");
    const prior = await database.query.learnGuideProgress.findFirst({ where: and(eq(learnGuideProgress.userId, session.user.id), eq(learnGuideProgress.guideId, op.guideId)) });
    const version = prior?.version ?? 0;
    const epoch = prior?.resetEpoch ?? 0;
    const strictVersion = type === "reset-guide" || type === "set-last-section" || type === "hide-recent" || type === "restore-recent";
    if (op.baseResetEpoch !== epoch || op.baseVersion > version || (strictVersion && op.baseVersion !== version)) { results.push({ operationId: op.operationId, status: "conflict", version, resetEpoch: epoch }); continue; }
    const device = await database.query.learnSyncDevice.findFirst({ where: and(eq(learnSyncDevice.userId, session.user.id), eq(learnSyncDevice.deviceId, op.deviceId)) });
    if (op.clientSequence !== (device?.lastSequence ?? 0) + 1) { results.push({ operationId: op.operationId, status: "conflict", version, resetEpoch: epoch }); continue; }
    const nowDate = new Date(now);
    const nextVersion = version + 1;
    const nextEpoch = type === "reset-guide" ? epoch + 1 : epoch;
    const db = env.DB;
    const userId = session.user.id;
    const gate = `EXISTS (SELECT 1 FROM learn_guide_progress WHERE user_id = ? AND guide_id = ? AND last_operation_id = ?)`;
    const statements: D1PreparedStatement[] = [
      db.prepare(`INSERT INTO learn_sync_device (user_id, device_id, last_sequence, last_operation_id, last_seen_at) SELECT ?, ?, ?, ?, ? WHERE (? = 0 AND NOT EXISTS (SELECT 1 FROM learn_guide_progress WHERE user_id = ? AND guide_id = ?)) OR EXISTS (SELECT 1 FROM learn_guide_progress WHERE user_id = ? AND guide_id = ? AND version = ? AND reset_epoch = ?) ON CONFLICT(user_id, device_id) DO UPDATE SET last_sequence = excluded.last_sequence, last_operation_id = excluded.last_operation_id, last_seen_at = excluded.last_seen_at WHERE learn_sync_device.last_sequence = ?`).bind(userId, op.deviceId, op.clientSequence, op.operationId, now, version, userId, op.guideId, userId, op.guideId, version, epoch, op.clientSequence - 1),
      db.prepare(`INSERT INTO learn_guide_progress (user_id, guide_id, content_revision, reset_epoch, version, last_operation_id, last_section_id, last_activity_at, hidden_recent_at, created_at, updated_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM learn_sync_device WHERE user_id = ? AND device_id = ? AND last_sequence = ? AND last_operation_id = ?) ON CONFLICT(user_id, guide_id) DO UPDATE SET content_revision = excluded.content_revision, reset_epoch = excluded.reset_epoch, version = excluded.version, last_operation_id = excluded.last_operation_id, last_section_id = excluded.last_section_id, last_activity_at = excluded.last_activity_at, hidden_recent_at = excluded.hidden_recent_at, updated_at = excluded.updated_at WHERE learn_guide_progress.version = ? AND learn_guide_progress.reset_epoch = ?`).bind(userId, op.guideId, guide.contentRevision, nextEpoch, nextVersion, op.operationId, type === "set-last-section" ? op.sectionId : type === "reset-guide" ? null : prior?.lastSectionId ?? null, now, type === "hide-recent" ? now : type === "restore-recent" || type === "reset-guide" ? null : prior?.hiddenRecentAt?.getTime() ?? null, now, now, userId, op.deviceId, op.clientSequence, op.operationId, version, epoch),
    ];
    if (type === "reset-guide") statements.push(db.prepare(`DELETE FROM learn_section_progress WHERE user_id = ? AND guide_id = ? AND ${gate}`).bind(userId, op.guideId, userId, op.guideId, op.operationId));
    if (type === "check-section" || type === "uncheck-section") statements.push(db.prepare(`INSERT INTO learn_section_progress (user_id, guide_id, section_id, content_revision, reset_epoch, version, is_checked, operation_id, checked_at) SELECT ?, ?, ?, ?, ?, 1, ?, ?, ? WHERE ${gate} ON CONFLICT(user_id, guide_id, section_id) DO UPDATE SET content_revision = excluded.content_revision, reset_epoch = excluded.reset_epoch, version = learn_section_progress.version + 1, is_checked = excluded.is_checked, operation_id = excluded.operation_id, checked_at = excluded.checked_at`).bind(userId, op.guideId, op.sectionId, guide.contentRevision, epoch, type === "check-section" ? 1 : 0, op.operationId, now, userId, op.guideId, op.operationId));
    if (type === "favorite" || type === "unfavorite") statements.push(db.prepare(`INSERT INTO learn_favorite (user_id, guide_id, is_favorite, version, operation_id, updated_at) SELECT ?, ?, ?, 1, ?, ? WHERE ${gate} ON CONFLICT(user_id, guide_id) DO UPDATE SET is_favorite = excluded.is_favorite, version = learn_favorite.version + 1, operation_id = excluded.operation_id, updated_at = excluded.updated_at`).bind(userId, op.guideId, type === "favorite" ? 1 : 0, op.operationId, now, userId, op.guideId, op.operationId));
    statements.push(db.prepare(`INSERT INTO learn_operation_receipt (user_id, operation_id, device_id, client_sequence, guide_id, operation_type, base_version, base_reset_epoch, result_version, result_reset_epoch, outcome, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied', ? WHERE ${gate}`).bind(userId, op.operationId, op.deviceId, op.clientSequence, op.guideId, type, op.baseVersion, op.baseResetEpoch, nextVersion, nextEpoch, now, userId, op.guideId, op.operationId));
    const batch = await db.batch(statements);
    if ((batch[0]?.meta.changes ?? 0) === 0 || (batch[1]?.meta.changes ?? 0) === 0 || (batch.at(-1)?.meta.changes ?? 0) === 0) { results.push({ operationId: op.operationId, status: "conflict", version, resetEpoch: epoch }); continue; }
    results.push({ operationId: op.operationId, status: "applied", version: nextVersion, resetEpoch: nextEpoch });
  }
  return Response.json({ results }, { headers: privateHeaders });
}
