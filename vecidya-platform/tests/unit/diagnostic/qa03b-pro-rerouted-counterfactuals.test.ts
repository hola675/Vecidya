import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

function replay(script: AnswersV2) {
  let result = runCandidateDiagnosticPipelineV3({});
  const asked: string[] = [];
  let unanswered: string | null = null;
  for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
    const id = result.plan.nextQuestionId;
    assert.ok(!asked.includes(id), `repeated question ${id}`);
    asked.push(id);
    const answer = script[id];
    if (answer === undefined) { unanswered = id; break; }
    result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
  }
  return { result, asked, unanswered };
}

test("DIAG-PRO-09: reroute bounded enabling interventions from the first question", () => {
  const summary = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    const baseline = replay(variant.answerScript);
    assert.equal(baseline.unanswered, null, `${variant.id}: baseline missing answer`);
    assert.equal(baseline.result.plan.nextQuestionId, undefined, `${variant.id}: baseline unfinished`);
    const targets = new Set(baseline.result.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .flatMap((dimension) => dimension.directSourceQuestionIds));
    const candidates: { questionId: string; to: string; targets: string[] }[] = [];
    const selectedTargets = new Set<string>();
    for (const question of REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3) {
      const previous = baseline.result.plan.activeAnswers[question.id];
      if (question.type !== "single" || typeof previous !== "string") continue;
      for (const option of question.options) {
        if (option.value === previous) continue;
        const probe = runCandidateDiagnosticPipelineV3({ ...baseline.result.plan.activeAnswers, [question.id]: option.value });
        if (probe.plan.activeAnswers[question.id] !== option.value) continue;
        const enabled = [...targets].filter((id) => probe.plan.eligibleQuestionIds.includes(id) && !selectedTargets.has(id));
        if (enabled.length === 0) continue;
        candidates.push({ questionId: question.id, to: option.value, targets: enabled });
        enabled.forEach((id) => selectedTargets.add(id));
        if (candidates.length >= 3) break;
      }
      if (candidates.length >= 3) break;
    }
    const trials = candidates.map((candidate) => {
      const rerun = replay({ ...variant.answerScript, [candidate.questionId]: candidate.to });
      const reached = candidate.targets.filter((id) => rerun.asked.includes(id));
      const answered = reached.filter((id) => id !== rerun.unanswered);
      return {
        ...candidate, reached, answered, unanswered: rerun.unanswered,
        finished: rerun.result.plan.nextQuestionId === undefined,
        originalRouteLength: baseline.asked.length, reroutedLength: rerun.asked.length,
        originalScoredDimensions: baseline.result.overall.index.scoredDimensions,
        reroutedScoredDimensions: rerun.result.overall.index.scoredDimensions,
        originalGlobalScore: baseline.result.overall.index.displayScore ?? null,
        reroutedGlobalScore: rerun.result.overall.index.displayScore ?? null,
      };
    });
    return { profile: variant.id, targets: [...targets], trials };
  });
  const trials = summary.flatMap((row) => row.trials);
  console.log("DIAG_PRO_09_REROUTED_COUNTERFACTUALS=" + JSON.stringify({
    scope: "up to three distinct-target enabling interventions per profile; restart interview with modified scripted answer",
    totals: { profiles: summary.length, trials: trials.length,
      reachedTrials: trials.filter((trial) => trial.reached.length > 0).length,
      answeredTrials: trials.filter((trial) => trial.answered.length > 0).length,
      finishedTrials: trials.filter((trial) => trial.finished).length,
      missingScriptTrials: trials.filter((trial) => trial.unanswered !== null).length },
    summary,
  }));
});
