import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateCommercialBoundaryV3, resolveCandidateLicenseFitV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { COMMERCIAL_V1_LICENSES } from "../../../app/features/diagnostic/commercial-recommendation";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const BASE: AnswersV2 = {
  q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat",
  q2_delivery: ["appointments"], q2_goal: "opportunities", q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_buyer: "b2b",
};

test("R6-D: service-only need produces no license (corrects the legacy minimum-Cuadra assumption)", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } });
  assert.equal(result.commercial.licenseFit.recommendedLicense, null);
  assert.ok(result.commercial.now.services.some((s) => s.name === "Web & Conversión"));
});

test("R6-D: missing/sparse commercial evidence resolves to no license, never a default Cuadra sale", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"] } as AnswersV2 });
  assert.equal(result.commercial.licenseFit.recommendedLicense, null);
  assert.equal(result.commercial.licenseFit.confidence, "to_confirm");
});

test("R6-D: Cuadra requires a demonstrated recurring organization need, never a web gap alone", () => {
  const cuadra = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_goal: "explain" } });
  assert.equal(cuadra.commercial.licenseFit.recommendedLicense, "cuadra");
  assert.ok(cuadra.commercial.licenseFit.rationale.toLowerCase().includes("organiza") || cuadra.commercial.licenseFit.rationale.toLowerCase().includes("relación"), "Cuadra's rationale must be framed around the organizational/relationship need, not CRM absence");
  // The exact same web-gap evidence that selects the website service must NOT by itself select Cuadra.
  const webGapOnly = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } });
  assert.equal(webGapOnly.commercial.licenseFit.recommendedLicense, null);
});

test("R6-D: Barrio fits one recurring commercial process (follow-up or booking), never Ciudad from that alone", () => {
  const followUp = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" } });
  assert.equal(followUp.commercial.licenseFit.recommendedLicense, "barrio");
  const booking = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" } });
  assert.equal(booking.commercial.licenseFit.recommendedLicense, "barrio");
});

test("R6-D: Ciudad requires explicit multiprocess clarification, never guessed from the bank alone", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" };
  const unclarified = buildCandidateCommercialBoundaryV3({ answers: seed });
  assert.equal(unclarified.commercial.licenseFit.recommendedLicense, "barrio");
  assert.equal(unclarified.commercial.licenseFit.confidence, "medium");
  const clarified = buildCandidateCommercialBoundaryV3({ answers: seed, clarificationAnswer: "multiple_coordinated_processes" });
  assert.equal(clarified.commercial.licenseFit.recommendedLicense, "ciudad");
  assert.equal(clarified.commercial.licenseFit.confidence, "high");
  const singleConfirmed = buildCandidateCommercialBoundaryV3({ answers: seed, clarificationAnswer: "single_process" });
  assert.equal(singleConfirmed.commercial.licenseFit.recommendedLicense, "barrio");
  assert.equal(singleConfirmed.commercial.licenseFit.confidence, "high");
});

test("R6-D: Digital Health score/band never participates in license fit", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" } });
  const lowScore = { ...result, overall: { ...result.overall, index: { ...result.overall.index, displayScore: 20 }, publicLabel: "MAL" as const } };
  const midScore = { ...result, overall: { ...result.overall, index: { ...result.overall.index, displayScore: 60 }, publicLabel: "REGULAR" as const } };
  const highScore = { ...result, overall: { ...result.overall, index: { ...result.overall.index, displayScore: 95 }, publicLabel: "BIEN" as const } };
  const fits = [lowScore, midScore, highScore].map((variant) => resolveCandidateLicenseFitV3(variant, undefined, undefined));
  assert.deepEqual(fits[0], fits[1]);
  assert.deepEqual(fits[1], fits[2]);
});

test("R6-D: growth stage and complement count never select Ciudad", () => {
  const flat = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost", q2_demand_trend: "flat" } });
  const growing = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost", q2_demand_trend: "growing" } });
  assert.equal(flat.commercial.licenseFit.recommendedLicense, "barrio");
  assert.equal(growing.commercial.licenseFit.recommendedLicense, "barrio");
});

test("R6-D: verify recommendations and null solutions produce no offering", () => {
  const measurement = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_goal: "measure" } });
  assert.equal(measurement.commercial.now.services.length, 0);
  assert.equal(measurement.commercial.now.complements.length, 0);
  const discovery = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "be_found", q2_discovery_reliable_reach: "weak" } });
  for (const item of [...discovery.commercial.now.services, ...discovery.commercial.now.complements, ...discovery.commercial.later.services, ...discovery.commercial.later.complements]) {
    assert.ok(!["local_listing", "organic_discovery", "social_content", "advertising", "seo", "google-ads", "meta-ads"].some((forbidden) => item.id.includes(forbidden)));
  }
});

test("R6-D: reputation complement respects its CRM license dependency", () => {
  const noCrm = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_goal: "trust", q2_friction: "trust", q2_reputation_flow: "weak" } });
  assert.equal(noCrm.commercial.now.complements.length, 0, "a CRM-dependent complement must not appear in NOW without the license that enables it");
  const withCrm = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost", q2_reputation_flow: "weak" } });
  assert.ok(withCrm.commercial.now.complements.some((c) => c.id === "reputation_reviews"));
});

test("R6-D: prelaunch never forces an operational license", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  assert.equal(result.commercial.licenseFit.recommendedLicense, null);
});

test("R6-D: at most one license and at most two NOW extras", () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost", q2_reputation_flow: "weak" } });
  assert.ok(result.commercial.now.license === null || typeof result.commercial.now.license === "string");
  assert.ok(result.commercial.now.complements.length + result.commercial.now.services.length <= 2);
});

test("R6-D: canonical prices are unchanged and used verbatim", () => {
  assert.deepEqual(COMMERCIAL_V1_LICENSES, { cuadra: { name: "Cuadra", monthlyUsd: 39, activationUsd: 0 }, barrio: { name: "Barrio", monthlyUsd: 59, activationUsd: 10 }, ciudad: { name: "Ciudad", monthlyUsd: 89, activationUsd: 15 } });
  const result = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" } });
  assert.equal(result.commercial.cost.monthlyLicenseUsd, 59);
  assert.equal(result.commercial.cost.activationUsd, 10);
});

test("R6-D: legacy-only commercial question IDs cannot influence candidate output", () => {
  const withLegacyNoise = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence", q2_retail_promotions: "yes_regular", q2_appointments_booking_method: "self_book_online", q2_operations_automation_adoption: "most_automated" } as AnswersV2 });
  const withoutLegacyNoise = buildCandidateCommercialBoundaryV3({ answers: { ...BASE, q2_delivery: ["other"], q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" } });
  assert.deepEqual(withLegacyNoise.commercial.licenseFit.recommendedLicense, withoutLegacyNoise.commercial.licenseFit.recommendedLicense);
  assert.deepEqual(withLegacyNoise.commercial.now, withoutLegacyNoise.commercial.now);
});

test("R6-D: stale answers cannot survive into commercial output", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["appointments"], q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_appointments_booking_friction: "often" };
  const before = buildCandidateCommercialBoundaryV3({ answers: seed });
  assert.equal(before.commercial.licenseFit.recommendedLicense, "barrio");
  const after = buildCandidateCommercialBoundaryV3({ answers: { ...seed, q2_delivery: ["online_checkout"] } });
  assert.notEqual(after.activeAnswers.q2_appointments_booking_friction, "often");
});

test("R6-D: determinism — answer order and save/resume", () => {
  const seed: AnswersV2 = { ...BASE, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_followup_general_process: "sometimes_lost" };
  const left = buildCandidateCommercialBoundaryV3({ answers: seed });
  const reversed = buildCandidateCommercialBoundaryV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  assert.deepEqual(reversed.commercial, left.commercial);
  const restored = buildCandidateCommercialBoundaryV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored.commercial, left.commercial);
});

test("R6-D: candidate commercial identity and API isolation", async () => {
  const result = buildCandidateCommercialBoundaryV3({ answers: BASE });
  assert.equal(result.commercial.identity, "commercial-product-system-v1+diag-v3-candidate-v1");
  const barrel = await import("../../../app/features/diagnostic/index");
  assert.equal((barrel as Record<string, unknown>).buildCandidateCommercialBoundaryV3, undefined);
  assert.equal((barrel as Record<string, unknown>).resolveCandidateLicenseFitV3, undefined);
  assert.equal((barrel as Record<string, unknown>).matchCandidateCommercialOfferingsV3, undefined);
});
