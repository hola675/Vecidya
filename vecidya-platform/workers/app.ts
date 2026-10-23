import { createRequestHandler, RouterContextProvider } from "react-router";

import { cloudflareContext } from "../server/cloudflare-context";
import { runIdentifiedReportPurge } from "../server/identified-report-purge.server";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname === "www.vecidya.com") {
      url.hostname = "vecidya.com";
      return Response.redirect(url.toString(), 301);
    }

    const routerContext = new RouterContextProvider();
    routerContext.set(cloudflareContext, { env, ctx });

    return requestHandler(request, routerContext);
  },
  async scheduled(_controller, env) {
    try {
      const result = await runIdentifiedReportPurge(env);
      if (result.status === "skipped") {
        console.info("diagnostic_identified_report_purge.skipped");
        return;
      }
      console.info("diagnostic_identified_report_purge.completed", result.purged);
    } catch {
      // Avoid logging request identifiers, email addresses, tokens, SQL parameters, or raw errors.
      console.error("diagnostic_identified_report_purge.failed");
      throw new Error("Identified report purge failed; a later scheduled pass can retry safely.");
    }
  },
} satisfies ExportedHandler<Env>;
