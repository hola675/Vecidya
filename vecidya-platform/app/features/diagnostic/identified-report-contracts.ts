import { hasPublicDiagnosticEngineIdentityV1, type PublicDiagnosticEngineIdentityV1 } from "./public-diagnostic-engine-identity";
import { COMMERCIAL_CONTACT_NOTICE_VERSION, DIAGNOSTIC_RESEARCH_NOTICE_VERSION, REPORT_SERVICE_NOTICE_VERSION } from "./identified-report-constants";

export { COMMERCIAL_CONTACT_NOTICE_VERSION, DIAGNOSTIC_RESEARCH_NOTICE_VERSION, REPORT_SERVICE_NOTICE_VERSION } from "./identified-report-constants";

export type DiagnosticReportRequest = {
  readonly engineIdentity: PublicDiagnosticEngineIdentityV1;
  readonly answers: readonly { readonly questionId: string; readonly value: unknown }[];
  readonly fullName: string;
  readonly businessName: string | null;
  readonly email: string;
  readonly phone: string | null;
  readonly serviceNoticeVersion: typeof REPORT_SERVICE_NOTICE_VERSION;
  readonly serviceNoticeAcknowledged: true;
  readonly commercialContactOptIn: boolean;
  readonly commercialNoticeVersion: typeof COMMERCIAL_CONTACT_NOTICE_VERSION | null;
  readonly researchParticipationOptIn: boolean;
  readonly researchNoticeVersion: typeof DIAGNOSTIC_RESEARCH_NOTICE_VERSION | null;
};

export type ReportPersonalization = {
  readonly requesterName: string;
  readonly businessName: string | null;
};

/** Server-side record shape; only `tokenDigest` is persisted. */
export type VerifiedEmailChallengePurpose = "verification" | "access_recovery";

export type VerifiedEmailChallenge = {
  readonly challengeId: string;
  readonly requestId: string;
  readonly purpose: VerifiedEmailChallengePurpose;
  readonly tokenDigest: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly consumedAt: number | null;
};

/** Access is granted by a separate opaque cookie digest, never by the public request ID. */
export type DiagnosticReportAccess = {
  readonly requestId: string;
  readonly tokenDigest: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
};

export type CommercialContactIntent = {
  readonly requestId: string;
  readonly noticeVersion: typeof COMMERCIAL_CONTACT_NOTICE_VERSION;
  readonly source: "diagnostic_report_form";
  readonly consentedAt: number;
};

export type DiagnosticResearchIntent = {
  readonly requestId: string;
  readonly noticeVersion: typeof DIAGNOSTIC_RESEARCH_NOTICE_VERSION;
  readonly source: "diagnostic_report_form";
  readonly consentedAt: number;
};

export type ValidatedDiagnosticReportRequest = DiagnosticReportRequest & {
  readonly fullName: string;
  readonly businessName: string | null;
  readonly email: string;
  readonly phone: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const hasExactKeys = (value: Record<string, unknown>, expected: readonly string[]) => {
  const actual = Object.keys(value);
  return actual.length === expected.length && expected.every((key) => Object.hasOwn(value, key));
};
const cleanText = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/gu, " ");
  return normalized.length > 0 && normalized.length <= max && !/[\u0000-\u001f\u007f]/u.test(normalized) ? normalized : null;
};

export function normalizeReportEmail(value: unknown): string | null {
  const text = cleanText(value, 254);
  if (!text || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(text)) return null;
  return text.toLowerCase();
}

export function validateDiagnosticReportRequest(value: unknown): ValidatedDiagnosticReportRequest | null {
  if (!isRecord(value) || !hasExactKeys(value, [
    "engineIdentity", "answers", "fullName", "businessName", "email", "phone",
    "serviceNoticeVersion", "serviceNoticeAcknowledged", "commercialContactOptIn", "commercialNoticeVersion",
    "researchParticipationOptIn", "researchNoticeVersion",
  ])) return null;
  if (!hasPublicDiagnosticEngineIdentityV1(value.engineIdentity)) return null;
  if (!Array.isArray(value.answers)) return null;
  const fullName = cleanText(value.fullName, 120);
  const businessName = value.businessName === null ? null : cleanText(value.businessName, 160);
  const email = normalizeReportEmail(value.email);
  const phone = value.phone === null ? null : cleanText(value.phone, 40);
  if (!fullName || (value.businessName !== null && !businessName) || !email || (value.phone !== null && !phone)) return null;
  if (phone && !/^[+0-9().\- ]{7,40}$/u.test(phone)) return null;
  if (value.serviceNoticeVersion !== REPORT_SERVICE_NOTICE_VERSION || value.serviceNoticeAcknowledged !== true) return null;
  if (typeof value.commercialContactOptIn !== "boolean" || typeof value.researchParticipationOptIn !== "boolean") return null;
  if (value.commercialContactOptIn ? value.commercialNoticeVersion !== COMMERCIAL_CONTACT_NOTICE_VERSION : value.commercialNoticeVersion !== null) return null;
  if (value.researchParticipationOptIn ? value.researchNoticeVersion !== DIAGNOSTIC_RESEARCH_NOTICE_VERSION : value.researchNoticeVersion !== null) return null;
  return {
    engineIdentity: value.engineIdentity,
    answers: value.answers as DiagnosticReportRequest["answers"],
    fullName,
    businessName,
    email,
    phone,
    serviceNoticeVersion: REPORT_SERVICE_NOTICE_VERSION,
    serviceNoticeAcknowledged: true,
    commercialContactOptIn: value.commercialContactOptIn,
    commercialNoticeVersion: value.commercialContactOptIn ? COMMERCIAL_CONTACT_NOTICE_VERSION : null,
    researchParticipationOptIn: value.researchParticipationOptIn,
    researchNoticeVersion: value.researchParticipationOptIn ? DIAGNOSTIC_RESEARCH_NOTICE_VERSION : null,
  };
}

export function isRequestId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value);
}
