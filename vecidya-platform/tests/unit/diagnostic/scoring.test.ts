import assert from "node:assert/strict";
import { test } from "node:test";

import { computeOverallScore, runDiagnostic, visualStatusFor, visualStatusLabels, type DiagnosticResult } from "../../../app/features/diagnostic/index.ts";
import { personas } from "./personas.ts";

const run = (answers: Record<string, string | string[]>): DiagnosticResult => {
  const result = runDiagnostic(answers);
  assert.ok(result, "el diagnóstico debe producir resultado con perfil válido");
  return result;
};

const score = (result: DiagnosticResult, dimension: string) => result.dimensions.find((item) => item.id === dimension)?.score ?? null;

test("las puntuaciones están acotadas en [0, 100] o son null sin evidencia; nunca NaN", () => {
  for (const [name, answers] of Object.entries(personas)) {
    const result = run(answers);
    for (const dimension of result.dimensions) {
      if (dimension.score === null) continue;
      assert.ok(Number.isInteger(dimension.score) && dimension.score >= 0 && dimension.score <= 100, `${name}/${dimension.id}=${dimension.score}`);
    }
  }
});

test("el resultado es determinista", () => {
  for (const answers of Object.values(personas)) {
    assert.deepEqual(run(answers), run({ ...answers }));
    assert.deepEqual(run(answers), run(JSON.parse(JSON.stringify(answers))));
  }
});

test("«no lo sé» no equivale a «no»: no puntúa y reduce la confianza", () => {
  const base = personas.localBusinessLeaks;
  const no = run({ ...base, capture: "no" });
  const unknown = run({ ...base, capture: "unknown" });
  assert.notEqual(score(no, "seguimiento"), score(unknown, "seguimiento"));
  assert.ok((score(unknown, "seguimiento") ?? 0) > (score(no, "seguimiento") ?? 0), "no saber no debe puntuar como ausencia");
  assert.ok(unknown.confidence.unknown > no.confidence.unknown);
  assert.ok(unknown.confidence.reasons.some((reason) => reason.includes("no lo sé")));
  assert.ok(unknown.priorities.concat(unknown.gaps).some((issue) => issue.id === "capture_inquiries" && issue.tentative), "la incertidumbre genera un hallazgo tentativo");
});

test("«no aplica» no penaliza ni afecta la confianza", () => {
  const base = personas.growingBusinessManual;
  const withNa = run({ ...base, pipeline: "na", post_sale: "na" });
  const withYes = run({ ...base, pipeline: "tool", post_sale: "regular" });
  const without = run({ ...base, pipeline: "na", post_sale: "na" });
  assert.equal(withNa.confidence.level, withYes.confidence.level);
  assert.equal(withNa.confidence.unknown, 0);
  assert.deepEqual(withNa, without);
  assert.ok((score(withNa, "seguimiento") ?? 0) >= 65, "pipeline no aplica no debe hundir seguimiento");
  assert.ok(!withNa.priorities.some((issue) => issue.id === "track_pipeline" || issue.id === "post_sale_loop"));
});

test("una respuesta a una pregunta no aplicable no modifica el resultado", () => {
  const base = personas.professionalReputation;
  const polluted = { ...base, audience: "none", reach: "nobody", responsibilities: "no", proof_creator: ["none"] };
  assert.deepEqual(run(polluted), run(base));
});

test("una dimensión sin evidencia aplicable se reporta como null y no como 0", () => {
  const idea = run(personas.ideaStage);
  for (const id of ["contacto", "seguimiento", "medicion"]) {
    const dimension = idea.dimensions.find((item) => item.id === id);
    assert.equal(dimension?.score, null, `${id} no tiene evidencia en etapa idea`);
    assert.equal(dimension?.level, null);
  }
  assert.equal(score(idea, "presencia"), 0, "«nada de esto» sí es evidencia sustantiva de ausencia");
});

test("más activos y mejor proceso producen puntuaciones mayores (monotonía básica)", () => {
  const weak = run(personas.localBusinessLeaks);
  const strong = run(personas.growingBusinessManual);
  for (const dimension of ["presencia", "contacto", "seguimiento", "medicion"]) {
    assert.ok((score(strong, dimension) ?? 0) > (score(weak, dimension) ?? 0), `${dimension}: ${score(strong, dimension)} > ${score(weak, dimension)}`);
  }
});

test("la confianza refleja cobertura y dudas, no la calidad del negocio", () => {
  const complete = run(personas.growingBusinessManual);
  assert.equal(complete.confidence.level, "alta");
  assert.equal(complete.confidence.answered, complete.confidence.applicable);

  const doubtful = run({ ...personas.localBusinessLeaks, capture: "unknown", response: "unknown", follow_up: "unknown", discoverability: "unknown" });
  assert.notEqual(doubtful.confidence.level, "alta", "varias dudas en preguntas clave no permiten confianza alta");
  assert.ok(doubtful.confidence.reasons.some((reason) => reason.includes("no lo sé")));

  const veryDoubtful = run({ ...personas.localBusinessLeaks, capture: "unknown", response: "unknown", follow_up: "unknown", discoverability: "unknown", responsibilities: "unknown", clarity_presence: "unknown" });
  assert.equal(veryDoubtful.confidence.level, "baja");
  assert.ok(veryDoubtful.nextActions.some((action) => action.text.includes("dudas")));

  const partial = run({ profile: "business", goal: "organize", stage: "regular", team: "small", assets: ["website"] });
  assert.equal(partial.confidence.level, "baja");
  assert.ok(partial.confidence.answered < partial.confidence.applicable);
});

// DIAG-003: clasificación visual de apoyo (0-49 prioridad, 50-74 en desarrollo, 75-100 buen estado)
// y puntuación general 0-100. No sustituyen el porcentaje ni el nivel de 4 niveles ya existente.

test("visualStatusFor clasifica en los tres tramos exactos, con los límites 49/50 y 74/75", () => {
  assert.equal(visualStatusFor(0), "priority");
  assert.equal(visualStatusFor(49), "priority");
  assert.equal(visualStatusFor(50), "developing");
  assert.equal(visualStatusFor(74), "developing");
  assert.equal(visualStatusFor(75), "healthy");
  assert.equal(visualStatusFor(100), "healthy");
});

test("visualStatusLabels cubre los tres estados en español", () => {
  assert.equal(visualStatusLabels.priority, "Prioridad");
  assert.equal(visualStatusLabels.developing, "En desarrollo");
  assert.equal(visualStatusLabels.healthy, "Buen estado");
});

test("computeOverallScore: todas las dimensiones en el mismo valor da ese mismo valor", () => {
  const dimensions = ["claridad", "presencia", "alcance", "confianza", "contacto", "seguimiento", "medicion"].map((id) => ({
    id: id as never, label: id, score: 70, level: "solida" as const, evidence: 2, unknown: 0,
  }));
  assert.equal(computeOverallScore(dimensions), 70);
});

test("computeOverallScore: mínimo y máximo posibles", () => {
  const at = (value: number) => [{ id: "claridad" as const, label: "Claridad", score: value, level: "inicial" as const, evidence: 3, unknown: 0 }];
  assert.equal(computeOverallScore(at(0)), 0);
  assert.equal(computeOverallScore(at(100)), 100);
});

test("computeOverallScore: se pondera por evidencia, no es un promedio simple", () => {
  const dimensions = [
    { id: "claridad" as const, label: "Claridad", score: 100, level: "consolidada" as const, evidence: 1, unknown: 0 },
    { id: "presencia" as const, label: "Presencia", score: 0, level: "inicial" as const, evidence: 4, unknown: 0 },
  ];
  // (100*1 + 0*4) / (1+4) = 20, no (100+0)/2 = 50.
  assert.equal(computeOverallScore(dimensions), 20);
});

test("computeOverallScore: una dimensión sin evidencia (score null) no participa", () => {
  const dimensions = [
    { id: "claridad" as const, label: "Claridad", score: 80, level: "solida" as const, evidence: 2, unknown: 0 },
    { id: "medicion" as const, label: "Medición", score: null, level: null, evidence: 0, unknown: 0 },
  ];
  assert.equal(computeOverallScore(dimensions), 80);
});

test("computeOverallScore: sin ninguna dimensión con evidencia, da 0 y no NaN", () => {
  const dimensions = [{ id: "claridad" as const, label: "Claridad", score: null, level: null, evidence: 0, unknown: 0 }];
  assert.equal(computeOverallScore(dimensions), 0);
});

test("una dimensión crítica sigue siendo prioridad aunque el resultado general sea alto: el promedio no la esconde", () => {
  // Base: las 7 dimensiones en 100 (growingBusinessManual). Se anula solo la prueba pública y los
  // activos que aportan confianza, para que esa única dimensión caiga y el resto se mantenga fuerte.
  const result = run({ ...personas.growingBusinessManual, proof_business: ["none"], assets: ["website", "google", "social"] });
  const confianza = score(result, "confianza");
  assert.ok(confianza !== null && confianza < 50, `confianza debería ser baja (real: ${confianza})`);
  assert.equal(visualStatusFor(confianza!), "priority");
  assert.equal(visualStatusFor(result.overallScore), "healthy", `el general (${result.overallScore}) debería seguir en buen estado`);
  assert.ok(result.overallScore > confianza! + 40, `el general (${result.overallScore}) debería quedar muy por encima de confianza (${confianza}), no arrastrado por ella`);
});

test("overallScore está en el resultado, acotado en [0, 100] y coincide con computeOverallScore(dimensions)", () => {
  for (const answers of Object.values(personas)) {
    const result = run(answers);
    assert.ok(Number.isInteger(result.overallScore) && result.overallScore >= 0 && result.overallScore <= 100);
    assert.equal(result.overallScore, computeOverallScore(result.dimensions));
  }
});
