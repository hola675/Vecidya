import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";
import { assertCandidateMethodologyContracts } from "./candidate-methodology-contracts.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const route = new URL("/__dev/diagnostico/candidate", baseUrl).toString();
const candidateKey = "vecidya.diagnostic.v3.candidate.session.2";
const legacyKey = "vecidya.diagnostic.v3.session.2";
const legacyFixture = "legacy-session-must-remain-byte-for-byte";
const preferred = { q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable", q2_goal: "explain", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_process_systemization: "defined", q2_local_presence_consistency: "partial", q2_ecommerce_product_discovery: "confusing", q2_retail_product_visibility: "partial", q2_ecommerce_traffic_sources: ["search"], q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let passed = 0;
const pass = (message) => { passed += 1; console.log(`PASS ${message}`); };
const currentId = (page) => page.locator(".df-option__input").first().getAttribute("name");
const saved = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), candidateKey);
async function chooseAndContinue(page, answerSet = preferred, strict = false) {
  const id = await currentId(page);
  const inputs = page.locator(`.df-option__input[name="${id}"]`);
  const type = await inputs.first().getAttribute("type");
  const desired = answerSet[id];
  if (strict) assert(desired !== undefined, `browser fixture explicitly authors planner question ${id}`);
  const desiredValues = Array.isArray(desired) ? desired : desired ? [desired] : [];
  let selectedValues = [];
  if (type === "checkbox" && desiredValues.length) {
    for (const value of desiredValues) {
      const input = page.locator(`.df-option__input[name="${id}"][value="${value}"]`);
      assert(await input.count() === 1, `${id} exposes the authored multiple-choice value ${value}`);
      await input.click();
    }
  } else if (desiredValues.length) {
    const input = page.locator(`.df-option__input[name="${id}"][value="${desiredValues[0]}"]`);
    if (await input.count()) await input.click(); else await inputs.first().click();
  } else await inputs.first().click();
  if (type === "checkbox") {
    selectedValues = await page.locator(`.df-option__input[name="${id}"]:checked`).evaluateAll((elements) => elements.map((element) => element.value));
    assert(selectedValues.length >= (desiredValues.length > 1 ? 2 : 1), `${id} retains the genuine browser selection count`);
    if (selectedValues.length > 1) assert(!selectedValues.includes("other") && !selectedValues.includes("unsure"), `${id} keeps exclusive options out of a multi-answer selection`);
  }
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((oldId) => document.querySelector(".df-option__input")?.getAttribute("name") !== oldId || !!document.querySelector("#candidate-ready-title"), id);
  return { id, type, selectedValues };
}
const scenarios = [
  { name: "prelaunch", expected: "sin índice", answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain", q2_delivery: ["other"], q2_sector: "professional_services", q2_monetization: "services", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_presence_digital_base: "no_reliable_presence" } },
  { name: "información insuficiente", expected: "sin índice", answers: { q2_entity: "business", q2_monetization: "unsure", q2_delivery: ["other"], q2_sector: "other", q2_has_customers: "yes", q2_regularity: "unknown", q2_goal: "unsure", q2_customer_reach: "mixed", q2_customer_buyer: "mixed", q2_friction: "unsure", q2_process_systemization: "unknown", q2_b2b_pipeline: "unknown", q2_discovery_reliable_reach: "unknown", q2_reputation_flow: "unknown" } },
];
async function checkSpecialScenario(scenario) {
  const scenarioContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const scenarioPage = await scenarioContext.newPage();
  await scenarioPage.goto(route, { waitUntil: "networkidle" });
  await scenarioPage.getByRole("button", { name: "Empezar diagnóstico" }).click();
  for (let guard = 0; guard < 40 && !(await scenarioPage.locator("#candidate-ready-title").count()); guard += 1) {
    await chooseAndContinue(scenarioPage, scenario.answers, true);
  }
  assert(await scenarioPage.locator("#candidate-ready-title").count() === 1, `${scenario.name} reaches the candidate planner terminal state`);
  await scenarioPage.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await scenarioPage.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  assert(await scenarioPage.locator(".dr-presence__value--none").count() === 1, `${scenario.name} renders ${scenario.expected} instead of inventing zero`);
  assert(await scenarioPage.locator(".dr-presence__code").count() === 0, `${scenario.name} has no invented MAL/REGULAR/BIEN band`);
  await scenarioContext.close();
}
const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(({ legacyKey, legacyFixture }) => localStorage.setItem(legacyKey, legacyFixture), { legacyKey, legacyFixture });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(route, { waitUntil: "networkidle" });
  assert(await page.getByText("Motor candidato inactivo en producción").count() === 1, "candidate route is clearly marked local-only");
  assert((await page.getByRole("heading", { level: 1 }).count()) === 1, "one accessible start heading renders");
  assert(await page.evaluate((key) => localStorage.getItem(key), candidateKey) === null, "new candidate starts with a separate storage slot");
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  assert(await page.locator(".df-option__input").count() > 1, "the certified candidate planner selects the first question");
  await page.getByRole("button", { name: "Continuar" }).click();
  assert(await page.locator(".df-question__error[role=alert]").count() === 1, "required-answer validation is accessible");
  pass("inicio SSR-safe, storage aislado y validación del formulario");

  let sawMulti = false;
  let multiQuestionId = null;
  let multiValues = [];
  const first = await chooseAndContinue(page);
  if (first.type === "checkbox") { sawMulti = true; multiQuestionId = first.id; multiValues = first.selectedValues; }
  assert(first.type === "radio" || first.type === "checkbox", "single and multiple inputs use native controls");
  const firstSnapshot = await saved(page);
  assert(firstSnapshot.engineIdentity.engine === "diag-v3-candidate-context-observability-v1" && firstSnapshot.questionBankIdentity === "reviewed-evidence-v3", "persisted answers carry candidate engine and bank identity");
  assert(firstSnapshot.revision > 0 && firstSnapshot.answers[first.id] !== undefined, "progress is versioned and saved locally");
  assert(await page.evaluate((key) => localStorage.getItem(key), legacyKey) === legacyFixture, "legacy session bytes remain untouched");
  pass("identidad candidata, persistencia local y aislamiento legacy");

  const beforeReload = await currentId(page);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continuar diagnóstico" }).click();
  assert(await currentId(page) === beforeReload, "reload resumes the same adaptive question");
  pass("recarga y reanudación de sesión");

  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) {
    const chosen = await chooseAndContinue(page, preferred, true);
    if (chosen.type === "checkbox") { sawMulti = true; multiQuestionId = chosen.id; multiValues = chosen.selectedValues; }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "no horizontal overflow at 390px");
  }
  assert(await page.locator("#candidate-ready-title").count() === 1, "candidate planner reached an explicit terminal state");
  pass(`recorrido adaptativo certificado con dos respuestas múltiples reales (${multiQuestionId})`);

  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) await chooseAndContinue(page);
  const terminalReason = (await saved(page)).terminalReason;
  assert(["no_useful_questions", "budget_blocked", "hard_cap"].includes(terminalReason), `terminal reason is preserved: ${terminalReason}`);
  const terminalSnapshot = await saved(page);
  assert(sawMulti && multiQuestionId === "q2_delivery" && multiValues.length === 2, `the browser completes a real two-value multi-select route (${multiQuestionId}: ${multiValues.join(",")}; asked: ${Object.keys(terminalSnapshot.answers).join(",")})`);
  assert(JSON.stringify((await saved(page)).answers[multiQuestionId]) === JSON.stringify(multiValues), "both selected values are saved by the candidate session");
  await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  const firstResult = await page.locator("#candidate-result-title").textContent();
  const completedAt = (await saved(page)).completedAt;
  assert(Number.isFinite(completedAt) && completedAt >= (await saved(page)).startedAt, "completion stores its own timestamp");
  const firstScore = await page.locator(".dr-presence__value").first().textContent();
  const firstPriority = await page.locator(".dr-priority__statement").first().textContent().catch(() => null);
  assert(await page.getByText(/Confianza/i).count() > 0 && await page.getByRole("heading", { name: "Acciones recomendadas por el diagnóstico" }).count() === 1, "candidate result exposes confidence and prioritized recommendations");
  assert((await saved(page)).status === "completed" && !("result" in await saved(page)), "completion stores answers/status but no derived result");
  await page.getByRole("link", { name: "Leer metodología candidata" }).click();
  await page.getByRole("heading", { name: "Cómo funciona el diagnóstico candidato de Vecidya" }).waitFor();
  await assertCandidateMethodologyContracts(page, "candidate methodology");
  await page.getByRole("link", { name: "Regresar a la prueba candidata" }).click();
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  const reportLink = page.getByRole("link", { name: "Abrir informe imprimible" });
  assert(await reportLink.count() === 1, `report link renders on result: ${(await page.locator("body").innerText()).slice(-900)} | storage ${JSON.stringify(await saved(page))}`);
  await reportLink.click();
  await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
  const report = page.locator(".rp");
  const pageCount = Number(await report.getAttribute("data-pages"));
  const density = Number(await report.getAttribute("data-density"));
  const reportText = await report.innerText();
  assert(pageCount >= 1 && pageCount <= 4, `print layout uses ${pageCount} pages (maximum 4)`);
  assert(density >= 8.5, `print layout keeps at least 8.5 pt text (${density} pt)`);
  assert(reportText.includes("Fecha de finalización del diagnóstico") && reportText.includes("Fecha de generación del informe") && reportText.includes("Recomendación para Vecidya"), "candidate report separates completion and generation dates and presents the current commercial section");
  assert(reportText.includes(await page.evaluate((at) => new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(new Date(at)), completedAt)), "report date matches the stored completion timestamp");
  assert(!reportText.includes("hola@vecidya.com") && !reportText.includes("Correo electrónico"), "anonymous candidate report has no legacy lead CTA or contact identity");
  assert(reportText.includes(firstScore.trim()) && (!firstPriority || reportText.includes(firstPriority.trim())), "print report matches the result score and priority");
  assert(await page.getByRole("button", { name: "Imprimir o guardar PDF" }).isEnabled(), "print action is available only after a page-fit layout");
  await page.emulateMedia({ media: "print" });
  const candidatePdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  const candidatePdfSource = candidatePdf.toString("latin1");
  const candidatePdfPages = [...candidatePdfSource.matchAll(/\/Type\s*\/Page\b(?!s)/g)].length;
  assert(candidatePdfPages === pageCount, `generated A4 PDF has ${candidatePdfPages} pages, matching ${pageCount} browser sheets`);
  assert(candidatePdfPages <= 4 && density >= 8.5, "generated PDF respects the four-page and 8.5 pt limits");
  assert(/\/StructTreeRoot\s+\d+ 0 R/.test(candidatePdfSource) && /\/Marked\s+true/.test(candidatePdfSource), "browser PDF carries a tagged structure tree");
  assert(/\/Lang\s*\(es\)/.test(candidatePdfSource), "browser PDF declares Spanish document language");
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("link", { name: /Ver en Carta/ }).click();
  await page.waitForFunction(() => document.querySelector('.rp[data-paper="letter"][data-ready="true"]') !== null);
  const letterPages = Number(await page.locator(".rp").getAttribute("data-pages"));
  const letterDensity = Number(await page.locator(".rp").getAttribute("data-density"));
  assert(letterPages >= 1 && letterPages <= 4 && letterDensity >= 8.5, `Letter report uses ${letterPages} pages at ${letterDensity} pt or larger`);
  await page.getByRole("link", { name: "Volver a la sesión candidata" }).click();
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  assert((await saved(page)).completedAt === completedAt, "reload and result reconstruction preserve the original completion timestamp");
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  assert((await page.locator("#candidate-result-title").textContent()) === firstResult, "result reconstruction is deterministic after completed-session resume");
  assert((await page.locator(".dr-presence__value").first().textContent()) === firstScore, "overall reading matches after reload and rebuild");
  await page.getByRole("button", { name: "Editar respuestas" }).click();
  assert(await page.locator("#candidate-result-title").count() === 0, "editing removes the previous result from the active view");
  assert((await saved(page)).status !== "completed", "editing invalidates the completed result state in the saved session");
  const editId = await currentId(page);
  const editInputs = page.locator(`.df-option__input[name="${editId}"]`);
  const savedEditValue = (await saved(page)).answers[editId];
  const oldEditValues = Array.isArray(savedEditValue) ? savedEditValue : [savedEditValue];
  const visibleEditState = await editInputs.evaluateAll((elements) => elements.map((element) => ({ value: element.value, checked: element.checked, selected: element.parentElement.classList.contains("is-selected") })));
  const selectedCount = visibleEditState.filter((item) => item.checked).length;
  assert(selectedCount === oldEditValues.length, `editing displays the saved answer before change (${editId}: ${JSON.stringify(savedEditValue)}, checked ${selectedCount}; review ${await page.locator(".df-question__review").count()}; inputs ${JSON.stringify(visibleEditState)})`);
  const editValues = await editInputs.evaluateAll((elements) => elements.map((element) => element.value));
  const replacement = editValues.find((value) => !oldEditValues.includes(value));
  assert(replacement, `${editId} offers an alternate answer for an invalidation check`);
  await page.locator(`.df-option__input[name="${editId}"][value="${replacement}"]`).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) await chooseAndContinue(page);
  assert(await page.locator("#candidate-ready-title").count() === 1, "edited answers replan to a fresh terminal state");
  await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
  assert(errors.length === 0, `no browser exceptions: ${errors.join(" | ")}`);
  pass(`candidate result rebuilt deterministically (${terminalReason}); PDF A4 ${candidatePdfPages} page(s) at ${density} pt, Carta ${letterPages} page(s) at ${letterDensity} pt`);
  await context.close();

  for (const scenario of scenarios) {
    await checkSpecialScenario(scenario);
    pass(`resultado de navegador para caso ${scenario.name}`);
  }

  // A second tab advances the same key. The original tab must stop instead of overwriting that session.
  const raceContext = await browser.newContext();
  const firstTab = await raceContext.newPage();
  await firstTab.goto(route, { waitUntil: "networkidle" });
  await firstTab.evaluate((key) => localStorage.removeItem(key), candidateKey);
  await firstTab.reload({ waitUntil: "networkidle" });
  await firstTab.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await chooseAndContinue(firstTab);
  const secondTab = await raceContext.newPage();
  await secondTab.goto(route, { waitUntil: "networkidle" });
  await secondTab.getByRole("button", { name: "Continuar diagnóstico" }).click();
  await secondTab.getByRole("button", { name: "Continuar" }).click();
  await firstTab.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
  pass("doble pestaña entra en pausa ante revisión concurrente");
  await raceContext.close();
} finally { await browser.close(); }
console.log(`diagnostic-v3-candidate-flow-check: ${passed}/8 PASS`);
if (passed !== 8) process.exit(1);
