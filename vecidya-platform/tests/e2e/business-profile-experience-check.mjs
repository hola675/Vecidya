import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
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
    const body = new URLSearchParams(values);
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  }
}

async function createIdentity() {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `7C Owner ${suffix}`,
    email: `7c-owner-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `No se pudo registrar el propietario: ${signUp.status}`);
  const organization = await client.json("/api/auth/organization/create", {
    name: `Organización A ${suffix}`,
    slug: `org-a-${suffix}`,
  });
  assert(organization.status === 200, `No se pudo crear la organización A: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  assert(organizationId, "La organización A no devolvió ID.");
  return { client, organizationId };
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

const { client, organizationId: organizationA } = await createIdentity();
const organizationBResponse = await client.json("/api/auth/organization/create", {
  name: `Organización B ${suffix}`,
  slug: `org-b-${suffix}`,
});
assert(organizationBResponse.status === 200, `No se pudo crear la organización B: ${organizationBResponse.status}`);
const organizationB = (await organizationBResponse.json()).id;

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
  intent: "publish",
}), 200, "La publicación completa");

const publicProfile = await expectStatus(client.fetch(`/vecindario/negocio-b-${suffix}`), 200, "El perfil público publicado");
const publicHtml = await publicProfile.text();
assert(publicHtml.includes(`Negocio B ${suffix}`), "El perfil público no corresponde a la organización B.");

await client.json("/api/auth/organization/set-active", { organizationId: organizationA });
const profileA = await expectStatus(client.fetch("/app/business-profile"), 200, "El cambio a la organización A");
const profileAHtml = await profileA.text();
assert(profileAHtml.includes(`Negocio A ${suffix}`), "Al volver a A no se mostró el perfil A.");
assert(!profileAHtml.includes(`Negocio B ${suffix}`), "El perfil B se filtró en la organización A.");

await client.json("/api/auth/organization/set-active", { organizationId: organizationB });
const profileB = await expectStatus(client.fetch("/app/business-profile"), 200, "El cambio a la organización B");
const profileBHtml = await profileB.text();
assert(profileBHtml.includes(`Negocio B ${suffix}`) && !profileBHtml.includes(`Negocio A ${suffix}`), "El cambio a B no aisló el perfil B.");

console.log("PASS: completitud server-side, rechazo de publicación incompleta, publicación completa, enlace público y aislamiento A/B verificados.");
