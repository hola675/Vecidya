import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DIGITAL_DIMENSIONS,
  EVIDENCE_MAPPING,
  MATURITY_MODEL,
  analyzeCoverage,
  generateCoverageMatrix,
  GOLDEN_PERSONAS,
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
  assert.equal(report.productiveQuestionCount, 80);
  assert.equal(report.mappedQuestionCount, 80);
  assert.deepEqual(report.unmappedQuestionIds, []);
  assert.deepEqual(report.mappingIssues, []);
  assert.ok(report.dimensionCoverage.every((coverage) => coverage.questionCount > 0));
  assert.ok(Object.keys(EVIDENCE_MAPPING).length >= 80);
});

test("08B.6R has exactly twelve deterministic golden personas", () => {
  assert.equal(GOLDEN_PERSONAS.length, 12);
  assert.equal(new Set(GOLDEN_PERSONAS.map((persona) => persona.id)).size, 12);
  const first = analyzeCoverage();
  const second = analyzeCoverage();
  assert.deepEqual(first.personas, second.personas);
  assert.ok(first.personas.every((persona) => persona.routeLength <= 18));
  assert.ok(first.personas.every((persona) => persona.duplicateQuestionIds.length === 0));
  assert.ok(first.personas.every((persona) => persona.routeReady));
  assert.ok(first.personas.every((persona) => persona.missingExpectedModules.length === 0));
  assert.ok(first.personas.every((persona) => persona.excludedModulesSelected.length === 0));
});

test("08B.6R generated coverage combinations remain declarative and bounded by planner invariants", () => {
  const matrix = generateCoverageMatrix();
  assert.ok(matrix.length > 100);
  assert.ok(matrix.every((entry) => entry.stage && entry.archetype && entry.goal && entry.friction));
  const report = analyzeCoverage();
  assert.equal(report.matrixCaseCount, matrix.length);
  assert.ok(report.matrixRouteFailures.every((failure) => failure.routeLength <= 18));
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
