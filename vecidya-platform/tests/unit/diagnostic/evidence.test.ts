import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveActiveAnswers, getApplicableQuestions, getQuestion } from "../../../app/features/diagnostic/index.ts";
import { collectEvidence, deriveEvidence } from "../../../app/features/diagnostic/evidence.ts";

/**
 * DIAG-V3-04: `DiagnosticEvidence` (definida en `contracts.ts`, DIAG-V3-01, sin productor hasta
 * ahora) derivada de `Contribution` (`scoring.ts`) — una sola fuente, no una tabla de reglas
 * paralela. Todas las preguntas usadas aquí son reales del banco (`getQuestion`), nunca fixtures
 * artificiales desconectadas del registro (spec §32).
 */

test("señal fuerte: control=yes produce evidencia present/none/strong sobre presencia", () => {
  const control = getQuestion("control")!;
  const evidences = deriveEvidence(control, "yes");
  assert.equal(evidences.length, 1);
  assert.deepEqual(evidences[0], {
    dimension: "presencia",
    signal: "present",
    severity: "none",
    confidence: "strong",
    source: { question: { id: "control", version: 1 }, answer: ["yes"] },
  });
});

test("señal débil: control=no produce severity critical sobre presencia", () => {
  const control = getQuestion("control")!;
  const [evidence] = deriveEvidence(control, "no");
  assert.equal(evidence.signal, "missing");
  assert.equal(evidence.severity, "critical");
});

test("no aplica: pipeline=na no produce ninguna evidencia (invisible, no «missing»)", () => {
  const pipeline = getQuestion("pipeline")!;
  assert.deepEqual(deriveEvidence(pipeline, "na"), []);
});

test("no lo sé: capture=unknown produce evidencia uncertain/none/weak, nunca missing", () => {
  const capture = getQuestion("capture")!;
  const evidences = deriveEvidence(capture, "unknown");
  assert.ok(evidences.every((e) => e.signal === "uncertain" && e.severity === "none" && e.confidence === "weak"));
  assert.deepEqual(evidences.map((e) => e.dimension).sort(), ["contacto", "seguimiento"]);
});

test("multi-choice: assets con varias opciones produce confidence moderate (agregado), no strong", () => {
  const assets = getQuestion("assets")!;
  const evidences = deriveEvidence(assets, ["domain", "website"]);
  assert.ok(evidences.length > 0);
  assert.ok(evidences.every((e) => e.confidence === "moderate"));
});

test("collectEvidence solo usa respuestas activas: una respuesta invalidada por routing no produce evidencia", () => {
  const raw = { profile: "business", stage: "regular", sources: ["social"], capture: "always" } as never;
  const active = deriveActiveAnswers(raw);
  const applicableAtRegular = getApplicableQuestions(active);
  const evidenceAtRegular = collectEvidence(active, applicableAtRegular);
  assert.ok(evidenceAtRegular.some((e) => e.source.question.id === "capture"));

  const regressed = deriveActiveAnswers({ ...raw, stage: "idea" } as never);
  const applicableAtIdea = getApplicableQuestions(regressed);
  const evidenceAtIdea = collectEvidence(regressed, applicableAtIdea);
  assert.ok(!evidenceAtIdea.some((e) => e.source.question.id === "capture"), "capture ya no aplica: no debe producir evidencia aunque la respuesta cruda siga existiendo en algún estado intermedio");
});

test("integridad: ninguna evidencia se duplica por pregunta+dimensión", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "growing", assets: ["domain"], control: "yes", sources: ["social"] } as never);
  const applicable = getApplicableQuestions(active);
  const evidences = collectEvidence(active, applicable);
  const keys = evidences.map((e) => `${e.source.question.id}:${e.dimension}`);
  assert.equal(keys.length, new Set(keys).size, "no debe haber dos evidencias con la misma pregunta+dimensión");
});
