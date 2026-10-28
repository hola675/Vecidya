export const V9_ANONYMOUS_IDENTITY_COOKIE = "vecidya_diagnostic_v9";

export type V9AnonymousCookieIdentity = {
  identityId: string;
  recoveryCredential: string;
};

export function readV9AnonymousIdentityCookie(request: Request): V9AnonymousCookieIdentity | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const entry = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(V9_ANONYMOUS_IDENTITY_COOKIE + "="));
  if (!entry) return null;
  const raw = entry.slice(V9_ANONYMOUS_IDENTITY_COOKIE.length + 1);
  let value: string;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const separator = value.indexOf(".");
  if (separator < 1) return null;
  const identityId = value.slice(0, separator);
  const recoveryCredential = value.slice(separator + 1);
  if (identityId.length > 128 || !/^[a-f0-9]{64}$/.test(recoveryCredential)) return null;
  return { identityId, recoveryCredential };
}

export function buildV9AnonymousIdentityCookie(
  request: Request,
  identity: V9AnonymousCookieIdentity,
  maxAgeSeconds = 60 * 60 * 24 * 30,
): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const value = encodeURIComponent(identity.identityId + "." + identity.recoveryCredential);
  return `${V9_ANONYMOUS_IDENTITY_COOKIE}=${value}; Path=/api/diagnostic; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearV9AnonymousIdentityCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${V9_ANONYMOUS_IDENTITY_COOKIE}=; Path=/api/diagnostic; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
