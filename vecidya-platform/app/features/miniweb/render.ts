import {
  MINIWEB_MODULE_REGISTRY,
  MINIWEB_TEMPLATE_REGISTRY,
  sortMiniWebModules,
  type MiniWebConfiguration,
  type MiniWebModuleConfig,
  type MiniWebModuleType,
  type MiniWebProfileSource,
  type MiniWebHoursSource,
} from "./registry";
import type { BusinessFaqItem, BusinessOffering } from "./content";
import type { BusinessMediaAsset } from "../../../db/queries/business-media.server";
export type MiniWebMediaAsset = Pick<BusinessMediaAsset, "id" | "mediaType" | "purpose" | "contentType" | "altText"> & { publicUrl: string };

function hasText(...values: (string | null)[]) {
  return values.some((value) => typeof value === "string" && value.trim().length > 0);
}

function isValidWebUrl(value: string | null) {
  if (!value) return false;
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function hasPublicContact(profile: MiniWebProfileSource) {
  const phone = profile.phone?.trim().replace(/[\s().-]/g, "") ?? "";
  const whatsapp = profile.whatsapp?.replace(/\D/g, "") ?? "";
  const email = profile.publicEmail?.trim() ?? "";
  return /^\+?\d{7,15}$/.test(phone)
    || /^\d{8,15}$/.test(whatsapp)
    || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || isValidWebUrl(profile.websiteUrl)
    || [profile.instagramUrl, profile.facebookUrl, profile.linkedinUrl].some(isValidWebUrl);
}

export function hasMiniWebModuleContent(type: MiniWebModuleType, profile: MiniWebProfileSource, hours: MiniWebHoursSource, offerings: readonly BusinessOffering[], faqs: readonly BusinessFaqItem[], media: readonly MiniWebMediaAsset[]): boolean {
  switch (type) {
    case "hero": return hasText(profile.displayName);
    case "about": return hasText(profile.description);
    case "contact": return hasPublicContact(profile);
    case "hours": return hours.length > 0;
    case "location": return hasText(profile.category, profile.city, profile.country, profile.serviceMode, profile.serviceArea);
    case "services": return offerings.some((item) => item.kind === "service" && item.isActive && item.title.trim().length > 0 && item.description.trim().length > 0);
    case "products": return offerings.some((item) => item.kind === "product" && item.isActive && item.title.trim().length > 0 && item.description.trim().length > 0);
    case "faq": return faqs.some((item) => item.isActive && item.question.trim().length > 0 && item.answer.trim().length > 0);
    case "gallery": return media.some((asset) => asset.purpose === "gallery");
    default: return false;
  }
}

export function getRenderableMiniWebModules(
  configuration: MiniWebConfiguration,
  profile: MiniWebProfileSource,
  hours: MiniWebHoursSource,
  offerings: readonly BusinessOffering[] = [],
  faqs: readonly BusinessFaqItem[] = [],
  media: readonly MiniWebMediaAsset[] = [],
): MiniWebModuleConfig[] {
  const template = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey];
  if (!template || template.availability !== "available") return [];
  return sortMiniWebModules(configuration.modules).filter((module) =>
    module.enabled
    && MINIWEB_MODULE_REGISTRY[module.type].availability === "available"
    && template.supportedModules.includes(module.type)
    && hasMiniWebModuleContent(module.type, profile, hours, offerings, faqs, media),
  );
}
