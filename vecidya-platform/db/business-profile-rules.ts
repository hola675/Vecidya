export const serviceModeLabels: Record<string, string> = {
  in_person: "Presencial",
  remote: "Remoto / virtual",
  hybrid: "Presencial y remoto",
};

export const businessProfileSlugMaxLength = 80;

export function slugifyBusinessName(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, businessProfileSlugMaxLength)
    .replace(/-+$/, "");
}

export type BusinessProfilePublishableFields = {
  displayName: string | null;
  slug: string | null;
  shortDescription: string | null;
  category: string | null;
};

const requiredFields = [
  ["Nombre visible", "displayName"],
  ["Slug", "slug"],
  ["Descripción corta", "shortDescription"],
  ["Categoría", "category"],
] as const;

export function getBusinessProfilePublicationIssues(profile: BusinessProfilePublishableFields) {
  return requiredFields
    .filter(([, key]) => !profile[key]?.trim())
    .map(([label]) => label);
}

export function getBusinessProfileCompletion(profile: BusinessProfilePublishableFields | null | undefined) {
  const issues = profile ? getBusinessProfilePublicationIssues(profile) : requiredFields.map(([label]) => label);
  const total = requiredFields.length;
  const completed = total - issues.length;

  return {
    completed,
    issues,
    percentage: Math.round((completed / total) * 100),
    total,
  };
}
