import assert from "node:assert/strict";
import test from "node:test";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { evaluateDimensionApplicabilityV3 } from "../../../app/features/diagnostic/qa03b/applicability";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qa03b/bank";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { buildCandidateDiagnosticReportV1, buildCandidateResultPresentationV3 } from "../../../app/components/diagnostic-flow/qa03b-presentation";
import { createCandidateSessionV3 as create, currentCandidateQuestionIdV3 as currentId, submitCandidateAnswerV3 as submit, completeCandidateSessionV3 as complete, rebuildCompletedCandidateResultV3 as rebuild, parseCandidateSessionV3 as parse, goBackCandidateV3 as back, CandidateSessionStoreV3 as Store, CANDIDATE_SESSION_STORAGE_KEY_V3 as KEY, CANDIDATE_SESSION_TTL_MS_V3 as TTL, type CandidateSessionV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import { createCandidateSessionV3 as createOld, CANDIDATE_SESSION_STORAGE_KEY_V3 as OLD_KEY } from "../../../app/features/diagnostic/qbv2-candidate-session";
import { AUTHORED_JOURNEYS, AUTHORED_UNKNOWN_CAPABILITIES as base } from "./qa03b-fixtures";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const clock = () => Date.now();
const make = (writerId = "tab-a") => create({ sessionId: "qa03b-test", writerId, now: clock() });
function drive(answers: AnswersV2) {
  let session = make();
  for (let n = 0; n < 25 && session.status === "in_progress"; n++) {
    const id = currentId(session)!;
    assert.ok(answers[id] !== undefined, `Respuesta sintética escrita para ${id}, sin fallback`);
    const result = submit(session, id, answers[id], session.writerId, clock());
    assert.ok(result.ok, `Acepta ${id}`); session = result.session;
  }
  assert.equal(session.status, "completing");
  return complete(session, session.writerId, clock())!;
}
for (const fixture of AUTHORED_JOURNEYS) test(`QA-03B: recorrido, contexto único e informe determinista ${fixture.id}`, () => {
  const { session, result } = drive(fixture.answers);
  assert.ok(Object.keys(session.answers).length <= 24);
  assert.deepEqual(result, runCandidateDiagnosticPipelineV3(session.answers));
  assert.deepEqual(result.plan.context, result.scoring.context);
  assert.deepEqual(result.context, result.scoring.context);
  assert.deepEqual(rebuild(parse(JSON.stringify(session), clock())!), result);
  const report = buildCandidateDiagnosticReportV1(result, new Date(session.completedAt!));
  assert.deepEqual(buildCandidateDiagnosticReportV1(rebuild(session)!, new Date(session.completedAt!)), report);
  assert.equal(result.activeAnswers.q2_operational_status, fixture.answers.q2_operational_status);
  if (["education-third-party", "clinic-third-party", "direct-b2b"].includes(fixture.id)) assert.equal(result.activeAnswers.q2_buyer_recipient_relation, fixture.answers.q2_buyer_recipient_relation);
  if (fixture.id === "operating-project") assert.equal(result.narrative.lifecycle, "live", "project no impone preparación");
  assert.equal(complete(session, session.writerId, clock()), null);
  assert.equal(parse(JSON.stringify(session), clock())?.completedAt, session.completedAt);
  if (["paused-history", "paused-no-history"].includes(fixture.id)) {
    assert.match(result.narrative.currentState.text, /en pausa/);
    assert.equal(buildCandidateResultPresentationV3(result).lifecycleLabel, "En pausa");
    assert.equal(result.activeAnswers.q2_regularity, undefined);
  }
  if (fixture.id === "institutional-funding") {
    assert.equal(result.context.customerModel.buyer.status, "unresolved");
    assert.equal(result.activeAnswers.q2_b2b_pipeline, undefined);
    assert.equal(result.activeAnswers.q2_buyer_recipient_relation, undefined);
  }
});

for (const [state, history] of [["preparing", "no"], ["operating", "no"], ["operating", "yes"], ["paused", "yes"], ["paused", "no"], ["unknown", "yes"]]) test(`QA-03B: matriz R4 ocho dimensiones ${state}/${history}`, () => {
  const context = resolveEligibleQuestionsV2({ ...base, q2_operational_status: state, q2_has_customers: history, q2_customer_buyer: "b2c" }, BANK).context;
  const expected: Record<string, string> = {
    digital_foundation: state === "paused" ? "insufficient_context" : "applicable",
    discovery: state === "paused" ? "insufficient_context" : "applicable",
    clarity_positioning: "applicable", digital_readiness: "applicable", trust_reputation: "insufficient_context", measurement_optimization: "insufficient_context",
    conversion_access: state === "paused" ? "not_applicable" : state === "unknown" ? "insufficient_context" : "applicable",
    relationship_recurrence: history === "no" ? "not_applicable" : state === "operating" ? "applicable" : "insufficient_context",
  };
  for (const dimension of DIGITAL_DIMENSION_IDS) assert.equal(evaluateDimensionApplicabilityV3({ dimension, context }).applicability, expected[dimension], dimension);
  const noClients = runCandidateDiagnosticPipelineV3({ ...base, q2_operational_status: state, q2_has_customers: history });
  assert.ok(noClients.scoring.dimensions.every(d => d.score === null));
});

class Memory {
  values = new Map<string, string>();
  reads: string[] = [];
  getItem(key: string) { this.reads.push(key); return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
test("QA-03B: aislamiento sin migración automática, rollback y expiración", async () => {
  const storage = new Memory();
  const old = JSON.stringify(createOld({ sessionId: "old", writerId: "old-tab", now: clock() }));
  storage.setItem(OLD_KEY, old);
  storage.setItem("vecidya.diagnostic.v3.candidate.session.3", "sesión QA-03B anterior, preservada sin migración");
  storage.setItem("vecidya.diagnostic.v3.candidate.session.4", "sesión QA-03B anterior, preservada sin migración");
  storage.setItem("vecidya.diagnostic.v3.candidate.session.5", "sesión QA-03B anterior, preservada sin migración");
  for (const key of ["vecidya.diagnostic.v3.candidate.session.1", "vecidya.diagnostic.v3.session.2"]) storage.setItem(key, "bytes preservados");
  const original = new Map(storage.values);
  const store = new Store(storage);
  assert.deepEqual(store.readResult(clock()), { kind: "available", session: null });
  assert.deepEqual(storage.reads, [KEY]);
  assert.equal(parse(old, clock()), null);
  assert.equal(await store.write(make()), "written");
  assert.equal(await store.clear(), true);
  assert.deepEqual(storage.values, original);
  const completed = drive(base).session;
  assert.equal(parse(JSON.stringify(completed), completed.updatedAt + TTL + 1), null);
  storage.setItem(KEY, "{corrupto"); assert.equal(store.read(clock()), null); assert.deepEqual(storage.values, original);
});
test("QA-03B: atrás y edición de estado invalidan solo evidencia afectada", () => {
  const done = drive(AUTHORED_JOURNEYS.find(f => f.id === "hybrid-retail-checkout")!.answers).session;
  const reviewing = { ...back(done, done.writerId, clock()), reviewIndex: done.answeredQuestionIds.indexOf("q2_operational_status") };
  assert.ok(reviewing.reviewIndex >= 0);
  const changed = submit(reviewing, "q2_operational_status", "paused", done.writerId, clock());
  assert.ok(changed.ok);
  assert.equal(changed.session.completedAt, null); assert.equal(changed.session.answers.q2_has_customers, "yes");
  assert.equal(changed.session.answers.q2_regularity, undefined);
  assert.deepEqual(changed.session.answers, resolveEligibleQuestionsV2(changed.session.answers, BANK).activeAnswers);
});
test("QA-03B: revisiones, escritura simultánea y almacenamiento restringido", async () => {
  const storage = new Memory(); const a = new Store(storage); const b = new Store(storage);
  const initial = make(); assert.equal(await a.write(initial), "written");
  const id = currentId(initial)!; const value = base[id];
  const left = submit(initial, id, value, "a", clock()).session;
  const right = submit(initial, id, value, "b", clock()).session;
  assert.deepEqual((await Promise.all([a.write(left), b.write(right)])).sort(), ["conflict", "written"]);
  assert.equal(await b.write(right), "conflict");
  const denied = { getItem() { throw new Error("denegado"); }, setItem() {}, removeItem() {} };
  assert.deepEqual(new Store(denied).readResult(clock()), { kind: "unavailable" });
  const full = { getItem() { return null; }, setItem() { throw new Error("cuota"); }, removeItem() {} };
  assert.equal(await new Store(full).write(initial), "unavailable");
});
