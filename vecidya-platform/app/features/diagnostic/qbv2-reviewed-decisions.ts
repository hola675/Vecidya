/** R2 review metadata only. Explicit decisions, never imported by the productive runtime. */
export const REVIEWED_LEGACY_DECISIONS = {
  KEEP: [
    "q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers",
    "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_appointments_noshow",
    "q2_ecommerce_traffic_sources", "q2_b2b_pipeline", "q2_sector", "q2_customer_reach",
    "q2_customer_buyer", "q2_process_systemization", "q2_capacity_signal",
    "q2_local_presence_consistency", "q2_reputation_flow", "q2_service_response_speed",
    "q2_service_quote_followup", "q2_appointments_booking_friction",
    "q2_appointments_confirmation_reminders", "q2_appointments_lead_to_booking",
    "q2_appointments_rebooking", "q2_professional_authority_signals", "q2_professional_intake_flow",
    "q2_retail_product_visibility", "q2_retail_customer_capture", "q2_ecommerce_product_discovery",
    "q2_b2b_status_visibility", "q2_creator_audience_ownership", "q2_operations_handoffs",
    "q2_operations_information_base", "q2_presence_offer_clarity", "q2_presence_digital_base", "q2_followup_general_process",
  ],
  REMOVE: [
    "q2_local_foot_traffic", "q2_local_discovery", "q2_service_area_clarity",
    "q2_service_quote_practice", "q2_service_repeat_referral", "q2_appointments_booking_method",
    "q2_professional_referral_dependency", "q2_professional_followup_after_consult",
    "q2_retail_promotions", "q2_ecommerce_cart_visibility", "q2_ecommerce_cart_followup",
    "q2_ecommerce_acquisition_dependency", "q2_hospitality_flow_type",
    "q2_hospitality_reservation_noshow", "q2_hospitality_peak_capacity",
    "q2_hospitality_delivery_takeaway", "q2_b2b_lead_source", "q2_b2b_sales_cycle",
    "q2_b2b_decision_makers", "q2_creator_channel_concentration", "q2_creator_content_consistency",
    "q2_creator_monetization_model", "q2_creator_conversion", "q2_nonprofit_participation",
    "q2_operations_process_ownership", "q2_operations_bottleneck", "q2_operations_manual_impact",
    "q2_operations_dependency", "q2_followup_ownership", "q2_followup_status_visibility",
    "q2_startup_problem_clarity", "q2_startup_validation_evidence", "q2_startup_offer_readiness",
    "q2_startup_demand_signal", "q2_startup_first_channel", "q2_startup_next_milestone",
    "q2_operations_automation_adoption",
  ],
  DEFER: [
    "q2_local_repeat_customers", "q2_ecommerce_checkout_friction", "q2_ecommerce_repeat_purchase",
    "q2_b2b_qualification", "q2_nonprofit_support_type", "q2_nonprofit_donation_clarity",
    "q2_nonprofit_membership_lifecycle",
    "q2_measurement_source_confidence", "q2_measurement_outcome_tracking",
    "q2_measurement_decision_review", "q2_conversion_interest_to_action",
  ],
} as const;

/** New transversal replacement, not a legacy KEEP and not part of the legacy total of 85. */
export const REVIEWED_NEW_QUESTION_IDS = ["q2_discovery_reliable_reach"] as const;
