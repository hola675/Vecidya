import assert from "node:assert/strict";
import { test } from "node:test";

import {
  adaptCommercialEvidence,
  commercialClarification,
  resolveCommercialRecommendation,
  resolveCommercialRecommendationAfterClarification,
  type CommercialDigitalResult,
} from "../../../app/features/diagnostic/commercial-recommendation.ts";

const digital = (score: number, band: CommercialDigitalResult["band"]): CommercialDigitalResult => ({
  score,
  band,
  confidence: "low",
});

test("commercial evidence adapter preserves direct provenance without reading the score", () => {
  const evidence = adaptCommercialEvidence({
    answers: {
      q2_entity: "business",
      q2_has_customers: "yes",
      q2_b2b_pipeline: "yes",
      q2_b2b_status_visibility: "lose_track",
      q2_followup_general_process: "manual_consistent",
      q2_operations_process_ownership: "yes_clear",
      q2_operations_information_base: "shared_system",
    },
  });

  assert.equal(evidence.crmNeed, "required");
  assert.equal(evidence.pipelineNeed, "required");
  assert.equal(evidence.recurringLeadFlow, "established");
  assert.equal(evidence.ownershipModel, "assigned");
  assert.ok(evidence.evidenceRefs.some((ref) => ref.questionId === "q2_b2b_pipeline" && ref.evidenceType === "DIRECT"));
  assert.ok(evidence.evidenceRefs.every((ref) => ref.questionId.length > 0 && ref.derivedFact.length > 0 && ref.relevance.length > 0));
});

test("identical operational evidence returns identical License Fit across Digital Health scores and bands", () => {
  const answers = {
    q2_entity: "business",
    q2_has_customers: "yes",
    q2_b2b_pipeline: "yes",
    q2_followup_general_process: "defined_process",
    q2_operations_process_ownership: "yes_clear",
  } as const;
  const results = [20, 60, 95].map((score, index) => resolveCommercialRecommendation({
    answers,
    digitalResult: digital(score, (["MAL", "REGULAR", "BIEN"] as const)[index]),
  }));

  assert.deepEqual(results.map((result) => result.licenseFit.recommendedLicense), ["barrio", "barrio", "barrio"]);
  assert.deepEqual(results.map((result) => result.licenseFit.confidence), ["to_confirm", "to_confirm", "to_confirm"]);
});

test("team size and complement count never upgrade one principal process to Ciudad", () => {
  const base = {
    q2_entity: "business",
    q2_has_customers: "yes",
    q2_b2b_pipeline: "yes",
    q2_followup_general_process: "defined_process",
    q2_operations_process_ownership: "yes_clear",
  } as const;

  for (const staff of ["2", "20", "200"]) {
    const result = resolveCommercialRecommendation({
      answers: { ...base, q2_declared_staff_count: staff },
      digitalResult: digital(90, "BIEN"),
      existingComplementCount: staff === "2" ? 0 : staff === "20" ? 1 : 4,
    });
    assert.equal(result.licenseFit.recommendedLicense, "barrio");
  }
});

test("stage and automate goal are contextual and do not independently select Ciudad", () => {
  const result = resolveCommercialRecommendation({
    answers: {
      q2_entity: "business",
      q2_has_customers: "yes",
      q2_growth_stage: "growing",
      q2_goal: "automate",
      q2_followup_general_process: "defined_process",
    },
    digitalResult: digital(95, "BIEN"),
  });

  assert.equal(result.licenseFit.recommendedLicense, "barrio");
  assert.ok(result.licenseFit.evidence.every((ref) => ref.questionId !== "q2_growth_stage" && ref.questionId !== "q2_goal"));
});

test("a single clarification can resolve Barrio versus Ciudad without reopening Digital Health", () => {
  const answers = {
    q2_entity: "business",
    q2_has_customers: "yes",
    q2_b2b_pipeline: "yes",
    q2_followup_general_process: "defined_process",
  } as const;
  const clarification = commercialClarification();
  assert.equal(clarification.options.length, 4);

  const single = resolveCommercialRecommendation({ answers, digitalResult: digital(20, "MAL"), clarificationAnswer: "single_process" });
  const multiple = resolveCommercialRecommendationAfterClarification({ answers, digitalResult: digital(95, "BIEN"), clarificationAnswer: "multiple_coordinated_processes" });

  assert.equal(single.licenseFit.recommendedLicense, "barrio");
  assert.equal(multiple.licenseFit.recommendedLicense, "ciudad");
  assert.equal(multiple.digitalResult.score, 95);
  assert.equal(multiple.licenseFit.confidence, "high");
  assert.ok(!multiple.operationalNeed.evidenceRefs.some((ref) => ref.questionId === clarification.id));
});

test("external CRM coverage and independent service needs can resolve to none, never forced Cuadra", () => {
  const result = resolveCommercialRecommendation({
    answers: {
      q2_entity: "individual",
      q2_has_customers: "yes",
      q2_operations_information_base: "shared_system",
      q2_operations_automation_adoption: "most_automated",
      q2_operations_handoffs: "transfers_cleanly",
      q2_presence_digital_base: "third_party_only",
    },
    digitalResult: digital(20, "MAL"),
  });

  assert.equal(result.licenseFit.recommendedLicense, "none");
  assert.equal(result.cost.activationUsd, 0);
  assert.equal(result.licenseFit.confidence, "high");
});

test("Cuadra is only selected for a demonstrated recurring Vecidya organization need", () => {
  const result = resolveCommercialRecommendation({
    answers: {
      q2_entity: "business",
      q2_has_customers: "yes",
      q2_presence_digital_base: "nothing",
      q2_followup_general_process: "unknown",
    },
    digitalResult: digital(20, "MAL"),
  });

  assert.equal(result.licenseFit.recommendedLicense, "cuadra");
  assert.equal(result.cost.activationUsd, 0);
  assert.match(result.licenseFit.whyNotHigher, /CRM|Barrio/i);
});

test("complements remain conservative, independent, priced and usage-labelled", () => {
  const result = resolveCommercialRecommendation({
    answers: {
      q2_entity: "business",
      q2_has_customers: "yes",
      q2_b2b_pipeline: "yes",
      q2_followup_general_process: "defined_process",
      q2_reputation_flow: "steady",
      q2_ecommerce_cart_followup: "sometimes",
    },
    digitalResult: digital(60, "REGULAR"),
  });

  assert.equal(result.licenseFit.recommendedLicense, "barrio");
  assert.ok(result.now.complements.length <= 2);
  assert.ok(result.now.complements.length + result.now.services.length <= 2);
  assert.ok(result.now.complements.every((item) => item.kind === "complement"));
  assert.ok(result.later.complements.some((item) => item.id === "campaigns_diffusion"));
  assert.ok(result.cost.externalUsage.some((item) => item.category === "email_sends"));
  assert.ok(result.now.complements.every((item) => item.priceMonthlyUsd > 0));
});

test("approved reputation values resolve to the V1 complement without inventing question options", () => {
  const steady = resolveCommercialRecommendation({
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_followup_general_process: "defined_process", q2_reputation_flow: "steady" },
    digitalResult: digital(60, "REGULAR"),
  });
  const occasional = resolveCommercialRecommendation({
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_followup_general_process: "defined_process", q2_reputation_flow: "occasional" },
    digitalResult: digital(60, "REGULAR"),
  });
  assert.equal(steady.now.complements.find((item) => item.id === "reputation_reviews")?.name, "Reputación & Reseñas");
  assert.equal(occasional.later.complements.find((item) => item.id === "reputation_reviews")?.name, "Reputación & Reseñas");
});

test("services require a demonstrated implementation gap and never map contact_path directly to Landing Pages", () => {
  const axis = resolveCommercialRecommendation({
    answers: {
      q2_entity: "business",
      q2_has_customers: "yes",
      q2_b2b_pipeline: "yes",
      q2_b2b_status_visibility: "yes_clear",
      q2_followup_general_process: "defined_process",
      q2_presence_digital_base: "own_updated",
      q2_presence_offer_clarity: "all_clear",
    },
    digitalResult: digital(90, "BIEN"),
  });
  assert.ok(![...axis.now.services, ...axis.later.services].some((item) => /landing/i.test(item.name)));

  const webGap = resolveCommercialRecommendation({
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_presence_digital_base: "nothing" },
    digitalResult: digital(30, "MAL"),
  });
  assert.ok([...webGap.now.services, ...webGap.later.services].some((item) => item.name === "Web & Conversión"));
});

test("activation, usage and upgrade/downgrade use the same pure resolver", () => {
  const upgrade = resolveCommercialRecommendation({
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_b2b_pipeline: "yes", q2_followup_general_process: "defined_process" },
    digitalResult: digital(50, "REGULAR"), currentLicense: "none", clarificationAnswer: "single_process",
  });
  const downgrade = resolveCommercialRecommendation({
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_b2b_pipeline: "yes", q2_followup_general_process: "defined_process" },
    digitalResult: digital(50, "REGULAR"), currentLicense: "ciudad", clarificationAnswer: "single_process",
  });

  assert.equal(upgrade.licenseFit.change, "upgrade");
  assert.equal(upgrade.cost.activationUsd, 10);
  assert.equal(downgrade.licenseFit.change, "downgrade");
  assert.equal(downgrade.cost.activationUsd, 10);
  assert.equal(upgrade.commercialRecommendationVersion, 1);
});

test("six certified commercial replays preserve the REC-01A invariants", () => {
  const cases = {
    reparaciones: {
      q2_entity: "business", q2_has_customers: "yes", q2_service_response_speed: "some_lost", q2_service_quote_practice: "varies", q2_service_quote_followup: "rarely",
    },
    maria: {
      q2_entity: "individual", q2_has_customers: "yes", q2_professional_followup_after_consult: "rarely_never", q2_professional_intake_flow: "ad_hoc",
    },
    vitalcare: {
      q2_entity: "business", q2_has_customers: "yes", q2_appointments_booking_method: "staff_manual", q2_appointments_confirmation_reminders: "manual", q2_followup_general_process: "defined_process",
    },
    mercado: {
      q2_entity: "business", q2_has_customers: "yes", q2_ecommerce_cart_visibility: "yes", q2_ecommerce_cart_followup: "sometimes", q2_ecommerce_checkout_friction: "sometimes",
    },
    axispro: {
      q2_entity: "business", q2_has_customers: "yes", q2_b2b_pipeline: "yes", q2_b2b_status_visibility: "yes_clear", q2_followup_general_process: "defined_process", q2_presence_digital_base: "own_updated",
    },
    nativa: {
      q2_entity: "business", q2_has_customers: "yes", q2_ecommerce_cart_visibility: "yes", q2_ecommerce_cart_followup: "always", q2_operations_information_base: "shared_system", q2_operations_automation_adoption: "most_automated", q2_operations_handoffs: "sometimes_lost",
    },
  } as const;
  const outputs = Object.fromEntries(Object.entries(cases).map(([id, answers]) => [id, resolveCommercialRecommendation({ answers, digitalResult: digital(id === "nativa" ? 93 : 32, id === "nativa" ? "BIEN" : "MAL") })]));

  assert.equal(outputs.reparaciones!.licenseFit.recommendedLicense, "barrio");
  assert.equal(outputs.maria!.licenseFit.recommendedLicense, "barrio");
  assert.equal(outputs.vitalcare!.licenseFit.recommendedLicense, "barrio");
  assert.equal(outputs.mercado!.licenseFit.recommendedLicense, "barrio");
  assert.equal(outputs.axispro!.licenseFit.recommendedLicense, "barrio");
  assert.equal(outputs.nativa!.licenseFit.recommendedLicense, "none");
  assert.equal(outputs.nativa!.digitalResult.score, 93, "Nativa keeps 93% as display data only");
  assert.ok(![...outputs.axispro!.now.services, ...outputs.axispro!.later.services].some((item) => /landing/i.test(item.name)));
  for (const output of Object.values(outputs)) assert.ok(output!.now.complements.length <= 2);
});
