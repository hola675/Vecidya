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
