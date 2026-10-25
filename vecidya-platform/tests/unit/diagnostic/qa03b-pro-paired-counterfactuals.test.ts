import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const FOCUS = new Set(["P04", "P12", "P15", "P19"]);
const HARD_TARGETS = new Set(["q2_service_response_speed", "q2_service_quote_followup"]);
const MAX_PAIRS_PER_PROFILE = 25000;

function replay(script: AnswersV2) {
  let result = runCandidateDiagnosticPipelineV3({});
  const asked: string[] = [];
  let missing: string | null = null;
  for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
    const id = result.plan.nextQuestionId;
    assert.ok(!asked.includes(id), `repeated ${id}`);
    asked.push(id);
    const answer = script[id];
    if (answer === undefined) { missing = id; break; }
    result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
  }
  return { result, asked, missing, finished: missing === null && result.plan.nextQuestionId === undefined };
}

test("DIAG-PRO-10: bounded paired interventions on unresolved profiles and hard targets", () => {
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS
    .filter((variant) => FOCUS.has(variant.profileId))
    .map((variant) => {
      const baseline = replay(variant.answerScript);
      assert.ok(baseline.finished, `${variant.id}: baseline unfinished`);
      const targets = [...new Set(baseline.result.overall.index.dimensionObservability
        .filter((dimension) => dimension.reason === "no_direct_source_in_context")
        .flatMap((dimension) => dimension.directSourceQuestionIds))];
      const changes = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.flatMap((question) => {
        const current = baseline.result.plan.activeAnswers[question.id];
        return question.type === "single" && typeof current === "string"
          ? question.options.filter((option) => option.value !== current).map((option) => ({ id: question.id, to: option.value }))
          : [];
      });
      let attempts = 0;
      let accepted = 0;
      let enabling = 0;
      const successes: { changes: { id: string; to: string }[]; enabled: string[]; reached: string[]; missing: string | null; finished: boolean; lostAnswers: number }[] = [];
      outer: for (let i = 0; i < changes.length; i++) {
        for (let j = i + 1; j < changes.length; j++) {
          if (attempts >= MAX_PAIRS_PER_PROFILE) break outer;
          const a = changes[i], b = changes[j];
          if (a.id === b.id) continue;
          attempts++;
          const probe = runCandidateDiagnosticPipelineV3({ ...baseline.result.plan.activeAnswers, [a.id]: a.to, [b.id]: b.to });
          if (probe.plan.activeAnswers[a.id] !== a.to || probe.plan.activeAnswers[b.id] !== b.to) continue;
          accepted++;
          const enabled = targets.filter((id) => probe.plan.eligibleQuestionIds.includes(id));
          if (!enabled.length) continue;
          enabling++;
          // Limit full replays to first two examples per newly enabled target to bound runtime.
          if (successes.filter((row) => row.enabled.some((id) => enabled.includes(id))).length >= 2) continue;
          const rerun = replay({ ...variant.answerScript, [a.id]: a.to, [b.id]: b.to });
          successes.push({ changes: [a, b], enabled, reached: enabled.filter((id) => rerun.asked.includes(id)),
            missing: rerun.missing, finished: rerun.finished,
            lostAnswers: Object.keys(baseline.result.plan.activeAnswers).filter((id) => probe.plan.activeAnswers[id] === undefined).length });
        }
      }
      return { profile: variant.id, targets, hardTargets: targets.filter((id) => HARD_TARGETS.has(id)),
        attempts, accepted, enabling, successes, capped: attempts >= MAX_PAIRS_PER_PROFILE };
    });
  console.log("DIAG_PRO_10_PAIRED_COUNTERFACTUALS=" + JSON.stringify({
    scope: "focused profiles; two distinct previously answered single-select answers; bounded 25000 pairs per profile; sampled replays",
    totals: { profiles: rows.length, attempts: rows.reduce((sum, row) => sum + row.attempts, 0),
      accepted: rows.reduce((sum, row) => sum + row.accepted, 0),
      enabling: rows.reduce((sum, row) => sum + row.enabling, 0),
      replays: rows.reduce((sum, row) => sum + row.successes.length, 0) },
    rows,
  }));
});
