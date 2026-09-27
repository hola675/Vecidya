import { explainResult } from "./facts";
import { getProfile } from "./profiles";
import { optionLabel } from "./questions";
import type { Answers, DiagnosticResult } from "./types";

export * from "./types";
export * from "./contracts";
export { deriveContextV3, LEGACY_PROFILE_MAPPING, LEGACY_STAGE_MAPPING, mapLegacyGoal, mapLegacyStage } from "./mappings";
export { applyAnswer, clearAnswer, deriveActiveAnswers, deriveContext, getApplicableQuestions, isAnswered, isSelected, selectedValues } from "./answers";
export { addonCatalog, learnCatalog, learnPath, licenseCatalog, serviceCatalog, servicePath } from "./catalog";
export { buildDiagnosticPath, DIAGNOSTIC_PATH, entryToAnswers, GOAL_PARAM, parseDiagnosticEntry, PROFILE_PARAM, type DiagnosticEntry } from "./deep-link";
export { getInitialStep, getProgress, getSections, pathLength, type Progress } from "./flow";
export { getProfile, goalIds, isGoalId, isProfileId, profileIds, profiles, stageIds, teamIds } from "./profiles";
export {
  APPLICABILITY,
  findDependencyCycles,
  getDependencyGraph,
  getOption,
  getQuestion,
  multiAnswer,
  optionLabel,
  QUESTION_DEFINITIONS,
  questionCopy,
  questions,
  ROUTING_RULES,
  sectionLabels,
  sectionOrder,
  singleAnswer,
  type ApplicabilityRule,
} from "./questions";
export { collectDependencies, evaluateRule, evaluateRuleTrace, explainApplicability, type ReasonCode, type Ref, type Rule, type RuleTrace } from "./routing";
export { collectEvidence, deriveEvidence } from "./evidence";
export {
  computeDimensionConfidenceInputs,
  computeOverallScore,
  dimensionDescriptions,
  dimensionLabels,
  dimensionOrder,
  explainDimensionScore,
  explainOverallScore,
  levelLabels,
  scoreDimensions,
  visualStatusFor,
  visualStatusLabels,
  type DimensionConfidenceInputs,
  type DimensionContributionEntry,
  type DimensionScoreTrace,
  type OverallScoreTrace,
  type VisualStatus,
} from "./scoring";
export { PRIORITY_LIMIT } from "./result";
export {
  explainLearnRecommendations,
  explainLicenseRecommendation,
  explainRecommendations,
  explainServiceRecommendations,
  findRecommendationsWithoutProvenance,
  type RecommendationProvenance,
  type RecommendationTrace,
} from "./recommendations";
export { buildResultFacts, explainResult, type DimensionResult, type ResultFacts, type ResultTrace } from "./facts";
export {
  buildCanonicalCompletionPayload,
  computeCompletionHash,
  hasSnapshotShape,
  MAX_ANSWERS_PER_PAYLOAD,
  MAX_REQUEST_BODY_BYTES,
  validateAnswersPayload,
  type AnswersValidationResult,
  type DiagnosticSessionSnapshot,
} from "./persistence";
export { DiagnosticBrowserStore, type DiagnosticBrowserRecord, type StorageLike } from "./browser-store";
export {
  estimatedSnapshotWrites,
  shouldFlushSnapshot,
  SNAPSHOT_ANSWER_INTERVAL,
  SNAPSHOT_MIN_INTERVAL_MS,
  type SnapshotDecisionInput,
} from "./snapshot-policy";
export {
  createServerSession,
  recoverSession,
  saveSessionForLater,
  sendCompletion,
  sendSnapshot,
  type CreateSessionResult,
  type RecoverSessionResult,
  type SaveSessionResult,
  type SnapshotPayload,
} from "./sync";
export { canOfferSaveForLater } from "./save-eligibility";
export {
  ANALYTICS_ABANDONMENT_THRESHOLD_MS,
  ANALYTICS_EVENT_RETENTION_DAYS,
  ANALYTICS_EVENT_TYPES,
  ANALYTICS_SCHEMA_VERSION,
  ANALYTICS_SECTION_IDS,
  ANSWER_KINDS,
  isAnalyticallyAbandoned,
  isAnalyticsEventType,
  isAnalyticsSectionId,
  isAnswerKind,
  MAX_ANALYTICS_EVENTS_PER_BATCH,
  MAX_ANALYTICS_EVENTS_PER_SESSION,
  MAX_ANALYTICS_STRING_LENGTH,
  type AbandonmentCandidate,
  type AnalyticsEventType,
  type AnalyticsSchemaVersion,
  type AnswerKind,
} from "./analytics";

/**
 * Ejecuta el diagnóstico completo sobre un conjunto de respuestas.
 * Devuelve `null` si todavía no hay perfil válido. Es determinista y puro.
 *
 * Envoltorio de `explainResult(...).result` (DIAG-V3-05 §24/§25): una sola tubería productiva
 * (respuestas activas → puntuación → evidencia → hechos → estado → hallazgos → prioridad →
 * recomendaciones → resultado); `runDiagnostic` no repite ningún cálculo por su cuenta.
 */
export function runDiagnostic(rawAnswers: Answers): DiagnosticResult | null {
  return explainResult(rawAnswers)?.result ?? null;
}

/** Resumen seguro para el correo de contacto: sin respuestas crudas ni internos de puntuación. */
export function buildContactMailto(result: DiagnosticResult): string {
  const subject = `Diagnostico Vecidya: ${result.state.label}`;
  const lines = [
    "Hola Vecidya,",
    "",
    "Acabo de completar el diagnostico y quiero revisar como avanzar.",
    "",
    `Perfil: ${getProfile(result.profile).label}`,
    `Momento: ${result.context.stage ? optionLabel("stage", result.context.stage) : "sin definir"}`,
    `Objetivo: ${result.context.goal ? optionLabel("goal", result.context.goal) : "sin definir"}`,
    `Estado: ${result.state.label}`,
    `Prioridad principal: ${result.priorities[0]?.title ?? "por definir"}`,
    `Siguiente paso sugerido: ${result.nextActions[0]?.text ?? "por definir"}`,
    `Encaje de licencia: ${result.recommendation.license.name}`,
    "",
    "No envio mis respuestas completas en este correo.",
  ];
  return `mailto:hola@vecidya.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
