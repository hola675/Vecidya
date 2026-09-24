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
  const directory = mkdtempSync(join(tmpdir(), "vecidya-7d-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
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
}

async function createIdentity() {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `7D Owner ${suffix}`,
    email: `7d-owner-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `No se pudo registrar el propietario: ${signUp.status}`);
  return client;
}

async function createOrganization(client, key) {
  const response = await client.json("/api/auth/organization/create", {
    name: `Organización ${key} ${suffix}`,
    slug: `org-${key}-${suffix}`,
  });
  assert(response.status === 200, `No se pudo crear la organización ${key}: ${response.status}`);
  return (await response.json()).id;
}

async function servicesPage(client, organizationId) {
  const active = await client.json("/api/auth/organization/set-active", { organizationId });
  assert(active.status === 200, `No se pudo activar la organización ${organizationId}: ${active.status}`);
  const response = await client.fetch("/app/services");
  assert(response.status === 200, `/app/services devolvió ${response.status}`);
  return renderedServices(await response.text());
}

function textContent(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// Las aserciones de tenant miran solo el <main> de la ruta y sus tarjetas de servicio:
// el shell de /app (sidebar, tagline, selector de organización) es común a toda organización.
function renderedServices(html) {
  const main = html.match(/<main\b[^>]*\bid="client-page-content"[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert(main, "/app/services no renderizó su contenido principal.");
  const list = main.match(/<div\b[^>]*\baria-label="Servicios de la organización"[^>]*>([\s\S]*)$/)?.[1];
  const cards = list
    ? [...list.matchAll(/<section\b[^>]*\bclass="[^"]*\bservice-card\b[^"]*"[^>]*>([\s\S]*?)<\/section>/g)].map(([, card]) => ({
        name: textContent(card.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ""),
        status: textContent(card.match(/<span\b[^>]*\bclass="badge\b[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? ""),
      }))
    : [];
  return {
    heading: textContent(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ""),
    hasList: Boolean(list),
    cards,
    names: cards.map((card) => card.name).sort(),
    text: textContent(main),
    html,
  };
}

function describe(page) {
  return JSON.stringify(page.cards);
}

const client = await createIdentity();
const organizationA = await createOrganization(client, "A");
const organizationB = await createOrganization(client, "B");
const organizationEmpty = await createOrganization(client, "empty");
const now = Date.now();

executeD1(`
  INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${organizationA}', 'service-presence', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${organizationA}', 'service-crm', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${organizationB}', 'service-marketing', 'pending', ${now}, ${now});
`);

const pageA = await servicesPage(client, organizationA);
assert(pageA.heading === `Organización A ${suffix}`, `A no quedó como organización activa: «${pageA.heading}».`);
assert(!pageA.names.includes("Marketing"), `A mostró el servicio de B: ${describe(pageA)}`);
assert(
  pageA.names.join("|") === "CRM|Presencia digital" && pageA.cards.every((card) => card.status === "Activo"),
  `A no mostró exactamente sus servicios activos: ${describe(pageA)}`,
);
assert(!pageA.html.includes("Abrir CRM") && !pageA.html.includes("pipeline") && !pageA.html.includes("oportunidades"), "A mostró capacidades CRM fuera de alcance.");

const pageB = await servicesPage(client, organizationB);
assert(pageB.heading === `Organización B ${suffix}`, `B no quedó como organización activa: «${pageB.heading}».`);
assert(!pageB.names.includes("Presencia digital") && !pageB.names.includes("CRM"), `B conservó servicios de A después del cambio de organización: ${describe(pageB)}`);
assert(pageB.names.join("|") === "Marketing" && pageB.cards[0].status === "Pendiente", `B no mostró solo Marketing pendiente: ${describe(pageB)}`);

const emptyPage = await servicesPage(client, organizationEmpty);
assert(!emptyPage.hasList && emptyPage.cards.length === 0, `La organización sin servicios mostró servicios: ${describe(emptyPage)}`);
assert(emptyPage.text.includes("Aún no hay servicios asociados"), "La organización sin servicios no mostró empty state.");

console.log("PASS: servicios reales, estados humanizados, aislamiento A/B, cambio de tenant, CRM sin herramienta y empty state verificados.");
