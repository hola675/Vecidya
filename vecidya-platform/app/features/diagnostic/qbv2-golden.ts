import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, archetypeIncludesAny, contextEquals, eqV2, notEqV2 } from "./qbv2-rules";

/**
 * Banco semilla ("golden questions", §40-41 de DIAG-V3-08B.2): 15 preguntas, NO el banco de 100-150 de
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
    // DIAG-V3-08F: la pregunta anterior ("¿Quién responde…?") no coincidía con sus opciones, que describen QUÉ
    // se diagnostica. Mismos valores y señales.
    prompt: "¿Qué describe mejor lo que vas a diagnosticar?",
    hint: "Si trabajas por tu cuenta, elige la primera opción aunque uses un nombre comercial.",
    purpose: ["anchor", "classification"],
    priority: "critical",
    options: [
      { value: "individual", label: "Mi trabajo como profesional o persona independiente", produces: [{ kind: "entity", value: "individual", provenance: "explicit_declaration" }] },
      { value: "business", label: "Un negocio en funcionamiento", produces: [{ kind: "entity", value: "business", provenance: "explicit_declaration" }] },
      { value: "organization", label: "Una organización sin fines de lucro o comunidad", produces: [{ kind: "entity", value: "organization", provenance: "explicit_declaration" }] },
      { value: "project", label: "Un proyecto o idea que todavía no está en marcha", produces: [{ kind: "entity", value: "project", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_other_staff",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "¿Tienes a alguien más trabajando contigo de forma continua (empleado o colaborador pagado)?",
    hint: "No cuenta un ayudante ocasional para un encargo puntual.",
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
    // DIAG-V3-08F: etiquetas como sustantivos, válidas en presente y antes del lanzamiento ("es o será").
    prompt: "¿Cuál es (o será) tu principal fuente de ingresos?",
    hint: "Si tienes varias, elige la que más pesa o pesará en tus ingresos.",
    purpose: ["classification"],
    priority: "critical",
    options: [
      { value: "time_or_project", label: "Cobro por tiempo o por proyecto", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "time_or_project_work", provenance: "explicit_declaration" }] },
      { value: "goods", label: "Venta de productos o mercancía", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "goods_for_resale", provenance: "explicit_declaration" }] },
      { value: "licensed", label: "Ejercicio de una profesión con licencia (legal, contable, médica u otra)", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "licensed_practice", provenance: "explicit_declaration" }] },
      { value: "commission", label: "Comisiones por conectar o cerrar operaciones de terceros", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "commission_or_referral", provenance: "explicit_declaration" }] },
      { value: "audience", label: "Ingresos que genera mi audiencia o mi contenido", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "own_audience_monetization", provenance: "explicit_declaration" }] },
      { value: "recurring", label: "Cuotas recurrentes (membresía o suscripción)", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "recurring_access", provenance: "explicit_declaration" }] },
      { value: "mission", label: "Sin fines de lucro: nos sostienen donaciones, fondos u otros apoyos", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "mission_funded", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_delivery",
    version: 1,
    module: "classification",
    type: "single",
    // DIAG-V3-08F: etiquetas sin jerga ("inventario de reventa", "proveedores/recursos", "proceso de pago").
    prompt: "¿Cómo se entrega principalmente lo que ofreces?",
    hint: "Elige la forma más habitual, aunque a veces uses otras.",
    purpose: ["classification"],
    priority: "critical",
    options: [
      { value: "fixed_no_inventory", label: "En un local al que viene la gente, sin vender productos en exhibición", produces: [{ kind: "deliveryMode", slot: "primary", value: "fixed_location_no_inventory", provenance: "explicit_declaration" }] },
      { value: "scheduled", label: "Con citas agendadas, entre varias personas o espacios", produces: [{ kind: "deliveryMode", slot: "primary", value: "scheduled_time_blocks", provenance: "explicit_declaration" }] },
      { value: "travels", label: "Voy a donde está el cliente (domicilio, obra o empresa)", produces: [{ kind: "deliveryMode", slot: "primary", value: "travels_to_customer", provenance: "explicit_declaration" }] },
      { value: "solo_practice", label: "Atiendo yo como profesional, sin otro colega que haga lo mismo", produces: [{ kind: "deliveryMode", slot: "primary", value: "specialized_individual_practice", provenance: "explicit_declaration" }] },
      { value: "online_checkout", label: "El cliente compra y paga en línea", produces: [{ kind: "deliveryMode", slot: "primary", value: "online_checkout", provenance: "explicit_declaration" }] },
      { value: "fixed_with_inventory", label: "En una tienda física con productos en exhibición", produces: [{ kind: "deliveryMode", slot: "primary", value: "fixed_location_with_inventory", provenance: "explicit_declaration" }] },
      { value: "onsite", label: "La gente consume o se hospeda en el lugar (restaurante, café, hotel)", produces: [{ kind: "deliveryMode", slot: "primary", value: "onsite_consumption", provenance: "explicit_declaration" }] },
      { value: "b2b_pipeline", label: "Vendo a otras empresas, que deciden con su propio proceso", produces: [{ kind: "deliveryMode", slot: "primary", value: "b2b_sales_pipeline", provenance: "explicit_declaration" }] },
      { value: "audience_content", label: "A través de mi contenido y mi audiencia (redes, canal, comunidad)", produces: [{ kind: "deliveryMode", slot: "primary", value: "own_audience_content", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
    helpIntent: {
      understand: "La forma principal en que lo que ofreces llega a quien lo recibe.",
      distinction: "Elige cómo ocurre la mayoría de las veces, no cómo te gustaría que fuera.",
      why: "Una tienda en línea, un servicio con citas y un servicio a domicilio se revisan con preguntas distintas.",
    },
  },
  {
    id: "q2_has_customers",
    version: 1,
    module: "maturity",
    type: "single",
    // DIAG-V3-08F: puede preguntarse antes de saber si es una organización o un proyecto; el copy cubre a quien
    // compra, contrata, se atiende o apoya, y separa interés de actividad real (etapa de ciclo de vida).
    prompt: "¿Ya tienes clientes reales, o personas que compran, usan o apoyan lo que ofreces?",
    hint: "Cuenta solo actividad real, aunque sea poca; el interés sin un primer paso todavía no cuenta.",
    purpose: ["anchor", "maturity"],
    priority: "critical",
    variants: [{ target: { terminology: ["nonprofit"] }, prompt: "¿Tu organización ya atiende a personas o recibe apoyo de forma real?" }],
    options: [
      { value: "yes", label: "Sí, ya hay actividad real", produces: [{ kind: "hasRealCustomers", value: true, provenance: "explicit_declaration" }] },
      { value: "no", label: "Todavía no: es una idea o está en preparación", produces: [{ kind: "hasRealCustomers", value: false, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si ya existe actividad real con las personas a las que se dirige lo que ofreces.",
      distinction: "Seguidores o personas interesadas todavía no cuentan; sí cuenta quien ya dio un primer paso real (una compra, una cita, una donación).",
      why: "Define si el diagnóstico revisa una operación en marcha o la preparación de un lanzamiento.",
    },
  },
  {
    id: "q2_regularity",
    version: 1,
    module: "maturity",
    type: "single",
    // DIAG-V3-08F: "esa actividad" dependía de que la pregunta anterior fuera q2_has_customers; el planner no lo garantiza.
    prompt: "¿Con qué regularidad tienes actividad con clientes (ventas, servicios, citas o pedidos)?",
    purpose: ["maturity"],
    priority: "high",
    appliesWhen: eqV2("q2_has_customers", "yes"),
    variants: [{ target: { terminology: ["nonprofit"] }, prompt: "¿Con qué regularidad tiene actividad tu organización con las personas que atiende o que la apoyan?" }],
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
    prompt: "En los últimos meses, ¿cómo ha cambiado la cantidad de clientes o pedidos?",
    purpose: ["maturity"],
    priority: "normal",
    // Applicability de RESPUESTA otra vez, encadenada (§67): solo tiene sentido si ya es "regular".
    appliesWhen: eqV2("q2_regularity", "regular"),
    variants: [
      { target: { terminology: ["nonprofit"] }, prompt: "En los últimos meses, ¿cómo ha cambiado la cantidad de personas que atiende o que apoyan tu organización?" },
      { target: { terminology: ["clinical"] }, prompt: "En los últimos meses, ¿cómo ha cambiado la cantidad de pacientes o citas?" },
    ],
    options: [
      { value: "increasing", label: "Ha aumentado de forma sostenida", produces: [{ kind: "demandTrend", value: "increasing_observed", provenance: "observed_fact" }] },
      { value: "flat", label: "Se ha mantenido más o menos igual", produces: [{ kind: "demandTrend", value: "flat_or_unknown", provenance: "observed_fact" }] },
      { value: "decreasing", label: "Ha disminuido", produces: [{ kind: "demandTrend", value: "decreasing_observed", provenance: "observed_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_goal",
    version: 1,
    module: "goal_friction",
    type: "single",
    prompt: "¿Qué te gustaría lograr primero?",
    hint: "Si varias aplican, elige la que más quieres mejorar ahora.",
    purpose: ["anchor", "goal"],
    priority: "critical",
    // DIAG-V3-08E.3: las 8 metas que razona el motor (`PRIMARY_GOALS`/`GOAL_RELEVANCE`) son declarables; antes
    // solo 3, y las otras 5 se trataban en silencio como meta no declarada. La meta es contexto, nunca capacidad.
    // DIAG-V3-08F: mismas 9 respuestas canónicas; solo cambian etiquetas visibles donde "consultas/clientes" no encaja.
    variants: [
      { target: { terminology: ["nonprofit"] }, optionLabels: { be_found: "Que más personas nos encuentren", opportunities: "Conseguir más apoyo, participación u oportunidades", explain: "Que se entienda mejor qué hacemos y a quién ayudamos", stop_losing: "Dejar de perder personas interesadas, apoyos o seguimientos" } },
      { target: { terminology: ["prelaunch"] }, optionLabels: { opportunities: "Conseguir las primeras personas interesadas o los primeros clientes", stop_losing: "Que no se pierdan las personas interesadas cuando empiece" } },
    ],
    options: [
      { value: "be_found", label: "Que más personas me encuentren", produces: [{ kind: "goal", value: "be_found", provenance: "explicit_declaration" }] },
      { value: "opportunities", label: "Recibir más consultas u oportunidades", produces: [{ kind: "goal", value: "opportunities", provenance: "explicit_declaration" }] },
      { value: "explain", label: "Que se entienda mejor qué hago y para quién", produces: [{ kind: "goal", value: "explain", provenance: "explicit_declaration" }] },
      { value: "trust", label: "Generar más confianza", produces: [{ kind: "goal", value: "trust", provenance: "explicit_declaration" }] },
      { value: "stop_losing", label: "Dejar de perder consultas, clientes o seguimientos", produces: [{ kind: "goal", value: "stop_losing", provenance: "explicit_declaration" }] },
      { value: "organize", label: "Ordenar contactos, tareas y procesos", produces: [{ kind: "goal", value: "organize", provenance: "explicit_declaration" }] },
      { value: "automate", label: "Reducir trabajo manual o repetitivo", produces: [{ kind: "goal", value: "automate", provenance: "explicit_declaration" }] },
      { value: "measure", label: "Medir y entender qué funciona", produces: [{ kind: "goal", value: "measure", provenance: "explicit_declaration" }] },
      { value: "unsure", label: "Todavía no lo sé", kind: "unknown", produces: [{ kind: "goalUnknown", value: true, provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Lo principal que la persona más quiere mejorar ahora mismo; orienta qué revisar primero y no suma puntos.",
      distinction: "Si varias aplican, elige la que más quieres mejorar ahora, no todo lo que te gustaría tener.",
      options: {
        be_found: "Que más personas adecuadas puedan encontrarte.",
        opportunities: "Que lleguen más oportunidades concretas: consultas, reservas, pedidos, donaciones u otras.",
        explain: "Que la gente entienda con facilidad qué se ofrece, para quién y por qué importa.",
        trust: "Ganar confianza, credibilidad, autoridad o reputación ante quien evalúa.",
        stop_losing: "Perder menos oportunidades o personas antes de concretar o por falta de seguimiento.",
        organize: "Dar orden y consistencia a cómo se gestionan contactos, tareas y la actividad digital.",
        automate: "Reducir el trabajo manual y repetitivo con herramientas adecuadas, si de verdad conviene.",
        measure: "Entender qué funciona y decidir mejor a partir de resultados.",
        unsure: "Aún no hay una prioridad clara; el diagnóstico no inventa una.",
      },
      why: "Orienta qué revisar primero; no cambia la evaluación de lo que ya funciona.",
    },
  },
  {
    id: "q2_friction",
    version: 1,
    module: "goal_friction",
    type: "single",
    // DIAG-V3-08F: sin jerga comercial ("cierro"), sin términos que cambian de significado por contexto ("consultas"
    // en salud) y sin hipérboles ("Nadie"). Mismos 6 valores y señales.
    prompt: "¿Qué es lo que más te está frenando ahora mismo?",
    hint: "Elige lo que más te frena hoy, aunque haya otras cosas por mejorar.",
    purpose: ["anchor", "friction"],
    priority: "critical",
    variants: [{
      target: { terminology: ["nonprofit"] },
      prompt: "¿Qué es lo que más está frenando a tu organización ahora mismo?",
      optionLabels: { visibility: "Pocas personas nos encuentran", trust: "Nos encuentran, pero dudan antes de apoyar o participar", follow_up: "Se nos pierden contactos o pendientes por falta de seguimiento", operations: "Nos falta orden interno (tareas, información o procesos)", scale: "Tenemos más demanda de la que podemos atender" },
    }],
    options: [
      { value: "visibility", label: "Pocas personas me encuentran", produces: [{ kind: "friction", value: "visibility", provenance: "explicit_declaration" }] },
      { value: "trust", label: "Me encuentran, pero dudan antes de decidirse", produces: [{ kind: "friction", value: "trust", provenance: "explicit_declaration" }] },
      { value: "conversion", label: "Hay interés, pero pocas veces se concreta", produces: [{ kind: "friction", value: "conversion", provenance: "explicit_declaration" }] },
      { value: "follow_up", label: "Se me pierden contactos o pendientes por falta de seguimiento", produces: [{ kind: "friction", value: "follow_up", provenance: "explicit_declaration" }] },
      { value: "operations", label: "Me falta orden interno (tareas, información o procesos)", produces: [{ kind: "friction", value: "operations", provenance: "explicit_declaration" }] },
      { value: "scale", label: "Tengo más demanda de la que puedo atender", produces: [{ kind: "friction", value: "scale", provenance: "explicit_declaration" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
    helpIntent: {
      understand: "El obstáculo que más pesa hoy, según tu experiencia.",
      distinction: "Elige el que más te frena ahora, no el que parece más grave en general.",
      why: "Indica dónde buscar evidencia primero; si las demás respuestas apuntan a otra cosa, el diagnóstico lo señala.",
    },
  },
  {
    id: "q2_appointments_noshow",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Qué tan seguido tus clientes faltan a su cita?",
    hint: "Piensa en las últimas semanas, no en un día aislado.",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Applicability de CONTEXTO (§21, §67 "specialized appointment"): depende del archetype YA resuelto, no de una respuesta directa.
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08F: "pacientes" solo en práctica clínica; antes aplicaba a todo health_wellness (gimnasios, spas…).
    variants: [{ target: { terminology: ["clinical"] }, prompt: "¿Qué tan seguido tus pacientes faltan a su cita?" }],
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_ecommerce_traffic_sources",
    // DIAG-V3-08F.1: versión 2 — se añaden marketplaces, correo, visitas directas y «otra». Las opciones previas
    // conservan valor y orden; `other` (fuente conocida no listada) es distinta de `unknown` (no sabe de dónde llegan).
    version: 2,
    module: "ecommerce",
    type: "multi",
    // DIAG-V3-08F (desalineación semántica corregida): "principalmente" invitaba a marcar una sola fuente, y una
    // sola fuente se lee como dependencia (`selectionCount`). El copy pide todas las fuentes habituales.
    prompt: "¿De qué fuentes te llegan visitas o pedidos de forma habitual?",
    hint: "Marca todas las que traen pedidos con regularidad, no solo la principal.",
    purpose: ["diagnostic"],
    priority: "normal",
    // DIAG-V3-08D.1: visitas o pedidos existentes; sin clientes todavía no hay origen que observar.
    appliesWhen: andV2(archetypeIncludes("ecommerce"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "social", label: "Redes sociales" },
      { value: "search", label: "Búsquedas en internet" },
      { value: "ads", label: "Anuncios pagados" },
      { value: "referral", label: "Recomendaciones de otras personas o sitios" },
      { value: "marketplace", label: "Plataformas de venta de terceros (marketplaces)" },
      { value: "email", label: "Correos o boletines a quienes ya te conocen" },
      { value: "direct", label: "Visitas directas de quien ya te conoce (vuelve por su cuenta o escribe tu dirección)" },
      { value: "other", label: "Otra fuente que no aparece aquí" },
      { value: "unknown", label: "No sé de dónde llegan", kind: "unknown", exclusive: true },
    ],
    // Pregunta puramente diagnóstica: sin candidateDimensions todavía a propósito (no anticipar pesos de 08C, §31), amparada por purpose "diagnostic" ante el validador de huérfanas.
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Qué fuentes traen visitas o pedidos de forma habitual.",
      distinction: "Marca cada fuente que aporta con regularidad; una que solo aportó una vez no cuenta. Si conoces la fuente pero no aparece, elige «Otra»; si no sabes de dónde llegan, «No sé».",
      why: "Muestra de qué depende hoy la llegada de pedidos y cuánto llega de personas nuevas frente a quienes ya te conocen.",
    },
  },
  {
    id: "q2_b2b_pipeline",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "¿Tienes un proceso definido para dar seguimiento a oportunidades de venta?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes", label: "Sí, definido y consistente" },
      { value: "no", label: "No, se hace de forma improvisada", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si existe un proceso definido para dar seguimiento a cada oportunidad de venta.", distinction: "Un proceso definido se repite igual cada vez; dar seguimiento cuando se puede no lo es.", why: "Cuando una venta requiere varios contactos, el seguimiento decide cuántas oportunidades avanzan." },
  },
  {
    id: "q2_local_foot_traffic",
    version: 1,
    module: "local",
    type: "single",
    // DIAG-V3-08F: sujeto explícito (quienes llegan al local) y sin "negocio": también aplica a organizaciones.
    prompt: "¿Qué parte de quienes llegan a tu local lo hace porque pasaba cerca, sin haberlo planeado?",
    purpose: ["diagnostic"],
    priority: "refinement",
    // Extendida a retail en DIAG-V3-08B.3 Lote C: una tienda física también depende de tráfico peatonal
    // sin planear, el mismo concepto que "local". No extendida a hospitality: q2_hospitality_flow_type
    // ya distingue walk-in de reserva/pedido con más precisión, así que sería redundante ahí.
    appliesWhen: andV2(archetypeIncludesAny(["local", "retail"]), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "high", label: "Una parte importante" },
      { value: "low", label: "Poca" },
      // N/A legítimo (§18, §41): un negocio local 100% por membresía/agenda propia no depende de tráfico peatonal en absoluto.
      { value: "not_applicable", label: "No aplica: solo atiendo con cita o membresía", kind: "not_applicable" },
    ],
    // Idem: diagnóstica pura, sin candidateDimensions prematura.
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: true },
    helpIntent: { understand: "Qué parte de quienes llegan al local lo hace por pasar cerca, sin haberte buscado antes.", distinction: "Piensa en quienes entran sin plan previo, no en quienes ya te conocían.", why: "Depender del paso por la calle es distinto a que te busquen o te recomienden." },
  },
  {
    id: "q2_confirm_primary_friction",
    version: 1,
    module: "confirmation",
    type: "single",
    prompt: "La evidencia apunta a una fricción distinta de la que declaraste. ¿Qué describe mejor el problema principal hoy?",
    purpose: ["confirmation"],
    priority: "critical",
    // Fixture-only hasta que el banco productivo tenga una ruta de confirmación aprobada.
    appliesWhen: contextEquals("primaryFriction", "visibility"),
    contradictionRole: { type: "confirms", targetField: "primaryFriction", note: "Confirma la interpretación de la fricción principal sin mutar q2_friction ni las observaciones que la contradicen." },
    options: [
      { value: "visibility", label: "La visibilidad sigue siendo el problema principal" },
      { value: "follow_up", label: "El seguimiento de consultas es el problema principal" },
      { value: "unsure", label: "Todavía no estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
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
