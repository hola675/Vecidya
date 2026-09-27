import { createDatabase } from "../../db/client.server";
import {
  completeDiagnosticSession,
  DiagnosticCompletionConflictError,
  DiagnosticSessionError,
  getDiagnosticSessionById,
} from "../../db/queries/diagnostic-sessions.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { deleteDiagnosticSnapshotBestEffort } from "../../server/diagnostic/kv-snapshot.server";
import { readBoundedJsonBody, RequestTooLargeError } from "../../server/diagnostic/request-validation.server";
import { verifyWriteToken } from "../../server/diagnostic/session-security.server";
import { isDiagnosticSessionId } from "../features/diagnostic/contracts";
import { validateAnswersPayload } from "../features/diagnostic/persistence";

import type { Route } from "./+types/api-diagnostic-session-complete";

/**
 * DIAG-V3-06 §26/§27/§28/§29: el cliente nunca es autoridad de scores/estado/recomendaciones. El
 * servidor valida, deriva las respuestas activas, ejecuta el motor real y persiste ese resultado en
 * una única transacción D1 (`completeDiagnosticSession`). Idempotente: repetir la misma finalización
 * devuelve el resultado ya guardado; un payload distinto sobre una sesión ya completada es 409.
 * El snapshot de KV solo se borra DESPUÉS de confirmar D1, y de forma best-effort.
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const sessionId = params.sessionId;
  if (!isDiagnosticSessionId(sessionId)) return Response.json({ error: "Invalid session id" }, { status: 400 });

  let body: unknown;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return Response.json({ error: error.message }, { status: 413 });
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const candidate = body as { writeToken?: unknown; answers?: unknown };
  if (typeof candidate.writeToken !== "string") return Response.json({ error: "writeToken is required" }, { status: 400 });

  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  const session = await getDiagnosticSessionById(database, sessionId);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  if (!(await verifyWriteToken(candidate.writeToken, session.tokenHash))) {
    return Response.json({ error: "Invalid session credentials" }, { status: 403 });
  }

  // El cliente puede enviar `answers`, pero nunca un score/estado/recomendación: solo se lee la
  // clave `answers`; cualquier otro campo del cuerpo (por ejemplo un `result` inventado) se ignora.
  const answers = validateAnswersPayload(candidate.answers);
  if (!answers.ok) return Response.json({ error: answers.error }, { status: 400 });

  let outcome;
  try {
    outcome = await completeDiagnosticSession(database, { sessionId, rawAnswers: answers.answers });
  } catch (error) {
    if (error instanceof DiagnosticCompletionConflictError) return Response.json({ error: error.message }, { status: 409 });
    if (error instanceof DiagnosticSessionError) return Response.json({ error: error.message }, { status: 400 });
    throw error;
  }

  if (outcome.status === "completed") {
    // Orden fijo (spec §29): D1 primero, confirmado; el borrado de KV es best-effort y nunca revierte la finalización.
    await deleteDiagnosticSnapshotBestEffort(env.DIAGNOSTIC_SNAPSHOTS, sessionId);
  }

  return Response.json({ status: outcome.status, result: outcome.result });
}
