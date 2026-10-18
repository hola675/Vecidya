import { Link, useLoaderData } from "react-router";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import { listFunnelAnalytics } from "../../db/queries/diagnostic-funnel-analytics.server";
import { AdminShell } from "../components/admin-shell";
import type { Route } from "./+types/internal-diagnostic-analytics";

const EVENTS = [
  ["diagnostic_started", "Inicios"],
  ["diagnostic_completed", "Finalizados"],
  ["detailed_report_cta_clicked", "Interés en detalle"],
  ["identified_request_created", "Solicitudes identificadas"],
  ["email_verified", "Correos verificados"],
  ["detailed_report_first_opened", "Primeras aperturas"],
] as const;
type EventName = typeof EVENTS[number][0];

export function meta({}: Route.MetaArgs) {
  return [{ title: "Analítica del diagnóstico | Administración Vecidya" }];
}
export function headers() {
  return { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const url = new URL(request.url);
  const days = url.searchParams.get("days") === "7" ? 7 : url.searchParams.get("days") === "90" ? 90 : 30;
  const today = new Date();
  const cutoff = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - days + 1))
    .toISOString().slice(0, 10);
  const rows = await listFunnelAnalytics(env.DB);
  const dates = Array.from({ length: days }, (_, index) => {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - days + 1 + index));
    return day.toISOString().slice(0, 10);
  });
  const totals: Record<EventName, number> = {
    diagnostic_started: 0, diagnostic_completed: 0, detailed_report_cta_clicked: 0,
    identified_request_created: 0, email_verified: 0, detailed_report_first_opened: 0,
  };
  const series = dates.map((date) => ({ date, started: 0, completed: 0, identified: 0, verified: 0 }));
  const byDate = new Map(series.map((item) => [item.date, item]));
  for (const row of rows) {
    if (row.date < cutoff || !Object.hasOwn(totals, row.event)) continue;
    totals[row.event as EventName] += row.count;
    const day = byDate.get(row.date);
    if (!day) continue;
    if (row.event === "diagnostic_started") day.started += row.count;
    if (row.event === "diagnostic_completed") day.completed += row.count;
    if (row.event === "identified_request_created") day.identified += row.count;
    if (row.event === "email_verified") day.verified += row.count;
  }
  return { workspaceUser: access.workspaceUser, totals, series, days };
}

function Trend({ series, keyName, label }: {
  series: { date: string; started: number; completed: number; identified: number; verified: number }[];
  keyName: "started" | "completed" | "identified" | "verified"; label: string;
}) {
  const values = series.map((point) => point[keyName]);
  const max = Math.max(1, ...values);
  const points = values.map((value, index) =>
    `${(index / Math.max(1, values.length - 1)) * 100},${36 - (value / max) * 32}`).join(" ");
  return <div>
    <h3>{label}</h3>
    <svg viewBox="0 0 100 40" role="img" aria-label={`Tendencia diaria de ${label.toLowerCase()}`} style={{ width: "100%", height: 110 }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
    <p className="admin-table__meta">Máximo diario: {max === 1 && values.every((value) => value === 0) ? 0 : max}</p>
  </div>;
}

export default function InternalDiagnosticAnalytics() {
  const { workspaceUser, totals, series, days } = useLoaderData<typeof loader>();
  const ratio = (numerator: number, denominator: number) =>
    denominator > 0 ? `${(numerator / denominator * 100).toFixed(1)}%` : "Sin base";
  return <AdminShell active="diagnostic" workspaceUser={workspaceUser}>
    <main className="admin-content">
      <div className="page-heading"><div>
        <p className="eyebrow">DIAGNÓSTICO · ANALÍTICA</p>
        <h1>Resultados del embudo</h1>
        <p>Eventos agregados por día. No contiene respuestas personales ni informes individuales.</p>
      </div></div>
      <nav aria-label="Periodo de análisis" className="admin-toolbar">
        {[7, 30, 90].map((period) => <Link key={period} className="button button--secondary"
          aria-current={days === period ? "page" : undefined} to={`?days=${period}`}>Últimos {period} días</Link>)}
        <Link className="text-link" to="/app/internal/diagnostic-leads">Ver interesados →</Link>
      </nav>
      <div className="admin-stat-grid" aria-label="Indicadores del embudo">
        {EVENTS.map(([key, label]) => <section className="card admin-stat-card" key={key}>
          <div><strong>{totals[key].toLocaleString("es-CO")}</strong><p>{label}</p></div>
        </section>)}
      </div>
      <section className="card">
        <h2>Indicadores orientativos</h2>
        <p>Finalización sobre inicios: <strong>{ratio(totals.diagnostic_completed, totals.diagnostic_started)}</strong></p>
        <p>Interés en detalle sobre finalizados: <strong>{ratio(totals.detailed_report_cta_clicked, totals.diagnostic_completed)}</strong></p>
        <p>Verificaciones sobre solicitudes identificadas: <strong>{ratio(totals.email_verified, totals.identified_request_created)}</strong></p>
        <p className="admin-table__meta">Son relaciones entre eventos del periodo, no conversiones de cohortes ni usuarios únicos. Pueden superar el 100 %.</p>
      </section>
      <section className="card" aria-labelledby="diagnostic-trends-heading">
        <h2 id="diagnostic-trends-heading">Evolución diaria</h2>
        <div className="admin-overview-grid">
          <Trend series={series} keyName="started" label="Diagnósticos iniciados" />
          <Trend series={series} keyName="completed" label="Diagnósticos finalizados" />
          <Trend series={series} keyName="identified" label="Solicitudes identificadas" />
          <Trend series={series} keyName="verified" label="Correos verificados" />
        </div>
      </section>
      <section className="card">
        <h2>Datos diarios</h2>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Fecha UTC</th><th>Inicios</th><th>Finalizados</th><th>Solicitudes</th><th>Verificaciones</th></tr></thead>
          <tbody>{series.slice().reverse().map((day) => <tr key={day.date}>
            <td>{day.date}</td><td>{day.started}</td><td>{day.completed}</td><td>{day.identified}</td><td>{day.verified}</td>
          </tr>)}</tbody>
        </table></div>
      </section>
    </main>
  </AdminShell>;
}
