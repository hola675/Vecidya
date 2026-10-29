import type { LearnArticle } from "./learn";

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
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  editorialDraft: false;
};

export function toPublicLearnGuideSummary(article: LearnArticle): PublicLearnGuideSummary {
  return {
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
