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
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
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

async function register(key) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name: `Cuenta ${key} ${suffix}`, email: `account-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(response.status === 200, `No se pudo registrar ${key}: ${response.status}.`);
  return { client, user: (await response.json()).user };
}

const accountA = await register("a");
const accountB = await register("b");
const updatedName = `Cuenta A actualizada ${suffix}`;
const update = await accountA.client.json("/api/auth/update-user", { name: updatedName, id: accountB.user.id });
assert(update.status === 200, `La actualización personal devolvió ${update.status}.`);

const sessionA = await (await accountA.client.fetch("/api/auth/get-session")).json();
const sessionB = await (await accountB.client.fetch("/api/auth/get-session")).json();
assert(sessionA.user.name === updatedName, "La sesión A no recibió su propio nombre actualizado.");
assert(sessionB.user.name === `Cuenta b ${suffix}`, "La actualización de A modificó la identidad B.");

const accountPage = await accountA.client.fetch("/app/account");
assert(accountPage.status === 200, `/app/account devolvió ${accountPage.status}.`);
assert((await accountPage.text()).includes(updatedName), "La pantalla de cuenta no muestra los datos reales de la sesión A.");

console.log("PASS: la identidad autenticada actualiza solo su propio nombre y /app/account muestra su sesión real.");
