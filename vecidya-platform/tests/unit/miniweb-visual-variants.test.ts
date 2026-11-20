import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  getMiniWebVisualVariant,
  isMiniWebVisualTierSufficient,
  MINIWEB_VISUAL_VARIANT_KEYS,
  MINIWEB_VISUAL_VARIANTS,
} from "../../app/features/miniweb/visual-variants";

test("V2A: tres variantes con composiciones diferentes", () => {
  assert.deepEqual(MINIWEB_VISUAL_VARIANT_KEYS, ["base", "pro", "premium"]);
  assert.equal(MINIWEB_VISUAL_VARIANTS.base.minimumTier, "cuadra");
  assert.equal(MINIWEB_VISUAL_VARIANTS.pro.minimumTier, "barrio");
  assert.equal(MINIWEB_VISUAL_VARIANTS.premium.minimumTier, "ciudad");
  assert.equal(new Set(MINIWEB_VISUAL_VARIANT_KEYS.map((key) => MINIWEB_VISUAL_VARIANTS[key].composition.hero)).size, 3);
});

test("V2A: claves desconocidas y heredadas no se aceptan", () => {
  assert.equal(getMiniWebVisualVariant("base")?.key, "base");
  assert.equal(getMiniWebVisualVariant("standard"), null);
  assert.equal(getMiniWebVisualVariant("__proto__"), null);
  assert.equal(getMiniWebVisualVariant("constructor"), null);
});

test("V2A: comparación de niveles visuales", () => {
  assert.equal(isMiniWebVisualTierSufficient("cuadra", "cuadra"), true);
  assert.equal(isMiniWebVisualTierSufficient("cuadra", "barrio"), false);
  assert.equal(isMiniWebVisualTierSufficient("barrio", "ciudad"), false);
  assert.equal(isMiniWebVisualTierSufficient("ciudad", "barrio"), true);
  assert.equal(isMiniWebVisualTierSufficient("ciudad", "cuadra"), true);
});

test("R1.9: editor MiniWeb usa superficies sólidas sin alterar variantes, permisos o vista previa", () => {
  const editor = readFileSync(new URL("../../app/routes/miniweb-v2-editor.tsx", import.meta.url), "utf8");
  assert.equal((editor.match(/<Card surface=\{editorSurface\}>/g) ?? []).length, 7);
  assert.match(editor, /<Card key=\{section\.id\} surface=\{editorSurface\}>/);
  assert.match(editor, /isVisualFeatureEnabled\("miniWebEditorSolid"\)/);
  assert.match(editor, /<Card className="miniweb-v2-editor__guides">/);
  assert.match(editor, /requireOrganizationPermission\(env, request, organization\.id, "business-profile:read"\)/);
  assert.match(editor, /disabled=\{!data\.canEdit/);
  assert.match(editor, /<MiniWebV2Renderer/);
  assert.match(editor, /<MiniWebV2DesignControls value=\{createDesign\}/);
  assert.match(editor, /<MiniWebV2DesignControls value=\{document\.design/);
  assert.match(editor, /expectedRevision: revision/);
});
