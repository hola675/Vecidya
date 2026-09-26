import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveActiveAnswers, isAnswered } from "../../../app/features/diagnostic/answers.ts";
import { getQuestion } from "../../../app/features/diagnostic/questions.ts";

/**
 * DIAG-V3-03: `deriveActiveAnswers` (fixed-point) y la semántica de "no lo sé"/"no aplica" no
 * cambian con la migración a routing declarativo — estas pruebas fijan ese comportamiento, que ya
 * existía, para que un futuro cambio al router no pueda romperlo en silencio.
 */

test("invalidación nivel 1: cambiar stage a idea descarta team", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "idea", team: "small" } as never);
  assert.equal(active.team, undefined);
});

test("invalidación nivel 2: stage cambia, sources deja de aplicar, y lo que dependía de sources también cae", () => {
  const withData = { profile: "business", stage: "regular", sources: ["social"], capture: "always" } as never;
  const stillThere = deriveActiveAnswers(withData);
  assert.equal(stillThere.capture, "always");
  const afterStageChange = deriveActiveAnswers({ ...withData, stage: "idea" } as never);
  assert.equal(afterStageChange.sources, undefined, "sources ya no aplica en idea");
  assert.equal(afterStageChange.capture, undefined, "capture dependía de sources/stage; debe desaparecer también");
});

test("invalidación nivel 3: cadena real stage → sources → capture → pipeline se limpia por completo", () => {
  const full = { profile: "business", stage: "growing", sources: ["social"], capture: "always", pipeline: "tool", repetitive: "some" } as never;
  const active = deriveActiveAnswers(full);
  assert.equal(active.pipeline, "tool");
  assert.equal(active.repetitive, "some");
  const regressed = deriveActiveAnswers({ ...full, stage: "launching" } as never);
  for (const orphan of ["sources", "capture", "pipeline", "repetitive"] as const) {
    assert.equal(regressed[orphan], undefined, `${orphan} debía desaparecer tras el cambio de stage`);
  }
});

test("convergencia: deriveActiveAnswers alcanza un punto fijo real y estable", () => {
  const raw = { profile: "organization", stage: "growing", team: "large", sources: ["social"], capture: "always" } as never;
  const once = deriveActiveAnswers(raw);
  const twice = deriveActiveAnswers(once);
  assert.deepEqual(once, twice);
});

test("cambio hacia atrás: volver a un perfil no revive respuestas de una rama abandonada", () => {
  const businessBranch = { profile: "business", stage: "regular", proof_business: ["reviews"] } as never;
  const switchedToCreator = deriveActiveAnswers({ ...businessBranch, profile: "creator" } as never);
  assert.equal(switchedToCreator.proof_business, undefined);
  const backToBusiness = deriveActiveAnswers({ profile: "business", stage: "regular" } as never);
  assert.equal(backToBusiness.proof_business, undefined, "no debe resucitar automáticamente al volver a la misma rama");
});

test("«no lo sé» y «no aplica» cuentan como respondida, no como sin responder", () => {
  const discoverability = getQuestion("discoverability")!;
  assert.ok(discoverability);
  assert.equal(isAnswered(discoverability, { discoverability: "unknown" } as never), true);
  assert.equal(isAnswered(discoverability, { discoverability: "na" } as never), true);
  assert.equal(isAnswered(discoverability, {} as never), false);
});
