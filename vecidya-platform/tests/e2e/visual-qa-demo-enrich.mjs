import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { assertLocalBaseUrl } from "./test-safety.mjs";
import { launchVisualQaBrowser } from "./visual-qa-browser.mjs";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:5180";
assertLocalBaseUrl(baseUrl);
if (new URL(baseUrl).origin !== "http://127.0.0.1:5180") throw new Error("El enriquecimiento visual solo está habilitado para el demo local en 127.0.0.1:5180.");

const persistTo = join(process.cwd(), ".wrangler", "visual-qa-demo");
const access = JSON.parse(readFileSync(join(persistTo, "demo-access.json"), "utf8"));
const organization = access.organizations.find(({ key }) => key === "restaurante");
if (!organization?.id || !access.owner?.email || !access.owner?.password) throw new Error("Falta la ficha local de restaurante o su identidad sintética de demo.");
const wrangler = fileURLToPath(import.meta.resolve("wrangler"));

function executeD1(sql) {
  const result = spawnSync(process.execPath, [wrangler, "d1", "execute", "DB", "--local", "--persist-to", persistTo, "--json", "--command", sql], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error(`Falló la actualización de datos locales: ${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

class Session {
  cookies = new Map();
  async request(path, options = {}) {
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
    return this.request(path, { method, headers: { "content-type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(body) });
  }
}

const health = await fetch(new URL("/api/auth/ok", baseUrl));
if (!health.ok) throw new Error(`Worker local no preparado: ${health.status}`);
const session = new Session();
const signIn = await session.json("/api/auth/sign-in/email", { email: access.owner.email, password: access.owner.password });
if (!signIn.ok) throw new Error(`La sesión sintética local no inició: ${signIn.status}`);
const activate = await session.json("/api/auth/organization/set-active", { organizationId: organization.id });
if (!activate.ok) throw new Error(`No se pudo seleccionar la organización local: ${activate.status}`);
const configResponse = await session.json(`/api/organizations/${organization.id}/miniweb-config`, null, "GET");
if (!configResponse.ok) throw new Error(`No se pudo leer la revisión MiniWeb: ${configResponse.status}`);
let revision = (await configResponse.json()).draftRevision;

const logoSvg = readFileSync(join(process.cwd(), "tests", "fixtures", "visual-qa", "cafe-jardin-logo.svg"), "utf8");
const logoPath = join(persistTo, "cafe-jardin-logo.webp");
const browser = await launchVisualQaBrowser();
try {
  const page = await browser.newPage();
  const logoBase64 = await page.evaluate(async (svg) => {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    canvas.getContext("2d").drawImage(image, 0, 0, 512, 512);
    return canvas.toDataURL("image/webp", 0.92).split(",")[1];
  }, logoSvg);
  writeFileSync(logoPath, Buffer.from(logoBase64, "base64"));
} finally { await browser.close(); }

const logoRows = executeD1(`SELECT id, alt_text AS altText FROM business_media_asset WHERE organization_id='${organization.id}' AND purpose='logo' AND is_active=1;`);
for (const oldLogo of logoRows) {
  if (oldLogo.altText === "TEST LOCAL — Marca Café Jardín") continue;
  const remove = await session.request(`/api/organizations/${organization.id}/business-media/${oldLogo.id}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftRevision: revision }) });
  if (!remove.ok) throw new Error(`No se pudo reemplazar el logo del borrador local: ${remove.status} ${(await remove.text()).slice(0, 200)}`);
  revision += 1;
}

const imageSet = [
  ["cafe-jardin-logo.webp", "Marca Café Jardín", "logo"],
  ["cafe.webp", "Pan de masa madre recién horneado", "gallery"],
  ["retail.webp", "Café de origen para preparar en casa", "gallery"],
  ["barber.webp", "Mesa de café y encuentro del barrio", "gallery"],
];
const uploaded = [];
const existingAssets = executeD1(`SELECT id, purpose, alt_text AS altText FROM business_media_asset WHERE organization_id='${organization.id}';`);
for (const [fileName, altText, purpose] of imageSet) {
  const fullAltText = `TEST LOCAL — ${altText}`;
  const existing = existingAssets.find((asset) => asset.altText === fullAltText && asset.purpose === purpose);
  if (existing) { uploaded.push({ id: existing.id }); continue; }
  const bytes = readFileSync(fileName === "cafe-jardin-logo.webp" ? logoPath : join(process.cwd(), "tests", "fixtures", "visual-qa", fileName));
  const form = new FormData();
  form.set("file", new File([bytes], fileName, { type: "image/webp" }));
  form.set("purpose", purpose);
  form.set("altText", fullAltText);
  form.set("draftRevision", String(revision));
  const response = await session.request(`/api/organizations/${organization.id}/business-media`, { method: "POST", body: form });
  if (response.status !== 201) throw new Error(`Subida R2 local ${fileName} falló (${response.status}): ${(await response.text()).slice(0, 200)}`);
  const result = await response.json();
  revision = result.draftRevision;
  uploaded.push(result.asset);
}

const stamp = Date.now();
const profileName = "TEST LOCAL — Café Jardín de la Esquina";
executeD1(`UPDATE business_profile SET display_name='${profileName}', short_description='Café de origen, panadería artesanal y un rincón tranquilo para encontrarse en el barrio.', description='Servimos café colombiano de pequeños productores, pan de masa madre y desayunos de temporada. Una ficha completamente ficticia para revisar fotos de portada, marca, ofertas y galería en la MiniWeb pública.', category='Cafetería de especialidad', updated_at=${stamp} WHERE organization_id='${organization.id}';
UPDATE business_offering SET kind='service', title='Café preparado al momento', description='Espresso, filtrados y bebidas con leche preparados con granos de origen colombiano.', price_label='Desde $8.000', image_asset_id='${uploaded[2].id}', updated_at=${stamp} WHERE organization_id='${organization.id}' AND sort_order=0;
UPDATE business_offering SET kind='service', title='Desayuno de temporada', description='Pan de masa madre, fruta fresca y café para comenzar el día sin afán.', price_label='Desde $18.000', image_asset_id='${uploaded[0].id}', updated_at=${stamp} WHERE organization_id='${organization.id}' AND sort_order=1;
UPDATE business_offering SET kind='product', title='Bolsa de café de origen', description='Café en grano de fincas familiares, tostado en lotes pequeños para conservar sus notas dulces.', price_label='$38.000', image_asset_id='${uploaded[1].id}', updated_at=${stamp} WHERE organization_id='${organization.id}' AND sort_order=2;
UPDATE business_faq SET question='¿De dónde viene el café?', answer='Trabajamos con café colombiano de pequeños productores. Esta respuesta forma parte de la organización ficticia de demostración.', updated_at=${stamp} WHERE organization_id='${organization.id}' AND sort_order=0;`);

const published = await session.json(`/api/organizations/${organization.id}/miniweb-config`, { intent: "publish", draftRevision: revision });
if (!published.ok) throw new Error(`No se pudo publicar el snapshot en D1/R2 local: ${published.status} ${(await published.text()).slice(0, 250)}`);

const verification = executeD1(`SELECT bp.display_name, bp.category, bp.status, (SELECT COUNT(*) FROM business_media_asset WHERE organization_id=bp.organization_id) AS media_count, (SELECT COUNT(*) FROM business_media_asset WHERE organization_id=bp.organization_id AND purpose='gallery' AND content_type='image/webp') AS webp_gallery_count, (SELECT COUNT(*) FROM business_offering WHERE organization_id=bp.organization_id AND kind='service') AS services, (SELECT COUNT(*) FROM business_offering WHERE organization_id=bp.organization_id AND kind='product') AS products FROM business_profile bp WHERE bp.organization_id='${organization.id}';`)[0];
if (verification?.services !== 2 || verification?.products !== 1 || verification?.webp_gallery_count < 3) throw new Error(`La organización visual no quedó completa: ${JSON.stringify(verification)}`);
writeFileSync(join(persistTo, "visual-demo-current.json"), `${JSON.stringify({ refreshedAt: new Date().toISOString(), organization: profileName, fixtureOnly: true, storage: "D1/R2 local", webpAssetsUploaded: uploaded.length, verification }, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ refreshed: true, localOnly: true, webpAssetsUploaded: uploaded.length, verification }));
