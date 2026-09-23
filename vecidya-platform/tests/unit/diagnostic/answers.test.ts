import assert from "node:assert/strict";
import { test } from "node:test";

import { applyAnswer, deriveActiveAnswers, getApplicableQuestions, getQuestion, runDiagnostic } from "../../../app/features/diagnostic/index.ts";
import { personas } from "./personas.ts";

const question = (id: string) => {
  const found = getQuestion(id);
  assert.ok(found, `pregunta ${id} inexistente`);
  return found;
};

test("una opción exclusiva limpia las demás y una normal retira la exclusiva", () => {
  const assets = question("assets");
  let answers = applyAnswer({ profile: "business", stage: "regular" }, assets, "website");
  answers = applyAnswer(answers, assets, "google");
  assert.deepEqual(answers.assets, ["website", "google"]);

  answers = applyAnswer(answers, assets, "none");
  assert.deepEqual(answers.assets, ["none"], "la exclusiva reemplaza a las demás");

  answers = applyAnswer(answers, assets, "social");
  assert.deepEqual(answers.assets, ["social"], "una opción normal retira la exclusiva");

  answers = applyAnswer(answers, assets, "unknown");
  answers = applyAnswer(answers, assets, "unknown");
  assert.equal(answers.assets, undefined, "desmarcar la única opción vacía la respuesta");
});

test("una respuesta única se reemplaza y un valor desconocido se ignora", () => {
  const stage = question("stage");
  let answers = applyAnswer({ profile: "business" }, stage, "idea");
  answers = applyAnswer(answers, stage, "regular");
  assert.equal(answers.stage, "regular");
  assert.deepEqual(applyAnswer(answers, stage, "<script>"), answers);
});

test("cambiar de perfil descarta todas las respuestas anteriores", () => {
  const profile = question("profile");
  const answers = applyAnswer(personas.localBusinessLeaks, profile, "professional");
  assert.deepEqual(answers, { profile: "professional" });
  assert.deepEqual(applyAnswer(personas.localBusinessLeaks, profile, "business"), personas.localBusinessLeaks, "repetir el mismo perfil no borra nada");
});

test("deriveActiveAnswers elimina respuestas de preguntas no aplicables (aislamiento de ramas)", () => {
  const stale = {
    ...personas.creatorAudience,
    discoverability: "no",
    proof_business: ["none"],
    pipeline: "no",
    repetitive: "a_lot",
  };
  const active = deriveActiveAnswers(stale);
  assert.equal(active.discoverability, undefined);
  assert.equal(active.proof_business, undefined);
  assert.equal(active.pipeline, undefined, "pipeline no aplica cuando capture = no");
  assert.equal(active.repetitive, undefined);
  assert.deepEqual(runDiagnostic(stale), runDiagnostic(personas.creatorAudience), "las respuestas residuales no alteran el resultado");
});

test("deriveActiveAnswers elimina valores inválidos dentro de una respuesta", () => {
  const active = deriveActiveAnswers({ profile: "business", stage: "regular", assets: ["website", "hackeado"], goal: "nope" });
  assert.deepEqual(active.assets, ["website"]);
  assert.equal(active.goal, undefined);
});

test("una respuesta de proceso no puede sobrevivir a un cambio de etapa a idea", () => {
  const answers = { ...personas.localBusinessLeaks, stage: "idea" };
  const active = deriveActiveAnswers(answers);
  for (const id of ["team", "sources", "capture", "response", "follow_up", "responsibilities", "post_sale", "measurement"]) {
    assert.equal(active[id], undefined, `${id} no debe aplicar en etapa idea`);
  }
  assert.ok(getApplicableQuestions(active).every((item) => item.section !== "proceso" && item.section !== "medicion"));
});
