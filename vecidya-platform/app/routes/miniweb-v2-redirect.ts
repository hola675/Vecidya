import { redirect } from "react-router";
import type { Route } from "./+types/miniweb-v2-redirect";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return redirect(`/app/miniweb${url.search}`);
}
