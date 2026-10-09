import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const route = new URL("/__dev/diagnostico/candidate", baseUrl).toString();
const candidateKey = "vecidya.diagnostic.v3.candidate.session.1";
const legacyKey = "vecidya.diagnostic.v3.session.2";
const legacyFixture = "legacy-session-must-remain-byte-for-byte";
const preferred = { q2_customer_buyer: "b2c", q2_entity: "business", q2_monetization: "goods", q2_delivery: "online_checkout", q2_sector: "retail", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable" };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let passed = 0;
const pass = (message) => { passed += 1; console.log(`PASS ${message}`); };
const currentId = (page) => page.locator(".df-option__input").first().getAttribute("name");
const saved = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), candidateKey);
async function chooseAndContinue(page) {
  const id = await currentId(page);
  const inputs = page.locator(`.df-option__input[name="${id}"]`);
  const type = await inputs.first().getAttribute("type");
  const desired = preferred[id];
  const desiredInput = desired ? page.locator(`.df-option__input[name="${id}"][value="${desired}"]`) : null;
  if (desiredInput && await desiredInput.count()) await desiredInput.click(); else await inputs.first().click();
  if (type === "checkbox") assert((await page.locator(`.df-option__input[name="${id}"]:checked`).count()) === 1, `${id} accepts a multiple-choice answer`);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((oldId) => document.querySelector(".df-option__input")?.getAttribute("name") !== oldId || !!document.querySelector("#candidate-ready-title"), id);
  return { id, type };
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

  const first = await chooseAndContinue(page);
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

  await chooseAndContinue(page);
  await chooseAndContinue(page);
  const beforeEdit = await saved(page);
  await page.getByRole("button", { name: "Volver" }).click();
  const editedId = await currentId(page);
  const options = page.locator(`.df-option__input[name="${editedId}"]`);
  await page.waitForFunction((id) => document.querySelector(`.df-option__input[name="${id}"]:checked`) !== null, editedId);
  const oldValues = await options.locator(":checked").evaluateAll((elements) => elements.map((element) => element.value));
  const candidateValues = await options.evaluateAll((elements) => elements.map((element) => element.value));
  const nextValue = candidateValues.find((value) => !oldValues.includes(value));
  if (nextValue) await page.locator(`.df-option__input[name="${editedId}"][value="${nextValue}"]`).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  assert((await saved(page)).revision > beforeEdit.revision, "editing a prior answer commits a new version and replans through R5");

  let sawMulti = false;
  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) {
    const chosen = await chooseAndContinue(page);
    if (chosen.type === "checkbox") sawMulti = true;
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "no horizontal overflow at 390px");
  }
  assert(await page.locator("#candidate-ready-title").count() === 1, "candidate planner reached an explicit terminal state");
  pass(`avance dinámico, retroceso y edición con replanificación${sawMulti ? " y pregunta múltiple" : ""}`);

  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) await chooseAndContinue(page);
  const terminalReason = (await saved(page)).terminalReason;
  assert(["no_useful_questions", "budget_blocked", "hard_cap"].includes(terminalReason), `terminal reason is preserved: ${terminalReason}`);
  await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await page.getByRole("heading", { name: "La fachada candidata produjo un resultado válido" }).waitFor();
  const firstResult = await page.locator("#candidate-result-title").textContent();
  assert((await saved(page)).status === "completed" && !("result" in await saved(page)), "completion stores answers/status but no derived result");
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "La fachada candidata produjo un resultado válido" }).waitFor();
  assert((await page.locator("#candidate-result-title").textContent()) === firstResult, "result reconstruction is deterministic after completed-session resume");
  assert(errors.length === 0, `no browser exceptions: ${errors.join(" | ")}`);
  pass(`candidate result rebuilt deterministically (${terminalReason})`);
  await context.close();

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
console.log(`diagnostic-v3-candidate-flow-check: ${passed}/6 PASS`);
if (passed !== 6) process.exit(1);
