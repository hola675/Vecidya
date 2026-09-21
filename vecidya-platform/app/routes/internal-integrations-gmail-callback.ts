import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import {
  clearGmailOAuthStateCookie,
  exchangeGmailAuthorizationCode,
  isGmailOAuthBootstrapEnabled,
} from "../../server/email/gmail-oauth.server";
import type { AuthEnvironment } from "../../server/auth.server";

import type { Route } from "./+types/internal-integrations-gmail-callback";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env as AuthEnvironment, request);
  if (!isGmailOAuthBootstrapEnabled(env as AuthEnvironment)) {
    throw new Response("Not Found", { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const error = query.get("error");
  if (error) {
    throw new Response("Gmail OAuth authorization was denied", {
      status: 400,
      headers: { "Set-Cookie": clearGmailOAuthStateCookie(), "Cache-Control": "no-store" },
    });
  }

  const code = query.get("code");
  const state = query.get("state");
  if (!code || !state) {
    throw new Response("Gmail OAuth callback is incomplete", { status: 400 });
  }

  return exchangeGmailAuthorizationCode(env as AuthEnvironment, request, code, state);
}
