// `redirectTo` llega del cliente. Solo se aceptan destinos internos conocidos para evitar open redirects.
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

/** Regresa a una guía pública después de iniciar sesión sin aceptar destinos externos. */
export function safeLearnReturn(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;

  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return null;
  }

  if (url.origin !== base || url.search || !/^\/aprende\/[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(url.pathname)) return null;
  return `${url.pathname}${url.hash}`;
}

export function isInvitationPath(path: string | null) {
  return Boolean(path?.startsWith("/app/invitations/") || path?.startsWith("/app/owner-invitations/"));
}
