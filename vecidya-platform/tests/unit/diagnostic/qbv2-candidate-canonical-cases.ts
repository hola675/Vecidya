import type { CanonicalCaseV3 } from "./qbv2-candidate-case-runner";

/**
 * DIAG-V3-R7-A canonical candidate-native cases. Every answer is an intentional business-scenario choice,
 * authored directly against `REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3`'s real option values — never reused
 * from `personas.ts`/`adversarial-personas.ts` (older answer vocabularies/contracts).
 */
export const CANONICAL_CASES_V3: readonly CanonicalCaseV3[] = [
  {
    id: "C01",
    description: "Prelaunch project: idea-stage, no customers yet, defining the offer before launch.",
    answerScript: {
      q2_entity: "project", q2_has_customers: "no", q2_goal: "explain", q2_delivery: ["other"], q2_sector: "professional_services",
      q2_monetization: "services", q2_customer_reach: "local", q2_customer_buyer: "b2c",
      q2_presence_digital_base: "no_reliable_presence",
    },
  },
  {
    id: "C02",
    description: "Independent professional, healthy core: regular clients, defined intake, visible authority.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "legal",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "trust", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_professional_intake_flow: "clear", q2_professional_authority_signals: "clearly_visible",
      q2_appointments_lead_to_booking: "most", q2_discovery_reliable_reach: "reliable",
      q2_appointments_noshow: "rarely", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C03",
    description: "Professional with weak/ad-hoc intake flow — Clarity weakness from the intake question specifically.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "trust", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_professional_intake_flow: "unclear", q2_professional_authority_signals: "clearly_visible",
      q2_appointments_lead_to_booking: "most", q2_discovery_reliable_reach: "reliable",
      q2_appointments_noshow: "rarely", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C04",
    description: "Appointments business with real booking friction — causal unlock from lead-to-booking into booking friction.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "opportunities", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "sometimes", q2_appointments_booking_friction: "often",
      q2_professional_intake_flow: "clear", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
      q2_appointments_confirmation_reminders: "consistent",
    },
  },
  {
    id: "C05",
    description: "Appointments route with weak confirmation reminders, process not yet defined elsewhere.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "stop_losing", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "informal",
      q2_appointments_lead_to_booking: "most", q2_appointments_noshow: "often", q2_appointments_confirmation_reminders: "rarely",
      q2_appointments_rebooking: "reactive", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
      q2_professional_intake_flow: "clear",
    },
  },
  {
    id: "C06",
    description: "Local service operation with slow/lost response behavior — Conversion evidence without inventing a contact-path fix.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["travels"], q2_sector: "home_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "opportunities", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_service_response_speed: "weak", q2_service_quote_followup: "rarely", q2_discovery_reliable_reach: "reliable",
      q2_reputation_flow: "strong",
    },
  },
  {
    id: "C07",
    description: "Physical retail with a customer-capture gap — Relationship evidence without an automatic CRM/automation sale.",
    answerScript: {
      q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail"], q2_sector: "retail",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "stop_losing", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_local_presence_consistency: "consistent", q2_retail_customer_capture: "no", q2_discovery_reliable_reach: "reliable",
      q2_reputation_flow: "strong",
    },
  },
  {
    id: "C08",
    description: "Ecommerce with confusing product discovery — Foundation semantics, no unrelated channel invented.",
    answerScript: {
      q2_entity: "business", q2_monetization: "goods", q2_delivery: ["online_checkout"], q2_sector: "retail",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "opportunities", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_ecommerce_product_discovery: "confusing", q2_ecommerce_traffic_sources: ["search", "social"], q2_discovery_reliable_reach: "reliable",
      q2_reputation_flow: "strong",
    },
  },
  {
    id: "C09",
    description: "B2B business with a weak pipeline and lost opportunity-status visibility — direct + supporting distinction, Barrio-eligible.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "organize", q2_customer_reach: "national", q2_customer_buyer: "b2b", q2_process_systemization: "defined",
      q2_b2b_pipeline: "informal", q2_b2b_status_visibility: "lose_track", q2_discovery_reliable_reach: "reliable",
      q2_reputation_flow: "strong",
    },
  },
  {
    id: "C10",
    description: "Creator with an engaged audience but an unclear offer — creator context must never substitute for Discovery evidence.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "audience", q2_delivery: ["online_checkout"], q2_sector: "creative_media",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "explain", q2_customer_reach: "global", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_discovery_reliable_reach: "reliable", q2_ecommerce_product_discovery: "easy",
      q2_reputation_flow: "strong",
    },
  },
  {
    id: "C11",
    description: "Active nonprofit/organization with no recurring platform need — entity label must never select Cuadra by itself.",
    answerScript: {
      q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_sector: "community_social",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "explain", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_presence_digital_base: "reliable_presence", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
      q2_presence_offer_clarity: "clear",
    },
  },
  {
    id: "C12",
    description: "Operations-heavy business with a genuinely undefined systemization process — evidence-backed Cuadra via work_organization.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "organize", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "informal",
      q2_operations_information_base: "difficult_unreliable", q2_discovery_reliable_reach: "reliable",
      q2_professional_intake_flow: "unclear", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C13",
    description: "Hybrid retail + ecommerce: both components legitimately active, neither should starve the other.",
    answerScript: {
      q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "explain", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_local_presence_consistency: "partial", q2_ecommerce_product_discovery: "confusing", q2_retail_product_visibility: "partial",
      q2_ecommerce_traffic_sources: ["search"], q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C14",
    description: "Hybrid professional + appointments: both components active, no branch contamination.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "legal",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "trust", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_professional_intake_flow: "partial", q2_professional_authority_signals: "partial",
      q2_appointments_lead_to_booking: "mixed", q2_appointments_noshow: "sometimes", q2_appointments_booking_friction: "sometimes",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_appointments_confirmation_reminders: "consistent",
    },
  },
  {
    id: "C15",
    description: "Active business with goal = measure, zero candidate Measurement sources — must remain a certified unobservable gap.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "measure", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_appointments_lead_to_booking: "most", q2_discovery_reliable_reach: "reliable",
      q2_appointments_noshow: "rarely", q2_reputation_flow: "strong", q2_professional_intake_flow: "clear",
    },
  },
  {
    id: "C16",
    description: "Sparse / mostly-unknown business — uncertainty must never read as weakness or force a sale.",
    answerScript: {
      q2_entity: "business", q2_monetization: "unsure", q2_delivery: ["other"], q2_sector: "other",
      q2_has_customers: "yes", q2_regularity: "unknown", q2_goal: "unsure", q2_customer_reach: "mixed", q2_customer_buyer: "mixed",
      q2_friction: "unsure", q2_process_systemization: "unknown", q2_b2b_pipeline: "unknown", q2_discovery_reliable_reach: "unknown",
      q2_reputation_flow: "unknown",
    },
  },
  {
    id: "C17",
    description: "N/A-heavy legitimate case: a solo professional with structurally not-applicable appointment/retail facets.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "no", q2_monetization: "services", q2_delivery: ["online_checkout"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "stop_losing", q2_customer_reach: "national", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_discovery_reliable_reach: "reliable", q2_ecommerce_product_discovery: "easy",
      q2_reputation_flow: "strong", q2_professional_intake_flow: "clear",
    },
  },
  {
    id: "C18",
    description: "Active business with unreliable discovery reach — Discovery weakness, channel cause must remain unknown.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["online_checkout"], q2_sector: "home_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "be_found", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_discovery_reliable_reach: "weak", q2_ecommerce_product_discovery: "easy", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C19",
    description: "Active business with a genuine owned-base gap — website solution, Web & Conversión, no forced license.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "explain", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_presence_digital_base: "no_reliable_presence", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
      q2_professional_intake_flow: "clear",
    },
  },
  {
    id: "C20",
    description: "Declared friction (follow-up) not confirmed by the evidence — a healthy capability must never become a weakness.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["online_checkout"], q2_sector: "retail",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "other", q2_friction: "follow_up", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_followup_general_process: "consistent", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
      q2_ecommerce_product_discovery: "easy",
    },
  },
  {
    id: "C21",
    description: "Appointment rebooking weakness, isolated from reminders — Relationship evidence from rebooking specifically.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "home_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "stop_losing", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_appointments_lead_to_booking: "most", q2_appointments_noshow: "rarely", q2_appointments_rebooking: "reactive",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C22",
    description: "Retail customer-capture gap, isolated from presence consistency — Relationship evidence from capture specifically.",
    answerScript: {
      q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail"], q2_sector: "retail",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "stop_losing", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "defined",
      q2_local_presence_consistency: "consistent", q2_retail_customer_capture: "no",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C23",
    description: "Operations: a scattered information base with a second staff member and clean handoffs — direct Readiness evidence plus a refining supporting signal.",
    answerScript: {
      q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "organize", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "partial",
      q2_operations_information_base: "difficult_unreliable", q2_operations_handoffs: "complete",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_professional_intake_flow: "clear",
    },
  },
  {
    id: "C24",
    description: "B2B pipeline defined with status visibility supporting evidence — direct plus refining supporting signal together.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "organize", q2_customer_reach: "national", q2_customer_buyer: "b2b", q2_process_systemization: "defined",
      q2_b2b_pipeline: "defined", q2_b2b_status_visibility: "partial",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong",
    },
  },
  {
    id: "C25",
    description: "Operations information base genuinely scattered, with systemization itself unresolved — information base as the sole direct Readiness closer.",
    answerScript: {
      q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services",
      q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: "stable",
      q2_goal: "organize", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_process_systemization: "unknown",
      q2_operations_information_base: "difficult_unreliable",
      q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_professional_intake_flow: "clear",
    },
  },
];
