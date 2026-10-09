import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-dimensions";
import type { DiagnosticScoringView } from "./qbv2-diagnostic-view";
import { computeDigitalPresenceIndex, displayScoreForBands, type DigitalPresenceIndex, type OverallIndexModel } from "./qbv2-overall";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "./qbv2-candidate-interpretation";
import { CANDIDATE_CALIBRATION_V3 } from "./qbv2-candidate-calibration";
import { buildCandidateQuestionPlanV3 } from "./qbv2-candidate-planner";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import type { AnswersV2 } from "./qbv2-rules";
import type { RouteBudgetV1 } from "./qbv2-planner";

export const CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 = "diag-v3-candidate-context-observability-v1" as const;
export type CandidateObservabilityReasonV3 =
  | "not_applicable"
  | "context_unresolved"
  | "no_direct_source_in_bank"
  | "no_direct_source_in_context"
  | "direct_source_reachable"
  | "observed_direct"
  | "respondent_unknown"
  | "respondent_not_applicable"
  | "respondent_non_scoring_answer"
  | "budget_blocked"
  | "hard_cap_blocked";
export type CandidateDimensionObservabilityV3 = {
  readonly dimension: DigitalDimensionId;
  readonly applicable: boolean;
  readonly applicability: "applicable" | "not_applicable" | "insufficient_context";
  readonly directSourceQuestionIds: readonly string[];
  readonly reachableDirectQuestionIds: readonly string[];
  readonly answeredDirectQuestionIds: readonly string[];
  readonly observedDirect: boolean;
  readonly reason: CandidateObservabilityReasonV3;
};

/** Bank-wide H0 baseline: dimensions with no DIRECT source anywhere in the reviewed R3 bank (currently Measurement). */
export const CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3: ReadonlySet<DigitalDimensionId> = new Set(
  DIGITAL_DIMENSION_IDS.filter((id) => CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(id).length === 0),
);

export type CandidateDigitalPresenceIndexV3 = DigitalPresenceIndex & {
  readonly observabilityModel: typeof CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3;
  /** Applicable dimensions without a DIRECT opportunity in this context; excludes instrument gaps from coverage. */
  readonly unobservableApplicableDimensions: readonly DigitalDimensionId[];
  readonly observableApplicableDimensions: readonly DigitalDimensionId[];
  readonly coverageDenominator: number;
  readonly dimensionObservability: readonly CandidateDimensionObservabilityV3[];
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Candidate-only index: R4 applicability and observed scores stay untouched; coverage denominator comes from
 * DIRECT source opportunities in the R5 plan. Legacy overall functions remain unchanged and this path is private.
 * The overall numeric model is still calibration-owned; the separately versioned observability model cannot be
 * changed by calibration. Index availability may change, but rawScore remains the same mean of scored dimensions.
 */
export function computeCandidateDigitalPresenceIndexV3(scoring: DiagnosticScoringView, options: { readonly prelaunch?: boolean } = {}, model: OverallIndexModel = CANDIDATE_CALIBRATION_V3.overall, answers: AnswersV2 = {}, budget?: RouteBudgetV1): CandidateDigitalPresenceIndexV3 {
  const base = computeDigitalPresenceIndex(scoring, { ...options, model });
  // R5 owns opportunity: its evidenceUsefulQuestionIds include viable DIRECT questions even when the
  // selected route/module budget cannot fit them. We derive dimensions from those planner-owned questions,
  // never reimplement eligibility, gates, prospectivity, utility, or budget here.
  const plan = buildCandidateQuestionPlanV3({ answers, budget });
  const questionById = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));
  const traceById = new Map(plan.trace.map((entry) => [entry.questionId, entry]));
  const usefulDirectQuestionIdsByDimension = new Map<DigitalDimensionId, string[]>();
  for (const questionId of plan.evidenceSufficiency.usefulEvidenceQuestionIds) {
    const question = questionById.get(questionId);
    if (question?.evidenceMigration !== "migrated" || !question.evidenceV3) continue;
    for (const reading of question.evidenceV3.dimensions) {
      if (reading.directness !== "direct") continue;
      usefulDirectQuestionIdsByDimension.set(reading.dimension, [...(usefulDirectQuestionIdsByDimension.get(reading.dimension) ?? []), questionId]);
    }
  }
  const dimensionObservability = DIGITAL_DIMENSION_IDS.map((dimension): CandidateDimensionObservabilityV3 => {
    const result = scoring.dimensions.find((item) => item.id === dimension)!;
    const directSourceQuestionIds = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3
      .filter((question) => question.evidenceMigration === "migrated" && question.evidenceV3?.dimensions.some((reading) => reading.dimension === dimension && reading.directness === "direct"))
      .map((question) => question.id);
    const answeredDirectQuestionIds = directSourceQuestionIds.filter((questionId) => scoring.dimensions.some((item) => item.id === dimension && item.evidence.some((evidence) => evidence.questionId === questionId && evidence.directness === "direct")));
    const reachableDirectQuestionIds = [...new Set(usefulDirectQuestionIdsByDimension.get(dimension) ?? [])].sort();
    const observedDirect = result.score !== null && result.confidence.direct > 0;
    let reason: CandidateObservabilityReasonV3;
    if (result.applicability === "not_applicable") reason = "not_applicable";
    else if (result.applicability === "insufficient_context") reason = "context_unresolved";
    else if (directSourceQuestionIds.length === 0) reason = "no_direct_source_in_bank";
    else if (observedDirect) reason = "observed_direct";
    else if (answeredDirectQuestionIds.length > 0) {
      const states = result.evidence.filter((evidence) => answeredDirectQuestionIds.includes(evidence.questionId) && evidence.directness === "direct").map((evidence) => evidence.state);
      reason = states.includes("uncertainty") ? "respondent_unknown"
        : states.includes("not_applicable") ? "respondent_not_applicable"
          : "respondent_non_scoring_answer";
    } else if (reachableDirectQuestionIds.length > 0) {
      const skips = reachableDirectQuestionIds.map((id) => traceById.get(id)?.skipReason);
      reason = skips.includes("hard_cap") ? "hard_cap_blocked"
        : skips.some((skip) => skip === "base_budget" || skip === "module_budget") ? "budget_blocked"
          : "direct_source_reachable";
    } else if (directSourceQuestionIds.length > 0) reason = "no_direct_source_in_context";
    else reason = "no_direct_source_in_bank";
    return { dimension, applicable: result.applicability === "applicable", applicability: result.applicability, directSourceQuestionIds, reachableDirectQuestionIds, answeredDirectQuestionIds, observedDirect, reason };
  });
  const observableReasons = new Set<CandidateObservabilityReasonV3>(["observed_direct", "respondent_unknown", "respondent_not_applicable", "respondent_non_scoring_answer", "direct_source_reachable", "budget_blocked", "hard_cap_blocked"]);
  const unobservableApplicableDimensions = dimensionObservability.filter((item) => item.applicable && !observableReasons.has(item.reason)).map((item) => item.dimension);
  const observableApplicableDimensions = base.applicableDimensions.filter((id) => !unobservableApplicableDimensions.includes(id));
  const observableApplicable = observableApplicableDimensions.length;
  const coverage = observableApplicable === 0 ? base.coverage : round2(base.scoredDimensions.length / observableApplicable);
  const sufficient = !options.prelaunch && base.scoredDimensions.length >= model.minScoredDimensions
    && observableApplicable > 0 && base.scoredDimensions.length / observableApplicable >= model.minCoverage;
  // R8-A: the score follows the candidate's own sufficiency, never the legacy-denominator one. With today's
  // model both always agree (3+ scored of at most 8 dimensions always clears 1/3); a recalibrated minimum
  // coverage could otherwise yield `sufficient` without a score, or a score without `sufficient`.
  const byId = new Map(scoring.dimensions.map((item) => [item.id, item]));
  const rawScore = sufficient ? base.scoredDimensions.reduce((total, id) => total + byId.get(id)!.score!, 0) / base.scoredDimensions.length : null;
  return { ...base, rawScore, displayScore: rawScore === null ? null : displayScoreForBands(rawScore, model.bands), coverage, sufficient, unobservableApplicableDimensions, observableApplicableDimensions, coverageDenominator: observableApplicable, dimensionObservability, observabilityModel: CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 };
}
