import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { resolveEligibleQuestionsV2, getQuestionBank } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_INITIAL_ACCESS_EVIDENCE_V3 as batch } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const response = "q2_service_response_speed";
const booking = "q2_appointments_booking_friction";
const outcome = "q2_appointments_lead_to_booking";
const quote = "q2_service_quote_followup";
const followup = "q2_followup_general_process";
const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "opportunities" };
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);

test("R3D atomically migrates only initial response and coordination with a 38/10/28 ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: 10, pending: 28 });
  assert.deepEqual(batch.map((m) => m.questionId), [response, booking]);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  for (const id of [response, booking]) {
    const q = question(id);
    assert.equal(q.version, 2);
    assert.equal(q.evidenceMigration, "migrated");
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    assert.deepEqual(Object.keys(q.evidenceV3!.dimensions[0]!.answers).sort(), q.options.map((o) => o.value).sort());
  }
});

test("R3D every initial response answer emits direct Access only, without a universal SLA", () => {
  for (const [answer, state, contribution] of [
    ["strong", "established", 0.75], ["partial", "partial", 0.5], ["weak", "weak", 0.25], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [response]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual([evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution], ["conversion_access", "direct", state, contribution]);
    assert.deepEqual(evidence[0]!.answer, [answer]);
    assert.ok(DIGITAL_DIMENSION_IDS.includes(evidence[0]!.dimension));
  }
  for (const duration of ["five_minutes", "same_day", "next_day"]) assert.deepEqual(derive({ [response]: duration }), []);
});

test("R3D every coordination answer observes difficulty, never tool maturity or complete absence", () => {
  for (const [answer, state, contribution] of [
    ["rarely", "established", 0.75], ["sometimes", "partial", 0.5], ["often", "weak", 0.25], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [booking]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual([evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution], ["conversion_access", "direct", state, contribution]);
  }
  assert.match(question(booking).hint!, /intercambio normal.*no cuenta como problema/);
  assert.equal(derive({ [booking]: "often" })[0]!.state, "weak");
});

test("R3D unknown is neutral, neither construct includes N/A and invalid N/A cannot score", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  for (const id of [response, booking]) {
    const evidence = derive({ [id]: "unknown" });
    assert.equal(evidence[0]!.contribution, null);
    const result = scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find((d) => d.id === "conversion_access")!;
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
    assert.ok(!question(id).options.some((o) => o.kind === "not_applicable"));
    assert.deepEqual(derive({ [id]: "not_applicable" }), []);
  }
});

test("R3D only candidate v2 matches and incomplete migrations fail closed", () => {
  for (const id of [response, booking]) {
    const q = question(id);
    const answer = q.options[0]!.value;
    const entry = derive({ [id]: answer })[0]!;
    assert.equal(entry.questionVersion, 2);
    assert.equal(entry.migrationIdentity, `${id}@v2`);
    assert.equal(entry.observationId, entry.migrationIdentity);
    assert.equal(legacy.find((q) => q.id === id)!.version, 1);
    const mismatched = { ...q, version: 1 as const };
    assert.ok(validateQuestionEvidenceV3(mismatched).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: answer }, [mismatched]), []);
    const reading = q.evidenceV3!.dimensions[0]!;
    const { unknown: _unknown, ...incomplete } = reading.answers;
    const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
    assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: answer }, [invalid]), []);
  }
});

test("R3D q31 gates coordination without supplying its state or duplicating its observation", () => {
  const appointments = { ...seed, q2_delivery: ["appointments"] };
  assert.equal(question(booking).routingRole, "adaptive");
  assert.equal(question(booking).appliesWhen, undefined);
  assert.ok(question(booking).materialAppliesWhen);
  for (const value of [undefined, "most", "mixed", "few", "unknown"]) {
    const answers = value === undefined ? appointments : { ...appointments, [outcome]: value };
    assert.equal(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(booking), value === "mixed" || value === "few");
    assert.deepEqual(derive(answers), []);
    const plan = buildQuestionPlan({ answers, bank: candidate });
    assert.deepEqual(plan.selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
    if (plan.selectedQuestionIds.includes(booking)) assert.notEqual(plan.trace.find((e) => e.questionId === booking)!.selectedIn, "base");
  }
  for (const value of ["mixed", "few"] as const) {
    const answers = { ...appointments, [outcome]: value, [booking]: "rarely" };
    const entries = derive(answers);
    assert.equal(entries.length, 1);
    assert.equal(entries[0]!.questionId, booking);
    assert.equal(entries[0]!.state, "established", "few bookings cannot turn smooth coordination into weak evidence");
    assert.deepEqual(entries, derive({ [booking]: "rarely" }));
  }
  assert.equal(question(outcome).evidenceMigration, "pending");
});

test("R3D first response remains independent from quote and generic follow-up", () => {
  for (const id of [quote, followup]) {
    assert.equal(question(id).evidenceMigration, "pending");
    for (const option of question(id).options) {
      assert.deepEqual(derive({ [id]: option.value }), []);
      assert.deepEqual(derive({ [id]: option.value, [response]: "strong" }), derive({ [response]: "strong" }));
    }
  }
});

test("R3D tools and hypothetical causes cannot create secondary evidence or domain facts", () => {
  for (const [id, answer] of [[response, "weak"], [booking, "often"]] as const) {
    const evidence = derive({ [id]: answer });
    for (const metadata of ["manual", "calendar", "CRM", "automation", "phone", "texting", "poor_staff", "low_capacity", "low_demand", "lost_sale", "bad_website"]) {
      assert.deepEqual(derive({ [id]: answer, unrelated_cause_fixture: metadata }), evidence);
      assert.deepEqual(derive({ [id]: metadata }), []);
    }
    const applicable = id === response ? { ...seed, q2_delivery: ["travels"] } : { ...seed, q2_delivery: ["appointments"], [outcome]: "few" };
    assert.ok(resolveEligibleQuestionsV2(applicable, candidate).eligibleQuestionIds.includes(id));
    const context = resolveEligibleQuestionsV2({ ...applicable, [id]: answer }, candidate).context;
    for (const field of ["primaryFriction", "capacitySituation", "processConsistency"] as const) assert.equal(context[field].status, "unresolved");
    assert.deepEqual(evidence.map((e) => e.dimension), ["conversion_access"]);
  }
});

test("R3D legacy versions retain historical evidence independently of candidate maps", () => {
  for (const id of [response, booking]) {
    const old = legacy.find((q) => q.id === id)!;
    for (const option of old.options) {
      const answers = { [id]: option.value };
      const historical = deriveContextualEvidence(answers, legacy);
      assert.deepEqual(historical, deriveContextualEvidence(answers, [old]));
      assert.ok(historical.every((e) => e.questionVersion === undefined));
    }
  }
});

test("R3D freezes R2 definitions, signals, roles and runtime registration", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  for (const answers of [{ ...seed, q2_delivery: ["travels"] }, { ...seed, q2_has_customers: "no", q2_delivery: ["appointments"] }]) {
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
