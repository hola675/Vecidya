import assert from "node:assert/strict";
import test from "node:test";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as EVIDENCE_BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const byId = new Map(BANK.map((question) => [question.id, question]));

test("DIAG-V3-QA-01 inventory stays on the unregistered 38-question candidate contract", () => {
  assert.equal(BANK.length, 38);
  assert.equal(new Set(BANK.map(({ id }) => id)).size, 38);
  assert.equal(BANK.reduce((count, question) => count + question.options.length, 0), 195);
  assert.deepEqual(validateQuestionBankV2(BANK), []);
  assert.deepEqual(validateQuestionCopyV2(BANK), []);
  assert.notEqual(BANK, EVIDENCE_BANK);
  assert.deepEqual(BANK.map(({ id }) => id), EVIDENCE_BANK.map(({ id }) => id));
});

test("every candidate answer value is unique per question and every copy variant preserves the answer contract", () => {
  for (const question of BANK) {
    const values = question.options.map(({ value }) => value);
    assert.equal(new Set(values).size, values.length, `${question.id}: duplicate canonical option value`);

    for (const option of question.options) {
      assert.ok(option.label.trim(), `${question.id}/${option.value}: empty visible label`);
      assert.ok(option.kind === undefined || ["value", "none", "unknown", "not_applicable"].includes(option.kind));
      assert.ok(!option.exclusive || question.type === "multi", `${question.id}/${option.value}: exclusivity on single choice`);
    }

    for (const variant of question.variants ?? []) {
      assert.ok(Object.keys(variant).every((key) => ["target", "prompt", "hint", "optionLabels"].includes(key)),
        `${question.id}: variant may only provide copy and a targeting condition`);
      for (const value of Object.keys(variant.optionLabels ?? {})) {
        assert.ok(values.includes(value), `${question.id}: variant introduces noncanonical option ${value}`);
      }
    }
  }
});

test("candidate questions without an explicit unknown answer remain visible as a reviewed contract gap", () => {
  const actual = BANK.filter((question) => !question.options.some(({ kind }) => kind === "unknown")).map(({ id }) => id);
  assert.deepEqual(actual, ["q2_entity", "q2_other_staff", "q2_has_customers", "q2_sector", "q2_customer_reach", "q2_customer_buyer"]);
});

test("evidence overlay has one record per candidate question and never falls back to production QBV2", () => {
  assert.equal(EVIDENCE_BANK.length, BANK.length);
  assert.deepEqual(EVIDENCE_BANK.map(({ id }) => id), BANK.map(({ id }) => id));
  for (const question of EVIDENCE_BANK) {
    const source = byId.get(question.id)!;
    assert.equal(question.version, source.version, `${question.id}: evidence overlay cannot replace the question version`);
    assert.deepEqual(question.options.map(({ value, label, kind, exclusive, produces }) => ({ value, label, kind, exclusive, produces })),
      source.options.map(({ value, label, kind, exclusive, produces }) => ({ value, label, kind, exclusive, produces })),
      `${question.id}: evidence overlay cannot change question copy or answer semantics`);
    if (question.evidenceMigration === "migrated") {
      assert.ok(question.evidenceV3, `${question.id}: migrated question must carry evidence metadata`);
    } else {
      assert.equal(question.evidenceMigration, "pending", `${question.id}: migration state must be explicit`);
      assert.equal(question.evidenceV3, undefined, `${question.id}: pending question cannot carry scoring evidence`);
    }
  }
});
