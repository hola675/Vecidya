import { deriveContext, getApplicableQuestions, isAnswered } from "./answers";
import { SAVE_ELIGIBILITY_MIN_APPLICABLE_QUESTIONS, SAVE_ELIGIBILITY_MIN_PROGRESS_RATIO } from "./contracts";
import type { Answers } from "./types";

/**
 * DIAG-V3-07 §4: cuándo ofrecer "Guardar para después". Determinista, sin `Date.now()` ni estado de
 * UI — la misma entrada siempre produce la misma salida, así que es testeable sin temporizadores ni
 * mocks de reloj. El denominador es el recorrido REAL (preguntas aplicables con las respuestas
 * actuales), no un conteo fijo: la matriz de dependencias del motor puede cambiar cuántas preguntas
 * aplican, y un porcentaje rígido sobre un número fijo se habría desalineado con ese recorrido real.
 */
export function canOfferSaveForLater(answers: Answers): boolean {
  const context = deriveContext(answers);
  if (!context.profile || !context.goal || !context.stage) return false;

  const applicable = getApplicableQuestions(answers);
  if (applicable.length < SAVE_ELIGIBILITY_MIN_APPLICABLE_QUESTIONS) return false;

  const answered = applicable.filter((question) => isAnswered(question, answers)).length;
  return answered / applicable.length >= SAVE_ELIGIBILITY_MIN_PROGRESS_RATIO;
}
