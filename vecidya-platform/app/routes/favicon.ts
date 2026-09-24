import { redirect } from "react-router";

import type { Route } from "./+types/favicon";

export function loader(_: Route.LoaderArgs) {
  return redirect("/brand/vecidya-icon-3d.png", {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}
