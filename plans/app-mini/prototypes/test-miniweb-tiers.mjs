/**
 * Prueba focal del prototipo MiniWeb V2.
 * Requiere Playwright instalado en el entorno que ejecuta este archivo.
 * Ejecutar desde el directorio del prototipo:
 *   node test-miniweb-tiers.mjs\n *   CHROMIUM_PATH=/usr/bin/chromium node test-miniweb-tiers.mjs
 * Usa el HTML local real; no hay red, deploy, cambios en CI ni dependencias nuevas.
 */
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const directory = dirname(fileURLToPath(import.meta.url));
const file = join(directory, "miniweb-tiers-comparison.html");
const output = join(directory, "screenshots");
const sizes = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const tiers = ["base", "pro", "premium"];
let browser;
let failures = 0;
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: process.env.CHROMIUM_PATH ? ["--no-sandbox"] : [] });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(file).href);
  const baseline = await page.locator("#preview").innerText();
  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    for (const tier of tiers) {
      await page.locator(`[data-select="${tier}"]`).click();
      const result = await page.evaluate(() => {
        const demo = document.querySelector("#preview");
        const selected = [...document.querySelectorAll("[data-select]")].filter((b) => b.getAttribute("aria-pressed") === "true");
        const cta = document.querySelector(".cta").getBoundingClientRect();
        return {
          tier: demo.dataset.tier,
          selected: selected.map((b) => b.dataset.select),
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          ctaVisible: cta.width > 0 && cta.height > 0,
          services: demo.querySelectorAll(".service").length,
          faqs: demo.querySelectorAll(".faq-item").length,
          photos: demo.querySelectorAll(".photo").length,
        };
      });
      const contentUnchanged = (await page.locator("#preview").innerText()) === baseline;
      const passed = result.tier === tier &&
        result.selected.length === 1 && result.selected[0] === tier &&
        !result.overflow && result.ctaVisible && contentUnchanged &&
        result.services === 4 && result.faqs === 4 && result.photos === 6;
      const name = `${size.name}-${tier}`;
      await page.screenshot({ path: join(output, `${name}.png`), fullPage: true });
      console.log(`${passed ? "PASS" : "FAIL"} ${name}: ${JSON.stringify({ ...result, contentUnchanged })}`);
      if (!passed) failures++;
    }
  }
  if (errors.length) {
    failures += errors.length;
    console.error("Errores JavaScript:", errors);
  }
} catch (error) {
  failures++;
  console.error("ERROR:", error);
} finally {
  if (browser) await browser.close();
}
process.exitCode = failures ? 1 : 0;
