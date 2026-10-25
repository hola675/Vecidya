import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicBank } from "../../../app/features/diagnostic/qa03b/bank";
import {
  QA03B_V9_ENGINE_ID,
  QA03B_V9_QUESTION_BANK_ID,
  QA03B_V9_REPLAY_VERSION,
  QA03B_V9_SESSION_KEY,
  QA03B_V9_SESSION_SCHEMA,
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  editClassificationV9Prototype,
  parseCandidateSessionV9Prototype,
  replayCandidateTranscriptV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  CANDIDATE_SESSION_STORAGE_KEY_V3,
  createCandidateSessionV3,
  parseCandidateSessionV3,
} from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import { QUESTION_BANK_ID, SESSION_SCHEMA } from "../../../app/features/diagnostic/qa03b/contract";
import { buildCandidateQuestionPlanV9Prototype } from "../../../app/features/diagnostic/qa03b/v9-classification-bundle";

const byId = new Map(bank77.map((q) => [q.id, q]));

function advanceToSector(session: CandidateSessionV9Prototype, start = 10_000): CandidateSessionV9Prototype {
  const explicit: Record<string, string | readonly string[]> = {
    q2_entity: "business",
    q2_other_staff: "yes",
    q2_has_customers: "yes",
    q2_operational_status: "operating",
    q2_monetization: "goods",
    q2_delivery: ["onsite"],
    q2_customer_buyer: "b2c",
    q2_customer_reach: "local",
    q2_goal: "explain",
    q2_friction: "conversion",
  };
  let current = session;
  for (let index = 0; index < 12; index++) {
    const id = currentCandidateQuestionIdV9(current);
    assert.ok(id, "V9 session must still have a current question");
    if (id === "q2_sector") return current;
    const question = byId.get(id);
    assert.ok(question, id);
    const value = explicit[id] ?? (() => {
      const neutral = question.options.find((option) => option.kind === "unknown");
      assert.ok(neutral, `No deterministic test response for ${id}`);
      return question.type === "multi" ? [neutral.value] : neutral.value;
    })();
    const submitted = submitCandidateAnswerV9Prototype(current, id, value, "test", start + index);
    assert.equal(submitted.ok, true, id);
    if (!submitted.ok) throw new Error(submitted.reason);
    current = submitted.session;
  }
  throw new Error("q2_sector was not reached in 12 interactions");
}

test("V9 identity, schema and storage are separate from the frozen public V8 contract", () => {
  assert.equal(publicBank.length, 45);
  assert.equal(bank77.length, 77);
  assert.equal(QUESTION_BANK_ID, "reviewed-evidence-v8");
  assert.equal(SESSION_SCHEMA, 8);
  assert.equal(CANDIDATE_SESSION_STORAGE_KEY_V3, "vecidya.diagnostic.v3.candidate.session.8");

  assert.equal(QA03B_V9_SESSION_SCHEMA, 9);
  assert.equal(QA03B_V9_SESSION_KEY, "vecidya.diagnostic.v3.candidate.session.9");
  assert.notEqual(QA03B_V9_QUESTION_BANK_ID, QUESTION_BANK_ID);
  assert.notEqual(QA03B_V9_ENGINE_ID, "diag-v3-candidate-global-quartiles-v5");
  assert.equal(QA03B_V9_REPLAY_VERSION, "qa03b-worker-replay-v7-candidate");
});

test("sector and specialty consume one historical interaction while storing two explicit answers", () => {
  let session = createCandidateSessionV9Prototype({ sessionId: "v9-classification", writerId: "test", now: 1_000 });
  session = advanceToSector(session, 2_000);
  const before = session.interactionCount;
  assert.equal(currentCandidateQuestionIdV9(session), "q2_sector");

  const result = submitClassificationV9Prototype(
    session,
    { sector: "food_hospitality", niche: "restaurant" },
    "test",
    3_000,
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.session.interactionCount, before + 1);
  assert.equal(result.session.answers.q2_sector, "food_hospitality");
  assert.equal(result.session.answers.q2_niche_food_hospitality, "restaurant");
  assert.ok(result.session.answeredQuestionIds.includes("q2_sector"));
  assert.ok(result.session.answeredQuestionIds.includes("q2_niche_food_hospitality"));
  assert.equal(result.session.replayTranscript.at(-1)?.kind, "classification");

  const planned = buildCandidateQuestionPlanV9Prototype(
    result.session.answers,
    result.session.replayTranscript.flatMap((event) => event.kind === "classification" ? [event.classification] : []),
    result.session.interactionCount,
  );
  assert.equal(planned.visibleInteractionCount, result.session.interactionCount);
  assert.ok(planned.plan.routeLength <= 24);
});

test("editing classification changes both answers atomically without consuming or refunding historical effort", () => {
  let session = advanceToSector(createCandidateSessionV9Prototype({
    sessionId: "v9-edit",
    writerId: "test",
    now: 5_000,
  }), 6_000);
  const submitted = submitClassificationV9Prototype(session, {
    sector: "food_hospitality",
    niche: "restaurant",
  }, "test", 7_000);
  assert.equal(submitted.ok, true);
  if (!submitted.ok) return;
  session = submitted.session;
  const cost = session.interactionCount;

  const edited = editClassificationV9Prototype(session, {
    sector: "b2b_services",
    niche: "marketing_agency",
  }, "test", 8_000);
  assert.equal(edited.ok, true);
  if (!edited.ok) return;

  assert.equal(edited.session.interactionCount, cost);
  assert.equal(edited.session.answers.q2_sector, "b2b_services");
  assert.equal(edited.session.answers.q2_niche_b2b_services, "marketing_agency");
  assert.equal(edited.session.answers.q2_niche_food_hospitality, undefined);
  assert.ok(!edited.session.answeredQuestionIds.includes("q2_niche_food_hospitality"));
  assert.ok(edited.session.answeredQuestionIds.includes("q2_niche_b2b_services"));
  assert.equal(edited.session.replayTranscript.at(-1)?.mode, "edit");
});

test("historical interaction cost is never refunded when active answers become fewer", () => {
  const active = {
    q2_entity: "business",
    q2_operational_status: "operating",
    q2_has_customers: "yes",
  };
  const planned = buildCandidateQuestionPlanV9Prototype(active, [], 24);
  assert.equal(planned.visibleInteractionCount, 24);
  assert.equal(planned.plan.completion.hardCapReached, true);
  assert.equal(planned.plan.routeLength, 24);
  assert.equal(planned.plan.nextQuestionId, undefined);
});

test("V9 transcript replay reproduces answers and interaction count exactly", () => {
  let session = advanceToSector(createCandidateSessionV9Prototype({
    sessionId: "v9-replay",
    writerId: "test",
    now: 9_000,
  }), 10_000);
  const submitted = submitClassificationV9Prototype(session, {
    sector: "food_hospitality",
    niche: "restaurant",
  }, "test", 11_000);
  assert.equal(submitted.ok, true);
  if (!submitted.ok) return;
  session = submitted.session;

  const replayed = replayCandidateTranscriptV9(session.replayTranscript);
  assert.ok(replayed);
  assert.deepEqual(replayed?.answers, session.answers);
  assert.equal(replayed?.interactionCount, session.interactionCount);
});

test("V9 parser round-trips valid session and fails closed on tampering", () => {
  let session = advanceToSector(createCandidateSessionV9Prototype({
    sessionId: "v9-parser",
    writerId: "test",
    now: 12_000,
  }), 13_000);
  const submitted = submitClassificationV9Prototype(session, {
    sector: "food_hospitality",
    niche: "restaurant",
  }, "test", 14_000);
  assert.equal(submitted.ok, true);
  if (!submitted.ok) return;
  session = submitted.session;

  assert.deepEqual(parseCandidateSessionV9Prototype(JSON.stringify(session)), session);
  assert.equal(parseCandidateSessionV9Prototype(JSON.stringify({ ...session, schemaVersion: 8 })), null);
  assert.equal(parseCandidateSessionV9Prototype(JSON.stringify({ ...session, questionBankIdentity: QUESTION_BANK_ID })), null);
  assert.equal(parseCandidateSessionV9Prototype(JSON.stringify({ ...session, interactionCount: 25 })), null);

  const last = session.replayTranscript.at(-1);
  assert.equal(last?.kind, "classification");
  if (last?.kind !== "classification") return;
  const transcript = [
    ...session.replayTranscript.slice(0, -1),
    { ...last, classification: { ...last.classification, nicheQuestionId: "q2_niche_health_wellness" } },
  ];
  assert.equal(parseCandidateSessionV9Prototype(JSON.stringify({ ...session, replayTranscript: transcript })), null);
});

test("V8 and V9 parsers reject each other's sessions", () => {
  const v8 = createCandidateSessionV3({ sessionId: "v8", writerId: "test", now: 20_000 });
  const v9 = createCandidateSessionV9Prototype({ sessionId: "v9", writerId: "test", now: 20_000 });
  assert.equal(parseCandidateSessionV9Prototype(JSON.stringify(v8)), null);
  assert.equal(parseCandidateSessionV3(JSON.stringify(v9), 20_000), null);
});
