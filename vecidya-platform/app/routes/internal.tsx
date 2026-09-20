import { Link } from "react-router";

import { AdminShell } from "../components/admin-shell";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administración de Vecidya | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  return null;
}

export default function InternalHome() {
  return (
    <AdminShell active="home">
      <main className="admin-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">INICIO</p>
            <h1>Administración de Vecidya</h1>
            <p>Gestiona las capacidades de plataforma disponibles para el equipo Vecidya.</p>
          </div>
        </div>
        <div className="admin-overview-grid">
          <section className="card admin-overview-card">
            <p className="eyebrow">OPERACIÓN DISPONIBLE</p>
            <h2>Servicios</h2>
            <p>Consulta y actualiza las asignaciones de servicios de cada organización.</p>
            <Link className="button button--primary" to="/app/internal/services">Administrar servicios</Link>
          </section>
          <section className="card admin-overview-card">
            <p className="eyebrow">SIGUIENTE BLOQUE</p>
            <h2>Organizaciones</h2>
            <p>La consulta global de organizaciones corresponde a la fase 8B.</p>
          </section>
          <section className="card admin-overview-card">
            <p className="eyebrow">SIGUIENTE BLOQUE</p>
            <h2>Negocios</h2>
            <p>La administración global de perfiles corresponde a la fase 8C.</p>
          </section>
          <section className="card admin-overview-card">
            <p className="eyebrow">SIGUIENTE BLOQUE</p>
            <h2>Integraciones</h2>
            <p>El overview de conexiones genéricas corresponde a la fase 8E.</p>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
