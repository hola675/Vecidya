import { and, asc, eq, getTableColumns, isNull, ne, or, sql } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfile, businessProfileGovernance, businessProfilePublication, member, billingAccount, organizationLicense, platformOrganizationLifecycle } from "../schema";
import { getBusinessProfilePublicationIssues } from "../business-profile-rules";
import { commitBusinessDraftMutation, ensureLegacyBusinessPublicationSnapshot, parseBusinessPublicationSnapshot } from "./business-publication.server";
import { getRenderableMiniWebModules } from "../../app/features/miniweb/render";
import { MINIWEB_MODULE_REGISTRY } from "../../app/features/miniweb/registry";
import { getVisibleNeighborhoodOfferings, matchesNeighborhoodFilters, type NeighborhoodFilters, type NeighborhoodOfferingKind, type NeighborhoodProfile } from "../../app/features/miniweb/neighborhood";

const notSuspended = or(
  isNull(businessProfileGovernance.id),
  eq(businessProfileGovernance.platformStatus, "active"),
);
const organizationNotSuspended = sql`NOT EXISTS (
  SELECT 1 FROM ${platformOrganizationLifecycle}
  WHERE ${platformOrganizationLifecycle.organizationId} = ${businessProfile.organizationId}
    AND ${platformOrganizationLifecycle.status} = ${"suspended"}
)`;

// Un perfil solo es visible mientras alguno de sus propietarios tenga una licencia activa
// en su propia cuenta de facturación. No se hereda de membresías ajenas.
const hasActiveOwnerLicense = sql`EXISTS (
  SELECT 1 FROM ${member}
  INNER JOIN ${billingAccount} ON ${billingAccount.ownerUserId} = ${member.userId}
  INNER JOIN ${organizationLicense} ON ${organizationLicense.billingAccountId} = ${billingAccount.id}
  WHERE ${member.organizationId} = ${businessProfile.organizationId}
    AND ${member.role} = ${"owner"}
    AND ${organizationLicense.organizationId} = ${businessProfile.organizationId}
    AND ${organizationLicense.status} = ${"active"}
    AND (${organizationLicense.endsAt} IS NULL OR ${organizationLicense.endsAt} > ${Date.now()})
)`;

export async function hasActiveLicenseForOrganizationOwner(database: Database, organizationId: string) {
  const [row] = await database.select({ id: member.id }).from(member)
    .innerJoin(billingAccount, eq(billingAccount.ownerUserId, member.userId))
    .innerJoin(organizationLicense, eq(organizationLicense.billingAccountId, billingAccount.id))
    .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner"), eq(organizationLicense.organizationId, organizationId), eq(organizationLicense.status, "active"), or(isNull(organizationLicense.endsAt), sql`${organizationLicense.endsAt} > ${Date.now()}`)))
    .limit(1);
  return Boolean(row);
}

export type BusinessProfileInput = {
  displayName: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  publicEmail: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  serviceMode: "in_person" | "remote" | "hybrid" | null;
  serviceArea: string | null;
};

export async function getBusinessProfileForOrganization(
  database: Database,
  organizationId: string,
) {
  return database.query.businessProfile.findFirst({
    where: eq(businessProfile.organizationId, organizationId),
  });
}

export async function getPublishedBusinessProfileBySlug(database: Database, slug: string) {
  const [row] = await database
    .select({
      ...getTableColumns(businessProfile),
      verificationStatus: businessProfileGovernance.verificationStatus,
      publicationStateId: businessProfilePublication.organizationId,
      snapshotJson: businessProfilePublication.snapshotJson,
      snapshotSchemaVersion: businessProfilePublication.snapshotSchemaVersion,
    })
    .from(businessProfile)
    .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
    .leftJoin(businessProfilePublication, eq(businessProfilePublication.organizationId, businessProfile.organizationId))
    .where(and(
      or(eq(businessProfile.slug, slug), eq(businessProfilePublication.publishedSlug, slug)),
      eq(businessProfile.status, "published"),
      notSuspended,
      organizationNotSuspended,
      hasActiveOwnerLicense,
    ))
    .limit(1);

  if (!row) return null;
  const snapshot = parseBusinessPublicationSnapshot(row.snapshotJson, row.snapshotSchemaVersion);
  if (row.publicationStateId && !snapshot) return null;
  if ((row.snapshotJson !== null || row.snapshotSchemaVersion !== null) && !snapshot) return null;
  if (snapshot && snapshot.profile.slug !== slug) return null;
  return {
    ...row,
    ...(snapshot?.profile ?? {}),
    verificationStatus: row.verificationStatus ?? "unverified",
    publicationSnapshot: snapshot,
  };
}

export type PublishedBusinessProfileFilters = NeighborhoodFilters;

function toNeighborhoodProfile(profile: BusinessProfileInput, snapshot: ReturnType<typeof parseBusinessPublicationSnapshot>): NeighborhoodProfile {
  const activeOfferings = snapshot?.offerings.filter((offering) => offering.isActive) ?? [];
  const miniwebProfile = snapshot?.profile ?? profile;
  const modules = snapshot
    ? getRenderableMiniWebModules(
      snapshot.configuration,
      miniwebProfile,
      snapshot.hours,
      activeOfferings,
      snapshot.faqs,
      snapshot.media.map((asset) => ({
        ...asset,
        publicUrl: "",
        sizeBytes: 0,
        createdAt: new Date(0),
      })),
    ).map(({ type }) => type)
    : [];
  const offerings = getVisibleNeighborhoodOfferings(snapshot?.offerings ?? [], modules);
  return {
    displayName: miniwebProfile.displayName,
    shortDescription: miniwebProfile.shortDescription,
    category: miniwebProfile.category,
    city: miniwebProfile.city,
    country: miniwebProfile.country,
    serviceArea: miniwebProfile.serviceArea,
    serviceMode: miniwebProfile.serviceMode,
    offerings: offerings.map(({ kind, title, description }) => ({ kind, title, description })),
    modules,
  };
}

export async function listPublishedBusinessProfiles(database: Database, filters: PublishedBusinessProfileFilters = {}) {
  const rows = await database
    .select({
      ...getTableColumns(businessProfile),
      publicationStateId: businessProfilePublication.organizationId,
      snapshotJson: businessProfilePublication.snapshotJson,
      snapshotSchemaVersion: businessProfilePublication.snapshotSchemaVersion,
    })
    .from(businessProfile)
    .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
    .leftJoin(businessProfilePublication, eq(businessProfilePublication.organizationId, businessProfile.organizationId))
    .where(and(
      eq(businessProfile.status, "published"),
      notSuspended,
      organizationNotSuspended,
      hasActiveOwnerLicense,
    ))
    .orderBy(asc(businessProfile.displayName), asc(businessProfile.slug));
  return rows.flatMap((row) => {
    const snapshot = parseBusinessPublicationSnapshot(row.snapshotJson, row.snapshotSchemaVersion);
    if (row.publicationStateId && !snapshot) return [];
    if ((row.snapshotJson !== null || row.snapshotSchemaVersion !== null) && !snapshot) return [];
    const profile = snapshot?.profile ?? row;
    const neighborhoodProfile = toNeighborhoodProfile(profile, snapshot);
    if (!matchesNeighborhoodFilters(neighborhoodProfile, filters)) return [];
    const mode = neighborhoodProfile.serviceMode;
    const moduleLabels = neighborhoodProfile.modules.map((type) => MINIWEB_MODULE_REGISTRY[type].label);
    const publishedLogo = snapshot?.branding.logoAssetId;
    const publishedCover = snapshot?.media.find((asset) => asset.purpose === "cover" && asset.mediaType === "image");
    return [{
      slug: profile.slug,
      displayName: profile.displayName,
      shortDescription: profile.shortDescription,
      category: profile.category,
      city: profile.city,
      country: profile.country,
      logoUrl: publishedLogo ? `/media/business/${encodeURIComponent(profile.slug)}/${encodeURIComponent(publishedLogo)}` : null,
      coverUrl: publishedCover ? `/media/business/${encodeURIComponent(profile.slug)}/${encodeURIComponent(publishedCover.id)}` : null,
      serviceArea: profile.serviceArea,
      serviceMode: mode,
      offerings: neighborhoodProfile.offerings.map(({ kind, title }) => ({ kind, title })),
      modules: neighborhoodProfile.modules,
      moduleLabels,
    }];
  }).sort((left, right) => left.displayName.localeCompare(right.displayName) || left.slug.localeCompare(right.slug));
}

export async function getPublishedBusinessProfileFilterOptions(database: Database) {
  const profiles = await listPublishedBusinessProfiles(database);
  return {
    categories: [...new Set(profiles.map(({ category }) => category).filter((value): value is string => Boolean(value)))].sort(),
    cities: [...new Set(profiles.map(({ city }) => city).filter((value): value is string => Boolean(value)))].sort(),
    serviceAreas: [...new Set(profiles.map(({ serviceArea }) => serviceArea).filter((value): value is string => Boolean(value)))].sort(),
    serviceModes: [...new Set(profiles.map(({ serviceMode }) => serviceMode).filter((value): value is string => Boolean(value)))].sort(),
    offeringKinds: [...new Set(profiles.flatMap(({ offerings }) => offerings.map(({ kind }) => kind)))].sort() as NeighborhoodOfferingKind[],
    modules: [...new Set(profiles.flatMap(({ modules }) => modules))]
      .map((type) => ({ type, label: MINIWEB_MODULE_REGISTRY[type].label }))
      .sort((left, right) => left.label.localeCompare(right.label)),
  };
}

async function assertBusinessProfileSlugAvailable(
  database: Database,
  organizationId: string,
  slug: string,
) {
  const existing = await database.query.businessProfile.findFirst({
    where: and(
      eq(businessProfile.slug, slug),
      ne(businessProfile.organizationId, organizationId),
    ),
    columns: { id: true },
  });

  if (existing) {
    throw new Response("El slug ya está en uso por otro perfil publicado o borrador.", { status: 400 });
  }
  const publishedSlug = await database.query.businessProfilePublication.findFirst({
    where: and(
      eq(businessProfilePublication.publishedSlug, slug),
      ne(businessProfilePublication.organizationId, organizationId),
    ),
    columns: { organizationId: true },
  });
  if (publishedSlug) throw new Response("El slug ya está reservado por otro perfil publicado.", { status: 400 });
}

export async function saveBusinessProfileForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileInput,
  expectedRevision: number,
) {
  await assertBusinessProfileSlugAvailable(database, organizationId, profile.slug);

  const existing = await getBusinessProfileForOrganization(database, organizationId);
  await ensureLegacyBusinessPublicationSnapshot(database, organizationId);

  if (existing?.status === "published") {
    const issues = getBusinessProfilePublicationIssues(profile);
    if (issues.length) {
      throw new Response(`Un perfil publicado no puede quedar incompleto: ${issues.join(", ")}.`, { status: 400 });
    }
  }

  const fieldColumns: Record<keyof BusinessProfileInput, string> = {
    displayName: "display_name", slug: "slug", shortDescription: "short_description", description: "description",
    category: "category", city: "city", country: "country", phone: "phone", publicEmail: "public_email",
    websiteUrl: "website_url", logoUrl: "logo_url", whatsapp: "whatsapp", instagramUrl: "instagram_url",
    facebookUrl: "facebook_url", linkedinUrl: "linkedin_url", tiktokUrl: "tiktok_url", youtubeUrl: "youtube_url",
    serviceMode: "service_mode", serviceArea: "service_area",
  };
  const fields = Object.keys(fieldColumns) as (keyof BusinessProfileInput)[];
  const columns = fields.map((key) => fieldColumns[key]);
  const values = fields.map((key) => profile[key]);
  const profileId = crypto.randomUUID();
  const now = Date.now();
  await commitBusinessDraftMutation(database, organizationId, expectedRevision, (revision, token) => [existing
    ? database.$client.prepare(`UPDATE business_profile SET ${columns.map((column) => `${column} = ?`).join(", ")}
        WHERE organization_id = ? AND EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)`)
      .bind(...values, organizationId, organizationId, revision, token)
    : database.$client.prepare(`INSERT INTO business_profile (id, organization_id, ${columns.join(", ")}, status, created_at, updated_at)
        SELECT ?, ?, ${columns.map(() => "?").join(", ")}, 'draft', ?, ?
        WHERE EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)`)
      .bind(profileId, organizationId, ...values, now, now, organizationId, revision, token)]);
  return getBusinessProfileForOrganization(database, organizationId);
}
