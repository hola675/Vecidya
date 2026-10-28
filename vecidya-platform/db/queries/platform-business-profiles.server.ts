import { asc, count, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { getBusinessProfileCompletion } from "../business-profile-rules";
import { businessProfile, businessProfileGovernance, organization, organizationService, serviceCatalog } from "../schema";

export async function listPlatformBusinessProfiles(database: Database) {
  const [profiles, serviceCounts] = await Promise.all([
    database
      .select({
        id: businessProfile.id,
        organizationId: businessProfile.organizationId,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        displayName: businessProfile.displayName,
        slug: businessProfile.slug,
        shortDescription: businessProfile.shortDescription,
        category: businessProfile.category,
        city: businessProfile.city,
        country: businessProfile.country,
        status: businessProfile.status,
        verificationStatus: businessProfileGovernance.verificationStatus,
        platformStatus: businessProfileGovernance.platformStatus,
      })
      .from(businessProfile)
      .leftJoin(organization, eq(businessProfile.organizationId, organization.id))
      .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
      .orderBy(asc(businessProfile.status), asc(businessProfile.displayName), asc(businessProfile.slug)),
    database
      .select({ organizationId: organizationService.organizationId, total: count() })
      .from(organizationService)
      .groupBy(organizationService.organizationId),
  ]);

  return profiles.map((profile) => ({
    ...profile,
    organizationName: profile.organizationName ?? "Sin organización",
    organizationSlug: profile.organizationSlug ?? profile.organizationId,
    verificationStatus: profile.verificationStatus ?? "unverified",
    platformStatus: profile.platformStatus ?? "active",
    completion: getBusinessProfileCompletion(profile),
    servicesCount: serviceCounts.find((item) => item.organizationId === profile.organizationId)?.total ?? 0,
  }));
}

export async function getPlatformBusinessProfileDetail(database: Database, businessProfileId: string) {
  const [profile] = await database
    .select({
      id: businessProfile.id,
      organizationId: businessProfile.organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      displayName: businessProfile.displayName,
      slug: businessProfile.slug,
      shortDescription: businessProfile.shortDescription,
      description: businessProfile.description,
      category: businessProfile.category,
      city: businessProfile.city,
      country: businessProfile.country,
      phone: businessProfile.phone,
      publicEmail: businessProfile.publicEmail,
      websiteUrl: businessProfile.websiteUrl,
      whatsapp: businessProfile.whatsapp,
      instagramUrl: businessProfile.instagramUrl,
      facebookUrl: businessProfile.facebookUrl,
      linkedinUrl: businessProfile.linkedinUrl,
      tiktokUrl: businessProfile.tiktokUrl,
      youtubeUrl: businessProfile.youtubeUrl,
      serviceMode: businessProfile.serviceMode,
      serviceArea: businessProfile.serviceArea,
      status: businessProfile.status,
      createdAt: businessProfile.createdAt,
      updatedAt: businessProfile.updatedAt,
      verificationStatus: businessProfileGovernance.verificationStatus,
      verifiedAt: businessProfileGovernance.verifiedAt,
      platformStatus: businessProfileGovernance.platformStatus,
      suspendedAt: businessProfileGovernance.suspendedAt,
      governanceUpdatedAt: businessProfileGovernance.updatedAt,
    })
    .from(businessProfile)
    .leftJoin(organization, eq(businessProfile.organizationId, organization.id))
    .leftJoin(businessProfileGovernance, eq(businessProfileGovernance.businessProfileId, businessProfile.id))
    .where(eq(businessProfile.id, businessProfileId))
    .limit(1);

  if (!profile) return null;

  const services = await database
    .select({ code: serviceCatalog.code, name: serviceCatalog.name, status: organizationService.status })
    .from(organizationService)
    .innerJoin(serviceCatalog, eq(organizationService.serviceId, serviceCatalog.id))
    .where(eq(organizationService.organizationId, profile.organizationId))
    .orderBy(asc(serviceCatalog.name));

  return {
    profile: {
      ...profile,
      organizationName: profile.organizationName ?? "Sin organización",
      organizationSlug: profile.organizationSlug ?? profile.organizationId,
      verificationStatus: profile.verificationStatus ?? "unverified",
      platformStatus: profile.platformStatus ?? "active",
    },
    completion: getBusinessProfileCompletion(profile),
    services,
  };
}
