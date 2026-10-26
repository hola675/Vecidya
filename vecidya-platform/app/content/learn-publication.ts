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
