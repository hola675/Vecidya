import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";

import { createAuth } from "../../server/auth.server";
import { hasPermission, requireOrganizationPermission } from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization } from "../../server/auth/session.server";
import { isOrganizationInvitationEmailConfigured } from "../../server/email/invitation.server";
import { Alert, Badge, Button, Card } from "../components/ui";

import type { Route } from "./+types/organization";

function invitationEmailConfig(env: Env) {
  return { resendApiKey: env.RESEND_API_KEY, emailFrom: env.EMAIL_FROM, appUrl: env.APP_URL || undefined };
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await getActiveOrganization(env, request);
  if (!organization) throw new Response("An active organization is required", { status: 403 });
  await requireOrganizationPermission(env, request, organization.id, "member:read");
  const auth = createAuth(env, request);
  const members = await auth.api.listMembers({
    headers: request.headers,
    query: { organizationId: organization.id },
  });
  const invitations = hasPermission(organization.role, "member:invite")
    ? await auth.api.listInvitations({ headers: request.headers, query: { organizationId: organization.id } })
    : null;
  return { organization, members, invitations };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await getActiveOrganization(env, request);
  if (!organization) throw new Response("An active organization is required", { status: 403 });
  const formData = await request.formData();
  const operation = String(formData.get("operation"));
  const memberId = String(formData.get("memberId"));
  const auth = createAuth(env, request);

  if (operation === "update-role") {
    const role = String(formData.get("role"));
    if (!(["owner", "admin", "member"] as const).includes(role as "owner" | "admin" | "member")) {
      return { error: "El rol solicitado no es válido." };
    }
    await requireOrganizationPermission(env, request, organization.id, "member:role:update");
    try {
      await auth.api.updateMemberRole({
        headers: request.headers,
        body: { memberId, organizationId: organization.id, role: role as "owner" | "admin" | "member" },
      });
    } catch {
      return { error: "No se pudo actualizar el rol; la política de la organización lo rechazó." };
    }
    return { success: "Rol actualizado." };
  }

  if (operation === "remove") {
    await requireOrganizationPermission(env, request, organization.id, "member:remove");
    try {
      await auth.api.removeMember({
        headers: request.headers,
        body: { memberIdOrEmail: memberId, organizationId: organization.id },
      });
    } catch {
      return { error: "No se pudo retirar el miembro; la política de ownership lo rechazó." };
    }
    return { success: "Miembro retirado." };
  }

  if (operation === "invite") {
    const email = String(formData.get("email")).trim().toLowerCase();
    const role = String(formData.get("role"));
    if (!/^\S+@\S+\.\S+$/.test(email) || !(role === "admin" || role === "member")) {
      return { error: "Introduce un correo válido y un rol permitido." };
    }
    await requireOrganizationPermission(env, request, organization.id, "member:invite");
    if (!isOrganizationInvitationEmailConfigured(invitationEmailConfig(env))) {
      return { error: "La invitación no se creó: el correo transaccional todavía no está configurado." };
    }
    try {
      await auth.api.createInvitation({
        headers: request.headers,
        body: { email, role, organizationId: organization.id },
      });
    } catch {
      return { error: "La invitación no se pudo entregar: el correo transaccional todavía no está configurado." };
    }
    return { success: "Invitación creada y enviada." };
  }

  if (operation === "cancel-invitation") {
    await requireOrganizationPermission(env, request, organization.id, "member:invite");
    try {
      await auth.api.cancelInvitation({ headers: request.headers, body: { invitationId: String(formData.get("invitationId")) } });
    } catch {
      return { error: "No se pudo cancelar la invitación." };
    }
    return { success: "Invitación cancelada." };
  }

  return { error: "Operación no reconocida." };
}

export default function OrganizationPage() {
  const { organization, members, invitations } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const memberList = members.members ?? [];

  return (
    <main className="app-main organization-page">
      <Link className="back-link" to="/app">← Volver a Mi Vecidya</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI ORGANIZACIÓN</p>
          <h1>{organization.name}</h1>
          <p>Consulta y administra las personas que ya pertenecen a este espacio.</p>
        </div>
        <Badge tone="brand">Rol: {organization.role}</Badge>
      </div>
      {result?.error ? <Alert>{result.error}</Alert> : null}
      {result?.success ? <p className="success-message" role="status">{result.success}</p> : null}
      <Card className="members-card">
        <div className="members-card__heading">
          <div><p className="eyebrow">MIEMBROS</p><h2>{members.total} persona{members.total === 1 ? "" : "s"}</h2></div>
          <p>Las invitaciones requieren correo transaccional real.</p>
        </div>
        {memberList.length === 0 ? <p className="empty-copy">Todavía no hay miembros para mostrar.</p> : (
          <div className="members-list" role="list">
            {memberList.map((member) => (
              <div className="member-row" key={member.id} role="listitem">
                <div><strong>{member.user.name}</strong><span>{member.user.email}</span></div>
                <Badge tone={member.role === "owner" ? "brand" : "neutral"}>{member.role}</Badge>
                {member.user.id === organization.userId ? <span className="member-self">Tu cuenta</span> : null}
                <Form method="post" className="member-controls">
                  <input name="memberId" type="hidden" value={member.id} />
                  <input name="operation" type="hidden" value="update-role" />
                  <label className="sr-only" htmlFor={`role-${member.id}`}>Nuevo rol para {member.user.name}</label>
                  <select defaultValue={member.role} id={`role-${member.id}`} name="role" disabled={busy || member.role === "owner"}>
                    <option value="member">member</option><option value="admin">admin</option><option value="owner">owner</option>
                  </select>
                  <Button disabled={busy || member.role === "owner"} tone="secondary" type="submit">Guardar rol</Button>
                </Form>
                <Form method="post" className="member-controls">
                  <input name="memberId" type="hidden" value={member.id} /><input name="operation" type="hidden" value="remove" />
                  <Button disabled={busy || member.role === "owner"} tone="ghost" type="submit">Retirar</Button>
                </Form>
              </div>
            ))}
          </div>
        )}
      </Card>
      {invitations ? <Card className="members-card invitation-management-card">
        <div className="members-card__heading"><div><p className="eyebrow">INVITACIONES</p><h2>{invitations.length} pendiente{invitations.length === 1 ? "" : "s"}</h2></div><p>No se simula la entrega: el proveedor de correo está pendiente.</p></div>
        <Form className="invite-form" method="post">
          <input name="operation" type="hidden" value="invite" />
          <label>Correo<input autoComplete="email" name="email" required type="email" /></label>
          <label>Rol<select defaultValue="member" name="role"><option value="member">member</option><option value="admin">admin</option></select></label>
          <Button type="submit">Invitar</Button>
        </Form>
        {invitations.map((invitation) => <div className="member-row" key={invitation.id}><div><strong>{invitation.email}</strong><span>Rol: {invitation.role ?? "member"}</span></div><span>{invitation.status}</span><Form method="post"><input name="operation" type="hidden" value="cancel-invitation" /><input name="invitationId" type="hidden" value={invitation.id} /><Button tone="ghost" type="submit">Cancelar</Button></Form></div>)}
      </Card> : null}
    </main>
  );
}
