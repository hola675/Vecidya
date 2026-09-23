import assert from "node:assert/strict";
import { test } from "node:test";

import { getApplicableQuestions, getInitialStep, getProgress, pathLength, profileIds, questions, stageIds } from "../../../app/features/diagnostic/index.ts";
import { personas } from "./personas.ts";

test("sin perfil solo aplica la pregunta de perfil; con perfil, cada perfil tiene preguntas", () => {
  assert.deepEqual(getApplicableQuestions({}).map((question) => question.id), ["profile"]);
  for (const profile of profileIds) {
    assert.ok(getApplicableQuestions({ profile }).length >= 3, `${profile} debe tener preguntas iniciales`);
  }
});

test("la entrada con perfil preseleccionado empieza en la pregunta siguiente, no en el perfil", () => {
  assert.equal(getInitialStep({}), 0);
  assert.equal(getInitialStep({ profile: "professional" }), 1);
  assert.equal(getApplicableQuestions({ profile: "professional" })[1].id, "goal");
  assert.equal(getInitialStep({ profile: "business", goal: "stop_losing" }), 2);
  assert.equal(getApplicableQuestions({ profile: "business", goal: "stop_losing" })[2].id, "stage");
});

test("el progreso se expresa por secciones y nunca supera el total", () => {
  const unknown = getProgress({}, 0);
  assert.equal(unknown.known, false, "sin perfil el recorrido no se conoce");
  assert.equal(unknown.sectionCount, 5);
  assert.equal(unknown.complete, false);
  assert.equal(unknown.sections[0].state, "current");
  assert.ok(unknown.sections.slice(1).every((section) => section.state === "pending"));

  const progress = getProgress({ profile: "business", goal: "organize", stage: "regular" }, 3);
  assert.equal(progress.known, true);
  assert.equal(progress.complete, false);
  assert.equal(progress.sectionLabel, "Contexto");
  assert.ok(progress.sectionCount >= 4);
  assert.equal(progress.sections[0].state, "current");
  assert.ok(progress.questionNumber <= progress.questionCount);

  const done = getProgress(personas.ideaStage, pathLength(personas.ideaStage));
  assert.equal(done.complete, true);
  assert.equal(done.sectionLabel, "Resultado");
  assert.ok(done.sections.every((section) => section.state === "done"));
});

test("un perfil en etapa idea no recibe preguntas de proceso ni medición", () => {
  const applicable = getApplicableQuestions(personas.ideaStage).map((question) => question.id);
  assert.deepEqual(applicable, ["profile", "goal", "stage", "assets", "offer_clarity", "validation"]);
});

test("un profesional no recibe preguntas de negocio ni de creador, y un creador no recibe búsqueda local", () => {
  const professional = getApplicableQuestions(personas.professionalReputation).map((question) => question.id);
  assert.ok(professional.includes("proof_professional"));
  assert.ok(!professional.includes("proof_business"));
  assert.ok(!professional.includes("audience"));
  assert.ok(professional.includes("discoverability"));

  const creator = getApplicableQuestions(personas.creatorAudience).map((question) => question.id);
  assert.ok(!creator.includes("discoverability"));
  assert.ok(creator.includes("audience"));
  assert.ok(creator.includes("offer_clarity"));
});

test("las preguntas dependientes solo aparecen cuando hay registro y actividad regular", () => {
  const withoutCapture = getApplicableQuestions(personas.localBusinessLeaks).map((question) => question.id);
  assert.ok(!withoutCapture.includes("pipeline"));
  assert.ok(!withoutCapture.includes("repetitive"));
  const withCapture = getApplicableQuestions(personas.growingBusinessManual).map((question) => question.id);
  assert.ok(withCapture.includes("pipeline"));
  assert.ok(withCapture.includes("repetitive"));
  assert.ok(withCapture.includes("responsibilities"));
  assert.ok(!getApplicableQuestions(personas.professionalReputation).map((question) => question.id).includes("responsibilities"), "solo yo → sin pregunta de responsabilidades");
});

test("longitud del recorrido: mínimo, típico y máximo dentro de límites razonables", () => {
  assert.equal(pathLength(personas.ideaStage), 6);
  assert.ok(pathLength(personas.localBusinessLeaks) >= 12 && pathLength(personas.localBusinessLeaks) <= 17, `típico=${pathLength(personas.localBusinessLeaks)}`);
  assert.ok(pathLength(personas.growingBusinessManual) <= 19, `máximo=${pathLength(personas.growingBusinessManual)}`);
  assert.equal(questions.length, 26);
});

test("toda combinación perfil × etapa tiene un recorrido finito con la pregunta de activos", () => {
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      const ids = getApplicableQuestions({ profile, stage }).map((question) => question.id);
      assert.ok(ids.includes("assets"), `${profile}/${stage} sin pregunta de activos`);
      assert.ok(ids.length >= 5 && ids.length <= 19, `${profile}/${stage} longitud ${ids.length}`);
    }
  }
});
