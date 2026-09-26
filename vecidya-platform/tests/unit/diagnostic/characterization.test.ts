import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { test } from "node:test";

import { deriveActiveAnswers, getApplicableQuestions, goalIds, profileIds, runDiagnostic, stageIds, teamIds, type Answers, type DiagnosticResult } from "../../../app/features/diagnostic/index.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * Caracterización del motor (DIAG-V3-01). El fixture se generó sobre `0887707`, antes de introducir
 * los contratos V3, y fija el comportamiento observable del dominio: preguntas aplicables,
 * dimensiones, puntaje global, confianza, estado, hallazgos, prioridades y recomendación.
 *
 * `resultDigest` resume el resultado completo (incluidos textos) para detectar cualquier cambio
 * que la proyección estructurada no muestre. El único campo excluido es `version`, añadido en
 * DIAG-V3-01 como metadato. Regenerar (`DIAG_CHARACTERIZATION_UPDATE=1`) solo es legítimo cuando
 * una fase autoriza explícitamente un cambio de comportamiento, y el diff del fixture se revisa.
 */

const fixtureUrl = new URL("./characterization.fixture.json", import.meta.url);

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

function withoutVersion(result: DiagnosticResult): Omit<DiagnosticResult, "version"> {
  const { version: _version, ...rest } = result as DiagnosticResult & { version?: unknown };
  return rest;
}

function project(answers: Answers) {
  const active = deriveActiveAnswers(answers);
  const result = runDiagnostic(answers);
  if (!result) return { applicable: getApplicableQuestions(active).map((question) => question.id), result: null };
  return {
    applicable: getApplicableQuestions(active).map((question) => question.id),
    dimensions: result.dimensions.map(({ id, score, level, evidence, unknown }) => ({ id, score, level, evidence, unknown })),
    overallScore: result.overallScore,
    confidence: { level: result.confidence.level, answered: result.confidence.answered, applicable: result.confidence.applicable, unknown: result.confidence.unknown },
    state: result.state.id,
    issues: result.priorities.concat(result.gaps).map(({ id, priority, severity, tentative }) => ({ id, priority, severity, tentative })),
    priorities: result.priorities.map((issue) => issue.id),
    strengths: result.strengths.map((strength) => `${strength.dimension}:${strength.kind}`),
    recommendation: {
      license: result.recommendation.license.level,
      services: result.recommendation.services.map((service) => service.id),
      addons: result.recommendation.addons.map((addon) => addon.id),
      learn: result.recommendation.learn.map((item) => item.slug),
    },
    goalNote: Boolean(result.goalNote),
    resultDigest: digest(withoutVersion(result)),
  };
}

/** Barrido determinista (mismo generador que `result.test.ts`, semilla propia). */
function sweep(): Answers[] {
  let seed = 20260926;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const cases: Answers[] = [];
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      for (const team of teamIds) {
        for (const goal of goalIds) {
          const answers: Record<string, string | string[]> = { profile, stage, team, goal };
          for (let iteration = 0; iteration < 8; iteration += 1) {
            for (const question of getApplicableQuestions(answers as Answers)) {
              if (answers[question.id] !== undefined) continue;
              const options = question.options;
              if (question.type === "single") {
                answers[question.id] = options[Math.floor(random() * options.length)].value;
              } else {
                const picked = options.filter(() => random() < 0.4).map((option) => option.value);
                const exclusive = picked.find((value) => options.find((option) => option.value === value)?.exclusive);
                answers[question.id] = exclusive ? [exclusive] : picked.length ? picked.filter((value) => !options.find((option) => option.value === value)?.exclusive) : [options[0].value];
              }
            }
          }
          cases.push(answers as Answers);
        }
      }
    }
  }
  return cases;
}

function characterize() {
  const named: Record<string, ReturnType<typeof project>> = {};
  for (const [name, answers] of Object.entries(personas)) named[`persona:${name}`] = project(answers);
  for (const [name, answers] of Object.entries(adversarial)) named[`adversarial:${name}`] = project(answers);
  // Un caso legible por perfil × momento (equipo y objetivo fijos) y la entrada sin perfil.
  const all = sweep();
  for (const answers of all) {
    if (answers.team === "small" && answers.goal === "stop_losing") named[`sweep:${answers.profile}/${answers.stage}`] = project(answers);
  }
  named["entry:empty"] = project({});
  named["entry:creator-deep-link"] = project({ profile: "creator" });
  return { cases: named, sweep: { count: all.length, digest: digest(all.map(project)) } };
}

test("caracterización: el motor produce exactamente los resultados fijados antes de los contratos V3", () => {
  const current = characterize();
  if (process.env.DIAG_CHARACTERIZATION_UPDATE === "1") {
    writeFileSync(fixtureUrl, `${JSON.stringify(current, null, 2)}\n`);
    return;
  }
  const expected = JSON.parse(readFileSync(fixtureUrl, "utf8"));
  assert.deepEqual(Object.keys(current.cases).sort(), Object.keys(expected.cases).sort(), "cambió el conjunto de casos caracterizados");
  for (const [name, value] of Object.entries(current.cases)) {
    assert.deepEqual(value, expected.cases[name], `el caso ${name} cambió de comportamiento`);
  }
  assert.deepEqual(current.sweep, expected.sweep, "el barrido determinista completo cambió de comportamiento");
});
