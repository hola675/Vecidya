import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateDiagnosticReportV1, buildCandidateResultPresentationV3 } from "../../../app/components/diagnostic-flow/qa03b-presentation";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { buildAnonymousDiagnosticSummaryV2 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_AUTHORED_CASES, runQA03BAuthoredRoute } from "./qa03b-case-matrix";
import { CANDIDATE_METHODOLOGY_IDENTITY_V3 } from "../../../app/components/diagnostic-flow/qa03b-methodology-content";

const active: AnswersV2 = {
  q2_entity: "business",
  q2_monetization: "services",
  q2_has_customers: "yes",
  q2_operational_status: "operating",
  q2_delivery: ["appointments"],
  q2_customer_buyer: "b2c",
  q2_goal: "measure",
  q2_friction: "operations",
};

test("QA-03B measurement evidence keeps its narrative topic in the presentation", () => {
  const topic = "la forma de registrar y revisar los resultados";

  for (const answer of ["consistent", "partial", "none"] as const) {
    const result = runCandidateDiagnosticPipelineV3({ ...active, q2_measurement_practice: answer });
    const presentation = buildCandidateResultPresentationV3(result);
    const measurement = presentation.dimensions.find((dimension) => dimension.key === "measurement_optimization");

    assert.ok(measurement, "the measurement dimension should be present");
    assert.ok(measurement.evidenceTopics.includes(topic), `${answer} should retain its evidence topic`);
    assert.doesNotMatch(measurement.interpretation, /respuestas sobre\s+ muestran/i);
  }
});

test("QA-03B measurement question is direct, understandable, and routed only for active operations", () => {
  const question = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((item) => item.id === "q2_measurement_practice");
  assert.ok(question, "the bank needs a direct measurement question");
  assert.match(question.prompt, /resultados/i);
  assert.match(question.hint ?? "", /no es necesario usar (?:una herramienta|herramientas digitales)/i);
  assert.deepEqual(question.evidenceV3?.dimensions, [{
    dimension: "measurement_optimization",
    directness: "direct",
    answers: {
      consistent: "established",
      partial: "partial",
      none: "weak",
      not_enough_activity: "not_applicable",
      unknown: "uncertainty",
    },
  }]);

  const operatingPlan = buildCandidateQuestionPlanV3({ answers: active });
  assert.ok(operatingPlan.evidenceSufficiency.usefulEvidenceQuestionIds.includes(question.id));
  assert.ok(operatingPlan.selectedQuestionIds.includes(question.id));
  for (const status of ["paused", "preparing", "unknown"] as const) {
    const plan = buildCandidateQuestionPlanV3({ answers: { ...active, q2_operational_status: status } });
    assert.ok(!plan.eligibleQuestionIds.includes(question.id), `${status} must not be asked as current activity`);
  }
});

test("QA-03B measurement response yields a direct score while unknown and insufficient activity stay unscored", () => {
  for (const [answer, shouldScore] of [
    ["consistent", true], ["partial", true], ["none", true],
    ["not_enough_activity", false], ["unknown", false],
  ] as const) {
    const result = runCandidateDiagnosticPipelineV3({ ...active, q2_measurement_practice: answer });
    const measurement = result.scoring.dimensions.find((item) => item.id === "measurement_optimization")!;
    assert.equal(measurement.score !== null, shouldScore, `${answer} score availability`);
    assert.equal(measurement.evidence.some((item) => item.questionId === "q2_measurement_practice" && item.directness === "direct"), true);
    if (!shouldScore) assert.equal(measurement.score, null, `${answer} is not negative evidence`);
  }
});

test("QA-03B does not report a declared goal as the primary opportunity without direct scored evidence", () => {
  const paused: AnswersV2 = {
    ...active,
    q2_operational_status: "paused",
    q2_goal: "explain",
    q2_presence_digital_base: "unknown",
    q2_presence_offer_clarity: "unknown",
  };
  const result = runCandidateDiagnosticPipelineV3(paused);
  const view = buildCandidateResultPresentationV3(result);
  const report = buildCandidateDiagnosticReportV1(result, new Date("2026-10-23T12:00:00Z"), new Date("2026-10-23T12:00:00Z"));
  const summary = buildAnonymousDiagnosticSummaryV2(result);

  assert.equal(view.priorities.length, 0);
  assert.equal(report.primaryConstraint?.title, "Lectura pendiente");
  assert.match(report.primaryConstraint?.text ?? "", /falta información para evaluar/i);
  assert.equal(summary.primaryOpportunity, null);
  assert.equal(summary.firstRecommendedAction, null);
});

test("QA-03B 20 authored journeys complete one question at a time and render consistent full reports", () => {
  assert.equal(CANDIDATE_METHODOLOGY_IDENTITY_V3, "diagnostic-methodology-3.2");
  assert.equal(QA03B_AUTHORED_CASES.length, 20);
  const ids = new Set<string>();
  const measurementStates = new Set<string>();
  for (const item of QA03B_AUTHORED_CASES) {
    assert.ok(!ids.has(item.id), `duplicate case ${item.id}`);
    ids.add(item.id);
    const route = runQA03BAuthoredRoute(item.id, item.answers);
    const result = runCandidateDiagnosticPipelineV3(route.answers);
    const view = buildCandidateResultPresentationV3(result);
    const report = buildCandidateDiagnosticReportV1(result, new Date("2026-10-23T12:00:00Z"), new Date("2026-10-23T12:00:00Z"));
    const measurement = result.scoring.dimensions.find((dimension) => dimension.id === "measurement_optimization")!;
    measurementStates.add(measurement.score === null ? "sin-puntuación" : "puntuada");
    assert.ok(route.asked.length >= 5 && route.asked.length <= 30, `${item.id}: ${route.asked.length} questions`);
    assert.ok(route.plan.nextQuestionId === undefined, `${item.id}: terminal route`);
    assert.equal(report.identity.lifecycleLabel, view.lifecycleLabel, `${item.id}: report lifecycle`);
    assert.equal(report.methodologyVersion, "3.2", `${item.id}: report methodology version`);
    assert.equal(report.methodologySummary.version, "3.2", `${item.id}: methodology summary version`);
    assert.equal(report.overallPresence.publicLabel, view.overall.publicLabel, `${item.id}: machine overall label`);
    assert.equal(report.overallPresence.label, view.overall.label, `${item.id}: display overall label`);
    if (report.primaryConstraint?.kicker === "Atención prioritaria") {
      assert.ok(view.priorities.some((priority) => priority.rank === 1 && priority.area === report.primaryConstraint?.title), `${item.id}: primary narrative must match an evidence-backed priority`);
    }
    if (route.answers.q2_operational_status !== "operating") assert.equal(measurement.score, null, `${item.id}: non-operating activity cannot be scored for current measurement`);
    if (["not_enough_activity", "unknown"].includes(String(route.answers.q2_measurement_practice))) assert.equal(measurement.score, null, `${item.id}: unknown/insufficient activity is not negative evidence`);
  }
  assert.deepEqual([...measurementStates].sort(), ["puntuada", "sin-puntuación"]);
});
