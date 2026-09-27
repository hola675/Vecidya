import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

/**
 * DIAG-V3-07 (Save & Resume). Prueba real contra el Worker local (`pnpm run dev`) con D1 + KV
 * locales: guardar para después, recovery code, rotación de `writeToken`, expiración, versión
 * incompatible, respuestas invalidadas excluidas del snapshot guardado, y las mutaciones A-J del
 * spec (DIAG-V3-07 §49). Nunca contra `--remote`.
 */
setDefaultAutoSelectFamilyAttemptTimeout(5_000); // TEST-LOCALHOST-001
assertLocalBaseUrl();
const results = [];

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-diagnostic-save-resume-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

// TEST-D1-RESET-001, mismo arnés que `diagnostic-persistence-check.mjs`.
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

async function kvGetLocal(key) {
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler kv key get --binding=DIAGNOSTIC_SNAPSHOTS --local ${key}`], { cwd: process.cwd(), encoding: "utf8" });
  await warmUp();
  if (result.status !== 0) return null;
  const text = result.stdout.trim();
  return text.length && text !== "Value not found" ? text : null;
}

function post(body) { return { method: "POST", headers: { "content-type": "application/json", origin: baseUrl }, body: JSON.stringify(body) }; }

async function jsonOf(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}

const sessionsPath = "/api/diagnostic/sessions";
const savePath = (id) => `/api/diagnostic/sessions/${id}/save`;
const completePath = (id) => `/api/diagnostic/sessions/${id}/complete`;
const sessionPath = (id) => `/api/diagnostic/sessions/${id}`;
const recoverPath = "/api/diagnostic/recover";

async function createSession() {
  const response = await fetch(new URL(sessionsPath, baseUrl), post({}));
  harness(response.status === 201, `crear sesión devolvió ${response.status}`);
  return jsonOf(response);
}

async function saveSession(sessionId, writeToken, answers, extra = {}) {
  return fetch(new URL(savePath(sessionId), baseUrl), post({ writeToken, answers, currentQuestionId: null, questionsSeen: 2, questionsAnswered: 2, ...extra }));
}

async function recover(code) {
  return fetch(new URL(recoverPath, baseUrl), post({ code }));
}

let harnessFailure = null;
const createdSessionIds = [];

try {
  // --- 1. SAVE crea un snapshot durable y mina un recovery code, una sola vez -------------------
  const created = await createSession();
  createdSessionIds.push(created.sessionId);
  const saveResponse = await saveSession(created.sessionId, created.writeToken, { profile: "business", stage: "growing" });
  check(saveResponse.status === 200, "SAVE con token correcto → 200");
  check(saveResponse.headers.get("cache-control") === "no-store", "mutación I: la respuesta de SAVE lleva Cache-Control: no-store");
  const saveBody = await jsonOf(saveResponse);
  check(saveBody.status === "saved", "primer SAVE: status 'saved'");
  check(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(saveBody.recoveryCode ?? ""), "el recovery code tiene la forma XXXX-XXXX-XXXX");
  const recoveryCode = saveBody.recoveryCode;

  const [savedRow] = await d1(`SELECT * FROM diagnostic_saved_snapshot WHERE session_id = '${created.sessionId}';`);
  check(Boolean(savedRow), "el saved snapshot existe en D1 tras SAVE");
  check(/^[0-9a-f]{64}$/.test(savedRow?.recovery_lookup_digest ?? ""), "D1 guarda un digest HMAC-SHA-256 hexadecimal, no el código");
  const rawCode = recoveryCode.replace(/-/g, "");
  // Mutación A: el código en claro (con o sin guiones) no debe aparecer en NINGUNA columna de la fila.
  const rawInAnyColumn = Object.values(savedRow ?? {}).some((value) => typeof value === "string" && (value.includes(rawCode) || value.includes(recoveryCode)));
  check(!rawInAnyColumn, "mutación A: el recovery code en claro no aparece en ninguna columna de diagnostic_saved_snapshot");

  const [sessionAfterSave] = await d1(`SELECT status FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  check(sessionAfterSave?.status === "SAVED", "D1: la sesión pasa a status SAVED tras el primer SAVE");

  // Mutación B: KV nunca recibe el código en claro. SAVE no escribe KV en absoluto en este diseño.
  const kvAfterSave = await kvGetLocal(`diagnostic:session:${created.sessionId}`);
  check(!(kvAfterSave ?? "").includes(rawCode), "mutación B: KV no contiene el recovery code en claro");

  // --- 2. Idempotencia (spec §11): un retry con el MISMO contenido no vuelve a exponer un código --
  const retrySave = await saveSession(created.sessionId, created.writeToken, { profile: "business", stage: "growing" });
  check(retrySave.status === 200, "retry de SAVE con el mismo contenido → 200");
  const retryBody = await jsonOf(retrySave);
  check(retryBody.status === "already_saved", "retry idéntico: status 'already_saved', no 'saved'");
  check(!("recoveryCode" in retryBody), "retry idéntico: la respuesta NO vuelve a exponer un recoveryCode");

  // --- 2b. Contenido distinto SÍ mina un código nuevo, e invalida el anterior (hallazgo de revisión) --
  // A partir de aquí empieza a consumirse el cupo de RECOVER de esta IP (10/60s, `wrangler.jsonc`):
  // se registra el instante del primer intento para poder esperar a que la ventana se reinicie antes
  // de las comprobaciones funcionales de más abajo (secciones 4 en adelante) — ver 2e.
  const firstRecoverCallAt = Date.now();
  const rotateSession = await createSession();
  createdSessionIds.push(rotateSession.sessionId);
  const firstOfRotateBody = await jsonOf(await saveSession(rotateSession.sessionId, rotateSession.writeToken, { profile: "business", stage: "growing" }));
  const secondOfRotate = await saveSession(rotateSession.sessionId, rotateSession.writeToken, { profile: "business", stage: "growing", team: "small" });
  check(secondOfRotate.status === 200, "SAVE con contenido distinto → 200");
  const secondOfRotateBody = await jsonOf(secondOfRotate);
  check(secondOfRotateBody.status === "saved" && secondOfRotateBody.recoveryCode !== firstOfRotateBody.recoveryCode, "contenido distinto mina un código NUEVO, distinto del anterior");
  const oldCodeAfterRotate = await recover(firstOfRotateBody.recoveryCode);
  check(oldCodeAfterRotate.status === 404, "el código ANTERIOR deja de funcionar en cuanto se mina uno nuevo (el digest se reemplazó)");
  const newCodeAfterRotate = await recover(secondOfRotateBody.recoveryCode);
  check(newCodeAfterRotate.status === 200, "el código NUEVO funciona de inmediato");
  const newCodeAfterRotateBody = await jsonOf(newCodeAfterRotate);
  check(newCodeAfterRotateBody.snapshot?.answers?.team === "small", "el snapshot recuperado refleja el contenido del SEGUNDO save, no del primero");

  // --- 2c. `regenerateCode: true` mina un código nuevo aunque el contenido no cambió (spec §36) ---
  const regenSession = await createSession();
  createdSessionIds.push(regenSession.sessionId);
  const firstOfRegenBody = await jsonOf(await saveSession(regenSession.sessionId, regenSession.writeToken, { profile: "business", stage: "growing" }));
  const sameContentRetryBody = await jsonOf(await saveSession(regenSession.sessionId, regenSession.writeToken, { profile: "business", stage: "growing" }));
  check(sameContentRetryBody.status === "already_saved", "control: sin regenerateCode, contenido idéntico → already_saved (sin esto, el siguiente check no probaría nada nuevo)");
  const regenResponse = await saveSession(regenSession.sessionId, regenSession.writeToken, { profile: "business", stage: "growing" }, { regenerateCode: true });
  check(regenResponse.status === 200, "SAVE con regenerateCode:true → 200");
  const regenBody = await jsonOf(regenResponse);
  check(regenBody.status === "saved" && regenBody.recoveryCode !== firstOfRegenBody.recoveryCode, "regenerateCode mina un código nuevo pese a contenido idéntico (resuelve el caso 'perdí mi código', spec §11/§36)");
  const oldCodeAfterRegen = await recover(firstOfRegenBody.recoveryCode);
  check(oldCodeAfterRegen.status === 404, "el código anterior a la regeneración explícita deja de funcionar");

  // --- 2d. Concurrencia: dos primeros SAVE a la vez nunca producen 500 ni dos filas ---------------
  // Hallazgo de la revisión independiente: antes, el segundo INSERT chocaba con la restricción de la
  // PK (`session_id`), el bucle de reintento lo confundía con una colisión de `recovery_lookup_digest`
  // y, tras agotar los reintentos contra el mismo error, terminaba en un 500 sin control. La escritura
  // ahora usa `INSERT … ON CONFLICT (session_id) DO UPDATE`.
  const raceSession = await createSession();
  createdSessionIds.push(raceSession.sessionId);
  const [raceA, raceB] = await Promise.all([
    saveSession(raceSession.sessionId, raceSession.writeToken, { profile: "business", stage: "growing" }),
    saveSession(raceSession.sessionId, raceSession.writeToken, { profile: "business", stage: "growing" }),
  ]);
  check(raceA.status === 200 && raceB.status === 200, "mutación (concurrencia): dos primeros SAVE concurrentes de la misma sesión → ambos 200, ninguno 500");
  const [raceABody, raceBBody] = await Promise.all([jsonOf(raceA), jsonOf(raceB)]);
  const [raceRowCount] = await d1(`SELECT COUNT(*) as n FROM diagnostic_saved_snapshot WHERE session_id = '${raceSession.sessionId}';`);
  check(raceRowCount?.n === 1, "la carrera deja exactamente 1 fila en diagnostic_saved_snapshot, nunca dos ni ninguna");
  const raceCodes = [raceABody.recoveryCode, raceBBody.recoveryCode].filter(Boolean);
  const raceRecoverResults = await Promise.all(raceCodes.map((code) => recover(code)));
  check(raceRecoverResults.some((response) => response.status === 200), "al menos uno de los dos códigos devueltos por la carrera recupera la sesión con éxito");

  // --- 2e. Mutación G: rate limiting real, aprovechando el cupo ya consumido por 2b-2d ------------
  // El algoritmo de Cloudflare Rate Limiting es aproximado, no un contador exacto (documentado así
  // por Cloudflare, no solo aquí): en una corrida real, 13 intentos combinados (5 de 2b-2d + un primer
  // intento de 8) NO bastaron para ver un 429, así que el margen debe ser generoso, no el mínimo
  // matemático sobre `simple: {limit: 10, period: 60}` de `wrangler.jsonc`.
  const rateLimitProbe = [];
  for (let attempt = 0; attempt < 30; attempt += 1) rateLimitProbe.push(await recover("PROBE-CODE-0000"));
  check(rateLimitProbe.some((response) => response.status === 429), "mutación G: una ráfaga suficiente contra RECOVER termina en 429 (rate limiting real, no solo de configuración)");
  const rateLimited = rateLimitProbe.find((response) => response.status === 429);
  if (rateLimited) check(rateLimited.headers.get("cache-control") === "no-store", "la respuesta 429 también lleva Cache-Control: no-store");

  // El resto del script sigue usando RECOVER con fines funcionales (nunca de volumen): esperar a que
  // la ventana de la ratelimit se reinicie evita que esas comprobaciones reciban un 429 en vez del
  // código de estado que están probando realmente.
  const RATE_LIMIT_WINDOW_MS = 65_000; // margen sobre los 60 s configurados en wrangler.jsonc
  const elapsedSinceFirstRecover = Date.now() - firstRecoverCallAt;
  if (elapsedSinceFirstRecover < RATE_LIMIT_WINDOW_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_WINDOW_MS - elapsedSinceFirstRecover));
  }

  // --- 3. Mutación F: una respuesta invalidada por routing nunca llega al snapshot guardado -------
  const invalidatedSession = await createSession();
  createdSessionIds.push(invalidatedSession.sessionId);
  // "capture" exige stage resuelto en {occasional,regular,growing}; sin stage, no es aplicable.
  const invalidatedSave = await saveSession(invalidatedSession.sessionId, invalidatedSession.writeToken, { profile: "business", capture: "always" });
  check(invalidatedSave.status === 200, "SAVE con una respuesta que quedará invalidada sigue siendo válido");
  const [invalidatedRow] = await d1(`SELECT active_answers_json FROM diagnostic_saved_snapshot WHERE session_id = '${invalidatedSession.sessionId}';`);
  const invalidatedAnswers = JSON.parse(invalidatedRow?.active_answers_json ?? "{}");
  check("capture" in invalidatedAnswers === false && invalidatedAnswers.profile === "business", "mutación F: 'capture' (inactivo sin stage) nunca llega al snapshot guardado");

  // --- 4. RECOVER: nuevo writeToken, snapshot canónico, token anterior rechazado (spec §18/§19) ---
  const recoverResponse = await recover(recoveryCode);
  check(recoverResponse.status === 200, "RECOVER con código válido → 200");
  check(recoverResponse.headers.get("cache-control") === "no-store", "mutación I: la respuesta de RECOVER lleva Cache-Control: no-store");
  const recoverBody = await jsonOf(recoverResponse);
  check(recoverBody.sessionId === created.sessionId, "RECOVER devuelve la MISMA sesión que se guardó");
  check(typeof recoverBody.writeToken === "string" && recoverBody.writeToken !== created.writeToken, "mutación D: RECOVER rota el writeToken (nunca el mismo de antes)");
  check(recoverBody.snapshot?.answers?.profile === "business" && recoverBody.snapshot?.answers?.stage === "growing", "RECOVER devuelve las respuestas canónicas guardadas");
  const newWriteToken = recoverBody.writeToken;

  const oldTokenAfterRecover = await fetch(new URL(sessionPath(created.sessionId), baseUrl), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ writeToken: created.writeToken, answers: { profile: "business" }, currentQuestionId: null, questionsSeen: 1, questionsAnswered: 1 }) });
  check(oldTokenAfterRecover.status === 403, "mutación D: el writeToken ANTERIOR queda rechazado de inmediato tras recuperar");
  const newTokenWorks = await fetch(new URL(sessionPath(created.sessionId), baseUrl), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ writeToken: newWriteToken, answers: { profile: "business", stage: "growing" }, currentQuestionId: null, questionsSeen: 2, questionsAnswered: 2 }) });
  check(newTokenWorks.status === 200, "el writeToken NUEVO autoriza de inmediato (mismo dispositivo simulando otro: sin localStorage, solo HTTP)");

  const [sessionAfterRecover] = await d1(`SELECT status FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  check(sessionAfterRecover?.status === "IN_PROGRESS", "D1: SAVED → IN_PROGRESS tras recuperar (spec §5)");

  // --- 5. Mutación C: recovery nunca funciona con sessionId (no existe ese parámetro en la ruta) --
  const bySessionIdOnly = await fetch(new URL(recoverPath, baseUrl), post({ sessionId: created.sessionId }));
  const bySessionIdBody = await jsonOf(bySessionIdOnly);
  check(bySessionIdOnly.status === 404 && typeof bySessionIdBody?.error === "string", "mutación C: enviar sessionId en vez de code nunca autoriza una recuperación");

  // --- 6. Mutación H: el código nunca se lee de la URL/query string ------------------------------
  const codeInQuery = await fetch(new URL(`${recoverPath}?code=${encodeURIComponent(recoveryCode)}`, baseUrl), post({}));
  check(codeInQuery.status === 404, "mutación H: un código en la query string es ignorado (nunca se lee de la URL)");
  // Esta ruta solo exporta `action` (sin `loader`): react-router responde 400 a GET antes incluso de
  // llegar al `action`, mismo comportamiento que el resto de rutas `api-diagnostic-*` (ninguna acepta
  // GET). Lo que importa para spec §17/§38 es que el código nunca se lee ni se acepta por GET.
  const getMethod = await fetch(new URL(recoverPath, baseUrl), { method: "GET" });
  check(getMethod.status === 400, "mutación H: GET no ejecuta la recuperación (mismo contrato que el resto de rutas api-diagnostic-*)");

  // --- 7. Completar invalida el saved snapshot (spec §21) ----------------------------------------
  const completeResponse = await fetch(new URL(completePath(created.sessionId), baseUrl), post({ writeToken: newWriteToken, answers: { profile: "business", stage: "growing" } }));
  check(completeResponse.status === 200, "completar con el writeToken rotado → 200");
  const [savedAfterComplete] = await d1(`SELECT COUNT(*) as n FROM diagnostic_saved_snapshot WHERE session_id = '${created.sessionId}';`);
  check(savedAfterComplete?.n === 0, "spec §21: el saved snapshot se borra en la misma transacción que completar");

  const recoverAfterComplete = await recover(recoveryCode);
  check(recoverAfterComplete.status === 404, "el recovery code deja de funcionar tras completar (spec §21)");

  // --- 8. Mutación J: COMPLETED nunca vuelve a SAVED ni acepta un SAVE nuevo ----------------------
  const saveAfterComplete = await saveSession(created.sessionId, newWriteToken, { profile: "business", stage: "growing" });
  check(saveAfterComplete.status === 409, "mutación J: SAVE sobre una sesión COMPLETED → 409, nunca COMPLETED → SAVED");

  // --- 9. Versión incompatible: RECOVER controlado, nunca cast (spec §44) ------------------------
  const mismatchSession = await createSession();
  createdSessionIds.push(mismatchSession.sessionId);
  const mismatchSave = await saveSession(mismatchSession.sessionId, mismatchSession.writeToken, { profile: "business", stage: "growing" });
  const mismatchSaveBody = await jsonOf(mismatchSave);
  await d1(`UPDATE diagnostic_saved_snapshot SET scoring_version = 999 WHERE session_id = '${mismatchSession.sessionId}';`);
  const mismatchRecover = await recover(mismatchSaveBody.recoveryCode);
  check(mismatchRecover.status === 409, "mutación I (versiones): RECOVER con versión incompatible → 409 controlado, no 500 ni cast");

  // --- 10. Expiración: RECOVER perezoso, 410 (spec §22) -------------------------------------------
  const expiredSession = await createSession();
  createdSessionIds.push(expiredSession.sessionId);
  const expiredSave = await saveSession(expiredSession.sessionId, expiredSession.writeToken, { profile: "business", stage: "growing" });
  const expiredSaveBody = await jsonOf(expiredSave);
  await d1(`UPDATE diagnostic_saved_snapshot SET expires_at = ${Date.now() - 1000} WHERE session_id = '${expiredSession.sessionId}';`);
  const [beforeExpiredRecover] = await d1(`SELECT status, token_hash FROM diagnostic_session WHERE id = '${expiredSession.sessionId}';`);
  const expiredRecover = await recover(expiredSaveBody.recoveryCode);
  check(expiredRecover.status === 410, "mutación E: RECOVER con código expirado → 410 Gone, nunca reactiva la sesión");
  const [afterExpiredRecover] = await d1(`SELECT status, token_hash FROM diagnostic_session WHERE id = '${expiredSession.sessionId}';`);
  check(
    afterExpiredRecover?.status === beforeExpiredRecover?.status && afterExpiredRecover?.token_hash === beforeExpiredRecover?.token_hash,
    "un código expirado no rota writeToken ni cambia status: la comprobación de expiración ocurre antes de cualquier escritura",
  );

  // --- 11. Errores genéricos: formato inválido y digest inexistente responden IGUAL (spec §26) ----
  const malformed = await recover("not-a-real-code");
  const malformedBody = await jsonOf(malformed);
  const nonexistent = await recover("ZZZZ-ZZZZ-ZZZZ");
  const nonexistentBody = await jsonOf(nonexistent);
  check(malformed.status === 404 && nonexistent.status === 404 && malformedBody.error === nonexistentBody.error, "spec §26: formato inválido y código inexistente devuelven la MISMA respuesta genérica");
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
        DELETE FROM diagnostic_saved_snapshot WHERE session_id IN (${idList});
        DELETE FROM diagnostic_session WHERE id IN (${idList});
      `);
      for (const id of createdSessionIds) {
        spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler kv key delete --binding=DIAGNOSTIC_SNAPSHOTS --local diagnostic:session:${id}`], { cwd: process.cwd(), encoding: "utf8" });
      }
    }
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de Save & Resume): ${harnessFailure.message}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de Save & Resume fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: DIAG-V3-07 ${results.length} comprobaciones de guardar/recuperar, rotación de writeToken, expiración, versión incompatible y mutaciones A-J.`);
