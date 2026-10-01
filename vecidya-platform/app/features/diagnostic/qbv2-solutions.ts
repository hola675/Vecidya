import type { CapabilityState, ContextualScoringResult } from "./qbv2-contextual-scoring";
import type { DigitalDimensionId } from "./qbv2-coverage";
import type { DiagnosticNarrative } from "./qbv2-narrative";
import type { ConstraintPriorityResult } from "./qbv2-priorities";
import type { DiagnosticRecommendation, RecommendationType } from "./qbv2-recommendations";

/**
 * DIAG-V3-10 — catálogo de soluciones. Una solución es un TIPO de intervención que puede mejorar una capacidad
 * («registro de contactos y rutina de seguimiento»), no un producto: la disponibilidad comercial vive aparte en
 * `qbv2-offerings.ts`. El emparejamiento es determinista, parte siempre de una recomendación y aplica reglas de
 * exclusión explícitas para no proponer lo que la evidencia no respalda.
 */

export const SOLUTION_IDS = [
  "offer_message", "launch_channel_plan", "website", "local_listing", "organic_discovery", "social_content", "advertising",
  "reputation_reviews", "credibility_proof", "contact_path", "online_booking", "checkout_experience", "crm_follow_up",
  "follow_up_automation", "measurement_tracking", "measurement_plan", "work_organization", "operational_automation", "integrations",
] as const;
export type SolutionId = (typeof SOLUTION_IDS)[number];

export type SolutionCatalogItem = { readonly id: SolutionId; readonly label: string; readonly description: string; readonly types: readonly RecommendationType[] };

/** Copy neutral para todos los perfiles: sin «cliente», «negocio», «venta» ni términos de una sola industria. */
export const SOLUTION_CATALOG: Readonly<Record<SolutionId, SolutionCatalogItem>> = {
  offer_message: { id: "offer_message", label: "Mensaje claro de tu propuesta", description: "Ordenar cómo se explica qué haces, para quién es y cuál es el siguiente paso, y usar ese mismo mensaje en todos tus canales.", types: ["clarity"] },
  launch_channel_plan: { id: "launch_channel_plan", label: "Plan del primer canal", description: "Elegir un canal principal para el lanzamiento y preparar lo mínimo para que funcione desde el primer día.", types: ["discovery", "conversion", "foundation"] },
  website: { id: "website", label: "Sitio web propio y actualizado", description: "Un sitio propio con la información esencial y un contacto claro, que no dependa solo de plataformas de terceros.", types: ["foundation"] },
  local_listing: { id: "local_listing", label: "Presencia en mapas y buscadores locales", description: "Fichas completas y consistentes en mapas y buscadores, para que te encuentren quienes están cerca.", types: ["discovery"] },
  organic_discovery: { id: "organic_discovery", label: "Descubrimiento en buscadores", description: "Páginas y contenido pensados para que te encuentren cuando buscan lo que haces.", types: ["discovery"] },
  social_content: { id: "social_content", label: "Contenido constante en redes", description: "Publicaciones con un ritmo sostenible que lleven a tus propios canales de contacto.", types: ["discovery"] },
  advertising: { id: "advertising", label: "Publicidad pagada", description: "Campañas pagadas para ampliar el alcance cuando la base ya convierte el interés que llega.", types: ["discovery"] },
  reputation_reviews: { id: "reputation_reviews", label: "Rutina de reseñas", description: "Pedir y mostrar opiniones de personas reales después de cada experiencia.", types: ["trust"] },
  credibility_proof: { id: "credibility_proof", label: "Pruebas visibles de credibilidad", description: "Mostrar trayectoria, credenciales o resultados verificables donde las personas te evalúan.", types: ["trust"] },
  contact_path: { id: "contact_path", label: "Ruta de contacto clara", description: "Un camino directo para dar el siguiente paso: formulario, botón de contacto o mensaje.", types: ["conversion"] },
  online_booking: { id: "online_booking", label: "Agenda en línea", description: "Que se pueda pedir o confirmar una cita sin ida y vuelta de mensajes.", types: ["conversion"] },
  checkout_experience: { id: "checkout_experience", label: "Experiencia de compra en línea", description: "Revisar el recorrido desde el producto hasta el pago para quitar pasos y dudas.", types: ["conversion"] },
  crm_follow_up: { id: "crm_follow_up", label: "Registro de contactos y rutina de seguimiento (CRM)", description: "Un solo lugar para registrar cada contacto, su estado y el siguiente paso, con una persona responsable.", types: ["follow_up"] },
  follow_up_automation: { id: "follow_up_automation", label: "Seguimiento automatizado", description: "Recordatorios y mensajes automáticos sobre un proceso de seguimiento que ya está definido.", types: ["follow_up"] },
  measurement_tracking: { id: "measurement_tracking", label: "Medición de origen y resultados", description: "Registrar de dónde llega cada contacto y revisar con regularidad qué da resultado.", types: ["measurement"] },
  measurement_plan: { id: "measurement_plan", label: "Plan de medición para el lanzamiento", description: "Definir antes de lanzar qué se va a medir y dónde se va a anotar.", types: ["measurement"] },
  work_organization: { id: "work_organization", label: "Orden de la información y las tareas", description: "Reunir información, contactos y tareas en un sistema compartido, con responsables claros, antes de automatizar.", types: ["readiness"] },
  operational_automation: { id: "operational_automation", label: "Automatización de tareas repetitivas", description: "Automatizar pasos que ya se hacen de forma repetible, para liberar tiempo sin perder control.", types: ["readiness"] },
  integrations: { id: "integrations", label: "Integración entre herramientas", description: "Conectar las herramientas que ya usas para que la información no se copie a mano.", types: ["readiness"] },
};

/** Reglas que impiden proponer una solución; cada exclusión queda registrada con su regla. */
export const EXCLUSION_RULES = [
  "verify_before_intervention", "advertising_requires_active_acquisition", "crm_requires_contact_flow", "automation_requires_defined_process",
  "analytics_requires_activity", "reputation_requires_customers", "website_requires_base_gap",
] as const;
export type ExclusionRule = (typeof EXCLUSION_RULES)[number];

export type SolutionMatch = {
  readonly recommendationId: string;
  /** `null` cuando ninguna intervención está respaldada todavía (p. ej. primero hay que verificar). */
  readonly solution: SolutionCatalogItem | null;
  readonly alternatives: readonly SolutionCatalogItem[];
  readonly exclusions: readonly { readonly solutionId: SolutionId; readonly rule: ExclusionRule }[];
};

export type SolutionContext = {
  readonly lifecycle: DiagnosticNarrative["lifecycle"];
  readonly profile: DiagnosticNarrative["profile"];
  readonly goal: ConstraintPriorityResult["context"]["goal"];
  readonly friction: ConstraintPriorityResult["context"]["friction"];
  readonly stage: ConstraintPriorityResult["context"]["stage"];
  readonly score: (dimension: DigitalDimensionId) => number | null;
  /** Estado de capacidad que el scoring congelado asignó a una respuesta (nunca el valor crudo). */
  readonly stateOf: (questionId: string) => CapabilityState | undefined;
  readonly processMaturity: "defined" | "undefined";
};

const LOCAL_PROFILES: ReadonlySet<DiagnosticNarrative["profile"]> = new Set(["local", "local_service", "appointments", "clinical", "retail", "hospitality", "nonprofit"]);
const BOOKING_PROFILES: ReadonlySet<DiagnosticNarrative["profile"]> = new Set(["appointments", "clinical"]);
const AT_LEAST_ESTABLISHED: ReadonlySet<CapabilityState> = new Set(["strong", "established"]);
const BELOW_ESTABLISHED: ReadonlySet<CapabilityState> = new Set(["partial", "weak", "dependency", "missing"]);
/** Respuestas que muestran un proceso ya definido. */
const PROCESS_SIGNALS = ["q2_followup_general_process", "q2_operations_information_base", "q2_professional_intake_flow", "q2_b2b_qualification", "q2_appointments_confirmation_reminders"] as const;
/** Respuestas que, débiles, muestran que el proceso todavía depende de la memoria o el papel. */
const PROCESS_GAPS = ["q2_followup_general_process", "q2_operations_information_base"] as const;
const SOUND = 75;

export function solutionContextOf(scoring: ContextualScoringResult, priorities: ConstraintPriorityResult, narrative: DiagnosticNarrative): SolutionContext {
  const states = new Map<string, CapabilityState>();
  for (const dimension of scoring.dimensions) for (const evidence of dimension.evidence) if (evidence.directness !== "contextual" && !states.has(evidence.questionId)) states.set(evidence.questionId, evidence.state);
  const stateOf = (questionId: string) => states.get(questionId);
  // Tener algunas tareas automatizadas no prueba que el proceso esté definido: hace falta una respuesta de proceso establecida.
  const defined = PROCESS_SIGNALS.some((id) => AT_LEAST_ESTABLISHED.has(stateOf(id)!));
  const gap = PROCESS_GAPS.some((id) => stateOf(id) === "missing" || stateOf(id) === "weak");
  return {
    lifecycle: narrative.lifecycle, profile: narrative.profile, goal: priorities.context.goal, friction: priorities.context.friction, stage: priorities.context.stage,
    score: (dimension) => scoring.dimensions.find((item) => item.id === dimension)?.score ?? null,
    stateOf, processMaturity: defined && !gap ? "defined" : "undefined",
  };
}

export function matchSolution(recommendation: DiagnosticRecommendation, context: SolutionContext): SolutionMatch {
  const exclusions: { solutionId: SolutionId; rule: ExclusionRule }[] = [];
  const pick = (id: SolutionId) => SOLUTION_CATALOG[id];
  const result = (solution: SolutionId | null, alternatives: readonly SolutionId[] = []): SolutionMatch => ({ recommendationId: recommendation.id, solution: solution ? pick(solution) : null, alternatives: alternatives.map(pick), exclusions });
  const exclude = (solutionId: SolutionId, rule: ExclusionRule) => { exclusions.push({ solutionId, rule }); };
  const live = context.lifecycle === "live";

  // Con poca evidencia (o sin ella) primero se confirma: no se propone una intervención.
  // Antes del lanzamiento la falta de evidencia es legítima (modo `prepare`), no un motivo para esperar.
  if (recommendation.mode === "verify") {
    for (const id of SOLUTION_IDS.filter((solutionId) => SOLUTION_CATALOG[solutionId].types.includes(recommendation.type))) exclude(id, "verify_before_intervention");
    return result(null);
  }

  switch (recommendation.type) {
    case "clarity": return result("offer_message");
    case "foundation": {
      if (!live) return result("launch_channel_plan");
      // Un sitio nuevo solo cuando la propia respuesta sobre la base digital muestra el hueco, no por un score < 100.
      const base = context.stateOf("q2_presence_digital_base");
      if (base && BELOW_ESTABLISHED.has(base)) return result("website");
      exclude("website", "website_requires_base_gap");
      return result(null);
    }
    case "discovery": {
      if (!live) return result("launch_channel_plan");
      const primary: SolutionId = LOCAL_PROFILES.has(context.profile) ? "local_listing" : context.profile === "creator" ? "social_content" : "organic_discovery";
      const acquisitionActive = context.goal === "be_found" || context.friction === "visibility";
      const baseReady = recommendation.prerequisites.every((item) => item.satisfied) && (context.score("conversion_access") ?? 0) >= SOUND && recommendation.mode === "improve";
      if (acquisitionActive && baseReady) return result(primary, ["advertising"]);
      exclude("advertising", "advertising_requires_active_acquisition");
      return result(primary);
    }
    case "trust": {
      if (!live) { exclude("reputation_reviews", "reputation_requires_customers"); return result(null); }
      const reviews = context.stateOf("q2_reputation_flow");
      return result(reviews && BELOW_ESTABLISHED.has(reviews) ? "reputation_reviews" : "credibility_proof");
    }
    case "conversion": {
      if (!live) return result("launch_channel_plan");
      return result(BOOKING_PROFILES.has(context.profile) ? "online_booking" : context.profile === "ecommerce" ? "checkout_experience" : "contact_path");
    }
    case "follow_up": {
      const contactFlow = live && (context.score("relationship_recurrence") !== null || context.score("conversion_access") !== null);
      if (!contactFlow) { exclude("crm_follow_up", "crm_requires_contact_flow"); exclude("follow_up_automation", "crm_requires_contact_flow"); return result(null); }
      if (context.processMaturity === "defined") return result("follow_up_automation");
      exclude("follow_up_automation", "automation_requires_defined_process");
      return result("crm_follow_up");
    }
    case "measurement": {
      if (!live) { exclude("measurement_tracking", "analytics_requires_activity"); return result("measurement_plan"); }
      return result("measurement_tracking");
    }
    case "readiness": {
      if (context.processMaturity === "defined" && live) return result("operational_automation", context.stateOf("q2_operations_information_base") === "partial" ? ["integrations"] : []);
      exclude("operational_automation", "automation_requires_defined_process");
      return result("work_organization");
    }
  }
}
