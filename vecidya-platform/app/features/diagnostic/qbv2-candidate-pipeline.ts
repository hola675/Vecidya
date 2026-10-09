import { CANDIDATE_COMMERCIAL_IDENTITY_V3, buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "./qbv2-candidate-commercial";
import { CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3 } from "./qbv2-candidate-calibration";
import { CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 } from "./qbv2-candidate-overall";
import type { CandidateDigitalPresenceIndexV3 } from "./qbv2-candidate-overall";
import { CANDIDATE_PLANNER_IDENTITY_V3, buildCandidateQuestionPlanV3, type CandidateQuestionPlanV3 } from "./qbv2-candidate-planner";
import type { CommercialClarificationAnswer, CommercialLicense } from "./commercial-recommendation";
import type { DigitalPresenceStatus } from "./qbv2-overall";
import type { AnswersV2 } from "./qbv2-rules";

/**
 * DIAG-V3 activation boundary. This facade is candidate-only and intentionally is not re-exported
 * by the public diagnostic barrel or imported by any public route.
 */
export const CANDIDATE_PIPELINE_IDENTITY_V3 = "diag-v3-candidate-context-observability-v1" as const;

/** Minimal identity required to reproduce a candidate result without ceremonial per-function versions. */
export const CANDIDATE_RESULT_IDENTITY_V3 = Object.freeze({
  engine: CANDIDATE_PIPELINE_IDENTITY_V3,
  questionBank: "reviewed-evidence-v3",
  answerSchema: "qbv2-answers-v2",
  planner: CANDIDATE_PLANNER_IDENTITY_V3,
  evidence: "r3-evidence-v3",
  applicability: "r4-applicability-v3",
  scoring: "r3-evidence-v3+r4-applicability-v3",
  calibration: CANDIDATE_CALIBRATION_IDENTITY_V3,
  calibrationVersion: CANDIDATE_CALIBRATION_VERSION_V3,
  siblingAggregation: "KEEP_CURRENT_MEAN",
  observability: CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3,
  overall: CANDIDATE_CALIBRATION_IDENTITY_V3,
  recommendations: "candidate-recommendations-r6-v1",
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

export const CANDIDATE_ACTIVATION_MANIFEST_V3 = Object.freeze({
  readiness: "NOT_READY",
  candidateActive: false,
  publicRuntimeChanged: false,
  candidateIdentity: CANDIDATE_RESULT_IDENTITY_V3,
  frozenDependencies: [
    "R3 reviewed evidence v3",
    "R4 applicability v3",
    "R5 candidate planner v2",
    "R6 candidate interpretation/recommendation/commercial builders",
    "R8 calibration v2",
    "O4 KEEP_CURRENT_MEAN",
    "O6 diag-v3-candidate-context-observability-v1",
  ],
  expectedRuntimeModules: [
    "app/features/diagnostic/qbv2-candidate-pipeline.ts",
    "app/features/diagnostic/qbv2-candidate-session.ts",
    "app/features/diagnostic/qbv2-candidate-planner.ts",
    "app/features/diagnostic/qbv2-candidate-scoring.ts",
    "app/features/diagnostic/qbv2-candidate-calibration.ts",
    "app/features/diagnostic/qbv2-candidate-interpretation.ts",
    "app/features/diagnostic/qbv2-candidate-overall.ts",
    "app/features/diagnostic/qbv2-candidate-narrative.ts",
    "app/features/diagnostic/qbv2-candidate-recommendations.ts",
    "app/features/diagnostic/qbv2-candidate-solutions.ts",
    "app/features/diagnostic/qbv2-candidate-commercial.ts",
    "app/features/diagnostic/qbv2-reviewed-evidence.ts",
    "app/features/diagnostic/qbv2-reviewed-candidate.ts",
    "app/features/diagnostic/qbv2-evidence-v3.ts",
    "app/features/diagnostic/qbv2-applicability.ts",
    "app/features/diagnostic/qbv2-contextual-scoring.ts",
    "app/features/diagnostic/qbv2-narrative.ts",
    "app/features/diagnostic/qbv2-overall.ts",
    "app/features/diagnostic/qbv2-recommendations.ts",
    "app/features/diagnostic/commercial-recommendation.ts",
  ],
  activationPreconditions: [
    "ACT-01 candidate session is versioned independently and verified in the local-only browser harness",
    "ACT-01 dev route and candidate modules remain absent from the production bundle",
    "public result and report adapters consume CandidatePipelineResultV3",
    "public methodology describes O6 context-observable coverage",
    "diagnostic and report route tests pass with candidate runtime selected",
    "bundle scan confirms candidate modules only enter intended diagnostic chunks",
  ],
  blockers: [
    "public DiagnosticFlow still uses the legacy V2 question bank, planner and runDiagnosticPipelineV3",
    "public result and report models accept legacy DiagnosticResultV3, not CandidatePipelineResultV3",
    "public methodology and report have not been certified against candidate coverage semantics",
  ],
  publicRouteTargets: ["/diagnostico", "/diagnostico/metodologia", "/diagnostico/informe"],
  rollback: {
    ref: "3a281ed37c525e032990072c71ce5cc8e019cd23",
    runtimeSelector: "revert the diagnostic flow/runtime imports to baseline; no selector exists yet",
    localStorage: "use a new candidate key; do not migrate or delete the legacy key; old sessions remain untouched and are resumable only after rollback",
    report: "restore the baseline report model/methodology imports; candidate results remain tagged with engineIdentity and are not reinterpreted",
  },
} as const);
