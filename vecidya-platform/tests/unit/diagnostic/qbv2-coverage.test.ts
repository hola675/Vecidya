import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DIGITAL_DIMENSIONS,
  EVIDENCE_DIRECTNESS,
  EVIDENCE_MAPPING,
  GOLDEN_QUESTIONS_V2,
  MATURITY_MODEL,
  analyzeCoverage,
  generateCoverageMatrix,
  GOLDEN_PERSONAS,
  QUESTION_BANK_V2,
  type DigitalDimensionId,
} from "../../../app/features/diagnostic/index.ts";

test("08B.6R contracts define five maturity states and exactly eight digital dimensions", () => {
  assert.deepEqual(MATURITY_MODEL.map((state) => state.id), ["initial", "functional", "structured", "ready_to_grow", "ready_to_scale"]);
  assert.equal(DIGITAL_DIMENSIONS.length, 8);
  assert.equal(new Set(DIGITAL_DIMENSIONS.map((dimension) => dimension.id)).size, 8);
  assert.ok(DIGITAL_DIMENSIONS.every((dimension) => dimension.purpose && dimension.evidenceTypes.length > 0));
});

test("08B.6R maps every productive QBV2 question to semantically meaningful evidence", () => {
  const report = analyzeCoverage();
  assert.equal(report.productiveQuestionCount, 85);
  assert.equal(report.mappedQuestionCount, 85);
  assert.deepEqual(report.unmappedQuestionIds, []);
  assert.deepEqual(report.mappingIssues, []);
  assert.ok(report.dimensionCoverage.every((coverage) => coverage.questionCount > 0));
  assert.ok(Object.keys(EVIDENCE_MAPPING).length >= 85);
});

test("08B.6R has exactly twelve deterministic golden personas", () => {
  assert.equal(GOLDEN_PERSONAS.length, 12);
  assert.equal(new Set(GOLDEN_PERSONAS.map((persona) => persona.id)).size, 12);
  const first = analyzeCoverage();
  const second = analyzeCoverage();
  assert.deepEqual(first.personas, second.personas);
  // 08D.1/08E.2: base route keeps the 18 cap; slots 19-24 only hold material evidence.
  assert.ok(first.personas.every((persona) => persona.routeLength >= 15 && persona.routeLength <= 24));
  assert.ok(first.personas.every((persona) => persona.duplicateQuestionIds.length === 0));
  assert.ok(first.personas.every((persona) => persona.routeReady));
  assert.ok(first.personas.every((persona) => persona.missingExpectedModules.length === 0));
  assert.ok(first.personas.every((persona) => persona.excludedModulesSelected.length === 0));
});

test("08B.6R generated coverage combinations remain declarative and bounded by planner invariants", () => {
  const matrix = generateCoverageMatrix();
  assert.equal(matrix.length, 2400);
  assert.ok(matrix.every((entry) => entry.stage && entry.archetype && entry.goal && entry.friction));
  const report = analyzeCoverage();
  assert.equal(report.matrixCaseCount, matrix.length);
  assert.ok(report.matrixRouteFailures.every((failure) => failure.routeLength <= 18));
});

test("08E.1 productive bank has 85 questions and exactly two fixture-only confirmations", () => {
  assert.equal(QUESTION_BANK_V2.filter((question) => !question.purpose.includes("confirmation")).length, 85);
  assert.equal(GOLDEN_QUESTIONS_V2.filter((question) => question.purpose.includes("confirmation")).length, 2);
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("08C mapping audit assigns every question-dimension pair an explicit effective role", () => {
  const pairs = QUESTION_BANK_V2.flatMap((question) => EVIDENCE_MAPPING[question.id]!.dimensions.map((dimension) => ({
    questionId: question.id,
    dimension,
    role: EVIDENCE_DIRECTNESS[question.id]?.[dimension] ?? EVIDENCE_MAPPING[question.id]!.semanticRole,
  })));
  assert.ok(pairs.length > 0);
  assert.ok(pairs.every((pair) => ["direct", "supporting", "contextual"].includes(pair.role)));
  assert.equal(pairs.length, 78);
  assert.equal(pairs.filter((pair) => pair.role === "direct").length, 52);
  assert.equal(pairs.filter((pair) => pair.role === "supporting").length, 26);
  assert.equal(pairs.filter((pair) => pair.role === "contextual").length, 0);
  assert.equal(QUESTION_BANK_V2.filter((question) => EVIDENCE_MAPPING[question.id]?.dimensions.length === 0).length, 22);
  assert.ok(QUESTION_BANK_V2.filter((question) => EVIDENCE_MAPPING[question.id]?.dimensions.length === 0).every((question) => EVIDENCE_MAPPING[question.id]?.semanticRole === "contextual"));
  assert.equal(EVIDENCE_MAPPING.q2_nonprofit_support_type?.dimensions.length, 0);
  assert.equal(EVIDENCE_MAPPING.q2_service_area_clarity?.dimensions.length, 0);
  assert.equal(EVIDENCE_MAPPING.q2_service_quote_practice?.dimensions.length, 0);
  assert.equal(EVIDENCE_MAPPING.q2_startup_next_milestone?.dimensions.length, 0);
  assert.deepEqual(EVIDENCE_MAPPING.q2_ecommerce_cart_visibility?.dimensions, ["measurement_optimization"]);
  assert.equal(EVIDENCE_DIRECTNESS.q2_ecommerce_traffic_sources?.measurement_optimization, "supporting");
  assert.deepEqual(EVIDENCE_MAPPING.q2_startup_validation_evidence?.dimensions, ["clarity_positioning"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_creator_content_consistency?.dimensions, ["discovery"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_creator_conversion?.dimensions, ["conversion_access"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_professional_referral_dependency?.dimensions, ["discovery"]);
  assert.equal(EVIDENCE_MAPPING.q2_nonprofit_participation?.dimensions.length, 0);
  assert.equal(EVIDENCE_DIRECTNESS.q2_operations_bottleneck?.digital_readiness, "supporting");
  assert.equal(EVIDENCE_DIRECTNESS.q2_retail_product_visibility?.conversion_access, "supporting");
  for (const id of ["q2_appointments_noshow", "q2_hospitality_flow_type", "q2_hospitality_reservation_noshow"]) assert.equal(EVIDENCE_MAPPING[id]?.dimensions.length, 0, `${id} is attendance/routing context, not conversion access`);
  assert.equal(EVIDENCE_MAPPING.q2_b2b_decision_makers?.dimensions.includes("clarity_positioning"), false);
  assert.equal(EVIDENCE_MAPPING.q2_professional_intake_flow?.dimensions.includes("conversion_access"), true);
});

test("08C mapping audit records unresolved context axes and single-dimension direct evidence", () => {
  const representedGoals = new Set(QUESTION_BANK_V2.flatMap((question) => question.options.flatMap((option) => option.produces?.filter((production) => production.kind === "goal").map((production) => production.value) ?? [])));
  const generatedGoals = new Set(generateCoverageMatrix().map((item) => item.goal));
  const unrepresentableGoals = [...generatedGoals].filter((goal) => !representedGoals.has(goal)).sort();
  const secondaryDeliveryQuestions = QUESTION_BANK_V2.filter((question) => question.options.some((option) => option.produces?.some((production) => production.kind === "deliveryMode" && production.slot === "secondary")));
  const directDimensionsByQuestion = QUESTION_BANK_V2.map((question) => EVIDENCE_MAPPING[question.id]!.dimensions.filter((dimension) => (EVIDENCE_DIRECTNESS[question.id]?.[dimension] ?? EVIDENCE_MAPPING[question.id]!.semanticRole) === "direct").length);
  const directQuestions = (dimension: (typeof DIGITAL_DIMENSIONS)[number]["id"]) => QUESTION_BANK_V2.filter((question) => EVIDENCE_MAPPING[question.id]!.dimensions.includes(dimension) && (EVIDENCE_DIRECTNESS[question.id]?.[dimension] ?? EVIDENCE_MAPPING[question.id]!.semanticRole) === "direct").map((question) => question.id).sort();
  // 08E.3: q2_goal exposes all eight engine goals; none is unrepresentable any more.
  assert.deepEqual(unrepresentableGoals, []);
  assert.deepEqual(secondaryDeliveryQuestions, [], "hybrid contexts need a second delivery signal the current bank cannot collect");
  assert.ok(directDimensionsByQuestion.every((count) => count <= 1), "no current productive question directly saves evidence budget across dimensions");
  assert.deepEqual(directQuestions("digital_foundation"), ["q2_ecommerce_product_discovery", "q2_local_presence_consistency", "q2_presence_digital_base"]);
  assert.deepEqual(directQuestions("trust_reputation"), ["q2_professional_authority_signals", "q2_reputation_flow"]);
});

test("08B.6R distinguishes confirmed coverage, gaps, and possible improvements", () => {
  const report = analyzeCoverage();
  const allowed = new Set(["confirmed coverage", "confirmed gap", "possible improvement"]);
  assert.ok(report.findings.every((finding) => allowed.has(finding.classification)));
  assert.ok(report.findings.some((finding) => finding.classification === "confirmed coverage"));
  assert.equal(report.confirmedGaps.some((finding) => finding.code === "DIMENSION_NOT_REACHED_MEASUREMENT_OPTIMIZATION"), false);
  assert.equal(report.confirmedGaps.some((finding) => finding.code === "ECOMMERCE_FOUNDATION_EVIDENCE"), false);
  assert.ok(report.possibleImprovements.length >= 1);
});

test("08B.7 reuses source and storefront answers as cross-dimensional evidence", () => {
  const report = analyzeCoverage();
  const ecommerce = report.personas.find((persona) => persona.id === "ecommerce");
  assert.ok(ecommerce);
  assert.ok(ecommerce.coveredDimensions.includes("measurement_optimization"));
  assert.ok(ecommerce.coveredDimensions.includes("digital_foundation"));
  assert.ok(report.dimensionCoverage.find((coverage) => coverage.dimension === "measurement_optimization")?.personaCount);
  assert.ok(report.dimensionCoverage.find((coverage) => coverage.dimension === "digital_foundation")?.personaCount);
});

test("08B.6R exposes stable dimension IDs for the future scoring phase without scoring now", () => {
  const ids: DigitalDimensionId[] = DIGITAL_DIMENSIONS.map((dimension) => dimension.id);
  assert.deepEqual(ids, [
    "clarity_positioning",
    "digital_foundation",
    "discovery",
    "trust_reputation",
    "conversion_access",
    "relationship_recurrence",
    "measurement_optimization",
    "digital_readiness",
  ]);
  const report = analyzeCoverage();
  assert.equal("percentage" in report, false);
  assert.equal("weights" in report, false);
});
