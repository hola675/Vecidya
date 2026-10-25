import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { evaluateRuleV2Trace, type RuleV2Trace, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

/** Minimal sets of leaf truth values sufficient to make this Boolean tree true.
 * These are logical counterfactuals, NOT claims that the underlying answers/context can be changed. */
function alternatives(node: RuleV2Trace, want: boolean, path = "root"): string[][] {
  const children = node.children ?? [];
  if (children.length === 0) return node.result === want ? [[]] : [[`${path}:${node.rule.op}`]];
  if (node.rule.op === "not") return alternatives(children[0], !want, `${path}.0`);
  const conjunctive = (node.rule.op === "and" && want) || (node.rule.op === "or" && !want);
  const sets = children.map((child, index) => alternatives(child, want, `${path}.${index}`));
  if (!conjunctive) return sets.flat();
  return sets.reduce<string[][]>((acc, next) => acc.flatMap((left) => next.map((right) => [...left, ...right])), [[]]);
}
function minimal(node: RuleV2Trace): string[][] {
  const sets = alternatives(node, true).map((set) => [...new Set(set)].sort());
  const unique = [...new Map(sets.map((set) => [JSON.stringify(set), set])).values()];
  return unique.filter((set) => !unique.some((other) => other !== set && other.length < set.length && other.every((key) => set.includes(key))))
    .sort((a, b) => a.length - b.length || a.join().localeCompare(b.join()));
}

test("DIAG-PRO-07: identify decisive logical alternatives without mistaking NOT leaves for blockers", () => {
  const bank = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let answers: AnswersV2 = {};
    let result = runCandidateDiagnosticPipelineV3(answers);
    const asked: string[] = [];
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = result.plan.nextQuestionId;
      assert.ok(!asked.includes(id), `${variant.id}: repeated ${id}`);
      const value = variant.answerScript[id];
      assert.notEqual(value, undefined, `${variant.id}: missing ${id}`);
      asked.push(id);
      answers = { ...result.plan.activeAnswers, [id]: value };
      result = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished route`);
    const excluded = result.overall.index.dimensionObservability.filter((item) => item.reason === "no_direct_source_in_context")
      .flatMap((item) => item.directSourceQuestionIds.map((questionId) => {
        const question = bank.get(questionId);
        assert.ok(question);
        const standard = question.appliesWhen ? evaluateRuleV2Trace(question.appliesWhen, result.plan.activeAnswers, result.plan.context) : undefined;
        const material = question.materialAppliesWhen ? evaluateRuleV2Trace(question.materialAppliesWhen, result.plan.activeAnswers, result.plan.context) : undefined;
        assert.equal((standard?.result ?? !question.materialAppliesWhen) || (material?.result ?? false), false);
        const options = [...(standard ? minimal(standard.trace).map((changes) => ({ branch: "appliesWhen", changes })) : []),
          ...(material ? minimal(material.trace).map((changes) => ({ branch: "materialAppliesWhen", changes })) : [])];
        assert.ok(options.length > 0, `${variant.id}/${questionId}: missing logical alternative`);
        assert.ok(options.every((option) => option.changes.length > 0), `${variant.id}/${questionId}: excluded source already satisfied`);
        return { dimension: item.dimension, questionId, options };
      }));
    return { profile: variant.id, excluded };
  });
  const byQuestion: Record<string, { pairs: number; minimumChanges: number }> = {};
  for (const row of rows) for (const item of row.excluded) {
    const count = Math.min(...item.options.map((option) => option.changes.length));
    const previous = byQuestion[item.questionId];
    byQuestion[item.questionId] = { pairs: (previous?.pairs ?? 0) + 1, minimumChanges: Math.min(previous?.minimumChanges ?? Infinity, count) };
  }
  console.log("DIAG_PRO_07_DECISIVE_PREDICATES=" + JSON.stringify({
    totals: { profiles: rows.length, excludedPairs: rows.reduce((sum, row) => sum + row.excluded.length, 0) },
    byQuestion, rows,
  }));
});
