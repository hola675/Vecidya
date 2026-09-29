import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CURRENT_QUESTION_BANK_VERSION,
  LOTE_F_QUESTIONS_V2,
  NICHE_REGISTRY,
  QUESTION_BANK_V2,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

const startupIds = new Set(LOTE_F_QUESTIONS_V2.map((question) => question.id));

test("Lote F: banco completo pasa validación, no tiene IDs muertos y QBV2 permanece inactivo", () => {
  assert.deepEqual(validateQuestionBankV2(QUESTION_BANK_V2), []);
  assert.equal(new Set(QUESTION_BANK_V2.map((question) => question.id)).size, QUESTION_BANK_V2.length);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(QUESTION_BANK_V2.length, 80);
});

test("Lote F: startup/project solo aparece con entity project y stage idea/starting", () => {
  const idea = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no" }, QUESTION_BANK_V2);
  const operatingBusiness = resolveEligibleQuestionsV2({ q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular" }, QUESTION_BANK_V2);
  assert.ok(LOTE_F_QUESTIONS_V2.every((question) => idea.eligibleQuestionIds.includes(question.id)));
  assert.deepEqual(operatingBusiness.eligibleQuestionIds.filter((id) => startupIds.has(id)), []);
});

test("mutación A: idea/prelaunch nunca recibe preguntas maduras de reputación, retención, citas o medición", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no", q2_goal: "measure" }, QUESTION_BANK_V2);
  const forbidden = QUESTION_BANK_V2.filter((question) => ["reputation", "measurement", "appointments"].includes(question.module) || /repeat|retention|post_sale|review/i.test(question.id));
  assert.deepEqual(result.eligibleQuestionIds.filter((id) => forbidden.some((question) => question.id === id)), []);
});

test("mutación B/C/D: project copy no exige empresa, y niche hints no activan preguntas", () => {
  const visible = LOTE_F_QUESTIONS_V2.flatMap((question) => [question.prompt, question.helper, ...question.options.map((option) => option.label)]).join(" ").toLowerCase();
  assert.ok(!visible.includes("requiere una empresa") && !visible.includes("exige una empresa"));
  const withoutNiche = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no" }, QUESTION_BANK_V2);
  const withNiche = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no", q2_niche: "mobile_detailing" }, QUESTION_BANK_V2);
  assert.deepEqual(withNiche.eligibleQuestionIds, withoutNiche.eligibleQuestionIds);
});

test("mutation F/G: unknown solo aparece en hechos razonablemente desconocibles y N/A no sustituye routing", () => {
  for (const question of LOTE_F_QUESTIONS_V2) {
    const unknown = question.options.filter((option) => option.kind === "unknown");
    assert.ok(unknown.length <= 1, question.id);
    assert.ok(!question.options.some((option) => option.kind === "not_applicable"), question.id);
  }
});

test("niche catalog gap: mobile, manufacturing, wholesale y marketplace se representan sin taxonomía nueva", () => {
  const ids = new Set(NICHE_REGISTRY.map((entry) => entry.id));
  for (const id of ["mobile_detailing", "mobile_pet_grooming", "mobile_repair", "manufacturing", "wholesale_distribution", "two_sided_marketplace"]) assert.ok(ids.has(id));
  assert.ok(!QUESTION_BANK_V2.some((question) => question.module === "mobile_business" || question.module === "marketplace"));
});
