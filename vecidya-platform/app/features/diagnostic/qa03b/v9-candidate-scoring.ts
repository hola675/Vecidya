// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import type { ResolvedDomainContext } from "./context";
import { resolveEligibleQuestionsV2 } from "./engine";
import type { ContextualEvidence } from "../qbv2-contextual-scoring";
import { deriveContextualEvidence, scoreDimensionWithApplicability } from "../qbv2-contextual-scoring";
import type { DigitalDimensionId } from "../qbv2-dimensions";
import { DIGITAL_DIMENSIONS } from "../qbv2-coverage";
import { evaluateDimensionApplicabilityV3, type ApplicabilityEvidenceV3, type DimensionApplicabilityDecisionV3 } from "./applicability";
import { evidenceMigrationIdentity, migratedAnswerStatesV3, validateQuestionEvidenceV3 } from "../qbv2-evidence-v3";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./bank";
import type { AnswersV2 } from "../qbv2-rules";
import type { V9ContextualEvidence } from "../v9/scoring-contract";
import type { QuestionDefinitionV2, QuestionVersionV2 } from "../qbv2-contract";
import { CANDIDATE_CALIBRATION_V3, candidateDimensionCalibrationV3, type CandidateCalibrationV3 } from "../qbv2-candidate-calibration";
import type { ConfirmedObservationCorrelationV1 } from "./v9-observation-correlation";
import {
  applyV9ObservationCorrelationPolicy,
  type V9CorrelationPolicyResult,
} from "../v9/evidence-correlation-registry";

export type CandidateContextualDimensionResultV3 = Omit<ReturnType<typeof scoreDimensionWithApplicability>, "applicability"> & {
  readonly applicability: DimensionApplicabilityDecisionV3["applicability"];
  readonly applicabilityReason: DimensionApplicabilityDecisionV3["reason"];
  readonly applicabilityContext: readonly string[];
};

/** Candidate diagnostics expose the resolver output for auditing; they do not activate the public runtime. */
export type CandidateContextualScoringResultV3 = {
  readonly activeAnswers: AnswersV2;
  readonly context: ResolvedDomainContext;
  readonly dimensions: readonly CandidateContextualDimensionResultV3[];
  readonly correlation: V9CorrelationPolicyResult | null;
};

export type CandidateContextualScoringInputV3 = {
  readonly answers: AnswersV2;
  /** DIAG-V3-R8-A: candidate numeric calibration; defaults to the isolated baseline `CANDIDATE_CALIBRATION_V3`. */
  readonly calibration?: CandidateCalibrationV3;
  /** Authoritative V9 callers enable this. Lower-level historical QA remains unchanged by default. */
  readonly strictCorrelation?: boolean;
  readonly correlations?: readonly ConfirmedObservationCorrelationV1[];
};

function sameAnswer(left: string | readonly string[] | undefined, right: readonly string[]): boolean {
  if (left === undefined) return false;
  const values = Array.isArray(left) ? [...new Set(left)] : [left as string];
  return values.length === right.length && values.every((value) => right.includes(value));
}

/**
 * Converts derived observations to R4's score-free contract only after checking the concrete
 * candidate definition, migration version/identity, active answer, and R3 answer reading.
 * Any impossible internal mismatch fails closed instead of weakening the applicability boundary.
 */
/** @internal Certification seam: validates the scorer's evidence boundary; intentionally not barrel-exported. */
export function validateActiveCandidateEvidenceV3(
  evidence: readonly ContextualEvidence[],
  activeAnswers: AnswersV2,
  bank: readonly QuestionDefinitionV2[],
): readonly ContextualEvidence[] {
  const byId = new Map(bank.map((question) => [question.id, question]));
  for (const item of evidence) {
    const question = byId.get(item.questionId);
    if (!question || question.evidenceMigration !== "migrated" || !question.evidenceV3
      || question.version !== item.questionVersion
      || item.migrationIdentity !== evidenceMigrationIdentity(question.id, question.version)
      || !sameAnswer(activeAnswers[question.id], item.answer)
      || validateQuestionEvidenceV3(question).length > 0) {
      throw new Error(`Invalid migrated candidate evidence: ${item.questionId}`);
    }
    const expected = migratedAnswerStatesV3(question, item.answer).some((reading) =>
      reading.dimension === item.dimension && reading.directness === item.directness && reading.state === item.state,
    );
    if (!expected) throw new Error(`Candidate evidence does not match R3 mapping: ${item.questionId}/${item.dimension}`);
  }
  return evidence;
}

function toApplicabilityEvidence(evidence: readonly ContextualEvidence[]): readonly ApplicabilityEvidenceV3[] {
  return evidence.map((item) => {
    if (item.questionVersion === undefined || item.migrationIdentity === undefined) {
      throw new Error(`Candidate evidence lacks V3 identity: ${item.questionId}`);
    }
    return {
      questionId: item.questionId,
      questionVersion: item.questionVersion,
      migrationIdentity: item.migrationIdentity,
      dimension: item.dimension,
      state: item.state,
    };
  });
}

function toV9CorrelationEvidence(evidence: readonly ContextualEvidence[]): readonly V9ContextualEvidence[] {
  return evidence.map((item) => {
    if (item.questionVersion === undefined || item.migrationIdentity === undefined) {
      throw new Error(`Candidate evidence lacks V3 identity: ${item.questionId}`);
    }
    return {
      questionId: item.questionId,
      questionVersion: item.questionVersion,
      migrationIdentity: item.migrationIdentity,
      dimension: item.dimension,
      observationId: item.observationId,
      directness: item.directness,
      state: item.state,
      kind: item.kind,
      contribution: item.contribution,
      answer: item.answer,
    };
  });
}

function toCandidateEvidence(evidence: readonly V9ContextualEvidence[]): readonly ContextualEvidence[] {
  return evidence.map((item) => {
    const questionVersion: QuestionVersionV2 = item.questionVersion === 1 || item.questionVersion === 2 ||
      item.questionVersion === 3 || item.questionVersion === 4
      ? item.questionVersion
      : (() => { throw new Error(`Unsupported V9 question version: ${item.questionVersion}`); })();
    return {
      questionId: item.questionId,
      questionVersion,
      migrationIdentity: item.migrationIdentity,
      dimension: item.dimension,
      observationId: item.observationId,
      directness: item.directness,
      state: item.state,
      kind: item.kind,
      contribution: item.contribution,
      answer: item.answer,
    };
  });
}

/**
 * Candidate-only scoring path: converge routing on the reviewed V3 evidence bank first, then
 * derive and validate migrated observations from active answers before applying R4-A. R8-A: candidate
 * calibration becomes authoritative here — the R3 semantic state is validated first, then the candidate's own
 * contribution table replaces the shared one, and the candidate scoring/confidence models drive the core.
 */
export function scoreCandidateContextualDimensionsV3(
  input: CandidateContextualScoringInputV3,
  // Test-only seam for candidate banks. Production callers always use the default.
  bank: readonly QuestionDefinitionV2[] = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
): CandidateContextualScoringResultV3 {
  const calibration = input.calibration ?? CANDIDATE_CALIBRATION_V3;
  const resolution = resolveEligibleQuestionsV2(input.answers, bank);
  const derived = deriveContextualEvidence(resolution.activeAnswers, bank);
  const calibratedEvidence = validateActiveCandidateEvidenceV3(derived, resolution.activeAnswers, bank)
    .map((item) => ({ ...item, contribution: calibration.capabilityContribution[item.state] }));
  const correlation = input.strictCorrelation
    ? applyV9ObservationCorrelationPolicy(toV9CorrelationEvidence(calibratedEvidence), input.correlations ?? [])
    : null;
  if (correlation && !correlation.scoreSafe) throw new Error("v9_correlation_not_score_safe");
  const evidence = correlation ? toCandidateEvidence(correlation.accepted) : calibratedEvidence;
  const dimensionCalibration = candidateDimensionCalibrationV3(calibration);

  const dimensions = DIGITAL_DIMENSIONS.map((definition) => {
    const dimension: DigitalDimensionId = definition.id;
    const dimensionEvidence = evidence.filter((item) => item.dimension === dimension);
    const applicability = evaluateDimensionApplicabilityV3({
      dimension,
      context: resolution.context,
      evidence: toApplicabilityEvidence(dimensionEvidence),
    });
    return {
      ...scoreDimensionWithApplicability(dimension, evidence, applicability.applicability, dimensionCalibration),
      applicabilityReason: applicability.reason,
      applicabilityContext: applicability.supportingContext,
    };
  });

  return { activeAnswers: resolution.activeAnswers, context: resolution.context, dimensions, correlation };
}
