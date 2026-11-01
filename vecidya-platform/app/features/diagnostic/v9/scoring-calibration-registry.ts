import {
  CANDIDATE_CALIBRATION_ACTIVE_V4,
  CANDIDATE_CALIBRATION_BASELINE_V1,
  CANDIDATE_CALIBRATION_QUARTILES_V4,
  CANDIDATE_CALIBRATION_R8B_V2,
  CANDIDATE_CALIBRATION_REPRESENTATIVE_V3,
  type CandidateCalibrationV3,
} from "../qbv2-candidate-calibration";

export const V9_SCORING_CALIBRATION_REGISTRY_ID = "diag-v9-scoring-calibration-registry-v1" as const;
export const V9_CURRENT_SCORING_VERSION = CANDIDATE_CALIBRATION_ACTIVE_V4.identity;

const registry = new Map<string, CandidateCalibrationV3>([
  [CANDIDATE_CALIBRATION_BASELINE_V1.identity, CANDIDATE_CALIBRATION_BASELINE_V1],
  [CANDIDATE_CALIBRATION_R8B_V2.identity, CANDIDATE_CALIBRATION_R8B_V2],
  [CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.identity, CANDIDATE_CALIBRATION_REPRESENTATIVE_V3],
  [CANDIDATE_CALIBRATION_QUARTILES_V4.identity, CANDIDATE_CALIBRATION_QUARTILES_V4],
]);

export type V9ResolvedScoringCalibration = {
  readonly registryIdentity: typeof V9_SCORING_CALIBRATION_REGISTRY_ID;
  readonly scoringVersion: string;
  readonly calibration: CandidateCalibrationV3;
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

export function isV9CurrentPublicScoringVersion(scoringVersion: unknown): scoringVersion is typeof V9_CURRENT_SCORING_VERSION {
  return scoringVersion === V9_CURRENT_SCORING_VERSION;
}

export function listRegisteredV9ScoringVersions(): readonly string[] {
  return [...registry.keys()];
}
