import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { andV2, archetypeIncludes, eqV2, inV2, notEqV2, notV2, orV2 } from "../qbv2-rules";
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
const healthGenericGate = notEqV2("q2_niche_health_wellness", "dentist");

// Generic clarity stays available until a known specialty can replace it.
const foodSpecialistEligible = andV2(
  activeHistory,
  inV2("q2_niche_food_hospitality", ["restaurant", "cafe", "food_truck"]),
  eqV2("q2_goal", "explain"),
  inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"]),
);
const agencySpecialistEligible = andV2(
  activeHistory,
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
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_niche_health_wellness", "dentist"),
      archetypeIncludes("appointments"),
      orV2(eqV2("q2_goal", "stop_losing"), eqV2("q2_friction", "follow_up")),
    ),
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
    appliesWhen: andV2(
      activeHistory,
      inV2("q2_niche_food_hospitality", ["restaurant", "cafe", "food_truck"]),
      eqV2("q2_goal", "explain"),
      inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"]),
    ),
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
    appliesWhen: andV2(
      activeHistory,
      eqV2("q2_niche_b2b_services", "marketing_agency"),
      eqV2("q2_goal", "explain"),
      inV2("q2_customer_buyer", ["b2b", "mixed"]),
      inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"]),
    ),
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
