import type { ResolvedDomainContext } from "./context-resolver";
import type { AnswersV2 } from "./qbv2-rules";

/**
 * DIAG-V3-08F — modelo de terminología. Un léxico pequeño y determinista: cada perfil de lenguaje resuelve
 * los mismos roles semánticos (quién encuentra el negocio, quién muestra interés, quién ya es cliente…) con
 * el sustantivo correcto para ese tipo de negocio. Nunca es un reemplazo de palabras: las preguntas usan
 * frases completas (base neutral o variante explícita por perfil) y este léxico es la fuente única de los
 * sustantivos para la ayuda, las listas de términos a evitar y el futuro lenguaje de resultados (08G).
 */

export const TERMINOLOGY_PROFILE_IDS = [
  "generic", "prelaunch", "local", "local_service", "appointments", "clinical", "professional", "retail", "ecommerce", "hospitality", "b2b", "creator", "nonprofit",
] as const;
export type TerminologyProfileId = (typeof TERMINOLOGY_PROFILE_IDS)[number];

/**
 * Roles semánticos, en orden de ciclo de vida: `audience` (quien podría encontrar el negocio) →
 * `interested` (quien muestra interés) → `inquiry` (el primer contacto concreto) → `opportunity` (un
 * interés que se trabaja activamente) → `customer` → `repeat_customer`. `business`, `offer`, `conversion`
 * y `transaction` completan las frases sin depender de una etapa.
 */
export const TERM_ROLES = ["business", "offer", "audience", "interested", "inquiry", "opportunity", "conversion", "transaction", "customer", "repeat_customer"] as const;
export type TermRole = (typeof TERM_ROLES)[number];

export type TerminologyProfile = {
  readonly id: TerminologyProfileId;
  /** Cuándo aplica (documentación del perfil; la regla ejecutable es `resolveTerminologyProfile`). */
  readonly appliesTo: string;
  /** Formas en plural con determinante neutro ("tus", "las") para no depender de género gramatical. */
  readonly terms: Readonly<Record<TermRole, string>>;
  /** Términos que no deben aparecer en el copy visible de este perfil (preguntas no clasificatorias). */
  readonly avoid: readonly string[];
};

const COMMERCIAL_AVOID_FOR_NONPROFIT = ["comprador", "compran", "comprando", "vender", "vendes", "venta", "cliente", "negocio", "cotización"] as const;

export const TERMINOLOGY: Readonly<Record<TerminologyProfileId, TerminologyProfile>> = {
  generic: {
    id: "generic", appliesTo: "Contexto sin resolver o híbrido: lenguaje neutral válido para cualquier negocio.",
    terms: { business: "tu negocio", offer: "lo que ofreces", audience: "las personas que podrían necesitar lo que ofreces", interested: "las personas interesadas", inquiry: "las consultas", opportunity: "las oportunidades", conversion: "comprar o contratar", transaction: "las ventas", customer: "tus clientes", repeat_customer: "los clientes que vuelven" },
    avoid: ["paciente", "donante", "huésped"],
  },
  prelaunch: {
    id: "prelaunch", appliesTo: "Idea o proyecto sin clientes reales todavía (`growthStage: idea`, o proyecto aún sin etapa).",
    terms: { business: "tu proyecto", offer: "lo que planeas ofrecer", audience: "las personas a las que quieres llegar", interested: "las personas que muestran interés", inquiry: "las primeras solicitudes", opportunity: "las primeras oportunidades", conversion: "dar el primer paso contigo", transaction: "los primeros acuerdos", customer: "tus primeros clientes", repeat_customer: "los clientes que vuelvan" },
    avoid: ["tus clientes", "tus pacientes", "te compraron", "ya te compró", "clientes que ya", "tus pedidos", "regresan"],
  },
  local: {
    id: "local", appliesTo: "Local físico sin inventario de reventa (`archetype: local`).",
    terms: { business: "tu negocio", offer: "tus servicios", audience: "las personas de tu zona", interested: "las personas interesadas", inquiry: "las consultas", opportunity: "las oportunidades", conversion: "visitarte o contratar", transaction: "las visitas o ventas", customer: "tus clientes", repeat_customer: "los clientes que vuelven" },
    avoid: ["paciente", "donante"],
  },
  local_service: {
    id: "local_service", appliesTo: "Servicio que se desplaza al cliente (`archetype: local_service`).",
    terms: { business: "tu negocio", offer: "tu servicio", audience: "las personas de tu zona de servicio", interested: "las personas que piden información o una cotización", inquiry: "las solicitudes de servicio", opportunity: "las cotizaciones pendientes", conversion: "contratar el servicio", transaction: "los trabajos", customer: "tus clientes", repeat_customer: "los clientes que vuelven a llamar" },
    avoid: ["paciente", "donante", "carrito"],
  },
  appointments: {
    id: "appointments", appliesTo: "Servicio con citas entre varias personas o espacios, no clínico (`archetype: appointments`).",
    terms: { business: "tu negocio", offer: "tus servicios", audience: "las personas que podrían necesitar tus servicios", interested: "las personas que preguntan por una cita", inquiry: "las solicitudes de cita", opportunity: "las citas por confirmar", conversion: "agendar una cita", transaction: "las citas", customer: "tus clientes", repeat_customer: "los clientes que vuelven" },
    avoid: ["paciente", "donante", "carrito", "cotización"],
  },
  clinical: {
    id: "clinical", appliesTo: "Salud con práctica profesional con licencia (`nicheGroup: health_wellness` + monetización `licensed`). Un gimnasio o spa no es clínico.",
    terms: { business: "tu consulta o centro", offer: "tu atención", audience: "las personas que podrían necesitar atención", interested: "las personas que solicitan atención", inquiry: "las solicitudes de cita", opportunity: "las citas por confirmar", conversion: "agendar una cita", transaction: "las citas", customer: "tus pacientes", repeat_customer: "los pacientes que regresan" },
    avoid: ["donante", "carrito", "comprador"],
  },
  professional: {
    id: "professional", appliesTo: "Profesional independiente sin colega en el mismo servicio (`archetype: professional`).",
    terms: { business: "tu práctica profesional", offer: "tus servicios", audience: "las personas que podrían necesitar tus servicios", interested: "las personas interesadas en trabajar contigo", inquiry: "las consultas", opportunity: "las propuestas en curso", conversion: "contratarte", transaction: "los encargos", customer: "tus clientes", repeat_customer: "los clientes que vuelven" },
    avoid: ["paciente", "donante", "carrito"],
  },
  retail: {
    id: "retail", appliesTo: "Tienda física con productos en exhibición (`archetype: retail`).",
    terms: { business: "tu tienda", offer: "tus productos", audience: "las personas de tu zona", interested: "las personas interesadas en tus productos", inquiry: "las preguntas sobre productos", opportunity: "las ventas posibles", conversion: "comprar", transaction: "las compras", customer: "tus clientes", repeat_customer: "los clientes que vuelven a comprar" },
    avoid: ["paciente", "donante", "cotización"],
  },
  ecommerce: {
    id: "ecommerce", appliesTo: "Venta con pago en línea (`archetype: ecommerce`).",
    terms: { business: "tu tienda en línea", offer: "tus productos", audience: "las personas que podrían comprar en línea", interested: "las personas que visitan la tienda o preguntan por un producto", inquiry: "las preguntas sobre productos", opportunity: "los carritos sin terminar", conversion: "comprar", transaction: "los pedidos", customer: "tus clientes", repeat_customer: "los clientes que vuelven a comprar" },
    avoid: ["paciente", "donante", "cotización"],
  },
  hospitality: {
    id: "hospitality", appliesTo: "Consumo o estancia en el lugar: restaurantes, cafés, hospedaje (`archetype: hospitality`).",
    terms: { business: "tu negocio", offer: "lo que ofreces", audience: "las personas de tu zona o de visita", interested: "las personas que preguntan o quieren reservar", inquiry: "las solicitudes de reserva", opportunity: "las reservas por confirmar", conversion: "reservar o venir", transaction: "las visitas o reservas", customer: "tus clientes", repeat_customer: "los clientes que vuelven" },
    avoid: ["paciente", "donante", "cotización", "carrito"],
  },
  b2b: {
    id: "b2b", appliesTo: "El comprador es otra empresa, con su propio proceso de decisión (`archetype: b2b`).",
    terms: { business: "tu negocio", offer: "tu propuesta", audience: "las empresas que podrían necesitarte", interested: "las empresas interesadas", inquiry: "los primeros contactos", opportunity: "las oportunidades de venta", conversion: "contratar", transaction: "los contratos", customer: "tus clientes", repeat_customer: "los clientes que renuevan o vuelven a contratar" },
    avoid: ["paciente", "donante", "carrito"],
  },
  creator: {
    id: "creator", appliesTo: "Monetiza audiencia o contenido propio (`archetype: creator`).",
    terms: { business: "tu proyecto de contenido", offer: "lo que vendes o publicas", audience: "tu audiencia", interested: "las personas de tu audiencia interesadas en lo que vendes", inquiry: "los mensajes o solicitudes", opportunity: "las colaboraciones o ventas posibles", conversion: "comprar o contratar algo tuyo", transaction: "las ventas o colaboraciones", customer: "las personas que te compran", repeat_customer: "las personas que te vuelven a comprar" },
    avoid: ["paciente", "donante"],
  },
  nonprofit: {
    id: "nonprofit", appliesTo: "Organización sin fines de lucro o comunidad (`businessModel: nonprofit`).",
    terms: { business: "tu organización", offer: "tu labor", audience: "las personas que podrían conocer tu labor", interested: "las personas interesadas en apoyar o participar", inquiry: "las solicitudes de información", opportunity: "los apoyos posibles", conversion: "apoyar o participar", transaction: "los apoyos", customer: "las personas que apoyan o participan", repeat_customer: "las personas que vuelven a apoyar o participar" },
    avoid: COMMERCIAL_AVOID_FOR_NONPROFIT,
  },
};

type TerminologyContext = Partial<Pick<ResolvedDomainContext, "entity" | "businessModel" | "archetype" | "nicheGroup" | "growthStage">>;

function resolvedValue(context: TerminologyContext, field: keyof TerminologyContext): string | undefined {
  const value = context[field] as { status?: string; value?: unknown } | undefined;
  return value?.status === "resolved" && typeof value.value === "string" ? value.value : undefined;
}

function answerIncludes(answers: AnswersV2 | undefined, questionId: string, value: string): boolean {
  const answer = answers?.[questionId];
  return Array.isArray(answer) ? answer.includes(value) : answer === value;
}

const ARCHETYPE_PROFILES: ReadonlySet<string> = new Set(["local", "local_service", "appointments", "professional", "retail", "ecommerce", "hospitality", "b2b", "creator"]);

/**
 * Precedencia: ciclo de vida (pre-lanzamiento) > misión (nonprofit) > práctica clínica > archetype > neutral.
 * Un archetype híbrido usa el perfil neutral: sus dos familias de preguntas ya llevan su propio contexto.
 */
export function resolveTerminologyProfile(context: TerminologyContext, answers?: AnswersV2): TerminologyProfileId {
  const stage = resolvedValue(context, "growthStage");
  if (stage === "idea" || (stage === undefined && resolvedValue(context, "entity") === "project")) return "prelaunch";
  if (resolvedValue(context, "businessModel") === "nonprofit") return "nonprofit";
  const archetype = resolvedValue(context, "archetype");
  if (resolvedValue(context, "nicheGroup") === "health_wellness" && answerIncludes(answers, "q2_monetization", "licensed") && (archetype === "appointments" || archetype === "professional" || archetype === "hybrid")) return "clinical";
  return archetype && ARCHETYPE_PROFILES.has(archetype) ? (archetype as TerminologyProfileId) : "generic";
}

export function resolveTerm(role: TermRole, profile: TerminologyProfileId): string {
  return TERMINOLOGY[profile].terms[role];
}
