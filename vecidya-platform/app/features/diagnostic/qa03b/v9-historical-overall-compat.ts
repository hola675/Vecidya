import type { DiagnosticScoringView } from "../qbv2-diagnostic-view";
import { computeCandidateDigitalPresenceIndexV3 } from "./qbv2-candidate-overall";
import type { AnswersV2 } from "../qbv2-rules";
import type { V9Calibration, V9ContextualDimensionResult } from "../v9/scoring-contract";
import {
  V9_HISTORICAL_OVERALL_COMPAT_ID,
  type V9OverallIndex,
} from "../v9/overall-index";

/**
 * Historical-only compatibility boundary for calibration v1/v2.
 *
 * Those versions used the certified observable-dimension denominator. Current
 * V3/V4 scoring uses applicable_dimensions and never enters this adapter.
 */
export function computeHistoricalV9OverallCompat(input: {
  readonly dimensions: readonly V9ContextualDimensionResult[];
  readonly answers: Readonly<Record<string, string | readonly string[] | undefined>>;
  readonly calibration: V9Calibration;
  readonly prelaunch?: boolean;
}): V9OverallIndex {
  if (input.calibration.overall.coverageBasis === "applicable_dimensions") {
    throw new Error("v9_historical_overall_adapter_not_required");
  }
  const scoring = {
    context: {},
    dimensions: input.dimensions,
  } as unknown as DiagnosticScoringView;
  const legacy = computeCandidateDigitalPresenceIndexV3(
    scoring,
    { prelaunch: input.prelaunch },
    input.calibration.overall,
    input.answers as AnswersV2,
  );
  return {
    identity: V9_HISTORICAL_OVERALL_COMPAT_ID,
    rawScore: legacy.rawScore,
    displayScore: legacy.displayScore,
    scoredDimensions: legacy.scoredDimensions,
    applicableDimensions: legacy.applicableDimensions,
    excluded: legacy.excluded,
    assessed: legacy.assessed,
    applicable: legacy.applicable,
    coverage: legacy.coverage,
    sufficient: legacy.sufficient,
  };
}
