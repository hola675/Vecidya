import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes, randomUUID } from "node:crypto";

import { chromium } from "playwright";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(new URL("../..", import.meta.url).pathname.replace(/^\//, "").replaceAll("/", "\\"));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/react-418-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
mkdirSync(resolve(projectDirectory, ".wrangler"), { recursive: true });
if (!existsSync(wranglerCli)) throw new Error("Falta Wrangler local para ejecutar la D1 aislada.");

function runWrangler(args, timeout = 600_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], { cwd: projectDirectory, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Wrangler terminó con ${result.status}. ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function sqlLiteral(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function query(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-react-418-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  try { return JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", file])).flatMap((result) => result.results ?? []); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}

async function getPort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar un puerto local.");
  return address.port;
}

class SessionClient {
  #cookies = new Map();
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  async post(path, body, extraHeaders = {}) {
    const headers = new Headers({ "content-type": "application/json", origin: this.baseUrl, ...extraHeaders });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, this.baseUrl), { method: "POST", headers, body: JSON.stringify(body), redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";", 1); const [name, ...value] = pair.split("="); this.#cookies.set(name, value.join("=")); }
    return response;
  }
}

async function waitForWorker(baseUrl, worker) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (worker.exitCode !== null) throw new Error(`Worker local terminó pronto: ${worker.output}`);
    try { if ((await fetch(`${baseUrl}/api/auth/ok`, { signal: AbortSignal.timeout(2_000) })).status === 200) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  throw new Error(`El Worker local no respondió. ${worker.output}`);
}

function startWorker(baseUrl, port, secret) {
  const child = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", String(port), "--var", "APP_ENV:development", "--var", "EMAIL_PROVIDER:fake", "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`, "--show-interactive-dev-session=false", "--log-level", "info"], { cwd: projectDirectory, env: { ...process.env, BETTER_AUTH_SECRET: secret }, stdio: ["ignore", "pipe", "pipe"] });
  child.output = "";
  child.stdout.on("data", (chunk) => { child.output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { child.output += chunk.toString(); });
  return child;
}

async function stopWorker(child) {
  if (!child || child.exitCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGINT");
  await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5000))]);
}

assertLocalBaseUrl(process.env.BASE_URL ?? "http://127.0.0.1");
const port = await getPort();
const baseUrl = `http://127.0.0.1:${port}`;
const suffix = randomUUID();
const email = `react-418-${suffix}@vecidya.test`;
const password = `local-test-${randomBytes(16).toString("hex")}`;
const bootstrapUserId = randomUUID();
const organizationId = randomUUID();
const invitationId = randomUUID();
const auditId = randomUUID();
const integrationId = randomUUID();
const integrationExternalId = `local-react418-${randomUUID()}`;
const now = Date.now();
const auditTimestamp = Date.UTC(2026, 10, 2, 3, 21);
const secret = randomBytes(32).toString("hex");
let worker;
let browser;
let phase = "initialization";

try {
  phase = "isolated D1 migrations and synthetic fixtures";
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  query(`INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${sqlLiteral(bootstrapUserId)},'Bootstrap local',${sqlLiteral(`bootstrap-${suffix}@vecidya.test`)},1,${now},${now});
INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(organizationId)},'Vecidya #418 local',${sqlLiteral(`react-418-${suffix}`)},${now});
INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(invitationId)},${sqlLiteral(organizationId)},${sqlLiteral(email)},'admin','pending',${now + 3_600_000},${now},${sqlLiteral(bootstrapUserId)});`);

  phase = "local Worker startup and test identity";
  worker = startWorker(baseUrl, port, secret);
  await waitForWorker(baseUrl, worker);
  const signup = await new SessionClient(baseUrl).post("/api/auth/sign-up/email", { name: "Usuario sintético #418", email, password }, { "X-Vecidya-Invitation": invitationId });
  if (signup.status !== 200) throw new Error(`Signup local respondió ${signup.status}: ${(await signup.text()).slice(0, 250)}`);
  const identity = (await signup.json()).user;
  await stopWorker(worker);
  worker = undefined;
  query(`UPDATE user SET email_verified=1 WHERE id=${sqlLiteral(identity.id)};
INSERT INTO member (id,organization_id,user_id,role,created_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(organizationId)},${sqlLiteral(identity.id)},'admin',${now});
INSERT INTO platform_member (id,user_id,role,status,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(identity.id)},'platform_admin','active',${now},${now});
INSERT INTO platform_audit_log (id,actor_user_id,action,entity_type,entity_id,organization_id,previous_value,new_value,metadata,created_at) VALUES (${sqlLiteral(auditId)},${sqlLiteral(identity.id)},'react418.synthetic','test',${sqlLiteral(auditId)},${sqlLiteral(organizationId)},NULL,'local synthetic record',NULL,${auditTimestamp});
INSERT INTO integration_connection (id,organization_id,provider,external_id,status,metadata,created_at,updated_at) VALUES (${sqlLiteral(integrationId)},${sqlLiteral(organizationId)},'local-test-fixture',${sqlLiteral(integrationExternalId)},'pending','{"fixture":true}',${now},${now});`);

  phase = "authenticated hydration of recent audit activity";
  worker = startWorker(baseUrl, port, secret);
  await waitForWorker(baseUrl, worker);
  const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
  browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, timezoneId: "America/New_York" });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("Failed to fetch manifest patches")) browserErrors.push(message.text()); });
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/Contraseña/i).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app");
  await page.getByLabel("Organización").selectOption(organizationId);
  const internalResponse = await page.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  if (internalResponse?.status() !== 200) throw new Error(`La vista interna local respondió ${internalResponse?.status() ?? "sin respuesta"}.`);
  const serverHtml = await internalResponse.text();
  const serverActivityIndex = serverHtml.indexOf("react418.synthetic");
  const serverActivity = serverActivityIndex < 0 ? null : serverHtml.slice(Math.max(0, serverActivityIndex - 180), serverActivityIndex + 500).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  await page.getByRole("heading", { name: "Administración de Vecidya" }).waitFor();
  await page.getByText(/react418\.synthetic · test:/).waitFor();
  await page.waitForTimeout(1200);
  const hydratedActivity = await page.locator(".admin-audit-list__meta").filter({ hasText: "Usuario sintético #418" }).textContent();
  const serverTimestamp = serverActivity?.split("Usuario sintético #418").at(-1)?.split("©")[0].trim() ?? null;
  const hydratedTimestamp = hydratedActivity?.split("Usuario sintético #418").at(-1)?.trim() ?? null;
  const hydrationErrors = browserErrors.filter((message) => /#418|hydration failed|hydrating/i.test(message));
  if (hydrationErrors.length) throw new Error(`React #418 sigue visible: ${hydrationErrors.join(" | ")}`);
  if (!serverTimestamp || !hydratedTimestamp || serverTimestamp !== hydratedTimestamp) throw new Error(`El texto SSR y el hidratado difiere. SSR=${serverTimestamp ?? "no capturado"}; cliente=${hydratedTimestamp ?? "no capturado"}.`);
  await page.goto(new URL("/app/internal/integrations", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Integraciones" }).waitFor();
  await page.getByText(integrationExternalId, { exact: true }).waitFor();
  const otherBrowserErrors = browserErrors.filter((message) => !hydrationErrors.includes(message));
  if (otherBrowserErrors.length) throw new Error(`Errores adicionales al abrir Integraciones: ${otherBrowserErrors.join(" | ")}`);
  console.log(JSON.stringify({ result: "PASS — regresión #418", route: "/app/internal", browserTimeZone: "America/New_York", fixture: "synthetic platform admin, member, audit event near midnight UTC, and local-only integration metadata", serverTimestamp, hydratedTimestamp, hydrationErrors, integrationRoute: "/app/internal/integrations", integrationVisible: true }, null, 2));
} catch (error) {
  throw new Error(`Fase: ${phase}\n${error instanceof Error ? error.stack ?? error.message : String(error)}\nWorker output:\n${worker?.output ?? "(not started)"}`, { cause: error });
} finally {
  if (browser) await browser.close();
  await stopWorker(worker);
  try {
    if (existsSync(persistence)) {
      const resolved = resolve(persistence);
      if (!resolved.startsWith(resolve(projectDirectory, ".wrangler") + "\\")) throw new Error(`La ruta de limpieza sale de .wrangler: ${resolved}`);
      rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    }
    if (existsSync(persistence)) throw new Error(`La D1 aislada sigue presente: ${persistenceName}`);
    console.log("PASS: D1 aislada eliminada y ausencia verificada.");
  } catch (error) {
    throw new Error(`No se pudo verificar la limpieza de ${persistenceName}: ${String(error)}`, { cause: error });
  }
}
