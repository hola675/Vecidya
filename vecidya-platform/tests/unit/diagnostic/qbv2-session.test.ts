import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  buildQuestionPlan, canGoBackV3, completeSessionV3, createSessionV3, currentQuestionIdV3, deriveConstraintsAndPriorities, deriveSemanticFacts, DIAGNOSTIC_SESSION_V3_STORAGE_KEY,
  DIAGNOSTIC_SESSION_V3_TTL_MS, DiagnosticSessionStoreV3, GOLDEN_PERSONAS, goBackV3, parseSessionV3, presentQuestionV3, progressV3, QUESTION_BANK_V2, renderQuestionV2,
  resolveEligibleQuestionsV2, ROUTE_HARD_CAP, runDiagnosticPipelineV3, runGoldenPersonaPipeline, scoreContextualDimensions, serializeSessionV3, sessionProfileV3, submitAnswerV3, TERMINOLOGY,
  toggleMultiValueV3, validateAnswerV3, type AnswersV2, type DiagnosticSessionV3, type StorageLike,
} from "../../../app/features/diagnostic/index.ts";

/** DIAG-V3-10B — sesión del diagnóstico adaptativo: consume el motor congelado sin reglas propias. */

const bank = QUESTION_BANK_V2;
const byId = new Map(bank.map((question) => [question.id, question]));
const question = (id: string) => byId.get(id)!;
type Policy = "first" | "middle" | "last";
const pick = (id: string, policy: Policy) => {
  const definition = question(id);
  const options = definition.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable" && !option.exclusive);
  const option = (policy === "first" ? options[0] : policy === "last" ? options.at(-1) : options[Math.floor((options.length - 1) / 2)]) ?? definition.options[0]!;
  return definition.type === "multi" ? [option.value] : option.value;
};
let clock = 1_000;
const tick = () => (clock += 1);

/** Recorre la sesión como la UI: una pregunta a la vez, siempre la que la sesión muestra. */
function drive(session: DiagnosticSessionV3, answerFor: (id: string) => unknown) {
  let current = session;
  const shown: string[] = [];
  for (let guard = 0; guard < 60 && current.status === "in_progress"; guard += 1) {
    const id = currentQuestionIdV3(current)!;
    shown.push(id);
    const result = submitAnswerV3(current, id, answerFor(id), tick());
    assert.ok(result.ok, `${id}: ${!result.ok && result.error}`);
    current = result.session;
  }
  return { session: current, shown };
}
const fromZero = (overrides: Record<string, unknown>, policy: Policy) => drive(createSessionV3({ sessionId: "s", now: tick() }), (id) => overrides[id] ?? pick(id, policy));
const storedNativa = Object.fromEntries([...readFileSync(join(process.cwd(), "..", "artifacts", "diagnostic-v3-calibration", "case-06-nativa-home", "case-06.md"), "utf8").matchAll(/\|\s*\d+\s*\|\s*(q2_[a-z0-9_]+)<br>[\s\S]*?\|\s*[^|]*?\[([^\]]+)\]\s*\|/g)].map((match) => [match[1], match[2]]));
const storedReparaciones = Object.fromEntries([...readFileSync(join(process.cwd(), "..", "artifacts", "diagnostic-v3-calibration", "case-01-reparaciones-rapidas", "case-01.md"), "utf8").matchAll(/\|\s*\d+\s*\|\s*(q2_[a-z0-9_]+)<br>[\s\S]*?\|\s*[^|]*?\[([^\]]+)\]\s*\|/g)].map((match) => [match[1], match[2]]));

class MemoryStorage implements StorageLike {
  readonly data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

test("10B first question and adaptive progression come from the planner, one batch at a time, re-evaluated after every answer", () => {
  const session = createSessionV3({ sessionId: "a", now: 1 });
  const plan = buildQuestionPlan({ answers: {}, bank });
  assert.equal(currentQuestionIdV3(session), plan.nextQuestionId);
  assert.deepEqual(session.queue.map((item) => item.questionId), plan.selectedQuestionIds, "the session holds the current batch, never a precomputed full route");
  // Cada lote nuevo es exactamente lo que el planner selecciona con las respuestas de ese momento.
  const { session: done } = fromZero({ q2_entity: "business", q2_has_customers: "yes", q2_delivery: "scheduled", q2_goal: "opportunities", q2_friction: "follow_up" }, "middle");
  const answers: Record<string, unknown> = {};
  for (const entry of done.routeTrace) {
    if (entry.type === "planned") assert.deepEqual(entry.questionIds, buildQuestionPlan({ answers: answers as AnswersV2, bank }).selectedQuestionIds);
    if (entry.type === "answered") answers[entry.questionId] = done.answers[entry.questionId];
  }
  assert.ok(done.status === "completing" || done.status === "deepening_required");
  const finalPlan = buildQuestionPlan({ answers: done.answers, bank });
  assert.ok(finalPlan.selectedQuestionIds.length === 0 || finalPlan.selectedQuestionIds.every((id) => finalPlan.trace.find((entry) => entry.questionId === id)?.selectedIn === "deepening"), "ends or continues only with adaptive deepening");
});

test("FIX-03B session continues with one deepening question instead of exposing a final result", () => {
  const session = createSessionV3({ sessionId: "nativa-fix-03a", now: tick(), seedAnswers: storedNativa });
  assert.equal(session.status, "in_progress");
  assert.equal(session.queue.length, 1);
  assert.equal(session.queue[0]!.phase, "deepening");
  assert.equal(completeSessionV3(session).ok, false);
});

test("FIX-03C persists the terminal reason for truthful completion copy", () => {
  const store = new DiagnosticSessionStoreV3(new MemoryStorage());
  const source = { ...createSessionV3({ sessionId: "terminal-reason", now: tick(), seedAnswers: storedReparaciones }), queue: [], status: "completing" as const, terminalReason: "no_useful_questions" as const };
  store.write(source);
  assert.equal(store.read(tick())?.terminalReason, "no_useful_questions");
});

test("FIX-03A reviewing the final answer re-applies the evidence gate", () => {
  const base = createSessionV3({ sessionId: "nativa-review-fix-03a", now: tick(), seedAnswers: storedNativa });
  const session = { ...base, answeredQuestionIds: Object.keys(storedNativa) };
  const reviewed = goBackV3(session, tick());
  const questionId = currentQuestionIdV3(reviewed)!;
  const value = reviewed.answers[questionId];
  const submitted = submitAnswerV3(reviewed, questionId, value, tick());
  assert.equal(submitted.ok, true);
  if (submitted.ok) assert.equal(submitted.session.status, "in_progress");
});

test("10B answer validation: required, type, unknown option, duplicates and exclusive combinations never reach AnswersV2", () => {
  const single = question("q2_entity");
  assert.deepEqual(validateAnswerV3(single, undefined), { ok: false, error: "required" });
  assert.deepEqual(validateAnswerV3(single, ["business"]), { ok: false, error: "invalid_type" });
  assert.deepEqual(validateAnswerV3(single, "cliente"), { ok: false, error: "invalid_option" });
  assert.deepEqual(validateAnswerV3(single, "business"), { ok: true, value: "business" });
  const multi = question("q2_ecommerce_traffic_sources");
  assert.deepEqual(validateAnswerV3(multi, []), { ok: false, error: "required" });
  assert.deepEqual(validateAnswerV3(multi, "social"), { ok: false, error: "invalid_type" });
  assert.deepEqual(validateAnswerV3(multi, ["unknown", multi.options[0]!.value]), { ok: false, error: "exclusive_conflict" });
  const two = multi.options.filter((option) => !option.exclusive).slice(0, 2).map((option) => option.value);
  assert.deepEqual(validateAnswerV3(multi, [two[1]!, two[0]!]), { ok: true, value: two }, "stored in canonical option order");
  assert.deepEqual(validateAnswerV3(multi, [two[0]!, two[0]!]), { ok: false, error: "duplicate_option" });
  const session = createSessionV3({ sessionId: "v", now: 1 });
  const id = currentQuestionIdV3(session)!;
  const rejected = submitAnswerV3(session, id, "no-such-option", 2);
  assert.deepEqual(rejected, { ok: false, error: "invalid_option" });
  assert.deepEqual(session.answers, {}, "the session is untouched");
  assert.deepEqual(submitAnswerV3(session, "q2_goal_not_current", "x", 2), { ok: false, error: "not_current_question" });
});

test("10B multiselect exclusivity follows the question contract deterministically", () => {
  const traffic = question("q2_ecommerce_traffic_sources");
  const known = traffic.options.filter((option) => !option.exclusive).map((option) => option.value);
  let selected = toggleMultiValueV3(traffic, [], known[1]!);
  selected = toggleMultiValueV3(traffic, selected, known[0]!);
  assert.deepEqual(selected, [known[0], known[1]], "canonical order");
  assert.deepEqual(toggleMultiValueV3(traffic, selected, "unknown"), ["unknown"], "«No sé» clears known sources");
  assert.deepEqual(toggleMultiValueV3(traffic, ["unknown"], known[2]!), [known[2]], "a known source clears «No sé»");
  assert.deepEqual(toggleMultiValueV3(traffic, [known[0]!], known[0]!), [], "toggle off");
  const capacity = question("q2_capacity_signal");
  const exclusive = capacity.options.filter((option) => option.exclusive).map((option) => option.value);
  assert.deepEqual(exclusive.sort(), ["stable", "unknown"]);
  const other = capacity.options.find((option) => !option.exclusive)!.value;
  assert.deepEqual(toggleMultiValueV3(capacity, [other], "stable"), ["stable"]);
  assert.deepEqual(toggleMultiValueV3(capacity, ["stable"], "unknown"), ["unknown"]);
  assert.deepEqual(toggleMultiValueV3(capacity, ["unknown"], other), [other]);
  for (const definition of [traffic, capacity]) for (const option of definition.options) assert.ok(validateAnswerV3(definition, toggleMultiValueV3(definition, [], option.value)).ok);
});

test("10B question versions: the UI renders the current canonical version and a stored value outside it is rejected, never normalized", () => {
  for (const id of ["q2_reputation_flow", "q2_ecommerce_traffic_sources"]) assert.equal(question(id).version, 2);
  assert.ok(question("q2_reputation_flow").options.some((option) => option.value === "occasional"), "v2 option present");
  const stored = { schemaVersion: 1, sessionId: "x", startedAt: 1, updatedAt: 1, answers: { q2_reputation_flow: "sometimes_legacy" }, answeredQuestionIds: ["q2_reputation_flow"], queue: [], reviewIndex: null, routeTrace: [], status: "in_progress" };
  assert.equal(parseSessionV3(JSON.stringify(stored), 2), null);
});

test("10B every visible question goes through the frozen copy renderer: profile terms, hints and help, no internal codes", () => {
  const profiles = new Set<string>();
  for (const persona of GOLDEN_PERSONAS) {
    let session = createSessionV3({ sessionId: persona.id, now: 1, seedAnswers: { ...persona.answers, ...persona.preexistingAnswers } });
    while (session.status === "in_progress") {
      const presented = presentQuestionV3(session)!;
      const definition = question(presented.question.id);
      const context = resolveEligibleQuestionsV2(session.answers, bank).context;
      assert.deepEqual(presented.question, renderQuestionV2(definition, { context, answers: session.answers }), "no manual word replacement");
      const help = presented.question.help;
      const text = [presented.question.prompt, presented.question.hint ?? "", ...presented.question.options.map((option) => option.label), help?.understand ?? "", help?.distinction ?? "", help?.why ?? ""].join(" ");
      for (const term of TERMINOLOGY[presented.question.profile].avoid) assert.ok(!text.toLowerCase().includes(term.toLowerCase()), `${persona.id}/${definition.id}: «${term}»`);
      assert.ok(!/\bq2_|\b[a-z]+_[a-z_]+\b|score|peso|puntaje/i.test(text), `${persona.id}/${definition.id}: internal wording`);
      assert.equal(presented.question.hint, definition.variants?.find((_, index) => index === presented.question.variant)?.hint ?? definition.hint);
      profiles.add(presented.question.profile);
       session = submitAnswerV3(session, definition.id, persona.answerProfile[definition.id] ?? pick(definition.id, "first"), 2).session as DiagnosticSessionV3;
    }
  }
  for (const profile of ["clinical", "nonprofit", "creator", "prelaunch", "ecommerce", "b2b"]) assert.ok(profiles.has(profile), profile);
});

test("10B pre-launch: diagnostic questions are framed as preparation and operational questions never appear", () => {
  const { session, shown } = fromZero({ q2_entity: "project", q2_has_customers: "no" }, "first");
  assert.equal(sessionProfileV3(session), "prelaunch");
  const flagged = shown.filter((id) => !question(id).purpose.some((purpose) => ["anchor", "classification", "maturity", "goal", "friction"].includes(purpose)) || question(id).purpose.includes("diagnostic"));
  assert.ok(flagged.length > 0);
  // Ninguna pregunta que presupone operación real es elegible: el resolver congelado lo garantiza y la sesión no reactiva nada.
  assert.deepEqual(Object.keys(resolveEligibleQuestionsV2(session.answers, bank).activeAnswers).sort(), Object.keys(session.answers).sort());
  let probe = createSessionV3({ sessionId: "p", now: 1 });
  while (probe.status === "in_progress") {
    const presented = presentQuestionV3(probe)!;
    if (sessionProfileV3(probe) === "prelaunch" && !presented.foundational) assert.equal(presented.aboutPreparation, true, presented.question.id);
    probe = submitAnswerV3(probe, presented.question.id, ({ q2_entity: "project", q2_has_customers: "no" } as Record<string, unknown>)[presented.question.id] ?? pick(presented.question.id, "first"), 2).session as DiagnosticSessionV3;
  }
});

test("10B progress: stages without a fixed denominator, monotonic, ending in «preparing»", () => {
  let session = createSessionV3({ sessionId: "g", now: 1 });
  let last = 0;
  const seen = new Set<string>();
  while (session.status === "in_progress") {
    const progress = progressV3(session);
    assert.deepEqual(Object.keys(progress).sort(), ["answered", "stage", "stageIndex"], "no total count is exposed");
    assert.ok(progress.stageIndex >= last, "never goes back");
    last = progress.stageIndex;
    seen.add(progress.stage);
    const id = currentQuestionIdV3(session)!;
    session = submitAnswerV3(session, id, pick(id, "middle"), 2).session as DiagnosticSessionV3;
  }
  assert.deepEqual([...seen].slice(0, 2), ["context", "deepening"]);
  assert.equal(progressV3(session).stage, session.status === "deepening_required" ? "final_checks" : "preparing");
  // La cola material del planner (preguntas 19–24) se presenta como «Últimas comprobaciones».
  const overrides: Record<string, unknown> = { q2_entity: "business", q2_has_customers: "yes", q2_delivery: "scheduled", q2_goal: "be_found", q2_friction: "visibility" };
  let material = createSessionV3({ sessionId: "m", now: 1 });
  while (material.status === "in_progress" && material.queue[0]?.phase !== "material") {
    const id = currentQuestionIdV3(material)!;
    material = submitAnswerV3(material, id, overrides[id] ?? pick(id, "first"), 2).session as DiagnosticSessionV3;
  }
  assert.equal(material.queue[0]?.phase, "material");
  assert.equal(progressV3(material).stage, "final_checks");
});

test("10B completion runs the frozen pipeline; a failure keeps the answers and can be retried", () => {
  const { session: routed } = fromZero({}, "middle");
  const session = routed.status === "deepening_required" ? { ...routed, status: "completing" as const } : routed;
  const failed = completeSessionV3(session, 5, () => { throw new Error("boom"); });
  assert.equal(failed.ok, false);
  assert.equal(failed.session.status, "error");
  assert.deepEqual(failed.session.answers, session.answers);
  const retried = completeSessionV3(failed.session, 6);
  assert.ok(retried.ok);
  assert.equal(retried.session.status, "completed");
  assert.deepEqual(retried.result, runDiagnosticPipelineV3(session.answers));
  assert.equal(completeSessionV3(goBackV3(session, 7), 8).ok, false, "never completes while reviewing an answer");
});

test("10B back/edit: unchanged answers move forward; a changed answer reconciles the route without restarting", () => {
  const base = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_sector: "health_wellness", q2_goal: "opportunities", q2_friction: "follow_up" };
  const { session } = fromZero(base, "first");
  const backTo = (current: DiagnosticSessionV3, id: string) => { let reviewing = current; while (currentQuestionIdV3(reviewing) !== id) reviewing = goBackV3(reviewing, tick()); return reviewing; };
  assert.equal(canGoBackV3(createSessionV3({ sessionId: "n", now: 1 })), false);
  // Sin cambios: avanza a la siguiente respuesta guardada y no toca nada.
  const reviewing = backTo(session, "q2_goal");
  const same = submitAnswerV3(reviewing, "q2_goal", "opportunities", tick());
  assert.ok(same.ok);
  assert.deepEqual(same.session.answers, session.answers);
  assert.equal(currentQuestionIdV3(same.session), session.answeredQuestionIds[session.answeredQuestionIds.indexOf("q2_goal") + 1]);

  // A: en marcha → antes del lanzamiento: las respuestas operativas quedan fuera y no vuelven solas.
  const prelaunch = submitAnswerV3(backTo(session, "q2_has_customers"), "q2_has_customers", "no", tick());
  assert.ok(prelaunch.ok);
  const invalidated = prelaunch.session.routeTrace.filter((entry) => entry.type === "invalidated").flatMap((entry) => entry.type === "invalidated" ? entry.questionIds : []);
  assert.ok(invalidated.includes("q2_followup_general_process") && invalidated.includes("q2_regularity"));
  for (const id of invalidated) { assert.equal(prelaunch.session.answers[id], undefined); assert.ok(!prelaunch.session.answeredQuestionIds.includes(id)); }
  assert.deepEqual(Object.keys(resolveEligibleQuestionsV2(prelaunch.session.answers, bank).activeAnswers).sort(), Object.keys(prelaunch.session.answers).sort(), "no inactive answers kept");
  assert.equal(sessionProfileV3(prelaunch.session), "prelaunch");
  // La reconciliación coincide con lo que el planner decide para esas respuestas.
  assert.deepEqual(prelaunch.session.queue.map((item) => item.questionId), buildQuestionPlan({ answers: prelaunch.session.answers, bank }).selectedQuestionIds);

  // B: tipo de negocio (forma de entrega: citas → tienda en línea): cambian términos y ruta. El perfil sin fines de
  // lucro no sale de la entidad sino del modelo de ingresos (contrato congelado del resolver).
  const business = submitAnswerV3(backTo(session, "q2_delivery"), "q2_delivery", "online_checkout", tick());
  assert.ok(business.ok);
  assert.equal(sessionProfileV3(session), "appointments");
  assert.equal(sessionProfileV3(business.session), "ecommerce");
  const finishedBusiness = drive(business.session, (id) => pick(id, "first")).session;
  assert.ok(finishedBusiness.status === "completing" || finishedBusiness.status === "deepening_required");
  assert.ok(!Object.keys(finishedBusiness.answers).some((id) => id.startsWith("q2_appointments_")), "appointment questions left the route");

  // C y D: meta y freno cambian lo que el planner considera material.
  const goal = submitAnswerV3(backTo(session, "q2_goal"), "q2_goal", "measure", tick());
  assert.ok(goal.ok);
  assert.notDeepEqual(buildQuestionPlan({ answers: goal.session.answers, bank }).materialEvidence, buildQuestionPlan({ answers: session.answers, bank }).materialEvidence);
  const friction = submitAnswerV3(backTo(session, "q2_friction"), "q2_friction", "visibility", tick());
  assert.ok(friction.ok);
  const afterFriction = drive(friction.session, (id) => pick(id, "first")).session;
  assert.ok(afterFriction.status === "completing" || afterFriction.status === "deepening_required");
  assert.notDeepEqual(Object.keys(afterFriction.answers).sort(), Object.keys(session.answers).sort(), "the friction change produced a different route");
  for (const edited of [prelaunch.session, business.session, goal.session, friction.session]) assert.equal(edited.reviewIndex, null, "continues from the reconciled point");
});

test("10B persistence: valid resume, refresh mid-question, outdated schema, corruption, tampering, expiry, completed session and reset", () => {
  const storage = new MemoryStorage();
  const store = new DiagnosticSessionStoreV3(storage);
  let session = createSessionV3({ sessionId: "r", now: 10_000 });
  for (let step = 0; step < 4; step += 1) { const id = currentQuestionIdV3(session)!; session = (submitAnswerV3(session, id, pick(id, "first"), 10_000 + step) as { session: DiagnosticSessionV3 }).session; }
  store.write(session);
  const restored = store.read(20_000)!;
  assert.deepEqual(restored, session, "valid resume restores the same session");
  assert.equal(currentQuestionIdV3(restored), currentQuestionIdV3(session), "refresh keeps the current question");
  const raw = storage.getItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY)!;
  assert.ok(!/label|Mi trabajo|negocio en funcionamiento/.test(raw), "stores canonical values, not labels");
  const mutate = (patch: Record<string, unknown>) => JSON.stringify({ ...JSON.parse(raw), ...patch });
  assert.equal(parseSessionV3(mutate({ schemaVersion: 0 }), 20_000), null, "outdated schema");
  assert.equal(parseSessionV3("{not json", 20_000), null, "corrupted JSON");
  assert.equal(parseSessionV3(mutate({ answers: { ...session.answers, q2_entity: "hacker" } }), 20_000), null, "tampered answer");
  const tooManyAnswers = Object.fromEntries(QUESTION_BANK_V2.slice(0, ROUTE_HARD_CAP + 1).map((question) => [question.id, pick(question.id, "first")]));
  assert.equal(parseSessionV3(mutate({ answers: tooManyAnswers, answeredQuestionIds: Object.keys(tooManyAnswers) }), 20_000), null, "answers beyond the absolute cap");
  assert.equal(parseSessionV3(mutate({ answers: { ...session.answers, q2_unknown_question: "x" } }), 20_000), null, "unknown question");
  assert.equal(parseSessionV3(mutate({ reviewIndex: 99 }), 20_000), null, "impossible review position");
  assert.equal(parseSessionV3(raw, session.updatedAt + DIAGNOSTIC_SESSION_V3_TTL_MS + 1), null, "expired");
  storage.setItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY, "{broken");
  assert.equal(store.read(20_000), null);
  assert.equal(storage.getItem(DIAGNOSTIC_SESSION_V3_STORAGE_KEY), null, "corrupted data is cleared, not retried forever");
  const { session: routed } = fromZero({}, "first");
  const finished = routed.status === "deepening_required" ? { ...routed, status: "completing" as const } : routed;
  const completed = completeSessionV3(finished, 30_000);
  assert.ok(completed.ok);
  store.write(completed.session);
  const again = store.read(31_000)!;
  assert.equal(again.status, "completed");
  assert.deepEqual(completeSessionV3(again, 32_000).ok && completeSessionV3(again, 32_000).result, completed.result, "a completed session reproduces the same result");
  store.clear();
  assert.equal(store.read(33_000), null, "reset clears everything");
  const throwing: StorageLike = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  const blocked = new DiagnosticSessionStoreV3(throwing);
  assert.equal(blocked.read(1), null);
  assert.doesNotThrow(() => { blocked.write(session); blocked.clear(); });
});

test("10B parity: all 12 golden journeys through the session equal the direct fixture pipeline, question by question", () => {
  for (const persona of GOLDEN_PERSONAS) {
    const fixture = runGoldenPersonaPipeline(persona, { includeDeepening: true });
    const { session, shown } = drive(createSessionV3({ sessionId: persona.id, now: 1, seedAnswers: { ...persona.answers, ...persona.preexistingAnswers } }), (id) => persona.answerProfile[id] ?? pick(id, "first"));
    assert.deepEqual(shown, fixture.selectedQuestionIds, `${persona.id}: same questions in the same order`);
    assert.deepEqual(session.answers, fixture.answers, `${persona.id}: same AnswersV2`);
    const completion = completeSessionV3(session, 2);
    if (!completion.ok) {
      assert.equal(session.status, "deepening_required", `${persona.id}: blocked only by the evidence gate`);
      continue;
    }
    const direct = runDiagnosticPipelineV3(fixture.answers);
    assert.deepEqual(completion.result.narrative, direct.narrative, `${persona.id}: narrative`);
    assert.deepEqual(completion.result.outcome, direct.outcome, `${persona.id}: overall status, recommendations and offerings`);
    assert.deepEqual(completion.result, direct);
  }
});

test("10B generated interactive routes from zero: no dead ends, no duplicates, ≤24 questions, no inactive answers, deterministic", () => {
  const values = (id: string) => question(id).options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
  let count = 0;
  let index = 0;
  for (const entity of values("q2_entity")) for (const delivery of values("q2_delivery")) for (const goal of ["be_found", "opportunities", "organize"]) {
    const policy = (["first", "middle", "last"] as const)[index++ % 3];
    const overrides = { q2_entity: entity, q2_delivery: delivery, q2_goal: goal };
    const { session, shown } = fromZero(overrides, policy);
    const label = `${entity}/${delivery}/${goal}/${policy}`;
    assert.ok(session.status === "completing" || session.status === "deepening_required", `${label}: completes or requires deepening`);
    assert.equal(new Set(shown).size, shown.length, `${label}: duplicate question`);
    assert.ok(Object.keys(session.answers).length <= ROUTE_HARD_CAP, `${label}: hard cap`);
    assert.deepEqual(Object.keys(resolveEligibleQuestionsV2(session.answers, bank).activeAnswers).sort(), Object.keys(session.answers).sort(), `${label}: inactive answers`);
    for (const [id, value] of Object.entries(session.answers)) assert.ok(validateAnswerV3(question(id), value).ok, `${label}: ${id} invalid`);
    if (count % 12 === 0) assert.deepEqual(fromZero(overrides, policy).session.answers, session.answers, `${label}: deterministic`);
    count += 1;
  }
  assert.equal(count, 4 * 9 * 3);
});

// ── Determinismo del resultado (DIAG-V3-ANSWER-ORDER-01) ────────────────────
// El orden en que se dieron las respuestas es historia de la interacción, no evidencia: con las mismas respuestas
// activas, todas las capas del resultado deben ser idénticas. Solo `routeTrace`/marcas de tiempo son historia.

/** Todas las capas del diagnóstico para un conjunto de respuestas, no solo la narrativa. */
function diagnosis(answers: AnswersV2) {
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  return { scoring, priorities, semanticFacts, ...runDiagnosticPipelineV3(answers) };
}
const inOrder = (answers: AnswersV2, ids: readonly string[]) => Object.fromEntries(ids.map((id) => [id, answers[id]!])) as AnswersV2;

test("10B determinism: insertion permutations of the same active answers give an identical diagnosis, directly and through the session", () => {
  const base = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_sector: "health_wellness", q2_goal: "opportunities", q2_friction: "follow_up" };
  const { session } = fromZero(base, "middle");
  const route = Object.keys(session.answers);
  const reference = diagnosis(session.answers);
  assert.ok(reference.semanticFacts.facts.length >= 5, "enough evidence for several facts");
  assert.ok(reference.narrative.dimensions.some((item) => item.evidence.length > 3), "a dimension names more topics than the narrative lists (the order-sensitive case)");
  const permutations = {
    reversed: [...route].reverse(),
    byIdDescending: [...route].sort().reverse(),
    interleaved: [...route.filter((_, index) => index % 2 === 1), ...route.filter((_, index) => index % 2 === 0)],
    rotated: [...route.slice(Math.floor(route.length / 2)), ...route.slice(0, Math.floor(route.length / 2))],
  };
  for (const [label, ids] of Object.entries(permutations)) {
    assert.notDeepEqual(ids, route, `${label} is a different insertion order`);
    const permuted = inOrder(session.answers, ids);
    const result = diagnosis(permuted);
    assert.deepEqual(result.scoring, reference.scoring, `${label}: scoring`);
    assert.deepEqual(result.priorities, reference.priorities, `${label}: priorities`);
    assert.deepEqual(result.semanticFacts, reference.semanticFacts, `${label}: semantic facts`);
    assert.deepEqual(result.narrative, reference.narrative, `${label}: narrative`);
    assert.deepEqual(result.outcome, reference.outcome, `${label}: overall status, recommendations, solutions and offerings`);
    // Por la sesión: la reconciliación acepta las mismas respuestas en otro orden y cierra con el mismo resultado.
    const seeded = createSessionV3({ sessionId: label, now: tick(), seedAnswers: permuted });
    assert.ok(seeded.status === "completing" || seeded.status === "deepening_required", `${label}: nothing left to ask or requires deepening`);
    assert.deepEqual(Object.keys(seeded.answers).sort(), [...route].sort());
    const completion = completeSessionV3(seeded, tick());
    if (completion.ok) assert.deepEqual(completion.result, { narrative: reference.narrative, outcome: reference.outcome }, `${label}: session result`);
    else assert.equal(seeded.status, "deepening_required", `${label}: blocked only by the evidence gate`);
  }
});

test("10B determinism: back/edit with reconciliation ends in the same diagnosis as a fresh session reaching the same answers", () => {
  const base: Record<string, unknown> = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_sector: "health_wellness", q2_goal: "opportunities", q2_friction: "follow_up" };
  const { session } = fromZero(base, "first");
  let reviewing = session;
  while (currentQuestionIdV3(reviewing) !== "q2_delivery") reviewing = goBackV3(reviewing, tick());
  const edited = submitAnswerV3(reviewing, "q2_delivery", "fixed_with_inventory", tick());
  assert.ok(edited.ok);
  const reconciled = drive(edited.session, (id) => base[id] ?? pick(id, "first")).session;
  assert.ok(reconciled.status === "completing" || reconciled.status === "deepening_required");
  const finalAnswers = reconciled.answers;
  // Sesión nueva que llega directamente al mismo conjunto final de respuestas activas.
  const fresh = drive(createSessionV3({ sessionId: "fresh", now: tick() }), (id) => finalAnswers[id] ?? pick(id, "first")).session;
  assert.deepEqual(Object.keys(resolveEligibleQuestionsV2(fresh.answers, bank).activeAnswers).sort(), Object.keys(fresh.answers).sort(), "fresh route has only active answers");
  assert.deepEqual(Object.keys(resolveEligibleQuestionsV2(finalAnswers as AnswersV2, bank).activeAnswers).sort(), Object.keys(finalAnswers).sort(), "edited route has only active answers");
  assert.notDeepEqual(Object.keys(fresh.answers), Object.keys(finalAnswers), "adaptive deepening may choose a different useful route after the edit");
  const afterEdit = completeSessionV3(reconciled, tick());
  const direct = completeSessionV3(fresh, tick());
  assert.equal(afterEdit.ok, direct.ok);
  if (afterEdit.ok && direct.ok) {
    assert.ok(afterEdit.result.outcome.overall.publicLabel && direct.result.outcome.overall.publicLabel, "both routes produce a canonical global state");
    assert.equal(afterEdit.result.outcome.overall.publicLabel, direct.result.outcome.overall.publicLabel, "edited and fresh routes preserve the same global band");
  }
});

test("10B determinism: a session serialized mid-route and restored completes exactly like the uninterrupted one", () => {
  const base: Record<string, unknown> = { q2_entity: "business", q2_delivery: "online_checkout", q2_goal: "be_found", q2_friction: "visibility" };
  const answerFor = (id: string) => base[id] ?? pick(id, "middle");
  const uninterrupted = drive(createSessionV3({ sessionId: "u", now: 1 }), answerFor).session;
  const expected = completeSessionV3(uninterrupted, tick());
  assert.equal(expected.ok, uninterrupted.status === "completing");
  for (const cut of [1, 5, 10, uninterrupted.answeredQuestionIds.length - 1]) {
    let partial = createSessionV3({ sessionId: "u", now: 1 });
    for (let step = 0; step < cut; step += 1) { const id = currentQuestionIdV3(partial)!; partial = (submitAnswerV3(partial, id, answerFor(id), tick()) as { session: DiagnosticSessionV3 }).session; }
    const restored = parseSessionV3(serializeSessionV3(partial), tick());
    assert.ok(restored, `cut ${cut}: restorable`);
    assert.deepEqual(restored, partial, `cut ${cut}: restored as saved`);
    const resumed = drive(restored, answerFor).session;
    assert.deepEqual(resumed.answeredQuestionIds, uninterrupted.answeredQuestionIds, `cut ${cut}: same route`);
    assert.deepEqual(resumed.answers, uninterrupted.answers, `cut ${cut}: same answers`);
    const completion = completeSessionV3(resumed, tick());
    assert.equal(completion.ok, expected.ok, `cut ${cut}: same completion state`);
    if (completion.ok && expected.ok) assert.deepEqual(completion.result, expected.result, `cut ${cut}: same result`);
  }
});

test("10B the session layer adds no routing, scoring or priority rules of its own", () => {
  const source = readFileSync(new URL("../../../app/features/diagnostic/qbv2-session.ts", import.meta.url), "utf8");
  assert.ok(!/appliesWhen|evaluateRuleV2|CAPABILITY_CONTRIBUTION|SEVERITY_BANDS|GOAL_RELEVANCE|FRICTION_RELEVANCE|ANSWER_SEMANTICS/.test(source), "no duplicated domain logic");
  for (const file of ["diagnostic-flow.tsx", "question-step.tsx", "flow-screens.tsx"]) {
    const component = readFileSync(new URL(`../../../app/components/diagnostic-flow/${file}`, import.meta.url), "utf8");
    assert.ok(!/buildQuestionPlan|resolveEligibleQuestionsV2|scoreContextualDimensions|deriveConstraintsAndPriorities|appliesWhen/.test(component), `${file}: components only talk to the session layer`);
  }
});
