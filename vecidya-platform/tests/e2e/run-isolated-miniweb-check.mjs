import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../..", import.meta.url));
const persistTo = mkdtempSync(join(project, ".wrangler", "visual-qa-miniweb-"));
const evidenceDir = process.env.VISUAL_OUTPUT_DIRECTORY ?? ".playwright-mcp/visual-qa/miniweb-isolated";
const wrangler = fileURLToPath(import.meta.resolve("wrangler"));
const evidencePath = resolve(project, evidenceDir);
mkdirSync(evidencePath, { recursive: true });

function runWrangler(args) {
  const result = spawnSync(process.execPath, [wrangler, ...args], { cwd: project, encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 600_000 });
  if (result.status !== 0) throw new Error(`Wrangler falló (${args.slice(0, 3).join(" ")}): ${result.stderr || result.stdout || result.error?.message}`);
  return result.stdout;
}

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar puerto local.");
  return address.port;
}

const port = await reservePort();
const baseUrl = `http://127.0.0.1:${port}`;
const worker = spawn(process.execPath, [wrangler, "dev", "--local", "--persist-to", persistTo, "--ip", "127.0.0.1", "--port", String(port), "--var", "APP_ENV:development", "--var", "EMAIL_PROVIDER:fake", "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`, "--show-interactive-dev-session=false", "--log-level", "error"], {
  cwd: project,
  env: { ...process.env, BETTER_AUTH_SECRET: randomBytes(32).toString("base64url") },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
let workerOutput = "";
worker.stdout.on("data", (chunk) => { workerOutput += chunk.toString(); });
worker.stderr.on("data", (chunk) => { workerOutput += chunk.toString(); });

let result = null;
let failure = null;
const startedAt = new Date().toISOString();
try {
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistTo]);
  const ledger = runWrangler(["d1", "migrations", "list", "DB", "--local", "--persist-to", persistTo]);
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (worker.exitCode !== null) throw new Error(`El Worker efímero terminó antes de iniciar: ${workerOutput}`);
    try { if ((await fetch(`${baseUrl}/api/auth/ok`, { signal: AbortSignal.timeout(1500) })).ok) break; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  const health = await fetch(`${baseUrl}/api/auth/ok`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
  if (!health?.ok) throw new Error(`Health del Worker efímero falló (${health?.status ?? "sin conexión"}). ${workerOutput}`);

  const captures = resolve(evidencePath, "captures");
  mkdirSync(captures, { recursive: true });
  const summaryPath = join(evidencePath, "miniweb-summary.json");
  const run = spawnSync(process.execPath, ["tests/e2e/miniweb-core-check.mjs"], {
    cwd: project,
    encoding: "utf8",
    windowsHide: true,
    timeout: 1_200_000,
    maxBuffer: 24 * 1024 * 1024,
    env: { ...process.env, BASE_URL: baseUrl, VECIDYA_E2E_PERSIST_TO: persistTo, MINIWEB_CAPTURE_DIR: captures, MINIWEB_SUMMARY_PATH: summaryPath, VISUAL_QA_FIXTURE_ID: `iso${Date.now()}` },
  });
  if (run.status !== 0) throw new Error(`miniweb-core-check terminó con ${run.status ?? "sin código"}: ${run.stderr || run.stdout || run.error?.message}`);
  result = JSON.parse(readFileSync(summaryPath, "utf8"));
  if (!result?.fixturesCleaned || result.harness || result.failed?.length) throw new Error("El E2E no confirmó limpieza completa de fixtures.");
  const cleanupRows = JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--persist-to", persistTo, "--json", "--command", "SELECT (SELECT COUNT(*) FROM user) AS users, (SELECT COUNT(*) FROM organization) AS organizations, (SELECT COUNT(*) FROM organization_license) AS licenses, (SELECT COUNT(*) FROM business_media_asset) AS mediaAssets, (SELECT COUNT(*) FROM business_profile_publication) AS publications;"])).flatMap((statement) => statement.results ?? []);
  const databaseAfterCleanup = cleanupRows[0] ?? {};
  if (Object.values(databaseAfterCleanup).some((count) => Number(count) !== 0)) throw new Error(`El D1 aislado conserva registros tras teardown: ${JSON.stringify(databaseAfterCleanup)}`);
  writeFileSync(join(evidencePath, "isolated-run.json"), `${JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), baseUrl, persistence: "efímera local exclusiva; eliminada al terminar", migrations: ledger.trim().split(/\r?\n/).slice(-8), healthStatus: health.status, e2e: result, databaseAfterCleanup }, null, 2)}\n`);
  process.stdout.write(run.stdout);
} catch (error) {
  failure = error;
  console.error(`E2E MiniWeb aislado: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (worker.exitCode === null) {
    if (process.platform === "win32" && worker.pid) {
      spawnSync("taskkill", ["/PID", String(worker.pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
    } else {
      worker.kill("SIGINT");
    }
    if (worker.exitCode === null) {
      const exited = once(worker, "exit");
      await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 12_000))]);
    }
  }
  let cleanupError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { rmSync(persistTo, { recursive: true, force: true, maxRetries: 2, retryDelay: 250 }); cleanupError = null; break; }
    catch (error) { cleanupError = error; await new Promise((resolveWait) => setTimeout(resolveWait, 500)); }
  }
  if (cleanupError) failure ??= new Error(`No se pudo retirar el almacenamiento efímero aislado: ${cleanupError.message}`);
}

if (failure) throw failure;
console.log(JSON.stringify({ result: "PASS", isolatedPersistenceRemoved: true, migrationsApplied: true, healthStatus: 200, ...result, evidenceDir }));
