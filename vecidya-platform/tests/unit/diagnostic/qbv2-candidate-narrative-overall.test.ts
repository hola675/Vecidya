import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateNarrativeAndOverallV3 } from "../../../app/features/diagnostic/qbv2-candidate-narrative";
import { CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { narrativeBlocks } from "../../../app/features/diagnostic/qbv2-narrative";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const ACTIVE_PROFESSIONAL: AnswersV2 = {
  q2_entity: "individual", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat",
  q2_delivery: ["travels"], q2_sector: "legal", q2_goal: "opportunities", q2_customer_buyer: "b2c", q2_customer_reach: "local",
  q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_service_response_speed: "strong",
  q2_professional_intake_flow: "clear", q2_reputation_flow: "strong", q2_service_quote_followup: "consistent",
  q2_professional_authority_signals: "clearly_visible", q2_presence_offer_clarity: "all_clear",
};

test("R6-B/O6: Measurement is the only bank-wide gap; unavailable context opportunities also leave the denominator", () => {
  assert.deepEqual([...CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3], ["measurement_optimization"]);
  const result = buildCandidateNarrativeAndOverallV3({ answers: ACTIVE_PROFESSIONAL });
  assert.ok(result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!.applicability === "applicable");
  assert.equal(result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!.score, null);
  assert.deepEqual([...result.overall.index.unobservableApplicableDimensions].sort(), ["digital_foundation", "measurement_optimization"]);
  assert.equal(result.overall.index.dimensionObservability.find((d) => d.dimension === "digital_foundation")!.reason, "no_direct_source_in_context");
  const observableApplicable = result.overall.index.coverageDenominator;
  assert.equal(result.overall.index.coverage, Math.round((result.overall.index.assessed / observableApplicable) * 100) / 100);
});

test("R6-B: prelaunch has no overall percentage", () => {
  const result = buildCandidateNarrativeAndOverallV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  assert.equal(result.overall.index.rawScore, null);
  assert.equal(result.overall.index.displayScore, null);
  assert.equal(result.overall.index.sufficient, false);
  assert.equal(result.overall.state, "insufficient");
  assert.equal(result.overall.publicLabel, null);
  assert.ok(!result.overall.explanation.text.match(/\d+%/));
});

test("R6-B: not_applicable and insufficient_context never read as weak/missing/needs-improvement", () => {
  const prelaunch = buildCandidateNarrativeAndOverallV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  for (const dimension of ["digital_foundation", "trust_reputation", "relationship_recurrence", "measurement_optimization"] as const) {
    const interpretation = prelaunch.narrative.dimensions.find((d) => d.dimension === dimension)!;
    assert.equal(interpretation.status, "not_applicable");
    for (const forbidden of ["débil", "0%", "necesita refuerzo", "insuficientemente", "no tienes"]) assert.ok(!interpretation.interpretation.text.toLowerCase().includes(forbidden), `${dimension}: "${forbidden}" must not describe not_applicable`);
  }
  const before = buildCandidateNarrativeAndOverallV3({ answers: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" } as AnswersV2 });
  const relationship = before.narrative.dimensions.find((d) => d.dimension === "relationship_recurrence")!;
  assert.equal(before.scoring.dimensions.find((d) => d.id === "relationship_recurrence")!.applicability, "insufficient_context");
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(relationship.status));
});

test("R6-B: Measurement zero-source wording frames a diagnostic limit, never a business failure", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "measure" };
  const result = buildCandidateNarrativeAndOverallV3({ answers: seed });
  const measurement = result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  const gapBlock = narrativeBlocks(result.narrative).find((block) => block.dimension === "measurement_optimization" && block.kind === "evidence_gap");
  assert.ok(gapBlock, "a relevant Measurement null reading must produce an evidence-gap narrative block");
  assert.ok(gapBlock!.text.includes("no hay una forma directa de observar"));
  for (const forbidden of ["0%", "no estás midiendo", "la medición es débil", "falló", "necesitas analítica"]) assert.ok(!gapBlock!.text.toLowerCase().includes(forbidden));
  const dimensionInterpretation = result.narrative.dimensions.find((d) => d.dimension === "measurement_optimization")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(dimensionInterpretation.status));
});

test("R6-B: Measurement without declared relevance stays neutral (not_assessed), no manufactured priority", () => {
  const result = buildCandidateNarrativeAndOverallV3({ answers: ACTIVE_PROFESSIONAL });
  assert.ok(!result.priorities.priorities.some((p) => p.dimension === "measurement_optimization"));
  const interpretation = result.narrative.dimensions.find((d) => d.dimension === "measurement_optimization")!;
  assert.equal(interpretation.status, "not_assessed");
  assert.equal(interpretation.score, null);
});

test("R6-B: Relationship prospective evidence boundary — before/after narrative and provenance", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const before = buildCandidateNarrativeAndOverallV3({ answers: seed });
  const beforeDim = before.narrative.dimensions.find((d) => d.dimension === "relationship_recurrence")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(beforeDim.status));
  const after = buildCandidateNarrativeAndOverallV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "consistent" } });
  const afterDim = after.narrative.dimensions.find((d) => d.dimension === "relationship_recurrence")!;
  assert.ok(["strong", "positive_signal"].includes(afterDim.status));
  assert.ok(afterDim.evidence.some((e) => e.questionId === "q2_followup_general_process"));
  assert.ok(afterDim.interpretation.sourceQuestionIds.includes("q2_followup_general_process"));
});

test("R6-B: unknown stays uncertainty-only, N/A stays neutral, in narrative wording", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const unknown = buildCandidateNarrativeAndOverallV3({ answers: { ...base, q2_followup_general_process: "unknown" } });
  const uncertaintyBlock = narrativeBlocks(unknown.narrative).find((b) => b.kind === "uncertainty" && b.sourceQuestionIds.includes("q2_followup_general_process"));
  assert.ok(uncertaintyBlock);
  assert.ok(uncertaintyBlock!.text.includes("no cuenta ni a favor ni en contra"));
  const dim = unknown.narrative.dimensions.find((d) => d.dimension === "relationship_recurrence")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(dim.status));
});

test("R6-B: supporting-only evidence never produces a capability narrative claim", () => {
  const withoutDirect: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_customer_buyer: "b2b", q2_operations_handoffs: "transfers_cleanly" };
  const result = buildCandidateNarrativeAndOverallV3({ answers: withoutDirect });
  const interpretation = result.narrative.dimensions.find((d) => d.dimension === "digital_readiness")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(interpretation.status));
  assert.equal(interpretation.score, null);
});

test("R6-B: candidate narrative uses the candidate bank explicitly, not the legacy QUESTION_BANK_V2 fallback", () => {
  // q2_discovery_reliable_reach exists only in the candidate bank. If narrative silently fell back to the
  // legacy QUESTION_BANK_V2, this question would be absent from context resolution and its topic lookup
  // would never resolve through the real evidence path exercised here.
  const result = buildCandidateNarrativeAndOverallV3({ answers: ACTIVE_PROFESSIONAL });
  const discovery = result.narrative.dimensions.find((d) => d.dimension === "discovery")!;
  assert.ok(discovery.evidence.some((e) => e.questionId === "q2_discovery_reliable_reach"));
  assert.ok(discovery.interpretation.text.includes("constancia para llegar a personas nuevas interesadas"));
});

test("R6-B: stale answers never survive into narrative/overall provenance", () => {
  const raw: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_appointments_noshow: "often" };
  const result = buildCandidateNarrativeAndOverallV3({ answers: raw });
  assert.equal(result.activeAnswers.q2_appointments_noshow, undefined);
  const allIds = new Set(narrativeBlocks(result.narrative).flatMap((b) => b.sourceQuestionIds));
  assert.ok(!allIds.has("q2_appointments_noshow"));
});

test("R6-B: determinism — answer order and save/resume", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_process_systemization: "defined" };
  const left = buildCandidateNarrativeAndOverallV3({ answers: seed });
  const reversed = buildCandidateNarrativeAndOverallV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  assert.deepEqual(narrativeBlocks(reversed.narrative).map((b) => b.id), narrativeBlocks(left.narrative).map((b) => b.id));
  assert.deepEqual(reversed.overall, left.overall);
  const restored = buildCandidateNarrativeAndOverallV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored.narrative, left.narrative);
  assert.deepEqual(restored.overall, left.overall);
});

test("R6-B: answer-change invalidates stale narrative/overall provenance", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_appointments_noshow: "often" };
  const before = buildCandidateNarrativeAndOverallV3({ answers: seed });
  const after = buildCandidateNarrativeAndOverallV3({ answers: { ...seed, q2_delivery: ["online_checkout"] } });
  const afterIds = new Set(narrativeBlocks(after.narrative).flatMap((b) => b.sourceQuestionIds));
  assert.ok(!afterIds.has("q2_appointments_noshow"));
  assert.notDeepEqual(before.overall, after.overall);
});

test("R6-B: candidate narrative/overall are not re-exported by the shared barrel", async () => {
  const barrel = await import("../../../app/features/diagnostic/index");
  assert.equal((barrel as Record<string, unknown>).buildCandidateNarrativeAndOverallV3, undefined);
});
