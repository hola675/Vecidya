import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  QA03B_V9_ANSWER_SCHEMA_ID,
  QA03B_V9_ENGINE_ID,
  QA03B_V9_QUESTION_BANK_ID,
  QA03B_V9_REPLAY_VERSION,
  QA03B_V9_SESSION_KEY,
  QA03B_V9_SESSION_SCHEMA,
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import {
  QA03B_V9_CORE_RESULT_IDENTITY,
  QA03B_V9_WORKER_TTL_MS,
  replayQa03bSessionV9Core,
} from "../../../app/features/diagnostic/qa03b/worker-replay-v9.server";
import { replayDiagnosticAuditEventsV9, type V9StoredAuditEvent } from "../../../app/features/diagnostic/qa03b/v9-audit-replay.server";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-scoring";
import { CANDIDATE_RESULT_IDENTITY_V3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { ANSWER_SCHEMA_ID, QUESTION_BANK_ID, SESSION_KEY, SESSION_SCHEMA, WORKER_REPLAY_VERSION } from "../../../app/features/diagnostic/qa03b/contract";
import { createCandidateSessionV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";

const NOW = 1_900_000_000_000;
const byId = new Map(bank77.map((q) => [q.id, q]));

function completingV9(now = NOW): CandidateSessionV9Prototype {
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
    q2_presence_digital_base: "reliable_presence",
    q2_hospitality_flow_type: "reservation",
  };

  let session = createCandidateSessionV9Prototype({
    sessionId: "qa03b-v9-worker-fixture",
    writerId: "test",
    now,
  });
  for (let turn = 0; turn < 24 && session.status === "in_progress"; turn++) {
    const id = currentCandidateQuestionIdV9(session);
    assert.ok(id, "V9 must expose a next question while in progress");

    if (id === "q2_sector") {
      const submitted = submitClassificationV9Prototype(
        session,
        { sector: "food_hospitality", niche: "restaurant" },
        "test",
        now + turn + 1,
      );
      assert.equal(submitted.ok, true);
      if (!submitted.ok) throw new Error(submitted.reason);
      session = submitted.session;
      continue;
    }

    const question = byId.get(id);
    assert.ok(question, id);
    let value = explicit[id];
    if (value === undefined) {
      const neutral = question.options.find((option) => option.kind === "unknown")
        ?? question.options.find((option) => option.kind === "not_applicable");
      assert.ok(neutral, `fixture requires a neutral answer for ${id}`);
      value = question.type === "multi" ? [neutral.value] : neutral.value;
    }
    const submitted = submitCandidateAnswerV9Prototype(session, id, value, "test", now + turn + 1);
    assert.equal(submitted.ok, true, id);
    if (!submitted.ok) throw new Error(submitted.reason);
    session = submitted.session;
  }
  assert.equal(session.status, "completing");
  assert.ok(session.terminalReason);
  assert.equal(session.queue.length, 0);
  assert.ok(session.interactionCount <= 24);
  return session;
}

function envelope(session: CandidateSessionV9Prototype) {
  return {
    replayVersion: QA03B_V9_REPLAY_VERSION,
    engineIdentity: QA03B_V9_ENGINE_ID,
    answerSchema: QA03B_V9_ANSWER_SCHEMA_ID,
    questionBank: QA03B_V9_QUESTION_BANK_ID,
    sessionSchema: QA03B_V9_SESSION_SCHEMA,
    sessionKey: QA03B_V9_SESSION_KEY,
    session,
  };
}

test("V9 Worker core replay authoritatively rebuilds route, interaction budget, niche context and scoring", () => {
  const session = completingV9();
  const replay = replayQa03bSessionV9Core(envelope(session), NOW + 100);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;

  assert.equal(replay.session.status, "completed");
  assert.equal(replay.session.interactionCount, session.interactionCount);
  assert.deepEqual(replay.session.answers, session.answers);
  assert.deepEqual(replay.session.answeredQuestionIds, session.answeredQuestionIds);
  assert.deepEqual(replay.core.identity, QA03B_V9_CORE_RESULT_IDENTITY);
  assert.equal(replay.core.interactionCount, session.interactionCount);
  assert.equal(replay.core.context.niche.status, "resolved");
  if (replay.core.context.niche.status === "resolved") {
    assert.equal(replay.core.context.niche.value, "restaurant");
  }
  assert.equal(replay.core.dimensions.length, 8);

  const expected = scoreCandidateContextualDimensionsV3({ answers: session.answers }, bank77);
  assert.deepEqual(replay.core.dimensions, expected.dimensions);
});

test("V9 Worker rejects V8 and hybrid identity envelopes", () => {
  const v9 = envelope(completingV9());
  const v8Session = createCandidateSessionV3({ sessionId: "v8", writerId: "test", now: NOW });
  const v8 = {
    replayVersion: WORKER_REPLAY_VERSION,
    engineIdentity: CANDIDATE_RESULT_IDENTITY_V3,
    answerSchema: ANSWER_SCHEMA_ID,
    questionBank: QUESTION_BANK_ID,
    sessionSchema: SESSION_SCHEMA,
    sessionKey: SESSION_KEY,
    session: v8Session,
  };
  assert.equal(replayQa03bSessionV9Core(v8, NOW + 100).ok, false);

  const hybrids = [
    { ...v9, questionBank: QUESTION_BANK_ID },
    { ...v9, answerSchema: ANSWER_SCHEMA_ID },
    { ...v9, sessionSchema: SESSION_SCHEMA },
    { ...v9, sessionKey: SESSION_KEY },
    { ...v9, engineIdentity: CANDIDATE_RESULT_IDENTITY_V3 },
    { ...v9, replayVersion: WORKER_REPLAY_VERSION },
    { ...v9, extra: true },
  ];
  for (const payload of hybrids) assert.equal(replayQa03bSessionV9Core(payload, NOW + 100).ok, false);
});

test("V9 Worker fails closed when transcript, interaction count or answer state is tampered", () => {
  const session = completingV9();
  const transcript = [...session.replayTranscript];
  const first = transcript[0]!;
  const invalid = [
    { ...session, interactionCount: session.interactionCount + 1 },
    { ...session, replayTranscript: transcript.slice(1) },
    { ...session, replayTranscript: [transcript[1]!, first, ...transcript.slice(2)] },
    { ...session, answers: { ...session.answers, q2_sector: "automotive" } },
    { ...session, answeredQuestionIds: session.answeredQuestionIds.slice(1) },
    { ...session, queue: ["q2_entity"] },
  ];
  for (const candidate of invalid) {
    assert.equal(replayQa03bSessionV9Core(envelope(candidate as CandidateSessionV9Prototype), NOW + 100).ok, false);
  }
});

test("V9 Worker rejects expired and incomplete sessions", () => {
  const old = completingV9(NOW - QA03B_V9_WORKER_TTL_MS - 1_000);
  assert.deepEqual(replayQa03bSessionV9Core(envelope(old), NOW), { ok: false, reason: "expired" });

  const incomplete = createCandidateSessionV9Prototype({ sessionId: "incomplete", writerId: "test", now: NOW });
  assert.deepEqual(replayQa03bSessionV9Core(envelope(incomplete), NOW + 100), { ok: false, reason: "incomplete" });
});

test("V9 Worker core result deliberately contains no commercial, report or personal-data projection", () => {
  const replay = replayQa03bSessionV9Core(envelope(completingV9()), NOW + 100);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const serialized = JSON.stringify(replay.core);
  assert.equal(Object.hasOwn(replay.core, "commercial"), false);
  assert.equal(Object.hasOwn(replay.core, "report"), false);
  assert.equal(Object.hasOwn(replay.core, "email"), false);
  assert.doesNotMatch(serialized, /"email"|"businessName"|"responsibleName"/);
  assert.match(serialized, /q2_food_menu_visibility@v1/, "versioned evidence IDs are legitimate and are not personal data");
  assert.equal(replay.core.identity.resultScope, "diagnostic-core-only-v1");
});


test("V9 D1 audit replay reconstructs the same authoritative result as the session transcript", () => {
  const session = completingV9();
  const events: V9StoredAuditEvent[] = session.replayTranscript.map((event, index) => ({
    seq: index + 1,
    event_id: `event-${index + 1}`,
    kind: event.kind === "classification" ? event.classification.kind : "answer",
    payload_json: JSON.stringify(event.kind === "classification" ? { ...event.classification, mode: event.mode } : event),
    occurred_at: new Date(NOW + index + 1).toISOString(),
    schema_version: 1,
    actor_type: "client",
  }));
  const replayed = replayDiagnosticAuditEventsV9({
    runId: session.sessionId,
    startedAt: session.startedAt,
    events,
    now: NOW + 100,
  });
  const direct = replayQa03bSessionV9Core(envelope(session), NOW + 100);
  assert.equal(replayed.ok, true);
  assert.equal(direct.ok, true);
  if (!replayed.ok || !direct.ok) return;
  assert.deepEqual(replayed.core, direct.core);
  assert.deepEqual(replayed.session.answers, direct.session.answers);
  assert.equal(replayed.session.interactionCount, direct.session.interactionCount);
});

test("V9 D1 audit replay fails closed on sequence gaps, actor changes and malformed payloads", () => {
  const session = completingV9();
  const events: V9StoredAuditEvent[] = session.replayTranscript.map((event, index) => ({
    seq: index + 1,
    event_id: `event-${index + 1}`,
    kind: event.kind === "classification" ? event.classification.kind : "answer",
    payload_json: JSON.stringify(event.kind === "classification" ? { ...event.classification, mode: event.mode } : event),
    occurred_at: new Date(NOW + index + 1).toISOString(),
    schema_version: 1,
    actor_type: "client",
  }));
  const base = { runId: session.sessionId, startedAt: session.startedAt, now: NOW + 100 };
  assert.deepEqual(replayDiagnosticAuditEventsV9({ ...base, events: events.map((event, index) => index === 0 ? { ...event, seq: 2 } : event) }), { ok: false, reason: "route" });
  assert.deepEqual(replayDiagnosticAuditEventsV9({ ...base, events: events.map((event, index) => index === 0 ? { ...event, actor_type: "operator" } : event) }), { ok: false, reason: "route" });
  assert.deepEqual(replayDiagnosticAuditEventsV9({ ...base, events: events.map((event, index) => index === 0 ? { ...event, payload_json: "not-json" } : event) }), { ok: false, reason: "session" });
});
