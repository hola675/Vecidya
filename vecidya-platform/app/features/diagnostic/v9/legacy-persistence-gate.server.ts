/**
 * The historical V9 run API writes each answer to D1 before the interview is
 * complete. It is retained for source/data compatibility, but must not be
 * activated by the public V9 feature flag. A future consented-completion flow
 * needs its own terminal, one-shot contract rather than reusing these routes.
 */
export function isV9LegacyPersistentApiAvailable(): boolean {
  return false;
}

export const V9_LEGACY_PERSISTENCE_DISABLED_ERROR =
  "La persistencia heredada V9 está deshabilitada para el flujo público.";
