import type {
  V9Calibration,
  V9ContextualDimensionResult,
  V9DigitalDimensionId,
} from "./scoring-contract";
import { V9_DIGITAL_DIMENSIONS } from "./scoring-contract";

export const V9_OVERALL_INDEX_ID = "diag-v9-overall-index-v1" as const;
export const V9_HISTORICAL_OVERALL_COMPAT_ID = "diag-v9-historical-observable-overall-compat-v1" as const;
export type V9OverallIndexIdentity =
  | typeof V9_OVERALL_INDEX_ID
  | typeof V9_HISTORICAL_OVERALL_COMPAT_ID;

export type V9OverallIndex = {
  readonly identity: V9OverallIndexIdentity;
  readonly rawScore: number | null;
  readonly displayScore: number | null;
  readonly scoredDimensions: readonly V9DigitalDimensionId[];
  readonly applicableDimensions: readonly V9DigitalDimensionId[];
  readonly excluded: readonly {
    readonly dimension: V9DigitalDimensionId;
    readonly reason: "not_applicable" | "no_reading";
  }[];
  readonly assessed: number;
  readonly applicable: number;
  readonly coverage: number;
  readonly sufficient: boolean;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

function bandFor(
  score: number,
  bands: V9Calibration["overall"]["bands"],
): "low" | "developing" | "solid" | "very_solid" {
  if (bands.verySolidFrom !== undefined && score >= bands.verySolidFrom) return "very_solid";
  if (score >= bands.solidFrom) return "solid";
  if (score >= bands.developingFrom) return "developing";
  return "low";
}

export function displayV9ScoreForBands(
  rawScore: number,
  bands: V9Calibration["overall"]["bands"],
): number {
  const rounded = Math.round(rawScore);
  return bandFor(rounded, bands) === bandFor(rawScore, bands)
    ? rounded
    : Math.floor(rawScore);
}

export function computeV9OverallIndex(input: {
  readonly dimensions: readonly V9ContextualDimensionResult[];
  readonly calibration: V9Calibration;
  readonly prelaunch?: boolean;
}): V9OverallIndex {
  const byId = new Map(input.dimensions.map((item) => [item.id, item] as const));
  const ids = V9_DIGITAL_DIMENSIONS.map((item) => item.id);
  const applicableDimensions = ids.filter((id) => byId.get(id)?.applicability === "applicable");
  const scoredDimensions = applicableDimensions.filter((id) =>
    typeof byId.get(id)?.score === "number");
  const excluded = ids.filter((id) => !scoredDimensions.includes(id)).map((dimension) => ({
    dimension,
    reason: applicableDimensions.includes(dimension)
      ? "no_reading" as const
      : "not_applicable" as const,
  }));
  const applicable = applicableDimensions.length;
  const assessed = scoredDimensions.length;
  const ratio = applicable === 0 ? 0 : assessed / applicable;
  const coverage = round2(ratio);
  const model = input.calibration.overall;
  const sufficient =
    !input.prelaunch &&
    assessed >= model.minScoredDimensions &&
    applicable > 0 &&
    ratio >= model.minCoverage;
  const rawScore = sufficient
    ? scoredDimensions.reduce((sum, id) => sum + byId.get(id)!.score!, 0) / assessed
    : null;
  return {
    identity: V9_OVERALL_INDEX_ID,
    rawScore,
    displayScore: rawScore === null ? null : displayV9ScoreForBands(rawScore, model.bands),
    scoredDimensions,
    applicableDimensions,
    excluded,
    assessed,
    applicable,
    coverage,
    sufficient,
  };
}
