import type {
  CommercialMatch, CommercialRole, ContextualConfidenceLevel, DiagnosticNarrative, DiagnosticOutcome, DiagnosticRecommendation, DigitalPresenceStatus, DimensionInterpretation,
  DimensionPresentationStatus, HelpItem, NarrativeBlock, NarrativePriority, NoOfferingReason, RecommendationFraming, ResultCertainty, TerminologyProfileId,
} from "../../features/diagnostic";

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

/**
 * Áreas para fortalecer: conserva la diferencia entre parcial y debilidad probable o confirmada. Las dependencias
 * de un solo canal o persona son riesgos y se muestran en «Riesgos y lo que falta confirmar» (DIAG-V3-10).
 */
export type AreaDisplay = { readonly block: NarrativeBlock; readonly tone: "partial" | "weak" | "dependency"; readonly label: string };

export function areaItems(narrative: DiagnosticNarrative): readonly AreaDisplay[] {
  return narrative.weaknesses.filter((block) => block.kind !== "dependency").map((block) => (block.kind === "partial"
    ? { block, tone: "partial" as const, label: "Funciona en parte" }
    : { block, tone: "weak" as const, label: block.certainty === "confirmed" ? "Necesita refuerzo" : "Posible debilidad" }));
}

/** Riesgos observados: dependencias respaldadas por respuestas concretas (cada bloque conserva su procedencia). */
export function riskItems(narrative: DiagnosticNarrative): readonly AreaDisplay[] {
  return narrative.weaknesses.filter((block) => block.kind === "dependency").map((block) => ({ block, tone: "dependency" as const, label: block.certainty === "confirmed" ? "Dependencia" : "Posible dependencia" }));
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

// ── DIAG-V3-10: estado general, plan de acción y ayuda de Vecidya ─────────────

/** Estado general: porcentaje, nombre, explicación y, por separado, confianza y cobertura. */
export type PresenceDisplay = {
  readonly status: DigitalPresenceStatus;
  /** `null` cuando no hay índice: nunca se muestra como 0%. */
  readonly percent: string | null;
  readonly confidence: (typeof CONFIDENCE_DISPLAY)[ContextualConfidenceLevel];
  readonly coverage: string;
};

export function presenceDisplay(status: DigitalPresenceStatus): PresenceDisplay {
  return {
    status,
    percent: status.index.displayScore === null ? null : `${status.index.displayScore}%`,
    confidence: CONFIDENCE_DISPLAY[status.confidence.level],
    coverage: `${status.index.assessed} de ${status.index.applicable} áreas aplicables con lectura`,
  };
}

export const FRAMING_DISPLAY: Readonly<Record<RecommendationFraming, string>> = {
  recommended: "Recomendado",
  probable: "Probablemente conveniente",
  verify_first: "Conviene verificar primero",
};

/** Un paso del plan: resume una prioridad ya justificada, sin repetir su «por qué». */
export type ActionStep = {
  readonly recommendation: DiagnosticRecommendation;
  readonly tag: string;
  readonly area: string | undefined;
  /** Pasos anteriores de los que depende, como números de paso. */
  readonly after: readonly number[];
};

const stepOf = (recommendationId: string) => Number(recommendationId.split(":")[1]);

export function actionSteps(narrative: DiagnosticNarrative, outcome: DiagnosticOutcome): readonly ActionStep[] {
  return outcome.recommendations.items.map((recommendation) => ({
    recommendation,
    tag: recommendation.mode === "prepare" ? "Para preparar el lanzamiento" : FRAMING_DISPLAY[recommendation.framing],
    area: dimensionLabelOf(narrative, recommendation.dimension),
    after: recommendation.prerequisites.filter((item) => !item.satisfied && item.recommendationId).map((item) => stepOf(item.recommendationId!)),
  }));
}

export const COMMERCIAL_ROLE_DISPLAY: Readonly<Record<CommercialRole, string>> = {
  recommended_service: "Servicio",
  optional_license: "Licencia opcional",
  optional_addon: "Addon opcional",
  required_license: "Licencia requerida",
};

export const NO_OFFERING_DISPLAY: Readonly<Record<NoOfferingReason, string>> = {
  verify_first: "Primero conviene confirmar este punto; por ahora no corresponde proponer un producto.",
  no_solution: "Con la evidencia actual no corresponde proponer una intervención concreta.",
  not_in_catalog: "Vecidya no tiene hoy una oferta específica para esto. Puedes avanzar con la solución descrita por tu cuenta o con quien prefieras.",
  prelaunch_no_license: "Antes del lanzamiento no se propone una licencia: primero conviene definir y validar la propuesta.",
};

export type HelpDisplay = {
  readonly item: HelpItem;
  readonly step: number;
  readonly recommendation: DiagnosticRecommendation;
  readonly offerings: readonly CommercialMatch[];
  readonly noOffering: string | null;
  /** Cadena «¿Por qué te recomendamos esto?», del dato al producto. */
  readonly proof: readonly { readonly label: string; readonly text: string }[];
};

export function helpItems(narrative: DiagnosticNarrative, outcome: DiagnosticOutcome): readonly HelpDisplay[] {
  return outcome.help.items.map((item) => {
    const recommendation = outcome.recommendations.items.find((entry) => entry.id === item.recommendationId)!;
    const proof = item.offerings[0]?.proof;
    const chain = proof ? [
      { label: "Lo que respondiste", text: proof.evidenceTopics.length > 0 ? `${capitalize(proof.evidenceTopics.join("; "))}.` : "Tus respuestas sobre esta área." },
      { label: "Lo que encontramos", text: proof.finding },
      { label: `${PRIORITY_SLOT_DISPLAY[proof.priority.slot]} · ${dimensionLabelOf(narrative, proof.constraint.dimension) ?? ""}`, text: proof.priority.statement },
      { label: "Mejora recomendada", text: proof.recommendation.title },
      { label: "Tipo de solución", text: proof.solution.label },
      { label: "Cómo puede ayudar Vecidya", text: item.offerings.map((match) => match.offering.name).join(", ") },
    ] : [];
    return { item, step: recommendation.rank, recommendation, offerings: item.offerings, noOffering: item.noOffering ? NO_OFFERING_DISPLAY[item.noOffering] : null, proof: chain };
  });
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
  presence: {
    question: "¿Cómo se calcula este porcentaje?",
    paragraphs: [
      "Es el promedio, con el mismo peso, de las áreas que aplican a tu situación y tienen lectura. Las áreas sin lectura o que no aplican no cuentan como cero; con menos de tres áreas con lectura no se calcula.",
      "El estado se decide con el promedio exacto, antes de redondear: por debajo de 40 es una presencia por fortalecer, desde 40 y por debajo de 70 una presencia en desarrollo, y desde 70 una presencia sólida.",
      "Una presencia solo se llama sólida si ningún área muestra un freno importante y si hay evidencia suficiente; si no, se presenta como en desarrollo, aunque el promedio sea alto.",
      "La confianza del resultado va aparte: indica cuánta evidencia respalda las lecturas, no qué tan bien estás. Este porcentaje tampoco decide las prioridades.",
    ],
  },
  priorities: {
    question: "¿Cómo se decide este orden?",
    paragraphs: [
      "El orden no depende de los porcentajes. Considera qué tan fuerte es cada freno, qué áreas dependen de otras y su relación con lo que quieres lograr o con lo que señalaste como freno.",
    ],
  },
} as const;

/** Alcance del resultado, al pie de «Cómo se evaluó». Las explicaciones del método viven en `qbv2-methodology.ts` (DIAG-V3-11). */
export const RESULT_DISCLAIMER = "Este resultado es una orientación basada en tus respuestas, no una auditoría ni una certificación. Las opciones de Vecidya aparecen solo cuando se relacionan con una prioridad del diagnóstico, y el resultado sirve aunque no contrates nada.";
