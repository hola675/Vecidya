import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { CandidateDiagnosticResult } from "../../../app/components/diagnostic-flow/qa03b-result.tsx";
import { CANDIDATE_RESULT_IDENTITY_V3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline.ts";

const baseSummary = {
  contractVersion: "anonymous-diagnostic-summary-v2",
  overallStatus: "Lectura orientativa",
  score: null,
  confidence: "Limitada",
  coverage: "Cobertura parcial",
  executiveSummary: "Resumen sintético de prueba; no representa un negocio real.",
  primaryOpportunity: "Aclarar prioridades del recorrido.",
  firstRecommendedAction: { title: "Revisar una prioridad", explanation: "Ejemplo sintético para verificar presentación." },
  limitations: ["Cobertura parcial"],
  methodologyVersion: CANDIDATE_RESULT_IDENTITY_V3.methodology,
  diagnosticIdentity: CANDIDATE_RESULT_IDENTITY_V3,
  dimensions: ["Claridad", "Base", "Descubrimiento", "Confianza", "Conversión", "Relación", "Medición", "Operaciones"].map((label, index) => ({
    label, score: index < 2 ? 37 : null, statusLabel: index < 2 ? "Lectura parcial" : "No evaluado", preliminary: false, illustration: "/assets/selected/illustrations/dimensions/clarity.webp",
  })),
};

const render = (summary) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(CandidateDiagnosticResult, {
  summary, publicMode: true, onEdit: () => {}, onRequestReport: () => {},
})));

test("DIAG-VISUAL-03: rendered area readings preserve zero, null and preliminary status", () => {
  const dimensions = baseSummary.dimensions.map((dimension, index) => ({
    ...dimension,
    score: index === 0 ? 0 : index === 1 ? 37 : index === 2 ? null : dimension.score,
    preliminary: index === 1,
    statusLabel: index === 2 ? "No evaluado" : index === 3 ? "No aplica" : dimension.statusLabel,
  }));
  const html = render({ ...baseSummary, score: 0, dimensions });
  assert.match(html, /<p class="dr-presence__value">0%<\/p>/);
  assert.match(html, /<strong[^>]*>0%<\/strong>/);
  assert.match(html, /<strong[^>]*>37%<\/strong>/);
  assert.equal((html.match(/Lectura preliminar/g) ?? []).length, 1);
  assert.match(html, /No evaluado/);
  assert.match(html, /No aplica/);
  const areas = [...html.matchAll(/<li class="dr-area-overview__item">([\s\S]*?)<\/li>/g)].map(([, area]) => area);
  assert.ok(areas[2].includes("Sin lectura"));
  assert.ok(!areas[2].includes("dr-area-overview__bar-fill"));
  assert.ok(areas[0].includes('style="width:0%"'));
  assert.ok(areas[1].includes('style="width:37%"'));
});

test("DIAG-VISUAL-03: optional opportunity and action remain optional and limitations stay labeled", () => {
  const summary = { ...baseSummary, primaryOpportunity: null, firstRecommendedAction: null, limitations: ["Cobertura sintética limitada"] };
  const html = render(summary);
  assert.doesNotMatch(html, /Oportunidad principal|Primer paso recomendado/);
  assert.match(html, /Alcance de esta lectura/);
  assert.match(html, /Cobertura sintética limitada/);
});
