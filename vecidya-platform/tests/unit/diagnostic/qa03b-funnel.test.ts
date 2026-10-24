import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAnonymousDiagnosticSummaryV1,
  buildAnonymousSummaryReportV1,
  DIAGNOSTIC_FUNNEL_ANALYTICS_EVENTS_V1,
  DIAGNOSTIC_FUNNEL_STATES_V1,
  validateFunnelIdentificationV1,
} from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel.ts";
import { buildCandidateFunnelPreviewV1 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel-preview.ts";
import { buildCandidateResultPresentationV3 } from "../../../app/components/diagnostic-flow/qa03b-presentation.ts";

test("FUNNEL-01A: resumen anónimo proyecta una allowlist y conserva ausencia de score", () => {
  const result = buildCandidateFunnelPreviewV1("insufficient-evidence");
  const summary = buildAnonymousDiagnosticSummaryV1(result);

  assert.deepEqual(Object.keys(summary), [
    "contractVersion", "overallStatus", "score", "confidence", "coverage", "executiveSummary",
    "primaryOpportunity", "firstRecommendedAction", "limitations", "methodologyVersion", "diagnosticIdentity",
  ]);
  assert.equal(summary.contractVersion, "anonymous-diagnostic-summary-v1");
  assert.equal(summary.score, null, "sin evidencia suficiente no se inventa un porcentaje");
  assert.equal(summary.overallStatus, "Lectura general pendiente");
  assert.match(summary.executiveSummary, /No hay información suficiente/);
  assert.equal(summary.methodologyVersion, result.engineIdentity.methodology);
  assert.equal(summary.diagnosticIdentity, result.engineIdentity);
  assert.equal("dimensions" in summary, false);
  assert.equal("commercial" in summary, false);
  assert.equal("risks" in summary, false);
  assert.equal("email" in summary, false);

  assert.deepEqual(buildAnonymousSummaryReportV1(summary), {
    contractVersion: "anonymous-summary-report-v1",
    summary,
  });
});

test("FUNNEL-01A: el resumen copia score, foco, acción y provisionalidad desde la presentación", () => {
  const base = buildCandidateFunnelPreviewV1("contextual-focus");
  const source = {
    ...base,
    overall: {
      ...base.overall,
      state: "developing" as const,
      publicLabel: "REGULAR" as const,
      provisional: true,
      index: { ...base.overall.index, displayScore: 62 },
    },
  };
  const summary = buildAnonymousDiagnosticSummaryV1(source);
  const presentation = buildCandidateResultPresentationV3(source);

  assert.equal(summary.score, 62, "el mapper transfiere el valor; no ejecuta scoring");
  assert.equal(summary.overallStatus, "Áreas que conviene reforzar");
  assert.equal(summary.primaryOpportunity, presentation.priorities[0]?.statement ?? null);
  assert.equal(summary.firstRecommendedAction?.title ?? null, presentation.recommendations[0]?.title ?? null);
  assert.ok(summary.limitations.some((item) => /provisional/i.test(item)));
});

test("FUNNEL-01A: la identificación permite persona independiente, teléfono vacío y preferencias separadas", () => {
  const result = validateFunnelIdentificationV1({
    businessOrProjectName: "   ",
    responsibleName: "  Persona sintética  ",
    email: "  DEMO@example.test ",
    phone: "   ",
    commercialFollowUp: false,
    researchParticipation: false,
  });

  assert.deepEqual(result, {
    valid: true,
    value: {
      businessOrProjectName: null,
      responsibleName: "Persona sintética",
      email: "demo@example.test",
      phone: null,
      commercialFollowUp: false,
      researchParticipation: false,
    },
  });

  const commercialOnly = validateFunnelIdentificationV1({
    businessOrProjectName: "Proyecto sintético",
    responsibleName: "Persona sintética",
    email: "demo@example.test",
    phone: "+1 555 010 0100",
    commercialFollowUp: true,
    researchParticipation: false,
  });
  assert.equal(commercialOnly.valid, true);
  if (commercialOnly.valid) {
    assert.equal(commercialOnly.value.commercialFollowUp, true);
    assert.equal(commercialOnly.value.researchParticipation, false);
  }

  const researchOnly = validateFunnelIdentificationV1({
    businessOrProjectName: "",
    responsibleName: "Persona sintética",
    email: "demo@example.test",
    phone: "",
    commercialFollowUp: false,
    researchParticipation: true,
  });
  assert.equal(researchOnly.valid, true);
  if (researchOnly.valid) {
    assert.equal(researchOnly.value.commercialFollowUp, false);
    assert.equal(researchOnly.value.researchParticipation, true);
  }
});

test("FUNNEL-01A: correo inválido y responsable vacío impiden avanzar", () => {
  const result = validateFunnelIdentificationV1({
    businessOrProjectName: "",
    responsibleName: " ",
    email: "no-es-correo",
    phone: "",
    commercialFollowUp: false,
    researchParticipation: false,
  });

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.errors.responsibleName ?? "", /responsable/);
    assert.match(result.errors.email ?? "", /válido/);
  }
});

test("FUNNEL-01A: estados y taxonomía futura están versionados como contratos declarativos", () => {
  assert.deepEqual(DIAGNOSTIC_FUNNEL_STATES_V1, [
    "DIAGNOSTIC_IN_PROGRESS", "DIAGNOSTIC_COMPLETED", "ANONYMOUS_SUMMARY", "DETAILS_REQUESTED",
    "IDENTIFICATION_REQUIRED", "IDENTIFICATION_SUBMITTING", "IDENTIFICATION_VERIFICATION_PENDING",
    "DETAILED_REPORT_AVAILABLE", "PERSONALIZED_REPORT_READY", "ERROR_RECOVERABLE",
  ]);
  assert.equal(DIAGNOSTIC_FUNNEL_ANALYTICS_EVENTS_V1.length, 11);
  assert.ok(DIAGNOSTIC_FUNNEL_ANALYTICS_EVENTS_V1.includes("commercial_contact_requested"));
});
