import assert from "node:assert/strict";
import test from "node:test";

import { buildCandidateRecommendationsAndSolutionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-recommendations";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { candidateCalibrationFromV9 } from "../../../app/features/diagnostic/qa03b/v9-finalization.server";
import { resolveV9ScoringCalibration } from "../../../app/features/diagnostic/v9/scoring-calibration-registry";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const applicableButUnobservableAnswers: AnswersV2 = {
  q2_entity: "individual",
  q2_monetization: "services",
  q2_has_customers: "yes",
  q2_regularity: "regular",
  q2_demand_trend: "flat",
  q2_delivery: ["travels"],
  q2_sector: "legal",
  q2_goal: "opportunities",
  q2_customer_buyer: "b2c",
  q2_customer_reach: "local",
  q2_discovery_reliable_reach: "reliable",
  q2_process_systemization: "defined",
  q2_service_response_speed: "strong",
  q2_professional_intake_flow: "clear",
  q2_reputation_flow: "strong",
  q2_service_quote_followup: "consistent",
  q2_professional_authority_signals: "clearly_visible",
  q2_presence_offer_clarity: "all_clear",
};

test("V9 finalization keeps applicable dimensions in the overall denominator when context has no reachable source", () => {
  const v9Calibration = resolveV9ScoringCalibration("diag-v3-candidate-calibration-v4").calibration;
  const calibration = candidateCalibrationFromV9(v9Calibration);
  assert.equal(calibration.overall.coverageBasis, "applicable_dimensions");

  const outcome = buildCandidateRecommendationsAndSolutionsV3({
    answers: applicableButUnobservableAnswers,
    bank: QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2,
    calibration,
    strictCorrelation: true,
  });
  const index = outcome.overall.index;
  assert.ok(index.unobservableApplicableDimensions.length > 0);
  assert.equal(index.coverageBasis, "applicable_dimensions");
  assert.equal(index.coverageDenominator, index.applicableDimensions.length);
  assert.equal(index.coverage, index.applicable === 0 ? 0 : Math.round((index.assessed / index.applicable) * 100) / 100);
});
