import assert from "node:assert/strict";
import { test } from "node:test";

import { getLearnArticle, learnArticles, learnCategories } from "../../app/content/learn.ts";
import type { LearnBlock } from "../../app/content/learn.ts";

const crmSlug = "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo";
const aiSlug = "que-puede-hacer-una-inteligencia-artificial-por-un-negocio";

test("CRM article exposes practical typed editorial blocks without changing the legacy articles", () => {
  const crmArticle = getLearnArticle(crmSlug);
  assert.ok(crmArticle);
  assert.equal(crmArticle.slug, crmSlug);
  assert.equal(crmArticle.cta.to, "/diagnostico");

  const blocks = crmArticle.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  const expectedBlockTypes: LearnBlock["type"][] = ["definitions", "example", "steps", "callout", "faq", "sources", "summary"];
  for (const type of expectedBlockTypes) {
    assert.ok(blockTypes.has(type), `CRM article is missing the ${type} block.`);
  }

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example && example.type === "example" && example.hypothetical, "The practical example must be identified as hypothetical.");

  const definitions = blocks.find((block) => block.type === "definitions");
  assert.ok(definitions && definitions.type === "definitions");
  assert.deepEqual(definitions.items.map(({ term }) => term), ["Contacto", "Consulta/interesado", "Oportunidad", "Cliente"]);
  assert.equal(crmArticle.sections[1]?.heading, "Contacto, consulta/interesado, oportunidad y cliente");

  const privacyFaq = blocks.find((block) => block.type === "faq" && block.items.some(({ question }) => question.includes("mis datos en el CRM de Vecidya")));
  assert.ok(privacyFaq && privacyFaq.type === "faq");
  const privacyAnswer = privacyFaq.items.find(({ question }) => question.includes("mis datos en el CRM de Vecidya"))?.answer ?? "";
  assert.match(privacyAnswer, /importar y exportar/i);
  assert.match(privacyAnswer, /30 días/);
  assert.match(privacyAnswer, /copia paralela/i);
  assert.doesNotMatch(privacyAnswer, /HighLevel|GHL/i);

  const unchangedArticles = learnArticles.filter((article) => ![crmSlug, aiSlug].includes(article.slug));
  assert.equal(unchangedArticles.length, 2);
  assert.ok(unchangedArticles.every((article) => article.sections.every((section) => !section.blocks)), "Presence and automation must retain their current legacy content structure.");
  assert.equal(learnCategories.length, 5);
});

test("AI article teaches bounded use and reflects optional commercial add-ons", () => {
  const article = getLearnArticle(aiSlug);
  assert.ok(article);
  assert.equal(article.slug, aiSlug);
  assert.equal(article.category, "Inteligencia Artificial");

  const blocks = article.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  const expectedBlockTypes: LearnBlock["type"][] = ["definitions", "list", "example", "steps", "callout", "faq", "sources", "summary"];
  for (const type of expectedBlockTypes) {
    assert.ok(blockTypes.has(type), `AI article is missing the ${type} block.`);
  }

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example && example.type === "example" && example.hypothetical);
  assert.match(example.actions.join(" "), /persona|humana/i);
  assert.match(example.approach, /fuente|informaci[oó]n|hoja/i);

  const commercialFaq = blocks.find((block) => block.type === "faq" && block.items.some(({ question }) => question.includes("opciones de inteligencia artificial ofrece Vecidya")));
  assert.ok(commercialFaq && commercialFaq.type === "faq");
  const commercialAnswer = commercialFaq.items.find(({ question }) => question.includes("opciones de inteligencia artificial ofrece Vecidya"))?.answer ?? "";
  assert.ok(commercialAnswer.trim().split(/\s+/).length <= 35, "The AI offer FAQ should stay concise.");
  assert.match(commercialAnswer, /IA Conversacional/);
  assert.match(commercialAnswer, /IA de Voz/);
  assert.match(commercialAnswer, /Barrio o Ciudad/);
  assert.match(commercialAnswer, /no se activan por defecto/i);

  const usageFaq = blocks.find((block) => block.type === "faq" && block.items.some(({ question }) => question.includes("Cómo se cobra el consumo de IA")));
  assert.ok(usageFaq && usageFaq.type === "faq");
  const usageAnswer = usageFaq.items.find(({ question }) => question.includes("Cómo se cobra el consumo de IA"))?.answer ?? "";
  assert.ok(usageAnswer.trim().split(/\s+/).length <= 35, "The AI consumption FAQ should stay concise.");
  assert.match(usageAnswer, /tokens/);
  assert.match(usageAnswer, /minutos.*telefonía/i);
  assert.match(usageAnswer, /separado|aparte/i);
  assert.match(usageAnswer, /alcance|uso/i);
  assert.match(usageAnswer, /supervisión/i);
  const content = article.sections.map((section) => [section.heading, ...section.paragraphs].join(" ")).join(" ");
  assert.doesNotMatch(content, /asistente de Vecidya ya activo|IA propia ya disponible/i);
  assert.doesNotMatch(content, /\b\d+\s*%/);
});
