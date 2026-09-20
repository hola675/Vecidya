import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const suffix = Date.now().toString();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-product-evolution-b-"));
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

async function createIdentity() {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `Multi Org Owner ${suffix}`,
    email: `multi-org-owner-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `No se pudo registrar al usuario: ${signUp.status}`);
  return client;
}

async function createOrganization(client, key) {
  const response = await client.json("/api/auth/organization/create", {
    name: `Multi Org ${key} ${suffix}`,
    slug: `multi-org-${key.toLowerCase()}-${suffix}`,
  });
  if (response.status !== 200) {
    throw new Error(`No se pudo crear la organización ${key}: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).id;
}

async function setActive(client, organizationId, label) {
  await expectStatus(client.json("/api/auth/organization/set-active", { organizationId }), 200, label);
}

async function publishProfile(client, key, organizationId) {
  await setActive(client, organizationId, `Activar organización ${key} para publicar perfil`);
  const response = await expectStatus(client.form("/app/business-profile", {
    displayName: `Negocio Multi ${key} ${suffix}`,
    slug: `negocio-multi-${key.toLowerCase()}-${suffix}`,
    shortDescription: `Perfil de prueba efímero para la organización ${key}.`,
    description: `Descripción completa de prueba para validar aislamiento multi-organización en ${key}.`,
    category: "Servicios",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
  }), 200, `Publicar perfil ${key}`);
  const html = await response.text();
  assert(html.includes("Perfil publicado.") || html.includes(`Negocio Multi ${key} ${suffix}`), `La publicación del perfil ${key} no se confirmó.`);
}

async function assertBusinessProfileIsolation(client, organizationId, key, expectedName, unexpectedNames) {
  await setActive(client, organizationId, `Activar organización ${key} para /app/business-profile`);
  const response = await expectStatus(client.fetch("/app/business-profile"), 200, `/app/business-profile en organización ${key}`);
  const html = await response.text();
  assert(html.includes(expectedName), `/app/business-profile de ${key} no mostró su propio perfil.`);
  for (const unexpectedName of unexpectedNames) {
    assert(!html.includes(unexpectedName), `/app/business-profile de ${key} filtró el perfil de otra organización: ${unexpectedName}.`);
  }
}

function assertSwitcherSelected(html, organizationId, label) {
  assert(html.includes(`value="${organizationId}" selected`), `El selector de organización en ${label} no marcó la organización activa esperada.`);
}

async function assertServicesIsolation(client, organizationId, key, expectedLabel, unexpectedLabels) {
  await setActive(client, organizationId, `Activar organización ${key} para /app/services`);
  const response = await expectStatus(client.fetch("/app/services"), 200, `/app/services en organización ${key}`);
  const html = await response.text();
  assert(html.includes(`Multi Org ${key} ${suffix}`), `/app/services no mostró la organización activa ${key} en el encabezado.`);
  assert(html.includes(expectedLabel), `/app/services de ${key} no mostró su propio servicio.`);
  for (const unexpectedLabel of unexpectedLabels) {
    assert(!html.includes(unexpectedLabel), `/app/services de ${key} filtró un servicio de otra organización: ${unexpectedLabel}.`);
  }
}

function cleanup() {
  executeD1(`
    DELETE FROM business_profile WHERE slug LIKE 'negocio-multi-%-${suffix}';
    DELETE FROM organization_service WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'multi-org-%-${suffix}');
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'multi-org-%-${suffix}');
    DELETE FROM invitation WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'multi-org-%-${suffix}');
    DELETE FROM organization WHERE slug LIKE 'multi-org-%-${suffix}';
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'multi-org-owner-${suffix}@vecidya.test');
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'multi-org-owner-${suffix}@vecidya.test');
    DELETE FROM verification WHERE identifier LIKE 'multi-org-owner-${suffix}@vecidya.test';
    DELETE FROM user WHERE email LIKE 'multi-org-owner-${suffix}@vecidya.test';
  `);
}

const client = await createIdentity();

try {
  // 1. User A pertenece a ambas organizaciones (owner de las dos vía creación directa).
  const organizationA = await createOrganization(client, "A");
  const organizationB = await createOrganization(client, "B");

  const switcherHtml = await (await expectStatus(client.fetch("/app"), 200, "/app tras crear ambas organizaciones")).text();
  assert(switcherHtml.includes(`Multi Org A ${suffix}`) && switcherHtml.includes(`Multi Org B ${suffix}`), "El selector de organización no lista ambas organizaciones del usuario.");

  // 2-3. Seleccionar Organization A y verificar que /app refleja A.
  await setActive(client, organizationA, "Seleccionar organización A");
  const appA = await (await expectStatus(client.fetch("/app"), 200, "/app en organización A antes de publicar")).text();
  assert(appA.includes(`Multi Org A ${suffix}`), "/app no reflejó la organización A recién seleccionada.");
  assert(appA.includes("Rol:") && appA.includes("owner"), "/app no reflejó el rol de owner en la organización A.");

  await publishProfile(client, "A", organizationA);
  await publishProfile(client, "B", organizationB);

  const now = Date.now();
  executeD1(`
    INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${organizationA}', 'service-presence', 'active', ${now}, ${now}),
      ('${crypto.randomUUID()}', '${organizationB}', 'service-marketing', 'pending', ${now}, ${now});
  `);

  // 4. /app/business-profile carga únicamente Profile A.
  await assertBusinessProfileIsolation(client, organizationA, "A", `Negocio Multi A ${suffix}`, [`Negocio Multi B ${suffix}`]);

  // 5. /app/services carga únicamente Services A.
  await assertServicesIsolation(client, organizationA, "A", "Presencia digital", ["Marketing"]);

  // 6-7. Cambiar a Organization B y verificar que /app refleja B.
  await setActive(client, organizationB, "Seleccionar organización B");
  const appB = await (await expectStatus(client.fetch("/app"), 200, "/app en organización B")).text();
  assert(appB.includes(`Multi Org B ${suffix}`), "/app no reflejó la organización B tras el cambio.");
  assertSwitcherSelected(appB, organizationB, "/app tras cambiar a B");
  assert(appB.includes(`Negocio Multi B ${suffix}`) && !appB.includes(`Negocio Multi A ${suffix}`), "/app no aisló el perfil de negocio al cambiar a B.");

  // 8. /app/business-profile carga únicamente Profile B.
  await assertBusinessProfileIsolation(client, organizationB, "B", `Negocio Multi B ${suffix}`, [`Negocio Multi A ${suffix}`]);

  // 9. /app/services carga únicamente Services B.
  await assertServicesIsolation(client, organizationB, "B", "Marketing", ["Presencia digital"]);

  // 10. Volver a A restaura contexto A.
  await setActive(client, organizationA, "Volver a organización A");
  const appABack = await (await expectStatus(client.fetch("/app"), 200, "/app al volver a A")).text();
  assert(appABack.includes(`Multi Org A ${suffix}`), "/app no restauró el contexto de A al volver.");
  assertSwitcherSelected(appABack, organizationA, "/app al volver a A");
  assert(appABack.includes(`Negocio Multi A ${suffix}`) && !appABack.includes(`Negocio Multi B ${suffix}`), "El perfil de A no se restauró correctamente al volver.");
  await assertBusinessProfileIsolation(client, organizationA, "A", `Negocio Multi A ${suffix}`, [`Negocio Multi B ${suffix}`]);
  await assertServicesIsolation(client, organizationA, "A", "Presencia digital", ["Marketing"]);

  // 11-12. Ninguna operación sobre A modifica B y viceversa: mutar A y confirmar que B no cambia, y mutar B y confirmar que A no cambia.
  await setActive(client, organizationA, "Activar A para mutación de control");
  await expectStatus(client.form("/app/business-profile", {
    displayName: `Negocio Multi A ${suffix}`,
    slug: `negocio-multi-a-${suffix}`,
    shortDescription: `Perfil de prueba efímero para la organización A, actualizado.`,
    description: `Descripción completa de prueba para validar aislamiento multi-organización en A, marca de control mutacion-control-a-${suffix}.`,
    category: "Servicios",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
  }), 200, "Mutación de control sobre el perfil A");
  await assertBusinessProfileIsolation(client, organizationB, "B", `Negocio Multi B ${suffix}`, [`Negocio Multi A ${suffix}`, `mutacion-control-a-${suffix}`]);

  await setActive(client, organizationB, "Activar B para mutación de control");
  await expectStatus(client.form("/app/business-profile", {
    displayName: `Negocio Multi B ${suffix}`,
    slug: `negocio-multi-b-${suffix}`,
    shortDescription: `Perfil de prueba efímero para la organización B, actualizado.`,
    description: `Descripción completa de prueba para validar aislamiento multi-organización en B, marca de control mutacion-control-b-${suffix}.`,
    category: "Servicios",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
  }), 200, "Mutación de control sobre el perfil B");
  await assertBusinessProfileIsolation(client, organizationA, "A", `Negocio Multi A ${suffix}`, [`Negocio Multi B ${suffix}`, `mutacion-control-b-${suffix}`]);

  console.log("PASS: PRODUCT-EVOLUTION-001 B verificó membresía múltiple del mismo usuario, cambio de organización activa, aislamiento de BusinessProfile y Services en ambas direcciones, restauración de contexto al volver a A, y ausencia de contaminación cross-tenant tras mutaciones de control en A y B.");
} finally {
  cleanup();
}
