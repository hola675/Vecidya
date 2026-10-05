import assert from "node:assert/strict";
import test from "node:test";
import { resolveEligibleQuestionsV2, getQuestionBank } from "../../../app/features/diagnostic/qbv2-engine";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { REVIEWED_FOUNDATION_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-foundation";
import { HINT_MAX_LENGTH, renderQuestionV2, validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import { validateAnswerV3 } from "../../../app/features/diagnostic/qbv2-session";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";

const question = (id: string) => candidate.find((item) => item.id === id)!;
const answer = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const resolved = <T extends string>(value: { status: string; value?: string }): value is { status: "resolved"; value: T } => value.status === "resolved";

test("R2A candidate is an isolated, valid five-question foundation slice", () => {
  assert.deepEqual(candidate.map(({ id }) => id), ["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers"]);
  assert.ok(candidate.every((item) => item.routingRole === "core"));
  assert.ok(candidate.every((item) => item.scoringReadiness === undefined));
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  assert.equal(HINT_MAX_LENGTH, 140);
  for (const id of ["q2_monetization", "q2_has_customers"]) assert.ok(question(id).hint!.length <= 140, id);
  assert.notEqual(candidate, QUESTION_BANK_V2);
  assert.notEqual(getQuestionBank(2), candidate);
  const initialPlan = buildQuestionPlan({ answers: {}, bank: candidate });
  assert.deepEqual(new Set(initialPlan.selectedQuestionIds), new Set(["q2_entity", "q2_delivery", "q2_has_customers"]));
  assert.ok(!initialPlan.eligibleQuestionIds.includes("q2_monetization"));
  assert.ok(initialPlan.trace.some((entry) => entry.questionId === "q2_has_customers" && entry.selected && entry.required));
  const individualPlan = buildQuestionPlan({ answers: { q2_entity: "individual" }, bank: candidate });
  assert.ok(individualPlan.selectedQuestionIds.includes("q2_other_staff"), "the existing planner evaluates the candidate's declared prerequisite gate");
});

test("reviewed classification maps mechanisms into existing domain signals only", () => {
  const expected: Record<string, string> = {
    services: "services", goods: "products", commission: "services", audience: "creator_audience",
    recurring: "membership", mission: "nonprofit",
  };
  for (const [option, model] of Object.entries(expected)) {
    const result = answer({ q2_has_customers: "yes", q2_monetization: option });
    assert.deepEqual(result.context.businessModel, { status: "resolved", value: model, source: "signal" }, option);
  }
  const other = answer({ q2_has_customers: "yes", q2_monetization: "other" }).context.businessModel;
  const unsure = answer({ q2_has_customers: "yes", q2_monetization: "unsure" }).context.businessModel;
  assert.equal(other.status, "unresolved");
  assert.equal(unsure.status, "unresolved");
  assert.equal(unsure.reason, "declared_unknown");
  assert.equal(question("q2_monetization").options.some(({ value }) => value === "licensed"), false);
  assert.equal(question("q2_monetization").options.find(({ value }) => value === "unsure")?.kind, "unknown");
  const prelaunch = answer({ q2_has_customers: "no" });
  const rendered = renderQuestionV2(question("q2_monetization"), { context: prelaunch.context });
  assert.equal(rendered.prompt, "¿De dónde vendrá principalmente el dinero de tu actividad?");
});

test("activity is a declarative prerequisite and deterministically selects active/prelaunch monetization copy", () => {
  const empty = resolveEligibleQuestionsV2({}, candidate);
  assert.ok(!empty.eligibleQuestionIds.includes("q2_monetization"));
  assert.ok(empty.eligibleQuestionIds.includes("q2_has_customers"));
  const pendingPlan = buildQuestionPlan({ answers: {}, bank: candidate });
  assert.ok(!pendingPlan.eligibleQuestionIds.includes("q2_monetization"));
  assert.ok(pendingPlan.trace.some((entry) => entry.questionId === "q2_has_customers" && entry.selected && entry.required));

  for (const [customerAnswer, expectedPrompt] of [
    ["yes", "¿De dónde viene principalmente el dinero de tu actividad?"],
    ["no", "¿De dónde vendrá principalmente el dinero de tu actividad?"],
  ] as const) {
    const state = resolveEligibleQuestionsV2({ q2_has_customers: customerAnswer }, candidate);
    assert.ok(state.eligibleQuestionIds.includes("q2_monetization"), customerAnswer);
    const rendered = renderQuestionV2(question("q2_monetization"), { context: state.context });
    assert.equal(rendered.prompt, expectedPrompt, customerAnswer);
  }

  for (const classification of ["other", "unsure"] as const) {
    const plan = buildQuestionPlan({ answers: { q2_has_customers: "yes", q2_monetization: classification }, bank: candidate });
    assert.ok(!plan.eligibleQuestionIds.includes("q2_monetization"), classification);
    assert.notEqual(plan.nextQuestionId, "q2_monetization", classification);
    assert.equal(plan.context.businessModel.status, "unresolved", classification);
  }
});

test("reviewed delivery modes map explicitly and resolve all distinct components deterministically", () => {
  const modeToArchetype: Record<string, string> = {
    physical_location: "local", appointments: "appointments", travels: "local_service",
    online_checkout: "ecommerce", retail: "retail", onsite: "hospitality",
  };
  for (const [mode, archetype] of Object.entries(modeToArchetype)) {
    const result = answer({ q2_delivery: [mode] });
    assert.equal(result.context.archetype.value, archetype, mode);
    assert.deepEqual(result.context.archetypeComponents, [archetype], mode);
  }
  assert.equal(answer({ q2_delivery: ["appointments"] }).context.archetype.value, "appointments", "appointments alone is not professional");
  assert.equal(answer({ q2_delivery: ["travels"] }).context.archetype.value, "local_service");
  assert.equal(answer({ q2_delivery: ["online_checkout"] }).context.archetype.value, "ecommerce");
  const two = answer({ q2_delivery: ["physical_location", "appointments"] }).context;
  assert.equal(two.archetype.value, "hybrid");
  assert.deepEqual(two.archetypeComponents, ["appointments", "local"]);
  const threeAnswers = ["appointments", "online_checkout", "physical_location"];
  const three = answer({ q2_delivery: threeAnswers }).context;
  assert.equal(three.archetype.value, "hybrid");
  assert.deepEqual(three.archetypeComponents, ["appointments", "ecommerce", "local"]);
  assert.equal(new Set(three.archetypeComponents).size, 3);
  assert.deepEqual(answer({ q2_delivery: [...threeAnswers].reverse() }).context.archetypeComponents, three.archetypeComponents);
  assert.deepEqual(answer({ q2_delivery: ["retail", "online_checkout"] }).context.archetypeComponents, ["ecommerce", "retail"]);
});

test("other and unsure delivery dispositions are exclusive and never invent an archetype", () => {
  const delivery = question("q2_delivery");
  assert.deepEqual(validateAnswerV3(delivery, ["other", "physical_location"]), { ok: false, error: "exclusive_conflict" });
  assert.deepEqual(validateAnswerV3(delivery, ["unsure", "appointments"]), { ok: false, error: "exclusive_conflict" });
  assert.deepEqual(validateAnswerV3(delivery, ["other", "unsure"]), { ok: false, error: "exclusive_conflict" });
  assert.deepEqual(validateAnswerV3(delivery, ["appointments", "appointments"]), { ok: false, error: "duplicate_option" });
  for (const [option, reason] of [["other", "insufficient_evidence"], ["unsure", "declared_unknown"]] as const) {
    const context = answer({ q2_delivery: [option] }).context;
    assert.equal(context.archetype.status, "unresolved");
    assert.equal(context.archetype.reason, reason);
    assert.deepEqual(context.archetypeComponents, []);
  }
});

test("candidate context matrix preserves uncertainty and separates entity, audience, buyer, and activity", () => {
  const cases: readonly [string, AnswersV2, string | undefined, readonly string[], string | undefined][] = [
    ["business services physical customers", { q2_entity: "business", q2_monetization: "services", q2_delivery: ["physical_location"], q2_has_customers: "yes" }, "services", ["local"], "active"],
    ["individual appointments", { q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_has_customers: "yes" }, "services", ["appointments"], "active"],
    ["travel service", { q2_entity: "business", q2_monetization: "services", q2_delivery: ["travels"], q2_has_customers: "yes" }, "services", ["local_service"], "active"],
    ["retail and checkout", { q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_has_customers: "yes" }, "products", ["ecommerce", "retail"], "active"],
    ["organization mission other delivery", { q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_has_customers: "yes" }, "nonprofit", [], "active"],
    ["project unsure prelaunch", { q2_entity: "project", q2_monetization: "unsure", q2_delivery: ["unsure"], q2_has_customers: "no" }, undefined, [], "prelaunch"],
  ];
  for (const [name, answers, model, components, activity] of cases) {
    const result = answer(answers);
    if (model) assert.equal(result.context.businessModel.value, model, name);
    else assert.equal(result.context.businessModel.status, "unresolved", name);
    if (components.length) assert.deepEqual(result.context.archetypeComponents, components, name);
    else assert.equal(result.context.archetype.status, "unresolved", name);
    assert.equal(resolved<string>(result.context.activity) ? result.context.activity.value : undefined, activity, name);
  }
  assert.equal(answer({ q2_has_customers: "yes" }).context.growthStage.value, "starting", "active is resolved without demand or capacity questions");
  assert.equal(answer({ q2_has_customers: "no" }).context.growthStage.value, "idea", "prelaunch activity remains a separate fact from growth-stage refinement");
  const individual = answer({ q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_has_customers: "yes" }).context;
  assert.notEqual(individual.archetype.value, "professional");
  assert.equal(individual.customerModel.buyer.status, "unresolved", "delivery does not infer B2B");
  const audience = answer({ q2_has_customers: "yes", q2_monetization: "audience", q2_delivery: ["other"] }).context;
  assert.equal(audience.audienceMonetization.value, "own_audience_monetization");
  assert.equal(audience.archetype.status, "unresolved", "audience income does not create creator delivery archetype");
  assert.equal(answer({ q2_entity: "individual", q2_other_staff: "yes" }).context.entity.value, "business", "existing individual plus staff domain rule remains intact");
});

test("reviewed other-staff answer preserves the existing entity boundary without inferring other domains", () => {
  const entity = (answers: AnswersV2) => answer(answers).context;
  assert.equal(entity({ q2_entity: "individual", q2_other_staff: "no" }).entity.value, "individual");
  assert.equal(entity({ q2_entity: "individual", q2_other_staff: "yes" }).entity.value, "business");
  assert.equal(entity({ q2_entity: "business", q2_other_staff: "no" }).entity.value, "business");
  assert.equal(entity({ q2_entity: "business", q2_other_staff: "yes" }).entity.value, "business");

  const withStaff = entity({ q2_entity: "individual", q2_other_staff: "yes" });
  assert.equal(withStaff.archetype.status, "unresolved", "staff does not infer professional or delivery archetype");
  assert.equal(withStaff.businessModel.status, "unresolved", "staff does not infer monetization or license fit");
  assert.equal(withStaff.growthStage.status, "unresolved", "staff does not infer operational maturity");
  assert.equal(withStaff.activity.status, "unresolved");
  assert.deepEqual(deriveContextualEvidence({ q2_entity: "individual", q2_other_staff: "yes" }, candidate), [], "staff answer contributes no digital-readiness evidence");
  assert.ok(question("q2_monetization").options.every(({ value }) => value !== "licensed"));
});

test("legacy QUESTION_BANK_V2 remains frozen across the candidate migration", () => {
  assert.equal(QUESTION_BANK_V2.length, 85);
  const legacyMonetization = QUESTION_BANK_V2.find(({ id }) => id === "q2_monetization")!;
  const legacyDelivery = QUESTION_BANK_V2.find(({ id }) => id === "q2_delivery")!;
  assert.deepEqual(legacyMonetization.options.map(({ value }) => value), ["time_or_project", "goods", "licensed", "commission", "audience", "recurring", "mission"]);
  assert.equal(legacyDelivery.type, "single");
  assert.deepEqual(legacyDelivery.options.map(({ value }) => value), ["fixed_no_inventory", "scheduled", "travels", "solo_practice", "online_checkout", "fixed_with_inventory", "onsite", "b2b_pipeline", "audience_content"]);
  const legacyDeliveryMap = Object.fromEntries(legacyDelivery.options.map((option) => [option.value, option.produces?.find((production) => production.kind === "deliveryMode")]));
  assert.deepEqual(Object.fromEntries(Object.entries(legacyDeliveryMap).map(([id, production]) => [id, production && "value" in production ? production.value : undefined])), {
    fixed_no_inventory: "fixed_location_no_inventory", scheduled: "scheduled_time_blocks", travels: "travels_to_customer",
    solo_practice: "specialized_individual_practice", online_checkout: "online_checkout", fixed_with_inventory: "fixed_location_with_inventory",
    onsite: "onsite_consumption", b2b_pipeline: "b2b_sales_pipeline", audience_content: "own_audience_content",
  });
  assert.deepEqual(["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers"].map((id) => QUESTION_BANK_V2.find((item) => item.id === id)?.routingRole), [undefined, undefined, undefined, undefined, undefined]);
  const legacyActive = resolveEligibleQuestionsV2({ q2_entity: "business", q2_monetization: "time_or_project", q2_delivery: "online_checkout", q2_has_customers: "yes" }, QUESTION_BANK_V2).context;
  assert.equal(legacyActive.businessModel.value, "services");
  assert.equal(legacyActive.archetype.value, "ecommerce");
  assert.equal(legacyActive.growthStage.value, "starting");
  const legacyNonprofit = resolveEligibleQuestionsV2({ q2_entity: "organization", q2_monetization: "mission", q2_delivery: "onsite", q2_has_customers: "no" }, QUESTION_BANK_V2).context;
  assert.equal(legacyNonprofit.businessModel.value, "nonprofit");
  assert.equal(legacyNonprofit.archetype.value, "hospitality");
  assert.equal(legacyNonprofit.growthStage.value, "idea");
  assert.notEqual(getQuestionBank(2), candidate);
});

test("candidate definitions retain the shared architecture without registering a second engine or bank", () => {
  assert.ok(candidate.every((item): item is QuestionDefinitionV2 => typeof item.id === "string"));
  assert.equal(getQuestionBank(1), undefined);
});
