import { organization } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import { createDatabase } from "../db/client.server";
import { session } from "../db/schema";
import { sendOrganizationInvitation, type InvitationEmailConfig } from "./email/invitation.server";

export function createAuthPlugins(emailConfig: InvitationEmailConfig, database: ReturnType<typeof createDatabase>) {
  return [
    organization({
      allowUserToCreateOrganization: true,
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: (data) => sendOrganizationInvitation(data, emailConfig),
      organizationHooks: {
        afterRemoveMember: async ({ member }) => {
          await database
            .update(session)
            .set({ activeOrganizationId: null })
            .where(and(
              eq(session.userId, member.userId),
              eq(session.activeOrganizationId, member.organizationId),
            ));
        },
      },
    }),
  ];
}
