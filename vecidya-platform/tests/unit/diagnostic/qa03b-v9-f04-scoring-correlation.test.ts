import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  applyV9ObservationCorrelationPolicy,
  validateV9EvidenceCorrelationRegistry,
  V9_EVIDENCE_CORRELATION_REGISTRY_ID,
} from "../../../app/features/diagnostic/v9/evidence-correlation-registry";
import {
  listRegisteredV9ScoringVersions,
  resolveV9ScoringCalibration,
  V9_CURRENT_SCORING_VERSION,
  V9_SCORING_CALIBRATION_REGISTRY_ID,
} from "../../../app/features/diagnostic/v9/scoring-calibration-registry";
import {
  CANDIDATE_CALIBRATION_ACTIVE_V4,
  CANDIDATE_CALIBRATION_R8B_V2,
  candidateDimensionCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import {
  correlateCandidateObservationsV1,
  type ConfirmedObservationCorrelationV1,
} from "../../../app/features/diagnostic/qa03b/v9-observation-correlation";
import {
  scoreDimensionWithApplicability,
  type ContextualEvidence,
} from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { computeDigitalPresenceIndex } from "../../../app/features/diagnostic/qbv2-overall";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import type { DiagnosticScoringView } from "../../../app/features/diagnostic/qbv2-diagnostic-view";

function evidence(input: Partial<ContextualEvidence> & Pick<ContextualEvidence, "questionId" | "dimension" | "observationId" | "directness" | "state" | "contribution">): ContextualEvidence {
  return {
    kind: "capability",
    answer: ["fixture"],
    ...input,
  } as ContextualEvidence;
}

function correlation(
  observationId: string,
  questionId: string,
  dimension: DigitalDimensionId,
  eventKey: string,
  constructKey: string,
  periodKey = "current",
): ConfirmedObservationCorrelationV1 {
  return {
    observationId,
    questionId,
    dimension,
    eventKey,
    constructKey,
    periodKey,
    provenance: "explicit_confirmation",
  };
}

function scoringWith(scored: number): DiagnosticScoringView {
  return {
    context: {},
    dimensions: DIGITAL_DIMENSION_IDS.map((id, index) => ({
      id,
      applicability: "applicable",
      score: index < scored ? 75 : null,
      confidence: {
        level: index < scored ? "medium" : "low",
        direct: index < scored ? 1 : 0,
        supporting: 0,
        contextual: 0,
        uncertain: 0,
        independent: index < scored ? 1 : 0,
        strength: index < scored ? 1 : 0,
        contradictory: false,
        penalties: [],
      },
      evidence: [],
      explainability: {
        basis: index < scored ? "direct" : "none",
        direct: [],
        supporting: [],
        strengths: [],
        weaknesses: [],
        missing: [],
        dependencies: [],
        constraints: [],
        uncertainty: [],
        contradictions: [],
        gaps: index < scored ? [] : ["no_evidence"],
      },
    })),
  } as DiagnosticScoringView;
}

test("F04 scoring registry binds explicit versions to exact calibration identities", () => {
  assert.equal(V9_CURRENT_SCORING_VERSION, CANDIDATE_CALIBRATION_ACTIVE_V4.identity);
  assert.equal(resolveV9ScoringCalibration(V9_CURRENT_SCORING_VERSION).calibration, CANDIDATE_CALIBRATION_ACTIVE_V4);
  assert.equal(resolveV9ScoringCalibration(CANDIDATE_CALIBRATION_R8B_V2.identity).calibration, CANDIDATE_CALIBRATION_R8B_V2);
  assert.equal(resolveV9ScoringCalibration(V9_CURRENT_SCORING_VERSION).registryIdentity, V9_SCORING_CALIBRATION_REGISTRY_ID);
  assert.deepEqual(listRegisteredV9ScoringVersions(), [
    "diag-v3-candidate-calibration-v1",
    "diag-v3-candidate-calibration-v2",
    "diag-v3-candidate-calibration-v3",
    "diag-v3-candidate-calibration-v4",
  ]);
  assert.throws(() => resolveV9ScoringCalibration("unregistered-scoring"), /v9_scoring_version_unregistered/);
});

test("F04 correlation registry covers every migrated bank77 mapping", () => {
  assert.deepEqual(validateV9EvidenceCorrelationRegistry(bank77), []);
});

test("F04 same fact with two IDs deduplicates only with explicit same-event correlation", () => {
  const generic = evidence({
    questionId: "q2_presence_offer_clarity",
    dimension: "clarity_positioning",
    observationId: "generic-offer",
    directness: "direct",
    state: "established",
    contribution: 0.75,
  });
  const specialist = evidence({
    questionId: "q2_food_menu_visibility",
    dimension: "clarity_positioning",
    observationId: "food-menu",
    directness: "direct",
    state: "established",
    contribution: 0.75,
  });

  const missing = applyV9ObservationCorrelationPolicy([generic, specialist]);
  assert.equal(missing.registryIdentity, V9_EVIDENCE_CORRELATION_REGISTRY_ID);
  assert.equal(missing.scoreSafe, false);
  assert.equal(missing.unmapped.length, 2);

  const sameEvent = applyV9ObservationCorrelationPolicy([generic, specialist], [
    correlation("generic-offer", "q2_presence_offer_clarity", "clarity_positioning", "event-1", "offer_clarity"),
    correlation("food-menu", "q2_food_menu_visibility", "clarity_positioning", "event-1", "offer_clarity"),
  ]);
  assert.equal(sameEvent.scoreSafe, true);
  assert.equal(sameEvent.accepted.length, 1);
  assert.equal(sameEvent.deduplicated.length, 1);
});

test("F04 distinct events remain independent and same-event conflicts fail closed", () => {
  const generic = evidence({
    questionId: "q2_presence_offer_clarity",
    dimension: "clarity_positioning",
    observationId: "generic-offer",
    directness: "direct",
    state: "established",
    contribution: 0.75,
  });
  const specialist = evidence({
    questionId: "q2_food_menu_visibility",
    dimension: "clarity_positioning",
    observationId: "food-menu",
    directness: "direct",
    state: "established",
    contribution: 0.75,
  });
  const independent = applyV9ObservationCorrelationPolicy([generic, specialist], [
    correlation("generic-offer", "q2_presence_offer_clarity", "clarity_positioning", "event-1", "offer_clarity"),
    correlation("food-menu", "q2_food_menu_visibility", "clarity_positioning", "event-2", "offer_clarity"),
  ]);
  assert.equal(independent.scoreSafe, true);
  assert.equal(independent.accepted.length, 2);
  assert.equal(independent.deduplicated.length, 0);

  const conflicting = applyV9ObservationCorrelationPolicy([
    generic,
    { ...specialist, state: "weak", contribution: 0.25 },
  ], [
    correlation("generic-offer", "q2_presence_offer_clarity", "clarity_positioning", "event-1", "offer_clarity"),
    correlation("food-menu", "q2_food_menu_visibility", "clarity_positioning", "event-1", "offer_clarity"),
  ]);
  assert.equal(conflicting.scoreSafe, false);
  assert.equal(conflicting.conflicts.length, 1);
});

test("F04 direct beats supporting for the same confirmed fact", () => {
  const direct = evidence({
    questionId: "direct-source",
    dimension: "digital_readiness",
    observationId: "direct-observation",
    directness: "direct",
    state: "partial",
    contribution: 0.5,
  });
  const supporting = evidence({
    questionId: "support-source",
    dimension: "digital_readiness",
    observationId: "support-observation",
    directness: "supporting",
    state: "partial",
    contribution: 0.5,
  });
  const result = correlateCandidateObservationsV1([supporting, direct], [
    correlation("support-observation", "support-source", "digital_readiness", "event-7", "process_reliability"),
    correlation("direct-observation", "direct-source", "digital_readiness", "event-7", "process_reliability"),
  ]);
  assert.equal(result.scoreSafe, true);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.accepted[0]?.directness, "direct");
  assert.equal(result.deduplicated[0]?.directness, "supporting");
});

test("F04 dimension scoring keeps direct-required, neutral-null and supporting cap", () => {
  const calibration = candidateDimensionCalibrationV3(CANDIDATE_CALIBRATION_ACTIVE_V4);
  const direct = evidence({
    questionId: "direct",
    dimension: "digital_readiness",
    observationId: "d1",
    directness: "direct",
    state: "strong",
    contribution: 1,
  });
  const supporting = Array.from({ length: 5 }, (_, index) => evidence({
    questionId: `support-${index}`,
    dimension: "digital_readiness",
    observationId: `s${index}`,
    directness: "supporting",
    state: "missing",
    contribution: 0,
  }));
  const supportingOnly = scoreDimensionWithApplicability("digital_readiness", supporting, "applicable", calibration);
  assert.equal(supportingOnly.score, null);
  assert.equal(supportingOnly.explainability.basis, "supporting_only");

  const capped = scoreDimensionWithApplicability("digital_readiness", [direct, ...supporting], "applicable", calibration);
  assert.equal(capped.score, 67, "supporting total is capped to half the direct weight");

  const neutral = scoreDimensionWithApplicability("digital_readiness", [
    evidence({
      questionId: "neutral",
      dimension: "digital_readiness",
      observationId: "n1",
      directness: "direct",
      state: "uncertainty",
      contribution: null,
    }),
  ], "applicable", calibration);
  assert.equal(neutral.score, null);
});

test("F04 current v4 global index requires at least 3 scored dimensions and 60% applicable coverage", () => {
  const model = CANDIDATE_CALIBRATION_ACTIVE_V4.overall;
  assert.deepEqual([model.minScoredDimensions, model.minCoverage, model.coverageBasis], [3, 0.6, "applicable_dimensions"]);

  const two = computeDigitalPresenceIndex(scoringWith(2), { model });
  assert.equal(two.rawScore, null);
  assert.equal(two.sufficient, false);

  const threeOfEight = computeDigitalPresenceIndex(scoringWith(3), { model });
  assert.equal(threeOfEight.coverage, 0.38);
  assert.equal(threeOfEight.rawScore, null);
  assert.equal(threeOfEight.sufficient, false);

  const fiveOfEight = computeDigitalPresenceIndex(scoringWith(5), { model });
  assert.equal(fiveOfEight.coverage, 0.63);
  assert.equal(fiveOfEight.rawScore, 75);
  assert.equal(fiveOfEight.sufficient, true);
});
