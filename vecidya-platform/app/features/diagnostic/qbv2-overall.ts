import type { ContextualConfidenceLevel } from "./qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-coverage";
import type { DiagnosticScoringView } from "./qbv2-diagnostic-view";
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

export const OVERALL_INDEX_VERSION = 2 as const;

/**
 * Constantes de presentación del contrato global V2. El índice y sus contribuciones permanecen sin cambios; solo la
 * clasificación pública usa los límites inclusivos MAL 0–40, REGULAR 41–70 y BIEN 71–100.
 */
export const OVERALL_INDEX_MODEL = {
  /** Con una o dos lecturas el «índice» solo repetiría esas áreas y cambiaría de banda con una respuesta. */
  minScoredDimensions: 3,
  /** Nunca se resume con menos de un tercio de las áreas aplicables observadas. */
  minCoverage: 1 / 3,
  /** Sobre la media exacta (`rawScore`): low = [0, 41), developing = [41, 71), solid = [71, 100]. */
  bands: { developingFrom: 41, solidFrom: 71 },
  confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 },
} as const;

/**
 * DIAG-V3-R8-A seam: the overall numeric model a caller applies. Every function below defaults to
 * `OVERALL_INDEX_MODEL`, so legacy callers are unchanged; the candidate path passes its isolated calibration.
 */
export type OverallBands = { readonly developingFrom: number; readonly solidFrom: number };
export type OverallIndexModel = {
  readonly minScoredDimensions: number;
  readonly minCoverage: number;
  /** Candidate-only basis for declaring a global result representative; omitted means historical observable coverage. */
  readonly coverageBasis?: "observable_dimensions" | "applicable_dimensions";
  readonly bands: OverallBands;
  readonly confidence: { readonly mediumCoverage: number; readonly highCoverage: number; readonly share: number };
};

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

export const OVERALL_STATUS_CODES: Readonly<Record<OverallStatusKind, "MAL" | "REGULAR" | "BIEN" | null>> = {
  low: "MAL",
  developing: "REGULAR",
  solid: "BIEN",
  insufficient: null,
};

export type GlobalDigitalStatus = {
  readonly status: OverallState;
  readonly publicLabel: "MAL" | "REGULAR" | "BIEN";
  readonly descriptor: string;
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
 * Caveats de una lectura: un freno material o una confianza general limitada explican qué conviene confirmar, pero
 * nunca cambian la banda global derivada del porcentaje.
 */
export type OverallCaveat =
  | { readonly reason: "material_constraint"; readonly dimension: DigitalDimensionId; readonly constraintId: string }
  | { readonly reason: "limited_confidence" };

export type DigitalPresenceStatus = {
  readonly version: typeof OVERALL_INDEX_VERSION;
  readonly index: DigitalPresenceIndex;
  readonly confidence: OverallConfidence;
  readonly state: OverallStatusKind;
  /** Banda numérica de `rawScore`; coincide con `state` cuando existe un índice. */
  readonly bandState: OverallState | null;
  readonly caveat: OverallCaveat | null;
  /** Lectura preliminar: hay índice, pero la confianza general es limitada. */
  readonly provisional: boolean;
  /** Código público de la banda; `null` cuando no existe un índice global. */
  readonly publicLabel: "MAL" | "REGULAR" | "BIEN" | null;
  readonly label: string;
  readonly assetSlot: string | null;
  readonly explanation: OverallExplanation;
};

export type OverallStatusInput = {
  readonly scoring: DiagnosticScoringView;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
  readonly narrative: DiagnosticNarrative;
  /**
   * DIAG-V3-R6-B seam: how index/confidence are computed. Defaults to the legacy functions below, so every
   * existing legacy caller is unaffected. The candidate path supplies its own index computation to exclude
   * bank-unobservable dimensions (zero candidate evidence source, e.g. Measurement) from the coverage
   * denominator, instead of counting them as if the respondent simply hadn't answered yet.
   */
  readonly computeIndex?: (scoring: DiagnosticScoringView, options: { readonly prelaunch?: boolean }) => DigitalPresenceIndex;
  readonly computeConfidence?: (scoring: DiagnosticScoringView, index: DigitalPresenceIndex) => OverallConfidence;
  /** DIAG-V3-R8-A seam: public band thresholds for the state/label. Defaults to `OVERALL_INDEX_MODEL.bands`. */
  readonly bands?: OverallBands;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Antes del lanzamiento no hay índice: lo que se lee es preparación (claridad, base, primer canal), no una presencia
 * en operación, y las capacidades operativas son incertidumbre legítima. Un porcentaje ahí sería precisión falsa.
 */
export function computeDigitalPresenceIndex(scoring: DiagnosticScoringView, options: { readonly prelaunch?: boolean; readonly model?: OverallIndexModel } = {}): DigitalPresenceIndex {
  const model = options.model ?? OVERALL_INDEX_MODEL;
  const byId = new Map(scoring.dimensions.map((item) => [item.id, item]));
  const applicableDimensions = DIGITAL_DIMENSION_IDS.filter((id) => byId.get(id)?.applicability === "applicable");
  const scoredDimensions = applicableDimensions.filter((id) => typeof byId.get(id)!.score === "number");
  const excluded = DIGITAL_DIMENSION_IDS.filter((id) => !scoredDimensions.includes(id))
    .map((dimension) => ({ dimension, reason: applicableDimensions.includes(dimension) ? "no_reading" as const : "not_applicable" as const }));
  const coverage = applicableDimensions.length === 0 ? 0 : round2(scoredDimensions.length / applicableDimensions.length);
  const sufficient = !options.prelaunch && scoredDimensions.length >= model.minScoredDimensions && scoredDimensions.length / Math.max(1, applicableDimensions.length) >= model.minCoverage;
  // Pesos iguales: meta, fricción y prioridad ordenan el trabajo, no miden la capacidad actual.
  const rawScore = sufficient ? scoredDimensions.reduce((total, id) => total + byId.get(id)!.score!, 0) / scoredDimensions.length : null;
  return {
    rawScore, displayScore: rawScore === null ? null : displayScoreForBands(rawScore, model.bands), scoredDimensions, applicableDimensions, excluded,
    assessed: scoredDimensions.length, applicable: applicableDimensions.length, coverage, sufficient,
  };
}

/** Confianza general a partir de la confianza por área y la cobertura; nunca se mezcla con el porcentaje. */
export function computeOverallConfidence(scoring: DiagnosticScoringView, index: DigitalPresenceIndex, overallModel: OverallIndexModel = OVERALL_INDEX_MODEL): OverallConfidence {
  const levels = index.scoredDimensions.map((id) => scoring.dimensions.find((item) => item.id === id)!.confidence.level);
  const atLeastMedium = levels.filter((level) => level !== "low").length;
  const high = levels.filter((level) => level === "high").length;
  const share = (count: number) => (levels.length === 0 ? 0 : count / levels.length);
  const model = overallModel.confidence;
  const level: ContextualConfidenceLevel = !index.sufficient ? "low"
    : index.coverage >= model.highCoverage && share(high) >= model.share ? "high"
      : index.coverage >= model.mediumCoverage && share(atLeastMedium) >= model.share ? "medium" : "low";
  return { level, basis: { coverage: index.coverage, scored: levels.length, atLeastMedium, high } };
}

/** Banda numérica sobre la media exacta: 40 es «low» y 70 es «developing». */
export function bandFor(rawScore: number): OverallState {
  return bandForBands(rawScore, OVERALL_INDEX_MODEL.bands);
}

/**
 * DIAG-V3-R8-A: the same classification against explicit thresholds. `bandFor`, `displayScoreFor` and
 * `resolveGlobalDigitalStatus` keep their single-argument public contract (callers pass them as callbacks);
 * only these `…ForBands` variants accept a calibration.
 */
export function bandForBands(rawScore: number, bands: OverallBands): OverallState {
  return rawScore >= bands.solidFrom ? "solid" : rawScore >= bands.developingFrom ? "developing" : "low";
}

/** Única resolución del estado global y sus etiquetas públicas. */
export function resolveGlobalDigitalStatus(overallScore: number): GlobalDigitalStatus {
  return resolveGlobalDigitalStatusForBands(overallScore, OVERALL_INDEX_MODEL.bands);
}

export function resolveGlobalDigitalStatusForBands(overallScore: number, bands: OverallBands): GlobalDigitalStatus {
  const status = bandForBands(overallScore, bands);
  return { status, publicLabel: OVERALL_STATUS_CODES[status]!, descriptor: OVERALL_STATUS_LABELS[status] };
}

/**
 * Entero que se muestra: redondeo normal, salvo que el redondeo cruce a la banda siguiente; entonces se trunca
 * (40,5 → 40 y 70,5 → 70), para que el número visible nunca contradiga el estado. Solo presentación: `rawScore`
 * y la clasificación no cambian. El redondeo nunca cruza hacia abajo (41,0–41,49 → 41).
 */
export function displayScoreFor(rawScore: number): number {
  return displayScoreForBands(rawScore, OVERALL_INDEX_MODEL.bands);
}

export function displayScoreForBands(rawScore: number, bands: OverallBands): number {
  const rounded = Math.round(rawScore);
  return bandForBands(rounded, bands) === bandForBands(rawScore, bands) ? rounded : Math.floor(rawScore);
}

/**
 * Estado presentado: la banda de `rawScore`; los caveats explican el contexto sin cambiarla.
 */
export function classifyOverallState(input: {
  readonly rawScore: number | null;
  readonly confidence: ContextualConfidenceLevel;
  readonly material: { readonly dimension: DigitalDimensionId; readonly constraintId: string } | null;
  readonly bands?: OverallBands;
}): { readonly state: OverallStatusKind; readonly bandState: OverallState | null; readonly caveat: OverallCaveat | null } {
  if (input.rawScore === null) return { state: "insufficient", bandState: null, caveat: null };
  const canonical = resolveGlobalDigitalStatusForBands(input.rawScore, input.bands ?? OVERALL_INDEX_MODEL.bands);
  const bandState = canonical.status;
  if (bandState !== "solid") return { state: bandState, bandState, caveat: null };
  if (input.material) return { state: bandState, bandState, caveat: { reason: "material_constraint", ...input.material } };
  if (input.confidence === "low") return { state: bandState, bandState, caveat: { reason: "limited_confidence" } };
  return { state: bandState, bandState, caveat: null };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function buildDigitalPresenceStatus(input: OverallStatusInput): DigitalPresenceStatus {
  const { scoring, priorities, semanticFacts, narrative } = input;
  const computeIndex = input.computeIndex ?? computeDigitalPresenceIndex;
  const computeConfidence = input.computeConfidence ?? computeOverallConfidence;
  const index = computeIndex(scoring, { prelaunch: narrative.lifecycle === "prelaunch" });
  const confidence = computeConfidence(scoring, index);
  const material = priorities.constraints.find((item) => item.severity === "material");
  const { state, bandState, caveat } = classifyOverallState({ rawScore: index.rawScore, confidence: confidence.level, material: material ? { dimension: material.dimension, constraintId: material.id } : null, bands: input.bands });
  const canonical = index.rawScore === null ? null : resolveGlobalDigitalStatusForBands(index.rawScore, input.bands ?? OVERALL_INDEX_MODEL.bands);
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
  } else if (caveat?.reason === "material_constraint") {
    sentences.push(`El promedio de tus áreas es alto, pero ${topic(caveat.dimension)} muestra un freno importante que conviene atender.`);
    if (strengthClause) sentences.push(`${capitalize(strengthClause)}.`);
  } else if (caveat?.reason === "limited_confidence") {
    // El caveat ya dice que la evidencia es limitada: no se repite el aviso de lectura preliminar.
    sentences.push("Las áreas evaluadas se ven sólidas, pero la evidencia todavía es limitada; tómalo como una lectura preliminar hasta confirmarla.");
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
  if (provisional && caveat?.reason !== "limited_confidence") sentences.push("Tómalo como una lectura preliminar: varias áreas se basan en poca evidencia.");

  const sourceFactIds = [strength?.id, primary ? `priority:${primary.rank}` : undefined].filter((id): id is string => Boolean(id) && semanticFacts.facts.some((fact) => fact.id === id));
  const certainty: ResultCertainty = state === "insufficient" ? "unknown" : confidence.level === "low" ? "probable" : "confirmed";
  return {
    version: OVERALL_INDEX_VERSION, index, confidence, state, bandState, caveat, provisional,
    publicLabel: canonical?.publicLabel ?? null,
    label: canonical?.descriptor ?? OVERALL_STATUS_LABELS[state], assetSlot: state === "insufficient" ? null : OVERALL_STATE_ASSET_SLOTS[state],
    explanation: {
      text: sentences.join(" "), certainty, sourceFactIds,
      sourceDimensions: [...new Set([...(strength?.dimension ? [strength.dimension] : []), ...(constraintDimension ? [constraintDimension] : []), ...(caveat?.reason === "material_constraint" ? [caveat.dimension] : [])])],
      ...(primary ? { priorityRank: 1 as const } : {}),
    },
  };
}
