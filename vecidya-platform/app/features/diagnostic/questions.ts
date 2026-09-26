import { hasTeam, isEstablished, isOperating, profiles } from "./profiles";
import type { QuestionId } from "./contracts";
import type { AnswerValue, Context, DimensionId, ProfileId, Question, QuestionOption, SectionId } from "./types";

/**
 * Banco de preguntas del Diagnóstico.
 *
 * Cada pregunta documenta su propósito (`purpose`), las dimensiones que alimenta,
 * la condición de aplicabilidad y la evidencia de cada opción. Las opciones
 * «no lo sé» (`unknown`) no puntúan; «no aplica» (`not_applicable`) tampoco;
 * «nada de esto» (`none`) puntúa 0 de forma sustantiva.
 */

const yesNoUnknown = (evidence: Record<"yes" | "partly" | "no", number>, dimensions: DimensionId[]) => {
  const spread = (value: number) => Object.fromEntries(dimensions.map((dimension) => [dimension, value]));
  return [
    { value: "yes", label: "Sí", evidence: spread(evidence.yes) },
    { value: "partly", label: "En parte", evidence: spread(evidence.partly) },
    { value: "no", label: "No", evidence: spread(evidence.no) },
    { value: "unknown", label: "No lo sé", kind: "unknown" as const },
  ] satisfies QuestionOption[];
};

export const sectionLabels: Record<SectionId, string> = {
  contexto: "Contexto",
  presencia: "Presencia y confianza",
  alcance: "Alcance",
  proceso: "Contacto y seguimiento",
  medicion: "Medición",
};

export const sectionOrder: SectionId[] = ["contexto", "presencia", "alcance", "proceso", "medicion"];

function selectedValues(answer: AnswerValue | undefined): string[] {
  if (answer === undefined) return [];
  return Array.isArray(answer) ? answer : [answer];
}

function hasAssets(context: Context): boolean {
  const values = selectedValues(context.answers.assets);
  return values.length > 0 && !values.includes("none") && !values.includes("unknown");
}

function hasAnyAsset(context: Context, assets: string[]): boolean {
  const values = selectedValues(context.answers.assets);
  return assets.some((asset) => values.includes(asset));
}

function inquiriesArrive(context: Context): boolean {
  const values = selectedValues(context.answers.sources);
  return values.length > 0 && !values.includes("none");
}

function captureExists(context: Context): boolean {
  const capture = context.answers.capture;
  return typeof capture === "string" && capture !== "no";
}

const localSearchProfiles = profiles.filter((profile) => profile.localSearch).map((profile) => profile.id);

export const questions: Question[] = [
  {
    id: "profile",
    section: "contexto",
    type: "single",
    eyebrow: "PRIMERA PUERTA",
    prompt: "¿Qué quieres entender mejor?",
    helper: "Adapta las preguntas a tu realidad. Podrás cambiarlo con «Volver».",
    purpose: "Selecciona el conjunto de preguntas y las dimensiones aplicables.",
    dimensions: [],
    options: profiles.map((profile) => ({ value: profile.id, label: profile.label })),
  },
  {
    id: "goal",
    section: "contexto",
    type: "single",
    eyebrow: "OBJETIVO",
    prompt: "¿Qué te gustaría resolver primero?",
    helper: "Sirve para priorizar el resultado. No cambia lo que ya tienes ni suma puntos.",
    purpose: "Relevancia de las prioridades y del siguiente paso; no aporta evidencia.",
    dimensions: [],
    options: [
      { value: "be_found", label: "Que más personas me encuentren" },
      { value: "explain", label: "Explicar mejor qué hago y para quién" },
      { value: "trust", label: "Generar más confianza" },
      { value: "opportunities", label: "Recibir más consultas u oportunidades" },
      { value: "stop_losing", label: "Dejar de perder consultas o seguimientos" },
      { value: "organize", label: "Ordenar contactos, tareas y procesos" },
      { value: "automate", label: "Automatizar o delegar trabajo repetitivo" },
      { value: "measure", label: "Medir y entender qué funciona" },
      { value: "unsure", label: "Todavía no lo sé; quiero entender qué necesito" },
    ],
  },
  {
    id: "stage",
    section: "contexto",
    type: "single",
    eyebrow: "MOMENTO",
    prompt: "¿En qué momento estás?",
    helper: "Vale para negocios, profesionales, creadores, proyectos y organizaciones.",
    purpose: "Determina qué bloques aplican: una idea no recibe preguntas de seguimiento comercial.",
    dimensions: [],
    options: [
      { value: "idea", label: "Solo tengo la idea; todavía no atiendo a nadie" },
      { value: "launching", label: "Estoy preparando el lanzamiento" },
      { value: "occasional", label: "Ya funciona, con clientes o actividad ocasional" },
      { value: "regular", label: "Funciona con clientes o actividad regular" },
      { value: "growing", label: "Funciona de forma estable y quiero crecer u ordenar el crecimiento" },
    ],
  },
  {
    id: "team",
    section: "contexto",
    type: "single",
    eyebrow: "EQUIPO",
    prompt: "¿Cuántas personas participan hoy en la operación, incluyéndote?",
    helper: "Es contexto, no una calificación: un equipo grande no significa más madurez.",
    purpose: "Activa preguntas de responsabilidades y matiza recomendaciones; nunca decide la licencia.",
    dimensions: [],
    applies: (context) => Boolean(context.stage) && context.stage !== "idea",
    options: [
      { value: "only_me", label: "Solo yo" },
      { value: "small", label: "Entre 2 y 5" },
      { value: "medium", label: "Entre 6 y 10" },
      { value: "large", label: "Entre 11 y 25" },
      { value: "xl", label: "Más de 25" },
    ],
  },
  {
    id: "assets",
    section: "presencia",
    type: "multi",
    eyebrow: "LO QUE EXISTE",
    prompt: "¿Qué tienes hoy funcionando y actualizado?",
    helper: "Marca solo lo que existe de verdad. Puedes elegir varias opciones.",
    purpose: "Inventario de activos digitales: base de presencia y de alcance potencial. La confianza la miden las preguntas de prueba pública; el contacto, la pregunta de vía de contacto (un activo no es una vía atendida).",
    dimensions: ["presencia", "alcance", "confianza"],
    target: { presencia: 3, alcance: 2, confianza: 1 },
    noneDimensions: ["presencia", "alcance"],
    applies: (context) => Boolean(context.stage),
    options: [
      { value: "domain", label: "Dominio propio (por ejemplo, tunegocio.com)", evidence: { presencia: 1, confianza: 0.5 } },
      { value: "website", label: "Sitio web o página propia", evidence: { presencia: 1, alcance: 1 } },
      { value: "google", label: "Perfil de Google (Maps o Perfil de Negocio)", evidence: { presencia: 1, alcance: 1 } },
      { value: "social", label: "Redes sociales activas", evidence: { presencia: 1, alcance: 0.5 } },
      { value: "whatsapp_business", label: "WhatsApp Business (cuenta de negocio, no personal)", evidence: { presencia: 0.5 } },
      { value: "email_pro", label: "Correo con tu propio dominio", evidence: { presencia: 0.5, confianza: 0.5 } },
      { value: "directory", label: "Perfil en directorios, plataformas o LinkedIn", evidence: { presencia: 0.5, alcance: 1 } },
      { value: "none", label: "Nada de esto todavía", kind: "none", exclusive: true },
      { value: "unknown", label: "No estoy seguro de qué existe o quién lo administra", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "clarity_presence",
    section: "presencia",
    type: "single",
    eyebrow: "CLARIDAD",
    prompt: "Si alguien llega por primera vez a lo que tienes publicado, ¿entiende rápido qué haces, para quién y cómo dar el siguiente paso?",
    helper: "No juzga el diseño: detecta fricción para una persona nueva.",
    purpose: "Claridad de la presencia existente; es la señal más fuerte de la dimensión Claridad.",
    dimensions: ["claridad"],
    weight: { claridad: 2 },
    applies: (context) => hasAssets(context),
    options: [
      { value: "yes", label: "Sí, con claridad", evidence: { claridad: 1 } },
      { value: "partly", label: "En parte: falta información o está desactualizada", evidence: { claridad: 0.5 } },
      { value: "no", label: "No; cuesta entender qué ofrezco o cómo contactarme", evidence: { claridad: 0 } },
      { value: "unknown", label: "No lo sé; nadie me lo ha dicho", kind: "unknown" },
    ],
  },
  {
    id: "offer_clarity",
    section: "presencia",
    type: "single",
    eyebrow: "PROPUESTA",
    prompt: "¿Puedes explicar en una frase qué ofreces, a quién y por qué elegirte?",
    helper: "Si cuesta resumirlo, suele costar también explicarlo en línea.",
    purpose: "Claridad de la oferta cuando aún no hay presencia o el perfil depende de una propuesta explícita.",
    dimensions: ["claridad"],
    applies: (context) =>
      context.stage === "idea" ||
      context.stage === "launching" ||
      context.profile === "creator" ||
      context.profile === "project" ||
      (Boolean(context.answers.assets) && !hasAssets(context)),
    options: [
      { value: "yes", label: "Sí, con claridad", evidence: { claridad: 1 } },
      { value: "partly", label: "Más o menos; me cuesta resumirlo", evidence: { claridad: 0.5 } },
      { value: "no", label: "Todavía no", evidence: { claridad: 0 } },
    ],
  },
  {
    id: "validation",
    section: "alcance",
    type: "single",
    eyebrow: "VALIDACIÓN",
    prompt: "¿Qué has comprobado ya con personas reales?",
    helper: "Antes de construir piezas digitales conviene saber si alguien lo quiere.",
    purpose: "En etapa de idea o lanzamiento, mide alcance real y ordena prioridades (validar antes de construir).",
    dimensions: ["alcance"],
    applies: (context) => context.stage === "idea" || context.stage === "launching",
    options: [
      { value: "none", label: "Nada todavía", evidence: { alcance: 0 } },
      { value: "talked", label: "He hablado con posibles clientes o usuarios", evidence: { alcance: 0.35 } },
      { value: "interest", label: "Algunas personas mostraron interés real", evidence: { alcance: 0.7 } },
      { value: "first", label: "Ya hubo una primera venta, inscripción o participante", evidence: { alcance: 1 } },
    ],
  },
  {
    id: "proof_professional",
    section: "presencia",
    type: "multi",
    eyebrow: "CREDIBILIDAD",
    prompt: "¿Cómo puede alguien comprobar tu experiencia antes de contactarte?",
    helper: "Buscamos señales que ya existan; no se inventa autoridad.",
    purpose: "Prueba pública de experiencia profesional (dimensión Confianza).",
    dimensions: ["confianza"],
    target: { confianza: 2 },
    applies: (context) => context.profile === "professional" && context.stage !== "idea",
    options: [
      { value: "portfolio", label: "Portafolio, casos o trabajos visibles", evidence: { confianza: 1 } },
      { value: "credentials", label: "Credenciales, formación o experiencia verificable", evidence: { confianza: 1 } },
      { value: "reviews", label: "Recomendaciones o reseñas públicas", evidence: { confianza: 1 } },
      { value: "profile", label: "Perfil profesional actualizado (LinkedIn u otro)", evidence: { confianza: 0.5 } },
      { value: "none", label: "No lo muestro en ningún lugar", kind: "none", exclusive: true },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "proof_business",
    section: "presencia",
    type: "multi",
    eyebrow: "CONFIANZA",
    prompt: "¿Qué señales de confianza puede ver un cliente nuevo antes de decidir?",
    helper: "Reseñas, fotos reales y datos completos pesan más que un logo.",
    purpose: "Prueba pública que respalda a un negocio (dimensión Confianza). Las reseñas pesan más porque en búsquedas locales son la señal más consultada; sin ellas la dimensión no pasa de «en construcción».",
    dimensions: ["confianza"],
    target: { confianza: 3.5 },
    applies: (context) => context.profile === "business" && context.stage !== "idea",
    options: [
      { value: "reviews", label: "Reseñas públicas (Google, redes o plataformas)", evidence: { confianza: 1.5 } },
      { value: "photos", label: "Fotos reales del negocio, productos o trabajo", evidence: { confianza: 1 } },
      { value: "info", label: "Datos completos y actualizados: dirección, horarios y contacto", evidence: { confianza: 1 } },
      { value: "cases", label: "Clientes, casos o trabajos realizados", evidence: { confianza: 0.5 } },
      { value: "none", label: "Ninguna de estas todavía", kind: "none", exclusive: true },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "proof_creator",
    section: "presencia",
    type: "multi",
    eyebrow: "CREDIBILIDAD",
    prompt: "¿Qué respalda hoy tu credibilidad ante una marca o cliente?",
    helper: "La audiencia ayuda, pero no reemplaza una oferta explicable.",
    purpose: "Prueba pública de un creador (dimensión Confianza) y claridad de la oferta.",
    dimensions: ["confianza", "claridad"],
    target: { confianza: 2, claridad: 0.5 },
    noneDimensions: ["confianza"],
    applies: (context) => context.profile === "creator" && context.stage !== "idea",
    options: [
      { value: "body", label: "Contenido o trabajos publicados de forma sostenida", evidence: { confianza: 1 } },
      { value: "results", label: "Resultados, testimonios o colaboraciones visibles", evidence: { confianza: 1 } },
      { value: "offer", label: "Una página o perfil que explica qué ofrezco y cómo trabajar conmigo", evidence: { confianza: 1, claridad: 0.5 } },
      { value: "none", label: "Nada de esto todavía", kind: "none", exclusive: true },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "proof_org",
    section: "presencia",
    type: "multi",
    eyebrow: "TRANSPARENCIA",
    prompt: "¿Qué puede verificar alguien sobre el proyecto o la organización?",
    helper: "Quién está detrás, qué hace y dónde informarse.",
    purpose: "Prueba pública de proyectos y organizaciones (dimensión Confianza), con claridad y canal oficial.",
    dimensions: ["confianza", "claridad", "contacto"],
    target: { confianza: 2, claridad: 0.5, contacto: 0.5 },
    noneDimensions: ["confianza"],
    applies: (context) => (context.profile === "project" || context.profile === "organization") && context.stage !== "idea",
    options: [
      { value: "who", label: "Quiénes están detrás", evidence: { confianza: 1 } },
      { value: "purpose", label: "Propósito y actividades explicadas", evidence: { confianza: 1, claridad: 0.5 } },
      { value: "evidence", label: "Evidencia de actividad: eventos, resultados o fotos", evidence: { confianza: 1 } },
      { value: "channel", label: "Un canal oficial para informarse o participar", evidence: { confianza: 0.5, contacto: 0.5 } },
      { value: "none", label: "Nada de esto todavía", kind: "none", exclusive: true },
      { value: "unknown", label: "No estoy seguro", kind: "unknown", exclusive: true },
    ],
  },
  {
    id: "control",
    section: "presencia",
    type: "single",
    eyebrow: "CONTROL",
    prompt: "¿Tienes acceso y control de tu dominio y tu sitio (propiedad, contraseñas, quién administra)?",
    helper: "Un activo que administra otra persona sin acceso tuyo es un riesgo, aunque funcione.",
    purpose: "Riesgo de propiedad de activos digitales; sostiene la dimensión Presencia y una prioridad fundacional.",
    dimensions: ["presencia"],
    applies: (context) => hasAnyAsset(context, ["domain", "website"]),
    options: [
      { value: "yes", label: "Sí: está a mi nombre y tengo acceso", evidence: { presencia: 1 } },
      { value: "partly", label: "En parte: algo lo administra otra persona y no tengo acceso", evidence: { presencia: 0.4 } },
      { value: "no", label: "No; depende por completo de un tercero", evidence: { presencia: 0 } },
      { value: "unknown", label: "No lo sé", kind: "unknown" },
    ],
  },
  {
    id: "sources",
    section: "alcance",
    type: "multi",
    eyebrow: "ORIGEN",
    prompt: "¿Por dónde llegan hoy la mayoría de tus consultas, clientes o participantes?",
    helper: "Marca los canales reales. Si no lo sabes, decirlo es útil para el resultado.",
    purpose: "Alcance real y dependencia de canales; «no sé por dónde llegan» es evidencia sustantiva de falta de medición.",
    dimensions: ["alcance", "medicion"],
    target: { alcance: 2 },
    noneDimensions: ["alcance"],
    applies: (context) => isOperating(context.stage),
    options: [
      { value: "referrals", label: "Recomendaciones de boca en boca", evidence: { alcance: 0.5 } },
      { value: "social", label: "Redes sociales", evidence: { alcance: 1 } },
      { value: "google", label: "Google o Maps", evidence: { alcance: 1 } },
      { value: "website", label: "Mi sitio web", evidence: { alcance: 1 } },
      { value: "marketplace", label: "Marketplaces o plataformas", evidence: { alcance: 0.5 } },
      { value: "ads", label: "Publicidad pagada", evidence: { alcance: 0.5 } },
      { value: "offline", label: "Local físico, ferias o contacto directo", evidence: { alcance: 0.5 } },
      { value: "none", label: "Todavía no llegan consultas", kind: "none", exclusive: true },
      { value: "dontknow", label: "No sé por dónde llegan", evidence: { medicion: 0 }, uncertainFor: ["alcance"], exclusive: true },
    ],
  },
  {
    id: "discoverability",
    section: "alcance",
    type: "single",
    eyebrow: "BÚSQUEDA",
    prompt: "Si alguien busca en Google lo que ofreces en tu zona, ¿apareces?",
    helper: "Puedes comprobarlo ahora mismo desde el teléfono.",
    purpose: "Descubribilidad local para perfiles que dependen de búsquedas (negocio, profesional, organización).",
    dimensions: ["alcance"],
    weight: { alcance: 2 },
    applies: (context) => isOperating(context.stage) && context.profile !== undefined && localSearchProfiles.includes(context.profile),
    options: [
      { value: "top", label: "Sí, entre los primeros resultados", evidence: { alcance: 1 } },
      { value: "some", label: "Aparezco, pero no destaco", evidence: { alcance: 0.5 } },
      { value: "no", label: "No aparezco", evidence: { alcance: 0 } },
      { value: "unknown", label: "Nunca lo he comprobado", kind: "unknown" },
      { value: "na", label: "No aplica: no dependo de búsquedas locales", kind: "not_applicable" },
    ],
  },
  {
    id: "audience",
    section: "alcance",
    type: "single",
    eyebrow: "AUDIENCIA",
    prompt: "¿Cómo describirías tu audiencia hoy?",
    helper: "Importa más que responda que su tamaño.",
    purpose: "Alcance de un creador; sustituye la pregunta de búsqueda local.",
    dimensions: ["alcance"],
    weight: { alcance: 2 },
    applies: (context) => context.profile === "creator" && context.stage !== "idea",
    options: [
      { value: "none", label: "Todavía no tengo audiencia", evidence: { alcance: 0 } },
      { value: "small", label: "Pequeña y esporádica", evidence: { alcance: 0.35 } },
      { value: "growing", label: "Crece y responde a lo que publico", evidence: { alcance: 0.7 } },
      { value: "established", label: "Estable: responde, comparte y me recomienda", evidence: { alcance: 1 } },
    ],
  },
  {
    id: "reach",
    section: "alcance",
    type: "single",
    eyebrow: "ALCANCE",
    prompt: "¿Quién conoce hoy el proyecto?",
    helper: "Un proyecto temprano necesita claridad antes que piezas digitales complejas.",
    purpose: "Alcance de un proyecto; sustituye la pregunta de búsqueda local.",
    dimensions: ["alcance"],
    weight: { alcance: 2 },
    applies: (context) => context.profile === "project" && context.stage !== "idea",
    options: [
      { value: "nobody", label: "Casi nadie fuera de quienes lo construyen", evidence: { alcance: 0 } },
      { value: "circle", label: "Mi círculo cercano", evidence: { alcance: 0.3 } },
      { value: "first", label: "Primeros usuarios o participantes", evidence: { alcance: 0.65 } },
      { value: "community", label: "Una comunidad que participa", evidence: { alcance: 1 } },
    ],
  },
  {
    id: "contact_path",
    section: "proceso",
    type: "single",
    eyebrow: "CONTACTO",
    prompt: "Cuando alguien quiere escribirte o llamarte, ¿tiene una vía clara y atendida?",
    helper: "Varios canales sin uno principal suelen dispersar las consultas.",
    purpose: "Existencia de un camino de contacto claro (dimensión Contacto).",
    dimensions: ["contacto"],
    weight: { contacto: 2 },
    applies: (context) => Boolean(context.stage) && context.stage !== "idea",
    options: [
      { value: "one", label: "Sí: un canal principal, claro y atendido", evidence: { contacto: 1 } },
      { value: "many", label: "Sí, varios canales; respondo donde llegue", evidence: { contacto: 0.6 } },
      { value: "unclear", label: "No está claro; a veces no saben cómo contactarme", evidence: { contacto: 0.25 } },
      { value: "none", label: "No tengo un canal definido", evidence: { contacto: 0 } },
    ],
  },
  {
    id: "capture",
    section: "proceso",
    type: "single",
    eyebrow: "REGISTRO",
    prompt: "Cuando llega una consulta, ¿queda registrada en un mismo lugar para darle seguimiento?",
    helper: "Si otras personas atienden, es válido responder que no lo sabes.",
    purpose: "Captura consistente de consultas: base del seguimiento y de cualquier automatización.",
    dimensions: ["contacto", "seguimiento"],
    weight: { contacto: 1, seguimiento: 2 },
    applies: (context) => isOperating(context.stage) && inquiriesArrive(context),
    options: [
      { value: "always", label: "Sí, siempre en un mismo lugar", evidence: { contacto: 1, seguimiento: 1 } },
      { value: "sometimes", label: "A veces; depende del canal o de quién atiende", evidence: { contacto: 0.4, seguimiento: 0.4 } },
      { value: "no", label: "No; queda en el chat o en la memoria", evidence: { contacto: 0, seguimiento: 0 } },
      { value: "unknown", label: "No lo sé", kind: "unknown" },
    ],
  },
  {
    id: "response",
    section: "proceso",
    type: "single",
    eyebrow: "RESPUESTA",
    prompt: "¿Cuánto suele tardar la primera respuesta a una consulta nueva?",
    helper: "Las consultas en línea pierden valor en horas, no en días.",
    purpose: "Velocidad de respuesta: fuga comercial temprana (dimensión Seguimiento).",
    dimensions: ["seguimiento"],
    applies: (context) => isOperating(context.stage) && inquiriesArrive(context),
    options: [
      { value: "hour", label: "Menos de una hora", evidence: { seguimiento: 1 } },
      { value: "day", label: "El mismo día", evidence: { seguimiento: 0.7 } },
      { value: "days", label: "Uno o más días", evidence: { seguimiento: 0.3 } },
      { value: "varies", label: "Depende; algunas se quedan sin respuesta", evidence: { seguimiento: 0.15 } },
      { value: "unknown", label: "No lo sé", kind: "unknown" },
    ],
  },
  {
    id: "follow_up",
    section: "proceso",
    type: "single",
    eyebrow: "SEGUIMIENTO",
    prompt: "Si la persona no decide en la primera conversación, ¿qué pasa después?",
    helper: "Un seguimiento definido no depende de la memoria de nadie.",
    purpose: "Persistencia del seguimiento: núcleo de la dimensión Seguimiento.",
    dimensions: ["seguimiento"],
    weight: { seguimiento: 2 },
    applies: (context) => isOperating(context.stage) && inquiriesArrive(context),
    options: [
      { value: "system", label: "Hay un seguimiento definido: recordatorio, tarea o mensaje programado", evidence: { seguimiento: 1 } },
      { value: "manual", label: "Le escribo si me acuerdo", evidence: { seguimiento: 0.35 } },
      { value: "none", label: "Normalmente no hay seguimiento", evidence: { seguimiento: 0 } },
      { value: "unknown", label: "No lo sé", kind: "unknown" },
    ],
  },
  {
    id: "pipeline",
    section: "proceso",
    type: "single",
    eyebrow: "OPORTUNIDADES",
    prompt: "¿Sabes en qué estado está cada oportunidad abierta (consultó, cotizó, agendó, cerró, se perdió)?",
    helper: "Si vendes de forma directa sin cotizar ni agendar, puede no aplicar.",
    purpose: "Visibilidad del estado de las oportunidades; solo con actividad regular y algún registro.",
    dimensions: ["seguimiento"],
    weight: { seguimiento: 1.5 },
    applies: (context) => isEstablished(context.stage) && inquiriesArrive(context) && captureExists(context),
    options: [
      { value: "tool", label: "Sí, en una herramienta o lista que se actualiza", evidence: { seguimiento: 1 } },
      { value: "partial", label: "Más o menos: de memoria o en notas sueltas", evidence: { seguimiento: 0.4 } },
      { value: "no", label: "No", evidence: { seguimiento: 0 } },
      { value: "na", label: "No aplica a mi actividad", kind: "not_applicable" },
    ],
  },
  {
    id: "responsibilities",
    section: "proceso",
    type: "single",
    eyebrow: "EQUIPO",
    prompt: "¿Está claro quién responde y quién da seguimiento a cada consulta?",
    helper: "Cuando nadie es responsable, las consultas se duplican o se quedan sin dueño.",
    purpose: "Reparto de responsabilidades cuando hay equipo y llegan consultas (dimensión Seguimiento).",
    dimensions: ["seguimiento"],
    applies: (context) => hasTeam(context.team) && isOperating(context.stage) && inquiriesArrive(context),
    options: yesNoUnknown({ yes: 1, partly: 0.4, no: 0 }, ["seguimiento"]),
  },
  {
    id: "repetitive",
    section: "proceso",
    type: "single",
    eyebrow: "TRABAJO REPETITIVO",
    prompt: "¿Cuánto trabajo repetitivo hay cada semana en atención y seguimiento (recordatorios, confirmaciones, mensajes iguales, cotizaciones)?",
    helper: "No suma ni resta puntos: sirve para saber si automatizar tiene sentido.",
    purpose: "Señal de oportunidad de automatización; no es evidencia de madurez.",
    dimensions: [],
    applies: (context) => isEstablished(context.stage) && inquiriesArrive(context) && captureExists(context),
    options: [
      { value: "a_lot", label: "Mucho: consume horas cada semana" },
      { value: "some", label: "Algo, pero es manejable" },
      { value: "little", label: "Poco o nada" },
      { value: "unknown", label: "No lo sé", kind: "unknown" },
    ],
  },
  {
    id: "post_sale",
    section: "proceso",
    type: "single",
    eyebrow: "DESPUÉS DE LA VENTA",
    prompt: "Después de una venta o servicio, ¿pides una reseña, haces seguimiento o vuelves a contactar?",
    helper: "La reputación y la recompra se construyen después de la primera venta.",
    purpose: "Ciclo posventa: reputación (Confianza) y continuidad (Seguimiento). Solo con actividad regular y consultas reales.",
    dimensions: ["confianza", "seguimiento"],
    weight: { confianza: 1, seguimiento: 0.5 },
    applies: (context) => isEstablished(context.stage) && inquiriesArrive(context),
    variants: {
      project: { prompt: "Después de una actividad o participación, ¿pides opinión, haces seguimiento o vuelves a contactar?", helper: "La confianza y la continuidad se construyen después de la primera participación." },
      organization: { prompt: "Después de una actividad o servicio a la comunidad, ¿pides opinión, haces seguimiento o vuelves a contactar?", helper: "La confianza y la continuidad se construyen después de la primera participación." },
      creator: { prompt: "Después de una colaboración o venta, ¿pides una valoración, haces seguimiento o vuelves a contactar?", helper: "La reputación y la recompra se construyen después del primer encargo." },
    },
    options: [
      { value: "regular", label: "Sí, de forma habitual", evidence: { confianza: 1, seguimiento: 1 } },
      { value: "sometimes", label: "A veces", evidence: { confianza: 0.5, seguimiento: 0.5 } },
      { value: "no", label: "No", evidence: { confianza: 0, seguimiento: 0 } },
      { value: "na", label: "No aplica a mi actividad", kind: "not_applicable" },
    ],
  },
  {
    id: "measurement",
    section: "medicion",
    type: "multi",
    eyebrow: "DATOS",
    prompt: "¿Qué sabes hoy con datos y no solo por intuición?",
    helper: "No hace falta un panel: una lista al día ya cuenta.",
    purpose: "Capacidad de medir: origen, volumen, conversión y pérdida (dimensión Medición). Solo cuando llegan consultas: no se mide lo que no existe.",
    dimensions: ["medicion"],
    target: { medicion: 3 },
    applies: (context) => isOperating(context.stage) && inquiriesArrive(context),
    options: [
      { value: "sources", label: "De dónde llegan las consultas", evidence: { medicion: 1 } },
      { value: "volume", label: "Cuántas consultas llegan por semana o por mes", evidence: { medicion: 1 } },
      { value: "conversion", label: "Cuántas se convierten en clientes", evidence: { medicion: 1 } },
      { value: "lost", label: "Cuántas se pierden y por qué", evidence: { medicion: 1 } },
      { value: "review", label: "Reviso estos datos con alguna regularidad", evidence: { medicion: 1 } },
      { value: "none", label: "Nada de esto; me guío por intuición", kind: "none", exclusive: true },
    ],
  },
];

export const questionById: Record<string, Question> = Object.fromEntries(questions.map((question) => [question.id, question]));

export function getQuestion(id: string): Question | undefined {
  return questionById[id];
}

export function getOption(question: Question, value: string): QuestionOption | undefined {
  return question.options.find((option) => option.value === value);
}

export function optionLabel(questionId: QuestionId, value: string): string {
  const question = getQuestion(questionId);
  return (question && getOption(question, value)?.label) ?? value;
}

/** Enunciado y ayuda adaptados al perfil cuando la pregunta define variantes. */
export function questionCopy(question: Question, profile: ProfileId | undefined): { prompt: string; helper?: string } {
  const variant = profile ? question.variants?.[profile] : undefined;
  return { prompt: variant?.prompt ?? question.prompt, helper: variant?.helper ?? question.helper };
}
