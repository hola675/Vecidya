import { EmailConfigurationError, createTransactionalMailer, isMailConfigured, type MailEnvironment, type MailResult } from "./mail.server";
import { buildInvitationEmail } from "./templates.server";

export type InvitationEmailConfig = MailEnvironment & { appUrl?: string };

type InvitationData = {
  id?: unknown;
  email?: unknown;
  role?: unknown;
  organization?: { name?: unknown };
};

export class EmailDeliveryUnavailableError extends Error {
  constructor() {
    super("Organization invitation email delivery is not configured");
    this.name = "EmailDeliveryUnavailableError";
  }
}

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

export function isOrganizationInvitationEmailConfigured(config: InvitationEmailConfig): boolean {
  return Boolean(config.appUrl && isMailConfigured(config));
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function sendOrganizationInvitation(rawData: unknown, config: InvitationEmailConfig): Promise<MailResult> {
  if (!isOrganizationInvitationEmailConfigured(config)) throw new EmailDeliveryUnavailableError();
  const data = (rawData ?? {}) as InvitationData;
  const invitationId = text(data.id, "");
  const recipient = text(data.email, "");
  if (!invitationId || !recipient) throw new EmailDeliveryError("Organization invitation payload is incomplete");
  const organizationName = text(data.organization?.name, "tu organización");
  const rawRole = text(data.role, "member");
  const role = rawRole === "admin" || rawRole === "owner" ? rawRole : "member";
  const invitationUrl = new URL("/app/invitations/" + encodeURIComponent(invitationId), config.appUrl).toString();

  try {
    return await createTransactionalMailer(config).sendTransactionalEmail({
      ...buildInvitationEmail({ organizationName, role, url: invitationUrl }),
      to: recipient,
    });
  } catch (error) {
    if (error instanceof EmailConfigurationError) throw new EmailDeliveryUnavailableError();
    throw new EmailDeliveryError("Transactional email provider did not confirm invitation");
  }
}

export type InvitationDeliveryState = "provider_accepted" | "simulated" | "unconfirmed";

/**
 * Called only from the guarded Vecidya invitation routes.
 * They create the Better Auth invitation with its callback suppressed and send once, explicitly.
 * A send error does not roll back a created invitation: API/UI must report that uncertainty.
 * Do not retry automatically (Gmail may have accepted a message before a network failure).
 */
export async function createAndDeliverOrganizationInvitation<T extends { id: string; email: string; role?: string | null }>(
  create: () => Promise<T>,
  config: InvitationEmailConfig,
  organizationName: string,
): Promise<{ invitation: T; delivery: InvitationDeliveryState }> {
  const invitation = await create();
  try {
    const result = await sendOrganizationInvitation({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role ?? "member",
      organization: { name: organizationName },
    }, config);
    return { invitation, delivery: result.provider === "fake" ? "simulated" : "provider_accepted" };
  } catch {
    // No destinatario, token ni URL de acceso en logs.
    console.error("INVITE_DELIVERY_UNCONFIRMED", { invitationId: invitation.id });
    return { invitation, delivery: "unconfirmed" };
  }
}
