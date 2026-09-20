export const serviceModeLabels: Record<string, string> = {
  in_person: "Presencial",
  remote: "Remoto / virtual",
  hybrid: "Presencial y remoto",
};

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

export function getBusinessProfileCompletion(profile: BusinessProfilePublishableFields | null) {
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
