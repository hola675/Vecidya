import {
  CANDIDATE_METHODOLOGY_LIMITATIONS_V3,
  CANDIDATE_METHODOLOGY_IDENTITY_V3,
  CANDIDATE_METHODOLOGY_REPORT_NOTES_V3,
} from "./qa03b-methodology-content";
import { CANDIDATE_REPORT_VERSION, REPORT_TITLE } from "../diagnostic-report/report-model";
import type { CandidateDiagnosticReportV1, ReportDimension } from "../diagnostic-report/report-model";
import {
  areaItems, CERTAINTY_DISPLAY, CONFIDENCE_DISPLAY, dimensionDisplay, dimensionLabelOf, LIFECYCLE_DISPLAY, PROFILE_DISPLAY,
  riskItems, strengthItems, uncertaintyGroups,
} from "../diagnostic-result/presentation";
import { METHODOLOGY_SOURCES } from "../../features/diagnostic/qbv2-methodology";
import { CANDIDATE_RESULT_IDENTITY_V3, type CandidatePipelineResultV3 } from "../../features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../features/diagnostic/qa03b/bank";
import { renderQuestionV2 } from "../../features/diagnostic/qa03b/copy";

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
    readonly verificationStatus: string;
    readonly howToVerify: string;
    readonly evidence: readonly { readonly question: string; readonly answer: string }[];
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
  not_applicable: "Por el contexto, esta área no corresponde.",
  context_unresolved: "Falta contexto para saber si esta área corresponde.",
  no_direct_source_in_bank: "El cuestionario todavía no incluye una pregunta pertinente para esta área.",
  no_direct_source_in_context: "En este contexto no se encontró una pregunta pertinente para esta área.",
  direct_source_reachable: "Esta área podía evaluarse en el recorrido.",
  observed_direct: "Esta área se evaluó con las respuestas disponibles.",
  respondent_unknown: "Se indicó que no se sabe; no se toma como una dificultad.",
  respondent_not_applicable: "Se indicó que no aplica; no se toma como una dificultad.",
  respondent_non_scoring_answer: "La respuesta no permite obtener una lectura.",
  budget_blocked: "No se preguntó sobre esta área por límite de preguntas; queda sin confirmar.",
  hard_cap_blocked: "No se preguntó sobre esta área por límite del recorrido; queda sin confirmar.",
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
const RECOMMENDATION_VERIFICATION: Readonly<Record<CandidatePipelineResultV3["recommendations"]["items"][number]["mode"], string>> = {
  improve: "Brecha observada",
  verify: "Pendiente de confirmar",
  prepare: "Por definir antes del lanzamiento",
  reduce_dependency: "Dependencia observada",
};
const RECOMMENDATION_CHECK: Readonly<Record<CandidatePipelineResultV3["recommendations"]["items"][number]["type"], string>> = {
  clarity: "Pide a alguien que no conozca tu oferta que explique qué ofreces y cuál sería el siguiente paso.",
  foundation: "Comprueba desde fuera que la información esencial esté actualizada y que el canal de contacto funcione.",
  discovery: "Registra de qué vías llegan las consultas y revisa qué pasó con cada una al cierre del periodo.",
  trust: "Verifica que las señales de confianza que muestras sean reales, vigentes y estén autorizadas.",
  conversion: "Prueba el recorrido desde el primer contacto hasta la compra o la cita y anota dónde se detiene.",
  follow_up: "En la próxima revisión, comprueba si cada contacto relevante tiene una persona responsable y un siguiente paso registrados.",
  measurement: "En el siguiente ciclo, comprueba que registras el resultado de cada oportunidad y lo revisas para decidir; no deduzcas una tasa si falta su periodo o denominador.",
  readiness: "Pide a quien realiza el trabajo que encuentre la información vigente y complete el siguiente paso sin ayuda.",
};

const COMMERCIAL_SIGNAL_DISPLAY: Readonly<Record<string, string>> = {
  operational_commercial_evidence: "Necesidad comercial todavía no confirmada",
  single_process_or_multiple_coordinated_processes: "Alcance de los procesos comerciales todavía por confirmar",
};

const OVERALL_BAND_DISPLAY: Readonly<Record<NonNullable<CandidatePipelineResultV3["overall"]["publicLabel"]>, string>> = {
  BIEN: "Base favorable en las áreas observadas",
  REGULAR: "Áreas que conviene reforzar",
  MAL: "Varias áreas requieren atención",
};

function dimensionsWithDirectScore(result: CandidatePipelineResultV3): ReadonlySet<CandidatePipelineResultV3["scoring"]["dimensions"][number]["id"]> {
  return new Set(result.scoring.dimensions
    .filter((dimension) => dimension.score !== null && dimension.evidence.some((evidence) => evidence.directness === "direct" && evidence.contribution !== null))
    .map((dimension) => dimension.id));
}

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

function recommendationEvidence(result: CandidatePipelineResultV3, recommendationId: string): { question: string; answer: string }[] {
  const recommendation = result.recommendations.items.find((item) => item.id === recommendationId);
  if (!recommendation) throw new Error(`La recomendación ${recommendationId} no está en el resultado candidato.`);
  const questions = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));
  return recommendation.sourceQuestionIds.flatMap((questionId) => {
    const question = questions.get(questionId);
    const answer = result.activeAnswers[questionId];
    if (!question || answer === undefined) return [];
    const rendered = renderQuestionV2(question, { context: result.scoring.context, answers: result.activeAnswers });
    const values = Array.isArray(answer) ? answer : [answer];
    const answerLabels = values.map((value) => rendered.options.find((option) => option.value === value)?.label).filter((label): label is string => Boolean(label));
    return answerLabels.length > 0 ? [{ question: rendered.prompt, answer: answerLabels.join("; ") }] : [];
  });
}

export function buildCandidateResultPresentationV3(result: CandidatePipelineResultV3): CandidateResultPresentationV3 {
  if (result.engineIdentity !== CANDIDATE_RESULT_IDENTITY_V3) throw new Error("La identidad del resultado no corresponde al contrato candidato vigente.");
  const index = result.overall.index;
  const observability = new Map(index.dimensionObservability.map((item) => [item.dimension, item]));
  const coverage = index.coverageDenominator > 0
    ? `En esta evaluación hay lectura para ${index.scoredDimensions.length} de ${index.coverageDenominator} dimensiones observables con oportunidad de evaluación (${Math.round(index.coverage * 100)} %); este porcentaje no representa todas las áreas del negocio.`
    : "En esta evaluación no se pudo calcular la cobertura porque ninguna dimensión aplicable tuvo una oportunidad de evaluación.";
  const warning = result.overall.provisional
    ? "El índice es provisional por confianza limitada; la banda se conserva y conviene confirmar la evidencia indicada."
    : result.overall.caveat?.reason === "limited_confidence"
      ? "La confianza es limitada; revisa las incertidumbres antes de actuar."
      : result.overall.caveat?.reason === "material_constraint"
        ? "El estado general no reemplaza las prioridades: existe una restricción material identificada por el motor."
        : null;
  const scoredDirectDimensions = dimensionsWithDirectScore(result);
  const hasScoredPrimary = result.narrative.priorities.some((item) => item.rank === 1 && scoredDirectDimensions.has(item.dimension));
  const supportedPriorities = hasScoredPrimary
    ? result.narrative.priorities.filter((item) => scoredDirectDimensions.has(item.dimension))
    : [];
  const supportedPriorityDimensions = new Set(supportedPriorities.map((item) => item.dimension));
  const dimensions = result.narrative.dimensions.map((dimension) => {
    const observation = observability.get(dimension.dimension);
    if (!observation) throw new Error(`Falta la información de evaluación para ${dimension.dimension}.`);
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
        directEvidence: observation.observedDirect ? "Hay respuestas útiles para esta área." : "No hay respuestas útiles para esta área.",
      },
      includedInCoverage: index.observableApplicableDimensions.includes(dimension.dimension),
    };
  });
  const recommendations = result.recommendations.items.flatMap((item, index) => {
    if (!supportedPriorityDimensions.has(item.dimension)) return [];
    const solution = result.solutions[index];
    if (!solution || solution.recommendationId !== item.id) throw new Error("Las soluciones candidatas no corresponden, en orden, a las recomendaciones del motor.");
    return [{
      rank: item.rank,
      title: item.title,
      area: dimensionLabelOf(result.narrative, item.dimension) ?? item.dimension,
      mode: RECOMMENDATION_MODE[item.mode],
      whatToImprove: item.whatToImprove,
      whyItMatters: item.whyItMatters,
      expectedOutcome: item.expectedOutcome,
      certainty: CERTAINTY_DISPLAY[item.certainty],
      verificationStatus: RECOMMENDATION_VERIFICATION[item.mode],
      howToVerify: RECOMMENDATION_CHECK[item.type],
      evidence: recommendationEvidence(result, item.id),
      conditions: recommendationConditions(result, item.id),
      solution: solution.solution ? { label: solution.solution.label, description: solution.solution.description } : null,
    }];
  });
  const executiveSummary = result.narrative.executiveSummary.map((item) => item.text);
  if (index.scoredDimensions.length === 0) {
    const status = result.scoring.context.operationalStatus;
    executiveSummary[0] = status.status === "resolved" && status.value === "paused"
      ? "La actividad está en pausa; no hay evidencia observable suficiente para calcular un índice general."
      : status.status === "resolved" && status.value === "preparing"
        ? "La actividad está en preparación; aún no hay evidencia suficiente para calcular un índice general."
        : status.status === "unresolved"
          ? "Falta confirmar el estado actual; no hay evidencia suficiente para calcular un índice general."
          : "No hay información suficiente para confirmar fortalezas o dificultades.";
  } else if (result.overall.publicLabel === "BIEN") {
    const focus = supportedPriorities[0]?.dimension;
    const focusLabel = focus ? dimensionLabelOf(result.narrative, focus) : null;
    executiveSummary[0] = `El estado general es BIEN en las áreas observables evaluadas${focusLabel ? `; el foco concreto de mejora es ${focusLabel.toLocaleLowerCase("es")}` : ""}.`;
  }
  const commercial = result.commercial;
  return {
    engineIdentity: result.engineIdentity as typeof CANDIDATE_RESULT_IDENTITY_V3,
    profileLabel: PROFILE_DISPLAY[result.narrative.profile],
    lifecycleLabel: result.scoring.context.operationalStatus.status === "resolved" ? ({ preparing: "En preparación", operating: "Disponible actualmente", paused: "En pausa" }[result.scoring.context.operationalStatus.value]) : "Estado actual sin resolver",
    lifecycle: result.narrative.lifecycle,
    overall: {
      label: result.overall.publicLabel ? OVERALL_BAND_DISPLAY[result.overall.publicLabel] : result.overall.label,
      publicLabel: result.overall.publicLabel,
      score: index.displayScore,
      confidence: CONFIDENCE_DISPLAY[result.overall.confidence.level].label,
      provisional: result.overall.provisional,
      explanation: result.overall.explanation.text,
      coverage,
      warning,
    },
    executiveSummary,
    currentState: result.narrative.currentState.text,
    strengths: strengthItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    areasToStrengthen: areaItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    risks: riskItems(result.narrative).map((item) => ({ label: item.label, text: item.block.text })),
    contradictions: result.narrative.contradictions.map((item) => item.text),
    uncertainties: uncertaintyGroups(result.narrative).map((group) => ({ title: group.title, items: group.items.map((item) => item.text) })),
    priorities: supportedPriorities.map((item) => ({
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
      unresolvedSignals: commercial.licenseFit.unresolvedSignals.map((signal) => COMMERCIAL_SIGNAL_DISPLAY[signal] ?? "Hay un dato comercial pendiente de confirmar"),
      now: [...commercial.now.complements, ...commercial.now.services].map((item) => ({ name: item.name, kind: item.kind === "complement" ? "Complemento" : "Servicio", rationale: item.rationale, priceLabel: item.priceLabel })),
      later: [...commercial.later.complements, ...commercial.later.services].map((item) => ({ name: item.name, kind: item.kind === "complement" ? "Complemento" : "Servicio", rationale: item.rationale, priceLabel: item.priceLabel })),
    },
  };
}

const longDate = (date: Date) => new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(date);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function buildCandidateDiagnosticReportV1(result: CandidatePipelineResultV3, completedAt: Date, generatedAt: Date = new Date(), businessName: string | null = null): CandidateDiagnosticReportV1 {
  const view = buildCandidateResultPresentationV3(result);
  const narrative = result.narrative;
  const constraint = narrative.primaryConstraint;
  const primaryDimension = constraint ? narrative.dimensions.find((item) => item.dimension === constraint.dimension) : undefined;
  const hasSupportedPrimary = view.priorities.some((item) => item.rank === 1);
  const contextualDimensions = view.dimensions.map((dimension) => ({ ...dimension, context: dimension.context }));
  const methodText = CANDIDATE_METHODOLOGY_REPORT_NOTES_V3;
  return {
    reportVersion: CANDIDATE_REPORT_VERSION,
    methodologyVersion: CANDIDATE_METHODOLOGY_IDENTITY_V3.replace("diagnostic-methodology-", ""),
    generatedAt: isoDate(generatedAt),
    generatedLabel: longDate(generatedAt),
    completedAt: isoDate(completedAt),
    completedLabel: longDate(completedAt),
    identity: {
      title: REPORT_TITLE,
      businessName: businessName?.trim().replace(/\s+/gu, " ") || null,
      profileLabel: view.profileLabel,
      lifecycleLabel: view.lifecycleLabel,
      dateLabel: "Fecha de finalización del diagnóstico",
    },
    overallPresence: {
      state: result.overall.state,
      publicLabel: view.overall.publicLabel,
      label: view.overall.label,
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
    primaryConstraint: constraint && primaryDimension && hasSupportedPrimary
      ? { kicker: "Atención prioritaria", title: primaryDimension.label, text: constraint.text, certaintyLabel: CERTAINTY_DISPLAY[constraint.certainty], confidenceLabel: CONFIDENCE_DISPLAY[primaryDimension.confidence].label }
      : constraint && primaryDimension
        ? { kicker: "Información por confirmar", title: "Lectura pendiente", text: constraint.text, certaintyLabel: "Por confirmar", confidenceLabel: CONFIDENCE_DISPLAY[primaryDimension.confidence].label }
      : view.dimensions.filter((item) => item.score !== null).length === 0
        ? { kicker: "Lectura pendiente", title: "Información insuficiente", text: "No hay información suficiente para confirmar fortalezas o dificultades.", certaintyLabel: null, confidenceLabel: null }
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
      solution: item.solution, conditions: item.conditions, evidence: item.evidence, verificationStatus: item.verificationStatus, howToVerify: item.howToVerify,
    })),
    methodologySummary: {
      version: CANDIDATE_METHODOLOGY_IDENTITY_V3.replace("diagnostic-methodology-", ""),
      notes: methodText,
      sourcesNote: "Las fuentes citadas informan por qué importan las áreas digitales; no validan estadísticamente la fórmula ni predicen resultados empresariales.",
      formulaDistinction: "Esta metodología candidata está pendiente de auditoría independiente.",
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
