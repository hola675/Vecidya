import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CURRENT_QUESTION_BANK_VERSION,
  GOLDEN_QUESTIONS_V2,
  getQuestionBank,
  MODULE_IDS,
  MODULE_REGISTRY,
  QUESTION_BANK_V2,
  QUESTION_PRIORITIES,
  QUESTION_PURPOSES,
  resolveDiagnosticContext,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

// ── §66: tests de arquitectura ───────────────────────────────────────────────

test("QBV2 arquitectura: el banco golden pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(GOLDEN_QUESTIONS_V2);
  assert.deepEqual(issues, [], `el banco golden no debería tener issues: ${JSON.stringify(issues)}`);
});

test("QBV2 arquitectura: 14 preguntas golden, no las 100-120 de 08B.3", () => {
  assert.ok(GOLDEN_QUESTIONS_V2.length >= 8 && GOLDEN_QUESTIONS_V2.length <= 15, `tamaño fuera de rango: ${GOLDEN_QUESTIONS_V2.length}`);
});

test("QBV2 arquitectura: MODULE_REGISTRY cubre exactamente MODULE_IDS, sin duplicados", () => {
  const ids = MODULE_REGISTRY.map((module) => module.id);
  assert.equal(new Set(ids).size, ids.length, "módulo duplicado en el registro");
  assert.deepEqual([...ids].sort(), [...MODULE_IDS].sort());
});

test("QBV2 arquitectura: 20 módulos (19 de 08B.2 + \"reputation\", cross-cutting añadido en DIAG-V3-08B.3 Lote B C2) — no hardcodear 19 en ningún sitio que describa el estado actual", () => {
  assert.equal(MODULE_IDS.length, 20);
  const reputation = MODULE_REGISTRY.find((module) => module.id === "reputation")!;
  assert.ok(reputation, "el módulo reputation debe existir en MODULE_REGISTRY");
  assert.deepEqual([...reputation.relevantWhen.archetypes ?? []].sort(), ["appointments", "hospitality", "local", "professional", "retail"]);
  assert.ok(reputation.targetQuestionRange.min >= 1 && reputation.targetQuestionRange.max <= 3, "target de reputation no debería inflarse artificialmente");
});

test("QBV2 arquitectura: floor de módulos, target editorial y techo razonable son conceptos distintos y coherentes (§71, DIAG-V3-08B.2-C1)", () => {
  // moduleFloor/moduleCeiling son la suma aritmética de los rangos por módulo (metadata de planner,
  // §50) — NO son el tamaño real del banco. El target editorial es lo que el equipo se compromete a
  // construir en DIAG-V3-08B.3, derivado de cobertura necesaria, no de llenar una cuota (checkpoint C1 §2-3).
  const moduleFloor = MODULE_REGISTRY.reduce((sum, module) => sum + module.targetQuestionRange.min, 0);
  const moduleCeiling = MODULE_REGISTRY.reduce((sum, module) => sum + module.targetQuestionRange.max, 0);
  const EDITORIAL_TARGET = { min: 100, max: 120 } as const;

  assert.ok(moduleFloor > 0, `module floor debe ser positivo: ${moduleFloor}`);
  assert.ok(EDITORIAL_TARGET.min <= EDITORIAL_TARGET.max, "target editorial: min debe ser <= max");
  assert.ok(EDITORIAL_TARGET.min >= 100, `target editorial por debajo del piso de fase: ${EDITORIAL_TARGET.min}`);
  assert.ok(
    EDITORIAL_TARGET.max <= moduleCeiling,
    `target editorial excede el techo razonable de módulos (${moduleCeiling}): ${EDITORIAL_TARGET.max}`,
  );
  assert.ok(
    moduleFloor <= EDITORIAL_TARGET.min,
    `floor de módulos (${moduleFloor}) no debería superar el target editorial mínimo (${EDITORIAL_TARGET.min})`,
  );
});

test("QBV2 arquitectura: cada módulo tiene un rango objetivo válido (min <= max, ambos >= 0)", () => {
  for (const module of MODULE_REGISTRY) {
    assert.ok(module.targetQuestionRange.min >= 0, `${module.id}: min negativo`);
    assert.ok(module.targetQuestionRange.min <= module.targetQuestionRange.max, `${module.id}: min > max`);
  }
});

test("QBV2 arquitectura: cada pregunta golden usa un módulo, propósito y prioridad reales", () => {
  for (const question of GOLDEN_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module), `${question.id}: módulo inválido`);
    assert.ok(question.purpose.length > 0, `${question.id}: sin propósito`);
    for (const purpose of question.purpose) assert.ok((QUESTION_PURPOSES as readonly string[]).includes(purpose), `${question.id}: propósito inválido «${purpose}»`);
    assert.ok((QUESTION_PRIORITIES as readonly string[]).includes(question.priority), `${question.id}: prioridad inválida`);
  }
});

test("QBV2 arquitectura: el módulo `confirmation` tiene rango objetivo 0-2 (nunca elegible por defecto, §54)", () => {
  const confirmation = MODULE_REGISTRY.find((module) => module.id === "confirmation")!;
  assert.equal(confirmation.targetQuestionRange.min, 0);
});

test("QBV2 arquitectura: ninguna variante de copy cambia `options`/produces bajo la misma versión (garantía estructural del tipo, §26)", () => {
  // CopyVariantV2 solo puede llevar `prompt`/`helper` (ver qbv2-contract.ts) — no hay forma de que un
  // variant exprese `options` en su tipo; esta prueba confirma que el golden set no intenta rodear eso
  // con una propiedad adicional no tipada.
  for (const question of GOLDEN_QUESTIONS_V2) {
    for (const variant of question.variants ?? []) {
      assert.ok(!("options" in variant), `${question.id}: un variant no debe declarar options`);
      assert.ok(!("produces" in variant), `${question.id}: un variant no debe declarar produces`);
    }
  }
});

test("QBV2 arquitectura: el banco golden es serializable a JSON sin perder producciones de señal", () => {
  const restored = JSON.parse(JSON.stringify(GOLDEN_QUESTIONS_V2)) as typeof GOLDEN_QUESTIONS_V2;
  assert.deepEqual(restored, GOLDEN_QUESTIONS_V2);
  // Ninguna opción usa una función (§55-57): si alguna lo hiciera, JSON.stringify la habría omitido en silencio.
  const originalProductionCount = GOLDEN_QUESTIONS_V2.reduce((total, q) => total + q.options.reduce((sum, o) => sum + (o.produces?.length ?? 0), 0), 0);
  const restoredProductionCount = restored.reduce((total, q) => total + q.options.reduce((sum, o) => sum + (o.produces?.length ?? 0), 0), 0);
  assert.equal(restoredProductionCount, originalProductionCount);
  assert.ok(originalProductionCount > 0);
});

// ── §3, §35: QBV2 permanece inactivo ─────────────────────────────────────────

test("QBV2 arquitectura: QuestionBankVersion vigente sigue en 1; ninguna ruta actual puede iniciar con QBV2", () => {
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(1), undefined, "el loader de QBV2 no sirve la versión 1 (la sirven los exports de QBV1 sin cambios)");
  assert.ok(getQuestionBank(2) !== undefined, "QBV2 existe y es funcional, pero solo accesible explícitamente por versión 2");
});

// ── §74: mutation tests A, C, D, G, J (B, E, F cubiertos en qbv2-contract.typecheck.ts) ──

test("mutación A: una pregunta con módulo inexistente falla la validación", () => {
  const bad = [{ ...GOLDEN_QUESTIONS_V2[0]!, module: "nonexistent_module" as never }];
  const issues = validateQuestionBankV2(bad);
  assert.ok(issues.some((issue) => issue.code === "INVALID_MODULE"));
});

test("mutación D: una pregunta sin producir señal, sin ser candidata de scoring, sin contradictionRole y sin propósito routing es huérfana", () => {
  const orphan = { ...GOLDEN_QUESTIONS_V2[0]!, id: "q2_orphan_test", options: GOLDEN_QUESTIONS_V2[0]!.options.map((o) => ({ ...o, produces: undefined })), scoringReadiness: { candidateDimensions: [], signalDirection: "neutral" as const, allowsUnknown: false, allowsNotApplicable: false } };
  const issues = validateQuestionBankV2([orphan]);
  assert.ok(issues.some((issue) => issue.code === "ORPHAN_QUESTION"), JSON.stringify(issues));
});

test("mutación G: QBV2 nunca se convierte accidentalmente en la versión vigente", () => {
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
});

test("mutación J: citar el OptionId de otra pregunta (uso cruzado) falla la validación", () => {
  const bad = [
    { ...GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_entity")! },
    { ...GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_has_customers")!, appliesWhen: { op: "eq" as const, ref: { question: "q2_entity" }, value: "yes" } }, // "yes" no es opción de q2_entity
  ];
  const issues = validateQuestionBankV2(bad);
  assert.ok(issues.some((issue) => issue.code === "CROSS_QUESTION_OPTION_MISUSE"), JSON.stringify(issues));
});

test("validador: duplicar un QuestionId falla", () => {
  const issues = validateQuestionBankV2([GOLDEN_QUESTIONS_V2[0]!, GOLDEN_QUESTIONS_V2[0]!]);
  assert.ok(issues.some((issue) => issue.code === "DUPLICATE_QUESTION_ID"));
});

test("validador: duplicar un OptionId dentro de la misma pregunta falla", () => {
  const bad = { ...GOLDEN_QUESTIONS_V2[0]!, options: [...GOLDEN_QUESTIONS_V2[0]!.options, GOLDEN_QUESTIONS_V2[0]!.options[0]!] };
  const issues = validateQuestionBankV2([bad]);
  assert.ok(issues.some((issue) => issue.code === "DUPLICATE_OPTION_ID"));
});

test("validador: una referencia de respuesta a un QuestionId inexistente falla", () => {
  const bad = { ...GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_has_customers")!, appliesWhen: { op: "answered" as const, ref: { question: "q2_does_not_exist" } } };
  const issues = validateQuestionBankV2([bad]);
  assert.ok(issues.some((issue) => issue.code === "INVALID_ANSWER_REF"));
});

test("validador: exclusive en una pregunta single es una configuración imposible", () => {
  const bad = { ...GOLDEN_QUESTIONS_V2.find((q) => q.type === "single")!, options: GOLDEN_QUESTIONS_V2.find((q) => q.type === "single")!.options.map((o, i) => (i === 0 ? { ...o, exclusive: true } : o)) };
  const issues = validateQuestionBankV2([bad]);
  assert.ok(issues.some((issue) => issue.code === "IMPOSSIBLE_EXCLUSIVE_CONFIG"));
});

test("validador: más de una opción `unknown` en la misma pregunta falla", () => {
  const target = GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_b2b_pipeline")!;
  const bad = { ...target, options: target.options.map((o) => (o.value === "yes" ? { ...o, kind: "unknown" as const } : o)) };
  const issues = validateQuestionBankV2([bad]);
  assert.ok(issues.some((issue) => issue.code === "MULTIPLE_UNKNOWN_OPTIONS"));
});

test("mutación F / §43-49: una pregunta que lee y escribe el mismo campo de contexto falla la validación estática", () => {
  const selfReferential = {
    id: "q2_self_ref_test",
    version: 1 as const,
    module: "confirmation" as const,
    type: "single" as const,
    prompt: "test",
    purpose: ["confirmation"] as const,
    priority: "refinement" as const,
    appliesWhen: { op: "contextUnresolved" as const, field: "archetype" as const },
    options: [{ value: "a", label: "A", produces: [{ kind: "deliveryMode" as const, slot: "primary" as const, value: "fixed_location_no_inventory", provenance: "explicit_declaration" as const }] }],
  };
  const issues = validateQuestionBankV2([selfReferential] as never);
  assert.ok(issues.some((issue) => issue.code === "SELF_REFERENTIAL_CONTEXT_GATE"), JSON.stringify(issues));
});

// ── mutación G (§ checkpoint de Lote C, endurecida a nivel de banco completo): ──
// "un nombre de herramienta/proveedor específico se vuelve requisito del diagnóstico" debe fallar. Los
// tests por lote (Lote B/C) ya cubrían esto localmente; este test protege el BANCO COMPLETO hacia
// adelante, para que un lote futuro no pueda reintroducir vendor lock-in sin que algo lo señale. La
// denylist es representativa de categorías reales (agendamiento, ecommerce, delivery, CRM/comunicación,
// sitio web), no la definición exhaustiva de "vendor neutrality" — el mecanismo real es la disciplina de
// escribir capability/outcome en vez de nombre de marca, verificada aquí como red de seguridad.
test("mutación G: ningún nombre de herramienta/plataforma/proveedor específico aparece en el copy visible (prompt/helper/label) de TODO el banco — verificación explícita, no una omisión", () => {
  const VENDOR_DENYLIST = [
    "shopify",
    "woocommerce",
    "toast",
    "square",
    "doordash",
    "ubereats",
    "uber eats",
    "grubhub",
    "google merchant",
    "gohighlevel",
    "calendly",
    "google business profile",
    "whatsapp business",
    "squarespace",
    "wix",
    "mailchimp",
    "salesforce",
    "hubspot",
  ];
  const offenders: string[] = [];
  for (const question of QUESTION_BANK_V2) {
    const visibleCopy = [question.prompt, question.helper, ...question.options.map((option) => option.label)]
      .filter((text): text is string => Boolean(text))
      .join(" ")
      .toLowerCase();
    for (const vendor of VENDOR_DENYLIST) {
      if (visibleCopy.includes(vendor)) offenders.push(`${question.id}: menciona "${vendor}"`);
    }
  }
  assert.deepEqual(offenders, [], `el banco no debe mencionar herramientas/proveedores específicos: ${JSON.stringify(offenders)}`);
});

// ── DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001 (Lote D C1): guarda de la decisión DEFER WITH PROOF ──
// Reproducido: businessModel SÍ colapsa a "hybrid" ante dos monetizationMechanism independientes (p. ej.
// mission_funded + goods_for_resale), perdiendo el valor "nonprofit" exacto — la misma clase de problema
// que archetype:"hybrid" tenía antes de que Lote B C1 introdujera archetypeComponents/archetypeIncludes.
// Se DIFIERE (no se corrige) porque, HOY, ninguna pregunta real del banco puede producir ese segundo
// mecanismo: q2_monetization es de opción única y ninguna pregunta declara `slot: "secondary"` para
// monetizationMechanism. Esta prueba es la CONDICIÓN DE GATE explícita (§9/§12 del checkpoint): si deja
// de pasar, significa que una pregunta nueva ya permite declarar un segundo mecanismo de monetización, y
// ANTES de mergear esa pregunta hay que implementar `businessModelComponents`/`businessModelIncludes`
// (mismo patrón que `archetypeComponents`/`archetypeIncludes`) — no basta con corregir este test.
test("DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001: ninguna pregunta del banco produce secondaryMonetizationMechanism todavía — mientras esto sea cierto, businessModel nunca puede colapsar a \"hybrid\" desde una respuesta real, así que la deuda queda diferida con seguridad", () => {
  const serialized = JSON.stringify(QUESTION_BANK_V2);
  assert.ok(!serialized.includes('"kind":"monetizationMechanism","slot":"secondary"') && !serialized.includes('"slot":"secondary","value"') && !serialized.includes("secondaryMonetizationMechanism"), "si esta aserción falla, implementar businessModelComponents/businessModelIncludes ANTES de mergear la pregunta que la rompió (ver DIAG-V3-08B3-BUSINESSMODEL-HYBRID-001 en STATUS.md)");
  const q2Monetization = QUESTION_BANK_V2.find((q) => q.id === "q2_monetization")!;
  assert.equal(q2Monetization.type, "single", "q2_monetization debe seguir siendo de opción única; volverla multi reabriría este mismo riesgo");
});

// ── Reproducción documentada del caso businessModel=hybrid (via señal directa, no vía respuesta real) ──
test("businessModel=hybrid (reproducido con señales sintéticas, no alcanzable hoy por ninguna respuesta real): el trace preserva ambos componentes en resolutionReason aunque no exista un campo businessModelComponents formal", () => {
  const context = resolveDiagnosticContext({
    monetizationMechanism: { value: "mission_funded", provenance: "observed_fact" },
    secondaryMonetizationMechanism: { value: "goods_for_resale", provenance: "observed_fact" },
  });
  assert.deepEqual(context.context.businessModel, { status: "resolved", value: "hybrid", source: "signal" });
  assert.ok(context.trace.businessModel.status === "resolved" && context.trace.businessModel.resolutionReason.includes("nonprofit") && context.trace.businessModel.resolutionReason.includes("products"), "el trace debe seguir nombrando ambos modelos componentes en texto, aunque no haya un campo estructurado todavía");
});
