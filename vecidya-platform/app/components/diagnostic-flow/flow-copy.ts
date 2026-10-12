import type { AnswerValidationErrorV3, ProgressStageV3 } from "../../features/diagnostic";

/**
 * DIAG-V3-10B — copy de la experiencia del cuestionario (sin JSX). Las preguntas, pistas, opciones y ayudas NO
 * están aquí: vienen siempre del render congelado (`renderQuestionV2`) con los términos del perfil de cada persona.
 */

export const STAGE_LABELS: Readonly<Record<ProgressStageV3, string>> = {
  context: "Conociendo tu situación",
  deepening: "Profundizando en lo importante",
  final_checks: "Últimas comprobaciones",
  preparing: "Preparando tu resultado",
};

export const START_COPY = {
  kicker: "Diagnóstico Vecidya",
  title: "Entiende dónde está hoy tu presencia digital y qué conviene atender primero",
  lead: "Responde unas preguntas sobre tu situación. Al final verás cómo está tu presencia digital, qué funciona, qué te frena, por dónde empezar y qué tipo de ayuda podría servirte.",
  metaDescription: "Entiende dónde estás, qué funciona, qué te frena y qué conviene hacer primero. Diagnóstico anónimo, adaptado a tu negocio y sin necesidad de crear una cuenta.",
  points: [
    "Las preguntas se adaptan a tu negocio, proyecto u organización: no todas las personas reciben las mismas.",
    "Suelen ser entre 10 y 20 preguntas; depende de tu situación.",
    "Si no sabes algo, puedes decirlo: una respuesta honesta vale más que una aproximada.",
    "Tus respuestas se guardan solo en este navegador mientras completas el diagnóstico.",
  ],
  cta: "Empezar diagnóstico",
} as const;

export const ANONYMOUS_START_COPY = {
  ...START_COPY,
  title: "Conoce tu presencia digital y el primer paso que conviene dar",
  lead: "Responde unas preguntas sobre tu situación. Al final recibirás un resumen anónimo con una lectura preliminar, sus límites y una acción para empezar.",
  metaDescription: "Completa un diagnóstico anónimo y recibe una lectura preliminar de tu presencia digital y un primer paso. No necesitas crear una cuenta.",
  points: [
    "Las preguntas se adaptan a tu negocio, proyecto u organización.",
    "La duración depende de tu situación; puedes responder «no lo sé» cuando corresponda.",
    "Tus respuestas se guardan en este navegador para que puedas continuar si recargas.",
    "Para preparar el resumen, las respuestas se procesan temporalmente en el servidor y no se guardan allí.",
  ],
} as const;

export const ERROR_COPY: Readonly<Record<AnswerValidationErrorV3 | "not_current_question", string>> = {
  required: "Elige una opción para continuar.",
  invalid_type: "No pudimos leer esa respuesta. Elige una opción de nuevo.",
  invalid_option: "Esa opción ya no está disponible. Elige una de las opciones de la lista.",
  duplicate_option: "Hay una opción repetida. Revisa tu selección.",
  exclusive_conflict: "Esa opción no se puede combinar con otras. Elige solo esa o desmárcala.",
  not_current_question: "La pregunta cambió. Revisa la pregunta en pantalla y vuelve a responder.",
};

export const REQUIRED_MULTI = "Selecciona al menos una opción para continuar.";

export const HELP_SECTIONS = {
  understand: "Qué estamos preguntando",
  distinction: "Cómo responder",
  why: "Por qué importa",
} as const;
