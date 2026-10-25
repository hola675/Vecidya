import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const accessPath = ".wrangler/visual-qa-demo/demo-access.json";
const access = JSON.parse(readFileSync(accessPath, "utf8"));
const baseUrl = process.env.BASE_URL ?? access.baseUrl;
assertLocalBaseUrl(baseUrl);
if (new URL(baseUrl).origin !== new URL(access.baseUrl).origin) throw new Error("La sesión del demo debe usar el mismo origen local.");
const markerPath = ".wrangler/visual-qa-demo/demo-media-extended.json";
if (existsSync(markerPath)) throw new Error("Los medios adicionales ya se cargaron. Elimina el entorno demo local completo antes de regenerarlo.");

class Session {
  cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const raw of response.headers.getSetCookie()) {
      const [pair] = raw.split(";");
      const [name, ...value] = pair.split("=");
      this.cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body, method = "POST") {
    return this.fetch(path, { method, headers: { "content-type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(body) });
  }
}

const identity = new Session();
const signIn = await identity.json("/api/auth/sign-in/email", { email: access.owner.email, password: access.owner.password });
if (signIn.status !== 200) throw new Error(`El inicio de sesión local respondió ${signIn.status}: ${(await signIn.text()).slice(0, 200)}`);

const imageByOrganization = [
  ["barberia", "barber.webp", "TEST LOCAL — Galería de barbería"],
  ["tienda", "retail.webp", "TEST LOCAL — Galería de tienda"],
  ["consultoria", "consulting.webp", "TEST LOCAL — Galería de consultoría"],
  ["taller", "workshop.webp", "TEST LOCAL — Galería de taller"],
  ["academia", "academy.webp", "TEST LOCAL — Galería de academia"],
  ["domicilio", "home-service.webp", "TEST LOCAL — Galería de servicio a domicilio"],
  ["comunidad", "community.webp", "TEST LOCAL — Galería comunitaria"],
];
const uploads = [];
for (const [key, fileName, altText] of imageByOrganization) {
  const organization = access.organizations.find((item) => item.key === key);
  if (!organization) throw new Error(`No existe la organización local ${key}.`);
  const activate = await identity.json("/api/auth/organization/set-active", { organizationId: organization.id });
  if (activate.status !== 200) throw new Error(`No se pudo seleccionar ${organization.name}: ${activate.status}`);
  const stateResponse = await identity.json(`/api/organizations/${organization.id}/miniweb-config`, null, "GET");
  if (stateResponse.status !== 200) throw new Error(`No se pudo leer el borrador de ${key}: ${stateResponse.status}`);
  const { draftRevision } = await stateResponse.json();
  const bytes = readFileSync(join("tests", "fixtures", "visual-qa", fileName));
  const form = new FormData();
  form.set("file", new File([bytes], fileName, { type: "image/webp" }));
  form.set("purpose", "gallery");
  form.set("altText", altText);
  form.set("draftRevision", String(draftRevision));
  const response = await identity.fetch(`/api/organizations/${organization.id}/business-media`, { method: "POST", body: form });
  if (response.status !== 201) throw new Error(`La carga WebP de ${key} respondió ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const asset = (await response.json()).asset;
  const slug = `visual-qa-${key}-${access.organizations[0].publicUrl.match(/visual-qa-restaurante-(.+)$/)?.[1]}`;
  const anonymous = await fetch(new URL(`/media/business/${slug}/${asset.id}`, baseUrl));
  if (anonymous.status !== 404) throw new Error(`El medio en borrador ${asset.id} respondió ${anonymous.status} anónimamente; se esperaba 404.`);
  uploads.push({ organization: key, assetId: asset.id, fileName, bytes: asset.sizeBytes, anonymousDraftStatus: anonymous.status });
}
const restore = await identity.json("/api/auth/organization/set-active", { organizationId: access.organizations[0].id });
if (restore.status !== 200) throw new Error(`No se pudo regresar al restaurante de demo: ${restore.status}`);
access.draftMediaCount = uploads.length;
access.draftMediaOrganizations = uploads.map(({ organization }) => organization);
writeFileSync(accessPath, `${JSON.stringify(access, null, 2)}\n`);
writeFileSync(markerPath, `${JSON.stringify({ createdAt: new Date().toISOString(), uploads }, null, 2)}\n`);
console.log(JSON.stringify({ uploaded: uploads.length, privateDraftsVerified: uploads.filter(({ anonymousDraftStatus }) => anonymousDraftStatus === 404).length, formats: [...new Set(uploads.map(({ fileName }) => fileName.split(".").at(-1)))] }, null, 2));
