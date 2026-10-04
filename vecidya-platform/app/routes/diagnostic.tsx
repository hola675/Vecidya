import { DiagnosticFlow, START_COPY } from "../components/diagnostic-flow";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";

import type { Route } from "./+types/diagnostic";

/**
 * DIAG-V3-13 — diagnóstico público. Reemplaza la implementación QBV1 (7 dimensiones, persistencia en
 * servidor, continuación entre dispositivos con un código de un solo uso, analítica anónima — nunca
 * desplegada; `DIAG-V3-06`/`07`/`08` seguían «sin deploy») por el motor adaptativo V3 congelado
 * (DIAG-V3-08…12: ocho áreas, índice de presencia, confianza, prioridades, recomendaciones,
 * metodología 1.0 e informe PDF), ya probado en la ruta privada `/__dev/diagnostico/v3`. Mismo
 * componente (`DiagnosticFlow`), sin panel de depuración: la URL pública nunca acepta `?debug=1`.
 * Persistencia solo en este navegador (`localStorage`, 14 días); sin backend para el diagnóstico en
 * este lanzamiento (ver `docs/ARCHITECTURE.md`).
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    START_COPY.metaDescription,
    DIAGNOSTIC_PATH,
  );
}

export default function Diagnostic() {
  return (
    <PublicLayout>
      <main className="df-page">
        <DiagnosticFlow />
      </main>
    </PublicLayout>
  );
}
