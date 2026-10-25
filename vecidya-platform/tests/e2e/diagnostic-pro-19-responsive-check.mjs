import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const output = join(process.cwd(), "test-results", "diag-pro-19");
mkdirSync(output, { recursive: true });
const issues = [];
const samples = [];
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => issues.push({ viewport: "all", issue: "pageerror", detail: error.message }));
  page.on("console", message => { if (message.type() === "error") issues.push({ viewport: "all", issue: "console", detail: message.text() }); });
  // Start with isolated storage so startup cannot observe a previously completed QA-03B run.
  await page.goto(new URL("/diagnostico", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await page.locator("#df-start-title").waitFor();
  // A fresh browser context has no cookie preference; choose necessary-only before starting.
  await page.getByRole("button", { name: "Rechazar opcionales", exact: true }).click();
  await page.screenshot({ path: join(output, "welcome-1366.png"), fullPage: true });
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.locator(".df-option__input").first().waitFor();
  await page.screenshot({ path: join(output, "question-1366.png"), fullPage: true });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const validationError = page.locator(".df-question__error[role=alert]");
  await validationError.waitFor();
  assert.equal((await validationError.innerText()).trim(), "Elige al menos una opción para continuar.");
  await page.screenshot({ path: join(output, "question-error-1366.png"), fullPage: true });
  await page.keyboard.press("Tab");
  const skipLinkFocused = await page.evaluate(() => document.activeElement?.classList.contains("skip-link"));
  if (skipLinkFocused) await page.keyboard.press("Tab");
  await page.locator(".df-option__input").first().focus();
  assert.equal(await page.locator(".df-option:has(.df-option__input:focus-visible)").count(), 1, "keyboard focus is visible on a question option");
  await page.keyboard.press("Space");
  assert.equal(await page.locator(".df-option__input:checked").count(), 1, "Space selects the focused native option");
  const focusStyle = await page.locator(".df-option:has(.df-option__input:focus-visible)").evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, width: getComputedStyle(element).outlineWidth }));
  assert.notEqual(focusStyle.outline, "none");
  assert.ok(Number.parseFloat(focusStyle.width) >= 3);
  await page.screenshot({ path: join(output, "question-selected-1366.png"), fullPage: true });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.locator(".df-option__input").first().waitFor();
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  assert.equal(await page.locator(".df-option__input:checked").count(), 1, "back navigation preserves the selected answer");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  for (let turn = 0; turn < 30; turn++) {
    if (await page.locator(".df-ready").count()) break;
    const option = page.locator(".df-option__input").first();
    await option.waitFor();
    const questionId = await option.getAttribute("name");
    await option.click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.waitForFunction(previous => document.querySelector(".df-ready") || document.querySelector(".df-option__input")?.getAttribute("name") !== previous, questionId);
  }
  assert.equal(await page.locator(".df-ready").count(), 1, "diagnostic did not finish");
  await page.screenshot({ path: join(output, "ready-1366.png"), fullPage: true });
  await page.getByRole("button", { name: "Ver mi resumen" }).click();
  await page.getByRole("heading", { name: "Tu resumen del diagnóstico" }).waitFor();
  await page.screenshot({ path: join(output, "summary-1366-initial.png"), fullPage: true });
  const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < contentHeight; y += 700) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(75);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".dr-candidate-actions").evaluate(element => getComputedStyle(element).display), "none", "summary actions are omitted from print");
  await page.screenshot({ path: join(output, "summary-print-1366.png"), fullPage: true });
  const printAudit = await page.evaluate(() => ({ score: document.querySelector(".dr-presence__value")?.textContent, areas: document.querySelectorAll(".dr-area-overview__item").length, synthesisDisplay: getComputedStyle(document.querySelector(".dr-candidate-synthesis")).display, areaWidth: Math.round(document.querySelector(".dr-area-overview").getBoundingClientRect().width), columns: getComputedStyle(document.querySelector(".dr-area-overview__list")).gridTemplateColumns }));
  assert.equal(printAudit.areas, 8);
  assert.equal(printAudit.synthesisDisplay, "flex", "print summary uses a readable vertical flow");
  assert.ok(printAudit.areaWidth >= 400, `print area cards retain readable width (${JSON.stringify(printAudit)})`);
  assert.match(printAudit.score ?? "", /%|Lectura/);
  await page.emulateMedia({ media: "screen" });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  await page.evaluate(async () => Promise.all([...document.images].map((image) => image.decode().catch(() => {}))));
  for (const width of [320, 375, 390, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 320) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
      const zoomAudit = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, visualScale: window.visualViewport?.scale }));
      await page.screenshot({ path: join(output, "summary-zoom-200.png"), fullPage: true });
      if (zoomAudit.scrollWidth > zoomAudit.clientWidth + 1) issues.push({ viewport: "zoom 200%", issue: "overflow", detail: zoomAudit });
      await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
      await cdp.detach();
    }
    await page.screenshot({ path: join(output, `summary-${width}.png`), fullPage: true });
    const audit = await page.evaluate(() => {
      const root = document.documentElement;
      const viewportWidth = root.clientWidth;
      const badElements = [...document.querySelectorAll("main *")].filter(el => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && style.position !== "fixed" && rect.right > viewportWidth + 2 && style.visibility !== "hidden";
      }).slice(0, 12).map(el => ({ tag: el.tagName, className: String(el.className).slice(0, 80), right: Math.round(el.getBoundingClientRect().right) }));
      const buttons = [...document.querySelectorAll(".dr-candidate-actions button, .dr-candidate-actions a")].map(el => ({
        text: el.textContent?.trim(), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height),
      }));
      return { scrollWidth: root.scrollWidth, viewportWidth, badElements, buttons, headings: [...document.querySelectorAll("main h1, main h2, main h3")].map(el => ({ level: el.tagName, text: el.textContent?.trim() })) };
    });
    samples.push({ width, ...audit });
    if (audit.scrollWidth > audit.viewportWidth + 1) issues.push({ viewport: width, issue: "horizontal overflow", detail: audit });
    if (audit.badElements.length) issues.push({ viewport: width, issue: "elements outside viewport", detail: audit.badElements });
    if (!audit.headings.some(h => h.level === "H1")) issues.push({ viewport: width, issue: "missing H1" });
    if (audit.buttons.some(b => b.width < 44 || b.height < 36)) issues.push({ viewport: width, issue: "small action target", detail: audit.buttons });
  }
  console.log("DIAG_PRO_19_RESPONSIVE_AUDIT=" + JSON.stringify({ output, samples, issues, note: "Screenshots require human visual review; only anonymous summary and one synthetic answer path tested." }));
  assert.deepEqual(issues, []);
} finally {
  await browser.close();
}
