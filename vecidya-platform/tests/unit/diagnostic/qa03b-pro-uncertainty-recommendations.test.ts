import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

test("DIAG-PRO-13: recommendation uncertainty and evidence provenance audit", () => {
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => {
    let result = runCandidateDiagnosticPipelineV3({});
    const asked = new Set<string>();
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!asked.has(id), `${variant.id}: repeated question ${id}`);
      asked.add(id);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing answer ${id}`);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished`);
    const scored = new Map(result.scoring.dimensions.map((dimension) => [dimension.id, dimension]));
    return { profile: variant.id,
      observability: result.overall.index.dimensionObservability.map((dimension) => ({ dimension: dimension.dimension, reason: dimension.reason })),
      recommendations: result.recommendations.items.map((item) => {
        const dimension = scored.get(item.dimension);
        assert.ok(dimension, `${variant.id}: missing dimension ${item.dimension}`);
        const sourceQuestions = item.sourceQuestionIds.map((id) => ({
          id, answered: result.plan.activeAnswers[id] !== undefined,
          answer: result.plan.activeAnswers[id] ?? null,
          evidence: dimension.evidence.filter((entry) => entry.questionId === id).map((entry) => ({
            state: entry.state, directness: entry.directness,
          })),
        }));
        return {
          id: item.id, dimension: item.dimension, mode: item.mode, framing: item.framing,
          certainty: item.certainty, urgency: item.urgency,
          constraintKind: item.sourceConstraint.kind, score: item.sourceConstraint.score,
          observabilityReason: result.overall.index.dimensionObservability.find((entry) => entry.dimension === item.dimension)?.reason ?? null,
          sourceQuestions, title: item.title, whatToImprove: item.whatToImprove,
          whyItMatters: item.whyItMatters, expectedOutcome: item.expectedOutcome,
          evidenceText: item.evidence.text, evidenceQuestionIds: item.evidence.sourceQuestionIds,
        };
      }),
    };
  });
  const items = rows.flatMap((row) => row.recommendations.map((recommendation) => ({ profile: row.profile, ...recommendation })));
  const counts = (key: "mode" | "framing" | "constraintKind" | "observabilityReason") => Object.fromEntries(
    [...new Set(items.map((item) => String(item[key])))].map((value) => [value, items.filter((item) => String(item[key]) === value).length]),
  );
  const flags = {
    evidenceGapNotVerifyOrPrepare: items.filter((item) => item.constraintKind === "evidence_gap" && !["verify", "prepare"].includes(item.mode)),
    verifyWithNonGapConstraint: items.filter((item) => item.mode === "verify" && item.constraintKind !== "evidence_gap"),
    missingSourceAnswers: items.filter((item) => item.sourceQuestions.some((source) => !source.answered)),
    unknownSourceButImprove: items.filter((item) => item.mode === "improve" && item.sourceQuestions.some((source) => source.answer === "unknown")),
    nonObservedButImprove: items.filter((item) => item.mode === "improve" && ["context_unresolved", "respondent_unknown", "no_direct_source_in_context"].includes(item.observabilityReason ?? "")),
  };
  console.log("DIAG_PRO_13_UNCERTAINTY_RECOMMENDATIONS=" + JSON.stringify({
    scope: "synthetic QA-03B journeys; descriptive flags are review candidates, not certified defects",
    totals: { profiles: rows.length, recommendations: items.length }, distribution: {
      modes: counts("mode"), framing: counts("framing"), constraintKinds: counts("constraintKind"), observabilityReasons: counts("observabilityReason"),
    }, flags, rows,
  }));
});
