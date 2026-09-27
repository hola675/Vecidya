import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveActiveAnswers, deriveContext, getApplicableQuestions, goalIds, profileIds, scoreDimensions, stageIds, teamIds } from "../../../app/features/diagnostic/index.ts";
import { classifyState, explainStateClassification, toScores, type StateRuleId } from "../../../app/features/diagnostic/result.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-05 §8/§9: `explainStateClassification` es la única evaluación real de estado;
 * `classifyState` es un envoltorio de `.state`. Estas pruebas verifican paridad (nunca dos
 * cálculos que puedan divergir), que cada regla evaluada queda registrada en orden, y que
 * `DIAG-V3-BUG-01` sigue caracterizado (CHARACTERIZED / NOT FIXED), no corregido ni reinterpretado.
 */

function classify(raw: Record<string, string | string[]>) {
  const active = deriveActiveAnswers(raw as never);
  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  const scores = toScores(dimensions);
  const context = deriveContext(active);
  return { context, scores, dimensions };
}

test("explainStateClassification().state coincide exactamente con classifyState para todas las personas reales y adversariales", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { context, scores, dimensions } = classify(raw as Record<string, string | string[]>);
    const trace = explainStateClassification(context, scores, dimensions);
    const direct = classifyState(context, scores, dimensions);
    assert.deepEqual(trace.state, direct);
  }
});

test("explainStateClassification().state coincide con classifyState sobre un barrido determinista de combinaciones", () => {
  let seed = 20260927;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let runs = 0;
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      for (const team of teamIds) {
        for (const goal of goalIds) {
          const answers: Record<string, string | string[]> = { profile, stage, team, goal };
          for (let iteration = 0; iteration < 6; iteration += 1) {
            for (const question of getApplicableQuestions(answers as never)) {
              if (answers[question.id] !== undefined) continue;
              const options = question.options;
              if (question.type === "single") {
                answers[question.id] = options[Math.floor(random() * options.length)].value;
              } else {
                const picked = options.filter(() => random() < 0.4).map((option) => option.value);
                answers[question.id] = picked.length ? picked : [options[0].value];
              }
            }
          }
          const { context, scores, dimensions } = classify(answers);
          assert.deepEqual(explainStateClassification(context, scores, dimensions).state, classifyState(context, scores, dimensions));
          runs += 1;
        }
      }
    }
  }
  assert.equal(runs, profileIds.length * stageIds.length * teamIds.length * goalIds.length);
});

test("cada regla de estado queda registrada en `observations`, en el mismo orden para cualquier caso", () => {
  const expectedOrder: StateRuleId[] = [
    "not_operating",
    "clarity_weak",
    "inquiries_core_uncertain",
    "inquiries_severe_leak",
    "no_inquiries_base",
    "presence_weak_base",
    "growth_gap",
    "consolidated",
  ];
  for (const raw of Object.values(personas)) {
    const { context, scores, dimensions } = classify(raw as Record<string, string | string[]>);
    const trace = explainStateClassification(context, scores, dimensions);
    const seen = trace.observations.map((observation) => observation.id);
    // El orden observado es siempre un prefijo del orden canónico: la evaluación se corta en la
    // primera regla que empareja (o en `not_operating`, que no continúa evaluando el resto).
    assert.deepEqual(seen, expectedOrder.slice(0, seen.length), `orden inesperado para ${JSON.stringify(raw)}: ${seen.join(",")}`);
    assert.ok(seen.includes(trace.winningRule), "la regla ganadora debe estar entre las observadas");
    const winning = trace.observations.find((observation) => observation.id === trace.winningRule);
    assert.equal(winning?.matched, true, "la regla ganadora debe estar marcada como emparejada");
  }
});

test("DIAG-V3-BUG-01: sigue CHARACTERIZED / NOT FIXED — el `|| true` fuerza «base» incluso cuando el resto de la condición sería falso", () => {
  const active = deriveActiveAnswers({
    profile: "business",
    stage: "growing",
    assets: ["domain"],
    clarity_presence: "no",
    sources: ["social", "google"],
    contact_path: "one",
    capture: "always",
    response: "hour",
    follow_up: "system",
  } as never);
  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  const scores = toScores(dimensions);
  const context = deriveContext(active);
  const trace = explainStateClassification(context, scores, dimensions);

  assert.equal(scores.claridad !== null && scores.claridad < 35, true, "el fixture debe producir claridad débil de verdad");
  assert.equal(trace.winningRule, "clarity_weak");
  assert.equal(trace.state.id, "base");
  assert.equal(trace.bug01.clarityWeak, true, "la condición real (sin el bug) sí detecta claridad débil");
  assert.equal(trace.bug01.conditionWithoutBug, false, "contrafactual sin `|| true`: contacto y seguimiento fuertes, sí hay consultas → sería falso");
  assert.equal(trace.bug01.matchedWithBug, true, "con el `|| true` la rama siempre empareja cuando clarityWeak es verdadero");
  assert.equal(trace.bug01.changedOutcome, true, "el bug cambia el resultado: sin él, este caso no habría clasificado como «base» por esta regla");
});

test("DIAG-V3-BUG-01: cuando clarityWeak es falso, el trace no reporta ningún efecto del bug", () => {
  for (const raw of Object.values(personas)) {
    const { context, scores, dimensions } = classify(raw as Record<string, string | string[]>);
    const trace = explainStateClassification(context, scores, dimensions);
    if (!trace.bug01.clarityWeak) {
      assert.equal(trace.bug01.changedOutcome, false);
      assert.equal(trace.bug01.matchedWithBug, false);
    }
  }
});
