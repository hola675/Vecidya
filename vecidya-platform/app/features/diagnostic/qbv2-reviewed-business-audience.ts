import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, contextEquals, contextIn, orV2 } from "./qbv2-rules";

/** R2I: observable access to opportunity context and direct audience contact, pending R3. */
export const REVIEWED_BUSINESS_AUDIENCE_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_b2b_status_visibility",
    version: 2,
    evidenceMigration: "pending",
    module: "b2b",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando hay personas u organizaciones interesadas en avanzar contigo, ¿qué tan fácil es recuperar en qué quedó cada oportunidad?",
    hint: "Puedes consultar memoria, notas, una hoja u otra herramienta. Lo importante es recuperar la información cuando la necesitas.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("activity", "active"), contextIn("customerBuyer", ["b2b", "mixed"]), orV2(contextEquals("primaryGoal", "organize"), contextEquals("primaryFriction", "operations"))),
    options: [
      { value: "clear", label: "Normalmente puedo recuperar el estado de cada oportunidad" },
      { value: "partial", label: "A veces tengo que reconstruir información para saber en qué quedó" },
      { value: "lose_track", label: "A veces no logro recuperar en qué quedó una oportunidad" },
      { value: "not_applicable", label: "No suelo tener oportunidades abiertas entre una conversación y otra", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_creator_audience_ownership",
    version: 2,
    evidenceMigration: "pending",
    module: "creator",
    type: "single",
    routingRole: "adaptive",
    prompt: "Además de publicar contenido, ¿tienes alguna forma de volver a comunicarte directamente con parte de tu audiencia?",
    hint: "Piensa en una vía directa que puedas usar con permiso de esas personas. No importa la herramienta ni cuántas plataformas uses.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("activity", "active"), contextEquals("businessModel", "creator_audience"), orV2(contextEquals("primaryGoal", "stop_losing"), contextEquals("primaryFriction", "follow_up"))),
    options: [
      { value: "direct_consistent", label: "Sí, tengo una vía directa utilizable para volver a comunicarme" },
      { value: "direct_limited", label: "Solo tengo una vía directa con algunas personas" },
      { value: "platform_only", label: "Normalmente dependo de que vuelvan a encontrar mis publicaciones" },
      { value: "not_applicable", label: "No necesito volver a contactar directamente a mi audiencia", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
];
