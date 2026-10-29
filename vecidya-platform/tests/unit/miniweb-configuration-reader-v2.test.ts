import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMiniWebReadConfigurationJson } from "../../app/features/miniweb/configuration-reader-v2";

const hero = { instanceId: "hero-1", type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null };
const gallery = { instanceId: "gallery-1", type: "gallery", moduleVersion: 1, enabled: true, sortOrder: 1, layoutVariant: "standard", settings: null };
const v2 = { version: 2, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", visualVariant: "base", modules: [hero, gallery] };
const parse = (value: unknown) => parseMiniWebReadConfigurationJson(JSON.stringify(value));

test("V2B: lee V1 con parser existente sin cambiar el contrato", () => {
  const legacy = { version: 1, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] };
  assert.equal(parse(legacy)?.version, 1);
});

test("V2B: admite dos galerías con instanceId distinto", () => {
  const result = parse({ ...v2, modules: [hero, gallery, { ...gallery, instanceId: "gallery-2", sortOrder: 2 }] });
  assert.equal(result?.version, 2);
  assert.equal(result?.modules.length, 3);
});

test("V2B: rechaza ids duplicados, hero inválido y campos extra", () => {
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, instanceId: "hero-1" }] }), null);
  assert.equal(parse({ ...v2, modules: [{ ...hero, enabled: false }, gallery] }), null);
  assert.equal(parse({ ...v2, unexpected: true }), null);
  assert.equal(parse({ ...v2, visualVariant: "unknown" }), null);
});

test("V2B: rechaza entrada no JSON y módulos excesivos", () => {
  assert.equal(parseMiniWebReadConfigurationJson("{"), null);
  assert.equal(parse({ ...v2, modules: [hero, ...Array.from({ length: 32 }, (_, i) => ({ ...gallery, instanceId: `gallery-${i}`, sortOrder: i + 1 }))] }), null);
});

test("V2B: no acepta módulos planned ni tipos fuera del registro", () => {
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, type: "articles" }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, type: "team" }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, type: "__proto__" }] }), null);
});

test("V2B: ordena instancias por sortOrder sin mutar ni perder identidad", () => {
  const second = { ...gallery, instanceId: "gallery-2", sortOrder: 2 };
  const result = parse({ ...v2, modules: [second, hero, gallery] });
  assert.equal(result?.version, 2);
  assert.deepEqual(result?.modules.map((module) => module.instanceId), ["hero-1", "gallery-1", "gallery-2"]);
});

test("V2B: rechaza órdenes duplicados, negativos y fuera de rango", () => {
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, sortOrder: 0 }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, sortOrder: -1 }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, sortOrder: 2 }] }), null);
});

test("V2B: rechaza ids malformados, hero repetido y settings no soportados", () => {
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, instanceId: "Galeria Uno" }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...hero, instanceId: "hero-2", sortOrder: 1 }] }), null);
  assert.equal(parse({ ...v2, modules: [hero, { ...gallery, settings: {} }] }), null);
});

test("V2B: mantiene el límite de bytes V1 y rechaza snapshots V2 enormes", () => {
  const legacy = { version: 1, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] };
  assert.equal(parseMiniWebReadConfigurationJson(JSON.stringify(legacy) + " ".repeat(4097)), null);
  assert.equal(parseMiniWebReadConfigurationJson(JSON.stringify(v2) + " ".repeat(16385)), null);
});
