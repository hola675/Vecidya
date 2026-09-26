import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
// Solo tipos: permite que la declaración inferida de `authClient` nombre `AuthQueryAtom` (TS2883 con `tsc -b`).
import type {} from "better-auth/client";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});
