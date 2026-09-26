import assert from "node:assert/strict";
import { test } from "node:test";

import {
  collectEvidence,
  computeDimensionConfidenceInputs,
  computeOverallScore,
  deriveActiveAnswers,
  deriveContext,
  dimensionOrder,
  explainDimensionScore,
  explainOverallScore,
  getApplicableQuestions,
  getQuestion,
  QUESTION_DEFINITIONS,
  runDiagnostic,
  scoreDimensions,
} from "../../../app/features/diagnostic/index.ts";
import { classifyState, toScores } from "../../../app/features/diagnostic/result.ts";
import { questionContribution } from "../../../app/features/diagnostic/scoring.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-04: trazas de scoring (`explainDimensionScore`, `explainOverallScore`) y los insumos
 * de confianza por dimensión (`computeDimensionConfidenceInputs`). Cada traza se deriva del MISMO
 * cálculo que ya produce `scoreDimensions`/`computeOverallScore`, nunca de una segunda
 * implementación (spec §18/§19) — las pruebas de paridad de esta tarea son la prueba de eso.
 */

test("explainDimensionScore coincide exactamente con scoreDimensions para las 7 dimensiones, sobre todas las personas reales", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const active = deriveActiveAnswers(raw);
    const applicable = getApplicableQuestions(active);
    const scored = scoreDimensions(active, applicable);
    for (const dimension of dimensionOrder) {
      const trace = explainDimensionScore(dimension, active, applicable);
      const expected = scored.find((entry) => entry.id === dimension)!;
      assert.equal(trace.score, expected.score, `${dimension}: score no coincide`);
      assert.equal(Math.round(trace.weight * 100) / 100, expected.evidence, `${dimension}: evidence/weight no coincide`);
      assert.equal(trace.unknownQuestionIds.length, expected.unknown, `${dimension}: unknown no coincide`);
    }
  }
});

test("explainOverallScore().value coincide exactamente con computeOverallScore(), y runDiagnostic sigue igual", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const active = deriveActiveAnswers(raw);
    const applicable = getApplicableQuestions(active);
    const dimensions = scoreDimensions(active, applicable);
    const trace = explainOverallScore(dimensions);
    assert.equal(trace.value, computeOverallScore(dimensions));
    const result = runDiagnostic(raw);
    if (result) assert.equal(result.overallScore, trace.value);
  }
});

test("computeDimensionConfidenceInputs expone insumos, no una fórmula nueva de confianza", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "regular", sources: ["social"], capture: "unknown" } as never);
  const applicable = getApplicableQuestions(active);
  const inputs = computeDimensionConfidenceInputs("seguimiento", active, applicable, 0);
  assert.equal(typeof inputs.evidenceCount, "number");
  assert.equal(typeof inputs.applicableCount, "number");
  assert.equal(typeof inputs.unknownCount, "number");
  assert.equal(typeof inputs.coverage, "number");
  assert.ok(!("level" in inputs), "no debe existir un nivel de confianza calculado: solo insumos");
});

test("coverage = 0 si no hay preguntas aplicables para la dimensión", () => {
  const active = deriveActiveAnswers({ profile: "creator", stage: "idea" } as never);
  const applicable = getApplicableQuestions(active);
  const inputs = computeDimensionConfidenceInputs("medicion", active, applicable, 0);
  assert.equal(inputs.applicableCount, 0);
  assert.equal(inputs.coverage, 0);
});

test("coverage: «no aplica» se excluye por completo del denominador (no penaliza, revisión final)", () => {
  // seguimiento: capture/response/follow_up/post_sale responden con valor real; pipeline="na".
  // Sin la corrección de revisión, pipeline contaba en el denominador (5) pero nunca en el
  // numerador → coverage 4/5 = 0.8, contradiciendo "N/A no afecta la confianza". Con la
  // corrección, pipeline queda fuera del denominador → coverage 4/4 = 1.
  const active = deriveActiveAnswers({
    profile: "business",
    stage: "growing",
    sources: ["social"],
    capture: "always",
    response: "hour",
    follow_up: "system",
    pipeline: "na",
    post_sale: "regular",
  } as never);
  const applicable = getApplicableQuestions(active);
  const inputs = computeDimensionConfidenceInputs("seguimiento", active, applicable, 0);
  assert.equal(inputs.applicableCount, 4, "pipeline (na) no debe contarse en el denominador");
  assert.equal(inputs.evidenceCount, 4);
  assert.equal(inputs.coverage, 1);
});

test("coverage: «no lo sé» cuenta en el numerador junto a la evidencia real (igual que computeConfidence trata «respondida»)", () => {
  const active = deriveActiveAnswers({
    profile: "business",
    stage: "growing",
    sources: ["social"],
    capture: "always",
    response: "unknown",
    follow_up: "system",
    pipeline: "na",
    post_sale: "regular",
  } as never);
  const applicable = getApplicableQuestions(active);
  const inputs = computeDimensionConfidenceInputs("seguimiento", active, applicable, 0);
  assert.equal(inputs.applicableCount, 4, "pipeline (na) sigue excluido; response sí cuenta (no es na)");
  assert.equal(inputs.evidenceCount, 3, "response=unknown no aporta evidencia real");
  assert.equal(inputs.unknownCount, 1);
  assert.equal(inputs.coverage, 1, "(evidenceCount + unknownCount) / applicableCount = (3+1)/4");
});

test("orden independiente: scoreDimensions y collectEvidence no dependen del orden de claves de activeAnswers", () => {
  // A propósito NO se vuelve a pasar por `deriveActiveAnswers` para la segunda variante: esa
  // función ya normaliza el orden de claves al reconstruir `next` iterando `applicable` (orden
  // fijo del registro), así que comparar dos llamadas a `deriveActiveAnswers` con distinto orden
  // de entrada no demuestra nada (ambas salidas ya tendrían el mismo orden). Aquí se compara
  // directamente `scoreDimensions`/`collectEvidence` sobre el MISMO objeto activo, una vez con sus
  // claves en orden normal y una vez invertidas.
  const active = deriveActiveAnswers({ profile: "business", stage: "regular", assets: ["domain", "website"], control: "yes" } as never);
  const reversedKeys = Object.fromEntries(Object.entries(active).reverse()) as typeof active;
  const applicable = getApplicableQuestions(active);
  assert.deepEqual(scoreDimensions(active, applicable), scoreDimensions(reversedKeys, applicable));
  assert.deepEqual(collectEvidence(active, applicable), collectEvidence(reversedKeys, applicable));
});

test("determinismo: mismas respuestas activas, mismas evidencias/puntuaciones en 10 corridas", () => {
  const active = deriveActiveAnswers({ profile: "professional", stage: "growing", proof_professional: ["portfolio", "reviews"] } as never);
  const applicable = getApplicableQuestions(active);
  const runs = Array.from({ length: 10 }, () => JSON.stringify({ dims: scoreDimensions(active, applicable), evidence: collectEvidence(active, applicable) }));
  assert.ok(runs.every((run) => run === runs[0]));
});

test("BUG-01 caracterizado: clarityWeak fuerza «base» sin importar contacto/seguimiento (|| true)", () => {
  // claridad débil + consultas llegando + contacto y seguimiento fuertes (sin fuga severa):
  // sin el `|| true`, este caso caería en el bloque `if (inquiries)` y podría clasificar como
  // sistema/consolidado. Con el código actual, clarityWeak SIEMPRE fuerza "base".
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
  const state = classifyState(context, scores, dimensions);
  assert.equal(scores.claridad !== null && scores.claridad < 35, true, "el fixture debe producir claridad débil de verdad");
  assert.equal(state.id, "base", "clarityWeak fuerza «base» por el `|| true`, incluso con contacto/seguimiento fuertes");
});

test("invariante 1: N/A nunca penaliza (no aporta evidencia con value=0 a scoring)", () => {
  const pipeline = getQuestion("pipeline")!;
  const withNA = questionContribution(pipeline, "na");
  assert.deepEqual(withNA.evidence, {});
  assert.equal(withNA.notApplicable, true);
});

test("invariante 2: «no lo sé» no penaliza el score cuando corresponde (unknownFor, no evidence en 0)", () => {
  const capture = getQuestion("capture")!;
  const withUnknown = questionContribution(capture, "unknown");
  assert.deepEqual(withUnknown.evidence, {});
  assert.equal(withUnknown.unknown, true);
});

test("invariante 3: solo dimensiones con evidencia (weight >= MIN_EVIDENCE) tienen score numérico", () => {
  const active = deriveActiveAnswers({ profile: "creator", stage: "idea" } as never);
  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  for (const dimension of dimensions) assert.equal(dimension.score === null, dimension.evidence < 1);
});

test("invariantes 4 y 5: score y overall siempre en [0,100]", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const active = deriveActiveAnswers(raw);
    const applicable = getApplicableQuestions(active);
    const dimensions = scoreDimensions(active, applicable);
    for (const dimension of dimensions) if (dimension.score !== null) assert.ok(dimension.score >= 0 && dimension.score <= 100);
    assert.ok(computeOverallScore(dimensions) >= 0 && computeOverallScore(dimensions) <= 100);
  }
});

test("invariante 6: misma entrada, mismo resultado (cubierto también por el test de determinismo)", () => {
  const active = deriveActiveAnswers({ profile: "organization", stage: "regular", sources: ["social"] } as never);
  const applicable = getApplicableQuestions(active);
  assert.deepEqual(scoreDimensions(active, applicable), scoreDimensions(active, applicable));
});

test("invariantes 7, 8, 9: toda evidencia referencia una pregunta, respuesta y dimensión reales", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "growing", assets: ["domain"], control: "yes", sources: ["social"] } as never);
  const applicable = getApplicableQuestions(active);
  const evidences = collectEvidence(active, applicable);
  const questionIds = new Set(QUESTION_DEFINITIONS.map((definition) => definition.id));
  for (const evidence of evidences) {
    assert.ok(questionIds.has(evidence.source.question.id));
    const question = getQuestion(evidence.source.question.id)!;
    for (const value of evidence.source.answer) assert.ok(question.options.some((option) => option.value === value));
    assert.ok(dimensionOrder.includes(evidence.dimension as never));
  }
});

test("invariantes 10 y 11: una respuesta invalidada por routing no produce evidencia activa ni puntúa", () => {
  const raw = { profile: "business", stage: "growing", sources: ["social"], capture: "always" } as never;
  const regressed = deriveActiveAnswers({ ...raw, stage: "idea" } as never);
  assert.equal(regressed.capture, undefined);
  const applicable = getApplicableQuestions(regressed);
  assert.ok(!applicable.some((question) => question.id === "capture"));
});

test("invariante 12: un porcentaje puede rastrearse hasta sus contribuciones (trace no vacío cuando hay evidencia)", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "growing", assets: ["domain"], control: "yes" } as never);
  const applicable = getApplicableQuestions(active);
  const trace = explainDimensionScore("presencia", active, applicable);
  assert.ok(trace.score !== null);
  assert.ok(trace.entries.length > 0);
  assert.ok(trace.entries.some((entry) => entry.questionId === "control"));
});
