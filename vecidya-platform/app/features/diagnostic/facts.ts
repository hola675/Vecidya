import { deriveActiveAnswers, deriveContext, getApplicableQuestions } from "./answers";
import { CURRENT_DIAGNOSTIC_VERSION, type DiagnosticEvidence } from "./contracts";
import { collectEvidence } from "./evidence";
import { explainRecommendations, type RecommendationProvenance } from "./recommendations";
import {
  buildNextActions,
  collectStrengths,
  type ContradictionFact,
  explainContradictions,
  explainGoal,
  explainPrioritization,
  explainStateClassification,
  generateIssues,
  type IssueDraft,
  type PriorityTrace,
  splitPriorities,
  type StateClassificationTrace,
  toScores,
  type Scores,
} from "./result";
import type { QuestionId } from "./questions";
import { computeConfidence, computeDimensionConfidenceInputs, computeOverallScore, dimensionOrder, scoreDimensions, type DimensionConfidenceInputs } from "./scoring";
import type { Answers, Confidence, Context, DiagnosticResult, DimensionId, DimensionScore, Issue, NextAction, ProfileId, Recommendation, Strength } from "./types";

/**
 * Result Engine (DIAG-V3-05): representación estructurada de los hechos intermedios del motor
 * ACTUAL, separada de la presentación. No es `DiagnosticResultV3` (ver `contracts.ts` §27 en el
 * reporte de fase): es el resultado real que ya produce el código de hoy, con más metadata que la
 * UI, no una promesa de lo que V3 podría llegar a tener. Cada campo se deriva de las mismas
 * funciones productivas que ya usaba `runDiagnostic`; nada se recalcula dos veces.
 */

export type DimensionResult = {
  id: DimensionId;
  /** `score.score !== null`: hubo evidencia aplicable suficiente para puntuar. */
  evaluated: boolean;
  score: DimensionScore;
  /** Insumos de confianza por dimensión (DIAG-V3-04); ningún nivel calculado todavía (ver DIAG-V3-05 §30). */
  confidenceInputs: DimensionConfidenceInputs;
  evidence: DiagnosticEvidence[];
};

export type ResultFacts = {
  profile: ProfileId;
  context: Context;
  /**
   * IDs, no los objetos `Question` completos: una `Question` con regla de routing lleva
   * `applies: (context: Context) => boolean` (ver `questions.ts`), una función, que rompería la
   * serializabilidad exigida en §40. Quien necesite la definición completa la busca por ID
   * (`getQuestion`, en `questions.ts`).
   */
  applicable: QuestionId[];
  dimensions: DimensionScore[];
  dimensionResults: DimensionResult[];
  overallScore: number;
  scores: Scores;
  evidence: DiagnosticEvidence[];
  contradictions: ContradictionFact[];
  confidence: Confidence;
  stateTrace: StateClassificationTrace;
  issueDrafts: IssueDraft[];
  priorityTraces: PriorityTrace[];
};

/**
 * Única construcción real de los hechos intermedios. Reutiliza exactamente las mismas funciones
 * productivas (`scoreDimensions`, `collectEvidence`, `explainContradictions`, `computeConfidence`,
 * `explainStateClassification`, `generateIssues`, `explainPrioritization`) que ya usaba
 * `runDiagnostic` antes de esta fase: ninguna se recalcula con una fórmula paralela.
 */
export function buildResultFacts(rawAnswers: Answers): ResultFacts | null {
  const active = deriveActiveAnswers(rawAnswers);
  const context = deriveContext(active);
  if (!context.profile) return null;

  const applicableQuestions = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicableQuestions);
  const overallScore = computeOverallScore(dimensions);
  const scores = toScores(dimensions);
  const evidence = collectEvidence(active, applicableQuestions);
  const contradictions = explainContradictions(context);
  const confidence = computeConfidence(
    active,
    applicableQuestions,
    dimensions,
    contradictions.map((fact) => fact.message),
  );
  const stateTrace = explainStateClassification(context, scores, dimensions);
  const issueDrafts = generateIssues(context, scores);
  const priorityTraces = explainPrioritization(issueDrafts, context);

  const dimensionResults = dimensionOrder.map((id): DimensionResult => {
    const score = dimensions.find((item) => item.id === id) as DimensionScore;
    return {
      id,
      evaluated: score.score !== null,
      score,
      confidenceInputs: computeDimensionConfidenceInputs(id, active, applicableQuestions, contradictions.length),
      evidence: evidence.filter((item) => item.dimension === id),
    };
  });

  return {
    profile: context.profile,
    context,
    applicable: applicableQuestions.map((question) => question.id),
    dimensions,
    dimensionResults,
    overallScore,
    scores,
    evidence,
    contradictions,
    confidence,
    stateTrace,
    issueDrafts,
    priorityTraces,
  };
}

export type ResultTrace = {
  facts: ResultFacts;
  issues: Issue[];
  priorities: Issue[];
  gaps: Issue[];
  strengths: Strength[];
  nextActions: NextAction[];
  recommendation: Recommendation;
  recommendationProvenance: RecommendationProvenance;
  goalNote?: string;
  result: DiagnosticResult;
};

/**
 * Único mecanismo de explicación del resultado completo (DIAG-V3-05 §24). Construye `ResultFacts`
 * y, a partir de ellas, exactamente el mismo `DiagnosticResult` que producía `runDiagnostic` antes
 * de esta fase — `runDiagnostic` pasa a ser un envoltorio de `.result` (mismo patrón que el resto
 * del motor). Serializable en su totalidad (sin funciones, clases, Symbols, Maps ni Sets).
 */
export function explainResult(rawAnswers: Answers): ResultTrace | null {
  const facts = buildResultFacts(rawAnswers);
  if (!facts) return null;

  const { context, dimensions, scores, confidence, stateTrace, priorityTraces, profile } = facts;
  const state = stateTrace.state;
  const issues = priorityTraces.map((trace) => trace.issue);
  const { priorities, gaps } = splitPriorities(issues);
  const strengths = collectStrengths(context, dimensions, issues);
  const nextActions = buildNextActions(priorities, gaps, context, confidence);
  const { recommendation, provenance } = explainRecommendations(context, scores, priorities, state);
  const goalNote = explainGoal(context, issues, scores);

  const result: DiagnosticResult = {
    version: CURRENT_DIAGNOSTIC_VERSION,
    profile,
    context: { stage: context.stage, team: context.team, goal: context.goal },
    state,
    confidence,
    overallScore: facts.overallScore,
    dimensions,
    strengths,
    gaps,
    priorities,
    nextActions,
    recommendation,
    ...(goalNote ? { goalNote } : {}),
  };

  return { facts, issues, priorities, gaps, strengths, nextActions, recommendation, recommendationProvenance: provenance, ...(goalNote ? { goalNote } : {}), result };
}
