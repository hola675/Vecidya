export type AnonymousDiagnosticState = "low" | "developing" | "solid" | "insufficient";
export type AnonymousDiagnosticConfidence = "high" | "medium" | "low";

export type AnonymousDiagnosticSummaryV1 = {
  readonly version: 1;
  readonly score: number | null;
  readonly state: AnonymousDiagnosticState;
  readonly confidence: AnonymousDiagnosticConfidence;
  readonly preliminary: boolean;
  readonly headline: string;
  readonly currentState: string | null;
  readonly focus: { readonly title: string; readonly description: string } | null;
  readonly firstAction: { readonly title: string; readonly description: string } | null;
  readonly coverageNote: string;
  readonly confidenceNote: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

/** Valida el DTO allowlisted al recibirlo del Worker o al reanudar su copia local versionada. */
export function isAnonymousDiagnosticSummaryV1(value: unknown): value is AnonymousDiagnosticSummaryV1 {
  if (!isRecord(value) || !hasExactKeys(value, [
    "version", "score", "state", "confidence", "preliminary", "headline", "currentState", "focus", "firstAction", "coverageNote", "confidenceNote",
  ]) || value.version !== 1 || !(value.score === null || (typeof value.score === "number" && Number.isFinite(value.score))) ||
    !["low", "developing", "solid", "insufficient"].includes(String(value.state)) ||
    !["high", "medium", "low"].includes(String(value.confidence)) || typeof value.preliminary !== "boolean" ||
    typeof value.headline !== "string" || !(value.currentState === null || typeof value.currentState === "string") ||
    typeof value.coverageNote !== "string" || typeof value.confidenceNote !== "string") return false;
  const validTextPair = (entry: unknown) => entry === null || (isRecord(entry) && hasExactKeys(entry, ["title", "description"]) && typeof entry.title === "string" && typeof entry.description === "string");
  return validTextPair(value.focus) && validTextPair(value.firstAction);
}
