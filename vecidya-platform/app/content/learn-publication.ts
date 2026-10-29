import type { LearnArticle } from "./learn";
import editorialManifest from "./learn-editorial-manifest";

type EditorialGuide = {
  guideId: string;
  contentRevision: number;
  access: "always_free" | "licensed";
  sections: readonly { heading: string; sectionId: string }[];
};

const editorialGuides = editorialManifest as Record<string, EditorialGuide>;

/** Clasificación central derivada del manifiesto editorial versionado. */
export const LEARN_ALWAYS_FREE_SLUGS = Object.entries(editorialGuides)
  .filter(([, entry]) => entry.access === "always_free")
  .map(([slug]) => slug);

export function getLearnGuideAccess(slug: string): EditorialGuide["access"] | null {
  return editorialGuides[slug]?.access ?? null;
}

export function getLearnEditorialIdentity(article: LearnArticle) {
  const entry = editorialGuides[article.slug];
  if (!entry) throw new Error(`Falta identidad editorial para Aprende: ${article.slug}`);
  if (entry.sections.length !== article.sections.length) {
    throw new Error(`Cambió la estructura de secciones sin actualizar el manifiesto: ${article.slug}`);
  }
  const sections = article.sections.map((section) => {
    const identity = entry.sections.find((candidate) => candidate.heading === section.heading);
    if (!identity) throw new Error(`Falta sectionId para «${section.heading}» en ${article.slug}`);
    return { ...section, sectionId: identity.sectionId };
  });
  return { ...article, guideId: entry.guideId, contentRevision: entry.contentRevision, sections };
}

export function getPublicLearnArticles(articles: readonly LearnArticle[]): LearnArticle[] {
  return articles.filter((article) => article.editorialDraft !== true);
}

export function getPublicLearnArticle(
  articles: readonly LearnArticle[],
  slug: string | undefined,
): LearnArticle | undefined {
  if (!slug) return undefined;
  return articles.find((article) => article.slug === slug && article.editorialDraft !== true);
}

/** Public catalog data only: never serialize article body content from the index route. */
export type PublicLearnGuideSummary = {
  guideId: string;
  contentRevision: number;
  access: "always_free" | "licensed";
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  editorialDraft: false;
};

export function toPublicLearnGuideSummary(article: LearnArticle): PublicLearnGuideSummary {
  const identity = editorialGuides[article.slug];
  if (!identity) throw new Error(`Falta identidad editorial para Aprende: ${article.slug}`);
  return {
    guideId: identity.guideId,
    contentRevision: identity.contentRevision,
    access: identity.access,
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    image: article.image,
    imageAlt: article.imageAlt,
    editorialDraft: false,
  };
}

export function getPublicLearnGuideSummaries(
  articles: readonly LearnArticle[],
): PublicLearnGuideSummary[] {
  return getPublicLearnArticles(articles).map(toPublicLearnGuideSummary);
}

export function matchesPublicLearnGuideSummary(summary: PublicLearnGuideSummary, searchTerm: string): boolean {
  const needle = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  if (!needle) return true;
  const searchableText = [summary.title, summary.excerpt, summary.category]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
  return searchableText.includes(needle);
}

type LearnPathway = { title: string; description: string; slugs: readonly string[] };

export function getPublicLearnPathways<T extends LearnPathway>(
  pathways: readonly T[],
  articles: readonly LearnArticle[],
): Array<{ title: T["title"]; description: T["description"]; slugs: string[] }> {
  const publicSlugs = new Set(getPublicLearnArticles(articles).map((article) => article.slug));
  return pathways
    .map((pathway) => ({
      title: pathway.title,
      description: pathway.description,
      slugs: pathway.slugs.filter((slug) => publicSlugs.has(slug)),
    }))
    .filter((pathway) => pathway.slugs.length >= 3);
}
