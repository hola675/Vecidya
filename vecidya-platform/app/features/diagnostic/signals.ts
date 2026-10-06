import type { AppointmentAttendanceV3, B2BFollowupProcessV3, BusinessModel, CapacitySituationV3, CustomerBuyer, CustomerReach, EntityType, NicheGroup, NicheId, OperatingRegularityV3, OperationalArchetype, PrimaryFriction, PrimaryGoal, ProcessConsistencyV3 } from "./contracts";

/**
 * Señales de dominio de DIAG-V3-08B.1 (Context Resolver).
 *
 * Esta capa existe para que el resolver (`context-resolver.ts`) nunca sepa que existe una pregunta
 * llamada `q_42`: consume HECHOS normalizados del negocio, no respuestas crudas de ningún banco de
 * preguntas concreto (§2). QBV1 (`legacy-signal-adapter.ts`) y, más adelante, QBV2 (DIAG-V3-08B.2/.3)
 * producen estas señales de formas completamente distintas; el resolver no cambia cuando cambian las
 * preguntas, el wording o el nicho — solo cuando cambia qué SIGNIFICA una señal.
 */

/**
 * De dónde salió una señal, en orden de fuerza decreciente (§5-6):
 * - `explicit_declaration`: la persona lo declaró directamente y sin ambigüedad.
 * - `observed_fact`: un hecho observado (comportamiento, no autopercepción).
 * - `derived_fact`: se calculó a partir de otras señales/hechos.
 * - `niche_hint`: sugerencia editorial de un nicho conocido (`archetypeHints`, `taxonomy.ts`) — nunca
 *   basta por sí sola para resolver un campo material (§6, mutación A).
 */
export const SIGNAL_PROVENANCES = ["explicit_declaration", "observed_fact", "derived_fact", "niche_hint"] as const;
export type SignalProvenance = (typeof SIGNAL_PROVENANCES)[number];

/** Fuerza relativa de cada procedencia; mayor = más fuerte. `niche_hint` siempre queda por debajo del umbral de resolución de un campo material (ver `HINT_STRENGTH` en `context-resolver.ts`). */
export const SIGNAL_PROVENANCE_STRENGTH: Readonly<Record<SignalProvenance, number>> = {
  explicit_declaration: 3,
  observed_fact: 3,
  derived_fact: 2,
  niche_hint: 1,
};

export type Signal<T> = { readonly value: T; readonly provenance: SignalProvenance };

/** Umbral mínimo de fuerza para que una señal pueda, por sí sola, resolver un campo material (§6: un `niche_hint`, fuerza 1, nunca basta). */
export const MATERIAL_SIGNAL_STRENGTH = 2;

/**
 * Dos señales cuentan como evidencia independiente de `hybrid` solo si: ninguna es un hint, sus
 * valores difieren (duplicar una señal no la vuelve independiente, §33-34), Y al menos una de las dos
 * es de la fuerza más alta (`explicit_declaration`/`observed_fact`). Hallazgo de revisión de dominio
 * independiente: exigir solo "fuerza ≥2 en ambas" permitía que dos `derived_fact` (inferencias débiles,
 * nunca observadas ni declaradas) por sí solas produjeran una conclusión `hybrid` tan confiada como dos
 * hechos observados — dos inferencias débiles que difieren entre sí son señal de incertidumbre, no de
 * un negocio genuinamente híbrido.
 */
export function areIndependent<T>(a: Signal<T> | undefined, b: Signal<T> | undefined): boolean {
  if (!a || !b) return false;
  if (a.value === b.value) return false;
  const strengthA = SIGNAL_PROVENANCE_STRENGTH[a.provenance];
  const strengthB = SIGNAL_PROVENANCE_STRENGTH[b.provenance];
  return strengthA >= MATERIAL_SIGNAL_STRENGTH && strengthB >= MATERIAL_SIGNAL_STRENGTH && Math.max(strengthA, strengthB) === 3;
}

// ── Mecanismo de monetización → BusinessModel ───────────────────────────────

/**
 * Nivel de señal para `BusinessModel`: de dónde sale el ingreso, en términos observables/declarables.
 *
 * `commission_or_referral` (hallazgo de la misma revisión, BLOQUEANTE resuelto): agentes inmobiliarios,
 * corredores de seguros, afiliados y marketplaces que cobran un porcentaje de una transacción entre
 * terceros no tenían dónde clasificarse — forzarlos a `time_or_project_work` sobreclama "cobro por
 * tiempo/proyecto" y a `goods_for_resale` sobreclama "inventario propio". Mapea a `services` (no hay
 * todavía un `BusinessModel` dedicado a comisión; revisar en DIAG-V3-08B.3 si la señal demuestra ser
 * común y merece un valor propio).
 */
/** Licensed practice remains in the active legacy bank until R2 migrates q2_monetization. */
export const MONETIZATION_MECHANISMS = ["time_or_project_work", "goods_for_resale", "licensed_practice", "commission_or_referral", "own_audience_monetization", "recurring_access", "mission_funded"] as const;
export type MonetizationMechanism = (typeof MONETIZATION_MECHANISMS)[number];

/** Explicit answer state for classification questions; this is not an income or delivery mechanism. */
export const CLASSIFICATION_DISPOSITIONS = ["other", "unsure"] as const;
export type ClassificationDisposition = (typeof CLASSIFICATION_DISPOSITIONS)[number];

export const MONETIZATION_TO_BUSINESS_MODEL: Readonly<Record<MonetizationMechanism, Exclude<BusinessModel, "hybrid">>> = {
  time_or_project_work: "services",
  goods_for_resale: "products",
  licensed_practice: "professional_services",
  commission_or_referral: "services",
  own_audience_monetization: "creator_audience",
  recurring_access: "membership",
  mission_funded: "nonprofit",
};

// ── Mecanismo de entrega → OperationalArchetype ─────────────────────────────

/**
 * Nivel de señal para `OperationalArchetype`: cómo ocurre la transacción con el cliente.
 *
 * BLOQUEANTE resuelto (revisión de dominio independiente): `scheduled_time_blocks` y
 * `specialized_individual_practice` se solapaban — un dentista, terapeuta o abogado solo siempre
 * cumple ambas descripciones a la vez ("trabaja por citas" Y "es un profesional especializado"), sin
 * ningún hecho que le diga a quien produce la señal cuál elegir. Se resuelve con un diferenciador
 * observable real, no una definición ambigua: **¿hay más de un proveedor/recurso agendándose, o es el
 * calendario de una sola persona?** `specialized_individual_practice` = un único profesional
 * licenciado sin otro colega que preste el mismo servicio (el dentista solo). `scheduled_time_blocks` =
 * agenda de VARIOS proveedores/recursos (una clínica con 3 dentistas, un spa con varias salas) donde
 * gestionar no-shows/confirmaciones ENTRE proveedores es en sí mismo un problema operativo distinto del
 * de un solo profesional. Ya no son ambiguos entre sí: responden "¿cuántos proveedores hay?", un hecho
 * verificable.
 */
/** Canonical real attention/delivery modes for the reviewed bank. */
export const CANONICAL_DELIVERY_MODES = ["physical_location", "appointments", "travels", "online_checkout", "retail", "onsite"] as const;
export type CanonicalDeliveryMode = (typeof CANONICAL_DELIVERY_MODES)[number];

/** Deprecated QBV2 values retained only so the pre-R2 bank and legacy adapter remain readable. */
export const LEGACY_DELIVERY_MODES = ["fixed_location_no_inventory", "scheduled_time_blocks", "travels_to_customer", "specialized_individual_practice", "fixed_location_with_inventory", "onsite_consumption", "b2b_sales_pipeline", "own_audience_content"] as const;
export type LegacyDeliveryMode = (typeof LEGACY_DELIVERY_MODES)[number];

export const DELIVERY_MODES = [
  ...CANONICAL_DELIVERY_MODES,
  ...LEGACY_DELIVERY_MODES,
] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export const DELIVERY_MODE_TO_ARCHETYPE: Readonly<Record<DeliveryMode, Exclude<OperationalArchetype, "hybrid">>> = {
  physical_location: "local",
  appointments: "appointments",
  travels: "local_service",
  retail: "retail",
  onsite: "hospitality",
  // Online checkout means that customers can buy and pay online; generic remote services have no mapping.
  online_checkout: "ecommerce",
  fixed_location_no_inventory: "local",
  scheduled_time_blocks: "appointments",
  travels_to_customer: "local_service",
  specialized_individual_practice: "professional",
  fixed_location_with_inventory: "retail",
  onsite_consumption: "hospitality",
  b2b_sales_pipeline: "b2b",
  own_audience_content: "creator",
};

// ── Señales de GrowthStage (resuelve DIAG-V3-08B0-GROWTH-STAGE-SIGNAL-001) ──

/** Regularidad observada de la operación (no autopercepción: "estable" se prueba con esto, no se declara). */
export const OPERATING_REGULARITIES: readonly OperatingRegularityV3[] = ["none", "irregular", "occasional", "irregular_active", "regular"];
export type OperatingRegularity = OperatingRegularityV3;

/**
 * Tendencia de demanda/volumen observada en ≥2 períodos consecutivos — nunca la sola intención de
 * crecer (contracts.ts, `GROWTH_STAGES`).
 *
 * BLOQUEANTE resuelto (revisión de dominio independiente): faltaba `decreasing_observed`. Sin ese
 * valor, un negocio en declive real (menos clientes/ingresos período contra período) no podía
 * representarse de ninguna forma y colapsaba en `flat_or_unknown`, resolviendo exactamente igual que un
 * negocio genuinamente estable — una pérdida de información diagnóstica real, no solo "evidencia
 * insuficiente". `GrowthStage` (contracts.ts) sigue sin un valor "en declive" — esa es una decisión de
 * producto para una fase posterior (preguntas/scoring, DIAG-V3-08B.3), fuera del alcance de 08B.1 — pero
 * la CAPA DE SEÑALES ya no fuerza a perder el hecho: `resolveGrowthStage` lo distingue en el trace
 * aunque el valor resuelto de `GrowthStage` sea `operating` en ambos casos.
 */
export const DEMAND_TRENDS = ["flat_or_unknown", "flat_observed", "increasing_observed", "decreasing_observed"] as const;
export type DemandTrend = (typeof DEMAND_TRENDS)[number];

// ── Conjunto de señales ──────────────────────────────────────────────────────

export type DiagnosticSignalsV3 = {
  /** Tipo de entidad declarado directamente. */
  entityDeclared?: Signal<EntityType>;
  /**
   * Frontera individual/business (DIAG-V3-08B.0): personal remunerado ADICIONAL Y CONTINUO a quien
   * responde (empleado o contratista recurrente), no un subcontratista ocasional para un encargo
   * puntual — un fotógrafo solo que paga a un segundo camarógrafo un par de veces al año sigue siendo
   * `individual` (hallazgo de revisión de dominio independiente: la señal no debe sobreclamar una
   * estructura de negocio a partir de un pago episódico).
   */
  hasOtherPaidStaff?: Signal<boolean>;

  monetizationMechanism?: Signal<MonetizationMechanism>;
  /** Compatibility-only credential declaration from the old q2_monetization option; never an income mechanism. */
  legacyLicensedClassification?: Signal<boolean>;
  /** Explicit other/unsure response, kept separate from any revenue mechanism. */
  monetizationClassification?: Signal<ClassificationDisposition>;
  /** Solo se usa para detectar `hybrid`; debe ser independiente de `monetizationMechanism` (§15, `areIndependent`). */
  secondaryMonetizationMechanism?: Signal<MonetizationMechanism>;

  deliveryMode?: Signal<DeliveryMode>;
  /** Explicit other/unsure response does not invent a delivery mode or archetype. */
  deliveryClassification?: Signal<ClassificationDisposition>;
  /** Modos reales acumulados cuando una respuesta permite seleccionar varias opciones. */
  deliveryModes?: readonly Signal<DeliveryMode>[];
  /** Solo se usa para detectar `hybrid`; debe ser independiente de `deliveryMode` (§17, `areIndependent`). */
  secondaryDeliveryMode?: Signal<DeliveryMode>;

  declaredNicheId?: Signal<NicheId>;
  /** Declaración explícita de que el nicho no encaja en ningún grupo conocido (§18: único camino válido a `NicheGroup: "other"`). */
  declaredNicheGroupOther?: Signal<boolean>;
  /**
   * Sector amplio declarado directamente (DIAG-V3-08B.3, regla "sector-first": el cuestionario nunca
   * debe forzar a elegir un `NicheId` específico de catálogo para resolver `NicheGroup`). Más débil que
   * un `NicheId` conocido resuelto por catálogo (`resolveNicheGroup` en `context-resolver.ts` le da
   * prioridad a ese lookup cuando ambos existen), pero suficiente por sí solo para resolver `NicheGroup`
   * sin que `NicheId` deje de estar `unresolved` — eso es válido y esperado, no un estado degradado.
   */
  declaredNicheGroup?: Signal<NicheGroup>;

  customerReach?: Signal<CustomerReach>;
  buyerType?: Signal<CustomerBuyer>;

  /** Existencia de clientes/transacciones reales (no intención). `false` explícito ⇒ `GrowthStage: idea`. */
  hasRealCustomers?: Signal<boolean>;
  operatingRegularity?: Signal<OperatingRegularity>;
  /** Explicit answer that cadence is unknown; unlike absent operatingRegularity this blocks a false starting inference. */
  operatingRegularityUnknown?: Signal<boolean>;
  demandTrend?: Signal<DemandTrend>;
  /** Explicit trend uncertainty; unlike legacy flat_or_unknown it is not evidence of flat demand. */
  demandTrendUnknown?: Signal<boolean>;
  /** Reviewed process fact; deliberately richer than legacy `systemization: boolean`. */
  processConsistency?: Signal<ProcessConsistencyV3>;
  /** Explicit uncertainty for the reviewed process-consistency question. */
  processConsistencyUnknown?: Signal<boolean>;
  /**
   * Evidencia de `growing` alternativa a `demandTrend`. DEBE ser un AUMENTO observado de la lista de
   * espera/backlog en ≥2 períodos, igual de exigente que `demandTrend` — no una foto fija de "hay
   * espera" (hallazgo de revisión de dominio independiente: un backlog estable de 2 semanas que nunca
   * cambia es la definición de `operating`, no de `growing`; solo el AUMENTO es evidencia de crecimiento).
   */
  capacityPressure?: Signal<boolean>;
  /**
   * Evidencia OBSERVADA de expansión reciente de capacidad (contratación, apertura de otra ubicación,
   * etc.) en los últimos períodos — distinto de `systemization` (que es sobre si YA existe proceso/
   * equipo, no sobre si se está expandiendo activamente). Contratar 3 personas el mes pasado es, por sí
   * solo, evidencia de `growing` (hallazgo de revisión de dominio independiente: antes solo
   * `demandTrend`/`capacityPressure` contaban como evidencia de crecimiento y una expansión de plantilla
   * observable no producía ninguna conclusión).
   */
  capacityExpansion?: Signal<boolean>;
  /** Soporte de proceso/equipo YA EXISTENTE más allá del esfuerzo del fundador — distingue `growing` de `scaling`, no es evidencia de crecimiento en sí mismo. */
  systemization?: Signal<boolean>;
  /** Reviewed capacity observations; these describe the situation and never constitute growth evidence. */
  reviewedCapacityPressure?: Signal<boolean>;
  reviewedCapacityExpansion?: Signal<boolean>;
  reviewedCapacityUnknown?: Signal<boolean>;

  /** Reviewed appointment attendance condition; not evidence of a generic operations problem. */
  appointmentAttendance?: Signal<AppointmentAttendanceV3>;
  appointmentAttendanceUnknown?: Signal<boolean>;
  /** Reviewed B2B follow-up process, independent of CRM usage or generic friction. */
  b2bFollowupProcess?: Signal<B2BFollowupProcessV3>;
  b2bFollowupProcessUnknown?: Signal<boolean>;

  declaredGoal?: Signal<PrimaryGoal>;
  /** Equivalente a la legacy `unsure`: ausencia declarada, no ausencia de dato (§24, `mapLegacyGoal`). */
  declaredGoalUnknown?: Signal<boolean>;
  /** The user answered "other" but did not classify it as a known goal. */
  declaredGoalOther?: Signal<boolean>;

  /** Puede haber más de una señal de fricción; el resolver decide si hay una PRIMARY defendible (§26). */
  frictionSignals?: readonly Signal<PrimaryFriction>[];
  /** Explicitly uncertain primary friction, distinct from no friction answer. */
  frictionUnknown?: Signal<boolean>;
};
