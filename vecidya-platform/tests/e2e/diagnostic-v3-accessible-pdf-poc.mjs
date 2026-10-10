import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { chromium } from "playwright";
import { buildCandidateDiagnosticReportV1 } from "../../app/components/diagnostic-flow/candidate-presentation.ts";
import { completeCandidateSessionV3, createCandidateSessionV3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { runCandidateDiagnosticPipelineV3 } from "../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { buildCandidateQuestionPlanV3 } from "../../app/features/diagnostic/qbv2-candidate-planner.ts";
import { CANONICAL_CASES_V3 } from "../unit/diagnostic/qbv2-candidate-canonical-cases.ts";
import { runCanonicalRouteV3 } from "../unit/diagnostic/qbv2-candidate-case-runner.ts";

const outputDirectory = resolve("tmp/pdfs/act03-3");
const evidenceDirectory = resolve("tmp/act03-3");
mkdirSync(outputDirectory, { recursive: true });
mkdirSync(evidenceDirectory, { recursive: true });
const fontDirectory = resolve("node_modules/@fontsource/arimo/files");
const fontRegular = new Uint8Array(readFileSync(resolve(fontDirectory, "arimo-latin-400-normal.woff")));
const fontBold = new Uint8Array(readFileSync(resolve(fontDirectory, "arimo-latin-700-normal.woff")));
const bundlePath = resolve(evidenceDirectory, "accessible-pdf-renderer.js");
const bundle = await build({
  entryPoints: ["tests/e2e/accessible-pdf-renderer-entry.ts"],
  outfile: bundlePath,
  bundle: true,
  platform: "browser",
  format: "esm",
  target: ["chrome115"],
  minify: true,
  sourcemap: false,
  write: true,
  logLevel: "silent",
});
const bundleBytes = readFileSync(bundlePath);
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const samples = [];
const generated = [];
const externalRequests = [];

function completedSnapshot(id) {
  const definition = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert.ok(definition, `canonical scenario ${id}`);
  const route = runCanonicalRouteV3(definition);
  const created = createCandidateSessionV3({ sessionId: `act033-${id}`, writerId: "pdf-poc", now: Date.UTC(2026, 9, 9) - 180_000 });
  const plan = buildCandidateQuestionPlanV3({ answers: route.finalAnswers });
  const terminalReason = plan.completion.hardCapReached ? "hard_cap" : plan.evidenceSufficiency.terminalReason === "budget_blocked" ? "budget_blocked" : "no_useful_questions";
  const session = {
    ...created,
    answers: route.finalAnswers,
    answeredQuestionIds: route.asked.map((turn) => turn.id),
    queue: [],
    reviewIndex: null,
    status: "completing",
    terminalReason,
    revision: route.asked.length,
    updatedAt: created.startedAt + route.asked.length,
  };
  const complete = completeCandidateSessionV3(session, "pdf-poc", session.updatedAt + 1);
  assert.ok(complete, `${id} is completed before the report is built`);
  return { session: complete.session, completedAt: new Date(complete.session.updatedAt) };
}

try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(`BROWSER_ERROR ${error.stack}`));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:" || url.protocol === "https:") externalRequests.push(request.url());
  });
  await page.setContent("<!doctype html><html lang='es'><head><base href='http://localhost/'><meta charset='utf-8'><title>PDF PoC</title></head><body></body></html>");
  await page.addScriptTag({ type: "module", path: bundlePath });
  await page.waitForFunction(() => typeof window.renderAccessiblePdf === "function");
  for (const id of ["C01", "C14", "C16", "C24"]) {
    const { session, completedAt } = completedSnapshot(id);
    const pipelineResult = runCandidateDiagnosticPipelineV3(session.answers);
    const report = buildCandidateDiagnosticReportV1(pipelineResult, completedAt, new Date("2026-10-09T12:00:00.000Z"));
    assert.equal(report.reportVersion, "1.0", `${id} continues to use the certified report model v1`);
    writeFileSync(resolve(evidenceDirectory, `${id}.json`), JSON.stringify(report, null, 2));
    for (const paper of ["a4", "letter"]) {
      const startedAt = performance.now();
      const result = await page.evaluate(async ({ report, paper, regular, bold }) => {
        const heapBefore = performance.memory?.usedJSHeapSize ?? null;
        const render = window.renderAccessiblePdf;
        const bytes = await render({ report, paper, fontRegular: new Uint8Array(regular), fontBold: new Uint8Array(bold) });
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
        return { base64: btoa(binary), heapBefore, heapAfter: performance.memory?.usedJSHeapSize ?? null };
      }, { report, paper, regular: Array.from(fontRegular), bold: Array.from(fontBold) });
      const pdf = Buffer.from(result.base64, "base64");
      const pdfStructure = pdf.toString("latin1");
      assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-", `${id}/${paper} has a PDF signature`);
      const pageCount = pdfStructure.match(/\/Type\s*\/Pages\s*\/Count\s+(\d+)/)?.[1];
      assert.ok(pageCount, `${id}/${paper} exposes a page tree`);
      assert.ok(Number(pageCount) <= 3, `${id}/${paper} stays within the three-page ceiling (${pageCount})`);
      for (const marker of ["/Metadata", "<pdfuaid:part>1</pdfuaid:part>", "/StructTreeRoot", "/Lang (es)", "Arimo-", "/Subtype /Link"]) {
        assert.ok(pdfStructure.includes(marker), `${id}/${paper} contains ${marker}`);
      }
      const filename = `candidate-${id}-${paper}.pdf`;
      writeFileSync(resolve(outputDirectory, filename), pdf);
      generated.push({ scenario: id, paper, filename, bytes: pdf.length, generationMs: Math.round((performance.now() - startedAt) * 100) / 100, browserHeapDeltaBytes: result.heapBefore === null || result.heapAfter === null ? null : result.heapAfter - result.heapBefore });
    }
    samples.push({ id, reportVersion: report.reportVersion, overall: report.overallPresence.publicLabel, score: report.overallPresence.percent, dimensions: report.dimensions.length, priorities: report.priorities.length, recommendations: report.recommendations.length });
  }
} finally {
  await browser.close();
}

assert.equal(generated.length, 8, "exactly four canonical reports in two paper sizes are generated");
console.log(JSON.stringify({ generated: generated.length, outputDirectory, samples, generatedFiles: generated, rendererBundleBytes: bundleBytes.length, rendererBundleGzipBytes: gzipSync(bundleBytes).length, fontRegularBytes: fontRegular.length, fontBoldBytes: fontBold.length, externalRequests: externalRequests.length, externalRequestUrls: externalRequests }, null, 2));
