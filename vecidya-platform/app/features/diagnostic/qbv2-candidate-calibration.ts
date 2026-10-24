import type { CapabilityState } from "./qbv2-capability";
import type { DimensionCalibration, DimensionConfidenceModel, DimensionScoringModel } from "./qbv2-contextual-scoring";
import type { OverallIndexModel } from "./qbv2-overall";
import type { SeverityBands } from "./qbv2-priorities";

/**
 * DIAG-V3-R8-A — candidate-only calibration ownership. The shared constants (`CAPABILITY_CONTRIBUTION`,
 * `SCORING_MODEL`, `CONFIDENCE_MODEL`, `SEVERITY_BANDS`, `OVERALL_INDEX_MODEL`) also drive the legacy 85-question
 * runtime, so R8 can never tune them without silently recalibrating legacy. This model is the single numeric
 * authority of the candidate chain: the candidate scorer, priorities, semantic facts, recommendation
 * prerequisites and overall read it; legacy callers keep their defaults. It owns numbers only — never what an
 * answer means, its dimension, its directness, applicability, routing or commercial eligibility (R3–R7).
 * Static, immutable and deterministic; private (not barrel-exported) and not a runtime diagnostic version.
 * Every adopted numeric set is versioned and kept: v1 (R8-A baseline) stays reproducible after v2 (R8-B).
 */
export type CandidateCalibrationIdentityV3 = "diag-v3-candidate-calibration-v1" | "diag-v3-candidate-calibration-v2" | "diag-v3-candidate-calibration-v3" | "diag-v3-candidate-calibration-v4";
export type CandidateCalibrationVersionV3 = 1 | 2 | 3 | 4;
export type CandidateScoreRangeV4 = {
  readonly id: "initial" | "developing" | "functional" | "strong";
  readonly label: string;
  readonly minimum: number;
  readonly maximum: number;
};

/**
 * R3 neutral states never contribute. This numeric/null partition is frozen at the type level: candidate
 * routing (R5), score null-ness and direct-evidence counts depend on it, so no calibration may move it.
 */
export type NeutralCapabilityState = "constraint" | "uncertainty" | "not_applicable";
export type CalibratedCapabilityState = Exclude<CapabilityState, NeutralCapabilityState>;
export type CandidateCapabilityContributionV3 = { readonly [S in CalibratedCapabilityState]: number } & { readonly [S in NeutralCapabilityState]: null };

export type CandidateCalibrationV3 = {
  readonly identity: CandidateCalibrationIdentityV3;
  readonly version: CandidateCalibrationVersionV3;
  readonly capabilityContribution: CandidateCapabilityContributionV3;
  readonly scoring: DimensionScoringModel;
  readonly dimensionConfidence: DimensionConfidenceModel;
  readonly severity: SeverityBands;
  readonly overall: OverallIndexModel;
  readonly scoreRanges?: readonly CandidateScoreRangeV4[];
};

export const CANDIDATE_SCORE_RANGES_V4: readonly CandidateScoreRangeV4[] = deepFreeze([
  { id: "initial", label: "Base inicial", minimum: 0, maximum: 25 },
  { id: "developing", label: "En desarrollo", minimum: 26, maximum: 50 },
  { id: "functional", label: "Funcional", minimum: 51, maximum: 75 },
  { id: "strong", label: "Sólida", minimum: 76, maximum: 100 },
]);

export function classifyCandidateScoreRangeV4(score: number | null, ranges: readonly CandidateScoreRangeV4[] = CANDIDATE_SCORE_RANGES_V4): CandidateScoreRangeV4["id"] | null {
  if (score === null || !Number.isInteger(score) || score < 0 || score > 100) return null;
  return ranges.find((range) => score >= range.minimum && score <= range.maximum)?.id ?? null;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

/**
 * v1 — R8-A baseline (historical, immutable): reproduces the shared model value-for-value. The values are
 * deliberately literal, not references to the shared constants, so the candidate can diverge while the shared
 * (legacy) constants stay frozen.
 */
export const CANDIDATE_CALIBRATION_BASELINE_V1: CandidateCalibrationV3 = deepFreeze({
  identity: "diag-v3-candidate-calibration-v1",
  version: 1,
  capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
  scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
  dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 },
  severity: { materialBelow: 50, moderateBelow: 75 },
  overall: {
    minScoredDimensions: 3,
    minCoverage: 1 / 3,
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

/**
 * v2 — R8-B dimension calibration. Only the dimension-confidence thresholds move (medium 1.5 → 1, high 3 → 2),
 * so a level now counts independent DIRECT observations: one clean observation (the unit the certified R5
 * planner treats as resolving a dimension) is `medium`, two consistent ones (corroboration) are `high`, and
 * supporting can lift one observation only to 1.5 — never to `high`. Penalties (contradiction, unknown answers)
 * still drop one level each. Contributions and supporting weights are unchanged: R3 certifies `established` as
 * declared habitual functioning, not excellence, so it stays between `partial` and `strong`; supporting keeps
 * its certified half-weight. Severity and the overall model are R8-C's and stay at v1 values.
 */
export const CANDIDATE_CALIBRATION_R8B_V2: CandidateCalibrationV3 = deepFreeze({
  identity: "diag-v3-candidate-calibration-v2",
  version: 2,
  capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
  scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
  dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1, highAt: 2 },
  severity: { materialBelow: 50, moderateBelow: 75 },
  overall: {
    minScoredDimensions: 3,
    minCoverage: 1 / 3,
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

/**
 * v3 — DIAG-MOTOR-02 proposal, not adopted by the active pipeline. It keeps the certified contribution,
 * dimension-confidence, equal-mean, band, and overall-confidence rules. It raises the global-index coverage floor
 * to 60% of ALL applicable dimensions (at least three readings), so an applicable gap cannot disappear from the
 * displayed coverage denominator. It is evaluated beside v2 on the reviewed corpus; methodology review is required
 * before changing CANDIDATE_CALIBRATION_V3 or the Worker result contract.
 */
export const CANDIDATE_CALIBRATION_REPRESENTATIVE_V3: CandidateCalibrationV3 = deepFreeze({
  identity: "diag-v3-candidate-calibration-v3",
  version: 3,
  capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
  scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
  dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1, highAt: 2 },
  severity: { materialBelow: 50, moderateBelow: 75 },
  overall: {
    minScoredDimensions: 3,
    minCoverage: 0.6,
    coverageBasis: "applicable_dimensions",
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

/**
 * v4 — DIAG-MOTOR-04 adopted QA-03B calibration. Keeps the representativeness gate (three direct readings and 60% of
 * applicable dimensions), equal dimension weighting, contributions and confidence. It adds four adjacent integer
 * ranges whose boundaries match the displayed percentage; this deterministic choice is not empirical validation.
 */
export const CANDIDATE_CALIBRATION_QUARTILES_V4: CandidateCalibrationV3 = deepFreeze({
  identity: "diag-v3-candidate-calibration-v4",
  version: 4,
  capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
  scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
  dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1, highAt: 2 },
  severity: { materialBelow: 50, moderateBelow: 75 },
  overall: {
    minScoredDimensions: 3,
    minCoverage: 0.6,
    coverageBasis: "applicable_dimensions",
    bands: { developingFrom: 26, solidFrom: 51, verySolidFrom: 76 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
  scoreRanges: CANDIDATE_SCORE_RANGES_V4,
});

/** Frozen R8 default retained for historical calibration experiments and lower-level compatibility. */
export const CANDIDATE_CALIBRATION_V3: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2;
export const CANDIDATE_CALIBRATION_IDENTITY_V3 = CANDIDATE_CALIBRATION_V3.identity;
export const CANDIDATE_CALIBRATION_VERSION_V3 = CANDIDATE_CALIBRATION_V3.version;

/** Calibration used by the active QA-03B browser journey and authoritative Worker replay. */
export const CANDIDATE_CALIBRATION_ACTIVE_V4: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_QUARTILES_V4;

/** The dimension-level slice the shared scoring core consumes. */
export function candidateDimensionCalibrationV3(calibration: CandidateCalibrationV3): DimensionCalibration {
  return { scoring: calibration.scoring, confidence: calibration.dimensionConfidence };
}
