import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qa03b/bank";
import { resolveEligibleQuestionsV2 as resolve } from "../../../app/features/diagnostic/qa03b/engine";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
const specification = JSON.parse(readFileSync(new URL("./qa03b-conceptual-context.json", import.meta.url), "utf8")) as { cases: { id: string; facts: string; answers: AnswersV2; pending: string[] }[] };
assert.equal(specification.cases.length, 61);
for (const fixture of specification.cases) test(`QA-03B: fragmento conceptual ${fixture.id}, sin completar hechos pendientes`, () => {
  const { context, activeAnswers, eligibleQuestionIds } = resolve(fixture.answers, BANK);
  if (fixture.answers.q2_entity) assert.equal(context.entity.status === "resolved" && context.entity.value, fixture.answers.q2_entity);
  if (fixture.answers.q2_has_customers) {
    assert.equal(context.hasEverHadRealPeople, fixture.answers.q2_has_customers === "yes");
    const state = fixture.answers.q2_operational_status;
    if (state !== "unknown") assert.equal(context.operationalStatus.status === "resolved" && context.operationalStatus.value, state);
    if (state === "paused" || state === "unknown" || (state === "operating" && fixture.answers.q2_has_customers === "no")) assert.equal(context.growthStage.status, "unresolved");
  } else assert.equal(context.hasEverHadRealPeople, null);
  if (fixture.answers.q2_customer_reach === "unknown") {
    assert.equal(context.customerModel.reach.status, "unresolved");
    if (context.customerModel.reach.status === "unresolved") assert.equal(context.customerModel.reach.reason, "declared_unknown");
  }
  if (!fixture.answers.q2_customer_buyer) {
    assert.equal(context.customerModel.buyer.status, "unresolved");
    assert.ok(!eligibleQuestionIds.includes("q2_buyer_recipient_relation"));
    assert.ok(!eligibleQuestionIds.includes("q2_b2b_pipeline"));
  }
  const modes = fixture.answers.q2_delivery;
  if (Array.isArray(modes) && modes.includes("remote_service") && !modes.includes("online_checkout")) {
    assert.ok(context.archetype.status !== "resolved" || context.archetype.value !== "ecommerce");
    assert.ok(!context.archetypeComponents.includes("ecommerce"));
  }
  assert.deepEqual(resolve(activeAnswers, BANK).activeAnswers, activeAnswers);
});
