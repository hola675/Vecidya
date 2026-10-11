import type { AnswersV2 } from "../qbv2-rules";
import { runCandidateDiagnosticPipelineV3, type CandidatePipelineResultV3 } from "./qbv2-candidate-pipeline";

/** Fixtures de QA sintéticos; no identifican negocios ni personas reales. */
const UNKNOWN_CAPABILITIES: AnswersV2 = {
  q2_entity: "business", q2_other_staff: "no", q2_monetization: "services",
  q2_delivery: ["remote_service"], q2_has_customers: "no", q2_operational_status: "operating",
  q2_regularity: "unknown", q2_demand_trend: "unknown", q2_goal: "explain", q2_friction: "unsure",
  q2_sector: "professional_services", q2_customer_reach: "unknown", q2_customer_buyer: "unknown",
  q2_buyer_recipient_relation: "unknown", q2_capacity_signal: ["unknown"],
  q2_appointments_noshow: "unknown", q2_ecommerce_traffic_sources: ["unknown"],
  q2_b2b_pipeline: "unknown", q2_process_systemization: "unknown", q2_discovery_reliable_reach: "unknown",
  q2_local_presence_consistency: "unknown", q2_reputation_flow: "unknown",
  q2_service_response_speed: "unknown", q2_service_quote_followup: "unknown",
  q2_appointments_booking_friction: "unknown", q2_appointments_confirmation_reminders: "unknown",
  q2_appointments_lead_to_booking: "unknown", q2_appointments_rebooking: "unknown",
  q2_professional_authority_signals: "unknown", q2_professional_intake_flow: "unknown",
  q2_retail_product_visibility: "unknown", q2_retail_customer_capture: "unknown",
  q2_ecommerce_product_discovery: "unknown", q2_b2b_status_visibility: "unknown",
  q2_creator_audience_ownership: "unknown", q2_operations_handoffs: "unknown",
  q2_followup_general_process: "unknown", q2_operations_information_base: "unknown",
  q2_presence_digital_base: "unknown", q2_presence_offer_clarity: "unknown",
};

export type CandidateFunnelPreviewCaseV1 = "insufficient-evidence" | "contextual-focus";

export function buildCandidateFunnelPreviewV1(
  sample: CandidateFunnelPreviewCaseV1,
): CandidatePipelineResultV3 {
  const answers: AnswersV2 = sample === "insufficient-evidence"
    ? UNKNOWN_CAPABILITIES
    : {
        ...UNKNOWN_CAPABILITIES,
        q2_delivery: ["retail", "online_checkout"],
        q2_monetization: "goods",
        q2_has_customers: "yes",
        q2_customer_buyer: "b2c",
        q2_sector: "retail",
        q2_regularity: "regular",
        q2_demand_trend: "flat",
        q2_capacity_signal: ["stable"],
        q2_presence_digital_base: "reliable_presence",
        q2_presence_offer_clarity: "clear",
        q2_ecommerce_product_discovery: "easy",
        q2_discovery_reliable_reach: "reliable",
      };
  return runCandidateDiagnosticPipelineV3(answers);
}
