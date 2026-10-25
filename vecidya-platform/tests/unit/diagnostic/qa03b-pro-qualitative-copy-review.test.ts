import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

/**
 * DIAG-PRO-15: qualitative editorial review packets. This is an evidence-backed
 * inventory, not an automated claim that prose has passed human editorial review.
 */
test("DIAG-PRO-15: export unique recommendation review packets with supporting evidence", () => {
  const unique = new Map<string, {
    profiles: string[];
    dimension: string;
    mode: string;
    framing: string;
    constraintKind: string;
    title: string;
    evidence: string;
    whyItMatters: string;
    action: string;
    expectedOutcome: string;
    sourceQuestionIds: readonly string[];
    sourceAnswers: Record<string, unknown>;
    observabilityReasons: string[];
  }>();
  for (const variant of QA03B_PROFILE_KNOWLEDGE_VARIANTS) {
    let result = runCandidateDiagnosticPipelineV3({});
    const seen = new Set<string>();
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!seen.has(id), `${variant.id}: repeated ${id}`);
      seen.add(id);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing ${id}`);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: incomplete`);
    for (const item of result.recommendations.items) {
      const key = JSON.stringify([item.dimension, item.mode, item.framing, item.title, item.evidence.text,
        item.whyItMatters, item.whatToImprove, item.expectedOutcome]);
      const existing = unique.get(key);
      if (existing) {
        existing.profiles.push(variant.id);
        continue;
      }
      const sourceAnswers = Object.fromEntries(item.sourceQuestionIds.map((id) => [id, result.plan.activeAnswers[id] ?? null]));
      const reason = result.overall.index.dimensionObservability.find((entry) => entry.dimension === item.dimension)?.reason ?? "not_recorded";
      unique.set(key, {
        profiles: [variant.id], dimension: item.dimension, mode: item.mode, framing: item.framing,
        constraintKind: item.sourceConstraint.kind, title: item.title, evidence: item.evidence.text,
        whyItMatters: item.whyItMatters, action: item.whatToImprove,
        expectedOutcome: item.expectedOutcome, sourceQuestionIds: item.sourceQuestionIds,
        sourceAnswers, observabilityReasons: [reason],
      });
    }
  }
  const packets = [...unique.values()].map((packet, index) => ({
    reviewId: `PRO15-${String(index + 1).padStart(2, "0")}`,
    ...packet,
    editorialChecks: {
      evidenceAccuracy: "REVIEW_REQUIRED",
      distinguishesUncertainty: "REVIEW_REQUIRED",
      actionableSpecificity: "REVIEW_REQUIRED",
      formalConciseClarity: "REVIEW_REQUIRED",
      noGuaranteedOutcome: "REVIEW_REQUIRED",
    },
  }));
  const recommendations = packets.reduce((total, packet) => total + packet.profiles.length, 0);
  assert.ok(packets.length > 0, "no editorial cases");
  console.log("DIAG_PRO_15_QUALITATIVE_REVIEW_PACKETS=" + JSON.stringify({
    status: "MANUAL_EDITORIAL_REVIEW_REQUIRED",
    criteria: "Formal, concise, specific, understandable; evidence before claims; avoid unsupported guarantees",
    totals: { uniqueTexts: packets.length, recommendations }, packets,
  }));
});
