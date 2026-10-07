import { scoreCandidateContextualDimensionsV3, type CandidateContextualScoringResultV3 } from "./qbv2-candidate-scoring";
import { deriveConstraintsAndPriorities, type ConstraintPriorityResult } from "./qbv2-priorities";
import { deriveSemanticFacts, type SemanticDiagnosticFacts, type SemanticEvidenceCatalog } from "./qbv2-semantic-facts";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import type { DigitalDimensionId } from "./qbv2-dimensions";
import type { AnswersV2 } from "./qbv2-rules";

/**
 * DIAG-V3-R6-A: the only seam through which candidate semantic facts learn evidence authority. Derived
 * exclusively from `evidenceMigration`/`evidenceV3` on the frozen candidate bank — never from the legacy
 * `EVIDENCE_MAPPING`/`EVIDENCE_DIRECTNESS` maps, which the candidate path never imports for this purpose.
 * R3 V3 mappings do not define legacy `subcriteria`; `facet` falls back to the question ID rather than
 * inventing a semantic topic.
 */
export const CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3: SemanticEvidenceCatalog = {
  directness: (questionId, dimension) => {
    const question = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((item) => item.id === questionId);
    if (!question || question.evidenceMigration !== "migrated" || !question.evidenceV3) return undefined;
    return question.evidenceV3.dimensions.find((item) => item.dimension === dimension)?.directness;
  },
  directQuestionIds: (dimension: DigitalDimensionId) =>
    REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3
      .filter((question) => question.evidenceMigration === "migrated" && question.evidenceV3?.dimensions.some((item) => item.dimension === dimension && item.directness === "direct"))
      .map((question) => question.id),
  facet: (questionId) => questionId,
};

export type CandidateInterpretationCoreInputV3 = { readonly answers: AnswersV2 };

export type CandidateInterpretationCoreV3 = {
  readonly activeAnswers: AnswersV2;
  readonly context: CandidateContextualScoringResultV3["context"];
  readonly scoring: CandidateContextualScoringResultV3;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
};

/**
 * Candidate-only consumer orchestration (R6-A). Pipeline: raw answers → candidate scorer (R3 evidenceV3
 * + R4 applicability) → active answers → candidate scoring view → `deriveConstraintsAndPriorities` →
 * candidate semantic facts. Stops before overall/narrative/recommendations/solutions/offerings/commercial
 * mapping — those are later R6 blocks. Not exported from the shared diagnostic barrel; not activated by
 * the public runtime.
 */
export function buildCandidateInterpretationCoreV3(input: CandidateInterpretationCoreInputV3): CandidateInterpretationCoreV3 {
  const scoring = scoreCandidateContextualDimensionsV3({ answers: input.answers });
  const priorities = deriveConstraintsAndPriorities(scoring);
  // Semantic facts must read the resolved active answers, never the caller's raw/stale ones: an earlier
  // answer that routing invalidated must not resurrect stale evidence, constraints, or provenance.
  const semanticFacts = deriveSemanticFacts({
    answers: scoring.activeAnswers,
    scoring,
    priorities,
    bank: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
    evidenceCatalog: CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3,
  });
  return { activeAnswers: scoring.activeAnswers, context: scoring.context, scoring, priorities, semanticFacts };
}
