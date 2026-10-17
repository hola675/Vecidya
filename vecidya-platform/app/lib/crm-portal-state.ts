/** State of the external CRM handoff; never grants access in HighLevel. */
export type CrmPortalState = "not_included" | "pending_setup" | "ready" | "suspended" | "unavailable";
export type CrmService = { code: string; status: string };
export type CrmConnection = { provider: string; status: string; externalId: string; metadata: string | null };

function verifiedProvisioning(metadata: string | null): boolean {
  if (!metadata) return false;
  try {
    const value: unknown = JSON.parse(metadata);
    return typeof value === "object" && value !== null
      && "portalAccessVerified" in value && value.portalAccessVerified === true;
  } catch {
    return false;
  }
}

/**
 * Fail closed. A service assignment alone is NOT a provisioned HighLevel subaccount.
 * A future entitlement resolver must also validate the paid license before enabling ready.
 */
export function resolveCrmPortalState(services: CrmService[], connections: CrmConnection[]): CrmPortalState {
  const crm = services.find((service) => service.code === "crm");
  if (!crm) return "not_included";
  if (crm.status === "suspended" || crm.status === "ended") return "suspended";
  if (crm.status !== "active") return crm.status === "pending" ? "pending_setup" : "unavailable";

  const ghl = connections.find((item) => ["ghl", "highlevel", "gohighlevel"].includes(item.provider.toLowerCase()));
  if (!ghl || ghl.status === "pending") return "pending_setup";
  if (ghl.status === "inactive") return "suspended";
  if (ghl.status !== "active") return "unavailable";
  if (!ghl.externalId.trim() || !verifiedProvisioning(ghl.metadata)) return "pending_setup";
  // Intentionally remain pending until the license/entitlement and account-user audit lands.
  return "pending_setup";
}

export const officialHighLevelLogin = "https://app.gohighlevel.com/";
