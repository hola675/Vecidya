import { and, asc, eq, sum } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessMediaAsset } from "../schema";

export const MAX_BUSINESS_MEDIA_BYTES = 32 * 1024 * 1024;
export const MAX_BUSINESS_MEDIA_STORAGE_BYTES = 100 * 1024 * 1024;

export type BusinessMediaType = "image" | "video";
export type BusinessMediaPurpose = "cover" | "gallery" | "logo" | "icon";
export type BusinessMediaAsset = {
  id: string;
  mediaType: BusinessMediaType;
  purpose: BusinessMediaPurpose;
  contentType: string;
  sizeBytes: number;
  altText: string;
  createdAt: Date;
};

export async function listBusinessMediaForOrganization(database: Database, organizationId: string): Promise<BusinessMediaAsset[]> {
  return database.select({
    id: businessMediaAsset.id,
    mediaType: businessMediaAsset.mediaType,
    purpose: businessMediaAsset.purpose,
    contentType: businessMediaAsset.contentType,
    sizeBytes: businessMediaAsset.sizeBytes,
    altText: businessMediaAsset.altText,
    createdAt: businessMediaAsset.createdAt,
  }).from(businessMediaAsset)
    .where(and(eq(businessMediaAsset.organizationId, organizationId), eq(businessMediaAsset.isActive, true)))
    .orderBy(asc(businessMediaAsset.createdAt), asc(businessMediaAsset.id))
    .then((assets) => assets.map((asset) => ({
      ...asset,
      mediaType: asset.mediaType as BusinessMediaType,
      purpose: asset.purpose as BusinessMediaPurpose,
    })));
}

export async function getBusinessMediaStorageBytes(database: Database, organizationId: string) {
  const [row] = await database.select({ total: sum(businessMediaAsset.sizeBytes) })
    .from(businessMediaAsset)
    .where(eq(businessMediaAsset.organizationId, organizationId));
  return Number(row?.total ?? 0);
}

export async function getBusinessMediaForPublicDelivery(database: Database, organizationId: string, assetId: string) {
  const [asset] = await database.select().from(businessMediaAsset)
    .where(and(eq(businessMediaAsset.organizationId, organizationId), eq(businessMediaAsset.id, assetId)))
    .limit(1);
  return asset ?? null;
}
