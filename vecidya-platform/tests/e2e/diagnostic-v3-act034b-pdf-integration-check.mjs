import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import { build } from "esbuild";
import { buildCandidateDiagnosticReportV1 } from "../../app/components/diagnostic-flow/candidate-presentation.ts";
import { completeCandidateSessionV3, createCandidateSessionV3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { runCandidateDiagnosticPipelineV3 } from "../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { buildCandidateQuestionPlanV3 } from "../../app/features/diagnostic/qbv2-candidate-planner.ts";
import { CANONICAL_CASES_V3 } from "../unit/diagnostic/qbv2-candidate-canonical-cases.ts";
import { runCanonicalRouteV3 } from "../unit/diagnostic/qbv2-candidate-case-runner.ts";
import { buildCandidatePdfSemanticManifest } from "./accessible-pdf-semantic-manifest.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const ids = ["C01", "C06", "C09", "C13", "C14", "C16", "C24"];
const storageKey = "vecidya.diagnostic.v3.candidate.session.2";
const output = resolve("tmp/pdfs/act03-4b");
const evidence = resolve("tmp/act03-4b");
mkdirSync(output, { recursive: true });
mkdirSync(evidence, { recursive: true });
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const generated = [];
const externalRequests = [];
const errors = [];

function completedSnapshot(id) {
  const definition = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert.ok(definition, `canonical scenario ${id}`);
  const route = runCanonicalRouteV3(definition);
  const now = Date.now();
  const created = createCandidateSessionV3({ sessionId: `act034b-${id}-${now}`, writerId: "pdf-integration", now: now - 180_000 });
  const plan = buildCandidateQuestionPlanV3({ answers: route.finalAnswers });
  const terminalReason = plan.completion.hardCapReached ? "hard_cap" : plan.evidenceSufficiency.terminalReason === "budget_blocked" ? "budget_blocked" : "no_useful_questions";
  const pending = {
    ...created,
    answers: route.finalAnswers,
    answeredQuestionIds: route.asked.map((turn) => turn.id),
    queue: [], reviewIndex: null, status: "completing", terminalReason,
    revision: route.asked.length,
    updatedAt: created.startedAt + route.asked.length,
  };
  const done = completeCandidateSessionV3(pending, "pdf-integration", pending.updatedAt + 1);
  assert.ok(done, `${id} fixture is a valid completed session`);
  return done.session;
}

try {
  for (const id of ids) {
    const session = completedSnapshot(id);
    // Build the certified result via the same candidate presentation adapter used by the route.
    const model = buildCandidateDiagnosticReportV1(runCandidateDiagnosticPipelineV3(session.answers), new Date(session.completedAt), new Date("2026-10-10T12:00:00Z"));
    writeFileSync(resolve(evidence, `${id}.json`), JSON.stringify(model, null, 2));
    writeFileSync(resolve(evidence, `${id}.semantic-manifest.json`), JSON.stringify(buildCandidatePdfSemanticManifest(model, id), null, 2));

    for (const paper of ["a4", "letter"]) {
      const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
      await context.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: storageKey, raw: JSON.stringify(session) });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`${id}/${paper}: ${error.message}`));
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (["http:", "https:"].includes(url.protocol) && url.origin !== new URL(baseUrl).origin) externalRequests.push(request.url());
      });
      await page.goto(new URL(`/__dev/diagnostico/candidate/informe${paper === "letter" ? "?paper=letter" : ""}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
      const reportElement = page.locator(".rp");
      assert.equal(await reportElement.getAttribute("data-overflow"), "false", `${id}/${paper} HTML report fits before PDF export`);
      const resourcesBefore = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
      assert.ok(!resourcesBefore.some((name) => /pdfkit|fontkit|arimo.*\.woff/i.test(name)), `${id}/${paper} does not preload PDFKit or Arimo before export`);

      const startedAt = performance.now();
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Descargar informe PDF" }).click();
      const download = await downloadPromise;
      const destination = resolve(output, `candidate-${id}-${paper}.pdf`);
      await download.saveAs(destination);
      const status = await page.locator(".rp-export-status").innerText();
      assert.match(status, /Descarga iniciada/);
      assert.match(status, /no podemos confirmar que se guardó/);
      assert.equal(await reportElement.getAttribute("data-paper"), paper);
      const metrics = await page.evaluate(() => performance.getEntriesByType("measure").filter((entry) => entry.name.startsWith("vecidya-candidate-pdf-")).map((entry) => ({ name: entry.name, durationMs: Math.round(entry.duration * 100) / 100 })));
      const dynamicResources = await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => /accessible-pdf|pdfkit|fontkit|arimo.*\.woff/i.test(entry.name)).map((entry) => ({ name: new URL(entry.name).pathname, transferBytes: entry.transferSize, encodedBytes: entry.encodedBodySize })));
      generated.push({ id, paper, filename: download.suggestedFilename(), bytes: statSync(destination).size, elapsedMs: Math.round(performance.now() - startedAt), status, metrics, dynamicResources });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

assert.equal(generated.length, 14, "the real candidate report route generated seven A4/Carta pairs");
assert.deepEqual(externalRequests, [], "PDF export made no cross-origin network requests");
assert.deepEqual(errors, [], `the browser rendered without exceptions: ${errors.join(" | ")}`);
const rendererBundlePath = resolve(evidence, "accessible-pdf-renderer.bundle.js");
await build({
  entryPoints: ["tests/e2e/accessible-pdf-renderer-entry.ts"],
  outfile: rendererBundlePath,
  bundle: true, platform: "browser", format: "esm", target: ["chrome115"],
  minify: true, sourcemap: false, write: true, logLevel: "silent",
});
const rendererBundle = readFileSync(rendererBundlePath);
const rendererStats = { bytes: rendererBundle.length, gzipBytes: gzipSync(rendererBundle).length };
const regularFontBytes = statSync(resolve("node_modules/@fontsource/arimo/files/arimo-latin-400-normal.woff")).size;
const boldFontBytes = statSync(resolve("node_modules/@fontsource/arimo/files/arimo-latin-700-normal.woff")).size;
console.log(JSON.stringify({ generated: generated.length, output, evidence, generatedFiles: generated, externalRequests, rendererStats, regularFontBytes, boldFontBytes }, null, 2));
