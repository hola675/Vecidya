import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import {
  createGmailAuthorizationResponse,
  isGmailOAuthBootstrapEnabled,
} from "../../server/email/gmail-oauth.server";
import type { AuthEnvironment } from "../../server/auth.server";

import type { Route } from "./+types/internal-integrations-gmail-authorize";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env as AuthEnvironment, request);
  if (!isGmailOAuthBootstrapEnabled(env as AuthEnvironment)) {
    throw new Response("Not Found", { status: 404 });
  }
  return createGmailAuthorizationResponse(env as AuthEnvironment);
}
