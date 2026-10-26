import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicBank } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_CANDIDATE_SECTOR_V4, QA03B_RECOVERY_PILOT_V1, QA03B_SPECIALTY_CANDIDATE_BANK_V1, QA03B_SPECIALTY_SELECTORS_V1 } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy";
import { NICHE_REGISTRY } from "../../../app/features/diagnostic/taxonomy";

const candidate = QA03B_SPECIALTY_CANDIDATE_BANK_V1;
const active = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_monetization: "services",
  q2_sector: "food_hospitality",
  q2_delivery: ["onsite"],
  q2_customer_buyer: "b2c",
  q2_goal: "explain",
  q2_friction: "conversion",
} as const;

test("specialty bank is isolated from the public 45 and preserves their contracts", () => {
  assert.equal(publicBank.length, 45);
  assert.equal(QA03B_SPECIALTY_SELECTORS_V1.length, 8);
  assert.equal(QA03B_RECOVERY_PILOT_V1.length, 6);
  assert.equal(candidate.length, 76);
  assert.equal(new Set(candidate.map((question) => question.id)).size, candidate.length);
  for (const question of publicBank) {
    const proposed = candidate.find((item) => item.id === question.id);
    assert.ok(proposed, question.id);
    if (question.id === "q2_sector") {
      assert.equal(question.version, 3);
      assert.equal(proposed.version, 4);
      assert.deepEqual(proposed.options.slice(0, -6), question.options.slice(0, -2));
    } else {
      assert.deepEqual(proposed, question, question.id);
    }
  }
  assert.deepEqual(validateEvidenceMigrationsV3(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
});

test("existing answers keep their scored dimensions under candidate bank", () => {
  const cases = [
    active,
    { ...active, q2_sector: "automotive", q2_delivery: ["physical_location"], q2_goal: "measure" },
    { ...active, q2_entity: "project", q2_operational_status: "preparing", q2_has_customers: "no", q2_delivery: ["remote_service"] },
    { ...active, q2_entity: "organization", q2_sector: "community_social", q2_monetization: "mission", q2_customer_buyer: "no_direct_purchase" },
  ] as const;
  for (const answers of cases) {
    const baseline = scoreCandidateContextualDimensionsV3({ answers });
    const proposed = scoreCandidateContextualDimensionsV3({ answers }, candidate);
    assert.deepEqual(proposed.dimensions, baseline.dimensions, JSON.stringify(answers));
    assert.deepEqual(proposed.activeAnswers, baseline.activeAnswers, JSON.stringify(answers));
  }
});

test("niche hint does not invent a multi-provider appointments archetype", () => {
  const answers = {
    ...active,
    q2_sector: "health_wellness",
    q2_niche_health_wellness: "dentist",
    q2_entity: "individual",
    q2_other_staff: "no",
    q2_delivery: ["remote_service"],
  };
  const context = resolveEligibleQuestionsV2(answers, candidate).context;
  assert.equal(context.niche.status, "resolved");
  assert.equal(context.archetype.status, "unresolved");
  assert.ok(!context.archetypeComponents.includes("appointments"));
});

test("specialty selectors have exact sector routing, known niche values and neutral fallbacks", () => {
  for (const question of QA03B_SPECIALTY_SELECTORS_V1) {
    const sector = question.id.replace("q2_niche_", "");
    const possible = NICHE_REGISTRY.filter((item) => item.group === sector);
    assert.ok(possible.length >= 2, sector);
    assert.deepEqual(question.options.slice(0, -2).map((option) => option.value), possible.map((item) => item.id), sector);
    assert.equal(question.options.at(-2)?.value, "other");
    assert.equal(question.options.at(-1)?.kind, "unknown");
    assert.equal(question.options.at(-2)?.produces, undefined);
    assert.equal(question.options.at(-1)?.produces, undefined);
    const answers = { ...active, q2_sector: sector };
    const eligible = resolveEligibleQuestionsV2(answers, candidate);
    assert.deepEqual(
      eligible.eligibleQuestionIds.filter((id) => id.startsWith("q2_niche_")),
      [question.id],
      sector,
    );
  }
});

test("proposed sector v4 exposes missing taxonomy families without altering live v3", () => {
  const values = QA03B_CANDIDATE_SECTOR_V4.options.map((item) => item.value);
  for (const sector of ["ecommerce", "creator", "b2b_services", "nonprofit_community"]) {
    assert.ok(values.includes(sector), sector);
    const result = resolveEligibleQuestionsV2({ ...active, q2_sector: sector }, candidate);
    assert.equal(result.context.nicheGroup.status, "resolved", sector);
    assert.equal(result.context.nicheGroup.status === "resolved" && result.context.nicheGroup.value, sector);
  }
  assert.equal(publicBank.find((question) => question.id === "q2_sector")?.version, 3);
});

test("declared niche resolves only on explicit, eligible selection", () => {
  const chosen = resolveEligibleQuestionsV2({ ...active, q2_niche_food_hospitality: "restaurant" }, candidate);
  assert.equal(chosen.context.niche.status, "resolved");
  assert.equal(chosen.context.niche.status === "resolved" && chosen.context.niche.value, "restaurant");
  assert.equal(chosen.context.nicheGroup.status === "resolved" && chosen.context.nicheGroup.value, "food_hospitality");
  for (const value of ["other", "unknown"]) {
    const fallback = resolveEligibleQuestionsV2({ ...active, q2_niche_food_hospitality: value }, candidate);
    assert.equal(fallback.context.niche.status, "unresolved", value);
  }
  const switched = resolveEligibleQuestionsV2({ ...active, q2_sector: "automotive", q2_niche_food_hospitality: "restaurant" }, candidate);
  assert.equal(switched.activeAnswers.q2_niche_food_hospitality, undefined);
  assert.equal(switched.context.niche.status, "unresolved");
});

test("candidate planner stays capped while niche classification is useful only in its sector", () => {
  const plan = buildCandidateQuestionPlanFromBankV3({ answers: active }, candidate);
  assert.ok(plan.evidenceSufficiency.usefulContextQuestionIds.includes("q2_niche_food_hospitality"));
  assert.ok(plan.selectedQuestionIds.length <= plan.budget.hardMax);
  assert.ok(!plan.selectedQuestionIds.some((id) => id.startsWith("q2_niche_") && id !== "q2_niche_food_hospitality"));
});

test("preparation questions offer clarity evidence without inventing operating sales", () => {
  const answers = {
    ...active,
    q2_entity: "project",
    q2_operational_status: "preparing",
    q2_has_customers: "no",
    q2_monetization: "services",
    q2_delivery: ["remote_service"],
  };
  const resolution = resolveEligibleQuestionsV2(answers, candidate);
  assert.ok(resolution.eligibleQuestionIds.includes("q2_startup_problem_clarity"));
  assert.ok(resolution.eligibleQuestionIds.includes("q2_startup_offer_readiness"));
  assert.ok(!resolution.eligibleQuestionIds.includes("q2_ecommerce_checkout_friction"));

  const measured = scoreCandidateContextualDimensionsV3({ answers: {
    ...answers,
    q2_startup_problem_clarity: "both_unclear",
    q2_startup_offer_readiness: "not_defined",
  } }, candidate);
  const clarity = measured.dimensions.find((dimension) => dimension.id === "clarity_positioning")!;
  const conversion = measured.dimensions.find((dimension) => dimension.id === "conversion_access")!;
  assert.ok(clarity.evidence.some((item) => item.questionId === "q2_startup_problem_clarity"));
  assert.equal(conversion.evidence.some((item) => item.questionId === "q2_ecommerce_checkout_friction"), false);
  assert.ok(!measured.activeAnswers.q2_appointments_noshow);
});

test("online checkout evidence requires actual operating ecommerce; unknown is neutral", () => {
  const online = { ...active, q2_sector: "retail", q2_monetization: "goods", q2_delivery: ["online_checkout"] };
  const resolved = resolveEligibleQuestionsV2(online, candidate);
  assert.ok(resolved.eligibleQuestionIds.includes("q2_ecommerce_checkout_friction"));
  const unknown = scoreCandidateContextualDimensionsV3({ answers: { ...online, q2_ecommerce_checkout_friction: "unknown" } }, candidate);
  const evidence = unknown.dimensions.find((item) => item.id === "conversion_access")?.evidence.find((item) => item.questionId === "q2_ecommerce_checkout_friction");
  assert.equal(evidence?.state, "uncertainty");
  const preparing = resolveEligibleQuestionsV2({ ...online, q2_operational_status: "preparing" }, candidate);
  assert.ok(!preparing.eligibleQuestionIds.includes("q2_ecommerce_checkout_friction"));
});

test("nonprofit donation question unlocks only after a donation-based support answer", () => {
  const org = {
    ...active, q2_entity: "organization", q2_monetization: "mission",
    q2_sector: "community_social", q2_delivery: ["physical_location"],
    q2_customer_buyer: "no_direct_purchase",
  };
  const start = resolveEligibleQuestionsV2(org, candidate);
  assert.ok(start.eligibleQuestionIds.includes("q2_nonprofit_support_type"));
  assert.ok(!start.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  const donations = resolveEligibleQuestionsV2({ ...org, q2_nonprofit_support_type: "donations" }, candidate);
  assert.ok(donations.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  const grants = resolveEligibleQuestionsV2({ ...org, q2_nonprofit_support_type: "grants" }, candidate);
  assert.ok(!grants.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  const preparing = resolveEligibleQuestionsV2({ ...org, q2_operational_status: "preparing" }, candidate);
  assert.ok(!preparing.eligibleQuestionIds.includes("q2_nonprofit_support_type"), "preparation must not imply current funding");
});
