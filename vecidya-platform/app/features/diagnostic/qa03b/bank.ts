import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as historicalBank } from "../qbv2-reviewed-evidence";
import { andV2, answeredV2, contextIn, eqV2, inV2, orV2 } from "../qbv2-rules";
import type { MigratedAnswerStateV3 } from "../qbv2-evidence-v3";
import { applyQA03BEditorialCopy } from "./editorial-copy";

const operating = eqV2("q2_operational_status", "operating");
const history = eqV2("q2_has_customers", "yes");
const confirmedBuyer = inV2("q2_customer_buyer", ["b2c", "b2b", "mixed"]);
export const BUYER_RECIPIENT_RULE = andV2(confirmedBuyer, orV2(
  inV2("q2_customer_buyer", ["b2b", "mixed"]), eqV2("q2_entity", "organization"),
  eqV2("q2_monetization", "mission"), inV2("q2_sector", ["health_wellness", "education_coaching"]),
));

const replacement: Readonly<Record<string, Partial<QuestionDefinitionV2>>> = {
  q2_entity: {
    version: 3, prompt: "¿Qué tipo de actividad quieres evaluar?",
    hint: "Elige la forma de tu actividad. Puede estar preparándose o ya operar; un proyecto puede generar ingresos.",
    options: [
      { value: "individual", label: "Trabajo por cuenta propia, como profesional o persona independiente, incluso con un nombre comercial." },
      { value: "business", label: "Un negocio o empresa con actividad comercial." },
      { value: "organization", label: "Una organización o iniciativa comunitaria sin fines de lucro." },
      { value: "project", label: "Un proyecto personal o colectivo que todavía no tiene forma de negocio u organización." },
      { value: "unknown", label: "Todavía no puedo clasificarla.", kind: "unknown" },
    ],
  },
  q2_other_staff: {
    version: 3,
    prompt: "¿Trabaja contigo alguna otra persona remunerada de forma continua (empleada o colaboradora pagada)?",
    hint: "Cuenta a quienes participan de manera regular en la operación, no a un proveedor ocasional o ayudante para un encargo puntual.",
    options: [
      { value: "no", label: "No, no tengo personal remunerado que trabaje de forma continua.", produces: [{ kind: "hasOtherPaidStaff", value: false, provenance: "explicit_declaration" }] },
      { value: "yes", label: "Sí, otra persona remunerada trabaja conmigo de forma continua.", produces: [{ kind: "hasOtherPaidStaff", value: true, provenance: "explicit_declaration" }] },
      { value: "unknown", label: "No estoy seguro todavía.", kind: "unknown" },
    ],
  },
  q2_has_customers: {
    version: 3, prompt: "Hasta hoy, ¿tu actividad ya ha tenido clientes, compradores, usuarios o beneficiarios reales?",
    hint: "Cuenta experiencias reales, aunque tu actividad esté en pausa. El interés o los seguidores por sí solos no cuentan.", variants: [],
    options: [
      { value: "yes", label: "Sí, ya hubo personas reales que compraron, contrataron, usaron o recibieron lo que ofrezco." },
      { value: "no", label: "No, todavía no ha habido personas reales en esas situaciones." },
      { value: "unknown", label: "No tengo información suficiente para responder.", kind: "unknown" },
    ],
  },
  q2_delivery: {
    version: 4, prompt: "¿Qué formas de atención o venta corresponden a tu actividad?",
    hint: "Activa: formas que usas; en pausa: las que usabas; en preparación: las que planeas. Citas, lugar y pago en línea son distintos.",
    variants: [{
      target: { activity: "prelaunch" },
      prompt: "¿Qué formas de atención o venta planeas usar?",
      optionLabels: {
        physical_location: "Planeo atender en un local, oficina o instalación propia.",
        appointments: "Planeo atender con citas o sesiones reservadas.",
        travels: "Planeo desplazarme al domicilio o lugar de la persona.",
        remote_service: "Planeo prestar el servicio a distancia, por videollamada, teléfono, internet o mensajes.",
        retail: "Planeo vender productos en una tienda física.",
        onsite: "Las personas podrán consumir o usar lo que ofrezco en mi establecimiento.",
        online_checkout: "Las personas podrán elegir y pagar una compra directamente por internet.",
      },
    }],
    options: [
      { value: "physical_location", label: "Atiendes en un local, oficina o instalación propia." },
      { value: "appointments", label: "Atiendes con citas o sesiones reservadas." },
      { value: "travels", label: "Te desplazas al domicilio o lugar del cliente." },
      { value: "remote_service", label: "Prestas el servicio a distancia, por videollamada, teléfono, internet o mensajes." },
      { value: "retail", label: "Vendes productos en una tienda física." },
      { value: "onsite", label: "Las personas consumen o usan lo que ofreces en tu establecimiento, como en un restaurante, café u hospedaje." },
      { value: "online_checkout", label: "Las personas pueden elegir y pagar una compra directamente por internet." },
      { value: "other", label: "Otra forma que no aparece arriba." },
      { value: "unsure", label: "Todavía no lo tengo claro.", kind: "unknown", exclusive: true },
    ],
  },
  q2_customer_reach: {
    version: 3, appliesWhen: undefined,
    options: [...historicalBank.find(q => q.id === "q2_customer_reach")!.options,
      { value: "unknown", label: "Todavía no lo tengo claro.", kind: "unknown" }],
  },
  q2_customer_buyer: {
    version: 3, prompt: "¿Quién compra o contrata directamente lo que ofreces?",
    hint: "Piensa en quien decide la compra o firma el contrato, no necesariamente en quien usa el servicio.", variants: [],
    options: [
      { value: "b2c", label: "Personas individuales que compran o contratan directamente." },
      { value: "b2b", label: "Empresas, organizaciones o instituciones que compran o contratan directamente." },
      { value: "mixed", label: "Personas y organizaciones compran o contratan directamente de forma habitual." },
      { value: "no_direct_purchase", label: "No hay una compra directa; la actividad se sostiene con donaciones, subvenciones o aportes." },
      { value: "unknown", label: "Todavía no lo tengo claro.", kind: "unknown" },
    ],
  },
  q2_sector: {
    version: 3,
    options: [...historicalBank.find(q => q.id === "q2_sector")!.options,
      { value: "unknown", label: "Todavía no lo tengo claro.", kind: "unknown" }],
  },
  q2_monetization: {
    version: 3, appliesWhen: undefined,
    prompt: "¿Cuál es la fuente principal de ingresos o aportes de tu actividad?",
    hint: "Hoy; en pausa, el periodo anterior; en preparación, lo que esperas. Si aún no genera ingresos o aportes, indícalo.",
    variants: [{
      target: { activity: "prelaunch" },
      prompt: "Si tu actividad empieza a operar, ¿de dónde esperas que provengan los ingresos o aportes?",
      optionLabels: {
        services: "Espero cobrar por servicios o trabajo profesional",
        goods: "Espero vender productos",
        commission: "Espero recibir comisiones por ventas, referidos o intermediación",
        audience: "Espero generar ingresos con contenido, audiencia, publicidad o patrocinios",
        recurring: "Espero cobrar membresías, suscripciones o cuotas recurrentes",
        mission: "Esperamos recibir donaciones, fondos o aportes",
        no_revenue_yet: "No esperamos generar ingresos o aportes al inicio",
      },
    }],
    options: [...historicalBank.find(q => q.id === "q2_monetization")!.options,
      { value: "no_revenue_yet", label: "Todavía no genera ingresos o aportes por esta actividad.", kind: "none" }],
  },
  q2_presence_digital_base: {
    appliesWhen: contextIn("activity", ["active", "prelaunch"]),
  },
  q2_presence_offer_clarity: {
    materialAppliesWhen: andV2(contextIn("activity", ["active", "prelaunch"]), inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"])),
  },
};

// La elegibilidad cambia por contrato de banco, sin cambiar el significado/version/mapping de fuentes R3.
const historicalInteractionQuestions = new Set([
  "q2_regularity", "q2_demand_trend", "q2_capacity_signal", "q2_appointments_noshow",
  "q2_ecommerce_traffic_sources", "q2_reputation_flow", "q2_retail_customer_capture",
  "q2_appointments_lead_to_booking", "q2_appointments_booking_friction",
  "q2_appointments_confirmation_reminders", "q2_appointments_rebooking",
]);
const currentProcessQuestions = new Set([
  "q2_process_systemization", "q2_service_response_speed", "q2_service_quote_followup",
  "q2_operations_handoffs", "q2_operations_information_base", "q2_followup_general_process",
  "q2_b2b_pipeline", "q2_b2b_status_visibility", "q2_creator_audience_ownership", "q2_measurement_practice",
]);

function evolve(question: QuestionDefinitionV2): QuestionDefinitionV2 {
  let next = { ...question, ...replacement[question.id] } as QuestionDefinitionV2;
  const guard = historicalInteractionQuestions.has(next.id) ? andV2(operating, history)
    : currentProcessQuestions.has(next.id) ? operating : undefined;
  const buyerGuard = next.module === "b2b" ? inV2("q2_customer_buyer", ["b2b", "mixed"]) : undefined;
  if (guard || buyerGuard) {
    const gate = guard && buyerGuard ? andV2(guard, buyerGuard) : guard ?? buyerGuard!;
    // OR entre native/material se conserva; ambos reciben el prerrequisito.
    if (next.appliesWhen) next = { ...next, appliesWhen: andV2(gate, next.appliesWhen) };
    if (next.materialAppliesWhen) next = { ...next, materialAppliesWhen: andV2(gate, next.materialAppliesWhen) };
    if (!next.appliesWhen && !next.materialAppliesWhen) next = { ...next, appliesWhen: gate };
  }
  return next;
}

export const REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3: readonly QuestionDefinitionV2[] = [
  ...historicalBank.map(evolve),
  {
    id: "q2_measurement_rate_estimate", version: 1, module: "measurement", type: "single", routingRole: "adaptive",
    prompt: "¿Puedes estimar qué parte de las consultas o pedidos termina en una compra o contratación?",
    hint: "No hace falta calcularlo ahora. Responde según la información que normalmente tienes disponible.",
    purpose: ["diagnostic"], priority: "high", appliesWhen: andV2(operating, history),
    evidenceMigration: "migrated",
    evidenceV3: { questionId: "q2_measurement_rate_estimate", questionVersion: 1, dimensions: [{ dimension: "measurement_optimization", directness: "direct", answers: {
      can_estimate: "established", rough_estimate: "partial", no_method: "missing", unknown: "uncertainty", no_opportunities: "not_applicable",
    } satisfies Record<"can_estimate" | "rough_estimate" | "no_method" | "unknown" | "no_opportunities", MigratedAnswerStateV3> }] },
    options: [
      { value: "can_estimate", label: "Sí, normalmente puedo estimarlo con registros." },
      { value: "rough_estimate", label: "Tengo una idea aproximada, pero no un registro consistente." },
      { value: "no_method", label: "No tenemos una forma de estimarlo." },
      { value: "unknown", label: "No lo sé o no tengo información suficiente.", kind: "unknown" },
      { value: "no_opportunities", label: "Todavía no recibimos consultas o pedidos de ese tipo.", kind: "not_applicable" },
    ],
  },
  {
    id: "q2_measurement_result_recording", version: 1, module: "measurement", type: "single", routingRole: "adaptive",
    prompt: "Aunque no conozcas el porcentaje, ¿registras si cada consulta o pedido terminó en una compra o contratación?",
    hint: "Esta pregunta evalúa si se sigue el desenlace; no calcula una tasa de conversión.",
    purpose: ["diagnostic"], priority: "high",
    appliesWhen: andV2(operating, history, eqV2("q2_measurement_rate_estimate", "unknown")), evidenceMigration: "migrated",
    evidenceV3: { questionId: "q2_measurement_result_recording", questionVersion: 1, dimensions: [{ dimension: "measurement_optimization", directness: "direct", answers: {
      consistent: "established", sometimes: "partial", not_tracked: "missing", unknown: "uncertainty",
    } satisfies Record<"consistent" | "sometimes" | "not_tracked" | "unknown", MigratedAnswerStateV3> }] },
    options: [
      { value: "consistent", label: "Sí, casi siempre queda registrado." },
      { value: "sometimes", label: "A veces lo registramos, pero no de manera constante." },
      { value: "not_tracked", label: "No llevamos ese seguimiento." },
      { value: "unknown", label: "No sé si se registra de forma consistente.", kind: "unknown" },
    ],
  },
  {
    id: "q2_measurement_review_cycle", version: 1, module: "measurement", type: "single", routingRole: "adaptive",
    prompt: "¿Revisas con cierta frecuencia los resultados de tu actividad para decidir qué conviene cambiar?",
    hint: "Piensa en una revisión real de consultas, ventas, reservas, clientes u operaciones; no en las herramientas disponibles.",
    purpose: ["diagnostic"], priority: "normal", appliesWhen: andV2(operating, history), evidenceMigration: "migrated",
    evidenceV3: { questionId: "q2_measurement_review_cycle", questionVersion: 1, dimensions: [{ dimension: "measurement_optimization", directness: "direct", answers: {
      regular_decisions: "established", occasional_review: "partial", no_review: "missing", unknown: "uncertainty",
    } satisfies Record<"regular_decisions" | "occasional_review" | "no_review" | "unknown", MigratedAnswerStateV3> }] },
    options: [
      { value: "regular_decisions", label: "Sí, los reviso regularmente y uso lo que veo para decidir." },
      { value: "occasional_review", label: "Los reviso ocasionalmente, pero no siempre cambian mis decisiones." },
      { value: "no_review", label: "No suelo revisar resultados para tomar decisiones." },
      { value: "unknown", label: "No estoy seguro.", kind: "unknown" },
    ],
  },
  {
    id: "q2_operational_status", version: 1, module: "core", type: "single", routingRole: "core",
    prompt: "¿Cuál describe mejor el estado actual de tu actividad?",
    hint: "El estado de hoy es independiente de haber tenido clientes o participantes antes.",
    purpose: ["anchor", "classification"], priority: "critical", appliesWhen: answeredV2("q2_has_customers"),
    options: [
      { value: "preparing", label: "Todavía no está disponible; la estoy preparando o validando." },
      { value: "operating", label: "Ya está disponible para atender personas, prestar servicios, vender productos u ofrecer actividades a participantes." },
      { value: "paused", label: "Está temporalmente en pausa." },
      { value: "unknown", label: "No lo tengo claro todavía.", kind: "unknown" },
    ],
  },
  {
    id: "q2_buyer_recipient_relation", version: 1, module: "nonprofit", type: "single", routingRole: "core",
    prompt: "¿Quién compra o contrata es también quien recibe el servicio o producto?",
    hint: "Por ejemplo, alguien puede contratar un servicio para otra persona.",
    purpose: ["classification"], priority: "high", appliesWhen: BUYER_RECIPIENT_RULE,
    options: [
      { value: "same_party", label: "Sí, quien compra también lo recibe o utiliza." },
      { value: "third_party", label: "No, lo compra o contrata para otras personas." },
      { value: "unknown", label: "Todavía no lo tengo claro.", kind: "unknown" },
    ],
  },
  {
    id: "q2_digital_tools_in_use", version: 1, module: "operations", type: "multi", routingRole: "adaptive",
    prompt: "¿Qué tipos de herramientas digitales usas hoy para organizar o dar seguimiento a tu actividad?",
    hint: "Marca solo las que realmente usas. Que exista una herramienta no indica por sí sola qué tan bien funciona el proceso.",
    purpose: ["diagnostic"], priority: "normal",
    appliesWhen: andV2(operating, orV2(
      inV2("q2_goal", ["organize", "automate", "stop_losing", "measure"]),
      inV2("q2_friction", ["operations", "follow_up"]),
    )),
    options: [
      { value: "calendar_scheduling", label: "Agenda o calendario para coordinar fechas y citas." },
      { value: "documents_records", label: "Documentos o tablas para guardar datos, pedidos o registros." },
      { value: "tasks_projects", label: "Herramientas para organizar tareas, proyectos o responsables." },
      { value: "customer_followup", label: "Herramientas para registrar consultas y retomar pendientes." },
      { value: "inventory_operations", label: "Herramientas para controlar productos, existencias o procesos." },
      { value: "other", label: "Otro tipo de herramienta digital." },
      { value: "none", label: "No uso herramientas digitales para estas tareas.", kind: "none", exclusive: true },
      { value: "not_needed", label: "No necesito herramientas digitales para estas tareas.", kind: "not_applicable", exclusive: true },
      { value: "unknown", label: "No estoy seguro de cuáles herramientas usamos.", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "q2_measurement_practice", version: 1, module: "operations", type: "single", routingRole: "adaptive",
    prompt: "En los últimos 3 meses, ¿cómo revisaste los resultados de tu actividad para decidir qué mejorar?",
    hint: "Piensa en consultas, compras o pedidos, citas, personas atendidas, participantes, beneficiarios o aportes. No es necesario usar una herramienta digital.",
    purpose: ["diagnostic"], priority: "high", appliesWhen: operating,
    options: [
      { value: "consistent", label: "Registramos resultados con cierta frecuencia y los revisamos para decidir ajustes." },
      { value: "partial", label: "Anotamos algunos datos, pero los revisamos sin regularidad o no los usamos para decidir." },
      { value: "none", label: "No registramos ni revisamos resultados de forma regular." },
      { value: "not_enough_activity", label: "Todavía no hubo suficiente actividad reciente para evaluarlo.", kind: "not_applicable" },
      { value: "unknown", label: "No lo sé o no tengo esa información.", kind: "unknown" },
    ],
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_measurement_practice",
      questionVersion: 1,
      dimensions: [{
        dimension: "measurement_optimization", directness: "direct", answers: {
          consistent: "established", partial: "partial", none: "weak",
          not_enough_activity: "not_applicable", unknown: "uncertainty",
        },
      }],
    },
  },
].map(applyQA03BEditorialCopy);
