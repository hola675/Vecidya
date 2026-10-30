import assert from "node:assert/strict";
import test from "node:test";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { inspectV9Graph, orderV9GraphQuestions } from "../../../app/features/diagnostic/v9/graph-evaluation";

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
