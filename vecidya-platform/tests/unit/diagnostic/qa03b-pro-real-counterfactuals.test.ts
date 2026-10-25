import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/** A bounded, one-answer intervention. No direct edits to resolved context or eligibility rules. */
test("DIAG-PRO-08: replay admissible single-answer counterfactuals through the real engine", () => {
  const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
  const results = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let answers: AnswersV2 = {};
    let original = runCandidateDiagnosticPipelineV3(answers);
    const asked = new Set<string>();
    for (let turn = 0; original.plan.nextQuestionId && turn < 30; turn += 1) {
      const id = original.plan.nextQuestionId;
      assert.ok(!asked.has(id), `${variant.id}: repeated ${id}`);
      asked.add(id);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing ${id}`);
      answers = { ...original.plan.activeAnswers, [id]: answer };
      original = runCandidateDiagnosticPipelineV3(answers);
    }
    assert.equal(original.plan.nextQuestionId, undefined, `${variant.id}: unfinished`);
    const targets = original.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .flatMap((dimension) => dimension.directSourceQuestionIds.map((questionId) => ({ dimension: dimension.dimension, questionId })));
    const interventions: { questionId: string; from: string | readonly string[]; to: string; accepted: boolean; enabled: string[]; removedAnswers: number; scoreBefore: number | null; scoreAfter: number | null }[] = [];
    // Only replace previously answered, single-select questions with another declared option.
    // Multi-select and unanswered questions require a separate, more complex intervention protocol.
    for (const question of bank) {
      const previous = original.plan.activeAnswers[question.id];
      if (question.type !== "single" || typeof previous !== "string") continue;
      for (const option of question.options) {
        if (option.value === previous) continue;
        const candidate = runCandidateDiagnosticPipelineV3({ ...original.plan.activeAnswers, [question.id]: option.value });
        const accepted = candidate.plan.activeAnswers[question.id] === option.value;
        const enabled = targets.filter((target) => candidate.plan.eligibleQuestionIds.includes(target.questionId))
          .map((target) => target.questionId);
        const removedAnswers = Object.keys(original.plan.activeAnswers).filter((id) => candidate.plan.activeAnswers[id] === undefined).length;
        interventions.push({
          questionId: question.id, from: previous, to: option.value, accepted,
          enabled: accepted ? [...new Set(enabled)] : [], removedAnswers,
          scoreBefore: original.overall.index.displayScore ?? null,
          scoreAfter: candidate.overall.index.displayScore ?? null,
        });
      }
    }
    return { profile: variant.id, targets, attempted: interventions.length,
      accepted: interventions.filter((item) => item.accepted).length,
      enabled: interventions.filter((item) => item.accepted && item.enabled.length > 0),
      rejected: interventions.filter((item) => !item.accepted).length };
  });
  console.log("DIAG_PRO_08_REAL_COUNTERFACTUALS=" + JSON.stringify({
    scope: "single previously answered select option; one-step replay only, not a full rerouted interview",
    totals: { profiles: results.length, excludedPairs: results.reduce((sum, row) => sum + row.targets.length, 0),
      attempts: results.reduce((sum, row) => sum + row.attempted, 0),
      accepted: results.reduce((sum, row) => sum + row.accepted, 0),
      enablingInterventions: results.reduce((sum, row) => sum + row.enabled.length, 0) },
    results,
  }));
});
