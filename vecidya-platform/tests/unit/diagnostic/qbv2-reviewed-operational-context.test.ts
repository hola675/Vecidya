import assert from "node:assert/strict";
import test from "node:test";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2 as operational } from "../../../app/features/diagnostic/qbv2-reviewed-operational-context";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { CONTEXT_FIELD_REFS, contextEquals, contextUnresolved, evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { signalProductionContextFields, type SignalProduction } from "../../../app/features/diagnostic/qbv2-signals";
import { validateAnswerV3 } from "../../../app/features/diagnostic/qbv2-session";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const ids = ["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers", "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_appointments_noshow", "q2_ecommerce_traffic_sources", "q2_b2b_pipeline", "q2_sector", "q2_customer_reach", "q2_customer_buyer", "q2_process_systemization", "q2_capacity_signal"] as const;
const question = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((item) => item.id === id)!;
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);

test("R2D context fields are registered once and readable through the context DSL", () => {
  assert.deepEqual(
    CONTEXT_FIELD_REFS.filter((field) => field === "processConsistency" || field === "capacitySituation"),
    ["processConsistency", "capacitySituation"],
  );

  const processCases: readonly [AnswersV2, readonly [string, string][], boolean][] = [
    [{ q2_has_customers: "yes", q2_process_systemization: "defined" }, [["processConsistency", "defined"]], true],
    [{ q2_has_customers: "yes", q2_process_systemization: "partial" }, [["processConsistency", "defined"]], false],
    [{ q2_has_customers: "yes", q2_process_systemization: "partial" }, [["processConsistency", "partial"]], true],
  ];
  for (const [answers, checks, expected] of processCases) {
    const context = resolve(answers).context;
    for (const [field, value] of checks) assert.equal(evaluateRuleV2(contextEquals(field as "processConsistency", value), answers, context), expected);
  }
  const processUnknown: AnswersV2 = { q2_has_customers: "yes", q2_process_systemization: "unknown" };
  assert.equal(evaluateRuleV2(contextUnresolved("processConsistency"), processUnknown, resolve(processUnknown).context), true);

  const capacityCases: readonly [readonly string[], string][] = [
    [["capacity_pressure"], "pressure"],
    [["capacity_expanded"], "expanded"],
    [["capacity_pressure", "capacity_expanded"], "pressure_and_expanded"],
    [["stable"], "stable"],
  ];
  for (const [selected, expected] of capacityCases) {
    const answers: AnswersV2 = { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: selected };
    assert.equal(evaluateRuleV2(contextEquals("capacitySituation", expected), answers, resolve(answers).context), true);
  }
  const capacityUnknown: AnswersV2 = { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["unknown"] };
  assert.equal(evaluateRuleV2(contextUnresolved("capacitySituation"), capacityUnknown, resolve(capacityUnknown).context), true);
});

test("R2D signal productions resolve only to registered canonical context fields", () => {
  const productions: readonly [SignalProduction, string][] = [
    [{ kind: "processConsistency", value: "defined", provenance: "explicit_declaration" }, "processConsistency"],
    [{ kind: "processConsistencyUnknown", value: true, provenance: "explicit_declaration" }, "processConsistency"],
    [{ kind: "reviewedCapacityPressure", value: true, provenance: "explicit_declaration" }, "capacitySituation"],
    [{ kind: "reviewedCapacityExpansion", value: true, provenance: "explicit_declaration" }, "capacitySituation"],
    [{ kind: "reviewedCapacityUnknown", value: true, provenance: "explicit_declaration" }, "capacitySituation"],
  ];
  for (const [production, expectedField] of productions) {
    const fields = signalProductionContextFields(production);
    assert.deepEqual(fields, [expectedField]);
    for (const field of fields) assert.ok((CONTEXT_FIELD_REFS as readonly string[]).includes(field));
  }
});

test("R2D adds only q17–q18 to the exact isolated candidate and pins versions", () => {
  assert.deepEqual(operational.map(({ id }) => id), ["q2_process_systemization", "q2_capacity_signal"]);
  assert.deepEqual(candidate.slice(0, ids.length).map(({ id }) => id), ids);
  assert.deepEqual(candidate.slice(ids.length).map(({ id }) => id), ["q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow"]);
  assert.equal(candidate.length, 20);
  assert.ok(!candidate.some(({ id }) => ["q2_local_discovery", "q2_ecommerce_product_discovery", "q2_ecommerce_checkout_friction"].includes(id)));
  assert.deepEqual(Object.fromEntries(candidate.map(({ id, version }) => [id, version])), {
    q2_entity: 1, q2_other_staff: 1, q2_monetization: 2, q2_delivery: 2, q2_has_customers: 1,
    q2_regularity: 2, q2_demand_trend: 2, q2_goal: 2, q2_friction: 2,
    q2_appointments_noshow: 2, q2_ecommerce_traffic_sources: 3, q2_b2b_pipeline: 2,
    q2_sector: 2, q2_customer_reach: 2, q2_customer_buyer: 2,
    q2_process_systemization: 2, q2_capacity_signal: 2,
    q2_discovery_reliable_reach: 1, q2_local_presence_consistency: 2, q2_reputation_flow: 3,
  });
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
});

test("q17 keeps reviewed process states separate from legacy systemization and is adaptive", () => {
  const q17 = question("q2_process_systemization");
  assert.equal(q17.type, "single");
  assert.equal(q17.module, "maturity");
  assert.equal(q17.routingRole, "adaptive");
  assert.equal(q17.version, 2);
  assert.deepEqual(q17.appliesWhen, { op: "eq", ref: { question: "q2_has_customers" }, value: "yes" });
  assert.deepEqual(q17.options.map(({ value }) => value), ["defined", "partial", "informal", "unknown"]);
  assert.deepEqual(q17.options.map(({ produces }) => produces ?? []), [
    [{ kind: "processConsistency", value: "defined", provenance: "explicit_declaration" }],
    [{ kind: "processConsistency", value: "partial", provenance: "explicit_declaration" }],
    [{ kind: "processConsistency", value: "informal", provenance: "explicit_declaration" }],
    [{ kind: "processConsistencyUnknown", value: true, provenance: "explicit_declaration" }],
  ]);
  assert.ok(!resolve({ q2_has_customers: "no" }).eligibleQuestionIds.includes("q2_process_systemization"));
  assert.ok(resolve({ q2_has_customers: "yes" }).eligibleQuestionIds.includes("q2_process_systemization"));
  assert.ok(!resolve({}).eligibleQuestionIds.includes("q2_process_systemization"));

  const answers = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" } as const;
  const plan = buildQuestionPlan({ answers, bank: candidate });
  const trace = plan.trace.find((entry) => entry.questionId === "q2_process_systemization");
  assert.ok(trace, "eligible adaptive question is visible to planner trace");
  assert.equal(trace.required, false, "adaptive role alone never makes q17 required");
  assert.equal(q17.scoringReadiness, undefined);
  assert.deepEqual(plan.trace.filter((entry) => entry.selected).map((entry) => entry.questionId), [
    "q2_delivery", "q2_monetization", "q2_customer_buyer", "q2_customer_reach", "q2_sector", "q2_entity", "q2_goal",
    "q2_discovery_reliable_reach", "q2_capacity_signal", "q2_process_systemization",
  ]);
});

test("q17 resolves defined, partial, informal, explicit unknown, not asked, and does not re-ask unknown", () => {
  for (const value of ["defined", "partial", "informal"] as const) {
    const result = resolve({ q2_has_customers: "yes", q2_process_systemization: value });
    assert.deepEqual(result.context.processConsistency, { status: "resolved", value, source: "signal" });
    assert.equal(result.trace.processConsistency.status, "resolved");
    assert.deepEqual(deriveContextualEvidence({ q2_has_customers: "yes", q2_process_systemization: value }, candidate), []);
    assert.equal(result.context.businessModel.status, "unresolved");
    assert.equal(result.context.archetype.status, "unresolved");
  }
  const absent = resolve({ q2_has_customers: "yes" });
  assert.deepEqual(absent.context.processConsistency, { status: "unresolved", reason: "not_asked", candidates: [] });
  assert.equal(absent.trace.processConsistency.reason, "not_asked");
  const unknownAnswers = { q2_has_customers: "yes", q2_process_systemization: "unknown" } as const;
  const unknown = resolve(unknownAnswers);
  assert.deepEqual(unknown.context.processConsistency, { status: "unresolved", reason: "declared_unknown", candidates: [] });
  assert.equal(unknown.trace.processConsistency.reason, "declared_unknown");
  const plan = buildQuestionPlan({ answers: unknownAnswers, bank: candidate });
  assert.ok(!plan.trace.some((entry) => entry.questionId === "q2_process_systemization" && entry.selected), "answered unknown is not asked again");
});

test("q18 is adaptive multi-select with exclusive stable/unknown and independent reviewed capacity producers", () => {
  const q18 = question("q2_capacity_signal");
  assert.equal(q18.type, "multi");
  assert.equal(q18.module, "maturity");
  assert.equal(q18.routingRole, "adaptive");
  assert.equal(q18.version, 2);
  assert.deepEqual(q18.appliesWhen, { op: "eq", ref: { question: "q2_regularity" }, value: "regular" });
  assert.deepEqual(q18.options.map(({ value }) => value), ["capacity_pressure", "capacity_expanded", "stable", "unknown"]);
  assert.deepEqual(q18.options.filter(({ exclusive }) => exclusive).map(({ value }) => value), ["stable", "unknown"]);
  assert.ok((q18.hint?.length ?? Infinity) <= 140);
  assert.ok(!resolve({ q2_has_customers: "yes", q2_regularity: "occasional" }).eligibleQuestionIds.includes("q2_capacity_signal"));
  const regular = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" } as const;
  assert.ok(resolve(regular).eligibleQuestionIds.includes("q2_capacity_signal"));
  const plan = buildQuestionPlan({ answers: regular, bank: candidate });
  const trace = plan.trace.find((entry) => entry.questionId === "q2_capacity_signal");
  assert.ok(trace, "eligible adaptive question is visible to planner trace");
  assert.equal(trace.required, false, "adaptive role alone never makes q18 required");
  assert.equal(q18.scoringReadiness, undefined);
  assert.deepEqual(plan.trace.filter((entry) => entry.selected).map((entry) => entry.questionId), [
    "q2_delivery", "q2_monetization", "q2_customer_buyer", "q2_customer_reach", "q2_sector", "q2_entity", "q2_goal",
    "q2_discovery_reliable_reach", "q2_capacity_signal", "q2_process_systemization",
  ]);

  assert.equal(validateAnswerV3(q18, ["stable", "capacity_pressure"]).ok, false);
  assert.equal(validateAnswerV3(q18, ["unknown", "capacity_expanded"]).ok, false);
  assert.equal(validateAnswerV3(q18, ["capacity_pressure", "capacity_expanded"]).ok, true);
});

test("q18 capacity situation maps pressure, expansion, both, stable, unknown and not asked", () => {
  const cases: readonly [readonly string[] | undefined, string, string][] = [
    [["capacity_pressure"], "pressure", "resolved"],
    [["capacity_expanded"], "expanded", "resolved"],
    [["capacity_pressure", "capacity_expanded"], "pressure_and_expanded", "resolved"],
    [["stable"], "stable", "resolved"],
    [["unknown"], "declared_unknown", "unresolved"],
    [undefined, "not_asked", "unresolved"],
  ];
  for (const [selected, expected, status] of cases) {
    const answers = { q2_has_customers: "yes", q2_regularity: "regular", ...(selected ? { q2_capacity_signal: selected } : {}) };
    const result = resolve(answers);
    if (status === "resolved") assert.deepEqual(result.context.capacitySituation, { status, value: expected, source: "signal" });
    else assert.deepEqual(result.context.capacitySituation, { status, reason: expected, candidates: [] });
    assert.equal(result.trace.capacitySituation.status, status);
    assert.deepEqual(deriveContextualEvidence(answers, candidate), []);
    assert.equal(result.context.businessModel.status, "unresolved");
    assert.equal(result.context.archetype.status, "unresolved");
  }
  const unknownAnswers = { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["unknown"] } as const;
  const plan = buildQuestionPlan({ answers: unknownAnswers, bank: candidate });
  assert.ok(!plan.trace.some((entry) => entry.questionId === "q2_capacity_signal" && entry.selected), "answered unknown is not asked again");
});

test("reviewed process consistency supports scaling only after independent growth evidence", () => {
  const base = { q2_has_customers: "yes", q2_regularity: "regular" } as const;
  const definedAlone = resolve({ ...base, q2_process_systemization: "defined" });
  assert.equal(definedAlone.context.growthStage.status, "unresolved", "a defined process cannot create growth or scaling without growth evidence");
  const flatDefined = resolve({ ...base, q2_demand_trend: "flat", q2_process_systemization: "defined" });
  assert.equal(flatDefined.context.growthStage.value, "operating");
  const flatStable = resolve({ ...base, q2_demand_trend: "flat", q2_capacity_signal: ["stable"] });
  assert.equal(flatStable.context.growthStage.value, "operating");
  const flatExpanded = resolve({ ...base, q2_demand_trend: "flat", q2_capacity_signal: ["capacity_expanded"] });
  assert.equal(flatExpanded.context.growthStage.value, "operating");

  for (const consistency of ["partial", "informal", "unknown"] as const) {
    const answers = { ...base, q2_demand_trend: "increasing", q2_process_systemization: consistency };
    assert.equal(resolve(answers).context.growthStage.value, "growing", consistency);
  }
  assert.equal(resolve({ ...base, q2_demand_trend: "increasing" }).context.growthStage.value, "growing", "unanswered process consistency does not establish scaling");
  assert.equal(resolve({ ...base, q2_demand_trend: "increasing", q2_process_systemization: "defined" }).context.growthStage.value, "scaling");

  for (const capacity of [["capacity_pressure"], ["capacity_expanded"], ["capacity_pressure", "capacity_expanded"]] as const) {
    const alone = resolve({ ...base, q2_capacity_signal: [...capacity] });
    assert.equal(alone.context.growthStage.status, "unresolved", `reviewed capacity ${capacity.join("+")} is not growth evidence`);
    const demandUnknown = resolve({ ...base, q2_demand_trend: "unknown", q2_capacity_signal: [...capacity] });
    assert.deepEqual(demandUnknown.context.growthStage, { status: "unresolved", reason: "declared_unknown", candidates: ["operating", "growing"] });
  }
});

test("legacy q17/q18 contracts and legacy growth signals remain unchanged", () => {
  const legacy17 = question("q2_process_systemization", QUESTION_BANK_V2);
  const legacy18 = question("q2_capacity_signal", QUESTION_BANK_V2);
  assert.equal(legacy17.version, 1);
  assert.equal(legacy17.type, "single");
  assert.deepEqual(legacy17.appliesWhen, { op: "eq", ref: { question: "q2_has_customers" }, value: "yes" });
  assert.deepEqual(legacy17.options.map(({ value }) => value), ["documented_process", "partial", "memory_dependent", "unsure"]);
  assert.deepEqual(legacy17.options.map(({ produces }) => produces ?? []), [
    [{ kind: "systemization", value: true, provenance: "observed_fact" }],
    [],
    [{ kind: "systemization", value: false, provenance: "observed_fact" }],
    [],
  ]);
  assert.equal(legacy18.version, 1);
  assert.equal(legacy18.type, "multi");
  assert.deepEqual(legacy18.appliesWhen, { op: "eq", ref: { question: "q2_regularity" }, value: "regular" });
  assert.deepEqual(legacy18.options.map(({ value }) => value), ["waitlist_growing", "expanded", "stable", "unknown"]);
  assert.deepEqual(legacy18.options.filter(({ exclusive }) => exclusive).map(({ value }) => value), ["stable", "unknown"]);
  assert.deepEqual(legacy18.options.map(({ produces }) => produces ?? []), [
    [{ kind: "capacityPressure", value: true, provenance: "observed_fact" }],
    [{ kind: "capacityExpansion", value: true, provenance: "observed_fact" }],
    [{ kind: "capacityPressure", value: false, provenance: "observed_fact" }, { kind: "capacityExpansion", value: false, provenance: "observed_fact" }],
    [],
  ]);

  const answers = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing", q2_process_systemization: "documented_process", q2_capacity_signal: ["expanded"] } as const;
  const legacy = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  assert.equal(legacy.context.growthStage.value, "scaling");
  assert.deepEqual(legacy.context.processConsistency, { status: "unresolved", reason: "not_asked", candidates: [] });
  assert.deepEqual(legacy.context.capacitySituation, { status: "unresolved", reason: "not_asked", candidates: [] });
  const legacyExpansion = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["expanded"] }, QUESTION_BANK_V2);
  assert.equal(legacyExpansion.context.growthStage.value, "growing");
  const legacyPressure = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["waitlist_growing"] }, QUESTION_BANK_V2);
  assert.equal(legacyPressure.context.growthStage.value, "growing");
  assert.equal(QUESTION_BANK_V2.length, 85);
});
