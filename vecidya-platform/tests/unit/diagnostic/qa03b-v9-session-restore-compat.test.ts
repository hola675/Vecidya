import assert from "node:assert/strict";
import test from "node:test";

import { parseSessionV3, DIAGNOSTIC_SESSION_V3_SCHEMA } from "../../../app/features/diagnostic/qbv2-session";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as candidate } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { QA03B_FOOD_MENU_VISIBILITY_V2_PROPOSAL as proposed } from "../../../app/features/diagnostic/qa03b/v9-food-menu-v2-proposal";

const legacy = candidate.find((q) => q.id === proposed.id);
if (!legacy) throw new Error("Missing v1 menu candidate");
const now = 1_800_000_000_000;
const raw = JSON.stringify({
  schemaVersion: DIAGNOSTIC_SESSION_V3_SCHEMA,
  sessionId: "p1e-historical-menu",
  startedAt: now - 2000,
  updatedAt: now - 1000,
  answers: { [legacy.id]: "not_applicable" },
  answeredQuestionIds: [legacy.id],
  queue: [],
  reviewIndex: null,
  routeTrace: [],
  status: "in_progress",
  terminalReason: null,
});

test("P1e: v1 saved menu session parses but ineligible answer is reconciled away", () => {
  const restored = parseSessionV3(raw, now, { bank: [legacy] });
  assert.ok(restored);
  assert.equal(restored.answers[legacy.id], undefined);
  assert.deepEqual(restored.answeredQuestionIds, []);
});

test("P1e: swapping in v2 rejects the old option instead of silently remapping", () => {
  const restored = parseSessionV3(raw, now, { bank: [proposed] });
  assert.equal(restored, null);
});

test("P1e: historical saved payload does not encode a per-answer question version", () => {
  const saved = JSON.parse(raw) as { answers: Record<string, string>; answeredQuestionIds: string[] };
  assert.equal(saved.answers[legacy.id], "not_applicable");
  assert.deepEqual(saved.answeredQuestionIds, [legacy.id]);
  assert.equal(Object.hasOwn(saved, "answerVersions"), false);
});
