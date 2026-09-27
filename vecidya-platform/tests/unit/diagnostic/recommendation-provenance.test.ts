import assert from "node:assert/strict";
import { test } from "node:test";

import {
  deriveActiveAnswers,
  deriveContext,
  explainLearnRecommendations,
  explainLicenseRecommendation,
  explainRecommendations,
  explainServiceRecommendations,
  findRecommendationsWithoutProvenance,
  getApplicableQuestions,
  runDiagnostic,
  scoreDimensions,
} from "../../../app/features/diagnostic/index.ts";
import { explainPrioritization, generateIssues, explainStateClassification, toScores } from "../../../app/features/diagnostic/result.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-05 §20-§23: procedencia de recomendaciones. `services`/`learn` citan el hallazgo real
 * que las produjo cuando existe uno (`sourceIssueId`); el fallback sin hallazgo queda marcado
 * como tal (`sourceIssueId: null`), nunca oculto ni inventado. `license`/`addons` derivan de
 * señales de contexto, documentado como tal.
 */

function build(raw: Record<string, string | string[]>) {
  const active = deriveActiveAnswers(raw as never);
  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  const scores = toScores(dimensions);
  const context = deriveContext(active);
  const state = explainStateClassification(context, scores, dimensions).state;
  const priorities = explainPrioritization(generateIssues(context, scores), context)
    .map((trace) => trace.issue)
    .slice(0, 3);
  return { context, scores, state, priorities };
}

test("explainRecommendations().recommendation coincide exactamente con runDiagnostic().recommendation", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { context, scores, state, priorities } = build(raw as Record<string, string | string[]>);
    const { recommendation } = explainRecommendations(context, scores, priorities, state);
    const result = runDiagnostic(raw as never);
    assert.ok(result);
    assert.deepEqual(recommendation, result!.recommendation);
  }
});

test("cada servicio/lectura recomendados con sourceIssueId citan un hallazgo real de las prioridades", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { state, priorities } = build(raw as Record<string, string | string[]>);
    for (const trace of explainServiceRecommendations(priorities, state)) {
      if (trace.sourceIssueId !== null) assert.ok(priorities.some((issue) => issue.id === trace.sourceIssueId), `sourceIssueId ${trace.sourceIssueId} no está entre las prioridades`);
    }
    for (const trace of explainLearnRecommendations(priorities, state)) {
      if (trace.sourceIssueId !== null) assert.ok(priorities.some((issue) => issue.id === trace.sourceIssueId), `sourceIssueId ${trace.sourceIssueId} no está entre las prioridades`);
    }
  }
});

test("el servicio/lectura de relleno sin prioridades queda marcado explícitamente como sin procedencia (sourceIssueId: null)", () => {
  const { state } = build(personas.ideaStage as Record<string, string | string[]>);
  assert.equal(state.id, "inicio", "el fixture debe estar en el estado que activa el fallback de servicio");
  const services = explainServiceRecommendations([], state);
  const learn = explainLearnRecommendations([], state);
  assert.equal(services.length, 1);
  assert.equal(services[0].sourceIssueId, null, "sin prioridades, el servicio de relleno es un fallback declarado, no una recomendación inventada");
  assert.equal(learn.length, 1);
  assert.equal(learn[0].sourceIssueId, null, "sin prioridades, la lectura recomendada es un fallback declarado, no una recomendación inventada");
});

test("foundationalOverrideApplied es verdadero solo cuando la prioridad fundacional real reemplazó Barrio/Ciudad por Cuadra", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { context, scores, priorities } = build(raw as Record<string, string | string[]>);
    const trace = explainLicenseRecommendation(context, scores, priorities);
    if (trace.foundationalOverrideApplied) {
      assert.equal(trace.fit.level, "cuadra");
      assert.equal(priorities[0]?.kind, "foundational");
      assert.equal(priorities[0]?.tentative, false);
    }
  }
});

test("integridad (§23): ninguna recomendación actual carece de procedencia rastreable fuera de los dos fallbacks declarados", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { context, scores, state, priorities } = build(raw as Record<string, string | string[]>);
    const { provenance } = explainRecommendations(context, scores, priorities, state);
    assert.deepEqual(findRecommendationsWithoutProvenance(provenance, state, priorities), [], `recomendación sin procedencia para ${JSON.stringify(raw)}`);
  }
});

test("integridad (§23): el detector no se limita a mirar el ID resultante — vuelve a comprobar la condición real del fallback de forma independiente", () => {
  // Revisión independiente (DIAG-V3-05): un fallback de servicio con el ID legítimo
  // ("estructuracion") pero en un estado que NO es "inicio" no puede ser el fallback conocido —
  // simularía justo el bug de haber perdido el guardia `state.id === "inicio"` en
  // `explainServiceRecommendations`. El detector debe marcarlo aunque el ID sea el correcto.
  const fakeState = { id: "sistema", label: "x", summary: "x", because: [] } as const;
  const fakeProvenance = {
    license: { basis: "context_signals" as const, foundationalOverride: false },
    services: [{ fit: { id: "estructuracion", title: "x", reason: "x" }, sourceIssueId: null }],
    addons: [],
    learn: [],
  };
  assert.deepEqual(findRecommendationsWithoutProvenance(fakeProvenance, fakeState, []), [{ kind: "service", id: "estructuracion" }]);

  // Igual para lectura: un fallback "legítimo" por slug pero con una prioridad real que SÍ tenía
  // un artículo asociado (lo que significa que el fallback nunca debió activarse) debe marcarse.
  const priorityWithLearn = { id: "define_offer", kind: "foundational", dimension: "claridad", severity: 1, priority: 1, tentative: false, title: "x", why: "x", action: "x", learn: "presence" } as const;
  const presenceSlug = "antes-de-hacer-publicidad-organiza-tu-presencia-digital";
  const fakeLearnProvenance = {
    license: { basis: "context_signals" as const, foundationalOverride: false },
    services: [],
    addons: [],
    learn: [{ fit: { slug: presenceSlug, title: "x", reason: "x" }, sourceIssueId: null }],
  };
  assert.deepEqual(findRecommendationsWithoutProvenance(fakeLearnProvenance, fakeState, [priorityWithLearn as never]), [{ kind: "learn", id: presenceSlug }]);
});

test("license y addons declaran su base como señales de contexto, no como un hallazgo puntual inventado", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const { context, scores, state, priorities } = build(raw as Record<string, string | string[]>);
    const { provenance } = explainRecommendations(context, scores, priorities, state);
    assert.equal(provenance.license.basis, "context_signals");
    for (const addon of provenance.addons) assert.equal(addon.basis, "context_signals");
  }
});
