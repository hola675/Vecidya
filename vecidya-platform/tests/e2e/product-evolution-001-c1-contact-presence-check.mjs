import { existsSync } from "node:fs";
import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const suffix = Date.now().toString();

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
    name: `C1 ${key} ${suffix}`,
    email: `c1-contact-${key}-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const organization = await client.json("/api/auth/organization/create", {
    name: `C1 Contact ${key} ${suffix}`,
    slug: `c1-contact-${key}-${suffix}`,
  });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id };
}

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert(match, "El perfil público no incluyó JSON-LD.");
  return JSON.parse(match[1]);
}

const ownerA = await createIdentity("owner-a");
const ownerB = await createIdentity("owner-b");
const slugA = `c1-contact-a-${suffix}`;
const slugB = `c1-contact-b-${suffix}`;

// --- Validación: rechaza valores inválidos, permite vacío ---

const invalidWhatsApp = await expectStatus(ownerA.client.form("/app/business-profile", {
  displayName: `C1 Contacto A ${suffix}`,
  slug: slugA,
  shortDescription: "Fixture local para validar Contact & Presence.",
  category: "Servicios profesionales",
  whatsapp: "not-a-phone-number",
  intent: "save",
}), 200, "Guardado con WhatsApp inválido");
assert((await invalidWhatsApp.text()).includes("El WhatsApp debe ser un número internacional válido"), "La UI no rechazó un WhatsApp inválido con un mensaje claro.");

const invalidInstagram = await expectStatus(ownerA.client.form("/app/business-profile", {
  displayName: `C1 Contacto A ${suffix}`,
  slug: slugA,
  shortDescription: "Fixture local para validar Contact & Presence.",
  category: "Servicios profesionales",
  instagramUrl: "https://example.com/not-instagram",
  intent: "save",
}), 200, "Guardado con Instagram inválido");
assert((await invalidInstagram.text()).includes("Instagram debe ser un enlace de instagram.com"), "La UI no rechazó una URL de Instagram fuera de host con un mensaje claro.");

const apiInvalid = await expectStatus(ownerA.client.form(`/api/organizations/${ownerA.organizationId}/business-profile`, {
  displayName: `C1 Contacto A ${suffix}`,
  slug: slugA,
  whatsapp: "12345",
}), 400, "API rechazando WhatsApp demasiado corto");
assert((await apiInvalid.json()).error.includes("WhatsApp"), "La API no devolvió un error específico de WhatsApp.");

// --- Guardado válido con los 4 campos nuevos (Organización A) ---

await expectStatus(ownerA.client.form("/app/business-profile", {
  displayName: `C1 Contacto A ${suffix}`,
  slug: slugA,
  shortDescription: "Fixture local para validar Contact & Presence.",
  category: "Servicios profesionales",
  city: "Medellín",
  country: "Colombia",
  whatsapp: "+57 324 432 1864",
  instagramUrl: "https://instagram.com/c1-contacto-a",
  facebookUrl: "https://facebook.com/c1-contacto-a",
  linkedinUrl: "https://linkedin.com/company/c1-contacto-a",
  intent: "publish",
}), 200, "Publicación completa de A con Contact & Presence");

// --- Guardado válido con campos parcialmente vacíos (Organización B, valores distintos) ---

await expectStatus(ownerB.client.form("/app/business-profile", {
  displayName: `C1 Contacto B ${suffix}`,
  slug: slugB,
  shortDescription: "Fixture local para validar aislamiento de Contact & Presence.",
  category: "Servicios profesionales",
  city: "Santo Domingo",
  country: "República Dominicana",
  whatsapp: "+18095551234",
  instagramUrl: "https://instagram.com/c1-contacto-b",
  facebookUrl: "https://facebook.com/c1-contacto-b",
  linkedinUrl: "",
  intent: "publish",
}), 200, "Publicación completa de B con WhatsApp/Instagram/Facebook y LinkedIn vacío");

// --- Reload conserva datos + aislamiento tenant de los campos nuevos ---

const editorA = await (await expectStatus(ownerA.client.fetch("/app/business-profile"), 200, "Reload del editor A")).text();
assert(editorA.includes("+573244321864"), "El editor de A no conservó el WhatsApp guardado y normalizado.");
assert(editorA.includes("https://instagram.com/c1-contacto-a") && editorA.includes("https://facebook.com/c1-contacto-a") && editorA.includes("https://linkedin.com/company/c1-contacto-a"), "El editor de A no conservó las redes guardadas.");
assert(!editorA.includes("+18095551234") && !editorA.includes("c1-contacto-b"), "El editor de A filtró datos de contacto de la organización B.");

const editorB = await (await expectStatus(ownerB.client.fetch("/app/business-profile"), 200, "Reload del editor B")).text();
assert(editorB.includes("+18095551234"), "El editor de B no conservó el WhatsApp guardado.");
assert(editorB.includes("https://instagram.com/c1-contacto-b") && editorB.includes("https://facebook.com/c1-contacto-b"), "El editor de B no conservó Instagram/Facebook.");
assert(!editorB.includes("+57 324 432 1864") && !editorB.includes("c1-contacto-a"), "El editor de B filtró datos de contacto de la organización A.");

// --- Perfil público: jerarquía de CTA, wa.me correcto, redes secundarias, sin placeholders ---

const publicA = await (await expectStatus(ownerA.client.fetch(`/vecindario/${slugA}`), 200, "Perfil público A")).text();
assert(publicA.includes('href="https://wa.me/573244321864"'), "El perfil público de A no generó el enlace wa.me correcto.");
assert(publicA.includes("Escribir por WhatsApp"), "El perfil público de A no mostró el CTA de WhatsApp.");
assert(publicA.includes('href="https://instagram.com/c1-contacto-a"') && publicA.includes('href="https://facebook.com/c1-contacto-a"') && publicA.includes('href="https://linkedin.com/company/c1-contacto-a"'), "El perfil público de A no mostró sus enlaces de redes.");

const jsonLdA = extractJsonLd(publicA);
assert(Array.isArray(jsonLdA.sameAs) && jsonLdA.sameAs.length === 3, "El JSON-LD de A no incluyó exactamente las 3 redes publicadas.");
assert(
  jsonLdA.sameAs.includes("https://instagram.com/c1-contacto-a") &&
  jsonLdA.sameAs.includes("https://facebook.com/c1-contacto-a") &&
  jsonLdA.sameAs.includes("https://linkedin.com/company/c1-contacto-a"),
  "El sameAs de A no contiene exactamente las URLs publicadas.",
);
assert(!("whatsapp" in jsonLdA), "El JSON-LD de A no debe transformar WhatsApp en un campo semánticamente incorrecto.");

const publicB = await (await expectStatus(ownerB.client.fetch(`/vecindario/${slugB}`), 200, "Perfil público B")).text();
assert(publicB.includes('href="https://wa.me/18095551234"'), "El perfil público de B no generó el enlace wa.me correcto (no asume Colombia).");
assert(publicB.includes('href="https://instagram.com/c1-contacto-b"') && publicB.includes('href="https://facebook.com/c1-contacto-b"'), "El perfil público de B no mostró Instagram/Facebook.");
assert(!publicB.includes("linkedin.com/company/c1-contacto-b") && !publicB.includes('href="https://linkedin.com'), "El perfil público de B no debe mostrar un enlace de LinkedIn cuando el campo está vacío.");
assert(!publicB.includes("c1-contacto-a"), "El perfil público de B filtró datos de contacto de la organización A.");

const jsonLdB = extractJsonLd(publicB);
assert(Array.isArray(jsonLdB.sameAs) && jsonLdB.sameAs.length === 2, "El JSON-LD de B no debe incluir un LinkedIn vacío ni arreglos con huecos.");
assert(!("linkedin" in jsonLdB) && jsonLdB.sameAs.every((url) => url.length > 0), "El JSON-LD de B no debe emitir URLs vacías.");

console.log("PASS: HTTP — validación de WhatsApp/Instagram, rechazo de valores inválidos (UI y API), guardado y reload, aislamiento tenant de campos nuevos, jerarquía de contacto público, wa.me normalizado sin asumir Colombia, redes secundarias y JSON-LD sameAs sin huecos.");

// --- Mobile / overflow: perfil público y editor con los 4 campos nuevos activos ---

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

async function checkViewport(viewport) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport });
  const label = `${viewport.width}x${viewport.height}`;

  await page.goto(new URL(`/vecindario/${slugA}`, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByText("Escribir por WhatsApp").first().waitFor();
  await assertNoOverflow(page, `${label} perfil público con Contact & Presence`);

  await browser.close();
}

await checkViewport({ width: 1366, height: 900 });
await checkViewport({ width: 390, height: 844 });
await checkViewport({ width: 360, height: 800 });

console.log("PASS: mobile — perfil público con WhatsApp, Instagram, Facebook y LinkedIn no genera overflow horizontal en 360/390/desktop.");
