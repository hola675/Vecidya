import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();
const ownerEmail = `7c-owner-${suffix}@vecidya.test`;
const inviterEmail = `7c-inviter-${suffix}@vecidya.test`;
const inviterId = crypto.randomUUID();
const fixtureOrganizationId = crypto.randomUUID();
const invitationId = crypto.randomUUID();
const billingAccountId = crypto.randomUUID();
const priceId = crypto.randomUUID();
const licenseAId = crypto.randomUUID();
const licenseBId = crypto.randomUUID();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-profile-experience-"));
  const file = join(directory, "fixture.sql");
  writeFileSync(file, sql, "utf8");
  const wranglerCli = fileURLToPath(import.meta.resolve("wrangler"));
  const result = spawnSync(process.execPath, [wranglerCli, "d1", "execute", "DB", "--local", "--file", file], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.error || result.status !== 0) throw new Error(`D1 local fixture failed: ${result.error?.message ?? result.stderr ?? result.stdout}`);
}

function seedLicense(ownerUserId, organizationId, licenseId) {
  const now = Date.now();
  const accountAndPrice = licenseId === licenseAId
    ? `INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at) VALUES ('${billingAccountId}', '${ownerUserId}', 'individual', ${now}, ${now}); INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES ('${priceId}', 'cuadra', 'USD', 3900, 'monthly', ${now}, 'active', ${now}, ${now});`
    : "";
  executeD1(`${accountAndPrice} INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${licenseId}', '${organizationId}', '${billingAccountId}', 'cuadra', '${priceId}', 'active', ${now}, ${now}, ${now}, ${now});`);
}

function cleanup() {
  executeD1(`
    DELETE FROM organization_license WHERE id IN ('${licenseAId}', '${licenseBId}');
    DELETE FROM billing_account WHERE id = '${billingAccountId}';
    DELETE FROM license_price WHERE id = '${priceId}';
    DELETE FROM business_profile WHERE organization_id IN (SELECT id FROM organization WHERE slug IN ('profile-fixture-${suffix}', 'org-a-${suffix}', 'org-b-${suffix}'));
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug IN ('profile-fixture-${suffix}', 'org-a-${suffix}', 'org-b-${suffix}'));
    DELETE FROM invitation WHERE organization_id IN (SELECT id FROM organization WHERE slug IN ('profile-fixture-${suffix}', 'org-a-${suffix}', 'org-b-${suffix}')) OR email IN ('${ownerEmail}', '${inviterEmail}');
    DELETE FROM organization WHERE slug IN ('profile-fixture-${suffix}', 'org-a-${suffix}', 'org-b-${suffix}');
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email IN ('${ownerEmail}', '${inviterEmail}'));
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email IN ('${ownerEmail}', '${inviterEmail}'));
    DELETE FROM verification WHERE identifier IN ('${ownerEmail}', '${inviterEmail}');
    DELETE FROM user WHERE email IN ('${ownerEmail}', '${inviterEmail}');
  `);
}

async function assertResponsive(page, label) {
  for (const width of [1366, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!hasHorizontalOverflow, `${label} tiene overflow horizontal a ${width}px.`);
  }
}

async function captureIfRequested(page, name) {
  const directory = process.env.APP_MINI_CAPTURE_DIR;
  if (!directory) return;
  mkdirSync(directory, { recursive: true });
  for (const [device, width] of [["desktop", 1366], ["mobile", 390]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ fullPage: true, path: join(directory, `app-mini-01-${name}-${device}.png`) });
  }
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.values()].map(({ name, value }) => `${name}=${value}`).join("; "));
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
      const [pair, ...attributes] = setCookie.split(";").map((attribute) => attribute.trim());
      const [name, ...value] = pair.split("=");
      const cookie = { name, value: value.join("=") };
      for (const attribute of attributes) {
        const [attributeName, attributeValue] = attribute.split("=", 2);
        if (attributeName.toLowerCase() === "path") cookie.path = attributeValue;
        if (attributeName.toLowerCase() === "secure") cookie.secure = true;
        if (attributeName.toLowerCase() === "httponly") cookie.httpOnly = true;
        if (attributeName.toLowerCase() === "samesite" && ["strict", "lax", "none"].includes(attributeValue.toLowerCase())) {
          cookie.sameSite = attributeValue[0].toUpperCase() + attributeValue.slice(1).toLowerCase();
        }
      }
      this.#cookies.set(name, cookie);
    }
    return response;
  }

  json(path, body, extraHeaders = {}) {
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/json", ...extraHeaders }, body: JSON.stringify(body) });
  }

  cookies() {
    return [...this.#cookies.values()];
  }

  form(path, values) {
    const body = new URLSearchParams(values);
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  }
}

async function createIdentity() {
  const client = new SessionClient();
  const now = Date.now();
  executeD1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES ('${inviterId}', 'Profile test inviter', '${inviterEmail}', 1, ${now}, ${now}); INSERT INTO organization (id, name, slug, created_at) VALUES ('${fixtureOrganizationId}', 'Profile test fixture', 'profile-fixture-${suffix}', ${now}); INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${invitationId}', '${fixtureOrganizationId}', '${ownerEmail}', 'member', 'pending', ${now + 86400000}, ${now}, '${inviterId}');`);
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `7C Owner ${suffix}`,
    email: ownerEmail,
    password: `test-only-password-${suffix}`,
  }, { "X-Vecidya-Invitation": invitationId });
  assert(signUp.status === 200, `No se pudo registrar el propietario: ${signUp.status}`);
  const ownerUserId = (await signUp.json()).user.id;
  const organization = await client.json("/api/auth/organization/create", {
    name: `Organización A ${suffix}`,
    slug: `org-a-${suffix}`,
  });
  assert(organization.status === 200, `No se pudo crear la organización A: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  assert(organizationId, "La organización A no devolvió ID.");
  seedLicense(ownerUserId, organizationId, licenseAId);
  return { client, ownerUserId, organizationId };
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

try {
const { client, ownerUserId, organizationId: organizationA } = await createIdentity();
const organizationBResponse = await client.json("/api/auth/organization/create", {
  name: `Organización B ${suffix}`,
  slug: `org-b-${suffix}`,
});
assert(organizationBResponse.status === 200, `No se pudo crear la organización B: ${organizationBResponse.status}`);
const organizationB = (await organizationBResponse.json()).id;
seedLicense(ownerUserId, organizationB, licenseBId);

await client.json("/api/auth/organization/set-active", { organizationId: organizationA });
const incomplete = await client.form("/app/business-profile", {
  displayName: `Negocio A ${suffix}`,
  slug: `negocio-a-${suffix}`,
  intent: "publish",
});
const incompleteHtml = await incomplete.text();
assert(incomplete.status === 200, `El perfil incompleto devolvió ${incomplete.status}`);
assert(incompleteHtml.includes("Tu perfil todavía necesita:") && incompleteHtml.includes("Descripción corta") && incompleteHtml.includes("Categoría"), "La UI no explica todos los campos pendientes.");
await expectStatus(client.form("/app/business-profile", {
  displayName: `Negocio A ${suffix}`,
  slug: `negocio-a-${suffix}`,
  shortDescription: "Atención local con información clara.",
  category: "Servicios",
  city: "Bogotá",
  phone: "+573244321864",
  whatsapp: "+573244321864",
  intent: "save",
}), 200, "El guardado del borrador A");

await client.json("/api/auth/organization/set-active", { organizationId: organizationB });
await expectStatus(client.form("/app/business-profile", {
  displayName: `Negocio B ${suffix}`,
  slug: `negocio-b-${suffix}`,
  shortDescription: "Un negocio local de prueba.",
  description: "Descripción de prueba para validar la experiencia privada.",
  category: "Servicios",
  city: "La Habana",
  country: "Cuba",
  phone: "+5355551234",
  whatsapp: "+5355551234",
  publicEmail: `contacto-${suffix}@example.invalid`,
  websiteUrl: "https://example.invalid/negocio",
  serviceMode: "remote",
  serviceArea: "Toda Cuba",
  intent: "publish",
}), 200, "La publicación completa");

const publicProfile = await expectStatus(client.fetch(`/vecindario/negocio-b-${suffix}`), 200, "El perfil público publicado");
const publicHtml = await publicProfile.text();
assert(publicHtml.includes(`Negocio B ${suffix}`), "El perfil público no corresponde a la organización B.");
assert(publicHtml.includes("Escribir por WhatsApp") && publicHtml.includes("https://wa.me/5355551234"), "El perfil público no prioriza el contacto directo del negocio.");
assert(publicHtml.includes("tel:+5355551234") && publicHtml.includes(`mailto:contacto-${suffix}@example.invalid`), "El perfil público no conserva los canales directos configurados.");
assert(publicHtml.includes("Toda Cuba") && publicHtml.includes("Remoto / virtual"), "El perfil público no presenta cobertura y modalidad reales.");
const heroStart = publicHtml.indexOf('class="public-business-profile__header"');
const heroEnd = publicHtml.indexOf("</section>", heroStart);
assert(publicHtml.slice(heroStart, heroEnd).includes('href="https://wa.me/5355551234"'), "El hero no ofrece el canal real prioritario del negocio.");
assert(!publicHtml.includes("Cada perfil conecta con una decisión real."), "El minisitio conserva una CTA genérica de Vecidya en vez de priorizar el negocio.");

await client.json("/api/auth/organization/set-active", { organizationId: organizationA });
const profileA = await expectStatus(client.fetch("/app/business-profile"), 200, "El cambio a la organización A");
const profileAHtml = await profileA.text();
assert(profileAHtml.includes(`Negocio A ${suffix}`), "Al volver a A no se mostró el perfil A.");
assert(!profileAHtml.includes(`Negocio B ${suffix}`), "El perfil B se filtró en la organización A.");
assert(!profileAHtml.includes("URL del logo") && !/name="logoUrl"/.test(profileAHtml), "el logo ya no se captura como URL heredada en los datos del negocio");

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
try {
  const context = await browser.newContext();
  const cookieDomain = new URL(baseUrl).hostname;
  await context.addCookies(client.cookies().map(({ name, value, path, secure, httpOnly, sameSite }) => ({
    name,
    value,
    domain: cookieDomain,
    path: path ?? "/",
    ...(secure ? { secure } : {}),
    ...(httpOnly ? { httpOnly } : {}),
    ...(sameSite ? { sameSite } : {}),
  })));
  const page = await context.newPage();
  await page.goto(new URL("/app/business-profile", baseUrl).toString(), { waitUntil: "networkidle" });
  const previewToggle = page.getByRole("button", { name: "Vista previa del minisitio" });
  assert(await previewToggle.isVisible(), "El editor no ofrece vista previa privada del minisitio.");
  await previewToggle.click();
  const preview = page.getByRole("region", { name: "Vista previa privada del minisitio" });
  assert(await preview.isVisible(), "La vista previa privada no se abrió.");
  assert(await preview.getByRole("heading", { name: `Negocio A ${suffix}`, exact: true }).isVisible(), "La vista previa no usa el nombre guardado del perfil activo.");
  await page.getByLabel("Nombre visible").fill(`Negocio A editado ${suffix}`);
  assert(await preview.getByRole("heading", { name: `Negocio A editado ${suffix}`, exact: true }).isVisible(), "La vista previa no refleja los cambios sin guardar.");
  await page.locator('input[name="hours_1_opens"]').fill("09:00");
  assert(!(await preview.innerText()).includes("null"), "La vista previa publica un horario incompleto como si fuera válido.");
  await page.locator('input[name="hours_1_closes"]').fill("17:00");
  assert(await preview.getByText("Lun · 09:00–17:00").isVisible(), "La vista previa no refleja los horarios comerciales sin guardar.");
  assert(await preview.locator("a").count() === 0, "La vista previa privada permite activar enlaces externos.");
  await assertResponsive(page, "Editor y vista previa privada");
  await captureIfRequested(page, "editor");
  await page.goto(new URL("/app", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.getByRole("progressbar", { name: "100% del perfil completado" }).isVisible(), "El dashboard no refleja el progreso real del perfil activo.");
  assert(await page.getByRole("link", { name: "Revisar para publicar" }).isVisible(), "El dashboard no propone la siguiente acción real para un borrador completo.");
  await assertResponsive(page, "Dashboard del cliente");
  await captureIfRequested(page, "dashboard");
  await page.goto(new URL(`/vecindario/negocio-b-${suffix}`, baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: `Negocio B ${suffix}`, exact: true }).isVisible(), "El perfil público no cargó durante la verificación responsive.");
  await assertResponsive(page, "Minisitio público");
  await captureIfRequested(page, "public");
} finally {
  await browser.close();
}

const anonymousProfile = await new SessionClient().fetch("/app/business-profile");
assert(anonymousProfile.status >= 300 && anonymousProfile.status < 400, "La vista previa/editor privada no exige una sesión autenticada.");

await client.json("/api/auth/organization/set-active", { organizationId: organizationB });
const profileB = await expectStatus(client.fetch("/app/business-profile"), 200, "El cambio a la organización B");
const profileBHtml = await profileB.text();
assert(profileBHtml.includes(`Negocio B ${suffix}`) && !profileBHtml.includes(`Negocio A ${suffix}`), "El cambio a B no aisló el perfil B.");

console.log("PASS: validación/publicación, CTA, preview en vivo, aislamiento A/B y responsive 1366/768/390/360 verificados.");
} finally {
  cleanup();
}
