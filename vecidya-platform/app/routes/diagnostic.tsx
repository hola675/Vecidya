import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/qa03b-diagnostic-flow";
import { ANONYMOUS_START_COPY } from "../components/diagnostic-flow/flow-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";
import { cloudflareContext } from "../../server/cloudflare-context";
import { isIdentifiedReportJourneyAvailable } from "../features/diagnostic/identified-report-availability.server";

import type { Route } from "./+types/diagnostic";

/**
 * ACT-04 — cuestionario adaptativo QA-03B. Mantiene sesiones V3 históricas en su clave anterior;
 * las nuevas usan banco reviewed-evidence-v8, sesión schema/key 8 y replay qa03b-worker-replay-v6.
 * El Worker reconstruye el resumen anónimo.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    ANONYMOUS_START_COPY.metaDescription,
    DIAGNOSTIC_PATH,
  );
}

export function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { identifiedReportAvailable: isIdentifiedReportJourneyAvailable(env) };
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
