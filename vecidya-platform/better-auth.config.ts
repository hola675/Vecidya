import { betterAuth } from "better-auth/minimal";
import { organization } from "better-auth/plugins";

import { organizationPolicy } from "./server/auth-plugins.server";

// Solo para el CLI de Better Auth (generación de esquema): usa la misma política que el runtime.
// El envío de invitaciones y los hooks necesitan correo y D1 reales y no afectan al esquema.
export const auth = betterAuth({
  plugins: [organization(organizationPolicy)],
});
