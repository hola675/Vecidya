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
  assert.equal(slugs.length, 47, "APRENDE-EDITORIAL-04B debe conservar las 46 guías y separar la migración de proveedor.");
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

test("Cada guía incluye al menos un ejemplo hipotético comprensible y accionable", () => {
  for (const article of learnArticles) {
    const examples = article.sections.flatMap((section) =>
      (section.blocks ?? []).filter((block) => block.type === "example"));
    assert.ok(examples.length >= 1, `Falta ejemplo estructurado en ${article.slug}`);
    for (const example of examples) {
      assert.equal(example.type, "example");
      assert.equal(example.hypothetical, true, `Ejemplo no identificado como hipotético en ${article.slug}`);
      for (const [label, value] of [
        ["situación", example.context],
        ["problema", example.problem],
        ["enfoque", example.approach],
        ["aprendizaje", example.lesson],
      ] as const) {
        assert.ok(value.trim().split(/\s+/u).length >= 5, `${label} demasiado breve en ${article.slug}`);
      }
      assert.ok(example.actions.length >= 2, `Faltan pasos aplicables en ${article.slug}`);
      assert.ok(example.actions.every((action) => action.trim().split(/\s+/u).length >= 4), `Paso poco explicativo en ${article.slug}`);
    }
  }
});

test("La selección y la migración de proveedor quedan como decisiones separadas", () => {
  const choosing = getLearnArticle("como-elegir-y-cambiar-proveedor-de-dominio-y-hosting");
  const migration = getLearnArticle("como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo");
  assert.ok(choosing && migration);
  assert.equal(choosing.editorialDraft, false, "La guía histórica conserva su aprobación editorial");
  assert.equal(migration.editorialDraft, true, "La guía nueva permanece en revisión");
  assert.match(choosing.title, /elegir proveedor/i);
  assert.match(migration.title, /cambiar de proveedor/i);
  assert.ok(choosing.relatedSlugs?.includes(migration.slug));
  assert.ok(migration.relatedSlugs?.includes(choosing.slug));
  assert.match(JSON.stringify(choosing), /renovaci[oó]n|costo|control administrativo/i);
  assert.match(JSON.stringify(migration), /DNS|correo|cancelar|comprobar/i);
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

test("Las seis guías especializadas aprobadas mantienen sus enlaces y fuentes", () => {
  for (const [originSlug, newSlug] of splitPairs) {
    const origin = getLearnArticle(originSlug);
    const specialized = getLearnArticle(newSlug);
    assert.ok(origin, `Falta guía original ${originSlug}`);
    assert.ok(specialized, `Falta guía especializada ${newSlug}`);
    assert.ok(specialized.relatedSlugs?.includes(originSlug), `Falta enlace de vuelta desde ${newSlug}`);
    assert.ok(origin.relatedSlugs?.includes(newSlug) || origin.sections.some((section) => JSON.stringify(section).includes(newSlug)), `Falta referencia hacia ${newSlug}`);
    assert.equal(specialized.editorialDraft, false, `La aprobación editorial debe mantenerse en ${newSlug}`);
    assert.ok(specialized.sections.some((section) => section.blocks?.some((block) => block.type === "sources")), `Faltan fuentes en ${newSlug}`);
  }
});

test("Las guías madre revisadas no vuelven a convertirse en monolitos", () => {
  const focusedSlugs = [
    "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo",
    "que-puede-hacer-una-inteligencia-artificial-por-un-negocio",
    "antes-de-hacer-publicidad-organiza-tu-presencia-digital",
    "publicidad-digital-como-preparar-una-primera-campana",
    "automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio",
    "dominio-hosting-sitio-web-como-funcionan",
  ];
  for (const slug of focusedSlugs) {
    const article = getLearnArticle(slug);
    assert.ok(article, `Falta guía madre: ${slug}`);
    const words = JSON.stringify(article).replace(/https?:\/\/[^"\s]+/g, " ").split(/\s+/u).filter(Boolean).length;
    assert.ok(words <= 1800, `La guía madre ${slug} volvió a crecer demasiado: ${words} palabras serializadas`);
    assert.ok(article.sections.length <= 10, `La guía madre ${slug} volvió a acumular demasiadas secciones`);
  }
});

test("La jerga técnica prioritaria se explica donde aparece", () => {
  const ai = getLearnArticle("que-puede-hacer-una-inteligencia-artificial-por-un-negocio");
  const campaign = getLearnArticle("publicidad-digital-como-preparar-una-primera-campana");
  const presence = getLearnArticle("como-mantener-actualizada-y-confiable-tu-presencia-digital");
  const dns = getLearnArticle("dns-https-y-correo-como-se-conecta-tu-dominio");
  const control = getLearnArticle("domina-la-tecnologia-sin-que-te-domine");
  const migration = getLearnArticle("como-cambiar-proveedor-dominio-hosting-sin-perder-web-correo");
  assert.ok(ai && campaign && presence && dns && control && migration);

  assert.match(JSON.stringify(ai), /tokens \(unidades de texto procesado\)/i);
  assert.match(JSON.stringify(campaign), /conversi[oó]n.{0,80}acci[oó]n marcada como importante/i);
  assert.match(JSON.stringify(presence), /herramientas de medici[oó]n \(anal[ií]tica\)/i);
  assert.match(JSON.stringify(control), /autenticaci[oó]n multifactor.{0,120}adem[aá]s de la contrase[nñ]a/i);
  assert.match(JSON.stringify(migration), /MX.{0,80}dirigir los mensajes/i);
  assert.match(JSON.stringify(migration), /TXT.{0,80}verificaciones y pol[ií]ticas/i);
  assert.match(JSON.stringify(migration), /conexi[oó]n segura \(HTTPS\)/i);

  const provider = getLearnArticle("como-elegir-y-cambiar-proveedor-de-dominio-y-hosting");
  const analytics = getLearnArticle("analitica-web-que-medir-en-tu-negocio");
  assert.ok(provider && analytics);
  assert.match(JSON.stringify(provider), /certificado de seguridad de la web \(TLS\)/i);
  assert.match(JSON.stringify(analytics), /Origen incierto \(atribuci[oó]n\)/i);

  const dnsDefinitions = dns.sections.flatMap((section) =>
    (section.blocks ?? []).flatMap((block) => block.type === "definitions" ? block.items : []));
  assert.ok(dnsDefinitions.some(({ term, definition }) => /hosting|alojamiento/i.test(term) && /publica la web|funciona/i.test(definition)));
  assert.ok(dnsDefinitions.some(({ term, definition }) => /HTTPS.*TLS|TLS.*HTTPS/i.test(term) && /cifrar|conexi[oó]n/i.test(definition)));
});

test("Las guías especializadas conservan sus temas pedagógicos esenciales", () => {
  const requirements = [
    ["publicidad-digital-como-preparar-una-primera-campana", [/Google Ads|Meta Ads/i, /página de destino/i, /indicadores/i]],
    ["como-elegir-y-cambiar-proveedor-de-dominio-y-hosting", [/control administrativo/i, /costos/i, /renovar|renovación/i]],
    ["como-probar-y-supervisar-automatizaciones-sin-perder-datos", [/duplicados/i, /reintentos/i, /persona/i]],
    ["como-probar-un-asistente-de-ia-con-supervision-humana", [/respuestas inventadas/i, /datos/i, /prueba piloto/i]],
    ["como-mantener-actualizada-y-confiable-tu-presencia-digital", [/canales/i, /reseñas|testimonios/i, /accesibilidad/i]],
    ["dns-https-y-correo-como-se-conecta-tu-dominio", [/DNS/i, /HTTPS/i, /correo/i]],
  ] as const;
  for (const [slug, topics] of requirements) {
    const article = getLearnArticle(slug);
    assert.ok(article, `Falta guía especializada: ${slug}`);
    const content = article.sections.map(({ heading, paragraphs, blocks }) =>
      [heading, ...paragraphs, JSON.stringify(blocks ?? [])].join(" ")).join(" ");
    for (const topic of topics) assert.match(content, topic, `Tema ausente en ${slug}: ${topic}`);
  }
});

test("Las bibliografías de presencia y DNS mantienen su alcance especializado", () => {
  const presence = getLearnArticle("como-mantener-actualizada-y-confiable-tu-presencia-digital");
  const dns = getLearnArticle("dns-https-y-correo-como-se-conecta-tu-dominio");
  assert.ok(presence && dns, "Faltan guías especializadas");
  const sources = (article: typeof presence) => {
    assert.ok(article);
    return article.sections.flatMap((section) =>
      (section.blocks ?? []).flatMap((block) => block.type === "sources" ? block.items : []));
  };
  const presenceSources = sources(presence);
  const dnsSources = sources(dns);
  assert.ok(presenceSources.some((source) => source.url.includes("w3.org/WAI")), "Falta fuente de accesibilidad");
  assert.ok(presenceSources.some((source) => source.url.includes("support.google.com/business")), "Falta fuente de perfil comercial");
  assert.ok(!presenceSources.some((source) => /adspolicy|facebook.com\/business\/help|analytics/.test(source.url)), "Fuentes publicitarias ajenas al mantenimiento");
  assert.ok(dnsSources.some((source) => source.url.includes("rfc1035")), "Falta referencia técnica de registros DNS");
  assert.ok(dnsSources.some((source) => source.url.includes("Transport_Layer_Security")), "Falta referencia TLS");
  assert.ok(!dnsSources.some((source) => /renewal|registration-process|lookup.icann/.test(source.url)), "Fuentes registrales ajenas a DNS");
  assert.match(dns.sections.map((section) => section.paragraphs.join(" ")).join(" "), /SPF, DKIM ni DMARC/, "Falta delimitar alcance de autenticación de correo");
});
