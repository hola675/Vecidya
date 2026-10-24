import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { getCurrentLicensePrice, getOrganizationLicense, planCodes, assignOrganizationLicense, changeOrganizationLicensePlan, setOrganizationLicenseStatus, LicensingError, isPlanCode } from "../../db/queries/licensing.server";
import { listPlatformOrganizations } from "../../db/queries/platform-organizations.server";
import { licensePrice } from "../../db/schema";
import type { PlanCode } from "../../db/pricing/calculator";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal-licenses";

const planNames: Record<PlanCode, string> = { cuadra: "Cuadra", barrio: "Barrio", ciudad: "Ciudad" };
const statusNames: Record<string, string> = { active: "Activa", pending: "Pendiente", suspended: "Suspendida", cancelled: "Cancelada" };

export function meta({}: Route.MetaArgs) { return [{ title: "Licencias por organización | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const organizations = await listPlatformOrganizations(database);
  const now = new Date();
  const [plans, rows] = await Promise.all([
    Promise.all(planCodes.map(async (code) => ({ code, price: await getCurrentLicensePrice(database, code, now) }))),
    Promise.all(organizations.map(async (organization) => {
      const license = await getOrganizationLicense(database, organization.id);
      const price = license ? await database.query.licensePrice.findFirst({ where: eq(licensePrice.id, license.priceId) }) : null;
      return { organization, license, price };
    })),
  ]);
  return { rows, plans, updated: new URL(request.url).searchParams.get("updated") === "1", workspaceUser: access.workspaceUser };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const actor = await requirePlatformAdminAction(env, request, "organization:license:update");
  const database = createDatabase(env.DB);
  const form = await request.formData();
  const organizationId = String(form.get("organizationId") ?? "");
  const intent = String(form.get("intent") ?? "");
  const organizations = await listPlatformOrganizations(database);
  const organization = organizations.find((item) => item.id === organizationId);
  if (!organization) throw new Response("Organización no encontrada", { status: 404 });

  try {
    if (intent === "assign") {
      const planCode = String(form.get("planCode") ?? "");
      const initialStatus = String(form.get("initialStatus") ?? "pending");
      if (!organization.owner || !isPlanCode(planCode) || (initialStatus !== "pending" && initialStatus !== "active")) {
        return { error: "Selecciona un propietario registrado, un plan disponible y un estado válido." };
      }
      await assignOrganizationLicense(database, {
        organizationId,
        ownerUserId: organization.owner.id,
        planCode,
        actorUserId: actor.userId,
        activate: initialStatus === "active",
      });
    } else if (intent === "change-plan") {
      const planCode = String(form.get("planCode") ?? "");
      if (!isPlanCode(planCode)) return { error: "Selecciona un plan válido." };
      await changeOrganizationLicensePlan(database, { organizationId, newPlanCode: planCode, actorUserId: actor.userId });
    } else if (intent === "suspend" || intent === "reactivate") {
      await setOrganizationLicenseStatus(database, {
        organizationId,
        status: intent === "suspend" ? "suspended" : "active",
        actorUserId: actor.userId,
      });
    } else {
      throw new Response("Acción inválida", { status: 400 });
    }
  } catch (error) {
    if (error instanceof LicensingError) return { error: error.message };
    throw error;
  }
  return redirect("/app/internal/licenses?updated=1");
}

export default function InternalLicenses() {
  const { rows, plans, updated, workspaceUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const availablePlans = plans.filter(({ price }) => price !== null);

  return <AdminShell active="licenses" workspaceUser={workspaceUser}>
    <main className="admin-main">
      <Link className="back-link" to="/app/internal">← Volver a administración</Link>
      <div className="page-heading"><div><p className="eyebrow">ACCESO A PRODUCTOS</p><h1>Licencias por organización</h1><p>Una licencia se asigna a una organización (el espacio de trabajo) y habilita capacidades para su negocio asociado.</p></div><Badge tone="neutral">{rows.length} organizaciones</Badge></div>

      <section className="card admin-attention" aria-labelledby="admin-terms-title">
        <p className="eyebrow">CÓMO SE ORGANIZA</p><h2 id="admin-terms-title">Organización y negocio son cosas distintas</h2>
        <p><strong>Organización:</strong> espacio de trabajo que reúne propietario, miembros, permisos y servicios. La licencia pertenece aquí.</p>
        <p><strong>Perfil de negocio:</strong> ficha comercial que ese espacio administra y que puede mostrarse en Vecindario. Cada organización puede tener un perfil asociado.</p>
        <p>Asignar o suspender una licencia no elimina la organización ni su perfil. Suspender una organización limita su ciclo de vida; suspender una licencia pausa capacidades licenciadas. Ninguna opción borra datos. La eliminación definitiva no está habilitada en esta pantalla.</p>
        <p>La asignación no cobra automáticamente. «Pendiente» registra el plan sin activar capacidades; «Activa» las habilita. El estado de cobro no se gestiona aquí.</p>
      </section>

      {actionData?.error ? <p className="alert alert--error" role="alert">{actionData.error}</p> : null}
      {updated ? <p className="alert alert--success" role="status">Licencia actualizada y acción registrada en auditoría.</p> : null}

      <div className="admin-overview-grid">
        {rows.map(({ organization, license, price }) => (
          <section className="card admin-detail-card" key={organization.id}>
            <p className="eyebrow">ORGANIZACIÓN</p>
            <h2>{organization.name}</h2>
            <p>{organization.slug}</p>
            <p><strong>Propietario:</strong> {organization.owner ? `${organization.owner.name} · ${organization.owner.email}` : "Sin propietario asociado"}</p>
            <p><strong>Perfil de negocio:</strong> {organization.profile?.displayName ?? "Todavía no creado"}</p>
            <p><strong>Licencia:</strong> {license ? <><Badge tone={license.status === "active" ? "success" : license.status === "suspended" ? "danger" : "neutral"}>{statusNames[license.status] ?? license.status}</Badge> {planNames[license.planCode]} · {price ? `${price.currency} ${(price.amountCents / 100).toFixed(2)} / mes` : "precio histórico"}</> : "Sin asignar"}</p>
            <Link className="text-link" to={`/app/internal/organizations/${organization.id}`}>Ver espacio de trabajo →</Link>

            {!license || license.status === "cancelled" ? (
              organization.owner && availablePlans.length ? <Form className="admin-license-form" method="post">
                <input name="organizationId" type="hidden" value={organization.id} /><input name="intent" type="hidden" value="assign" />
                <label>Plan
                  <select name="planCode" required defaultValue={availablePlans[0].code}>
                    {availablePlans.map(({ code, price: currentPrice }) => <option key={code} value={code}>{planNames[code]} · {currentPrice!.currency} {(currentPrice!.amountCents / 100).toFixed(2)} / mes</option>)}
                  </select>
                </label>
                <label>Estado inicial
                  <select name="initialStatus" defaultValue="pending"><option value="pending">Pendiente · todavía no habilita capacidades</option><option value="active">Activa · habilita capacidades</option></select>
                </label>
                <button className="button button--primary" type="submit">Asignar licencia</button>
              </Form> : <p>No se puede asignar hasta que haya un propietario registrado y un precio vigente.</p>
            ) : <div className="admin-license-actions">
              {license.status === "active" ? <>
                <Form className="admin-license-form" method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="intent" type="hidden" value="change-plan" /><label>Cambiar plan<select name="planCode" required defaultValue={availablePlans.find(({ code }) => code !== license.planCode)?.code ?? license.planCode}>{availablePlans.filter(({ code }) => code !== license.planCode).map(({ code, price: currentPrice }) => <option key={code} value={code}>{planNames[code]} · {currentPrice!.currency} {(currentPrice!.amountCents / 100).toFixed(2)} / mes</option>)}</select></label><button className="button button--secondary" disabled={!availablePlans.some(({ code }) => code !== license.planCode)} type="submit">Cambiar plan</button></Form>
                <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="intent" type="hidden" value="suspend" /><button className="button button--secondary" type="submit">Suspender licencia</button></Form>
              </> : <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="intent" type="hidden" value="reactivate" /><button className="button button--primary" type="submit">Activar licencia</button></Form>}
            </div>}
          </section>
        ))}
      </div>
    </main>
  </AdminShell>;
}
