import { getApplicableQuestions, isAnswered } from "./answers";
import { sectionLabels, sectionOrder } from "./questions";
import type { Answers, Question, SectionId } from "./types";

/**
 * Secuencia y progreso. El progreso se expresa por secciones (no por un
 * porcentaje que cambia al ramificar) más el número de pregunta dentro del
 * recorrido aplicable en ese momento.
 */

export type FlowSection = { id: SectionId; label: string; questions: Question[] };

export type Progress = {
  complete: boolean;
  sectionIndex: number;
  sectionCount: number;
  sectionLabel: string;
  sections: { id: SectionId; label: string; state: "done" | "current" | "pending" }[];
  questionNumber: number;
  questionCount: number;
  /** false mientras no hay perfil: el total de preguntas y secciones todavía no se conoce. */
  known: boolean;
};

export function getSections(applicable: Question[]): FlowSection[] {
  return sectionOrder
    .map((id) => ({ id, label: sectionLabels[id], questions: applicable.filter((question) => question.section === id) }))
    .filter((section) => section.questions.length > 0);
}

/** Índice de la primera pregunta aplicable sin responder (permite saltar preguntas prellenadas). */
export function getInitialStep(answers: Answers): number {
  const applicable = getApplicableQuestions(answers);
  const index = applicable.findIndex((question) => !isAnswered(question, answers));
  return index === -1 ? applicable.length : index;
}

export function getProgress(answers: Answers, step: number): Progress {
  const applicable = getApplicableQuestions(answers);
  const hasProfile = applicable.some((question) => question.id !== "profile");
  // Antes de elegir perfil el recorrido no se conoce: se muestran todas las secciones como pendientes.
  const sections = hasProfile ? getSections(applicable) : sectionOrder.map((id) => ({ id, label: sectionLabels[id], questions: [] as Question[] }));
  const complete = hasProfile && step >= applicable.length;
  const current = complete ? undefined : applicable[Math.min(step, applicable.length - 1)];
  const sectionIndex = complete ? sections.length : Math.max(0, sections.findIndex((section) => section.id === current?.section));

  return {
    complete,
    sectionIndex,
    sectionCount: sections.length,
    sectionLabel: complete ? "Resultado" : sections[sectionIndex]?.label ?? "",
    sections: sections.map((section, index) => ({
      id: section.id,
      label: section.label,
      state: complete || index < sectionIndex ? "done" : index === sectionIndex ? "current" : "pending",
    })),
    questionNumber: complete ? applicable.length : step + 1,
    questionCount: applicable.length,
    known: hasProfile,
  };
}

/** Longitud del recorrido para un conjunto de respuestas (útil en pruebas). */
export function pathLength(answers: Answers): number {
  return getApplicableQuestions(answers).length;
}
