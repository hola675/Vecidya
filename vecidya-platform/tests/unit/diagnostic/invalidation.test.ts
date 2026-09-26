import assert from "node:assert/strict";
import { test } from "node:test";

import { applyAnswer, deriveActiveAnswers, isAnswered } from "../../../app/features/diagnostic/answers.ts";
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

test("convergencia: deriveActiveAnswers alcanza un punto fijo real y estable (caso simple)", () => {
  const raw = { profile: "organization", stage: "growing", team: "large", sources: ["social"], capture: "always" } as never;
  const once = deriveActiveAnswers(raw);
  const twice = deriveActiveAnswers(once);
  assert.deepEqual(once, twice);
});

test("convergencia: un caso que SÍ necesita más de una iteración (assets → clarity_presence/control, sin stage)", () => {
  // `clarity_presence`/`control` leen `answers.assets` en crudo (no dependen de que `assets` sea
  // aplicable), pero `assets` solo aplica si hay `stage`. Sin `stage`: en la 1.ª pasada `assets` no
  // es aplicable y se descarta, pero `clarity_presence`/`control` SÍ lo son todavía (leen el
  // `assets` que aún estaba en el `current` de esa pasada) y se conservan; solo en la 2.ª pasada,
  // con `assets` ya ausente de `current`, `clarity_presence`/`control` dejan de aplicar. Si el punto
  // fijo se quedara en una sola pasada, esta prueba fallaría.
  const raw = { profile: "business", assets: ["domain"], clarity_presence: "yes", control: "yes" } as never;
  const active = deriveActiveAnswers(raw);
  assert.deepEqual(active, { profile: "business" });
});

test("cambio hacia atrás: applyAnswer (el mecanismo real de cambio de perfil) descarta siempre la rama anterior, así que volver no puede resucitar nada", () => {
  const profileQuestion = getQuestion("profile")!;
  const proofBusinessQuestion = getQuestion("proof_business")!;
  let answers = applyAnswer({}, profileQuestion, "business");
  answers = { ...answers, stage: "regular" } as never;
  answers = applyAnswer(answers, proofBusinessQuestion, "reviews");
  assert.deepEqual(answers.proof_business, ["reviews"], "la respuesta se registró antes de cambiar de rama");

  // Cambiar de perfil (la rama principal, spec §25) SIEMPRE vacía todo lo demás: es el mecanismo
  // real que produce "las respuestas exclusivas de X dejan de participar", no una construcción de
  // prueba que omite la clave de antemano.
  answers = applyAnswer(answers, profileQuestion, "creator");
  assert.deepEqual(answers, { profile: "creator" });

  // Volver a "business" pasa OTRA VEZ por el mismo `applyAnswer` de cambio de perfil, que vuelve a
  // vaciar todo: no hay ningún estado oculto en el que `proof_business` pudiera haber sobrevivido.
  answers = applyAnswer(answers, profileQuestion, "business");
  assert.deepEqual(answers, { profile: "business" }, "volver a business no puede traer de vuelta proof_business: applyAnswer siempre empieza de cero al cambiar de perfil");
});

test("«no lo sé» y «no aplica» cuentan como respondida, no como sin responder", () => {
  const discoverability = getQuestion("discoverability")!;
  assert.ok(discoverability);
  assert.equal(isAnswered(discoverability, { discoverability: "unknown" } as never), true);
  assert.equal(isAnswered(discoverability, { discoverability: "na" } as never), true);
  assert.equal(isAnswered(discoverability, {} as never), false);
});
