import assert from "node:assert/strict";
import test from "node:test";

import { buildCandidateDiagnosticReportV1, buildCandidateResultPresentationV3 } from "../../../app/components/diagnostic-flow/candidate-presentation.ts";
import { CANDIDATE_METHODOLOGY_IDENTITY_V3, CANDIDATE_METHODOLOGY_SECTIONS_V3 } from "../../../app/components/diagnostic-flow/candidate-methodology-content.ts";
import { CANDIDATE_RESULT_IDENTITY_V3, runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases.ts";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner.ts";

const candidateResult = (id: string) => {
  const scenario = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert.ok(scenario, `canonical fixture ${id} exists`);
  const route = runCanonicalRouteV3(scenario);
  return runCandidateDiagnosticPipelineV3(route.finalAnswers);
};

test("ACT-02: candidate presentation and report retain the engine identity, versions and anonymous diagnostic date", () => {
  const result = candidateResult("C09");
  const view = buildCandidateResultPresentationV3(result);
  const report = buildCandidateDiagnosticReportV1(result, new Date("2026-10-09T12:00:00.000Z"));
  assert.equal(view.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.equal(report.candidateEngineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.equal(report.methodologyVersion, "3.0");
  assert.equal(report.reportVersion, "1.0");
  assert.equal(report.identity.dateLabel, "Fecha del diagnóstico");
  assert.equal(report.identity.businessName, null);
  assert.equal(report.generatedAt, "2026-10-09");
  assert.deepEqual(report.dimensions.map((dimension) => dimension.context), view.dimensions.map((dimension) => dimension.context));
  assert.deepEqual(report.priorities.map((item) => item.statement), view.priorities.map((item) => item.statement));
  assert.deepEqual(report.recommendations.map((item) => item.title), view.recommendations.map((item) => item.title));
});

test("ACT-02: prelaunch and insufficient evidence never manufacture an overall score or band", () => {
  for (const id of ["C01", "C16"]) {
    const result = candidateResult(id);
    const view = buildCandidateResultPresentationV3(result);
    const report = buildCandidateDiagnosticReportV1(result, new Date("2026-10-09T12:00:00.000Z"));
    assert.equal(view.overall.score, null, `${id} has no certified display score`);
    assert.equal(view.overall.publicLabel, null, `${id} has no fabricated band`);
    assert.equal(report.overallPresence.percent, null, `${id} report omits a fabricated percentage`);
    assert.equal(report.overallPresence.publicLabel, null, `${id} report omits a fabricated band`);
  }
});

test("ACT-02: O6 distinguishes applicability, opportunity, observed evidence and instrument gaps", () => {
  const result = candidateResult("C15");
  const view = buildCandidateResultPresentationV3(result);
  const measurement = view.dimensions.find((dimension) => dimension.key === "measurement_optimization");
  assert.ok(measurement);
  assert.equal(measurement.context.applicability, "Aplicable");
  assert.match(measurement.context.observability, /vacío del instrumento/i);
  assert.equal(measurement.context.directEvidence, "Sin evidencia directa observada");
  assert.equal(measurement.includedInCoverage, false);
  assert.match(view.overall.coverage, /dimensiones observables/);

  const c14 = CANONICAL_CASES_V3.find((item) => item.id === "C14")!;
  const naRoute = runCanonicalRouteV3(c14);
  const naAnswers = { ...naRoute.finalAnswers, q2_appointments_confirmation_reminders: "not_applicable" };
  const na = buildCandidateResultPresentationV3(runCandidateDiagnosticPipelineV3(naAnswers));
  assert.ok(na.dimensions.some((dimension) => /persona respondió N\/A/i.test(dimension.context.observability)));
  const unknown = buildCandidateResultPresentationV3(candidateResult("C16"));
  assert.ok(unknown.dimensions.some((dimension) => /no se sabe/i.test(dimension.context.observability)));
});

test("ACT-02: recommendations, unassigned solutions and no-license outcomes remain explicit", () => {
  const result = candidateResult("C18");
  const view = buildCandidateResultPresentationV3(result);
  assert.ok(view.recommendations.some((recommendation) => recommendation.solution === null));
  assert.ok(view.recommendations.every((recommendation) => Array.isArray(recommendation.conditions)));
  const noLicense = buildCandidateResultPresentationV3(candidateResult("C15"));
  assert.equal(noLicense.commercial.licenseName, null);
  assert.equal(noLicense.commercial.certainty, "Pendiente de confirmación");
});

test("ACT-02: presentation is deterministic and methodology retains the certified O4/O6 contract", () => {
  const result = candidateResult("C09");
  assert.deepEqual(buildCandidateResultPresentationV3(result), buildCandidateResultPresentationV3(result));
  assert.equal(CANDIDATE_METHODOLOGY_IDENTITY_V3, "diagnostic-methodology-3.0");
  const coverage = CANDIDATE_METHODOLOGY_SECTIONS_V3.find((section) => section.id === "coverage");
  const priorities = CANDIDATE_METHODOLOGY_SECTIONS_V3.find((section) => section.id === "priorities");
  assert.ok(coverage?.points.some((point) => point.includes("denominador de cobertura incluye solo dimensiones aplicables")));
  assert.ok(coverage?.points.some((point) => point.includes("hard cap")));
  assert.ok(priorities?.points.some((point) => point.includes("media normalizada certificada")));
  assert.ok(CANDIDATE_METHODOLOGY_SECTIONS_V3.find((section) => section.id === "limits")?.summary.includes("no prueba validez predictiva"));
});
