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
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right }));
  });
  assert(overflow.length === 0, `${label}: desbordamiento horizontal ${JSON.stringify(overflow)}`);
}

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  for (const width of [1366, 1024, 960, 768, 390, 360]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const label = `${width}px`;
    await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "networkidle" });
    await assertNoOverflow(page, `${label} inicio`);
    for (const path of ["/licencias", "/servicios", "/aprende", "/contacto"]) {
      assert(await page.locator(`main a[href="${path}"]`).count() > 0, `${label}: Home sin recorrido directo a ${path}`);
    }
    assert(await page.getByRole("link", { name: "Saltar al contenido" }).count() === 1, `${label}: falta enlace de salto`);
    assert(await page.locator("header .site-brand").getAttribute("href") === "/", `${label}: marca sin enlace al inicio`);

    const mobileMenu = page.locator("header .site-mobile-menu");
    if (width <= 960) {
      assert(await mobileMenu.isVisible(), `${label}: falta menú móvil/tablet`);
      await mobileMenu.locator("summary").click();
      assert(await mobileMenu.getAttribute("open") !== null, `${label}: menú no se abrió`);
      assert(await mobileMenu.locator('nav a[href="/unete"]').count() === 1, `${label}: CTA Únete duplicado`);
      for (const path of ["/", "/vecindario", "/aprende", "/diagnostico", "/licencias", "/addons", "/servicios", "/contacto", "/unete"]) {
        assert(await mobileMenu.locator(`nav a[href="${path}"]`).count() === 1, `${label}: navegación móvil ambigua: ${path}`);
      }
      const height = await mobileMenu.locator('nav a[href="/contacto"]').evaluate((link) => link.getBoundingClientRect().height);
      assert(height >= 44, `${label}: objetivo táctil menor de 44px`);
      await page.keyboard.press("Escape");
      assert(await mobileMenu.getAttribute("open") === null, `${label}: Escape no cierra el menú`);
      await mobileMenu.locator("summary").click();
      await page.locator("main h1").first().click();
      assert(await mobileMenu.getAttribute("open") === null, `${label}: pulsación fuera no cierra el menú`);
    } else {
      const primary = page.locator("header .site-nav");
      assert(await primary.isVisible(), `${label}: menú principal no visible`);
      assert(await primary.locator('a[href="/servicios"]').count() === 1, `${label}: Servicios duplicado en escritorio`);
      const solutions = primary.locator(".site-nav__group");
      await solutions.locator("summary").click();
      assert(await solutions.getAttribute("open") !== null, `${label}: Soluciones no se abrió`);
      assert(await solutions.locator('a[href="/licencias"]').count() === 1, `${label}: falta Licencias`);
      await page.keyboard.press("Escape");
      assert(await solutions.getAttribute("open") === null, `${label}: Escape no cierra Soluciones`);
    }

    await page.goto(new URL("/licencias", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.site-footer__nav a[href="/licencias"][aria-current="page"]').count() === 1, `${label}: footer sin estado activo`);
    assert(await page.locator('a[href="/contacto?interes=cuadra"]').count() > 0, `${label}: Cuadra no conserva interés`);
    await assertNoOverflow(page, `${label} licencias`);
    await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('a[href="/contacto?interes=servicio-visibilidad"]').count() > 0, `${label}: Servicios no conserva interés`);
    await assertNoOverflow(page, `${label} servicios`);
    await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.site-footer__nav a[href="/aprende"][aria-current="page"]').count() === 1, `${label}: Aprende sin estado en footer`);
    await assertNoOverflow(page, `${label} Aprende`);
    await page.goto(new URL("/addons", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.addon-card a[href^="/contacto?interes=complemento-"]').count() === 7, `${label}: complementos pierden el contexto`);
    await page.locator('.addon-card a[href="/contacto?interes=complemento-whatsapp-business"]').click();
    await page.waitForURL("**/contacto?interes=complemento-whatsapp-business");
    assert(await page.getByText(/Interés seleccionado:.*WhatsApp Business/).isVisible(), `${label}: Contacto no presenta el complemento seleccionado`);
    await assertNoOverflow(page, `${label} contacto`);
    await page.close();
  }

  const alias = await fetch(new URL("/que-debes-saber", baseUrl), { redirect: "manual" });
  assert(alias.status === 301 && alias.headers.get("location")?.endsWith("/aprende"), "Alias de Aprende no redirige con 301");
  console.log("PASS: navegación, estado activo, menús y CTA comerciales en 1366/1024/960/768/390/360.");
} finally {
  await browser.close();
}
