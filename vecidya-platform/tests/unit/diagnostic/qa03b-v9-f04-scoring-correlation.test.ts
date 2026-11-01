import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  CANDIDATE_CALIBRATION_ACTIVE_V4,
  CANDIDATE_CALIBRATION_R8B_V2,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import {
  applyV9ObservationCorrelationPolicy,
  validateV9EvidenceCorrelationRegistry,
  V9_EVIDENCE_CORRELATION_REGISTRY_ID,
} from "../../../app/features/diagnostic/v9/evidence-correlation-registry";
import {
  listRegisteredV9ScoringVersions,
  resolveV9ScoringCalibration,
  V9_CALIBRATION_V2,
  V9_CALIBRATION_V4,
  V9_CURRENT_SCORING_VERSION,
  V9_SCORING_CALIBRATION_REGISTRY_ID,
} from "../../../app/features/diagnostic/v9/scoring-calibration-registry";
import {
  deriveV9ScoringEvidence,
  listV9ScoringEvidenceMappings,
  validateV9ScoringEvidenceRegistry,
  V9_SCORING_EVIDENCE_REGISTRY_ID,
} from "../../../app/features/diagnostic/v9/scoring-evidence-registry";
import {
  correlateV9Observations,
  type V9ConfirmedObservationCorrelation,
} from "../../../app/features/diagnostic/v9/observation-correlation";
import {
  scoreV9Dimensions,
  V9_SCORING_ENGINE_ID,
} from "../../../app/features/diagnostic/v9/scoring-engine";
import { computeV9OverallIndex } from "../../../app/features/diagnostic/v9/overall-index";
import {
  V9_DIGITAL_DIMENSIONS,
  type V9ContextualDimensionResult,
  type V9ContextualEvidence,
  type V9DigitalDimensionId,
  type V9ScoringContext,
} from "../../../app/features/diagnostic/v9/scoring-contract";

const context: V9ScoringContext = {
  contractIdentity: "test-v9-context",
  operationalStatus: { status: "resolved", value: "preparing" },
  businessModel: { status: "unresolved" },
  nicheGroup: { status: "unresolved" },
  customerModel: {
    buyer: { status: "unresolved" },
    reach: { status: "unresolved" },
  },
  buyerDisposition: null,
  hasEverHadRealPeople: false,
  delivery: {
    serviceSetting: [],
    purchaseChannel: [],
  },
  discoveryReachReliability: { status: "unresolved" },
};

function evidence(input: Pick<V9ContextualEvidence,
  "questionId" | "dimension" | "observationId" | "directness" | "state" | "contribution"
>): V9ContextualEvidence {
  return {
    questionVersion: 1,
    migrationIdentity: `${input.questionId}@v1`,
    kind: input.state === "established" || input.state === "strong"
      ? "established"
      : input.state === "partial" || input.state === "weak"
        ? "partial"
        : input.state,
    answer: ["fixture"],
    ...input,
  };
}

function correlation(
  observationId: string,
  questionId: string,
  dimension: V9DigitalDimensionId,
  eventKey: string,
  constructKey: string,
  periodKey = "current",
): V9ConfirmedObservationCorrelation {
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

function scoringWith(scored: number): readonly V9ContextualDimensionResult[] {
  return V9_DIGITAL_DIMENSIONS.map(({ id, label }, index) => ({
    id,
    label,
    applicability: "applicable",
    applicabilityReason: "defined_activity",
    applicabilityContext: [],
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
  }));
}

test("F04 autonomous scoring files contain no QBV2 or QA03B runtime imports", () => {
  const files = [
    "scoring-contract.ts",
    "scoring-calibration-registry.ts",
    "scoring-evidence-registry.ts",
    "observation-correlation.ts",
    "evidence-correlation-registry.ts",
    "scoring-engine.ts",
    "overall-index.ts",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(`../../../app/features/diagnostic/v9/${file}`, import.meta.url), "utf8");
    assert.equal(/from\s+["'][^"']*(?:qbv2|qa03b)/.test(source), false, file);
  }
  const worker = readFileSync(new URL("../../../app/features/diagnostic/qa03b/worker-replay-v9.server.ts", import.meta.url), "utf8");
  assert.equal(/from\s+["'][^"']*v9-candidate-scoring/.test(worker), false);
});

test("F04 scoring registry binds exact historical/current calibrations without runtime legacy dependency", () => {
  assert.equal(V9_CURRENT_SCORING_VERSION, "diag-v3-candidate-calibration-v4");
  assert.deepEqual(V9_CALIBRATION_V4, CANDIDATE_CALIBRATION_ACTIVE_V4);
  assert.deepEqual(V9_CALIBRATION_V2, CANDIDATE_CALIBRATION_R8B_V2);
  assert.equal(resolveV9ScoringCalibration(V9_CURRENT_SCORING_VERSION).calibration, V9_CALIBRATION_V4);
  assert.equal(resolveV9ScoringCalibration(V9_CALIBRATION_V2.identity).calibration, V9_CALIBRATION_V2);
  assert.equal(resolveV9ScoringCalibration(V9_CURRENT_SCORING_VERSION).registryIdentity, V9_SCORING_CALIBRATION_REGISTRY_ID);
  assert.deepEqual(listRegisteredV9ScoringVersions(), [
    "diag-v3-candidate-calibration-v1",
    "diag-v3-candidate-calibration-v2",
    "diag-v3-candidate-calibration-v3",
    "diag-v3-candidate-calibration-v4",
  ]);
  assert.throws(() => resolveV9ScoringCalibration("unregistered-scoring"), /v9_scoring_version_unregistered/);
});

test("F04 V9-owned evidence registry matches all 40 migrated bank77 mappings exactly", () => {
  assert.equal(V9_SCORING_EVIDENCE_REGISTRY_ID, "diag-v9-scoring-evidence-registry-v1");
  assert.deepEqual(validateV9ScoringEvidenceRegistry(), []);
  const normalize = (items: readonly {
    questionId: string;
    questionVersion: number;
    dimension: string;
    directness: string;
    answers: Readonly<Record<string, string>>;
  }[]) => items.map((item) => ({
    questionId: item.questionId,
    questionVersion: item.questionVersion,
    dimension: item.dimension,
    directness: item.directness,
    answers: Object.fromEntries(Object.entries(item.answers).sort(([a], [b]) => a.localeCompare(b))),
  })).sort((a, b) =>
    a.questionId.localeCompare(b.questionId) ||
    a.dimension.localeCompare(b.dimension));

  const legacy = bank77.flatMap((question) =>
    question.evidenceMigration === "migrated" && question.evidenceV3
      ? question.evidenceV3.dimensions.map((reading) => ({
          questionId: question.id,
          questionVersion: question.version,
          dimension: reading.dimension,
          directness: reading.directness,
          answers: reading.answers,
        }))
      : []);
  const owned = listV9ScoringEvidenceMappings();
  assert.equal(legacy.length, 40);
  assert.equal(owned.length, 40);
  assert.deepEqual(normalize(owned), normalize(legacy));
  assert.deepEqual(validateV9EvidenceCorrelationRegistry(), []);
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

test("F04 direct beats supporting for the same explicitly confirmed fact", () => {
  const supporting = evidence({
    questionId: "support-source",
    dimension: "digital_readiness",
    observationId: "support-observation",
    directness: "supporting",
    state: "partial",
    contribution: 0.5,
  });
  const direct = evidence({
    questionId: "direct-source",
    dimension: "digital_readiness",
    observationId: "direct-observation",
    directness: "direct",
    state: "partial",
    contribution: 0.5,
  });
  const result = correlateV9Observations([supporting, direct], [
    correlation("support-observation", "support-source", "digital_readiness", "event-7", "process_reliability"),
    correlation("direct-observation", "direct-source", "digital_readiness", "event-7", "process_reliability"),
  ]);
  assert.equal(result.scoreSafe, true);
  assert.equal(result.accepted[0]?.directness, "direct");
  assert.equal(result.deduplicated[0]?.directness, "supporting");
});

test("F04 autonomous scorer keeps direct-required, neutral-null and supporting cap", () => {
  const supportingOnly = scoreV9Dimensions({
    answers: { q2_startup_validation_evidence: "repeated_problem" },
    context,
    calibration: V9_CALIBRATION_V4,
  });
  const claritySupporting = supportingOnly.dimensions.find((item) => item.id === "clarity_positioning")!;
  assert.equal(claritySupporting.score, null);
  assert.equal(claritySupporting.explainability.basis, "supporting_only");

  const mixed = scoreV9Dimensions({
    answers: {
      q2_startup_problem_clarity: "clear_audience_problem",
      q2_startup_validation_evidence: "none",
    },
    context,
    calibration: V9_CALIBRATION_V4,
  });
  assert.equal(mixed.dimensions.find((item) => item.id === "clarity_positioning")?.score, 58);

  const neutral = deriveV9ScoringEvidence(
    { q2_startup_problem_clarity: "unknown" },
    V9_CALIBRATION_V4.capabilityContribution,
  );
  assert.equal(neutral[0]?.contribution, null);
  const neutralScore = scoreV9Dimensions({
    answers: { q2_startup_problem_clarity: "unknown" },
    context,
    calibration: V9_CALIBRATION_V4,
  });
  assert.equal(neutralScore.dimensions.find((item) => item.id === "clarity_positioning")?.score, null);
  assert.equal(neutralScore.engineIdentity, V9_SCORING_ENGINE_ID);
});

test("F04 current v4 overall requires at least 3 scored dimensions and 60% applicable coverage", () => {
  assert.deepEqual([
    V9_CALIBRATION_V4.overall.minScoredDimensions,
    V9_CALIBRATION_V4.overall.minCoverage,
    V9_CALIBRATION_V4.overall.coverageBasis,
  ], [3, 0.6, "applicable_dimensions"]);

  const two = computeV9OverallIndex({ dimensions: scoringWith(2), calibration: V9_CALIBRATION_V4 });
  assert.equal(two.rawScore, null);
  assert.equal(two.sufficient, false);

  const threeOfEight = computeV9OverallIndex({ dimensions: scoringWith(3), calibration: V9_CALIBRATION_V4 });
  assert.equal(threeOfEight.coverage, 0.38);
  assert.equal(threeOfEight.rawScore, null);
  assert.equal(threeOfEight.sufficient, false);

  const fiveOfEight = computeV9OverallIndex({ dimensions: scoringWith(5), calibration: V9_CALIBRATION_V4 });
  assert.equal(fiveOfEight.coverage, 0.63);
  assert.equal(fiveOfEight.rawScore, 75);
  assert.equal(fiveOfEight.displayScore, 75);
  assert.equal(fiveOfEight.sufficient, true);
});
