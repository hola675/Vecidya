import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/qa03b-diagnostic-flow";
import { ANONYMOUS_START_COPY } from "../components/diagnostic-flow/flow-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import { Link } from "react-router";
import { isIdentifiedReportJourneyAvailable } from "../features/diagnostic/identified-report-availability.server";

import type { Route } from "./+types/diagnostic";

/**
 * ACT-04 — cuestionario adaptativo QA-03B. Mantiene sesiones históricas en sus claves anteriores;
 * las nuevas sesiones usan el contrato de banco v8, schema/key 8 y replay v6.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    ANONYMOUS_START_COPY.metaDescription,
    DIAGNOSTIC_PATH,
  );
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  let authenticatedUser: { name: string } | null = null;
  let authStatus: "authenticated" | "anonymous" | "unavailable" = "anonymous";
  try {
    const session = await getSession(env, request);
    authenticatedUser = session ? { name: session.user.name } : null;
    authStatus = session ? "authenticated" : "anonymous";
  } catch {
    authStatus = "unavailable";
  }
  return {
    identifiedReportAvailable: isIdentifiedReportJourneyAvailable(env),
    authenticatedUser,
    authStatus,
  };
}

export default function Diagnostic({ loaderData }: Route.ComponentProps) {
  return (
    <PublicLayout>
      <main className="df-page">
        <CandidateDiagnosticFlow publicMode reportRequestEnabled={loaderData.identifiedReportAvailable} />
      </main>
    </PublicLayout>
  );
}
