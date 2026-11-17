import assert from "node:assert/strict";
import test from "node:test";

import { cloudflareContext } from "../../../server/cloudflare-context";
import * as anonymousIdentityRoute from "../../../app/routes/api-diagnostic-anonymous-identity";
import * as runsRoute from "../../../app/routes/api-diagnostic-v9-runs";
import * as eventsRoute from "../../../app/routes/api-diagnostic-v9-run-events";
import * as finalizeRoute from "../../../app/routes/api-diagnostic-v9-run-finalize";

const V9_CONFIG = {
  DIAGNOSTIC_V9_PUBLIC_ENABLED: "true",
  DIAGNOSTIC_V9_BANK_VERSION: "qa03b-specialty-branches-v9-candidate-77-rev2",
  DIAGNOSTIC_V9_ENGINE_VERSION: "qa03b-v9-utility-first-interactions-v3-extension",
  DIAGNOSTIC_V9_SCORING_VERSION: "diag-v3-candidate-calibration-v4",
  DIAGNOSTIC_V9_RECOMMENDATION_VERSION: "diagnostic-v9-recommendations-v1",
  DIAGNOSTIC_V9_CONSENT_VERSION: "diagnostic-v9-consent-v1",
};
const RUN_ID = "00000000-0000-4000-8000-000000000001";
const LEGACY_DISABLED_ERROR = "La persistencia heredada V9 está deshabilitada para el flujo público.";

function makeRequest(path: string, method: "GET" | "POST", body?: unknown): Request {
  return new Request(`https://vecidya.test${path}`, {
    method,
    headers: {
      Origin: "https://vecidya.test",
      "cf-connecting-ip": "192.0.2.8",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function makeContext(dbCalls: { count: number }) {
  const env = {
    ...V9_CONFIG,
    DIAGNOSTIC_PUBLIC_RATE_LIMITER: { async limit() { return { success: true }; } },
    DB: {
      prepare() { dbCalls.count += 1; throw new Error("unexpected D1 prepare"); },
      batch() { dbCalls.count += 1; throw new Error("unexpected D1 batch"); },
    },
  };
  return {
    env,
    context: {
      get(key: unknown) {
        assert.equal(key, cloudflareContext);
        return { env };
      },
    },
  };
}

async function assertLegacyDisabled(response: Response) {
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: LEGACY_DISABLED_ERROR });
}

test("the public V9 flag does not enable legacy identity/run writes or reach D1", async () => {
  const dbCalls = { count: 0 };
  const { context } = makeContext(dbCalls);
  const eventBody = { eventId: RUN_ID, expectedSeq: 0, kind: "answer", payload: {}, occurredAt: new Date().toISOString() };

  await assertLegacyDisabled(await anonymousIdentityRoute.action({
    context,
    request: makeRequest("/api/diagnostic/anonymous-identity", "POST", {}),
  } as never));
  await assertLegacyDisabled(await runsRoute.action({
    context,
    request: makeRequest("/api/diagnostic/v9/runs", "POST", { consent: true }),
  } as never));
  await assertLegacyDisabled(await eventsRoute.action({
    context,
    request: makeRequest(`/api/diagnostic/v9/runs/${RUN_ID}/events`, "POST", eventBody),
    params: { runId: RUN_ID },
  } as never));
  await assertLegacyDisabled(await finalizeRoute.action({
    context,
    request: makeRequest(`/api/diagnostic/v9/runs/${RUN_ID}/finalize`, "POST", {}),
    params: { runId: RUN_ID },
  } as never));

  assert.equal(dbCalls.count, 0, "blocked public legacy endpoints must not call D1");
});
