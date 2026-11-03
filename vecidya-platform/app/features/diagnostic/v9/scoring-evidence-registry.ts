import { V9_CANONICAL_QUESTION_MANIFEST_V1 } from "./canonical-bank-manifest";
import type {
  V9CapabilityState,
  V9ContextualEvidence,
  V9DigitalDimensionId,
  V9EvidenceDirectness,
  V9EvidenceKind,
  V9MigratedAnswerState,
} from "./scoring-contract";

export const V9_SCORING_EVIDENCE_REGISTRY_ID = "diag-v9-scoring-evidence-registry-v1" as const;

export type V9ScoringEvidenceMapping = {
  readonly questionId: string;
  readonly questionVersion: number;
  readonly dimension: V9DigitalDimensionId;
  readonly directness: V9EvidenceDirectness;
  readonly answers: Readonly<Record<string, V9MigratedAnswerState>>;
};

const mappings: readonly V9ScoringEvidenceMapping[] = [
  { questionId: "q2_discovery_reliable_reach", questionVersion: 1, dimension: "discovery", directness: "direct", answers: { reliable: "established", irregular: "partial", weak: "weak", not_seeking: "context_only", unknown: "uncertainty" } },
  { questionId: "q2_local_presence_consistency", questionVersion: 2, dimension: "digital_foundation", directness: "direct", answers: { consistent: "established", partial: "partial", no: "weak", unknown: "uncertainty" } },
  { questionId: "q2_reputation_flow", questionVersion: 3, dimension: "trust_reputation", directness: "direct", answers: { strong: "established", partial: "partial", weak: "weak", unknown: "uncertainty" } },
  { questionId: "q2_operations_handoffs", questionVersion: 2, dimension: "digital_readiness", directness: "supporting", answers: { complete: "established", partial: "partial", incomplete: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_presence_digital_base", questionVersion: 2, dimension: "digital_foundation", directness: "direct", answers: { reliable_presence: "established", partial_presence: "partial", no_reliable_presence: "missing", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_ecommerce_product_discovery", questionVersion: 2, dimension: "digital_foundation", directness: "direct", answers: { easy: "established", confusing: "partial", difficult: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_presence_offer_clarity", questionVersion: 2, dimension: "clarity_positioning", directness: "direct", answers: { clear: "established", partial: "partial", unclear: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_retail_product_visibility", questionVersion: 2, dimension: "clarity_positioning", directness: "direct", answers: { clear: "established", partial: "partial", unclear: "weak", unknown: "uncertainty" } },
  { questionId: "q2_service_response_speed", questionVersion: 2, dimension: "conversion_access", directness: "direct", answers: { strong: "established", partial: "partial", weak: "weak", unknown: "uncertainty" } },
  { questionId: "q2_appointments_booking_friction", questionVersion: 2, dimension: "conversion_access", directness: "direct", answers: { rarely: "established", sometimes: "partial", often: "weak", unknown: "uncertainty" } },
  { questionId: "q2_service_quote_followup", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { consistent: "established", sometimes: "partial", rarely: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_followup_general_process", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { consistent: "established", partial: "partial", sometimes_lost: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_operations_information_base", questionVersion: 2, dimension: "digital_readiness", directness: "direct", answers: { easy_reliable: "established", somewhat_scattered: "partial", difficult_unreliable: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_b2b_status_visibility", questionVersion: 2, dimension: "digital_readiness", directness: "supporting", answers: { clear: "established", partial: "partial", lose_track: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_professional_authority_signals", questionVersion: 2, dimension: "trust_reputation", directness: "direct", answers: { clearly_visible: "established", partial: "partial", not_really: "weak", unknown: "uncertainty" } },
  { questionId: "q2_professional_intake_flow", questionVersion: 2, dimension: "clarity_positioning", directness: "direct", answers: { clear: "established", partial: "partial", unclear: "weak", unknown: "uncertainty" } },
  { questionId: "q2_process_systemization", questionVersion: 2, dimension: "digital_readiness", directness: "direct", answers: { defined: "established", partial: "partial", informal: "weak", unknown: "uncertainty" } },
  { questionId: "q2_retail_customer_capture", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { consistent: "established", partial: "partial", no: "missing", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_appointments_confirmation_reminders", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { consistent: "established", sometimes: "partial", rarely: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_b2b_pipeline", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { defined: "established", partial: "partial", informal: "weak", unknown: "uncertainty" } },
  { questionId: "q2_appointments_rebooking", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { proactive: "established", partial: "partial", reactive: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_measurement_rate_estimate", questionVersion: 1, dimension: "measurement_optimization", directness: "direct", answers: { can_estimate: "established", rough_estimate: "partial", no_method: "missing", unknown: "uncertainty", no_opportunities: "not_applicable" } },
  { questionId: "q2_measurement_result_recording", questionVersion: 1, dimension: "measurement_optimization", directness: "direct", answers: { consistent: "established", sometimes: "partial", not_tracked: "missing", unknown: "uncertainty" } },
  { questionId: "q2_measurement_review_cycle", questionVersion: 1, dimension: "measurement_optimization", directness: "direct", answers: { regular_decisions: "established", occasional_review: "partial", no_review: "missing", unknown: "uncertainty" } },
  { questionId: "q2_measurement_practice", questionVersion: 1, dimension: "measurement_optimization", directness: "direct", answers: { consistent: "established", partial: "partial", none: "weak", not_enough_activity: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_dental_care_continuation", questionVersion: 1, dimension: "relationship_recurrence", directness: "direct", answers: { proactive: "established", partial: "partial", reactive: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_food_menu_visibility", questionVersion: 1, dimension: "clarity_positioning", directness: "direct", answers: { clear: "established", partial: "partial", unclear: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_marketing_agency_scope_clarity", questionVersion: 1, dimension: "clarity_positioning", directness: "direct", answers: { clear: "established", partial: "partial", unclear: "weak", not_applicable: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_startup_problem_clarity", questionVersion: 1, dimension: "clarity_positioning", directness: "direct", answers: { clear_audience_problem: "established", problem_clear_audience_unclear: "partial", audience_clear_problem_unclear: "partial", both_unclear: "weak", unknown: "uncertainty" } },
  { questionId: "q2_startup_validation_evidence", questionVersion: 1, dimension: "clarity_positioning", directness: "supporting", answers: { none: "weak", conversations: "partial", problem_test: "partial", repeated_problem: "established", unknown: "uncertainty" } },
  { questionId: "q2_startup_offer_readiness", questionVersion: 1, dimension: "clarity_positioning", directness: "direct", answers: { ready_to_test: "established", mostly_ready: "partial", shaping: "weak", not_defined: "weak", unknown: "uncertainty" } },
  { questionId: "q2_ecommerce_checkout_friction", questionVersion: 1, dimension: "conversion_access", directness: "direct", answers: { rarely: "established", sometimes: "partial", often: "weak", unknown: "uncertainty" } },
  { questionId: "q2_nonprofit_donation_clarity", questionVersion: 1, dimension: "conversion_access", directness: "direct", answers: { yes_easy: "established", somewhat_confusing: "partial", no: "weak", unknown: "uncertainty" } },
  { questionId: "q2_ecommerce_cart_visibility", questionVersion: 1, dimension: "measurement_optimization", directness: "supporting", answers: { yes: "established", no: "missing", unknown: "uncertainty" } },
  { questionId: "q2_ecommerce_cart_followup", questionVersion: 2, dimension: "relationship_recurrence", directness: "direct", answers: { always: "established", sometimes: "partial", rarely: "weak", no_authorized_contact: "not_applicable", unknown: "uncertainty" } },
  { questionId: "q2_b2b_qualification", questionVersion: 1, dimension: "digital_readiness", directness: "direct", answers: { yes_clear: "established", somewhat: "partial", no: "weak", unknown: "uncertainty" } },
  { questionId: "q2_nonprofit_membership_lifecycle", questionVersion: 1, dimension: "conversion_access", directness: "direct", answers: { yes_clear: "established", somewhat: "partial", no: "weak", unknown: "uncertainty" } },
  { questionId: "q2_operations_process_ownership", questionVersion: 1, dimension: "digital_readiness", directness: "direct", answers: { yes_clear: "established", somewhat: "partial", improvised: "weak", unknown: "uncertainty" } },
  { questionId: "q2_followup_status_visibility", questionVersion: 1, dimension: "relationship_recurrence", directness: "direct", answers: { regularly: "established", only_when_remember: "partial", rarely: "weak", unknown: "uncertainty" } },
  { questionId: "q2_measurement_source_confidence", questionVersion: 1, dimension: "measurement_optimization", directness: "direct", answers: { yes_confident: "established", sometimes: "partial", rarely_no_idea: "weak", unknown: "uncertainty" } },
] as const;

const contributionRank: Readonly<Record<V9CapabilityState, number | null>> = {
  strong: 1,
  established: 0.75,
  partial: 0.5,
  weak: 0.25,
  dependency: 0.25,
  missing: 0,
  constraint: null,
  uncertainty: null,
  not_applicable: null,
};

const kindFor = (state: V9CapabilityState): V9EvidenceKind => {
  if (state === "strong" || state === "established") return "established";
  if (state === "partial" || state === "weak") return "partial";
  return state;
};

const selectedValues = (answer: string | readonly string[] | undefined): readonly string[] =>
  answer === undefined ? [] : Array.isArray(answer) ? [...new Set(answer)] : [answer];

function resolveState(
  mapping: V9ScoringEvidenceMapping,
  values: readonly string[],
): V9CapabilityState | null {
  if (values.length === 0) return null;
  const states = values.map((value) => {
    const state = mapping.answers[value];
    if (state === undefined) throw new Error(`v9_scoring_answer_unmapped:${mapping.questionId}:${value}`);
    return state;
  });
  const capability = states.filter((state): state is V9CapabilityState =>
    state !== "context_only" && contributionRank[state] !== null);
  if (capability.length > 0) {
    return capability.reduce((weakest, next) =>
      contributionRank[next]! < contributionRank[weakest]! ? next : weakest);
  }
  if (states.includes("uncertainty")) return "uncertainty";
  if (states.includes("not_applicable")) return "not_applicable";
  if (states.includes("constraint")) return "constraint";
  return null;
}

export function listV9ScoringEvidenceMappings(): readonly V9ScoringEvidenceMapping[] {
  return mappings;
}

export function validateV9ScoringEvidenceRegistry(): readonly string[] {
  const issues: string[] = [];
  const manifest = new Map(V9_CANONICAL_QUESTION_MANIFEST_V1.map((item) => [item.id, item] as const));
  const seen = new Set<string>();
  for (const mapping of mappings) {
    const key = JSON.stringify([mapping.questionId, mapping.dimension]);
    if (seen.has(key)) issues.push(`duplicate scoring mapping: ${mapping.questionId}/${mapping.dimension}`);
    seen.add(key);
    const canonical = manifest.get(mapping.questionId);
    if (!canonical) issues.push(`scoring mapping outside canonical bank: ${mapping.questionId}`);
    else if (canonical.sourceVersion !== mapping.questionVersion) {
      issues.push(`scoring version mismatch: ${mapping.questionId}@v${mapping.questionVersion}`);
    }
    if (!Object.keys(mapping.answers).length) issues.push(`empty scoring mapping: ${mapping.questionId}`);
  }
  return issues;
}

export function deriveV9ScoringEvidence(
  answers: Readonly<Record<string, string | readonly string[] | undefined>>,
  contribution: Readonly<Record<V9CapabilityState, number | null>>,
): readonly V9ContextualEvidence[] {
  const evidence: V9ContextualEvidence[] = [];
  for (const mapping of mappings) {
    const values = selectedValues(answers[mapping.questionId]);
    if (!values.length) continue;
    const state = resolveState(mapping, values);
    if (state === null) continue;
    const migrationIdentity = `${mapping.questionId}@v${mapping.questionVersion}`;
    evidence.push({
      questionId: mapping.questionId,
      questionVersion: mapping.questionVersion,
      migrationIdentity,
      dimension: mapping.dimension,
      observationId: migrationIdentity,
      directness: mapping.directness,
      state,
      kind: kindFor(state),
      contribution: contribution[state],
      answer: values,
    });
  }
  return evidence;
}
