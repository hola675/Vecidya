import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { evaluateRuleV2Trace, type RuleV2, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

const TARGETS = ["q2_service_response_speed", "q2_appointments_booking_friction"] as const;

function replay(script: AnswersV2) {
  let result = runCandidateDiagnosticPipelineV3({});
  const asked: string[] = [];
  for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
    const id = result.plan.nextQuestionId;
    assert.ok(!asked.includes(id), `repeated ${id}`);
    asked.push(id);
    const answer = script[id];
    assert.notEqual(answer, undefined, `missing answer ${id}`);
    result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
  }
  assert.equal(result.plan.nextQuestionId, undefined, "unfinished interview");
  return { result, asked };
}

test("DIAG-PRO-12: audit archetype and declared delivery semantics without changing eligibility", () => {
  const byId = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.flatMap((variant) => {
    const { result, asked } = replay(variant.answerScript);
    const excluded = new Set(result.overall.index.dimensionObservability
      .filter((dimension) => dimension.reason === "no_direct_source_in_context")
      .flatMap((dimension) => dimension.directSourceQuestionIds));
    return TARGETS.filter((id) => excluded.has(id)).map((id) => {
      const question = byId.get(id);
      assert.ok(question, id);
      const gates = (["appliesWhen", "materialAppliesWhen"] as const).flatMap((name) => {
        const rule = question[name] as RuleV2 | undefined;
        if (!rule) return [];
        const trace = evaluateRuleV2Trace(rule, result.plan.activeAnswers, result.plan.context);
        return [{ name, passes: trace.result, trace: trace.trace }];
      });
      return {
        profile: variant.id, target: id,
        declared: {
          entity: result.plan.activeAnswers.q2_entity ?? null,
          sector: result.plan.activeAnswers.q2_sector ?? null,
          monetization: result.plan.activeAnswers.q2_monetization ?? null,
          delivery: result.plan.activeAnswers.q2_delivery ?? null,
          operating: result.plan.activeAnswers.q2_operational_status ?? null,
          customers: result.plan.activeAnswers.q2_has_customers ?? null,
          appointmentsLeadToBooking: result.plan.activeAnswers.q2_appointments_lead_to_booking ?? null,
        },
        context: result.plan.context,
        priorQuestionAsked: asked.includes("q2_appointments_lead_to_booking"),
        priorQuestionTrace: result.plan.trace.find((entry) => entry.questionId === "q2_appointments_lead_to_booking") ?? null,
        gates,
      };
    });
  });
  const byTarget = TARGETS.map((target) => {
    const subset = rows.filter((row) => row.target === target);
    return { target, exclusions: subset.length,
      missingPriorQuestion: subset.filter((row) => row.declared.appointmentsLeadToBooking === null).length,
      unknownPriorAnswer: subset.filter((row) => row.declared.appointmentsLeadToBooking === "unknown").length,
      declaredDelivery: [...new Set(subset.map((row) => JSON.stringify(row.declared.delivery)))].sort(),
      contextPatterns: [...new Set(subset.map((row) => JSON.stringify(row.context)))].length,
    };
  });
  console.log("DIAG_PRO_12_ARCHETYPE_SEMANTICS=" + JSON.stringify({
    scope: "synthetic profiles; descriptive comparison of declared answers, resolved context and routing trace; no semantic truth labels",
    byTarget, rows,
  }));
});
