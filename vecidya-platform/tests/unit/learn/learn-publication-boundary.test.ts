import assert from "node:assert/strict";
import { test } from "node:test";

import { learnArticles } from "../../../app/content/learn";
import { loader as knowledgeLoader } from "../../../app/routes/knowledge";
import { loader as articleLoader } from "../../../app/routes/learn-article";

test("el catálogo público de Aprende excluye borradores editoriales", () => {
  const data = knowledgeLoader({
    request: new Request("https://example.test/aprende"),
  } as Parameters<typeof knowledgeLoader>[0]);

  const publicArticles = learnArticles.filter((article) => !article.editorialDraft);
  assert.equal(data.total, publicArticles.length);
  assert.equal(data.articles.length, publicArticles.length);
  assert.equal(data.articles.some((article) => article.editorialDraft), false);
  assert.equal(data.topics.reduce((sum, topic) => sum + topic.count, 0), publicArticles.length);

  for (const pathway of data.pathways) {
    assert(pathway.guides.length > 0, `Itinerario público vacío: ${pathway.title}`);
    assert(pathway.guides.every((guide) => !guide.editorialDraft), `El itinerario muestra borradores: ${pathway.title}`);
  }
});

test("una URL directa no permite consultar un artículo en borrador", () => {
  const draft = learnArticles.find((article) => article.editorialDraft);
  assert.ok(draft, "Debe existir al menos un borrador de prueba");

  assert.throws(
    () => articleLoader({ params: { slug: draft.slug } } as Parameters<typeof articleLoader>[0]),
    (error: unknown) => error instanceof Response && error.status === 404,
  );
});

test("los artículos aprobados siguen accesibles por su URL", () => {
  const published = learnArticles.find((article) => !article.editorialDraft);
  assert.ok(published, "Debe existir al menos un artículo publicado");

  const data = articleLoader({ params: { slug: published.slug } } as Parameters<typeof articleLoader>[0]);
  assert.equal(data.article.slug, published.slug);
});
