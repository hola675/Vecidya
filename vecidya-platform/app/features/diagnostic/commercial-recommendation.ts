import { adaptCommercialEvidence, type CommercialEvidenceInput, type CommercialOperationalEvidence, type EvidenceRef } from "./commercial-evidence";
import type { AnswersV2 } from "./qbv2-rules";

export const COMMERCIAL_RECOMMENDATION_VERSION = 1 as const;
export const COMMERCIAL_V1_LICENSES = {
  cuadra: { name: "Cuadra", monthlyUsd: 39, activationUsd: 0 },
  barrio: { name: "Barrio", monthlyUsd: 59, activationUsd: 10 },
  ciudad: { name: "Ciudad", monthlyUsd: 89, activationUsd: 15 },
} as const;
export const COMMERCIAL_V1_COMPLEMENTS = {
  whatsapp_business: { name: "WhatsApp Business", monthlyUsd: 9, billing: "monthly", usageCategories: ["whatsapp_messages"] },
  telephony_sms: { name: "Telefonía & SMS", monthlyUsd: 9, billing: "monthly", usageCategories: ["phone_numbers", "minutes", "sms_a2p"] },
  reputation_reviews: { name: "Reputación & Reseñas", monthlyUsd: 12, billing: "monthly", usageCategories: ["email_sends", "ai_tokens"] },
  campaigns_diffusion: { name: "Campañas & Difusión", monthlyUsd: 15, billing: "monthly", usageCategories: ["email_sends", "sms_a2p", "whatsapp_messages"] },
  conversational_ai: { name: "IA Conversacional", monthlyUsd: 15, billing: "monthly", usageCategories: ["ai_tokens"] },
  voice_ai: { name: "IA de Voz", monthlyUsd: 20, billing: "monthly", usageCategories: ["ai_tokens", "ai_minutes", "minutes"] },
  connections_integrations: { name: "Conexiones & Integraciones", monthlyUsd: 12, billing: "monthly_per_connection", usageCategories: ["api_executions"] },
} as const;
export const COMMERCIAL_V1_SERVICE_FAMILIES = ["Presencia & Marca", "Web & Conversión", "Visibilidad & Marketing", "Sistema Comercial", "Automatización & Integraciones", "IA Aplicada", "Desarrollo Empresarial"] as const;
export type CommercialLicense = "cuadra" | "barrio" | "ciudad";
export type LicenseFitConfidence = "high" | "medium" | "to_confirm";
export type LicenseChange = "same" | "upgrade" | "downgrade" | "initial";
export type CommercialClarificationAnswer = "single_process" | "multiple_coordinated_processes" | "not_applicable" | "not_sure";
export type CommercialDigitalResult = { readonly score: number | null; readonly band: "MAL" | "REGULAR" | "BIEN" | null; readonly confidence: string };

export type CommercialClarification = {
  readonly id: "commercial_process_scope";
  readonly trigger: "license_fit_process_scope_unresolved";
  readonly question: string;
  readonly options: readonly ["single_process", "multiple_coordinated_processes", "not_sure"];
  readonly resolvesSignals: readonly string[];
};

export function commercialClarification(): CommercialClarification {
  return {
    id: "commercial_process_scope",
    trigger: "license_fit_process_scope_unresolved",
    question: "¿Cómo funciona actualmente tu operación?",
    options: ["single_process", "multiple_coordinated_processes", "not_sure"],
    resolvesSignals: ["operational_process_scope", "routing_between_roles", "lifecycle_coordination"],
  };
}

export type CommercialItemKind = "complement" | "service";
export type CommercialPriority = "NOW" | "LATER";

export type CommercialItem = {
  readonly id: string;
  readonly kind: CommercialItemKind;
  readonly name: string;
  readonly priority: CommercialPriority;
  readonly rationale: string;
  readonly evidence: readonly EvidenceRef[];
  readonly priceMonthlyUsd: number | null;
  readonly priceLabel: string | null;
  readonly usageCategories: readonly ExternalUsageCategory[];
};

export const EXTERNAL_USAGE_CATEGORIES = ["whatsapp_messages", "phone_numbers", "minutes", "sms_a2p", "email_sends", "ai_tokens", "ai_minutes", "api_executions", "ad_spend"] as const;
export type ExternalUsageCategory = (typeof EXTERNAL_USAGE_CATEGORIES)[number];

export type LicenseFit = {
  readonly recommendedLicense: CommercialLicense;
  readonly confidence: LicenseFitConfidence;
  readonly evidence: readonly EvidenceRef[];
  readonly rationale: string;
  readonly whyNotLower: string;
  readonly whyNotHigher: string;
  readonly unresolvedSignals: readonly string[];
  readonly change: LicenseChange;
};

export type CommercialRecommendationV1 = {
  readonly commercialRecommendationVersion: typeof COMMERCIAL_RECOMMENDATION_VERSION;
  readonly contractVersion: "commercial-product-system-v1";
  readonly digitalResult: CommercialDigitalResult;
  readonly operationalNeed: CommercialOperationalEvidence;
  readonly licenseFit: LicenseFit;
  readonly now: { readonly license: CommercialLicense; readonly complements: readonly CommercialItem[]; readonly services: readonly CommercialItem[] };
  readonly later: { readonly complements: readonly CommercialItem[]; readonly services: readonly CommercialItem[] };
  readonly cost: {
    readonly monthlyLicenseUsd: number;
    readonly activationUsd: number;
  readonly complements: readonly { readonly id: string; readonly monthlyUsd: number }[];
    readonly externalUsage: readonly { readonly category: ExternalUsageCategory; readonly applies: true }[];
  };
};

export type CommercialRecommendationInput = CommercialEvidenceInput & {
  readonly digitalResult: CommercialDigitalResult;
  readonly currentLicense?: CommercialLicense;
  readonly existingComplementCount?: number;
  readonly operationalEvidence?: CommercialOperationalEvidence;
};

/**
 * Applies the optional post-diagnostic clarification without touching the frozen session answers or Digital Health result.
 * The caller owns the ephemeral answer; it is deliberately not persisted in DiagnosticSessionV3.
 */
export function resolveCommercialRecommendationAfterClarification(input: Omit<CommercialRecommendationInput, "clarificationAnswer"> & { readonly clarificationAnswer: CommercialClarificationAnswer }): CommercialRecommendationV1 {
  return resolveCommercialRecommendation(input);
}

const LICENSE_MONTHLY: Readonly<Record<CommercialLicense, number>> = Object.fromEntries(Object.entries(COMMERCIAL_V1_LICENSES).map(([id, item]) => [id, item.monthlyUsd])) as Record<CommercialLicense, number>;
const ACTIVATION: Readonly<Record<CommercialLicense, number>> = Object.fromEntries(Object.entries(COMMERCIAL_V1_LICENSES).map(([id, item]) => [id, item.activationUsd])) as Record<CommercialLicense, number>;
const LICENSE_RANK: Readonly<Record<CommercialLicense, number>> = { cuadra: 1, barrio: 2, ciudad: 3 };

const ref = (questionId: string, answerOption: string, derivedFact: string, evidenceType: EvidenceRef["evidenceType"] = "DIRECT", relevance: EvidenceRef["relevance"] = "high"): EvidenceRef => ({ questionId, answerOption, derivedFact, evidenceType, relevance });
const answer = (answers: AnswersV2, id: string): string | undefined => {
  const value = answers[id];
  return typeof value === "string" ? value : undefined;
};

function licenseChange(current: CommercialLicense | undefined, next: CommercialLicense): LicenseChange {
  if (current === undefined) return "initial";
  if (current === next) return "same";
  return LICENSE_RANK[next] > LICENSE_RANK[current] ? "upgrade" : "downgrade";
}

function resolveLicenseFit(evidence: CommercialOperationalEvidence, currentLicense: CommercialLicense | undefined, clarificationAnswer?: CommercialRecommendationInput["clarificationAnswer"]): LicenseFit {
  const clarificationRef = clarificationAnswer === "multiple_coordinated_processes"
    ? [ref("commercial_process_scope", clarificationAnswer, "multiple coordinated operational processes", "DIRECT", "high")]
    : clarificationAnswer === "single_process" || clarificationAnswer === "not_applicable"
      ? [ref("commercial_process_scope", clarificationAnswer, "one principal operational process", "DIRECT", "high")]
      : [];
  const evidenceRefs = [...evidence.evidenceRefs, ...clarificationRef];
  const lifecycleComplexity = evidence.onboardingNeed === "required" || evidence.renewalNeed === "required" || evidence.reactivationNeed === "required";
  const city = evidence.processModel === "multiple_coordinated_processes"
    || evidence.automationModel === "multi_process"
    || (evidence.routingNeed === "required" && lifecycleComplexity);
  const recurringProcess = evidence.crmNeed === "required" || evidence.pipelineNeed === "required" || evidence.followupNeed === "required" || evidence.appointmentNeed === "required";
  const externalSolved = evidence.externalSystemAlreadySolvesNeed === true;
  const independentOnly = evidence.independentServiceOnlyNeed === true;
  const unresolved = [...new Set(evidence.unresolvedSignals)];

  let recommendedLicense: CommercialLicense;
  let confidence: LicenseFitConfidence;
  let rationale: string;
  let whyNotLower: string;
  let whyNotHigher: string;

  if (externalSolved || independentOnly) {
    recommendedLicense = "cuadra";
    confidence = "high";
    rationale = externalSolved ? "Tu sistema actual resuelve la operación; Cuadra mantiene organizada tu relación y presencia con Vecidya." : "La necesidad profesional es independiente del CRM, pero Cuadra aporta una base organizada para tu relación y presencia con Vecidya.";
    whyNotLower = "Cuadra es la licencia mínima de entrada al ecosistema Vecidya.";
    whyNotHigher = "No se demuestra una necesidad CRM nueva ni una operación multiproceso que justifique Barrio o Ciudad.";
  } else if (city) {
    recommendedLicense = "ciudad";
    confidence = evidence.processModel === "multiple_coordinated_processes" || evidence.automationModel === "multi_process" ? "high" : "medium";
    rationale = "La evidencia demuestra coordinación estructural entre procesos, roles o ciclos operativos.";
    whyNotLower = "Un solo proceso comercial estándar no cubre la coordinación operacional demostrada.";
    whyNotHigher = "Ciudad ya es el nivel superior de esta familia; no se recomienda por gasto, tamaño o cantidad de complementos.";
  } else if (recurringProcess) {
    recommendedLicense = "barrio";
    confidence = unresolved.length > 0 && !clarificationAnswer ? "to_confirm" : evidence.pipelineNeed === "required" || evidence.followupNeed === "required" || evidence.appointmentNeed === "required" ? "high" : "medium";
    rationale = "La evidencia demuestra un proceso comercial principal que necesita captación, registro o seguimiento repetible.";
    whyNotLower = "Cuadra no incluye un CRM comercial operativo, pipeline ni seguimiento recurrente.";
    whyNotHigher = unresolved.length > 0 ? "No se ha demostrado todavía coordinación multiproceso, routing o varios ciclos relacionados." : "Barrio cubre completamente el único proceso comercial demostrado; Ciudad sería sobredimensionada.";
  } else if (evidence.cuadraOrganizationNeed === true) {
    recommendedLicense = "cuadra";
    confidence = evidence.cuadraOrganizationNeed === true && evidence.crmNeed === "none" ? "medium" : "to_confirm";
    rationale = "La evidencia demuestra una necesidad recurrente de organizar presencia e información sin CRM comercial.";
    whyNotLower = "La relación recurrente con Vecidya y la organización de presencia requieren una base operativa mínima.";
    whyNotHigher = "No se demuestra un proceso comercial repetible que requiera Barrio ni coordinación multiproceso para Ciudad.";
  } else {
    recommendedLicense = "cuadra";
    confidence = unresolved.length > 0 ? "to_confirm" : "high";
    rationale = "La evidencia actual no exige todavía un CRM comercial; Cuadra es la base mínima para organizar presencia, información y prioridades.";
    whyNotLower = "Cuadra es la licencia mínima de entrada al ecosistema Vecidya.";
    whyNotHigher = "No se demuestra CRM comercial ni coordinación multiproceso.";
  }

  return {
    recommendedLicense, confidence, evidence: evidenceRefs, rationale, whyNotLower, whyNotHigher,
    unresolvedSignals: confidence === "to_confirm" ? unresolved : [], change: licenseChange(currentLicense, recommendedLicense),
  };
}

function complement(id: string, name: string, priority: CommercialPriority, priceMonthlyUsd: number, rationale: string, evidence: readonly EvidenceRef[], usageCategories: readonly ExternalUsageCategory[], billing: "monthly" | "monthly_per_connection" = "monthly"): CommercialItem {
  return { id, kind: "complement", name, priority, priceMonthlyUsd, priceLabel: billing === "monthly_per_connection" ? `$${priceMonthlyUsd}/mes/conexión` : `$${priceMonthlyUsd}/mes`, rationale, evidence, usageCategories };
}

function service(id: string, family: string, priority: CommercialPriority, rationale: string, evidence: readonly EvidenceRef[]): CommercialItem {
  return { id, kind: "service", name: family, priority, priceMonthlyUsd: null, priceLabel: null, rationale, evidence, usageCategories: [] };
}

function resolveComplements(answers: AnswersV2, licenseFit: LicenseFit): { now: CommercialItem[]; later: CommercialItem[] } {
  const now: CommercialItem[] = [];
  const later: CommercialItem[] = [];
  const canUseCrmDependentComplement = licenseFit.recommendedLicense === "barrio" || licenseFit.recommendedLicense === "ciudad";
  const promotions = answer(answers, "q2_retail_promotions");
  const reputation = answer(answers, "q2_reputation_flow");
  const cart = answer(answers, "q2_ecommerce_cart_followup");
  const booking = answer(answers, "q2_appointments_booking_method");
  const reminders = answer(answers, "q2_appointments_confirmation_reminders");

  if (canUseCrmDependentComplement && promotions === "yes_regular") now.push(complement("campaigns_diffusion", COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.name, "NOW", COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.monthlyUsd, "Existe una necesidad recurrente de comunicar promociones a personas fuera del punto de atención.", [ref("q2_retail_promotions", promotions, "recurring outbound promotion need")], COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.usageCategories));
  if (canUseCrmDependentComplement && reputation === "steady") now.push(complement("reputation_reviews", COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.name, "NOW", COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.monthlyUsd, "La llegada regular de reseñas demuestra una capacidad recurrente que puede sistematizarse.", [ref("q2_reputation_flow", reputation, "recurring review capability")], COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.usageCategories));
  if (canUseCrmDependentComplement && booking === "call_message" && (reminders === "manual" || reminders === "none")) now.push(complement("telephony_sms", COMMERCIAL_V1_COMPLEMENTS.telephony_sms.name, "NOW", COMMERCIAL_V1_COMPLEMENTS.telephony_sms.monthlyUsd, "La agenda depende de llamadas o mensajes y los recordatorios todavía requieren trabajo manual.", [ref("q2_appointments_booking_method", booking, "phone/message appointment channel"), ref("q2_appointments_confirmation_reminders", reminders!, "manual appointment reminders")], COMMERCIAL_V1_COMPLEMENTS.telephony_sms.usageCategories));

  if (canUseCrmDependentComplement && cart === "sometimes" && !now.some((item) => item.id === "campaigns_diffusion")) later.push(complement("campaigns_diffusion", COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.name, "LATER", COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.monthlyUsd, "Hay una señal de seguimiento de carritos, pero no evidencia suficiente para tratarlo como capacidad necesaria ahora.", [ref("q2_ecommerce_cart_followup", cart, "partial abandoned-cart campaign need")], COMMERCIAL_V1_COMPLEMENTS.campaigns_diffusion.usageCategories));
  if (canUseCrmDependentComplement && reputation === "occasional") later.push(complement("reputation_reviews", COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.name, "LATER", COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.monthlyUsd, "Existe una señal ocasional de reseñas, pendiente de confirmar como capacidad recurrente.", [ref("q2_reputation_flow", reputation, "occasional review capability")], COMMERCIAL_V1_COMPLEMENTS.reputation_reviews.usageCategories));
  return { now: now.slice(0, 2), later };
}

function resolveServices(answers: AnswersV2): { now: CommercialItem[]; later: CommercialItem[] } {
  const now: CommercialItem[] = [];
  const later: CommercialItem[] = [];
  const presence = answer(answers, "q2_presence_digital_base");
  const authority = answer(answers, "q2_professional_authority_signals");
  const discovery = answer(answers, "q2_local_discovery");
  const manual = answer(answers, "q2_operations_manual_impact");
  const automation = answer(answers, "q2_operations_automation_adoption");

  if (presence === "nothing" || presence === "third_party_only") now.push(service("web_conversion", "Web & Conversión", "NOW", "La evidencia demuestra que falta una base digital propia y requiere una intervención de construcción.", [ref("q2_presence_digital_base", presence, "missing or third-party-only digital base")]));
  if (presence === "outdated") later.push(service("web_conversion", "Web & Conversión", "LATER", "Existe una base propia, pero la evidencia indica que necesita actualización; el alcance profesional debe confirmarse.", [ref("q2_presence_digital_base", presence, "outdated digital base") ]));
  if (authority === "not_really") later.push(service("presence_brand", "Presencia & Marca", "LATER", "La evidencia muestra una brecha de confianza visible, pero no prueba todavía el alcance profesional necesario.", [ref("q2_professional_authority_signals", authority, "missing visible trust proof") ]));
  if (discovery === "referral" || discovery === "walk_by") later.push(service("visibility_marketing", "Visibilidad & Marketing", "LATER", "Hay una señal de dependencia de descubrimiento local; se debe confirmar el trabajo de adquisición apropiado.", [ref("q2_local_discovery", discovery, "limited local discovery signal") ]));
  if (manual === "significant" && automation === "none_automated") later.push(service("automation_integrations", "Automatización & Integraciones", "LATER", "El trabajo manual repetitivo tiene impacto, pero la intervención concreta debe definirse antes de contratar.", [ref("q2_operations_manual_impact", manual, "significant manual work"), ref("q2_operations_automation_adoption", automation, "no repetitive automation") ]));
  return { now: now.slice(0, 2), later: later.slice(0, 2) };
}

export function resolveCommercialRecommendation(input: CommercialRecommendationInput): CommercialRecommendationV1 {
  const operationalNeed = input.operationalEvidence ?? adaptCommercialEvidence(input);
  const licenseFit = resolveLicenseFit(operationalNeed, input.currentLicense, input.clarificationAnswer);
  const complements = resolveComplements(input.answers, licenseFit);
  const services = resolveServices(input.answers);
  const nowCandidates = [...complements.now, ...services.now];
  const nowSelected = nowCandidates.slice(0, 2);
  const nowComplements = nowSelected.filter((item) => item.kind === "complement");
  const nowServices = nowSelected.filter((item) => item.kind === "service");
  const externalUsage = [...new Set([...complements.now, ...complements.later, ...services.now, ...services.later].flatMap((item) => item.usageCategories))].map((category) => ({ category, applies: true as const }));
  const now = { license: licenseFit.recommendedLicense, complements: nowComplements, services: nowServices };
  const later = { complements: complements.later, services: services.later };

  return {
    commercialRecommendationVersion: COMMERCIAL_RECOMMENDATION_VERSION,
    contractVersion: "commercial-product-system-v1",
    digitalResult: input.digitalResult,
    operationalNeed,
    licenseFit,
    now,
    later,
    cost: {
      monthlyLicenseUsd: LICENSE_MONTHLY[licenseFit.recommendedLicense],
      activationUsd: ACTIVATION[licenseFit.recommendedLicense],
      complements: [...now.complements, ...later.complements].map((item) => ({ id: item.id, monthlyUsd: item.priceMonthlyUsd! })),
      externalUsage,
    },
  };
}

export { adaptCommercialEvidence } from "./commercial-evidence";
export type { CommercialEvidenceInput, CommercialEvidenceType, CommercialOperationalEvidence, EvidenceRef } from "./commercial-evidence";
