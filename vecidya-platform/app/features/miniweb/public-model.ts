import type { MiniWebModuleType, MiniWebProfileSource } from "./registry";

export type MiniWebPublicHours = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type MiniWebPublicationState = "draft" | "published" | "suspended";

export function getMiniWebPublicationState(profileStatus: string | null | undefined, platformStatus: string | null | undefined): MiniWebPublicationState {
  if (profileStatus === "published" && platformStatus === "suspended") return "suspended";
  return profileStatus === "published" ? "published" : "draft";
}

export type MiniWebPublicProfile = MiniWebProfileSource & {
  slug: string;
  logoUrl: string | null;
  verificationStatus: string;
};

type MiniWebProfileRecord = MiniWebProfileSource & {
  slug: string;
  logoUrl: string | null;
};

export function toMiniWebPublicProfile(
  profile: MiniWebProfileRecord | null | undefined,
  verificationStatus: string,
): MiniWebPublicProfile | null {
  if (!profile) return null;
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    shortDescription: profile.shortDescription,
    category: profile.category,
    city: profile.city,
    country: profile.country,
    logoUrl: profile.logoUrl,
    description: profile.description,
    phone: profile.phone,
    publicEmail: profile.publicEmail,
    websiteUrl: profile.websiteUrl,
    whatsapp: profile.whatsapp,
    instagramUrl: profile.instagramUrl,
    facebookUrl: profile.facebookUrl,
    linkedinUrl: profile.linkedinUrl,
    serviceMode: profile.serviceMode,
    serviceArea: profile.serviceArea,
    verificationStatus,
  };
}

export function restrictMiniWebPublicModel(
  profile: MiniWebPublicProfile,
  hours: readonly MiniWebPublicHours[],
  activeModules: readonly MiniWebModuleType[],
) {
  const active = new Set(activeModules);
  const hasContact = active.has("contact");
  const hasLocation = active.has("location");
  return {
    profile: {
      ...profile,
      description: active.has("about") ? profile.description : null,
      phone: hasContact ? profile.phone : null,
      publicEmail: hasContact ? profile.publicEmail : null,
      websiteUrl: hasContact ? profile.websiteUrl : null,
      whatsapp: hasContact ? profile.whatsapp : null,
      instagramUrl: hasContact ? profile.instagramUrl : null,
      facebookUrl: hasContact ? profile.facebookUrl : null,
      linkedinUrl: hasContact ? profile.linkedinUrl : null,
      category: hasLocation ? profile.category : null,
      city: hasLocation ? profile.city : null,
      country: hasLocation ? profile.country : null,
      serviceMode: hasLocation ? profile.serviceMode : null,
      serviceArea: hasLocation ? profile.serviceArea : null,
    },
    hours: active.has("hours") ? [...hours] : [],
  };
}
