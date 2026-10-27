import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as v9Bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicBank } from "../../../app/features/diagnostic/qa03b/bank";
import { eqV2 } from "../../../app/features/diagnostic/qbv2-rules";
import {
  auditQuestionBankV9, auditV9CandidateBank, findAnswerReferenceCyclesV9,
} from "../../../app/features/diagnostic/qa03b/v9-editorial-graph-audit";

test("P0: las 77 preguntas, opciones, variantes y dimensiones quedan inventariadas sin excluir las no puntuables", () => {
  const report = auditV9CandidateBank();
  assert.equal(report.summary.questionCount, 77);
  assert.equal(new Set(report.questions.map((q) => q.id)).size, 77);
  assert.equal(report.summary.optionCount, v9Bank.reduce((n, q) => n + q.options.length, 0));
  assert.equal(report.summary.variantCount, v9Bank.reduce((n, q) => n + (q.variants?.length ?? 0), 0));
  assert.equal(Object.values(report.summary.byGrade).reduce((a, b) => a + b, 0), 77);
  assert.deepEqual(report.questions.map((q) => q.id), v9Bank.map((q) => q.id));
  assert.ok(report.questions.every((q) => q.options.length > 0));
  assert.equal(report.questions.find((q) => q.id === "q2_sector")?.grade, "G1");
  assert.equal(report.questions.find((q) => q.id === "q2_goal")?.grade, "G3");
  assert.ok(report.questions.find((q) => q.id === "q2_dental_care_continuation")?.evidenceDimensions.some((e) => e.id === "relationship_recurrence"));
  assert.ok(report.questions.some((q) => q.evidenceMigration === "pending"));
  // Audit observacional: P0 no convierte deuda detectada en una aprobación editorial.
  console.log("DIAG_V9_P0_INVENTORY " + JSON.stringify(report.summary));
  console.log("DIAG_V9_P0_REVIEW_IDS " + JSON.stringify([...new Set(report.issues.filter((i) => i.level === "review").map((i) => i.questionId))].sort()));
  console.log("DIAG_V9_P0_BLOCKERS " + JSON.stringify(report.issues.filter((i) => i.level === "blocker")));
});

test("P0: grafo traza referencias y evidencia sin confundir un contexto con una respuesta", () => {
  const report = auditV9CandidateBank();
  assert.ok(report.edges.some((edge) => edge.from === "q2_niche_health_wellness"
    && edge.to === "q2_dental_care_continuation" && edge.relation === "answer_reference"));
  assert.ok(report.edges.some((edge) => edge.from === "q2_dental_care_continuation"
    && edge.to === "dimension:relationship_recurrence" && edge.relation === "evidence_dimension"));
  const question = report.questions.find((q) => q.id === "q2_dental_care_continuation");
  assert.ok(question?.answerDependencies.includes("q2_niche_health_wellness"));
  assert.ok(report.questions.find((q) => q.id === "q2_sector")?.options.some((o) => o.value === "unknown"));
});

test("P0: el auditor rechaza referencias huérfanas, valores inventados y ciclos en bancos sintéticos", () => {
  const original = v9Bank.find((q) => q.id === "q2_goal");
  assert.ok(original);
  const invalid = [
    { ...original, id: "test_alpha", appliesWhen: eqV2("test_beta", "yes"), materialAppliesWhen: undefined,
      options: [{ value: "yes", label: "Sí" }, { value: "yes", label: "Igual" }] },
    { ...original, id: "test_beta", appliesWhen: eqV2("test_alpha", "yes"), materialAppliesWhen: undefined,
      options: [{ value: "no", label: "No" }] },
    { ...original, id: "test_missing", appliesWhen: eqV2("missing_question", "yes"), materialAppliesWhen: undefined },
  ] as typeof v9Bank[number][];
  const report = auditQuestionBankV9(invalid);
  const codes = report.issues.map((issue) => issue.code);
  assert.ok(codes.includes("dependency_cycle"));
  assert.ok(codes.includes("invalid_option_ref"));
  assert.ok(codes.includes("unknown_question_ref"));
  assert.ok(codes.includes("duplicate_option"));
  assert.deepEqual(findAnswerReferenceCyclesV9([], new Set(["test_alpha"])), []);
});

test("P1: reportar ambigüedades, pero no reescribir respuestas ni cambiar el scorer", () => {
  const before = JSON.stringify(v9Bank);
  const report = auditV9CandidateBank();
  assert.equal(JSON.stringify(v9Bank), before);
  assert.equal(publicBank.length, 45);
  assert.equal(publicBank.find((q) => q.id === "q2_sector")?.version, 3);
  assert.ok(report.summary.reviewCount >= 0);
  assert.ok(report.issues.every((issue) => issue.level === "blocker" || issue.level === "review"));
});
