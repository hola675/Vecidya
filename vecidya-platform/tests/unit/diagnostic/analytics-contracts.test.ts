import assert from "node:assert/strict";
import { test } from "node:test";

import { ANALYTICS_EVENT_TYPES, ANALYTICS_SCHEMA_VERSION, ANSWER_KINDS, isAnalyticsEventType, isAnswerKind } from "../../../app/features/diagnostic/analytics.ts";

test("current analytics schema version is 1", () => {
  assert.equal(ANALYTICS_SCHEMA_VERSION, 1);
});

test("event type list matches the minimal set from the spec", () => {
  assert.deepEqual(
    [...ANALYTICS_EVENT_TYPES].sort(),
    ["ANSWER_CHANGED", "ANSWER_SUBMITTED", "QUESTION_INVALIDATED", "QUESTION_SHOWN", "SAME_BROWSER_RESUMED", "SAVE_OFFERED", "SECTION_ENTERED"].sort(),
  );
});

test("isAnalyticsEventType rejects unknown values", () => {
  assert.equal(isAnalyticsEventType("QUESTION_SHOWN"), true);
  assert.equal(isAnalyticsEventType("DELETE_EVERYTHING"), false);
  assert.equal(isAnalyticsEventType(42), false);
});

test("answer kinds are exactly answered/unknown/not_applicable", () => {
  assert.deepEqual([...ANSWER_KINDS], ["answered", "unknown", "not_applicable"]);
  assert.equal(isAnswerKind("unknown"), true);
  assert.equal(isAnswerKind("no"), false);
});
