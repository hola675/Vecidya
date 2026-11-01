import {
  V9_DIGITAL_DIMENSIONS,
  type V9Calibration,
  type V9CapabilityState,
  type V9ContextualDimensionResult,
  type V9ContextualEvidence,
  type V9DigitalDimensionId,
  type V9DimensionApplicability,
  type V9DimensionApplicabilityReason,
  type V9DimensionConfidence,
  type V9ScoringContext,
} from "./scoring-contract";
import { deriveV9ScoringEvidence } from "./scoring-evidence-registry";
import {
  applyV9ObservationCorrelationPolicy,
  type V9CorrelationPolicyResult,
} from "./evidence-correlation-registry";
import type { V9ConfirmedObservationCorrelation } from "./observation-correlation";

export const V9_SCORING_ENGINE_ID = "diag-v9-autonomous-scoring-engine-v1" as const;

const POSITIVE = new Set<V9CapabilityState>(["strong", "established"]);
const NEGATIVE = new Set<V9CapabilityState>(["weak", "dependency", "missing"]);
const LEVELS = ["low", "medium", "high"] as const;

type ApplicabilityDecision = {
  readonly applicability: V9DimensionApplicability;
  readonly reason: V9DimensionApplicabilityReason;
  readonly supportingContext: readonly string[];
};

function resolved(context: V9ScoringContext, field: "operationalStatus" | "businessModel"): string | undefined {
  const value = context[field];
  return value.status === "resolved" ? value.value : undefined;
}

function evaluateApplicability(
  dimension: V9DigitalDimensionId,
  context: V9ScoringContext,
  evidence: readonly V9ContextualEvidence[],
): ApplicabilityDecision {
  const status = resolved(context, "operationalStatus");
  const model = resolved(context, "businessModel");
  const buyer = context.customerModel.buyer.status === "resolved" ? context.customerModel.buyer.value : undefined;
  const reach = context.customerModel.reach.status === "resolved" ? context.customerModel.reach.value : undefined;
  const actual = evidence.filter((item) =>
    item.dimension === dimension &&
    !["not_applicable", "uncertainty", "constraint"].includes(item.state));
  const facts = [
    `contextContract=${context.contractIdentity}`,
    `operationalStatus=${status ?? "unresolved"}`,
    `hasEverHadRealPeople=${String(context.hasEverHadRealPeople)}`,
    `businessModel=${model ?? "unresolved"}`,
    `buyerDisposition=${context.buyerDisposition ?? "unresolved"}`,
    ...actual.map((item) => `evidence=${item.migrationIdentity}`),
  ].sort();
  const decision = (
    applicability: V9DimensionApplicability,
    reason: V9DimensionApplicabilityReason,
  ): ApplicabilityDecision => ({ applicability, reason, supportingContext: facts });

  if (actual.length) return decision("applicable", "observed_dimension_evidence");

  const defined = model !== undefined || context.nicheGroup.status === "resolved";
  const deliveryKnown =
    context.delivery.serviceSetting.length > 0 ||
    !!context.delivery.appointmentMode ||
    context.delivery.purchaseChannel.length > 0 ||
    !!context.delivery.onsiteConsumption;
  const explicitPublicCapability = deliveryKnown || buyer !== undefined || reach !== undefined;

  if (status === "paused" && dimension === "conversion_access") {
    return decision("not_applicable", "paused_offer_suspended");
  }
  if (
    status === "paused" &&
    !["clarity_positioning", "digital_readiness", "relationship_recurrence"].includes(dimension)
  ) {
    return decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "clarity_positioning" || dimension === "digital_readiness") {
    return defined
      ? decision("applicable", "defined_activity")
      : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "conversion_access") {
    if (status === undefined) return decision("insufficient_context", "context_unresolved");
    return defined && explicitPublicCapability
      ? decision("applicable", "action_context")
      : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "relationship_recurrence") {
    if (status === "preparing" && context.hasEverHadRealPeople === false) {
      return decision("not_applicable", "preparing_no_interaction");
    }
    if (
      (status === "operating" || status === "paused") &&
      context.hasEverHadRealPeople === false
    ) {
      return decision("not_applicable", "no_historical_recurrence");
    }
    if (status !== "operating" || context.hasEverHadRealPeople !== true) {
      return decision("insufficient_context", "context_unresolved");
    }
    return defined && (deliveryKnown || buyer !== undefined)
      ? decision("applicable", "current_interaction_context")
      : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "discovery") {
    if (
      context.discoveryReachReliability.status === "resolved" &&
      context.discoveryReachReliability.value === "not_seeking"
    ) {
      return decision("not_applicable", "declared_no_digital_demand");
    }
    return defined && (buyer !== undefined || reach !== undefined || deliveryKnown)
      ? decision("applicable", "audience_context")
      : decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "trust_reputation") {
    return decision("insufficient_context", "context_unresolved");
  }
  if (dimension === "digital_foundation") {
    return defined && explicitPublicCapability
      ? decision("applicable", "public_capability_context")
      : decision("insufficient_context", "context_unresolved");
  }
  return decision("insufficient_context", "context_unresolved");
}

function observationsFor(
  dimension: V9DigitalDimensionId,
  evidence: readonly V9ContextualEvidence[],
): readonly V9ContextualEvidence[] {
  const unique = new Map<string, V9ContextualEvidence>();
  for (const item of evidence) {
    if (item.dimension === dimension && !unique.has(item.observationId)) {
      unique.set(item.observationId, item);
    }
  }
  return [...unique.values()];
}

function contradictionsFor(direct: readonly V9ContextualEvidence[]) {
  const positives = direct.filter((item) => POSITIVE.has(item.state));
  const negatives = direct.filter((item) => NEGATIVE.has(item.state));
  return positives.flatMap((positive) =>
    negatives.map((negative) => ({
      positive: positive.questionId,
      negative: negative.questionId,
    })));
}

function weightedScore(
  direct: readonly V9ContextualEvidence[],
  supporting: readonly V9ContextualEvidence[],
  calibration: V9Calibration,
): number | null {
  if (!direct.length) return null;
  const model = calibration.scoring;
  const directWeight = direct.length * model.directWeight;
  const supportingWeight = Math.min(
    supporting.length * model.supportingWeight,
    directWeight * model.supportingCapRatio,
  );
  const perSupporting = supporting.length ? supportingWeight / supporting.length : 0;
  const numerator =
    direct.reduce((sum, item) => sum + item.contribution! * model.directWeight, 0) +
    supporting.reduce((sum, item) => sum + item.contribution! * perSupporting, 0);
  return Math.round((100 * numerator) / (directWeight + supportingWeight));
}

function confidenceFor(
  direct: readonly V9ContextualEvidence[],
  supporting: readonly V9ContextualEvidence[],
  observations: readonly V9ContextualEvidence[],
  contradictions: readonly { readonly positive: string; readonly negative: string }[],
  calibration: V9Calibration,
): V9DimensionConfidence {
  const uncertain = observations.filter((item) =>
    item.state === "uncertainty" && item.directness !== "contextual").length;
  const model = calibration.dimensionConfidence;
  const strength = direct.length + model.supportingWeight * Math.min(supporting.length, direct.length);
  const penalties: ("direct_contradiction" | "uncertain_answers")[] = [];
  if (contradictions.length) penalties.push("direct_contradiction");
  if (uncertain) penalties.push("uncertain_answers");
  const base = direct.length === 0 ? 0 : strength >= model.highAt ? 2 : strength >= model.mediumAt ? 1 : 0;
  return {
    level: LEVELS[Math.max(0, base - penalties.length)]!,
    direct: direct.length,
    supporting: supporting.length,
    contextual: observations.filter((item) => item.directness === "contextual").length,
    uncertain,
    independent: new Set(observations.map((item) => item.observationId)).size,
    strength,
    contradictory: contradictions.length > 0,
    penalties,
  };
}

function scoreDimension(
  dimension: V9DigitalDimensionId,
  label: string,
  evidence: readonly V9ContextualEvidence[],
  applicability: ApplicabilityDecision,
  calibration: V9Calibration,
): V9ContextualDimensionResult {
  const observations = observationsFor(dimension, evidence);
  const capability = observations.filter((item) =>
    item.directness !== "contextual" && item.contribution !== null);
  const direct = capability.filter((item) => item.directness === "direct");
  const supporting = capability.filter((item) => item.directness === "supporting");
  const contradictions = contradictionsFor(direct);
  const ids = (states: readonly V9CapabilityState[]) =>
    observations.filter((item) => states.includes(item.state)).map((item) => item.questionId);
  const basis =
    direct.length > 0
      ? supporting.length > 0 ? "direct_and_supporting" as const : "direct" as const
      : supporting.length > 0 ? "supporting_only" as const : "none" as const;
  const gaps =
    capability.length === 0
      ? ["no_evidence" as const]
      : direct.length === 0
        ? ["no_direct_evidence" as const]
        : direct.length === 1
          ? ["single_direct_observation" as const]
          : [];

  return {
    id: dimension,
    label,
    applicability: applicability.applicability,
    score: applicability.applicability === "applicable"
      ? weightedScore(direct, supporting, calibration)
      : null,
    confidence: confidenceFor(direct, supporting, observations, contradictions, calibration),
    evidence: observations,
    explainability: {
      basis,
      direct: direct.map((item) => item.questionId),
      supporting: supporting.map((item) => item.questionId),
      strengths: ids(["strong", "established"]),
      weaknesses: ids(["partial", "weak"]),
      missing: ids(["missing"]),
      dependencies: ids(["dependency"]),
      constraints: ids(["constraint"]),
      uncertainty: ids(["uncertainty"]),
      contradictions,
      gaps,
    },
    applicabilityReason: applicability.reason,
    applicabilityContext: applicability.supportingContext,
  };
}

export type V9AutonomousScoringResult = {
  readonly engineIdentity: typeof V9_SCORING_ENGINE_ID;
  readonly dimensions: readonly V9ContextualDimensionResult[];
  readonly evidence: readonly V9ContextualEvidence[];
  readonly correlation: V9CorrelationPolicyResult;
};

export function scoreV9Dimensions(input: {
  readonly answers: Readonly<Record<string, string | readonly string[] | undefined>>;
  readonly context: V9ScoringContext;
  readonly calibration: V9Calibration;
  readonly correlations?: readonly V9ConfirmedObservationCorrelation[];
}): V9AutonomousScoringResult {
  const derived = deriveV9ScoringEvidence(
    input.answers,
    input.calibration.capabilityContribution,
  );
  const correlation = applyV9ObservationCorrelationPolicy(
    derived,
    input.correlations ?? [],
  );
  if (!correlation.scoreSafe) throw new Error("v9_correlation_not_score_safe");
  const accepted = correlation.accepted;
  const dimensions = V9_DIGITAL_DIMENSIONS.map((definition) => {
    const dimensionEvidence = accepted.filter((item) => item.dimension === definition.id);
    const applicability = evaluateApplicability(
      definition.id,
      input.context,
      dimensionEvidence,
    );
    return scoreDimension(
      definition.id,
      definition.label,
      accepted,
      applicability,
      input.calibration,
    );
  });
  return {
    engineIdentity: V9_SCORING_ENGINE_ID,
    dimensions,
    evidence: accepted,
    correlation,
  };
}
