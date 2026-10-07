import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateRecommendationsAndSolutionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-recommendations";
import { matchCandidateSolutionV3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import { solutionContextOf } from "../../../app/features/diagnostic/qbv2-solutions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const BASE: AnswersV2 = {
  q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat",
  q2_delivery: ["appointments"], q2_goal: "opportunities", q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_buyer: "b2b",
};

test("R6-C: recommendation count/order always equals narrative.priorities, up to 3", () => {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_booking_friction: "often", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" } });
  assert.equal(result.recommendations.items.length, result.narrative.priorities.length);
  assert.deepEqual(result.recommendations.items.map((r) => r.rank), result.narrative.priorities.map((p) => p.rank));
  assert.ok(result.recommendations.items.length <= 3);
  assert.equal(result.solutions.length, result.recommendations.items.length, "one SolutionMatch per recommendation, same order");
  result.solutions.forEach((solution, index) => assert.equal(solution.recommendationId, result.recommendations.items[index]!.id));
});

test("R6-C: verify mode never produces a concrete solution, only an audit trail of exclusions", () => {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: BASE });
  const verifyRecs = result.recommendations.items.filter((r) => r.mode === "verify");
  assert.ok(verifyRecs.length > 0);
  for (const rec of verifyRecs) {
    const solution = result.solutions.find((s) => s.recommendationId === rec.id)!;
    assert.equal(solution.solution, null);
    assert.equal(solution.alternatives.length, 0);
    assert.ok(solution.exclusions.length > 0);
    assert.ok(solution.exclusions.every((e) => e.rule === "verify_before_intervention"));
  }
});

test("R6-C: Measurement zero-source — verify mode, solution null, no analytics/tracking inference", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "measure" };
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: seed });
  const rec = result.recommendations.items.find((r) => r.dimension === "measurement_optimization")!;
  assert.equal(rec.mode, "verify");
  const solution = result.solutions.find((s) => s.recommendationId === rec.id)!;
  assert.equal(solution.solution, null);
  assert.ok(solution.exclusions.some((e) => e.solutionId === "measurement_tracking"));
});

test("R6-C: Discovery weakness never implies a specific channel (SEO/social/local/ads)", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "be_found", q2_discovery_reliable_reach: "weak" };
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: seed });
  const rec = result.recommendations.items.find((r) => r.dimension === "discovery")!;
  assert.equal(rec.mode, "improve");
  const solution = result.solutions.find((s) => s.recommendationId === rec.id)!;
  assert.equal(solution.solution, null, "no channel-specific solution is evidence-backed by q2_discovery_reliable_reach alone");
  for (const forbidden of ["local_listing", "organic_discovery", "social_content", "advertising"]) assert.ok(!solution.exclusions.some((e) => e.solutionId === forbidden) || solution.solution === null);
});

test("R6-C: Conversion — booking friction and service-response weakness do not collapse into one intervention", () => {
  const booking = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" } });
  const bookingRec = booking.recommendations.items.find((r) => r.dimension === "conversion_access")!;
  const bookingSolution = booking.solutions.find((s) => s.recommendationId === bookingRec.id)!;
  assert.equal(bookingRec.mode, "improve");
  assert.equal(bookingSolution.solution?.id, "online_booking");

  const slow = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_delivery: ["travels"], q2_service_response_speed: "weak" } });
  const slowRec = slow.recommendations.items.find((r) => r.dimension === "conversion_access")!;
  const slowSolution = slow.solutions.find((s) => s.recommendationId === slowRec.id)!;
  assert.equal(slowRec.mode, "improve");
  assert.equal(slowSolution.solution, null, "slow service response is not fixed by a generic contact-path solution");
});

test("R6-C: Trust — reputation flow and authority signals map to distinct solutions", () => {
  const reputation = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_goal: "trust", q2_friction: "trust", q2_reputation_flow: "weak" } });
  const reputationSolution = reputation.solutions.find((s) => reputation.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "trust_reputation")!;
  assert.equal(reputationSolution.solution?.id, "reputation_reviews");

  const authority = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_entity: "individual", q2_sector: "legal", q2_goal: "trust", q2_friction: "trust", q2_professional_authority_signals: "not_really" } });
  const authoritySolution = authority.solutions.find((s) => authority.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "trust_reputation")!;
  assert.equal(authoritySolution.solution?.id, "credibility_proof");
});

test("R6-C: Relationship — evidence-specific mapping, never a default collapse into CRM/automation", () => {
  const generalProcess = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" } });
  const generalSolution = generalProcess.solutions.find((s) => generalProcess.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "relationship_recurrence")!;
  assert.equal(generalSolution.solution?.id, "crm_follow_up");

  const b2bPipeline = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_customer_buyer: "b2b", q2_goal: "stop_losing", q2_b2b_pipeline: "informal" } });
  const b2bSolution = b2bPipeline.solutions.find((s) => b2bPipeline.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "relationship_recurrence")!;
  assert.equal(b2bSolution.solution?.id, "crm_follow_up");

  const rebooking = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_goal: "stop_losing", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_rebooking: "reactive" } });
  const rebookingSolution = rebooking.solutions.find((s) => rebooking.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "relationship_recurrence")!;
  assert.equal(rebookingSolution.solution, null, "rebooking weakness must never automatically select CRM");

  const retailCapture = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_monetization: "goods", q2_delivery: ["retail"], q2_sector: "retail", q2_goal: "stop_losing", q2_retail_customer_capture: "no" } });
  const captureSolution = retailCapture.solutions.find((s) => retailCapture.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "relationship_recurrence")!;
  assert.equal(captureSolution.solution, null, "customer-capture weakness must never automatically select automation");

  const reminders = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_goal: "stop_losing", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_confirmation_reminders: "rarely" } });
  const remindersSolution = reminders.solutions.find((s) => reminders.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "relationship_recurrence")!;
  assert.equal(remindersSolution.solution, null, "reminder weakness alone (undefined process) must not select automation");
});

test("R6-C: Foundation — website requires the base-ownership question itself to show the gap", () => {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } });
  const solution = result.solutions.find((s) => result.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "digital_foundation")!;
  assert.equal(solution.solution?.id, "website");
});

test("R6-C: Readiness — automation requires a defined process; otherwise work organization", () => {
  const undefinedProcess = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "informal" } });
  const undefinedSolution = undefinedProcess.solutions.find((s) => undefinedProcess.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "digital_readiness")!;
  assert.equal(undefinedSolution.solution?.id, "work_organization");

  const definedProcess = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_goal: "organize", q2_friction: "operations", q2_process_systemization: "defined" } });
  const definedSolution = definedProcess.solutions.find((s) => definedProcess.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "digital_readiness");
  // A fully defined process may close the gap entirely (no recommendation) or select automation; both are
  // evidence-consistent outcomes — what must never happen is automation being selected without this signal.
  if (definedSolution) assert.ok(["operational_automation", "work_organization"].includes(definedSolution.solution?.id ?? ""));
});

test("R6-C: supporting-only evidence cannot by itself select automation", () => {
  const supportingOnly = buildCandidateRecommendationsAndSolutionsV3({ answers: { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_friction: "operations", q2_customer_buyer: "b2b", q2_operations_handoffs: "transfers_cleanly" } as AnswersV2 });
  const solution = supportingOnly.solutions.find((s) => supportingOnly.recommendations.items.find((r) => r.id === s.recommendationId)?.dimension === "digital_readiness");
  if (solution) assert.notEqual(solution.solution?.id, "operational_automation");
});

test("R6-C: context-only and later-review questions never resolve to a capability state usable by the solution matcher", () => {
  const solutionContext = solutionContextOf(
    buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" } }).scoring,
    buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" } }).priorities,
    buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" } }).narrative,
  );
  assert.equal(solutionContext.stateOf("q2_appointments_lead_to_booking"), undefined);
  assert.equal(solutionContext.stateOf("q2_creator_audience_ownership"), undefined);
  const pending = BANK.filter((q) => q.evidenceMigration === "pending").map((q) => q.id);
  for (const id of pending) assert.equal(solutionContext.stateOf(id), undefined, `${id}: a pending question must never resolve a capability state`);
});

test("R6-C: null and not_applicable prerequisites are handled honestly", () => {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" } });
  const conversionRec = result.recommendations.items.find((r) => r.dimension === "conversion_access");
  if (conversionRec) {
    for (const prerequisite of conversionRec.prerequisites) {
      const dimensionResult = result.scoring.dimensions.find((d) => d.id === prerequisite.dimension)!;
      assert.notEqual(dimensionResult.applicability, "not_applicable", "no prerequisite may be derived from a structurally not_applicable dimension");
      if (dimensionResult.score === null) assert.equal(prerequisite.satisfied, false, "a null-score prerequisite can never be satisfied");
    }
  }
});

test("R6-C: prelaunch recommendations use prepare-compatible solutions only", () => {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  assert.ok(result.recommendations.items.every((r) => r.mode === "prepare"));
  for (const solution of result.solutions) {
    if (solution.solution) assert.ok(["launch_channel_plan", "offer_message", "measurement_plan", "work_organization"].includes(solution.solution.id));
  }
});

test("R6-C: determinism and answer-change invalidation", () => {
  const seed: AnswersV2 = { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" };
  const left = buildCandidateRecommendationsAndSolutionsV3({ answers: seed });
  const reversed = buildCandidateRecommendationsAndSolutionsV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  assert.deepEqual(reversed.recommendations, left.recommendations);
  assert.deepEqual(reversed.solutions, left.solutions);
  const restored = buildCandidateRecommendationsAndSolutionsV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored.recommendations, left.recommendations);
  assert.deepEqual(restored.solutions, left.solutions);
  const changed = buildCandidateRecommendationsAndSolutionsV3({ answers: { ...seed, q2_delivery: ["online_checkout"] } });
  const staleIds = new Set(changed.recommendations.items.flatMap((r) => r.sourceQuestionIds));
  assert.ok(!staleIds.has("q2_appointments_booking_friction"));
});

test("R6-C: candidate recommendations/solutions API is not re-exported by the shared barrel", async () => {
  const barrel = await import("../../../app/features/diagnostic/index");
  assert.equal((barrel as Record<string, unknown>).buildCandidateRecommendationsAndSolutionsV3, undefined);
  assert.equal((barrel as Record<string, unknown>).matchCandidateSolutionV3, undefined);
});
