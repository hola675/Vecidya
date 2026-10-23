import { eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfile, businessProfilePublication, miniWebSite } from "../schema";
import { listBusinessHoursForOrganization, type BusinessHoursEntry } from "./business-hours.server";
import { getBusinessProfileForOrganization, type BusinessProfileInput } from "./business-profile.server";
import { getBusinessProfilePublicationIssues } from "../business-profile-rules";
import { getMiniWebConfigurationForOrganization } from "./miniweb.server";
import type { MiniWebConfiguration } from "../../app/features/miniweb/registry";

export const BUSINESS_PUBLICATION_SCHEMA_VERSION = 1;
type BatchItem = ReturnType<Database["$client"]["prepare"]>;

export type BusinessPublicationSnapshot = {
  schemaVersion: typeof BUSINESS_PUBLICATION_SCHEMA_VERSION;
  profile: BusinessProfileInput & { logoUrl: string | null };
  hours: BusinessHoursEntry[];
  configuration: MiniWebConfiguration;
};

export function serializeBusinessPublicationSnapshot(snapshot: BusinessPublicationSnapshot) {
  return JSON.stringify(snapshot);
}

export function parseBusinessPublicationSnapshot(value: string | null, schemaVersion: number | null): BusinessPublicationSnapshot | null {
  if (!value || schemaVersion !== BUSINESS_PUBLICATION_SCHEMA_VERSION) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const snapshot = parsed as Partial<BusinessPublicationSnapshot>;
    if (snapshot.schemaVersion !== BUSINESS_PUBLICATION_SCHEMA_VERSION
      || !snapshot.profile || typeof snapshot.profile !== "object"
      || !Array.isArray(snapshot.hours)
      || !snapshot.configuration || typeof snapshot.configuration !== "object") return null;
    return snapshot as BusinessPublicationSnapshot;
  } catch {
    return null;
  }
}

function createBusinessPublicationSnapshot(
  profile: NonNullable<Awaited<ReturnType<typeof getBusinessProfileForOrganization>>>,
  hours: BusinessHoursEntry[],
  configuration: MiniWebConfiguration,
): BusinessPublicationSnapshot {
  return {
    schemaVersion: BUSINESS_PUBLICATION_SCHEMA_VERSION,
    profile: {
      slug: profile.slug,
      displayName: profile.displayName,
      shortDescription: profile.shortDescription,
      description: profile.description,
      category: profile.category,
      city: profile.city,
      country: profile.country,
      phone: profile.phone,
      publicEmail: profile.publicEmail,
      websiteUrl: profile.websiteUrl,
      logoUrl: profile.logoUrl,
      whatsapp: profile.whatsapp,
      instagramUrl: profile.instagramUrl,
      facebookUrl: profile.facebookUrl,
      linkedinUrl: profile.linkedinUrl,
      serviceMode: profile.serviceMode as BusinessProfileInput["serviceMode"],
      serviceArea: profile.serviceArea,
    },
    hours,
    configuration,
  };
}

export async function ensureBusinessPublicationState(database: Database, organizationId: string) {
  await database.insert(businessProfilePublication).values({ organizationId, updatedAt: new Date() }).onConflictDoNothing();
  const row = await database.query.businessProfilePublication.findFirst({
    where: eq(businessProfilePublication.organizationId, organizationId),
  });
  if (!row) throw new Error("No se pudo inicializar el estado de publicación.");
  return row;
}

export async function getBusinessDraftRevision(database: Database, organizationId: string) {
  const state = await database.query.businessProfilePublication.findFirst({
    where: eq(businessProfilePublication.organizationId, organizationId),
  });
  return state?.draftRevision ?? 0;
}

export async function ensureLegacyBusinessPublicationSnapshot(database: Database, organizationId: string) {
  const state = await database.query.businessProfilePublication.findFirst({ where: eq(businessProfilePublication.organizationId, organizationId) });
  if (state?.snapshotJson) return state;
  const profile = await getBusinessProfileForOrganization(database, organizationId);
  if (profile?.status !== "published") return state ?? null;
  const [hours] = await Promise.all([listBusinessHoursForOrganization(database, organizationId)]);
  const miniweb = await getMiniWebConfigurationForOrganization(database, organizationId, profile, hours);
  const snapshot = createBusinessPublicationSnapshot(profile, hours, miniweb.publishedConfiguration);
  const serialized = serializeBusinessPublicationSnapshot(snapshot);
  await database.insert(businessProfilePublication).values({
    organizationId,
    draftRevision: state?.draftRevision ?? 0,
    draftWriteToken: state?.draftWriteToken ?? null,
    publishedVersion: 1,
    publishedSlug: snapshot.profile.slug,
    snapshotSchemaVersion: BUSINESS_PUBLICATION_SCHEMA_VERSION,
    snapshotJson: serialized,
    updatedAt: new Date(),
  }).onConflictDoNothing();
  return database.query.businessProfilePublication.findFirst({ where: eq(businessProfilePublication.organizationId, organizationId) });
}

export async function commitBusinessDraftMutation(
  database: Database,
  organizationId: string,
  expectedRevision: number,
  updates: (revision: number, token: string) => BatchItem[],
) {
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    throw new Response("La versión del borrador no es válida. Recarga la página.", { status: 409 });
  }
  const token = crypto.randomUUID();
  const nextRevision = expectedRevision + 1;
  const now = Date.now();
  await database.$client.batch([
    database.$client.prepare("INSERT OR IGNORE INTO business_profile_publication (organization_id, updated_at) VALUES (?, ?)").bind(organizationId, now),
    database.$client.prepare("UPDATE business_profile_publication SET draft_revision = ?, draft_write_token = ?, updated_at = ? WHERE organization_id = ? AND draft_revision = ?")
      .bind(nextRevision, token, now, organizationId, expectedRevision),
    ...updates(nextRevision, token),
  ]);
  const state = await database.query.businessProfilePublication.findFirst({
    where: eq(businessProfilePublication.organizationId, organizationId),
  });
  if (state?.draftRevision !== nextRevision || state.draftWriteToken !== token) {
    throw new Response("El borrador cambió desde que lo abriste. Recarga la página antes de guardar.", { status: 409 });
  }
  return state;
}

export async function publishBusinessPublicationForOrganization(database: Database, organizationId: string, expectedRevision: number, audit?: { actorUserId: string }) {
  const [profile, hours, state] = await Promise.all([
    getBusinessProfileForOrganization(database, organizationId),
    listBusinessHoursForOrganization(database, organizationId),
    ensureBusinessPublicationState(database, organizationId),
  ]);
  if (!profile) throw new Response("Completa la información del negocio antes de publicar.", { status: 400 });
  if (state.draftRevision !== expectedRevision) throw new Response("El borrador cambió desde que lo abriste. Recarga la página antes de publicar.", { status: 409 });
  const issues = getBusinessProfilePublicationIssues(profile);
  if (issues.length) throw new Response(`Completa estos campos antes de publicar: ${issues.join(", ")}.`, { status: 400 });

  const miniweb = await getMiniWebConfigurationForOrganization(database, organizationId, profile, hours);
  const snapshot = createBusinessPublicationSnapshot(profile, hours, miniweb.draftConfiguration);
  const serialized = serializeBusinessPublicationSnapshot(snapshot);
  const now = new Date();
  const publishToken = crypto.randomUUID();
  const nextDraftRevision = expectedRevision + 1;
  const update = database.$client.prepare(`UPDATE business_profile_publication SET draft_revision = ?, draft_write_token = ?,
    published_version = published_version + 1, published_slug = ?, snapshot_schema_version = ?, snapshot_json = ?, updated_at = ?
    WHERE organization_id = ? AND draft_revision = ? AND published_version = ?`)
    .bind(nextDraftRevision, publishToken, snapshot.profile.slug, BUSINESS_PUBLICATION_SCHEMA_VERSION, serialized, now.getTime(), organizationId, expectedRevision, state.publishedVersion);
  const auditStatement = audit ? database.$client.prepare(`INSERT INTO platform_audit_log (
    id, actor_user_id, action, entity_type, entity_id, organization_id,
    previous_value, new_value, metadata, created_at
  ) SELECT ?, ?, ?, ?, COALESCE((SELECT id FROM miniweb_site WHERE organization_id = ?), ?), ?, NULL, ?, NULL, ?
  WHERE EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND published_version = ? AND snapshot_json = ?)`)
    .bind(crypto.randomUUID(), audit.actorUserId, "organization.miniweb.publish", "miniweb_site", organizationId, organizationId, organizationId, serialized, now.getTime(), organizationId, state.publishedVersion + 1, serialized) : null;
  await database.$client.batch([
    update,
    database.$client.prepare(`UPDATE business_profile SET status = 'published' WHERE organization_id = ? AND EXISTS (
      SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND published_version = ? AND snapshot_json = ?
    )`).bind(organizationId, organizationId, state.publishedVersion + 1, serialized),
    database.$client.prepare(`UPDATE miniweb_site SET published_configuration_json = ?, updated_at = ? WHERE organization_id = ? AND EXISTS (
      SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND published_version = ? AND snapshot_json = ?
    )`).bind(JSON.stringify(snapshot.configuration), now.getTime(), organizationId, organizationId, state.publishedVersion + 1, serialized),
    ...(auditStatement ? [auditStatement] : []),
  ]);
  const latest = await database.query.businessProfilePublication.findFirst({ where: eq(businessProfilePublication.organizationId, organizationId) });
  if (latest?.publishedVersion !== state.publishedVersion + 1 || latest.snapshotJson !== serialized || latest.draftRevision !== nextDraftRevision || latest.draftWriteToken !== publishToken) {
    throw new Response("El borrador cambió durante la publicación. Recarga la página e inténtalo de nuevo.", { status: 409 });
  }
  return { profile, snapshot, state: latest };
}
