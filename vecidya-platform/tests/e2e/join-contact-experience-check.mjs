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

async function assertMetadata(page, label) {
  assert(await page.locator("h1").count() === 1, `${label} debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').count() === 1, `${label} no tiene canonical.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} no tiene Open Graph image.`);
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;

  await page.goto(new URL("/unete", baseUrl).toString(), { waitUntil: "networkidle" });
  await assertMetadata(page, `${label} Únete`);
  await assertNoOverflow(page, `${label} Únete`);
  assert(await page.getByRole("heading", { name: "Dos entradas. Una conversación con sentido." }).isVisible(), `${label} Únete no mostró las dos entradas.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} Únete no enlazó Diagnóstico.`);
  assert(await page.getByRole("link", { name: "Hablar con Vecidya" }).first().getAttribute("href") === "/contacto", `${label} Únete no enlazó Contacto.`);
  assert(!(await page.content()).match(/comprar|checkout|carrito|ver planes|crear cuenta/i), `${label} Únete contiene onboarding comercial inexistente.`);

  await page.goto(new URL("/contacto", baseUrl).toString(), { waitUntil: "networkidle" });
  await assertMetadata(page, `${label} Contacto`);
  await assertNoOverflow(page, `${label} Contacto`);
  const emailLinks = page.locator('a[href="mailto:hola@vecidya.com"]');
  assert(await emailLinks.count() >= 2, `${label} Contacto no mostró el mailto en sus superficies principales.`);
  await emailLinks.first().focus();
  assert(await emailLinks.first().evaluate((element) => document.activeElement === element), `${label} Contacto no permite enfocar el email.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} Contacto no enlazó Diagnóstico.`);
  assert(await page.getByRole("link", { name: /Ver privacidad/i }).getAttribute("href") === "/privacidad", `${label} Contacto no enlazó Privacidad.`);
  assert(!(await page.content()).match(/WhatsApp|chat en vivo|teléfono|booking|calendario/i), `${label} Contacto sugiere un canal no disponible.`);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Únete y Contacto verificaron responsabilidades separadas, CTAs, mailto, privacidad, metadata, keyboard focus y responsive 1366/768/390/360.");
