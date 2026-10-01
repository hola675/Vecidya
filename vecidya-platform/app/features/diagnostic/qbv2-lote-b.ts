import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, archetypeIncludesAny, eqV2, inV2, notEqV2 } from "./qbv2-rules";

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
    prompt: "Cuando alguien de tu zona te descubre por primera vez, ¿cómo suele ocurrir con más frecuencia?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Extendida a retail/hospitality en DIAG-V3-08B.3 Lote C (§9 del checkpoint de Lote C): descubrimiento
    // local es el MISMO concepto para cualquier negocio con presencia física, sin importar si tiene
    // inventario de reventa (retail) o consumo en el lugar (hospitality) — no se duplica por archetype.
    appliesWhen: andV2(archetypeIncludesAny(["local", "retail", "hospitality"]), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08D.1/08E.1: un servicio a domicilio o con citas también es descubierto dentro de una zona. Ahí
    // solo entra como evidencia material (el planner decide cuándo hay necesidad); no altera su ruta base.
    // DIAG-V3-08E.2: presupone clientes reales confirmados (la cola material corre con el contexto resuelto).
    materialAppliesWhen: andV2(archetypeIncludesAny(["local_service", "appointments"]), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "maps_search", label: "Buscando en Google o en mapas" },
      { value: "referral", label: "Por recomendación de alguien" },
      { value: "social", label: "Por redes sociales" },
      { value: "walk_by", label: "Pasando cerca, de forma directa" },
      { value: "paid_ads", label: "Por un anuncio pagado" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia", "alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Por qué vía te descubre por primera vez la gente nueva de tu zona.", distinction: "Elige la vía más frecuente, no la que te gustaría que fuera.", why: "Muestra si te encuentran cuando te buscan o sobre todo por casualidad o recomendación." },
  },
  {
    id: "q2_local_presence_consistency",
    version: 1,
    module: "local",
    type: "single",
    prompt: "Si alguien te busca en internet ahora mismo, ¿encuentra tu dirección, horario y forma de contacto correctos y coincidentes en todos los sitios?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Extendida a retail/hospitality (Lote C, mismo motivo que q2_local_discovery).
    appliesWhen: archetypeIncludesAny(["local", "retail", "hospitality"]),
    // DIAG-V3-08F: también se pregunta antes de abrir; ahí "no encuentra nada" es que aún no está publicado.
    variants: [{ target: { terminology: ["prelaunch"] }, prompt: "Si alguien buscara hoy tu negocio en internet, ¿encontraría ya tu dirección, horario y forma de contacto correctos?", optionLabels: { no: "No, todavía no está publicado" } }],
    options: [
      { value: "consistent", label: "Sí, todo está correcto y coincide" },
      { value: "partial", label: "Una parte está desactualizada o incompleta" },
      { value: "no", label: "No, es difícil encontrar esa información" },
      { value: "unknown", label: "No lo he revisado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["presencia", "contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si los datos básicos para encontrarte y contactarte están correctos en internet.", distinction: "Basta con que un dato esté desactualizado en un sitio visible para que no coincida.", why: "Un dato equivocado puede hacer que alguien que ya te buscó no llegue." },
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
    // Extendida a retail/hospitality (Lote C, §17: repeat purchase/repeat visits es el MISMO concepto que
    // repeat customers — reutilizar en vez de crear q2_retail_repeat_purchase/q2_hospitality_repeat_visits).
    appliesWhen: andV2(archetypeIncludesAny(["local", "retail", "hospitality"]), eqV2("q2_has_customers", "yes")),
    variants: [{ target: { terminology: ["nonprofit"] }, prompt: "De las personas que ya participaron o recibieron apoyo de tu organización, ¿vuelven con cierta frecuencia?" }],
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
    // DIAG-V3-08F.1: versión 2 — se añade `occasional`. Con solo dos niveles, quien recibe reseñas o
    // recomendaciones algunos meses sí y otros no tenía que elegir entre «con cierta regularidad» y «muy rara vez
    // o nunca»; ningún wording de esas dos opciones podía representarlo sin cambiar su significado.
    version: 2,
    module: "reputation",
    type: "single",
    prompt: "¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de clientes?",
    purpose: ["diagnostic"],
    priority: "normal",
    // Extendida a retail/hospitality en Lote C (§21 del checkpoint de Lote C): mismo concepto, misma
    // pregunta — reputación no cambia de significado entre "local", "retail" y "hospitality".
    appliesWhen: andV2(archetypeIncludesAny(["local", "appointments", "professional", "retail", "hospitality"]), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08D.1/08E.1: fuera de estos archetypes (creator, b2b, ecommerce, local_service) solo entra como
    // evidencia material (confianza declarada o prerrequisito de una restricción): no tenían otra observación.
    // DIAG-V3-08E.2: solo con clientes reales confirmados; en pre-lanzamiento Confianza no es aplicable.
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
    // DIAG-V3-08F: "pacientes" solo en práctica clínica (antes, todo health_wellness).
    variants: [
      { target: { terminology: ["clinical"] }, prompt: "¿Qué tan seguido te llegan reseñas o recomendaciones nuevas de pacientes?" },
      { target: { terminology: ["nonprofit"] }, prompt: "¿Qué tan seguido te llegan opiniones o recomendaciones nuevas de personas que conocen tu labor?" },
      { target: { terminology: ["creator"] }, prompt: "¿Qué tan seguido te llegan reseñas, testimonios o recomendaciones nuevas de quienes te compran o te siguen?" },
    ],
    options: [
      { value: "steady", label: "Me llegan con cierta regularidad" },
      { value: "occasional", label: "De vez en cuando, pero no de forma constante" },
      { value: "rare", label: "Muy rara vez o nunca" },
      { value: "unknown", label: "No lo sé, no lo reviso seguido", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["confianza"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    hint: "Piensa en los últimos meses: reseñas en internet, testimonios o recomendaciones que te llegan.",
    helpIntent: {
      understand: "Si llegan opiniones nuevas de personas satisfechas que otros puedan ver o escuchar.",
      distinction: "«Con cierta regularidad» es casi todos los meses; «de vez en cuando», algunos meses sí y otros no. Cuenta lo reciente, no la buena opinión general que tengan de ti.",
      why: "Quien no te conoce suele decidir por lo que otros dicen de ti.",
    },
  },

  // ── LOCAL_SERVICE ────────────────────────────────────────────────────────────
  {
    id: "q2_service_area_clarity",
    version: 1,
    module: "local_service",
    type: "single",
    // DIAG-V3-08F: también se pregunta antes del lanzamiento; sin presuponer servicios ya prestados ni remitir a otra pregunta.
    prompt: "¿Tienes definida la zona hasta donde te conviene desplazarte para atender un servicio?",
    hint: "Se trata de hasta dónde te desplazas tú, no de dónde está tu público.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: archetypeIncludes("local_service"),
    options: [
      { value: "defined_area", label: "Sí, tengo una zona definida y la respeto" },
      { value: "flexible_but_aware", label: "Soy flexible, pero sé cuándo no me conviene ir" },
      { value: "no_limit", label: "No, voy a cualquier lugar sin evaluarlo" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
  },
  {
    id: "q2_service_response_speed",
    version: 1,
    module: "local_service",
    type: "single",
    prompt: "Cuando alguien te contacta por primera vez pidiendo tu servicio, ¿qué suele pasar?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    appliesWhen: andV2(archetypeIncludes("local_service"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "fast", label: "Respondo rápido, casi siempre el mismo día" },
      { value: "delayed", label: "Respondo, pero puede tardar más de un día" },
      { value: "some_lost", label: "Algunos contactos se me pierden o tardo demasiado en contestar", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
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
    appliesWhen: andV2(archetypeIncludes("local_service"), notEqV2("q2_has_customers", "no")),
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
    prompt: "De los clientes que ya atendiste, ¿te recomiendan con otras personas o te vuelven a llamar para otro trabajo?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("local_service"), eqV2("q2_has_customers", "yes")),
    options: [
      { value: "both", label: "Sí, ambas cosas con cierta regularidad" },
      { value: "referrals_only", label: "Sobre todo me recomiendan" },
      { value: "repeat_only", label: "Sobre todo me vuelven a llamar" },
      { value: "rarely", label: "Casi ninguna de las dos" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance", "confianza"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si los clientes atendidos vuelven a llamar o recomiendan el servicio.", distinction: "Piensa en lo que pasa con la mayoría de los clientes, no en los más fieles.", why: "Que vuelvan o recomienden muestra si la relación continúa después del trabajo." },
  },

  // ── APPOINTMENTS ─────────────────────────────────────────────────────────────
  {
    id: "q2_appointments_booking_method",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Cómo se agenda hoy la mayoría de las citas?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
    variants: [{ target: { terminology: ["clinical"] }, prompt: "¿Cómo agendan hoy sus citas la mayoría de tus pacientes?" }],
    // DIAG-V3-08F (opciones solapadas corregidas): "lo agendamos manualmente" y "por llamada o mensaje" describían a
    // menudo lo mismo con estados distintos (partial/weak). La diferencia real es si existe una agenda central.
    options: [
      { value: "self_book_online", label: "La persona reserva sola en línea" },
      { value: "staff_manual", label: "Mi equipo o yo las anotamos a mano en una agenda o sistema" },
      { value: "call_message", label: "Se acuerdan por llamada o mensaje, sin una agenda central" },
      // Hecho operativo fuerte y no ambiguo (mismo criterio que el "often" de q2_appointments_noshow): sin ningún proceso, no una preferencia entre canales.
      { value: "informal", label: "No hay una forma definida; se acomodan como se puede", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Cómo se agenda hoy la mayoría de las citas.", distinction: "Elige la vía por la que entra la mayoría, aunque existan otras; lo que distingue las opciones es si hay una agenda central.", why: "Reservar con facilidad influye en cuántas personas interesadas terminan con una cita." },
  },
  {
    id: "q2_appointments_booking_friction",
    version: 1,
    module: "appointments",
    type: "single",
    prompt: "¿Qué tan seguido cuesta encontrar un horario que le sirva a la persona, con varios mensajes o llamadas antes de confirmar?",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
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
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
    variants: [{ target: { terminology: ["clinical"] }, prompt: "¿Envías confirmaciones o recordatorios a tus pacientes antes de la cita?" }],
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
    prompt: "De las personas que preguntan por una cita, ¿cuántas terminan agendándola?",
    hint: "Una estimación aproximada basta; no hace falta un dato exacto.",
    purpose: ["diagnostic", "friction"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "most", label: "La mayoría" },
      { value: "about_half", label: "Más o menos la mitad" },
      { value: "few", label: "Pocas", produces: [{ kind: "friction", value: "conversion", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he observado", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["contacto"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: {
      understand: "Qué parte de quienes preguntan por una cita termina agendándola.",
      distinction: "Cuenta personas que preguntaron de verdad, no visitas a tu perfil ni seguidores.",
      why: "Muestra si el interés que ya llega se convierte en citas.",
    },
  },
  {
    id: "q2_appointments_rebooking",
    version: 1,
    module: "appointments",
    type: "single",
    // DIAG-V3-08F: la pista visible anterior era una nota interna (`DIAG-V3-08B0-FRICTION-RETENTION-001`, ya resuelta).
    prompt: "Cuando el servicio requiere que la persona vuelva (seguimiento, mantenimiento o control), ¿le ayudas a agendar la siguiente cita antes de que se vaya?",
    hint: "Si tu servicio normalmente no requiere que la persona vuelva, elige «No aplica».",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("appointments"), notEqV2("q2_has_customers", "no")),
    variants: [{ target: { terminology: ["clinical"] }, prompt: "Cuando el tratamiento requiere que el paciente vuelva, ¿le ayudas a agendar la siguiente cita antes de que se vaya?" }],
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
    // DIAG-V3-08F: también es evidencia material para comercio, B2B, creator y organizaciones; la base ya no
    // presupone una profesión ("experiencia o credenciales") y mide lo mismo: prueba visible de confianza.
    prompt: "Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti (casos, testimonios, opiniones, credenciales o resultados)?",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("professional"), notEqV2("q2_has_customers", "no")),
    // DIAG-V3-08D.1/08E.1: casos, testimonios y contenido son prueba visible para cualquier archetype; fuera de
    // professional solo entra como evidencia material (confianza declarada o prerrequisito de una restricción).
    // DIAG-V3-08E.2: solo con clientes reales confirmados; en pre-lanzamiento Confianza no es aplicable.
    materialAppliesWhen: eqV2("q2_has_customers", "yes"),
    variants: [
      { target: { terminology: ["nonprofit"] }, prompt: "Para alguien que conoce tu organización por primera vez, ¿qué tan fácil es ver pruebas de su labor (resultados, testimonios, informes o reconocimientos)?" },
      { target: { terminology: ["ecommerce", "retail"] }, prompt: "Para alguien que te evalúa por primera vez, ¿qué tan fácil es ver pruebas de que puede confiar en ti (opiniones de otros compradores, reseñas o casos reales)?" },
    ],
    options: [
      { value: "clearly_visible", label: "Es fácil verlas y encontrarlas" },
      { value: "partial", label: "Existen, pero están dispersas o incompletas" },
      { value: "not_really", label: "Casi no hay nada de esto a la vista" },
      { value: "unknown", label: "No lo he revisado desde fuera", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["confianza", "claridad"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Si alguien que no te conoce encuentra pruebas para confiar antes de decidir.", distinction: "Cuenta lo que se ve desde fuera sin preguntarte, no lo que podrías mostrar si te lo piden.", why: "Quien no te conoce decide con lo que puede ver por su cuenta." },
  },
  {
    id: "q2_professional_intake_flow",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "Cuando alguien muestra interés en trabajar contigo, ¿qué pasa antes de que se convierta en cliente?",
    purpose: ["diagnostic", "classification"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("professional"), notEqV2("q2_has_customers", "no")),
    variants: [{ target: { terminology: ["clinical"] }, prompt: "Cuando alguien muestra interés en atenderse contigo, ¿qué pasa antes de que se convierta en paciente?" }],
    options: [
      { value: "defined_consult", label: "Tengo un paso definido, como una consulta o llamada inicial" },
      { value: "ad_hoc", label: "Varía según el caso, sin un paso fijo" },
      { value: "direct_no_step", label: "Empezamos directo, sin ningún paso intermedio" },
      { value: "unknown", label: "No lo había pensado de esa forma", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["claridad"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Qué pasa entre el primer interés y el inicio del trabajo.", distinction: "Describe lo que ocurre en la mayoría de los casos, no el proceso ideal.", why: "Un primer paso claro ayuda a que el interés se convierta en trabajo." },
  },
  {
    id: "q2_professional_referral_dependency",
    version: 1,
    module: "professional",
    type: "single",
    // DIAG-V3-08F: la pista anterior afirmaba que ninguna respuesta es mejor o peor, en contradicción con la lectura
    // de dependencia; la pista neutral pide describir lo que ocurre hoy.
    prompt: "¿Cuántos de tus clientes nuevos llegan por recomendación, comparado con otras vías?",
    hint: "Responde según lo que ocurre hoy, no según lo que te gustaría.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(archetypeIncludes("professional"), notEqV2("q2_has_customers", "no")),
    variants: [{ target: { terminology: ["clinical"] }, prompt: "¿Cuántos de tus pacientes nuevos llegan por recomendación, comparado con otras vías?" }],
    options: [
      { value: "mostly_referrals", label: "Casi todos llegan por recomendación" },
      { value: "mixed", label: "Una mezcla real de recomendaciones y otras vías" },
      { value: "mostly_other", label: "La mayoría llega por otras vías; pocos por recomendación" },
      { value: "unknown", label: "No lo he seguido de cerca", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["alcance"], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    helpIntent: { understand: "Qué tanto dependen los clientes nuevos de recomendaciones personales.", distinction: "Compara las recomendaciones con todas las demás vías por las que te encuentran, no solo con una.", why: "Muestra de qué depende hoy que lleguen clientes nuevos." },
  },
  {
    id: "q2_professional_followup_after_consult",
    version: 1,
    module: "professional",
    type: "single",
    prompt: "Después de una consulta o primera llamada, si la persona no responde enseguida, ¿le das seguimiento?",
    purpose: ["diagnostic", "friction"],
    priority: "high",
    appliesWhen: andV2(archetypeIncludes("professional"), notEqV2("q2_has_customers", "no")),
    options: [
      { value: "always", label: "Siempre" },
      { value: "sometimes", label: "A veces" },
      { value: "rarely_never", label: "Casi nunca", produces: [{ kind: "friction", value: "follow_up", provenance: "derived_fact" }] },
      { value: "unknown", label: "No lo he pensado así", kind: "unknown" },
    ],
    scoringReadiness: { candidateDimensions: ["seguimiento"], signalDirection: "negative", allowsUnknown: true, allowsNotApplicable: false },
  },
] as const;
