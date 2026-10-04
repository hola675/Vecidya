import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, GOLDEN_PERSONAS, QUESTION_BANK_V2, ROUTE_BANDS, ROUTE_HARD_CAP,
  buildQuestionPlan, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, type QuestionDefinitionV2, type QuestionPlan,
} from "../../../app/features/diagnostic/index.ts";

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const isDirect = (id: string, dimension: string) => (EVIDENCE_MAPPING[id]?.dimensions as readonly string[] | undefined)?.includes(dimension) && (EVIDENCE_DIRECTNESS[id]?.[dimension as never] ?? EVIDENCE_MAPPING[id]!.semanticRole) === "direct";
const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
const pick = (question: QuestionDefinitionV2, policy: "first" | "last") => {
  const options = question.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable" && !option.exclusive);
  const option = (policy === "first" ? options[0] : options[options.length - 1]) ?? question.options[0]!;
  return question.type === "multi" ? [option.value] : option.value;
};
/** Capabilities that cannot exist before launch (structurally not applicable at the idea stage). */
const PRE_LAUNCH_NOT_APPLICABLE = ["trust_reputation", "relationship_recurrence", "measurement_optimization"];
const OPERATIONAL_MODULES = ["appointments", "follow_up", "operations", "reputation", "measurement"];

type Route = { readonly label: string; readonly stage: string; readonly answers: Record<string, unknown>; readonly asked: readonly string[]; readonly plans: readonly QuestionPlan[]; readonly seeds: number };

function runRoute(seed: Record<string, unknown>, policy: "first" | "last"): Omit<Route, "label" | "stage"> {
  const answers: Record<string, unknown> = { ...seed };
  const asked: string[] = [];
  const plans: QuestionPlan[] = [];
  for (let batch = 0; batch <= ROUTE_HARD_CAP; batch += 1) {
    const plan = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 });
    plans.push(plan);
    if (plan.selectedQuestionIds.length === 0) break;
    for (const id of plan.selectedQuestionIds) { answers[id] = pick(byId.get(id)!, policy); asked.push(id); }
  }
  return { answers, asked, plans, seeds: Object.keys(seed).length };
}

/** Production-reachable matrix: stage × delivery (+ nonprofit) × all nine goal answers × friction × two answer policies (3,240 routes). */
const ROUTES: readonly Route[] = (() => {
  const stages = { idea: { q2_entity: "project", q2_has_customers: "no" }, starting: { q2_has_customers: "yes", q2_regularity: "irregular" }, operating: { q2_has_customers: "yes", q2_regularity: "regular" } };
  const seeds = [...substantive("q2_delivery").map((delivery) => ({ q2_delivery: delivery })), { q2_delivery: "fixed_no_inventory", q2_monetization: "mission" }];
  const routes: Route[] = [];
  for (const policy of ["first", "last"] as const) for (const [stage, stageSeed] of Object.entries(stages)) for (const seed of seeds) for (const goal of byId.get("q2_goal")!.options.map((option) => option.value)) for (const friction of substantive("q2_friction")) {
    const route = runRoute({ ...stageSeed, ...seed, q2_goal: goal, q2_friction: friction }, policy);
    routes.push({ ...route, stage, label: JSON.stringify({ policy, stage, ...seed, goal, friction }) });
  }
  return routes;
})();

test("08E.2 budget: every route ends within 24, without duplicates, and only material evidence goes past the base", () => {
  assert.equal(ROUTES.length, 3240);
  for (const route of ROUTES) {
    assert.ok(Object.keys(route.answers).length <= ROUTE_HARD_CAP, `${route.label}: hard cap`);
    assert.equal(new Set(route.asked).size, route.asked.length, `${route.label}: duplicate question`);
    const completion = route.plans.at(-1)!.completion;
    assert.ok(completion.ready || completion.reason.includes("deepening_required"), `${route.label}: route ends complete or requires deepening`);
    const selections = route.plans.flatMap((plan) => plan.trace.filter((entry) => entry.selected));
    // The reserve (tail) only serves an open material need; the base route never exceeds 18 questions.
    assert.ok(selections.every((entry) => entry.selectedIn === "base" || entry.selectedIn === "deepening" || entry.materialEvidence), `${route.label}: tail question without a material need`);
    assert.ok(route.seeds + selections.filter((entry) => entry.selectedIn === "base").length <= ROUTE_BANDS.base, `${route.label}: base route above 18`);
  }
});

test("08E.2 open material needs remain observable for the deepening loop", () => {
  for (const route of ROUTES) {
    const resolved = resolveEligibleQuestionsV2(route.answers as never, QUESTION_BANK_V2);
    for (const need of route.plans.at(-1)!.materialEvidence.filter((item) => item.remaining > 0)) {
      const available = resolved.eligibleQuestionIds.filter((id) => route.answers[id] === undefined && isDirect(id, need.dimension));
      const usefulReachable = available.filter((id) => route.plans.at(-1)!.evidenceSufficiency.usefulQuestionIds.includes(id));
      assert.ok(usefulReachable.length === 0 || route.plans.at(-1)!.completion.reason.includes("deepening_required"), `${route.label}: useful material evidence must remain visible to deepening`);
    }
  }
});

test("08E.2 lifecycle: pre-launch routes ask no operational question; the same modules stay available once operating", () => {
  const live = new Set<string>();
  for (const route of ROUTES) {
    if (route.stage !== "idea") { route.asked.forEach((id) => live.add(byId.get(id)!.module)); continue; }
    for (const id of route.asked) {
      const question = byId.get(id)!;
      assert.ok(!OPERATIONAL_MODULES.includes(question.module), `${route.label}: ${id} assumes a live operation`);
      const dimensions = (EVIDENCE_MAPPING[id]?.dimensions ?? []) as readonly string[];
      assert.ok(dimensions.length === 0 || dimensions.some((dimension) => !PRE_LAUNCH_NOT_APPLICABLE.includes(dimension)), `${route.label}: ${id} only observes a capability that cannot exist yet`);
    }
  }
  for (const module of OPERATIONAL_MODULES) assert.ok(live.has(module), `${module} is gated by lifecycle, not disabled`);
});

test("08E.2 helpIntent: every question the planner can route as material evidence keeps its intent metadata", () => {
  const routed = new Set(ROUTES.flatMap((route) => route.plans.flatMap((plan) => plan.trace.filter((entry) => entry.selectedIn === "material").map((entry) => entry.questionId))));
  for (const question of QUESTION_BANK_V2) if (question.materialAppliesWhen) routed.add(question.id);
  const missing = [...routed].filter((id) => !byId.get(id)!.helpIntent?.understand || !byId.get(id)!.helpIntent?.distinction);
  assert.deepEqual(missing, []);
});

test("08E.2 determinism and golden routes: same input, same route; all twelve personas end within 24 without budget gaps", () => {
  for (const route of ROUTES.filter((_, index) => index % 97 === 0)) {
    const { policy } = JSON.parse(route.label) as { policy: "first" | "last" };
    const seed = Object.fromEntries(Object.entries(route.answers).filter(([id]) => !route.asked.includes(id)));
    assert.deepEqual(runRoute(seed, policy).asked, route.asked, `${route.label}: deterministic`);
  }
  for (const persona of GOLDEN_PERSONAS) {
    const execution = runGoldenPersonaPipeline(persona);
    assert.deepEqual(execution.unansweredSelectedQuestionIds, [], persona.id);
    assert.ok(Object.keys(execution.answers).length <= ROUTE_HARD_CAP, `${persona.id}: hard cap`);
    const plan = buildQuestionPlan({ answers: execution.answers, bank: QUESTION_BANK_V2 });
    assert.ok(plan.completion.ready || plan.completion.reason.includes("deepening_required"), `${persona.id}: complete or requires deepening`);
    const resolved = resolveEligibleQuestionsV2(execution.answers, QUESTION_BANK_V2);
    for (const need of plan.materialEvidence.filter((item) => item.remaining > 0)) {
      assert.deepEqual(resolved.eligibleQuestionIds.filter((id) => execution.answers[id] === undefined && isDirect(id, need.dimension)), [], `${persona.id}: ${need.dimension}`);
    }
  }
});
