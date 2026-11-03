import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import {
  DIAGNOSTIC_V9_TRANSIENT_REPLAY_TTL_MS,
  replayDiagnosticV9Transiently,
} from "../../../app/features/diagnostic/v9/transient-replay.server";
import { V9_CURRENT_SCORING_VERSION } from "../../../app/features/diagnostic/v9/scoring-calibration-registry";
import { V9_ABSOLUTE_INTERACTION_LIMIT } from "../../../app/features/diagnostic/v9/route-budget";

const NOW = 1_900_000_000_000;
const bank = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((item) => [item.id, item]));

function finalizableSession(now = NOW): CandidateSessionV9Prototype {
  const explicit: Record<string, string | readonly string[]> = {
    q2_entity: "business", q2_other_staff: "yes", q2_has_customers: "yes",
    q2_operational_status: "operating", q2_monetization: "goods", q2_delivery: ["onsite"],
    q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "explain", q2_friction: "conversion",
    q2_presence_digital_base: "reliable_presence", q2_hospitality_flow_type: "reservation",
  };
  let session = createCandidateSessionV9Prototype({ sessionId: "transient-replay", writerId: "test", now });
  for (let turn = 0; turn < 29 && session.status === "in_progress"; turn++) {
    const id = currentCandidateQuestionIdV9(session);
    assert.ok(id);
    if (id === "q2_sector") {
      const result = submitClassificationV9Prototype(session, { sector: "food_hospitality", niche: "restaurant" }, "test", now + turn + 1);
      assert.equal(result.ok, true);
      if (result.ok) session = result.session;
      continue;
    }
    const question = bank.get(id);
    assert.ok(question);
    const neutral = question.options.find((option) => option.kind === "unknown") ?? question.options.find((option) => option.kind === "not_applicable");
    assert.ok(explicit[id] !== undefined || neutral, `No replay fixture answer for ${id}`);
    const answer = explicit[id] ?? (question.type === "multi" ? [neutral!.value] : neutral!.value);
    const result = submitCandidateAnswerV9Prototype(session, id, answer, "test", now + turn + 1);
    assert.equal(result.ok, true, id);
    if (result.ok) session = result.session;
  }
  assert.equal(session.status, "completing");
  assert.equal(session.queue.length, 0);
  return session;
}

test("replays a valid finalizable V9 session authoritatively without returning client-supplied scores", () => {
  const result = replayDiagnosticV9Transiently({ scoringVersion: V9_CURRENT_SCORING_VERSION, session: finalizableSession() }, NOW + 1000);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.core.identity.scoringVersion, V9_CURRENT_SCORING_VERSION);
    assert.ok(result.core.interactionCount <= V9_ABSOLUTE_INTERACTION_LIMIT);
    assert.equal("score" in result, false);
  }
});

test("server rejects a finalizable session older than the local seven-day draft TTL", () => {
  const session = finalizableSession();
  const result = replayDiagnosticV9Transiently(
    { scoringVersion: V9_CURRENT_SCORING_VERSION, session },
    session.updatedAt + DIAGNOSTIC_V9_TRANSIENT_REPLAY_TTL_MS + 1,
  );
  assert.deepEqual(result, { ok: false, reason: "expired" });
});

test("rejects transcript tampering and unknown scoring versions fail closed", () => {
  const session = finalizableSession();
  const tampered = { ...session, replayTranscript: [...session.replayTranscript, { kind: "answer", questionId: "q2_entity", value: "tampered", mode: "answer" }] };
  assert.deepEqual(replayDiagnosticV9Transiently({ scoringVersion: V9_CURRENT_SCORING_VERSION, session: tampered }, NOW + 1000), { ok: false, reason: "session" });
  assert.deepEqual(replayDiagnosticV9Transiently({ scoringVersion: "unknown-v999", session }, NOW + 1000), { ok: false, reason: "scoring_version" });
});

test("uses the 24+5 hard cap and remains callable without a D1 binding", () => {
  const session = finalizableSession();
  assert.ok(session.interactionCount <= 29);
  assert.equal(V9_ABSOLUTE_INTERACTION_LIMIT, 29);
  const unavailableD1 = { prepare() { throw new Error("D1 unavailable"); } };
  assert.equal(typeof unavailableD1.prepare, "function");
  const result = replayDiagnosticV9Transiently({ scoringVersion: V9_CURRENT_SCORING_VERSION, session }, NOW + 1000);
  assert.equal(result.ok, true);
});

test("failure results do not expose raw answers or require a persistence/logging module", () => {
  const moduleSource = readFileSync(new URL("../../../app/features/diagnostic/v9/transient-replay.server.ts", import.meta.url), "utf8");
  assert.doesNotMatch(moduleSource, /D1Database|\.prepare\(|console\.|logger\.|diagnostic-(?:audit|identity)-repository/);
  const sentinel = "raw-answer-secret-sentinel";
  const result = replayDiagnosticV9Transiently({
    scoringVersion: V9_CURRENT_SCORING_VERSION,
    session: { ...finalizableSession(), answers: { sentinel } },
  }, NOW + 1000);
  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(result).includes(sentinel), false);
});
