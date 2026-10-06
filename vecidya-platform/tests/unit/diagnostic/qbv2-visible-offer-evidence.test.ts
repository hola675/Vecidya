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
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_VISIBLE_OFFER_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const offer = "q2_presence_offer_clarity";
const retail = "q2_retail_product_visibility";
const base = "q2_presence_digital_base";
const catalog = "q2_ecommerce_product_discovery";
const local = "q2_local_presence_consistency";
const discovery = "q2_discovery_reliable_reach";
const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "explain" };
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);

test("R3C retains its two atomic visible offer definitions in the accumulated ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: registry.length, pending: 38 - registry.length });
  assert.deepEqual(batch.map((m) => m.questionId), [offer, retail]);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  for (const id of [offer, retail]) {
    const q = question(id);
    assert.equal(q.version, 2);
    assert.equal(q.evidenceMigration, "migrated");
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    assert.deepEqual(Object.keys(q.evidenceV3!.dimensions[0]!.answers).sort(), q.options.map((o) => o.value).sort());
  }
});

test("R3C every concrete answer observes only direct canonical Clarity with unchanged contributions", () => {
  for (const id of [offer, retail]) for (const [answer, state, contribution] of [
    ["clear", "established", 0.75], ["partial", "partial", 0.5], ["unclear", "weak", 0.25],
  ] as const) {
    const evidence = derive({ [id]: answer });
    assert.equal(evidence.length, 1);
    const entry = evidence[0]!;
    assert.deepEqual([entry.dimension, entry.directness, entry.state, entry.contribution], ["clarity_positioning", "direct", state, contribution]);
    assert.ok(DIGITAL_DIMENSION_IDS.includes(entry.dimension));
    assert.deepEqual(entry.answer, [answer]);
    assert.equal(entry.questionVersion, 2);
    assert.equal(entry.migrationIdentity, `${id}@v2`);
    assert.equal(entry.observationId, entry.migrationIdentity);
  }
});

test("R3C unknown and true N/A are neutral and confusing offers never imply absence", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  for (const id of [offer, retail]) for (const option of question(id).options.filter((o) => o.kind)) {
    const evidence = derive({ [id]: option.value });
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0]!.state, option.kind === "unknown" ? "uncertainty" : "not_applicable");
    assert.equal(evidence[0]!.contribution, null);
    const result = scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find((d) => d.id === "clarity_positioning")!;
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
  }
  assert.ok(!question(retail).options.some((o) => o.kind === "not_applicable"));
  for (const id of [offer, retail]) assert.notEqual(derive({ [id]: "unclear" })[0]!.state, "missing");
});

test("R3C version mismatch and incomplete options fail closed without legacy fallback", () => {
  for (const id of [offer, retail]) {
    const q = question(id);
    assert.equal(legacy.find((q) => q.id === id)!.version, 1);
    const wrongVersion = { ...q, version: 1 as const };
    assert.ok(validateQuestionEvidenceV3(wrongVersion).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: "clear" }, [wrongVersion]), []);
    const reading = q.evidenceV3!.dimensions[0]!;
    const { unknown: _unknown, ...incomplete } = reading.answers;
    const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
    assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [id]: "clear" }, [invalid]), []);
    assert.deepEqual(derive({ [id]: "invented" }), []);
  }
});

test("R3C legacy equivalents retain historical evidence and an unrelated candidate stays pending", () => {
  for (const id of [offer, retail]) {
    const old = legacy.find((q) => q.id === id)!;
    for (const option of old.options) {
      const answers = { [id]: option.value };
      const historical = deriveContextualEvidence(answers, legacy);
      assert.deepEqual(historical, deriveContextualEvidence(answers, [old]));
      assert.ok(historical.every((e) => e.questionVersion === undefined));
    }
  }
  const pending = question("q2_retail_customer_capture");
  assert.equal(pending.evidenceMigration, "pending");
  for (const option of pending.options) assert.deepEqual(derive({ [pending.id]: option.value }), []);
});

test("R3C base existence and offer comprehension are distinct observations in one applicable context", () => {
  const answers = { ...seed, q2_delivery: ["travels"], [base]: "partial_presence" };
  assert.ok(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(offer));
  const evidence = derive({ [base]: "partial_presence", [offer]: "clear", [discovery]: "weak" });
  assert.deepEqual(evidence.filter((e) => e.questionId === base).map((e) => [e.dimension, e.state]), [["digital_foundation", "partial"]]);
  assert.deepEqual(evidence.filter((e) => e.questionId === offer).map((e) => [e.dimension, e.state]), [["clarity_positioning", "established"]]);
  assert.deepEqual(evidence.filter((e) => e.questionId === discovery).map((e) => e.dimension), ["discovery"]);
});

test("R3C retail comprehension and ecommerce navigation coexist safely on a valid hybrid", () => {
  const answers = { ...seed, q2_delivery: ["retail", "online_checkout"] };
  const result = resolveEligibleQuestionsV2(answers, candidate);
  for (const id of [retail, catalog, local]) assert.ok(result.eligibleQuestionIds.includes(id), id);
  assert.ok(!result.eligibleQuestionIds.includes(offer));
  const evidence = derive({ [retail]: "clear", [catalog]: "difficult", [local]: "partial" });
  assert.deepEqual(evidence.filter((e) => e.questionId === retail).map((e) => e.dimension), ["clarity_positioning"]);
  assert.deepEqual(evidence.filter((e) => e.questionId === catalog).map((e) => e.dimension), ["digital_foundation"]);
  assert.deepEqual(evidence.filter((e) => e.questionId === local).map((e) => e.dimension), ["digital_foundation"]);
  assert.equal(new Set(evidence.map((e) => e.observationId)).size, evidence.length);
  assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
});

test("R3C inventory, sales, branding and tool metadata cannot substitute comprehension", () => {
  assert.match(question(retail).hint!, /No necesitas mostrar todo el inventario ni el stock/);
  for (const id of [offer, retail]) for (const answer of ["clear", "unclear"] as const) {
    for (const metadata of ["large_inventory", "out_of_stock", "high_sales", "low_sales", "owned_website", "social_only", "large_budget", "many_services"]) {
      assert.deepEqual(derive({ [id]: answer, unrelated_metadata_fixture: metadata }), derive({ [id]: answer }));
      assert.deepEqual(derive({ [id]: metadata }), []);
    }
  }
});

test("R3C preserves R2 constructs, prelaunch routing, REMOVE/DEFER exclusion and runtime", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  for (const answers of [seed, { ...seed, q2_has_customers: "no", [base]: "reliable_presence" }, { ...seed, q2_delivery: ["retail"] }]) {
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
