import type { DiagnosticResultV3 } from "./qbv2-session";

import type { AnonymousDiagnosticSummaryV1 } from "./anonymous-summary";

const confidenceNote = (
  state: DiagnosticResultV3["outcome"]["overall"]["state"],
  confidence: DiagnosticResultV3["outcome"]["overall"]["confidence"]["level"],
) => {
  if (state === "insufficient") {
    return "Aún no hay evidencia suficiente para mostrar un porcentaje fiable. Las áreas sin información suficiente permanecen abiertas.";
  }
  if (confidence === "low") {
    return "Aunque el porcentaje pueda ser alto, la evidencia disponible es limitada. Tómalo como orientación preliminar, no como una evaluación confirmada.";
  }
  if (confidence === "medium") {
    return "Esta lectura se apoya en la cobertura disponible. Confirma los datos clave antes de tomar decisiones importantes.";
  }
  return "La evidencia disponible permite una lectura de mayor confianza; sigue siendo una orientación basada en tus respuestas.";
};

/** Proyecta solo el resumen permitido; nunca devuelve dimensiones, evidencias, ofertas ni el resultado completo. */
export function toAnonymousDiagnosticSummaryV1(result: DiagnosticResultV3): AnonymousDiagnosticSummaryV1 {
  const { overall, recommendations } = result.outcome;
  const headline = result.narrative.executiveSummary[0]?.text ?? result.narrative.currentState.text;
  const constraint = result.narrative.primaryConstraint;
  const priority = result.narrative.priorities[0];
  const focusDimension = constraint?.dimension
    ? result.narrative.dimensions.find((dimension) => dimension.dimension === constraint.dimension)
    : undefined;
  const focus = constraint
    ? { title: focusDimension?.label ?? "Punto por confirmar", description: constraint.text }
    : priority
      ? { title: "Tu prioridad principal", description: priority.statement.text }
      : null;
  const firstRecommendation = recommendations.items[0];
  const confidence = overall.confidence.level;
  const applicable = overall.index.applicable;
  const assessed = overall.index.assessed;

  return {
    version: 1,
    score: overall.index.displayScore,
    state: overall.state,
    confidence,
    preliminary: overall.provisional || confidence === "low",
    headline,
    currentState: result.narrative.currentState.text === headline ? null : result.narrative.currentState.text,
    focus,
    firstAction: firstRecommendation
      ? { title: firstRecommendation.title, description: firstRecommendation.whatToImprove }
      : null,
    coverageNote: applicable > 0
      ? "Lectura suficiente en " + assessed + " de " + applicable + " ámbitos aplicables."
      : "Todavía no hay ámbitos aplicables con evidencia suficiente.",
    confidenceNote: confidenceNote(overall.state, confidence),
  };
}
