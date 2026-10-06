import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludesAny, contextEquals, contextIn, eqV2, inV2, notV2, orV2 } from "./qbv2-rules";

const operatingNeed = andV2(contextEquals("activity", "active"), orV2(contextEquals("primaryGoal", "organize"), contextEquals("primaryFriction", "operations")));
const clarityNeed = contextEquals("primaryGoal", "explain");
const physicalCoverage = andV2(contextEquals("activity", "active"), archetypeIncludesAny(["local", "retail", "hospitality", "ecommerce"]));

/** R2J observations only; evidence semantics remain pending R3. No runtime registration. */
export const REVIEWED_TRANSVERSAL_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_operations_handoffs", version: 2, evidenceMigration: "pending",
    module: "operations", type: "single", routingRole: "deepening",
    prompt: "Cuando un trabajo pasa de una persona a otra, ¿la información necesaria para continuarlo llega completa?",
    hint: "Piensa en un traspaso real. No importa si se hace hablando, con notas o con una herramienta.",
    purpose: ["diagnostic"], priority: "normal",
    materialAppliesWhen: andV2(operatingNeed, eqV2("q2_other_staff", "yes")),
    options: [
      { value: "complete", label: "Normalmente llega completa y permite continuar" },
      { value: "partial", label: "A veces falta información y hay que volver a preguntar" },
      { value: "incomplete", label: "Con frecuencia falta información necesaria para continuar" },
      { value: "not_applicable", label: "No hay trabajos que pasen de una persona a otra", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_followup_general_process", version: 2, evidenceMigration: "pending",
    module: "follow_up", type: "single", routingRole: "deepening",
    prompt: "Cuando alguien queda esperando una respuesta o un siguiente paso, ¿sueles retomar ese pendiente a tiempo?",
    hint: "No importa si usas memoria, notas, recordatorios o automatización. Piensa en lo que ocurre con pendientes reales.",
    purpose: ["diagnostic"], priority: "normal",
    materialAppliesWhen: andV2(contextEquals("activity", "active"), eqV2("q2_friction", "follow_up"), notV2(archetypeIncludesAny(["local_service", "appointments", "retail"])), notV2(contextIn("customerBuyer", ["b2b", "mixed"])), notV2(contextEquals("businessModel", "creator_audience"))),
    options: [
      { value: "consistent", label: "Normalmente se retoman a tiempo" },
      { value: "partial", label: "Generalmente se retoman, aunque algunos se demoran" },
      { value: "sometimes_lost", label: "Con frecuencia hay pendientes que quedan sin retomar" },
      { value: "not_applicable", label: "Actualmente no hay interacciones que necesiten una respuesta posterior", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro de lo que ocurre normalmente", kind: "unknown" },
    ],
  },
  {
    id: "q2_operations_information_base", version: 2, evidenceMigration: "pending",
    module: "operations", type: "single", routingRole: "deepening",
    prompt: "Cuando necesitas continuar un trabajo, ¿qué tan fácil es encontrar la información correcta y actualizada?",
    hint: "Puede estar en papel, notas, una agenda o una herramienta digital. Importa poder recuperar la información correcta.",
    purpose: ["diagnostic"], priority: "normal",
    materialAppliesWhen: operatingNeed,
    options: [
      { value: "easy_reliable", label: "Normalmente puedo encontrar la información correcta fácilmente" },
      { value: "somewhat_scattered", label: "Puedo encontrarla, pero a veces tengo que revisar varios lugares" },
      { value: "difficult_unreliable", label: "Cuesta encontrarla o saber cuál está actualizada" },
      { value: "not_applicable", label: "No necesito recuperar información para continuar trabajos", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_presence_digital_base", version: 2, evidenceMigration: "pending",
    module: "presence", type: "single", routingRole: "adaptive",
    prompt: "Si alguien te busca en internet, ¿encuentra un lugar con información actualizada para conocerte y contactarte?",
    hint: "Puede ser una web, ficha, perfil o plataforma. Importa que puedas mantener la información correcta, no ser dueño del sitio.",
    purpose: ["diagnostic"], priority: "normal",
    appliesWhen: andV2(contextIn("activity", ["active", "prelaunch"]), notV2(physicalCoverage), orV2(clarityNeed, contextEquals("primaryGoal", "be_found"), contextEquals("primaryFriction", "visibility"))),
    options: [
      { value: "reliable_presence", label: "Sí, hay al menos un lugar con información correcta que mantengo actualizada" },
      { value: "partial_presence", label: "Existe, pero tiene información incompleta o desactualizada" },
      { value: "no_reliable_presence", label: "Todavía no hay un lugar con información que mantenga actualizada" },
      { value: "not_applicable", label: "Todavía no necesito una presencia pública en internet", kind: "not_applicable" },
      { value: "unknown", label: "No lo sé o no lo he revisado", kind: "unknown" },
    ],
  },
  {
    id: "q2_presence_offer_clarity", version: 2, evidenceMigration: "pending",
    module: "presence", type: "single", routingRole: "deepening",
    prompt: "Cuando alguien nuevo ve tu presencia en internet, ¿puede entender fácilmente qué ofreces?",
    hint: "Piensa en lo que puede entender antes de hablar contigo. No se trata de cuántas personas compran o te eligen.",
    purpose: ["diagnostic"], priority: "normal",
    materialAppliesWhen: andV2(contextIn("activity", ["active", "prelaunch"]), clarityNeed, notV2(andV2(contextEquals("activity", "active"), archetypeIncludesAny(["retail"]))), inV2("q2_presence_digital_base", ["reliable_presence", "partial_presence"])),
    options: [
      { value: "clear", label: "Normalmente se entiende sin tener que preguntar" },
      { value: "partial", label: "Se entiende en general, pero algunas cosas quedan poco claras" },
      { value: "unclear", label: "Cuesta entender qué ofrezco sin pedir una explicación" },
      { value: "not_applicable", label: "Ese lugar todavía no presenta una oferta", kind: "not_applicable" },
      { value: "unknown", label: "No lo sé o no lo he revisado desde fuera", kind: "unknown" },
    ],
  },
];
