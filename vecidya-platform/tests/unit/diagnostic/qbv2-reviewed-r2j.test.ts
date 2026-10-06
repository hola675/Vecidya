import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { buildQuestionPlan, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions, REVIEWED_NEW_QUESTION_IDS } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_TRANSVERSAL_QUESTIONS_V2 as reviewed } from "../../../app/features/diagnostic/qbv2-reviewed-transversal";
import { type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const ids = ["q2_operations_handoffs", "q2_operations_information_base", "q2_presence_digital_base", "q2_presence_offer_clarity"];
const followup = "q2_followup_general_process";
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const route = (answers: AnswersV2) => buildQuestionPlan({ answers, bank: candidate });
const established: AnswersV2 = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" };

test("R2J explicit review partitions every actual legacy ID exactly once and isolates all rejected/deferred questions", () => {
  const classified = Object.values(decisions).flat();
  assert.equal(legacy.length, 85);
  assert.equal(classified.length, 85);
  assert.equal(new Set(classified).size, 85);
  assert.deepEqual([...classified].sort(), legacy.map((q) => q.id).sort());
  assert.equal(decisions.KEEP.length, 37);
  assert.equal(decisions.REMOVE.length, 37);
  assert.equal(decisions.DEFER.length, 11);
  assert.deepEqual(candidate.map((q) => q.id).sort(), [...decisions.KEEP, ...REVIEWED_NEW_QUESTION_IDS].sort());
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id), id);
  for (const id of ["q2_operations_bottleneck", "q2_startup_validation_evidence", "q2_startup_demand_signal"]) assert.ok(decisions.REMOVE.some((value) => value === id));
});

test("R2J definitions advance semantic versions, validate copy/contracts and never activate runtime", () => {
  assert.deepEqual(reviewed.map((q) => q.id), [ids[0], followup, ...ids.slice(1)]);
  assert.equal(candidate.length, 38);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  for (const q of reviewed) {
    assert.equal(q.version, 2);
    assert.ok(q.version > legacy.find((l) => l.id === q.id)!.version);
    assert.equal(q.evidenceMigration, "pending");
    assert.equal(q.scoringReadiness, undefined);
    if (q.routingRole === "deepening") assert.equal(q.appliesWhen, undefined, "only explicit material/deepening entry");
    assert.ok(q.options.some((o) => o.kind === "unknown"));
    assert.ok(q.options.some((o) => o.kind === "not_applicable"));
  }
});

test("operational history requires active operation and handoffs additionally require declared other staff", () => {
  const base: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_goal: "organize" };
  for (const activity of ["no", undefined]) {
    const answers = { ...base, q2_has_customers: activity };
    assert.deepEqual(resolve(answers).eligibleQuestionIds.filter((id) => ids.slice(0, 2).includes(id)), []);
    assert.deepEqual(route(answers).selectedQuestionIds.filter((id) => ids.slice(0, 2).includes(id)), []);
  }
  assert.ok(resolve({ ...base, q2_has_customers: "yes" }).eligibleQuestionIds.includes(ids[0]!));
  for (const staff of ["no", undefined]) assert.ok(!resolve({ ...base, q2_has_customers: "yes", q2_other_staff: staff }).eligibleQuestionIds.includes(ids[0]!));
  assert.ok(!resolve({ ...base, q2_has_customers: "yes", q2_goal: "be_found" }).eligibleQuestionIds.includes(ids[1]!));
  assert.ok(resolve({ ...base, q2_has_customers: "yes", q2_goal: "other", q2_friction: "operations" }).eligibleQuestionIds.includes(ids[1]!));
});

test("fallbacks require a declared need and observable presence; no automatic specialist duplication", () => {
  for (const activity of ["yes", "no"]) {
    const base: AnswersV2 = { q2_has_customers: activity, q2_goal: "explain" };
    assert.ok(resolve(base).eligibleQuestionIds.includes(ids[2]!));
    for (const presence of ["reliable_presence", "partial_presence"]) assert.ok(resolve({ ...base, [ids[2]!]: presence }).eligibleQuestionIds.includes(ids[3]!));
    for (const presence of ["no_reliable_presence", "unknown", "not_applicable", undefined]) assert.ok(!resolve({ ...base, [ids[2]!]: presence }).eligibleQuestionIds.includes(ids[3]!));
  }
  for (const delivery of ["physical_location", "retail", "onsite", "online_checkout"]) {
    assert.ok(!resolve({ ...established, q2_goal: "be_found", q2_delivery: [delivery] }).eligibleQuestionIds.includes(ids[2]!));
  }
  assert.ok(!resolve({ ...established, q2_goal: "explain", q2_delivery: ["retail"], [ids[2]!]: "reliable_presence" }).eligibleQuestionIds.includes(ids[3]!));
  for (const goal of ["opportunities", "stop_losing", "organize", "measure", "trust"]) assert.ok(!resolve({ ...established, q2_goal: goal }).eligibleQuestionIds.includes(ids[2]!));
  assert.ok(!resolve({ q2_goal: "explain" }).eligibleQuestionIds.includes(ids[2]!));
});

test("every R2J option, unknown and N/A included, is tool neutral response data without context or candidate evidence", () => {
  const bases: AnswersV2[] = [
    { ...established, q2_entity: "individual", q2_other_staff: "yes", q2_goal: "organize" },
    { ...established, q2_goal: "organize" },
    { ...established, q2_goal: "be_found" },
    { ...established, q2_goal: "explain", q2_presence_digital_base: "reliable_presence" },
  ];
  for (const q of reviewed) {
    const base = q.id === followup ? { ...established, q2_goal: "other", q2_friction: "follow_up" } : bases[ids.indexOf(q.id)]!;
    const before = resolve(base);
    for (const option of q.options) {
      assert.equal(option.produces, undefined);
      const answers = { ...base, [q.id]: option.value };
      const after = resolve(answers);
      assert.deepEqual(after.context, before.context);
      assert.deepEqual(after.trace, before.trace);
      assert.deepEqual(deriveContextualEvidence(answers, candidate), [], `${q.id}/${option.value}`);
    }
    const old = legacy.find((l) => l.id === q.id)!;
    for (const option of old.options.filter((o) => !o.kind)) assert.ok(deriveContextualEvidence({ [q.id]: option.value }, legacy).some((e) => e.questionId === q.id), `${q.id}/${option.value}: legacy`);
  }
  assert.ok(reviewed[0]!.hint!.includes("hablando"));
  assert.ok(reviewed[2]!.hint!.includes("papel"));
  assert.ok(reviewed[3]!.hint!.includes("no ser dueño"));
  for (const q of reviewed) for (const option of q.options) assert.ok(!/CRM|automat|hoja de cálculo|papel|web propia/i.test(option.label), option.label);
});

test("R2J deepening never enters base and selects information/clarity only through actual material needs", () => {
  const operation = route({ ...established, q2_goal: "organize", q2_entity: "individual", q2_other_staff: "yes" });
  assert.ok(operation.selectedQuestionIds.includes(ids[1]!));
  assert.equal(operation.trace.find((entry) => entry.questionId === ids[1])?.selectedIn, "material");
  const clarity = route({ ...established, q2_goal: "explain", [ids[2]!]: "reliable_presence" });
  assert.ok(clarity.selectedQuestionIds.includes(ids[3]!));
  assert.equal(clarity.trace.find((entry) => entry.questionId === ids[3])?.selectedIn, "material");
  for (const plan of [operation, clarity]) for (const entry of plan.trace.filter((entry) => ids.includes(entry.questionId))) {
    assert.equal(entry.required, false);
    if (entry.selected) assert.notEqual(entry.selectedIn, "base");
  }
  const prerequisite = route({ ...established, q2_goal: "explain" }).trace.find((entry) => entry.questionId === ids[2]);
  assert.equal(prerequisite?.reason, "unlock_routing");
  assert.ok(route({ ...established, q2_goal: "explain" }).selectedQuestionIds.includes(ids[2]!));
  for (const model of ["services", "audience", "mission"]) {
    const plan = route({ ...established, q2_monetization: model, q2_goal: "be_found" });
    assert.ok(plan.selectedQuestionIds.includes(ids[2]!));
    assert.ok(plan.routeLength < ROUTE_HARD_CAP);
  }
});

test("seven representative routes preserve R2I and stay well below cap without automatic R2J inflation", () => {
  assert.equal(ROUTE_HARD_CAP, 24);
  const probes: readonly [string, AnswersV2, number][] = [
    ["local", { q2_delivery: ["physical_location"], q2_goal: "be_found" }, 9],
    ["appointments", { q2_delivery: ["appointments"], q2_goal: "opportunities" }, 10],
    ["B2B", { q2_customer_buyer: "b2b", q2_goal: "organize" }, 10],
    ["creator", { q2_monetization: "audience", q2_goal: "stop_losing" }, 9],
    ["ecommerce", { q2_delivery: ["online_checkout"], q2_goal: "opportunities" }, 10],
    ["nonprofit", { q2_monetization: "mission", q2_goal: "opportunities" }, 8],
    ["prelaunch", { q2_has_customers: "no", q2_entity: "project", q2_goal: "explain" }, 6],
  ];
  for (const [name, extra, count] of probes) {
    const answers = { ...established, ...extra };
    const plan = route(answers);
    assert.equal(plan.selectedQuestionIds.length, count, name);
    assert.deepEqual(plan.selectedQuestionIds.filter((id) => ids.includes(id)), name === "prelaunch" ? [ids[2]] : [], name);
    assert.ok(plan.routeLength < ROUTE_HARD_CAP, name);
    assert.deepEqual(plan, route(answers), `${name}: deterministic`);
  }
});


test("general follow-up requires a declared real continuity problem and yields to specialist coverage", () => {
  const base: AnswersV2 = { ...established, q2_goal: "other", q2_friction: "follow_up" };
  assert.ok(resolve(base).eligibleQuestionIds.includes(followup));
  const plan = route(base);
  assert.ok(plan.selectedQuestionIds.includes(followup));
  assert.equal(plan.trace.find((e) => e.questionId === followup)?.selectedIn, "material");
  assert.equal(plan.trace.find((e) => e.questionId === followup)?.required, false);
  for (const extra of [{ q2_has_customers: "no" }, { q2_has_customers: undefined }, { q2_friction: undefined, q2_goal: "stop_losing" }, { q2_delivery: ["travels"] }, { q2_delivery: ["appointments"] }, { q2_delivery: ["retail"] }, { q2_customer_buyer: "b2b" }, { q2_customer_buyer: "mixed" }, { q2_monetization: "audience" }]) {
    assert.ok(!resolve({ ...base, ...extra }).eligibleQuestionIds.includes(followup));
  }
  for (const model of ["services", "goods", "mission"]) assert.ok(resolve({ ...base, q2_monetization: model }).eligibleQuestionIds.includes(followup));
});
