import assert from "node:assert/strict";
import { test } from "node:test";

import {
  deriveSignalsFromLegacyContext,
  lookupNicheArchetypeHints,
  OPERATIONAL_ARCHETYPES,
  resolveDiagnosticContext,
  toNicheId,
  type ContextResolutionResult,
  type DiagnosticSignalsV3,
  type FieldTrace,
} from "../../../app/features/diagnostic/index.ts";

function resolve(signals: DiagnosticSignalsV3, nicheHints?: readonly (typeof OPERATIONAL_ARCHETYPES)[number][]): ContextResolutionResult {
  return resolveDiagnosticContext(signals, nicheHints);
}

const allTraces = (result: ContextResolutionResult): FieldTrace[] => Object.values(result.trace);

// ── §31/§32: determinismo e independencia de orden ──────────────────────────

test("resolver: determinista — mismas señales producen mismo contexto y mismo trace", () => {
  const signals: DiagnosticSignalsV3 = { entityDeclared: { value: "business", provenance: "explicit_declaration" }, monetizationMechanism: { value: "goods_for_resale", provenance: "observed_fact" } };
  const first = resolve(signals);
  const second = resolve({ ...signals });
  assert.deepEqual(first, second);
});

test("resolver: el orden de construcción del objeto de señales no cambia la resolución", () => {
  const a: DiagnosticSignalsV3 = { monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" }, deliveryMode: { value: "online_checkout", provenance: "observed_fact" } };
  const b: DiagnosticSignalsV3 = { deliveryMode: { value: "online_checkout", provenance: "observed_fact" }, monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" } };
  assert.deepEqual(resolve(a), resolve(b));
});

// ── §39-40: 25 casos obligatorios + fixtures adicionales ────────────────────

test("caso 1: dentista con señal operativa de citas → archetype resuelto appointments", () => {
  const nicheId = toNicheId("dentist")!;
  const hints = lookupNicheArchetypeHints(nicheId);
  const result = resolve({ declaredNicheId: { value: nicheId, provenance: "explicit_declaration" }, deliveryMode: { value: "scheduled_time_blocks", provenance: "observed_fact" } }, hints);
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "appointments", source: "signal" });
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "health_wellness", source: "signal" });
});

test("caso 2: dentista SIN señal operativa propia → archetype unresolved, el hint es candidato, nunca el valor", () => {
  const nicheId = toNicheId("dentist")!;
  const hints = lookupNicheArchetypeHints(nicheId);
  const result = resolve({ declaredNicheId: { value: nicheId, provenance: "explicit_declaration" } }, hints);
  assert.equal(result.context.archetype.status, "unresolved");
  assert.ok(result.context.archetype.status === "unresolved" && result.context.archetype.candidates.includes("appointments"));
});

test("caso 3: servicio local B2B — reach local + buyer b2b conviven sin bloquearse", () => {
  const result = resolve({ deliveryMode: { value: "b2b_sales_pipeline", provenance: "observed_fact" }, customerReach: { value: "local", provenance: "explicit_declaration" }, buyerType: { value: "b2b", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "b2b", source: "signal" });
  assert.equal(result.context.customerModel.reach.status, "resolved");
  assert.equal(result.context.customerModel.buyer.status, "resolved");
});

test("caso 4: ecommerce de productos — businessModel products, archetype ecommerce", () => {
  const result = resolve({ monetizationMechanism: { value: "goods_for_resale", provenance: "observed_fact" }, deliveryMode: { value: "online_checkout", provenance: "observed_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "products", source: "signal" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "ecommerce", source: "signal" });
});

test("caso 5: retail físico + ecommerce con evidencia independiente → archetype hybrid", () => {
  const result = resolve({ deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" }, secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" } });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
});

test("caso 6: profesional independiente por citas — entity individual, archetype professional", () => {
  const result = resolve({ entityDeclared: { value: "individual", provenance: "explicit_declaration" }, deliveryMode: { value: "specialized_individual_practice", provenance: "observed_fact" } });
  assert.deepEqual(result.context.entity, { status: "resolved", value: "individual", source: "signal" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "professional", source: "signal" });
});

test("caso 7: creador de audiencia — businessModel creator_audience, archetype creator", () => {
  const result = resolve({ monetizationMechanism: { value: "own_audience_monetization", provenance: "observed_fact" }, deliveryMode: { value: "own_audience_content", provenance: "observed_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "creator_audience", source: "signal" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "creator", source: "signal" });
});

test("caso 8: creador que también vende productos con evidencia independiente → businessModel hybrid", () => {
  const result = resolve({ monetizationMechanism: { value: "own_audience_monetization", provenance: "observed_fact" }, secondaryMonetizationMechanism: { value: "goods_for_resale", provenance: "observed_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "hybrid", source: "signal" });
});

test("caso 9: sin fines de lucro — businessModel nonprofit", () => {
  const result = resolve({ monetizationMechanism: { value: "mission_funded", provenance: "observed_fact" }, entityDeclared: { value: "organization", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "nonprofit", source: "signal" });
});

test("caso 10: membresía operada por una organización — businessModel membership, entity organization", () => {
  const result = resolve({ monetizationMechanism: { value: "recurring_access", provenance: "observed_fact" }, entityDeclared: { value: "organization", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "membership", source: "signal" });
  assert.deepEqual(result.context.entity, { status: "resolved", value: "organization", source: "signal" });
});

test("caso 11: startup en fase de idea — growthStage idea, entity project", () => {
  const result = resolve({ hasRealCustomers: { value: false, provenance: "derived_fact" }, entityDeclared: { value: "project", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "idea", source: "signal" });
});

test("caso 12: proyecto arrancando — clientes reales pero operación irregular → growthStage starting", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "irregular", provenance: "derived_fact" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "starting", source: "signal" });
});

test("caso 13: negocio establecido y operando — regular, sin tendencia de crecimiento → growthStage operating", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, demandTrend: { value: "flat_or_unknown", provenance: "observed_fact" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
});

test("caso 14: negocio con crecimiento observado → growthStage growing", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, demandTrend: { value: "increasing_observed", provenance: "observed_fact" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("caso 15: negocio creciendo con procesos/equipo que lo sostienen → growthStage scaling", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, demandTrend: { value: "increasing_observed", provenance: "observed_fact" }, systemization: { value: true, provenance: "observed_fact" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "scaling", source: "signal" });
});

test("caso 16: \"quiero crecer\" sin evidencia observable de crecimiento → unresolved, NUNCA growing", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "derived_fact" } });
  assert.equal(result.context.growthStage.status, "unresolved");
  assert.ok(result.context.growthStage.status === "unresolved" && result.context.growthStage.candidates.includes("operating") && result.context.growthStage.candidates.includes("growing"));
});

test("caso 17: fricción de seguimiento — señal única → resolved follow_up", () => {
  const result = resolve({ frictionSignals: [{ value: "follow_up", provenance: "observed_fact" }] });
  assert.deepEqual(result.context.primaryFriction, { status: "resolved", value: "follow_up", source: "signal" });
});

test("caso 18: fricción de conversión — señal única → resolved conversion", () => {
  const result = resolve({ frictionSignals: [{ value: "conversion", provenance: "observed_fact" }] });
  assert.deepEqual(result.context.primaryFriction, { status: "resolved", value: "conversion", source: "signal" });
});

test("caso 19: fricción operativa — señal única → resolved operations", () => {
  const result = resolve({ frictionSignals: [{ value: "operations", provenance: "observed_fact" }] });
  assert.deepEqual(result.context.primaryFriction, { status: "resolved", value: "operations", source: "signal" });
});

test("caso 20: varias fricciones igual de fuertes y distintas → unresolved, nunca se elige la primera", () => {
  const result = resolve({ frictionSignals: [{ value: "visibility", provenance: "derived_fact" }, { value: "trust", provenance: "derived_fact" }] });
  assert.equal(result.context.primaryFriction.status, "unresolved");
  assert.ok(result.context.primaryFriction.status === "unresolved" && result.context.primaryFriction.candidates.length === 2);
});

test("caso 21: nicho custom desconocido — niche resuelto, nicheGroup NUNCA cae en other", () => {
  const custom = toNicheId("underwater_basket_weaving")!;
  const result = resolve({ declaredNicheId: { value: custom, provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.niche, { status: "resolved", value: custom, source: "signal" });
  assert.equal(result.context.nicheGroup.status, "unresolved");
  assert.notEqual((result.context.nicheGroup as { value?: string }).value, "other");
});

test("caso 22: declaración explícita de \"otro\" — nicheGroup resuelto other, con evidencia real", () => {
  const result = resolve({ declaredNicheGroupOther: { value: true, provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "other", source: "signal" });
});

test("caso 23: reach local con archetype ecommerce — ejes independientes, sin forzar consistencia", () => {
  const result = resolve({ deliveryMode: { value: "online_checkout", provenance: "observed_fact" }, customerReach: { value: "local", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "ecommerce", source: "signal" });
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "local", source: "signal" });
});

test("caso 24: duplicar la misma señal de monetización no produce hybrid", () => {
  const result = resolve({ monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" }, secondaryMonetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "services", source: "signal" });
});

test("caso 25: sin ninguna señal operativa ni hint de nicho — archetype unresolved(not_asked)", () => {
  const result = resolve({});
  assert.deepEqual(result.context.archetype, { status: "unresolved", reason: "not_asked", candidates: [] });
});

// ── Fixtures adicionales (frontera individual/business, ejes de cliente, objetivo) ──

test("fixture: individual con personal remunerado adicional se reclasifica a business", () => {
  const result = resolve({ entityDeclared: { value: "individual", provenance: "explicit_declaration" }, hasOtherPaidStaff: { value: true, provenance: "observed_fact" } });
  assert.deepEqual(result.context.entity, { status: "resolved", value: "business", source: "signal" });
});

test("fixture: mixed reach y mixed buyer son valores válidos, no solo casos límite", () => {
  const result = resolve({ customerReach: { value: "mixed", provenance: "explicit_declaration" }, buyerType: { value: "mixed", provenance: "explicit_declaration" } });
  assert.equal(result.context.customerModel.reach.status, "resolved");
  assert.equal(result.context.customerModel.buyer.status, "resolved");
});

test("fixture: objetivo declarado se resuelve directamente", () => {
  const result = resolve({ declaredGoal: { value: "automate", provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.primaryGoal, { status: "resolved", value: "automate", source: "signal" });
});

test("fixture: objetivo declarado como \"no sé\" → unresolved(declared_unknown), no not_asked", () => {
  const result = resolve({ declaredGoalUnknown: { value: true, provenance: "explicit_declaration" } });
  assert.deepEqual(result.context.primaryGoal, { status: "unresolved", reason: "declared_unknown", candidates: [] });
});

test("fixture: sin ninguna señal, todo el contexto es unresolved y ningún campo queda ausente", () => {
  const result = resolve({});
  for (const [field, resolution] of Object.entries(result.context)) {
    if (field === "version") continue;
    if (field === "customerModel") {
      assert.equal(result.context.customerModel.reach.status, "unresolved");
      assert.equal(result.context.customerModel.buyer.status, "unresolved");
      continue;
    }
    assert.equal((resolution as { status: string }).status, "unresolved", `${field} no debería resolverse sin señales`);
  }
});

// ── Legacy adapter: consistencia con las reglas de negocio ya probadas ──────

test("adapter legacy: stage=idea produce growthStage idea", () => {
  const signals = deriveSignalsFromLegacyContext({ stage: "idea", answers: {} });
  assert.deepEqual(resolve(signals).context.growthStage, { status: "resolved", value: "idea", source: "signal" });
});

test("adapter legacy: stage=growing NUNCA produce growthStage growing (protección legacy≠V3)", () => {
  const signals = deriveSignalsFromLegacyContext({ stage: "growing", answers: {} });
  const result = resolve(signals);
  assert.notDeepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
  assert.equal(result.context.growthStage.status, "unresolved");
});

test("adapter legacy: stage=launching no produce ninguna señal de growthStage (demasiado ambiguo)", () => {
  const signals = deriveSignalsFromLegacyContext({ stage: "launching", answers: {} });
  assert.equal(signals.hasRealCustomers, undefined);
  assert.deepEqual(resolve(signals).context.growthStage, { status: "unresolved", reason: "not_asked", candidates: [] });
});

test("adapter legacy: profile=professional produce entity individual y archetype professional", () => {
  const signals = deriveSignalsFromLegacyContext({ profile: "professional", answers: {} });
  const result = resolve(signals);
  assert.deepEqual(result.context.entity, { status: "resolved", value: "individual", source: "signal" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "professional", source: "signal" });
});

test("adapter legacy: profile=creator deja entity sin resolver (persona o grupo, ambiguo)", () => {
  const signals = deriveSignalsFromLegacyContext({ profile: "creator", answers: {} });
  assert.equal(resolve(signals).context.entity.status, "unresolved");
});

test("adapter legacy: profile=organization deja archetype sin resolver (sin mecanismo de entrega implícito)", () => {
  const signals = deriveSignalsFromLegacyContext({ profile: "organization", answers: {} });
  assert.equal(resolve(signals).context.archetype.status, "unresolved");
});

test("adapter legacy: goal=unsure produce declared_unknown, no not_asked", () => {
  const signals = deriveSignalsFromLegacyContext({ goal: "unsure", answers: {} });
  assert.deepEqual(resolve(signals).context.primaryGoal, { status: "unresolved", reason: "declared_unknown", candidates: [] });
});

// ── Regresión sobre hallazgos de la revisión de dominio independiente ───────

test("regresión: un dentista solo (sin colega) resuelve professional, no appointments", () => {
  const result = resolve({ deliveryMode: { value: "specialized_individual_practice", provenance: "observed_fact" } });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "professional", source: "signal" });
});

test("regresión: una clínica con varios proveedores agendándose resuelve appointments, no professional", () => {
  const result = resolve({ deliveryMode: { value: "scheduled_time_blocks", provenance: "observed_fact" } });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "appointments", source: "signal" });
});

test("regresión: un negocio en declive observado NO se confunde con uno estable (trace distinto, mismo GrowthStage por ahora)", () => {
  const stable = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, demandTrend: { value: "flat_or_unknown", provenance: "observed_fact" } });
  const declining = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, demandTrend: { value: "decreasing_observed", provenance: "observed_fact" } });
  assert.deepEqual(stable.context.growthStage, declining.context.growthStage);
  assert.notDeepEqual(stable.trace.growthStage, declining.trace.growthStage);
  assert.ok(declining.trace.growthStage.status === "resolved" && declining.trace.growthStage.supportingSignals.some((s) => s.includes("decreasing_observed")));
});

test("regresión: contratar personal recientemente (capacityExpansion) es evidencia de growing por sí sola", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "observed_fact" }, capacityExpansion: { value: true, provenance: "observed_fact" } });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("regresión: dos señales de mecanismo solo `derived_fact` (ninguna observada/declarada) no bastan para concluir hybrid", () => {
  const result = resolve({ monetizationMechanism: { value: "time_or_project_work", provenance: "derived_fact" }, secondaryMonetizationMechanism: { value: "goods_for_resale", provenance: "derived_fact" } });
  assert.notEqual(result.context.businessModel.status === "resolved" && result.context.businessModel.value, "hybrid");
});

test("regresión: una señal fuerte + una derivada SÍ pueden establecer hybrid (al menos una debe ser fuerte)", () => {
  const result = resolve({ monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" }, secondaryMonetizationMechanism: { value: "goods_for_resale", provenance: "derived_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "hybrid", source: "signal" });
});

test("regresión: un agente inmobiliario que cobra comisión se representa (commission_or_referral)", () => {
  const result = resolve({ monetizationMechanism: { value: "commission_or_referral", provenance: "observed_fact" } });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "services", source: "signal" });
});

test("regresión: un signal de fuerza insuficiente (simulada como ausencia) nunca resuelve un campo material por sí solo", () => {
  // El piso de materialidad (`isMaterial`) es interno; se prueba indirectamente: sin ninguna señal
  // material presente, todo campo de señal única permanece unresolved (ya cubierto por "sin ninguna
  // señal" arriba). Aquí se confirma explícitamente para growthStage y entity, los dos campos que más
  // cambiaron en esta ronda de correcciones.
  const result = resolve({});
  assert.equal(result.context.growthStage.status, "unresolved");
  assert.equal(result.context.entity.status, "unresolved");
});

// ── §41: mutation tests A-L ──────────────────────────────────────────────────

test("mutación A: un hint de nicho nunca resuelve el archetype por sí solo", () => {
  const result = resolve({}, ["appointments"]);
  assert.equal(result.context.archetype.status, "unresolved");
});

test("mutación B: un nicho custom desconocido nunca cae en NicheGroup \"other\"", () => {
  const custom = toNicheId("some_unlisted_niche")!;
  const result = resolve({ declaredNicheId: { value: custom, provenance: "explicit_declaration" } });
  assert.notDeepEqual(result.context.nicheGroup, { status: "resolved", value: "other", source: "signal" });
});

test("mutación C: una sola señal de mecanismo nunca produce hybrid (ni BusinessModel ni Archetype)", () => {
  const business = resolve({ monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" } });
  assert.notEqual(business.context.businessModel.status === "resolved" && business.context.businessModel.value, "hybrid");
  const archetype = resolve({ deliveryMode: { value: "fixed_location_no_inventory", provenance: "observed_fact" } });
  assert.notEqual(archetype.context.archetype.status === "resolved" && archetype.context.archetype.value, "hybrid");
});

test("mutación D: la etapa legacy growing nunca produce GrowthStage V3 growing", () => {
  const signals = deriveSignalsFromLegacyContext({ stage: "growing", answers: {} });
  const result = resolve(signals);
  assert.notEqual(result.context.growthStage.status === "resolved" && result.context.growthStage.value, "growing");
});

test("mutación E: \"quiero crecer\" (regularidad regular, sin tendencia) nunca produce GrowthStage growing", () => {
  const result = resolve({ hasRealCustomers: { value: true, provenance: "derived_fact" }, operatingRegularity: { value: "regular", provenance: "derived_fact" } });
  assert.notEqual(result.context.growthStage.status === "resolved" && result.context.growthStage.value, "growing");
});

test("mutación F: señales de fricción en conflicto no se resuelven por orden — el resultado no cambia si se invierte el array", () => {
  const forward = resolve({ frictionSignals: [{ value: "visibility", provenance: "derived_fact" }, { value: "scale", provenance: "derived_fact" }] });
  const reversed = resolve({ frictionSignals: [{ value: "scale", provenance: "derived_fact" }, { value: "visibility", provenance: "derived_fact" }] });
  assert.deepEqual(forward.context.primaryFriction, reversed.context.primaryFriction);
  assert.equal(forward.context.primaryFriction.status, "unresolved");
});

test("mutación G: duplicar una señal no la vuelve independiente ni cambia la resolución", () => {
  const single = resolve({ deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" } });
  const duplicated = resolve({ deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" }, secondaryDeliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" } });
  assert.deepEqual(single.context.archetype, duplicated.context.archetype);
});

test("mutación H: local + B2B es representable, nunca imposible", () => {
  const result = resolve({ customerReach: { value: "local", provenance: "explicit_declaration" }, buyerType: { value: "b2b", provenance: "explicit_declaration" } });
  assert.equal(result.context.customerModel.reach.status, "resolved");
  assert.equal(result.context.customerModel.buyer.status, "resolved");
});

test("mutación I: todo campo resuelto tiene trace no vacío (supportingSignals y resolutionReason)", () => {
  const result = resolve({
    entityDeclared: { value: "business", provenance: "explicit_declaration" },
    monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" },
    deliveryMode: { value: "b2b_sales_pipeline", provenance: "observed_fact" },
    hasRealCustomers: { value: true, provenance: "derived_fact" },
    operatingRegularity: { value: "regular", provenance: "observed_fact" },
    demandTrend: { value: "increasing_observed", provenance: "observed_fact" },
    declaredGoal: { value: "measure", provenance: "explicit_declaration" },
  });
  for (const trace of allTraces(result)) {
    if (trace.status === "resolved") {
      assert.ok(trace.supportingSignals.length > 0, `${trace.field}: trace resuelto sin señales de soporte`);
      assert.ok(trace.resolutionReason.trim().length > 0, `${trace.field}: trace resuelto sin razón`);
    }
  }
});

test("mutación J: todo campo sin resolver tiene una reason válida y candidates presente", () => {
  const result = resolve({});
  for (const trace of allTraces(result)) {
    if (trace.status === "unresolved") {
      assert.ok(["not_asked", "declared_unknown", "ambiguous_legacy", "insufficient_evidence"].includes(trace.reason), `${trace.field}: reason inválida`);
      assert.ok(Array.isArray(trace.candidates), `${trace.field}: candidates ausente`);
    }
  }
});

// Nota (revisión de código independiente): esta prueba es principalmente documental — el resolver no
// tiene ningún camino de código que pudiera añadir `questionBankVersion`, así que no puede "atrapar" una
// fuga real; existe para dejar explícito el invariante y como red si esa forma cambiara en el futuro.
// La protección real contra activar QBV2 en runtime vive en `taxonomy.test.ts` (mutación H de 08B.0).
test("mutación K: el resolver nunca produce ni referencia QuestionBankVersion 2", () => {
  const result = resolve({ monetizationMechanism: { value: "time_or_project_work", provenance: "observed_fact" } });
  assert.ok(!("questionBankVersion" in result.context));
  assert.ok(!("questionBankVersion" in result.trace));
});

test("mutación L (gate): \"organization\"/\"startup\" ya no existen como OperationalArchetype y el resolver nunca los produce", () => {
  assert.ok(!(OPERATIONAL_ARCHETYPES as readonly string[]).includes("organization"));
  assert.ok(!(OPERATIONAL_ARCHETYPES as readonly string[]).includes("startup"));
  const project = resolve({ entityDeclared: { value: "project", provenance: "explicit_declaration" }, hasRealCustomers: { value: false, provenance: "derived_fact" } });
  assert.equal(project.context.archetype.status, "unresolved");
});
