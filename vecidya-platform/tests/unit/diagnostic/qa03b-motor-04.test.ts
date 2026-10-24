import assert from "node:assert/strict";
import test from "node:test";
import { CANDIDATE_CALIBRATION_QUARTILES_V4, classifyCandidateScoreRangeV4 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { displayScoreForBands } from "../../../app/features/diagnostic/qbv2-overall";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

function runVariant(id: string) {
  const variant = QA03B_PROFILE_KNOWLEDGE_VARIANTS.find((candidate) => candidate.id === id);
  assert.ok(variant, `existe la variante ${id}`);
  let answers = {};
  let result: ReturnType<typeof runCandidateDiagnosticPipelineV3> | undefined;
  for (let turn = 0; turn < 30; turn += 1) {
    result = runCandidateDiagnosticPipelineV3(answers, { calibration: CANDIDATE_CALIBRATION_QUARTILES_V4 });
    const questionId = result.plan.nextQuestionId;
    if (!questionId) return result;
    const answer = variant.answerScript[questionId];
    assert.notEqual(answer, undefined, `${id}: respuesta explícita para ${questionId}`);
    answers = { ...result.plan.activeAnswers, [questionId]: answer };
  }
  assert.fail(`${id}: la ruta supera 30 preguntas`);
}

test("DIAG-MOTOR-04: cuatro rangos iguales cubren 0–100 y respetan el entero visible", () => {
  assert.deepEqual(CANDIDATE_CALIBRATION_QUARTILES_V4.scoreRanges.map(({ minimum, maximum }) => [minimum, maximum]), [
    [0, 25], [26, 50], [51, 75], [76, 100],
  ]);
  assert.deepEqual([0, 25, 26, 50, 51, 75, 76, 100].map((score) => classifyCandidateScoreRangeV4(score)), [
    "initial", "initial", "developing", "developing", "functional", "functional", "strong", "strong",
  ]);
  assert.equal(classifyCandidateScoreRangeV4(null), null);
  assert.equal(classifyCandidateScoreRangeV4(-1), null);
  assert.equal(classifyCandidateScoreRangeV4(101), null);
  assert.deepEqual([25.5, 26.5, 50.5, 51.5, 75.5, 76.5].map((score) => displayScoreForBands(score, CANDIDATE_CALIBRATION_QUARTILES_V4.overall.bands)), [25, 27, 50, 52, 75, 77]);
});

test("DIAG-MOTOR-04: conserva la fórmula y suficiencia del candidato mientras añade cuatro rangos", () => {
  assert.equal(CANDIDATE_CALIBRATION_QUARTILES_V4.overall.minScoredDimensions, 3);
  assert.equal(CANDIDATE_CALIBRATION_QUARTILES_V4.overall.minCoverage, 0.6);
  assert.deepEqual(CANDIDATE_CALIBRATION_QUARTILES_V4.scoring, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
  assert.equal(CANDIDATE_CALIBRATION_QUARTILES_V4.overall.bands.developingFrom, 26);
  assert.equal(CANDIDATE_CALIBRATION_QUARTILES_V4.overall.bands.solidFrom, 51);
  assert.equal(CANDIDATE_CALIBRATION_QUARTILES_V4.overall.bands.verySolidFrom, 76);
});

test("DIAG-MOTOR-04: las mismas 60 rutas varían evidencia y cubren resultados puntuables y abstención", () => {
  assert.equal(QA03B_PROFILE_KNOWLEDGE_VARIANTS.length, 60, "la matriz conserva sus 20 × 3 rutas");
  assert.ok(new Set(QA03B_PROFILE_KNOWLEDGE_VARIANTS.map(({ answerScript }) => JSON.stringify(answerScript))).size > 49,
    "la variabilidad supera la matriz original de 49 patrones");
  const results = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map(({ id }) => ({ id, result: runVariant(id) }));
  assert.ok(results.some(({ result }) => result.overall.index.displayScore === null), "la falta de evidencia conserva la abstención");
  assert.ok(results.every(({ result }) => result.overall.index.displayScore === null), "ninguna ruta convierte las respuestas insuficientes en porcentaje");
  assert.ok(results.every(({ result }) => result.overall.scoreRange === null), "sin índice no hay clasificación de rango");
  assert.ok(results.every(({ result }) => result.engineIdentity.calibration === CANDIDATE_CALIBRATION_QUARTILES_V4.identity));
});

test("DIAG-MOTOR-04: desconocido y no aplicable no se convierten en cero puntuable", () => {
  const unknown = runVariant("P01-desconocedor");
  assert.equal(unknown.overall.index.displayScore, null);
  assert.ok(unknown.scoring.dimensions.every((dimension) => dimension.score === null || dimension.state !== "uncertainty"));
});
