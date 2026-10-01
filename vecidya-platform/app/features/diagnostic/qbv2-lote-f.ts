import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, contextIn, contextEquals } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote F: startup/project y cierre de cobertura.
 *
 * Estas preguntas describen evidencia de pre-lanzamiento, no infraestructura. El módulo se activa
 * únicamente para proyectos en idea/starting; no convierte `startup` en un OperationalArchetype.
 */
const STARTUP_CONTEXT = andV2(contextEquals("entity", "project"), contextIn("growthStage", ["idea", "starting"]));

export const LOTE_F_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_startup_problem_clarity",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "Cuando explicas este proyecto, ¿puedes decir qué problema concreto resuelve y para quién?",
    helper: "No hace falta tener marca, web ni empresa constituida; buscamos claridad sobre la necesidad y la persona a la que sirve.",
    purpose: ["diagnostic"],
    priority: "high",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "clear_audience_problem", label: "Sí, puedo describir ambos con claridad" },
      { value: "problem_clear_audience_unclear", label: "El problema está claro, pero todavía no para quién exactamente" },
      { value: "audience_clear_problem_unclear", label: "Sé a quién quiero ayudar, pero no he concretado bien el problema" },
      { value: "both_unclear", label: "Todavía estoy explorando las dos cosas" },
      { value: "unknown", label: "No lo había comprobado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_startup_validation_evidence",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "¿Qué has comprobado sobre el problema con las personas a las que quieres ayudar?",
    helper: "Aquí medimos aprendizaje sobre la necesidad; una señal de demanda concreta se pregunta por separado.",
    purpose: ["diagnostic"],
    priority: "high",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "none", label: "Aún no lo he comprobado con personas reales" },
      { value: "conversations", label: "He conversado con personas del público y recogido problemas concretos" },
      { value: "problem_test", label: "He probado una hipótesis del problema y aprendí de las respuestas" },
      { value: "repeated_problem", label: "El mismo problema apareció de forma consistente en varias conversaciones o pruebas" },
      { value: "unknown", label: "No he separado ese aprendizaje todavía", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["confianza"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_startup_offer_readiness",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "¿Qué tan concreta es la oferta que podrías poner a prueba ahora?",
    helper: "Una oferta concreta puede ser un servicio, producto, piloto o propuesta; no exige web, marca ni registro legal.",
    purpose: ["diagnostic"],
    priority: "high",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "ready_to_test", label: "Puedo explicar qué recibe la persona, a cambio de qué y cómo empezar" },
      { value: "mostly_ready", label: "La idea está bastante definida, pero faltan detalles por probar" },
      { value: "shaping", label: "Todavía estoy dando forma a lo que ofrecería" },
      { value: "not_defined", label: "Aún no existe una oferta concreta" },
      { value: "unknown", label: "No lo había revisado como una oferta", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si ya existe algo concreto que una persona podría aceptar o rechazar hoy.", distinction: "Responde por lo que podrías ofrecer mañana, no por la versión final que imaginas." },
  },
  {
    id: "q2_startup_demand_signal",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "Hasta ahora, ¿qué acción concreta de demanda ha ocurrido?",
    helper: "Distingue interés de una acción: solicitud, prueba pagada, preventa, compromiso o primer cliente.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "none", label: "Ninguna acción concreta todavía" },
      { value: "interest", label: "Personas han preguntado o mostrado interés" },
      { value: "request", label: "Alguien pidió una propuesta o solicitó empezar" },
      { value: "paid_trial", label: "Alguien aceptó una prueba o piloto pagado" },
      { value: "commitment", label: "Hubo una preventa, compromiso o primer cliente" },
      { value: "unknown", label: "No he distinguido esas señales", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_startup_first_channel",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "¿Tienes claro por qué canal intentarías llegar primero a las personas adecuadas?",
    helper: "Puede ser conversación directa, comunidad, alianzas, contenido, búsqueda u otro canal; no hace falta tenerlo montado.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "specific_channel", label: "Sí, tengo un canal inicial concreto y sé por qué encaja" },
      { value: "several_candidates", label: "Tengo varias opciones, pero aún no he elegido" },
      { value: "no_channel", label: "Todavía no sé cómo llegar" },
      { value: "unknown", label: "No lo había pensado desde el acceso al público", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_startup_next_milestone",
    version: 1,
    module: "startup",
    type: "single",
    prompt: "¿Cuál es el siguiente hito que demostraría que el proyecto avanzó de verdad?",
    helper: "Elige un resultado observable, no solo una tarea o una intención de crecer.",
    purpose: ["diagnostic", "goal"],
    priority: "normal",
    appliesWhen: STARTUP_CONTEXT,
    options: [
      { value: "clarify_offer", label: "Definir y poder explicar una oferta concreta" },
      { value: "talk_to_audience", label: "Hablar con personas del público objetivo y aprender de sus respuestas" },
      { value: "run_pilot", label: "Hacer una prueba, piloto o primera entrega" },
      { value: "secure_commitment", label: "Conseguir una solicitud, preventa, compromiso o primer cliente" },
      { value: "not_clear", label: "Todavía no tengo un hito observable" },
      { value: "unknown", label: "No lo había definido así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad", "alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
] as const;
