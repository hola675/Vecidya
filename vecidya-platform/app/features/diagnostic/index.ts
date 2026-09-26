import { deriveActiveAnswers, deriveContext, getApplicableQuestions } from "./answers";
import { CURRENT_DIAGNOSTIC_VERSION } from "./contracts";
import { getProfile } from "./profiles";
import { optionLabel } from "./questions";
import { recommend } from "./recommendations";
import { buildNextActions, classifyState, collectStrengths, detectContradictions, explainGoal, generateIssues, prioritize, splitPriorities, toScores } from "./result";
import { computeConfidence, computeOverallScore, scoreDimensions } from "./scoring";
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
export { computeOverallScore, dimensionDescriptions, dimensionLabels, dimensionOrder, levelLabels, visualStatusFor, visualStatusLabels, type VisualStatus } from "./scoring";
export { PRIORITY_LIMIT } from "./result";

/**
 * Ejecuta el diagnóstico completo sobre un conjunto de respuestas.
 * Devuelve `null` si todavía no hay perfil válido. Es determinista y puro.
 */
export function runDiagnostic(rawAnswers: Answers): DiagnosticResult | null {
  const active = deriveActiveAnswers(rawAnswers);
  const context = deriveContext(active);
  if (!context.profile) return null;

  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  const overallScore = computeOverallScore(dimensions);
  const scores = toScores(dimensions);
  const confidence = computeConfidence(active, applicable, dimensions, detectContradictions(context));
  const state = classifyState(context, scores, dimensions);
  const issues = prioritize(generateIssues(context, scores), context);
  const { priorities, gaps } = splitPriorities(issues);
  const strengths = collectStrengths(context, dimensions, issues);
  const nextActions = buildNextActions(priorities, gaps, context, confidence);
  const recommendation = recommend(context, scores, priorities, state);
  const goalNote = explainGoal(context, issues, scores);

  return {
    version: CURRENT_DIAGNOSTIC_VERSION,
    profile: context.profile,
    context: { stage: context.stage, team: context.team, goal: context.goal },
    state,
    confidence,
    overallScore,
    dimensions,
    strengths,
    gaps,
    priorities,
    nextActions,
    recommendation,
    ...(goalNote ? { goalNote } : {}),
  };
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
    "No envio mis respuestas completas y Vecidya no guarda informacion del diagnostico.",
  ];
  return `mailto:hola@vecidya.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
