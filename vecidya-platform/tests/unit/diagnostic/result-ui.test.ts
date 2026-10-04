import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  areaItems, CONFIDENCE_DISPLAY, DiagnosticResult, dimensionDisplay, dimensionOverview, PRIORITY_SLOT_DISPLAY, riskItems, strengthItems, uncertaintyGroups,
} from "../../../app/components/diagnostic-result/index.ts";
import {
  DIGITAL_DIMENSION_IDS, DIMENSION_PRESENTATION_STATUSES, GOLDEN_PERSONAS, NARRATIVE_BLOCK_KINDS, TERMINOLOGY, buildDiagnosticNarrative, buildDiagnosticOutcome, deriveConstraintsAndPriorities, deriveSemanticFacts,
  narrativeBlocks, runGoldenPersonaPipeline, scoreContextualDimensions, type DiagnosticNarrative, type DiagnosticOutcome,
} from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-09 — experiencia de resultado: la UI ordena, etiqueta y pliega el `DiagnosticNarrative`, nunca lo reinterpreta.
 * DIAG-V3-10 cambió dos contratos de forma intencional: ahora existe un porcentaje general (en la tarjeta de presencia,
 * nunca en las prioridades) y las dependencias se muestran como riesgos, no como áreas para fortalecer.
 */

function resultOf(personaId: string): { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome } {
  const persona = GOLDEN_PERSONAS.find((item) => item.id === personaId)!;
  const answers = runGoldenPersonaPipeline(persona).answers;
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  const narrative = buildDiagnosticNarrative({ answers, scoring, priorities, semanticFacts });
  return { narrative, outcome: buildDiagnosticOutcome({ scoring, priorities, semanticFacts, narrative }) };
}
const RESULTS = Object.fromEntries(GOLDEN_PERSONAS.map((persona) => [persona.id, resultOf(persona.id)]));
const GOLDEN = Object.fromEntries(Object.entries(RESULTS).map(([id, result]) => [id, result.narrative]));
const OUTCOMES = Object.fromEntries(Object.entries(RESULTS).map(([id, result]) => [id, result.outcome]));
const outcomeFor = (narrative: DiagnosticNarrative) => Object.values(RESULTS).find((result) => result.narrative.profile === narrative.profile && result.narrative.currentState.text === narrative.currentState.text)!.outcome;
const render = (narrative: DiagnosticNarrative) => renderToStaticMarkup(createElement(DiagnosticResult, { narrative, outcome: outcomeFor(narrative) }));
const decode = (html: string) => html.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const all = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((match) => decode(match[1]!));
const between = (html: string, open: RegExp, close: string) => { const start = html.search(open); return start < 0 ? "" : html.slice(start, html.indexOf(close, start) + close.length); };
/** Filas de dimensión completas (cada fila contiene su propia lista de evidencia). */
const dimensionRows = (html: string) => { const list = between(html, /<ul class="dr-dim-list"/, "</ul></section>"); return list.split(/<li class="dr-dim /).slice(1); };
const HTML = Object.fromEntries(Object.entries(GOLDEN).map(([id, narrative]) => [id, render(narrative)]));

test("09 all 12 golden results render the full hierarchy with the eight dimensions in canonical order", () => {
  assert.equal(Object.keys(HTML).length, 12);
  for (const [id, html] of Object.entries(HTML)) {
    const narrative = GOLDEN[id]!;
    const order = ["dr-hero", "dr-focus-title", "dr-dimensions-title", "dr-method-title"].map((marker) => html.indexOf(marker));
    assert.ok(order.every((index, position) => index >= 0 && (position === 0 || index > order[position - 1]!)), `${id}: summary → focus → dimensions → method`);
    assert.deepEqual(all(html, /<h3 class="dr-dim__label">(.*?)<\/h3>/g), DIGITAL_DIMENSION_IDS.map((dimension) => narrative.dimensions.find((item) => item.dimension === dimension)!.label), `${id}: stable order`);
  }
});

test("09/10 score display: a reading shows its percentage paired with state and confidence; the only other percentage is the overall presence", () => {
  for (const [id, html] of Object.entries(HTML)) {
    const narrative = GOLDEN[id]!;
    const rows = dimensionRows(html);
    narrative.dimensions.forEach((dimension, index) => {
      const row = rows[index]!;
      if (dimension.score !== null) {
        assert.match(textOf(row), new RegExp(`${dimension.score}%`), `${id}: ${dimension.dimension}`);
        assert.match(textOf(row), new RegExp(`Confianza ${CONFIDENCE_DISPLAY[dimension.confidence].label.toLowerCase()}`), `${id}: confidence next to the score`);
        assert.ok(textOf(row).includes(dimensionDisplay(dimension).statusLabel), `${id}: state label next to the score`);
      }
    });
    const overall = OUTCOMES[id]!.overall.index.displayScore;
    const overallStatus = OUTCOMES[id]!.overall;
    const percentages = textOf(html.replace(/<details class="dr-help">[\s\S]*?<\/details>/g, "")).match(/\d+%/g) ?? [];
    assert.equal(percentages.length, narrative.dimensions.filter((item) => item.score !== null).length + (overall === null ? 0 : 1), `${id}: dimension percentages plus at most the overall presence`);
    const hero = textOf(between(html, /<header class="dr-hero/, "</header>").replace(/<details class="dr-help">[\s\S]*?<\/details>/g, ""));
    assert.deepEqual(hero.match(/\d+%/g) ?? [], overall === null ? [] : [`${overall}%`], `${id}: the hero only shows the overall presence`);
    if (overall !== null) {
      assert.ok(hero.includes("Estado Actual:"), `${id}: canonical global heading`);
      assert.ok(hero.includes(overallStatus.publicLabel!), `${id}: public global code`);
      assert.ok(!hero.includes(`dr-presence__label">${overallStatus.label}`), `${id}: image owns the descriptive global label`);
    }
    assert.ok(!/%/.test(textOf(between(html, /<section aria-labelledby="dr-focus-title"/, "</section>"))), `${id}: priorities never show a percentage`);
  }
});

test("09 null states: no score is never 0%, never shows confidence and is explained by its own state", () => {
  const labels = { uncertain: "Sin información suficiente", not_assessed: "No evaluado", not_applicable: "No aplica" } as const;
  let seen = 0;
  for (const [id, html] of Object.entries(HTML)) {
    const rows = dimensionRows(html);
    GOLDEN[id]!.dimensions.forEach((dimension, index) => {
      if (dimension.score !== null) return;
      seen += 1;
      const text = textOf(rows[index]!);
      assert.ok(dimensionDisplay(dimension).percent === null && !/%|null/.test(text), `${id}: ${dimension.dimension} → ${text}`);
      assert.ok(!/Confianza (alta|media|limitada)|dr-confidence/.test(rows[index]!), `${id}: no confidence without an estimate`);
      assert.match(text, /Sin porcentaje/);
      assert.ok(text.includes(labels[dimension.status as keyof typeof labels]), `${id}: ${dimension.status}`);
      assert.ok(text.includes(dimension.interpretation.text), `${id}: narrative explanation kept`);
    });
  }
  assert.ok(seen > 30, "goldens exercise every null state");
});

test("09 confidence: three user-facing levels, preliminary readings are hatched and explained once", () => {
  assert.deepEqual(Object.values(CONFIDENCE_DISPLAY).map((item) => item.label), ["Alta", "Media", "Limitada"]);
  for (const [id, html] of Object.entries(HTML)) {
    const narrative = GOLDEN[id]!;
    const preliminary = narrative.dimensions.filter((item) => item.score !== null && item.confidence === "low").length;
    assert.equal((html.match(/dr-meter__fill--preliminary/g) ?? []).length, preliminary, `${id}: hatch only on limited confidence`);
    const notes = (textOf(html).match(/barras rayadas/g) ?? []).length;
    assert.equal(notes, preliminary > 0 ? 1 : 0, `${id}: one aggregate explanation, not one per card`);
    assert.ok(!/basado en pocas respuestas/.test(textOf(html)));
  }
  const appointments = dimensionOverview(GOLDEN.appointment_business!).items;
  assert.deepEqual(appointments.filter((item) => item.percent).map((item) => [item.percent, item.confidence?.label, item.preliminary]), [["100%", "Limitada", true], ["94%", "Alta", false]], "a 100% with little evidence is visibly weaker than a well-supported 94%");
  assert.match(textOf(HTML.appointment_business!), /Un porcentaje alto con confianza limitada quiere decir que lo que se vio es positivo, pero no hubo suficiente evidencia/);
});

test("09 primary constraint: strong hierarchy, dimension, certainty and confidence; unknown is framed as something to confirm", () => {
  const html = HTML.professional_appointments!;
  const constraint = between(html, /<div class="dr-constraint /, "</div></div>");
  assert.match(constraint, /<h3 class="dr-constraint__title">Base de trabajo<\/h3>/);
  assert.ok(textOf(constraint).includes(GOLDEN.professional_appointments!.primaryConstraint!.text));
  assert.match(textOf(constraint), /Lo que más limita hoy.*Confirmado.*Confianza media/);
  const idea = textOf(between(HTML.idea_early_stage!, /<div class="dr-constraint /, "</div>"));
  assert.match(idea, /^Lo primero por confirmar Cómo te encuentran/);
  for (const html of Object.values(HTML)) assert.equal((html.match(/class="dr-constraint /g) ?? []).length, 1);
});

test("09 no-constraint result: a valid, calm result with no invented constraint or priorities", () => {
  const narrative = GOLDEN.appointment_business!;
  assert.equal(narrative.primaryConstraint, null);
  const text = textOf(HTML.appointment_business!);
  assert.match(text, /Ningún freno destaca en lo evaluado/);
  assert.ok(text.includes(narrative.nextFocus.text));
  assert.equal(text.split(narrative.nextFocus.text).length - 1, 1, "next focus shown once");
  assert.ok(!/Por dónde empezar|dr-priority-list/.test(HTML.appointment_business!));
  assert.ok(!/Lo primero por confirmar/.test(text));
});

test("09 priorities: rendered in the exact domain array order, never re-sorted by rank, score or severity", () => {
  for (const [id, html] of Object.entries(HTML)) {
    assert.deepEqual(all(html, /<p class="dr-priority__statement">(.*?)<\/p>/g), GOLDEN[id]!.priorities.map((item) => item.statement.text), id);
    for (const priority of GOLDEN[id]!.priorities) assert.ok(textOf(html).includes(PRIORITY_SLOT_DISPLAY[priority.slot]));
  }
  const source = GOLDEN.professional_appointments!;
  const reversed = { ...source, priorities: [...source.priorities].reverse() };
  assert.deepEqual(all(render(reversed), /<p class="dr-priority__statement">(.*?)<\/p>/g), reversed.priorities.map((item) => item.statement.text), "the component does not sort");
  const nextFocusShown = (narrative: DiagnosticNarrative) => /dr-next-focus/.test(render(narrative));
  assert.equal(nextFocusShown(source), false, "with several priorities the next focus would repeat the list");
  assert.equal(nextFocusShown(GOLDEN.creator_personal_brand!), true, "with one priority it says there is no second focus");
});

test("09 strengths and areas: confirmed vs signal, partial vs probable vs confirmed weakness; uncertainty is never an area to improve", () => {
  for (const [id, narrative] of Object.entries(GOLDEN)) {
    for (const item of strengthItems(narrative)) assert.equal(item.label, item.block.certainty === "confirmed" ? "Fortaleza confirmada" : "Señal positiva", id);
    for (const item of areaItems(narrative)) {
      assert.ok(["weakness", "partial"].includes(item.block.kind), `${id}: ${item.block.kind}`);
      if (item.block.kind === "partial") assert.equal(item.label, "Funciona en parte");
      if (item.block.kind === "weakness") assert.equal(item.label, item.block.certainty === "confirmed" ? "Necesita refuerzo" : "Posible debilidad");
    }
    const html = HTML[id]!;
    assert.equal(/Lo que funciona/.test(html), narrative.strengths.length > 0, `${id}: strengths section only when strengths exist`);
    assert.equal(/Áreas para fortalecer/.test(html), narrative.weaknesses.length > 0, `${id}: areas section only when needed`);
    assert.ok(!/Debilidades/.test(html));
  }
  assert.match(textOf(HTML.appointment_business!), /Fortaleza confirmada El seguimiento a tus pacientes es constante\. Señal positiva Hay señales de que/);
  assert.match(textOf(HTML.professional_appointments!), /Posible debilidad Hay señales de que parte del seguimiento/);
});

test("09 contradictions and uncertainties keep both sides and stay separate from not-applicable", () => {
  for (const [id, narrative] of Object.entries(GOLDEN)) {
    const html = HTML[id]!;
    for (const block of narrative.contradictions) assert.ok(textOf(html).includes(block.text), `${id}: ${block.id}`);
    assert.equal(/Lo que encontramos al cruzar tus respuestas/.test(html), narrative.contradictions.length > 0);
    assert.ok(!/contradicci/i.test(textOf(html)), `${id}: no «contradicción» in prominent copy`);
    assert.equal(/id="dr-uncertain-title"/.test(html), narrative.uncertainties.length > 0 || riskItems(narrative).length > 0, `${id}: risk/uncertainty section only when needed`);
    for (const risk of riskItems(narrative)) assert.ok(risk.block.sourceQuestionIds.length > 0 && textOf(between(html, /<section aria-labelledby="dr-uncertain-title"/, "</section>")).includes(risk.block.text), `${id}: risk with provenance in the risk section`);
    const uncertaintyText = textOf(between(html, /<section aria-labelledby="dr-uncertain-title"/, "</section>"));
    assert.ok(!/No aplica/.test(uncertaintyText), `${id}: not-applicable is not an uncertainty`);
  }
});

test("09 pre-launch: a visibly different result about preparation, without operational failures", () => {
  const narrative = GOLDEN.idea_early_stage!;
  const html = HTML.idea_early_stage!;
  assert.equal(narrative.lifecycle, "prelaunch");
  assert.match(html, /class="dr-hero dr-hero--prelaunch"/);
  assert.match(textOf(html), /Proyecto en preparación Antes del lanzamiento/);
  assert.match(textOf(html), /Antes del lanzamiento, las áreas que dependen de tener actividad real aparecen sin porcentaje: no son fallas/);
  assert.ok(!/Áreas para fortalecer|Necesita refuerzo|Posible debilidad/.test(textOf(html)));
  assert.deepEqual(uncertaintyGroups(narrative).map((group) => group.title), ["Lo que falta confirmar", "Para verificar después del lanzamiento"]);
  assert.equal(dimensionOverview(narrative).preliminaryNote, null, "a single note before launch");
  for (const live of Object.values(GOLDEN).filter((item) => item.lifecycle === "live")) assert.equal(dimensionOverview(live).lifecycleNote, null);
});

test("09 terminology: clinical, nonprofit and every other profile keep their language across narrative and UI copy", () => {
  for (const [id, narrative] of Object.entries(GOLDEN)) {
    const text = textOf(HTML[id]!).toLowerCase();
    for (const term of TERMINOLOGY[narrative.profile].avoid) assert.ok(!new RegExp(`\\b${term.toLowerCase()}`).test(text), `${id} (${narrative.profile}): «${term}»`);
  }
  for (const id of ["appointment_business", "professional_appointments", "nonprofit_community"]) assert.ok(!/\bclientes?\b/i.test(textOf(HTML[id]!)), `${id}: «cliente»`);
  assert.match(textOf(HTML.appointment_business!), /Práctica de salud .*tus pacientes/);
  assert.match(textOf(HTML.nonprofit_community!), /Organización sin fines de lucro .*apoyar o participar/);
});

test("09 provenance: readable evidence topics in a disclosure, never question IDs, fact IDs or formulas", () => {
  for (const [id, narrative] of Object.entries(GOLDEN)) {
    const html = HTML[id]!;
    const rows = dimensionRows(html);
    narrative.dimensions.forEach((dimension, index) => {
      const row = rows[index]!;
      assert.equal(/<details class="dr-evidence">/.test(row), dimension.evidence.length > 0, `${id}: ${dimension.dimension}`);
      for (const item of dimension.evidence) assert.ok(textOf(row).includes(item.topic), `${id}: topic «${item.topic}»`);
    });
    assert.ok(!/q2_|contradiction:|priority:|dimension:|sourceFact|×|\*\s*\d/.test(html), `${id}: internal provenance leaked`);
  }
});

test("09 no internal codes in visible text or accessible names", () => {
  const codes = [...DIGITAL_DIMENSION_IDS, ...DIMENSION_PRESENTATION_STATUSES, ...NARRATIVE_BLOCK_KINDS.filter((kind) => kind.includes("_")), "prelaunch", "high", "medium", "low", "confirmed", "probable", "unknown", "null", "undefined"];
  for (const [id, html] of Object.entries(HTML)) {
    const visible = `${textOf(html)} ${all(html, /aria-label="([^"]*)"/g).join(" ")}`;
    for (const code of codes) assert.ok(!new RegExp(`\\b${code}\\b`).test(visible), `${id}: «${code}» visible`);
    assert.ok(!/\b[a-z]+_[a-z_]+\b/.test(visible), `${id}: snake_case visible`);
  }
});

test("09 the UI displays narrative text verbatim instead of paraphrasing it", () => {
  for (const [id, narrative] of Object.entries(GOLDEN)) {
    const text = textOf(HTML[id]!);
    const omitted = new Set(narrative.priorities.length > 1 ? [narrative.nextFocus.id] : []);
    for (const block of narrativeBlocks(narrative)) if (!omitted.has(block.id)) assert.ok(text.includes(block.text), `${id}: ${block.id} missing or rewritten`);
  }
});

test("09 accessibility basics: one h1, no skipped heading levels, native disclosures, decorative graphics hidden, labelled sections", () => {
  for (const [id, html] of Object.entries(HTML)) {
    const levels = all(html, /<h([1-6])[\s>]/g).map(Number);
    assert.equal(levels.filter((level) => level === 1).length, 1, `${id}: one h1`);
    levels.forEach((level, index) => { if (index > 0) assert.ok(level <= levels[index - 1]! + 1, `${id}: h${levels[index - 1]} → h${level}`); });
    assert.equal((html.match(/<details/g) ?? []).length, (html.match(/<summary/g) ?? []).length, `${id}: every disclosure has a summary`);
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) assert.match(svg, /aria-hidden="true"/);
    for (const track of html.match(/<span[^>]*class="dr-meter__track"[^>]*>/g) ?? []) assert.match(track, /aria-hidden="true"/);
    for (const label of all(html, /aria-labelledby="([^"]+)"/g)) assert.match(html, new RegExp(`id="${label}"`), `${id}: ${label}`);
    for (const list of html.match(/<(ul|ol) class="dr-(priority-list|reading-list|dim-list|mixed__list)"[^>]*>/g) ?? []) assert.match(list, /role="list"/);
    assert.ok(!/Procedencia/.test(html), `${id}: no debug panel in the product component`);
  }
});

test("09 the preview route is registered only by the development server", async () => {
  const load = async (mode: string) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = mode;
    try {
      const routes = (await import(new URL(`../../../app/routes.ts?mode=${mode}`, import.meta.url).href)).default as { path?: string }[];
      return routes.some((route) => route.path?.startsWith("__dev/"));
    } finally {
      process.env.NODE_ENV = previous;
    }
  };
  assert.equal(await load("production"), false, "build and typegen");
  assert.equal(await load("development"), true, "react-router dev");
});
