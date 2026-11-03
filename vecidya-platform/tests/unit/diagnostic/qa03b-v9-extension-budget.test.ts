import assert from "node:assert/strict";
import test from "node:test";

import {
  V9_ABSOLUTE_INTERACTION_LIMIT,
  V9_BASE_INTERACTION_LIMIT,
  V9_EXTENSION_INTERACTION_LIMIT,
  v9ExtensionInteractionsRemaining,
  v9ExtensionInteractionsUsed,
} from "../../../app/features/diagnostic/v9/route-budget";
import { buildCandidateQuestionPlanV9Prototype } from "../../../app/features/diagnostic/qa03b/v9-classification-bundle";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  submitExtensionConsentV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank77 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { AUTHORED_UNKNOWN_CAPABILITIES } from "./qa03b-fixtures";

const sparse = {
  q2_entity: "business",
  q2_has_customers: "yes",
  q2_operational_status: "operating",
} as const;

const byId = new Map(bank77.map((q) => [q.id, q] as const));
const restaurantAnswers: Record<string, string | readonly string[]> = {
  ...AUTHORED_UNKNOWN_CAPABILITIES,
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_other_staff: "yes",
  q2_monetization: "goods",
  q2_delivery: ["onsite"],
  q2_customer_buyer: "b2c",
  q2_customer_reach: "local",
  q2_goal: "explain",
  q2_friction: "conversion",
  q2_presence_digital_base: "reliable_presence",
  q2_hospitality_flow_type: "reservation",
};

function completeRestaurantRoute(): CandidateSessionV9Prototype {
  let session = createCandidateSessionV9Prototype({ sessionId: "early-stop", writerId: "test", now: 2_000 });
  for (let turn = 0; turn < 24 && session.status === "in_progress"; turn++) {
    assert.notEqual(session.extensionConsent, "pending", "known route should finish before extension boundary");
    const id = currentCandidateQuestionIdV9(session);
    assert.ok(id);
    if (id === "q2_sector") {
      const result = submitClassificationV9Prototype(
        session,
        { sector: "food_hospitality", niche: "restaurant" },
        "test",
        2_001 + turn,
      );
      assert.equal(result.ok, true);
      if (!result.ok) throw new Error(result.reason);
      session = result.session;
      continue;
    }
    const question = byId.get(id);
    assert.ok(question, id);
    let value = restaurantAnswers[id];
    if (value === undefined) {
      const neutral = question.options.find((option) => option.kind === "unknown")
        ?? question.options.find((option) => option.kind === "not_applicable");
      assert.ok(neutral, id);
      value = question.type === "multi" ? [neutral.value] : neutral.value;
    }
    const result = submitCandidateAnswerV9Prototype(session, id, value, "test", 2_001 + turn);
    assert.equal(result.ok, true, id);
    if (!result.ok) throw new Error(result.reason);
    session = result.session;
  }
  return session;
}

test("F03 exposes base 24 plus optional 5 with absolute cap 29", () => {
  assert.equal(V9_BASE_INTERACTION_LIMIT, 24);
  assert.equal(V9_EXTENSION_INTERACTION_LIMIT, 5);
  assert.equal(V9_ABSOLUTE_INTERACTION_LIMIT, 29);
  assert.equal(v9ExtensionInteractionsUsed(24), 0);
  assert.equal(v9ExtensionInteractionsUsed(26), 2);
  assert.equal(v9ExtensionInteractionsRemaining(26), 3);
  assert.equal(v9ExtensionInteractionsRemaining(29), 0);
});

test("F03 at 24 requests consent only when critical evidence remains", () => {
  const planned = buildCandidateQuestionPlanV9Prototype(sparse, [], 24, "not_offered");
  assert.equal(planned.visibleInteractionCount, 24);
  assert.equal(planned.plan.nextQuestionId, undefined);
  assert.equal(planned.plan.completion.hardCapReached, false);
  assert.equal(planned.extension.consentRequired, true);
  assert.ok(planned.extension.criticalQuestionIds.length > 0);
});

test("F03 accepted consent exposes only critical extension questions and never exceeds 29", () => {
  const planned = buildCandidateQuestionPlanV9Prototype(sparse, [], 24, "accepted");
  assert.equal(planned.extension.consentRequired, false);
  assert.ok(planned.plan.nextQuestionId);
  assert.ok(planned.plan.selectedQuestionIds.length <= 5);
  assert.ok(planned.plan.selectedQuestionIds.every((id) => planned.extension.criticalQuestionIds.includes(id)));
  assert.ok(planned.plan.routeLength <= 29);

  const capped = buildCandidateQuestionPlanV9Prototype(sparse, [], 29, "accepted");
  assert.equal(capped.plan.nextQuestionId, undefined);
  assert.equal(capped.plan.completion.hardCapReached, true);
  assert.equal(capped.plan.routeLength, 29);
});

test("F03 consent is non-counting and reject/withdraw closes the extension", () => {
  const seed = createCandidateSessionV9Prototype({ sessionId: "budget", writerId: "test", now: 1000 });
  const pending = {
    ...seed,
    interactionCount: 24,
    extensionConsent: "pending" as const,
    extensionOfferedAtInteraction: 24,
    answers: sparse,
    answeredQuestionIds: Object.keys(sparse),
    queue: [],
  };
  const accepted = submitExtensionConsentV9Prototype(pending, "accepted", "test", 1001);
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  assert.equal(accepted.session.interactionCount, 24);
  assert.equal(accepted.session.extensionConsent, "accepted");
  assert.ok(accepted.session.queue.length > 0);

  const withdrawn = submitExtensionConsentV9Prototype(accepted.session, "withdrawn", "test", 1002);
  assert.equal(withdrawn.ok, true);
  if (!withdrawn.ok) return;
  assert.equal(withdrawn.session.interactionCount, 24);
  assert.equal(withdrawn.session.status, "completing");
  assert.equal(withdrawn.session.terminalReason, "extension_declined");

  const rejected = submitExtensionConsentV9Prototype(pending, "rejected", "test", 1003);
  assert.equal(rejected.ok, true);
  if (!rejected.ok) return;
  assert.equal(rejected.session.interactionCount, 24);
  assert.equal(rejected.session.status, "completing");
  assert.equal(rejected.session.terminalReason, "extension_declined");
});


test("F03 stops before 24 when evidence is already sufficient and does not offer a fake extension at the boundary", () => {
  const completed = completeRestaurantRoute();
  assert.equal(completed.status, "completing");
  assert.ok(completed.interactionCount < 24);
  const classificationEvents = completed.replayTranscript.flatMap((event) =>
    event.kind === "classification" ? [event.classification] : []);
  const atBoundary = buildCandidateQuestionPlanV9Prototype(
    completed.answers,
    classificationEvents,
    24,
    "not_offered",
  );
  assert.equal(atBoundary.extension.consentRequired, false);
  assert.equal(atBoundary.plan.nextQuestionId, undefined);
  assert.equal(atBoundary.plan.completion.ready, true);
});
