import type { ModuleId } from "./qbv2-contract";
import type { AnswersV2 } from "./qbv2-rules";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import { ROUTE_HARD_CAP, buildQuestionPlan } from "./qbv2-planner";

export type GoldenPersona = {
  readonly id: string;
  readonly label: string;
  /** Context answers used to resolve the route; diagnostic answers live in answerProfile. */
  readonly answers: AnswersV2;
  /** Answers already collected before this planner run, as in a resumed production session. */
  readonly preexistingAnswers?: AnswersV2;
  readonly answerProfile: AnswersV2;
  readonly expectedModules: readonly ModuleId[];
  readonly excludedModules: readonly ModuleId[];
  readonly notes: readonly string[];
};

export type GoldenPersonaExecution = {
  readonly answers: AnswersV2;
  readonly selectedQuestionIds: readonly string[];
  readonly routeLengths: readonly number[];
  readonly unansweredSelectedQuestionIds: readonly string[];
};

const commonOperating = { q2_has_customers: "yes", q2_regularity: "regular", q2_sector: "professional_services", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_demand_trend: "flat", q2_process_systemization: "documented_process", q2_capacity_signal: ["stable"] } as const;
const profile = (values: AnswersV2): AnswersV2 => values;

export const GOLDEN_PERSONAS: readonly GoldenPersona[] = [
  { id: "idea_early_stage", label: "Idea / early-stage ecommerce project", answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain", q2_friction: "visibility", q2_sector: "technology_software" }, answerProfile: profile({ q2_delivery: "online_checkout", q2_monetization: "recurring", q2_customer_buyer: "b2c", q2_customer_reach: "national", q2_startup_next_milestone: "talk_to_audience", q2_startup_offer_readiness: "mostly_ready", q2_startup_problem_clarity: "clear_audience_problem", q2_startup_validation_evidence: "conversations", q2_startup_demand_signal: "interest", q2_startup_first_channel: "specific_channel", q2_ecommerce_product_discovery: "unknown" }), expectedModules: ["startup", "ecommerce"], excludedModules: ["appointments", "measurement", "reputation"], notes: ["El estado idea no activa ecommerce; checkout y alcance nacional declarados identifican un proyecto ecommerce sin transacciones actuales."] },
  { id: "local_service_business", label: "Local service business", answers: { ...commonOperating, q2_delivery: "travels", q2_goal: "be_found", q2_friction: "visibility" }, answerProfile: profile({ q2_entity: "business", q2_monetization: "time_or_project", q2_service_quote_practice: "yes", q2_service_response_speed: "fast", q2_local_discovery: "referral", q2_service_repeat_referral: "both", q2_operations_automation_adoption: "none_automated", q2_presence_digital_base: "third_party_only", q2_presence_offer_clarity: "offer_only" }), expectedModules: ["local_service"], excludedModules: ["appointments", "ecommerce", "creator", "nonprofit"], notes: ["La cobertura debe distinguir área de servicio de alcance geográfico."] },
  { id: "appointment_business", label: "Appointment-based business", answers: { ...commonOperating, q2_sector: "health_wellness", q2_customer_reach: "regional", q2_delivery: "scheduled", q2_goal: "opportunities", q2_friction: "follow_up" }, answerProfile: profile({ q2_entity: "business", q2_monetization: "licensed", q2_appointments_confirmation_reminders: "automatic", q2_appointments_booking_friction: "rarely", q2_followup_ownership: "yes_clear", q2_followup_general_process: "defined_process", q2_followup_status_visibility: "regularly" }), expectedModules: ["appointments", "reputation", "follow_up"], excludedModules: ["ecommerce", "retail", "creator"], notes: ["Debe conservar citas, recordatorios, no-shows y rebooking sin convertir reservas de hospitality en citas."] },
  { id: "independent_professional", label: "Independent professional", answers: { ...commonOperating, q2_delivery: "solo_practice", q2_goal: "trust", q2_friction: "conversion" }, answerProfile: profile({ q2_entity: "individual", q2_monetization: "licensed", q2_professional_followup_after_consult: "always", q2_professional_authority_signals: "clearly_visible", q2_professional_intake_flow: "defined_consult", q2_other_staff: "no", q2_conversion_interest_to_action: "about_half", q2_professional_referral_dependency: "mostly_referrals" }), expectedModules: ["professional", "reputation"], excludedModules: ["appointments", "ecommerce", "hospitality"], notes: ["Debe cubrir autoridad, intake y confianza sin exigir un equipo."] },
  { id: "professional_appointments", label: "Professional + appointments", answers: { ...commonOperating, q2_sector: "health_wellness", q2_customer_reach: "regional", q2_delivery: "scheduled", q2_goal: "opportunities", q2_friction: "follow_up" }, answerProfile: profile({ q2_entity: "business", q2_monetization: "licensed", q2_appointments_confirmation_reminders: "manual", q2_appointments_booking_friction: "sometimes", q2_followup_ownership: "unclear", q2_followup_general_process: "sometimes_lost", q2_professional_authority_signals: "partial", q2_operations_automation_adoption: "none_automated", q2_presence_digital_base: "outdated", q2_presence_offer_clarity: "offer_only", q2_followup_status_visibility: "only_when_remember" }), expectedModules: ["appointments", "reputation", "follow_up"], excludedModules: ["ecommerce", "retail", "creator"], notes: ["La variante comparte evidencia de citas y seguimiento."] },
  { id: "physical_retail", label: "Physical retail", answers: { ...commonOperating, q2_sector: "retail", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_delivery: "fixed_with_inventory", q2_goal: "be_found", q2_friction: "visibility" }, answerProfile: profile({ q2_entity: "business", q2_monetization: "goods", q2_retail_customer_capture: "systematic", q2_retail_product_visibility: "yes_clear", q2_local_discovery: "maps_search", q2_local_presence_consistency: "consistent", q2_retail_promotions: "rarely", q2_operations_automation_adoption: "some_automated" }), expectedModules: ["retail", "local", "reputation"], excludedModules: ["ecommerce", "appointments", "b2b"], notes: ["Debe obtener descubrimiento local y evidencia propia de catálogo/captura."] },
  { id: "ecommerce", label: "Ecommerce", answers: { ...commonOperating, q2_sector: "retail", q2_customer_reach: "national", q2_delivery: "online_checkout", q2_monetization: "goods", q2_goal: "measure", q2_friction: "conversion" }, preexistingAnswers: { q2_ecommerce_product_discovery: "yes_easy" }, answerProfile: profile({ q2_entity: "business", q2_ecommerce_cart_visibility: "yes", q2_measurement_decision_review: "regularly", q2_conversion_interest_to_action: "few", q2_ecommerce_checkout_friction: "sometimes", q2_measurement_outcome_tracking: "yes_approx", q2_professional_authority_signals: "partial", q2_presence_offer_clarity: "offer_only" }), expectedModules: ["ecommerce"], excludedModules: ["local", "appointments", "hospitality"], notes: ["Product discovery consta como respuesta anterior legítima; cart visibility y decision review se responden solo cuando el planner las selecciona."] },
  { id: "retail_ecommerce_hybrid", label: "Retail + ecommerce hybrid", answers: { ...commonOperating, q2_sector: "retail", q2_customer_reach: "mixed", q2_delivery: "fixed_with_inventory", q2_monetization: ["goods", "audience"], q2_goal: "measure", q2_friction: "operations" }, answerProfile: profile({ q2_entity: "business", q2_retail_customer_capture: "sometimes", q2_retail_product_visibility: "partially", q2_operations_bottleneck: "manual_tasks", q2_operations_information_base: "scattered_digital", q2_operations_automation_adoption: "none_automated", q2_measurement_decision_review: "occasionally" }), expectedModules: ["retail", "local", "reputation", "operations", "measurement"], excludedModules: ["appointments", "creator"], notes: ["La ruta mantiene ambas familias; la observación multiselect de monetización es contexto, no evidencia."] },
  { id: "b2b_business", label: "B2B business", answers: { ...commonOperating, q2_sector: "professional_services", q2_customer_reach: "regional", q2_customer_buyer: "b2b", q2_delivery: "b2b_pipeline", q2_goal: "opportunities", q2_friction: "follow_up" }, answerProfile: profile({ q2_entity: "business", q2_monetization: "time_or_project", q2_b2b_qualification: "yes_clear", q2_b2b_status_visibility: "yes_clear", q2_followup_ownership: "yes_clear", q2_followup_general_process: "manual_consistent", q2_conversion_interest_to_action: "about_half", q2_followup_status_visibility: "regularly", q2_professional_authority_signals: "partial", q2_presence_digital_base: "outdated" }), expectedModules: ["b2b", "follow_up"], excludedModules: ["ecommerce", "appointments", "creator"], notes: ["Debe cubrir origen, calificación, estado, ciclo y decisores."] },
  { id: "creator_personal_brand", label: "Creator / personal brand", answers: { ...commonOperating, q2_sector: "creative_media", q2_customer_reach: "global", q2_customer_buyer: "b2c", q2_monetization: "audience", q2_delivery: "audience_content", q2_goal: "opportunities", q2_friction: "trust" }, answerProfile: profile({ q2_entity: "individual", q2_creator_conversion: "regularly", q2_creator_audience_ownership: "systematic", q2_professional_authority_signals: "partial", q2_reputation_flow: "rare", q2_creator_channel_concentration: "well_diversified", q2_other_staff: "no", q2_creator_content_consistency: "consistent_schedule" }), expectedModules: ["creator"], excludedModules: ["appointments", "retail", "nonprofit"], notes: ["Debe separar audiencia de negocio, propiedad de contacto y monetización."] },
  { id: "nonprofit_community", label: "Nonprofit / community organization", answers: { q2_entity: "organization", q2_monetization: "mission", q2_delivery: "fixed_no_inventory", q2_has_customers: "yes", q2_regularity: "regular", q2_sector: "nonprofit_community", q2_customer_reach: "local", q2_goal: "opportunities", q2_friction: "conversion" }, answerProfile: profile({ q2_customer_buyer: "b2c", q2_capacity_signal: ["stable"], q2_demand_trend: "flat", q2_process_systemization: "partial", q2_nonprofit_support_type: "donations", q2_local_discovery: "maps_search", q2_local_presence_consistency: "consistent", q2_nonprofit_donation_clarity: "yes_easy", q2_conversion_interest_to_action: "few", q2_professional_authority_signals: "partial", q2_presence_offer_clarity: "all_clear", q2_nonprofit_participation: "occasionally" }), expectedModules: ["nonprofit"], excludedModules: ["ecommerce", "creator", "b2b"], notes: ["El tipo de apoyo solo enruta; solo una respuesta de acceso/participación puede ser capacidad."] },
  { id: "operations_heavy", label: "Operations-heavy business", answers: { ...commonOperating, q2_delivery: "solo_practice", q2_goal: "organize", q2_friction: "operations" }, answerProfile: profile({ q2_entity: "individual", q2_monetization: "time_or_project", q2_professional_followup_after_consult: "sometimes", q2_professional_authority_signals: "partial", q2_operations_bottleneck: "manual_tasks", q2_operations_information_base: "scattered_digital", q2_operations_automation_adoption: "none_automated" }), expectedModules: ["professional", "reputation", "operations"], excludedModules: ["ecommerce", "creator", "measurement"], notes: ["Digital Readiness distingue dependencia, ownership y trabajo manual de la calidad general del negocio."] },
] as const;

/** Resolve context first, then answer only questions selected by that actual planner route. */
export function resolveGoldenPersonaAnswers(persona: GoldenPersona): AnswersV2 {
  return runGoldenPersonaPipeline(persona).answers;
}

/**
 * Re-plan after each deterministic batch, as production does when new answers resolve eligibility.
 * `completion.ready` describes the plan INCLUDING its pending selections ("complete once these are
 * answered"), so the batch is always answered; deepening is opt-in here because golden fixtures predate
 * the interactive deepening loop and intentionally exercise the primary route only.
 */
export function runGoldenPersonaPipeline(persona: GoldenPersona, options?: { readonly includeDeepening?: boolean }): GoldenPersonaExecution {
  const answers: Record<string, string | readonly string[]> = { ...persona.answers, ...persona.preexistingAnswers };
  const selectedQuestionIds: string[] = [];
  const routeLengths: number[] = [];
  let unansweredSelectedQuestionIds: string[] = [];
  for (let iteration = 0; iteration < ROUTE_HARD_CAP; iteration += 1) {
    const plan = buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 });
    const freshQuestionIds = plan.selectedQuestionIds.filter((questionId) => answers[questionId] === undefined && (options?.includeDeepening === true || plan.trace.find((entry) => entry.questionId === questionId)?.selectedIn !== "deepening"));
    if (freshQuestionIds.length === 0) break;
    routeLengths.push(plan.routeLength);
    const fallbackAnswer = (questionId: string): string | readonly string[] => {
      const question = QUESTION_BANK_V2.find((candidate) => candidate.id === questionId)!;
      const option = question.options.find((candidate) => candidate.kind !== "unknown" && candidate.kind !== "not_applicable" && !candidate.exclusive) ?? question.options[0]!;
      return question.type === "multi" ? [option.value] : option.value;
    };
    const missingAnswers = freshQuestionIds.filter((questionId) => persona.answerProfile[questionId] === undefined && options?.includeDeepening !== true);
    if (missingAnswers.length > 0) {
      unansweredSelectedQuestionIds = missingAnswers;
      break;
    }
    for (const questionId of freshQuestionIds) {
      selectedQuestionIds.push(questionId);
      answers[questionId] = persona.answerProfile[questionId] ?? fallbackAnswer(questionId);
    }
  }
  return { answers, selectedQuestionIds, routeLengths, unansweredSelectedQuestionIds };
}
