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
