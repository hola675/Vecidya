import {
  CANDIDATE_METHODOLOGY_IDENTITY_V3,
  CANDIDATE_METHODOLOGY_LIMITATIONS_V3,
  CANDIDATE_METHODOLOGY_REPORT_NOTES_V3,
} from "./candidate-methodology-content";
import { REPORT_TITLE, REPORT_VERSION } from "../diagnostic-report/report-model";
import type { CandidateDiagnosticReportV1, ReportDimension } from "../diagnostic-report/report-model";
import {
  areaItems, CERTAINTY_DISPLAY, CONFIDENCE_DISPLAY, dimensionDisplay, dimensionLabelOf, LIFECYCLE_DISPLAY, PROFILE_DISPLAY,
  riskItems, strengthItems, uncertaintyGroups,
} from "../diagnostic-result/presentation";
import { METHODOLOGY_SOURCES, METHODOLOGY_VERSION } from "../../features/diagnostic/qbv2-methodology";
import { CANDIDATE_RESULT_IDENTITY_V3, type CandidatePipelineResultV3 } from "../../features/diagnostic/qbv2-candidate-pipeline";

export type CandidateResultPresentationV3 = {
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly profileLabel: string;
  readonly lifecycleLabel: string;
  readonly lifecycle: CandidatePipelineResultV3["narrative"]["lifecycle"];
  readonly overall: {
    readonly label: string;
    readonly publicLabel: "MAL" | "REGULAR" | "BIEN" | null;
    readonly score: number | null;
    readonly confidence: string;
    readonly provisional: boolean;
    readonly explanation: string;
    readonly coverage: string;
    readonly warning: string | null;
  };
  readonly executiveSummary: readonly string[];
  readonly currentState: string;
  readonly strengths: readonly { readonly label: string; readonly text: string }[];
  readonly areasToStrengthen: readonly { readonly label: string; readonly text: string }[];
  readonly risks: readonly { readonly label: string; readonly text: string }[];
  readonly contradictions: readonly string[];
  readonly uncertainties: readonly { readonly title: string; readonly items: readonly string[] }[];
  readonly priorities: readonly { readonly rank: number; readonly slot: string; readonly area: string; readonly statement: string; readonly why: string; readonly certainty: string }[];
  readonly dimensions: readonly (ReportDimension & { readonly context: NonNullable<ReportDimension["context"]>; readonly includedInCoverage: boolean })[];
  readonly recommendations: readonly {
    readonly rank: number;
    readonly title: string;
    readonly area: string;
    readonly mode: string;
    readonly whatToImprove: string;
    readonly whyItMatters: string;
    readonly expectedOutcome: string;
    readonly certainty: string;
    readonly conditions: readonly string[];
    readonly solution: { readonly label: string; readonly description: string } | null;
  }[];
  readonly commercial: {
    readonly licenseName: string | null;
    readonly certainty: string;
    readonly rationale: string;
    readonly whyNotLower: string;
    readonly whyNotHigher: string;
    readonly unresolvedSignals: readonly string[];
    readonly now: readonly { readonly name: string; readonly kind: string; readonly rationale: string; readonly priceLabel: string | null }[];
    readonly later: readonly { readonly name: string; readonly kind: string; readonly rationale: string; readonly priceLabel: string | null }[];
  };
};

const DIMENSION_OBSERVABILITY_LABEL: Readonly<Record<CandidatePipelineResultV3["overall"]["index"]["dimensionObservability"][number]["reason"], string>> = {
  not_applicable: "No aplica según el contexto",
  context_unresolved: "Contexto insuficiente para determinar si aplica",
  no_direct_source_in_bank: "Vacío del instrumento: no hay pregunta directa en el banco candidato",
  no_direct_source_in_context: "No observable en este contexto: no hay una oportunidad directa pertinente",
  direct_source_reachable: "Observable: hay una oportunidad directa en el plan adaptativo",
  observed_direct: "Observable y observada: hay evidencia directa en las respuestas",
  respondent_unknown: "La respuesta indica que no se sabe; no puntúa como debilidad",
  respondent_not_applicable: "La persona respondió N/A; no puntúa como capacidad ni como fallo",
  respondent_non_scoring_answer: "La respuesta no aporta una lectura puntuable",
  budget_blocked: "La pregunta directa quedó fuera por presupuesto; persiste un límite de evidencia",
  hard_cap_blocked: "La pregunta directa quedó fuera por límite de ruta; persiste un límite de evidencia",
};

const LICENSE_LABEL: Readonly<Record<NonNullable<CandidatePipelineResultV3["commercial"]["licenseFit"]["recommendedLicense"]>, string>> = {
  cuadra: "Cuadra", barrio: "Barrio", ciudad: "Ciudad",
};
const LICENSE_CERTAINTY: Readonly<Record<CandidatePipelineResultV3["commercial"]["licenseFit"]["confidence"], string>> = {
  high: "Alta", medium: "Media", to_confirm: "Pendiente de confirmación",
};
const RECOMMENDATION_MODE: Readonly<Record<CandidatePipelineResultV3["recommendations"]["items"][number]["mode"], string>> = {
  improve: "Mejorar", verify: "Confirmar primero", prepare: "Preparar antes del lanzamiento", reduce_dependency: "Reducir una dependencia",
};

function recommendationConditions(result: CandidatePipelineResultV3, recommendationId: string): string[] {
  const recommendation = result.recommendations.items.find((item) => item.id === recommendationId);
  if (!recommendation) throw new Error(`La recomendación ${recommendationId} no está en el resultado candidato.`);
  return recommendation.prerequisites.filter((item) => !item.satisfied).map((item) => {
    const area = dimensionLabelOf(result.narrative, item.dimension) ?? item.dimension;
    const prerequisite = item.recommendationId ? result.recommendations.items.find((candidate) => candidate.id === item.recommendationId) : undefined;
    return prerequisite
      ? `Antes, completa «${prerequisite.title}».`
      : `Condición pendiente en ${area}.`;
  });
}

export function buildCandidateResultPresentationV3(result: CandidatePipelineResultV3): CandidateResultPresentationV3 {
  if (result.engineIdentity !== CANDIDATE_RESULT_IDENTITY_V3) throw new Error("La identidad del resultado no corresponde al contrato candidato vigente.");
  const index = result.overall.index;
  const observability = new Map(index.dimensionObservability.map((item) => [item.dimension, item]));
  const coverage = index.coverageDenominator > 0
    ? `${index.scoredDimensions.length} de ${index.coverageDenominator} dimensiones observables con oportunidad directa tienen lectura (${Math.round(index.coverage * 100)} %).`
    : "No se calcula cobertura contextual: no hay dimensiones aplicables con oportunidad directa útil en esta ruta.";
  const warning = result.overall.provisional
    ? "El índice es provisional por confianza limitada; la banda se conserva y conviene confirmar la evidencia indicada."
    : result.overall.caveat?.reason === "limited_confidence"
      ? "La confianza es limitada; revisa las incertidumbres antes de actuar."
      : result.overall.caveat?.reason === "material_constraint"
        ? "El estado general no reemplaza las prioridades: existe una restricción material identificada por el motor."
        : null;
  const dimensions = result.narrative.dimensions.map((dimension) => {
    const observation = observability.get(dimension.dimension);
    if (!observation) throw new Error(`Falta el estado O6 de ${dimension.dimension}.`);
    const display = dimensionDisplay(dimension);
    return {
      key: dimension.dimension,
      icon: display.icon,
      label: dimension.label,
      status: dimension.status,
      statusLabel: display.statusLabel,
      score: dimension.score,
      percent: display.percent,
      confidence: display.confidence,
      preliminary: display.preliminary,
      interpretation: dimension.interpretation.text,
      evidenceLead: display.evidenceLead,
      evidenceTopics: dimension.evidence.map((entry) => entry.topic),
      context: {
        applicability: observation.applicability === "applicable" ? "Aplicable" : observation.applicability === "not_applicable" ? "No aplicable" : "Contexto insuficiente",
        observability: DIMENSION_OBSERVABILITY_LABEL[observation.reason],
        directEvidence: observation.observedDirect ? "Evidencia directa observada" : "Sin evidencia directa observada",
      },
      includedInCoverage: index.observableApplicableDimensions.includes(dimension.dimension),
    };
  });
  const recommendations = result.recommendations.items.map((item, index) => {
    const solution = result.solutions[index];
    if (!solution || solution.recommendationId !== item.id) throw new Error("Las soluciones candidatas no corresponden, en orden, a las recomendaciones del motor.");
    return {
      rank: item.rank,
      title: item.title,
      area: dimensionLabelOf(result.narrative, item.dimension) ?? item.dimension,
      mode: RECOMMENDATION_MODE[item.mode],
      whatToImprove: item.whatToImprove,
      whyItMatters: item.whyItMatters,
      expectedOutcome: item.expectedOutcome,
      certainty: CERTAINTY_DISPLAY[item.certainty],
      conditions: recommendationConditions(result, item.id),
      solution: solution.solution ? { label: solution.solution.label, description: solution.solution.description } : null,
    };
  });
  const commercial = result.commercial;
  return {
    engineIdentity: result.engineIdentity,
    profileLabel: PROFILE_DISPLAY[result.narrative.profile],
    lifecycleLabel: LIFECYCLE_DISPLAY[result.narrative.lifecycle],
    lifecycle: result.narrative.lifecycle,
    overall: {
      label: result.overall.label,
      publicLabel: result.overall.publicLabel,
      score: index.displayScore,
      confidence: CONFIDENCE_DISPLAY[result.overall.confidence.level].label,
      provisional: result.overall.provisional,
      explanation: result.overall.explanation.text,
      coverage,
      warning,
    },
    executiveSummary: result.narrative.executiveSummary.map((item) => item.text),
    currentState: result.narrative.currentState.text,
    strengths: strengthItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    areasToStrengthen: areaItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    risks: riskItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    contradictions: result.narrative.contradictions.map((item) => item.text),
    uncertainties: uncertaintyGroups(result.narrative).map((group) => ({ title: group.title, items: group.items.map((item) => item.text) })),
    priorities: result.narrative.priorities.map((item) => ({
      rank: item.rank, slot: item.slot, area: dimensionLabelOf(result.narrative, item.dimension) ?? item.dimension,
      statement: item.statement.text, why: item.why.text, certainty: CERTAINTY_DISPLAY[item.certainty],
    })),
    dimensions,
    recommendations,
    commercial: {
      licenseName: commercial.licenseFit.recommendedLicense ? LICENSE_LABEL[commercial.licenseFit.recommendedLicense] : null,
      certainty: LICENSE_CERTAINTY[commercial.licenseFit.confidence],
      rationale: commercial.licenseFit.rationale,
      whyNotLower: commercial.licenseFit.whyNotLower,
      whyNotHigher: commercial.licenseFit.whyNotHigher,
      unresolvedSignals: commercial.licenseFit.unresolvedSignals,
      now: [...commercial.now.complements, ...commercial.now.services].map((item) => ({ name: item.name, kind: item.kind === "complement" ? "Complemento" : "Servicio", rationale: item.rationale, priceLabel: item.priceLabel })),
      later: [...commercial.later.complements, ...commercial.later.services].map((item) => ({ name: item.name, kind: item.kind === "complement" ? "Complemento" : "Servicio", rationale: item.rationale, priceLabel: item.priceLabel })),
    },
  };
}

const longDate = (date: Date) => new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(date);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function buildCandidateDiagnosticReportV1(result: CandidatePipelineResultV3, completedAt: Date, generatedAt: Date = new Date()): CandidateDiagnosticReportV1 {
  const view = buildCandidateResultPresentationV3(result);
  const narrative = result.narrative;
  const constraint = narrative.primaryConstraint;
  const primaryDimension = constraint ? narrative.dimensions.find((item) => item.dimension === constraint.dimension) : undefined;
  const contextualDimensions = view.dimensions.map((dimension) => ({ ...dimension, context: dimension.context }));
  const methodText = CANDIDATE_METHODOLOGY_REPORT_NOTES_V3;
  return {
    reportVersion: REPORT_VERSION,
    methodologyVersion: METHODOLOGY_VERSION,
    generatedAt: isoDate(generatedAt),
    generatedLabel: longDate(generatedAt),
    completedAt: isoDate(completedAt),
    completedLabel: longDate(completedAt),
    identity: {
      title: REPORT_TITLE,
      businessName: null,
      profileLabel: view.profileLabel,
      lifecycleLabel: view.lifecycleLabel,
      dateLabel: "Fecha de finalización del diagnóstico",
    },
    overallPresence: {
      state: result.overall.state,
      publicLabel: result.overall.publicLabel,
      label: result.overall.label,
      percent: result.overall.index.displayScore === null ? null : `${result.overall.index.displayScore}%`,
      explanation: result.overall.explanation.text,
      confidence: { label: view.overall.confidence, steps: CONFIDENCE_DISPLAY[result.overall.confidence.level].steps },
      coverage: view.overall.coverage,
    },
    executiveSummary: {
      headline: view.executiveSummary[0] ?? null,
      lead: view.executiveSummary.slice(1),
      currentState: view.currentState,
    },
    primaryConstraint: constraint && primaryDimension
      ? { kicker: constraint.certainty === "unknown" ? "Conviene confirmar primero" : "Atención prioritaria", title: primaryDimension.label, text: constraint.text, certaintyLabel: CERTAINTY_DISPLAY[constraint.certainty], confidenceLabel: CONFIDENCE_DISPLAY[primaryDimension.confidence].label }
      : { kicker: "Lectura del resultado", title: "No hay una restricción principal confirmada", text: narrative.nextFocus.text, certaintyLabel: null, confidenceLabel: null },
    priorities: view.priorities.map((item) => ({ rank: item.rank, slotLabel: item.slot === "primary" ? "Prioridad principal" : item.slot === "secondary" ? "Prioridad secundaria" : "Prioridad de apoyo", area: item.area, statement: item.statement, why: item.why, certaintyLabel: item.certainty })),
    nextFocus: narrative.priorities.length <= 1 && constraint ? narrative.nextFocus.text : null,
    actionPath: {
      steps: view.recommendations.map((item) => ({ step: item.rank, title: item.title, tag: item.mode, area: item.area, after: [] })),
      emptyNote: view.recommendations.length === 0 ? "No hay una acción respaldada que debamos recomendar todavía." : null,
    },
    strengths: view.strengths,
    areasToStrengthen: view.areasToStrengthen,
    risks: view.risks,
    mixedSignals: view.contradictions,
    uncertainties: view.uncertainties,
    dimensionNotes: [view.overall.coverage, ...(view.overall.warning ? [view.overall.warning] : [])],
    dimensions: contextualDimensions,
    recommendations: view.recommendations.map((item) => ({
      step: item.rank, title: item.title, area: item.area,
      tag: item.mode, whatToImprove: item.whatToImprove, whyItMatters: item.whyItMatters, expectedOutcome: item.expectedOutcome,
      solution: item.solution, conditions: item.conditions,
    })),
    methodologySummary: {
      version: METHODOLOGY_VERSION,
      notes: methodText,
      sourcesNote: "Las fuentes citadas informan por qué importan las áreas digitales; no validan estadísticamente la fórmula ni predicen resultados empresariales.",
      formulaDistinction: `El resultado conserva la identidad ${CANDIDATE_METHODOLOGY_IDENTITY_V3}.`,
    },
    sources: METHODOLOGY_SOURCES.map((source, index) => ({ number: index + 1, title: source.title, organization: source.organization, year: source.publishedAt?.slice(0, 4) ?? null, url: source.url })),
    limitations: CANDIDATE_METHODOLOGY_LIMITATIONS_V3,
    disclaimer: "Este informe es una orientación basada en tus respuestas. No es una auditoría ni una garantía de resultados.",
    candidateEngineIdentity: result.engineIdentity,
    candidateCommercial: {
      licenseName: view.commercial.licenseName,
      certainty: view.commercial.certainty,
      rationale: view.commercial.rationale,
      whyNotLower: view.commercial.whyNotLower,
      whyNotHigher: view.commercial.whyNotHigher,
      unresolvedSignals: view.commercial.unresolvedSignals,
      now: view.commercial.now,
      later: view.commercial.later,
      monthlyLicenseUsd: result.commercial.cost.monthlyLicenseUsd,
      activationUsd: result.commercial.cost.activationUsd,
      externalUsageCategories: result.commercial.cost.externalUsage.map((item) => item.category),
    },
  };
}
