import type { DigitalDimensionId } from "../qbv2-dimensions";
import type { ApplicabilityEvidenceV3 } from "../qbv2-applicability";
import type { ResolvedDomainContext } from "./context";
export type { ApplicabilityEvidenceV3 } from "../qbv2-applicability";

export type DimensionApplicabilityReasonV3 = "observed_dimension_evidence" | "defined_activity" | "public_capability_context" | "audience_context" | "action_context" | "current_interaction_context" | "paused_offer_suspended" | "preparing_no_interaction" | "no_historical_recurrence" | "declared_no_digital_demand" | "context_unresolved";
export type DimensionApplicabilityDecisionV3 = {
  readonly applicability: "applicable" | "not_applicable" | "insufficient_context";
  readonly reason: DimensionApplicabilityReasonV3;
  readonly supportingContext: readonly string[];
};
type Input = { readonly dimension: DigitalDimensionId; readonly context: ResolvedDomainContext; readonly evidence?: readonly ApplicabilityEvidenceV3[] };

/** R4 candidata: la aplicabilidad no es un score ni una prueba de que exista la capacidad. */
export function evaluateDimensionApplicabilityV3({ dimension, context, evidence = [] }: Input): DimensionApplicabilityDecisionV3 {
  const status = context.operationalStatus.status === "resolved" ? context.operationalStatus.value : undefined;
  const model = context.businessModel.status === "resolved" ? context.businessModel.value : undefined;
  const buyer = context.customerModel.buyer.status === "resolved" ? context.customerModel.buyer.value : undefined;
  const reach = context.customerModel.reach.status === "resolved" ? context.customerModel.reach.value : undefined;
  const actual = evidence.filter(item => item.dimension === dimension && !["not_applicable", "uncertainty", "constraint"].includes(item.state));
  const facts = [
    `contextContract=${context.contractIdentity}`,
    `operationalStatus=${status ?? "unresolved"}`, `hasEverHadRealPeople=${String(context.hasEverHadRealPeople)}`,
    `businessModel=${model ?? "unresolved"}`, `buyerDisposition=${context.buyerDisposition ?? "unresolved"}`,
    ...actual.map(item => `evidence=${item.migrationIdentity}`),
  ].sort();
  const decision = (applicability: DimensionApplicabilityDecisionV3["applicability"], reason: DimensionApplicabilityReasonV3): DimensionApplicabilityDecisionV3 => ({ applicability, reason, supportingContext: facts });
  // Solo observaciones cuya elegibilidad temporal ya validó el mismo engine del planner/scorer.
  if (actual.length) return decision("applicable", "observed_dimension_evidence");
  const defined = model !== undefined || context.nicheGroup.status === "resolved";
  const deliveryKnown = context.delivery.serviceSetting.length > 0 || !!context.delivery.appointmentMode || context.delivery.purchaseChannel.length > 0 || !!context.delivery.onsiteConsumption;
  const explicitPublicCapability = deliveryKnown || buyer !== undefined || reach !== undefined;
  // Durante una pausa, las modalidades y el historial no prueban que siga publicado un activo.
  if (status === "paused" && dimension === "conversion_access") return decision("not_applicable", "paused_offer_suspended");
  if (status === "paused" && !["clarity_positioning", "digital_readiness", "relationship_recurrence"].includes(dimension)) return decision("insufficient_context", "context_unresolved");
  if (dimension === "clarity_positioning" || dimension === "digital_readiness") return defined
    ? decision("applicable", "defined_activity") : decision("insufficient_context", "context_unresolved");
  if (dimension === "conversion_access") {
    if (status === undefined) return decision("insufficient_context", "context_unresolved");
    return defined && explicitPublicCapability ? decision("applicable", "action_context") : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "relationship_recurrence") {
    if (status === "preparing" && context.hasEverHadRealPeople === false) return decision("not_applicable", "preparing_no_interaction");
    if (status === "operating" && context.hasEverHadRealPeople === false) return decision("not_applicable", "no_historical_recurrence");
    if (status === "paused" && context.hasEverHadRealPeople === false) return decision("not_applicable", "no_historical_recurrence");
    if (status !== "operating" || context.hasEverHadRealPeople !== true) return decision("insufficient_context", "context_unresolved");
    return defined && (deliveryKnown || buyer !== undefined) ? decision("applicable", "current_interaction_context") : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "discovery") {
    if (context.discoveryReachReliability.status === "resolved" && context.discoveryReachReliability.value === "not_seeking") return decision("not_applicable", "declared_no_digital_demand");
    return defined && (buyer !== undefined || reach !== undefined || deliveryKnown) ? decision("applicable", "audience_context") : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "trust_reputation") return decision("insufficient_context", "context_unresolved");
  if (dimension === "digital_foundation") {
    return defined && explicitPublicCapability ? decision("applicable", "public_capability_context") : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "measurement_optimization") {
    // El banco R3 congelado no observa instrumentación ni muestra. Remoto/checkout no la acreditan.
    return decision("insufficient_context", "context_unresolved");
  }
  return decision("insufficient_context", "context_unresolved");
}
