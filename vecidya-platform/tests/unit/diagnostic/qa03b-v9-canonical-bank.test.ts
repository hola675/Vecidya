import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  QA03B_EXTENDED_CANDIDATE_BANK_V3 as bank82,
  QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4 as bank90,
  QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77,
} from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import {
  V9_CANONICAL_BANK_ID,
  V9_CANONICAL_BANK_VERSION,
  V9_CANONICAL_KEEP_IDS_V1,
  V9_CANONICAL_QUESTION_MANIFEST_V1,
  V9_CANONICAL_REWRITE_PENDING_IDS_V1,
  V9_PENDING_EXTENSION_IDS_V1,
} from "../../../app/features/diagnostic/v9/canonical-bank-manifest";

test("F02 canonical manifest freezes exactly the approved 77-question baseline", () => {
  assert.equal(V9_CANONICAL_BANK_ID, "diagnostic-v9-canonical-77-baseline-v1");
  assert.equal(V9_CANONICAL_BANK_VERSION, 1);
  assert.equal(V9_CANONICAL_QUESTION_MANIFEST_V1.length, 77);
  assert.equal(new Set(V9_CANONICAL_QUESTION_MANIFEST_V1.map((q) => q.id)).size, 77);
  assert.equal(V9_CANONICAL_KEEP_IDS_V1.length, 18);
  assert.equal(V9_CANONICAL_REWRITE_PENDING_IDS_V1.length, 59);
  assert.equal(new Set([...V9_CANONICAL_KEEP_IDS_V1, ...V9_CANONICAL_REWRITE_PENDING_IDS_V1]).size, 77);
});

test("F02 canonical manifest matches the current 77 source IDs, order and versions", () => {
  assert.equal(bank77.length, 77);
  assert.deepEqual(
    V9_CANONICAL_QUESTION_MANIFEST_V1.map((q) => ({ id: q.id, version: q.sourceVersion })),
    bank77.map((q) => ({ id: q.id, version: q.version })),
  );
  for (const question of bank77) {
    assert.ok(question.prompt.trim().length > 0, question.id);
    assert.ok(question.options.length > 0, question.id);
    assert.equal(new Set(question.options.map((o) => o.value)).size, question.options.length, question.id);
    assert.ok(question.options.every((o) => o.label.trim().length > 0), question.id);
  }
});

test("F02 keeps all 13 additions outside canonical 77 and pending", () => {
  const canonical = new Set(V9_CANONICAL_QUESTION_MANIFEST_V1.map((q) => q.id));
  assert.equal(V9_PENDING_EXTENSION_IDS_V1.length, 13);
  assert.equal(new Set(V9_PENDING_EXTENSION_IDS_V1).size, 13);
  assert.ok(V9_PENDING_EXTENSION_IDS_V1.every((id) => !canonical.has(id)), "pending addition leaked into canonical 77");

  const by82 = new Map(bank82.map((q) => [q.id, q]));
  const by90 = new Map(bank90.map((q) => [q.id, q]));
  for (const id of V9_PENDING_EXTENSION_IDS_V1) {
    const question = by90.get(id) ?? by82.get(id);
    assert.ok(question, id);
    assert.equal(question.evidenceMigration, "pending", id);
    assert.equal(question.evidenceV3, undefined, id);
  }
  assert.deepEqual(bank82.slice(0, 77), bank77);
  assert.deepEqual(bank90.slice(0, 77), bank77);
});

test("F02 preserves real-estate fallback and does not activate the pending replacement", () => {
  assert.ok(V9_CANONICAL_QUESTION_MANIFEST_V1.some((q) => q.id === "q2_professional_intake_flow"));
  assert.ok(!V9_CANONICAL_QUESTION_MANIFEST_V1.some((q) => q.id === "q2_real_estate_inquiry_entry"));
});

test("F02 manifest is V9-owned and adds no QA03B/QBV2 runtime import", () => {
  const source = readFileSync(
    new URL("../../../app/features/diagnostic/v9/canonical-bank-manifest.ts", import.meta.url),
    "utf8",
  );
  assert.equal(/\bfrom\s+["'][^"']*(?:qa03b|qbv2)/.test(source), false);
});

test("F02 authoritative V9 runtime still pins bank77, not bank82/bank90", () => {
  const files = [
    "../../../app/features/diagnostic/qa03b/worker-replay-v9.server.ts",
    "../../../app/features/diagnostic/qa03b/v9-finalization.server.ts",
    "../../../app/routes/diagnostic-v9-run.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.equal(source.includes("QA03B_EXTENDED_CANDIDATE_BANK_V3"), false, file);
    assert.equal(source.includes("QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4"), false, file);
  }
});
