import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_MINIWEB_TEMPLATE_KEY,
  type MiniWebConfiguration,
  type MiniWebProfileSource,
} from "../../../app/features/miniweb/registry.ts";
import {
  getRenderableMiniWebModules,
  hasMiniWebModuleContent,
} from "../../../app/features/miniweb/render.ts";

const profile: MiniWebProfileSource = {
  displayName: "Negocio",
  shortDescription: "Resumen público.",
  description: "Descripción pública.",
  phone: "+573001112233",
  publicEmail: "contacto@example.com",
  websiteUrl: null,
  whatsapp: null,
  instagramUrl: null,
  facebookUrl: null,
  linkedinUrl: null,
  category: "Servicios",
  city: "Bogotá",
  country: "Colombia",
  serviceMode: "remote",
  serviceArea: "Colombia",
};

function configuration(overrides: Partial<MiniWebConfiguration> = {}): MiniWebConfiguration {
  return {
    version: 1,
    templateKey: DEFAULT_MINIWEB_TEMPLATE_KEY,
    templateVersion: 1,
    layoutVariant: "standard",
    modules: [
      { type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
      { type: "about", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null },
      { type: "contact", moduleVersion: 1, enabled: true, sortOrder: 2, layoutVariant: "standard", settings: null },
      { type: "location", moduleVersion: 1, enabled: true, sortOrder: 3, layoutVariant: "standard", settings: null },
      { type: "hours", moduleVersion: 1, enabled: true, sortOrder: 4, layoutVariant: "standard", settings: null },
    ],
    ...overrides,
  };
}

test("los módulos desactivados o sin contenido no llegan a la lista pública", () => {
  const result = getRenderableMiniWebModules(
    configuration({ modules: configuration().modules.map((module) => ({ ...module, enabled: module.type !== "contact" && module.type !== "hours" })) }),
    { ...profile, description: null, shortDescription: null, serviceArea: null, serviceMode: null, category: null, city: null, country: null },
    [],
  );

  assert.deepEqual(result.map((module) => module.type), ["hero"]);
});

test("contacto solo es contenido útil cuando existe al menos un canal público válido", () => {
  const config = configuration({ modules: [
    { type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
    { type: "contact", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null },
  ] });

  assert.deepEqual(
    getRenderableMiniWebModules(config, { ...profile, phone: "not-a-phone", publicEmail: "bad", websiteUrl: "javascript:alert(1)", whatsapp: null, instagramUrl: null, facebookUrl: null, linkedinUrl: null }, []).map((module) => module.type),
    ["hero"],
  );
});

test("las horas solo se presentan si hay una entrada de horario", () => {
  const config = configuration({ modules: [
    { type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
    { type: "hours", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null },
  ] });

  assert.deepEqual(getRenderableMiniWebModules(config, profile, []).map((module) => module.type), ["hero"]);
  assert.deepEqual(getRenderableMiniWebModules(config, profile, [{ dayOfWeek: 1, isClosed: true, opensAt: null, closesAt: null }]).map((module) => module.type), ["hero", "hours"]);
});

test("el resumen breve del hero no crea una sección Acerca duplicada sin descripción", () => {
  const config = configuration({ modules: [
    { type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
    { type: "about", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null },
  ] });

  assert.deepEqual(getRenderableMiniWebModules(config, { ...profile, description: null }, []).map((module) => module.type), ["hero"]);
});

test("la guía de secciones y el renderizador rechazan contenido activo pero incompleto", () => {
  const blankOffering = { kind: "service" as const, isActive: true, title: "", description: "Servicio", priceLabel: null, sortOrder: 0 };
  const completeOffering = { ...blankOffering, title: "Consulta" };
  const blankFaq = { question: "¿Dónde?", answer: "   ", isActive: true, sortOrder: 0 };
  const completeFaq = { ...blankFaq, answer: "En nuestra oficina." };
  assert.equal(hasMiniWebModuleContent("services", profile, [], [blankOffering], [], []), false);
  assert.equal(hasMiniWebModuleContent("services", profile, [], [completeOffering], [], []), true);
  assert.equal(hasMiniWebModuleContent("faq", profile, [], [], [blankFaq], []), false);
  assert.equal(hasMiniWebModuleContent("faq", profile, [], [], [completeFaq], []), true);
  const config = configuration({ modules: [
    { type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null },
    { type: "services", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null },
    { type: "faq", moduleVersion: 1, enabled: true, sortOrder: 2, layoutVariant: "standard", settings: null },
  ] });
  assert.deepEqual(getRenderableMiniWebModules(config, profile, [], [blankOffering], [blankFaq], []).map((module) => module.type), ["hero"]);
  assert.deepEqual(getRenderableMiniWebModules(config, profile, [], [completeOffering], [completeFaq], []).map((module) => module.type), ["hero", "services", "faq"]);
});
