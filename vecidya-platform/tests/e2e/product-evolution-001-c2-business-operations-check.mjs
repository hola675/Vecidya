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
const password = `test-only-password-${suffix}`;

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-product-evolution-c2-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function cleanup() {
  executeD1(`
    DELETE FROM business_hours WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'c2-ops-%-${suffix}');
    DELETE FROM business_profile WHERE slug LIKE 'c2-negocio-%-${suffix}';
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'c2-ops-%-${suffix}');
    DELETE FROM organization WHERE slug LIKE 'c2-ops-%-${suffix}';
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'c2-ops-%-${suffix}@vecidya.test');
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'c2-ops-%-${suffix}@vecidya.test');
    DELETE FROM verification WHERE identifier LIKE 'c2-ops-%-${suffix}@vecidya.test';
    DELETE FROM user WHERE email LIKE 'c2-ops-%-${suffix}@vecidya.test';
  `);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
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

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

async function createIdentity(key) {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `C2 ${key} ${suffix}`,
    email: `c2-ops-${key}-${suffix}@vecidya.test`,
    password,
  });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const organization = await client.json("/api/auth/organization/create", {
    name: `C2 Ops ${key} ${suffix}`,
    slug: `c2-ops-${key}-${suffix}`,
  });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id };
}

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert(match, "El perfil público no incluyó JSON-LD.");
  return JSON.parse(match[1]);
}

function inputTag(html, name) {
  const match = html.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`));
  assert(match, `No se encontró el campo ${name} en el HTML.`);
  return match[0];
}

async function baseProfileForm(key, extra = {}) {
  return {
    displayName: `C2 Negocio ${key} ${suffix}`,
    slug: `c2-negocio-${key.toLowerCase()}-${suffix}`,
    shortDescription: `Fixture local para validar Business Operations en ${key}.`,
    category: "Servicios profesionales",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
    ...extra,
  };
}

try {

const ownerA = await createIdentity("owner-a");
const ownerB = await createIdentity("owner-b");
const ownerC = await createIdentity("owner-c");
const slugA = `c2-negocio-owner-a-${suffix}`;
const slugB = `c2-negocio-owner-b-${suffix}`;
const slugC = `c2-negocio-owner-c-${suffix}`;

// --- Validación: service_mode inválido ---

const invalidMode = await expectStatus(ownerA.client.form("/app/business-profile", await baseProfileForm("owner-a", { serviceMode: "sometimes", intent: "save" })), 200, "Guardado con service_mode inválido");
assert((await invalidMode.text()).includes("La modalidad de atención no es válida"), "La UI no rechazó una modalidad inválida con un mensaje claro.");

// --- Publicación válida A: hybrid, cobertura, sin horarios todavía ---

await expectStatus(ownerA.client.form("/app/business-profile", await baseProfileForm("owner-a", {
  serviceMode: "hybrid",
  serviceArea: "  Medellín, Envigado y Sabaneta  ",
})), 200, "Publicación de A con service_mode/service_area");

const editorABeforeHours = await (await expectStatus(ownerA.client.fetch("/app/business-profile"), 200, "Editor A antes de horarios")).text();
assert(editorABeforeHours.includes('value="hybrid" selected'), "El editor de A no conservó la modalidad hybrid.");
assert(editorABeforeHours.includes("Medellín, Envigado y Sabaneta"), "El editor de A no conservó la cobertura (debe quedar recortada con trim).");
assert(!editorABeforeHours.includes("  Medellín, Envigado y Sabaneta  "), "El editor de A no recortó los espacios de la cobertura (trim).");

// --- Validación: horarios inválidos ---

const incompleteRange = await expectStatus(ownerA.client.form("/app/business-profile", {
  intent: "save-hours",
  hours_1_opens: "09:00",
}), 200, "Horarios con rango incompleto");
assert((await incompleteRange.text()).includes("hora de apertura y cierre válidas"), "La UI no rechazó un rango de horario incompleto.");

const invertedRange = await expectStatus(ownerA.client.form("/app/business-profile", {
  intent: "save-hours",
  hours_2_opens: "18:00",
  hours_2_closes: "09:00",
}), 200, "Horarios con apertura posterior al cierre");
assert((await invertedRange.text()).includes("La hora de apertura debe ser anterior"), "La UI no rechazó apertura posterior al cierre.");

// --- Guardado válido de horarios A: Lun-Vie 09:00-17:00, Sáb cerrado, Dom sin definir ---

await expectStatus(ownerA.client.form("/app/business-profile", {
  intent: "save-hours",
  hours_1_opens: "09:00", hours_1_closes: "17:00",
  hours_2_opens: "09:00", hours_2_closes: "17:00",
  hours_3_opens: "09:00", hours_3_closes: "17:00",
  hours_4_opens: "09:00", hours_4_closes: "17:00",
  hours_5_opens: "09:00", hours_5_closes: "17:00",
  hours_6_closed: "on",
}), 200, "Guardado inicial de horarios A");

const editorAAfterHours = await (await expectStatus(ownerA.client.fetch("/app/business-profile"), 200, "Editor A tras guardar horarios")).text();
assert(inputTag(editorAAfterHours, "hours_1_opens").includes('value="09:00"') && inputTag(editorAAfterHours, "hours_1_closes").includes('value="17:00"'), "El editor de A no conservó el horario del lunes.");
assert(inputTag(editorAAfterHours, "hours_6_closed").includes("checked"), "El editor de A no marcó el sábado como cerrado.");
assert(inputTag(editorAAfterHours, "hours_7_opens").includes('value=""'), "El editor de A no debe tener horario para el domingo (sin definir).");

// --- Actualización de horarios A: lunes a viernes cambia a 09:00-18:00 ---

await expectStatus(ownerA.client.form("/app/business-profile", {
  intent: "save-hours",
  hours_1_opens: "09:00", hours_1_closes: "18:00",
  hours_2_opens: "09:00", hours_2_closes: "18:00",
  hours_3_opens: "09:00", hours_3_closes: "18:00",
  hours_4_opens: "09:00", hours_4_closes: "18:00",
  hours_5_opens: "09:00", hours_5_closes: "18:00",
  hours_6_closed: "on",
}), 200, "Actualización de horarios A");

const editorAUpdated = await (await expectStatus(ownerA.client.fetch("/app/business-profile"), 200, "Editor A tras actualizar horarios")).text();
assert(inputTag(editorAUpdated, "hours_1_closes").includes('value="18:00"'), "El editor de A no reflejó la actualización de horarios.");

// --- Organización B: remote, cobertura nacional, un solo horario irregular ---

await expectStatus(ownerB.client.form("/app/business-profile", await baseProfileForm("owner-b", {
  serviceMode: "remote",
  serviceArea: "Toda Colombia",
})), 200, "Publicación de B con service_mode/service_area");

await expectStatus(ownerB.client.form("/app/business-profile", {
  intent: "save-hours",
  hours_1_opens: "08:00", hours_1_closes: "12:00",
}), 200, "Guardado de horarios B (solo lunes)");

// --- Organización C: sin service_mode, sin service_area, sin horarios ---

await expectStatus(ownerC.client.form("/app/business-profile", await baseProfileForm("owner-c")), 200, "Publicación de C sin Business Operations");

// --- Aislamiento tenant en el editor privado ---

const editorB = await (await expectStatus(ownerB.client.fetch("/app/business-profile"), 200, "Editor B")).text();
assert(editorB.includes('value="remote" selected'), "El editor de B no conservó la modalidad remote.");
assert(editorB.includes("Toda Colombia") && !editorB.includes("Medellín, Envigado y Sabaneta"), "El editor de B filtró la cobertura de A.");
assert(inputTag(editorB, "hours_1_opens").includes('value="08:00"'), "El editor de B no conservó su propio horario del lunes.");
assert(!editorB.includes('value="09:00"') && !editorB.includes('value="18:00"'), "El editor de B filtró horarios de la organización A.");

console.log("PASS: HTTP — validación de service_mode/horarios, rechazo de valores inválidos, trim de cobertura, guardado/actualización/reload de horarios (abierto, cerrado, ausente), y aislamiento tenant de los tres campos nuevos en el editor privado.");

// --- Perfil público: modalidad, cobertura, horarios compactados, sin bloques vacíos ---

const publicA = await (await expectStatus(ownerA.client.fetch(`/vecindario/${slugA}`), 200, "Perfil público A")).text();
assert(publicA.includes("Presencial y remoto"), "El perfil público de A no mostró la modalidad.");
assert(publicA.includes("Medellín, Envigado y Sabaneta"), "El perfil público de A no mostró la cobertura.");
assert(publicA.includes("Lun–Vie · 09:00–18:00"), "El perfil público de A no compactó correctamente el horario Lun-Vie.");
assert(publicA.includes("Sáb · Cerrado"), "El perfil público de A no mostró el sábado cerrado.");
assert(!publicA.includes("Dom"), "El perfil público de A no debe mostrar el domingo (sin definir).");

const jsonLdA = extractJsonLd(publicA);
assert(jsonLdA.areaServed === "Medellín, Envigado y Sabaneta", "El JSON-LD de A no incluyó areaServed correctamente.");
assert(Array.isArray(jsonLdA.openingHoursSpecification) && jsonLdA.openingHoursSpecification.length === 5, "El JSON-LD de A no incluyó exactamente 5 días abiertos (Lun-Vie).");
assert(jsonLdA.openingHoursSpecification.every((spec) => spec.opens === "09:00" && spec.closes === "18:00"), "El JSON-LD de A no reflejó el horario actualizado.");
assert(jsonLdA.openingHoursSpecification.some((spec) => spec.dayOfWeek === "Monday") && !jsonLdA.openingHoursSpecification.some((spec) => spec.dayOfWeek === "Saturday" || spec.dayOfWeek === "Sunday"), "El JSON-LD de A no debe incluir el sábado cerrado ni el domingo sin definir en openingHoursSpecification.");

const publicB = await (await expectStatus(ownerB.client.fetch(`/vecindario/${slugB}`), 200, "Perfil público B")).text();
assert(publicB.includes("Remoto / virtual"), "El perfil público de B no mostró su modalidad.");
assert(publicB.includes("Toda Colombia"), "El perfil público de B no mostró su cobertura.");
assert(publicB.includes("Lun · 08:00–12:00"), "El perfil público de B no mostró su único horario irregular sin compactar de más.");
assert(!publicB.includes("Medellín, Envigado y Sabaneta") && !publicB.includes("Presencial y remoto") && !publicB.includes("Lun–Vie"), "El perfil público de B filtró datos de operación de la organización A.");

const jsonLdB = extractJsonLd(publicB);
assert(jsonLdB.areaServed === "Toda Colombia" && jsonLdB.openingHoursSpecification.length === 1, "El JSON-LD de B no reflejó su único horario.");

const publicC = await (await expectStatus(ownerC.client.fetch(`/vecindario/${slugC}`), 200, "Perfil público C")).text();
assert(!publicC.includes("Cómo atiende") && !publicC.includes("Cobertura"), "El perfil público de C no debe mostrar bloques de modalidad/cobertura vacíos.");
assert(!publicC.includes("Cuándo atiende"), "El perfil público de C no debe mostrar el bloque de horarios cuando no hay ninguno.");
const jsonLdC = extractJsonLd(publicC);
assert(!("areaServed" in jsonLdC) && !("openingHoursSpecification" in jsonLdC), "El JSON-LD de C no debe emitir areaServed ni openingHoursSpecification vacíos.");

console.log("PASS: HTTP — perfil público muestra modalidad/cobertura/horarios reales con compactación correcta, JSON-LD solo con datos válidos, y ausencia total de bloques cuando no hay Business Operations declaradas.");

// --- Mobile / overflow: editor de horarios y perfil público con datos completos ---

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function checkPublicViewport(viewport) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;

  await page.goto(new URL(`/vecindario/${slugA}`, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByText("Cuándo atiende").first().waitFor();
  await assertNoOverflow(page, `${label} perfil público con Business Operations`);

  await browser.close();
}

await checkPublicViewport({ width: 1366, height: 900 });
await checkPublicViewport({ width: 390, height: 844 });
await checkPublicViewport({ width: 360, height: 800 });

console.log("PASS: mobile — perfil público con modalidad, cobertura y horarios no genera overflow horizontal en 360/390/desktop.");

async function checkEditorViewport(viewport) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;

  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel(/Correo electrónico/i).fill(`c2-ops-owner-a-${suffix}@vecidya.test`);
  await page.getByLabel(/Contraseña/i).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app");

  // La organización activa vive en la sesión, no en el usuario: esta sesión de
  // navegador es nueva y arranca sin organización activa, aunque la misma
  // cuenta ya tenga una activa en la sesión HTTP usada para el setup.
  await page.getByLabel("Organización").selectOption(ownerA.organizationId);
  await page.waitForLoadState("networkidle");

  await page.goto(new URL("/app/business-profile", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByText("¿Cuándo atiendes?").first().waitFor();
  await assertNoOverflow(page, `${label} editor de horarios`);

  await browser.close();
}

await checkEditorViewport({ width: 360, height: 800 });

console.log("PASS: mobile — el editor de horarios (grid de 7 días) no genera overflow horizontal en 360px.");

} finally {
  cleanup();
}
