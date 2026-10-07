import type { ResolvedDomainContext } from "./context-resolver";
import { resolveEligibleQuestionsV2 } from "./qbv2-engine";
import type { ContextualEvidence } from "./qbv2-contextual-scoring";
import { deriveContextualEvidence, scoreDimensionWithApplicability } from "./qbv2-contextual-scoring";
import type { DigitalDimensionId } from "./qbv2-dimensions";
import { DIGITAL_DIMENSIONS } from "./qbv2-coverage";
import { evaluateDimensionApplicabilityV3, type ApplicabilityEvidenceV3, type DimensionApplicabilityDecisionV3 } from "./qbv2-applicability";
import { evidenceMigrationIdentity, migratedAnswerStatesV3, validateQuestionEvidenceV3 } from "./qbv2-evidence-v3";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import type { AnswersV2 } from "./qbv2-rules";
import type { QuestionDefinitionV2 } from "./qbv2-contract";

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
};

export type CandidateContextualScoringInputV3 = { readonly answers: AnswersV2 };

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
function validateActiveCandidateEvidence(
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

/**
 * Candidate-only scoring path: converge routing on the reviewed V3 evidence bank first, then
 * derive and validate migrated observations from active answers before applying R4-A.
 */
export function scoreCandidateContextualDimensionsV3(
  input: CandidateContextualScoringInputV3,
): CandidateContextualScoringResultV3 {
  const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
  const resolution = resolveEligibleQuestionsV2(input.answers, bank);
  const derived = deriveContextualEvidence(resolution.activeAnswers, bank);
  const evidence = validateActiveCandidateEvidence(derived, resolution.activeAnswers, bank);

  const dimensions = DIGITAL_DIMENSIONS.map((definition) => {
    const dimension: DigitalDimensionId = definition.id;
    const dimensionEvidence = evidence.filter((item) => item.dimension === dimension);
    const applicability = evaluateDimensionApplicabilityV3({
      dimension,
      context: resolution.context,
      evidence: toApplicabilityEvidence(dimensionEvidence),
    });
    return {
      ...scoreDimensionWithApplicability(dimension, evidence, applicability.applicability),
      applicabilityReason: applicability.reason,
      applicabilityContext: applicability.supportingContext,
    };
  });

  return { activeAnswers: resolution.activeAnswers, context: resolution.context, dimensions };
}
