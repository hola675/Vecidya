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
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_PROFESSIONAL_AUTHORITY_EVIDENCE_V3 as batch } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const authority = "q2_professional_authority_signals";
const reputation = "q2_reputation_flow";
const intake = "q2_professional_intake_flow";
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "no", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "professional_services", q2_goal: "trust" };

test("R3G atomically migrates only authority v2 with all options and a 38/15/23 ledger", () => {
  assert.deepEqual(summary, { total: 38, migrated: 15, pending: 23 });
  assert.deepEqual(batch.map((m) => m.questionId), [authority]);
  assert.equal(question(authority).version, 2);
  assert.equal(question(authority).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionEvidenceV3(question(authority)), []);
  assert.deepEqual(Object.keys(question(authority).evidenceV3!.dimensions[0]!.answers).sort(), question(authority).options.map((o) => o.value).sort());
});

test("R3G every authority option observes direct Trust only, with its own version identity", () => {
  for (const [answer, state, contribution] of [
    ["clearly_visible", "established", 0.75], ["partial", "partial", 0.5], ["not_really", "weak", 0.25], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [authority]: answer });
    assert.equal(evidence.length, 1);
    const e = evidence[0]!;
    assert.deepEqual([e.dimension, e.directness, e.state, e.contribution], ["trust_reputation", "direct", state, contribution]);
    assert.equal(e.migrationIdentity, `${authority}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.equal(e.questionVersion, 2);
    assert.deepEqual(e.answer, [answer]);
  }
});

test("R3G visible experience and external social proof coexist as distinct direct observations", () => {
  const eligible = resolveEligibleQuestionsV2(seed, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(authority));
  assert.ok(eligible.includes(reputation));
  for (const [own, external] of [["clearly_visible", "weak"], ["not_really", "strong"]] as const) {
    const evidence = derive({ [authority]: own, [reputation]: external });
    assert.equal(evidence.length, 2);
    assert.equal(new Set(evidence.map((e) => e.observationId)).size, 2);
    assert.deepEqual(evidence.filter((e) => e.questionId === authority), derive({ [authority]: own }));
    assert.deepEqual(evidence.filter((e) => e.questionId === reputation), derive({ [reputation]: external }));
    assert.ok(evidence.every((e) => e.dimension === "trust_reputation" && e.directness === "direct"));
    assert.equal(evidence.find((e) => e.questionId === reputation)!.migrationIdentity, `${reputation}@v3`);
    assert.notEqual(evidence[0]!.state, evidence[1]!.state);
  }
});

test("R3G unknown is null and leaves established reputation's scoring denominator unchanged", () => {
  const context = resolveEligibleQuestionsV2(seed, candidate).context;
  const score = (answers: AnswersV2) => scoreContextualDimensions({ answers: {}, context, evidence: derive(answers), bank: candidate }).dimensions.find((d) => d.id === "trust_reputation")!;
  const neutral = derive({ [authority]: "unknown" });
  assert.equal(neutral[0]!.contribution, null);
  const alone = score({ [authority]: "unknown" });
  assert.equal(alone.score, null);
  assert.deepEqual(alone.explainability.strengths, []);
  assert.deepEqual(alone.explainability.weaknesses, []);
  assert.deepEqual(alone.explainability.missing, []);
  assert.equal(score({ [reputation]: "strong", [authority]: "unknown" }).score, score({ [reputation]: "strong" }).score);
  assert.ok(!question(authority).options.some((o) => o.kind === "not_applicable"));
  assert.deepEqual(derive({ [authority]: "not_applicable" }), []);
});

test("R3G sector, trust goal and trust friction unlock routing without supplying evidence", () => {
  for (const sector of ["legal", "financial_tax_insurance", "professional_services", "real_estate"]) {
    for (const need of [{ q2_goal: "trust" }, { q2_goal: "other", q2_friction: "trust" }]) {
      const answers = { ...seed, q2_sector: sector, ...need };
      assert.ok(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(authority));
      assert.deepEqual(derive(answers), []);
      assert.deepEqual(derive({ ...answers, [authority]: "clearly_visible" }), derive({ [authority]: "clearly_visible" }));
      assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
    }
  }
  assert.ok(!resolveEligibleQuestionsV2({ ...seed, q2_has_customers: "no" }, candidate).eligibleQuestionIds.includes(authority));
  assert.ok(!resolveEligibleQuestionsV2({ ...seed, q2_goal: "organize" }, candidate).eligibleQuestionIds.includes(authority));
});

test("R3G no credential, popularity, profession prestige or downstream capability is inferred", () => {
  for (const option of question(authority).options) {
    const evidence = derive({ [authority]: option.value });
    for (const label of ["certified", "no_certification", "portfolio", "lawyer", "designer", "coach", "contractor", "prestigious", "many_followers", "high_traffic", "high_sales", "many_clients", "CRM", "automation", "clear_offer", "easy_booking"]) {
      assert.deepEqual(derive({ [authority]: option.value, unrelated_authority_fixture: label }), evidence);
      assert.deepEqual(derive({ [authority]: label }), []);
    }
    assert.deepEqual(resolveEligibleQuestionsV2({ ...seed, [authority]: option.value }, candidate).context, resolveEligibleQuestionsV2(seed, candidate).context);
  }
  assert.ok(!question(authority).options.some((o) => o.produces?.length));
  assert.equal(derive({ [authority]: "not_really" })[0]!.state, "weak");
});

test("R3G professional intake stays pending and emits no inherited or migrated evidence", () => {
  assert.equal(question(intake).evidenceMigration, "pending");
  for (const option of question(intake).options) {
    assert.deepEqual(derive({ [intake]: option.value }), []);
    assert.deepEqual(derive({ [authority]: "clearly_visible", [intake]: option.value }), derive({ [authority]: "clearly_visible" }));
  }
});

test("R3G incorrect version or incomplete mapping fails closed while legacy remains historical", () => {
  const q = question(authority);
  const wrong = { ...q, version: 1 as const };
  assert.ok(validateQuestionEvidenceV3(wrong).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [authority]: "clearly_visible" }, [wrong]), []);
  const reading = q.evidenceV3!.dimensions[0]!;
  const { unknown: _unknown, ...incomplete } = reading.answers;
  const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
  assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [authority]: "clearly_visible" }, [invalid]), []);
  const old = legacy.find((q) => q.id === authority)!;
  assert.equal(old.version, 1);
  assert.equal(old.evidenceMigration, undefined);
  for (const option of old.options) {
    const answers = { [authority]: option.value };
    const evidence = deriveContextualEvidence(answers, legacy);
    assert.deepEqual(evidence, deriveContextualEvidence(answers, [old]));
    assert.ok(evidence.every((e) => e.questionVersion === undefined));
  }
});

test("R3G preserves all R2 definitions, inactive candidate and legacy 85/v1 runtime", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(question(authority).routingRole, "adaptive");
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
