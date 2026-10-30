import assert from "node:assert/strict";
import test from "node:test";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { classifyV9Activity } from "../../../app/features/diagnostic/qa03b/v9-context-semantics";

const get = (id: string) => {
  const q = bank.find((item) => item.id === id);
  assert.ok(q, `Missing candidate question ${id}`);
  return q;
};

test("C03: paused activity with historical customers is not current operation", () => {
  const state = classifyV9Activity("paused", "yes");
  assert.equal(state.canAssertCurrentOperation, false);
  assert.equal(state.canAssertHistoricalDemand, true);
  const donation = get("q2_nonprofit_donation_clarity");
  assert.match(JSON.stringify(donation.appliesWhen), /"question":"q2_operational_status","value":"operating"/);
});

test("C05: nonprofit without donations or dues has distinct gated questions", () => {
  for (const id of ["q2_nonprofit_donation_clarity", "q2_nonprofit_membership_lifecycle"]) {
    const q = get(id);
    assert.ok(q.appliesWhen || q.materialAppliesWhen, `${id} must be gated`);
    assert.ok(q.evidenceV3?.dimensions.length, `${id} must map evidence`);
    const gate = JSON.stringify(q.appliesWhen);
    assert.ok(gate.includes("q2_nonprofit_support_type"), `${id} must check support type`);
    assert.ok(gate.includes(id.includes("donation") ? "donations" : "membership_dues"));
  }
  assert.notEqual(get("q2_nonprofit_donation_clarity").id, get("q2_nonprofit_membership_lifecycle").id);
});

test("C07: unauthorized ecommerce follow-up remains not applicable", () => {
  const q = get("q2_ecommerce_cart_followup");
  assert.equal(q.options.find((option) => option.value === "no_authorized_contact")?.kind, "not_applicable");
  assert.equal(q.evidenceV3?.dimensions.find((d) => d.dimension === "relationship_recurrence")?.answers.no_authorized_contact, "not_applicable");
});

test("C08: restaurant menu question is guarded; no presence cannot be assumed clear", () => {
  const q = get("q2_food_menu_visibility");
  assert.ok(q.appliesWhen || q.materialAppliesWhen);
  const gate = JSON.stringify(q.appliesWhen);
  assert.ok(gate.includes("q2_presence_digital_base"));
  assert.ok(gate.includes("reliable_presence") && gate.includes("partial_presence"));
  assert.equal(q.evidenceV3?.dimensions.find((d) => d.dimension === "clarity_positioning")?.answers.unknown, "uncertainty");
  const generic = get("q2_presence_offer_clarity");
  assert.ok(generic.appliesWhen || generic.materialAppliesWhen);
});
