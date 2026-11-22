export function createMiniWebV2PublicSlug(organizationSlug: string, siteId: string) {
  const organizationPart = organizationSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48).replace(/-$/g, "");
  const sitePart = siteId.toLowerCase().replace(/[^a-f0-9]/g, "").slice(0, 8);
  if (!organizationPart || sitePart.length !== 8) throw new Error("No se pudo generar un slug público MiniWeb válido.");
  return `${organizationPart}-site-${sitePart}`;
}
