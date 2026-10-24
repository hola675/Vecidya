import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const browser = await chromium.launch(executablePath ? { executablePath } : {});

try {
  const page = await browser.newPage();
  for (const width of [1366, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
    const layout = await page.locator(".services-core-grid--bento").evaluate((grid) => {
      const cards = [...grid.querySelectorAll(":scope > .services-core-card")];
      return {
        count: cards.length,
        spans: cards.map((card) => getComputedStyle(card).gridColumnStart),
        widths: cards.map((card) => card.getBoundingClientRect().width),
      };
    });
    assert(layout.count === 7, `${width}px: deben mostrarse las siete familias de servicios.`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px: el catálogo tiene overflow horizontal.`);

    if (width <= 820) {
      assert(layout.spans.every((span) => span === "auto" || span === "span 1"), `${width}px: las tarjetas no deben forzar columnas implícitas: ${layout.spans}`);
      assert(Math.max(...layout.widths) - Math.min(...layout.widths) < 1, `${width}px: las tarjetas deben tener ancho uniforme: ${layout.widths}`);
    } else {
      assert(layout.spans.join(",") === "span 3,span 3,span 2,span 2,span 2,span 3,span 3", `1366px: debe conservarse la retícula bento de escritorio: ${layout.spans}`);
    }
  }
  console.log("PASS: retícula de Servicios conserva siete tarjetas bento en escritorio y grilla uniforme en 768/390 px.");
} finally {
  await browser.close();
}
