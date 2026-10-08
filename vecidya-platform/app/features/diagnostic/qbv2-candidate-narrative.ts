import { buildCandidateInterpretationCoreV3, type CandidateInterpretationCoreV3 } from "./qbv2-candidate-interpretation";
import { computeCandidateDigitalPresenceIndexV3 } from "./qbv2-candidate-overall";
import { buildDiagnosticNarrative, type DiagnosticNarrative } from "./qbv2-narrative";
import { buildDigitalPresenceStatus, computeOverallConfidence, type DigitalPresenceStatus } from "./qbv2-overall";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import type { AnswersV2 } from "./qbv2-rules";
import { CANDIDATE_CALIBRATION_V3, type CandidateCalibrationV3 } from "./qbv2-candidate-calibration";

/**
 * DIAG-V3-R6-B: candidate-only question topics, kept out of the shared (publicly bundled)
 * `qbv2-narrative-phrases.ts`. `q2_discovery_reliable_reach` is the sole direct Discovery source in the
 * candidate bank and does not exist in the legacy bank; without a topic, a Discovery reading built only
 * from it would render an empty phrase. `q2_process_systemization` exists in the legacy bank but only as
 * contextual (zero dimensions) there, so it never reaches legacy narrative text — this entry only resolves
 * candidate Digital Readiness provenance.
 */
const CANDIDATE_QUESTION_TOPICS_V3: Readonly<Record<string, string>> = {
  q2_discovery_reliable_reach: "la constancia para llegar a personas nuevas interesadas",
  q2_process_systemization: "la forma de manejar las tareas que se repiten",
};

export type CandidateNarrativeAndOverallInputV3 = { readonly answers: AnswersV2; readonly calibration?: CandidateCalibrationV3 };

export type CandidateNarrativeAndOverallV3 = CandidateInterpretationCoreV3 & {
  readonly narrative: DiagnosticNarrative;
  readonly overall: DigitalPresenceStatus;
};

/**
 * Candidate-only R6-B orchestration: `buildCandidateInterpretationCoreV3` (R6-A) → narrative → overall.
 * No recomputation of score, applicability, confidence, priority order, or evidence — narrative and overall
 * only translate what R6-A already certified. The candidate bank and active answers are explicit throughout,
 * never the caller's raw answers and never a silent fallback to the legacy `QUESTION_BANK_V2`. Stops before
 * recommendations/solutions/offerings/commercial mapping — those are later R6 blocks. Not exported from the
 * shared barrel; not activated by the public runtime.
 */
export function buildCandidateNarrativeAndOverallV3(input: CandidateNarrativeAndOverallInputV3): CandidateNarrativeAndOverallV3 {
  const calibration = input.calibration ?? CANDIDATE_CALIBRATION_V3;
  const core = buildCandidateInterpretationCoreV3({ answers: input.answers, calibration });
  const narrative = buildDiagnosticNarrative({
    answers: core.activeAnswers,
    scoring: core.scoring,
    priorities: core.priorities,
    semanticFacts: core.semanticFacts,
    bank: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
    questionTopics: CANDIDATE_QUESTION_TOPICS_V3,
  });
  const overall = buildDigitalPresenceStatus({
    scoring: core.scoring,
    priorities: core.priorities,
    semanticFacts: core.semanticFacts,
    narrative,
    // R8-A: index minimums/display, overall confidence and public bands all come from the candidate calibration.
    computeIndex: (scoring, options) => computeCandidateDigitalPresenceIndexV3(scoring, options, calibration.overall),
    computeConfidence: (scoring, index) => computeOverallConfidence(scoring, index, calibration.overall),
    bands: calibration.overall.bands,
  });
  return { ...core, narrative, overall };
}
