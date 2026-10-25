import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:5181";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baseUrl)) throw new Error(`Capturas locales solamente; URL rechazada: ${baseUrl}`);
const routes = (process.env.VISUAL_QA_ROUTES ?? "/,/privacidad,/terminos").split(",").map((route) => route.trim()).filter(Boolean);
const widths = (process.env.VISUAL_QA_WIDTHS ?? "390,1366").split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value >= 320 && value <= 2400);
const outputDirectory = process.env.VISUAL_OUTPUT_DIRECTORY ?? ".playwright-mcp/visual-qa/before";
mkdirSync(outputDirectory, { recursive: true });
const health = await fetch(new URL("/api/auth/ok", baseUrl)).catch(() => null);
if (!health?.ok) throw new Error(`El Worker local no está disponible en ${baseUrl}`);
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
const page = await browser.newPage({ deviceScaleFactor: 1, locale: "es-CO", timezoneId: "America/Bogota" });
await page.emulateMedia({ reducedMotion: "reduce" });
const captures = [];
try {
  for (const route of routes) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 960 });
      const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(150);
      await Promise.race([page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
        window.scrollTo(0, 0);
      }), page.waitForTimeout(3000)]);
      const layout = await page.evaluate(() => ({ title: document.title, heading: document.querySelector("h1")?.textContent?.trim() ?? null, documentWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth }));
      const file = `${route.replace(/^\//, "root").replaceAll("/", "-")}-${width}.png`;
      await page.screenshot({ path: join(outputDirectory, file), fullPage: true });
      captures.push({ route, width, status: response?.status() ?? null, screenshot: file, ...layout });
    }
  }
  writeFileSync(join(outputDirectory, "public-manifest.json"), `${JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl, captures }, null, 2)}\n`);
  console.log(JSON.stringify({ captures: captures.length, failures: captures.filter(({ status }) => !status || status >= 400), overflow: captures.filter(({ horizontalOverflow }) => horizontalOverflow) }, null, 2));
  if (process.env.VISUAL_QA_ASSERT_NO_OVERFLOW === "1" && captures.some(({ horizontalOverflow }) => horizontalOverflow)) throw new Error("La captura pública encontró overflow horizontal.");
} finally {
  await browser.close();
}
