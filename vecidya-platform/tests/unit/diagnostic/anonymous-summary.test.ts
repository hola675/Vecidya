import assert from "node:assert/strict";
import { test } from "node:test";

import { isAnonymousDiagnosticSummaryV1 } from "../../../app/features/diagnostic/anonymous-summary.ts";
import { toAnonymousDiagnosticSummaryV1 } from "../../../app/features/diagnostic/anonymous-summary.server.ts";
import { GOLDEN_PERSONAS, runDiagnosticPipelineV3, runGoldenPersonaPipeline, type AnswersV2 } from "../../../app/features/diagnostic/index.ts";

const results = GOLDEN_PERSONAS.map((persona) => ({
  id: persona.id,
  result: runDiagnosticPipelineV3(runGoldenPersonaPipeline(persona).answers as AnswersV2),
}));
const keys = ["version", "score", "state", "confidence", "preliminary", "headline", "currentState", "focus", "firstAction", "coverageNote", "confidenceNote"];

test("anonymous summary: every active V3 golden maps to the exact allowlist", () => {
  for (const { id, result } of results) {
    const summary = toAnonymousDiagnosticSummaryV1(result);
    assert.deepEqual(Object.keys(summary), keys, `${id}: closed DTO keys`);
    assert.equal(summary.version, 1, `${id}: summary contract version`);
    assert.equal(summary.score, result.outcome.overall.index.displayScore, `${id}: score remains unchanged, including null`);
    assert.equal(summary.state, result.outcome.overall.state, `${id}: state`);
    assert.equal(summary.confidence, result.outcome.overall.confidence.level, `${id}: confidence`);
    assert.ok(isAnonymousDiagnosticSummaryV1(summary), `${id}: client contract accepts mapper output`);
    for (const forbidden of ["dimensions", "evidence", "recommendations", "offers", "help", "commercialRecommendation", "risks", "fullReport"]) {
      assert.ok(!(forbidden in summary), `${id}: excludes ${forbidden}`);
    }
  }
  assert.ok(results.some(({ result }) => toAnonymousDiagnosticSummaryV1(result).score === null), "fixtures exercise score absent");
});

test("anonymous summary: a real high score with limited evidence is explicitly preliminary", () => {
  const { id, result } = results.find(({ result }) => result.outcome.overall.index.displayScore === 82 && result.outcome.overall.confidence.level === "low")!;
  const summary = toAnonymousDiagnosticSummaryV1(result);
  assert.equal(id, "physical_retail");
  assert.equal(summary.score, 82, "do not alter the engine-calculated percentage");
  assert.equal(summary.preliminary, true);
  assert.match(summary.confidenceNote, /porcentaje pueda ser alto.*evidencia disponible es limitada.*no como una evaluación confirmada/i);
});

test("anonymous summary: the validator rejects malformed and expanded DTOs", () => {
  const summary = toAnonymousDiagnosticSummaryV1(results[0]!.result);
  assert.equal(isAnonymousDiagnosticSummaryV1({ ...summary, dimensions: [] }), false);
  assert.equal(isAnonymousDiagnosticSummaryV1({ ...summary, focus: { ...summary.focus, evidence: [] } }), false);
  assert.equal(isAnonymousDiagnosticSummaryV1({ ...summary, version: 2 }), false);
  assert.equal(isAnonymousDiagnosticSummaryV1({ ...summary, score: Number.NaN }), false);
});
