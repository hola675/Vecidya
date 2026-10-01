import type { DigitalDimensionId } from "./qbv2-coverage";
import type { SemanticFact } from "./qbv2-semantic-facts";
import { resolveTerm, type TermRole, type TerminologyProfileId } from "./qbv2-terminology";

/**
 * DIAG-V3-08F — capa de lenguaje del diagnóstico. Dos contratos puros, sin prosa final:
 * 1. `QUESTION_LANGUAGE`: auditoría ejecutable de las 85 preguntas productivas (etapa del sujeto, modo de
 *    copy, clasificación y nivel de ayuda). Los tests la cruzan con el banco, el ciclo de vida y el render.
 * 2. Vocabulario de resultados para 08G: certeza → marco de lenguaje, categoría de hecho → expresiones
 *    preferidas, y la regla de continuidad de etapa (pregunta → evidencia → resultado).
 *
 * DIAG-V3-08F.1: capa de lenguaje CONGELADA (resolver de terminología, variantes, etiquetas, pista, ayuda,
 * vocabulario de ciclo de vida y de resultados). Un cambio de wording exige un defecto real de comprensión, un
 * contexto de negocio nuevo o investigación con usuarios.
 */

// ── Etapas del sujeto ────────────────────────────────────────────────────────

/**
 * De quién habla la pregunta. Las etapas de ciclo de vida no se colapsan: quien encuentra el negocio
 * (`audience`) no es quien muestra interés (`interested`), ni quien hace un primer contacto (`inquiry`), ni
 * una oportunidad trabajada (`opportunity`), ni un cliente (`customer`) o un cliente que vuelve.
 * `business` (el negocio, su oferta o su contexto) y `operation` (el trabajo interno) no son etapas.
 */
export const SUBJECT_STAGES = ["business", "operation", "audience", "interested", "inquiry", "opportunity", "customer", "repeat_customer"] as const;
export type SubjectStage = (typeof SUBJECT_STAGES)[number];

export const LIFECYCLE_ORDER: Readonly<Partial<Record<SubjectStage, number>>> = { audience: 1, interested: 2, inquiry: 3, opportunity: 4, customer: 5, repeat_customer: 6 };
/** Etapas que solo existen con actividad real: nunca se preguntan en pre-lanzamiento declarado. */
export const LIVE_ONLY_STAGES: readonly SubjectStage[] = ["inquiry", "opportunity", "customer", "repeat_customer"];
/** Rol del léxico con el que se nombra cada etapa en el resultado (misma etapa que la pregunta). */
export const STAGE_TERM: Readonly<Record<SubjectStage, TermRole>> = {
  business: "business", operation: "business", audience: "audience", interested: "interested", inquiry: "inquiry", opportunity: "opportunity", customer: "customer", repeat_customer: "repeat_customer",
};

// ── Auditoría por pregunta ───────────────────────────────────────────────────

/** `static`: enumeración clasificatoria igual en todo contexto; `neutral`: un copy válido para todos; `variant`: base neutral + variantes. */
export const COPY_MODES = ["static", "neutral", "variant"] as const;
export type CopyMode = (typeof COPY_MODES)[number];
export const AUDIT_CLASSES = ["keep", "copy_refinement", "context_variant_needed", "answer_refinement", "semantic_mismatch", "help_needed"] as const;
export type AuditClass = (typeof AUDIT_CLASSES)[number];
export const HELP_LEVELS = ["not_needed", "recommended", "required"] as const;
export type HelpLevel = (typeof HELP_LEVELS)[number];

export type QuestionLanguageEntry = {
  readonly stage: SubjectStage;
  readonly copy: CopyMode;
  /** Clasificación principal de la auditoría 08F (estado antes de la corrección). */
  readonly audit: AuditClass;
  readonly help: HelpLevel;
  /** Hallazgo corregido en 08F (ausente en `keep`). */
  readonly finding?: string;
  /** Hallazgo NO corregido: requiere cambiar opciones o semántica bajo una nueva `QuestionVersion`. */
  readonly deferred?: string;
};

const entry = (stage: SubjectStage, copy: CopyMode, audit: AuditClass, help: HelpLevel, finding?: string, deferred?: string): QuestionLanguageEntry => ({ stage, copy, audit, help, ...(finding ? { finding } : {}), ...(deferred ? { deferred } : {}) });

export const QUESTION_LANGUAGE: Readonly<Record<string, QuestionLanguageEntry>> = {
  // Fundación
  q2_entity: entry("business", "static", "copy_refinement", "not_needed", "«¿Quién responde?» no coincidía con opciones que describen qué se diagnostica."),
  q2_other_staff: entry("business", "static", "keep", "not_needed"),
  q2_monetization: entry("business", "static", "copy_refinement", "not_needed", "Etiquetas en primera persona presente («Vendo», «Monetizo») no valían antes del lanzamiento; ahora son sustantivos."),
  q2_delivery: entry("business", "static", "copy_refinement", "required", "Jerga interna («inventario de reventa», «proveedores/recursos», «proceso de pago») en una pregunta que decide la ruta."),
  q2_has_customers: entry("business", "variant", "copy_refinement", "required", "«Clientes o transacciones» excluía organizaciones y no separaba interés de actividad real."),
  q2_regularity: entry("customer", "variant", "copy_refinement", "not_needed", "«Esa actividad» dependía de la pregunta anterior, que el planner no garantiza."),
  q2_demand_trend: entry("customer", "variant", "context_variant_needed", "not_needed", "«Clientes/pedidos» no encajaba en organizaciones ni en práctica clínica."),
  q2_sector: entry("business", "static", "keep", "not_needed"),
  q2_customer_reach: entry("audience", "variant", "context_variant_needed", "not_needed", "Presuponía clientes existentes (también se pregunta antes del lanzamiento) y remitía a otra pregunta."),
  q2_customer_buyer: entry("audience", "variant", "copy_refinement", "not_needed", "«Comprador» en la base no valía antes del lanzamiento."),
  q2_process_systemization: entry("operation", "neutral", "help_needed", "recommended", "La mezcla real de procesos necesitaba ayuda para no forzar una respuesta binaria."),
  q2_capacity_signal: entry("operation", "neutral", "copy_refinement", "recommended", "La pista visible explicaba el modelo interno y remitía a otra pregunta."),
  q2_goal: entry("business", "variant", "context_variant_needed", "required", "«Consultas/clientes» en etiquetas no encajaba en organizaciones ni antes del lanzamiento."),
  q2_friction: entry("business", "variant", "copy_refinement", "required", "Jerga («cierro»), hipérbole («Nadie»), «consultas» (en salud significa otra cosa) y primera persona singular en organizaciones."),
  // Local / retail / hospitality
  q2_local_foot_traffic: entry("audience", "neutral", "copy_refinement", "recommended", "«Mucho/Poco» no respondía a «qué parte»; «tu negocio» excluía organizaciones."),
  q2_local_discovery: entry("audience", "neutral", "copy_refinement", "recommended", "Etiquetas mezclaban formas verbales distintas."),
  q2_local_presence_consistency: entry("audience", "variant", "context_variant_needed", "recommended", "Antes del lanzamiento «no encuentra nada» significa «aún no publicado»."),
  q2_local_repeat_customers: entry("repeat_customer", "variant", "context_variant_needed", "not_needed", "«Te compraron» no encajaba en organizaciones."),
  q2_reputation_flow: entry("customer", "variant", "answer_refinement", "required", "«Pacientes» aplicaba a todo bienestar (gimnasios, spas); sin variante para organizaciones. Solo dos niveles: falta un nivel intermedio (resuelto en DIAG-V3-08F.1 con `occasional`, versión 2)."),
  q2_retail_product_visibility: entry("audience", "neutral", "keep", "not_needed"),
  q2_retail_customer_capture: entry("customer", "neutral", "keep", "not_needed"),
  q2_retail_promotions: entry("customer", "neutral", "copy_refinement", "recommended", "Sujeto ambiguo entre clientes y gente en la tienda."),
  q2_hospitality_flow_type: entry("customer", "neutral", "copy_refinement", "not_needed", "La pista visible describía el enrutamiento, no cómo responder."),
  q2_hospitality_reservation_noshow: entry("customer", "neutral", "copy_refinement", "not_needed", "La pista comparaba con citas médicas y confundía."),
  q2_hospitality_peak_capacity: entry("customer", "neutral", "keep", "not_needed"),
  q2_hospitality_delivery_takeaway: entry("business", "neutral", "keep", "recommended"),
  // Servicio a domicilio
  q2_service_area_clarity: entry("business", "neutral", "answer_refinement", "not_needed", "La opción de incertidumbre decía «No lo he definido» (un hecho); presuponía servicios ya prestados."),
  q2_service_response_speed: entry("inquiry", "neutral", "copy_refinement", "not_needed", "«Consulta» como primer contacto se sustituye por una descripción explícita."),
  q2_service_quote_practice: entry("business", "neutral", "keep", "not_needed"),
  q2_service_quote_followup: entry("opportunity", "neutral", "keep", "not_needed"),
  q2_service_repeat_referral: entry("repeat_customer", "neutral", "copy_refinement", "recommended", "«Referidos» es jerga; ahora «recomendaciones»."),
  // Citas
  q2_appointments_noshow: entry("customer", "variant", "context_variant_needed", "not_needed", "«Pacientes» aplicaba a todo bienestar; ahora solo a práctica clínica."),
  q2_appointments_booking_method: entry("inquiry", "variant", "answer_refinement", "required", "«Lo agendamos manualmente» y «por llamada o mensaje» describían lo mismo con estados distintos."),
  q2_appointments_booking_friction: entry("inquiry", "neutral", "copy_refinement", "not_needed", "Redacción regional («cuesta trabajo», «yendo y viniendo»)."),
  q2_appointments_confirmation_reminders: entry("customer", "variant", "context_variant_needed", "not_needed", "«Pacientes» aplicaba a todo bienestar; ahora solo a práctica clínica."),
  q2_appointments_lead_to_booking: entry("interested", "neutral", "help_needed", "required", "Proporción sin ayuda ni pista de estimación; etiquetas distintas a la pregunta equivalente de conversión."),
  q2_appointments_rebooking: entry("repeat_customer", "variant", "copy_refinement", "not_needed", "La pista visible era una nota interna con un código de deuda."),
  // Profesional
  q2_professional_authority_signals: entry("audience", "variant", "context_variant_needed", "required", "«Experiencia o credenciales» presuponía una profesión, pero es evidencia material para comercio, B2B, creator y organizaciones."),
  q2_professional_intake_flow: entry("interested", "variant", "context_variant_needed", "recommended", "«Cliente» en práctica clínica."),
  q2_professional_referral_dependency: entry("customer", "variant", "copy_refinement", "required", "La pista afirmaba que ninguna respuesta es mejor o peor, en contradicción con la lectura de dependencia."),
  q2_professional_followup_after_consult: entry("opportunity", "neutral", "keep", "not_needed"),
  // Ecommerce
  q2_ecommerce_traffic_sources: entry("audience", "neutral", "semantic_mismatch", "required", "«Principalmente» invitaba a marcar una sola fuente, que la semántica lee como dependencia de un canal. Faltaban fuentes habituales (resuelto en DIAG-V3-08F.1: marketplaces, correo, visitas directas y «otra», versión 2)."),
  q2_ecommerce_product_discovery: entry("audience", "variant", "context_variant_needed", "recommended", "Antes del lanzamiento puede no existir tienda: la única salida era «no lo he probado como cliente nuevo»."),
  q2_ecommerce_checkout_friction: entry("interested", "neutral", "keep", "recommended"),
  q2_ecommerce_cart_visibility: entry("interested", "neutral", "copy_refinement", "not_needed", "Sujeto técnico («tu tienda puede identificar»)."),
  q2_ecommerce_cart_followup: entry("interested", "neutral", "keep", "not_needed"),
  q2_ecommerce_repeat_purchase: entry("repeat_customer", "neutral", "keep", "recommended"),
  q2_ecommerce_acquisition_dependency: entry("audience", "neutral", "copy_refinement", "recommended", "«Tráfico» es jerga."),
  // B2B
  q2_b2b_pipeline: entry("opportunity", "neutral", "keep", "recommended"),
  q2_b2b_lead_source: entry("opportunity", "neutral", "copy_refinement", "recommended", "«Alianzas» sin sujeto."),
  q2_b2b_qualification: entry("interested", "neutral", "answer_refinement", "not_needed", "«Trato todo por igual» sonaba a una virtud y podía atraer respuestas por deseabilidad."),
  q2_b2b_status_visibility: entry("opportunity", "neutral", "answer_refinement", "not_needed", "«Claridad total» era un extremo que empujaba a la opción intermedia; la pista remitía a otra pregunta."),
  q2_b2b_sales_cycle: entry("opportunity", "neutral", "keep", "recommended"),
  q2_b2b_decision_makers: entry("opportunity", "neutral", "keep", "not_needed"),
  // Creator
  q2_creator_channel_concentration: entry("audience", "neutral", "keep", "recommended"),
  q2_creator_audience_ownership: entry("audience", "neutral", "keep", "not_needed"),
  q2_creator_content_consistency: entry("audience", "neutral", "keep", "not_needed"),
  q2_creator_monetization_model: entry("business", "neutral", "keep", "not_needed"),
  q2_creator_conversion: entry("audience", "neutral", "keep", "not_needed"),
  // Nonprofit
  q2_nonprofit_support_type: entry("business", "neutral", "copy_refinement", "not_needed", "La pista visible describía el enrutamiento, no cómo responder."),
  q2_nonprofit_donation_clarity: entry("interested", "neutral", "copy_refinement", "recommended", "«Apoyarte» personalizaba a la organización."),
  q2_nonprofit_membership_lifecycle: entry("customer", "neutral", "keep", "recommended"),
  q2_nonprofit_participation: entry("customer", "neutral", "keep", "not_needed"),
  // Operación
  q2_operations_process_ownership: entry("operation", "neutral", "copy_refinement", "not_needed", "«Del negocio» excluía organizaciones."),
  q2_operations_handoffs: entry("operation", "neutral", "copy_refinement", "not_needed", "Pregunta larga con «cliente» como único ejemplo."),
  q2_operations_bottleneck: entry("operation", "neutral", "copy_refinement", "not_needed", "«Trabajo o clientes» y «cuello de botella» (jerga)."),
  q2_operations_manual_impact: entry("operation", "neutral", "help_needed", "recommended", "Tres ejemplos (tiempo, errores, capacidad) para un solo juicio: se aclara que las opciones miden la intensidad."),
  q2_operations_dependency: entry("operation", "neutral", "copy_refinement", "not_needed", "«El negocio» excluía organizaciones."),
  q2_operations_information_base: entry("operation", "neutral", "copy_refinement", "required", "«Dónde vive la información de tus clientes» (jerga, excluía organizaciones)."),
  q2_operations_automation_adoption: entry("operation", "neutral", "keep", "required"),
  // Seguimiento
  q2_followup_general_process: entry("inquiry", "neutral", "copy_refinement", "required", "«Tu negocio» excluía organizaciones."),
  q2_followup_ownership: entry("inquiry", "neutral", "keep", "not_needed"),
  q2_followup_status_visibility: entry("operation", "neutral", "keep", "recommended"),
  // Medición
  q2_measurement_source_confidence: entry("customer", "variant", "context_variant_needed", "required", "«Te compra o se convierte en cliente» no encajaba en organizaciones ni en salud; la pista remitía a otra pregunta."),
  q2_measurement_outcome_tracking: entry("interested", "variant", "answer_refinement", "required", "«No tengo idea» y la opción de incertidumbre significaban lo mismo con estados distintos; «consultas» en salud."),
  q2_measurement_decision_review: entry("operation", "neutral", "keep", "recommended"),
  // Pre-lanzamiento
  q2_startup_problem_clarity: entry("business", "neutral", "keep", "not_needed"),
  q2_startup_validation_evidence: entry("audience", "neutral", "help_needed", "recommended", "Niveles de aprendizaje sin ayuda; la pista remitía a otra pregunta."),
  q2_startup_offer_readiness: entry("business", "neutral", "keep", "recommended"),
  q2_startup_demand_signal: entry("interested", "neutral", "help_needed", "recommended", "Interés frente a acción concreta necesitaba ayuda."),
  q2_startup_first_channel: entry("audience", "neutral", "copy_refinement", "not_needed", "«Acceso al público» es jerga."),
  q2_startup_next_milestone: entry("business", "variant", "context_variant_needed", "not_needed", "«Primer cliente» en un proyecto sin fines de lucro ya en marcha."),
  // Transversales
  q2_conversion_interest_to_action: entry("interested", "variant", "context_variant_needed", "required", "«Cotización» y «comprando o contratando» no encajaban en tienda, B2B, hospitalidad ni salud."),
  q2_presence_offer_clarity: entry("audience", "variant", "answer_refinement", "required", "Las opciones («qué ofrezco… elegirme») contradecían la variante para organizaciones."),
  q2_presence_digital_base: entry("audience", "neutral", "copy_refinement", "required", "«Perfil de negocio» excluía organizaciones."),
};

// ── Contrato de lenguaje de resultados (preparación de 08G) ─────────────────

/** Tres niveles de certeza del lenguaje de resultado, alineados con los Semantic Facts. */
export const RESULT_CERTAINTY_LEVELS = ["confirmed", "probable", "unknown"] as const;
export type ResultCertainty = (typeof RESULT_CERTAINTY_LEVELS)[number];

/** Marco de cada nivel: con qué empieza una afirmación y qué no puede decir. */
export const RESULT_CERTAINTY_FRAMES: Readonly<Record<ResultCertainty, { readonly lead: string; readonly rule: string }>> = {
  confirmed: { lead: "Tu negocio muestra…", rule: "Evidencia suficiente: puede afirmarse en presente, sin exagerar la magnitud." },
  probable: { lead: "Hay señales de que…", rule: "Evidencia provisional: nunca en tono de certeza ni con cifras." },
  unknown: { lead: "No hay suficiente información para determinar…", rule: "Sin lectura: nunca se presenta como debilidad ni como fortaleza." },
};

export const RESULT_CATEGORIES = ["positive_capability", "partial_capability", "constraint", "dependency", "leakage", "uncertainty", "evidence_gap", "priority"] as const;
export type ResultCategory = (typeof RESULT_CATEGORIES)[number];

/** Expresiones preferidas por categoría y certeza (fragmentos, no párrafos). `unknown` nunca afirma capacidad. */
export const RESULT_VOCABULARY: Readonly<Record<ResultCategory, Readonly<Record<ResultCertainty, readonly string[]>>>> = {
  positive_capability: { confirmed: ["funciona bien", "es una fortaleza", "está bien resuelto"], probable: ["hay señales de que funciona", "parece una fortaleza"], unknown: ["no hay suficiente información para confirmar si funciona"] },
  partial_capability: { confirmed: ["funciona en parte", "hay una base, pero no es constante"], probable: ["hay señales de que funciona solo en parte"], unknown: ["no hay suficiente información para saber hasta qué punto funciona"] },
  constraint: { confirmed: ["hay una oportunidad de mejora clara", "es el punto que más limita"], probable: ["hay señales de que esto limita"], unknown: ["no hay suficiente información para saber si esto limita"] },
  dependency: { confirmed: ["depende demasiado de", "se apoya en un solo"], probable: ["hay señales de dependencia de"], unknown: ["no hay suficiente información para saber de qué depende"] },
  leakage: { confirmed: ["parte del interés no avanza", "se observan pérdidas en"], probable: ["se observan señales de pérdida en"], unknown: ["no hay suficiente información para saber si se pierde interés"] },
  uncertainty: { confirmed: ["las respuestas apuntan en direcciones distintas"], probable: ["hay señales mixtas"], unknown: ["no estabas seguro de esta respuesta"] },
  evidence_gap: { confirmed: ["falta evidencia para evaluar"], probable: ["la evidencia es insuficiente"], unknown: ["no hay evidencia suficiente", "conviene verificarlo antes de actuar"] },
  priority: { confirmed: ["lo primero a trabajar es", "conviene empezar por"], probable: ["probablemente convenga empezar por"], unknown: ["antes de actuar, conviene verificar"] },
};

/** Expresiones prohibidas en cualquier certeza: juzgan a la persona en lugar de describir evidencia. */
export const HARSH_RESULT_PHRASES = ["está mal", "estás perdiendo clientes", "no sabes", "tu estrategia falla", "fracaso", "error grave", "desastre", "inútil"] as const;

/** Códigos de lectura que describen interés o relaciones que no avanzan (pérdida), no una capacidad ausente. */
const LEAKAGE_CODES: ReadonlySet<string> = new Set(["interest_not_converting", "follow_up_leakage"]);

export function resultCategory(fact: SemanticFact): ResultCategory {
  switch (fact.type) {
    case "strength": return "positive_capability";
    case "partial": return "partial_capability";
    case "weakness": return LEAKAGE_CODES.has(fact.semanticCode) ? "leakage" : "constraint";
    case "dependency": case "risk": return "dependency";
    case "contradiction": case "uncertainty": return "uncertainty";
    case "evidence_gap": return "evidence_gap";
    case "priority": return "priority";
  }
}

/** Certeza del lenguaje: la de la lectura, la accionabilidad de la prioridad o la confianza; huecos e incertidumbre nunca afirman. */
export function resultCertainty(fact: SemanticFact): ResultCertainty {
  if (fact.type === "evidence_gap" || fact.type === "uncertainty") return "unknown";
  if (fact.type === "priority") return fact.priority?.actionability === "actionable" ? "confirmed" : fact.priority?.actionability === "likely" ? "probable" : "unknown";
  if (fact.type === "contradiction") return "probable";
  if (fact.certainty) return fact.certainty === "confirmed" ? "confirmed" : "probable";
  return fact.confidence === "high" || fact.confidence === "medium" ? "confirmed" : "probable";
}

/** Etapas de las preguntas que sostienen un hecho: el resultado solo puede hablar de esas etapas. */
export function factSubjectStages(fact: SemanticFact): readonly SubjectStage[] {
  return [...new Set(fact.provenance.questionIds.map((id) => QUESTION_LANGUAGE[id]?.stage).filter((stage): stage is SubjectStage => stage !== undefined))];
}

/**
 * Continuidad de etapa: un resultado puede nombrar una etapa del ciclo de vida solo si alguna pregunta de su
 * procedencia observó esa etapa o una posterior. Interés que no avanza nunca se describe como «clientes
 * perdidos» sin evidencia observada en etapa de cliente.
 */
export function canClaimStage(fact: SemanticFact, stage: SubjectStage): boolean {
  const target = LIFECYCLE_ORDER[stage];
  if (target === undefined) return true;
  return factSubjectStages(fact).some((observed) => (LIFECYCLE_ORDER[observed] ?? 0) >= target);
}

/** Sujeto con el que el resultado nombra un hecho: la etapa de ciclo de vida más avanzada que observó su evidencia. */
export function resultSubject(fact: SemanticFact, profile: TerminologyProfileId): { readonly stage: SubjectStage; readonly term: string } | undefined {
  const lifecycle = factSubjectStages(fact).filter((stage) => LIFECYCLE_ORDER[stage] !== undefined).sort((a, b) => LIFECYCLE_ORDER[b]! - LIFECYCLE_ORDER[a]!);
  const stage = lifecycle[0] ?? factSubjectStages(fact)[0];
  return stage ? { stage, term: resolveTerm(STAGE_TERM[stage], profile) } : undefined;
}

/** Concepto de resultado por dimensión, en lenguaje de negocio (sin jerga), para que 08G no improvise términos. */
export const DIMENSION_RESULT_CONCEPT: Readonly<Record<DigitalDimensionId, string>> = {
  clarity_positioning: "qué tan claro se entiende lo que ofreces",
  digital_foundation: "la base digital propia",
  discovery: "cómo te encuentran",
  trust_reputation: "las pruebas visibles de confianza",
  conversion_access: "cuánto del interés se concreta",
  relationship_recurrence: "el seguimiento y la relación con quien ya te conoce",
  measurement_optimization: "qué tanto sabes de lo que funciona",
  digital_readiness: "la base de trabajo para ordenar y automatizar",
};
