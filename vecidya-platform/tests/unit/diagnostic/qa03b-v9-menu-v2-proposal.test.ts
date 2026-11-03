import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as activeCandidate } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { QA03B_FOOD_MENU_VISIBILITY_V2_PROPOSAL as proposed } from "../../../app/features/diagnostic/qa03b/v9-food-menu-v2-proposal";

test("P1d: versioned menu proposal does not activate or mutate historical v1", () => {
  const v1 = activeCandidate.find((q) => q.id === "q2_food_menu_visibility");
  assert.ok(v1);
  assert.equal(v1.version, 1);
  assert.equal(proposed.version, 2);
  assert.equal(v1.options.find((o) => o.value === "not_applicable")?.kind, "not_applicable");
  assert.equal(v1.evidenceV3?.dimensions[0]?.answers.not_applicable, "not_applicable");
  assert.equal(proposed.evidenceV3?.questionVersion, 2);
  assert.equal(v1.evidenceV3?.questionVersion, 1);
  assert.equal(activeCandidate.length, 77);
});

test("P1d: unpublished menu is weak evidence; unknown remains uncertainty", () => {
  const values = proposed.options.map((o) => o.value);
  assert.ok(values.includes("not_published"));
  assert.ok(!values.includes("not_applicable"));
  assert.equal(proposed.options.find((o) => o.value === "not_published")?.kind, undefined);
  const answers = proposed.evidenceV3?.dimensions.find((d) => d.dimension === "clarity_positioning")?.answers;
  assert.equal(answers?.not_published, "weak");
  assert.equal(answers?.unknown, "uncertainty");
  assert.equal(answers?.clear, "established");
  assert.equal(answers?.partial, "partial");
  assert.equal(answers?.unclear, "weak");
  assert.equal(answers?.not_applicable, undefined);
});
