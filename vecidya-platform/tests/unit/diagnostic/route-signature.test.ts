import assert from "node:assert/strict";
import { test } from "node:test";

import { getApplicableQuestions } from "../../../app/features/diagnostic/answers.ts";
import { computeRouteSignature } from "../../../app/features/diagnostic/route-signature.ts";
import { personas } from "./personas.ts";
import type { QuestionId } from "../../../app/features/diagnostic/questions.ts";

function applicableIds(answers: Record<string, unknown>): QuestionId[] {
  return getApplicableQuestions(answers as never).map((question) => question.id);
}

test("same applicable questions in the same order produce the same signature (spec §23)", async () => {
  const first = await computeRouteSignature(applicableIds(personas.professionalReputation));
  const second = await computeRouteSignature(applicableIds({ ...personas.professionalReputation }));
  assert.equal(first, second);
});

test("a different real route (different persona) produces a different signature", async () => {
  const businessRoute = await computeRouteSignature(applicableIds(personas.localBusinessLeaks));
  const professionalRoute = await computeRouteSignature(applicableIds(personas.professionalReputation));
  assert.notEqual(businessRoute, professionalRoute);
});

test("order matters: reversing the question list changes the signature", async () => {
  const ids = applicableIds(personas.professionalReputation);
  const forward = await computeRouteSignature(ids);
  const reversed = await computeRouteSignature([...ids].reverse());
  assert.notEqual(forward, reversed);
});

test("is a 64-character lowercase hex digest", async () => {
  const signature = await computeRouteSignature(applicableIds(personas.professionalReputation));
  assert.match(signature, /^[0-9a-f]{64}$/);
});

test("empty applicable list still produces a deterministic signature (no profile chosen yet)", async () => {
  const first = await computeRouteSignature([]);
  const second = await computeRouteSignature([]);
  assert.equal(first, second);
});
