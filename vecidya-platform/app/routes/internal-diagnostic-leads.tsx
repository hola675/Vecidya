import { useLoaderData, Link } from "react-router";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import { AdminShell } from "../components/admin-shell";
import type { Route } from "./+types/internal-diagnostic-leads";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Interesados del diagnóstico | Vecidya Admin" }];
}

type LeadRow = {
  id: string;
  fullName: string;
  businessName: string | null;
  email: string;
  createdAt: number;
  verified: boolean;
  commercialOptIn: boolean;
  researchOptIn: boolean;
};

/** Admin-only, read-only. No report JSON, challenge tokens, or access digests. */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const url = new URL(request.url);
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, 10000) : 1;
  const limit = 25;
  const rows = await env.DB.prepare(`SELECT r.id, r.full_name AS fullName,
      r.business_name AS businessName, r.email, r.created_at AS createdAt,
      CASE WHEN r.status = 'verified' THEN 1 ELSE 0 END AS verified,
      CASE WHEN r.status = 'verified' AND c.id IS NOT NULL AND c.revoked_at IS NULL THEN 1 ELSE 0 END AS commercialOptIn,
      CASE WHEN r.status = 'verified' AND s.id IS NOT NULL AND s.revoked_at IS NULL THEN 1 ELSE 0 END AS researchOptIn
    FROM identified_diagnostic_request r
    LEFT JOIN commercial_contact_intent c ON c.request_id = r.id
    LEFT JOIN diagnostic_research_intent s ON s.request_id = r.id
    WHERE r.expires_at > ?
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT ? OFFSET ?`).bind(Date.now(), limit + 1, (page - 1) * limit).all<{
      id: string; fullName: string; businessName: string | null; email: string;
      createdAt: number; verified: number; commercialOptIn: number; researchOptIn: number;
    }>();
  const records = rows.results ?? [];
  const leads: LeadRow[] = records.slice(0, limit).map((row) => ({
    id: row.id, fullName: row.fullName, businessName: row.businessName,
    email: row.email, createdAt: row.createdAt, verified: row.verified === 1,
    commercialOptIn: row.commercialOptIn === 1, researchOptIn: row.researchOptIn === 1,
  }));
  return { workspaceUser: access.workspaceUser, leads, page, hasNext: records.length > limit };
}

export function headers() {
  return { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
}

export default function InternalDiagnosticLeads() {
  const { workspaceUser, leads, page, hasNext } = useLoaderData<typeof loader>();
  return <AdminShell active="home" workspaceUser={workspaceUser}>
    <main className="admin-content">
      <div className="page-heading"><div>
        <p className="eyebrow">DIAGNÓSTICO · VECIDYA</p>
        <h1>Interesados del diagnóstico</h1>
        <p>Consulta interna de solicitudes vigentes. Sin sincronización con GHL ni acciones comerciales automáticas.</p>
      </div></div>
      <section className="card">
        <p>Solo administración de plataforma. Los permisos son independientes: un diagnóstico no implica autorización para contactar.</p>
        {leads.length ? <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Solicitante</th><th>Negocio</th><th>Fecha</th><th>Correo verificado</th><th>Contacto comercial</th><th>Investigación</th></tr></thead>
          <tbody>{leads.map((lead) => <tr key={lead.id}>
            <td><strong>{lead.fullName}</strong><span className="admin-table__meta">{lead.email}</span></td>
            <td>{lead.businessName || "No indicado"}</td>
            <td>{new Date(lead.createdAt).toLocaleDateString("es-CO")}</td>
            <td>{lead.verified ? "Sí" : "Pendiente"}</td>
            <td>{lead.commercialOptIn ? "Autorizado" : "No autorizado"}</td>
            <td>{lead.researchOptIn ? "Autorizado" : "No autorizado"}</td>
          </tr>)}</tbody>
        </table></div> : <p>No hay solicitudes vigentes en esta página.</p>}
        <nav aria-label="Paginación de interesados">
          {page > 1 && <Link className="text-link" to={`?page=${page - 1}`}>← Anterior</Link>}
          <span> Página {page} </span>
          {hasNext && <Link className="text-link" to={`?page=${page + 1}`}>Siguiente →</Link>}
        </nav>
      </section>
    </main>
  </AdminShell>;
}
