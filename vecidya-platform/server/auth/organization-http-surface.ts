// Superficie HTTP del plugin Organization de Better Auth (`/api/auth/organization/*`).
// Solo estos endpoints se pueden llamar desde el navegador. El resto responde 404 por HTTP y
// Vecidya los usa únicamente desde el servidor (`auth.api.*`), detrás de la matriz propia de
// `authorization.server.ts`. Se deniega por defecto: un endpoint que aparezca al actualizar
// Better Auth queda cerrado hasta que se decida abrirlo.
export const browserOrganizationEndpoints: ReadonlySet<string> = new Set([
  "/organization/create", // usuario autenticado con permiso; sin licencia premium automática
  "/organization/list", // login.tsx: solo organizaciones con membresía del usuario
  "/organization/set-active", // login.tsx y selector: Better Auth exige membresía
  "/organization/accept-invitation", // ligada al correo verificado del destinatario
]);

export function isBlockedOrganizationHttpCall(path: string | undefined, fromHttpRequest: boolean) {
  return fromHttpRequest
    && path !== undefined
    && path.startsWith("/organization/")
    && !browserOrganizationEndpoints.has(path);
}
