import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const evidencePath = "test-results/ux-crystal-r2";
mkdirSync(evidencePath, { recursive: true });

async function assertNoOverflow(page, label) {
  const measurement = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflow = scrollWidth - viewport;
    const candidates = overflow > 1 ? [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > viewport + 1;
      })
      .slice(0, 6)
      .map((element) => ({
        tag: element.tagName,
        className: typeof element.className === "string" ? element.className : "",
        right: Math.round(element.getBoundingClientRect().right * 100) / 100,
        parent: element.parentElement?.className ?? "",
      })) : [];
    return { viewport, scrollWidth, overflow, candidates };
  });
  // Un borde hijo puede sobresalir fraccionalmente y quedar recortado sin
  // causar desplazamiento del documento; medir scrollWidth evita falsos fallos.
  assert(measurement.overflow <= 1, `${label}: scroll horizontal real ${JSON.stringify(measurement)}`);
}

async function assertRoundedSurfaces(page, label) {
  const square = await page.evaluate(() => [...document.querySelectorAll("main section,main article,main fieldset,main details,main button,main .button,main input:not([type=checkbox]):not([type=radio]),main select,main textarea,main [class*=card],main [class*=panel],main [class*=item],main [class*=row]")]
    .filter((element) => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) === 0; })
    .slice(0, 6)
    .map((element) => ({ tag: element.tagName, className: typeof element.className === "string" ? element.className : "" })));
  assert(square.length === 0, `${label}: quedan superficies con esquinas cuadradas ${JSON.stringify(square)}`);
}

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  for (const width of [1366, 1024, 960, 768, 390, 360, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const label = `${width}px`;
    await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "networkidle" });
    const headerLayer = await page.locator("header.site-header").evaluate((header) => {
      const style = getComputedStyle(header);
      return { position: style.position, zIndex: Number.parseInt(style.zIndex, 10) };
    });
    assert(headerLayer.position !== "static" && headerLayer.zIndex > 0, `${label}: el encabezado debe quedar en una capa sobre el hero`);
    await assertNoOverflow(page, `${label} inicio`);
    await assertRoundedSurfaces(page, `${label} inicio`);
    assert(await page.locator('.home-section-heading.v-section-heading').count() === 4, `${label}: Inicio no usa los cuatro encabezados compartidos`);
    if ([390, 1366].includes(width)) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => ({
        className: document.activeElement?.className ?? "",
        outline: getComputedStyle(document.activeElement).outlineStyle,
      }));
      assert(typeof focus.className === "string" && focus.className.includes("skip-link"), `${label}: foco inicial sin salto al contenido`);
      assert(focus.outline !== "none", `${label}: skip-link sin foco visible`);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const reduced = await page.locator(".home-hero-visual__vico").evaluate(el => getComputedStyle(el).animationName);
      assert(reduced === "none", `${label}: Vico sigue animado con movimiento reducido`);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.screenshot({ path: `${evidencePath}/${width}-inicio.png`, animations: "disabled" });
    }
    for (const path of ["/licencias", "/servicios", "/aprende", "/contacto"]) {
      assert(await page.locator(`main a[href="${path}"],header a[href="${path}"]`).count() > 0, `${label}: navegación pública sin recorrido a ${path}`);
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
      await page.mouse.click(8, 300); // fuera del panel flotante incluso a 360 px
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

    const footerGroups = await page.locator("footer .site-footer__nav > div > strong").allTextContents();
    assert(JSON.stringify(footerGroups) === JSON.stringify(["Explorar", "Soluciones", "Vecidya", "Información legal"]), `${label}: grupos del footer divergentes`);
    assert(await page.locator('footer .site-footer__nav a[href="/addons"]').innerText() === "Complementos", `${label}: etiqueta del enlace Complementos`);
    await page.goto(new URL("/licencias", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.site-footer__nav a[href="/licencias"][aria-current="page"]').count() === 1, `${label}: footer sin estado activo`);
    assert(await page.locator('a[href="/contacto?interes=cuadra"]').count() > 0, `${label}: Cuadra no conserva interés`);
    await assertNoOverflow(page, `${label} licencias`);
    await assertRoundedSurfaces(page, `${label} licencias`);
    await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('a[href="/contacto?interes=servicio-visibilidad"]').count() > 0, `${label}: Servicios no conserva interés`);
    await assertNoOverflow(page, `${label} servicios`);
    await assertRoundedSurfaces(page, `${label} servicios`);
    assert(await page.locator(".services-section-heading.v-section-heading").count() === 2, `${label}: Servicios perdió la retícula compartida`);
    if ([390, 1366].includes(width)) {
      await page.screenshot({ path: `${evidencePath}/${width}-servicios.png`, animations: "disabled" });
      await page.goto(new URL("/vecindario", baseUrl).toString(), { waitUntil: "networkidle" });
      assert(await page.locator(".directory-results-heading.v-section-heading").count() === 1, `${label}: Vecindario perdió la retícula compartida`);
      await assertNoOverflow(page, `${label} Vecindario`);
      await page.screenshot({ path: `${evidencePath}/${width}-vecindario.png`, animations: "disabled" });
    }
    await page.goto(new URL("/diagnostico", baseUrl).toString(), { waitUntil: "networkidle" });
    await assertNoOverflow(page, `${label} diagnóstico`);
    await assertRoundedSurfaces(page, `${label} diagnóstico`);
    await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.site-footer__nav a[href="/aprende"][aria-current="page"]').count() === 1, `${label}: Aprende sin estado en footer`);
    await assertNoOverflow(page, `${label} Aprende`);
    await assertRoundedSurfaces(page, `${label} Aprende`);
    if ([390, 1366].includes(width)) {
      await page.screenshot({ path: `${evidencePath}/${width}-aprende.png`, animations: "disabled" });
    }
    await page.goto(new URL("/addons", baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator('.addon-card a[href^="/contacto?interes=complemento-"]').count() === 7, `${label}: complementos pierden el contexto`);
    await page.locator('.addon-card a[href="/contacto?interes=complemento-whatsapp-business"]').click();
    await page.waitForURL("**/contacto?interes=complemento-whatsapp-business");
    await page.getByText(/Interés seleccionado:.*WhatsApp Business/).waitFor({ state: "visible" });
    assert(await page.getByText(/Interés seleccionado:.*WhatsApp Business/).isVisible(), `${label}: Contacto no presenta el complemento seleccionado`);
    await assertNoOverflow(page, `${label} contacto`);
    await page.close();
  }

  const alias = await fetch(new URL("/que-debes-saber", baseUrl), { redirect: "manual" });
  assert(alias.status === 301 && alias.headers.get("location")?.endsWith("/aprende"), "Alias de Aprende no redirige con 301");
  console.log("PASS: navegación, retícula compartida, foco, movimiento reducido, capturas y desbordamiento (1366/1024/960/768/390/360/320).");
} finally {
  await browser.close();
}
