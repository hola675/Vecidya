import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, eqV2, inV2, notEqV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote C: `retail`/`ecommerce`/`hospitality` (comercio y hospitalidad).
 *
 * Mismas reglas heredadas de Lote A/B, no repetidas por módulo: sector-first + archetype-driven +
 * answer-driven; ninguna pregunta gatea en `NicheId`/`NicheGroup`; nada de jerga de marketing ni
 * herramientas/proveedores específicos como requisito.
 *
 * NO duplica Lote B (§9, §17, §21 del checkpoint de Lote C): `q2_local_discovery`,
 * `q2_local_presence_consistency`, `q2_local_repeat_customers` y `q2_reputation_flow` (`qbv2-lote-b.ts`)
 * se EXTENDIERON para incluir `retail`/`hospitality` en su `appliesWhen` en vez de crear
 * `q2_retail_discovery`/`q2_retail_repeat_purchase`/`q2_hospitality_repeat_visits`/etc. casi idénticas —
 * descubrimiento local, consistencia de presencia, recurrencia y reputación son el MISMO concepto para
 * cualquier negocio con presencia física, sin importar si tiene inventario de reventa o consumo en el
 * lugar. `retail`/`hospitality` quedan entonces con menos preguntas PROPIAS de lo que sugeriría
 * `MODULE_REGISTRY` en aislamiento — la cobertura EFECTIVA (propias + compartidas) sí alcanza el target.
 *
 * `ecommerce` no reutiliza esas tres preguntas de descubrimiento/presencia física — un negocio 100% en
 * línea no tiene "zona" ni "consistencia de dirección/horario" en el mismo sentido; su equivalente real
 * (tráfico, concentración de canales) es contenido propio de este módulo. `ecommerce` SÍ podría
 * beneficiarse de `q2_reputation_flow` (reseñas de producto/tienda) pero se deja fuera deliberadamente
 * en este lote — el checkpoint de Lote C solo pidió evaluar retail/hospitality para reputation; extender
 * a ecommerce es una decisión futura, no tomada aquí sin pedido explícito.
 */
export const LOTE_C_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  // ── RETAIL ───────────────────────────────────────────────────────────────────
  {
    id: "q2_retail_product_visibility",
    version: 1,
    module: "retail",
    type: "single",
    prompt: "¿Alguien que quiera comprarte puede saber fácilmente qué vendes y si lo tienes disponible, antes de ir a tu tienda o preguntar?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("retail"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_clear", label: "Sí, es fácil saberlo desde fuera" },
      { value: "partially", label: "Solo una parte (algunos productos, no disponibilidad)" },
      { value: "no", label: "No, tiene que ir o preguntar para saberlo" },
      { value: "unknown", label: "No lo he revisado desde fuera", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad", "presencia"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_retail_customer_capture",
    version: 1,
    module: "retail",
    type: "single",
    prompt: "Después de que alguien te compra, ¿te queda alguna forma de volver a contactarlo (teléfono, correo, redes, programa de lealtad)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("retail"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "systematic", label: "Sí, de forma sistemática" },
      { value: "sometimes", label: "A veces, según el cliente" },
      { value: "no", label: "No, la compra termina ahí" },
      { value: "unknown", label: "No lo había pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto", "seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_retail_promotions",
    version: 1,
    module: "retail",
    type: "single",
    prompt: "¿Sueles comunicar promociones u ofertas de forma que tus clientes se enteren, no solo la gente que ya está en la tienda?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("retail"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes_regular", label: "Sí, con cierta regularidad" },
      { value: "rarely", label: "Rara vez" },
      { value: "no", label: "No, nunca" },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si las ofertas llegan a clientes que no están en la tienda en ese momento.", distinction: "Un cartel dentro de la tienda no cuenta: se trata de avisar a quien no está ahí." },
  },

  // ── ECOMMERCE ────────────────────────────────────────────────────────────────
  {
    id: "q2_ecommerce_product_discovery",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "Cuando alguien llega a tu tienda en línea, ¿puede encontrar fácilmente lo que busca (categorías claras, buscador, navegación simple)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("ecommerce"),
    options: [
      { value: "yes_easy", label: "Sí, es fácil de navegar" },
      { value: "somewhat_confusing", label: "A veces es confuso" },
      { value: "hard_to_navigate", label: "Es difícil encontrar las cosas" },
      { value: "unknown", label: "No lo he probado desde la perspectiva de un cliente nuevo", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si quien entra a la tienda en línea encuentra lo que busca sin ayuda.", distinction: "Piensa en un visitante nuevo, no en cómo navegas tú tu propia tienda." },
  },
  {
    id: "q2_ecommerce_checkout_friction",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "¿Qué tan seguido las personas empiezan a comprar pero no terminan el proceso de pago?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    // DIAG-V3-08D.1: abandono de pago presupone compradores reales.
    appliesWhen: andV2(archetypeIncludes("ecommerce"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he medido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si quien decide comprar logra terminar el pago.", distinction: "Piensa en compras empezadas y no terminadas, no en visitas que solo miran." },
  },
  {
    id: "q2_ecommerce_cart_visibility",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "¿Tu tienda puede identificar cuando alguien dejó productos en el carrito sin terminar de comprar?",
    purpose: ["diagnostic", "routing"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("ecommerce"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_ecommerce_cart_followup",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "De esas personas que dejan productos sin comprar, ¿les das seguimiento (correo, mensaje, recordatorio)?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Applicability protegida (§16 del checkpoint de Lote C): solo aplica si YA se respondió que puede identificarlo.
    appliesWhen: andV2(archetypeIncludes("ecommerce"), eqV2("q2_ecommerce_cart_visibility", "yes")),
    options: [
      { value: "always", label: "Siempre" },
      { value: "sometimes", label: "A veces" },
      { value: "rarely", label: "Casi nunca", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_ecommerce_repeat_purchase",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "¿Qué tan seguido un mismo cliente te vuelve a comprar?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("ecommerce"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "frequently", label: "Con cierta frecuencia" },
      { value: "occasionally", label: "De vez en cuando" },
      { value: "rarely", label: "Casi nunca" },
      // N/A legítimo (§17): no todo producto se compra más de una vez por diseño.
      { value: "not_applicable", label: "No aplica: mi producto normalmente se compra una sola vez", kind: "not_applicable" },
      { value: "unknown", label: "No lo he medido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: true },
    helpIntent: { understand: "Con qué frecuencia un mismo cliente vuelve a comprar.", distinction: "Cuenta compras repetidas de la misma persona, no ventas totales." },
  },
  {
    id: "q2_ecommerce_acquisition_dependency",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "De tu tráfico o pedidos, ¿dependes principalmente de un solo canal (por ejemplo solo redes, o solo un tipo de anuncio), o viene de varias fuentes reales?",
    purpose: ["diagnostic"],
    priority: "normal",
    // DIAG-V3-08D.1: pregunta por el tráfico o pedidos existentes; sin clientes todavía no hay nada que observar.
    appliesWhen: andV2(archetypeIncludes("ecommerce"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "single_channel", label: "Casi todo depende de un solo canal" },
      { value: "few_channels", label: "Dos o tres canales, sin mucho más" },
      { value: "diverse", label: "Varias fuentes reales, ninguna domina" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si las ventas dependen de un único canal que podría fallar.", distinction: "Mira de dónde vienen los pedidos reales, no dónde publicas." },
  },

  // ── HOSPITALITY ──────────────────────────────────────────────────────────────
  {
    id: "q2_hospitality_flow_type",
    version: 1,
    module: "hospitality",
    type: "single",
    prompt: "¿Cómo suele llegar la mayoría de tus clientes?",
    helper: "Esto solo ajusta las siguientes preguntas a cómo funciona realmente tu negocio.",
    purpose: ["diagnostic", "routing"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("hospitality"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "reservation", label: "Con reserva previa" },
      { value: "walk_in", label: "Sin reserva, llegan directo" },
      { value: "order_ahead", label: "Hacen un pedido para recoger o que se lo lleven" },
      { value: "mixed", label: "Una mezcla real de las anteriores" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_hospitality_reservation_noshow",
    version: 1,
    module: "hospitality",
    type: "single",
    prompt: "¿Qué tan seguido las personas no se presentan a una reserva?",
    helper: "Esto es distinto de una cita médica o de servicio — aquí es sobre mesas, habitaciones o reservas de tu negocio.",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Distinta de appointments a propósito (§19, §24 del checkpoint de Lote C): una reserva de mesa/
    // hospedaje no es el mismo mecanismo operativo que una cita de servicio, aunque el patrón de no-show
    // se parezca — no se reutiliza q2_appointments_noshow ni se activa el archetype "appointments".
    appliesWhen: andV2(archetypeIncludes("hospitality"), inV2("q2_hospitality_flow_type", ["reservation", "mixed"])),
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_hospitality_peak_capacity",
    version: 1,
    module: "hospitality",
    type: "single",
    prompt: "En tus horas o días de más demanda, ¿qué tan seguido tienes que rechazar clientes o hacerlos esperar mucho por falta de capacidad?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("hospitality"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance", "seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_hospitality_delivery_takeaway",
    version: 1,
    module: "hospitality",
    type: "single",
    prompt: "¿Ofreces para llevar o entrega a domicilio?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("hospitality"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "both", label: "Sí, ambas cosas" },
      { value: "takeaway_only", label: "Solo para llevar" },
      { value: "delivery_only", label: "Solo entrega a domicilio" },
      { value: "no", label: "No, solo se consume en el lugar" },
      { value: "not_applicable", label: "No aplica: el hospedaje no ofrece alimentos ni entrega", kind: "not_applicable" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: true },
    helpIntent: { understand: "Qué formas de consumir fuera del local ofrece hoy el negocio.", distinction: "Responde por lo que ofreces de forma habitual, no por algo ocasional o en pruebas." },
  },
] as const;
