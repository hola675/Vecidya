import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { buildQuestionPlan, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_COMMERCE_QUESTIONS_V2 as reviewed } from "../../../app/features/diagnostic/qbv2-reviewed-commerce";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const keep = ["q2_retail_product_visibility", "q2_retail_customer_capture", "q2_ecommerce_product_discovery"];
const remove = ["q2_retail_promotions", "q2_ecommerce_cart_visibility", "q2_ecommerce_cart_followup", "q2_ecommerce_acquisition_dependency", "q2_hospitality_flow_type", "q2_hospitality_reservation_noshow", "q2_hospitality_peak_capacity", "q2_hospitality_delivery_takeaway"];
const defer = ["q2_ecommerce_checkout_friction", "q2_ecommerce_repeat_purchase"];
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const route = (answers: AnswersV2) => buildQuestionPlan({ answers, bank: candidate });

test("R2H decision matrix adds exactly three KEEP constructs and excludes REMOVE/DEFER", () => {
  assert.deepEqual(reviewed.map(({ id }) => id), keep);
  assert.deepEqual(candidate.slice(28, 31).map(({ id }) => id), keep);
  assert.equal(candidate.length, 33);
  assert.equal(new Set(candidate.map(({ id }) => id)).size, 33);
  for (const id of [...remove, ...defer, "q2_local_foot_traffic", "q2_local_discovery", "q2_local_repeat_customers", "q2_professional_referral_dependency"]) {
    assert.ok(QUESTION_BANK_V2.some((q) => q.id === id));
    assert.ok(!candidate.some((q) => q.id === id), id);
  }
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  for (const q of reviewed) {
    assert.equal(q.version, 2);
    assert.equal(q.routingRole, "adaptive");
    assert.equal(q.evidenceMigration, "pending");
    assert.equal(q.scoringReadiness, undefined);
    assert.ok(q.version > QUESTION_BANK_V2.find((legacy) => legacy.id === q.id)!.version);
  }
});

test("R2H requires active established delivery and separates archetypes, including hybrids", () => {
  for (const [delivery, goal, expected] of [
    ["retail", "explain", [keep[0]]], ["retail", "stop_losing", [keep[1]]],
    ["online_checkout", "opportunities", [keep[2]]], ["onsite", "opportunities", []],
    ["retail", "be_found", []], ["travels", "explain", []], ["appointments", "stop_losing", []],
  ] as const) {
    const answers = { q2_has_customers: "yes", q2_delivery: [delivery], q2_goal: goal };
    assert.deepEqual(resolve(answers).eligibleQuestionIds.filter((id) => keep.includes(id)), expected);
    for (const customer of ["no", undefined]) {
      assert.deepEqual(resolve({ ...answers, q2_has_customers: customer }).eligibleQuestionIds.filter((id) => keep.includes(id)), []);
      assert.deepEqual(route({ ...answers, q2_has_customers: customer }).selectedQuestionIds.filter((id) => keep.includes(id)), []);
    }
  }
  assert.deepEqual(resolve({ q2_has_customers: "yes", q2_sector: "food_hospitality", q2_goal: "explain" }).eligibleQuestionIds.filter((id) => keep.includes(id)), []);
  assert.deepEqual(resolve({ q2_has_customers: "yes", q2_delivery: ["retail", "online_checkout"], q2_goal: "explain" }).eligibleQuestionIds.filter((id) => keep.includes(id)), [keep[0], keep[2]]);
  assert.ok(resolve({ q2_has_customers: "yes", q2_delivery: ["retail"], q2_goal: "other", q2_friction: "follow_up" }).eligibleQuestionIds.includes(keep[1]!));
});

test("retail material gates avoid base duplication; ecommerce navigation adds a separate capability", () => {
  assert.equal(reviewed[0]!.appliesWhen, undefined);
  assert.equal(reviewed[1]!.appliesWhen, undefined);
  assert.ok(reviewed[0]!.materialAppliesWhen);
  assert.ok(reviewed[1]!.materialAppliesWhen);
  assert.ok(reviewed[2]!.appliesWhen);
  assert.equal(reviewed[2]!.materialAppliesWhen, undefined);
  // Offer comprehension is separate from location/contact, reviews, reach, and catalog navigation.
  assert.deepEqual(reviewed[0]!.options.map(({ value }) => value), ["clear", "partial", "unclear", "unknown"]);
  assert.ok(!reviewed[0]!.prompt.includes("disponible"));
  assert.ok(reviewed[1]!.hint!.includes("permiso"));
  assert.ok(reviewed[1]!.hint!.includes("siga en redes no cuenta"));
  assert.equal(candidate.filter((q) => q.id === "q2_reputation_flow").length, 1);
  assert.ok(!candidate.some((q) => ["retail_reviews", "ecommerce_reviews", "hospitality_reviews"].includes(q.id)));
});

test("all reviewed answers, including unknown/N/A, remain response data with no inference or evidence", () => {
  for (const q of reviewed) {
    const delivery = q.module === "retail" ? "retail" : "online_checkout";
    const goal = q.id === keep[0] ? "explain" : "stop_losing";
    const base = { q2_has_customers: "yes", q2_delivery: [delivery], q2_goal: goal };
    const before = resolve(base);
    for (const option of q.options) {
      assert.equal(option.produces, undefined);
      const after = resolve({ ...base, [q.id]: option.value });
      assert.deepEqual(after.context, before.context, `${q.id}/${option.value}: context`);
      assert.deepEqual(after.trace, before.trace, `${q.id}/${option.value}: trace`);
      assert.deepEqual(deriveContextualEvidence({ ...base, [q.id]: option.value }, candidate), []);
    }
    assert.equal(q.options.some((o) => o.kind === "unknown"), true);
  }
  assert.equal(reviewed[1]!.options.some((o) => o.kind === "not_applicable"), true);
  assert.equal(reviewed[2]!.options.some((o) => o.kind === "not_applicable"), true);
});

test("legacy commerce answers preserve historical evidence while reviewed semantics remain isolated", () => {
  for (const q of reviewed) {
    const legacy = QUESTION_BANK_V2.find((item) => item.id === q.id)!;
    for (const option of legacy.options.filter((o) => !o.kind)) {
      assert.ok(deriveContextualEvidence({ [q.id]: option.value }, QUESTION_BANK_V2).some((e) => e.questionId === q.id), `${q.id}/${option.value}`);
    }
  }
});

test("representative commerce routes select useful R2H questions without cap inflation", () => {
  assert.equal(ROUTE_HARD_CAP, 24);
  for (const [delivery, goal, selected, count] of [
    ["retail", "explain", [keep[0]], 7], ["retail", "stop_losing", [keep[1]], 7],
    ["online_checkout", "opportunities", [keep[2]], 10], ["onsite", "opportunities", [], 8],
    ["retail", "be_found", [], 8],
  ] as const) {
    const plan = route({ q2_has_customers: "yes", q2_delivery: [delivery], q2_goal: goal });
    assert.deepEqual(plan.selectedQuestionIds.filter((id) => keep.includes(id)), selected);
    assert.equal(plan.selectedQuestionIds.length, count);
    assert.ok(plan.selectedQuestionIds.length + 3 < ROUTE_HARD_CAP);
    for (const entry of plan.trace.filter((t) => keep.includes(t.questionId))) {
      assert.equal(entry.required, false);
      assert.equal(entry.selectedIn, delivery === "retail" ? "material" : "base");
    }
  }
});
