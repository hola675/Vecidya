import { createRequestHandler, RouterContextProvider } from "react-router";

import { cloudflareContext } from "../server/cloudflare-context";

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
} satisfies ExportedHandler<Env>;
