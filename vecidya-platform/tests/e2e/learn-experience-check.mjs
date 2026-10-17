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

  // Cloudflare/Vite dev can keep module requests open; explicit page assertions below are the readiness check.
  await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert(await page.locator("h1").count() === 1, `${label} Aprende debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/aprende", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Aprende no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} Aprende no tiene Open Graph image.`);
  assert(await page.getByRole("heading", { name: "Empieza por la pregunta que tienes hoy." }).isVisible(), `${label} no mostró temas.`);
  assert(await page.getByRole("heading", { name: "Empieza por una pregunta concreta." }).isVisible(), `${label} no mostró las guías.`);
  assert(await page.getByRole("heading", { name: /¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo\?/i }).isVisible(), `${label} no mostró el artículo CRM.`);
  const domainGuideLink = page.getByRole("link", { name: /Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos/i });
  assert(await domainGuideLink.isVisible(), `${label} no muestra la guía de dominio en el catálogo.`);
  assert((await domainGuideLink.getAttribute("href")) === "/aprende/dominio-hosting-sitio-web-como-funcionan", `${label} el artículo de dominio no enlaza su ruta estable.`);
  assert(await page.getByRole("heading", { name: "Tecnología explicada", exact: true }).isVisible(), `${label} la categoría Tecnología explicada sigue vacía.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Hacer una pregunta" }).getAttribute("href") === "/contacto", `${label} CTA de Contacto incorrecto.`);
  const articleLink = page.getByRole("link", { name: /Leer guía/i }).first();
  assert((await articleLink.getAttribute("href"))?.startsWith("/aprende/"), `${label} tarjeta no enlazó artículo.`);
  await page.getByRole("link", { name: "Hacer diagnóstico" }).first().focus();
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);

  const articleUrl = new URL((await articleLink.getAttribute("href")), baseUrl).toString();
  await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
  assert(await page.locator("h1").count() === 1, `${label} artículo debe tener un único H1.`);
  // Regresión TYPECHECK-001: `meta({ data })` dejó de recibir datos en React Router 8 y cada artículo
  // se publicaba como «Artículo no encontrado», `noindex, nofollow` y canonical a /aprende.
  const articleTitle = (await page.locator("h1").textContent())?.trim() ?? "";
  assert((await page.title()).startsWith(articleTitle), `${label} el título del documento no es el del artículo: «${await page.title()}».`);
  assert(!/noindex/i.test((await page.locator('meta[name="robots"]').getAttribute("content")) ?? ""), `${label} el artículo se sirve con noindex.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com${new URL(articleUrl).pathname}`, `${label} canonical del artículo incorrecta.`);
  assert(await page.locator('meta[property="og:type"]').getAttribute("content") === "article", `${label} el Open Graph del artículo no identifica el tipo article.`);
  assert(await page.getByText("Por Yoan Ortiz").isVisible(), `${label} artículo no muestra autoría.`);
  assert(await page.getByText("En esta guía", { exact: true }).isVisible(), `${label} artículo no muestra índice.`);
  assert(await page.getByRole("link", { name: /Revisar mi punto de partida digital|Explorar si IA tiene sentido|Hablar sobre un proceso/i }).count() > 0, `${label} artículo no muestra CTA contextual.`);
  assert(await page.getByText("Ejemplo hipotético", { exact: true }).isVisible(), `${label} la guía CRM no identifica explícitamente su ejemplo hipotético.`);
  assert(await page.getByRole("heading", { name: "De consulta a próximo paso: un ejemplo hipotético" }).isVisible(), `${label} la guía CRM no presenta su ejemplo práctico.`);
  assert(await page.getByRole("heading", { name: "Una rutina sencilla de seguimiento" }).isVisible(), `${label} la guía CRM no presenta una rutina aplicable.`);
  assert(await page.getByRole("heading", { name: "Fuentes y orientación adicional" }).isVisible(), `${label} la guía CRM no presenta sus referencias.`);
  assert(await page.getByRole("link", { name: "NIST Privacy Framework" }).isVisible(), `${label} la referencia de privacidad no es accesible como enlace.`);
  assert(await page.locator(".learn-block--steps ol").count() > 0, `${label} la guía CRM no renderizó pasos numerados.`);
  assert(await page.locator(".learn-block--definitions dl").count() > 0, `${label} la guía CRM no renderizó definiciones semánticas.`);
  assert(await page.getByText("Consulta/interesado", { exact: true }).isVisible(), `${label} no muestra la categoría de cliente acordada.`);
  const crmDataFaq = page.getByText("¿Cómo se guardan mis datos en el CRM de Vecidya?", { exact: true });
  assert(await crmDataFaq.isVisible(), `${label} la guía CRM no explica el manejo de datos de la subcuenta.`);
  await crmDataFaq.click();
  assert(await page.getByText(/tienes 30 días para copiar o exportar/i).isVisible(), `${label} no muestra el periodo de exportación tras finalizar la licencia.`);
  await assertNoOverflow(page, `${label} artículo`);

  const aiSlug = "que-puede-hacer-una-inteligencia-artificial-por-un-negocio";
  await page.goto(new URL(`/aprende/${aiSlug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert((await page.locator("h1").textContent())?.trim() === "¿Qué puede hacer una inteligencia artificial por un negocio?", `${label} el artículo de IA cambió su H1 o no cargó.`);
  assert(await page.getByRole("heading", { name: "Qué es la inteligencia artificial en un negocio" }).isVisible(), `${label} el artículo de IA no explica la definición.`);
  assert(await page.getByRole("heading", { name: "Cuándo no conviene implementar IA" }).isVisible(), `${label} el artículo de IA no presenta límites de adopción.`);
  assert(await page.getByRole("heading", { name: "Un taller de bicicletas y sus consultas de servicio" }).isVisible(), `${label} el artículo de IA no presenta el ejemplo hipotético.`);
  assert(await page.getByRole("link", { name: "NIST AI 600-1: Generative Artificial Intelligence Profile" }).isVisible(), `${label} falta la fuente primaria de riesgos de IA generativa.`);
  assert(await page.locator(".learn-block--example").count() > 0, `${label} el ejemplo de IA no se renderizó como bloque.`);
  assert(await page.locator(".learn-block--steps ol").count() >= 2, `${label} no se renderizaron procedimientos para la guía de IA.`);
  assert(await page.locator(".learn-block--sources a").count() >= 2, `${label} faltan fuentes accesibles en la guía de IA.`);
  assert(await page.getByRole("link", { name: "Revisar mi punto de partida digital" }).isVisible(), `${label} falta el CTA contextual de IA.`);
  const aiOfferFaq = page.getByText("¿Qué opciones de inteligencia artificial ofrece Vecidya?", { exact: true });
  assert(await aiOfferFaq.isVisible(), `${label} el FAQ no describe las opciones comerciales de IA.`);
  await aiOfferFaq.click();
  assert(await page.getByText(/complementos opcionales para Barrio o Ciudad/i).isVisible(), `${label} no distingue complementos de IA de las licencias base.`);
  const aiUsageFaq = page.getByText("¿Cómo se cobra el consumo de IA?", { exact: true });
  assert(await aiUsageFaq.isVisible(), `${label} falta una explicación breve del consumo de IA.`);
  await aiUsageFaq.click();
  assert(await page.getByText(/tokens.*minutos\/telefonía/i).isVisible(), `${label} no explica el consumo separado del complemento.`);
  await assertNoOverflow(page, `${label} artículo IA`);

  for (const [slug, heading] of [
    ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "Antes de hacer publicidad, organiza tu presencia digital"],
    ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio", "Automatizaciones: ahorrar tiempo sin complicar tu negocio"],
  ]) {
    await page.goto(new URL(`/aprende/${slug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
    assert((await page.locator("h1").textContent())?.trim() === heading, `${label} el artículo existente ${slug} dejó de cargar su H1 esperado.`);
    assert(await page.getByText("En esta guía", { exact: true }).isVisible(), `${label} el artículo existente ${slug} perdió su índice.`);
    const tocLinks = page.locator(".learn-article-toc a");
    for (const href of await tocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
      assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice apunta a una sección inexistente en ${slug}: ${href}`);
    }
  }

  const automationSlug = "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio";
  await page.goto(new URL(`/aprende/${automationSlug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert((await page.locator("h1").textContent())?.trim() === "Automatizaciones: ahorrar tiempo sin complicar tu negocio", `${label} cambió la URL o el título de Automatización.`);
  for (const heading of [
    "Qué significa automatizar una tarea",
    "La secuencia: evento → condición → acción",
    "Cómo reconocer una tarea repetitiva",
    "Qué conviene automatizar y qué conviene dejar manual",
    "Documenta el proceso antes de configurar nada",
    "Ejemplo principal: reposición de bolsas de café",
    "Errores, duplicados y reintentos",
    "Cuándo necesita intervenir una persona",
    "Protege la información y las preferencias de contacto",
    "Prueba antes de usarla en el trabajo real",
    "Mide si aporta valor y conserva una forma de detenerla",
    "Un ejemplo comercial breve: recordatorio acordado",
    "Preguntas frecuentes",
    "Fuentes y orientación adicional",
    "Qué puedes hacer ahora",
  ]) assert(await page.getByRole("heading", { name: heading, exact: true }).isVisible(), `${label} falta la sección «${heading}».`);
  assert(await page.locator(".learn-block--example").count() >= 2, `${label} faltan ejemplos operativos y comerciales.`);
  assert(await page.locator(".learn-block--steps ol").count() >= 3, `${label} faltan pasos para documentar y probar.`);
  assert(await page.locator(".learn-block--faq details").count() >= 6, `${label} faltan preguntas frecuentes.`);
  assert(await page.getByRole("link", { name: "NIST Privacy Framework" }).isVisible(), `${label} no renderizó las fuentes como enlaces.`);
  const automationImage = page.locator(".learn-article-image");
  assert((await automationImage.getAttribute("alt"))?.includes("condición"), `${label} el diagrama no tiene una descripción alternativa suficiente.`);
  assert(await automationImage.evaluate((image) => image.complete && image.naturalWidth > 0), `${label} no cargó diagram-automation.svg.`);
  const automationTocLinks = page.locator(".learn-article-toc a");
  for (const href of await automationTocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice de Automatización apunta a una sección inexistente: ${href}`);
  }
  const automationFaq = page.getByText("¿Qué ofrece Vecidya para automatizar?", { exact: true });
  assert(await automationFaq.isVisible(), `${label} falta FAQ que separa el catálogo de una configuración activa.`);
  await automationFaq.click();
  assert(await page.getByText(/figurar en el catálogo no significa estar activado/i).isVisible(), `${label} la FAQ confunde catálogo y activación.`);
  await assertNoOverflow(page, `${label} artículo Automatización`);

  const domainSlug = "dominio-hosting-sitio-web-como-funcionan";
  await page.goto(new URL(`/aprende/${domainSlug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  const domainTitle = "Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos";
  assert((await page.locator("h1").textContent())?.trim() === domainTitle, `${label} no cargó el artículo de dominio esperado.`);
  assert((await page.title()).startsWith(domainTitle), `${label} el título de documento del artículo de dominio es incorrecto.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com/aprende/${domainSlug}`, `${label} canonical del artículo de dominio incorrecta.`);
  assert(await page.locator('meta[name="description"]').getAttribute("content") === "Un dominio es el nombre que una persona escribe; el hosting mantiene disponible el sitio, y el DNS ayuda a encontrar el servidor. Son piezas distintas aunque un proveedor las ofrezca juntas.", `${label} description individual del artículo de dominio incorrecta.`);
  assert((await page.locator('meta[property="og:title"]').getAttribute("content"))?.startsWith(domainTitle), `${label} Open Graph no refleja el artículo de dominio.`);
  assert(await page.locator('meta[property="og:type"]').getAttribute("content") === "article", `${label} tipo Open Graph del artículo de dominio incorrecto.`);
  assert(await page.locator('meta[name="robots"]').getAttribute("content") === "index, follow", `${label} robots individual del artículo de dominio incorrecto.`);
  assert(await page.locator('meta[property="article:section"]').getAttribute("content") === "Tecnología explicada", `${label} metadata no refleja la categoría del artículo de dominio.`);
  assert(await page.getByRole("heading", { name: "Del nombre que escribes a la página que ves", exact: true }).isVisible(), `${label} falta la explicación del recorrido DNS.`);
  assert(await page.getByRole("heading", { name: "HTTPS y el certificado TLS", exact: true }).isVisible(), `${label} falta la explicación de HTTPS y TLS.`);
  assert(await page.locator(".learn-block--definitions dl").count() > 0, `${label} faltan definiciones semánticas del dominio y hosting.`);
  assert(await page.locator(".learn-block--steps ol").count() > 0, `${label} falta el recorrido práctico del ejemplo.`);
  assert(await page.locator(".learn-block--faq details").count() >= 6, `${label} faltan preguntas frecuentes sobre dominio y alojamiento.`);
  const domainImage = page.locator(".learn-article-image");
  assert((await domainImage.getAttribute("alt"))?.match(/persona.*navegador.*DNS.*servidor.*página/i), `${label} el diagrama no describe el recorrido accesiblemente.`);
  assert(await domainImage.evaluate((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0), `${label} no cargó el SVG de dominio y DNS.`);
  const diagramResponse = await page.request.get(new URL("/assets/learn/diagram-domain-dns-hosting.svg", baseUrl).toString());
  assert(diagramResponse.ok(), `${label} el recurso SVG no responde.`);
  const diagramSvg = await diagramResponse.text();
  assert(diagramSvg.includes('viewBox="0 0 960 384"'), `${label} el diagrama perdió su lienzo panorámico legible.`);
  const svgFontSizes = Array.from(diagramSvg.matchAll(/font-size="(\d+)"/g), (match) => Number(match[1]));
  assert(svgFontSizes.length > 0 && Math.min(...svgFontSizes) >= 36, `${label} el diagrama volvió a usar etiquetas demasiado pequeñas.`);
  for (const sourceName of ["ICANN", "RFC 1034", "RFC 1035", "Transport Layer Security"]) {
    assert(await page.getByRole("link", { name: new RegExp(sourceName, "i") }).count() > 0, `${label} falta el enlace de fuente ${sourceName}.`);
  }
  assert(await page.locator(".learn-block--sources a").count() === 8, `${label} el artículo no expone todas sus fuentes primarias.`);
  const relatedPresence = page.getByRole("link", { name: /Antes de hacer publicidad, organiza tu presencia digital/i });
  assert(await relatedPresence.isVisible(), `${label} falta la lectura interna relacionada sobre presencia digital.`);
  const sitemap = await page.request.get(new URL("/sitemap.xml", baseUrl).toString());
  assert(sitemap.ok() && (await sitemap.text()).includes(`/aprende/${domainSlug}`), `${label} el sitemap no incluye el nuevo artículo.`);
  const domainTocLinks = page.locator(".learn-article-toc a");
  for (const href of await domainTocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice apunta a una sección inexistente en el artículo de dominio: ${href}`);
  }
  await assertNoOverflow(page, `${label} artículo de dominio y hosting`);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Aprende verificó cinco guías, categorías, autoría, CTAs, metadata, sitemap, keyboard focus y responsive 1366/768/390/360.");
