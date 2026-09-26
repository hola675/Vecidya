import { selectedValues } from "./answers";
import type { DiagnosticEvidence, EvidenceSeverity, EvidenceSignal, EvidenceStrength, QuestionRef } from "./contracts";
import { questionContribution } from "./scoring";
import type { AnswerValue, Answers, DimensionId, Question } from "./types";

/**
 * DIAG-V3-04: deriva `DiagnosticEvidence` (definida en `contracts.ts`, DIAG-V3-01, sin productor
 * hasta ahora) a partir de `Contribution` (`scoring.ts`), la misma fuente que ya usa el scoring.
 * No hay una segunda tabla de reglas: el modelo señal/severity/confidence está documentado en el
 * plan de DIAG-V3-04 y es deliberadamente el mínimo necesario, no una taxonomía nueva.
 *
 * Modelo elegido (spec §7, "según el modelo elegido"):
 * - value >= 0.75 → signal "present", severity "none".
 * - value >= 0.5  → signal "partial", severity "low".
 * - value >= 0.25 → signal "partial", severity "medium".
 * - value > 0     → signal "missing", severity "high".
 * - value === 0   → signal "missing", severity "critical".
 * - confidence: pregunta "single" → "strong" (una respuesta directa observada);
 *   pregunta "multi" → "moderate" (señal agregada/suma de varias opciones).
 * - "no lo sé" (dimension en unknownFor) → signal "uncertain", severity "none", confidence "weak":
 *   nunca penaliza (spec §13/§14).
 * - "no aplica" (Contribution.notApplicable) → cero evidencia: invisible, no "missing" (spec §13).
 */

function signalFor(value: number): EvidenceSignal {
  if (value >= 0.75) return "present";
  if (value >= 0.25) return "partial";
  return "missing";
}

function severityFor(value: number): EvidenceSeverity {
  if (value >= 0.75) return "none";
  if (value >= 0.5) return "low";
  if (value >= 0.25) return "medium";
  if (value > 0) return "high";
  return "critical";
}

export function deriveEvidence(question: Question, answer: AnswerValue | undefined): DiagnosticEvidence[] {
  const contribution = questionContribution(question, answer);
  if (contribution.notApplicable) return [];

  const ref: QuestionRef = { id: question.id, version: question.version };
  const observed = selectedValues(answer);
  const confidence: EvidenceStrength = question.type === "single" ? "strong" : "moderate";
  const evidences: DiagnosticEvidence[] = [];

  for (const dimension of Object.keys(contribution.evidence) as DimensionId[]) {
    const item = contribution.evidence[dimension]!;
    evidences.push({ dimension, signal: signalFor(item.value), severity: severityFor(item.value), confidence, source: { question: ref, answer: observed } });
  }
  for (const dimension of contribution.unknownFor) {
    if (dimension in contribution.evidence) continue;
    evidences.push({ dimension, signal: "uncertain", severity: "none", confidence: "weak", source: { question: ref, answer: observed } });
  }
  return evidences;
}

export function collectEvidence(activeAnswers: Answers, applicable: Question[]): DiagnosticEvidence[] {
  return applicable.flatMap((question) => deriveEvidence(question, activeAnswers[question.id]));
}
