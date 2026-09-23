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
      <main className="admin-main admin-dashboard">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES</p>
            <h1>Administración de Vecidya</h1>
            <p>Consulta la información de plataforma y accede a las tareas operativas disponibles.</p>
          </div>
        </div>
        <section className="admin-dashboard-hero" aria-label="Resumen de herramientas administrativas">
          <div>
            <span className="admin-dashboard-hero__mark" aria-hidden="true">V</span>
            <div><p className="eyebrow">VECIDYA · OPERACIONES</p><h2>Una vista clara para cuidar el ecosistema.</h2><p>Revisa perfiles, organizaciones, servicios y actividad administrativa desde sus espacios de gestión.</p></div>
          </div>
          <img alt="Panel ilustrado de herramientas digitales" height={1254} loading="lazy" src="/assets/selected/illustrations/illus-platform-growth-dashboard.webp" width={1254} />
        </section>
        <div className="admin-overview-grid">
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></svg></span>
            <p className="eyebrow">ASIGNACIONES</p><h2>Servicios</h2>
            <p>Consulta y actualiza los estados de servicios asociados a cada organización.</p>
            <Link className="text-link" to="/app/internal/services">Abrir servicios <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--orange" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15M1 21h22M7 8h5m-5 4h5m-5 4h5m7-7h1a2 2 0 0 1 2 2v10m-5-8h2m-2 4h2" /></svg></span>
            <p className="eyebrow">ESPACIOS DE TRABAJO</p><h2>Organizaciones</h2>
            <p>Consulta propietarios, miembros, perfiles, servicios e integraciones por organización.</p>
            <Link className="text-link" to="/app/internal/organizations">Ver organizaciones <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--green" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-7h6v7M9 10h.01M15 10h.01" /></svg></span>
            <p className="eyebrow">DIRECTORIO</p><h2>Perfiles de negocio</h2>
            <p>Revisa estado, completitud y presencia pública de los perfiles registrados.</p>
            <Link className="text-link" to="/app/internal/businesses">Ver perfiles <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--violet" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 7V4m8 3V4M7 11h10m-8 5h6m-8 4h10a3 3 0 0 0 3-3V8H4v9a3 3 0 0 0 3 3Z" /></svg></span>
            <p className="eyebrow">CONEXIONES</p><h2>Integraciones</h2>
            <p>Consulta metadata de conexiones registradas, sin conectar ni modificar proveedores.</p>
            <Link className="text-link" to="/app/internal/integrations">Ver integraciones <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card admin-overview-card--wide">
            <span className="admin-overview-card__icon admin-overview-card__icon--dark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8m-8 4h5" /></svg></span>
            <div className="admin-overview-card__copy"><p className="eyebrow">TRAZABILIDAD</p><h2>Auditoría</h2><p>Consulta acciones de gobierno sobre perfiles: actor, operación, estado y fecha.</p></div>
            <Link className="text-link" to="/app/internal/audit">Abrir auditoría <span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
