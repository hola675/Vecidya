import type { ContextualConfidenceLevel, DiagnosticNarrative, DimensionInterpretation, DimensionPresentationStatus, NarrativeBlock, NarrativePriority, ResultCertainty, TerminologyProfileId } from "../../features/diagnostic";

/**
 * DIAG-V3-09 — mapeo de presentación del resultado. Solo traduce valores del `DiagnosticNarrative` a etiquetas
 * visibles y decide en qué sección se muestra cada bloque. No lee respuestas, scores crudos ni hechos, no
 * recalcula estados, certeza ni orden, y nunca reescribe el texto de la narrativa: los componentes muestran
 * `block.text` tal cual. Sin JSX, para poder probarlo y reutilizarlo en el futuro PDF.
 */

/** Etiqueta visible del nivel de confianza. Solo copy: el valor de dominio no cambia. */
export const CONFIDENCE_DISPLAY: Readonly<Record<ContextualConfidenceLevel, { readonly label: string; readonly steps: 1 | 2 | 3 }>> = {
  high: { label: "Alta", steps: 3 },
  medium: { label: "Media", steps: 2 },
  low: { label: "Limitada", steps: 1 },
};

export const CERTAINTY_DISPLAY: Readonly<Record<ResultCertainty, string>> = {
  confirmed: "Confirmado",
  probable: "Probable",
  unknown: "Por confirmar",
};

/** Estados con lectura numérica; el resto nunca muestra porcentaje. */
const SCORED_STATUSES: ReadonlySet<DimensionPresentationStatus> = new Set(["strong", "positive_signal", "partial", "weak"]);

/** Contexto del resultado: con qué lente de lenguaje se leyó. Etiquetas de visualización de un enum de dominio. */
export const PROFILE_DISPLAY: Readonly<Record<TerminologyProfileId, string>> = {
  generic: "Negocio",
  prelaunch: "Proyecto en preparación",
  local: "Negocio local",
  local_service: "Servicio en tu zona",
  appointments: "Servicio con citas",
  clinical: "Práctica de salud",
  professional: "Práctica profesional",
  retail: "Tienda",
  ecommerce: "Tienda en línea",
  hospitality: "Restaurante u hospedaje",
  b2b: "Venta a empresas",
  creator: "Creación de contenido",
  nonprofit: "Organización sin fines de lucro",
};

export const LIFECYCLE_DISPLAY: Readonly<Record<DiagnosticNarrative["lifecycle"], string>> = {
  prelaunch: "Antes del lanzamiento",
  live: "En marcha",
};

export const PRIORITY_SLOT_DISPLAY: Readonly<Record<NarrativePriority["slot"], string>> = {
  primary: "Prioridad principal",
  secondary: "Prioridad secundaria",
  supporting: "Prioridad de apoyo",
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export type DimensionDisplay = {
  readonly dimension: DimensionInterpretation;
  readonly statusLabel: string;
  /** Solo cuando hay lectura numérica; `null` nunca se muestra como `0%`. */
  readonly percent: string | null;
  /** Confianza visible solo cuando hay una estimación que respaldar. */
  readonly confidence: (typeof CONFIDENCE_DISPLAY)[ContextualConfidenceLevel] | null;
  /** Lectura preliminar: hay porcentaje pero la evidencia es limitada. */
  readonly preliminary: boolean;
  /** Encabezado de la lista de evidencia: lo que sostiene la lectura o lo que se preguntó sin obtenerla. */
  readonly evidenceLead: string;
};

export function dimensionDisplay(dimension: DimensionInterpretation): DimensionDisplay {
  const scored = SCORED_STATUSES.has(dimension.status) && dimension.score !== null;
  return {
    dimension,
    statusLabel: capitalize(dimension.statusLabel),
    percent: scored ? `${dimension.score}%` : null,
    confidence: scored ? CONFIDENCE_DISPLAY[dimension.confidence] : null,
    preliminary: scored && dimension.confidence === "low",
    evidenceLead: scored ? "Se basa en tus respuestas sobre:" : "Se preguntó sobre:",
  };
}

export type DimensionOverviewModel = {
  /** Las 8 dimensiones, siempre en el orden canónico del dominio. */
  readonly items: readonly DimensionDisplay[];
  readonly hasUnscored: boolean;
  /** Una sola explicación contextual cuando hay lecturas preliminares, en lugar de repetirla en cada fila. */
  readonly preliminaryNote: string | null;
  /** Antes del lanzamiento, aclara de entrada por qué varias áreas no tienen porcentaje. */
  readonly lifecycleNote: string | null;
};

export function dimensionOverview(narrative: DiagnosticNarrative): DimensionOverviewModel {
  const items = narrative.dimensions.map(dimensionDisplay);
  const preliminary = items.some((item) => item.preliminary);
  const prelaunch = narrative.lifecycle === "prelaunch";
  // Una sola nota por resultado: antes del lanzamiento la explicación de etapa ya incluye la leyenda de la barra.
  return {
    items,
    hasUnscored: items.some((item) => item.percent === null),
    preliminaryNote: preliminary && !prelaunch
      ? "Algunas lecturas son preliminares porque esta ruta se concentró en las áreas más relevantes para tu situación. Las barras rayadas las marcan."
      : null,
    lifecycleNote: prelaunch
      ? `Antes del lanzamiento, las áreas que dependen de tener actividad real aparecen sin porcentaje: no son fallas, todavía no se pueden observar.${preliminary ? " Las barras rayadas marcan lecturas preliminares." : ""}`
      : null,
  };
}

/** Fortalezas: una fortaleza confirmada y una señal positiva nunca se presentan como equivalentes. */
export type StrengthDisplay = { readonly block: NarrativeBlock; readonly kind: "confirmed" | "signal"; readonly label: string };

export function strengthItems(narrative: DiagnosticNarrative): readonly StrengthDisplay[] {
  return narrative.strengths.map((block) => (block.certainty === "confirmed"
    ? { block, kind: "confirmed" as const, label: "Fortaleza confirmada" }
    : { block, kind: "signal" as const, label: "Señal positiva" }));
}

/** Áreas para fortalecer: conserva la diferencia entre parcial, debilidad probable o confirmada y dependencia. */
export type AreaDisplay = { readonly block: NarrativeBlock; readonly tone: "partial" | "weak" | "dependency"; readonly label: string };

export function areaItems(narrative: DiagnosticNarrative): readonly AreaDisplay[] {
  return narrative.weaknesses.map((block) => {
    if (block.kind === "partial") return { block, tone: "partial" as const, label: "Funciona en parte" };
    if (block.kind === "dependency") return { block, tone: "dependency" as const, label: block.certainty === "confirmed" ? "Dependencia" : "Posible dependencia" };
    return { block, tone: "weak" as const, label: block.certainty === "confirmed" ? "Necesita refuerzo" : "Posible debilidad" };
  });
}

/** Incertidumbres: lo que se podrá verificar tras el lanzamiento se separa de lo que falta confirmar hoy. */
export function uncertaintyGroups(narrative: DiagnosticNarrative): readonly { readonly title: string; readonly items: readonly NarrativeBlock[] }[] {
  const afterLaunch = narrative.uncertainties.filter((block) => block.sourceContext.includes("growthStage"));
  const pending = narrative.uncertainties.filter((block) => !block.sourceContext.includes("growthStage"));
  return [
    { title: "Lo que falta confirmar", items: pending },
    { title: "Para verificar después del lanzamiento", items: afterLaunch },
  ].filter((group) => group.items.length > 0);
}

export function dimensionLabelOf(narrative: DiagnosticNarrative, dimension: NarrativeBlock["dimension"]): string | undefined {
  return dimension ? narrative.dimensions.find((item) => item.dimension === dimension)?.label : undefined;
}

/**
 * El siguiente foco repite el orden de una lista de prioridades con dos o más elementos; solo se muestra cuando
 * aporta información (una prioridad o ninguna).
 */
export const showNextFocus = (narrative: DiagnosticNarrative) => narrative.priorities.length <= 1;

/** Ayuda contextual. Explica cómo leer el resultado; no cita metodologías externas (capa posterior). */
export const RESULT_HELP = {
  score: {
    question: "¿Qué significan el porcentaje y la confianza?",
    paragraphs: [
      "El porcentaje estima qué tan desarrollada se ve esa área según lo que respondiste. No es una calificación ni una probabilidad.",
      "La confianza indica cuánta evidencia respalda esa estimación: alta, media o limitada.",
      "Un porcentaje alto con confianza limitada quiere decir que lo que se vio es positivo, pero no hubo suficiente evidencia para tomarlo como una conclusión definitiva.",
    ],
  },
  dimensions: {
    question: "¿Qué son estas ocho áreas?",
    paragraphs: [
      "Son las ocho áreas con las que Vecidya lee tu presencia digital: desde qué tan clara es tu propuesta hasta la base de trabajo del día a día.",
      "Siempre aparecen las ocho, en el mismo orden. Las que no tienen porcentaje se explican aparte.",
    ],
  },
  unscored: {
    question: "¿Por qué algunas áreas no tienen porcentaje?",
    paragraphs: [
      "El recorrido se adapta: profundiza en las áreas más relevantes para tu situación y no hace todas las preguntas a todos.",
      "Un área sin porcentaje no es una debilidad. Puede faltar información, no haberse evaluado en este recorrido o no aplicar a tu situación.",
    ],
  },
  priorities: {
    question: "¿Cómo se decide este orden?",
    paragraphs: [
      "El orden no depende de los porcentajes. Considera qué tan fuerte es cada freno, qué áreas dependen de otras y su relación con lo que quieres lograr o con lo que señalaste como freno.",
    ],
  },
} as const;

/** Reserva de «Cómo se evaluó»: solo lo que ya es cierto del método, sin fuentes externas todavía. */
export const METHOD_NOTES = [
  "Tus respuestas se evaluaron por área: cada una se lee según lo que mide.",
  "No todas las áreas necesitan el mismo número de preguntas; el recorrido profundiza donde importa más para tu situación.",
  "La confianza indica cuánta evidencia respalda cada lectura, por eso se muestra junto a cada porcentaje.",
] as const;
