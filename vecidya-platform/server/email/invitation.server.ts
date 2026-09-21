import { EmailConfigurationError, createTransactionalMailer, escapeHtml, isMailConfigured, type MailEnvironment } from "./mail.server";

export type InvitationEmailConfig = MailEnvironment & {
  appUrl?: string;
};

type InvitationData = {
  id?: unknown;
  email?: unknown;
  role?: unknown;
  organization?: { name?: unknown };
  inviter?: { name?: unknown; email?: unknown };
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

export async function sendOrganizationInvitation(rawData: unknown, config: InvitationEmailConfig): Promise<void> {
  if (!isOrganizationInvitationEmailConfigured(config)) throw new EmailDeliveryUnavailableError();
  const data = (rawData ?? {}) as InvitationData;
  const invitationId = text(data.id, "");
  const recipient = text(data.email, "");
  if (!invitationId || !recipient) throw new EmailDeliveryError("Organization invitation payload is incomplete");
  const organizationName = text(data.organization?.name, "tu organización");
  const role = text(data.role, "member");
  const inviter = text(data.inviter?.name ?? data.inviter?.email, "Un miembro del equipo");
  const invitationUrl = new URL(`/app/invitations/${encodeURIComponent(invitationId)}`, config.appUrl).toString();

  try {
    await createTransactionalMailer(config).sendTransactionalEmail({
      to: recipient,
      subject: `Invitación a ${organizationName} en Vecidya`,
      text: `${inviter} te ha invitado a unirte a ${organizationName} en Vecidya con el rol ${role}. Acepta la invitación: ${invitationUrl}`,
      html: `<p>${escapeHtml(inviter)} te ha invitado a unirte a <strong>${escapeHtml(organizationName)}</strong> en Vecidya con el rol <strong>${escapeHtml(role)}</strong>.</p><p><a href="${escapeHtml(invitationUrl)}">Aceptar invitación</a></p>`,
    });
  } catch (error) {
    if (error instanceof EmailConfigurationError) throw new EmailDeliveryUnavailableError();
    throw new EmailDeliveryError("Transactional email provider rejected the invitation");
  }
}
