import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";

import { createDatabase } from "../db/client.server";
import { getInvitationWithOrganization } from "../db/queries/organization.server";
import { ownerInvitationAllowsSignup } from "../db/queries/platform-organization-lifecycle.server";
import * as schema from "../db/schema";
import { createOrganizationPlugin } from "./auth-plugins.server";
import { isBlockedOrganizationHttpCall } from "./auth/organization-http-surface";
import { createTransactionalMailer, type MailEnvironment } from "./email/mail.server";
import { buildPasswordChangedEmail, buildPasswordResetEmail, buildVerificationEmail } from "./email/templates.server";

export type AuthEnvironment = Env & {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  EMAIL_PROVIDER?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  APP_URL?: string;
} & MailEnvironment;

export function createAuth(env: AuthEnvironment, request: Request, options: { invitationDeliveryManagedByRoute?: boolean } = {}) {
  const secret = env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }

  const workerOrigin = new URL(request.url).origin;
  const browserOrigin = env.BETTER_AUTH_URL
    ? new URL(env.BETTER_AUTH_URL).origin
    : workerOrigin;
  const mailer = createTransactionalMailer(env);
  const emailConfig = {
    ...env,
    appUrl: env.APP_URL || browserOrigin,
  };

  return betterAuth({
    baseURL: browserOrigin,
    database: drizzleAdapter(createDatabase(env.DB), {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await mailer.sendTransactionalEmail({ ...buildPasswordResetEmail(url), to: user.email });
      },
      // Better Auth fires this only after the password was changed.
      // Never turn a successful password reset into a user-facing error if its
      // follow-up notification cannot be delivered.
      onPasswordReset: async ({ user }) => {
        try {
          await mailer.sendTransactionalEmail({ ...buildPasswordChangedEmail(), to: user.email });
        } catch {
          console.error("PASSWORD_CHANGE_NOTICE_UNCONFIRMED");
        }
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await mailer.sendTransactionalEmail({ ...buildVerificationEmail(url), to: user.email });
      },
      sendOnSignUp: false,
    },
    hooks: {
      // `ctx.path` es la ruta ya resuelta del endpoint y `ctx.request` solo existe cuando la
      // llamada llega por HTTP: las llamadas `auth.api.*` de las rutas propias no se bloquean.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-up/email" && ctx.request) {
          const invitationId = ctx.request.headers.get("X-Vecidya-Invitation");
          const email = String(ctx.body?.email ?? "").trim().toLowerCase();
          if (!invitationId || !email) throw new APIError("FORBIDDEN", { message: "El registro requiere una invitación válida." });
          const database = createDatabase(env.DB);
          const invitation = await getInvitationWithOrganization(database, invitationId);
          const validOrganizationInvitation = Boolean(invitation && invitation.status === "pending" && new Date(invitation.expiresAt).getTime() > Date.now() && invitation.email.trim().toLowerCase() === email);
          const validPlatformOwnerInvitation = await ownerInvitationAllowsSignup(database, invitationId, email);
          if (!validOrganizationInvitation && !validPlatformOwnerInvitation) {
            throw new APIError("FORBIDDEN", { message: "La invitación no es válida para este correo." });
          }
        }
        if (isBlockedOrganizationHttpCall(ctx.path, Boolean(ctx.request))) {
          throw new APIError("NOT_FOUND");
        }
      }),
    },
    plugins: [createOrganizationPlugin(emailConfig, createDatabase(env.DB), options.invitationDeliveryManagedByRoute ?? false)],
    secret,
    trustedOrigins: [browserOrigin, workerOrigin],
  });
}
