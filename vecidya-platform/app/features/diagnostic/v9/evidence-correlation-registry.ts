import type {
  V9V9ContextualEvidence,
  V9V9DigitalDimensionId,
  V9V9EvidenceDirectness,
} from "./scoring-contract";
import {
  correlateV9Observations,
  type V9ConfirmedObservationCorrelation,
  type V9CorrelatedObservationConflict,
} from "./observation-correlation";

export const V9_EVIDENCE_CORRELATION_REGISTRY_ID =
  "diag-v9-evidence-correlation-registry-v1" as const;

export type V9EvidenceCorrelationMetadata = {
  readonly questionId: string;
  readonly dimension: V9DigitalDimensionId;
  readonly directness: V9EvidenceDirectness;
  /** Editorial construct identity. Never inferred from questionId at runtime. */
  readonly constructKey: string;
  /** Only families with a real double-observation risk share an overlap group. */
  readonly overlapGroup?: string;
  readonly observationScope: "current_state" | "recent_period" | "historical_pattern";
};

const entries: readonly V9EvidenceCorrelationMetadata[] = [
  { questionId: "q2_discovery_reliable_reach", dimension: "discovery", directness: "direct", constructKey: "reliable_new_customer_reach", observationScope: "recent_period" },
  { questionId: "q2_local_presence_consistency", dimension: "digital_foundation", directness: "direct", constructKey: "local_presence_consistency", observationScope: "current_state" },
  { questionId: "q2_reputation_flow", dimension: "trust_reputation", directness: "direct", constructKey: "reputation_signal_flow", observationScope: "recent_period" },
  { questionId: "q2_operations_handoffs", dimension: "digital_readiness", directness: "supporting", constructKey: "operational_handoffs", observationScope: "recent_period" },
  { questionId: "q2_presence_digital_base", dimension: "digital_foundation", directness: "direct", constructKey: "digital_presence_foundation", observationScope: "current_state" },
  { questionId: "q2_ecommerce_product_discovery", dimension: "digital_foundation", directness: "direct", constructKey: "ecommerce_product_discoverability", observationScope: "current_state" },
  { questionId: "q2_presence_offer_clarity", dimension: "clarity_positioning", directness: "direct", constructKey: "offer_clarity", overlapGroup: "offer_clarity_specialization", observationScope: "current_state" },
  { questionId: "q2_retail_product_visibility", dimension: "clarity_positioning", directness: "direct", constructKey: "retail_product_visibility", observationScope: "current_state" },
  { questionId: "q2_service_response_speed", dimension: "conversion_access", directness: "direct", constructKey: "service_response_access", observationScope: "recent_period" },
  { questionId: "q2_appointments_booking_friction", dimension: "conversion_access", directness: "direct", constructKey: "appointment_booking_access", observationScope: "recent_period" },
  { questionId: "q2_service_quote_followup", dimension: "relationship_recurrence", directness: "direct", constructKey: "quote_followup", observationScope: "recent_period" },
  { questionId: "q2_followup_general_process", dimension: "relationship_recurrence", directness: "direct", constructKey: "followup_process", observationScope: "current_state" },
  { questionId: "q2_operations_information_base", dimension: "digital_readiness", directness: "direct", constructKey: "operational_information_base", observationScope: "current_state" },
  { questionId: "q2_b2b_status_visibility", dimension: "digital_readiness", directness: "supporting", constructKey: "b2b_status_visibility", observationScope: "current_state" },
  { questionId: "q2_professional_authority_signals", dimension: "trust_reputation", directness: "direct", constructKey: "professional_authority_proof", observationScope: "current_state" },
  { questionId: "q2_professional_intake_flow", dimension: "clarity_positioning", directness: "direct", constructKey: "professional_intake_access", observationScope: "current_state" },
  { questionId: "q2_process_systemization", dimension: "digital_readiness", directness: "direct", constructKey: "process_systemization", observationScope: "current_state" },
  { questionId: "q2_retail_customer_capture", dimension: "relationship_recurrence", directness: "direct", constructKey: "retail_customer_capture", observationScope: "recent_period" },
  { questionId: "q2_appointments_confirmation_reminders", dimension: "relationship_recurrence", directness: "direct", constructKey: "appointment_confirmation_continuity", observationScope: "recent_period" },
  { questionId: "q2_b2b_pipeline", dimension: "relationship_recurrence", directness: "direct", constructKey: "b2b_pipeline_continuity", observationScope: "current_state" },
  { questionId: "q2_appointments_rebooking", dimension: "relationship_recurrence", directness: "direct", constructKey: "appointment_rebooking", overlapGroup: "appointment_continuation", observationScope: "recent_period" },
  { questionId: "q2_measurement_rate_estimate", dimension: "measurement_optimization", directness: "direct", constructKey: "outcome_rate_estimation", observationScope: "recent_period" },
  { questionId: "q2_measurement_result_recording", dimension: "measurement_optimization", directness: "direct", constructKey: "outcome_result_recording", observationScope: "recent_period" },
  { questionId: "q2_measurement_review_cycle", dimension: "measurement_optimization", directness: "direct", constructKey: "measurement_review_cadence", observationScope: "recent_period" },
  { questionId: "q2_measurement_practice", dimension: "measurement_optimization", directness: "direct", constructKey: "measurement_review_practice", observationScope: "recent_period" },
  { questionId: "q2_dental_care_continuation", dimension: "relationship_recurrence", directness: "direct", constructKey: "appointment_rebooking", overlapGroup: "appointment_continuation", observationScope: "recent_period" },
  { questionId: "q2_food_menu_visibility", dimension: "clarity_positioning", directness: "direct", constructKey: "offer_clarity", overlapGroup: "offer_clarity_specialization", observationScope: "current_state" },
  { questionId: "q2_marketing_agency_scope_clarity", dimension: "clarity_positioning", directness: "direct", constructKey: "offer_clarity", overlapGroup: "offer_clarity_specialization", observationScope: "current_state" },
  { questionId: "q2_startup_problem_clarity", dimension: "clarity_positioning", directness: "direct", constructKey: "startup_problem_audience_clarity", observationScope: "current_state" },
  { questionId: "q2_startup_validation_evidence", dimension: "clarity_positioning", directness: "supporting", constructKey: "startup_problem_validation", observationScope: "recent_period" },
  { questionId: "q2_startup_offer_readiness", dimension: "clarity_positioning", directness: "direct", constructKey: "startup_offer_readiness", observationScope: "current_state" },
  { questionId: "q2_ecommerce_checkout_friction", dimension: "conversion_access", directness: "direct", constructKey: "ecommerce_checkout_completion_friction", observationScope: "recent_period" },
  { questionId: "q2_nonprofit_donation_clarity", dimension: "conversion_access", directness: "direct", constructKey: "nonprofit_donation_access", observationScope: "current_state" },
  { questionId: "q2_ecommerce_cart_visibility", dimension: "measurement_optimization", directness: "supporting", constructKey: "ecommerce_cart_abandonment_visibility", observationScope: "recent_period" },
  { questionId: "q2_ecommerce_cart_followup", dimension: "relationship_recurrence", directness: "direct", constructKey: "ecommerce_cart_followup", observationScope: "recent_period" },
  { questionId: "q2_b2b_qualification", dimension: "digital_readiness", directness: "direct", constructKey: "b2b_opportunity_qualification", observationScope: "current_state" },
  { questionId: "q2_nonprofit_membership_lifecycle", dimension: "conversion_access", directness: "direct", constructKey: "nonprofit_membership_access", observationScope: "current_state" },
  { questionId: "q2_operations_process_ownership", dimension: "digital_readiness", directness: "direct", constructKey: "operational_process_ownership", observationScope: "current_state" },
  { questionId: "q2_followup_status_visibility", dimension: "relationship_recurrence", directness: "direct", constructKey: "followup_status_review", observationScope: "recent_period" },
  { questionId: "q2_measurement_source_confidence", dimension: "measurement_optimization", directness: "direct", constructKey: "acquisition_source_attribution", observationScope: "recent_period" },
] as const;

const keyOf = (questionId: string, dimension: V9DigitalDimensionId) =>
  JSON.stringify([questionId, dimension]);

const byKey = new Map(entries.map((entry) => [keyOf(entry.questionId, entry.dimension), entry] as const));

export function v9EvidenceCorrelationMetadata(
  questionId: string,
  dimension: V9DigitalDimensionId,
): V9EvidenceCorrelationMetadata | undefined {
  return byKey.get(keyOf(questionId, dimension));
}

export function listV9EvidenceCorrelationMetadata(): readonly V9EvidenceCorrelationMetadata[] {
  return entries;
}

export type V9CorrelationPolicyResult = {
  readonly registryIdentity: typeof V9_EVIDENCE_CORRELATION_REGISTRY_ID;
  readonly accepted: readonly V9ContextualEvidence[];
  readonly deduplicated: readonly V9ContextualEvidence[];
  readonly unmapped: readonly V9ContextualEvidence[];
  readonly conflicts: readonly V9CorrelatedObservationConflict[];
  readonly scoreSafe: boolean;
};

export function applyV9ObservationCorrelationPolicy(
  evidence: readonly V9ContextualEvidence[],
  correlations: readonly V9ConfirmedObservationCorrelation[] = [],
): V9CorrelationPolicyResult {
  const accepted: V9ContextualEvidence[] = [];
  const deduplicated: V9ContextualEvidence[] = [];
  const unmapped: V9ContextualEvidence[] = [];
  const conflicts: V9CorrelatedObservationConflict[] = [];
  const overlap = new Map<string, V9ContextualEvidence[]>();

  for (const reading of evidence) {
    const metadata = byKey.get(keyOf(reading.questionId, reading.dimension));
    if (!metadata || metadata.directness !== reading.directness || !metadata.constructKey.trim()) {
      unmapped.push(reading);
      continue;
    }
    if (!metadata.overlapGroup || reading.contribution === null || reading.directness === "contextual") {
      accepted.push(reading);
      continue;
    }
    const groupKey = JSON.stringify([reading.dimension, metadata.overlapGroup]);
    overlap.set(groupKey, [...(overlap.get(groupKey) ?? []), reading]);
  }

  for (const matches of overlap.values()) {
    if (matches.length === 1) {
      accepted.push(matches[0]!);
      continue;
    }
    const relevantIds = new Set(matches.map((item) => keyOf(item.questionId, item.dimension)));
    const relevant = correlations.filter((row) =>
      relevantIds.has(keyOf(row.questionId, row.dimension)));
    let metadataMismatch = false;
    for (const row of relevant) {
      const metadata = byKey.get(keyOf(row.questionId, row.dimension));
      if (!metadata || row.constructKey !== metadata.constructKey) {
        metadataMismatch = true;
        break;
      }
    }
    if (metadataMismatch) {
      unmapped.push(...matches);
      continue;
    }
    const correlated = correlateV9Observations(matches, relevant);
    accepted.push(...correlated.accepted);
    deduplicated.push(...correlated.deduplicated);
    unmapped.push(...correlated.unmapped);
    conflicts.push(...correlated.conflicts);
  }

  return {
    registryIdentity: V9_EVIDENCE_CORRELATION_REGISTRY_ID,
    accepted,
    deduplicated,
    unmapped,
    conflicts,
    scoreSafe: unmapped.length === 0 && conflicts.length === 0,
  };
}
