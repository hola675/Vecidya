import assert from "node:assert/strict";
import { test } from "node:test";

import { getLearnArticle, learnArticles, learnCategories, learnPathways } from "../../app/content/learn.ts";

const splitPairs = [
  ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "publicidad-digital-como-preparar-una-primera-campana"],
  ["dominio-hosting-sitio-web-como-funcionan", "como-elegir-y-cambiar-proveedor-de-dominio-y-hosting"],
  ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio", "como-probar-y-supervisar-automatizaciones-sin-perder-datos"],
  ["que-puede-hacer-una-inteligencia-artificial-por-un-negocio", "como-probar-un-asistente-de-ia-con-supervision-humana"],
  ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "como-mantener-actualizada-y-confiable-tu-presencia-digital"],
  ["dominio-hosting-sitio-web-como-funcionan", "dns-https-y-correo-como-se-conecta-tu-dominio"],
] as const;

test("Aprende conserva slugs únicos, categorías y campos esenciales", () => {
  const slugs = learnArticles.map((article) => article.slug);
  assert.equal(slugs.length, 44, "La reorganización debe conservar los 44 artículos esperados.");
  assert.equal(new Set(slugs).size, slugs.length, "Hay slugs duplicados.");
  const categories = new Set(learnCategories.map(({ name }) => name));
  for (const article of learnArticles) {
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, article.slug);
    assert.ok(categories.has(article.category), `Categoría desconocida: ${article.slug}`);
    for (const field of [article.title, article.intro, article.excerpt, article.image, article.imageAlt, article.cta.label, article.cta.to]) {
      assert.ok(field.trim(), `Campo vacío en ${article.slug}`);
    }
    assert.equal(article.enPocasPalabras.length, 3, article.slug);
    assert.ok(article.sections.length > 0, article.slug);
    const headings = article.sections.map(({ heading }) => heading);
    assert.equal(new Set(headings).size, headings.length, `Secciones duplicadas en ${article.slug}`);
    for (const section of article.sections) {
      assert.ok(section.heading.trim(), article.slug);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.trim()), `Párrafo vacío en ${article.slug}`);
      for (const block of section.blocks ?? []) {
        if (block.type !== "sources") continue;
        for (const source of block.items) {
          assert.match(source.url, /^https:\/\/[^\s]+$/i, `Fuente no HTTPS en ${article.slug}`);
          assert.ok(source.label.trim() && source.scope.trim(), `Fuente incompleta en ${article.slug}`);
        }
      }
    }
    for (const related of article.relatedSlugs ?? []) {
      assert.notEqual(related, article.slug, `Referencia circular directa en ${article.slug}`);
      assert.ok(getLearnArticle(related), `Referencia inexistente ${article.slug} → ${related}`);
    }
  }
});

test("Todos los itinerarios enlazan a artículos reales sin duplicados internos", () => {
  const titles = new Set<string>();
  for (const pathway of learnPathways) {
    assert.ok(!titles.has(pathway.title), `Itinerario duplicado: ${pathway.title}`);
    titles.add(pathway.title);
    assert.ok(pathway.slugs.length > 0, pathway.title);
    assert.equal(new Set(pathway.slugs).size, pathway.slugs.length, pathway.title);
    for (const slug of pathway.slugs) assert.ok(getLearnArticle(slug), `Itinerario ${pathway.title}: falta ${slug}`);
  }
});

test("Las seis guías especializadas permanecen conectadas y en revisión editorial", () => {
  for (const [originSlug, newSlug] of splitPairs) {
    const origin = getLearnArticle(originSlug);
    const specialized = getLearnArticle(newSlug);
    assert.ok(origin, `Falta guía original ${originSlug}`);
    assert.ok(specialized, `Falta guía especializada ${newSlug}`);
    assert.ok(specialized.relatedSlugs?.includes(originSlug), `Falta enlace de vuelta desde ${newSlug}`);
    assert.ok(origin.relatedSlugs?.includes(newSlug) || origin.sections.some((section) => JSON.stringify(section).includes(newSlug)), `Falta referencia hacia ${newSlug}`);
    assert.equal(specialized.editorialDraft, true, `No publicar sin aprobar ${newSlug}`);
    assert.ok(specialized.sections.some((section) => section.blocks?.some((block) => block.type === "sources")), `Faltan fuentes en ${newSlug}`);
  }
});
