import { selectedValues } from "./answers";
import { addonCatalog, learnCatalog, licenseCatalog, serviceCatalog, type AddonId, type LearnId, type ServiceId } from "./catalog";
import type { IssueId } from "./contracts";
import { hasTeam, isEstablished, isOperating } from "./profiles";
import { singleAnswer, type SingleQuestionId } from "./questions";
import { inquiriesArrive, processSolid, type Scores } from "./result";
import type { AddonFit, Context, DiagnosticState, Issue, LearnFit, LicenseFit, Recommendation, ServiceFit } from "./types";

/**
 * Mapeo honesto al catálogo Vecidya. Una licencia solo se recomienda cuando la necesidad diagnosticada exige una capacidad recurrente del sistema; un servicio puntual nunca implica licencia y viceversa.
 *
 * Licencia por capacidad necesaria, alineada con lo que cada nivel incluye en `/licencias`:
 *   Cuadra  = ordenar (perfil público, información, contactos, notas, tareas, oportunidades, pipeline).
 *   Barrio  = captar y seguir (formularios, landing, agenda, automatizaciones estándar, seguimiento, posventa).
 *   Ciudad  = automatizar y escalar (automatización avanzada, segmentación, procesos, control operativo).
 * Nunca por tamaño de equipo ni por un umbral de puntuación global. Puede responder «ninguna todavía».
 * Las respuestas «no lo sé» no cuentan como brecha para decidir la licencia.
 */

export type LicenseRecommendationTrace = { fit: LicenseFit; foundationalOverrideApplied: boolean };

/**
 * Única evaluación real del encaje de licencia (DIAG-V3-05 §22). `recommendLicense` es un
 * envoltorio (`.fit`). `foundationalOverrideApplied` es verdadero exactamente cuando la prioridad
 * fundacional sin dudas reemplazó a Barrio/Ciudad por Cuadra (única rama que cambia el nivel ya
 * decidido); no es una reconstrucción aproximada, es el mismo booleano que decide esa rama.
 */
export function explainLicenseRecommendation(context: Context, scores: Scores, priorities: Issue[]): LicenseRecommendationTrace {
  const { answers, stage, goal } = context;
  const one = <Q extends SingleQuestionId>(questionId: Q) => singleAnswer(answers, questionId);
  const inquiries = inquiriesArrive(answers);
  const capture = one("capture");
  const followUp = one("follow_up");
  const response = one("response");
  const pipeline = one("pipeline");
  // Solo respuestas sustantivas: «no lo sé» nunca decide una licencia.
  const followGap = followUp === "manual" || followUp === "none" || response === "days" || response === "varies";
  const captureGap = capture === "sometimes" || capture === "no" || pipeline === "partial" || pipeline === "no";
  const solid = processSolid(answers);
  const teamSignal = (context.team === "medium" || context.team === "large" || context.team === "xl") && one("responsibilities") !== "yes";
  const automationSignal = one("repetitive") === "a_lot" || goal === "automate" || teamSignal;
  const foundationalFirst = priorities[0]?.kind === "foundational" && !priorities[0]?.tentative;
  const presenceNeed = inquiries && (scores.presencia ?? 100) < 35;

  const none = (reason: string, notYet?: string): LicenseFit => ({ level: "none", name: "Ninguna necesaria por ahora", reason, notYet });

  if (!isOperating(stage)) {
    return { fit: none("Antes de una licencia conviene definir la propuesta y comprobarla con personas reales. Vuelve a hacer el diagnóstico cuando empieces a atender."), foundationalOverrideApplied: false };
  }

  if (!inquiries) {
    return {
      fit: none(
        "Todavía no llegan consultas: la prioridad es que las personas correctas te encuentren, y una licencia ordena lo que aún no existe.",
        "Cuadra puede encajar cuando haya contactos e información que ordenar.",
      ),
      foundationalOverrideApplied: false,
    };
  }

  // Necesidad recurrente real, de mayor a menor capacidad.
  let fit: LicenseFit;
  if (isEstablished(stage) && solid && automationSignal) {
    fit = {
      level: "ciudad",
      name: licenseCatalog.ciudad.name,
      reason: "Ya registras cada consulta y el seguimiento está definido; lo que falta es quitar trabajo repetitivo y controlar la operación.",
    };
  } else if (followGap && (isEstablished(stage) || goal === "stop_losing" || goal === "opportunities" || goal === "organize")) {
    fit = {
      level: "barrio",
      name: licenseCatalog.barrio.name,
      reason: "Recibes consultas, pero el seguimiento no es consistente: Barrio añade formularios, agenda, automatizaciones estándar y seguimiento sobre la base de Cuadra.",
      notYet:
        goal === "automate" || one("repetitive") === "a_lot"
          ? "Ciudad todavía no: automatizar sobre un seguimiento inconsistente multiplica el desorden."
          : undefined,
    };
  } else if (captureGap) {
    fit = {
      level: "cuadra",
      name: licenseCatalog.cuadra.name,
      reason: "No todas las consultas quedan registradas en un mismo lugar: Cuadra cubre contactos, oportunidades y pipeline para centralizarlas.",
      notYet: "Barrio puede venir después, si el seguimiento necesita formularios, agenda o automatizaciones estándar.",
    };
  } else if (presenceNeed) {
    fit = {
      level: "cuadra",
      name: licenseCatalog.cuadra.name,
      reason: "Llegan consultas, pero casi no tienes base pública propia: Cuadra aporta perfil público e información ordenada para crecer más allá del boca a boca.",
      notYet: solid ? "Barrio todavía no: el seguimiento ya está resuelto." : "Barrio puede venir después, cuando el seguimiento necesite estructura.",
    };
  } else {
    // Captura y seguimiento funcionan y no hay una capacidad recurrente que una licencia resuelva:
    // el encaje de licencia no es una oportunidad de venta.
    fit = none(
      "Registro y seguimiento ya funcionan y no hay una necesidad recurrente que una licencia resuelva. Si hay una prioridad, un servicio puntual o una lectura la cubren mejor.",
      followGap ? "Barrio puede encajar cuando el seguimiento necesite estructura de forma regular." : undefined,
    );
  }

  if (foundationalFirst && (fit.level === "barrio" || fit.level === "ciudad")) {
    return {
      fit: {
        level: "cuadra",
        name: licenseCatalog.cuadra.name,
        reason: `Tu primera prioridad es fundacional («${priorities[0].title.toLowerCase()}»). Cuadra aporta la base ordenada (perfil público, información y contactos) sobre la que tiene sentido lo demás.`,
        notYet: `${fit.name} todavía no: captar, seguir o automatizar rinde poco mientras la propuesta o la base pública no estén claras.`,
      },
      foundationalOverrideApplied: true,
    };
  }
  if (foundationalFirst && fit.level === "cuadra" && !fit.notYet) {
    fit.notYet = "Barrio todavía no: primero la prioridad fundacional.";
  }

  return { fit, foundationalOverrideApplied: false };
}

export function recommendLicense(context: Context, scores: Scores, priorities: Issue[]): LicenseFit {
  return explainLicenseRecommendation(context, scores, priorities).fit;
}

/** Procedencia de una recomendación: de qué hallazgo salió, o `null` si es un fallback sin hallazgo que la respalde (DIAG-V3-05 §22/§23). */
export type RecommendationTrace<T> = { fit: T; sourceIssueId: IssueId | null };

/**
 * Única evaluación real de servicios recomendados (DIAG-V3-05 §20/§22). `recommendServices` es un
 * envoltorio (`.map(t => t.fit)`): mismo criterio, sin una segunda pasada. El fallback de "inicio"
 * queda marcado con `sourceIssueId: null`: no hay un hallazgo real que lo respalde (deuda documentada,
 * no una provenance inventada).
 */
export function explainServiceRecommendations(priorities: Issue[], state: DiagnosticState): RecommendationTrace<ServiceFit>[] {
  const traces: RecommendationTrace<ServiceFit>[] = [];
  for (const issue of priorities) {
    const id = issue.service as ServiceId | undefined;
    if (!id || !(id in serviceCatalog) || traces.some((trace) => trace.fit.id === id)) continue;
    traces.push({ fit: { id, title: serviceCatalog[id].title, reason: `Por la prioridad «${issue.title}».` }, sourceIssueId: issue.id });
    if (traces.length === 2) break;
  }
  // Sin prioridades no se inventa un servicio: solo en el punto de partida hay una necesidad genérica (ordenar antes de construir).
  if (!traces.length && state.id === "inicio") {
    traces.push({ fit: { id: "estructuracion", title: serviceCatalog.estructuracion.title, reason: "Para ordenar prioridades antes de construir." }, sourceIssueId: null });
  }
  return traces;
}

export function recommendServices(priorities: Issue[], state: DiagnosticState): ServiceFit[] {
  return explainServiceRecommendations(priorities, state).map((trace) => trace.fit);
}

export function recommendAddons(context: Context, license: LicenseFit): AddonFit[] {
  const { answers } = context;
  const addons: AddonFit[] = [];
  const assets = selectedValues(answers.assets);
  const measurement = selectedValues(answers.measurement);
  const add = (id: AddonId, reason: string) => addons.push({ id, name: addonCatalog[id].name, reason });

  if (license.level === "none" || license.level === "cuadra") return addons;

  if (assets.includes("whatsapp_business") && hasTeam(context.team) && answers.capture !== "always") {
    add("whatsapp", "Varias personas atienden WhatsApp y las conversaciones no quedan en un mismo lugar.");
  }
  if (license.level === "ciudad" && answers.repetitive === "a_lot") {
    add("automatizaciones", "El trabajo repetitivo semanal ya justifica reglas y recordatorios automáticos.");
  }
  if (license.level === "ciudad" && (answers.response === "varies" || answers.response === "days") && measurement.includes("volume")) {
    add("ai-conversacional", "El volumen supera la capacidad de primera respuesta y ya mides cuántas consultas llegan.");
  }
  return addons.slice(0, 2);
}

/**
 * Única evaluación real de lecturas recomendadas. `recommendLearn` es un envoltorio. El fallback
 * por momento (`state.id`) queda marcado con `sourceIssueId: null`, igual que en servicios.
 */
export function explainLearnRecommendations(priorities: Issue[], state: DiagnosticState): RecommendationTrace<LearnFit>[] {
  const traces: RecommendationTrace<LearnFit>[] = [];
  for (const issue of priorities) {
    const id = issue.learn as LearnId | undefined;
    if (!id || !(id in learnCatalog) || traces.some((trace) => trace.fit.slug === learnCatalog[id].slug)) continue;
    traces.push({ fit: { slug: learnCatalog[id].slug, title: learnCatalog[id].title, reason: `Relacionado con «${issue.title}».` }, sourceIssueId: issue.id });
    if (traces.length === 2) break;
  }
  if (!traces.length) {
    const id: LearnId = state.id === "inicio" || state.id === "base" ? "presence" : "crm";
    traces.push({ fit: { slug: learnCatalog[id].slug, title: learnCatalog[id].title, reason: "Lectura recomendada para tu momento." }, sourceIssueId: null });
  }
  return traces;
}

export function recommendLearn(priorities: Issue[], state: DiagnosticState): LearnFit[] {
  return explainLearnRecommendations(priorities, state).map((trace) => trace.fit);
}

/**
 * Procedencia completa de la recomendación (DIAG-V3-05 §22). `license` y `addons` se derivan de
 * señales de contexto (`Context`/`Scores`), no de un hallazgo puntual: documentado como tal, no
 * inventado (§12: algunas recomendaciones dependen legítimamente de objetivo/perfil/etapa/equipo,
 * no de evidencia puntuable). `services` y `learn` sí citan el hallazgo que las produjo cuando
 * existe uno; el fallback sin hallazgo queda explícito (`sourceIssueId: null`), no oculto.
 */
export type RecommendationProvenance = {
  license: { basis: "context_signals"; foundationalOverride: boolean };
  services: RecommendationTrace<ServiceFit>[];
  addons: { basis: "context_signals" }[];
  learn: RecommendationTrace<LearnFit>[];
};

export function explainRecommendations(context: Context, scores: Scores, priorities: Issue[], state: DiagnosticState): { recommendation: Recommendation; provenance: RecommendationProvenance } {
  const licenseTrace = explainLicenseRecommendation(context, scores, priorities);
  const serviceTraces = explainServiceRecommendations(priorities, state);
  const addons = recommendAddons(context, licenseTrace.fit);
  const learnTraces = explainLearnRecommendations(priorities, state);
  return {
    recommendation: { license: licenseTrace.fit, services: serviceTraces.map((trace) => trace.fit), addons, learn: learnTraces.map((trace) => trace.fit) },
    provenance: {
      license: { basis: "context_signals", foundationalOverride: licenseTrace.foundationalOverrideApplied },
      services: serviceTraces,
      addons: addons.map(() => ({ basis: "context_signals" as const })),
      learn: learnTraces,
    },
  };
}

export function recommend(context: Context, scores: Scores, priorities: Issue[], state: DiagnosticState): Recommendation {
  return explainRecommendations(context, scores, priorities, state).recommendation;
}

/**
 * Detección de recomendaciones sin causa rastreable (DIAG-V3-05 §23): una recomendación de
 * servicio o lectura con `sourceIssueId: null` que NO sea uno de los dos fallbacks declarados
 * (servicio de "estructuración", únicamente en estado "inicio"; lectura de momento, únicamente sin
 * prioridades) sería una recomendación inventada sin provenance real. Hoy no existe ninguna.
 *
 * Recibe `state`/`priorities` y los revisa de forma independiente (no se limita a inspeccionar el
 * ID resultante): si la condición real que habilita cada fallback dejara de cumplirse — por
 * ejemplo, si el guardia `state.id === "inicio"` desapareciera de `explainServiceRecommendations`
 * — esta función lo detecta igual, porque vuelve a comprobar esa misma condición contra el estado
 * real recibido, no contra lo que la traza afirma de sí misma.
 */
export function findRecommendationsWithoutProvenance(provenance: RecommendationProvenance, state: DiagnosticState, priorities: Issue[]): { kind: "service" | "learn"; id: string }[] {
  const orphaned: { kind: "service" | "learn"; id: string }[] = [];
  const hasServiceMatch = priorities.some((issue) => issue.service !== undefined && issue.service in serviceCatalog);
  const hasLearnMatch = priorities.some((issue) => issue.learn !== undefined && issue.learn in learnCatalog);
  for (const trace of provenance.services) {
    if (trace.sourceIssueId !== null) continue;
    const isKnownFallback = !hasServiceMatch && state.id === "inicio" && trace.fit.id === "estructuracion";
    if (!isKnownFallback) orphaned.push({ kind: "service", id: trace.fit.id });
  }
  for (const trace of provenance.learn) {
    if (trace.sourceIssueId !== null) continue;
    const isKnownFallback = !hasLearnMatch && (trace.fit.slug === learnCatalog.presence.slug || trace.fit.slug === learnCatalog.crm.slug);
    if (!isKnownFallback) orphaned.push({ kind: "learn", id: trace.fit.slug });
  }
  return orphaned;
}
