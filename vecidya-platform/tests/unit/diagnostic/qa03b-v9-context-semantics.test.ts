import assert from "node:assert/strict";
import test from "node:test";
import { classifyV9Activity, evaluateV9TrendCapacityGate, interpretV9AnswerState, interpretV9SelectedOption } from "../../../app/features/diagnostic/qa03b/v9-context-semantics.ts";

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
