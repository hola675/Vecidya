import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

test("DIAG-PRO-03: classify causal evidence gaps for all 60 synthetic routes", () => {
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let answers: AnswersV2 = {};
    const route: string[] = [];
    let result = runCandidateDiagnosticPipelineV3(answers);
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = result.plan.nextQuestionId;
      assert.ok(!route.includes(id), `${variant.id}: repeated ${id}`);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing ${id}`);
      route.push(id);
      answers = { ...result.plan.activeAnswers, [id]: answer };
      result = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: route still asks questions`);
    const observations = result.overall.index.dimensionObservability;
    assert.equal(new Set(observations.map((item) => item.dimension)).size, observations.length, `${variant.id}: duplicate dimension`);
    const counts = {
      applicable: observations.filter((item) => item.applicability === "applicable").length,
      notApplicable: observations.filter((item) => item.applicability === "not_applicable").length,
      insufficientContext: observations.filter((item) => item.applicability === "insufficient_context").length,
      observedDirect: observations.filter((item) => item.observedDirect).length,
    };
    assert.equal(counts.applicable + counts.notApplicable + counts.insufficientContext, observations.length);
    assert.deepEqual(observations.filter((item) => item.applicability === "insufficient_context").map((item) => item.dimension).sort(), [...result.plan.evidenceSufficiency.insufficientContextDimensions].sort());
    const scored = result.scoring.dimensions.filter((dimension) => dimension.score !== null).map((dimension) => dimension.id);
    return {
      profile: variant.id, route, terminal: result.plan.evidenceSufficiency.terminalReason,
      counts, scored,
      global: result.overall.index.displayScore,
      globalRequirements: {
        scoredDimensions: result.overall.index.scoredDimensions.length,
        applicableDimensions: result.overall.index.applicableDimensions.length,
        observableApplicableDimensions: result.overall.index.observableApplicableDimensions.length,
        coverageDenominator: result.overall.index.coverageDenominator,
        coverage: result.overall.index.coverage,
        sufficient: result.overall.index.sufficient,
      },
      dimensions: observations.map(({ dimension, applicability, reason, directSourceQuestionIds, reachableDirectQuestionIds, answeredDirectQuestionIds, observedDirect }) => ({
        dimension, applicability, reason, directSourceQuestionIds, reachableDirectQuestionIds, answeredDirectQuestionIds, observedDirect,
      })),
      budgetBlockedQuestions: result.plan.trace.filter((item) => item.skipReason === "base_budget" || item.skipReason === "module_budget" || item.skipReason === "hard_cap").map(({ questionId, skipReason }) => ({ questionId, skipReason })),
    };
  });
  const p18 = rows.filter((row) => row.profile.startsWith("P18-"));
  assert.equal(p18.length, 3);
  for (const row of p18) assert.equal(row.counts.applicable + row.counts.notApplicable + row.counts.insufficientContext, row.dimensions.length);
  const reasonCounts: Record<string, number> = {};
  for (const row of rows) for (const item of row.dimensions) reasonCounts[item.reason] = (reasonCounts[item.reason] ?? 0) + 1;
  console.log("DIAG_PRO_03_CAUSAL_AUDIT=" + JSON.stringify({
    totals: { routes: rows.length, noGlobalScore: rows.filter((row) => row.global === null).length, reasonCounts },
    p18,
    rows,
  }));
});
