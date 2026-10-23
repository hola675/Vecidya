import { resolveDiagnosticContext as historicalResolver, type ResolvedDomainContext as HistoricalContext, type ContextResolutionTrace as HistoricalTrace, type FieldTrace } from "../context-resolver";
import { resolved, unresolved, type EntityType, type OperationalArchetype, type Resolution, type CustomerBuyer, type CustomerReach } from "../contracts";
import type { DiagnosticSignalsV3, Signal } from "../signals";
import type { AnswersV2 } from "../qbv2-rules";
import { CONTEXT_ID, OPERATIONAL_STATUSES, type OperationalStatus, type BuyerDisposition } from "./contract";

export type ContractSignal<T> = Signal<T> & { readonly questionId: string; readonly questionVersion: number };
const declaration = <T>(value: T, questionId: string, questionVersion: number): ContractSignal<T> => ({ value, provenance: "explicit_declaration", questionId, questionVersion });
export type ContractSignals = {
  readonly entity?: ContractSignal<EntityType>;
  readonly entityUnknown?: ContractSignal<boolean>;
  readonly hasOtherPaidStaff?: ContractSignal<boolean>;
  readonly hasOtherPaidStaffUnknown?: ContractSignal<boolean>;
  readonly operationalStatus?: ContractSignal<OperationalStatus>;
  readonly hasEverHadRealPeople?: ContractSignal<boolean>;
  readonly historyUnknown?: ContractSignal<boolean>;
  readonly digitalToolUse?: ContractSignal<string>;
  readonly digitalToolUseUnknown?: ContractSignal<boolean>;
  readonly buyer?: ContractSignal<BuyerDisposition>;
  readonly reachUnknown?: ContractSignal<boolean>;
  readonly serviceSetting: readonly ContractSignal<"physical_location" | "travels" | "remote_service">[];
  readonly appointmentMode?: ContractSignal<"appointments">;
  readonly purchaseChannel: readonly ContractSignal<"retail" | "online_checkout">[];
  readonly onsiteConsumption?: ContractSignal<boolean>;
  readonly otherDelivery?: ContractSignal<boolean>;
  readonly deliveryUnknown?: ContractSignal<boolean>;
  readonly buyerRecipient?: ContractSignal<"same_party" | "third_party" | "unknown">;
  readonly funding?: ContractSignal<"donations_grants_contributions">;
};

/** Adaptador de hechos del contrato nuevo; no altera SignalProduction ni los mapas históricos. */
export function deriveContractSignals(answers: AnswersV2): ContractSignals {
  const delivery = Array.isArray(answers.q2_delivery) ? answers.q2_delivery : [];
  const entity = answers.q2_entity;
  const state = answers.q2_operational_status;
  const buyer = answers.q2_customer_buyer;
  const role = answers.q2_buyer_recipient_relation;
  const digitalTools = Array.isArray(answers.q2_digital_tools_in_use) ? answers.q2_digital_tools_in_use : [];
  return {
    ...(["individual", "business", "organization", "project"].includes(String(entity)) ? { entity: declaration(entity as EntityType, "q2_entity", 3) } : {}),
    ...(entity === "unknown" ? { entityUnknown: declaration(true, "q2_entity", 3) } : {}),
    ...(["yes", "no"].includes(String(answers.q2_other_staff)) ? { hasOtherPaidStaff: declaration(answers.q2_other_staff === "yes", "q2_other_staff", 2) } : {}),
    ...(answers.q2_other_staff === "unknown" ? { hasOtherPaidStaffUnknown: declaration(true, "q2_other_staff", 2) } : {}),
    ...((OPERATIONAL_STATUSES as readonly unknown[]).includes(state) ? { operationalStatus: declaration(state as OperationalStatus, "q2_operational_status", 1) } : {}),
    ...(["yes", "no"].includes(String(answers.q2_has_customers)) ? { hasEverHadRealPeople: declaration(answers.q2_has_customers === "yes", "q2_has_customers", 3) } : {}),
    ...(answers.q2_has_customers === "unknown" ? { historyUnknown: declaration(true, "q2_has_customers", 3) } : {}),
    ...(digitalTools.includes("none") ? { digitalToolUse: declaration("none", "q2_digital_tools_in_use", 1) } : {}),
    ...(digitalTools.includes("not_needed") ? { digitalToolUse: declaration("not_needed", "q2_digital_tools_in_use", 1) } : {}),
    ...(digitalTools.some(value => ["calendar_scheduling", "documents_records", "tasks_projects", "customer_followup", "inventory_operations", "other"].includes(value)) ? { digitalToolUse: declaration(digitalTools.filter(value => value !== "none" && value !== "unknown" && value !== "not_needed").join("|"), "q2_digital_tools_in_use", 1) } : {}),
    ...(digitalTools.includes("unknown") ? { digitalToolUseUnknown: declaration(true, "q2_digital_tools_in_use", 1) } : {}),
    ...(["b2c", "b2b", "mixed", "no_direct_purchase", "unknown"].includes(String(buyer)) ? { buyer: declaration(buyer as BuyerDisposition, "q2_customer_buyer", 3) } : {}),
    ...(answers.q2_customer_reach === "unknown" ? { reachUnknown: declaration(true, "q2_customer_reach", 3) } : {}),
    serviceSetting: (["physical_location", "travels", "remote_service"] as const).filter(value => delivery.includes(value)).map(value => declaration(value, "q2_delivery", 4)),
    ...(delivery.includes("appointments") ? { appointmentMode: declaration("appointments" as const, "q2_delivery", 4) } : {}),
    purchaseChannel: (["retail", "online_checkout"] as const).filter(value => delivery.includes(value)).map(value => declaration(value, "q2_delivery", 4)),
    ...(delivery.includes("onsite") ? { onsiteConsumption: declaration(true, "q2_delivery", 4) } : {}),
    ...(delivery.includes("other") ? { otherDelivery: declaration(true, "q2_delivery", 4) } : {}),
    ...(delivery.includes("unsure") ? { deliveryUnknown: declaration(true, "q2_delivery", 4) } : {}),
    ...(["same_party", "third_party", "unknown"].includes(String(role)) ? { buyerRecipient: declaration(role as "same_party" | "third_party" | "unknown", "q2_buyer_recipient_relation", 1) } : {}),
    ...(answers.q2_monetization === "mission" ? { funding: declaration("donations_grants_contributions" as const, "q2_monetization", 3) } : {}),
  };
}

export type ResolvedDomainContext = HistoricalContext & {
  readonly contractIdentity: typeof CONTEXT_ID;
  readonly hasOtherPaidStaff: Resolution<"yes" | "no">;
  readonly operationalStatus: Resolution<Exclude<OperationalStatus, "unknown">>;
  readonly hasEverHadRealPeople: boolean | null;
  readonly buyerDisposition: BuyerDisposition | null;
  readonly buyerRecipient: Resolution<"same_party" | "third_party">;
  readonly digitalToolUse: Resolution<string>;
  readonly funding: "donations_grants_contributions" | null;
  readonly delivery: Pick<ContractSignals, "serviceSetting" | "appointmentMode" | "purchaseChannel" | "onsiteConsumption" | "otherDelivery">;
};
export type ContextResolutionTrace = HistoricalTrace & { readonly hasOtherPaidStaff: FieldTrace; readonly operationalStatus: FieldTrace; readonly history: FieldTrace; readonly buyerRecipient: FieldTrace; readonly funding: FieldTrace; readonly digitalToolUse: FieldTrace };
const fieldTrace = (field: string, value: Resolution<string>, sources: readonly string[]): FieldTrace => value.status === "resolved"
  ? { status: "resolved", field, value: value.value, supportingSignals: sources, resolutionReason: "hecho explícito del contrato QA-03B" }
  : { status: "unresolved", field, reason: value.reason, candidates: value.candidates, supportingSignals: sources };

function resolveDelivery(signals: ContractSignals, nicheHints?: readonly OperationalArchetype[]): { resolution: Resolution<OperationalArchetype>; components: readonly OperationalArchetype[] } {
  // Citas/lugar/desplazamiento/remoto describen ejes del mismo servicio, no negocios adicionales.
  const components: OperationalArchetype[] = [];
  for (const channel of signals.purchaseChannel) components.push(channel.value === "retail" ? "retail" : "ecommerce");
  if (signals.onsiteConsumption) components.push("hospitality");
  if (signals.appointmentMode) components.push("appointments");
  // Un establecimiento o una visita solo identifica local/local_service si no hay un mecanismo más preciso.
  if (!signals.appointmentMode && !signals.onsiteConsumption && signals.purchaseChannel.length === 0) {
    const physical = signals.serviceSetting.some(item => item.value === "physical_location");
    const travels = signals.serviceSetting.some(item => item.value === "travels");
    if (physical && travels) return { resolution: unresolved("insufficient_evidence", ["local", "local_service"]), components: [] };
    if (physical) components.push("local");
    if (travels) components.push("local_service");
  }
  const unique = [...new Set(components)].sort();
  if (unique.length > 1) return { resolution: resolved("hybrid", "signal"), components: unique };
  if (unique.length === 1) return { resolution: resolved(unique[0]!, "signal"), components: unique };
  // Remoto no es ecommerce ni un arquetipo profesional inferido. Los hints solo acotan candidatos.
  return { resolution: unresolved(signals.deliveryUnknown ? "declared_unknown" : "insufficient_evidence", nicheHints ?? []), components: [] };
}

export function resolveContractContext(legacySignals: DiagnosticSignalsV3, facts: ContractSignals, nicheHints?: readonly OperationalArchetype[]): { context: ResolvedDomainContext; trace: ContextResolutionTrace } {
  const state = facts.operationalStatus?.value;
  const ever = facts.hasEverHadRealPeople?.value;
  const old = historicalResolver({ ...legacySignals,
    entityDeclared: facts.entity,
    // El resolver histórico recibe historia solo al evaluar una actividad explícitamente operativa.
    hasRealCustomers: state === "operating" && ever !== undefined ? { value: ever, provenance: "explicit_declaration" } : undefined,
  }, nicheHints);
  const operationalStatus: ResolvedDomainContext["operationalStatus"] = state && state !== "unknown" ? resolved(state, "signal") : unresolved(state === "unknown" ? "declared_unknown" : "not_asked");
  const hasOtherPaidStaff = facts.hasOtherPaidStaff ? resolved(facts.hasOtherPaidStaff.value ? "yes" : "no", "signal")
    : unresolved<"yes" | "no">(facts.hasOtherPaidStaffUnknown ? "declared_unknown" : "not_asked");
  const activity: HistoricalContext["activity"] = state === "operating" ? resolved("active", "signal") : state === "preparing" ? resolved("prelaunch", "signal") : unresolved(state === "unknown" ? "declared_unknown" : state === "paused" ? "insufficient_evidence" : "not_asked");
  const growthStage = state === "preparing" && ever !== true ? resolved("idea", "signal")
    : state === "operating" && ever === true ? old.context.growthStage
      : unresolved<import("../contracts").GrowthStage>(state === "unknown" ? "declared_unknown" : "insufficient_evidence", state === "operating" ? ["starting", "operating", "growing", "scaling"] : []);
  const entity = facts.entity ? resolved(facts.entity.value, "signal") : unresolved<EntityType>(facts.entityUnknown ? "declared_unknown" : "not_asked");
  const buyer = facts.buyer?.value;
  const buyerResolution = buyer === "b2c" || buyer === "b2b" || buyer === "mixed" ? resolved<CustomerBuyer>(buyer, "signal") : unresolved<CustomerBuyer>(buyer === "unknown" ? "declared_unknown" : buyer === "no_direct_purchase" ? "insufficient_evidence" : "not_asked");
  const reach = facts.reachUnknown ? unresolved<CustomerReach>("declared_unknown") : old.context.customerModel.reach;
  const recipient = facts.buyerRecipient?.value;
  const buyerRecipient = recipient && recipient !== "unknown" ? resolved(recipient, "signal") : unresolved<"same_party" | "third_party">(recipient === "unknown" ? "declared_unknown" : "not_asked");
  const digitalToolUse = facts.digitalToolUse !== undefined ? resolved(facts.digitalToolUse.value, "signal")
    : unresolved<string>(facts.digitalToolUseUnknown ? "declared_unknown" : "not_asked");
  const archetype = resolveDelivery(facts, nicheHints);
  const context: ResolvedDomainContext = {
    ...old.context, contractIdentity: CONTEXT_ID, entity, activity, growthStage, hasOtherPaidStaff,
    archetype: archetype.resolution, archetypeComponents: archetype.components,
    customerModel: { reach, buyer: buyerResolution }, operationalStatus, hasEverHadRealPeople: ever ?? null, digitalToolUse,
    buyerDisposition: buyer ?? null, buyerRecipient, funding: facts.funding?.value ?? null,
    delivery: { serviceSetting: facts.serviceSetting, appointmentMode: facts.appointmentMode, purchaseChannel: facts.purchaseChannel, onsiteConsumption: facts.onsiteConsumption, otherDelivery: facts.otherDelivery },
  };
  const historyResolution = ever === undefined ? unresolved<string>(facts.historyUnknown ? "declared_unknown" : "not_asked") : resolved(ever ? "yes" : "no", "signal");
  const fundingResolution = facts.funding ? resolved(facts.funding.value, "signal") : unresolved<string>("not_asked");
  return { context, trace: { ...old.trace,
    entity: fieldTrace("entity", entity, ["entityDeclared"]), activity: fieldTrace("activity", activity, ["operationalStatus"]),
    growthStage: fieldTrace("growthStage", growthStage, ["operationalStatus", "hasEverHadRealPeople", "operatingRegularity"]),
    archetype: fieldTrace("archetype", archetype.resolution, ["serviceSetting", "appointmentMode", "purchaseChannel", "onsiteConsumption"]),
    customerBuyer: fieldTrace("customerBuyer", buyerResolution, ["directBuyer"]), customerReach: fieldTrace("customerReach", reach, facts.reachUnknown ? ["customerReachUnknown"] : ["customerReach"]),
    hasOtherPaidStaff: fieldTrace("hasOtherPaidStaff", hasOtherPaidStaff, ["q2_other_staff"]),
    operationalStatus: fieldTrace("operationalStatus", operationalStatus, ["operationalStatus"]), history: fieldTrace("history", historyResolution, ["hasEverHadRealPeople"]),
    buyerRecipient: fieldTrace("buyerRecipient", buyerRecipient, ["buyerRecipientRelation"]), funding: fieldTrace("funding", fundingResolution, ["fundingMechanism"]), digitalToolUse: fieldTrace("digitalToolUse", digitalToolUse, ["q2_digital_tools_in_use"]),
  } };
}
