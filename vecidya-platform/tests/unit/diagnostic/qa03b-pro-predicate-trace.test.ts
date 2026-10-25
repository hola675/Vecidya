import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { evaluateRuleV2Trace, type RuleV2Trace, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

function leaves(trace: RuleV2Trace, path = "root"): { path: string; op: string; result: boolean; observed?: string | readonly string[] }[] {
  if (trace.children?.length) return trace.children.flatMap((child, index) => leaves(child, `${path}.${index}`));
  return [{ path, op: trace.rule.op, result: trace.result, ...(trace.observed === undefined ? {} : { observed: trace.observed }) }];
}

test("DIAG-PRO-06: record failing eligibility predicates using canonical rule traces", () => {
  const bank = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let answers: AnswersV2 = {};
    let result = runCandidateDiagnosticPipelineV3(answers);
    const asked: string[] = [];
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = result.plan.nextQuestionId;
      assert.ok(!asked.includes(id), `${variant.id}: duplicate question ${id}`);
      const value = variant.answerScript[id];
      assert.notEqual(value, undefined, `${variant.id}: missing answer ${id}`);
      asked.push(id);
      answers = { ...result.plan.activeAnswers, [id]: value };
      result = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished route`);
    const excluded = result.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .flatMap((dimension) => dimension.directSourceQuestionIds.map((questionId) => {
        const question = bank.get(questionId);
        assert.ok(question, `${variant.id}: missing source ${questionId}`);
        const standard = question.appliesWhen ? evaluateRuleV2Trace(question.appliesWhen, result.plan.activeAnswers, result.plan.context) : undefined;
        const material = question.materialAppliesWhen ? evaluateRuleV2Trace(question.materialAppliesWhen, result.plan.activeAnswers, result.plan.context) : undefined;
        const eligible = (standard?.result ?? !question.materialAppliesWhen) || (material?.result ?? false);
        assert.equal(eligible, false, `${variant.id}/${questionId}: source unexpectedly eligible`);
        return {
          dimension: dimension.dimension, questionId,
          standard: standard ? { result: standard.result, trace: standard.trace, leaves: leaves(standard.trace) } : null,
          material: material ? { result: material.result, trace: material.trace, leaves: leaves(material.trace) } : null,
        };
      }));
    return { profile: variant.id, excluded };
  });
  const failures: Record<string, number> = {};
  for (const row of rows) for (const item of row.excluded) {
    for (const entry of [item.standard, item.material]) {
      if (!entry) continue;
      for (const leaf of entry.leaves.filter((leaf) => !leaf.result)) {
        const key = `${item.questionId}:${leaf.path}:${leaf.op}`;
        failures[key] = (failures[key] ?? 0) + 1;
      }
    }
  }
  console.log("DIAG_PRO_06_PREDICATE_TRACE=" + JSON.stringify({
    totals: { profiles: rows.length, excludedPairs: rows.reduce((sum, row) => sum + row.excluded.length, 0), failingLeafKeys: Object.keys(failures).length },
    failures, rows,
  }));
});
