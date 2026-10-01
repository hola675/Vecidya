import type { ContextualConfidenceLevel, ContextualScoringResult } from "./qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-coverage";
import type { ResultCertainty } from "./qbv2-language";
import type { DiagnosticNarrative } from "./qbv2-narrative";
import { DIMENSION_NARRATIVE } from "./qbv2-narrative-phrases";
import type { ConstraintPriorityResult } from "./qbv2-priorities";
import type { SemanticDiagnosticFacts, SemanticFact } from "./qbv2-semantic-facts";
import { TERMINOLOGY } from "./qbv2-terminology";

/**
 * DIAG-V3-10 — Digital Presence Index y estado general. Es un resumen de presentación derivado de las
 * dimensiones ya calculadas, no una novena dimensión: no cambia ningún score, no crea prioridades y no
 * multiplica capacidad por confianza. Índice (cuánta capacidad se observa), cobertura (cuántas áreas
 * aplicables tienen lectura) y confianza (cuánta evidencia la respalda) se entregan por separado.
 */

export const OVERALL_INDEX_VERSION = 1 as const;

/**
 * Constantes calibradas en DIAG-V3-10 contra las 12 personas golden y 4.860 rutas generadas (3.240 de producción
 * × 3 políticas de respuesta). Las bandas se apoyan en la escala del scoring (parcial = 50, establecido = 75):
 * respuestas uniformemente parciales caen siempre en «en desarrollo» y uniformemente establecidas en «sólida».
 */
export const OVERALL_INDEX_MODEL = {
  /** Con una o dos lecturas el «índice» solo repetiría esas áreas y cambiaría de banda con una respuesta. */
  minScoredDimensions: 3,
  /** Nunca se resume con menos de un tercio de las áreas aplicables observadas. */
  minCoverage: 1 / 3,
  /** Sobre la media exacta (`rawScore`): low = [0, 40), developing = [40, 70), solid = [70, 100]. */
  bands: { developingFrom: 40, solidFrom: 70 },
  confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
} as const;

export const OVERALL_STATES = ["low", "developing", "solid"] as const;
export type OverallState = (typeof OVERALL_STATES)[number];
export type OverallStatusKind = OverallState | "insufficient";

/** Contrato de iconos: tres ranuras semánticas; el arte final se genera después (sin personas ni caras). */
export const OVERALL_STATE_ASSET_SLOTS: Readonly<Record<OverallState, string>> = {
  low: "diagnostic-status-low",
  developing: "diagnostic-status-developing",
  solid: "diagnostic-status-solid",
};

export const OVERALL_STATUS_LABELS: Readonly<Record<OverallStatusKind, string>> = {
  low: "Presencia por fortalecer",
  developing: "Presencia en desarrollo",
  solid: "Presencia sólida",
  insufficient: "Lectura general pendiente",
};

export type DigitalPresenceIndex = {
  /** Media exacta, sin redondear, de las áreas aplicables con lectura. Es el único valor que clasifica el estado. */
  readonly rawScore: number | null;
  /** Entero para mostrar (`displayScoreFor(rawScore)`, siempre en la misma banda); nunca decide el estado. Ambos `null` sin evidencia mínima. */
  readonly displayScore: number | null;
  readonly scoredDimensions: readonly DigitalDimensionId[];
  readonly applicableDimensions: readonly DigitalDimensionId[];
  /** Áreas que no entran en el índice y por qué: nunca cuentan como cero. */
  readonly excluded: readonly { readonly dimension: DigitalDimensionId; readonly reason: "not_applicable" | "no_reading" }[];
  readonly assessed: number;
  readonly applicable: number;
  /** `assessed / applicable`, de 0 a 1 con dos decimales. */
  readonly coverage: number;
  readonly sufficient: boolean;
};

export type OverallConfidence = {
  readonly level: ContextualConfidenceLevel;
  readonly basis: { readonly coverage: number; readonly scored: number; readonly atLeastMedium: number; readonly high: number };
};

export type OverallExplanation = {
  readonly text: string;
  readonly certainty: ResultCertainty;
  readonly sourceFactIds: readonly string[];
  readonly sourceDimensions: readonly DigitalDimensionId[];
  readonly priorityRank?: 1;
};

/**
 * Por qué una banda sólida se presenta como «en desarrollo»: un freno material (un promedio alto no oculta un cuello
 * de botella) o una confianza general limitada (lo observado es poco para afirmar solidez). El índice no cambia.
 */
export type OverallCap =
  | { readonly reason: "material_constraint"; readonly dimension: DigitalDimensionId; readonly constraintId: string }
  | { readonly reason: "limited_confidence" };

export type DigitalPresenceStatus = {
  readonly version: typeof OVERALL_INDEX_VERSION;
  readonly index: DigitalPresenceIndex;
  readonly confidence: OverallConfidence;
  readonly state: OverallStatusKind;
  /** Banda numérica de `rawScore`; difiere de `state` cuando hay un tope (`cap`). */
  readonly bandState: OverallState | null;
  readonly cap: OverallCap | null;
  /** Lectura preliminar: hay índice, pero la confianza general es limitada. */
  readonly provisional: boolean;
  readonly label: string;
  readonly assetSlot: string | null;
  readonly explanation: OverallExplanation;
};

export type OverallStatusInput = {
  readonly scoring: ContextualScoringResult;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
  readonly narrative: DiagnosticNarrative;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Antes del lanzamiento no hay índice: lo que se lee es preparación (claridad, base, primer canal), no una presencia
 * en operación, y las capacidades operativas son incertidumbre legítima. Un porcentaje ahí sería precisión falsa.
 */
export function computeDigitalPresenceIndex(scoring: ContextualScoringResult, options: { readonly prelaunch?: boolean } = {}): DigitalPresenceIndex {
  const byId = new Map(scoring.dimensions.map((item) => [item.id, item]));
  const applicableDimensions = DIGITAL_DIMENSION_IDS.filter((id) => byId.get(id)?.applicability === "applicable");
  const scoredDimensions = applicableDimensions.filter((id) => typeof byId.get(id)!.score === "number");
  const excluded = DIGITAL_DIMENSION_IDS.filter((id) => !scoredDimensions.includes(id))
    .map((dimension) => ({ dimension, reason: applicableDimensions.includes(dimension) ? "no_reading" as const : "not_applicable" as const }));
  const coverage = applicableDimensions.length === 0 ? 0 : round2(scoredDimensions.length / applicableDimensions.length);
  const sufficient = !options.prelaunch && scoredDimensions.length >= OVERALL_INDEX_MODEL.minScoredDimensions && scoredDimensions.length / Math.max(1, applicableDimensions.length) >= OVERALL_INDEX_MODEL.minCoverage;
  // Pesos iguales: meta, fricción y prioridad ordenan el trabajo, no miden la capacidad actual.
  const rawScore = sufficient ? scoredDimensions.reduce((total, id) => total + byId.get(id)!.score!, 0) / scoredDimensions.length : null;
  return {
    rawScore, displayScore: rawScore === null ? null : displayScoreFor(rawScore), scoredDimensions, applicableDimensions, excluded,
    assessed: scoredDimensions.length, applicable: applicableDimensions.length, coverage, sufficient,
  };
}

/** Confianza general a partir de la confianza por área y la cobertura; nunca se mezcla con el porcentaje. */
export function computeOverallConfidence(scoring: ContextualScoringResult, index: DigitalPresenceIndex): OverallConfidence {
  const levels = index.scoredDimensions.map((id) => scoring.dimensions.find((item) => item.id === id)!.confidence.level);
  const atLeastMedium = levels.filter((level) => level !== "low").length;
  const high = levels.filter((level) => level === "high").length;
  const share = (count: number) => (levels.length === 0 ? 0 : count / levels.length);
  const model = OVERALL_INDEX_MODEL.confidence;
  const level: ContextualConfidenceLevel = !index.sufficient ? "low"
    : index.coverage >= model.highCoverage && share(high) >= model.share ? "high"
      : index.coverage >= model.mediumCoverage && share(atLeastMedium) >= model.share ? "medium" : "low";
  return { level, basis: { coverage: index.coverage, scored: levels.length, atLeastMedium, high } };
}

/** Banda numérica sobre la media exacta: 39,99 es «low» aunque se muestre como 40 %. */
export function bandFor(rawScore: number): OverallState {
  return rawScore >= OVERALL_INDEX_MODEL.bands.solidFrom ? "solid" : rawScore >= OVERALL_INDEX_MODEL.bands.developingFrom ? "developing" : "low";
}

/**
 * Entero que se muestra: redondeo normal, salvo que el redondeo cruce a la banda siguiente; entonces se trunca
 * (39,5 → 39 y 69,5 → 69), para que el número visible nunca contradiga el estado. Solo presentación: `rawScore`
 * y la clasificación no cambian. El redondeo nunca cruza hacia abajo (40,0–40,49 → 40).
 */
export function displayScoreFor(rawScore: number): number {
  const rounded = Math.round(rawScore);
  return bandFor(rounded) === bandFor(rawScore) ? rounded : Math.floor(rawScore);
}

/**
 * Estado presentado: la banda de `rawScore` con dos topes que solo afectan a «sólida» y nunca bajan el número.
 * Primero el freno material; si no lo hay, la confianza general limitada.
 */
export function classifyOverallState(input: {
  readonly rawScore: number | null;
  readonly confidence: ContextualConfidenceLevel;
  readonly material: { readonly dimension: DigitalDimensionId; readonly constraintId: string } | null;
}): { readonly state: OverallStatusKind; readonly bandState: OverallState | null; readonly cap: OverallCap | null } {
  if (input.rawScore === null) return { state: "insufficient", bandState: null, cap: null };
  const bandState = bandFor(input.rawScore);
  if (bandState !== "solid") return { state: bandState, bandState, cap: null };
  if (input.material) return { state: "developing", bandState, cap: { reason: "material_constraint", ...input.material } };
  if (input.confidence === "low") return { state: "developing", bandState, cap: { reason: "limited_confidence" } };
  return { state: "solid", bandState, cap: null };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function buildDigitalPresenceStatus(input: OverallStatusInput): DigitalPresenceStatus {
  const { scoring, priorities, semanticFacts, narrative } = input;
  const index = computeDigitalPresenceIndex(scoring, { prelaunch: narrative.lifecycle === "prelaunch" });
  const confidence = computeOverallConfidence(scoring, index);
  const material = priorities.constraints.find((item) => item.severity === "material");
  const { state, bandState, cap } = classifyOverallState({ rawScore: index.rawScore, confidence: confidence.level, material: material ? { dimension: material.dimension, constraintId: material.id } : null });
  const provisional = state !== "insufficient" && confidence.level === "low";

  const terms = TERMINOLOGY[narrative.profile].terms;
  const offer = narrative.profile === "nonprofit" || narrative.profile === "prelaunch" ? terms.offer : "lo que ofreces";
  const topic = (dimension: DigitalDimensionId) => (dimension === "clarity_positioning" ? `la claridad de ${offer}` : DIMENSION_NARRATIVE[dimension].topic);
  // Hecho más fuerte y relevante: el orden de los Semantic Facts ya prioriza relevancia, certeza y score.
  const strength: SemanticFact | undefined = semanticFacts.facts.find((fact) => fact.type === "strength");
  const strengthClause = strength ? (strength.certainty === "confirmed" ? `lo más sólido es ${topic(strength.dimension!)}` : `lo más sólido parece ser ${topic(strength.dimension!)}`) : undefined;
  const primary = narrative.priorities[0];
  const constraintDimension = narrative.primaryConstraint?.dimension;
  const constraintCertainty = narrative.primaryConstraint?.certainty;
  const limits = constraintCertainty === "confirmed" ? "limita" : "parece limitar";
  const next = primary ? `Lo siguiente es ${primary.focus}.` : strengthClause ? `${capitalize(strengthClause)}.` : undefined;

  const sentences: string[] = [];
  if (state === "insufficient") {
    sentences.push(narrative.lifecycle === "prelaunch"
      ? "Antes del lanzamiento la mayoría de las áreas todavía no se pueden observar, así que tu presencia digital no se resume en un porcentaje."
      : index.assessed > 0
        ? `Hay señales útiles en las áreas evaluadas, pero todavía no hay suficiente cobertura para resumir toda tu presencia digital en un solo porcentaje.`
        : "Todavía no hay lecturas suficientes para resumir tu presencia digital en un solo porcentaje.");
    sentences.push(primary ? `Lo primero es ${primary.focus}.` : "Las áreas con lectura se explican más abajo.");
  } else if (cap?.reason === "material_constraint") {
    sentences.push(`El promedio de tus áreas es alto, pero ${topic(cap.dimension)} muestra un freno importante; por eso la presencia se considera en desarrollo y no sólida.`);
    if (strengthClause) sentences.push(`${capitalize(strengthClause)}.`);
  } else if (cap?.reason === "limited_confidence") {
    // El tope ya dice que la evidencia es limitada: no se repite el aviso de lectura preliminar.
    sentences.push("Las áreas evaluadas se ven sólidas, pero la evidencia todavía es limitada; por eso tu presencia se presenta como en desarrollo hasta confirmarla.");
    if (next) sentences.push(next);
  } else if (state === "solid") {
    sentences.push(`${capitalize(terms.business)} tiene una base digital sólida en lo evaluado${strengthClause ? `: ${strengthClause}` : ""}.`);
    sentences.push(primary ? `Aun así, ${primary.certainty === "probable" ? "probablemente convenga" : "conviene"} ${primary.focus}.` : "No aparece un freno claro en las áreas evaluadas.");
  } else if (state === "developing") {
    const tail = constraintDimension && constraintCertainty !== "unknown" ? `, pero ${topic(constraintDimension)} todavía ${limits} el avance`
      : constraintDimension ? `, pero falta confirmar ${topic(constraintDimension)}` : ", aunque varias áreas todavía están en construcción";
    sentences.push(`Ya existe una base digital que funciona en parte${tail}.`);
    if (strengthClause) sentences.push(`${capitalize(strengthClause)}.`);
  } else {
    sentences.push(`La base digital todavía tiene huecos importantes${constraintDimension && constraintCertainty !== "unknown" ? `: lo que más ${limits} hoy es ${topic(constraintDimension)}` : ""}.`);
    if (strengthClause) sentences.push(`${capitalize(strengthClause)}.`);
  }
  if (provisional && cap?.reason !== "limited_confidence") sentences.push("Tómalo como una lectura preliminar: varias áreas se basan en poca evidencia.");

  const sourceFactIds = [strength?.id, primary ? `priority:${primary.rank}` : undefined].filter((id): id is string => Boolean(id) && semanticFacts.facts.some((fact) => fact.id === id));
  const certainty: ResultCertainty = state === "insufficient" ? "unknown" : confidence.level === "low" ? "probable" : "confirmed";
  return {
    version: OVERALL_INDEX_VERSION, index, confidence, state, bandState, cap, provisional,
    label: OVERALL_STATUS_LABELS[state], assetSlot: state === "insufficient" ? null : OVERALL_STATE_ASSET_SLOTS[state],
    explanation: {
      text: sentences.join(" "), certainty, sourceFactIds,
      sourceDimensions: [...new Set([...(strength?.dimension ? [strength.dimension] : []), ...(constraintDimension ? [constraintDimension] : []), ...(cap?.reason === "material_constraint" ? [cap.dimension] : [])])],
      ...(primary ? { priorityRank: 1 as const } : {}),
    },
  };
}
