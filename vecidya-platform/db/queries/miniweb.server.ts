import { and, asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { miniWebModule, miniWebSite } from "../schema";
import type { BusinessHoursEntry } from "./business-hours.server";
import { getBusinessProfileForOrganization } from "./business-profile.server";
import { commitBusinessDraftMutation, ensureLegacyBusinessPublicationSnapshot, getBusinessDraftRevision, publishBusinessPublicationForOrganization } from "./business-publication.server";
import { buildMiniWebContentReplacementStatements } from "./miniweb-content.server";
import type { BusinessFaqItem, BusinessOffering } from "../../app/features/miniweb/content";
import {
  buildSafeMiniWebConfiguration,
  buildVirtualMiniWebConfiguration,
  ensureAvailableMiniWebModules,
  parseMiniWebConfigurationJson,
  serializeMiniWebConfiguration,
  validateMiniWebDraft,
  type MiniWebConfiguration,
  type MiniWebProfileSource,
} from "../../app/features/miniweb/registry";

type BusinessProfileRecord = Awaited<ReturnType<typeof getBusinessProfileForOrganization>>;

function toProfileSource(profile: BusinessProfileRecord | null): MiniWebProfileSource {
  return {
    displayName: profile?.displayName ?? "",
    shortDescription: profile?.shortDescription ?? null,
    description: profile?.description ?? null,
    phone: profile?.phone ?? null,
    publicEmail: profile?.publicEmail ?? null,
    websiteUrl: profile?.websiteUrl ?? null,
    whatsapp: profile?.whatsapp ?? null,
    instagramUrl: profile?.instagramUrl ?? null,
    facebookUrl: profile?.facebookUrl ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    category: profile?.category ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    serviceMode: profile?.serviceMode ?? null,
    serviceArea: profile?.serviceArea ?? null,
  };
}

function virtualConfiguration(profile: BusinessProfileRecord | null, hours: readonly BusinessHoursEntry[]) {
  return buildVirtualMiniWebConfiguration(toProfileSource(profile), hours);
}

export async function getMiniWebConfigurationForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileRecord | null,
  hours: readonly BusinessHoursEntry[],
) {
  const site = await database.query.miniWebSite.findFirst({
    where: eq(miniWebSite.organizationId, organizationId),
  });
  const virtual = virtualConfiguration(profile, hours);
  if (!site) {
    return {
      site: null,
      hasPersistedConfiguration: false,
      draftConfiguration: virtual,
      publishedConfiguration: virtual,
    };
  }

  const rows = await database.query.miniWebModule.findMany({
    where: eq(miniWebModule.miniWebSiteId, site.id),
    orderBy: [asc(miniWebModule.sortOrder), asc(miniWebModule.moduleType)],
  });
  let draftConfiguration: MiniWebConfiguration;
  try {
    draftConfiguration = ensureAvailableMiniWebModules(validateMiniWebDraft({
      templateKey: site.templateKey,
      templateVersion: site.templateVersion,
      layoutVariant: site.layoutVariant,
      modules: rows.map((row) => ({
        type: row.moduleType,
        moduleVersion: row.moduleVersion,
        enabled: row.enabled,
        sortOrder: row.sortOrder,
        layoutVariant: row.layoutVariant,
        settings: row.settingsJson === null ? null : JSON.parse(row.settingsJson),
      })),
    }));
  } catch {
    draftConfiguration = virtual;
  }

  return {
    site,
    hasPersistedConfiguration: true,
    draftConfiguration,
    publishedConfiguration: site.publishedConfigurationJson === null
      ? virtual
      : parseMiniWebConfigurationJson(site.publishedConfigurationJson) ?? buildSafeMiniWebConfiguration(),
  };
}

export async function saveMiniWebConfigurationForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileRecord | null,
  hours: readonly BusinessHoursEntry[],
  draftInput: unknown,
  audit?: { actorUserId: string },
  expectedRevision?: number,
  content?: { offerings: BusinessOffering[]; faqs: BusinessFaqItem[] },
) {
  const configuration = validateMiniWebDraft(draftInput);
  await ensureLegacyBusinessPublicationSnapshot(database, organizationId);
  let site = await database.query.miniWebSite.findFirst({
    where: eq(miniWebSite.organizationId, organizationId),
  });

  if (!site) {
    const template = configuration;
    const baseline = profile?.status === "published"
      ? serializeMiniWebConfiguration(virtualConfiguration(profile, hours))
      : null;
    await database.insert(miniWebSite).values({
      id: crypto.randomUUID(),
      organizationId,
      templateKey: template.templateKey,
      templateVersion: template.templateVersion,
      layoutVariant: template.layoutVariant,
      publishedConfigurationJson: baseline,
    }).onConflictDoNothing({ target: miniWebSite.organizationId });
    site = await database.query.miniWebSite.findFirst({
      where: eq(miniWebSite.organizationId, organizationId),
    });
    if (!site) throw new Error("No se pudo inicializar la configuración MiniWeb.");
  }

  const now = new Date();
  const currentRevision = expectedRevision ?? await getBusinessDraftRevision(database, organizationId);
  const statements = (nextRevision: number, token: string) => [
    database.$client.prepare(`UPDATE miniweb_site SET template_key = ?, template_version = ?, layout_variant = ?, updated_at = ?
      WHERE id = ? AND organization_id = ? AND EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)`)
      .bind(configuration.templateKey, configuration.templateVersion, configuration.layoutVariant, now.getTime(), site.id, organizationId, organizationId, nextRevision, token),
    database.$client.prepare(`DELETE FROM miniweb_module WHERE miniweb_site_id = ? AND EXISTS (
      SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?
    )`).bind(site.id, organizationId, nextRevision, token),
    ...Array.from({ length: Math.ceil(configuration.modules.length / 4) }, (_, chunkIndex) => {
      const modules = configuration.modules.slice(chunkIndex * 4, chunkIndex * 4 + 4);
      return database.$client.prepare(`INSERT INTO miniweb_module
        (id, miniweb_site_id, module_type, module_version, enabled, sort_order, layout_variant, settings_json, created_at, updated_at)
        ${modules.map(() => "SELECT ?, ?, ?, ?, ?, ?, ?, NULL, ?, ? WHERE EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)").join(" UNION ALL ")}`)
        .bind(...modules.flatMap((module) => [crypto.randomUUID(), site.id, module.type, module.moduleVersion, module.enabled ? 1 : 0, module.sortOrder, module.layoutVariant, now.getTime(), now.getTime(), organizationId, nextRevision, token]));
    }),
    ...(audit ? [database.$client.prepare(`INSERT INTO platform_audit_log
      (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at)
      SELECT ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?
      WHERE EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)`).bind(
        crypto.randomUUID(), audit.actorUserId, "organization.miniweb.save", "miniweb_site", site.id, organizationId,
        JSON.stringify({ templateKey: configuration.templateKey, modules: configuration.modules.map(({ type, enabled, sortOrder }) => ({ type, enabled, sortOrder })) }), now.getTime(), organizationId, nextRevision, token,
      )] : []),
    ...(content ? buildMiniWebContentReplacementStatements(database, organizationId, content.offerings, content.faqs, nextRevision, token) : []),
  ];
  const state = await commitBusinessDraftMutation(database, organizationId, currentRevision, statements);
  return { configuration, draftRevision: state.draftRevision };
}

export async function publishMiniWebConfigurationForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileRecord | null,
  hours: readonly BusinessHoursEntry[],
  audit?: { actorUserId: string },
) {
  const revision = await getBusinessDraftRevision(database, organizationId);
  await publishBusinessPublicationForOrganization(database, organizationId, revision, audit);
  return (await getMiniWebConfigurationForOrganization(database, organizationId, profile, hours)).draftConfiguration;
}
