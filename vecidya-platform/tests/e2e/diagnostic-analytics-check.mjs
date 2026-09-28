import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

/**
 * DIAG-V3-08 (Analytics Foundation). Prueba real contra el Worker local (`pnpm run dev`) con D1 local:
 * endpoint /api/diagnostic/events, idempotencia, validación, cupos, y las mutaciones A-J del spec
 * (DIAG-V3-08 §71), más un dataset de fixtures pequeño para dropoff/change-rate/unknown/N/A/abandono
 * (§54-§58, §70) con valores esperados exactos. Nunca contra `--remote`.
 */
setDefaultAutoSelectFamilyAttemptTimeout(5_000); // TEST-LOCALHOST-001
assertLocalBaseUrl();
const results = [];

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-diagnostic-analytics-"));
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

// Espejo de las constantes de `app/features/diagnostic/analytics.ts` (este script es `.mjs` plano, sin
// `--experimental-strip-types`, igual que el resto de `tests/e2e/`). Si cambian allí, cambian aquí.
const ANALYTICS_ABANDONMENT_THRESHOLD_MS = 60 * 60 * 1000;
const MAX_ANALYTICS_EVENTS_PER_BATCH = 25;
const MAX_ANALYTICS_EVENTS_PER_SESSION = 500;
const ANALYTICS_EVENT_RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

const sessionsPath = "/api/diagnostic/sessions";
const eventsPath = "/api/diagnostic/events";
const sessionPath = (id) => `/api/diagnostic/sessions/${id}`;
const savePath = (id) => `/api/diagnostic/sessions/${id}/save`;
const completePath = (id) => `/api/diagnostic/sessions/${id}/complete`;
const recoverPath = "/api/diagnostic/recover";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// QuestionIds reales de `questions.ts`: profile/goal/stage/team son `single` de la sección contexto;
// assets es `multi` de la sección presencia.
const SECTION_OF = { profile: "contexto", goal: "contexto", stage: "contexto", team: "contexto", assets: "presencia" };
const COMPLETION_ANSWERS = { profile: "business", stage: "growing", team: "only_me", goal: "be_found" };

let harnessFailure = null;
const createdSessionIds = [];
const kvWrittenSessionIds = [];

// Cada sesión creada entra a `createdSessionIds` en el mismo acto de crearla: ningún fixture puede
// quedar fuera de la limpieza del `finally` por olvidar un `push`.
async function createSession() {
  const response = await fetch(new URL(sessionsPath, baseUrl), post({}));
  harness(response.status === 201, `crear sesión devolvió ${response.status}`);
  const body = await jsonOf(response);
  harness(UUID_PATTERN.test(body?.sessionId ?? "") && typeof body?.writeToken === "string", "crear sesión no devolvió sessionId/writeToken válidos");
  createdSessionIds.push(body.sessionId);
  return body;
}

function analyticsBatch(sessionId, writeToken, events, extra = {}) {
  return fetch(new URL(eventsPath, baseUrl), post({ sessionId, writeToken, analyticsSchemaVersion: 1, events, ...extra }));
}

function analyticsEvent(eventType, questionId, overrides = {}) {
  return {
    eventUuid: crypto.randomUUID(),
    eventType,
    questionId,
    sectionId: questionId ? (SECTION_OF[questionId] ?? null) : null,
    answerKind: null,
    routeSignature: null,
    questionsSeen: 1,
    questionsAnswered: 0,
    applicableQuestions: 3,
    ...overrides,
  };
}
const shownEvent = (questionId = "profile", overrides = {}) => analyticsEvent("QUESTION_SHOWN", questionId, overrides);
const submittedEvent = (questionId, answerKind = "answered") => analyticsEvent("ANSWER_SUBMITTED", questionId, { answerKind, questionsAnswered: 1 });
const changedEvent = (questionId, answerKind = "answered") => analyticsEvent("ANSWER_CHANGED", questionId, { answerKind, questionsAnswered: 1 });
const invalidatedEvent = (questionId) => analyticsEvent("QUESTION_INVALIDATED", questionId, { sectionId: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
const manyShown = (count) => Array.from({ length: count }, () => shownEvent());

/** Siembra de fixtures: si el endpoint no acepta TODO el batch, el fixture no representa su caso. */
async function seed(session, events) {
  const response = await analyticsBatch(session.sessionId, session.writeToken, events);
  const body = await jsonOf(response);
  harness(response.status === 200 && body?.accepted === events.length, `sembrar ${events.length} eventos devolvió ${response.status} ${JSON.stringify(body)}`);
}

function saveSession(sessionId, writeToken, answers) {
  return fetch(new URL(savePath(sessionId), baseUrl), post({ writeToken, answers, currentQuestionId: null, questionsSeen: 2, questionsAnswered: 2 }));
}

function completeSession(sessionId, writeToken, answers) {
  return fetch(new URL(completePath(sessionId), baseUrl), post({ writeToken, answers }));
}

/**
 * RECOVER comparte cupo por IP (10/60 s, `wrangler.jsonc`) con `diagnostic-save-resume-check.mjs`, que
 * corre justo antes en `run-local-e2e.mjs` y agota ese cupo a propósito (su mutación G). Este script
 * usa RECOVER con fin funcional, nunca de volumen: ante un 429 espera a que la ventana se reinicie y
 * reintenta UNA vez. Cualquier otro status llega tal cual a quien llama.
 */
async function recoverOutsideRateLimit(code) {
  const first = await fetch(new URL(recoverPath, baseUrl), post({ code }));
  if (first.status !== 429) return first;
  await new Promise((resolve) => setTimeout(resolve, 65_000));
  return fetch(new URL(recoverPath, baseUrl), post({ code }));
}

const sqlList = (values) => values.map((value) => `'${value}'`).join(",");

async function eventCount(whereSql) {
  const [row] = await d1(`SELECT COUNT(*) AS n FROM diagnostic_event WHERE ${whereSql};`);
  return row?.n;
}

/**
 * ARNÉS DE VERIFICACIÓN, no una segunda implementación. El cuerpo de la consulta es copia literal de
 * `diagnosticAnalytics.dropoffByQuestion` en `db/queries/diagnostic-analytics-metrics.server.ts`, en su
 * versión vigente con orden por `id` autoincremental (`MAX(id) AS last_shown_id`/`last_invalidated_id`,
 * comparados con `i.last_invalidated_id < s.last_shown_id`, fix de revisión e3a3a24 que resuelve los
 * empates de `received_at` dentro de un mismo batch). Diferencias deliberadas, y solo estas: `now` y
 * `thresholdMs` van como literales (en el `.server.ts` son parámetros enlazados de Drizzle), y el SELECT
 * exterior lleva un `WHERE` que lo limita a la pregunta y a las sesiones de este fixture (la D1 local
 * puede tener eventos de otras pruebas). La función real no es alcanzable por HTTP (spec §52), por eso
 * se verifica así. Si la consulta real cambia, esta copia debe cambiar con ella.
 */
function dropoffSql(questionId, sessionIds, nowMs, thresholdMs = ANALYTICS_ABANDONMENT_THRESHOLD_MS) {
  return `
    WITH shown AS (
      SELECT session_id, question_id, MAX(id) AS last_shown_id
      FROM diagnostic_event WHERE event_type = 'QUESTION_SHOWN' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    invalidated AS (
      SELECT session_id, question_id, MAX(id) AS last_invalidated_id
      FROM diagnostic_event WHERE event_type = 'QUESTION_INVALIDATED' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    answered AS (
      SELECT DISTINCT session_id, question_id
      FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    ),
    valid AS (
      SELECT s.session_id, s.question_id
      FROM shown s
      LEFT JOIN invalidated i ON i.session_id = s.session_id AND i.question_id = s.question_id
      WHERE i.last_invalidated_id IS NULL OR i.last_invalidated_id < s.last_shown_id
    )
    SELECT
      v.question_id AS question_id,
      COUNT(*) AS shown_and_valid,
      SUM(CASE
        WHEN a.session_id IS NOT NULL THEN 0
        WHEN ds.status = 'COMPLETED' THEN 0
        WHEN ds.status IN ('STARTED','IN_PROGRESS') AND (${nowMs} - ds.last_activity_at) >= ${thresholdMs} THEN 1
        WHEN ds.status = 'SAVED' AND EXISTS (SELECT 1 FROM diagnostic_saved_snapshot sn WHERE sn.session_id = ds.id AND sn.expires_at < ${nowMs}) THEN 1
        ELSE 0
      END) AS dropped_off
    FROM valid v
    JOIN diagnostic_session ds ON ds.id = v.session_id
    LEFT JOIN answered a ON a.session_id = v.session_id AND a.question_id = v.question_id
    WHERE v.question_id = '${questionId}' AND v.session_id IN (${sqlList(sessionIds)})
    GROUP BY v.question_id;
  `;
}

/** Sin fila = la pregunta no entró al denominador para esas sesiones (0/0), nunca "desconocido". */
async function dropoff(questionId, sessionIds, nowMs) {
  const [row] = await d1(dropoffSql(questionId, sessionIds, nowMs));
  return { shownAndValid: Number(row?.shown_and_valid ?? 0), droppedOff: Number(row?.dropped_off ?? 0) };
}

/** Copia literal de `answerChangeRateByQuestion` (mismo archivo), con el mismo tipo de filtro de fixture. */
async function changeRate(questionId, sessionIds) {
  const [row] = await d1(`
    WITH answered AS (
      SELECT DISTINCT session_id, question_id FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    ),
    changes AS (
      SELECT session_id, question_id, COUNT(*) AS change_count FROM diagnostic_event WHERE event_type = 'ANSWER_CHANGED' AND question_id IS NOT NULL GROUP BY session_id, question_id
    )
    SELECT
      a.question_id AS question_id,
      COUNT(DISTINCT a.session_id) AS sessions_answered,
      COUNT(DISTINCT c.session_id) AS sessions_changed,
      COALESCE(SUM(c.change_count), 0) AS total_change_events
    FROM answered a
    LEFT JOIN changes c ON c.session_id = a.session_id AND c.question_id = a.question_id
    WHERE a.question_id = '${questionId}' AND a.session_id IN (${sqlList(sessionIds)})
    GROUP BY a.question_id;
  `);
  return { sessionsAnswered: Number(row?.sessions_answered ?? 0), sessionsChanged: Number(row?.sessions_changed ?? 0), totalChangeEvents: Number(row?.total_change_events ?? 0) };
}

/** Copia literal de `rateByAnswerKind` (base de `unknownRateByQuestion`/`naRateByQuestion`), filtrada al fixture. */
async function answerKindRate(kind, questionId, sessionIds) {
  const [row] = await d1(`
    SELECT
      question_id,
      COUNT(*) AS interactions,
      SUM(CASE WHEN answer_kind = '${kind}' THEN 1 ELSE 0 END) AS matching
    FROM diagnostic_event
    WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
      AND question_id = '${questionId}' AND session_id IN (${sqlList(sessionIds)})
    GROUP BY question_id;
  `);
  return { interactions: Number(row?.interactions ?? 0), matching: Number(row?.matching ?? 0) };
}

/**
 * Equivalente SQL de las ramas de `diagnosticAnalytics.lifecycle` (allí construidas con el query builder
 * de Drizzle): abandonada ⟺ STARTED/IN_PROGRESS con `last_activity_at <= now - umbral` (inclusivo, igual
 * que `isAnalyticallyAbandoned`); activa ⟺ `last_activity_at > now - umbral`; `expired_saved` ⟺ SAVED con
 * snapshot cuyo `expires_at < now`.
 */
async function lifecycleCounts(sessionIds, nowMs) {
  const cutoff = nowMs - ANALYTICS_ABANDONMENT_THRESHOLD_MS;
  const ids = sqlList(sessionIds);
  const [row] = await d1(`
    SELECT
      (SELECT count(*) FROM diagnostic_session WHERE status in ('STARTED','IN_PROGRESS') AND last_activity_at > ${cutoff} AND id IN (${ids})) AS active_incomplete,
      (SELECT count(*) FROM diagnostic_session WHERE status in ('STARTED','IN_PROGRESS') AND last_activity_at <= ${cutoff} AND id IN (${ids})) AS analytically_abandoned,
      (SELECT count(*) FROM diagnostic_session INNER JOIN diagnostic_saved_snapshot ON diagnostic_saved_snapshot.session_id = diagnostic_session.id
        WHERE diagnostic_session.status = 'SAVED' AND diagnostic_saved_snapshot.expires_at < ${nowMs} AND diagnostic_session.id IN (${ids})) AS expired_saved;
  `);
  return { activeIncomplete: Number(row?.active_incomplete), analyticallyAbandoned: Number(row?.analytically_abandoned), expiredSaved: Number(row?.expired_saved) };
}

try {
  // --- 1. Autenticación y validación del endpoint (spec §26/§27/§64 → mutación H) -----------------
  const created = await createSession();

  const withoutToken = await fetch(new URL(eventsPath, baseUrl), post({ sessionId: created.sessionId, analyticsSchemaVersion: 1, events: [shownEvent()] }));
  check(withoutToken.status === 400, "sessionId sin writeToken → 400 (sessionId solo nunca autoriza, spec §26)");

  const unknownSession = await analyticsBatch(crypto.randomUUID(), created.writeToken, [shownEvent()]);
  check(unknownSession.status === 404, "sessionId inexistente → 404");

  const wrongTokenEvent = shownEvent();
  const wrongToken = await analyticsBatch(created.sessionId, "not-the-real-token", [wrongTokenEvent]);
  check(wrongToken.status === 403, "writeToken incorrecto → 403");
  check(wrongToken.headers.get("cache-control") === "no-store", "la respuesta 403 de /events también lleva Cache-Control: no-store");

  const unknownQuestionEvent = shownEvent("totally_fake_question", { sectionId: "contexto" });
  const unknownQuestion = await analyticsBatch(created.sessionId, created.writeToken, [unknownQuestionEvent]);
  check(unknownQuestion.status === 400, "mutación H: QuestionId inexistente → 400");
  check(unknownQuestion.headers.get("cache-control") === "no-store", "la respuesta 400 de /events también lleva Cache-Control: no-store");

  const mixedValidEvent = shownEvent("profile");
  const mixedInvalidEvent = analyticsEvent("NOT_A_REAL_EVENT", "goal");
  const mixed = await analyticsBatch(created.sessionId, created.writeToken, [mixedValidEvent, mixedInvalidEvent]);
  check(mixed.status === 400, "batch con un evento válido y otro de eventType desconocido → 400 (deny-by-default, spec §27)");

  const futureSchemaEvent = shownEvent();
  const futureSchema = await analyticsBatch(created.sessionId, created.writeToken, [futureSchemaEvent], { analyticsSchemaVersion: 2 });
  check(futureSchema.status === 400, "analyticsSchemaVersion distinta de 1 → 400 (spec §7)");

  const rejectedUuids = [wrongTokenEvent, unknownQuestionEvent, mixedValidEvent, mixedInvalidEvent, futureSchemaEvent].map((event) => event.eventUuid);
  check((await eventCount(`event_uuid IN (${sqlList(rejectedUuids)})`)) === 0, "mutación H: ningún evento de un batch rechazado (403/400) llega a D1, ni siquiera el válido del batch mixto");

  const validEvent = shownEvent("profile");
  const validBatch = await analyticsBatch(created.sessionId, created.writeToken, [validEvent]);
  check(validBatch.status === 200, "batch válido con token correcto → 200");
  check(validBatch.headers.get("cache-control") === "no-store", "la respuesta 200 de /events lleva Cache-Control: no-store");
  const validBody = await jsonOf(validBatch);
  check(validBody?.accepted === 1 && validBody?.dropped === 0, "un evento válido → accepted:1, dropped:0");

  const [storedValid] = await d1(`SELECT * FROM diagnostic_event WHERE event_uuid = '${validEvent.eventUuid}';`);
  check(
    storedValid?.session_id === created.sessionId && storedValid?.event_type === "QUESTION_SHOWN" && storedValid?.question_id === "profile" && storedValid?.section_id === "contexto" && storedValid?.questions_seen === 1 && storedValid?.questions_answered === 0 && storedValid?.applicable_questions === 3,
    "D1 guarda el evento con exactamente los campos enviados (sesión, tipo, pregunta, sección, contadores)",
  );
  check(storedValid?.analytics_schema_version === 1, "D1 estampa analytics_schema_version = 1 en el servidor (spec §7)");
  check(typeof storedValid?.received_at === "number" && storedValid.retention_until - storedValid.received_at === ANALYTICS_EVENT_RETENTION_MS, "retention_until = received_at + 180 días exactos (spec §49)");

  // --- 2. Mutación A: idempotencia por event_uuid (spec §9/§59/§60) --------------------------------
  const duplicateEvent = shownEvent("goal");
  const firstSend = await analyticsBatch(created.sessionId, created.writeToken, [duplicateEvent]);
  check((await jsonOf(firstSend))?.accepted === 1, "primer envío del evento → accepted:1");
  const retrySend = await analyticsBatch(created.sessionId, created.writeToken, [duplicateEvent]);
  check(retrySend.status === 200, "reenvío del mismo event_uuid → 200 (nunca error)");
  check((await jsonOf(retrySend))?.accepted === 0, "mutación A: reenvío del mismo event_uuid → accepted:0");
  check((await eventCount(`event_uuid = '${duplicateEvent.eventUuid}'`)) === 1, "mutación A: exactamente una fila en D1 para ese event_uuid tras el reenvío");

  // Doble flush: el cliente reenvía un batch entero ya persistido, más un evento nuevo.
  const flushedBatch = [shownEvent("stage"), submittedEvent("stage"), shownEvent("team")];
  await seed(created, flushedBatch);
  const freshEvent = submittedEvent("team");
  const doubleFlush = await analyticsBatch(created.sessionId, created.writeToken, [...flushedBatch, freshEvent]);
  const doubleFlushBody = await jsonOf(doubleFlush);
  check(doubleFlush.status === 200 && doubleFlushBody?.accepted === 1, "reenvío de un batch completo + 1 evento nuevo → accepted:1 (solo el nuevo)");
  check((await eventCount(`event_uuid IN (${sqlList([...flushedBatch, freshEvent].map((event) => event.eventUuid))})`)) === 4, "tras el doble flush hay exactamente 4 filas para esos 4 event_uuid, ninguna duplicada");

  // --- 3. Mutación B: intentar colar un valor de respuesta crudo (spec §12/§32) --------------------
  const rawAnswerEvent = { ...shownEvent("goal"), answerValue: "be_found" };
  const rawAnswerAttempt = await analyticsBatch(created.sessionId, created.writeToken, [rawAnswerEvent]);
  check(rawAnswerAttempt.status === 400, "mutación B: un evento con campo answerValue → 400 (campo desconocido)");
  check((await eventCount(`event_uuid = '${rawAnswerEvent.eventUuid}'`)) === 0, "mutación B: el evento con answerValue nunca se inserta");
  const eventColumns = (await d1(`SELECT name FROM pragma_table_info('diagnostic_event') ORDER BY cid;`)).map((row) => row.name);
  const expectedEventColumns = ["id", "event_uuid", "session_id", "analytics_schema_version", "event_type", "question_id", "section_id", "answer_kind", "route_signature", "questions_seen", "questions_answered", "applicable_questions", "received_at", "retention_until"];
  check(JSON.stringify(eventColumns) === JSON.stringify(expectedEventColumns), "mutación B: diagnostic_event tiene exactamente sus 14 columnas; ninguna para valor de respuesta, token ni texto libre");

  // --- 4. Mutación C: intentar colar el writeToken dentro de un evento (spec §31) ------------------
  const tokenEvent = { ...shownEvent("goal"), writeToken: created.writeToken };
  const tokenAttempt = await analyticsBatch(created.sessionId, created.writeToken, [tokenEvent]);
  check(tokenAttempt.status === 400, "mutación C: writeToken como campo de evento → 400 (campo desconocido)");
  check((await eventCount(`event_uuid = '${tokenEvent.eventUuid}'`)) === 0, "mutación C: el evento con writeToken nunca se inserta");
  const createdRows = await d1(`SELECT * FROM diagnostic_event WHERE session_id = '${created.sessionId}';`);
  const [createdSessionRow] = await d1(`SELECT token_hash FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  harness(createdRows.length === 6 && typeof createdSessionRow?.token_hash === "string", `se esperaban 6 eventos persistidos de la sesión base, hay ${createdRows.length}`);
  const credentialLeaked = createdRows.some((row) => Object.values(row).some((value) => typeof value === "string" && (value.includes(created.writeToken) || value.includes(createdSessionRow.token_hash))));
  check(!credentialLeaked, "mutación C: ni el writeToken ni su hash aparecen en ninguna columna de las 6 filas de diagnostic_event de la sesión");

  // La analítica vive solo en D1 (spec §66, sin binding nuevo): nunca reescribe el snapshot de KV.
  const kvSession = await createSession();
  const kvPatch = await fetch(new URL(sessionPath(kvSession.sessionId), baseUrl), { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ writeToken: kvSession.writeToken, answers: { profile: "business" }, currentQuestionId: null, questionsSeen: 1, questionsAnswered: 1 }) });
  harness(kvPatch.status === 200, `PATCH de snapshot devolvió ${kvPatch.status}`);
  kvWrittenSessionIds.push(kvSession.sessionId);
  const kvBefore = await kvGetLocal(`diagnostic:session:${kvSession.sessionId}`);
  harness(kvBefore !== null && kvBefore.includes(kvSession.sessionId), "control: el PATCH debía dejar un snapshot legible en KV local");
  await seed(kvSession, [shownEvent("goal"), submittedEvent("goal"), changedEvent("goal")]);
  const kvAfter = await kvGetLocal(`diagnostic:session:${kvSession.sessionId}`);
  check(kvAfter === kvBefore, "un batch de analítica deja el snapshot de KV byte a byte idéntico (la telemetría nunca escribe KV)");

  // --- 5. Cupo de batch (spec §28) + 6. cupo por sesión (spec §29/§65): se descarta, nunca rompe ---
  const capSession = await createSession();
  const oversizedEvents = manyShown(MAX_ANALYTICS_EVENTS_PER_BATCH + 1);
  const oversized = await analyticsBatch(capSession.sessionId, capSession.writeToken, oversizedEvents);
  check(oversized.status === 400, "batch de 26 eventos (> MAX_ANALYTICS_EVENTS_PER_BATCH=25) → 400");
  check((await eventCount(`session_id = '${capSession.sessionId}'`)) === 0, "el batch de 26 se rechaza entero: 0 filas insertadas");

  const exactBatch = await analyticsBatch(capSession.sessionId, capSession.writeToken, manyShown(MAX_ANALYTICS_EVENTS_PER_BATCH));
  const exactBatchBody = await jsonOf(exactBatch);
  check(exactBatch.status === 200 && exactBatchBody?.accepted === 25, "batch de exactamente 25 eventos (el máximo) → 200, accepted:25");
  for (let batchIndex = 1; batchIndex < 19; batchIndex += 1) await seed(capSession, manyShown(25)); // 475
  await seed(capSession, manyShown(20)); // 495
  const partial = await analyticsBatch(capSession.sessionId, capSession.writeToken, manyShown(10));
  const partialBody = await jsonOf(partial);
  check(partial.status === 200 && partialBody?.accepted === 5 && partialBody?.dropped === 5, "con 495 eventos guardados, un batch de 10 → 200, accepted:5, dropped:5 (se llena hasta 500 exactos)");
  const overCap = await analyticsBatch(capSession.sessionId, capSession.writeToken, manyShown(1));
  const overCapBody = await jsonOf(overCap);
  check(overCap.status === 200 && overCapBody?.accepted === 0 && overCapBody?.dropped === 1, "con el cupo lleno, otro batch → 200, accepted:0, dropped:1 (descarta sin romper)");
  check((await eventCount(`session_id = '${capSession.sessionId}'`)) === MAX_ANALYTICS_EVENTS_PER_SESSION, "la sesión queda con exactamente 500 eventos (MAX_ANALYTICS_EVENTS_PER_SESSION), nunca más");

  // --- 7. Mutación I: el writeToken anterior a RECOVER ya no puede enviar analítica ----------------
  // (requiere DIAGNOSTIC_RECOVERY_HMAC_KEY local configurado, mismo prerequisito que el resto de la suite)
  const forRecovery = await createSession();
  const savedForRecovery = await saveSession(forRecovery.sessionId, forRecovery.writeToken, { profile: "business", stage: "growing" });
  const savedForRecoveryBody = await jsonOf(savedForRecovery);
  harness(savedForRecovery.status === 200 && typeof savedForRecoveryBody?.recoveryCode === "string", `SAVE previo a RECOVER devolvió ${savedForRecovery.status}`);
  const recoverResponse = await recoverOutsideRateLimit(savedForRecoveryBody.recoveryCode);
  harness(recoverResponse.status === 200, `RECOVER devolvió ${recoverResponse.status}`);
  const recovered = await jsonOf(recoverResponse);
  harness(recovered?.sessionId === forRecovery.sessionId && typeof recovered?.writeToken === "string" && recovered.writeToken !== forRecovery.writeToken, "RECOVER debía devolver la misma sesión con un writeToken rotado");
  const staleTokenEvent = shownEvent();
  const oldTokenAnalytics = await analyticsBatch(forRecovery.sessionId, forRecovery.writeToken, [staleTokenEvent]);
  check(oldTokenAnalytics.status === 403, "mutación I: el writeToken anterior a RECOVER no puede enviar analítica → 403");
  check((await eventCount(`event_uuid = '${staleTokenEvent.eventUuid}'`)) === 0, "mutación I: el evento enviado con el token anterior nunca se inserta");
  const newTokenAnalytics = await analyticsBatch(recovered.sessionId, recovered.writeToken, [shownEvent()]);
  check(newTokenAnalytics.status === 200 && (await jsonOf(newTokenAnalytics))?.accepted === 1, "el writeToken nuevo tras RECOVER sí puede enviar analítica (accepted:1)");

  // --- 8. Mutación G: una request por evento. Un batch de N eventos es UNA request con N filas ------
  const batchSession = await createSession();
  const batchEvents = [
    analyticsEvent("SECTION_ENTERED", null, { sectionId: "contexto", questionsSeen: 0 }),
    shownEvent("profile"),
    submittedEvent("profile"),
    shownEvent("goal"),
    analyticsEvent("SAVE_OFFERED", null),
  ];
  const oneRequest = await analyticsBatch(batchSession.sessionId, batchSession.writeToken, batchEvents);
  check(oneRequest.status === 200 && (await jsonOf(oneRequest))?.accepted === 5, "mutación G: UNA request HTTP con 5 eventos → accepted:5 (el batch es la unidad de envío, no el evento)");
  const batchRows = await d1(`SELECT event_uuid FROM diagnostic_event WHERE session_id = '${batchSession.sessionId}' ORDER BY id;`);
  check(JSON.stringify(batchRows.map((row) => row.event_uuid)) === JSON.stringify(batchEvents.map((event) => event.eventUuid)), "las 5 filas existen y su orden por id es el orden del batch (spec §62; base del desempate de dropoff)");

  // --- 9. Mutación J: un fallo de analítica no bloquea completion ----------------------------------
  const resilientSession = await createSession();
  const failedAnalytics = await analyticsBatch(resilientSession.sessionId, "an-invalid-token-that-will-403", [shownEvent()]);
  check(failedAnalytics.status === 403, "control de J: el envío de analítica previo efectivamente falló (403)");
  const completion = await completeSession(resilientSession.sessionId, resilientSession.writeToken, COMPLETION_ANSWERS);
  check(completion.status === 200, "mutación J: completion → 200 aunque un envío de analítica previo haya fallado");
  const [resilientRow] = await d1(`SELECT status FROM diagnostic_session WHERE id = '${resilientSession.sessionId}';`);
  check(resilientRow?.status === "COMPLETED", "mutación J: D1 registra la sesión como COMPLETED");

  // --- 10. Mutación F: mezclar versiones en completion rate (segmentación, spec §37/§38) ------------
  const versionSession = await createSession();
  const versionCompletion = await completeSession(versionSession.sessionId, versionSession.writeToken, COMPLETION_ANSWERS);
  harness(versionCompletion.status === 200, `completar la sesión de versión devolvió ${versionCompletion.status}`);
  const [{ question_bank_version: currentQuestionBankVersion }] = await d1(`SELECT question_bank_version FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  harness(Number.isInteger(currentQuestionBankVersion) && currentQuestionBankVersion !== 999, "question_bank_version vigente inesperado");
  // Simula una sesión completada con un banco de preguntas anterior/futuro conviviendo con las vigentes.
  const versionScope = sqlList([created.sessionId, resilientSession.sessionId, versionSession.sessionId]);
  const [mixedVersions, segmented] = await d1(`
    UPDATE diagnostic_session SET question_bank_version = 999 WHERE id = '${versionSession.sessionId}';
    SELECT count(*) AS starts, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completions FROM diagnostic_session WHERE id IN (${versionScope});
    SELECT count(*) AS starts, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completions FROM diagnostic_session WHERE id IN (${versionScope}) AND question_bank_version = ${currentQuestionBankVersion};
  `);
  check(mixedVersions?.starts === 3 && mixedVersions?.completions === 2, "control F: sin segmentar, las 3 sesiones mezclan versiones (2 completadas de 3)");
  check(segmented?.starts === 2 && segmented?.completions === 1, "mutación F: segmentado por question_bank_version vigente (filtro de versionWhere), la sesión de versión 999 queda fuera: 1 de 2");

  // --- 11. Purga de eventos expirados (spec §49/§50) -------------------------------------------------
  const purgeSession = await createSession();
  const [expiredEvent, boundaryEvent, liveEvent] = [shownEvent("profile"), shownEvent("goal"), shownEvent("stage")];
  await seed(purgeSession, [expiredEvent, boundaryEvent, liveEvent]);
  const purgeNow = Date.now();
  await d1(`
    UPDATE diagnostic_event SET retention_until = ${purgeNow - 1000} WHERE event_uuid = '${expiredEvent.eventUuid}';
    UPDATE diagnostic_event SET retention_until = ${purgeNow} WHERE event_uuid = '${boundaryEvent.eventUuid}';
  `);
  check((await eventCount(`session_id = '${purgeSession.sessionId}' AND retention_until < ${purgeNow}`)) === 1, "precondición de purga: exactamente un evento con retention_until vencido");
  // `purgeExpiredAnalyticsEvents` no tiene endpoint (spec §52, sin scheduler): se ejecuta su predicado
  // (`lt(retention_until, now)`) limitado a la sesión de este fixture, nunca sobre toda la tabla.
  await d1(`DELETE FROM diagnostic_event WHERE retention_until < ${purgeNow} AND session_id = '${purgeSession.sessionId}';`);
  const remainingAfterPurge = (await d1(`SELECT event_uuid FROM diagnostic_event WHERE session_id = '${purgeSession.sessionId}' ORDER BY id;`)).map((row) => row.event_uuid);
  check(JSON.stringify(remainingAfterPurge) === JSON.stringify([boundaryEvent.eventUuid, liveEvent.eventUuid]), "purga (predicado retention_until < now): borra solo el vencido; el que vence justo en now y el vigente de 180 días se conservan");

  // --- 12. Fixture dataset para dropoff (spec §17/§54, matriz A-F) y abandono (§18-§20/§58) -------
  // Todas las sesiones se siembran por HTTP; los tiempos se fijan después, en un solo paso, contra un
  // `now` fijo que también se pasa literal a la consulta: el resultado no depende de cuánto tarde el script.
  const caseA = await createSession(); // Q mostrada → respondida → abandona. NO dropoff en Q.
  await seed(caseA, [shownEvent("goal"), submittedEvent("goal", "answered")]);
  const caseB = await createSession(); // Q mostrada → NO respondida → abandona. SÍ dropoff en Q.
  await seed(caseB, [shownEvent("goal")]);
  const caseC = await createSession(); // Q mostrada → routing la invalida → abandona. NO dropoff en Q.
  await seed(caseC, [shownEvent("team"), shownEvent("stage")]); // 'stage' queda como control válido y sin responder
  await seed(caseC, [invalidatedEvent("team")]);
  const tieInvalidatedLast = await createSession(); // mismo batch: mostrada → invalidada. NO dropoff.
  await seed(tieInvalidatedLast, [shownEvent("team"), invalidatedEvent("team")]);
  const tieReshown = await createSession(); // mostrada; luego, en UN batch: invalidada → mostrada otra vez. SÍ dropoff.
  const reshownPair = [invalidatedEvent("team"), shownEvent("team")];
  await seed(tieReshown, [shownEvent("team")]);
  await seed(tieReshown, reshownPair);
  const caseSavedLive = await createSession(); // SAVED con snapshot vigente, inactiva 2 h. NO dropoff (mutación E).
  await seed(caseSavedLive, [shownEvent("goal")]);
  const caseSavedExpired = await createSession(); // SAVED con snapshot vencido. SÍ dropoff (expired_saved).
  await seed(caseSavedExpired, [shownEvent("goal")]);
  const caseActive = await createSession(); // sin responder pero activa hace 1 min. NO dropoff (aún no terminó).
  await seed(caseActive, [shownEvent("goal")]);
  const caseCompleted = await createSession(); // sin ANSWER_SUBMITTED de Q, pero COMPLETED. NO dropoff.
  await seed(caseCompleted, [shownEvent("goal")]);
  const caseUnknown = await createSession(); // respondió "No sé" y abandona. NO dropoff (unknown ≠ dropoff).
  await seed(caseUnknown, [shownEvent("goal"), submittedEvent("goal", "unknown")]);
  const caseNotApplicable = await createSession(); // respondió "No aplica" y abandona. NO dropoff.
  await seed(caseNotApplicable, [shownEvent("goal"), submittedEvent("goal", "not_applicable")]);
  const boundaryExact = await createSession(); // inactiva exactamente el umbral (60 min). SÍ (boundary inclusivo).
  await seed(boundaryExact, [shownEvent("goal")]);
  const boundaryInside = await createSession(); // inactiva umbral − 1 ms. NO.
  await seed(boundaryInside, [shownEvent("goal")]);

  const firstSave = await saveSession(caseSavedLive.sessionId, caseSavedLive.writeToken, { profile: "business", stage: "growing" });
  const retrySave = await saveSession(caseSavedLive.sessionId, caseSavedLive.writeToken, { profile: "business", stage: "growing" });
  harness(firstSave.status === 200 && retrySave.status === 200 && (await jsonOf(retrySave))?.status === "already_saved", "los dos SAVE de la sesión SAVED vigente debían ser saved + already_saved");
  const expiredSave = await saveSession(caseSavedExpired.sessionId, caseSavedExpired.writeToken, { profile: "business", stage: "growing" });
  harness(expiredSave.status === 200, `SAVE de la sesión que expirará devolvió ${expiredSave.status}`);
  const completedCase = await completeSession(caseCompleted.sessionId, caseCompleted.writeToken, COMPLETION_ANSWERS);
  harness(completedCase.status === 200, `completar la sesión del caso COMPLETED devolvió ${completedCase.status}`);

  const nowMs = Date.now();
  const twoHoursAgo = nowMs - 2 * ANALYTICS_ABANDONMENT_THRESHOLD_MS;
  const inactiveIds = [caseA, caseB, caseC, tieInvalidatedLast, tieReshown, caseSavedLive, caseSavedExpired, caseCompleted, caseUnknown, caseNotApplicable].map((session) => session.sessionId);
  await d1(`
    UPDATE diagnostic_session SET last_activity_at = ${twoHoursAgo} WHERE id IN (${sqlList(inactiveIds)});
    UPDATE diagnostic_session SET last_activity_at = ${nowMs - 60_000} WHERE id = '${caseActive.sessionId}';
    UPDATE diagnostic_session SET last_activity_at = ${nowMs - ANALYTICS_ABANDONMENT_THRESHOLD_MS} WHERE id = '${boundaryExact.sessionId}';
    UPDATE diagnostic_session SET last_activity_at = ${nowMs - ANALYTICS_ABANDONMENT_THRESHOLD_MS + 1} WHERE id = '${boundaryInside.sessionId}';
    UPDATE diagnostic_saved_snapshot SET expires_at = ${nowMs - 1000} WHERE session_id = '${caseSavedExpired.sessionId}';
  `);

  // Precondición: cada fixture está en el status que su caso declara (si no, el caso no prueba nada).
  const dropoffFixtureSessions = [caseA, caseB, caseC, tieInvalidatedLast, tieReshown, caseSavedLive, caseSavedExpired, caseActive, caseCompleted, caseUnknown, caseNotApplicable, boundaryExact, boundaryInside];
  const statusRows = await d1(`SELECT id, status FROM diagnostic_session WHERE id IN (${sqlList(dropoffFixtureSessions.map((session) => session.sessionId))});`);
  const statusOf = new Map(statusRows.map((row) => [row.id, row.status]));
  const expectedStatus = (session) => (session === caseSavedLive || session === caseSavedExpired ? "SAVED" : session === caseCompleted ? "COMPLETED" : "STARTED");
  for (const session of dropoffFixtureSessions) harness(statusOf.get(session.sessionId) === expectedStatus(session), `fixture ${session.sessionId} en status ${statusOf.get(session.sessionId)}, se esperaba ${expectedStatus(session)}`);

  // Caso A / B y su agregado (el ejemplo del spec §54).
  const dropoffA = await dropoff("goal", [caseA.sessionId], nowMs);
  check(dropoffA.shownAndValid === 1 && dropoffA.droppedOff === 0, "caso A: Q mostrada y respondida, sesión abandonada después → denominador 1, NO dropoff");
  const dropoffB = await dropoff("goal", [caseB.sessionId], nowMs);
  check(dropoffB.shownAndValid === 1 && dropoffB.droppedOff === 1, "caso B: Q mostrada y NO respondida, sesión abandonada → SÍ dropoff");
  const dropoffAB = await dropoff("goal", [caseA.sessionId, caseB.sessionId], nowMs);
  check(dropoffAB.shownAndValid === 2 && dropoffAB.droppedOff === 1, "agregado A+B: dropoff('goal') = 1/2 (la respondida no cuenta en el numerador)");

  // Caso C (mutación D): la invalidada por routing nunca es dropoff; el control prueba que la sesión SÍ
  // está clasificada como abandonada, así que el 0 se debe a la invalidación y no a otra cosa.
  const dropoffC = await dropoff("team", [caseC.sessionId], nowMs);
  check(dropoffC.shownAndValid === 0 && dropoffC.droppedOff === 0, "caso C / mutación D: Q invalidada por routing tras mostrarse → fuera del denominador, nunca dropoff");
  const dropoffCControl = await dropoff("stage", [caseC.sessionId], nowMs);
  check(dropoffCControl.shownAndValid === 1 && dropoffCControl.droppedOff === 1, "control de C: otra Q válida y sin responder de la MISMA sesión sí cuenta como dropoff");

  // Empates dentro de un mismo batch: todos los eventos de un batch comparten `received_at`; solo el
  // orden por `id` distingue "invalidada después de mostrarse" de "mostrada otra vez tras invalidarse".
  const [reshownTimestamps] = await d1(`SELECT COUNT(*) AS total, COUNT(DISTINCT received_at) AS distinct_received_at FROM diagnostic_event WHERE event_uuid IN (${sqlList(reshownPair.map((event) => event.eventUuid))});`);
  check(reshownTimestamps?.total === 2 && reshownTimestamps?.distinct_received_at === 1, "control de empate: la invalidación y la nueva muestra del mismo batch comparten received_at (el empate es real)");
  const dropoffTieInvalidated = await dropoff("team", [tieInvalidatedLast.sessionId], nowMs);
  check(dropoffTieInvalidated.shownAndValid === 0 && dropoffTieInvalidated.droppedOff === 0, "mismo batch mostrada → invalidada: fuera del denominador (orden por id)");
  const dropoffTieReshown = await dropoff("team", [tieReshown.sessionId], nowMs);
  check(dropoffTieReshown.shownAndValid === 1 && dropoffTieReshown.droppedOff === 1, "mismo batch invalidada → mostrada otra vez: vuelve a ser válida y SÍ es dropoff (con received_at empatado solo id lo resuelve)");

  // Casos D/E/F y COMPLETED: el numerador solo cuenta sesiones terminadas "definitivamente".
  const dropoffSavedLive = await dropoff("goal", [caseSavedLive.sessionId], nowMs);
  check(dropoffSavedLive.shownAndValid === 1 && dropoffSavedLive.droppedOff === 0, "caso D / mutación E: SAVED con snapshot vigente, inactiva 2 h → NO dropoff");
  const dropoffSavedExpired = await dropoff("goal", [caseSavedExpired.sessionId], nowMs);
  check(dropoffSavedExpired.shownAndValid === 1 && dropoffSavedExpired.droppedOff === 1, "caso E: SAVED con snapshot vencido → SÍ dropoff (expired_saved)");
  const dropoffActive = await dropoff("goal", [caseActive.sessionId], nowMs);
  check(dropoffActive.shownAndValid === 1 && dropoffActive.droppedOff === 0, "caso F: sin responder pero activa dentro del umbral → NO dropoff todavía");
  const dropoffCompleted = await dropoff("goal", [caseCompleted.sessionId], nowMs);
  check(dropoffCompleted.shownAndValid === 1 && dropoffCompleted.droppedOff === 0, "sesión COMPLETED sin ANSWER_SUBMITTED de Q, inactiva 2 h → NO dropoff");
  const dropoffUnknownNa = await dropoff("goal", [caseUnknown.sessionId, caseNotApplicable.sessionId], nowMs);
  check(dropoffUnknownNa.shownAndValid === 2 && dropoffUnknownNa.droppedOff === 0, "'No sé' y 'No aplica' son respuestas: sesiones abandonadas después → NO dropoff");

  // Boundary del umbral de abandono (spec §58), inclusivo como `isAnalyticallyAbandoned`.
  const dropoffBoundaryExact = await dropoff("goal", [boundaryExact.sessionId], nowMs);
  check(dropoffBoundaryExact.shownAndValid === 1 && dropoffBoundaryExact.droppedOff === 1, "boundary: inactiva exactamente 60 min → abandonada → SÍ dropoff");
  const dropoffBoundaryInside = await dropoff("goal", [boundaryInside.sessionId], nowMs);
  check(dropoffBoundaryInside.shownAndValid === 1 && dropoffBoundaryInside.droppedOff === 0, "boundary: inactiva 60 min − 1 ms → activa → NO dropoff");

  const goalMatrix = [caseA, caseB, caseSavedLive, caseSavedExpired, caseActive, caseCompleted, caseUnknown, caseNotApplicable, boundaryExact, boundaryInside].map((session) => session.sessionId);
  const dropoffGoalMatrix = await dropoff("goal", goalMatrix, nowMs);
  check(dropoffGoalMatrix.shownAndValid === 10 && dropoffGoalMatrix.droppedOff === 3, "matriz completa de 'goal': 3 dropoffs de 10 (B, SAVED vencido, boundary exacto)");

  // Clasificación de ciclo de vida (lifecycle) sobre los mismos fixtures.
  const savedLifecycle = await lifecycleCounts([caseSavedLive.sessionId, caseSavedExpired.sessionId], nowMs);
  check(savedLifecycle.analyticallyAbandoned === 0, "mutación E: una sesión SAVED (vigente o vencida) nunca cuenta como abandonada por inactividad");
  check(savedLifecycle.expiredSaved === 1, "solo la SAVED con snapshot vencido cae en expired_saved, nunca la vigente");
  const boundaryLifecycle = await lifecycleCounts([boundaryExact.sessionId, boundaryInside.sessionId], nowMs);
  check(boundaryLifecycle.analyticallyAbandoned === 1 && boundaryLifecycle.activeIncomplete === 1, "lifecycle en el boundary: exacto → abandonada, umbral − 1 ms → activa (partición sin hueco ni solape)");

  // --- 13. Save/resume counters (spec §5/§33-§35) -----------------------------------------------------
  const [freshCounters] = await d1(`SELECT save_count, resume_count, last_saved_at, last_resumed_at FROM diagnostic_session WHERE id = '${created.sessionId}';`);
  check(freshCounters?.save_count === 0 && freshCounters?.resume_count === 0 && freshCounters?.last_saved_at === null && freshCounters?.last_resumed_at === null, "control: una sesión sin SAVE/RECOVER tiene save_count 0, resume_count 0 y fechas NULL");
  const [recoveryCounters] = await d1(`SELECT save_count, resume_count, last_saved_at, last_resumed_at FROM diagnostic_session WHERE id = '${forRecovery.sessionId}';`);
  check(recoveryCounters?.save_count === 1 && typeof recoveryCounters?.last_saved_at === "number", "un SAVE aceptado → save_count 1 y last_saved_at registrado");
  check(recoveryCounters?.resume_count === 1 && typeof recoveryCounters?.last_resumed_at === "number" && recoveryCounters.last_resumed_at >= recoveryCounters.last_saved_at, "un RECOVER exitoso → resume_count 1 y last_resumed_at registrado (no anterior al save)");
  const [retryCounters] = await d1(`SELECT save_count, resume_count FROM diagnostic_session WHERE id = '${caseSavedLive.sessionId}';`);
  check(retryCounters?.save_count === 2 && retryCounters?.resume_count === 0, "un SAVE + su retry idempotente (already_saved) → save_count 2, resume_count 0 (cada llamada SAVE aceptada cuenta)");

  // --- 14. Change rate (spec §14/§55) ----------------------------------------------------------------
  // Respuesta A → cambio B → cambio C: 1 sesión modificadora, 2 change events (métricas separadas).
  const changeSession = await createSession();
  const changeBatch = [shownEvent("goal"), submittedEvent("goal"), changedEvent("goal"), changedEvent("goal")];
  await seed(changeSession, changeBatch);
  const goalChange = await changeRate("goal", [changeSession.sessionId, caseA.sessionId]);
  check(goalChange.sessionsAnswered === 2 && goalChange.sessionsChanged === 1, "spec §55: de 2 sesiones que respondieron 'goal', 1 la modificó (session change rate = 0.5)");
  check(goalChange.totalChangeEvents === 2, "spec §55: esa sesión produce 2 'total change events', contados aparte de la session change rate");
  const changeRetry = await analyticsBatch(changeSession.sessionId, changeSession.writeToken, changeBatch);
  check(changeRetry.status === 200 && (await jsonOf(changeRetry))?.accepted === 0, "reenvío del batch de cambios → accepted:0");
  const goalChangeAfterRetry = await changeRate("goal", [changeSession.sessionId, caseA.sessionId]);
  check(goalChangeAfterRetry.totalChangeEvents === 2 && goalChangeAfterRetry.sessionsChanged === 1, "mutación A sobre métricas: el reenvío no infla total change events ni session change rate");

  // Multi-select real ('assets', type "multi"), simulando el cliente de Task 13: construir la PRIMERA
  // respuesta con varios clics emite un solo ANSWER_SUBMITTED y ningún CHANGED; volver a la pregunta y
  // modificarla sí emite CHANGED por cada toggle.
  const multiFirstVisit = await createSession();
  await seed(multiFirstVisit, [shownEvent("assets"), submittedEvent("assets")]);
  const multiRevisit = await createSession();
  await seed(multiRevisit, [shownEvent("assets"), submittedEvent("assets"), shownEvent("goal"), shownEvent("assets"), changedEvent("assets"), changedEvent("assets")]);
  const assetsChange = await changeRate("assets", [multiFirstVisit.sessionId, multiRevisit.sessionId]);
  check(assetsChange.sessionsAnswered === 2 && assetsChange.sessionsChanged === 1 && assetsChange.totalChangeEvents === 2, "multi-select 'assets': primera construcción no cuenta como cambio; la revisita con 2 toggles → 1 de 2 sesiones, 2 change events");

  // --- 15. Unknown / N/A rate (spec §13/§15/§56/§57) -------------------------------------------------
  const rateScope = [caseA.sessionId, caseUnknown.sessionId, caseNotApplicable.sessionId];
  const unknownRate = await answerKindRate("unknown", "goal", rateScope);
  check(unknownRate.interactions === 3 && unknownRate.matching === 1, "unknown rate('goal'): 'No sé' suma 1 de 3 interacciones (answered y N/A no cuentan como unknown)");
  const notApplicableRate = await answerKindRate("not_applicable", "goal", rateScope);
  check(notApplicableRate.interactions === 3 && notApplicableRate.matching === 1, "N/A rate('goal'): 'No aplica' suma 1 de 3 interacciones (answered y unknown no cuentan como N/A)");
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  try {
    if (createdSessionIds.length) {
      const idList = sqlList(createdSessionIds);
      executeD1(`
        DELETE FROM diagnostic_event WHERE session_id IN (${idList});
        DELETE FROM diagnostic_answer WHERE session_id IN (${idList});
        DELETE FROM diagnostic_result WHERE session_id IN (${idList});
        DELETE FROM diagnostic_saved_snapshot WHERE session_id IN (${idList});
        DELETE FROM diagnostic_session WHERE id IN (${idList});
      `);
      // Solo la sesión del control de KV hace PATCH (única ruta que escribe KV); el resto nunca lo toca.
      for (const id of kvWrittenSessionIds) {
        spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler kv key delete --binding=DIAGNOSTIC_SNAPSHOTS --local diagnostic:session:${id}`], { cwd: process.cwd(), encoding: "utf8" });
      }
    }
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de Analytics): ${harnessFailure.message}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de Analytics fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: DIAG-V3-08 ${results.length} comprobaciones de endpoint de eventos, idempotencia, cupos, mutaciones A-J, dropoff/abandono, change/unknown/N-A rate y contadores de save/resume.`);
