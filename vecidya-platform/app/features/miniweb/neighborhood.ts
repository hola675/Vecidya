import type { MiniWebModuleType } from "./registry";

export type NeighborhoodOfferingKind = "service" | "product";

export type NeighborhoodProfile = {
  displayName: string;
  shortDescription: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  serviceArea: string | null;
  serviceMode: string | null;
  offerings: { kind: NeighborhoodOfferingKind; title: string; description: string }[];
  modules: MiniWebModuleType[];
};

export type NeighborhoodFilters = {
  q?: string;
  category?: string;
  city?: string;
  serviceArea?: string;
  serviceMode?: string;
  offering?: NeighborhoodOfferingKind;
  module?: MiniWebModuleType;
};

export function getVisibleNeighborhoodOfferings(
  offerings: readonly { kind: NeighborhoodOfferingKind; title: string; description: string; isActive: boolean }[],
  modules: readonly MiniWebModuleType[],
) {
  const enabledModules = new Set(modules);
  return offerings.filter((offering) => offering.isActive && enabledModules.has(offering.kind === "service" ? "services" : "products"))
    .map(({ kind, title, description }) => ({ kind, title, description }));
}

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

export function matchesNeighborhoodFilters(profile: NeighborhoodProfile, filters: NeighborhoodFilters) {
  if (filters.category && profile.category !== filters.category) return false;
  if (filters.city && profile.city !== filters.city) return false;
  if (filters.serviceArea && profile.serviceArea !== filters.serviceArea) return false;
  if (filters.serviceMode && profile.serviceMode !== filters.serviceMode) return false;
  if (filters.offering && !profile.offerings.some((offering) => offering.kind === filters.offering)) return false;
  if (filters.module && !profile.modules.includes(filters.module)) return false;

  const query = filters.q ? normalizeSearchText(filters.q) : "";
  if (!query) return true;
  const searchable = [
    profile.displayName,
    profile.shortDescription,
    profile.category,
    profile.city,
    profile.country,
    profile.serviceArea,
    ...profile.offerings.flatMap(({ title, description }) => [title, description]),
  ].filter((value): value is string => Boolean(value)).map(normalizeSearchText);
  return searchable.some((value) => value.includes(query));
}
