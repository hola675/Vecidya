// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import { CANDIDATE_COMMERCIAL_IDENTITY_V3, buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "./qbv2-candidate-commercial";
import { CANDIDATE_CALIBRATION_ACTIVE_V4, classifyCandidateScoreRangeV4 } from "../qbv2-candidate-calibration";
import type { CandidateScoreRangeV4 } from "../qbv2-candidate-calibration";
import type { CandidateCalibrationV3 } from "../qbv2-candidate-calibration";
import { CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 } from "./qbv2-candidate-overall";
import type { CandidateDigitalPresenceIndexV3 } from "./qbv2-candidate-overall";
import { CANDIDATE_PLANNER_IDENTITY_V3, buildCandidateQuestionPlanV3, type CandidateQuestionPlanV3 } from "./qbv2-candidate-planner";
import { ANSWER_SCHEMA_ID, APPLICABILITY_ID, CONTEXT_ID, PIPELINE_ID, QUESTION_BANK_ID, SCORING_ID } from "./contract";
import type { CommercialClarificationAnswer, CommercialLicense } from "../commercial-recommendation";
import type { DigitalPresenceStatus } from "../qbv2-overall";
import type { AnswersV2 } from "../qbv2-rules";

/**
 * QA-03B engine boundary. The public journey consumes this facade through the strict Worker replay
 * path; the legacy public diagnostic barrel remains a separate, versioned engine.
 */
export const CANDIDATE_PIPELINE_IDENTITY_V3 = PIPELINE_ID;

/** Minimal identity required to reproduce a candidate result without ceremonial per-function versions. */
export const CANDIDATE_RESULT_IDENTITY_V3 = Object.freeze({
  engine: CANDIDATE_PIPELINE_IDENTITY_V3,
  questionBank: QUESTION_BANK_ID,
  answerSchema: ANSWER_SCHEMA_ID,
  context: CONTEXT_ID,
  planner: CANDIDATE_PLANNER_IDENTITY_V3,
  evidence: "r3-evidence-v4",
  applicability: APPLICABILITY_ID,
  scoring: SCORING_ID,
  calibration: CANDIDATE_CALIBRATION_ACTIVE_V4.identity,
  calibrationVersion: CANDIDATE_CALIBRATION_ACTIVE_V4.version,
  siblingAggregation: "KEEP_CURRENT_MEAN",
  observability: CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3,
  overall: CANDIDATE_CALIBRATION_ACTIVE_V4.identity,
  recommendations: "candidate-recommendations-r6+operation-history-v1",
  commercial: CANDIDATE_COMMERCIAL_IDENTITY_V3,
  methodology: "diagnostic-methodology-3.2",
  report: "diagnostic-report-v1.2",
} as const);

export type CandidatePipelineOptionsV3 = {
  readonly currentLicense?: CommercialLicense;
  readonly clarificationAnswer?: CommercialClarificationAnswer;
  /** Explicit calibration override for isolated, versioned QA evaluation. */
  readonly calibration?: CandidateCalibrationV3;
};

export type CandidatePipelineResultV3 = Omit<CandidateCommercialBoundaryV3, "overall"> & {
  /** Candidate observability augments, but does not alter, the shared base index contract. */
  readonly overall: Omit<DigitalPresenceStatus, "index"> & { readonly index: CandidateDigitalPresenceIndexV3; readonly scoreRange?: CandidateScoreRangeV4 | null };
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3 | (Omit<typeof CANDIDATE_RESULT_IDENTITY_V3, "calibration" | "calibrationVersion" | "overall" | "report"> & { readonly calibration: CandidateCalibrationV3["identity"]; readonly calibrationVersion: CandidateCalibrationV3["version"]; readonly overall: CandidateCalibrationV3["identity"]; readonly report: string });
  readonly plan: CandidateQuestionPlanV3;
};

/** Fail closed if a persisted/exported result claims to come from a different engine contract. */
export function isCandidateResultIdentityV3(value: unknown): value is typeof CANDIDATE_RESULT_IDENTITY_V3 {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Object.keys(CANDIDATE_RESULT_IDENTITY_V3).every((key) => candidate[key] === CANDIDATE_RESULT_IDENTITY_V3[key as keyof typeof CANDIDATE_RESULT_IDENTITY_V3])
    && Object.keys(candidate).length === Object.keys(CANDIDATE_RESULT_IDENTITY_V3).length;
}

/** Canonical QA-03B result pipeline used by the browser journey and authoritative Worker replay. */
export function runCandidateDiagnosticPipelineV3(answers: AnswersV2, options: CandidatePipelineOptionsV3 = {}): CandidatePipelineResultV3 {
  const calibration = options.calibration ?? CANDIDATE_CALIBRATION_ACTIVE_V4;
  const plan = buildCandidateQuestionPlanV3({ answers });
  const result = buildCandidateCommercialBoundaryV3({
    answers: plan.activeAnswers,
    currentLicense: options.currentLicense,
    clarificationAnswer: options.clarificationAnswer,
    calibration,
  });
  if (calibration.identity === CANDIDATE_CALIBRATION_ACTIVE_V4.identity) {
    const rangeId = classifyCandidateScoreRangeV4(result.overall.index.displayScore, calibration.scoreRanges);
    const scoreRange = rangeId ? calibration.scoreRanges?.find((item) => item.id === rangeId) ?? null : null;
    return { ...result, overall: { ...result.overall, scoreRange }, engineIdentity: CANDIDATE_RESULT_IDENTITY_V3, plan };
  }
  const engineIdentity = Object.freeze({ ...CANDIDATE_RESULT_IDENTITY_V3,
    calibration: calibration.identity, calibrationVersion: calibration.version, overall: calibration.identity,
    report: CANDIDATE_RESULT_IDENTITY_V3.report,
  });
  const score = result.overall.index.displayScore;
  const range = calibration.scoreRanges ? classifyCandidateScoreRangeV4(score) : null;
  return { ...result, overall: { ...result.overall, scoreRange: range ? calibration.scoreRanges!.find((item) => item.id === range) ?? null : null }, engineIdentity, plan } as CandidatePipelineResultV3;
}
