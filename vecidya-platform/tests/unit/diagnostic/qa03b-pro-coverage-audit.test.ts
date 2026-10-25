import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const bank = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));

function complete(script: AnswersV2) {
  let answers: AnswersV2 = {};
  for (let turn = 0; turn < 30; turn += 1) {
    const result = runCandidateDiagnosticPipelineV3(answers);
    const id = result.plan.nextQuestionId;
    if (!id) return result;
    const value = script[id];
    assert.notEqual(value, undefined, `Missing authored answer for ${id}`);
    assert.ok(bank.has(id), `Unknown question ${id}`);
    answers = { ...result.plan.activeAnswers, [id]: value };
  }
  assert.fail("Diagnostic did not terminate within 30 questions");
}

test("DIAG-PRO-01: 60 recorridos producen una auditoría trazable de cobertura sin fabricar puntuaciones", () => {
  assert.equal(QA03B_PROFILE_KNOWLEDGE_VARIANTS.length, 60);
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    const result = complete(variant.answerScript);
    const plan = result.plan;
    const blocked = plan.trace.filter((entry) => entry.skipReason === "module_budget" || entry.skipReason === "base_budget" || entry.skipReason === "hard_cap");
    const pending = plan.trace.filter((entry) => entry.skipReason === "pending_evidence");
    const unresolved = plan.evidenceSufficiency.unresolvedApplicableDimensions;
    const unscored = result.scoring.dimensions.filter((dimension) => dimension.score === null).map((dimension) => dimension.id);
    assert.ok(unresolved.every((dimension) => unscored.includes(dimension)), `${variant.id}: unresolved applicable dimension unexpectedly scored`);
    assert.ok(blocked.every((entry) => !entry.selected), `${variant.id}: blocked question marked selected`);
    assert.ok(pending.every((entry) => !entry.selected), `${variant.id}: pending evidence marked selected`);
    assert.equal(plan.nextQuestionId, undefined, `${variant.id}: route still offers a question`);
    assert.ok(["no_useful_questions", "budget_blocked"].includes(plan.evidenceSufficiency.terminalReason ?? ""), `${variant.id}: unexpected terminal reason`);
    assert.equal(plan.completion.ready, plan.evidenceSufficiency.terminalReason !== "budget_blocked", `${variant.id}: readiness disagrees with blocked status`);
    if (plan.evidenceSufficiency.terminalReason === "budget_blocked") {
      assert.ok(plan.evidenceSufficiency.usefulQuestionsRemaining, `${variant.id}: budget block without useful question`);
      assert.ok(blocked.length > 0, `${variant.id}: budget block without traced blocker`);
    }
    return {
      profile: variant.id,
      knowledge: variant.knowledgeLevel,
      terminal: plan.evidenceSufficiency.terminalReason,
      applicable: plan.evidenceSufficiency.applicableDimensions,
      unresolvedApplicable: unresolved,
      insufficientContext: plan.evidenceSufficiency.insufficientContextDimensions,
      unscored,
      blockedQuestions: blocked.map(({ questionId, skipReason }) => ({ questionId, reason: skipReason })),
      pendingEvidenceQuestions: pending.map(({ questionId }) => questionId),
      usefulQuestionsRemaining: plan.evidenceSufficiency.usefulQuestionsRemaining,
      globalScoreAvailable: result.overall.index.displayScore !== null,
    };
  });
  const totals = {
    cases: rows.length,
    globalScoresAvailable: rows.filter((row) => row.globalScoreAvailable).length,
    unresolvedApplicableCases: rows.filter((row) => row.unresolvedApplicable.length > 0).length,
    budgetBlockedCases: rows.filter((row) => row.terminal === "budget_blocked").length,
    noUsefulQuestionsCases: rows.filter((row) => row.terminal === "no_useful_questions").length,
  };
  // Machine-readable output in the test log; no fixture with invented expected outcomes.
  console.log("DIAG_PRO_01_COVERAGE_AUDIT=" + JSON.stringify({ totals, rows }));
});
