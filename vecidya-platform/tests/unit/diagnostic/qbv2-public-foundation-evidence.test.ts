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
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_PUBLIC_FOUNDATION_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const base = "q2_presence_digital_base";
const catalog = "q2_ecommerce_product_discovery";
const local = "q2_local_presence_consistency";
const clarity = "q2_presence_offer_clarity";
const discovery = "q2_discovery_reliable_reach";
const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "explain" };
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const question = (id: string) => candidate.find((q) => q.id === id)!;

test("R3B retains exactly two atomic definitions in the accumulated migration ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: registry.length, pending: 38 - registry.length });
  assert.deepEqual(batch.map((m) => m.questionId), [base, catalog]);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  for (const id of [base, catalog]) {
    const q = question(id);
    assert.equal(q.version, 2);
    assert.equal(q.evidenceMigration, "migrated");
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    assert.deepEqual(Object.keys(q.evidenceV3!.dimensions[0]!.answers).sort(), q.options.map((o) => o.value).sort());
  }
});

test("R3B public base explicitly measures a maintained capability, not channel ownership", () => {
  for (const [answer, state, contribution] of [
    ["reliable_presence", "established", 0.75], ["partial_presence", "partial", 0.5],
    ["no_reliable_presence", "missing", 0], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [base]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual([evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution], ["digital_foundation", "direct", state, contribution]);
  }
  assert.match(question(base).hint!, /web, ficha, perfil o plataforma/);
  for (const channel of ["website", "marketplace", "social", "Shopify", "WooCommerce", "custom"]) {
    assert.deepEqual(derive({ [base]: "reliable_presence", unscored_channel_fixture: channel }), derive({ [base]: "reliable_presence" }));
    assert.deepEqual(derive({ [base]: channel }), [], "tool names cannot substitute a capability answer");
  }
});

test("R3B catalog has complete direct Foundation semantics and no inherited dimension spread", () => {
  for (const [answer, state, contribution] of [
    ["easy", "established", 0.75], ["confusing", "partial", 0.5], ["difficult", "weak", 0.25],
    ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [catalog]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual([evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution], ["digital_foundation", "direct", state, contribution]);
    assert.ok(DIGITAL_DIMENSION_IDS.includes(evidence[0]!.dimension));
  }
});

test("R3B unknown and N/A never establish a score or add strengths and weaknesses", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  for (const id of [base, catalog]) for (const answer of ["unknown", "not_applicable"]) {
    const evidence = derive({ [id]: answer });
    const result = scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find((d) => d.id === "digital_foundation")!;
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
  }
});

test("R3B identity applies only to candidate v2 and invalid migration never falls back", () => {
  for (const id of [base, catalog]) {
    const q = question(id);
    const value = q.options[0]!.value;
    const evidence = derive({ [id]: value })[0]!;
    assert.equal(evidence.questionVersion, 2);
    assert.equal(evidence.migrationIdentity, `${id}@v2`);
    assert.equal(legacy.find((q) => q.id === id)!.version, 1);
    const mismatched = { ...q, version: 1 as const };
    assert.ok(validateQuestionEvidenceV3(mismatched).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: value }, [mismatched]), []);
    const reading = q.evidenceV3!.dimensions[0]!;
    const { unknown: _unknown, ...incomplete } = reading.answers;
    assert.deepEqual(deriveContextualEvidence({ [id]: value }, [{ ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } }]), []);
  }
  const pending = question("q2_retail_customer_capture");
  assert.equal(pending.evidenceMigration, "pending");
  for (const option of pending.options) assert.deepEqual(derive({ [pending.id]: option.value }), []);
});

test("R3B reviewed evidence leaves every legacy equivalent exactly unchanged", () => {
  for (const id of [base, catalog]) {
    const old = legacy.find((q) => q.id === id)!;
    for (const option of old.options) {
      const answers = { [id]: option.value };
      assert.deepEqual(deriveContextualEvidence(answers, [old]), deriveContextualEvidence(answers, legacy));
      assert.ok(deriveContextualEvidence(answers, legacy).every((e) => e.questionVersion === undefined));
    }
  }
});

test("R3B local and transversal public base gates are mutually exclusive, including hybrid delivery", () => {
  for (const activity of ["yes", "no"] as const) for (const delivery of [
    ["physical_location"], ["retail"], ["onsite"], ["online_checkout"], ["travels"], ["appointments"], ["other"], ["physical_location", "online_checkout", "appointments"],
  ]) {
    const answers = { ...seed, q2_has_customers: activity, q2_delivery: delivery };
    for (const value of delivery) assert.ok(question("q2_delivery").options.some((o) => o.value === value));
    const eligible = resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds;
    assert.ok(!(eligible.includes(local) && eligible.includes(base)));
    assert.ok(!(eligible.includes(catalog) && eligible.includes(base)));
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  assert.ok(resolveEligibleQuestionsV2({ ...seed, q2_delivery: ["physical_location"] }, candidate).eligibleQuestionIds.includes(local));
  assert.ok(resolveEligibleQuestionsV2({ ...seed, q2_delivery: ["online_checkout"] }, candidate).eligibleQuestionIds.includes(catalog));
  assert.ok(resolveEligibleQuestionsV2({ ...seed, q2_delivery: ["travels"] }, candidate).eligibleQuestionIds.includes(base));
});

test("R3B catalog, offer clarity and external reach retain distinct observations without cross-dimension leakage", () => {
  const answers = { ...seed, q2_delivery: ["online_checkout"] };
  const eligible = resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(catalog));
  assert.ok(!eligible.includes(base));
  assert.ok(!eligible.includes(clarity), "offer clarity needs the transversal base prerequisite, excluded on this ecommerce route");
  assert.ok(resolveEligibleQuestionsV2({ ...seed, q2_delivery: ["travels"], [base]: "reliable_presence" }, candidate).eligibleQuestionIds.includes(clarity));
  const evidence = derive({ [catalog]: "easy", [clarity]: "clear", [discovery]: "irregular" });
  assert.deepEqual(evidence.filter((e) => e.questionId === catalog).map((e) => e.dimension), ["digital_foundation"]);
  assert.deepEqual(evidence.filter((e) => e.questionId === clarity).map((e) => e.dimension), ["clarity_positioning"]);
  assert.deepEqual(evidence.filter((e) => e.questionId === discovery).map((e) => e.dimension), ["discovery"]);
  assert.equal(new Set(evidence.map((e) => e.observationId)).size, evidence.length);
});

test("R3B overlay freezes R2 definitions, REMOVE/DEFER exclusion and runtime registration", () => {
  const strip = ({ evidenceV3: _map, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
