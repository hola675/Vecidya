import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

import { learnArticles, learnCategories, learnPathways } from "../../../app/content/learn.ts";

test("Aprende conserva el catálogo y registra la revisión editorial de Operaciones", () => {
  assert.equal(learnArticles.length, 48);
  assert.equal(new Set(learnArticles.map((article) => article.slug)).size, learnArticles.length);
  const drafts = learnArticles.filter((article) => article.editorialDraft);
  const nonDraft = learnArticles.filter((article) => !article.editorialDraft);
  assert.equal(drafts.length + nonDraft.length, learnArticles.length);
  assert.equal(drafts.length, 18, "Los borradores no se retiran sin aprobación explícita");
  assert.equal(nonDraft.length, 30, "Se conservan las 30 guías aprobadas previamente o legadas sin bandera de borrador");
  for (const slug of [
    "como-organizar-tareas-y-responsables-en-tu-equipo",
    "como-controlar-inventario-sin-perder-productos-ni-datos",
    "como-capacitar-al-equipo-en-herramientas-digitales",
    "cuando-necesita-tu-empresa-un-sistema-erp",
    "como-empezar-proyecto-digital-sin-detener-negocio",
  ]) {
    const article = learnArticles.find((candidate) => candidate.slug === slug);
    assert.ok(article, `Guía operativa ausente: ${slug}`);
    assert.equal(article.editorialDraft, true, `La guía operativa debe permanecer en borrador hasta aprobación explícita: ${slug}`);
    assert.equal(article.sections.length, 9, `La guía operativa debe ofrecer nueve secciones: ${slug}`);
  }
});

test("las guías fundacionales de criterio digital quedan en borrador y conectadas entre sí", () => {
  const priorities = learnArticles.find((article) => article.slug === "el-que-mucho-abarca-poco-aprieta-prioridades-digitales");
  const control = learnArticles.find((article) => article.slug === "domina-la-tecnologia-sin-que-te-domine");
  assert.equal(priorities?.editorialDraft, true, "La guía de prioridades espera aprobación explícita");
  assert.equal(control?.editorialDraft, true, "La guía de control digital espera aprobación explícita");
  assert.equal(priorities.category, "Tecnología explicada");
  assert.equal(control.category, "Tecnología explicada");
  assert(priorities.relatedSlugs?.includes(control.slug));
  assert(control.relatedSlugs?.includes(priorities.slug));
  assert.match(JSON.stringify(priorities), /mucho abarca|prioridad|herramienta/i);
  assert.match(JSON.stringify(control), /control|decisi[oó]n|tecnolog[ií]a/i);
});

test("cada guía responde una pregunta, resume tres ideas y conserva fuentes", () => {
  const categoryNames = new Set<string>(learnCategories.map((category) => category.name));
  for (const article of learnArticles) {
    assert(categoryNames.has(article.category), `Categoría desconocida: ${article.slug}`);
    assert(article.title.trim() && article.intro.trim() && article.excerpt.trim(), `Texto faltante: ${article.slug}`);
    assert.equal(article.enPocasPalabras.length, 3, `Tres ideas: ${article.slug}`);
    assert(article.enPocasPalabras.every((point) => point.trim().length >= 25), `Resumen poco informativo: ${article.slug}`);
    assert(article.sections.length >= 5, `Secciones insuficientes: ${article.slug}`);
    assert(article.cta.to.startsWith("/"), `CTA externo inesperado: ${article.slug}`);
  }
});

test("nuevas guías conservan contexto, pasos, preguntas y fuentes oficiales", () => {
  for (const article of learnArticles.filter((article) => article.editorialDraft)) {
    const blocks = article.sections.flatMap((section) => section.blocks ?? []);
    for (const type of ["steps", "definitions", "example", "faq", "sources", "summary"]) {
      assert(blocks.some((block) => block.type === type), `Falta ${type} en ${article.slug}`);
    }
    const sources = blocks.flatMap((block) => block.type === "sources" ? block.items : []);
    assert(sources.length >= 2, `Faltan fuentes: ${article.slug}`);
    assert(sources.every((source) => source.url.startsWith("https://")), `URL insegura: ${article.slug}`);
    const examples = blocks.filter((block) => block.type === "example");
    assert(examples.every((example) => example.hypothetical === true), `Ejemplo no hipotético: ${article.slug}`);
  }
});

test("itinerarios apuntan únicamente a artículos reales y tienen pasos útiles", () => {
  const slugs = new Set(learnArticles.map((article) => article.slug));
  assert.equal(learnPathways.length, 9);
  assert(learnPathways.some((path) => path.title === "Trabaja mejor cada día" && path.slugs.length === 5));
  assert(learnPathways.some((path) => path.title === "Usa la tecnología con criterio" && path.slugs.includes("domina-la-tecnologia-sin-que-te-domine")));
  for (const path of learnPathways) {
    assert(path.title && path.description && path.slugs.length >= 3);
    assert.equal(new Set(path.slugs).size, path.slugs.length, `Duplicado en ${path.title}`);
    for (const slug of path.slugs) assert(slugs.has(slug), `Ruta rota: ${path.title} -> ${slug}`);
  }
});

test("enlaces relacionados y diagramas referencian contenidos existentes", () => {
  const slugs = new Set(learnArticles.map((article) => article.slug));
  for (const article of learnArticles) {
    for (const slug of article.relatedSlugs ?? []) {
      assert(slugs.has(slug), `Relacionado inexistente: ${article.slug} -> ${slug}`);
      assert.notEqual(slug, article.slug, `Relacionado apunta a sí mismo: ${article.slug}`);
    }
    const localImage = join(process.cwd(), "public", article.image.replace(/^\//, ""));
    assert(existsSync(localImage), `Falta ilustración: ${article.image}`);
    assert(article.imageAlt.trim(), `Falta texto alternativo: ${article.slug}`);
    if (article.editorialDraft) {
      const svg = readFileSync(localImage, "utf8");
      assert(svg.includes("<svg") && svg.includes("<title") && svg.includes("<desc"), `Ilustración sin contexto: ${article.slug}`);
    }
  }
});
