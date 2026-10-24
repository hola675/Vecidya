import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_MINIWEB_TEMPLATE_KEY,
  MINIWEB_MODULE_REGISTRY,
  MINIWEB_TEMPLATE_REGISTRY,
  buildVirtualMiniWebConfiguration,
  buildSafeMiniWebConfiguration,
  ensureAvailableMiniWebModules,
  parseMiniWebConfigurationJson,
  serializeMiniWebConfiguration,
  sortMiniWebModules,
  validateMiniWebDraft,
} from "../../../app/features/miniweb/registry.ts";

test("el registro declara las cuatro familias y solo ofrece la plantilla compatible", () => {
  assert.deepEqual(
    [...new Set(Object.values(MINIWEB_TEMPLATE_REGISTRY).map((template) => template.family))].sort(),
    ["catalog", "gastronomy", "professional", "services"],
  );
  assert.equal(MINIWEB_TEMPLATE_REGISTRY[DEFAULT_MINIWEB_TEMPLATE_KEY].availability, "available");
  assert.equal(
    Object.values(MINIWEB_TEMPLATE_REGISTRY).filter((template) => template.availability === "available").length,
    1,
  );
});

test("el registro limita disponibilidad a módulos derivables de los datos actuales", () => {
  const available = Object.values(MINIWEB_MODULE_REGISTRY)
    .filter((module) => module.availability === "available")
    .map((module) => module.type)
    .sort();

  assert.deepEqual(available, ["about", "contact", "faq", "gallery", "hero", "hours", "location", "products", "services"]);
  assert.equal(MINIWEB_MODULE_REGISTRY.articles.availability, "planned");
  assert.equal(MINIWEB_MODULE_REGISTRY.team.availability, "planned");
});

test("la configuración rechaza plantilla y módulos no disponibles o no registrados", () => {
  const base = {
    templateKey: DEFAULT_MINIWEB_TEMPLATE_KEY,
    templateVersion: 1,
    layoutVariant: "standard",
    modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }],
  };

  assert.throws(() => validateMiniWebDraft({ ...base, templateKey: "arbitrary" }), /plantilla/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [{ ...base.modules[0], type: "services" }] }), /módulo/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [{ ...base.modules[0], type: "injected" }] }), /módulo/i);
});

test("la configuración valida módulos requeridos, duplicados y settings no admitidos", () => {
  const base = {
    templateKey: DEFAULT_MINIWEB_TEMPLATE_KEY,
    templateVersion: 1,
    layoutVariant: "standard",
    modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }],
  };

  assert.throws(() => validateMiniWebDraft({ ...base, modules: [{ ...base.modules[0], enabled: false }] }), /obligatorio/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [] }), /hero.*obligatorio/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [
    { ...base.modules[0], sortOrder: 1 },
    { type: "about", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
  ] }), /hero.*primero/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [base.modules[0], base.modules[0]] }), /duplicados/i);
  assert.throws(() => validateMiniWebDraft({ ...base, modules: [{ ...base.modules[0], settings: { html: "<b>x</b>" } }] }), /configuración adicional/i);
});

test("sortMiniWebModules produces deterministic ordering for equal positions", () => {
  const sorted = sortMiniWebModules([
    { type: "hours", sortOrder: 4 },
    { type: "contact", sortOrder: 4 },
    { type: "about", sortOrder: 2 },
  ]);

  assert.deepEqual(sorted.map((module) => module.type), ["about", "contact", "hours"]);
});

test("el perfil legacy obtiene configuración virtual derivada de datos y sin filas persistidas", () => {
  const config = buildVirtualMiniWebConfiguration({
    displayName: "Taller Local",
    shortDescription: "Atención cercana.",
    description: null,
    phone: null,
    publicEmail: null,
    websiteUrl: null,
    whatsapp: "+573001112233",
    instagramUrl: null,
    facebookUrl: null,
    linkedinUrl: null,
    category: "Servicios",
    city: "Bogotá",
    country: "Colombia",
    serviceMode: null,
    serviceArea: null,
  }, []);

  assert.equal(config.templateKey, DEFAULT_MINIWEB_TEMPLATE_KEY);
  assert.deepEqual(config.modules.map(({ type }) => type), ["hero", "about", "contact", "location", "hours", "services", "gallery", "products", "faq"]);
  assert.deepEqual(
    Object.fromEntries(config.modules.map(({ type, enabled }) => [type, enabled])),
    { hero: true, about: false, contact: true, location: true, hours: false, services: false, gallery: false, products: false, faq: false },
  );
});

test("el default virtual no activa contacto si solo hay canales públicos inválidos", () => {
  const config = buildVirtualMiniWebConfiguration({
    displayName: "Negocio",
    shortDescription: null,
    description: null,
    phone: "not-a-phone",
    publicEmail: "invalid-email",
    websiteUrl: "javascript:alert(1)",
    whatsapp: null,
    instagramUrl: "data:text/html,bad",
    facebookUrl: null,
    linkedinUrl: null,
    category: null,
    city: null,
    country: null,
    serviceMode: null,
    serviceArea: null,
  }, []);

  assert.equal(config.modules.find((module) => module.type === "contact")?.enabled, false);
});

test("el snapshot publicado solo serializa contratos válidos y falla cerrado si está alterado", () => {
  const config = {
    templateKey: DEFAULT_MINIWEB_TEMPLATE_KEY,
    templateVersion: 1,
    layoutVariant: "standard",
    modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }],
  };
  const snapshot = serializeMiniWebConfiguration(config);

  assert.deepEqual(parseMiniWebConfigurationJson(snapshot), {
    version: 1,
    templateKey: DEFAULT_MINIWEB_TEMPLATE_KEY,
    templateVersion: 1,
    layoutVariant: "standard",
    modules: ensureAvailableMiniWebModules(validateMiniWebDraft(config)).modules,
  });
  assert.equal(parseMiniWebConfigurationJson('{"templateKey":"arbitrary","modules":[]}'), null);
  assert.equal(parseMiniWebConfigurationJson("not-json"), null);
});

test("el fallback de un snapshot publicado inválido conserva solo hero requerido", () => {
  const fallback = buildSafeMiniWebConfiguration();

  assert.equal(fallback.templateKey, DEFAULT_MINIWEB_TEMPLATE_KEY);
  assert.deepEqual(fallback.modules.map((module) => module.type), ["hero"]);
  assert.equal(fallback.modules[0]?.enabled, true);
});
