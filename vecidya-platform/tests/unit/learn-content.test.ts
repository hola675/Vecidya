import assert from "node:assert/strict";
import { test } from "node:test";

import { getLearnArticle, learnArticles, learnCategories } from "../../app/content/learn.ts";
import type { LearnBlock } from "../../app/content/learn.ts";

const baselineLearnSlugs = [
  "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
  "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
  "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
  "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
  "dominio-hosting-sitio-web-como-funcionan",
  "https-certificados-tls-que-protegen-y-que-no",
  "analitica-web-que-medir-en-tu-negocio",
  "conectar-herramientas-digitales-sin-complicar-tu-negocio",
  "perfil-empresa-google-completar-y-mantener-actualizado",
  "organizar-consultas-mensajes-llamadas-formularios",
  "preparar-respuestas-publicaciones-ia-sin-perder-control",
];

const crmSlug = "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo";
const aiSlug = "que-puede-hacer-una-inteligencia-artificial-por-un-negocio";
const automationSlug = "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio";
const domainSlug = "dominio-hosting-sitio-web-como-funcionan";
const presenceSlug = "antes-de-hacer-publicidad-organiza-tu-presencia-digital";
const httpsSlug = "https-certificados-tls-que-protegen-y-que-no";
const analyticsSlug = "analitica-web-que-medir-en-tu-negocio";
const integrationsSlug = "conectar-herramientas-digitales-sin-complicar-tu-negocio";
const googleProfileSlug = "perfil-empresa-google-completar-y-mantener-actualizado";
const inquiriesSlug = "organizar-consultas-mensajes-llamadas-formularios";
const aiDraftsSlug = "preparar-respuestas-publicaciones-ia-sin-perder-control";

test("CRM article exposes practical typed editorial blocks and respects commercial boundaries", () => {
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
  assert.ok(crmArticle.sections.some((section) => section.heading === "Contacto, consulta/interesado, oportunidad y cliente"));

  const privacyFaq = blocks.find((block) => block.type === "faq" && block.items.some(({ question }) => question.includes("mis datos en el CRM de Vecidya")));
  assert.ok(privacyFaq && privacyFaq.type === "faq");
  const privacyAnswer = privacyFaq.items.find(({ question }) => question.includes("mis datos en el CRM de Vecidya"))?.answer ?? "";
  assert.match(privacyAnswer, /importar y exportar/i);
  assert.match(privacyAnswer, /30 días/);
  assert.match(privacyAnswer, /copia paralela/i);
  assert.doesNotMatch(privacyAnswer, /HighLevel|GHL/i);

});

test("AI article teaches bounded use and reflects optional commercial add-ons", () => {
  const article = getLearnArticle(aiSlug);
  assert.ok(article);
  assert.equal(article.slug, aiSlug);
  assert.equal(article.category, "Inteligencia Artificial");

  const blocks = article.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  const expectedBlockTypes: LearnBlock["type"][] = ["definitions", "list", "example", "callout", "faq", "sources", "summary"];
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
  for (const topic of [/manual/i, /inteligencia artificial/i, /disparador/i, /duplicad/i, /reintento/i, /intervenci[oó]n humana|revisi[oó]n humana|persona responsable/i, /preferencias/i, /revertir/i]) {
    assert.match(allText, topic);
  }
  assert.doesNotMatch(allText, /ahorro garantizado|ahorrar[aá]s\s+\d+%/i);

  const sourceBlock = blocks.find((block) => block.type === "sources");
  assert.ok(sourceBlock?.type === "sources" && sourceBlock.items.length >= 2);
  const slugs = new Set(learnArticles.map(({ slug }) => slug));
  assert.equal(slugs.size, learnArticles.length, "Every guide slug must be unique.");
  for (const slug of baselineLearnSlugs) assert(slugs.has(slug), `An original guide was removed: ${slug}`);
  assert.ok(slugs.has(crmSlug) && slugs.has(aiSlug) && slugs.has(automationSlug));
});

test("technology article explains domains, DNS, hosting, HTTPS and practical ownership without vendor claims", () => {
  const article = getLearnArticle(domainSlug);
  assert.ok(article);
  assert.equal(article.slug, domainSlug);
  assert.equal(article.category, "Tecnología explicada");
  assert.equal(article.title, "Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos");
  assert.equal(article.image, "/assets/learn/diagram-domain-dns-hosting.svg");
  assert.ok(article.relatedSlugs?.includes("dns-https-y-correo-como-se-conecta-tu-dominio"));
  assert.match(article.imageAlt, /persona.*navegador.*DNS.*servidor.*página/i);

  const blocks = article.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  for (const type of ["definitions", "example", "callout", "faq", "sources"] as const) {
    assert.ok(blockTypes.has(type), `Technology article is missing the ${type} block.`);
  }

  const content = article.sections.map((section) => `${section.heading} ${section.paragraphs.join(" ")} ${JSON.stringify(section.blocks ?? [])}`).join(" ");
  for (const topic of [/dominio/i, /registro/i, /hosting|alojamiento/i, /DNS/i, /navegador/i, /servidor web/i, /HTTPS/i, /TLS/i, /correo profesional/i, /renovaci[oó]n/i, /registrador/i, /control administrativo/i]) {
    assert.match(content, topic);
  }
  assert.match(content, /cach[eé].{0,100}(?:no|cada solicitud|no necesariamente)|(?:no|cada solicitud).{0,100}cach[eé]/i);
  assert.match(content, /ICANN Lookup|lookup\.icann\.org/i);
  assert.doesNotMatch(content, /precio de Vecidya|dominio personalizado de Vecidya|hosting de Vecidya/i);
  assert.doesNotMatch(content, /\$\s*\d+|\b\d+\s*(?:USD|EUR|COP)\b/i);

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example?.type === "example" && example.hypothetical);
  for (const detail of ["dominio", "registro", "hosting", "DNS", "HTTPS", "renovación"]) {
    assert.match(JSON.stringify(example), new RegExp(detail, "i"));
  }

  const faq = blocks.find((block) => block.type === "faq");
  assert.ok(faq?.type === "faq" && faq.items.length >= 6);
  assert.ok(faq.items.some(({ question }) => /quién (?:administra|controla)|no sé quién/i.test(question)));

  const sources = blocks.find((block) => block.type === "sources");
  assert.ok(sources?.type === "sources");
  for (const source of ["icann.org", "developer.mozilla.org", "datatracker.ietf.org"]) {
    assert.ok(sources.items.some(({ url }) => url.includes(source)), `Missing primary source ${source}.`);
  }

  const headings = article.sections.map(({ heading }) => heading);
  assert.equal(new Set(headings).size, headings.length, "Article section headings must be unique.");
  assert.equal(new Set(learnArticles.map(({ slug }) => slug)).size, learnArticles.length, "Article slugs must be unique.");
  assert.ok(learnArticles.some(({ category }) => category === "Tecnología explicada"));
  for (const slug of baselineLearnSlugs) assert(getLearnArticle(slug), `Original guide is missing: ${slug}`);
  assert(learnCategories.some((category) => category.name === "Tecnología explicada"), "The original technology category must remain available.");
});

const batch06c = [
  {
    slug: googleProfileSlug,
    title: "Tu Perfil de Empresa en Google: qué completar y mantener actualizado",
    category: "Negocios digitales",
    relatedSlug: presenceSlug,
    topics: [/Google/i, /elegible|elegibilidad/i, /nombre/i, /categor[ií]a/i, /horarios/i, /servicios/i, /foto|imagen/i, /rese[nñ]as/i, /web/i, /posici[oó]n|resultados/i],
  },
  {
    slug: inquiriesSlug,
    title: "Cómo organizar mensajes, llamadas y formularios sin perder consultas",
    category: "CRM y clientes",
    relatedSlug: crmSlug,
    topics: [/mensajes/i, /llamadas/i, /formulario/i, /responsable/i, /siguiente paso/i, /duplicad/i, /hoja de c[aá]lculo/i, /CRM/i, /consentimiento/i, /comercial/i],
  },
  {
    slug: aiDraftsSlug,
    title: "Cómo utilizar IA para preparar respuestas y publicaciones sin perder el control",
    category: "Inteligencia Artificial",
    relatedSlug: aiSlug,
    topics: [/borrador/i, /instrucci[oó]n/i, /datos sensibles|informaci[oó]n sensible/i, /tono/i, /exactitud/i, /publicar/i, /no invent/i, /revis/i],
  },
] as const;

test("06C adds three practical guides to existing categories and preserves shared article metadata", () => {
  for (const expected of batch06c) {
    const article = getLearnArticle(expected.slug);
    assert.ok(article, `Missing article ${expected.slug}.`);
    assert.equal(article.title, expected.title);
    assert.equal(article.category, expected.category);
    assert.deepEqual(article.relatedSlugs, [expected.relatedSlug]);
    assert.ok(article.sections.length >= 7, `${expected.slug} should retain its seven core sections.`);
    assert.equal(new Set(article.sections.map(({ heading }) => heading)).size, article.sections.length);
    assert.ok(article.imageAlt.trim().length > 0);

    const blocks = article.sections.flatMap(({ blocks = [] }) => blocks);
    for (const type of ["example", "steps", "sources", "summary"] as const) {
      assert.ok(blocks.some((block) => block.type === type), `${expected.slug} is missing the ${type} block.`);
    }
    const example = blocks.find((block) => block.type === "example");
    assert.ok(example?.type === "example" && example.hypothetical, `${expected.slug} needs an explicitly hypothetical example.`);

    const text = `${article.intro} ${article.sections.map(({ heading, paragraphs, blocks }) => `${heading} ${paragraphs.join(" ")} ${JSON.stringify(blocks ?? [])}`).join(" ")}`;
    for (const topic of expected.topics) assert.match(text, topic, `${expected.slug} is missing ${topic}.`);
    const sources = blocks.find((block) => block.type === "sources");
    assert.ok(sources?.type === "sources" && sources.items.length > 0);
    for (const { url } of sources.items) assert.match(url, /^https:\/\//);
  }

  const articleSlugs = learnArticles.map(({ slug }) => slug);
  assert.equal(new Set(articleSlugs).size, learnArticles.length, "Article slugs must remain unique.");
  for (const { slug } of batch06c) assert.equal(getLearnArticle(slug)?.category, learnArticles.find(({ slug: related }) => related === slug)?.category);
  for (const category of ["Negocios digitales", "CRM y clientes", "Inteligencia Artificial"]) {
    assert.equal(learnCategories.filter(({ name }) => name === category).length, 1, `The ${category} category must be reused.`);
  }
});

test("06C separates follow-up from marketing permission and gives two safe reusable AI prompts", () => {
  const inquiries = getLearnArticle(inquiriesSlug);
  assert.ok(inquiries);
  const inquiriesText = JSON.stringify(inquiries);
  assert.match(inquiriesText, /responder.{0,100}(?:no|separad).{0,100}consentimiento|consentimiento.{0,100}(?:distint|separad|no es lo mismo)/i);
  assert.match(inquiriesText, /hoja de c[aá]lculo.{0,150}CRM|CRM.{0,150}hoja de c[aá]lculo/i);
  assert.doesNotMatch(inquiriesText, /crear oportunidades autom[aá]ticas|integraci[oó]n real con GHL/i);

  const ai = getLearnArticle(aiDraftsSlug);
  assert.ok(ai);
  const promptItems = ai.sections.flatMap(({ blocks = [] }) => blocks)
    .filter((block) => block.type === "list")
    .flatMap((block) => block.type === "list" ? block.items : [])
    .filter((item) => /^Instrucci[oó]n adaptable [12]:/i.test(item));
  assert.equal(promptItems.length, 2, "The AI guide should provide exactly two adaptable prompt examples.");
  for (const prompt of promptItems) {
    assert.match(prompt, /no invent|si falta|confirma/i);
    assert.match(prompt, /revis/i);
  }
  assert.match(JSON.stringify(ai), /datos sensibles/i);
});

test("presence guide covers channel readiness and paid ads without guarantees", () => {
  const article = getLearnArticle(presenceSlug);
  assert.ok(article);
  assert.equal(article.category, "Negocios digitales");
  assert.equal(article.title, "Antes de hacer publicidad, organiza tu presencia digital");
  assert.equal(article.image, "/assets/learn/diagram-presence-digital.svg");
  assert.equal(article.cta.to, "/diagnostico");

  const blocks = article.sections.flatMap((section) => section.blocks ?? []);
  const blockTypes = new Set(blocks.map((block) => block.type));
  for (const type of ["definitions", "example", "steps", "callout", "list", "faq", "sources", "summary"] as const) {
    assert.ok(blockTypes.has(type), `Presence guide is missing the ${type} block.`);
  }

  const text = article.sections.map((section) => `${section.heading} ${section.paragraphs.join(" ")} ${JSON.stringify(section.blocks ?? [])}`).join(" ");
  for (const topic of [
    /presencia digital/i, /visibilidad/i, /reputaci[oó]n/i, /publicidad/i,
    /a qui[eé]n atiendes/i, /zona de servicio/i, /sitio web/i, /perfil de empresa/i,
    /red social/i, /horarios/i, /m[oó]vil/i, /accesibilidad/i, /privacidad/i,
    /Google Ads/i, /Meta Ads/i, /p[aá]gina de destino|p[aá]gina web|sitio web/i,
    /no necesita anuncios|sin anuncios/i, /testimonios? .*inventad|rese[nñ]as?.*inventad/i,
  ]) assert.match(text, topic);
  assert.match(text, /no garantiza|no se puede asegurar/i);
  assert.match(text, /ning[uú]n canal garantiza/i);
  assert.match(text, /No necesariamente/i);

  const example = blocks.find((block) => block.type === "example");
  assert.ok(example?.type === "example" && example.hypothetical);
  assert.match(JSON.stringify(example), /incomplet|contradicci[oó]n|contradict/i);
  assert.match(JSON.stringify(example), /qui[eé]n|responsable/i);
  assert.match(JSON.stringify(example), /presupuesto|campaña/i);

  const checklistSection = article.sections.find((section) => section.heading === "Checklist para revisar tu presencia digital");
  const checklist = checklistSection?.blocks?.find((block) => block.type === "list");
  assert.ok(checklist?.type === "list");
  const checklistText = checklist.items.join(" ");
  for (const topic of [/nombre/i, /p[uú]blico/i, /ubicaci[oó]n|zona/i, /horarios/i, /contacto/i, /servicios/i, /coherencia/i, /m[oó]vil/i, /accesibilidad/i, /privacidad/i, /responsable/i, /medici[oó]n/i]) {
    assert.match(checklistText, topic);
  }

  const sources = blocks.find((block) => block.type === "sources");
  assert.ok(sources?.type === "sources");
  for (const source of ["Google Search Central", "Google Business Profile", "Google Ads", "Meta", "W3C", "Analytics"]) {
    assert.ok(sources.items.some(({ label }) => label.includes(source)), `Missing official ${source} source.`);
  }
});

test("HTTPS guide explains TLS limits, warning signs and practical website checks", () => {
  const article = getLearnArticle(httpsSlug);
  assert.ok(article);
  assert.equal(article.title, "HTTPS y certificados TLS: qué protegen y qué no");
  assert.equal(article.category, "Tecnología explicada");
  const blocks = article.sections.flatMap(({ blocks = [] }) => blocks);
  for (const type of ["definitions", "example", "steps", "callout", "sources", "summary"] as const) {
    assert.ok(blocks.some((block) => block.type === type), `HTTPS article is missing ${type}.`);
  }
  const text = JSON.stringify(article);
  for (const topic of [/HTTP/, /HTTPS/, /TLS/, /certificado/i, /confiable/i, /advertencia|error/i, /renovaci[oó]n/i, /negocio/i]) {
    assert.match(text, topic);
  }
  const sources = blocks.find((block) => block.type === "sources");
  assert.ok(sources?.type === "sources");
  assert.ok(sources.items.some(({ url }) => url.includes("developer.mozilla.org")));
});

test("web analytics guide distinguishes visits, interactions and conversions with privacy cautions", () => {
  const article = getLearnArticle(analyticsSlug);
  assert.ok(article);
  assert.equal(article.title, "Analítica web básica: qué debes medir en tu negocio");
  assert.equal(article.category, "Tecnología explicada");
  const blocks = article.sections.flatMap(({ blocks = [] }) => blocks);
  for (const type of ["definitions", "example", "steps", "callout", "sources", "summary"] as const) {
    assert.ok(blocks.some((block) => block.type === type), `Analytics article is missing ${type}.`);
  }
  const text = JSON.stringify(article);
  for (const topic of [/visitas/i, /interacciones/i, /conversiones/i, /muestra/i, /privacidad/i, /consentimiento/i, /negocio/i]) {
    assert.match(text, topic);
  }
  const sources = blocks.find((block) => block.type === "sources");
  assert.ok(sources?.type === "sources");
  assert.ok(sources.items.some(({ url }) => url.includes("support.google.com/analytics")));
});

test("integrations guide defines APIs, webhooks and CSV while preventing data loss and duplicates", () => {
  const article = getLearnArticle(integrationsSlug);
  assert.ok(article);
  assert.equal(article.title, "Cómo conectar herramientas digitales sin complicar tu negocio");
  assert.equal(article.category, "Tecnología explicada");
  const blocks = article.sections.flatMap(({ blocks = [] }) => blocks);
  for (const type of ["definitions", "example", "steps", "callout", "sources", "summary"] as const) {
    assert.ok(blocks.some((block) => block.type === type), `Integrations article is missing ${type}.`);
  }
  const text = JSON.stringify(article);
  for (const topic of [/integraci[oó]n/i, /API/i, /webhook/i, /CSV/i, /duplicad/i, /respaldo|copia/i, /prueba/i]) {
    assert.match(text, topic);
  }
  const sources = blocks.find((block) => block.type === "sources");
  assert.ok(sources?.type === "sources");
  assert.ok(sources.items.length > 0);
});

test("06B technology guides remain available alongside new unique 06C slugs", () => {
  const newSlugs = [httpsSlug, analyticsSlug, integrationsSlug];
  assert.equal(new Set(learnArticles.map(({ slug }) => slug)).size, learnArticles.length);
  for (const slug of baselineLearnSlugs) assert(getLearnArticle(slug), `A 06B/06C-era guide is missing: ${slug}`);
  for (const slug of newSlugs) {
    assert.equal(getLearnArticle(slug)?.category, "Tecnología explicada");
  }
  assert.equal(learnCategories.filter(({ name }) => name === "Tecnología explicada").length, 1);
});
