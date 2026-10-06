import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { SCORING_MODEL, deriveContextualEvidence, scoreContextualDimensions, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_OPERATIONAL_READINESS_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const information = "q2_operations_information_base";
const status = "q2_b2b_status_visibility";
const handoffs = "q2_operations_handoffs";
const pipeline = "q2_b2b_pipeline";
const quote = "q2_service_quote_followup";
const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_customer_buyer: "b2b", q2_goal: "organize" };
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const context = resolveEligibleQuestionsV2(seed, candidate).context;
const score = (evidence: readonly ContextualEvidence[]) => scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find((d) => d.id === "digital_readiness")!;

test("R3F complete atomic mappings resolve the two v2 definitions within the cumulative ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: registry.length, pending: 38 - registry.length });
  assert.deepEqual(batch.map((m) => m.questionId), [information, status]);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  for (const id of [information, status]) {
    const q = question(id);
    assert.equal(q.version, 2);
    assert.equal(q.evidenceMigration, "migrated");
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    assert.deepEqual(Object.keys(q.evidenceV3!.dimensions[0]!.answers).sort(), q.options.map((o) => o.value).sort());
  }
});

test("R3F every general retrieval option explicitly observes direct Readiness only", () => {
  for (const [answer, state, contribution] of [
    ["easy_reliable", "established", 0.75], ["somewhat_scattered", "partial", 0.5], ["difficult_unreliable", "weak", 0.25], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const entries = derive({ [information]: answer });
    assert.equal(entries.length, 1);
    const e = entries[0]!;
    assert.deepEqual([e.dimension, e.directness, e.state, e.contribution], ["digital_readiness", "direct", state, contribution]);
    assert.equal(e.migrationIdentity, `${information}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.equal(e.questionVersion, 2);
    assert.deepEqual(e.answer, [answer]);
  }
});

test("R3F every opportunity-state option supports Readiness without establishing its general capability", () => {
  for (const [answer, state, contribution] of [
    ["clear", "established", 0.75], ["partial", "partial", 0.5], ["lose_track", "weak", 0.25], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const entries = derive({ [status]: answer });
    assert.equal(entries.length, 1);
    const e = entries[0]!;
    assert.deepEqual([e.dimension, e.directness, e.state, e.contribution], ["digital_readiness", "supporting", state, contribution]);
    assert.equal(e.migrationIdentity, `${status}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.equal(e.questionVersion, 2);
    assert.deepEqual(e.answer, [answer]);
    assert.equal(score(entries).score, null);
  }
});

test("R3F unknown and N/A cannot supply a numerator, denominator or fabricated weakness", () => {
  const direct = derive({ [information]: "somewhat_scattered" });
  for (const id of [information, status]) for (const value of ["unknown", "not_applicable"]) {
    const neutral = derive({ [id]: value });
    assert.equal(neutral[0]!.contribution, null);
    const result = score(neutral);
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
    assert.equal(score([...direct, ...neutral]).score, score(direct).score);
  }
});

test("R3F version mismatch and incomplete mappings fail closed without legacy fallback", () => {
  for (const id of [information, status]) {
    const q = question(id);
    const answer = q.options[0]!.value;
    assert.equal(legacy.find((q) => q.id === id)!.version, 1);
    const wrong = { ...q, version: 1 as const };
    assert.ok(validateQuestionEvidenceV3(wrong).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: answer }, [wrong]), []);
    const reading = q.evidenceV3!.dimensions[0]!;
    const { unknown: _unknown, ...incomplete } = reading.answers;
    const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
    assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: answer }, [invalid]), []);
  }
});

test("R3F recovery states are independent of tools, centralization, automation and sales results", () => {
  for (const id of [information, status]) for (const option of question(id).options) {
    const evidence = derive({ [id]: option.value });
    for (const method of ["CRM", "spreadsheet", "memory", "paper", "shared_document", "custom_software", "centralized", "distributed", "automatic", "manual", "won_sale", "lost_sale", "high_close_rate", "large_team", "dashboard"]) {
      assert.deepEqual(derive({ [id]: option.value, unrelated_method_fixture: method }), evidence);
      assert.deepEqual(derive({ [id]: method }), []);
    }
    assert.ok(!question(id).options.some((o) => o.produces?.length));
    assert.deepEqual(resolveEligibleQuestionsV2({ ...seed, [id]: option.value }, candidate).context, context);
  }
  assert.equal(derive({ [information]: "somewhat_scattered" })[0]!.state, "partial");
  assert.equal(derive({ [status]: "lose_track" })[0]!.state, "weak");
});

test("R3F general and B2B recovery coexist with partially overlapping scope, not two direct bases", () => {
  for (const buyer of ["b2b", "mixed"]) {
    const answers = { ...seed, q2_customer_buyer: buyer };
    const eligible = resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds;
    assert.ok(eligible.includes(information));
    assert.ok(eligible.includes(status));
    assert.equal(question(information).routingRole, "deepening");
    assert.equal(question(status).routingRole, "adaptive");
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  const entries = derive({ [information]: "easy_reliable", [status]: "lose_track" });
  assert.equal(new Set(entries.map((e) => e.observationId)).size, 2);
  assert.deepEqual(entries.filter((e) => e.questionId === information), derive({ [information]: "easy_reliable" }));
  assert.deepEqual(entries.filter((e) => e.questionId === status), derive({ [status]: "lose_track" }));
  const result = score(entries);
  assert.deepEqual(result.explainability.direct, [information]);
  assert.deepEqual(result.explainability.supporting, [status]);
});

test("R3F q65 still supplements the direct base under the existing shared supporting cap", () => {
  const direct = derive({ [information]: "somewhat_scattered" });
  const support = derive({ [handoffs]: "complete" });
  assert.equal(support[0]!.directness, "supporting");
  assert.equal(support[0]!.state, "established");
  assert.equal(score([...direct, ...support]).explainability.basis, "direct_and_supporting");
  assert.equal(score([...direct, ...support]).score, Math.round(100 * (0.5 + 0.75 * 0.5) / 1.5));
  const secondSupport = derive({ [status]: "clear" });
  assert.equal(score([...direct, ...support, ...secondSupport]).score, score([...direct, ...support]).score);
  assert.deepEqual(SCORING_MODEL, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
  assert.ok(resolveEligibleQuestionsV2(seed, candidate).eligibleQuestionIds.includes(handoffs));
});

test("R3F q65 and B2B supporting evidence alone cannot establish a dimension percentage", () => {
  for (const evidence of [derive({ [handoffs]: "complete" }), derive({ [status]: "clear" }), derive({ [handoffs]: "complete", [status]: "clear" })]) {
    assert.equal(score(evidence).score, null);
    assert.equal(score(evidence).explainability.basis, "supporting_only");
    assert.deepEqual(score(evidence).explainability.direct, []);
  }
});

test("R3F status stays supporting Readiness while R3L pipeline is direct Relationship evidence", () => {
  assert.equal(question(pipeline).evidenceMigration, "migrated");
  const pipelineEvidence = derive({ [pipeline]: "defined" });
  assert.deepEqual(pipelineEvidence.map(({ questionId, dimension, directness, state }) => [questionId, dimension, directness, state]), [
    [pipeline, "relationship_recurrence", "direct", "established"],
  ]);
  for (const [pipelineAnswer, statusAnswer] of [["defined", "lose_track"], ["informal", "clear"]] as const) {
    const evidence = derive({ [pipeline]: pipelineAnswer, [status]: statusAnswer });
    assert.deepEqual(evidence.map(({ questionId, dimension, directness, state }) => [questionId, dimension, directness, state]), [
      [pipeline, "relationship_recurrence", "direct", pipelineAnswer === "defined" ? "established" : "weak"],
      [status, "digital_readiness", "supporting", statusAnswer === "clear" ? "established" : "weak"],
    ]);
  }
  assert.equal(score(derive({ [status]: "clear" })).score, null);
});

test("R3F current-state recovery and actual quote continuation remain separate capabilities", () => {
  const answers = { ...seed, q2_delivery: ["travels"], q2_friction: "conversion", q2_goal: "other" };
  // Organization need enables status; an independently observed weak initial response enables quote follow-up.
  const applicable = { ...answers, q2_friction: "operations", q2_service_response_speed: "weak" };
  const eligible = resolveEligibleQuestionsV2(applicable, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(status));
  assert.ok(eligible.includes(quote));
  const entries = derive({ [status]: "clear", [quote]: "rarely" });
  assert.deepEqual(entries.map((e) => [e.questionId, e.dimension, e.state]), [[quote, "relationship_recurrence", "weak"], [status, "digital_readiness", "established"]]);
});

test("R3F preserves legacy equivalents, all R2 definitions and inactive 85/v1 runtime", () => {
  for (const id of [information, status]) {
    const old = legacy.find((q) => q.id === id)!;
    assert.equal(old.evidenceMigration, undefined);
    for (const option of old.options) {
      const answers = { [id]: option.value };
      assert.deepEqual(deriveContextualEvidence(answers, legacy), deriveContextualEvidence(answers, [old]));
    }
  }
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
