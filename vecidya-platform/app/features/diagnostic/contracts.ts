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
 * Versiones persistidas (DIAG-V3-06 §7): identifican qué lógica produjo un resultado histórico.
 * Cada una sube de forma independiente cuando cambia SU capa, no cuando cambia cualquier otra:
 * - `QuestionBankVersion`: qué preguntas/opciones existen (`QUESTION_DEFINITIONS`).
 * - `RoutingVersion`: qué reglas de aplicabilidad rigen (`ROUTING_RULES`).
 * - `ScoringVersion`: cómo se calculan evidencia/score/confianza (`evidence.ts`, `scoring.ts`).
 * - `ResultSchemaVersion`: la forma de `DiagnosticResult` (`types.ts`).
 * Todas empiezan en `1` porque nunca antes hubo un resultado persistido con el que compararlas.
 * Deliberadamente no es `appVersion` (`package.json`): esas versiones describen el software, estas
 * describen qué produjo un dato guardado, y pueden avanzar en momentos distintos.
 */
/**
 * `2` queda reservada como identidad contractual para el banco adaptativo de DIAG-V3-08B (nichos +
 * banco de preguntas ampliado), sin activarse todavía: `CURRENT_QUESTION_BANK_VERSION` sigue en `1`
 * y ninguna sesión puede producirse con `2` mientras `isCurrentPersistedVersions` siga comparando
 * contra `CURRENT_PERSISTED_VERSIONS`. Pasa a productiva recién en DIAG-V3-08B.2/.3 (arquitectura y
 * contenido del banco), no en 08B.0 (taxonomía).
 */
export type QuestionBankVersion = 1 | 2;
export const CURRENT_QUESTION_BANK_VERSION: QuestionBankVersion = 1;
export type RoutingVersion = 1;
export const CURRENT_ROUTING_VERSION: RoutingVersion = 1;
export type ScoringVersion = 1;
export const CURRENT_SCORING_VERSION: ScoringVersion = 1;
export type ResultSchemaVersion = 1;
export const CURRENT_RESULT_SCHEMA_VERSION: ResultSchemaVersion = 1;

/** Conjunto de versiones que identifican qué lógica puede reconstruir/leer un dato persistido. */
export type PersistedVersions = {
  diagnosticVersion: DiagnosticVersion;
  questionBankVersion: QuestionBankVersion;
  routingVersion: RoutingVersion;
  scoringVersion: ScoringVersion;
  resultSchemaVersion: ResultSchemaVersion;
};

/** Las versiones vigentes del motor actual. Toda sesión/snapshot nueva se crea con este valor exacto. */
export const CURRENT_PERSISTED_VERSIONS: PersistedVersions = {
  diagnosticVersion: CURRENT_DIAGNOSTIC_VERSION,
  questionBankVersion: CURRENT_QUESTION_BANK_VERSION,
  routingVersion: CURRENT_ROUTING_VERSION,
  scoringVersion: CURRENT_SCORING_VERSION,
  resultSchemaVersion: CURRENT_RESULT_SCHEMA_VERSION,
};

/**
 * Compara un valor no confiable (snapshot de navegador, fila de D1) contra las versiones vigentes.
 * No hay casts ni migración histórica en V1 (DIAG-V3-06 §12): una versión distinta es simplemente
 * incompatible, nunca "parecida".
 */
export function isCurrentPersistedVersions(value: unknown): value is PersistedVersions {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.diagnosticVersion === CURRENT_PERSISTED_VERSIONS.diagnosticVersion &&
    candidate.questionBankVersion === CURRENT_PERSISTED_VERSIONS.questionBankVersion &&
    candidate.routingVersion === CURRENT_PERSISTED_VERSIONS.routingVersion &&
    candidate.scoringVersion === CURRENT_PERSISTED_VERSIONS.scoringVersion &&
    candidate.resultSchemaVersion === CURRENT_PERSISTED_VERSIONS.resultSchemaVersion
  );
}

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

/**
 * `signal` se añade en DIAG-V3-08B.1: el Context Resolver (`context-resolver.ts`) produce valores a
 * partir de `DiagnosticSignalsV3` (`signals.ts`), una capa intermedia que no es directamente ni una
 * respuesta cruda de QBV1 (`answer`) ni una traducción histórica de perfil/etapa legacy
 * (`legacy_mapping`) — es deliberadamente independiente de cómo se preguntó, según el principio de la
 * fase (§2: "qué significa la respuesta" no debe acoplarse a "cómo la preguntamos").
 */
export type ResolutionSource = "answer" | "legacy_mapping" | "signal";

/**
 * - `not_asked`: todavía no hay respuesta que lo determine.
 * - `declared_unknown`: la persona respondió «no lo sé» (o equivalente).
 * - `ambiguous_legacy`: un dato del motor actual no tiene equivalencia V3 segura; `candidates` acota.
 * - `insufficient_evidence`: hay respuestas, pero no bastan para clasificar.
 * - `conflicting_evidence` (DIAG-V3-08B.3, domain review R1 del Lote A): dos o más señales MATERIALES
 *   declaran valores distintos para el mismo campo (p. ej. un `NicheId` de catálogo resuelve un
 *   `NicheGroup` y una declaración directa de sector dice otro). Una señal más específica puede
 *   COMPLETAR información que falta, pero nunca debe sobrescribir en silencio una declaración material
 *   incompatible — eso se resuelve aquí, nunca eligiendo la de mayor prioridad sin más. `candidates`
 *   lista los valores en conflicto.
 */
export type UnresolvedReason = "not_asked" | "declared_unknown" | "ambiguous_legacy" | "insufficient_evidence" | "conflicting_evidence";

export type Resolved<T extends string> = { readonly status: "resolved"; readonly value: T; readonly source: ResolutionSource };
export type Unresolved<T extends string> = { readonly status: "unresolved"; readonly reason: UnresolvedReason; readonly candidates: readonly T[] };
export type Resolution<T extends string> = Resolved<T> | Unresolved<T>;

export const resolved = <T extends string>(value: T, source: ResolutionSource): Resolved<T> => ({ status: "resolved", value, source });
export const unresolved = <T extends string>(reason: UnresolvedReason, candidates: readonly T[] = []): Unresolved<T> => ({ status: "unresolved", reason, candidates });
export const isResolved = <T extends string>(resolution: Resolution<T>): resolution is Resolved<T> => resolution.status === "resolved";

// ── Conceptos V3 ─────────────────────────────────────────────────────────────

/**
 * Qué tipo de entidad responde. Separa lo que hoy mezcla `ProfileId` (entidad + pista operacional).
 *
 * KEEP en la auditoría de DIAG-V3-08B.0: no se añaden `professional` ni `creator` aquí aunque el
 * spec de la fase los mencione como "tipos de entidad" a nivel conceptual, porque ya tienen un lugar
 * correcto y sin solapamiento en `OperationalArchetype` — "profesional independiente" y "creador de
 * contenido" describen CÓMO opera la entidad (archetype), no QUÉ TIPO DE ENTIDAD es: un profesional
 * independiente sigue siendo `individual` como entidad, solo que con `archetype: "professional"`.
 * Mantener esa separación es justo lo que el principio semántico de la fase (§4) exige: si dos
 * conceptos no se pueden distinguir con una frase, hay que revisar el modelo, no duplicarlo.
 *
 * Regla de frontera `individual`/`business` (añadida tras revisión de dominio independiente): lo que
 * distingue a los dos NO es si una sola persona responde, sino si hay otro personal remunerado además
 * de quien responde. Un dentista dueño único sin más empleados es `individual`; el mismo dentista con
 * higienista o recepcionista contratados es `business`, aunque siga siendo "su" consultorio.
 */
export const ENTITY_TYPES = ["business", "individual", "organization", "project"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/**
 * Borrador: CÓMO CREA/ENTREGA Y MONETIZA VALOR. Sin productor todavía; DIAG-V3-08B.3 lo conecta a
 * preguntas. KEEP en la auditoría de DIAG-V3-08B.0: se mantiene `membership` (no se renombra a
 * `membership_subscription`) porque no hay ganancia semántica real en el cambio y evita churn en
 * `mappings.ts`/tests sin necesidad.
 *
 * REPLACE tras revisión de dominio independiente de DIAG-V3-08B.0: la lista inicial incluía `retail`,
 * `ecommerce`, `hospitality` y `appointments`, pero sus definiciones resultaron ser paráfrasis exactas
 * de los mismos valores en `OperationalArchetype` — ningún negocio real puede tener
 * `BusinessModel: "retail"` sin `OperationalArchetype: "retail"` también, porque ambos se probaban con
 * el mismo criterio físico (inventario/exhibición en un local). Eso viola el principio de la fase (§4):
 * si dos conceptos no se distinguen con una frase, hay que corregir el modelo, no duplicarlo. Esos
 * cuatro valores se retiran de aquí: `OperationalArchetype` es ahora el único dueño del eje "mecanismo
 * de entrega"; `BusinessModel` responde solo "de dónde sale el ingreso", con `products`/`services`
 * cubriendo también los casos que antes vivían en los valores retirados.
 */
export const BUSINESS_MODELS = ["services", "products", "professional_services", "creator_audience", "membership", "nonprofit", "hybrid"] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

/**
 * Borrador: comportamiento operacional que decide rutas, pesos y prioridades en V3. Responde "CÓMO
 * FUNCIONA operativamente", no "cómo monetiza" (`BusinessModel`) ni "en qué mercado" (`Niche`): un
 * mismo `BusinessModel` puede mapear a más de un archetype (p. ej. `professional_services` +
 * `appointments` es válido) y un mismo archetype puede admitir varios modelos de negocio; la
 * auditoría de DIAG-V3-08B.0 confirma que esa superposición parcial es intencional, no un error de
 * diseño. `retail` se separa de `local` (DIAG-V3-08B.0): un comercio con inventario/exhibición físico
 * necesita preguntas de catálogo/inventario que un negocio local genérico (gimnasio, spa) no necesita.
 *
 * RESUELTO en DIAG-V3-08B.1 (`DIAG-V3-08B0-ARCHETYPE-LIFECYCLE-001`): la versión de 08B.0 incluía
 * `organization` y `startup`, pero ambos describían un estado estructural/de ciclo de vida, no un
 * mecanismo de entrega — una cocina comunitaria sin fines de lucro opera día a día más parecido a
 * `local`/`hospitality` que a una abstracción de gobernanza, y un "startup" no tiene todavía ningún
 * mecanismo operativo propio que resolver (es, por definición, lo que `GrowthStage: idea/starting`
 * ya describe). Ninguno de los dos superó la prueba de "¿qué pregunta responde este valor que las
 * demás listas no respondan ya?": `organization` = `EntityType: organization`; `startup` = ausencia
 * de operación establecida, ya cubierta por `GrowthStage`. Se retiran ambos. El Context Resolver
 * (`context-resolver.ts`) nunca los produce; `EntityType.organization` sigue existiendo sin cambios.
 */
export const OPERATIONAL_ARCHETYPES = ["local", "appointments", "local_service", "professional", "ecommerce", "retail", "hospitality", "b2b", "creator", "hybrid"] as const;
export type OperationalArchetype = (typeof OPERATIONAL_ARCHETYPES)[number];

/**
 * Deriva `archetypeComponents` (§ arriba en `DiagnosticContextV3`) a partir de una `Resolution<OperationalArchetype>`
 * AISLADA, sin acceso a las señales primaria/secundaria que produjeron un eventual `"hybrid"` (uso: el
 * adapter legacy de QBV1, `mappings.ts`, donde `archetype` nunca se resuelve a `"hybrid"` — ver
 * `LEGACY_PROFILE_MAPPING`, siempre `unresolved` en esos casos). El Context Resolver de QBV2
 * (`context-resolver.ts`) NO usa esta función: calcula los componentes reales directamente porque sí
 * tiene ambos mecanismos de entrega disponibles en el momento de resolver.
 */
export function deriveSingleArchetypeComponents(resolution: Resolution<OperationalArchetype>): readonly OperationalArchetype[] {
  if (resolution.status !== "resolved") return [];
  if (resolution.value === "hybrid") return []; // un "hybrid" sin componentes reales conocidos nunca satisface el invariante ">=2 componentes" fabricando uno.
  return [resolution.value];
}

/**
 * Conjunto cerrado de familias de nicho, útil para routing y analítica (DIAG-V3-08B.0 §9-10). No es
 * una taxonomía publicitaria de industrias: el objetivo es que el planner adaptativo pueda seleccionar
 * módulos de preguntas por familia sin depender de un catálogo abierto de miles de nichos específicos.
 *
 * `creator` es una excepción deliberada a "nicho = mercado/tema": agrupa por MECANISMO de monetización
 * (audiencia propia), no por tema de contenido, porque un creador de cocina, uno de fitness y uno de
 * finanzas comparten casi todas sus preguntas de diagnóstico relevantes (captura de audiencia, canales,
 * consistencia, monetización) independientemente del tema — al contrario que, por ejemplo, una tienda
 * de retail y un restaurante, donde el tema sí cambia qué se pregunta. Revisión de dominio independiente
 * de DIAG-V3-08B.0 señaló esto como tensión real con el resto del grupo; se mantiene con esta
 * justificación explícita en vez de forzar a cada creador a un grupo temático que perdería la pregunta
 * más relevante (mecánica de audiencia) a cambio de una que casi nunca lo es (el tema del contenido).
 */
export const NICHE_GROUPS = [
  "health_wellness",
  "beauty_personal_care",
  "legal",
  "financial_tax_insurance",
  "professional_services",
  "home_services",
  "automotive",
  "real_estate",
  "food_hospitality",
  "retail",
  "ecommerce",
  "education_coaching",
  "creative_media",
  "creator",
  "b2b_services",
  "technology_software",
  "nonprofit_community",
  "community_social",
  "other",
] as const;
export type NicheGroup = (typeof NICHE_GROUPS)[number];

/**
 * Nicho: conjunto abierto (barbería, clínica, cafetería…) que complementa al arquetipo; nunca lo
 * sustituye. Es el único ID con marca nominal porque no es una lista cerrada: solo se obtiene
 * validando con `toNicheId`.
 */
export type NicheId = string & { readonly __brand: "NicheId" };
export type NicheDefinition = {
  id: NicheId;
  label: string;
  /** Familia cerrada para routing/analítica (`NICHE_GROUPS`). */
  group: NicheGroup;
  /**
   * Arquetipos con los que este nicho suele superponerse. Es un HINT editorial (DIAG-V3-08B.0 §19-20),
   * no un hecho resuelto: un dentista suele operar por citas, pero el resolver de contexto (08B.1)
   * decide el archetype real a partir de respuestas, nunca a partir de esta lista. Al menos uno.
   */
  archetypeHints: readonly [OperationalArchetype, ...OperationalArchetype[]];
};

const NICHE_PATTERN = /^[a-z][a-z0-9_]{1,39}$/;
export function toNicheId(value: unknown): NicheId | undefined {
  return typeof value === "string" && NICHE_PATTERN.test(value) ? (value as NicheId) : undefined;
}

export const isNicheGroup = (value: unknown): value is NicheGroup => isOneOf(NICHE_GROUPS, value);

/**
 * Etapa V3, definida por señales observables. No comparte significado con `StageId` (autodeclarada)
 * aunque coincidan palabras: el `growing` actual es «estable y quiero crecer»; el V3 es volumen
 * creciente con cuellos de botella. La traducción vive solo en `mapLegacyStage`.
 *
 * Frontera sin operacionalizar todavía (hallazgo de revisión de dominio independiente): `operating` vs
 * `growing` se distinguen aquí por adjetivo ("estable" vs "aumento demostrable"), pero ninguna señal
 * concreta está definida todavía — sin eso, una futura pregunta corre el riesgo de colapsar de nuevo en
 * la misma autopercepción que este contrato existe para evitar. DIAG-V3-08B.3 debe operacionalizar esto
 * con al menos una señal observable de ejemplo (p. ej. "tendencia de volumen de consultas en ≥2 períodos
 * consecutivos" o "existe lista de espera/backlog"), no dejarlo en un adjetivo sin criterio.
 */
export const GROWTH_STAGES = ["idea", "starting", "operating", "growing", "scaling"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

/** Regularity values retained across the legacy bank and the reviewed candidate. */
export const OPERATING_REGULARITIES_V3 = ["none", "irregular", "occasional", "irregular_active", "regular"] as const;
export type OperatingRegularityV3 = (typeof OPERATING_REGULARITIES_V3)[number];

/** Reviewed process consistency is richer than the legacy `systemization: boolean`. */
export const PROCESS_CONSISTENCIES_V3 = ["defined", "partial", "informal"] as const;
export type ProcessConsistencyV3 = (typeof PROCESS_CONSISTENCIES_V3)[number];

/** Current operating capacity situation; intentionally distinct from legacy growth evidence. */
export const CAPACITY_SITUATIONS_V3 = ["stable", "pressure", "expanded", "pressure_and_expanded"] as const;
export type CapacitySituationV3 = (typeof CAPACITY_SITUATIONS_V3)[number];
export type LegacyStageId = StageId;

/**
 * Modelo de cliente en dos ejes independientes: un negocio B2B puede ser local.
 *
 * `CustomerReach` es ALCANCE GEOGRÁFICO puro (DIAG-V3-08B.3, domain review R1 del Lote A) — nunca
 * canal/mecanismo de entrega. La versión original de 08B.0 tenía `"online"` como valor, conflando dos
 * ejes reales: un consultor que atiende en línea a clientes de todo el país es geográficamente
 * `national`, no una categoría aparte de `local`/`regional`; y un negocio físico con clientes en varias
 * regiones por distribución (`national`) no implica ecommerce ni ningún canal digital. El canal (en
 * línea vs. presencial) ya lo captura `deliveryMode`/`OperationalArchetype` (`online_checkout`, etc.) —
 * un eje aparte, deliberadamente independiente de este (§6 del checkpoint de revisión: "no confundir
 * reach con archetype"). `"mixed"` sigue siendo real (alcance local Y más amplio a la vez, no
 * incertidumbre), no una combinación con canal.
 */
export const CUSTOMER_REACHES = ["local", "regional", "national", "global", "mixed"] as const;
export type CustomerReach = (typeof CUSTOMER_REACHES)[number];
export const CUSTOMER_BUYERS = ["b2c", "b2b", "mixed"] as const;
export type CustomerBuyer = (typeof CUSTOMER_BUYERS)[number];
export type CustomerModel = { reach: Resolution<CustomerReach>; buyer: Resolution<CustomerBuyer> };

/** Los objetivos actuales se reutilizan; «unsure» no es un objetivo sino su ausencia declarada. */
export const PRIMARY_GOALS = ["be_found", "explain", "trust", "opportunities", "stop_losing", "organize", "automate", "measure"] as const;
export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

/**
 * Borrador: principal fricción declarada. La pregunta no existe todavía (llega en DIAG-V3-08B.3).
 *
 * REPLACE en DIAG-V3-08B.0: el conjunto anterior (`not_found`, `unclear_offer`, `low_trust`,
 * `few_inquiries`, `lost_inquiries`, `slow_follow_up`, `disorganized`, `repetitive_work`, `no_data`)
 * nunca tuvo productor ni consumidor (siempre `unresolved("not_asked")`, cero apariciones fuera de
 * este archivo), así que la política del encabezado de este módulo ("las listas de borrador pueden
 * cambiar libremente hasta que algo se persista") aplica sin reservas. Se sustituye por 6 categorías
 * mutuamente distinguibles, cada una con una prueba de pertenencia explícita para evitar que dos
 * preguntas futuras terminen clasificando la misma señal en categorías distintas:
 * - `visibility`: nadie encuentra el negocio (poco o ningún tráfico/consultas de entrada).
 * - `trust`: lo encuentran pero dudan (falta de prueba social, reputación o claridad de la oferta).
 * - `conversion`: llegan consultas pero pocas se cierran (el problema es la oferta/negociación, no el
 *   volumen de entrada ni el seguimiento).
 * - `follow_up`: las consultas se pierden por falta de respuesta o proceso, no por la oferta en sí
 *   (distinción clave frente a `conversion`: aquí la consulta nunca llega a evaluarse de verdad).
 * - `operations`: el cuello de botella es interno (desorganización, trabajo repetitivo manual, falta
 *   de datos para decidir), no de cara al cliente.
 * - `scale`: ya funciona de forma repetible pero no soporta más volumen sin romperse (capacidad,
 *   equipo, procesos).
 *
 * Decisión explícita sobre retención/postventa (hallazgo de revisión de dominio independiente): el
 * hallazgo `post_sale_loop` de `ISSUE_IDS` no tiene una categoría de fricción dedicada; una fricción de
 * "no vuelven ni refieren después de una buena venta" se clasifica en `operations` para V1 (es un vacío
 * de proceso interno de retención, no de cara al primer contacto). Si 08B.3 encuentra que esto pierde
 * señal real, añadir una séptima categoría entonces — no se añade especulativamente aquí.
 */
export const PRIMARY_FRICTIONS = ["visibility", "trust", "conversion", "follow_up", "operations", "scale"] as const;
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
  /** Audience-revenue evidence is separate from delivery/archetype classification and may be unresolved. */
  audienceMonetization: Resolution<"own_audience_monetization">;
  archetype: Resolution<OperationalArchetype>;
  /**
   * Componentes reales de `archetype` (DIAG-V3-08B.3 Lote B, C1 — bloqueante arquitectónico corregido):
   * cuando `archetype` resuelve a un valor NO-`hybrid`, es exactamente `[archetype.value]`; cuando
   * resuelve a `"hybrid"`, son los ≥2 mecanismos de entrega reales e independientes que lo produjeron
   * (nunca `"hybrid"` como componente); cuando `archetype` está `unresolved`, es `[]`. Existe porque una
   * pregunta especializada debe poder preguntar "¿este negocio opera de esta manera?" (pertenencia,
   * `archetypeIncludes` en `qbv2-rules.ts`) sin perder AMBAS familias de preguntas cuando el negocio
   * combina dos mecanismos reales — antes de esto, `professional + appointments` resolvía
   * `archetype: "hybrid"` y ninguna pregunta gateada con `archetype === "professional"` ni
   * `archetype === "appointments"` (comparación exacta) volvía a ser elegible. Se deriva del MISMO
   * resolver/señales que `archetype` (nunca una segunda fuente de verdad); determinista, sin duplicados,
   * en orden canónico (alfabético).
   */
  archetypeComponents: readonly OperationalArchetype[];
  /** Actividad básica derivada de clientes reales, independiente de la precisión de GrowthStage. */
  activity: Resolution<"prelaunch" | "active">;
  niche: Resolution<NicheId>;
  /**
   * Añadido en DIAG-V3-08B.1: familia cerrada del nicho (`NicheGroup`), separada de `niche` (el
   * `NicheId` abierto) porque el routing/analítica necesita la familia incluso cuando el nicho
   * específico no está en catálogo. Solo se resuelve por FACT (nicho conocido en `NICHE_REGISTRY`) o
   * por declaración explícita de "otro"; nunca se infiere `other` por defecto (`DIAG-V3-08B.0` §18/§40
   * mutación E, `DIAG-V3-08B.1` §18).
   */
  nicheGroup: Resolution<NicheGroup>;
  growthStage: Resolution<GrowthStage>;
  /** Observed activity cadence; explicit unknown remains distinct from a missing answer. */
  operatingRegularity: Resolution<OperatingRegularityV3>;
  /** Reviewed process consistency, separate from the legacy boolean `systemization` signal. */
  processConsistency: Resolution<ProcessConsistencyV3>;
  /** Reviewed capacity situation, separate from legacy growth evidence signals. */
  capacitySituation: Resolution<CapacitySituationV3>;
  customerModel: CustomerModel;
  primaryGoal: Resolution<PrimaryGoal>;
  primaryFriction: Resolution<PrimaryFriction>;
  answers: Answers;
};

export type DiagnosticFingerprint = Pick<DiagnosticContextV3, "entity" | "archetype" | "niche" | "nicheGroup" | "growthStage">;

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

// ── Persistencia: sesiones anónimas (DIAG-V3-06) ────────────────────────────

/**
 * Estados de sesión. Esta fase produce y transiciona solo `STARTED` → `IN_PROGRESS` → `COMPLETED`.
 * `SAVED` queda reservado para Save & Resume (DIAG-V3-07); `EXPIRED` existe en el contrato para que
 * un sweep futuro (DIAG-V3-08) pueda escribirlo, pero nada lo produce todavía. `ABANDONED` no es un
 * estado persistido: el abandono es una condición analítica derivada, no una transición (spec §21).
 */
export const DIAGNOSTIC_SESSION_STATUSES = ["STARTED", "IN_PROGRESS", "SAVED", "COMPLETED", "EXPIRED"] as const;
export type DiagnosticSessionStatus = (typeof DIAGNOSTIC_SESSION_STATUSES)[number];
export const isDiagnosticSessionStatus = (value: unknown): value is DiagnosticSessionStatus => isOneOf(DIAGNOSTIC_SESSION_STATUSES, value);

/** Identificador público de sesión: aleatorio (UUID v4), no secuencial, sin datos del usuario. */
export type DiagnosticSessionId = string & { readonly __brand: "DiagnosticSessionId" };
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isDiagnosticSessionId(value: unknown): value is DiagnosticSessionId {
  return typeof value === "string" && SESSION_ID_PATTERN.test(value);
}

/**
 * Retención V1 (DIAG-V3-06 §5). Constantes centrales: nada de esto vive enterrado en el código que
 * las consume. La política definitiva puede revisarse antes de producción; esto es el default de
 * ingeniería mientras no exista una decisión distinta.
 */
export const AUTOSAVE_SNAPSHOT_RETENTION_DAYS = 7;
export const COMPLETED_RESULT_RETENTION_DAYS = 180;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Retención de "Guardar para después" (DIAG-V3-07 §8): más larga que el autosave temporal (KV,
 * 7 días) porque es una decisión explícita de la persona, no un checkpoint de trabajo en curso.
 * Centralizada aquí, igual que las constantes de arriba: nada de "30" suelto en otro archivo.
 */
export const SAVED_SNAPSHOT_RETENTION_DAYS = 30;

/**
 * Elegibilidad de "Guardar para después" (DIAG-V3-07 §4): condición determinista derivada del
 * recorrido real (denominador = preguntas aplicables vigentes, no un conteo fijo que la matriz de
 * dependencias pueda invalidar). No depende de copy ni de texto de UI.
 */
export const SAVE_ELIGIBILITY_MIN_PROGRESS_RATIO = 0.35;
/** Evita que una rama muy corta (pocas preguntas aplicables) se declare elegible tras 1-2 respuestas. */
export const SAVE_ELIGIBILITY_MIN_APPLICABLE_QUESTIONS = 4;

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
