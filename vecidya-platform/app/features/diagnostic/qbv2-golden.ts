import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { contextEquals, eqV2 } from "./qbv2-rules";

/**
 * Banco semilla ("golden questions", §40-41 de DIAG-V3-08B.2): 14 preguntas, NO el banco de 100-150 de
 * DIAG-V3-08B.3. Suficientes para demostrar la arquitectura de extremo a extremo (una de cada patrón:
 * anchor, classification, maturity, friction, specializada por archetype con applicability de CONTEXTO,
 * applicability de RESPUESTA, multi-choice, `unknown`, `not_applicable` legítimo, copy variant,
 * producción de señal, y un hook de confirmación/contradicción) — no cobertura de industrias.
 */
export const GOLDEN_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_entity",
    version: 1,
    module: "core",
    type: "single",
    prompt: "¿Quién responde este diagnóstico?",
    purpose: ["anchor", "classification"],
    priority: "critical",
    options: [
      { value: "individual", label: "Yo, de forma independiente", produces: [{ kind: "entity", value: "individual", provenance: "explicit_declaration" }] },
      { value: "business", label: "Un negocio establecido", produces: [{ kind: "entity", value: "business", provenance: "explicit_declaration" }] },
      { value: "organization", label: "Una organización sin fines de lucro", produces: [{ kind: "entity", value: "organization", provenance: "explicit_declaration" }] },
      { value: "project", label: "Un proyecto o idea todavía sin operar", produces: [{ kind: "entity", value: "project", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_other_staff",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿Tienes a alguien más trabajando contigo de forma continua (empleado o colaborador pagado)?",
    helper: "No cuenta un ayudante ocasional para un encargo puntual.",
    purpose: ["classification"],
    priority: "high",
    // Applicability de RESPUESTA (§21, §67 "answer applicability"): depende de otra respuesta, no de contexto.
    appliesWhen: eqV2("q2_entity", "individual"),
    options: [
      { value: "yes", label: "Sí, de forma continua", produces: [{ kind: "hasOtherPaidStaff", value: true, provenance: "explicit_declaration" }] },
      { value: "no", label: "No, trabajo solo", produces: [{ kind: "hasOtherPaidStaff", value: false, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_monetization",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿De dónde sale principalmente tu ingreso?",
    purpose: ["classification"],
    priority: "critical",
    options: [
      { value: "time_or_project", label: "Cobro por mi tiempo o por proyecto", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "time_or_project_work", provenance: "explicit_declaration" }] },
      { value: "goods", label: "Vendo productos o mercancía", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "goods_for_resale", provenance: "explicit_declaration" }] },
      { value: "licensed", label: "Ejerzo una profesión que requiere licencia (legal, contable, médica)", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "licensed_practice", provenance: "explicit_declaration" }] },
      { value: "commission", label: "Cobro comisión por conectar o cerrar una transacción de terceros", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "commission_or_referral", provenance: "explicit_declaration" }] },
      { value: "audience", label: "Monetizo mi propia audiencia/contenido", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "own_audience_monetization", provenance: "explicit_declaration" }] },
      { value: "recurring", label: "Cobro acceso recurrente (membresía, suscripción)", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "recurring_access", provenance: "explicit_declaration" }] },
      { value: "mission", label: "No busco ganancia; nos sostiene una misión (donaciones, etc.)", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "mission_funded", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_delivery",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿Cómo se entrega principalmente lo que ofreces a tus clientes?",
    purpose: ["classification"],
    priority: "critical",
    options: [
      { value: "fixed_no_inventory", label: "En un local físico, sin inventario de reventa", produces: [{ kind: "deliveryMode", slot: "primary", value: "fixed_location_no_inventory", provenance: "explicit_declaration" }] },
      { value: "scheduled", label: "En citas agendadas, con varios proveedores/recursos", produces: [{ kind: "deliveryMode", slot: "primary", value: "scheduled_time_blocks", provenance: "explicit_declaration" }] },
      { value: "travels", label: "Yo me desplazo a atender al cliente", produces: [{ kind: "deliveryMode", slot: "primary", value: "travels_to_customer", provenance: "explicit_declaration" }] },
      { value: "solo_practice", label: "Soy el único profesional, sin colega en el mismo servicio", produces: [{ kind: "deliveryMode", slot: "primary", value: "specialized_individual_practice", provenance: "explicit_declaration" }] },
      { value: "online_checkout", label: "El cliente compra en línea (checkout)", produces: [{ kind: "deliveryMode", slot: "primary", value: "online_checkout", provenance: "explicit_declaration" }] },
      { value: "fixed_with_inventory", label: "En un local físico, con inventario/exhibición", produces: [{ kind: "deliveryMode", slot: "primary", value: "fixed_location_with_inventory", provenance: "explicit_declaration" }] },
      { value: "onsite", label: "El cliente consume/permanece en el lugar", produces: [{ kind: "deliveryMode", slot: "primary", value: "onsite_consumption", provenance: "explicit_declaration" }] },
      { value: "b2b_pipeline", label: "Vendo a otras empresas, con un proceso de decisión propio", produces: [{ kind: "deliveryMode", slot: "primary", value: "b2b_sales_pipeline", provenance: "explicit_declaration" }] },
      { value: "audience_content", label: "Mi audiencia/contenido propio es el canal", produces: [{ kind: "deliveryMode", slot: "primary", value: "own_audience_content", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_has_customers",
    version: 1,
    module: "maturity",
    type: "single",
    prompt: "¿Ya tienes clientes o transacciones reales?",
    purpose: ["anchor", "maturity"],
    priority: "critical",
    options: [
      { value: "yes", label: "Sí", produces: [{ kind: "hasRealCustomers", value: true, provenance: "explicit_declaration" }] },
      { value: "no", label: "Todavía no", produces: [{ kind: "hasRealCustomers", value: false, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_regularity",
    version: 1,
    module: "maturity",
    type: "single",
    prompt: "¿Con qué regularidad ocurre esa actividad?",
    purpose: ["maturity"],
    priority: "high",
    appliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "irregular", label: "De forma ocasional", produces: [{ kind: "operatingRegularity", value: "irregular", provenance: "observed_fact" }] },
      { value: "regular", label: "De forma regular y repetible", produces: [{ kind: "operatingRegularity", value: "regular", provenance: "observed_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_demand_trend",
    version: 1,
    module: "maturity",
    type: "single",
    prompt: "En los últimos meses, ¿la cantidad de clientes/pedidos ha...?",
    purpose: ["maturity"],
    priority: "normal",
    // Applicability de RESPUESTA otra vez, encadenada (§67): solo tiene sentido si ya es "regular".
    appliesWhen: eqV2("q2_regularity", "regular"),
    options: [
      { value: "increasing", label: "Aumentado de forma sostenida", produces: [{ kind: "demandTrend", value: "increasing_observed", provenance: "observed_fact" }] },
      { value: "flat", label: "Mantenido más o menos igual", produces: [{ kind: "demandTrend", value: "flat_or_unknown", provenance: "observed_fact" }] },
      { value: "decreasing", label: "Disminuido", produces: [{ kind: "demandTrend", value: "decreasing_observed", provenance: "observed_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_goal",
    version: 1,
    module: "goal_friction",
    type: "single",
    prompt: "¿Qué te gustaría lograr primero?",
    purpose: ["anchor", "goal"],
    priority: "critical",
    options: [
      { value: "be_found", label: "Que más personas me encuentren", produces: [{ kind: "goal", value: "be_found", provenance: "explicit_declaration" }] },
      { value: "opportunities", label: "Recibir más oportunidades", produces: [{ kind: "goal", value: "opportunities", provenance: "explicit_declaration" }] },
      { value: "measure", label: "Medir y entender qué funciona", produces: [{ kind: "goal", value: "measure", provenance: "explicit_declaration" }] },
      { value: "unsure", label: "Todavía no lo sé", kind: "unknown", produces: [{ kind: "goalUnknown", value: true, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_friction",
    version: 1,
    module: "goal_friction",
    type: "single",
    prompt: "¿Qué es lo que más te está bloqueando ahora mismo?",
    purpose: ["anchor", "friction"],
    priority: "critical",
    options: [
      { value: "visibility", label: "Nadie me encuentra", produces: [{ kind: "friction", value: "visibility", provenance: "explicit_declaration" }] },
      { value: "trust", label: "Me encuentran pero dudan", produces: [{ kind: "friction", value: "trust", provenance: "explicit_declaration" }] },
      { value: "conversion", label: "Llegan consultas pero no cierro", produces: [{ kind: "friction", value: "conversion", provenance: "explicit_declaration" }] },
      { value: "follow_up", label: "Se me pierden las consultas", produces: [{ kind: "friction", value: "follow_up", provenance: "explicit_declaration" }] },
      { value: "operations", label: "Estoy desorganizado internamente", produces: [{ kind: "friction", value: "operations", provenance: "explicit_declaration" }] },
      { value: "scale", label: "No doy abasto con la demanda", produces: [{ kind: "friction", value: "scale", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_appointments_noshow",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Qué tan seguido tus clientes no llegan a su cita (no-show)?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Applicability de CONTEXTO (§21, §67 "specialized appointment"): depende del archetype YA resuelto, no de una respuesta directa.
    appliesWhen: contextEquals("archetype", "appointments"),
    variants: [{ target: { nicheGroup: "health_wellness" }, prompt: "¿Qué tan seguido los pacientes no llegan a su cita (no-show)?" }],
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_ecommerce_traffic_sources",
    version: 1,
    module: "ecommerce",
    type: "multi",
    prompt: "¿De dónde llegan principalmente tus visitas o pedidos?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: contextEquals("archetype", "ecommerce"),
    options: [
      { value: "social", label: "Redes sociales" },
      { value: "search", label: "Buscadores" },
      { value: "ads", label: "Anuncios pagados" },
      { value: "referral", label: "Referidos" },
      { value: "unknown", label: "No sé de dónde llegan", kind: "unknown", exclusive: true },
    ],
    // Pregunta puramente diagnóstica: sin candidateDimensions todavía a propósito (no anticipar pesos de 08C, §31), amparada por purpose "diagnostic" ante el validador de huérfanas.
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_b2b_pipeline",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "¿Tienes un proceso definido para dar seguimiento a oportunidades de venta?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: contextEquals("archetype", "b2b"),
    options: [
      { value: "yes", label: "Sí, definido y consistente" },
      { value: "no", label: "No, es ad hoc", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_local_foot_traffic",
    version: 1,
    module: "local",
    type: "single",
    prompt: "¿Qué tanto depende tu negocio de gente que pasa cerca y entra sin planearlo?",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: contextEquals("archetype", "local"),
    options: [
      { value: "high", label: "Mucho" },
      { value: "low", label: "Poco" },
      // N/A legítimo (§18, §41): un negocio local 100% por membresía/agenda propia no depende de tráfico peatonal en absoluto.
      { value: "not_applicable", label: "No aplica: mis clientes llegan por membresía/agenda, no por tráfico", kind: "not_applicable" },
    ],
    // Idem: diagnóstica pura, sin candidateDimensions prematura.
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: true },
  },
  {
    id: "q2_confirm_hybrid_friction",
    version: 1,
    module: "confirmation",
    type: "single",
    prompt: "Como combinas dos formas distintas de generar ingresos, ¿cuál de las dos te preocupa más ahora mismo?",
    purpose: ["confirmation", "friction"],
    priority: "refinement",
    // NOTA (corregida tras revisión de dominio independiente): esto NO es una confirmación genuina de
    // ambigüedad — dispara sobre un HECHO ya resuelto (`businessModel: hybrid`), no sobre su propia
    // incertidumbre. Una confirmación real ("resuelve tú mismo el campo que está unresolved") es
    // estructuralmente imposible bajo este motor sin un mecanismo nuevo (la propia respuesta de
    // confirmación se auto-elimina en la primera iteración, ver `qbv2-engine.ts`); ese mecanismo es
    // DIAG-V3-08B.5. Esta pregunta demuestra únicamente la FORMA del dato `contradictionRole`/purpose
    // "confirmation" — una pregunta especializada de refinamiento gateada en un hecho ya resuelto,
    // honesta sobre lo que realmente decide: a cuál de los dos modelos de negocio hybrid se atribuye la
    // fricción principal (targetField refleja eso, no una alteración de BusinessModel, que nunca toca).
    appliesWhen: contextEquals("businessModel", "hybrid"),
    contradictionRole: { type: "confirms", targetField: "primaryFriction", note: "Decide a cuál de los dos modelos de negocio hybrid se atribuye la fricción principal; no resuelve ni altera BusinessModel, que ya llega resuelto como hybrid." },
    options: [
      { value: "primary", label: "La primera", produces: [{ kind: "friction", value: "scale", provenance: "derived_fact" }] },
      { value: "secondary", label: "La segunda", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
] as const;

export type QuestionIdV2 = (typeof GOLDEN_QUESTIONS_V2)[number]["id"];
