import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { buildQuestionPlan, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_BUSINESS_AUDIENCE_QUESTIONS_V2 as reviewed } from "../../../app/features/diagnostic/qbv2-reviewed-business-audience";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const keep = ["q2_b2b_status_visibility", "q2_creator_audience_ownership"];
const remove = ["q2_b2b_lead_source", "q2_b2b_sales_cycle", "q2_b2b_decision_makers", "q2_creator_channel_concentration", "q2_creator_content_consistency", "q2_creator_monetization_model", "q2_creator_conversion", "q2_nonprofit_participation"];
const defer = ["q2_b2b_qualification", "q2_nonprofit_support_type", "q2_nonprofit_donation_clarity", "q2_nonprofit_membership_lifecycle"];
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const route = (answers: AnswersV2) => buildQuestionPlan({ answers, bank: candidate });
const b2b = { q2_has_customers: "yes", q2_customer_buyer: "b2b", q2_goal: "organize" } as const;
const creator = { q2_has_customers: "yes", q2_monetization: "audience", q2_goal: "stop_losing" } as const;

test("R2I matrix keeps two distinct capabilities and protects closed removals and deferred applicability", () => {
  assert.deepEqual(reviewed.map(({ id }) => id), keep);
  assert.deepEqual(candidate.slice(31).map(({ id }) => id), keep);
  assert.equal(candidate.length, 33);
  assert.equal(new Set(candidate.map(({ id }) => id)).size, 33);
  for (const id of [...remove, ...defer, "q2_professional_referral_dependency", "q2_ecommerce_acquisition_dependency"]) {
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

test("B2B visibility uses declared buyer and need, independently from the follow-up process", () => {
  assert.ok(resolve(b2b).eligibleQuestionIds.includes(keep[0]!));
  assert.ok(resolve({ ...b2b, q2_customer_buyer: "mixed" }).eligibleQuestionIds.includes(keep[0]!));
  for (const buyer of ["b2c", "unknown", undefined]) assert.ok(!resolve({ ...b2b, q2_customer_buyer: buyer }).eligibleQuestionIds.includes(keep[0]!));
  assert.ok(!resolve({ ...b2b, q2_goal: "be_found" }).eligibleQuestionIds.includes(keep[0]!));
  assert.ok(resolve({ ...b2b, q2_goal: "other", q2_friction: "operations" }).eligibleQuestionIds.includes(keep[0]!));
  for (const value of ["defined", "partial", "informal", "unknown"]) {
    assert.ok(resolve({ ...b2b, q2_b2b_pipeline: value }).eligibleQuestionIds.includes(keep[0]!));
  }
  assert.ok(!reviewed[0]!.prompt.includes("sin tener que revisar"));
  assert.ok(reviewed[0]!.hint!.includes("consultar"));
  assert.ok(!reviewed[0]!.prompt.includes("venta"));
  const nonprofitBuyer = { ...b2b, q2_monetization: "mission" };
  assert.ok(resolve(nonprofitBuyer).eligibleQuestionIds.includes(keep[0]!));
  assert.deepEqual(deriveContextualEvidence({ ...nonprofitBuyer, [keep[0]!]: "clear" }, candidate), []);
  assert.ok(!resolve(creator).eligibleQuestionIds.includes(keep[0]!));
});

test("direct audience contact requires active audience monetization and a continuity need", () => {
  assert.ok(resolve(creator).eligibleQuestionIds.includes(keep[1]!));
  for (const model of ["services", "goods", "mission", "recurring", "other", "unsure", undefined]) {
    assert.ok(!resolve({ ...creator, q2_monetization: model }).eligibleQuestionIds.includes(keep[1]!));
  }
  assert.ok(!resolve({ ...creator, q2_goal: "be_found" }).eligibleQuestionIds.includes(keep[1]!));
  assert.ok(resolve({ ...creator, q2_goal: "other", q2_friction: "follow_up" }).eligibleQuestionIds.includes(keep[1]!));
  assert.ok(!resolve(b2b).eligibleQuestionIds.includes(keep[1]!));
  assert.ok(reviewed[1]!.hint!.includes("permiso"));
  assert.ok(!candidate.some((q) => q.id === "q2_creator_monetization_model"));
});

test("prelaunch and unresolved activity never route R2I operating-history questions", () => {
  for (const answers of [b2b, creator]) for (const customer of ["no", undefined]) {
    const changed = { ...answers, q2_has_customers: customer };
    assert.deepEqual(resolve(changed).eligibleQuestionIds.filter((id) => keep.includes(id)), []);
    assert.deepEqual(route(changed).selectedQuestionIds.filter((id) => keep.includes(id)), []);
  }
});

test("every R2I option, including unknown/N/A, preserves context and contributes zero candidate evidence", () => {
  for (const [index, base] of [b2b, creator].entries()) {
    const q = reviewed[index]!;
    const before = resolve(base);
    for (const option of q.options) {
      assert.equal(option.produces, undefined);
      const answers = { ...base, [q.id]: option.value };
      const after = resolve(answers);
      assert.deepEqual(after.context, before.context, `${q.id}/${option.value}`);
      assert.deepEqual(after.trace, before.trace, `${q.id}/${option.value}`);
      assert.deepEqual(deriveContextualEvidence(answers, candidate), []);
    }
    assert.ok(q.options.some((o) => o.kind === "unknown"));
    assert.ok(q.options.some((o) => o.kind === "not_applicable"));
    const legacy = QUESTION_BANK_V2.find((item) => item.id === q.id)!;
    for (const option of legacy.options.filter((o) => !o.kind)) {
      assert.ok(deriveContextualEvidence({ [q.id]: option.value }, QUESTION_BANK_V2).some((e) => e.questionId === q.id), `${q.id}/${option.value}: legacy`);
    }
  }
});

test("representative B2B, creator and nonprofit planners select only useful optional R2I constructs", () => {
  assert.equal(ROUTE_HARD_CAP, 24);
  const established = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" };
  for (const [extra, expected, count] of [
    [{ q2_customer_buyer: "b2b", q2_goal: "organize" }, [keep[0]], 10],
    [{ q2_monetization: "audience", q2_goal: "stop_losing" }, [keep[1]], 9],
    [{ q2_monetization: "mission", q2_goal: "opportunities" }, [], 8],
  ] as const) {
    const plan = route({ ...established, ...extra });
    assert.deepEqual(plan.selectedQuestionIds.filter((id) => keep.includes(id)), expected);
    assert.equal(plan.selectedQuestionIds.length, count);
    assert.ok(plan.selectedQuestionIds.length + 5 < ROUTE_HARD_CAP);
    assert.ok(plan.trace.filter((entry) => keep.includes(entry.questionId)).every((entry) => !entry.required));
  }
  for (const answers of [b2b, creator]) {
    assert.deepEqual(route({ ...answers, q2_goal: "be_found" }).selectedQuestionIds.filter((id) => keep.includes(id)), []);
  }
  const nonprofit = resolve({ ...established, q2_monetization: "mission", q2_goal: "opportunities" });
  assert.ok(!nonprofit.eligibleQuestionIds.some((id) => id.startsWith("q2_nonprofit_")));
});
