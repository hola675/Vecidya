import { launchVisualQaBrowser } from "./visual-qa-browser.mjs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { cwd } from "node:process";

export { launchVisualQaBrowser } from "./visual-qa-browser.mjs";

export const demoPort = Number(process.env.VISUAL_QA_DEMO_PORT ?? 5180);
if (!Number.isInteger(demoPort) || demoPort < 1024 || demoPort > 65535) {
  throw new Error(`VISUAL_QA_DEMO_PORT debe ser un puerto válido (1024–65535): ${process.env.VISUAL_QA_DEMO_PORT}`);
}

export const demoBaseUrl = `http://127.0.0.1:${demoPort}`;
const requestedBaseUrl = process.env.BASE_URL;
if (requestedBaseUrl) {
  let requested;
  try { requested = new URL(requestedBaseUrl); } catch { throw new Error(`BASE_URL no es válida: ${requestedBaseUrl}`); }
  if (requested.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(requested.hostname) || Number(requested.port || 80) !== demoPort || requested.pathname !== "/" || requested.search || requested.hash) {
    throw new Error(`BASE_URL debe apuntar al origen local ${demoBaseUrl}; recibido: ${requestedBaseUrl}`);
  }
}

export async function assertDemoWorkerReady() {
  const response = await fetch(new URL("/api/auth/ok", demoBaseUrl), { signal: AbortSignal.timeout(3000) }).catch(() => null);
  if (!response?.ok) throw new Error(`Worker local de auditoría no disponible en ${demoBaseUrl}; no se modificaron fixtures D1.`);

  const wrangler = fileURLToPath(import.meta.resolve("wrangler"));
  const persistTo = join(cwd(), ".wrangler", "visual-qa-demo");
  const migrations = spawnSync(process.execPath, [wrangler, "d1", "migrations", "list", "DB", "--local", "--persist-to", persistTo], { cwd: cwd(), encoding: "utf8", windowsHide: true });
  if (migrations.status !== 0 || !migrations.stdout.includes("0028")) {
    throw new Error(`No se pudo verificar el almacén D1 local esperado (.wrangler/visual-qa-demo, migración 0028); no se modificaron fixtures. ${migrations.stderr || migrations.stdout}`);
  }
}
