import assert from "node:assert/strict";
import test from "node:test";
import {
  CANDIDATE_CALIBRATION_REPRESENTATIVE_V3,
  CANDIDATE_CALIBRATION_R8B_V2,
  CANDIDATE_CALIBRATION_V3,
  type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { OVERALL_INDEX_MODEL } from "../../../app/features/diagnostic/qbv2-overall";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { computeCandidateDigitalPresenceIndexV3, computeRepresentativeCandidateDigitalPresenceIndexV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-overall";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const sufficientlyObservedServiceBusiness: AnswersV2 = {
  q2_entity: "business",
  q2_monetization: "services",
  q2_delivery: ["physical_location", "appointments", "remote_service"],
  q2_has_customers: "yes",
  q2_operational_status: "operating",
  q2_regularity: "regular",
  q2_customer_buyer: "b2c",
  q2_goal: "stop_losing",
  q2_friction: "follow_up",
  q2_sector: "professional_services",
  q2_customer_reach: "local",
  q2_presence_digital_base: "reliable_presence",
  q2_presence_offer_clarity: "clear",
  q2_professional_intake_flow: "clear",
  q2_discovery_reliable_reach: "reliable",
  q2_reputation_flow: "strong",
  q2_professional_authority_signals: "clearly_visible",
  q2_service_response_speed: "strong",
  q2_followup_general_process: "consistent",
  q2_service_quote_followup: "consistent",
  q2_appointments_lead_to_booking: "few",
  q2_appointments_booking_friction: "rarely",
  q2_appointments_confirmation_reminders: "consistent",
  q2_appointments_rebooking: "proactive",
  q2_process_systemization: "defined",
  q2_operations_information_base: "easy_reliable",
  q2_measurement_practice: "consistent",
  q2_measurement_rate_estimate: "can_estimate",
  q2_measurement_result_recording: "consistent",
  q2_measurement_review_cycle: "regular_decisions",
};

function indexFor(answers: AnswersV2, calibration: CandidateCalibrationV3) {
  const scoring = scoreCandidateContextualDimensionsV3({ answers });
  const index = calibration === CANDIDATE_CALIBRATION_REPRESENTATIVE_V3
    ? computeRepresentativeCandidateDigitalPresenceIndexV3(scoring, calibration, {}, answers)
    : computeCandidateDigitalPresenceIndexV3(scoring, {}, calibration.overall, answers);
  return { scoring, index };
}

test("DIAG-MOTOR-02 candidate requires majority coverage of applicable dimensions", () => {
  const full = indexFor(sufficientlyObservedServiceBusiness, CANDIDATE_CALIBRATION_REPRESENTATIVE_V3);
  assert.equal(full.scoring.dimensions.filter((dimension) => dimension.score !== null).length, 8);
  assert.equal(full.index.coverage, 1);
  assert.equal(full.index.sufficient, true);
  assert.equal(full.index.displayScore, 75);

  const sixAreaAnswers = Object.fromEntries(Object.entries(sufficientlyObservedServiceBusiness).filter(([questionId]) => ![
    "q2_followup_general_process", "q2_service_quote_followup", "q2_appointments_rebooking",
    "q2_appointments_confirmation_reminders", "q2_measurement_rate_estimate",
    "q2_measurement_result_recording", "q2_measurement_review_cycle",
  ].includes(questionId))) as AnswersV2;
  sixAreaAnswers.q2_measurement_practice = "unknown";
  const sixAreas = indexFor(sixAreaAnswers, CANDIDATE_CALIBRATION_REPRESENTATIVE_V3);
  assert.equal(sixAreas.scoring.dimensions.filter((dimension) => dimension.score !== null).length, 6);
  // Six areas are scored out of the eight product dimensions; seven are applicable in this fixture.
  // Measurement remains insufficient-context without a substantive measurement observation.
  assert.equal(sixAreas.index.coverageDenominator, 7);
  assert.equal(sixAreas.index.applicableCoverage, 0.86);
  assert.equal(sixAreas.index.sufficient, true);
  assert.equal(sixAreas.index.displayScore, 75);

  const limitedAnswers = Object.fromEntries(Object.entries(sufficientlyObservedServiceBusiness).filter(([questionId]) => ![
    "q2_service_response_speed", "q2_appointments_booking_friction", "q2_appointments_rebooking",
    "q2_appointments_confirmation_reminders", "q2_followup_general_process", "q2_service_quote_followup",
    "q2_process_systemization", "q2_operations_information_base", "q2_measurement_practice",
    "q2_measurement_rate_estimate", "q2_measurement_result_recording", "q2_measurement_review_cycle",
  ].includes(questionId))) as AnswersV2;
  const prior = indexFor(limitedAnswers, CANDIDATE_CALIBRATION_R8B_V2);
  const proposed = indexFor(limitedAnswers, CANDIDATE_CALIBRATION_REPRESENTATIVE_V3);
  assert.equal(prior.index.scoredDimensions.length, 4);
  assert.equal(prior.index.sufficient, true, "v2 is retained as the comparison baseline");
  assert.equal(proposed.index.sufficient, false, "four of eight applicable areas do not support a representative global result");
  assert.equal(proposed.index.rawScore, null);
  assert.equal(proposed.index.displayScore, null);
  assert.equal(proposed.index.coverage, 0.57);
  assert.equal(proposed.index.applicableDimensions.length, 7);
});

test("DIAG-MOTOR-02 representative coverage exposes applicable gaps and observable coverage separately", () => {
  const { index } = indexFor(sufficientlyObservedServiceBusiness, CANDIDATE_CALIBRATION_REPRESENTATIVE_V3);
  assert.equal(index.coverageBasis, "applicable_dimensions");
  assert.equal(index.applicableCoverage, 1);
  assert.equal(index.observableCoverage, 1);
  assert.equal(index.coverageDenominator, 8);
  assert.equal(index.unobservableApplicableDimensions.length, 0);
});

test("DIAG-MOTOR-02 proposal changes only index representativeness and leaves v2 and legacy frozen", () => {
  assert.equal(CANDIDATE_CALIBRATION_R8B_V2.overall.minScoredDimensions, 3);
  assert.equal(CANDIDATE_CALIBRATION_R8B_V2.overall.minCoverage, 1 / 3);
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2, "the proposed threshold is not active before methodological review");
  assert.equal(CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.version, 3);
  assert.deepEqual(CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.scoring, CANDIDATE_CALIBRATION_R8B_V2.scoring);
  assert.deepEqual(CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.dimensionConfidence, CANDIDATE_CALIBRATION_R8B_V2.dimensionConfidence);
  assert.deepEqual(CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.overall.bands, CANDIDATE_CALIBRATION_R8B_V2.overall.bands);
  assert.deepEqual(CANDIDATE_CALIBRATION_REPRESENTATIVE_V3.overall.confidence, CANDIDATE_CALIBRATION_R8B_V2.overall.confidence);
  assert.equal(OVERALL_INDEX_MODEL.minScoredDimensions, 3);
  assert.equal(OVERALL_INDEX_MODEL.minCoverage, 1 / 3);
});
