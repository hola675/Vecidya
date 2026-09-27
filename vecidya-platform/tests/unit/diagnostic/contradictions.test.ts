import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveActiveAnswers, deriveContext, goalIds, profileIds, runDiagnostic, stageIds, teamIds } from "../../../app/features/diagnostic/index.ts";
import { detectContradictions, explainContradictions, type ContradictionId } from "../../../app/features/diagnostic/result.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-05 §15: las tres contradicciones formalizadas con ID estable. `detectContradictions`
 * (usada por `computeConfidence`) es un envoltorio de `explainContradictions`: mismos mensajes,
 * mismo orden, detección/peso/copy intactos.
 */

const KNOWN_IDS: ContradictionId[] = ["idea_with_prior_sale", "established_without_sources", "clear_presence_unclear_offer"];

function contextFor(raw: Record<string, string | string[]>) {
  return deriveContext(deriveActiveAnswers(raw as never));
}

test("detectContradictions(context) === explainContradictions(context).map(f => f.message), para todas las personas y un barrido", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const context = contextFor(raw as Record<string, string | string[]>);
    assert.deepEqual(detectContradictions(context), explainContradictions(context).map((fact) => fact.message));
  }

  let seed = 20260928;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      for (const team of teamIds) {
        for (const goal of goalIds) {
          const answers: Record<string, string | string[]> = {
            profile,
            stage,
            team,
            goal,
            validation: random() < 0.5 ? "first" : "none",
            sources: random() < 0.5 ? ["none"] : ["social"],
            clarity_presence: random() < 0.5 ? "yes" : "no",
            offer_clarity: random() < 0.5 ? "no" : "yes",
          };
          const context = contextFor(answers);
          assert.deepEqual(detectContradictions(context), explainContradictions(context).map((fact) => fact.message));
        }
      }
    }
  }
});

test("explainContradictions produce únicamente IDs conocidos, sin duplicados, y no inventa contradicciones nuevas", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const context = contextFor(raw as Record<string, string | string[]>);
    const facts = explainContradictions(context);
    const ids = facts.map((fact) => fact.id);
    assert.deepEqual(new Set(ids).size, ids.length, "sin IDs duplicados");
    for (const id of ids) assert.ok(KNOWN_IDS.includes(id), `ID de contradicción desconocido: ${id}`);
  }
});

test("cada contradicción declarada cita las respuestas reales que la originan (provenance)", () => {
  const context = contextFor({ profile: "business", stage: "idea", validation: "first" } as Record<string, string | string[]>);
  const facts = explainContradictions(context);
  const ideaWithSale = facts.find((fact) => fact.id === "idea_with_prior_sale");
  assert.ok(ideaWithSale);
  assert.ok(ideaWithSale!.inputs.some((input) => input.questionId === "stage" && input.value === "idea"));
  assert.ok(ideaWithSale!.inputs.some((input) => input.questionId === "validation" && input.value === "first"));
});

test("una contradicción declarada nunca permite confianza alta y queda explicada en las razones (comportamiento sin cambios)", () => {
  const answers = { profile: "business", stage: "idea", validation: "first" } as Record<string, string | string[]>;
  const context = contextFor(answers);
  const facts = explainContradictions(context);
  assert.ok(facts.length >= 1);
  const result = runDiagnostic(answers as never);
  assert.ok(result);
  assert.notEqual(result!.confidence.level, "alta");
  assert.ok(facts.every((fact) => result!.confidence.reasons.includes(fact.message)));
});
