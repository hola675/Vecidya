import { createDatabase } from "../../db/client.server";
import { getBusinessPublicationSnapshotForOrganization } from "../../db/queries/business-publication.server";
import { member } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { createMiniWebV2Site, getMiniWebV2EditorState, getMiniWebV2PublicationCapacity, publishMiniWebV2Draft, saveMiniWebV2Draft } from "../../db/queries/miniweb-v2.server";
import { createEmptyMiniWebV2Document, validateMiniWebV2Document } from "../features/miniweb-v2/sections";
import { convertPublishedV1ContentToV2 } from "../features/miniweb-v2/conversion";
import { isMiniWebV2Family, isMiniWebV2Variant, MINIWEB_V2_FAMILY_CATALOG } from "../features/miniweb-v2/visual-families";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization, requireSession } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { Route } from "./+types/api-miniweb-v2";

async function contextFor(args: Route.LoaderArgs | Route.ActionArgs) {
  const { env } = args.context.get(cloudflareContext);
  const organization = await requireOrganization(env, args.request);
  if (organization.id !== args.params.organizationId) throw new Response("La organización activa no coincide.", { status: 403 });
  return { env, organization, database: createDatabase(env.DB) };
}

export async function loader(args: Route.LoaderArgs) {
  const { env, organization, database } = await contextFor(args);
  await requireOrganizationPermission(env, args.request, organization.id, "business-profile:read");
  const requestedSiteId = new URL(args.request.url).searchParams.get("site");
  const state = await getMiniWebV2EditorState(database, organization.id, requestedSiteId ?? undefined);
  return Response.json({ state: state ? { site: state.site, draft: { revision: state.draft.revision, document: JSON.parse(state.draft.documentJson) } } : null });
}

export async function action(args: Route.ActionArgs) {
  const { env, organization, database } = await contextFor(args);
  const session = await requireSession(env, args.request);
  const raw = await args.request.text();
  if (new TextEncoder().encode(raw).byteLength > 128_000) return Response.json({ error: "El documento excede el tamaño permitido." }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (input.operation === "create") {
    await requireOrganizationPermission(env, args.request, organization.id, "business-profile:update");
    const id = crypto.randomUUID();
    const [owner] = await database.select({ userId: member.userId }).from(member).where(and(eq(member.organizationId, organization.id), eq(member.role, "owner"))).limit(1);
    if (!owner) return Response.json({ error: "La organización no tiene un titular activo." }, { status: 409 });
    const familyKey = isMiniWebV2Family(input.familyKey) ? input.familyKey : "vecidya-default";
    const visualVariant = isMiniWebV2Variant(input.visualVariant) ? input.visualVariant : "base";
    const document = createEmptyMiniWebV2Document(MINIWEB_V2_FAMILY_CATALOG[familyKey].initialSections);
    await createMiniWebV2Site(database, { id, organizationId: organization.id, ownerUserId: owner.userId, familyKey, visualVariant });
    const saved = await saveMiniWebV2Draft(database, { siteId: id, organizationId: organization.id, actorUserId: session.user.id, expectedRevision: 0, schemaVersion: 1, documentJson: JSON.stringify(document) });
    if (!saved.ok) return Response.json({ error: "No fue posible inicializar el borrador." }, { status: 409 });
    return Response.json({ ok: true, siteId: id, revision: saved.revision }, { status: 201 });
  }
  if (input.operation === "create-from-published-v1") {
    await requireOrganizationPermission(env, args.request, organization.id, "business-profile:update");
    if (input.confirm !== true) return Response.json({ error: "Se requiere confirmar la conversión voluntaria." }, { status: 400 });
    const familyKey = isMiniWebV2Family(input.familyKey) ? input.familyKey : null;
    const visualVariant = isMiniWebV2Variant(input.visualVariant) ? input.visualVariant : null;
    if (!familyKey || !visualVariant) return Response.json({ error: "Selecciona una familia y variante visual válidas." }, { status: 400 });
    const { publishedVersion, snapshot } = await getBusinessPublicationSnapshotForOrganization(database, organization.id);
    if (!publishedVersion || !snapshot) return Response.json({ error: "No hay una publicación V1 disponible para importar." }, { status: 409 });
    const [owner] = await database.select({ userId: member.userId }).from(member).where(and(eq(member.organizationId, organization.id), eq(member.role, "owner"))).limit(1);
    if (!owner) return Response.json({ error: "La organización no tiene un titular activo." }, { status: 409 });
    const converted = convertPublishedV1ContentToV2({
      profile: snapshot.profile,
      offerings: snapshot.offerings.map((item) => ({ id: crypto.randomUUID(), kind: item.kind, title: item.title, description: item.description, imageAssetId: item.imageAssetId ?? null, isActive: item.isActive })),
      faqs: snapshot.faqs.map((item) => ({ id: crypto.randomUUID(), question: item.question, answer: item.answer, isActive: item.isActive })),
      media: snapshot.media.map((asset) => ({ id: asset.id, purpose: asset.purpose, altText: asset.altText, mediaType: asset.mediaType })),
      branding: snapshot.branding,
    });
    const report = { migrationVersion: 1, sourcePublicationVersion: publishedVersion, imported: converted.imported, omitted: ["horario V1 (exclusión absoluta)", "configuración y estilos V1", "datos privados/CRM", "referencias de media no incluidas en la publicación"] };
    const siteId = crypto.randomUUID();
    const created = await createMiniWebV2Site(database, {
      id: siteId, organizationId: organization.id, ownerUserId: owner.userId, familyKey, visualVariant,
      documentJson: JSON.stringify(converted.document),
      conversion: { sourceOrganizationId: organization.id, sourcePublicationVersion: publishedVersion, reportJson: JSON.stringify(report), consentedAt: new Date(), consentedByUserId: session.user.id },
    });
    return Response.json({ ok: true, ...created, imported: converted.imported, siteId }, { status: 201 });
  }
  if (input.operation === "save") {
    await requireOrganizationPermission(env, args.request, organization.id, "business-profile:update");
    if (typeof input.siteId !== "string" || !Number.isSafeInteger(input.expectedRevision)) return Response.json({ error: "Revisión inválida." }, { status: 400 });
    const validation = validateMiniWebV2Document(input.document);
    if (!validation.valid) return Response.json({ error: "El documento MiniWeb V2 no cumple el contrato.", details: validation.errors }, { status: 400 });
    const saved = await saveMiniWebV2Draft(database, { siteId: input.siteId, organizationId: organization.id, actorUserId: session.user.id, expectedRevision: input.expectedRevision as number, schemaVersion: validation.value.schemaVersion, documentJson: JSON.stringify(validation.value) });
    return saved.ok ? Response.json(saved) : Response.json({ error: "El borrador cambió. Recarga antes de guardar.", code: "REVISION_CONFLICT" }, { status: 409 });
  }
  if (input.operation === "publish") {
    await requireOrganizationPermission(env, args.request, organization.id, "business-profile:publish");
    if (typeof input.siteId !== "string" || !Number.isSafeInteger(input.expectedRevision)) return Response.json({ error: "Revisión inválida." }, { status: 400 });
    const current = await getMiniWebV2EditorState(database, organization.id, input.siteId);
    if (!current || current.site.id !== input.siteId || current.draft.revision !== input.expectedRevision) return Response.json({ error: "La revisión cambió.", code: "REVISION_CONFLICT" }, { status: 409 });
    const validation = validateMiniWebV2Document(JSON.parse(current.draft.documentJson), { publishable: true });
    if (!validation.valid) return Response.json({ error: "El borrador no se puede publicar.", details: validation.errors }, { status: 400 });
    const capacity = await getMiniWebV2PublicationCapacity(database, current.site.ownerUserId);
    const published = await publishMiniWebV2Draft(database, { siteId: input.siteId, organizationId: organization.id, actorUserId: session.user.id, expectedRevision: input.expectedRevision as number, publicationId: crypto.randomUUID(), capacity: capacity.capacity });
    if (published.ok) return Response.json(published);
    return published.reason === "capacity" ? Response.json({ error: "No hay cupos de publicación disponibles para el titular.", code: "PUBLICATION_CAPACITY" }, { status: 409 }) : Response.json({ error: "La revisión ya cambió; vuelve a cargar el borrador.", code: "REVISION_CONFLICT" }, { status: 409 });
  }
  return Response.json({ error: "Operación no permitida." }, { status: 400 });
}
