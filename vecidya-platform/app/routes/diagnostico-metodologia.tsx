import { MethodologyArticle } from "../components/diagnostic-methodology";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/diagnostico-metodologia";

/**
 * DIAG-V3-13 — metodología y fuentes del diagnóstico, pública desde el corte (antes solo en la ruta
 * de pruebas DIAG-V3-11). Contenido evergreen, indexable: explica cómo
 * funciona el diagnóstico sin depender de un resultado concreto.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Metodología del diagnóstico",
    "Cómo evalúa Vecidya tu presencia digital: las ocho áreas, el índice, la confianza, la ruta adaptativa, las prioridades y las fuentes externas que respaldan el método.",
    "/diagnostico/metodologia",
  );
}

export default function DiagnosticoMetodologia() {
  return (
    <PublicLayout>
      <main className="dm-page">
        <MethodologyArticle />
      </main>
    </PublicLayout>
  );
}
