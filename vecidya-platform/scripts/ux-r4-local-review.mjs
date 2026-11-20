/**
 * UX-CRYSTAL-R4: recorrido visual local manual en Playwright.
 * v1.0.0 — 2026-11-20. Solo localhost:4173, sin POST de contenido.
 * Credenciales de demostración: NUNCA utilizar fuera del entorno local-demo.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { chromium } from "playwright";

const base = new URL(process.env.LOCAL_DEMO_BASE_URL ?? "http://127.0.0.1:4173");
if (base.protocol !== "http:" || !["localhost","127.0.0.1"].includes(base.hostname) || base.port !== "4173") {
  throw new Error("R4 solo permite http://127.0.0.1:4173.");
}
const roles = {
  owner: ["qa-owner@vecidya.test", "VecidyaLocalDemoOnly-2026!"],
  admin: ["qa-editor@vecidya.test", "VecidyaLocalEditor-2026!"],
  member: ["qa-member@vecidya.test", "VecidyaLocalMember-2026!"],
};
const role = process.argv.find((arg) => arg.startsWith("--role="))?.slice(7) ?? "owner";
if (!(role in roles)) throw new Error("Usa --role=owner|admin|member.");
const headless = process.argv.includes("--headless");
const localEdge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdge) ? localEdge : undefined);
const evidenceDir = resolve("test-results", "ux-crystal-r4-manual", role);
mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1366, height: 850 }, reducedMotion: "reduce" });
const page = await context.newPage();
const report = [];
const routes = [
  ["/", "web-inicio"],
  ["/servicios", "web-servicios"],
  ["/vecindario", "web-vecindario"],
  ["/aprende", "web-aprende"],
  ["/licencias", "web-licencias"],
  ["/app", "app-inicio"],
  ["/app/business-profile", "app-perfil"],
  ["/app/miniweb-v2", "app-miniweb"],
  ["/app/internal/businesses", "internal-negocios"],
];
try {
  const health = await context.request.get(base.href);
  if (!health.ok()) throw new Error(`El servidor local no responde correctamente: HTTP ${health.status()}`);
  const [email, password] = roles[role];
  const login = await context.request.post(new URL("/api/auth/sign-in/email", base), {
    data: { email, password },
    headers: { origin: base.origin },
  });
  if (!login.ok()) throw new Error(`No se pudo iniciar sesión QA (${role}): HTTP ${login.status()}. Ejecuta seed:local-demo antes.`);
  for (const [path, label] of routes) {
    const response = await page.goto(new URL(path, base), { waitUntil: "domcontentloaded" });
    await page.locator("body").waitFor();
    const width = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }));
    await page.screenshot({ path: resolve(evidenceDir, label + ".png"), fullPage: true, animations: "disabled" });
    report.push({ path, status: response?.status() ?? null, ...width, title: await page.title() });
    console.log(`${String(response?.status() ?? "?")} | ${role} | ${path} | scroll=${width.scrollWidth - width.viewport}px`);
  }
  writeFileSync(resolve(evidenceDir, "index.json"), JSON.stringify({
    kind: "QA_LOCAL_NOT_CERTIFICATION", role, base: base.href, records: report,
  }, null, 2));
  console.log(`Capturas de inspección en ${evidenceDir}`);
  console.log("Los HTTP 401/403 son esperables en rutas sin permiso; no son PASS automáticos.");
  if (!headless) {
    await page.goto(new URL("/app", base), { waitUntil: "domcontentloaded" });
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    await prompt.question("Navegador abierto para revisión manual. Pulsa Enter para cerrarlo. ");
    prompt.close();
  }
} finally {
  await browser.close();
}
