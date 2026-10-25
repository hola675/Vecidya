import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as production } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_RECOVERY_PILOT_V1 as pilot, QA03B_SPECIALTY_CANDIDATE_BANK_V1 as candidate } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import { QA03B_RECOVERY_WAVE2_QUESTIONS as recovered } from "../../../app/features/diagnostic/qa03b/recovery-wave2";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { renderQuestionV2, validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy";
import { QA03B_AUTHORED_CASES } from "./qa03b-case-matrix";

const base = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_sector: "retail",
  q2_monetization: "goods",
  q2_delivery: ["online_checkout"],
  q2_customer_buyer: "b2c",
  q2_goal: "stop_losing",
  q2_friction: "follow_up",
} as const;

const find = (id: string) => {
  const question = recovered.find((item) => item.id === id);
  assert.ok(question, id);
  return question;
};

test("wave 2 covers fifteen reviewed historical questions without activating the public bank", () => {
  assert.equal(production.length, 45);
  assert.equal(recovered.length, 15);
  assert.equal(candidate.length, 78);
  assert.equal(new Set(candidate.map((q) => q.id)).size, 78);
  assert.equal(recovered.filter((q) => q.evidenceMigration === "migrated").length, 7);
  assert.equal(recovered.filter((q) => q.evidenceMigration === "pending").length, 8);
  assert.deepEqual(validateEvidenceMigrationsV3(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);

  for (const question of recovered) {
    assert.ok(question.prompt.includes("¿") && question.prompt.endsWith("?"), question.id);
    assert.ok(question.hint && question.hint.length <= 140, question.id);
    assert.ok(question.options.length >= 3, question.id);
    assert.equal(new Set(question.options.map((option) => option.value)).size, question.options.length, question.id);
    const unknown = question.options.find((option) => option.kind === "unknown");
    if (unknown) assert.equal(unknown.produces?.length ?? 0, 0, `${question.id} must not infer fact on unknown`);
  }
  const changedContracts = new Map([
    ["q2_ecommerce_cart_followup", 2],
    ["q2_hospitality_flow_type", 2],
    ["q2_hospitality_reservation_noshow", 2],
    ["q2_local_repeat_customers", 2],
  ]);
  for (const question of recovered) assert.equal(question.version, changedContracts.get(question.id) ?? 1, question.id);
});

test("all 21 recovered entries have precise editorial copy, neutral options and justified evidence", () => {
  assert.equal(pilot.length, 6);
  const set = [...pilot, ...recovered];
  assert.equal(set.length, 21);
  assert.equal(new Set(set.map((q) => q.id)).size, 21);
  assert.equal(set.filter((q) => q.evidenceMigration === "migrated").length, 12);
  assert.equal(set.filter((q) => q.evidenceMigration === "pending").length, 9);
  for (const q of set) {
    assert.ok(q.prompt.includes("¿") && q.prompt.endsWith("?"), q.id);
    assert.ok(q.hint && q.hint.trim().length > 0 && q.hint.length <= 140, q.id);
    assert.ok(q.options.some((option) => option.value !== "unknown"), q.id);
    if (q.evidenceMigration === "migrated") {
      assert.ok(q.evidenceV3, q.id);
      for (const reading of q.evidenceV3!.dimensions) {
        assert.deepEqual(Object.keys(reading.answers).sort(), q.options.map((option) => option.value).sort(), q.id);
      }
    } else {
      assert.equal(q.evidenceV3, undefined, q.id);
    }
  }
});

test("cart visibility does not imply permission to contact abandoned-cart visitors", () => {
  const cart = find("q2_ecommerce_cart_followup");
  assert.ok(cart.options.some((q) => q.value === "no_authorized_contact" && q.kind === "not_applicable"));
  assert.ok(cart.options.some((q) => q.kind === "unknown"));
  assert.deepEqual(cart.evidenceV3?.dimensions[0]?.answers.no_authorized_contact, "not_applicable");
  const hidden = resolveEligibleQuestionsV2({ ...base, q2_ecommerce_cart_visibility: "no" }, candidate);
  assert.ok(!hidden.eligibleQuestionIds.includes(cart.id));
  const visible = resolveEligibleQuestionsV2({ ...base, q2_ecommerce_cart_visibility: "yes" }, candidate);
  assert.ok(visible.eligibleQuestionIds.includes(cart.id));
  const notContactable = scoreCandidateContextualDimensionsV3({
    answers: { ...base, q2_ecommerce_cart_visibility: "yes", q2_ecommerce_cart_followup: "no_authorized_contact" },
  }, candidate);
  const recurrence = notContactable.dimensions.find((d) => d.id === "relationship_recurrence");
  assert.equal(recurrence?.evidence.find((e) => e.questionId === cart.id)?.state, "not_applicable");
  const preparing = resolveEligibleQuestionsV2({ ...base, q2_operational_status: "preparing" }, candidate);
  assert.ok(!preparing.eligibleQuestionIds.includes(cart.id));
});

test("B2B qualification follows declared buyer instead of relying on a nonexistent B2B archetype", () => {
  const b2b = find("q2_b2b_qualification");
  const lead = { ...base, q2_monetization: "services", q2_sector: "b2b_services", q2_delivery: ["remote_service"], q2_customer_buyer: "b2b" };
  assert.ok(resolveEligibleQuestionsV2(lead, candidate).eligibleQuestionIds.includes(b2b.id));
  assert.ok(!resolveEligibleQuestionsV2({ ...lead, q2_customer_buyer: "b2c" }, candidate).eligibleQuestionIds.includes(b2b.id));
  const observed = scoreCandidateContextualDimensionsV3({ answers: { ...lead, q2_b2b_qualification: "no" } }, candidate);
  assert.equal(observed.dimensions.find((d) => d.id === "digital_readiness")?.evidence.find((e) => e.questionId === b2b.id)?.state, "weak");
});

test("restaurant reservations are distinct from appointments; unknown response is permitted", () => {
  const restaurant = { ...base, q2_sector: "food_hospitality", q2_delivery: ["onsite"], q2_monetization: "services" };
  const flow = find("q2_hospitality_flow_type");
  const noshow = find("q2_hospitality_reservation_noshow");
  assert.equal(flow.options.find((o) => o.value === "unknown")?.kind, "unknown");
  assert.equal(noshow.options.find((o) => o.value === "unknown")?.kind, "unknown");
  const before = resolveEligibleQuestionsV2(restaurant, candidate);
  assert.ok(before.eligibleQuestionIds.includes(flow.id));
  assert.ok(!before.eligibleQuestionIds.includes(noshow.id));
  const after = resolveEligibleQuestionsV2({ ...restaurant, q2_hospitality_flow_type: "reservation" }, candidate);
  assert.ok(after.eligibleQuestionIds.includes(noshow.id));
  const walkin = resolveEligibleQuestionsV2({ ...restaurant, q2_hospitality_flow_type: "walk_in" }, candidate);
  assert.ok(!walkin.eligibleQuestionIds.includes(noshow.id));
  assert.ok(!before.eligibleQuestionIds.includes("q2_appointments_noshow"));
  // Both questions intentionally remain pending: never fabricate a digital score.
  assert.equal(flow.evidenceMigration, "pending");
  assert.equal(noshow.evidenceMigration, "pending");
});

test("organizations unlock membership clarity only for current dues-based support", () => {
  const org = { ...base, q2_entity: "organization", q2_sector: "nonprofit_community", q2_monetization: "mission", q2_delivery: ["physical_location"], q2_customer_buyer: "no_direct_purchase" };
  const membership = find("q2_nonprofit_membership_lifecycle");
  const eligible = resolveEligibleQuestionsV2({ ...org, q2_nonprofit_support_type: "membership_dues" }, candidate);
  assert.ok(eligible.eligibleQuestionIds.includes(membership.id));
  const donations = resolveEligibleQuestionsV2({ ...org, q2_nonprofit_support_type: "donations" }, candidate);
  assert.ok(!donations.eligibleQuestionIds.includes(membership.id));
  const paused = resolveEligibleQuestionsV2({ ...org, q2_operational_status: "paused", q2_nonprofit_support_type: "membership_dues" }, candidate);
  assert.ok(!paused.eligibleQuestionIds.includes(membership.id));
});

test("operational responsibility and follow-up remain separate questions", () => {
  const ops = { ...base, q2_goal: "organize", q2_friction: "operations" };
  const followup = { ...base, q2_goal: "stop_losing", q2_friction: "follow_up" };
  assert.ok(resolveEligibleQuestionsV2(ops, candidate).eligibleQuestionIds.includes("q2_operations_process_ownership"));
  assert.ok(!resolveEligibleQuestionsV2(ops, candidate).eligibleQuestionIds.includes("q2_followup_status_visibility"));
  assert.ok(resolveEligibleQuestionsV2(followup, candidate).eligibleQuestionIds.includes("q2_followup_status_visibility"));
  assert.ok(!resolveEligibleQuestionsV2(followup, candidate).eligibleQuestionIds.includes("q2_operations_process_ownership"));
});

test("visible measurement wording respects nonprofit and health context without inventing clinical status", () => {
  const question = find("q2_measurement_source_confidence");
  const org = { ...base, q2_entity: "organization", q2_monetization: "mission", q2_sector: "nonprofit_community", q2_delivery: ["physical_location"], q2_goal: "measure" };
  const nonprofitContext = resolveEligibleQuestionsV2(org, candidate).context;
  const nonprofit = renderQuestionV2(question, { context: nonprofitContext, answers: org });
  assert.match(nonprofit.prompt, /organización/);
  assert.doesNotMatch(nonprofit.prompt, /cliente|paciente/i);

  const health = { ...base, q2_entity: "individual", q2_sector: "health_wellness", q2_delivery: ["appointments"], q2_monetization: "services", q2_goal: "measure" };
  const healthContext = resolveEligibleQuestionsV2(health, candidate).context;
  const resolved = renderQuestionV2(question, { context: healthContext, answers: health });
  assert.match(resolved.prompt, /persona solicita atención/);
  assert.doesNotMatch(resolved.prompt, /paciente/i);
  assert.deepEqual(resolved.options.map((o) => o.value), question.options.map((o) => o.value));
});

test("all 20 authored journeys keep exact baseline score/evidence when no new question is answered", () => {
  assert.equal(QA03B_AUTHORED_CASES.length, 20);
  for (const journey of QA03B_AUTHORED_CASES) {
    const before = scoreCandidateContextualDimensionsV3({ answers: journey.answers });
    const after = scoreCandidateContextualDimensionsV3({ answers: journey.answers }, candidate);
    assert.deepEqual(after.activeAnswers, before.activeAnswers, journey.id);
    assert.deepEqual(after.dimensions, before.dimensions, journey.id);
  }
});

test("new measurement observation is direct while cart visibility is supporting only", () => {
  assert.equal(find("q2_ecommerce_cart_visibility").evidenceV3?.dimensions[0]?.directness, "supporting");
  assert.equal(find("q2_measurement_source_confidence").evidenceV3?.dimensions[0]?.directness, "direct");
  const plan = buildCandidateQuestionPlanFromBankV3({
    answers: { ...base, q2_goal: "measure" },
  }, candidate);
  assert.ok(plan.budget.hardMax <= 24);
  assert.ok(plan.selectedQuestionIds.length <= plan.budget.hardMax);
  const source = find("q2_measurement_source_confidence");
  assert.ok(plan.evidenceSufficiency.usefulEvidenceQuestionIds.includes(source.id) ||
    plan.trace.some((t) => t.questionId === source.id && t.selected), "attribution is useful when measurement is open");
});

test("prelaunch interest is not silently converted into evidence of purchases or capacity", () => {
  const startup = { ...base, q2_entity: "project", q2_operational_status: "preparing", q2_has_customers: "no", q2_monetization: "services", q2_delivery: ["remote_service"] };
  const signal = find("q2_startup_demand_signal");
  const plan = buildCandidateQuestionPlanFromBankV3({ answers: startup }, candidate);
  assert.ok(plan.eligibleQuestionIds.includes(signal.id));
  assert.equal(signal.evidenceMigration, "pending");
  assert.ok(!plan.evidenceSufficiency.usefulEvidenceQuestionIds.includes(signal.id));
});

test("unscored repeat purchase is not treated as poor digital performance", () => {
  const repeat = find("q2_ecommerce_repeat_purchase");
  const local = find("q2_local_repeat_customers");
  assert.equal(repeat.evidenceMigration, "pending");
  assert.equal(local.evidenceMigration, "pending");
  assert.equal(repeat.options.find((o) => o.value === "not_applicable")?.kind, "not_applicable");
  assert.equal(local.options.find((o) => o.value === "not_applicable")?.kind, "not_applicable");
});
