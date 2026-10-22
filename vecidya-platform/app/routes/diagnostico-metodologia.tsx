import { CandidateMethodologyArticle } from "../components/diagnostic-flow/qa03b-methodology";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/diagnostico-metodologia";

/**
 * ACT-04 — metodología pública del Diagnóstico de Vecidya.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Metodología del diagnóstico",
    "Cómo funciona el Diagnóstico de Vecidya: la ruta adaptativa, la evidencia, la confianza, las prioridades y los límites de la evaluación.",
    "/diagnostico/metodologia",
  );
}

export default function DiagnosticoMetodologia() {
  return (
    <PublicLayout>
      <main className="dm-page">
        <CandidateMethodologyArticle />
      </main>
    </PublicLayout>
  );
}
