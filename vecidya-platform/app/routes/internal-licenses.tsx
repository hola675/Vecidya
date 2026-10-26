import { useState } from "react";
import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { getCurrentLicensePrice, getOrganizationLicense, getOrganizationLicenseAuditHistory, planCodes, assignOrganizationLicense, cancelOrganizationLicense, changeOrganizationLicensePlan, setOrganizationLicenseStatus, reassignOrganizationLicenseBillingAccount, reactivateCancelledOrganizationLicense, LicensingConflictError, LicensingError, isPlanCode } from "../../db/queries/licensing.server";
import { listPlatformOrganizations } from "../../db/queries/platform-organizations.server";
import { billingAccount, licensePrice, user } from "../../db/schema";
import type { PlanCode } from "../../db/pricing/calculator";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";
import { platformAuditActionLabels } from "../lib/platform-audit-labels";

import type { Route } from "./+types/internal-licenses";

const planNames: Record<PlanCode, string> = { cuadra: "Cuadra", barrio: "Barrio", ciudad: "Ciudad" };
const statusNames: Record<string, string> = { active: "Activa", pending: "Pendiente", suspended: "Suspendida", cancelled: "Cancelada" };

export function meta({}: Route.MetaArgs) { return [{ title: "Licencias de negocios | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const organizations = await listPlatformOrganizations(database);
  const users = await database.select({ id: user.id, name: user.name, email: user.email }).from(user).orderBy(user.name);
  const billingAccounts = await database.select({ id: billingAccount.id, ownerUserId: billingAccount.ownerUserId }).from(billingAccount);
  const now = new Date();
  const [plans, rows] = await Promise.all([
    Promise.all(planCodes.map(async (code) => ({ code, price: await getCurrentLicensePrice(database, code, now) }))),
    Promise.all(organizations.map(async (organization) => {
      const [license, history] = await Promise.all([getOrganizationLicense(database, organization.id), getOrganizationLicenseAuditHistory(database, organization.id)]);
      const price = license ? await database.query.licensePrice.findFirst({ where: eq(licensePrice.id, license.priceId) }) : null;
      const billing = license ? await database.query.billingAccount.findFirst({ where: eq(billingAccount.id, license.billingAccountId) }) : null;
      const canReactivate = Boolean(license?.status === "cancelled" && license.endsAt && history.some((event) => event.action === "organization_license.cancelled" && event.entityId === license.id && event.createdAt.getTime() === license.endsAt!.getTime()));
      return { organization, license, price, billingOwnerUserId: billing?.ownerUserId ?? null, history, canReactivate };
    })),
  ]);
  return { rows, plans, users, billingAccounts, updated: new URL(request.url).searchParams.get("updated") === "1", workspaceUser: access.workspaceUser };
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
      const ownerUserId = String(form.get("ownerUserId") ?? "");
      if (!ownerUserId || !isPlanCode(planCode) || (initialStatus !== "pending" && initialStatus !== "active")) {
        return { error: "Selecciona un propietario registrado, un plan disponible y un estado válido." };
      }
      await assignOrganizationLicense(database, {
        organizationId,
        ownerUserId,
        planCode,
        actorUserId: actor.userId,
        activate: initialStatus === "active",
      });
    } else if (intent === "change-plan") {
      const planCode = String(form.get("planCode") ?? "");
      if (!isPlanCode(planCode)) return { error: "Selecciona un plan válido." };
      const currentLicenseId = String(form.get("currentLicenseId") ?? "");
      if (!currentLicenseId) return { error: "Recarga la página para confirmar la licencia actual antes de cambiar el plan." };
      await changeOrganizationLicensePlan(database, { organizationId, expectedLicenseId: currentLicenseId, newPlanCode: planCode, actorUserId: actor.userId });
    } else if (intent === "suspend") {
      const currentLicenseId = String(form.get("currentLicenseId") ?? "");
      if (!currentLicenseId) return { error: "Recarga la página para confirmar la licencia actual antes de cambiar su estado." };
      await setOrganizationLicenseStatus(database, {
        organizationId,
        expectedLicenseId: currentLicenseId,
        expectedStatus: "active",
        status: "suspended",
        actorUserId: actor.userId,
      });
    } else if (intent === "cancel") {
      const currentLicenseId = String(form.get("currentLicenseId") ?? "");
      if (!currentLicenseId) return { error: "Recarga la página para confirmar la licencia actual antes de cancelarla." };
      await cancelOrganizationLicense(database, { organizationId, expectedLicenseId: currentLicenseId, actorUserId: actor.userId });
    } else if (intent === "reactivate") {
      const currentLicenseId = String(form.get("currentLicenseId") ?? "");
      if (!currentLicenseId) return { error: "Recarga la página para confirmar la licencia actual antes de reactivarla." };
      const current = await getOrganizationLicense(database, organizationId);
      if (!current || current.id !== currentLicenseId) throw new LicensingConflictError("La licencia cambió en otra operación; recarga la página y vuelve a intentarlo.");
      if (current.status === "cancelled") {
        await reactivateCancelledOrganizationLicense(database, { organizationId, expectedLicenseId: currentLicenseId, actorUserId: actor.userId });
      } else {
        const expectedStatus = current.status === "pending" ? "pending" : "suspended";
        await setOrganizationLicenseStatus(database, { organizationId, expectedLicenseId: currentLicenseId, expectedStatus, status: "active", actorUserId: actor.userId });
      }
    } else if (intent === "transfer-billing-account") {
      const newOwnerUserId = String(form.get("newOwnerUserId") ?? "");
      const expectedLicenseId = String(form.get("currentLicenseId") ?? "");
      const expectedBillingAccountId = String(form.get("expectedBillingAccountId") ?? "");
      if (!newOwnerUserId || !expectedLicenseId || !expectedBillingAccountId) return { error: "Recarga la página para confirmar la licencia y su titular actuales." };
      await reassignOrganizationLicenseBillingAccount(database, { organizationId, newOwnerUserId, expectedLicenseId, expectedBillingAccountId, actorUserId: actor.userId });
    } else {
      throw new Response("Acción inválida", { status: 400 });
    }
  } catch (error) {
    if (error instanceof LicensingConflictError) return { error: "La licencia cambió en otra operación. Recarga la página y vuelve a intentarlo." };
    if (error instanceof LicensingError) return { error: error.message };
    throw error;
  }
  return redirect("/app/internal/licenses?updated=1");
}

export default function InternalLicenses() {
  const { rows, plans, users, billingAccounts, updated, workspaceUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [search, setSearch] = useState("");
  const availablePlans = plans.filter(({ price }) => price !== null);
  const clients = new Map<string, { name: string; email: string; rows: typeof rows }>();
  for (const row of rows) {
    const key = row.organization.owner?.id ?? `unassigned:${row.organization.id}`;
    const current = clients.get(key) ?? {
      name: row.organization.owner?.name ?? "Sin cliente titular",
      email: row.organization.owner?.email ?? "",
      rows: [],
    };
    current.rows.push(row);
    clients.set(key, current);
  }
  const query = search.trim().toLocaleLowerCase();
  const filteredClients = [...clients.entries()].filter(([, client]) => !query ||
    `${client.name} ${client.email} ${client.rows.map(({ organization }) => `${organization.profile?.displayName ?? ""} ${organization.name} ${organization.slug}`).join(" ")}`.toLocaleLowerCase().includes(query));
  const visibleBusinesses = filteredClients.reduce((total, [, client]) => total + client.rows.length, 0);

  return <AdminShell active="licenses" workspaceUser={workspaceUser}>
    <main className="admin-main">
      <Link className="back-link" to="/app/internal">← Volver a administración</Link>
      <div className="page-heading"><div><p className="eyebrow">CLIENTES Y NEGOCIOS</p><h1>Licencias de negocios</h1><p>Busca al cliente y administra la licencia de cada uno de sus negocios.</p></div><Badge tone="neutral">{rows.length} negocios</Badge></div>

      <section className="card admin-attention" aria-labelledby="admin-terms-title">
        <p className="eyebrow">LA RELACIÓN ES SIMPLE</p><h2 id="admin-terms-title">Un cliente puede tener uno o varios negocios</h2>
        <p><strong>Cliente</strong> es la persona o cuenta responsable. <strong>Negocio</strong> es cada actividad comercial que administra y a la que se asigna su propia licencia. La pantalla agrupa los negocios por cliente para que puedas encontrar y gestionar cada uno.</p>
        <p>Por dentro, cada negocio tiene un espacio de trabajo que organiza a sus miembros, permisos y servicios, y un perfil con la información que puede mostrarse en Vecindario. El perfil es único por espacio de trabajo; esos dos registros describen el mismo negocio desde el lado operativo y el público, no dos negocios que debas administrar por separado.</p>
        <p>Asignar o suspender una licencia no elimina el negocio ni su perfil. Suspender el espacio de trabajo limita su uso; suspender la licencia pausa las capacidades licenciadas. Ninguna opción borra datos. La eliminación definitiva no está habilitada en esta pantalla.</p>
        <p>La asignación no cobra automáticamente. «Pendiente» registra el plan sin activar capacidades; «Activa» las habilita. El estado de cobro no se gestiona aquí.</p>
      </section>

      {actionData?.error ? <p className="alert alert--error" role="alert">{actionData.error}</p> : null}
      {updated ? <p className="alert alert--success" role="status">Licencia actualizada y acción registrada en auditoría.</p> : null}

      <div className="admin-toolbar">
        <label className="admin-search"><Icon name="eye" /><input aria-label="Buscar cliente o negocio" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por cliente, correo o nombre del negocio…" type="search" value={search} /></label>
        <p className="admin-result-count">{visibleBusinesses} de {rows.length} negocios</p>
      </div>

      {filteredClients.map(([clientKey, client]) => <section className="admin-client-group" key={clientKey} aria-label={`Negocios de ${client.name}`}>
        <header className="admin-client-group__heading"><div><p className="eyebrow">CLIENTE</p><h2>{client.name}</h2>{client.email ? <p>{client.email}</p> : null}</div><Badge tone="neutral">{client.rows.length} {client.rows.length === 1 ? "negocio" : "negocios"}</Badge></header>
        <div className="admin-overview-grid">
        {client.rows.map((row) => { const { organization, license, price } = row; return (
          <section className="card admin-detail-card" key={organization.id}>
            <p className="eyebrow">NEGOCIO</p>
            <h2>{organization.profile?.displayName ?? organization.name}</h2>
            <p><strong>Perfil público:</strong> {organization.profile ? "Configurado" : "Todavía no creado"}</p>
            <details><summary>Referencia del espacio de trabajo</summary><p>{organization.name} · ID interno {organization.id}</p></details>
            <p><strong>Licencia:</strong> {license ? <><Badge tone={license.status === "active" ? "success" : license.status === "suspended" ? "danger" : "neutral"}>{statusNames[license.status] ?? license.status}</Badge> {planNames[license.planCode]} · {price ? `${price.currency} ${(price.amountCents / 100).toFixed(2)} / mes` : "precio histórico"}</> : "Sin asignar"}</p>
            <Link className="text-link" to={`/app/internal/organizations/${organization.id}`}>Ver espacio de trabajo →</Link>

            {license?.status === "cancelled" && row.canReactivate ? <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="intent" type="hidden" value="reactivate" /><button className="button button--primary" onClick={(event) => { if (!window.confirm("¿Reactivar esta licencia y restaurar el estado que tenía antes de cancelarla?")) event.preventDefault(); }} type="submit">Reactivar licencia anterior</button></Form> : null}
            {!license || license.status === "cancelled" ? (
              availablePlans.length && users.length ? <Form className="admin-license-form" method="post">
                <input name="organizationId" type="hidden" value={organization.id} /><input name="intent" type="hidden" value="assign" />
                <label>Titular de facturación<select name="ownerUserId" required defaultValue={organization.owner?.id ?? ""}><option value="" disabled>Selecciona una persona</option>{users.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.email}</option>)}</select></label>
                <label>Plan
                  <select name="planCode" required defaultValue={availablePlans[0].code}>
                    {availablePlans.map(({ code, price: currentPrice }) => <option key={code} value={code}>{planNames[code]} · {currentPrice!.currency} {(currentPrice!.amountCents / 100).toFixed(2)} / mes</option>)}
                  </select>
                </label>
                <label>Estado inicial
                  <select name="initialStatus" defaultValue="pending"><option value="pending">Pendiente · todavía no habilita capacidades</option><option value="active">Activa · habilita capacidades</option></select>
                </label>
                <button className="button button--primary" onClick={(event) => { if (!window.confirm("¿Asignar esta licencia y registrar la acción en auditoría?")) event.preventDefault(); }} type="submit">Asignar licencia a este negocio</button>
              </Form> : <p>No hay usuarios registrados o precios vigentes para asignar una licencia.</p>
            ) : <div className="admin-license-actions">
              {license.status === "active" ? <>
                <Form className="admin-license-form" method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="intent" type="hidden" value="change-plan" /><label>Cambiar plan<select name="planCode" required defaultValue={availablePlans.find(({ code }) => code !== license.planCode)?.code ?? license.planCode}>{availablePlans.filter(({ code }) => code !== license.planCode).map(({ code, price: currentPrice }) => <option key={code} value={code}>{planNames[code]} · {currentPrice!.currency} {(currentPrice!.amountCents / 100).toFixed(2)} / mes</option>)}</select></label><button className="button button--secondary" disabled={!availablePlans.some(({ code }) => code !== license.planCode)} onClick={(event) => { if (!window.confirm("¿Cambiar el plan de esta licencia? La acción quedará registrada en auditoría.")) event.preventDefault(); }} type="submit">Cambiar plan</button></Form>
                <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="intent" type="hidden" value="suspend" /><button className="button button--secondary" onClick={(event) => { if (!window.confirm("¿Suspender esta licencia? El negocio y sus datos se conservarán.")) event.preventDefault(); }} type="submit">Suspender licencia</button></Form>
              </> : <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="intent" type="hidden" value="reactivate" /><button className="button button--primary" onClick={(event) => { if (!window.confirm("¿Activar o reactivar esta licencia y registrar la acción?")) event.preventDefault(); }} type="submit">{license.status === "pending" ? "Activar licencia pendiente" : "Reactivar licencia"}</button></Form>}
              <Form method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="intent" type="hidden" value="cancel" /><button className="button button--secondary" onClick={(event) => { if (!window.confirm("La cancelación es inmediata y desactiva las capacidades de esta licencia. ¿Continuar?")) event.preventDefault(); }} type="submit">Cancelar licencia</button></Form>
              <Form className="admin-license-form" method="post"><input name="organizationId" type="hidden" value={organization.id} /><input name="currentLicenseId" type="hidden" value={license.id} /><input name="expectedBillingAccountId" type="hidden" value={license.billingAccountId} /><input name="intent" type="hidden" value="transfer-billing-account" /><p>Titular de facturación: {users.find((person) => person.id === row.billingOwnerUserId)?.name ?? "No disponible"}</p><label>Transferir a<select name="newOwnerUserId" required defaultValue={row.billingOwnerUserId ?? ""}><option value="" disabled>Selecciona una persona</option>{users.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.email}</option>)}</select></label><button className="button button--secondary" onClick={(event) => { if (!window.confirm("¿Transferir la facturación de este negocio? La transferencia quedará registrada en auditoría.")) event.preventDefault(); }} type="submit">Transferir facturación</button></Form>
            </div>}
            <details className="admin-license-history"><summary>Historial auditado ({row.history.length} {row.history.length === 1 ? "evento" : "eventos"})</summary>
              {row.history.length ? <ol>{row.history.map((event) => {
                const billingValue = (value: string | null) => {
                  if (!value) return "—";
                  const account = billingAccounts.find((item) => item.id === value);
                  if (account) {
                    const accountOwner = users.find((person) => person.id === account.ownerUserId);
                    return accountOwner ? `${accountOwner.name} · ${accountOwner.email}` : value;
                  }
                  return statusNames[value] ?? planNames[value as PlanCode] ?? value;
                };
                return <li key={event.id}><time dateTime={event.createdAt.toISOString()}>{new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</time> · <strong>{platformAuditActionLabels[event.action] ?? event.action}</strong> · {event.actorName} ({event.actorEmail}) · {billingValue(event.previousValue)} → {billingValue(event.newValue)}</li>;
              })}</ol> : <p>Aún no hay acciones de licencia registradas.</p>}
            </details>
          </section>
        ); })}
        </div>
      </section>)}
      {filteredClients.length === 0 ? <section className="empty-state card"><div><p className="eyebrow">SIN RESULTADOS</p><h2>No encontramos ese cliente o negocio</h2><p>Prueba con otro nombre o correo.</p></div></section> : null}
    </main>
  </AdminShell>;
}
