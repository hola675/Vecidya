import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { archetypeIncludesAny, andV2, contextEquals } from "./qbv2-rules";

/** R2F reviewed local Foundation and cross-cutting Trust observations; scoring awaits R3. */
export const REVIEWED_LOCAL_TRUST_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_local_presence_consistency",
    version: 2,
    evidenceMigration: "pending",
    module: "local",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando alguien busca tu negocio en internet, ¿encuentra información correcta y actualizada para ubicarte o contactarte?",
    hint: "Piensa en datos como teléfono, WhatsApp, dirección u horario, solo cuando apliquen a tu negocio.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("activity", "active"), archetypeIncludesAny(["local", "retail", "hospitality"])),
    options: [
      { value: "consistent", label: "Sí, la información principal está correcta y actualizada" },
      { value: "partial", label: "Hay algunos datos desactualizados, diferentes o incompletos" },
      { value: "no", label: "No, esa información es difícil de encontrar o todavía está incompleta" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
  },
  {
    id: "q2_reputation_flow",
    version: 3,
    evidenceMigration: "pending",
    module: "reputation",
    type: "single",
    routingRole: "adaptive",
    prompt: "¿Tienes reseñas, testimonios u opiniones visibles de personas que ya tuvieron experiencia contigo?",
    hint: "Piensa en reseñas de Google, testimonios en tu web, redes u otros lugares que una persona nueva pueda consultar.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: contextEquals("activity", "active"),
    options: [
      { value: "strong", label: "Sí, tengo varias y siguen llegando nuevas" },
      { value: "partial", label: "Sí, pero son pocas o llevan tiempo sin actualizarse" },
      { value: "weak", label: "Casi no tengo reseñas o testimonios visibles" },
      { value: "unknown", label: "No lo sé o no lo he revisado", kind: "unknown" },
    ],
  },
];
