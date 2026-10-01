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
  points: [
    "Las preguntas se adaptan a tu negocio, proyecto u organización: no todas las personas reciben las mismas.",
    "Suelen ser entre 10 y 20 preguntas; depende de tu situación.",
    "Si no sabes algo, puedes decirlo: una respuesta honesta vale más que una aproximada.",
    "Tus respuestas se guardan solo en este navegador mientras completas el diagnóstico.",
  ],
  cta: "Empezar diagnóstico",
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
