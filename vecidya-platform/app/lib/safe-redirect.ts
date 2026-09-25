// `redirectTo` llega del cliente (enlaces de invitación hacia login y registro). Solo se aceptan
// rutas internas de `/app` para que no sirva como open redirect.
const base = "https://vecidya.invalid";

export function safeAppRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;

  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return null;
  }

  if (url.origin !== base || (url.pathname !== "/app" && !url.pathname.startsWith("/app/"))) return null;
  return `${url.pathname}${url.search}`;
}

export function isInvitationPath(path: string | null) {
  return Boolean(path?.startsWith("/app/invitations/"));
}
