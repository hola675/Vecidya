import { useEffect, useRef } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";

import { getInvitationListState, invitationCreateErrorMessage } from "../../db/invitation-rules";
import { createAuth } from "../../server/auth.server";
import {
  getPermissionsForRole,
  hasPermission,
  requireOrganizationInvitationTarget,
  requireOrganizationMemberTarget,
  requireOrganizationPermission,
} from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { createAndDeliverOrganizationInvitation, isOrganizationInvitationEmailConfigured } from "../../server/email/invitation.server";
import { Alert, Badge, Button, Card } from "../components/ui";
import { ClientAreaShell } from "../components/client-area-shell";
import { describeRolePermissions, invitationStateLabels, roleLabel } from "../lib/team-labels";

import type { Route } from "./+types/organization";

export function meta() {
  return [{ title: "Equipo | Vecidya" }, { name: "description", content: "Consulta y administra el equipo de tu organización en Vecidya." }];
}

function invitationEmailConfig(env: Env) {
  return { ...env, appUrl: env.APP_URL || undefined };
}

function betterAuthErrorCode(error: unknown) {
  const body = typeof error === "object" && error && "body" in error ? (error as { body?: { code?: unknown } }).body : undefined;
  return typeof body?.code === "string" ? body.code : undefined;
}

// Fecha formateada en el servidor para que el HTML y la hidratación coincidan.
const dateFormat = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });
function formatDate(value: Date | string) {
  return dateFormat.format(new Date(value));
}

type Feedback = { scope: "members" | "invitations" | "page"; success?: string; error?: string; invited?: boolean };

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await getActiveOrganization(env, request);
  if (!organization) throw new Response("An active organization is required", { status: 403 });
  const [, shell] = await Promise.all([
    requireOrganizationPermission(env, request, organization.id, "member:read"),
    getClientWorkspaceContext(env, request),
  ]);
  const auth = createAuth(env, request);
  const members = await auth.api.listMembers({
    headers: request.headers,
    query: { organizationId: organization.id },
  });
  const now = new Date();
  // Solo una invitación pendiente y vigente cuenta como pendiente y se puede cancelar.
  const invitations = hasPermission(organization.role, "member:invite")
    ? (await auth.api.listInvitations({ headers: request.headers, query: { organizationId: organization.id } }))
      .map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        state: getInvitationListState(invitation, now),
        sentAt: formatDate(invitation.createdAt),
        expiresAt: formatDate(invitation.expiresAt),
      }))
    : null;
  // Las acciones visibles y la ayuda del formulario salen de la matriz real de permisos.
  const can = {
    updateRoles: hasPermission(organization.role, "member:role:update"),
    remove: hasPermission(organization.role, "member:remove"),
    grantOwner: organization.role === "owner",
  };
  const roleGuide = (["admin", "member"] as const).map((role) => ({ role, description: describeRolePermissions(getPermissionsForRole(role)) }));
  return { organization, members, invitations, can, roleGuide, ...shell, activeOrganization: organization };
}

export async function action({ context, request }: Route.ActionArgs): Promise<Feedback> {
  const { env } = context.get(cloudflareContext);
  const organization = await getActiveOrganization(env, request);
  if (!organization) throw new Response("An active organization is required", { status: 403 });
  const formData = await request.formData();
  const operation = String(formData.get("operation"));
  const memberId = String(formData.get("memberId"));
  const auth = createAuth(env, request, { invitationDeliveryManagedByRoute: true });

  if (operation === "update-role") {
    const role = String(formData.get("role"));
    if (!(["owner", "admin", "member"] as const).includes(role as "owner" | "admin" | "member")) {
      return { scope: "members", error: "El rol solicitado no es válido." };
    }
    await requireOrganizationPermission(env, request, organization.id, "member:role:update");
    await requireOrganizationMemberTarget(env, organization.id, memberId);
    try {
      await auth.api.updateMemberRole({
        headers: request.headers,
        body: { memberId, organizationId: organization.id, role: role as "owner" | "admin" | "member" },
      });
    } catch {
      return { scope: "members", error: "No se pudo actualizar el rol; la política de la organización lo rechazó." };
    }
    return { scope: "members", success: "Rol actualizado." };
  }

  if (operation === "remove") {
    await requireOrganizationPermission(env, request, organization.id, "member:remove");
    await requireOrganizationMemberTarget(env, organization.id, memberId);
    try {
      await auth.api.removeMember({
        headers: request.headers,
        body: { memberIdOrEmail: memberId, organizationId: organization.id },
      });
    } catch {
      return { scope: "members", error: "No se pudo retirar a esta persona; la organización debe conservar al menos un propietario." };
    }
    return { scope: "members", success: "Miembro retirado." };
  }

  if (operation === "invite") {
    const email = String(formData.get("email")).trim().toLowerCase();
    const role = String(formData.get("role"));
    if (!/^\S+@\S+\.\S+$/.test(email) || !(role === "admin" || role === "member")) {
      return { scope: "invitations", error: "Introduce un correo válido y un rol permitido." };
    }
    await requireOrganizationPermission(env, request, organization.id, "member:invite");
    if (!isOrganizationInvitationEmailConfigured(invitationEmailConfig(env))) {
      return { scope: "invitations", error: "La invitación no se creó: el envío de correos no está disponible en este momento." };
    }
    try {
      const created = await createAndDeliverOrganizationInvitation(
        () => auth.api.createInvitation({
          headers: request.headers,
          body: { email, role: role as "admin" | "member", organizationId: organization.id },
        }),
        invitationEmailConfig(env),
        organization.name,
      );
      if (created.delivery === "unconfirmed") {
        return { scope: "invitations", error: "La invitación se creó, pero no pudimos confirmar el envío del correo. No se reenviará automáticamente. Puedes cancelar la invitación desde la lista antes de crear otra." };
      }
      if (created.delivery === "simulated") {
        return { scope: "invitations", success: "Invitación creada en pruebas: este entorno no envía correos reales.", invited: true };
      }
      return { scope: "invitations", success: "Invitación creada. Gmail aceptó el correo para " + email + "; la recepción todavía no está confirmada.", invited: true };
    } catch (error) {
      return { scope: "invitations", error: invitationCreateErrorMessage(betterAuthErrorCode(error)) };
    }
  }

  if (operation === "cancel-invitation") {
    const invitationId = String(formData.get("invitationId"));
    await requireOrganizationPermission(env, request, organization.id, "member:invite");
    const target = await requireOrganizationInvitationTarget(env, organization.id, invitationId);
    if (getInvitationListState(target, new Date()) !== "pending") {
      return { scope: "invitations", error: "Esta invitación ya no está pendiente." };
    }
    try {
      await auth.api.cancelInvitation({ headers: request.headers, body: { invitationId } });
    } catch {
      return { scope: "invitations", error: "No se pudo cancelar la invitación." };
    }
    return { scope: "invitations", success: "Invitación cancelada." };
  }

  return { scope: "page", error: "Operación no reconocida." };
}

function FeedbackMessage({ result, scope }: { result: Feedback | undefined; scope: Feedback["scope"] }) {
  if (result?.scope !== scope) return null;
  if (result.error) return <Alert>{result.error}</Alert>;
  return result.success ? <p className="success-message" role="status">{result.success}</p> : null;
}

const stateTones = { pending: "brand", accepted: "success", canceled: "neutral", expired: "neutral", rejected: "neutral", unknown: "neutral" } as const;

export default function OrganizationPage() {
  const { organization, members, invitations, can, roleGuide, workspaceUser, organizations, isPlatformAdmin, activeOrganization } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const inviteFormRef = useRef<HTMLFormElement>(null);
  const memberList = members.members ?? [];
  const pendingInvitations = invitations?.filter((invitation) => invitation.state === "pending") ?? [];
  const pastInvitations = invitations?.filter((invitation) => invitation.state !== "pending") ?? [];
  const roleOptions = can.grantOwner ? (["member", "admin", "owner"] as const) : (["member", "admin"] as const);

  useEffect(() => {
    if (result?.invited) inviteFormRef.current?.reset();
  }, [result]);

  return (
    <ClientAreaShell active="organization" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="app-main organization-page" id="client-page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI ORGANIZACIÓN</p>
          <h1>{organization.name}</h1>
          <p>Consulta y administra las personas que forman parte de este espacio.</p>
        </div>
        <Badge tone="brand">Tu rol: {roleLabel(organization.role)}</Badge>
      </div>
      <FeedbackMessage result={result} scope="page" />

      <Card aria-labelledby="team-members-title" className="members-card">
        <div className="members-card__heading">
          <div><p className="eyebrow">EQUIPO</p><h2 id="team-members-title">Miembros del equipo</h2></div>
          <p>{members.total} persona{members.total === 1 ? "" : "s"}</p>
        </div>
        <FeedbackMessage result={result} scope="members" />
        {memberList.length === 0 ? <p className="empty-copy">Todavía no hay miembros para mostrar.</p> : (
          <ul className="members-list">
            {memberList.map((member) => {
              // El propietario no se edita desde aquí: Better Auth protege al owner y los controles serían inútiles.
              const editable = member.role !== "owner";
              return (
                <li className="member-row" key={member.id}>
                  <div>
                    <strong>{member.user.name}</strong>
                    <span>{member.user.email}</span>
                    {member.user.id === workspaceUser.id ? <span className="member-self">Tu cuenta</span> : null}
                  </div>
                  <Badge tone={member.role === "owner" ? "brand" : "neutral"}>{roleLabel(member.role)}</Badge>
                  {editable && can.updateRoles ? (
                    <Form method="post" className="member-controls">
                      <input name="memberId" type="hidden" value={member.id} />
                      <input name="operation" type="hidden" value="update-role" />
                      <label className="sr-only" htmlFor={`role-${member.id}`}>Nuevo rol para {member.user.name}</label>
                      <select defaultValue={member.role} id={`role-${member.id}`} name="role" disabled={busy}>
                        {roleOptions.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                      </select>
                      <Button aria-label={`Guardar rol de ${member.user.name}`} disabled={busy} tone="secondary" type="submit">Guardar rol</Button>
                    </Form>
                  ) : null}
                  {editable && can.remove ? (
                    <Form method="post" className="member-controls">
                      <input name="memberId" type="hidden" value={member.id} /><input name="operation" type="hidden" value="remove" />
                      <Button aria-label={`Retirar a ${member.user.name}`} disabled={busy} tone="ghost" type="submit">Retirar</Button>
                    </Form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {invitations ? <Card aria-labelledby="invite-title" className="members-card invitation-management-card">
        <div className="members-card__heading">
          <div><p className="eyebrow">INVITACIONES</p><h2 id="invite-title">Invitar miembro</h2></div>
        </div>
        <FeedbackMessage result={result} scope="invitations" />
        <Form className="form-grid invite-form" method="post" ref={inviteFormRef}>
          <input name="operation" type="hidden" value="invite" />
          <label>Correo electrónico<input autoComplete="email" name="email" placeholder="nombre@correo.com" required type="email" /></label>
          <label>Rol<select aria-describedby="invite-role-guide" aria-label="Rol" defaultValue="member" name="role">
            {(["admin", "member"] as const).map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
          </select></label>
          <dl className="role-guide form-grid__full" id="invite-role-guide">
            {roleGuide.map((entry) => <div key={entry.role}><dt>{roleLabel(entry.role)}</dt><dd>{entry.description}</dd></div>)}
          </dl>
          <p className="field-note form-grid__full">La persona recibirá un correo con un enlace para unirse a tu organización.</p>
          <div className="form-grid__full"><Button disabled={busy} type="submit">{busy ? "Enviando…" : "Enviar invitación"}</Button></div>
        </Form>

        <section aria-labelledby="pending-invitations-title" className="invitation-section">
          <div className="invitation-section__heading">
            <h3 id="pending-invitations-title">Invitaciones pendientes</h3>
            <p>{pendingInvitations.length} pendiente{pendingInvitations.length === 1 ? "" : "s"}</p>
          </div>
          {pendingInvitations.length === 0 ? <p className="empty-copy">Todavía no tienes invitaciones pendientes.</p> : (
            <ul className="members-list">
              {pendingInvitations.map((invitation) => (
                <li className="member-row invitation-row" key={invitation.id}>
                  <div><strong>{invitation.email}</strong><span>Creada el {invitation.sentAt} · vence el {invitation.expiresAt}</span></div>
                  <Badge>{roleLabel(invitation.role)}</Badge>
                  <Badge tone={stateTones.pending}>{invitationStateLabels.pending}</Badge>
                  <Form method="post">
                    <input name="operation" type="hidden" value="cancel-invitation" />
                    <input name="invitationId" type="hidden" value={invitation.id} />
                    <Button aria-label={`Cancelar invitación a ${invitation.email}`} disabled={busy} tone="ghost" type="submit">Cancelar invitación</Button>
                  </Form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="past-invitations-title" className="invitation-section invitation-section--history">
          <div className="invitation-section__heading"><h3 id="past-invitations-title">Historial de invitaciones</h3></div>
          {pastInvitations.length === 0 ? <p className="empty-copy">Aún no hay invitaciones anteriores.</p> : (
            <ul className="members-list">
              {pastInvitations.map((invitation) => (
                <li className="member-row invitation-row" key={invitation.id}>
                  <div><strong>{invitation.email}</strong><span>Creada el {invitation.sentAt}</span></div>
                  <Badge>{roleLabel(invitation.role)}</Badge>
                  <Badge tone={stateTones[invitation.state]}>{invitationStateLabels[invitation.state]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Card> : null}
    </main>
    </ClientAreaShell>
  );
}
