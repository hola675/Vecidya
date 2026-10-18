import { and, asc, eq, getTableColumns, isNotNull, isNull, ne, or, sql } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfile, businessProfileGovernance, member, billingAccount, organizationLicense } from "../schema";
import { getBusinessProfilePublicationIssues } from "../business-profile-rules";

const notSuspended = or(
  isNull(businessProfileGovernance.id),
  eq(businessProfileGovernance.platformStatus, "active"),
);

// Un perfil solo es visible mientras alguno de sus propietarios tenga una licencia activa
// en su propia cuenta de facturación. No se hereda de membresías ajenas.
const hasActiveOwnerLicense = sql`EXISTS (
  SELECT 1 FROM ${member}
  INNER JOIN ${billingAccount} ON ${billingAccount.ownerUserId} = ${member.userId}
  INNER JOIN ${organizationLicense} ON ${organizationLicense.billingAccountId} = ${billingAccount.id}
  WHERE ${member.organizationId} = ${businessProfile.organizationId}
    AND ${member.role} = ${"owner"}
    AND ${organizationLicense.status} = ${"active"}
    AND (${organizationLicense.endsAt} IS NULL OR ${organizationLicense.endsAt} > ${Date.now()})
)`;

export async function hasActiveLicenseForOrganizationOwner(database: Database, organizationId: string) {
  const [row] = await database.select({ id: member.id }).from(member)
    .innerJoin(billingAccount, eq(billingAccount.ownerUserId, member.userId))
    .innerJoin(organizationLicense, eq(organizationLicense.billingAccountId, billingAccount.id))
    .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner"), eq(organizationLicense.status, "active"), or(isNull(organizationLicense.endsAt), sql`${organizationLicense.endsAt} > ${Date.now()}`)))
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
  const [profile] = await database
    .select({
      ...getTableColumns(businessProfile),
      verificationStatus: businessProfileGovernance.verificationStatus,
    })
    .from(businessProfile)
    .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
    .where(and(
      eq(businessProfile.slug, slug),
      eq(businessProfile.status, "published"),
      notSuspended,
      hasActiveOwnerLicense,
    ))
    .limit(1);

  if (!profile) return null;
  return { ...profile, verificationStatus: profile.verificationStatus ?? "unverified" };
}

export type PublishedBusinessProfileFilters = { q?: string; category?: string; city?: string };

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listPublishedBusinessProfiles(database: Database, filters: PublishedBusinessProfileFilters = {}) {
  const search = filters.q ? escapeLikePattern(filters.q) : undefined;

  return database
    .select({
      slug: businessProfile.slug,
      displayName: businessProfile.displayName,
      shortDescription: businessProfile.shortDescription,
      category: businessProfile.category,
      city: businessProfile.city,
      country: businessProfile.country,
      logoUrl: businessProfile.logoUrl,
    })
    .from(businessProfile)
    .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
    .where(and(
      eq(businessProfile.status, "published"),
      notSuspended,
      hasActiveOwnerLicense,
      search ? sql`${businessProfile.displayName} LIKE ${`%${search}%`} ESCAPE '\\'` : undefined,
      filters.category ? eq(businessProfile.category, filters.category) : undefined,
      filters.city ? eq(businessProfile.city, filters.city) : undefined,
    ))
    .orderBy(asc(businessProfile.displayName), asc(businessProfile.slug));
}

export async function getPublishedBusinessProfileFilterOptions(database: Database) {
  const [categories, cities] = await Promise.all([
    database.selectDistinct({ value: businessProfile.category }).from(businessProfile).leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id)).where(and(eq(businessProfile.status, "published"), notSuspended, hasActiveOwnerLicense, isNotNull(businessProfile.category), ne(businessProfile.category, ""))).orderBy(asc(businessProfile.category)),
    database.selectDistinct({ value: businessProfile.city }).from(businessProfile).leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id)).where(and(eq(businessProfile.status, "published"), notSuspended, hasActiveOwnerLicense, isNotNull(businessProfile.city), ne(businessProfile.city, ""))).orderBy(asc(businessProfile.city)),
  ]);
  return { categories: categories.map(({ value }) => value).filter((value): value is string => value !== null), cities: cities.map(({ value }) => value).filter((value): value is string => value !== null) };
}

export async function publishBusinessProfileForOrganization(
  database: Database,
  organizationId: string,
) {
  const currentProfile = await getBusinessProfileForOrganization(database, organizationId);
  if (!currentProfile) return null;

  const issues = getBusinessProfilePublicationIssues(currentProfile);
  if (issues.length) {
    throw new Response(`Completa estos campos antes de publicar: ${issues.join(", ")}.`, { status: 400 });
  }

  const [profile] = await database
    .update(businessProfile)
    .set({ status: "published" })
    .where(eq(businessProfile.organizationId, organizationId))
    .returning();
  return profile ?? null;
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
}

export async function saveBusinessProfileForOrganization(
  database: Database,
  organizationId: string,
  profile: BusinessProfileInput,
) {
  await assertBusinessProfileSlugAvailable(database, organizationId, profile.slug);

  const existing = await getBusinessProfileForOrganization(database, organizationId);

  if (existing?.status === "published") {
    const issues = getBusinessProfilePublicationIssues(profile);
    if (issues.length) {
      throw new Response(`Un perfil publicado no puede quedar incompleto: ${issues.join(", ")}.`, { status: 400 });
    }
  }

  if (existing) {
    const [updated] = await database
      .update(businessProfile)
      .set(profile)
      .where(eq(businessProfile.organizationId, organizationId))
      .returning();
    return updated;
  }

  const [created] = await database
    .insert(businessProfile)
    .values({ id: crypto.randomUUID(), organizationId, ...profile, status: "draft" })
    .returning();
  return created;
}
