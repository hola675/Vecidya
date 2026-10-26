import assert from "node:assert/strict";
import { test } from "node:test";

import { learnArticles, learnPathways } from "../../../app/content/learn";
import { getPublicLearnArticle, getPublicLearnArticles } from "../../../app/content/learn-publication";

test("el catálogo público excluye borradores y conserva el conteo aprobado", () => {
  const publicArticles = getPublicLearnArticles(learnArticles);
  assert.equal(publicArticles.length, learnArticles.filter((article) => article.editorialDraft !== true).length);
  assert.equal(publicArticles.some((article) => article.editorialDraft === true), false);
  assert.equal(new Set(publicArticles.map((article) => article.slug)).size, publicArticles.length);
});

test("la frontera editorial bloquea borradores por slug y conserva artículos aprobados", () => {
  const draft = learnArticles.find((article) => article.editorialDraft === true);
  const published = learnArticles.find((article) => article.editorialDraft !== true);
  assert.ok(draft, "Debe existir al menos un borrador de prueba");
  assert.ok(published, "Debe existir al menos un artículo aprobado");
  assert.equal(getPublicLearnArticle(learnArticles, draft.slug), undefined);
  assert.equal(getPublicLearnArticle(learnArticles, "slug-que-no-existe"), undefined);
  assert.equal(getPublicLearnArticle(learnArticles, undefined), undefined);
  assert.equal(getPublicLearnArticle(learnArticles, published.slug)?.slug, published.slug);
});

test("los itinerarios públicos solo resuelven artículos aprobados y conservan pasos útiles", () => {
  const publicSlugs = new Set(getPublicLearnArticles(learnArticles).map((article) => article.slug));
  assert.equal(learnPathways.length, 9);
  for (const pathway of learnPathways) {
    const available = pathway.slugs.filter((slug) => publicSlugs.has(slug));
    assert(available.length >= 3, `El itinerario queda demasiado corto: ${pathway.title}`);
    assert.equal(new Set(available).size, available.length, `Pasos duplicados: ${pathway.title}`);
  }
});
