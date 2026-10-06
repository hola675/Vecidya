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
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_PROFESSIONAL_INTAKE_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const intake = "q2_professional_intake_flow";
const offer = "q2_presence_offer_clarity";
const booking = "q2_appointments_booking_friction";
const authority = "q2_professional_authority_signals";
const pending = "q2_appointments_lead_to_booking";
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "no", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "professional_services", q2_goal: "explain" };

test("R3H atomically migrates only intake v2 with every option and ledger 38/16/22", () => {
  assert.deepEqual(summary, { total: 38, migrated: 16, pending: 22 });
  assert.deepEqual(batch.map(m => m.questionId), [intake]);
  assert.equal(question(intake).version, 2);
  assert.equal(question(intake).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionEvidenceV3(question(intake)), []);
  assert.deepEqual(Object.keys(batch[0].dimensions[0].answers).sort(), question(intake).options.map(o => o.value).sort());
  assert.equal(new Set(registry.map(m => `${m.questionId}@v${m.questionVersion}`)).size, registry.length);
});

test("R3H every next-step comprehension answer produces direct Clarity only", () => {
  for (const [answer, state, contribution] of [["clear", "established", 0.75], ["partial", "partial", 0.5], ["unclear", "weak", 0.25], ["unknown", "uncertainty", null]] as const) {
    const evidence = derive({ [intake]: answer });
    assert.equal(evidence.length, 1);
    const e = evidence[0]!;
    assert.deepEqual([e.dimension, e.directness, e.state, e.contribution], ["clarity_positioning", "direct", state, contribution]);
    assert.equal(e.questionVersion, 2);
    assert.equal(e.migrationIdentity, `${intake}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.deepEqual(e.answer, [answer]);
  }
});

test("R3H unknown is neutral, ambiguity is not absence and N/A is not invented", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  const score = (answers: AnswersV2) => scoreContextualDimensions({ answers: {}, context, evidence: derive(answers), bank: candidate }).dimensions.find(d => d.id === "clarity_positioning")!;
  assert.equal(derive({ [intake]: "unknown" })[0]!.contribution, null);
  const alone = score({ [intake]: "unknown" });
  assert.equal(alone.score, null);
  assert.deepEqual(alone.explainability.weaknesses, []);
  assert.deepEqual(alone.explainability.missing, []);
  assert.equal(score({ [offer]: "clear", [intake]: "unknown" }).score, score({ [offer]: "clear" }).score);
  assert.equal(derive({ [intake]: "unclear" })[0]!.state, "weak");
  assert.ok(!question(intake).options.some(o => o.kind === "not_applicable"));
  assert.deepEqual(derive({ [intake]: "not_applicable" }), []);
});

test("R3H clear next step and difficult booking coexist without Clarity/Access aliasing", () => {
  const answers = { ...seed, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few" };
  const eligible = resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(intake));
  assert.ok(eligible.includes(booking));
  const evidence = derive({ [intake]: "clear", [booking]: "often" });
  assert.equal(evidence.length, 2);
  assert.deepEqual(evidence.filter(e => e.questionId === intake), derive({ [intake]: "clear" }));
  assert.deepEqual(evidence.filter(e => e.questionId === booking), derive({ [booking]: "often" }));
  assert.deepEqual(evidence.map(e => [e.dimension, e.state]).sort(), [["clarity_positioning", "established"], ["conversion_access", "weak"]]);
  assert.equal(new Set(evidence.map(e => e.observationId)).size, 2);
});

test("R3H offer comprehension and next-step comprehension can diverge with distinct sources", () => {
  const eligible = resolveEligibleQuestionsV2({ ...seed, q2_presence_digital_base: "reliable_presence" }, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(intake));
  assert.ok(eligible.includes(offer));
  for (const [next, offering] of [["clear", "unclear"], ["unclear", "clear"]] as const) {
    const evidence = derive({ [intake]: next, [offer]: offering });
    assert.equal(evidence.length, 2);
    assert.ok(evidence.every(e => e.dimension === "clarity_positioning" && e.directness === "direct"));
    assert.equal(new Set(evidence.map(e => e.migrationIdentity)).size, 2);
    assert.notEqual(evidence[0]!.state, evidence[1]!.state);
    assert.deepEqual(evidence.filter(e => e.questionId === intake), derive({ [intake]: next }));
    assert.deepEqual(evidence.filter(e => e.questionId === offer), derive({ [offer]: offering }));
  }
});

test("R3H authority and reputation remain Trust observations independent of intake Clarity", () => {
  const evidence = derive({ [intake]: "clear", [authority]: "not_really", q2_reputation_flow: "strong" });
  assert.equal(evidence.length, 3);
  assert.equal(new Set(evidence.map(e => e.observationId)).size, 3);
  for (const [id, answer] of [[intake, "clear"], [authority, "not_really"], ["q2_reputation_flow", "strong"]]) assert.deepEqual(evidence.filter(e => e.questionId === id), derive({ [id]: answer }));
  assert.equal(evidence.filter(e => e.dimension === "trust_reputation").length, 2);
  assert.equal(evidence.filter(e => e.dimension === "clarity_positioning").length, 1);
});

test("R3H professional sector, goals/frictions and planner routing supply no evidence", () => {
  for (const sector of ["legal", "financial_tax_insurance", "professional_services", "real_estate"]) for (const need of [{ q2_goal: "opportunities" }, { q2_goal: "other", q2_friction: "conversion" }, { q2_goal: "explain" }]) {
    const answers = { ...seed, q2_sector: sector, ...need };
    assert.ok(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(intake));
    assert.deepEqual(derive(answers), []);
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
    assert.deepEqual(derive({ ...answers, [intake]: "clear" }), derive({ [intake]: "clear" }));
  }
  assert.ok(!resolveEligibleQuestionsV2({ ...seed, q2_has_customers: "no" }, candidate).eligibleQuestionIds.includes(intake));
});

test("R3H process formality, tools and commercial outcomes neither score nor create secondary evidence", () => {
  for (const option of question(intake).options) {
    const evidence = derive({ [intake]: option.value });
    for (const label of ["consultation", "intake_form", "discovery_call", "CRM", "calendar", "phone", "email", "manual_contact", "high_conversion", "lost_client", "high_revenue", "quality_leads", "high_demand"]) {
      assert.deepEqual(derive({ [intake]: option.value, unrelated_intake_fixture: label }), evidence);
      assert.deepEqual(derive({ [intake]: label }), []);
    }
    assert.ok(evidence.every(e => e.dimension === "clarity_positioning"));
    assert.deepEqual(resolveEligibleQuestionsV2({ ...seed, [intake]: option.value }, candidate).context, resolveEligibleQuestionsV2(seed, candidate).context);
  }
  assert.ok(!question(intake).options.some(o => o.produces?.length));
});

test("R3H pending appointment outcome emits neither migrated nor inherited evidence", () => {
  assert.equal(question(pending).evidenceMigration, "pending");
  for (const option of question(pending).options) {
    assert.deepEqual(derive({ [pending]: option.value }), []);
    assert.deepEqual(derive({ [intake]: "clear", [pending]: option.value }), derive({ [intake]: "clear" }));
  }
});

test("R3H wrong version or incomplete mapping fails closed and legacy v1 stays historical", () => {
  const q = question(intake);
  const wrong = { ...q, version: 1 as const };
  assert.ok(validateQuestionEvidenceV3(wrong).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [intake]: "clear" }, [wrong]), []);
  const reading = q.evidenceV3!.dimensions[0]!;
  const { unknown: _unknown, ...incomplete } = reading.answers;
  const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
  assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [intake]: "clear" }, [invalid]), []);
  const old = legacy.find(q => q.id === intake)!;
  assert.equal(old.version, 1);
  assert.equal(old.evidenceMigration, undefined);
  for (const option of old.options) {
    const answers = { [intake]: option.value };
    const evidence = deriveContextualEvidence(answers, legacy);
    assert.deepEqual(evidence, deriveContextualEvidence(answers, [old]));
    assert.ok(evidence.every(e => e.questionVersion === undefined));
  }
});

test("R3H preserves all frozen R2 fields and inactive legacy runtime 85/v1", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(question(intake).routingRole, "adaptive");
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some(q => q.id === id));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
