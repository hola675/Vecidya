import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as bank } from "../../../app/features/diagnostic/qa03b/bank.ts";
import { applyQA03BEditorialCopy, QA03B_EDITORIAL_COPY } from "../../../app/features/diagnostic/qa03b/editorial-copy.ts";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy.ts";

test("QA-03B has exactly 45 uniquely identified questions covered by the editorial catalog", () => {
  const ids = bank.map((q) => q.id);
  assert.equal(ids.length, 45);
  assert.equal(new Set(ids).size, 45);
  assert.deepEqual([...Object.keys(QA03B_EDITORIAL_COPY)].sort(), [...ids].sort());

  for (const question of bank) {
    const copy = QA03B_EDITORIAL_COPY[question.id as keyof typeof QA03B_EDITORIAL_COPY];
    assert.equal(question.prompt, copy.prompt, question.id);
    assert.equal(question.hint, copy.hint, question.id);
    assert.ok(copy.prompt.includes("¿") && copy.prompt.endsWith("?"), question.id);
    assert.ok(copy.hint.trim().length > 0 && copy.hint.length <= 140, question.id);

    const variants: Readonly<Record<number, string>> | undefined = "variantPrompts" in copy
      ? copy.variantPrompts
      : undefined;
    for (const [indexText, prompt] of Object.entries(variants ?? {})) {
      const index = Number(indexText);
      assert.ok(index >= 0 && index < (question.variants?.length ?? 0), `${question.id}: variant index ${index}`);
      assert.equal(question.variants?.[index]?.prompt, prompt);
    }
  }
});

test("editorial application cannot mutate IDs, answer options, routing, signals or evidence", () => {
  for (const question of bank) {
    const original = {
      ...question,
      prompt: "__old_prompt__",
      hint: "__old_hint__",
      ...(question.variants ? {
        variants: question.variants.map((variant) => ({ ...variant, prompt: "__old_variant_prompt__" })),
      } : {}),
    };
    const revised = applyQA03BEditorialCopy(original);
    const { prompt: _beforePrompt, hint: _beforeHint, variants: beforeVariants, ...beforeContract } = original;
    const { prompt: _afterPrompt, hint: _afterHint, variants: afterVariants, ...afterContract } = revised;
    assert.deepEqual(afterContract, beforeContract, question.id);

    assert.equal(revised.options, original.options, `${question.id}: options remain referentially identical`);
    assert.equal(revised.appliesWhen, original.appliesWhen, `${question.id}: appliesWhen unchanged`);
    assert.equal(revised.materialAppliesWhen, original.materialAppliesWhen, `${question.id}: materialAppliesWhen unchanged`);
    assert.equal(revised.evidenceV3, original.evidenceV3, `${question.id}: evidence unchanged`);

    assert.equal(afterVariants?.length, beforeVariants?.length, question.id);
    for (let index = 0; index < (afterVariants?.length ?? 0); index++) {
      const { prompt: _beforeVariantPrompt, ...beforeVariantContract } = beforeVariants![index]!;
      const { prompt: _afterVariantPrompt, ...afterVariantContract } = afterVariants![index]!;
      assert.deepEqual(afterVariantContract, beforeVariantContract, `${question.id}: variant ${index} preserved`);
    }
  }
});

test("canonical QA-03B editorial copy passes the question copy contract", () => {
  assert.deepEqual(validateQuestionCopyV2(bank), []);
});
