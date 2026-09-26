import { QUESTION_DEFINITIONS, type OptionIdOf, type QuestionId, type SectionOrderId } from "./questions";
import type { Answers, Confidence, ConfidenceLevel, DiagnosticResult, DimensionId, GoalId, ProfileId, SectionId, StageId, TeamId } from "./types";

/**
 * Contratos del Diagnostic Engine V3 (DIAG-V3-01).
 *
 * Esta capa hace explícitos los conceptos del motor sin cambiar su comportamiento: nada de lo
 * que define aquí interviene todavía en el cálculo. Reglas:
 * - Un concepto que aún no se conoce es `unresolved`; nunca se rellena con un valor por defecto.
 * - Un ID nunca se reutiliza con otro significado; si el significado cambia, se crea otro y se
 *   mapea de forma explícita (ver `mappings.ts`).
 * - Las listas marcadas como borrador (arquetipos, modelos de negocio, fricciones, señales) pueden
 *   cambiar libremente hasta que algo se persista (DIAG-V3-06); después, solo se añaden valores.
 */

// ── Versiones ────────────────────────────────────────────────────────────────

/**
 * Versión del contrato del diagnóstico (algoritmo + forma del resultado). «2.0» es el motor actual
 * (DIAG-002 a DIAG-003), que nunca se ha persistido. V3 añadirá «3.0» cuando exista un motor V3
 * real; hasta entonces ningún resultado puede declararse V3 (ver `DiagnosticResultV3`).
 * No hay versiones separadas de scoring ni de esquema de resultado: sin datos persistidos no existe
 * todavía una incompatibilidad histórica que justifique separarlas (se reevalúa en DIAG-V3-06).
 */
export const DIAGNOSTIC_VERSIONS = ["2.0"] as const;
export type DiagnosticVersion = (typeof DIAGNOSTIC_VERSIONS)[number];
export type DiagnosticVersionV3 = Extract<DiagnosticVersion, `3.${string}`>;
export const CURRENT_DIAGNOSTIC_VERSION: DiagnosticVersion = "2.0";

/**
 * Versión semántica de una pregunta (campo `version` de cada definición del registro).
 * - SUBE cuando cambia el significado: qué se pregunta, qué significa una opción, qué opciones
 *   existen o cómo puntúa una respuesta.
 * - NO sube por una corrección de redacción, puntuación, ortografía o presentación.
 * Todas las preguntas actuales están en su versión inicial. Una respuesta guardada en el futuro se
 * interpretará siempre con la versión con la que se respondió.
 */
export type QuestionVersion = 1;
export const INITIAL_QUESTION_VERSION: QuestionVersion = 1;
export type QuestionRef = { id: QuestionId; version: QuestionVersion };

// ── Identificadores estables ────────────────────────────────────────────────

/**
 * IDs de pregunta derivados del registro (`QUESTION_DEFINITIONS` en `questions.ts`), única fuente de
 * verdad desde DIAG-V3-02: añadir o retirar una pregunta no exige tocar otra lista.
 */
export const QUESTION_IDS: readonly QuestionId[] = QUESTION_DEFINITIONS.map((definition) => definition.id);
export type { AnswerFor, MultiQuestionId, OptionIdOf, OptionRef, QuestionId, SingleQuestionId } from "./questions";

/** IDs de hallazgo que puede generar `generateIssues`. */
export const ISSUE_IDS = [
  "define_offer",
  "validate_offer",
  "build_presence",
  "inventory_assets",
  "secure_ownership",
  "show_proof",
  "ask_reviews",
  "improve_discoverability",
  "check_discoverability",
  "diversify_sources",
  "define_contact_path",
  "capture_inquiries",
  "speed_up_response",
  "structure_follow_up",
  "track_pipeline",
  "assign_responsibilities",
  "automate_repetitive",
  "post_sale_loop",
  "start_measuring",
] as const;
export type IssueId = (typeof ISSUE_IDS)[number];

/** Las siete dimensiones actuales. Una dimensión contextual futura se añade en `ContextualDimensionId` sin tocar estas. */
export const CORE_DIMENSION_IDS = ["claridad", "presencia", "alcance", "confianza", "contacto", "seguimiento", "medicion"] as const;
export type ContextualDimensionId = never;
export type DimensionKey = DimensionId | ContextualDimensionId;

// ── Validación en fronteras (patrón) ────────────────────────────────────────

/**
 * Guardas de tipo para datos no confiables (URL, y en el futuro KV, D1, API o códigos de
 * recuperación). Mismo patrón que `isProfileId` en `profiles.ts`: lista cerrada, sin dependencias.
 */
export function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

export const isQuestionId = (value: unknown): value is QuestionId => isOneOf(QUESTION_IDS, value);
export const isIssueId = (value: unknown): value is IssueId => isOneOf(ISSUE_IDS, value);

/** Señala en compilación un caso sin manejar de una unión (`switch` exhaustivo). */
export function assertNever(value: never, context: string): never {
  throw new Error(`${context}: valor no contemplado ${JSON.stringify(value)}`);
}

// ── Clasificación resuelta o pendiente ──────────────────────────────────────

export type ResolutionSource = "answer" | "legacy_mapping";

/**
 * - `not_asked`: todavía no hay respuesta que lo determine.
 * - `declared_unknown`: la persona respondió «no lo sé» (o equivalente).
 * - `ambiguous_legacy`: un dato del motor actual no tiene equivalencia V3 segura; `candidates` acota.
 * - `insufficient_evidence`: hay respuestas, pero no bastan para clasificar.
 */
export type UnresolvedReason = "not_asked" | "declared_unknown" | "ambiguous_legacy" | "insufficient_evidence";

export type Resolved<T extends string> = { readonly status: "resolved"; readonly value: T; readonly source: ResolutionSource };
export type Unresolved<T extends string> = { readonly status: "unresolved"; readonly reason: UnresolvedReason; readonly candidates: readonly T[] };
export type Resolution<T extends string> = Resolved<T> | Unresolved<T>;

export const resolved = <T extends string>(value: T, source: ResolutionSource): Resolved<T> => ({ status: "resolved", value, source });
export const unresolved = <T extends string>(reason: UnresolvedReason, candidates: readonly T[] = []): Unresolved<T> => ({ status: "unresolved", reason, candidates });
export const isResolved = <T extends string>(resolution: Resolution<T>): resolution is Resolved<T> => resolution.status === "resolved";

// ── Conceptos V3 ─────────────────────────────────────────────────────────────

/** Qué tipo de entidad responde. Separa lo que hoy mezcla `ProfileId` (entidad + pista operacional). */
export const ENTITY_TYPES = ["business", "individual", "organization", "project"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/** Borrador: cómo genera ingresos o valor. Sin productor todavía; DIAG-V3-02 lo conecta a preguntas. */
export const BUSINESS_MODELS = [
  "services",
  "products",
  "retail",
  "ecommerce",
  "appointments",
  "hospitality",
  "professional_services",
  "creator_audience",
  "membership",
  "nonprofit",
  "hybrid",
] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

/** Borrador: comportamiento operacional que decide rutas, pesos y prioridades en V3. */
export const OPERATIONAL_ARCHETYPES = [
  "local",
  "appointments",
  "local_service",
  "professional",
  "ecommerce",
  "hospitality",
  "b2b",
  "creator",
  "organization",
  "startup",
  "hybrid",
] as const;
export type OperationalArchetype = (typeof OPERATIONAL_ARCHETYPES)[number];

/**
 * Nicho: conjunto abierto (barbería, clínica, cafetería…) que complementa al arquetipo; nunca lo
 * sustituye. Es el único ID con marca nominal porque no es una lista cerrada: solo se obtiene
 * validando con `toNicheId`.
 */
export type NicheId = string & { readonly __brand: "NicheId" };
export type NicheDefinition = {
  id: NicheId;
  label: string;
  /** Arquetipos a los que se superpone; al menos uno. */
  archetypes: readonly [OperationalArchetype, ...OperationalArchetype[]];
};

const NICHE_PATTERN = /^[a-z][a-z0-9_]{1,39}$/;
export function toNicheId(value: unknown): NicheId | undefined {
  return typeof value === "string" && NICHE_PATTERN.test(value) ? (value as NicheId) : undefined;
}

/**
 * Etapa V3, definida por señales observables. No comparte significado con `StageId` (autodeclarada)
 * aunque coincidan palabras: el `growing` actual es «estable y quiero crecer»; el V3 es volumen
 * creciente con cuellos de botella. La traducción vive solo en `mapLegacyStage`.
 */
export const GROWTH_STAGES = ["idea", "starting", "operating", "growing", "scaling"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];
export type LegacyStageId = StageId;

/** Modelo de cliente en dos ejes independientes: un negocio B2B puede ser local. */
export const CUSTOMER_REACHES = ["local", "regional", "online", "mixed"] as const;
export type CustomerReach = (typeof CUSTOMER_REACHES)[number];
export const CUSTOMER_BUYERS = ["b2c", "b2b", "mixed"] as const;
export type CustomerBuyer = (typeof CUSTOMER_BUYERS)[number];
export type CustomerModel = { reach: Resolution<CustomerReach>; buyer: Resolution<CustomerBuyer> };

/** Los objetivos actuales se reutilizan; «unsure» no es un objetivo sino su ausencia declarada. */
export const PRIMARY_GOALS = ["be_found", "explain", "trust", "opportunities", "stop_losing", "organize", "automate", "measure"] as const;
export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

/** Borrador: principal fricción declarada. La pregunta no existe todavía. */
export const PRIMARY_FRICTIONS = [
  "not_found",
  "unclear_offer",
  "low_trust",
  "few_inquiries",
  "lost_inquiries",
  "slow_follow_up",
  "disorganized",
  "repetitive_work",
  "no_data",
] as const;
export type PrimaryFriction = (typeof PRIMARY_FRICTIONS)[number];

// ── Evidencia ────────────────────────────────────────────────────────────────

/** Borrador: qué se observó. DIAG-V3-04 genera evidencia; hoy ninguna regla la produce. */
export const EVIDENCE_SIGNALS = ["present", "partial", "missing", "missing_process", "inconsistent_process", "dependency_risk", "uncertain", "contradiction"] as const;
export type EvidenceSignal = (typeof EVIDENCE_SIGNALS)[number];
export type EvidenceSeverity = "none" | "low" | "medium" | "high" | "critical";
export type EvidenceStrength = "strong" | "moderate" | "weak";

/**
 * Una observación explicable: qué se vio, cuánto importa y de qué respuesta salió.
 * No confundir con `Evidence` de `types.ts`, que son los pesos de evidencia de una opción.
 */
export type DiagnosticEvidence = {
  dimension: DimensionKey;
  signal: EvidenceSignal;
  severity: EvidenceSeverity;
  confidence: EvidenceStrength;
  source: { question: QuestionRef; answer: readonly string[] };
  metadata?: Readonly<Record<string, string | number | boolean>>;
};

// ── Confianza ────────────────────────────────────────────────────────────────

/** La confianza global actual se conserva tal cual. */
export type GlobalConfidence = Confidence;
/** Confianza por dimensión: solo contrato; el algoritmo actual no la calcula. */
export type DimensionConfidence = { dimension: DimensionKey; level: ConfidenceLevel; reasons: readonly string[] };

// ── Contexto y resultado V3 ─────────────────────────────────────────────────

export type DiagnosticContextV3 = {
  /** Versión con la que se recogieron las respuestas. */
  version: DiagnosticVersion;
  profile: Resolution<ProfileId>;
  entity: Resolution<EntityType>;
  businessModel: Resolution<BusinessModel>;
  archetype: Resolution<OperationalArchetype>;
  niche: Resolution<NicheId>;
  growthStage: Resolution<GrowthStage>;
  customerModel: CustomerModel;
  primaryGoal: Resolution<PrimaryGoal>;
  primaryFriction: Resolution<PrimaryFriction>;
  answers: Answers;
};

export type DiagnosticFingerprint = Pick<DiagnosticContextV3, "entity" | "archetype" | "niche" | "growthStage">;

/** Un freno solo existe con evidencia que lo respalde (al menos una observación). */
export type Bottleneck = { issueId: IssueId; dimension: DimensionKey; evidence: readonly [DiagnosticEvidence, ...DiagnosticEvidence[]] };

/** El porcentaje global puede retenerse cuando no es metodológicamente válido (`DIAG-V3-UX-01`, decisión en DIAG-V3-05). */
export type OverallScore = { status: "shown"; value: number } | { status: "withheld"; reason: "insufficient_evidence" | "single_dimension" | "low_confidence" };

/**
 * Resultado V3: tipo separado, con campos obligatorios, en lugar de opcionales sobre el resultado
 * actual. Como `DiagnosticVersionV3` aún es `never`, hoy no puede construirse ninguno: nada puede
 * presentarse como V3 antes de que exista un motor V3.
 */
export type DiagnosticResultV3 = Omit<DiagnosticResult, "version" | "overallScore" | "context"> & {
  version: DiagnosticVersionV3;
  context: DiagnosticContextV3;
  fingerprint: DiagnosticFingerprint;
  overallScore: OverallScore;
  dimensionConfidence: readonly DimensionConfidence[];
  primaryBottleneck: Bottleneck | null;
  secondaryBottleneck: Bottleneck | null;
  evidence: readonly DiagnosticEvidence[];
};

// ── Comprobaciones de compilación ───────────────────────────────────────────

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contractChecks = {
  coreDimensionsMatchDimensionId: true satisfies Equals<(typeof CORE_DIMENSION_IDS)[number], DimensionId>,
  primaryGoalsAreGoalsWithoutUnsure: true satisfies Equals<PrimaryGoal, Exclude<GoalId, "unsure">>,
  legacyStageIsCurrentStage: true satisfies Equals<LegacyStageId, StageId>,
  // Las listas cerradas del contexto coinciden exactamente con las opciones de sus preguntas.
  profileOptionsAreProfileIds: true satisfies Equals<OptionIdOf<"profile">, ProfileId>,
  stageOptionsAreStageIds: true satisfies Equals<OptionIdOf<"stage">, StageId>,
  teamOptionsAreTeamIds: true satisfies Equals<OptionIdOf<"team">, TeamId>,
  goalOptionsAreGoalIds: true satisfies Equals<OptionIdOf<"goal">, GoalId>,
  sectionOrderCoversSections: true satisfies Equals<SectionOrderId, SectionId>,
};
void contractChecks;
