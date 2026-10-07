import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-B explicit adversarial candidate-native cases. Authored directly against
 * `REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3` option values — never reused from `personas.ts` /
 * `adversarial-personas.ts` (those only inspired scenarios). Unlike the R7-A canonical cases, these are
 * attempts to falsify certified contracts, so `answers` is an INJECTED answer set: every authored answer must
 * be structurally eligible (the test fails on any authored answer that `activeAnswers` drops), but the
 * certified planner is not required to ask all of them. `pollution` holds raw answers that are deliberately
 * ineligible/stale and must disappear without any downstream trace.
 */
export type AdversarialCaseV3 = {
  readonly id: string;
  readonly purpose: string;
  readonly answers: AnswersV2;
  readonly pollution?: AnswersV2;
};

const ACTIVE: AnswersV2 = { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: ["stable"], q2_customer_reach: "local", q2_customer_buyer: "b2c" };
const ECOMMERCE: AnswersV2 = { ...ACTIVE, q2_entity: "business", q2_monetization: "goods", q2_delivery: ["online_checkout"], q2_sector: "retail" };
const APPOINTMENTS: AnswersV2 = { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services" };

/** Raw operational answers that are structurally inactive for a prelaunch project (A11). */
export const PRELAUNCH_OPERATIONAL_POLLUTION: AnswersV2 = {
  q2_regularity: "regular", q2_demand_trend: "decreasing", q2_capacity_signal: ["capacity_pressure"],
  q2_appointments_noshow: "often", q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "often",
  q2_appointments_confirmation_reminders: "rarely", q2_appointments_rebooking: "reactive",
  q2_followup_general_process: "sometimes_lost", q2_service_quote_followup: "rarely", q2_service_response_speed: "weak",
  q2_b2b_pipeline: "informal", q2_b2b_status_visibility: "lose_track",
  q2_retail_customer_capture: "no", q2_retail_product_visibility: "unclear", q2_local_presence_consistency: "no",
  q2_ecommerce_product_discovery: "difficult", q2_ecommerce_traffic_sources: ["ads", "social"],
  q2_process_systemization: "informal", q2_operations_information_base: "difficult_unreliable", q2_operations_handoffs: "incomplete",
  q2_reputation_flow: "weak", q2_discovery_reliable_reach: "weak", q2_professional_authority_signals: "not_really", q2_professional_intake_flow: "unclear",
};

export const ADVERSARIAL_CASES_V3: readonly AdversarialCaseV3[] = [
  {
    id: "A01", purpose: "Strong public base (Foundation/Trust/Discovery) with a broken direct follow-up process.",
    answers: { ...ECOMMERCE, q2_goal: "other", q2_friction: "follow_up", q2_ecommerce_product_discovery: "easy", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined", q2_followup_general_process: "sometimes_lost" },
  },
  {
    id: "A02", purpose: "Weak public base (no reliable owned presence) with a strong B2B opportunity process.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence", q2_b2b_pipeline: "defined", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A03", purpose: "Strong active appointments operation with exactly one clearly weak direct capability (booking friction).",
    answers: { ...APPOINTMENTS, q2_goal: "opportunities", q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "often", q2_appointments_noshow: "sometimes", q2_appointments_confirmation_reminders: "consistent", q2_reputation_flow: "strong", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" },
  },
  {
    id: "A04", purpose: "Broad weak local-service evidence with one genuine direct strength (reliable discovery).",
    answers: { ...ACTIVE, q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["travels"], q2_sector: "home_services", q2_goal: "opportunities", q2_service_response_speed: "weak", q2_service_quote_followup: "rarely", q2_reputation_flow: "weak", q2_process_systemization: "informal", q2_discovery_reliable_reach: "reliable" },
  },
  {
    id: "A05", purpose: "Mostly unknown/unsure across context and every reachable direct source.",
    answers: { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "unknown", q2_monetization: "unsure", q2_delivery: ["unsure"], q2_sector: "other", q2_goal: "unsure", q2_friction: "unsure", q2_customer_reach: "mixed", q2_customer_buyer: "mixed", q2_process_systemization: "unknown", q2_discovery_reliable_reach: "unknown", q2_reputation_flow: "unknown", q2_b2b_pipeline: "unknown" },
  },
  {
    id: "A06", purpose: "N/A-heavy hybrid appointments + travels: reminders and rebooking legitimately not applicable.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments", "travels"], q2_sector: "health_wellness", q2_goal: "stop_losing", q2_appointments_lead_to_booking: "most", q2_appointments_noshow: "sometimes", q2_appointments_confirmation_reminders: "not_applicable", q2_appointments_rebooking: "not_applicable", q2_service_response_speed: "strong", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A06b", purpose: "N/A-heavy ecommerce: product discovery and the general follow-up process legitimately not applicable.",
    answers: { ...ECOMMERCE, q2_goal: "other", q2_friction: "follow_up", q2_ecommerce_product_discovery: "not_applicable", q2_followup_general_process: "not_applicable", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A07", purpose: "Declared follow-up friction with healthy direct follow-up evidence.",
    answers: { ...ECOMMERCE, q2_goal: "other", q2_friction: "follow_up", q2_followup_general_process: "consistent", q2_ecommerce_product_discovery: "easy", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A07b", purpose: "Declared trust friction with healthy direct authority and reputation evidence (§41 beyond Relationship).",
    answers: { ...ACTIVE, q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "legal", q2_goal: "other", q2_friction: "trust", q2_professional_authority_signals: "clearly_visible", q2_reputation_flow: "strong", q2_professional_intake_flow: "clear", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined" },
  },
  {
    id: "A07c", purpose: "Declared conversion friction with healthy direct booking evidence (§41 beyond Relationship).",
    answers: { ...APPOINTMENTS, q2_goal: "other", q2_friction: "conversion", q2_appointments_lead_to_booking: "mixed", q2_appointments_booking_friction: "rarely", q2_appointments_noshow: "rarely", q2_reputation_flow: "strong", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" },
  },
  {
    id: "A07d", purpose: "Declared operations friction with healthy direct Readiness evidence (§41 beyond Relationship).",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_goal: "other", q2_friction: "operations", q2_process_systemization: "defined", q2_operations_information_base: "easy_reliable", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A07e", purpose: "Declared visibility friction with healthy direct Discovery and owned-base evidence (§41 beyond Relationship).",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_goal: "other", q2_friction: "visibility", q2_discovery_reliable_reach: "reliable", q2_presence_digital_base: "reliable_presence", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A08", purpose: "Goal = automate with an informal (undefined) process and no other process signal.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_goal: "automate", q2_process_systemization: "informal", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A08b", purpose: "Goal = automate with an informal (undefined) process plus an unrelated Clarity strength (clear professional intake).",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services", q2_goal: "automate", q2_process_systemization: "informal", q2_professional_intake_flow: "clear", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A09", purpose: "Weak Discovery, strong everything else observable.",
    answers: { ...ECOMMERCE, q2_goal: "be_found", q2_discovery_reliable_reach: "weak", q2_ecommerce_product_discovery: "easy", q2_reputation_flow: "strong", q2_process_systemization: "defined", q2_ecommerce_traffic_sources: ["search", "social"] },
  },
  {
    id: "A10", purpose: "Measurement goal on an otherwise strong appointments business.",
    answers: { ...APPOINTMENTS, q2_goal: "measure", q2_appointments_lead_to_booking: "most", q2_appointments_noshow: "rarely", q2_reputation_flow: "strong", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" },
  },
  {
    id: "A11", purpose: "Valid prelaunch project polluted with raw operational answers from every specialized branch.",
    answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain", q2_delivery: ["other"], q2_sector: "professional_services", q2_monetization: "services", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_presence_digital_base: "no_reliable_presence" },
    pollution: PRELAUNCH_OPERATIONAL_POLLUTION,
  },
  {
    id: "A12", purpose: "Valid appointments route polluted with stale/ineligible ecommerce and retail answers.",
    answers: { ...APPOINTMENTS, q2_goal: "opportunities", q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "often", q2_appointments_noshow: "sometimes", q2_appointments_confirmation_reminders: "consistent", q2_reputation_flow: "strong", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" },
    pollution: { q2_ecommerce_product_discovery: "difficult", q2_ecommerce_traffic_sources: ["ads"], q2_retail_customer_capture: "no", q2_retail_product_visibility: "unclear", q2_local_presence_consistency: "no" },
  },
  {
    id: "A13", purpose: "Valid ecommerce route polluted with stale/ineligible appointment answers.",
    answers: { ...ECOMMERCE, q2_customer_reach: "national", q2_goal: "opportunities", q2_ecommerce_product_discovery: "confusing", q2_ecommerce_traffic_sources: ["search", "social"], q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
    pollution: { q2_appointments_noshow: "often", q2_appointments_lead_to_booking: "few", q2_appointments_booking_friction: "often", q2_appointments_confirmation_reminders: "rarely", q2_appointments_rebooking: "reactive" },
  },
  {
    id: "A14", purpose: "Hybrid retail + ecommerce with conflicting Foundation sources: retail presence weak, ecommerce discovery strong.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_customer_reach: "national", q2_goal: "explain", q2_local_presence_consistency: "no", q2_ecommerce_product_discovery: "easy", q2_retail_product_visibility: "clear", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A15", purpose: "Hybrid professional + appointments with conflicting strengths: intake weak, booking strong.",
    answers: { ...ACTIVE, q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "legal", q2_goal: "opportunities", q2_professional_intake_flow: "unclear", q2_appointments_lead_to_booking: "mixed", q2_appointments_booking_friction: "rarely", q2_appointments_noshow: "rarely", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A16", purpose: "Direct weak Readiness (informal process) + strong supporting handoffs.",
    answers: { ...ACTIVE, q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_goal: "organize", q2_process_systemization: "informal", q2_operations_handoffs: "complete", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A16b", purpose: "Direct weak Readiness (informal process) + strong supporting B2B status visibility.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_customer_reach: "national", q2_goal: "organize", q2_process_systemization: "informal", q2_b2b_status_visibility: "clear", q2_b2b_pipeline: "defined", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A17", purpose: "Direct unknown Readiness + strong supporting handoffs: supporting alone must not create a percentage.",
    answers: { ...ACTIVE, q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_goal: "organize", q2_process_systemization: "unknown", q2_operations_information_base: "unknown", q2_operations_handoffs: "complete", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A17b", purpose: "Direct unknown Readiness + strong supporting B2B status visibility.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_customer_reach: "national", q2_goal: "organize", q2_process_systemization: "unknown", q2_operations_information_base: "unknown", q2_b2b_status_visibility: "clear", q2_b2b_pipeline: "defined", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A18", purpose: "Organization with a website gap only — Web & Conversión may appear, never Cuadra from the entity label.",
    answers: { ...ACTIVE, q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_sector: "community_social", q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined" },
  },
  {
    id: "A19", purpose: "Work-organization need (informal process) and a recurring follow-up need simultaneously.",
    answers: { ...ECOMMERCE, q2_goal: "other", q2_friction: "follow_up", q2_process_systemization: "informal", q2_followup_general_process: "sometimes_lost", q2_ecommerce_product_discovery: "easy", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
  {
    id: "A20", purpose: "Barrio-capable B2B diagnostic with unresolved single-vs-multiprocess ambiguity.",
    answers: { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_customer_reach: "national", q2_goal: "organize", q2_process_systemization: "defined", q2_b2b_pipeline: "informal", q2_b2b_status_visibility: "lose_track", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" },
  },
];

/**
 * Near-miss pairs (§7): sibling direct sources in the same dimension, or a direct/supporting pair, moving in
 * opposite directions. Each must keep both observations traceable and never let one source silently erase
 * the other.
 */
export type NearMissPairV3 = { readonly id: string; readonly purpose: string; readonly dimension: string; readonly first: string; readonly second: string; readonly answers: AnswersV2 };

const PROFESSIONAL_TRUST: AnswersV2 = { ...ACTIVE, q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "legal", q2_goal: "trust", q2_discovery_reliable_reach: "reliable", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" };
const APPOINTMENT_RELATIONSHIP: AnswersV2 = { ...APPOINTMENTS, q2_goal: "stop_losing", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_process_systemization: "defined", q2_professional_intake_flow: "clear" };
const B2B_ORGANIZE: AnswersV2 = { ...ACTIVE, q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2b", q2_customer_reach: "national", q2_goal: "organize", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong" };

export const NEAR_MISS_PAIRS_V3: readonly NearMissPairV3[] = [
  { id: "N01", purpose: "Reputation weak / authority strong.", dimension: "trust_reputation", first: "q2_reputation_flow", second: "q2_professional_authority_signals", answers: { ...PROFESSIONAL_TRUST, q2_reputation_flow: "weak", q2_professional_authority_signals: "clearly_visible" } },
  { id: "N02", purpose: "Authority weak / reputation strong.", dimension: "trust_reputation", first: "q2_professional_authority_signals", second: "q2_reputation_flow", answers: { ...PROFESSIONAL_TRUST, q2_reputation_flow: "strong", q2_professional_authority_signals: "not_really" } },
  { id: "N03", purpose: "Booking friction strong (rarely) / reminders weak — different dimensions must stay separate.", dimension: "conversion_access", first: "q2_appointments_booking_friction", second: "q2_appointments_confirmation_reminders", answers: { ...APPOINTMENT_RELATIONSHIP, q2_appointments_booking_friction: "rarely", q2_appointments_confirmation_reminders: "rarely", q2_appointments_rebooking: "proactive" } },
  { id: "N04", purpose: "Reminders strong / rebooking weak — sibling Relationship sources.", dimension: "relationship_recurrence", first: "q2_appointments_rebooking", second: "q2_appointments_confirmation_reminders", answers: { ...APPOINTMENT_RELATIONSHIP, q2_appointments_booking_friction: "rarely", q2_appointments_confirmation_reminders: "consistent", q2_appointments_rebooking: "reactive" } },
  { id: "N05", purpose: "B2B pipeline weak / supporting status visibility strong.", dimension: "relationship_recurrence", first: "q2_b2b_pipeline", second: "q2_b2b_status_visibility", answers: { ...B2B_ORGANIZE, q2_process_systemization: "defined", q2_b2b_pipeline: "informal", q2_b2b_status_visibility: "clear" } },
  { id: "N06", purpose: "B2B pipeline strong / supporting status visibility weak.", dimension: "relationship_recurrence", first: "q2_b2b_status_visibility", second: "q2_b2b_pipeline", answers: { ...B2B_ORGANIZE, q2_process_systemization: "defined", q2_b2b_pipeline: "defined", q2_b2b_status_visibility: "lose_track" } },
  { id: "N07", purpose: "Process systemization strong / information base weak — sibling direct Readiness sources.", dimension: "digital_readiness", first: "q2_operations_information_base", second: "q2_process_systemization", answers: { ...B2B_ORGANIZE, q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_process_systemization: "defined", q2_operations_information_base: "difficult_unreliable" } },
  { id: "N08", purpose: "Information base strong / process systemization weak.", dimension: "digital_readiness", first: "q2_process_systemization", second: "q2_operations_information_base", answers: { ...B2B_ORGANIZE, q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_process_systemization: "informal", q2_operations_information_base: "easy_reliable" } },
];
