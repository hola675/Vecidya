import { selectedValues } from "./answers";
import { getOption } from "./questions";
import type { AnswerValue, Answers, Confidence, DimensionId, DimensionLevel, DimensionScore, Question } from "./types";

/**
 * Puntuación por dimensión (0–100) normalizada sobre la evidencia aplicable
 * y respondida. Propiedades: determinista, acotada, sin NaN; «no lo sé» no
 * puntúa (reduce confianza); «no aplica» no puntúa ni afecta la confianza;
 * una pregunta no aplicable no tiene impacto porque nunca llega aquí.
 */

export const dimensionOrder: DimensionId[] = ["claridad", "presencia", "alcance", "confianza", "contacto", "seguimiento", "medicion"];

export const dimensionLabels: Record<DimensionId, string> = {
  claridad: "Claridad",
  presencia: "Presencia",
  alcance: "Alcance",
  confianza: "Confianza",
  contacto: "Contacto",
  seguimiento: "Seguimiento",
  medicion: "Medición",
};

export const dimensionDescriptions: Record<DimensionId, string> = {
  claridad: "Qué tan fácil es entender qué ofreces, a quién y cómo avanzar contigo.",
  presencia: "Qué activos digitales existen y si están bajo tu control.",
  alcance: "Cómo te encuentran hoy las personas correctas.",
  confianza: "Qué señales públicas respaldan tu experiencia o tu negocio.",
  contacto: "Si las consultas llegan por una vía clara y quedan registradas.",
  seguimiento: "Qué pasa con una consulta después de la primera respuesta.",
  medicion: "Qué sabes con datos sobre origen, volumen y conversión.",
};

export type Contribution = {
  evidence: Partial<Record<DimensionId, { value: number; weight: number }>>;
  unknownFor: DimensionId[];
  /** true cuando la respuesta seleccionada es «no lo sé». */
  unknown: boolean;
  /** true cuando la respuesta es «no aplica». */
  notApplicable: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

export function questionContribution(question: Question, answer: AnswerValue | undefined): Contribution {
  const empty: Contribution = { evidence: {}, unknownFor: [], unknown: false, notApplicable: false };
  const values = selectedValues(answer);
  if (!values.length) return empty;

  const options = values.map((value) => getOption(question, value)).filter((option): option is NonNullable<typeof option> => Boolean(option));
  if (!options.length) return empty;

  const weightOf = (dimension: DimensionId) => question.weight?.[dimension] ?? 1;

  if (options.some((option) => option.kind === "not_applicable")) return { ...empty, notApplicable: true };
  if (options.some((option) => option.kind === "unknown")) return { ...empty, unknown: true, unknownFor: [...question.dimensions] };

  const uncertain = new Set<DimensionId>(options.flatMap((option) => option.uncertainFor ?? []));
  const evidence: Contribution["evidence"] = {};

  if (options.some((option) => option.kind === "none")) {
    for (const dimension of question.noneDimensions ?? question.dimensions) {
      if (!uncertain.has(dimension)) evidence[dimension] = { value: 0, weight: weightOf(dimension) };
    }
    return { evidence, unknownFor: [...uncertain], unknown: false, notApplicable: false };
  }

  if (question.type === "single") {
    const option = options[0];
    for (const dimension of question.dimensions) {
      const value = option.evidence?.[dimension];
      if (value !== undefined && !uncertain.has(dimension)) evidence[dimension] = { value: clamp01(value), weight: weightOf(dimension) };
    }
    return { evidence, unknownFor: [...uncertain], unknown: false, notApplicable: false };
  }

  for (const dimension of question.dimensions) {
    if (uncertain.has(dimension)) continue;
    const explicit = options.map((option) => option.evidence?.[dimension]).filter((value): value is number => value !== undefined);
    const sum = explicit.reduce((total, value) => total + value, 0);
    const maximum = question.target?.[dimension] ?? question.options.reduce((total, option) => total + (option.kind === undefined || option.kind === "value" ? option.evidence?.[dimension] ?? 0 : 0), 0);
    if (maximum > 0) {
      evidence[dimension] = { value: clamp01(sum / maximum), weight: weightOf(dimension) };
    } else if (explicit.length) {
      evidence[dimension] = { value: clamp01(Math.max(...explicit)), weight: weightOf(dimension) };
    }
  }

  return { evidence, unknownFor: [...uncertain], unknown: false, notApplicable: false };
}

export function levelFor(score: number): DimensionLevel {
  if (score < 35) return "inicial";
  if (score < 65) return "parcial";
  if (score < 85) return "solida";
  return "consolidada";
}

export const levelLabels: Record<DimensionLevel, string> = {
  inicial: "Punto de partida",
  parcial: "En construcción",
  solida: "Funciona",
  consolidada: "Consolidada",
};

/**
 * Clasificación visual de apoyo (DIAG-003): una lectura rápida del mismo porcentaje, no un
 * reemplazo. `levelFor`/`DimensionLevel` (4 niveles) sigue siendo lo que usa el resto del motor
 * (`classifyState`, fortalezas, etc.); esta clasificación de 3 tramos es exclusivamente para la UI
 * (color + icono junto al porcentaje, que siempre se muestra como texto). Límites centralizados
 * aquí y solo aquí: 0-49 prioridad, 50-74 en desarrollo, 75-100 buen estado.
 */
export type VisualStatus = "priority" | "developing" | "healthy";

export const visualStatusLabels: Record<VisualStatus, string> = {
  priority: "Prioridad",
  developing: "En desarrollo",
  healthy: "Buen estado",
};

export function visualStatusFor(score: number): VisualStatus {
  if (score < 50) return "priority";
  if (score < 75) return "developing";
  return "healthy";
}

/**
 * Resultado general 0-100 (DIAG-003): media de las dimensiones con puntuación, ponderada por su
 * `evidence` (la misma suma de pesos que ya usa `scoreDimensions` para calcular cada dimensión) —
 * mismo criterio en cascada, no un promedio simple. Una dimensión sin evidencia (`score: null`) no
 * participa. Es solo una lectura de conjunto: nunca sustituye ni oculta una dimensión crítica, que
 * sigue mostrando su propio porcentaje y color sin importar cuánto suba el general.
 */
export function computeOverallScore(dimensions: DimensionScore[]): number {
  const scored = dimensions.filter((dimension): dimension is DimensionScore & { score: number } => dimension.score !== null);
  const totalWeight = scored.reduce((sum, dimension) => sum + dimension.evidence, 0);
  if (totalWeight <= 0) return 0;
  const weighted = scored.reduce((sum, dimension) => sum + dimension.score * dimension.evidence, 0);
  return Math.min(100, Math.max(0, Math.round(weighted / totalWeight)));
}

/** Evidencia mínima (suma de pesos) para mostrar una puntuación. */
export const MIN_EVIDENCE = 1;

export function scoreDimensions(activeAnswers: Answers, applicable: Question[]): DimensionScore[] {
  const totals: Record<DimensionId, { weighted: number; weight: number; unknown: number }> = Object.fromEntries(
    dimensionOrder.map((dimension) => [dimension, { weighted: 0, weight: 0, unknown: 0 }]),
  ) as Record<DimensionId, { weighted: number; weight: number; unknown: number }>;

  for (const question of applicable) {
    const contribution = questionContribution(question, activeAnswers[question.id]);
    for (const dimension of dimensionOrder) {
      const item = contribution.evidence[dimension];
      if (item) {
        totals[dimension].weighted += item.value * item.weight;
        totals[dimension].weight += item.weight;
      }
    }
    for (const dimension of contribution.unknownFor) totals[dimension].unknown += 1;
  }

  return dimensionOrder.map((dimension) => {
    const total = totals[dimension];
    const hasEvidence = total.weight >= MIN_EVIDENCE;
    const score = hasEvidence ? Math.round((100 * total.weighted) / total.weight) : null;
    return {
      id: dimension,
      label: dimensionLabels[dimension],
      score: score === null ? null : Math.min(100, Math.max(0, score)),
      level: score === null ? null : levelFor(score),
      evidence: Math.round(total.weight * 100) / 100,
      unknown: total.unknown,
    };
  });
}

export function computeConfidence(activeAnswers: Answers, applicable: Question[], dimensions: DimensionScore[], contradictions: string[] = []): Confidence {
  const scored = applicable.filter((question) => question.id !== "profile");
  const answered = scored.filter((question) => activeAnswers[question.id] !== undefined);
  const unknownCount = answered.filter((question) => questionContribution(question, activeAnswers[question.id]).unknown || questionContribution(question, activeAnswers[question.id]).unknownFor.length > 0).length;
  const coverage = scored.length ? answered.length / scored.length : 0;
  const unknownRatio = answered.length ? unknownCount / answered.length : 0;
  const uncertainDimensions = dimensions.filter((dimension) => dimension.unknown >= 2).map((dimension) => dimension.label);
  const reasons: string[] = [];

  if (coverage < 1) reasons.push(`Respondiste ${answered.length} de ${scored.length} preguntas aplicables.`);
  if (unknownCount > 0) {
    const affected = dimensions.filter((dimension) => dimension.unknown > 0).map((dimension) => dimension.label.toLowerCase());
    reasons.push(`${unknownCount} ${unknownCount === 1 ? "respuesta fue" : "respuestas fueron"} «no lo sé»${affected.length ? ` (afecta a ${affected.join(", ")})` : ""}.`);
  }
  const unscored = dimensions.filter((dimension) => dimension.score === null && dimension.unknown > 0).map((dimension) => dimension.label.toLowerCase());
  if (unscored.length) reasons.push(`Sin evidencia suficiente en ${unscored.join(", ")}.`);

  let level: Confidence["level"] = "baja";
  if (coverage >= 0.95 && unknownRatio <= 0.1 && uncertainDimensions.length === 0) level = "alta";
  else if (coverage >= 0.8 && unknownRatio <= 0.3) level = "media";

  // Una contradicción entre respuestas nunca permite confianza alta y se explica siempre.
  if (contradictions.length) {
    reasons.push(...contradictions);
    if (level === "alta") level = "media";
  }

  if (!reasons.length) reasons.push("Respondiste todas las preguntas aplicables sin dejar dudas abiertas.");

  return { level, answered: answered.length, applicable: scored.length, unknown: unknownCount, reasons };
}
