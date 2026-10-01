import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, answeredV2, archetypeIncludes, contextIn, eqV2, notV2 } from "./qbv2-rules";

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
    // Material-only: entra solo para cubrir una necesidad de conversión abierta. Sin clientes no hay
    // proporción que observar; appointments ya tiene su versión específica. DIAG-V3-08E.3: el alcance describe
    // dónde aplica (no qué meta/fricción la pide) — p. ej. la meta `stop_losing` al inicio, vía conversión.
    materialAppliesWhen: andV2(eqV2("q2_has_customers", "yes"), notV2(archetypeIncludes("appointments"))),
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
    // DIAG-V3-08E.1: genérica para cualquier negocio con clientes; fuera de operations/scale solo como evidencia
    // material (p. ej. capacidad desconocida que debe sostener un descubrimiento o un seguimiento débiles).
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
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
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
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
  // ── DIAG-V3-08E.1: final evidence completion (confirmed bank gaps) ─────────
  // Clarity: only retail (product visibility), b2b (qualification) and projects (startup) had a direct
  // observation; appointments, creator, ecommerce, hospitality, local, local_service and professional could
  // not observe whether an outsider understands the offer, even when it blocked a weak conversion/discovery.
  {
    id: "q2_presence_offer_clarity",
    version: 1,
    module: "presence",
    type: "single",
    prompt: "Cuando alguien que no te conoce ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué ofreces, para quién es y por qué elegirte?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Material-only: entra solo cuando claridad es una necesidad material (p. ej. prerrequisito desconocido de
    // una conversión o un descubrimiento débiles). Sin clientes, las preguntas de startup ya la observan.
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
    variants: [{ target: { businessModel: "nonprofit" }, prompt: "Cuando alguien que no conoce tu organización ve tu página, perfil o publicación por primera vez, ¿entiende rápido qué hacen, a quién ayudan y por qué apoyarlos?" }],
    options: [
      { value: "all_clear", label: "Sí, se entiende qué ofrezco, para quién y por qué elegirme" },
      { value: "offer_only", label: "Se entiende qué ofrezco, pero no tanto para quién ni por qué elegirme" },
      { value: "not_clear", label: "No, suelen tener que preguntar para entenderlo" },
      { value: "unknown", label: "No lo he comprobado con alguien de fuera", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si alguien de fuera entiende la oferta sin explicación adicional.",
      distinction: "Piensa en lo que entiende una persona nueva al verlo, no en lo que tú explicas cuando te preguntan.",
    },
  },
  // Foundation: only local/retail/hospitality (address, hours, contact) and ecommerce (storefront) had a direct
  // observation; appointments, local_service, professional, b2b and creator had none, and the physical wording
  // of `q2_local_presence_consistency` does not fit a service-area, B2B or creator business.
  {
    id: "q2_presence_digital_base",
    version: 1,
    module: "presence",
    type: "single",
    prompt: "Si alguien te busca en internet, ¿encuentra un lugar propio y actualizado (página web, perfil de negocio o similar) donde ver lo que haces y cómo contactarte?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Material-only: entra solo cuando la base digital es una necesidad material (p. ej. prerrequisito
    // desconocido de un descubrimiento o una conversión débiles). Aplica también antes del lanzamiento: un
    // proyecto ya puede tener (o no) un lugar donde encontrarlo.
    materialAppliesWhen: answeredV2("q2_has_customers"),
    options: [
      { value: "own_updated", label: "Sí, un lugar propio y actualizado" },
      { value: "outdated", label: "Existe, pero está incompleto o desactualizado" },
      { value: "third_party_only", label: "Solo perfiles en redes o plataformas que no controlo" },
      { value: "nothing", label: "No, todavía no hay un lugar donde encontrarme" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Si existe una base digital propia que el negocio controla y mantiene al día.",
      distinction: "Un perfil en una plataforma ajena cuenta distinto que un lugar propio: piensa en cuál controlas tú.",
    },
  },
];
