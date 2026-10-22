import { createTransactionalMailer, type MailEnvironment, type MailResult } from "./mail.server";
import { buildInvitationEmail } from "./templates.server";
import { isOrganizationInvitationEmailConfigured, type InvitationEmailConfig } from "./invitation.server";

export type PlatformOwnerInvitationEmailConfig = MailEnvironment & InvitationEmailConfig;

export function isPlatformOwnerInvitationEmailConfigured(config: PlatformOwnerInvitationEmailConfig) {
  return isOrganizationInvitationEmailConfigured(config);
}

export async function sendPlatformOwnerInvitation(input: {
  invitationId: string;
  token: string;
  email: string;
  organizationName: string;
}, config: PlatformOwnerInvitationEmailConfig): Promise<MailResult> {
  if (!isPlatformOwnerInvitationEmailConfigured(config) || !config.appUrl) {
    throw new Error("PLATFORM_OWNER_INVITATION_EMAIL_UNCONFIGURED");
  }
  const url = new URL(`/app/owner-invitations/${encodeURIComponent(input.invitationId)}`, config.appUrl);
  url.searchParams.set("token", input.token);
  try {
    return await createTransactionalMailer(config).sendTransactionalEmail({
      ...buildInvitationEmail({ organizationName: input.organizationName, role: "owner", url: url.toString() }),
      to: input.email,
    });
  } catch {
    console.error("PLATFORM_OWNER_INVITATION_DELIVERY_UNCONFIRMED", { invitationId: input.invitationId });
    throw new Error("PLATFORM_OWNER_INVITATION_DELIVERY_UNCONFIRMED");
  }
}
