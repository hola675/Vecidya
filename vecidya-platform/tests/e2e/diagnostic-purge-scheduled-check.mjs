import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const base = new URL(baseUrl);
const fixtureIds = [];
const fixture = async (requestId, op) => {
  const response = await fetch(new URL(`/__dev/diagnostico/lifecycle/fixture/${requestId}`, base), {
    method: "POST",
    headers: { Origin: base.origin, "Content-Type": "application/json" },
    body: JSON.stringify({ op }),
  });
  assert.equal(response.status, 200, `fixture local ${op} disponible`);
  return response.json();
};
const scheduled = async () => {
  const response = await fetch(new URL("/__dev/diagnostico/lifecycle/scheduled-purge", base), {
    method: "POST",
    headers: { Origin: base.origin },
  });
  return { status: response.status, body: await response.json() };
};
const triggerCron = async () => fetch(new URL("/cdn-cgi/local/scheduled", base));

try {
  const cronId = randomUUID();
  fixtureIds.push(cronId);
  const cronSeed = await fixture(cronId, "seed_purge_batch");
  assert.equal(cronSeed.challenges, 106);
  const cronFirstRun = await triggerCron();
  assert.equal(cronFirstRun.status, 200, "Wrangler invoca el scheduled() real en el Worker local");
  let cronState = await fixture(cronId, "inspect");
  assert.equal(cronState.counts.requests, 1, "la corrida programada respeta el límite y deja el request hasta agotar hijos");
  assert.equal(cronState.counts.challenges, 6);
  assert.equal(cronState.counts.access, 6, "la FK de challenge no cascada grants por encima del lote de 100");
  const cronSecondRun = await triggerCron();
  assert.equal(cronSecondRun.status, 200, "la siguiente activación programada continúa el lote pendiente");
  cronState = await fixture(cronId, "inspect");
  assert.equal(cronState.counts.requests, 0, "scheduled() elimina el request vencido tras agotar dependencias");
  assert.equal(cronState.counts.challenges, 0);
  assert.equal(cronState.counts.access, 0);

  const activeId = randomUUID();
  fixtureIds.push(activeId);
  const activeSeed = await fixture(activeId, "seed_purge_active_control");
  assert.equal(activeSeed.active, true);
  const activeRun = await scheduled();
  assert.equal(activeRun.status, 200);
  assert.equal(activeRun.body.status, "completed");
  assert.deepEqual(Object.values(activeRun.body.purged), [0, 0, 0, 0, 0, 0], "la corrida no borra filas ni preferencias mientras el informe sigue vigente");
  const activeState = await fixture(activeId, "inspect");
  assert.equal(activeState.counts.requests, 1);
  assert.equal(activeState.counts.snapshots, 1);
  assert.equal(activeState.counts.challenges, 1);
  assert.equal(activeState.counts.access, 1);
  assert.equal(activeState.counts.commercialIntents, 1);
  assert.equal(activeState.counts.researchIntents, 1);

  const expiredId = randomUUID();
  fixtureIds.push(expiredId);
  const expiredSeed = await fixture(expiredId, "seed_purge_batch");
  assert.equal(expiredSeed.challenges, 106, "la fixture excede el límite de 100 por corrida");
  const firstRun = await scheduled();
  assert.equal(firstRun.status, 200);
  assert.equal(firstRun.body.purged.expiredAccess, 100, "el borrado de grants se limita a 100 pese al orden inverso de sus challenges");
  assert.equal(firstRun.body.purged.expiredChallenges, 100, "cada pasada limita challenges a 100 filas");
  let expiredState = await fixture(expiredId, "inspect");
  assert.equal(expiredState.counts.requests, 1, "el request espera a que se borren sus dependencias por tandas");
  assert.equal(expiredState.counts.challenges, 6, "la primera tanda conserva las filas pendientes");
  assert.equal(expiredState.counts.access, 6, "el cascade de FK no elimina grants pendientes fuera de la tanda");

  await fixture(expiredId, "install_purge_failpoint");
  const failedRun = await scheduled();
  assert.equal(failedRun.status, 500, "un fallo de D1 hace fallar el ejecutor para que la siguiente programación reintente");
  expiredState = await fixture(expiredId, "inspect");
  assert.equal(expiredState.counts.requests, 1);
  assert.equal(expiredState.counts.challenges, 6, "el batch transaccional recupera su estado antes del fallo");
  await fixture(expiredId, "remove_purge_failpoint");

  const [recoveryA, recoveryB] = await Promise.all([scheduled(), scheduled()]);
  assert.ok([recoveryA, recoveryB].every((run) => run.status === 200 && run.body.status === "completed"), "corridas concurrentes pueden recuperar el backlog sin error");
  expiredState = await fixture(expiredId, "inspect");
  assert.equal(expiredState.counts.requests, 0, "el request vencido se elimina después de agotar los hijos");
  assert.equal(expiredState.counts.snapshots, 0);
  assert.equal(expiredState.counts.challenges, 0);
  assert.equal(expiredState.counts.access, 0);
  assert.equal(expiredState.counts.commercialIntents, 0);
  assert.equal(expiredState.counts.researchIntents, 0);

  const repeatedRuns = await Promise.all([scheduled(), scheduled()]);
  assert.ok(repeatedRuns.every((run) => run.status === 200 && run.body.status === "completed" && Object.values(run.body.purged).every((count) => count === 0)), "repetición concurrente vacía es idempotente");
  console.log("diagnostic-purge-scheduled-check: PASS — D1 local efímera, límite 100, vigentes conservados, concurrencia, fallo atómico y recuperación");
} finally {
  for (const requestId of fixtureIds.reverse()) {
    try { await fixture(requestId, "cleanup"); } catch { /* Una purga completada ya puede haber borrado el fixture. */ }
  }
}
