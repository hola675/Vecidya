import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateQuestionPlanFromBankV3, buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const authored = {
  q2_entity: "business", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"],
  q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "opportunities",
  q2_friction: "follow_up", q2_sector: "professional_services", q2_customer_reach: "local", q2_customer_buyer: "b2c",
  q2_capacity_signal: "stable", q2_appointments_noshow: "sometimes", q2_ecommerce_traffic_sources: ["search"],
  q2_b2b_pipeline: "defined", q2_process_systemization: "defined", q2_discovery_reliable_reach: "reliable",
  q2_local_presence_consistency: "consistent", q2_reputation_flow: "strong", q2_service_response_speed: "strong",
  q2_service_quote_followup: "consistent", q2_appointments_booking_friction: "rarely",
  q2_appointments_confirmation_reminders: "consistent", q2_appointments_lead_to_booking: "mixed",
  q2_appointments_rebooking: "proactive", q2_professional_authority_signals: "clearly_visible",
  q2_professional_intake_flow: "clear", q2_retail_product_visibility: "clear", q2_retail_customer_capture: "consistent",
  q2_ecommerce_product_discovery: "easy", q2_b2b_status_visibility: "clear", q2_creator_audience_ownership: "direct_consistent",
  q2_operations_handoffs: "complete", q2_followup_general_process: "consistent",
  q2_operations_information_base: "easy_reliable", q2_presence_digital_base: "reliable_presence",
  q2_presence_offer_clarity: "clear",
} satisfies Record<string, string | readonly string[]>;

type Fixture = { name: string; seed: AnswersV2 };
const fixtures: readonly Fixture[] = [
  { name: "prelaunch project", seed: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } },
  { name: "active professional", seed: { q2_entity: "individual", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "legal" } },
  { name: "appointments", seed: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"] } },
  { name: "physical retail", seed: { q2_entity: "business", q2_monetization: "goods", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "retail", q2_delivery: ["retail"], q2_goal: "explain" } },
  { name: "ecommerce", seed: { q2_entity: "business", q2_monetization: "goods", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_goal: "explain" } },
  { name: "B2B", seed: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_customer_buyer: "b2b" } },
  { name: "creator", seed: { q2_entity: "individual", q2_monetization: "audience", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_sector: "creative_media", q2_goal: "opportunities" } },
  { name: "nonprofit / organization", seed: { q2_entity: "organization", q2_monetization: "mission", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" } },
  { name: "operations-heavy", seed: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_friction: "operations" } },
  { name: "retail + ecommerce", seed: { q2_entity: "business", q2_monetization: "goods", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "retail", q2_delivery: ["retail", "online_checkout"], q2_goal: "explain" } },
  { name: "professional + appointments", seed: { q2_entity: "individual", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_sector: "legal", q2_delivery: ["appointments"] } },
  { name: "unresolved / unsure", seed: { q2_entity: "business", q2_goal: "unsure", q2_friction: "unsure" } },
];

function askOneAtATime(seed: AnswersV2, profile: typeof authored = authored) {
  let answers = { ...seed } as AnswersV2;
  const asked: { id: string; answer: string | readonly string[]; reason: string; contextOnlyUseful: boolean }[] = [];
  for (let turn = 0; turn < 24; turn += 1) {
    const plan = buildCandidateQuestionPlanV3({ answers });
    answers = plan.activeAnswers;
    if (!plan.nextQuestionId) return { plan, asked, answers };
    const id = plan.nextQuestionId;
    const answer = (profile as Record<string, string | readonly string[]>)[id];
    assert.notEqual(answer, undefined, `fixture has no explicitly authored response for ${id}`);
    const after = buildCandidateQuestionPlanV3({ answers: { ...answers, [id]: answer } });
    const question = BANK.find((q) => q.id === id)!;
    const resolvedOrChangedContext = JSON.stringify(plan.context) !== JSON.stringify(after.context);
    const applicabilityChanged = JSON.stringify(scoreCandidateContextualDimensionsV3({ answers }).dimensions.map((d) => [d.id, d.applicability])) !== JSON.stringify(scoreCandidateContextualDimensionsV3({ answers: after.activeAnswers }).dimensions.map((d) => [d.id, d.applicability]));
    const unlockedBranch = after.eligibleQuestionIds.some((child) => !plan.eligibleQuestionIds.includes(child));
    const declaredPriority = id === "q2_goal" || id === "q2_friction";
    asked.push({ id, answer, reason: plan.trace.find((entry) => entry.questionId === id)?.reason ?? "unknown", contextOnlyUseful: question.evidenceMigration === "migrated" || resolvedOrChangedContext || applicabilityChanged || unlockedBranch || declaredPriority });
    answers = after.activeAnswers;
  }
  assert.fail("interactive route exceeded the absolute 24-question cap");
}

test("R5-B explicit interactive routes recompute after each authored answer", () => {
  const reports = fixtures.map((fixture) => {
    const routeAnswers: Record<string, string | readonly string[]> = {
      "prelaunch project": { ...authored, q2_delivery: ["other"], q2_monetization: "unsure", q2_presence_digital_base: "not_applicable" },
      "active professional": { ...authored, q2_delivery: ["travels"], q2_sector: "legal" },
      appointments: { ...authored, q2_delivery: ["appointments"] },
      "physical retail": { ...authored, q2_delivery: ["retail"], q2_monetization: "goods", q2_sector: "retail" },
      ecommerce: { ...authored, q2_delivery: ["online_checkout"], q2_monetization: "goods" },
      B2B: { ...authored, q2_delivery: ["other"], q2_customer_buyer: "b2b" },
      creator: { ...authored, q2_delivery: ["online_checkout"], q2_monetization: "audience", q2_sector: "creative_media" },
      "nonprofit / organization": { ...authored, q2_delivery: ["other"], q2_monetization: "mission" },
      "operations-heavy": { ...authored, q2_delivery: ["other"], q2_goal: "organize", q2_friction: "operations" },
      "retail + ecommerce": { ...authored, q2_delivery: ["retail", "online_checkout"], q2_monetization: "goods", q2_sector: "retail" },
      "professional + appointments": { ...authored, q2_delivery: ["appointments"], q2_sector: "legal" },
      "unresolved / unsure": { ...authored, q2_delivery: ["unsure"], q2_monetization: "unsure", q2_customer_buyer: "b2c" },
    }[fixture.name];
    const profile = routeAnswers as typeof authored;
    const route = askOneAtATime(fixture.seed, profile);
    const modules = [...new Set(route.asked.map(({ id }) => BANK.find((q) => q.id === id)?.module).filter(Boolean))];
    const unexplainedContextOnly = route.asked.filter(({ id, contextOnlyUseful }) => BANK.find((q) => q.id === id)?.evidenceMigration === "pending" && !contextOnlyUseful);
    assert.deepEqual(unexplainedContextOnly, [], `${fixture.name}: every context-only/later-review ask must change context, unlock, applicability, or declared priority`);
    if (fixture.name === "prelaunch project") {
      assert.ok(!route.asked.some((item) => item.id === "q2_presence_digital_base"), "prelaunch must not collect Foundation evidence through a routing side door");
      const dimensions = scoreCandidateContextualDimensionsV3({ answers: route.plan.activeAnswers }).dimensions;
      for (const id of ["digital_foundation", "trust_reputation", "relationship_recurrence", "measurement_optimization"] as const) {
        const result = dimensions.find((d) => d.id === id)!;
        assert.equal(result.applicability, "not_applicable", `${id}: ${JSON.stringify(route.plan.context.activity)} ${JSON.stringify(route.plan.context.entity)} ${route.asked.map((x) => `${x.id}=${x.answer}`).join(";")}`);
        assert.equal(result.confidence.direct, 0, `${id}: prelaunch has no scored direct evidence`);
      }
    }
    if (fixture.name === "retail + ecommerce") {
      assert.ok(route.asked.some((item) => item.id === "q2_retail_product_visibility"));
      assert.ok(route.asked.some((item) => item.id === "q2_ecommerce_product_discovery"));
    }
    if (fixture.name === "professional + appointments") {
      assert.ok(route.asked.some((item) => item.id === "q2_professional_intake_flow"));
      assert.ok(route.asked.some((item) => item.id.startsWith("q2_appointments_")));
    }
    const openApplicable = route.plan.evidenceSufficiency.unresolvedApplicableDimensions;
    const actionableDirect = BANK.filter((question) => route.plan.eligibleQuestionIds.includes(question.id)
      && route.plan.activeAnswers[question.id] === undefined
      && question.evidenceMigration === "migrated"
      && question.evidenceV3?.dimensions.some((item) => item.directness === "direct" && openApplicable.includes(item.dimension)));
    assert.deepEqual(actionableDirect, [], `${fixture.name}: terminal route has no eligible direct source for an applicable null dimension`);
    assert.ok(route.plan.completion.ready || route.plan.completion.hardCapReached, `${fixture.name}: terminal completion`);
    assert.equal(route.plan.evidenceSufficiency.terminalReason, "no_useful_questions", `${fixture.name}: no actionable work remains`);
    assert.equal(route.plan.evidenceSufficiency.usefulQuestionsRemaining, false, `${fixture.name}: no residual useful work`);
    const dimensions = scoreCandidateContextualDimensionsV3({ answers: route.plan.activeAnswers }).dimensions;
    const gaps = dimensions.filter((item) => item.applicability === "applicable" && item.score === null && !BANK.some((question) => question.evidenceMigration === "migrated" && question.evidenceV3?.dimensions.some((source) => source.dimension === item.id && source.directness === "direct"))).map((item) => item.id);
    return { name: fixture.name, initial: Object.keys(fixture.seed).length, asked: route.asked.length, active: Object.keys(route.plan.activeAnswers).length, modules, questions: route.asked.map(({ id, answer }) => `${id}=${Array.isArray(answer) ? answer.join("+") : answer}`), nullScore: route.plan.evidenceSufficiency.unresolvedApplicableDimensions, unobservableGaps: gaps, terminal: route.plan.evidenceSufficiency.terminalReason };
  });
  const sorted = reports.map((r) => r.asked).sort((a, b) => a - b);
  console.log(`R5-B explicit interactive routes: ${JSON.stringify(reports)}; asked min/median/max=${sorted[0]}/${sorted[Math.floor(sorted.length / 2)]}/${sorted.at(-1)}`);
  assert.equal(reports.length, 12);
});

test("R5-B appointments lead-to-booking prerequisite unlocks only its causal child", () => {
  const before = buildCandidateQuestionPlanV3({ answers: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities" } });
  const lead = "q2_appointments_lead_to_booking";
  assert.ok(before.selectedQuestionIds.includes(lead));
  assert.equal(before.trace.find((x) => x.questionId === lead)?.reason, "unlock_routing");
  assert.ok(!before.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  const after = buildCandidateQuestionPlanV3({ answers: { ...before.activeAnswers, [lead]: "few" } });
  assert.ok(after.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  assert.ok(after.selectedQuestionIds.includes("q2_appointments_booking_friction"));
});

test("R5-B pending creator ownership stays non-useful, and Measurement is a valid unobservable gap", () => {
  const answers = { q2_entity: "individual", q2_monetization: "audience", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["audience_content"] };
  const creator = buildCandidateQuestionPlanV3({ answers });
  assert.ok(!creator.selectedQuestionIds.includes("q2_creator_audience_ownership"));
  assert.ok(!creator.evidenceSufficiency.usefulQuestionIds.includes("q2_creator_audience_ownership"));
  const measure = buildCandidateQuestionPlanV3({ answers: { ...answers, q2_goal: "measure" } });
  const metric = scoreCandidateContextualDimensionsV3({ answers: { ...answers, q2_goal: "measure" } }).dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(metric.applicability, "applicable");
  assert.equal(metric.score, null);
  assert.deepEqual(measure.evidenceSufficiency.usefulEvidenceQuestionIds.filter((id) => BANK.find((q) => q.id === id)?.evidenceV3?.dimensions.some((d) => d.dimension === "measurement_optimization")), []);
});

test("R5-B distinguishes useful questions blocked by module and base budgets", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"] };
  const normal = buildCandidateQuestionPlanV3({ answers: seed });
  const moduleMax = Object.fromEntries([...new Set(BANK.map((question) => question.module))].map((module) => [module, 0])) as typeof normal.budget.moduleMax;
  const constrained = buildCandidateQuestionPlanV3({ answers: seed, budget: { ...normal.budget, moduleMax } });
  assert.equal(constrained.nextQuestionId, undefined);
  assert.ok(constrained.evidenceSufficiency.usefulQuestionIds.length > 0);
  assert.equal(constrained.evidenceSufficiency.terminalReason, "budget_blocked");
  assert.equal(constrained.completion.ready, false);
  assert.ok(constrained.trace.some((entry) => entry.skipReason === "module_budget"));
  const prelaunch: AnswersV2 = { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" };
  const fullBase = buildCandidateQuestionPlanV3({ answers: prelaunch, budget: { ...normal.budget, targetMax: Object.keys(prelaunch).length, materialEvidenceReserve: 0 } });
  assert.equal(fullBase.nextQuestionId, undefined);
  assert.ok(fullBase.evidenceSufficiency.usefulQuestionIds.length > 0);
  assert.equal(fullBase.evidenceSufficiency.terminalReason, "budget_blocked");
  assert.equal(fullBase.completion.ready, false);
  assert.ok(fullBase.trace.some((entry) => entry.skipReason === "base_budget"));
});

test("R5-B preserves answer, save/resume and bank order determinism", () => {
  const seed: AnswersV2 = fixtures[9].seed;
  const left = buildCandidateQuestionPlanV3({ answers: seed });
  const reversed = buildCandidateQuestionPlanV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) });
  const bankReversed = buildCandidateQuestionPlanFromBankV3({ answers: seed }, [...BANK].reverse());
  assert.deepEqual(reversed.selectedQuestionIds, left.selectedQuestionIds);
  assert.deepEqual(bankReversed.selectedQuestionIds, left.selectedQuestionIds);
  assert.deepEqual(bankReversed.completion, left.completion);
  assert.deepEqual(bankReversed.evidenceSufficiency.usefulQuestionIds, left.evidenceSufficiency.usefulQuestionIds);
  const restored = buildCandidateQuestionPlanV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored, left);
});

test("R5-B R3 direct sources remain isolated from legacy answer mappings", () => {
  const direct = BANK.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.directness === "direct"));
  assert.equal(direct.length, 19);
  assert.equal(BANK.filter((q) => q.evidenceMigration === "migrated").length, 21);
});

test("R5-B audits every migrated direct source as useful in an explicit applicable context", () => {
  const direct = BANK.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.directness === "direct"));
  const missing: string[] = [];
  const blocked: string[] = [];
  for (const question of direct) {
    const base: AnswersV2 = {
      q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular",
      q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_friction: "follow_up",
      q2_sector: "professional_services", q2_customer_buyer: "b2b",
    };
    let context = { ...base } as AnswersV2;
    if (["q2_retail_product_visibility", "q2_retail_customer_capture"].includes(question.id)) context = { ...context, q2_monetization: "goods", q2_delivery: ["retail"], q2_sector: "retail", ...(question.id === "q2_retail_customer_capture" ? { q2_goal: "stop_losing" } : {}) };
    if (question.id === "q2_ecommerce_product_discovery") context = { ...context, q2_monetization: "goods", q2_delivery: ["online_checkout"] };
    if (question.id === "q2_local_presence_consistency") context = { ...context, q2_delivery: ["physical_location"] };
    if (["q2_service_response_speed", "q2_service_quote_followup"].includes(question.id)) context = { ...context, q2_delivery: ["travels"], q2_goal: "opportunities", ...(question.id === "q2_service_quote_followup" ? { q2_service_response_speed: "weak" } : {}) };
    if (["q2_appointments_booking_friction", "q2_appointments_confirmation_reminders", "q2_appointments_rebooking"].includes(question.id)) context = { ...context, q2_delivery: ["appointments"], q2_goal: question.id === "q2_appointments_rebooking" ? "stop_losing" : "opportunities", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often" };
    if (["q2_professional_authority_signals", "q2_professional_intake_flow"].includes(question.id)) context = { ...context, q2_entity: "individual", q2_sector: "legal", q2_delivery: ["appointments"], q2_goal: "trust", q2_friction: "trust" };
    if (question.id === "q2_retail_product_visibility") context = { ...context, q2_goal: "explain" };
    if (question.id === "q2_b2b_pipeline") context = { ...context, q2_customer_buyer: "b2b" };
    if (question.id === "q2_b2b_status_visibility") context = { ...context, q2_customer_buyer: "b2b", q2_process_systemization: "defined" };
    if (question.id === "q2_operations_handoffs") context = { ...context, q2_friction: "operations", q2_process_systemization: "defined" };
    if (question.id === "q2_operations_information_base") context = { ...context, q2_goal: "organize", q2_friction: "operations" };
    if (question.id === "q2_followup_general_process") context = { ...context, q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
    if (question.id === "q2_presence_digital_base") context = { ...context, q2_delivery: ["other"], q2_goal: "explain" };
    if (question.id === "q2_presence_offer_clarity") context = { ...context, q2_goal: "explain", q2_presence_digital_base: "partial_presence" };
    const plan = buildCandidateQuestionPlanV3({ answers: context });
    const dimension = question.evidenceV3!.dimensions.find((item) => item.directness === "direct")!.dimension;
    const answer = (authored as Record<string, string | readonly string[]>)[question.id];
    const after = buildCandidateQuestionPlanV3({ answers: { ...context, [question.id]: answer } });
    const beforeScore = scoreCandidateContextualDimensionsV3({ answers: context }).dimensions.find((item) => item.id === dimension)!;
    const score = scoreCandidateContextualDimensionsV3({ answers: { ...context, [question.id]: answer } }).dimensions.find((item) => item.id === dimension)!;
    if (question.id === "q2_followup_general_process") {
      // Relationship Prospective Evidence Boundary: eligible with insufficient_context before answering,
      // yet planner-level simulation (not an R3/R4 contract change) proves a substantive answer resolves it.
      if (!plan.eligibleQuestionIds.includes(question.id) || beforeScore.applicability !== "insufficient_context") missing.push(`${question.id}[pre-answer eligibility/applicability mismatch]`);
      else blocked.push(question.id);
    }
    if (!plan.eligibleQuestionIds.includes(question.id) || !plan.evidenceSufficiency.usefulQuestionIds.includes(question.id) || !plan.selectedQuestionIds.includes(question.id) || score.applicability !== "applicable" || score.confidence.direct === 0 || !after.activeAnswers[question.id]) missing.push(`${question.id}[eligible=${plan.eligibleQuestionIds.includes(question.id)},useful=${plan.evidenceSufficiency.usefulQuestionIds.includes(question.id)},selected=${plan.selectedQuestionIds.includes(question.id)},app=${score.applicability},direct=${score.confidence.direct}]`);
  }
  assert.deepEqual(missing, [], `unreachable direct sources: ${missing.join(", ")}`);
  assert.deepEqual(blocked, ["q2_followup_general_process"], "this source starts insufficient_context and must resolve to applicable only through a substantive answer, proving the R4 contract was not weakened");
  assert.equal(direct.length, 19);
  assert.equal(BANK.some((q) => q.id === "q2_friction"), true);
  assert.ok(JSON.stringify(BANK.find((q) => q.id === "q2_followup_general_process")?.materialAppliesWhen).includes('"question":"q2_friction"'));
});

test("R5-B prospective applicability evidence: direct migrated source resolves insufficient_context without changing R3/R4", () => {
  const before = buildCandidateQuestionPlanV3({ answers: { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" } });
  const beforeDimension = scoreCandidateContextualDimensionsV3({ answers: before.activeAnswers }).dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(beforeDimension.applicability, "insufficient_context", "R4 contract unchanged: still starts insufficient_context");
  assert.ok(before.eligibleQuestionIds.includes("q2_followup_general_process"));
  assert.ok(before.evidenceSufficiency.usefulQuestionIds.includes("q2_followup_general_process"));
  assert.ok(before.selectedQuestionIds.includes("q2_followup_general_process"));
  // Its routingRole is "deepening" (later-review), which the existing rankReason convention always labels
  // "refinement" regardless of the underlying utility source — consistent with how a deepening question
  // with ordinary direct utility is also labelled "refinement" rather than "specialized_evidence".
  assert.equal(before.trace.find((entry) => entry.questionId === "q2_followup_general_process")?.reason, "refinement");
  const after = buildCandidateQuestionPlanV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "consistent" } });
  const afterDimension = scoreCandidateContextualDimensionsV3({ answers: after.activeAnswers }).dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(afterDimension.applicability, "applicable");
  assert.equal(afterDimension.applicabilityReason, "observed_dimension_evidence", "R4 contract unchanged: resolved through its existing evidence-observation reason, not a new rule");
  assert.equal(after.activeAnswers.q2_followup_general_process, "consistent");
  // not_applicable stays neutral; it must never itself prove prospective applicability.
  const notApplicable = buildCandidateQuestionPlanV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "not_applicable" } });
  assert.equal(scoreCandidateContextualDimensionsV3({ answers: notApplicable.activeAnswers }).dimensions.find((d) => d.id === "relationship_recurrence")!.applicability, "insufficient_context");
});

test("R5-B prospective applicability evidence never applies to supporting-only sources", () => {
  const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_customer_buyer: "b2b" };
  const plan = buildCandidateQuestionPlanV3({ answers: seed });
  const supportingOnly = BANK.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.directness === "supporting") && !q.evidenceV3.dimensions.some((d) => d.directness === "direct"));
  assert.ok(supportingOnly.length > 0);
  for (const question of supportingOnly) {
    assert.notEqual(plan.trace.find((entry) => entry.questionId === question.id)?.reason, "prospective_evidence", `${question.id}: a supporting-only source must never be classified as prospective applicability evidence`);
  }
});

test("R5-B cannot let a raw legacy friction answer alter candidate prioritization", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities" };
  const withoutLegacyFriction = buildCandidateQuestionPlanV3({ answers: base });
  const withLegacyFriction = buildCandidateQuestionPlanV3({ answers: { ...base, q2_friction: "operations" } });
  assert.deepEqual(withLegacyFriction.activeAnswers, withoutLegacyFriction.activeAnswers);
  assert.deepEqual(withLegacyFriction.selectedQuestionIds, withoutLegacyFriction.selectedQuestionIds);
});

test("R5-B goal and available friction context reprioritize only supported candidate work", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["travels"], q2_sector: "professional_services", q2_customer_buyer: "b2c", q2_customer_reach: "local" };
  const opportunity = buildCandidateQuestionPlanV3({ answers: { ...base, q2_goal: "opportunities" } });
  const trust = buildCandidateQuestionPlanV3({ answers: { ...base, q2_goal: "trust" } });
  assert.deepEqual(opportunity.evidenceSufficiency.applicableDimensions, trust.evidenceSufficiency.applicableDimensions);
  assert.notDeepEqual(opportunity.selectedQuestionIds, trust.selectedQuestionIds);
  assert.ok(trust.selectedQuestionIds.includes("q2_professional_authority_signals"));
  assert.ok(!opportunity.selectedQuestionIds.includes("q2_professional_authority_signals"));
  const operations = buildCandidateQuestionPlanV3({ answers: { ...base, q2_goal: "other", q2_friction: "operations" } });
  assert.ok(operations.selectedQuestionIds.includes("q2_operations_information_base"));
  assert.equal(operations.context.primaryFriction.value, "operations");
});

test("R5-B both supporting sources wait for direct digital-readiness evidence", () => {
  const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_customer_buyer: "b2b" };
  const withoutDirect = buildCandidateQuestionPlanV3({ answers: seed });
  assert.ok(!withoutDirect.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_b2b_status_visibility"));
  assert.ok(!withoutDirect.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_operations_handoffs"));
  const withDirect = buildCandidateQuestionPlanV3({ answers: { ...seed, q2_process_systemization: "defined" } });
  assert.ok(withDirect.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_b2b_status_visibility"));
  assert.ok(withDirect.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_operations_handoffs"));
  assert.equal(withDirect.trace.find((entry) => entry.questionId === "q2_b2b_status_visibility")?.reason, "refinement");
  assert.equal(withDirect.trace.find((entry) => entry.questionId === "q2_operations_handoffs")?.reason, "refinement");
});
