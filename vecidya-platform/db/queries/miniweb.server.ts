import { and, asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { miniWebModule, miniWebSite } from "../schema";
import type { BusinessHoursEntry } from "./business-hours.server";
import { getBusinessProfileForOrganization } from "./business-profile.server";
import {
  buildSafeMiniWebConfiguration,
  buildVirtualMiniWebConfiguration,
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
    draftConfiguration = validateMiniWebDraft({
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
    });
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
) {
  const configuration = validateMiniWebDraft(draftInput);
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
  const statements = [
    database.update(miniWebSite).set({
      templateKey: configuration.templateKey,
      templateVersion: configuration.templateVersion,
      layoutVariant: configuration.layoutVariant,
      updatedAt: now,
    }).where(and(eq(miniWebSite.id, site.id), eq(miniWebSite.organizationId, organizationId))),
    database.delete(miniWebModule).where(eq(miniWebModule.miniWebSiteId, site.id)),
    database.insert(miniWebModule).values(configuration.modules.map((module) => ({
      id: crypto.randomUUID(),
      miniWebSiteId: site.id,
      moduleType: module.type,
      moduleVersion: module.moduleVersion,
      enabled: module.enabled,
      sortOrder: module.sortOrder,
      layoutVariant: module.layoutVariant,
      settingsJson: null,
      createdAt: now,
      updatedAt: now,
    }))),
  ] as const;
  await database.batch(statements);
  return configuration;
}

export async function publishMiniWebConfigurationForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileRecord | null,
  hours: readonly BusinessHoursEntry[],
) {
  let state = await getMiniWebConfigurationForOrganization(database, organizationId, profile, hours);
  if (!state.site) {
    await saveMiniWebConfigurationForOrganization(database, organizationId, profile, hours, state.draftConfiguration);
    state = await getMiniWebConfigurationForOrganization(database, organizationId, profile, hours);
  }
  if (!state.site) throw new Error("No se pudo inicializar la configuración MiniWeb para publicar.");

  const publishedConfigurationJson = serializeMiniWebConfiguration(state.draftConfiguration);
  await database.update(miniWebSite)
    .set({ publishedConfigurationJson, updatedAt: new Date() })
    .where(and(eq(miniWebSite.id, state.site.id), eq(miniWebSite.organizationId, organizationId)));
  return state.draftConfiguration;
}
