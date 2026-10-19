import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const suffix = Date.now().toString();
const email = `slug-life-${suffix}@vecidya.test`;
const inviterEmail = `slug-life-inviter-${suffix}@vecidya.test`;
const inviterId = crypto.randomUUID();
const fixtureOrganizationId = crypto.randomUUID();
const invitationId = crypto.randomUUID();
const billingAccountId = crypto.randomUUID();
const priceId = crypto.randomUUID();
const licenseId = crypto.randomUUID();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const feedbackSelector = "main .alert, main .success-message";

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-slug-lifecycle-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const wranglerCli = fileURLToPath(import.meta.resolve("wrangler"));
  const result = spawnSync(process.execPath, [wranglerCli, "d1", "execute", d1Database, "--local", "--file", file], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
}

function cleanup() {
  executeD1(`
    DELETE FROM organization_license WHERE id = '${licenseId}';
    DELETE FROM billing_account WHERE id = '${billingAccountId}';
    DELETE FROM license_price WHERE id = '${priceId}';
    DELETE FROM business_profile WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'slug-life-%-${suffix}');
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'slug-life-%-${suffix}');
    DELETE FROM invitation WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'slug-life-%-${suffix}') OR email IN ('${email}', '${inviterEmail}');
    DELETE FROM organization WHERE slug LIKE 'slug-life-%-${suffix}';
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email IN ('${email}', '${inviterEmail}'));
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email IN ('${email}', '${inviterEmail}'));
    DELETE FROM verification WHERE identifier IN ('${email}', '${inviterEmail}');
    DELETE FROM user WHERE email IN ('${email}', '${inviterEmail}');
  `);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class SessionClient {
  #cookies = new Map();

  async post(path, data, extraHeaders = {}) {
    const headers = new Headers({ "content-type": "application/json", ...extraHeaders });
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.values()].map(({ name, value }) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { method: "POST", headers, body: JSON.stringify(data), redirect: "manual" });
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
    return { status: () => response.status, json: () => response.json(), text: () => response.text() };
  }

  cookies() {
    return [...this.#cookies.values()];
  }
}

const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});

try {
  const context = await browser.newContext({ baseURL: baseUrl, viewport: { width: 1366, height: 900 } });
  const client = new SessionClient();
  const post = (path, data, headers = {}) => client.post(path, data, headers);
  const now = Date.now();
  executeD1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES ('${inviterId}', 'Slug test inviter', '${inviterEmail}', 1, ${now}, ${now}); INSERT INTO organization (id, name, slug, created_at) VALUES ('${fixtureOrganizationId}', 'Slug test fixture', 'slug-life-fixture-${suffix}', ${now}); INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${invitationId}', '${fixtureOrganizationId}', '${email}', 'member', 'pending', ${now + 86400000}, ${now}, '${inviterId}');`);
  const signUp = await post("/api/auth/sign-up/email", { name: `Slug Lifecycle ${suffix}`, email, password: `test-only-password-${suffix}` }, { "X-Vecidya-Invitation": invitationId });
  assert(signUp.status() === 200, `No se pudo registrar el propietario: ${signUp.status()}`);
  assert(client.cookies().length > 0, "El registro no creó la sesión de prueba.");
  const ownerUserId = (await signUp.json()).user.id;
  await context.addCookies(client.cookies().map(({ name, value, path, secure, httpOnly, sameSite }) => ({
    name,
    value,
    domain: new URL(baseUrl).hostname,
    path: path ?? "/",
    ...(secure ? { secure } : {}),
    ...(httpOnly ? { httpOnly } : {}),
    ...(sameSite ? { sameSite } : {}),
  })));

  const page = await context.newPage();
  const nameInput = page.getByLabel("Nombre visible", { exact: true });
  const slugInput = page.getByLabel("Enlace público", { exact: true });
  const heading = () => page.locator("main h1:visible").textContent();
  const feedback = async () => (await page.locator(feedbackSelector).allTextContents()).join(" | ");
  let profilePosts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/app/business-profile")) profilePosts += 1;
  });

  // Con el Worker en frío, networkidle puede llegar antes de que React hidrate el formulario; sin
  // hidratación el onChange del nombre no existe. Se espera a que React haya adjuntado sus props.
  async function waitForHydratedForm() {
    await page.waitForFunction(() => {
      const input = document.querySelector('input[name="displayName"]');
      return Boolean(input && Object.keys(input).some((key) => key.startsWith("__reactProps$")));
    }, undefined, { timeout: 30_000 });
  }

  async function reload() {
    await page.reload({ waitUntil: "networkidle" });
    await waitForHydratedForm();
  }

  async function openNewOrganization(key) {
    const created = await post("/api/auth/organization/create", { name: `Slug ${key} ${suffix}`, slug: `slug-life-${key}-${suffix}` });
    if (created.status() !== 200) throw new Error(`No se pudo crear la organización ${key}: ${created.status()} ${(await created.text()).slice(0, 250)}`);
    const organizationId = (await created.json()).id;
    const active = await post("/api/auth/organization/set-active", { organizationId });
    assert(active.status() === 200, `No se pudo activar la organización ${key}: ${active.status()}`);
    await page.goto("/app/business-profile", { waitUntil: "networkidle" });
    await waitForHydratedForm();
    assert((await heading()) === "Crea tu perfil de negocio", `La organización ${key} no empezó sin perfil.`);
    return organizationId;
  }

  // Un <Form> de React Router se envía por fetch, sin navegación: se espera la respuesta del POST
  // y, cuando el mensaje esperado es nuevo en pantalla, a que la revalidación lo muestre.
  async function submit(label, expectedFeedback) {
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.request().method() === "POST" && res.url().includes("/app/business-profile")),
      page.getByRole("button", { name: label, exact: true }).click(),
    ]);
    if (expectedFeedback) {
      await page.locator(feedbackSelector).filter({ hasText: expectedFeedback }).first().waitFor({ timeout: 20_000 }).catch(() => {});
      const shown = await feedback();
      assert(shown.includes(expectedFeedback), `«${label}» respondió ${response.status()} y mostró «${shown}»; se esperaba «${expectedFeedback}».`);
    }
  }

  async function fillPublicationFields() {
    await page.getByLabel("Descripción breve", { exact: true }).fill("Perfil de prueba del ciclo de vida del slug.");
    await page.getByLabel("Categoría", { exact: true }).fill("Pruebas");
  }

  // Perfil nuevo: el slug sigue al nombre, se puede sobrescribir y vuelve a seguirlo al vaciarlo.
  const initialOrganizationId = await openNewOrganization("new");
  const licensedAt = Date.now();
  executeD1(`INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at) VALUES ('${billingAccountId}', '${ownerUserId}', 'individual', ${licensedAt}, ${licensedAt}); INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES ('${priceId}', 'cuadra', 'USD', 3900, 'monthly', ${licensedAt}, 'active', ${licensedAt}, ${licensedAt}); INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${licenseId}', '${initialOrganizationId}', '${billingAccountId}', 'cuadra', '${priceId}', 'active', ${licensedAt}, ${licensedAt}, ${licensedAt}, ${licensedAt});`);
  await nameInput.fill("Mi Negocio");
  assert((await slugInput.inputValue()) === "mi-negocio", `«Mi Negocio» generó «${await slugInput.inputValue()}».`);
  await nameInput.fill("");
  await nameInput.pressSequentially("Café Medellín");
  assert((await slugInput.inputValue()) === "cafe-medellin", `«Café Medellín» tecleado generó «${await slugInput.inputValue()}».`);
  await slugInput.fill("slug-manual");
  await nameInput.fill("Otro Nombre");
  assert((await slugInput.inputValue()) === "slug-manual", "El nombre sobrescribió un slug editado manualmente.");
  await slugInput.fill("");
  await nameInput.fill("Nombre Retomado");
  assert((await slugInput.inputValue()) === "nombre-retomado", "Vaciar el slug no reanudó la generación automática.");
  await nameInput.fill("!!!");
  const postsBeforeUnusable = profilePosts;
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page.waitForTimeout(500);
  const unusable = await slugInput.evaluate((element) => ({ value: element.value, valueMissing: element.validity.valueMissing }));
  assert(unusable.value === "" && unusable.valueMissing && profilePosts === postsBeforeUnusable, `Un nombre sin caracteres utilizables no bloqueó el envío: ${JSON.stringify(unusable)}, POST=${profilePosts - postsBeforeUnusable}.`);
  console.log("PASS: perfil nuevo — slug automático normalizado (tildes y tecleo real), override manual, reanudación al vaciar y bloqueo de nombres sin caracteres utilizables.");

  // Borrador: tras el primer guardado, sin recargar, renombrar no cambia el slug.
  await openNewOrganization("draft");
  await nameInput.fill(`Borrador ${suffix}`);
  const draftSlug = await slugInput.inputValue();
  assert(draftSlug === `borrador-${suffix}`, `El borrador generó «${draftSlug}».`);
  await submit("Guardar", "Perfil guardado como borrador.");
  await nameInput.fill(`Borrador Renombrado ${suffix}`);
  assert((await slugInput.inputValue()) === draftSlug, `Sin recargar, renombrar el borrador guardado cambió su slug a «${await slugInput.inputValue()}».`);
  await submit("Guardar");
  await reload();
  assert((await nameInput.inputValue()) === `Borrador Renombrado ${suffix}` && (await slugInput.inputValue()) === draftSlug, `El borrador persistió «${await nameInput.inputValue()}» / «${await slugInput.inputValue()}».`);
  await nameInput.fill(`Borrador Tras Recarga ${suffix}`);
  assert((await slugInput.inputValue()) === draftSlug, "Tras recargar, renombrar el borrador cambió su slug.");
  console.log("PASS: borrador — el slug queda estable tras el primer guardado, sin recargar y tras recargar.");

  // Publicado: la URL pública original sigue sirviendo el perfil renombrado.
  await openNewOrganization("published");
  await nameInput.fill(`Publicado ${suffix}`);
  const publishedSlug = await slugInput.inputValue();
  await fillPublicationFields();
  await submit("Publicar perfil", "Perfil publicado.");
  await nameInput.fill(`Publicado Centro ${suffix}`);
  assert((await slugInput.inputValue()) === publishedSlug, `Sin recargar, renombrar el perfil publicado cambió su slug a «${await slugInput.inputValue()}».`);
  await submit("Guardar", "Perfil actualizado.");
  await reload();
  assert((await slugInput.inputValue()) === publishedSlug, `El perfil publicado persistió el slug «${await slugInput.inputValue()}».`);
  await nameInput.fill(`Publicado Tras Recarga ${suffix}`);
  assert((await slugInput.inputValue()) === publishedSlug, "Tras recargar, renombrar el perfil publicado cambió su slug.");

  const visitor = await browser.newContext({ baseURL: baseUrl });
  const publicPage = await visitor.newPage();
  const publicResponse = await publicPage.goto(`/vecindario/${publishedSlug}`, { waitUntil: "domcontentloaded" });
  assert(publicResponse.status() === 200, `/vecindario/${publishedSlug} devolvió ${publicResponse.status()} tras renombrar.`);
  const publicHeading = await publicPage.getByRole("heading", { level: 1 }).textContent();
  assert(publicHeading.includes(`Publicado Centro ${suffix}`), `La URL original no muestra el nombre nuevo: «${publicHeading}».`);
  const canonical = await publicPage.locator('meta[property="og:url"]').getAttribute("content");
  assert(canonical.endsWith(`/vecindario/${publishedSlug}`), `La URL canónica del perfil pasó a «${canonical}».`);
  const renamedRoute = await publicPage.goto(`/vecindario/publicado-centro-${suffix}`, { waitUntil: "domcontentloaded" });
  assert(renamedRoute.status() === 404, `Apareció una ruta nueva para el nombre renombrado (${renamedRoute.status()}).`);
  await visitor.close();
  console.log("PASS: publicado — renombrar sin recargar y tras recargar conserva el slug; la URL original responde 200 con el nombre nuevo y sigue siendo la canónica; no aparece ruta nueva.");

  // Colisión: el servidor sigue rechazando un slug ajeno y el perfil sigue siendo nuevo.
  await openNewOrganization("collision");
  await nameInput.fill(`Publicado ${suffix}`);
  assert((await slugInput.inputValue()) === publishedSlug, "El nombre repetido no generó el mismo slug.");
  await fillPublicationFields();
  await submit("Guardar", "El slug ya está en uso");
  assert((await heading()) === "Crea tu perfil de negocio", "El rechazo por colisión creó un perfil.");
  await nameInput.fill(`Alternativo ${suffix}`);
  assert((await slugInput.inputValue()) === `alternativo-${suffix}`, "Tras un guardado rechazado, el slug dejó de seguir al nombre de un perfil aún no guardado.");
  await submit("Guardar", "Perfil guardado como borrador.");
  console.log("PASS: colisión — el servidor rechaza un slug en uso sin sufijo automático y el perfil no guardado sigue generando slug.");

  // Longitud: el slug automático nunca supera el máximo del servidor.
  await openNewOrganization("long");
  const longName = `Centro Comercial ${suffix} ${"Plaza Mayor ".repeat(8)}`.trim();
  await nameInput.fill(longName);
  const longSlug = await slugInput.inputValue();
  assert(longSlug.length <= 80 && slugPattern.test(longSlug) && longSlug.startsWith(`centro-comercial-${suffix}-plaza-mayor`), `Un nombre de ${longName.length} caracteres generó «${longSlug}» (${longSlug.length}).`);
  await submit("Guardar", "Perfil guardado como borrador.");
  await reload();
  assert((await slugInput.inputValue()) === longSlug, "El slug largo recortado no se persistió tal cual.");
  console.log(`PASS: longitud — un nombre de ${longName.length} caracteres genera un slug válido de ${longSlug.length} (≤80) que el servidor acepta.`);
} finally {
  await browser.close();
  cleanup();
}
