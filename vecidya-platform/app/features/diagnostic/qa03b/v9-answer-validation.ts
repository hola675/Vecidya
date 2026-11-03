import type { QuestionDefinitionV2 } from "../qbv2-contract";
import type { DiagnosticAnswersV9 } from "./v9-classification-bundle";

/** V9 answer validation; question definitions remain a temporary bank adapter. */
export function filterValidDiagnosticAnswersV9(
  answers: DiagnosticAnswersV9,
  bank: readonly QuestionDefinitionV2[],
): DiagnosticAnswersV9 {
  const questions = new Map(bank.map((question) => [question.id, question]));
  if (questions.size !== bank.length) {
    throw new Error("El banco V9 contiene identificadores de preguntas duplicados.");
  }
  return Object.fromEntries(Object.entries(answers).filter(([id, answer]) => {
    const question = questions.get(id);
    if (!question) return false;
    if (question.type === "single" && typeof answer !== "string") return false;
    if (question.type === "multi" && !Array.isArray(answer)) return false;
    const values = typeof answer === "string" ? [answer] : answer;
    return values.length > 0
      && new Set(values).size === values.length
      && values.every((value) => question.options.some((option) => option.value === value))
      && (values.length === 1 || !values.some((value) =>
        question.options.find((option) => option.value === value)?.exclusive));
  }));
}
