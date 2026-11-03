import assert from "node:assert/strict";
import test from "node:test";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { inspectV9Graph, orderV9GraphQuestions, planV9GraphQuestions, planV9AuditedGraphQuestions } from "../../../app/features/diagnostic/v9/graph-evaluation";

const graph = bank.map(({ id, appliesWhen, materialAppliesWhen }) => ({
  id,
  appliesWhen,
  materialAppliesWhen,
}));

test("F03 full bank: 77 candidates form a dependency graph without dangling references or cycles", () => {
  assert.equal(bank.length, 77, "Review historical candidate count before changing this gate");
  assert.equal(new Set(bank.map((question) => question.id)).size, 77);
  const audit = inspectV9Graph(graph);
  console.log("V9_FULL_BANK_GRAPH " + JSON.stringify({
    count: bank.length,
    missingDependencies: audit.missingDependencies,
    cycles: audit.cycles,
    orderedCount: audit.orderedIds.length,
  }));
  assert.deepEqual(audit.missingDependencies, [], "All question references must resolve within the candidate bank");
  assert.deepEqual(audit.cycles, [], "Candidate graph cannot be cyclic");
  assert.equal(audit.orderedIds.length, bank.length);
});

test("F03 full bank: prerequisites precede their dependants in deterministic ordering", () => {
  const ordered = orderV9GraphQuestions(graph);
  assert.equal(ordered.length, bank.length);
  assert.deepEqual(orderV9GraphQuestions(graph).map((item) => item.id), ordered.map((item) => item.id));
  assert.deepEqual(new Set(ordered.map((item) => item.id)), new Set(bank.map((item) => item.id)));
  for (const id of ["q2_niche_food_hospitality", "q2_food_menu_visibility", "q2_presence_digital_base"]) {
    assert.ok(ordered.some((question) => question.id === id), `Missing graph node ${id}`);
  }
  assert.ok(
    ordered.findIndex((question) => question.id === "q2_niche_food_hospitality")
      < ordered.findIndex((question) => question.id === "q2_food_menu_visibility"),
    "Niche classification must precede restaurant-specialty evidence",
  );
});

test("F03 full bank: empty input is deterministic and never consumes pending questions", () => {
  const ordered = orderV9GraphQuestions(graph);
  const first = planV9GraphQuestions(ordered, { answers: {} }, []);
  const second = planV9GraphQuestions(ordered, { answers: {} }, []);
  assert.deepEqual(first, second);
  assert.ok(first.evaluations.some((candidate) => candidate.status === "pending"));
  assert.equal(first.evaluations.find((candidate) => candidate.id === "q2_food_menu_visibility")?.status, "pending");
  assert.equal(first.evaluations.find((candidate) => candidate.id === "q2_nonprofit_donation_clarity")?.status, "pending");
  assert.ok(first.selection.selectedIds.length <= 24);
  assert.ok(first.selection.skipped.some((candidate) => candidate.reason === "pending_dependencies"));
  const replay = planV9GraphQuestions(ordered, { answers: {} }, first.selection.selectedIds);
  assert.ok(replay.selection.selectedIds.every((id) => !first.selection.selectedIds.includes(id)));
  assert.ok(replay.selection.selectedIds.length + first.selection.selectedIds.length <= 24);
});

test("F03 full bank: restaurant context transition changes eligibility, not historical evidence", () => {
  const ordered = orderV9GraphQuestions(graph);
  const answers = {
    q2_operational_status: "operating",
    q2_has_customers: "yes",
    q2_sector: "food_hospitality",
    q2_niche_food_hospitality: "restaurant",
    q2_goal: "explain",
    q2_presence_digital_base: "partial_presence",
  };
  const facts = {
    answers,
    context: { fields: { activity: { status: "resolved", value: "active" } } },
  } as const;
  const active = planV9GraphQuestions(ordered, facts, [], { materialEvidenceRequested: true });
  assert.equal(active.evaluations.find((item) => item.id === "q2_food_menu_visibility")?.status, "eligible");
  assert.equal(active.evaluations.find((item) => item.id === "q2_presence_offer_clarity")?.status, "ineligible");

  const noPresence = planV9GraphQuestions(ordered, {
    ...facts, answers: { ...answers, q2_presence_digital_base: "no_reliable_presence" },
  }, [], { materialEvidenceRequested: true });
  assert.equal(noPresence.evaluations.find((item) => item.id === "q2_food_menu_visibility")?.status, "ineligible");
  assert.equal(noPresence.evaluations.find((item) => item.id === "q2_presence_offer_clarity")?.status, "ineligible");

  const unknownNiche = planV9GraphQuestions(ordered, {
    ...facts, answers: { ...answers, q2_niche_food_hospitality: "unknown" },
  }, [], { materialEvidenceRequested: true });
  assert.equal(unknownNiche.evaluations.find((item) => item.id === "q2_food_menu_visibility")?.status, "ineligible");
  assert.equal(unknownNiche.evaluations.find((item) => item.id === "q2_presence_offer_clarity")?.status, "eligible");
});

test("F03 full bank: audited planning orders even reversed candidates and rejects malformed graphs", () => {
  const reversed = [...graph].reverse();
  const result = planV9AuditedGraphQuestions(reversed, { answers: {} }, []);
  assert.deepEqual(result.evaluations.map((question) => question.id), orderV9GraphQuestions(reversed).map((question) => question.id));
  assert.ok(result.selection.selectedIds.length <= 24);
  assert.throws(() => planV9AuditedGraphQuestions([
    { id: "a", appliesWhen: { op: "eq", ref: { question: "missing" }, value: "yes" } },
  ], { answers: {} }, []), /missing/);
  assert.deepEqual(planV9AuditedGraphQuestions([
    { id: "a", appliesWhen: { op: "eq", ref: { question: "external" }, value: "yes" } },
  ], { answers: { external: "yes" } }, [], { externalQuestionIds: ["external"] }).selection.selectedIds, ["a"]);
});
