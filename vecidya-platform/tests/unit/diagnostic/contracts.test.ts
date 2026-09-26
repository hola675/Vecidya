import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BUSINESS_MODELS,
  CORE_DIMENSION_IDS,
  CURRENT_DIAGNOSTIC_VERSION,
  CUSTOMER_BUYERS,
  CUSTOMER_REACHES,
  deriveContext,
  deriveContextV3,
  DIAGNOSTIC_VERSIONS,
  dimensionOrder,
  ENTITY_TYPES,
  EVIDENCE_SIGNALS,
  goalIds,
  GROWTH_STAGES,
  isIssueId,
  isQuestionId,
  ISSUE_IDS,
  LEGACY_PROFILE_MAPPING,
  LEGACY_STAGE_MAPPING,
  mapLegacyGoal,
  mapLegacyStage,
  OPERATIONAL_ARCHETYPES,
  parseDiagnosticEntry,
  PRIMARY_FRICTIONS,
  PRIMARY_GOALS,
  profileIds,
  QUESTION_IDS,
  questions,
  runDiagnostic,
  stageIds,
  toNicheId,
  entryToAnswers,
  type Resolution,
} from "../../../app/features/diagnostic/index.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

const allPersonas = { ...personas, ...adversarial };
const unique = (values: readonly string[]) => new Set(values).size === values.length;

test("contratos: cada lista cerrada no tiene duplicados", () => {
  const lists = { DIAGNOSTIC_VERSIONS, QUESTION_IDS, ISSUE_IDS, CORE_DIMENSION_IDS, ENTITY_TYPES, BUSINESS_MODELS, OPERATIONAL_ARCHETYPES, GROWTH_STAGES, CUSTOMER_REACHES, CUSTOMER_BUYERS, PRIMARY_GOALS, PRIMARY_FRICTIONS, EVIDENCE_SIGNALS };
  for (const [name, list] of Object.entries(lists)) assert.ok(unique(list), `${name} tiene duplicados`);
});

test("contratos: QUESTION_IDS coincide exactamente con el banco de preguntas", () => {
  const registered = questions.map((question) => question.id);
  assert.ok(unique(registered), "hay dos preguntas con el mismo ID");
  assert.deepEqual([...registered].sort(), [...QUESTION_IDS].sort());
});

test("contratos: las siete dimensiones actuales se conservan con sus IDs reales", () => {
  assert.deepEqual([...CORE_DIMENSION_IDS], [...dimensionOrder]);
});

test("contratos: toda referencia del banco de preguntas apunta a dimensiones y perfiles existentes", () => {
  const dimensions = new Set<string>(CORE_DIMENSION_IDS);
  for (const question of questions) {
    const references = [
      ...question.dimensions,
      ...Object.keys(question.weight ?? {}),
      ...Object.keys(question.target ?? {}),
      ...(question.noneDimensions ?? []),
      ...question.options.flatMap((option) => [...Object.keys(option.evidence ?? {}), ...(option.uncertainFor ?? [])]),
    ];
    for (const dimension of references) assert.ok(dimensions.has(dimension), `${question.id} referencia la dimensión inexistente «${dimension}»`);
    for (const profile of Object.keys(question.variants ?? {})) assert.ok((profileIds as string[]).includes(profile), `${question.id} tiene variante para el perfil inexistente «${profile}»`);
  }
});

test("contratos: los espacios de IDs son disjuntos (un ID de un dominio no puede pasar por otro)", () => {
  const domains: Record<string, readonly string[]> = { QUESTION_IDS, ISSUE_IDS, profileIds, CORE_DIMENSION_IDS };
  const names = Object.keys(domains);
  for (const [index, left] of names.entries()) {
    for (const right of names.slice(index + 1)) {
      const overlap = domains[left].filter((id) => domains[right].includes(id));
      assert.deepEqual(overlap, [], `${left} y ${right} comparten IDs`);
    }
  }
});

test("contratos: las personas de prueba solo usan preguntas registradas (las pruebas no pasan por tsc)", () => {
  for (const [name, answers] of Object.entries(allPersonas)) {
    for (const key of Object.keys(answers)) assert.ok(isQuestionId(key), `la persona ${name} usa la clave desconocida «${key}»`);
  }
});

test("contratos: todo hallazgo emitido pertenece a ISSUE_IDS y sus dependencias también", () => {
  for (const answers of Object.values(allPersonas)) {
    const result = runDiagnostic(answers);
    assert.ok(result);
    for (const issue of result.priorities.concat(result.gaps)) {
      assert.ok(isIssueId(issue.id), `hallazgo desconocido ${issue.id}`);
      for (const dependency of issue.after ?? []) assert.ok(isIssueId(dependency), `dependencia desconocida ${dependency}`);
    }
  }
});

test("versión: el resultado declara la versión vigente y la versión existe en el contrato", () => {
  assert.ok((DIAGNOSTIC_VERSIONS as readonly string[]).includes(CURRENT_DIAGNOSTIC_VERSION));
  assert.equal(DIAGNOSTIC_VERSIONS.filter((version) => version.startsWith("3.")).length, 0, "no puede existir una versión V3 antes que el motor V3");
  for (const answers of Object.values(allPersonas)) assert.equal(runDiagnostic(answers)?.version, CURRENT_DIAGNOSTIC_VERSION);
});

const isWellFormed = <T extends string>(resolution: Resolution<T>, domain: readonly string[]) =>
  resolution.status === "resolved"
    ? domain.includes(resolution.value) && !("candidates" in resolution)
    : !("value" in resolution) && resolution.candidates.every((candidate) => domain.includes(candidate));

test("mapeo de etapa: explícito, sin reutilizar el significado de un mismo nombre", () => {
  assert.deepEqual(Object.keys(LEGACY_STAGE_MAPPING).sort(), [...stageIds].sort(), "cada etapa actual necesita una decisión explícita");
  for (const [stage, resolution] of Object.entries(LEGACY_STAGE_MAPPING)) assert.ok(isWellFormed(resolution, GROWTH_STAGES), `mapeo mal formado para ${stage}`);
  assert.deepEqual(mapLegacyStage("idea"), { status: "resolved", value: "idea", source: "legacy_mapping" });
  const growing = mapLegacyStage("growing");
  assert.equal(growing.status, "unresolved", "el `growing` actual (intención) no equivale al `growing` V3 (volumen)");
  assert.ok(growing.status === "unresolved" && growing.reason === "ambiguous_legacy" && growing.candidates.includes("growing"));
  for (const stage of stageIds.filter((stage) => stage !== "idea")) assert.equal(mapLegacyStage(stage).status, "unresolved", `${stage} no tiene equivalencia V3 segura`);
  assert.deepEqual(mapLegacyStage(undefined), { status: "unresolved", reason: "not_asked", candidates: [] });
});

test("mapeo de perfil: separa entidad y arquetipo sin inventar lo que el perfil no dice", () => {
  assert.deepEqual(Object.keys(LEGACY_PROFILE_MAPPING).sort(), [...profileIds].sort());
  for (const [profile, mapping] of Object.entries(LEGACY_PROFILE_MAPPING)) {
    assert.ok(isWellFormed(mapping.entity, ENTITY_TYPES), `entidad mal formada para ${profile}`);
    assert.ok(isWellFormed(mapping.archetype, OPERATIONAL_ARCHETYPES), `arquetipo mal formado para ${profile}`);
  }
  assert.equal(LEGACY_PROFILE_MAPPING.business.archetype.status, "unresolved", "«un negocio» no basta para saber si es local, ecommerce o B2B");
  assert.equal(LEGACY_PROFILE_MAPPING.project.archetype.status, "unresolved");
  assert.deepEqual(LEGACY_PROFILE_MAPPING.creator.archetype, { status: "resolved", value: "creator", source: "legacy_mapping" });
  assert.equal(LEGACY_PROFILE_MAPPING.creator.entity.status, "unresolved", "un artista o creador puede ser una persona o un grupo");
});

test("mapeo de objetivo: reutiliza los objetivos y trata «unsure» como ausencia declarada", () => {
  assert.deepEqual([...PRIMARY_GOALS].sort(), goalIds.filter((goal) => goal !== "unsure").sort());
  for (const goal of PRIMARY_GOALS) assert.deepEqual(mapLegacyGoal(goal), { status: "resolved", value: goal, source: "legacy_mapping" });
  assert.deepEqual(mapLegacyGoal("unsure"), { status: "unresolved", reason: "declared_unknown", candidates: [] });
  assert.deepEqual(mapLegacyGoal(undefined), { status: "unresolved", reason: "not_asked", candidates: [] });
});

test("contexto V3: lo que el motor actual no pregunta queda sin resolver, nunca con un valor por defecto", () => {
  for (const [name, answers] of Object.entries(allPersonas)) {
    const context = deriveContextV3(deriveContext(answers));
    assert.equal(context.version, CURRENT_DIAGNOSTIC_VERSION);
    for (const field of ["businessModel", "niche", "primaryFriction"] as const) {
      assert.deepEqual(context[field], { status: "unresolved", reason: "not_asked", candidates: [] }, `${name}: ${field} inventado`);
    }
    assert.equal(context.customerModel.reach.status, "unresolved", `${name}: alcance de clientes inventado`);
    assert.equal(context.customerModel.buyer.status, "unresolved", `${name}: tipo de comprador inventado`);
    assert.ok(isWellFormed(context.archetype, OPERATIONAL_ARCHETYPES) && isWellFormed(context.growthStage, GROWTH_STAGES) && isWellFormed(context.entity, ENTITY_TYPES));
  }
  const empty = deriveContextV3(deriveContext({}));
  for (const field of ["profile", "entity", "archetype", "growthStage", "primaryGoal"] as const) assert.equal(empty[field].status, "unresolved");
});

test("validación en fronteras: guardas de lista cerrada y nicho con formato", () => {
  assert.equal(isQuestionId("follow_up"), true);
  for (const value of ["creator", "", "FOLLOW_UP", null, 3, undefined]) assert.equal(isQuestionId(value), false);
  assert.equal(toNicheId("barberia"), "barberia");
  for (const value of ["Barbería", "a", "1abc", "x".repeat(41), "barber shop", null]) assert.equal(toNicheId(value), undefined);
});

test("compatibilidad: el deep link ?perfil=creator sigue funcionando con el ID interno intacto", () => {
  const entry = parseDiagnosticEntry("?perfil=creator");
  assert.equal(entry.profile, "creator");
  const result = runDiagnostic({ ...entryToAnswers(entry), stage: "idea" });
  assert.equal(result?.profile, "creator");
  assert.deepEqual(deriveContextV3(deriveContext(entryToAnswers(entry))).archetype, { status: "resolved", value: "creator", source: "legacy_mapping" });
});
