import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { chromium } from "playwright";
import { buildCandidateResultPresentationV3 } from "../../app/components/diagnostic-flow/candidate-presentation.ts";
import { completeCandidateSessionV3, createCandidateSessionV3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { runCandidateDiagnosticPipelineV3 } from "../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { buildCandidateQuestionPlanV3 } from "../../app/features/diagnostic/qbv2-candidate-planner.ts";
import { CANONICAL_CASES_V3 } from "../unit/diagnostic/qbv2-candidate-canonical-cases.ts";
import { runCanonicalRouteV3 } from "../unit/diagnostic/qbv2-candidate-case-runner.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const reportRoute = new URL("/__dev/diagnostico/candidate/informe", baseUrl).toString();
const storageKey = "vecidya.diagnostic.v3.candidate.session.2";
const outputDirectory = resolve("tmp/pdfs/act03-2");
mkdirSync(outputDirectory, { recursive: true });
function minimumPdfTextPoint(pdfBytes) {
  const raw = pdfBytes.toString("latin1");
  const objects = new Map([...raw.matchAll(/(\d+) 0 obj\b([\s\S]*?)endobj/g)].map((match) => [Number(match[1]), match[2]]));
  const streamOf = (body) => {
    const start = body.indexOf("stream");
    if (start < 0) return null;
    let from = start + 6;
    if (body[from] === "\r") from += 1;
    if (body[from] === "\n") from += 1;
    const data = Buffer.from(body.slice(from, body.lastIndexOf("endstream")), "latin1");
    try { return /\/FlateDecode/.test(body.slice(0, start)) ? inflateSync(data) : data; } catch { return null; }
  };
  const pageObjects = [...objects.values()].filter((body) => /\/Type\s*\/Page\b(?!s)/.test(body));
  const sizes = [];
  for (const page of pageObjects) {
    const contents = /\/Contents\s*(\[[^\]]*\]|\d+ 0 R)/.exec(page)?.[1] ?? "";
    for (const match of contents.matchAll(/(\d+) 0 R/g)) {
      const content = streamOf(objects.get(Number(match[1])) ?? "")?.toString("latin1") ?? "";
      for (const font of content.matchAll(/\/\w+\s+([\d.]+)\s+Tf\b/g)) sizes.push(Number(font[1]));
    }
  }
  if (sizes.length === 0) throw new Error("El PDF no contiene operadores tipográficos extraíbles en los flujos de página.");
  return Math.min(...sizes);
}
const samples = [
  { id: "C06", label: "active-three-priorities-no-license" },
  { id: "C01", label: "prelaunch-no-index" },
  { id: "C16", label: "insufficient-no-index-no-license" },
  { id: "C09", label: "active-commercial-license" },
  { id: "C14", label: "long-report-multiple-priorities-commercial" },
  { id: "C13", label: "hybrid-report" },
  { id: "C24", label: "supporting-only-no-license" },
];
const reportResults = [];
function completedSnapshot(id) {
  const definition = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert.ok(definition, `canonical scenario ${id}`);
  const route = runCanonicalRouteV3(definition);
  const created = createCandidateSessionV3({ sessionId: `act031-${id}-${Date.now()}`, writerId: "pdf-audit", now: Date.now() - 180_000 });
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
  assert.equal(session.status, "completing", `${id} has an explicit certified terminal state`);
  const done = completeCandidateSessionV3(session, "pdf-audit", session.updatedAt + 1);
  assert.ok(done);
  return done.session;
}

try {
  for (const sample of samples) {
    const session = completedSnapshot(sample.id);
    const view = buildCandidateResultPresentationV3(runCandidateDiagnosticPipelineV3(session.answers));
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: storageKey, raw: JSON.stringify(session) });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(reportRoute, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
    const markup = await page.locator(".rp").evaluate((root) => {
      const headings = [...root.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((element) => ({ level: Number(element.tagName.slice(1)), text: element.textContent?.trim() ?? "" }));
      const images = [...root.querySelectorAll("img")].map((image) => ({ hasAlt: image.hasAttribute("alt"), alt: image.getAttribute("alt") }));
      const links = [...root.querySelectorAll("a")].map((link) => ({ name: link.getAttribute("aria-label") || link.textContent?.trim(), href: link.getAttribute("href") }));
      const lists = [...root.querySelectorAll("li")].map((item) => item.parentElement?.tagName);
      const definitions = [...root.querySelectorAll("dl")].map((list) => ({ terms: list.querySelectorAll(":scope > div > dt").length, values: list.querySelectorAll(":scope > div > dd").length }));
      const tables = root.querySelectorAll("table").length;
      const clientCopy = root.cloneNode(true);
      clientCopy.querySelector(".rp-technical")?.remove();
      return { headings, images, links, lists, definitions, tables, text: root.innerText, clientText: clientCopy.innerText };
    });
    assert.equal(markup.headings.filter((heading) => heading.level === 1).length, 1, `${sample.id} has one H1`);
    for (let index = 1; index < markup.headings.length; index += 1) assert.ok(markup.headings[index].level <= markup.headings[index - 1].level + 1, `${sample.id} heading sequence does not skip levels`);
    assert.ok(markup.headings.every((heading) => heading.text.length > 0), `${sample.id} headings have names`);
    assert.ok(markup.images.every((image) => image.hasAlt), `${sample.id} images explicitly declare alternative text; decorative assets use empty alt`);
    assert.ok(markup.links.every((link) => link.name && link.href), `${sample.id} links expose text and destinations`);
    assert.ok(markup.lists.every((parent) => parent === "UL" || parent === "OL"), `${sample.id} list items remain in native lists`);
    assert.ok(markup.definitions.every((item) => item.terms === item.values && item.terms > 0), `${sample.id} term/value relationships use balanced definition lists`);
    assert.ok(markup.text.includes("Lo que el diagnóstico no puede afirmar") && markup.text.includes("Metodología y fuentes"), `${sample.id} exposes limitations and methodology in the DOM`);
    assert.ok(markup.text.includes("Anexo técnico: trazabilidad de la versión") && markup.text.includes(String(view.engineIdentity.engine)), `${sample.id} keeps the exact engine identity in its technical appendix`);
    assert.doesNotMatch(markup.clientText, /operational_commercial_evidence|single_process_or_multiple_coordinated_processes|Aplicabilidad R4|Observabilidad O6|\bDIRECT\b|KEEP_CURRENT_MEAN|ADOPT_CONTEXT_OBSERVABLE/, `${sample.id} keeps implementation codes out of client-facing copy`);
    if (sample.id === "C16") assert.ok(markup.text.includes("No hay información suficiente para confirmar fortalezas o dificultades."), "C16 describes insufficient evidence without claiming the absence of a constraint");
    if (sample.id === "C24") assert.ok(view.overall.publicLabel !== "BIEN" || /estado general es BIEN/i.test(markup.text), "C24 summary agrees with its BIEN result");
    if (sample.id === "C06") {
      assert.match(markup.text, /Después, conviene confirmar qué tan claro se entiende/i, "C06 phrases the confirmation step once");
      assert.doesNotMatch(markup.text, /verificar antes confirmar|confirmar confirmar/i, "C06 has grammatically complete confirmation wording");
    }
    if (view.overall.score === null) assert.ok(markup.text.includes(view.overall.label), `${sample.id} explains the absent overall score without inventing a percentage or band`);
    if (view.priorities.length >= 2) {
      const normalizedText = markup.text.toLocaleLowerCase("es");
      assert.ok(normalizedText.includes("prioridad principal") && (normalizedText.includes("prioridad secundaria") || normalizedText.includes("prioridad de apoyo")), `${sample.id} exposes multiple priority labels`);
    }
    if (view.commercial.licenseName) assert.ok(markup.text.includes(view.commercial.licenseName), `${sample.id} includes its supported commercial recommendation`);

    const cdp = await context.newCDPSession(page);
    const ax = await cdp.send("Accessibility.getFullAXTree");
    const axRoles = ax.nodes.map((node) => node.role?.value).filter(Boolean);
    assert.ok(axRoles.includes("heading") && axRoles.includes("article") && axRoles.includes("list"), `${sample.id} browser accessibility tree exposes headings, article and lists`);
    assert.equal(errors.length, 0, `${sample.id} renders without browser exceptions: ${errors.join(" | ")}`);

    for (const paper of ["a4", "letter"]) {
      if (paper === "letter") {
        await page.emulateMedia({ media: "screen" });
        await page.goto(`${reportRoute}?paper=letter`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.querySelector('.rp[data-paper="letter"][data-ready="true"]') !== null);
      }
      const report = page.locator(".rp");
      const pages = Number(await report.getAttribute("data-pages"));
      const density = Number(await report.getAttribute("data-density"));
      assert.ok(pages >= 1 && pages <= 4, `${sample.id}/${paper} fits within four pages (${pages})`);
      assert.ok(density >= 8.5, `${sample.id}/${paper} keeps the certified 8.5 pt minimum (${density})`);
      assert.equal(await report.getAttribute("data-overflow"), "false", `${sample.id}/${paper} has no detected overflow`);
      const minimumTextPt = await report.evaluate((root) => {
        const sizes = [...root.querySelectorAll("*")].filter((node) => node.textContent?.trim()).map((node) => Number.parseFloat(getComputedStyle(node).fontSize) * 0.75);
        return Math.min(...sizes);
      });
      assert.ok(minimumTextPt >= 8.49, `${sample.id}/${paper} keeps every rendered text element at or above 8.5pt (${minimumTextPt.toFixed(2)}pt)`);
      if (sample.id === "C14" && paper === "letter") {
        const commercialPages = await page.locator(".rp-sheet[data-page]").evaluateAll((sheets) => sheets.map((sheet) => sheet.innerText));
        assert.ok(commercialPages.some((text) => text.includes("LICENCIA RECOMENDADA: Barrio") && text.includes("Compatibles ahora")), "C14 letter keeps the recommended license and current compatible offers together");
      }
      await page.emulateMedia({ media: "print" });
      assert.equal(await report.evaluate((root) => root.classList.contains("rp--debug")), false, `${sample.id}/${paper} print output excludes development outlines`);
      const outputPath = resolve(outputDirectory, `candidate-${sample.id}-${paper}.pdf`);
      const pdf = await page.pdf({ path: outputPath, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
      const minimumPdfTfOperandPt = minimumPdfTextPoint(pdf);
      assert.ok(minimumPdfTfOperandPt >= 8.49, `${sample.id}/${paper} PDF Tf operands stay at or above 8.5pt (${minimumPdfTfOperandPt.toFixed(2)}pt)`);
      const pdfBytes = pdf.toString("latin1");
      assert.ok(/\/StructTreeRoot\s+\d+ 0 R/.test(pdfBytes), `${sample.id}/${paper} generated a tagged PDF structure tree`);
      assert.ok(/\/Lang\s*\(es\)/.test(pdfBytes), `${sample.id}/${paper} generated PDF declares Spanish`);
      reportResults.push({ file: `candidate-${sample.id}-${paper}.pdf`, bytes: pdf.length, pages, density, minimumPdfTfOperandPt, dimensions: `${view.overall.score === null ? "sin índice" : `${view.overall.score}%`}; ${view.priorities.length} prioridades; licencia ${view.commercial.licenseName ?? "ninguna"}` });
      await page.emulateMedia({ media: "screen" });
      if (paper === "letter") await page.goto(reportRoute, { waitUntil: "domcontentloaded" });
    }
    await context.close();
  }
} finally { await browser.close(); }

console.log(JSON.stringify({ generated: reportResults.length, directory: outputDirectory, reports: reportResults }, null, 2));
console.log("PDF automated review: browser DOM/AX tree and Chromium tagged output checked; independent PAC/Acrobat/NVDA inspection is not performed by this script.");
