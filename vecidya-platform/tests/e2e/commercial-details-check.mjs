import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const assert = (value, message) => { if (!value) throw new Error(message); };
const group = [
  { path: "/licencias", slugs: ["cuadra", "barrio", "ciudad"], marker: ".license-card" },
  { path: "/addons", slugs: ["whatsapp-business", "telephony-sms", "reputation-reviews", "campaigns-diffusion", "conversational-ai", "voice-ai", "connections-integrations"], marker: ".addon-card" },
  { path: "/servicios", slugs: ["estructuracion", "formalizacion", "presencia-digital", "automatizacion", "inteligencia-artificial", "visibilidad", "desarrollo-empresarial"], marker: ".services-core-card" },
];

const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  for (const width of [360, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const category of group) {
      await page.goto(new URL(category.path, baseUrl).toString(), { waitUntil: "networkidle" });
      const detailLinks = page.locator(`main ${category.marker} a[href^="${category.path}/"]`);
      assert(await detailLinks.count() === category.slugs.length, `${width}: faltan enlaces de detalles en ${category.path}`);
      for (const slug of category.slugs) {
        const path = `${category.path}/${slug}`;
        const link = page.locator(`main a[href="${path}"]`);
        assert(await link.count() === 1, `${width}: ficha ausente en el catálogo ${path}`);
        await link.click();
        await page.waitForURL(`**${path}`);
        const detailResponse = await page.reload({ waitUntil: "networkidle" });
        assert(detailResponse?.status() === 200, `${width}: ficha ${path} devolvió ${detailResponse?.status() ?? "sin respuesta"}`);
        assert(await page.locator("main h1").count() === 1, `${width}: H1 incorrecto en ${path}`);
        assert(await page.locator(".commercial-detail__columns section").count() === 2, `${width}: faltan inclusiones/exclusiones en ${path}`);
        assert(await page.locator(".commercial-detail__benefits").count() === 1, `${width}: beneficios duplicados en ${path}`);
        assert(await page.locator(".commercial-detail__continuity").count() <= 1, `${width}: continuidad duplicada en ${path}`);
        assert(await page.locator(".commercial-detail__decision").isVisible(), `${width}: sin recomendación en ${path}`);
        assert(await page.locator(".commercial-detail__benefits li").count() >= 2, `${width}: ficha sin ventajas prácticas ${path}`);
        if (path === "/addons/whatsapp-business") {
          assert(await page.locator(".commercial-detail__journey li").count() === 4, `${width}: falta recorrido de WhatsApp a CRM`);
          const continuity = await page.locator(".commercial-detail__continuity").innerText();
          assert(continuity.includes("mensajes que el CRM ya recibió"), `${width}: no explica conservación de historial`);
          assert(continuity.includes("no están garantizados"), `${width}: promete recuperar mensajes no recibidos`);
          const benefits = await page.locator(".commercial-detail__benefits").innerText();
          assert(benefits.includes("contacto") && benefits.includes("Instagram"), `${width}: no explica captura o multicanal`);
        }
        assert(await page.locator(`a[href="${category.path}"]`).count() > 0, `${width}: sin regreso al catálogo en ${path}`);
        assert(await page.locator('main a[href^="/contacto?interes="]').count() >= 1, `${width}: sin consulta contextual en ${path}`);
        const html = await page.content();
        assert(!/\bGHL\b|HighLevel|GoHighLevel/i.test(html), `${width}: marca tecnológica en ficha pública ${path}`);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        assert(canonical === `https://vecidya.com${path}`, `${width}: canonical incorrecta ${path}`);
        const dims = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        assert(dims[0] <= dims[1] + 1, `${width}: overflow en ${path}, ${dims}`);
        if (path === "/licencias/ciudad") {
          assert(await page.locator(".commercial-detail__module-grid article").count() >= 6, "Ciudad debe describir su biblioteca modular");
        }
        await page.goto(new URL(category.path, baseUrl).toString(), { waitUntil: "networkidle" });
      }
    }
    const invalid = await page.goto(new URL("/licencias/plan-inexistente", baseUrl).toString());
    assert(invalid?.status() === 404, `${width}: plan inexistente no devuelve 404`);
    await page.close();
  }
  console.log("PASS: 17 fichas comerciales, sitemap/SEO, inclusión/exclusión, CTAs y 404 en 360/1024 px.");
} finally {
  await browser.close();
}
