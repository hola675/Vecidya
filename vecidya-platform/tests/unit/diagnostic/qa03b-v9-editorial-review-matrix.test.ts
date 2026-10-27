import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicBank } from "../../../app/features/diagnostic/qa03b/bank";
import { buildCandidateEditorialMatrixV9, buildEditorialMatrixV9, V9_P1_EDITORIAL_DECISIONS } from "../../../app/features/diagnostic/qa03b/v9-editorial-review-matrix";

test("P1b: matriz completa de 77 preguntas / 387 opciones / 15 variantes, sin considerar pendientes aprobadas", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  assert.equal(matrix.summary.questions, 77);
  assert.equal(matrix.summary.options, 387);
  assert.equal(matrix.summary.variants, 15);
  assert.equal(matrix.summary.revised, 4);
  assert.equal(matrix.summary.semanticReview, 4);
  assert.equal(matrix.summary.pendingHumanReview, 69);
  assert.equal(matrix.rows.length, bank.length);
  assert.deepEqual(matrix.rows.map((r) => r.id), bank.map((q) => q.id));
  assert.deepEqual(matrix.rows.map((r) => r.options.map((o) => o.value)), bank.map((q) => q.options.map((o) => o.value)));
  console.log("DIAG_V9_P1_MATRIX " + JSON.stringify(matrix.summary));
});

test("P1b: cada opción migrada conserva la lectura original de evidencia (sin score inventado)", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  for (const question of bank) {
    const row = matrix.rows.find((r) => r.id === question.id);
    assert.ok(row, question.id);
    for (const option of question.options) {
      const answer = row.options.find((o) => o.value === option.value);
      assert.ok(answer, question.id + "." + option.value);
      for (const dimension of question.evidenceV3?.dimensions ?? []) {
        assert.equal(answer.readsAs.find((r) => r.dimension === dimension.dimension)?.state, dimension.answers[option.value],
          question.id + "." + option.value + "/" + dimension.dimension);
      }
      if (question.evidenceMigration !== "migrated") assert.deepEqual(answer.readsAs, []);
    }
  }
});

test("P1b: decisiones explícitas no contaminan preguntas restantes", () => {
  const m = buildCandidateEditorialMatrixV9();
  assert.equal(Object.keys(V9_P1_EDITORIAL_DECISIONS).length, 8);
  for (const [id, entry] of Object.entries(V9_P1_EDITORIAL_DECISIONS)) {
    const row = m.rows.find((q) => q.id === id);
    assert.ok(row);
    assert.equal(row.decision, entry.status);
    assert.ok(row.decisionReason);
    assert.ok(row.nextAction);
  }
  assert.equal(m.rows.find((q) => q.id === "q2_sector")?.decision, "pending_human_review");
});

test("P1b: editor mantiene V8 público inalterado y el catálogo auditado no se muta", () => {
  const baseline = JSON.stringify(bank);
  buildCandidateEditorialMatrixV9();
  assert.equal(JSON.stringify(bank), baseline);
  assert.equal(publicBank.length, 45);
  assert.notEqual(publicBank.find((q) => q.id === "q2_monetization")?.prompt,
    bank.find((q) => q.id === "q2_monetization")?.prompt);
});

test("P1b: la matriz puede auditar banco sintético sin reclamar todas las preguntas V9", () => {
  const original = bank.find((q) => q.id === "q2_goal");
  assert.ok(original);
  const matrix = buildEditorialMatrixV9([original]);
  assert.equal(matrix.summary.questions, 1);
  assert.equal(matrix.summary.options, original.options.length);
});
