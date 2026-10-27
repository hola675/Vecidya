import { Link, useLoaderData } from "react-router";

import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization, requireSession } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { ClientAreaShell } from "../components/client-area-shell";
import { Alert, Card } from "../components/ui";

import type { Route } from "./+types/app-diagnostic-detail";

type ResultPayload = { score: unknown; evidence: unknown; recommendations: unknown };

function parseJson(value: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(value) as unknown };
  } catch {
    return { ok: false };
  }
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const session = await requireSession(env, request);
  const workspaceId = params.workspaceId;
  const runId = params.runId;
  if (!workspaceId || !runId) throw new Response("Diagnóstico no encontrado.", { status: 404 });
  const [workspace, activeOrganization] = await Promise.all([
    getClientWorkspaceContext(env, request),
    getActiveOrganization(env, request),
  ]);
  try {
    const identity = await env.DB.prepare(
      "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
    ).bind(session.user.id).first<{ identity_id: string }>();
    if (!identity) throw new Response("Diagnóstico no encontrado.", { status: 404 });
    const row = await env.DB.prepare(
      "SELECT r.run_id,r.status,r.started_at,r.finished_at,r.last_seq,res.result_version,res.created_at AS result_created_at,res.score_json,res.evidence_json,res.recommendations_json FROM diagnostic_v9_run_ownership o JOIN diagnostic_v9_identities i ON i.identity_id=o.identity_id JOIN diagnostic_v9_runs r ON r.workspace_id=o.workspace_id AND r.run_id=o.run_id LEFT JOIN diagnostic_v9_results res ON res.workspace_id=r.workspace_id AND res.run_id=r.run_id AND res.result_version=(SELECT MAX(r2.result_version) FROM diagnostic_v9_results r2 WHERE r2.workspace_id=r.workspace_id AND r2.run_id=r.run_id) WHERE i.identity_type='user' AND i.user_id=? AND o.workspace_id=? AND o.run_id=? LIMIT 1",
    ).bind(session.user.id, workspaceId, runId).first<{
      run_id: string; status: string; started_at: string; finished_at: string | null; last_seq: number;
      result_version: number | null; result_created_at: string | null; score_json: string | null;
      evidence_json: string | null; recommendations_json: string | null;
    }>();
    if (!row) throw new Response("Diagnóstico no encontrado.", { status: 404 });
    let result: ResultPayload | null = null;
    let resultInvalid = false;
    if (row.result_version !== null && row.score_json && row.evidence_json && row.recommendations_json) {
      const score = parseJson(row.score_json);
      const evidence = parseJson(row.evidence_json);
      const recommendations = parseJson(row.recommendations_json);
      if (score.ok && evidence.ok && recommendations.ok) {
        result = { score: score.value, evidence: evidence.value, recommendations: recommendations.value };
      } else {
        resultInvalid = true;
      }
    }
    return {
      ...workspace, activeOrganization, available: true,
      run: {
        id: row.run_id, status: row.status, startedAt: row.started_at,
        finishedAt: row.finished_at, lastSeq: row.last_seq,
        resultVersion: row.result_version, resultCreatedAt: row.result_created_at,
      },
      result, resultInvalid,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    return { ...workspace, activeOrganization, available: false, run: null, result: null, resultInvalid: false };
  }
}

function JsonValue({ value }: { value: unknown }) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span>{value === null ? "Sin dato" : String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>Sin elementos</span>;
    return <ul>{value.map((item, index) => <li key={index}><JsonValue value={item} /></li>)}</ul>;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span>Sin datos</span>;
    return <dl className="diagnostic-json-list">{entries.map(([key, entry]) => (
      <div key={key}><dt>{key.replace(/[_-]+/g, " ")}</dt><dd><JsonValue value={entry} /></dd></div>
    ))}</dl>;
  }
  return <span>Dato no disponible</span>;
}

export function meta() {
  return [
    { title: "Detalle del diagnóstico | Vecidya" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AppDiagnosticDetailPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <ClientAreaShell active="diagnostics" workspaceUser={data.workspaceUser} organizations={data.organizations} activeOrganization={data.activeOrganization} isPlatformAdmin={data.isPlatformAdmin}>
      <main className="app-main account-page" id="client-page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">TU HISTORIAL PERSONAL</p>
            <h1>Detalle del diagnóstico</h1>
            <p>Este diagnóstico sigue perteneciendo a tu identidad personal, aunque lo vincules a una organización.</p>
          </div>
          <Link to="/app/diagnosticos" className="button button--secondary">Volver a mis diagnósticos</Link>
        </div>
        {!data.available || !data.run ? (
          <Alert>El detalle V9 no está disponible en este entorno.</Alert>
        ) : (
          <>
            <Card>
              <h2>Resumen de la ejecución</h2>
              <dl className="diagnostic-json-list">
                <div><dt>Identificador</dt><dd>{data.run.id}</dd></div>
                <div><dt>Estado</dt><dd>{data.run.status}</dd></div>
                <div><dt>Inicio</dt><dd>{data.run.startedAt}</dd></div>
                <div><dt>Finalización</dt><dd>{data.run.finishedAt ?? "No finalizado"}</dd></div>
                <div><dt>Eventos registrados</dt><dd>{data.run.lastSeq}</dd></div>
              </dl>
            </Card>
            {data.resultInvalid ? <Alert>El resultado guardado no supera la validación de formato y no se mostrará.</Alert> : null}
            {data.result ? (
              <>
                <Card>
                  <h2>Puntuación</h2>
                  <JsonValue value={data.result.score} />
                </Card>
                <Card>
                  <h2>Evidencias</h2>
                  <JsonValue value={data.result.evidence} />
                </Card>
                <Card>
                  <h2>Recomendaciones</h2>
                  <JsonValue value={data.result.recommendations} />
                </Card>
                <p>Versión de resultado: {data.run.resultVersion} · Guardado: {data.run.resultCreatedAt}</p>
              </>
            ) : <Card><h2>Resultado pendiente</h2><p>El historial de la ejecución existe, pero todavía no hay una versión de resultado disponible.</p></Card>}
          </>
        )}
      </main>
    </ClientAreaShell>
  );
}
