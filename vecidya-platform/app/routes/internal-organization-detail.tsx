import { Form, Link, redirect, useActionData, useLoaderData, useLocation } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPlatformOrganizationDetail, listPlatformOrganizationOptions, updatePlatformTeamRole } from "../../db/queries/platform-organizations.server";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformReadAccess } from "../../server/platform-authorization.server";
import { requirePlatformAdminAction } from "../../server/platform-authorization.server";
import { platformOrganizationLifecycle, platformOwnerInvitation } from "../../db/schema";
import { and, desc, eq } from "drizzle-orm";
import { replacePlatformOwnerInvitation, revokePlatformOwnerInvitation, setPlatformOrganizationStatus } from "../../db/queries/platform-organization-lifecycle.server";
import { isPlatformOwnerInvitationEmailConfigured, sendPlatformOwnerInvitation } from "../../server/email/platform-owner-invitation.server";

import type { Route } from "./+types/internal-organization-detail";

export function meta({}: Route.MetaArgs) { return [{ title: "Detalle de organización | Administración Vecidya" }]; }

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformReadAccess(env, request);
  const detail = await getPlatformOrganizationDetail(createDatabase(env.DB), params.organizationId);
  if (!detail) throw new Response("Organización no encontrada", { status: 404 });
  const database = createDatabase(env.DB);
  const organizationOptions = await listPlatformOrganizationOptions(database);
  const [lifecycle, invitation] = await Promise.all([
    database.query.platformOrganizationLifecycle.findFirst({ where: eq(platformOrganizationLifecycle.organizationId, params.organizationId) }),
    database.query.platformOwnerInvitation.findFirst({ where: and(eq(platformOwnerInvitation.organizationId, params.organizationId), eq(platformOwnerInvitation.status, "pending")), orderBy: [desc(platformOwnerInvitation.createdAt)] }),
  ]);
  return { ...detail, lifecycle, invitation, organizationOptions, delivery: new URL(request.url).searchParams.get("delivery"), invitationEmailConfigured: isPlatformOwnerInvitationEmailConfigured(env), workspaceUser: access.workspaceUser, platformRole: access.role };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const database = createDatabase(env.DB);
  const intent = String(form.get("intent") ?? "");
  let delivery: "provider_accepted" | "simulated" | "unconfirmed" | undefined;
  if (intent === "suspend" || intent === "activate") {
    const actor = await requirePlatformAdminAction(env, request, "organization:lifecycle:update");
    await setPlatformOrganizationStatus(database, { organizationId: params.organizationId, actorUserId: actor.userId, status: intent === "suspend" ? "suspended" : "active" });
  } else if (intent === "invite" || intent === "resend") {
    const actor = await requirePlatformAdminAction(env, request, "organization:create");
    if (!isPlatformOwnerInvitationEmailConfigured(env)) throw new Response("El correo no está configurado", { status: 503 });
    const invite = await replacePlatformOwnerInvitation(database, { organizationId: params.organizationId, actorUserId: actor.userId });
    const organization = await database.query.organization.findFirst({ where: (table, { eq: equals }) => equals(table.id, params.organizationId) });
    if (!organization) throw new Response("Organización no encontrada", { status: 404 });
    try {
      const sent = await sendPlatformOwnerInvitation({ invitationId: invite.invitationId, token: invite.rawToken, email: invite.ownerEmail, organizationName: organization.name }, env);
      delivery = sent.provider === "fake" ? "simulated" : "provider_accepted";
    } catch {
      delivery = "unconfirmed";
      console.error("PLATFORM_OWNER_INVITATION_DELIVERY_UNCONFIRMED", { invitationId: invite.invitationId });
    }
  } else if (intent === "revoke") {
    const actor = await requirePlatformAdminAction(env, request, "organization:create");
    await revokePlatformOwnerInvitation(database, { organizationId: params.organizationId, actorUserId: actor.userId });
  } else if (intent === "team-role") {
    const actor = await requirePlatformAdminAction(env, request, "team:role:update");
    const memberId = String(form.get("memberId") ?? "");
    const role = String(form.get("role") ?? "");
    if (role !== "admin" && role !== "member") throw new Response("Rol inválido", { status: 400 });
    await updatePlatformTeamRole(database, { organizationId: params.organizationId, memberId, role, actorUserId: actor.userId });
  } else {
    throw new Response("Acción inválida", { status: 400 });
  }
  const routeBase = new URL(request.url).pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  return redirect(`${routeBase}/organizations/${params.organizationId}${delivery ? `?delivery=${delivery}` : ""}`);
}

const serviceStatus = { active: "Activo", pending: "Pendiente", suspended: "Suspendido", ended: "Finalizado" } as const;
const integrationStatus = { active: "Activa", pending: "Pendiente", inactive: "Inactiva", error: "Error" } as const;

export default function InternalOrganizationDetail() {
  const location = useLocation();
  const routeBase = location.pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  const { organization, members, profile, services, integrations, organizationOptions, workspaceUser, platformRole, lifecycle, invitation, invitationEmailConfigured, delivery } = useLoaderData<typeof loader>();
  return (
    <AdminShell active="organizations" workspaceUser={workspaceUser} platformRole={platformRole} organizationOptions={organizationOptions} selectedOrganizationId={organization.id}>
      <main className="admin-main">
        <Link className="back-link" to={`${routeBase}/organizations`}>← Volver a organizaciones</Link>
        <div className="page-heading"><div><p className="eyebrow">ORGANIZACIÓN</p><h1>{organization.name}</h1><p>{organization.slug}</p></div><Badge tone={profile?.status === "published" ? "success" : "neutral"}>{profile ? profile.status === "published" ? "Perfil publicado" : "Perfil borrador" : "Sin perfil"}</Badge></div>
        <div className="admin-detail-grid">
          {platformRole === "platform_admin" ? <section className="card admin-detail-card"><p className="eyebrow">ESTADO DE LA ORGANIZACIÓN</p><h2>{lifecycle?.status ?? "legacy"}</h2><p>La organización es el espacio de trabajo de un negocio: contiene miembros, permisos y servicios. Suspenderla cambia su ciclo operativo; conserva los datos y no elimina el perfil ni la licencia.</p>{delivery === "unconfirmed" ? <p role="status">El proveedor no confirmó el envío; revisa el correo y usa «Reenviar invitación» solo si hace falta.</p> : delivery === "simulated" ? <p role="status">El correo quedó simulado por el proveedor local.</p> : delivery === "provider_accepted" ? <p role="status">El proveedor aceptó el mensaje para envío.</p> : null}{lifecycle?.status === "owner_invited" ? <p>Invitación para {lifecycle.intendedOwnerEmail} · vence {invitation?.expiresAt.toLocaleDateString("es") ?? ""}</p> : null}{lifecycle ? <Form method="post"><input type="hidden" name="intent" value={lifecycle.status === "suspended" ? "activate" : "suspend"} /><button className="button button--secondary" type="submit">{lifecycle.status === "suspended" ? "Reactivar organización" : "Suspender organización"}</button></Form> : <p>Organización anterior al control de ciclo de vida; requiere migración administrativa antes de suspenderla.</p>}{lifecycle?.status === "owner_invited" || lifecycle?.status === "pending_owner" ? <><Form method="post"><input type="hidden" name="intent" value={invitation ? "resend" : "invite"} /><button className="button button--secondary" type="submit" disabled={!invitationEmailConfigured}>{invitation ? "Reenviar invitación" : "Invitar propietario"}</button></Form>{invitation ? <Form method="post"><input type="hidden" name="intent" value="revoke" /><button className="button button--secondary" type="submit">Revocar invitación</button></Form> : null}</> : null}<Link className="button button--secondary" to={`${routeBase}/licenses`}>Administrar su licencia</Link></section> : null}
          <section className="card admin-detail-card"><p className="eyebrow">OWNER</p>{members.filter((member) => member.role === "owner").map((member) => <div key={member.id}><h2>{member.name}</h2><p>{member.email}</p></div>)}{!members.some((member) => member.role === "owner") ? <p>No hay owner registrado.</p> : null}</section>
          <section className="card admin-detail-card"><p className="eyebrow">PERFIL DE NEGOCIO</p>{profile ? <><h2>{profile.displayName}</h2><p>{profile.shortDescription ?? "Sin descripción corta."}</p><p>Es la ficha comercial pública de esta organización; no es otro espacio de trabajo.</p><Link className="text-link" to={`/vecindario/${profile.slug}`}>Ver perfil público →</Link></> : <p>Esta organización todavía no tiene un perfil de negocio.</p>}</section>
          <section className="card admin-detail-card"><p className="eyebrow">MIEMBROS · {members.length}</p><ul className="admin-detail-list">{members.map((member) => <li key={member.id}><span>{member.name}<small>{member.email}</small></span>{platformRole === "platform_admin" && member.role !== "owner" ? <Form method="post"><input type="hidden" name="intent" value="team-role" /><input type="hidden" name="memberId" value={member.id} /><select name="role" defaultValue={member.role}><option value="admin">admin</option><option value="member">member</option></select><button className="button button--secondary" type="submit">Guardar rol</button></Form> : <Badge>{member.role}</Badge>}</li>)}</ul><p>El rol owner queda excluido; esta pantalla no transfiere ni elimina propietarios.</p></section>
          <section className="card admin-detail-card"><p className="eyebrow">SERVICIOS · {services.length}</p>{services.length ? <ul className="admin-detail-list">{services.map((service) => <li key={service.code}><span>{service.name}<small>{service.description ?? "Servicio Vecidya"}</small></span><Badge tone={service.status === "active" ? "success" : "neutral"}>{serviceStatus[service.status as keyof typeof serviceStatus] ?? service.status}</Badge></li>)}</ul> : <p>Sin servicios asignados.</p>}<Link className="button button--secondary" to={`${routeBase}/services?organizationId=${organization.id}`}>Administrar servicios de esta organización</Link></section>
          <section className="card admin-detail-card"><p className="eyebrow">INTEGRACIONES · {integrations.length}</p>{integrations.length ? <ul className="admin-detail-list">{integrations.map((integration) => <li key={`${integration.provider}-${integration.externalId}`}><span>{integration.provider}<small>{integration.externalId}</small></span><Badge tone={integration.status === "active" ? "success" : "neutral"}>{integrationStatus[integration.status as keyof typeof integrationStatus] ?? integration.status}</Badge></li>)}</ul> : <p>Sin conexiones genéricas registradas.</p>}<Link className="button button--secondary" to={`${routeBase}/integrations?organizationId=${organization.id}`}>Ver integraciones de esta organización</Link></section>
          {platformRole === "platform_admin" ? <section className="card admin-detail-card"><p className="eyebrow">CAPACITACIÓN</p><h2>Aprendizaje</h2><p>Asigna artículos existentes y revisa el avance declarado por cada miembro.</p><Link className="button button--secondary" to={`${routeBase}/organizations/${organization.id}/training`}>Administrar capacitación</Link></section> : null}
          {platformRole === "platform_admin" ? <section className="card admin-detail-card"><p className="eyebrow">MINIWEB</p><h2>Configuración</h2><p>Guarda un borrador o publica explícitamente para la organización.</p><Link className="button button--secondary" to={`${routeBase}/organizations/${organization.id}/miniweb`}>Administrar MiniWeb</Link></section> : null}
        </div>
      </main>
    </AdminShell>
  );
}
