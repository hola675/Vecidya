import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;

  await page.goto(new URL("/sobre-nosotros", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label} Nosotros debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/sobre-nosotros", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Nosotros no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} Nosotros no tiene Open Graph image.`);
  assert(await page.getByRole("img", { name: "Yoan y Edgar juntos frente al símbolo de Vecidya" }).isVisible(), `${label} no mostró foto conjunta.`);
  assert(await page.getByRole("heading", { name: "La claridad no debería ser un lujo para un negocio pequeño." }).isVisible(), `${label} no mostró propósito.`);
  assert(await page.getByRole("heading", { name: "Tecnología y desarrollo empresarial en la misma conversación." }).isVisible(), `${label} no mostró equipo.`);
  assert(await page.getByRole("heading", { name: "Yoan Ortiz" }).isVisible(), `${label} no mostró a Yoan.`);
  assert(await page.getByRole("heading", { name: "Edgar" }).isVisible(), `${label} no mostró a Edgar.`);
  assert(await page.getByRole("heading", { name: "Nuestros valores se notan en lo que hacemos." }).isVisible(), `${label} no mostró forma de trabajar.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).last().getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Hablar con Vecidya" }).last().getAttribute("href") === "/contacto", `${label} CTA de Contacto incorrecto.`);
  assert(!(await page.content()).match(/años de experiencia|clientes atendidos|premios|equipo de expertos/i), `${label} contiene credenciales no verificadas.`);
  await page.getByRole("link", { name: "Conoce cómo ayudamos" }).focus();
  assert(await page.getByRole("link", { name: "Conoce cómo ayudamos" }).evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Nosotros verificó historia, propósito, equipo real, forma de trabajar, CTAs, metadata, keyboard focus y responsive 1366/768/390/360.");
