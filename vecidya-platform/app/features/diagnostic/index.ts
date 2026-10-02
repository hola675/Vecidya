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
  type QuestionVersionV2,
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
export { ADAPTIVE_PLANNER_VERSION, DEFAULT_ROUTE_BUDGET_V1, MATERIAL_EVIDENCE_TARGET, ROUTE_BANDS, ROUTE_HARD_CAP, buildQuestionPlan, isDiagnosticReadyToComplete, planNextQuestion, plannerRouteSignatureParts, type AdaptivePlannerVersion, type CompletionStatus, type DiagnosticPlannerState, type MaterialEvidenceNeed, type MaterialEvidenceSource, type PlannerSkipReason, type PlannerTraceEntry, type QuestionPlan, type QuestionRankMetadata, type QuestionSelectionReason, type RouteBudgetV1 } from "./qbv2-planner";
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
export { computeRouteSignature } from "./route-signature";
export {
  DIGITAL_DIMENSIONS,
  DIGITAL_DIMENSION_IDS,
  EVIDENCE_KINDS,
  EVIDENCE_DIRECTNESS,
  EVIDENCE_MAPPING,
  MATURITY_MODEL,
  validateEvidenceMapping,
  type DigitalDimensionDefinition,
  type DigitalDimensionId,
  type EvidenceKind,
  type MaturityId,
  type QuestionEvidenceMapping,
  type EvidenceDirectness,
} from "./qbv2-coverage";
export { GOLDEN_PERSONAS, resolveGoldenPersonaAnswers, runGoldenPersonaPipeline, type GoldenPersona, type GoldenPersonaExecution } from "./qbv2-personas";
export { analyzeCoverage, generateCoverageMatrix, mappingForQuestion, type CoverageAnalysisReport, type CoverageFinding, type CoverageFindingClassification, type CoverageMatrixCase, type DimensionCoverageReport, type PersonaCoverageReport } from "./qbv2-coverage-analysis";
export { deriveContextualEvidence, scoreContextualDimensions, validateAnswerSemantics, ANSWER_SEMANTICS, CAPABILITY_CONTRIBUTION, CAPABILITY_STATES, CONFIDENCE_MODEL, CONTEXT_ONLY_QUESTION_IDS, SCORING_MODEL, type AnswerSemantics, type CapabilityState, type ContextualEvidence, type ContextualScoringContext, type ContextualScoringResult, type ContextualDimensionResult, type DimensionApplicability, type DimensionConfidence, type DimensionExplainability, type ContextualConfidenceLevel, type ScoreBasis } from "./qbv2-contextual-scoring";
export { deriveConstraintsAndPriorities, CONSTRAINT_KINDS, DEPENDENCY_RELATIONS, DIMENSION_CONSTRAINT, DIMENSION_DEPENDENCIES, FRICTION_RELEVANCE, GOAL_RELEVANCE, SEVERITY_BANDS, type ConstraintKind, type ConstraintPriorityResult, type ConstraintSeverity, type DependencyRelation, type DiagnosticConstraint, type DiagnosticPriority, type DimensionDependency, type PriorityCertainty, type PriorityReasonCode } from "./qbv2-priorities";
export { deriveSemanticFacts, DIMENSION_READING_CODES, FACT_IMPORTANCE, PRIORITY_CODES, SEMANTIC_FACT_TYPES, type ContextFact, type EvidenceGapKind, type FactCertainty, type FactSignal, type SemanticDiagnosticFacts, type SemanticFact, type SemanticFactsInput, type SemanticFactType } from "./qbv2-semantic-facts";
export { resolveTerm, resolveTerminologyProfile, TERM_ROLES, TERMINOLOGY, TERMINOLOGY_PROFILE_IDS, type TermRole, type TerminologyProfile, type TerminologyProfileId } from "./qbv2-terminology";
export { HINT_MAX_LENGTH, renderQuestionV2, validateQuestionCopyV2, visibleCopyOf, type CopyContext, type RenderedOptionV2, type RenderedQuestionV2 } from "./qbv2-copy";
export { AUDIT_CLASSES, canClaimStage, COPY_MODES, DIMENSION_RESULT_CONCEPT, factSubjectStages, HARSH_RESULT_PHRASES, HELP_LEVELS, LIFECYCLE_ORDER, LIVE_ONLY_STAGES, QUESTION_LANGUAGE, RESULT_CATEGORIES, RESULT_CERTAINTY_FRAMES, RESULT_CERTAINTY_LEVELS, RESULT_VOCABULARY, resultCategory, resultCertainty, resultSubject, STAGE_TERM, SUBJECT_STAGES, type AuditClass, type CopyMode, type HelpLevel, type QuestionLanguageEntry, type ResultCategory, type ResultCertainty, type SubjectStage } from "./qbv2-language";
export { buildDiagnosticNarrative, CONFIDENCE_LABELS, DIMENSION_PRESENTATION_STATUSES, DIMENSION_STATUS_LABELS, NARRATIVE_BLOCK_KINDS, NARRATIVE_VERSION, narrativeBlocks, type DiagnosticNarrative, type DimensionInterpretation, type DimensionPresentationStatus, type NarrativeBlock, type NarrativeBlockKind, type NarrativeInput, type NarrativePriority } from "./qbv2-narrative";
export { DIMENSION_NARRATIVE, DIMENSION_STATEMENTS, NARRATIVE_FILLER_PHRASES, PRIORITY_FOCUS, QUESTION_TOPICS } from "./qbv2-narrative-phrases";
export { bandFor, buildDigitalPresenceStatus, classifyOverallState, computeDigitalPresenceIndex, computeOverallConfidence, displayScoreFor, OVERALL_INDEX_MODEL, OVERALL_INDEX_VERSION, OVERALL_STATE_ASSET_SLOTS, OVERALL_STATES, OVERALL_STATUS_LABELS, type DigitalPresenceIndex, type DigitalPresenceStatus, type OverallCap, type OverallConfidence, type OverallExplanation, type OverallState, type OverallStatusInput, type OverallStatusKind } from "./qbv2-overall";
export { buildDiagnosticRecommendations, DIMENSION_RECOMMENDATION_TYPE, RECOMMENDATION_FRAMING, RECOMMENDATION_MODES, RECOMMENDATION_TYPES, RECOMMENDATION_VERSION, type DiagnosticRecommendation, type DiagnosticRecommendations, type RecommendationEvidence, type RecommendationFraming, type RecommendationInput, type RecommendationMode, type RecommendationPrerequisite, type RecommendationType, type RecommendationUrgency } from "./qbv2-recommendations";
export { EXCLUSION_RULES, matchSolution, SOLUTION_CATALOG, SOLUTION_IDS, solutionContextOf, type ExclusionRule, type SolutionCatalogItem, type SolutionContext, type SolutionId, type SolutionMatch } from "./qbv2-solutions";
export { buildDiagnosticOutcome, COMMERCIAL_CATALOG, matchCommercialOfferings, OFFERING_KINDS, offeringDependencies, SOLUTION_OFFERINGS, type CommercialMatch, type CommercialOffering, type CommercialOfferingId, type CommercialProofChain, type CommercialRole, type DiagnosticOutcome, type DiagnosticOutcomeInput, type HelpItem, type HowVecidyaCanHelp, type NoOfferingReason, type OfferingKind } from "./qbv2-offerings";
export { canGoBackV3, completeSessionV3, createSessionV3, currentQuestionIdV3, DIAGNOSTIC_SESSION_V3_SCHEMA, DIAGNOSTIC_SESSION_V3_STORAGE_KEY, DIAGNOSTIC_SESSION_V3_TTL_MS, DiagnosticSessionStoreV3, goBackV3, parseSessionV3, presentQuestionV3, progressV3, PROGRESS_STAGES_V3, runDiagnosticPipelineV3, serializeSessionV3, SESSION_STATUSES_V3, sessionProfileV3, submitAnswerV3, toggleMultiValueV3, validateAnswerV3, type AnswerValidationErrorV3, type AnswerValidationV3, type AnswerValueV3, type CompletionV3, type DiagnosticResultV3, type DiagnosticSessionV3, type PresentedQuestionV3, type ProgressStageV3, type ProgressV3, type QueuedQuestionV3, type RouteTraceEntryV3, type SessionStatusV3, type StorageLike, type SubmitResultV3 } from "./qbv2-session";

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
