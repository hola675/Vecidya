import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  submitExtensionConsentV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  buildDiagnosticV9LocalDraftEnvelope,
  DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS,
  parseDiagnosticV9LocalDraft,
} from "../../../app/features/diagnostic/v9/local-draft";
import { DiagnosticV9LocalDraftStore, type DiagnosticV9StorageLike } from "../../../app/features/diagnostic/v9/local-draft.client";
import { V9_ABSOLUTE_INTERACTION_LIMIT } from "../../../app/features/diagnostic/v9/route-budget";

const NOW = 1_900_000_000_000;
const bank = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((item) => [item.id, item]));

function createSession(now = NOW) {
  return createCandidateSessionV9Prototype({ sessionId: "draft-1", writerId: "tab-a", now });
}

class MemoryStorage implements DiagnosticV9StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

test("creates and restores the canonical V9 session from the versioned local envelope", () => {
  const session = createSession();
  const envelope = buildDiagnosticV9LocalDraftEnvelope(session);
  assert.equal(envelope?.storageVersion, 1);
  assert.deepEqual(parseDiagnosticV9LocalDraft(JSON.stringify(envelope), NOW), { status: "found", envelope });
});

test("TTL is derived from updatedAt; exact seven days is valid and older drafts expire", () => {
  const envelope = buildDiagnosticV9LocalDraftEnvelope(createSession())!;
  assert.equal(DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS, 7 * 24 * 60 * 60 * 1000);
  assert.equal(parseDiagnosticV9LocalDraft(JSON.stringify(envelope), NOW + DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS).status, "found");
  assert.equal(parseDiagnosticV9LocalDraft(JSON.stringify(envelope), NOW + DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS + 1).status, "expired");
});

test("reads do not renew the TTL and only a valid revision write updates updatedAt", async () => {
  const storage = new MemoryStorage();
  const store = new DiagnosticV9LocalDraftStore(storage);
  const initial = createSession();
  await store.write(initial);
  const beforeRead = storage.getItem("vecidya.diagnostic.v9.local-draft.1");
  store.readResult(NOW + 1000);
  assert.equal(storage.getItem("vecidya.diagnostic.v9.local-draft.1"), beforeRead);
  const id = currentCandidateQuestionIdV9(initial)!;
  const question = bank.get(id)!;
  const neutral = question.options.find((option) => option.kind === "unknown")!;
  const next = submitCandidateAnswerV9Prototype(initial, id, question.type === "multi" ? [neutral.value] : neutral.value, initial.writerId, NOW + 2000);
  assert.equal(next.ok, true);
  if (!next.ok) return;
  const written = await store.write(next.session);
  assert.equal(written.status, "written");
  assert.equal(store.readResult(NOW + 2000).status, "found");
  if (written.status === "written") assert.equal(written.envelope.session.updatedAt, NOW + 2000);
});

test("corrupt JSON, incompatible storage/schema/bank/engine/replay and tampered transcript fail closed", () => {
  const session = createSession();
  const envelope = buildDiagnosticV9LocalDraftEnvelope(session)!;
  assert.equal(parseDiagnosticV9LocalDraft("{", NOW).status, "invalid");
  assert.equal(parseDiagnosticV9LocalDraft(JSON.stringify({ ...envelope, storageVersion: 2 }), NOW).status, "invalid");
  for (const field of ["schemaVersion", "questionBankIdentity", "engineIdentity", "replayVersion"] as const) {
    assert.equal(parseDiagnosticV9LocalDraft(JSON.stringify({ ...envelope, session: { ...session, [field]: "incompatible" } }), NOW).status, "invalid", field);
  }
  assert.equal(parseDiagnosticV9LocalDraft(JSON.stringify({ ...envelope, session: { ...session, replayTranscript: [{ kind: "answer", questionId: "q2_entity", value: "tampered", mode: "answer" }] } }), NOW).status, "invalid");
});

test("storage failures keep the session in memory and report unavailable recovery", async () => {
  const unavailable: DiagnosticV9StorageLike = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  const store = new DiagnosticV9LocalDraftStore(unavailable);
  assert.equal(store.readResult(NOW).status, "unavailable");
  const session = createSession();
  const saved = await store.write(session);
  assert.equal(saved.status, "written");
  if (saved.status === "written") assert.equal(saved.persistence, "memory");
  assert.equal(store.readResult(NOW).status, "found");
  assert.equal(await store.clear(), "unavailable");
});

test("revision writes are idempotent and a stale cross-tab revision cannot overwrite the latest", async () => {
  const shared = new MemoryStorage();
  const tabA = new DiagnosticV9LocalDraftStore(shared);
  const tabB = new DiagnosticV9LocalDraftStore(shared);
  const initial = createSession();
  await tabA.write(initial);
  const id = currentCandidateQuestionIdV9(initial)!;
  const question = bank.get(id)!;
  const neutral = question.options.find((option) => option.kind === "unknown")!;
  const advanced = submitCandidateAnswerV9Prototype(initial, id, question.type === "multi" ? [neutral.value] : neutral.value, initial.writerId, NOW + 1);
  assert.equal(advanced.ok, true);
  if (!advanced.ok) return;
  assert.equal((await tabA.write(advanced.session)).status, "written");
  assert.equal((await tabA.write(advanced.session)).status, "idempotent");
  const conflict = await tabB.write(initial);
  assert.equal(conflict.status, "conflict");
  if (conflict.status === "conflict") assert.equal(conflict.latest.session.revision, advanced.session.revision);
});

test("clear removes only the local draft key and completed sessions are rejected", async () => {
  const storage = new MemoryStorage();
  storage.setItem("other-product", "preserve");
  const store = new DiagnosticV9LocalDraftStore(storage);
  await store.write(createSession());
  assert.equal(await store.clear(), "cleared");
  assert.equal(store.readResult(NOW).status, "empty");
  assert.equal(storage.getItem("other-product"), "preserve");
  const completed = { ...createSession(), status: "completed" } as CandidateSessionV9Prototype;
  assert.equal(buildDiagnosticV9LocalDraftEnvelope(completed), null);
  assert.equal((await store.write(completed)).status, "invalid");
});

test("extension consent and the 24+5 hard cap stay on the canonical prototype session", () => {
  const seed = createSession();
  const pending = {
    ...seed,
    interactionCount: 24,
    extensionConsent: "pending" as const,
    extensionOfferedAtInteraction: 24,
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_operational_status: "operating" },
    answeredQuestionIds: ["q2_entity", "q2_has_customers", "q2_operational_status"],
    queue: [],
  };
  const accepted = submitExtensionConsentV9Prototype(pending, "accepted", pending.writerId, pending.updatedAt + 1);
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  let session = accepted.session;
  for (let turn = 0; turn < 5 && session.status === "in_progress"; turn++) {
    const id = currentCandidateQuestionIdV9(session);
    if (!id) break;
    if (id === "q2_sector") {
      const result = submitClassificationV9Prototype(session, { sector: "food_hospitality", niche: "restaurant" }, session.writerId, session.updatedAt + 1);
      assert.equal(result.ok, true);
      if (result.ok) session = result.session;
      continue;
    }
    const question = bank.get(id)!;
    const neutral = question.options.find((option) => option.kind === "unknown") ?? question.options.find((option) => option.kind === "not_applicable");
    assert.ok(neutral);
    const result = submitCandidateAnswerV9Prototype(session, id, question.type === "multi" ? [neutral.value] : neutral.value, session.writerId, session.updatedAt + 1);
    assert.equal(result.ok, true, id);
    if (result.ok) session = result.session;
  }
  assert.ok(session.interactionCount <= V9_ABSOLUTE_INTERACTION_LIMIT);
  assert.equal(V9_ABSOLUTE_INTERACTION_LIMIT, 29);
});

test("the public start and run routes do not call anonymous identity or D1 run/event APIs", () => {
  const start = readFileSync(new URL("../../../app/routes/diagnostic-v9.tsx", import.meta.url), "utf8");
  const run = readFileSync(new URL("../../../app/routes/diagnostic-v9-run.tsx", import.meta.url), "utf8");
  for (const source of [start, run]) {
    assert.doesNotMatch(source, /anonymous-identity|\/api\/diagnostic\/v9\/runs/);
  }
});
