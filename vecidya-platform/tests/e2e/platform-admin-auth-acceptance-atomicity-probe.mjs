import { spawn, spawnSync } from "node:child_process";
import { createServer, setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";

import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(new URL("../..", import.meta.url).pathname.replace(/^\//, "").replace(/\//g, "\\"));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceParent = resolve(projectDirectory, ".wrangler");
const persistenceName = `.wrangler/platform-admin-auth-atomicity-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1";
assertLocalBaseUrl(baseUrl);
if (!existsSync(persistenceParent)) throw new Error("The isolated worktree Wrangler state directory is missing.");
if (!existsSync(wranglerCli)) throw new Error("The pinned local Wrangler CLI is missing.");

setDefaultAutoSelectFamilyAttemptTimeout(5_000);
const suffix = randomUUID();
const password = `acceptance-probe-${randomUUID()}`;

async function allocatePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to allocate a local Worker port.");
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  return address.port;
}

function executeWrangler(args, timeout = 120_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], {
    cwd: projectDirectory,
    encoding: "utf8",
    timeout,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Local Wrangler command failed (status=${result.status}, signal=${result.signal}, error=${result.error?.message ?? "none"}). ${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

function d1(statement) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-ba-atomicity-"));
  const file = join(directory, "probe.sql");
  writeFileSync(file, statement, "utf8");
  try {
    const output = executeWrangler([
      "d1", "execute", "DB", "--local", "--persist-to", persistenceName,
      "--json", "--file", file,
    ]);
    return JSON.parse(output).flatMap((item) => item.results ?? []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function waitForWorker(child, url) {
  const deadline = Date.now() + 60_000;
  let lastError = "not started";
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Local Worker exited early (${child.exitCode}). ${child.output}`);
    try {
      const response = await fetch(new URL("/api/auth/ok", url), { signal: AbortSignal.timeout(2_000) });
      if (response.status === 200) return;
      lastError = `readiness status ${response.status}`;
    } catch (error) {
      lastError = String(error);
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Local Worker did not become ready: ${lastError}. ${child.output}`);
}

class SessionClient {
  #cookies = new Map();

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async json(path, body) {
    const headers = new Headers({ "content-type": "application/json", origin: this.baseUrl });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, this.baseUrl), { method: "POST", headers, body: JSON.stringify(body) });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function register(label, baseUrl) {
  const client = new SessionClient(baseUrl);
  const email = `ba-atomicity-${label}-${suffix}@vecidya.test`;
  const response = await client.json("/api/auth/sign-up/email", { name: `BA atomicity ${label}`, email, password });
  if (response.status !== 200) throw new Error(`Synthetic ${label} signup returned ${response.status}.`);
  return { client, email, user: (await response.json()).user };
}

const port = await allocatePort();
const localUrl = `http://127.0.0.1:${port}`;
const secret = randomBytes(32).toString("hex");
let worker;
try {
  executeWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName], 600_000);
  d1(`INSERT INTO platform_meta (key, value, updated_at) VALUES ('platform_name', 'Vecidya', ${Date.now()});`);

  worker = spawn(process.execPath, [
    wranglerCli, "dev", "--local", "--persist-to", persistenceName,
    "--ip", "127.0.0.1", "--port", String(port),
    "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake",
    "--var", `APP_URL:${localUrl}`, "--var", `BETTER_AUTH_URL:${localUrl}`,
    "--show-interactive-dev-session=false", "--log-level", "error",
  ], {
    cwd: projectDirectory,
    env: { ...process.env, BETTER_AUTH_SECRET: secret },
    stdio: ["ignore", "pipe", "pipe"],
  });
  worker.output = "";
  worker.stdout.on("data", (chunk) => { worker.output += chunk.toString(); });
  worker.stderr.on("data", (chunk) => { worker.output += chunk.toString(); });
  await waitForWorker(worker, localUrl);

  const owner = await register("owner", localUrl);
  const organizationResponse = await owner.client.json("/api/auth/organization/create", {
    name: `BA acceptance probe ${suffix}`,
    slug: `ba-acceptance-probe-${suffix}`,
  });
  if (organizationResponse.status !== 200) throw new Error(`Synthetic organization creation returned ${organizationResponse.status}.`);
  const organization = await organizationResponse.json();
  const invitee = await register("invitee", localUrl);
  const invitationId = randomUUID();
  const now = Date.now();
  d1(`UPDATE user SET email_verified = 1 WHERE id = ${sqlLiteral(invitee.user.id)};
INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id)
VALUES (${sqlLiteral(invitationId)}, ${sqlLiteral(organization.id)}, ${sqlLiteral(invitee.email)}, 'owner', 'pending', ${now + 3_600_000}, ${now}, ${sqlLiteral(owner.user.id)});
CREATE TRIGGER platform_admin_atomicity_probe_reject_active_org
BEFORE UPDATE OF active_organization_id ON session
WHEN NEW.active_organization_id = ${sqlLiteral(organization.id)}
BEGIN SELECT RAISE(ABORT, 'injected acceptance failure'); END;`);

  const acceptance = await invitee.client.json("/api/auth/organization/accept-invitation", { invitationId });
  const invitationRows = d1(`SELECT status FROM invitation WHERE id = ${sqlLiteral(invitationId)};`);
  const membershipRows = d1(`SELECT role FROM member WHERE organization_id = ${sqlLiteral(organization.id)} AND user_id = ${sqlLiteral(invitee.user.id)};`);
  const sessionRows = d1(`SELECT active_organization_id FROM session WHERE user_id = ${sqlLiteral(invitee.user.id)};`);
  const result = {
    acceptanceHttpStatus: acceptance.status,
    invitationStatus: invitationRows[0]?.status ?? null,
    memberRoles: membershipRows.map((row) => row.role),
    activeOrganizationIds: sessionRows.map((row) => row.active_organization_id),
  };
  console.log(JSON.stringify(result, null, 2));

  if (acceptance.status < 400 || result.invitationStatus !== "pending" || result.memberRoles.length !== 0 || result.activeOrganizationIds.some((id) => id === organization.id)) {
    throw new Error("Atomicity contract failed: the rejected acceptance left committed membership or activation state.");
  }
} catch (error) {
  throw new Error(`${error instanceof Error ? error.message : String(error)}\nLocal Worker output:\n${worker?.output ?? "(not started)"}`, { cause: error });
} finally {
  if (worker && worker.exitCode === null) {
    const exited = once(worker, "exit");
    worker.kill("SIGINT");
    await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5_000))]);
    if (worker.exitCode === null) {
      spawnSync("taskkill.exe", ["/PID", String(worker.pid), "/T", "/F"], { encoding: "utf8" });
      await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5_000))]);
    }
  }
  try {
    rmSync(persistence, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  } catch (error) {
    console.error(`Could not remove isolated D1 state ${persistenceName}: ${String(error)}`);
  }
}
