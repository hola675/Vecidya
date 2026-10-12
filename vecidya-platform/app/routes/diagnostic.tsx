import { AnonymousDiagnosticFlow } from "../components/diagnostic-flow/anonymous-diagnostic-flow";
import { ANONYMOUS_START_COPY } from "../components/diagnostic-flow/flow-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";

import type { Route } from "./+types/diagnostic";

/**
 * DIAG-V3-13 / FUNNEL-01B — cuestionario adaptativo V3 y resumen anónimo. El navegador conserva
 * respuestas en `localStorage` durante 14 días; al completar, las envía al Worker para recalcular
 * la ruta vigente y devolver solo la proyección allowlisted. El Worker no persiste respuestas ni
 * resultado. El informe detallado no tiene ruta pública hasta implementar identificación.
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
        <AnonymousDiagnosticFlow />
      </main>
    </PublicLayout>
  );
}
