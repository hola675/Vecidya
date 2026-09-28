import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BUSINESS_MODEL_REGISTRY,
  CURRENT_QUESTION_BANK_VERSION,
  CUSTOMER_BUYER_REGISTRY,
  CUSTOMER_REACH_REGISTRY,
  ENTITY_TYPE_REGISTRY,
  GROWTH_STAGE_REGISTRY,
  hasDuplicateIds,
  isCurrentPersistedVersions,
  isNicheGroup,
  LEGACY_STAGE_MAPPING,
  lookupNicheArchetypeHints,
  lookupNicheGroup,
  NICHE_GROUP_REGISTRY,
  NICHE_GROUPS,
  NICHE_REGISTRY,
  OPERATIONAL_ARCHETYPE_REGISTRY,
  PRIMARY_FRICTION_REGISTRY,
  PRIMARY_GOAL_REGISTRY,
  toNicheId,
  unresolved,
  type BusinessModel,
  type CustomerModel,
  type NicheGroup,
  type OperationalArchetype,
} from "../../../app/features/diagnostic/index.ts";

const ALL_REGISTRIES: Record<string, readonly { id: string; label: string; definition: string }[]> = {
  ENTITY_TYPE_REGISTRY,
  BUSINESS_MODEL_REGISTRY,
  OPERATIONAL_ARCHETYPE_REGISTRY,
  NICHE_GROUP_REGISTRY,
  GROWTH_STAGE_REGISTRY,
  CUSTOMER_REACH_REGISTRY,
  CUSTOMER_BUYER_REGISTRY,
  PRIMARY_GOAL_REGISTRY,
  PRIMARY_FRICTION_REGISTRY,
};

// ── §28: matriz de tests del registro ───────────────────────────────────────

test("taxonomía: cada registro tiene labels y definitions no vacíos, sin IDs duplicados", () => {
  for (const [name, registry] of Object.entries(ALL_REGISTRIES)) {
    assert.equal(hasDuplicateIds(registry), false, `${name} tiene un ID duplicado`);
    for (const entry of registry) {
      assert.ok(entry.label.trim().length > 0, `${name}: «${entry.id}» sin label`);
      assert.ok(entry.definition.trim().length > 0, `${name}: «${entry.id}» sin definition`);
    }
  }
});

test("taxonomía: NicheId valida formato y rechaza lo malformado", () => {
  assert.equal(toNicheId("dentist"), "dentist");
  for (const value of ["Dentist", "a", "1abc", "x".repeat(41), "dental clinic", null, undefined, 3]) {
    assert.equal(toNicheId(value), undefined, `«${value}» no debería validar como NicheId`);
  }
});

test("taxonomía: NICHE_GROUPS es cerrado y isNicheGroup lo respeta", () => {
  for (const group of NICHE_GROUPS) assert.equal(isNicheGroup(group), true);
  for (const value of ["healthcare", "", "OTHER", null, undefined]) assert.equal(isNicheGroup(value), false, `«${value}» no debería ser NicheGroup`);
});

test("taxonomía: el catálogo inicial de nichos no tiene IDs duplicados y cada uno pertenece a un NicheGroup real", () => {
  assert.equal(hasDuplicateIds(NICHE_REGISTRY), false, "hay un nicho duplicado en el catálogo");
  assert.ok(NICHE_REGISTRY.length >= 15 && NICHE_REGISTRY.length <= 25, `catálogo inicial fuera de rango (${NICHE_REGISTRY.length})`);
  for (const entry of NICHE_REGISTRY) {
    assert.equal(isNicheGroup(entry.group), true, `«${entry.id}» tiene un group inválido`);
    assert.ok(entry.archetypeHints.length >= 1, `«${entry.id}» necesita al menos un archetype hint`);
  }
});

test("taxonomía: el catálogo inicial cubre las familias exigidas por §29 (health/legal/finance/automotive/hospitality/retail/ecommerce/B2B/creator/nonprofit)", () => {
  const groups = new Set(NICHE_REGISTRY.map((entry) => entry.group));
  const required: NicheGroup[] = ["health_wellness", "legal", "financial_tax_insurance", "automotive", "food_hospitality", "retail", "ecommerce", "b2b_services", "creator", "nonprofit_community", "creative_media"];
  for (const group of required) assert.ok(groups.has(group), `ninguna entrada del catálogo cubre «${group}»`);
});

test("taxonomía: CustomerModel representa cada combinación de reach/buyer, incluida B2B local", () => {
  const localB2b: CustomerModel = { reach: { status: "resolved", value: "local", source: "answer" }, buyer: { status: "resolved", value: "b2b", source: "answer" } };
  assert.equal(localB2b.reach.value, "local");
  assert.equal(localB2b.buyer.value, "b2b");
  // Los dos ejes son independientes: uno puede resolverse sin que el otro lo esté.
  const partial: CustomerModel = { reach: { status: "resolved", value: "online", source: "answer" }, buyer: unresolved("not_asked") };
  assert.equal(partial.reach.status, "resolved");
  assert.equal(partial.buyer.status, "unresolved");
});

test("taxonomía: `hybrid` y `unresolved` son estados distintos, nunca intercambiables", () => {
  const hybridArchetype: BusinessModel = "hybrid";
  const genuinelyHybrid = { status: "resolved" as const, value: hybridArchetype, source: "answer" as const };
  const stillUnknown = unresolved<BusinessModel>("insufficient_evidence", ["products", "services"]);
  assert.equal(genuinelyHybrid.status, "resolved");
  assert.equal(stillUnknown.status, "unresolved");
  // `hybrid` nunca aparece como candidato de ambigüedad: es un HECHO declarado, no un cajón de incertidumbre (§18, mutación F).
  assert.ok(!stillUnknown.candidates.includes("hybrid" as BusinessModel), "hybrid no debe usarse como relleno de ambigüedad");
});

test("taxonomía: los mapeos legacy siguen siendo seguros (no se pierde la protección growing≠growing)", () => {
  assert.equal(LEGACY_STAGE_MAPPING.growing.status, "unresolved", "el `growing` legacy sigue sin mapear directamente al `growing` V3");
});

test("taxonomía: el NicheId de un nicho del catálogo sigue siendo una cadena plana tras serializar a JSON (la marca nominal es solo de compilación)", () => {
  const restored = JSON.parse(JSON.stringify(NICHE_REGISTRY)) as typeof NICHE_REGISTRY;
  assert.equal(typeof restored[0]?.id, "string");
  assert.equal(restored[0]?.id, NICHE_REGISTRY[0]?.id);
  // Un valor restaurado de JSON no lleva la marca `NicheId` en tiempo de compilación: para volver a usarse
  // como NicheId debe revalidarse con `toNicheId`, nunca asumirse válido solo por haber salido de este registro.
  assert.equal(toNicheId(restored[0]!.id), restored[0]!.id);
});

// ── §29: 20 casos de dominio (solo taxonomía; el resolver llega en 08B.1) ───

const DOMAIN_CASES: { name: string; nicheId: string; expectedGroup: NicheGroup; expectedHintIncludes: OperationalArchetype }[] = [
  { name: "dentista", nicheId: "dentist", expectedGroup: "health_wellness", expectedHintIncludes: "appointments" },
  { name: "medicina general", nicheId: "primary_care", expectedGroup: "health_wellness", expectedHintIncludes: "appointments" },
  { name: "psiquiatría", nicheId: "psychiatry", expectedGroup: "health_wellness", expectedHintIncludes: "appointments" },
  { name: "medspa", nicheId: "medspa", expectedGroup: "health_wellness", expectedHintIncludes: "appointments" },
  { name: "salón de belleza", nicheId: "hair_salon", expectedGroup: "beauty_personal_care", expectedHintIncludes: "appointments" },
  { name: "barbería", nicheId: "barbershop", expectedGroup: "beauty_personal_care", expectedHintIncludes: "local" },
  { name: "bufete de abogados", nicheId: "law_firm", expectedGroup: "legal", expectedHintIncludes: "professional" },
  { name: "preparación de impuestos", nicheId: "tax_preparation", expectedGroup: "financial_tax_insurance", expectedHintIncludes: "professional" },
  { name: "agencia de seguros", nicheId: "insurance_agency", expectedGroup: "financial_tax_insurance", expectedHintIncludes: "b2b" },
  { name: "consultoría", nicheId: "consulting", expectedGroup: "professional_services", expectedHintIncludes: "professional" },
  { name: "climatización", nicheId: "hvac", expectedGroup: "home_services", expectedHintIncludes: "local_service" },
  { name: "plomería", nicheId: "plumbing", expectedGroup: "home_services", expectedHintIncludes: "local_service" },
  { name: "taller mecánico", nicheId: "auto_repair", expectedGroup: "automotive", expectedHintIncludes: "local" },
  { name: "agente inmobiliario", nicheId: "real_estate_agent", expectedGroup: "real_estate", expectedHintIncludes: "professional" },
  { name: "restaurante", nicheId: "restaurant", expectedGroup: "food_hospitality", expectedHintIncludes: "hospitality" },
  { name: "cafetería", nicheId: "cafe", expectedGroup: "food_hospitality", expectedHintIncludes: "hospitality" },
  { name: "tienda de ropa", nicheId: "clothing_store", expectedGroup: "retail", expectedHintIncludes: "retail" },
  { name: "tienda en línea", nicheId: "online_store", expectedGroup: "ecommerce", expectedHintIncludes: "ecommerce" },
  { name: "coach", nicheId: "coach", expectedGroup: "education_coaching", expectedHintIncludes: "professional" },
  { name: "creador de contenido", nicheId: "content_creator", expectedGroup: "creator", expectedHintIncludes: "creator" },
];

for (const { name, nicheId, expectedGroup, expectedHintIncludes } of DOMAIN_CASES) {
  test(`taxonomía: caso de dominio — ${name}`, () => {
    const id = toNicheId(nicheId);
    assert.ok(id, `«${nicheId}» debería ser un NicheId válido`);
    assert.equal(lookupNicheGroup(id!), expectedGroup);
    const hints = lookupNicheArchetypeHints(id!);
    assert.ok(hints?.includes(expectedHintIncludes), `${name}: se esperaba el hint «${expectedHintIncludes}»`);
  });
}

// ── §30: edge cases ──────────────────────────────────────────────────────────

test("taxonomía edge case: un nicho custom válido en formato pero fuera del catálogo no tiene grupo ni hints inventados", () => {
  const custom = toNicheId("underwater_basket_weaving");
  assert.ok(custom);
  assert.equal(lookupNicheGroup(custom!), undefined, "un nicho fuera de catálogo no debe recibir un grupo adivinado");
  assert.equal(lookupNicheArchetypeHints(custom!), undefined);
});

test("taxonomía edge case: un NicheId malformado nunca llega a buscarse", () => {
  assert.equal(toNicheId("Not A Valid Niche!"), undefined);
});

test("taxonomía edge case: marketing_agency (B2B) y software_startup (startup+B2B) están representados sin colapsar en un solo hint", () => {
  const agency = toNicheId("marketing_agency")!;
  const startup = toNicheId("software_startup")!;
  assert.deepEqual(lookupNicheArchetypeHints(agency), ["b2b"]);
  assert.deepEqual(lookupNicheArchetypeHints(startup), ["startup", "b2b"]);
});

test("taxonomía edge case: nonprofit_org no asume archetype comercial", () => {
  const org = toNicheId("nonprofit_org")!;
  assert.deepEqual(lookupNicheArchetypeHints(org), ["organization"]);
  assert.equal(lookupNicheGroup(org), "nonprofit_community");
});

// ── §40: mutation tests A–H ──────────────────────────────────────────────────

test("mutación A: un NicheGroup inexistente es rechazado por isNicheGroup", () => {
  assert.equal(isNicheGroup("healthcare_and_wellness"), false);
});

test("mutación B: un NicheId malformado nunca valida", () => {
  for (const malformed of ["", "A", "1niche", "niche id", "niche-id", "x".repeat(41)]) {
    assert.equal(toNicheId(malformed), undefined, `«${malformed}» no debería validar`);
  }
});

test("mutación C: `hasDuplicateIds` (la misma función que valida los registros reales) detecta un ID duplicado", () => {
  assert.equal(hasDuplicateIds([{ id: "a" }, { id: "b" }]), false, "sin duplicados no debe reportar duplicado");
  assert.equal(hasDuplicateIds([{ id: "a" }, { id: "a" }]), true, "un ID repetido debe detectarse");
  // Los registros reales (incluido el catálogo de nichos) ya pasan esta misma función en las pruebas de arriba.
});

test("mutación D: la etapa legacy `growing` nunca se mapea directamente al `growing` V3", () => {
  const mapping = LEGACY_STAGE_MAPPING.growing;
  assert.equal(mapping.status, "unresolved");
  assert.ok(mapping.status === "unresolved" && mapping.reason === "ambiguous_legacy");
});

test("mutación E: un nicho desconocido nunca se convierte automáticamente en `other`", () => {
  const unknown = toNicheId("some_unlisted_niche")!;
  const group = lookupNicheGroup(unknown);
  assert.notEqual(group, "other", "un nicho fuera de catálogo no debe caer en `other` por defecto");
  assert.equal(group, undefined);
});

test("mutación F: `hybrid` nunca aparece como candidato de una resolución ambigua en los registros de dominio", () => {
  const businessModelHybridCandidates = BUSINESS_MODEL_REGISTRY.filter((entry) => entry.id === "hybrid");
  assert.equal(businessModelHybridCandidates.length, 1, "hybrid debe existir como UN valor resuelto, no como comodín");
  const archetypeHybridCandidates = OPERATIONAL_ARCHETYPE_REGISTRY.filter((entry) => entry.id === "hybrid");
  assert.equal(archetypeHybridCandidates.length, 1);
  for (const entry of NICHE_REGISTRY) assert.ok(!entry.archetypeHints.includes("hybrid"), `${entry.id}: un hint de nicho no debe apuntar a "hybrid" (sería adivinar ambigüedad, no un hecho editorial)`);
});

test("mutación G: CustomerModel puede representar un negocio B2B local sin forzar exclusividad", () => {
  const model: CustomerModel = { reach: { status: "resolved", value: "local", source: "answer" }, buyer: { status: "resolved", value: "b2b", source: "answer" } };
  assert.equal(model.reach.value, "local");
  assert.equal(model.buyer.value, "b2b");
});

test("mutación H: QuestionBankVersion 2 está reservada pero no activa en el runtime actual", () => {
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1, "la versión vigente del banco debe seguir en 1 en DIAG-V3-08B.0");
  assert.equal(isCurrentPersistedVersions({ diagnosticVersion: "2.0", questionBankVersion: 2, routingVersion: 1, scoringVersion: 1, resultSchemaVersion: 1 }), false, "un valor persistido con questionBankVersion 2 no debe aceptarse como vigente todavía");
});
