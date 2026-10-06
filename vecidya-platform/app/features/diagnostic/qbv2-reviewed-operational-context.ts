import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { eqV2 } from "./qbv2-rules";

/** R2D candidate only: reviewed questions 17–18; production remains frozen on QUESTION_BANK_V2. */
export const REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_process_systemization",
    version: 2,
    module: "maturity",
    type: "single",
    routingRole: "adaptive",
    prompt: "¿Cómo manejas las tareas que se repiten en tu actividad?",
    hint: "Por ejemplo: responder consultas, registrar pedidos, preparar una cotización, confirmar una cita o hacer seguimiento.",
    purpose: ["maturity"],
    priority: "normal",
    appliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "defined", label: "Normalmente se hacen de la misma manera", produces: [{ kind: "processConsistency", value: "defined", provenance: "explicit_declaration" }] },
      { value: "partial", label: "Algunas tienen una forma clara y otras se resuelven sobre la marcha", produces: [{ kind: "processConsistency", value: "partial", provenance: "explicit_declaration" }] },
      { value: "informal", label: "La mayoría depende de la memoria o de cómo se resuelva en el momento", produces: [{ kind: "processConsistency", value: "informal", provenance: "explicit_declaration" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", produces: [{ kind: "processConsistencyUnknown", value: true, provenance: "explicit_declaration" }] },
    ],
  },
  {
    id: "q2_capacity_signal",
    version: 2,
    module: "maturity",
    type: "multi",
    routingRole: "adaptive",
    prompt: "En los últimos meses, ¿cuál de estas situaciones ha pasado en tu actividad?",
    hint: "Puedes elegir más de una. Piensa en los últimos meses: pendientes, demoras, más horas o trabajo rechazado.",
    purpose: ["maturity"],
    priority: "normal",
    appliesWhen: eqV2("q2_regularity", "regular"),
    options: [
      { value: "capacity_pressure", label: "A veces tenemos más trabajo del que podemos atender bien", produces: [{ kind: "reviewedCapacityPressure", value: true, provenance: "explicit_declaration" }] },
      { value: "capacity_expanded", label: "Hemos aumentado horarios, personal, espacio o recursos para poder atender más", produces: [{ kind: "reviewedCapacityExpansion", value: true, provenance: "explicit_declaration" }] },
      { value: "stable", label: "La capacidad que tenemos ha sido suficiente", exclusive: true, produces: [{ kind: "reviewedCapacityPressure", value: false, provenance: "explicit_declaration" }, { kind: "reviewedCapacityExpansion", value: false, provenance: "explicit_declaration" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true, produces: [{ kind: "reviewedCapacityUnknown", value: true, provenance: "explicit_declaration" }] },
    ],
  },
];
