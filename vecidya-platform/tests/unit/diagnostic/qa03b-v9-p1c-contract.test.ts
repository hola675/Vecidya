import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { buildCandidateEditorialMatrixV9 } from "../../../app/features/diagnostic/qa03b/v9-editorial-review-matrix";

function question(id: string) {
  const item = bank.find((q) => q.id === id);
  assert.ok(item, `Missing V9 question: ${id}`);
  return item;
}

test("P1c: demand trend preserves observed signals and uncertainty", () => {
  const q = question("q2_demand_trend");
  assert.equal(q.type, "single");
  const expected = {
    increasing: ["demandTrend", "increasing_observed"],
    flat: ["demandTrend", "flat_observed"],
    decreasing: ["demandTrend", "decreasing_observed"],
    unknown: ["demandTrendUnknown", true],
  } as const;
  assert.deepEqual(q.options.map((o) => o.value), Object.keys(expected));
  for (const option of q.options) {
    const [kind, value] = expected[option.value as keyof typeof expected];
    assert.ok(option.produces?.some((signal) => signal.kind === kind && signal.value === value), option.value);
  }
});

test("P1c: capacity pressure and expansion may coexist; neutral choices remain exclusive", () => {
  const q = question("q2_capacity_signal");
  assert.equal(q.type, "multi");
  const byValue = new Map(q.options.map((o) => [o.value, o]));
  assert.equal(byValue.get("capacity_pressure")?.exclusive ?? false, false);
  assert.equal(byValue.get("capacity_expanded")?.exclusive ?? false, false);
  assert.equal(byValue.get("stable")?.exclusive, true);
  assert.equal(byValue.get("unknown")?.exclusive, true);
  assert.ok(byValue.get("capacity_pressure")?.produces?.some((s) => s.kind === "reviewedCapacityPressure" && s.value === true));
  assert.ok(byValue.get("capacity_expanded")?.produces?.some((s) => s.kind === "reviewedCapacityExpansion" && s.value === true));
});

test("P1c: unauthorized cart follow-up is neutral, never a weak follow-up signal", () => {
  const q = question("q2_ecommerce_cart_followup");
  assert.equal(q.version, 2);
  const option = q.options.find((o) => o.value === "no_authorized_contact");
  assert.equal(option?.kind, "not_applicable");
  const evidence = q.evidenceV3?.dimensions.find((d) => d.dimension === "relationship_recurrence");
  assert.equal(evidence?.answers.no_authorized_contact, "not_applicable");
  assert.equal(evidence?.answers.rarely, "weak");
});

test("P1c: menu visibility semantic ambiguity remains explicitly flagged until versioned resolution", () => {
  const q = question("q2_food_menu_visibility");
  const option = q.options.find((o) => o.value === "not_applicable");
  assert.equal(option?.kind, "not_applicable");
  assert.equal(q.evidenceV3?.dimensions.find((d) => d.dimension === "clarity_positioning")?.answers.not_applicable, "not_applicable");
  const row = buildCandidateEditorialMatrixV9().rows.find((r) => r.id === q.id);
  assert.equal(row?.decision, "needs_semantic_review");
});
