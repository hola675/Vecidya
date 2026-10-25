import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = fileURLToPath(new URL("../..", import.meta.url));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/app-dashboard-redesign-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
const screenshotDirectory = process.env.VISUAL_OUTPUT_DIRECTORY;
const auditWidths = [768, 820, 980, 1024, 1366, 1440, 1920];
const viewportHeightFor = (width) => ({ 768: 1024, 820: 1180, 979: 1100, 980: 1100, 1024: 768, 1366: 900, 1440: 900, 1920: 1080 })[width] ?? 900;
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
  const gateDiagnostics = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("Failed to fetch manifest patches")) errors.push(message.text()); });
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/Contraseña/i).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app");
  await page.getByLabel("Negocio activo").selectOption(organizationId);
  await page.getByRole("heading", { name: /Hola,/ }).waitFor();
  await page.getByRole("heading", { name: "Organización activa: Vecidya local demo" }).waitFor();

  for (const width of auditWidths) {
    await page.setViewportSize({ width, height: viewportHeightFor(width) });
    await assertNoOverflow(page, `${width}px /app`);
    if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, `vecidya-app-dashboard-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  if (screenshotDirectory) {
    mkdirSync(screenshotDirectory, { recursive: true });
    await page.screenshot({ path: join(screenshotDirectory, "vecidya-app-dashboard-desktop.png"), fullPage: true });
  }

  for (const width of [768, 820, 979]) {
    await page.setViewportSize({ width, height: viewportHeightFor(width) });
    const clientMenu = page.locator('button[aria-controls="app-navigation"]');
    await clientMenu.waitFor({ state: "visible" });
    if (width === 768) {
      const closedClientSidebar = page.locator(".app-sidebar");
      await page.waitForFunction(() => document.querySelector(".app-sidebar")?.hasAttribute("inert"));
      if (await closedClientSidebar.getAttribute("aria-hidden") !== "true" || await closedClientSidebar.getAttribute("inert") === null) throw new Error("El menú cliente cerrado sigue expuesto o tabulable.");
    }
    await clientMenu.click();
    if (await clientMenu.getAttribute("aria-expanded") !== "true") throw new Error(`El menú cliente no anunció estado abierto a ${width}px.`);
    if (width === 768) {
      const focusedNavigationItem = await page.evaluate(() => document.activeElement?.textContent?.trim());
      if (focusedNavigationItem !== "Inicio") throw new Error(`El menú cliente no movió el foco a su primera opción: ${focusedNavigationItem ?? "sin foco"}.`);
      if (await page.getByRole("dialog", { name: "Navegación principal" }).getAttribute("aria-modal") !== "true") throw new Error("El menú cliente abierto no se expuso como diálogo modal.");
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Shift+Tab");
      if (!await page.evaluate(() => document.activeElement?.textContent?.includes("Explorar el Vecindario"))) throw new Error("Shift+Tab no quedó contenido al final del menú cliente.");
      await page.keyboard.press("Tab");
      if (!await page.evaluate(() => document.activeElement?.classList.contains("brand"))) throw new Error("Tab no volvió al inicio del menú cliente.");
      await page.keyboard.press("Escape");
      if (await clientMenu.getAttribute("aria-expanded") !== "false") throw new Error("Escape no cerró la navegación cliente.");
      await page.waitForFunction(() => document.activeElement === document.querySelector('button[aria-controls="app-navigation"]'));
      if (!await clientMenu.evaluate((element) => element === document.activeElement)) throw new Error("El foco no volvió al botón al cerrar la navegación cliente.");
      await clientMenu.click();
    }
    await assertNoOverflow(page, `${width}px /app con navegación abierta`);
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Mi negocio" }).click();
    await page.waitForURL("**/app/business-profile");
    if (await page.locator('button[aria-controls="app-navigation"]').getAttribute("aria-expanded") !== "false") throw new Error(`El menú cliente no se cerró tras navegar a ${width}px.`);
    await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  }
  for (const width of [320, 360, 390, 430]) {
    const mobileContext = await browser.newContext({ viewport: { width, height: 844 }, serviceWorkers: "block" });
    const mobilePage = await mobileContext.newPage();
    const telemetry = { console: [], pageErrors: [], failedRequests: [], responses: [] };
    mobilePage.on("pageerror", (error) => { errors.push(error.message); telemetry.pageErrors.push(error.message); });
    mobilePage.on("console", (message) => { if (message.type() === "error") telemetry.console.push(message.text()); });
    mobilePage.on("requestfailed", (request) => telemetry.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    mobilePage.on("response", (response) => { if (response.status() >= 400) telemetry.responses.push({ url: response.url(), status: response.status() }); });
    await mobilePage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
    await mobilePage.getByLabel(/Correo electrónico/i).fill(email);
    await mobilePage.getByLabel(/Contraseña/i).fill(password);
    await mobilePage.getByRole("button", { name: "Entrar" }).click();
    await mobilePage.waitForURL("**/app");
    const notice = mobilePage.getByTestId("unsupported-device-notice");
    await mobilePage.waitForFunction(() => document.readyState === "complete");
    const gateState = await mobilePage.evaluate(() => ({ viewport: { innerWidth, clientWidth: document.documentElement.clientWidth, outerWidth }, mediaQuery: matchMedia("(min-width: 768px)").matches, readyState: document.readyState, hydration: { rootHtml: document.querySelector("#root")?.innerHTML?.slice(0, 4000) ?? null, scripts: [...document.scripts].map((script) => script.src).filter(Boolean) }, notice: Boolean(document.querySelector('[data-testid="unsupported-device-notice"]')), shell: Boolean(document.querySelector(".app-shell, .admin-shell")), footer: [...document.querySelectorAll(".platform-footer")].map((element) => ({ className: element.className, text: element.innerText })), body: document.body.innerText.slice(0, 1500) }));
    if (!gateState.notice) throw new Error(`Aviso cliente ausente a ${width}px. ${JSON.stringify({ gateState, telemetry })}`);
    gateDiagnostics.push({ area: "client", width, gateState, telemetry });
    if (await mobilePage.locator(".app-sidebar, .app-header, #client-page-content").count()) throw new Error(`El workspace cliente se renderizó en un teléfono de ${width}px.`);
    const outsideFocusable = await mobilePage.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[data-testid="unsupported-device-notice"]')).length);
    if (outsideFocusable) throw new Error(`Hay ${outsideFocusable} controles privados accesibles fuera del aviso a ${width}px.`);
    await notice.getByRole("button", { name: "Continuar en esta ventana" }).click();
    await mobilePage.getByRole("heading", { name: /Hola,/ }).waitFor();
    await mobileContext.close();
  }
  const loginContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await loginPage.getByLabel(/Correo electrónico/i).waitFor();
  if (await loginPage.getByTestId("unsupported-device-notice").count()) throw new Error("El aviso de compatibilidad ocultó la pantalla pública de login.");
  await loginContext.close();
  await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-app-dashboard-mobile.png"), fullPage: true });

  phase = "internal dashboard and mobile navigation";
  const adminDesktopContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const adminDesktopPage = await adminDesktopContext.newPage();
  await adminDesktopPage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await adminDesktopPage.getByLabel(/Correo electrónico/i).fill(email);
  await adminDesktopPage.getByLabel(/Contraseña/i).fill(password);
  await adminDesktopPage.getByRole("button", { name: "Entrar" }).click();
  await adminDesktopPage.waitForURL("**/app");
  await adminDesktopPage.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  await adminDesktopPage.locator(".admin-main h1", { hasText: "Administración de Vecidya" }).waitFor();
  for (const width of auditWidths) {
    await adminDesktopPage.setViewportSize({ width, height: viewportHeightFor(width) });
    await assertNoOverflow(adminDesktopPage, `${width}px /app/internal`);
    if (screenshotDirectory) await adminDesktopPage.screenshot({ path: join(screenshotDirectory, `vecidya-internal-dashboard-${width}.png`), fullPage: true });
  }
  await adminDesktopPage.setViewportSize({ width: 1366, height: 900 });
  if (screenshotDirectory) await adminDesktopPage.screenshot({ path: join(screenshotDirectory, "vecidya-internal-dashboard-desktop.png"), fullPage: true });

  for (const width of [768, 820, 979]) {
    await adminDesktopPage.setViewportSize({ width, height: viewportHeightFor(width) });
    const adminMenu = adminDesktopPage.locator('button[aria-controls="admin-navigation"]');
    await adminMenu.waitFor({ state: "visible" });
    if (width === 768) {
      const closedAdminSidebar = adminDesktopPage.locator(".admin-sidebar");
      await adminDesktopPage.waitForFunction(() => document.querySelector(".admin-sidebar")?.hasAttribute("inert"));
      if (await closedAdminSidebar.getAttribute("aria-hidden") !== "true" || await closedAdminSidebar.getAttribute("inert") === null) throw new Error("El menú interno cerrado sigue expuesto o tabulable.");
    }
    await adminMenu.click();
    if (await adminMenu.getAttribute("aria-expanded") !== "true") throw new Error(`El menú interno no anunció estado abierto a ${width}px.`);
    if (width === 768) {
      const focusedNavigationItem = await adminDesktopPage.evaluate(() => document.activeElement?.textContent?.trim());
      if (focusedNavigationItem !== "Resumen") throw new Error(`El menú interno no movió el foco a su primera opción: ${focusedNavigationItem ?? "sin foco"}.`);
      if (await adminDesktopPage.getByRole("dialog", { name: "Navegación administrativa" }).getAttribute("aria-modal") !== "true") throw new Error("El menú interno abierto no se expuso como diálogo modal.");
      await adminDesktopPage.keyboard.press("Shift+Tab");
      await adminDesktopPage.keyboard.press("Shift+Tab");
      if (!await adminDesktopPage.evaluate(() => document.activeElement?.textContent?.includes("Cerrar sesión"))) throw new Error("Shift+Tab no quedó contenido al final del menú interno.");
      await adminDesktopPage.keyboard.press("Tab");
      if (!await adminDesktopPage.evaluate(() => document.activeElement?.classList.contains("admin-brand"))) throw new Error("Tab no volvió al inicio del menú interno.");
      await adminDesktopPage.keyboard.press("Escape");
      if (await adminMenu.getAttribute("aria-expanded") !== "false") throw new Error("Escape no cerró la navegación interna.");
      await adminDesktopPage.waitForFunction(() => document.activeElement === document.querySelector('button[aria-controls="admin-navigation"]'));
      if (!await adminMenu.evaluate((element) => element === document.activeElement)) throw new Error("El foco no volvió al botón al cerrar la navegación interna.");
      await adminMenu.click();
    }
    await assertNoOverflow(adminDesktopPage, `${width}px /app/internal con navegación abierta`);
    await adminDesktopPage.getByRole("navigation", { name: "Navegación administrativa" }).getByRole("link", { name: "Servicios" }).click();
    await adminDesktopPage.waitForURL("**/app/internal/services");
    if (await adminDesktopPage.locator('button[aria-controls="admin-navigation"]').getAttribute("aria-expanded") !== "false") throw new Error(`El menú interno no se cerró tras navegar a ${width}px.`);
    await adminDesktopPage.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  }
  await adminDesktopContext.close();
  for (const width of [320, 360, 390, 430]) {
    const adminContext = await browser.newContext({ viewport: { width, height: 844 }, serviceWorkers: "block" });
    const adminPage = await adminContext.newPage();
    const telemetry = { console: [], pageErrors: [], failedRequests: [], responses: [] };
    adminPage.on("pageerror", (error) => { errors.push(error.message); telemetry.pageErrors.push(error.message); });
    adminPage.on("console", (message) => { if (message.type() === "error") telemetry.console.push(message.text()); });
    adminPage.on("requestfailed", (request) => telemetry.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    adminPage.on("response", (response) => { if (response.status() >= 400) telemetry.responses.push({ url: response.url(), status: response.status() }); });
    await adminPage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
    await adminPage.getByLabel(/Correo electrónico/i).fill(email);
    await adminPage.getByLabel(/Contraseña/i).fill(password);
    await adminPage.getByRole("button", { name: "Entrar" }).click();
    await adminPage.waitForURL("**/app");
    await adminPage.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
    const notice = adminPage.getByTestId("unsupported-device-notice");
    const gateState = await adminPage.evaluate(() => ({ viewport: { innerWidth, clientWidth: document.documentElement.clientWidth, outerWidth }, mediaQuery: matchMedia("(min-width: 768px)").matches, readyState: document.readyState, hydration: { rootHtml: document.querySelector("#root")?.innerHTML?.slice(0, 4000) ?? null, scripts: [...document.scripts].map((script) => script.src).filter(Boolean) }, notice: Boolean(document.querySelector('[data-testid="unsupported-device-notice"]')), shell: Boolean(document.querySelector(".app-shell, .admin-shell")), footer: [...document.querySelectorAll(".platform-footer")].map((element) => ({ className: element.className, text: element.innerText })), body: document.body.innerText.slice(0, 1500) }));
    if (!gateState.notice) throw new Error(`Aviso administrador ausente a ${width}px. ${JSON.stringify({ gateState, telemetry })}`);
    gateDiagnostics.push({ area: "admin", width, gateState, telemetry });
    if (await adminPage.locator(".admin-sidebar, .admin-header, #internal-page-content").count()) throw new Error(`El workspace administrativo se renderizó en un teléfono de ${width}px.`);
    const outsideFocusable = await adminPage.locator('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[data-testid="unsupported-device-notice"]')).length);
    if (outsideFocusable) throw new Error(`Hay ${outsideFocusable} controles privados accesibles fuera del aviso admin a ${width}px.`);
    await adminPage.getByTestId("unsupported-device-notice").getByRole("button", { name: "Continuar en esta ventana" }).click();
    await adminPage.locator(".admin-main h1", { hasText: "Administración de Vecidya" }).waitFor();
    await adminContext.close();
  }
  phase = "internal services table and assignment controls";
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(new URL(`/app/internal/services?organizationId=${organizationId}`, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Servicios por organización" }).waitFor();
  const serviceRows = page.locator(".admin-service-table tbody tr");
  if (await serviceRows.count() !== 3) throw new Error(`Se esperaban tres servicios de catálogo para el espacio de prueba; se recibieron ${await serviceRows.count()}.`);
  if (await page.getByRole("region", { name: "Asignaciones de servicios" }).getAttribute("tabindex") !== "0") throw new Error("La tabla no permite acceder por teclado a su desplazamiento horizontal.");
  for (const width of auditWidths) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    const dimensions = await page.locator(".admin-service-table-wrap").evaluate((element) => ({
      wrapper: element.clientWidth,
      table: element.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      body: document.body.scrollWidth,
      pageStyles: [document.querySelector(".admin-shell"), document.querySelector(".admin-frame"), document.querySelector("#internal-page-content"), document.querySelector(".admin-main"), document.querySelector(".admin-table-wrap")].map((node) => node && ({
        selector: node.id || node.className,
        width: Math.round(node.getBoundingClientRect().width),
        scrollWidth: node.scrollWidth,
        minWidth: getComputedStyle(node).minWidth,
        widthStyle: getComputedStyle(node).width,
      })),
      offenders: [...document.body.querySelectorAll("*")].filter((node) => !node.closest(".admin-table-wrap") && node.scrollWidth > node.clientWidth + 1).map((node) => ({
        tag: node.tagName,
        className: typeof node.className === "string" ? node.className : "",
        right: Math.round(node.getBoundingClientRect().right),
        width: Math.round(node.getBoundingClientRect().width),
      })).filter((node) => node.right > document.documentElement.clientWidth + 1).slice(0, 8),
    }));
    if (screenshotDirectory && width === 320) await page.screenshot({ path: join(screenshotDirectory, "vecidya-admin-services-overflow-debug.png"), fullPage: true });
    if (dimensions.wrapper > dimensions.viewport + 1 || dimensions.document > dimensions.viewport + 1 || (width < 1000 && dimensions.table <= dimensions.wrapper)) {
      throw new Error(`La tabla de servicios no se adapta/contiene correctamente a ${width}px: ${JSON.stringify(dimensions)}.`);
    }
    if (width === 1366 && dimensions.table > dimensions.wrapper + 1) {
      throw new Error(`La tabla de servicios requiere scroll horizontal innecesario en escritorio: ${JSON.stringify(dimensions)}.`);
    }
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-admin-services-desktop.png"), fullPage: true });
  await page.getByLabel("Buscar asignaciones").fill("Presencia digital");
  if (await serviceRows.count() !== 1) throw new Error("La búsqueda de servicios no redujo la tabla a la coincidencia esperada.");
  await page.getByLabel("Asignación").selectOption("unassigned");
  if (await serviceRows.count() !== 1) throw new Error("El filtro de asignaciones no conserva la fila sin asignación buscada.");
  await page.getByLabel("Asignación").selectOption("active");
  if (await serviceRows.count() !== 0) throw new Error("El filtro de estado mostró como activa una fila todavía sin asignar.");
  await page.getByLabel("Asignación").selectOption("all");
  const presenceRow = serviceRows.filter({ hasText: "Presencia digital" });
  await presenceRow.locator('select[name="status"]').selectOption("active");
  await presenceRow.getByRole("button", { name: "Asignar" }).click();
  await page.getByText(/Presencia digital: estado actualizado a Activo\./).waitFor();
  const persistedAssignment = query(`SELECT status FROM organization_service WHERE organization_id=${sqlLiteral(organizationId)} AND service_id='service-presence';`)[0];
  const savedStatus = await presenceRow.locator("td").nth(2).innerText();
  const savedSelectValue = await presenceRow.locator('select[name="status"]').inputValue();
  if (persistedAssignment?.status !== "active") throw new Error(`El servidor no persistió el estado seleccionado: ${JSON.stringify(persistedAssignment ?? null)}.`);
  if (!savedStatus.includes("Activo")) throw new Error(`La lista no actualizó el estado tras guardar (persistido: ${persistedAssignment.status}; mostrado: ${savedStatus}; selector: ${savedSelectValue}).`);
  await page.getByLabel("Asignación").selectOption("active");
  if (await serviceRows.count() !== 1) throw new Error(`El estado seleccionado no se guardó en la asignación objetivo (resultado: ${await serviceRows.count()}, estado visible: ${savedStatus}, selector: ${savedSelectValue}).`);
  if (screenshotDirectory) {
    await page.getByLabel("Buscar asignaciones").fill("");
    await page.getByLabel("Asignación").selectOption("all");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(screenshotDirectory, "vecidya-admin-services-mobile.png"), fullPage: true });
  }
  await page.goto(new URL("/app/internal", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, "vecidya-internal-dashboard-mobile.png"), fullPage: true });
  if (errors.length) throw new Error(`Errores de navegador: ${errors.join(" | ")}`);

  if (screenshotDirectory) {
    mkdirSync(screenshotDirectory, { recursive: true });
    writeFileSync(join(screenshotDirectory, "dashboard-gate-diagnostics.json"), `${JSON.stringify({ capturedAt: new Date().toISOString(), localWorker: baseUrl, diagnostics: gateDiagnostics }, null, 2)}\n`);
  }

  console.log(JSON.stringify({ result: "PASS", routes: ["/app", "/app/internal", "/app/internal/services"], widths: auditWidths, clientDrawer: "opens and closes on route navigation at 390/768/980px", internalDrawer: "opens and closes on route navigation at 390/768/980px", screenshots: screenshotDirectory ?? "not requested" }, null, 2));
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
