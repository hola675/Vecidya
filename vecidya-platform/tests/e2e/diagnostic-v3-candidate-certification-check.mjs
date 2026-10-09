import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { CANONICAL_CASES_V3 } from "../unit/diagnostic/qbv2-candidate-canonical-cases.ts";
import { runCandidateDiagnosticPipelineV3 } from "../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../app/features/diagnostic/qbv2-reviewed-evidence.ts";
import { CANDIDATE_SESSION_STORAGE_KEY_V3, parseCandidateSessionV3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { buildCandidateResultPresentationV3, buildCandidateDiagnosticReportV1 } from "../../app/components/diagnostic-flow/candidate-presentation.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const candidateRoute = new URL("/__dev/diagnostico/candidate", baseUrl).toString();
const reportRoute = new URL("/__dev/diagnostico/candidate/informe", baseUrl).toString();
const legacyRoute = new URL("/diagnostico", baseUrl).toString();
const legacyKey = "vecidya.diagnostic.v3.session.2";
const requiredCases = [
  ["servicio activo", "C06"], ["profesional independiente", "C02"], ["comercio minorista", "C07"],
  ["ecommerce", "C08"], ["B2B", "C09"], ["creador", "C10"], ["comunidad/nonprofit", "C11"],
  ["prelaunch", "C01"], ["híbrido", "C13"], ["información insuficiente", "C16"],
  ["instrument gap O6", "C15"], ["N/A estructural O6", "C17"], ["O4 facetas hermanas", "C14"],
  ["fricción declarada no confirmada", "C20"], ["Supporting sin necesidad comercial", "C24"],
];
const cases = requiredCases.map(([name, id]) => {
  const scenario = CANONICAL_CASES_V3.find((item) => item.id === id);
  assert(scenario, `the certified bank contains ${id}`);
  return { name, scenario };
});
const selectedIds = process.env.DIAG_CERT_CASES?.split(",").map((id) => id.trim()).filter(Boolean);
const selectedCases = selectedIds ? cases.filter(({ scenario }) => selectedIds.includes(scenario.id)) : cases;
assert(selectedCases.length > 0, "DIAG_CERT_CASES selects at least one registered scenario");
const stable = (value) => JSON.stringify(value, (_key, nested) => nested && !Array.isArray(nested) && typeof nested === "object"
  ? Object.fromEntries(Object.entries(nested).sort(([a], [b]) => a.localeCompare(b)))
  : nested);
const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1] ?? 0;
const assertNoOverflow = async (page, label) => {
  const bounds = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll("body *")].map((node) => ({ tag: node.tagName.toLowerCase(), cls: typeof node.className === "string" ? node.className : "", right: Math.round(node.getBoundingClientRect().right), width: Math.round(node.getBoundingClientRect().width), text: node.textContent.trim().slice(0, 50) })).filter((node) => node.right > document.documentElement.clientWidth + 1).slice(0, 5),
  }));
  assert(bounds.scroll <= bounds.width, `${label}: no horizontal overflow, ${JSON.stringify(bounds)}`);
};
const chosenValue = (answer) => Array.isArray(answer) ? answer : [answer];
const jsResponses = new Map();
const audits = { scenarios: [], requestedMutations: [], warnings: [], jsResponses };

async function chooseQuestion(page, script) {
  const first = page.locator(".df-option__input").first();
  const id = await first.getAttribute("name");
  const inputs = page.locator(`.df-option__input[name="${id}"]`);
  const type = await first.getAttribute("type");
  let answer = script[id];
  if (answer === undefined) {
    const definition = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((question) => question.id === id);
    const unknown = definition?.options.find((option) => option.kind === "unknown");
    assert(unknown, `${id} has an explicit respondent-unknown option; no synthetic business fact is supplied`);
    answer = type === "checkbox" ? [unknown.value] : unknown.value;
    audits.unknownFallbacks.push({ id, policy: "respondent selected the bank's explicit unknown option" });
  }
  const values = answer === undefined ? [await first.getAttribute("value")] : chosenValue(answer);
  assert(type === "radio" || type === "checkbox", `${id} uses a native radio or checkbox`);
  for (const value of values) {
    const input = page.locator(`.df-option__input[name="${id}"][value="${value}"]`);
    assert.equal(await input.count(), 1, `${id} exposes authored option ${value}`);
    await input.check();
  }
  const labelCount = await inputs.evaluateAll((elements) => elements.filter((element) => element.labels?.length === 1 && element.labels[0]?.htmlFor === element.id).length);
  assert.equal(labelCount, await inputs.count(), `${id} inputs have explicit native labels`);
  const selected = await inputs.evaluateAll((elements) => elements.filter((element) => element.checked).map((element) => element.value));
  assert.deepEqual([...selected].sort(), [...values].sort(), `${id} exactly preserves the canonical browser selection`);
  if (type === "checkbox" && selected.length > 1) assert(!selected.includes("other") && !selected.includes("unsure"), `${id} excludes incompatible catch-all options`);
  const previousId = id;
  const started = performance.now();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((oldId) => document.querySelector(".df-option__input")?.getAttribute("name") !== oldId || !!document.querySelector("#candidate-ready-title"), previousId);
  audits.navigationMs.push(performance.now() - started);
  await assertNoOverflow(page, `${id} at ${await page.evaluate(() => innerWidth)}px`);
  return { id, type, selected };
}

function checkResultProjection(page, expected, view) {
  return page.evaluate(({ expected, view }) => {
    const text = (selector) => [...document.querySelectorAll(selector)].map((node) => node.textContent.trim());
    return {
      state: document.querySelector(".dr-candidate-overall")?.getAttribute("data-state"),
      score: document.querySelector(".dr-candidate-overall .dr-presence__value")?.textContent.trim(),
      label: document.querySelector(".dr-candidate-overall .dr-presence__code")?.textContent.trim() ?? null,
      confidence: document.querySelector(".dr-candidate-overall .dr-candidate-overall__meta")?.textContent.replace(/\s+/g, " ").trim(),
      dimensions: [...document.querySelectorAll(".dr-dim-list > li.dr-dim")].map((node) => ({
        label: node.querySelector(".dr-dim__label")?.textContent.trim(),
        status: [...node.classList].find((value) => value.startsWith("dr-dim--") && !["dr-dimensions"].includes(value))?.replace("dr-dim--", ""),
        statusLabel: node.querySelector(".dr-status span")?.textContent.trim(),
        score: node.querySelector(".dr-meter__value")?.textContent.trim() ?? null,
        confidence: node.querySelector(".dr-confidence")?.textContent.replace(/\s+/g, " ").trim() ?? null,
        context: node.querySelector(".dr-candidate-dimension-context")?.textContent.replace(/\s+/g, " ").trim(),
      })),
      priorities: text(".dr-priority__statement"),
      recommendations: [...document.querySelectorAll(".dr-step-list > li.dr-step")].map((node) => ({
        title: node.querySelector(".dr-step__title")?.textContent.trim(),
        mode: node.querySelector(".dr-step__tag")?.textContent.trim(),
        solution: node.querySelector(".dr-candidate-solution")?.textContent.replace(/\s+/g, " ").trim(),
      })),
      licenseHeading: document.querySelector(".dr-candidate-license h3")?.textContent.trim(),
      commercialNow: text(".dr-vecidya h3 + ul > li > strong"),
      coveragetext: text(".dr-candidate-overall__meta dd").at(1),
    };
  }, { expected, view });
}

async function contrastAudit(page) {
  return page.evaluate(() => {
    const rgb = (color) => {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const [r, g, b, alpha = "1"] = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return [r / 255, g / 255, b / 255, alpha];
    };
    const luminance = (color) => color.slice(0, 3).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const blend = (front, back) => front.slice(0, 3).map((value, index) => value * front[3] + back[index] * (1 - front[3]));
    const violations = [];
    const ratios = [];
    for (const element of document.querySelectorAll("body *")) {
      if (!element.textContent.trim() || element.children.length && [...element.childNodes].every((node) => node.nodeType !== Node.TEXT_NODE || !node.textContent.trim())) continue;
      if (!element.getClientRects().length || element.closest("details:not([open])")) continue;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const foreground = rgb(style.color);
      if (!foreground) continue;
      let background = [1, 1, 1];
      const ancestors = [];
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) ancestors.unshift(ancestor);
      for (const ancestor of ancestors) {
        const parsed = rgb(getComputedStyle(ancestor).backgroundColor);
        if (parsed && parsed[3] > 0) background = blend(parsed, background);
      }
      const composed = blend(foreground, background);
      const lumA = luminance(composed), lumB = luminance(background);
      const ratio = (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
      const size = Number.parseFloat(style.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
      const required = large ? 3 : 4.5;
      ratios.push(ratio);
      if (ratio + 0.001 < required) violations.push({ element: element.tagName.toLowerCase(), className: typeof element.className === "string" ? element.className : "", parentClass: element.parentElement?.className ?? "", text: element.textContent.trim().slice(0, 70), ratio: Number(ratio.toFixed(2)), required, color: style.color, background: style.backgroundColor });
    }
    return { minRatio: Math.min(...ratios), checked: ratios.length, violations: violations.slice(0, 20) };
  });
}

async function createLegacySession(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(legacyRoute, { waitUntil: "networkidle" });
  const start = page.getByRole("button", { name: "Empezar" });
  if (await start.count()) await start.click();
  const continuation = page.getByRole("button", { name: /Empezar diagnóstico/ });
  if (await continuation.count()) await continuation.click();
  if (await page.locator(".df-option__input").count()) {
    await page.locator(".df-option__input").first().check();
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  const raw = await page.evaluate((key) => localStorage.getItem(key), legacyKey);
  assert(raw, "public legacy UI created an in-progress local session");
  assert.doesNotThrow(() => JSON.parse(raw), "legacy session JSON remains valid");
  await context.close();
  return raw;
}

async function completeScenario(browser, item, legacyRaw, viewport, paperSet) {
  const { name, scenario } = item;
  const context = await browser.newContext({ viewport: { width: viewport, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript(({ key, legacyKey, legacyRaw }) => {
    if (sessionStorage.getItem("diag-cert-initialized") !== "1") {
      localStorage.setItem(legacyKey, legacyRaw);
      localStorage.removeItem(key);
      sessionStorage.setItem("diag-cert-initialized", "1");
    }
  }, { key: CANDIDATE_SESSION_STORAGE_KEY_V3, legacyKey, legacyRaw });
  const page = await context.newPage();
  const pageErrors = [];
  const networkMutations = [];
  const networkOrigins = new Set();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      const text = message.text();
      if (/hydration|validateDOMNesting|cannot be a descendant|cannot contain a nested li/i.test(text)) audits.warnings.push(`${scenario.id}: ${text}`);
    }
  });
  page.on("request", (request) => {
    networkOrigins.add(new URL(request.url()).origin);
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) networkMutations.push(`${request.method()} ${request.url()}`);
  });
  page.on("response", async (response) => {
    const request = response.request();
    if (request.resourceType() === "script" && new URL(response.url()).origin === new URL(baseUrl).origin && !jsResponses.has(response.url())) {
      try { const body = await response.body(); jsResponses.set(response.url(), { bytes: body.byteLength, gzipBytes: gzipSync(body).byteLength }); } catch { /* stream already closed */ }
    }
  });
  const opened = performance.now();
  await page.goto(candidateRoute, { waitUntil: "networkidle" });
  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0];
    return entry ? { responseStart: entry.responseStart, domInteractive: entry.domInteractive, domContentLoaded: entry.domContentLoadedEventEnd, load: entry.loadEventEnd } : null;
  });
  assert(await page.getByText("Motor candidato inactivo en producción").count() === 1, `${scenario.id} is clearly local-only`);
  assert(await page.getByRole("heading", { level: 1 }).count() === 1, `${scenario.id} start state has one H1`);
  await assertNoOverflow(page, `${scenario.id} start at ${viewport}px`);
  const start = page.getByRole("button", { name: "Empezar diagnóstico" });
  await start.focus(); await page.keyboard.press("Enter");
  const routeMs = [];
  const asked = [];
  for (let turn = 0; turn < 30 && !(await page.locator("#candidate-ready-title").count()); turn += 1) {
    const title = page.locator(".df-question__title");
    await title.waitFor();
    assert.equal(await title.evaluate((element) => document.activeElement === element), true, `${scenario.id} moves focus to the new question heading`);
    const answer = await chooseQuestion(page, scenario.answerScript);
    asked.push(answer.id); routeMs.push(audits.navigationMs.at(-1));
  }
  assert.equal(await page.locator("#candidate-ready-title").count(), 1, `${scenario.id} terminates by planner policy`);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), CANDIDATE_SESSION_STORAGE_KEY_V3);
  assert.deepEqual(Object.keys(saved).sort(), ["answeredQuestionIds", "answers", "completedAt", "engineIdentity", "questionBankIdentity", "queue", "reviewIndex", "revision", "schemaVersion", "sessionId", "startedAt", "status", "terminalReason", "updatedAt", "writerId"].sort(), `${scenario.id} session stores only the versioned operational contract and no personal identity fields`);
  assert(asked.every((id) => scenario.answerScript[id] !== undefined || audits.unknownFallbacks.some((entry) => entry.id === id)), `${scenario.id} browser route uses authored answers or the explicit unknown response policy`);
  const pipelineStarted = performance.now();
  const expected = runCandidateDiagnosticPipelineV3(saved.answers);
  const pipelineMs = performance.now() - pipelineStarted;
  const expectedView = buildCandidateResultPresentationV3(expected);
  assert.deepEqual(stable(saved.answers), stable(expected.plan.activeAnswers), `${scenario.id} browser session answers equal the candidate planner's active answers`);
  assert.equal(saved.engineIdentity.engine, expected.engineIdentity.engine, `${scenario.id} persists exact candidate identity`);
  assert.equal(saved.terminalReason, expected.plan.completion.terminalReason, `${scenario.id} persists exact terminal reason`);
  assert.equal(saved.status, "completing", `${scenario.id} has not persisted a derived result before reconstruction`);
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), legacyKey), legacyRaw, `${scenario.id} leaves valid legacy session bytes unchanged`);

  const started = performance.now();
  await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  const completionMs = performance.now() - started;
  const resultSnapshot = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), CANDIDATE_SESSION_STORAGE_KEY_V3);
  assert.equal(resultSnapshot.status, "completed", `${scenario.id} completion is persisted as session state`);
  assert(!Object.hasOwn(resultSnapshot, "result"), `${scenario.id} derived result is not stored`);
  const actual = await checkResultProjection(page, expected, expectedView);
  const expectedScore = expectedView.overall.score === null ? expectedView.overall.label : `${expectedView.overall.score}%`;
  assert.equal(actual.state, expected.overall.state, `${scenario.id} screen state matches pipeline`);
  assert.equal(actual.score, expectedScore, `${scenario.id} overall score/uncertainty label matches pipeline`);
  assert.equal(actual.label, expectedView.overall.publicLabel, `${scenario.id} band matches pipeline`);
  assert.equal(actual.dimensions.length, expectedView.dimensions.length, `${scenario.id} renders every expected dimension`);
  assert.deepEqual(actual.dimensions.map((dim) => [dim.label, dim.statusLabel, dim.score, dim.confidence]), expectedView.dimensions.map((dim) => [dim.label, dim.statusLabel, dim.percent === null ? null : String(dim.percent), dim.confidence ? `Confianza ${dim.confidence.label.toLowerCase()}` : null]), `${scenario.id} dimension status, score and confidence match the certified pipeline`);
  assert.deepEqual(actual.priorities, expectedView.priorities.map((entry) => entry.statement), `${scenario.id} priority statements and ordering match`);
  assert.deepEqual(actual.recommendations.map((rec) => [rec.title, rec.mode]), expectedView.recommendations.map((entry) => [entry.title, entry.mode]), `${scenario.id} recommendations and mode match`);
  assert.equal(actual.licenseHeading, expectedView.commercial.licenseName ? `Licencia recomendada: ${expectedView.commercial.licenseName}` : "No se recomienda una licencia por ahora", `${scenario.id} license outcome matches`);
  assert.equal(actual.coveragetext, expectedView.overall.coverage, `${scenario.id} O6 denominator matches`);
  if (expected.overall.index.displayScore === null) {
    assert.equal(expected.overall.publicLabel, null, `${scenario.id} no score means no band`);
    assert(await page.locator(".dr-presence__value--none").count() === 1, `${scenario.id} uncertainty is explicit in the UI`);
  }
  await assertNoOverflow(page, `${scenario.id} result at ${viewport}px`);
  const contrast = await contrastAudit(page);
  audits.contrast.push({ scenario: scenario.id, ...contrast });

  await page.getByRole("link", { name: "Leer metodología candidata" }).click();
  await page.getByRole("heading", { name: "Cómo funciona el diagnóstico candidato de Vecidya" }).waitFor();
  const methodologyText = await page.locator("main").innerText();
  assert(methodologyText.includes(expected.engineIdentity.methodology.slice("diagnostic-methodology-".length)), `${scenario.id} methodology version matches the pipeline identity`);
  assert(/KEEP_CURRENT_MEAN|media normalizada certificada/i.test(methodologyText), `${scenario.id} methodology explains O4`);
  assert(/denominador de cobertura incluye solo dimensiones aplicables/i.test(methodologyText), `${scenario.id} methodology explains the O6 denominator`);
  assert(/vacío del instrumento|no se sabe|budget|límite de ruta/i.test(methodologyText), `${scenario.id} methodology addresses O6 uncertainty and gaps`);
  await page.getByRole("link", { name: "Regresar a la prueba candidata" }).click();
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  const reportStartedAt = new Date(resultSnapshot.startedAt);
  const expectedReport = buildCandidateDiagnosticReportV1(expected, reportStartedAt);
  const reportContext = expectedView.dimensions.map((dimension) => dimension.label);
  for (const label of reportContext) assert((await page.locator(".dr-dim__label").allTextContents()).includes(label), `${scenario.id} result retains report dimension ${label}`);
  await page.getByRole("link", { name: "Abrir informe imprimible" }).click();
  await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
  let pageCountA4 = 0, densityA4 = 0, pdfBytesA4 = 0;
  let pageCountLetter = 0, densityLetter = 0;
  let editReplan = null;
  if (paperSet.has(scenario.id)) {
    const report = page.locator(".rp");
    pageCountA4 = Number(await report.getAttribute("data-pages"));
    densityA4 = Number(await report.getAttribute("data-density"));
    const text = await report.innerText();
    assert.equal(pageCountA4 <= 4 && densityA4 >= 8.5, true, `${scenario.id} A4 report fits within four pages and 8.5 pt floor`);
    if (expectedReport.overallPresence.percent !== null) assert(text.replace(/\s/g, "").includes(String(expectedReport.overallPresence.percent).replace(/\s/g, "")), `${scenario.id} report percent ${expectedReport.overallPresence.percent} agrees with expected report model: ${text.slice(0, 700)}`);
    for (const priority of expectedReport.priorities) assert(text.includes(priority.statement), `${scenario.id} report contains expected priority ${priority.statement}`);
    for (const recommendation of expectedReport.recommendations) assert(text.includes(recommendation.title), `${scenario.id} report contains expected recommendation ${recommendation.title}`);
    for (const dimension of expectedReport.dimensions) assert(text.includes(dimension.label), `${scenario.id} report contains expected dimension ${dimension.label}`);
    if (expectedReport.candidateCommercial.licenseName === null) assert(text.includes("NINGUNA LICENCIA RECOMENDADA POR AHORA"), `${scenario.id} report accurately presents no license`);
    assert(!text.includes("hola@vecidya.com") && !text.includes("Correo electrónico"), `${scenario.id} report remains anonymous and has no CTA`);
    const pageTitle = await page.title();
    assert(pageTitle.includes(expectedReport.generatedAt), `${scenario.id} print metadata title uses report's diagnostic date`);
    const htmlAudit = await page.evaluate(() => ({
      headings: [...document.querySelectorAll(".rp h1,.rp h2,.rp h3,.rp h4,.rp h5,.rp h6")].map((item) => Number(item.tagName.slice(1))),
      tables: [...document.querySelectorAll(".rp table")].map((table) => ({ heads: table.querySelectorAll("th").length, scopes: [...table.querySelectorAll("th")].every((cell) => cell.hasAttribute("scope")) })),
      links: [...document.querySelectorAll(".rp a")].filter((link) => link.getAttribute("href")) .length,
      truncated: [...document.querySelectorAll(".rp *")].filter((node) => node.scrollHeight > node.clientHeight + 2 && getComputedStyle(node).overflowY !== "visible").length,
      language: document.documentElement.lang,
    }));
    assert.equal(htmlAudit.language, "es", `${scenario.id} report HTML declares Spanish`);
    assert(htmlAudit.headings.length > 0 && htmlAudit.headings[0] === 1, `${scenario.id} report starts with a top-level heading`);
    assert(htmlAudit.headings.every((level, index) => index === 0 || level <= htmlAudit.headings[index - 1] + 1), `${scenario.id} report headings do not skip levels`);
    assert(htmlAudit.tables.every((table) => table.heads > 0 && table.scopes), `${scenario.id} any report tables have scoped headers`);
    assert(htmlAudit.links > 0, `${scenario.id} report contains semantic source links`);
    assert.equal(htmlAudit.truncated, 0, `${scenario.id} report DOM has no vertically clipped text blocks`);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
    pdfBytesA4 = pdf.byteLength;
    const source = pdf.toString("latin1");
    const actualPdfPages = [...source.matchAll(/\/Type\s*\/Page\b(?!s)/g)].length;
    assert.equal(actualPdfPages, pageCountA4, `${scenario.id} generated A4 PDF page count matches browser layout`);
    assert(/\/StructTreeRoot\s+\d+ 0 R/.test(source) && /\/Marked\s+true/.test(source), `${scenario.id} PDF contains tagged-PDF structure markers`);
    assert(/\/Lang\s*\(es\)/.test(source), `${scenario.id} PDF sets document language to Spanish`);
    assert(/\/Title\b/.test(source), `${scenario.id} PDF document information dictionary carries a title`);
    assert(/\/Subtype\s*\/Link/.test(source), `${scenario.id} PDF has link annotations`);
    assert(!/\/S\s*\/Table\b/.test(source) || /\/S\s*\/TH\b/.test(source), `${scenario.id} PDF tables include header structure if tables are present`);
    assert.equal(await assertNoOverflow(page, `${scenario.id} report at ${viewport}px`), undefined);
    const reportContrast = await contrastAudit(page);
    audits.contrast.push({ scenario: `${scenario.id}/report`, ...reportContrast });
    if (paperSet.has(`${scenario.id}:letter`)) {
      await page.getByRole("link", { name: /Ver en Carta/ }).click();
      await page.waitForTimeout(1200);
      const letterState = await page.locator(".rp").count()
        ? await page.locator(".rp").evaluate((node) => ({ paper: node.getAttribute("data-paper"), ready: node.getAttribute("data-ready"), overflow: node.getAttribute("data-overflow"), pages: node.getAttribute("data-pages"), density: node.getAttribute("data-density"), flow: !!node.querySelector(".rp-doc--flow") }))
        : { url: page.url(), title: await page.title(), pageText: (await page.locator("body").innerText()).slice(0, 500), candidateRaw: await page.evaluate((key) => localStorage.getItem(key), CANDIDATE_SESSION_STORAGE_KEY_V3) };
      assert(letterState.paper === "letter" && letterState.ready === "true", `${scenario.id} Carta layout reaches a fit state: ${JSON.stringify(letterState)}`);
      pageCountLetter = Number(await page.locator(".rp").getAttribute("data-pages"));
      densityLetter = Number(await page.locator(".rp").getAttribute("data-density"));
      assert(pageCountLetter <= 4 && densityLetter >= 8.5, `${scenario.id} Letter report fits within limits`);
      const letterPdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
      assert.equal([...letterPdf.toString("latin1").matchAll(/\/Type\s*\/Page\b(?!s)/g)].length, pageCountLetter, `${scenario.id} Carta PDF agrees with report sheet count`);
    }
  }

  if (scenario.id === "C13") {
    await page.getByRole("link", { name: "Volver a la sesión candidata" }).click();
    await page.getByRole("button", { name: "Ver mi resultado" }).click();
    await page.getByRole("button", { name: "Editar respuestas" }).click();
    for (let backCount = 0; await page.locator(".df-option__input").first().getAttribute("name") !== "q2_delivery"; backCount += 1) {
      assert(backCount < 25, "edit review reaches the hybrid delivery answer");
      await page.getByRole("button", { name: "Volver" }).click();
    }
    const staleResult = page.locator("#candidate-result-title");
    assert.equal(await staleResult.count(), 0, "editing invalidates the previously active result view");
    await page.locator('.df-option__input[name="q2_delivery"][value="online_checkout"]').uncheck();
    await page.getByRole("button", { name: "Continuar" }).click();
    let edited = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), CANDIDATE_SESSION_STORAGE_KEY_V3));
    assert.notEqual(edited.status, "completed", "edited route clears completion state");
    assert.deepEqual(edited.answers.q2_delivery, ["retail"], "edited multi-answer value is saved exactly");
    assert(!Object.hasOwn(edited.answers, "q2_ecommerce_product_discovery") && !Object.hasOwn(edited.answers, "q2_ecommerce_traffic_sources"), "editing hybrid context invalidates downstream ecommerce-only answers");
    const editedAsked = [];
    for (let turn = 0; turn < 30 && !(await page.locator("#candidate-ready-title").count()); turn += 1) {
      const answer = await chooseQuestion(page, scenario.answerScript);
      editedAsked.push(answer.id);
    }
    assert.equal(await page.locator("#candidate-ready-title").count(), 1, "replanned retail-only route reaches its terminal state");
    edited = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), CANDIDATE_SESSION_STORAGE_KEY_V3));
    assert(!Object.hasOwn(edited.answers, "q2_ecommerce_product_discovery") && !Object.hasOwn(edited.answers, "q2_ecommerce_traffic_sources"), "replanned answers remain free of stale ecommerce facts");
    const editedPipeline = runCandidateDiagnosticPipelineV3(edited.answers);
    assert.deepEqual(stable(edited.answers), stable(editedPipeline.plan.activeAnswers), "edited browser answers match the re-planned candidate pipeline");
    await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
    await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
    const editedResultSnapshot = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), CANDIDATE_SESSION_STORAGE_KEY_V3);
    assert.equal(editedResultSnapshot.status, "completed", "edited scenario completes and stores only completion state");
    assert(parseCandidateSessionV3(JSON.stringify(editedResultSnapshot), Date.now()), "completed edited session remains schema-valid for reload");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    assert.equal(await page.getByRole("button", { name: "Ver mi resultado" }).count(), 1, "edited result resumes after reload");
    await page.getByRole("button", { name: "Ver mi resultado" }).click();
    await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
    assert.deepEqual(stable(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null").answers, CANDIDATE_SESSION_STORAGE_KEY_V3)), stable(edited.answers), "reload resumes the exact edited answer set");
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), legacyKey), legacyRaw, "edit and replan preserve the independent legacy session");
    editReplan = { originalQuestions: asked.length, editedQuestions: editedAsked.length, invalidated: ["q2_ecommerce_product_discovery", "q2_ecommerce_traffic_sources"], reloadResumed: true };
  }

  if (scenario.id === "C24") {
    await page.getByRole("link", { name: "Volver a la sesión candidata" }).click();
    await page.getByRole("button", { name: "Empezar de nuevo" }).click();
    await page.getByRole("button", { name: "Sí, empezar de nuevo" }).click();
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), CANDIDATE_SESSION_STORAGE_KEY_V3), null, "confirmed candidate reset clears only candidate progress");
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), legacyKey), legacyRaw, "confirmed candidate reset preserves the legacy session byte-for-byte");
    assert.equal(await page.getByRole("button", { name: "Empezar diagnóstico" }).count(), 1, "confirmed reset returns to a fresh candidate start");
  }

  assert.deepEqual(pageErrors, [], `${scenario.id} browser has no uncaught errors`);
  assert.deepEqual(networkMutations, [], `${scenario.id} browser issues no POST/PUT/PATCH/DELETE requests`);
  assert.deepEqual([...networkOrigins], [new URL(baseUrl).origin], `${scenario.id} candidate traffic stays on the local app origin`);
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), legacyKey), legacyRaw, `${scenario.id} legacy session still survives result and report navigation`);
  const terminal = { id: scenario.id, family: name, routeLength: asked.length, terminalReason: saved.terminalReason, license: expected.commercial.licenseFit.recommendedLicense ?? "none", durationMs: performance.now() - opened, pipelineMs, completionMs, editReplan, routeMs, navigation, pageCountA4, densityA4, pdfBytesA4, pageCountLetter, densityLetter, publicLabel: expected.overall.publicLabel, displayScore: expected.overall.index.displayScore, priorityCount: expectedView.priorities.length };
  audits.scenarios.push(terminal);
  console.log(`PASS ${scenario.id} ${name}: ${asked.length} preguntas, ${saved.terminalReason}, license=${terminal.license}, route ${Math.round(percentile(routeMs, 0.5))} ms median, result ${Math.round(completionMs)} ms${pageCountA4 ? `, PDF ${pageCountA4}p/${densityA4}pt` : ""}`);
  await context.close();
  return { item, expected, terminal };
}

audits.navigationMs = [];
audits.contrast = [];
audits.unknownFallbacks = [];
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const legacyRaw = await createLegacySession(browser);
  const papers = new Set(["C06", "C01", "C16", "C13", "C09", "C15", "C16:letter"]);
  const viewports = [360, 390, 768, 1366];
  const results = [];
  for (const [index, item] of selectedCases.entries()) results.push(await completeScenario(browser, item, legacyRaw, viewports[index % viewports.length], papers));

  const lengths = audits.scenarios.map((item) => item.routeLength);
  const terminalCounts = Object.fromEntries(["no_useful_questions", "budget_blocked", "hard_cap"].map((reason) => [reason, audits.scenarios.filter((item) => item.terminalReason === reason).length]));
  const licenseCounts = Object.fromEntries(["none", "cuadra", "barrio", "ciudad"].map((license) => [license, audits.scenarios.filter((item) => item.license === license).length]));
  assert.equal(audits.scenarios.length, selectedCases.length, "all selected E2E scenarios ran");
  console.log(`ROUTES ${JSON.stringify({ n: lengths.length, min: Math.min(...lengths), p25: percentile(lengths, 0.25), median: percentile(lengths, 0.5), p75: percentile(lengths, 0.75), max: Math.max(...lengths), terminalCounts, licenseCounts, explicitUnknownFallbacks: audits.unknownFallbacks.length })}`);
  console.log(`PERFORMANCE ${JSON.stringify({ navigationMs: { median: Math.round(percentile(audits.navigationMs, 0.5)), p95: Math.round(percentile(audits.navigationMs, 0.95)), samples: audits.navigationMs.length }, jsBytes: [...jsResponses.values()].reduce((sum, item) => sum + item.bytes, 0), jsGzipBytes: [...jsResponses.values()].reduce((sum, item) => sum + item.gzipBytes, 0), jsModules: jsResponses.size, scenarios: audits.scenarios.map(({ id, pipelineMs, completionMs, durationMs, editReplan, pageCountA4, densityA4, pageCountLetter, densityLetter, navigation }) => ({ id, pipelineRecomputeMs: Number(pipelineMs.toFixed(3)), resultPlusRenderMs: Math.round(completionMs), totalMs: Math.round(durationMs), editReplan, pdfA4: pageCountA4 ? { pages: pageCountA4, densityPt: densityA4 } : null, pdfLetter: pageCountLetter ? { pages: pageCountLetter, densityPt: densityLetter } : null, navigation })) })}`);
  console.log(`A11Y ${JSON.stringify({ contrastSamples: audits.contrast.length, minimumRatio: Number(Math.min(...audits.contrast.map((entry) => entry.minRatio)).toFixed(2)), contrastViolations: audits.contrast.flatMap((entry) => entry.violations.map((issue) => ({ scenario: entry.scenario, ...issue }))).slice(0, 30), hydrationWarnings: audits.warnings })}`);
  assert.deepEqual(audits.warnings, [], "candidate flow emitted no reproducible hydration or nested-list warning");
} finally { await browser.close(); }

console.log(`diagnostic-v3-candidate-certification-check: ${audits.scenarios.length}/${selectedCases.length} E2E scenarios PASS${selectedIds ? ` (selected: ${selectedIds.join(",")})` : ""}`);
