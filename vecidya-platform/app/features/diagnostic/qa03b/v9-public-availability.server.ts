export type V9PublicRuntimeConfig = {
  DIAGNOSTIC_V9_PUBLIC_ENABLED?: string;
  DIAGNOSTIC_V9_BANK_VERSION?: string;
  DIAGNOSTIC_V9_ENGINE_VERSION?: string;
  DIAGNOSTIC_V9_SCORING_VERSION?: string;
  DIAGNOSTIC_V9_RECOMMENDATION_VERSION?: string;
  DIAGNOSTIC_V9_CONSENT_VERSION?: string;
};

/**
 * One server-side gate for all public V9 endpoints and UI bootstrapping.
 * A feature flag alone is insufficient: every version must be explicitly set.
 */
export function isV9PublicRuntimeAvailable(config: V9PublicRuntimeConfig): boolean {
  if (config.DIAGNOSTIC_V9_PUBLIC_ENABLED !== "true") return false;
  return [
    config.DIAGNOSTIC_V9_BANK_VERSION,
    config.DIAGNOSTIC_V9_ENGINE_VERSION,
    config.DIAGNOSTIC_V9_SCORING_VERSION,
    config.DIAGNOSTIC_V9_RECOMMENDATION_VERSION,
    config.DIAGNOSTIC_V9_CONSENT_VERSION,
  ].every((value) => typeof value === "string" && value.trim().length > 0);
}
