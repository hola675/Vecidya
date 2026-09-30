import { explainResult } from "./facts";
import { getProfile } from "./profiles";
import { optionLabel } from "./questions";
import type { Answers, DiagnosticResult } from "./types";

export * from "./types";
export * from "./contracts";
export * from "./taxonomy";
export * from "./signals";
export {
  resolveDiagnosticContext,
  type ContextResolutionResult,
  type ContextResolutionTrace,
  type FieldTrace,
  type ResolvedDomainContext,
  type ResolvedFieldTrace,
  type UnresolvedFieldTrace,
} from "./context-resolver";
export { deriveSignalsFromLegacyContext } from "./legacy-signal-adapter";
export { foldSignalProductions, scalarSlotForProduction, SIGNAL_PRODUCTION_CONTEXT_FIELD, SIGNAL_PRODUCTION_KINDS, type SignalOrigin, type SignalProduction } from "./qbv2-signals";
export {
  andV2,
  answeredV2,
  CONTEXT_FIELD_REFS,
  contextEquals,
  contextIn,
  contextUnresolved,
  eqV2,
  evaluateRuleV2,
  evaluateRuleV2Trace,
  collectAnswerDependencies,
  collectAnswerRefValueChecks,
  collectContextDependencies,
  inV2,
  multiExcludingV2,
  multiIntersectsV2,
  notEqV2,
  notV2,
  orV2,
  type AnswerRefV2,
  type AnswersV2,
  type ContextFieldRef,
  type RuleV2,
  type RuleV2Trace,
} from "./qbv2-rules";
export {
  MODULE_IDS,
  MODULE_REGISTRY,
  QUESTION_PRIORITIES,
  QUESTION_PURPOSES,
  type ContradictionRole,
  type CopyVariantTarget,
  type CopyVariantV2,
  type ModuleDefinition,
  type ModuleId,
  type MultiQuestionDefinitionV2,
  type OptionKindV2,
  type OptionV2,
  type QuestionDefinitionV2,
  type QuestionPriority,
  type QuestionPurpose,
  type ScoringReadiness,
  type SingleQuestionDefinitionV2,
} from "./qbv2-contract";
export { getQuestionBank, NonConvergentRoutingError, registerQuestionBankV2, resolveEligibleQuestionsV2, type QuestionBankV2, type QuestionBankVersionNumber, type ResolveEligibleQuestionsResult } from "./qbv2-engine";
export { CONTRADICTION_RULES_VERSION, DEFAULT_CONTRADICTION_RULES_V1, detectContradictionsV2, getTriggeredConfirmations, validateContradictionRulesV1, type ContradictionEvidenceRef, type ContradictionMateriality, type ContradictionRegistryIssue, type ContradictionRuleV1, type ContradictionRulesVersion, type ContradictionStatus, type DetectedContradiction } from "./qbv2-contradictions";
export { GOLDEN_QUESTIONS_V2, type QuestionIdV2 } from "./qbv2-golden";
export { LOTE_A_QUESTIONS_V2 } from "./qbv2-lote-a";
export { LOTE_B_QUESTIONS_V2 } from "./qbv2-lote-b";
export { LOTE_C_QUESTIONS_V2 } from "./qbv2-lote-c";
export { LOTE_D_QUESTIONS_V2 } from "./qbv2-lote-d";
export { LOTE_E_QUESTIONS_V2 } from "./qbv2-lote-e";
export { LOTE_F_QUESTIONS_V2 } from "./qbv2-lote-f";
export { QUESTION_BANK_V2 } from "./qbv2-bank";
export { validateQuestionBankV2, type ValidationIssue } from "./qbv2-validators";
export { ADAPTIVE_PLANNER_VERSION, DEFAULT_ROUTE_BUDGET_V1, buildQuestionPlan, isDiagnosticReadyToComplete, planNextQuestion, plannerRouteSignatureParts, type AdaptivePlannerVersion, type CompletionStatus, type DiagnosticPlannerState, type PlannerSkipReason, type PlannerTraceEntry, type QuestionPlan, type QuestionRankMetadata, type QuestionSelectionReason, type RouteBudgetV1 } from "./qbv2-planner";
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
  sendAnalyticsEvents,
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
export { ANALYTICS_QUEUE_FLUSH_INTERVAL_MS, ANALYTICS_QUEUE_FLUSH_SIZE, ANALYTICS_QUEUE_MAX_PENDING, AnalyticsEventQueue, type AnalyticsQueueEvent, type AnalyticsQueueEventInput } from "./analytics-queue";
export { computeRouteSignature } from "./route-signature";
export {
  DIGITAL_DIMENSIONS,
  DIGITAL_DIMENSION_IDS,
  EVIDENCE_KINDS,
  EVIDENCE_MAPPING,
  MATURITY_MODEL,
  validateEvidenceMapping,
  type DigitalDimensionDefinition,
  type DigitalDimensionId,
  type EvidenceKind,
  type MaturityId,
  type QuestionEvidenceMapping,
} from "./qbv2-coverage";
export { GOLDEN_PERSONAS, type GoldenPersona } from "./qbv2-personas";
export { analyzeCoverage, generateCoverageMatrix, mappingForQuestion, type CoverageAnalysisReport, type CoverageFinding, type CoverageFindingClassification, type CoverageMatrixCase, type DimensionCoverageReport, type PersonaCoverageReport } from "./qbv2-coverage-analysis";

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
