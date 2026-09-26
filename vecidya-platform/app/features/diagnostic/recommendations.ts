import { selectedValues } from "./answers";
import { addonCatalog, learnCatalog, licenseCatalog, serviceCatalog, type AddonId, type LearnId, type ServiceId } from "./catalog";
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

export function recommendLicense(context: Context, scores: Scores, priorities: Issue[]): LicenseFit {
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
    return none("Antes de una licencia conviene definir la propuesta y comprobarla con personas reales. Vuelve a hacer el diagnóstico cuando empieces a atender.");
  }

  if (!inquiries) {
    return none(
      "Todavía no llegan consultas: la prioridad es que las personas correctas te encuentren, y una licencia ordena lo que aún no existe.",
      "Cuadra puede encajar cuando haya contactos e información que ordenar.",
    );
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
      level: "cuadra",
      name: licenseCatalog.cuadra.name,
      reason: `Tu primera prioridad es fundacional («${priorities[0].title.toLowerCase()}»). Cuadra aporta la base ordenada (perfil público, información y contactos) sobre la que tiene sentido lo demás.`,
      notYet: `${fit.name} todavía no: captar, seguir o automatizar rinde poco mientras la propuesta o la base pública no estén claras.`,
    };
  }
  if (foundationalFirst && fit.level === "cuadra" && !fit.notYet) {
    fit.notYet = "Barrio todavía no: primero la prioridad fundacional.";
  }

  return fit;
}

export function recommendServices(priorities: Issue[], state: DiagnosticState): ServiceFit[] {
  const services: ServiceFit[] = [];
  for (const issue of priorities) {
    const id = issue.service as ServiceId | undefined;
    if (!id || !(id in serviceCatalog) || services.some((service) => service.id === id)) continue;
    services.push({ id, title: serviceCatalog[id].title, reason: `Por la prioridad «${issue.title}».` });
    if (services.length === 2) break;
  }
  // Sin prioridades no se inventa un servicio: solo en el punto de partida hay una necesidad genérica (ordenar antes de construir).
  if (!services.length && state.id === "inicio") {
    services.push({ id: "estructuracion", title: serviceCatalog.estructuracion.title, reason: "Para ordenar prioridades antes de construir." });
  }
  return services;
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

export function recommendLearn(priorities: Issue[], state: DiagnosticState): LearnFit[] {
  const learn: LearnFit[] = [];
  for (const issue of priorities) {
    const id = issue.learn as LearnId | undefined;
    if (!id || !(id in learnCatalog) || learn.some((item) => item.slug === learnCatalog[id].slug)) continue;
    learn.push({ slug: learnCatalog[id].slug, title: learnCatalog[id].title, reason: `Relacionado con «${issue.title}».` });
    if (learn.length === 2) break;
  }
  if (!learn.length) {
    const id: LearnId = state.id === "inicio" || state.id === "base" ? "presence" : "crm";
    learn.push({ slug: learnCatalog[id].slug, title: learnCatalog[id].title, reason: "Lectura recomendada para tu momento." });
  }
  return learn;
}

export function recommend(context: Context, scores: Scores, priorities: Issue[], state: DiagnosticState): Recommendation {
  const license = recommendLicense(context, scores, priorities);
  return {
    license,
    services: recommendServices(priorities, state),
    addons: recommendAddons(context, license),
    learn: recommendLearn(priorities, state),
  };
}
