import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_FOLLOWUP_CONTINUITY_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const quote = "q2_service_quote_followup";
const general = "q2_followup_general_process";
const response = "q2_service_response_speed";
const neighbors = ["q2_b2b_pipeline", "q2_appointments_rebooking", "q2_creator_audience_ownership", "q2_capacity_signal"];
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_customer_buyer: "b2c", q2_goal: "other", q2_friction: "follow_up" };

test("R3E atomically migrates exactly two continuity constructs within the cumulative ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: registry.length, pending: 38 - registry.length });
  assert.deepEqual(batch.map((m) => m.questionId), [quote, general]);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  for (const id of [quote, general]) {
    const q = question(id);
    assert.equal(q.version, 2);
    assert.equal(q.evidenceMigration, "migrated");
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    assert.deepEqual(Object.keys(q.evidenceV3!.dimensions[0]!.answers).sort(), q.options.map((o) => o.value).sort());
  }
});

test("R3E every quote answer observes direct continuity, never quote success or complete absence", () => {
  for (const [answer, state, contribution] of [
    ["consistent", "established", 0.75], ["sometimes", "partial", 0.5], ["rarely", "weak", 0.25], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const entries = derive({ [quote]: answer });
    assert.equal(entries.length, 1);
    assert.deepEqual([entries[0]!.dimension, entries[0]!.directness, entries[0]!.state, entries[0]!.contribution], ["relationship_recurrence", "direct", state, contribution]);
    assert.deepEqual(entries[0]!.answer, [answer]);
  }
});

test("R3E every generic answer observes direct resumption, without inventing process absence", () => {
  for (const [answer, state, contribution] of [
    ["consistent", "established", 0.75], ["partial", "partial", 0.5], ["sometimes_lost", "weak", 0.25], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const entries = derive({ [general]: answer });
    assert.equal(entries.length, 1);
    assert.deepEqual([entries[0]!.dimension, entries[0]!.directness, entries[0]!.state, entries[0]!.contribution], ["relationship_recurrence", "direct", state, contribution]);
  }
});

test("R3E unknown and legitimate N/A remain neutral with no strengths, weaknesses or missing capability", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  for (const id of [quote, general]) for (const answer of ["unknown", "not_applicable"]) {
    const evidence = derive({ [id]: answer });
    assert.equal(evidence[0]!.contribution, null);
    const result = scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find((d) => d.id === "relationship_recurrence")!;
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
  }
  assert.deepEqual(derive({ [quote]: "no_quotes" }), []);
});

test("R3E identity is candidate v2 only and incomplete or mismatched mappings fail closed", () => {
  for (const id of [quote, general]) {
    const q = question(id);
    const entry = derive({ [id]: "consistent" })[0]!;
    assert.equal(entry.questionVersion, 2);
    assert.equal(entry.migrationIdentity, `${id}@v2`);
    assert.equal(entry.observationId, entry.migrationIdentity);
    assert.equal(legacy.find((q) => q.id === id)!.version, 1);
    const wrong = { ...q, version: 1 as const };
    assert.ok(validateQuestionEvidenceV3(wrong).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: "consistent" }, [wrong]), []);
    const reading = q.evidenceV3!.dimensions[0]!;
    const { unknown: _unknown, ...incomplete } = reading.answers;
    const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
    assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: "consistent" }, [invalid]), []);
  }
});

test("R3E generic fallback excludes all specialist contexts, including hybrid and mixed buyers", () => {
  const generic = { ...seed, q2_delivery: ["physical_location"], q2_monetization: "services" };
  assert.ok(resolveEligibleQuestionsV2(generic, candidate).eligibleQuestionIds.includes(general));
  const cases: readonly [string, AnswersV2][] = [
    [quote, { ...seed, q2_delivery: ["travels"] }],
    ["q2_appointments_rebooking", { ...seed, q2_delivery: ["appointments"] }],
    ["q2_retail_customer_capture", { ...seed, q2_delivery: ["retail"], q2_monetization: "goods" }],
    ["q2_b2b_pipeline", { ...generic, q2_customer_buyer: "b2b" }],
    ["q2_b2b_status_visibility", { ...generic, q2_customer_buyer: "mixed", q2_goal: "organize" }],
    ["q2_creator_audience_ownership", { ...generic, q2_monetization: "audience" }],
  ];
  for (const [specialist, answers] of cases) {
    const resolved = resolveEligibleQuestionsV2(answers, candidate);
    assert.ok(resolved.eligibleQuestionIds.includes(specialist), specialist);
    assert.ok(!resolved.eligibleQuestionIds.includes(general), specialist);
  }
  for (const answers of [{ ...generic, q2_delivery: ["physical_location", "travels", "appointments"] }, { ...generic, q2_has_customers: "no" }, { ...generic, q2_friction: "operations" }]) {
    assert.ok(!resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(general));
  }
});

test("R3E pending specialized neighbors never supply inherited or duplicate continuity evidence", () => {
  for (const id of neighbors) {
    assert.equal(question(id).evidenceMigration, "pending");
    for (const option of question(id).options) {
      assert.deepEqual(derive({ [id]: option.value }), []);
      assert.deepEqual(derive({ [quote]: "consistent", [id]: option.value }), derive({ [quote]: "consistent" }));
      assert.deepEqual(derive({ [general]: "sometimes_lost", [id]: option.value }), derive({ [general]: "sometimes_lost" }));
    }
  }
});

test("R3E later continuity and initial Access remain independent observations", () => {
  for (const id of [quote, general]) for (const option of question(id).options) {
    const entries = derive({ [id]: option.value, [response]: "weak" });
    assert.deepEqual(entries.filter((e) => e.questionId === id), derive({ [id]: option.value }));
    assert.deepEqual(entries.filter((e) => e.questionId === response), derive({ [response]: "weak" }));
  }
  const answers = { ...seed, q2_friction: "operations", q2_delivery: ["travels"], [response]: "weak" };
  assert.ok(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(quote));
  assert.equal(derive({ ...answers, [quote]: "consistent" }).find((e) => e.questionId === quote)!.state, "established");
});

test("R3E neither tools, causes, sales nor recurrence create secondary evidence or domain facts", () => {
  for (const [id, answer] of [[quote, "rarely"], [general, "sometimes_lost"]] as const) {
    const evidence = derive({ [id]: answer });
    for (const metadata of ["CRM", "spreadsheet", "manual_notes", "automation", "more_staff", "won_quote", "lost_quote", "revenue", "retention", "loyalty", "repeat_purchase", "referral"]) {
      assert.deepEqual(derive({ [id]: answer, unrelated_cause_fixture: metadata }), evidence);
      assert.deepEqual(derive({ [id]: metadata }), []);
    }
    const applicable = { ...seed, q2_delivery: [id === quote ? "travels" : "physical_location"], q2_monetization: "services" };
    assert.ok(resolveEligibleQuestionsV2(applicable, candidate).eligibleQuestionIds.includes(id));
    assert.deepEqual(resolveEligibleQuestionsV2({ ...applicable, [id]: answer }, candidate).context, resolveEligibleQuestionsV2(applicable, candidate).context);
    assert.deepEqual(evidence.map((e) => e.dimension), ["relationship_recurrence"]);
    assert.ok(!question(id).options.some((o) => o.produces?.length));
  }
});

test("R3E legacy definitions preserve historical evidence and have no V3 metadata", () => {
  for (const id of [quote, general]) {
    const old = legacy.find((q) => q.id === id)!;
    assert.equal(old.evidenceMigration, undefined);
    assert.equal(old.evidenceV3, undefined);
    for (const option of old.options) {
      const answers = { [id]: option.value };
      const historical = deriveContextualEvidence(answers, legacy);
      assert.deepEqual(historical, deriveContextualEvidence(answers, [old]));
      assert.ok(historical.every((e) => e.questionVersion === undefined));
    }
  }
});

test("R3E freezes candidate definitions, routing roles, selections and inactive legacy runtime", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(question(quote).routingRole, "adaptive");
  assert.equal(question(general).routingRole, "deepening");
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  for (const answers of [{ ...seed, q2_delivery: ["travels"] }, { ...seed, q2_delivery: ["physical_location"], q2_monetization: "services" }, { ...seed, q2_has_customers: "no" }]) {
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
