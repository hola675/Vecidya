import { Form, Link } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getLearnPersonalState, hideLearnRecent, resetLearnGuide, setLearnFavorite } from "../../db/queries/learn-personal.server";
import { learnArticles } from "../content/learn";
import { getLearnEditorialIdentity, getLearnGuideAccess } from "../content/learn-publication";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { getActiveOrganization } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { ClientAreaShell } from "../components/client-area-shell";
import type { Route } from "./+types/learn-personal";

export function meta() { return [{ title: "Mi aprendizaje | Vecidya" }]; }

export function headers() { return { "Cache-Control": "private, no-store" }; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const [{ workspaceUser, organizations, isPlatformAdmin }, activeOrganization] = await Promise.all([getClientWorkspaceContext(env, request), getActiveOrganization(env, request)]);
  const state = await getLearnPersonalState(createDatabase(env.DB), workspaceUser.id);
  const guides = new Map(learnArticles.filter((item) => !item.editorialDraft).map((article) => { const identity = getLearnEditorialIdentity(article); return [identity.guideId, { article: identity, access: getLearnGuideAccess(identity.slug)! }]; }));
  const sectionMap = new Map<string, string[]>();
  for (const row of state.sections) sectionMap.set(row.guideId, [...(sectionMap.get(row.guideId) ?? []), row.sectionId]);
  const progress = state.guides.flatMap((row) => {
    const item = guides.get(row.guideId); if (!item) return [];
    const sectionIds = new Set(item.article.sections.map((section) => section.sectionId));
    const checkedCount = (sectionMap.get(row.guideId) ?? []).filter((id) => sectionIds.has(id)).length;
    return [{ guideId: row.guideId, slug: item.article.slug, title: item.article.title, access: item.access, sectionCount: sectionIds.size, checkedCount, percent: Math.round((checkedCount / sectionIds.size) * 100), lastSectionId: row.lastSectionId && sectionIds.has(row.lastSectionId) ? row.lastSectionId : null, hidden: Boolean(row.hiddenRecentAt), updatedAt: row.lastActivityAt }];
  });
  const favorites = state.favorites.flatMap((guideId) => { const item = guides.get(guideId); return item ? [{ guideId, slug: item.article.slug, title: item.article.title, access: item.access }] : []; });
  return { workspaceUser, organizations, isPlatformAdmin, activeOrganization, progress, favorites };
}

export async function action({ context, request }: Route.ActionArgs) {
  const origin = request.headers.get("Origin"); if (!origin || origin !== new URL(request.url).origin) throw new Response("Origen no permitido", { status: 403 });
  const { env } = context.get(cloudflareContext); const { workspaceUser } = await getClientWorkspaceContext(env, request);
  const form = await request.formData(); const guideId = form.get("guideId"); const intent = form.get("intent");
  if (typeof guideId !== "string") throw new Response("Guía inválida", { status: 400 });
  const article = learnArticles.find((item) => !item.editorialDraft && getLearnEditorialIdentity(item).guideId === guideId);
  if (!article) throw new Response("Guía inválida", { status: 400 });
  const identity = getLearnEditorialIdentity(article);
  const database = createDatabase(env.DB);
  if (intent === "reset") await resetLearnGuide(database, workspaceUser.id, guideId, identity.contentRevision);
  else if (intent === "hide") await hideLearnRecent(database, workspaceUser.id, guideId);
  else if (intent === "favorite" || intent === "unfavorite") await setLearnFavorite(database, workspaceUser.id, guideId, intent === "favorite");
  else throw new Response("Acción inválida", { status: 400 });
  return { ok: true };
}

export default function LearnPersonal({ loaderData }: Route.ComponentProps) {
  const { workspaceUser, organizations, activeOrganization, isPlatformAdmin, progress, favorites } = loaderData;
  return <ClientAreaShell active="learn" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="app-main" id="client-page-content"><div className="page-heading"><div><p className="eyebrow">APRENDIZAJE PERSONAL</p><h1>Mi aprendizaje</h1><p>Tu avance es privado y pertenece a tu cuenta. Solo se completa una sección cuando tú la marcas.</p></div><Link className="button button--secondary" to="/aprende">Explorar guías</Link></div>
      <section className="card"><h2>Seguir aprendiendo</h2>{progress.filter((item) => !item.hidden && item.checkedCount > 0).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).map((item) => <article className="learn-personal-item" key={item.guideId}><div><h3>{item.title}</h3><p>Mi avance: {item.percent}% · {item.checkedCount === item.sectionCount ? "Completada" : "En curso"} · {item.access === "licensed" ? "requiere acceso vigente para continuar" : "guía abierta"}</p>{item.lastSectionId && <Link to={`/aprende/${item.slug}#${item.lastSectionId}`}>Continuar leyendo →</Link>}</div><Form method="post"><input type="hidden" name="guideId" value={item.guideId}/><button className="text-link" name="intent" value="hide">Ocultar de recientes</button><button className="text-link" name="intent" value="reset">Reiniciar progreso</button></Form></article>)}{!progress.some((item) => !item.hidden && item.checkedCount > 0) && <p>Aún no tienes progreso guardado. Abre una guía y marca manualmente las secciones que completes.</p>}</section>
      <section className="card"><h2>Favoritos</h2>{favorites.length ? favorites.map((item) => <article className="learn-personal-item" key={item.guideId}><div><h3>{item.title}</h3><p>{item.access === "licensed" ? "El favorito no concede acceso al contenido." : "Guía abierta"}</p><Link to={`/aprende/${item.slug}`}>Abrir guía →</Link></div><Form method="post"><input type="hidden" name="guideId" value={item.guideId}/><button className="text-link" name="intent" value="unfavorite">Quitar de favoritos</button></Form></article>) : <p>Guarda guías para encontrarlas aquí, incluso cuando estén protegidas por licencia.</p>}</section>
    </main>
  </ClientAreaShell>;
}
