import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const temp = await mkdtemp(join(tmpdir(), "vecidya-v9-privacy-gate-"));
const configPath = join(temp, "wrangler.jsonc");
const persistencePath = join(temp, "d1");
const wranglerPath = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const authSecret = randomBytes(32).toString("hex");
const disabledError = "La persistencia heredada V9 está deshabilitada para el flujo público.";
const workspaceId = "public";
const historicalVersions = {
  bank: "privacy-gate-archived-bank-v1",
  engine: "privacy-gate-archived-engine-v1",
  scoring: "diag-v3-candidate-calibration-v3",
  recommendations: "privacy-gate-archived-recommendations-v1",
  consent: "privacy-gate-archived-consent-v1",
};
const storedResult = {
  score: { historicalFixture: "score-v1", rawScore: 37 },
  evidence: { historicalFixture: "evidence-v1", source: "immutable-event-log" },
  recommendations: { historicalFixture: "recommendations-v1", items: ["synthetic-preserved-item"] },
};
const vars = {
  APP_URL: "http://127.0.0.1",
  BETTER_AUTH_URL: "http://127.0.0.1",
  APP_ENV: "development",
  EMAIL_PROVIDER: "fake",
  DIAGNOSTIC_V9_PUBLIC_ENABLED: "false",
  DIAGNOSTIC_V9_BANK_VERSION: "privacy-gate-current-bank-v1",
  DIAGNOSTIC_V9_ENGINE_VERSION: "privacy-gate-current-engine-v1",
  DIAGNOSTIC_V9_SCORING_VERSION: "diag-v3-candidate-calibration-v4",
  DIAGNOSTIC_V9_RECOMMENDATION_VERSION: "privacy-gate-current-recommendations-v1",
  DIAGNOSTIC_V9_CONSENT_VERSION: "privacy-gate-current-consent-v1",
};

const cleanEnv = Object.fromEntries(
  ["PATH", "Path", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "USERPROFILE", "HOMEDRIVE", "HOMEPATH"]
    .filter((key) => process.env[key])
    .map((key) => [key, process.env[key]]),
);
cleanEnv.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = "false";
cleanEnv.CLOUDFLARE_INCLUDE_PROCESS_ENV = "false";

async function unusedPort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const port = address.port;
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  return port;
}

function runWrangler(args) {
  const result = spawnSync(process.execPath, [wranglerPath, ...args], {
    cwd: root,
    env: cleanEnv,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`wrangler ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return `${result.stdout}\n${result.stderr}`;
}

function queryD1(sql) {
  const result = spawnSync(process.execPath, [
    wranglerPath, "d1", "execute", "DB", "--local", "--config", configPath,
    "--persist-to", persistencePath, "--json", "--command", sql,
  ], {
    cwd: root,
    env: cleanEnv,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`local D1 query failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  const payload = JSON.parse(result.stdout);
  return Array.isArray(payload)
    ? payload.flatMap((batch) => batch.results ?? [])
    : payload.results ?? [];
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

class SessionClient {
  #cookies = new Map();

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  get hasSessionCookie() {
    return this.#cookies.size > 0;
  }

  async request(path, { method = "GET", body, headers: extraHeaders = {} } = {}) {
    const headers = new Headers({
      Origin: this.baseUrl,
      "cf-connecting-ip": "192.0.2.18",
      ...extraHeaders,
    });
    if (body !== undefined) headers.set("Content-Type", "application/json");
    if (this.#cookies.size) {
      headers.set("Cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    }
    const response = await fetch(new URL(path, this.baseUrl), {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: "manual",
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";", 1);
      const separator = pair.indexOf("=");
      if (separator > 0) this.#cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response;
  }
}

async function createTestUser(baseUrl, { label, email, invitationId }) {
  const client = new SessionClient(baseUrl);
  const response = await client.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "X-Vecidya-Invitation": invitationId },
    body: {
      name: `Synthetic V9 ${label}`,
      email,
      password: `local-test-${randomBytes(16).toString("hex")}`,
    },
  });
  if (response.status !== 200) {
    const details = (await response.clone().text()).replace(/(secret|token|password|credential)(["'\s:=]+)[^\s,"'}]+/ig, "$1$2[redacted]");
    assert.fail(`synthetic ${label} signup must succeed locally; received HTTP ${response.status}; body=${details.slice(0, 500)}; ${safeWorkerErrorSummary()}`);
  }
  const payload = await response.json();
  assert.equal(typeof payload.user?.id, "string");
  assert.equal(client.hasSessionCookie, true, `synthetic ${label} signup must issue a local session cookie`);
  return { client, userId: payload.user.id };
}

function seedAuthBootstrap({ bootstrapUserId, organizationId, ownerEmail, otherEmail, ownerInvitationId, otherInvitationId }) {
  const now = Date.now();
  const expiresAt = now + 3_600_000;
  runWrangler([
    "d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistencePath,
    "--command", [
      `INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${sqlLiteral(bootstrapUserId)},'Synthetic bootstrap',${sqlLiteral(`bootstrap-${randomUUID()}@vecidya.test`)},1,${now},${now});`,
      `INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(organizationId)},'Synthetic V9 history test',${sqlLiteral(`v9-history-${randomUUID()}`)},${now});`,
      `INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(ownerInvitationId)},${sqlLiteral(organizationId)},${sqlLiteral(ownerEmail)},'admin','pending',${expiresAt},${now},${sqlLiteral(bootstrapUserId)});`,
      `INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(otherInvitationId)},${sqlLiteral(organizationId)},${sqlLiteral(otherEmail)},'admin','pending',${expiresAt},${now},${sqlLiteral(bootstrapUserId)});`,
    ].join("\n"),
  ]);
}

function seedHistoricalRun({ ownerUserId }) {
  const runId = randomUUID();
  const identityId = randomUUID();
  const eventId = randomUUID();
  const startedAt = "2025-01-01T00:00:00.000Z";
  const eventAt = "2025-01-01T00:00:10.000Z";
  const finishedAt = "2025-01-01T00:01:00.000Z";
  const eventPayload = JSON.stringify({ questionId: "history-q1", value: "synthetic-old-answer", mode: "answer" });
  const result = {
    score: { historicalFixture: "score-v1", rawScore: 37 },
    evidence: { historicalFixture: "evidence-v1", source: "immutable-event-log" },
    recommendations: { historicalFixture: "recommendations-v1", items: ["synthetic-preserved-item"] },
  };
  const sql = [
    `UPDATE user SET email_verified=1 WHERE id=${sqlLiteral(ownerUserId)};`,
    `INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,credential_hash,created_at) VALUES (${sqlLiteral(identityId)},'user',${sqlLiteral(ownerUserId)},NULL,${sqlLiteral(startedAt)});`,
    `INSERT INTO diagnostic_v9_runs (workspace_id,run_id,client_id,status,started_at,last_seq,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (${sqlLiteral(workspaceId)},${sqlLiteral(runId)},NULL,'active',${sqlLiteral(startedAt)},0,${sqlLiteral(historicalVersions.bank)},${sqlLiteral(historicalVersions.engine)},${sqlLiteral(historicalVersions.scoring)},${sqlLiteral(historicalVersions.recommendations)},${sqlLiteral(historicalVersions.consent)});`,
    `INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (${sqlLiteral(workspaceId)},${sqlLiteral(runId)},${sqlLiteral(identityId)},${sqlLiteral(startedAt)},'authenticated_session');`,
    `INSERT INTO diagnostic_v9_events (workspace_id,run_id,seq,event_id,kind,payload_json,occurred_at,schema_version,actor_type) VALUES (${sqlLiteral(workspaceId)},${sqlLiteral(runId)},1,${sqlLiteral(eventId)},'answer',${sqlLiteral(eventPayload)},${sqlLiteral(eventAt)},1,'client');`,
    `INSERT INTO diagnostic_v9_results (workspace_id,run_id,result_version,score_json,evidence_json,recommendations_json,report_ref,created_at) VALUES (${sqlLiteral(workspaceId)},${sqlLiteral(runId)},1,${sqlLiteral(JSON.stringify(result.score))},${sqlLiteral(JSON.stringify(result.evidence))},${sqlLiteral(JSON.stringify(result.recommendations))},NULL,${sqlLiteral(finishedAt)});`,
    `UPDATE diagnostic_v9_runs SET status='completed',finished_at=${sqlLiteral(finishedAt)} WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)} AND status='active' AND last_seq=1;`,
  ].join("\n");
  runWrangler([
    "d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistencePath,
    "--command", sql,
  ]);
  return {
    runId,
    identityId,
    eventId,
    eventPayload,
    startedAt,
    eventAt,
    finishedAt,
    versions: historicalVersions,
    result,
  };
}

function historicalSnapshot(runId) {
  const rows = queryD1(`SELECT
    (SELECT COUNT(*) FROM diagnostic_v9_identities) AS identity_count,
    (SELECT COUNT(*) FROM diagnostic_v9_runs) AS run_count,
    (SELECT COUNT(*) FROM diagnostic_v9_run_ownership) AS ownership_count,
    (SELECT COUNT(*) FROM diagnostic_v9_events) AS event_count,
    (SELECT COUNT(*) FROM diagnostic_v9_results) AS result_count,
    (SELECT status || ':' || last_seq FROM diagnostic_v9_runs WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)}) AS run_state,
    (SELECT payload_json FROM diagnostic_v9_events WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)} AND seq=1) AS event_payload,
    (SELECT score_json FROM diagnostic_v9_results WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)} AND result_version=1) AS score_json,
    (SELECT evidence_json FROM diagnostic_v9_results WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)} AND result_version=1) AS evidence_json,
    (SELECT recommendations_json FROM diagnostic_v9_results WHERE workspace_id=${sqlLiteral(workspaceId)} AND run_id=${sqlLiteral(runId)} AND result_version=1) AS recommendations_json`);
  assert.equal(rows.length, 1);
  return rows[0];
}

async function stopWorker(worker) {
  if (!worker?.pid) return;
  const exited = worker.exitCode !== null || worker.signalCode !== null;
  const exit = exited ? Promise.resolve() : once(worker, "exit").catch(() => undefined);
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(worker.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  } else {
    worker.kill("SIGTERM");
  }
  await exit;
}

function startWorker(port) {
  workerOutput = "";
  const child = spawn(process.execPath, [
    wranglerPath, "dev", "--config", configPath, "--local", "--port", String(port),
    "--persist-to", persistencePath, "--log-level", "info", "--show-interactive-dev-session=false",
  ], {
    cwd: root,
    env: { ...cleanEnv, BETTER_AUTH_SECRET: authSecret },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.stdout.on("data", (chunk) => { workerOutput += chunk.toString(); });
  child.stderr.on("data", (chunk) => { workerOutput += chunk.toString(); });
  return child;
}

function safeWorkerErrorSummary() {
  const lines = workerOutput.split(/\r?\n/)
    .slice(-8)
    .map((line) => line.replace(/((?:secret|token|password|credential)[^:=]*[:=]\s*)\S+/ig, "$1[redacted]"));
  return lines.filter(Boolean).join(" | ") || "no worker output captured";
}

async function waitForWorker(baseUrl, child) {
  let ready = false;
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Worker exited early: ${workerOutput}`);
    try {
      await fetch(`${baseUrl}/__privacy_gate_probe__`);
      ready = true;
      break;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    }
  }
  assert.ok(ready, `local Worker did not become ready: ${workerOutput}`);
}

async function removeTempDirectory(path) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt >= 10 || !["EBUSY", "EPERM"].includes(error?.code)) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100 * (attempt + 1)));
    }
  }
}

let worker;
let workerOutput = "";
try {
  const port = await unusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const baseConfig = {
    name: "vecidya-v9-privacy-gate-test",
    main: resolve(root, "build/server/index.js"),
    compatibility_date: "2026-08-13",
    compatibility_flags: ["nodejs_compat"],
    workers_dev: true,
    assets: { directory: resolve(root, "build/client"), binding: "ASSETS" },
    d1_databases: [{
      binding: "DB",
      database_name: "vecidya-v9-privacy-gate-test",
      database_id: "11111111-1111-4111-8111-111111111111",
      migrations_dir: resolve(root, "db/migrations"),
    }],
    ratelimits: [{
      name: "DIAGNOSTIC_PUBLIC_RATE_LIMITER",
      namespace_id: "999999101",
      simple: { limit: 100, period: 60 },
    }],
  };
  const writeConfig = async (publicEnabled, runtimeSuffix) => {
    const config = {
      ...baseConfig,
      vars: {
        ...vars,
        BETTER_AUTH_SECRET: authSecret,
        APP_URL: baseUrl,
        BETTER_AUTH_URL: baseUrl,
        DIAGNOSTIC_V9_PUBLIC_ENABLED: publicEnabled ? "true" : "false",
        DIAGNOSTIC_V9_BANK_VERSION: `privacy-gate-${runtimeSuffix}-bank`,
        DIAGNOSTIC_V9_ENGINE_VERSION: `privacy-gate-${runtimeSuffix}-engine`,
        DIAGNOSTIC_V9_RECOMMENDATION_VERSION: `privacy-gate-${runtimeSuffix}-recommendations`,
        DIAGNOSTIC_V9_CONSENT_VERSION: `privacy-gate-${runtimeSuffix}-consent`,
      },
    };
    await writeFile(configPath, JSON.stringify(config));
  };
  await writeConfig(false, "runtime-before");

  runWrangler([
    "d1", "migrations", "apply", "DB", "--local", "--config", configPath, "--persist-to", persistencePath,
  ]);

  runWrangler([
    "d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistencePath,
    "--command", "CREATE TABLE privacy_gate_probe (id TEXT PRIMARY KEY); INSERT INTO privacy_gate_probe VALUES ('preserved');",
  ]);

  const bootstrapUserId = randomUUID();
  const organizationId = randomUUID();
  const ownerEmail = `v9-history-owner-${randomUUID()}@vecidya.test`;
  const otherEmail = `v9-history-other-${randomUUID()}@vecidya.test`;
  const ownerInvitationId = randomUUID();
  const otherInvitationId = randomUUID();
  seedAuthBootstrap({ bootstrapUserId, organizationId, ownerEmail, otherEmail, ownerInvitationId, otherInvitationId });

  worker = startWorker(port);
  await waitForWorker(baseUrl, worker);
  const owner = await createTestUser(baseUrl, { label: "owner", email: ownerEmail, invitationId: ownerInvitationId });
  const otherUser = await createTestUser(baseUrl, { label: "other", email: otherEmail, invitationId: otherInvitationId });
  await stopWorker(worker);
  worker = undefined;

  runWrangler([
    "d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistencePath,
    "--command", `UPDATE user SET email_verified=1 WHERE id IN (${sqlLiteral(owner.userId)},${sqlLiteral(otherUser.userId)});`,
  ]);
  const historical = seedHistoricalRun({ ownerUserId: owner.userId });
  const beforeReads = historicalSnapshot(historical.runId);
  assert.equal(beforeReads.run_state, "completed:1");
  assert.equal(beforeReads.event_payload, historical.eventPayload);

  // Authorized historical reads remain available even when creation of new public V9 runs is off.
  worker = startWorker(port);
  await waitForWorker(baseUrl, worker);
  const ownerHistoryPage = await owner.client.request("/app/diagnosticos");
  assert.equal(ownerHistoryPage.status, 200, "the authenticated owner can open their historical index");
  const ownerHistoryHtml = await ownerHistoryPage.text();
  assert.doesNotMatch(ownerHistoryHtml, /Vincular organización|Recuperar diagnósticos de esta visita/,
    "the UI does not offer D1 ownership/link mutations under the current policy");
  const ownerStateResponse = await owner.client.request(`/api/diagnostic/v9/runs/${historical.runId}`);
  assert.equal(ownerStateResponse.status, 200, "the owner can read a historical run while public V9 is disabled");
  const ownerState = await ownerStateResponse.json();
  assert.equal(ownerState.ok, true);
  assert.equal(ownerState.readOnly, true);
  assert.equal(ownerState.runId, historical.runId);
  assert.equal(ownerState.status, "completed");
  assert.equal(ownerState.finishedAt, historical.finishedAt);
  assert.deepEqual(ownerState.versions, historical.versions);
  assert.deepEqual(ownerState.events, [{
    seq: 1,
    eventId: historical.eventId,
    kind: "answer",
    payloadJson: historical.eventPayload,
    occurredAt: historical.eventAt,
    schemaVersion: 1,
    actorType: "client",
  }]);

  const ownerResultResponse = await owner.client.request(`/api/diagnostic/v9/runs/${historical.runId}/result`);
  assert.equal(ownerResultResponse.status, 200, "the owner can read the immutable stored result without current-version matching");
  const ownerResult = await ownerResultResponse.json();
  assert.equal(ownerResult.ok, true);
  assert.equal(ownerResult.readOnly, true);
  assert.equal(ownerResult.resultVersion, 1);
  assert.deepEqual(ownerResult.score, historical.result.score);
  assert.deepEqual(ownerResult.evidence, historical.result.evidence);
  assert.deepEqual(ownerResult.recommendations, historical.result.recommendations);
  assert.deepEqual(ownerResult.versions, historical.versions);

  for (const path of [`/api/diagnostic/v9/runs/${historical.runId}`, `/api/diagnostic/v9/runs/${historical.runId}/result`]) {
    const unauthorized = await otherUser.client.request(path);
    assert.equal(unauthorized.status, 404, `another authenticated identity cannot read ${path}`);
    const anonymous = await fetch(new URL(path, baseUrl), {
      headers: { Origin: baseUrl, "cf-connecting-ip": "192.0.2.19" },
    });
    assert.equal(anonymous.status, 401, `an unauthenticated caller cannot read ${path}`);
  }
  await stopWorker(worker);
  worker = undefined;
  const afterReads = historicalSnapshot(historical.runId);
  assert.deepEqual(afterReads, beforeReads, "historical reads do not create or mutate D1 records");

  // Change the active runtime version set: historical reads still use run-pinned metadata.
  const configAfterVersionChange = {
    name: baseConfig.name,
    main: baseConfig.main,
    compatibility_date: baseConfig.compatibility_date,
    compatibility_flags: baseConfig.compatibility_flags,
    workers_dev: baseConfig.workers_dev,
    assets: baseConfig.assets,
    d1_databases: baseConfig.d1_databases,
    ratelimits: baseConfig.ratelimits,
    vars: {
      ...vars,
      BETTER_AUTH_SECRET: authSecret,
      APP_URL: baseUrl,
      BETTER_AUTH_URL: baseUrl,
      DIAGNOSTIC_V9_PUBLIC_ENABLED: "true",
      DIAGNOSTIC_V9_BANK_VERSION: "privacy-gate-runtime-after-bank-v2",
      DIAGNOSTIC_V9_ENGINE_VERSION: "privacy-gate-runtime-after-engine-v2",
      DIAGNOSTIC_V9_SCORING_VERSION: vars.DIAGNOSTIC_V9_SCORING_VERSION,
      DIAGNOSTIC_V9_RECOMMENDATION_VERSION: "privacy-gate-runtime-after-recommendations-v2",
      DIAGNOSTIC_V9_CONSENT_VERSION: "privacy-gate-runtime-after-consent-v2",
    },
  };
  await writeFile(configPath, JSON.stringify(configAfterVersionChange));
  worker = startWorker(port);
  await waitForWorker(baseUrl, worker);
  const resultAfterVersionChangeResponse = await owner.client.request(`/api/diagnostic/v9/runs/${historical.runId}/result`);
  assert.equal(resultAfterVersionChangeResponse.status, 200, "runtime version changes do not block historical result reads");
  const resultAfterVersionChange = await resultAfterVersionChangeResponse.json();
  assert.deepEqual(resultAfterVersionChange, ownerResult, "stored results and run-pinned versions remain byte-equivalent after runtime version changes");

  // Direct writes remain blocked even when the public V9 flag is true and the caller is authenticated.
  const eventBody = {
    eventId: randomUUID(),
    expectedSeq: 1,
    kind: "answer",
    payload: { questionId: "history-q1", value: "must-not-persist", mode: "answer" },
    occurredAt: new Date().toISOString(),
  };
  const legacyWrites = [
    ["/api/diagnostic/anonymous-identity", {}],
    ["/api/diagnostic/v9/runs", { consent: true }],
    [`/api/diagnostic/v9/runs/${historical.runId}/events`, eventBody],
    [`/api/diagnostic/v9/runs/${historical.runId}/finalize`, {}],
  ];
  for (const [path, body] of legacyWrites) {
    const response = await owner.client.request(path, { method: "POST", body });
    assert.equal(response.status, 503, `POST ${path} remains disabled even with public V9 enabled`);
    assert.deepEqual(await response.json(), { error: disabledError });
  }
  const claimResponse = await owner.client.request("/api/diagnostic/claim-anonymous", { method: "POST", body: {} });
  assert.equal(claimResponse.status, 503, "claiming old anonymous history cannot create/link individual D1 ownership");
  assert.deepEqual(await claimResponse.json(), { error: disabledError });
  const organizationLinkResponse = await owner.client.request("/app/diagnosticos", {
    method: "POST",
    body: { workspaceId, runId: historical.runId, organizationId: randomUUID() },
  });
  assert.equal(organizationLinkResponse.status, 503, "historical diagnostics cannot be linked to an organization under the current privacy policy");

  const transient = await fetch(new URL("/api/diagnostic/v9/finalize-transient", baseUrl), {
    method: "POST",
    headers: { Origin: baseUrl, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(transient.status, 503);
  assert.deepEqual(await transient.json(), { error: "La finalización segura no está disponible temporalmente." });

  const v8Page = await fetch(new URL("/diagnostico", baseUrl));
  assert.equal(v8Page.status, 200, "QA-03B V8 remains available while the V9 public flag is on");
  assert.match(v8Page.headers.get("content-type") ?? "", /text\/html/i);

  await stopWorker(worker);
  worker = undefined;
  const afterBlockedWrites = historicalSnapshot(historical.runId);
  assert.deepEqual(afterBlockedWrites, beforeReads, "legacy POSTs do not alter historical D1 records or create new individual records");
  const probeRows = queryD1("SELECT COUNT(*) AS count FROM privacy_gate_probe");
  assert.equal(probeRows[0]?.count, 1, "local D1 sentinel remains unchanged");
  console.log("PASS owner-only historical reads survive disabled/public/version-changed V9; stored result and event history are unchanged; legacy writes remain blocked; transient V9 fails closed; QA-03B remains available.");
} finally {
  await stopWorker(worker);
  await removeTempDirectory(temp);
}
