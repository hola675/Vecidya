import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MethodologyArticle, METHODOLOGY_PATH } from "../../../app/components/diagnostic-methodology/index.ts";
import { MethodNote } from "../../../app/components/diagnostic-result/index.ts";
import {
  bandFor, computeDigitalPresenceIndex, deriveConstraintsAndPriorities, DIGITAL_DIMENSION_IDS, DIMENSION_NARRATIVE, displayScoreFor, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, GOLDEN_PERSONAS,
  OVERALL_INDEX_MODEL, OVERALL_INDEX_VERSION, QUESTION_BANK_V2, QUESTION_TOPICS, ROUTE_HARD_CAP, runDiagnosticPipelineV3, runGoldenPersonaPipeline, scoreContextualDimensions, type AnswersV2,
} from "../../../app/features/diagnostic/index.ts";
import {
  DIMENSION_METHODOLOGY, METHODOLOGY_CHANGE_RULES, METHODOLOGY_CLAIM_TYPES, METHODOLOGY_ENGINE_CONTRACT, METHODOLOGY_LINK_LABEL, METHODOLOGY_PRIVACY, METHODOLOGY_SECTIONS,
  METHODOLOGY_SOURCE_TYPES, METHODOLOGY_SOURCES, METHODOLOGY_VERSION, RECOMMENDATION_CHAIN, RESULT_METHOD_NOTES, type MethodologyClaim,
} from "../../../app/features/diagnostic/qbv2-methodology.ts";

/** DIAG-V3-11 — metodología: describe el motor congelado sin contradecirlo ni sobreafirmar. */

const DOMAIN = "app/features/diagnostic";
const decode = (html: string) => html.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const claims: readonly MethodologyClaim[] = [...METHODOLOGY_SECTIONS.flatMap((section) => section.detail), ...Object.values(DIMENSION_METHODOLOGY).map((area) => area.whyItMatters)];
/** Todo el copy visible de la metodología, para las auditorías de lenguaje. */
const allCopy = [
  ...METHODOLOGY_SECTIONS.flatMap((section) => [section.title, section.simple, ...section.detail.map((item) => item.text)]),
  ...Object.values(DIMENSION_METHODOLOGY).flatMap((area) => [area.label, area.evaluates, area.high, area.low, area.notMeaning, area.whyItMatters.text]),
  ...METHODOLOGY_SOURCES.flatMap((source) => source.supports.map((item) => item.principle)),
  ...METHODOLOGY_CHANGE_RULES.map((rule) => rule.change), ...RESULT_METHOD_NOTES, ...RECOMMENDATION_CHAIN, METHODOLOGY_LINK_LABEL,
];
const pipelineOf = (answers: AnswersV2) => {
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  return { scoring, priorities: deriveConstraintsAndPriorities(scoring), result: runDiagnosticPipelineV3(answers) };
};
const goldens = GOLDEN_PERSONAS.map((persona) => ({ persona, ...pipelineOf(runGoldenPersonaPipeline(persona).answers as AnswersV2) }));

test("11 methodology version exists, is separate from the app version and pins the engine contract it describes", () => {
  assert.match(METHODOLOGY_VERSION, /^\d+\.\d+$/);
  const app = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
  assert.notEqual(METHODOLOGY_VERSION, app.version, "methodology version is not the application version");
  // Si el motor cambia uno de estos valores, la metodología debe revisarse y subir de versión (METHODOLOGY_CHANGE_RULES).
  assert.deepEqual({ ...METHODOLOGY_ENGINE_CONTRACT }, { overallIndexVersion: 1, bands: { developingFrom: 40, solidFrom: 70 }, minScoredDimensions: 3, minCoverage: 1 / 3, routeHardCap: 24, maxPriorities: 3 });
  assert.equal(METHODOLOGY_ENGINE_CONTRACT.overallIndexVersion, OVERALL_INDEX_VERSION);
  assert.equal(METHODOLOGY_ENGINE_CONTRACT.bands, OVERALL_INDEX_MODEL.bands);
  assert.equal(METHODOLOGY_ENGINE_CONTRACT.routeHardCap, ROUTE_HARD_CAP);
  assert.ok(METHODOLOGY_CHANGE_RULES.some((rule) => rule.increment === "major") && METHODOLOGY_CHANGE_RULES.some((rule) => rule.increment === "none"));
});

test("11 the eight dimensions: one definition each, engine labels, evidence questions that really observe the area", () => {
  assert.deepEqual(Object.keys(DIMENSION_METHODOLOGY), [...DIGITAL_DIMENSION_IDS], "eight areas in canonical order");
  const bank = new Set(QUESTION_BANK_V2.map((question) => question.id));
  for (const id of DIGITAL_DIMENSION_IDS) {
    const area = DIMENSION_METHODOLOGY[id];
    assert.equal(area.id, id);
    assert.equal(area.label, DIMENSION_NARRATIVE[id].label, `${id}: final result label`);
    for (const field of [area.evaluates, area.high, area.low, area.notMeaning]) assert.ok(field.trim().length > 20, `${id}: complete definition`);
    assert.ok(area.notMeaning.startsWith("No "), `${id}: states what it does not mean`);
    assert.ok(area.evidenceQuestionIds.length >= 2, `${id}: evidence examples`);
    for (const questionId of area.evidenceQuestionIds) {
      assert.ok(bank.has(questionId) && QUESTION_TOPICS[questionId], `${id}: ${questionId} exists with a visible topic`);
      assert.ok(EVIDENCE_MAPPING[questionId]?.dimensions.includes(id), `${id}: ${questionId} is mapped to this area`);
    }
    const direct = (questionId: string) => (EVIDENCE_DIRECTNESS[questionId]?.[id] ?? EVIDENCE_MAPPING[questionId]!.semanticRole) === "direct";
    assert.ok(area.evidenceQuestionIds.some(direct), `${id}: at least one example observes the area directly`);
  }
});

test("11 sources: unique, official or institutional, mapped to known areas, each one used and never claimed for the formula", () => {
  const ids = METHODOLOGY_SOURCES.map((source) => source.id);
  assert.equal(new Set(ids).size, ids.length, "unique source ids");
  for (const source of METHODOLOGY_SOURCES) {
    assert.match(source.url, /^https:\/\//, source.id);
    assert.ok(METHODOLOGY_SOURCE_TYPES.includes(source.sourceType), source.id);
    assert.ok(source.title && source.organization && source.supports.length > 0, source.id);
    for (const item of source.supports) assert.ok(DIGITAL_DIMENSION_IDS.includes(item.dimension), `${source.id}: known area`);
    assert.ok(claims.some((item) => item.sourceIds?.includes(source.id)), `${source.id}: cited by a claim`);
  }
  for (const item of claims) {
    assert.ok(METHODOLOGY_CLAIM_TYPES.includes(item.type), item.id);
    if (item.type === "external_principle") assert.ok(item.sourceIds && item.sourceIds.length > 0, `${item.id}: an external principle cites its sources`);
    else assert.equal(item.sourceIds, undefined, `${item.id}: only external principles cite sources`);
    for (const sourceId of item.sourceIds ?? []) assert.ok(ids.includes(sourceId), `${item.id}: unknown source ${sourceId}`);
  }
  // Un principio de un área solo cita fuentes que respaldan esa misma área.
  for (const area of Object.values(DIMENSION_METHODOLOGY)) {
    assert.ok(["external_principle", "product_interpretation"].includes(area.whyItMatters.type), `${area.id}: external principle or Vecidya criterion`);
    for (const sourceId of area.whyItMatters.sourceIds ?? []) assert.ok(METHODOLOGY_SOURCES.find((source) => source.id === sourceId)!.supports.some((item) => item.dimension === area.id), `${area.id}: ${sourceId} supports this area`);
  }
  // Ninguna fuente se presenta como validación de la fórmula, las bandas o el orden de prioridades.
  for (const source of METHODOLOGY_SOURCES) for (const item of source.supports) assert.ok(!/porcentaje|f[oó]rmula|puntuaci|banda|prioridad|confianza del resultado/i.test(item.principle), `${source.id}: ${item.principle}`);
  assert.ok(/ninguna fuente valida la fórmula/i.test(METHODOLOGY_SECTIONS.find((section) => section.id === "sources")!.simple));
  // Fuentes externas solo como «por qué importa» de un área; nunca en las reglas del índice, la confianza o las prioridades.
  const sectionClaims = METHODOLOGY_SECTIONS.flatMap((section) => section.detail);
  assert.ok(sectionClaims.every((item) => item.type !== "external_principle"), "no section rule is attributed to an external source");
});

test("11 attribution: every accepted source keeps the verified passage; unverifiable sources are not cited", () => {
  for (const source of METHODOLOGY_SOURCES) {
    assert.ok(source.excerpt.trim().length > 30, `${source.id}: verified passage`);
    assert.match(source.verifiedOn, /^\d{4}-\d{2}-\d{2}$/, source.id);
  }
  // Cierre DIAG-V3-11: solo título o avance legibles → retiradas; sus áreas quedan como criterio de Vecidya.
  for (const removed of ["hbr-lead-response", "hbr-zero-defections"]) assert.ok(!METHODOLOGY_SOURCES.some((source) => source.id === removed), removed);
  for (const id of ["conversion_access", "relationship_recurrence"] as const) {
    assert.equal(DIMENSION_METHODOLOGY[id].whyItMatters.type, "product_interpretation", `${id}: Vecidya criterion`);
    assert.equal(DIMENSION_METHODOLOGY[id].whyItMatters.sourceIds, undefined, `${id}: no external citation`);
  }
  const withSources = DIGITAL_DIMENSION_IDS.filter((id) => DIMENSION_METHODOLOGY[id].whyItMatters.type === "external_principle");
  assert.deepEqual(withSources, ["clarity_positioning", "digital_foundation", "discovery", "trust_reputation", "measurement_optimization", "digital_readiness"]);
  // El pasaje verificado es auditoría: no se muestra (puede llevar cifras que el texto no afirma).
  const html = renderToStaticMarkup(createElement(MethodologyArticle));
  for (const source of METHODOLOGY_SOURCES) assert.ok(!textOf(html).includes(source.excerpt), `${source.id}: passage not rendered`);
  // El único porcentaje permitido es el ejemplo «100 %» de la explicación de la confianza.
  assert.ok(!/\d+\s?%/.test(textOf(html).replace(/\b100 %/g, "")), "no source figures in the methodology page");
});

test("11 Eurostat Digital Intensity Index is not the Vecidya presence index", () => {
  const distinction = METHODOLOGY_SECTIONS.find((section) => section.id === "overall_index")!.detail.find((item) => item.id === "overall.not_eurostat")!;
  assert.equal(distinction.type, "limitation");
  for (const part of ["Eurostat", "0 a 100", "40", "70", "ocho áreas", "prioridad"]) assert.ok(distinction.text.includes(part), part);
  const eurostat = METHODOLOGY_SOURCES.find((source) => source.id === "eurostat-dii")!;
  assert.deepEqual(eurostat.supports.map((item) => item.dimension), ["digital_readiness"], "only the broad adoption principle of one area");
  const citing = [...claims].filter((item) => item.sourceIds?.includes("eurostat-dii")).map((item) => item.id);
  assert.deepEqual(citing, ["why:digital_readiness"], "never cited for the index, bands, areas or priorities");
});

test("11 claims are classified and every engine rule points to code that exists", () => {
  const ids = claims.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "unique claim ids");
  for (const type of METHODOLOGY_CLAIM_TYPES) assert.ok(claims.some((item) => item.type === type), `uses ${type}`);
  const files = new Set(readdirSync(DOMAIN));
  for (const item of claims.filter((entry) => entry.type === "internal_rule")) {
    assert.ok(item.verifiedIn, `${item.id}: internal rule names where it is verified`);
    const [, file, symbol] = /^(?:app\/features\/diagnostic\/)?([\w.-]+\.ts)(?:#([\w.]+))?/.exec(item.verifiedIn!) ?? [];
    if (!file || file.includes("*")) continue;
    assert.ok(files.has(file), `${item.id}: ${file} exists`);
    if (symbol) assert.ok(readFileSync(`${DOMAIN}/${file}`, "utf8").includes(symbol.split(".")[0]!), `${item.id}: ${symbol} exists in ${file}`);
  }
  for (const item of claims.filter((entry) => entry.type !== "internal_rule")) assert.equal(item.verifiedIn, undefined, item.id);
});

test("11 methodology copy: plain Spanish, no overclaiming, no internal constants, codes or jargon", () => {
  const overclaim = /cient[ií]fic|cl[ií]nicamente|estad[ií]sticamente|validad[oa]|est[aá]ndar de la industria|comprobad[oa]|garantiza|certificad[oa]|precisi[oó]n del \d/i;
  const internal = /\b0[.,]\d+\b|\b[a-z0-9]+_[a-z0-9_]+\b|\bplanner\b|planificador|\bscore\b|\bpuntos?\b|puntaje|\bpeso de\b|ponderaci|\bnull\b|\bfallback\b/i;
  for (const text of allCopy) {
    assert.ok(!overclaim.test(text), `overclaim: «${text}»`);
    assert.ok(!internal.test(text), `internal: «${text}»`);
  }
  assert.ok(allCopy.some((text) => /reglas deterministas/.test(text)), "states how the result is computed");
  assert.ok(allCopy.some((text) => /falta de información no es una debilidad/i.test(text)), "missing information is not weakness");
});

test("11 numbers and rules in the copy match the frozen engine behaviour", () => {
  const text = (id: string) => METHODOLOGY_SECTIONS.flatMap((section) => section.detail).find((item) => item.id === id)!.text;
  assert.match(text("overall.bands"), /por debajo de 40.*desde 40 y por debajo de 70.*desde 70/);
  assert.equal(bandFor(39.99), "low");
  assert.equal(bandFor(40), "developing");
  assert.equal(bandFor(70), "solid");
  assert.equal(displayScoreFor(39.5), 39, "the visible number never crosses into another state");
  assert.match(text("overall.minimum"), /al menos 3 áreas.*un tercio/);
  assert.match(text("route.length"), new RegExp(`supera ${ROUTE_HARD_CAP} preguntas`));
  // Áreas sin lectura nunca cuentan como cero; con dos lecturas no hay índice.
  const base = scoreContextualDimensions({ answers: {}, context: {}, evidence: [] });
  const withScores = (scores: Record<string, number>) => ({ ...base, dimensions: base.dimensions.map((item) => ({ ...item, applicability: "applicable" as const, score: scores[item.id] ?? null })) });
  assert.equal(computeDigitalPresenceIndex(withScores({ discovery: 80, digital_foundation: 60 })).rawScore, null, "fewer than 3 readings: no index");
  assert.equal(computeDigitalPresenceIndex(withScores({ discovery: 90, digital_foundation: 60, clarity_positioning: 30 })).rawScore, 60, "equal weight; unscored areas excluded, not zero");
  // Antes del lanzamiento no hay índice; a lo sumo tres prioridades; el porcentaje más bajo no es automáticamente el primero.
  const idea = goldens.find((item) => item.persona.id === "idea_early_stage")!;
  assert.equal(idea.result.outcome.overall.index.rawScore, null);
  for (const item of goldens) assert.ok(item.priorities.priorities.length <= METHODOLOGY_ENGINE_CONTRACT.maxPriorities, item.persona.id);
  assert.ok(goldens.some((item) => item.priorities.priorities.length === METHODOLOGY_ENGINE_CONTRACT.maxPriorities));
  const notLowestFirst = goldens.some(({ scoring, priorities }) => {
    const scored = scoring.dimensions.filter((item) => item.applicability === "applicable" && item.score !== null);
    const lowest = Math.min(...scored.map((item) => item.score!));
    const first = priorities.priorities[0];
    return first !== undefined && (first.score === null || first.score > lowest);
  });
  assert.ok(notLowestFirst, "some golden result puts an area first that is not the lowest score");
});

test("11 commercial separation: no diagnostic layer imports the commercial catalog; the methodology influences nothing", () => {
  const importsOf = (file: string) => [...readFileSync(`${DOMAIN}/${file}`, "utf8").matchAll(/from "\.\/([\w-]+)"/g)].map((match) => `${match[1]}.ts`);
  const closure = (file: string, seen = new Set<string>()): Set<string> => { for (const next of importsOf(file)) if (!seen.has(next) && existsSync(`${DOMAIN}/${next}`)) { seen.add(next); closure(next, seen); } return seen; };
  for (const layer of ["qbv2-contextual-scoring.ts", "qbv2-priorities.ts", "qbv2-semantic-facts.ts", "qbv2-narrative.ts", "qbv2-overall.ts", "qbv2-recommendations.ts", "qbv2-solutions.ts", "qbv2-planner.ts"]) {
    assert.ok(!closure(layer).has("qbv2-offerings.ts"), `${layer} never reaches the commercial catalog`);
  }
  assert.ok(closure("qbv2-offerings.ts").has("qbv2-recommendations.ts"), "offerings read recommendations, not the reverse");
  // Ni siquiera el barrel la expone: entra solo donde se muestra, nunca en el chunk compartido de las rutas públicas.
  for (const file of readdirSync(DOMAIN).filter((name) => name.endsWith(".ts") && name !== "qbv2-methodology.ts")) {
    assert.ok(!importsOf(file).includes("qbv2-methodology.ts"), `${file} does not depend on the methodology`);
  }
  const recommendations = METHODOLOGY_SECTIONS.find((section) => section.id === "recommendations")!;
  assert.match(recommendations.simple, /se calculan antes de comprobar si Vecidya ofrece un servicio relacionado/);
  assert.equal(RECOMMENDATION_CHAIN.at(-1), "Cómo puede ayudar Vecidya, si corresponde", "the offering is the last link");
});

test("11 calculation and data: deterministic, no AI or network in the diagnostic; production privacy copy still pending", () => {
  for (const file of readdirSync(DOMAIN).filter((name) => name.startsWith("qbv2-") && name.endsWith(".ts"))) {
    const source = readFileSync(`${DOMAIN}/${file}`, "utf8");
    assert.ok(!/\bfetch\(|XMLHttpRequest|anthropic|openai|\bllm\b/i.test(source), `${file}: no network or model calls`);
  }
  assert.equal(METHODOLOGY_PRIVACY.scope, "private_preview");
  assert.equal(METHODOLOGY_PRIVACY.productionCopy, null, "no production privacy claim before the cutover architecture");
  const data = METHODOLOGY_SECTIONS.find((section) => section.id === "calculation_and_data")!;
  assert.ok(data.detail.some((item) => /versión de prueba/.test(item.text)), "current privacy statement is scoped to the private preview");
});

test("11 methodology article renders every section, the eight areas, accessible sources and the version table", () => {
  const html = renderToStaticMarkup(createElement(MethodologyArticle));
  const text = textOf(html);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, "one h1");
  for (const section of METHODOLOGY_SECTIONS) assert.match(html, new RegExp(`id="dm-${section.id}"`), section.id);
  for (const id of DIGITAL_DIMENSION_IDS) assert.ok(text.includes(DIMENSION_METHODOLOGY[id].label) && html.includes(`id="dm-area-${id}"`), id);
  assert.equal((html.match(/<h3 class="dm-area__title"/g) ?? []).length, 8);
  for (const source of METHODOLOGY_SOURCES) {
    assert.ok(html.includes(`id="dm-source-${source.id}"`) && html.includes(`href="${source.url.replace(/&/g, "&amp;")}"`), source.id);
  }
  assert.match(html, /<a aria-label="Fuente 1: [^"]+" href="#dm-source-google-local-ranking">1<\/a>/, "numbered, labelled references");
  assert.match(html, /<nav aria-label="Contenido de la metodología"/);
  assert.match(html, /<table class="dm-table">/);
  assert.ok(text.includes(`Metodología ${METHODOLOGY_VERSION}`));
  assert.ok(text.includes("Criterio de Vecidya"), "product interpretations are labelled as such");
});

test("11 result «Cómo se evaluó» gives four short explanations and links to the full methodology", () => {
  assert.equal(RESULT_METHOD_NOTES.length, 4);
  const html = renderToStaticMarkup(createElement(MethodNote));
  const text = textOf(html);
  for (const note of RESULT_METHOD_NOTES) assert.ok(text.includes(note), note);
  assert.match(html, new RegExp(`<a href="${METHODOLOGY_PATH}">${METHODOLOGY_LINK_LABEL}</a>`));
  assert.ok(text.includes(`Metodología ${METHODOLOGY_VERSION}`));
  assert.match(RESULT_METHOD_NOTES.join(" "), /porcentaje.*confianza.*recorrido.*prioridades/s, "score, confidence, adaptive route and priority logic");
});

test("11 the methodology route is public (DIAG-V3-13 cutover); the standalone dev preview stays development-only", () => {
  const routes = readFileSync("app/routes.ts", "utf8");
  const publicBlock = routes.slice(0, routes.indexOf("...(isDevelopmentServer"));
  const devBlock = routes.slice(routes.indexOf("...(isDevelopmentServer"));
  assert.ok(publicBlock.includes(`route("${METHODOLOGY_PATH.slice(1)}", "routes/diagnostico-metodologia.tsx")`), "public methodology route, unconditional");
  assert.ok(devBlock.includes(`route("__dev/diagnostico/metodologia", "routes/dev-diagnostic-methodology.tsx")`), "standalone dev preview stays dev-only");
  assert.match(readFileSync("app/routes/dev-diagnostic-methodology.tsx", "utf8"), /if \(!import\.meta\.env\.DEV\) throw new Response\("Not Found", \{ status: 404 \}\)/);
});
