import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const absolute = (path) => new URL(path, baseUrl).toString();

async function visit(page, path) {
  const response = await page.goto(absolute(path), { waitUntil: "networkidle" });
  assert(response?.status() === 200, `${path} no devolvió 200`);
}

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert(dimensions.content <= dimensions.viewport + 1, `${label}: overflow horizontal ${JSON.stringify(dimensions)}`);
}

async function assertContext(page, { interest, label, returnTo, returnLabel, messageText }) {
  await page.waitForURL(`**/contacto?interes=${interest}`);
  assert(await page.getByText(`Interés seleccionado: ${label}`).isVisible(), `${interest}: falta contexto en Contacto`);
  const returnLink = page.getByRole("link", { name: returnLabel });
  assert(await returnLink.getAttribute("href") === returnTo, `${interest}: retorno incorrecto`);
  const email = await page.locator('.contact-experience-hero a[href^="mailto:"]').getAttribute("href");
  const whatsapp = await page.locator('.contact-experience-hero a[href^="https://wa.me/"]').getAttribute("href");
  assert(email && decodeURIComponent(email).includes(messageText), `${interest}: mailto sin contexto`);
  assert(whatsapp && decodeURIComponent(whatsapp).includes(messageText), `${interest}: WhatsApp sin contexto`);
  await assertNoHorizontalOverflow(page, `Contacto ${interest}`);
  await returnLink.click();
  await page.waitForURL((url) => url.pathname + url.hash === returnTo);
  const anchorId = returnTo.split("#")[1];
  assert(anchorId && await page.locator(`[id="${anchorId}"]`).isVisible(), `${interest}: ancla de oferta no existe`);
}

const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  for (const width of [320, 390, 768, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });

    // Home → Licencias → contacto preseleccionado → Cuadra.
    await visit(page, "/");
    await page.locator('main a[href="/licencias"]').first().click();
    await page.waitForURL("**/licencias");
    await assertNoHorizontalOverflow(page, `${width}px Licencias`);
    await page.getByRole("link", { name: "Consultar licencia Cuadra" }).click();
    await assertContext(page, {
      interest: "cuadra", label: "la licencia Cuadra",
      returnTo: "/licencias#cuadra", returnLabel: "Volver a la licencia Cuadra",
      messageText: "me interesa la licencia Cuadra",
    });

    // Home → Servicios → consulta específica → vuelta a la familia.
    await visit(page, "/");
    const expectedPreviews = {
      "Presencia & Marca": "/servicios#estructuracion",
      "Web & Conversión": "/servicios#formalizacion",
      "Visibilidad & Marketing": "/servicios#presencia-digital",
      "Sistema Comercial": "/servicios#automatizacion",
    };
    for (const [name, href] of Object.entries(expectedPreviews)) {
      assert(await page.locator(`main a[href="${href}"]`).count() === 1, `${width}px: Home no enlaza el servicio ${name}`);
    }
    await page.getByRole("link", { name: "Conocer Web & Conversión" }).click();
    await page.waitForURL("**/servicios#formalizacion");
    assert(await page.locator("#formalizacion").isVisible(), `${width}px: ficha de servicio ausente`);
    await page.getByRole("link", { name: "Consultar Web & Conversión" }).click();
    await assertContext(page, {
      interest: "servicio-formalizacion", label: "el servicio Web & Conversión",
      returnTo: "/servicios#formalizacion", returnLabel: "Volver al servicio Web & Conversión",
      messageText: "me interesa el servicio Web & Conversión",
    });

    // Licencias → Complementos → WhatsApp Business → Contacto → ficha.
    await visit(page, "/licencias");
    await page.locator('main a[href="/addons"]').first().click();
    await page.waitForURL("**/addons");
    await page.getByRole("link", { name: "Consultar WhatsApp Business" }).click();
    await assertContext(page, {
      interest: "complemento-whatsapp-business", label: "el complemento WhatsApp Business",
      returnTo: "/addons#whatsapp-business", returnLabel: "Volver al complemento WhatsApp Business",
      messageText: "me interesa el complemento WhatsApp Business",
    });

    // Home → Aprende → Diagnóstico; Aprende → Contacto general, sin interés inventado.
    await visit(page, "/");
    await page.locator('main a[href="/aprende"]').first().click();
    await page.waitForURL("**/aprende");
    await assertNoHorizontalOverflow(page, `${width}px Aprende`);
    await page.locator('.learn-experience-hero a[href="/diagnostico"]').click();
    await page.waitForURL("**/diagnostico");
    assert(await page.locator("main").count() === 1, `${width}px: Diagnóstico sin main`);
    await visit(page, "/aprende");
    await page.getByRole("link", { name: "Hacer una pregunta" }).click();
    await page.waitForURL("**/contacto");
    assert(await page.locator(".contact-selection").count() === 0, `${width}px: Contacto general muestra interés anterior`);
    assert(await page.locator('.contact-experience-hero a[href="mailto:hola@vecidya.com"]').count() === 1, `${width}px: Contacto general sin email`);
    await assertNoHorizontalOverflow(page, `${width}px Contacto general`);

    await page.close();
  }
  console.log("PASS: recorridos públicos 320/390/768/1366, CTA específicos, email/WhatsApp y regreso a fichas.");
} finally {
  await browser.close();
}
