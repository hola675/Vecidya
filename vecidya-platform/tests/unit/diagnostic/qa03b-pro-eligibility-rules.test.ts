import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

test("DIAG-PRO-05: explain direct-source eligibility using the engine's own rule evaluator", () => {
  const bank = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((q) => [q.id, q]));
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let answers: AnswersV2 = {};
    let result = runCandidateDiagnosticPipelineV3(answers);
    const asked: string[] = [];
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = result.plan.nextQuestionId;
      assert.ok(!asked.includes(id), `${variant.id}: repeated ${id}`);
      const value = variant.answerScript[id];
      assert.notEqual(value, undefined, `${variant.id}: missing answer ${id}`);
      asked.push(id);
      answers = { ...result.plan.activeAnswers, [id]: value };
      result = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: route unfinished`);
    const excluded = result.overall.index.dimensionObservability
      .filter((item) => item.reason === "no_direct_source_in_context")
      .flatMap((item) => item.directSourceQuestionIds.map((questionId) => {
        const question = bank.get(questionId);
        assert.ok(question, `${variant.id}: missing bank question ${questionId}`);
        const applies = question.appliesWhen ? evaluateRuleV2(question.appliesWhen, result.plan.activeAnswers, result.plan.context) : !question.materialAppliesWhen;
        const material = question.materialAppliesWhen !== undefined && evaluateRuleV2(question.materialAppliesWhen, result.plan.activeAnswers, result.plan.context);
        const eligible = applies || material;
        const plannerEligible = result.plan.eligibleQuestionIds.includes(questionId);
        assert.equal(eligible, false, `${variant.id}/${questionId}: source unexpectedly eligible by engine rule`);
        assert.equal(plannerEligible, false, `${variant.id}/${questionId}: source unexpectedly in eligible list`);
        return {
          dimension: item.dimension, questionId,
          appliesWhenPresent: question.appliesWhen !== undefined,
          materialAppliesWhenPresent: question.materialAppliesWhen !== undefined,
          appliesWhenSatisfied: applies,
          materialAppliesWhenSatisfied: material,
          rule: question.appliesWhen ?? null,
          materialRule: question.materialAppliesWhen ?? null,
        };
      }));
    return { profile: variant.id, excluded };
  });
  const byQuestion: Record<string, { observations: number; dimensions: string[]; withMaterialRule: number }> = {};
  for (const row of rows) for (const item of row.excluded) {
    const entry = byQuestion[item.questionId] ?? { observations: 0, dimensions: [], withMaterialRule: 0 };
    entry.observations += 1;
    if (!entry.dimensions.includes(item.dimension)) entry.dimensions.push(item.dimension);
    if (item.materialAppliesWhenPresent) entry.withMaterialRule += 1;
    byQuestion[item.questionId] = entry;
  }
  console.log("DIAG_PRO_05_ELIGIBILITY_RULES=" + JSON.stringify({
    totals: { profiles: rows.length, excludedSourcePairs: rows.reduce((sum, row) => sum + row.excluded.length, 0), distinctQuestions: Object.keys(byQuestion).length },
    byQuestion, rows,
  }));
});
