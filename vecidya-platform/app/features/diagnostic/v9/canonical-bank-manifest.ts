export const V9_CANONICAL_BANK_ID = "diagnostic-v9-canonical-77-baseline-v1" as const;
export const V9_CANONICAL_BANK_VERSION = 1 as const;
export const V9_CANONICAL_BANK_SOURCE = "QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2" as const;

export type V9CanonicalEditorialDecision = "keep" | "rewrite_pending";

export type V9CanonicalQuestionIdentity = {
  readonly id: string;
  readonly sourceVersion: number;
  readonly editorialDecision: V9CanonicalEditorialDecision;
};

/**
 * F02 canonical editorial identity.
 *
 * This manifest intentionally does not import QA03B/QBV2. It freezes the 77-question
 * baseline approved by DEC-C while keeping 59 rewrites pending until their new copy,
 * option semantics, version and replay contract are individually implemented.
 */
export const V9_CANONICAL_QUESTION_MANIFEST_V1 = Object.freeze([
  { id: "q2_entity", sourceVersion: 3, editorialDecision: "keep" },
  { id: "q2_has_customers", sourceVersion: 3, editorialDecision: "keep" },
  { id: "q2_operational_status", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_customer_buyer", sourceVersion: 3, editorialDecision: "rewrite_pending" },
  { id: "q2_monetization", sourceVersion: 3, editorialDecision: "rewrite_pending" },
  { id: "q2_regularity", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_demand_trend", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_capacity_signal", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_sector", sourceVersion: 4, editorialDecision: "rewrite_pending" },
  { id: "q2_delivery", sourceVersion: 4, editorialDecision: "rewrite_pending" },
  { id: "q2_customer_reach", sourceVersion: 3, editorialDecision: "keep" },
  { id: "q2_buyer_recipient_relation", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_goal", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_friction", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_nonprofit_support_type", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_food_hospitality", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_presence_digital_base", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_presence_offer_clarity", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_local_presence_consistency", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_discovery_reliable_reach", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_reputation_flow", sourceVersion: 3, editorialDecision: "rewrite_pending" },
  { id: "q2_service_response_speed", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_professional_authority_signals", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_food_menu_visibility", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_retail_customer_capture", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_creator_audience_ownership", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_followup_general_process", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_service_quote_followup", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_appointments_rebooking", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_b2b_pipeline", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_b2b_status_visibility", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_appointments_confirmation_reminders", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_measurement_rate_estimate", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_measurement_result_recording", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_measurement_review_cycle", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_measurement_practice", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_process_systemization", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_operations_information_base", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_operations_handoffs", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_digital_tools_in_use", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_appointments_noshow", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_appointments_lead_to_booking", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_appointments_booking_friction", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_ecommerce_traffic_sources", sourceVersion: 3, editorialDecision: "rewrite_pending" },
  { id: "q2_ecommerce_product_discovery", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_professional_intake_flow", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_dental_care_continuation", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_marketing_agency_scope_clarity", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_other_staff", sourceVersion: 3, editorialDecision: "keep" },
  { id: "q2_retail_product_visibility", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_startup_problem_clarity", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_startup_validation_evidence", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_startup_offer_readiness", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_ecommerce_cart_visibility", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_ecommerce_cart_followup", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_nonprofit_donation_clarity", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_hospitality_flow_type", sourceVersion: 2, editorialDecision: "keep" },
  { id: "q2_hospitality_reservation_noshow", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_hospitality_peak_capacity", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_nonprofit_membership_lifecycle", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_local_repeat_customers", sourceVersion: 2, editorialDecision: "rewrite_pending" },
  { id: "q2_ecommerce_repeat_purchase", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_creator_channel_concentration", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_service_area_clarity", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_startup_demand_signal", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_b2b_qualification", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_operations_process_ownership", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_followup_status_visibility", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_measurement_source_confidence", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_ecommerce_checkout_friction", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_health_wellness", sourceVersion: 1, editorialDecision: "keep" },
  { id: "q2_niche_b2b_services", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_beauty_personal_care", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_financial_tax_insurance", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_home_services", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_automotive", sourceVersion: 1, editorialDecision: "rewrite_pending" },
  { id: "q2_niche_technology_software", sourceVersion: 1, editorialDecision: "rewrite_pending" },
] as const satisfies readonly V9CanonicalQuestionIdentity[]);

export const V9_CANONICAL_KEEP_IDS_V1 = Object.freeze(
  V9_CANONICAL_QUESTION_MANIFEST_V1
    .filter((item) => item.editorialDecision === "keep")
    .map((item) => item.id),
);

export const V9_CANONICAL_REWRITE_PENDING_IDS_V1 = Object.freeze(
  V9_CANONICAL_QUESTION_MANIFEST_V1
    .filter((item) => item.editorialDecision === "rewrite_pending")
    .map((item) => item.id),
);

/** DEC-C: these 13 additions stay outside the canonical 77 baseline and remain pending. */
export const V9_PENDING_EXTENSION_IDS_V1 = Object.freeze([
  "q2_nonprofit_participation_entry",
  "q2_education_enrollment_entry",
  "q2_real_estate_inquiry_entry",
  "q2_creative_brief_intake",
  "q2_retail_purchase_next_step",
  "q2_general_offer_comprehension",
  "q2_general_contact_information_consistency",
  "q2_general_discoverability_path",
  "q2_general_verifiable_trust_signals",
  "q2_general_first_action_path",
  "q2_general_pending_step_continuity",
  "q2_general_outcome_measure_definition",
  "q2_general_digital_execution_reliability",
] as const);
