import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";

import { createDatabase } from "../db/client.server";
import * as schema from "../db/schema";
import { createAuthPlugins } from "./auth-plugins.server";
import { createTransactionalMailer, escapeHtml, type MailEnvironment } from "./email/mail.server";

export type AuthEnvironment = Env & {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  EMAIL_PROVIDER?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  APP_URL?: string;
  GMAIL_OAUTH_BOOTSTRAP_ENABLED?: string;
} & MailEnvironment;

export function createAuth(env: AuthEnvironment, request: Request) {
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
        await mailer.sendTransactionalEmail({
          to: user.email,
          subject: "Restablece tu contraseña de Vecidya",
          text: `Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, abre este enlace: ${url}`,
          html: `<p>Recibimos una solicitud para restablecer tu contraseña de Vecidya.</p><p><a href="${escapeHtml(url)}">Restablecer contraseña</a></p><p>Si no lo solicitaste, puedes ignorar este mensaje.</p>`,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await mailer.sendTransactionalEmail({
          to: user.email,
          subject: "Verifica tu correo en Vecidya",
          text: `Verifica tu correo electrónico de Vecidya abriendo este enlace: ${url}`,
          html: `<p>Confirma tu correo electrónico para completar tu cuenta de Vecidya.</p><p><a href="${escapeHtml(url)}">Verificar correo</a></p>`,
        });
      },
      sendOnSignUp: false,
    },
    plugins: createAuthPlugins(emailConfig, createDatabase(env.DB)),
    secret,
    trustedOrigins: [browserOrigin, workerOrigin],
  });
}
