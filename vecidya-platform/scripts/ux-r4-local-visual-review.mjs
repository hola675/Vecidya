/**
 * UX-CRYSTAL-R4 · Recorrido local interactivo con Playwright.
 * Versión 1.0.0 (2026-11-20). Sin mutaciones de datos desde el navegador.
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
  page.on("pageerror", (error) => console.warn("PAGEERROR:", error.message));
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
  }
  for (const area of groups) {
    for (const [id, path] of routes[area]) {
      const response = await page.goto(baseUrl + path, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(650);
      const status = response?.status() ?? 0;
      const filename = resolve(outDir, `${area}-${id}.png`);
      await page.screenshot({ path: filename, fullPage: true, animations: "disabled" });
      console.log(`[${area}] HTTP ${status} · ${path} · ${filename}`);
      if (area === "internal" && status === 403) console.log("Admin protegido: 403 esperado para cuenta owner. No equivale a QA con platform_admin.");
      if (status >= 500) process.exitCode = 1;
    }
  }
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
