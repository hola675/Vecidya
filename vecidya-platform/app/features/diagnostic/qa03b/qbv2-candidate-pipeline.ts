// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import { CANDIDATE_COMMERCIAL_IDENTITY_V3, buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "./qbv2-candidate-commercial";
import { CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3 } from "../qbv2-candidate-calibration";
import { CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 } from "./qbv2-candidate-overall";
import type { CandidateDigitalPresenceIndexV3 } from "./qbv2-candidate-overall";
import { CANDIDATE_PLANNER_IDENTITY_V3, buildCandidateQuestionPlanV3, type CandidateQuestionPlanV3 } from "./qbv2-candidate-planner";
import type { CommercialClarificationAnswer, CommercialLicense } from "../commercial-recommendation";
import type { DigitalPresenceStatus } from "../qbv2-overall";
import type { AnswersV2 } from "../qbv2-rules";

/**
 * DIAG-V3 activation boundary. This facade is candidate-only and intentionally is not re-exported
 * by the public diagnostic barrel or imported by any public route.
 */
export const CANDIDATE_PIPELINE_IDENTITY_V3 = "diag-v3-candidate-operation-history-v1" as const;

/** Minimal identity required to reproduce a candidate result without ceremonial per-function versions. */
export const CANDIDATE_RESULT_IDENTITY_V3 = Object.freeze({
  engine: CANDIDATE_PIPELINE_IDENTITY_V3,
  questionBank: "reviewed-evidence-v4",
  answerSchema: "qbv2-answers-v3",
  context: "diag-v3-context-operation-history-v1",
  planner: CANDIDATE_PLANNER_IDENTITY_V3,
  evidence: "r3-evidence-v3",
  applicability: "r4-applicability-operation-history-v1",
  scoring: "r3-evidence-v3+r4-applicability-operation-history-v1",
  calibration: CANDIDATE_CALIBRATION_IDENTITY_V3,
  calibrationVersion: CANDIDATE_CALIBRATION_VERSION_V3,
  siblingAggregation: "KEEP_CURRENT_MEAN",
  observability: CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3,
  overall: CANDIDATE_CALIBRATION_IDENTITY_V3,
  recommendations: "candidate-recommendations-r6+operation-history-v1",
  commercial: CANDIDATE_COMMERCIAL_IDENTITY_V3,
  methodology: "diagnostic-methodology-3.0",
  report: "diagnostic-report-v1.0",
} as const);

export type CandidatePipelineOptionsV3 = {
  readonly currentLicense?: CommercialLicense;
  readonly clarificationAnswer?: CommercialClarificationAnswer;
};

export type CandidatePipelineResultV3 = Omit<CandidateCommercialBoundaryV3, "overall"> & {
  /** Candidate observability augments, but does not alter, the shared base index contract. */
  readonly overall: Omit<DigitalPresenceStatus, "index"> & { readonly index: CandidateDigitalPresenceIndexV3 };
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly plan: CandidateQuestionPlanV3;
};

/** Fail closed if a persisted/exported result claims to come from a different engine contract. */
export function isCandidateResultIdentityV3(value: unknown): value is typeof CANDIDATE_RESULT_IDENTITY_V3 {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Object.keys(CANDIDATE_RESULT_IDENTITY_V3).every((key) => candidate[key] === CANDIDATE_RESULT_IDENTITY_V3[key as keyof typeof CANDIDATE_RESULT_IDENTITY_V3])
    && Object.keys(candidate).length === Object.keys(CANDIDATE_RESULT_IDENTITY_V3).length;
}

/** Canonical complete candidate result pipeline. Does not activate or import the public runtime. */
export function runCandidateDiagnosticPipelineV3(answers: AnswersV2, options: CandidatePipelineOptionsV3 = {}): CandidatePipelineResultV3 {
  const plan = buildCandidateQuestionPlanV3({ answers });
  const result = buildCandidateCommercialBoundaryV3({
    answers: plan.activeAnswers,
    currentLicense: options.currentLicense,
    clarificationAnswer: options.clarificationAnswer,
  });
  return { ...result, engineIdentity: CANDIDATE_RESULT_IDENTITY_V3, plan };
}

