import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const suffix = Date.now().toString();
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const pilotCases = [
  {
    key: "a",
    organizationName: "Edgar | Asesor de Seguros SURA",
    displayName: "Edgar | Asesor de Seguros SURA",
    slug: `rp001a-edgar-sura-${suffix}`,
    expectedBlocker: "Categoría",
  },
  {
    key: "b",
    organizationName: "Asesorar-T — nombre público pendiente",
    displayName: "MISSING / UNCONFIRMED",
    slug: `rp001a-asesorar-t-pending-${suffix}`,
    expectedBlocker: "Descripción corta",
  },
  {
    key: "c",
    organizationName: "Agrofanescol",
    displayName: "Agrofanescol",
    slug: `rp001a-agrofanescol-${suffix}`,
    expectedBlocker: "Descripción corta",
  },
];

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-rp001a-"));
  const file = join(directory, "cleanup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(
    process.env.ComSpec ?? "cmd.exe",
    ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr || result.stdout}`);
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) {
      headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    }

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
    return this.fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  form(path, values) {
    return this.fetch(path, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values),
    });
  }
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

async function createIdentity(key) {
  const client = new SessionClient();
  const email = `rp001a-${key}-${suffix}@vecidya.test`;
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `RP-001A ${key} local fixture`,
    email,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);

  const organization = await client.json("/api/auth/organization/create", {
    name: `RP-001A ${key} control organization`,
    slug: `rp001a-${key}-control-${suffix}`,
  });
  assert(organization.status === 200, `${key} no pudo crear su organización de control: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  assert(organizationId, `${key} no devolvió ID de organización.`);
  return { client, email, organizationId };
}

async function createOrganization(client, pilotCase) {
  const response = await client.json("/api/auth/organization/create", {
    name: pilotCase.organizationName,
    slug: `rp001a-${pilotCase.key}-${suffix}`,
  });
  assert(response.status === 200, `${pilotCase.key} no pudo crear organización: ${response.status}`);
  const organizationId = (await response.json()).id;
  assert(organizationId, `${pilotCase.key} no devolvió ID de organización.`);
  return organizationId;
}

async function setActive(client, organizationId, label) {
  await expectStatus(
    client.json("/api/auth/organization/set-active", { organizationId }),
    200,
    label,
  );
}

function draftForm(pilotCase) {
  return {
    displayName: pilotCase.displayName,
    slug: pilotCase.slug,
    shortDescription: "",
    description: "",
    category: "",
    city: "",
    country: "",
    phone: "",
    publicEmail: "",
    websiteUrl: "",
    logoUrl: "",
    whatsapp: "",
    instagramUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    serviceMode: "",
    serviceArea: "",
    intent: "save",
  };
}

const owner = await createIdentity("owner");
const outsider = await createIdentity("outsider");
const organizationIds = [owner.organizationId, outsider.organizationId];

try {
  const pilotOrganizations = new Map();
  for (const pilotCase of pilotCases) {
    const organizationId = await createOrganization(owner.client, pilotCase);
    organizationIds.push(organizationId);
    pilotOrganizations.set(pilotCase.key, organizationId);

    await setActive(owner.client, organizationId, `Activar organización ${pilotCase.key}`);
    const appProfile = await expectStatus(
      owner.client.fetch("/app/business-profile"),
      200,
      `Abrir perfil privado ${pilotCase.key}`,
    );
    const appProfileHtml = await appProfile.text();
    assert(
      appProfileHtml.includes("Este perfil pertenece a") && appProfileHtml.includes(pilotCase.organizationName),
      `La membresía activa no correspondió a ${pilotCase.key}. Fragmento: ${appProfileHtml.slice(appProfileHtml.indexOf("Este perfil pertenece a") - 80, appProfileHtml.indexOf("Este perfil pertenece a") + 180)}`,
    );

    const saved = await expectStatus(
      owner.client.form("/app/business-profile", draftForm(pilotCase)),
      200,
      `Guardar borrador ${pilotCase.key}`,
    );
    const savedHtml = await saved.text();
    assert(savedHtml.includes("Perfil guardado como borrador.") && savedHtml.includes("Borrador"), `El caso ${pilotCase.key} no quedó como borrador.`);

    const publish = await expectStatus(
      owner.client.form("/app/business-profile", { ...draftForm(pilotCase), intent: "publish" }),
      200,
      `Intentar publicación local ${pilotCase.key}`,
    );
    const publishHtml = await publish.text();
    assert(publishHtml.includes("Completa estos campos antes de publicar"), `El caso ${pilotCase.key} no bloqueó la publicación incompleta.`);
    assert(publishHtml.includes(pilotCase.expectedBlocker), `El caso ${pilotCase.key} no mostró su dato faltante principal.`);

    const publicResponse = await expectStatus(
      owner.client.fetch(`/vecindario/${pilotCase.slug}`),
      404,
      `Perfil público no publicado ${pilotCase.key}`,
    );
    assert(!(await publicResponse.text()).includes("application/ld+json"), `El caso ${pilotCase.key} expuso JSON-LD sin publicación.`);

    const directory = await expectStatus(
      owner.client.fetch(`/vecindario?q=${encodeURIComponent(pilotCase.displayName)}`),
      200,
      `Buscar borrador ${pilotCase.key}`,
    );
    const directoryHtml = await directory.text();
    assert(!directoryHtml.includes(`/vecindario/${pilotCase.slug}`), `El borrador ${pilotCase.key} apareció en Vecindario.`);
  }

  const firstPilotOrganization = pilotOrganizations.get("a");
  const crossTenant = await expectStatus(
    outsider.client.form(`/api/organizations/${firstPilotOrganization}/business-profile`, draftForm(pilotCases[0])),
    403,
    "Intento cross-tenant sobre piloto A",
  );
  await crossTenant.arrayBuffer();

  console.log("PASS: RP-001A creó tres organizaciones piloto locales, confirmó membresía y aislamiento, guardó borradores, bloqueó publicación incompleta y verificó exclusión de Vecindario/JSON-LD.");
  console.log("BLOCKED BY DATA: ningún caso se publicó; los datos desconocidos permanecieron vacíos o MISSING / UNCONFIRMED.");
} finally {
  const organizationSlugList = [
    ...pilotCases.map((pilotCase) => `rp001a-${pilotCase.key}-${suffix}`),
    `rp001a-owner-control-${suffix}`,
    `rp001a-outsider-control-${suffix}`,
  ];
  const emailPattern = `rp001a-%-${suffix}@vecidya.test`;
  executeD1(`
    DELETE FROM organization WHERE slug IN (${organizationSlugList.map((slug) => `'${slug}'`).join(", ")});
    DELETE FROM user WHERE email LIKE '${emailPattern}';
  `);
}
