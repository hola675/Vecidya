import type { GoalId, ProfileId, StageId } from "./types";
import type { Context } from "./types";
import type { DiagnosticSignalsV3, Signal } from "./signals";

/**
 * Adapter QBV1 → `DiagnosticSignalsV3` (DIAG-V3-08B.1 §29).
 *
 * Produce SOLO las señales que realmente pueden derivarse de un contexto del banco actual (26
 * preguntas). La mayoría de los campos del resolver quedan sin señal — eso es correcto, no un defecto
 * de este adapter: QBV1 nunca preguntó por mecanismo de monetización, nicho, alcance de cliente, tipo
 * de comprador, tendencia de demanda, presión de capacidad ni sistematización. Ningún valor se inventa
 * para "completar" el contexto.
 *
 * Todas las señales de este adapter son, como mucho, `derived_fact` (nunca `observed_fact`): se derivan
 * de una categoría autodeclarada de un banco de preguntas que no fue diseñado para producir estas
 * señales, no de un comportamiento observado directamente. La única excepción es `declaredGoal`/
 * `declaredGoalUnknown`, que sí son declaraciones directas de la persona (la pregunta de objetivo SÍ
 * pregunta exactamente eso).
 */

function signal<T>(value: T, provenance: Signal<T>["provenance"]): Signal<T> {
  return { value, provenance };
}

function entitySignalsFromProfile(profile: ProfileId | undefined): Pick<DiagnosticSignalsV3, "entityDeclared" | "deliveryMode"> {
  switch (profile) {
    case "business":
      return { entityDeclared: signal("business", "derived_fact") };
    case "professional":
      return { entityDeclared: signal("individual", "derived_fact"), deliveryMode: signal("specialized_individual_practice", "derived_fact") };
    case "creator":
      // La entidad queda ambigua a propósito: un creador puede ser una persona o un grupo (mismo
      // razonamiento que `LEGACY_PROFILE_MAPPING.creator` en `mappings.ts`).
      return { deliveryMode: signal("own_audience_content", "derived_fact") };
    case "project":
      return { entityDeclared: signal("project", "derived_fact") };
    case "organization":
      // Sin `deliveryMode`: una organización no implica un mecanismo de entrega concreto
      // (`DIAG-V3-08B0-ARCHETYPE-LIFECYCLE-001`, resuelto retirando `organization` de `OperationalArchetype`).
      return { entityDeclared: signal("organization", "derived_fact") };
    case undefined:
      return {};
    default:
      return {};
  }
}

/**
 * `hasRealCustomers`/`operatingRegularity` se derivan solo cuando el texto de la opción legacy es
 * explícito al respecto (`questions.ts`): "idea" declara sin rodeos "todavía no atiendo a nadie";
 * "occasional"/"regular" declaran explícitamente la regularidad; "growing" declara estabilidad
 * ("funciona de forma estable") pero NUNCA una tendencia de crecimiento observada — es una intención
 * ("quiero crecer"), no una señal de `demandTrend`/`capacityPressure`. "launching" es demasiado ambiguo
 * (puede o no tener ya algún cliente) y no produce ninguna señal.
 *
 * Tensión reconocida y aceptada (revisión de dominio independiente): tratar "growing" igual que
 * "regular" (ambas → `operatingRegularity: "regular"`) reintroduce parcialmente la autopercepción que
 * este resolver existe para evitar — "estable" en "growing" viene empaquetado con una aspiración no
 * verificada. Se mantiene así deliberadamente, no por descuido, porque el resultado final es seguro: sin
 * `demandTrend`/`capacityPressure`/`capacityExpansion`, `resolveGrowthStage` nunca resuelve `growing` a
 * partir de esto — como mucho llega a `unresolved(insufficient_evidence, [operating, growing])`, igual
 * que si "growing" no aportara ninguna señal de regularidad. Marcarlo como `derived_fact` (no
 * `observed_fact`) dejó registro en el trace de que es más débil, aunque ningún resolver de campo único
 * exija hoy una fuerza estrictamente mayor para `operatingRegularity: "regular"` específicamente más
 * allá del piso general de materialidad (`isMaterial`, `context-resolver.ts`). Revisar si esto sigue
 * siendo suficiente cuando QBV2 (DIAG-V3-08B.2/.3) necesite mayor fidelidad de esta distinción.
 */
function growthSignalsFromStage(stage: StageId | undefined): Pick<DiagnosticSignalsV3, "hasRealCustomers" | "operatingRegularity"> {
  switch (stage) {
    case "idea":
      return { hasRealCustomers: signal(false, "derived_fact") };
    case "launching":
      return {};
    case "occasional":
      return { hasRealCustomers: signal(true, "derived_fact"), operatingRegularity: signal("irregular", "derived_fact") };
    case "regular":
    case "growing":
      return { hasRealCustomers: signal(true, "derived_fact"), operatingRegularity: signal("regular", "derived_fact") };
    case undefined:
      return {};
    default:
      return {};
  }
}

function goalSignalsFromGoal(goal: GoalId | undefined): Pick<DiagnosticSignalsV3, "declaredGoal" | "declaredGoalUnknown"> {
  if (goal === undefined) return {};
  if (goal === "unsure") return { declaredGoalUnknown: signal(true, "explicit_declaration") };
  return { declaredGoal: signal(goal, "explicit_declaration") };
}

/** Único punto de entrada del adapter (§29). Determinista: mismo `Context`, mismas señales. */
export function deriveSignalsFromLegacyContext(context: Context): DiagnosticSignalsV3 {
  return {
    ...entitySignalsFromProfile(context.profile),
    ...growthSignalsFromStage(context.stage),
    ...goalSignalsFromGoal(context.goal),
  };
}
