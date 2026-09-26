import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  APPLICABILITY,
  CORE_DIMENSION_IDS,
  deriveContext,
  findDependencyCycles,
  getApplicableQuestions,
  getDependencyGraph,
  profileIds,
  profiles,
  QUESTION_DEFINITIONS,
  QUESTION_IDS,
  questions,
  sectionOrder,
  type Answers,
} from "../../../app/features/diagnostic/index.ts";

/**
 * Registro de preguntas (DIAG-V3-02): integridad, orden, versiones, opciones y dependencias.
 * Las garantías de compilación viven en `app/features/diagnostic/contracts.typecheck.ts`.
 */

/** Orden de las 26 preguntas antes de DIAG-V3-02 (`39ef0c9`). */
const BASELINE_ORDER = [
  "profile", "goal", "stage", "team", "assets", "clarity_presence", "offer_clarity", "validation",
  "proof_professional", "proof_business", "proof_creator", "proof_org", "control", "sources",
  "discoverability", "audience", "reach", "contact_path", "capture", "response", "follow_up",
  "pipeline", "responsibilities", "repetitive", "post_sale", "measurement",
];

const ALWAYS_APPLICABLE = ["profile", "goal", "stage"];

test("registro: 26 preguntas, IDs únicos, en el orden de siempre y todas versionadas", () => {
  const ids = QUESTION_DEFINITIONS.map((definition) => definition.id);
  assert.equal(ids.length, 26);
  assert.equal(new Set(ids).size, ids.length, "hay IDs de pregunta duplicados");
  assert.deepEqual(ids, BASELINE_ORDER, "el orden del registro cambió");
  assert.deepEqual([...QUESTION_IDS], ids, "QUESTION_IDS debe derivarse del registro");
  assert.deepEqual(questions.map((question) => question.id), ids, "el recorrido debe seguir el orden del registro");
  for (const definition of QUESTION_DEFINITIONS) {
    assert.ok(Number.isInteger(definition.version) && definition.version >= 1, `${definition.id}: versión inválida`);
    assert.equal(definition.version, 1, `${definition.id}: sin evidencia de una versión histórica distinta, debe ser 1`);
  }
});

test("registro: sección, tipo y dimensiones válidos en cada pregunta", () => {
  const sections = new Set<string>(sectionOrder);
  const dimensions = new Set<string>(CORE_DIMENSION_IDS);
  for (const definition of QUESTION_DEFINITIONS) {
    assert.ok(sections.has(definition.section), `${definition.id}: sección inexistente «${definition.section}»`);
    assert.ok(definition.type === "single" || definition.type === "multi", `${definition.id}: tipo inválido`);
    for (const dimension of definition.dimensions) assert.ok(dimensions.has(dimension), `${definition.id}: dimensión inexistente «${dimension}»`);
  }
  assert.deepEqual([...sectionOrder].sort(), [...new Set(QUESTION_DEFINITIONS.map((definition) => definition.section))].sort(), "toda sección tiene preguntas y toda pregunta tiene sección");
});

test("opciones: IDs únicos por pregunta, con formato estable y distintos de su etiqueta", () => {
  for (const definition of QUESTION_DEFINITIONS) {
    const values = definition.options.map((option) => option.value);
    assert.ok(values.length >= 2, `${definition.id}: una pregunta necesita al menos dos opciones`);
    assert.equal(new Set(values).size, values.length, `${definition.id}: IDs de opción duplicados`);
    for (const option of definition.options) {
      assert.match(option.value, /^[a-z][a-z_]*$/, `${definition.id}.${option.value}: el ID de opción debe ser un identificador estable`);
      assert.ok(option.label.trim().length > 0, `${definition.id}.${option.value}: etiqueta vacía`);
      assert.notEqual(option.label, option.value, `${definition.id}.${option.value}: la etiqueta visible no puede ser el identificador lógico`);
    }
  }
});

test("opciones: las restricciones de single/multi también se cumplen en runtime", () => {
  for (const definition of QUESTION_DEFINITIONS) {
    if (definition.type !== "single") continue;
    for (const option of definition.options) {
      assert.ok(!("exclusive" in option), `${definition.id}.${option.value}: una single no admite exclusive`);
      assert.notEqual(option.kind, "none", `${definition.id}.${option.value}: «none» solo existe en multi`);
    }
    assert.ok(!("target" in definition) && !("noneDimensions" in definition), `${definition.id}: target/noneDimensions solo en multi`);
  }
});

test("etiqueta ≠ ID: el perfil `creator` conserva su ID con la etiqueta nueva", () => {
  const profile = QUESTION_DEFINITIONS.find((definition) => definition.id === "profile");
  assert.ok(profile);
  assert.deepEqual(profile.options.map((option) => option.value), profileIds);
  assert.deepEqual(profile.options.map((option) => option.label), profiles.map((item) => item.label));
  assert.equal(profile.options.find((option) => option.value === "creator")?.label, "Artista o creador de contenido");
});

test("aplicabilidad: toda pregunta condicionada tiene regla y las demás aplican siempre", () => {
  assert.ok(Object.keys(APPLICABILITY).every((id) => (QUESTION_IDS as readonly string[]).includes(id)), "regla para una pregunta inexistente");
  assert.deepEqual(QUESTION_DEFINITIONS.filter((definition) => !APPLICABILITY[definition.id]).map((definition) => definition.id), ALWAYS_APPLICABLE);
  for (const question of questions) assert.equal(question.applies, APPLICABILITY[question.id]?.applies, `${question.id}: el recorrido no usa la regla del registro`);
});

test("dependencias: existen, no son propias, preceden a la pregunta y el grafo es acíclico", () => {
  const graph = getDependencyGraph();
  const position = new Map(QUESTION_DEFINITIONS.map((definition, index) => [definition.id as string, index]));
  for (const [id, dependencies] of Object.entries(graph)) {
    for (const dependency of dependencies) {
      assert.ok(position.has(dependency), `${id} depende de la pregunta inexistente «${dependency}»`);
      assert.notEqual(dependency, id, `${id} depende de sí misma`);
      assert.ok((position.get(dependency) as number) < (position.get(id) as number), `${id} depende de «${dependency}», que se pregunta después`);
    }
  }
  assert.deepEqual(findDependencyCycles(graph), []);
});

test("detector de ciclos: encuentra A → B → C → A y acepta un grafo acíclico", () => {
  assert.deepEqual(findDependencyCycles({ a: ["b"], b: ["c"], c: ["a"] }), [["a", "b", "c", "a"]]);
  assert.deepEqual(findDependencyCycles({ a: [], b: ["a"], c: ["a", "b"] }), []);
});

/** Contextos aleatorios no guiados por el router: cualquier combinación de respuestas. */
function randomAnswers(count: number, seed: number): Answers[] {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const cases: Answers[] = [];
  for (let index = 0; index < count; index += 1) {
    const answers: Record<string, string | string[]> = {};
    for (const definition of QUESTION_DEFINITIONS) {
      if (random() < 0.2) continue;
      const values = definition.options.map((option) => option.value);
      answers[definition.id] = definition.type === "single" ? values[Math.floor(random() * values.length)] : values.filter(() => random() < 0.35);
    }
    cases.push(answers as Answers);
  }
  return cases;
}

/** Variantes de la respuesta de una pregunta: sin responder y cada opción (o cada opción sola y la lista vacía). */
function variantsOf(id: string): (string | string[] | undefined)[] {
  const definition = QUESTION_DEFINITIONS.find((item) => item.id === id);
  assert.ok(definition);
  const values = definition.options.map((option) => option.value);
  return definition.type === "single" ? [undefined, ...values] : [undefined, [], ...values.map((value) => [value])];
}

function withVariant(answers: Answers, id: string, value: string | string[] | undefined): Answers {
  const next: Record<string, unknown> = { ...answers };
  if (value === undefined) delete next[id];
  else next[id] = value;
  return next as Answers;
}

test("dependencias declaradas: completas (sin dependencias ocultas) y exactas (cada una influye)", () => {
  const samples = randomAnswers(150, 20260926);
  for (const [id, rule] of Object.entries(APPLICABILITY)) {
    if (!rule) continue;
    const declared = new Set<string>(rule.dependsOn);
    const influential = new Set<string>();
    for (const answers of samples) {
      const base = rule.applies(deriveContext(answers));
      for (const other of QUESTION_IDS) {
        if (other === id) continue;
        for (const value of variantsOf(other)) {
          if (rule.applies(deriveContext(withVariant(answers, other, value))) !== base) {
            assert.ok(declared.has(other), `${id} cambia al variar «${other}», que no está en dependsOn (dependencia oculta)`);
            influential.add(other);
          }
        }
      }
    }
    assert.deepEqual([...declared].filter((dependency) => !influential.has(dependency)), [], `${id}: dependencias declaradas que nunca influyen`);
  }
});

test("ninguna pregunta es imposible: cada una aplica en algún contexto", () => {
  const seen = new Set<string>();
  for (const answers of randomAnswers(2000, 7)) for (const question of getApplicableQuestions(answers)) seen.add(question.id);
  assert.deepEqual(QUESTION_IDS.filter((id) => !seen.has(id)), []);
});

test("reglas de resultado y recomendación: toda pregunta citada existe en el registro", () => {
  const ids = new Set<string>(QUESTION_IDS);
  const patterns = [
    /\b(?:one|many|said|cite)\((?:answers, )?"([a-z_]+)"/g,
    /\banswers\.([a-z_]+)\b/g,
    /\bsingleAnswer\(answers, "([a-z_]+)"/g,
    // DIAG-V3-03: las reglas de routing citan preguntas como el primer argumento de sus builders
    // (`eq("stage", ...)`, `answered("team")`, ...) en vez de `answers.x`/`singleAnswer`.
    /\b(?:eq|notEq|isIn|answered|multiExcluding|multiIntersects)\("([a-z_]+)"/g,
  ];
  for (const file of ["result.ts", "recommendations.ts", "questions.ts"]) {
    const source = readFileSync(new URL(`../../../app/features/diagnostic/${file}`, import.meta.url), "utf8");
    const cited = new Set<string>();
    for (const pattern of patterns) for (const match of source.matchAll(pattern)) cited.add(match[1]);
    assert.ok(cited.size > 0, `${file}: no se encontraron referencias (¿cambió la forma de citar preguntas?)`);
    for (const id of cited) assert.ok(ids.has(id), `${file} cita la pregunta inexistente «${id}»`);
  }
});
