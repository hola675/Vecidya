import { isGoalId, isProfileId, isStageId, isTeamId } from "./profiles";
import { getOption, questions } from "./questions";
import type { AnswerValue, Answers, Context, Question } from "./types";

/**
 * Estado de respuestas: operaciones puras sobre `Answers`.
 *
 * Garantía de aislamiento: `deriveActiveAnswers` devuelve únicamente respuestas
 * de preguntas aplicables al contexto vigente; una respuesta de una rama
 * abandonada (por ejemplo, tras cambiar de perfil) nunca llega al motor.
 */

export function selectedValues(answer: AnswerValue | undefined): string[] {
  if (answer === undefined) return [];
  return Array.isArray(answer) ? answer : [answer];
}

export function isSelected(answer: AnswerValue | undefined, value: string): boolean {
  return selectedValues(answer).includes(value);
}

export function deriveContext(answers: Answers): Context {
  return {
    profile: isProfileId(answers.profile) ? answers.profile : undefined,
    goal: isGoalId(answers.goal) ? answers.goal : undefined,
    stage: isStageId(answers.stage) ? answers.stage : undefined,
    team: isTeamId(answers.team) ? answers.team : undefined,
    answers,
  };
}

/** Elimina valores que no pertenecen a las opciones de la pregunta. */
export function normalizeAnswer(question: Question, answer: AnswerValue | undefined): AnswerValue | undefined {
  if (answer === undefined) return undefined;
  const valid = selectedValues(answer).filter((value) => Boolean(getOption(question, value)));
  if (question.type === "multi") return valid.length ? valid : undefined;
  return valid.length ? valid[0] : undefined;
}

export function isAnswered(question: Question, answers: Answers): boolean {
  return normalizeAnswer(question, answers[question.id]) !== undefined;
}

export function getApplicableQuestions(answers: Answers): Question[] {
  const context = deriveContext(answers);
  if (!context.profile) return questions.filter((question) => question.id === "profile");
  return questions.filter((question) => !question.applies || question.applies(context));
}

/**
 * Devuelve solo las respuestas válidas de preguntas aplicables, iterando hasta
 * un punto fijo porque la aplicabilidad depende de otras respuestas.
 */
export function deriveActiveAnswers(answers: Answers): Answers {
  let current: Answers = { ...answers };
  for (let iteration = 0; iteration < questions.length + 1; iteration += 1) {
    const applicable = getApplicableQuestions(current);
    const next: Answers = {};
    for (const question of applicable) {
      const value = normalizeAnswer(question, current[question.id]);
      if (value !== undefined) next[question.id] = value;
    }
    const stable = Object.keys(next).length === Object.keys(current).length && Object.keys(next).every((key) => sameAnswer(next[key], current[key]));
    current = next;
    if (stable) break;
  }
  return current;
}

function sameAnswer(a: AnswerValue | undefined, b: AnswerValue | undefined): boolean {
  const left = selectedValues(a);
  const right = selectedValues(b);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/**
 * Aplica una selección. Cambiar de perfil descarta el resto de respuestas
 * (estrategia explícita de aislamiento, además de `deriveActiveAnswers`).
 */
export function applyAnswer(answers: Answers, question: Question, value: string): Answers {
  const option = getOption(question, value);
  if (!option) return answers;

  if (question.id === "profile") {
    return answers.profile === value ? answers : { profile: value };
  }

  if (question.type === "single") {
    return { ...answers, [question.id]: value };
  }

  const previous = selectedValues(answers[question.id]);
  const wasSelected = previous.includes(value);
  if (wasSelected) {
    const remaining = previous.filter((item) => item !== value);
    if (!remaining.length) {
      const { [question.id]: _removed, ...rest } = answers;
      return rest;
    }
    return { ...answers, [question.id]: remaining };
  }

  if (option.exclusive) return { ...answers, [question.id]: [value] };

  const withoutExclusive = previous.filter((item) => !getOption(question, item)?.exclusive);
  return { ...answers, [question.id]: [...withoutExclusive, value] };
}

export function clearAnswer(answers: Answers, questionId: string): Answers {
  const { [questionId]: _removed, ...rest } = answers;
  return rest;
}
