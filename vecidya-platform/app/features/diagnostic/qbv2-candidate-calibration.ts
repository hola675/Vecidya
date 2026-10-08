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
 */
export const CANDIDATE_CALIBRATION_IDENTITY_V3 = "diag-v3-candidate-calibration-v1" as const;
export const CANDIDATE_CALIBRATION_VERSION_V3 = 1 as const;

/**
 * R3 neutral states never contribute. This numeric/null partition is frozen at the type level: candidate
 * routing (R5), score null-ness and direct-evidence counts depend on it, so no calibration may move it.
 */
export type NeutralCapabilityState = "constraint" | "uncertainty" | "not_applicable";
export type CalibratedCapabilityState = Exclude<CapabilityState, NeutralCapabilityState>;
export type CandidateCapabilityContributionV3 = { readonly [S in CalibratedCapabilityState]: number } & { readonly [S in NeutralCapabilityState]: null };

export type CandidateCalibrationV3 = {
  readonly identity: typeof CANDIDATE_CALIBRATION_IDENTITY_V3;
  readonly version: typeof CANDIDATE_CALIBRATION_VERSION_V3;
  readonly capabilityContribution: CandidateCapabilityContributionV3;
  readonly scoring: DimensionScoringModel;
  readonly dimensionConfidence: DimensionConfidenceModel;
  readonly severity: SeverityBands;
  readonly overall: OverallIndexModel;
};

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

/**
 * Baseline (R8-A): reproduces the shared model value-for-value, so candidate outputs are unchanged. The values
 * are deliberately literal, not references to the shared constants: from R8-B on, the candidate may diverge
 * here while the shared (legacy) constants stay frozen.
 */
export const CANDIDATE_CALIBRATION_V3: CandidateCalibrationV3 = deepFreeze({
  identity: CANDIDATE_CALIBRATION_IDENTITY_V3,
  version: CANDIDATE_CALIBRATION_VERSION_V3,
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

/** The dimension-level slice the shared scoring core consumes. */
export function candidateDimensionCalibrationV3(calibration: CandidateCalibrationV3): DimensionCalibration {
  return { scoring: calibration.scoring, confidence: calibration.dimensionConfidence };
}
