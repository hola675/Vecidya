import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/qa03b-diagnostic-flow";
import { ANONYMOUS_START_COPY } from "../components/diagnostic-flow/flow-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";

import type { Route } from "./+types/diagnostic";

/**
 * ACT-04 — cuestionario adaptativo QA-03B. Mantiene sesiones V3 históricas en su clave anterior;
 * las nuevas sesiones usan identidad/schema 3 y el Worker reconstruye el resumen anónimo.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    ANONYMOUS_START_COPY.metaDescription,
    DIAGNOSTIC_PATH,
  );
}

export default function Diagnostic() {
  return (
    <PublicLayout>
      <main className="df-page">
        <CandidateDiagnosticFlow publicMode />
      </main>
    </PublicLayout>
  );
}
