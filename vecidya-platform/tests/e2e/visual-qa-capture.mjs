import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:5180";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baseUrl)) throw new Error(`Capturas locales solamente; URL rechazada: ${baseUrl}`);
const access = JSON.parse(readFileSync(".wrangler/visual-qa-demo/demo-access.json", "utf8"));
const outputDirectory = process.env.VISUAL_OUTPUT_DIRECTORY ?? ".playwright-mcp/visual-qa/current";
const widths = [320, 360, 390, 768, 980, 1024, 1366, 1920];
const comparisonWidths = [320, 390, 1366, 1920];
const keyRoutes = new Set(["/", "/vecindario", "/privacidad", "/terminos", "/cookies", "/informacion-legal", "/app", "/app/miniweb", "/app/internal", "/app/internal/services"]);
const publicRoutes = [
  "/", "/sobre-nosotros", "/vecindario", "/licencias", "/addons", "/servicios", "/unete", "/contacto",
  "/diagnostico", "/diagnostico/metodologia", "/aprende", "/privacidad", "/cookies", "/terminos", "/informacion-legal", "/login",
  new URL(access.organizations[0].publicUrl).pathname,
];
const clientRoutes = ["/app", "/app/business-profile", "/app/miniweb", "/app/services", "/app/organization", "/app/training", "/app/account"];
const adminRoutes = ["/app/internal", "/app/internal/organizations", "/app/internal/licenses", "/app/internal/services", "/app/internal/businesses", "/app/internal/audit", "/app/internal/integrations"];
const results = [];
mkdirSync(outputDirectory, { recursive: true });
const health = await fetch(new URL("/api/auth/ok", baseUrl));
if (!health.ok) throw new Error(`El Worker local no está listo: ${health.status}`);
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });

async function stabilize(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await Promise.race([page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  }), page.waitForTimeout(3000)]);
  await page.waitForTimeout(120);
}

function installObservers(page) {
  const errors = [];
  const failedRequests = [];
  const externalRequests = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "failed"}`));
  page.on("request", (request) => { if (new URL(request.url()).hostname !== new URL(baseUrl).hostname) externalRequests.add(request.url()); });
  return { errors, failedRequests, externalRequests };
}

async function captureRoute(page, area, route, width, role) {
  const viewportHeight = width < 500 ? 844 : 960;
  await page.setViewportSize({ width, height: viewportHeight });
  let response;
  let failure = null;
  try {
    response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(150);
    await stabilize(page);
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    title: document.title,
    heading: document.querySelector("h1")?.textContent?.trim() ?? null,
  })).catch(() => ({ width, documentWidth: null, horizontalOverflow: null, title: null, heading: null }));
  const file = `${area}-${route.replace(/^\//, "root").replaceAll("/", "-") || "root"}-${width}.png`;
  const fullPage = keyRoutes.has(route) || route.startsWith("/vecindario/");
  await page.screenshot({ path: join(outputDirectory, file), fullPage }).catch(() => undefined);
  const state = { area, route, role, width, status: response?.status() ?? null, finalUrl: page.url(), screenshot: file, failure, ...layout };
  results.push(state);
  return state;
}

async function login(context, identity) {
  const page = await context.newPage();
  const observers = installObservers(page);
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await page.getByLabel(/Correo electrónico/i).fill(identity.email);
  await page.getByLabel(/Contraseña/i).fill(identity.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/app(?:$|\/)/, { timeout: 15000 });
  return { page, observers };
}

try {
  const publicContext = await browser.newContext({ viewport: { width: 1366, height: 960 }, deviceScaleFactor: 1, locale: "es-CO", timezoneId: "America/Bogota" });
  const publicPage = await publicContext.newPage();
  const publicObservers = installObservers(publicPage);
  for (const width of [390, 1366]) {
    await publicPage.setViewportSize({ width, height: width < 500 ? 844 : 960 });
    await publicPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await stabilize(publicPage);
    const file = `cookie-consent-initial-${width}.png`;
    await publicPage.screenshot({ path: join(outputDirectory, file), fullPage: true });
    results.push({ area: "cookie-consent", route: "/", role: "anonymous", width, status: 200, screenshot: file, state: "undecided" });
  }
  const consentPanel = publicPage.getByRole("region", { name: "Preferencias de cookies" });
  if (await consentPanel.count()) {
    await publicPage.getByRole("button", { name: "Rechazar opcionales" }).click();
    await consentPanel.waitFor({ state: "hidden" });
  }
  for (const route of publicRoutes) {
    const selectedWidths = keyRoutes.has(route) ? comparisonWidths : [390, 1366];
    for (const width of selectedWidths) await captureRoute(publicPage, "public", route, width, "anonymous");
  }
  const demoPath = new URL(access.organizations[0].publicUrl).pathname;
  for (const width of comparisonWidths) await captureRoute(publicPage, "miniweb-public", demoPath, width, "anonymous");
  console.log(`Captura pública terminada (${publicRoutes.length + widths.length} pantallas).`);
  const publicState = { cookieConsent: "rechazo de opcionales; necesario únicamente", consoleErrors: publicObservers.errors, requestFailures: publicObservers.failedRequests, externalRequests: [...publicObservers.externalRequests] };
  writeFileSync(join(outputDirectory, "public-manifest.json"), `${JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl, captures: results, ...publicState }, null, 2)}\n`);
  await publicContext.close();

  const ownerContext = await browser.newContext({ viewport: { width: 1366, height: 960 }, deviceScaleFactor: 1, locale: "es-CO", timezoneId: "America/Bogota" });
  const owner = await login(ownerContext, access.owner);
  for (const route of clientRoutes) {
    for (const width of keyRoutes.has(route) || route === "/app/business-profile" ? comparisonWidths : [390, 1366]) {
      await captureRoute(owner.page, "client", route, width, "owner");
    }
  }
  const editorSteps = ["1 Diseño", "2 Secciones", "3 Contenido", "4 Vista previa", "5 Publicar"];
  await owner.page.goto(new URL("/app/miniweb", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const [index, label] of editorSteps.entries()) {
    await owner.page.getByRole("button", { name: new RegExp(label) }).click();
    for (const width of [390, 1366]) {
      await owner.page.setViewportSize({ width, height: width < 500 ? 844 : 960 });
      await stabilize(owner.page);
      await owner.page.screenshot({ path: join(outputDirectory, `editor-step-${index + 1}-${width}.png`), fullPage: true });
      results.push({ area: "editor-step", route: "/app/miniweb", role: "owner", width, status: 200, screenshot: `editor-step-${index + 1}-${width}.png`, step: label });
    }
  }
  const ownerState = { consoleErrors: owner.observers.errors, requestFailures: owner.observers.failedRequests, externalRequests: [...owner.observers.externalRequests] };
  console.log("Captura del área de cliente terminada.");
  await ownerContext.close();

  const adminContext = await browser.newContext({ viewport: { width: 1366, height: 960 }, deviceScaleFactor: 1, locale: "es-CO", timezoneId: "America/Bogota" });
  const admin = await login(adminContext, access.platformAdmin);
  for (const route of adminRoutes) {
    for (const width of route === "/app/internal" || route === "/app/internal/services" ? comparisonWidths : [390, 1366]) {
      await captureRoute(admin.page, "internal", route, width, "platform_admin");
    }
  }
  const adminState = { consoleErrors: admin.observers.errors, requestFailures: admin.observers.failedRequests, externalRequests: [...admin.observers.externalRequests] };
  console.log("Captura interna terminada.");
  await adminContext.close();

  const manifest = { capturedAt: new Date().toISOString(), baseUrl, viewportWidths: widths, public: publicState, owner: ownerState, admin: adminState, captures: results };
  writeFileSync(join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ captures: results.length, overflowCount: results.filter((result) => result.horizontalOverflow).length, httpFailures: results.filter((result) => result.status && result.status >= 400).map(({ route, status }) => ({ route, status })), publicErrors: publicState.consoleErrors.length, ownerErrors: ownerState.consoleErrors.length, adminErrors: adminState.consoleErrors.length, externalRequests: new Set([...publicState.externalRequests, ...ownerState.externalRequests, ...adminState.externalRequests]).size, outputDirectory }, null, 2));
} finally {
  await browser.close();
}
