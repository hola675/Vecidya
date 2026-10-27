import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicBank } from "../../../app/features/diagnostic/qa03b/bank";
import { buildCandidateEditorialMatrixV9, buildEditorialMatrixV9, buildEditorialReviewQueueV9, buildEditorialReviewBatchesV9, countEditorialReviewPrioritiesV9, listHighPriorityEditorialQuestionsV9, buildHighPriorityEditorialReportV9, listMissingEvidenceOptionsV9, auditMissingEvidenceDimensionsV9, groupMissingEvidenceByDimensionV9, classifyEditorialReviewPriorityV9, V9_P1_EDITORIAL_DECISIONS } from "../../../app/features/diagnostic/qa03b/v9-editorial-review-matrix";

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

test("P1 classification: entity, activity and customer history preserve explicit neutral answers", () => {
  const cases = [
    { id: "q2_entity", expected: ["individual", "business", "organization", "project", "unknown"] },
    { id: "q2_operational_status", expected: ["preparing", "operating", "paused", "unknown"] },
    { id: "q2_has_customers", expected: ["yes", "no", "unknown"] },
  ] as const;
  for (const { id, expected } of cases) {
    const question = bank.find((q) => q.id === id);
    assert.ok(question, id);
    assert.equal(question.type, "single", id);
    assert.deepEqual(question.options.map((option) => option.value), [...expected], id);
    assert.equal(question.options.find((option) => option.value === "unknown")?.kind, "unknown", id);
    assert.ok(question.options.every((option) => option.label.trim().length > 0), id);
    assert.equal(new Set(question.options.map((option) => option.value)).size, question.options.length, id);
  }
});

test("P1 classification: real customer history does not infer activity status", () => {
  const customerHistory = bank.find((q) => q.id === "q2_has_customers");
  const status = bank.find((q) => q.id === "q2_operational_status");
  assert.ok(customerHistory);
  assert.ok(status);
  assert.match(customerHistory.hint ?? "", /pausa/i);
  assert.match(status.hint ?? "", /aunque hayas atendido personas antes/i);
  assert.ok(status.options.some((option) => option.value === "paused"));
  assert.ok(status.options.some((option) => option.value === "preparing"));
  assert.ok(customerHistory.options.some((option) => option.value === "no"));
});

test("P1: la matriz identifica opciones sin lectura de evidencia en preguntas migradas", () => {
  const source = bank.find((q) => q.evidenceMigration === "migrated" && (q.evidenceV3?.dimensions.length ?? 0) > 0);
  assert.ok(source);
  const dimension = source.evidenceV3!.dimensions[0];
  const option = source.options[0];
  const modified = {
    ...source,
    evidenceV3: {
      ...source.evidenceV3!,
      dimensions: source.evidenceV3!.dimensions.map((item, index) =>
        index === 0
          ? { ...item, answers: Object.fromEntries(Object.entries(dimension.answers).filter(([value]) => value !== option.value)) }
          : item,
      ),
    },
  };
  const matrix = buildEditorialMatrixV9([modified]);
  const answer = matrix.rows[0].options.find((item) => item.value === option.value);
  assert.ok(answer);
  assert.ok(answer.reviewFlags.includes("missing_evidence_mapping"));
  assert.ok(matrix.summary.reviewFlags > 0);
});

test("P1: las respuestas neutrales con lectura de evidencia se señalan sin alterar el banco", () => {
  const source = bank.find((q) => q.evidenceMigration === "migrated" && (q.evidenceV3?.dimensions.length ?? 0) > 0);
  assert.ok(source);
  const option = source.options[0];
  const modified = {
    ...source,
    options: source.options.map((item, index) => index === 0 ? { ...item, kind: "unknown" as const } : item),
  };
  const before = JSON.stringify(modified);
  const matrix = buildEditorialMatrixV9([modified]);
  const answer = matrix.rows[0].options.find((item) => item.value === option.value);
  assert.ok(answer);
  assert.ok(answer.readsAs.length > 0);
  assert.ok(answer.reviewFlags.includes("neutral_with_evidence"));
  assert.equal(JSON.stringify(modified), before);
});

test("P1: cola editorial conserva trazabilidad de preguntas, opciones y alertas", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const queue = buildEditorialReviewQueueV9(matrix);
  assert.equal(queue.length, matrix.rows.reduce(
    (total, row) => total + row.options.filter((option) => option.reviewFlags.length > 0).length, 0,
  ));
  for (const item of queue) {
    const row = matrix.rows.find((candidate) => candidate.id === item.questionId);
    assert.ok(row);
    const option = row.options.find((candidate) => candidate.value === item.optionValue);
    assert.ok(option);
    assert.deepEqual(item.flags, option.reviewFlags);
    assert.equal(item.decision, row.decision);
    assert.equal(item.nextAction, row.nextAction);
  }
  assert.deepEqual(buildEditorialReviewQueueV9(matrix), queue);
});

test("P1: prioridades editoriales distinguen evidencia incompleta, neutralidad y redaccion", () => {
  assert.equal(classifyEditorialReviewPriorityV9(["missing_evidence_mapping"]), "high");
  assert.equal(classifyEditorialReviewPriorityV9(["neutral_with_evidence"]), "medium");
  assert.equal(classifyEditorialReviewPriorityV9(["needs_neutral_check"]), "medium");
  assert.equal(classifyEditorialReviewPriorityV9(["long_label"]), "low");
  assert.equal(classifyEditorialReviewPriorityV9(["ambiguous_choice"]), "low");
  assert.equal(classifyEditorialReviewPriorityV9(["long_label", "missing_evidence_mapping"]), "high");
  for (const item of buildEditorialReviewQueueV9(buildCandidateEditorialMatrixV9())) {
    assert.equal(item.priority, classifyEditorialReviewPriorityV9(item.flags));
  }
});

test("P1: lotes editoriales agrupan alertas por pregunta y prioridad estable", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const queue = buildEditorialReviewQueueV9(matrix);
  const batches = buildEditorialReviewBatchesV9(matrix);
  assert.equal(batches.reduce((total, batch) => total + batch.items.length, 0), queue.length);
  assert.equal(new Set(batches.map((batch) => batch.questionId)).size, batches.length);
  const rank = { high: 0, medium: 1, low: 2 };
  for (let index = 1; index < batches.length; index++) {
    assert.ok(rank[batches[index - 1].priority] <= rank[batches[index].priority]);
  }
  for (const batch of batches) {
    assert.ok(batch.items.length > 0);
    assert.ok(batch.items.every((item) => item.questionId === batch.questionId));
    assert.equal(rank[batch.priority], Math.min(...batch.items.map((item) => rank[item.priority])));
  }
  assert.deepEqual(buildEditorialReviewBatchesV9(matrix), batches);
});

test("P1: los totales de prioridad cubren exactamente las opciones con alertas", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const queue = buildEditorialReviewQueueV9(matrix);
  const totals = countEditorialReviewPrioritiesV9(matrix);
  assert.equal(totals.high + totals.medium + totals.low, queue.length);
  for (const priority of ["high", "medium", "low"] as const) {
    assert.equal(totals[priority], queue.filter((item) => item.priority === priority).length);
  }
  assert.deepEqual(countEditorialReviewPrioritiesV9(matrix), totals);
  assert.deepEqual(countEditorialReviewPrioritiesV9(buildEditorialMatrixV9([])), { high: 0, medium: 0, low: 0 });
});

test("P1: preguntas prioritarias identifican exclusivamente opciones sin mapeo de evidencia", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const questions = listHighPriorityEditorialQuestionsV9(matrix);
  const queue = buildEditorialReviewQueueV9(matrix);
  assert.equal(new Set(questions.map((item) => item.questionId)).size, questions.length);
  assert.equal(questions.reduce((sum, item) => sum + item.optionValues.length, 0),
    queue.filter((item) => item.priority === "high").length);
  for (const item of questions) {
    assert.ok(item.optionValues.length > 0);
    for (const value of item.optionValues) {
      assert.ok(queue.some((candidate) =>
        candidate.questionId === item.questionId && candidate.optionValue === value &&
        candidate.flags.includes("missing_evidence_mapping")));
    }
  }
  assert.deepEqual(listHighPriorityEditorialQuestionsV9(buildEditorialMatrixV9([])), []);
});

test("P1: informe legible de prioridad alta conserva textos y alertas originales", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const report = buildHighPriorityEditorialReportV9(matrix);
  const queue = buildEditorialReviewQueueV9(matrix).filter((item) => item.priority === "high");
  assert.equal(report.reduce((sum, row) => sum + row.options.length, 0), queue.length);
  for (const row of report) {
    const original = matrix.rows.find((candidate) => candidate.id === row.questionId);
    assert.ok(original);
    assert.equal(row.prompt, original.prompt);
    for (const option of row.options) {
      const source = original.options.find((candidate) => candidate.value === option.value);
      assert.ok(source);
      assert.equal(option.label, source.label);
      assert.deepEqual(option.flags, source.reviewFlags);
      assert.ok(option.flags.includes("missing_evidence_mapping"));
    }
  }
  assert.deepEqual(buildHighPriorityEditorialReportV9(buildEditorialMatrixV9([])), []);
});

test("P1: opciones con evidencia incompleta conservan identificadores verificables", () => {
  const matrix = buildCandidateEditorialMatrixV9();
  const expected = buildEditorialReviewQueueV9(matrix)
    .filter((item) => item.flags.includes("missing_evidence_mapping"))
    .map((item) => ({ questionId: item.questionId, optionValue: item.optionValue }));
  assert.deepEqual(listMissingEvidenceOptionsV9(matrix), expected);
  assert.deepEqual(listMissingEvidenceOptionsV9(buildEditorialMatrixV9([])), []);
});

test("P1: dimensiones ausentes provienen del banco y coinciden con las alertas altas", () => {
  const details = auditMissingEvidenceDimensionsV9(bank);
  const expected = listMissingEvidenceOptionsV9(buildCandidateEditorialMatrixV9());
  assert.deepEqual(details.map(({ questionId, optionValue }) => ({ questionId, optionValue })), expected);
  for (const detail of details) {
    const question = bank.find((item) => item.id === detail.questionId);
    assert.ok(question);
    assert.equal(question.evidenceMigration, "migrated");
    for (const dimension of detail.missingDimensions) {
      const source = question.evidenceV3?.dimensions.find((item) => item.dimension === dimension);
      assert.ok(source);
      assert.equal(source.answers[detail.optionValue], undefined);
    }
  }
  assert.deepEqual(auditMissingEvidenceDimensionsV9([]), []);
});

test("P1: agrupación por dimensión preserva todos los huecos reales sin duplicarlos", () => {
  const details = auditMissingEvidenceDimensionsV9(bank);
  const grouped = groupMissingEvidenceByDimensionV9(bank);
  const expected = details.flatMap((item) => item.missingDimensions.map((dimension) =>
    JSON.stringify([dimension, item.questionId, item.optionValue])));
  const actual = grouped.flatMap((group) => group.affectedOptions.map((item) =>
    JSON.stringify([group.dimension, item.questionId, item.optionValue])));
  assert.deepEqual(actual.slice().sort(), expected.slice().sort());
  assert.equal(new Set(grouped.map((item) => item.dimension)).size, grouped.length);
  assert.deepEqual(groupMissingEvidenceByDimensionV9([]), []);
});

test("P1: las tres ramas especializadas tienen evidencia completa y estados neutrales explícitos", () => {
  const ids = [
    "q2_dental_care_continuation",
    "q2_food_menu_visibility",
    "q2_marketing_agency_scope_clarity",
  ];
  const missing = auditMissingEvidenceDimensionsV9(bank);
  for (const id of ids) {
    const question = bank.find((item) => item.id === id);
    assert.ok(question, "Pregunta especializada ausente: " + id);
    assert.equal(question.evidenceMigration, "migrated");
    assert.ok((question.evidenceV3?.dimensions.length ?? 0) > 0);
    assert.ok(!missing.some((item) => item.questionId === id));
    for (const dimension of question.evidenceV3!.dimensions) {
      assert.equal(dimension.answers.not_applicable, "not_applicable");
      assert.equal(dimension.answers.unknown, "uncertainty");
      assert.equal(dimension.answers.clear === undefined || dimension.answers.clear === "established", true);
    }
  }
});
