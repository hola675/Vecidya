import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const suffix = Date.now().toString();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-c1-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
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

async function createIdentity(key) {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `C1 ${key} ${suffix}`,
    email: `c1-${key}-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);

  const organization = await client.json("/api/auth/organization/create", {
    name: `C1 Organización ${key} ${suffix}`,
    slug: `c1-org-${key}-${suffix}`,
  });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id };
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert(match, "El perfil público no incluyó JSON-LD.");
  return JSON.parse(match[1]);
}

try {
  const ownerA = await createIdentity("owner-a");
  const ownerB = await createIdentity("owner-b");
  const publishedSlug = `c1-real-profile-${suffix}`;
  const draftSlug = `c1-draft-profile-${suffix}`;

  const incomplete = await expectStatus(ownerA.client.form("/app/business-profile", {
    displayName: `C1 Perfil incompleto ${suffix}`,
    slug: publishedSlug,
    intent: "publish",
  }), 200, "Publicación incompleta");
  const incompleteHtml = await incomplete.text();
  assert(incompleteHtml.includes("Descripción corta") && incompleteHtml.includes("Categoría"), "La UI no explicó los campos requeridos para publicar.");

  await expectStatus(ownerA.client.form("/app/business-profile", {
    displayName: `C1 Vecino Real ${suffix}`,
    slug: publishedSlug,
    shortDescription: "Fixture local para validar publicación real sin datos ficticios remotos.",
    description: "",
    category: "Servicios profesionales",
    city: "",
    country: "",
    phone: "",
    publicEmail: "",
    websiteUrl: "",
    logoUrl: "",
    intent: "publish",
  }), 200, "Publicación mínima");

  const duplicate = await expectStatus(ownerB.client.form("/app/business-profile", {
    displayName: `C1 Slug duplicado ${suffix}`,
    slug: publishedSlug,
    shortDescription: "Otro fixture local que intenta reutilizar slug.",
    category: "Servicios profesionales",
    city: "La Habana",
    country: "Cuba",
    intent: "save",
  }), 200, "Intento de slug duplicado desde UI");
  assert((await duplicate.text()).includes("El slug ya está en uso"), "La UI no devolvió un error claro ante slug duplicado.");

  const apiDuplicate = await ownerB.client.form(`/api/organizations/${ownerB.organizationId}/business-profile`, {
    displayName: `C1 API duplicado ${suffix}`,
    slug: publishedSlug,
    shortDescription: "Fixture local API.",
    category: "Servicios profesionales",
    city: "La Habana",
    country: "Cuba",
  });
  assert(apiDuplicate.status === 400 && (await apiDuplicate.text()).includes("El slug ya está en uso"), "La API no protegió slug duplicado con 400 claro.");

  await expectStatus(ownerB.client.form(`/api/organizations/${ownerA.organizationId}/business-profile`, {
    displayName: `C1 Cross tenant ${suffix}`,
    slug: `c1-cross-${suffix}`,
  }), 403, "Intento cross-tenant por API");

  await expectStatus(ownerB.client.form("/app/business-profile", {
    displayName: `C1 Borrador ${suffix}`,
    slug: draftSlug,
    shortDescription: "Fixture local en borrador.",
    category: "Servicios profesionales",
    city: "Santiago de Cuba",
    country: "Cuba",
    intent: "save",
  }), 200, "Guardado de borrador");

  const directory = await (await expectStatus(ownerA.client.fetch(`/vecindario?q=${encodeURIComponent(`C1 Vecino Real ${suffix}`)}`), 200, "Directorio con búsqueda")).text();
  assert(directory.includes(`C1 Vecino Real ${suffix}`), "El directorio no mostró el perfil publicado.");
  assert(!directory.includes(`C1 Borrador ${suffix}`), "El directorio expuso un borrador.");

  const filtered = await (await expectStatus(ownerA.client.fetch("/vecindario?category=Servicios+profesionales"), 200, "Directorio filtrado por categoría")).text();
  assert(filtered.includes(`C1 Vecino Real ${suffix}`), "Los filtros no encontraron el perfil publicado.");

  await expectStatus(ownerA.client.fetch(`/vecindario/${draftSlug}`), 404, "Detalle público de borrador");

  const publicProfile = await (await expectStatus(ownerA.client.fetch(`/vecindario/${publishedSlug}`), 200, "Detalle público publicado")).text();
  assert(publicProfile.includes(`C1 Vecino Real ${suffix}`), "El perfil público no mostró el nombre publicado.");
   assert(!publicProfile.includes("Este negocio publicó su perfil con una descripción breve."), "El perfil público renderizó un panel de descripción sin contenido.");
   assert(publicProfile.includes("Este perfil todavía no tiene canales públicos de contacto."), "El perfil público no manejó contacto opcional ausente.");
   assert(publicProfile.includes('href="/vecindario"') && publicProfile.includes('href="/diagnostico"'), "El perfil público no mostró sus acciones finales.");

  const jsonLd = extractJsonLd(publicProfile);
  assert(jsonLd["@type"] === "LocalBusiness", "El JSON-LD no usa LocalBusiness.");
  assert(jsonLd.name === `C1 Vecino Real ${suffix}`, "El JSON-LD no refleja el nombre real publicado.");
  assert(jsonLd.url.endsWith(`/vecindario/${publishedSlug}`), "El JSON-LD no refleja el slug publicado.");
  assert(!("address" in jsonLd), "El JSON-LD publicó ubicación opcional vacía.");
  assert(!("telephone" in jsonLd) && !("email" in jsonLd) && !("image" in jsonLd), "El JSON-LD publicó campos opcionales vacíos.");

  console.log("PASS: C1 Real Profile Readiness verificó creación, edición, publicación, slug único, aislamiento tenant, directorio, detalle público, opcionales y JSON-LD.");
} finally {
  executeD1(`
    DELETE FROM business_profile WHERE slug LIKE 'c1-%-${suffix}' OR display_name LIKE 'C1 % ${suffix}';
    DELETE FROM organization WHERE slug LIKE 'c1-org-%-${suffix}';
    DELETE FROM user WHERE email LIKE 'c1-%-${suffix}@vecidya.test';
  `);
}
