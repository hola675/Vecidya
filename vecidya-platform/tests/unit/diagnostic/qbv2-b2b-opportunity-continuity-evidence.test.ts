import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { EVIDENCE_MAPPING } from "../../../app/features/diagnostic/qbv2-coverage";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import {
  REVIEWED_B2B_OPPORTUNITY_CONTINUITY_EVIDENCE_V3 as batch,
  REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate,
  REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary,
  REVIEWED_EVIDENCE_V3 as registry,
} from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const pipeline = "q2_b2b_pipeline";
const status = "q2_b2b_status_visibility";
const quote = "q2_service_quote_followup";
const generic = "q2_followup_general_process";
const qualification = "q2_b2b_qualification";
const byId = (id: string, bank: readonly (typeof candidate)[number][] = candidate) => bank.find((question) => question.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const b2b: AnswersV2 = {
  q2_entity: "business", q2_delivery: ["b2b_pipeline"], q2_has_customers: "yes",
  q2_customer_buyer: "b2b", q2_goal: "organize", q2_regularity: "regular",
};

test("R3L atomically migrates only B2B opportunity continuity into the cumulative ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: 21, pending: 17 });
  assert.deepEqual(batch.map(({ questionId }) => questionId), [pipeline]);
  assert.ok(registry.some(({ questionId, questionVersion }) => questionId === pipeline && questionVersion === 2));
  assert.equal(byId(pipeline).version, 2);
  assert.equal(byId(pipeline).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionEvidenceV3(byId(pipeline)), []);
  assert.deepEqual(Object.keys(byId(pipeline).evidenceV3!.dimensions[0]!.answers).sort(), byId(pipeline).options.map(({ value }) => value).sort());
  assert.deepEqual(validateQuestionBankV2(candidate), []);
});

test("R3L maps each explicit opportunity-continuity answer to one direct Relationship observation", () => {
  const expected = [
    ["defined", "established", 0.75],
    ["partial", "partial", 0.5],
    ["informal", "weak", 0.25],
    ["unknown", "uncertainty", null],
  ] as const;
  for (const [answer, state, contribution] of expected) {
    const evidence = derive({ [pipeline]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual(
      [evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution],
      ["relationship_recurrence", "direct", state, contribution],
    );
    assert.equal(evidence[0]!.questionVersion, 2);
    assert.equal(evidence[0]!.migrationIdentity, `${pipeline}@v2`);
    assert.deepEqual(evidence[0]!.answer, [answer]);
  }
  assert.equal(derive({ [pipeline]: "unknown" })[0]!.kind, "uncertainty");
});

test("R3L separates follow-up execution from B2B status visibility in both directions", () => {
  const continuityStrongVisibilityWeak = derive({ [pipeline]: "defined", [status]: "lose_track" });
  assert.deepEqual(continuityStrongVisibilityWeak.map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [pipeline, "relationship_recurrence", "established"],
    [status, "digital_readiness", "weak"],
  ]);

  const continuityWeakVisibilityStrong = derive({ [pipeline]: "informal", [status]: "clear" });
  assert.deepEqual(continuityWeakVisibilityStrong.map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [pipeline, "relationship_recurrence", "weak"],
    [status, "digital_readiness", "established"],
  ]);
  assert.deepEqual(derive({ [pipeline]: "defined", q2_process_systemization: "informal" }).map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [pipeline, "relationship_recurrence", "established"],
    ["q2_process_systemization", "digital_readiness", "weak"],
  ]);
});

test("R3L preserves coexisting specialist routes and excludes generic follow-up in B2B", () => {
  const organizer = resolveEligibleQuestionsV2(b2b, candidate);
  assert.ok(organizer.eligibleQuestionIds.includes(pipeline));
  assert.ok(organizer.eligibleQuestionIds.includes(status));
  assert.ok(!organizer.eligibleQuestionIds.includes(generic));

  const hybrid: AnswersV2 = {
    ...b2b,
    q2_delivery: ["b2b_pipeline", "travels"],
    q2_goal: "opportunities",
  };
  const hybridRoute = resolveEligibleQuestionsV2(hybrid, candidate);
  assert.ok(hybridRoute.eligibleQuestionIds.includes(pipeline));
  assert.ok(hybridRoute.eligibleQuestionIds.includes(quote));
  assert.ok(!hybridRoute.eligibleQuestionIds.includes(generic));

  assert.ok(!resolveEligibleQuestionsV2({ ...b2b, q2_has_customers: "no" }, candidate).eligibleQuestionIds.includes(pipeline));
  assert.ok(!resolveEligibleQuestionsV2({ ...b2b, q2_customer_buyer: "b2c" }, candidate).eligibleQuestionIds.includes(pipeline));
  assert.ok(resolveEligibleQuestionsV2({ ...b2b, q2_customer_buyer: "mixed" }, candidate).eligibleQuestionIds.includes(pipeline));
});

test("R3L pipeline and specific quote follow-up can emit independent source observations", () => {
  const evidence = derive({ [pipeline]: "defined", [quote]: "rarely" });
  assert.deepEqual(evidence.map(({ questionId, dimension, directness, state }) => [questionId, dimension, directness, state]), [
    [pipeline, "relationship_recurrence", "direct", "established"],
    [quote, "relationship_recurrence", "direct", "weak"],
  ]);
});

test("R3L does not infer qualification, tools, commercial outcomes, or secondary dimensions", () => {
  const expected = derive({ [pipeline]: "partial" });
  assert.deepEqual(expected.map(({ dimension }) => dimension), ["relationship_recurrence"]);
  assert.ok(decisions.DEFER.includes(qualification));
  assert.ok(!candidate.some(({ id }) => id === qualification));
  assert.deepEqual(derive({ [qualification]: "yes_clear" }), []);
  assert.deepEqual(derive({ [pipeline]: "defined", [qualification]: "yes_clear" }).map(({ questionId, state }) => [questionId, state]), [
    [pipeline, "established"],
  ]);
  for (const unrelated of ["crm", "spreadsheet", "manual", "close_rate", "revenue", "won", "lost", "lead_quality", "sales_cycle"]) {
    assert.deepEqual(derive({ [pipeline]: "partial", q2_unrelated_fixture: unrelated }), expected);
  }
  assert.deepEqual(byId(pipeline).options.map(({ value }) => value), ["defined", "partial", "informal", "unknown"]);
});

test("R3L candidate and legacy remain separate, with historical pipeline evidence unchanged", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...question }: (typeof candidate)[number]) => question;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(byId(pipeline).routingRole, "adaptive");
  assert.ok(!candidate.some(({ id }) => [...decisions.REMOVE, ...decisions.DEFER].includes(id)));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
  assert.deepEqual(EVIDENCE_MAPPING[pipeline]?.dimensions, ["digital_readiness"]);
  assert.equal(legacy.find(({ id }) => id === pipeline)!.version, 1);
  assert.equal(legacy.find(({ id }) => id === pipeline)!.evidenceMigration, undefined);
  assert.equal(legacy.find(({ id }) => id === pipeline)!.evidenceV3, undefined);
  assert.deepEqual(deriveContextualEvidence({ [pipeline]: "yes" }, legacy).map(({ questionId, dimension, state, directness }) => [questionId, dimension, state, directness]), [
    [pipeline, "digital_readiness", "strong", "direct"],
  ]);
  assert.deepEqual(deriveContextualEvidence({ [pipeline]: "no" }, legacy).map(({ questionId, dimension, state, directness }) => [questionId, dimension, state, directness]), [
    [pipeline, "digital_readiness", "missing", "direct"],
  ]);
  for (const answers of [b2b, { ...b2b, q2_delivery: ["travels"] }, { ...b2b, q2_has_customers: "no" }]) {
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
});
