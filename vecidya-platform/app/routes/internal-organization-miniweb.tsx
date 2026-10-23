import { Form, Link, useLoaderData } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getMiniWebConfigurationForOrganization, saveMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { getMiniWebContentForOrganization } from "../../db/queries/miniweb-content.server";
import { listBusinessMediaForOrganization } from "../../db/queries/business-media.server";
import { createBusinessPublicationSnapshot, getBusinessPublicationSnapshotForOrganization, isBusinessPublicationCurrent, readConsistentBusinessDraft, publishBusinessPublicationForOrganization } from "../../db/queries/business-publication.server";
import { hasActiveLicenseForOrganizationOwner } from "../../db/queries/business-profile.server";
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
  const { data: state, draftRevision } = await readConsistentBusinessDraft(database, organization.id, async () => {
    const [profile, hours] = await Promise.all([getBusinessProfileForOrganization(database, organization.id), listBusinessHoursForOrganization(database, organization.id)]);
    const [configuration, publication, content, media] = await Promise.all([
      getMiniWebConfigurationForOrganization(database, organization.id, profile, hours),
      getBusinessPublicationSnapshotForOrganization(database, organization.id),
      getMiniWebContentForOrganization(database, organization.id),
      listBusinessMediaForOrganization(database, organization.id),
    ]);
    const currentSnapshot = profile?.status === "published"
      ? createBusinessPublicationSnapshot(profile, hours, configuration.draftConfiguration, content.offerings, content.faqs, media)
      : null;
    return {
      draftConfiguration: configuration.draftConfiguration,
      hasProfile: Boolean(profile),
      published: isBusinessPublicationCurrent(publication.publishedVersion, publication.snapshot, currentSnapshot),
    };
  });
  return { organization, configuration: state.draftConfiguration, draftRevision, hasProfile: state.hasProfile, published: state.published, workspaceUser: access.workspaceUser };
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
  const expectedRevision = Number(form.get("draftRevision"));
  if (intent === "save") {
    let configuration: unknown;
    try { configuration = JSON.parse(String(form.get("configuration") ?? "")); }
    catch { throw new Response("El borrador debe contener JSON válido", { status: 400 }); }
    await saveMiniWebConfigurationForOrganization(database, organization.id, profile, hours, configuration, { actorUserId: actor.userId }, expectedRevision);
  } else if (intent === "publish") {
    if (!await hasActiveLicenseForOrganizationOwner(database, organization.id)) throw new Response("La organización requiere una licencia activa para publicar.", { status: 400 });
    await publishBusinessPublicationForOrganization(database, organization.id, expectedRevision, { actorUserId: actor.userId });
  } else throw new Response("Acción inválida", { status: 400 });
  return Response.redirect(new URL(`/app/internal/organizations/${organization.id}/miniweb`, request.url), 303);
}

export default function InternalOrganizationMiniWeb() {
  const { organization, configuration, draftRevision, hasProfile, published, workspaceUser } = useLoaderData<typeof loader>();
  return <AdminShell active="organizations" workspaceUser={workspaceUser}><main className="admin-main">
    <Link className="back-link" to={`/app/internal/organizations/${organization.id}`}>← Volver a {organization.name}</Link>
    <div className="page-heading"><div><p className="eyebrow">MINIWEB</p><h1>Configuración de {organization.name}</h1><p>Las acciones se registran en la auditoría de la organización.</p></div></div>
    <Card><h2>Borrador de configuración</h2><Form method="post" className="form-stack"><input name="draftRevision" type="hidden" value={draftRevision} /><textarea aria-label="Configuración JSON" name="configuration" defaultValue={JSON.stringify(configuration, null, 2)} rows={24} spellCheck={false} /><Button type="submit" name="intent" value="save" tone="secondary">Guardar borrador</Button></Form>
      <Form method="post"><input name="draftRevision" type="hidden" value={draftRevision} /><Button type="submit" name="intent" value="publish" disabled={!hasProfile || published}>Publicar MiniWeb</Button></Form>
      <p>{!hasProfile ? "Completa el perfil antes de publicar." : published ? "El perfil, los horarios y la configuración coinciden con la versión publicada." : "Hay cambios de borrador pendientes de publicación."}</p>
    </Card>
  </main></AdminShell>;
}
