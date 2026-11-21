/**
 * UX-CRYSTAL-R4 · Recorrido local interactivo con Playwright.
 * Versión 1.2.0 (2026-11-21). Solo selección de organización activa en sesión QA.
 * Requiere dev:local-demo y seed:local-demo ejecutados previamente.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const baseUrl = "http://127.0.0.1:4173";
const outDir = resolve(".wrangler", "local-demo", "visual-review");
const group = process.argv.find((arg) => arg.startsWith("--area="))?.split("=")[1] ?? "all";
const noHold = process.argv.includes("--no-hold");
const viewports = noHold ? [320, 390, 768, 1366, 1920] : [1366];
const errors = [];
const allowed = new Set(["public", "app", "internal", "all"]);
if (!allowed.has(group)) throw new Error("Usa --area=public|app|internal|all");
mkdirSync(outDir, { recursive: true });

const routes = {
  public: [
    ["inicio", "/"],
    ["servicios", "/servicios"],
    ["vecindario", "/vecindario"],
    ["aprende", "/aprende"],
    ["diagnostico", "/diagnostico"],
  ],
  app: [
    ["app-inicio", "/app"],
    ["mi-negocio", "/app/business-profile"],
    ["editor-miniweb-v2", "/app/miniweb-v2"],
  ],
  internal: [["admin-negocios-permisos", "/app/internal/businesses"]],
};
const groups = group === "all" ? ["public", "app", "internal"] : [group];
let browser;
try {
  browser = await chromium.launch({ headless: noHold, slowMo: noHold ? 0 : 65 });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => { errors.push(error.message); console.warn("PAGEERROR:", error.message); });
  page.on("console", (msg) => { if (msg.type() === "error") console.warn("CONSOLE:", msg.text().slice(0, 250)); });
  const health = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  if (!health?.ok()) throw new Error(`Servidor local no listo: HTTP ${health?.status() ?? "sin respuesta"}.`);
  if (groups.some((item) => item !== "public")) {
    const response = await context.request.post(`${baseUrl}/api/auth/sign-in/email`, {
      headers: { origin: baseUrl, "content-type": "application/json" },
      data: {
        email: process.env.VECIDYA_DEMO_EMAIL ?? "qa-owner@vecidya.test",
        password: process.env.VECIDYA_DEMO_PASSWORD ?? "VecidyaLocalDemoOnly-2026!",
      },
    });
    if (!response.ok()) throw new Error(`Falló login QA local: HTTP ${response.status()}. Ejecuta pnpm run seed:local-demo tras iniciar el servidor.`);
    const sessionResponse = await context.request.get(`${baseUrl}/api/auth/get-session`);
    const session = sessionResponse.ok() ? await sessionResponse.json() : null;
    if (!session?.user?.id) throw new Error("La sesión QA no fue verificada; no se capturarán páginas privadas como si estuvieran autenticadas.");
    // El seed selecciona una organización en SU sesión. Una autenticación nueva no
    // hereda activeOrganizationId; seleccionamos solo una membresía existente.
    const organizationsResponse = await context.request.get(`${baseUrl}/api/auth/organization/list`);
    if (!organizationsResponse.ok()) throw new Error(`No se pudieron consultar las organizaciones QA: HTTP ${organizationsResponse.status()}.`);
    const organizations = await organizationsResponse.json();
    if (!Array.isArray(organizations) || organizations.length < 10) {
      throw new Error(`Se esperaban al menos 10 organizaciones QA vinculadas a esta cuenta; recibidas: ${Array.isArray(organizations) ? organizations.length : "formato inesperado"}.`);
    }
    const selected = organizations.find((item) => item.slug === "qa-local-salud");
    if (!selected?.id) throw new Error("Falta la organización qa-local-salud entre las membresías QA.");
    const activateResponse = await context.request.post(`${baseUrl}/api/auth/organization/set-active`, {
      headers: { origin: baseUrl, "content-type": "application/json" },
      data: { organizationId: selected.id },
    });
    if (!activateResponse.ok()) throw new Error(`No se pudo activar ${selected.slug}: HTTP ${activateResponse.status()}.`);
    const verifiedResponse = await context.request.get(`${baseUrl}/api/auth/get-session`);
    const verifiedSession = verifiedResponse.ok() ? await verifiedResponse.json() : null;
    if (verifiedSession?.session?.activeOrganizationId !== selected.id) {
      throw new Error("La organización QA no quedó activa en la sesión del navegador; se detiene la revisión privada.");
    }
    console.log(`Organización QA activa: ${selected.name} (${selected.slug}). Membresías disponibles: ${organizations.length}.`);
  }
  for (const area of groups) {
    for (const [id, path] of routes[area]) {
      for (const width of viewports) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
        const response = await page.goto(baseUrl + path, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.waitForTimeout(650);
        const status = response?.status() ?? 0;
        const finalPath = new URL(page.url()).pathname;
        const filename = resolve(outDir, `${area}-${id}-${width}.png`);
        await page.screenshot({ path: filename, fullPage: true, animations: "disabled" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        const redirected = finalPath !== path;
        console.log(`[${area}] HTTP ${status} · ${path} → ${finalPath} · ${width}px · overflow=${overflow} · ${filename}`);
        if (redirected) {
          console.error(`ERROR: redirección inesperada en ${path}: ${finalPath}`);
          process.exitCode = 1;
        }
        if (area === "internal" && status === 403) console.log("Admin protegido: 403 esperado para cuenta owner. No equivale a QA con platform_admin.");
        if (area === "internal" && ![200, 403].includes(status)) process.exitCode = 1;
        if (area !== "internal" && (status < 200 || status >= 400)) process.exitCode = 1;
        if (overflow) process.exitCode = 1;
      }
    }
  }
  if (errors.length) { console.error(`Errores JavaScript: ${errors.length}`); process.exitCode = 1; }
  if (!noHold && group === "all") await page.goto(baseUrl + "/app", { waitUntil: "domcontentloaded" });
  console.log("\nCapturas terminadas. Las páginas privadas son vistas de la cuenta QA; la ruta Admin puede responder 403 por permisos.");
  if (!noHold) {
    console.log("Navegador abierto para explorar manualmente. Pulsa Enter en esta terminal para cerrar.");
    const rl = createInterface({ input, output });
    await rl.question("");
    rl.close();
  }
} finally {
  await browser?.close();
}
