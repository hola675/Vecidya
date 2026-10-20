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
  readiness: "READY_WITH_EXPLICIT_BLOCKERS",
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
    "app/components/diagnostic-flow/candidate-diagnostic-flow.tsx",
    "app/components/diagnostic-flow/candidate-result.tsx",
    "app/components/diagnostic-flow/candidate-presentation.ts",
    "app/components/diagnostic-report/diagnostic-report.tsx",
    "app/routes/dev-diagnostic-candidate.tsx",
    "app/routes/dev-diagnostic-candidate-methodology.tsx",
    "app/routes/dev-diagnostic-candidate-report.tsx",
    "app/routes.ts",
  ],
  candidateEntrypoint: "app/routes.ts -> /__dev/diagnostico/candidate; development-only while ACT-04 is pending",
  candidateSession: {
    schemaVersion: 2,
    storageKey: "vecidya.diagnostic.v3.candidate.session.2",
    persistence: "localStorage client-only; result is reconstructed from active candidate answers; completedAt is stable across result and report reconstruction",
    concurrency: "Web Locks serialize read-check-write and clear when available; otherwise optimistic revision checks and storage events fail closed, without an atomicity guarantee",
    retention: "14-day logical expiry is checked on localStorage access; physical removal occurs on a later read after expiry, not at an exact scheduled time",
    rollback: "preserve this key and engine identity; never parse it with the legacy pipeline",
  },
  candidateMethodologyRoute: "/__dev/diagnostico/candidate/metodologia",
  candidateReportRoute: "/__dev/diagnostico/candidate/informe",
  activationPreconditions: [
    "The selected cutover target requires server-authoritative replay with exact engine and answer-schema identity; that same versioned result must feed the anonymous summary and identified report",
    "ACT-04 must switch /diagnostico, /diagnostico/metodologia and /diagnostico/informe together to candidate session, result, methodology and report adapters",
    "Keep the candidate session key and exact engine identity; do not migrate or reinterpret legacy sessions",
    "Run the full local candidate and legacy E2E suites, typecheck, production build and anonymous route-isolation checks after the cutover change",
    "Obtain explicit authorization for ACT-04; ACT-03 does not activate, deploy or publish",
  ],
  ownerReview: {
    id: "PDF_OWNER_REVIEW",
    owner: "project_owner",
    blocking: false,
    pdfUaCertified: false,
  },
  blockers: [
    "The selected cutover target lacks server-authoritative replay; public summary and identified report must consume the same validated versioned result before ACT-04",
  ],
  publicRouteTargets: ["/diagnostico", "/diagnostico/metodologia", "/diagnostico/informe"],
  activationStrategy: "Replace the route adapters and runtime imports for the three publicRouteTargets in one ACT-04 change; keep the candidate route dev-only until then.",
  bundleExpectation: "Current production build excludes candidate entry/modules; isolated minified candidate UI closure measured 513253 bytes (117103 gzip), with React, React DOM and React Router external/shared.",
  postActivationChecks: [
    "Anonymous HTTP checks confirm the three public routes use candidate contracts and the dev-only route returns 404",
    "Complete fresh candidate session, edit/replan, reload/resume, result, methodology and A4/Carta report in the local production-equivalent runtime; report dates keep completedAt stable while generatedAt reflects each export",
    "Legacy session bytes remain unchanged and are never reinterpreted by the candidate",
    "Run typecheck, build, legacy characterization, ACT-01/02/03, O4/O6 and R8-FINAL suites",
    "Record dated anonymous HTTP evidence and deploy status in ENVIRONMENTS.md only after an authorized deploy",
  ],
  rollback: {
    ref: "a8b1d08",
    runtimeSelector: "revert the ACT-04 public route/runtime adapter changes to the ACT-03 baseline so the legacy public runtime is selected again",
    localStorage: "use a new candidate key; do not migrate or delete the legacy key; old sessions remain untouched and are resumable only after rollback",
    report: "restore the baseline report model/methodology imports; candidate results remain tagged with engineIdentity and are not reinterpreted",
  },
} as const);
