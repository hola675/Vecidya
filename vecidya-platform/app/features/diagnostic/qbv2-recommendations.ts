import type { ContextualConfidenceLevel } from "./qbv2-contextual-scoring";
import type { DigitalDimensionId } from "./qbv2-coverage";
import type { DiagnosticScoringView } from "./qbv2-diagnostic-view";
import { DIMENSION_RESULT_CONCEPT, type ResultCertainty } from "./qbv2-language";
import type { DiagnosticNarrative, NarrativePriority } from "./qbv2-narrative";
import { DIMENSION_NARRATIVE } from "./qbv2-narrative-phrases";
import { DIMENSION_DEPENDENCIES, SEVERITY_BANDS, type ConstraintKind, type ConstraintPriorityResult, type ConstraintSeverity, type PriorityCertainty, type PriorityReasonCode, type SeverityBands } from "./qbv2-priorities";
import type { SemanticDiagnosticFacts } from "./qbv2-semantic-facts";
import { TERMINOLOGY, type TerminologyProfileId } from "./qbv2-terminology";

/**
 * DIAG-V3-10 — Recommendation Engine. Responde «¿qué capacidad conviene mejorar?», no «¿qué vende Vecidya?».
 * Una recomendación por prioridad de 08D (como mucho principal, secundaria y de apoyo), en el mismo orden: no
 * reordena, no añade prioridades y no recomienda nada por un score bajo sin prioridad detrás. Cada recomendación
 * conserva su procedencia (prioridad, restricción, hechos y preguntas). No lee estado de UI.
 */

export const RECOMMENDATION_VERSION = 1 as const;

/** Taxonomía compacta: un tipo por capacidad del diagnóstico. */
export const RECOMMENDATION_TYPES = ["clarity", "foundation", "discovery", "trust", "conversion", "follow_up", "measurement", "readiness"] as const;
export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

/**
 * `improve`: hay evidencia de una capacidad débil o parcial. `verify`: falta evidencia, primero se confirma.
 * `prepare`: antes del lanzamiento, preparar lo que todavía no se puede observar. `reduce_dependency`: la
 * capacidad funciona pero depende de un solo canal o persona.
 */
export const RECOMMENDATION_MODES = ["improve", "verify", "prepare", "reduce_dependency"] as const;
export type RecommendationMode = (typeof RECOMMENDATION_MODES)[number];

export const DIMENSION_RECOMMENDATION_TYPE: Readonly<Record<DigitalDimensionId, RecommendationType>> = {
  clarity_positioning: "clarity", digital_foundation: "foundation", discovery: "discovery", trust_reputation: "trust",
  conversion_access: "conversion", relationship_recurrence: "follow_up", measurement_optimization: "measurement", digital_readiness: "readiness",
};

/** Cómo se presenta la certeza de 08D: una recomendación con poca evidencia nunca se afirma como necesidad. */
export type RecommendationFraming = "recommended" | "probable" | "verify_first";
export const RECOMMENDATION_FRAMING: Readonly<Record<PriorityCertainty, RecommendationFraming>> = { actionable: "recommended", likely: "probable", verify_first: "verify_first" };

export type RecommendationUrgency = "high" | "medium" | "verify";

export type RecommendationPrerequisite = {
  readonly dimension: DigitalDimensionId;
  readonly relation: "enables" | "sustains";
  /** Cumplido cuando el área previa tiene una lectura establecida o mejor. */
  readonly satisfied: boolean;
  /** Recomendación de este mismo resultado que atiende el requisito, si existe. */
  readonly recommendationId: string | null;
};

export type RecommendationEvidence = { readonly text: string; readonly sourceFactIds: readonly string[]; readonly sourceQuestionIds: readonly string[] };

export type DiagnosticRecommendation = {
  readonly id: string;
  readonly rank: 1 | 2 | 3;
  readonly slot: NarrativePriority["slot"];
  readonly type: RecommendationType;
  readonly mode: RecommendationMode;
  readonly dimension: DigitalDimensionId;
  readonly title: string;
  readonly whatToImprove: string;
  /** El «por qué» de la prioridad, sin reescribir: ya está respaldado por sus códigos de razón. */
  readonly whyItMatters: string;
  /** Hallazgo que la sostiene (texto de la narrativa) y los temas de las respuestas. */
  readonly evidence: RecommendationEvidence;
  readonly evidenceTopics: readonly string[];
  readonly targetDimensions: readonly DigitalDimensionId[];
  readonly sourcePriority: { readonly rank: 1 | 2 | 3; readonly constraintId: string; readonly reasonCodes: readonly PriorityReasonCode[] };
  readonly sourceConstraint: { readonly id: string; readonly kind: ConstraintKind; readonly severity: ConstraintSeverity; readonly score: number | null };
  readonly sourceFactIds: readonly string[];
  readonly sourceQuestionIds: readonly string[];
  readonly confidence: ContextualConfidenceLevel;
  readonly certainty: ResultCertainty;
  readonly framing: RecommendationFraming;
  readonly urgency: RecommendationUrgency;
  readonly prerequisites: readonly RecommendationPrerequisite[];
  /** Cualitativo: nunca porcentajes ni retorno inventado. */
  readonly expectedOutcome: string;
};

export type DiagnosticRecommendations = {
  readonly version: typeof RECOMMENDATION_VERSION;
  readonly items: readonly DiagnosticRecommendation[];
};

export type RecommendationInput = {
  readonly scoring: DiagnosticScoringView;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
  readonly narrative: DiagnosticNarrative;
  /** DIAG-V3-R8-A: the bands that decide a "sound" prerequisite. Defaults to the legacy `SEVERITY_BANDS`. */
  readonly severity?: SeverityBands;
};

type Copy ={ readonly offer: string; readonly conversion: string; readonly business: string };

/** Qué capacidad mejorar, en el lenguaje del perfil (sin términos de la lista a evitar). */
const WHAT_TO_IMPROVE: Readonly<Record<RecommendationType, (copy: Copy) => string>> = {
  clarity: ({ offer }) => `Que en tus canales se entienda ${offer}, para quién es y cuál es el siguiente paso.`,
  foundation: () => "Tener una base digital propia y actualizada, con la información esencial y una forma clara de contacto.",
  discovery: () => "Que te encuentren por varias vías estables, sin depender de una sola.",
  trust: () => "Que quien te evalúa vea pruebas reales de confianza: experiencias de otras personas, trayectoria o resultados verificables.",
  conversion: ({ conversion }) => `Que el paso de mostrar interés a ${conversion} sea simple y directo.`,
  follow_up: () => "Que cada contacto tenga un siguiente paso, una persona responsable y un registro, para que el seguimiento no dependa de la memoria.",
  measurement: () => "Saber de dónde llega el interés y qué acciones dan resultado.",
  readiness: () => "Reunir la información y las tareas del día a día en un solo lugar, con responsables claros.",
};

const PREPARE: Readonly<Record<RecommendationType, (copy: Copy) => string>> = {
  clarity: ({ offer }) => `Definir con precisión ${offer}, para quién es y cuál será el primer paso.`,
  foundation: () => "Preparar la base digital mínima para el lanzamiento: información esencial y una forma de contacto.",
  discovery: () => "Elegir y preparar el primer canal por el que te encontrarán al lanzar.",
  trust: () => "Pensar desde ahora cómo vas a mostrar confianza cuando lleguen las primeras personas.",
  conversion: ({ conversion }) => `Definir cómo podrán ${conversion} desde el primer día.`,
  follow_up: () => "Definir cómo vas a dar seguimiento a las primeras personas interesadas.",
  measurement: () => "Decidir desde ahora qué vas a medir cuando lances.",
  readiness: () => "Preparar la forma de trabajo para atender las primeras solicitudes.",
};

const EXPECTED_OUTCOME: Readonly<Record<RecommendationType, (copy: Copy) => string>> = {
  clarity: ({ offer }) => `Que se entienda más rápido ${offer}.`,
  foundation: () => "Información esencial más accesible y una vía de contacto claramente identificada.",
  discovery: () => "Más formas de que te encuentren, con menos dependencia de una sola vía.",
  trust: () => "Más confianza en el momento de decidir.",
  conversion: () => "Menos interés que se queda sin avanzar.",
  follow_up: () => "Menos contactos que se quedan sin respuesta o sin siguiente paso.",
  measurement: () => "Visibilidad sobre qué funciona, para decidir con datos.",
  readiness: () => "Menos trabajo manual repetido y menos información dispersa.",
};

/** Comprobaciones observables: no presuponen que exista un problema. */
const VERIFY_ACTION: Readonly<Record<RecommendationType, string>> = {
  clarity: "Revisar la información publicada en los canales del negocio y confirmar si explica qué ofrece, a quién y cómo contactar.",
  foundation: "Revisar los canales digitales activos y comprobar si muestran información actualizada y una vía de contacto funcional.",
  discovery: "Consultar con quien atiende las consultas cómo llegan los nuevos clientes y revisar los registros disponibles por canal.",
  trust: "Revisar las reseñas, referencias y testimonios disponibles para comprobar qué señales de confianza pueden verificarse.",
  conversion: "Revisar con quien atiende las solicitudes cómo se pasa de una consulta a una reserva o compra, y comprobar los registros disponibles.",
  follow_up: "Revisar con la persona responsable las consultas recientes, sus respuestas y los contactos que aún necesitan seguimiento.",
  measurement: "Comprobar qué registros existen sobre consultas, su procedencia y resultados antes de decidir qué indicadores mejorar.",
  readiness: "Revisar con el equipo dónde se registran las tareas, quién las gestiona y cómo se consultan las solicitudes pendientes.",
};

const copyFor = (profile: TerminologyProfileId): Copy => {
  const terms = TERMINOLOGY[profile].terms;
  return { offer: profile === "nonprofit" || profile === "prelaunch" ? terms.offer : "lo que ofreces", conversion: terms.conversion, business: terms.business };
};
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function buildDiagnosticRecommendations(input: RecommendationInput): DiagnosticRecommendations {
  const { scoring, priorities, narrative } = input;
  const severity = input.severity ?? SEVERITY_BANDS;
  const copy = copyFor(narrative.profile);
  const byId = new Map(scoring.dimensions.map((item) => [item.id, item]));
  const factIds = new Set(input.semanticFacts.facts.map((fact) => fact.id));
  const recommendationIdFor = (rank: number) => `recommendation:${rank}`;

  const items = narrative.priorities.map((priority): DiagnosticRecommendation => {
    const constraint = priorities.priorities.find((item) => item.rank === priority.rank)!;
    const type = DIMENSION_RECOMMENDATION_TYPE[priority.dimension];
    const mode: RecommendationMode = constraint.kind === "evidence_gap" ? (narrative.lifecycle === "prelaunch" ? "prepare" : "verify")
      : constraint.kind === "dependency_risk" ? "reduce_dependency" : narrative.lifecycle === "prelaunch" ? "prepare" : "improve";
    const whatToImprove = mode === "verify" ? VERIFY_ACTION[type]
      : mode === "prepare" ? PREPARE[type](copy)
        : mode === "reduce_dependency" ? `Reducir la dependencia de un solo canal o persona en ${DIMENSION_NARRATIVE[priority.dimension].topic}.`
          : WHAT_TO_IMPROVE[type](copy);
    const expectedOutcome = mode === "verify" ? "Decidir con evidencia en lugar de suposiciones." : mode === "prepare" ? "Lanzar con lo esencial listo." : EXPECTED_OUTCOME[type](copy);

    // Hallazgo: la restricción principal para el rango 1; para los demás, la lectura de la narrativa de esa área.
    const reading = priority.rank === 1 && narrative.primaryConstraint ? narrative.primaryConstraint
      : narrative.weaknesses.find((block) => block.dimension === priority.dimension) ?? narrative.dimensions.find((item) => item.dimension === priority.dimension)!.interpretation;
    const dimension = narrative.dimensions.find((item) => item.dimension === priority.dimension)!;

    const prerequisites = DIMENSION_DEPENDENCIES
      .filter((edge) => edge.to === priority.dimension && (edge.relation === "enables" || edge.relation === "sustains") && byId.get(edge.from)?.applicability === "applicable")
      .map((edge): RecommendationPrerequisite => {
        const score = byId.get(edge.from)!.score;
        const addressing = narrative.priorities.find((item) => item.dimension === edge.from && item.rank < priority.rank);
        return { dimension: edge.from, relation: edge.relation as "enables" | "sustains", satisfied: score !== null && score >= severity.moderateBelow, recommendationId: addressing ? recommendationIdFor(addressing.rank) : null };
      });

    return {
      id: recommendationIdFor(priority.rank), rank: priority.rank, slot: priority.slot, type, mode, dimension: priority.dimension,
      title: capitalize(priority.focus), whatToImprove, whyItMatters: priority.why.text.trim() === reading.text.trim() ? "Esta información ayuda a determinar qué acción conviene priorizar." : priority.why.text,
      evidence: { text: reading.text, sourceFactIds: reading.sourceFactIds, sourceQuestionIds: reading.sourceQuestionIds },
      evidenceTopics: dimension.evidence.map((item) => item.topic),
      targetDimensions: [priority.dimension, ...constraint.dependency.blocks.filter((id) => id !== priority.dimension)],
      sourcePriority: { rank: priority.rank, constraintId: constraint.id, reasonCodes: constraint.reasonCodes },
      sourceConstraint: { id: constraint.id, kind: constraint.kind, severity: constraint.severity, score: constraint.score },
      sourceFactIds: [...new Set([`priority:${priority.rank}`, ...priority.statement.sourceFactIds, ...reading.sourceFactIds])].filter((id) => factIds.has(id)),
      sourceQuestionIds: [...new Set([...priority.statement.sourceQuestionIds, ...reading.sourceQuestionIds])],
      confidence: constraint.confidence, certainty: priority.certainty, framing: RECOMMENDATION_FRAMING[constraint.certainty],
      urgency: constraint.severity === "material" ? "high" : constraint.severity === "unknown" ? "verify" : "medium",
      prerequisites, expectedOutcome,
    };
  });
  return { version: RECOMMENDATION_VERSION, items };
}
