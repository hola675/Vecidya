import { deflateSync } from "node:zlib";
import { mkdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = resolve(projectDirectory, "node_modules", "wrangler", "bin", "wrangler.js");
const configPath = resolve(projectDirectory, "wrangler.local-demo", "wrangler.jsonc");
const persistPath = resolve(projectDirectory, ".wrangler", "local-demo");
const xdgConfigPath = resolve(persistPath, "xdg-config");
const xdgStatePath = resolve(persistPath, "xdg-state");
const baseUrl = process.env.LOCAL_DEMO_BASE_URL ?? "http://127.0.0.1:4173";
const ownerEmail = "qa-owner@vecidya.test";
const ownerPassword = "VecidyaLocalDemoOnly-2026!";
const ownerName = "Cuenta de prueba local";
const bootstrapUserId = "qa-local-inviter";
const bootstrapEmail = "qa-inviter@vecidya.test";
const organizations = JSON.parse(readFileSync(resolve(projectDirectory, "tests", "fixtures", "local-demo-organizations.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureLocalBaseUrl() {
  const url = new URL(baseUrl);
  assert(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname) && url.port === "4173", "El seed solo admite http://127.0.0.1:4173 o http://localhost:4173.");
}

class SessionClient {
  #cookies = new Map();

  async request(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    // Las consultas locales de Wrangler bloquean el proceso entre solicitudes; evita reutilizar
    // un socket keep-alive que puede caducar durante ese intervalo.
    headers.set("connection", "close");
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    let response;
    try {
      response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    } catch (error) {
      throw new Error(`La solicitud local ${options.method ?? "GET"} ${path} perdió la conexión: ${error?.cause?.code ?? error.message}`, { cause: error });
    }
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }

  async json(path, body, method = "POST", extraHeaders = {}) {
    return this.request(path, {
      method,
      headers: { "content-type": "application/json", ...extraHeaders },
      body: method === "GET" ? undefined : JSON.stringify(body),
    });
  }
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function queryLocalD1(sql) {
  const tempPath = resolve(persistPath, "temp");
  for (const path of [persistPath, xdgConfigPath, xdgStatePath, tempPath]) mkdirSync(path, { recursive: true });
  const result = spawnSync(process.execPath, [
    wranglerCli,
    "d1", "execute", "DB", "--local", "--config", configPath,
    "--persist-to", persistPath, "--json", "--command", sql,
  ], {
    cwd: projectDirectory,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
    env: {
      ...process.env,
      APPDATA: xdgConfigPath,
      LOCALAPPDATA: xdgStatePath,
      TEMP: tempPath,
      TMP: tempPath,
      XDG_CONFIG_HOME: xdgConfigPath,
      XDG_STATE_HOME: xdgStatePath,
      CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`No se pudo comprobar la D1 local: ${result.stderr || result.stdout}`);
  const jsonStart = result.stdout.indexOf("[");
  if (jsonStart < 0) throw new Error("Wrangler no devolvió resultados JSON para la D1 local.");
  return JSON.parse(result.stdout.slice(jsonStart)).flatMap((entry) => entry.results ?? []);
}

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function parseHex(color) {
  const value = color.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function makeDemoPng(width, height, fixture, variation) {
  const background = parseHex(fixture.background);
  const accent = parseHex(fixture.accent);
  const pixels = Buffer.alloc((width * 4 + 1) * height);
  const centerX = Math.round(width * (variation === "logo" ? 0.5 : 0.76));
  const centerY = Math.round(height * (variation === "logo" ? 0.5 : 0.38));
  const radius = Math.min(width, height) * (variation === "logo" ? 0.31 : 0.28);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    pixels[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 4;
      const gradient = Math.min(0.22, (x / width) * 0.12 + (y / height) * 0.1);
      const dx = x - centerX;
      const dy = y - centerY;
      const inCircle = dx * dx + dy * dy < radius * radius;
      const stripe = variation === "cover" && x < width * 0.42 && ((x + y + fixture.slug.length * 9) % 52) < 7;
      const darkShape = inCircle || stripe;
      const primary = darkShape ? accent : background;
      const secondary = darkShape ? background : accent;
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[offset + channel] = Math.round(primary[channel] * (1 - gradient) + secondary[channel] * gradient);
      }
      pixels[offset + 3] = 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

async function readJson(response, label) {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`${label}: respuesta no JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status} ${data.error ?? ""}`.trim());
  return data;
}

function ensureFixtureOrganizations() {
  const now = Date.now();
  queryLocalD1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
    VALUES (${sqlLiteral(bootstrapUserId)}, 'Invitador de QA local', ${sqlLiteral(bootstrapEmail)}, 1, ${now}, ${now})
    ON CONFLICT (id) DO NOTHING`);

  return organizations.map((fixture) => {
    let [organization] = queryLocalD1(`SELECT id, name, slug FROM organization WHERE slug = ${sqlLiteral(fixture.slug)} LIMIT 1`);
    let createdOrganization = false;
    if (!organization) {
      const id = randomUUID();
      queryLocalD1(`INSERT INTO organization (id, name, slug, created_at) VALUES (${sqlLiteral(id)}, ${sqlLiteral(fixture.organizationName)}, ${sqlLiteral(fixture.slug)}, ${now})`);
      organization = { id, name: fixture.organizationName, slug: fixture.slug };
      createdOrganization = true;
    }

    const membership = queryLocalD1(`SELECT id FROM member WHERE organization_id = ${sqlLiteral(organization.id)} AND user_id = (SELECT id FROM user WHERE email = ${sqlLiteral(ownerEmail)} LIMIT 1) LIMIT 1`)[0];
    let invitation = queryLocalD1(`SELECT id, status FROM invitation WHERE organization_id = ${sqlLiteral(organization.id)} AND lower(email) = lower(${sqlLiteral(ownerEmail)}) ORDER BY created_at DESC LIMIT 1`)[0];
    if (!membership && (!invitation || invitation.status !== "pending")) {
      const id = randomUUID();
      queryLocalD1(`INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id)
        VALUES (${sqlLiteral(id)}, ${sqlLiteral(organization.id)}, ${sqlLiteral(ownerEmail)}, 'owner', 'pending', ${now + 30 * 24 * 60 * 60 * 1000}, ${now}, ${sqlLiteral(bootstrapUserId)})`);
      invitation = { id, status: "pending" };
    }

    return { ...fixture, id: organization.id, createdOrganization, invitationId: membership ? null : invitation?.id };
  });
}

async function authenticate(client, invitationId) {
  let response;
  if (invitationId) {
    response = await client.json("/api/auth/sign-up/email", { name: ownerName, email: ownerEmail, password: ownerPassword }, "POST", { "X-Vecidya-Invitation": invitationId });
  }
  if (!response?.ok) response = await client.json("/api/auth/sign-in/email", { email: ownerEmail, password: ownerPassword });
  await readJson(response, "Autenticación de la cuenta local");
}

async function setActiveOrganization(client, organizationId) {
  const response = await client.json("/api/auth/organization/set-active", { organizationId });
  await readJson(response, "Selección de organización activa");
}

async function acceptInvitation(client, invitationId, organizationName) {
  const response = await client.json("/api/auth/organization/accept-invitation", { invitationId });
  await readJson(response, `Aceptación local de invitación a ${organizationName}`);
}

async function ensureProfile(client, organizationId, fixture, index) {
  const path = `/api/organizations/${encodeURIComponent(organizationId)}/business-profile`;
  const current = await readJson(await client.json(path, undefined, "GET"), `Lectura de perfil ${fixture.slug}`);
  if (current.profile) return current.draftRevision;

  const form = new FormData();
  const fields = {
    displayName: fixture.displayName,
    slug: fixture.slug,
    shortDescription: "Datos sintéticos para revisar la interfaz local; no representa un negocio real.",
    description: "Este perfil pertenece al entorno de QA local de Vecidya. Su contenido, contacto, dominio y assets son de prueba y no describen una organización real.",
    category: fixture.category,
    city: "Entorno de pruebas local",
    country: "QA",
    phone: `+1 202-555-01${String(index + 1).padStart(2, "0")}`,
    publicEmail: fixture.publicEmail,
    websiteUrl: fixture.websiteUrl,
    serviceMode: "hybrid",
    serviceArea: "Solo entorno local; datos sintéticos.",
    draftRevision: String(current.draftRevision ?? 0),
  };
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  const saved = await readJson(await client.request(path, { method: "POST", body: form }), `Guardado de perfil ${fixture.slug}`);
  assert(saved.profile?.slug === fixture.slug, `El perfil ${fixture.slug} no guardó el slug esperado.`);
  return Number(current.draftRevision ?? 0) + 1;
}

async function ensureAssets(client, organizationId, fixture, initialRevision, index) {
  const existing = new Set(queryLocalD1(`SELECT purpose FROM business_media_asset WHERE organization_id = ${sqlLiteral(organizationId)} AND is_active = 1`).map((row) => row.purpose));
  let draftRevision = initialRevision;
  let added = 0;
  const assets = [
    { purpose: "cover", filename: "qa-cover.png", width: 960, height: 540, altText: `Portada geométrica de prueba ${index + 1}, con paleta ${fixture.accent}.` },
    { purpose: "logo", filename: "qa-logo.png", width: 512, height: 512, altText: `Marca geométrica sintética de QA ${index + 1}.` },
  ];

  for (const asset of assets) {
    if (existing.has(asset.purpose)) continue;
    const png = makeDemoPng(asset.width, asset.height, fixture, asset.purpose);
    const form = new FormData();
    form.set("file", new Blob([png], { type: "image/png" }), asset.filename);
    form.set("purpose", asset.purpose);
    form.set("altText", asset.altText);
    form.set("draftRevision", String(draftRevision));
    const path = `/api/organizations/${encodeURIComponent(organizationId)}/business-media`;
    const uploaded = await readJson(await client.request(path, { method: "POST", body: form }), `Carga local de ${asset.purpose} para ${fixture.slug}`);
    assert(uploaded.asset?.contentType === "image/png", `El asset ${asset.filename} no quedó registrado como PNG.`);
    draftRevision = Number(uploaded.draftRevision);
    added += 1;
  }
  return { draftRevision, added };
}

async function ensureMiniWebDraft(client, organizationId, fixture) {
  const path = `/api/organizations/${encodeURIComponent(organizationId)}/miniweb-v2`;
  let current = await readJson(await client.json(path, undefined, "GET"), `Lectura MiniWeb V2 ${fixture.slug}`);
  let created = false;
  if (!current.state) {
    const result = await readJson(await client.json(path, { operation: "create", familyKey: "vecidya-default", visualVariant: "base" }), `Creación de borrador MiniWeb V2 ${fixture.slug}`);
    assert(result.siteId, `No se creó el borrador MiniWeb V2 para ${fixture.slug}.`);
    created = true;
    current = await readJson(await client.json(path, undefined, "GET"), `Lectura del nuevo borrador MiniWeb V2 ${fixture.slug}`);
  }

  const state = current.state;
  assert(state?.site?.id && state.draft?.document, `No se pudo leer el borrador MiniWeb V2 de ${fixture.slug}.`);
  const media = queryLocalD1(`SELECT purpose, id FROM business_media_asset WHERE organization_id = ${sqlLiteral(organizationId)} AND is_active = 1`);
  const cover = media.find((asset) => asset.purpose === "cover");
  assert(cover, `Falta la portada local de prueba para ${fixture.slug}.`);
  const document = state.draft.document;
  const sections = new Map(document.sections.map((section) => [section.type, section]));
  const hero = sections.get("hero");
  const about = sections.get("about");
  const contact = sections.get("contact");
  const location = sections.get("location");
  assert(hero && about && contact && location, `La familia MiniWeb V2 de ${fixture.slug} no tiene las secciones iniciales esperadas.`);
  const alreadyPopulated = hero.content.title === fixture.displayName && hero.content.image?.assetId === cover.id;
  if (!alreadyPopulated) {
    hero.content.title = fixture.displayName;
    hero.content.subtitle = "Ficha sintética de QA en el entorno local de Vecidya.";
    hero.content.image = { assetId: cover.id, alt: `Portada geométrica sintética de ${fixture.displayName}.` };
    about.content.headline = "Contenido de demostración local";
    about.content.description = "Esta página está creada con datos de prueba. No corresponde a una organización real y no se ha publicado.";
    contact.content.phone = null;
    contact.content.email = fixture.publicEmail;
    contact.content.links = [{ label: "Dominio reservado de prueba", href: fixture.websiteUrl }];
    location.content.address = null;
    location.content.city = "Entorno de pruebas local";
    location.content.area = "Solo datos sintéticos.";
    location.content.mapUrl = null;

    const saved = await readJson(await client.json(path, {
      operation: "save",
      siteId: state.site.id,
      expectedRevision: state.draft.revision,
      document,
    }), `Guardado del borrador de demostración ${fixture.slug}`);
    assert(saved.ok && saved.revision === state.draft.revision + 1, `No se guardó el contenido de demostración MiniWeb V2 de ${fixture.slug}.`);
  }
  return created;
}

ensureLocalBaseUrl();
const fixtures = ensureFixtureOrganizations();
const client = new SessionClient();
await authenticate(client, fixtures[0].invitationId ?? "");
queryLocalD1(`UPDATE user SET email_verified = 1, updated_at = ${Date.now()} WHERE email = ${sqlLiteral(ownerEmail)}`);
const owner = queryLocalD1(`SELECT id FROM user WHERE email = ${sqlLiteral(ownerEmail)} LIMIT 1`)[0];
assert(owner?.id, "La cuenta de prueba local no quedó registrada en D1.");
const createdOrganizations = fixtures.filter((fixture) => fixture.createdOrganization).length;
let createdProfiles = 0;
let createdAssets = 0;
let createdMiniWebDrafts = 0;
const seeded = [];

for (let index = 0; index < fixtures.length; index += 1) {
  const fixture = fixtures[index];
  const organization = { id: fixture.id, name: fixture.organizationName, slug: fixture.slug };
  let membership = queryLocalD1(`SELECT id FROM member WHERE organization_id = ${sqlLiteral(organization.id)} AND user_id = ${sqlLiteral(owner.id)} LIMIT 1`)[0];
  if (!membership && fixture.invitationId) {
    await acceptInvitation(client, fixture.invitationId, fixture.organizationName);
    membership = queryLocalD1(`SELECT id FROM member WHERE organization_id = ${sqlLiteral(organization.id)} AND user_id = ${sqlLiteral(owner.id)} LIMIT 1`)[0];
  }
  assert(membership, `La cuenta de prueba no obtuvo membresía en ${fixture.slug}.`);
  await setActiveOrganization(client, organization.id);
  const profilePath = `/api/organizations/${encodeURIComponent(organization.id)}/business-profile`;
  const beforeProfile = await readJson(await client.json(profilePath, undefined, "GET"), `Lectura de perfil ${fixture.slug}`);
  const profileWasCreated = !beforeProfile.profile;
  const revision = await ensureProfile(client, organization.id, fixture, index);
  if (profileWasCreated) createdProfiles += 1;
  const assets = await ensureAssets(client, organization.id, fixture, revision, index);
  createdAssets += assets.added;
  if (await ensureMiniWebDraft(client, organization.id, fixture)) createdMiniWebDrafts += 1;
  seeded.push({ organizationId: organization.id, slug: fixture.slug, displayName: fixture.displayName });
  console.log(`OK ${fixture.slug}: perfil borrador, ${assets.added} asset(s) nuevos, MiniWeb V2 disponible.`);
}

await setActiveOrganization(client, seeded[0].organizationId);
assert(seeded.length >= 4, "El fixture debe incluir al menos cuatro organizaciones.");
console.log(`\nSeed local listo: ${seeded.length} organizaciones, ${createdProfiles} perfiles nuevos, ${createdAssets} assets nuevos y ${createdMiniWebDrafts} borradores MiniWeb V2 nuevos.`);
console.log(`Cuenta local: ${ownerEmail} / ${ownerPassword}`);
console.log(`Abrir: ${baseUrl}/app/business-profile y ${baseUrl}/app/miniweb-v2`);
console.log("Los perfiles quedan como borradores; no se crean licencias ficticias ni se publican páginas.");
