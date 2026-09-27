import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

/**
 * DIAG-V3-06 (Persistence Foundation). Prueba real de binding local (D1 + KV) contra el Worker local
 * (`pnpm run dev`): creación de sesión anónima, snapshot autenticado por sessionId+writeToken,
 * finalización server-recomputada, transaccional e idempotente, y las mutaciones A–J del spec.
 * Nunca contra `--remote`.
 */
setDefaultAutoSelectFamilyAttemptTimeout(5_000); // TEST-LOCALHOST-001
assertLocalBaseUrl();
const suffix = Date.now().toString();
const results = [];

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-diagnostic-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

// TEST-D1-RESET-001: un proceso Wrangler externo (D1 o KV) toca el estado local que también usa el
// Worker en vivo, y la petición HTTP inmediatamente posterior puede recibir un ECONNRESET aislado.
// Mismo arnés que `platform-licensing-check.mjs`: calentar con una petición descartable y reintentar.
async function warmUp() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await (await fetch(new URL("/api/auth/ok", baseUrl))).arrayBuffer();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new HarnessError("HARNESS: el Worker local no respondió tras usar Wrangler (TEST-D1-RESET-001).");
}

async function d1(sql) {
  const rows = executeD1(sql);
  await warmUp();
  return rows;
}

// El key de KV nunca lleva espacios (`diagnostic:session:<uuid>`): pasarlo entre comillas dentro del
// string único que recibe `cmd.exe /d /c` hacía que wrangler reportara "Value not found" incluso para
// una key existente (verificado en vivo); sin comillas, cmd.exe lo tokeniza igual y funciona.
async function kvGetLocal(key) {
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler kv key get --binding=DIAGNOSTIC_SNAPSHOTS --local ${key}`], { cwd: process.cwd(), encoding: "utf8" });
  await warmUp();
  if (result.status !== 0) return null;
  const text = result.stdout.trim();
  return text.length && text !== "Value not found" ? text : null;
}

async function kvDeleteLocal(key) {
  spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler kv key delete --binding=DIAGNOSTIC_SNAPSHOTS --local ${key}`], { cwd: process.cwd(), encoding: "utf8" });
  await warmUp();
}

function post(body) { return { method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify(body) }; }
function patch(body) { return { method: "PATCH", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify(body) }; }

async function jsonOf(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}

const sessionsPath = "/api/diagnostic/sessions";
const sessionPath = (id) => `/api/diagnostic/sessions/${id}`;
const completePath = (id) => `/api/diagnostic/sessions/${id}/complete`;

async function createSession() {
  const response = await fetch(new URL(sessionsPath, baseUrl), post({}));
  harness(response.status === 201, `crear sesión devolvió ${response.status}`);
  return jsonOf(response);
}

let harnessFailure = null;
const createdSessionIds = [];

try {
  // --- 1. Crear sesión: no requiere login, devuelve sessionId + writeToken una sola vez --------
  const created = await createSession();
  createdSessionIds.push(created.sessionId);
  check(/^[0-9a-f-]{36}$/i.test(created.sessionId), "sessionId con forma de UUID");
  check(typeof created.writeToken === "string" && created.writeToken.length >= 40, "writeToken presente y de alta entropía");
  check(created.status === "STARTED", "estado inicial STARTED");
  check(!("tokenHash" in created), "la respuesta de creación nunca expone el hash del token");

  const [sessionRow] = await d1(`SELECT status, token_hash, revision, questions_answered FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  check(Boolean(sessionRow), "la sesión existe en D1 tras crearla");
  check(sessionRow?.token_hash !== created.writeToken, "mutación F: D1 nunca guarda el writeToken en claro");
  check(/^[0-9a-f]{64}$/.test(sessionRow?.token_hash ?? ""), "D1 guarda un hash SHA-256 hexadecimal, no el token");
  check(sessionRow?.status === "STARTED", "estado STARTED antes de cualquier snapshot");

  // --- 2. Autorización del snapshot: sessionId solo no basta -------------------------------------
  const snapshotBody = { writeToken: created.writeToken, answers: { profile: "business" }, currentQuestionId: null, questionsSeen: 1, questionsAnswered: 1 };
  const noToken = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch({ ...snapshotBody, writeToken: undefined }));
  check(noToken.status === 400, "snapshot sin writeToken → 400");
  const wrongToken = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch({ ...snapshotBody, writeToken: "not-the-real-token" }));
  check(wrongToken.status === 403, "snapshot con writeToken incorrecto → 403 (sessionId solo no autoriza)");
  const unknownSession = await fetch(new URL(sessionPath("11111111-1111-4111-8111-111111111111"), baseUrl), patch(snapshotBody));
  check(unknownSession.status === 404, "snapshot sobre una sesión inexistente → 404");

  // --- 3. Mutación A / B: QuestionId u OptionId inválidos se rechazan ---------------------------
  const badQuestion = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch({ ...snapshotBody, answers: { not_a_real_question: "x" } }));
  check(badQuestion.status === 400, "mutación A: QuestionId inexistente → reject");
  const badOption = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch({ ...snapshotBody, answers: { profile: "not_a_real_profile" } }));
  check(badOption.status === 400, "mutación B: OptionId inválido → reject");

  // --- 4. Payload gigantesco → 413 (spec §34) ----------------------------------------------------
  const oversized = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch({ ...snapshotBody, junk: "x".repeat(64 * 1024) }));
  check(oversized.status === 413, "payload por encima del límite de tamaño → 413");

  // --- 5. Snapshot válido: actualiza D1 (metadata) y KV (blob temporal) --------------------------
  const okSnapshot = await fetch(new URL(sessionPath(created.sessionId), baseUrl), patch(snapshotBody));
  check(okSnapshot.status === 200, "snapshot válido con token correcto → 200");
  const snapshotBodyJson = await jsonOf(okSnapshot);
  check(snapshotBodyJson.revision === 1, "revision pasa a 1 tras el primer snapshot");
  check(snapshotBodyJson.status === "IN_PROGRESS", "estado pasa a IN_PROGRESS tras responder");
  check(!("writeToken" in snapshotBodyJson) && !("tokenHash" in snapshotBodyJson), "la respuesta de snapshot nunca devuelve el token ni su hash");
  // El servidor de desarrollo de Vite refleja el Origin para tooling local (verificado: también
  // ocurre en rutas preexistentes ajenas al Diagnóstico); lo que exige spec §35 es que NO sea un
  // wildcard abierto y que NO refleje un origen ajeno, nunca que la cabecera esté ausente en dev.
  check(okSnapshot.headers.get("access-control-allow-origin") !== "*", "spec §35: nunca un wildcard abierto en Access-Control-Allow-Origin");
  const foreignOrigin = await fetch(new URL(sessionsPath, baseUrl), { method: "POST", headers: { "content-type": "application/json", origin: "http://evil.example" }, body: "{}" });
  check(foreignOrigin.headers.get("access-control-allow-origin") !== "http://evil.example", "spec §35: un origen ajeno nunca recibe Access-Control-Allow-Origin reflejado");
  const foreignOriginBody = await jsonOf(foreignOrigin);
  if (foreignOriginBody?.sessionId) createdSessionIds.push(foreignOriginBody.sessionId);

  const [afterSnapshot] = await d1(`SELECT status, revision, questions_answered, profile FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  check(afterSnapshot?.status === "IN_PROGRESS", "D1: status IN_PROGRESS tras el snapshot");
  check(afterSnapshot?.revision === 1, "D1: revision=1 tras un solo snapshot");
  check(afterSnapshot?.profile === "business", "D1: profile resuelto se guarda en la sesión (spec §20)");

  const kvRaw = await kvGetLocal(`diagnostic:session:${created.sessionId}`);
  check(Boolean(kvRaw), "KV: el snapshot temporal existe tras el PATCH");
  if (kvRaw) {
    const kvSnapshot = JSON.parse(kvRaw);
    check(kvSnapshot.revision === 1 && kvSnapshot.answers?.profile === "business", "KV: el blob refleja las respuestas y la revisión enviadas");
  }

  // --- 6. Version mismatch: sesión con versiones incompatibles → error controlado, sin cast ------
  const mismatchSession = await createSession();
  createdSessionIds.push(mismatchSession.sessionId);
  await d1(`UPDATE diagnostic_session SET scoring_version = 999 WHERE id = '${mismatchSession.sessionId}';`);
  const mismatchSnapshot = await fetch(new URL(sessionPath(mismatchSession.sessionId), baseUrl), patch({ ...snapshotBody, writeToken: mismatchSession.writeToken }));
  check(mismatchSnapshot.status === 409, "mutación I: snapshot con versiones incompatibles → 409 controlado (conflicto de estado de sesión), no 500 ni cast");
  const mismatchComplete = await fetch(new URL(completePath(mismatchSession.sessionId), baseUrl), post({ writeToken: mismatchSession.writeToken, answers: { profile: "business" } }));
  check(mismatchComplete.status === 400, "mutación I: completar con versiones incompatibles → 400 controlado");

  // --- 7. Mutación C / spec §47: una respuesta invalidada por routing nunca se persiste ----------
  const invalidatedSession = await createSession();
  createdSessionIds.push(invalidatedSession.sessionId);
  // "capture" exige stage∈{occasional,regular,growing}; sin stage, capture no es aplicable.
  const invalidatedComplete = await fetch(
    new URL(completePath(invalidatedSession.sessionId), baseUrl),
    post({ writeToken: invalidatedSession.writeToken, answers: { profile: "business", capture: "always" } }),
  );
  check(invalidatedComplete.status === 200, "completar con una respuesta que quedará invalidada por routing sigue siendo válido");
  const invalidatedAnswers = await d1(`SELECT question_id, answer_value FROM diagnostic_answer WHERE session_id = '${invalidatedSession.sessionId}' ORDER BY question_id;`);
  check(invalidatedAnswers.length === 1 && invalidatedAnswers[0]?.question_id === "profile", "mutación C: 'capture' (inactivo sin stage) nunca llega a diagnostic_answer, solo 'profile'");

  // --- 8. No lo sé / no aplica: round-trip exacto de IDs, nunca null/false/0 (spec §48) -----------
  const uncertainSession = await createSession();
  createdSessionIds.push(uncertainSession.sessionId);
  const uncertainAnswers = { profile: "business", stage: "growing", sources: ["social"], capture: "unknown", pipeline: "na" };
  const uncertainComplete = await fetch(new URL(completePath(uncertainSession.sessionId), baseUrl), post({ writeToken: uncertainSession.writeToken, answers: uncertainAnswers }));
  check(uncertainComplete.status === 200, "completar con 'no lo sé'/'no aplica' es válido");
  const persistedUncertain = await d1(`SELECT question_id, answer_value FROM diagnostic_answer WHERE session_id = '${uncertainSession.sessionId}';`);
  const byQuestion = Object.fromEntries(persistedUncertain.map((row) => [row.question_id, row.answer_value]));
  check(byQuestion.capture === JSON.stringify("unknown"), "«no lo sé» se persiste como el ID exacto 'unknown', no como null/false");
  check(byQuestion.pipeline === JSON.stringify("na"), "«no aplica» se persiste como el ID exacto 'na', nunca convertido a 0/missing");

  // --- 9. Mutación G: el cliente no puede imponer un resultado --------------------------------
  const spoofSession = await createSession();
  createdSessionIds.push(spoofSession.sessionId);
  const spoofResponse = await fetch(
    new URL(completePath(spoofSession.sessionId), baseUrl),
    post({ writeToken: spoofSession.writeToken, answers: { profile: "business" }, result: { overallScore: 999, state: { id: "consolidado" } }, overallScore: 999 }),
  );
  check(spoofResponse.status === 200, "completar ignorando el resultado inventado del cliente sigue funcionando");
  const spoofBody = await jsonOf(spoofResponse);
  check(spoofBody.result?.overallScore !== 999, "mutación G: overallScore inventado por el cliente se ignora");
  check(spoofBody.result?.state?.id !== "consolidado", "mutación G: state inventado por el cliente se ignora");
  const KNOWN_STATE_IDS = ["inicio", "base", "incierto", "fugas", "sistema", "consolidado"];
  check(KNOWN_STATE_IDS.includes(spoofBody.result?.state?.id), "el estado devuelto es uno real, recalculado por el motor");

  // --- 10. Finalización idempotente (mutación D): repetir no duplica ------------------------------
  const idempotentSession = await createSession();
  createdSessionIds.push(idempotentSession.sessionId);
  const completionAnswers = { profile: "business", stage: "growing" };
  const firstComplete = await fetch(new URL(completePath(idempotentSession.sessionId), baseUrl), post({ writeToken: idempotentSession.writeToken, answers: completionAnswers }));
  check(firstComplete.status === 200, "primera finalización → 200");
  const firstBody = await jsonOf(firstComplete);
  check(firstBody.status === "completed", "primera finalización: status 'completed'");

  const [completedRow] = await d1(`SELECT status, completed_at FROM diagnostic_session WHERE id = '${idempotentSession.sessionId}';`);
  check(completedRow?.status === "COMPLETED" && completedRow?.completed_at !== null, "D1: sesión marcada COMPLETED con completed_at");
  const kvAfterCompletion = await kvGetLocal(`diagnostic:session:${idempotentSession.sessionId}`);
  check(!kvAfterCompletion, "KV: el snapshot se borra después de confirmar D1 (spec §29)");

  const secondComplete = await fetch(new URL(completePath(idempotentSession.sessionId), baseUrl), post({ writeToken: idempotentSession.writeToken, answers: completionAnswers }));
  check(secondComplete.status === 200, "segunda finalización idéntica → 200, no error");
  const secondBody = await jsonOf(secondComplete);
  check(secondBody.status === "already_completed", "segunda finalización idéntica: status 'already_completed'");
  check(JSON.stringify(secondBody.result) === JSON.stringify(firstBody.result), "el resultado devuelto es exactamente el mismo (idempotencia real)");

  const answerRows = await d1(`SELECT COUNT(*) as n FROM diagnostic_answer WHERE session_id = '${idempotentSession.sessionId}';`);
  check(answerRows[0]?.n === 2, "mutación D: repetir la finalización no duplica diagnostic_answer (profile + stage = 2)");
  const resultRows = await d1(`SELECT COUNT(*) as n FROM diagnostic_result WHERE session_id = '${idempotentSession.sessionId}';`);
  check(resultRows[0]?.n === 1, "mutación D: repetir la finalización no duplica diagnostic_result");

  // --- 11. Conflicto explícito: misma sesión completada, payload distinto → 409 -------------------
  const conflictComplete = await fetch(
    new URL(completePath(idempotentSession.sessionId), baseUrl),
    post({ writeToken: idempotentSession.writeToken, answers: { profile: "professional" } }),
  );
  check(conflictComplete.status === 409, "spec §28: sesión completada + payload canónico distinto → 409, nunca sobreescritura silenciosa");
  const resultRowsAfterConflict = await d1(`SELECT COUNT(*) as n FROM diagnostic_result WHERE session_id = '${idempotentSession.sessionId}';`);
  check(resultRowsAfterConflict[0]?.n === 1, "el intento de conflicto no crea ni sobreescribe diagnostic_result");

  // --- 12. Sesión ya completada rechaza un snapshot ordinario (§21/§33/§42) -----------------------
  const snapshotAfterCompletion = await fetch(
    new URL(sessionPath(idempotentSession.sessionId), baseUrl),
    patch({ writeToken: idempotentSession.writeToken, answers: completionAnswers, currentQuestionId: null, questionsSeen: 2, questionsAnswered: 2 }),
  );
  check(snapshotAfterCompletion.status === 409, "COMPLETED → IN_PROGRESS rechazado: un snapshot ordinario tras completar da 409");

  // --- 13. Failure injection (spec §41/mutación E): un INSERT del batch falla → sin completion parcial
  const failureSession = await createSession();
  createdSessionIds.push(failureSession.sessionId);
  await d1(`
    INSERT INTO diagnostic_result (id, session_id, diagnostic_version, result_schema_version, state, overall_score, confidence_level, structured_result_json, dimension_results_json, completion_hash, retention_until, created_at)
    VALUES ('preexisting-result-${suffix}', '${failureSession.sessionId}', '2.0', 1, 'inicio', 0, 'baja', '{}', '[]', 'fake-hash-${suffix}', ${Date.now()}, ${Date.now()});
  `);
  const failingComplete = await fetch(new URL(completePath(failureSession.sessionId), baseUrl), post({ writeToken: failureSession.writeToken, answers: { profile: "business" } }));
  check(failingComplete.status >= 400, "una violación de restricción durante el batch responde con error, no con 200");
  const [sessionAfterFailure] = await d1(`SELECT status FROM diagnostic_session WHERE id = '${failureSession.sessionId}';`);
  check(sessionAfterFailure?.status !== "COMPLETED", "mutación E: el batch falla completo — la sesión NO queda marcada COMPLETED");
  const answersAfterFailure = await d1(`SELECT COUNT(*) as n FROM diagnostic_answer WHERE session_id = '${failureSession.sessionId}';`);
  check(answersAfterFailure[0]?.n === 0, "mutación E: ningún diagnostic_answer se insertó pese a que el batch alcanzó a ejecutar ese INSERT (rollback atómico real de D1 .batch())");
  const resultsAfterFailure = await d1(`SELECT COUNT(*) as n FROM diagnostic_result WHERE session_id = '${failureSession.sessionId}';`);
  check(resultsAfterFailure[0]?.n === 1, "mutación E: sigue existiendo solo la fila preexistente, el INSERT nuevo no se coló");

  // --- 14. Hallazgo C1 (revisión independiente): un snapshot que llega DESPUÉS de completar nunca
  // debe devolver la sesión a IN_PROGRESS ni sobrevivir como snapshot de KV. -------------------------
  const raceSession = await createSession();
  createdSessionIds.push(raceSession.sessionId);
  const raceCompleteResponse = await fetch(new URL(completePath(raceSession.sessionId), baseUrl), post({ writeToken: raceSession.writeToken, answers: { profile: "business" } }));
  check(raceCompleteResponse.status === 200, "hallazgo C1: completar antes de la ráfaga → 200");
  const raceSnapshotAfterComplete = await fetch(
    new URL(sessionPath(raceSession.sessionId), baseUrl),
    patch({ writeToken: raceSession.writeToken, answers: { profile: "business" }, currentQuestionId: null, questionsSeen: 1, questionsAnswered: 1 }),
  );
  check(raceSnapshotAfterComplete.status === 409, "hallazgo C1: un snapshot que llega después de completar se rechaza (UPDATE condicional, no solo el chequeo en memoria)");
  const [raceRow] = await d1(`SELECT status FROM diagnostic_session WHERE id = '${raceSession.sessionId}';`);
  check(raceRow?.status === "COMPLETED", "hallazgo C1: la sesión permanece COMPLETED; el snapshot tardío no la revierte a IN_PROGRESS");

  // --- 15. Hallazgo m1 (revisión independiente): dos finalizaciones concurrentes con el mismo
  // contenido nunca producen un 500 ni filas duplicadas — la perdedora de la restricción única se
  // resuelve como `already_completed`, igual que un reintento secuencial. --------------------------
  const concurrentSession = await createSession();
  createdSessionIds.push(concurrentSession.sessionId);
  const concurrentBody = { writeToken: concurrentSession.writeToken, answers: { profile: "professional" } };
  const [concurrentA, concurrentB] = await Promise.all([
    fetch(new URL(completePath(concurrentSession.sessionId), baseUrl), post(concurrentBody)),
    fetch(new URL(completePath(concurrentSession.sessionId), baseUrl), post(concurrentBody)),
  ]);
  check(concurrentA.status === 200 && concurrentB.status === 200, "mutación m1: dos finalizaciones concurrentes idénticas → ambas 200, ninguna 500");
  const [bodyA, bodyB] = await Promise.all([jsonOf(concurrentA), jsonOf(concurrentB)]);
  const statuses = [bodyA.status, bodyB.status].sort();
  check(JSON.stringify(statuses) === JSON.stringify(["already_completed", "completed"]), `exactamente una gana la carrera ('completed') y la otra ve el resultado ya guardado ('already_completed'); recibido: ${JSON.stringify(statuses)}`);
  const concurrentAnswerRows = await d1(`SELECT COUNT(*) as n FROM diagnostic_answer WHERE session_id = '${concurrentSession.sessionId}';`);
  check(concurrentAnswerRows[0]?.n === 1, "mutación m1: sin filas duplicadas en diagnostic_answer pese a la carrera");
  const concurrentResultRows = await d1(`SELECT COUNT(*) as n FROM diagnostic_result WHERE session_id = '${concurrentSession.sessionId}';`);
  check(concurrentResultRows[0]?.n === 1, "mutación m1: sin filas duplicadas en diagnostic_result pese a la carrera");
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  try {
    if (createdSessionIds.length) {
      const idList = createdSessionIds.map((id) => `'${id}'`).join(",");
      executeD1(`
        DELETE FROM diagnostic_answer WHERE session_id IN (${idList});
        DELETE FROM diagnostic_result WHERE session_id IN (${idList});
        DELETE FROM diagnostic_session WHERE id IN (${idList});
      `);
      for (const id of createdSessionIds) await kvDeleteLocal(`diagnostic:session:${id}`);
    }
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de persistencia del Diagnóstico): ${harnessFailure.message}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de persistencia del Diagnóstico fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: DIAG-V3-06 ${results.length} comprobaciones de sesión anónima, autorización por token, snapshot, finalización idempotente/transaccional y mutaciones A-I.`);
