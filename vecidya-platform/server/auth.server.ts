import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";

import { createDatabase } from "../db/client.server";
import * as schema from "../db/schema";
import { createAuthPlugins } from "./auth-plugins.server";

export type AuthEnvironment = Env & {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  APP_URL?: string;
};

export function createAuth(env: AuthEnvironment, request: Request) {
  const secret = env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }

  const workerOrigin = new URL(request.url).origin;
  const browserOrigin = env.BETTER_AUTH_URL
    ? new URL(env.BETTER_AUTH_URL).origin
    : workerOrigin;

  return betterAuth({
    baseURL: browserOrigin,
    database: drizzleAdapter(createDatabase(env.DB), {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: createAuthPlugins({
      resendApiKey: env.RESEND_API_KEY,
      emailFrom: env.EMAIL_FROM,
      appUrl: env.APP_URL ?? browserOrigin,
    }, createDatabase(env.DB)),
    secret,
    trustedOrigins: [browserOrigin, workerOrigin],
  });
}
