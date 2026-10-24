import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { buildCandidateDiagnosticReportV1, buildCandidateResultPresentationV3 } from "../../../app/components/diagnostic-flow/qa03b-presentation";
import { CANONICAL_REPORT_PAPER, DiagnosticReport } from "../../../app/components/diagnostic-report";
import { buildAnonymousDiagnosticSummaryV2 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { buildCandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";

const observedFollowupGap: AnswersV2 = {
  q2_entity: "business", q2_monetization: "services", q2_delivery: ["physical_location", "appointments", "remote_service"],
  q2_has_customers: "yes", q2_operational_status: "operating", q2_regularity: "regular", q2_customer_buyer: "b2c",
  q2_goal: "stop_losing", q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_reach: "local",
  q2_presence_digital_base: "reliable_presence", q2_presence_offer_clarity: "clear", q2_professional_intake_flow: "clear",
  q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_professional_authority_signals: "clearly_visible",
  q2_service_response_speed: "strong", q2_followup_general_process: "sometimes_lost", q2_service_quote_followup: "rarely",
  q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "rarely", q2_appointments_confirmation_reminders: "rarely",
  q2_appointments_rebooking: "reactive", q2_process_systemization: "defined", q2_operations_information_base: "easy_reliable",
  q2_measurement_practice: "consistent", q2_measurement_rate_estimate: "can_estimate",
  q2_measurement_result_recording: "consistent", q2_measurement_review_cycle: "regular_decisions",
};

function resultFor(id: string, options: Parameters<typeof runCandidateDiagnosticPipelineV3>[1] = {}) {
  const fixture = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert.ok(fixture, `synthetic canonical case ${id} exists`);
  return runCandidateDiagnosticPipelineV3(runCanonicalRouteV3(fixture).finalAnswers, options);
}

test("DIAG-MOTOR-03 identified recommendations show answer-level evidence and preserve anonymous summary allowlist", () => {
  const result = runCandidateDiagnosticPipelineV3(observedFollowupGap);
  const view = buildCandidateResultPresentationV3(result);
  const report = buildCandidateDiagnosticReportV1(result, new Date("2026-10-24T12:00:00.000Z"), new Date("2026-10-24T12:00:00.000Z"));
  const summary = buildAnonymousDiagnosticSummaryV2(result);

  assert.notEqual(result.overall.index.displayScore, null, "el caso con evidencia suficiente mantiene su porcentaje calculado");
  assert.ok(view.overall.rangeLabel, "el porcentaje calculado recibe el rango correspondiente");
  assert.equal(summary.overallStatus, view.overall.rangeLabel, "el resumen anónimo presenta el rango visible junto al porcentaje");
  if (view.overall.rangeLabel === "Funcional") assert.doesNotMatch(summary.executiveSummary, /estado general es BIEN/i, "el resumen evita el rótulo anterior para el rango Funcional");
  assert.equal(report.reportVersion, "1.2");
  assert.equal(report.candidateEngineIdentity.report, "diagnostic-report-v1.2");
  assert.equal(report.overallPresence.rangeLabel, view.overall.rangeLabel);
  assert.ok(view.recommendations.length > 0, JSON.stringify({ priorities: result.narrative.priorities, scoring: result.scoring.dimensions.filter((item) => item.score !== null).map((item) => [item.id, item.score, item.confidence.level]), recommendations: result.recommendations.items.map((item) => [item.dimension, item.sourceQuestionIds]) }));
  assert.ok(view.recommendations.every((recommendation) => recommendation.evidence.length > 0));
  assert.ok(view.recommendations.every((recommendation) => recommendation.evidence.some((item) => item.question.length > 0 && item.answer.length > 0)), JSON.stringify(view.recommendations));
  assert.ok(view.recommendations.every((recommendation) => recommendation.verificationStatus.length > 0));
  assert.ok(view.recommendations.every((recommendation) => recommendation.howToVerify.length > 0));
  assert.deepEqual(report.recommendations.map(({ title, evidence, verificationStatus, howToVerify }) => ({ title, evidence, verificationStatus, howToVerify })), view.recommendations.map(({ title, evidence, verificationStatus, howToVerify }) => ({ title, evidence, verificationStatus, howToVerify })));
  const html = renderToStaticMarkup(createElement(DiagnosticReport, { report, paper: CANONICAL_REPORT_PAPER }));
  assert.match(html, /Respuestas que respaldan esta recomendación/);
  if (view.overall.rangeLabel) assert.ok(html.includes(view.overall.rangeLabel), "el informe muestra el rango asociado al porcentaje");
  assert.match(html, /Cómo comprobar el resultado/);
  assert.ok(view.recommendations.flatMap((item) => item.evidence).every(({ answer }) => html.includes(answer)));
  assert.doesNotMatch(html, /q2_[a-z0-9_]+|sourceQuestionIds|recommendationEvidence/);
  assert.equal(Object.hasOwn(summary, "recommendationEvidence"), false);
  assert.equal(Object.keys(summary).length, 12);
});

test("DIAG-MOTOR-03 14 synthetic scenarios preserve evidence, uncertainty, contradictions and license gates", () => {
  const scenario = (id: string) => resultFor(id);
  const basicPresence = runCandidateDiagnosticPipelineV3({ ...observedFollowupGap, q2_presence_digital_base: "no_reliable_presence" });
  assert.ok(basicPresence.activeAnswers.q2_presence_digital_base === "no_reliable_presence");
  assert.equal(buildCandidateCommercialBoundaryV3({ answers: { ...observedFollowupGap, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } }).commercial.licenseFit.recommendedLicense, null, "a digital presence gap alone does not force a license");

  const advancedPresence = runCandidateDiagnosticPipelineV3({ ...observedFollowupGap, q2_presence_digital_base: "reliable_presence", q2_presence_offer_clarity: "clear" });
  assert.ok(advancedPresence.activeAnswers.q2_presence_digital_base === "reliable_presence");
  assert.ok(advancedPresence.scoring.dimensions.every((item) => item.score === null || (item.score >= 0 && item.score <= 100)));

  const captureAndTracking = runCandidateDiagnosticPipelineV3(observedFollowupGap);
  assert.ok(captureAndTracking.recommendations.items.some((item) => item.mode === "improve" && item.sourceQuestionIds.length > 0));

  const definedPipeline = runCandidateDiagnosticPipelineV3({ ...observedFollowupGap, q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_b2b_pipeline: "defined", q2_b2b_status_visibility: "lose_track" });
  assert.equal(definedPipeline.activeAnswers.q2_b2b_pipeline, "defined");

  const disorganizedProcess = runCandidateDiagnosticPipelineV3({ ...observedFollowupGap, q2_other_staff: "yes", q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal", q2_operations_information_base: "difficult_unreliable" });
  assert.ok(disorganizedProcess.scoring.dimensions.find((item) => item.id === "digital_readiness")?.evidence.some((item) => item.questionId === "q2_operations_information_base"));

  const b2bPipeline = buildCandidateCommercialBoundaryV3({ answers: { ...observedFollowupGap, q2_customer_buyer: "b2b", q2_b2b_pipeline: "informal", q2_b2b_status_visibility: "lose_track" } });
  assert.equal(b2bPipeline.commercial.licenseFit.recommendedLicense, "barrio");
  assert.ok(b2bPipeline.commercial.licenseFit.evidence.some((item) => item.evidenceType === "DERIVED"), "the recurring need is traced through the evidence-backed solution, not a raw pipeline label");

  const saasAnswers = { ...observedFollowupGap, q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_b2b_pipeline: "defined", q2_b2b_status_visibility: "somewhat", q2_monetization: "recurring", q2_measurement_practice: "unknown", q2_measurement_rate_estimate: "unknown", q2_measurement_result_recording: "unknown", q2_measurement_review_cycle: "unknown" } as AnswersV2;
  const saas = runCandidateDiagnosticPipelineV3(saasAnswers);
  assert.equal(saas.activeAnswers.q2_monetization, "recurring");
  assert.equal(saas.scoring.dimensions.find((item) => item.id === "measurement_optimization")?.score, null, "recurring software revenue does not invent retention, churn or product-use measurements");

  const appointments = runCandidateDiagnosticPipelineV3({ ...observedFollowupGap, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "often" });
  assert.ok(appointments.scoring.dimensions.find((item) => item.id === "conversion_access")?.evidence.some((item) => item.questionId === "q2_appointments_booking_friction"));

  const contradictory = scenario("C20");
  assert.ok(!contradictory.scoring.dimensions.find((item) => item.id === "relationship_recurrence")?.evidence.some((item) => item.state === "weak"), "a declared follow-up concern cannot override direct evidence that the process is consistent");

  const unknownMetricsAnswers = { ...observedFollowupGap, q2_measurement_practice: "unknown", q2_measurement_rate_estimate: "unknown", q2_measurement_result_recording: "unknown", q2_measurement_review_cycle: "unknown" } as AnswersV2;
  const unknownMetrics = runCandidateDiagnosticPipelineV3(unknownMetricsAnswers);
  assert.equal(unknownMetrics.scoring.dimensions.find((item) => item.id === "measurement_optimization")?.score, null);
  assert.equal(unknownMetrics.commercial.licenseFit.recommendedLicense, null, "unknown operational metrics do not create a license recommendation");

  const noLicense = scenario("C11");
  assert.equal(noLicense.commercial.licenseFit.recommendedLicense, null);

  const cuadra = buildCandidateCommercialBoundaryV3({ answers: { ...observedFollowupGap, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal" } });
  assert.equal(cuadra.commercial.licenseFit.recommendedLicense, "cuadra");
  assert.ok(cuadra.commercial.licenseFit.evidence.some((item) => item.questionId === "q2_process_systemization"));

  assert.equal(b2bPipeline.commercial.licenseFit.recommendedLicense, "barrio");
  const ciudad = buildCandidateCommercialBoundaryV3({
    answers: { ...observedFollowupGap, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_goal: "other" },
    clarificationAnswer: "multiple_coordinated_processes",
  });
  assert.equal(ciudad.commercial.licenseFit.recommendedLicense, "ciudad");
  assert.equal(ciudad.commercial.licenseFit.confidence, "high");
});
