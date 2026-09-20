import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const suffix = Date.now().toString();
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const password = `test-only-password-${suffix}`;
const ownerAEmail = `product-b-owner-a-${suffix}@vecidya.test`;
const ownerBEmail = `product-b-owner-b-${suffix}@vecidya.test`;
const memberEmail = `product-b-member-${suffix}@vecidya.test`;
const noOrgEmail = `product-b-no-org-${suffix}@vecidya.test`;

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-product-b-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr || result.stdout}`);
  return result.stdout;
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }

  json(path, body) {
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  }

  form(path, values) {
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values) });
  }
}

async function signUp(name, email) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name, email, password });
  if (response.status !== 200) {
    throw new Error(`No se pudo registrar ${email}: ${response.status} ${await response.text()}`);
  }
  const body = await response.json();
  return { client, userId: body.user.id, email };
}

async function createOrganization(client, key) {
  const response = await client.json("/api/auth/organization/create", {
    name: `Cliente ${key} ${suffix}`,
    slug: `product-b-${key.toLowerCase()}-${suffix}`,
  });
  if (response.status !== 200) {
    throw new Error(`No se pudo crear organización ${key}: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).id;
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

async function setupData() {
  const ownerA = await signUp(`Product B Owner A ${suffix}`, ownerAEmail);
  const ownerB = await signUp(`Product B Owner B ${suffix}`, ownerBEmail);
  const member = await signUp(`Product B Member ${suffix}`, memberEmail);
  const noOrg = await signUp(`Product B No Org ${suffix}`, noOrgEmail);

  const orgA = await createOrganization(ownerA.client, "A");
  const orgASecond = await createOrganization(ownerA.client, "A second");
  const orgB = await createOrganization(ownerB.client, "B");
  const now = Date.now();

  executeD1(`
    INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
      ('${crypto.randomUUID()}', '${orgA}', '${member.userId}', 'member', ${now});
    INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${orgA}', 'service-presence', 'active', ${now}, ${now}),
      ('${crypto.randomUUID()}', '${orgA}', 'service-marketing', 'pending', ${now}, ${now}),
      ('${crypto.randomUUID()}', '${orgB}', 'service-crm', 'active', ${now}, ${now});
  `);

  await expectStatus(ownerA.client.json("/api/auth/organization/set-active", { organizationId: orgA }), 200, "Activar organización A");
  await expectStatus(ownerB.client.json("/api/auth/organization/set-active", { organizationId: orgB }), 200, "Activar organización B");
  await expectStatus(member.client.json("/api/auth/organization/set-active", { organizationId: orgA }), 200, "Activar organización A para miembro");

  return { ownerA, ownerB, member, noOrg, orgA, orgASecond, orgB };
}

function cleanup() {
  executeD1(`
    DELETE FROM business_profile WHERE slug LIKE 'product-b-%-${suffix}';
    DELETE FROM organization_service WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'product-b-%-${suffix}');
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'product-b-%-${suffix}') OR user_id IN (SELECT id FROM user WHERE email LIKE 'product-b-%-${suffix}@vecidya.test');
    DELETE FROM invitation WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'product-b-%-${suffix}');
    DELETE FROM organization WHERE slug LIKE 'product-b-%-${suffix}';
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'product-b-%-${suffix}@vecidya.test');
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'product-b-%-${suffix}@vecidya.test');
    DELETE FROM verification WHERE identifier LIKE 'product-b-%-${suffix}@vecidya.test';
    DELETE FROM user WHERE email LIKE 'product-b-%-${suffix}@vecidya.test';
  `);
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 80), right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function assertPrivatePage(page, path, label, expectedText) {
  await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByText(expectedText).first().waitFor();
  await assertNoOverflow(page, label);
}

async function login(page, email) {
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/Contraseña/i).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app");
}

async function runClientJourney(viewport, data) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to fetch manifest patches")) consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await login(page, ownerAEmail);
  await page.getByLabel("Organización").selectOption(data.orgA);
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { name: `Cliente A ${suffix}` }).first().waitFor();
  await assertNoOverflow(page, `${label} /app`);
  const existingProfile = await page.getByRole("link", { name: /Editar perfil/i }).count();
  if (!existingProfile) {
    await page.getByRole("link", { name: /Crear perfil/i }).click();
    await page.waitForURL("**/app/business-profile");
    await assertNoOverflow(page, `${label} /app/business-profile`);
    await page.getByLabel("Nombre visible").fill(`Product B Negocio A ${suffix}`);
    await page.getByLabel("Slug").fill(`product-b-negocio-a-${suffix}`);
    await page.getByLabel("Descripción corta", { exact: true }).fill("Perfil privado validado desde la experiencia del cliente.");
    await page.getByLabel("Descripción", { exact: true }).fill("Este perfil demuestra que el cliente puede guardar, publicar y abrir su página pública sin mezclar datos de otro tenant.");
    await page.getByLabel("Categoría").fill("Servicios profesionales");
    await page.getByLabel("Ciudad").fill("Medellín");
    await page.getByLabel("País").fill("Colombia");
    await page.getByLabel("Teléfono").fill("+57 300 000 0000");
    await page.getByLabel("Email público").fill("hola@vecidya.com");
    await page.getByLabel("Web").fill("https://vecidya.com");
    await page.getByLabel("URL del logo").fill(`${baseUrl}/brand/vecidya-app-icon.png`);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.getByText(/Perfil guardado como borrador\.|Perfil actualizado\./).waitFor();
    if (await page.getByRole("button", { name: "Publicar perfil" }).count()) {
      await page.getByRole("button", { name: "Publicar perfil" }).click();
      await page.getByText("Perfil publicado.").waitFor();
    }
  }
  await page.getByRole("link", { name: /Ver página pública/i }).click();
  await page.waitForURL("**/vecindario/product-b-negocio-a-*");
  await page.getByText(`Product B Negocio A ${suffix}`).first().waitFor();

  await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByText("Publicado").first().waitFor();
  await page.getByText("Presencia digital: Activo").waitFor();
  await page.getByText("Marketing: Pendiente").waitFor();
  assert(!(await page.getByText("service-crm").count()), `${label} filtró estado técnico o servicio de otro tenant.`);

  await assertPrivatePage(page, "/app/services", `${label} /app/services`, "Mis servicios");
  await page.getByText("Presencia digital", { exact: true }).first().waitFor();
  await page.getByText("Marketing", { exact: true }).first().waitFor();
  assert(!(await page.getByText("Abrir CRM").count()), `${label} mostró herramienta CRM fuera de alcance.`);

  await assertPrivatePage(page, "/app/organization", `${label} /app/organization`, "Mi organización");
  assert((await page.getByText(memberEmail).count()) > 0, `${label} no mostró el miembro esperado.`);
  await page.getByText("Las invitaciones requieren correo transaccional real.").waitFor();

  await assertPrivatePage(page, "/app/account", `${label} /app/account`, "Tu identidad personal");
  await page.getByText("no modifican tu organización ni el perfil de tu negocio").waitFor();

  await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel("Abrir menú de usuario").click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL("**/login");
  assert(consoleErrors.length === 0, `${label} registró errores de consola: ${consoleErrors.join(" | ")}`);
  await browser.close();
}

const data = await setupData();
try {
  const anonymous = new SessionClient();
  await expectStatus(anonymous.fetch("/app"), 302, "Usuario sin sesión en /app");
  await expectStatus(anonymous.fetch("/app/business-profile"), 302, "Usuario sin sesión en /app/business-profile");

  await expectStatus(data.noOrg.client.fetch("/app/business-profile"), 403, "Usuario sin membresía en perfil de negocio");
  await expectStatus(data.member.client.form("/app/business-profile", {
    displayName: `Product B Miembro ${suffix}`,
    slug: `product-b-miembro-${suffix}`,
    shortDescription: "Intento sin permiso.",
    category: "Servicios",
    intent: "save",
  }), 403, "Miembro sin permiso actualizando perfil");

  await expectStatus(data.ownerA.client.form(`/api/organizations/${data.orgB}/business-profile`, {
    displayName: `Product B Intruso ${suffix}`,
    slug: `product-b-intruso-${suffix}`,
  }), 403, "Owner A intentando editar organización B por API");

  await expectStatus(data.ownerB.client.form("/app/business-profile", {
    displayName: `Product B Negocio B ${suffix}`,
    slug: `product-b-negocio-b-${suffix}`,
    shortDescription: "Perfil de B.",
    description: "Perfil aislado de la organización B.",
    category: "CRM",
    city: "Bogotá",
    country: "Colombia",
    intent: "publish",
  }), 200, "Publicar perfil B");

  await expectStatus(data.ownerA.client.json("/api/auth/organization/set-active", { organizationId: data.orgASecond }), 200, "Cambiar a segunda organización A");
  const secondApp = await (await expectStatus(data.ownerA.client.fetch("/app"), 200, "Dashboard segunda organización A")).text();
  assert(secondApp.includes(`Cliente A second ${suffix}`), "El dashboard no mostró la segunda organización activa.");
  assert(!secondApp.includes(`Product B Negocio B ${suffix}`), "El dashboard mezcló datos de la organización B.");

  await runClientJourney({ width: 1366, height: 900 }, data);
  await runClientJourney({ width: 390, height: 844 }, data);
  await runClientJourney({ width: 360, height: 800 }, data);

  console.log("PASS: PRODUCT-EXPERIENCE-001 B verificó login, /app, BusinessProfile, publicación, perfil público, servicios, organización, cuenta, logout, responsive y aislamiento tenant.");
} finally {
  cleanup();
}
