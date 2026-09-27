import { createDatabase } from "../../db/client.server";
import { createDiagnosticSession } from "../../db/queries/diagnostic-sessions.server";
import { generateWriteToken, hashWriteToken } from "../../server/diagnostic/session-security.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { CURRENT_PERSISTED_VERSIONS } from "../features/diagnostic";

import type { Route } from "./+types/api-diagnostic-sessions";

/**
 * DIAG-V3-06 §31: crea una sesión anónima. No requiere sesión de Better Auth, no crea
 * Contact/User/Organization. El `writeToken` se genera aquí y se devuelve una única vez; D1 solo
 * guarda su hash (`session-security.server.ts`).
 */
export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  const writeToken = generateWriteToken();
  const tokenHash = await hashWriteToken(writeToken);

  try {
    const created = await createDiagnosticSession(database, { tokenHash, versions: CURRENT_PERSISTED_VERSIONS });
    return Response.json({ sessionId: created.id, writeToken, versions: created.versions, status: created.status }, { status: 201 });
  } catch {
    // D1 no disponible: el diagnóstico puede continuar en modo solo-navegador (spec §38). No se
    // inventa una promesa de persistencia; el cliente decide cómo seguir sin sesión de servidor.
    return Response.json({ error: "Session storage is temporarily unavailable" }, { status: 503 });
  }
}
