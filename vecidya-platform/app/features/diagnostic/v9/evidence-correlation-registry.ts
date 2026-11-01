import type { DigitalDimensionId } from "../qbv2-dimensions";
import type { EvidenceDirectness } from "../qbv2-coverage";
import type { ContextualEvidence } from "../qbv2-contextual-scoring";
import type { QuestionDefinitionV2 } from "../qbv2-contract";
import {
  correlateCandidateObservationsV1,
  type ConfirmedObservationCorrelationV1,
  type CorrelatedObservationConflictV1,
} from "../qa03b/v9-observation-correlation";

export const V9_EVIDENCE_CORRELATION_REGISTRY_ID =
  "diag-v9-evidence-correlation-registry-v1" as const;

export type V9EvidenceCorrelationMetadata = {
  readonly questionId: string;
  readonly dimension: DigitalDimensionId;
  readonly directness: EvidenceDirectness;
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
] as const;

const keyOf = (questionId: string, dimension: DigitalDimensionId) =>
  JSON.stringify([questionId, dimension]);

const byKey = new Map(entries.map((entry) => [keyOf(entry.questionId, entry.dimension), entry] as const));

export function v9EvidenceCorrelationMetadata(
  questionId: string,
  dimension: DigitalDimensionId,
): V9EvidenceCorrelationMetadata | undefined {
  return byKey.get(keyOf(questionId, dimension));
}

export function validateV9EvidenceCorrelationRegistry(
  bank: readonly QuestionDefinitionV2[],
): readonly string[] {
  const issues: string[] = [];
  const expected = new Set<string>();
  for (const question of bank) {
    if (question.evidenceMigration !== "migrated" || !question.evidenceV3) continue;
    for (const reading of question.evidenceV3.dimensions) {
      const key = keyOf(question.id, reading.dimension);
      expected.add(key);
      const metadata = byKey.get(key);
      if (!metadata) {
        issues.push(`missing correlation metadata: ${question.id}/${reading.dimension}`);
        continue;
      }
      if (metadata.directness !== reading.directness) {
        issues.push(`directness mismatch: ${question.id}/${reading.dimension}`);
      }
      if (!metadata.constructKey.trim()) {
        issues.push(`empty constructKey: ${question.id}/${reading.dimension}`);
      }
    }
  }
  for (const entry of entries) {
    if (!expected.has(keyOf(entry.questionId, entry.dimension))) {
      issues.push(`orphan correlation metadata: ${entry.questionId}/${entry.dimension}`);
    }
  }
  return issues;
}

export type V9CorrelationPolicyResult = {
  readonly registryIdentity: typeof V9_EVIDENCE_CORRELATION_REGISTRY_ID;
  readonly accepted: readonly ContextualEvidence[];
  readonly deduplicated: readonly ContextualEvidence[];
  readonly unmapped: readonly ContextualEvidence[];
  readonly conflicts: readonly CorrelatedObservationConflictV1[];
  readonly scoreSafe: boolean;
};

export function applyV9ObservationCorrelationPolicy(
  evidence: readonly ContextualEvidence[],
  correlations: readonly ConfirmedObservationCorrelationV1[] = [],
): V9CorrelationPolicyResult {
  const accepted: ContextualEvidence[] = [];
  const deduplicated: ContextualEvidence[] = [];
  const unmapped: ContextualEvidence[] = [];
  const conflicts: CorrelatedObservationConflictV1[] = [];
  const overlap = new Map<string, ContextualEvidence[]>();

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
    const correlated = correlateCandidateObservationsV1(matches, relevant);
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
