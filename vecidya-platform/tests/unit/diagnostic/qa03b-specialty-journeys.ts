import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { AUTHORED_UNKNOWN_CAPABILITIES } from "./qa03b-fixtures";

/**
 * Human-authored scenario matrix for the 74-question base plus isolated specialty pilots.
 * The baseline unknown-capability answers are deliberately visible here:
 * tests never fabricate a positive capability because a sector/niche suggests it.
 * Only a *known* profile answer or an explicit neutral option may be submitted.
 */
export type QA03BSpecialtyPersona = {
  readonly id: string;
  readonly entity: string;
  readonly status: string;
  readonly sector: string;
  readonly monetization: string;
  readonly delivery: readonly string[];
  readonly buyer: string;
  readonly history: string;
  readonly niche: string | null;
  readonly goal: string;
  readonly friction: string;
};

export const QA03B_SPECIALTY_PERSONAS: readonly QA03BSpecialtyPersona[] = [
  {
    "id": "idea-servicio-local",
    "entity": "project",
    "status": "preparing",
    "sector": "home_services",
    "monetization": "services",
    "delivery": [
      "travels"
    ],
    "buyer": "b2c",
    "history": "no",
    "niche": "plumbing",
    "goal": "explain",
    "friction": "unsure"
  },
  {
    "id": "idea-tienda-online",
    "entity": "project",
    "status": "preparing",
    "sector": "ecommerce",
    "monetization": "goods",
    "delivery": [
      "online_checkout"
    ],
    "buyer": "b2c",
    "history": "no",
    "niche": null,
    "goal": "explain",
    "friction": "unsure"
  },
  {
    "id": "idea-software",
    "entity": "project",
    "status": "preparing",
    "sector": "technology_software",
    "monetization": "recurring",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2b",
    "history": "no",
    "niche": "software_startup",
    "goal": "explain",
    "friction": "unsure"
  },
  {
    "id": "idea-organizacion",
    "entity": "organization",
    "status": "preparing",
    "sector": "nonprofit_community",
    "monetization": "mission",
    "delivery": [
      "physical_location"
    ],
    "buyer": "no_direct_purchase",
    "history": "no",
    "niche": null,
    "goal": "explain",
    "friction": "unsure"
  },
  {
    "id": "pausa-dentista",
    "entity": "individual",
    "status": "paused",
    "sector": "health_wellness",
    "monetization": "services",
    "delivery": [
      "appointments"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "dentist",
    "goal": "measure",
    "friction": "operations"
  },
  {
    "id": "pausa-restaurante",
    "entity": "business",
    "status": "paused",
    "sector": "food_hospitality",
    "monetization": "services",
    "delivery": [
      "onsite"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "restaurant",
    "goal": "organize",
    "friction": "operations"
  },
  {
    "id": "autonomo-dentista",
    "entity": "individual",
    "status": "operating",
    "sector": "health_wellness",
    "monetization": "services",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "dentist",
    "goal": "measure",
    "friction": "follow_up"
  },
  {
    "id": "clinica-dental",
    "entity": "business",
    "status": "operating",
    "sector": "health_wellness",
    "monetization": "services",
    "delivery": [
      "physical_location",
      "appointments"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "dentist",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "medicina-general",
    "entity": "business",
    "status": "operating",
    "sector": "health_wellness",
    "monetization": "services",
    "delivery": [
      "physical_location",
      "appointments"
    ],
    "buyer": "mixed",
    "history": "yes",
    "niche": "primary_care",
    "goal": "measure",
    "friction": "operations"
  },
  {
    "id": "barberia",
    "entity": "business",
    "status": "operating",
    "sector": "beauty_personal_care",
    "monetization": "services",
    "delivery": [
      "physical_location",
      "appointments"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "barbershop",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "salon-belleza",
    "entity": "business",
    "status": "operating",
    "sector": "beauty_personal_care",
    "monetization": "services",
    "delivery": [
      "physical_location",
      "appointments"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "hair_salon",
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "asesoria-legal",
    "entity": "individual",
    "status": "operating",
    "sector": "legal",
    "monetization": "services",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2b",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "follow_up"
  },
  {
    "id": "impuestos",
    "entity": "individual",
    "status": "operating",
    "sector": "financial_tax_insurance",
    "monetization": "services",
    "delivery": [
      "appointments"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "tax_preparation",
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "seguros",
    "entity": "business",
    "status": "operating",
    "sector": "financial_tax_insurance",
    "monetization": "services",
    "delivery": [
      "remote_service"
    ],
    "buyer": "mixed",
    "history": "yes",
    "niche": "insurance_agency",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "plomeria-domicilio",
    "entity": "individual",
    "status": "operating",
    "sector": "home_services",
    "monetization": "services",
    "delivery": [
      "travels"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "plumbing",
    "goal": "organize",
    "friction": "operations"
  },
  {
    "id": "taller-mecanico",
    "entity": "business",
    "status": "operating",
    "sector": "automotive",
    "monetization": "services",
    "delivery": [
      "physical_location"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "auto_repair",
    "goal": "organize",
    "friction": "operations"
  },
  {
    "id": "taller-mecanico-presupuestos",
    "entity": "business",
    "status": "operating",
    "sector": "automotive",
    "monetization": "services",
    "delivery": [
      "physical_location"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "auto_repair",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "detallado-movil",
    "entity": "individual",
    "status": "operating",
    "sector": "automotive",
    "monetization": "services",
    "delivery": [
      "travels"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "mobile_detailing",
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "restaurante-reservas",
    "entity": "business",
    "status": "operating",
    "sector": "food_hospitality",
    "monetization": "services",
    "delivery": [
      "onsite"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "restaurant",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "cafeteria-espontaneo",
    "entity": "business",
    "status": "operating",
    "sector": "food_hospitality",
    "monetization": "goods",
    "delivery": [
      "onsite"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "cafe",
    "goal": "organize",
    "friction": "operations"
  },
  {
    "id": "foodtruck-movil",
    "entity": "business",
    "status": "operating",
    "sector": "food_hospitality",
    "monetization": "goods",
    "delivery": [
      "travels",
      "onsite"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": "food_truck",
    "goal": "measure",
    "friction": "operations"
  },
  {
    "id": "tienda-local",
    "entity": "business",
    "status": "operating",
    "sector": "retail",
    "monetization": "goods",
    "delivery": [
      "retail"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "tienda-hibrida",
    "entity": "business",
    "status": "operating",
    "sector": "retail",
    "monetization": "goods",
    "delivery": [
      "retail",
      "online_checkout"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": null,
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "ecommerce-puro",
    "entity": "business",
    "status": "operating",
    "sector": "ecommerce",
    "monetization": "goods",
    "delivery": [
      "online_checkout"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "agencia-marketing-b2b",
    "entity": "business",
    "status": "operating",
    "sector": "b2b_services",
    "monetization": "services",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2b",
    "history": "yes",
    "niche": "marketing_agency",
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "distribuidora-b2b",
    "entity": "business",
    "status": "operating",
    "sector": "b2b_services",
    "monetization": "goods",
    "delivery": [
      "physical_location"
    ],
    "buyer": "b2b",
    "history": "yes",
    "niche": "wholesale_distribution",
    "goal": "stop_losing",
    "friction": "follow_up"
  },
  {
    "id": "creador-audiencia",
    "entity": "individual",
    "status": "operating",
    "sector": "creator",
    "monetization": "audience",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2c",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "organizacion-donaciones",
    "entity": "organization",
    "status": "operating",
    "sector": "nonprofit_community",
    "monetization": "mission",
    "delivery": [
      "physical_location"
    ],
    "buyer": "no_direct_purchase",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "follow_up"
  },
  {
    "id": "organizacion-membresias",
    "entity": "organization",
    "status": "operating",
    "sector": "nonprofit_community",
    "monetization": "mission",
    "delivery": [
      "physical_location"
    ],
    "buyer": "no_direct_purchase",
    "history": "yes",
    "niche": null,
    "goal": "organize",
    "friction": "operations"
  },
  {
    "id": "consultoria-b2b",
    "entity": "individual",
    "status": "operating",
    "sector": "professional_services",
    "monetization": "services",
    "delivery": [
      "remote_service"
    ],
    "buyer": "b2b",
    "history": "yes",
    "niche": null,
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "incertidumbre-inicial",
    "entity": "business",
    "status": "operating",
    "sector": "other",
    "monetization": "unsure",
    "delivery": [
      "unsure"
    ],
    "buyer": "unknown",
    "history": "no",
    "niche": null,
    "goal": "explain",
    "friction": "unsure"
  },
  {
    "id": "software-saas-activo",
    "entity": "business",
    "status": "operating",
    "sector": "technology_software",
    "monetization": "recurring",
    "delivery": ["remote_service"],
    "buyer": "b2b",
    "history": "yes",
    "niche": "software_startup",
    "goal": "measure",
    "friction": "conversion"
  },
  {
    "id": "marketplace-activo",
    "entity": "business",
    "status": "operating",
    "sector": "technology_software",
    "monetization": "commission",
    "delivery": ["online_checkout"],
    "buyer": "mixed",
    "history": "yes",
    "niche": "two_sided_marketplace",
    "goal": "measure",
    "friction": "conversion"
  }
] as const;

export function authoredSpecialtyAnswers(persona: QA03BSpecialtyPersona): AnswersV2 {
  const answers: AnswersV2 = {
    ...AUTHORED_UNKNOWN_CAPABILITIES,
    q2_entity: persona.entity,
    q2_operational_status: persona.status,
    q2_sector: persona.sector,
    q2_monetization: persona.monetization,
    q2_delivery: [...persona.delivery],
    q2_customer_buyer: persona.buyer,
    q2_has_customers: persona.history,
    q2_customer_reach: "local",
    q2_other_staff: "no",
    q2_goal: persona.goal,
    q2_friction: persona.friction,
    // No positive inference is made from these representative statuses.
    q2_nonprofit_support_type: persona.id === "organizacion-donaciones" ? "donations"
      : persona.id === "organizacion-membresias" ? "membership_dues" : "unknown",
    q2_hospitality_flow_type: persona.id === "restaurante-reservas" ? "reservation"
      : persona.id === "cafeteria-espontaneo" ? "walk_in" : "unknown",
    q2_ecommerce_cart_visibility: "unknown",
    q2_ecommerce_cart_followup: "unknown",
    q2_ecommerce_checkout_friction: "unknown",
    q2_b2b_qualification: "unknown",
    q2_startup_problem_clarity: "unknown",
    q2_startup_validation_evidence: "unknown",
    q2_startup_offer_readiness: "unknown",
    q2_startup_demand_signal: "unknown",
    q2_measurement_source_confidence: "unknown",
    q2_followup_status_visibility: "unknown",
    q2_operations_process_ownership: "unknown",
    q2_nonprofit_donation_clarity: "unknown",
    q2_nonprofit_membership_lifecycle: "unknown",
    q2_creator_channel_concentration: "unknown",
    q2_ecommerce_repeat_purchase: "unknown",
    q2_hospitality_reservation_noshow: "unknown",
    q2_hospitality_peak_capacity: "unknown",
    q2_local_repeat_customers: "unknown",
    q2_service_area_clarity: "unknown",
    q2_specialty_software_activation: persona.id === "software-saas-activo" ? "partially_tracked" : "unknown",
    q2_specialty_marketplace_balance: persona.id === "marketplace-activo" ? "sometimes_clear" : "unknown",
    q2_specialty_tax_return_cycle: persona.id === "impuestos" ? "systematic" : "unknown",
    q2_specialty_insurance_renewal: persona.id === "seguros" ? "partial" : "unknown",
    q2_specialty_auto_repair_estimate_followup: persona.id === "taller-mecanico-presupuestos" ? "partial" : "unknown",
  };
  if (persona.niche !== null) {
    answers[`q2_niche_${persona.sector}`] = persona.niche;
  }
  return answers;
}

/** Profile declarations alone; no capability questionnaire answers injected. */
export function declaredSpecialtyContextAnswers(persona: QA03BSpecialtyPersona): AnswersV2 {
  const all = authoredSpecialtyAnswers(persona);
  return Object.fromEntries(
    Object.entries(all).filter(([id]) =>
      ["q2_entity", "q2_operational_status", "q2_sector", "q2_monetization",
       "q2_delivery", "q2_customer_buyer", "q2_has_customers", "q2_customer_reach",
       "q2_other_staff", "q2_goal", "q2_friction"].includes(id) ||
      id === `q2_niche_${persona.sector}`),
  );
}
