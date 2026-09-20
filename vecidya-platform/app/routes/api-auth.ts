import { createAuth } from "../../server/auth.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-auth";

function handleAuthRequest({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return createAuth(env, request).handler(request);
}

export const loader = handleAuthRequest;
export const action = handleAuthRequest;
