import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { createCandidateSessionV3, currentCandidateQuestionIdV3, submitCandidateAnswerV3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as bank } from "../../app/features/diagnostic/qbv2-reviewed-evidence.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const route = new URL("/__dev/diagnostico/candidate", baseUrl).toString();
const reportRoute = new URL("/__dev/diagnostico/candidate/informe", baseUrl).toString();
const key = "vecidya.diagnostic.v3.candidate.session.2";
const preferred = { q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable", q2_goal: "explain", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_process_systemization: "defined", q2_local_presence_consistency: "partial", q2_ecommerce_product_discovery: "confusing", q2_retail_product_visibility: "partial", q2_ecommerce_traffic_sources: ["search"], q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" };
let passed = 0;
const pass = (label) => { passed += 1; console.log(`PASS ${label}`); };
const saved = (page) => page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? "null"), key);
async function gotoReady(page, url = route) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  if (url === reportRoute) {
    await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
    return;
  }
  await page.waitForFunction(() => {
    const root = document.getElementById("contenido");
    return root && Object.keys(root).some((property) => property.startsWith("__reactFiber$"));
  });
}
async function start(page) {
  await gotoReady(page);
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.locator(".df-option__input").first().waitFor();
}
async function answerCurrent(page, answerBag = preferred) {
  const input = page.locator(".df-option__input").first();
  await input.waitFor();
  const id = await input.getAttribute("name");
  const type = await input.getAttribute("type");
  const wanted = answerBag[id];
  const values = Array.isArray(wanted) ? wanted : wanted ? [wanted] : [];
  if (type === "checkbox" && values.length) {
    for (const value of values) {
      const checkbox = page.locator(`.df-option__input[name="${id}"][value="${value}"]`);
      if (await checkbox.count()) await checkbox.click();
    }
  } else {
    const choice = values.length ? page.locator(`.df-option__input[name="${id}"][value="${values[0]}"]`) : input;
    if (await choice.count()) await choice.first().click(); else await input.click();
  }
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((oldId) => document.querySelector(".df-option__input")?.getAttribute("name") !== oldId || !!document.querySelector("#candidate-ready-title"), id);
}
async function pageWaitForAnswerOrTerminal(page) {
  await page.waitForFunction(() => !!document.querySelector(".df-option__input") || !!document.querySelector("#candidate-ready-title"));
}
async function finish(page) {
  for (let guard = 0; guard < 40 && !(await page.locator("#candidate-ready-title").count()); guard += 1) await answerCurrent(page);
  assert.equal(await page.locator("#candidate-ready-title").count(), 1, "candidate route reaches a terminal state");
  await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
  await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
}
async function newContext() { return browser.newContext({ viewport: { width: 1280, height: 900 } }); }

try {
  // Two actual tabs submit the same revision concurrently through the browser's shared Web Locks manager.
  {
    const context = await newContext();
    const first = await context.newPage();
    const second = await context.newPage();
    await gotoReady(first);
    await gotoReady(second);
    const module = await import("../../app/features/diagnostic/qbv2-candidate-session.ts");
    const now = Date.now();
    const initial = module.createCandidateSessionV3({ sessionId: `act031-race-${now}`, writerId: "tab-seed", now });
    const seed = await first.evaluate(async ({ session }) => {
      const { CandidateSessionStoreV3 } = await import("/app/features/diagnostic/qbv2-candidate-session.ts");
      return new CandidateSessionStoreV3().write(session);
    }, { session: initial });
    assert.equal(seed, "written");
    const questionId = currentCandidateQuestionIdV3(initial);
    const question = bank.find((item) => item.id === questionId);
    assert.ok(question && question.options.length > 1);
    const answers = question.type === "multi"
      ? [[question.options[0].value], [question.options.at(-1).value]]
      : [question.options[0].value, question.options.at(-1).value];
    const writes = answers.map((answer, index) => {
      const submitted = submitCandidateAnswerV3(initial, questionId, answer, `tab-${index}`, now + index + 1);
      assert.equal(submitted.ok, true);
      return submitted.session;
    });
    const outcomes = await Promise.all([first, second].map((page, index) => page.evaluate(async ({ session }) => {
      const { CandidateSessionStoreV3 } = await import("/app/features/diagnostic/qbv2-candidate-session.ts");
      return new CandidateSessionStoreV3().write(session);
    }, { session: writes[index] })));
    assert.deepEqual(outcomes.sort(), ["conflict", "written"]);
    const persisted = await saved(first);
    assert.equal(persisted.revision, 1);
    assert.ok(answers.some((answer) => JSON.stringify(persisted.answers[questionId]) === JSON.stringify(answer)));
    pass("dos pestañas escriben desde la misma revisión: un commit y un conflicto visible, sin sobrescritura silenciosa");
    await context.close();
  }

  // Resuming in another tab claims a new revision; the previous writer pauses and reload recovers the latest snapshot.
  {
    const context = await newContext();
    const first = await context.newPage();
    await start(first);
    await answerCurrent(first);
    const before = await saved(first);
    const second = await context.newPage();
    await gotoReady(second);
    await second.getByRole("button", { name: "Continuar diagnóstico" }).click();
    await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
    assert.equal((await saved(second)).revision, before.revision + 1);
    await answerCurrent(second);
    assert.ok(Object.keys((await saved(second)).answers).length > Object.keys(before.answers).length);
    pass("reanudación cruzada cambia el propietario y rechaza una respuesta basada en revisión vieja");
    await context.close();
  }

  // Reloading the stale tab reconstructs the cross-tab winner without changing its answers.
  {
    const context = await newContext();
    const first = await context.newPage();
    await start(first);
    await answerCurrent(first);
    const before = await saved(first);
    const second = await context.newPage();
    await gotoReady(second);
    await second.getByRole("button", { name: "Continuar diagnóstico" }).click();
    await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
    await first.getByRole("button", { name: "Recargar sesión" }).click();
    await first.getByRole("button", { name: "Continuar diagnóstico" }).waitFor();
    assert.deepEqual((await saved(first)).answers, before.answers);
    const revisionBeforeClaim = (await saved(first)).revision;
    await first.getByRole("button", { name: "Continuar diagnóstico" }).click();
    await pageWaitForAnswerOrTerminal(first);
    assert.ok((await saved(first)).revision > revisionBeforeClaim);
    pass("tras conflicto, recargar reconstruye una sesión válida y permite continuar desde la revisión guardada");
    await context.close();
  }

  // A completed result is invalidated before the new owner enters review mode.
  {
    const context = await newContext();
    const first = await context.newPage();
    await start(first);
    await finish(first);
    const completedAt = (await saved(first)).completedAt;
    const second = await context.newPage();
    await gotoReady(second);
    await second.getByRole("button", { name: "Ver mi resultado" }).click();
    await second.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
    assert.equal((await saved(second)).completedAt, completedAt, "result reconstruction preserves completion time");
    await second.getByRole("button", { name: "Editar respuestas" }).click();
    const edited = await saved(second);
    assert.equal(edited.status, "in_progress");
    assert.equal(edited.completedAt, null);
    await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
    pass("la edición cruzada invalida fecha/resultado previo y oculta el resultado obsoleto");
    await context.close();
  }

  // Reset is propagated as a storage event and an old tab cannot recreate a progressed session.
  {
    const context = await newContext();
    const first = await context.newPage();
    await start(first);
    await answerCurrent(first);
    const second = await context.newPage();
    await gotoReady(second);
    await second.getByRole("button", { name: "Empezar de nuevo" }).click();
    await second.getByRole("button", { name: "Sí, empezar de nuevo" }).click();
    await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
    assert.equal(await saved(first), null);
    await first.getByRole("button", { name: "Recargar sesión" }).click();
    await first.getByRole("button", { name: "Empezar diagnóstico" }).waitFor();
    assert.equal(await saved(first), null);
    pass("reset en una pestaña pausa la otra; recarga inicia vacío sin restaurar respuestas borradas");
    await context.close();
  }

  // Rapid successive answers retain unique route IDs and monotonic revisions.
  {
    const context = await newContext();
    const page = await context.newPage();
    await start(page);
    let lastRevision = (await saved(page)).revision;
    for (let index = 0; index < 6; index += 1) {
      if (await page.locator("#candidate-ready-title").count()) break;
      await answerCurrent(page);
      await page.waitForFunction(({ storageKey, oldRevision }) => {
        const raw = localStorage.getItem(storageKey);
        return !!raw && JSON.parse(raw).revision > oldRevision;
      }, { storageKey: key, oldRevision: lastRevision });
      const snapshot = await saved(page);
      assert.ok(snapshot.revision > lastRevision, "every successive answer advances the revision");
      assert.equal(new Set(snapshot.answeredQuestionIds).size, snapshot.answeredQuestionIds.length);
      assert.equal(snapshot.answeredQuestionIds.length, Object.keys(snapshot.answers).length);
      lastRevision = snapshot.revision;
    }
    assert.ok(lastRevision >= 6);
    pass("respuestas rápidas conservan revisiones crecientes y una cola/answer set coherentes");
    await context.close();
  }

  // A deliberately delayed Web Lock keeps the UI in an explicit pending-save state and blocks accidental reload.
  {
    const context = await newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      const original = navigator.locks.request.bind(navigator.locks);
      Object.defineProperty(navigator, "locks", { configurable: true, value: { request: async (...args) => {
        if (!window.__releaseCandidateWrite) await new Promise((resolve) => { window.__releaseCandidateWrite = resolve; });
        return original(...args);
      } } });
    });
    await gotoReady(page);
    await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
    await page.getByRole("heading", { name: "Guardando tu progreso…" }).waitFor();
    assert.equal(await page.locator(".df-option__input").count(), 0, "the next question is hidden before persistence is confirmed");
    assert.equal(await saved(page), null, "the session is not reported as stored while the lock is delayed");
    await page.evaluate(() => window.__releaseCandidateWrite?.());
    await page.locator(".df-option__input").first().waitFor();
    assert.equal((await saved(page)).revision, 0);
    pass("escritura retrasada mantiene estado pendiente y no muestra preguntas ni progreso sin confirmar");
    await context.close();
  }

  // An already-open report is invalidated as soon as another tab changes the completed snapshot.
  {
    const context = await newContext();
    const report = await context.newPage();
    await start(report);
    await finish(report);
    await gotoReady(report, reportRoute);
    await report.getByRole("button", { name: "Imprimir o guardar PDF" }).waitFor();
    const editor = await context.newPage();
    await gotoReady(editor);
    await editor.getByRole("button", { name: "Ver mi resultado" }).click();
    await editor.getByRole("button", { name: "Editar respuestas" }).click();
    await report.getByRole("alert").getByText(/sesión cambió en otra pestaña/).waitFor();
    assert.equal(await report.getByRole("button", { name: "Imprimir o guardar PDF" }).count(), 0, "a stale snapshot cannot be printed");
    pass("el informe ya abierto invalida impresión cuando otra pestaña modifica la sesión completada");
    await context.close();
  }
} finally { await browser.close(); }

console.log(`diagnostic-v3-candidate-session-hardening-check: ${passed}/8 PASS`);
if (passed !== 8) process.exit(1);
