import { readDiagnosticDevInbox } from "../../server/email/diagnostic-dev-inbox.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { isRequestId } from "../features/diagnostic/identified-report-contracts";

import type { LoaderFunctionArgs } from "react-router";

export async function loader({ context, params }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV || !params.requestId || !isRequestId(params.requestId)) throw new Response("Not Found", { status: 404 });
  const { env } = context.get(cloudflareContext);
  const now = Date.now();
  const activeChallenge = await env.DB.prepare(`SELECT c.id
    FROM verified_email_challenge c
    INNER JOIN identified_diagnostic_request r ON r.id = c.request_id
    INNER JOIN diagnostic_report_snapshot s ON s.request_id = r.id
    WHERE c.request_id = ? AND c.status = 'pending' AND c.expires_at > ?
      AND r.email = 'qa-funnel@example.invalid' AND r.expires_at > ? AND s.expires_at > ?
      AND ((r.status = 'verification_pending' AND c.purpose = 'verification') OR (r.status = 'verified' AND c.purpose = 'access_recovery'))
    ORDER BY c.issued_at DESC LIMIT 1`).bind(params.requestId, now, now, now).first<{ id: string }>();
  if (!activeChallenge) throw new Response("Not Found", { status: 404 });
  const message = readDiagnosticDevInbox(params.requestId, activeChallenge.id);
  if (!message) throw new Response("Not Found", { status: 404 });
  return Response.json(message, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
