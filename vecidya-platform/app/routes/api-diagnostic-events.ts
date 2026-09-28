import { createDatabase } from "../../db/client.server";
import { countAnalyticsEventsForSession, insertAnalyticsEventBatch } from "../../db/queries/diagnostic-analytics.server";
import { getDiagnosticSessionById } from "../../db/queries/diagnostic-sessions.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { validateAnalyticsBatch } from "../../server/diagnostic/analytics-validation.server";
import { readBoundedJsonBody, RequestTooLargeError } from "../../server/diagnostic/request-validation.server";
import { verifyWriteToken } from "../../server/diagnostic/session-security.server";
import { isDiagnosticSessionId } from "../features/diagnostic/contracts";
import { MAX_ANALYTICS_EVENTS_PER_SESSION } from "../features/diagnostic/analytics";

import type { Route } from "./+types/api-diagnostic-events";

const NO_STORE = { "cache-control": "no-store" };

/**
 * DIAG-V3-08 §26/§27/§64: ingestión de telemetría, autenticada por `sessionId` + `writeToken` — mismo
 * contrato que snapshot/save/complete (nunca `sessionId` solo, spec §26). Best-effort desde la
 * perspectiva del producto (spec §2/§30): un fallo aquí SIEMPRE responde un status HTTP correcto (nunca
 * cuelga ni lanza sin capturar), pero el diagnóstico en sí nunca depende de esta ruta para avanzar — esa
 * garantía vive del lado cliente (la cola de `analytics-queue.ts` nunca bloquea `answer()`).
 *
 * `Cache-Control: no-store` se aplica en TODA respuesta (incluyendo errores tempranos), igual que
 * `api-diagnostic-session-save.ts`/`api-diagnostic-recover.ts` — más simple de mantener correcto que
 * condicionarlo por rama.
 */
export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: NO_STORE });

  let body: unknown;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return Response.json({ error: error.message }, { status: 413, headers: NO_STORE });
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: NO_STORE });
  }

  if (typeof body !== "object" || body === null) return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: NO_STORE });
  const candidate = body as { sessionId?: unknown; writeToken?: unknown };
  if (!isDiagnosticSessionId(candidate.sessionId)) return Response.json({ error: "Invalid session id" }, { status: 400, headers: NO_STORE });
  if (typeof candidate.writeToken !== "string") return Response.json({ error: "writeToken is required" }, { status: 400, headers: NO_STORE });

  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  let session;
  try {
    session = await getDiagnosticSessionById(database, candidate.sessionId);
  } catch {
    return Response.json({ error: "Session storage is temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
  if (!session) return Response.json({ error: "Session not found" }, { status: 404, headers: NO_STORE });
  if (!(await verifyWriteToken(candidate.writeToken, session.tokenHash))) {
    return Response.json({ error: "Invalid session credentials" }, { status: 403, headers: NO_STORE });
  }

  const validated = validateAnalyticsBatch(body);
  if (!validated.ok) return Response.json({ error: validated.error }, { status: 400, headers: NO_STORE });

  // Spec §29/§65: cupo por sesión, generoso para el uso normal (10-16 preguntas típicas), sin romper
  // el producto — se descarta el excedente, nunca se rechaza el batch completo ni se devuelve 500.
  // El conteo vive dentro del mismo try que la inserción: un fallo de D1 aquí también es un 503 con
  // `no-store`, nunca una excepción sin capturar (500 sin la cabecera).
  try {
    const alreadyStored = await countAnalyticsEventsForSession(database, candidate.sessionId);
    const remainingCapacity = Math.max(0, MAX_ANALYTICS_EVENTS_PER_SESSION - alreadyStored);
    const accepted = validated.events.slice(0, remainingCapacity).map((event) => ({ ...event, sessionId: candidate.sessionId as string }));
    const dropped = validated.events.length - accepted.length;
    const { inserted } = await insertAnalyticsEventBatch(database, accepted);
    return Response.json({ accepted: inserted, dropped }, { headers: NO_STORE });
  } catch {
    return Response.json({ error: "Analytics storage is temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
}
