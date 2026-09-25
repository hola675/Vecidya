import { data, Form, Link, redirect, useActionData, useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router";

import { createDatabase } from "../../db/client.server";
import { invitationViewStatus, resolveInvitationView, type InvitationView } from "../../db/invitation-rules";
import { getInvitationWithOrganization, getOrganizationMembership } from "../../db/queries/organization.server";
import { createAuth, type AuthEnvironment } from "../../server/auth.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import { isMailConfigured } from "../../server/email/mail.server";
import { Alert, Button, Card } from "../components/ui";
import { authClient } from "../lib/auth-client";

import type { Route } from "./+types/invitation";

export function meta() {
  return [{ title: "Invitación | Vecidya" }, { name: "robots", content: "noindex" }];
}

const roleLabels: Record<string, string> = { owner: "propietario", admin: "administrador", member: "miembro" };
const verificationUnavailable = "No pudimos enviar el correo de verificación. Inténtalo de nuevo en unos minutos.";

function pathFor(invitationId: string) {
  return `/app/invitations/${encodeURIComponent(invitationId)}`;
}

// Resuelve qué puede ver quien abre el enlace. Better Auth sigue siendo quien acepta.
async function loadInvitation(env: AuthEnvironment, request: Request, invitationId: string) {
  const session = await getSession(env, request);
  if (!session) return { session: null, invitation: null, view: resolveInvitationView(null, null, new Date()) };

  const database = createDatabase(env.DB);
  const invitation = await getInvitationWithOrganization(database, invitationId);
  const membership = invitation ? await getOrganizationMembership(database, session.user.id, invitation.organizationId) : null;
  const view = resolveInvitationView(invitation, {
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    isMember: Boolean(membership),
  }, new Date());
  return { session, invitation, view };
}

type ActionResult = { view: InvitationView; error?: string; notice?: string };

function reply(result: ActionResult, status = invitationViewStatus[result.view.state]) {
  return data(result, { status });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const { session, view } = await loadInvitation(env, request, params.invitationId);
  return data({ view, signedIn: Boolean(session), invitationPath: pathFor(params.invitationId) }, { status: invitationViewStatus[view.state] });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const intent = String((await request.formData()).get("intent"));
  const { session, invitation, view } = await loadInvitation(env, request, params.invitationId);
  if (!session || !invitation) return reply({ view });
  const auth = createAuth(env, request);

  if (intent === "accept") {
    if (view.state === "unverified") return reply({ view, error: "Verifica tu correo antes de aceptar la invitación." }, 403);
    if (view.state !== "ready") return reply({ view });
    try {
      await auth.api.acceptInvitation({ headers: request.headers, body: { invitationId: params.invitationId } });
    } catch {
      // Si el estado cambió entre la carga y el clic (cancelada, expirada…), se muestra ese estado.
      const current = await loadInvitation(env, request, params.invitationId);
      if (current.view.state !== "ready") return reply({ view: current.view });
      return reply({ view, error: "No se pudo aceptar la invitación. Inténtalo de nuevo." }, 500);
    }
    // Better Auth deja activa la organización de la invitación.
    throw redirect("/app");
  }

  if (intent === "send-verification") {
    if (view.state !== "unverified") return reply({ view });
    if (!isMailConfigured(env)) return reply({ view, error: verificationUnavailable }, 503);
    try {
      await auth.api.sendVerificationEmail({
        headers: request.headers,
        body: { email: session.user.email, callbackURL: pathFor(params.invitationId) },
      });
    } catch {
      return reply({ view, error: verificationUnavailable }, 503);
    }
    return reply({ view, notice: `Te enviamos un enlace de verificación a ${session.user.email}. Ábrelo para continuar con la invitación.` });
  }

  if (intent === "open") {
    if (view.state !== "accepted" || !view.isMember) return reply({ view });
    await auth.api.setActiveOrganization({ headers: request.headers, body: { organizationId: invitation.organizationId } });
    throw redirect("/app");
  }

  return reply({ view, error: "Operación no reconocida." }, 400);
}

export default function InvitationPage() {
  const loaderData = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const busy = navigation.state !== "idle";
  const view = result?.view ?? loaderData.view;
  const { invitationPath, signedIn } = loaderData;
  const redirectTo = encodeURIComponent(invitationPath);
  const verification = searchParams.get("verificacion");
  const notice = result?.notice ?? (view.state === "unverified" && verification === "enviada" ? "Te enviamos un enlace de verificación. Ábrelo para continuar con la invitación." : null);
  const error = result?.error ?? (view.state === "unverified" && verification === "fallida" ? verificationUnavailable : null);

  async function switchAccount() {
    await authClient.signOut();
    navigate(`/login?redirectTo=${redirectTo}`);
  }

  return (
    <main className="app-main invitation-page">
      {signedIn ? <Link className="back-link" to="/app">← Volver a Mi Vecidya</Link> : null}
      <Card className="invitation-card">
        <p className="eyebrow">INVITACIÓN</p>
        {view.state === "sign-in" ? <>
          <h1>Tienes una invitación a Vecidya</h1>
          <p>Para verla y aceptarla, entra o crea tu cuenta con el correo que recibió la invitación.</p>
          <p className="invitation-actions"><Link className="button button--primary" to={`/register?redirectTo=${redirectTo}`}>Crear cuenta</Link> <Link className="button button--secondary" to={`/login?redirectTo=${redirectTo}`}>Iniciar sesión</Link></p>
        </> : null}
        {view.state === "not-found" ? <>
          <h1>Esta invitación no existe</h1>
          <p>Revisa el enlace del correo o pide una nueva invitación a quien te invitó.</p>
        </> : null}
        {view.state === "wrong-account" ? <>
          <h1>Esta invitación pertenece a otro correo</h1>
          <p>Fue enviada a {view.maskedEmail}. Cierra sesión y entra con ese correo para aceptarla.</p>
          <Button disabled={busy} onClick={switchAccount} tone="secondary" type="button">Cerrar sesión y cambiar de cuenta</Button>
        </> : null}
        {view.state === "canceled" ? <>
          <h1>Esta invitación fue cancelada.</h1>
          <p>Si todavía quieres unirte, pide una nueva invitación.</p>
        </> : null}
        {view.state === "rejected" ? <>
          <h1>Esta invitación fue rechazada.</h1>
          <p>Si fue un error, pide una nueva invitación.</p>
        </> : null}
        {view.state === "expired" ? <>
          <h1>Esta invitación ha expirado.</h1>
          <p>Pide a quien te invitó que te envíe una nueva.</p>
        </> : null}
        {view.state === "accepted" ? <>
          {view.isMember ? <>
            <h1>Ya formas parte de {view.organizationName}</h1>
            <Form method="post"><input name="intent" type="hidden" value="open" /><Button disabled={busy} type="submit">Ir a {view.organizationName}</Button></Form>
          </> : <>
            <h1>Esta invitación ya fue aceptada.</h1>
            <p>Ya no formas parte de esa organización. Pide una nueva invitación si la necesitas.</p>
          </>}
        </> : null}
        {view.state === "unverified" ? <>
          <h1>Verifica tu correo para unirte a {view.organizationName}</h1>
          <p>La invitación es para {view.email} con el rol {roleLabels[view.role] ?? view.role}. Antes de aceptarla necesitamos confirmar que ese correo es tuyo.</p>
          <Form method="post"><input name="intent" type="hidden" value="send-verification" /><Button disabled={busy} tone="secondary" type="submit">{busy ? "Enviando…" : "Enviar enlace de verificación"}</Button></Form>
        </> : null}
        {view.state === "ready" ? <>
          <h1>Unirte a {view.organizationName}</h1>
          <p>Esta invitación está dirigida a {view.email} y propone el rol {roleLabels[view.role] ?? view.role}.</p>
          <Form method="post"><input name="intent" type="hidden" value="accept" /><Button disabled={busy} type="submit">{busy ? "Aceptando…" : "Aceptar invitación"}</Button></Form>
        </> : null}
        {notice ? <p className="success-message" role="status">{notice}</p> : null}
        {error ? <Alert>{error}</Alert> : null}
      </Card>
    </main>
  );
}
