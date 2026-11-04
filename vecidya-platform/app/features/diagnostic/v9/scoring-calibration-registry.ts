import type { V9Calibration } from "./scoring-contract";

export const V9_SCORING_CALIBRATION_REGISTRY_ID = "diag-v9-scoring-calibration-registry-v1" as const;

const contribution = Object.freeze({
  strong: 1,
  established: 0.75,
  partial: 0.5,
  weak: 0.25,
  dependency: 0.25,
  missing: 0,
  constraint: null,
  uncertainty: null,
  not_applicable: null,
} as const);

const scoring = Object.freeze({
  directWeight: 1,
  supportingWeight: 0.5,
  supportingCapRatio: 0.5,
} as const);

const severity = Object.freeze({
  materialBelow: 50,
  moderateBelow: 75,
} as const);

const confidenceV1 = Object.freeze({
  supportingWeight: 0.5,
  mediumAt: 1.5,
  highAt: 3,
} as const);

const confidenceV2 = Object.freeze({
  supportingWeight: 0.5,
  mediumAt: 1,
  highAt: 2,
} as const);

export const V9_CALIBRATION_V1: V9Calibration = Object.freeze({
  identity: "diag-v3-candidate-calibration-v1",
  version: 1,
  capabilityContribution: contribution,
  scoring,
  dimensionConfidence: confidenceV1,
  severity,
  overall: {
    minScoredDimensions: 3,
    minCoverage: 1 / 3,
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

export const V9_CALIBRATION_V2: V9Calibration = Object.freeze({
  identity: "diag-v3-candidate-calibration-v2",
  version: 2,
  capabilityContribution: contribution,
  scoring,
  dimensionConfidence: confidenceV2,
  severity,
  overall: {
    minScoredDimensions: 3,
    minCoverage: 1 / 3,
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

export const V9_CALIBRATION_V3: V9Calibration = Object.freeze({
  identity: "diag-v3-candidate-calibration-v3",
  version: 3,
  capabilityContribution: contribution,
  scoring,
  dimensionConfidence: confidenceV2,
  severity,
  overall: {
    minScoredDimensions: 3,
    minCoverage: 0.6,
    coverageBasis: "applicable_dimensions" as const,
    bands: { developingFrom: 41, solidFrom: 71 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
});

export const V9_CALIBRATION_V4: V9Calibration = Object.freeze({
  identity: "diag-v3-candidate-calibration-v4",
  version: 4,
  capabilityContribution: contribution,
  scoring,
  dimensionConfidence: confidenceV2,
  severity,
  overall: {
    minScoredDimensions: 3,
    minCoverage: 0.6,
    coverageBasis: "applicable_dimensions" as const,
    bands: { developingFrom: 26, solidFrom: 51, verySolidFrom: 76 },
    confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
  },
  scoreRanges: [
    { id: "initial", label: "Base inicial", minimum: 0, maximum: 25 },
    { id: "developing", label: "En desarrollo", minimum: 26, maximum: 50 },
    { id: "functional", label: "Funcional", minimum: 51, maximum: 75 },
    { id: "strong", label: "Sólida", minimum: 76, maximum: 100 },
  ] as const,
});

export const V9_CURRENT_SCORING_VERSION = V9_CALIBRATION_V4.identity;

const registry = new Map<string, V9Calibration>([
  [V9_CALIBRATION_V1.identity, V9_CALIBRATION_V1],
  [V9_CALIBRATION_V2.identity, V9_CALIBRATION_V2],
  [V9_CALIBRATION_V3.identity, V9_CALIBRATION_V3],
  [V9_CALIBRATION_V4.identity, V9_CALIBRATION_V4],
]);

export type V9ResolvedScoringCalibration = {
  readonly registryIdentity: typeof V9_SCORING_CALIBRATION_REGISTRY_ID;
  readonly scoringVersion: string;
  readonly calibration: V9Calibration;
};

export function resolveV9ScoringCalibration(scoringVersion: string): V9ResolvedScoringCalibration {
  const calibration = registry.get(scoringVersion);
  if (!calibration) throw new Error("v9_scoring_version_unregistered");
  if (calibration.identity !== scoringVersion) throw new Error("v9_scoring_calibration_identity_mismatch");
  return {
    registryIdentity: V9_SCORING_CALIBRATION_REGISTRY_ID,
    scoringVersion,
    calibration,
  };
}

export function isV9CurrentPublicScoringVersion(
  scoringVersion: unknown,
): scoringVersion is typeof V9_CURRENT_SCORING_VERSION {
  return scoringVersion === V9_CURRENT_SCORING_VERSION;
}

export function listRegisteredV9ScoringVersions(): readonly string[] {
  return [...registry.keys()];
}
