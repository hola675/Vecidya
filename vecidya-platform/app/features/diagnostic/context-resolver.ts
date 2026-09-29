import {
  CURRENT_DIAGNOSTIC_VERSION,
  isResolved,
  resolved,
  unresolved,
  type BusinessModel,
  type CustomerBuyer,
  type CustomerReach,
  type DiagnosticContextV3,
  type EntityType,
  type GrowthStage,
  type NicheGroup,
  type NicheId,
  type OperationalArchetype,
  type PrimaryFriction,
  type PrimaryGoal,
  type Resolution,
  type UnresolvedReason,
} from "./contracts";
import {
  areIndependent,
  DELIVERY_MODE_TO_ARCHETYPE,
  MATERIAL_SIGNAL_STRENGTH,
  MONETIZATION_TO_BUSINESS_MODEL,
  SIGNAL_PROVENANCE_STRENGTH,
  type DiagnosticSignalsV3,
  type Signal,
} from "./signals";
import { lookupNicheGroup } from "./taxonomy";

/**
 * Context Resolver de DIAG-V3-08B.1.
 *
 * Transforma `DiagnosticSignalsV3` (hechos normalizados del negocio, ver `signals.ts`) en el contexto
 * de dominio de DIAG-V3-08B.0 (`contracts.ts`), con una traza estructurada que explica cada decisión.
 * No conoce QuestionId ni wording de ninguna pregunta (§2); no acopla `businessModel`/`archetype` entre
 * sí (§3: reutiliza los contratos de 08B.0, no crea un segundo domain model); no aplica valores por
 * defecto (§8): ausencia de evidencia es `unresolved`, nunca un valor inventado.
 */

// ── Traza ────────────────────────────────────────────────────────────────────

export type ResolvedFieldTrace = {
  readonly status: "resolved";
  readonly field: string;
  readonly value: string;
  readonly supportingSignals: readonly string[];
  readonly resolutionReason: string;
  readonly rejectedCandidates?: readonly string[];
};

export type UnresolvedFieldTrace = {
  readonly status: "unresolved";
  readonly field: string;
  readonly reason: UnresolvedReason;
  readonly candidates: readonly string[];
  readonly missingSignals?: readonly string[];
};

export type FieldTrace = ResolvedFieldTrace | UnresolvedFieldTrace;

export type ContextResolutionTrace = {
  readonly entity: FieldTrace;
  readonly businessModel: FieldTrace;
  readonly archetype: FieldTrace;
  readonly niche: FieldTrace;
  readonly nicheGroup: FieldTrace;
  readonly customerReach: FieldTrace;
  readonly customerBuyer: FieldTrace;
  readonly growthStage: FieldTrace;
  readonly primaryGoal: FieldTrace;
  readonly primaryFriction: FieldTrace;
};

/**
 * El dominio resuelto por esta fase, SIN `profile`/`answers` (conceptos de QBV1 que el resolver nunca
 * toca, §2). Quien construya un `DiagnosticContextV3` completo (el adapter legacy, o un futuro pipeline
 * QBV2) añade esos dos campos por su cuenta.
 */
export type ResolvedDomainContext = Omit<DiagnosticContextV3, "profile" | "answers">;

export type ContextResolutionResult = { readonly context: ResolvedDomainContext; readonly trace: ContextResolutionTrace };

function resolvedTrace(field: string, value: string, supportingSignals: readonly string[], resolutionReason: string, rejectedCandidates?: readonly string[]): ResolvedFieldTrace {
  return { status: "resolved", field, value, supportingSignals, resolutionReason, ...(rejectedCandidates ? { rejectedCandidates } : {}) };
}

function unresolvedTrace(field: string, reason: UnresolvedReason, candidates: readonly string[], missingSignals?: readonly string[]): UnresolvedFieldTrace {
  return { status: "unresolved", field, reason, candidates, ...(missingSignals ? { missingSignals } : {}) };
}

/**
 * Piso de fuerza para que una señal ÚNICA pueda resolver un campo material por sí sola (hallazgo de
 * revisión de dominio independiente: el principio "un `niche_hint` nunca basta solo" (§6) solo estaba
 * garantizado estructuralmente para `archetype`, donde los hints viven en un parámetro aparte — nada en
 * los demás resolvers impedía que un futuro productor de QBV2 metiera una señal `niche_hint` en, por
 * ejemplo, `hasRealCustomers`, y que se resolviera igual que una declaración explícita. Se generaliza
 * aquí para todo resolver de campo único.
 */
function isMaterial<T>(signal: Signal<T> | undefined): signal is Signal<T> {
  return signal !== undefined && SIGNAL_PROVENANCE_STRENGTH[signal.provenance] >= MATERIAL_SIGNAL_STRENGTH;
}

// ── EntityType ───────────────────────────────────────────────────────────────

function resolveEntityType(signals: DiagnosticSignalsV3): { resolution: Resolution<EntityType>; trace: FieldTrace } {
  const declared = signals.entityDeclared;
  if (!isMaterial(declared)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("entity", "not_asked", [], ["entityDeclared"]) };
  if (declared.value === "individual" && signals.hasOtherPaidStaff?.value === true) {
    return {
      resolution: resolved("business", "signal"),
      trace: resolvedTrace("entity", "business", ["entityDeclared=individual", "hasOtherPaidStaff=true"], "personal remunerado adicional a quien responde reclasifica individual → business (frontera DIAG-V3-08B.0)", ["individual"]),
    };
  }
  return { resolution: resolved(declared.value, "signal"), trace: resolvedTrace("entity", declared.value, ["entityDeclared"], "declaración explícita del tipo de entidad") };
}

// ── BusinessModel ────────────────────────────────────────────────────────────

function resolveBusinessModel(signals: DiagnosticSignalsV3): { resolution: Resolution<BusinessModel>; trace: FieldTrace } {
  const primary = signals.monetizationMechanism;
  if (!isMaterial(primary)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("businessModel", "not_asked", [], ["monetizationMechanism"]) };
  const primaryValue = MONETIZATION_TO_BUSINESS_MODEL[primary.value];
  const secondary = signals.secondaryMonetizationMechanism;
  if (areIndependent(primary, secondary)) {
    const secondaryValue = MONETIZATION_TO_BUSINESS_MODEL[secondary!.value];
    return {
      resolution: resolved("hybrid", "signal"),
      trace: resolvedTrace("businessModel", "hybrid", ["monetizationMechanism", "secondaryMonetizationMechanism"], `dos modelos de negocio reales e independientes: ${primaryValue} + ${secondaryValue}`),
    };
  }
  return { resolution: resolved(primaryValue, "signal"), trace: resolvedTrace("businessModel", primaryValue, ["monetizationMechanism"], "mecanismo de monetización declarado/observado") };
}

// ── OperationalArchetype ─────────────────────────────────────────────────────

function resolveOperationalArchetype(signals: DiagnosticSignalsV3, nicheHints: readonly OperationalArchetype[] | undefined): { resolution: Resolution<OperationalArchetype>; trace: FieldTrace; components: readonly OperationalArchetype[] } {
  const primary = signals.deliveryMode;
  if (!isMaterial(primary)) {
    // Un hint de nicho NUNCA resuelve por sí solo (§6, mutación A) — a lo sumo aporta candidatos a un `unresolved`.
    if (nicheHints && nicheHints.length > 0) return { resolution: unresolved("insufficient_evidence", nicheHints), trace: unresolvedTrace("archetype", "insufficient_evidence", nicheHints, ["deliveryMode"]), components: [] };
    return { resolution: unresolved("not_asked"), trace: unresolvedTrace("archetype", "not_asked", [], ["deliveryMode"]), components: [] };
  }
  const primaryValue = DELIVERY_MODE_TO_ARCHETYPE[primary.value];
  const secondary = signals.secondaryDeliveryMode;
  if (areIndependent(primary, secondary)) {
    const secondaryValue = DELIVERY_MODE_TO_ARCHETYPE[secondary!.value];
    // Componentes reales (DIAG-V3-08B.3 Lote B C1, §4-6 del checkpoint): orden canónico (alfabético),
    // sin duplicados, derivados de la MISMA evidencia que resolvió "hybrid" — nunca "hybrid" como componente.
    const components = [...new Set([primaryValue, secondaryValue])].sort();
    return {
      resolution: resolved("hybrid", "signal"),
      trace: resolvedTrace("archetype", "hybrid", ["deliveryMode", "secondaryDeliveryMode"], `dos mecanismos de entrega reales e independientes: ${primaryValue} + ${secondaryValue}`),
      components,
    };
  }
  return { resolution: resolved(primaryValue, "signal"), trace: resolvedTrace("archetype", primaryValue, ["deliveryMode"], "mecanismo de entrega declarado/observado"), components: [primaryValue] };
}

// ── Niche / NicheGroup ───────────────────────────────────────────────────────

function resolveNiche(signals: DiagnosticSignalsV3): { resolution: Resolution<NicheId>; trace: FieldTrace } {
  const declared = signals.declaredNicheId;
  if (!isMaterial(declared)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("niche", "not_asked", [], ["declaredNicheId"]) };
  return { resolution: resolved(declared.value, "signal"), trace: resolvedTrace("niche", declared.value, ["declaredNicheId"], "nicho declarado") };
}

/**
 * Evidencia posible para `NicheGroup` (DIAG-V3-08B.3, regla "sector-first" + domain review R1): tres
 * fuentes independientes pueden declarar un valor. Una fuente más específica puede COMPLETAR
 * información que falta, pero nunca debe sobrescribir en silencio una declaración material
 * incompatible de otra fuente — si dos fuentes están presentes y DIFIEREN, el campo queda
 * `conflicting_evidence`, con ambas señales visibles en el trace, nunca una resolución silenciosa por
 * prioridad fija. Solo cuando hay UNA sola fuente materialmente presente (o varias que coinciden) se
 * resuelve normalmente.
 */
function nicheGroupCandidates(nicheResolution: Resolution<NicheId>, signals: DiagnosticSignalsV3): readonly { readonly source: string; readonly value: NicheGroup }[] {
  const candidates: { source: string; value: NicheGroup }[] = [];
  if (isResolved(nicheResolution)) {
    // FACT registry (DIAG-V3-08B.0 §18): un nicho conocido mapea a su grupo. Nunca se adivina "other".
    const group = lookupNicheGroup(nicheResolution.value);
    if (group) candidates.push({ source: "declaredNicheId", value: group });
  }
  if (signals.declaredNicheGroupOther?.value === true) candidates.push({ source: "declaredNicheGroupOther", value: "other" });
  if (isMaterial(signals.declaredNicheGroup)) candidates.push({ source: "declaredNicheGroup", value: signals.declaredNicheGroup.value });
  return candidates;
}

function resolveNicheGroup(nicheResolution: Resolution<NicheId>, signals: DiagnosticSignalsV3): { resolution: Resolution<NicheGroup>; trace: FieldTrace } {
  const candidates = nicheGroupCandidates(nicheResolution, signals);
  const distinctValues = [...new Set(candidates.map((candidate) => candidate.value))];

  if (distinctValues.length > 1) {
    const sourceLabels = candidates.map((candidate) => `${candidate.source}=${candidate.value}`);
    return {
      resolution: unresolved("conflicting_evidence", distinctValues),
      trace: unresolvedTrace("nicheGroup", "conflicting_evidence", distinctValues, sourceLabels),
    };
  }
  if (distinctValues.length === 1) {
    const value = distinctValues[0]!;
    const sources = candidates.map((candidate) => candidate.source);
    const reason = value === "other" ? "declaración explícita de que el nicho no encaja en ningún grupo conocido (§18)" : sources.includes("declaredNicheId") ? "nicho conocido en el catálogo (FACT registry, taxonomy.ts)" : "sector amplio declarado directamente, sin necesidad de resolver un NicheId específico (DIAG-V3-08B.3, regla sector-first)";
    return { resolution: resolved(value, "signal"), trace: resolvedTrace("nicheGroup", value, sources, reason) };
  }
  if (!isResolved(nicheResolution)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("nicheGroup", "not_asked", [], ["declaredNicheId", "declaredNicheGroup"]) };
  return { resolution: unresolved("insufficient_evidence", []), trace: unresolvedTrace("nicheGroup", "insufficient_evidence", [], ["declaredNicheId (fuera de catálogo)", "declaredNicheGroup"]) };
}

// ── CustomerModel ────────────────────────────────────────────────────────────

function resolveCustomerAxis<T extends string>(field: string, signal: Signal<T> | undefined): { resolution: Resolution<T>; trace: FieldTrace } {
  if (!isMaterial(signal)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace(field, "not_asked", [], [field]) };
  return { resolution: resolved(signal.value, "signal"), trace: resolvedTrace(field, signal.value, [field], "declarado/observado") };
}

// ── GrowthStage (resuelve DIAG-V3-08B0-GROWTH-STAGE-SIGNAL-001) ─────────────

function resolveGrowthStage(signals: DiagnosticSignalsV3): { resolution: Resolution<GrowthStage>; trace: FieldTrace } {
  const hasCustomers = signals.hasRealCustomers;
  if (!isMaterial(hasCustomers)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("growthStage", "not_asked", [], ["hasRealCustomers"]) };

  if (hasCustomers.value === false) {
    return { resolution: resolved("idea", "signal"), trace: resolvedTrace("growthStage", "idea", ["hasRealCustomers=false"], "sin clientes/transacciones reales: idea o pre-lanzamiento") };
  }

  const regularity = signals.operatingRegularity;
  if (!isMaterial(regularity) || regularity.value !== "regular") {
    return {
      resolution: resolved("starting", "signal"),
      trace: resolvedTrace("growthStage", "starting", ["hasRealCustomers=true", regularity ? `operatingRegularity=${regularity.value}` : "operatingRegularity=ausente"], "primeros clientes reales, operación todavía no regular/repetible"),
    };
  }

  const trend = signals.demandTrend;
  const pressure = signals.capacityPressure;
  const expansion = signals.capacityExpansion;
  if (!trend && !pressure && !expansion) {
    // BLOQUEADOR resuelto (§21-23): sin señal de tendencia/presión/expansión no se puede distinguir
    // operating de growing — nunca se elige uno arbitrariamente.
    return { resolution: unresolved("insufficient_evidence", ["operating", "growing"]), trace: unresolvedTrace("growthStage", "insufficient_evidence", ["operating", "growing"], ["demandTrend", "capacityPressure", "capacityExpansion"]) };
  }

  // `capacityExpansion` (contratación/apertura reciente) es evidencia de crecimiento por sí sola, igual
  // que `demandTrend`/`capacityPressure` — no solo un desempate growing/scaling (ver `systemization`
  // más abajo, que sí es solo eso). Un `demandTrend: decreasing_observed` NUNCA cuenta como evidencia de
  // crecimiento (revisión de dominio independiente): se distingue explícitamente de `flat_or_unknown` en
  // el trace aunque `GrowthStage` (contracts.ts) todavía no tenga un valor "en declive" propio.
  const growingEvidence = trend?.value === "increasing_observed" || pressure?.value === true || expansion?.value === true;
  if (!growingEvidence) {
    const demandLabel = trend?.value === "decreasing_observed" ? "demandTrend=decreasing_observed (sin valor propio en GrowthStage todavía; ver DIAG-V3-08B0-GROWTH-STAGE-SIGNAL-001)" : "demandTrend=flat_or_unknown/ausente";
    return {
      resolution: resolved("operating", "signal"),
      trace: resolvedTrace("growthStage", "operating", ["operatingRegularity=regular", demandLabel, "capacityPressure/capacityExpansion=false/ausente"], "actividad estable y repetible, sin evidencia observable de aumento de demanda/volumen/capacidad"),
    };
  }

  const supporting = [
    "operatingRegularity=regular",
    trend?.value === "increasing_observed" ? "demandTrend=increasing_observed" : undefined,
    pressure?.value === true ? "capacityPressure=true (aumento observado)" : undefined,
    expansion?.value === true ? "capacityExpansion=true" : undefined,
  ].filter((s): s is string => s !== undefined);

  if (signals.systemization?.value !== true) {
    return { resolution: resolved("growing", "signal"), trace: resolvedTrace("growthStage", "growing", supporting, "aumento observable de demanda/volumen/capacidad, sin soporte de proceso/equipo todavía") };
  }

  return {
    resolution: resolved("scaling", "signal"),
    trace: resolvedTrace("growthStage", "scaling", [...supporting, "systemization=true"], "el crecimiento se sostiene con procesos/equipo repetibles, no solo con el esfuerzo del fundador"),
  };
}

// ── PrimaryGoal ──────────────────────────────────────────────────────────────

function resolvePrimaryGoal(signals: DiagnosticSignalsV3): { resolution: Resolution<PrimaryGoal>; trace: FieldTrace } {
  if (signals.declaredGoalUnknown?.value === true) return { resolution: unresolved("declared_unknown"), trace: unresolvedTrace("primaryGoal", "declared_unknown", [], []) };
  const declared = signals.declaredGoal;
  if (!isMaterial(declared)) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("primaryGoal", "not_asked", [], ["declaredGoal"]) };
  return { resolution: resolved(declared.value, "signal"), trace: resolvedTrace("primaryGoal", declared.value, ["declaredGoal"], "objetivo declarado") };
}

// ── PrimaryFriction ──────────────────────────────────────────────────────────

/**
 * Nota de diseño (revisión de dominio independiente): a diferencia de `resolveGrowthStage`, que
 * desconfía deliberadamente de la autopercepción ("estable" se prueba, no se declara), aquí una
 * `explicit_declaration` gana sobre señales `derived_fact`/`observed_fact` más débiles. No es una
 * inconsistencia: son dominios epistémicos distintos. "¿Estoy creciendo?" es una autoevaluación
 * propensa a sesgo motivacional (todo el mundo cree que está creciendo u "quiere" estarlo). "¿Cuál es tu
 * principal fricción?" es la persona describiendo SU PROPIA experiencia directa — no hay un hecho
 * externo más autorizado que sustituya lo que alguien vive día a día en su propio negocio. Por eso el
 * peso de la autodeclaración es distinto en cada resolver, a propósito.
 */
function resolvePrimaryFriction(signals: DiagnosticSignalsV3): { resolution: Resolution<PrimaryFriction>; trace: FieldTrace } {
  const list = signals.frictionSignals ?? [];
  if (list.length === 0) return { resolution: unresolved("not_asked"), trace: unresolvedTrace("primaryFriction", "not_asked", [], ["frictionSignals"]) };

  // §32: el orden de entrada de señales equivalentes no debe cambiar la resolución — `distinctValues`/
  // `strongestValues` se ordenan alfabéticamente (un orden canónico, no el de inserción) para que
  // invertir el array de entrada nunca cambie ni el candidato elegido ni el orden de `candidates`.
  const distinctValues = [...new Set(list.map((signal) => signal.value))].sort();
  if (distinctValues.length === 1) {
    return { resolution: resolved(distinctValues[0]!, "signal"), trace: resolvedTrace("primaryFriction", distinctValues[0]!, ["frictionSignals"], "señal única y consistente") };
  }

  // §26: varias fricciones distintas — solo se resuelve si UNA tiene evidencia estrictamente más fuerte
  // que todas las demás. Nunca se elige la primera del enum ni la primera de la lista arbitrariamente.
  const maxStrength = Math.max(...list.map((signal) => SIGNAL_PROVENANCE_STRENGTH[signal.provenance]));
  const strongestValues = [...new Set(list.filter((signal) => SIGNAL_PROVENANCE_STRENGTH[signal.provenance] === maxStrength).map((signal) => signal.value))].sort();
  if (strongestValues.length === 1) {
    return { resolution: resolved(strongestValues[0]!, "signal"), trace: resolvedTrace("primaryFriction", strongestValues[0]!, ["frictionSignals (dominante por precedencia)"], "una señal con evidencia estrictamente más fuerte que las demás", distinctValues.filter((value) => value !== strongestValues[0])) };
  }

  return { resolution: unresolved("insufficient_evidence", distinctValues), trace: unresolvedTrace("primaryFriction", "insufficient_evidence", distinctValues) };
}

// ── Composición ──────────────────────────────────────────────────────────────

/**
 * Punto de entrada único (§9). `nicheHints` es opcional y deliberadamente separado de `signals`: viene
 * de `taxonomy.ts` (`lookupNicheArchetypeHints`) a partir del `niche` YA resuelto, no al revés — evita
 * la circularidad que prohíbe §10 (Niche puede aportar hints a Archetype, pero Archetype nunca resuelve
 * Niche).
 */
export function resolveDiagnosticContext(signals: DiagnosticSignalsV3, nicheHints?: readonly OperationalArchetype[]): ContextResolutionResult {
  const entity = resolveEntityType(signals);
  const businessModel = resolveBusinessModel(signals);
  const archetype = resolveOperationalArchetype(signals, nicheHints);
  const niche = resolveNiche(signals);
  const nicheGroup = resolveNicheGroup(niche.resolution, signals);
  const customerReach = resolveCustomerAxis<CustomerReach>("customerReach", signals.customerReach);
  const customerBuyer = resolveCustomerAxis<CustomerBuyer>("customerBuyer", signals.buyerType);
  const growthStage = resolveGrowthStage(signals);
  const primaryGoal = resolvePrimaryGoal(signals);
  const primaryFriction = resolvePrimaryFriction(signals);

  return {
    context: {
      version: CURRENT_DIAGNOSTIC_VERSION,
      entity: entity.resolution,
      businessModel: businessModel.resolution,
      archetype: archetype.resolution,
      archetypeComponents: archetype.components,
      niche: niche.resolution,
      nicheGroup: nicheGroup.resolution,
      growthStage: growthStage.resolution,
      customerModel: { reach: customerReach.resolution, buyer: customerBuyer.resolution },
      primaryGoal: primaryGoal.resolution,
      primaryFriction: primaryFriction.resolution,
    },
    trace: {
      entity: entity.trace,
      businessModel: businessModel.trace,
      archetype: archetype.trace,
      niche: niche.trace,
      nicheGroup: nicheGroup.trace,
      customerReach: customerReach.trace,
      customerBuyer: customerBuyer.trace,
      growthStage: growthStage.trace,
      primaryGoal: primaryGoal.trace,
      primaryFriction: primaryFriction.trace,
    },
  };
}
