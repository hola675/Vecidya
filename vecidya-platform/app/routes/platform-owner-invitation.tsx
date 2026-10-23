import { data, Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";

import { createDatabase } from "../../db/client.server";
import { acceptPlatformOwnerInvitation, digestToken, getPlatformOwnerInvitation } from "../../db/queries/platform-organization-lifecycle.server";
import { createAuth } from "../../server/auth.server";
import { getSession, requireSession } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { Alert, Button, Card } from "../components/ui";
import { AuthShell } from "../components/auth-shell";
import type { Route } from "./+types/platform-owner-invitation";

export function meta() {
  return [{ title: "Invitación de propietario | Vecidya" }, { name: "robots", content: "noindex" }, { name: "referrer", content: "no-referrer" }];
}

function invitationPath(id: string, token: string) {
  const url = new URL(`/app/owner-invitations/${encodeURIComponent(id)}`, "https://vecidya.invalid");
  url.searchParams.set("token", token);
  return `${url.pathname}${url.search}`;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(name.length - 1, 6)))}@${domain}`;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const session = await getSession(env, request);
  const invitation = await getPlatformOwnerInvitation(createDatabase(env.DB), params.invitationId);
  const valid = Boolean(invitation && invitation.status === "pending" && invitation.expiresAt.getTime() > Date.now()
    && invitation.lifecycleStatus === "owner_invited" && token && invitation.tokenDigest === await digestToken(token));
  if (!valid || !invitation) return data({ state: "unavailable" as const, signedIn: Boolean(session), token: "" }, { status: 404 });
  if (!session) return { state: "sign-in" as const, signedIn: false, token, email: maskEmail(invitation.email), path: invitationPath(invitation.id, token) };
  if (session.user.email.trim().toLowerCase() !== invitation.email) return { state: "wrong-account" as const, signedIn: true, token, email: maskEmail(invitation.email), path: invitationPath(invitation.id, token), workspaceUser: { name: session.user.name, email: session.user.email } };
  if (!session.user.emailVerified) return { state: "unverified" as const, signedIn: true, token, email: invitation.email, organizationName: invitation.organizationName, path: invitationPath(invitation.id, token), workspaceUser: { name: session.user.name, email: session.user.email } };
  return { state: "ready" as const, signedIn: true, token, organizationName: invitation.organizationName, path: invitationPath(invitation.id, token), workspaceUser: { name: session.user.name, email: session.user.email } };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const session = await requireSession(env, request);
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const database = createDatabase(env.DB);
  const invitation = await getPlatformOwnerInvitation(database, params.invitationId);
  const url = new URL(request.url);
  const returnTo = invitationPath(params.invitationId, token);
  const currentPath = new URL(returnTo, url.origin).toString();
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt.getTime() <= Date.now()
    || invitation.lifecycleStatus !== "owner_invited" || !token || invitation.tokenDigest !== await digestToken(token)) {
    return data({ error: "Esta invitación ya no está disponible." }, { status: 404 });
  }
  if (session.user.email.trim().toLowerCase() !== invitation.email) return data({ error: "Inicia sesión con el correo que recibió la invitación." }, { status: 403 });
  const auth = createAuth(env, request);
  if (form.get("intent") === "verify") {
    if (session.user.emailVerified) return redirect(currentPath);
    try {
      await auth.api.sendVerificationEmail({ headers: request.headers, body: { email: session.user.email, callbackURL: currentPath } });
      return data({ notice: "Enviamos el enlace de verificación. Ábrelo para continuar." });
    } catch {
      return data({ error: "No pudimos confirmar el envío del correo de verificación." }, { status: 503 });
    }
  }
  if (form.get("intent") !== "accept") return data({ error: "Acción no válida." }, { status: 400 });
  if (!session.user.emailVerified) return data({ error: "Verifica tu correo antes de aceptar." }, { status: 403 });
  try {
    const result = await acceptPlatformOwnerInvitation(database, {
      invitationId: invitation.id, token, userId: session.user.id, userEmail: session.user.email,
    });
    await auth.api.setActiveOrganization({ headers: request.headers, body: { organizationId: result.organizationId } });
    throw redirect("/app");
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ error: "No se pudo aceptar la invitación. Si ya tienes acceso, entra a Mi Vecidya." }, { status: 409 });
  }
}

export default function PlatformOwnerInvitation() {
  const invitation = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  if (invitation.state === "unavailable") return <main className="app-main"><Card><h1>Invitación no disponible</h1><p>El enlace no es válido o ya expiró. Pide a Vecidya que revise la invitación.</p><Link className="button button--secondary" to="/login">Iniciar sesión</Link></Card></main>;
  if (invitation.state === "sign-in") return <AuthShell eyebrow="INVITACIÓN DE OWNER" title="Te invitaron a Vecidya" description={`Inicia sesión o crea una cuenta con el correo ${invitation.email}.`} privacyNote="La invitación solo se acepta después de verificar el mismo correo."><p><Link className="button button--primary" to={`/register?redirectTo=${encodeURIComponent(invitation.path)}`}>Crear cuenta</Link></p><p><Link className="button button--secondary" to={`/login?redirectTo=${encodeURIComponent(invitation.path)}`}>Iniciar sesión</Link></p></AuthShell>;
  if (invitation.state === "wrong-account") return <main className="app-main"><Card><h1>Usa el correo invitado</h1><p>Este enlace se envió a {invitation.email}.</p><Link className="button button--secondary" to={`/login?redirectTo=${encodeURIComponent(invitation.path)}`}>Cambiar de cuenta</Link></Card></main>;
  return <main className="app-main"><Card className="invitation-card"><p className="eyebrow">INVITACIÓN DE PROPIETARIO</p><h1>{invitation.organizationName}</h1><p>{invitation.state === "unverified" ? `Confirma ${invitation.email} para activar el acceso de propietario.` : "Acepta la invitación para activar tu organización."}</p>{result && "error" in result ? <Alert>{result.error}</Alert> : null}{result && "notice" in result ? <Alert>{result.notice}</Alert> : null}<Form method="post"><input type="hidden" name="token" value={invitation.token} />{invitation.state === "unverified" ? <Button disabled={busy} name="intent" value="verify" tone="secondary" type="submit">Enviar verificación</Button> : <Button disabled={busy} name="intent" value="accept" type="submit">Aceptar invitación</Button>}</Form></Card></main>;
}
