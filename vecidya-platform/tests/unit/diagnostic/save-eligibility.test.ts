import assert from "node:assert/strict";
import { test } from "node:test";

import { getApplicableQuestions } from "../../../app/features/diagnostic/answers.ts";
import { canOfferSaveForLater } from "../../../app/features/diagnostic/save-eligibility.ts";
import type { Answers } from "../../../app/features/diagnostic/types.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-07 §4: condición determinista de elegibilidad de "Guardar para después". El denominador es
 * el recorrido REAL (preguntas aplicables con el estado actual), no un conteo fijo — estas pruebas no
 * fijan un porcentaje literal contra el banco de preguntas actual, para no acoplarse a su tamaño.
 */

/** Responde exactamente `count` preguntas aplicables, en el mismo orden que seguiría la UI real. */
function answeredPrefix(persona: Answers, count: number): Answers {
  let current: Answers = {};
  for (let index = 0; index < count; index += 1) {
    const applicable = getApplicableQuestions(current);
    const next = applicable.find((question) => current[question.id] === undefined);
    if (!next) break;
    current = { ...current, [next.id]: persona[next.id as keyof Answers] } as Answers;
  }
  return current;
}

test("sin ninguna respuesta, no es elegible", () => {
  assert.equal(canOfferSaveForLater({}), false);
});

test("solo con perfil elegido (sin goal/stage), no es elegible aunque avance el conteo", () => {
  const onlyProfile = answeredPrefix(personas.professionalReputation, 1);
  assert.equal(canOfferSaveForLater(onlyProfile), false);
});

test("profile/goal/stage resueltos pero sin progreso adicional, todavía no es elegible", () => {
  const core = answeredPrefix(personas.professionalReputation, 3);
  assert.equal(canOfferSaveForLater(core), false);
});

test("una persona completa (100% de lo aplicable respondido) siempre es elegible", () => {
  for (const persona of Object.values(personas)) {
    assert.equal(canOfferSaveForLater(persona), true, "una persona con todas sus preguntas aplicables respondidas debe ser elegible");
  }
});

test("sin goal resuelto, no es elegible aunque el resto de la persona esté completo", () => {
  const { goal: _goal, ...withoutGoal } = personas.professionalReputation;
  assert.equal(canOfferSaveForLater(withoutGoal as Answers), false);
});

test("sin stage resuelto, no es elegible aunque el resto de la persona esté completo", () => {
  const { stage: _stage, ...withoutStage } = personas.professionalReputation;
  assert.equal(canOfferSaveForLater(withoutStage as Answers), false);
});

test("es determinista: la misma entrada produce siempre la misma salida", () => {
  const persona = personas.localBusinessLeaks;
  const first = canOfferSaveForLater(persona);
  const second = canOfferSaveForLater({ ...persona });
  assert.equal(first, second);
});
