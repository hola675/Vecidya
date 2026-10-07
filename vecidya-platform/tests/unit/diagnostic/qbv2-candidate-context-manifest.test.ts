import test from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import {
  CONTEXT_ONLY_QUESTION_IDS_V3,
  LATER_REVIEW_QUESTION_IDS_V3,
  CONTEXT_ONLY_MANIFEST_V3,
  LATER_REVIEW_MANIFEST_V3,
  UNUSED_ANSWER_DISPOSITIONS_V3,
} from "./qbv2-candidate-context-manifest";

/**
 * DIAG-V3-R7-A.1 hard completeness gate. Fails if a CONTEXT_ONLY/LATER_REVIEW id has no manifest entry,
 * if a live `unusedAuthoredAnswers` instance has no disposition, or if an unknown question appears in
 * either manifest. This is QA-bookkeeping only — it asserts no calibration and changes no production code.
 */

const PENDING_IDS = new Set(BANK.filter((q) => q.evidenceMigration === "pending").map((q) => q.id));
const KNOWN_IDS = new Set(BANK.map((q) => q.id));

test("R7-A.1: 15 CONTEXT_ONLY + 2 LATER_REVIEW = 17 pending, exactly matching the R3-FINAL ledger", () => {
  assert.equal(CONTEXT_ONLY_QUESTION_IDS_V3.length, 15);
  assert.equal(LATER_REVIEW_QUESTION_IDS_V3.length, 2);
  const declared = new Set([...CONTEXT_ONLY_QUESTION_IDS_V3, ...LATER_REVIEW_QUESTION_IDS_V3]);
  assert.equal(declared.size, 17);
  assert.deepEqual(declared, PENDING_IDS, "the manifest's 17 pending ids must exactly equal the R3-FINAL pending ledger — no reclassification");
});

test("R7-A.1: every CONTEXT_ONLY id has exactly one explicit manifest disposition", () => {
  assert.equal(CONTEXT_ONLY_MANIFEST_V3.length, 15, "15/15 context-only ids must be explicitly classified");
  for (const id of CONTEXT_ONLY_QUESTION_IDS_V3) {
    assert.ok(KNOWN_IDS.has(id), `unknown question in CONTEXT_ONLY manifest: ${id}`);
    const row = CONTEXT_ONLY_MANIFEST_V3.find((r) => r.questionId === id);
    assert.ok(row, `missing manifest entry for ${id}`);
    assert.ok(["EXERCISED_AS_CONTEXT", "ROUTING_ONLY", "NOT_REACHED_BY_CANONICAL_SET"].includes(row!.disposition), `invalid disposition for ${id}`);
  }
});

test("R7-A.1: every LATER_REVIEW id has exactly one explicit manifest disposition", () => {
  assert.equal(LATER_REVIEW_MANIFEST_V3.length, 2, "2/2 later-review ids must be explicitly classified");
  for (const id of LATER_REVIEW_QUESTION_IDS_V3) {
    assert.ok(KNOWN_IDS.has(id), `unknown question in LATER_REVIEW manifest: ${id}`);
    const row = LATER_REVIEW_MANIFEST_V3.find((r) => r.questionId === id);
    assert.ok(row, `missing manifest entry for ${id}`);
  }
});

test("R7-A.1: q2_demand_trend and q2_capacity_signal are eligible everywhere authored, never selected, never forced", () => {
  for (const caseDef of CANONICAL_CASES_V3) {
    const route = runCanonicalRouteV3(caseDef);
    for (const id of ["q2_demand_trend", "q2_capacity_signal"]) {
      if (!Object.prototype.hasOwnProperty.call(caseDef.answerScript, id)) continue;
      assert.ok(route.plan.eligibleQuestionIds.includes(id), `${caseDef.id}/${id}: must remain eligible, never ineligible by accident`);
      assert.equal(route.finalAnswers[id], undefined, `${caseDef.id}/${id}: must never be forced into an active answer merely for coverage`);
    }
  }
});

test("R7-A.1: 100% of live unusedAuthoredAnswers instances carry an explicit static disposition, zero unclassified, zero stale", () => {
  const dispositionMap = new Map(UNUSED_ANSWER_DISPOSITIONS_V3.map((e) => [`${e.caseId}:${e.questionId}`, e]));
  const liveKeys = new Set<string>();
  let totalAuthored = 0;
  let totalAsked = 0;
  let totalUnused = 0;

  for (const caseDef of CANONICAL_CASES_V3) {
    const route = runCanonicalRouteV3(caseDef);
    totalAuthored += Object.keys(caseDef.answerScript).length;
    totalAsked += route.asked.length;
    totalUnused += route.unusedAuthoredAnswers.length;
    for (const questionId of route.unusedAuthoredAnswers) {
      const key = `${caseDef.id}:${questionId}`;
      liveKeys.add(key);
      assert.ok(KNOWN_IDS.has(questionId), `unknown question in unusedAuthoredAnswers: ${questionId}`);
      const entry = dispositionMap.get(key);
      assert.ok(entry, `unclassified unused authored answer: ${caseDef.id}/${questionId} has no disposition in UNUSED_ANSWER_DISPOSITIONS_V3`);
    }
  }

  for (const key of dispositionMap.keys()) {
    assert.ok(liveKeys.has(key), `stale disposition entry no longer reflects a live unused-authored answer: ${key}`);
  }

  assert.equal(totalAuthored, 416);
  assert.equal(totalAsked, 353);
  assert.equal(totalUnused, 63);
  assert.equal(UNUSED_ANSWER_DISPOSITIONS_V3.length, 63);
  assert.ok(
    UNUSED_ANSWER_DISPOSITIONS_V3.every((e) => e.disposition !== "FIXTURE_ERROR"),
    "no FIXTURE_ERROR entries may remain after cleanup — confirmed fixture errors must be removed from the fixture, not listed here",
  );
});

test("R7-A.1: the 15+2 manifest stays anchored to the full pending set — no silent drift", () => {
  // The real capability-provenance-leak assertion (pending questions must never appear in recommendation/
  // narrative provenance) lives in qbv2-candidate-canonical-cases.test.ts. This test only guards that this
  // manifest's 15/15 + 2/2 split keeps covering every pending id as the bank evolves.
  assert.equal(CONTEXT_ONLY_QUESTION_IDS_V3.length + LATER_REVIEW_QUESTION_IDS_V3.length, PENDING_IDS.size);
});
