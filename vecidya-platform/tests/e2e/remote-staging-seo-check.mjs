import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { assertRemoteE2EIntent } from "./test-safety.mjs";

const baseUrl = process.env.BASE_URL;
const databaseName = process.env.D1_NAME;
const suffix = Date.now().toString();
assertRemoteE2EIntent(baseUrl);
if (databaseName !== "vecidya-staging") throw new Error("SEO check solo permite D1 vecidya-staging.");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers); headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([key, value]) => `${key}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) { const [pair] = setCookie.split(";", 1); const [key, ...value] = pair.split("="); this.#cookies.set(key, value.join("=")); }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  form(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body) }); }
}

function sqlRemote(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-10c-seo-"));
  const file = join(directory, "cleanup.sql"); writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "pnpm.cmd", "wrangler", "d1", "execute", databaseName, "--remote", "--json", "--file", file], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "D1 staging query failed");
  return result.stdout;
}

function sqlCommand(command) {
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "pnpm.cmd", "wrangler", "d1", "execute", databaseName, "--remote", "--json", "--command", command], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "D1 command failed");
  return result.stdout;
}

const email = `10c-seo-${suffix}@vecidya.test`;
const client = new SessionClient();
try {
  let signUp;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    signUp = await client.json("/api/auth/sign-up/email", { name: `10C SEO ${suffix}`, email, password: `test-only-password-${suffix}` });
    if (signUp.status === 200) break;
    if (signUp.status !== 503 || attempt === 3) throw new Error(`SEO register failed: ${signUp.status} ${await signUp.text()}`);
    console.error(`WARN: register attempt ${attempt} returned 503; retrying to record transient staging CPU behavior.`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const user = await signUp.json();
  const organization = await client.json("/api/auth/organization/create", { name: `10C SEO Org ${suffix}`, slug: `10c-seo-${suffix}` });
  assert(organization.status === 200, `Organization failed: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  assert((await client.json("/api/auth/organization/set-active", { organizationId })).status === 200, "Could not activate SEO organization");
  const publish = await client.form("/app/business-profile", { displayName: `10C SEO Public ${suffix}`, slug: `10c-seo-public-${suffix}`, shortDescription: "Perfil SEO remoto", description: "Descripción SEO remota", category: "Servicios", city: "La Habana", country: "Cuba", intent: "publish" });
  assert(publish.status === 200, `Publish failed: ${publish.status}`);
  const publishHtml = await publish.text();
  assert(publishHtml.includes("Perfil publicado."), "Publish response did not confirm publication");
  const d1Profile = sqlCommand(`SELECT slug, status FROM business_profile WHERE slug = '10c-seo-public-${suffix}';`);
  assert(d1Profile.includes(`10c-seo-public-${suffix}`) && d1Profile.includes("published"), "D1 staging no confirmó el perfil publicado");
  const privateProfile = await client.fetch(`/api/organizations/${organizationId}/business-profile`);
  const privateProfileBody = await privateProfile.text();
  assert(privateProfile.status === 200 && privateProfileBody.includes(`10c-seo-public-${suffix}`) && privateProfileBody.includes('"status":"published"'), "HTTP privado no confirmó el perfil publicado");
  const directory = await client.fetch("/vecindario");
  assert((await directory.text()).includes(`10C SEO Public ${suffix}`), "El directorio remoto no mostró el perfil publicado");
  const publicResponse = await client.fetch(`/vecindario/10c-seo-public-${suffix}`);
  const html = await publicResponse.text();
  assert(publicResponse.status === 200, `Public profile failed: ${publicResponse.status}`);
  const checks = {
    index: /name=["']robots["'][^>]*content=["']index,? ?follow["']|content=["']index,? ?follow["'][^>]*name=["']robots["']/.test(html),
    description: /name=["']description["']/.test(html),
    canonical: /rel=["']canonical["']/.test(html),
    ogTitle: /property=["']og:title["']/.test(html),
    ogDescription: /property=["']og:description["']/.test(html),
  };
  assert(Object.values(checks).every(Boolean), `SEO SSR incompleto: ${JSON.stringify(checks)}; meta=${html.match(/<meta[^>]*>/g)?.join(" | ") ?? "sin meta"}`);
  console.log(`PASS: SEO SSR remoto publicado ${JSON.stringify(checks)}`);
} finally {
  try { sqlRemote(`DELETE FROM business_profile WHERE slug = '10c-seo-public-${suffix}'; DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug = '10c-seo-${suffix}'); DELETE FROM organization WHERE slug = '10c-seo-${suffix}'; DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email = '${email}'); DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email = '${email}'); DELETE FROM verification WHERE identifier = '${email}'; DELETE FROM user WHERE email = '${email}';`); } catch (error) { console.error(`WARN: SEO cleanup failed: ${error.message}`); }
}
