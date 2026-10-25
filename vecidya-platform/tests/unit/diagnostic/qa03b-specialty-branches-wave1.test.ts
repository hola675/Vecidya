import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_CANDIDATE_BANK_V1 as bank74 } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import {
  QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77,
  QA03B_SPECIALTY_BRANCH_QUESTIONS_V1 as branchQuestions,
} from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { validateCandidateAnswerV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { AUTHORED_UNKNOWN_CAPABILITIES } from "./qa03b-fixtures";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const dentistBase: AnswersV2 = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_monetization: "services",
  q2_sector: "health_wellness",
  q2_delivery: ["physical_location", "appointments"],
  q2_customer_buyer: "b2c",
  q2_goal: "stop_losing",
  q2_friction: "follow_up",
};

const restaurantBase: AnswersV2 = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_monetization: "goods",
  q2_sector: "food_hospitality",
  q2_delivery: ["onsite"],
  q2_customer_buyer: "b2c",
  q2_goal: "explain",
  q2_friction: "conversion",
  q2_presence_digital_base: "reliable_presence",
};

const agencyBase: AnswersV2 = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_monetization: "services",
  q2_sector: "b2b_services",
  q2_delivery: ["remote_service"],
  q2_customer_buyer: "b2b",
  q2_goal: "explain",
  q2_friction: "conversion",
  q2_presence_digital_base: "reliable_presence",
};

test("specialty branch bank adds exactly three reviewed direct observations and passes contracts", () => {
  assert.equal(bank74.length, 74);
  assert.equal(branchQuestions.length, 3);
  assert.equal(bank77.length, 77);
  assert.equal(new Set(bank77.map((q) => q.id)).size, 77);
  assert.deepEqual(validateEvidenceMigrationsV3(bank77), []);
  assert.deepEqual(validateQuestionCopyV2(bank77), []);
  for (const question of branchQuestions) {
    assert.equal(question.evidenceMigration, "migrated", question.id);
    assert.equal(question.evidenceV3?.dimensions.length, 1, question.id);
    assert.equal(question.evidenceV3?.dimensions[0]?.directness, "direct", question.id);
    assert.ok(question.hint && question.hint.length <= 140, question.id);
  }
});

test("dentist niche substitutes dental continuation for generic rebooking", () => {
  const before = resolveEligibleQuestionsV2(dentistBase, bank77);
  assert.ok(before.eligibleQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(!before.eligibleQuestionIds.includes("q2_dental_care_continuation"));
  assert.ok(before.eligibleQuestionIds.includes("q2_appointments_rebooking"));

  const prePlan = buildCandidateQuestionPlanFromBankV3({ answers: dentistBase }, bank77, "utility_first");
  assert.ok(!prePlan.selectedQuestionIds.includes("q2_niche_health_wellness"));

  const dentist = { ...dentistBase, q2_niche_health_wellness: "dentist" };
  const resolved = resolveEligibleQuestionsV2(dentist, bank77);
  assert.ok(resolved.eligibleQuestionIds.includes("q2_dental_care_continuation"));
  assert.ok(!resolved.eligibleQuestionIds.includes("q2_appointments_rebooking"));

  const primaryCare = resolveEligibleQuestionsV2({ ...dentistBase, q2_niche_health_wellness: "primary_care" }, bank77);
  assert.ok(!primaryCare.eligibleQuestionIds.includes("q2_dental_care_continuation"));
  assert.ok(primaryCare.eligibleQuestionIds.includes("q2_appointments_rebooking"));

  const generic = buildCandidateQuestionPlanFromBankV3({ answers: dentist }, bank74, "utility_first");
  const specialized = buildCandidateQuestionPlanFromBankV3({ answers: dentist }, bank77, "utility_first");
  assert.ok(generic.eligibleQuestionIds.includes("q2_appointments_rebooking"));
  assert.ok(specialized.eligibleQuestionIds.includes("q2_dental_care_continuation"));
  assert.equal(specialized.selectedQuestionIds.length, generic.selectedQuestionIds.length);
});

test("restaurant niche replaces generic offer clarity with menu visibility when clarity is actually needed", () => {
  const before = resolveEligibleQuestionsV2(restaurantBase, bank77);
  assert.ok(before.eligibleQuestionIds.includes("q2_niche_food_hospitality"));
  assert.ok(!before.eligibleQuestionIds.includes("q2_food_menu_visibility"));
  assert.ok(before.eligibleQuestionIds.includes("q2_presence_offer_clarity"));
  const prePlan = buildCandidateQuestionPlanFromBankV3({ answers: restaurantBase }, bank77, "utility_first");
  assert.ok(!prePlan.selectedQuestionIds.includes("q2_niche_food_hospitality"));

  const restaurant = { ...restaurantBase, q2_niche_food_hospitality: "restaurant" };
  const resolved = resolveEligibleQuestionsV2(restaurant, bank77);
  assert.ok(resolved.eligibleQuestionIds.includes("q2_food_menu_visibility"));
  assert.ok(!resolved.eligibleQuestionIds.includes("q2_presence_offer_clarity"));

  const fallback = resolveEligibleQuestionsV2({ ...restaurantBase, q2_niche_food_hospitality: "other" }, bank77);
  assert.ok(!fallback.eligibleQuestionIds.includes("q2_food_menu_visibility"));
  assert.ok(fallback.eligibleQuestionIds.includes("q2_presence_offer_clarity"));

  const generic = buildCandidateQuestionPlanFromBankV3({ answers: restaurant }, bank74, "utility_first");
  const specialized = buildCandidateQuestionPlanFromBankV3({ answers: restaurant }, bank77, "utility_first");
  assert.equal(specialized.selectedQuestionIds.length, generic.selectedQuestionIds.length);
});

test("marketing-agency niche replaces generic offer clarity with scope clarity for B2B buyers", () => {
  const before = resolveEligibleQuestionsV2(agencyBase, bank77);
  assert.ok(before.eligibleQuestionIds.includes("q2_niche_b2b_services"));
  assert.ok(!before.eligibleQuestionIds.includes("q2_marketing_agency_scope_clarity"));
  assert.ok(before.eligibleQuestionIds.includes("q2_presence_offer_clarity"));
  const prePlan = buildCandidateQuestionPlanFromBankV3({ answers: agencyBase }, bank77, "utility_first");
  assert.ok(!prePlan.selectedQuestionIds.includes("q2_niche_b2b_services"));

  const agency = { ...agencyBase, q2_niche_b2b_services: "marketing_agency" };
  const resolved = resolveEligibleQuestionsV2(agency, bank77);
  assert.ok(resolved.eligibleQuestionIds.includes("q2_marketing_agency_scope_clarity"));
  assert.ok(!resolved.eligibleQuestionIds.includes("q2_presence_offer_clarity"));

  const wholesale = resolveEligibleQuestionsV2({ ...agencyBase, q2_niche_b2b_services: "wholesale_distribution" }, bank77);
  assert.ok(!wholesale.eligibleQuestionIds.includes("q2_marketing_agency_scope_clarity"));
  assert.ok(wholesale.eligibleQuestionIds.includes("q2_presence_offer_clarity"));

  const generic = buildCandidateQuestionPlanFromBankV3({ answers: agency }, bank74, "utility_first");
  const specialized = buildCandidateQuestionPlanFromBankV3({ answers: agency }, bank77, "utility_first");
  assert.equal(specialized.selectedQuestionIds.length, generic.selectedQuestionIds.length);
});

test("specialized answers produce evidence only from the specialized question, never from the niche selector", () => {
  const cases: readonly [AnswersV2, string, string][] = [
    [{ ...dentistBase, q2_niche_health_wellness: "dentist", q2_dental_care_continuation: "reactive" },
      "q2_dental_care_continuation", "relationship_recurrence"],
    [{ ...restaurantBase, q2_niche_food_hospitality: "restaurant", q2_food_menu_visibility: "unclear" },
      "q2_food_menu_visibility", "clarity_positioning"],
    [{ ...agencyBase, q2_niche_b2b_services: "marketing_agency", q2_marketing_agency_scope_clarity: "unclear" },
      "q2_marketing_agency_scope_clarity", "clarity_positioning"],
  ];
  for (const [answers, questionId, dimensionId] of cases) {
    const scored = scoreCandidateContextualDimensionsV3({ answers }, bank77);
    const dimension = scored.dimensions.find((d) => d.id === dimensionId);
    assert.ok(dimension?.evidence.some((e) => e.questionId === questionId), questionId);
    assert.ok(scored.dimensions.every((d) => d.evidence.every((e) => !e.questionId.startsWith("q2_niche_"))), questionId);
  }
});

function walkSpecialty(
  bank: readonly QuestionDefinitionV2[],
  authored: AnswersV2,
) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  let answers: AnswersV2 = {};
  const asked: string[] = [];
  for (let turn = 0; turn <= 24; turn++) {
    const plan = buildCandidateQuestionPlanFromBankV3({ answers }, bank, "utility_first");
    answers = plan.activeAnswers;
    if (!plan.nextQuestionId) {
      const score = scoreCandidateContextualDimensionsV3({ answers }, bank);
      return {
        asked,
        terminal: plan.evidenceSufficiency.terminalReason,
        ready: plan.completion.ready,
        evidence: score.dimensions.reduce((sum, d) => sum + d.evidence.length, 0),
        unresolved: plan.evidenceSufficiency.unresolvedApplicableDimensions.length,
        insufficient: plan.evidenceSufficiency.insufficientContextDimensions.length,
      };
    }
    assert.ok(turn < 24, "specialty route exceeded 24 questions");
    const question = byId.get(plan.nextQuestionId);
    assert.ok(question, plan.nextQuestionId);
    let value = authored[question.id];
    if (value === undefined) {
      const neutral = question.options.find((option) => option.kind === "unknown");
      assert.ok(neutral, `no authored or unknown answer for ${question.id}`);
      value = question.type === "multi" ? [neutral.value] : neutral.value;
    }
    assert.ok(validateCandidateAnswerV3(question, value), `invalid answer for ${question.id}`);
    assert.ok(!asked.includes(question.id), `repeated ${question.id}`);
    asked.push(question.id);
    answers = { ...answers, [question.id]: value };
  }
  throw new Error("specialty route did not terminate");
}

test("full anonymous journeys keep zero selector cost when specialty evidence is semantically equivalent", () => {
  const cases: readonly { id: string; answers: AnswersV2; specialized: string; generic: string }[] = [
    {
      id: "dental-followup",
      answers: {
        ...AUTHORED_UNKNOWN_CAPABILITIES,
        q2_entity: "business", q2_operational_status: "operating", q2_has_customers: "yes",
        q2_other_staff: "yes", q2_monetization: "services", q2_sector: "health_wellness",
        q2_delivery: ["physical_location", "appointments"], q2_customer_buyer: "b2c",
        q2_customer_reach: "local", q2_goal: "stop_losing", q2_friction: "follow_up",
        q2_niche_health_wellness: "dentist", q2_appointments_rebooking: "unknown",
        q2_dental_care_continuation: "unknown",
      },
      specialized: "q2_dental_care_continuation",
      generic: "q2_appointments_rebooking",
    },
    {
      id: "restaurant-clarity",
      answers: {
        ...AUTHORED_UNKNOWN_CAPABILITIES,
        q2_entity: "business", q2_operational_status: "operating", q2_has_customers: "yes",
        q2_other_staff: "yes", q2_monetization: "goods", q2_sector: "food_hospitality",
        q2_delivery: ["onsite"], q2_customer_buyer: "b2c", q2_customer_reach: "local",
        q2_goal: "explain", q2_friction: "conversion", q2_presence_digital_base: "reliable_presence",
        q2_niche_food_hospitality: "restaurant", q2_presence_offer_clarity: "unknown",
        q2_food_menu_visibility: "unknown",
      },
      specialized: "q2_food_menu_visibility",
      generic: "q2_presence_offer_clarity",
    },
    {
      id: "agency-clarity",
      answers: {
        ...AUTHORED_UNKNOWN_CAPABILITIES,
        q2_entity: "business", q2_operational_status: "operating", q2_has_customers: "yes",
        q2_other_staff: "yes", q2_monetization: "services", q2_sector: "b2b_services",
        q2_delivery: ["remote_service"], q2_customer_buyer: "b2b", q2_customer_reach: "regional",
        q2_goal: "explain", q2_friction: "conversion", q2_presence_digital_base: "reliable_presence",
        q2_niche_b2b_services: "marketing_agency", q2_presence_offer_clarity: "unknown",
        q2_marketing_agency_scope_clarity: "unknown",
      },
      specialized: "q2_marketing_agency_scope_clarity",
      generic: "q2_presence_offer_clarity",
    },
  ];

  for (const scenario of cases) {
    const before = walkSpecialty(bank74, scenario.answers);
    const after = walkSpecialty(bank77, scenario.answers);
    assert.ok(before.asked.length <= 24 && after.asked.length <= 24, scenario.id);
    // Starting anonymously, equivalent specialty copy is not worth an extra selector.
    assert.ok(!after.asked.includes(scenario.specialized), scenario.id);
    assert.ok(after.asked.includes(scenario.generic), scenario.id);
    assert.equal(after.asked.length, before.asked.length, `${scenario.id}: equivalent specialization must cost zero extra questions`);
    assert.equal(after.evidence, before.evidence, `${scenario.id}: evidence is unchanged without a known niche`);
    assert.equal(after.unresolved, before.unresolved, `${scenario.id}: unresolved dimensions are unchanged`);
    assert.equal(after.insufficient, before.insufficient, `${scenario.id}: insufficient context is unchanged`);
    console.log(`QA03B_SPECIALTY_AB ${JSON.stringify({
      profile: scenario.id,
      bank74: { count: before.asked.length, evidence: before.evidence, terminal: before.terminal },
      bank77: { count: after.asked.length, evidence: after.evidence, terminal: after.terminal },
      added: after.asked.filter((id) => !before.asked.includes(id)),
      removed: before.asked.filter((id) => !after.asked.includes(id)),
    })}`);
  }
});

