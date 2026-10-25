import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

test("DIAG-PRO-04: trace unreachable direct sources without changing planner eligibility", () => {
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
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished route`);
    const trace = new Map(result.plan.trace.map((entry) => [entry.questionId, entry]));
    const unreachable = result.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .map((dimension) => {
        assert.ok(dimension.directSourceQuestionIds.length > 0, `${variant.id}/${dimension.dimension}: expected source in bank`);
        assert.equal(dimension.reachableDirectQuestionIds.length, 0, `${variant.id}/${dimension.dimension}: unexpectedly reachable source`);
        const sources = dimension.directSourceQuestionIds.map((questionId) => ({
          questionId,
          selected: trace.get(questionId)?.selected ?? false,
          skipReason: trace.get(questionId)?.skipReason ?? "not_in_trace",
          selectionReason: trace.get(questionId)?.reason ?? null,
          answered: asked.includes(questionId),
        }));
        return { dimension: dimension.dimension, applicability: dimension.applicability, sources };
      });
    return { profile: variant.id, terminal: result.plan.evidenceSufficiency.terminalReason, unreachable };
  });
  const total = rows.reduce((sum, row) => sum + row.unreachable.length, 0);
  const skipCounts: Record<string, number> = {};
  const byDimension: Record<string, number> = {};
  for (const row of rows) for (const item of row.unreachable) {
    byDimension[item.dimension] = (byDimension[item.dimension] ?? 0) + 1;
    for (const source of item.sources) skipCounts[source.skipReason] = (skipCounts[source.skipReason] ?? 0) + 1;
  }
  console.log("DIAG_PRO_04_SOURCE_REACHABILITY=" + JSON.stringify({ totals: { profiles: rows.length, unreachableObservations: total, byDimension, skipCounts }, rows }));
});
