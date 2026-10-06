import assert from "node:assert/strict";
import test from "node:test";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { HINT_MAX_LENGTH, validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2, getQuestionBank } from "../../../app/features/diagnostic/qbv2-engine";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import { REVIEWED_CONTEXT_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-context";
import { REVIEWED_FOUNDATION_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-foundation";

const ids = ["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers", "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_sector", "q2_customer_reach", "q2_customer_buyer", "q2_process_systemization", "q2_capacity_signal"] as const;
const question = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((item) => item.id === id)!;
const answer = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);

test("reviewed candidate composes exactly questions 01–09, 14–16 and 17–18 and remains unregistered", () => {
  assert.deepEqual(REVIEWED_FOUNDATION_QUESTIONS_V2.map(({ id }) => id), ids.slice(0, 5));
  assert.deepEqual(REVIEWED_CONTEXT_QUESTIONS_V2.map(({ id }) => id), ids.slice(5, 9));
  assert.deepEqual(candidate.slice(9).map(({ id }) => id), ids.slice(9));
  assert.deepEqual(candidate.map(({ id }) => id), ids);
  assert.equal(new Set(candidate.map(({ id }) => id)).size, 14);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  assert.equal(question("q2_demand_trend").hint!.length, 139);
  assert.equal(question("q2_demand_trend").hint!.length < HINT_MAX_LENGTH, true);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.notEqual(candidate, QUESTION_BANK_V2);
  assert.notEqual(getQuestionBank(2), candidate);
});

test("reviewed semantic versions are pinned and migrated definitions advance their legacy versions", () => {
  assert.deepEqual(Object.fromEntries(candidate.map(({ id, version }) => [id, version])), {
    q2_entity: 1, q2_other_staff: 1, q2_monetization: 2, q2_delivery: 2, q2_has_customers: 1,
    q2_regularity: 2, q2_demand_trend: 2, q2_goal: 2, q2_friction: 2,
    q2_sector: 2, q2_customer_reach: 2, q2_customer_buyer: 2,
    q2_process_systemization: 2, q2_capacity_signal: 2,
  });
  const signature = (item: QuestionDefinitionV2) => JSON.stringify({ prompt: item.prompt, hint: item.hint, type: item.type, options: item.options.map(({ value, label, kind, exclusive, produces }) => ({ value, label, kind, exclusive, produces })) });
  for (const id of [...ids.slice(5, 9), ...ids.slice(9)]) {
    const reviewed = question(id);
    const legacy = question(id, QUESTION_BANK_V2);
    assert.notEqual(signature(reviewed), signature(legacy), `${id} changed materially`);
    assert.ok(reviewed.version > legacy.version, `${id} version must advance over legacy`);
  }
});

test("q2_regularity is conditional core context and preserves all four reviewed distinctions", () => {
  const prelaunch = answer({ q2_has_customers: "no" });
  assert.equal(prelaunch.context.activity.value, "prelaunch");
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_regularity"));
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_demand_trend"));

  const activePlan = buildQuestionPlan({ answers: { q2_has_customers: "yes" }, bank: candidate });
  assert.ok(activePlan.trace.some((entry) => entry.questionId === "q2_regularity" && entry.selected && entry.required));
  assert.equal(question("q2_regularity").routingRole, "core");

  for (const [value, expectedStage] of [["occasional", "starting"], ["irregular_active", "starting"], ["regular", "operating"]] as const) {
    const result = answer({ q2_has_customers: "yes", q2_regularity: value });
    assert.deepEqual(result.context.operatingRegularity, { status: "resolved", value, source: "signal" });
    assert.equal(result.trace.operatingRegularity.status, "resolved");
    assert.equal(result.trace.operatingRegularity.value, value);
    if (expectedStage === "operating") {
      assert.equal(result.context.growthStage.status, "unresolved", "without trend, precise growth stage remains unresolved");
    } else assert.equal(result.context.growthStage.value, expectedStage);
    assert.equal(result.eligibleQuestionIds.includes("q2_demand_trend"), value === "regular");
  }
  assert.notEqual(answer({ q2_has_customers: "yes", q2_regularity: "irregular_active" }).context.operatingRegularity.value, "regular");
});

test("regular q2_demand_trend is adaptive, eligible but never required just by its role", () => {
  const answers: AnswersV2 = { q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "be_found" };
  const state = answer(answers);
  assert.ok(state.eligibleQuestionIds.includes("q2_demand_trend"));
  const plan = buildQuestionPlan({ answers, bank: candidate });
  const trace = plan.trace.find((entry) => entry.questionId === "q2_demand_trend");
  assert.equal(question("q2_demand_trend").routingRole, "adaptive");
  assert.equal(trace?.required, false);
});

test("regularity unknown differs from not asked and cannot imply starting maturity", () => {
  const notAsked = answer({ q2_has_customers: "yes" });
  const unknown = answer({ q2_has_customers: "yes", q2_regularity: "unknown" });
  assert.equal(notAsked.context.operatingRegularity.status, "unresolved");
  assert.equal(notAsked.context.operatingRegularity.reason, "not_asked");
  assert.equal(unknown.context.operatingRegularity.status, "unresolved");
  assert.equal(unknown.context.operatingRegularity.reason, "declared_unknown");
  assert.equal(notAsked.context.growthStage.value, "starting");
  assert.deepEqual(unknown.context.growthStage, { status: "unresolved", reason: "declared_unknown", candidates: ["starting", "operating", "growing", "scaling"] });
  assert.ok(!unknown.eligibleQuestionIds.includes("q2_demand_trend"));
  const afterAnswer = buildQuestionPlan({ answers: { q2_has_customers: "yes", q2_regularity: "unknown" }, bank: candidate });
  assert.ok(!afterAnswer.trace.some((entry) => entry.questionId === "q2_regularity" && entry.selected));
});

test("reviewed flat is observed, explicit trend unknown is not flat, and capacity growth remains usable", () => {
  const flat = answer({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" });
  assert.deepEqual(flat.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
  assert.ok(flat.trace.growthStage.status === "resolved" && flat.trace.growthStage.supportingSignals.includes("demandTrend=flat_observed"));

  const unanswered = answer({ q2_has_customers: "yes", q2_regularity: "regular" });
  const unknown = answer({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "unknown" });
  assert.deepEqual(unanswered.context.growthStage, { status: "unresolved", reason: "insufficient_evidence", candidates: ["operating", "growing"] });
  assert.deepEqual(unknown.context.growthStage, { status: "unresolved", reason: "declared_unknown", candidates: ["operating", "growing"] });
  assert.ok(unknown.trace.growthStage.status === "unresolved" && unknown.trace.growthStage.supportingSignals?.includes("demandTrendUnknown"));
  assert.ok(unknown.trace.growthStage.status === "unresolved" && !unknown.trace.growthStage.supportingSignals?.some((signal) => signal.includes("flat")));
  const unknownTrendPlan = buildQuestionPlan({ answers: { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "unknown" }, bank: candidate });
  assert.ok(!unknownTrendPlan.trace.some((entry) => entry.questionId === "q2_demand_trend" && entry.selected));

  const independentExpansion = resolveDiagnosticContext({
    hasRealCustomers: { value: true, provenance: "explicit_declaration" },
    operatingRegularity: { value: "regular", provenance: "observed_fact" },
    demandTrendUnknown: { value: true, provenance: "explicit_declaration" },
    capacityExpansion: { value: true, provenance: "observed_fact" },
  });
  assert.deepEqual(independentExpansion.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
  const independentNoExpansion = resolveDiagnosticContext({
    hasRealCustomers: { value: true, provenance: "explicit_declaration" },
    operatingRegularity: { value: "regular", provenance: "observed_fact" },
    demandTrendUnknown: { value: true, provenance: "explicit_declaration" },
    capacityPressure: { value: false, provenance: "observed_fact" },
    capacityExpansion: { value: false, provenance: "observed_fact" },
  });
  assert.equal(independentNoExpansion.context.growthStage.status, "unresolved");
  assert.equal(independentNoExpansion.context.growthStage.reason, "declared_unknown");

  const decreasing = answer({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "decreasing" });
  assert.deepEqual(decreasing.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
});

test("reviewed goal resolves primaryGoal as user-declared context without producing capability evidence", () => {
  for (const goal of ["be_found", "opportunities", "explain", "trust", "stop_losing", "organize", "automate", "measure"] as const) {
    const state = answer({ q2_goal: goal });
    assert.deepEqual(state.context.primaryGoal, { status: "resolved", value: goal, source: "signal" }, goal);
    assert.deepEqual(state.trace.primaryGoal, { status: "resolved", field: "primaryGoal", value: goal, supportingSignals: ["declaredGoal"], resolutionReason: "objetivo declarado" }, goal);
    assert.ok(!state.eligibleQuestionIds.includes("q2_friction"), goal);
    assert.deepEqual(deriveContextualEvidence({ q2_goal: goal }, candidate), [], goal);
    assert.equal(question("q2_goal").scoringReadiness, undefined, goal);
    const option = question("q2_goal").options.find(({ value }) => value === goal)!;
    assert.deepEqual(option.produces, [{ kind: "goal", value: goal, provenance: "explicit_declaration" }], goal);
  }
  const measure = answer({ q2_goal: "measure" });
  assert.equal(measure.context.primaryGoal.status, "resolved");
  assert.equal(measure.context.primaryGoal.value, "measure");
  assert.deepEqual(deriveContextualEvidence({ q2_goal: "measure" }, candidate), []);
  assert.equal(question("q2_goal").scoringReadiness, undefined);
  const measureRouting = answer({ q2_has_customers: "yes", q2_goal: "measure" });
  const measurePlan = buildQuestionPlan({ answers: { q2_goal: "measure" }, bank: candidate });
  assert.deepEqual(measurePlan.context.primaryGoal, measureRouting.context.primaryGoal, "planner resolves the same primaryGoal routing context");
  assert.ok(!measurePlan.trace.some((entry) => entry.questionId === "q2_goal" && entry.selected), "an answered goal is not asked again");
  const other = answer({ q2_goal: "other" });
  assert.equal(other.context.primaryGoal.status, "unresolved");
  assert.equal(other.context.primaryGoal.reason, "insufficient_evidence");
  assert.ok(other.trace.primaryGoal.status === "unresolved" && other.trace.primaryGoal.supportingSignals?.includes("declaredGoalOther (la persona eligió otra prioridad)"));
  assert.ok(other.eligibleQuestionIds.includes("q2_friction"));
  const unsure = answer({ q2_goal: "unsure" });
  assert.equal(unsure.context.primaryGoal.reason, "declared_unknown");
  assert.ok(unsure.trace.primaryGoal.status === "unresolved" && unsure.trace.primaryGoal.reason === "declared_unknown");
  assert.ok(unsure.eligibleQuestionIds.includes("q2_friction"));
  const otherPlan = buildQuestionPlan({ answers: { q2_goal: "other" }, bank: candidate });
  const frictionEntry = otherPlan.trace.find((entry) => entry.questionId === "q2_friction");
  const initialPlan = buildQuestionPlan({ answers: {}, bank: candidate });
  assert.equal(question("q2_goal").routingRole, "core");
  assert.equal(initialPlan.trace.find((entry) => entry.questionId === "q2_goal")?.required, true);
  assert.ok(!otherPlan.trace.some((entry) => entry.questionId === "q2_goal" && entry.selected));
  assert.equal(frictionEntry?.required, false);
  const unsurePlan = buildQuestionPlan({ answers: { q2_goal: "unsure" }, bank: candidate });
  assert.ok(!unsurePlan.trace.some((entry) => entry.questionId === "q2_goal" && entry.selected));
  assert.ok(unsurePlan.eligibleQuestionIds.includes("q2_friction"));
});

test("friction resolves as declared routing context and never emits digital evidence", () => {
  for (const value of ["visibility", "trust", "conversion", "follow_up", "operations", "scale"] as const) {
    const state = answer({ q2_goal: "other", q2_friction: value });
    assert.deepEqual(state.context.primaryFriction, { status: "resolved", value, source: "signal" }, value);
    assert.deepEqual(deriveContextualEvidence({ q2_goal: "other", q2_friction: value }, candidate), [], value);
  }
  assert.equal(answer({ q2_goal: "other", q2_friction: "unsure" }).context.primaryFriction.reason, "declared_unknown");
  assert.equal(answer({ q2_goal: "other" }).context.primaryFriction.reason, "not_asked");
  const plan = buildQuestionPlan({ answers: { q2_goal: "unsure", q2_friction: "unsure" }, bank: candidate });
  assert.ok(!plan.trace.some((entry) => entry.questionId === "q2_friction" && entry.selected));
  assert.ok(!plan.trace.some((entry) => entry.questionId === "q2_goal" && entry.selected));
  assert.equal(question("q2_friction").routingRole, "adaptive");
});

test("legacy questions keep versions, answer contracts, routes and representative outcomes", () => {
  const get = (id: string) => question(id, QUESTION_BANK_V2);
  const answerContracts = Object.fromEntries(["q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction"].map((id) => [id, get(id).options.map(({ value, kind, produces }) => ({ value, kind, produces }))]));
  assert.deepEqual(Object.fromEntries(Object.entries(answerContracts).map(([id, options]) => [id, options.map((option) => option.value)])), {
    q2_regularity: ["irregular", "regular"],
    q2_demand_trend: ["increasing", "flat", "decreasing"],
    q2_goal: ["be_found", "opportunities", "explain", "trust", "stop_losing", "organize", "automate", "measure", "unsure"],
    q2_friction: ["visibility", "trust", "conversion", "follow_up", "operations", "scale"],
  });
  assert.deepEqual(Object.fromEntries(["q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction"].map((id) => [id, get(id).version])), { q2_regularity: 1, q2_demand_trend: 1, q2_goal: 1, q2_friction: 1 });
  assert.deepEqual(Object.fromEntries(["q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction"].map((id) => [id, get(id).routingRole])), { q2_regularity: undefined, q2_demand_trend: undefined, q2_goal: undefined, q2_friction: undefined });
  assert.deepEqual(get("q2_regularity").appliesWhen, { op: "eq", ref: { question: "q2_has_customers" }, value: "yes" });
  assert.deepEqual(get("q2_demand_trend").appliesWhen, { op: "eq", ref: { question: "q2_regularity" }, value: "regular" });
  assert.equal(get("q2_goal").appliesWhen, undefined);
  assert.equal(get("q2_friction").appliesWhen, undefined);
  assert.equal(JSON.stringify(answerContracts.q2_regularity), JSON.stringify([
    { value: "irregular", produces: [{ kind: "operatingRegularity", value: "irregular", provenance: "observed_fact" }] },
    { value: "regular", produces: [{ kind: "operatingRegularity", value: "regular", provenance: "observed_fact" }] },
  ]));
  assert.equal(JSON.stringify(answerContracts.q2_demand_trend), JSON.stringify([
    { value: "increasing", produces: [{ kind: "demandTrend", value: "increasing_observed", provenance: "observed_fact" }] },
    { value: "flat", produces: [{ kind: "demandTrend", value: "flat_or_unknown", provenance: "observed_fact" }] },
    { value: "decreasing", produces: [{ kind: "demandTrend", value: "decreasing_observed", provenance: "observed_fact" }] },
  ]));
  const productionContract = (id: string) => get(id).options.map(({ value, produces }) => ({ value, produces }));
  assert.deepEqual(productionContract("q2_goal"), [
    { value: "be_found", produces: [{ kind: "goal", value: "be_found", provenance: "explicit_declaration" }] },
    { value: "opportunities", produces: [{ kind: "goal", value: "opportunities", provenance: "explicit_declaration" }] },
    { value: "explain", produces: [{ kind: "goal", value: "explain", provenance: "explicit_declaration" }] },
    { value: "trust", produces: [{ kind: "goal", value: "trust", provenance: "explicit_declaration" }] },
    { value: "stop_losing", produces: [{ kind: "goal", value: "stop_losing", provenance: "explicit_declaration" }] },
    { value: "organize", produces: [{ kind: "goal", value: "organize", provenance: "explicit_declaration" }] },
    { value: "automate", produces: [{ kind: "goal", value: "automate", provenance: "explicit_declaration" }] },
    { value: "measure", produces: [{ kind: "goal", value: "measure", provenance: "explicit_declaration" }] },
    { value: "unsure", produces: [{ kind: "goalUnknown", value: true, provenance: "explicit_declaration" }] },
  ]);
  assert.deepEqual(productionContract("q2_friction"), [
    ...(["visibility", "trust", "conversion", "follow_up", "operations", "scale"] as const).map((value) => ({ value, produces: [{ kind: "friction", value, provenance: "explicit_declaration" }] })),
  ]);

  const legacy = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "measure", q2_friction: "trust" }, QUESTION_BANK_V2);
  assert.deepEqual(legacy.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
  assert.deepEqual(legacy.context.primaryGoal, { status: "resolved", value: "measure", source: "signal" });
  assert.deepEqual(legacy.context.primaryFriction, { status: "resolved", value: "trust", source: "signal" });
  assert.equal(QUESTION_BANK_V2.length, 85);
});
