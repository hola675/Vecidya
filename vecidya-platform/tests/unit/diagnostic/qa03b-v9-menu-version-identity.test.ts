import assert from "node:assert/strict";
import test from "node:test";

import { evidenceMigrationIdentity, validateQuestionEvidenceV3, validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as candidate } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { QA03B_FOOD_MENU_VISIBILITY_V2_PROPOSAL as proposed } from "../../../app/features/diagnostic/qa03b/v9-food-menu-v2-proposal";

test("P1e: v1 and v2 use distinct migration identities", () => {
  const legacy = candidate.find((q) => q.id === "q2_food_menu_visibility");
  assert.ok(legacy);
  assert.equal(evidenceMigrationIdentity(legacy.id, legacy.version), "q2_food_menu_visibility@v1");
  assert.equal(evidenceMigrationIdentity(proposed.id, proposed.version), "q2_food_menu_visibility@v2");
  assert.notEqual(evidenceMigrationIdentity(legacy.id, legacy.version), evidenceMigrationIdentity(proposed.id, proposed.version));
});

test("P1e: both evidence mappings validate independently", () => {
  const legacy = candidate.find((q) => q.id === "q2_food_menu_visibility");
  assert.ok(legacy);
  assert.deepEqual(validateQuestionEvidenceV3(legacy), []);
  assert.deepEqual(validateQuestionEvidenceV3(proposed), []);
  assert.deepEqual(validateEvidenceMigrationsV3([legacy, proposed]), []);
});

test("P1e: v2 is not registered in active V9 candidate", () => {
  const entries = candidate.filter((q) => q.id === proposed.id);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.version, 1);
});
