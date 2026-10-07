import type { ResolvedDomainContext } from "./context-resolver";
import type { Resolution } from "./contracts";
import type { DigitalDimensionId } from "./qbv2-dimensions";
import type { MigratedContextualEvidenceV3 } from "./qbv2-contextual-scoring";

export type DimensionApplicabilityV3 = "applicable" | "not_applicable" | "insufficient_context";

/** Stable semantic explanations for the R4-A decision matrix. */
export type DimensionApplicabilityReasonV3 =
  | "universal_dimension"
  | "active_operation"
  | "prelaunch_no_operation"
  | "audience_or_demand_context"
  | "concrete_action_context"
  | "ongoing_interaction_context"
  | "observed_dimension_evidence"
  | "context_unresolved";

export type DimensionApplicabilityDecisionV3 = {
  readonly applicability: DimensionApplicabilityV3;
  readonly reason: DimensionApplicabilityReasonV3;
  /** Canonically ordered, score-free facts that explain the decision. */
  readonly supportingContext: readonly string[];
};

export type EvaluateDimensionApplicabilityV3Input = {
  readonly dimension: DigitalDimensionId;
  readonly context: Partial<ResolvedDomainContext>;
  /** Active, validated V3 observations only. Legacy evidence is not accepted by this contract. */
  readonly evidence?: readonly ApplicabilityEvidenceV3[];
};

/** Score/contribution/directness are deliberately absent; only identity, dimension, and neutral/N-A distinction matter. */
export type ApplicabilityEvidenceV3 = Pick<MigratedContextualEvidenceV3, "questionId" | "questionVersion" | "migrationIdentity" | "dimension" | "state">;

type ApplicableEvidence = readonly ApplicabilityEvidenceV3[];

const DISCOVERY_ARCHETYPES = new Set(["local", "appointments", "local_service", "professional", "ecommerce", "retail", "hospitality", "b2b", "creator"]);
const ACTION_ARCHETYPES = new Set(["local", "appointments", "local_service", "professional", "ecommerce", "retail", "hospitality", "b2b"]);
const RELATIONSHIP_ARCHETYPES = new Set(["appointments", "professional", "retail", "b2b", "creator"]);
const ACTIVE_STAGES = new Set(["operating", "growing", "scaling"]);

function resolved<T extends string>(value: Resolution<T> | undefined): T | undefined {
  return value?.status === "resolved" ? value.value : undefined;
}

function evidenceFor(dimension: DigitalDimensionId, evidence: ApplicableEvidence): ApplicableEvidence {
  return evidence.filter((item) => item.dimension === dimension && item.state !== "not_applicable");
}

function describeContext(context: Partial<ResolvedDomainContext>, dimension: DigitalDimensionId, evidence: ApplicableEvidence): readonly string[] {
  const facts: string[] = [];
  const addResolution = (field: string, value: { readonly status: string; readonly value?: string; readonly reason?: string; readonly candidates?: readonly string[] } | undefined) => {
    if (!value) return;
    const candidates = value.candidates?.length ? `:candidates=${[...value.candidates].sort().join(",")}` : "";
    facts.push(value.status === "resolved" ? `${field}=${value.value}` : `${field}=unresolved:${value.reason}${candidates}`);
  };
  if (dimension === "digital_foundation" || dimension === "trust_reputation" || dimension === "measurement_optimization" || dimension === "relationship_recurrence") {
    addResolution("activity", context.activity);
    addResolution("growthStage", context.growthStage);
  }
  if (dimension === "discovery" || dimension === "conversion_access" || dimension === "relationship_recurrence") {
    addResolution("businessModel", context.businessModel);
    addResolution("archetype", context.archetype);
    addResolution("customerBuyer", context.customerModel?.buyer);
    for (const component of [...(context.archetypeComponents ?? [])].sort()) facts.push(`archetypeComponent=${component}`);
  }
  for (const item of evidence) facts.push(`evidence=${item.questionId}@v${item.questionVersion}:${item.migrationIdentity}`);
  return [...new Set(facts)].sort();
}

function decision(applicability: DimensionApplicabilityV3, reason: DimensionApplicabilityReasonV3, supportingContext: readonly string[]): DimensionApplicabilityDecisionV3 {
  return { applicability, reason, supportingContext: [...new Set(supportingContext)].sort() };
}

/**
 * Pure R4-A applicability policy. It does not score, aggregate evidence, or inspect declared goal/friction.
 * Precedence: valid observed evidence corroborates applicability; universal dimensions need no context;
 * structural facts then decide, and unresolved required facts remain insufficient.
 */
export function evaluateDimensionApplicabilityV3(input: EvaluateDimensionApplicabilityV3Input): DimensionApplicabilityDecisionV3 {
  const { dimension, context } = input;
  const evidence = evidenceFor(dimension, input.evidence ?? []);
  const facts = describeContext(context, dimension, evidence);
  if (evidence.length > 0) return decision("applicable", "observed_dimension_evidence", facts);

  // Clarity applies to businesses, individuals, organizations, and projects; readiness is meaningful
  // even before launch because it evaluates readiness for the digital capability the entity needs.
  if (dimension === "clarity_positioning" || dimension === "digital_readiness") {
    return decision("applicable", "universal_dimension", facts);
  }

  const activity = resolved(context.activity);
  const stage = resolved(context.growthStage);
  const structurallyActive = activity === "active" || (activity === undefined && stage !== undefined && ACTIVE_STAGES.has(stage));
  const prelaunch = activity === "prelaunch" || (activity === undefined && stage === "idea");

  if (dimension === "digital_foundation" || dimension === "trust_reputation" || dimension === "measurement_optimization") {
    if (structurallyActive) return decision("applicable", "active_operation", facts);
    if (prelaunch) return decision("not_applicable", "prelaunch_no_operation", facts);
    return decision("insufficient_context", "context_unresolved", facts);
  }

  const model = resolved(context.businessModel);
  const archetype = resolved(context.archetype);
  const components = context.archetypeComponents ?? [];
  const mechanisms = new Set([...(archetype && archetype !== "hybrid" ? [archetype] : []), ...components.filter((component) => component !== "hybrid")]);

  if (dimension === "discovery") {
    const demandArchetype = [...mechanisms].some((value) => DISCOVERY_ARCHETYPES.has(value));
    const audienceModel = model === "creator_audience" || model === "membership" || model === "nonprofit";
    if (activity === "active" || demandArchetype || audienceModel || resolved(context.customerModel?.buyer)) {
      return decision("applicable", "audience_or_demand_context", facts);
    }
    return decision("insufficient_context", "context_unresolved", facts);
  }

  if (dimension === "conversion_access") {
    const concreteAction = [...mechanisms].some((value) => ACTION_ARCHETYPES.has(value))
      || model === "services" || model === "products" || model === "professional_services"
      || model === "creator_audience" || model === "membership" || model === "nonprofit";
    if (concreteAction) return decision("applicable", "concrete_action_context", facts);
    return decision("insufficient_context", "context_unresolved", facts);
  }

  if (dimension === "relationship_recurrence") {
    const buyer = resolved(context.customerModel?.buyer);
    const ongoingModel = model === "membership" || model === "creator_audience" || model === "nonprofit";
    if (activity === "prelaunch" || (activity === undefined && stage === "idea")) return decision("not_applicable", "prelaunch_no_operation", facts);
    if ([...mechanisms].some((value) => RELATIONSHIP_ARCHETYPES.has(value)) || ongoingModel || buyer === "b2b" || buyer === "mixed") {
      return decision("applicable", "ongoing_interaction_context", facts);
    }
    return decision("insufficient_context", "context_unresolved", facts);
  }

  return decision("insufficient_context", "context_unresolved", facts);
}
