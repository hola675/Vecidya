import type { DigitalDimensionId } from "./qbv2-coverage";
import type { PriorityReasonCode } from "./qbv2-priorities";

/**
 * DIAG-V3-08G — familias de frases del resultado. Fragmentos pequeños y deterministas que el constructor
 * (`qbv2-narrative.ts`) compone con los términos del perfil de lenguaje congelado (`qbv2-terminology.ts`). No
 * contienen conclusiones propias: cada frase se elige por un hecho, una prioridad o una evidencia concreta.
 * Sin marcado de UI: el mismo texto sirve para la interfaz y para el PDF.
 */

/** Nombre visible de cada dimensión (encabezados) y tema con artículo para insertarlo en una frase. */
export const DIMENSION_NARRATIVE: Readonly<Record<DigitalDimensionId, { readonly label: string; readonly topic: string }>> = {
  clarity_positioning: { label: "Claridad de la oferta", topic: "la claridad de tu oferta" },
  digital_foundation: { label: "Base digital", topic: "tu base digital propia" },
  discovery: { label: "Cómo te encuentran", topic: "la forma en que te encuentran" },
  trust_reputation: { label: "Confianza visible", topic: "la confianza visible" },
  conversion_access: { label: "Del interés a la acción", topic: "el paso del interés a la acción" },
  relationship_recurrence: { label: "Seguimiento y relación", topic: "el seguimiento" },
  measurement_optimization: { label: "Medición", topic: "la medición de lo que funciona" },
  digital_readiness: { label: "Base de trabajo", topic: "la base de trabajo diaria" },
};

/**
 * Términos que una frase de lectura puede necesitar; vienen siempre del léxico congelado. `offer` es el rol
 * `offer` del perfil cuando cambia el sentido (organización, pre-lanzamiento) y «lo que ofreces» en el resto,
 * para no romper la concordancia con sustantivos en plural.
 */
export type StatementTerms = { readonly conversion: string; readonly subject: string; readonly offer: string };
export type ReadingPolarity = "strength" | "partial" | "weakness";

/** Una afirmación por dimensión y lectura, en presente y sin magnitudes. La certeza la añade el constructor. */
export const DIMENSION_STATEMENTS: Readonly<Record<DigitalDimensionId, Readonly<Record<ReadingPolarity, (terms: StatementTerms) => string>>>> = {
  clarity_positioning: {
    strength: ({ offer }) => `${capitalizeFirst(offer)} se entiende con claridad.`,
    partial: ({ offer }) => `${capitalizeFirst(offer)} se entiende solo en parte.`,
    weakness: ({ offer }) => `Todavía cuesta entender ${offer} y para quién es.`,
  },
  digital_foundation: {
    strength: () => "Hay un lugar propio y actualizado donde encontrarte y contactarte.",
    partial: () => "Tu base digital existe, pero está incompleta o desactualizada.",
    weakness: () => "Tu base digital propia todavía es débil.",
  },
  discovery: {
    strength: () => "Te encuentran por varias vías y con regularidad.",
    partial: () => "Te encuentran, pero por pocas vías o de forma irregular.",
    weakness: () => "Todavía cuesta que te encuentren.",
  },
  trust_reputation: {
    strength: () => "Quien te evalúa por primera vez encuentra pruebas visibles para confiar.",
    partial: () => "Las pruebas visibles de confianza existen, pero son pocas o están dispersas.",
    weakness: () => "Quien te evalúa por primera vez encuentra pocas pruebas para confiar.",
  },
  conversion_access: {
    strength: ({ conversion }) => `Buena parte de quienes muestran interés llega a ${conversion}.`,
    partial: ({ conversion }) => `Una parte de quienes muestran interés llega a ${conversion}, pero otra se queda en el camino.`,
    weakness: ({ conversion }) => `A quienes muestran interés todavía les cuesta llegar a ${conversion}.`,
  },
  relationship_recurrence: {
    strength: ({ subject }) => `El seguimiento a ${subject} es constante.`,
    partial: ({ subject }) => `El seguimiento a ${subject} funciona, pero no de forma constante.`,
    weakness: ({ subject }) => `Parte del seguimiento a ${subject} se pierde o no se retoma.`,
  },
  measurement_optimization: {
    strength: () => "Tienes una idea clara de qué funciona y de dónde llegan los resultados.",
    partial: () => "Tienes una idea parcial de qué funciona, pero no siempre verificable.",
    weakness: () => "Todavía es difícil saber qué funciona y qué no.",
  },
  digital_readiness: {
    strength: () => "La forma de trabajar ya está ordenada y puede sostener más actividad.",
    partial: () => "Parte del trabajo diario ya está ordenado, pero no de forma constante.",
    weakness: () => "El trabajo diario todavía se apoya mucho en tareas manuales o poco ordenadas.",
  },
};

/** Foco de cada prioridad (código de `PRIORITY_CODES`), en infinitivo para componer «conviene empezar por…». */
export const PRIORITY_FOCUS: Readonly<Record<string, (terms: { readonly conversion: string; readonly concept: string; readonly offer: string }) => string>> = {
  clarify_offer: ({ offer }) => `explicar mejor ${offer}`,
  strengthen_digital_base: () => "reforzar tu base digital propia",
  improve_discovery: () => "ampliar las vías por las que te encuentran",
  build_visible_trust: () => "hacer más visibles las pruebas de confianza",
  improve_conversion: ({ conversion }) => `lograr que más interés llegue a ${conversion}`,
  stabilize_follow_up: () => "estabilizar el seguimiento",
  establish_measurement: () => "saber con más claridad qué funciona",
  build_digital_capacity: () => "ordenar la base de trabajo diaria",
  reduce_single_point_dependency: () => "reducir la dependencia de un solo canal o persona",
  verify_before_action: ({ concept }) => `confirmar ${concept}`,
};

/** Razones de prioridad que explican el orden por relación entre capacidades (primero) o por relevancia. */
export const STRUCTURAL_REASONS: readonly PriorityReasonCode[] = ["active_bottleneck", "capacity_gate", "prerequisite_of_relevant", "single_point_dependency", "optimization_unverifiable", "no_direct_evidence", "declared_friction_unconfirmed"];
export const RELEVANCE_REASONS: readonly PriorityReasonCode[] = ["friction_primary", "goal_primary", "friction_related", "goal_related"];

/**
 * Tema de cada pregunta que aporta evidencia, como sintagma con artículo: «va bien {tema}», «se basa en {tema}».
 * Neutral frente al perfil (sin «clientes» ni «negocio»), para que valga en cualquier contexto donde se pregunta.
 */
export const QUESTION_TOPICS: Readonly<Record<string, string>> = {
  q2_ecommerce_traffic_sources: "las fuentes de visitas y pedidos",
  q2_local_foot_traffic: "la llegada de gente que pasa por el local",
  q2_local_discovery: "la forma en que te descubre la gente de tu zona",
  q2_retail_promotions: "la comunicación de ofertas a quienes no están en la tienda",
  q2_professional_referral_dependency: "la llegada de personas nuevas por recomendación",
  q2_ecommerce_acquisition_dependency: "la variedad de canales que traen pedidos",
  q2_b2b_lead_source: "el origen de las oportunidades",
  q2_creator_channel_concentration: "el reparto de la audiencia entre canales",
  q2_creator_content_consistency: "el ritmo de publicación",
  q2_startup_first_channel: "el canal inicial para llegar al público",
  q2_local_presence_consistency: "los datos de contacto y horario en internet",
  q2_ecommerce_product_discovery: "la facilidad para encontrar productos en la tienda en línea",
  q2_presence_digital_base: "un lugar propio y actualizado en internet",
  q2_reputation_flow: "la llegada de reseñas y recomendaciones nuevas",
  q2_professional_authority_signals: "los casos, testimonios y opiniones visibles",
  q2_retail_product_visibility: "la información previa sobre qué ofreces y su disponibilidad",
  q2_presence_offer_clarity: "la primera impresión que se lleva quien no te conoce",
  q2_b2b_qualification: "la forma de distinguir oportunidades reales",
  q2_professional_intake_flow: "el paso inicial antes de empezar a trabajar",
  q2_nonprofit_donation_clarity: "la facilidad para donar",
  q2_startup_problem_clarity: "la claridad del problema y del público",
  q2_startup_validation_evidence: "lo comprobado con personas reales",
  q2_startup_offer_readiness: "lo concreta que está la oferta",
  q2_startup_demand_signal: "las acciones concretas de demanda",
  q2_service_response_speed: "la rapidez de respuesta a los primeros contactos",
  q2_service_quote_followup: "el seguimiento de las cotizaciones",
  q2_appointments_booking_method: "la forma de agendar citas",
  q2_appointments_booking_friction: "la facilidad para encontrar horario",
  q2_appointments_lead_to_booking: "el paso de preguntar por una cita a agendarla",
  q2_ecommerce_checkout_friction: "la finalización del pago",
  q2_hospitality_delivery_takeaway: "las opciones para llevar o a domicilio",
  q2_b2b_decision_makers: "el número de personas que deciden",
  q2_creator_conversion: "las ofertas de compra a tu audiencia",
  q2_conversion_interest_to_action: "la proporción de personas interesadas que da el paso",
  q2_local_repeat_customers: "el regreso de quienes ya vinieron",
  q2_service_repeat_referral: "las recomendaciones y los trabajos repetidos",
  q2_appointments_confirmation_reminders: "las confirmaciones y recordatorios de citas",
  q2_appointments_rebooking: "la reserva de la siguiente cita",
  q2_professional_followup_after_consult: "el seguimiento después de una primera consulta",
  q2_retail_customer_capture: "la forma de volver a contactar a quien compró",
  q2_ecommerce_cart_followup: "el seguimiento de carritos sin terminar",
  q2_ecommerce_repeat_purchase: "las compras repetidas",
  q2_b2b_sales_cycle: "los contactos que requiere cerrar un acuerdo",
  q2_creator_audience_ownership: "el contacto propio con tu audiencia",
  q2_followup_general_process: "la forma de retomar pendientes",
  q2_followup_ownership: "la claridad sobre quién responde",
  q2_followup_status_visibility: "el repaso habitual de pendientes",
  q2_ecommerce_cart_visibility: "la visibilidad de carritos sin terminar",
  q2_measurement_source_confidence: "el conocimiento de cómo llega cada persona nueva",
  q2_measurement_outcome_tracking: "la estimación de cuántos contactos terminan en un resultado",
  q2_measurement_decision_review: "la comparación de resultados entre periodos",
  q2_b2b_pipeline: "el proceso de seguimiento de oportunidades",
  q2_b2b_status_visibility: "la visibilidad del estado de cada oportunidad",
  q2_hospitality_peak_capacity: "la capacidad en las horas de más demanda",
  q2_creator_monetization_model: "la forma de monetizar la audiencia",
  q2_nonprofit_membership_lifecycle: "el proceso de alta y renovación de miembros",
  q2_operations_process_ownership: "la claridad sobre quién hace cada tarea",
  q2_operations_handoffs: "el paso de información entre personas",
  q2_operations_bottleneck: "el principal límite de capacidad",
  q2_operations_manual_impact: "el costo del trabajo manual",
  q2_operations_dependency: "la dependencia de una persona clave",
  q2_operations_information_base: "el lugar donde se guarda la información de trabajo",
  q2_operations_automation_adoption: "las tareas repetitivas que ya se hacen solas",
};

/**
 * Dependencia de un solo punto, según la dimensión donde se observó: plataformas ajenas (base digital), una sola
 * vía (descubrimiento) o una sola persona (base de trabajo). Nunca se generaliza más allá de lo observado.
 */
export const DEPENDENCY_STATEMENTS: Readonly<Partial<Record<DigitalDimensionId, string>>> = {
  discovery: "La llegada de personas nuevas depende de una sola vía.",
  digital_foundation: "Tu presencia en internet depende de plataformas que no controlas.",
  digital_readiness: "El trabajo depende demasiado de una sola persona.",
};

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Expresiones prohibidas además de `HARSH_RESULT_PHRASES`: relleno genérico que no sale de ningún hecho. */
export const NARRATIVE_FILLER_PHRASES = ["en el mundo actual", "hoy en día", "es esencial", "es imprescindible", "la clave del éxito", "no te quedes atrás", "en la era digital", "es fundamental"] as const;
