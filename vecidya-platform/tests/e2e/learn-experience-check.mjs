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
    return {
      root: {
        clientWidth: width,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      },
      elements: [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width })),
    };
  });
  assert(overflow.root.documentScrollWidth <= overflow.root.clientWidth + 1 && overflow.root.bodyScrollWidth <= overflow.root.clientWidth + 1 && overflow.elements.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
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
  assert(await page.locator(".learn-guide-list > li").count() === 38, `${label} el catálogo no conserva las 38 guías.`);
  assert(await page.locator(".learn-path-list > li").count() === 7, `${label} no muestra los siete itinerarios.`);
  assert(await page.locator(".learn-topic-list > li").count() === 6, `${label} no muestra los seis temas.`);
  assert(await page.locator(".learn-guide__topic span").count() === 27, `${label} no conserva los 27 estados editoriales de borrador.`);
  assert(await page.locator(".learn-guide-list").getByRole("heading", { name: /¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo\?/i }).isVisible(), `${label} no mostró el artículo CRM.`);
  const domainGuideLink = page.locator(".learn-guide-list").getByRole("link", { name: "Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos", exact: true });
  assert(await domainGuideLink.isVisible(), `${label} no muestra la guía de dominio en el catálogo.`);
  assert((await domainGuideLink.getAttribute("href")) === "/aprende/dominio-hosting-sitio-web-como-funcionan", `${label} el artículo de dominio no enlaza su ruta estable.`);
  for (const [slug, title, category] of [
    ["https-certificados-tls-que-protegen-y-que-no", "HTTPS y certificados TLS: qué protegen y qué no", "Tecnología explicada"],
    ["analitica-web-que-medir-en-tu-negocio", "Analítica web básica: qué debes medir en tu negocio", "Tecnología explicada"],
    ["conectar-herramientas-digitales-sin-complicar-tu-negocio", "Cómo conectar herramientas digitales sin complicar tu negocio", "Tecnología explicada"],
    ["perfil-empresa-google-completar-y-mantener-actualizado", "Tu Perfil de Empresa en Google: qué completar y mantener actualizado", "Negocios digitales"],
    ["organizar-consultas-mensajes-llamadas-formularios", "Cómo organizar mensajes, llamadas y formularios sin perder consultas", "CRM y clientes"],
    ["preparar-respuestas-publicaciones-ia-sin-perder-control", "Cómo utilizar IA para preparar respuestas y publicaciones sin perder el control", "Inteligencia Artificial"],
  ]) {
    const link = page.locator(".learn-guide-list").getByRole("link", { name: title, exact: true });
    assert(await link.isVisible(), `${label} no muestra «${title}» en el catálogo.`);
    assert((await link.getAttribute("href")) === `/aprende/${slug}`, `${label} el artículo no enlaza su slug estable: ${slug}.`);
    assert(await page.locator(".learn-guide__topic").filter({ hasText: category }).count() > 0, `${label} no muestra la categoría ${category}.`);
  }
  assert(await page.locator(".learn-discovery__chip").filter({ hasText: "Tecnología explicada" }).count() === 1, `${label} falta el filtro Tecnología explicada.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Hacer una pregunta" }).getAttribute("href") === "/contacto", `${label} CTA de Contacto incorrecto.`);
  const articleLink = page.locator(".learn-guide__action").first();
  assert((await articleLink.getAttribute("href"))?.startsWith("/aprende/"), `${label} tarjeta no enlazó artículo.`);
  await page.getByRole("link", { name: "Hacer diagnóstico" }).first().focus();
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  if (width === 320) {
    const searchInput = await page.getByRole("searchbox", { name: "Buscar en las guías" }).boundingBox();
    const searchButton = await page.getByRole("button", { name: "Buscar", exact: true }).boundingBox();
    assert(searchInput && searchButton && searchButton.y >= searchInput.y + searchInput.height, `${label} el formulario del hero no apila campo y botón.`);
  }
  await assertNoOverflow(page, label);

  if (width === 390) {
    const searchInput = page.getByRole("searchbox", { name: "Buscar en las guías" });
    await searchInput.focus();
    await searchInput.press("Tab");
    const searchButton = page.getByRole("button", { name: "Buscar", exact: true });
    assert(await searchButton.evaluate((element) => document.activeElement === element && getComputedStyle(element).outlineStyle !== "none"), `${label} el botón de búsqueda no muestra foco de teclado.`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert(await page.locator(".learn-atlas__map img").evaluate((element) => getComputedStyle(element).animationName === "none"), `${label} la ilustración no respeta reduced motion.`);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await searchInput.fill("analitica");
    await searchButton.click();
    assert(new URL(page.url()).hash === "#guias", `${label} enviar la búsqueda no conservó el ancla de resultados.`);
    assert(await page.locator("#guias").evaluate((element) => element.getBoundingClientRect().top < window.innerHeight), `${label} los resultados quedaron fuera del viewport tras buscar.`);
    assert(await page.locator(".learn-guide-list > li").count() === 1, `${label} la búsqueda con resultados no redujo el catálogo a una guía.`);
    assert(await page.locator(".learn-guide-list").getByRole("heading", { name: "Analítica web básica: qué debes medir en tu negocio", exact: true }).isVisible(), `${label} la búsqueda no encontró Analítica web.`);
    await page.getByRole("searchbox", { name: "Buscar en las guías" }).fill("sincoincidencia-ui-pilot");
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    assert(await page.locator(".learn-guide-list").count() === 0, `${label} el estado sin resultados muestra guías.`);
    assert(await page.getByRole("heading", { name: "No encontramos guías con esos criterios." }).isVisible(), `${label} falta el mensaje sin resultados.`);
    await page.getByRole("link", { name: "Ver todas las guías" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".learn-guide-list > li").length === 38);
    assert(await page.locator(".learn-guide-list > li").count() === 38, `${label} la recuperación no restableció todas las guías.`);
    await page.locator(".learn-discovery__chip").filter({ hasText: "Tecnología explicada" }).click();
    await page.waitForFunction(() => document.querySelector(".learn-discovery__chip[aria-current=page]")?.textContent === "Tecnología explicada");
    assert(await page.locator(".learn-discovery__chip[aria-current='page']").textContent() === "Tecnología explicada", `${label} el filtro no indica el tema seleccionado.`);
    assert(await page.locator(".learn-guide-list > li").count() > 0 && await page.locator(".learn-guide-list > li").count() < 38, `${label} el filtro de tema no reduce el catálogo.`);
    await page.locator(".learn-discovery__chip").filter({ hasText: "Todas" }).click();
    await page.waitForFunction(() => document.querySelectorAll(".learn-guide-list > li").length === 38);
    assert(await page.locator(".learn-guide-list > li").count() === 38, `${label} quitar el filtro no recuperó todas las guías.`);

    await page.goto(new URL("/aprende?q=analitica&tema=Tecnología+explicada", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    const activeSearch = new URL(page.url()).search;
    assert(await page.locator(".learn-guide-list > li").count() === 1, `${label} la URL combinada de búsqueda y tema no conserva su resultado.`);
    for (const [linkName, expectedHash] of [["Seguir un itinerario", "#itinerarios"], ["Explorar temas", "#temas"]]) {
      await page.locator(".learn-atlas__jump").getByRole("link", { name: linkName }).click();
      const destination = new URL(page.url());
      assert(destination.search === activeSearch && destination.hash === expectedHash, `${label} el salto «${linkName}» perdió los filtros activos.`);
      assert(await page.locator(".learn-guide-list > li").count() === 1, `${label} el salto «${linkName}» restableció el catálogo filtrado.`);
    }
    await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  }

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
  const crmTocLinks = page.locator(".learn-article-toc a");
  assert(await crmTocLinks.count() > 0, `${label} el índice de CRM está vacío.`);
  for (const href of await crmTocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice de CRM apunta a una sección inexistente: ${href}`);
  }
  assert(await page.getByRole("link", { name: /Revisar mi punto de partida digital|Explorar si IA tiene sentido|Hablar sobre un proceso/i }).count() > 0, `${label} artículo no muestra CTA contextual.`);
  assert(await page.getByText("Ejemplo hipotético", { exact: true }).isVisible(), `${label} la guía CRM no identifica explícitamente su ejemplo hipotético.`);
  assert(await page.getByRole("heading", { name: "De consulta a próximo paso: un ejemplo hipotético" }).isVisible(), `${label} la guía CRM no presenta su ejemplo práctico.`);
  assert(await page.getByRole("heading", { name: "Una rutina sencilla de seguimiento" }).isVisible(), `${label} la guía CRM no presenta una rutina aplicable.`);
  assert(await page.getByRole("heading", { name: "Fuentes y orientación adicional" }).isVisible(), `${label} la guía CRM no presenta sus referencias.`);
  const crmImage = page.locator(".learn-article-image");
  assert((await crmImage.getAttribute("alt"))?.trim().length > 0, `${label} la ilustración de CRM no tiene texto alternativo.`);
  assert(await crmImage.evaluate((image) => image.complete && image.naturalWidth > 0), `${label} no cargó el diagrama de CRM.`);
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
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com/aprende/${aiSlug}`, `${label} cambió el canonical de IA.`);
  const aiImage = page.locator(".learn-article-image");
  assert((await aiImage.getAttribute("alt"))?.trim().length > 0, `${label} la ilustración de IA no tiene texto alternativo.`);
  assert(await aiImage.evaluate((image) => image.complete && image.naturalWidth > 0), `${label} no cargó el diagrama de IA.`);
  const aiTocLinks = page.locator(".learn-article-toc a");
  assert(await aiTocLinks.count() > 0, `${label} el índice de IA está vacío.`);
  for (const href of await aiTocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice de IA apunta a una sección inexistente: ${href}`);
  }
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
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com/aprende/${automationSlug}`, `${label} cambió el canonical de Automatización.`);
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
  ]) assert(await page.locator("h2").filter({ hasText: heading }).isVisible(), `${label} falta la sección «${heading}».`);
  assert(await page.locator(".learn-block--example").count() >= 2, `${label} faltan ejemplos operativos y comerciales.`);
  assert(await page.locator(".learn-block--steps ol").count() >= 3, `${label} faltan pasos para documentar y probar.`);
  assert(await page.locator(".learn-block--faq details").count() >= 6, `${label} faltan preguntas frecuentes.`);
  assert(await page.getByRole("link", { name: "NIST Privacy Framework" }).isVisible(), `${label} no renderizó las fuentes como enlaces.`);
  assert(await page.getByRole("link", { name: "Consultar servicios" }).getAttribute("href") === "/servicios", `${label} el CTA de Automatización no dirige a Servicios.`);
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
  assert(await page.locator('meta[name="description"]').getAttribute("content") === "Una persona escribe la dirección de tu negocio y aparece tu página. ¿Cómo sucede eso? Te explicamos el dominio, el alojamiento y la conexión entre ambos sin enredos.", `${label} description individual del artículo de dominio incorrecta.`);
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

  const presenceSlug = "antes-de-hacer-publicidad-organiza-tu-presencia-digital";
  await page.goto(new URL(`/aprende/${presenceSlug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert((await page.locator("h1").textContent())?.trim() === "Antes de hacer publicidad, organiza tu presencia digital", `${label} cambió el título de Presencia Digital.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com/aprende/${presenceSlug}`, `${label} cambió el canonical de Presencia Digital.`);
  assert(await page.getByText("Por Yoan Ortiz").isVisible(), `${label} cambió la autoría de Presencia Digital.`);
  for (const heading of [
    "Qué significa tener presencia digital",
    "Antes de elegir canales: define tu negocio con claridad",
    "Organiza la información comercial básica",
    "Qué canales convienen según el negocio",
    "Sitio web, perfil de empresa y redes sociales",
    "Mantén los mismos datos en todos los canales",
    "Facilita que te encuentren y se comuniquen",
    "Confianza sin reseñas o testimonios inventados",
    "Accesibilidad, privacidad y seguridad básicas",
    "Ejemplo hipotético: un taller local que considera anunciarse",
    "Presencia orgánica y publicidad pagada",
    "Qué revisar antes de Google Ads o Meta Ads",
    "Prepara una página de destino y una acción clara",
    "Indicadores básicos que sí ayudan a aprender",
    "Problemas que la publicidad no resuelve",
    "Cuándo puede tener sentido probar anuncios",
    "Si todavía no necesitas anuncios",
    "Cómo se relaciona esta guía con Vecidya",
    "Checklist para revisar tu presencia digital",
    "Preguntas frecuentes",
    "Fuentes oficiales y alcance",
    "Qué hacer ahora",
  ]) assert(await page.locator("h2").filter({ hasText: heading }).isVisible(), `${label} falta la sección «${heading}».`);
  const presenceImage = page.locator(".learn-article-image");
  assert((await presenceImage.getAttribute("alt"))?.includes("sitio web"), `${label} la ilustración de Presencia no describe sus canales.`);
  assert(await presenceImage.evaluate((image) => image.complete && image.naturalWidth > 0), `${label} no cargó diagram-presence-digital.svg.`);
  assert(await page.locator(".learn-block--example").count() === 1, `${label} el ejemplo de Presencia no se renderizó como un caso hipotético.`);
  assert(await page.locator(".learn-block--steps ol").count() >= 3, `${label} faltan pasos prácticos para organizar y evaluar.`);
  assert(await page.locator(".learn-block--faq details").count() >= 10, `${label} faltan respuestas frecuentes de Presencia y Vecidya.`);
  assert(await page.locator(".learn-block--sources a").count() >= 7, `${label} faltan fuentes oficiales enlazadas.`);
  const tocViewport = await page.locator(".learn-article-toc").evaluate((toc) => ({ height: toc.getBoundingClientRect().height, maxHeight: getComputedStyle(toc).maxHeight, overflowY: getComputedStyle(toc).overflowY }));
  if (page.viewportSize().width > 820) {
    assert(tocViewport.overflowY === "auto" && tocViewport.height < page.viewportSize().height, `${label} el índice extenso de Presencia debe poder desplazarse dentro del viewport.`);
  } else {
    assert(tocViewport.maxHeight === "none" && tocViewport.overflowY === "visible", `${label} el índice móvil no debe crear un contenedor anidado desplazable.`);
  }
  assert(await page.getByRole("link", { name: "Conocer el Diagnóstico" }).getAttribute("href") === "/diagnostico", `${label} el CTA contextual de Presencia no enlaza al Diagnóstico.`);
  const checklistHeading = page.getByRole("heading", { name: "Checklist para revisar tu presencia digital" });
  assert(await checklistHeading.isVisible(), `${label} falta el checklist práctico.`);
  const checklistText = await checklistHeading.locator("..") .textContent();
  for (const topic of [/nombre e identidad/i, /oferta y p[uú]blico/i, /zona de servicio/i, /horarios/i, /contacto/i, /coherencia/i, /experiencia m[oó]vil/i, /accesibilidad b[aá]sica/i, /privacidad y seguridad/i, /responsable/i, /medici[oó]n proporcional/i]) {
    assert(topic.test(checklistText ?? ""), `${label} el checklist no cubre ${topic}.`);
  }
  const presenceFaq = page.getByText("¿La publicidad aumenta las ventas?", { exact: true });
  assert(await presenceFaq.isVisible(), `${label} falta FAQ que matiza los resultados publicitarios.`);
  await presenceFaq.click();
  assert(await page.getByText(/No se puede asegurar/i).isVisible(), `${label} la FAQ presenta ventas como resultado garantizado.`);
  await assertNoOverflow(page, `${label} artículo Presencia Digital`);

  const guides = [
    {
      slug: "https-certificados-tls-que-protegen-y-que-no",
      title: "HTTPS y certificados TLS: qué protegen y qué no",
      heading: "Qué demuestra —y qué no— el certificado",
      source: "Transport Layer Security (TLS) — MDN Web Docs",
      image: "/assets/learn/diagram-domain-dns-hosting.svg",
      category: "Tecnología explicada",
    },
    {
      slug: "analitica-web-que-medir-en-tu-negocio",
      title: "Analítica web básica: qué debes medir en tu negocio",
      heading: "Visitas, interacciones y conversiones no son lo mismo",
      source: "About events — Google Analytics Help",
      image: "/assets/learn/diagram-analytics.svg",
      category: "Tecnología explicada",
    },
    {
      slug: "conectar-herramientas-digitales-sin-complicar-tu-negocio",
      title: "Cómo conectar herramientas digitales sin complicar tu negocio",
      heading: "API, webhook y CSV: tres formas diferentes de intercambiar datos",
      source: "RFC 4180: Common Format and MIME Type for CSV Files",
      image: "/assets/learn/diagram-integrations.svg",
      category: "Tecnología explicada",
      category: "Tecnología explicada",
    },
    {
      slug: "perfil-empresa-google-completar-y-mantener-actualizado",
      title: "Tu Perfil de Empresa en Google: qué completar y mantener actualizado",
      heading: "Qué es y quién puede utilizar un perfil",
      source: "Guidelines for representing your business on Google — Google Business Profile Help",
      image: "/assets/learn/diagram-presence-digital.svg",
      category: "Negocios digitales",
    },
    {
      slug: "organizar-consultas-mensajes-llamadas-formularios",
      title: "Cómo organizar mensajes, llamadas y formularios sin perder consultas",
      heading: "Usa un registro común sin importar el canal",
      source: "NIST Privacy Framework",
      image: "/assets/learn/diagram-crm.svg",
      category: "CRM y clientes",
    },
    {
      slug: "preparar-respuestas-publicaciones-ia-sin-perder-control",
      title: "Cómo utilizar IA para preparar respuestas y publicaciones sin perder el control",
      heading: "Dos instrucciones que puedes adaptar",
      source: "Prompt engineering — OpenAI API Guide",
      image: "/assets/learn/diagram-ai.svg",
      category: "Inteligencia Artificial",
    },
  ];
  for (const guide of guides) {
    await page.goto(new URL(`/aprende/${guide.slug}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
    assert((await page.locator("h1").textContent())?.trim() === guide.title, `${label} H1 incorrecto para ${guide.slug}.`);
    assert((await page.title()).startsWith(guide.title), `${label} title incorrecto para ${guide.slug}.`);
    assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com/aprende/${guide.slug}`, `${label} canonical incorrecto para ${guide.slug}.`);
    assert(await page.locator('meta[property="article:section"]').getAttribute("content") === guide.category, `${label} categoría de metadatos incorrecta para ${guide.slug}.`);
    assert(await page.locator('meta[name="description"]').count() === 1, `${label} falta descripción para ${guide.slug}.`);
    assert(await page.getByRole("heading", { name: guide.heading, exact: true }).isVisible(), `${label} falta contenido de ${guide.slug}.`);
    assert(await page.getByRole("link", { name: guide.source, exact: true }).isVisible(), `${label} falta la fuente oficial de ${guide.slug}.`);
    const image = page.locator(".learn-article-image");
    assert((await image.getAttribute("src"))?.endsWith(guide.image), `${label} imagen incorrecta para ${guide.slug}.`);
    assert((await image.getAttribute("alt"))?.trim().length > 0, `${label} falta texto alternativo en ${guide.slug}.`);
    assert(await image.evaluate((element) => element.complete && element.naturalWidth > 0), `${label} no cargó la ilustración de ${guide.slug}.`);
    const tocLinks = page.locator(".learn-article-toc a");
    assert(await tocLinks.count() > 0, `${label} el índice está vacío en ${guide.slug}.`);
    for (const href of await tocLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
      assert(href?.startsWith("#section-") && await page.locator(href).count() === 1, `${label} índice apunta a una sección inexistente en ${guide.slug}: ${href}`);
    }
    assert(await page.locator(".learn-block--definitions dl").count() > 0, `${label} faltan definiciones semánticas en ${guide.slug}.`);
    assert(await page.locator(".learn-block--steps ol").count() > 0, `${label} faltan pasos numerados en ${guide.slug}.`);
    assert(await page.locator(".learn-block--example").count() > 0, `${label} falta el ejemplo hipotético de ${guide.slug}.`);
    await assertNoOverflow(page, `${label} artículo ${guide.slug}`);
  }

  const learnSitemap = await page.request.get(new URL("/sitemap.xml", baseUrl).toString());
  assert(learnSitemap.ok(), `${label} no cargó sitemap.xml.`);
  const learnSitemapXml = await learnSitemap.text();
  for (const { slug } of guides) assert(learnSitemapXml.includes(`/aprende/${slug}`), `${label} el sitemap no incluye ${slug}.`);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [1024, 900], [768, 900], [390, 844], [360, 800], [320, 740]]) {
  await runViewport(width, height);
}

console.log("PASS: Aprende verificó catálogo, filtros, borradores, estados de búsqueda, once guías, categorías, autoría, CTAs, metadata, sitemap, keyboard focus y responsive 1366/1024/768/390/360/320.");
