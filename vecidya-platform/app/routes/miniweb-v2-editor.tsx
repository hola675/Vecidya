import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getMiniWebV2EditorState } from "../../db/queries/miniweb-v2.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { ensureMiniWebV2Hero, miniWebV2EditorKey } from "../features/miniweb-v2/editor-state";
import { ClientAreaShell } from "../components/client-area-shell";
import { Button, Card } from "../components/ui";
import type { MiniWebV2Document } from "../features/miniweb-v2/sections";
import type { Route } from "./+types/miniweb-v2-editor";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const membership = await requireOrganizationPermission(env, request, organization.id, "business-profile:read");
  const shell = await getClientWorkspaceContext(env, request);
  const state = await getMiniWebV2EditorState(createDatabase(env.DB), organization.id);
  return { ...shell, organization: { id: organization.id, name: organization.name }, canEdit: membership.role === "owner" || membership.role === "admin", state: state ? { site: state.site, revision: state.draft.revision, document: JSON.parse(state.draft.documentJson) as MiniWebV2Document } : null };
}

type MiniWebV2EditorData = Awaited<ReturnType<typeof loader>>;

export default function MiniWebV2Editor() {
  const data = useLoaderData<typeof loader>();
  const editorKey = miniWebV2EditorKey(data.organization.id, data.state?.site.id ?? null);
  return <MiniWebV2EditorState key={editorKey} data={data} />;
}

function MiniWebV2EditorState({ data }: { data: MiniWebV2EditorData }) {
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const [document, setDocument] = useState<MiniWebV2Document>(() => ensureMiniWebV2Hero(data.state?.document));
  const [revision, setRevision] = useState(data.state?.revision ?? 0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (fetcher.data?.ok && typeof fetcher.data.revision === "number") { setRevision(fetcher.data.revision); setNotice("Borrador guardado."); }
    else if (fetcher.data?.siteId) { setNotice("Espacio V2 creado."); revalidate(); }
    else if (fetcher.data?.error) setNotice(fetcher.data.error);
  }, [fetcher.data, revalidate]);
  useEffect(() => {
    if (data.state && data.state.revision > revision) { setRevision(data.state.revision); setDocument(ensureMiniWebV2Hero(data.state.document)); }
  }, [data.state, revision]);
  const endpoint = `/api/organizations/${encodeURIComponent(data.organization.id)}/miniweb-v2`;
  const section = document.sections.find((item) => item.type === "hero");
  function updateHero(key: "title" | "subtitle", value: string) {
    setDocument((current) => ({ ...current, sections: current.sections.map((item) => item.type === "hero" ? { ...item, content: { ...item.content, [key]: value } } : item) }));
  }
  return <ClientAreaShell active="miniweb" activeOrganization={data.organization} isPlatformAdmin={data.isPlatformAdmin} organizationSwitchLocked={fetcher.state !== "idle"} organizations={data.organizations} workspaceUser={data.workspaceUser}><main className="app-page"><header><p className="eyebrow">MI VECIDYA · MINIWEB V2</p><h1>Editor V2</h1><p>Construye un borrador independiente. La publicación requiere una acción explícita.</p></header>
    {!data.canEdit ? <Card><p>Tu rol permite consultar este borrador, pero no editarlo.</p></Card> : null}
    {!data.state ? <Card><h2>Crear tu MiniWeb V2</h2><p>Se inicia un borrador nuevo. No importa contenido ni horarios de MiniWeb anterior.</p><Button disabled={!data.canEdit || fetcher.state !== "idle"} onClick={() => fetcher.submit(JSON.stringify({ operation: "create" }), { method: "post", action: endpoint, encType: "application/json" })}>Crear borrador V2</Button></Card> : <Card><h2>Portada</h2><label>Título<input value={section?.type === "hero" ? section.content.title : ""} disabled={!data.canEdit} maxLength={160} onChange={(e) => updateHero("title", e.currentTarget.value)}/></label><label>Subtítulo<textarea value={section?.type === "hero" ? section.content.subtitle : ""} disabled={!data.canEdit} maxLength={600} onChange={(e) => updateHero("subtitle", e.currentTarget.value)}/></label><p>Revisión {revision}</p><Button disabled={!data.canEdit || fetcher.state !== "idle"} onClick={() => fetcher.submit(JSON.stringify({ operation: "save", siteId: data.state!.site.id, expectedRevision: revision, document }), { method: "post", action: endpoint, encType: "application/json" })}>Guardar borrador</Button><Button tone="secondary" disabled={!data.canEdit || fetcher.state !== "idle"} onClick={() => fetcher.submit(JSON.stringify({ operation: "publish", siteId: data.state!.site.id, expectedRevision: revision }), { method: "post", action: endpoint, encType: "application/json" })}>Publicar revisión {revision}</Button></Card>}
    <p role="status" aria-live="polite">{notice}</p>
    <section aria-label="Vista previa"><h2>Vista previa</h2><Card><h3>{section?.type === "hero" && section.content.title || "Nombre del negocio"}</h3><p>{section?.type === "hero" && section.content.subtitle || "Tu presentación aparecerá aquí."}</p></Card></section>
  </main></ClientAreaShell>;
}
