import assert from "node:assert/strict";
import test from "node:test";
import { selectV9Questions } from "../../../app/features/diagnostic/v9/question-selection.ts";
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
