import type { ContextualScoringResult } from "./qbv2-contextual-scoring";
import type { DigitalDimensionId } from "./qbv2-coverage";
import type { DiagnosticNarrative } from "./qbv2-narrative";
import { buildDigitalPresenceStatus, type DigitalPresenceStatus } from "./qbv2-overall";
import type { ConstraintPriorityResult } from "./qbv2-priorities";
import { buildDiagnosticRecommendations, type DiagnosticRecommendation, type DiagnosticRecommendations } from "./qbv2-recommendations";
import type { SemanticDiagnosticFacts } from "./qbv2-semantic-facts";
import { matchSolution, solutionContextOf, type SolutionContext, type SolutionId, type SolutionMatch } from "./qbv2-solutions";

/**
 * DIAG-V3-10 — catálogo comercial y emparejamiento. Lo que Vecidya ofrece se mantiene aparte de la verdad
 * diagnóstica: una oferta solo aparece al final de la cadena evidencia → restricción → prioridad → recomendación
 * → solución → oferta, y nunca influye en las prioridades. Los nombres son los del catálogo canónico
 * (`docs/business/VECIDYA_PRODUCT_CATALOG.md`, y `/servicios` para «Organización del negocio»); no hay precios,
 * niveles ni alianzas inventadas. La prueba `qbv2-outcome.test.ts` verifica cada nombre contra esas fuentes.
 */

export const OFFERING_KINDS = ["service", "addon", "license", "integration", "managed_service"] as const;
export type OfferingKind = (typeof OFFERING_KINDS)[number];

export type CommercialOffering = {
  readonly id: string;
  readonly kind: OfferingKind;
  /** Nombre canónico, idéntico al del catálogo. */
  readonly name: string;
  readonly provider: "Vecidya";
  readonly summary: string;
  readonly source: "product_catalog" | "public_services";
  /** Página pública donde se presenta, cuando existe. */
  readonly publicPath: string | null;
  readonly contracting: string;
  /** Un addon se suma a una licencia (catálogo); el nivel mínimo sigue «por definir». */
  readonly requiresLicense: boolean;
  /** Coste variable de un proveedor externo, siempre en línea aparte. */
  readonly externalCost: string | null;
};

const BY_PROPOSAL = "Se contrata por propuesta, con alcance definido.";
const BY_CONTACT = "Activación por contacto directo.";
const service = (id: string, name: string, summary: string, publicPath: string | null, externalCost: string | null = null, source: CommercialOffering["source"] = "product_catalog"): CommercialOffering =>
  ({ id, kind: "service", name, provider: "Vecidya", summary, source, publicPath, contracting: BY_PROPOSAL, requiresLicense: false, externalCost });
const license = (id: string, name: string, summary: string): CommercialOffering =>
  ({ id, kind: "license", name, provider: "Vecidya", summary, source: "product_catalog", publicPath: "/licencias", contracting: BY_CONTACT, requiresLicense: false, externalCost: null });
const addon = (id: string, name: string, summary: string, externalCost: string | null): CommercialOffering =>
  ({ id, kind: "addon", name, provider: "Vecidya", summary, source: "product_catalog", publicPath: "/addons", contracting: BY_CONTACT, requiresLicense: true, externalCost });

/** Subconjunto del catálogo canónico que el diagnóstico puede proponer. Todo lo demás no se nombra. */
export const COMMERCIAL_CATALOG = {
  cuadra: license("cuadra", "Cuadra", "Licencia para ordenar: perfil público, información organizada, contactos, notas, tareas y oportunidades."),
  barrio: license("barrio", "Barrio", "Licencia para captar y dar seguimiento: todo Cuadra más formularios y landing, agenda, automatizaciones estándar y seguimiento."),
  ciudad: license("ciudad", "Ciudad", "Licencia para automatizar y escalar: todo Barrio más automatización avanzada, segmentación y procesos avanzados."),
  sms: addon("sms", "SMS", "Avisos y seguimientos breves por mensajes de texto.", "Los mensajes del proveedor se pagan aparte, según su uso."),
  "paginas-web": service("paginas-web", "Páginas web", "Sitio web publicado con alcance definido.", "/servicios#presencia-digital"),
  "landing-pages": service("landing-pages", "Landing pages", "Página enfocada en una oferta o en recibir contactos.", "/servicios#presencia-digital"),
  ecommerce: service("ecommerce", "Ecommerce", "Experiencia de comercio electrónico con alcance definido.", null),
  contenido: service("contenido", "Contenido", "Material editorial con brief y alcance definidos.", "/servicios#visibilidad"),
  seo: service("seo", "SEO", "Trabajo de posicionamiento orgánico con alcance definido.", "/servicios#visibilidad"),
  "google-ads": service("google-ads", "Google Ads", "Configuración y gestión de campañas de Google.", "/servicios#visibilidad", "La inversión publicitaria se paga aparte."),
  "meta-ads": service("meta-ads", "Meta Ads", "Configuración y gestión de campañas de Meta.", "/servicios#visibilidad", "La inversión publicitaria se paga aparte."),
  crm: service("crm", "CRM", "Configuración y ordenamiento del CRM externo con el que trabaja Vecidya.", "/servicios#automatizacion"),
  workflows: service("workflows", "Workflows", "Diseño y configuración de flujos automatizados.", "/servicios#automatizacion"),
  integraciones: service("integraciones", "Integraciones", "Conexión y validación de sistemas terceros.", "/servicios#automatizacion"),
  estrategia: service("estrategia", "Estrategia", "Definición de prioridades, canales y próximos pasos.", "/servicios#estructuracion"),
  "organizacion-del-negocio": service("organizacion-del-negocio", "Organización del negocio", "Una base ordenada para tomar decisiones y saber qué construir primero.", "/servicios#estructuracion", null, "public_services"),
} as const satisfies Record<string, CommercialOffering>;
export type CommercialOfferingId = keyof typeof COMMERCIAL_CATALOG;

/**
 * `recommended_service`: el trabajo que ejecuta la solución. `optional_license` / `optional_addon`: capacidad
 * continua que puede sostenerla, nunca obligatoria. `required_license`: dependencia de un addon (se suma a una
 * licencia). Las licencias del catálogo no exigen un servicio ni al revés.
 */
export type CommercialRole = "recommended_service" | "optional_license" | "optional_addon" | "required_license";

type OfferingRule = { readonly offering: CommercialOfferingId; readonly role: Exclude<CommercialRole, "required_license">; readonly condition?: string; readonly when?: (context: SolutionContext) => boolean };

const GROWTH = (context: SolutionContext) => context.stage === "growing" || context.stage === "scaling";

/** Qué parte del catálogo puede ejecutar cada solución. Sin entrada = Vecidya no tiene hoy una oferta específica. */
export const SOLUTION_OFFERINGS: Readonly<Partial<Record<SolutionId, readonly OfferingRule[]>>> = {
  offer_message: [{ offering: "contenido", role: "recommended_service" }],
  launch_channel_plan: [{ offering: "estrategia", role: "recommended_service" }],
  website: [{ offering: "paginas-web", role: "recommended_service" }],
  local_listing: [{ offering: "seo", role: "recommended_service" }],
  organic_discovery: [{ offering: "seo", role: "recommended_service" }],
  social_content: [{ offering: "contenido", role: "recommended_service" }],
  advertising: [{ offering: "google-ads", role: "recommended_service" }, { offering: "meta-ads", role: "recommended_service" }],
  contact_path: [
    { offering: "landing-pages", role: "recommended_service" },
    { offering: "barrio", role: "optional_license", condition: "Si quieres que los formularios y la landing queden conectados al seguimiento." },
  ],
  online_booking: [
    { offering: "barrio", role: "optional_license", condition: "Incluye agenda; útil si hoy las citas se coordinan por mensajes." },
    // Solo cuando la respuesta sobre recordatorios muestra que hoy no son automáticos.
    { offering: "sms", role: "optional_addon", condition: "Para enviar recordatorios de cita por mensaje de texto.", when: (context) => context.stateOf("q2_appointments_confirmation_reminders") === "established" || context.stateOf("q2_appointments_confirmation_reminders") === "missing" },
  ],
  checkout_experience: [{ offering: "ecommerce", role: "recommended_service" }],
  crm_follow_up: [
    { offering: "crm", role: "recommended_service" },
    { offering: "barrio", role: "optional_license", condition: "Si todavía no tienes un sistema donde registrar contactos y su seguimiento." },
  ],
  follow_up_automation: [
    { offering: "workflows", role: "recommended_service" },
    { offering: "barrio", role: "optional_license", condition: "Incluye automatizaciones estándar de seguimiento." },
  ],
  work_organization: [
    { offering: "organizacion-del-negocio", role: "recommended_service" },
    { offering: "cuadra", role: "optional_license", condition: "Si quieres un lugar común para información, contactos y tareas." },
  ],
  operational_automation: [
    { offering: "workflows", role: "recommended_service" },
    { offering: "ciudad", role: "optional_license", condition: "Para procesos avanzados con volumen creciente.", when: GROWTH },
    { offering: "barrio", role: "optional_license", condition: "Incluye automatizaciones estándar.", when: (context) => !GROWTH(context) },
  ],
  integrations: [{ offering: "integraciones", role: "recommended_service" }],
};

/** «¿Por qué te recomendamos esto?»: la cadena completa, del dato al producto. */
export type CommercialProofChain = {
  readonly evidenceTopics: readonly string[];
  readonly finding: string;
  readonly constraint: { readonly id: string; readonly dimension: DigitalDimensionId; readonly severity: DiagnosticRecommendation["sourceConstraint"]["severity"] };
  readonly priority: { readonly rank: 1 | 2 | 3; readonly slot: DiagnosticRecommendation["slot"]; readonly statement: string };
  readonly recommendation: { readonly id: string; readonly title: string };
  readonly solution: { readonly id: SolutionId; readonly label: string };
  readonly sourceFactIds: readonly string[];
  readonly sourceQuestionIds: readonly string[];
};

export type CommercialMatch = {
  readonly offering: CommercialOffering;
  readonly role: CommercialRole;
  readonly condition: string | null;
  readonly recommendationId: string;
  /** La misma oferta ya apareció para una recomendación anterior: se muestra de forma compacta. */
  readonly sharedWith: string | null;
  /** `after_prerequisite`: conviene después de una recomendación anterior de la que depende. */
  readonly timing: "now" | "after_prerequisite";
  readonly after: readonly string[];
  readonly proof: CommercialProofChain;
};

export type NoOfferingReason = "verify_first" | "no_solution" | "not_in_catalog" | "prelaunch_no_license";

export type HelpItem = {
  readonly recommendationId: string;
  readonly solution: SolutionMatch;
  readonly offerings: readonly CommercialMatch[];
  readonly noOffering: NoOfferingReason | null;
};

export type HowVecidyaCanHelp = {
  readonly items: readonly HelpItem[];
  /** Ofertas descartadas por regla (auditoría; nunca se muestran). */
  readonly suppressed: readonly { readonly offeringId: CommercialOfferingId; readonly recommendationId: string; readonly rule: "single_license" | "prelaunch_no_license" }[];
};

export function matchCommercialOfferings(recommendations: DiagnosticRecommendations, matches: readonly SolutionMatch[], context: SolutionContext, narrative: DiagnosticNarrative): HowVecidyaCanHelp {
  const suppressed: HowVecidyaCanHelp["suppressed"][number][] = [];
  const firstShown = new Map<CommercialOfferingId, string>();
  let license: CommercialOfferingId | null = null;
  const items = recommendations.items.map((recommendation): HelpItem => {
    const solution = matches.find((item) => item.recommendationId === recommendation.id)!;
    if (recommendation.mode === "verify" || !solution.solution) return { recommendationId: recommendation.id, solution, offerings: [], noOffering: recommendation.mode === "verify" ? "verify_first" : "no_solution" };
    const rules = (SOLUTION_OFFERINGS[solution.solution.id] ?? []).filter((rule) => !rule.when || rule.when(context));
    if (rules.length === 0) return { recommendationId: recommendation.id, solution, offerings: [], noOffering: "not_in_catalog" };
    const after = recommendation.prerequisites.filter((item) => !item.satisfied && item.recommendationId).map((item) => item.recommendationId!);
    const priority = narrative.priorities.find((item) => item.rank === recommendation.rank)!;
    const proof: CommercialProofChain = {
      evidenceTopics: recommendation.evidenceTopics, finding: recommendation.evidence.text,
      constraint: { id: recommendation.sourceConstraint.id, dimension: recommendation.dimension, severity: recommendation.sourceConstraint.severity },
      priority: { rank: recommendation.rank, slot: recommendation.slot, statement: priority.statement.text },
      recommendation: { id: recommendation.id, title: recommendation.title },
      solution: { id: solution.solution.id, label: solution.solution.label },
      sourceFactIds: recommendation.sourceFactIds, sourceQuestionIds: recommendation.sourceQuestionIds,
    };
    const offerings: CommercialMatch[] = [];
    for (const rule of rules) {
      const offering = COMMERCIAL_CATALOG[rule.offering];
      // Antes del lanzamiento no se propone una licencia ni un addon: primero se define y se valida la propuesta.
      if (context.lifecycle === "prelaunch" && offering.kind !== "service") { suppressed.push({ offeringId: rule.offering, recommendationId: recommendation.id, rule: "prelaunch_no_license" }); continue; }
      // Una sola licencia por resultado: la de la recomendación de mayor prioridad. Nunca se sube de nivel para vender más.
      if (offering.kind === "license" && license !== null && license !== rule.offering) { suppressed.push({ offeringId: rule.offering, recommendationId: recommendation.id, rule: "single_license" }); continue; }
      if (offering.kind === "license") license = rule.offering;
      offerings.push({ offering, role: rule.role, condition: rule.condition ?? null, recommendationId: recommendation.id, sharedWith: firstShown.get(rule.offering) ?? null, timing: after.length > 0 ? "after_prerequisite" : "now", after, proof });
      if (!firstShown.has(rule.offering)) firstShown.set(rule.offering, recommendation.id);
    }
    return { recommendationId: recommendation.id, solution, offerings, noOffering: offerings.length > 0 ? null : context.lifecycle === "prelaunch" ? "prelaunch_no_license" : "not_in_catalog" };
  });
  return { items, suppressed };
}

/** Dependencias de una oferta mostrada: un addon se suma a una licencia (nivel mínimo por definir en el catálogo). */
export function offeringDependencies(match: CommercialMatch): readonly { readonly role: "required_license"; readonly text: string }[] {
  return match.offering.requiresLicense ? [{ role: "required_license", text: "Se suma a una licencia Vecidya; el nivel mínimo todavía no está definido en el catálogo." }] : [];
}

// ── Composición del resultado de salida ─────────────────────────────────────

export type DiagnosticOutcome = {
  readonly overall: DigitalPresenceStatus;
  readonly recommendations: DiagnosticRecommendations;
  readonly help: HowVecidyaCanHelp;
};

export type DiagnosticOutcomeInput = {
  readonly scoring: ContextualScoringResult;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
  readonly narrative: DiagnosticNarrative;
};

/** Capa de decisión sobre el resultado congelado: estado general, recomendaciones, soluciones y ofertas. Pura y determinista. */
export function buildDiagnosticOutcome(input: DiagnosticOutcomeInput): DiagnosticOutcome {
  const overall = buildDigitalPresenceStatus(input);
  const recommendations = buildDiagnosticRecommendations(input);
  const context = solutionContextOf(input.scoring, input.priorities, input.narrative);
  const matches = recommendations.items.map((item) => matchSolution(item, context));
  return { overall, recommendations, help: matchCommercialOfferings(recommendations, matches, context, input.narrative) };
}
