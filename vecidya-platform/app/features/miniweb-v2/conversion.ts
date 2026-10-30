import { createEmptyMiniWebV2Document, type MiniWebV2Document, type MiniWebV2SectionType } from "./sections";

/** Deliberately excludes V1 configuration and hours from the conversion input contract. */
export type PublishedV1ContentAllowlist = {
  profile: { displayName: string; shortDescription: string | null; description: string | null; phone: string | null; publicEmail: string | null; websiteUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; linkedinUrl: string | null; tiktokUrl?: string | null; youtubeUrl?: string | null; city: string | null; serviceArea: string | null };
  offerings: Array<{ id: string; kind: "service" | "product"; title: string; description: string; imageAssetId: string | null; isActive: boolean }>;
  faqs: Array<{ id: string; question: string; answer: string; isActive: boolean }>;
  media: Array<{ id: string; purpose: "logo" | "icon" | "cover" | "gallery"; altText: string; mediaType: "image" | "video" }>;
  branding: { logoAssetId: string | null };
};
const allowedUrl = (value: string | null): value is string => {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
export function convertPublishedV1ContentToV2(source: PublishedV1ContentAllowlist): { document: MiniWebV2Document; imported: Record<string, number> } {
  const types: MiniWebV2SectionType[] = ["hero", "about", "services", "products", "gallery", "contact", "location", "faq"];
  const document = createEmptyMiniWebV2Document(types);
  const media = new Map(source.media.filter((asset) => asset.mediaType === "image").map((asset) => [asset.id, asset]));
  const logo = source.branding.logoAssetId && media.has(source.branding.logoAssetId) ? source.branding.logoAssetId : null;
  const set = <T extends MiniWebV2Document["sections"][number]["type"]>(type: T, content: Extract<MiniWebV2Document["sections"][number], { type: T }>["content"]) => {
    const section = document.sections.find((item) => item.type === type);
    if (section) (section as unknown as { content: typeof content }).content = content;
  };
  const services = source.offerings.filter((item) => item.isActive && item.kind === "service");
  const products = source.offerings.filter((item) => item.isActive && item.kind === "product");
  const images = source.media.filter((asset) => asset.mediaType === "image" && (asset.purpose === "gallery" || asset.purpose === "cover"));
  const links = [source.profile.websiteUrl, source.profile.instagramUrl, source.profile.facebookUrl, source.profile.linkedinUrl, source.profile.tiktokUrl ?? null, source.profile.youtubeUrl ?? null]
    .filter(allowedUrl).map((href) => ({ label: new URL(href).hostname, href }));
  set("hero", { title: source.profile.displayName, subtitle: source.profile.shortDescription ?? "", cta: null, image: logo ? { assetId: logo, alt: media.get(logo)?.altText ?? "" } : null });
  set("about", { headline: source.profile.displayName, description: source.profile.description ?? source.profile.shortDescription ?? "", blocks: [] });
  set("services", { items: services.map((item) => ({ id: crypto.randomUUID(), title: item.title, description: item.description, image: item.imageAssetId && media.has(item.imageAssetId) ? { assetId: item.imageAssetId, alt: media.get(item.imageAssetId)?.altText ?? "" } : null, cta: null })) });
  set("products", { items: products.map((item) => ({ id: crypto.randomUUID(), title: item.title, category: null, description: item.description, image: item.imageAssetId && media.has(item.imageAssetId) ? { assetId: item.imageAssetId, alt: media.get(item.imageAssetId)?.altText ?? "" } : null, cta: null })) });
  set("gallery", { images: images.map((item) => ({ assetId: item.id, alt: item.altText })) });
  set("contact", { phone: source.profile.phone, email: source.profile.publicEmail, links, cta: null });
  set("location", { address: null, city: source.profile.city, area: source.profile.serviceArea, mapUrl: null });
  set("faq", { items: source.faqs.filter((item) => item.isActive).map(({ question, answer }) => ({ id: crypto.randomUUID(), question, answer })) });
  return { document, imported: {
    profile: 1,
    about: Number(Boolean(source.profile.description || source.profile.shortDescription)),
    logo: Number(Boolean(logo)),
    services: services.length,
    products: products.length,
    gallery: images.length,
    contact: Number(Boolean(source.profile.phone)) + Number(Boolean(source.profile.publicEmail)) + links.length,
    location: Number(Boolean(source.profile.city)) + Number(Boolean(source.profile.serviceArea)),
    faqs: source.faqs.filter((item) => item.isActive).length,
    hours: 0,
  } };
}
