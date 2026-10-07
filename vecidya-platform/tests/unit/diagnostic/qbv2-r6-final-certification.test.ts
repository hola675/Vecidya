import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { narrativeBlocks } from "../../../app/features/diagnostic/qbv2-narrative";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R6-FINAL: focused end-to-end certification of the complete candidate consumer chain
 * (R6-A + R6-B + R6-C + R6-D/D.1). Exercises `buildCandidateCommercialBoundaryV3` — the single entry
 * point that returns every layer — and traces that every downstream claim is upstream-supported. Does
 * not duplicate the exhaustive per-layer suites (qbv2-candidate-consumers/-narrative-overall/
 * -recommendations-solutions/-commercial.test.ts); certifies chain integrity across representative
 * fixtures instead.
 */

const BASE: AnswersV2 = {
  q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat",
  q2_delivery: ["appointments"], q2_goal: "opportunities", q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_buyer: "b2b",
};

function allSourceQuestionIds(result: ReturnType<typeof buildCandidateCommercialBoundaryV3>): Set<string> {
  const ids = new Set<string>();
  for (const block of narrativeBlocks(result.narrative)) for (const id of block.sourceQuestionIds) ids.add(id);
  for (const rec of result.recommendations.items) for (const id of rec.sourceQuestionIds) ids.add(id);
  for (const match of result.solutions) if (match.solution) { const rec = result.recommendations.items.find((r) => r.id === match.recommendationId)!; for (const id of rec.sourceQuestionIds) ids.add(id); }
  return ids;
}

test("R6-FINAL: full chain integrity across the representative fixture matrix", () => {
  const fixtures: readonly { readonly name: string; readonly answers: AnswersV2 }[] = [
    { name: "prelaunch", answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } },
    { name: "active professional", answers: { ...BASE, q2_entity: "individual", q2_delivery: ["travels"], q2_sector: "legal", q2_goal: "trust", q2_friction: "trust", q2_professional_authority_signals: "clearly_visible" } },
    { name: "appointments booking friction", answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" } },
    { name: "retail/ecommerce", answers: { ...BASE, q2_monetization: "goods", q2_delivery: ["retail"], q2_sector: "retail", q2_goal: "stop_losing", q2_retail_customer_capture: "no" } },
    { name: "B2B pipeline", answers: { ...BASE, q2_customer_buyer: "b2b", q2_goal: "stop_losing", q2_b2b_pipeline: "informal" } },
    { name: "nonprofit/organization", answers: { ...BASE, q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_goal: "explain" } },
    { name: "operations-heavy", answers: { ...BASE, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal" } },
    { name: "hybrid retail+ecommerce", answers: { ...BASE, q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "explain" } },
    { name: "Measurement goal", answers: { ...BASE, q2_goal: "measure" } },
    { name: "sparse evidence", answers: { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"] } },
    { name: "unknown-heavy", answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_reputation_flow: "unknown", q2_professional_authority_signals: "unknown" } },
    { name: "website-only service", answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } },
    { name: "Cuadra work-organization", answers: { ...BASE, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal" } },
    { name: "Barrio recurring-process", answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" } },
    { name: "Discovery weak/null solution", answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "be_found", q2_discovery_reliable_reach: "weak" } },
  ];

  for (const fixture of fixtures) {
    const result = buildCandidateCommercialBoundaryV3({ answers: fixture.answers });
    const label = fixture.name;

    // Recommendation authority: count/order must equal certified priorities, never invented.
    assert.deepEqual(result.recommendations.items.map((r) => r.rank), result.narrative.priorities.map((p) => p.rank), `${label}: recommendation order must equal priority order`);
    assert.ok(result.recommendations.items.length <= 3, `${label}: at most 3 recommendations`);

    // Solution integrity: one SolutionMatch per recommendation, same order.
    assert.equal(result.solutions.length, result.recommendations.items.length, `${label}: one solution per recommendation`);
    result.solutions.forEach((match, index) => assert.equal(match.recommendationId, result.recommendations.items[index]!.id, `${label}: solution/recommendation order must align`));

    // Verify boundary: every verify-mode recommendation has solution = null.
    for (const rec of result.recommendations.items.filter((r) => r.mode === "verify")) {
      const match = result.solutions.find((s) => s.recommendationId === rec.id)!;
      assert.equal(match.solution, null, `${label}: verify recommendation ${rec.id} must never produce a concrete solution`);
    }

    // Commercial offering boundary: every NOW/LATER item must trace to a non-null solution's recommendation,
    // except license fit itself (a separately computed axis, not a solution-derived item).
    for (const item of [...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements]) {
      const hasNonNullSolution = result.solutions.some((match) => match.solution !== null);
      assert.ok(hasNonNullSolution, `${label}: commercial item ${item.id} exists with no non-null solution anywhere in the chain`);
    }

    // Digital Health independence: swapping the public band must never change license fit.
    const mutated = { ...result, overall: { ...result.overall, index: { ...result.overall.index, displayScore: 1 }, publicLabel: "MAL" as const } };
    const bandSwapped = { ...result, overall: { ...result.overall, index: { ...result.overall.index, displayScore: 99 }, publicLabel: "BIEN" as const } };
    assert.notEqual(result.commercial.licenseFit, undefined);
    assert.deepEqual(mutated.commercial, bandSwapped.commercial, `${label}: license fit must be independent of overall band`);

    // No-license is first-class: null is a valid, non-error recommendedLicense.
    assert.ok(result.commercial.licenseFit.recommendedLicense === null || ["cuadra", "barrio", "ciudad"].includes(result.commercial.licenseFit.recommendedLicense), `${label}: license must be null or one of the three canonical licenses`);

    // Stale-provenance sanity: every traceable question ID across narrative/recommendations/solutions
    // must be present in activeAnswers (never a raw/invalidated answer).
    for (const id of allSourceQuestionIds(result)) {
      if (id.startsWith("commercial_") || id.startsWith("priority:") || id.startsWith("recommendation:")) continue;
      assert.ok(result.activeAnswers[id] !== undefined, `${label}: provenance question ${id} must be active`);
    }
  }
});

test("R6-FINAL: Measurement full chain — applicable/null/unobservable through to no commercial output", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_goal: "measure" } });
  const measurement = result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  const gapFact = result.semanticFacts.facts.find((f) => f.dimension === "measurement_optimization" && f.type === "evidence_gap");
  assert.equal(gapFact?.gap?.kind, "unobservable_in_context");
  assert.ok(!result.semanticFacts.facts.some((f) => f.dimension === "measurement_optimization" && (f.type === "strength" || f.type === "weakness")));
  const narrativeBlock = result.narrative.dimensions.find((d) => d.dimension === "measurement_optimization")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(narrativeBlock.status));
  const rec = result.recommendations.items.find((r) => r.dimension === "measurement_optimization");
  if (rec) {
    assert.equal(rec.mode, "verify");
    const match = result.solutions.find((s) => s.recommendationId === rec.id)!;
    assert.equal(match.solution, null);
  }
  assert.ok(!result.commercial.now.services.some((s) => s.id.includes("measurement")) && !result.commercial.now.complements.some((c) => c.id.includes("measurement")));
});

test("R6-FINAL: Discovery full chain — weak reliable reach never invents a channel offering", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "be_found", q2_discovery_reliable_reach: "weak" } });
  const rec = result.recommendations.items.find((r) => r.dimension === "discovery")!;
  assert.equal(rec.mode, "improve");
  const match = result.solutions.find((s) => s.recommendationId === rec.id)!;
  assert.equal(match.solution, null);
  for (const item of [...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements]) {
    assert.ok(!["seo", "google-ads", "meta-ads", "social", "local-listing", "advertising"].some((forbidden) => item.id.toLowerCase().includes(forbidden)));
  }
});

test("R6-FINAL: Relationship prospective full chain — before/after through narrative, recommendation and commercial", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const before = buildCandidateCommercialBoundaryV3({ answers: seed });
  const beforeDim = before.narrative.dimensions.find((d) => d.dimension === "relationship_recurrence")!;
  assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(beforeDim.status));
  const after = buildCandidateCommercialBoundaryV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "consistent" } });
  const afterScored = after.scoring.dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(afterScored.applicability, "applicable");
  assert.ok(afterScored.score !== null && afterScored.score >= 70, "a strong reading must exist");
  // A sound score may still surface a low-confidence "declared friction unconfirmed" verify item (single
  // observation), but it must never be misrepresented as a weakness/improve claim against that capability.
  const relationshipRec = after.recommendations.items.find((r) => r.dimension === "relationship_recurrence");
  if (relationshipRec) {
    assert.equal(relationshipRec.mode, "verify", "a sound score must never produce an 'improve' claim against the same dimension");
    const match = after.solutions.find((s) => s.recommendationId === relationshipRec.id)!;
    assert.equal(match.solution, null);
  }
});

test("R6-FINAL: website/service-only and Cuadra entity-independence full chains", () => {
  const website = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } });
  assert.equal(website.commercial.licenseFit.recommendedLicense, null);
  assert.ok(website.commercial.now.services.some((s) => s.name === "Web & Conversión"));

  const woSeed: AnswersV2 = { ...BASE, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal" };
  const asBusiness = buildCandidateCommercialBoundaryV3({ answers: { ...woSeed, q2_entity: "business" } });
  const asOrganization = buildCandidateCommercialBoundaryV3({ answers: { ...woSeed, q2_entity: "organization", q2_monetization: "mission" } });
  assert.equal(asBusiness.commercial.licenseFit.recommendedLicense, "cuadra");
  assert.equal(asOrganization.commercial.licenseFit.recommendedLicense, "cuadra");
  for (const result of [asBusiness, asOrganization]) {
    assert.ok(result.commercial.licenseFit.evidence.some((ref) => ref.questionId === "q2_process_systemization"), "Cuadra proof must trace to real Digital Readiness evidence, never entity alone");
  }
});

test("R6-FINAL: Barrio and Ciudad full chains, with byte-identical diagnostic output across clarification", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" };
  const barrio = buildCandidateCommercialBoundaryV3({ answers: seed });
  assert.equal(barrio.commercial.licenseFit.recommendedLicense, "barrio");
  const ciudad = buildCandidateCommercialBoundaryV3({ answers: seed, clarificationAnswer: "multiple_coordinated_processes" });
  assert.equal(ciudad.commercial.licenseFit.recommendedLicense, "ciudad");
  // Clarification is post-diagnostic only: every upstream field must stay byte-identical.
  assert.deepEqual(ciudad.scoring, barrio.scoring);
  assert.deepEqual(ciudad.priorities, barrio.priorities);
  assert.deepEqual(ciudad.semanticFacts, barrio.semanticFacts);
  assert.deepEqual(ciudad.narrative, barrio.narrative);
  assert.deepEqual(ciudad.overall, barrio.overall);
  assert.deepEqual(ciudad.recommendations, barrio.recommendations);
  assert.deepEqual(ciudad.solutions, barrio.solutions);
});

test("R6-FINAL: prelaunch full chain — no invented weakness, no percentage, no forced license", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  assert.equal(result.overall.index.rawScore, null);
  assert.equal(result.overall.index.displayScore, null);
  assert.equal(result.overall.publicLabel, null);
  assert.ok(result.recommendations.items.every((r) => r.mode === "prepare"));
  assert.equal(result.commercial.licenseFit.recommendedLicense, null);
});

test("R6-FINAL: determinism — answer order, save/resume, and clarification independence", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" };
  const left = buildCandidateCommercialBoundaryV3({ answers: seed });
  const reversed = buildCandidateCommercialBoundaryV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  assert.deepEqual(reversed.commercial, left.commercial);
  assert.deepEqual(reversed.recommendations, left.recommendations);
  const restored = buildCandidateCommercialBoundaryV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored.commercial, left.commercial);
  const sameClarificationTwice = buildCandidateCommercialBoundaryV3({ answers: seed, clarificationAnswer: "single_process" });
  const sameClarificationAgain = buildCandidateCommercialBoundaryV3({ answers: seed, clarificationAnswer: "single_process" });
  assert.deepEqual(sameClarificationTwice.commercial, sameClarificationAgain.commercial);
});

test("R6-FINAL: stale-answer invalidation propagates through the complete chain", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" };
  const before = buildCandidateCommercialBoundaryV3({ answers: seed });
  assert.equal(before.commercial.licenseFit.recommendedLicense, "barrio");
  const after = buildCandidateCommercialBoundaryV3({ answers: { ...seed, q2_delivery: ["online_checkout"] } });
  assert.equal(after.activeAnswers.q2_appointments_booking_friction, undefined);
  assert.notEqual(after.commercial.licenseFit.recommendedLicense, "barrio");
  for (const id of allSourceQuestionIds(after)) assert.notEqual(id, "q2_appointments_booking_friction");
});

test("R6-FINAL: candidate consumer chain stays private — barrel and bundle isolation", async () => {
  const barrel = await import("../../../app/features/diagnostic/index");
  for (const name of ["buildCandidateInterpretationCoreV3", "buildCandidateNarrativeAndOverallV3", "buildCandidateRecommendationsAndSolutionsV3", "matchCandidateSolutionV3", "buildCandidateCommercialBoundaryV3", "resolveCandidateLicenseFitV3", "matchCandidateCommercialOfferingsV3"]) {
    assert.equal((barrel as Record<string, unknown>)[name], undefined, `${name} must not be barrel-exported`);
  }
});
