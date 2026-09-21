import type { AuthEnvironment } from "../auth.server";

export const gmailOAuthRedirectUri = "https://vecidya.com/app/internal/integrations/gmail/callback";
const gmailOAuthScope = "https://www.googleapis.com/auth/gmail.send";
const stateCookieName = "vecidya_gmail_oauth_state";
const stateLifetimeSeconds = 600;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signState(state: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(state));
  return `${state}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function verifyState(value: string, secret: string): Promise<string | null> {
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const state = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(state),
    );
    return valid ? state : null;
  } catch {
    return null;
  }
}

function getStateCookie(request: Request): string | null {
  const cookies = request.headers.get("Cookie")?.split(";") ?? [];
  for (const cookie of cookies) {
    const [name, ...parts] = cookie.trim().split("=");
    if (name === stateCookieName) return parts.join("=") || null;
  }
  return null;
}

export function clearGmailOAuthStateCookie(): string {
  return `${stateCookieName}=; Max-Age=0; Path=/app/internal/integrations/gmail; HttpOnly; Secure; SameSite=Lax`;
}

export function isGmailOAuthBootstrapEnabled(env: AuthEnvironment): boolean {
  return env.GMAIL_OAUTH_BOOTSTRAP_ENABLED === "true";
}

export async function createGmailAuthorizationResponse(env: AuthEnvironment): Promise<Response> {
  if (!env.GMAIL_OAUTH_CLIENT_ID || !env.BETTER_AUTH_SECRET) {
    throw new Response("Gmail OAuth is not configured", { status: 503 });
  }

  const stateBytes = new Uint8Array(32);
  crypto.getRandomValues(stateBytes);
  const state = bytesToBase64Url(stateBytes);
  const signedState = await signState(state, env.BETTER_AUTH_SECRET);
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: env.GMAIL_OAUTH_CLIENT_ID,
    redirect_uri: gmailOAuthRedirectUri,
    response_type: "code",
    scope: gmailOAuthScope,
    access_type: "offline",
    prompt: "consent",
    state,
    login_hint: "hola@vecidya.com",
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl.toString(),
      "Set-Cookie": `${stateCookieName}=${signedState}; Max-Age=${stateLifetimeSeconds}; Path=/app/internal/integrations/gmail; HttpOnly; Secure; SameSite=Lax`,
      "Cache-Control": "no-store",
    },
  });
}

export async function exchangeGmailAuthorizationCode(
  env: AuthEnvironment,
  request: Request,
  code: string,
  state: string,
): Promise<Response> {
  if (!env.GMAIL_OAUTH_CLIENT_ID || !env.GMAIL_OAUTH_CLIENT_SECRET || !env.BETTER_AUTH_SECRET) {
    throw new Response("Gmail OAuth is not configured", { status: 503 });
  }

  const signedState = getStateCookie(request);
  const expectedState = signedState ? await verifyState(signedState, env.BETTER_AUTH_SECRET) : null;
  if (!expectedState || expectedState !== state) {
    throw new Response("Invalid Gmail OAuth state", {
      status: 400,
      headers: { "Set-Cookie": clearGmailOAuthStateCookie(), "Cache-Control": "no-store" },
    });
  }

  let response: Response;
  try {
    response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GMAIL_OAUTH_CLIENT_ID,
        client_secret: env.GMAIL_OAUTH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: gmailOAuthRedirectUri,
      }),
    });
  } catch {
    throw new Response("Gmail OAuth exchange failed", { status: 502 });
  }

  const payload = await response.json().catch(() => null) as {
    access_token?: unknown;
    refresh_token?: unknown;
  } | null;
  if (!response.ok || typeof payload?.access_token !== "string" || typeof payload.refresh_token !== "string" || !payload.refresh_token) {
    throw new Response("Gmail OAuth did not return an offline refresh token", {
      status: 502,
      headers: { "Set-Cookie": clearGmailOAuthStateCookie(), "Cache-Control": "no-store" },
    });
  }

  return new Response(
    "Gmail OAuth autorizado. Este es un handoff único para configurar GMAIL_OAUTH_REFRESH_TOKEN en Cloudflare. No guardes este valor en archivos ni lo compartas.\n\n" + payload.refresh_token,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": clearGmailOAuthStateCookie(),
      },
    },
  );
}
