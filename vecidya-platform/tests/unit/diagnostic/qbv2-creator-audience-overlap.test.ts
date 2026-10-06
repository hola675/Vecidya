import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const creator = "q2_creator_audience_ownership";
const retail = "q2_retail_customer_capture";
const ecommerceDiscovery = "q2_ecommerce_product_discovery";
const byId = (id: string) => candidate.find((question) => question.id === id)!;
const active = (answers: Partial<AnswersV2> = {}): AnswersV2 => ({
  q2_entity: "business",
  q2_has_customers: "yes",
  q2_regularity: "regular",
  q2_goal: "stop_losing",
  q2_friction: "follow_up",
  q2_customer_buyer: "b2c",
  ...answers,
});

test("R3N creator and retail questions can coexist without proving disjoint populations", () => {
  const creatorOnly = resolveEligibleQuestionsV2(active({
    q2_monetization: "audience",
    q2_delivery: ["other"],
  }), candidate);
  assert.ok(creatorOnly.eligibleQuestionIds.includes(creator));
  assert.ok(!creatorOnly.eligibleQuestionIds.includes(retail));

  const retailOnly = resolveEligibleQuestionsV2(active({
    q2_monetization: "goods",
    q2_delivery: ["retail"],
  }), candidate);
  assert.ok(retailOnly.eligibleQuestionIds.includes(retail));
  assert.ok(!retailOnly.eligibleQuestionIds.includes(creator));

  const hybrid = resolveEligibleQuestionsV2(active({
    q2_monetization: "audience",
    q2_delivery: ["retail", "online_checkout"],
  }), candidate);
  assert.deepEqual(hybrid.context.businessModel, { status: "resolved", value: "creator_audience", source: "signal" });
  assert.ok(hybrid.context.archetypeComponents.includes("retail"));
  assert.ok(hybrid.eligibleQuestionIds.includes(creator));
  assert.ok(hybrid.eligibleQuestionIds.includes(retail));
});

test("R3N creator and ecommerce questions coexist on a valid creator/ecommerce hybrid", () => {
  const hybrid = resolveEligibleQuestionsV2(active({
    q2_monetization: "audience",
    q2_delivery: ["online_checkout"],
  }), candidate);
  assert.deepEqual(hybrid.context.businessModel, { status: "resolved", value: "creator_audience", source: "signal" });
  assert.ok(hybrid.context.archetypeComponents.includes("ecommerce"));
  assert.ok(hybrid.eligibleQuestionIds.includes(creator));
  assert.ok(hybrid.eligibleQuestionIds.includes(ecommerceDiscovery));
  assert.ok(!hybrid.eligibleQuestionIds.includes(retail));
});

test("R3N keeps creator pending and prevents a shared purchaser contact fact from double-counting", () => {
  const creatorQuestion = byId(creator);
  const retailQuestion = byId(retail);
  assert.equal(creatorQuestion.version, 2);
  assert.equal(creatorQuestion.evidenceMigration, "pending");
  assert.equal(creatorQuestion.evidenceV3, undefined);
  assert.ok(creatorQuestion.options.every(({ produces }) => !produces?.length));
  assert.equal(retailQuestion.evidenceMigration, "migrated");
  assert.match(creatorQuestion.prompt, /parte de tu audiencia/);
  assert.match(retailQuestion.prompt, /ese cliente/);

  const sharedContactAnswers = {
    ...active({ q2_monetization: "audience", q2_delivery: ["retail", "online_checkout"] }),
    [creator]: "direct_consistent",
    [retail]: "consistent",
  } as AnswersV2;
  assert.deepEqual(
    resolveEligibleQuestionsV2(sharedContactAnswers, candidate).context,
    resolveEligibleQuestionsV2({ ...sharedContactAnswers, [creator]: "direct_consistent" }, candidate).context,
    "a creator answer does not feed back into context as a second observation",
  );
  const evidence = deriveContextualEvidence(sharedContactAnswers, candidate);
  assert.deepEqual(evidence.map(({ questionId, dimension, directness, state }) => [questionId, dimension, directness, state]), [
    [retail, "relationship_recurrence", "direct", "established"],
  ]);
  assert.deepEqual(evidence, deriveContextualEvidence({ [retail]: "consistent" }, candidate));
  assert.equal(evidence.length, 1);

  const retailOnlyScore = scoreContextualDimensions({
    answers: {}, context: resolveEligibleQuestionsV2(sharedContactAnswers, candidate).context,
    evidence, bank: candidate,
  }).dimensions.find(({ id }) => id === "relationship_recurrence")!.score;
  assert.equal(retailOnlyScore, 75);
});

test("R3N creator answer remains zero V3 evidence while migrated retail evidence is unchanged", () => {
  for (const answer of ["direct_consistent", "direct_limited", "platform_only", "not_applicable", "unknown"]) {
    assert.deepEqual(deriveContextualEvidence({ [creator]: answer }, candidate), [], answer);
  }
  assert.deepEqual(deriveContextualEvidence({ [retail]: "consistent" }, candidate).map(({ questionId, state }) => [questionId, state]), [
    [retail, "established"],
  ]);

  const oldCreator = legacy.find(({ id }) => id === creator)!;
  const oldRetail = legacy.find(({ id }) => id === retail)!;
  assert.ok(deriveContextualEvidence({ [creator]: "yes_direct" }, legacy).some(({ questionId }) => questionId === creator));
  assert.ok(deriveContextualEvidence({ [retail]: "yes" }, legacy).some(({ questionId }) => questionId === retail));
  assert.equal(oldCreator.version, 1);
  assert.equal(oldRetail.version, 1);
});

test("R3N freezes candidate composition, wording, options, routing, runtime and legacy scoring", () => {
  const stripEvidence = ({ evidenceMigration: _migration, evidenceV3: _evidence, ...question }: (typeof candidate)[number]) => question;
  assert.equal(candidate.length, 38);
  assert.deepEqual(candidate.map(stripEvidence), frozen.map(stripEvidence));
  assert.equal(legacy.length, 85);
  assert.equal(deriveContextualEvidence({ [retail]: "yes" }, legacy).length, 1);
  assert.equal(deriveContextualEvidence({ [creator]: "yes_direct" }, legacy).length, 1);
});
