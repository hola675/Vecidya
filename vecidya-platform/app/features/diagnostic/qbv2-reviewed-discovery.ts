import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { contextEquals } from "./qbv2-rules";

/** R2F: universal reviewed observation of reliable reach; scoring awaits R3. */
export const REVIEWED_DISCOVERY_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_discovery_reliable_reach",
    version: 1,
    evidenceMigration: "pending",
    module: "discovery",
    type: "single",
    routingRole: "adaptive",
    prompt: "En los últimos meses, ¿qué tan confiable ha sido la forma que tienes de llegar a personas nuevas interesadas en lo que ofreces?",
    hint: "Piensa si llegas a personas nuevas con cierta constancia, sin importar si vienen por Google, redes, recomendaciones, anuncios u otra vía.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: contextEquals("activity", "active"),
    options: [
      { value: "reliable", label: "Sí, funciona de forma bastante constante", produces: [{ kind: "discoveryReachReliability", value: "reliable", provenance: "explicit_declaration" }] },
      { value: "irregular", label: "A veces funciona, pero es irregular", produces: [{ kind: "discoveryReachReliability", value: "irregular", provenance: "explicit_declaration" }] },
      { value: "weak", label: "Todavía no tengo una forma que funcione con suficiente constancia", produces: [{ kind: "discoveryReachReliability", value: "weak", provenance: "explicit_declaration" }] },
      { value: "not_seeking", label: "Ahora mismo no estoy buscando llegar a personas nuevas", produces: [{ kind: "discoveryReachReliability", value: "not_seeking", provenance: "explicit_declaration" }] },
      { value: "unknown", label: "No lo sé o no lo he revisado", kind: "unknown", produces: [{ kind: "discoveryReachReliabilityUnknown", value: true, provenance: "explicit_declaration" }] },
    ],
  },
];
