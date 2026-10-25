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
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => issues.push({ viewport: "all", issue: "pageerror", detail: error.message }));
  await page.goto(new URL("/diagnostico", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("vecidya.diagnostic.v3.candidate.session.8"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
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
  await page.getByRole("button", { name: "Ver mi resumen" }).click();
  await page.getByRole("heading", { name: "Tu resumen del diagnóstico" }).waitFor();
  for (const width of [320, 375, 390, 768, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
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
