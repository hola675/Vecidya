import { requireMembership } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await requireMembership(env, request, params.organizationId);

  return Response.json({ organization: membership });
}
