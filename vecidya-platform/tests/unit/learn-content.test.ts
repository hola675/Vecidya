import assert from "node:assert/strict";
import { test } from "node:test";

import { getLearnArticle, learnArticles, learnCategories } from "../../app/content/learn.ts";
import type { LearnBlock } from "../../app/content/learn.ts";

const crmSlug = "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo";
const aiSlug = "que-puede-hacer-una-inteligencia-artificial-por-un-negocio";
const automationSlug = "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio";

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

  const presenceArticle = learnArticles.find((article) => article.slug === "antes-de-hacer-publicidad-organiza-tu-presencia-digital");
  assert.ok(presenceArticle?.sections.every((section) => !section.blocks), "The presence guide should remain unchanged.");
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

test("automation article teaches a complete, testable process without claiming guaranteed savings", () => {
  const article = getLearnArticle(automationSlug);
  assert.ok(article);
  assert.equal(article.category, "Automatización");
  assert.equal(article.title, "Automatizaciones: ahorrar tiempo sin complicar tu negocio");
  assert.equal(article.cta.to, "/servicios");

  const blocks = article.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  for (const type of ["definitions", "example", "steps", "callout", "faq", "sources", "summary"] as const) {
    assert.ok(blockTypes.has(type), `Automation article is missing the ${type} block.`);
  }

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example?.type === "example" && example.hypothetical);
  for (const detail of ["evento", "condici", "responsable", "excepci", "comprob", "fall"]) {
    assert.match(JSON.stringify(example), new RegExp(detail, "i"));
  }
  assert.ok(blocks.filter((block) => block.type === "example").length >= 2, "Expected operational and commercial examples.");

  const allText = article.sections.map((section) => `${section.heading} ${section.paragraphs.join(" ")} ${JSON.stringify(section.blocks ?? [])}`).join(" ");
  for (const topic of [/manual/i, /inteligencia artificial/i, /disparador/i, /duplicad/i, /reintento/i, /intervenci[oó]n humana/i, /preferencias/i, /revertir/i]) {
    assert.match(allText, topic);
  }
  assert.doesNotMatch(allText, /ahorro garantizado|ahorrar[aá]s\s+\d+%/i);

  const sourceBlock = blocks.find((block) => block.type === "sources");
  assert.ok(sourceBlock?.type === "sources" && sourceBlock.items.length >= 2);
  const slugs = new Set(learnArticles.map(({ slug }) => slug));
  assert.equal(slugs.size, 4, "The four existing Aprende articles should remain available.");
  assert.ok(slugs.has(crmSlug) && slugs.has(aiSlug) && slugs.has(automationSlug));
});
