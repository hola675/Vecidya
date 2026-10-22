import { Form, Link, useLoaderData } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getMiniWebConfigurationForOrganization, publishMiniWebConfigurationForOrganization, saveMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { AdminShell } from "../components/admin-shell";
import { Button, Card } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdminAction } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-organization-miniweb";

export function meta() { return [{ title: "MiniWeb | Administración Vecidya" }]; }

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdminAction(env, request, "miniweb:save");
  const database = createDatabase(env.DB);
  const organization = await database.query.organization.findFirst({ where: (table, { eq }) => eq(table.id, params.organizationId) });
  if (!organization) throw new Response("Organización no encontrada", { status: 404 });
  const [profile, hours] = await Promise.all([getBusinessProfileForOrganization(database, organization.id), listBusinessHoursForOrganization(database, organization.id)]);
  const state = await getMiniWebConfigurationForOrganization(database, organization.id, profile, hours);
  return { organization, configuration: state.draftConfiguration, published: JSON.stringify(state.draftConfiguration) === JSON.stringify(state.publishedConfiguration), workspaceUser: access.workspaceUser };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const permission = intent === "publish" ? "miniweb:publish" : "miniweb:save";
  const actor = await requirePlatformAdminAction(env, request, permission);
  const database = createDatabase(env.DB);
  const organization = await database.query.organization.findFirst({ where: (table, { eq }) => eq(table.id, params.organizationId) });
  if (!organization) throw new Response("Organización no encontrada", { status: 404 });
  const [profile, hours] = await Promise.all([getBusinessProfileForOrganization(database, organization.id), listBusinessHoursForOrganization(database, organization.id)]);
  if (intent === "save") {
    let configuration: unknown;
    try { configuration = JSON.parse(String(form.get("configuration") ?? "")); }
    catch { throw new Response("El borrador debe contener JSON válido", { status: 400 }); }
    await saveMiniWebConfigurationForOrganization(database, organization.id, profile, hours, configuration, { actorUserId: actor.userId });
  } else if (intent === "publish") {
    await publishMiniWebConfigurationForOrganization(database, organization.id, profile, hours, { actorUserId: actor.userId });
  } else throw new Response("Acción inválida", { status: 400 });
  return Response.redirect(new URL(`/app/internal/organizations/${organization.id}/miniweb`, request.url), 303);
}

export default function InternalOrganizationMiniWeb() {
  const { organization, configuration, published, workspaceUser } = useLoaderData<typeof loader>();
  return <AdminShell active="organizations" workspaceUser={workspaceUser}><main className="admin-main">
    <Link className="back-link" to={`/app/internal/organizations/${organization.id}`}>← Volver a {organization.name}</Link>
    <div className="page-heading"><div><p className="eyebrow">MINIWEB</p><h1>Configuración de {organization.name}</h1><p>Las acciones se registran en la auditoría de la organización.</p></div></div>
    <Card><h2>Borrador de configuración</h2><Form method="post" className="form-stack"><textarea aria-label="Configuración JSON" name="configuration" defaultValue={JSON.stringify(configuration, null, 2)} rows={24} spellCheck={false} /><Button type="submit" name="intent" value="save" tone="secondary">Guardar borrador</Button></Form>
      <Form method="post"><Button type="submit" name="intent" value="publish" disabled={published}>Publicar MiniWeb</Button></Form>
      <p>{published ? "El borrador coincide con la versión publicada." : "Hay cambios de borrador pendientes de publicación."}</p>
    </Card>
  </main></AdminShell>;
}
