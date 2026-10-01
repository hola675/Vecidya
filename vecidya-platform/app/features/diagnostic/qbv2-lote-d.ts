import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, contextEquals, inV2, notEqV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote D: `b2b`/`creator`/`nonprofit` (comprador organizacional, audiencia propia, misión).
 *
 * Mismas reglas heredadas: sector-first + archetype-driven + answer-driven; sin gating por
 * `NicheId`/`NicheGroup`; sin jerga de marketing ni herramientas/proveedores específicos (protegido a
 * nivel de banco completo por la mutación G de `qbv2-architecture.test.ts`).
 *
 * `nonprofit` NO es un `OperationalArchetype` (§27 del checkpoint de Lote D): se gatea por
 * `contextEquals("businessModel", "nonprofit")`, igual que `MODULE_REGISTRY.relevantWhen` ya declaraba.
 * Limitación conocida y DELIBERADAMENTE no resuelta en este lote (paralela al bloqueante de
 * `archetype: hybrid` que Lote B C1 sí corrigió): si `businessModel` resolviera `"hybrid"` (p. ej. un
 * nonprofit que también vende mercancía — `mission_funded` + `goods_for_resale` independientes), este
 * `contextEquals` perdería el módulo `nonprofit` igual que `contextEquals("archetype", ...)` perdía
 * `professional`/`appointments` antes de C1. No se construye aquí un `businessModelComponents`/
 * `businessModelIncludes` paralelo — el caso es más raro en la práctica que `retail+ecommerce` y no fue
 * pedido explícitamente; registrado como deuda (`DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001`, `STATUS.md`).
 *
 * `reputation` NO se extiende a `b2b`/`creator`/`nonprofit` en este lote (§31): la evidencia de confianza
 * en B2B es referidos/casos de estudio, no "reseñas"; creator y nonprofit tienen su propia semántica de
 * confianza que no se pidió evaluar todavía. No se extiende por simetría.
 */
export const LOTE_D_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  // ── B2B ──────────────────────────────────────────────────────────────────────
  {
    id: "q2_b2b_lead_source",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "¿De dónde suelen llegar tus oportunidades de negocio con más frecuencia?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "referrals", label: "Recomendaciones de clientes o contactos" },
      { value: "outbound", label: "Yo los busco activamente" },
      { value: "inbound", label: "Me contactan por mi presencia o contenido" },
      { value: "partnerships", label: "Alianzas con otras empresas o socios" },
      { value: "paid", label: "Publicidad pagada" },
      { value: "unknown", label: "No lo he identificado con claridad", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Por qué vía llegan con más frecuencia las oportunidades de negocio.", distinction: "Elige la vía que más oportunidades trae, no la que trae las más grandes.", why: "Muestra si te encuentran por tu cuenta o si todo depende de buscar activamente." },
  },
  {
    id: "q2_b2b_qualification",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "Cuando una empresa muestra interés, ¿tienes una forma de distinguir si es una oportunidad real o solo curiosidad?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_clear", label: "Sí, tengo una forma clara de distinguirlo" },
      { value: "somewhat", label: "Más o menos, depende del caso" },
      // DIAG-V3-08F: "trato todo por igual" sonaba a una virtud (trato justo) y podía atraer respuestas por deseabilidad.
      { value: "no", label: "No, no tengo una forma de distinguirlo", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_b2b_status_visibility",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "De tus oportunidades activas ahora mismo, ¿sabes en qué estado está cada una sin tener que revisar o preguntar?",
    hint: "Se trata de si sabes dónde está cada oportunidad ahora, no de si tienes un proceso.",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_clear", label: "Sí, lo sé con claridad" },
      { value: "somewhat", label: "Más o menos, con algo de esfuerzo" },
      { value: "lose_track", label: "No, se me pierden con facilidad", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he revisado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_b2b_sales_cycle",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "¿Qué tan seguido una venta requiere varios contactos o conversaciones antes de cerrarse?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "rarely", label: "Casi nunca, se decide rápido" },
      { value: "sometimes", label: "A veces" },
      { value: "almost_always", label: "Casi siempre requiere varios contactos" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Cuántos contactos suele requerir cerrar una venta.", distinction: "Piensa en las ventas habituales, no en la más larga ni en la más rápida.", why: "Describe el contexto de venta: cuantos más contactos, más pesa el seguimiento." },
  },
  {
    id: "q2_b2b_decision_makers",
    version: 1,
    module: "b2b",
    type: "single",
    prompt: "¿Normalmente decide una sola persona, o participan varias personas en la decisión de compra?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("b2b"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "single", label: "Una sola persona decide" },
      { value: "multiple", label: "Participan varias personas" },
      { value: "varies", label: "Depende del cliente" },
      { value: "unknown", label: "No lo he identificado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },

  // ── CREATOR ──────────────────────────────────────────────────────────────────
  {
    id: "q2_creator_channel_concentration",
    version: 1,
    module: "creator",
    type: "single",
    prompt: "De tu audiencia total, ¿qué tan concentrada está en un solo canal (por ejemplo, todo en una sola red social)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("creator"),
    options: [
      { value: "highly_concentrated", label: "Muy concentrada en un solo canal" },
      { value: "somewhat_spread", label: "Repartida entre un par de canales" },
      { value: "well_diversified", label: "Bien repartida entre varios canales reales" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Cuánto depende el alcance de la audiencia de un solo canal.", distinction: "Mira dónde está realmente la audiencia activa, no en cuántos canales tienes cuenta.", why: "Si casi toda la audiencia está en un canal, un cambio en ese canal afecta a todo." },
  },
  {
    id: "q2_creator_audience_ownership",
    version: 1,
    module: "creator",
    type: "single",
    prompt: "Más allá de la plataforma donde te siguen, ¿tienes una forma propia de contactar a tu audiencia (correo, lista, mensaje directo) sin depender de que el algoritmo te muestre?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("creator"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "systematic", label: "Sí, de forma sistemática" },
      { value: "partial", label: "Algo, pero no de forma consistente" },
      { value: "no", label: "No, dependo completamente de la plataforma" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_creator_content_consistency",
    version: 1,
    module: "creator",
    type: "single",
    prompt: "¿Qué tan seguido publicas o produces contenido nuevo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("creator"),
    options: [
      { value: "consistent_schedule", label: "Con un ritmo constante" },
      { value: "irregular", label: "De forma irregular, según el tiempo o la inspiración" },
      { value: "rarely", label: "Muy poco" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_creator_monetization_model",
    version: 1,
    module: "creator",
    type: "single",
    prompt: "¿De qué forma principal monetizas tu audiencia?",
    purpose: ["diagnostic", "classification"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("creator"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "sponsorship", label: "Patrocinios o colaboraciones pagadas" },
      { value: "services", label: "Vendo mis servicios o consultoría" },
      { value: "digital_products", label: "Productos digitales (cursos, plantillas, etc.)" },
      { value: "memberships", label: "Membresías o suscripciones" },
      { value: "commerce", label: "Productos físicos" },
      { value: "unknown", label: "Todavía no lo tengo claro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_creator_conversion",
    version: 1,
    module: "creator",
    type: "single",
    prompt: "De las personas que siguen tu contenido, ¿qué tan seguido das el paso de ofrecerles comprar o contratar algo tuyo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("creator"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "regularly", label: "Con cierta regularidad" },
      { value: "occasionally", label: "De vez en cuando" },
      { value: "rarely", label: "Casi nunca" },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto", "seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },

  // ── NONPROFIT ────────────────────────────────────────────────────────────────
  {
    id: "q2_nonprofit_support_type",
    version: 1,
    module: "nonprofit",
    type: "single",
    prompt: "¿Cómo se sostiene principalmente tu organización?",
    hint: "Elige la fuente de apoyo que más pesa hoy.",
    purpose: ["diagnostic", "routing"],
    priority: "normal",
    // DIAG-V3-08E.2: donativos y membresías presuponen apoyos reales; en pre-lanzamiento ni esta pregunta ni
    // sus dependientes (donation_clarity, membership_lifecycle) observan una capacidad que ya pueda existir.
    appliesWhen: andV2(contextEquals("businessModel", "nonprofit"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "donations", label: "Donaciones" },
      { value: "membership_dues", label: "Cuotas de membresía" },
      { value: "grants", label: "Fondos o subvenciones" },
      { value: "mixed", label: "Una combinación real de las anteriores" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_nonprofit_donation_clarity",
    version: 1,
    module: "nonprofit",
    type: "single",
    prompt: "¿Alguien que quiera apoyar económicamente a tu organización puede hacerlo fácilmente, sin tener que preguntar cómo?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Applicability protegida (§28 del checkpoint de Lote D): solo aplica si donaciones es una vía real.
    appliesWhen: andV2(contextEquals("businessModel", "nonprofit"), inV2("q2_nonprofit_support_type", ["donations", "mixed"])),
    options: [
      { value: "yes_easy", label: "Sí, es fácil" },
      { value: "somewhat_confusing", label: "Existe, pero es confuso" },
      { value: "no", label: "No, tendría que preguntar cómo", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he revisado desde fuera", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad", "contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si apoyar económicamente es fácil para alguien que ya quiere hacerlo.", distinction: "Ponte en el lugar de alguien de fuera que quiere donar hoy, sin preguntarte cómo.", why: "Si donar no es sencillo, parte del apoyo que ya existe no llega." },
  },
  {
    id: "q2_nonprofit_membership_lifecycle",
    version: 1,
    module: "nonprofit",
    type: "single",
    prompt: "¿Tienes un proceso claro para que alguien se una o renueve su membresía?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Applicability protegida: solo aplica si membership_dues es una vía real (§29 del checkpoint).
    appliesWhen: andV2(contextEquals("businessModel", "nonprofit"), inV2("q2_nonprofit_support_type", ["membership_dues", "mixed"])),
    options: [
      { value: "yes_clear", label: "Sí, es un proceso claro" },
      { value: "somewhat", label: "Existe, pero no es muy claro" },
      { value: "no", label: "No, es informal o improvisado" },
      { value: "unknown", label: "No lo había revisado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si unirse y renovar la membresía sigue un camino claro y repetible.", distinction: "Piensa en lo que vive un miembro nuevo o uno que renueva, no en lo que el equipo sabe hacer de memoria.", why: "Un camino claro hace que unirse y renovar no dependa de que alguien lo recuerde." },
  },
  {
    id: "q2_nonprofit_participation",
    version: 1,
    module: "nonprofit",
    type: "single",
    prompt: "¿Qué tan seguido las personas de tu comunidad participan activamente (eventos, voluntariado, responder a tus llamados)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("businessModel", "nonprofit"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "regularly", label: "Con cierta regularidad" },
      { value: "occasionally", label: "De vez en cuando" },
      { value: "rarely", label: "Casi nunca" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance", "contacto"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
] as const;
