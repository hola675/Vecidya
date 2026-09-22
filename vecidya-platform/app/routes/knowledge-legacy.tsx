import { redirect } from "react-router";

import type { Route } from "./+types/knowledge-legacy";

export function loader(_: Route.LoaderArgs) {
  return redirect("/aprende", { status: 301 });
}
