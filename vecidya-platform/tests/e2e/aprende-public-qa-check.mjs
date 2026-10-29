import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { learnArticles, learnCategories, learnPathways } from "../../app/content/learn.ts";
import { getLearnGuideAccess, getPublicLearnArticles, getPublicLearnPathways } from "../../app/content/learn-publication.ts";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

// APRENDE-PUBLIC-QA-01 runs only against a loopback dev server. It does not
// create accounts, mutate D1, change editorial approval or access production.
assertLocalBaseUrl();

const output = join(process.cwd(), "test-results", "aprende-public-qa");
mkdirSync(output, { recursive: true });
const results = {
  checkpoint: "APRENDE-PUBLIC-QA-01",
  target: baseUrl,
  catalog: {},
  viewports: [],
  checkedPublishedSlugs: [],
  checkedDraftSlugs: [],
  checks: [],
  failures: [],
  note: "Playwright checks automate behavior and screenshots; a person must still review visual quality.",
};
const check = (name) => results.checks.push(name);
const publicArticles = getPublicLearnArticles(learnArticles);
const drafts = learnArticles.filter((article) => article.editorialDraft === true);
const publicSlugs = new Set(publicArticles.map((article) => article.slug));
const draftSlugs = new Set(drafts.map((article) => article.slug));

assert.equal(learnArticles.length, 48, "El catálogo editorial cambió: revisar el contrato de publicación.");
assert.equal(publicArticles.length, 48, "Las 48 guías aprobadas deben estar disponibles.");
assert.equal(drafts.length, 0, "El catálogo debe tener los 48 artículos aprobados.");
assert.equal(learnCategories.length, 6);
assert.equal(learnPathways.length, 9);
assert.equal(new Set(learnArticles.map((item) => item.slug)).size, 48);
const publicPaths = getPublicLearnPathways(learnPathways, learnArticles);
assert.equal(publicPaths.length, 9, "Los nueve itinerarios aprobados deben estar visibles.");
for (const pathway of publicPaths) {
  assert(pathway.slugs.length >= 3, "Itinerario público demasiado corto: " + pathway.title);
  for (const slug of pathway.slugs) assert(publicSlugs.has(slug) && !draftSlugs.has(slug));
}
for (const article of learnArticles) {
  assert(article.image.startsWith("/assets/"), "Imagen no local: " + article.slug);
  assert(existsSync(join(process.cwd(), "public", article.image.slice(1))), "Imagen inexistente: " + article.image);
}
results.catalog = { articles: learnArticles.length, public: publicArticles.length, drafts: drafts.length, categories: learnCategories.length, editorialPathways: learnPathways.length, visiblePathways: publicPaths.length };
check("Catálogo aprobado, imágenes y nueve itinerarios editoriales");

async function get(path) {
  const res = await fetch(new URL(path, baseUrl), { redirect: "manual", headers: { "user-agent": "Vecidya-Aprende-Public-QA/1" } });
  return { status: res.status, type: res.headers.get("content-type") ?? "", body: await res.text() };
}
function noDraftLinks(html, context) {
  for (const slug of draftSlugs) {
    assert(!html.includes('href="/aprende/' + slug + '"'), context + " enlaza el borrador " + slug);
    assert(!html.includes('href="https://vecidya.com/aprende/' + slug + '"'), context + " enlaza el borrador " + slug);
  }
}
async function noHorizontalOverflow(page, context) {
  const width = await page.evaluate(() => ({
    available: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert(width.scroll <= width.available + 1 && width.body <= width.available + 1, context + " tiene desbordamiento horizontal: " + JSON.stringify(width));
}
function siteCanonical(body, slug) {
  // In SSR the link attribute order may differ, so verify via the browser on
  // sampled pages and only require the expected URL in the other HTTP pages.
  assert(body.includes("https://vecidya.com/aprende/" + slug), "Canonical ausente: " + slug);
}
function visibleLinks(page) {
  return page.locator(".learn-guide-list h3 a");
}
function assertAllVisibleLinksPublished(links, context) {
  for (const path of links) {
    assert(path?.startsWith("/aprende/"), context + ": enlace de guía incorrecto " + path);
    const slug = path.slice("/aprende/".length).split(/[?#]/, 1)[0];
    assert(publicSlugs.has(slug), context + ": se expone slug no publicado " + slug);
  }
}

const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ?? (process.platform === "win32" && existsSync("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe")
    ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    : undefined);
const browser = await chromium.launch({ headless: true, ...(systemChromium ? { executablePath: systemChromium } : {}) });
let activePage;
try {
  const listing = await get("/aprende");
  assert.equal(listing.status, 200, "El listado de Aprende no responde 200.");
  noDraftLinks(listing.body, "SSR del listado");
  assert(listing.body.includes("https://vecidya.com/aprende"), "Canonical del listado no encontrada.");
  check("SSR público del catálogo aprobado sin artículos retenidos");

  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.status, 200, "No se pudo consultar el sitemap local.");
  assert(sitemap.type.includes("xml"), "Tipo MIME incorrecto para sitemap.");
  assert(sitemap.body.includes("<urlset"), "Sitemap no contiene XML de URLs.");
  for (const article of publicArticles) {
    const url = "https://vecidya.com/aprende/" + article.slug;
    assert(sitemap.body.includes("<loc>" + url + "</loc>"), "Falta URL publicada en sitemap: " + url);
  }
  for (const draft of drafts) {
    assert(!sitemap.body.includes("https://vecidya.com/aprende/" + draft.slug + "<"), "Sitemap expone un borrador: " + draft.slug);
  }
  const robots = await get("/robots.txt");
  assert.equal(robots.status, 200);
  assert(robots.body.includes("Sitemap: https://vecidya.com/sitemap.xml"));
  check("Sitemap/robots: 48 guías públicas y 0 borradores");

  for (const article of publicArticles) {
    const response = await get("/aprende/" + article.slug);
    assert.equal(response.status, 200, "Guía pública inaccesible: " + article.slug);
    siteCanonical(response.body, article.slug);
    noDraftLinks(response.body, "Detalle " + article.slug);
    results.checkedPublishedSlugs.push(article.slug);
  }
  check("HTTP: 48 artículos aprobados responden 200; no quedan borradores");

  for (const width of [320, 390, 768, 1366]) {
    activePage = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const pageErrors = [];
    activePage.on("pageerror", (error) => pageErrors.push(error.message));
    await activePage.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await activePage.locator(".learn-guide-list > li").first().waitFor();
    assert.equal(await activePage.locator("main h1").count(), 1, width + "px: H1 duplicado.");
    assert.equal(await activePage.locator(".learn-guide-list > li").count(), 48, width + "px: deben verse 48 guías.");
    assert.equal(await activePage.locator(".learn-topic-list > li").count(), 6, width + "px: temas incorrectos.");
    assert.equal(await activePage.locator(".learn-path-list > li").count(), publicPaths.length, width + "px: itinerarios públicos incorrectos.");
    assert.equal(await activePage.locator(".learn-guide__topic span").count(), 48, width + "px: cada guía debe explicar su tipo de acceso.");
    assert.equal(await activePage.getByText("En revisión editorial", { exact: true }).count(), 0, width + "px: no deben mostrarse etiquetas de revisión en guías aprobadas.");
    const listingHrefs = await visibleLinks(activePage).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    assertAllVisibleLinksPublished(listingHrefs, width + "px listado");
    const pathwayHrefs = await activePage.locator(".learn-path__guides a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    assertAllVisibleLinksPublished(pathwayHrefs, width + "px itinerarios");
    assert(await activePage.getByRole("searchbox", { name: "Buscar en las guías" }).isVisible());
    assert(await activePage.getByRole("button", { name: "Buscar", exact: true }).isVisible());
    assert(await activePage.locator(".learn-atlas__map img").evaluate(async (image) => {
      await image.decode().catch(() => {});
      return image.naturalWidth > 0;
    }), width + "px: no carga la ilustración.");
    await noHorizontalOverflow(activePage, width + "px listado");
    assert.deepEqual(pageErrors, [], width + "px: errores JavaScript.");
    if (width === 320 || width === 390 || width === 1366) {
      await activePage.screenshot({ path: join(output, "aprende-listado-" + width + ".png"), fullPage: true, animations: "disabled" });
    }
    results.viewports.push({ width, listing: "pass", guides: listingHrefs.length, pathways: publicPaths.length });

    if (width === 390) {
      const search = activePage.getByRole("searchbox", { name: "Buscar en las guías" });
      await search.fill("analitica");
      await activePage.getByRole("button", { name: "Buscar", exact: true }).click();
      await activePage.waitForURL(/q=analitica/);
      assert(await activePage.locator('meta[name="robots"][content="noindex, follow"]').count() === 1, "Los resultados filtrados deben ser noindex.");
      const hrefs = await visibleLinks(activePage).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      assert(hrefs.includes("/aprende/analitica-web-que-medir-en-tu-negocio"), "Búsqueda sin acentos no encontró Analítica.");
      assertAllVisibleLinksPublished(hrefs, "búsqueda");
      await search.fill("sin-coincidencia-qa-public-9005");
      await activePage.getByRole("button", { name: "Buscar", exact: true }).click();
      assert(await activePage.getByRole("heading", { name: "No encontramos guías con esos criterios." }).isVisible(), "Falta estado vacío.");
      assert.equal(await activePage.locator(".learn-guide-list > li").count(), 0);
      await activePage.getByRole("link", { name: "Ver todas las guías" }).click();
      await activePage.locator(".learn-guide-list > li").first().waitFor();
      assert.equal(await activePage.locator(".learn-guide-list > li").count(), 48, "No se recuperó el catálogo después de limpiar la búsqueda.");
      await activePage.locator(".learn-discovery__chip").filter({ hasText: "CRM y clientes" }).click();
      // React Router updates the loader asynchronously; wait for the committed
      // category and its actual result count before inspecting rendered links.
      await activePage.locator('.learn-discovery__chip[aria-current="page"]').filter({ hasText: "CRM y clientes" }).waitFor({ state: "visible" });
      await activePage.waitForFunction(() => {
        const count = document.querySelectorAll(".learn-guide-list > li").length;
        return count > 0 && count < 48;
      });
      const filtered = await visibleLinks(activePage).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      assert(filtered.length > 0 && filtered.length < 48, "El filtro de categoría no funciona.");
      assertAllVisibleLinksPublished(filtered, "filtro CRM");
      await activePage.getByRole("link", { name: "Con licencia", exact: true }).click();
      await activePage.waitForURL(/acceso=licencia/);
      const expectedLicensedCrm = publicArticles
        .filter((article) => article.category === "CRM y clientes" && getLearnGuideAccess(article.slug) === "licensed")
        .map((article) => `/aprende/${article.slug}`);
      await activePage.locator('.learn-discovery__chip[aria-current="page"]').filter({ hasText: "Con licencia" }).waitFor();
      await activePage.waitForFunction((count) => document.querySelectorAll(".learn-guide h3 a").length === count, expectedLicensedCrm.length);
      const licensedCrm = await activePage.locator(".learn-guide h3 a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      assert.deepEqual(licensedCrm, expectedLicensedCrm, "El filtro de licencia conserva categoría y limita las guías correctamente.");
      await activePage.getByRole("link", { name: "Acceso abierto", exact: true }).click();
      await activePage.waitForURL(/acceso=abierto/);
      const expectedFreeCrm = publicArticles
        .filter((article) => article.category === "CRM y clientes" && getLearnGuideAccess(article.slug) === "always_free")
        .map((article) => `/aprende/${article.slug}`);
      await activePage.locator('.learn-discovery__chip[aria-current="page"]').filter({ hasText: "Acceso abierto" }).waitFor();
      await activePage.waitForFunction((count) => document.querySelectorAll(".learn-guide h3 a").length === count, expectedFreeCrm.length);
      const freeCrm = await activePage.locator(".learn-guide h3 a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      assert.deepEqual(freeCrm, expectedFreeCrm, "El filtro de acceso abierto conserva la categoría.");
      await activePage.locator(".learn-path-list summary").first().click();
      assert(await activePage.locator(".learn-path-list details").first().getAttribute("open") !== null, "No se expande itinerario.");
      check("Búsqueda sin tildes, vacío, recuperación, filtros de categoría/acceso e itinerarios");
    }

    if (width === 390 || width === 1366) {
      const licensedSample = publicArticles.find((article) => getLearnGuideAccess(article.slug) === "licensed");
      assert(licensedSample, "Debe existir al menos una guía licenciada para verificar su preview.");
      await activePage.goto(new URL("/aprende/" + licensedSample.slug, baseUrl).toString(), { waitUntil: "domcontentloaded" });
      assert.equal(await activePage.locator("main h1").textContent(), licensedSample.title);
      assert.equal(await activePage.locator('link[rel="canonical"]').getAttribute("href"), "https://vecidya.com/aprende/" + licensedSample.slug);
      assert.equal(await activePage.locator(".learn-article-preview").count(), 1, "Guía licenciada sin sesión debe mostrar preview.");
      assert.equal(await activePage.locator(".learn-article-toc").count(), 0, "Preview no muestra índice de contenido protegido.");
      assert.equal((await activePage.content()).includes(licensedSample.sections[0].heading), false, "HTML e hidratación no contienen encabezados protegidos.");
      assert(await activePage.getByRole("link", { name: "Ver licencias Vecidya" }).isVisible());
      const signInHref = await activePage.getByRole("link", { name: "Iniciar sesión" }).getAttribute("href");
      assert.equal(signInHref, `/login?redirectTo=${encodeURIComponent(`/aprende/${licensedSample.slug}`)}`, "La sesión conserva el retorno a la guía solicitada.");

      const sample = publicArticles.find((article) => getLearnGuideAccess(article.slug) === "always_free") ?? publicArticles[0];
      await activePage.goto(new URL("/aprende/" + sample.slug, baseUrl).toString(), { waitUntil: "domcontentloaded" });
      assert.equal(await activePage.locator("main h1").textContent(), sample.title);
      assert.equal(await activePage.locator('link[rel="canonical"]').getAttribute("href"), "https://vecidya.com/aprende/" + sample.slug);
      assert.equal(await activePage.locator(".learn-article-toc a").count(), sample.sections.length);
      const toc = await activePage.locator(".learn-article-toc a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      for (const href of toc) assert.equal(await activePage.locator(`[id="${href.slice(1)}"]`).count(), 1, "TOC con ancla rota: " + href);
      const image = activePage.locator(".learn-article-image");
      assert((await image.getAttribute("alt"))?.trim(), "Falta alt descriptivo.");
      assert(await image.evaluate(async (node) => { await node.decode().catch(() => {}); return node.naturalWidth > 0; }), "Imagen de artículo sin cargar.");
      const relatedHrefs = await activePage.locator(".learn-related-card").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
      assertAllVisibleLinksPublished(relatedHrefs, "relacionados");
      const sourceLinks = activePage.locator(".learn-block--sources a");
      assert(await sourceLinks.count() >= 1, "No se muestran fuentes.");
      for (const item of await sourceLinks.evaluateAll((nodes) => nodes.map((node) => ({ href: node.href, target: node.target, rel: node.rel })))) {
        assert(item.href.startsWith("https://") && item.target === "_blank" && item.rel.includes("noopener"), "Fuente insegura: " + item.href);
      }
      await activePage.locator(".learn-article-toc a").first().focus();
      assert(await activePage.locator(".learn-article-toc a").first().evaluate((node) => document.activeElement === node), "El índice no es accesible por teclado.");
      const reviewHeading = activePage.getByRole("heading", { name: "Repaso opcional: comprueba lo aprendido" });
      assert(await reviewHeading.isVisible(), "El repaso se presenta como actividad opcional.");
      const reviewSummary = activePage.locator(".learn-article-review summary").first();
      await reviewSummary.focus();
      await reviewSummary.press("Enter");
      assert(await reviewSummary.locator("xpath=..").getAttribute("open") !== null, "El repaso se puede abrir por teclado.");
      await reviewSummary.press("Space");
      assert(await reviewSummary.locator("xpath=..").getAttribute("open") === null, "El repaso se puede cerrar por teclado.");
      const skipReview = activePage.getByRole("link", { name: "Omitir el repaso y ver otras guías" });
      await skipReview.focus();
      assert(await skipReview.evaluate((node) => document.activeElement === node), "El enlace para omitir el repaso recibe foco de teclado.");
      await skipReview.click();
      assert(await activePage.getByRole("heading", { name: "Otras guías de Aprende Vecidya" }).isVisible(), "Omitir repaso mueve el foco visual a otras guías.");
      await noHorizontalOverflow(activePage, width + "px artículo");
      assert.deepEqual(pageErrors, [], width + "px artículo: error JavaScript.");
      await activePage.screenshot({ path: join(output, "aprende-articulo-" + width + ".png"), fullPage: true, animations: "disabled" });
      check("Artículo, TOC, fuentes, imágenes, CTA y relacionados a " + width + "px");
    }
    await activePage.close();
    activePage = undefined;
  }
  results.status = "PASS";
  console.log("PASS APRENDE-PUBLIC-QA-01: " + JSON.stringify({ catalog: results.catalog, viewports: results.viewports, publicSlugs: results.checkedPublishedSlugs.length, drafts404: results.checkedDraftSlugs.length, checks: results.checks.length }));
} catch (error) {
  results.status = "FAIL";
  results.failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: join(output, "aprende-error.png"), fullPage: true }).catch(() => {});
  }
  console.error("FAIL APRENDE-PUBLIC-QA-01:", error);
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(results, null, 2) + "\n");
}
