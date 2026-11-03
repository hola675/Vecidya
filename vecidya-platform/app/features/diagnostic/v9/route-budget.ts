export const V9_BASE_INTERACTION_LIMIT = 24 as const;
export const V9_EXTENSION_INTERACTION_LIMIT = 5 as const;
export const V9_ABSOLUTE_INTERACTION_LIMIT = 29 as const;

export type V9ExtensionConsentState =
  | "not_offered"
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type V9ExtensionConsentDecision = "accepted" | "rejected" | "withdrawn";

export function v9ExtensionInteractionsUsed(interactionCount: number): number {
  if (!Number.isFinite(interactionCount)) return 0;
  return Math.max(0, Math.min(
    V9_EXTENSION_INTERACTION_LIMIT,
    Math.trunc(interactionCount) - V9_BASE_INTERACTION_LIMIT,
  ));
}

export function v9ExtensionInteractionsRemaining(interactionCount: number): number {
  return V9_EXTENSION_INTERACTION_LIMIT - v9ExtensionInteractionsUsed(interactionCount);
}
