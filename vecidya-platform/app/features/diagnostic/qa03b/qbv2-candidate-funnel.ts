import type { CandidateDiagnosticReportV1 } from "../../../components/diagnostic-report/report-model";
import {
  buildCandidateResultPresentationV3,
  type CandidateResultPresentationV3,
} from "../../../components/diagnostic-flow/qa03b-presentation";
import { DIMENSION_ILLUSTRATION_BY_KEY } from "../../../components/diagnostic-result/presentation";
import {
  CANDIDATE_RESULT_IDENTITY_V3,
  isCandidateResultIdentityV3,
  type CandidatePipelineResultV3,
} from "./qbv2-candidate-pipeline";

/** Contratos FUNNEL-01A. No envían, almacenan ni autorizan datos por sí mismos. */
export const DIAGNOSTIC_FUNNEL_STATES_V1 = [
  "DIAGNOSTIC_IN_PROGRESS",
  "DIAGNOSTIC_COMPLETED",
  "ANONYMOUS_SUMMARY",
  "DETAILS_REQUESTED",
  "IDENTIFICATION_REQUIRED",
  "IDENTIFICATION_SUBMITTING",
  "IDENTIFICATION_VERIFICATION_PENDING",
  "DETAILED_REPORT_AVAILABLE",
  "PERSONALIZED_REPORT_READY",
  "ERROR_RECOVERABLE",
] as const;

export type DiagnosticFunnelStateV1 = (typeof DIAGNOSTIC_FUNNEL_STATES_V1)[number];

export type AnonymousDiagnosticSummaryDimensionV2 = {
  readonly label: string;
  readonly score: number | null;
  readonly statusLabel: string;
  readonly preliminary: boolean;
  readonly illustration: string;
};

export type AnonymousDiagnosticSummaryV2 = {
  readonly contractVersion: "anonymous-diagnostic-summary-v2";
  readonly overallStatus: string;
  readonly score: number | null;
  readonly confidence: string;
  readonly coverage: string;
  readonly executiveSummary: string;
  readonly primaryOpportunity: string | null;
  readonly firstRecommendedAction: { readonly title: string; readonly explanation: string } | null;
  readonly limitations: readonly string[];
  readonly methodologyVersion: string;
  readonly diagnosticIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly dimensions: readonly AnonymousDiagnosticSummaryDimensionV2[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const allowedDimensionIllustrations = new Set(Object.values(DIMENSION_ILLUSTRATION_BY_KEY));

export function isAnonymousDiagnosticSummaryV2(value: unknown): value is AnonymousDiagnosticSummaryV2 {
  if (!isRecord(value) || Object.keys(value).length !== 12) return false;
  if (value.contractVersion !== "anonymous-diagnostic-summary-v2" || typeof value.overallStatus !== "string" || typeof value.confidence !== "string" || typeof value.coverage !== "string" || typeof value.executiveSummary !== "string") return false;
  if (!(value.score === null || (typeof value.score === "number" && Number.isFinite(value.score) && value.score >= 0 && value.score <= 100))) return false;
  if (!(value.primaryOpportunity === null || typeof value.primaryOpportunity === "string")) return false;
  if (!(value.firstRecommendedAction === null || (isRecord(value.firstRecommendedAction) && Object.keys(value.firstRecommendedAction).length === 2 && typeof value.firstRecommendedAction.title === "string" && typeof value.firstRecommendedAction.explanation === "string"))) return false;
  if (!Array.isArray(value.limitations) || !value.limitations.every((item) => typeof item === "string") || typeof value.methodologyVersion !== "string" || !Array.isArray(value.dimensions) || value.dimensions.length !== 8) return false;
  if (!isCandidateResultIdentityV3(value.diagnosticIdentity) || value.methodologyVersion !== value.diagnosticIdentity.methodology) return false;
  const allowed = ["contractVersion", "overallStatus", "score", "confidence", "coverage", "executiveSummary", "primaryOpportunity", "firstRecommendedAction", "limitations", "methodologyVersion", "diagnosticIdentity", "dimensions"];
  if (!Object.keys(value).every((key) => allowed.includes(key))) return false;
  return value.dimensions.every((dimension) => isRecord(dimension) && Object.keys(dimension).length === 5 &&
    typeof dimension.label === "string" && dimension.label.length > 0 && dimension.label.length <= 100 &&
    (dimension.score === null || (typeof dimension.score === "number" && Number.isFinite(dimension.score) && dimension.score >= 0 && dimension.score <= 100)) &&
    typeof dimension.statusLabel === "string" && dimension.statusLabel.length > 0 && dimension.statusLabel.length <= 120 &&
    typeof dimension.preliminary === "boolean" && !(dimension.score === null && dimension.preliminary) &&
    typeof dimension.illustration === "string" && allowedDimensionIllustrations.has(dimension.illustration));
}

/** Allowlistada desde la presentación certificada; no reconstruye scoring ni recomendaciones. */
export function buildAnonymousDiagnosticSummaryV2(
  result: CandidatePipelineResultV3,
): AnonymousDiagnosticSummaryV2 {
  const view: CandidateResultPresentationV3 = buildCandidateResultPresentationV3(result);
  const executiveSummary = view.executiveSummary[0];
  if (!executiveSummary) throw new Error("El diagnóstico candidato no contiene una interpretación ejecutiva.");
  const firstAction = view.recommendations[0];

  return {
    contractVersion: "anonymous-diagnostic-summary-v2",
    overallStatus: view.overall.label,
    score: view.overall.score,
    confidence: view.overall.confidence,
    coverage: view.overall.coverage,
    executiveSummary,
    primaryOpportunity: view.priorities[0]?.statement ?? null,
    firstRecommendedAction: firstAction
      ? { title: firstAction.title, explanation: firstAction.whatToImprove }
      : null,
    limitations: [view.overall.coverage, ...(view.overall.warning ? [view.overall.warning] : [])],
    methodologyVersion: result.engineIdentity.methodology,
    diagnosticIdentity: result.engineIdentity,
    dimensions: view.dimensions.map((dimension) => ({
      label: dimension.label,
      score: dimension.score,
      statusLabel: dimension.statusLabel,
      preliminary: dimension.preliminary,
      illustration: dimension.icon,
    })),
  };
}

/** Contrato documental separado: no contiene identificación ni acceso al informe completo. */
export type AnonymousSummaryReportV2 = {
  readonly contractVersion: "anonymous-summary-report-v2";
  readonly summary: AnonymousDiagnosticSummaryV2;
};

export function buildAnonymousSummaryReportV2(
  summary: AnonymousDiagnosticSummaryV2,
): AnonymousSummaryReportV2 {
  return { contractVersion: "anonymous-summary-report-v2", summary };
}

export type FunnelIdentificationInputV1 = {
  readonly businessOrProjectName: string;
  readonly responsibleName: string;
  readonly email: string;
  readonly phone: string;
  readonly commercialFollowUp: boolean;
  readonly researchParticipation: boolean;
};

export type ValidatedFunnelIdentificationV1 = {
  readonly businessOrProjectName: string | null;
  readonly responsibleName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly commercialFollowUp: boolean;
  readonly researchParticipation: boolean;
};

export type FunnelIdentificationValidationV1 =
  | { readonly valid: true; readonly value: ValidatedFunnelIdentificationV1 }
  | { readonly valid: false; readonly errors: Partial<Record<"responsibleName" | "email" | "phone", string>> };

/** Validación local para el prototipo; no es validación de endpoint ni política legal. */
export function validateFunnelIdentificationV1(
  input: FunnelIdentificationInputV1,
): FunnelIdentificationValidationV1 {
  const responsibleName = input.responsibleName.trim();
  const email = input.email.trim().toLocaleLowerCase("en-US");
  const phone = input.phone.trim();
  const errors: Partial<Record<"responsibleName" | "email" | "phone", string>> = {};

  if (!responsibleName) errors.responsibleName = "Escribe el nombre de la persona responsable.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Escribe un correo electrónico válido.";
  if (phone.length > 40) errors.phone = "El teléfono no puede superar 40 caracteres.";
  if (Object.keys(errors).length) return { valid: false, errors };

  return {
    valid: true,
    value: {
      businessOrProjectName: input.businessOrProjectName.trim() || null,
      responsibleName,
      email,
      phone: phone || null,
      commercialFollowUp: input.commercialFollowUp,
      researchParticipation: input.researchParticipation,
    },
  };
}

export type PersonalizedDetailedReportV1 = {
  readonly contractVersion: "personalized-detailed-report-v1";
  readonly report: CandidateDiagnosticReportV1;
  readonly personalization: {
    readonly businessOrProjectName: string | null;
    readonly responsibleName: string;
    readonly email: string;
    readonly phone: string | null;
  };
  readonly scoreSource: "unchanged-diagnostic-result";
};

/** Forma futura del permiso; el secreto de acceso nunca forma parte del objeto persistido. */
export type DiagnosticReportAccessGrantV1 = {
  readonly grantId: string;
  readonly requestId: string;
  readonly method: "verified-email-one-time-link";
  readonly expiresAt: string;
  readonly singleUse: true;
  readonly consumedAt: string | null;
};

/** Taxonomía declarativa; FUNNEL-01A no incluye emisor, almacenamiento ni integración analítica. */
export const DIAGNOSTIC_FUNNEL_ANALYTICS_EVENTS_V1 = [
  "diagnostic_started",
  "question_answered",
  "diagnostic_completed",
  "summary_viewed",
  "summary_download_requested",
  "detailed_report_requested",
  "identification_submitted",
  "report_access_granted",
  "detailed_report_viewed",
  "personalized_report_downloaded",
  "commercial_contact_requested",
] as const;
