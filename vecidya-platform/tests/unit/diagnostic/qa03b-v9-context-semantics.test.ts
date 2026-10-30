import assert from "node:assert/strict";
import test from "node:test";
import { selectV9Questions } from "../../../app/features/diagnostic/v9/question-selection.ts";
import { evaluateV9Rule, evaluateV9Question, planV9GraphQuestions, inspectV9Graph, orderV9GraphQuestions } from "../../../app/features/diagnostic/v9/graph-evaluation.ts";
import { classifyV9Activity, evaluateV9TrendCapacityGate, interpretV9AnswerState, interpretV9SelectedOption, classifyV9EvidenceContribution } from "../../../app/features/diagnostic/qa03b/v9-context-semantics.ts";

test("V9: pausa con clientes históricos no acredita operación actual", () => {
  assert.deepEqual(classifyV9Activity("paused", "yes"), {
    status: "paused", hasHistoricalCustomers: true, canAssertCurrentOperation: false, canAssertHistoricalDemand: true,
  });
});

test("V9: preparación sin clientes no se convierte en operación activa", () => {
  const result = classifyV9Activity("preparing", "no");
  assert.equal(result.canAssertCurrentOperation, false);
  assert.equal(result.hasHistoricalCustomers, false);
});

test("V9: la puerta histórica de demanda/capacidad exige regularidad", () => {
  assert.equal(evaluateV9TrendCapacityGate("regular").eligible, true);
  assert.equal(evaluateV9TrendCapacityGate("irregular").reason, "irregular_activity_requires_review");
  assert.equal(evaluateV9TrendCapacityGate(undefined).reason, "insufficient_regularity_evidence");
});

test("V9: desconocido, sin respuesta y no aplicable son estados diferentes", () => {
  assert.equal(interpretV9AnswerState("unknown", true), "unknown");
  assert.equal(interpretV9AnswerState(undefined, true), "unanswered");
  assert.equal(interpretV9AnswerState("no", false), "not_applicable");
  assert.equal(interpretV9AnswerState("no", true), "answered");
});

test("V9: neutral option does not require marking the whole question inapplicable", () => {
  assert.equal(interpretV9SelectedOption("no_authorized_contact", true, "not_applicable"), "not_applicable");
  assert.equal(interpretV9SelectedOption("unknown", true, "unknown"), "unknown");
  assert.equal(interpretV9SelectedOption("clear", true, undefined), "answered");
  assert.equal(interpretV9SelectedOption(undefined, true, undefined), "unanswered");
  assert.equal(interpretV9SelectedOption("clear", false, undefined), "not_applicable");
});

test("V9: evidence contribution distinguishes answered, unknown, and neutral", () => {
  assert.equal(classifyV9EvidenceContribution("answered"), "evaluate");
  assert.equal(classifyV9EvidenceContribution("unknown"), "uncertainty");
  assert.equal(classifyV9EvidenceContribution("unanswered"), "skip");
  assert.equal(classifyV9EvidenceContribution("not_applicable"), "skip");
  const neutral = interpretV9SelectedOption("no_authorized_contact", true, "not_applicable");
  assert.equal(classifyV9EvidenceContribution(neutral), "skip");
});

test("F03: standard interview never exceeds 24 questions without opt-in", () => {
  const candidates = Array.from({ length: 34 }, (_, index) => ({ id: `question_${index}`, eligible: true }));
  const standard = selectV9Questions(candidates, []);
  assert.equal(standard.limit, 24);
  assert.equal(standard.selectedIds.length, 24);
  assert.equal(standard.skipped.filter((item) => item.reason === "budget_exhausted").length, 10);

  const expanded = selectV9Questions(candidates, [], true);
  assert.equal(expanded.limit, 29);
  assert.equal(expanded.selectedIds.length, 29);
  assert.equal(expanded.skipped.filter((item) => item.reason === "budget_exhausted").length, 5);
});

test("F03: replayed presentations and ineligible candidates never inflate budget", () => {
  const candidates = Array.from({ length: 28 }, (_, index) => ({ id: `question_${index}`, eligible: index !== 2 }));
  const result = selectV9Questions(candidates, ["question_0", "question_1", "question_1"]);
  assert.equal(result.presentedCount, 2);
  assert.equal(result.remainingBeforeSelection, 22);
  assert.equal(result.selectedIds.length, 22);
  assert.equal(result.selectedIds.includes("question_2"), false);
  assert.equal(result.skipped.find((item) => item.id === "question_2")?.reason, "not_eligible");
  assert.equal(result.skipped.find((item) => item.id === "question_0")?.reason, "already_presented");
  assert.equal(result.skipped.filter((item) => item.reason === "budget_exhausted").length, 3);
  assert.throws(() => selectV9Questions([{ id: "same", eligible: true }, { id: "same", eligible: false }], []), /duplicate/);
});

test("F03 V9 graph: missing dependencies stay pending, never pass through notEq or negation", () => {
  const equalsRestaurant = { op: "eq", ref: { question: "niche" }, value: "restaurant" } as const;
  const withoutAnswers = { answers: {} };
  const unknownNiche = { answers: { niche: "unknown" } };
  assert.equal(evaluateV9Rule(equalsRestaurant, withoutAnswers).status, "pending");
  assert.equal(evaluateV9Rule({ op: "not", rule: equalsRestaurant }, withoutAnswers).status, "pending");
  assert.equal(evaluateV9Rule({ op: "notEq", ref: { question: "niche" }, value: "restaurant" }, withoutAnswers).status, "pending");
  assert.equal(evaluateV9Rule({ op: "notEq", ref: { question: "niche" }, value: "restaurant" }, unknownNiche).status, "ineligible");
  assert.equal(evaluateV9Rule(equalsRestaurant, { answers: { niche: "restaurant" } }).status, "eligible");
  assert.equal(evaluateV9Rule(equalsRestaurant, { answers: { niche: "agency" } }).status, "ineligible");

  const conjunction = { op: "and", rules: [equalsRestaurant, { op: "eq", ref: { question: "status" }, value: "operating" }] } as const;
  assert.equal(evaluateV9Rule(conjunction, { answers: { status: "paused" } }).status, "ineligible");
  assert.equal(evaluateV9Rule(conjunction, { answers: { status: "operating" } }).status, "pending");
  assert.equal(evaluateV9Rule({ op: "or", rules: conjunction.rules }, { answers: { status: "paused" } }).status, "pending");
});

test("F03 V9 graph: resolved context, explicit unresolved, and missing context are distinct", () => {
  const active = { op: "contextResolvedIn", field: "activity", values: ["active", "prelaunch"] } as const;
  const missing = { answers: {} };
  assert.equal(evaluateV9Rule(active, missing).status, "pending");
  assert.equal(evaluateV9Rule(active, { answers: {}, context: { fields: { activity: { status: "resolved", value: "active" } } } }).status, "eligible");
  assert.equal(evaluateV9Rule(active, { answers: {}, context: { fields: { activity: { status: "unresolved" } } } }).status, "ineligible");
  const unresolved = { op: "contextUnresolved", field: "activity" } as const;
  assert.equal(evaluateV9Rule(unresolved, missing).status, "pending");
  assert.equal(evaluateV9Rule(unresolved, { answers: {}, context: { fields: { activity: { status: "unresolved" } } } }).status, "eligible");
  assert.equal(evaluateV9Rule({ op: "archetypeIncludes", value: "appointments" }, missing).status, "pending");
  assert.equal(evaluateV9Rule({ op: "archetypeIncludes", value: "appointments" }, { answers: {}, context: { fields: {}, archetypeComponents: ["appointments", "professional"] } }).status, "eligible");
});

test("F03 V9 graph: material-only eligibility is opt-in and pending does not consume budget", () => {
  const material = { id: "offer_clarity", materialAppliesWhen: { op: "eq", ref: { question: "presence" }, value: "partial_presence" } } as const;
  assert.equal(evaluateV9Question(material, { answers: { presence: "partial_presence" } }).source, "material_not_requested");
  assert.equal(evaluateV9Question(material, { answers: { presence: "partial_presence" } }, true).status, "eligible");
  const graph = planV9GraphQuestions([
    { id: "foundation" },
    { id: "specialist", appliesWhen: { op: "eq", ref: { question: "niche" }, value: "restaurant" } },
    material,
  ], { answers: { presence: "partial_presence" } }, [], { materialEvidenceRequested: true });
  assert.deepEqual(graph.selection.selectedIds, ["foundation", "offer_clarity"]);
  assert.equal(graph.evaluations.find((item) => item.id === "specialist")?.status, "pending");
  assert.equal(graph.selection.skipped.find((item) => item.id === "specialist")?.reason, "pending_dependencies");
  assert.equal(graph.selection.remainingBeforeSelection, 24);
  assert.equal(selectV9Questions([{ id: "unknown", eligible: false, pending: true }], []).skipped[0]?.reason, "pending_dependencies");
  assert.throws(() => selectV9Questions([{ id: "invalid", eligible: true, pending: true }], []), /eligible and pending/);
});

test("F03 graph audit: prerequisites precede dependants without rearranging unrelated questions", () => {
  const questions = [
    { id: "assessment", appliesWhen: { op: "and", rules: [
      { op: "eq", ref: { question: "sector" }, value: "food_hospitality" },
      { op: "eq", ref: { question: "niche" }, value: "restaurant" },
    ] } },
    { id: "niche", appliesWhen: { op: "eq", ref: { question: "sector" }, value: "food_hospitality" } },
    { id: "sector" },
    { id: "unrelated" },
  ] as const;
  const audit = inspectV9Graph(questions);
  assert.deepEqual(audit.missingDependencies, []);
  assert.deepEqual(audit.cycles, []);
  assert.deepEqual(audit.orderedIds, ["sector", "niche", "assessment", "unrelated"]);
  assert.deepEqual(orderV9GraphQuestions(questions).map((item) => item.id), audit.orderedIds);
});

test("F03 graph audit: cycles, missing refs and duplicates block activation", () => {
  const cycle = [
    { id: "a", appliesWhen: { op: "eq", ref: { question: "b" }, value: "yes" } },
    { id: "b", appliesWhen: { op: "eq", ref: { question: "a" }, value: "yes" } },
  ] as const;
  assert.deepEqual(inspectV9Graph(cycle).cycles, [["a", "b", "a"]]);
  assert.throws(() => orderV9GraphQuestions(cycle), /cycles/);
  const missing = [{ id: "a", materialAppliesWhen: { op: "eq", ref: { question: "known_external" }, value: "yes" } }] as const;
  assert.deepEqual(inspectV9Graph(missing).missingDependencies, [{ questionId: "a", dependencyId: "known_external" }]);
  assert.throws(() => orderV9GraphQuestions(missing), /missing/);
  assert.deepEqual(inspectV9Graph(missing, ["known_external"]).missingDependencies, []);
  assert.deepEqual(orderV9GraphQuestions(missing, ["known_external"]).map((item) => item.id), ["a"]);
  assert.throws(() => inspectV9Graph([{ id: "a" }, { id: "a" }]), /duplicate/);
  assert.deepEqual(inspectV9Graph([{ id: "self", appliesWhen: { op: "answered", ref: { question: "self" } } }]).cycles, [["self", "self"]]);
});

test("F03 V9 graph: neutral and empty multi-answer cannot authorize a specialist", () => {
  const multi = { op: "multiExcluding", ref: { question: "channels" }, exclude: ["blocked"] } as const;
  assert.equal(evaluateV9Rule(multi, { answers: { channels: [] } }).status, "pending");
  assert.equal(evaluateV9Rule(multi, { answers: { channels: ["unknown"] } }).status, "ineligible");
  assert.equal(evaluateV9Rule(multi, { answers: { channels: ["not_applicable"] } }).status, "ineligible");
  assert.equal(evaluateV9Rule(multi, { answers: { channels: ["website", "unknown"] } }).status, "ineligible");
  assert.equal(evaluateV9Rule(multi, { answers: { channels: ["website"] } }).status, "eligible");
  assert.equal(evaluateV9Rule({ op: "answered", ref: { question: "channels" } }, { answers: { channels: [] } }).status, "pending");
  assert.equal(evaluateV9Rule({ op: "multiIntersects", ref: { question: "channels" }, values: ["website"] }, { answers: { channels: ["website", "unknown"] } }).status, "ineligible");
});
