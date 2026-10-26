import assert from "node:assert/strict";
import { test } from "node:test";

import { learnArticles, learnPathways } from "../../../app/content/learn";
import { getPublicLearnArticle, getPublicLearnArticles, getPublicLearnPathways } from "../../../app/content/learn-publication";

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

test("los itinerarios públicos solo incluyen guías aprobadas y mantienen al menos tres pasos", () => {
  const pathways = getPublicLearnPathways(learnPathways, learnArticles);
  assert.equal(learnPathways.length, 9, "El catálogo editorial conserva los nueve itinerarios originales");
  assert(pathways.length > 0, "Debe quedar al menos un itinerario público útil");
  for (const pathway of pathways) {
    assert(pathway.slugs.length >= 3, `El itinerario queda demasiado corto: ${pathway.title}`);
    assert.equal(new Set(pathway.slugs).size, pathway.slugs.length, `Pasos duplicados: ${pathway.title}`);
    for (const slug of pathway.slugs) {
      assert.equal(getPublicLearnArticle(learnArticles, slug)?.slug, slug, `El itinerario expone un borrador: ${pathway.title} -> ${slug}`);
    }
  }
  assert(pathways.length < learnPathways.length, "Los itinerarios formados solo por borradores no deben publicarse como caminos vacíos");
});
