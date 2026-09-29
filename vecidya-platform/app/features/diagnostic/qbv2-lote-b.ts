import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, archetypeIncludesAny, eqV2, inV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08B.3 — Lote B: `local`/`local_service`/`appointments`/`professional` (contenido especializado).
 *
 * Regla obligatoria heredada de Lote A, NO repetida por módulo: sector-first + archetype-driven +
 * answer-driven. Ninguna pregunta de este lote gatea en `NicheId`/nicho específico ni en `NicheGroup`
 * como condición de activación — todo el gating especializado es por `OperationalArchetype` (ya
 * resuelto por Lote A) o por otra respuesta de este mismo lote. Un dentista/terapeuta/medspa comparten
 * el módulo `appointments` completo; el sector solo ajusta copy (variants), nunca la lógica.
 *
 * NO se repite ninguna señal de fundación (§3 del checkpoint de Lote B): sector, buyer, reach, growth
 * stage general, goal, friction general y systemization ya viven en Lote A y aplican sin importar el
 * archetype. Este lote solo añade evidencia ADICIONAL específica de cómo opera cada archetype.
 *
 * `q2_reputation_flow` es deliberadamente COMPARTIDA entre `local`/`appointments`/`professional` (§23
 * del checkpoint: reviews no se duplica por módulo) — un solo `QuestionId`, gateada por PERTENENCIA de
 * archetype (`archetypeIncludes`, no comparación exacta) en vez de tres preguntas casi idénticas. Vive
 * en su propio módulo cross-cutting `reputation` (C1 de Lote B, §19-21 del checkpoint): `module: "local"`
 * habría dejado semántica de módulo engañosa para el futuro planner/budget — Lote C probablemente
 * también necesitará reputación para `retail`/`ecommerce`/`hospitality`, mismo patrón que `operations`/
 * `follow_up`/`measurement` (cross-cutting, no propiedad de un solo archetype).
 *
 * Toda la applicability especializada de este lote usa `archetypeIncludes`/`archetypeIncludesAny`, NUNCA
 * `contextEquals("archetype", ...)`: esa última compara el valor EXACTO de `archetype` y pierde
 * información cuando el negocio combina dos mecanismos reales (`archetype: "hybrid"`) — bloqueante
 * arquitectónico real encontrado y corregido en C1 (ver `contracts.ts`/`context-resolver.ts`/
 * `qbv2-rules.ts`: `archetypeComponents`, `archetypeIncludes`).
 */
export const LOTE_B_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  // ── LOCAL ──────────────────────────────────────────────────────────────────
  {
    id: "q2_local_discovery",
    version: 1,
    module: "local",
    type: "single",
    prompt: "Cuando alguien nuevo en tu zona te encuentra por primera vez, ¿cómo suele pasar más seguido?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("local"),
    options: [
      { value: "maps_search", label: "Buscándome en Google o Maps" },
      { value: "referral", label: "Alguien se lo recomendó" },
      { value: "social", label: "Redes sociales" },
      { value: "walk_by", label: "Pasando cerca, de forma directa" },
      { value: "paid_ads", label: "Un anuncio pagado" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia", "alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_local_presence_consistency",
    version: 1,
    module: "local",
    type: "single",
    prompt: "Si alguien te busca en línea ahora mismo, ¿encuentra tu dirección, horario y forma de contactarte, todo correcto y consistente?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("local"),
    options: [
      { value: "consistent", label: "Sí, todo está correcto y consistente" },
      { value: "partial", label: "Una parte está desactualizada o incompleta" },
      { value: "no", label: "No, es difícil encontrar esa información" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia", "contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_local_repeat_customers",
    version: 1,
    module: "local",
    type: "single",
    prompt: "De las personas que ya te compraron o visitaron una vez, ¿regresan con cierta frecuencia?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Encadenada a q2_has_customers (foundation): no tiene sentido preguntar recurrencia sin operación real.
    appliesWhen: andV2(archetypeIncludes("local"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "yes_regular", label: "Sí, con cierta regularidad" },
      { value: "rarely", label: "Pocas veces" },
      { value: "no", label: "Casi nunca" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  // ── COMPARTIDA: local + appointments + professional (§23) ───────────────────
  {
    id: "q2_reputation_flow",
    version: 1,
    module: "reputation",
    type: "single",
    prompt: "¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de clientes?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludesAny(["local", "appointments", "professional"]),
    variants: [{ target: { nicheGroup: "health_wellness" }, prompt: "¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de pacientes?" }],
    options: [
      { value: "steady", label: "Me llegan con cierta regularidad" },
      { value: "rare", label: "Muy rara vez o nunca" },
      { value: "unknown", label: "No lo sé, no lo reviso seguido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["confianza"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },

  // ── LOCAL_SERVICE ────────────────────────────────────────────────────────────
  {
    id: "q2_service_area_clarity",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "¿Tienes claro qué tan lejos te conviene ir a atender un servicio, o aceptas cualquier dirección que te contacte?",
    helper: "Esto es sobre DÓNDE puedes prestar el servicio, no sobre de dónde son tus clientes (eso ya se preguntó por separado).",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("local_service"),
    options: [
      { value: "defined_area", label: "Tengo un área definida y la sigo" },
      { value: "flexible_but_aware", label: "Soy flexible, pero sé cuándo no me conviene" },
      { value: "no_limit", label: "Acepto cualquier lugar sin pensarlo" },
      { value: "unknown", label: "No lo he definido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_service_response_speed",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "Cuando entra una consulta nueva pidiendo tu servicio, ¿qué suele pasar?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    appliesWhen: archetypeIncludes("local_service"),
    options: [
      { value: "fast", label: "Respondo rápido, casi siempre el mismo día" },
      { value: "delayed", label: "Respondo, pero puede tardar más de un día" },
      { value: "some_lost", label: "Algunas se me pierden o tardo demasiado en contestar", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he medido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento", "contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_service_quote_practice",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "¿Sueles dar una cotización o estimado antes de hacer el trabajo?",
    purpose: ["diagnostic", "routing"],
    priority: "normal",
    appliesWhen: archetypeIncludes("local_service"),
    options: [
      { value: "yes", label: "Sí, casi siempre" },
      { value: "no", label: "No, cobro directamente o es tarifa fija" },
      { value: "varies", label: "Depende del trabajo" },
    ],
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_service_quote_followup",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "Después de dar una cotización, si la persona no responde enseguida, ¿qué tan seguido le das seguimiento?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    // Applicability protegida (§11 del checkpoint de Lote B): solo aplica si YA se respondió que cotiza
    // ("yes"/"varies"). notEqV2 no serviría aquí: una respuesta ausente satisface "!= no" igual que "yes",
    // así que la pregunta quedaría elegible ANTES de que exista la respuesta que la habilita — inV2 exige
    // que exista una respuesta real y sea una de las permitidas.
    appliesWhen: andV2(archetypeIncludes("local_service"), inV2("q2_service_quote_practice", ["yes", "varies"])),
    options: [
      { value: "always", label: "Siempre hago seguimiento" },
      { value: "sometimes", label: "A veces" },
      { value: "rarely", label: "Casi nunca", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_service_repeat_referral",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "De los clientes que ya atendiste, ¿sueles recibir referidos o que te vuelvan a llamar para otro trabajo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("local_service"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "both", label: "Sí, ambas cosas con cierta regularidad" },
      { value: "referrals_only", label: "Sobre todo referidos" },
      { value: "repeat_only", label: "Sobre todo que me vuelvan a llamar" },
      { value: "rarely", label: "Casi ninguna de las dos" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance", "confianza"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },

  // ── APPOINTMENTS ─────────────────────────────────────────────────────────────
  {
    id: "q2_appointments_booking_method",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Cómo se agenda la mayoría de tus citas hoy?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: archetypeIncludes("appointments"),
    variants: [{ target: { nicheGroup: "health_wellness" }, prompt: "¿Cómo se agenda la mayoría de las citas de tus pacientes hoy?" }],
    options: [
      { value: "self_book_online", label: "La persona agenda sola en línea" },
      { value: "staff_manual", label: "Mi equipo o yo lo agendamos manualmente" },
      { value: "call_message", label: "Por llamada o mensaje, sin un sistema" },
      // Hecho operativo fuerte y no ambiguo (mismo criterio que el "often" de q2_appointments_noshow): sin ningún proceso, no una preferencia entre canales.
      { value: "informal", label: "No hay un proceso definido, se acomoda como se puede", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_appointments_booking_friction",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Qué tan seguido cuesta trabajo encontrar un horario que funcione, yendo y viniendo con la persona antes de confirmar?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: archetypeIncludes("appointments"),
    options: [
      { value: "rarely", label: "Casi nunca" },
      { value: "sometimes", label: "A veces" },
      { value: "often", label: "Seguido", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_appointments_confirmation_reminders",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Envías confirmaciones o recordatorios antes de la cita?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    appliesWhen: archetypeIncludes("appointments"),
    variants: [{ target: { nicheGroup: "health_wellness" }, prompt: "¿Envías confirmaciones o recordatorios a tus pacientes antes de la cita?" }],
    options: [
      { value: "automatic", label: "Sí, de forma automática" },
      { value: "manual", label: "Sí, pero yo o mi equipo lo hacemos a mano cada vez" },
      { value: "none", label: "No enviamos nada", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: false, allowsNotApplicable: false },
  },
  {
    id: "q2_appointments_lead_to_booking",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "De las personas que preguntan por una cita, ¿qué proporción termina realmente agendando?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: archetypeIncludes("appointments"),
    options: [
      { value: "most", label: "La mayoría" },
      { value: "about_half", label: "Como la mitad" },
      { value: "few", label: "Pocas", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he medido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_appointments_rebooking",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "Cuando el servicio normalmente requiere que la persona regrese (seguimiento, mantenimiento, control, etc.), ¿sueles ayudarla a agendar la siguiente cita antes de que se vaya?",
    helper: "Evidencia para retención/postventa (DIAG-V3-08B0-FRICTION-RETENTION-001), sin decidir todavía si necesita su propia categoría.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("appointments"),
    variants: [{ target: { nicheGroup: "health_wellness" }, prompt: "Cuando el tratamiento normalmente requiere que el paciente regrese, ¿sueles ayudarlo a agendar la siguiente cita antes de que se vaya?" }],
    options: [
      { value: "yes_proactive", label: "Sí, lo propongo antes de que se vaya" },
      { value: "reactive", label: "Solo si la persona lo pide" },
      { value: "no_followup", label: "No, queda en manos de la persona" },
      // N/A legítimo (§17): no todo appointment business requiere recurrencia por diseño del servicio.
      { value: "not_applicable", label: "No aplica: mi servicio normalmente no requiere que regrese", kind: "not_applicable" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "neutral", allowsUnknown: false, allowsNotApplicable: true },
  },

  // ── PROFESSIONAL ─────────────────────────────────────────────────────────────
  {
    id: "q2_professional_authority_signals",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "¿Qué tan visible es tu experiencia o credenciales para alguien que te está evaluando por primera vez (casos, testimonios, credenciales, contenido que explique lo que haces)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("professional"),
    options: [
      { value: "clearly_visible", label: "Está claro y es fácil de encontrar" },
      { value: "partial", label: "Existe, pero está disperso o incompleto" },
      { value: "not_really", label: "Casi no hay nada de esto visible" },
      { value: "unknown", label: "No lo he revisado desde fuera", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["confianza", "claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_professional_intake_flow",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "Cuando alguien muestra interés en trabajar contigo, ¿qué pasa antes de convertirse en cliente?",
    purpose: ["diagnostic", "classification"],
    priority: "normal",
    appliesWhen: archetypeIncludes("professional"),
    options: [
      { value: "defined_consult", label: "Tengo un paso definido, como una consulta o llamada inicial" },
      { value: "ad_hoc", label: "Varía según el caso, sin un paso fijo" },
      { value: "direct_no_step", label: "Empezamos directo, sin ningún paso intermedio" },
      { value: "unknown", label: "No lo había pensado de esa forma", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_professional_referral_dependency",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "¿Qué tan seguido llegan nuevos clientes por referidos, comparado con otras formas de encontrarte?",
    helper: "Ni mucho ni poco referido es automáticamente bueno o malo: esto es solo un hecho sobre cómo llegan tus clientes hoy.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("professional"),
    options: [
      { value: "mostly_referrals", label: "Casi todos llegan por referidos" },
      { value: "mixed", label: "Una mezcla real de referidos y otras formas" },
      { value: "mostly_other", label: "Casi todos llegan por otras formas, pocos referidos" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_professional_followup_after_consult",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "Después de una consulta o primera llamada, si la persona no responde enseguida, ¿le das seguimiento?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    appliesWhen: archetypeIncludes("professional"),
    options: [
      { value: "always", label: "Siempre" },
      { value: "sometimes", label: "A veces" },
      { value: "rarely_never", label: "Casi nunca", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
] as const;
