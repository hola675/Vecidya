import assert from "node:assert/strict";
import { test } from "node:test";

import { validateAnalyticsBatch } from "../../../server/diagnostic/analytics-validation.server.ts";

const validEvent = { eventUuid: "8e6f2b3a-8b1e-4c1a-9f2e-1a2b3c4d5e6f", eventType: "QUESTION_SHOWN", questionId: "profile", sectionId: "contexto", questionsSeen: 1, questionsAnswered: 0, applicableQuestions: 5 };

test("accepts a well-formed batch", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [validEvent] });
  assert.equal(result.ok, true);
});

test("rejects an unknown event type (deny by default)", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [{ ...validEvent, eventType: "DELETE_ALL_DATA" }] });
  assert.equal(result.ok, false);
});

test("rejects a batch above MAX_ANALYTICS_EVENTS_PER_BATCH", () => {
  const events = Array.from({ length: 26 }, (_, index) => ({ ...validEvent, eventUuid: `${validEvent.eventUuid}-${index}` }));
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events });
  assert.equal(result.ok, false);
});

test("rejects a schema version mismatch", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 99, events: [validEvent] });
  assert.equal(result.ok, false);
});

test("rejects an event carrying a raw answer value or writeToken (unknown fields, mutation B/C)", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [{ ...validEvent, answerValue: "yes", writeToken: "abc" }] });
  assert.equal(result.ok, false);
});

test("rejects a non-existent questionId", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [{ ...validEvent, questionId: "not_a_real_question" }] });
  assert.equal(result.ok, false);
});

test("rejects an oversized routeSignature string", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [{ ...validEvent, routeSignature: "a".repeat(200) }] });
  assert.equal(result.ok, false);
});

test("accepts null questionId/sectionId/answerKind (not every event type carries them)", () => {
  const event = { eventUuid: validEvent.eventUuid, eventType: "SAME_BROWSER_RESUMED", questionId: null, sectionId: null };
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [event] });
  assert.equal(result.ok, true);
});

test("rejects a non-array events field", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: "not-an-array" });
  assert.equal(result.ok, false);
});

test("rejects a malformed eventUuid", () => {
  const result = validateAnalyticsBatch({ analyticsSchemaVersion: 1, events: [{ ...validEvent, eventUuid: "not-a-uuid" }] });
  assert.equal(result.ok, false);
});
