import type {
  CustomerBuyer,
  CustomerReach,
  EntityType,
  NicheId,
  PrimaryFriction,
  PrimaryGoal,
} from "./contracts";
import {
  SIGNAL_PROVENANCE_STRENGTH,
  type DeliveryMode,
  type DemandTrend,
  type DiagnosticSignalsV3,
  type MonetizationMechanism,
  type OperatingRegularity,
  type Signal,
  type SignalProvenance,
} from "./signals";

/**
 * DSL de producción de señales de DIAG-V3-08B.2 (§10, §55-57).
 *
 * Una `SignalProduction` es DATO puro, nunca una función: cada `kind` corresponde exactamente a un
 * campo de `DiagnosticSignalsV3` (08B.1) y solo acepta el tipo de valor real de ese campo — no existe
 * un `{ signal: string, value: unknown }` genérico que pudiera aceptar una combinación inválida. Una
 * pregunta nunca resuelve `BusinessModel`/`OperationalArchetype`/etc. directamente (§2, §10): solo
 * declara qué señal produce cada opción; `resolveDiagnosticContext` (08B.1) sigue siendo el único lugar
 * donde una señal se convierte en un concepto de dominio.
 */
export type SignalProduction =
  | { readonly kind: "entity"; readonly value: EntityType; readonly provenance: SignalProvenance }
  | { readonly kind: "hasOtherPaidStaff"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "monetizationMechanism"; readonly slot: "primary" | "secondary"; readonly value: MonetizationMechanism; readonly provenance: SignalProvenance }
  | { readonly kind: "deliveryMode"; readonly slot: "primary" | "secondary"; readonly value: DeliveryMode; readonly provenance: SignalProvenance }
  | { readonly kind: "niche"; readonly value: NicheId; readonly provenance: SignalProvenance }
  | { readonly kind: "nicheGroupOther"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "customerReach"; readonly value: CustomerReach; readonly provenance: SignalProvenance }
  | { readonly kind: "customerBuyer"; readonly value: CustomerBuyer; readonly provenance: SignalProvenance }
  | { readonly kind: "hasRealCustomers"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "operatingRegularity"; readonly value: OperatingRegularity; readonly provenance: SignalProvenance }
  | { readonly kind: "demandTrend"; readonly value: DemandTrend; readonly provenance: SignalProvenance }
  | { readonly kind: "capacityPressure"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "capacityExpansion"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "systemization"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "goal"; readonly value: PrimaryGoal; readonly provenance: SignalProvenance }
  | { readonly kind: "goalUnknown"; readonly value: boolean; readonly provenance: SignalProvenance }
  | { readonly kind: "friction"; readonly value: PrimaryFriction; readonly provenance: SignalProvenance };

export const SIGNAL_PRODUCTION_KINDS = [
  "entity",
  "hasOtherPaidStaff",
  "monetizationMechanism",
  "deliveryMode",
  "niche",
  "nicheGroupOther",
  "customerReach",
  "customerBuyer",
  "hasRealCustomers",
  "operatingRegularity",
  "demandTrend",
  "capacityPressure",
  "capacityExpansion",
  "systemization",
  "goal",
  "goalUnknown",
  "friction",
] as const;

/**
 * Campo de `DiagnosticSignalsV3` (08B.1) que afecta cada `kind` — usado por el validador estático
 * (§43-49, "una pregunta nunca puede gatear su propio campo") para saber qué CAMPO DE CONTEXTO queda
 * afectado indirectamente por cada tipo de producción, sin duplicar esa relación a mano en cada sitio.
 */
export const SIGNAL_PRODUCTION_CONTEXT_FIELD: Readonly<Record<(typeof SIGNAL_PRODUCTION_KINDS)[number], string>> = {
  entity: "entity",
  hasOtherPaidStaff: "entity",
  monetizationMechanism: "businessModel",
  deliveryMode: "archetype",
  niche: "niche",
  nicheGroupOther: "nicheGroup",
  customerReach: "customerReach",
  customerBuyer: "customerBuyer",
  hasRealCustomers: "growthStage",
  operatingRegularity: "growthStage",
  demandTrend: "growthStage",
  capacityPressure: "growthStage",
  capacityExpansion: "growthStage",
  systemization: "growthStage",
  goal: "primaryGoal",
  goalUnknown: "primaryGoal",
  friction: "primaryFriction",
};

/** Origen de una señal derivada de una respuesta V2 (§12): pregunta + opción que la produjo, para trace/analytics/dedup. */
export type SignalOrigin = { readonly questionId: string; readonly optionId: string };

/**
 * El "slot" real de `DiagnosticSignalsV3` que una producción disputa en `foldSignalProductions` —
 * `"friction"` es especial (acumula, nunca compite: varias preguntas SÍ pueden producir fricción a la
 * vez por diseño). Exportado para que el validador estático (`qbv2-validators.ts`) pueda detectar
 * cuándo dos preguntas del banco compiten de verdad por el MISMO campo (§37, hallazgo de revisión de
 * dominio independiente: sin esto, un empate de fuerza entre dos preguntas se decide por orden
 * alfabético de `QuestionId`, una dependencia incidental que un renombrado en 08B.3 podría romper sin
 * que nada lo señale).
 */
export function scalarSlotForProduction(production: SignalProduction): string | undefined {
  if (production.kind === "friction") return "friction";
  if (production.kind === "monetizationMechanism") return production.slot === "primary" ? "monetizationMechanism" : "secondaryMonetizationMechanism";
  if (production.kind === "deliveryMode") return production.slot === "primary" ? "deliveryMode" : "secondaryDeliveryMode";
  return PRODUCTION_TO_FIELD[production.kind];
}

type ScalarSignalKey = Exclude<keyof DiagnosticSignalsV3, "frictionSignals" | "secondaryMonetizationMechanism" | "secondaryDeliveryMode">;

const PRODUCTION_TO_FIELD: Partial<Record<SignalProduction["kind"], ScalarSignalKey>> = {
  entity: "entityDeclared",
  hasOtherPaidStaff: "hasOtherPaidStaff",
  niche: "declaredNicheId",
  nicheGroupOther: "declaredNicheGroupOther",
  customerReach: "customerReach",
  customerBuyer: "buyerType",
  hasRealCustomers: "hasRealCustomers",
  operatingRegularity: "operatingRegularity",
  demandTrend: "demandTrend",
  capacityPressure: "capacityPressure",
  capacityExpansion: "capacityExpansion",
  systemization: "systemization",
  goal: "declaredGoal",
  goalUnknown: "declaredGoalUnknown",
};

/**
 * Pliega producciones (cada una con su origen) en `DiagnosticSignalsV3`. Determinista (§31 de 08B.1,
 * extendido aquí a QBV2): si dos respuestas activas producen el MISMO campo con valores distintos, gana
 * la de procedencia más fuerte; en empate, gana el `questionId` alfabéticamente menor — nunca el orden
 * de inserción del objeto de respuestas (§32).
 */
export function foldSignalProductions(entries: readonly { origin: SignalOrigin; production: SignalProduction }[]): DiagnosticSignalsV3 {
  const signals: Record<string, Signal<unknown>> = {};
  const winners: Record<string, string> = {}; // field -> questionId del que ganó, para desempate estable
  const frictionSignals: Signal<PrimaryFriction>[] = [];

  const consider = (field: string, questionId: string, candidate: Signal<unknown>) => {
    const current = signals[field];
    if (!current) {
      signals[field] = candidate;
      winners[field] = questionId;
      return;
    }
    const currentStrength = SIGNAL_PROVENANCE_STRENGTH[current.provenance];
    const candidateStrength = SIGNAL_PROVENANCE_STRENGTH[candidate.provenance];
    if (candidateStrength > currentStrength || (candidateStrength === currentStrength && questionId < winners[field]!)) {
      signals[field] = candidate;
      winners[field] = questionId;
    }
  };

  const sorted = [...entries].sort((a, b) => a.origin.questionId.localeCompare(b.origin.questionId));
  for (const { origin, production } of sorted) {
    if (production.kind === "friction") {
      frictionSignals.push({ value: production.value, provenance: production.provenance });
      continue;
    }
    const candidate: Signal<unknown> = { value: production.value, provenance: production.provenance };
    const slot = scalarSlotForProduction(production);
    if (slot) consider(slot, origin.questionId, candidate);
  }

  const result = { ...signals } as DiagnosticSignalsV3;
  if (frictionSignals.length > 0) (result as { frictionSignals?: readonly Signal<PrimaryFriction>[] }).frictionSignals = frictionSignals;
  return result;
}
