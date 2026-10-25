import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { collectAnswerDependencies, collectContextDependencies, evaluateRuleV2Trace, type RuleV2, type RuleV2Trace, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

const TARGETS = new Set(["q2_service_response_speed", "q2_appointments_booking_friction"]);

function failingLeaves(trace: RuleV2Trace, path = "root"): { path: string; op: string; rule: RuleV2; observed?: string | readonly string[] }[] {
  if (trace.children?.length) return trace.children.flatMap((child, index) => failingLeaves(child, `${path}.${index}`));
  return trace.result ? [] : [{ path, op: trace.rule.op, rule: trace.rule, observed: trace.observed }];
}

test("DIAG-PRO-11: map answer and context dependencies for stubborn direct-source exclusions", () => {
  const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
  const byId = new Map(bank.map((question) => [question.id, question]));
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.flatMap((variant) => {
    let result = runCandidateDiagnosticPipelineV3({});
    const asked: string[] = [];
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!asked.includes(id), `${variant.id}: repeated ${id}`);
      asked.push(id);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing ${id}`);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished`);
    const excluded = result.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .flatMap((dimension) => dimension.directSourceQuestionIds.filter((id) => TARGETS.has(id)));
    return excluded.map((questionId) => {
      const question = byId.get(questionId);
      assert.ok(question, `missing ${questionId}`);
      const rules = [{ name: "appliesWhen", rule: question.appliesWhen }, { name: "materialAppliesWhen", rule: question.materialAppliesWhen }]
        .filter((entry): entry is { name: string; rule: RuleV2 } => entry.rule !== undefined);
      const dependencies = rules.map(({ name, rule }) => {
        const trace = evaluateRuleV2Trace(rule, result.plan.activeAnswers, result.plan.context);
        const answerIds = collectAnswerDependencies(rule);
        return { name, result: trace.result, answerDependencies: answerIds.map((id) => ({
          questionId: id, answered: result.plan.activeAnswers[id] !== undefined,
          asked: asked.includes(id), optionCount: byId.get(id)?.options.length ?? null,
          traceSelected: result.plan.trace.find((entry) => entry.questionId === id)?.selected ?? false,
          traceSkipReason: result.plan.trace.find((entry) => entry.questionId === id)?.skipReason ?? null,
        })), contextDependencies: collectContextDependencies(rule),
          failingLeaves: failingLeaves(trace.trace) };
      });
      return { profile: variant.id, questionId, dependencies };
    });
  });
  const byTarget: Record<string, { exclusions: number; answerRefs: string[]; contextRefs: string[]; missingAnswerRefs: Record<string, number> }> = {};
  for (const row of rows) {
    const current = byTarget[row.questionId] ?? { exclusions: 0, answerRefs: [], contextRefs: [], missingAnswerRefs: {} };
    current.exclusions++;
    for (const dependency of row.dependencies) {
      for (const answer of dependency.answerDependencies) {
        if (!current.answerRefs.includes(answer.questionId)) current.answerRefs.push(answer.questionId);
        if (!answer.answered) current.missingAnswerRefs[answer.questionId] = (current.missingAnswerRefs[answer.questionId] ?? 0) + 1;
      }
      for (const field of dependency.contextDependencies) if (!current.contextRefs.includes(field)) current.contextRefs.push(field);
    }
    byTarget[row.questionId] = current;
  }
  console.log("DIAG_PRO_11_CONTEXT_DEPENDENCIES=" + JSON.stringify({ totals: { exclusions: rows.length, profiles: new Set(rows.map((row) => row.profile)).size }, byTarget, rows }));
});
