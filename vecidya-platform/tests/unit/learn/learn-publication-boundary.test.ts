import assert from "node:assert/strict";
import { test } from "node:test";

import { learnArticles, learnPathways } from "../../../app/content/learn";
import { getPublicLearnArticle, getPublicLearnArticles, getPublicLearnGuideSummaries, getPublicLearnPathways, matchesPublicLearnGuideSummary } from "../../../app/content/learn-publication";

test("el catálogo completo aprobado se expone y conserva el conteo", () => {
  const publicArticles = getPublicLearnArticles(learnArticles);
  assert.equal(publicArticles.length, learnArticles.filter((article) => article.editorialDraft !== true).length);
  assert.equal(publicArticles.some((article) => article.editorialDraft === true), false);
  assert.equal(publicArticles.length, 48);
  assert.equal(new Set(publicArticles.map((article) => article.slug)).size, publicArticles.length);
});

test("la frontera editorial sigue bloqueando un borrador aunque el catálogo esté aprobado", () => {
  const draft = { ...learnArticles[0], slug: "borrador-sintetico", editorialDraft: true };
  const articles = [...learnArticles, draft];
  const published = learnArticles[0];
  assert.equal(getPublicLearnArticle(articles, draft.slug), undefined);
  assert.equal(getPublicLearnArticle(articles, "slug-que-no-existe"), undefined);
  assert.equal(getPublicLearnArticle(articles, undefined), undefined);
  assert.equal(getPublicLearnArticle(articles, published.slug)?.slug, published.slug);
  assert.equal(getPublicLearnArticles(articles).some((article) => article.slug === draft.slug), false);
});

test("el DTO del catálogo público no incluye el cuerpo ni campos derivados de las secciones", () => {
  const source = learnArticles[0];
  const summary = getPublicLearnGuideSummaries([source])[0];
  assert.deepEqual(Object.keys(summary).sort(), ["category", "editorialDraft", "excerpt", "image", "imageAlt", "slug", "title"]);
  assert.equal(JSON.stringify(summary).includes(source.sections[0].paragraphs[0]), false);
});

test("la búsqueda pública del catálogo no devuelve guías por texto exclusivo del cuerpo", () => {
  const article = learnArticles.find((candidate) => candidate.slug === "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo");
  assert(article);
  const summary = getPublicLearnGuideSummaries([article])[0];
  assert.equal(matchesPublicLearnGuideSummary(summary, "customer relationship management"), false);
  assert.equal(matchesPublicLearnGuideSummary(summary, "crm"), true);
});

test("los nueve itinerarios públicos contienen sus guías aprobadas", () => {
  const pathways = getPublicLearnPathways(learnPathways, learnArticles);
  assert.equal(learnPathways.length, 9, "El catálogo editorial conserva los nueve itinerarios originales");
  assert.equal(pathways.length, 9, "Los nueve itinerarios están completos tras aprobar el catálogo");
  for (const pathway of pathways) {
    assert(pathway.slugs.length >= 3, `El itinerario queda demasiado corto: ${pathway.title}`);
    assert.equal(new Set(pathway.slugs).size, pathway.slugs.length, `Pasos duplicados: ${pathway.title}`);
    for (const slug of pathway.slugs) {
      assert.equal(getPublicLearnArticle(learnArticles, slug)?.slug, slug, `El itinerario expone un borrador: ${pathway.title} -> ${slug}`);
    }
  }
});

test("los itinerarios no publican tramos que solo contienen un borrador sintético", () => {
  const draft = { ...learnArticles[0], slug: "borrador-sintetico", editorialDraft: true };
  const pathway = { title: "Prueba", description: "Itinerario sintético", slugs: [draft.slug, ...learnArticles.slice(0, 3).map((article) => article.slug)] };
  assert.deepEqual(getPublicLearnPathways([pathway], [...learnArticles, draft])[0]?.slugs, pathway.slugs.slice(1));
});
