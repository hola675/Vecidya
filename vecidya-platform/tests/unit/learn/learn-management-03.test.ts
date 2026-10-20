import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { learnArticles, learnPathways } from "../../../app/content/learn.ts";
import { learnManagement03Articles } from "../../../app/content/learn-management-03.ts";

test("Gestión 03 incorpora cinco borradores bien enlazados y sin atribución", () => {
  assert.equal(learnManagement03Articles.length, 5);
  const allSlugs = new Set(learnArticles.map((article) => article.slug));
  const localSlugs = learnManagement03Articles.map((article) => article.slug);
  assert.equal(new Set(localSlugs).size, 5);
  for (const article of learnManagement03Articles) {
    assert(allSlugs.has(article.slug), `No está en catálogo: ${article.slug}`);
    assert.equal(article.editorialDraft, true, `No protegido editorialmente: ${article.slug}`);
    assert.equal(article.enPocasPalabras.length, 3);
    assert(article.sections.length >= 7);
    assert(article.imageAlt.length > 25);
    assert(existsSync(join(process.cwd(), "public", article.image.replace(/^\//, ""))), `Falta la ilustración ${article.image}`);
    for (const slug of article.relatedSlugs ?? []) assert(allSlugs.has(slug), `Relacionado inexistente: ${slug}`);
    const blocks = article.sections.flatMap((section) => section.blocks ?? []);
    for (const type of ["definitions", "example", "steps", "summary", "faq", "sources"]) {
      assert(blocks.some((block) => block.type === type), `Falta ${type} en ${article.slug}`);
    }
    const examples = blocks.filter((block) => block.type === "example");
    assert(examples.every((block) => block.hypothetical === true));
    const allSources = blocks.flatMap((block) => block.type === "sources" ? block.items : []);
    assert(allSources.length >= 2);
    assert(allSources.every(({ url }) => url.startsWith("https://")));
  }
});

test("Nueva ruta de aprendizaje contiene exactamente los artículos de Gestión 03", () => {
  const path = learnPathways.find((entry) => entry.title === "Dirige y mejora con criterio");
  assert(path);
  assert.deepEqual([...path.slugs], learnManagement03Articles.map((article) => article.slug));
});
