import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buildDiagnosticReport, CANONICAL_REPORT_PAPER, CANDIDATE_REPORT_VERSION, DiagnosticReport, isSupportedDiagnosticReportVersion, REPORT_MAX_PAGE_COUNT, REPORT_PAGE_COUNT, REPORT_PATH, REPORT_VERSION, reportFileName } from "../../../app/components/diagnostic-report/index.ts";
import { packBlocks, REPORT_DENSITY_LEVELS } from "../../../app/components/diagnostic-report/diagnostic-report.tsx";
import { COMMERCIAL_ROLE_DISPLAY, PRIORITY_SLOT_DISPLAY } from "../../../app/components/diagnostic-result/index.ts";
import { DIGITAL_DIMENSION_IDS, GOLDEN_PERSONAS, runDiagnosticPipelineV3, runGoldenPersonaPipeline, type AnswersV2 } from "../../../app/features/diagnostic/index.ts";
import { METHODOLOGY_SECTIONS, METHODOLOGY_SOURCES, METHODOLOGY_VERSION } from "../../../app/features/diagnostic/qbv2-methodology.ts";

/** DIAG-V3-12 — informe PDF: un resultado, dos presentaciones; el informe no recalcula nada del diagnóstico. */

const DATE = new Date("2026-10-01T12:00:00");
const decode = (html: string) => html.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const goldens = GOLDEN_PERSONAS.map((persona) => {
  const result = runDiagnosticPipelineV3(runGoldenPersonaPipeline(persona).answers as AnswersV2);
  return { id: persona.id, result, report: buildDiagnosticReport({ ...result, generatedAt: DATE }) };
});
const golden = (id: string) => goldens.find((item) => item.id === id)!;
const render = (id: string) => renderToStaticMarkup(createElement(DiagnosticReport, { report: golden(id).report, paper: CANONICAL_REPORT_PAPER }));

test("12 report versions: report 1.0, methodology 1.0, distinct from the application version; canonical A4, three pages", () => {
  const app = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
  for (const { report } of goldens) {
    assert.equal(report.reportVersion, REPORT_VERSION);
    assert.equal(REPORT_VERSION, "1.0");
    assert.equal(report.methodologyVersion, METHODOLOGY_VERSION);
    assert.notEqual(report.reportVersion, app.version);
    assert.equal(report.generatedAt, "2026-10-01");
    assert.equal(report.generatedLabel, "1 de octubre de 2026");
    assert.equal(report.identity.businessName, null, "anonymous diagnostic: no invented business name");
  }
  assert.equal(CANONICAL_REPORT_PAPER, "a4");
  assert.equal(REPORT_PAGE_COUNT, 3, "editorial target");
  assert.equal(REPORT_MAX_PAGE_COUNT, 4, "real ceiling for an exceptional case that needs the typography floor");
});

test("QA-03B candidate report v1.1 and frozen report v1.0 are both valid stored report versions", () => {
  assert.equal(REPORT_VERSION, "1.0");
  assert.equal(CANDIDATE_REPORT_VERSION, "1.1");
  assert.equal(isSupportedDiagnosticReportVersion("1.0"), true);
  assert.equal(isSupportedDiagnosticReportVersion("1.1"), true);
  assert.equal(isSupportedDiagnosticReportVersion("1.2"), false);
  assert.equal(isSupportedDiagnosticReportVersion(null), false);
});

test("12 typography floor: the fitter never selects a body size below 8.5pt, and the preset list is exactly the approved one", () => {
  // DIAG-V3-12 readability pass: a professional report never drops below 8.5pt body text, however long the content.
  assert.deepEqual(REPORT_DENSITY_LEVELS, [9.5, 9, 8.5]);
  assert.ok(Math.min(...REPORT_DENSITY_LEVELS) >= 8.5, "no preset below the approved floor");
  assert.ok(Math.max(...REPORT_DENSITY_LEVELS) <= 9.5 && REPORT_DENSITY_LEVELS[0]! >= 9, "normal target stays in the 9-10pt range");
  // Directly exercise the lowest allowed preset: packing must still work (and respect the page ceiling) at the floor.
  const floor = REPORT_DENSITY_LEVELS.at(-1)!;
  assert.equal(floor, 8.5);
  const heights = Array.from({ length: 40 }, () => 20);
  assert.ok(packBlocks(heights, heights.map(() => false), 400, 2, REPORT_MAX_PAGE_COUNT) !== null, "the floor preset can still use up to the real page ceiling");
});

test("12 golden parity: the report carries exactly the canonical result (12/12)", () => {
  for (const { id, result: { narrative, outcome }, report } of goldens) {
    const overall = outcome.overall;
    assert.equal(report.overallPresence.state, overall.state, `${id}: state`);
    assert.equal(report.overallPresence.publicLabel, overall.publicLabel, `${id}: public label`);
    assert.equal(report.overallPresence.label, overall.label, `${id}: label`);
    assert.equal(report.overallPresence.percent, overall.index.displayScore === null ? null : `${overall.index.displayScore}%`, `${id}: percent`);
    assert.equal(report.overallPresence.explanation, overall.explanation.text, `${id}: explanation`);
    assert.match(report.overallPresence.coverage, new RegExp(`^${overall.index.assessed} de ${overall.index.applicable} `), `${id}: coverage`);
    // Ocho áreas, orden canónico, sin reordenar por score.
    assert.deepEqual(report.dimensions.map((item) => item.key), [...DIGITAL_DIMENSION_IDS], `${id}: canonical dimension order`);
    report.dimensions.forEach((item, index) => {
      const source = narrative.dimensions[index]!;
      assert.equal(item.score, source.score, `${id}/${item.key}: score`);
      assert.equal(item.status, source.status, `${id}/${item.key}: status`);
      assert.equal(item.interpretation, source.interpretation.text, `${id}/${item.key}: interpretation`);
      assert.deepEqual(item.evidenceTopics, source.evidence.map((entry) => entry.topic), `${id}/${item.key}: evidence topics`);
      assert.equal(item.percent === null, source.score === null || !["strong", "positive_signal", "partial", "weak"].includes(source.status), `${id}/${item.key}: null never shown as a percentage`);
    });
    // Prioridades y recomendaciones en el orden exacto del dominio.
    assert.deepEqual(report.priorities.map((item) => [item.rank, item.slotLabel, item.statement, item.why]), narrative.priorities.map((item) => [item.rank, PRIORITY_SLOT_DISPLAY[item.slot], item.statement.text, item.why.text]), `${id}: priorities`);
    assert.deepEqual(report.recommendations.map((item) => [item.step, item.title, item.whatToImprove, item.whyItMatters, item.expectedOutcome]), outcome.recommendations.items.map((item) => [item.rank, item.title, item.whatToImprove, item.whyItMatters, item.expectedOutcome]), `${id}: recommendations`);
    assert.deepEqual(report.actionPath.steps.map((item) => item.title), outcome.recommendations.items.map((item) => item.title), `${id}: action path order`);
    // Ofertas: las mismas, con el mismo rol, en el mismo paso.
    assert.deepEqual(
      report.vecidyaHelp.items.map((item) => [item.step, item.offerings.map((offering) => [offering.name, offering.roleLabel])]),
      outcome.help.items.map((item) => [outcome.recommendations.items.find((entry) => entry.id === item.recommendationId)!.rank, item.offerings.map((match) => [match.offering.name, COMMERCIAL_ROLE_DISPLAY[match.role]])]),
      `${id}: offerings`,
    );
  }
});

test("12 special golden cases keep their frozen readings", () => {
  const expect = (id: string, percent: string | null, label: string) => {
    assert.equal(golden(id).report.overallPresence.percent, percent, `${id}: percent`);
    assert.equal(golden(id).report.overallPresence.label, label, `${id}: label`);
  };
  expect("idea_early_stage", null, "Lectura general pendiente");
  expect("appointment_business", null, "Lectura general pendiente");
  expect("professional_appointments", "40%", "Presencia por fortalecer");
  expect("physical_retail", "82%", "Presencia sólida");
  assert.equal(golden("physical_retail").result.outcome.overall.caveat?.reason, "limited_confidence");
  expect("b2b_business", "74%", "Presencia sólida");
  expect("creator_personal_brand", "76%", "Presencia sólida");
  assert.equal(golden("creator_personal_brand").result.outcome.overall.caveat?.reason, "material_constraint");
  // Sin índice: nunca «0%»; el informe sigue completo.
  for (const id of ["idea_early_stage", "appointment_business"]) {
    const text = textOf(render(id));
    assert.ok(!/\b0\s?%/.test(text), `${id}: no 0%`);
    assert.ok(!text.includes("Confianza general:"), `${id}: no general confidence without an overall index`);
    assert.ok(text.includes("Lectura general pendiente") && text.includes("Las ocho áreas del diagnóstico"), id);
  }
});

test("12 methodology integration: version, four notes, limitations, the 8 accepted sources only, no audit data, Eurostat distinction", () => {
  const { report } = golden("b2b_business");
  assert.equal(report.methodologySummary.version, METHODOLOGY_VERSION);
  assert.equal(report.methodologySummary.notes.length, 4);
  assert.deepEqual(report.limitations, METHODOLOGY_SECTIONS.find((section) => section.id === "limitations")!.detail.map((item) => item.text));
  assert.deepEqual(report.sources.map((source) => source.url), METHODOLOGY_SOURCES.map((source) => source.url));
  assert.equal(report.sources.length, 8);
  for (const source of report.sources) assert.deepEqual(Object.keys(source).sort(), ["number", "organization", "title", "url", "year"]);
  assert.ok(!/hbr\.org|Harvard/.test(JSON.stringify(report)), "retired sources never reappear");
  assert.match(report.methodologySummary.formulaDistinction, /No es el Índice de Intensidad Digital de Eurostat/);
  const text = textOf(render("b2b_business"));
  for (const source of METHODOLOGY_SOURCES) assert.ok(!text.includes(source.excerpt) && !text.includes(source.verifiedOn), `${source.id}: audit data stays out`);
});

test("12 commercial honesty: the canonical resolver is conservative and keeps one license with explicit costs", () => {
  const appointment = golden("appointment_business");
  assert.equal(appointment.report.commercialRecommendation.licenseFit.recommendedLicense, "barrio");
  assert.equal(appointment.report.commercialRecommendation.now.license, "barrio");
  assert.match(textOf(render("appointment_business")), /hola@vecidya\.com/);
  const creator = golden("creator_personal_brand");
  assert.equal(creator.report.commercialRecommendation.licenseFit.recommendedLicense, "cuadra");
  assert.match(textOf(render("creator_personal_brand")), /hola@vecidya\.com/);
  const idea = golden("idea_early_stage");
  assert.equal(idea.report.commercialRecommendation.now.license, "cuadra", "pre-launch: minimum license");
  for (const { report } of goldens) assert.ok(["cuadra", "barrio", "ciudad"].includes(report.commercialRecommendation.now.license), "one canonical license always present");
  assert.ok(goldens.every(({ report }) => report.commercialRecommendation.cost.monthlyLicenseUsd >= 0));
});

test("12 the report layer computes no diagnostic semantics", () => {
  for (const file of ["app/components/diagnostic-report/report-model.ts", "app/components/diagnostic-report/diagnostic-report.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.ok(!/OVERALL_INDEX_MODEL|bandFor|classifyOverallState|computeDigitalPresenceIndex|scoreContextualDimensions|deriveConstraintsAndPriorities|deriveSemanticFacts|buildDiagnosticRecommendations|matchCommercialOfferings|CAPABILITY_CONTRIBUTION|SEVERITY_BANDS/.test(source), `${file}: no domain functions or thresholds`);
    assert.ok(!/score\s*[<>]=?\s*\d|[<>]=?\s*(40|70)\b|\.sort\(/.test(source), `${file}: no thresholds or reordering`);
  }
});

test("12 file name: sanitized, dated, without inventing a business name", () => {
  assert.equal(reportFileName(null, "2026-10-01"), "diagnostico-vecidya-2026-10-01.pdf");
  assert.equal(reportFileName("  ", "2026-10-01"), "diagnostico-vecidya-2026-10-01.pdf");
  assert.equal(reportFileName("Clínica Dental Peña / Sucursal #2", "2026-10-01"), "diagnostico-vecidya-clinica-dental-pena-sucursal-2-2026-10-01.pdf");
  assert.equal(reportFileName("../../etc/passwd", "2026-10-01"), "diagnostico-vecidya-etc-passwd-2026-10-01.pdf");
  const long = reportFileName("Asociación Comunitaria de Emprendedoras y Emprendedores del Barrio", "2026-10-01");
  assert.ok(long.length <= "diagnostico-vecidya-".length + 40 + "-2026-10-01.pdf".length && /^[a-z0-9-]+\.pdf$/.test(long), long);
});

test("12 rendered report: one h1, concise reading order, real text, no duplicated first action or internal IDs", () => {
  for (const { id } of goldens) {
    const html = render(id);
    const text = textOf(html);
    const candidateReport = golden(id).report;
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${id}: one h1`);
    assert.ok(text.includes("Diagnóstico de Presencia Digital") && text.includes(`Metodología ${METHODOLOGY_VERSION}`) || text.includes(`Metodología ${METHODOLOGY_VERSION}`), id);
    const focusHeading = candidateReport.recommendations.some((item) => item.step === 1) || candidateReport.actionPath.steps.some((step) => step.step === 1) || candidateReport.priorities.some((priority) => priority.rank === 1) ? "Qué hacer ahora" : "Qué conviene revisar";
    const order = ["Estado Actual:", "Lo que encontró el diagnóstico", focusHeading, "Las ocho áreas del diagnóstico", "Tu configuración Vecidya", "Cómo se evaluó", "Metodología y fuentes", "Lo que el diagnóstico no puede afirmar"];
    const positions = order.map((heading) => text.indexOf(heading));
    assert.ok(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1]!)), `${id}: section order ${JSON.stringify(positions)}`);
    assert.ok(!text.includes("Lo que más importa ahora") && !text.includes("Por dónde empezar") && !text.includes("Plan de acción recomendado"), `${id}: no repeats the primary action in separate sections`);
    if (candidateReport.overallPresence.state === "insufficient") assert.ok(!text.includes("Lo primero es confirmar"), `${id}: the overall status does not repeat the action`);
    const firstActionTitle = candidateReport.recommendations.find((item) => item.step === 1)?.title;
    if (firstActionTitle) assert.equal(text.split(firstActionTitle).length - 1, 1, `${id}: first recommendation appears once`);
    if (candidateReport.dimensionNotes.includes(candidateReport.overallPresence.coverage)) assert.equal(text.split(candidateReport.overallPresence.coverage).length - 1, 1, `${id}: coverage explanation appears once`);
    if (candidateReport.recommendations.some((item) => item.step > 1)) assert.ok(text.includes("Siguientes recomendaciones"), `${id}: later recommendations remain available`);
    assert.ok(!/\bq2_|\bnull\b|undefined|\[object Object\]|\bNaN\b|priority:\d|constraint:|recommendation:\d|evidence_gap|_constraint\b/.test(text), `${id}: internal or empty values`);
    assert.ok(!/session|sessionId|sourceFactIds/.test(html), `${id}: no session or provenance IDs`);
    for (const dimension of golden(id).report.dimensions) assert.ok(text.includes(dimension.label), `${id}: ${dimension.label}`);
  }
});

test("12 packing: blocks keep order, never split, headings travel with their content, more than three sheets is a failure", () => {
  // Título encadenado a una nota y al primer bloque: si no caben juntos, empiezan hoja nueva.
  assert.deepEqual(packBlocks([60, 10, 10, 30], [false, true, true, false], 100, 0, 3), [0, 1, 1, 1]);
  assert.deepEqual(packBlocks([40, 40, 40, 40], [false, false, false, false], 100, 5, 3), [0, 0, 1, 1]);
  assert.equal(packBlocks([90, 90, 90, 90], [false, false, false, false], 100, 0, 3), null, "a fourth sheet is not allowed");
  assert.equal(packBlocks([120], [false], 100, 0, 3), null, "a block taller than a sheet is not cut");
  const sheets = packBlocks([30, 30, 30, 30, 30], [false, false, false, false, false], 100, 0, 3)!;
  assert.deepEqual(sheets, [...sheets].sort((a, b) => a - b), "order preserved");
});

test("12 detailed report has no anonymous public route; the golden-fixture preview stays development-only", () => {
  const routes = readFileSync("app/routes.ts", "utf8");
  const publicBlock = routes.slice(0, routes.indexOf("...(isDevelopmentServer"));
  const devBlock = routes.slice(routes.indexOf("...(isDevelopmentServer"));
  assert.ok(!publicBlock.includes(`route("${REPORT_PATH.slice(1)}", "routes/diagnostico-informe.tsx")`), "detailed report is not available anonymously");
  assert.ok(publicBlock.includes('route("api/diagnostic/anonymous-summary", "routes/api-diagnostic-anonymous-summary.ts")'), "anonymous summary is calculated by the Worker");
  assert.ok(devBlock.includes(`route("__dev/diagnostico/informe/:personaId?", "routes/dev-diagnostic-report.tsx")`), "golden-fixture preview stays dev-only");
  assert.match(readFileSync("app/routes/dev-diagnostic-report.tsx", "utf8"), /if \(!import\.meta\.env\.DEV\) throw new Response\("Not Found", \{ status: 404 \}\)/);
  const publicSource = readFileSync("app/routes/diagnostico-informe.tsx", "utf8");
  assert.ok(!/GOLDEN_PERSONAS|runGoldenPersonaPipeline|params\.personaId|searchParams\.get\("debug"\)|searchParams\.get\("stress"\)/.test(publicSource), "no fixtures, golden profiles or debug params read in the public route");
  assert.match(publicSource, /noindex, nofollow/, "per-visitor report page is not indexed");
  const flow = readFileSync("app/components/diagnostic-flow/diagnostic-flow.tsx", "utf8");
  assert.match(flow, /Descargar informe PDF/);
  const publicFlow = readFileSync("app/components/diagnostic-flow/anonymous-diagnostic-flow.tsx", "utf8");
  assert.match(publicFlow, /AnonymousSummaryScreen/);
  assert.ok(!/DiagnosticResult|DiagnosticReport|REPORT_PATH|commercialRecommendation|df-dim/.test(publicFlow), "public flow does not render the detailed result or PDF");
  const endpoint = readFileSync("app/routes/api-diagnostic-anonymous-summary.ts", "utf8");
  assert.ok(!/db\/client|drizzle|GOLDEN_PERSONAS|runGoldenPersonaPipeline|console\.(log|info|warn|error)/.test(endpoint), "summary endpoint does not persist or log answers or use fixtures");
  assert.ok(!/fetch\(|sendBeacon|mailto:.*body/.test(publicSource), "no upload, email or lead capture");
});
