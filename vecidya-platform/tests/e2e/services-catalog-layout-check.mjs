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
  for (const width of [1366, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
    const layout = await page.locator(".services-offers").evaluate((list) => {
      const offers = [...list.querySelectorAll(":scope > .services-offer")];
      return {
        count: offers.length,
        widths: offers.map((offer) => offer.getBoundingClientRect().width),
        ids: offers.map((offer) => offer.id),
        titles: offers.map((offer) => offer.querySelector("h3")?.textContent?.trim()),
        actionLinks: offers.map((offer) => [...offer.querySelectorAll("a")].map((link) => link.getAttribute("href"))),
        shortcutTargets: [...document.querySelectorAll(".services-need")].map((link) => link.getAttribute("href")?.slice(1)),
      };
    });
    assert(layout.count === 7, `${width}px: deben mostrarse las siete familias de servicios.`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px: el catálogo tiene overflow horizontal.`);
    assert(Math.max(...layout.widths) - Math.min(...layout.widths) < 1, `${width}px: las ofertas deben compartir el ancho del listado: ${layout.widths}`);
    assert(layout.titles.every(Boolean), `${width}px: todas las ofertas deben conservar su título.`);
    assert(layout.shortcutTargets.length === 7 && layout.shortcutTargets.every((target) => layout.ids.includes(target)), `${width}px: cada atajo debe llegar a su familia.`);
    assert(layout.actionLinks.every((links) => links.length === 2 && links[0]?.startsWith("/servicios/") && links[1]?.startsWith("/contacto?interes=servicio-")), `${width}px: deben conservarse los destinos de alcance y consulta.`);
  }
  console.log("PASS: listado editorial de Servicios conserva las siete ofertas, ambos CTA reales y cero overflow en 1366/1024/768/390/320 px.");
} finally {
  await browser.close();
}
