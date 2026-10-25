import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { LOTE_B_QUESTIONS_V2 } from "../qbv2-lote-b";
import { LOTE_C_QUESTIONS_V2 } from "../qbv2-lote-c";
import { LOTE_D_QUESTIONS_V2 } from "../qbv2-lote-d";
import { LOTE_E_QUESTIONS_V2 } from "../qbv2-lote-e";
import { LOTE_F_QUESTIONS_V2 } from "../qbv2-lote-f";
import { andV2, archetypeIncludes, archetypeIncludesAny, eqV2, inV2, orV2 } from "../qbv2-rules";
import type { MigratedAnswerStateV3 } from "../qbv2-evidence-v3";

/**
 * QA-03B recovery wave 2, CANDIDATE ONLY.
 *
 * Editorial audit covers question, help, option semantics and profile before any
 * migration. Missing evidence is intentionally pending; those questions must NOT
 * consume interview budget simply because they exist in a larger catalog.
 *
 * Do not import this file into production bank.ts, Worker, or public session flow.
 */
const find = (bank: readonly QuestionDefinitionV2[], id: string): QuestionDefinitionV2 => {
  const question = bank.find((item) => item.id === id);
  if (!question) throw new Error(`Historical recovery question not found: ${id}`);
  return question;
};

const activeWithHistory = andV2(eqV2("q2_operational_status", "operating"), eqV2("q2_has_customers", "yes"));
const prelaunch = eqV2("q2_operational_status", "preparing");
const ecommerce = andV2(activeWithHistory, archetypeIncludes("ecommerce"));
const hospitality = andV2(activeWithHistory, archetypeIncludes("hospitality"));
const nonprofit = andV2(
  eqV2("q2_operational_status", "operating"),
  orV2(eqV2("q2_entity", "organization"), eqV2("q2_monetization", "mission")),
);
const b2b = andV2(activeWithHistory, inV2("q2_customer_buyer", ["b2b", "mixed"]));
const creator = andV2(activeWithHistory, orV2(eqV2("q2_monetization", "audience"), eqV2("q2_sector", "creator")));
const operations = andV2(activeWithHistory, orV2(eqV2("q2_goal", "organize"), eqV2("q2_friction", "operations")));
const followup = andV2(activeWithHistory, orV2(eqV2("q2_goal", "stop_losing"), eqV2("q2_friction", "follow_up")));
const measurement = andV2(activeWithHistory, eqV2("q2_goal", "measure"));

const evidence = (
  questionId: string,
  version: 1 | 2 | 3 | 4,
  dimension: "measurement_optimization" | "relationship_recurrence" | "conversion_access" | "digital_readiness",
  directness: "direct" | "supporting",
  answers: Readonly<Record<string, MigratedAnswerStateV3>>,
) => ({
  questionId, questionVersion: version,
  dimensions: [{ dimension, directness, answers }],
}) as const;

export const QA03B_RECOVERY_WAVE2_QUESTIONS: readonly QuestionDefinitionV2[] = [
  // PRE-LAUNCH: interest, trial and a first paying client are distinct. This
  // question is intentionally NOT scored until a suitable evidence model exists.
  {
    ...find(LOTE_F_QUESTIONS_V2, "q2_startup_demand_signal"),
    prompt: "Al mostrar tu idea u oferta, ¿qué respuesta concreta has recibido hasta ahora?",
    hint: "Distingue interés, solicitudes, pruebas pagadas y compromisos. Una intención de compra no equivale a una venta.",
    appliesWhen: prelaunch,
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },

  // ECOMMERCE: seeing an abandoned cart does not imply you can identify or
  // legally contact its owner. Visibility is only supporting measurement evidence.
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_cart_visibility"),
    prompt: "¿Puedes saber si alguien añadió productos al carrito de tu tienda online y no completó la compra?",
    hint: "Se trata de detectar compras interrumpidas, no de saber quién es cada persona ni de poder contactarla.",
    appliesWhen: ecommerce,
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_ecommerce_cart_visibility", 1, "measurement_optimization", "supporting", {
      yes: "established", no: "missing", unknown: "uncertainty",
    }),
  },
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_cart_followup"),
    // v2: two neutral options are added; do not remap historical v1 answers
    // without an explicit future session-migration decision.
    version: 2,
    scoringReadiness: { ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_cart_followup").scoringReadiness!, allowsUnknown: true, allowsNotApplicable: true },
    prompt: "Cuando alguien abandona una compra y tienes permiso para contactarlo, ¿sueles enviarle un recordatorio?",
    hint: "Cuenta solo comunicaciones permitidas. Ver un carrito abandonado no significa conocer a su dueño.",
    appliesWhen: andV2(ecommerce, eqV2("q2_ecommerce_cart_visibility", "yes")),
    options: [
      ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_cart_followup").options.map((option) => ({
        ...option, label: option.value === "always" ? "En casi todos los casos en que puedo contactarlo"
          : option.value === "sometimes" ? "En algunos casos, pero no siempre"
          : "Casi nunca, aunque podría contactar a algunas personas",
      })),
      { value: "no_authorized_contact", label: "No puedo identificar o contactar con permiso a esas personas", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_ecommerce_cart_followup", 2, "relationship_recurrence", "direct", {
      always: "established", sometimes: "partial", rarely: "weak",
      no_authorized_contact: "not_applicable", unknown: "uncertainty",
    }),
  },
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_repeat_purchase"),
    prompt: "¿Con qué frecuencia vuelve a comprar un cliente que ya compró antes en tu tienda online?",
    hint: "Piensa en compradores que repiten. No confundas muchas ventas con varias compras de la misma persona.",
    appliesWhen: ecommerce,
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },

  // HOSPITALITY: bookings and appointment services are distinct. Arrival
  // pattern, reservation no-shows and capacity constraints are operational
  // context, NOT evidence of bad digital maturity or missing automation.
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_flow_type"),
    version: 2,
    scoringReadiness: { ...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_flow_type").scoringReadiness!, allowsUnknown: true },
    prompt: "¿Cómo llegan o solicitan atención habitualmente las personas en tu restaurante o negocio de hospedaje?",
    hint: "Piensa en reservas, visitas sin reserva y pedidos anticipados. Elige la modalidad predominante.",
    appliesWhen: hospitality,
    options: [...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_flow_type").options, {
      value: "unknown", label: "No estoy seguro de cuál predomina", kind: "unknown",
    }],
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_reservation_noshow"),
    version: 2,
    scoringReadiness: { ...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_reservation_noshow").scoringReadiness!, allowsUnknown: true },
    prompt: "Cuando alguien reserva una mesa o alojamiento, ¿con qué frecuencia no se presenta?",
    hint: "Responde solo sobre reservas reales. No cuentes consultas sin reserva ni citas de servicios profesionales.",
    appliesWhen: andV2(hospitality, inV2("q2_hospitality_flow_type", ["reservation", "mixed"])),
    options: [...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_reservation_noshow").options, {
      value: "unknown", label: "No lo he revisado", kind: "unknown",
    }],
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_hospitality_peak_capacity"),
    prompt: "En los momentos de mayor demanda, ¿con qué frecuencia rechazas clientes o los haces esperar mucho por falta de capacidad?",
    hint: "Piensa en limitaciones de personal, espacio o tiempo. Tener mucha demanda no implica un problema digital.",
    appliesWhen: hospitality,
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },

  // B2B: the buyer classification must be explicit; QA-03B does not infer b2b
  // solely from the operational archetype.
  {
    ...find(LOTE_D_QUESTIONS_V2, "q2_b2b_qualification"),
    prompt: "Cuando una empresa pide información, ¿tienes criterios para saber si podría comprar o contratar lo que ofreces?",
    hint: "Por ejemplo: necesidad real, presupuesto, plazos o capacidad para decidir. No basta con que alguien pida información.",
    appliesWhen: b2b,
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_b2b_qualification", 1, "digital_readiness", "direct", {
      yes_clear: "established", somewhat: "partial", no: "weak", unknown: "uncertainty",
    }),
  },
  {
    ...find(LOTE_D_QUESTIONS_V2, "q2_creator_channel_concentration"),
    prompt: "¿Hasta qué punto se concentra tu audiencia activa en una sola red social o plataforma?",
    hint: "Piensa en dónde están las personas que realmente siguen tu contenido, no solo en cuántos perfiles tienes.",
    appliesWhen: creator,
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },
  {
    ...find(LOTE_D_QUESTIONS_V2, "q2_nonprofit_membership_lifecycle"),
    prompt: "Si tu organización tiene miembros, ¿está claro cómo pueden incorporarse o renovar su membresía?",
    hint: "Considera tanto el alta como la renovación. Si uno de esos pasos es confuso, no marques que ambos son claros.",
    appliesWhen: andV2(nonprofit, inV2("q2_nonprofit_support_type", ["membership_dues", "mixed"])),
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_nonprofit_membership_lifecycle", 1, "conversion_access", "direct", {
      yes_clear: "established", somewhat: "partial", no: "weak", unknown: "uncertainty",
    }),
  },

  // LOCAL SERVICE AND RETURN: these describe business context. A client who
  // does not return is NOT direct proof of weak digital presence.
  {
    ...find(LOTE_B_QUESTIONS_V2, "q2_local_repeat_customers"),
    version: 2,
    scoringReadiness: { ...find(LOTE_B_QUESTIONS_V2, "q2_local_repeat_customers").scoringReadiness!, allowsNotApplicable: true },
    prompt: "Entre las personas que ya compraron o visitaron tu negocio, ¿con qué frecuencia vuelven?",
    hint: "Cuenta a quienes regresan realmente. Si lo que ofreces normalmente se compra una sola vez, indícalo.",
    appliesWhen: andV2(activeWithHistory, archetypeIncludesAny(["local", "retail", "hospitality"])),
    options: [...find(LOTE_B_QUESTIONS_V2, "q2_local_repeat_customers").options, {
      value: "not_applicable", label: "No aplica: normalmente es una compra o visita única", kind: "not_applicable",
    }],
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },
  {
    ...find(LOTE_B_QUESTIONS_V2, "q2_service_area_clarity"),
    prompt: "¿Tienes definida la zona hasta la que te conviene desplazarte para prestar tus servicios?",
    hint: "Piensa en la distancia y las condiciones de desplazamiento, no en dónde vive todo tu público.",
    appliesWhen: andV2(inV2("q2_operational_status", ["operating", "preparing"]), archetypeIncludes("local_service")),
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },

  // CROSS-CUTTING: only current operations and declared goals/frictions.
  {
    ...find(LOTE_E_QUESTIONS_V2, "q2_operations_process_ownership"),
    prompt: "Cuando hay una tarea habitual importante, ¿está claro quién debe encargarse sin decidirlo otra vez?",
    hint: "Puede ser una sola persona o varias. Evalúa si la responsabilidad está clara en el trabajo real.",
    appliesWhen: operations,
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_operations_process_ownership", 1, "digital_readiness", "direct", {
      yes_clear: "established", somewhat: "partial", improvised: "weak", unknown: "uncertainty",
    }),
  },
  {
    ...find(LOTE_E_QUESTIONS_V2, "q2_followup_status_visibility"),
    prompt: "¿Con qué frecuencia revisas tus asuntos pendientes para comprobar si alguno necesita respuesta o seguimiento?",
    hint: "Piensa en revisiones reales de clientes, pedidos o tareas, no en recordar un asunto por casualidad.",
    appliesWhen: followup,
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_followup_status_visibility", 1, "relationship_recurrence", "direct", {
      regularly: "established", only_when_remember: "partial", rarely: "weak", unknown: "uncertainty",
    }),
  },
  {
    ...find(LOTE_E_QUESTIONS_V2, "q2_measurement_source_confidence"),
    prompt: "Cuando llega un nuevo cliente, ¿sabes por qué medio conoció tu negocio o trabajo?",
    hint: "Responde según datos que realmente registras o preguntas, no por suposiciones sobre redes o publicidad.",
    appliesWhen: measurement,
    evidenceMigration: "migrated",
    evidenceV3: evidence("q2_measurement_source_confidence", 1, "measurement_optimization", "direct", {
      yes_confident: "established", sometimes: "partial", rarely_no_idea: "weak", unknown: "uncertainty",
    }),
    variants: [
      { target: { terminology: ["nonprofit"] }, prompt: "Cuando alguien empieza a participar o apoyar tu organización, ¿sabes cómo la conoció?" },
      { target: { nicheGroup: "health_wellness" }, prompt: "Cuando una persona solicita atención, ¿sabes cómo conoció tu servicio?" },
    ],
  },
];

/** Deterministic duplicate guard for the experimental recovery wave. */
if (new Set(QA03B_RECOVERY_WAVE2_QUESTIONS.map((q) => q.id)).size !== QA03B_RECOVERY_WAVE2_QUESTIONS.length) {
  throw new Error("QA-03B recovery wave 2 has duplicate IDs");
}
