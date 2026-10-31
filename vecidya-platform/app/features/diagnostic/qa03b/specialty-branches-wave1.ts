import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { andV2, archetypeIncludes, eqV2, inV2, notV2, orV2 } from "../qbv2-rules";
import { QA03B_SPECIALTY_CANDIDATE_BANK_V1 } from "./specialty-candidate-bank";

/**
 * Fase 5 — ramas especializadas SUSTITUTIVAS.
 *
 * No se exporta al flujo público. El objetivo es probar que declarar un nicho
 * reemplaza una pregunta genérica por otra más precisa, sin duplicar evidencia.
 */
const activeHistory = andV2(
  eqV2("q2_operational_status", "operating"),
  eqV2("q2_has_customers", "yes"),
);

// If niche is still unknown, keep the generic observation available.
const dentalSpecialistEligible = andV2(
  activeHistory,
  eqV2("q2_niche_health_wellness", "dentist"),
  archetypeIncludes("appointments"),
  orV2(eqV2("q2_goal", "stop_losing"), eqV2("q2_friction", "follow_up")),
);
const healthGenericGate = notV2(dentalSpecialistEligible);

// Generic clarity stays available until a known specialty can replace it.
const foodSpecialistEligible = andV2(
  activeHistory,
  eqV2("q2_sector", "food_hospitality"),
  inV2("q2_niche_food_hospitality", ["restaurant", "cafe", "food_truck"]),
  eqV2("q2_goal", "explain"),
  inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"]),
);
const agencySpecialistEligible = andV2(
  activeHistory,
  eqV2("q2_sector", "b2b_services"),
  eqV2("q2_niche_b2b_services", "marketing_agency"),
  eqV2("q2_goal", "explain"),
  inV2("q2_customer_buyer", ["b2b", "mixed"]),
  inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"]),
);
// Keep the generic question unless its specialized replacement is eligible.
const offerGenericGate = andV2(notV2(foodSpecialistEligible), notV2(agencySpecialistEligible));

export const QA03B_SPECIALTY_BRANCH_QUESTIONS_V1: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_dental_care_continuation",
    version: 1,
    module: "appointments",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando un paciente necesita continuar un tratamiento o control, ¿qué suele pasar con la próxima cita?",
    hint: "Piensa en tratamientos o controles que requieren volver. No cuentes visitas aisladas que terminan en una sola cita.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: dentalSpecialistEligible,
    options: [
      { value: "proactive", label: "Normalmente dejamos acordada la próxima cita con anticipación" },
      { value: "partial", label: "A veces queda acordada y otras veces se organiza después" },
      { value: "reactive", label: "El paciente suele tener que volver a contactarnos para continuar" },
      { value: "not_applicable", label: "La mayoría de las atenciones no requiere otra cita", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    evidenceV3: {
      questionId: "q2_dental_care_continuation",
      questionVersion: 1,
      dimensions: [{
        dimension: "relationship_recurrence",
        directness: "direct",
        answers: {
          proactive: "established",
          partial: "partial",
          reactive: "weak",
          not_applicable: "not_applicable",
          unknown: "uncertainty",
        },
      }],
    },
  },
  {
    id: "q2_food_menu_visibility",
    version: 1,
    module: "hospitality",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando alguien encuentra tu negocio en internet, ¿puede ver un menú o una selección actual de lo que ofreces?",
    hint: "Puede estar en tu web, Google o redes. Importa que una persona nueva entienda qué puede pedir antes de contactarte.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: foodSpecialistEligible,
    options: [
      { value: "clear", label: "Sí, se ve una selección suficientemente clara y actual" },
      { value: "partial", label: "Se ve parte de la oferta, pero falta información o está algo desactualizada" },
      { value: "unclear", label: "No se entiende bien qué se puede pedir sin preguntar" },
      { value: "not_applicable", label: "Todavía no muestro la oferta en ese lugar", kind: "not_applicable" },
      { value: "unknown", label: "No lo he revisado desde fuera", kind: "unknown" },
    ],
    evidenceV3: {
      questionId: "q2_food_menu_visibility",
      questionVersion: 1,
      dimensions: [{
        dimension: "clarity_positioning",
        directness: "direct",
        answers: {
          clear: "established",
          partial: "partial",
          unclear: "weak",
          not_applicable: "not_applicable",
          unknown: "uncertainty",
        },
      }],
    },
  },
  {
    id: "q2_marketing_agency_scope_clarity",
    version: 1,
    module: "b2b",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando una empresa evalúa contratar tu agencia, ¿puede entender con claridad qué incluye cada servicio?",
    hint: "Piensa en alcance, entregables o límites del servicio antes de una llamada comercial, no en promesas de resultados.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: agencySpecialistEligible,
    options: [
      { value: "clear", label: "Sí, normalmente se entiende qué incluye el servicio" },
      { value: "partial", label: "Se entiende en general, pero algunos alcances o entregables quedan poco claros" },
      { value: "unclear", label: "Hay que explicarlo en una conversación para que quede claro" },
      { value: "not_applicable", label: "Todavía no presento los servicios de esa forma", kind: "not_applicable" },
      { value: "unknown", label: "No lo he revisado desde la perspectiva del cliente", kind: "unknown" },
    ],
    evidenceV3: {
      questionId: "q2_marketing_agency_scope_clarity",
      questionVersion: 1,
      dimensions: [{
        dimension: "clarity_positioning",
        directness: "direct",
        answers: {
          clear: "established",
          partial: "partial",
          unclear: "weak",
          not_applicable: "not_applicable",
          unknown: "uncertainty",
        },
      }],
    },
  },
];

function replaceGenericQuestion(question: QuestionDefinitionV2): QuestionDefinitionV2 {
  if (question.id === "q2_appointments_rebooking") {
    return {
      ...question,
      ...(question.appliesWhen ? { appliesWhen: andV2(question.appliesWhen, healthGenericGate) } : {}),
      ...(question.materialAppliesWhen ? { materialAppliesWhen: andV2(question.materialAppliesWhen, healthGenericGate) } : {}),
    };
  }
  if (question.id === "q2_presence_offer_clarity") {
    return {
      ...question,
      ...(question.appliesWhen ? { appliesWhen: andV2(question.appliesWhen, offerGenericGate) } : {}),
      ...(question.materialAppliesWhen ? { materialAppliesWhen: andV2(question.materialAppliesWhen, offerGenericGate) } : {}),
    };
  }
  return question;
}

export const QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2: readonly QuestionDefinitionV2[] = [
  ...QA03B_SPECIALTY_CANDIDATE_BANK_V1.map(replaceGenericQuestion),
  ...QA03B_SPECIALTY_BRANCH_QUESTIONS_V1,
];

if (QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.length !== 77) {
  throw new Error("QA-03B specialty branch candidate must contain 77 questions");
}
if (new Set(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((question) => question.id)).size !== 77) {
  throw new Error("QA-03B specialty branch candidate has duplicate IDs");
}

/**
 * QA03B V9 — expansión complementaria AISLADA (no importada por flujo público).
 *
 * Los 77 IDs de QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 siguen inalterados.
 * Estas cinco preguntas de profundización cubren necesidades observadas que
 * no requieren reescribir evidencia histórica ni exigir canales/CRM.
 *
 * No se puntúan: hasta diseñar evidencia V3 y reglas de deduplicación,
 * ninguna respuesta constituye prueba de madurez digital.
 */
export const QA03B_COMPLEMENTARY_QUESTIONS_V1: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_nonprofit_participation_entry",
    version: 1,
    module: "nonprofit",
    type: "single",
    routingRole: "deepening",
    prompt: "Si alguien nuevo quiere participar en tu iniciativa comunitaria, ¿sabe cómo dar el primer paso?",
    hint: "Cuenta actividades reales y abiertas. Participar no exige donar, pagar cuotas ni ser cliente.",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: andV2(
      activeHistory,
      orV2(eqV2("q2_entity", "organization"), eqV2("q2_monetization", "mission")),
      orV2(eqV2("q2_goal", "explain"), eqV2("q2_goal", "opportunities"), eqV2("q2_friction", "conversion")),
    ),
    options: [
      { value: "clear", label: "Sí, el primer paso para participar está claro." },
      { value: "partial", label: "Se puede participar, pero algunas indicaciones son confusas." },
      { value: "unclear", label: "Recibimos interés, pero no está claro cómo incorporarse." },
      { value: "no_open_entry", label: "La actividad no tiene actualmente una vía de participación abierta.", kind: "not_applicable" },
      { value: "unknown", label: "No sé qué encuentra una persona nueva.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Si una persona externa puede incorporarse a las actividades que realmente están abiertas.",
      distinction: "Participación no significa donación monetaria, membresía pagada ni contacto de marketing.",
    },
  },
  {
    id: "q2_education_enrollment_entry",
    version: 1,
    module: "professional",
    type: "single",
    routingRole: "deepening",
    prompt: "Cuando alguien quiere empezar tu formación o acompañamiento, ¿entiende cómo inscribirse o solicitar acceso?",
    hint: "Puede ser una clase, un programa o tutoría. No presupone pagos ni plataforma de cursos.",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_sector", "education_coaching"),
      orV2(eqV2("q2_goal", "explain"), eqV2("q2_goal", "opportunities"), eqV2("q2_friction", "conversion")),
    ),
    options: [
      { value: "clear", label: "Los pasos de inscripción o acceso se entienden bien." },
      { value: "partial", label: "Se entiende la idea, pero faltan algunos pasos." },
      { value: "unclear", label: "Hay información, pero no permite saber cómo empezar." },
      { value: "no_open_enrollment", label: "Actualmente no existe inscripción o acceso abierto.", kind: "not_applicable" },
      { value: "unknown", label: "No he comprobado qué entiende alguien nuevo.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "La claridad del inicio de una experiencia educativa cuando está abierta.",
      distinction: "Inscribirse o solicitar acceso puede ser gratuito; no demuestra pago, asistencia ni aprendizaje.",
    },
  },
  {
    id: "q2_real_estate_inquiry_entry",
    version: 1,
    module: "professional",
    type: "single",
    routingRole: "deepening",
    prompt: "Si una persona pregunta por una propiedad o servicio inmobiliario, ¿entiende cómo solicitar información?",
    hint: "No implica confirmar disponibilidad, precio, aprobación ni concertar una visita.",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_sector", "real_estate"),
      orV2(eqV2("q2_goal", "explain"), eqV2("q2_goal", "opportunities"), eqV2("q2_friction", "conversion")),
    ),
    options: [
      { value: "clear", label: "Está claro cómo enviar una consulta pertinente." },
      { value: "partial", label: "Puede consultarse, pero faltan indicaciones importantes." },
      { value: "unclear", label: "La información no aclara cómo iniciar la consulta." },
      { value: "referral_only", label: "Solo atendemos consultas a través de un proceso de derivación definido.", kind: "not_applicable" },
      { value: "unknown", label: "No lo he comprobado desde fuera.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Si el paso para pedir información inmobiliaria se explica cuando corresponde.",
      distinction: "Una consulta no confirma stock, precio, cita, aprobación o cierre de una operación.",
    },
  },
  {
    id: "q2_creative_brief_intake",
    version: 1,
    module: "professional",
    type: "single",
    routingRole: "deepening",
    prompt: "Cuando aceptas un encargo creativo, ¿queda claro qué necesita el cliente y qué entregarás?",
    hint: "Piensa en encargos reales; una conversación o nota puede servir, sin software obligatorio.",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_sector", "creative_media"),
      orV2(eqV2("q2_goal", "organize"), eqV2("q2_friction", "operations")),
    ),
    options: [
      { value: "clear", label: "Normalmente se acuerdan necesidades y entregables antes de comenzar." },
      { value: "partial", label: "A veces faltan detalles y hay que aclararlos después." },
      { value: "improvised", label: "Con frecuencia comenzamos sin aclarar necesidades o entregables." },
      { value: "no_comparable_projects", label: "No hemos tenido encargos comparables recientes.", kind: "not_applicable" },
      { value: "unknown", label: "No tengo información suficiente para responder.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Si el alcance de trabajos creativos reales se acuerda antes de ejecutar.",
      distinction: "Definir un encargo no demuestra automatización ni requiere gestionar proyectos con una aplicación.",
    },
  },
  {
    id: "q2_retail_purchase_next_step",
    version: 1,
    module: "retail",
    type: "single",
    routingRole: "deepening",
    prompt: "Cuando alguien elige un producto de tu tienda física, ¿sabe cómo concretar la compra?",
    hint: "Se evalúa el paso para comprar, no si el producto está disponible o si la venta se completó.",
    purpose: ["diagnostic"],
    priority: "refinement",
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_sector", "retail"),
      orV2(eqV2("q2_goal", "explain"), eqV2("q2_goal", "opportunities"), eqV2("q2_friction", "conversion")),
    ),
    options: [
      { value: "clear", label: "El paso para concretar una compra está claro." },
      { value: "partial", label: "Se puede comprar, pero algunos pasos generan dudas." },
      { value: "unclear", label: "Hay interés en productos, pero cuesta saber cómo comprarlos." },
      { value: "not_direct_sales", label: "No realizamos ventas directas al público en esta actividad.", kind: "not_applicable" },
      { value: "unknown", label: "No sé qué experimenta una persona nueva.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "La claridad del paso de compra de una tienda minorista física.",
      distinction: "Se diferencia de mostrar productos, facilitar búsqueda en línea o confirmar existencias.",
    },
  },
];

/**
 * Nuevo catálogo de ampliación evaluable de forma independiente. El contrato
 * base de 77 y todos sus imports actuales permanecen intactos: no es V9
 * público ni genera evidencia de scoring. La activación requiere F02/F03/F05.
 */
export const QA03B_EXTENDED_CANDIDATE_BANK_V3: readonly QuestionDefinitionV2[] = [
  ...QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2,
  ...QA03B_COMPLEMENTARY_QUESTIONS_V1,
];

if (QA03B_COMPLEMENTARY_QUESTIONS_V1.length !== 5 || QA03B_EXTENDED_CANDIDATE_BANK_V3.length !== 82) {
  throw new Error("QA-03B complementary candidate must contain 5 additions / 82 total questions");
}
if (new Set(QA03B_EXTENDED_CANDIDATE_BANK_V3.map((question) => question.id)).size !== 82) {
  throw new Error("QA-03B complementary candidate contains duplicate IDs");
}


/** QA03B V9: 8 observaciones generales aisladas. No tienen evidencia V3
 * calibrada, no están registradas en el flujo público y no deben preguntarse
 * junto con la misma observación sectorial sin ganancia de información. */
export const QA03B_GENERAL_DIMENSION_PROBES_V1: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_general_offer_comprehension", version: 1, module: "presence", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Cuando explicas tu actividad a alguien que no la conoce, ¿puede entender a quién ayudas y qué obtiene?", hint: "Valora la comprensión real, incluso si no tienes web; no presupone ventas ni una oferta ya publicada.",
    appliesWhen: orV2(eqV2("q2_operational_status", "operating"), eqV2("q2_operational_status", "preparing")),
    options: [
      { value: "clear", label: "Suele entender a quién va dirigida y qué se ofrece." },
      { value: "partial", label: "Comprende la idea, pero pregunta varios detalles." },
      { value: "unclear", label: "Cuesta entender a quién va dirigida o qué recibe." },
      { value: "not_presented", label: "Todavía no presento una oferta a personas externas.", kind: "not_applicable" },
      { value: "unknown", label: "No lo he contrastado con personas nuevas.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general clarity_positioning.",
      distinction: "Comprensión de la oferta explicada, no visibilidad online ni volumen de ventas.",
    },
  },
  {
    id: "q2_general_contact_information_consistency", version: 1, module: "presence", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Si alguien encuentra tus canales digitales actuales, ¿obtiene datos de contacto vigentes y coherentes?", hint: "Incluye los perfiles, fichas o webs que sí usas. No hace falta disponer de todos ellos.",
    appliesWhen: eqV2("q2_operational_status", "operating"),
    options: [
      { value: "consistent", label: "Los canales activos muestran datos correctos y coherentes." },
      { value: "partial", label: "Algún canal contiene datos incompletos o diferentes." },
      { value: "incorrect", label: "Hay datos incorrectos en canales activos." },
      { value: "no_public_channel", label: "No utilizamos canales digitales públicos para esta actividad.", kind: "not_applicable" },
      { value: "unknown", label: "No hemos comprobado esos datos.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general digital_foundation.",
      distinction: "Coherencia entre canales digitales, no existencia de web ni rapidez de respuesta.",
    },
  },
  {
    id: "q2_general_discoverability_path", version: 1, module: "discovery", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Cuando alguien que no conoce tu actividad necesita algo como lo que ofreces, ¿tiene alguna vía para descubrirte?", hint: "Puede llegar por recomendaciones, señalización, directorios, búsquedas u otras vías. No requiere anuncios.",
    appliesWhen: andV2(eqV2("q2_operational_status","operating"),eqV2("q2_has_customers","yes")),
    options: [
      { value: "clear_path", label: "Hay una vía comprobable por la que pueden encontrarnos." },
      { value: "partial_path", label: "Existe alguna vía, pero su alcance es limitado." },
      { value: "no_path", label: "No identificamos una vía real de descubrimiento." },
      { value: "not_seeking", label: "Actualmente no buscamos recibir personas nuevas.", kind: "not_applicable" },
      { value: "unknown", label: "No sabemos cómo nos descubrirían.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general discovery.",
      distinction: "Vía real de descubrimiento, no constancia de adquisición ni atribución estadística.",
    },
  },
  {
    id: "q2_general_verifiable_trust_signals", version: 1, module: "reputation", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Antes de avanzar contigo, ¿una persona nueva puede comprobar señales apropiadas de confianza?", hint: "Pueden ser trabajos, referencias publicables o datos profesionales; no compartas información privada.",
    appliesWhen: andV2(eqV2("q2_operational_status","operating"),eqV2("q2_has_customers","yes")),
    options: [
      { value: "accessible", label: "Puede consultar señales pertinentes y verificables." },
      { value: "limited", label: "Puede consultar algunas, pero faltan detalles." },
      { value: "not_accessible", label: "No ofrecemos señales que pueda comprobar." },
      { value: "private_only", label: "No es apropiado mostrarlas públicamente por privacidad.", kind: "not_applicable" },
      { value: "unknown", label: "No hemos comprobado qué se puede verificar.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general trust_reputation.",
      distinction: "Pruebas legítimas accesibles, sin inferir licencias ni exigir reseñas.",
    },
  },
  {
    id: "q2_general_first_action_path", version: 1, module: "conversion", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Si alguien decide avanzar con tu actividad, ¿sabe cuál es el primer paso y cómo realizarlo?", hint: "Puede ser contactar, inscribirse, pedir información, comprar o participar; no requiere pago ni cita.",
    appliesWhen: eqV2("q2_operational_status","operating"),
    options: [
      { value: "clear", label: "El primer paso y la forma de hacerlo están claros." },
      { value: "partial", label: "Existe el paso, pero quedan dudas." },
      { value: "unclear", label: "Resulta difícil entender cómo empezar." },
      { value: "no_open_action", label: "Actualmente no existe una vía de entrada abierta.", kind: "not_applicable" },
      { value: "unknown", label: "No lo hemos comprobado.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general conversion_access.",
      distinction: "Fallback genérico del acceso sectorial, no otra puntuación por el mismo evento.",
    },
  },
  {
    id: "q2_general_pending_step_continuity", version: 1, module: "follow_up", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Cuando una consulta requiere un paso posterior, ¿puedes retomarla sabiendo qué quedó pendiente?", hint: "No exige CRM ni automatización. No implica autorización para contactar o enviar recordatorios.",
    appliesWhen: andV2(eqV2("q2_operational_status","operating"),eqV2("q2_has_customers","yes")),
    options: [
      { value: "reliable", label: "Normalmente identificamos y retomamos el siguiente paso." },
      { value: "partial", label: "A veces hay que reconstruir lo acordado." },
      { value: "lost", label: "Hay pasos posteriores que se pierden o no quedan claros." },
      { value: "no_followup_needed", label: "Las interacciones habituales no requieren seguimiento.", kind: "not_applicable" },
      { value: "unknown", label: "No tenemos información fiable.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general relationship_recurrence.",
      distinction: "Estado de un paso pendiente; no frecuencia de retorno ni consentimiento comercial.",
    },
  },
  {
    id: "q2_general_outcome_measure_definition", version: 1, module: "measurement", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Para saber si tu actividad mejora, ¿tienes definido algún resultado observable que puedas comparar?", hint: "Puede ser solicitudes atendidas, entregas o participantes. No exige porcentajes ni herramientas.",
    appliesWhen: andV2(eqV2("q2_operational_status","operating"),eqV2("q2_has_customers","yes")),
    options: [
      { value: "defined", label: "Tenemos un resultado concreto y comparable." },
      { value: "partial", label: "Tenemos una referencia, pero no es consistente." },
      { value: "none", label: "No hemos definido un resultado comparable." },
      { value: "insufficient_activity", label: "No hubo actividad comparable suficiente.", kind: "not_applicable" },
      { value: "unknown", label: "No sabemos si existe una medida fiable.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general measurement_optimization.",
      distinction: "Definir qué se mide, distinto de registrar o revisar resultados.",
    },
  },
  {
    id: "q2_general_digital_execution_reliability", version: 1, module: "operations", type: "single",
    routingRole: "deepening", priority: "refinement", purpose: ["diagnostic"],
    prompt: "Cuando una tarea depende de una herramienta digital, ¿puedes completarla de forma fiable?", hint: "Considera tareas reales, no cuántas aplicaciones tienes. Indica si no necesitas herramientas.",
    appliesWhen: eqV2("q2_operational_status","operating"),
    options: [
      { value: "reliable", label: "Las tareas digitales necesarias se completan de forma fiable." },
      { value: "partial", label: "Se completan, pero con fallos o improvisaciones." },
      { value: "unreliable", label: "Las herramientas impiden completar tareas necesarias." },
      { value: "not_needed", label: "Esta actividad no requiere tareas con herramientas digitales.", kind: "not_applicable" },
      { value: "unknown", label: "No sabemos qué tan fiables son.", kind: "unknown" },
    ],
    evidenceMigration: "pending",
    helpIntent: {
      understand: "Observar de forma general digital_readiness.",
      distinction: "Ejecución digital observada, no procesos manuales ni posesión de software.",
    },
  },
];

/** Mantiene intactos el banco de 77 y la ampliación previa de 82. */
export const QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4: readonly QuestionDefinitionV2[] = [
  ...QA03B_EXTENDED_CANDIDATE_BANK_V3,
  ...QA03B_GENERAL_DIMENSION_PROBES_V1,
];

if (QA03B_GENERAL_DIMENSION_PROBES_V1.length !== 8 || QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4.length !== 90) {
  throw new Error("QA-03B balanced candidate must contain 8 general probes / 90 questions");
}
if (new Set(QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4.map((question) => question.id)).size !== 90) {
  throw new Error("QA-03B balanced candidate contains duplicate IDs");
}
