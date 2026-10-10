import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { completeCandidateSessionV3, createCandidateSessionV3, CANDIDATE_SESSION_TTL_MS_V3 } from "../../app/features/diagnostic/qbv2-candidate-session.ts";
import { buildCandidateQuestionPlanV3 } from "../../app/features/diagnostic/qbv2-candidate-planner.ts";
import { CANONICAL_CASES_V3 } from "../unit/diagnostic/qbv2-candidate-canonical-cases.ts";
import { runCanonicalRouteV3 } from "../unit/diagnostic/qbv2-candidate-case-runner.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const key = "vecidya.diagnostic.v3.candidate.session.2";
const reportUrl = new URL("/__dev/diagnostico/candidate/informe", baseUrl).toString();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});

function completedSnapshot(id, now = Date.now()) {
  const route = runCanonicalRouteV3(CANONICAL_CASES_V3.find((item) => item.id === id));
  const created = createCandidateSessionV3({ sessionId: `act034b-race-${id}-${now}`, writerId: "pdf-race-check", now: now - 180_000 });
  const plan = buildCandidateQuestionPlanV3({ answers: route.finalAnswers });
  const terminalReason = plan.completion.hardCapReached ? "hard_cap" : plan.evidenceSufficiency.terminalReason === "budget_blocked" ? "budget_blocked" : "no_useful_questions";
  const pending = { ...created, answers: route.finalAnswers, answeredQuestionIds: route.asked.map((turn) => turn.id), queue: [], reviewIndex: null, status: "completing", terminalReason, revision: route.asked.length, updatedAt: created.startedAt + route.asked.length };
  const completed = completeCandidateSessionV3(pending, "pdf-race-check", pending.updatedAt + 1);
  assert.ok(completed);
  return completed.session;
}

async function waitReady(page) {
  await page.goto(reportUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector('.rp[data-ready="true"]') !== null);
  await page.getByRole("button", { name: "Descargar informe PDF" }).waitFor();
}

try {
  // Cross-tab change while the same-origin font requests are deliberately held.
  {
    const session = completedSnapshot("C01");
    const context = await browser.newContext({ acceptDownloads: true });
    await context.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key, raw: JSON.stringify(session) });
    const page = await context.newPage();
    let releaseFonts;
    let sawFontRequest;
    const fontsReady = new Promise((resolve) => { sawFontRequest = resolve; });
    const gate = new Promise((resolve) => { releaseFonts = resolve; });
    await page.route("**/*.woff*", async (route) => { sawFontRequest(); await gate; await route.continue().catch(() => {}); });
    let downloads = 0;
    page.on("download", () => { downloads += 1; });
    await waitReady(page);
    const click = page.getByRole("button", { name: "Descargar informe PDF" }).click();
    await fontsReady;
    const secondTab = await context.newPage();
    await waitReady(secondTab);
    await secondTab.evaluate((storageKey) => {
      const current = JSON.parse(localStorage.getItem(storageKey));
      current.revision += 1;
      current.writerId = "second-tab";
      localStorage.setItem(storageKey, JSON.stringify(current));
    }, key);
    await page.getByRole("alert").filter({ hasText: "La sesión cambió o se borró" }).waitFor();
    releaseFonts();
    await click;
    assert.equal(downloads, 0, "a PDF for a changed cross-tab session is discarded");
    await context.close();
  }

  // The session is valid when the report opens and expires while fonts load.
  {
    const fixedNow = Date.now();
    const initial = completedSnapshot("C06", fixedNow);
    const expiresSoon = fixedNow - CANDIDATE_SESSION_TTL_MS_V3 + 5_000;
    const session = { ...initial, startedAt: expiresSoon - 86_400_000, updatedAt: expiresSoon, completedAt: expiresSoon };
    const context = await browser.newContext({ acceptDownloads: true });
    await context.addInitScript(({ key, raw, fixedNow }) => {
      localStorage.setItem(key, raw);
      window.__act034bNow = fixedNow;
      Date.now = () => window.__act034bNow;
    }, { key, raw: JSON.stringify(session), fixedNow });
    const page = await context.newPage();
    let releaseFonts;
    let sawFontRequest;
    const fontsReady = new Promise((resolve) => { sawFontRequest = resolve; });
    const gate = new Promise((resolve) => { releaseFonts = resolve; });
    await page.route("**/*.woff*", async (route) => { sawFontRequest(); await gate; await route.continue().catch(() => {}); });
    let downloads = 0;
    page.on("download", () => { downloads += 1; });
    await waitReady(page);
    const click = page.getByRole("button", { name: "Descargar informe PDF" }).click();
    await fontsReady;
    await page.evaluate(() => { window.__act034bNow += 10_000; });
    releaseFonts();
    await click;
    await page.getByRole("alert").filter({ hasText: "La sesión caducó durante la generación" }).waitFor();
    assert.equal(downloads, 0, "a PDF for a session that expires during generation is discarded");
    await context.close();
  }

  // Consecutive exports release each object URL after the browser accepts the download.
  {
    const session = completedSnapshot("C24");
    const context = await browser.newContext({ acceptDownloads: true });
    await context.addInitScript(({ key, raw }) => {
      localStorage.setItem(key, raw);
      window.__act034bUrls = { created: [], revoked: [] };
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (blob) => { const url = create(blob); window.__act034bUrls.created.push(url); return url; };
      URL.revokeObjectURL = (url) => { window.__act034bUrls.revoked.push(url); return revoke(url); };
    }, { key, raw: JSON.stringify(session) });
    const page = await context.newPage();
    await waitReady(page);
    for (let index = 0; index < 2; index += 1) {
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "Descargar informe PDF" }).click();
      await download;
      await page.locator(".rp-export-status").filter({ hasText: "Descarga iniciada" }).waitFor();
      await page.waitForTimeout(1_100);
    }
    const objectUrls = await page.evaluate(() => window.__act034bUrls);
    assert.equal(objectUrls.created.length, 2, "two consecutive exports each create one local object URL");
    assert.deepEqual(objectUrls.revoked, objectUrls.created, "each object URL is revoked after the download starts");
    await context.close();
  }
} finally {
  await browser.close();
}

console.log("diagnostic-v3-act034b-session-race-check: modification/expiration discard output; consecutive exports revoke their object URLs.");
