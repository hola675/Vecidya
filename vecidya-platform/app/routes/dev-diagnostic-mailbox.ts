import { readDiagnosticDevInbox } from "../../server/email/diagnostic-dev-inbox.server";
import { isRequestId } from "../features/diagnostic/identified-report-contracts";

import type { LoaderFunctionArgs } from "react-router";

export function loader({ params }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV || !params.requestId || !isRequestId(params.requestId)) throw new Response("Not Found", { status: 404 });
  const message = readDiagnosticDevInbox(params.requestId);
  if (!message) throw new Response("Not Found", { status: 404 });
  return Response.json(message, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
