import assert from "node:assert/strict";
import test from "node:test";

import { CANDIDATE_RESULT_IDENTITY_V3, runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qbv2-candidate-pipeline";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import {
  CANDIDATE_SESSION_STORAGE_KEY_V3,
  CANDIDATE_SESSION_TTL_MS_V3,
  CandidateSessionStoreV3,
  completeCandidateSessionV3,
  createCandidateSessionV3,
  currentCandidateQuestionIdV3,
  goBackCandidateV3,
  parseCandidateSessionV3,
  submitCandidateAnswerV3,
  toggleCandidateMultiAnswerV3,
  type CandidateSessionV3,
  type CandidateStorageLikeV3,
} from "../../../app/features/diagnostic/qbv2-candidate-session";

let tick = Date.now();
const next = () => ++tick;
const make = (writerId = "tab-a") => createCandidateSessionV3({ sessionId: "candidate-test-session", writerId, now: next() });
function answer(session: CandidateSessionV3, writerId = session.writerId, choose?: string): CandidateSessionV3 {
  const id = currentCandidateQuestionIdV3(session);
  assert.ok(id, "session has next adaptive question");
  const question = BANK.find((item) => item.id === id)!;
  const option = question.options.find((item) => item.value === choose) ?? question.options[0]!;
  const value = question.type === "multi" ? [option.value] : option.value;
  const submitted = submitCandidateAnswerV3(session, id, value, writerId, next());
  assert.equal(submitted.ok, true, `${id} accepts a canonical answer`);
  return submitted.session;
}
function drive(session: CandidateSessionV3): CandidateSessionV3 {
  let current = session;
  for (let guard = 0; guard < 40 && current.status === "in_progress"; guard += 1) current = answer(current);
  assert.notEqual(current.status, "in_progress", "adaptive route reaches its terminal state");
  return current;
}
class MemoryStorage implements CandidateStorageLikeV3 {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

test("ACT-01: new candidate session is anonymous, versioned, and separate from legacy storage", () => {
  const session = make();
  assert.equal(session.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.equal(session.questionBankIdentity, "reviewed-evidence-v3");
  assert.equal(CANDIDATE_SESSION_STORAGE_KEY_V3, "vecidya.diagnostic.v3.candidate.session.1");
  assert.deepEqual(Object.keys(session.answers), []);
  assert.ok(currentCandidateQuestionIdV3(session));
});

test("ACT-01: session resumes after reload and rejects expired, corrupt, or incompatible snapshots", () => {
  const session = answer(make());
  const raw = JSON.stringify(session);
  assert.equal(parseCandidateSessionV3(raw, session.updatedAt)?.sessionId, session.sessionId);
  assert.equal(parseCandidateSessionV3(raw, session.updatedAt + CANDIDATE_SESSION_TTL_MS_V3 + 1), null);
  assert.equal(parseCandidateSessionV3("{broken", next()), null);
  const incompatible = { ...session, schemaVersion: 99 };
  assert.equal(parseCandidateSessionV3(JSON.stringify(incompatible), next()), null);
  const wrongEngine = { ...session, engineIdentity: { ...session.engineIdentity, planner: "other" } };
  assert.equal(parseCandidateSessionV3(JSON.stringify(wrongEngine), next()), null);
});

test("ACT-01: single and multiple answers validate against the reviewed candidate bank", () => {
  const initial = make();
  const id = currentCandidateQuestionIdV3(initial)!;
  const single = BANK.find((question) => question.id === id)!;
  const multi = BANK.find((question) => question.type === "multi")!;
  const selectedAnswer = single.type === "multi" ? [single.options[0]!.value] : single.options[0]!.value;
  const singleAnswer = submitCandidateAnswerV3(initial, id, selectedAnswer, "tab-a", next());
  assert.equal(singleAnswer.ok, true);
  const selected = toggleCandidateMultiAnswerV3(multi, [], multi.options.find((option) => !option.exclusive)!.value);
  assert.equal(selected.length, 1);
  const exclusive = multi.options.find((option) => option.exclusive);
  if (exclusive) assert.deepEqual(toggleCandidateMultiAnswerV3(multi, selected, exclusive.value), [exclusive.value]);
});

test("ACT-01: R5 context changes remove answers that are no longer eligible", () => {
  let session = make();
  const preferred: Record<string, string> = { q2_entity: "business", q2_monetization: "services", q2_delivery: "appointments", q2_sector: "professional_services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable" };
  for (let guard = 0; guard < 35 && session.status === "in_progress" && !session.answers.q2_process_systemization; guard += 1) {
    const id = currentCandidateQuestionIdV3(session);
    session = answer(session, session.writerId, preferred[id] ?? undefined);
  }
  assert.ok(session.answers.q2_process_systemization, "fixture reaches the yes-only process follow-up");
  const before = session.answeredQuestionIds;
  const index = before.indexOf("q2_has_customers");
  assert.ok(index >= 0);
  session = { ...session, reviewIndex: index };
  const result = submitCandidateAnswerV3(session, "q2_has_customers", "no", session.writerId, next());
  assert.equal(result.ok, true);
  if (result.ok) {
    const plan = buildCandidateQuestionPlanV3({ answers: result.session.answers });
    assert.deepEqual(result.session.answers, plan.activeAnswers);
    assert.equal(result.session.answers.q2_process_systemization, undefined, "R5 invalidates a yes-only follow-up after changing its prerequisite to no");
  }
});

test("ACT-01: edit, back, save/resume, and a clean execution reconstruct the same deterministic result", () => {
  let session = make();
  for (let index = 0; index < 4 && session.status === "in_progress"; index += 1) session = answer(session);
  const restored = parseCandidateSessionV3(JSON.stringify(session), next())!;
  assert.equal(currentCandidateQuestionIdV3(restored), currentCandidateQuestionIdV3(session));
  const back = goBackCandidateV3(restored, "tab-a", next());
  const editId = currentCandidateQuestionIdV3(back)!;
  const question = BANK.find((item) => item.id === editId)!;
  const alternate = question.options.find((option) => option.value !== back.answers[editId]) ?? question.options[0]!;
  const edited = submitCandidateAnswerV3(back, editId, question.type === "multi" ? [alternate.value] : alternate.value, "tab-a", next());
  assert.equal(edited.ok, true);
  const final = drive(edited.ok ? edited.session : restored);
  const first = completeCandidateSessionV3(final, "tab-a", next())!;
  let clean = make("tab-clean");
  for (let guard = 0; guard < 40 && clean.status === "in_progress"; guard += 1) {
    const id = currentCandidateQuestionIdV3(clean)!;
    const authored = final.answers[id];
    if (authored === undefined) { clean = answer(clean, "tab-clean"); continue; }
    const replay = submitCandidateAnswerV3(clean, id, authored, "tab-clean", next());
    assert.equal(replay.ok, true, `clean replay accepts ${id}`);
    if (replay.ok) clean = replay.session;
  }
  assert.notEqual(clean.status, "in_progress");
  const second = completeCandidateSessionV3(clean, "tab-clean", next())!;
  const replay = runCandidateDiagnosticPipelineV3(final.answers);
  assert.equal(first.result.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.deepEqual(first.result, replay);
  assert.equal(second.result.engineIdentity, first.result.engineIdentity);
  assert.equal(first.session.status, "completed");
});

test("ACT-01: result is rebuilt, never stored as session authority", () => {
  const final = drive(make());
  const completed = completeCandidateSessionV3(final, final.writerId, next())!;
  const snapshot = JSON.parse(JSON.stringify(completed.session));
  assert.equal("result" in snapshot, false);
  assert.equal(snapshot.status, "completed");
  assert.deepEqual(runCandidateDiagnosticPipelineV3(snapshot.answers), runCandidateDiagnosticPipelineV3(snapshot.answers));
});

test("ACT-01: cross-tab stale writes fail closed and clear never touches legacy storage", () => {
  const storage = new MemoryStorage();
  storage.setItem("vecidya.diagnostic.v3.session.2", "legacy-preserved");
  const firstStore = new CandidateSessionStoreV3(storage);
  const secondStore = new CandidateSessionStoreV3(storage);
  const original = make();
  assert.equal(firstStore.write(original), "written");
  const first = answer(original, "tab-a");
  assert.equal(firstStore.write(first), "written");
  const competing = answer(original, "tab-b");
  assert.equal(secondStore.write(competing), "conflict");
  firstStore.clear();
  assert.equal(storage.getItem("vecidya.diagnostic.v3.session.2"), "legacy-preserved");
});
