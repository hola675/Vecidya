import type { BusinessModel, EntityType, GrowthStage, NicheGroup, OperationalArchetype, PrimaryFriction, PrimaryGoal, QuestionVersion } from "./contracts";
import type { DimensionId } from "./types";
import type { SignalProduction } from "./qbv2-signals";
import type { RuleV2 } from "./qbv2-rules";

/**
 * Contrato de pregunta de DIAG-V3-08B.2 (Question Bank Architecture). Define la FÁBRICA — no las
 * ~100-150 preguntas de DIAG-V3-08B.3, que todavía no existen. Cada tipo de aquí tiene al menos un
 * consumidor real en esta misma fase (motor + validadores + golden harness, §4: "no añadir campos sin
 * consumidor").
 */

// ── Módulos (§7-9) ───────────────────────────────────────────────────────────

/**
 * Auditados contra 08B.0/08B.1 (§7: "no copiar esta lista automáticamente"). Cuatro universales
 * (`core`/`classification`/`maturity`/`goal_friction`) + uno por `OperationalArchetype` no-híbrido
 * (9 valores reales tras retirar `organization`/`startup` en 08B.1) + `nonprofit` (por `BusinessModel`,
 * no por archetype — un nonprofit puede operar como `local`/`hospitality`/`b2b`, su necesidad
 * diferenciadora es la MISIÓN, no el mecanismo de entrega) + `startup` (por `GrowthStage`+`EntityType`,
 * ya que ambos archetypes legacy se retiraron por describir esto mismo) + dos por `PrimaryFriction`
 * cuando la pregunta especializada de ese friction no cabe ya en un módulo de archetype
 * (`operations`/`follow_up`) + `measurement` (objetivo `measure`) + `confirmation` (§53-54).
 *
 * DEUDA ABIERTA reconocida (revisión de dominio independiente, `DIAG-V3-08B2-HYBRID-ARCHETYPE-MODULE-001`):
 * `OperationalArchetype: "hybrid"` (retail+ecommerce es el caso real más común) no tiene módulo propio
 * ni aparece en el `relevantWhen.archetypes` de ningún módulo — a diferencia de `BusinessModel: "hybrid"`,
 * que sí tiene un ejemplo de seguimiento (`q2_confirm_hybrid_friction`, `qbv2-golden.ts`). Decidir CÓMO
 * seleccionar módulos para un archetype híbrido (¿ambos módulos constituyentes a la vez? ¿el trace de
 * 08B.1 expone cuáles dos?) es una decisión del Adaptive Planner (DIAG-V3-08B.4), no de esta fase — no
 * se resuelve aquí para no inventar una selección de módulos sin el planner que la vaya a usar.
 */
export const MODULE_IDS = [
  "core",
  "classification",
  "maturity",
  "goal_friction",
  "local",
  "appointments",
  "local_service",
  "professional",
  "retail",
  "ecommerce",
  "hospitality",
  "b2b",
  "creator",
  "nonprofit",
  "startup",
  "operations",
  "follow_up",
  "measurement",
  "confirmation",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export type ModuleDefinition = {
  readonly id: ModuleId;
  readonly purpose: string;
  /** Hints de para qué contexto resuelto suele ser relevante este módulo — documentación/planificación (§70), no una regla ejecutable: la relevancia REAL de cada pregunta la decide su propio `appliesWhen`. */
  readonly relevantWhen: {
    readonly archetypes?: readonly OperationalArchetype[];
    readonly businessModels?: readonly BusinessModel[];
    readonly entityTypes?: readonly EntityType[];
    readonly growthStages?: readonly GrowthStage[];
    readonly frictions?: readonly PrimaryFriction[];
    readonly goals?: readonly PrimaryGoal[];
  };
  /** Objetivo de tamaño, NO restricción dura (§50): metadata para el planner de 08B.4 y para el plan de contenido de 08B.3. */
  readonly targetQuestionRange: { readonly min: number; readonly max: number };
};

export const MODULE_REGISTRY: readonly ModuleDefinition[] = [
  { id: "core", purpose: "Anclas comparables entre casi todas las rutas.", relevantWhen: {}, targetQuestionRange: { min: 4, max: 5 } },
  { id: "classification", purpose: "Resolver BusinessModel/Archetype/CustomerModel con el mínimo de preguntas posible.", relevantWhen: {}, targetQuestionRange: { min: 2, max: 4 } },
  { id: "maturity", purpose: "Resolver GrowthStage por señales observables.", relevantWhen: {}, targetQuestionRange: { min: 2, max: 3 } },
  { id: "goal_friction", purpose: "Resolver PrimaryGoal y PrimaryFriction.", relevantWhen: {}, targetQuestionRange: { min: 2, max: 3 } },
  { id: "local", purpose: "Negocio local físico sin citas ni inventario de reventa como eje.", relevantWhen: { archetypes: ["local"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "appointments", purpose: "Varios proveedores/recursos agendándose.", relevantWhen: { archetypes: ["appointments"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "local_service", purpose: "Servicio que se desplaza al cliente.", relevantWhen: { archetypes: ["local_service"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "professional", purpose: "Profesional independiente solo, sin colega.", relevantWhen: { archetypes: ["professional"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "retail", purpose: "Comercio minorista físico con inventario/exhibición.", relevantWhen: { archetypes: ["retail"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "ecommerce", purpose: "Venta por checkout en línea.", relevantWhen: { archetypes: ["ecommerce"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "hospitality", purpose: "Restaurantes/cafés/hospedaje, consumo en el lugar.", relevantWhen: { archetypes: ["hospitality"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "b2b", purpose: "El comprador es otra empresa.", relevantWhen: { archetypes: ["b2b"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "creator", purpose: "Monetiza audiencia/contenido propio.", relevantWhen: { archetypes: ["creator"], businessModels: ["creator_audience"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "nonprofit", purpose: "Misión sin fines de lucro; no asume ingresos/ventas como objetivo.", relevantWhen: { businessModels: ["nonprofit"], entityTypes: ["organization"] }, targetQuestionRange: { min: 4, max: 6 } },
  { id: "startup", purpose: "Sin operación establecida: validación y lanzamiento, no retención.", relevantWhen: { growthStages: ["idea", "starting"], entityTypes: ["project"] }, targetQuestionRange: { min: 4, max: 6 } },
  { id: "operations", purpose: "Cuello de botella interno (desorganización, trabajo repetitivo, falta de datos).", relevantWhen: { frictions: ["operations"] }, targetQuestionRange: { min: 3, max: 5 } },
  { id: "follow_up", purpose: "Consultas perdidas por falta de respuesta/proceso.", relevantWhen: { frictions: ["follow_up"] }, targetQuestionRange: { min: 3, max: 5 } },
  { id: "measurement", purpose: "Quiere entender qué funciona y qué no.", relevantWhen: { goals: ["measure"] }, targetQuestionRange: { min: 2, max: 3 } },
  { id: "confirmation", purpose: "Solo ante ambigüedad/contradicción real (§53-54); nunca elegible por defecto.", relevantWhen: {}, targetQuestionRange: { min: 0, max: 2 } },
];

// ── Purpose / Priority (§5-6) ────────────────────────────────────────────────

/** Taxonomía pequeña (§5): "routing" separado de "classification" porque una pregunta puede ayudar a elegir la siguiente pregunta sin resolver ningún campo de contexto por sí misma (p. ej. desambiguar entre dos módulos especializados). */
export const QUESTION_PURPOSES = ["anchor", "classification", "maturity", "goal", "friction", "diagnostic", "routing", "confirmation"] as const;
export type QuestionPurpose = (typeof QUESTION_PURPOSES)[number];

export const QUESTION_PRIORITIES = ["critical", "high", "normal", "refinement"] as const;
export type QuestionPriority = (typeof QUESTION_PRIORITIES)[number];

// ── Scoring readiness (§31-32) ───────────────────────────────────────────────

/** Metadata mínima para que DIAG-V3-08C pueda calibrar sin inventar pesos aquí (§31: "no asignar pesos todavía"). */
export type ScoringReadiness = {
  readonly candidateDimensions: readonly DimensionId[];
  readonly signalDirection: "positive" | "negative" | "neutral";
  readonly allowsUnknown: boolean;
  readonly allowsNotApplicable: boolean;
};

// ── Contradicción (hook only, §53) ──────────────────────────────────────────

/** Solo el gancho contractual — el motor de contradicciones completo es DIAG-V3-08B.5. */
export type ContradictionRole = { readonly type: "confirms"; readonly targetField: string; readonly note: string };

// ── Copy variants (§25-28) ───────────────────────────────────────────────────

/** Nunca cambia `options`/`produces` bajo la misma `QuestionVersion` (§26) — solo `prompt`/`helper`. Verificado por validador (§37). */
export type CopyVariantTarget = { readonly archetype?: OperationalArchetype } | { readonly nicheGroup?: NicheGroup } | { readonly entityType?: EntityType };
export type CopyVariantV2 = { readonly target: CopyVariantTarget; readonly prompt?: string; readonly helper?: string };

// ── Opción y pregunta (§4, §16-19) ───────────────────────────────────────────

export type OptionKindV2 = "value" | "none" | "unknown" | "not_applicable";

export type OptionV2 = {
  readonly value: string;
  readonly label: string;
  readonly kind?: OptionKindV2;
  /** Solo válido en preguntas `multi` (§19); validado estáticamente. */
  readonly exclusive?: boolean;
  /** 0..N señales (§10) — dato puro, nunca una función (§57). */
  readonly produces?: readonly SignalProduction[];
};

type QuestionDefinitionV2Base = {
  readonly id: string;
  readonly version: QuestionVersion;
  readonly module: ModuleId;
  readonly prompt: string;
  readonly helper?: string;
  readonly purpose: readonly [QuestionPurpose, ...QuestionPurpose[]];
  readonly priority: QuestionPriority;
  /** Ausente = siempre elegible en cuanto su módulo es relevante (equivalente a "core"). */
  readonly appliesWhen?: RuleV2;
  readonly variants?: readonly CopyVariantV2[];
  readonly scoringReadiness?: ScoringReadiness;
  readonly contradictionRole?: ContradictionRole;
};

export type SingleQuestionDefinitionV2 = QuestionDefinitionV2Base & { readonly type: "single"; readonly options: readonly OptionV2[] };
export type MultiQuestionDefinitionV2 = QuestionDefinitionV2Base & { readonly type: "multi"; readonly options: readonly OptionV2[] };
export type QuestionDefinitionV2 = SingleQuestionDefinitionV2 | MultiQuestionDefinitionV2;
