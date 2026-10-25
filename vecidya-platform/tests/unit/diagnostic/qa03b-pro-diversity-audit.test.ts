import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

test("DIAG-PRO-01: audita diversidad de respuestas y procedencia en los 60 recorridos", () => {
  const byQuestion = new Map<string, Map<string, number>>();
  const rows: unknown[] = [];
  for (const variant of QA03B_PROFILE_KNOWLEDGE_VARIANTS) {
    let answers: AnswersV2 = {};
    const asked: string[] = [];
    let final = runCandidateDiagnosticPipelineV3(answers);
    for (let turn = 0; final.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = final.plan.nextQuestionId;
      const value = variant.answerScript[id];
      assert.notEqual(value, undefined, `${variant.id}: missing answer ${id}`);
      const key = JSON.stringify(value);
      const counts = byQuestion.get(id) ?? new Map<string, number>();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      byQuestion.set(id, counts);
      asked.push(id);
      answers = { ...final.plan.activeAnswers, [id]: value };
      final = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(final.plan.nextQuestionId, undefined, `${variant.id}: unfinished route`);
    const answered = new Set(asked);
    const modeled = variant.modeledAssumptionQuestionIds.filter((id) => answered.has(id));
    const interpreted = variant.interpretedSourceQuestionIds.filter((id) => answered.has(id));
    const unknown = variant.unknownByDesignQuestionIds.filter((id) => answered.has(id));
    rows.push({
      profile: variant.id, routeLength: asked.length, questions: asked,
      answeredModeledAssumptions: modeled, answeredSourceInterpretations: interpreted,
      answeredUnknownByDesign: unknown,
      directEvidenceDimensions: final.scoring.dimensions.filter((d) => d.confidence.direct > 0).map((d) => d.id),
      scoredDimensions: final.scoring.dimensions.filter((d) => d.score !== null).map((d) => d.id),
      globalScore: final.overall.index.displayScore,
    });
  }
  const diversity = [...byQuestion].map(([questionId, responses]) => ({
    questionId, distinctAnswers: responses.size, frequency: Object.fromEntries(responses),
  })).sort((a, b) => a.questionId.localeCompare(b.questionId));
  const totals = {
    cases: rows.length, askedQuestions: diversity.length,
    singleResponseQuestions: diversity.filter((q) => q.distinctAnswers === 1).map((q) => q.questionId),
    variableResponseQuestions: diversity.filter((q) => q.distinctAnswers > 1).map((q) => q.questionId),
  };
  assert.equal(rows.length, 60);
  console.log("DIAG_PRO_01_DIVERSITY_AUDIT=" + JSON.stringify({ totals, diversity, rows }));
});
