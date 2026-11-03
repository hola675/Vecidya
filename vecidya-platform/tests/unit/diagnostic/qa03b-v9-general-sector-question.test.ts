import assert from "node:assert/strict";
import test from "node:test";

import { BUSINESS_SECTORS } from "../../../app/content/business-sectors.ts";
import { QA03B_V9_GENERAL_SECTOR_QUESTION as question } from "../../../app/features/diagnostic/qa03b/v9-general-sector-question.ts";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as publicV8 } from "../../../app/features/diagnostic/qa03b/bank.ts";

test("selector general candidato V9 reutiliza EXACTAMENTE el catálogo Vecindario", () => {
  assert.equal(question.id, "q2_sector_general");
  assert.equal(question.options.length, BUSINESS_SECTORS.length + 1);
  assert.deepEqual(question.options.slice(0, -1).map(({ value, label }) => ({ value, label })),
    BUSINESS_SECTORS.map(({ id, label }) => ({ value: id, label })));
  assert.equal(question.options.at(-1)?.value, "unknown");
  assert.equal(question.options.at(-1)?.kind, "unknown");
});

test("el sector general no fabrica evidencia ni altera el banco público V8", () => {
  assert.equal(question.evidenceMigration, "pending");
  assert.equal("evidenceV3" in question, false);
  assert.equal(question.options.every((o) => !("produces" in o)), true);
  assert.equal(publicV8.length, 45);
  assert.equal(publicV8.some((q) => q.id === question.id), false);
  assert.equal(publicV8.find((q) => q.id === "q2_sector")?.version, 3);
});
