import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DiagnosticFlow, FlowProgress, QuestionHelp, QuestionStep, ReadyScreen, ResumeScreen, STAGE_LABELS, START_COPY, StartScreen, type QuestionStepProps,
} from "../../../app/components/diagnostic-flow/index.ts";
import {
  createSessionV3, currentQuestionIdV3, presentQuestionV3, progressV3, QUESTION_BANK_V2, renderQuestionV2, submitAnswerV3, type DiagnosticSessionV3, type PresentedQuestionV3,
} from "../../../app/features/diagnostic/index.ts";

/** DIAG-V3-10B — componentes del cuestionario: estructura accesible y copy del render congelado. */

const decode = (html: string) => html.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const noop = () => {};
const render = (props: Partial<QuestionStepProps> & { presented: PresentedQuestionV3 }) => renderToStaticMarkup(createElement(QuestionStep, {
  progress: { stage: "context", stageIndex: 0, answered: 0 }, value: undefined, error: null, reviewing: false, canGoBack: false, onSelect: noop, onSubmit: noop, onBack: noop, ...props,
}));
/** Presenta una pregunta concreta con un contexto real (respuestas de semilla). */
function presentedFor(questionId: string, seed: Record<string, unknown> = {}): PresentedQuestionV3 {
  const definition = QUESTION_BANK_V2.find((question) => question.id === questionId)!;
  const session: DiagnosticSessionV3 = { ...createSessionV3({ sessionId: "ui", now: 1, seedAnswers: seed as never }), queue: [{ questionId, phase: "base", reason: "specialized_evidence" }], reviewIndex: null };
  const presented = presentQuestionV3(session)!;
  assert.equal(presented.question.id, definition.id);
  return presented;
}

test("10B single-select renderer: one h1, fieldset/legend, radio cards in canonical order, neutral before selection", () => {
  const presented = presentedFor("q2_entity");
  const html = render({ presented });
  assert.equal((html.match(/<h1/g) ?? []).length, 1);
  assert.match(html, /<fieldset[^>]*><legend[^>]*>.*<h1[^>]*tabindex="-1"[^>]*>¿Qué describe mejor lo que vas a diagnosticar\?<\/h1>/);
  const values = [...html.matchAll(/type="radio" name="q2_entity" value="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(values, QUESTION_BANK_V2.find((question) => question.id === "q2_entity")!.options.map((option) => option.value), "canonical order");
  assert.equal((html.match(/is-selected/g) ?? []).length, 0, "no option looks preferred before choosing");
  assert.match(html, /name="q2_entity"/);
  for (const label of html.match(/<label class="df-option[^"]*" for="([^"]+)"/g) ?? []) assert.ok(label.includes("df-option"));
  assert.match(textOf(html), /Continuar/);
  assert.ok(!/Volver/.test(textOf(html)), "no back on the first question");
  const selected = render({ presented, value: "business", canGoBack: true });
  assert.equal((selected.match(/is-selected/g) ?? []).length, 1);
  assert.match(selected, /<input class="df-option__input" id="df-q2_entity-business"[^>]*checked=""[^>]*\/>/);
  assert.match(textOf(selected), /Volver/);
});

test("10B multiselect renderer: checkboxes, «Puedes elegir varias», exclusive option rendered like the others", () => {
  const presented = presentedFor("q2_capacity_signal", { q2_has_customers: "yes", q2_regularity: "regular" });
  const html = render({ presented, value: ["stable"] });
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, presented.question.options.length);
  assert.match(textOf(html), /Puedes elegir varias opciones\./);
  assert.match(html, /aria-describedby="[^"]*df-multi-q2_capacity_signal/);
  assert.equal((html.match(/is-selected/g) ?? []).length, 1);
  assert.ok(!/df-option--(best|good|bad|exclusive)/.test(html));
});

test("10B hint is visible secondary text linked to the group; help «?» shows the three helpIntent parts without internals", () => {
  const withHint = QUESTION_BANK_V2.find((question) => question.hint && question.helpIntent?.why && !question.appliesWhen)!;
  const presented = presentedFor(withHint.id);
  const html = render({ presented });
  assert.match(html, new RegExp(`aria-describedby="df-hint-${withHint.id}"`));
  assert.ok(textOf(html).includes(presented.question.hint!));
  const help = renderToStaticMarkup(createElement(QuestionHelp, { question: presented.question }));
  assert.match(help, /^<details class="df-help"><summary>/);
  assert.deepEqual([...help.matchAll(/<h2 class="df-help__title">([^<]+)<\/h2>/g)].map((match) => match[1]), ["Qué estamos preguntando", "Cómo responder", "Por qué importa"]);
  assert.ok(!/q2_|score|peso|puntaje|dimensi[oó]n|prioridad/i.test(textOf(help)), "no internal ids, weights or formulas");
  const goal = renderQuestionV2(QUESTION_BANK_V2.find((question) => question.id === "q2_goal")!, { context: {} });
  const goalHelp = renderToStaticMarkup(createElement(QuestionHelp, { question: goal }));
  assert.match(goalHelp, /<dl class="df-help__options">/, "per-option intent when the question defines it");
  const noHelp = QUESTION_BANK_V2.find((question) => !question.helpIntent)!;
  assert.equal(renderToStaticMarkup(createElement(QuestionHelp, { question: renderQuestionV2(noHelp, { context: {} }) })), "");
});

test("10B questionnaire hints and help explain meaning, never scoring internals (points, weights, evidence roles, planner, formulas)", () => {
  // Solo pistas y ayuda del cuestionario; «porcentaje» y similares son legítimos en el resultado.
  const internal = /\bpoints?\b|score contribution|\bscor(e|es|ing)\b|\bweights?\b|direct evidence|supporting evidence|\bplanner\b|priority formula|\bpuntos?\b|puntaje|puntuaci[oó]n|contribuci[oó]n|\bpesos?\b|ponderaci[oó]n|ponderad[oa]|evidencia directa|evidencia de apoyo|planificador|f[oó]rmula/i;
  let texts = 0;
  for (const definition of QUESTION_BANK_V2) {
    const help = definition.helpIntent;
    const sources = [definition.hint, ...(definition.variants ?? []).map((variant) => variant.hint), help?.understand, help?.distinction, help?.why, ...Object.values(help?.options ?? {})];
    for (const text of sources.filter((item): item is string => Boolean(item))) { texts += 1; assert.ok(!internal.test(text), `${definition.id}: «${text}»`); }
    const rendered = renderQuestionV2(definition, { context: {} });
    assert.ok(!internal.test(textOf(renderToStaticMarkup(createElement(QuestionHelp, { question: rendered })))), `${definition.id}: rendered help`);
  }
  assert.ok(texts > 150, "the audit covers the whole questionnaire copy (175 texts at 10B)");
  const goal = renderQuestionV2(QUESTION_BANK_V2.find((question) => question.id === "q2_goal")!, { context: {} }).help!;
  assert.equal(goal.understand, "Lo principal que quieres mejorar ahora mismo.");
  assert.equal(goal.why, "Tu objetivo nos ayuda a orientar el diagnóstico hacia las áreas más relevantes para lo que quieres mejorar. No determina por sí solo si un área está bien o mal.");
});

test("10B every question of the bank renders without crashing and uses the rendered copy verbatim", () => {
  for (const definition of QUESTION_BANK_V2) {
    const rendered = renderQuestionV2(definition, { context: {} });
    const presented: PresentedQuestionV3 = { question: rendered, savedValue: undefined, aboutPreparation: false, foundational: false };
    const text = textOf(render({ presented }));
    assert.ok(text.includes(rendered.prompt), definition.id);
    for (const option of rendered.options) assert.ok(text.includes(option.label), `${definition.id}: ${option.value}`);
  }
});

test("10B validation errors are local, announced and plain language; review mode explains the effect of editing", () => {
  const presented = presentedFor("q2_entity");
  const html = render({ presented, error: "Elige una opción para continuar.", reviewing: true, canGoBack: true });
  assert.match(html, /<p class="df-question__error" id="df-error-q2_entity" role="alert">Elige una opción para continuar\.<\/p>/);
  assert.match(html, /aria-describedby="[^"]*df-error-q2_entity/);
  assert.match(textOf(html), /Estás revisando una respuesta anterior\. Si la cambias, ajustaremos las preguntas siguientes\./);
});

test("10B progress shows stages and answered count, never «Pregunta N de M» or a percentage", () => {
  const html = renderToStaticMarkup(createElement(FlowProgress, { progress: { stage: "deepening", stageIndex: 1, answered: 7 } }));
  assert.match(html, /<ol aria-label="Etapas del diagnóstico"/);
  assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
  assert.match(textOf(html), /Profundizando en lo importante · 7 respuestas/);
  assert.ok(!/ de \d|%|Pregunta \d/.test(textOf(html)));
  assert.deepEqual(Object.values(STAGE_LABELS), ["Conociendo tu situación", "Profundizando en lo importante", "Últimas comprobaciones", "Preparando tu resultado"]);
});

test("10B context and pre-launch framing: foundational questions say so; preparation questions are labelled before launch", () => {
  assert.match(render({ presented: presentedFor("q2_entity") }), /Sobre tu situación/);
  let session = createSessionV3({ sessionId: "pre", now: 1 });
  const answers: Record<string, unknown> = { q2_entity: "project", q2_has_customers: "no" };
  let labelled = 0;
  while (session.status === "in_progress") {
    const presented = presentQuestionV3(session)!;
    const html = render({ presented, progress: progressV3(session) });
    if (presented.aboutPreparation) { assert.match(html, /Sobre la preparación de tu proyecto/); labelled += 1; }
    const id = currentQuestionIdV3(session)!;
    const definition = QUESTION_BANK_V2.find((question) => question.id === id)!;
    const first = definition.options.find((option) => option.kind !== "unknown" && !option.exclusive) ?? definition.options[0]!;
    session = (submitAnswerV3(session, id, answers[id] ?? (definition.type === "multi" ? [first.value] : first.value), 2) as { session: DiagnosticSessionV3 }).session;
  }
  assert.ok(labelled > 0);
});

test("10B start, resume and ready screens: one primary action, no promised minutes, honest privacy note", () => {
  const start = renderToStaticMarkup(createElement(StartScreen, { onStart: noop }));
  assert.equal((start.match(/button--primary/g) ?? []).length, 1);
  assert.match(textOf(start), /Empezar diagnóstico/);
  assert.ok(!/minuto|min\b|segundo/i.test(textOf(start)), "no completion time without measured data");
  assert.match(textOf(start), /no todas las personas reciben las mismas/);
  assert.match(start, /href="\/privacidad"/);
  for (const point of START_COPY.points) assert.ok(textOf(start).includes(point));
  const resume = renderToStaticMarkup(createElement(ResumeScreen, { answered: 6, completed: false, onContinue: noop, onRestart: noop }));
  assert.match(textOf(resume), /Tienes un diagnóstico sin terminar Respondiste 6 preguntas\..*Continuar diagnóstico Empezar de nuevo/);
  const completed = renderToStaticMarkup(createElement(ResumeScreen, { answered: 12, completed: true, onContinue: noop, onRestart: noop }));
  assert.match(textOf(completed), /Ver mi resultado/);
  const ready = renderToStaticMarkup(createElement(ReadyScreen, { onReview: noop, onShowResult: noop }));
  assert.match(textOf(ready), /Listo\. Ya tenemos suficiente información para preparar tu diagnóstico\..*Ver mi resultado/);
});

test("10B the flow server-renders the start screen with no stored data and no answers in the markup", () => {
  const html = renderToStaticMarkup(createElement(DiagnosticFlow, {}));
  assert.match(html, /class="df-flow df-flow--start"/);
  assert.match(textOf(html), /Empezar diagnóstico/);
  assert.ok(!/df-debug|Depuración/.test(html), "no debug panel without the dev-only prop");
});

test("10B the V3 questionnaire route is registered only by the development server", async () => {
  const load = async (mode: string) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = mode;
    try {
      const routes = (await import(new URL(`../../../app/routes.ts?flow=${mode}`, import.meta.url).href)).default as { path?: string }[];
      return routes.some((route) => route.path === "__dev/diagnostico/v3");
    } finally {
      process.env.NODE_ENV = previous;
    }
  };
  assert.equal(await load("production"), false);
  assert.equal(await load("development"), true);
});
