import { Form, Link, redirect, useActionData, useLoaderData, useLocation } from "react-router";
import { createDatabase } from "../../db/client.server";
import { createOrganizationWithOwnerInvitation } from "../../db/queries/platform-organization-lifecycle.server";
import { AdminShell } from "../components/admin-shell";
import { Alert, Button, Card } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdminAction } from "../../server/platform-authorization.server";
import { isPlatformOwnerInvitationEmailConfigured, sendPlatformOwnerInvitation } from "../../server/email/platform-owner-invitation.server";
import type { Route } from "./+types/internal-organization-create";

export function meta() { return [{ title: "Crear organización | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdminAction(env, request, "organization:create");
  return { workspaceUser: access.workspaceUser, emailConfigured: isPlatformOwnerInvitationEmailConfigured(env) };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const actor = await requirePlatformAdminAction(env, request, "organization:create");
  if (!isPlatformOwnerInvitationEmailConfigured(env)) return { error: "El correo transaccional no está configurado. No se creó la organización." };
  const form = await request.formData();
  const name = String(form.get("name") ?? "");
  const slug = String(form.get("slug") ?? "");
  const ownerEmail = String(form.get("ownerEmail") ?? "");
  const created = await createOrganizationWithOwnerInvitation(createDatabase(env.DB), { name, slug, ownerEmail, actorUserId: actor.userId });
  let delivery: "provider_accepted" | "simulated" | "unconfirmed" = "unconfirmed";
  try {
    const sent = await sendPlatformOwnerInvitation({ invitationId: created.invitationId, token: created.rawToken, email: created.ownerEmail, organizationName: created.organizationName }, env);
    delivery = sent.provider === "fake" ? "simulated" : "provider_accepted";
  } catch {
    console.error("PLATFORM_OWNER_INVITATION_DELIVERY_UNCONFIRMED", { invitationId: created.invitationId });
  }
  const routeBase = new URL(request.url).pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  return redirect(`${routeBase}/organizations/${created.organizationId}?created=1&delivery=${delivery}`);
}

export default function InternalOrganizationCreate() {
  const location = useLocation();
  const routeBase = location.pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  const { workspaceUser, emailConfigured } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  return <AdminShell active="organizations" workspaceUser={workspaceUser}>
    <main className="admin-main"><Link className="back-link" to={`${routeBase}/organizations`}>← Volver a organizaciones</Link>
      <div className="page-heading"><div><p className="eyebrow">CONTROL PLANE</p><h1>Nueva organización</h1><p>El espacio queda pendiente hasta que su propietario acepte la invitación y verifique el correo.</p></div></div>
      <Card><Form method="post" className="form-stack">
        {result && "error" in result ? <Alert>{result.error}</Alert> : null}
        {!emailConfigured ? <Alert>El envío de correo no está configurado. Esta acción permanecerá deshabilitada.</Alert> : null}
        <label>Nombre<input name="name" minLength={2} maxLength={120} required /></label>
        <label>Slug<input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} required /></label>
        <label>Correo del propietario<input name="ownerEmail" type="email" maxLength={254} required /></label>
        <Button disabled={!emailConfigured} type="submit">Crear y enviar invitación</Button>
      </Form></Card>
    </main>
  </AdminShell>;
}
