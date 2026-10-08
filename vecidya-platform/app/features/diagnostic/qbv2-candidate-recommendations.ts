import { buildCandidateNarrativeAndOverallV3, type CandidateNarrativeAndOverallV3 } from "./qbv2-candidate-narrative";
import { candidateSolutionContextOfV3, matchCandidateSolutionV3 } from "./qbv2-candidate-solutions";
import { buildDiagnosticRecommendations, type DiagnosticRecommendations } from "./qbv2-recommendations";
import type { SolutionMatch } from "./qbv2-solutions";
import type { AnswersV2 } from "./qbv2-rules";
import { CANDIDATE_CALIBRATION_V3, type CandidateCalibrationV3 } from "./qbv2-candidate-calibration";

export type CandidateRecommendationsAndSolutionsInputV3 = { readonly answers: AnswersV2; readonly calibration?: CandidateCalibrationV3 };

export type CandidateRecommendationsAndSolutionsV3 = CandidateNarrativeAndOverallV3 & {
  readonly recommendations: DiagnosticRecommendations;
  readonly solutions: readonly SolutionMatch[];
};

/**
 * Candidate-only R6-C orchestration: `buildCandidateNarrativeAndOverallV3` (R6-A + R6-B) →
 * `buildDiagnosticRecommendations` (unchanged legacy engine, fed candidate inputs) → `matchCandidateSolutionV3`
 * (candidate-only, evidence-specific; legacy `matchSolution` is never called here). One `SolutionMatch` per
 * recommendation, in the same order, so the two arrays always align by index. A `SolutionMatch.solution` of
 * `null` is a valid, expected outcome — it means Vecidya's current intervention catalog has no
 * evidence-supported match yet, not a failure. No offerings/commercial mapping — that is R6-D. Not exported
 * from the shared barrel; not activated by the public runtime.
 */
export function buildCandidateRecommendationsAndSolutionsV3(input: CandidateRecommendationsAndSolutionsInputV3): CandidateRecommendationsAndSolutionsV3 {
  const calibration = input.calibration ?? CANDIDATE_CALIBRATION_V3;
  const base = buildCandidateNarrativeAndOverallV3({ answers: input.answers, calibration });
  // R8-A: a prerequisite is "sound" under the same candidate severity bands the priorities used.
  const recommendations = buildDiagnosticRecommendations({ scoring: base.scoring, priorities: base.priorities, semanticFacts: base.semanticFacts, narrative: base.narrative, severity: calibration.severity });
  // R6-C.1: candidate process authority (q2_process_systemization), never the legacy PROCESS_SIGNALS heuristic.
  const solutionContext = candidateSolutionContextOfV3(base.scoring, base.priorities, base.narrative);
  const solutions = recommendations.items.map((recommendation) => matchCandidateSolutionV3(recommendation, solutionContext));
  return { ...base, recommendations, solutions };
}
