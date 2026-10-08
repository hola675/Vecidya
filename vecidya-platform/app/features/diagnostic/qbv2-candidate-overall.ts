import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-dimensions";
import type { DiagnosticScoringView } from "./qbv2-diagnostic-view";
import { computeDigitalPresenceIndex, displayScoreForBands, type DigitalPresenceIndex, type OverallIndexModel } from "./qbv2-overall";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "./qbv2-candidate-interpretation";
import { CANDIDATE_CALIBRATION_V3 } from "./qbv2-candidate-calibration";

/**
 * DIAG-V3-R6-B overall observability audit: the candidate-38 bank has zero direct evidence sources for
 * Measurement & Optimization, so it can never be scored regardless of what the respondent answers. Counting
 * it in the coverage denominator the same way as a dimension the respondent simply hasn't been asked about
 * yet (an "instrument limit" vs. a "respondent limit", see R6-B §21) can understate coverage/confidence for
 * otherwise well-answered routes. This is a bank-level property — the same for every context — not a
 * per-answer computation.
 */
export const CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3: ReadonlySet<DigitalDimensionId> = new Set(
  DIGITAL_DIMENSION_IDS.filter((id) => CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(id).length === 0),
);

export type CandidateDigitalPresenceIndexV3 = DigitalPresenceIndex & {
  /** Applicable dimensions the candidate bank can never score (zero direct source), regardless of answers. */
  readonly unobservableApplicableDimensions: readonly DigitalDimensionId[];
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Candidate-only index: identical to `computeDigitalPresenceIndex` (same `rawScore`, `displayScore`,
 * `applicableDimensions`, `excluded` — no R4 applicability state, no score, is fabricated or hidden), except
 * `coverage`/`sufficient` exclude bank-unobservable applicable dimensions from the denominator. Legacy
 * `computeDigitalPresenceIndex`/`buildDigitalPresenceStatus` are untouched; this never runs for legacy callers.
 * R8-A: the numeric model (minimums, bands for the display score) is the candidate calibration's; the
 * observability exclusion is semantic and no calibration may re-add an unobservable dimension.
 */
export function computeCandidateDigitalPresenceIndexV3(scoring: DiagnosticScoringView, options: { readonly prelaunch?: boolean } = {}, model: OverallIndexModel = CANDIDATE_CALIBRATION_V3.overall): CandidateDigitalPresenceIndexV3 {
  const base = computeDigitalPresenceIndex(scoring, { ...options, model });
  const unobservableApplicableDimensions = base.applicableDimensions.filter((id) => CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id));
  const observableApplicable = base.applicableDimensions.length - unobservableApplicableDimensions.length;
  const coverage = observableApplicable === 0 ? base.coverage : round2(base.scoredDimensions.length / observableApplicable);
  const sufficient = !options.prelaunch && base.scoredDimensions.length >= model.minScoredDimensions
    && observableApplicable > 0 && base.scoredDimensions.length / observableApplicable >= model.minCoverage;
  // R8-A: the score follows the candidate's own sufficiency, never the legacy-denominator one. With today's
  // model both always agree (3+ scored of at most 8 dimensions always clears 1/3); a recalibrated minimum
  // coverage could otherwise yield `sufficient` without a score, or a score without `sufficient`.
  const byId = new Map(scoring.dimensions.map((item) => [item.id, item]));
  const rawScore = sufficient ? base.scoredDimensions.reduce((total, id) => total + byId.get(id)!.score!, 0) / base.scoredDimensions.length : null;
  return { ...base, rawScore, displayScore: rawScore === null ? null : displayScoreForBands(rawScore, model.bands), coverage, sufficient, unobservableApplicableDimensions };
}
