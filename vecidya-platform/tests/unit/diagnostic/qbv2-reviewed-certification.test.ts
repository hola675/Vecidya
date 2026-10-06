import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { buildQuestionPlan, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions, REVIEWED_NEW_QUESTION_IDS } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { CONTEXT_FIELD_REFS, contextUnresolved, evaluateRuleV2, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { foldSignalProductions, signalProductionContextFields } from "../../../app/features/diagnostic/qbv2-signals";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const established: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" };
const probes: Readonly<Record<string, AnswersV2>> = {
  local: { q2_delivery: ["physical_location"], q2_goal: "be_found" },
  local_service: { q2_delivery: ["travels"], q2_goal: "opportunities" },
  appointments: { q2_delivery: ["appointments"], q2_goal: "opportunities" },
  retail: { q2_delivery: ["retail"], q2_goal: "explain" },
  ecommerce: { q2_delivery: ["online_checkout"], q2_goal: "opportunities" },
  hospitality: { q2_delivery: ["onsite"], q2_goal: "be_found" },
  B2B: { q2_customer_buyer: "b2b", q2_goal: "organize" },
  creator: { q2_monetization: "audience", q2_goal: "stop_losing" },
  nonprofit: { q2_monetization: "mission", q2_entity: "organization", q2_goal: "opportunities" },
  prelaunch: { q2_has_customers: "no", q2_entity: "project", q2_goal: "explain" },
};

// Answer only the planner's next selection. The first concrete option is a reproducible
// observation, not a scoring oracle; these isolated routes stop with no useful questions.
function completeRoute(seed: AnswersV2) {
  const answers: Record<string, string | readonly string[]> = { ...seed };
  const selected: string[] = [];
  const deepening: string[] = [];
  const selectedIn: Record<string, string | undefined> = {};
  for (let step = 0; step <= candidate.length; step++) {
    const plan = buildQuestionPlan({ answers, bank: candidate });
    assert.ok(plan.routeLength <= ROUTE_HARD_CAP);
    const id = plan.selectedQuestionIds[0];
    if (!id) return { answers, selected, deepening, selectedIn, plan };
    assert.ok(!selected.includes(id), `question asked twice: ${id}`);
    const question = candidate.find((q) => q.id === id)!;
    const entry = plan.trace.find((e) => e.questionId === id)!;
    selectedIn[id] = entry.selectedIn;
    if (question.routingRole === "deepening") assert.notEqual(entry.selectedIn, "base");
    if (entry.selectedIn !== "base") deepening.push(id);
    assert.ok(resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(id));
    const option = question.options.find((o) => !o.kind && o.value !== "other") ?? question.options[0]!;
    answers[id] = question.type === "multi" ? [option.value] : option.value;
    selected.push(id);
  }
  assert.fail("candidate route did not terminate");
}

test("R2-FINAL partitions the actual legacy bank independently of source order", () => {
  const classified = Object.values(decisions).flat();
  assert.equal(decisions.KEEP.length, 37);
  assert.equal(decisions.REMOVE.length, 37);
  assert.equal(decisions.DEFER.length, 11);
  assert.equal(classified.length, 85);
  assert.equal(new Set(classified).size, 85);
  for (const bank of [legacy, [...legacy].reverse()]) {
    assert.deepEqual([...classified].sort(), bank.map((q) => q.id).sort());
    assert.equal(bank.filter((q) => !classified.some((id) => id === q.id)).length, 0);
  }
});

test("R2-FINAL certifies candidate purity, semantic versions and pending migration", () => {
  assert.equal(candidate.length, 38);
  assert.equal(new Set(candidate.map((q) => q.id)).size, 38);
  assert.deepEqual(candidate.map((q) => q.id).sort(), [...decisions.KEEP, ...REVIEWED_NEW_QUESTION_IDS].sort());
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some((q) => q.id === id), id);
  assert.equal(candidate.filter((q) => q.evidenceMigration === "migrated").length, 0);
  const unchangedVersions = ["q2_entity", "q2_other_staff", "q2_has_customers"];
  for (const question of candidate) {
    assert.ok(question.routingRole);
    const old = legacy.find((q) => q.id === question.id);
    if (old && !unchangedVersions.includes(question.id)) assert.ok(question.version > old.version, question.id);
    if (question.purpose.includes("diagnostic")) assert.equal(question.evidenceMigration, "pending", question.id);
  }
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
});

test("R2-FINAL runtime registry and public bank version remain frozen", () => {
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy, "QBV2 registry slot still contains the historical definitions");
  assert.notEqual(getQuestionBank(2), candidate);
});

test("R2-FINAL every candidate option yields zero inherited or migrated scoring evidence", () => {
  for (const question of candidate) for (const option of question.options) {
    const value = question.type === "multi" ? [option.value] : option.value;
    assert.deepEqual(deriveContextualEvidence({ [question.id]: value }, candidate), [], `${question.id}/${option.value}`);
  }
});

test("R2-FINAL unknown and N/A productions cannot invent concrete activity, growth, friction or archetype", () => {
  let checked = 0;
  for (const question of candidate) for (const option of question.options.filter((o) => o.kind === "unknown" || o.kind === "not_applicable")) {
    checked++;
    const signals = foldSignalProductions((option.produces ?? []).map((production) => ({ origin: { questionId: question.id, optionId: option.value }, production })));
    const { context } = resolveDiagnosticContext(signals);
    for (const field of ["activity", "growthStage", "primaryFriction", "archetype", "businessModel"] as const) assert.equal(context[field].status, "unresolved", `${question.id}/${option.value}/${field}`);
    assert.deepEqual(context.archetypeComponents, []);
  }
  assert.ok(checked > 0);
});

test("R2-FINAL registered signal fields are readable by the DSL and aligned with context trace", () => {
  const { context, trace } = resolveEligibleQuestionsV2({}, candidate);
  assert.equal(new Set(CONTEXT_FIELD_REFS).size, CONTEXT_FIELD_REFS.length);
  for (const field of CONTEXT_FIELD_REFS) {
    assert.equal(evaluateRuleV2(contextUnresolved(field), {}, context), true, field);
    assert.equal(trace[field].status, "unresolved", field);
  }
  const produced = new Set<string>();
  for (const q of candidate) for (const option of q.options) for (const production of option.produces ?? []) {
    for (const field of signalProductionContextFields(production)) {
      assert.ok(CONTEXT_FIELD_REFS.some((registered) => registered === field), `${q.id}/${field}`);
      produced.add(field);
    }
  }
  for (const field of ["audienceMonetization", "operatingRegularity", "processConsistency", "capacitySituation", "appointmentAttendance", "b2bFollowupProcess", "discoveryReachReliability"]) assert.ok(produced.has(field), field);
});

test("R2-FINAL ten deterministic routes terminate below cap without filling unused capacity", () => {
  assert.equal(ROUTE_HARD_CAP, 24);
  for (const [name, extra] of Object.entries(probes)) {
    const seed = { ...established, ...extra };
    const result = completeRoute(seed);
    assert.deepEqual(result, completeRoute(seed), name);
    assert.equal(result.plan.completion.ready, true, name);
    assert.equal(result.plan.completion.hardCapReached, false, name);
    assert.ok(result.plan.routeLength < ROUTE_HARD_CAP, name);
    assert.equal(result.plan.completion.terminalReason, "no_useful_questions", name);
    assert.deepEqual(deriveContextualEvidence(result.answers, candidate), [], name);
    if (name === "prelaunch") {
      const allowed = new Set([...candidate.filter((q) => q.routingRole === "core").map((q) => q.id), "q2_presence_digital_base", "q2_presence_offer_clarity"]);
      for (const id of result.selected) assert.ok(allowed.has(id), `prelaunch history leak: ${id}`);
      assert.equal(resolveEligibleQuestionsV2(result.answers, candidate).context.activity.value, "prelaunch");
    }
  }
});

test("R2-FINAL q65 remains supporting, excluded from base/material-direct but reachable through evidence completion", () => {
  const seed = { ...established, q2_entity: "individual", q2_other_staff: "yes", q2_goal: "organize" };
  const initial = buildQuestionPlan({ answers: seed, bank: candidate });
  assert.ok(!initial.selectedQuestionIds.includes("q2_operations_handoffs"));
  const result = completeRoute(seed);
  assert.ok(result.selected.includes("q2_operations_handoffs"));
  assert.ok(result.deepening.includes("q2_operations_handoffs"));
  assert.equal(result.selectedIn.q2_operations_handoffs, "deepening");
  assert.ok(result.selected.indexOf("q2_operations_information_base") < result.selected.indexOf("q2_operations_handoffs"));
});

test("R2-FINAL every definition has an eligible witness, including selective specialist and deepening gates", () => {
  const witnessed = new Set(resolveEligibleQuestionsV2({}, candidate).eligibleQuestionIds);
  const seeds: AnswersV2[] = [
    ...Object.values(probes).map((extra) => ({ ...established, ...extra })),
    { ...established, q2_entity: "individual", q2_other_staff: "yes", q2_goal: "organize" },
    { ...established, q2_goal: "other", q2_friction: "follow_up" },
    { ...established, q2_goal: "explain", q2_presence_digital_base: "reliable_presence" },
    { ...established, q2_delivery: ["retail"], q2_goal: "stop_losing" },
    { ...established, q2_sector: "legal", q2_goal: "trust" },
    { ...established, q2_delivery: ["appointments"], q2_goal: "stop_losing", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" },
  ];
  for (const seed of seeds) {
    const resolution = resolveEligibleQuestionsV2(seed, candidate);
    for (const id of resolution.eligibleQuestionIds) witnessed.add(id);
    for (const id of Object.keys(resolution.activeAnswers)) witnessed.add(id);
    for (const question of candidate.filter((q) => q.routingRole === "deepening")) {
      const entry = buildQuestionPlan({ answers: seed, bank: candidate }).trace.find((e) => e.questionId === question.id);
      if (entry?.selected) assert.notEqual(entry.selectedIn, "base", question.id);
    }
  }
  assert.deepEqual(candidate.filter((q) => !witnessed.has(q.id)).map((q) => q.id), [], "no dead candidate gate");
});
