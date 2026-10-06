import type { BusinessModel, EntityType, GrowthStage, NicheGroup, OperationalArchetype, PrimaryFriction, PrimaryGoal } from "./contracts";
import type { DimensionId } from "./types";
import type { SignalProduction } from "./qbv2-signals";
import type { RuleV2 } from "./qbv2-rules";
import type { TerminologyProfileId } from "./qbv2-terminology";
import type { QuestionEvidenceV3 } from "./qbv2-evidence-v3";

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
  // Cross-cutting por PERTENENCIA de archetype, no por valor exacto (DIAG-V3-08B.3 Lote B C1, §19-21 del
  // checkpoint): reputación/reviews aplica a varios archetypes (`local`/`appointments`/`professional`,
  // más `retail`/`ecommerce`/`hospitality` esperados en Lote C) sin ser universal a TODOS. Mismo patrón
  // que `operations`/`follow_up`/`measurement`, que ya son cross-cutting por friction/goal en vez de por
  // archetype — este es el primer cross-cutting por `archetypeIncludes`.
  "reputation",
  // DIAG-V3-08D.1: cross-cutting por friction `conversion`/goal `opportunities`, mismo patrón que
  // `operations`/`follow_up`/`measurement`. Existe porque ningún archetype salvo appointments tenía una
  // observación directa de si el interés termina en clientes (ver `qbv2-lote-g.ts`).
  "conversion",
  // DIAG-V3-08E.1: comprensión de la oferta y base digital propia, transversal a archetypes; solo evidencia
  // material (ver `qbv2-lote-g.ts`).
  "presence",
  // R2F: universal evidence about reliable reach, applicable only to active businesses.
  "discovery",
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
  // core/classification/maturity: rangos reconciliados en DIAG-V3-08B.3 Lote A domain review R2, tras
  // auditar qué anchors/señales de fundación hacían falta de verdad (la estimación original de 08B.2 era
  // previa a esa auditoría). Sigue siendo metadata de planner (§50), no una cuota obligatoria.
  { id: "core", purpose: "Anclas comparables entre casi todas las rutas.", relevantWhen: {}, targetQuestionRange: { min: 2, max: 3 } },
  { id: "classification", purpose: "Resolver BusinessModel/Archetype/CustomerModel con el mínimo de preguntas posible.", relevantWhen: {}, targetQuestionRange: { min: 4, max: 6 } },
  { id: "maturity", purpose: "Resolver GrowthStage por señales observables.", relevantWhen: {}, targetQuestionRange: { min: 4, max: 6 } },
  { id: "goal_friction", purpose: "Resolver PrimaryGoal y PrimaryFriction.", relevantWhen: {}, targetQuestionRange: { min: 2, max: 3 } },
  { id: "local", purpose: "Negocio local físico sin citas ni inventario de reventa como eje.", relevantWhen: { archetypes: ["local"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "appointments", purpose: "Varios proveedores/recursos agendándose.", relevantWhen: { archetypes: ["appointments"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "local_service", purpose: "Servicio que se desplaza al cliente.", relevantWhen: { archetypes: ["local_service"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "professional", purpose: "Profesional independiente solo, sin colega.", relevantWhen: { archetypes: ["professional"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "retail", purpose: "Comercio minorista físico con inventario/exhibición.", relevantWhen: { archetypes: ["retail"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "ecommerce", purpose: "Venta mediante proceso de pago en línea.", relevantWhen: { archetypes: ["ecommerce"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "hospitality", purpose: "Restaurantes/cafés/hospedaje, consumo en el lugar.", relevantWhen: { archetypes: ["hospitality"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "b2b", purpose: "El comprador es otra empresa.", relevantWhen: { archetypes: ["b2b"] }, targetQuestionRange: { min: 6, max: 10 } },
  { id: "creator", purpose: "Monetiza audiencia/contenido propio.", relevantWhen: { archetypes: ["creator"], businessModels: ["creator_audience"] }, targetQuestionRange: { min: 5, max: 8 } },
  { id: "nonprofit", purpose: "Misión sin fines de lucro; no asume ingresos/ventas como objetivo.", relevantWhen: { businessModels: ["nonprofit"] }, targetQuestionRange: { min: 4, max: 6 } },
  { id: "startup", purpose: "Sin operación establecida: validación y lanzamiento, no retención.", relevantWhen: { growthStages: ["idea", "starting"], entityTypes: ["project"] }, targetQuestionRange: { min: 4, max: 6 } },
  { id: "operations", purpose: "Cuello de botella interno (desorganización, trabajo repetitivo, falta de datos).", relevantWhen: { frictions: ["operations"] }, targetQuestionRange: { min: 3, max: 5 } },
  { id: "follow_up", purpose: "Consultas perdidas por falta de respuesta/proceso.", relevantWhen: { frictions: ["follow_up"] }, targetQuestionRange: { min: 3, max: 5 } },
  { id: "measurement", purpose: "Quiere entender qué funciona y qué no.", relevantWhen: { goals: ["measure"] }, targetQuestionRange: { min: 2, max: 3 } },
  { id: "confirmation", purpose: "Solo ante ambigüedad/contradicción real (§53-54); nunca elegible por defecto.", relevantWhen: {}, targetQuestionRange: { min: 0, max: 2 } },
  { id: "reputation", purpose: "Reseñas/reputación, compartida entre archetypes que la necesitan (no universal).", relevantWhen: { archetypes: ["local", "appointments", "professional", "retail", "hospitality"] }, targetQuestionRange: { min: 1, max: 3 } },
  { id: "presence", purpose: "Comprensión de la oferta y base digital propia cuando el archetype no tiene una observación directa.", relevantWhen: {}, targetQuestionRange: { min: 0, max: 2 } },
  { id: "conversion", purpose: "Interés que no termina en clientes, compras o participación.", relevantWhen: { frictions: ["conversion"], goals: ["opportunities"] }, targetQuestionRange: { min: 1, max: 1 } },
  { id: "discovery", purpose: "Medir si existe una forma confiable de llegar a personas nuevas.", relevantWhen: {}, targetQuestionRange: { min: 0, max: 1 } },
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

/**
 * Nunca cambia `options`/`produces` bajo la misma `QuestionVersion` (§26) — solo wording.
 * Verificado por validador (§37). `businessModel` añadido en DIAG-V3-08B.3 Lote D C1: una pregunta de
 * fundación (p. ej. `q2_customer_buyer`) puede necesitar copy distinto para `businessModel: "nonprofit"`
 * sin que eso cambie el eje interno que mide (`customerBuyer: b2c|b2b|mixed` sigue siendo la señal
 * producida) — la variante es solo wording, nunca una taxonomía nueva.
 *
 * DIAG-V3-08F: `terminology` apunta a un perfil de lenguaje (`qbv2-terminology.ts`) y es el objetivo
 * preferido; `optionLabels` reescribe la etiqueta VISIBLE de opciones existentes (por `value`), nunca su
 * valor, tipo ni producción. Resuelve `renderQuestionV2` (`qbv2-copy.ts`): gana la primera variante que
 * coincide, en orden de declaración.
 */
export type CopyVariantTarget =
  | { readonly archetype?: OperationalArchetype }
  | { readonly nicheGroup?: NicheGroup }
  | { readonly entityType?: EntityType }
  | { readonly businessModel?: BusinessModel }
  | { readonly activity?: "active" | "prelaunch" }
  | { readonly terminology?: readonly TerminologyProfileId[] };
export type CopyVariantV2 = { readonly target: CopyVariantTarget; readonly prompt?: string; readonly hint?: string; readonly optionLabels?: Readonly<Record<string, string>> };

// ── Opción y pregunta (§4, §16-19) ───────────────────────────────────────────

/**
 * Versión semántica de una pregunta QBV2, con la misma regla que `QuestionVersion` de QBV1: sube cuando cambia
 * qué se pregunta, qué significa una opción, qué opciones existen o cómo puntúa una respuesta; no sube por
 * redacción. `q2_reputation_flow` conserva su versión 2 en el banco legacy; la definición candidata revisada de
 * `q2_ecommerce_traffic_sources` avanza a versión 3 al añadir `messaging`. QBV1 conserva su propio tipo.
 */
export type QuestionVersionV2 = 1 | 2 | 3;
export type QuestionRoutingRole = "core" | "adaptive" | "deepening";

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
  readonly version: QuestionVersionV2;
  readonly module: ModuleId;
  /** Copy canónico, neutral para todos los contextos donde la pregunta aplica (DIAG-V3-08F). */
  readonly prompt: string;
  /**
   * DIAG-V3-08F: pista breve visible junto a la pregunta, para responder sin abrir la ayuda. Una frase,
   * ≤ 140 caracteres, sin referencias internas ni a otras preguntas, y nunca sugiere qué respuesta puntúa mejor.
   */
  readonly hint?: string;
  readonly purpose: readonly [QuestionPurpose, ...QuestionPurpose[]];
  readonly priority: QuestionPriority;
  /** Rol de ruta declarativo; ausente conserva la inferencia histórica hasta la migración R2. */
  readonly routingRole?: QuestionRoutingRole;
  /**
   * Ausente = siempre elegible en cuanto su módulo es relevante (equivalente a "core").
   * DIAG-V3-08E.2 (ciclo de vida): una pregunta que presupone clientes, consultas, transacciones u operación
   * real incluye `notEqV2("q2_has_customers", "no")` — no aplica en pre-lanzamiento declarado.
   */
  readonly appliesWhen?: RuleV2;
  /**
   * DIAG-V3-08D.1: contextos donde la pregunta es elegible SOLO para cubrir una necesidad material de
   * evidencia (cola del planner), nunca para la ruta base. Elegibilidad = `appliesWhen` OR esta regla; si
   * solo existe esta regla, la pregunta es material-only en todos sus contextos.
   */
  readonly materialAppliesWhen?: RuleV2;
  readonly variants?: readonly CopyVariantV2[];
  readonly scoringReadiness?: ScoringReadiness;
  /** undefined = contrato histórico válido; pending = sin evidencia; migrated = solo evidenceV3 validada. */
  readonly evidenceMigration?: "pending" | "migrated";
  /** Contrato atómico por ID/version; nunca usa ANSWER_SEMANTICS/EVIDENCE_MAPPING legacy como fallback. */
  readonly evidenceV3?: QuestionEvidenceV3;
  readonly contradictionRole?: ContradictionRole;
  readonly helpIntent?: QuestionHelpIntent;
};

/**
 * DIAG-V3-08D.1: metadata interna para el futuro sistema de ayuda (sin UI ni citas todavía). Conserva la
 * intención de la pregunta para no redescubrirla en la fase de UI. DIAG-V3-08F: es la fuente del panel `?`
 * — «¿Qué preguntamos?» (`understand`), «¿Cómo responder?» (`distinction`), «¿Por qué importa?» (`why`) —
 * con el mismo vocabulario que la pregunta; nunca expone fórmulas ni qué respuesta puntúa mejor.
 */
export type QuestionHelpIntent = {
  /** Qué intenta entender la pregunta. */
  readonly understand: string;
  /** Qué distinción debería considerar la persona al responder. */
  readonly distinction: string;
  /** DIAG-V3-08F: por qué importa para el diagnóstico, sin revelar el efecto de cada respuesta. */
  readonly why?: string;
  /** DIAG-V3-08E.3: intención de cada opción (por `value`) cuando la elección distingue intenciones, p. ej. `q2_goal`. */
  readonly options?: Readonly<Record<string, string>>;
};

export type SingleQuestionDefinitionV2 = QuestionDefinitionV2Base & { readonly type: "single"; readonly options: readonly OptionV2[] };
export type MultiQuestionDefinitionV2 = QuestionDefinitionV2Base & { readonly type: "multi"; readonly options: readonly OptionV2[] };
export type QuestionDefinitionV2 = SingleQuestionDefinitionV2 | MultiQuestionDefinitionV2;
