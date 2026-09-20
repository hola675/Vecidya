import { betterAuth } from "better-auth/minimal";

import { createAuthPlugins } from "./server/auth-plugins.server";

export const auth = betterAuth({
  plugins: createAuthPlugins(),
});
