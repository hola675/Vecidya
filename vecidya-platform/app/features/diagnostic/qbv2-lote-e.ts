import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, contextEquals, eqV2, notEqV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote E: `operations`/`follow_up`/`measurement` (salud operativa transversal).
 *
 * A diferencia de Lote A-D, estos tres módulos son cross-cutting por PrimaryFriction/PrimaryGoal (ya
 * declarados así en `MODULE_REGISTRY.relevantWhen` desde 08B.2), no por `archetype`/`businessModel`:
 * `operations` gatea en `contextEquals("primaryFriction", "operations")`, `follow_up` en
 * `contextEquals("primaryFriction", "follow_up")`, `measurement` en `contextEquals("primaryGoal", "measure")`.
 * Aplican sin importar el archetype — foundation → contexto especializado → salud operativa transversal
 * (la tercera capa del diagnóstico, §objetivo del checkpoint de Lote E).
 *
 * Como estas preguntas solo se alcanzan DESPUÉS de que la fricción/meta ya se resolvió (por
 * autodeclaración en `q2_friction`/`q2_goal`, la fuente más fuerte para `PrimaryFriction`/`PrimaryGoal`),
 * NINGUNA pregunta de este lote vuelve a producir `friction: "operations"`/`"follow_up"` — sería
 * circular (la fricción ya está resuelta para que la pregunta sea elegible). Son diagnósticas puras:
 * aportan evidencia/detalle adicional, no reclasifican lo que ya se sabe.
 *
 * Auditoría explícita contra contenido existente (§37-39 del checkpoint, no repetir):
 * - `q2_process_systemization` (Lote A, maturity): "¿hay un proceso definido?" en general. Este lote NO
 *   repite esa pregunta — cubre ownership/handoffs/bottleneck/manual-work/dependencia de una persona,
 *   facetas DISTINTAS de sistematización, no la misma pregunta con otro ID.
 * - `q2_b2b_status_visibility` (Lote D): DECISIÓN = REUSE tal cual, específica de "oportunidades" B2B.
 *   El fresh domain review de este lote encontró que la primera versión de `q2_followup_status_visibility`
 *   repetía casi palabra por palabra su prompt Y sus 4 opciones — corregido: la versión final mide el
 *   HÁBITO de repasar pendientes de forma activa (frecuencia de una acción), no una confianza puntual
 *   sobre el estado actual, así que ya no compite con la pregunta B2B ni con `q2_followup_general_process`.
 * - Follow-up específico por archetype (`q2_service_quote_followup`, `q2_appointments_confirmation_reminders`,
 *   `q2_ecommerce_cart_followup`, `q2_professional_followup_after_consult`, `q2_nonprofit_membership_lifecycle`):
 *   DECISIÓN = REUSE, todas se mantienen. El módulo `follow_up` global mide la CAPACIDAD/proceso general
 *   ("cuando algo queda pendiente, ¿cómo se retoma?"), nunca el mecanismo específico (carrito, cita,
 *   cotización) que esas preguntas ya cubren — complementarias, no redundantes.
 * - No se crea una pregunta global de re-engagement (§15 del checkpoint): ya cubierta específicamente
 *   por archetype en los casos reales (carrito, cotización, consulta, rebooking); una versión genérica
 *   adicional sería redundante en la mayoría de los casos reales.
 * - `q2_measurement_source_confidence`/`q2_measurement_outcome_tracking` (abajo) miden CONFIANZA/
 *   capacidad de atribución y visibilidad de conversión — distinto de "de qué canal vienen" (ya cubierto
 *   por `q2_b2b_lead_source`/`q2_local_discovery`/`q2_ecommerce_traffic_sources`), que nombra el canal
 *   específico, no si la persona confía en saberlo.
 *
 * Protección de stage (§33 del checkpoint): `q2_measurement_source_confidence`/`_outcome_tracking`/
 * `_decision_review` requieren `q2_has_customers=yes` — una idea sin operación real no puede evaluar
 * confianza de atribución ni tracking de conversión de algo que todavía no existe.
 */
export const LOTE_E_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  // ── OPERATIONS ───────────────────────────────────────────────────────────────
  {
    id: "q2_operations_process_ownership",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "Cuando hay que hacer una tarea importante y recurrente del negocio, ¿está claro quién la hace, sin tener que decidirlo cada vez?",
    helper: "Esto aplica igual si trabajas solo: la claridad es sobre la tarea, no sobre el tamaño del equipo.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "operations"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_clear", label: "Sí, está claro" },
      { value: "somewhat", label: "Más o menos, depende del caso" },
      { value: "improvised", label: "No, se decide de forma improvisada" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_operations_handoffs",
    version: 1,
    module: "operations",
    type: "single",
    // Reformulado tras fresh domain review: el prompt original afirmaba el traspaso como un hecho
    // existente ("cuando el trabajo pasa de una persona a otra"), presuponiendo equipo antes de que el
    // respondiente viera la opción not_applicable — a diferencia de su hermana q2_followup_ownership,
    // que ya condicionaba correctamente ("cuando hay más de una persona involucrada"). Ahora usa el
    // mismo patrón condicional.
    prompt: "Cuando hay más de una persona involucrada en el trabajo (por ejemplo, de quien atiende al cliente a quien lo resuelve), ¿la información se transfiere completa, o se pierde o duplica seguido?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "operations"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "transfers_cleanly", label: "Se transfiere completa" },
      { value: "sometimes_lost", label: "A veces se pierde o duplica" },
      // N/A legítimo (§6 del checkpoint): solo aplica cuando hay más de una persona/rol.
      { value: "not_applicable", label: "No aplica: trabajo solo, no hay traspasos entre personas", kind: "not_applicable" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad", "seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: true },
  },
  {
    id: "q2_operations_bottleneck",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "¿Qué es lo que más limita tu capacidad para atender más trabajo o clientes ahora mismo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "operations"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "one_person", label: "Depender de una sola persona (incluido yo)" },
      { value: "manual_tasks", label: "Tareas manuales que toman mucho tiempo" },
      { value: "approvals", label: "Esperar aprobaciones o decisiones" },
      { value: "scattered_info", label: "Información dispersa, difícil de encontrar" },
      { value: "no_clear_bottleneck", label: "No siento que tenga un cuello de botella claro" },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance", "seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_operations_manual_impact",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "El trabajo manual y repetitivo en tu negocio, ¿te hace perder tiempo, cometer errores, o limita cuánto puedes atender?",
    helper: "No se trata de si usas algo manual (eso es normal), sino de si te está costando de verdad.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "operations"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "significant", label: "Sí, de forma importante" },
      { value: "somewhat", label: "Un poco" },
      { value: "not_really", label: "No realmente" },
      { value: "unknown", label: "No lo había medido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_operations_dependency",
    version: 1,
    module: "operations",
    type: "single",
    prompt: "Si tú (o la persona clave del negocio) no pudieras trabajar por dos semanas, ¿el negocio seguiría funcionando con normalidad?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "operations"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_would_continue", label: "Sí, seguiría funcionando" },
      { value: "partially", label: "Parcialmente, con dificultad" },
      { value: "no_would_stop", label: "No, se detendría o sufriría mucho" },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },

  // ── FOLLOW_UP ────────────────────────────────────────────────────────────────
  {
    id: "q2_followup_general_process",
    version: 1,
    module: "follow_up",
    type: "single",
    prompt: "Cuando alguien queda pendiente de una respuesta o de un siguiente paso, ¿cómo se asegura tu negocio de retomarlo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "follow_up"), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08E.3: pregunta genérica de retención; fuera de la fricción declarada solo entra como evidencia
    // material (p. ej. meta `stop_losing`), con clientes reales. El planner decide cuándo hay necesidad.
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "defined_process", label: "Hay un proceso definido, no depende de acordarse" },
      { value: "manual_consistent", label: "Uso recordatorios o una lista, y funciona de forma consistente" },
      { value: "memory_dependent", label: "Depende de que alguien se acuerde" },
      { value: "sometimes_lost", label: "A veces simplemente se pierde" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Cómo se retoma un pendiente o un siguiente paso para que no se pierda.", distinction: "La diferencia está entre un método que no depende de acordarse y la memoria de alguien." },
  },
  {
    id: "q2_followup_ownership",
    version: 1,
    module: "follow_up",
    type: "single",
    prompt: "Cuando hay más de una persona involucrada, ¿está claro quién debe responder y cuándo se considera resuelto?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "follow_up"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_clear", label: "Sí, está claro" },
      { value: "unclear", label: "No, no siempre está claro" },
      // N/A legítimo, mismo patrón que q2_operations_handoffs.
      { value: "not_applicable", label: "No aplica: trabajo solo", kind: "not_applicable" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad", "seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: true },
  },
  {
    // Rediseñada tras fresh domain review (blocker real): el diseño original ("¿sabes cuáles son tus
    // pendientes sin revisar?") repetía casi palabra por palabra el prompt Y las 4 opciones de
    // `q2_b2b_status_visibility` (Lote D) — un respondiente B2B con friction=follow_up habría visto
    // literalmente la misma pregunta dos veces. Ahora mide un concepto genuinamente distinto: el HÁBITO
    // de repasar activamente los pendientes (frecuencia de una acción), no una confianza puntual sobre
    // el estado actual — complementa a `q2_followup_general_process` (qué mecanismo se usa) sin repetir
    // ni la visibilidad puntual de B2B ni el mecanismo general.
    id: "q2_followup_status_visibility",
    version: 1,
    module: "follow_up",
    type: "single",
    prompt: "¿Con qué frecuencia repasas de forma activa tus pendientes, para asegurarte de que ninguno se quedó sin resolver?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryFriction", "follow_up"), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08E.3: pregunta genérica de retención; fuera de la fricción declarada solo entra como evidencia
    // material (p. ej. meta `stop_losing`), con clientes reales. El planner decide cuándo hay necesidad.
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
    options: [
      { value: "regularly", label: "Con cierta regularidad, como parte de mi rutina" },
      { value: "only_when_remember", label: "Solo cuando me acuerdo" },
      { value: "rarely", label: "Casi nunca" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si los pendientes se repasan de forma activa para que ninguno quede sin resolver.", distinction: "Repasar cuando algo se recuerda no es lo mismo que una revisión habitual." },
  },

  // ── MEASUREMENT ──────────────────────────────────────────────────────────────
  {
    id: "q2_measurement_source_confidence",
    version: 1,
    module: "measurement",
    type: "single",
    prompt: "Cuando alguien te compra o se convierte en cliente, ¿sabes con confianza de dónde vino originalmente?",
    helper: "Esto es sobre qué tan seguro estás de saberlo, no sobre cuál es el canal exacto (eso ya se preguntó por separado si aplica).",
    purpose: ["diagnostic"],
    priority: "normal",
    // Protección de stage (§33 del checkpoint): sin operación real, no hay nada que atribuir todavía.
    appliesWhen: andV2(contextEquals("primaryGoal", "measure"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "yes_confident", label: "Sí, con confianza" },
      { value: "sometimes", label: "A veces" },
      { value: "rarely_no_idea", label: "Casi nunca sé de dónde vino" },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_measurement_outcome_tracking",
    version: 1,
    module: "measurement",
    type: "single",
    prompt: "¿Puedes decir aproximadamente cuántas de tus consultas, visitas o interacciones terminan en un resultado concreto (una venta, una cita, un cliente nuevo, etc.)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryGoal", "measure"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "yes_approx", label: "Sí, tengo una idea aproximada real" },
      { value: "rough_idea", label: "Una idea muy general, no confiable" },
      { value: "no_idea", label: "No tengo idea" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_measurement_decision_review",
    version: 1,
    module: "measurement",
    type: "single",
    prompt: "¿Con qué frecuencia revisas tus números o resultados comparándolos con un periodo anterior, no solo la sensación del día a día?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("primaryGoal", "measure"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "regularly", label: "Con cierta regularidad" },
      { value: "occasionally", label: "De vez en cuando" },
      { value: "rarely_never", label: "Casi nunca" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si los resultados se revisan contra un periodo anterior para decidir.", distinction: "Mirar números de vez en cuando no es lo mismo que compararlos con un periodo anterior." },
  },
] as const;
