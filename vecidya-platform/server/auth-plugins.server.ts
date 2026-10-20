import { organization } from "better-auth/plugins";
import { and, eq, isNull, or, gt } from "drizzle-orm";
import { createDatabase } from "../db/client.server";
import { session, billingAccount, organizationLicense, member } from "../db/schema";
import { sendOrganizationInvitation, type InvitationEmailConfig } from "./email/invitation.server";

/** Política del plugin Organization: la comparten el runtime y el CLI de esquema (`better-auth.config.ts`). */
export const organizationPolicy = {
  allowUserToCreateOrganization: false,
  // Sin flujo de borrado: la cascada eliminaría servicios, integraciones y gobierno asignados
  // por la plataforma, y `platform_audit_log` no admite cascada.
  disableOrganizationDeletion: true,
  requireEmailVerificationOnInvitation: true,
} as const;

/**
 * Devuelve el plugin, no un array: Better Auth solo infiere los campos que el plugin añade a la
 * sesión (`activeOrganizationId`) cuando `plugins: [...]` es un literal dentro de `betterAuth()`.
 */
export function createOrganizationPlugin(emailConfig: InvitationEmailConfig, database: ReturnType<typeof createDatabase>, invitationDeliveryManagedByRoute = false) {
  return organization({
    ...organizationPolicy,
    allowUserToCreateOrganization: async (user) => {
      const owned = await database.query.member.findFirst({ where: and(eq(member.userId, user.id), eq(member.role, "owner")) });
      if (!owned) return true; // Alta inicial: la primera organización aún no tiene licencia.
      const account = await database.query.billingAccount.findFirst({ where: eq(billingAccount.ownerUserId, user.id) });
      if (!account) return false;
      const active = await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.billingAccountId, account.id), eq(organizationLicense.status, "active"), or(isNull(organizationLicense.endsAt), gt(organizationLicense.endsAt, new Date()))) });
      return Boolean(active);
    },
    // Better Auth absorbe los errores de esta callback. Las rutas de invitación con
    // entrega gestionada envían explícitamente después de crear el registro,
    // sin enviar una segunda copia desde el plugin.
    sendInvitationEmail: async (data) => {
      if (invitationDeliveryManagedByRoute) return;
      await sendOrganizationInvitation(data, emailConfig);
    },
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
  });
}
