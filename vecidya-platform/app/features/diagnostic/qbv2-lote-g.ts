import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, contextEquals, contextIn, eqV2, notV2, orV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08D.1 — Targeted Evidence Enrichment.
 *
 * Solo entran preguntas que cierran un hueco de banco CONFIRMADO por las 12 golden y la auditoría de
 * evidencia directa (no por estadística de cobertura). Antes de añadir nada se agotaron reglas de
 * planner/gating y mappings existentes; estas tres capacidades no eran observables con el banco actual:
 *
 * - Conversion & Access: solo appointments (`q2_appointments_lead_to_booking`) observaba si el interés
 *   termina en clientes. B2B, retail y local no tenían ninguna observación directa de conversión;
 *   professional, ecommerce, creator, hospitality y nonprofit tenían una sola. Con friction `conversion`
 *   o goal `opportunities`, el diagnóstico quedaba sin medir el problema declarado.
 * - Digital Readiness bajo friction `operations`/`scale`: las cinco preguntas de `operations` miden salud
 *   operativa general y son `supporting` por auditoría 08C (no prueban capacidad DIGITAL). Las directas de
 *   Readiness eran todas de un archetype concreto (b2b, hospitality, creator, nonprofit).
 *
 * Auditoría contra contenido existente (no duplicar):
 * - `q2_measurement_outcome_tracking` pregunta si la persona SABE cuántas consultas terminan en resultado
 *   (medición); `q2_conversion_interest_to_action` lee la proporción que la persona observa (conversión).
 *   Se excluye appointments porque `q2_appointments_lead_to_booking` ya mide exactamente eso.
 * - `q2_process_systemization` pregunta si hay una forma definida de hacer tareas; `q2_operations_bottleneck`
 *   pregunta qué limita más. Ninguna observa dónde vive la información ni qué ya corre sin intervención manual.
 * - `q2_capacity_signal` registra presión de demanda pasada (contexto), no capacidad digital.
 */
export const LOTE_G_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_conversion_interest_to_action",
    version: 1,
    module: "conversion",
    type: "single",
    prompt: "De las personas que muestran interés en lo que ofreces (preguntan, piden información o una cotización), ¿qué proporción termina comprando o contratando?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Material-only: entra solo para cubrir conversión declarada y no observada. Sin clientes no hay
    // proporción que observar; appointments ya tiene su versión específica.
    materialAppliesWhen: andV2(eqV2("q2_has_customers", "yes"), orV2(contextEquals("primaryFriction", "conversion"), contextEquals("primaryGoal", "opportunities")), notV2(archetypeIncludes("appointments"))),
    variants: [{ target: { businessModel: "nonprofit" }, prompt: "De las personas que muestran interés en apoyar o participar en tu organización, ¿qué proporción termina haciéndolo?" }],
    options: [
      { value: "most", label: "La mayoría" },
      { value: "about_half", label: "Más o menos la mitad" },
      { value: "few", label: "Pocas" },
      { value: "unknown", label: "No lo he observado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si el interés que ya llega se convierte en clientes o participación.",
      distinction: "Piensa en lo que realmente ocurre con quienes preguntan, no en cuántas personas te encuentran.",
    },
  },
  {
    id: "q2_operations_information_base",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "¿Dónde vive hoy la información de tus clientes, pedidos o pendientes?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(eqV2("q2_has_customers", "yes"), contextIn("primaryFriction", ["operations", "scale"])),
    options: [
      { value: "shared_system", label: "En un sistema o herramienta digital que se usa de forma consistente" },
      { value: "scattered_digital", label: "En archivos digitales (hojas de cálculo, notas, chats), pero dispersos" },
      { value: "paper_or_memory", label: "En papel, en mensajes sueltos o en la memoria de alguien" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si existe una base digital sobre la que el negocio pueda organizarse y crecer.",
      distinction: "Lo que importa es dónde se consulta la información en el día a día, no si existe alguna copia digital.",
    },
  },
  {
    id: "q2_operations_automation_adoption",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "De las tareas que se repiten (confirmaciones, recordatorios, respuestas frecuentes, registro de pedidos), ¿cuántas ya se hacen solas con alguna herramienta?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(eqV2("q2_has_customers", "yes"), contextIn("primaryFriction", ["operations", "scale"])),
    options: [
      { value: "most_automated", label: "La mayoría ya se hace sola" },
      { value: "some_automated", label: "Algunas" },
      { value: "none_automated", label: "Ninguna, todo se hace a mano" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Qué parte del trabajo repetitivo ya se sostiene sin intervención manual.",
      distinction: "Cuenta solo lo que ocurre sin que alguien lo dispare a mano cada vez.",
    },
  },
];
