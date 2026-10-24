import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID, randomBytes } from "node:crypto";

import { chromium } from "playwright";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(new URL("../..", import.meta.url).pathname.replace(/^\//, "").replaceAll("/", "\\"));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/app-dashboard-redesign-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
const screenshotDirectory = process.env.VISUAL_OUTPUT_DIRECTORY;
if (!existsSync(resolve(projectDirectory, ".wrangler")) || !existsSync(wranglerCli)) throw new Error("Falta Wrangler local o su carpeta de persistencia aislada.");

function runWrangler(args, timeout = 600_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], { cwd: projectDirectory, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Wrangler terminó con ${result.status}. ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function sqlLiteral(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function query(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-app-redesign-"));
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

async function assertNoOverflow(page, label) {
  const result = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    offenders: [...document.body.querySelectorAll("*")].filter((element) => {
      const rect = element.getBoundingClientRect();
      const intentionallyClippedDrawer = element.closest('.admin-sidebar[data-open="true"]');
      return !intentionallyClippedDrawer && rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1);
    }).filter((element) => getComputedStyle(element).visibility !== "hidden").slice(0, 4).map((element) => ({ tag: element.tagName, className: String(element.className), left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right) })),
  }));
  if (result.document > result.viewport + 1 || result.offenders.length) throw new Error(`${label} desborda horizontalmente: ${JSON.stringify(result)}`);
}

assertLocalBaseUrl(process.env.BASE_URL ?? "http://127.0.0.1");
const port = await getPort();
const baseUrl = `http://127.0.0.1:${port}`;
const suffix = randomUUID();
const email = `dashboard-redesign-${suffix}@vecidya.test`;
const password = `local-test-${randomBytes(16).toString("hex")}`;
const bootstrapUserId = randomUUID();
const organizationId = randomUUID();
const invitationId = randomUUID();
const now = Date.now();
const secret = randomBytes(32).toString("hex");
let worker;
let browser;
let phase = "initialization";

try {
  phase = "migrations and fixtures";
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  query(`INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${sqlLiteral(bootstrapUserId)},'Dashboard bootstrap',${sqlLiteral(`bootstrap-${suffix}@vecidya.test`)},1,${now},${now});
INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(organizationId)},'Vecidya local demo',${sqlLiteral(`dashboard-redesign-${suffix}`)},${now});
INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(invitationId)},${sqlLiteral(organizationId)},${sqlLiteral(email)},'admin','pending',${now + 3_600_000},${now},${sqlLiteral(bootstrapUserId)});`);

  phase = "starting local Worker";
  worker = startWorker(baseUrl, port, secret);
  await waitForWorker(baseUrl, worker);

  phase = "registering test identity";
  const session = new SessionClient(baseUrl);
  const signup = await session.post("/api/auth/sign-up/email", { name: "Prueba local Vecidya", email, password }, { "X-Vecidya-Invitation": invitationId });
  if (signup.status !== 200) throw new Error(`Signup local respondió ${signup.status}: ${(await signup.text()).slice(0, 250)}`);
  const identity = (await signup.json()).user;
  await stopWorker(worker);
  const adminRowId = randomUUID();
  query(`UPDATE user SET email_verified=1 WHERE id=${sqlLiteral(identity.id)};
INSERT INTO member (id,organization_id,user_id,role,created_at) SELECT ${sqlLiteral(randomUUID())},${sqlLiteral(organizationId)},${sqlLiteral(identity.id)},'admin',${now} WHERE NOT EXISTS (SELECT 1 FROM member WHERE organization_id=${sqlLiteral(organizationId)} AND user_id=${sqlLiteral(identity.id)});
INSERT INTO platform_member (id,user_id,role,status,created_at,updated_at) VALUES (${sqlLiteral(adminRowId)},${sqlLiteral(identity.id)},'platform_admin','active',${now},${now});`);
  worker = startWorker(baseUrl, port, secret);
  await waitForWorker(baseUrl, worker);

  phase = "browser login and client dashboard";
  const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
  browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("Failed to fetch manifest patches")) errors.push(message.text()); });
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/Contraseña/i).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app");
  await page.getByLabel("Organización").selectOption(organizationId);
  await page.getByRole("heading", { name: /Buenos días|Buenas tardes|Buenas noches/ }).waitFor();
  await page.getByRole("heading", { name: "Organización activa: Vecidya local demo" }).waitFor();

  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await assertNoOverflow(page, `${width}px /app`);
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  if (screenshotDirectory) {
    mkdirSync(screenshotDirectory, { recursive: true });
    await page.screenshot({ path: join(screenshotDirectory, "vecidya-app-dashboard-desktop.png"), fullPage: true });
  }

  for (const width of [390, 768, 980]) {
    await page.setViewportSize({ width, height: 844 });
    const clientMenu = page.locator('button[aria-controls="app-navigation"]');
    await clientMenu.waitFor({ state: "visible" });
    await clientMenu.click();
    if (await clientMenu.getAttribute("aria-expanded") !== "true") throw new Error(`El menú cliente no anunció estado abierto a ${width}px.`);
    await assertNoOverflow(page, `${width}px /app con navegación abierta`);
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Mi negocio" }).click();
    await page.waitForURL("**/app/business-profile");
    if (await page.locator('button[aria-controls="app-navigation"]').getAttribute("aria-expanded") !== "false") throw new Error(`El menú cliente no se cerró tras navegar a ${width}px.`);
    await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  }
  await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-app-dashboard-mobile.png"), fullPage: true });

  phase = "internal dashboard and mobile navigation";
  await page.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Administración de Vecidya" }).waitFor();
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await assertNoOverflow(page, `${width}px /app/internal`);
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-internal-dashboard-desktop.png"), fullPage: true });

  for (const width of [390, 768, 980]) {
    await page.setViewportSize({ width, height: 844 });
    const adminMenu = page.locator('button[aria-controls="admin-navigation"]');
    await adminMenu.waitFor({ state: "visible" });
    await adminMenu.click();
    if (await adminMenu.getAttribute("aria-expanded") !== "true") throw new Error(`El menú interno no anunció estado abierto a ${width}px.`);
    await assertNoOverflow(page, `${width}px /app/internal con navegación abierta`);
    await page.getByRole("navigation", { name: "Navegación administrativa" }).getByRole("link", { name: "Servicios" }).click();
    await page.waitForURL("**/app/internal/services");
    if (await page.locator('button[aria-controls="admin-navigation"]').getAttribute("aria-expanded") !== "false") throw new Error(`El menú interno no se cerró tras navegar a ${width}px.`);
    await page.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  }
  await page.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-internal-dashboard-mobile.png"), fullPage: true });
  if (errors.length) throw new Error(`Errores de navegador: ${errors.join(" | ")}`);

  console.log(JSON.stringify({ result: "PASS", routes: ["/app", "/app/internal"], widths: [320, 390, 768, 980, 1366], clientDrawer: "opens and closes on route navigation at 390/768/980px", internalDrawer: "opens and closes on route navigation at 390/768/980px", screenshots: screenshotDirectory ?? "not requested" }, null, 2));
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
